import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Ming (命/明)
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          外物连接NFT仪式平台
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 4, mb: 4 }}>
          基于四柱八字能量循环理论的Web3改命平台
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/connection-guide"
          >
            开始连接
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/concept"
          >
            了解概念
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
