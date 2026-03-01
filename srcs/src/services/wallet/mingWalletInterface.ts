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
  GetActiveAccountRequest,
  GetActiveAccountResponse,
  GetScheduledTaskResponse,
  GetScheduledTasksByWalletRequest,
  GetScheduledTasksByWalletResponse,
  CancelScheduledTaskRequest,
  CancelScheduledTaskResponse,
  ReleaseConnectionRequest,
  ReleaseConnectionResponse,
  WalletSendTransactionRequest,
  WalletSendTransactionResponse,
  GasPolicy,
  WalletEventEnvelope,
  WalletEventName,
  WalletErrorCode,
  WALLET_PROTOCOL_VERSION,
} from '../../types/wallet';
import { isValidContractAddress, isValidTokenURI } from '../../utils/validation';
import { walletWindowBridge } from './walletWindowBridge';

/**
 * 钱包接口服务类
 */
class MingWalletInterface {
  private readonly MESSAGE_TYPE_PREFIX = 'MING_WALLET_';
  private readonly PROTOCOL_VERSION = WALLET_PROTOCOL_VERSION;
  private readonly REQUEST_TIMEOUT = 300000; // 5分钟超时
  private readonly debugEnabled =
    import.meta.env.VITE_WALLET_BRIDGE_DEBUG === 'true' ||
    import.meta.env.VITE_WALLET_BRIDGE_DEBUG === '1';
  private readonly targetOrigin: string = walletWindowBridge.getTargetOrigin();
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
  private readonly HEX_DATA_PATTERN = /^0x[a-fA-F0-9]*$/;
  private readonly EVENT_TYPE = `${this.MESSAGE_TYPE_PREFIX}EVENT`;
  private readonly KNOWN_EVENTS: Set<WalletEventName> = new Set([
    'mintTaskStatusChanged',
    'mintSucceeded',
    'mintFailed',
    'closeConfirmed',
    'reviewConfirmed',
    'releaseConfirmed',
  ]);

  private debug(message: string, context?: Record<string, unknown>): void {
    if (!this.debugEnabled) {
      return;
    }
    if (context) {
      console.debug(`[MingWalletInterface] ${message}`, context);
      return;
    }
    console.debug(`[MingWalletInterface] ${message}`);
  }

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
    payload: unknown
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const useExternalWallet = walletWindowBridge.isExternalWalletConfigured();
      if (useExternalWallet) {
        walletWindowBridge.openWalletWindow();
      }

      const targetWindow = walletWindowBridge.getRequestTargetWindow();
      const expectedResponseSource = walletWindowBridge.getExpectedResponseSource();
      const postTargetOrigin =
        targetWindow === window ? window.location.origin : this.targetOrigin;
      if (useExternalWallet && targetWindow === window) {
        this.debug('wallet window unavailable after open attempt', {
          type,
          postTargetOrigin,
        });
        reject(
          new Error(
            'Wallet window is unavailable. Please open AnDaoWallet and retry.'
          )
        );
        return;
      }

      const messageId = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      const requestType = `${this.MESSAGE_TYPE_PREFIX}${type}_REQUEST`;
      const responseType = `${this.MESSAGE_TYPE_PREFIX}${type}_RESPONSE`;
      this.debug('send wallet request', {
        requestType,
        messageId,
        postTargetOrigin,
        externalWallet: useExternalWallet,
      });

      // 设置超时
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler);
        this.debug('wallet request timeout', { requestType, messageId });
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
        if (
          !walletWindowBridge.isExpectedResponseSource(
            event.source,
            expectedResponseSource
          )
        ) {
          this.debug('ignore wallet response: unexpected source', {
            requestType,
            messageId,
            eventOrigin: event.origin,
          });
          return;
        }
        if (!this.allowedOrigins.has(event.origin)) {
          this.debug('ignore wallet response: disallowed origin', {
            requestType,
            messageId,
            eventOrigin: event.origin,
          });
          return;
        }
        if (
          data.type === responseType &&
          data.messageId === messageId
        ) {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          
          if (data.payload?.success) {
            this.debug('wallet response success', {
              responseType,
              messageId,
              eventOrigin: event.origin,
            });
            resolve(data.payload as T);
          } else {
            this.debug('wallet response failed', {
              responseType,
              messageId,
              eventOrigin: event.origin,
              error: data.payload?.error?.message,
            });
            reject(new Error(data.payload?.error?.message || 'Wallet request failed'));
          }
        }
      };

      window.addEventListener('message', handler);

      // 发送请求
      targetWindow.postMessage(
        {
          type: requestType,
          messageId,
          payload,
        },
        postTargetOrigin
      );
    });
  }

  /**
   * 主动打开钱包窗口（用于用户点击“连接钱包”时预热跨窗口通信）
   */
  openWalletWindow(): boolean {
    return walletWindowBridge.openWalletWindow() !== null;
  }

  /**
   * 订阅钱包推送事件（close/review/release 等）
   */
  subscribeEvents(
    listener: (event: WalletEventEnvelope) => void
  ): () => void {
    const expectedResponseSource = walletWindowBridge.getExpectedResponseSource();
    const handler = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        payload?: {
          event?: WalletEventName;
          data?: Record<string, unknown>;
        };
      } | null;

      if (!data || typeof data !== 'object') {
        return;
      }
      if (data.type !== this.EVENT_TYPE) {
        return;
      }
      if (
        !walletWindowBridge.isExpectedResponseSource(
          event.source,
          expectedResponseSource
        )
      ) {
        return;
      }
      if (!this.allowedOrigins.has(event.origin)) {
        return;
      }
      const eventName = data.payload?.event;
      if (!eventName || !this.KNOWN_EVENTS.has(eventName)) {
        return;
      }

      listener({
        event: eventName,
        data: data.payload?.data || {},
      });
    };

    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }

  /**
   * 查询钱包当前活跃地址（用于Ming连接态展示）
   */
  async getActiveAccount(
    request: Omit<GetActiveAccountRequest, 'protocolVersion'> = {}
  ): Promise<GetActiveAccountResponse> {
    try {
      if (
        request.chainFamily &&
        request.chainFamily !== 'evm' &&
        request.chainFamily !== 'solana'
      ) {
        throw new Error('chainFamily must be evm or solana');
      }
      if (
        request.chainFamily === 'evm' &&
        request.chainId !== undefined &&
        (!Number.isFinite(request.chainId) || request.chainId <= 0)
      ) {
        throw new Error('EVM chainId must be a positive number');
      }

      const response = await this.sendMessage<GetActiveAccountResponse>(
        'GET_ACTIVE_ACCOUNT',
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
   * 通用交易发送（用于 close/review/release 等链上调用）
   */
  async sendTransaction(
    request: WalletSendTransactionRequest
  ): Promise<WalletSendTransactionResponse> {
    try {
      this.validateSendTransactionRequest(request);

      const response = await this.sendMessage<WalletSendTransactionResponse>(
        'SEND_TRANSACTION',
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

  private validateGasPolicy(gasPolicy: GasPolicy): void {
    if (!gasPolicy || !gasPolicy.primary) {
      throw new Error('gasPolicy.primary is required');
    }
    if (gasPolicy.fallback && gasPolicy.fallback === gasPolicy.primary) {
      throw new Error('gasPolicy.fallback must differ from primary');
    }
  }

  private validateSendTransactionRequest(request: WalletSendTransactionRequest): void {
    this.validateProtocolVersion(request.protocolVersion);
    const chainFamily = request.chainFamily || 'evm';

    if (!request.to) {
      throw new Error('Transaction target address is required');
    }
    if (!request.data || !this.HEX_DATA_PATTERN.test(request.data)) {
      throw new Error('Transaction data must be hex string');
    }
    if (request.value && !/^\d+$/.test(request.value)) {
      throw new Error('Transaction value must be decimal numeric string');
    }
    this.validateGasPolicy(request.gasPolicy);

    this.validateChainContext(
      {
        address: request.to,
        chainId: request.chainId,
        chainFamily,
        network: request.network,
      },
      chainFamily
    );
    if (!isValidContractAddress(request.to, chainFamily)) {
      throw new Error(`Invalid transaction target address for chain family: ${chainFamily}`);
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
      lower.includes('wallet not connected') ||
      lower.includes('wallet account') ||
      lower.includes('private key is not available') ||
      lower.includes('wallet window is unavailable') ||
      lower.includes('无法打开 andaowallet 窗口')
    ) {
      return WalletErrorCode.WALLET_NOT_CONNECTED;
    }
    if (
      lower.includes('invalid') ||
      lower.includes('required') ||
      lower.includes('must be') ||
      lower.includes('must differ') ||
      lower.includes('consensus hash must')
    ) {
      return WalletErrorCode.INVALID_PARAMS;
    }
    return WalletErrorCode.NETWORK_ERROR;
  }
}

export const mingWalletInterface = new MingWalletInterface();
