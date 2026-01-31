/**
 * 测试辅助工具函数
 * 
 * 提供测试中常用的工具函数，包括：
 * - 测试账号生成
 * - Mock数据生成
 * - 测试环境设置
 * 
 * @module __tests__/utils/testHelpers
 */

import { ExternalObject } from '../../types/energy';
import { FourPillars } from '../../types/energy';

/**
 * 生成测试用的钱包地址
 * 
 * @param index - 地址索引（用于生成不同的地址）
 * @returns 测试钱包地址
 */
export function generateTestAddress(index: number = 0): string {
  const prefix = '0x';
  const suffix = Array.from({ length: 40 }, (_, i) => {
    const charIndex = (index + i) % 16;
    return charIndex.toString(16);
  }).join('');
  return `${prefix}${suffix}`;
}

/**
 * 生成测试用的四柱八字数据
 * 
 * @returns 测试四柱八字数据
 */
export function generateTestFourPillars(): FourPillars {
  // 天干
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  // 地支
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  const randomStem = () => heavenlyStems[Math.floor(Math.random() * heavenlyStems.length)];
  const randomBranch = () => earthlyBranches[Math.floor(Math.random() * earthlyBranches.length)];
  
  return {
    year: randomStem() + randomBranch(),
    month: randomStem() + randomBranch(),
    day: randomStem() + randomBranch(),
    hour: randomStem() + randomBranch(),
  };
}

/**
 * 生成测试用的外物数据
 * 
 * @param count - 生成数量
 * @returns 测试外物数组
 */
export function generateTestExternalObjects(count: number = 5): ExternalObject[] {
  const elements: Array<'wood' | 'fire' | 'earth' | 'metal' | 'water'> = [
    'wood',
    'fire',
    'earth',
    'metal',
    'water',
  ];
  
  const names = {
    wood: ['树木', '竹子', '花草'],
    fire: ['蜡烛', '阳光', '火焰'],
    earth: ['土壤', '石头', '陶瓷'],
    metal: ['硬币', '铃铛', '金属'],
    water: ['流水', '静水', '雨滴'],
  };
  
  const objects: ExternalObject[] = [];
  
  for (let i = 0; i < count; i++) {
    const element = elements[i % elements.length];
    const elementNames = names[element];
    const name = elementNames[i % elementNames.length];
    
    objects.push({
      id: `test_${element}_${i}`,
      name: name,
      nameEn: name,
      element: element,
      category: 'nature',
      description: `这是测试用的${name}，用于${element}属性的能量连接。`,
      descriptionEn: `This is a test ${name} for ${element} element energy connection.`,
      image: `/images/test/${element}_${i}.jpg`,
      connectionMethods: [
        {
          type: 'symbolic',
          name: '象征性连接',
          description: '测试连接方式',
          steps: [
            { order: 1, title: '步骤1', description: '测试步骤1' },
            { order: 2, title: '步骤2', description: '测试步骤2' },
          ],
          materials: [],
          difficulty: 'easy',
          estimatedTime: '10分钟',
        },
      ],
      recommendedFor: [
        { element: element, reason: `补充${element}属性能量` },
      ],
    });
  }
  
  return objects;
}

/**
 * 生成测试用的IPFS哈希
 * 
 * @returns 测试IPFS哈希
 */
export function generateTestIpfsHash(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let hash = 'Qm';
  for (let i = 0; i < 42; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * 生成测试用的交易哈希
 * 
 * @returns 测试交易哈希
 */
export function generateTestTxHash(): string {
  const prefix = '0x';
  const suffix = Array.from({ length: 64 }, () => {
    return Math.floor(Math.random() * 16).toString(16);
  }).join('');
  return `${prefix}${suffix}`;
}

/**
 * 等待指定时间（用于测试异步操作）
 * 
 * @param ms - 等待毫秒数
 * @returns Promise
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock localStorage
 */
export function createMockLocalStorage(): Storage {
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
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
}

/**
 * Mock window.ethereum
 * 
 * 注意：此函数需要在测试文件中使用vitest的vi来创建mock函数
 * 示例：
 * ```typescript
 * import { vi } from 'vitest';
 * const mockEthereum = {
 *   ...createMockEthereum(),
 *   request: vi.fn(),
 *   on: vi.fn(),
 *   removeListener: vi.fn(),
 * };
 * ```
 */
export function createMockEthereum() {
  return {
    request: () => Promise.resolve([]),
    on: () => {},
    removeListener: () => {},
    isMetaMask: true,
  };
}
