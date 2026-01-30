# API接口设计

## 1. API概述

### 1.1 API架构

Ming平台采用混合架构：
- **链上API**: 通过智能合约直接交互
- **IPFS API**: 通过IPFS服务存储和获取数据
- **后端API** (可选): 提供能量分析、推荐算法等服务

### 1.2 API设计原则

- RESTful风格（如使用后端API）
- 统一的错误处理
- 版本控制
- 安全认证

## 2. 链上API（智能合约）

### 2.1 NFT合约接口

#### 2.1.1 铸造NFT
```typescript
// 接口定义
interface MintConnectionParams {
  to: string;                    // 接收地址
  tokenURI: string;              // IPFS元数据URI
  externalObjectId: string;       // 外物ID
  element: string;                // 能量类型
  consensusHash: string;          // 共识哈希
}

interface MintConnectionResponse {
  tokenId: string;
  txHash: string;
  blockNumber: number;
}

// 调用示例
async function mintConnection(
  contract: Contract,
  params: MintConnectionParams
): Promise<MintConnectionResponse> {
  const tx = await contract.mintConnection(
    params.to,
    params.tokenURI,
    params.externalObjectId,
    params.element,
    params.consensusHash
  );
  
  const receipt = await tx.wait();
  
  return {
    tokenId: receipt.events[0].args.tokenId.toString(),
    txHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
  };
}
```

#### 2.1.2 查询用户NFT
```typescript
// 接口定义
interface GetUserTokensResponse {
  tokenIds: string[];
}

// 调用示例
async function getUserTokens(
  contract: Contract,
  address: string
): Promise<GetUserTokensResponse> {
  const tokenIds = await contract.getUserTokens(address);
  return {
    tokenIds: tokenIds.map(id => id.toString()),
  };
}
```

#### 2.1.3 查询连接信息
```typescript
// 接口定义
interface GetConnectionInfoResponse {
  tokenId: string;
  owner: string;
  tokenURI: string;
  connectionDate: number;
  externalObjectId: string;
  element: string;
  consensusHash: string;
}

// 调用示例
async function getConnectionInfo(
  contract: Contract,
  tokenId: string
): Promise<GetConnectionInfoResponse> {
  const info = await contract.getConnectionInfo(tokenId);
  return {
    tokenId: info.tokenId.toString(),
    owner: info.owner,
    tokenURI: info.tokenURI,
    connectionDate: info.connectionDate.toNumber(),
    externalObjectId: info.externalObjectId,
    element: info.element,
    consensusHash: info.consensusHash,
  };
}
```

### 2.2 钱包接口

#### 2.2.1 连接钱包
```typescript
interface ConnectWalletResponse {
  address: string;
  networkId: number;
  chainId: number;
}

async function connectWallet(): Promise<ConnectWalletResponse> {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  
  return {
    address,
    networkId: network.chainId,
    chainId: network.chainId,
  };
}
```

#### 2.2.2 获取余额
```typescript
async function getBalance(address: string): Promise<string> {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}
```

## 3. IPFS API

### 3.1 上传文件

#### 3.1.1 上传图片
```typescript
// 接口定义
interface UploadImageParams {
  file: File;
  metadata?: {
    name?: string;
    description?: string;
  };
}

interface UploadImageResponse {
  hash: string;
  url: string;
}

// 实现示例（使用Pinata）
async function uploadImage(
  params: UploadImageParams
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('file', params.file);
  
  if (params.metadata) {
    formData.append('pinataMetadata', JSON.stringify({
      name: params.metadata.name || params.file.name,
    }));
  }
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  return {
    hash: data.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
}
```

#### 3.1.2 上传JSON
```typescript
// 接口定义
interface UploadJSONParams {
  data: object;
  metadata?: {
    name?: string;
  };
}

interface UploadJSONResponse {
  hash: string;
  url: string;
}

// 实现示例
async function uploadJSON(
  params: UploadJSONParams
): Promise<UploadJSONResponse> {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: params.data,
      pinataMetadata: {
        name: params.metadata?.name || 'metadata.json',
      },
    }),
  });
  
  const data = await response.json();
  
  return {
    hash: data.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
}
```

### 3.2 获取文件

#### 3.2.1 获取JSON
```typescript
async function getJSON(hash: string): Promise<any> {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
  return await response.json();
}
```

#### 3.2.2 获取图片URL
```typescript
function getImageURL(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}
```

## 4. 后端API（可选）

### 4.1 能量分析API

#### 4.1.1 分析四柱八字
```typescript
// POST /api/v1/energy/analyze
interface AnalyzeRequest {
  fourPillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

interface AnalyzeResponse {
  analysis: EnergyAnalysis;
  recommendedObjects: ExternalObject[];
}

// 实现示例
async function analyzeEnergy(
  fourPillars: FourPillars
): Promise<AnalyzeResponse> {
  const response = await fetch('/api/v1/energy/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fourPillars }),
  });
  
  return await response.json();
}
```

### 4.2 外物推荐API

#### 4.2.1 获取推荐外物
```typescript
// GET /api/v1/objects/recommend?element={element}
interface RecommendObjectsResponse {
  objects: ExternalObject[];
}

async function getRecommendedObjects(
  element: string
): Promise<RecommendObjectsResponse> {
  const response = await fetch(
    `/api/v1/objects/recommend?element=${element}`
  );
  return await response.json();
}
```

### 4.3 外物数据API

#### 4.3.1 获取所有外物
```typescript
// GET /api/v1/objects
interface GetObjectsResponse {
  objects: ExternalObject[];
}

async function getAllObjects(): Promise<GetObjectsResponse> {
  const response = await fetch('/api/v1/objects');
  return await response.json();
}
```

#### 4.3.2 获取外物详情
```typescript
// GET /api/v1/objects/{id}
interface GetObjectResponse {
  object: ExternalObject;
}

async function getObject(id: string): Promise<GetObjectResponse> {
  const response = await fetch(`/api/v1/objects/${id}`);
  return await response.json();
}
```

## 5. 错误处理

### 5.1 错误码定义

```typescript
enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  
  // 钱包错误
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WALLET_REJECTED = 'WALLET_REJECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  
  // 合约错误
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  GAS_ESTIMATION_FAILED = 'GAS_ESTIMATION_FAILED',
  
  // IPFS错误
  IPFS_UPLOAD_FAILED = 'IPFS_UPLOAD_FAILED',
  IPFS_FETCH_FAILED = 'IPFS_FETCH_FAILED',
  
  // 业务错误
  INVALID_FOUR_PILLARS = 'INVALID_FOUR_PILLARS',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
}
```

### 5.2 错误响应格式

```typescript
interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
}
```

## 6. API客户端封装

### 6.1 统一客户端

```typescript
// services/api/apiClient.ts
class APIClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new APIError(error.code, error.message);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(ErrorCode.UNKNOWN_ERROR, error.message);
    }
  }
}
```

## 7. 请求/响应示例

### 7.1 完整NFT铸造流程

```typescript
// 1. 上传图片到IPFS
const imageHash = await uploadImage({ file: imageFile });

// 2. 创建元数据
const metadata: NFTMetadata = {
  name: 'Connection NFT #1',
  description: '...',
  image: getImageURL(imageHash),
  // ... 其他字段
};

// 3. 上传元数据到IPFS
const metadataHash = await uploadJSON({ data: metadata });
const tokenURI = `ipfs://${metadataHash}`;

// 4. 调用合约铸造
const result = await mintConnection({
  to: userAddress,
  tokenURI,
  externalObjectId: 'wood-001',
  element: 'wood',
  consensusHash: generateConsensusHash(),
});

// 5. 等待确认
await waitForTransaction(result.txHash);
```

## 8. API版本控制

### 8.1 版本策略

- URL版本控制: `/api/v1/...`
- 向后兼容
- 废弃通知

### 8.2 版本迁移

- 保持旧版本可用
- 提供迁移指南
- 逐步废弃

## 9. 限流和缓存

### 9.1 限流策略

- IPFS上传限流
- API调用限流
- 用户级别限流

### 9.2 缓存策略

- 静态数据缓存
- NFT元数据缓存
- 外物数据缓存

## 10. 监控和日志

### 10.1 API监控

- 请求成功率
- 响应时间
- 错误率

### 10.2 日志记录

- 请求日志
- 错误日志
- 性能日志
