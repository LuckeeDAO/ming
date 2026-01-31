/**
 * 首页组件
 * 
 * 整合了以下内容（按顺序）：
 * - 关于平台信息（第一部分）
 * - 核心概念介绍（第二部分）
 * - 开始处理区域（第三部分）
 * 
 * 采用滚动式布局，用户可以在一个页面中浏览所有信息
 */
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* 关于平台区域 - 第一部分 */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            关于 Ming
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              平台定位
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Ming（命/明）平台是一个基于四柱八字能量循环理论的Web3仪式平台，
              通过NFT作为能量场见证，帮助用户通过外物连接来改命。
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              核心理念
            </Typography>
            <Typography
              variant="body1"
              color="primary"
              paragraph
              sx={{ fontStyle: 'italic', fontWeight: 500 }}
            >
              "缺失认知，外物连接，NFT见证，仪式完成"
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                • <strong>命（先天框架）</strong>：四柱八字是先天给定的命运框架
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • <strong>明（知命）</strong>：通过分析了解自己的能量系统
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • <strong>改命（借物改命）</strong>：通过外物连接，借助公网共识能量场，强行改变命理布局
              </Typography>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              技术架构
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                • <strong>区块链</strong>：Avalanche 链
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • <strong>存储</strong>：IPFS + 本地存储
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
                <a 
                  href="https://andao.cdao.online/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  andao 钱包
                </a>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Divider />

      {/* 核心概念区域 - 第二部分 */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            核心概念
          </Typography>
          <Typography variant="body1" color="text.secondary">
            了解 Ming 平台的核心理念和理论基础
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* 能量循环概念 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  能量循环
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  生命能量需要在系统中循环流动。循环不畅可能影响整体状态，
                  可通过象征性连接来改善能量流通。
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 缺失元素概念 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  缺失元素
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  每个人可能有相对较弱的能量类型。可通过自我感受初步判断，
                  不提供精确的量化分析。
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 外物连接概念 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  外物连接
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  自然万物具有不同能量特质。通过与特定自然物建立象征性连接，
                  可以补充个人相对缺失的能量类型。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 重要说明 */}
        <Box
          sx={{
            mt: 6,
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            重要说明
          </Typography>
          <Typography variant="body2" color="text.secondary">
            本平台提供的是基于传统文化智慧的象征性仪式，不涉及精确的命理分析和效果量化验证。
            建议将仪式视为个人成长和文化体验的一部分。
          </Typography>
        </Box>
      </Container>

      <Divider />

      {/* 开始处理区域 - 第三部分 */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 6, md: 12 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Ming (命/明)
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            color="text.secondary"
            gutterBottom
            sx={{ mt: 2 }}
          >
            外物连接NFT仪式平台
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 4, mb: 4, maxWidth: '600px', mx: 'auto' }}
          >
            基于四柱八字能量循环理论的Web3改命平台
            <br />
            通过NFT作为能量场见证，帮助用户通过外物连接来改命
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/connection-guide"
              sx={{ px: 4 }}
            >
              开始连接
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/my-connections"
              sx={{ px: 4 }}
            >
              我的连接
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
