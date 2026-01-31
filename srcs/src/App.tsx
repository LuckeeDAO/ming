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
 * - /connection-guide : 外物连接指导
 * - /nft-ceremony : NFT仪式制作流程
 * - /my-connections : 我的连接记录
 * - /ceremony-resources : 仪式资源支持
 * 
 * @module App
 */

import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// 懒加载页面组件（代码分割，提升性能）
const Home = lazy(() => import('./pages/Home/index'));
const ConnectionGuide = lazy(() => import('./pages/ConnectionGuide/index'));
const NFTCeremony = lazy(() => import('./pages/NFTCeremony/index'));
const MyConnections = lazy(() => import('./pages/MyConnections/index'));
const CeremonyResources = lazy(() => import('./pages/CeremonyResources/index'));

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
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connection-guide" element={<ConnectionGuide />} />
            <Route path="/nft-ceremony" element={<NFTCeremony />} />
            <Route path="/my-connections" element={<MyConnections />} />
            <Route
              path="/ceremony-resources"
              element={<CeremonyResources />}
            />
            {/* 向后兼容：重定向到首页 */}
            <Route path="/concept" element={<Home />} />
            <Route path="/about" element={<Home />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
