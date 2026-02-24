/**
 * 首页组件
 * 
 * 首页的三个菜单项（关于平台、体验与功能、技术说明）直接作为全局左侧导航栏中"首页"的二级菜单。
 * 首页组件根据路由路径显示对应内容，不再使用内部状态管理菜单切换。
 * 
 * 路由路径：
 * - `/` → 首页（显示Hero区域，公共部分）
 * - `/experience` → 体验与功能（不显示Hero，只显示体验形态和功能说明）
 * - `/technology` → 技术说明（不显示Hero，只显示技术架构和重要说明）
 * 
 * 设计原则：
 * - 统一导航：所有页面使用同一个全局侧边栏，导航体验一致
 * - 极简主义：首页保持简洁，核心信息突出
 * - 分类清晰：内容按主题分类，使用全局侧边栏二级菜单导航
 * - 易于导航：用户可以快速跳转到感兴趣的内容
 * - 路由驱动：菜单切换通过路由实现，支持浏览器前进/后退
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
  Grid,
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
          {/* 根据路由路径显示对应内容 */}
          {location.pathname === '/' ? (
            /* 首页：1）栏目内容 2）栏目选择 */
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
        ) : location.pathname === '/experience' ? (
          /* 体验与功能（深入版：体验形态 · 你的工具箱） */
          <>
            {/* 体验形态区域 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                体验形态 · 你的工具箱
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
                在 Ming，每一次仪式既是一段代码执行，也是一次对自己的温柔声明。
                通过外物、节气、择时、履历与共识池，你可以把看不见的命运，拆解成可操作、可见证的一系列小步骤。
              </Typography>
            </Box>

            <Card
              sx={{
                mb: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      外物 · 节气 · 择时 如何一起工作
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>外物 · 符号锚点</strong>：根据你的镜头与当下状态，系统推荐与之共鸣的自然符号（如昆仑的土、太湖的水）。
                        你选择其中一个，把它视为未来一段时间注意力的锚点，并铸造对应的仪式 NFT。
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>节气 · 共识节律</strong>：立春、夏至、秋分、冬至等关键节点，你可以参与集体仪式，一起完成相同动作。
                        屏幕上的数字跳动，记录此刻与你同频的人数，这是真实可见的「集体注意力计数器」。
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>择时 · 个人节律</strong>：系统根据你选定的镜头与当下状态，给出一段时间窗口作为「注意力锚点候选」。
                        你完全可以选择另一个时间、另一种算法 —— 择时的终极目的，是让你主动决定「何时认真」。
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8, mt: 2 }}>
                        • <strong>能量 NFT 与共识池</strong>：每一次仪式都会铸造专属 NFT，并自动汇入对应的共识池（如五行池、节气池）。
                        这不是玄学容器，而是把「此刻有人和你一样选择认真对待自己」记录在链上的实时计数器。
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 4,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: 'italic' }}>
                        「每一次 mint、每一次祈愿、每一次共识的达成，都不是向不可知之天索要恩典，
                        而是向自己确认：我愿为这件事投入时间与注意力。」<br />
                        你可以将这视为一枚刻在时间轴上的小小锚点，而非一次性「改变命运」的按钮。
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4 }} />

            {/* 功能说明区域（从“能做什么”到“如何参与”） */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                你可以在这里做什么
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
                从命理视角理解当下状态，到为某段时间写下一份「认真对待自己」的契约，再到在集体节律中找到同行者——
                Ming 提供的是一整套从理解、自我声明到被见证的路径。
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      🔮 命理视角
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      以四柱八字与五行生克为建模语言，为你提供理解个人状态的结构化视角。
                      它不是诊断书，而是一面镜子——帮助你整理关于「我现在正处在怎样的节律与能量分布」的自我叙事。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                      🌿 外物与仪式设计
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      根据分析结果与你偏好的镜头，系统为你推荐适合的外物和对应的仪式动作。
                      你可以将其视为一套「注意力剧本」：在某个时间、以某个符号为锚，和自己进行一次短暂而郑重的对话。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      🎨 仪式 NFT 铸造
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      将你的意图、外物选择与文案、图像一起固化为一枚 NFT。
                      它不是「补了五行」的魔法道具，而是一份可验证、可回溯的自我承诺——你也可以选择在特定节气或自定时间点触发铸造。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                      📊 能量履历与共识池
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      你的每一次仪式、每一次镜头切换、每一次履约记录，都会沉淀为一条可缩放的时间线。
                      你可以在「我的连接」中回看这条线在不同镜头下的叙事差异，也可以在共识池页面里，看见那些与你一同「认真对待自己」的陌生人。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      🎭 封局释放与评价归档
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      当一段契约完成后，你可以发起封局释放：移除隐私字段，保留公开见证。
                      同时填写履约完成度、自我共振度、公开叙事摘要与下一阶段意图，并写入 NFT 属性，形成可回看的“结项说明”。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 使用流程说明 */}
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                  一次完整仪式的大致路径
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤1：连接钱包</strong> —— 连接 andao 钱包，确认你愿意为这次自我声明承担链上签名与手续费成本。
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤2：选择仪式类型</strong> —— 是一次命理调理、一封节日贺卡，还是一段特定时期的自我练习契约？
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤3：创作内容</strong> —— 写下你的意图，选择或上传一张与你当下状态共鸣的图像，确认对应外物与时间窗口。
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤4：完成仪式动作</strong> —— 按照提示，在现实世界完成一段简单却郑重的动作（点一支香、写一段话、进行一次短暂静坐等）。
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤5：铸造 NFT</strong> —— 在链上铸造这枚仪式 NFT，将这次声明交给代码与时间见证，并自动接入对应共识池。
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8, mt: 2 }}>
                    <strong>步骤6：回看与迭代</strong> —— 在「我的连接」与能量履历中回看这段时间的状态波动，必要时调整镜头或重新书写契约。
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤7：封局释放与结项</strong> —— 当契约完成后，执行封局释放并填写评价参数，将这段实践归档为可验证、可回看的完成篇章。
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </>
        ) : location.pathname === '/technology' ? (
          /* 技术说明（技术 · 只是载体，不是信仰） */
          <>
            {/* 技术架构区域 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                技术 · 只是载体，不是信仰
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '900px', mx: 'auto' }}>
                我们使用现代 Web3 技术栈，只为一件事：让「意图锚定、集体见证、可回溯记录」成为可能。
                技术在这里不是「神力」的来源，而是「记忆」的载体 —— 你的八字可以离线保存，你的仪式以哈希与区块高度被温柔封存。
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
                      Vite + React 18 + TypeScript + Material UI，提供快速、现代的交互体验。
                      我们将命理分析、仪式流程、共识池与钱包连接封装为一组可复用组件，让「写一份契约」「查看一段履历」和其他网页操作一样自然。
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
                      区块链与 NFT 采用多链兼容接入架构，通过钱包消息协议（`MING_WALLET_*`）统一调用；当前已接入 Solana Program（Anchor），并预留其他链的接入能力。
                      图片与元数据托管在 IPFS 与本地存储中：你的八字可以保存在本地设备，你的选择则以链上事件形式可验证地记录下来。
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
                      提供 Web3 钱包连接与链上操作入口。
                      平台只准备数据与建议，所有关键动作都由你在钱包中签名完成——「谁在何时为哪些意图签名」，始终由你自己掌控。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

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
                使用边界与重要说明
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: '700px', mx: 'auto' }}>
                Ming 提供的是基于传统文化智慧的象征性仪式体验，是一种帮助你重新组织自我叙事、重构时间感与承诺感的工具。
                所有算法、分析与仪式均属于文化建模与心理仪式工具，不构成命运预测、医疗建议或投资建议。
                最终的判断权与解释权属于你自己——你觉得某套镜头「准」，它就在你的生命叙事中成立；不觉得，就换一个重新试验。
              </Typography>
            </Box>
          </>
        ) : (
          /* 默认：关于平台 */
          <>
            {/* 平台内核区域 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                平台内核
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
                基于四柱八字五行生克理论，以 NFT 为能量见证载体，融合链上可验证仪式与集体意识共识机制。
                Ming 承载"地"的智慧——人类共同编织的知识之网——构建"命理－共识－仪式"三元闭环。
                我们不是先知，我们是绘图师与航海者。
              </Typography>
            </Box>

            <Card
              sx={{
                mb: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    textAlign: 'center',
                    mb: 4
                  }}
                >
                  构建"命理－共识－仪式"三元闭环
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        label="命理" 
                        color="primary" 
                        sx={{ mb: 2, fontSize: '1rem', py: 2.5, px: 3 }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        基于四柱八字五行生克理论，分析个人能量系统与循环状态。
                        它作为“地”的解释性工具之一，尝试描述个体与自然/社会节律的互动；其中时间维度（生辰/节气/择时）同样属于工具体系。
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        label="共识" 
                        color="secondary" 
                        sx={{ mb: 2, fontSize: '1rem', py: 2.5, px: 3 }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        "地"是人类共同编织的知识之网，是描述系统与行动工具箱。
                        共识机制形成个人与集体能量场的共振与循环，体现人类共同构建的智慧。
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        label="仪式" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mb: 2, fontSize: '1rem', py: 2.5, px: 3 }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        可编程的仪式 NFT 与链上契约，把策略落到行动与记录；“择时”作为时间工具常被用于让行动更可执行、更可复盘。
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4 }} />

            {/* 核心主张区域 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                核心主张
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        mb: 2
                      }}
                    >
                      知命为明，非为窥道，乃为明心
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      我们不声称揭示"道"的奥秘，而是承载"地"的智慧。通过人道的力量与共识的能量，
                      在这张知识地图上达成生命的疏通与升华。我们是绘图师与航海者。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.secondary.main,
                        mb: 2
                      }}
                    >
                      共识即能量，仪式即通道
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      人类共识是我们可以共同构建、共同引导的能量，是社会规律的重要组成部分。
                      通过链上仪式，将个人命理调理融入群体共同参与的仪式场中，
                      形成个人与自然规律、社会规律的共振与循环。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        mb: 2
                      }}
                    >
                      以人合天，以链载愿
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      通过 Web3 技术与区块链共识，将传统命理智慧与现代技术结合，
                      以可编程的仪式 NFT 承载祈愿，实现个人与自然规律、社会规律的和谐共续。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
