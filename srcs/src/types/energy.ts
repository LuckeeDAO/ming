/**
 * 四柱八字数据结构
 * 
 * 四柱八字是传统命理学的核心理论，由年、月、日、时四柱组成，每柱包含天干和地支
 * 
 * @interface FourPillars
 */
export interface FourPillars {
  /** 年柱（如：甲子）- 出生年份的天干地支 */
  year: string;
  /** 月柱 - 出生月份的天干地支 */
  month: string;
  /** 日柱 - 出生日期的天干地支 */
  day: string;
  /** 时柱 - 出生时辰的天干地支 */
  hour: string;
}

/**
 * 十神类型
 */
export type TenGodType = '比' | '劫' | '食' | '傷' | '才' | '財' | '殺' | '官' | 'ㄗ' | '印';

/**
 * 地支藏干十神数据结构
 */
export interface BranchTenGods {
  /** 藏干天干 */
  stem: string;
  /** 十神 */
  tenGod: TenGodType | null;
}

/**
 * 十神数据结构（包含天干和地支藏干）
 */
export interface TenGods {
  /** 年柱天干十神 */
  year: TenGodType | null;
  /** 年柱地支藏干十神列表 */
  yearBranch: BranchTenGods[];
  /** 月柱天干十神 */
  month: TenGodType | null;
  /** 月柱地支藏干十神列表 */
  monthBranch: BranchTenGods[];
  /** 日柱天干十神（通常为"比"） */
  day: TenGodType | null;
  /** 日柱地支藏干十神列表 */
  dayBranch: BranchTenGods[];
  /** 时柱天干十神 */
  hour: TenGodType | null;
  /** 时柱地支藏干十神列表 */
  hourBranch: BranchTenGods[];
}

/**
 * 格局分析结果
 */
export interface PatternAnalysis {
  /** 主导十神 */
  dominantTenGod: TenGodType | null;
  /** 格局名称 */
  pattern: string;
  /** 格局描述 */
  description: string;
  /** 格局特征 */
  characteristics: string[];
  /** 计算过程详情（可选） */
  calculationProcess?: {
    /** 步骤列表 */
    steps: Array<{
      /** 步骤序号 */
      step: number;
      /** 步骤描述 */
      description: string;
      /** 步骤详情数据 */
      details: Record<string, any>;
    }>;
    /** 十神统计结果 */
    tenGodCounts: Record<TenGodType, number>;
    /** 各柱十神分布详情 */
    pillarDetails: Array<{
      /** 柱名称 */
      pillar: string;
      /** 天干十神 */
      stemTenGod: TenGodType | null;
      /** 地支藏干十神列表 */
      branchTenGods: Array<{ stem: string; tenGod: TenGodType | null }>;
    }>;
  };
}

/**
 * 能量分析结果数据结构
 * 
 * 基于四柱八字分析得出的能量系统状态，包括五行能量分布、循环状态和缺失元素
 * 
 * @interface EnergyAnalysis
 */
export interface EnergyAnalysis {
  /** 钱包地址 - 分析对应的用户钱包地址 */
  walletAddress: string;
  /** 分析ID - 唯一标识本次分析 */
  analysisId: string;
  /** 四柱八字数据 - 用于分析的基础数据 */
  fourPillars: FourPillars;
  /** 五行能量分布 - 木、火、土、金、水的能量值和状态 */
  /** 能量状态：5级划分（命理学标准）
   * 
   * 注意：五行能量使用5级划分，但不包含"从弱/从强"概念。
   * "从弱/从强"是专门用于描述日主（日柱天干）的格局判断，不能用于其他五行。
   * 
   * - veryWeak: 极弱 - 能量极低，接近缺失
   * - weak: 弱 - 能量偏弱
   * - balanced: 中和 - 能量平衡
   * - strong: 强 - 能量偏强
   * - veryStrong: 极强 - 能量极强
   */
  fiveElements: {
    wood: {
      value: number;
      status: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong';
    };
    fire: {
      value: number;
      status: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong';
    };
    earth: {
      value: number;
      status: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong';
    };
    metal: {
      value: number;
      status: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong';
    };
    water: {
      value: number;
      status: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong';
    };
  };
  circulation: {
    status: 'smooth' | 'blocked' | 'weak';
    details: string;
    blockedPoints: string[];
  };
  missingElements: Array<{
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
    level: 'critical' | 'moderate' | 'minor';
    recommendation: string;
  }>;
  /**
   * 日主（身旺 / 身弱）判定结果（可选，5级划分）
   *
   * 命理学标准：极弱（从弱）/ 弱 / 中和（平和）/ 强 / 极强（从强）
   */
  dayMaster?: {
    /** 日柱天干（如：甲、乙等） */
    stem: string;
    /** 日主五行 */
    element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
    /** 日主对应五行的绝对能量值 */
    value: number;
    /** 身旺/身弱 判定（5级划分，与五行能量状态标准一致） */
    strength: 'veryWeak' | 'weak' | 'balanced' | 'strong' | 'veryStrong';
  };
  /**
   * 能量计算调试日志
   *
   * 记录 V2 量化算法在每一个关键步骤完成后的各节点能量快照，
   * 便于在前端展示为「检验标准」，用于对比与排查。
   */
  energyDebugLog?: Array<{
    /** 步骤标识（英文 key） */
    step: string;
    /** 步骤中文说明 */
    description: string;
    /** 当前步骤后各节点能量数据 */
    nodes: Array<{
      name: string;
      nodeType: 'stem' | 'branch';
      position: string;
      originalElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
      polarity: 'YANG' | 'YIN';
      totalEnergy: number;
      energies: Record<string, number>;
      flags: Record<string, boolean>;
    }>;
  }>;
  /** 十神分析 - 四柱十神数据 */
  tenGods?: TenGods;
  /** 格局分析 - 基于十神的格局判断 */
  patternAnalysis?: PatternAnalysis;
  /** 格局判断与调理方案 - 基于量化病值的格局判断与用药建议 */
  patternMedicine?: {
    patternJudgment: {
      pattern: string;
      description: string;
      primaryDiseases: Array<{
        tenGod: TenGodType;
        index: number;
        energy: number;
        diseaseValue: number;
        normalizedDiseaseValue: number;
        level: 'severe' | 'moderate' | 'mild' | 'none';
      }>;
      medicines: Array<{
        tenGod: TenGodType;
        index: number;
        energy: number;
        effectiveness: number;
        action: '制' | '化' | '泄';
        priority: 'primary' | 'secondary' | 'auxiliary';
        coefficient: number;
      }>;
      confidence: number;
      /** 计算过程详情（可选） */
      calculationProcess?: {
        /** 原始能量（计算前） */
        E_raw: Record<TenGodType, number>;
        /** 平衡后能量（计算后） */
        E_balanced: Record<TenGodType, number>;
        /** 病神识别过程 */
        diseaseIdentification: {
          threats: Array<{ tenGod: TenGodType; threat: number; normalizedThreat: number }>;
          primaryDisease: { tenGod: TenGodType; threat: number; normalizedThreat: number } | null;
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
        action: { xiangShen: TenGodType; disease: TenGodType; action: '制' | '化' | '泄' } | null;
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
    };
    medicinePlan: {
      primaryDisease: {
        tenGod: TenGodType;
        diseaseValue: number;
        normalizedDiseaseValue: number;
        level: 'severe' | 'moderate' | 'mild' | 'none';
      };
      medicines: Array<{
        tenGod: TenGodType;
        index: number;
        energy: number;
        effectiveness: number;
        action: '制' | '化' | '泄';
        priority: 'primary' | 'secondary' | 'auxiliary';
        coefficient: number;
      }>;
      pattern: string;
      confidence: number;
      description: string;
    };
  };
  analyzedAt: Date;
}

/**
 * 外物数据结构
 * 
 * 外物是用于连接仪式的外部对象，可以是自然物、矿物、植物等
 * 每个外物都有对应的五行属性，用于补充能量系统中的缺失元素
 * 
 * @interface ExternalObject
 */
export interface ExternalObject {
  /** 外物唯一ID */
  id: string;
  /** 外物名称（中文） */
  name: string;
  /** 外物名称（英文，可选） */
  nameEn?: string;
  /** 五行属性 - 木、火、土、金、水 */
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  /** 外物分类 - 自然、矿物、植物、水、火、其他 */
  category: 'nature' | 'mineral' | 'plant' | 'water' | 'fire' | 'other';
  /** 外物描述（中文） */
  description: string;
  /** 外物描述（英文，可选） */
  descriptionEn?: string;
  /** 外物图片URL */
  image: string;
  /** 外物象征图片URL（可选） */
  symbolImage?: string;
  /** 连接方法列表 - 提供多种连接方式 */
  connectionMethods: ConnectionMethod[];
  /** 推荐场景 - 适用于哪些能量缺失情况 */
  recommendedFor: Array<{
    element: string;
    reason: string;
  }>;
  /** 文化背景信息（可选） */
  culturalBackground?: {
    origin: string;
    meaning: string;
  };
}

/**
 * 连接方法数据结构
 * 
 * 描述如何与外物建立连接的详细方法，包括步骤、材料、难度等
 * 
 * @interface ConnectionMethod
 */
export interface ConnectionMethod {
  /** 连接类型 - 象征性、体验性、深度连接 */
  type: 'symbolic' | 'experiential' | 'deep';
  /** 连接方法名称 */
  name: string;
  /** 连接方法描述 */
  description: string;
  /** 连接步骤列表 - 按顺序执行 */
  steps: Array<{
    order: number;
    title: string;
    description: string;
    duration?: string;
  }>;
  /** 所需材料列表 */
  materials: Array<{
    name: string;
    required: boolean;
    alternatives?: string[];
  }>;
  /** 连接难度 - 简单、中等、困难 */
  difficulty: 'easy' | 'medium' | 'hard';
  /** 预计耗时 */
  estimatedTime: string;
}
