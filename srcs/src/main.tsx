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
import './styles/global.css';

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
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
