import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import WalletConnect from '../wallet/WalletConnect';

const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: '首页', path: '/' },
    { label: '外物连接仪式', path: '/connection-ceremony' },
    { label: '我的连接', path: '/my-connections' },
  ];

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
          }}
        >
          Ming
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              color="inherit"
              sx={{
                textTransform: 'none',
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
        <Box sx={{ ml: 2 }}>
          <WalletConnect />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
