/**
 * 定时MINT服务测试
 * 
 * 测试定时MINT服务的核心功能
 * 
 * @module __tests__/services/scheduledMint.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  scheduledMintService,
} from '../../services/scheduledMint/scheduledMintService';
import { mingWalletInterface } from '../../services/wallet/mingWalletInterface';
import { ipfsService } from '../../services/ipfs/ipfsService';
import { walletService } from '../../services/wallet/walletService';

// Mock dependencies
vi.mock('../../services/wallet/mingWalletInterface');
vi.mock('../../services/ipfs/ipfsService');
vi.mock('../../services/wallet/walletService');
vi.mock('ethers', () => ({
  ethers: {
    keccak256: vi.fn((data: string) => `0x${data.substring(0, 64)}`),
    toUtf8Bytes: vi.fn((str: string) => str),
  },
}));

// Mock environment variable
vi.stubEnv('VITE_NFT_CONTRACT_ADDRESS', '0x1234567890123456789012345678901234567890');

describe('scheduledMintService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (ipfsService.uploadFile as any) = vi.fn().mockResolvedValue('QmImageHash');
    (ipfsService.uploadJSON as any) = vi.fn().mockResolvedValue('QmMetadataHash');
    (ipfsService.getAccessUrl as any) = vi.fn((hash: string) => `https://ipfs.io/ipfs/${hash}`);
    (walletService.getNetworkId as any) = vi.fn().mockResolvedValue(1);
    (mingWalletInterface.createScheduledTask as any) = vi.fn().mockResolvedValue({
      success: true,
      data: {
        taskId: 'test-task-id-123',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
      },
    });
    (mingWalletInterface.getScheduledTask as any) = vi.fn().mockResolvedValue({
      success: true,
      data: {
        taskId: 'test-task-id-123',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending',
      },
    });
    (mingWalletInterface.cancelScheduledTask as any) = vi.fn().mockResolvedValue({
      success: true,
    });
    (mingWalletInterface.getScheduledTasksByWallet as any) = vi.fn().mockResolvedValue({
      success: true,
      data: {
        tasks: [],
      },
    });
  });

  describe('createTask', () => {
    it('应该创建定时任务并返回任务ID', async () => {
      const taskData = {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        selectedObject: {
          id: 'test-object',
          name: '测试外物',
          element: 'wood' as const,
          category: 'nature' as const,
          description: '测试描述',
          image: '/images/test/wood_0.jpg',
          connectionMethods: [],
          recommendedFor: [],
        },
        imageData: 'data:image/png;base64,test',
        imageFileName: 'test.png',
        connectionType: 'symbolic',
        blessing: '测试祝福',
        feelingsBefore: '测试前感受',
        feelingsDuring: '测试中感受',
        feelingsAfter: '测试后感受',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(), // 明天
      };

      const taskId = await scheduledMintService.createTask(taskData);

      expect(taskId).toBeDefined();
      expect(taskId).toBe('test-task-id-123');
      expect(ipfsService.uploadFile).toHaveBeenCalled();
      expect(ipfsService.uploadJSON).toHaveBeenCalled();
      expect(mingWalletInterface.createScheduledTask).toHaveBeenCalled();
    });

    it('应该拒绝创建过去时间的任务', async () => {
      const taskData = {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        selectedObject: {
          id: 'test-object',
          name: '测试外物',
          element: 'wood' as const,
          category: 'nature' as const,
          description: '测试描述',
          image: '/images/test/wood_0.jpg',
          connectionMethods: [],
          recommendedFor: [],
        },
        imageData: 'data:image/png;base64,test',
        imageFileName: 'test.png',
        connectionType: 'symbolic',
        blessing: '测试祝福',
        feelingsBefore: '测试前感受',
        feelingsDuring: '测试中感受',
        feelingsAfter: '测试后感受',
        scheduledTime: new Date(Date.now() - 86400000).toISOString(), // 昨天
      };

      await expect(scheduledMintService.createTask(taskData)).rejects.toThrow('定时时间不能是过去的时间');
    });
  });

  describe('getAllTasks', () => {
    it('应该返回所有任务（当前返回空数组，因为钱包接口未实现）', async () => {
      const allTasks = await scheduledMintService.getAllTasks();
      expect(allTasks).toEqual([]);
    });
  });

  describe('getTask', () => {
    it('应该根据ID获取任务', async () => {
      const taskId = 'test-task-id-123';
      const foundTask = await scheduledMintService.getTask(taskId);
      
      expect(foundTask).toBeDefined();
      expect(foundTask?.id).toBe(taskId);
      expect(foundTask?.status).toBe('pending');
      expect(foundTask?.selectedObject.name).toBe('未知外物');
      expect(mingWalletInterface.getScheduledTask).toHaveBeenCalled();
    });

    it('应该返回null当任务不存在时', async () => {
      (mingWalletInterface.getScheduledTask as any) = vi.fn().mockResolvedValue({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
        },
      });

      const foundTask = await scheduledMintService.getTask('non-existent-task');
      expect(foundTask).toBeNull();
    });
  });

  describe('getTasksByWallet', () => {
    it('应该根据钱包地址获取任务', async () => {
      const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      (mingWalletInterface.getScheduledTasksByWallet as any) = vi.fn().mockResolvedValue({
        success: true,
        data: {
          tasks: [
            {
              taskId: 'task-1',
              scheduledTime: new Date(Date.now() + 86400000).toISOString(),
              status: 'executing',
              walletAddress,
              createdAt: new Date().toISOString(),
              selectedObject: {
                id: 'obj-1',
                name: '测试外物',
                element: 'fire',
                category: 'nature',
                description: '描述',
                image: '/images/test.jpg',
              },
              result: {
                txHash: '0xtx',
              },
            },
          ],
        },
      });

      const walletTasks = await scheduledMintService.getTasksByWallet(walletAddress);
      expect(walletTasks).toHaveLength(1);
      expect(walletTasks[0].id).toBe('task-1');
      expect(walletTasks[0].status).toBe('processing');
      expect(walletTasks[0].selectedObject.name).toBe('测试外物');
      expect(mingWalletInterface.getScheduledTasksByWallet).toHaveBeenCalledWith({ walletAddress });
    });
  });

  describe('updateTask', () => {
    it('应该警告updateTask已废弃', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const task = {
        id: 'test-task-id',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        selectedObject: {
          id: 'test-object',
          name: '测试外物',
          element: 'wood' as const,
          category: 'nature' as const,
          description: '测试描述',
          image: '/images/test/wood_0.jpg',
          connectionMethods: [],
          recommendedFor: [],
        },
        imageData: 'data:image/png;base64,test',
        imageFileName: 'test.png',
        connectionType: 'symbolic',
        blessing: '测试祝福',
        feelingsBefore: '测试前感受',
        feelingsDuring: '测试中感受',
        feelingsAfter: '测试后感受',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      scheduledMintService.updateTask(task);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('updateTask() is deprecated')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('deleteTask', () => {
    it('应该调用cancelTask取消任务', async () => {
      const taskId = 'test-task-id-123';
      await scheduledMintService.deleteTask(taskId);
      expect(mingWalletInterface.cancelScheduledTask).toHaveBeenCalledWith({ taskId });
    });
  });

  describe('cancelTask', () => {
    it('应该取消待执行的任务', async () => {
      const taskId = 'test-task-id-123';
      await scheduledMintService.cancelTask(taskId);
      expect(mingWalletInterface.cancelScheduledTask).toHaveBeenCalledWith({ taskId });
    });

    it('应该在取消失败时抛出错误', async () => {
      (mingWalletInterface.cancelScheduledTask as any) = vi.fn().mockResolvedValue({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found',
        },
      });

      const taskId = 'non-existent-task';
      await expect(scheduledMintService.cancelTask(taskId)).rejects.toThrow('Task not found');
    });
  });

  describe('fileToBase64 and base64ToBlob', () => {
    it('应该转换文件为base64并转换回来', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const base64 = await scheduledMintService.fileToBase64(file);
      expect(base64).toContain('data:text/plain;base64');

      const blob = scheduledMintService.base64ToBlob(base64);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');
    });
  });
});
