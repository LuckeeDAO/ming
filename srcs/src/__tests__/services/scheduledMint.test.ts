/**
 * 定时MINT服务测试
 * 
 * 测试定时MINT服务的核心功能
 * 
 * @module __tests__/services/scheduledMint.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  scheduledMintService,
} from '../../services/scheduledMint/scheduledMintService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('scheduledMintService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('createTask', () => {
    it('应该创建定时任务', () => {
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

      const task = scheduledMintService.createTask(taskData);

      expect(task.id).toBeDefined();
      expect(task.status).toBe('pending');
      expect(task.createdAt).toBeDefined();
      expect(task.walletAddress).toBe(taskData.walletAddress);
    });

    it('应该拒绝创建过去时间的任务', () => {
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

      expect(() => scheduledMintService.createTask(taskData)).toThrow();
    });
  });

  describe('getAllTasks', () => {
    it('应该返回所有任务', () => {
      const task1 = scheduledMintService.createTask({
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        selectedObject: {
          id: 'test-object-1',
          name: '测试外物1',
          element: 'wood' as const,
          category: 'nature' as const,
          description: '测试描述',
          image: '/images/test/wood_1.jpg',
          connectionMethods: [],
          recommendedFor: [],
        },
        imageData: 'data:image/png;base64,test1',
        imageFileName: 'test1.png',
        connectionType: 'symbolic',
        blessing: '测试祝福1',
        feelingsBefore: '测试前感受',
        feelingsDuring: '测试中感受',
        feelingsAfter: '测试后感受',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      });

      const task2 = scheduledMintService.createTask({
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
        selectedObject: {
          id: 'test-object-2',
          name: '测试外物2',
          element: 'fire' as const,
          category: 'nature' as const,
          description: '测试描述',
          image: '/images/test/fire_1.jpg',
          connectionMethods: [],
          recommendedFor: [],
        },
        imageData: 'data:image/png;base64,test2',
        imageFileName: 'test2.png',
        connectionType: 'symbolic',
        blessing: '测试祝福2',
        feelingsBefore: '测试前感受',
        feelingsDuring: '测试中感受',
        feelingsAfter: '测试后感受',
        scheduledTime: new Date(Date.now() + 172800000).toISOString(),
      });

      const allTasks = scheduledMintService.getAllTasks();
      expect(allTasks).toHaveLength(2);
      expect(allTasks.find((t) => t.id === task1.id)).toBeDefined();
      expect(allTasks.find((t) => t.id === task2.id)).toBeDefined();
    });
  });

  describe('getTask', () => {
    it('应该根据ID获取任务', () => {
      const task = scheduledMintService.createTask({
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
      });

      const foundTask = scheduledMintService.getTask(task.id);
      expect(foundTask).toBeDefined();
      expect(foundTask?.id).toBe(task.id);
    });
  });

  describe('getTasksByWallet', () => {
    it('应该根据钱包地址获取任务', () => {
      const wallet1 = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const wallet2 = '0x842d35Cc6634C0532925a3b844Bc9e7595f0bEb1';

      scheduledMintService.createTask({
        walletAddress: wallet1,
        selectedObject: {
          id: 'test-object-1',
          name: '测试外物1',
          element: 'wood' as const,
          category: 'nature' as const,
          description: '测试描述',
          image: '/images/test/wood_1.jpg',
          connectionMethods: [],
          recommendedFor: [],
        },
        imageData: 'data:image/png;base64,test1',
        imageFileName: 'test1.png',
        connectionType: 'symbolic',
        blessing: '测试祝福1',
        feelingsBefore: '测试前感受',
        feelingsDuring: '测试中感受',
        feelingsAfter: '测试后感受',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      });

      scheduledMintService.createTask({
        walletAddress: wallet2,
        selectedObject: {
          id: 'test-object-2',
          name: '测试外物2',
          element: 'fire' as const,
          category: 'nature' as const,
          description: '测试描述',
          image: '/images/test/fire_1.jpg',
          connectionMethods: [],
          recommendedFor: [],
        },
        imageData: 'data:image/png;base64,test2',
        imageFileName: 'test2.png',
        connectionType: 'symbolic',
        blessing: '测试祝福2',
        feelingsBefore: '测试前感受',
        feelingsDuring: '测试中感受',
        feelingsAfter: '测试后感受',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      });

      const wallet1Tasks = scheduledMintService.getTasksByWallet(wallet1);
      expect(wallet1Tasks).toHaveLength(1);
      expect(wallet1Tasks[0].walletAddress).toBe(wallet1);
    });
  });

  describe('updateTask', () => {
    it('应该更新任务', () => {
      const task = scheduledMintService.createTask({
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
      });

      task.status = 'completed';
      task.tokenId = '123';
      scheduledMintService.updateTask(task);

      const updatedTask = scheduledMintService.getTask(task.id);
      expect(updatedTask?.status).toBe('completed');
      expect(updatedTask?.tokenId).toBe('123');
    });
  });

  describe('deleteTask', () => {
    it('应该删除任务', () => {
      const task = scheduledMintService.createTask({
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
      });

      scheduledMintService.deleteTask(task.id);
      const foundTask = scheduledMintService.getTask(task.id);
      expect(foundTask).toBeNull();
    });
  });

  describe('cancelTask', () => {
    it('应该取消待执行的任务', () => {
      const task = scheduledMintService.createTask({
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
      });

      scheduledMintService.cancelTask(task.id);
      const updatedTask = scheduledMintService.getTask(task.id);
      expect(updatedTask?.status).toBe('cancelled');
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
