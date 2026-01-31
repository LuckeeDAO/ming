/**
 * 验证工具函数测试
 * 
 * 测试验证函数库中的各种验证功能
 * 
 * @module __tests__/utils/validation.test
 */

import { describe, it, expect } from 'vitest';
import {
  isValidAddress,
  isValidPillar,
  isValidFourPillars,
  isValidFileType,
  isValidFileSize,
  isValidImage,
  isValidUrl,
  isValidIpfsHash,
  isValidEmail,
  isValidString,
  isValidNumber,
} from '../../utils/validation';

describe('validation', () => {
  describe('isValidAddress', () => {
    it('应该验证有效的以太坊地址', () => {
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).toBe(false);
      expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0')).toBe(true);
    });
  });

  describe('isValidPillar', () => {
    it('应该验证有效的四柱格式', () => {
      expect(isValidPillar('甲子')).toBe(true);
      expect(isValidPillar('乙丑')).toBe(true);
      expect(isValidPillar('甲')).toBe(false);
      expect(isValidPillar('甲子乙')).toBe(false);
      expect(isValidPillar('AB')).toBe(false);
    });
  });

  describe('isValidFourPillars', () => {
    it('应该验证完整的四柱八字', () => {
      expect(
        isValidFourPillars({
          year: '甲子',
          month: '乙丑',
          day: '丙寅',
          hour: '丁卯',
        })
      ).toBe(true);

      expect(
        isValidFourPillars({
          year: '甲',
          month: '乙丑',
          day: '丙寅',
          hour: '丁卯',
        })
      ).toBe(false);
    });
  });

  describe('isValidFileType', () => {
    it('应该验证文件类型', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(isValidFileType(file, ['image/jpeg', 'image/png'])).toBe(true);
      expect(isValidFileType(file, ['image/png'])).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('应该验证文件大小', () => {
      const file = new File(['x'.repeat(1000)], 'test.jpg');
      expect(isValidFileSize(file, 2000)).toBe(true);
      expect(isValidFileSize(file, 500)).toBe(false);
    });
  });

  describe('isValidImage', () => {
    it('应该验证图片文件', () => {
      const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      const txtFile = new File([''], 'test.txt', { type: 'text/plain' });

      expect(isValidImage(jpegFile)).toBe(true);
      expect(isValidImage(pngFile)).toBe(true);
      expect(isValidImage(txtFile)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('应该验证URL格式', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
    });
  });

  describe('isValidIpfsHash', () => {
    it('应该验证IPFS哈希格式', () => {
      expect(isValidIpfsHash('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG')).toBe(true);
      expect(isValidIpfsHash('invalid')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('应该验证邮箱格式', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidString', () => {
    it('应该验证字符串', () => {
      expect(isValidString('test')).toBe(true);
      expect(isValidString('')).toBe(false);
      expect(isValidString('   ')).toBe(false);
      expect(isValidString('test', 1, 10)).toBe(true);
      expect(isValidString('test', 1, 3)).toBe(false);
    });
  });

  describe('isValidNumber', () => {
    it('应该验证数字范围', () => {
      expect(isValidNumber(5)).toBe(true);
      expect(isValidNumber(5, 1, 10)).toBe(true);
      expect(isValidNumber(5, 10, 20)).toBe(false);
      expect(isValidNumber(NaN)).toBe(false);
    });
  });
});
