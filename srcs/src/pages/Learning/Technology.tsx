/**
 * 技术说明页面
 *
 * 展示Ming平台的技术架构、实现原理和开发文档
 */

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';

const Technology: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          技术说明
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          了解Ming平台的技术架构、实现原理和开发文档，深入理解系统设计。
        </Typography>

        {/* 技术架构区域 */}
        <Box sx={{ textAlign: 'center', mb: 5, mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            技术架构
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '900px', mx: 'auto' }}>
            Ming 前端基于 Vite + React 18 + TypeScript + Material UI 构建；通过 ethers.js 与自定义钱包接口完成链上交互，
            并结合 IPFS 等去中心化存储方案承载仪式图片与元数据，使"记录与见证"的过程本身具备可验证性与可迁移性。
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  前端 & 交互层
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vite + React 18 + TypeScript + Material UI，提供快速、现代的交互体验，并通过组件化封装命理分析、仪式流程与钱包连接。
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  区块链 & 存储
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  使用 ethers.js 对接区块链与 ERC-721 合约，结合 IPFS 与本地缓存承载仪式图片与元数据，确保记录可验证、可访问。
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  钱包
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <a
                    href="https://andao.cdao.online/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    andao 钱包
                  </a>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  提供 Web3 钱包连接与链上操作入口，以"平台只准备数据、钱包负责签名与执行"的分层方式保障安全与清晰边界。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 重要说明区域 */}
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            重要说明
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: '700px', mx: 'auto' }}>
            Ming 平台提供的是基于传统文化智慧的象征性仪式体验，融合 Web3 技术与集体共识机制。
            我们致力于构建一种人与命运共修的新范式，而非提供精确的命理预测或效果量化验证。
            建议将仪式视为个人成长、文化体验与集体能量共振的一部分。
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Technology;
