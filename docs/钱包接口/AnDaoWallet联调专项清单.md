# AnDaoWallet 联调专项清单（多链协议口径）

> 基线版本：v1.0（参照 `docs/00-现行口径基线.md`）

## 1. 适用范围

- 钱包工程路径：`/home/lc/luckee_dao/AnDaoWallet`
- 联调目标：验证 AnDaoWallet 对 `MING_WALLET_*` 多链协议的实现与现行权限模型一致
- 关键口径：`mintConnection` 允许 owner 与非 owner 用户都可铸造

## 2. 前置准备

- [ ] 已对齐 `docs/钱包接口/钱包接口技术规范.md`
- [ ] 已对齐 `docs/钱包接口/权限路径决策与实施清单.md`
- [ ] 已确认测试网目标地址与链参数（EVM: `chainId`；Solana: `network`）
- [ ] 已确认链族配置（`contract.chainFamily` 与 `contract.network`）
- [ ] 已准备两类测试账户：
  - 账户A：合约 owner（治理账户）
  - 账户B：非 owner 普通用户

## 3. 通用样例与链族样例

### 3.1 通用结构（owner / non-owner）

```json
{
  "type": "MING_WALLET_MINT_NFT_REQUEST",
  "messageId": "msg_demo_001",
  "payload": {
    "protocolVersion": "1.0.0",
    "timing": {
      "requestedAt": "2026-02-24T00:00:00.000Z",
      "executeAt": "2026-02-24T00:00:00.000Z",
      "strategy": "immediate",
      "timezone": "Asia/Shanghai"
    },
    "ipfs": {
      "imageHash": "QmExampleImageHash",
      "metadataHash": "QmExampleMetadataHash",
      "imageURI": "ipfs://QmExampleImageHash",
      "tokenURI": "ipfs://QmExampleMetadataHash"
    },
    "consensusHash": "0x1111111111111111111111111111111111111111111111111111111111111111",
    "contract": {
      "address": "0xYourConnectionNFTAddress",
      "chainId": 11155111
    },
    "params": {
      "to": "0xRecipientAddress",
      "tokenURI": "ipfs://QmExampleMetadataHash",
      "externalObjectId": "wood_forest",
      "element": "木",
      "consensusHash": "0x1111111111111111111111111111111111111111111111111111111111111111"
    }
  }
}
```

字段要求补充：

- `consensusHash` 必须为 `0x` 开头 + 64位十六进制
- `protocolVersion` 必填，且固定为 `1.0.0`
- `timing.requestedAt/executeAt` 必须是合法 ISO 时间
- EVM：`contract.chainFamily = "evm"` 且 `contract.chainId > 0`
- Solana：`contract.chainFamily = "solana"` 且 `contract.network` 必填（如 `solana-devnet`）

### 3.2 链族样例（Solana）

```json
{
  "type": "MING_WALLET_MINT_NFT_REQUEST",
  "messageId": "msg_solana_001",
  "payload": {
    "protocolVersion": "1.0.0",
    "timing": {
      "requestedAt": "2026-02-24T00:00:00.000Z",
      "executeAt": "2026-02-24T00:00:00.000Z",
      "strategy": "immediate",
      "timezone": "Asia/Shanghai"
    },
    "ipfs": {
      "imageHash": "QmExampleImageHash",
      "metadataHash": "QmExampleMetadataHash",
      "imageURI": "ipfs://QmExampleImageHash",
      "tokenURI": "ipfs://QmExampleMetadataHash"
    },
    "consensusHash": "0x1111111111111111111111111111111111111111111111111111111111111111",
    "contract": {
      "address": "5Ga3kk79rpPJy5joLvZKoJowRsEGvfcMpSDqAahYEVKT",
      "chainId": 0,
      "chainFamily": "solana",
      "network": "solana-devnet"
    },
    "params": {
      "to": "8J8W1ahh6Y1cM1k8oYyU7F2jmYb5x1p6DYk7tV4hyU2S",
      "tokenURI": "ipfs://QmExampleMetadataHash",
      "externalObjectId": "wood_forest",
      "element": "木",
      "consensusHash": "0x1111111111111111111111111111111111111111111111111111111111111111"
    }
  }
}
```

### 3.3 链族样例（EVM，占位模板）

```json
{
  "type": "MING_WALLET_MINT_NFT_REQUEST",
  "messageId": "msg_evm_001",
  "payload": {
    "protocolVersion": "1.0.0",
    "timing": {
      "requestedAt": "2026-02-24T00:00:00.000Z",
      "executeAt": "2026-02-24T00:00:00.000Z",
      "strategy": "immediate",
      "timezone": "Asia/Shanghai"
    },
    "ipfs": {
      "imageHash": "QmExampleImageHash",
      "metadataHash": "QmExampleMetadataHash",
      "imageURI": "https://gateway.pinata.cloud/ipfs/QmExampleImageHash",
      "tokenURI": "https://gateway.pinata.cloud/ipfs/QmExampleMetadataHash"
    },
    "consensusHash": "0x1111111111111111111111111111111111111111111111111111111111111111",
    "contract": {
      "address": "0xYourConnectionNFTAddress",
      "chainId": 11155111,
      "chainFamily": "evm",
      "network": "sepolia"
    },
    "params": {
      "to": "0xRecipientAddress",
      "tokenURI": "https://gateway.pinata.cloud/ipfs/QmExampleMetadataHash",
      "externalObjectId": "wood_forest",
      "element": "木",
      "consensusHash": "0x1111111111111111111111111111111111111111111111111111111111111111"
    }
  }
}
```

## 4. 验收用例（必须通过）

### 4.0 通用验收（全链）

### 4.1 用例A：owner 账户铸造

- 操作：使用账户A（owner）发起 `MINT_NFT_REQUEST`
- 预期：返回成功 `MINT_NFT_RESPONSE`
- 必校验：
  - [ ] `payload.success = true`
  - [ ] 返回 `data.tokenId(业务标识)/txHash/blockNumber`
  - [ ] 链上接收者与 `params.to` 一致（EVM: `ownerOf(tokenId)`；Solana: 账户归属/回执字段）
  - [ ] 请求携带 `timing + protocolVersion`，钱包可正常处理

### 4.2 用例B：非 owner 账户铸造

- 操作：使用账户B（非 owner）发起相同结构请求
- 预期：同样返回成功，不应因为非 owner 身份失败
- 必校验：
  - [ ] `payload.success = true`
  - [ ] 返回 `data.tokenId(业务标识)/txHash/blockNumber`
  - [ ] 链上接收者与 `params.to` 一致（EVM: `ownerOf(tokenId)`；Solana: 账户归属/回执字段）

### 4.3 用例C：参数非法

- 操作：构造错误 `consensusHash`、非法地址或非法 `tokenURI` 协议
- 预期：返回失败响应
- 必校验：
  - [ ] `payload.success = false`
  - [ ] 错误码为 `INVALID_PARAMS` / `MISSING_REQUIRED_FIELD`
  - [ ] `consensusHash` 非 `0x`+64hex 时返回 `INVALID_PARAMS`
  - [ ] `tokenURI` 非 `ipfs://`/`https://` 时返回 `INVALID_PARAMS`

### 4.4 用例D：链不匹配

- 操作：
  - EVM：请求 `contract.chainId` 与钱包当前链不一致
  - Solana：请求 `contract.network` 与钱包当前网络不一致
- 预期：返回 `CHAIN_NOT_SUPPORTED`

Solana 补充：

- `contract.chainFamily = "solana"` 但缺少 `contract.network` 时，返回 `CHAIN_NOT_SUPPORTED`

### 4.5 用例E：封局释放

- 操作：对已铸造连接发起 `RELEASE_CONNECTION_NFT_REQUEST`，传入 `releasedTokenURI`
- 预期：返回成功响应并包含 `tokenId/txHash`
- 必校验：
  - [ ] `payload.success = true`
  - [ ] `releasedTokenURI` 非 `ipfs://`/`https://` 时返回 `INVALID_PARAMS`

### 4.6 Solana 组加测项

- [ ] `contract.chainFamily="solana"` 且 `contract.network` 匹配时流程成功
- [ ] `contract.network` 不匹配时返回 `CHAIN_NOT_SUPPORTED`
- [ ] `tokenId` 返回策略（`connection_id` 或 mint 地址）已在联调记录中固定

### 4.7 EVM 组加测项（占位）

- [ ] `contract.chainFamily="evm"` 且 `contract.chainId` 匹配时流程成功
- [ ] `contract.chainId` 不匹配时返回 `CHAIN_NOT_SUPPORTED`
- [ ] `tokenId` 返回 EVM Token ID（十进制字符串）

## 5. 响应示例

成功：

```json
{
  "type": "MING_WALLET_MINT_NFT_RESPONSE",
  "messageId": "msg_demo_001",
  "payload": {
    "success": true,
    "data": {
      "tokenId": "connection:123",
      "txHash": "0xabc...",
      "blockNumber": 123456
    }
  }
}
```

失败：

```json
{
  "type": "MING_WALLET_MINT_NFT_RESPONSE",
  "messageId": "msg_demo_001",
  "payload": {
    "success": false,
    "error": {
      "code": "INVALID_PARAMS",
      "message": "错误描述"
    }
  }
}
```

## 6. 联调留痕材料

- [ ] owner 成功交易哈希
- [ ] non-owner 成功交易哈希
- [ ] 参数非法失败日志
- [ ] 链不匹配失败日志
- [ ] 版本信息（AnDaoWallet 版本 / Ming 版本 / 验收日期）

## 7. 关联文档

- `docs/钱包接口/钱包接口技术规范.md`
- `docs/钱包接口/钱包联调验收清单.md`
- `docs/钱包接口/权限路径决策与实施清单.md`
