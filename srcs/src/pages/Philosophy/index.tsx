/**
 * 完整哲学白皮书页面
 *
 * 展示 Ming 的完整哲学体系，按八个栏目（第一节至第八节）组织内容。
 *
 * @module pages/Philosophy
 */
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  useTheme,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getWhitepaperChapters } from '../../content/whitepaperChapters';

const Philosophy: React.FC = () => {
  const theme = useTheme();

  const sections = getWhitepaperChapters(theme);

  return (
    <Box>
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600, letterSpacing: '0.04em', fontSize: { xs: '2rem', md: '3.25rem' } }}
          >
            明命 · Ming
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            color="text.secondary"
            gutterBottom
            sx={{ mt: 2, fontWeight: 400, fontStyle: 'italic' }}
          >
            知命为明，非为窥道，乃为明心。
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={Link} to="/" variant="outlined" sx={{ minWidth: 150 }}>
              返回首页
            </Button>
            <Button
              component="a"
              href="https://github.com/LuckeeDAO/ming"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              sx={{ minWidth: 150 }}
            >
              GitHub 仓库
            </Button>
          </Box>
        </Container>
      </Box>

      <Divider sx={{ my: 0 }} />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        {sections.map((section) => (
          <Card key={section.id} sx={{ mb: { xs: 2, md: 4 }, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: { xs: 2.25, md: 4 } }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: 600, mb: { xs: 2, md: 3 }, fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2rem' } }}
              >
                {section.title}
              </Typography>
              {section.detail}
            </CardContent>
          </Card>
        ))}

        <Card sx={{ mb: { xs: 2, md: 4 }, border: `1px solid ${theme.palette.divider}`, bgcolor: `${theme.palette.secondary.main}05` }}>
          <CardContent sx={{ p: { xs: 2.25, md: 4 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              附：我们的共识宣言
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              您阅读的这份文本，是 Ming 的白皮书摘要——它是我们关于「天地人三才共识」的核心思考。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              我们要这天，再不能以“不可知”为名，隐匿命运的源码；
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              我们要这地，再不是少数先知垄断的海图，而是万人共撰的开源航道；
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              我们要那所谓的“天命”，在人类共识面前，如诸佛般——烟消云散。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, mt: 2 }}>
              明命 · Ming：以共识为笔，重铸每个人自己人生的剧本。
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Philosophy;
