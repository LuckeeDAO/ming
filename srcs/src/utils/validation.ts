/**
 * 验证工具函数
 * 
 * 提供各种数据验证功能，包括：
 * - 地址验证
 * - 四柱八字验证
 * - 文件验证
 * - 表单验证
 * 
 * @module utils/validation
 */

/**
 * 验证EVM地址格式（0x + 40 hex）
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * 验证Solana地址格式（Base58，通常32~44位）
 */
export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * 向后兼容：默认按EVM地址验证。
 */
export function isValidAddress(address: string): boolean {
  return isValidEvmAddress(address);
}

/**
 * 按链族验证合约地址。
 *
 * @param address - 合约地址
 * @param chainFamily - evm | solana
 */
export function isValidContractAddress(
  address: string,
  chainFamily: string = 'evm'
): boolean {
  if (chainFamily.toLowerCase() === 'solana') {
    return isValidSolanaAddress(address);
  }
  return isValidEvmAddress(address);
}

/**
 * 验证四柱八字格式
 * 每柱应为2个字符（天干+地支）
 * 
 * @param pillar - 单柱字符串
 * @returns 是否为有效的四柱格式
 */
export function isValidPillar(pillar: string): boolean {
  // 天干：甲乙丙丁戊己庚辛壬癸
  const heavenlyStems = '甲乙丙丁戊己庚辛壬癸';
  // 地支：子丑寅卯辰巳午未申酉戌亥
  const earthlyBranches = '子丑寅卯辰巳午未申酉戌亥';
  
  if (pillar.length !== 2) {
    return false;
  }
  
  const [stem, branch] = pillar.split('');
  return heavenlyStems.includes(stem) && earthlyBranches.includes(branch);
}

/**
 * 验证四柱八字完整性
 * 
 * @param fourPillars - 四柱八字对象
 * @returns 是否所有柱都有效
 */
export function isValidFourPillars(fourPillars: {
  year: string;
  month: string;
  day: string;
  hour: string;
}): boolean {
  return (
    isValidPillar(fourPillars.year) &&
    isValidPillar(fourPillars.month) &&
    isValidPillar(fourPillars.day) &&
    isValidPillar(fourPillars.hour)
  );
}

/**
 * 验证文件类型
 * 
 * @param file - 文件对象
 * @param allowedTypes - 允许的文件类型数组
 * @returns 是否为允许的文件类型
 */
export function isValidFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * 验证文件大小
 * 
 * @param file - 文件对象
 * @param maxSize - 最大文件大小（字节）
 * @returns 文件大小是否在限制内
 */
export function isValidFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * 验证图片文件
 * 
 * @param file - 文件对象
 * @param maxSize - 最大文件大小（字节，默认10MB）
 * @returns 是否为有效的图片文件
 */
export function isValidImage(
  file: File,
  maxSize: number = 10 * 1024 * 1024
): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return (
    isValidFileType(file, allowedTypes) && isValidFileSize(file, maxSize)
  );
}

/**
 * 验证URL格式
 * 
 * @param url - URL字符串
 * @returns 是否为有效的URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证IPFS哈希格式
 * 
 * @param hash - IPFS哈希
 * @returns 是否为有效的IPFS哈希
 */
export function isValidIpfsHash(hash: string): boolean {
  // IPFS哈希通常是Base58编码，长度约46字符
  // 简化验证：检查是否为非空字符串且不包含特殊字符
  return /^[a-zA-Z0-9]{30,60}$/.test(hash);
}

/**
 * 验证可用于NFT元数据的Token URI（当前仅允许 ipfs:// 或 https://）
 */
export function isValidTokenURI(uri: string): boolean {
  if (!uri || typeof uri !== 'string') {
    return false;
  }
  return uri.startsWith('ipfs://') || uri.startsWith('https://');
}

/**
 * 验证邮箱格式
 * 
 * @param email - 邮箱地址
 * @returns 是否为有效的邮箱格式
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 验证非空字符串
 * 
 * @param value - 字符串值
 * @param minLength - 最小长度（默认1）
 * @param maxLength - 最大长度（可选）
 * @returns 是否为有效的非空字符串
 */
export function isValidString(
  value: string,
  minLength: number = 1,
  maxLength?: number
): boolean {
  if (!value || value.trim().length < minLength) {
    return false;
  }
  if (maxLength && value.length > maxLength) {
    return false;
  }
  return true;
}

/**
 * 验证数字范围
 * 
 * @param value - 数字值
 * @param min - 最小值（可选）
 * @param max - 最大值（可选）
 * @returns 数字是否在范围内
 */
export function isValidNumber(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  if (min !== undefined && value < min) {
    return false;
  }
  if (max !== undefined && value > max) {
    return false;
  }
  return true;
}
