/**
 * 工具页面
 *
 * 提供各类实用工具：
 * - 八字与十神
 * - 五行能量测算
 * - AI图片编辑
 * - 图片模板
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
import { Link } from 'react-router-dom';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CalculateIcon from '@mui/icons-material/Calculate';
import ImageIcon from '@mui/icons-material/Image';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

const Tools: React.FC = () => {
  const tools = [
    {
      id: 'bazi-tenshen',
      title: '八字与十神',
      description: '输入生辰信息，自动计算四柱八字，并分析十神关系，了解命局结构。',
      icon: <PsychologyIcon sx={{ fontSize: 48 }} />,
      path: '/four-pillars',
      color: 'primary',
    },
    {
      id: 'energy-original',
      title: '本命原局能量',
      description: '基于四柱八字，对本命原局五行能量进行量化分析，检测分布、循环状态和缺失元素。',
      icon: <CalculateIcon sx={{ fontSize: 48 }} />,
      path: '/energy-original',
      color: 'secondary',
    },
    {
      id: 'fortune-flow',
      title: '大运与流年',
      description: '基于出生日期查看大运、流年、流月、流时干支流转，理解时间维度的能量节奏。',
      icon: <CalculateIcon sx={{ fontSize: 48 }} />,
      path: '/fortune-flow',
      color: 'primary',
    },
    {
      id: 'ai-image-edit',
      title: 'AI图片编辑',
      description: '使用AI技术对仪式图片进行智能编辑和优化，提升视觉效果。',
      icon: <ImageIcon sx={{ fontSize: 48 }} />,
      path: '/connection-ceremony',
      color: 'primary',
      comingSoon: true,
    },
    {
      id: 'image-templates',
      title: '领域文案图片模板参考',
      description: '根据不同场合提供不同的图片模板，帮助您快速选择合适的视觉风格。',
      icon: <PhotoLibraryIcon sx={{ fontSize: 48 }} />,
      path: '/image-template-reference',
      color: 'secondary',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          工具
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          提供实用的命理分析工具和内容创作辅助，帮助你更好地理解能量系统并完成仪式创作。
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {tools.map((tool) => (
            <Grid item xs={12} sm={6} md={6} key={tool.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  opacity: tool.comingSoon ? 0.7 : 1,
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box sx={{ color: `${tool.color}.main`, mb: 2 }}>
                    {tool.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {tool.title}
                    {tool.comingSoon && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ ml: 1, color: 'text.secondary' }}
                      >
                        (即将推出)
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tool.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  {tool.comingSoon ? (
                    <Button disabled size="small" variant="outlined">
                      即将推出
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      to={tool.path}
                      size="small"
                      variant="contained"
                      color={tool.color as 'primary' | 'secondary'}
                    >
                      使用工具
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Tools;
