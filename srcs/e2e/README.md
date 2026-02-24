# E2E 测试说明

本目录包含基于 Playwright 的端到端测试。

## 用例概览

- `example.spec.ts`
  - 首页加载
  - 兼容路由重定向到 `ConnectionCeremony`
  - 仪式页标签切换 URL 同步
  - 钱包连接按钮展示与缩略地址显示（Mock `window.ethereum`）
- `wallet-flow.spec.ts`
  - `SimpleMint` 通过钱包接口完成铸造（Mock 钱包桥接 + Mock Pinata 上传）

## 运行方式

```bash
npm run test:e2e
```

或仅运行 Chromium：

```bash
npx playwright test --project=chromium
```

## 环境变量与服务

`playwright.config.ts` 已将 webServer 启动命令设置为：

- `VITE_PINATA_API_KEY=e2e`
- `VITE_PINATA_SECRET_KEY=e2e`
- `npm run dev -- --host 127.0.0.1 --port 5173`

说明：

- 用例内会拦截 `https://api.pinata.cloud/pinning/pinFileToIPFS` 并返回 Mock 哈希，不依赖真实 Pinata。
- 钱包桥接通过重写 `window.postMessage` + `MessageEvent` 回包模拟。

## 常见问题

- 报错 `Process from config.webServer was not able to start`：
  - 通常是测试环境不允许监听本地端口（例如受限沙箱）。
  - 请在本机开发环境运行（可监听 `127.0.0.1:5173`）。
