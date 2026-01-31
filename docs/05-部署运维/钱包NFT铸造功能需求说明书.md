# 钱包 NFT 铸造功能需求说明书

## 文档信息

- **文档版本**: v1.0
- **创建日期**: 2026-01-31
- **项目名称**: Ming 平台 - 钱包 NFT 铸造功能
- **目标项目**: andao 钱包

---

## 1. 项目背景

### 1.1 背景说明

Ming（命/明）平台是一个基于东方命理哲学与集体意识共识的 Web3 仪式平台。用户通过完成外物连接仪式后，需要铸造 NFT 作为能量场见证。

**当前架构**：
- Ming 平台前端负责：用户交互、数据收集、元数据生成
- 钱包负责：区块链交互、交易签名、NFT 铸造

**迁移目标**：
将 NFT 铸造的完整流程迁移到钱包中，实现更安全、更便捷的铸造体验。

### 1.2 核心价值

- **安全性提升**：私钥和签名操作完全在钱包内完成
- **用户体验优化**：一站式完成铸造流程，无需切换应用
- **去中心化增强**：减少对中心化服务的依赖

---

## 2. 功能概述

### 2.1 架构设计原则

**核心原则：钱包应该是一个通用的区块链交互工具，不应该绑定任何业务逻辑**

钱包不应该知道：
- ❌ "五行"是什么
- ❌ "外物"是什么
- ❌ 如何生成元数据
- ❌ 如何上传IPFS
- ❌ 任何Ming平台的领域知识

钱包应该只负责：
- ✅ 接收已准备好的合约调用参数
- ✅ 签名和发送交易
- ✅ 返回交易结果

### 2.2 功能定位（重新设计）

**方案A：最小化接口（推荐）**

钱包提供通用的合约调用接口，Ming平台完成所有业务逻辑：

1. **Ming平台完成**：
   - ✅ 用户交互和数据收集
   - ✅ IPFS上传（图片和元数据）
   - ✅ 元数据生成
   - ✅ 共识哈希计算
   - ✅ 准备合约调用参数

2. **钱包完成**：
   - ✅ 接收合约调用参数
   - ✅ 签名和发送交易
   - ✅ 返回交易结果

**方案B：完整接口（不推荐，耦合度高）**

钱包处理完整流程，包括IPFS上传和元数据生成（当前设计）。

### 2.3 功能边界（推荐方案）

**钱包负责**：
- ✅ 通用的合约调用接口
- ✅ 交易签名和提交
- ✅ 交易结果返回
- ✅ 错误处理和用户确认

**Ming 平台负责**：
- ✅ 用户交互和数据收集
- ✅ IPFS文件上传（图片和元数据）
- ✅ NFT元数据生成
- ✅ 共识哈希计算
- ✅ 准备合约调用参数
- ✅ 调用钱包接口

---

## 3. 详细功能需求

### 3.1 接口设计方案对比

#### 3.1.1 方案A：最小化接口（推荐）⭐

**设计理念**：钱包作为通用工具，只负责区块链交互，不涉及业务逻辑。

**接口名称**: `callContract` 或 `sendTransaction`

**请求参数**:
```typescript
interface ContractCallRequest {
  // 合约信息
  contract: {
    address: string;         // 合约地址
    chainId: number;         // 链ID
    abi: any[];             // 合约ABI（或方法签名）
  };
  
  // 方法调用
  method: {
    name: string;           // 方法名（如：'mintConnection'）
    params: any[];          // 方法参数（已准备好的参数数组）
  };
  
  // 交易配置（可选）
  transaction?: {
    gasLimit?: string;      // Gas限制
    gasPrice?: string;      // Gas价格
    value?: string;         // 转账金额（通常为0）
  };
}
```

**响应结果**:
```typescript
interface ContractCallResponse {
  success: boolean;
  data?: {
    txHash: string;         // 交易哈希
    blockNumber: number;    // 区块号
    receipt: any;           // 交易收据
    // 如果需要解析事件，可以返回解析后的事件数据
    events?: any[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**优点**：
- ✅ 完全解耦，钱包不绑定任何业务逻辑
- ✅ 钱包可以用于任何合约调用，通用性强
- ✅ 易于维护和扩展
- ✅ Ming平台可以灵活控制所有业务逻辑

**缺点**：
- ⚠️ Ming平台需要自己处理IPFS上传
- ⚠️ Ming平台需要自己生成元数据和共识哈希

#### 3.1.2 方案B：完整接口（不推荐）

**设计理念**：钱包处理完整流程，包括IPFS上传和元数据生成。

**接口名称**: `mintConnectionNFT`

**请求参数**（方案B，不推荐）:
```typescript
interface MintNFTRequest {
  // 外物信息（业务逻辑，钱包不应该知道）
  externalObject: {
    id: string;
    name: string;
    element: string;  // 五行属性 - 这是业务概念！
  };
  
  // 图片数据（业务逻辑，应该由Ming平台处理）
  image: {
    file: File | Blob;
    fileName?: string;
    mimeType?: string;
  };
  
  // 连接信息（业务逻辑）
  connection: {
    type: string;
    date: string;
    location?: string;
    duration?: string;
  };
  
  // 仪式感受（业务逻辑）
  feelings?: {
    before: string;
    during: string;
    after: string;
  };
  
  // 祝福文本（业务逻辑）
  blessing?: string;
  
  // 合约配置
  contract: {
    address: string;
    chainId: number;
  };
}
```

**问题分析**：
- ❌ 钱包需要知道"五行"、"外物"等业务概念
- ❌ 钱包需要处理IPFS上传（这是基础设施，不是钱包核心功能）
- ❌ 钱包需要生成元数据（这是业务逻辑）
- ❌ 耦合度太高，钱包变成了Ming平台的专用工具
- ❌ 如果Ming平台业务逻辑变化，钱包也需要修改

### 3.2 推荐方案：最小化接口实现

#### 3.2.1 Ming平台的工作流程

```
1. 用户填写仪式信息
   ↓
2. 上传图片到IPFS → 获取imageHash
   ↓
3. 生成NFT元数据JSON（包含所有业务字段）
   ↓
4. 上传元数据到IPFS → 获取metadataHash
   ↓
5. 生成共识哈希（keccak256(metadataHash)）
   ↓
6. 准备合约调用参数：
   - to: 用户钱包地址
   - tokenURI: IPFS元数据URL
   - externalObjectId: 外物ID（字符串）
   - element: 五行属性（字符串）
   - consensusHash: 共识哈希（bytes32）
   ↓
7. 调用钱包接口，传入准备好的参数
   ↓
8. 钱包签名并发送交易
   ↓
9. 返回交易结果给Ming平台
```

#### 3.2.2 钱包接口实现

**接口定义**（推荐）:
```typescript
interface ContractCallRequest {
  contract: {
    address: string;         // 合约地址
    chainId: number;         // 链ID
  };
  
  method: string;           // 方法名：'mintConnection'
  
  params: {
    to: string;             // NFT接收地址
    tokenURI: string;        // IPFS元数据URI（Ming平台已准备好）
    externalObjectId: string; // 外物ID（Ming平台已准备好）
    element: string;        // 五行属性（Ming平台已准备好）
    consensusHash: string;  // 共识哈希（Ming平台已准备好，bytes32格式）
  };
  
  // 可选：交易配置
  options?: {
    gasLimit?: string;
    gasPrice?: string;
  };
}
```

**响应结果**:
```typescript
interface ContractCallResponse {
  success: boolean;
  data?: {
    txHash: string;         // 交易哈希
    blockNumber: number;    // 区块号
    tokenId?: string;       // 如果方法返回tokenId，可以解析出来
  };
  error?: {
    code: string;
    message: string;
  };
}
```

**响应结果**:
```typescript
interface MintNFTResponse {
  success: boolean;
  data?: {
    tokenId: string;        // 铸造的Token ID
    txHash: string;         // 交易哈希
    tokenURI: string;       // IPFS元数据URI
    imageURI: string;       // IPFS图片URI
    metadataHash: string;   // 元数据IPFS哈希
    consensusHash: string;  // 共识哈希（bytes32）
    blockNumber: number;    // 区块号
    timestamp: number;      // 时间戳
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

#### 3.2.3 接口实现流程（推荐方案）

**钱包端流程**（简单清晰）:
```
1. 接收合约调用请求
   ↓
2. 验证请求参数（合约地址、方法名、参数格式）
   ↓
3. 初始化合约连接
   ↓
4. 显示交易详情供用户确认
   ↓
5. 用户确认后，签名并发送交易
   ↓
6. 等待交易确认
   ↓
7. 从交易事件中解析结果（如Token ID）
   ↓
8. 返回交易结果
```

**Ming平台端流程**（处理所有业务逻辑）:
```
1. 用户填写仪式信息
   ↓
2. 上传图片到IPFS → 获取imageHash
   ↓
3. 生成NFT元数据JSON（包含所有业务字段）
   ↓
4. 上传元数据到IPFS → 获取metadataHash
   ↓
5. 生成共识哈希（keccak256(metadataHash)）
   ↓
6. 准备合约调用参数
   ↓
7. 调用钱包接口
   ↓
8. 处理返回结果
```

---

## 4. 技术实现需求（推荐方案）

### 4.0 架构对比

**方案A（推荐）**：钱包只负责合约调用
- ✅ 钱包不需要IPFS服务
- ✅ 钱包不需要知道元数据结构
- ✅ 钱包不需要知道业务逻辑
- ✅ 钱包是通用的，可以用于任何合约调用

**方案B（不推荐）**：钱包处理完整流程
- ❌ 钱包需要集成IPFS服务
- ❌ 钱包需要知道元数据结构
- ❌ 钱包需要知道业务逻辑
- ❌ 钱包变成Ming平台专用工具

### 4.1 IPFS 服务集成（仅方案B需要，不推荐）

**注意**：如果采用推荐方案A，钱包**不需要**IPFS服务，这部分由Ming平台处理。

#### 4.1.1 IPFS 上传功能

钱包需要集成 IPFS 上传服务，支持：
- 文件上传（图片）
- JSON 数据上传（元数据）
- 返回 IPFS 哈希（CID）

**配置要求**:
```typescript
interface IPFSConfig {
  // Pinata 配置（推荐）
  pinataApiKey?: string;
  pinataSecretApiKey?: string;
  
  // 或使用其他IPFS服务
  gatewayUrl?: string;      // IPFS网关URL
  uploadEndpoint?: string;  // 上传端点
}
```

**功能要求**:
- ✅ 支持图片文件上传（JPEG, PNG, WebP等）
- ✅ 支持JSON元数据上传
- ✅ 返回IPFS哈希（CID格式）
- ✅ 错误处理和重试机制（最多3次重试）
- ✅ 上传进度反馈（可选）
- ✅ 文件大小验证（建议限制：图片 < 10MB）
- ✅ 文件类型验证

#### 4.1.2 IPFS 访问URL生成

钱包需要能够生成IPFS文件的访问URL：
```typescript
function getIPFSAccessUrl(hash: string): string {
  // 返回格式: https://gateway.pinata.cloud/ipfs/{hash}
  // 或使用其他IPFS网关
}
```

### 4.2 NFT 元数据生成（仅方案B需要，不推荐）

**注意**：如果采用推荐方案A，钱包**不需要**生成元数据，这部分由Ming平台处理。

#### 4.2.1 元数据结构（Ming平台负责）

钱包需要根据 Ming 平台提供的标准生成 NFT 元数据：

```typescript
interface NFTMetadata {
  name: string;              // "外物连接 - {外物名称}"
  description: string;       // "与{外物名称}的连接仪式见证"
  image: string;             // IPFS图片URL
  
  // OpenSea标准属性
  attributes: Array<{
    trait_type: string;      // 属性类型（如：'外物', '五行属性', '连接类型'）
    value: string | number;   // 属性值
    display_type?: string;    // 显示类型（可选）
  }>;
  
  // 注意：attributes 必须包含以下字段：
  // - trait_type: '外物', value: 外物名称
  // - trait_type: '五行属性', value: 五行属性（中文）
  // - trait_type: '连接类型', value: 连接类型
  
  // Ming平台扩展数据
  connection: {
    externalObjectId: string;
    externalObjectName: string;
    element: string;
    connectionType: string;
    connectionDate: string;
  };
  
  ceremony?: {
    location?: string;
    duration?: string;
  };
  
  feelings?: {
    before: string;
    during: string;
    after: string;
  };
  
  blessing?: {
    text: string;
    timestamp: string;
  };
  
  scheduledMint?: {
    scheduledTime: string;
    mintedTime?: string;
  };
  
  energyField: {
    consensusHash: string;   // 初始为空，后续更新
  };
  
  metadata: {
    version: string;         // "1.0"
    createdAt: string;      // ISO时间戳
    platform: 'ming';
  };
}
```

#### 4.2.2 元数据生成逻辑

```typescript
function generateNFTMetadata(request: MintNFTRequest, imageURI: string): NFTMetadata {
  return {
    name: `外物连接 - ${request.externalObject.name}`,
    description: `与${request.externalObject.name}的连接仪式见证`,
    image: imageURI,
    attributes: [
      { trait_type: '外物', value: request.externalObject.name },
      { trait_type: '五行属性', value: request.externalObject.element },
      { trait_type: '连接类型', value: request.connection.type },
    ],
    connection: {
      externalObjectId: request.externalObject.id,
      externalObjectName: request.externalObject.name,
      element: request.externalObject.element,
      connectionType: request.connection.type,
      connectionDate: request.connection.date,
    },
    ceremony: {
      location: request.connection.location,
      duration: request.connection.duration,
    },
    feelings: request.feelings,
    blessing: request.blessing ? {
      text: request.blessing,
      timestamp: new Date().toISOString(),
    } : undefined,
    scheduledMint: request.scheduledTime ? {
      scheduledTime: request.scheduledTime,
      mintedTime: new Date().toISOString(),
    } : undefined,
    energyField: {
      consensusHash: '',
    },
    metadata: {
      version: '1.0',
      createdAt: new Date().toISOString(),
      platform: 'ming',
    },
  };
}
```

### 4.3 共识哈希生成（仅方案B需要，不推荐）

**注意**：如果采用推荐方案A，钱包**不需要**生成共识哈希，这部分由Ming平台处理。

#### 4.3.1 哈希算法（Ming平台负责）

使用以太坊的 keccak256 哈希函数生成共识哈希：

```typescript
import { ethers } from 'ethers';

function generateConsensusHash(metadataHash: string): string {
  // metadataHash 是IPFS返回的哈希字符串
  // 使用keccak256对字符串进行哈希处理
  return ethers.keccak256(ethers.toUtf8Bytes(metadataHash));
}
```

**说明**:
- 输入：IPFS元数据哈希（字符串）
- 输出：bytes32格式的共识哈希（0x开头的64字符十六进制字符串）

### 4.4 智能合约交互（核心功能）

#### 4.4.1 合约接口

钱包需要提供通用的合约调用接口，支持调用任何合约方法。

**ConnectionNFT 合约方法**（Ming平台会调用）:
```solidity
function mintConnection(
    address to,                    // NFT接收地址（用户钱包地址）
    string memory tokenURI,         // IPFS元数据URI（Ming平台已准备好）
    string memory externalObjectId, // 外物ID（Ming平台已准备好）
    string memory element,         // 五行属性（Ming平台已准备好）
    bytes32 consensusHash          // 共识哈希（Ming平台已准备好）
) public onlyOwner returns (uint256);
```

**钱包实现**（通用接口）:
```typescript
async function callContract(request: ContractCallRequest): Promise<ContractCallResponse> {
  // 1. 验证参数
  validateRequest(request);
  
  // 2. 初始化合约
  const contract = new ethers.Contract(
    request.contract.address,
    getContractABI(request.contract.address), // 可以从缓存或配置获取
    signer
  );
  
  // 3. 显示交易详情供用户确认
  const txDetails = {
    contract: request.contract.address,
    method: request.method,
    params: request.params,
    estimatedGas: await contract.estimateGas[request.method](...Object.values(request.params)),
  };
  
  // 4. 用户确认后发送交易
  const tx = await contract[request.method](...Object.values(request.params));
  const receipt = await tx.wait();
  
  // 5. 解析结果（如果需要）
  const result = parseTransactionResult(receipt, request.method);
  
  return {
    success: true,
    data: {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      ...result,
    },
  };
}
```

**重要说明**:
- ⚠️ **权限问题**：合约的 `mintConnection` 方法有 `onlyOwner` 修饰符，意味着只有合约所有者可以调用
- 钱包需要与 Ming 平台团队确认铸造权限的实现方案：
  - **方案A**：钱包作为合约所有者，直接调用 `mintConnection`
  - **方案B**：通过授权机制，钱包获得临时铸造权限
  - **方案C**：通过代理合约或中间层，钱包调用代理合约，代理合约再调用主合约
  - **方案D**：修改合约，添加允许用户直接铸造的方法（需要合约升级）
- 建议在实现前与 Ming 平台团队讨论并确定最终方案

**事件定义**:
```solidity
event ConnectionMinted(
    uint256 indexed tokenId,
    address indexed owner,
    string tokenURI,
    uint256 connectionDate,
    string externalObjectId,
    string element
);
```

#### 4.4.2 合约调用流程

```typescript
async function mintNFT(
  contractAddress: string,
  chainId: number,
  params: {
    to: string;
    tokenURI: string;
    externalObjectId: string;
    element: string;
    consensusHash: string;
  }
): Promise<{ tokenId: string; txHash: string }> {
  // 1. 初始化合约实例
  const contract = new ethers.Contract(
    contractAddress,
    CONNECTION_NFT_ABI,
    signer
  );
  
  // 2. 调用mintConnection方法
  const tx = await contract.mintConnection(
    params.to,
    params.tokenURI,
    params.externalObjectId,
    params.element,
    params.consensusHash
  );
  
  // 3. 等待交易确认
  const receipt = await tx.wait();
  
  // 4. 从事件中解析Token ID
  const tokenId = parseTokenIdFromEvent(receipt);
  
  return {
    tokenId,
    txHash: receipt.hash,
  };
}
```

#### 4.4.3 Token ID 解析

从交易收据的事件日志中解析 Token ID：

```typescript
function parseTokenIdFromEvent(receipt: TransactionReceipt): string {
  // 查找ConnectionMinted事件
  const eventInterface = contract.interface;
  const eventFragment = eventInterface.getEvent('ConnectionMinted');
  
  for (const log of receipt.logs) {
    try {
      const parsedLog = eventInterface.parseLog({
        topics: log.topics,
        data: log.data,
      });
      
      if (parsedLog && parsedLog.name === 'ConnectionMinted') {
        // tokenId是第一个indexed参数
        return parsedLog.args[0].toString();
      }
    } catch (e) {
      continue;
    }
  }
  
  throw new Error('ConnectionMinted event not found');
}
```

---

## 5. 错误处理

### 5.1 错误类型定义

```typescript
enum MintErrorCode {
  // 参数错误
  INVALID_PARAMS = 'INVALID_PARAMS',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // IPFS错误
  IPFS_UPLOAD_FAILED = 'IPFS_UPLOAD_FAILED',
  IPFS_CONFIG_MISSING = 'IPFS_CONFIG_MISSING',
  
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
}
```

### 5.2 错误处理策略

- **参数验证**：在接口入口处验证所有必需参数
  - 验证必填字段是否存在
  - 验证文件类型和大小
  - 验证合约地址格式（0x开头的40字符十六进制）
  - 验证链ID是否支持
- **IPFS上传失败**：提供重试机制（最多3次，每次间隔2秒）
- **交易失败**：返回详细的错误信息，包括gas估算失败原因
- **网络错误**：提供友好的错误提示，建议用户检查网络连接
- **合约调用失败**：区分不同类型的失败（权限不足、gas不足、合约错误等）

---

## 6. 安全要求

### 6.1 数据安全

- ✅ 私钥和签名操作必须在钱包内部完成
- ✅ 不在外部暴露私钥或助记词
- ✅ 所有交易必须经过用户明确确认

### 6.2 输入验证

- ✅ 验证合约地址格式
- ✅ 验证链ID是否支持
- ✅ 验证文件类型和大小
- ✅ 验证必填字段

### 6.3 交易安全

- ✅ 显示交易详情供用户确认（包括：合约地址、方法名、参数、预估gas）
- ✅ 估算gas费用并提示用户
- ✅ 支持交易取消
- ✅ 记录所有交易日志
- ✅ 验证合约地址是否匹配预期
- ✅ 检查用户余额是否足够支付gas费用

---

## 7. 用户体验要求

### 7.1 交互流程

1. **接收请求**：钱包接收来自 Ming 平台的铸造请求
2. **参数验证**：验证请求参数的有效性
3. **用户确认**：显示铸造信息供用户确认（包括：外物信息、预估费用等）
4. **处理过程**：显示处理进度
   - 步骤1：上传图片到IPFS（0-30%）
   - 步骤2：生成并上传元数据到IPFS（30-60%）
   - 步骤3：调用合约铸造NFT（60-90%）
   - 步骤4：等待交易确认（90-100%）
5. **结果反馈**：显示铸造结果（成功/失败）
   - 成功：显示Token ID、交易哈希、查看链接
   - 失败：显示错误原因和解决建议

### 7.2 UI/UX 要求

- ✅ 清晰的进度指示
- ✅ 友好的错误提示
- ✅ 交易详情展示
- ✅ 支持取消操作

### 7.3 性能要求

- ✅ IPFS上传响应时间 < 30秒（单次上传）
- ✅ 交易确认时间 < 60秒（取决于网络，Avalanche通常较快）
- ✅ 整体流程完成时间 < 2分钟（正常情况）
- ✅ 支持超时处理（如果超过5分钟未完成，允许用户取消）

---

## 8. 接口规范（推荐方案）

### 8.1 钱包与 Ming 平台通信

**推荐方案**：使用通用的合约调用接口，而不是专用的NFT铸造接口。

**方案一：消息传递（推荐）**
- 使用 `window.postMessage` 或类似机制
- Ming 平台发送铸造请求
- 钱包处理并返回结果

**方案二：URL Scheme**
- 使用自定义URL Scheme触发钱包
- 通过回调URL返回结果

**方案三：API接口**
- 钱包提供HTTP/WebSocket接口
- Ming 平台直接调用

### 8.2 请求格式示例（推荐方案）

**Ming平台端**（已完成所有业务逻辑处理）:
```typescript
// Ming平台已完成：
// 1. IPFS上传图片 → imageHash
// 2. 生成元数据 → metadata
// 3. IPFS上传元数据 → metadataHash
// 4. 生成共识哈希 → consensusHash

// 准备合约调用参数
const contractParams = {
  to: userWalletAddress,
  tokenURI: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
  externalObjectId: 'wood_tree',
  element: '木',
  consensusHash: consensusHash, // bytes32格式
};

// 调用钱包接口
window.postMessage({
  type: 'WALLET_CALL_CONTRACT',
  payload: {
    contract: {
      address: '0x...', // NFT合约地址
      chainId: 43114,
    },
    method: 'mintConnection',
    params: contractParams,
  },
}, '*');
```

**钱包端**（通用接口）:
```typescript
// 钱包接收请求
window.addEventListener('message', async (event) => {
  if (event.data.type === 'WALLET_CALL_CONTRACT') {
    const { contract, method, params } = event.data.payload;
    
    // 显示交易详情供用户确认
    const confirmed = await showTransactionConfirmation({
      contract: contract.address,
      method: method,
      params: params,
    });
    
    if (!confirmed) {
      return { success: false, error: { code: 'USER_CANCELLED' } };
    }
    
    // 调用合约
    const result = await callContract(contract, method, params);
    
    // 返回结果
    window.postMessage({
      type: 'WALLET_CALL_CONTRACT_RESPONSE',
      payload: result,
    }, '*');
  }
});
```

**对比：方案B（不推荐）的请求格式**:
```typescript
// 方案B需要传递所有业务数据，钱包需要处理
window.postMessage({
  type: 'MING_MINT_NFT_REQUEST',
  payload: {
    externalObject: { id: '...', name: '...', element: '...' }, // 业务逻辑
    image: { file: imageBlob }, // 业务逻辑
    connection: { type: '...', date: '...' }, // 业务逻辑
    feelings: { before: '...', during: '...', after: '...' }, // 业务逻辑
    // ... 更多业务逻辑
  },
}, '*');
```

---

## 9. 测试要求

### 9.1 单元测试

- ✅ IPFS上传功能测试
- ✅ 元数据生成测试
- ✅ 共识哈希生成测试
- ✅ 合约调用测试

### 9.2 集成测试

- ✅ 完整铸造流程测试
- ✅ 错误场景测试
- ✅ 网络异常测试

### 9.3 用户测试

- ✅ 端到端流程测试
- ✅ 用户体验测试
- ✅ 性能测试

---

## 10. 部署要求（推荐方案）

### 10.1 配置管理

**推荐方案A**：钱包配置非常简单
- ✅ 支持的链ID配置（通用配置）
- ✅ 合约ABI缓存（可选，用于更好的用户体验）
- ❌ **不需要**IPFS服务配置（由Ming平台处理）
- ❌ **不需要**NFT合约地址配置（由Ming平台传入）

**方案B（不推荐）**：需要更多配置
- ❌ IPFS服务配置（Pinata或其他）
- ❌ NFT合约地址配置
- ❌ 支持的链ID配置

### 10.2 环境变量（推荐方案）

```bash
# 钱包配置（推荐方案A）
# 只需要通用配置，不绑定任何业务逻辑
SUPPORTED_CHAIN_IDS=43114,43113,1,137  # 支持多个链

# 可选：合约ABI缓存配置（用于更好的用户体验）
CONTRACT_ABI_CACHE_ENABLED=true
```

**对比：方案B需要的配置**（不推荐）:
```bash
# 方案B需要绑定业务逻辑
IPFS_PINATA_API_KEY=xxx
IPFS_PINATA_SECRET_KEY=xxx
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
NFT_CONTRACT_ADDRESS=0x...
```

---

## 11. 后续扩展

### 11.1 定时铸造

支持定时铸造功能（可选）：
- 接收定时铸造请求
- 在指定时间自动执行铸造
- 支持取消定时任务

### 11.2 批量铸造

支持批量铸造多个NFT（可选）：
- 接收批量铸造请求
- 依次处理每个NFT
- 返回批量结果

### 11.3 NFT查询

提供NFT查询功能（可选）：
- 查询用户的所有NFT
- 查询NFT详情
- 查询NFT元数据

---

## 12. 数据格式说明

### 12.1 五行属性映射

钱包需要支持以下五行属性的中英文映射：

| 英文值 | 中文值 | 说明 |
|--------|--------|------|
| wood | 木 | 代表生长、向上、发展 |
| fire | 火 | 代表热情、活力、光明 |
| earth | 土 | 代表稳定、包容、承载 |
| metal | 金 | 代表收敛、坚韧、价值 |
| water | 水 | 代表流动、智慧、柔韧 |

**注意**：在元数据的 `attributes` 和 `connection.element` 字段中，应使用**中文值**（'木'、'火'、'土'、'金'、'水'）。

### 12.2 连接类型说明

| 类型值 | 说明 |
|--------|------|
| symbolic | 象征性连接（最简单，适合初学者） |
| experiential | 体验性连接（需要实际接触外物） |
| deep | 深度连接（需要较长时间和深度体验） |

### 12.3 文件格式要求

**图片文件**：
- 支持格式：JPEG, PNG, WebP, GIF
- 建议大小：< 10MB
- 建议分辨率：至少 800x800 像素

**元数据JSON**：
- 必须符合 ERC-721 元数据标准
- 必须包含 `name`, `description`, `image`, `attributes` 字段
- 扩展字段（connection, ceremony, feelings等）为 Ming 平台特有

---

## 13. 附录

### 13.1 相关文档

- [Ming 平台技术文档](./)
- [ConnectionNFT 智能合约文档](../contracts/)
- [IPFS 服务文档](./)
- [ERC-721 标准文档](https://eips.ethereum.org/EIPS/eip-721)

### 13.2 参考实现

- Ming 平台当前实现：
  - 合约服务：`srcs/src/services/contract/nftContract.ts`
  - IPFS 服务：`srcs/src/services/ipfs/ipfsService.ts`
  - NFT 铸造页面：`srcs/src/pages/NFTCeremony/index.tsx`
  - NFT Hook：`srcs/src/hooks/useNFT.ts`
  - 定时铸造：`srcs/src/hooks/useScheduledMint.ts`

### 13.3 合约权限说明

**当前合约实现**：
```solidity
function mintConnection(...) public onlyOwner returns (uint256)
```

这意味着只有合约所有者（owner）可以调用此方法。钱包在实现时需要：

1. **确认权限方案**：与 Ming 平台团队确认钱包如何获得铸造权限
2. **实现权限检查**：在调用前检查当前账户是否有权限
3. **错误处理**：如果权限不足，返回明确的错误信息

**可能的解决方案**：
- 钱包地址被设置为合约所有者
- 使用多签钱包作为合约所有者，钱包通过多签发起交易
- 修改合约添加新的公开铸造方法（需要合约升级）

### 13.4 关键代码片段

**共识哈希生成**（参考实现）：
```typescript
import { ethers } from 'ethers';

// metadataHash 是IPFS返回的哈希字符串
const consensusHash = ethers.keccak256(ethers.toUtf8Bytes(metadataHash));
```

**元数据生成**（参考实现）：
```typescript
const metadata = {
  name: `外物连接 - ${externalObject.name}`,
  description: `与${externalObject.name}的连接仪式见证`,
  image: ipfsImageUrl,
  attributes: [
    { trait_type: '外物', value: externalObject.name },
    { trait_type: '五行属性', value: externalObject.element }, // 中文：'木'、'火'等
    { trait_type: '连接类型', value: connectionType },
  ],
  connection: {
    externalObjectId: externalObject.id,
    externalObjectName: externalObject.name,
    element: externalObject.element, // 中文
    connectionType: connectionType,
    connectionDate: new Date().toISOString(),
  },
  // ... 其他字段
};
```

### 12.3 联系方式

如有疑问，请联系 Ming 平台开发团队。

---

## 14. 方案总结与建议

### 14.1 方案对比

| 特性 | 方案A：最小化接口（推荐）⭐ | 方案B：完整接口（不推荐） |
|------|---------------------------|--------------------------|
| **耦合度** | 低，完全解耦 | 高，强耦合 |
| **通用性** | 高，可用于任何合约调用 | 低，Ming平台专用 |
| **维护成本** | 低，钱包逻辑简单 | 高，需要维护业务逻辑 |
| **扩展性** | 高，易于扩展 | 低，业务变化需要修改钱包 |
| **IPFS依赖** | 无，由Ming平台处理 | 有，钱包需要集成 |
| **业务知识** | 无，钱包不需要知道 | 有，钱包需要知道"五行"等概念 |
| **实现复杂度** | 低 | 高 |

### 14.2 推荐方案的优势

1. **架构清晰**：
   - 钱包 = 通用的区块链交互工具
   - Ming平台 = 业务逻辑处理

2. **职责分离**：
   - 钱包只负责：签名、发送交易、返回结果
   - Ming平台负责：所有业务逻辑和数据处理

3. **易于维护**：
   - 钱包代码简单，不涉及业务逻辑
   - Ming平台可以灵活调整业务逻辑，不影响钱包

4. **通用性强**：
   - 钱包可以用于任何合约调用
   - 不仅限于Ming平台的NFT铸造

5. **降低风险**：
   - 钱包不需要处理IPFS上传（可能失败）
   - 钱包不需要生成元数据（可能出错）
   - 所有业务逻辑错误都在Ming平台端，易于调试

### 14.3 实施建议

**推荐采用方案A（最小化接口）**：

1. **钱包实现**：
   - 提供通用的 `callContract` 接口
   - 支持任意合约方法的调用
   - 显示交易详情供用户确认
   - 签名并发送交易
   - 返回交易结果

2. **Ming平台实现**：
   - 处理所有业务逻辑
   - IPFS上传（图片和元数据）
   - 元数据生成
   - 共识哈希计算
   - 准备合约调用参数
   - 调用钱包接口

3. **接口设计**：
   ```typescript
   // 钱包接口（通用）
   callContract({
     contract: { address, chainId },
     method: 'mintConnection',
     params: { to, tokenURI, externalObjectId, element, consensusHash }
   })
   ```

### 14.4 迁移建议

如果当前Ming平台已经在处理IPFS上传和元数据生成，那么：
- ✅ 保持现状，Ming平台继续处理这些逻辑
- ✅ 只需要让Ming平台调用钱包的通用合约接口
- ✅ 不需要在钱包中重新实现这些逻辑

这样可以：
- 减少开发工作量
- 降低系统复杂度
- 提高系统可维护性

---

**文档结束**
