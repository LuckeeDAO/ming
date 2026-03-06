/**
 * 应用入口文件
 * 
 * 功能：
 * - 初始化React应用
 * - 配置Redux状态管理
 * - 配置Material-UI主题
 * - 配置React Router路由
 * - 应用全局样式
 * 
 * @module main
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { store } from './store/store';
import { theme } from './styles/theme';
import { ipfsService } from './services/ipfs/ipfsService';
import './styles/global.css';

// 兼容部分依赖中使用的 Node.js `process` 对象（例如 chinese-lunar 的打包代码）
// 在浏览器环境中注入一个最小的 polyfill，避免运行时报 `process is not defined`
if (typeof (globalThis as any).process === 'undefined') {
  (globalThis as any).process = { env: {} };
}

// 初始化 IPFS 服务（用于 NFT 图片和元数据上传）
ipfsService.init({
  pinataApiKey: import.meta.env.VITE_PINATA_API_KEY,
  pinataSecretApiKey: import.meta.env.VITE_PINATA_SECRET_KEY,
});

if (!import.meta.env.VITE_PINATA_API_KEY || !import.meta.env.VITE_PINATA_SECRET_KEY) {
  console.warn(
    'IPFS service initialized without Pinata keys. Upload features will fail until env vars are configured.'
  );
}

/**
 * 过滤浏览器钱包扩展注入脚本噪声（不影响应用逻辑）
 *
 * 背景：
 * - 多钱包扩展并存时，扩展会竞争注入 window.ethereum
 * - 控制台常见报错：Cannot redefine property: ethereum / Cannot set property chainId...
 * - 这些错误通常来自扩展 inpage 脚本，不是站点业务代码
 */
const isWalletInjectionNoise = (message: string): boolean => {
  const text = message.toLowerCase();
  return (
    text.includes('cannot redefine property: ethereum') ||
    text.includes('cannot set property chainid') ||
    text.includes('wallet must has at least one account') ||
    text.includes("websocket connection to 'ws://localhost:8081/' failed") ||
    text.includes('evmask.js') ||
    text.includes('inpage.js') ||
    text.includes('refresh.js')
  );
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const reasonRecord =
    reason && typeof reason === 'object'
      ? (reason as { code?: string | number; message?: string })
      : null;
  const reasonText =
    typeof reason === 'string'
      ? reason
      : reasonRecord?.message ||
        `${reasonRecord?.code ?? ''}` ||
        JSON.stringify(reason || '');

  if (isWalletInjectionNoise(reasonText)) {
    event.preventDefault();
    console.warn('Suppressed wallet-extension injection noise:', reasonText);
  }
});

window.addEventListener('error', (event) => {
  const message = event.message || '';
  const filename = event.filename || '';
  if (isWalletInjectionNoise(`${message} ${filename}`)) {
    event.preventDefault();
    console.warn('Suppressed wallet-extension script error:', message);
  }
});

/**
 * 渲染应用根组件
 * 
 * 配置说明：
 * - React.StrictMode: 启用严格模式，帮助发现潜在问题
 * - Provider: Redux状态管理提供者
 * - ThemeProvider: Material-UI主题提供者
 * - CssBaseline: Material-UI基础样式重置
 * - BrowserRouter: React Router路由提供者
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
