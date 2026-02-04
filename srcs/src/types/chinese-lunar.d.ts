/**
 * 类型声明：@tony801015/chinese-lunar
 *
 * 官方包为 CommonJS，这里提供一个简单的默认导出函数类型，
 * 以便在 TypeScript 中通过
 *   import lunar from '@tony801015/chinese-lunar';
 * 的方式使用。
 */

declare module '@tony801015/chinese-lunar' {
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
}

