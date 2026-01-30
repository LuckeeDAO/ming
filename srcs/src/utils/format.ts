/**
 * 格式化工具函数
 * 
 * 提供各种数据格式化功能，包括：
 * - 地址格式化
 * - 数字格式化
 * - 日期格式化
 * - 文件大小格式化
 * 
 * @module utils/format
 */

/**
 * 格式化钱包地址
 * 显示为：前6位...后4位
 * 
 * @param address - 钱包地址
 * @param startLength - 开头显示长度（默认6）
 * @param endLength - 结尾显示长度（默认4）
 * @returns 格式化后的地址
 */
export function formatAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * 格式化以太坊数量
 * 将 Wei 转换为 ETH 并格式化显示
 * 
 * @param value - 以太坊数量（Wei 或 BigInt）
 * @param decimals - 小数位数（默认4）
 * @returns 格式化后的字符串
 */
export function formatEther(value: bigint | string, decimals: number = 4): string {
  const num = typeof value === 'string' ? BigInt(value) : value;
  const divisor = BigInt(10 ** 18);
  const quotient = num / divisor;
  const remainder = num % divisor;
  const decimalPart = Number(remainder) / Number(divisor);
  return `${quotient.toString()}.${decimalPart.toFixed(decimals).slice(2)}`;
}

/**
 * 格式化数字
 * 添加千位分隔符
 * 
 * @param num - 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number | string): string {
  const numStr = typeof num === 'number' ? num.toString() : num;
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化日期
 * 
 * @param date - 日期对象或时间戳
 * @param format - 格式字符串（默认 'YYYY-MM-DD HH:mm:ss'）
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | number,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化相对时间
 * 显示为：刚刚、X分钟前、X小时前等
 * 
 * @param date - 日期对象或时间戳
 * @returns 格式化后的相对时间字符串
 */
export function formatRelativeTime(date: Date | number): string {
  const now = new Date();
  const target = typeof date === 'number' ? new Date(date * 1000) : date;
  const diff = now.getTime() - target.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years}年前`;
  if (months > 0) return `${months}个月前`;
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  if (seconds > 0) return `${seconds}秒前`;
  return '刚刚';
}

/**
 * 格式化文件大小
 * 
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化百分比
 * 
 * @param value - 数值（0-1之间）
 * @param decimals - 小数位数（默认2）
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化交易哈希
 * 显示为：前10位...后8位
 * 
 * @param hash - 交易哈希
 * @returns 格式化后的哈希
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash, 10, 8);
}
