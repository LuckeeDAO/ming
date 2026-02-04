/**
 * 类型声明：本地 chinese-lunar 库封装
 *
 * 对应实现文件：src/libs/chinese-lunar/index.js
 *
 * 说明：
 * - 该文件本身即为模块声明，供
 *   `import lunar from '../../libs/chinese-lunar/index.js'` 使用
 */

/**
 * 通过公历日期构造 chinese-lunar 实例
 *
 * @param year 西元年 YYYY
 * @param month 月 MM
 * @param day 日 DD
 */
export default function lunar(
  year: string,
  month: string,
  day: string
): any;


