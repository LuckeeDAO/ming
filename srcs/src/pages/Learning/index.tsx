/**
 * 学习页面
 *
 * 提供学习资源：
 * - 技术说明
 * - 仪式资源
 * - 其他学习材料
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
import CodeIcon from '@mui/icons-material/Code';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';

const Learning: React.FC = () => {
  const learningResources = [
    {
      id: 'technology',
      title: '技术说明',
      description: '了解Ming平台的技术架构、实现原理和开发文档，深入理解系统设计。',
      icon: <CodeIcon sx={{ fontSize: 48 }} />,
      path: '/learning/technology',
      color: 'primary',
    },
    {
      id: 'ceremony-resources',
      title: '仪式资源',
      description: '获取仪式指南、素材模板和文化知识，把"知道"变成"做到"的行动接口。',
      icon: <MenuBookIcon sx={{ fontSize: 48 }} />,
      path: '/ceremony-resources',
      color: 'secondary',
    },
    {
      id: 'other',
      title: '其他',
      description: '更多学习材料和参考资料，持续更新中。',
      icon: <SchoolIcon sx={{ fontSize: 48 }} />,
      path: '/learning/other',
      color: 'primary',
      comingSoon: true,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          学习
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          深入学习Ming平台的技术原理、仪式文化和相关知识，提升对能量系统的理解。
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {learningResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
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
                  opacity: resource.comingSoon ? 0.7 : 1,
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box sx={{ color: `${resource.color}.main`, mb: 2 }}>
                    {resource.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {resource.title}
                    {resource.comingSoon && (
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
                    {resource.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  {resource.comingSoon ? (
                    <Button disabled size="small" variant="outlined">
                      即将推出
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      to={resource.path}
                      size="small"
                      variant="contained"
                      color={resource.color as 'primary' | 'secondary'}
                    >
                      开始学习
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

export default Learning;
