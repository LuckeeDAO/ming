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
- `VITE_AI_CHAT_API_PATH`（默认 `/api/fortune-chat`）
- `VITE_AI_FORTUNE_MODEL`（默认 `Qwen/Qwen3-8B`）

## AI命理学习接口

学习菜单中的 `AI命理学习` 页面通过 `POST /api/fortune-chat` 调用后端代理。

后端（Vercel Function）需配置：
- `MODELSCOPE_API_KEY`
- `AI_FORTUNE_MODEL`（可选，默认 `Qwen/Qwen3-8B`）
- `AI_FORTUNE_FALLBACK_MODEL`（可选，默认 `Qwen/Qwen3-8B`）
- `AI_FORTUNE_BASE_URL`（可选，默认 `https://api-inference.modelscope.cn/v1`）
- `AI_FORTUNE_API_URL`（可选，优先级高于 `AI_FORTUNE_BASE_URL`）

建议同时配置安全项：
- `AI_FORTUNE_ALLOWED_MODELS`：允许模型白名单（逗号分隔）
- `AI_FORTUNE_ALLOWED_ORIGINS`：允许来源域名白名单（逗号分隔）
- `AI_FORTUNE_RATE_LIMIT`：每 IP 每分钟请求上限（默认 20）
- `AI_FORTUNE_MAX_MESSAGES`：单次请求消息条数上限（默认 30）
- `AI_FORTUNE_MAX_CONTENT_CHARS`：单条消息字符上限（默认 4000）
- `AI_FORTUNE_MAX_HISTORY_TURNS`：保留的上下文轮数（默认 20）
- `AI_FORTUNE_QA_MODEL`：快速问答模式模型（可选）
- `AI_FORTUNE_QA_MAX_TOKENS`：快速问答最大输出 token（默认 420）
- `AI_FORTUNE_FULL_MAX_TOKENS`：深度解析最大输出 token（默认 900）
- `AI_FORTUNE_CACHE_TTL_MS`：快速问答缓存有效期毫秒（默认 120000）
- `AI_FORTUNE_CACHE_MAX_SIZE`：快速问答缓存条数上限（默认 200）
- `AI_FORTUNE_LOCAL_CONTEXT_MAX_CHARS`：本地排盘上下文最大长度（默认 1200）
- `AI_FORTUNE_ENABLE_AUTOCORRECT`：排盘冲突时自动二次纠偏（默认 true）
- `AI_FORTUNE_TIMEOUT_MS`：上游超时毫秒（默认 90000）
- `AI_FORTUNE_SYSTEM_PROMPT`：服务端系统提示词（可覆盖默认“命理学习顾问”提示词）
- `AI_FORTUNE_CLIENT_TOKEN`：可选客户端令牌（启用后需请求头 `x-client-token`）

## ModelScope 接入设置（官方 API-Inference）

1. 在 ModelScope 控制台创建 API Token。  
2. 在部署平台（Vercel）配置 `MODELSCOPE_API_KEY`。  
3. 确认后端请求使用 OpenAI 兼容接口：  
   - Base URL: `https://api-inference.modelscope.cn/v1`  
   - Path: `/chat/completions`  
   - Header: `Authorization: Bearer $MODELSCOPE_API_KEY`  
   - 非流式建议加：`enable_thinking=false`（Qwen3 避免参数报错）  
4. 前端仅调用本项目 `/api/fortune-chat`，不要直连 ModelScope。

当前默认已切到通用可用模型（`Qwen/Qwen3-8B`），用于先跑通系统；后续可再切回自建命理微调模型。接口支持 `mode=qa|full|auto`，前端可切换“快速问答/深度解析”。

说明：系统提示词在服务端强制注入，前端传入的 `system` 消息会被忽略，以保证输出风格和安全边界稳定；默认优先快速问答，避免无关的模板化长回复。

一致性修正：当前已接入“本地权威排盘基线”。当用户输入可解析出生时间时，前端会用本地算法先算四柱/十神并作为隐藏上下文传入；AI只负责解释，不允许改写本地排盘结果。该基线支持阳历输入，也支持带“农历/阴历”标记的日期输入（如 `农历1995-07-19 09:30` 或 `农历1995年七月十九巳时`），内部先做农历→阳历换算再排盘。

错误排查：接口错误会返回 `request_id`，可用该值在 Vercel Runtime Logs 中快速定位具体失败原因。

本 README 仅说明 `srcs` 子项目自身，不依赖外部文档目录。
