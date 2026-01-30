/**
 * 关于页面
 * 
 * 介绍平台的基本信息：
 * - 平台定位
 * - 核心理念
 * - 技术架构
 * - 联系方式
 */
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
} from '@mui/material';

const About: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          关于 Ming
        </Typography>

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              平台定位
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Ming（命/明）平台是一个基于四柱八字能量循环理论的Web3仪式平台，
              通过NFT作为能量场见证，帮助用户通过外物连接来改命。
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              核心理念
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              "缺失认知，外物连接，NFT见证，仪式完成"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - 命（先天框架）：四柱八字是先天给定的命运框架
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - 明（知命）：通过分析了解自己的能量系统
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - 改命（借物改命）：通过外物连接，借助公网共识能量场，强行改变命理布局
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              技术架构
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              - 前端：React 18 + TypeScript + Material-UI
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              - 区块链：ethers.js + ERC-721
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              - 存储：IPFS + 本地存储
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default About;
