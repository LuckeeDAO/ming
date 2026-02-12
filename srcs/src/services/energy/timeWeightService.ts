/**
 * 时间权重服务
 *
 * 功能说明：
 * - 提供动态层（大运/流年/流月/流日/流时）的时间权重计算
 * - 根据时间层级返回对应的时间权重系数
 * - 用于在能量计算中调整动态层节点的影响权重
 *
 * 设计依据：
 * - 主文档《细节说明（参数公式与数据表）.md》4.8.2节
 * - 主文档《大运流年部分.md》3.2节
 *
 * 时间权重说明：
 * - 大运权重：T_luck（默认 1.2）
 * - 流年权重：T_year（默认 1.0）
 * - 流月权重：T_month（默认 0.4）
 * - 流日权重：T_day（默认 0.25）
 * - 流时权重：T_hour（默认 0.15）
 * - 本命节点：T = 1.0（基准权重）
 *
 * 使用方式：
 * ```ts
 * import { getTimeWeight, TimeLayer } from './timeWeightService';
 * import { DEFAULT_ENERGY_CONFIG } from './energyNodes';
 *
 * const weight = getTimeWeight('year', DEFAULT_ENERGY_CONFIG);
 * ```
 *
 * @module services/energy/timeWeightService
 */

import { EnergyCalculationConfig } from './energyNodes.js';

/**
 * 时间层级类型
 */
export type TimeLayer = 'luck' | 'year' | 'month' | 'day' | 'hour' | 'natal';

/**
 * 获取时间权重
 *
 * 功能说明：
 * - 根据时间层级返回对应的时间权重系数
 * - 本命节点（natal）返回 1.0（基准权重）
 * - 动态层节点返回配置中的对应权重
 *
 * @param layer - 时间层级（luck=大运, year=流年, month=流月, day=流日, hour=流时, natal=本命）
 * @param config - 能量计算配置（包含时间权重参数）
 * @returns 时间权重系数
 */
export function getTimeWeight(
  layer: TimeLayer,
  config: EnergyCalculationConfig,
): number {
  switch (layer) {
    case 'luck':
      return config.timeWeightLuck;
    case 'year':
      return config.timeWeightYear;
    case 'month':
      return config.timeWeightMonth;
    case 'day':
      return config.timeWeightDay;
    case 'hour':
      return config.timeWeightHour;
    case 'natal':
    default:
      return 1.0; // 本命节点基准权重
  }
}

/**
 * 计算有效权重
 *
 * 功能说明：
 * - 有效权重 = 位置权重 × 时间权重 × 位置作用矩阵系数
 * - 用于在能量计算中调整边的权重
 *
 * 公式：
 * W_effective = W_position × T_timeLayer × M[from][to]
 *
 * @param positionWeight - 位置权重（来自getPositionWeight）
 * @param timeWeight - 时间权重（来自getTimeWeight）
 * @param matrixCoeff - 位置作用矩阵系数（来自getPositionMatrixCoeff，默认1.0）
 * @returns 有效权重
 */
export function calculateEffectiveWeight(
  positionWeight: number,
  timeWeight: number,
  matrixCoeff: number = 1.0,
): number {
  return positionWeight * timeWeight * matrixCoeff;
}

/**
 * 时间权重配置说明
 *
 * 用于文档和注释，说明各时间权重的含义和建议值
 */
export const TIME_WEIGHT_DESCRIPTION: Record<
  TimeLayer,
  { name: string; description: string; default: number }
> = {
  luck: {
    name: '大运权重',
    description: '大运（10年一步）的时间权重，通常略大于流年',
    default: 1.2,
  },
  year: {
    name: '流年权重',
    description: '流年（1年）的时间权重，作为动态层的基准权重',
    default: 1.0,
  },
  month: {
    name: '流月权重',
    description: '流月（1月）的时间权重，通常小于流年',
    default: 0.4,
  },
  day: {
    name: '流日权重',
    description: '流日（1天）的时间权重，通常小于流月',
    default: 0.25,
  },
  hour: {
    name: '流时权重',
    description: '流时（1时辰=2小时）的时间权重，通常最小',
    default: 0.15,
  },
  natal: {
    name: '本命权重',
    description: '本命四柱的基准权重，固定为1.0',
    default: 1.0,
  },
};
