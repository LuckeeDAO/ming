/**
 * 钱包接口类型定义
 * 
 * 根据功能分布分析与修正建议，定义Ming平台与钱包之间的接口规范
 * 
 * @module types/wallet
 */

/**
 * NFT铸造请求参数（方案A：Ming平台完成IPFS上传）
 */
export const WALLET_PROTOCOL_VERSION = '1.0.0';

export type GasPolicyType = 'self_pay' | 'sponsored';

export interface GasPolicy {
  primary: GasPolicyType;
  fallback?: GasPolicyType;
  sponsorIdOrInviteCode?: string;
}

export interface ClosurePolicy {
  closeAfterSeconds?: number;
  closeAt?: string;
}

export interface MintTiming {
  requestedAt: string; // 请求发起时间（ISO）
  executeAt: string;   // 期望执行时间（ISO）
  strategy: 'immediate' | 'scheduled';
  timezone?: string;
}

export interface MintNFTRequest {
  protocolVersion: string; // 协议版本标识，当前固定为 WALLET_PROTOCOL_VERSION
  // IPFS哈希（Ming平台已上传）
  ipfs: {
    imageHash: string;          // 图片IPFS哈希
    metadataHash: string;       // 元数据IPFS哈希
    imageURI: string;           // 图片IPFS访问URL
    tokenURI: string;           // 元数据IPFS访问URL
  };
  
  // 共识哈希（Ming平台已生成）
  consensusHash: string;        // bytes32格式的共识哈希

  // 时间语义（钱包用于延时策略与审计）
  timing: MintTiming;
  
  // 合约调用参数
  contract: {
    address: string;            // NFT合约地址
    chainId: number;            // 链ID（EVM语义；Solana可传0用于兼容）
    chainFamily?: 'evm' | 'solana'; // 链族标识（推荐）
    network?: string;           // 网络标识（如 sepolia / solana-devnet）
  };
  
  // 合约方法参数（用于mintConnection方法）
  params: {
    to: string;                 // NFT接收地址
    tokenURI: string;           // IPFS元数据URI
    externalObjectId: string;   // 外物ID
    element: string;            // 五行属性（中文：'木'、'火'、'土'、'金'、'水'）
    consensusHash: string;      // 共识哈希
  };
}

/**
 * NFT铸造响应结果
 */
export interface MintNFTResponse {
  success: boolean;
  data?: {
    tokenId: string;            // 铸造的Token ID
    txHash: string;             // 交易哈希
    blockNumber: number;        // 区块号
    timestamp?: number;         // 时间戳
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * 创建定时任务请求参数（方案A：Ming平台完成IPFS上传）
 */
export interface CreateScheduledTaskRequest {
  protocolVersion: string; // 协议版本标识，当前固定为 WALLET_PROTOCOL_VERSION
  planId?: string;
  scheduledTime: string;        // ISO格式时间
  timing: MintTiming;
  gasPolicy?: GasPolicy;
  closurePolicy?: ClosurePolicy;
  
  // IPFS哈希（Ming平台已上传）
  ipfs: {
    imageHash: string;          // 图片IPFS哈希
    metadataHash: string;       // 元数据IPFS哈希
    imageURI: string;           // 图片IPFS访问URL
    tokenURI: string;           // 元数据IPFS访问URL
  };
  
  // 共识哈希（Ming平台已生成）
  consensusHash: string;        // bytes32格式的共识哈希
  
  // 合约调用参数
  contract: {
    address: string;            // NFT合约地址
    chainId: number;            // 链ID（EVM语义；Solana可传0用于兼容）
    chainFamily?: 'evm' | 'solana'; // 链族标识（推荐）
    network?: string;           // 网络标识（如 sepolia / solana-devnet）
  };
  
  // 合约方法参数
  params: {
    to: string;                 // NFT接收地址
    tokenURI: string;           // IPFS元数据URI
    externalObjectId: string;   // 外物ID
    element: string;            // 五行属性
    consensusHash: string;      // 共识哈希
  };
}

/**
 * 创建定时任务响应结果
 */
export interface CreateScheduledTaskResponse {
  success: boolean;
  data?: {
    taskId: string;              // 任务ID
    scheduledTime: string;
    status: 'pending' | 'executing' | 'completed' | 'failed';
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * 查询定时任务响应结果
 */
export interface GetScheduledTaskResponse {
  success: boolean;
  data?: WalletScheduledTaskData;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 钱包返回的定时任务数据（兼容扩展字段）
 */
export interface WalletScheduledTaskData {
  taskId: string;
  planId?: string;
  scheduledTime: string;
  status: string;
  walletAddress?: string;
  createdAt?: string;
  mintedAt?: string;
  connectionType?: string;
  blessing?: string;
  feelingsBefore?: string;
  feelingsDuring?: string;
  feelingsAfter?: string;
  location?: string;
  duration?: string;
  selectedObject?: {
    id?: string;
    name?: string;
    element?: string;
    category?: string;
    description?: string;
    image?: string;
  };
  ipfs?: {
    tokenURI?: string;
    imageURI?: string;
  };
  result?: {
    tokenId?: string;
    txHash?: string;
    error?: string;
    effectiveGasPolicy?: GasPolicyType;
    lifecycleReceipts?: {
      closeTxHash?: string;
      reviewTxHash?: string;
      releaseTxHash?: string;
    };
  };
  [key: string]: unknown;
}

/**
 * 按钱包地址查询定时任务请求参数
 */
export interface GetScheduledTasksByWalletRequest {
  protocolVersion: string; // 协议版本标识，当前固定为 WALLET_PROTOCOL_VERSION
  walletAddress: string;
}

/**
 * 按钱包地址查询定时任务响应结果
 */
export interface GetScheduledTasksByWalletResponse {
  success: boolean;
  data?: {
    tasks: WalletScheduledTaskData[];
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 查询钱包当前活跃账户请求参数
 */
export interface GetActiveAccountRequest {
  protocolVersion: string;
  chainFamily?: 'evm' | 'solana';
  chainId?: number;
  network?: string;
}

/**
 * 查询钱包当前活跃账户响应
 */
export interface GetActiveAccountResponse {
  success: boolean;
  data?: {
    walletAddress: string;
    chainFamily: 'evm' | 'solana';
    chainId?: number;
    network?: string;
    status?: 'connected' | 'locked' | 'not_found';
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * 取消定时任务请求参数
 */
export interface CancelScheduledTaskRequest {
  protocolVersion: string; // 协议版本标识，当前固定为 WALLET_PROTOCOL_VERSION
  taskId: string;
}

/**
 * 取消定时任务响应结果
 */
export interface CancelScheduledTaskResponse {
  success: boolean;
  data?: {
    taskId?: string;
    cancelled?: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 封局释放请求参数
 */
export interface ReleaseConnectionRequest {
  protocolVersion: string; // 协议版本标识，当前固定为 WALLET_PROTOCOL_VERSION
  contract: {
    address: string;
    chainId: number; // EVM语义；Solana可传0用于兼容
    chainFamily?: 'evm' | 'solana';
    network?: string; // 如 sepolia / solana-devnet
  };
  params: {
    tokenId: string; // 业务标识（EVM tokenId / Solana connection_id）
    releasedTokenURI: string; // 去隐私后的公开URI（ipfs:// 或 https://）
    removePrivateData?: boolean; // 默认true
  };
}

/**
 * 封局释放响应结果
 */
export interface ReleaseConnectionResponse {
  success: boolean;
  data?: {
    tokenId: string;
    txHash: string;
    blockNumber?: number;
    releasedTokenURI?: string;
    timestamp?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface WalletSendTransactionRequest {
  protocolVersion: string;
  chainId: number;
  chainFamily?: 'evm' | 'solana';
  network?: string;
  to: string;
  data: string;
  value?: string;
  gasPolicy: GasPolicy;
  clientRequestId?: string;
}

export interface WalletSendTransactionResponse {
  success: boolean;
  data?: {
    txHash: string;
    status: 'submitted' | 'confirmed' | 'failed';
    effectiveGasPolicy?: GasPolicyType;
    businessResult?: Record<string, unknown>;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export type WalletEventName =
  | 'mintTaskStatusChanged'
  | 'mintSucceeded'
  | 'mintFailed'
  | 'closeConfirmed'
  | 'reviewConfirmed'
  | 'releaseConfirmed';

export interface WalletEventEnvelope {
  event: WalletEventName;
  data: Record<string, unknown>;
}

/**
 * 钱包接口错误码
 */
export enum WalletErrorCode {
  // 参数错误
  INVALID_PARAMS = 'INVALID_PARAMS',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // 合约错误
  CONTRACT_NOT_INITIALIZED = 'CONTRACT_NOT_INITIALIZED',
  CONTRACT_CALL_FAILED = 'CONTRACT_CALL_FAILED',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  CHAIN_NOT_SUPPORTED = 'CHAIN_NOT_SUPPORTED',
  
  // 钱包错误
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  
  // 定时任务错误
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  TASK_ALREADY_EXECUTED = 'TASK_ALREADY_EXECUTED',
  INVALID_SCHEDULED_TIME = 'INVALID_SCHEDULED_TIME',
}
