# Ming ConnectionNFT on Avalanche

本文件定义 Ming 自定义 `ConnectionNFT` 在 Avalanche C-Chain 的标准部署方式。

## 1. 方法选择

采用 `Hardhat + ethers` 直接部署到 Avalanche C-Chain（Fuji/Mainnet）。

原因：
- Avalanche Coreth C-Chain 兼容 EVM 与 Ethereum JSON-RPC，可直接复用 Solidity/Hardhat 部署流程。
- 当前 `ming/contracts` 已是 Hardhat 工程，成本最低且与现有脚本一致。

官方参考：
- Coreth Architecture: https://build.avax.network/docs/primary-network/coreth-architecture
- C-Chain API: https://build.avax.network/docs/api-reference/c-chain/api
- Deploy on Avalanche with Hardhat: https://build.avax.network/docs/dapps/chain-settings/deploy-with-hardhat

## 2. 环境变量

在 `ming/contracts/.env` 中配置（若不存在，会回退读取 `/home/lc/luckee_dao/env/.env`）：

```bash
PRIVATE_KEY=0x...   # 无 0x 前缀也可，脚本会自动补齐
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
```

## 3. 部署命令

从 `ming` 根目录：

```bash
# Fuji 测试网
./scripts/deploy.sh backend-evm fuji

# Avalanche C-Chain 主网
./scripts/deploy.sh backend-evm avalanche
```

或从 `ming/contracts` 直接执行：

```bash
npm run deploy:fuji
npm run deploy:avalanche
```

说明：
- `backend-evm` 会先执行 preflight（网络、chainId、部署地址、余额）再编译部署。
- 若余额为 0，preflight 会直接失败并停止后续步骤。

若 Fuji 提示余额不足，请先领取测试币：
- https://core.app/tools/testnet-faucet/?subnet=c&token=c

## 4. 实测记录（2026-03-02）

- Fuji 部署成功
  - 部署账户: `0xcE75Bd165D0cd29cdF4Af5B00Fda6AF18c04B578`
  - 合约地址: `0x3a6D83D1EEa51627c4306460eb62051DB3f01D41`
  - 部署记录文件: `contracts/deployments/fuji-1772417670586.json`
  - `nft-flow-check fuji` 结果: `PASS`

- Avalanche 主网部署状态
  - 预检 `chainId=43114` 正常
  - 当前测试账号余额均为 `0`，部署被 preflight 阶段拦截（符合预期）
  - 需要先给任一部署账号充值主网 AVAX 再执行部署
## 5. 部署后检查（自定义流程）

Ming NFT 是定制释放流程，不是普通 ERC721 发行流程。部署后执行：

```bash
cd /home/lc/luckee_dao/ming
./scripts/deploy.sh nft-flow-check fuji 0xYourContractAddress
```

若省略地址，脚本会读取 `contracts/deployments/` 最新部署记录。
