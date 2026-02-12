/**
 * 左侧导航栏组件
 * 
 * 功能：
 * - 提供左侧导航菜单
 * - 支持多级菜单展开/收起
 * - 路由高亮显示
 * - 响应式设计（移动端抽屉式）
 * 
 * @module components/layout/Sidebar
 */

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import LinkIcon from '@mui/icons-material/Link';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';

/**
 * 导航菜单项接口
 */
interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

/**
 * Sidebar组件属性接口
 */
interface SidebarProps {
  /**
   * 是否打开（用于移动端抽屉控制）
   */
  open?: boolean;
  /**
   * 关闭回调（用于移动端）
   */
  onClose?: () => void;
}

/**
 * 左侧导航栏组件
 * 
 * @param props - 组件属性
 * @param props.open - 是否打开
 * @param props.onClose - 关闭回调
 */
const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // 导航菜单配置
  const navItems: NavItem[] = [
    {
      label: '首页',
      path: '/',
      icon: <HomeIcon />,
      children: [
        { label: '功能介绍', path: '/' },
        { label: '铸造NFT', path: '/connection-ceremony' },
        { label: '关于平台', path: '/about/intro' },
      ],
    },
    {
      label: '工具',
      path: '/tools',
      icon: <BuildIcon />,
      children: [
        { label: '八字与十神', path: '/four-pillars' },
        { label: '五行能量测算', path: '/energy-original' },
        { label: 'AI图片编辑', path: '/tools' },
        { label: '图片模板', path: '/tools' },
        { label: '仪式资源', path: '/ceremony-resources' },
      ],
    },
    {
      label: '学习',
      path: '/learning',
      icon: <SchoolIcon />,
      children: [
        { label: '技术说明', path: '/learning/technology' },
        { label: '其他', path: '/learning/other' },
      ],
    },
    {
      label: '我的连接',
      path: '/my-connections',
      icon: <LinkIcon />,
    },
  ];

  // 检查当前路由是否匹配
  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    // 处理带query参数的路径
    const [pathname, search] = path.split('?');
    if (search) {
      // 如果路径包含query参数，需要同时匹配pathname和search
      return location.pathname === pathname && location.search.includes(search);
    }
    return location.pathname.startsWith(pathname);
  };

  // 检查是否有子菜单项处于激活状态
  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.path));
  };

  // 初始化展开状态：如果当前路由匹配某个菜单项或其子项，自动展开
  // 仅在首次挂载时根据当前路由设置，后续用户手动展开/收起不再被路由改变所重置
  useEffect(() => {
    const shouldExpand: string[] = [];
    navItems.forEach((item) => {
      if (item.children && (isActive(item.path) || hasActiveChild(item))) {
        shouldExpand.push(item.path);
      }
    });
    setExpandedItems(shouldExpand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 切换展开/收起
  const handleToggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((item) => item !== path)
        : [...prev, path]
    );
  };

  // 渲染菜单项
  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const active = isActive(item.path);
    const hasActive = hasActiveChild(item);

    return (
      <React.Fragment key={item.path}>
        <ListItem disablePadding>
          <ListItemButton
            component={hasChildren ? 'div' : Link}
            to={hasChildren ? undefined : item.path}
            onClick={() => {
              if (hasChildren) {
                handleToggleExpand(item.path);
              } else {
                // 移动端点击后关闭抽屉
                if (isMobile && onClose) {
                  onClose();
                }
              }
            }}
            sx={{
              pl: 2 + level * 2,
              backgroundColor: active || hasActive ? 'action.selected' : 'transparent',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              minHeight: 48,
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  color: active || hasActive ? 'primary.main' : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: active || hasActive ? 600 : 400,
                color: active || hasActive ? 'primary.main' : 'inherit',
              }}
            />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  // 侧边栏内容
  const drawerContent = (
    <Box sx={{ width: 240, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo区域 */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
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
        {isMobile && (
          <IconButton onClick={onClose} size="small">
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* 导航菜单 */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => renderNavItem(item))}
      </List>

      <Divider />
    </Box>
  );

  // 桌面端：固定侧边栏
  if (!isMobile) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100vh',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // 移动端：抽屉式侧边栏
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // 移动端性能优化
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
