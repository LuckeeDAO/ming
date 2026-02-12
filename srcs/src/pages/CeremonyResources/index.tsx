/**
 * 仪式资源总览页面
 *
 * 提供仪式相关的资源支持：
 * - 仪式指南库
 * - 素材库（文案模板等）
 * - 文化知识库
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
import { useNavigate } from 'react-router-dom';
import { ceremonyResourcesService } from '../../services/ceremony/ceremonyResourcesService';

const CeremonyResources: React.FC = () => {
  const navigate = useNavigate();
  const resources = ceremonyResourcesService.getAllResources();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          仪式资源
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          获取从能量分析到外物选择再到 NFT 铸造的完整仪式指南、素材与文化知识，把“知道”变成“做到”的行动接口。
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {resources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
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
                  <Button size="small" onClick={() => navigate(resource.route)}>
                    查看详情
                  </Button>
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
