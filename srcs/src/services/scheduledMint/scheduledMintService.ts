/**
 * 定时MINT服务
 * 
 * 功能（方案B：钱包管理定时任务）：
 * - 创建定时MINT任务（调用钱包接口）
 * - 查询定时任务状态（从钱包获取）
 * - 取消定时任务（调用钱包接口）
 * 
 * 实现说明：
 * - 定时任务的存储和执行由钱包负责
 * - Ming平台只负责创建任务和查询状态
 * - 不再使用localStorage存储任务
 * - 不再使用前端轮询机制
 * 
 * 注意：
 * - 此服务已重构为钱包接口的封装
 * - 所有定时任务管理由钱包完成
 * 
 * @module services/scheduledMint/scheduledMintService
 */

import { ExternalObject } from '../../types/energy';
import {
  GasPolicyType,
  WalletScheduledTaskData,
  WALLET_PROTOCOL_VERSION,
} from '../../types/wallet';
import { mingWalletInterface } from '../wallet/mingWalletInterface';
import { ipfsService } from '../ipfs/ipfsService';
import { walletService } from '../wallet/walletService';
import { ethers } from 'ethers';

/**
 * 定时MINT任务状态
 */
export type ScheduledMintTaskStatus = 
  | 'pending'    // 待执行
  | 'processing' // 执行中
  | 'completed'  // 已完成
  | 'failed'     // 失败
  | 'cancelled'; // 已取消

/**
 * 定时MINT任务接口
 */
export interface ScheduledMintTask {
  /**
   * 任务唯一ID
   */
  id: string;

  /**
   * 计划ID（跨系统一致标识）
   */
  planId?: string;
  
  /**
   * 钱包地址
   */
  walletAddress: string;
  
  /**
   * 选中的外物
   */
  selectedObject: ExternalObject;
  
  /**
   * 图片文件（存储为base64或File对象）
   * 注意：localStorage不能直接存储File对象，需要转换为base64
   */
  imageData: string; // base64编码的图片数据
  
  /**
   * 图片文件名
   */
  imageFileName: string;
  
  /**
   * 连接类型
   */
  connectionType: string;
  
  /**
   * 地点（可选）
   */
  location?: string;
  
  /**
   * 持续时间（可选）
   */
  duration?: string;
  
  /**
   * 祝福文本
   */
  blessing: string;
  
  /**
   * 连接前的感受
   */
  feelingsBefore: string;
  
  /**
   * 连接中的感受
   */
  feelingsDuring: string;
  
  /**
   * 连接后的感受
   */
  feelingsAfter: string;
  
  /**
   * 定时执行时间（ISO格式）
   */
  scheduledTime: string;
  
  /**
   * 任务状态
   */
  status: ScheduledMintTaskStatus;
  
  /**
   * 创建时间（ISO格式）
   */
  createdAt: string;
  
  /**
   * 执行时间（ISO格式，执行后填充）
   */
  mintedAt?: string;
  
  /**
   * 交易哈希（执行后填充）
   */
  txHash?: string;
  
  /**
   * Token ID（执行后填充）
   */
  tokenId?: string;
  
  /**
   * Token URI（执行后填充）
   */
  tokenURI?: string;
  
  /**
   * 错误信息（失败时填充）
   */
  error?: string;

  /**
   * 实际生效的Gas策略
   */
  effectiveGasPolicy?: GasPolicyType;

  /**
   * 生命周期链上回执
   */
  closeTxHash?: string;
  reviewTxHash?: string;
  releaseTxHash?: string;
}

/**
 * 定时MINT服务类（方案B：钱包管理定时任务）
 */
class ScheduledMintService {
  private generatePlanId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  /**
   * 将钱包状态映射为前端任务状态
   */
  private normalizeStatus(status: string): ScheduledMintTaskStatus {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'executing':
      case 'processing':
        return 'processing';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  /**
   * 钱包任务数据转换为前端任务结构
   */
  private mapWalletTask(
    task: WalletScheduledTaskData,
    walletAddressFallback: string
  ): ScheduledMintTask {
    const rawElement = task.selectedObject?.element;
    const normalizedElement: ExternalObject['element'] =
      rawElement === 'wood' ||
      rawElement === 'fire' ||
      rawElement === 'earth' ||
      rawElement === 'metal' ||
      rawElement === 'water'
        ? rawElement
        : 'wood';

    const rawCategory = task.selectedObject?.category;
    const normalizedCategory: ExternalObject['category'] =
      rawCategory === 'nature' ||
      rawCategory === 'mineral' ||
      rawCategory === 'plant' ||
      rawCategory === 'water' ||
      rawCategory === 'fire' ||
      rawCategory === 'other'
        ? rawCategory
        : 'other';

    return {
      id: task.taskId,
      planId: typeof task.planId === 'string' ? task.planId : task.taskId,
      walletAddress: task.walletAddress || walletAddressFallback,
      selectedObject: {
        id: task.selectedObject?.id || 'unknown',
        name: task.selectedObject?.name || '未知外物',
        element: normalizedElement,
        category: normalizedCategory,
        description: task.selectedObject?.description || '钱包未返回外物描述',
        image: task.selectedObject?.image || '',
        connectionMethods: [],
        recommendedFor: [],
      },
      imageData: '',
      imageFileName: '',
      connectionType: task.connectionType || '',
      location: task.location,
      duration: task.duration,
      blessing: task.blessing || '',
      feelingsBefore: task.feelingsBefore || '',
      feelingsDuring: task.feelingsDuring || '',
      feelingsAfter: task.feelingsAfter || '',
      scheduledTime: task.scheduledTime,
      status: this.normalizeStatus(task.status),
      createdAt: task.createdAt || task.scheduledTime,
      mintedAt: task.mintedAt,
      txHash: task.result?.txHash,
      tokenId: task.result?.tokenId,
      tokenURI: task.ipfs?.tokenURI,
      error: task.result?.error,
      effectiveGasPolicy: task.result?.effectiveGasPolicy,
      closeTxHash: task.result?.lifecycleReceipts?.closeTxHash,
      reviewTxHash: task.result?.lifecycleReceipts?.reviewTxHash,
      releaseTxHash: task.result?.lifecycleReceipts?.releaseTxHash,
    };
  }

  /**
   * 初始化服务（已废弃，定时任务由钱包管理）
   * 
   * @deprecated 定时任务现在由钱包管理，不再需要初始化轮询
   */
  init(_onExecuteTask?: (task: ScheduledMintTask) => Promise<void>): void {
    // 不再需要轮询，定时任务由钱包管理
    console.warn('ScheduledMintService.init() is deprecated. Tasks are now managed by wallet.');
  }

  /**
   * 停止轮询检查（已废弃）
   * 
   * @deprecated 定时任务现在由钱包管理，不再需要轮询
   */
  stopPolling(): void {
    // 不再需要轮询
    console.warn('ScheduledMintService.stopPolling() is deprecated. Tasks are now managed by wallet.');
  }

  /**
   * 创建定时MINT任务（方案B：调用钱包接口）
   * 
   * @param taskData - 任务数据
   * @returns 创建的任务ID（由钱包返回）
   */
  async createTask(
    taskData: Omit<ScheduledMintTask, 'id' | 'status' | 'createdAt'>
  ): Promise<string> {
    const planId = taskData.planId || this.generatePlanId();

    // 验证定时时间不能是过去
    const scheduledTime = new Date(taskData.scheduledTime);
    const now = new Date();
    if (scheduledTime <= now) {
      throw new Error('定时时间不能是过去的时间');
    }

    // 1. 将base64图片转换为Blob
    const imageBlob = this.base64ToBlob(taskData.imageData);
    const imageFile = new File([imageBlob], taskData.imageFileName, { type: imageBlob.type });

    // 2. 上传图片到IPFS（方案A：Ming平台完成）
    const imageHash = await ipfsService.uploadFile(imageFile);
    const imageURI = ipfsService.getAccessUrl(imageHash);

    // 3. 生成NFT元数据
    const metadata = {
      name: `外物连接 - ${taskData.selectedObject.name}`,
      description: `与${taskData.selectedObject.name}的连接仪式见证`,
      image: imageURI,
      attributes: [
        { trait_type: '外物', value: taskData.selectedObject.name },
        { trait_type: '五行属性', value: taskData.selectedObject.element },
        { trait_type: '连接类型', value: taskData.connectionType },
      ],
      connection: {
        externalObjectId: taskData.selectedObject.id,
        externalObjectName: taskData.selectedObject.name,
        element: taskData.selectedObject.element,
        connectionType: taskData.connectionType,
        connectionDate: new Date().toISOString(),
      },
      ceremony: {
        location: taskData.location,
        duration: taskData.duration,
      },
      feelings: {
        before: taskData.feelingsBefore,
        during: taskData.feelingsDuring,
        after: taskData.feelingsAfter,
      },
      ...(taskData.blessing && {
        blessing: {
          text: taskData.blessing,
          timestamp: new Date().toISOString(),
        },
      }),
      scheduledMint: {
        planId,
        scheduledTime: taskData.scheduledTime,
      },
      energyField: {
        consensusHash: '',
      },
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        platform: 'ming',
      },
    };

    // 4. 上传元数据到IPFS
    const metadataHash = await ipfsService.uploadJSON(metadata);
    const tokenURI = ipfsService.getAccessUrl(metadataHash);

    // 5. 生成共识哈希
    const consensusHash = ethers.keccak256(ethers.toUtf8Bytes(metadataHash));

    // 6. 获取合约配置（兼容EVM/Solana）
    const chainContext = await walletService.getChainContext();
    const { chainId, chainFamily, network } = chainContext;
    const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      throw new Error('NFT合约地址未配置');
    }

    // 7. 调用钱包接口创建定时任务
    const response = await mingWalletInterface.createScheduledTask({
      protocolVersion: WALLET_PROTOCOL_VERSION,
      planId,
      scheduledTime: taskData.scheduledTime,
      timing: {
        requestedAt: new Date().toISOString(),
        executeAt: taskData.scheduledTime,
        strategy: 'scheduled',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      ipfs: {
        imageHash,
        metadataHash,
        imageURI,
        tokenURI,
      },
      consensusHash,
      contract: {
        address: contractAddress,
        chainId,
        chainFamily,
        ...(network ? { network } : {}),
      },
      params: {
        to: taskData.walletAddress,
        tokenURI,
        externalObjectId: taskData.selectedObject.id,
        element: taskData.selectedObject.element,
        consensusHash,
      },
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '创建定时任务失败');
    }

    return response.data.taskId;
  }

  /**
   * 获取所有任务（从钱包查询）
   *
   * 注意：钱包侧通常按地址查询任务，因此此方法要求传入钱包地址。
   *
   * @param walletAddress - 钱包地址
   * @returns 任务数组（从钱包获取）
   */
  async getAllTasks(walletAddress?: string): Promise<ScheduledMintTask[]> {
    if (!walletAddress) {
      return [];
    }
    return this.getTasksByWallet(walletAddress);
  }

  /**
   * 根据ID获取任务（从钱包查询）
   * 
   * @param taskId - 任务ID
   * @returns 任务对象或null
   */
  async getTask(taskId: string): Promise<ScheduledMintTask | null> {
    try {
      const response = await mingWalletInterface.getScheduledTask(taskId);
      if (!response.success || !response.data) {
        return null;
      }
      return this.mapWalletTask(response.data, '');
    } catch (error) {
      console.error('Error getting scheduled task:', error);
      return null;
    }
  }

  /**
   * 根据钱包地址获取任务列表（从钱包查询）
   *
   * @param walletAddress - 钱包地址
   * @returns 任务数组
   */
  async getTasksByWallet(walletAddress: string): Promise<ScheduledMintTask[]> {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const response = await mingWalletInterface.getScheduledTasksByWallet({
      protocolVersion: WALLET_PROTOCOL_VERSION,
      walletAddress,
    });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '获取定时任务列表失败');
    }

    return (response.data.tasks || []).map((task) =>
      this.mapWalletTask(task, walletAddress)
    );
  }

  /**
   * 更新任务（已废弃，任务由钱包管理）
   * 
   * @deprecated 任务现在由钱包管理，不再需要手动更新
   */
  updateTask(_task: ScheduledMintTask): void {
    console.warn('updateTask() is deprecated. Tasks are now managed by wallet.');
  }

  /**
   * 删除任务（已废弃，使用cancelTask）
   * 
   * @deprecated 使用cancelTask取消任务
   */
  deleteTask(taskId: string): void {
    console.warn('deleteTask() is deprecated. Use cancelTask() instead.');
    this.cancelTask(taskId);
  }

  /**
   * 取消任务（调用钱包接口）
   * 
   * @param taskId - 任务ID
   */
  async cancelTask(taskId: string): Promise<void> {
    const response = await mingWalletInterface.cancelScheduledTask({
      protocolVersion: WALLET_PROTOCOL_VERSION,
      taskId,
    });
    if (!response.success) {
      throw new Error(response.error?.message || '取消定时任务失败');
    }
  }

  /**
   * 将File对象转换为base64字符串
   * 
   * @param file - 文件对象
   * @returns Promise<string> base64编码的字符串
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 将base64字符串转换为Blob对象
   * 
   * @param base64 - base64编码的字符串
   * @returns Blob对象
   */
  base64ToBlob(base64: string): Blob {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * 检查定时任务是否需要提醒
   * 
   * 功能说明：
   * - 在任务执行时间前一定时间（默认提前1小时）提醒用户
   * - 使用浏览器通知API（Notification API）发送提醒
   * - 需要用户授权通知权限
   * 
   * @param task - 定时任务
   * @param advanceMinutes - 提前提醒时间（分钟，默认60分钟）
   * @returns 是否需要提醒
   */
  shouldRemind(task: ScheduledMintTask, advanceMinutes: number = 60): boolean {
    if (task.status !== 'pending') {
      return false; // 只有待执行的任务才需要提醒
    }

    const now = new Date();
    const scheduledTime = new Date(task.scheduledTime);
    const diffMs = scheduledTime.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    // 如果任务时间已过，不需要提醒
    if (diffMinutes < 0) {
      return false;
    }

    // 如果距离任务时间在提前提醒时间范围内，需要提醒
    return diffMinutes <= advanceMinutes && diffMinutes > 0;
  }

  /**
   * 发送定时任务提醒通知
   * 
   * 功能说明：
   * - 使用浏览器通知API发送提醒
   * - 需要用户授权通知权限
   * - 如果浏览器不支持通知API，则使用console.log输出提醒信息
   * 
   * @param task - 定时任务
   * @returns Promise<void>
   */
  async sendReminder(task: ScheduledMintTask): Promise<void> {
    if (!this.shouldRemind(task)) {
      return; // 不需要提醒
    }

    const scheduledTime = new Date(task.scheduledTime);
    const timeStr = scheduledTime.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const title = '定时MINT提醒';
    const body = `您的定时MINT任务将在 ${timeStr} 执行，请做好准备。`;

    // 检查浏览器是否支持通知API
    if ('Notification' in window) {
      // 请求通知权限
      if (Notification.permission === 'granted') {
        // 已授权，直接发送通知
        new Notification(title, {
          body,
          icon: '/favicon.ico', // 可选：通知图标
          tag: `scheduled-mint-${task.id}`, // 防止重复通知
        });
      } else if (Notification.permission !== 'denied') {
        // 未授权，请求权限
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: `scheduled-mint-${task.id}`,
          });
        } else {
          // 用户拒绝授权，使用console.log输出提醒
          console.log(`[定时MINT提醒] ${body}`);
        }
      } else {
        // 用户已拒绝授权，使用console.log输出提醒
        console.log(`[定时MINT提醒] ${body}`);
      }
    } else {
      // 浏览器不支持通知API，使用console.log输出提醒
      console.log(`[定时MINT提醒] ${body}`);
    }
  }

  /**
   * 检查所有待执行任务并发送提醒
   * 
   * 功能说明：
   * - 获取所有待执行任务
   * - 检查每个任务是否需要提醒
   * - 发送提醒通知
   * 
   * 使用场景：
   * - 可以在页面加载时调用
   * - 可以在定时器中定期调用（例如每5分钟检查一次）
   * 
   * @param advanceMinutes - 提前提醒时间（分钟，默认60分钟）
   * @returns Promise<void>
   */
  async checkAndSendReminders(advanceMinutes: number = 60): Promise<void> {
    try {
      const tasks = await this.getAllTasks();
      const pendingTasks = tasks.filter((task) => task.status === 'pending');

      for (const task of pendingTasks) {
        if (this.shouldRemind(task, advanceMinutes)) {
          await this.sendReminder(task);
        }
      }
    } catch (error) {
      console.error('检查定时任务提醒时出错：', error);
    }
  }
}

export const scheduledMintService = new ScheduledMintService();
