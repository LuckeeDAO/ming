/**
 * 定时MINT服务
 * 
 * 功能：
 * - 创建定时MINT任务
 * - 存储定时任务（使用localStorage）
 * - 执行定时任务（前端轮询机制）
 * - 管理定时任务（查看、编辑、取消）
 * 
 * 实现说明：
 * - 使用localStorage存储定时任务数据
 * - 使用setInterval进行轮询检查待执行任务
 * - 任务执行时调用NFT铸造流程
 * 
 * 数据结构：
 * - 任务存储在localStorage中，key为 'scheduledMintTasks'
 * - 每个任务包含完整的NFT铸造所需信息
 * 
 * @module services/scheduledMint/scheduledMintService
 */

import { ExternalObject } from '../../types/energy';
import { generateId } from '../../utils/helpers';

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
 * 定时MINT服务类
 */
class ScheduledMintService {
  /**
   * localStorage存储键名
   */
  private readonly STORAGE_KEY = 'scheduledMintTasks';
  
  /**
   * 轮询检查间隔（毫秒）
   */
  private readonly POLL_INTERVAL = 60000; // 1分钟
  
  /**
   * 轮询定时器ID
   */
  private pollTimer: NodeJS.Timeout | null = null;
  
  /**
   * 任务执行回调函数
   */
  private onExecuteTask?: (task: ScheduledMintTask) => Promise<void>;

  /**
   * 初始化服务
   * 启动轮询检查机制
   * 
   * @param onExecuteTask - 任务执行回调函数（用于执行NFT铸造）
   */
  init(onExecuteTask: (task: ScheduledMintTask) => Promise<void>): void {
    this.onExecuteTask = onExecuteTask;
    this.startPolling();
  }

  /**
   * 启动轮询检查
   */
  private startPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    
    // 立即检查一次
    this.checkAndExecuteTasks();
    
    // 设置定时检查
    this.pollTimer = setInterval(() => {
      this.checkAndExecuteTasks();
    }, this.POLL_INTERVAL);
  }

  /**
   * 停止轮询检查
   */
  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * 检查并执行到期的任务
   */
  private async checkAndExecuteTasks(): Promise<void> {
    const tasks = this.getAllTasks();
    const now = new Date();
    
    for (const task of tasks) {
      // 只处理待执行状态的任务
      if (task.status !== 'pending') {
        continue;
      }
      
      const scheduledTime = new Date(task.scheduledTime);
      
      // 如果到达执行时间，执行任务
      if (scheduledTime <= now) {
        await this.executeTask(task);
      }
    }
  }

  /**
   * 执行定时任务
   * 
   * @param task - 要执行的任务
   */
  private async executeTask(task: ScheduledMintTask): Promise<void> {
    // 更新任务状态为执行中
    task.status = 'processing';
    this.updateTask(task);
    
    try {
      // 调用执行回调函数
      if (this.onExecuteTask) {
        await this.onExecuteTask(task);
      }
      
      // 更新任务状态为已完成
      task.status = 'completed';
      task.mintedAt = new Date().toISOString();
      this.updateTask(task);
    } catch (error) {
      // 更新任务状态为失败
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : '执行失败';
      this.updateTask(task);
    }
  }

  /**
   * 创建定时MINT任务
   * 
   * @param taskData - 任务数据（不包含id、status、createdAt等自动生成的字段）
   * @returns 创建的任务对象
   */
  createTask(taskData: Omit<ScheduledMintTask, 'id' | 'status' | 'createdAt'>): ScheduledMintTask {
    const task: ScheduledMintTask = {
      ...taskData,
      id: generateId('scheduled_mint'),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    // 验证定时时间不能是过去
    const scheduledTime = new Date(task.scheduledTime);
    const now = new Date();
    if (scheduledTime <= now) {
      throw new Error('定时时间不能是过去的时间');
    }
    
    // 保存任务
    this.saveTask(task);
    
    return task;
  }

  /**
   * 获取所有任务
   * 
   * @returns 任务数组
   */
  getAllTasks(): ScheduledMintTask[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading scheduled mint tasks:', error);
      return [];
    }
  }

  /**
   * 根据ID获取任务
   * 
   * @param taskId - 任务ID
   * @returns 任务对象或null
   */
  getTask(taskId: string): ScheduledMintTask | null {
    const tasks = this.getAllTasks();
    return tasks.find((task) => task.id === taskId) || null;
  }

  /**
   * 根据钱包地址获取任务列表
   * 
   * @param walletAddress - 钱包地址
   * @returns 任务数组
   */
  getTasksByWallet(walletAddress: string): ScheduledMintTask[] {
    const tasks = this.getAllTasks();
    return tasks.filter((task) => task.walletAddress === walletAddress);
  }

  /**
   * 更新任务
   * 
   * @param task - 要更新的任务
   */
  updateTask(task: ScheduledMintTask): void {
    const tasks = this.getAllTasks();
    const index = tasks.findIndex((t) => t.id === task.id);
    
    if (index >= 0) {
      tasks[index] = task;
      this.saveAllTasks(tasks);
    }
  }

  /**
   * 删除任务
   * 
   * @param taskId - 任务ID
   */
  deleteTask(taskId: string): void {
    const tasks = this.getAllTasks();
    const filtered = tasks.filter((task) => task.id !== taskId);
    this.saveAllTasks(filtered);
  }

  /**
   * 取消任务
   * 
   * @param taskId - 任务ID
   */
  cancelTask(taskId: string): void {
    const task = this.getTask(taskId);
    if (task && task.status === 'pending') {
      task.status = 'cancelled';
      this.updateTask(task);
    }
  }

  /**
   * 保存任务
   * 
   * @param task - 要保存的任务
   */
  private saveTask(task: ScheduledMintTask): void {
    const tasks = this.getAllTasks();
    tasks.push(task);
    this.saveAllTasks(tasks);
  }

  /**
   * 保存所有任务
   * 
   * @param tasks - 任务数组
   */
  private saveAllTasks(tasks: ScheduledMintTask[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving scheduled mint tasks:', error);
      throw new Error('保存定时任务失败，可能是存储空间不足');
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
