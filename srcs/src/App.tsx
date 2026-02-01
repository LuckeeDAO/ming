/**
 * 应用根组件
 * 
 * 功能：
 * - 配置路由系统
 * - 提供全局布局
 * - 错误边界处理
 * - 页面懒加载
 * 
 * 路由说明：
 * - / : 首页（整合了欢迎、核心概念、关于平台）
 * - /connection-ceremony : 外物连接仪式（整合了连接指导、NFT仪式、定时MINT、仪式资源）
 * - /my-connections : 我的连接记录
 * 
 * @module App
 */

import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
// 定时MINT功能已迁移到钱包，不再需要初始化
// import { useScheduledMint } from './hooks/useScheduledMint';

// 懒加载页面组件（代码分割，提升性能）
const Home = lazy(() => import('./pages/Home/index'));
const ConnectionCeremony = lazy(() => import('./pages/ConnectionCeremony/index'));
const MyConnections = lazy(() => import('./pages/MyConnections/index'));

// 布局组件
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * 加载中占位组件
 * 在页面组件懒加载时显示
 */
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

/**
 * 应用主组件
 * 
 * @returns JSX元素
 */
function App() {
  // 定时MINT服务已迁移到钱包，不再需要初始化
  // useScheduledMint();

  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connection-ceremony" element={<ConnectionCeremony />} />
            <Route path="/my-connections" element={<MyConnections />} />
            {/* 向后兼容：重定向到合并后的页面 */}
            <Route path="/connection-guide" element={<ConnectionCeremony />} />
            <Route path="/nft-ceremony" element={<ConnectionCeremony />} />
            <Route path="/scheduled-mints" element={<ConnectionCeremony />} />
            <Route path="/ceremony-resources" element={<ConnectionCeremony />} />
            <Route path="/concept" element={<Home />} />
            <Route path="/about" element={<Home />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
