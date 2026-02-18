/**
 * 完整哲学白皮书页面
 * 
 * 展示 Ming 的完整哲学体系，包含所有七卷的详细内容
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
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';

const Philosophy: React.FC = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero 区域 */}
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
            sx={{ mt: 2, fontWeight: 400, fontStyle: 'italic' }}
          >
            知命为明，非为窥道，乃为明心。
          </Typography>
          
          <Box sx={{ mt: 4, mb: 3 }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ 
                fontSize: '1.1rem',
                lineHeight: 1.8,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              您正在阅读的是 Ming 的哲学完整版——它是我们关于「天地人三才共识」的全部思考。
            </Typography>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              sx={{ minWidth: 150 }}
            >
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

      {/* 完整白皮书内容 */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* 卷一 · 我们是谁 */}
        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              卷一 · 我们是谁
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              不是先知，是绘图师与航海者。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              那驱动日月星辰的终极法则——我们称之为「道」——或许永远超出人类认知的边界。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              但人类最伟大的创造，是编织了一张名为「地」的知识之网：数学、物理、律法、艺术，以及流传千年的命理之学，都是这张网上的经纬。时间——生辰、节气、择时——也是「地」的关键工具维度。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              Ming 不回答「命运是什么」。
              Ming 将「地」的智慧转化为开源、可编程的数字工具，帮助你在这张地图上画出属于自己的航线。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              我们绘制地图，不是为了定义星空，而是为了让脚下的旅程——
              多一份参照，多一份诗意，多一份同行的温暖。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              这里没有关于「道」的终极答案。
              这里有一群清醒而热忱的人，在不可知的星空下，共同绘制动态海图。
            </Typography>
          </CardContent>
        </Card>

        {/* 卷二 · 哲学基石 */}
        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              卷二 · 哲学基石
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                天 · 现实之域
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                天是现实本身，是客体。它可被观察其「象」，但不可被主体穷尽其「体」。我们尊重现实的约束，并以观察与记录保持谦逊。
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                命 · 隐藏的信号
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                我们相信命真实存在，如同宇宙微波背景辐射——
                我们无法直接聆听它，它太微弱、太古老，超出一切仪器的分辨率；但我们相信它在那里。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                而我们可用不同的语言去转译它。四柱、星宿、紫微、五行……每一种命理流派，都是一套人类发明的建模语言。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, fontStyle: 'italic', pl: 2, borderLeft: `3px solid ${theme.palette.primary.main}` }}>
                <strong>这些语言是否在言说同一个「命」？这个问题，Ming 留给你自己回答。</strong>
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                你可以相信是——相信有一个隐藏的信号等待被翻译；也可以相信否——相信命理是纯粹的文化叙事、自我对话的镜厅。两种立场都不影响你使用工具。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                许多用户告诉我们：当你相信那个隐藏的信号存在时，共振更容易发生。
                ——我们所说的「共振」，是指你读到命理解读时，产生 「这说的就是我」 的认同感。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, fontStyle: 'italic', pl: 2, borderLeft: `3px solid ${theme.palette.secondary.main}` }}>
                <strong>子平与星宿不是在测量同一信号的不同维度，而是在对同一个不可测信号——或各自定义的不同信号——进行截然不同的猜测。它们不可通约，无法转换，也无从比较谁更「客观正确」。这不是平台的谦逊，是认识论的边界。</strong>
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                唯一能判断「准不准」的人，是你自己。你在生活中感受到的共振、自我理解中获得的清晰、未来回望时觉得「被说中了」的瞬间——这些才是验证的凭证。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                Ming 只保证：你随时可以换一种翻译，重新为自己建模。
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                地 · 共识之域
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                地是人类逻辑知识与工具箱的总和。它依赖共识而成立，也因此可讨论、可修正、可优化。强共识工具（数学、工程、医学）与解释性工具（社会学、心理学、五行命理）皆属其内；时间（生辰、节气、择时）亦是地中关键的工具维度。
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                人 · 实践之域
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                人具双重性：作为主体，运用「地」进行判断与行动，亦可推动共识工具的演化；作为客体，属于「天」，并有其内在秩序——那是个体之道。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                Ming 关注的从来不是「定命」，而是人与工具的协同实践。
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                时 · 地之维度
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                时不是独立的一界。时间是「地」中可度量、可记录、可回溯的工具坐标。通过生辰、节气、择时，我们把实践变成可复盘、可迭代、可见证的过程。
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 卷三 · 多元闭环 · 命理共学 · 参数选择 · 仪式实践 */}
        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              卷三 · 多元闭环 · 命理共学 · 参数选择 · 仪式实践
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                🔮 命理 · 共学
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                选择的同频命理流派——奇门、太乙、四柱、六壬、紫微……为你提供理解个人状态的结构化视角。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                注意，这不是诊断，只是视角；不是预言，只是解读。
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                🤝 共识 · 协议参数
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                每个流派都是一套独特的观察视角。子平视角下，论述的是日主强弱、格局高低；紫微视角下，讲的是星曜分布。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                在这里，没有哪个视角是「唯一正确的」解读。它们只是不同的猜测模型，用以逼近那个不可穷尽的信号本源。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                DAO 是视角维护的自治组织——他们负责让这套镜头持续开源、可审计、可迭代。
              </Typography>
              <Box sx={{ my: 3, p: 2, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  维护者的权力有明确边界：
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.8 }}>
                  任何共识参数的修改，仅可以分叉，不可以删除。平台虽然不能裁决哪个 DAO 正确，但是可以确保每个版本的开源与可追溯性：
                  <ol style={{ marginTop: '8px', paddingLeft: '24px' }}>
                    <li>每个版本都以开源协议托管</li>
                    <li>历史版本长期可见，不被抹除</li>
                    <li>参数演化路径清晰可追溯</li>
                  </ol>
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                用户可以选择不同的视角切换，只需加入不同的 DAO 即可。重要的问题在于，这里的切换没有叛教的伦理负担，只有工具的更替。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                我们将逐步开源所有流派算法的核心实现，以开源协议托管于 GitHub。创世期后，你便可以在
                <MuiLink href="https://github.com/LuckeeDAO/ming" target="_blank" rel="noopener noreferrer"> GitHub </MuiLink>
                审阅代码、提交提案，成为 DAO 维护者。
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                🕯️ 仪式 · 契约
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                仪式是将意图锚定成链上契约的动作。每一次铸造，都是一份可编程的自我承诺。
              </Typography>
              <Box sx={{ my: 2, p: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', lineHeight: 1.8 }}>
                  「未来 40 天，我将在晨间播放这段誓言。」<br />
                  「每当看到这枚 NFT，我都要提醒自己：像如流水一样谦逊」。
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                链上记录的每一次履约，都是为了让未来的自己，看得见过去的自己走了什么样的历程，这种心路历程，既是个人的自我鉴定，也是后来人的参照。
              </Typography>
              <Divider sx={{ my: 3 }} />
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                如果你想放弃一段契约，你可以让它留在钱包里，作为温柔的提醒；也可以将它发送至黑洞地址，让链上时间帮你封印那段半途。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, fontStyle: 'italic', pl: 2, borderLeft: `3px solid ${theme.palette.secondary.main}` }}>
                <strong>销毁不是删除记忆。销毁是一场关于放下的微型仪式。</strong>
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                无论你是否销毁，你永远有权铸造一枚新的契约。上一份誓言没有兑现，不剥夺你重新承诺的资格。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                你可以公开这份履约记录，作为链上历史；也可以永久私藏，作为无人知晓的纪念。
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 卷四 · 体验形态 · 你的工具箱 */}
        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              卷四 · 体验形态 · 你的工具箱
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                🌿 外物 · 符号锚点
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                根据您选择的镜头，系统会推荐与之共鸣的自然符号——
                昆仑的土、太湖的水、长白山的木、罗浮山的火、华山的金……
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                这不是「借能量」。这是选择一个符号，作为您接下来一段时间注意力投向的锚点。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                完成链上仪式，铸造仪式 NFT。这枚 NFT 不是「补了五行」。它是您对自己说：
                「接下来，我要像山一样稳固，像水一样流动。」
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                🌍 节气 · 共识节律
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                立春、夏至、秋分、冬至……
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                终有一天，会有成千上万人在同一时刻完成同一套仪式动作。而在创世第一年，共识池可能还很稀疏——但你点亮的那个光点，永远不是孤岛。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                千百年来，人类围火而坐、击节而歌。那不是迷信，是我们的大脑天生会为「同频」奖励自己。Ming 的节气仪式，只是让这份古老的奖赏，有了链上的回响。
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                ⏳ 择时 · 个人节律
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                时间，是你与自我对话的坐标系。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                共识节律：与千万人同步，感受共识的温度。
                个人节律：你选定的镜头会标记出理论上下游刃有余的时间窗口。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                这不是「吉凶神煞」。这是系统根据你当下的状态转译，为你推荐的注意力锚点候选。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                你完全可以选择另一个时间，另一种算法——择时的最终目的，是让你主动决定「何时认真」。
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                📈 履历 · 可缩放的地图
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                你每一次仪式、每一次意图锚定、每一次流派切换——都会成为能量履历上的一笔。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                系统根据你当前选定的镜头，将你的状态波动绘制成一条曲线：
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                它不是体检报告，它是你选择的语言，对你当下状态的实时转译。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, fontStyle: 'italic', pl: 2, borderLeft: `3px solid ${theme.palette.secondary.main}` }}>
                <strong>这条曲线有一个重要的性质：它不是胶片，是实时显影液。</strong>
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                每一次切换镜头，过去的日子都会被新的语言重新诉说——昨天的「火旺」可能变成今天的「燥土」。不是记忆被篡改，是你拥有了重新理解记忆的权利。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                你也可以锁定某个镜头，让履历从此固定用这种语言讲述。锁定不是封印，是暂停自动重译。就像选定一本不再修订的史书——你可以随时解锁，让过去重新开口。
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                📊 共识池 · 集体注意力的实时计数器
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                共识池不是玄学容器。它是集体仪式的链上聚合页。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                当你参与立春集体仪式，你会看到屏幕上的光点开始汇聚——此刻，和你同时完成铸造的人，正化作一个个光点，在地图上缓缓点亮。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, fontStyle: 'italic', pl: 2, borderLeft: `3px solid ${theme.palette.secondary.main}` }}>
                <strong>共识池不承诺规模，它只承诺真实。可能是几十人，可能是几千人，也可能是未来的成千上万人——每一个光点背后，都是一枚真实铸造的链上契约。</strong>
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                你可以查看历史累计次数、地域分布、节气共鸣峰值。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                这不是为了炫耀，这是为了让孤独的自我承诺，被千万个陌生的同频者轻轻见证。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                共识池不存储「能量」，它存储此时此刻，有人和你一样，选择了认真对待自己。
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 卷五 · 技术 · 只是载体，不是信仰 */}
        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              卷五 · 技术 · 只是载体，不是信仰
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              我们使用现代 Web3 技术栈，只为一件事：让「意图锚定、集体见证、可回溯记录」成为可能。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              · 前端：React 18 + TypeScript + Material-UI + Vite<br />
              · 区块链 & NFT：ethers.js + ERC-721，链上可验证的承诺见证<br />
              · 存储：IPFS + 本地存储
            </Typography>
            <Box sx={{ my: 3, p: 3, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 1, border: `1px solid ${theme.palette.primary.main}20` }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                隐私与数据安全
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                <strong>您的八字在本地完成分析，仅存储于您自己的设备。</strong>您可以选择将其备份至去中心化存储网络，此时数据以加密形式传输与存储，Ming 不会主动收集或存储您的原始生辰数据。
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
                <strong>您通过钱包私钥控制访问权限——您的隐私，由您自己保管。</strong>
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              技术在这里，不是「神力」的来源，是「记忆」的载体。
            </Typography>
          </CardContent>
        </Card>

        {/* 卷六 · 效用的归属 */}
        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              卷六 · 效用的归属
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              没有人能替你确认，某个流派的解读是否「对」。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              因为答案不在算法里，不在社群投票里——在你日复一日使用它理解自己的过程里。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, fontStyle: 'italic', pl: 2, borderLeft: `3px solid ${theme.palette.secondary.main}` }}>
              <strong>你觉得准，它就是对你而言准的。这不是客观真理，是主观共振——我们所说的「共振」，是指你读到某段解读时，产生 「这说的就是我」 的认同感。</strong>
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              而共振本身就是真实的效用。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              你觉得不准，换一个流派再试。这里没有「伪命理」的审判，只有「不适合我」的视角迁徙。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              Ming 从不替你做决定。我们只保证：你随时拥有更换视角的权利。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              本平台所有算法、分析、仪式均为文化建模与心理仪式工具，不构成命运预测、医疗建议或投资建议。
            </Typography>
          </CardContent>
        </Card>

        {/* 卷七 · 明其心，知其地，行其路，续其明 */}
        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              卷七 · 明其心，知其地，行其路，续其明
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              我们不知道天命是什么。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              但我们知道一件事：
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              当一个人在立春的晨光里，为自己铸造一枚迎春仪式的 NFT——
              那一刻，他不是在向不可知的天乞求恩典。
              他是在对自己说：
            </Typography>
            <Box sx={{ my: 3, p: 3, textAlign: 'center', bgcolor: `${theme.palette.primary.main}08`, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ fontStyle: 'italic', color: theme.palette.primary.main }}>
                「这个春天，我选择认真度过。」
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              这一声低语，被代码接住，被哈希见证，被时间封存。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              它不是写给天的奏章。它是写给自己的契约。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              而契约的效力，从来不在于墨水是否神圣，而在于签名者是否愿意——在未来的日子里——记得自己曾许下过什么。
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              我们不知道天命是什么。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              但我们知道，所有地图、镜头、契约，都只是渡河的筏子。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              当你开始认真对待自己——
              用什么工具、信什么流派、是否兑现契约，都已不是最初的问题。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              重要的是：
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              那个在立春晨光里说「这个春天我选择认真度过」的人，已经不一样了。
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              我们提供地图，你定义目的地。<br />
              我们提供镜头，你选择对焦方式。<br />
              我们提供契约，你决定履约的节奏。<br />
              我们提供可重译的履历，你保留重新翻译的权利。<br />
              我们提供失败，你持有放下的仪式。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, mt: 2, fontWeight: 600 }}>
              这就是「人为主体」的全部含义。
            </Typography>
          </CardContent>
        </Card>

        {/* 附言 */}
        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}`, bgcolor: `${theme.palette.secondary.main}05` }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              附：关于这份文本
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              您刚刚阅读的是 Ming 的哲学完整版——它是我们关于「天地人三才共识」的全部思考。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              如果您是第一次到访，也欢迎移步 <MuiLink component={Link} to="/">精简首页</MuiLink>，那里只有工具、仪式与一条温柔的起点。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, fontStyle: 'italic' }}>
              我们深知：不是所有人都需要读完一本宣言才肯扬帆。
              海图的价值，不在于被通读，而在于当你需要辨认航向时，它就在那里。
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Philosophy;
