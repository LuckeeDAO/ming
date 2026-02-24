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

const Philosophy: React.FC = () => {
  const theme = useTheme();

  const sections = [
    {
      id: 'intro',
      title: '第一节 · 平台缘起与定位',
      content: (
        <>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            明命 · Ming 是一个以「天不可尽知、地为共识理论、人为实践主体」为内核的 Web3 仪式平台。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们不替你回答「命运究竟是什么」，而是利用人类长期积累的「地」的智慧，包括命理在内的多种工具，帮助你在现实约束条件内，完成自我叙事的逻辑自洽。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            在这里，每一次仪式既是一段共识的确认，也是一次对自己的承诺：你可以选择外物作为符号锚点，择时进行 NFT 绑定，实现自我特征的铸造与完善。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            共识池负责汇聚这些契约，让孤独的自我承诺，被千万个陌生的同频者共同见证。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume1',
      title: '第二节 · 我们是谁',
      content: (
        <>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            明命 · Ming 知命为明，非为窥道，乃为明心。我们不是先知，不是圣人，我们只是一个普通的匠人。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            那驱动日月星辰的终极法则，我们称之为「道」，或许永远超出人类认知的边界。但人类最伟大的创造，是编织了一张名为「地」的知识之网：数学、物理、律法、艺术，以及心理学、社会学、命理学等，都是这张网上的经纬。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            时间也是「地」的关键工具：生辰、节气、择时，都在帮助我们组织经验、解释历史、面向行动。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            Ming 不回答「命运是什么」。Ming 将「地」的智慧转化为开源、可编程的数字工具，帮助你在这张地图上画出自己的航线。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume2',
      title: '第三节 · 哲学基石：天·命·地·人·时',
      content: (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            天 · 客体之域
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            天是客体。它可被观察其「象」，但不可被主体穷尽其「体」。我们尊重现实约束，并以观察与记录保持谦逊。
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            命 · 隐藏的道
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们相信命的存在，如同相信客体自身的运行规律。我们可用不同语言去描述它：四柱、星宿、紫微、五行，每一种流派都是一套探索性的建模语言。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            这些语言是否在言说同一个「命」？Ming 把答案留给你。你可以相信它是真相，也可以将其视为文化叙事与自我对话，两种立场都不影响你使用工具。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们所说的「共振」，是指你读到命理解读时，产生「历史就是这样发生的」的确认感。最终能判断存在性的人，只有你自己。
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            地 · 共识之域
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            地是人类逻辑知识与工具箱的理论总和。它依赖共识而成立，也因此可讨论、可修正、可优化。强共识工具与解释性工具都在其中，时间亦是关键维度。
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            人 · 实践之域
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            人具双重性：作为主体，运用「地」进行判断与行动，并推动共识工具演化；作为客体，属于「天」，并有其内在秩序。
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            时 · 地之维度
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            时不是独立一界。时间是「地」中可度量、可记录、可回溯的工具。通过生辰、节气与择时，我们构建可复盘、可迭代、可见证的实践过程。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume3',
      title: '第四节 · 多元闭环：共学·参数·仪式',
      content: (
        <>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🔮 命理 · 共学：你可选择同频流派，如奇门、太乙、四柱、六壬、紫微。它们提供的是结构化视角，不是诊断，也不是预言。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🤝 共识 · 协议参数：每个流派都是一套观察模型。这里没有「唯一正确」的解读，只有可切换的猜测框架。DAO 负责让这些框架持续开源、可审计、可迭代。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            参数修改只能分叉、不能抹除：每个版本必须可追溯、可审阅，历史长期可见。用户可随时加入不同 DAO，完成视角迁移。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🕯️ 仪式 · 契约：仪式是把意图锚定为链上契约的动作。每次铸造都是可编程承诺；每次履约都让未来的你看见过去的你如何行动。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            若你想结束一段契约，可以保留它，也可以发送至黑洞地址。销毁不是删除记忆，而是一场关于放下的微型仪式。无论如何，你始终有权重新承诺。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume4',
      title: '第五节 · 体验形态：你的工具箱',
      content: (
        <>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🌿 外物 · 符号锚点：根据你选择的视角，挑选与之适配的自然符号，如昆仑的土、太湖的水、长白山的木、罗浮山的火、华山的金，甚至自创物象。它不仅是自我暗示，更是注意力锚点。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            完成链上铸造后，这枚 NFT 与你完成契约仪式，并持续提醒你：「接下来，我要像山一样稳固。」或「接下来，我要像水一样谦逊。」
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🌍 节气 · 共识节律：立春、夏至、秋分、冬至等周期信号，是共识与道共鸣的里程碑。Ming 采用节气仪式，正是基于这种古老而稳定的共识基础。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            ⏳ 择时 · 个人节律：时间是你与外界对话的坐标系。共识节律是集体选择；你也可随时切换到另一套自洽的共识系统。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            📈 记录 · 可回放的历史：每次仪式、每次意图锚定、每次流派切换，都会成为你的履历档案。切换视角后，历史会被新语言重新讲述，这不是篡改记忆，而是重释历史。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            📊 共识池 · 集体注意力的实时显示屏：共识池是集体仪式的链上聚合页。它在保护个体隐私的同时，展示可验证的共识契约。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            共识池不存储「能量」，它存储的是：此时此刻，有多少人和你一样，选择认真面对并修正自身的不足。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume5',
      title: '第六节 · 技术实现：载体，不是信仰',
      content: (
        <>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们使用现代 Web3 技术栈，只为一件事：让「意图锚定、集体见证、可回溯记录」成为可能。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            前端基于 React 18 + TypeScript + Material-UI + Vite；区块链与 NFT 基于 ethers.js + ERC-721；存储结合 IPFS 与本地存储。
          </Typography>
          <Box sx={{ my: 2, p: 2, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 1, border: `1px solid ${theme.palette.primary.main}20` }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              🔒 隐私与数据安全
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              NFT 中的八字数据可分为明文与哈希两部分，用户可自行决定公开范围：可全部哈希、全部公开，或选择性公开。
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              你通过钱包私钥完全控制隐私数据。Ming 不会主动收集或存储你的原始数据；没有私钥，Ming 无法解析你的八字信息。
            </Typography>
          </Box>
        </>
      ),
    },
    {
      id: 'volume6',
      title: '第七节 · 效用归属：验证在实践',
      content: (
        <>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            在 Ming 平台，没有人能替你确认某个流派的解读是否「对」。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            因为答案不在算法里，不在社区投票里，而在你日常使用与实践中。这里没有客观真理，只有主观共振。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们所说的「共振」，是指你读到某段解读时，产生「历史恰恰如此发生」的认同感。共振本身，就是真实效用的确认。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            当你觉得某种描述不符合历史经历，可以变更参数或切换流派，进行视角迁徙。Ming 只是工具箱，决定权始终在你手中。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            注：本平台所有算法、分析、仪式均为文化建模与心理仪式工具，不构成命运预测、医疗建议或投资建议。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume7',
      title: '第八节 · 行动宣言：明其心，知其地，行其路，续其明',
      content: (
        <>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们不知道天命运行规律究竟是什么，但我们知道：无论其运转函数如何，人类都能持续逼近它。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            周期性是一切天道规律存在的直接证据。利用基础周期函数叠加逼近某个规律，是人类长期实践形成的共识结论。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            在天地人的框架下，人类利用共识验证天道，也利用共识改善自身生活。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            当一个人在立春晨光里，为自己铸造一枚迎春仪式 NFT 的那一刻，他不是在向不可知的天乞求恩典，而是在对自己说：「这个春天，我选择认真度过。」
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            这不是写给天的奏章，这是写给自己的契约。契约效力来自人类自身的共识，这是人类得以利用天道的方式。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们提供地图，你来定义终点；我们提供视角，你选择代入方式；我们提供契约模板，你决定履约内容；我们提供共识验证工具，你决定共识逻辑是否自洽可靠。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, fontWeight: 600 }}>
            这就是「人定胜天」在 Ming 语境下的含义。
          </Typography>
        </>
      ),
    },
  ];

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

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {sections.map((section) => (
          <Card key={section.id} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                {section.title}
              </Typography>
              {section.content}
            </CardContent>
          </Card>
        ))}

        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}`, bgcolor: `${theme.palette.secondary.main}05` }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              附：
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
              我们要那所谓的“天命”，在人族共识面前，如诸佛般——烟消云散。
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
