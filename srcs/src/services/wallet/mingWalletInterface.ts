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
  CancelScheduledTaskRequest,
  CancelScheduledTaskResponse,
  WalletErrorCode,
} from '../../types/wallet';

/**
 * 钱包接口服务类
 */
class MingWalletInterface {
  private readonly MESSAGE_TYPE_PREFIX = 'MING_WALLET_';
  private readonly REQUEST_TIMEOUT = 300000; // 5分钟超时

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
        if (
          event.data.type === responseType &&
          event.data.messageId === messageId
        ) {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          
          if (event.data.payload.success) {
            resolve(event.data.payload as T);
          } else {
            reject(new Error(event.data.payload.error?.message || 'Wallet request failed'));
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
        '*' // 注意：生产环境应该指定具体的目标源
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
        request
      );

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          code: WalletErrorCode.NETWORK_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
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
        request
      );

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          code: WalletErrorCode.NETWORK_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
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
        { taskId }
      );

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          code: WalletErrorCode.NETWORK_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
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
      if (!request.taskId) {
        throw new Error('Task ID is required');
      }

      const response = await this.sendMessage<CancelScheduledTaskResponse>(
        'CANCEL_SCHEDULED_TASK',
        request
      );

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          code: WalletErrorCode.NETWORK_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * 验证铸造请求参数
   */
  private validateMintRequest(request: MintNFTRequest): void {
    if (!request.ipfs) {
      throw new Error('IPFS data is required');
    }
    if (!request.ipfs.imageHash || !request.ipfs.metadataHash) {
      throw new Error('IPFS hash is required');
    }
    if (!request.consensusHash) {
      throw new Error('Consensus hash is required');
    }
    if (!request.contract || !request.contract.address) {
      throw new Error('Contract address is required');
    }
    if (!request.params || !request.params.to) {
      throw new Error('Recipient address is required');
    }
  }

  /**
   * 验证定时任务请求参数
   */
  private validateScheduledTaskRequest(
    request: CreateScheduledTaskRequest
  ): void {
    if (!request.scheduledTime) {
      throw new Error('Scheduled time is required');
    }
    
    // 验证时间是否为未来时间
    const scheduledTime = new Date(request.scheduledTime);
    const now = new Date();
    if (scheduledTime <= now) {
      throw new Error('Scheduled time must be in the future');
    }

    if (!request.ipfs) {
      throw new Error('IPFS data is required');
    }
    if (!request.ipfs.imageHash || !request.ipfs.metadataHash) {
      throw new Error('IPFS hash is required');
    }
    if (!request.consensusHash) {
      throw new Error('Consensus hash is required');
    }
    if (!request.contract || !request.contract.address) {
      throw new Error('Contract address is required');
    }
  }
}

export const mingWalletInterface = new MingWalletInterface();
