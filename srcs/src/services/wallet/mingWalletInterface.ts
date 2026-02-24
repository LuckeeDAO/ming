/**
 * Ming平台钱包接口封装
 * 
 * 提供与钱包通信的统一接口，用于NFT铸造和定时任务管理
 * 
 * 功能：
 * - NFT铸造接口调用
 * - 定时任务创建、查询、取消
 * - 错误处理和重试机制
 * 
 * 通信方式：
 * - 使用 window.postMessage 进行跨窗口通信
 * - 或使用自定义事件机制
 * 
 * @module services/wallet/mingWalletInterface
 */

import {
  MintNFTRequest,
  MintNFTResponse,
  CreateScheduledTaskRequest,
  CreateScheduledTaskResponse,
  GetScheduledTaskResponse,
  GetScheduledTasksByWalletRequest,
  GetScheduledTasksByWalletResponse,
  CancelScheduledTaskRequest,
  CancelScheduledTaskResponse,
  ReleaseConnectionRequest,
  ReleaseConnectionResponse,
  WalletErrorCode,
  WALLET_PROTOCOL_VERSION,
} from '../../types/wallet';
import { isValidContractAddress, isValidTokenURI } from '../../utils/validation';

/**
 * 钱包接口服务类
 */
class MingWalletInterface {
  private readonly MESSAGE_TYPE_PREFIX = 'MING_WALLET_';
  private readonly PROTOCOL_VERSION = WALLET_PROTOCOL_VERSION;
  private readonly REQUEST_TIMEOUT = 300000; // 5分钟超时
  private readonly targetOrigin: string =
    import.meta.env.VITE_WALLET_TARGET_ORIGIN || window.location.origin;
  private readonly allowedOrigins: Set<string> = (() => {
    const raw = import.meta.env.VITE_WALLET_ALLOWED_ORIGINS;
    const configured = raw
      ? raw
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    // 默认允许同源与目标源，兼容本地联调
    return new Set([window.location.origin, this.targetOrigin, ...configured]);
  })();

  private readonly CONSENSUS_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;

  private withProtocolVersion<T extends object>(payload: T): T & { protocolVersion: string } {
    return {
      ...payload,
      protocolVersion: this.PROTOCOL_VERSION,
    };
  }

  /**
   * 发送消息到钱包并等待响应
   * 
   * @param type - 消息类型
   * @param payload - 消息负载
   * @returns Promise响应
   */
  private async sendMessage<T>(
    type: string,
    payload: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const requestType = `${this.MESSAGE_TYPE_PREFIX}${type}_REQUEST`;
      const responseType = `${this.MESSAGE_TYPE_PREFIX}${type}_RESPONSE`;

      // 设置超时
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('Wallet request timeout'));
      }, this.REQUEST_TIMEOUT);

      // 监听响应
      const handler = (event: MessageEvent) => {
        const data = event.data as {
          type?: string;
          messageId?: string;
          payload?: { success?: boolean; error?: { message?: string } };
        } | null;

        if (!data || typeof data !== 'object') {
          return;
        }
        if (event.source !== window) {
          return;
        }
        if (!this.allowedOrigins.has(event.origin)) {
          return;
        }
        if (
          data.type === responseType &&
          data.messageId === messageId
        ) {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          
          if (data.payload?.success) {
            resolve(data.payload as T);
          } else {
            reject(new Error(data.payload?.error?.message || 'Wallet request failed'));
          }
        }
      };

      window.addEventListener('message', handler);

      // 发送请求
      window.postMessage(
        {
          type: requestType,
          messageId,
          payload,
        },
        this.targetOrigin
      );
    });
  }

  /**
   * 铸造NFT
   * 
   * @param request - 铸造请求参数
   * @returns 铸造结果
   */
  async mintNFT(request: MintNFTRequest): Promise<MintNFTResponse> {
    try {
      // 验证请求参数
      this.validateMintRequest(request);

      // 发送请求到钱包
      const response = await this.sendMessage<MintNFTResponse>(
        'MINT_NFT',
        this.withProtocolVersion(request)
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: {
          code: this.mapErrorCode(message),
          message,
        },
      };
    }
  }

  /**
   * 创建定时任务
   * 
   * @param request - 创建定时任务请求参数
   * @returns 创建结果
   */
  async createScheduledTask(
    request: CreateScheduledTaskRequest
  ): Promise<CreateScheduledTaskResponse> {
    try {
      // 验证请求参数
      this.validateScheduledTaskRequest(request);

      // 发送请求到钱包
      const response = await this.sendMessage<CreateScheduledTaskResponse>(
        'CREATE_SCHEDULED_TASK',
        this.withProtocolVersion(request)
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: {
          code: this.mapErrorCode(message),
          message,
        },
      };
    }
  }

  /**
   * 查询定时任务
   * 
   * @param taskId - 任务ID
   * @returns 任务信息
   */
  async getScheduledTask(taskId: string): Promise<GetScheduledTaskResponse> {
    try {
      if (!taskId) {
        throw new Error('Task ID is required');
      }

      const response = await this.sendMessage<GetScheduledTaskResponse>(
        'GET_SCHEDULED_TASK',
        this.withProtocolVersion({ taskId })
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: {
          code: this.mapErrorCode(message),
          message,
        },
      };
    }
  }

  /**
   * 根据钱包地址查询定时任务列表
   *
   * @param request - 查询请求参数
   * @returns 任务列表
   */
  async getScheduledTasksByWallet(
    request: GetScheduledTasksByWalletRequest
  ): Promise<GetScheduledTasksByWalletResponse> {
    try {
      this.validateProtocolVersion(request.protocolVersion);
      if (!request.walletAddress) {
        throw new Error('Wallet address is required');
      }

      const response = await this.sendMessage<GetScheduledTasksByWalletResponse>(
        'GET_SCHEDULED_TASKS_BY_WALLET',
        this.withProtocolVersion(request)
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: {
          code: this.mapErrorCode(message),
          message,
        },
      };
    }
  }

  /**
   * 取消定时任务
   * 
   * @param request - 取消任务请求参数
   * @returns 取消结果
   */
  async cancelScheduledTask(
    request: CancelScheduledTaskRequest
  ): Promise<CancelScheduledTaskResponse> {
    try {
      this.validateProtocolVersion(request.protocolVersion);
      if (!request.taskId) {
        throw new Error('Task ID is required');
      }

      const response = await this.sendMessage<CancelScheduledTaskResponse>(
        'CANCEL_SCHEDULED_TASK',
        this.withProtocolVersion(request)
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: {
          code: this.mapErrorCode(message),
          message,
        },
      };
    }
  }

  /**
   * 封局释放连接NFT
   *
   * @param request - 封局释放请求参数
   * @returns 释放结果
   */
  async releaseConnectionNFT(
    request: ReleaseConnectionRequest
  ): Promise<ReleaseConnectionResponse> {
    try {
      this.validateReleaseRequest(request);

      const response = await this.sendMessage<ReleaseConnectionResponse>(
        'RELEASE_CONNECTION_NFT',
        this.withProtocolVersion(request)
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: {
          code: this.mapErrorCode(message),
          message,
        },
      };
    }
  }

  /**
   * 验证铸造请求参数
   */
  private validateMintRequest(request: MintNFTRequest): void {
    this.validateProtocolVersion(request.protocolVersion);
    if (!request.ipfs) {
      throw new Error('IPFS data is required');
    }
    if (!request.ipfs.imageHash || !request.ipfs.metadataHash) {
      throw new Error('IPFS hash is required');
    }
    this.validateConsensusHash(request.consensusHash);
    if (!request.contract || !request.contract.address) {
      throw new Error('Contract address is required');
    }
    if (!request.params || !request.params.to) {
      throw new Error('Recipient address is required');
    }
    this.validateTiming(request.timing, 'immediate');

    const chainFamily = request.contract.chainFamily || 'evm';
    this.validateChainContext(request.contract, chainFamily);
    if (!isValidContractAddress(request.contract.address, chainFamily)) {
      throw new Error(`Invalid contract address for chain family: ${chainFamily}`);
    }
    if (!isValidContractAddress(request.params.to, chainFamily)) {
      throw new Error(`Invalid recipient address for chain family: ${chainFamily}`);
    }
  }

  /**
   * 验证定时任务请求参数
   */
  private validateScheduledTaskRequest(
    request: CreateScheduledTaskRequest
  ): void {
    this.validateProtocolVersion(request.protocolVersion);
    if (!request.scheduledTime) {
      throw new Error('Scheduled time is required');
    }
    
    // 验证时间是否为未来时间
    const scheduledTime = new Date(request.scheduledTime);
    const now = new Date();
    if (scheduledTime <= now) {
      throw new Error('Scheduled time must be in the future');
    }
    this.validateTiming(request.timing, 'scheduled');
    const timingExecuteAt = new Date(request.timing.executeAt);
    if (Math.abs(timingExecuteAt.getTime() - scheduledTime.getTime()) > 1000) {
      throw new Error('timing.executeAt must equal scheduledTime');
    }

    if (!request.ipfs) {
      throw new Error('IPFS data is required');
    }
    if (!request.ipfs.imageHash || !request.ipfs.metadataHash) {
      throw new Error('IPFS hash is required');
    }
    this.validateConsensusHash(request.consensusHash);
    if (!request.contract || !request.contract.address) {
      throw new Error('Contract address is required');
    }

    const chainFamily = request.contract.chainFamily || 'evm';
    this.validateChainContext(request.contract, chainFamily);
    if (!isValidContractAddress(request.contract.address, chainFamily)) {
      throw new Error(`Invalid contract address for chain family: ${chainFamily}`);
    }
    if (!request.params || !request.params.to) {
      throw new Error('Recipient address is required');
    }
    if (!isValidContractAddress(request.params.to, chainFamily)) {
      throw new Error(`Invalid recipient address for chain family: ${chainFamily}`);
    }
  }

  /**
   * 验证封局释放请求参数
   */
  private validateReleaseRequest(request: ReleaseConnectionRequest): void {
    this.validateProtocolVersion(request.protocolVersion);
    if (!request.contract || !request.contract.address) {
      throw new Error('Contract address is required');
    }
    if (!request.params || !request.params.tokenId) {
      throw new Error('Token ID is required');
    }
    if (!request.params.releasedTokenURI) {
      throw new Error('Released token URI is required');
    }
    if (!isValidTokenURI(request.params.releasedTokenURI)) {
      throw new Error('Invalid token URI protocol: only ipfs:// or https:// is allowed');
    }

    const chainFamily = request.contract.chainFamily || 'evm';
    this.validateChainContext(request.contract, chainFamily);
    if (!isValidContractAddress(request.contract.address, chainFamily)) {
      throw new Error(`Invalid contract address for chain family: ${chainFamily}`);
    }
  }

  private validateConsensusHash(consensusHash: string): void {
    if (!consensusHash) {
      throw new Error('Consensus hash is required');
    }
    if (!this.CONSENSUS_HASH_PATTERN.test(consensusHash)) {
      throw new Error('Consensus hash must be 0x-prefixed 32-byte hex string');
    }
  }

  private validateProtocolVersion(protocolVersion: string): void {
    if (!protocolVersion) {
      throw new Error('protocolVersion is required');
    }
    if (protocolVersion !== this.PROTOCOL_VERSION) {
      throw new Error(`Unsupported protocolVersion: ${protocolVersion}`);
    }
  }

  private validateChainContext(
    contract: MintNFTRequest['contract'] | CreateScheduledTaskRequest['contract'],
    chainFamily: 'evm' | 'solana'
  ): void {
    if (chainFamily === 'solana') {
      if (!contract.network || contract.network.trim().length === 0) {
        throw new Error('Solana contract.network is required');
      }
      return;
    }

    if (!Number.isFinite(contract.chainId) || contract.chainId <= 0) {
      throw new Error('EVM contract.chainId must be a positive number');
    }
  }

  private validateTiming(
    timing: MintNFTRequest['timing'] | CreateScheduledTaskRequest['timing'],
    expectedStrategy: 'immediate' | 'scheduled'
  ): void {
    if (!timing) {
      throw new Error('Timing is required');
    }
    if (!timing.requestedAt || Number.isNaN(new Date(timing.requestedAt).getTime())) {
      throw new Error('Invalid timing.requestedAt');
    }
    if (!timing.executeAt || Number.isNaN(new Date(timing.executeAt).getTime())) {
      throw new Error('Invalid timing.executeAt');
    }
    if (timing.strategy !== expectedStrategy) {
      throw new Error(`Invalid timing.strategy: expected ${expectedStrategy}`);
    }
    if (expectedStrategy === 'scheduled') {
      const executeAt = new Date(timing.executeAt);
      if (executeAt <= new Date()) {
        throw new Error('timing.executeAt must be in the future');
      }
    }
  }

  private mapErrorCode(message: string): WalletErrorCode {
    const lower = message.toLowerCase();

    if (lower.includes('scheduled time must be in the future')) {
      return WalletErrorCode.INVALID_SCHEDULED_TIME;
    }
    if (
      lower.includes('contract.network is required') ||
      lower.includes('chainid must be a positive number')
    ) {
      return WalletErrorCode.CHAIN_NOT_SUPPORTED;
    }
    if (
      lower.includes('invalid') ||
      lower.includes('required') ||
      lower.includes('consensus hash must')
    ) {
      return WalletErrorCode.INVALID_PARAMS;
    }
    return WalletErrorCode.NETWORK_ERROR;
  }
}

export const mingWalletInterface = new MingWalletInterface();
