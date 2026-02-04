/**
 * 生辰日期 → 四柱八字转换服务
 *
 * 封装对 `libs/chinese-lunar` 的调用，将公历生辰日期转换为四柱八字。
 *
 * 注意：
 * - 这里只做简单封装，未处理时区差异，默认使用用户本地时间理解。
 * - 年/月/日需要是公历（阳历），小时为 0–23 的整点小时。
 *
 * @module services/energy/fourPillarsConverter
 */

// 通过 npm 安装的 chinese-lunar 库（CommonJS），使用默认导入
import lunar from '@tony801015/chinese-lunar';

import type { FourPillars } from '../../types/energy';

/**
 * 将数字补零为两位字符串
 */
const pad2 = (value: number): string =>
  value.toString().padStart(2, '0');

/**
 * 公历生辰 → 四柱八字
 *
 * @param year - 年份（西元年，例如 1992）
 * @param month - 月份（1-12）
 * @param day - 日期（1-31）
 * @param hour - 小时（0-23），24 小时制
 * @returns 四柱八字（年柱、月柱、日柱、时柱）
 */
export function convertBirthToFourPillars(
  year: number,
  month: number,
  day: number,
  hour: number
): FourPillars {
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour)
  ) {
    throw new Error('生辰日期或时间格式无效');
  }

  const yearStr = String(year);
  const monthStr = pad2(month);
  const dayStr = pad2(day);
  const hourStr = pad2(hour);

  // 使用 chinese-lunar 计算八字
  // 说明：
  // - index.js 导出的是 ApplicationLunar 构造函数
  // - lunar(year, month, day) 返回 ApplicationLunar 实例
  const app = lunar(yearStr, monthStr, dayStr);

  // 设置时辰，获取时柱
  app.setTime(hourStr);

  const json = app.getJson();

  if (
    !json.chineseYear ||
    !json.chineseMonth ||
    !json.chineseDay ||
    !json.chineseTime
  ) {
    throw new Error('无法从生辰日期计算出完整的四柱八字');
  }

  const fourPillars: FourPillars = {
    year: json.chineseYear,
    month: json.chineseMonth,
    day: json.chineseDay,
    hour: json.chineseTime,
  };

  return fourPillars;
}

