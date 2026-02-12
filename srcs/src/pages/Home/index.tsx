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
            sx={{ fontWeight: 600, letterSpacing: '0.04em' }}
          >
            明命 · Ming
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
              那驱动日月星辰的终极法则——我们称之为「道」——或许永远超出人类认知的边界。
              但人类最伟大的创造，是编织了一张名为「地」的知识之网：数学、物理、律法、艺术，以及流传千年的命理之学，都是这张网上的经纬；
              时间（生辰、节气、择时）也是「地」的关键工具维度。
              Ming 不回答「命运是什么」，而是将「地」的智慧转化为开源、可编程的数字工具，
              帮助你在这张地图上，画出属于自己的航线。
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
          /* 首页 - 哲学基石、三元闭环、体验形态 */
          <>
            {/* 1) 卷一 · 我们是谁 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                卷一 · 我们是谁
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '900px', mx: 'auto' }}>
                我们不是先知，我们是绘图师与航海者。
                那驱动日月星辰的终极法则——我们称之为「道」——或许永远超出人类认知的边界；
                但人类编织了一张名为「地」的知识之网，而 Ming 所做的，是将这张网中的一部分智慧转译为开源、可编程的数字工具，
                帮助你在地图上画出属于自己的航线。
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
                      不是先知，是绘图师与航海者
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      我们不声称握有关于「天命」的终极答案。
                      我们绘制的是一张可以被共同修订的海图：当你需要辨认航向时，它就在那里，为脚下的旅程多提供一份参照、一份诗意和一份同行的温暖。
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
                      道不可尽知，地为工具
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      数学、物理、律法、艺术，以及流传千年的命理之学，都是「地」上的经纬。
                      它们依赖共识而成立，也因此可以被讨论、被修正、被重新组合——Ming 将其中一套命理与仪式系统转译成工具箱，让你可以自由取用。
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
                      人为主体
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      命是否真实存在、命理是否只是一种文化叙事，这个答案我们留给你自己。
                      无论你相信的是隐藏的信号，还是自我对话的镜厅，唯一恰当的验证标准都是：它是否让你在实践中获得了更多清晰与温柔的勇气。
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
                      时为地之用
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      时间在这里，不是带着神秘色彩的独立界域，而是「地」中可度量、可记录、可回溯的坐标系。
                      通过生辰、节气、择时，我们把实践变成可复盘、可迭代、可见证的过程，让每一次仪式都成为时间轴上的一枚清醒锚点。
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* 2) 三元闭环 · 命理·共识·仪式（总览） */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                三元闭环 · 命理 · 共识 · 仪式
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '900px', mx: 'auto' }}>
                我们不是先知，我们是镜头与仪式的维护者。
                命理是一套翻译器，共识是维护这些镜头的自治网络，仪式则是把意图锚定为链上契约的动作——三者共同构成 Ming 的基础闭环。
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
                      命理 · 共识 · 仪式 如何闭环
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>命理 · 镜头</strong>：以四柱八字与五行生克为建模语言，为你提供理解个人状态的结构化视角。
                        这不是诊断，是视角；不是预言，是翻译。
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>共识 · 镜头维护者</strong>：每个流派都是一套独特的观察镜头，没有一种语言能还原完整波形。
                        DAO 不是评选「冠军流派」，而是镜头维护者的自治组织，让镜头持续开源、可审计、可迭代。
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>仪式 · 契约</strong>：仪式是将意图锚定成链上契约的动作。
                        每一次铸造，都是一份可编程的自我承诺，链上记录履约次数，不是为了监视你，而是让未来的你，看得见过去的自己走了多远。
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                        • <strong>镜头切换自由</strong>：你的个人主页可以一键切换镜头。
                        昨天你信子平，今天你试星宿——这里没有叛教，只有视角迁徙。
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
                        「当一个人在立春的晨光里，为自己铸造一枚迎春仪式的 NFT——那一刻，他不是在向不可知的天乞求恩典，
                        他是在对自己说：这个春天，我选择认真度过。」<br />
                        契约的效力，从不在于墨水是否神圣，而在于签名者是否愿意在未来的日子里，记得自己曾许下过什么。
                      </Typography>
                      <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                          component={Link}
                          to="/simple-mint"
                          variant="contained"
                          size="large"
                          sx={{ mt: 2 }}
                        >
                          开始铸造NFT
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 4 }} />

            {/* 3) 导航 · 去往更深的章节 */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                接下来，你可以去往哪里？
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '900px', mx: 'auto' }}>
                这一页只是海图的封面。
                如果你想深入阅读我们的哲学基石、三元闭环与体验形态，或了解技术与效用边界，可以通过左侧「首页」下的二级菜单继续探索。
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
                    mb: 4,
                  }}
                >
                  三条推荐路径
                </Typography>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip label="哲学基石 & 三元闭环" color="primary" sx={{ mb: 2, fontSize: '0.95rem', py: 2, px: 2.5 }} />
                      <Typography variant="body1" color="text.secondary">
                        想了解「天·地·人·时」与「命理·共识·仪式」如何构成我们的世界观，
                        可以前往「体验与功能」页面，阅读更加完整的哲学白皮书式阐述与体验形态说明。
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip label="仪式路径 & 工具箱" color="secondary" sx={{ mb: 2, fontSize: '0.95rem', py: 2, px: 2.5 }} />
                      <Typography variant="body1" color="text.secondary">
                        想直接看到「外物、节气、择时、履历、共识池」如何变成可操作的路径，
                        可以在「体验与功能」中查看一次完整仪式的示例流程与工具总览。
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip label="技术与效用边界" color="primary" variant="outlined" sx={{ mb: 2, fontSize: '0.95rem', py: 2, px: 2.5 }} />
                      <Typography variant="body1" color="text.secondary">
                        如果你关心数据如何被处理、算法如何开源、效用如何归属，
                        可以前往「技术说明」页面，阅读关于技术栈、隐私与效用归属的详细说明。
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      履历 · 可缩放的地图
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      你每一次仪式、每一次意图锚定、每一次流派切换，都会成为能量履历上的一笔。
                      在不同镜头下，你会看到自己的状态波动、曲线叙事与决策痕迹：看不见的命运，从此拥有了一张可缩放的地图——
                      你不是在看命，你是在看自己。
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button component={Link} to="/about/philosophy" size="small" variant="outlined">
                      查看理念
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      共识池 · 集体注意力计数器
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      共识池不是玄学容器，它是集体仪式的链上聚合页。
                      当你参与立春集体仪式，屏幕上的数字会跳动 —— 那是此刻与您同时完成铸造的人数。
                      共识池不存储「能量」，它存储此时此刻，有人和你一样，选择了认真对待自己。
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button component={Link} to="/about/intro" size="small" variant="outlined">
                      查看共识设计
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      技术 · 只是载体，不是信仰
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      我们使用现代 Web3 技术栈，只为一件事：让「意图锚定、集体见证、可回溯记录」成为可能。
                      技术在这里不是「神力」的来源，而是「记忆」的载体 —— 你的八字永不离线，你的选择链上存证，你的仪式被时间温柔封存。
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button component={Link} to="/learning" size="small" variant="outlined">
                      深入技术说明
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
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
                    <strong>步骤1：连接钱包</strong> —— 连接 andao 钱包，确认你愿意为这次自我声明承担链上签名与 Gas 成本。
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
                      使用 ethers.js 对接区块链与 ERC-721 合约，负责仪式 NFT 的铸造与查询。
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
  );
};

export default Home;
