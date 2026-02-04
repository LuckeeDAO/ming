/**
 * 流年 / 流月 / 流时 级联显示算法
 *
 * 设计目标：
 * - 在已有的「纯计算」函数基础上，提供一个更贴近 UI 的“级联”数据结构
 * - 满足「月份根据年变化，时间根据日期变化」的直觉：
 *   - 选中某个年份后，只生成该年份的流月
 *   - 选中具体日期（某年某月某日）后，从该日期 + 时刻生成流时序列
 *
 * 说明：
 * - 这里不做「当前流年吉凶」等解读，只负责干支序列与基本联动逻辑
 * - 供页面或上层逻辑按需使用 / 映射到组件
 *
 * @module services/energy/fortuneCascadeService
 */

import {
  getLiuNianSequence,
  getLiuYueSequence,
  getLiuShiSequence,
  LiuNian,
  LiuYue,
  LiuShi,
} from './fortuneCycleService';

/**
 * 级联算法的入参
 */
export interface FortuneCascadeOptions {
  /**
   * 起始年份（通常可以用出生年，也可以用当前年）
   * - 若不传，则从 birthDate 中自动解析出生年
   */
  fromYear?: number;
  /**
   * 要生成多少年流年（默认 10 年）
   */
  yearsSpan?: number;
  /**
   * 当前激活的年份（用于生成流月）
   * - 若不传，则默认为 fromYear
   */
  activeYear?: number;
  /**
   * 当前激活的月份（1-12，用于决定生成流时时所用的具体日期）
   * - 若不传，则默认使用出生月份；如出生月与 activeYear 不符，会自动做“截断修正”
   */
  activeMonth?: number;
  /**
   * 当前激活的“日”（1-31，用于决定生成流时的具体日期）
   * - 若不传，则默认使用出生“日”，并在目标年月中按该月天数进行裁剪
   */
  activeDay?: number;
  /**
   * 生成流时序列时使用的起始小时（0-23）
   * - 若不传，则默认 12 点（中午），相对中性
   */
  activeHour?: number;
  /**
   * 是否生成流时序列
   * - 某些界面只需要看到流年 + 流月，此时可以设置为 false 以节省计算
   */
  includeLiuShi?: boolean;
}

/**
 * 级联算法的返回结构
 */
export interface FortuneCascadeResult {
  /**
   * 流年序列（通常从 fromYear 开始，连续 yearsSpan 年）
   */
  liuNian: LiuNian[];
  /**
   * 当前激活年份对应的 12 个月流月信息
   */
  liuYue: LiuYue[];
  /**
   * 当前激活日期对应的 12 个时辰（如未要求生成，则为 null）
   */
  liuShi: LiuShi[] | null;
  /**
   * 实际使用的“激活日期”信息，方便 UI 显示 / 高亮
   */
  active: {
    year: number;
    month: number;
    day: number;
    hour: number;
  };
}

/**
 * 安全获取某年某月的最大天数
 *
 * @param year - 公历年
 * @param month - 公历月（1-12）
 */
const getMonthMaxDay = (year: number, month: number): number => {
  // 利用 JS Date 的“0 号为上个月最后一天”的特性
  const d = new Date(year, month, 0);
  return d.getDate();
};

/**
 * 基于「出生日期 + 级联选项」生成：
 * - 从 fromYear 起的一段流年
 * - activeYear 对应的 12 个月流月
 * - activeYear-activeMonth-activeDay 对应的 12 个时辰流时
 *
 * 这实现了：
 * - 月份根据年变化（activeYear 变化，重新生成该年的 12 个月）
 * - 时间根据日期变化（activeYear/activeMonth/activeDay 变化，重新生成对应日期起的 12 个时辰）
 *
 * @param birthDate - 出生日期（YYYY-MM-DD）
 * @param opts - 级联参数选项
 */
export const buildFortuneCascade = (
  birthDate: string,
  opts: FortuneCascadeOptions = {}
): FortuneCascadeResult => {
  const [birthYearStr, birthMonthStr, birthDayStr] = birthDate.split('-');
  const birthYear = Number(birthYearStr);
  const birthMonth = Number(birthMonthStr);
  const birthDay = Number(birthDayStr);

  if (
    !Number.isFinite(birthYear) ||
    !Number.isFinite(birthMonth) ||
    !Number.isFinite(birthDay)
  ) {
    throw new Error(`无效的出生日期：${birthDate}`);
  }

  const fromYear = opts.fromYear ?? birthYear;
  const yearsSpan = opts.yearsSpan ?? 10;
  const activeYear = opts.activeYear ?? fromYear;

  // 1）流年：从 fromYear 起，生成连续 yearsSpan 年
  const liuNian = getLiuNianSequence(fromYear, yearsSpan);

  // 2）流月：基于 activeYear 生成 12 个月
  const liuYue = getLiuYueSequence(activeYear, 1, 12);

  // 3）确定用于生成流时的“实际日期”
  const baseMonth = opts.activeMonth ?? birthMonth;
  const baseDay = opts.activeDay ?? birthDay;

  // 校正月份范围为 1-12
  const safeMonth = Math.min(Math.max(baseMonth, 1), 12);
  // 在目标年月下，将“出生那一天”裁剪到当月最大天数之内
  const maxDay = getMonthMaxDay(activeYear, safeMonth);
  const safeDay = Math.min(Math.max(baseDay, 1), maxDay);

  const hour = opts.activeHour ?? 12;
  const safeHour = Math.min(Math.max(hour, 0), 23);

  // 如不需要流时，直接返回 null
  let liuShi: LiuShi[] | null = null;
  if (opts.includeLiuShi !== false) {
    const yyyy = String(activeYear);
    const mm = String(safeMonth).padStart(2, '0');
    const dd = String(safeDay).padStart(2, '0');
    const hh = String(safeHour).padStart(2, '0');
    const baseDateTime = `${yyyy}-${mm}-${dd}T${hh}:00:00`;

    liuShi = getLiuShiSequence(baseDateTime, 12);
  }

  return {
    liuNian,
    liuYue,
    liuShi,
    active: {
      year: activeYear,
      month: safeMonth,
      day: safeDay,
      hour: safeHour,
    },
  };
};

