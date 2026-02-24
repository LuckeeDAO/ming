# 钱包协议与 Solana 指令映射

> 基线版本：v1.0（参照 `docs/00-现行口径基线.md`）

## 1. 目的

把 Ming 前端钱包协议（`MING_WALLET_*`）映射到 Solana Program 指令，确保钱包工程可以直接按字段执行。

## 1.1 多链导读（文档定位）

为避免歧义，本文件是 `chainFamily=solana` 的子文档，只描述 Solana 链族的字段映射与执行要求，不代表平台仅支持单链。

- 全链协议权威口径：`docs/钱包接口/钱包接口技术规范.md`
- 多链映射导航页：`docs/智能合约/00-多链映射总览.md`
- 本文作用：在全链协议之下，细化 Solana Program 指令映射细节
- 其他链族（如 `evm`）应参照同一协议字段体系，并在对应链族文档中补充映射

## 2. 当前映射关系

初始化治理账户（部署期）：

- Program 指令：`initialize_config`
- 输入：无业务参数
- 约束：
  - `authority` 为签名账户，由程序写入配置账户
  - `program_data.upgrade_authority_address == authority`（仅升级权限账户可初始化）

### 2.1 立即铸造

协议消息：`MING_WALLET_MINT_NFT_REQUEST`

映射到 Program 指令：`mint_connection_nft`

字段映射：

- `payload.params.to` -> `recipient`
- `payload.params.tokenURI` -> `token_uri`
- `payload.params.externalObjectId` -> `external_object_id`
- `payload.params.element` -> `element`
- `payload.params.consensusHash` -> `consensus_hash`（32字节）

钱包执行动作：

1. 校验地址与字段
2. 构造并发送 Solana 交易
3. 回传 `tokenId/txHash/blockNumber`（其中 `tokenId` 可映射为 connection_id 或 mint 地址）

### 2.2 定时铸造

协议消息：`MING_WALLET_CREATE_SCHEDULED_TASK_REQUEST`

执行模式：

- 钱包先存储任务
- 到时触发与 2.1 相同的 `mint_connection_nft` 链路

### 2.3 封局释放

协议消息：`MING_WALLET_RELEASE_CONNECTION_NFT_REQUEST`

映射到 Program 指令：`release_connection`

字段映射：

- `payload.params.tokenId` -> `connection_id`（Solana 场景建议使用 `connection:<id>` 业务标识）
- `payload.params.releasedTokenURI` -> `released_token_uri`
- `payload.contract.address` -> Program ID

`released_token_uri` 内容语义（产品约束）：

1. 指向“去隐私公开版”元数据；
2. 元数据 `attributes` 必须包含封局评价参数：履约完成度、自我共振度、公开叙事摘要、下一阶段意图、释放时间；
3. Ming 负责生成该元数据，钱包负责按协议透传并上链。

钱包执行动作：

1. 校验 `releasedTokenURI` 协议（`ipfs://` / `https://`）
2. 解析 `connection_id` 并构造释放指令
3. 以当前持有者身份签名发送交易
4. 回传 `MING_WALLET_RELEASE_CONNECTION_NFT_RESPONSE`
### 2.4 字段到指令参数对照表（以 `mint_connection_nft` 为准）

| 钱包协议字段 | Solana 指令参数/账户 | 备注 |
|---|---|---|
| `payload.contract.address` | Program ID | 即 `ming_connection` 程序地址 |
| `payload.contract.network` | 钱包网络上下文 | 必填，需与钱包当前网络一致 |
| `payload.params.to` | `recipient` + `recipient_wallet` | 程序要求 `recipient == recipient_wallet.key()` |
| `payload.params.tokenURI` | `token_uri` | 非空，长度上限 200 |
| `payload.params.externalObjectId` | `external_object_id` | 非空，长度上限 64 |
| `payload.params.element` | `element` | 非空，长度上限 16 |
| `payload.params.consensusHash` | `consensus_hash` | 从 `0x`+64hex 转换为 `[u8;32]` |
| `payload.consensusHash` | 一致性校验 | 钱包应校验与 `params.consensusHash` 一致 |

## 2.5 指令账户最小集合（钱包侧构造）

调用 `mint_connection_nft` 时，钱包至少需要按程序接口提供：

- `payer`（签名账户）
- `config`（PDA: `["config"]`）
- `mint`（新建 Mint 账户）
- `mint_authority`（PDA: `["mint_authority"]`）
- `recipient_wallet`
- `recipient_token_account`（ATA）
- `connection_record`（PDA: `["connection", next_connection_id.to_le_bytes()]`）
- `token_program`
- `associated_token_program`
- `system_program`

调用 `release_connection` 时，钱包至少需要按程序接口提供：

- `operator`（签名账户）
- `connection_record`（PDA: `["connection", connection_id.to_le_bytes()]`）
- `holder_token_account`（当前持有者对应的 token account）

## 3. 地址与链参数

### 3.1 地址

当 `VITE_CHAIN_FAMILY=solana` 时：

- 合约地址（Program ID）使用 Solana Base58 地址
- `params.to` 使用 Solana 钱包地址

### 3.2 链参数

当前协议已支持 `contract.chainFamily` 与 `contract.network`：

- `contract.chainFamily = "solana"`
- `contract.network` 使用 `solana-devnet` / `solana-mainnet` 等网络标识
- `contract.chainId` 仅作历史兼容字段（可传 `0`）

## 4. 前端配置约定

新增环境变量：

- `VITE_CHAIN_FAMILY=solana`

当前前端页面已按该变量切换地址校验逻辑（evm/solana）。

## 5. 风险与注意

- `chainId` 字段是 EVM 语义，在 Solana 仅作兼容字段，不作为主判定条件。
- `tokenId` 在 Solana 生态不等同 EVM Token ID，建议钱包对外返回稳定业务 ID（例如 `connection_id`）。
- 若需标准 NFT 可见性，需接入 Metaplex Metadata CPI（下一阶段）。
- `consensus_hash` 必须严格是 32 字节；钱包侧应在入参阶段拦截非法长度与非法 hex。
- `token_uri` 仅允许 `ipfs://` 或 `https://` 协议，避免恶意 URI 注入。
- `mint_connection_nft` 已在程序内回收 Mint/Freeze authority，降低后续中心化控制风险。
