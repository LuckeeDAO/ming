/**
 * 五行能量节点与全局状态（V2 量化版）
 *
 * 参考文档：
 * - docs/04-开发指南/八字五行能量计算.md
 * - docs/temp/pwer2.txt
 *
 * 说明：
 * - 本文件实现五行节点模型、全局状态与核心辅助类型/配置
 * - 具体的八字能量计算流程在 energyQuantitativeService 中实现
 */

export type FiveElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export type NodeType = 'stem' | 'branch';

export type Polarity = 'YANG' | 'YIN';

export interface NodePosition {
  /** 柱索引：0=年、1=月、2=日、3=时 */
  pillarIndex: 0 | 1 | 2 | 3;
  /** 位置类型：干/支 */
  positionType: 'stem' | 'branch';
}

/**
 * 单个节点在某一步计算后的能量快照
 *
 * 用于在调试信息中记录每一步各节点的能量变化，方便校验算法过程。
 */
export interface NodeEnergySnapshot {
  /** 节点名称（如“甲”、“子”） */
  name: string;
  /** 节点类型（天干/地支） */
  nodeType: NodeType;
  /** 位置标签（如“年干”、“月支”等） */
  position: string;
  /** 原始五行属性 */
  originalElement: FiveElement;
  /** 阴阳属性 */
  polarity: Polarity;
  /** 节点总能量 */
  totalEnergy: number;
  /** 各五行属性能量 */
  energies: Record<string, number>;
  /** 状态标记（如 combined、clashed 等） */
  flags: Record<string, boolean>;
}

/**
 * 能量计算过程中的单条日志记录
 */
export interface EnergyLogEntry {
  /** 步骤标识（英文 key） */
  step: string;
  /** 步骤说明（中文描述） */
  description: string;
  /** 当前步骤完成后，各节点的能量快照 */
  nodes: NodeEnergySnapshot[];
}

/**
 * V2 能量计算配置
 *
 * 对应 docs/temp/pwer2.txt 中的「默认配置」。
 */
export interface EnergyCalculationConfig {
  /** 天干基础能量 */
  stemBaseEnergy: number;
  /** 地支基础能量 */
  branchBaseEnergy: number;

  /** 单个属性最小能量 */
  minEnergy: number;
  /** 单个属性最大能量 */
  maxEnergy: number;

  /**
   * 得根 / 得气 调整系数
   *
   * - rootGainFactor：在本气地支中“得根”时，对应天干原始属性能量的放大倍数
   * - qiGainFactor：在非本气但有藏干分布时“得气”对应的放大倍数
   */
  rootGainFactor: number;
  qiGainFactor: number;

  /** 相生增益（非循环） */
  relationGenerateGain: number;
  /** 循环增益（循环内统一增益） */
  cycleGenerateGain: number;

  /** 相克时克方损耗比例 */
  relationControlSourceLoss: number;
  /**
   * 相克时被克方最大损耗比例
   *
   * 说明：
   * - 在指数型相克算法中，这两个字段表示“默认最大损耗比例”，
   *   实际损耗比例会在 [minLossRatio, maxLoss] 区间内按能量比平滑变化。
   */
  relationControlTargetLoss: number;

  /**
   * 得令（按月令旺衰）调整系数
   *
   * - orderStrongFactor：元素在月令“当旺”时的放大倍数
   * - orderSecondaryFactor：受月令生扶（次旺）时的放大倍数
   * - orderWeakenFactor：被月令所克时的衰减倍数
   * - orderDrainedFactor：被月令所泄时的衰减倍数
   */
  orderStrongFactor: number;
  orderSecondaryFactor: number;
  orderWeakenFactor: number;
  orderDrainedFactor: number;

  /** 同阳时增益/损耗浮动（+3%） */
  sameYangDelta: number;
  /** 同阴时增益/损耗浮动（-3%） */
  sameYinDelta: number;

  /**
   * 透干（branch → stem 显化）调整系数
   *
   * - penetrationFactor：当某地支属性在其他天干中被“透出”时，对应地支该属性能量的放大倍数
   */
  penetrationFactor: number;

  /** 合化能量比阈值（>= 该值才视为有效合化） */
  combinationEnergyRatioThreshold: number;
  /** 合化双方基础贡献比例（各占 50%） */
  combinationContributionRatio: number;
  /** 合化池额外吸收外部能量比例（+50%） */
  combinationExternalGain: number;
  /**
   * 全局外部能量吸收比例调节参数
   *
   * 说明：
   * - 用于统一调节所有相生、相合、相会等过程的外部能量吸收比例
   * - 该参数会应用到所有外部能量吸收计算中，包括：
   *   - 地支合化（三会/三合/六合/半合）的外部能量吸收
   *   - 天干五合的外部能量吸收
   *   - 相生算法的外部能量吸收
   * - 默认值：0.1（10%），可根据实际效果调整
   * - 建议范围：0.05 ~ 0.30
   */
  globalExternalEnergyRatio: number;

  /**
   * 能量强弱判断阈值配置（5级划分）
   *
   * 命理学标准：极弱 / 弱 / 中和 / 强 / 极强
   *
   * 注意：五行能量使用5级划分，但不包含"从弱/从强"概念。
   * "从弱/从强"是专门用于描述日主（日柱天干）的格局判断，不能用于其他五行。
   *
   * 绝对阈值（基于基准能量 1000）：
   * - veryWeakThreshold: 极弱阈值（< 该值视为 veryWeak，默认 50，约 5% 基准）
   * - weakThreshold: 弱阈值（< 该值视为 weak，默认 300，约 30% 基准）
   * - balancedHighThreshold: 中和上限（< 该值视为 balanced，默认 2000，约 200% 基准）
   * - strongThreshold: 强阈值（> 该值视为 strong，默认 3000，约 300% 基准）
   * - veryStrongThreshold: 极强阈值（> 该值视为 veryStrong，默认 6000，约 600% 基准）
   *
   * 相对阈值（辅助判断，在中间区间使用）：
   * - veryWeakRelativeRatio: 相对极弱阈值（< 平均值×该比例视为 veryWeak，默认 0.2）
   * - weakRelativeRatio: 相对弱阈值（< 平均值×该比例视为 weak，默认 0.5）
   * - strongRelativeRatio: 相对强阈值（> 平均值×该比例视为 strong，默认 1.5）
   * - veryStrongRelativeRatio: 相对极强阈值（> 平均值×该比例视为 veryStrong，默认 2.5）
   */
  energyStatusVeryWeakThreshold: number;
  energyStatusWeakThreshold: number;
  energyStatusBalancedHighThreshold: number;
  energyStatusStrongThreshold: number;
  energyStatusVeryStrongThreshold: number;
  energyStatusVeryWeakRelativeRatio: number;
  energyStatusWeakRelativeRatio: number;
  energyStatusStrongRelativeRatio: number;
  energyStatusVeryStrongRelativeRatio: number;

  /**
   * 刑害处理参数（主文档《细节说明（参数公式与数据表）.md》14.4节）
   *
   * - punishLossRatio: 三刑损耗比例（默认 0.20，范围 0.15~0.30）
   * - harmLossRatio: 六害损耗比例（默认 0.15，范围 0.10~0.20）
   * - selfPunishLossRatio: 自刑损耗比例（默认 0.12，范围 0.10~0.20）
   */
  punishLossRatio: number;
  harmLossRatio: number;
  selfPunishLossRatio: number;

  /**
   * 位置作用矩阵开关（主文档《细节说明（参数公式与数据表）.md》4.8.3、4.8.4节）
   *
   * - enablePositionMatrix: 是否启用18×18位置作用矩阵（默认 false，仅使用位置权重）
   * - 启用后，边权重计算会额外乘上位置作用矩阵系数 M[from][to]
   */
  enablePositionMatrix: boolean;

  /**
   * 动态时间权重（主文档《细节说明（参数公式与数据表）.md》4.8.2节、《大运流年部分.md》3.2节）
   *
   * 用于大运/流年/流月/流日/流时等动态层的时间权重
   * - 大运权重：T_luck（默认 1.2）
   * - 流年权重：T_year（默认 1.0）
   * - 流月权重：T_month（默认 0.4）
   * - 流日权重：T_day（默认 0.25）
   * - 流时权重：T_hour（默认 0.15）
   *
   * 说明：
   * - 对本命节点：T_timeLayer = 1.0
   * - 对动态节点：使用相应层级的时间权重
   * - 有效权重 = 位置权重 × 时间权重 × 位置作用矩阵系数
   */
  timeWeightLuck: number;   // 大运权重
  timeWeightYear: number;    // 流年权重
  timeWeightMonth: number;   // 流月权重
  timeWeightDay: number;     // 流日权重
  timeWeightHour: number;    // 流时权重
}

/**
 * 默认配置（直接对应 pwer2.txt 中的默认配置）
 */
export const DEFAULT_ENERGY_CONFIG: EnergyCalculationConfig = {
  // 基础能量
  stemBaseEnergy: 1000,
  branchBaseEnergy: 1200,

  // 能量边界
  minEnergy: 10,
  maxEnergy: 10000,

  // 得根 / 得气基准系数
  rootGainFactor: 1.5,
  qiGainFactor: 1.2,

  // 相生参数
  relationGenerateGain: 0.3,
  cycleGenerateGain: 0.3,

  // 相克参数
  // 在指数型相克算法中，这里表示默认“最大损耗比例”
  relationControlSourceLoss: 0.25,
  relationControlTargetLoss: 0.35,

  // 得令（按月令旺衰）系数
  orderStrongFactor: 1.8,
  orderSecondaryFactor: 1.2,
  orderWeakenFactor: 0.9,
  orderDrainedFactor: 0.95,

  // 阴阳浮动
  sameYangDelta: 0.03,
  sameYinDelta: -0.03,

  // 透干系数
  penetrationFactor: 1.1,

  // 合化参数
  combinationEnergyRatioThreshold: 3,
  combinationContributionRatio: 0.5,
  combinationExternalGain: 0.5,
  // 全局外部能量吸收比例（统一调节所有生合会过程的外部能量吸收）
  globalExternalEnergyRatio: 0.1,

  // 能量强弱判断阈值（5级划分：极弱/弱/中和/强/极强）
  // 注意：五行能量使用5级划分，但不包含"从弱/从强"概念。
  // "从弱/从强"是专门用于描述日主（日柱天干）的格局判断。
  // 绝对阈值（基于基准能量 1000）
  energyStatusVeryWeakThreshold: 50,        // < 50 视为 极弱，约 5% 基准
  energyStatusWeakThreshold: 300,           // < 300 视为 弱，约 30% 基准
  energyStatusBalancedHighThreshold: 2000,   // < 2000 视为 中和上限，约 200% 基准
  energyStatusStrongThreshold: 3000,         // > 3000 视为 强，约 300% 基准
  energyStatusVeryStrongThreshold: 6000,     // > 6000 视为 极强，约 600% 基准
  // 相对阈值（辅助判断，在中间区间使用）
  energyStatusVeryWeakRelativeRatio: 0.2,    // < 20%×平均值 视为 极弱（相对判断）
  energyStatusWeakRelativeRatio: 0.5,       // < 50%×平均值 视为 弱（相对判断）
  energyStatusStrongRelativeRatio: 1.5,      // > 150%×平均值 视为 强（相对判断）
  energyStatusVeryStrongRelativeRatio: 2.5,  // > 250%×平均值 视为 极强（相对判断）

  // 刑害处理参数（主文档《细节说明（参数公式与数据表）.md》14.4节）
  // - 三刑损耗比例（默认 0.20，范围 0.15~0.30）
  punishLossRatio: 0.20,
  // - 六害损耗比例（默认 0.15，范围 0.10~0.20）
  harmLossRatio: 0.15,
  // - 自刑损耗比例（默认 0.12，范围 0.10~0.20）
  selfPunishLossRatio: 0.12,

  // 位置作用矩阵开关（主文档《细节说明（参数公式与数据表）.md》4.8.3、4.8.4节）
  // - 默认关闭，仅使用位置权重；启用后会额外乘上18×18位置作用矩阵系数
  enablePositionMatrix: false,

  // 动态时间权重（主文档《细节说明（参数公式与数据表）.md》4.8.2节、《大运流年部分.md》3.2节）
  // 用于大运/流年/流月/流日/流时等动态层的时间权重
  timeWeightLuck: 1.2,   // 大运权重（默认 1.2）
  timeWeightYear: 1.0,    // 流年权重（默认 1.0）
  timeWeightMonth: 0.4,   // 流月权重（默认 0.4）
  timeWeightDay: 0.25,   // 流日权重（默认 0.25）
  timeWeightHour: 0.15,  // 流时权重（默认 0.15）
};

/**
 * 单个节点（天干/地支）在 V2 量化算法中的表示
 */
export class FiveElementNode {
  /** 节点名称（如“甲”、“子”） */
  readonly name: string;
  /** 节点类型（天干/地支） */
  readonly nodeType: NodeType;
  /** 八字中的位置（年/月/日/时 × 干/支） */
  readonly position: NodePosition;
  /** 原始五行属性（如木/火/土/金/水） */
  readonly originalElement: FiveElement;
  /** 阴阳属性（阳/阴） */
  readonly polarity: Polarity;

  /**
   * 属性能量：
   * - 初始时只包含 originalElement
   * - 合化后可能新增属性（如“木火合”产生新的火属性能量）
   */
  private energies: Partial<Record<FiveElement, number>>;

  /**
   * 状态标记：
   * - 例如：`{ combined: true, clashed: true }`
   * - 仅用于标记节点在计算过程中的结构状态
   */
  readonly flags: Record<string, boolean>;

  /**
   * 作用次数计数器：
   * - 记录该节点位置参与生克关系的次数
   * - 用于计算能量有效值的衰减系数
   */
  private actionCount: number = 0;

  constructor(options: {
    name: string;
    nodeType: NodeType;
    position: NodePosition;
    originalElement: FiveElement;
    polarity: Polarity;
    baseEnergy: number;
  }) {
    const { name, nodeType, position, originalElement, polarity, baseEnergy } =
      options;

    this.name = name;
    this.nodeType = nodeType;
    this.position = position;
    this.originalElement = originalElement;
    this.polarity = polarity;

    this.energies = {
      [originalElement]: baseEnergy,
    };
    this.flags = {};
    this.actionCount = 0;
  }

  /**
   * 获取节点总能量（所有属性能量之和）
   */
  getTotalEnergy(): number {
    return (Object.values(this.energies) as number[]).reduce(
      (sum, v) => sum + (Number.isFinite(v) ? v : 0),
      0,
    );
  }

  /**
   * 获取指定属性的能量（不存在时返回 0）
   */
  getElementEnergy(element: FiveElement): number {
    const value = this.energies[element];
    return Number.isFinite(value as number) ? (value as number) : 0;
  }

  /**
   * 为指定属性更新能量（可正可负），自动应用边界处理
   */
  updateEnergy(
    element: FiveElement,
    delta: number,
    config: EnergyCalculationConfig,
  ): void {
    const current = this.getElementEnergy(element);
    let next = current + delta;

    if (next < config.minEnergy) {
      next = config.minEnergy;
    } else if (next > config.maxEnergy) {
      next = config.maxEnergy;
    }

    this.energies[element] = next;
  }

  /**
   * 添加新的属性（如果已存在则累加）
   */
  addElement(
    element: FiveElement,
    value: number,
    config: EnergyCalculationConfig,
  ): void {
    const current = this.getElementEnergy(element);
    this.updateEnergy(element, current === 0 ? value : value, config);
  }

  /**
   * 将总变化量按当前各属性比例分配到各属性
   *
   * - 若当前仅有一个属性，则全部加到该属性
   * - 若当前无属性（极端情况），则按原始属性新增
   */
  distributeEnergy(totalDelta: number, config: EnergyCalculationConfig): void {
    const entries = Object.entries(this.energies) as [FiveElement, number][];
    if (entries.length === 0) {
      // 极端兜底：只按原始属性增加
      this.updateEnergy(this.originalElement, totalDelta, config);
      return;
    }

    const totalCurrent = entries.reduce(
      (sum, [, v]) => sum + (Number.isFinite(v) ? v : 0),
      0,
    );

    if (totalCurrent <= 0) {
      // 若当前总能量非正，按均分处理
      const per = totalDelta / entries.length;
      entries.forEach(([el]) => {
        this.updateEnergy(el, per, config);
      });
      return;
    }

    entries.forEach(([el, v]) => {
      const ratio = v / totalCurrent;
      this.updateEnergy(el, totalDelta * ratio, config);
    });
  }

  /**
   * 设置/清除状态标记
   */
  setFlag(flag: string, value = true): void {
    this.flags[flag] = value;
  }

  /**
   * 查询状态标记
   */
  hasFlag(flag: string): boolean {
    return !!this.flags[flag];
  }

  /**
   * 获取当前节点的所有属性能量（用于调试快照）
   */
  getAllEnergies(): Record<string, number> {
    const result: Record<string, number> = {};
    (Object.entries(this.energies) as [FiveElement, number][]).forEach(
      ([el, v]) => {
        const safe = Number.isFinite(v) ? (v as number) : 0;
        result[el] = safe;
      },
    );
    return result;
  }

  /**
   * 获取当前作用次数
   */
  getActionCount(): number {
    return this.actionCount;
  }

  /**
   * 增加作用次数（每次参与生克关系时调用）
   */
  incrementActionCount(): void {
    this.actionCount++;
  }

  /**
   * 获取当前作用次数对应的能量有效值衰减系数
   * - 第1次作用：0.5
   * - 第2次作用：0.25
   * - 第3次作用：0.125
   * - 第4次及以后：0.125（保持最小值）
   */
  getActionEfficiency(): number {
    if (this.actionCount === 0) {
      return 1.0; // 未作用时，效率为100%
    }
    if (this.actionCount === 1) {
      return 0.5; // 第1次作用：50%
    }
    if (this.actionCount === 2) {
      return 0.25; // 第2次作用：25%
    }
    if (this.actionCount === 3) {
      return 0.125; // 第3次作用：12.5%
    }
    // 第4次及以后：保持12.5%
    return 0.125;
  }

  /**
   * 重置作用次数（用于重新计算时）
   */
  resetActionCount(): void {
    this.actionCount = 0;
  }
}

/**
 * 单条属性级别的「相生/相克」关系
 */
export interface ElementRelation {
  sourceNode: FiveElementNode;
  sourceElement: FiveElement;
  targetNode: FiveElementNode;
  targetElement: FiveElement;
}

/**
 * 五行循环信息（目前仅记录一个主循环）
 */
export interface FiveElementCycle {
  /** 按相生顺序排列的节点列表 */
  nodes: FiveElementNode[];
}

/**
 * 全局计算状态（V2 量化版）
 */
export class GlobalState {
  /** 所有节点 */
  nodes: FiveElementNode[] = [];
  /** 所有相生关系（属性级） */
  generateRelations: ElementRelation[] = [];
  /** 所有相克关系（属性级） */
  controlRelations: ElementRelation[] = [];
  /** 主五行循环信息（若存在） */
  mainCycle: FiveElementCycle | null = null;
  /** 配置参数 */
  readonly config: EnergyCalculationConfig;
  /** 计算过程日志（用于调试与校验） */
  logs: EnergyLogEntry[] = [];
  /** 基准能量（初始化后，应用月令校正之前，用于调试） */
  baseElementEnergies?: Record<FiveElement, number>;
  /** 基准节点快照（初始化后，应用月令校正之前，用于调试） */
  baseNodeSnapshots?: Array<{
    name: string;
    nodeType: NodeType;
    position: NodePosition;
    originalElement: FiveElement;
    polarity: Polarity;
    totalEnergy: number;
    energies: Record<string, number>;
  }>;
  /** 原始能量（相生相克之前，已应用月令校正、得根得气、合化等，用于格局判断） */
  rawElementEnergies?: Record<FiveElement, number>;
  /** 原始十神能量（相生相克之前，用于格局判断） */
  rawTenGodEnergies?: number[];
  /** 原始节点快照（相生相克之前，已应用月令校正、得根得气、合化等，用于计算原始十神能量） */
  rawNodeSnapshots?: Array<{
    name: string;
    nodeType: NodeType;
    position: NodePosition;
    originalElement: FiveElement;
    polarity: Polarity;
    totalEnergy: number;
    energies: Record<string, number>;
  }>;

  constructor(config: EnergyCalculationConfig = DEFAULT_ENERGY_CONFIG) {
    this.config = config;
  }

  /**
   * 生成当前所有节点的能量快照
   */
  private snapshotNodes(): NodeEnergySnapshot[] {
    const pillarLabel = (index: 0 | 1 | 2 | 3): string => {
      switch (index) {
        case 0:
          return '年';
        case 1:
          return '月';
        case 2:
          return '日';
        case 3:
          return '时';
        default:
          return '';
      }
    };

    return this.nodes.map((n) => {
      const pos =
        pillarLabel(n.position.pillarIndex) +
        (n.position.positionType === 'stem' ? '干' : '支');
      return {
        name: n.name,
        nodeType: n.nodeType,
        position: pos,
        originalElement: n.originalElement,
        polarity: n.polarity,
        totalEnergy: n.getTotalEnergy(),
        energies: n.getAllEnergies(),
        flags: { ...n.flags },
      };
    });
  }

  /**
   * 追加一步计算日志
   */
  addLog(step: string, description: string): void {
    this.logs.push({
      step,
      description,
      nodes: this.snapshotNodes(),
    });
  }
}

