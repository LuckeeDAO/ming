# Solana 合约安全性分析与修正（ming_connection）

> 基线版本：v1.0（参照 `docs/00-现行口径基线.md`）
> 分析日期：2026-02-24
> 对应代码：`contracts/solana/programs/ming_connection/src/lib.rs`

## 1. 结论摘要

当前 `ming_connection` 合约不存在“仅 owner 可铸造”的业务阻断问题，开放铸造路径成立。  
但在安全治理上，存在需要修正或明确的点。本轮已完成高优先级修正：

1. 初始化治理账户改为“签名绑定”，不再接受任意外部公钥参数。
2. 初始化增加 ProgramData 升级权限校验，仅 Upgrade Authority 可初始化。
3. NFT 铸造后同时回收 Mint/Freeze 两类权限，降低后续中心化控制风险。
4. 接收者账户类型由 `UncheckedAccount` 收敛为 `SystemAccount`，强化账户所有权约束。
5. `token_uri` 增加协议白名单（仅允许 `ipfs://` 或 `https://`），降低恶意 URI 注入风险。

## 2. 审计检查项（结合 Solana/Anchor 常见风险）

### 2.1 访问控制

- `set_pause`、`update_consensus_hash` 已校验 `config.authority`，访问控制有效。
- `mint_connection_nft` 为公开可调用，符合业务要求（owner/non-owner 均可铸造）。

### 2.2 账户校验

- `config`、`connection_record` 使用 PDA seeds + bump，避免任意账户注入。
- `recipient_wallet` 已改为 `SystemAccount`，避免使用任意未校验账户类型。
- 仍保留 `recipient == recipient_wallet.key()` 一致性检查，避免请求参数与账户错配。

### 2.3 代币权限与生命周期

- 铸造后回收 `MintTokens` 权限：已实现。
- 铸造后回收 `FreezeAccount` 权限：本轮新增，避免后续冻结控制风险。

### 2.4 输入校验

- `token_uri`、`external_object_id`、`element` 已做非空和长度限制。
- `token_uri` 已限制协议白名单（`ipfs://` / `https://`）。
- `consensus_hash` 使用 `[u8; 32]` 类型，链上强约束为 32 字节。

### 2.5 状态机与暂停开关

- `paused` 状态会阻断铸造，恢复后可继续，逻辑完整。

## 3. 已修正项（代码级）

1. 初始化权限绑定修正  
`initialize_config` 由 `initialize_config(authority: Pubkey)` 改为 `initialize_config()`，并要求：
- `authority` 为签名账户；
- `payer == authority`。

2. 初始化升级权限校验增强  
`initialize_config` 新增 `program` / `program_data` 约束，校验：
- `program.programdata_address() == program_data.key()`
- `program_data.upgrade_authority_address == authority`

3. 铸造后权限回收增强  
在回收 `MintTokens` 后，新增回收 `FreezeAccount` 权限。

4. 接收者账户类型收敛  
`recipient_wallet: UncheckedAccount` -> `recipient_wallet: SystemAccount`。

5. `token_uri` 协议白名单  
新增 `token_uri` 协议校验，只允许 `ipfs://` 与 `https://`。

## 4. 剩余风险与建议

1. 升级权限账户风险（部署期与运维期）
- 风险：若 Program Upgrade Authority 私钥泄漏，攻击者仍可能在部署期或升级期执行高危操作。
- 建议：
  - 升级权限账户使用硬件钱包或多签托管；
  - 部署流水线中保持“部署 + 初始化”连续执行；
  - 初始化完成后可评估转移/收紧升级权限策略。

2. 标准 NFT 元数据
- 当前未接入 Metaplex Metadata CPI，链上 NFT 标准展示能力有限。
- 建议在后续版本补齐。

## 5. 与钱包联调的安全边界

钱包侧仍需执行强校验（链参数、地址、哈希格式），与链上校验形成双层防线。  
详细见：`docs/钱包接口/钱包接口技术规范.md`。
