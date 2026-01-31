/**
 * 辅助工具函数测试
 * 
 * 测试工具函数库中的各种辅助功能
 * 
 * @module __tests__/utils/helpers.test
 */

import { describe, it, expect, vi } from 'vitest';
import {
  sleep,
  debounce,
  throttle,
  deepClone,
  generateId,
  pick,
  omit,
  groupBy,
  unique,
  safeJsonParse,
  safeJsonStringify,
  isEmpty,
  getErrorMessage,
} from '../../utils/helpers';

describe('helpers', () => {
  describe('sleep', () => {
    it('应该延迟指定的时间', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90);
    });
  });

  describe('debounce', () => {
    it('应该在指定时间后执行函数', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      await sleep(150);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该在多次调用时只执行最后一次', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      await sleep(150);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });
  });

  describe('throttle', () => {
    it('应该限制函数执行频率', async () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      await sleep(150);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('deepClone', () => {
    it('应该深拷贝对象', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('应该深拷贝数组', () => {
      const arr = [1, { a: 2 }, [3, 4]];
      const cloned = deepClone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
    });

    it('应该处理Date对象', () => {
      const date = new Date();
      const cloned = deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });
  });

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it('应该包含前缀', () => {
      const id = generateId('test');
      expect(id).toContain('test');
    });
  });

  describe('pick', () => {
    it('应该提取指定键', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = pick(obj, ['a', 'c']);

      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('应该排除指定键', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = omit(obj, ['b']);

      expect(result).toEqual({ a: 1, c: 3 });
      expect(result).not.toHaveProperty('b');
    });
  });

  describe('groupBy', () => {
    it('应该按键分组', () => {
      const arr = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];
      const result = groupBy(arr, (item) => item.type);

      expect(result.a).toHaveLength(2);
      expect(result.b).toHaveLength(1);
    });
  });

  describe('unique', () => {
    it('应该去重数组', () => {
      const arr = [1, 2, 2, 3, 3, 3];
      const result = unique(arr);

      expect(result).toEqual([1, 2, 3]);
    });

    it('应该使用键函数去重', () => {
      const arr = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' },
      ];
      const result = unique(arr, (item) => item.id);

      expect(result).toHaveLength(2);
    });
  });

  describe('safeJsonParse', () => {
    it('应该解析有效JSON', () => {
      const result = safeJsonParse('{"a":1}', {});
      expect(result).toEqual({ a: 1 });
    });

    it('应该在解析失败时返回默认值', () => {
      const defaultValue = {};
      const result = safeJsonParse('invalid json', defaultValue);
      expect(result).toBe(defaultValue);
    });
  });

  describe('safeJsonStringify', () => {
    it('应该序列化对象', () => {
      const result = safeJsonStringify({ a: 1 });
      expect(result).toBe('{"a":1}');
    });

    it('应该在序列化失败时返回默认值', () => {
      const circular: any = {};
      circular.self = circular;
      const result = safeJsonStringify(circular, '{}');
      expect(result).toBe('{}');
    });
  });

  describe('isEmpty', () => {
    it('应该检测null和undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('应该检测空字符串', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
    });

    it('应该检测空数组', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('应该检测空对象', () => {
      expect(isEmpty({})).toBe(true);
    });
  });

  describe('getErrorMessage', () => {
    it('应该从Error对象提取消息', () => {
      const error = new Error('test error');
      expect(getErrorMessage(error)).toBe('test error');
    });

    it('应该处理字符串错误', () => {
      expect(getErrorMessage('string error')).toBe('string error');
    });

    it('应该处理未知错误', () => {
      expect(getErrorMessage({})).toBe('未知错误');
    });
  });
});
