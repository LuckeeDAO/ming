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
  const [activeChapter, setActiveChapter] = React.useState<string>('volume1');

  // 避免 TypeScript 将部分从 UI 库导入的组件误判为未使用
  // （这些组件在条件分支与 JSX 中均有实际使用）
  void [CardActions, Button, Link];

  // 哲学白皮书七个章节（摘要+详细内容）
  const chapters = [
    {
      id: 'volume1',
      title: '卷一 · 我们是谁',
      tag: '我们是谁',
      summary: '不是先知，是绘图师与航海者——我们不替你定义天命，只为你提供一张可共同修订的海图。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            卷一 · 我们是谁
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            明命 · Ming 知命为明，非为窥道，乃为明心。我们不自居为先知，而更愿意称自己为绘图师与航海者。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            那驱动日月星辰的终极法则——我们称之为「道」——或许永远超出人类认知的边界。但人类最伟大的创造，是编织了一张名为
            「地」的知识之网：数学、物理、律法、艺术，以及流传千年的命理之学，都是这张网上的经纬；时间——生辰、节气、择时——也是
            「地」的关键工具维度。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            Ming 不回答「命运是什么」。Ming 将「地」的智慧转化为开源、可编程的数字工具，帮助你在这张地图上画出属于自己的航线。
            我们绘制地图，不是为了定义星空，而是为了让脚下的旅程——多一份参照，多一份诗意，多一份同行的温暖。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume2',
      title: '卷二 · 哲学基石 · 天·命·地·人·时',
      tag: '哲学基石',
      summary: '以「天·命·地·人·时」为骨架，为 Ming 构建一套自洽的世界观与实践框架。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            卷二 · 哲学基石 · 天·命·地·人·时
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            天是现实本身，是客体。它可被观察其「象」，但不可被主体穷尽其「体」。我们尊重现实的约束，并以观察与记录保持谦逊。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们相信命真实存在，如同宇宙微波背景辐射——我们无法直接聆听它，它太微弱、太古老，超出一切仪器的分辨率；但我们相信它在那
            里。而我们可以用不同的语言去转译它：四柱、星宿、紫微、五行……每一种命理流派，都是一套人类发明的建模语言。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            地是人类逻辑知识与工具箱的总和，包含强共识工具（数学、工程、医学）与解释性工具（社会学、心理学、五行命理）；时间（生辰、
            节气、择时）亦是地中关键的工具维度。人具双重性：既是运用「地」进行判断与行动的主体，亦是属于「天」的客体，拥有各自的内在
            秩序。时不是独立的一界，而是「地」中可度量、可记录、可回溯的工具坐标。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume3',
      title: '卷三 · 三元闭环 · 命理·共识·仪式',
      tag: '三元闭环',
      summary: '命理是镜头，共识是镜头维护者网络，仪式是意图被锚定为链上契约的方式。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            卷三 · 三元闭环 · 命理·共识·仪式
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            命理 · 镜头：以你选择的命理流派为建模语言——四柱、星宿、紫微、五行……为你提供理解个人状态的结构化视角。
            这不是诊断，这是视角；不是预言，是翻译。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            共识 · 镜头维护者：每个流派都是一套独特的观察镜头。DAO 是镜头维护者的自治组织，他们负责让这套镜头持续开源、可审计、
            可迭代，同时通过版本化约束，保证你始终拥有选择不同版本与不同镜头的权利。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            仪式 · 契约：仪式是将意图锚定成链上契约的动作。每一次铸造，都是一份可编程的自我承诺；链上记录每一次履约，不是为了监视你，
            而是为了让未来的你，看得见过去的自己走了多远。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume4',
      title: '卷四 · 体验形态 · 你的工具箱',
      tag: '体验形态',
      summary: '外物、节气、择时、履历、共识池，共同构成你与自己对话的一整套工具箱。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            卷四 · 体验形态 · 你的工具箱
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            外物 · 符号锚点：根据你选择的镜头，系统会推荐与之共鸣的自然符号——昆仑的土、太湖的水、长白山的木、罗浮山的火、
            华山的金……这不是「借能量」，而是选择一个符号，作为你接下来一段时间注意力投向的锚点，并通过仪式 NFT 记录这份选择。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            节气 · 共识节律：立春、夏至、秋分、冬至……终有一天，会有成千上万人在同一时刻完成同一套仪式动作。
            即便在创世初期，共识池还很稀疏，你点亮的那一个光点也永远不是孤岛。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            择时 · 个人节律、履历 · 可缩放的地图、共识池 · 集体注意力计数器，则共同构成你与自己、与他人、与时间对话的坐标系和可视化界面。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume5',
      title: '卷五 · 技术 · 只是载体，不是信仰',
      tag: '技术与隐私',
      summary: '技术栈只负责「记录与见证」，不负责给出命运答案——你的隐私由你自己保管。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            卷五 · 技术 · 只是载体，不是信仰
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们使用现代 Web3 技术栈，只为一件事：让「意图锚定、集体见证、可回溯记录」成为可能。
            前端基于 React 18 + TypeScript + Material-UI + Vite，区块链与 NFT 部分基于 ethers.js + ERC-721，存储部分结合 IPFS 与本地存储。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            你的八字在本地完成分析，仅存储于你自己的设备。你可以选择将其备份至去中心化存储网络，此时数据以加密形式传输与存储，
            Ming 不会主动收集或存储你的原始生辰数据；你通过钱包私钥控制访问权限——你的隐私，由你自己保管。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume6',
      title: '卷六 · 效用的归属',
      tag: '效用的归属',
      summary: '命理的效用不在算法或投票里，而在你日复一日使用它理解自己的过程中。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            卷六 · 效用的归属
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            没有人能替你确认，某个流派的解读是否「对」。因为答案不在算法里，不在社群投票里——在你日复一日使用它理解自己的过程里。
            你觉得准，它就是对你而言准的；这不是客观真理，是主观共振。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            你觉得不准，换一个流派再试。这里没有「伪命理」的审判，只有「不适合我」的视角迁徙。Ming 从不替你做决定，
            我们只保证：你随时拥有更换视角的权利。本平台所有算法、分析、仪式均为文化建模与心理仪式工具，不构成命运预测、
            医疗建议或投资建议。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume7',
      title: '卷七 · 明其心，知其地，行其路，续其明',
      tag: '起点与宣言',
      summary: '当你在立春晨光里说出「这个春天，我选择认真度过」时，一切已经不同。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            卷七 · 明其心，知其地，行其路，续其明
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            当一个人在立春的晨光里，为自己铸造一枚迎春仪式的 NFT——那一刻，他不是在向不可知的天乞求恩典。
            他是在对自己说：「这个春天，我选择认真度过。」这一声低语，被代码接住，被哈希见证，被时间封存。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            所有地图、镜头、契约，都只是渡河的筏子。当你开始认真对待自己——用什么工具、信什么流派、是否兑现契约，都已不是最初的
            问题。重要的是：那个在立春晨光里说「这个春天我选择认真度过」的人，已经不一样了。
          </Typography>
        </>
      ),
    },
  ];

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
          /* 首页：1）平台简介 2）七个章节目录 3）选中章节详情 */
          <>
            {/* 第一部分：平台简介（独立于章节） */}
            <Box sx={{ mb: 6 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  平台简介 · 明命 · Ming
                </Typography>
              </Box>
              <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  paragraph
                  sx={{ lineHeight: 1.9 }}
                >
                  Ming 是一个以「道不可尽知、地为工具、人为主体、时为地之用」为内核的 Web3 仪式平台。
                  我们不提供关于「天命」的终极答案，而是将人类长期积累的「地」之智慧——包括命理在内的诸多工具——转译为开源、可编程的数字组件，
                  帮助你在现实约束之内，重新组织自我叙事与时间感。
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  paragraph
                  sx={{ lineHeight: 1.9 }}
                >
                  在这里，每一次仪式既是一段链上代码的执行，也是一次对自己的温柔声明：你可以选择外物作为符号锚点，以节气与择时作为时间坐标，
                  通过可编程 NFT 把这些意图记录在链上。共识池负责汇聚这些契约，让孤独的自我承诺，被千万个陌生的同频者轻轻见证。
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* 第二部分：七个章节目录（方框摘要） */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  哲学白皮书 · 七个章节目录
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 2, maxWidth: '900px', mx: 'auto', lineHeight: 1.9 }}
                >
                  下方七个方框对应完整白皮书的七个章节。
                  点击任意一个方框，只会在本页下方切换详细内容，不会跳转页面，你始终可以看见自己处在第几个章节。
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {chapters.map((chapter) => {
                  const selected = activeChapter === chapter.id;
                  return (
                    <Grid item xs={12} sm={6} md={3} key={chapter.id}>
                      <Card
                        onClick={() => setActiveChapter(chapter.id)}
                        sx={{
                          height: '100%',
                          border: selected
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${theme.palette.divider}`,
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                          backgroundColor: selected ? `${theme.palette.primary.main}08` : 'background.paper',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[4],
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Chip
                            label={chapter.tag}
                            size="small"
                            color={selected ? 'primary' : 'default'}
                            sx={{ mb: 1.5 }}
                          />
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            sx={{ fontWeight: 600, fontSize: '0.98rem' }}
                          >
                            {chapter.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ lineHeight: 1.7, fontSize: '0.86rem' }}
                          >
                            {chapter.summary}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            {/* 第三部分：当前选中章节的详细内容 */}
            <Box sx={{ mt: 4 }}>
              <Card
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  {chapters.find((c) => c.id === activeChapter)?.detail}
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
