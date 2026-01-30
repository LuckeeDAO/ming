/**
 * 仪式资源页面
 * 
 * 提供仪式相关的资源支持：
 * - 仪式指南库
 * - 素材库（图片、文案、音乐）
 * - 文化知识库
 * - 模板选择
 */
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';

const CeremonyResources: React.FC = () => {
  const resources = [
    {
      title: '基础仪式指南',
      description: '了解基本的连接仪式流程和注意事项',
      category: '指南',
    },
    {
      title: '自然物特定仪式',
      description: '针对不同自然物的专门仪式指导',
      category: '指南',
    },
    {
      title: '象征图片库',
      description: '用于仪式的象征性图片素材',
      category: '素材',
    },
    {
      title: '仪式文案模板',
      description: '仪式中使用的文案模板',
      category: '素材',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          仪式资源
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          获取仪式指南、素材和文化知识
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {resources.map((resource, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    {resource.category}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {resource.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resource.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">查看详情</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default CeremonyResources;
