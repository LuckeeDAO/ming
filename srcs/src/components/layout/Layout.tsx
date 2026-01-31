/**
 * 布局组件
 * 
 * 功能：
 * - 提供应用的整体布局结构
 * - 包含Header、Footer和主内容区域
 * - 使用Flexbox布局，确保Footer始终在底部
 * 
 * @module components/layout/Layout
 */

import React from 'react';
import { Box } from '@mui/material';
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
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
