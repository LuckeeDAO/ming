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
}

/**
 * 定时MINT服务类（方案B：钱包管理定时任务）
 */
class ScheduledMintService {
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

    // 6. 获取合约配置
    const chainId = await walletService.getNetworkId();
    const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      throw new Error('NFT合约地址未配置');
    }

    // 7. 调用钱包接口创建定时任务
    const response = await mingWalletInterface.createScheduledTask({
      scheduledTime: taskData.scheduledTime,
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
   * 注意：此方法需要钱包提供查询所有任务的接口。
   * 当前钱包接口只支持按taskId查询单个任务，不支持批量查询。
   * 
   * 实现方案：
   * 1. 钱包需要提供 getAllScheduledTasks(walletAddress) 接口
   * 2. 或者钱包需要提供 getTaskIdsByWallet(walletAddress) 接口，然后逐个查询
   * 
   * @param _walletAddress - 钱包地址（可选，如果不提供则使用当前连接的钱包）
   * @returns 任务数组（从钱包获取）
   * 
   * @deprecated 此方法需要钱包提供查询接口，当前返回空数组
   * 实际实现需要钱包提供查询所有任务的接口
   */
  async getAllTasks(_walletAddress?: string): Promise<ScheduledMintTask[]> {
    // TODO: 实现从钱包查询所有定时任务的接口
    // 方案1：钱包提供 getAllScheduledTasks(walletAddress) 接口
    // 方案2：钱包提供 getTaskIdsByWallet(walletAddress) 接口，然后使用 getTask() 逐个查询
    
    // 当前钱包接口只支持按taskId查询，需要钱包提供查询所有任务的接口
    console.warn(
      'getAllTasks() needs wallet API to query all tasks. ' +
      'Please implement wallet.getAllScheduledTasks() or wallet.getTaskIdsByWallet() interface.'
    );
    
    // 返回空数组，避免调用方出错
    return [];
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

      // 将钱包返回的数据转换为ScheduledMintTask格式
      // 注意：钱包返回的数据格式可能与ScheduledMintTask不完全一致
      // 需要根据实际钱包接口返回格式进行调整
      return {
        id: response.data.taskId,
        walletAddress: '', // 钱包接口可能不返回此字段
        selectedObject: {} as ExternalObject, // 需要从其他地方获取
        imageData: '',
        imageFileName: '',
        connectionType: '',
        blessing: '',
        feelingsBefore: '',
        feelingsDuring: '',
        feelingsAfter: '',
        scheduledTime: response.data.scheduledTime,
        status: response.data.status as ScheduledMintTaskStatus,
        createdAt: '',
        txHash: response.data.result?.txHash,
        tokenId: response.data.result?.tokenId,
      };
    } catch (error) {
      console.error('Error getting scheduled task:', error);
      return null;
    }
  }

  /**
   * 根据钱包地址获取任务列表（从钱包查询）
   * 
   * 注意：此方法需要钱包提供按地址查询任务的接口。
   * 
   * 实现方案：
   * 1. 钱包需要提供 getScheduledTasksByWallet(walletAddress) 接口
   * 2. 或者使用 getAllTasks(walletAddress) 方法（如果钱包支持）
   * 
   * @param walletAddress - 钱包地址
   * @returns 任务数组
   * 
   * @deprecated 此方法需要钱包提供按地址查询的接口
   */
  async getTasksByWallet(walletAddress: string): Promise<ScheduledMintTask[]> {
    // TODO: 实现从钱包按地址查询任务的接口
    // 方案1：钱包提供 getScheduledTasksByWallet(walletAddress) 接口
    // 方案2：使用 getAllTasks(walletAddress) 方法（如果钱包支持）
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    console.warn(
      'getTasksByWallet() needs wallet API to query tasks by address. ' +
      'Please implement wallet.getScheduledTasksByWallet() interface.'
    );
    
    // 返回空数组，避免调用方出错
    return [];
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
    const response = await mingWalletInterface.cancelScheduledTask({ taskId });
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
}

export const scheduledMintService = new ScheduledMintService();
