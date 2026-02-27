# Ming Frontend (`srcs`)

`srcs` 是 Ming 的前端子项目，基于 React + TypeScript + Vite。

## 目录结构

```text
srcs/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── utils/
│   ├── types/
│   ├── styles/
│   ├── i18n/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── env.example
└── README.md
```

## 快速开始

```bash
npm install
cp env.example .env
npm run dev
```

## 常用命令

```bash
npm run dev
npm run build
npm test
```

## 环境变量关键项

- `VITE_CHAIN_FAMILY=evm|solana`
- `VITE_CHAIN_NETWORK`
- `VITE_NFT_CONTRACT_ADDRESS`

本 README 仅说明 `srcs` 子项目自身，不依赖外部文档目录。
