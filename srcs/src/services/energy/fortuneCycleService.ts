/**
 * 大运 / 流年 / 流月 / 流日 / 流时 计算服务（本地实现）
 *
 * 设计目标：
 * - 不依赖外部 AI，仅基于六十甲子序列做干支推演
 * - 提供可复用的纯函数，便于在不同页面组合使用
 * - 只负责「干支序列」计算，不负责命理文本解读
 *
 * 使用方式示例（后续可在页面或 store 中接入）：
 *
 * ```ts
 * import {
 *   getDaYunSequence,
 *   getLiuNianSequence,
 *   getLiuYueSequence,
 *   getLiuRiSequence,
 *   getLiuShiSequence,
 * } from '../../services/energy/fortuneCycleService';
 *
 * const daYun = getDaYunSequence('癸未', 'forward', 8, 8); // lifekline 风格：从 8 岁起运，推 8 步大运
 * const liuNian = getLiuNianSequence('癸未', 2024, 10);     // 从 2024 年开始，推 10 年流年干支
 * ```
 *
 * @module services/energy/fortuneCycleService
 */

// 通过 npm 安装的 chinese-lunar 库（CommonJS），使用默认导入
// 与 fourPillarsConverter 中的用法保持一致
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import lunar from '@tony801015/chinese-lunar';

/**
 * 六十甲子序列
 *
 * 说明：
 * - 主要用于大运的干支推进（按 10 年一步）
 * - 流年 / 流月 / 流日 / 流时则优先通过 chinese-lunar 逐年/逐月/逐日/逐时计算，
 *   避免手工处理节气和闰月边界
 */
const SIXTY_JIA_ZI: string[] = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
];

/**
 * 行进方向：顺行（forward）或逆行（backward）
 *
 * - 大运通常依据「年干阴阳 + 性别」确定顺逆方向
 * - 流年 / 流月 / 流日 / 流时一般按自然时间顺行，因此通常使用 'forward'
 */
export type Direction = 'forward' | 'backward';

/**
 * 大运阶段信息
 */
export interface DaYunStep {
  /** 第几步大运（从 1 开始） */
  index: number;
  /** 大运干支（如：壬戌） */
  ganZhi: string;
  /** 起运年龄（虚岁，可选） */
  startAge?: number;
  /** 结束年龄（虚岁，可选） */
  endAge?: number;
}

/**
 * 流年信息
 */
export interface LiuNian {
  year: number;     // 公历年
  ganZhi: string;   // 当年干支
}

/**
 * 流月信息
 */
export interface LiuYue {
  year: number;     // 公历年
  month: number;    // 公历月（1-12）
  ganZhi: string;   // 当月干支
}

/**
 * 流日信息
 */
export interface LiuRi {
  date: string;     // 公历日期 ISO 字符串（YYYY-MM-DD）
  ganZhi: string;   // 当日干支
}

/**
 * 流时信息
 */
export interface LiuShi {
  dateTime: string; // 公历日期时间 ISO 字符串（YYYY-MM-DDTHH:00:00）
  ganZhi: string;   // 当时干支
}

/**
 * 查找某个干支在六十甲子中的索引
 *
 * @param ganZhi - 干支（如：甲子、癸未）
 * @returns 索引（0-59），找不到时返回 -1
 */
export const getGanZhiIndex = (ganZhi: string): number => {
  return SIXTY_JIA_ZI.indexOf(ganZhi);
};

/**
 * 从六十甲子中安全地按步长移动（支持循环）
 *
 * @param startIndex - 起始索引（0-59）
 * @param step - 步长（可正可负）
 * @returns 新索引（0-59）
 */
export const moveInJiaZi = (startIndex: number, step: number): number => {
  const len = SIXTY_JIA_ZI.length; // 60
  const raw = (startIndex + step) % len;
  return raw >= 0 ? raw : raw + len;
};

/**
 * 计算大运序列（仅干支，不含命理解读）
 *
 * @param firstDaYunGanZhi - 第一轮大运干支（例如：癸未）
 * @param direction - 顺行 / 逆行（通常由年干阴阳 + 性别决定）
 * @param steps - 要推算的大运步数（默认 8 步）
 * @param startAge - 起运年龄（虚岁，可选，例如 8 岁）
 * @returns 大运步信息数组
 */
export const getDaYunSequence = (
  firstDaYunGanZhi: string,
  direction: Direction,
  steps: number = 8,
  startAge?: number
): DaYunStep[] => {
  const startIndex = getGanZhiIndex(firstDaYunGanZhi);
  if (startIndex === -1) {
    throw new Error(`无效的大运干支：${firstDaYunGanZhi}`);
  }

  const result: DaYunStep[] = [];
  const stepSign = direction === 'forward' ? 1 : -1;

  for (let i = 0; i < steps; i++) {
    const index = moveInJiaZi(startIndex, stepSign * i);
    const ganZhi = SIXTY_JIA_ZI[index];

    const step: DaYunStep = {
      index: i + 1,
      ganZhi,
    };

    if (typeof startAge === 'number') {
      // 传统上每步大运 10 年，这里采用简化版本：
      const sAge = startAge + i * 10;
      const eAge = sAge + 9;
      step.startAge = sAge;
      step.endAge = eAge;
    }

    result.push(step);
  }

  return result;
};

/**
 * 计算流年序列
 *
 * 设计说明：
 * - 原始实现逐年调用 chinese-lunar 计算年柱，受历法库年份范围限制（通常约 1900–2100）
 * - 为了支持「一生 80 年」甚至更长的推演，这里采用：
 *   1）固定锚点 + 六十甲子序列纯推演为主
 *   2）锚点选择：公历 2000 年的年柱「庚辰」（已是通用共识）
 *   3）任意年份的年柱 = 从 2000 年起，按年份差在六十甲子中前后平移
 *
 * 这样做的好处：
 * - 不再依赖历法库的年份上限，理论上可以推演任意远的过去/未来流年干支
 * - 对于「年柱干支」本身，闰年 / 闰月不会改变 60 年一轮的节奏，因此该推演在流年分析场景下是可接受的近似
 *
 * @param fromYear - 起始公历年（例如：2024）
 * @param years - 要生成多少年（默认 10 年）
 */
export const getLiuNianSequence = (
  fromYear: number,
  years: number = 10
): LiuNian[] => {
  const result: LiuNian[] = [];

  // 固定锚点：2000 年（庚辰年）
  const anchorYear = 2000;
  const anchorGanZhi = '庚辰';
  const anchorIndex = getGanZhiIndex(anchorGanZhi);

  if (anchorIndex === -1) {
    throw new Error('六十甲子序列中未找到锚点干支「庚辰」，请检查 SIXTY_JIA_ZI 配置。');
  }

  for (let i = 0; i < years; i++) {
    const year = fromYear + i;
    const offsetYears = year - anchorYear; // 可以为负数
    const index = moveInJiaZi(anchorIndex, offsetYears);
    const ganZhi = SIXTY_JIA_ZI[index];

    result.push({
      year,
      ganZhi,
    });
  }

  return result;
};

/**
 * 计算流月序列（专业版：逐月调用 chinese-lunar 计算月柱）
 *
 * 说明：
 * - 对于某个公历年 year 的每个月份 m：
 *   - 选用该月中旬日期（例如 15 日）调用 chinese-lunar：
 *     `lunar(year, mm, '15').getJson().chineseMonth`
 *   - 这样可以避开月初/月底的节气边界，大部分情况下都能落在该月的主月令范围内
 *
 * @param year - 公历年
 * @param startMonth - 起始公历月（1-12，默认 1）
 * @param months - 要生成多少个月（默认 12）
 */
export const getLiuYueSequence = (
  year: number,
  startMonth: number = 1,
  months: number = 12
): LiuYue[] => {
  const result: LiuYue[] = [];

  for (let i = 0; i < months; i++) {
    const month = startMonth + i;
    const yearStr = String(year);
    const monthStr = String(month).padStart(2, '0');

    // 取每月 15 日作为代表日
    const app = lunar(yearStr, monthStr, '15');
    const json = app.getJson();
    const ganZhi = json.chineseMonth;

    if (!ganZhi) {
      throw new Error(`无法计算 ${year}-${monthStr} 的月柱干支`);
    }

    result.push({
      year,
      month,
      ganZhi,
    });
  }

  return result;
};

/**
 * 计算流日序列（专业版：逐日调用 chinese-lunar 计算日柱）
 *
 * 说明：
 * - 调用方只需给出起始公历日期 baseDate（YYYY-MM-DD）
 * - 本函数每天递增 1 天，使用 chinese-lunar 计算当日的日柱干支
 *
 * @param baseDate - 起始日对应的公历日期（YYYY-MM-DD）
 * @param days - 要生成多少天（默认 30）
 */
export const getLiuRiSequence = (
  baseDate: string,
  days: number = 30
): LiuRi[] => {
  const base = new Date(baseDate);
  if (Number.isNaN(base.getTime())) {
    throw new Error(`无效的起始日期：${baseDate}`);
  }

  const result: LiuRi[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    const app = lunar(String(yyyy), mm, dd);
    const json = app.getJson();
    const ganZhi = json.chineseDay;

    if (!ganZhi) {
      throw new Error(`无法计算日期 ${yyyy}-${mm}-${dd} 的日柱干支`);
    }

    result.push({
      date: `${yyyy}-${mm}-${dd}`,
      ganZhi,
    });
  }

  return result;
};

/**
 * 计算流时序列（专业版：逐个“时辰”调用 chinese-lunar 计算时柱）
 *
 * 说明：
 * - 以某个整点时刻为基准 baseDateTime，按每个「时辰」（2 小时）递增
 * - 每一步都通过 chinese-lunar 计算当日当时时柱干支
 *
 * @param baseDateTime - 起始时间（YYYY-MM-DDTHH:00:00 或兼容的 Date.parse 格式）
 * @param steps - 要生成多少个时辰（默认 12 个时辰 ≈ 1 天）
 */
export const getLiuShiSequence = (
  baseDateTime: string,
  steps: number = 12
): LiuShi[] => {
  const base = new Date(baseDateTime);
  if (Number.isNaN(base.getTime())) {
    throw new Error(`无效的起始时间：${baseDateTime}`);
  }

  const result: LiuShi[] = [];

  for (let i = 0; i < steps; i++) {
    const t = new Date(base);
    // 按 2 小时一个时辰推进（简化版）
    t.setHours(base.getHours() + i * 2, 0, 0, 0);

    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    const hh = String(t.getHours()).padStart(2, '0');

    const app = lunar(String(yyyy), mm, dd);
    app.setTime(hh);
    const json = app.getJson();
    const ganZhi = json.chineseTime;

    if (!ganZhi) {
      throw new Error(`无法计算时间 ${yyyy}-${mm}-${dd}T${hh}:00:00 的时柱干支`);
    }

    result.push({
      dateTime: `${yyyy}-${mm}-${dd}T${hh}:00:00`,
      ganZhi,
    });
  }

  return result;
};

