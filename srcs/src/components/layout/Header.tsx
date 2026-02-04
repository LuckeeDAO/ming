/**
 * 顶部栏组件
 * 
 * 功能：
 * - 显示Logo
 * - 显示钱包连接组件
 * - 移动端显示菜单按钮（用于打开侧边栏）
 * 
 * @module components/layout/Header
 */

import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import WalletConnect from '../wallet/WalletConnect';

/**
 * Header组件属性接口
 */
interface HeaderProps {
  /**
   * 菜单按钮点击回调（用于移动端打开侧边栏）
   */
  onMenuClick?: () => void;
}

/**
 * 顶部栏组件
 * 
 * @param props - 组件属性
 * @param props.onMenuClick - 菜单按钮点击回调
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* 移动端菜单按钮 */}
        {onMenuClick && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
          }}
        >
          Ming
        </Typography>

        {/* 右侧钱包连接 */}
        <Box sx={{ flexGrow: 1 }} />
        <Box>
          <WalletConnect />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
