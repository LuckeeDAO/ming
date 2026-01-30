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
 * - / : 首页（仪式连接总览）
 * - /concept : 核心概念介绍
 * - /connection-guide : 外物连接指导
 * - /nft-ceremony : NFT仪式制作流程
 * - /my-connections : 我的连接记录
 * - /ceremony-resources : 仪式资源支持
 * - /about : 关于仪式平台
 * 
 * @module App
 */

import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// 懒加载页面组件（代码分割，提升性能）
const Home = lazy(() => import('./pages/Home'));
const Concept = lazy(() => import('./pages/Concept'));
const ConnectionGuide = lazy(() => import('./pages/ConnectionGuide'));
const NFTCeremony = lazy(() => import('./pages/NFTCeremony'));
const MyConnections = lazy(() => import('./pages/MyConnections'));
const CeremonyResources = lazy(() => import('./pages/CeremonyResources'));
const About = lazy(() => import('./pages/About'));

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
            <Route path="/concept" element={<Concept />} />
            <Route path="/connection-guide" element={<ConnectionGuide />} />
            <Route path="/nft-ceremony" element={<NFTCeremony />} />
            <Route path="/my-connections" element={<MyConnections />} />
            <Route
              path="/ceremony-resources"
              element={<CeremonyResources />}
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
