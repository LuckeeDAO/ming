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
  fiveElements: {
    wood: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
    };
    fire: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
    };
    earth: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
    };
    metal: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
    };
    water: {
      value: number;
      status: 'strong' | 'normal' | 'weak' | 'missing';
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
  /** 十神分析 - 四柱十神数据 */
  tenGods?: TenGods;
  /** 格局分析 - 基于十神的格局判断 */
  patternAnalysis?: PatternAnalysis;
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
