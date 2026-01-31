/**
 * 测试环境设置文件
 * 
 * 配置测试环境的全局设置
 * 
 * @module __tests__/setup
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// 每个测试后清理
afterEach(() => {
  cleanup();
});

// 扩展expect匹配器
expect.extend({
  // 可以在这里添加自定义匹配器
});

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  writable: true,
  value: {
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
});

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
