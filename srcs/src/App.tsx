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
 * - / : 首页 - 关于平台（默认）
 * - /experience : 首页 - 体验与功能
 * - /technology : 首页 - 技术说明
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
const Philosophy = lazy(() => import('./pages/Philosophy/index'));
const About = lazy(() => import('./pages/About/index'));
const ConnectionCeremony = lazy(() => import('./pages/ConnectionCeremony/index'));
const MyConnections = lazy(() => import('./pages/MyConnections/index'));
const FourPillarsConverter = lazy(() => import('./pages/FourPillarsConverter/index'));
const EnergyOriginal = lazy(() => import('./pages/EnergyOriginal/index'));
const FortuneFlow = lazy(() => import('./pages/FortuneFlow/index'));
const CeremonyResources = lazy(() => import('./pages/CeremonyResources/index'));
const CeremonyResourceDetail = lazy(() => import('./pages/CeremonyResourceDetail/index'));
const Tools = lazy(() => import('./pages/Tools/index'));
const Learning = lazy(() => import('./pages/Learning/index'));
const Technology = lazy(() => import('./pages/Learning/Technology'));
const SimpleMint = lazy(() => import('./pages/SimpleMint/index'));
const ImageTemplateReference = lazy(() => import('./pages/ImageTemplateReference/index'));

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
            {/* 首页路由 */}
            <Route path="/" element={<Home key="home" />} />
            
            {/* 完整哲学白皮书 */}
            <Route path="/philosophy" element={<Philosophy />} />
            
            {/* 工具页面 */}
            <Route path="/tools" element={<Tools />} />
            {/* 生辰 → 四柱转换 */}
            <Route path="/four-pillars" element={<FourPillarsConverter />} />
            {/* 本命原局能量分析 */}
            <Route path="/energy-original" element={<EnergyOriginal />} />
            {/* 大运 / 流年流转查看 */}
            <Route path="/fortune-flow" element={<FortuneFlow />} />
            
            {/* 学习页面 */}
            <Route path="/learning" element={<Learning />} />
            <Route path="/learning/technology" element={<Technology />} />
            <Route path="/learning/other" element={<Learning />} />
            <Route path="/ceremony-resources" element={<CeremonyResources />} />
            <Route path="/ceremony-resources/:id" element={<CeremonyResourceDetail />} />
            
            {/* 关于平台路由 */}
            <Route path="/about" element={<About key="about-intro" />} />
            <Route path="/about/intro" element={<About key="about-intro" />} />
            <Route path="/about/philosophy" element={<About key="about-philosophy" />} />
            
            {/* 其他页面路由 */}
            <Route path="/connection-ceremony" element={<ConnectionCeremony />} />
            <Route path="/simple-mint" element={<SimpleMint />} />
            <Route path="/image-template-reference" element={<ImageTemplateReference />} />
            <Route path="/my-connections" element={<MyConnections />} />
            
            {/* 向后兼容路由 */}
            <Route path="/experience" element={<Home key="experience" />} />
            <Route path="/technology" element={<Home key="technology" />} />
            <Route path="/concept" element={<About key="about-philosophy" />} />
            <Route path="/connection-guide" element={<ConnectionCeremony />} />
            <Route path="/nft-ceremony" element={<ConnectionCeremony />} />
            <Route path="/scheduled-mints" element={<ConnectionCeremony />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
