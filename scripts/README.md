# Ming scripts

本目录是 Ming 的统一脚本入口层。

## 1. 功能范围

- 前端发布（GitHub + Vercel）
- EVM 合约部署（ConnectionNFT）
- Ming 自定义 NFT 流程检查（不是普通 NFT 流程）
- 钱包联调检查（Ming + AnDaoWallet）

## 2. 核心入口

- `deploy.sh`：统一总入口
- `deploy_all.sh`：默认前端全流程，可选包含后端 EVM 步骤

## 3. 子命令说明（deploy.sh）

```bash
# 帮助
./scripts/deploy.sh help

# 前端相关
./scripts/deploy.sh github "chore: update"
./scripts/deploy.sh vercel production
./scripts/deploy.sh all production "feat: release"

# 后端 EVM 合约（ConnectionNFT）
./scripts/deploy.sh backend-evm sepolia
./scripts/deploy.sh backend-evm fuji

# Ming 自定义 NFT 流程检查（mintConnection staticCall 路径）
./scripts/deploy.sh nft-flow-check sepolia 0xYourContractAddress
# 或省略地址，自动读取 contracts/deployments 最新记录
./scripts/deploy.sh nft-flow-check sepolia
```

注意：`hardhat` 网络是一次性临时链，不适合跨命令做流程检查；请使用 `localhost`（先启动 `hardhat node`）或测试网。

Avalanche 推荐网络：

- `fuji`（测试网，chainId `43113`）
- `avalanche`（主网 C-Chain，chainId `43114`）
- 详细部署说明见：`/home/lc/luckee_dao/ming/contracts/AVALANCHE_DEPLOYMENT.md`

## 4. 新增脚本

- `deploy_contract_evm.sh`
  - 调用 `contracts/scripts/deploy.js`
  - 部署前会先执行 `contracts/scripts/preflight_deploy.js` 检查网络与余额
  - 目标是 Ming 的 ConnectionNFT 合约，不是通用 NFT 模板
- `check_custom_nft_flow.sh`
  - 调用 `contracts/scripts/check_mint_permission.js`
  - 校验 Ming 自定义铸造/释放流程可达性
- `check_modelscope_api.sh`
  - 校验 ModelScope API-Inference（OpenAI 兼容）联通性
  - 默认模型为 `dclef233/BaZi-Qwen3-1.7B-GGUF`

## 5. deploy_all 可选后端参数

`deploy_all.sh` 默认仅做前端发布；如需带后端合约步骤：

```bash
cd /home/lc/luckee_dao/ming
MING_DEPLOY_BACKEND_EVM=true \
MING_BACKEND_NETWORK=sepolia \
MING_RUN_NFT_FLOW_CHECK=true \
./scripts/deploy_all.sh production "feat: full release"
```

可选指定地址（流程检查时）：

```bash
MING_CONTRACT_ADDRESS=0xYourContractAddress
```

合约依赖安装控制（网络不稳定时有用）：

```bash
NPM_INSTALL_RETRY=3              # 默认 3 次重试
CONTRACTS_SKIP_NPM_INSTALL=true  # 已预装依赖时可跳过安装
```

## 6. 注意事项

1. Ming NFT 为定制流程（连接信息、共识哈希、流程控制），不要按普通 ERC721 发行流程替代。
2. 合约部署依赖 `ming/contracts` 下 Hardhat 工程与环境变量（如 `PRIVATE_KEY`、RPC URL）。
   - `deploy_contract_evm.sh` 会优先读取 `ming/contracts/.env`，并回退读取 `/home/lc/luckee_dao/env/.env`。
3. 钱包联调脚本保持原有入口：
   - `run_wallet_integration_checks.sh`
   - `run_wallet_cross_window_preflight.sh`
   - `run_wallet_handshake_smoke.sh`

## 7. 钱包联调推荐命令

仅 Ming 前端（协议 + Mock E2E + 跨窗口）：

```bash
cd /home/lc/luckee_dao/ming/srcs
npm run test:wallet:unit
npm run test:wallet:e2e:mock
npm run test:wallet:e2e:cross-window
```

一键联调（含 AnDaoWallet 校验）：

```bash
cd /home/lc/luckee_dao/ming
./scripts/run_wallet_integration_checks.sh
```

一键联调 + 合约测试：

```bash
cd /home/lc/luckee_dao/ming
./scripts/run_wallet_integration_checks.sh --with-contracts
```

默认会自动清理 `srcs/playwright-report` 与 `srcs/test-results`，避免产物污染工作区。若需要保留报告：

```bash
cd /home/lc/luckee_dao/ming
KEEP_E2E_ARTIFACTS=true ./scripts/run_wallet_integration_checks.sh --with-contracts
```

## 8. 线上钱包域名约定

- 当前可用域名：`https://andao.cdao.online`
- 钱包对接统一使用根域名，不使用 `www` 子域名。
