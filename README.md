# Ming

Ming 是一个 Web3 仪式型 NFT 平台项目，包含前端应用、Solana 合约与工程脚本。

## 目录结构

```text
ming/
├── srcs/               # 前端项目（Vite + React + TypeScript）
├── contracts/solana/   # Solana 合约工程（Anchor）
├── scripts/            # 部署与联调脚本
├── ref/                # 参考资料
└── README.md
```

## 环境要求

- Node.js >= 18
- npm >= 9
- Solana/Anchor（仅合约开发需要）

## 前端启动

```bash
cd srcs
npm install
npm run dev
```

## 合约开发（可选）

```bash
cd contracts/solana
npm install
anchor build
anchor test
```

## 常用脚本

```bash
# 在 ming 根目录执行
./scripts/upload_to_github.sh "docs: update ming"
./scripts/deploy.sh github "chore: update"
./scripts/deploy.sh vercel production
```

## 项目边界

本 README 仅描述 `ming` 仓库自身内容与运行方式，不依赖外部文档目录。
