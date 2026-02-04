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
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();

  // 判断是否显示Hero区域（只在路径为 / 时显示）
  const showHero = location.pathname === '/';

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
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600, letterSpacing: '0.02em' }}
          >
            Ming (明命)
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            color="text.secondary"
            gutterBottom
            sx={{ mt: 2, fontWeight: 400 }}
          >
            以“道不可尽知、地为工具、人为主体、时为地之用”为内核的 Web3 仪式平台
          </Typography>
          
          <Box sx={{ mt: 4, mb: 3, maxWidth: '800px', mx: 'auto' }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ 
                fontSize: '1.1rem',
                lineHeight: 1.8,
                fontStyle: 'italic',
                mb: 2
              }}
            >
              知命为明，非为窥道，乃为明心。
            </Typography>
            
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ 
                fontSize: '1rem',
                lineHeight: 1.8,
                textAlign: 'left',
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              那驱动日月星辰的终极法则（道），或许永远超出人类认知的边界。但人类最伟大的创造，是编织了一张名为"地"的知识之网——
              数学、物理、律法、艺术，以及命理之学，都是这张网上的经纬。
              时间（生辰、节气、择时）也是“地”的关键工具维度；社会学、心理学等解释性理论亦可被视作“地”的工具谱系。
              Ming 不回答"命运是什么"，但承载了"地"的智慧中一套极具深度与美感的系统。
              通过可编程的仪式 NFT，将东方命理智慧转化为清晰、友好的数字工具，帮助你在这张地图上画出属于自己的航线。
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 500,
                color: theme.palette.primary.main,
                mb: 1
              }}
            >
              我们不是先知，我们是绘图师与航海者
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: 'italic' }}
            >
              我们绘制地图，不是为了定义星空，而是为了脚下的旅程，多一份参照，多一份诗意，多一份同行的温暖。
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h5"
              sx={{ 
                fontWeight: 500,
                letterSpacing: '0.1em',
                mb: 1
              }}
            >
              明其心，知其地，行其路，续其明。
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                fontWeight: 400,
                letterSpacing: '0.1em'
              }}
            >
              这里没有关于"道"的终极答案，这里有一群清醒而热忱的人，在不可知的星空下，共同绘制动态海图。
            </Typography>
          </Box>
        </Container>
      </Box>
      )}

      {showHero && <Divider sx={{ my: 0 }} />}

      {/* 内容区域（根据路由显示） */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }} key={location.pathname}>
        {/* 根据路由路径显示对应内容 */}
        {location.pathname === '/' ? (
          /* 首页 - 哲学理念 → 平台 → 功能 → 技术背景 */
          <>
            {/* 1) 哲学理念 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                哲学理念
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '900px', mx: 'auto' }}>
                天是现实本身（客体），不可被主体穷尽；道是天之所以然，在终极意义上不可尽知，但可由可观测现象被谨慎逼近。
                人类的逻辑知识构成地：它依赖共识而成立，也因此可讨论、可修正、可优化；其中包含强共识工具（科学）与解释性工具（社会学、心理学、五行命理），也包含时间工具（生辰、节气、择时）。
                人具主体/客体双重性：作为主体运用“地”作出选择并承担结果；作为客体属于“天”，并有其内在秩序（可称个体之道）。
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      天：现实之域
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      天是现实本身（客体）：它可被观察其“象”，但不可被主体穷尽其“体”。我们尊重现实约束，并以观察与记录保持谦逊。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      地：共识之域
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      地是人类的逻辑知识与工具箱：强共识工具（数学/工程/医学）与解释性工具（社会学/心理学/五行命理）皆属其内；并包含时间工具维度（生辰/节气/择时）。它依赖共识而成立，也因此可修正。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      人：实践之域
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      人具双重性：作为主体运用“地”进行判断与行动，也可推动共识工具演化；作为客体属于“天”，并有其内在秩序（个体之道）。平台关注的是“协同”，而非“定命”。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
              <Card sx={{ border: `1px dashed ${theme.palette.divider}` }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    <strong>时（时间）</strong>在这里不是独立一界，而是<strong>地</strong>中的关键工具维度：通过时间坐标与节律（生辰、节气、择时），把实践做成可记录、可复盘、可迭代的过程。
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>价值取向</strong>：我们深信五行学说所强调的“生命系统和谐与生生不息”。因此，Ming（明命）提供以此为优化目标的
                  <strong>“个体天道协同算法”</strong>：数字化传统智慧、生成协同策略、并以记录实践建立反馈闭环。
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  知命为明，非为窥道，乃为明心。
                </Typography>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4 }} />

            {/* 2) 平台介绍 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                平台介绍
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '900px', mx: 'auto' }}>
                Ming（明命）不提供关于“道”的终极答案，而是承载“地”的智慧，将东方命理与五行体系转化为可使用、可记录、可迭代的数字工具。
                我们不是先知，我们是绘图师与航海者。
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      阅读路径
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      从“天/道/地/人/时”的分层开始，理解平台为何强调工具主义、实践与反馈闭环。
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button component={Link} to="/about/philosophy" size="small" variant="contained">
                      去看哲学理念
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      平台介绍
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      了解 Ming 的产品定位、核心闭环（命理/共识/仪式）与使用方式。
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button component={Link} to="/about/intro" size="small" variant="outlined">
                      去看平台介绍
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      仪式资源
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      指南、素材与知识库入口：把“知道”变成“做到”的行动接口。
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button component={Link} to="/connection-ceremony?tab=2" size="small">
                      去看仪式资源
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>

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
                    mb: 4,
                  }}
                >
                  构建“命理－共识－仪式”三元闭环
                </Typography>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip label="命理" color="primary" sx={{ mb: 2, fontSize: '1rem', py: 2.5, px: 3 }} />
                      <Typography variant="body1" color="text.secondary">
                        以四柱八字与五行生克为分析引擎，提供结构化视角来理解个人能量系统与循环状态。
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip label="共识" color="secondary" sx={{ mb: 2, fontSize: '1rem', py: 2.5, px: 3 }} />
                      <Typography variant="body1" color="text.secondary">
                        “地”作为共识工具集，通过集体机制形成可协作、可演化的策略语言与能量场见证。
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip label="仪式" color="primary" variant="outlined" sx={{ mb: 2, fontSize: '1rem', py: 2.5, px: 3 }} />
                      <Typography variant="body1" color="text.secondary">
                        以链上可验证的仪式 NFT 记录实践与承诺，形成个人与集体的可追溯日志。
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4 }} />

            {/* 3) 功能 */}
            {/* 体验形态区域 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                体验形态
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
                用户通过完成对应五行、节气、星宿的链上仪式，铸造专属能量 NFT，同时接入相应共识池，形成个人与集体能量场的共振与循环
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
                      形成个人与集体能量场的共振与循环
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>五行仪式</strong>：根据个人能量缺失，完成对应五行（木、火、土、金、水）的链上仪式，铸造专属能量 NFT
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>节气共鸣</strong>：在特定节气时刻，参与集体共识仪式，接入节气共识池，形成能量共振
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>星宿连接</strong>：通过星宿能量，建立个人与宇宙的连接，完成星宿链上仪式
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8, mt: 2 }}>
                        • <strong>能量 NFT</strong>：每次仪式铸造专属能量 NFT，作为能量场见证，记录个人与集体能量场的连接
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>共识池</strong>：接入相应共识池（五行池、节气池、星宿池），形成个人与集体能量场的共振与循环
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
                        每一次 mint、每一次祈愿、每一次共识的达成，
                        都是对自我命途的一次温和修正与能量加冕。
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4 }} />

            {/* 功能说明区域 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                平台主要功能
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
                提供完整的NFT制作流程，支持命理调理、节日贺卡、新年祝福等多种类型，从内容创作到NFT铸造，形成完整的仪式体验
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
                      🔮 四柱八字分析
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      分析用户能量系统，检测能量循环缺失，识别需要补充的能量类型
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
                      🌿 外物推荐
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      根据能量缺失推荐合适的外物进行连接，提供详细的连接方式和仪式指导
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
                      🎨 NFT铸造
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      支持多种NFT类型铸造：命理调理、节日贺卡、新年祝福等，支持立即铸造或定时铸造
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
                      📊 个人档案
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      管理所有NFT作品，包括命理调理记录、节日贺卡、新年祝福等，查看创作历史和作品集
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* 4) 技术背景 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                技术背景
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '900px', mx: 'auto' }}>
                我们使用现代 Web3 技术栈，将“记录、见证与可验证的仪式”落地为可访问的产品体验。
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      前端
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      React 18 + TypeScript + Material-UI + Vite
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      区块链 & NFT
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ethers.js + ERC-721，链上可验证的仪式见证
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      存储
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      IPFS + 本地存储，确保数据去中心化与可访问性
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : location.pathname === '/experience' ? (
          /* 体验与功能 */
          <>
            {/* 体验形态区域 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                体验形态
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
                用户通过完成对应五行、节气、星宿的链上仪式，铸造专属能量 NFT，同时接入相应共识池，形成个人与集体能量场的共振与循环
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
                      形成个人与集体能量场的共振与循环
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>五行仪式</strong>：根据个人能量缺失，完成对应五行（木、火、土、金、水）的链上仪式，铸造专属能量 NFT
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>节气共鸣</strong>：在特定节气时刻，参与集体共识仪式，接入节气共识池，形成能量共振
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>星宿连接</strong>：通过星宿能量，建立个人与宇宙的连接，完成星宿链上仪式
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8, mt: 2 }}>
                        • <strong>能量 NFT</strong>：每次仪式铸造专属能量 NFT，作为能量场见证，记录个人与集体能量场的连接
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>共识池</strong>：接入相应共识池（五行池、节气池、星宿池），形成个人与集体能量场的共振与循环
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
                        每一次 mint、每一次祈愿、每一次共识的达成，
                        都是对自我命途的一次温和修正与能量加冕。
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4 }} />

            {/* 功能说明区域 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                平台主要功能
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
                提供完整的NFT制作流程，支持命理调理、节日贺卡、新年祝福等多种类型，从内容创作到NFT铸造，形成完整的仪式体验
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
                      🔮 四柱八字分析
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      分析用户能量系统，检测能量循环缺失，识别需要补充的能量类型
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
                      🌿 外物推荐
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      根据能量缺失推荐合适的外物进行连接，提供详细的连接方式和仪式指导
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
                      🎨 NFT铸造
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      支持多种NFT类型铸造：命理调理、节日贺卡、新年祝福等，支持立即铸造或定时铸造
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
                      📊 个人档案
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      管理所有NFT作品，包括命理调理记录、节日贺卡、新年祝福等，查看创作历史和作品集
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
                  使用流程
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤1：连接钱包</strong> - 连接 andao 钱包，确保可以执行链上操作
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤2：选择NFT类型</strong> - 选择要制作的NFT类型：命理调理、节日贺卡、新年祝福等
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤3：创作内容</strong> - 根据选择的类型，完成相应的内容创作（命理分析、贺卡设计、祝福定制等）
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤4：完成仪式</strong> - 按照指导完成相应的仪式流程，记录感受和体验
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    <strong>步骤5：铸造NFT</strong> - 铸造专属NFT，作为仪式见证，接入共识池
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8, mt: 2 }}>
                    <strong>步骤6：查看档案</strong> - 在"我的连接"中查看所有NFT作品和创作记录
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </>
        ) : location.pathname === '/technology' ? (
          /* 技术说明 */
          <>
            {/* 技术架构区域 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                技术架构
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '900px', mx: 'auto' }}>
                Ming 前端基于 Vite + React 18 + TypeScript + Material UI 构建；通过 ethers.js 与自定义钱包接口完成链上交互，
                并结合 IPFS 等去中心化存储方案承载仪式图片与元数据，使“记录与见证”的过程本身具备可验证性与可迁移性。
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
                      Vite + React 18 + TypeScript + Material UI，提供快速、现代的交互体验，并通过组件化封装命理分析、仪式流程与钱包连接。
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
                      使用 ethers.js 对接区块链与 ERC-721 合约，结合 IPFS 与本地缓存承载仪式图片与元数据，确保记录可验证、可访问。
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
                      提供 Web3 钱包连接与链上操作入口，以“平台只准备数据、钱包负责签名与执行”的分层方式保障安全与清晰边界。
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
                重要说明
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: '700px', mx: 'auto' }}>
                Ming 平台提供的是基于传统文化智慧的象征性仪式体验，融合 Web3 技术与集体共识机制。
                我们致力于构建一种人与命运共修的新范式，而非提供精确的命理预测或效果量化验证。
                建议将仪式视为个人成长、文化体验与集体能量共振的一部分。
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
  );
};

export default Home;
