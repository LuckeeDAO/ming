/**
 * 格式化工具函数测试
 * 
 * 测试格式化函数库中的各种格式化功能
 * 
 * @module __tests__/utils/format.test
 */

import { describe, it, expect } from 'vitest';
import {
  formatAddress,
  formatEther,
  formatNumber,
  formatDate,
  formatRelativeTime,
  formatFileSize,
  formatPercent,
  formatTxHash,
} from '../../utils/format';

describe('format', () => {
  describe('formatAddress', () => {
    it('应该格式化钱包地址', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0';
      const formatted = formatAddress(address);
      
      expect(formatted).toContain('...');
      expect(formatted.length).toBeLessThan(address.length);
    });

    it('应该处理短地址', () => {
      const address = '0x1234';
      const formatted = formatAddress(address);
      
      expect(formatted).toBe(address);
    });
  });

  describe('formatEther', () => {
    it('应该格式化以太坊数量', () => {
      const value = BigInt('1000000000000000000'); // 1 ETH
      const formatted = formatEther(value);
      
      expect(formatted).toContain('1.');
    });
  });

  describe('formatNumber', () => {
    it('应该添加千位分隔符', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('应该处理字符串数字', () => {
      expect(formatNumber('1000')).toBe('1,000');
    });
  });

  describe('formatDate', () => {
    it('应该格式化日期', () => {
      const date = new Date('2024-01-01T12:00:00');
      const formatted = formatDate(date);
      
      expect(formatted).toContain('2024');
      expect(formatted).toContain('01');
    });

    it('应该使用自定义格式', () => {
      const date = new Date('2024-01-01T12:00:00');
      const formatted = formatDate(date, 'YYYY-MM-DD');
      
      expect(formatted).toBe('2024-01-01');
    });
  });

  describe('formatRelativeTime', () => {
    it('应该格式化相对时间', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      
      const formatted = formatRelativeTime(oneMinuteAgo);
      expect(formatted).toContain('分钟前');
    });

    it('应该显示"刚刚"', () => {
      const now = new Date();
      const formatted = formatRelativeTime(now);
      
      expect(formatted).toBe('刚刚');
    });
  });

  describe('formatFileSize', () => {
    it('应该格式化文件大小', () => {
      expect(formatFileSize(1024)).toContain('KB');
      expect(formatFileSize(1024 * 1024)).toContain('MB');
      expect(formatFileSize(0)).toBe('0 B');
    });
  });

  describe('formatPercent', () => {
    it('应该格式化百分比', () => {
      expect(formatPercent(0.5)).toBe('50.00%');
      expect(formatPercent(0.123, 1)).toBe('12.3%');
    });
  });

  describe('formatTxHash', () => {
    it('应该格式化交易哈希', () => {
      const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const formatted = formatTxHash(hash);
      
      expect(formatted).toContain('...');
      expect(formatted.length).toBeLessThan(hash.length);
    });
  });
});
