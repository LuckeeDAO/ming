/**
 * 能量分析服务
 * 
 * 基于四柱八字进行能量系统分析的核心服务
 * 
 * 功能：
 * - 计算五行能量分布（木、火、土、金、水）
 * - 检测能量循环状态（顺畅/受阻/偏弱）
 * - 识别缺失元素及其严重程度
 * - 根据分析结果推荐合适的外物
 * - 计算十神并分析格局（基于chinese-lunar-master算法）
 * 
 * 算法说明：
 * 1. 五行能量计算：统计四柱八字中天干地支对应的五行出现次数
 * 2. 能量状态判断：根据出现次数与平均值比较，判断为旺盛/正常/偏弱/缺失
 * 3. 循环检测：检查是否存在缺失或偏弱的元素，判断循环是否受阻
 * 4. 外物推荐：根据缺失元素的严重程度，推荐对应属性的外物
 * 5. 十神分析：基于日柱天干计算各柱的十神关系
 * 6. 格局分析：根据十神分布判断命理格局
 * 
 * @module services/energy/energyAnalysisService
 */
import { FourPillars, EnergyAnalysis, ExternalObject } from '../../types/energy.js';
import { calculateQuantitativeEnergies } from './energyQuantitativeService.js';
import { DEFAULT_ENERGY_CONFIG } from './energyNodes.js';
import { tenGodService } from './tenGodService.js';
import { patternMedicineService } from './patternMedicineService.js';

class EnergyAnalysisService {
  /**
   * 分析四柱八字的能量系统
   * 
   * @param fourPillars - 四柱八字数据
   * @param config - 能量计算配置（可选）
   * @returns 能量分析结果
   */
  analyze(fourPillars: FourPillars, config = DEFAULT_ENERGY_CONFIG): EnergyAnalysis {
    // V2：先按量化版算法计算五行能量（绝对值），再映射为状态
    const { elementEnergies, debugLog, state } = calculateQuantitativeEnergies(
      fourPillars,
      config,
    );
    const fiveElements = this.normalizeQuantitativeEnergies(elementEnergies, config);

    // 检测能量循环
    const circulation = this.checkCirculation(fiveElements);

    // 识别缺失元素
    const missingElements = this.identifyMissingElements(fiveElements);

    // 计算十神
    const tenGods = tenGodService.calculateTenGods(fourPillars);

    // 分析格局（传统方法）
    const patternAnalysis = tenGodService.analyzePattern(tenGods);

    // 格局判断与调理方案（量化方法）
    let patternMedicine;
    try {
      const tempAnalysis: EnergyAnalysis = {
        walletAddress: '',
        analysisId: '',
        fourPillars,
        fiveElements,
        circulation,
        missingElements,
        tenGods,
        patternAnalysis,
        analyzedAt: new Date(),
      };
      const result = patternMedicineService.analyzePatternAndMedicine(tempAnalysis, state);
      patternMedicine = result;
    } catch (error) {
      console.warn('格局判断与调理分析失败:', error);
      // 不阻断主流程，patternMedicine 保持 undefined
    }

    // 日主（身旺 / 身弱）判定（5级划分：极弱/弱/中和/强/极强）
    // - 取日柱天干对应的五行
    // - 使用与五行能量相同的5级判断标准
    const dayStem = fourPillars.day.charAt(0);
    const stemElementMap: Record<string, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
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
    const dayElement = stemElementMap[dayStem];
    let dayMaster:
      | {
          stem: string;
          element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
          value: number;
          strength: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong';
        }
      | undefined;

    if (dayElement) {
      const total =
        elementEnergies.wood +
        elementEnergies.fire +
        elementEnergies.earth +
        elementEnergies.metal +
        elementEnergies.water;
      const avg = total / 5;
      const value = elementEnergies[dayElement];

      // 使用与五行能量相同的5级判断标准
      const strength = this.getStatus(value, avg, config);

      dayMaster = {
        stem: dayStem,
        element: dayElement,
        value,
        strength,
      };
    }

    return {
      walletAddress: '', // 需要从外部传入
      analysisId: this.generateAnalysisId(),
      fourPillars,
      fiveElements,
      circulation,
      missingElements,
      tenGods,
      patternAnalysis,
      ...(patternMedicine && { patternMedicine }),
      ...(dayMaster && { dayMaster }),
      energyDebugLog: debugLog,
      analyzedAt: new Date(),
    };
  }

  /**
   * 根据能量分析结果推荐外物
   * 
   * @param analysis - 能量分析结果
   * @param availableObjects - 可用的外物列表
   * @returns 推荐的外物列表
   */
  recommendObjects(
    analysis: EnergyAnalysis,
    availableObjects: ExternalObject[]
  ): ExternalObject[] {
    const recommendations: ExternalObject[] = [];

    // 根据缺失元素推荐外物
    for (const missing of analysis.missingElements) {
      const matching = availableObjects.filter(
        (obj) => obj.element === missing.element
      );
      recommendations.push(...matching);
    }

    // 按缺失程度排序
    recommendations.sort((a, b) => {
      const aLevel = analysis.missingElements.find(
        (m) => m.element === a.element
      )?.level;
      const bLevel = analysis.missingElements.find(
        (m) => m.element === b.element
      )?.level;

      const levelPriority = { critical: 3, moderate: 2, minor: 1 };
      return (
        (levelPriority[bLevel as keyof typeof levelPriority] || 0) -
        (levelPriority[aLevel as keyof typeof levelPriority] || 0)
      );
    });

    return recommendations;
  }

  /**
   * 将 V2 量化能量映射为「绝对能量值 + 状态」
   *
   * 说明：
   * - elementEnergies 中已是基于「天干 1000 / 地支 1200」的量化能量
   * - 这里不再换算为百分比，而是直接保留绝对值，便于与后续能量图统一
   * - 状态基于改进的混合判断标准：绝对阈值 + 相对阈值
   * 私有方法
   */
  private normalizeQuantitativeEnergies(
    elementEnergies: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    },
    config = DEFAULT_ENERGY_CONFIG
  ) {
    const total = Object.values(elementEnergies).reduce((sum, v) => {
      const safe = Number.isFinite(v) ? (v as number) : 0;
      return sum + safe;
    }, 0);

    if (total <= 0) {
      // 极端兜底：给每个五行一个基础值，全部视为中和
      const base = 1000;
      return {
        wood: { value: base, status: 'balanced' as const },
        fire: { value: base, status: 'balanced' as const },
        earth: { value: base, status: 'balanced' as const },
        metal: { value: base, status: 'balanced' as const },
        water: { value: base, status: 'balanced' as const },
      };
    }

    const avg = total / 5;

    return {
      wood: {
        value: elementEnergies.wood,
        status: this.getStatus(elementEnergies.wood, avg, config),
      },
      fire: {
        value: elementEnergies.fire,
        status: this.getStatus(elementEnergies.fire, avg, config),
      },
      earth: {
        value: elementEnergies.earth,
        status: this.getStatus(elementEnergies.earth, avg, config),
      },
      metal: {
        value: elementEnergies.metal,
        status: this.getStatus(elementEnergies.metal, avg, config),
      },
      water: {
        value: elementEnergies.water,
        status: this.getStatus(elementEnergies.water, avg, config),
      },
    };
  }

  /**
   * 获取能量状态（5级划分：极弱/弱/中和/强/极强）
   *
   * 设计原则：
   * 1. 绝对阈值优先：基于能量范围 [10, 10000] 和基准值 1000
   * 2. 相对阈值辅助：在绝对阈值边界模糊时，参考相对平均值
   * 3. 避免极端情况误判：所有五行都很弱或某个极强时，仍能准确判断
   *
   * 5级划分（命理学标准）：
   * - veryWeak（极弱）: < 50（约 5% 基准）或 < 20%×平均值
   * - weak（弱）: 50 ~ 300（5% ~ 30% 基准）或 20%×平均值 ~ 50%×平均值
   * - balanced（中和）: 300 ~ 2000（30% ~ 200% 基准）且 50%×平均值 ~ 150%×平均值
   * - strong（强）: 2000 ~ 6000（200% ~ 600% 基准）或 150%×平均值 ~ 250%×平均值
   * - veryStrong（极强）: > 6000（> 600% 基准）或 > 250%×平均值
   *
   * 注意：五行能量使用5级划分，但不包含"从弱/从强"概念。
   * "从弱/从强"是专门用于描述日主（日柱天干）的格局判断，不能用于其他五行。
   *
   * @param value - 当前五行能量值
   * @param avg - 五个五行能量的平均值
   * @param config - 能量计算配置（可选，默认使用 DEFAULT_ENERGY_CONFIG）
   * @returns 能量状态：veryWeak / weak / balanced / strong / veryStrong
   */
  private getStatus(
    value: number,
    avg: number,
    config = DEFAULT_ENERGY_CONFIG
  ): 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong' {
    const {
      energyStatusVeryWeakThreshold,
      energyStatusWeakThreshold,
      energyStatusBalancedHighThreshold,
      energyStatusStrongThreshold,
      energyStatusVeryStrongThreshold,
      energyStatusVeryWeakRelativeRatio,
      energyStatusWeakRelativeRatio,
      energyStatusStrongRelativeRatio,
      energyStatusVeryStrongRelativeRatio,
    } = config;

    // 1. 绝对阈值：极弱（从弱）（优先判断）
    if (value < energyStatusVeryWeakThreshold) {
      return 'veryWeak';
    }

    // 2. 绝对阈值：极强（从强）
    if (value > energyStatusVeryStrongThreshold) {
      return 'veryStrong';
    }

    // 3. 绝对阈值：弱
    if (value < energyStatusWeakThreshold) {
      // 在 50~300 区间，结合相对判断
      const relativeRatio = avg > 0 ? value / avg : 1;
      if (relativeRatio < energyStatusVeryWeakRelativeRatio) {
        return 'veryWeak';  // < 20% 平均值，仍视为极弱
      }
      return 'weak';
    }

    // 4. 绝对阈值：强
    if (value > energyStatusStrongThreshold) {
      // 在 3000~6000 区间，结合相对判断
      const relativeRatio = avg > 0 ? value / avg : 1;
      if (relativeRatio > energyStatusVeryStrongRelativeRatio) {
        return 'veryStrong';  // > 250% 平均值，视为极强
      }
      return 'strong';
    }

    // 5. 中间区间（weakThreshold ~ strongThreshold，即 300 ~ 3000）：结合相对判断
    const relativeRatio = avg > 0 ? value / avg : 1;
    
    // 5.1 在弱区间（300 ~ 2000）
    if (value < energyStatusBalancedHighThreshold) {
      if (relativeRatio < energyStatusWeakRelativeRatio) {
        return 'weak';      // < 50% 平均值
      }
      return 'balanced';    // 50% ~ 150% 平均值
    }

    // 5.2 在强区间（2000 ~ 3000）
    if (relativeRatio > energyStatusStrongRelativeRatio) {
      return 'strong';      // > 150% 平均值
    }
    return 'balanced';       // 在合理范围内
  }

  /**
   * 检测能量循环
   * 私有方法
   */
  private checkCirculation(fiveElements: EnergyAnalysis['fiveElements']) {
    const weakElements = Object.entries(fiveElements)
      .filter(([_, data]) => data.status === 'veryWeak' || data.status === 'weak')
      .map(([element]) => element);

    if (weakElements.length === 0) {
      return {
        status: 'smooth' as const,
        details: '能量循环顺畅',
        blockedPoints: [],
      };
    }

    return {
      status: 'blocked' as const,
      details: `能量循环受阻，缺失元素：${weakElements.join(', ')}`,
      blockedPoints: weakElements,
    };
  }

  /**
   * 识别缺失元素
   * 私有方法
   */
  private identifyMissingElements(
    fiveElements: EnergyAnalysis['fiveElements']
  ): EnergyAnalysis['missingElements'] {
    const missing: EnergyAnalysis['missingElements'] = [];

    Object.entries(fiveElements).forEach(([element, data]) => {
      if (data.status === 'veryWeak') {
        missing.push({
          element: element as 'wood' | 'fire' | 'earth' | 'metal' | 'water',
          level: 'critical',
          recommendation: `建议连接${element}属性的外物（极弱，急需补充）`,
        });
      } else if (data.status === 'weak') {
        missing.push({
          element: element as 'wood' | 'fire' | 'earth' | 'metal' | 'water',
          level: 'moderate',
          recommendation: `建议补充${element}属性的外物`,
        });
      }
    });

    return missing;
  }

  /**
   * 生成分析 ID
   * 私有方法
   */
  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const energyAnalysisService = new EnergyAnalysisService();
