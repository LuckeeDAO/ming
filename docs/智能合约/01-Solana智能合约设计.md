# Solana 智能合约设计（Ming）

> 基线版本：v1.0（参照 `docs/00-现行口径基线.md`）

## 1. 目标与范围

本文档定义 Ming 在 Solana 平台上的智能合约实现方案，覆盖：

- 开放铸造（owner 与非 owner 都可铸造）
- 链上连接记录（ConnectionRecord）
- 治理权限（仅治理账户可执行治理操作）
- 钱包消息协议对接边界

不在本阶段实现：

- 复杂版元数据动态更新策略
- 跨链资产桥接

## 2. 目录与工程

- 合约根目录：`contracts/solana`
- Program 名称：`ming_connection`
- Program 代码：`contracts/solana/programs/ming_connection/src/lib.rs`

## 3. 权限模型

### 3.1 开放铸造

- 指令：`mint_connection_nft`
- 规则：任意签名用户均可发起铸造
- 说明：满足“多类用户都可铸造 NFT”的业务要求

### 3.2 治理权限

- 指令：`set_pause`
- 指令：`update_consensus_hash`
- 规则：仅 `ProgramConfig.authority` 可执行

## 4. 账户模型

### 4.1 ProgramConfig

字段：

- `authority: Pubkey` 治理账户
- `paused: bool` 全局开关
- `next_connection_id: u64` 自增连接编号
- `bump: u8` PDA bump

PDA：`["config"]`

### 4.2 ConnectionRecord

字段：

- `connection_id: u64`
- `minter: Pubkey` 发起铸造的钱包
- `recipient: Pubkey` NFT 接收地址
- `mint: Pubkey` NFT Mint 地址
- `token_uri: String`
- `external_object_id: String`
- `element: String`
- `consensus_hash: [u8; 32]`
- `created_at: i64`
- `bump: u8`

PDA：`["connection", connection_id.to_le_bytes()]`

## 5. 指令设计

### 5.1 initialize_config()

用途：初始化配置账户。  
权限：部署后初始化调用。  
安全口径：

- `authority` 必须是签名账户，由程序在初始化时写入 `ProgramConfig.authority`，不接受外部传入任意公钥。
- 初始化需携带 `program` 与 `program_data` 账户，并校验 `program_data.upgrade_authority_address == authority`（仅升级权限账户可初始化）。

### 5.2 set_pause(paused)

用途：暂停/恢复铸造。  
权限：仅治理账户。

### 5.3 mint_connection_nft(recipient, token_uri, external_object_id, element, consensus_hash)

用途：铸造 1 枚 NFT 并写入连接记录。  
权限：开放（任意签名者）。

关键校验：

- 程序未暂停
- `recipient == recipient_wallet.key()`
- `token_uri` 必须为 `ipfs://` 或 `https://` 协议
- 文本字段非空且长度在上限内

关键动作：

1. 初始化 Mint（decimals=0）
2. 向接收地址 ATA 增发 1 枚 token
3. 回收 Mint Authority（锁定总量）
4. 回收 Freeze Authority（避免后续冻结控制）
5. 写入 `ConnectionRecord`
6. 触发 `ConnectionMintedEvent`

### 5.4 update_consensus_hash(connection_id, new_consensus_hash)

用途：治理端修正共识哈希。  
权限：仅治理账户。  
输出：`ConsensusHashUpdatedEvent`

### 5.5 release_connection(connection_id, released_token_uri)

用途：执行封局释放，将连接记录切换为公开见证状态。  
权限：当前 NFT 持有者（由 token account owner 校验）。

关键校验：

- `released_token_uri` 仅允许 `ipfs://` 或 `https://`
- `holder_token_account.mint == connection_record.mint`
- `holder_token_account.owner == operator`
- `holder_token_account.amount > 0`
- 同一连接仅允许释放一次（`released == false`）

关键动作：

1. 更新 `connection_record.token_uri` 为去隐私后的公开 URI
2. 清空 `connection_record.consensus_hash`（置零）
3. 写入 `released = true` 与 `released_at`
4. 触发 `ConnectionReleasedEvent`

## 6. 错误码

- `Unauthorized`
- `ProgramPaused`
- `InvalidTokenUri`
- `TokenUriTooLong`
- `InvalidExternalObjectId`
- `ExternalObjectIdTooLong`
- `InvalidElement`
- `ElementTooLong`
- `MathOverflow`
- `RecipientMismatch`

## 7. 与钱包协议对接

Ming 前端通过钱包协议向钱包发送请求，钱包完成签名与上链：

- 消息：`MING_WALLET_MINT_NFT_REQUEST`
- 钱包执行：调用 Solana program 的 `mint_connection_nft`
- 钱包回传：`MING_WALLET_MINT_NFT_RESPONSE`（`tokenId/txHash/...`）

## 8. 验收标准

- owner 账户可铸造
- 非 owner 账户可铸造
- 治理账户可更新 `consensus_hash`
- 非治理账户更新被拒绝
- `paused = true` 时铸造被拒绝
- 铸造后 `mintAuthority` 与 `freezeAuthority` 均为空（权限已回收）

## 9. 后续扩展

- 引入 Metaplex Metadata CPI，补齐链上 metadata 标准展示
- 按产品需求增加销毁/封局释放相关生命周期指令
- 增加白名单或频控策略（可选，避免垃圾调用）
