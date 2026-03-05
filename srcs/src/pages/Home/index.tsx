/**
 * 首页组件
 *
 * 当前首页聚焦白皮书总览与功能导览；关于平台与技术说明已拆分到 /about/*。
 * 保留 /experience 与 /technology 仅用于历史兼容路由。
 * 
 * @module pages/Home
 */
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Divider,
  useTheme,
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { getWhitepaperChapters } from '../../content/whitepaperChapters';
import CapabilityStatusLegend from '../../components/common/CapabilityStatusLegend';

const Home: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const [activeChapter, setActiveChapter] = React.useState<string>('intro');

  // 避免 TypeScript 将部分从 UI 库导入的组件误判为未使用
  // （这些组件在条件分支与 JSX 中均有实际使用）
  void [CardActions, Button, Link];

  const chapters = getWhitepaperChapters(theme);

  // 判断是否显示Hero区域（只在路径为 / 时显示）
  const showHero = location.pathname === '/';
  const activeChapterIndex = chapters.findIndex((chapter) => chapter.id === activeChapter);
  const prevChapter = activeChapterIndex > 0 ? chapters[activeChapterIndex - 1] : null;
  const nextChapter =
    activeChapterIndex >= 0 && activeChapterIndex < chapters.length - 1
      ? chapters[activeChapterIndex + 1]
      : null;

  const handleChapterNavigate = (chapterId: string) => {
    setActiveChapter(chapterId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNavTitle = (title: string) => {
    const parts = title.split('·');
    return parts.length > 1 ? parts.slice(1).join('·').trim() : title;
  };

  return (
    <Box>
      {/* Hero 区域 - 只在路径为 / 时显示 */}
      {showHero && (
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
        }}
      >
        <Container maxWidth="lg">
          {/* 主标题 */}
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600, letterSpacing: '0.04em' }}
          >
            明命 · Ming
          </Typography>
          
          {/* 副标题 */}
          <Typography
            variant="h5"
            component="h2"
            color="text.secondary"
            gutterBottom
            sx={{ mt: 2, fontWeight: 400 }}
          >
            基于天地人三才框架的Web3 仪式平台
          </Typography>
        </Container>
      </Box>
      )}

      {/* 内容区域（根据路由显示） */}
      <Box
        sx={{
          background: showHero 
            ? `linear-gradient(180deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}06 30%, ${theme.palette.primary.main}03 60%, transparent 100%)`
            : 'transparent',
          pt: showHero ? 0 : 0,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, pt: showHero ? { xs: 2, md: 3 } : { xs: 4, md: 6 } }} key={location.pathname}>
          {/* 首页：1）栏目内容 2）栏目选择 */}
          <>
              {/* 第一部分：当前选中章节的详细内容（显示在上方） */}
              <Box sx={{ mb: 6, mt: { xs: 1, md: 2 } }}>
                <Card
                  key={`chapter-detail-${activeChapter}`}
                  sx={{
                    border: 'none',
                    boxShadow: 'none',
                    background: 'transparent',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 }, pt: { xs: 1, md: 2 }, px: { xs: 2, md: 3 } }}>
                    {(() => {
                      const currentChapter = chapters.find((c) => c.id === activeChapter);
                      return currentChapter?.detail || (
                        <Typography variant="body1" color="text.secondary">
                          正在加载当前节内容...
                        </Typography>
                      );
                    })()}
                    <Box
                      sx={{
                        mt: 3,
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        justifyContent: { xs: 'flex-start', sm: 'space-between' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        flexWrap: 'nowrap',
                      }}
                    >
                      {prevChapter ? (
                        <Tooltip title={`上一节：${getNavTitle(prevChapter.title)}`} arrow>
                          <Button
                            variant="outlined"
                            onClick={() => handleChapterNavigate(prevChapter.id)}
                            sx={{
                              textTransform: 'none',
                              maxWidth: { xs: '100%', sm: '48%' },
                              alignSelf: { xs: 'stretch', sm: 'flex-start' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            上一节：{getNavTitle(prevChapter.title)}
                          </Button>
                        </Tooltip>
                      ) : null}
                      {nextChapter && (
                        <Tooltip title={`下一节：${getNavTitle(nextChapter.title)}`} arrow>
                          <Button
                            variant="contained"
                            onClick={() => handleChapterNavigate(nextChapter.id)}
                            sx={{
                              textTransform: 'none',
                              maxWidth: { xs: '100%', sm: '48%' },
                              alignSelf: { xs: 'stretch', sm: 'flex-end' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            下一节：{getNavTitle(nextChapter.title)}
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

            {/* 第二部分：八个顺序节（第一节到第八节） */}
            <Box>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: '900px', mx: 'auto', lineHeight: 1.9 }}
                >
                  直接访问 <Link to="/philosophy" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>完整白皮书页面</Link> 查看全部内容。
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                  <Button component={Link} to="/about/intro" size="small" variant="outlined">平台介绍</Button>
                  <Button component={Link} to="/about/technology" size="small" variant="outlined">技术说明</Button>
                  <Button component={Link} to="/about/philosophy" size="small" variant="outlined">哲学理念</Button>
                  <Button component={Link} to="/philosophy" size="small" variant="contained">完整白皮书</Button>
                </Box>
              </Box>

              <CapabilityStatusLegend maxWidth="1000px" compact />

              <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
                {chapters.map((chapter, index) => {
                  const selected = activeChapter === chapter.id;
                  const chapterNumber = index + 1;
                  return (
                    <Card
                      key={chapter.id}
                      onClick={() => setActiveChapter(chapter.id)}
                      sx={{
                        mb: { xs: 1.5, sm: 2 },
                        border: selected
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        backgroundColor: selected ? `${theme.palette.primary.main}08` : 'background.paper',
                        '&:hover': {
                          transform: { xs: 'none', sm: 'translateX(4px)' },
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.25, sm: 2 } }}>
                          {/* 序号标识 */}
                          <Box
                            sx={{
                              minWidth: { xs: 36, sm: 48 },
                              height: { xs: 36, sm: 48 },
                              borderRadius: '50%',
                              bgcolor: selected ? theme.palette.primary.main : theme.palette.grey[200],
                              color: selected ? 'white' : theme.palette.text.secondary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: { xs: '1rem', sm: '1.2rem' },
                              flexShrink: 0,
                            }}
                          >
                            {chapterNumber}
                          </Box>
                          {/* 内容区域 */}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75, flexWrap: 'wrap' }}>
                              <Chip
                                label={chapter.tag}
                                size="small"
                                color={selected ? 'primary' : 'default'}
                              />
                              {selected && (
                                <Chip
                                  label="当前阅读"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{ fontWeight: 600, mb: 0.75, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                            >
                              {chapter.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.6,
                                display: '-webkit-box',
                                WebkitLineClamp: { xs: 2, sm: 3 },
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {chapter.summary}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>

            {/* 附录 · 白皮书摘要 */}
            <Box sx={{ mt: 6, mb: 4 }}>
              <Card sx={{ border: `1px solid ${theme.palette.divider}`, bgcolor: `${theme.palette.secondary.main}05` }}>
                <CardContent
                  sx={{
                    p: { xs: 3, md: 4 },
                    color: theme.palette.warning.main,
                    fontFamily: `"Ma Shan Zheng","LXGW WenKai","STKaiti","KaiTi","cursive"`,
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    附：我们的共识宣言
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
                    您阅读的这份文本，是 Ming 的白皮书摘要——它是我们关于「天地人三才共识」的核心思考。
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
                    我们要这天，再不能以“不可知”为名，隐匿命运的源码；
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
                    我们要这地，再不是少数先知垄断的海图，而是万人共撰的开源航道；
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.9 }}>
                    我们要那所谓的“天命”，在人类共识面前，如诸佛般——烟消云散。
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.9, mt: 2 }}>
                    明命 · Ming：以共识为笔，重铸每个人自己人生的剧本。
                  </Typography>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
                    <Button
                      component={Link}
                      to="/philosophy"
                      variant="contained"
                      size="large"
                      sx={{ minWidth: 180 }}
                    >
                      阅读完整白皮书
                    </Button>
                    <Button
                      component="a"
                      href="https://github.com/LuckeeDAO/ming"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="large"
                      sx={{ minWidth: 180 }}
                    >
                      查看 GitHub 代码
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
