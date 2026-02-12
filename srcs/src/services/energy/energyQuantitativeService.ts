/**
 * 八字五行能量计算（V2 量化版主流程）
 *
 * 参考：
 * - docs/04-开发指南/八字五行能量计算.md
 * - docs/temp/pwer2.txt
 *
 * 说明：
 * - 这里实现的是 TypeScript 版本的主流程与核心处理函数
 * - 与现有 V1 计数版算法并存，通过 energyAnalysisService 进行封装和映射
 */

import type { FourPillars } from '../../types/energy.js';
import {
  DEFAULT_ENERGY_CONFIG,
  EnergyCalculationConfig,
  FiveElement,
  FiveElementNode,
  GlobalState,
  NodeType,
  Polarity,
  ElementRelation,
  EnergyLogEntry,
} from './energyNodes.js';

/**
 * 天干列表与五行、阴阳映射
 */
const STEMS: string[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

const STEM_ELEMENT_MAP: Record<string, FiveElement> = {
  甲: 'wood',
  乙: 'wood',
  丙: 'fire',
  丁: 'fire',
  戊: 'earth',
  己: 'earth',
  庚: 'metal',
  辛: 'metal',
  壬: 'water',
  癸: 'water',
};

const STEM_POLARITY_MAP: Record<string, Polarity> = {
  甲: 'YANG',
  丙: 'YANG',
  戊: 'YANG',
  庚: 'YANG',
  壬: 'YANG',
  乙: 'YIN',
  丁: 'YIN',
  己: 'YIN',
  辛: 'YIN',
  癸: 'YIN',
};

/**
 * 地支列表、五行、阴阳映射（使用主气）
 */
const BRANCHES: string[] = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
];

const BRANCH_MAIN_ELEMENT_MAP: Record<string, FiveElement> = {
  子: 'water',
  丑: 'earth',
  寅: 'wood',
  卯: 'wood',
  辰: 'earth',
  巳: 'fire',
  午: 'fire',
  未: 'earth',
  申: 'metal',
  酉: 'metal',
  戌: 'earth',
  亥: 'water',
};

const BRANCH_POLARITY_MAP: Record<string, Polarity> = {
  子: 'YANG',
  丑: 'YIN',
  寅: 'YANG',
  卯: 'YIN',
  辰: 'YANG',
  巳: 'YIN',
  午: 'YANG',
  未: 'YIN',
  申: 'YANG',
  酉: 'YIN',
  戌: 'YANG',
  亥: 'YIN',
};

// 说明：完整的「地支藏干 → 得根/得令」量化逻辑将在后续版本接入。
// 为避免当前编译报未使用错误，暂不在此处保留具体藏干表常量。

/**
 * 地支藏干简化分配表：
 *
 * - 每个地支节点初始拥有 branchBaseEnergy（默认 1200）总能量
 * - 该总能量按五行属性比例拆分到最多 3 个五行属性上
 * - 映射来源于 docs 约定，用于在当前版本中近似表示藏干能量分布
 */
const BRANCH_ELEMENT_DISTRIBUTION: Record<
  string,
  Partial<Record<FiveElement, number>>
> = {
  子: { water: 1.0 },
  丑: { earth: 0.6, metal: 0.3, water: 0.1 },
  寅: { wood: 0.6, fire: 0.3, earth: 0.1 },
  卯: { wood: 1.0 },
  辰: { earth: 0.6, wood: 0.3, water: 0.1 },
  巳: { fire: 0.6, metal: 0.3, earth: 0.1 },
  午: { fire: 0.7, earth: 0.3 },
  未: { earth: 0.6, fire: 0.3, wood: 0.1 },
  申: { metal: 0.6, water: 0.3, earth: 0.1 },
  酉: { metal: 1.0 },
  戌: { earth: 0.6, metal: 0.3, fire: 0.1 },
  亥: { water: 0.7, wood: 0.3 },
};

/**
 * 五行相生关系（木→火→土→金→水→木）
 */
const GENERATE_MAP: Record<FiveElement, FiveElement> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

/**
 * 五行相克关系（木克土、土克水、水克火、火克金、金克木）
 */
const CONTROL_MAP: Record<FiveElement, FiveElement> = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
};

/**
 * 月令旺衰校正综合表（主文档《基础能量计算.md》3.2 节）
 *
 * 说明：
 * - 已将旺相休囚死 + 寒暖燥湿等季节性影响全部合并为单一系数；
 * - 这里直接按「月令地支 → 五行 → 系数」编码为数值表，作为初始化口径的一部分；
 * - 默认实现中不再叠加旧版的得令强弱系数，避免重复放大/缩小。
 */
const MONTH_ELEMENT_COEFFICIENTS: Record<
  string,
  Partial<Record<FiveElement, number>>
> = {
  // 春季：寅、卯、辰
  寅: { wood: 1.2, fire: 1.1, earth: 0.48, metal: 0.66, water: 0.8 },
  卯: { wood: 1.2, fire: 1.1, earth: 0.48, metal: 0.66, water: 0.8 },
  辰: { wood: 0.6, fire: 0.88, earth: 1.44, metal: 1.1, water: 0.4 },

  // 夏季：巳、午、未
  巳: { fire: 1.08, earth: 1.0, metal: 0.52, water: 0.78, wood: 0.72 },
  午: { fire: 1.08, earth: 1.0, metal: 0.52, water: 0.78, wood: 0.72 },
  未: { fire: 0.72, earth: 1.2, metal: 1.3, water: 0.52, wood: 0.54 },

  // 秋季：申、酉、戌
  申: { metal: 1.2, water: 1.1, wood: 0.44, fire: 0.66, earth: 0.8 },
  酉: { metal: 1.2, water: 1.1, wood: 0.44, fire: 0.66, earth: 0.8 },
  戌: { metal: 0.6, water: 0.88, wood: 0.66, fire: 1.1, earth: 1.2 },

  // 冬季：亥、子、丑
  亥: { water: 1.08, wood: 1.0, fire: 0.52, earth: 0.78, metal: 0.72 },
  子: { water: 1.08, wood: 1.0, fire: 0.52, earth: 0.78, metal: 0.72 },
  丑: { water: 0.54, wood: 0.4, fire: 0.78, earth: 1.56, metal: 0.9 },
};

/**
 * 天干合化与结果五行（常见组合，简化版）
 *
 * 说明：这里只列出最常用的五合，且默认合化结果五行如下：
 * - 甲己合土
 * - 乙庚合金
 * - 丙辛合水
 * - 丁壬合木
 * - 戊癸合火
 */
const STEM_COMBINATION_RESULT: Record<string, FiveElement> = {
  '甲-己': 'earth',
  '己-甲': 'earth',
  '乙-庚': 'metal',
  '庚-乙': 'metal',
  '丙-辛': 'water',
  '辛-丙': 'water',
  '丁-壬': 'wood',
  '壬-丁': 'wood',
  '戊-癸': 'fire',
  '癸-戊': 'fire',
};

/**
 * 地支六冲（简化版）
 */
const BRANCH_CLASH_PAIRS: Array<[string, string]> = [
  ['子', '午'],
  ['丑', '未'],
  ['寅', '申'],
  ['卯', '酉'],
  ['辰', '戌'],
  ['巳', '亥'],
];

/**
 * 地支六害对照表（主文档《细节说明（参数公式与数据表）.md》14.4节）
 *
 * 六害：子未、丑午、寅巳、卯辰、申亥、酉戌
 * 处理方式：按系数扣减能量（类似六冲但更温和），k_harm = 0.10~0.20
 */
const BRANCH_HARM_PAIRS: Array<[string, string]> = [
  ['子', '未'],
  ['丑', '午'],
  ['寅', '巳'],
  ['卯', '辰'],
  ['申', '亥'],
  ['酉', '戌'],
];

/**
 * 地支三刑对照表（主文档《细节说明（参数公式与数据表）.md》14.4节）
 *
 * 三刑（常用口径）：
 * - 寅刑巳、巳刑申、申刑寅（无恩之刑）
 * - 丑刑戌、戌刑未、未刑丑（恃势之刑）
 * - 子刑卯（无礼之刑）
 * 处理方式：按系数扣减能量，k_punish = 0.15~0.30
 */
const BRANCH_PUNISH_TRIPLES: Array<[string, string, string]> = [
  ['寅', '巳', '申'], // 无恩之刑（循环三刑）
  ['丑', '戌', '未'], // 恃势之刑（循环三刑）
];

const BRANCH_PUNISH_PAIRS: Array<[string, string]> = [
  ['子', '卯'], // 无礼之刑
];

/**
 * 地支自刑对照表（主文档《细节说明（参数公式与数据表）.md》14.4节）
 *
 * 自刑：辰辰、午午、酉酉、亥亥
 * 处理方式：按系数扣减能量，k_selfPunish = 0.10~0.20
 */
const BRANCH_SELF_PUNISH: string[] = ['辰', '午', '酉', '亥'];

/**
 * 18×18 位置作用矩阵（主文档《细节说明（参数公式与数据表）.md》4.8.4节）
 *
 * 矩阵含义：`Matrix[i][j]` 表示"位置 i 对位置 j 的作用强度"。
 * 索引约定：
 * - 0 年干, 1 年支, 2 月干, 3 月支, 4 日干, 5 日支, 6 时干, 7 时支
 * - 8 大运干, 9 大运支, 10 流年干, 11 流年支, 12 流月干, 13 流月支
 * - 14 流日干, 15 流日支, 16 流时干, 17 流时支
 *
 * 说明：
 * - 当前版本仅实现本命四柱（0-7），动态层（8-17）暂未接入
 * - 矩阵值用于在边权重计算中额外乘上 `M[from][to]`
 * - 可通过配置 `enablePositionMatrix` 开关控制是否启用
 */
const POSITION_INTERACTION_MATRIX: number[][] = [
  // 行\列 0年干 1年支 2月干 3月支 4日干 5日支 6时干 7时支 8大运干 9大运支 10流年干 11流年支 12流月干 13流月支 14流日干 15流日支 16流时干 17流时支
  [1.0, 1.0, 0.8, 0.0, 0.4, 0.0, 0.2, 0.0, 0.0, 0.0, 0.6, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // 0年干
  [1.0, 1.0, 0.0, 0.8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.6, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // 1年支
  [0.8, 0.0, 1.0, 1.0, 0.8, 0.0, 0.4, 0.0, 0.0, 0.0, 0.4, 0.0, 0.6, 0.0, 0.0, 0.0, 0.0, 0.0], // 2月干
  [0.0, 0.8, 1.0, 1.0, 0.0, 0.8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.0, 0.6, 0.0, 0.0, 0.0, 0.0], // 3月支
  [0.4, 0.0, 0.8, 0.0, 1.0, 1.0, 0.8, 0.0, 0.0, 0.0, 0.6, 0.0, 0.4, 0.0, 0.6, 0.0, 0.4, 0.0], // 4日干
  [0.0, 0.0, 0.0, 0.8, 1.0, 1.0, 0.0, 0.8, 0.0, 0.0, 0.0, 0.6, 0.0, 0.4, 0.0, 0.6, 0.0, 0.4], // 5日支
  [0.2, 0.0, 0.4, 0.0, 0.8, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.0, 0.6, 0.0], // 6时干
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.0, 0.6], // 7时支
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.8, 0.0, 0.6, 0.0, 0.4, 0.0, 0.2, 0.0], // 8大运干
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.8, 0.0, 0.6, 0.0, 0.4, 0.0, 0.2], // 9大运支
  [0.6, 0.0, 0.4, 0.0, 0.6, 0.0, 0.0, 0.0, 0.8, 0.0, 1.0, 1.0, 0.8, 0.0, 0.6, 0.0, 0.4, 0.0], // 10流年干
  [0.0, 0.6, 0.0, 0.4, 0.0, 0.6, 0.0, 0.0, 0.0, 0.8, 1.0, 1.0, 0.0, 0.8, 0.0, 0.6, 0.0, 0.4], // 11流年支
  [0.0, 0.0, 0.6, 0.0, 0.4, 0.0, 0.0, 0.0, 0.6, 0.0, 0.8, 0.0, 1.0, 1.0, 0.8, 0.0, 0.6, 0.0], // 12流月干
  [0.0, 0.0, 0.0, 0.6, 0.0, 0.4, 0.0, 0.0, 0.0, 0.6, 0.0, 0.8, 1.0, 1.0, 0.0, 0.8, 0.0, 0.6], // 13流月支
  [0.0, 0.0, 0.0, 0.0, 0.6, 0.0, 0.4, 0.0, 0.4, 0.0, 0.6, 0.0, 0.8, 0.0, 1.0, 1.0, 0.8, 0.0], // 14流日干
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.6, 0.0, 0.4, 0.0, 0.4, 0.0, 0.6, 0.0, 0.8, 1.0, 1.0, 0.0, 0.8], // 15流日支
  [0.0, 0.0, 0.0, 0.0, 0.4, 0.0, 0.6, 0.0, 0.2, 0.0, 0.4, 0.0, 0.6, 0.0, 0.8, 0.0, 1.0, 1.0], // 16流时干
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.0, 0.6, 0.0, 0.2, 0.0, 0.4, 0.0, 0.6, 0.0, 0.8, 1.0, 1.0], // 17流时支
];

/**
 * 获取节点在18×18位置作用矩阵中的索引
 *
 * @param node - 节点对象
 * @returns 位置索引（0-17），如果节点位置不在矩阵范围内，返回 -1
 */
function getPositionIndex(node: FiveElementNode): number {
  const { pillarIndex, positionType } = node.position;

  // 本命四柱（0-7）
  if (pillarIndex >= 0 && pillarIndex <= 3) {
    const baseIndex = pillarIndex * 2;
    return positionType === 'stem' ? baseIndex : baseIndex + 1;
  }

  // 动态层（8-17）暂未接入，返回 -1 表示不在矩阵范围内
  return -1;
}

/**
 * 获取位置作用矩阵系数
 *
 * @param fromNode - 发出影响的节点
 * @param toNode - 接受影响的节点
 * @param enableMatrix - 是否启用位置作用矩阵（默认 false，仅使用位置权重）
 * @returns 位置作用矩阵系数（如果启用矩阵且节点在矩阵范围内，返回矩阵值；否则返回 1.0）
 */
function getPositionMatrixCoeff(
  fromNode: FiveElementNode,
  toNode: FiveElementNode,
  enableMatrix = false,
): number {
  if (!enableMatrix) {
    return 1.0; // 不启用矩阵时，返回 1.0（不影响边权重计算）
  }

  const fromIndex = getPositionIndex(fromNode);
  const toIndex = getPositionIndex(toNode);

  // 如果任一节点不在矩阵范围内，返回 1.0
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= 18 || toIndex >= 18) {
    return 1.0;
  }

  return POSITION_INTERACTION_MATRIX[fromIndex][toIndex];
}

/**
 * 本命位置权重（主文档 4.8.1，本命 L1~L8）
 *
 * - 这里只实现本命四柱的 8 个基础位置权重；
 * - 动态层（大运/流年等）的 18×18 位置作用矩阵已实现，但当前版本仅用于本命四柱。
 */
function getPositionWeight(node: FiveElementNode): number {
  const { pillarIndex, positionType } = node.position;

  // 年、月、日、时 × 干/支
  if (pillarIndex === 0 && positionType === 'stem') return 0.35; // 年干
  if (pillarIndex === 0 && positionType === 'branch') return 0.3; // 年支
  if (pillarIndex === 1 && positionType === 'stem') return 0.8; // 月干
  if (pillarIndex === 1 && positionType === 'branch') return 1.0; // 月支（月令）
  if (pillarIndex === 2 && positionType === 'stem') return 1.0; // 日干（日主）
  if (pillarIndex === 2 && positionType === 'branch') return 0.9; // 日支
  if (pillarIndex === 3 && positionType === 'stem') return 0.7; // 时干
  if (pillarIndex === 3 && positionType === 'branch') return 0.5; // 时支

  // 兜底：未知位置按中等权重处理
  return 1.0;
}

/**
 * 地支合化规则（摘自 hch.txt 的简化可编程版本）
 *
 * 说明：
 * - 仅处理单图中最多出现一次的典型三会/三合/六合/半合组合
 * - 不考虑“遇冲则破”等更复杂情况（可在后续版本扩展）
 */
type BranchCombinationKind = 'threeMeeting' | 'threeHarmony' | 'sixCombine' | 'halfCombine';

interface BranchCombinationRule {
  /** 合化类型：三会/三合/六合/半合 */
  kind: BranchCombinationKind;
  /** 参与的地支名称列表（顺序用于匹配，不影响能量分配） */
  branches: string[];
  /** 合化目标五行 */
  targetElement: FiveElement;
  /** 三合局中的中神（仅三合需要） */
  centerBranch?: string;
  /** 成功时基础贡献比例 p_contrib_base */
  baseContrib: number;
  /** 成功时基础外部吸收比例 p_external_base */
  baseExternal: number;
  /** 合而不化时的衰减系数（成功时效果的多少倍，例如 0.3 表示 30%） */
  decayFactor: number;
}

const BRANCH_COMBINATIONS: BranchCombinationRule[] = [
  // 三会局：寅卯辰木局、巳午未火局、申酉戌金局、亥子丑水局
  { kind: 'threeMeeting', branches: ['寅', '卯', '辰'], targetElement: 'wood', baseContrib: 0.8, baseExternal: 0.8, decayFactor: 0.3 },
  { kind: 'threeMeeting', branches: ['巳', '午', '未'], targetElement: 'fire', baseContrib: 0.8, baseExternal: 0.8, decayFactor: 0.3 },
  { kind: 'threeMeeting', branches: ['申', '酉', '戌'], targetElement: 'metal', baseContrib: 0.8, baseExternal: 0.8, decayFactor: 0.3 },
  { kind: 'threeMeeting', branches: ['亥', '子', '丑'], targetElement: 'water', baseContrib: 0.8, baseExternal: 0.8, decayFactor: 0.3 },

  // 三合局：申子辰水局、亥卯未木局、寅午戌火局、巳酉丑金局
  { kind: 'threeHarmony', branches: ['申', '子', '辰'], targetElement: 'water', centerBranch: '子', baseContrib: 0.7, baseExternal: 0.7, decayFactor: 0.2 },
  { kind: 'threeHarmony', branches: ['亥', '卯', '未'], targetElement: 'wood', centerBranch: '卯', baseContrib: 0.7, baseExternal: 0.7, decayFactor: 0.2 },
  { kind: 'threeHarmony', branches: ['寅', '午', '戌'], targetElement: 'fire', centerBranch: '午', baseContrib: 0.7, baseExternal: 0.7, decayFactor: 0.2 },
  { kind: 'threeHarmony', branches: ['巳', '酉', '丑'], targetElement: 'metal', centerBranch: '酉', baseContrib: 0.7, baseExternal: 0.7, decayFactor: 0.2 },

  // 六合：子丑土、寅亥木、卯戌火、辰酉金、巳申水、午未土
  { kind: 'sixCombine', branches: ['子', '丑'], targetElement: 'earth', baseContrib: 0.5, baseExternal: 0.5, decayFactor: 0.25 },
  { kind: 'sixCombine', branches: ['寅', '亥'], targetElement: 'wood', baseContrib: 0.5, baseExternal: 0.5, decayFactor: 0.25 },
  { kind: 'sixCombine', branches: ['卯', '戌'], targetElement: 'fire', baseContrib: 0.5, baseExternal: 0.5, decayFactor: 0.25 },
  { kind: 'sixCombine', branches: ['辰', '酉'], targetElement: 'metal', baseContrib: 0.5, baseExternal: 0.5, decayFactor: 0.25 },
  { kind: 'sixCombine', branches: ['巳', '申'], targetElement: 'water', baseContrib: 0.5, baseExternal: 0.5, decayFactor: 0.25 },
  { kind: 'sixCombine', branches: ['午', '未'], targetElement: 'earth', baseContrib: 0.5, baseExternal: 0.5, decayFactor: 0.25 },

  // 半合局：水木火金四局的生地/墓地半合
  // 水局：申子 / 子辰
  { kind: 'halfCombine', branches: ['申', '子'], targetElement: 'water', baseContrib: 0.6, baseExternal: 0.6, decayFactor: 0.15 },
  { kind: 'halfCombine', branches: ['子', '辰'], targetElement: 'water', baseContrib: 0.6, baseExternal: 0.6, decayFactor: 0.15 },
  // 木局：亥卯 / 卯未
  { kind: 'halfCombine', branches: ['亥', '卯'], targetElement: 'wood', baseContrib: 0.6, baseExternal: 0.6, decayFactor: 0.15 },
  { kind: 'halfCombine', branches: ['卯', '未'], targetElement: 'wood', baseContrib: 0.6, baseExternal: 0.6, decayFactor: 0.15 },
  // 火局：寅午 / 午戌
  { kind: 'halfCombine', branches: ['寅', '午'], targetElement: 'fire', baseContrib: 0.6, baseExternal: 0.6, decayFactor: 0.15 },
  { kind: 'halfCombine', branches: ['午', '戌'], targetElement: 'fire', baseContrib: 0.6, baseExternal: 0.6, decayFactor: 0.15 },
  // 金局：巳酉 / 酉丑
  { kind: 'halfCombine', branches: ['巳', '酉'], targetElement: 'metal', baseContrib: 0.6, baseExternal: 0.6, decayFactor: 0.15 },
  { kind: 'halfCombine', branches: ['酉', '丑'], targetElement: 'metal', baseContrib: 0.6, baseExternal: 0.6, decayFactor: 0.15 },
];

/**
 * 简化版：根据月令判断合化强度（只区分“合化成功 / 合而不化”）
 *
 * - 目前先用于天干五合与三合局的目标五行判断，返回：
 *   - 1.0：目标五行在本月“帝旺”当令 → 视为合化成立
 *   - 0.2：否则 → 仅按成功时约 1/5 的比例进行能量聚合（合而不化）
 *
 * 说明：
 * - 该实现对应 POWER4.txt 中的 get_simple_strength 思路；
 * - 后续可按 comboType 扩展更精细的 get_combination_strength 规则。
 */
function getSimpleCombinationStrength(
  targetElement: FiveElement,
  monthBranch: string,
): number {
  const diWangMap: Record<FiveElement, string> = {
    wood: '卯',
    fire: '午',
    metal: '酉',
    water: '子',
    earth: '子',
  };
  const diWangBranch = diWangMap[targetElement];
  if (!diWangBranch) return 0.2;
  return monthBranch === diWangBranch ? 1.0 : 0.2;
}

/**
 * 计算地支合化强度（成功 / 合而不化 / 无效）
 *
 * 返回值：
 * - 1.0      ：合化成功（按 baseContrib/baseExternal 全量处理）
 * - decay    ：合而不化（按成功时 decay 倍进行弱合处理）
 * - 0        ：不构成有效合化（直接跳过）
 */
function getBranchCombinationStrength(
  rule: BranchCombinationRule,
  monthBranch: string,
  monthElement: FiveElement | undefined,
): number {
  if (!monthElement) return 0;

  if (rule.kind === 'threeMeeting') {
    // 三会：月令必须在对应季节三支之一
    return rule.branches.includes(monthBranch) ? 1.0 : rule.decayFactor;
  }

  if (rule.kind === 'threeHarmony') {
    // 三合：中神当令或得月令生扶
    const center = rule.centerBranch;
    if (!center) return 0;
    const centerElement = BRANCH_MAIN_ELEMENT_MAP[center];
    if (!centerElement) return 0;

    const same = centerElement === monthElement;
    const supported = GENERATE_MAP[monthElement] === centerElement;
    if (same || supported) return 1.0;
    return rule.decayFactor;
  }

  if (rule.kind === 'sixCombine' || rule.kind === 'halfCombine') {
    // 六合/半合：目标五行当令或得生即可
    const target = rule.targetElement;
    const same = target === monthElement;
    const supported = GENERATE_MAP[monthElement] === target;
    if (same || supported) return 1.0;
    if (rule.kind === 'halfCombine') {
      // 半合条件最宽松，可接受更多“合而不化”的情形
      return rule.decayFactor;
    }
    // 六合不满足时视为合而不化的可能性略低，可直接用 decay 也可以 0，这里采用 decay
    return rule.decayFactor;
  }

  return 0;
}

/**
 * 计算阴阳浮动系数
 *
 * 规则（当前版本为 pwer2 基础版）：
 * - 相生 / 相克统一规则：
 *   - 同阳：+sameYangDelta（默认 +3%）
 *   - 同阴：sameYinDelta（默认 -3%）
 *   - 阴阳不同：0
 */
export function calcPolarityDelta(
  source: FiveElementNode,
  target: FiveElementNode,
  config: EnergyCalculationConfig,
): number {
  if (source.polarity === 'YANG' && target.polarity === 'YANG') {
    return config.sameYangDelta;
  }
  if (source.polarity === 'YIN' && target.polarity === 'YIN') {
    return config.sameYinDelta;
  }
  return 0;
}

/**
 * 根据干支字符与位置推断节点基础属性
 */
function createNodeFromChar(
  ch: string,
  options: {
    pillarIndex: 0 | 1 | 2 | 3;
    nodeType: NodeType;
    config: EnergyCalculationConfig;
  },
): FiveElementNode | null {
  const { pillarIndex, nodeType, config } = options;

  if (nodeType === 'stem') {
    if (!STEMS.includes(ch)) return null;
    const element = STEM_ELEMENT_MAP[ch];
    const polarity = STEM_POLARITY_MAP[ch];
    if (!element || !polarity) return null;
    return new FiveElementNode({
      name: ch,
      nodeType: 'stem',
      position: { pillarIndex, positionType: 'stem' },
      originalElement: element,
      polarity,
      baseEnergy: config.stemBaseEnergy,
    });
  }

  // branch
  if (!BRANCHES.includes(ch)) return null;
  const element = BRANCH_MAIN_ELEMENT_MAP[ch];
  const polarity = BRANCH_POLARITY_MAP[ch];
  if (!element || !polarity) return null;
  return new FiveElementNode({
    name: ch,
    nodeType: 'branch',
    position: { pillarIndex, positionType: 'branch' },
    originalElement: element,
    polarity,
    // 具体能量将在 initBaziNodes 中按 BRANCH_ELEMENT_DISTRIBUTION 拆分到各属性
    baseEnergy: 0,
  });
}

/**
 * 初始化八字节点：
 * 1. 解析四柱（年、月、日、时）的天干地支
 * 2. 创建天干/地支节点
 * 3. 设置基础能量（天干 1000，地支 1200）
 * 4. 标记日主节点（便于后续扩展）
 *
 * 提示：
 * - 得根/得令、藏干比例等高级调整暂作为后续扩展，在此版本中不做复杂放大，
 *   仅保留接口和藏干表，避免一次性引入过多参数导致不可控。
 */
export function initBaziNodes(
  fourPillars: FourPillars,
  config: EnergyCalculationConfig = DEFAULT_ENERGY_CONFIG,
): GlobalState {
  const state = new GlobalState(config);
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];

  pillars.forEach((pillar, pillarIndex) => {
    const stem = pillar.charAt(0);
    const branch = pillar.charAt(1);

    const stemNode = createNodeFromChar(stem, {
      pillarIndex: pillarIndex as 0 | 1 | 2 | 3,
      nodeType: 'stem',
      config,
    });
    if (stemNode) {
      if (pillarIndex === 2) {
        // 日主
        stemNode.setFlag('isDayMaster', true);
      }
      state.nodes.push(stemNode);
    }

    const branchNode = createNodeFromChar(branch, {
      pillarIndex: pillarIndex as 0 | 1 | 2 | 3,
      nodeType: 'branch',
      config,
    });
    if (branchNode) {
      state.nodes.push(branchNode);

      // 按简化藏干分配表拆分地支基础能量（R_{n,e}）
      const dist = BRANCH_ELEMENT_DISTRIBUTION[branch];
      if (dist) {
        Object.entries(dist).forEach(([el, ratio]) => {
          const r = Number(ratio);
          if (!el || !Number.isFinite(r) || r <= 0) return;
          const element = el as FiveElement;
          const delta = config.branchBaseEnergy * r;
          branchNode.updateEnergy(element, delta, config);
        });
      } else {
        // 兜底：若未配置，则全部能量给主五行属性
        const mainElement = BRANCH_MAIN_ELEMENT_MAP[branch];
        if (mainElement) {
          branchNode.updateEnergy(mainElement, config.branchBaseEnergy, config);
        }
      }
    }
  });

  // 保存基准能量快照（应用得根得气和月令校正之前，用于调试）
  state.baseNodeSnapshots = state.nodes.map((node) => ({
    name: node.name,
    nodeType: node.nodeType,
    position: { ...node.position },
    originalElement: node.originalElement,
    polarity: node.polarity,
    totalEnergy: node.getTotalEnergy(),
    energies: { ...node.getAllEnergies() },
  }));

  // 基础能量初始化完成后，按统一口径应用：
  // 1. 月令旺衰校正表（S_month）
  // 2. 得根 / 得气
  // 3. 透干
  applyRootQiPenetrationAndOrderAdjustments(state, fourPillars.month.charAt(1));

  return state;
}

/**
 * 在初始化阶段统一应用：
 * - 月令旺衰校正表：基于《基础能量计算.md》3.2，将旺相休囚死 + 调候合并为单一系数；
 * - 得根 / 得气：基于“本柱地支藏干分布”为对应天干提供基础加成；
 * - 透干：地支某五行在任一天干中被“透出”时，对应地支该属性能量略有增强。
 *
 * 说明：
 * - 与旧版实现相比，这里不再额外叠加基于月令主气的得令强弱系数，
 *   避免与月令旺衰综合表重复修正。
 */
function applyRootQiPenetrationAndOrderAdjustments(
  state: GlobalState,
  monthBranch: string,
): void {
  const { config } = state;

  const stemNodes = state.nodes.filter((n) => n.nodeType === 'stem');
  const branchNodes = state.nodes.filter((n) => n.nodeType === 'branch');

  // 0. 得根 / 得气：针对天干，检查所有地支的藏干分布
  // 先应用得根得气（基于初始能量），再应用月令校正
  // 优先检查同柱地支（得根），其次检查其他地支（得气）
  for (const stem of stemNodes) {
    // 先检查同柱地支（得根）
    const samePillarBranch = branchNodes.find(
      (b) => b.position.pillarIndex === stem.position.pillarIndex,
    );
    
    let factor = 1;
    let foundRoot = false;
    
    // 同柱地支：得根（系数1.5）
    if (samePillarBranch) {
      const dist = BRANCH_ELEMENT_DISTRIBUTION[samePillarBranch.name];
      if (dist) {
        const ratio = dist[stem.originalElement] ?? 0;
        if (ratio >= 0.6) {
          // 本气同五行：视为"得根"
          factor = config.rootGainFactor;
          foundRoot = true;
        } else if (ratio >= 0.2) {
          // 次气同五行：视为"得气"（同柱得气，系数稍高）
          factor = config.qiGainFactor;
          foundRoot = true;
        }
      }
    }
    
    // 如果同柱没有得根，检查其他地支（得气）
    if (!foundRoot) {
      for (const branch of branchNodes) {
        if (branch.position.pillarIndex === stem.position.pillarIndex) continue; // 跳过同柱
        const dist = BRANCH_ELEMENT_DISTRIBUTION[branch.name];
        if (!dist) continue;
        const ratio = dist[stem.originalElement] ?? 0;
        if (ratio >= 0.2) {
          // 其他地支有同五行：视为"得气"（跨柱得气，系数稍低）
          // 使用 qiGainFactor 的 80% 作为跨柱得气系数
          factor = 1 + (config.qiGainFactor - 1) * 0.8; // 例如：1.2 -> 1.16
          break; // 找到一个即可
        }
      }
    }

    if (factor !== 1) {
      const current = stem.getElementEnergy(stem.originalElement);
      if (current > 0) {
        const delta = current * (factor - 1);
        stem.updateEnergy(stem.originalElement, delta, config);
      }
    }
  }

  // 1. 月令旺衰校正（统一尺度）：按「月令 × 五行」表直接缩放各属性能量
  // 在得根得气之后应用，这样计算过程更清晰
  const monthTable = MONTH_ELEMENT_COEFFICIENTS[monthBranch];
  if (monthTable) {
    for (const node of state.nodes) {
      const all = node.getAllEnergies();
      (Object.keys(all) as FiveElement[]).forEach((el) => {
        const coeff = monthTable[el];
        if (coeff === undefined) return;
        const current = node.getElementEnergy(el);
        if (current <= 0) return;
        const delta = current * (coeff - 1);
        node.updateEnergy(el, delta, config);
      });
    }
  }

  // 2. 透干：若某地支属性在任一天干中"透出"，则对应地支该属性能量略增
  const stemElements = new Set<FiveElement>(
    stemNodes.map((s) => s.originalElement),
  );

  for (const branch of branchNodes) {
    const energies = branch.getAllEnergies();
    (Object.keys(energies) as FiveElement[]).forEach((el) => {
      if (!stemElements.has(el)) return;
      const current = branch.getElementEnergy(el);
      if (current <= 0) return;
      const delta = current * (config.penetrationFactor - 1);
      branch.updateEnergy(el, delta, config);
    });
  }
}

/**
 * 处理合化关系：
 * - 当前仅处理天干五合（后续可扩展到三会/三合/六合/半合）
 * - 根据 POWER3/POWER4：区分“合化成功（strength=1.0）/ 合而不化（strength=0.2）”
 * - 成功时按基础比例聚合；不成功时按成功时约 20% 的比例进行能量聚合
 * - 按新属性回写到双方节点，并标记为 `combined`
 */
export function handleCombinations(
  state: GlobalState,
  monthBranch: string,
): void {
  const { config } = state;

  const branchNodes = state.nodes.filter((n) => n.nodeType === 'branch');
  const stemNodes = state.nodes.filter((n) => n.nodeType === 'stem');
  const monthElement = BRANCH_MAIN_ELEMENT_MAP[monthBranch];

  /**
   * 地支：按优先级依次尝试三会 → 三合 → 六合 → 半合
   * - 对于已参与过任意一种合化的节点（combined=true），不再参与其他合化
   */
  const branchPriority: BranchCombinationKind[] = [
    'threeMeeting',
    'threeHarmony',
    'sixCombine',
    'halfCombine',
  ];

  for (const kind of branchPriority) {
    const rules = BRANCH_COMBINATIONS.filter((r) => r.kind === kind);

    for (const rule of rules) {
      // 为当前规则查找参与的地支节点
      const candidates: FiveElementNode[] = [];
      for (const br of rule.branches) {
        const node = branchNodes.find(
          (n) => n.name === br && !n.hasFlag('combined'),
        );
        if (!node) {
          candidates.length = 0;
          break;
        }
        candidates.push(node);
      }
      if (candidates.length !== rule.branches.length) continue;

      // 计算本次合化强度
      const strength = getBranchCombinationStrength(
        rule,
        monthBranch,
        monthElement,
      );
      if (strength <= 0) continue;

      const pContrib = rule.baseContrib * strength;
      // 应用全局外部能量吸收比例参数
      const pExternal = rule.baseExternal * strength * config.globalExternalEnergyRatio;

      // 统一合化流程：贡献 + 外部吸收 + 按贡献比例分配
      const contributions = candidates.map((node) => {
        const total = node.getTotalEnergy();
        return total > 0 ? total * pContrib : 0;
      });

      const totalContribution = contributions.reduce(
        (sum, v) => sum + v,
        0,
      );
      if (totalContribution <= 0) continue;

      let pool = totalContribution;
      pool += pool * pExternal;

      // 从现有属性中按比例扣减贡献能量
      candidates.forEach((node, idx) => {
        const c = contributions[idx];
        if (c <= 0) return;
        node.distributeEnergy(-c, config);
      });

      // 按贡献比例从能量池中回填到目标五行属性
      candidates.forEach((node, idx) => {
        const c = contributions[idx];
        if (c <= 0) return;
        const shareRatio = c / totalContribution;
        const share = pool * shareRatio;
        node.updateEnergy(rule.targetElement, share, config);
        node.setFlag('combined', true);
      });
    }
  }

  for (let i = 0; i < stemNodes.length; i++) {
    for (let j = i + 1; j < stemNodes.length; j++) {
      const a = stemNodes[i];
      const b = stemNodes[j];
      const key = `${a.name}-${b.name}`;
      const resultElement = STEM_COMBINATION_RESULT[key];
      if (!resultElement) continue;

      const aTotal = a.getTotalEnergy();
      const bTotal = b.getTotalEnergy();
      if (aTotal <= 0 || bTotal <= 0) continue;

      // 根据月令判断合化强度（1.0=完全合化，0.2=合而不化，仅部分聚合）
      const strength = getSimpleCombinationStrength(resultElement, monthBranch);
      if (strength <= 0) continue;

      const contributionRatio =
        config.combinationContributionRatio * strength;
      // 应用全局外部能量吸收比例参数
      const externalRatio = config.combinationExternalGain * strength * config.globalExternalEnergyRatio;

      const aContribution = aTotal * contributionRatio;
      const bContribution = bTotal * contributionRatio;
      let pool = aContribution + bContribution;
      // 外部能量吸收（受 strength 和全局参数调节）
      pool += pool * externalRatio;

      // 从原属性扣除
      a.distributeEnergy(-aContribution, config);
      b.distributeEnergy(-bContribution, config);

      // 按新属性回写到双方节点：各分一半
      const half = pool / 2;
      a.updateEnergy(resultElement, half, config);
      b.updateEnergy(resultElement, half, config);

      a.setFlag('combined', true);
      b.setFlag('combined', true);
    }
  }
}

/**
 * 建立属性级别的相生/相克关系网络：
 * 1. 遍历所有节点，基于原始属性构建五行元素列表
 * 2. 对每个源属性，找到被生/被克的目标属性对应节点
 * 3. 记录为 ElementRelation 列表，并按「年干→年支→月干→月支→日干→日支→时干→时支」排序
 */
export function buildRelations(state: GlobalState): void {
  const nodes = state.nodes;
  const generateRelations: ElementRelation[] = [];
  const controlRelations: ElementRelation[] = [];

  const orderScore = (n: FiveElementNode): number => {
    // pillarIndex: 0=年,1=月,2=日,3=时
    // positionType: 干优先于支
    const base = n.position.pillarIndex * 2;
    const offset = n.position.positionType === 'stem' ? 0 : 1;
    return base + offset;
  };

  // 默认口径：生克网络仅在“可跨柱的作用节点”之间建立。
  // 参考主文档 8.2：天干↔天干建边，地支主要通过结构关系体现，不额外建立普通跨柱生克链。
  const candidateNodes = nodes.filter((n) => n.nodeType === 'stem');

  for (const source of candidateNodes) {
    // 按“属性级别”建立关系：遍历节点当前拥有的所有属性能量
    const sourceEnergies = source.getAllEnergies();
    (Object.keys(sourceEnergies) as FiveElement[]).forEach((sourceElement) => {
      const generateTargetElement = GENERATE_MAP[sourceElement];
      const controlTargetElement = CONTROL_MAP[sourceElement];

      for (const target of candidateNodes) {
        if (target === source) continue;
        const targetEnergies = target.getAllEnergies();

        if (
          generateTargetElement &&
          targetEnergies[generateTargetElement] !== undefined
        ) {
          generateRelations.push({
            sourceNode: source,
            sourceElement,
            targetNode: target,
            targetElement: generateTargetElement,
          });
        }

        if (
          controlTargetElement &&
          targetEnergies[controlTargetElement] !== undefined
        ) {
          controlRelations.push({
            sourceNode: source,
            sourceElement,
            targetNode: target,
            targetElement: controlTargetElement,
          });
        }
      }
    });
  }

  const byOrder = (r: ElementRelation): number =>
    orderScore(r.sourceNode) * 10 + orderScore(r.targetNode);

  state.generateRelations = generateRelations.sort(
    (a, b) => byOrder(a) - byOrder(b),
  );
  state.controlRelations = controlRelations.sort(
    (a, b) => byOrder(a) - byOrder(b),
  );
}

/**
 * 处理刑害关系（主文档《细节说明（参数公式与数据表）.md》14.4节）
 *
 * 包括：
 * - 三刑：寅刑巳、巳刑申、申刑寅（无恩之刑）；丑刑戌、戌刑未、未刑丑（恃势之刑）；子刑卯（无礼之刑）
 * - 六害：子未、丑午、寅巳、卯辰、申亥、酉戌
 * - 自刑：辰辰、午午、酉酉、亥亥
 *
 * 处理方式：按系数扣减能量（类似六冲但更温和）
 * - 三刑：k_punish = 0.15~0.30（默认 0.20）
 * - 六害：k_harm = 0.10~0.20（默认 0.15）
 * - 自刑：k_selfPunish = 0.10~0.20（默认 0.12）
 *
 * 说明：
 * - 刑害处理在合化之后进行，避免破坏已形成的结构关系
 * - 对于已参与合化的节点，不再参与刑害处理（避免重复扣减）
 */
export function handlePunishHarm(state: GlobalState): void {
  const { config } = state;
  const branchNodes = state.nodes.filter((n) => n.nodeType === 'branch');

  // 1. 处理三刑（循环三刑：寅巳申、丑戌未）
  for (const triple of BRANCH_PUNISH_TRIPLES) {
    const nodes = triple
      .map((br) =>
        branchNodes.find(
          (n) => n.name === br && !n.hasFlag('combined') && !n.hasFlag('punished'),
        ),
      )
      .filter((n): n is FiveElementNode => n !== undefined);

    // 三刑需要三个地支同时出现
    if (nodes.length === 3) {
      nodes.forEach((node) => {
        const total = node.getTotalEnergy();
        if (total > 0) {
          const loss = total * config.punishLossRatio;
          node.distributeEnergy(-loss, config);
          node.setFlag('punished', true);
        }
      });
    }
  }

  // 2. 处理三刑（单对：子刑卯）
  for (const [aBranch, bBranch] of BRANCH_PUNISH_PAIRS) {
    const aNodes = branchNodes.filter(
      (n) =>
        n.name === aBranch &&
        !n.hasFlag('combined') &&
        !n.hasFlag('punished') &&
        !n.hasFlag('harmed'),
    );
    const bNodes = branchNodes.filter(
      (n) =>
        n.name === bBranch &&
        !n.hasFlag('combined') &&
        !n.hasFlag('punished') &&
        !n.hasFlag('harmed'),
    );

    // 双方都存在时，各扣减能量
    if (aNodes.length > 0 && bNodes.length > 0) {
      aNodes.forEach((node) => {
        const total = node.getTotalEnergy();
        if (total > 0) {
          const loss = total * config.punishLossRatio;
          node.distributeEnergy(-loss, config);
          node.setFlag('punished', true);
        }
      });
      bNodes.forEach((node) => {
        const total = node.getTotalEnergy();
        if (total > 0) {
          const loss = total * config.punishLossRatio;
          node.distributeEnergy(-loss, config);
          node.setFlag('punished', true);
        }
      });
    }
  }

  // 3. 处理六害
  for (const [aBranch, bBranch] of BRANCH_HARM_PAIRS) {
    const aNodes = branchNodes.filter(
      (n) =>
        n.name === aBranch &&
        !n.hasFlag('combined') &&
        !n.hasFlag('punished') &&
        !n.hasFlag('harmed'),
    );
    const bNodes = branchNodes.filter(
      (n) =>
        n.name === bBranch &&
        !n.hasFlag('combined') &&
        !n.hasFlag('punished') &&
        !n.hasFlag('harmed'),
    );

    // 双方都存在时，各扣减能量
    if (aNodes.length > 0 && bNodes.length > 0) {
      aNodes.forEach((node) => {
        const total = node.getTotalEnergy();
        if (total > 0) {
          const loss = total * config.harmLossRatio;
          node.distributeEnergy(-loss, config);
          node.setFlag('harmed', true);
        }
      });
      bNodes.forEach((node) => {
        const total = node.getTotalEnergy();
        if (total > 0) {
          const loss = total * config.harmLossRatio;
          node.distributeEnergy(-loss, config);
          node.setFlag('harmed', true);
        }
      });
    }
  }

  // 4. 处理自刑（同一地支出现两次或以上）
  for (const branch of BRANCH_SELF_PUNISH) {
    const nodes = branchNodes.filter(
      (n) =>
        n.name === branch &&
        !n.hasFlag('combined') &&
        !n.hasFlag('punished') &&
        !n.hasFlag('harmed') &&
        !n.hasFlag('selfPunished'),
    );

    // 自刑需要同一地支出现两次或以上
    if (nodes.length >= 2) {
      nodes.forEach((node) => {
        const total = node.getTotalEnergy();
        if (total > 0) {
          const loss = total * config.selfPunishLossRatio;
          node.distributeEnergy(-loss, config);
          node.setFlag('selfPunished', true);
        }
      });
    }
  }
}

/**
 * 检测五行循环（仅考虑 5 节点完整循环，基于原始属性）
 *
 * - 当前实现会在所有节点中寻找「金→水→木→火→土→金」的闭环
 * - 若存在多条可能的循环，仅记录第一条
 */
export function detectFiveElementCycle(state: GlobalState): void {
  const { nodes } = state;

  // 按原始属性分组
  const groups: Record<FiveElement, FiveElementNode[]> = {
    wood: [],
    fire: [],
    earth: [],
    metal: [],
    water: [],
  };
  nodes.forEach((n) => {
    groups[n.originalElement].push(n);
  });

  // 要求每个五行至少有一个节点
  const allHaveNode = (Object.values(groups) as FiveElementNode[][]).every(
    (list) => list.length > 0,
  );
  if (!allHaveNode) {
    state.mainCycle = null;
    return;
  }

  // 简单选择每组中的第一个节点组成循环
  const cycleNodes: FiveElementNode[] = [
    groups.metal[0], // 金
    groups.water[0], // 水
    groups.wood[0], // 木
    groups.fire[0], // 火
    groups.earth[0], // 土
  ];

  state.mainCycle = {
    nodes: cycleNodes,
  };
}

/**
 * 相生优化处理（阴阳差异 + 外界能量优先模型）
 *
 * 对应文档：
 * - docs/04-开发指南/八字五行能量计算.md 3.3 小节
 * - docs/temp/XS.txt
 *
 * 规则要点：
 * - 统一使用“母方给予 + 外界补充 × 转化效率”的模型，弃用固定 30% 增益
 * - 区分循环相生与非循环相生两个阶段，但共用同一套相生算法
 * - 相生单位以「节点 + 属性」为粒度：
 *   - 母方能量：来源于母节点在 sourceElement 上的属性能量
 *   - 子方能量：作用于子节点在 targetElement 上的属性能量
 * - 母方给予能量：取母方属性能量的一部分（指数衰减函数），从母方属性上扣减
 * - 外界补充能量：按母方给予能量 × 外界系数计算，外界系数通常大于转化效率
 * - 子方获得能量：对“母方给予 + 外界补充”的总输入按转化效率折算后，加到子方属性上
 */
export function applyGenerateRelations(state: GlobalState): void {
  const { config } = state;

  /**
   * 基于 XS 方案的相生核心计算（以属性能量为输入/输出）
   */
  const calculateGenerateOnce = (
    Em: number,
    Ec: number,
    elemM: FiveElement,
    elemC: FiveElement,
    polM: Polarity,
    polC: Polarity,
    options?: { cycleBoost?: number },
  ): {
    energyGiven: number;
    externalEnergy: number;
    energyReceived: number;
  } => {
    const MIN_ENERGY = 1e-6;
    const safeEm = Math.max(Em, MIN_ENERGY);
    const safeEc = Math.max(Ec, MIN_ENERGY);
    const r = safeEm / safeEc;

    const cycleBoost = options?.cycleBoost ?? 1;

    // 1. 母方给予比例：maxGive * exp(-alpha * r)，并裁剪到 [minGive, maxGive]
    const maxGiveBase = config.relationGenerateGain; // 沿用配置作为“最大给予比例”基准
    const maxGive = maxGiveBase * cycleBoost;
    const minGive = Math.min(0.005 * cycleBoost, maxGive * 0.2); // 至少 0.5% 左右的量级
    const alpha = 0.8;

    let giveRatio = maxGive * Math.exp(-alpha * r);
    if (giveRatio > maxGive) giveRatio = maxGive;
    if (giveRatio < minGive) giveRatio = minGive;

    const energyGiven = safeEm * giveRatio;

    // 2. 外界系数：受阴阳组合 + 五行组合 + 能量比影响
    const externalCoef = (() => {
      // 阴阳外界系数矩阵（base, max）
      const keyYY = `${polM}-${polC}` as const;
      const yyBaseMap: Record<
        string,
        { base: number; max: number }
      > = {
        'YANG-YANG': { base: 1.2, max: 2.0 },
        'YANG-YIN': { base: 1.0, max: 1.8 },
        'YIN-YANG': { base: 0.6, max: 1.2 },
        'YIN-YIN': { base: 0.8, max: 1.5 },
      };
      const yyConf = yyBaseMap[keyYY] ?? { base: 0.8, max: 1.5 };

      // 五行外界加成
      const keyElem = `${elemM}-${elemC}` as const;
      const elemBonusMap: Record<string, number> = {
        'wood-fire': 0.4,
        'fire-earth': 0.2,
        'earth-metal': 0.3,
        'metal-water': 0.35,
        'water-wood': 0.5,
      };
      const elemBonus = elemBonusMap[keyElem] ?? 0.2;

      // 能量比对外界系数的修正：母方越强，外界越容易响应
      const ratioFactor = (() => {
        if (r >= 1) {
          return Math.min(1.2, 1 + (r - 1) * 0.1);
        }
        return Math.max(0.6, r);
      })();

      let coef = (yyConf.base + elemBonus) * ratioFactor * cycleBoost;
      if (coef < 0.1) coef = 0.1;
      if (coef > yyConf.max * cycleBoost) coef = yyConf.max * cycleBoost;
      return coef;
    })();

    // 3. 转化效率：受五行组合 + 阴阳组合 + 能量比影响
    const transferEfficiency = (() => {
      const keyElem = `${elemM}-${elemC}` as const;
      const baseEffMap: Record<string, { base: number; range: number }> = {
        'wood-fire': { base: 0.75, range: 0.1 },
        'fire-earth': { base: 0.65, range: 0.1 },
        'earth-metal': { base: 0.8, range: 0.15 },
        'metal-water': { base: 0.85, range: 0.1 },
        'water-wood': { base: 0.9, range: 0.05 },
      };
      const effConf = baseEffMap[keyElem] ?? { base: 0.7, range: 0.1 };

      // 阴阳效率调整
      const keyYY = `${polM}-${polC}` as const;
      const yyAdjMap: Record<string, number> = {
        'YANG-YANG': 0.8,
        'YANG-YIN': 0.4,
        'YIN-YANG': -0.2,
        'YIN-YIN': 0.0,
      };
      const yyAdj = yyAdjMap[keyYY] ?? 0;

      let eff = effConf.base + yyAdj * effConf.range;

      // 能量比对效率的修正：母方略强（r 在 1~2）时效率最高
      const idealMin = 1.0;
      const idealMax = 2.0;
      const ratioFactor = (() => {
        if (r < idealMin) {
          return 0.5 + (r / idealMin) * 0.5;
        }
        if (r > idealMax) {
          return 1 - (r - idealMax) * 0.05;
        }
        return 1;
      })();

      eff *= ratioFactor;

      if (eff < 0.05) eff = 0.05;
      if (eff > 0.95) eff = 0.95;
      return eff;
    })();

    // 4. 应用全局外部能量吸收比例参数
    let effectiveExternalCoef = externalCoef * config.globalExternalEnergyRatio;
    
    // 5. 外界优先约束：外界系数应显著大于转化效率（应用全局参数后仍需要满足此约束）
    if (effectiveExternalCoef <= transferEfficiency) {
      effectiveExternalCoef = transferEfficiency + 0.1;
    }

    const externalEnergyAdjusted = energyGiven * effectiveExternalCoef;

    // 6. 子方获得能量：对"母方给予 + 外界补充"做一次转化
    const totalInput = energyGiven + externalEnergyAdjusted;
    const energyReceived = totalInput * transferEfficiency;

    return {
      energyGiven,
      externalEnergy: externalEnergyAdjusted,
      energyReceived,
    };
  };

  // 1. 循环相生：基于 mainCycle 节点顺序，按「金→水→木→火→土→金」闭环依次处理
  if (state.mainCycle && state.mainCycle.nodes.length > 0) {
    const nodes = state.mainCycle.nodes;
    const n = nodes.length;
    for (let i = 0; i < n; i++) {
      const mother = nodes[i];
      const child = nodes[(i + 1) % n];
      const elemM = mother.originalElement;
      const elemC = child.originalElement;

      const Em = mother.getElementEnergy(elemM);
      const Ec = child.getElementEnergy(elemC);
      if (Em <= 0 || Ec <= 0) continue;

      // 获取作用次数衰减系数
      const motherEfficiency = mother.getActionEfficiency();
      const childEfficiency = child.getActionEfficiency();

      const { energyGiven, energyReceived } = calculateGenerateOnce(
        Em,
        Ec,
        elemM,
        elemC,
        mother.polarity,
        child.polarity,
        { cycleBoost: config.cycleGenerateGain / Math.max(config.relationGenerateGain, 1e-6) },
      );

      // 位置权重：年/月/日/时 × 干/支
      const baseEdgeWeight =
        getPositionWeight(mother) * getPositionWeight(child);
      // 位置作用矩阵系数（如果启用）
      const matrixCoeff = getPositionMatrixCoeff(
        mother,
        child,
        config.enablePositionMatrix,
      );
      const edgeWeight = baseEdgeWeight * matrixCoeff;

      // 应用位置权重与衰减系数：母方给予的能量和子方获得的能量都乘以各自的效率
      const effectiveEnergyGiven = energyGiven * motherEfficiency * edgeWeight;
      const effectiveEnergyReceived =
        energyReceived * childEfficiency * edgeWeight;

      if (effectiveEnergyGiven > 0) {
        mother.updateEnergy(elemM, -effectiveEnergyGiven, config);
        mother.incrementActionCount();
      }
      if (effectiveEnergyReceived > 0) {
        child.updateEnergy(elemC, effectiveEnergyReceived, config);
        child.incrementActionCount();
      }
    }
  }

  // 2. 非循环相生：遍历属性级别的 generateRelations
  for (const rel of state.generateRelations) {
    // 若源/目标节点均在主循环中，则视为已经在循环处理中体现，不再重复处理
    const inCycle =
      state.mainCycle &&
      state.mainCycle.nodes.includes(rel.sourceNode) &&
      state.mainCycle.nodes.includes(rel.targetNode);
    if (inCycle) continue;

    const Em = rel.sourceNode.getElementEnergy(rel.sourceElement);
    const Ec = rel.targetNode.getElementEnergy(rel.targetElement);
    if (Em <= 0 || Ec <= 0) continue;

    // 获取作用次数衰减系数
    const sourceEfficiency = rel.sourceNode.getActionEfficiency();
    const targetEfficiency = rel.targetNode.getActionEfficiency();

    const { energyGiven, energyReceived } = calculateGenerateOnce(
      Em,
      Ec,
      rel.sourceElement,
      rel.targetElement,
      rel.sourceNode.polarity,
      rel.targetNode.polarity,
    );

    // 位置权重修正
    const baseEdgeWeight =
      getPositionWeight(rel.sourceNode) * getPositionWeight(rel.targetNode);
    // 位置作用矩阵系数（如果启用）
    const matrixCoeff = getPositionMatrixCoeff(
      rel.sourceNode,
      rel.targetNode,
      config.enablePositionMatrix,
    );
    const edgeWeight = baseEdgeWeight * matrixCoeff;

    // 应用位置权重与衰减系数：母方给予的能量和子方获得的能量都乘以各自的效率
    const effectiveEnergyGiven =
      energyGiven * sourceEfficiency * edgeWeight;
    const effectiveEnergyReceived =
      energyReceived * targetEfficiency * edgeWeight;

    if (effectiveEnergyGiven > 0) {
      rel.sourceNode.updateEnergy(rel.sourceElement, -effectiveEnergyGiven, config);
      rel.sourceNode.incrementActionCount();
    }
    if (effectiveEnergyReceived > 0) {
      rel.targetNode.updateEnergy(rel.targetElement, effectiveEnergyReceived, config);
      rel.targetNode.incrementActionCount();
    }
  }
}

/**
 * 相克优化处理：
 * - 使用指数型相克损耗模型（见 docs 3.2 / XK.txt）
 * - 并叠加简化版阴阳增强系数（见 docs 3.2.4）
 */
export function applyControlRelations(state: GlobalState): void {
  const { config } = state;

  const MIN_LOSS_RATIO = 0.005; // 0.5% 最小损耗比例，确保“相克必有损耗”
  const MIN_ENERGY = 1e-6;

  // 阴阳模式增强系数（仅作用于“力量维度”）
  const YINYANG_POWER_FACTORS: Record<string, number> = {
    'YANG-YANG': 1.4,
    'YIN-YIN': 1.0,
    'YANG-YIN': 1.2,
    'YIN-YANG': 0.9,
  };

  for (const rel of state.controlRelations) {
    const srcEnergy = rel.sourceNode.getElementEnergy(rel.sourceElement);
    const tgtEnergy = rel.targetNode.getElementEnergy(rel.targetElement);

    if (srcEnergy <= 0 || tgtEnergy <= 0) continue;

    // 获取作用次数衰减系数
    const sourceEfficiency = rel.sourceNode.getActionEfficiency();
    const targetEfficiency = rel.targetNode.getActionEfficiency();

    // 基于五行组合获取本次相克的最大损耗参数
    const cfg = getRestrictionConfig(rel.sourceElement, rel.targetElement, {
      maxLossK: config.relationControlSourceLoss,
      maxLossB: config.relationControlTargetLoss,
    });

    const safeSrc = Math.max(srcEnergy, MIN_ENERGY);
    const safeTgt = Math.max(tgtEnergy, MIN_ENERGY);
    const ratio = safeSrc / safeTgt;

    // 指数型损耗比例计算
    let lossRatioK = cfg.maxLossK * Math.exp(-cfg.alpha * ratio);
    let lossRatioB = cfg.maxLossB * (1 - Math.exp(-cfg.beta * ratio));

    // 最小损耗保护
    if (lossRatioK < MIN_LOSS_RATIO) lossRatioK = MIN_LOSS_RATIO;
    if (lossRatioB < MIN_LOSS_RATIO) lossRatioB = MIN_LOSS_RATIO;

    // 阴阳浮动作为乘性微调因子（基础版）
    const deltaPolarity = calcPolarityDelta(
      rel.sourceNode,
      rel.targetNode,
      config,
    );
    const adjustFactor = 1 + deltaPolarity;
    lossRatioK *= adjustFactor;
    lossRatioB *= adjustFactor;

    // 阴阳相克增强版：按四种模式（阳克阳/阴克阴/阳克阴/阴克阳）放大或缩小损耗强度
    const yyKey = `${rel.sourceNode.polarity}-${rel.targetNode.polarity}`;
    const powerFactor = YINYANG_POWER_FACTORS[yyKey] ?? 1;
    lossRatioK *= powerFactor;
    lossRatioB *= powerFactor;

    // 再次裁剪到最大损耗上限（防止超过100%）
    lossRatioK = Math.max(
      MIN_LOSS_RATIO,
      Math.min(lossRatioK, cfg.maxLossK),
    );
    lossRatioB = Math.max(
      MIN_LOSS_RATIO,
      Math.min(lossRatioB, cfg.maxLossB),
    );

    // 位置权重修正
    const baseEdgeWeight =
      getPositionWeight(rel.sourceNode) * getPositionWeight(rel.targetNode);
    // 位置作用矩阵系数（如果启用）
    const matrixCoeff = getPositionMatrixCoeff(
      rel.sourceNode,
      rel.targetNode,
      config.enablePositionMatrix,
    );
    const edgeWeight = baseEdgeWeight * matrixCoeff;

    // 应用位置权重与作用次数衰减系数：克方和被克方的损耗都乘以各自的效率
    const lossSrc = srcEnergy * lossRatioK * sourceEfficiency * edgeWeight;
    const lossTgt = tgtEnergy * lossRatioB * targetEfficiency * edgeWeight;

    if (lossSrc > 0) {
      rel.sourceNode.updateEnergy(rel.sourceElement, -lossSrc, config);
      rel.sourceNode.incrementActionCount();
    }
    if (lossTgt > 0) {
      rel.targetNode.updateEnergy(rel.targetElement, -lossTgt, config);
      rel.targetNode.incrementActionCount();
    }
  }
}

/**
 * 获取指定克制关系的相克参数（指数型损耗配置）
 */
function getRestrictionConfig(
  source: FiveElement,
  target: FiveElement,
  defaults: { maxLossK: number; maxLossB: number },
): { maxLossK: number; maxLossB: number; alpha: number; beta: number } {
  // 五行相克组合特定配置
  const base: Record<
    string,
    { maxLossK: number; maxLossB: number; alpha: number; beta: number }
  > = {
    // wood (木) 克 土
    'wood-earth': { maxLossK: 0.28, maxLossB: 0.25, alpha: 1.0, beta: 1.0 },
    // fire (火) 克 金
    'fire-metal': { maxLossK: 0.25, maxLossB: 0.32, alpha: 1.3, beta: 1.2 },
    // earth (土) 克 水
    'earth-water': { maxLossK: 0.22, maxLossB: 0.30, alpha: 1.5, beta: 1.3 },
    // metal (金) 克 木
    'metal-wood': { maxLossK: 0.18, maxLossB: 0.40, alpha: 2.0, beta: 1.8 },
    // water (水) 克 火
    'water-fire': { maxLossK: 0.20, maxLossB: 0.38, alpha: 1.8, beta: 1.6 },
  };

  const key = `${source}-${target}` as keyof typeof base;
  const conf = base[key];

  if (conf) {
    return {
      maxLossK: conf.maxLossK,
      maxLossB: conf.maxLossB,
      alpha: conf.alpha,
      beta: conf.beta,
    };
  }

  // 非典型组合：采用极小损耗，避免数值抖动
  return {
    maxLossK: Math.min(0.01, defaults.maxLossK),
    maxLossB: Math.min(0.01, defaults.maxLossB),
    alpha: 1.0,
    beta: 1.0,
  };
}

/**
 * 能量边界处理：确保所有属性能量与节点总能量在 [min, max] 区间
 */
export function applyEnergyBounds(state: GlobalState): void {
  const { config } = state;

  for (const node of state.nodes) {
    // 通过「按比例缩放」的方式控制总能量在边界内
    let total = node.getTotalEnergy();
    if (total <= 0) {
      // 若总能量非正，则将原始属性重置为最小值
      node.updateEnergy(node.originalElement, config.minEnergy, config);
      continue;
    }

    if (total > config.maxEnergy) {
      const scale = config.maxEnergy / total;
      node.distributeEnergy(total * (scale - 1), config);
    } else if (total < config.minEnergy) {
      const delta = config.minEnergy - total;
      node.distributeEnergy(delta, config);
    }
  }
}

/**
 * 汇总所有节点的五行能量分布（返回量化能量）
 */
export function summarizeFiveElementEnergies(
  state: GlobalState,
): Record<FiveElement, number> {
  const result: Record<FiveElement, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  for (const node of state.nodes) {
    (Object.keys(result) as FiveElement[]).forEach((el) => {
      result[el] += node.getElementEnergy(el);
    });
  }

  return result;
}

/**
 * 主流程：八字五行能量量化计算
 *
 * 步骤（当前版本）：
 * 1. 初始化节点和全局状态
 * 2. 标记六冲关系
 * 3. 处理合化关系（三会、三合、六合、半合、天干五合）
 * 4. 处理刑害关系（三刑、六害、自刑）
 * 5. 建立生克关系网络
 * 6. 检测五行循环
 * 7. 处理所有相生关系
 * 8. 处理所有相克关系
 * 9. 最终边界调整
 * 10. 汇总五行能量
 *
 * 注意：
 * - 结构关系处理优先级：三会 → 三合 → 六合 → 半合 → 六冲 → 刑害
 * - 刑害处理在合化之后进行，避免破坏已形成的结构关系
 * - 对于已参与合化的节点，不再参与刑害处理（避免重复扣减）
 */
export function calculateQuantitativeEnergies(
  fourPillars: FourPillars,
  config: EnergyCalculationConfig = DEFAULT_ENERGY_CONFIG,
): {
  state: GlobalState;
  elementEnergies: Record<FiveElement, number>;
  debugLog: EnergyLogEntry[];
} {
  // 1. 初始化
  const state = initBaziNodes(fourPillars, config);
  // 月令地支（用于判断合化强度）
  const monthBranch = fourPillars.month.charAt(1);
  state.addLog('init', '初始化节点与基础能量（天干 1000 / 地支 1200）');

  // 2. 冲、刑、害等结构关系（当前版本仅简单标记六冲，避免一次性引入过多复杂度）
  for (const [aBranch, bBranch] of BRANCH_CLASH_PAIRS) {
    const aNodes = state.nodes.filter(
      (n) => n.nodeType === 'branch' && n.name === aBranch,
    );
    const bNodes = state.nodes.filter(
      (n) => n.nodeType === 'branch' && n.name === bBranch,
    );
    aNodes.forEach((n) => n.setFlag('clashed', true));
    bNodes.forEach((n) => n.setFlag('clashed', true));
  }
  state.addLog('clash', '标记地支六冲关系（子午、丑未、寅申、卯酉、辰戌、巳亥）');

  // 3. 合化（优先级：三会 → 三合 → 六合 → 半合）
  handleCombinations(state, monthBranch);
  state.addLog('combine', '处理天干五合与地支合化（三会、三合、六合、半合）');

  // 4. 刑害处理（优先级：六冲 → 刑害，在合化之后处理）
  handlePunishHarm(state);
  state.addLog('punishHarm', '处理地支刑害关系（三刑、六害、自刑）');

  // 5. 生克网络
  buildRelations(state);
  state.addLog('relations', '建立基于原始五行属性的相生/相克关系网络');

  // 6. 循环检测
  detectFiveElementCycle(state);
  state.addLog('cycle', '检测五行循环（金→水→木→火→土→金）并记录主循环节点');

  // 6.5. 重置所有节点的作用次数（确保每次计算从头开始）
  for (const node of state.nodes) {
    node.resetActionCount();
  }

  // 6.6. 保存原始能量（用于格局判断）
  // 在相生相克之前，保存当前状态的五行能量作为原始能量
  // 注意：此时已经应用了月令校正、得根得气、合化、刑害等调整
  const rawElementEnergies = summarizeFiveElementEnergies(state);
  state.rawElementEnergies = rawElementEnergies;
  
  // 保存原始节点状态快照（用于计算原始十神能量）
  // 通过深拷贝节点状态来保存原始能量
  // 注意：此时已经应用了月令校正、得根得气、合化、刑害等调整
  state.rawNodeSnapshots = state.nodes.map((node) => ({
    name: node.name,
    nodeType: node.nodeType,
    position: { ...node.position },
    originalElement: node.originalElement,
    polarity: node.polarity,
    totalEnergy: node.getTotalEnergy(),
    energies: { ...node.getAllEnergies() },
  }));

  // 7. 相生
  applyGenerateRelations(state);
  state.addLog('generate', '按顺序处理循环相生与非循环相生，应用相生增益与阴阳浮动');

  // 8. 相克
  applyControlRelations(state);
  state.addLog('control', '按顺序处理所有相克关系，应用克方与被克方能量损耗');

  // 9. 边界控制
  applyEnergyBounds(state);
  state.addLog('bounds', '应用能量边界控制，确保所有节点与属性能量在预设区间内');

  // 10. 汇总（平衡后能量）
  const elementEnergies = summarizeFiveElementEnergies(state);

  return {
    state,
    elementEnergies,
    debugLog: state.logs,
  };
}

