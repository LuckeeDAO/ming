/**
 * 领域文案图片模板参考页面
 * 
 * 功能：
 * - 根据不同场合提供不同的图片模板
 * - 展示模板示例和使用说明
 */

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Download as DownloadIcon, Preview as PreviewIcon } from '@mui/icons-material';

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: Template[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  occasion: string;
  imageUrl?: string;
  colorScheme: string[];
  usage: string;
}

const ImageTemplateReference: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const categories: TemplateCategory[] = [
    {
      id: 'ceremony',
      name: '仪式场合',
      description: '适用于各种仪式和庆典场合',
      templates: [
        {
          id: 'ceremony-1',
          name: '祈福仪式模板',
          description: '适用于祈福、许愿等仪式场合',
          occasion: '祈福、许愿',
          colorScheme: ['#8B4513', '#FFD700', '#FF6347'],
          usage: '适合用于祈福、许愿、开光等仪式，主色调为棕色、金色和红色，营造庄重祥和的氛围。',
        },
        {
          id: 'ceremony-2',
          name: '连接仪式模板',
          description: '适用于外物连接仪式',
          occasion: '外物连接',
          colorScheme: ['#4A90E2', '#50C878', '#FF6B6B'],
          usage: '适合用于外物连接仪式，主色调为蓝色、绿色和红色，体现能量流动和连接的概念。',
        },
        {
          id: 'ceremony-3',
          name: '纪念仪式模板',
          description: '适用于重要纪念日仪式',
          occasion: '纪念日',
          colorScheme: ['#9370DB', '#FFB6C1', '#87CEEB'],
          usage: '适合用于纪念日、生日等重要时刻，主色调为紫色、粉色和天蓝色，营造温馨浪漫的氛围。',
        },
      ],
    },
    {
      id: 'business',
      name: '商务场合',
      description: '适用于商务和职场相关场合',
      templates: [
        {
          id: 'business-1',
          name: '商务洽谈模板',
          description: '适用于商务洽谈、签约等场合',
          occasion: '商务洽谈',
          colorScheme: ['#2C3E50', '#34495E', '#ECF0F1'],
          usage: '适合用于商务洽谈、签约等正式场合，主色调为深灰色和浅灰色，体现专业和稳重。',
        },
        {
          id: 'business-2',
          name: '职场提升模板',
          description: '适用于职场发展、升职等场合',
          occasion: '职场发展',
          colorScheme: ['#1E3A8A', '#3B82F6', '#60A5FA'],
          usage: '适合用于职场发展、升职等场合，主色调为深蓝色和浅蓝色，体现专业和进取。',
        },
      ],
    },
    {
      id: 'personal',
      name: '个人场合',
      description: '适用于个人生活和情感相关场合',
      templates: [
        {
          id: 'personal-1',
          name: '情感连接模板',
          description: '适用于情感连接、恋爱等场合',
          occasion: '情感连接',
          colorScheme: ['#FF69B4', '#FFB6C1', '#FFC0CB'],
          usage: '适合用于情感连接、恋爱等场合，主色调为粉色系，营造温馨浪漫的氛围。',
        },
        {
          id: 'personal-2',
          name: '健康养生模板',
          description: '适用于健康、养生等场合',
          occasion: '健康养生',
          colorScheme: ['#228B22', '#90EE90', '#98FB98'],
          usage: '适合用于健康、养生等场合，主色调为绿色系，体现生机和活力。',
        },
        {
          id: 'personal-3',
          name: '学业提升模板',
          description: '适用于学习、考试等场合',
          occasion: '学业提升',
          colorScheme: ['#4169E1', '#87CEEB', '#E0F6FF'],
          usage: '适合用于学习、考试等场合，主色调为蓝色系，体现智慧和专注。',
        },
      ],
    },
    {
      id: 'festival',
      name: '节日场合',
      description: '适用于各种传统节日和庆典',
      templates: [
        {
          id: 'festival-1',
          name: '春节模板',
          description: '适用于春节等传统节日',
          occasion: '春节',
          colorScheme: ['#DC143C', '#FFD700', '#FFA500'],
          usage: '适合用于春节等传统节日，主色调为红色、金色和橙色，营造喜庆祥和的氛围。',
        },
        {
          id: 'festival-2',
          name: '中秋模板',
          description: '适用于中秋节等传统节日',
          occasion: '中秋节',
          colorScheme: ['#FFD700', '#FFA500', '#FF8C00'],
          usage: '适合用于中秋节等传统节日，主色调为金色和橙色，体现团圆和温馨。',
        },
      ],
    },
  ];

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          领域文案图片模板参考
        </Typography>
        <Typography variant="body1" color="text.secondary">
          根据不同场合提供不同的图片模板，帮助您快速选择合适的视觉风格。
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => setSelectedCategory(newValue)}
        >
          {categories.map((category) => (
            <Tab key={category.id} label={category.name} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {categories[selectedCategory].description}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {categories[selectedCategory].templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
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
              }}
            >
              {template.imageUrl ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={template.imageUrl}
                  alt={template.name}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    background: `linear-gradient(135deg, ${template.colorScheme[0]} 0%, ${template.colorScheme[1]} 50%, ${template.colorScheme[2]} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    {template.name}
                  </Typography>
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Chip
                    label={template.occasion}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                  {template.colorScheme.map((color, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: color,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<PreviewIcon />}
                  onClick={() => handleTemplateClick(template)}
                >
                  预览
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  disabled
                >
                  下载
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 模板预览对话框 */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedTemplate?.name}</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>适用场合：</strong>{selectedTemplate.occasion}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>使用说明：</strong>{selectedTemplate.usage}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>配色方案：</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedTemplate.colorScheme.map((color, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: color,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {color}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>关闭</Button>
          <Button variant="contained" startIcon={<DownloadIcon />} disabled>
            下载模板
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ImageTemplateReference;
