/**
 * 格局判断与调理（用药）服务
 * 
 * 基于量化能量值，实现完全量化的格局判断与调理系统
 * 
 * 核心算法：
 * 1. 病值计算：基于威胁系数、相对强度、全局占比、非线性调节
 * 2. 格局判断：基于量化值的决策树（单一病神/多病并存/无显著病神）
 * 3. 调理方案：基于药物效力匹配，推荐最优用药方案
 * 
 * 参考文档：
 * - 《格局判断与调理.md》：详细算法说明
 * - 《ge-yao.txt》：基于量化值的命理分析系统原理文档
 * 
 * @module services/energy/patternMedicineService
 */

import type { TenGodType } from './tenGodService.js';
import { TEN_GOD_NAMES } from './tenGodService.js';
import type { EnergyAnalysis } from '../../types/energy.js';
import type { GlobalState } from './energyNodes.js';
import {
  identifyPrimaryDisease,
  identifyXiangShen,
  determineAction,
  identifyResult,
  generatePatternName,
  generateExplanation,
  evaluatePatternLevel,
  convertEnergiesToRecord,
} from './patternMedicineMethods.js';

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
  // 注意：正财在索引4，偏财在索引5
  '官': 6,
  '殺': 7,
  '印': 8,
  'ㄗ': 9,
};

/**
 * 索引到十神类型映射
 * 
 * 顺序：比肩 劫财 食神 伤官 正财 偏财 正官 七杀 正印 偏印
 */
const INDEX_TO_TEN_GOD: TenGodType[] = ['比', '劫', '食', '傷', '財', '才', '官', '殺', '印', 'ㄗ'];

/**
 * 威胁系数向量 α（10维）
 * 
 * 基于历史数据校准的系数（默认建议值）
 * 说明：七杀(7)系数2.5最高，但无特殊规则，仅影响计算结果
 * 
 * 索引顺序：比肩 劫财 食神 伤官 正财 偏财 正官 七杀 正印 偏印
 */
const THREAT_COEFFICIENTS: number[] = [
  0.35, // 0: 比肩 - 直接帮扶，威胁较小
  0.90, // 1: 劫财 - 强帮扶，易夺财，威胁较大
  0.50, // 2: 食神 - 温和泄气，威胁中等
  1.25, // 3: 伤官 - 强烈泄气，威胁较大
  0.30, // 4: 正财 - 温和耗气，威胁较小
  0.60, // 5: 偏财 - 温和耗气，威胁中等
  0.55, // 6: 正官 - 约束克制，威胁中等
  2.50, // 7: 七杀 - 强烈克伐，威胁最大
  0.25, // 8: 正印 - 生扶强烈，威胁最小
  0.40, // 9: 偏印 - 生扶持续，威胁较小
];

/**
 * 制化能力系数矩阵 β（10×10）
 * 
 * β[i][j] 表示十神 j 对十神 i 的制化能力系数
 * 
 * 索引顺序（行/列）：比肩 劫财 食神 伤官 正财 偏财 正官 七杀 正印 偏印
 * 
 * 示例：
 * - β[7][2] = 1.0  # 食神(2)制七杀(7)
 * - β[7][8] = 0.9  # 正印(8)化杀更强
 */
const MEDICINE_COEFFICIENTS: number[][] = [
  // 病神索引 \ 药物索引: 比 劫 食 傷 財 才 官 殺 印 ㄗ
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // 0: 比肩（通常不作为病神）
  [0.0, 0.0, 0.0, 0.0, 0.5, 0.6, 0.0, 0.0, 0.0, 0.0], // 1: 劫财（财星可制）
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.9, 0.8], // 2: 食神（印星可配）
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.9, 0.8], // 3: 伤官（印星可配）
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // 4: 正财（通常不作为病神）
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // 5: 偏财（通常不作为病神）
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.7, 0.6], // 6: 正官（印星可化）
  [0.0, 0.0, 1.0, 0.8, 0.0, 0.0, 0.0, 0.0, 0.9, 0.7], // 7: 七杀（食神制杀、伤官制杀、印星化杀）
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // 8: 正印（通常不作为病神）
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // 9: 偏印（通常不作为病神）
];

/**
 * 有效药物阈值
 */
const MEDICINE_THRESHOLD = 0.5;

/**
 * 病值阈值
 */
const DISEASE_THRESHOLDS = {
  SEVERE: 0.8,    // 重症
  MODERATE: 0.5,  // 中症
  MILD: 0.3,      // 轻症
};

/**
 * 病值等级
 */
export type DiseaseLevel = 'severe' | 'moderate' | 'mild' | 'none';

/**
 * 药物动作类型
 */
export type MedicineAction = '制' | '化' | '泄';

/**
 * 药物优先级
 */
export type MedicinePriority = 'primary' | 'secondary' | 'auxiliary';

/**
 * 病值分析结果
 */
export interface DiseaseValue {
  tenGod: TenGodType;
  index: number;
  energy: number;
  diseaseValue: number;
  normalizedDiseaseValue: number;
  level: DiseaseLevel;
}

/**
 * 药物分析结果
 */
export interface Medicine {
  tenGod: TenGodType;
  index: number;
  energy: number;
  effectiveness: number;
  action: MedicineAction;
  priority: MedicinePriority;
  coefficient: number;
}

/**
 * 调理方案
 */
export interface MedicinePlan {
  primaryDisease: {
    tenGod: TenGodType;
    diseaseValue: number;
    normalizedDiseaseValue: number;
    level: DiseaseLevel;
  };
  medicines: Medicine[];
  pattern: string;
  confidence: number;
  description: string;
}

/**
 * 格局判断结果
 */
export interface PatternJudgment {
  pattern: string;
  description: string;
  primaryDiseases: DiseaseValue[];
  medicines: Medicine[];
  confidence: number;
  /** 计算过程详情 */
  calculationProcess?: {
    /** 原始能量（计算前） */
    E_raw: Record<TenGodType, number>;
    /** 平衡后能量（计算后） */
    E_balanced: Record<TenGodType, number>;
    /** 病神识别过程 */
    diseaseIdentification: {
      threats: Array<{ tenGod: TenGodType; threat: number; normalizedThreat: number }>;
      primaryDisease: { tenGod: TenGodType; threat: number; normalizedThreat: number };
      /** 节点级别的威胁值计算详情（可选） */
      nodeThreatDetails?: Array<{
        nodeName: string;
        nodeType: 'stem' | 'branch';
        position: string;
        tenGod: TenGodType | null;
        nodeEnergy: number;
        positionWeight: number;
        threatValue: number;
      }>;
      /** 计算步骤详情（可选） */
      calculationSteps?: {
        step1: string;
        step2: Array<{ node: string; threat: number; tenGod: string }>;
        step3: Array<{ tenGod: string; totalThreat: number; nodeCount: number }>;
      };
    };
    /** 相神识别过程 */
    xiangShenIdentification: {
      lossRates: Array<{ tenGod: TenGodType; lossRate: number; rawEnergy: number; balancedEnergy: number }>;
      xiangShen: { tenGod: TenGodType; lossRate: number; rawEnergy: number; balancedEnergy: number } | null;
    };
    /** 动作判断 */
    action: { xiangShen: TenGodType; disease: TenGodType; action: MedicineAction } | null;
    /** 结果判断 */
    results: Array<{ tenGod: TenGodType; increaseRate: number; rawEnergy: number; balancedEnergy: number; resultType: string }>;
    /** 格局层次评估 */
    evaluation: {
      totalScore: number;
      level: '上等格局' | '中等格局' | '下等格局' | '破格';
      details: {
        suppression: number;
        selfStatus: number;
        xiangEfficiency: number;
      };
    };
  };
}

/**
 * 格局判断与调理服务类
 */
class PatternMedicineService {
  /**
   * 为节点列表添加十神信息
   * 
   * @param nodes - 节点列表（不包含十神信息）
   * @param energyAnalysis - 能量分析结果（包含十神信息）
   * @returns 包含十神信息的节点列表
   */
  private addTenGodToNodes(
    nodes: Array<{ name: string; nodeType: 'stem' | 'branch'; position: { pillarIndex: 0 | 1 | 2 | 3; positionType: 'stem' | 'branch' }; totalEnergy: number }>,
    energyAnalysis: EnergyAnalysis,
  ): Array<{ name: string; nodeType: 'stem' | 'branch'; position: { pillarIndex: 0 | 1 | 2 | 3; positionType: 'stem' | 'branch' }; totalEnergy: number; tenGod: TenGodType | null }> {
    if (!energyAnalysis.tenGods) {
      return nodes.map((n) => ({ ...n, tenGod: null }));
    }

    const { tenGods } = energyAnalysis;
    const result: Array<{ name: string; nodeType: 'stem' | 'branch'; position: { pillarIndex: 0 | 1 | 2 | 3; positionType: 'stem' | 'branch' }; totalEnergy: number; tenGod: TenGodType | null }> = [];

    for (const node of nodes) {
      if (node.nodeType === 'stem') {
        // 天干节点：直接获取对应柱的十神
        const pillarIndex = node.position.pillarIndex;
        let tenGod: TenGodType | null = null;

        if (pillarIndex === 0 && tenGods.year) {
          tenGod = tenGods.year;
        } else if (pillarIndex === 1 && tenGods.month) {
          tenGod = tenGods.month;
        } else if (pillarIndex === 2 && tenGods.day) {
          tenGod = tenGods.day;
        } else if (pillarIndex === 3 && tenGods.hour) {
          tenGod = tenGods.hour;
        }

        result.push({ ...node, tenGod });
      } else {
        // 地支节点：需要按藏干拆分（每个藏干作为一个虚拟节点）
        const pillarIndex = node.position.pillarIndex;
        let branchTenGods: Array<{ stem: string; tenGod: TenGodType | null }> = [];

        if (pillarIndex === 0) {
          branchTenGods = tenGods.yearBranch;
        } else if (pillarIndex === 1) {
          branchTenGods = tenGods.monthBranch;
        } else if (pillarIndex === 2) {
          branchTenGods = tenGods.dayBranch;
        } else if (pillarIndex === 3) {
          branchTenGods = tenGods.hourBranch;
        }

        // 将地支节点的能量按藏干数量平均分配
        const totalStems = branchTenGods.length || 1;
        const energyPerStem = node.totalEnergy / totalStems;

        for (const { tenGod } of branchTenGods) {
          result.push({
            ...node,
            totalEnergy: energyPerStem,
            tenGod,
          });
        }
      }
    }

    return result;
  }

  /**
   * 计算十神能量汇总（基于节点状态）
   * 
   * 对每个十神 k，汇总所有位置的能量：
   * E_ten[k] = Σ(δ(i,k) × E_eff[i])
   * 
   * @param nodes - 节点列表或节点快照列表
   * @param energyAnalysis - 能量分析结果（包含十神信息）
   * @returns 十神能量向量（10维）
   */
  private calculateTenGodEnergiesFromNodes(
    nodes: Array<{ name: string; nodeType: 'stem' | 'branch'; position: { pillarIndex: 0 | 1 | 2 | 3; positionType: 'stem' | 'branch' }; totalEnergy: number }>,
    energyAnalysis: EnergyAnalysis,
  ): number[] {
    const energies: number[] = new Array(10).fill(0);

    if (!energyAnalysis.tenGods) {
      return energies;
    }

    const { tenGods } = energyAnalysis;

    // 汇总天干十神能量
    const stemNodes = nodes.filter((n) => n.nodeType === 'stem');
    for (const node of stemNodes) {
      const pillarIndex = node.position.pillarIndex;
      let tenGod: TenGodType | null = null;

      if (pillarIndex === 0 && tenGods.year) {
        tenGod = tenGods.year;
      } else if (pillarIndex === 1 && tenGods.month) {
        tenGod = tenGods.month;
      } else if (pillarIndex === 2 && tenGods.day) {
        tenGod = tenGods.day;
      } else if (pillarIndex === 3 && tenGods.hour) {
        tenGod = tenGods.hour;
      }

      if (tenGod) {
        const index = TEN_GOD_INDEX_MAP[tenGod];
        energies[index] += node.totalEnergy;
      }
    }

    // 汇总地支藏干十神能量
    const branchNodes = nodes.filter((n) => n.nodeType === 'branch');
    for (const node of branchNodes) {
      const pillarIndex = node.position.pillarIndex;
      let branchTenGods: Array<{ stem: string; tenGod: TenGodType | null }> = [];

      if (pillarIndex === 0) {
        branchTenGods = tenGods.yearBranch;
      } else if (pillarIndex === 1) {
        branchTenGods = tenGods.monthBranch;
      } else if (pillarIndex === 2) {
        branchTenGods = tenGods.dayBranch;
      } else if (pillarIndex === 3) {
        branchTenGods = tenGods.hourBranch;
      }

      // 将地支节点的能量按藏干比例分配到各十神
      const nodeEnergy = node.totalEnergy;
      const totalStems = branchTenGods.length || 1;

      for (const { tenGod } of branchTenGods) {
        if (tenGod) {
          const index = TEN_GOD_INDEX_MAP[tenGod];
          // 简单平均分配（实际应该按藏干权重分配）
          energies[index] += nodeEnergy / totalStems;
        }
      }
    }

    return energies;
  }

  /**
   * 计算十神能量汇总（基于全局状态，兼容旧接口）
   * 
   * @param state - 全局状态（包含节点能量）
   * @param energyAnalysis - 能量分析结果（包含十神信息）
   * @returns 十神能量向量（10维）
   */
  private calculateTenGodEnergies(
    state: GlobalState,
    energyAnalysis: EnergyAnalysis,
  ): number[] {
    const nodes = state.nodes.map((n) => ({
      name: n.name,
      nodeType: n.nodeType,
      position: n.position,
      totalEnergy: n.getTotalEnergy(),
    }));
    return this.calculateTenGodEnergiesFromNodes(nodes, energyAnalysis);
  }

  /**
   * 计算病值
   * 
   * 病值[k] = α[k] × f(E_ten[k], E_self, E_total)
   * 
   * 其中：
   * - f(x,y,z) = (x/y) × (x/z) × log(1 + x/y)
   * - E_self = E_ten[日主对应十神]
   * - E_total = Σ E_ten[k]
   * 
   * @param tenGodEnergies - 十神能量向量（10维）
   * @param dayMasterTenGodIndex - 日主对应十神索引（通常为比肩，索引0）
   * @returns 病值向量（10维）
   */
  private calculateDiseaseValues(
    tenGodEnergies: number[],
    dayMasterTenGodIndex: number,
  ): number[] {
    const E_self = tenGodEnergies[dayMasterTenGodIndex] || 1; // 避免除零
    const E_total = tenGodEnergies.reduce((sum, e) => sum + e, 0) || 1; // 避免除零

    const diseaseValues: number[] = [];

    for (let k = 0; k < 10; k++) {
      const E_k = tenGodEnergies[k] || 0;
      const alpha_k = THREAT_COEFFICIENTS[k];

      // 函数 f(x,y,z) = (x/y) × (x/z) × log(1 + x/y)
      const x = E_k;
      const y = E_self;
      const z = E_total;

      let f_value = 0;
      if (y > 0 && z > 0) {
        const ratio_xy = x / y;
        const ratio_xz = x / z;
        const log_term = Math.log(1 + ratio_xy);
        f_value = ratio_xy * ratio_xz * log_term;
      }

      const diseaseValue = alpha_k * f_value;
      diseaseValues.push(diseaseValue);
    }

    return diseaseValues;
  }

  /**
   * 归一化病值
   * 
   * 病值_norm[k] = 病值[k] / max(病值)
   * 
   * @param diseaseValues - 病值向量（10维）
   * @returns 归一化病值向量（10维）
   */
  private normalizeDiseaseValues(diseaseValues: number[]): number[] {
    const maxValue = Math.max(...diseaseValues, 1); // 避免除零
    return diseaseValues.map((v) => v / maxValue);
  }

  /**
   * 判断病值等级
   * 
   * @param normalizedValue - 归一化病值
   * @returns 病值等级
   */
  private getDiseaseLevel(normalizedValue: number): DiseaseLevel {
    if (normalizedValue >= DISEASE_THRESHOLDS.SEVERE) {
      return 'severe';
    } else if (normalizedValue >= DISEASE_THRESHOLDS.MODERATE) {
      return 'moderate';
    } else if (normalizedValue >= DISEASE_THRESHOLDS.MILD) {
      return 'mild';
    } else {
      return 'none';
    }
  }

  /**
   * 计算药物效力
   * 
   * 药物效力[j] = β[k_max][j] × (E_ten[j] / E_ten[k_max])
   * 
   * @param medicineIndex - 药物十神索引 j
   * @param diseaseIndex - 病神十神索引 k_max
   * @param tenGodEnergies - 十神能量向量
   * @returns 药物效力值
   */
  private calculateMedicineEffectiveness(
    medicineIndex: number,
    diseaseIndex: number,
    tenGodEnergies: number[],
  ): number {
    const beta = MEDICINE_COEFFICIENTS[diseaseIndex]?.[medicineIndex] || 0;
    const E_medicine = tenGodEnergies[medicineIndex] || 0;
    const E_disease = tenGodEnergies[diseaseIndex] || 1; // 避免除零

    const effectiveness = beta * (E_medicine / E_disease);
    return effectiveness;
  }

  /**
   * 获取药物动作词
   * 
   * @param coefficient - 制化能力系数 β
   * @returns 动作词
   */
  private getMedicineAction(coefficient: number): MedicineAction {
    if (coefficient >= 0.8) {
      return '制';
    } else if (coefficient >= 0.6) {
      return '化';
    } else {
      return '泄';
    }
  }

  /**
   * 判断药物优先级
   * 
   * @param effectiveness - 药物效力
   * @returns 优先级
   */
  private getMedicinePriority(effectiveness: number): MedicinePriority {
    if (effectiveness >= 0.8) {
      return 'primary';
    } else if (effectiveness >= 0.5) {
      return 'secondary';
    } else {
      return 'auxiliary';
    }
  }

  /**
   * 分析格局与调理方案（新版本：基于能量平衡）
   * 
   * 参考文档：《new-ge.txt》基于能量平衡的格局命名系统
   * 
   * @param energyAnalysis - 能量分析结果
   * @param state - 全局状态（包含节点能量，需要包含原始能量和平衡后能量）
   * @returns 格局判断与调理方案
   */
  analyzePatternAndMedicine(
    energyAnalysis: EnergyAnalysis,
    state: GlobalState,
  ): {
    patternJudgment: PatternJudgment;
    medicinePlan: MedicinePlan;
    calculationProcess?: PatternJudgment['calculationProcess'];
  } {
    // 1. 计算原始能量（E_raw）和平衡后能量（E_balanced）
    // 计算平衡后能量（当前状态）
    const E_balanced_tenGod = this.calculateTenGodEnergies(state, energyAnalysis);
    
    // 计算原始能量（使用原始节点快照）
    let E_raw_tenGod: number[];
    if (state.rawNodeSnapshots && state.rawNodeSnapshots.length > 0) {
      E_raw_tenGod = this.calculateTenGodEnergiesFromNodes(
        state.rawNodeSnapshots.map((snapshot) => ({
          name: snapshot.name,
          nodeType: snapshot.nodeType,
          position: snapshot.position,
          totalEnergy: snapshot.totalEnergy,
        })),
        energyAnalysis,
      );
    } else {
      // 如果没有原始快照，使用当前能量作为近似（向后兼容）
      console.warn('未找到原始节点快照，使用当前能量作为近似');
      E_raw_tenGod = [...E_balanced_tenGod];
    }
    
    // 2. 确定日主对应十神索引
    const dayMasterTenGodIndex = this.getDayMasterTenGodIndex(energyAnalysis);

    // 3. 识别病神（基于原始能量，节点级别计算）
    let diseaseIdentification: ReturnType<typeof identifyPrimaryDisease>;
    let dayMasterEnergy = 0;
    
    if (state.rawNodeSnapshots && state.rawNodeSnapshots.length > 0) {
      // 准备节点列表（包含十神信息）
      const nodesWithTenGod = this.addTenGodToNodes(
        state.rawNodeSnapshots.map((snapshot) => ({
          name: snapshot.name,
          nodeType: snapshot.nodeType,
          position: snapshot.position,
          totalEnergy: snapshot.totalEnergy,
        })),
        energyAnalysis,
      );
      
      // 计算日主能量（日干节点的能量）
      const dayStemNode = nodesWithTenGod.find(
        (n) => n.position.pillarIndex === 2 && n.position.positionType === 'stem'
      );
      dayMasterEnergy = dayStemNode?.totalEnergy || E_raw_tenGod[dayMasterTenGodIndex] || 1;
      
      // 使用节点级别计算
      diseaseIdentification = identifyPrimaryDisease(
        nodesWithTenGod,
        dayMasterTenGodIndex,
        dayMasterEnergy,
      );
    } else {
      // 向后兼容：如果没有节点快照，使用旧方法（基于汇总能量）
      console.warn('未找到原始节点快照，使用汇总能量方法（向后兼容）');
      dayMasterEnergy = E_raw_tenGod[dayMasterTenGodIndex] || 1;
      
      // 创建虚拟节点列表（用于兼容旧接口）
      const virtualNodes = E_raw_tenGod.map((energy, index) => ({
        name: INDEX_TO_TEN_GOD[index],
        nodeType: 'stem' as const,
        position: { pillarIndex: 0 as const, positionType: 'stem' as const },
        totalEnergy: energy,
        tenGod: INDEX_TO_TEN_GOD[index] as TenGodType,
      }));
      
      diseaseIdentification = identifyPrimaryDisease(
        virtualNodes,
        dayMasterTenGodIndex,
        dayMasterEnergy,
      );
    }

    // 4. 识别相神（基于能量损失）
    const xiangShenIdentification = identifyXiangShen(
      E_raw_tenGod,
      E_balanced_tenGod,
      dayMasterTenGodIndex,
    );

    // 5. 判断动作
    const action = determineAction(
      xiangShenIdentification.xiangShen?.tenGod || null,
      diseaseIdentification.primaryDisease?.tenGod || null,
    );

    // 6. 判断结果
    const results = identifyResult(
      E_raw_tenGod,
      E_balanced_tenGod,
      diseaseIdentification.primaryDisease?.tenGod || null,
      xiangShenIdentification.xiangShen?.tenGod || null,
      dayMasterTenGodIndex,
    );

    // 7. 生成格局名
    const patternName = generatePatternName(
      diseaseIdentification.primaryDisease?.tenGod || null,
      xiangShenIdentification.xiangShen?.tenGod || null,
      action,
      results,
    );

    // 8. 生成解释
    const description = generateExplanation(
      patternName,
      diseaseIdentification.primaryDisease?.tenGod || null,
      xiangShenIdentification.xiangShen?.tenGod || null,
      action,
      results,
    );

    // 9. 评估格局层次
    const evaluation = evaluatePatternLevel(
      E_raw_tenGod,
      E_balanced_tenGod,
      diseaseIdentification.primaryDisease?.tenGod || null,
      xiangShenIdentification.xiangShen?.tenGod || null,
      dayMasterTenGodIndex,
    );

    // 10. 构建病值分析结果（用于兼容旧接口和展示）
    const diseaseValues = this.calculateDiseaseValues(E_raw_tenGod, dayMasterTenGodIndex);
    const normalizedDiseaseValues = this.normalizeDiseaseValues(diseaseValues);
    const diseaseAnalyses: DiseaseValue[] = normalizedDiseaseValues.map((normValue, index) => {
      const tenGod = INDEX_TO_TEN_GOD[index];
      return {
        tenGod,
        index,
        energy: E_raw_tenGod[index],
        diseaseValue: diseaseValues[index],
        normalizedDiseaseValue: normValue,
        level: this.getDiseaseLevel(normValue),
      };
    });
    diseaseAnalyses.sort((a, b) => b.normalizedDiseaseValue - a.normalizedDiseaseValue);

    // 11. 寻找药物（用于调理方案）
    const primaryDiseaseIndex = diseaseIdentification.primaryDisease
      ? TEN_GOD_INDEX_MAP[diseaseIdentification.primaryDisease.tenGod]
      : -1;
    const E_total = E_balanced_tenGod.reduce((sum, e) => sum + e, 0);
    const medicines = primaryDiseaseIndex >= 0
      ? this.findMedicines(primaryDiseaseIndex, E_balanced_tenGod, E_total)
      : [];

    // 12. 构建格局判断结果
    const patternJudgment: PatternJudgment = {
      pattern: patternName,
      description,
      primaryDiseases: diseaseAnalyses.filter((d) => d.normalizedDiseaseValue >= DISEASE_THRESHOLDS.MODERATE),
      medicines,
      confidence: evaluation.totalScore / 100,
      calculationProcess: {
        E_raw: convertEnergiesToRecord(E_raw_tenGod),
        E_balanced: convertEnergiesToRecord(E_balanced_tenGod),
        diseaseIdentification: {
          threats: (diseaseIdentification.threats || []).map((t) => ({
            tenGod: t.tenGod,
            threat: t.threat,
            normalizedThreat: t.normalizedThreat,
          })),
          primaryDisease: diseaseIdentification.primaryDisease
            ? {
                tenGod: diseaseIdentification.primaryDisease.tenGod,
                threat: diseaseIdentification.primaryDisease.threat,
                normalizedThreat: diseaseIdentification.primaryDisease.normalizedThreat,
              }
            : {
                tenGod: INDEX_TO_TEN_GOD[0],
                threat: 0,
                normalizedThreat: 0,
              },
          // 添加节点级别的计算过程详情
          nodeThreatDetails: 'nodeThreatDetails' in diseaseIdentification
            ? diseaseIdentification.nodeThreatDetails
            : undefined,
          calculationSteps: 'calculationProcess' in diseaseIdentification
            ? diseaseIdentification.calculationProcess
            : undefined,
        },
        xiangShenIdentification: {
          lossRates: (xiangShenIdentification.lossRates || []).map((lr) => ({
            tenGod: lr.tenGod,
            lossRate: lr.lossRate,
            rawEnergy: lr.rawEnergy,
            balancedEnergy: lr.balancedEnergy,
          })),
          xiangShen: xiangShenIdentification.xiangShen
            ? {
                tenGod: xiangShenIdentification.xiangShen.tenGod,
                lossRate: xiangShenIdentification.xiangShen.lossRate,
                rawEnergy: xiangShenIdentification.xiangShen.rawEnergy,
                balancedEnergy: xiangShenIdentification.xiangShen.balancedEnergy,
              }
            : null,
        },
        action: action && diseaseIdentification.primaryDisease && xiangShenIdentification.xiangShen
          ? {
              xiangShen: xiangShenIdentification.xiangShen.tenGod,
              disease: diseaseIdentification.primaryDisease.tenGod,
              action: action as MedicineAction,
            }
          : null,
        results: (results || []).map((r) => ({
          tenGod: r.tenGod,
          increaseRate: r.increaseRate,
          rawEnergy: r.rawEnergy,
          balancedEnergy: r.balancedEnergy,
          resultType: r.resultType,
        })),
        evaluation: {
          totalScore: evaluation.totalScore,
          level: evaluation.level,
          details: evaluation.details,
        },
      },
    };

    // 13. 生成调理方案
    const medicinePlan = this.generateMedicinePlan(diseaseAnalyses, E_balanced_tenGod);

    return {
      patternJudgment,
      medicinePlan,
    };
  }


  /**
   * 获取日主对应十神索引
   * 
   * 日主通常对应比肩（索引0），但需要根据实际十神映射确定
   * 
   * @param energyAnalysis - 能量分析结果
   * @returns 日主对应十神索引
   */
  private getDayMasterTenGodIndex(energyAnalysis: EnergyAnalysis): number {
    // 默认日主对应比肩（索引0）
    if (energyAnalysis.tenGods?.day) {
      const dayTenGod = energyAnalysis.tenGods.day;
      return TEN_GOD_INDEX_MAP[dayTenGod] || 0;
    }
    return 0; // 默认比肩
  }

  /**
   * 判断格局（已废弃，使用基于能量平衡的新方法）
   * 
   * @deprecated 使用 analyzePatternAndMedicine 中的新方法
   */
  // 已废弃的方法，保留用于未来参考
  // @ts-expect-error - 未使用的方法
  private _judgePattern(
    _diseaseAnalyses: DiseaseValue[],
    _tenGodEnergies: number[],
  ): PatternJudgment {
    // 返回默认值（已废弃的方法）
    return {
      pattern: '平和格',
      description: '使用新的基于能量平衡的格局判断方法',
      primaryDiseases: [],
      medicines: [],
      confidence: 0.5,
    };
  }

  /**
   * 寻找药物
   * 
   * 对每个潜在药物 j，计算药物效力，判断是否有效
   * 
   * @param diseaseIndex - 病神十神索引
   * @param tenGodEnergies - 十神能量向量
   * @param E_total - 总能量
   * @returns 有效药物列表（按效力排序）
   */
  private findMedicines(
    diseaseIndex: number,
    tenGodEnergies: number[],
    E_total: number,
  ): Medicine[] {
    const medicines: Medicine[] = [];

    for (let j = 0; j < 10; j++) {
      // 跳过病神本身
      if (j === diseaseIndex) {
        continue;
      }

      // 计算药物效力
      const effectiveness = this.calculateMedicineEffectiveness(j, diseaseIndex, tenGodEnergies);

      // 判断是否有效
      const E_medicine = tenGodEnergies[j] || 0;
      const hasBasicEnergy = E_medicine >= 0.1 * E_total;
      const isEffective = effectiveness >= MEDICINE_THRESHOLD;

      if (isEffective && hasBasicEnergy) {
        const tenGod = INDEX_TO_TEN_GOD[j];
        const coefficient = MEDICINE_COEFFICIENTS[diseaseIndex]?.[j] || 0;

        medicines.push({
          tenGod,
          index: j,
          energy: E_medicine,
          effectiveness,
          action: this.getMedicineAction(coefficient),
          priority: this.getMedicinePriority(effectiveness),
          coefficient,
        });
      }
    }

    // 按效力排序（从大到小）
    medicines.sort((a, b) => b.effectiveness - a.effectiveness);

    return medicines;
  }

  /**
   * 去重药物（按十神类型）
   * 
   * @param medicines - 药物列表
   * @returns 去重后的药物列表
   */
  // 未使用的方法，保留用于未来参考
  // @ts-expect-error - 未使用的方法
  private _deduplicateMedicines(medicines: Medicine[]): Medicine[] {
    const map = new Map<TenGodType, Medicine>();

    for (const medicine of medicines) {
      const existing = map.get(medicine.tenGod);
      if (!existing || medicine.effectiveness > existing.effectiveness) {
        map.set(medicine.tenGod, medicine);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * 生成调理方案
   * 
   * @param diseaseAnalyses - 病值分析结果（已排序）
   * @param tenGodEnergies - 十神能量向量
   * @returns 调理方案
   */
  private generateMedicinePlan(
    diseaseAnalyses: DiseaseValue[],
    tenGodEnergies: number[],
  ): MedicinePlan {
    const primaryDisease = diseaseAnalyses[0];
    const E_total = tenGodEnergies.reduce((sum, e) => sum + e, 0);

    // 寻找药物
    const medicines = this.findMedicines(primaryDisease.index, tenGodEnergies, E_total);

    // 生成格局名称
    let pattern = '';
    let description = '';

    if (medicines.length > 0) {
      const diseaseInfo = TEN_GOD_NAMES[primaryDisease.tenGod];
      const bestMedicine = medicines[0];
      const medicineInfo = TEN_GOD_NAMES[bestMedicine.tenGod];
      pattern = `${medicineInfo.full}${bestMedicine.action}${diseaseInfo.full}格`;
      description = `主要病神为${diseaseInfo.full}，推荐使用${medicineInfo.full}${bestMedicine.action}之。`;
    } else {
      const diseaseInfo = TEN_GOD_NAMES[primaryDisease.tenGod];
      pattern = `${diseaseInfo.full}重症格`;
      description = `主要病神为${diseaseInfo.full}，但缺乏有效药物，需要特别注意。`;
    }

    // 计算置信度
    const confidence = Math.min(0.9, 0.5 + primaryDisease.normalizedDiseaseValue * 0.4);

    return {
      primaryDisease: {
        tenGod: primaryDisease.tenGod,
        diseaseValue: primaryDisease.diseaseValue,
        normalizedDiseaseValue: primaryDisease.normalizedDiseaseValue,
        level: primaryDisease.level,
      },
      medicines,
      pattern,
      confidence,
      description,
    };
  }
}

/**
 * 导出单例服务
 */
export const patternMedicineService = new PatternMedicineService();
