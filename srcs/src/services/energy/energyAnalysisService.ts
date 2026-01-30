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
 * 
 * 算法说明：
 * 1. 五行能量计算：统计四柱八字中天干地支对应的五行出现次数
 * 2. 能量状态判断：根据出现次数与平均值比较，判断为旺盛/正常/偏弱/缺失
 * 3. 循环检测：检查是否存在缺失或偏弱的元素，判断循环是否受阻
 * 4. 外物推荐：根据缺失元素的严重程度，推荐对应属性的外物
 * 
 * @module services/energy/energyAnalysisService
 */
import { FourPillars, EnergyAnalysis, ExternalObject } from '../../types/energy';

class EnergyAnalysisService {
  /**
   * 分析四柱八字的能量系统
   * 
   * @param fourPillars - 四柱八字数据
   * @returns 能量分析结果
   */
  analyze(fourPillars: FourPillars): EnergyAnalysis {
    // 计算五行能量分布
    const fiveElements = this.calculateFiveElements(fourPillars);

    // 检测能量循环
    const circulation = this.checkCirculation(fiveElements);

    // 识别缺失元素
    const missingElements = this.identifyMissingElements(fiveElements);

    return {
      walletAddress: '', // 需要从外部传入
      analysisId: this.generateAnalysisId(),
      fourPillars,
      fiveElements,
      circulation,
      missingElements,
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
   * 计算五行能量分布
   * 私有方法
   */
  private calculateFiveElements(fourPillars: FourPillars) {
    // 天干地支对应的五行映射（简化版）
    const elementMap: Record<string, 'wood' | 'fire' | 'earth' | 'metal' | 'water'> = {
      // 天干
      甲: 'wood', 乙: 'wood',
      丙: 'fire', 丁: 'fire',
      戊: 'earth', 己: 'earth',
      庚: 'metal', 辛: 'metal',
      壬: 'water', 癸: 'water',
      // 地支（简化）
      子: 'water', 丑: 'earth', 寅: 'wood', 卯: 'wood',
      辰: 'earth', 巳: 'fire', 午: 'fire', 未: 'earth',
      申: 'metal', 酉: 'metal', 戌: 'earth', 亥: 'water',
    };

    const counts = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
    };

    // 统计各柱的五行
    Object.values(fourPillars).forEach((pillar: string) => {
      const elements = pillar.split('').map((char: string) => elementMap[char]);
      elements.forEach((element: 'wood' | 'fire' | 'earth' | 'metal' | 'water' | undefined) => {
        if (element) counts[element]++;
      });
    });

    // 计算能量值和状态
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const avg = total / 5;

    return {
      wood: {
        value: (counts.wood / total) * 100,
        status: this.getStatus(counts.wood, avg),
      },
      fire: {
        value: (counts.fire / total) * 100,
        status: this.getStatus(counts.fire, avg),
      },
      earth: {
        value: (counts.earth / total) * 100,
        status: this.getStatus(counts.earth, avg),
      },
      metal: {
        value: (counts.metal / total) * 100,
        status: this.getStatus(counts.metal, avg),
      },
      water: {
        value: (counts.water / total) * 100,
        status: this.getStatus(counts.water, avg),
      },
    };
  }

  /**
   * 获取能量状态
   * 私有方法
   */
  private getStatus(
    count: number,
    avg: number
  ): 'strong' | 'normal' | 'weak' | 'missing' {
    if (count === 0) return 'missing';
    if (count < avg * 0.5) return 'weak';
    if (count > avg * 1.5) return 'strong';
    return 'normal';
  }

  /**
   * 检测能量循环
   * 私有方法
   */
  private checkCirculation(fiveElements: EnergyAnalysis['fiveElements']) {
    const weakElements = Object.entries(fiveElements)
      .filter(([_, data]) => data.status === 'weak' || data.status === 'missing')
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
      if (data.status === 'missing') {
        missing.push({
          element: element as 'wood' | 'fire' | 'earth' | 'metal' | 'water',
          level: 'critical',
          recommendation: `建议连接${element}属性的外物`,
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
