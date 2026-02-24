# 钱包协议与 EVM 指令映射（占位）

> 基线版本：v1.0（参照 `docs/00-现行口径基线.md`）

## 1. 文档定位

本文件是 `chainFamily=evm` 的映射占位文档，用于提前固定结构与验收边界。  
当前不作为上线执行依据；上线前需补齐“字段映射细节 + 交易回执语义 + 安全验证清单”。

全链总口径仍以 `docs/钱包接口/钱包接口技术规范.md` 为准。

## 2. 协议入口（统一）

1. `MING_WALLET_MINT_NFT_REQUEST`
2. `MING_WALLET_CREATE_SCHEDULED_TASK_REQUEST`
3. `MING_WALLET_GET_SCHEDULED_TASK_REQUEST`
4. `MING_WALLET_GET_SCHEDULED_TASKS_BY_WALLET_REQUEST`
5. `MING_WALLET_CANCEL_SCHEDULED_TASK_REQUEST`
6. `MING_WALLET_RELEASE_CONNECTION_NFT_REQUEST`

## 3. EVM 关键字段约束（预置）

1. `contract.chainFamily` 必须为 `evm`
2. `contract.chainId` 必须为正整数并与钱包当前网络一致
3. `contract.address`、`params.to` 必须满足 EVM 地址格式
4. `protocolVersion` 必填且固定为 `1.0.0`
5. `timing` 必填（`strategy=immediate/scheduled`）

## 4. 指令映射（待补齐）

### 4.1 立即铸造

- 协议：`MING_WALLET_MINT_NFT_REQUEST`
- 目标：EVM 合约铸造函数（待根据最终合约 ABI 固化）
- 待补齐：
  1. `params.*` 与合约参数一一映射
  2. 回执中 `tokenId` 提取规则（事件优先）
  3. 失败错误码映射（`TRANSACTION_REJECTED` / `CONTRACT_CALL_FAILED` 等）

### 4.2 定时铸造

- 协议：`MING_WALLET_CREATE_SCHEDULED_TASK_REQUEST`
- 执行：钱包队列到时触发 EVM 铸造交易
- 待补齐：
  1. 任务存储结构
  2. 幂等策略（重复触发保护）
  3. 超时与重试机制

### 4.3 封局释放

- 协议：`MING_WALLET_RELEASE_CONNECTION_NFT_REQUEST`
- 目标：EVM 合约释放函数（待最终 ABI）
- 待补齐：
  1. `params.tokenId` 语义（EVM tokenId）
  2. `releasedTokenURI` 写入流程与事件回执
  3. 释放后元数据约束验证（封局评价参数 attributes）

## 5. 安全校验清单（待补齐）

1. 重放防护（同一 `messageId` 仅执行一次）
2. 参数白名单（URI 协议、地址格式、hash 长度）
3. 交易发送前用户确认
4. 最小披露错误信息
5. 交易回执验证与最终一致性检查

## 6. 上线前补齐门槛

1. 补齐与最终 EVM ABI 对齐的字段映射表
2. 补齐端到端联调样例（请求/响应/错误）
3. 补齐 EVM 专项安全审计记录
4. 在 `docs/钱包接口/钱包联调验收清单.md` 增加 EVM 条目并完成勾验
