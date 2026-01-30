/**
 * 核心概念页面
 * 
 * 介绍平台的核心理念：
 * - 能量循环概念
 * - 缺失元素概念
 * - 外物连接概念
 * - 平台理念说明
 */
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

const Concept: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          核心概念
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          了解 Ming 平台的核心理念和理论基础
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* 能量循环概念 */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
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

        {/* 免责声明 */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            重要说明
          </Typography>
          <Typography variant="body2" color="text.secondary">
            本平台提供的是基于传统文化智慧的象征性仪式，不涉及精确的命理分析和效果量化验证。
            建议将仪式视为个人成长和文化体验的一部分。
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Concept;
