/**
 * 十神分析服务
 * 
 * 基于chinese-lunar-master项目的十神算法
 * 用于计算四柱八字中每柱相对于日柱天干的十神关系
 * 
 * 十神说明：
 * - 比：比肩（同我者为比肩）
 * - 劫：劫财（同我异性者为劫财）
 * - 食：食神（我生者为食神）
 * - 傷：伤官（我生异性者为伤官）
 * - 才：偏财（我克者为偏财）
 * - 財：正财（我克异性者为正财）
 * - 殺：七杀（克我者为七杀）
 * - 官：正官（克我异性者为正官）
 * - ㄗ：偏印（生我者为偏印）
 * - 印：正印（生我异性者为正印）
 * 
 * @module services/energy/tenGodService
 */

/**
 * 十神类型
 */
export type TenGodType = '比' | '劫' | '食' | '傷' | '才' | '財' | '殺' | '官' | 'ㄗ' | '印';

/**
 * 十神完整名称映射
 */
export const TEN_GOD_NAMES: Record<TenGodType, { full: string; description: string }> = {
  '比': { full: '比肩', description: '同我同性者为比肩，代表自我、独立、竞争' },
  '劫': { full: '劫财', description: '同我异性者为劫财，代表合作、分享、竞争' },
  '食': { full: '食神', description: '我生同性者为食神，代表才华、表达、享受' },
  '傷': { full: '伤官', description: '我生异性者为伤官，代表创新、叛逆、才华' },
  '才': { full: '偏财', description: '我克同性者为偏财，代表意外之财、投资、投机' },
  '財': { full: '正财', description: '我克异性者为正财，代表稳定收入、理财、节俭' },
  '殺': { full: '七杀', description: '克我同性者为七杀，代表压力、挑战、权威' },
  '官': { full: '正官', description: '克我异性者为正官，代表责任、地位、约束' },
  'ㄗ': { full: '偏印', description: '生我同性者为偏印，代表学习、思考、神秘' },
  '印': { full: '正印', description: '生我异性者为正印，代表保护、教育、贵人' },
};

/**
 * 天干数组
 */
const DECIMAL_CYCLE: string[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/**
 * 地支数组
 */
const DUODECIMAL_CYCLE: string[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 地支藏干映射表
 * 基于 chinese-lunar-master/src/config.js 中的 cangGan 数组
 * 索引对应地支：子丑寅卯辰巳午未申酉戌亥
 */
const BRANCH_HIDDEN_STEMS: string[] = [
  '癸',        // 子
  '己癸辛',    // 丑（三个藏干）
  '甲丙戊',    // 寅（三个藏干）
  '乙',        // 卯
  '戊乙癸',    // 辰（三个藏干）
  '丙戊庚',    // 巳（三个藏干）
  '丁己',      // 午（两个藏干）
  '己乙丁',    // 未（三个藏干）
  '庚壬癸',    // 申（三个藏干）
  '辛',        // 酉
  '戊辛丁',    // 戌（三个藏干）
  '壬甲',      // 亥（两个藏干）
];

/**
 * 十神查找表
 * 基于chinese-lunar-master/src/config.js中的tenGod数组
 * 行索引：配（with）天干的索引
 * 列索引：命（life）天干的索引
 * 
 * 十神顺序：['比', '劫', '食', '傷', '才', '財', '殺', '官', 'ㄗ', '印']
 */
const TEN_GOD_TABLE: TenGodType[][] = [
  ['比', '劫', '食', '傷', '才', '財', '殺', '官', 'ㄗ', '印'], // 甲
  ['劫', '比', '傷', '食', '財', '才', '官', '殺', '印', 'ㄗ'], // 乙
  ['ㄗ', '印', '比', '劫', '食', '傷', '才', '財', '殺', '官'], // 丙
  ['印', 'ㄗ', '劫', '比', '傷', '食', '財', '才', '官', '殺'], // 丁
  ['殺', '官', 'ㄗ', '印', '比', '劫', '食', '傷', '才', '財'], // 戊
  ['官', '殺', '印', 'ㄗ', '劫', '比', '傷', '食', '財', '才'], // 己
  ['才', '財', '殺', '官', 'ㄗ', '印', '比', '劫', '食', '傷'], // 庚
  ['財', '才', '官', '殺', '印', 'ㄗ', '劫', '比', '傷', '食'], // 辛
  ['食', '傷', '才', '財', '殺', '官', 'ㄗ', '印', '比', '劫'], // 壬
  ['傷', '食', '財', '才', '官', '殺', '印', 'ㄗ', '劫', '比'], // 癸
];

/**
 * 十神分析服务类
 */
class TenGodService {
  /**
   * 查找十神
   * 
   * @param dayStem - 日柱天干（命主）
   * @param pillarStem - 要查询的柱的天干
   * @returns 十神类型
   */
  findTenGod(dayStem: string, pillarStem: string): TenGodType | null {
    const dayIndex = DECIMAL_CYCLE.indexOf(dayStem);
    const pillarIndex = DECIMAL_CYCLE.indexOf(pillarStem);

    if (dayIndex === -1 || pillarIndex === -1) {
      console.warn(`Invalid stem: dayStem=${dayStem}, pillarStem=${pillarStem}`);
      return null;
    }

    // 根据 chinese-lunar-master 的定义：
    // 行索引为「命主（日干）」天干，列索引为「配」天干
    // 因此应当以 dayIndex 作为行索引，pillarIndex 作为列索引
    return TEN_GOD_TABLE[dayIndex][pillarIndex];
  }

  /**
   * 获取地支的藏干列表
   * 
   * @param branch - 地支（如：子、丑、寅等）
   * @returns 藏干天干列表（字符串数组，每个字符代表一个天干）
   */
  getBranchHiddenStems(branch: string): string[] {
    const branchIndex = DUODECIMAL_CYCLE.indexOf(branch);
    if (branchIndex === -1) {
      console.warn(`Invalid branch: ${branch}`);
      return [];
    }
    const hiddenStemsStr = BRANCH_HIDDEN_STEMS[branchIndex];
    // 将字符串拆分为单个天干字符数组
    return hiddenStemsStr.split('');
  }

  /**
   * 计算地支藏干的十神列表
   * 
   * @param dayStem - 日柱天干（命主）
   * @param branch - 地支
   * @returns 藏干十神列表
   */
  calculateBranchTenGods(dayStem: string, branch: string): Array<{ stem: string; tenGod: TenGodType | null }> {
    const hiddenStems = this.getBranchHiddenStems(branch);
    return hiddenStems.map((stem) => ({
      stem,
      tenGod: this.findTenGod(dayStem, stem),
    }));
  }

  /**
   * 计算四柱的十神（包含天干和地支藏干）
   * 
   * @param fourPillars - 四柱八字数据
   * @returns 四柱十神数据（包含天干和地支藏干）
   */
  calculateTenGods(fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  }): {
    year: TenGodType | null;
    yearBranch: Array<{ stem: string; tenGod: TenGodType | null }>;
    month: TenGodType | null;
    monthBranch: Array<{ stem: string; tenGod: TenGodType | null }>;
    day: TenGodType | null;
    dayBranch: Array<{ stem: string; tenGod: TenGodType | null }>;
    hour: TenGodType | null;
    hourBranch: Array<{ stem: string; tenGod: TenGodType | null }>;
  } {
    // 日柱天干作为命主
    const dayStem = fourPillars.day.charAt(0);

    // 提取各柱的地支（第二个字符）
    const yearBranch = fourPillars.year.charAt(1);
    const monthBranch = fourPillars.month.charAt(1);
    const dayBranch = fourPillars.day.charAt(1);
    const hourBranch = fourPillars.hour.charAt(1);

    return {
      // 天干十神
      year: this.findTenGod(dayStem, fourPillars.year.charAt(0)),
      month: this.findTenGod(dayStem, fourPillars.month.charAt(0)),
      day: this.findTenGod(dayStem, fourPillars.day.charAt(0)), // 日柱对日柱，应该是"比"
      hour: this.findTenGod(dayStem, fourPillars.hour.charAt(0)),
      // 地支藏干十神
      yearBranch: this.calculateBranchTenGods(dayStem, yearBranch),
      monthBranch: this.calculateBranchTenGods(dayStem, monthBranch),
      dayBranch: this.calculateBranchTenGods(dayStem, dayBranch),
      hourBranch: this.calculateBranchTenGods(dayStem, hourBranch),
    };
  }

  /**
   * 获取十神的完整信息
   * 
   * @param tenGod - 十神类型
   * @returns 十神完整信息
   */
  getTenGodInfo(tenGod: TenGodType | null): { full: string; description: string } | null {
    if (!tenGod) return null;
    return TEN_GOD_NAMES[tenGod];
  }

  /**
   * 分析十神格局
   * 根据十神分布判断命理格局（包含天干和地支藏干）
   * 
   * @param tenGods - 四柱十神数据（包含天干和地支藏干）
   * @returns 格局分析结果（包含计算过程）
   */
  analyzePattern(tenGods: {
    year: TenGodType | null;
    yearBranch: Array<{ stem: string; tenGod: TenGodType | null }>;
    month: TenGodType | null;
    monthBranch: Array<{ stem: string; tenGod: TenGodType | null }>;
    day: TenGodType | null;
    dayBranch: Array<{ stem: string; tenGod: TenGodType | null }>;
    hour: TenGodType | null;
    hourBranch: Array<{ stem: string; tenGod: TenGodType | null }>;
  }): {
    dominantTenGod: TenGodType | null;
    pattern: string;
    description: string;
    characteristics: string[];
    calculationProcess?: {
      steps: Array<{
        step: number;
        description: string;
        details: Record<string, any>;
      }>;
      tenGodCounts: Record<TenGodType, number>;
      pillarDetails: Array<{
        pillar: string;
        stemTenGod: TenGodType | null;
        branchTenGods: Array<{ stem: string; tenGod: TenGodType | null }>;
      }>;
    };
  } {
    const steps: Array<{ step: number; description: string; details: Record<string, any> }> = [];

    // 步骤1：初始化十神计数
    const counts: Record<TenGodType, number> = {
      '比': 0,
      '劫': 0,
      '食': 0,
      '傷': 0,
      '才': 0,
      '財': 0,
      '殺': 0,
      '官': 0,
      'ㄗ': 0,
      '印': 0,
    };
    steps.push({
      step: 1,
      description: '初始化十神计数表',
      details: {
        counts: { ...counts },
        note: '所有十神初始计数为 0',
      },
    });

    // 步骤2：统计天干十神
    const stemCounts: Record<string, TenGodType | null> = {};
    if (tenGods.year) {
      counts[tenGods.year]++;
      stemCounts['年柱天干'] = tenGods.year;
    }
    if (tenGods.month) {
      counts[tenGods.month]++;
      stemCounts['月柱天干'] = tenGods.month;
    }
    if (tenGods.day) {
      counts[tenGods.day]++;
      stemCounts['日柱天干'] = tenGods.day;
    }
    if (tenGods.hour) {
      counts[tenGods.hour]++;
      stemCounts['时柱天干'] = tenGods.hour;
    }
    steps.push({
      step: 2,
      description: '统计天干十神',
      details: {
        stemTenGods: stemCounts,
        updatedCounts: { ...counts },
      },
    });

    // 步骤3：统计地支藏干十神
    const branchCounts: Record<string, Array<{ stem: string; tenGod: TenGodType | null }>> = {};
    tenGods.yearBranch.forEach(({ tenGod }) => {
      if (tenGod) counts[tenGod]++;
    });
    branchCounts['年柱藏干'] = tenGods.yearBranch;
    tenGods.monthBranch.forEach(({ tenGod }) => {
      if (tenGod) counts[tenGod]++;
    });
    branchCounts['月柱藏干'] = tenGods.monthBranch;
    tenGods.dayBranch.forEach(({ tenGod }) => {
      if (tenGod) counts[tenGod]++;
    });
    branchCounts['日柱藏干'] = tenGods.dayBranch;
    tenGods.hourBranch.forEach(({ tenGod }) => {
      if (tenGod) counts[tenGod]++;
    });
    branchCounts['时柱藏干'] = tenGods.hourBranch;
    steps.push({
      step: 3,
      description: '统计地支藏干十神',
      details: {
        branchTenGods: branchCounts,
        updatedCounts: { ...counts },
      },
    });

    // 步骤4：找出出现次数最多的十神
    let maxCount = 0;
    let dominantTenGod: TenGodType | null = null;
    const sortedCounts = Object.entries(counts)
      .map(([tenGod, count]) => ({ tenGod: tenGod as TenGodType, count }))
      .sort((a, b) => b.count - a.count);
    
    if (sortedCounts.length > 0 && sortedCounts[0].count > 0) {
      maxCount = sortedCounts[0].count;
      dominantTenGod = sortedCounts[0].tenGod;
    }
    
    steps.push({
      step: 4,
      description: '找出主导十神',
      details: {
        sortedCounts: sortedCounts.map(({ tenGod, count }) => ({
          tenGod,
          count,
          name: TEN_GOD_NAMES[tenGod].full,
        })),
        dominantTenGod: dominantTenGod ? {
          tenGod: dominantTenGod,
          count: maxCount,
          name: TEN_GOD_NAMES[dominantTenGod].full,
        } : null,
      },
    });

    // 如果所有十神分布较为平均（最高只出现 0 或 1 次），则认为没有明显格局
    // 此时不强行给出某个十神格局，而是返回普通格局且不设置 dominantTenGod
    if (!dominantTenGod || maxCount <= 1) {
      steps.push({
        step: 5,
        description: '判断格局类型',
        details: {
          judgment: '十神分布较为平均，无明显主导格局',
          pattern: '普通格局',
        },
      });
      return {
        dominantTenGod: null,
        pattern: '普通格局',
        description: '十神分布较为平均，暂无明显以某一十神为主导的专门格局，可视为普通格局。',
        characteristics: [],
        calculationProcess: {
          steps,
          tenGodCounts: counts,
          pillarDetails: [
            {
              pillar: '年柱',
              stemTenGod: tenGods.year,
              branchTenGods: tenGods.yearBranch,
            },
            {
              pillar: '月柱',
              stemTenGod: tenGods.month,
              branchTenGods: tenGods.monthBranch,
            },
            {
              pillar: '日柱',
              stemTenGod: tenGods.day,
              branchTenGods: tenGods.dayBranch,
            },
            {
              pillar: '时柱',
              stemTenGod: tenGods.hour,
              branchTenGods: tenGods.hourBranch,
            },
          ],
        },
      };
    }

    // 步骤5：根据主导十神判断格局
    let pattern = '普通格局';
    let description = '';
    const characteristics: string[] = [];

    if (dominantTenGod) {
      const info = TEN_GOD_NAMES[dominantTenGod as TenGodType];
      pattern = `${info.full}格局`;
      description = `命局以${info.full}为主导，${info.description}`;

      // 根据十神特点添加特征
      switch (dominantTenGod) {
        case '比':
          characteristics.push('独立自主', '竞争意识强', '需要合作平衡');
          break;
        case '劫':
          characteristics.push('善于合作', '需要独立空间', '注意竞争关系');
          break;
        case '食':
          characteristics.push('才华横溢', '表达能力强', '享受生活');
          break;
        case '傷':
          characteristics.push('创新思维', '不拘一格', '需要约束');
          break;
        case '才':
          characteristics.push('投资眼光', '意外机遇', '需要稳定');
          break;
        case '財':
          characteristics.push('理财能力强', '收入稳定', '注重积累');
          break;
        case '殺':
          characteristics.push('压力较大', '挑战性强', '需要化解');
          break;
        case '官':
          characteristics.push('责任感强', '地位意识', '需要平衡');
          break;
        case 'ㄗ':
          characteristics.push('学习能力强', '思考深入', '需要实践');
          break;
        case '印':
          characteristics.push('贵人相助', '保护意识', '需要独立');
          break;
      }
    }

    steps.push({
      step: 5,
      description: '判断格局类型',
      details: {
        dominantTenGod: dominantTenGod ? {
          tenGod: dominantTenGod,
          name: TEN_GOD_NAMES[dominantTenGod].full,
          count: maxCount,
        } : null,
        pattern,
        description,
        characteristics,
      },
    });

    return {
      dominantTenGod,
      pattern,
      description,
      characteristics,
      calculationProcess: {
        steps,
        tenGodCounts: counts,
        pillarDetails: [
          {
            pillar: '年柱',
            stemTenGod: tenGods.year,
            branchTenGods: tenGods.yearBranch,
          },
          {
            pillar: '月柱',
            stemTenGod: tenGods.month,
            branchTenGods: tenGods.monthBranch,
          },
          {
            pillar: '日柱',
            stemTenGod: tenGods.day,
            branchTenGods: tenGods.dayBranch,
          },
          {
            pillar: '时柱',
            stemTenGod: tenGods.hour,
            branchTenGods: tenGods.hourBranch,
          },
        ],
      },
    };
  }
}

/**
 * 十神基础影响系数（主文档《细节说明（参数公式与数据表）.md》16.2节）
 *
 * 每种十神对日主有一个基础影响系数，用于将「节点能量」映射到「对日主的综合影响值」
 */
export const TEN_GOD_BASE_COEFFICIENTS: Record<TenGodType, { base: number; range: number; description: string }> = {
  '比': { base: 1.00, range: 0.20, description: '直接帮扶' },
  '劫': { base: 1.20, range: 0.25, description: '强帮扶，易夺财' },
  '食': { base: -0.70, range: 0.15, description: '温和泄气' },
  '傷': { base: -1.00, range: 0.20, description: '强烈泄气' },
  '財': { base: -0.60, range: 0.12, description: '温和耗气' },
  '才': { base: -0.80, range: 0.15, description: '强烈耗气' },
  '官': { base: -0.90, range: 0.18, description: '约束克制' },
  '殺': { base: -1.50, range: 0.30, description: '强烈克伐' },
  '印': { base: 0.90, range: 0.18, description: '生扶持续' },
  'ㄗ': { base: 1.00, range: 0.20, description: '生扶强烈' },
};

/**
 * 十神相互作用矩阵（主文档《细节说明（参数公式与数据表）.md》16.3节）
 *
 * 矩阵值 `M[i][j]` 表示：**十神 i 对 十神 j 的直接作用系数**
 * 顺序：比肩 劫财 食神 伤官 正财 偏财 正官 七杀 正印 偏印
 */
export const TEN_GOD_INTERACTION_MATRIX: number[][] = [
  // 比肩 劫财 食神 伤官 正财 偏财 正官 七杀 正印 偏印
  [+0.15, +0.10, -0.10, -0.15, -0.40, -0.50, -0.10, -0.30, -0.10, -0.08], // 比肩
  [+0.10, +0.25, -0.15, -0.20, -0.60, -0.70, -0.15, -0.25, -0.08, -0.06], // 劫财
  [-0.05, -0.10, +0.10, +0.05, +0.20, +0.15, -0.35, -0.45, -0.10, -0.15], // 食神
  [-0.10, -0.15, +0.05, +0.20, +0.15, +0.20, -0.50, -0.60, -0.20, -0.25], // 伤官
  [-0.15, -0.20, +0.15, +0.10, +0.12, +0.08, +0.15, +0.25, -0.08, -0.12], // 正财
  [-0.25, -0.30, +0.10, +0.15, +0.08, +0.18, +0.25, +0.35, -0.12, -0.15], // 偏财
  [-0.05, -0.08, -0.30, -0.40, +0.15, +0.20, +0.15, +0.05, +0.20, +0.10], // 正官
  [-0.20, -0.22, -0.40, -0.50, +0.25, +0.30, +0.05, +0.30, +0.30, +0.20], // 七杀
  [+0.40, +0.35, -0.12, -0.20, -0.08, -0.10, +0.20, +0.30, +0.20, +0.15], // 正印
  [+0.30, +0.25, -0.25, -0.30, -0.10, -0.12, +0.10, +0.20, +0.15, +0.25], // 偏印
];

/**
 * 十神索引映射（用于矩阵查找）
 */
const TEN_GOD_INDEX_MAP: Record<TenGodType, number> = {
  '比': 0,
  '劫': 1,
  '食': 2,
  '傷': 3,
  '財': 4,
  '才': 5,
  '官': 6,
  '殺': 7,
  '印': 8,
  'ㄗ': 9,
};

/**
 * 特殊十神组合函数（主文档《细节说明（参数公式与数据表）.md》16.4节）
 */
export interface TenGodCombination {
  name: string;
  description: string;
  check: (tenGods: Record<TenGodType, number>) => boolean;
  apply: (tenGods: Record<TenGodType, number>) => Record<TenGodType, number>;
}

/**
 * 杀印相生组合
 * 条件：七杀与正印/偏印同时出现且能量足够
 */
export const KILL_PRINT_COMBINATION: TenGodCombination = {
  name: '杀印相生',
  description: '七杀与印星相生，化杀为权',
  check: (tenGods) => {
    const killEnergy = tenGods['殺'] || 0;
    const printEnergy = (tenGods['印'] || 0) + (tenGods['ㄗ'] || 0);
    return killEnergy > 0.8 && printEnergy > 0.6;
  },
  apply: (tenGods) => {
    const killEnergy = tenGods['殺'] || 0;
    const printEnergy = (tenGods['印'] || 0) + (tenGods['ㄗ'] || 0);
    const gain = (killEnergy + printEnergy) * 0.3;
    return {
      ...tenGods,
      '殺': killEnergy * 0.5, // 七杀系数减半
      '印': (tenGods['印'] || 0) * 1.5 + gain * 0.6, // 正印系数增强
      'ㄗ': (tenGods['ㄗ'] || 0) * 1.5 + gain * 0.4, // 偏印系数增强
    };
  },
};

/**
 * 伤官配印组合
 * 条件：伤官与正印同时出现且能量足够
 */
export const HURT_PRINT_COMBINATION: TenGodCombination = {
  name: '伤官配印',
  description: '伤官与正印相配，化伤为才',
  check: (tenGods) => {
    const hurtEnergy = tenGods['傷'] || 0;
    const printEnergy = tenGods['印'] || 0;
    return hurtEnergy > 0.7 && printEnergy > 0.5;
  },
  apply: (tenGods) => {
    return {
      ...tenGods,
      '傷': (tenGods['傷'] || 0) * 0.6, // 伤官系数减弱
      '印': (tenGods['印'] || 0) * 1.4, // 正印系数增强
    };
  },
};

/**
 * 食神制杀组合
 * 条件：七杀与食神同时出现且能量足够
 */
export const FOOD_KILL_COMBINATION: TenGodCombination = {
  name: '食神制杀',
  description: '食神制七杀，化杀为权',
  check: (tenGods) => {
    const killEnergy = tenGods['殺'] || 0;
    const foodEnergy = tenGods['食'] || 0;
    return killEnergy > 0.8 && foodEnergy > 0.6;
  },
  apply: (tenGods) => {
    return {
      ...tenGods,
      '殺': (tenGods['殺'] || 0) * 0.7, // 七杀系数减弱
      '食': (tenGods['食'] || 0) * 1.2, // 食神系数增强
    };
  },
};

/**
 * 比劫夺财组合
 * 条件：比肩/劫财与财星同时出现且能量足够
 */
export const COMPARE_WEALTH_COMBINATION: TenGodCombination = {
  name: '比劫夺财',
  description: '比劫夺财，耗力增加',
  check: (tenGods) => {
    const compareEnergy = (tenGods['比'] || 0) + (tenGods['劫'] || 0);
    const wealthEnergy = (tenGods['財'] || 0) + (tenGods['才'] || 0);
    return compareEnergy > 0.5 && wealthEnergy > 0.4;
  },
  apply: (tenGods) => {
    return {
      ...tenGods,
      '財': (tenGods['財'] || 0) * 1.3, // 正财耗力增加
      '才': (tenGods['才'] || 0) * 1.3, // 偏财耗力增加
      '比': (tenGods['比'] || 0) * 0.9, // 比肩帮扶减弱
      '劫': (tenGods['劫'] || 0) * 0.9, // 劫财帮扶减弱
    };
  },
};

/**
 * 计算十神对日主的综合影响
 *
 * @param tenGods - 十神能量分布（归一化后的能量值，0-1范围）
 * @param useInteractionMatrix - 是否使用相互作用矩阵（默认 true）
 * @param useCombinations - 是否应用特殊组合函数（默认 true）
 * @returns 日主综合影响值（正值为帮扶，负值为耗泄）
 */
export function calculateTenGodImpact(
  tenGods: Record<TenGodType, number>,
  useInteractionMatrix = true,
  useCombinations = true,
): {
  totalImpact: number;
  baseImpact: number;
  interactionImpact: number;
  combinationImpact: number;
  appliedCombinations: string[];
} {
  // 1. 基础影响（一阶影响）
  let baseImpact = 0;
  (Object.keys(tenGods) as TenGodType[]).forEach((tenGod) => {
    const energy = tenGods[tenGod] || 0;
    const coeff = TEN_GOD_BASE_COEFFICIENTS[tenGod];
    baseImpact += energy * coeff.base;
  });

  // 2. 相互作用矩阵影响（二阶影响）
  let interactionImpact = 0;
  if (useInteractionMatrix) {
    (Object.keys(tenGods) as TenGodType[]).forEach((sourceTenGod) => {
      const sourceEnergy = tenGods[sourceTenGod] || 0;
      const sourceIndex = TEN_GOD_INDEX_MAP[sourceTenGod];
      (Object.keys(tenGods) as TenGodType[]).forEach((targetTenGod) => {
        const targetEnergy = tenGods[targetTenGod] || 0;
        const targetIndex = TEN_GOD_INDEX_MAP[targetTenGod];
        const interactionCoeff = TEN_GOD_INTERACTION_MATRIX[sourceIndex][targetIndex];
        interactionImpact += sourceEnergy * targetEnergy * interactionCoeff;
      });
    });
  }

  // 3. 特殊组合函数影响
  let combinationImpact = 0;
  const appliedCombinations: string[] = [];
  let adjustedTenGods = { ...tenGods };

  if (useCombinations) {
    const combinations = [
      KILL_PRINT_COMBINATION,
      HURT_PRINT_COMBINATION,
      FOOD_KILL_COMBINATION,
      COMPARE_WEALTH_COMBINATION,
    ];

    combinations.forEach((combination) => {
      if (combination.check(adjustedTenGods)) {
        adjustedTenGods = combination.apply(adjustedTenGods);
        appliedCombinations.push(combination.name);

        // 计算组合带来的影响变化
        let beforeImpact = 0;
        let afterImpact = 0;
        (Object.keys(tenGods) as TenGodType[]).forEach((tenGod) => {
          const coeff = TEN_GOD_BASE_COEFFICIENTS[tenGod];
          beforeImpact += (tenGods[tenGod] || 0) * coeff.base;
          afterImpact += (adjustedTenGods[tenGod] || 0) * coeff.base;
        });
        combinationImpact += afterImpact - beforeImpact;
      }
    });
  }

  const totalImpact = baseImpact + interactionImpact + combinationImpact;

  return {
    totalImpact,
    baseImpact,
    interactionImpact,
    combinationImpact,
    appliedCombinations,
  };
}

// 导出单例
export const tenGodService = new TenGodService();
export default tenGodService;
