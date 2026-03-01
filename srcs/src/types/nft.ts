/**
 * 链上NFT数据结构
 * 
 * 存储在区块链上的NFT基本信息
 * 
 * @interface NFTOnChain
 */
export interface NFTOnChain {
  /** Token ID - NFT的唯一标识 */
  tokenId: string;
  /** 所有者地址 - NFT当前拥有者的钱包地址 */
  owner: string;
  /** 合约地址 - NFT合约的地址 */
  contractAddress: string;
  /** Token URI - IPFS元数据URI */
  tokenURI: string;
  /** 铸造时间 - Unix时间戳 */
  mintedAt: number;
  /** 交易哈希 - 铸造NFT的交易哈希 */
  txHash: string;
  /** 区块号 - 铸造NFT的区块号 */
  blockNumber: number;
}

/**
 * NFT类型枚举
 * 
 * 支持三阶段发展路线图的不同NFT类型
 */
export enum NFTType {
  /** 第一阶段：共识NFT */
  ELEMENT_BADGE = 'element_badge',           // 五行能量徽章
  SOLAR_TERM = 'solar_term',                 // 节气节日仪式
  BLESSING = 'blessing',                     // 祝福传递
  
  /** 第二阶段：命理定制NFT */
  DESTINY_CONNECTION = 'destiny_connection', // 命理连接（原有功能）
  PERSONALIZED_RECOMMENDATION = 'personalized_recommendation', // 个性化推荐
  CUSTOM_CEREMONY = 'custom_ceremony',       // 定制化仪式
  
  /** 第三阶段：AI增强NFT */
  AI_PORTRAIT = 'ai_portrait',               // AI能量肖像
  DYNAMIC_ENERGY = 'dynamic_energy',         // 动态能量视觉化
}

/**
 * 五行元素类型
 */
export type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/**
 * NFT元数据结构
 * 
 * 存储在IPFS上的NFT元数据，符合ERC-721元数据标准
 * 支持三阶段发展路线图的所有NFT类型
 * 
 * @interface NFTMetadata
 */
export interface NFTMetadata {
  /** NFT名称 */
  name: string;
  /** NFT描述 */
  description: string;
  /** NFT图片URL（IPFS） */
  image: string;
  /** NFT类型 */
  type: NFTType;
  /** 属性列表 - 用于展示NFT特征 */
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  
  /** ========== 第一阶段：共识NFT ========== */
  /** 五行能量徽章信息（可选） */
  elementBadge?: {
    element: ElementType;
    elementName: string; // 中文：'木'、'火'、'土'、'金'、'水'
    energyDescription: string;
  };
  /** 节气节日信息（可选） */
  solarTerm?: {
    term: string; // 节气名称
    year: string; // 年份（如：'甲辰年'）
    date: string; // 日期
    culturalDescription: string;
  };
  /** 祝福传递信息（可选） */
  blessing?: {
    text: string;
    from: string; // 发送者地址
    to?: string; // 接收者地址（可选）
    timestamp: string;
    transferPath?: string[]; // 传递路径
  };
  
  /** ========== 第二阶段：命理定制NFT ========== */
  /** 连接信息 - 外物连接的相关信息（保留兼容性） */
  connection?: {
    externalObjectId: string;
    externalObjectName: string;
    element: string;
    connectionType: string;
    connectionDate: string;
  };
  /** 个人命盘信息（可选，第二阶段） */
  personalChart?: {
    fourPillars: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    usefulGods?: string[]; // 喜用神
    avoidGods?: string[]; // 忌神
    pattern?: string; // 格局
  };
  /** 个性化推荐信息（可选，第二阶段） */
  personalizedRecommendation?: {
    reason: string; // 推荐理由
    combinationEffects?: string[]; // 组合效应
    targetElements?: ElementType[]; // 目标能量
  };
  /** 定制化仪式信息（可选，第二阶段） */
  customCeremony?: {
    planType: 'annual' | 'seasonal' | 'monthly'; // 计划类型
    effectivePeriod: {
      start: string;
      end: string;
    };
    elementWeights: Record<ElementType, number>; // 五行权重
    adjustmentAdvice: string; // 调理建议
  };
  
  /** ========== 第三阶段：AI增强NFT ========== */
  /** AI生成信息（可选，第三阶段） */
  aiGeneration?: {
    prompt: string; // 生成提示词
    generationParams: {
      style: 'traditional' | 'modern' | 'abstract';
      emphasis: 'destiny' | 'consensus' | 'balanced';
      colorScheme: string[];
    };
    model: string; // 使用的AI模型
    version: string; // 模型版本
  };
  /** 动态属性信息（可选，第三阶段） */
  dynamicAttributes?: {
    updateTriggers: string[]; // 更新触发条件（'time'、'consensus'、'behavior'）
    lastUpdate: string; // 最后更新时间
    updateHistory?: Array<{
      timestamp: string;
      trigger: string;
      changes: string[];
    }>;
  };
  /** 能量叙事（可选，第三阶段） */
  energyStory?: {
    composition: string; // 能量构成解读
    story: string; // AI生成的叙事
    visualElements: string[]; // 视觉元素说明
  };
  
  /** ========== 通用信息 ========== */
  /** 仪式信息（可选） */
  ceremony?: {
    location?: string;
    duration?: string;
    participants?: number;
  };
  /** 感受记录（可选） */
  feelings?: {
    before: string;
    during: string;
    after: string;
  };
  /** 定时铸造信息（可选） */
  scheduledMint?: {
    scheduledTime: string;
    mintedTime?: string;
    planId?: string;
  };
  /** 封局释放评价（可选） */
  releaseEvaluation?: {
    completionScore: number; // 履约完成度 1-5
    resonanceScore: number; // 自我共振度 1-5
    publicNarrative: string; // 公开叙事摘要
    nextStageGoal: string; // 下一阶段意图
    releasedAt: string; // 释放时间
    version: '1.0';
  };
  /** 能量场见证信息 */
  energyField: {
    consensusHash: string;
    witnessCount?: number;
  };
  /** 元数据版本信息 */
  metadata: {
    version: string;
    createdAt: string;
    platform: 'ming';
    stage?: 'consensus' | 'destiny' | 'ai'; // 所属阶段
  };
}

/**
 * 连接记录数据结构
 * 
 * 完整记录一次外物连接仪式的所有信息，包括链上数据和链下数据
 * 支持三阶段发展路线图的所有NFT类型
 * 
 * @interface ConnectionRecord
 */
export interface ConnectionRecord {
  /** 记录唯一ID */
  id: string;
  /** 钱包地址 - 连接仪式的用户钱包地址 */
  walletAddress: string;
  /** NFT Token ID - 关联的NFT Token ID */
  nftTokenId: string;
  /** NFT合约地址 */
  nftContractAddress: string;
  /** NFT类型 */
  nftType: NFTType;
  
  /** ========== 第一阶段：共识NFT ========== */
  /** 五行能量徽章信息（可选） */
  elementBadge?: {
    element: ElementType;
    elementName: string;
  };
  /** 节气节日信息（可选） */
  solarTerm?: {
    term: string;
    year: string;
  };
  /** 祝福传递信息（可选） */
  blessing?: {
    text: string;
    to?: string;
  };
  
  /** ========== 第二阶段：命理定制NFT ========== */
  /** 外物信息（保留兼容性） */
  externalObject?: {
    id: string;
    name: string;
    element: string;
  };
  /** 个人命盘信息（可选，第二阶段） */
  personalChart?: {
    fourPillars: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    usefulGods?: string[];
  };
  /** 个性化推荐信息（可选，第二阶段） */
  personalizedRecommendation?: {
    reason: string;
    combinationEffects?: string[];
  };
  /** 定制化仪式信息（可选，第二阶段） */
  customCeremony?: {
    planType: 'annual' | 'seasonal' | 'monthly';
    effectivePeriod: {
      start: string;
      end: string;
    };
  };
  
  /** ========== 第三阶段：AI增强NFT ========== */
  /** AI生成信息（可选，第三阶段） */
  aiGeneration?: {
    prompt: string;
    model: string;
  };
  /** 动态属性信息（可选，第三阶段） */
  dynamicAttributes?: {
    updateTriggers: string[];
    lastUpdate: string;
  };
  
  /** ========== 通用信息 ========== */
  /** 连接日期 */
  connectionDate: Date;
  /** 连接类型 */
  connectionType: string;
  /** 仪式信息（可选） */
  ceremony?: {
    location?: string;
    duration?: string;
    notes?: string;
  };
  /** 感受记录 - 连接前、中、后的感受 */
  feelings: {
    before: string;
    during: string;
    after: string;
    updatedAt: Date;
  };
  /** 区块链信息 */
  blockchain: {
    txHash: string;
    blockNumber: number;
    gasUsed?: number;
  };
  /** IPFS存储信息 */
  ipfs: {
    metadataHash: string;
    imageHash?: string;
  };
  /** 记录状态 - 草稿、已铸造、已完成 */
  status: 'draft' | 'minted' | 'completed';
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 共识池数据结构
 * 
 * 第一阶段：共识铸造厂的核心数据结构
 * 
 * @interface ConsensusPool
 */
export interface ConsensusPool {
  /** 池类型 */
  type: 'element' | 'solar_term' | 'blessing';
  /** 具体标识（如：'wood'、'立春'等） */
  identifier: string;
  /** 参与人数 */
  participantCount: number;
  /** 总供应量 */
  totalSupply: number;
  /** 最后更新时间 */
  lastUpdate: number;
  /** 能量池强度（0-100） */
  intensity?: number;
}

/**
 * 能量仪表盘数据结构
 * 
 * 第二阶段：命理调节舱的核心数据结构
 * 
 * @interface EnergyDashboard
 */
export interface EnergyDashboard {
  /** 用户钱包地址 */
  walletAddress: string;
  /** 五行能量值 */
  fiveElements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  /** NFT能量贡献度 */
  nftContributions: Array<{
    tokenId: string;
    element: ElementType;
    contribution: number;
  }>;
  /** 能量变化趋势 */
  trends: Array<{
    date: string;
    elements: Record<ElementType, number>;
  }>;
  /** 最后更新时间 */
  lastUpdate: string;
}
