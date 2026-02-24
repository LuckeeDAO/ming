/**
 * 页脚组件
 * 
 * 功能：
 * - 显示版权信息
 * - 显示平台描述
 * - 提供统一的页脚样式
 * 
 * @module components/layout/Footer
 */

import React from 'react';
import { Box, Typography, Container } from '@mui/material';

/**
 * 页脚组件
 * 
 * @returns JSX元素
 */
const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Ming Platform. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          基于四柱八字能量循环理论的 Web3 仪式平台
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
