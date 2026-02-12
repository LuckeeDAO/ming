/**
 * 格局判断核心方法（基于能量平衡）
 * 
 * 参考文档：《new-ge.txt》基于能量平衡的格局命名系统
 * 
 * @module services/energy/patternMedicineMethods
 */

import type { TenGodType } from './tenGodService.js';
import { TEN_GOD_NAMES } from './tenGodService.js';

/**
 * 十神索引映射（0-9）
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
 * 索引到十神类型映射
 */
const INDEX_TO_TEN_GOD: TenGodType[] = ['比', '劫', '食', '傷', '財', '才', '官', '殺', '印', 'ㄗ'];

/**
 * 病神识别结果
 */
export interface DiseaseIdentification {
  primaryDisease: {
    tenGod: TenGodType;
    index: number;
    threat: number;
    normalizedThreat: number;
  } | null;
  threats: Array<{
    tenGod: TenGodType;
    index: number;
    threat: number;
    normalizedThreat: number;
  }>;
}

/**
 * 相神识别结果
 */
export interface XiangShenIdentification {
  xiangShen: {
    tenGod: TenGodType;
    index: number;
    lossRate: number;
    rawEnergy: number;
    balancedEnergy: number;
  } | null;
  lossRates: Array<{
    tenGod: TenGodType;
    index: number;
    lossRate: number;
    rawEnergy: number;
    balancedEnergy: number;
  }>;
}

/**
 * 威胁系数向量 α（10维）
 */
const THREAT_COEFFICIENTS: number[] = [
  0.35, // 0: 比肩
  0.90, // 1: 劫财
  0.50, // 2: 食神
  1.25, // 3: 伤官
  0.30, // 4: 正财
  0.60, // 5: 偏财
  0.55, // 6: 正官
  2.50, // 7: 七杀
  0.25, // 8: 正印
  0.40, // 9: 偏印
];

/**
 * 病神识别阈值
 */
const DISEASE_THRESHOLD = 0.7;

/**
 * 通常不作为病神的十神索引
 * 根据传统命理理论，财星、印星、比肩通常不作为病神
 */
const EXCLUDED_DISEASE_INDICES = [0, 4, 5, 8, 9]; // 比肩、正财、偏财、正印、偏印

/**
 * 相神识别阈值（损失率）
 */
const XIANG_SHEN_THRESHOLD = 0.3;

/**
 * 结果判断阈值
 */
const RESULT_THRESHOLDS = {
  TEN_GOD_INCREASE: 1.3,  // 十神能量增加≥30%
  DAY_MASTER_INCREASE: 1.2, // 日主能量增加≥20%
  TOTAL_INCREASE: 1.15,   // 总能量增加≥15%
};

/**
 * 获取位置权重（基于节点位置）
 */
function getPositionWeightFromPosition(position: { pillarIndex: 0 | 1 | 2 | 3; positionType: 'stem' | 'branch' }): number {
  const { pillarIndex, positionType } = position;
  
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
  return 0.5;
}

/**
 * 节点级别的威胁值计算详情
 */
export interface NodeThreatDetail {
  nodeName: string;
  nodeType: 'stem' | 'branch';
  position: string;
  tenGod: TenGodType | null;
  nodeEnergy: number;
  positionWeight: number;
  threatValue: number;
}

/**
 * 识别主要病神（基于原始能量，节点级别计算）
 * 
 * 算法改进：先计算每个节点的威胁值，再按十神累加
 * 
 * @param nodes - 原始节点快照列表（包含节点能量、位置、十神信息）
 * @param dayMasterIndex - 日主对应十神索引
 * @param dayMasterEnergy - 日主原始能量（用于计算比例）
 * @returns 病神识别结果（包含节点级别的计算过程）
 */
export function identifyPrimaryDisease(
  nodes: Array<{
    name: string;
    nodeType: 'stem' | 'branch';
    position: { pillarIndex: 0 | 1 | 2 | 3; positionType: 'stem' | 'branch' };
    totalEnergy: number;
    tenGod: TenGodType | null;
  }>,
  _dayMasterIndex: number,
  dayMasterEnergy: number,
): DiseaseIdentification & {
  nodeThreatDetails: NodeThreatDetail[];
  calculationProcess: {
    step1: string;
    step2: Array<{ node: string; threat: number; tenGod: string }>;
    step3: Array<{ tenGod: string; totalThreat: number; nodeCount: number }>;
  };
} {
  // 步骤1：计算所有节点的总能量（用于计算比例）
  const E_total = nodes.reduce((sum, node) => sum + node.totalEnergy, 0) || 1;
  const E_self = dayMasterEnergy || 1;

  // 步骤2：对每个节点计算威胁值
  const nodeThreatDetails: NodeThreatDetail[] = [];
  const tenGodThreats: Record<number, number> = {}; // 按十神索引累加威胁值
  const tenGodNodeCounts: Record<number, number> = {}; // 统计每个十神的节点数量

  for (const node of nodes) {
    if (!node.tenGod) continue;

    const tenGodIndex = INDEX_TO_TEN_GOD.indexOf(node.tenGod);
    if (tenGodIndex === -1) continue;
    
    // 排除通常不作为病神的十神（比肩、正财、偏财、正印、偏印）
    if (EXCLUDED_DISEASE_INDICES.includes(tenGodIndex)) continue;

    const alpha_i = THREAT_COEFFICIENTS[tenGodIndex];
    const positionWeight = getPositionWeightFromPosition(node.position);
    const nodeEnergy = node.totalEnergy;

    // 计算该节点的威胁值：threat_node = α_i × positionWeight × (E_node / E_self)
    // 说明：威胁值主要反映相对于日主的威胁强度，不需要全局占比项
    const ratio_self = nodeEnergy / E_self;
    const threatValue = alpha_i * positionWeight * ratio_self;

    // 累加到对应十神
    if (!tenGodThreats[tenGodIndex]) {
      tenGodThreats[tenGodIndex] = 0;
      tenGodNodeCounts[tenGodIndex] = 0;
    }
    tenGodThreats[tenGodIndex] += threatValue;
    tenGodNodeCounts[tenGodIndex] += 1;

    // 记录节点详情
    const positionName = `${['年', '月', '日', '时'][node.position.pillarIndex]}${node.position.positionType === 'stem' ? '干' : '支'}`;
    nodeThreatDetails.push({
      nodeName: node.name,
      nodeType: node.nodeType,
      position: positionName,
      tenGod: node.tenGod,
      nodeEnergy,
      positionWeight,
      threatValue,
    });
  }

  // 步骤3：构建十神级别的威胁值列表（排除通常不作为病神的十神）
  const threats: Array<{
    tenGod: TenGodType;
    index: number;
    threat: number;
    normalizedThreat: number;
  }> = [];

  for (let i = 0; i < 10; i++) {
    // 排除通常不作为病神的十神
    if (EXCLUDED_DISEASE_INDICES.includes(i)) continue;
    
    const totalThreat = tenGodThreats[i] || 0;
    threats.push({
      tenGod: INDEX_TO_TEN_GOD[i],
      index: i,
      threat: totalThreat,
      normalizedThreat: 0, // 稍后归一化
    });
  }

  // 归一化
  const maxThreat = Math.max(...threats.map((t) => t.threat), 1);
  threats.forEach((t) => {
    t.normalizedThreat = t.threat / maxThreat;
  });

  // 排序
  threats.sort((a, b) => b.normalizedThreat - a.normalizedThreat);

  // 选取主要病神（normalizedThreat ≥ threshold）
  const primaryDisease = threats.find((t) => t.normalizedThreat >= DISEASE_THRESHOLD) || null;

  // 构建计算过程详情
  const calculationProcess = {
    step1: `计算总能量：E_total = ${E_total.toFixed(2)}, E_self = ${E_self.toFixed(2)}`,
    step2: nodeThreatDetails.map((detail) => ({
      node: `${detail.nodeName}(${detail.position})`,
      threat: detail.threatValue,
      tenGod: detail.tenGod ? TEN_GOD_NAMES[detail.tenGod].full : '无',
    })),
    step3: threats.map((t) => ({
      tenGod: TEN_GOD_NAMES[t.tenGod].full,
      totalThreat: t.threat,
      nodeCount: tenGodNodeCounts[t.index] || 0,
    })),
  };

  return {
    primaryDisease,
    threats,
    nodeThreatDetails,
    calculationProcess,
  };
}

/**
 * 识别相神（基于能量损失率）
 * 
 * @param E_raw - 原始十神能量向量（10维）
 * @param E_balanced - 平衡后十神能量向量（10维）
 * @param dayMasterIndex - 日主对应十神索引（排除日主）
 * @returns 相神识别结果
 */
export function identifyXiangShen(
  E_raw: number[],
  E_balanced: number[],
  dayMasterIndex: number,
): XiangShenIdentification {
  const lossRates: Array<{
    tenGod: TenGodType;
    index: number;
    lossRate: number;
    rawEnergy: number;
    balancedEnergy: number;
  }> = [];

  for (let i = 0; i < 10; i++) {
    // 排除日主
    if (i === dayMasterIndex) {
      continue;
    }

    const E_raw_i = E_raw[i] || 0;
    const E_balanced_i = E_balanced[i] || 0;

    // 计算损失率
    const lossRate = E_raw_i > 0 ? (E_raw_i - E_balanced_i) / E_raw_i : 0;

    lossRates.push({
      tenGod: INDEX_TO_TEN_GOD[i],
      index: i,
      lossRate,
      rawEnergy: E_raw_i,
      balancedEnergy: E_balanced_i,
    });
  }

  // 排序（按损失率从大到小）
  lossRates.sort((a, b) => b.lossRate - a.lossRate);

  // 选择损失率≥threshold的最大值作为相神
  const xiangShen = lossRates.find((lr) => lr.lossRate >= XIANG_SHEN_THRESHOLD) || null;

  return {
    xiangShen,
    lossRates,
  };
}

/**
 * 动作判断规则表（基于十神索引）
 */
const ACTION_RULES_BY_INDEX: Array<{ xiang: number[]; disease: number[]; action: string }> = [
  { xiang: [2], disease: [7], action: '制' }, // 食神→七杀
  { xiang: [3], disease: [7], action: '合' }, // 伤官→七杀
  { xiang: [8, 9], disease: [7], action: '化' }, // 印星→七杀
  { xiang: [8, 9], disease: [3], action: '配' }, // 印星→伤官
  { xiang: [0, 1], disease: [4, 5], action: '担' }, // 比劫→财星
  { xiang: [4, 5], disease: [8, 9], action: '坏' }, // 财星→印星
  { xiang: [6, 7], disease: [0, 1], action: '制' }, // 官杀→比劫
  { xiang: [2, 3], disease: [0, 1], action: '泄' }, // 食伤→比劫
];

/**
 * 判断动作（相神对病神的制化方式）
 * 
 * @param xiangShen - 相神十神类型
 * @param disease - 病神十神类型
 * @returns 动作词
 */
export function determineAction(
  xiangShen: TenGodType | null,
  disease: TenGodType | null,
): '制' | '化' | '合' | '泄' | '配' | '担' | '坏' | '调' | null {
  if (!xiangShen || !disease) {
    return null;
  }

  const xiangIndex = TEN_GOD_INDEX_MAP[xiangShen];
  const diseaseIndex = TEN_GOD_INDEX_MAP[disease];

  // 检查规则表
  for (const rule of ACTION_RULES_BY_INDEX) {
    if (
      rule.xiang.includes(xiangIndex) &&
      rule.disease.includes(diseaseIndex)
    ) {
      return rule.action as '制' | '化' | '合' | '泄' | '配' | '担' | '坏';
    }
  }

  // 默认：调
  return '调';
}

/**
 * 结果类型
 */
export type ResultType = '生财' | '生官' | '生印' | '生身' | '成势' | '成局';

/**
 * 识别结果（平衡后产生的有益变化）
 * 
 * @param E_raw - 原始十神能量向量（10维）
 * @param E_balanced - 平衡后十神能量向量（10维）
 * @param disease - 病神十神类型
 * @param xiangShen - 相神十神类型
 * @param dayMasterIndex - 日主对应十神索引
 * @returns 结果列表
 */
export function identifyResult(
  E_raw: number[],
  E_balanced: number[],
  disease: TenGodType | null,
  xiangShen: TenGodType | null,
  dayMasterIndex: number,
): Array<{
  tenGod: TenGodType;
  index: number;
  increaseRate: number;
  rawEnergy: number;
  balancedEnergy: number;
  resultType: ResultType;
}> {
  const results: Array<{
    tenGod: TenGodType;
    index: number;
    increaseRate: number;
    rawEnergy: number;
    balancedEnergy: number;
    resultType: ResultType;
  }> = [];

  const diseaseIndex = disease ? TEN_GOD_INDEX_MAP[disease] : -1;
  const xiangIndex = xiangShen ? TEN_GOD_INDEX_MAP[xiangShen] : -1;

  // 检查每个十神
  for (let i = 0; i < 10; i++) {
    // 排除病神和相神
    if (i === diseaseIndex || i === xiangIndex) {
      continue;
    }

    const E_raw_i = E_raw[i] || 0;
    const E_balanced_i = E_balanced[i] || 0;

    if (E_raw_i <= 0) {
      continue;
    }

    const increaseRate = E_balanced_i / E_raw_i;

    // 判断结果类型
    let resultType: ResultType | null = null;

    // 财星增强（正财4、偏财5）
    if ((i === 4 || i === 5) && increaseRate >= RESULT_THRESHOLDS.TEN_GOD_INCREASE) {
      resultType = '生财';
    }
    // 官星增强（正官6、七杀7）
    else if ((i === 6 || i === 7) && increaseRate >= RESULT_THRESHOLDS.TEN_GOD_INCREASE) {
      resultType = '生官';
    }
    // 印星增强（正印8、偏印9）
    else if ((i === 8 || i === 9) && increaseRate >= RESULT_THRESHOLDS.TEN_GOD_INCREASE) {
      resultType = '生印';
    }
    // 日主增强
    else if (i === dayMasterIndex && increaseRate >= RESULT_THRESHOLDS.DAY_MASTER_INCREASE) {
      resultType = '生身';
    }

    if (resultType) {
      results.push({
        tenGod: INDEX_TO_TEN_GOD[i],
        index: i,
        increaseRate,
        rawEnergy: E_raw_i,
        balancedEnergy: E_balanced_i,
        resultType,
      });
    }
  }

  // 检查全局增强（成势）
  const E_raw_total = E_raw.reduce((sum, e) => sum + e, 0);
  const E_balanced_total = E_balanced.reduce((sum, e) => sum + e, 0);
  if (E_raw_total > 0 && E_balanced_total / E_raw_total >= RESULT_THRESHOLDS.TOTAL_INCREASE) {
    results.push({
      tenGod: INDEX_TO_TEN_GOD[0], // 占位
      index: -1,
      increaseRate: E_balanced_total / E_raw_total,
      rawEnergy: E_raw_total,
      balancedEnergy: E_balanced_total,
      resultType: '成势',
    });
  }

  // 检查格局稳固（成局）
  if (disease) {
    const diseaseIndex = TEN_GOD_INDEX_MAP[disease];
    const E_raw_disease = E_raw[diseaseIndex] || 0;
    const E_balanced_disease = E_balanced[diseaseIndex] || 0;
    const suppression = E_raw_disease > 0 ? (E_raw_disease - E_balanced_disease) / E_raw_disease : 0;

    if (suppression >= 0.6) {
      results.push({
        tenGod: disease,
        index: diseaseIndex,
        increaseRate: 1 - suppression,
        rawEnergy: E_raw_disease,
        balancedEnergy: E_balanced_disease,
        resultType: '成局',
      });
    }
  }

  // 按能量增加比例排序
  results.sort((a, b) => b.increaseRate - a.increaseRate);

  return results;
}

/**
 * 生成格局名
 * 
 * @param disease - 病神十神类型
 * @param xiangShen - 相神十神类型
 * @param action - 动作词
 * @param results - 结果列表
 * @returns 格局名
 */
export function generatePatternName(
  disease: TenGodType | null,
  xiangShen: TenGodType | null,
  action: string | null,
  results: Array<{ resultType: ResultType }>,
): string {
  // 无病神
  if (!disease) {
    return '平和格';
  }

  // 无相神
  if (!xiangShen || !action) {
    const diseaseName = TEN_GOD_NAMES[disease].full;
    return `${diseaseName}无制格`;
  }

  // 构建基本部分：相神 + 动作 + 病神
  const xiangName = TEN_GOD_NAMES[xiangShen].full;
  const diseaseName = TEN_GOD_NAMES[disease].full;
  const baseName = `${xiangName}${action}${diseaseName}`;

  // 添加结果部分
  if (results.length > 0) {
    const resultStr = results.map((r) => r.resultType).join('');
    return `${baseName}${resultStr}格`;
  } else {
    return `${baseName}格`;
  }
}

/**
 * 生成解释
 * 
 * @param patternName - 格局名
 * @param disease - 病神十神类型
 * @param xiangShen - 相神十神类型
 * @param action - 动作词
 * @param results - 结果列表
 * @returns 解释文本
 */
export function generateExplanation(
  _patternName: string,
  disease: TenGodType | null,
  xiangShen: TenGodType | null,
  action: string | null,
  results: Array<{ resultType: ResultType }>,
): string {
  const explanationParts: string[] = [];

  if (disease) {
    const diseaseName = TEN_GOD_NAMES[disease].full;
    explanationParts.push(`命局以${diseaseName}为主要矛盾`);
  }

  if (xiangShen && action) {
    const xiangName = TEN_GOD_NAMES[xiangShen].full;
    const actionWords: Record<string, string> = {
      '制': '制约',
      '合': '合化',
      '化': '化解',
      '配': '配合',
      '担': '分担',
      '坏': '克制',
      '泄': '泄耗',
      '调': '调和',
    };
    const actionCn = actionWords[action] || action;
    const diseaseName = disease ? TEN_GOD_NAMES[disease].full : '';
    explanationParts.push(`以${xiangName}${actionCn}${diseaseName}`);
  }

  if (results.length > 0) {
    const resultExplanations: Record<ResultType, string> = {
      '生财': '转化为财富',
      '生官': '获得地位',
      '生印': '增强学识',
      '生身': '提升自身',
      '成势': '形成气势',
      '成局': '格局稳固',
    };
    const resultStrs = results.map((r) => resultExplanations[r.resultType]).join('、');
    explanationParts.push(resultStrs);
  }

  return explanationParts.join('，') + '。';
}

/**
 * 评估格局层次
 * 
 * @param E_raw - 原始十神能量向量（10维）
 * @param E_balanced - 平衡后十神能量向量（10维）
 * @param disease - 病神十神类型
 * @param xiangShen - 相神十神类型
 * @param dayMasterIndex - 日主对应十神索引
 * @returns 评估结果
 */
export function evaluatePatternLevel(
  E_raw: number[],
  E_balanced: number[],
  disease: TenGodType | null,
  xiangShen: TenGodType | null,
  dayMasterIndex: number,
): {
  totalScore: number;
  level: '上等格局' | '中等格局' | '下等格局' | '破格';
  details: {
    suppression: number;
    selfStatus: number;
    xiangEfficiency: number;
  };
} {
  const scores = {
    suppression: 0,
    selfStatus: 0,
    xiangEfficiency: 0,
  };

  // 1. 病神压制率（40分）
  if (disease) {
    const diseaseIndex = TEN_GOD_INDEX_MAP[disease];
    const E_raw_disease = E_raw[diseaseIndex] || 0;
    const E_balanced_disease = E_balanced[diseaseIndex] || 0;
    const suppression = E_raw_disease > 0 ? (E_raw_disease - E_balanced_disease) / E_raw_disease : 0;

    if (suppression >= 0.6) {
      scores.suppression = 40;
    } else if (suppression >= 0.4) {
      scores.suppression = 30;
    } else if (suppression >= 0.2) {
      scores.suppression = 20;
    } else {
      scores.suppression = 10;
    }
  }

  // 2. 日主状态（30分）
  const E_balanced_total = E_balanced.reduce((sum, e) => sum + e, 0);
  const E_balanced_self = E_balanced[dayMasterIndex] || 0;
  const selfRatio = E_balanced_total > 0 ? E_balanced_self / E_balanced_total : 0;

  if (selfRatio >= 0.25) {
    scores.selfStatus = 30;
  } else if (selfRatio >= 0.15) {
    scores.selfStatus = 25;
  } else if (selfRatio >= 0.08) {
    scores.selfStatus = 20;
  } else {
    scores.selfStatus = 10;
  }

  // 3. 相神效率（30分）
  if (xiangShen && disease) {
    const xiangIndex = TEN_GOD_INDEX_MAP[xiangShen];
    const diseaseIndex = TEN_GOD_INDEX_MAP[disease];
    const E_raw_xiang = E_raw[xiangIndex] || 0;
    const E_balanced_xiang = E_balanced[xiangIndex] || 0;
    const E_balanced_disease = E_balanced[diseaseIndex] || 0;
    const E_raw_disease = E_raw[diseaseIndex] || 0;

    const lossRate = E_raw_xiang > 0 ? (E_raw_xiang - E_balanced_xiang) / E_raw_xiang : 0;
    const diseaseSuppressed = E_raw_disease > 0 ? E_balanced_disease < E_raw_disease * 0.7 : false;

    if (lossRate >= 0.4 && diseaseSuppressed) {
      scores.xiangEfficiency = 30;
    } else if (lossRate >= 0.3) {
      scores.xiangEfficiency = 25;
    } else if (lossRate >= 0.2) {
      scores.xiangEfficiency = 20;
    } else {
      scores.xiangEfficiency = 15;
    }
  } else {
    scores.xiangEfficiency = 10;
  }

  // 总分
  const totalScore = scores.suppression + scores.selfStatus + scores.xiangEfficiency;

  // 等级
  let level: '上等格局' | '中等格局' | '下等格局' | '破格';
  if (totalScore >= 80) {
    level = '上等格局';
  } else if (totalScore >= 70) {
    level = '中等格局';
  } else if (totalScore >= 60) {
    level = '下等格局';
  } else {
    level = '破格';
  }

  return {
    totalScore,
    level,
    details: scores,
  };
}

/**
 * 转换能量向量为记录格式
 * 
 * @param energies - 十神能量向量（10维）
 * @returns 十神能量记录
 */
export function convertEnergiesToRecord(energies: number[]): Record<TenGodType, number> {
  const record: Partial<Record<TenGodType, number>> = {};
  for (let i = 0; i < 10; i++) {
    record[INDEX_TO_TEN_GOD[i]] = energies[i] || 0;
  }
  return record as Record<TenGodType, number>;
}
