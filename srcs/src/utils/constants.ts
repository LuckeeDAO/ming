/**
 * 项目常量定义
 * 
 * 包含项目中使用的所有常量，包括：
 * - 网络配置
 * - 合约地址
 * - IPFS配置
 * - 应用配置
 * 
 * @module utils/constants
 */

/**
 * 支持的区块链网络配置
 */
export const NETWORKS = {
  // Ethereum 主网
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    explorerUrl: 'https://etherscan.io',
  },
  // Goerli 测试网
  GOERLI: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
    explorerUrl: 'https://goerli.etherscan.io',
  },
  // Sepolia 测试网
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  // Polygon 主网
  POLYGON: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
  },
} as const;

/**
 * ConnectionNFT 合约地址（按网络）
 * 
 * 注意：这些地址需要在合约部署后更新
 */
export const CONTRACT_ADDRESSES: Record<number, string> = {
  [NETWORKS.MAINNET.chainId]: '', // 待部署
  [NETWORKS.GOERLI.chainId]: '', // 待部署
  [NETWORKS.SEPOLIA.chainId]: '', // 待部署
  [NETWORKS.POLYGON.chainId]: '', // 待部署
};

/**
 * IPFS 网关配置
 */
export const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
] as const;

/**
 * 默认 IPFS 网关
 */
export const DEFAULT_IPFS_GATEWAY = IPFS_GATEWAYS[0];

/**
 * 应用配置
 */
export const APP_CONFIG = {
  // 应用名称
  name: 'Ming Platform',
  // 应用版本
  version: '0.1.0',
  // 默认语言
  defaultLanguage: 'zh',
  // 支持的语言
  supportedLanguages: ['zh', 'en'] as const,
  // 每页显示数量
  itemsPerPage: 12,
  // 最大文件上传大小（MB）
  maxFileSize: 10,
  // 支持的图片格式
  supportedImageFormats: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/**
 * 五行元素配置
 */
export const FIVE_ELEMENTS = {
  wood: {
    name: '木',
    nameEn: 'Wood',
    color: '#4CAF50',
    description: '代表生长、发展、向上的能量',
  },
  fire: {
    name: '火',
    nameEn: 'Fire',
    color: '#F44336',
    description: '代表热情、活力、光明的能量',
  },
  earth: {
    name: '土',
    nameEn: 'Earth',
    color: '#FF9800',
    description: '代表稳定、包容、承载的能量',
  },
  metal: {
    name: '金',
    nameEn: 'Metal',
    color: '#9E9E9E',
    description: '代表收敛、坚固、价值的能量',
  },
  water: {
    name: '水',
    nameEn: 'Water',
    color: '#2196F3',
    description: '代表流动、智慧、柔韧的能量',
  },
} as const;

/**
 * 连接类型配置
 */
export const CONNECTION_TYPES = {
  symbolic: {
    name: '象征性连接',
    nameEn: 'Symbolic Connection',
    description: '通过象征意义建立连接',
  },
  experiential: {
    name: '体验性连接',
    nameEn: 'Experiential Connection',
    description: '通过实际体验建立连接',
  },
  deep: {
    name: '深度连接',
    nameEn: 'Deep Connection',
    description: '通过深度仪式建立连接',
  },
} as const;

/**
 * 能量状态阈值配置
 */
export const ENERGY_THRESHOLDS = {
  // 能量状态判断阈值
  strong: 1.5, // 超过平均值1.5倍为旺盛
  weak: 0.5, // 低于平均值0.5倍为偏弱
  missing: 0, // 为0为缺失
} as const;

/**
 * 错误消息常量
 */
export const ERROR_MESSAGES = {
  WALLET_NOT_INSTALLED: '请安装 MetaMask 钱包',
  WALLET_NOT_CONNECTED: '请先连接钱包',
  NETWORK_NOT_SUPPORTED: '当前网络不受支持',
  CONTRACT_NOT_DEPLOYED: '合约尚未部署',
  INVALID_INPUT: '输入数据无效',
  IPFS_UPLOAD_FAILED: 'IPFS 上传失败',
  NFT_MINT_FAILED: 'NFT 铸造失败',
  TRANSACTION_FAILED: '交易失败',
  INSUFFICIENT_BALANCE: '余额不足',
} as const;

/**
 * 成功消息常量
 */
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: '钱包连接成功',
  NFT_MINTED: 'NFT 铸造成功',
  DATA_SAVED: '数据保存成功',
  TRANSACTION_CONFIRMED: '交易已确认',
} as const;
