/**
 * 布局组件
 * 
 * 功能：
 * - 提供应用的整体布局结构
 * - 包含Sidebar（左侧导航）、Header（顶部栏）、Footer和主内容区域
 * - 使用Flexbox布局，确保Footer始终在底部
 * - 响应式设计：桌面端固定侧边栏，移动端抽屉式侧边栏
 * 
 * @module components/layout/Layout
 */

import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

/**
 * 布局组件属性接口
 */
interface LayoutProps {
  /**
   * 子组件（页面内容）
   */
  children: React.ReactNode;
}

/**
 * 布局组件
 * 
 * @param props - 组件属性
 * @param props.children - 子组件
 */
const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      {/* 左侧导航栏 */}
      <Sidebar open={!isMobile || sidebarOpen} onClose={handleSidebarClose} />

      {/* 主内容区域 */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { md: 'calc(100% - 240px)' },
        }}
      >
        {/* 顶部栏 */}
        <Header onMenuClick={isMobile ? handleSidebarToggle : undefined} />

        {/* 页面内容 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
          }}
        >
          {children}
        </Box>

        {/* 底部 */}
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
