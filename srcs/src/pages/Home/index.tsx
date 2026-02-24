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
  const [activeChapter, setActiveChapter] = React.useState<string>('intro');

  // 避免 TypeScript 将部分从 UI 库导入的组件误判为未使用
  // （这些组件在条件分支与 JSX 中均有实际使用）
  void [CardActions, Button, Link];

  // 平台简介 + 哲学白皮书七个章节（摘要+详细内容）
  const chapters = [
    {
      id: 'intro',
      title: '第一节 · 平台缘起与定位',
      tag: '平台简介',
      summary:
        '明命 · Ming 是一个以「天不可尽知、地为共识理论、人为实践主体」为内核的 Web3 仪式平台。我们不替你回答「命运究竟是什么」，而是利用人类长期积累的「地」的智慧——包括命理在内的诸多工具——帮助你在现实约束条件之内，重新完成自我叙事的逻辑自洽。在这里，每一次仪式既是一段共识的确认，也是一次对自己的重重承诺：你可以选择具体特征外物作为符号锚点，择时进行 NFT 绑定，实现自我特征的铸造与完善。共识池负责汇聚这些契约，让孤独的自我承诺，被千万个陌生的同频者见证。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            第一节 · 平台缘起与定位
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            明命 · Ming 是一个以「天不可尽知、地为共识理论、人为实践主体」为内核的 Web3 仪式平台。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们不替你回答「命运究竟是什么」，而是利用人类长期积累的「地」的智慧——包括命理在内的诸多工具——帮助你在现实约束条件之内，重新完成自我叙事的逻辑自洽。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            在这里，每一次仪式既是一段共识的确认，也是一次对自己的重重承诺：
            你可以选择具体特征外物作为符号锚点，择时进行 NFT 绑定，实现自我特征的铸造与完善。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            共识池负责汇聚这些契约，让孤独的自我承诺，被千万个陌生的同频者见证。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume1',
      title: '第二节 · 我们是谁',
      tag: '我们是谁',
      summary:
        '明命 · Ming 知命为明，非为窥道，乃为明心。我们不是先知，不是圣人，我们只是一个普通的匠人——帮助你在「地」的知识之网上绘制属于自己的航线。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            第二节 · 我们是谁
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            明命 · Ming 知命为明，非为窥道，乃为明心。我们不是先知，不是圣人，我们只是一个普通的匠人。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            那驱动日月星辰的终极法则——我们称之为「道」——或许永远超出人类认知的边界。但人类最伟大的创造，是编织了一张名为「地」的知识之网：
            数学、物理、律法、艺术，以及心理学、社会学、命理学等，全是这张网上的经纬；时间——生辰、节气、择时——也是「地」的关键工具。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            Ming 不回答「命运是什么」。Ming 将「地」的智慧转化为开源、可编程的数字工具，帮助你在这张地图上画出属于自己的航线。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们帮助你绘制地图，不是为了定义星空，而是为了让脚下的旅程——多一份勇气，多一份和谐，多一份同行的温暖。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume2',
      title: '第三节 · 哲学基石：天·命·地·人·时',
      tag: '哲学基石',
      summary: '以「天·命·地·人·时」为骨架，为 Ming 构建一套自洽的世界观与实践框架。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            第三节 · 哲学基石：天·命·地·人·时
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, mt: 2 }}>
            天 · 客体之域
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            天是客体。它可被观察其「象」，但不可被主体穷尽其「体」。我们尊重现实的约束，并以观察与记录保持谦逊。
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            命 · 隐藏的道
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们相信命的存在，如同相信客体自身的运行规律。这种规律，或许就如同宇宙微波的背景辐射—— 我们无法直接聆听它，因为它太微弱、太古老，超出现有仪器的分辨率。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们可用不同的语言去描述它。四柱、星宿、紫微、五行……每一种命理流派，都是一套人类探索的建模语言。这些语言是否在言说同一个「命」？这个问题，Ming 留给你自己回答。
          </Typography>
          <Box sx={{ my: 2, p: 2, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 1, borderLeft: `3px solid ${theme.palette.primary.main}` }}>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              你可以认为是——命是一个等待逼近、发现的真相或者等待接收、翻译的信号；也可以认为否——命只是纯粹的文化叙事、自我对话的假定前提。两种立场都不影响你对工具的使用。
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            现实的实践体验在于：当你相信那个隐藏的信号存在时，共振更容易发生。 ——我们所说的「共振」，是指你读到命理解读时，产生「历史就是这样发生的」确认感。
          </Typography>
          <Box sx={{ my: 2, p: 2, bgcolor: `${theme.palette.secondary.main}08`, borderRadius: 1, borderLeft: `3px solid ${theme.palette.secondary.main}` }}>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9, fontStyle: 'italic' }}>
              <strong>子平或星宿，它们并不是在测量同一信号的不同维度，而是用不同的语言进行各自的建模分析，在没有量化处理之前，这些语言更多表现的是它们的不可通约性，无法转换，也无从比较谁更「客观」。或许这就是认识论的边界。</strong>
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            事实上，唯一能判断存在性的人，是你自己。你在生活中感受到的共振、自我理解中获得的清晰、未来回望时感受到的确定性——这才是验证的凭证。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            Ming 只保证：你随时可以换一种模型，重新为自己建模。
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            地 · 共识之域
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            地是人类逻辑知识与工具箱的理论总和。它依赖共识而成立，也因此可讨论、可修正、可优化。强共识工具（数学、工程、医学）与解释性工具（社会学、心理学、五行命理）皆属其内；时间（生辰、节气、择时）亦是地中关键的工具。
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            人 · 实践之域
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            人具双重性：作为主体，运用「地」进行判断与行动，亦可推动共识工具的演化；作为客体，属于「天」，并有其内在秩序——那是个体之道。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            Ming 关注的从来不是「定命」，而是人与工具的协同实践。
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            时 · 地之维度
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            时不是独立的一界。时间是「地」中可度量、可记录、可回溯的工具。通过生辰、节气、择时，我们构建了可复盘、可迭代、可见证的量化模型。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume3',
      title: '第四节 · 多元闭环：共学·参数·仪式',
      tag: '多元闭环',
      summary: '命理是共学的视角，共识是协议参数的选择，仪式是意图被锚定为链上契约的方式。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            第四节 · 多元闭环：共学·参数·仪式
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🔮 命理 · 共学：选择的同频命理流派——奇门、太乙、四柱、六壬、紫微……为你提供理解个人状态的结构化视角。
            注意，这不是诊断，只是视角；不是预言，只是解读。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🤝 共识 · 协议参数：每个流派都是一套独特的观察视角。子平视角下，论述的是日主强弱、格局高低；紫微视角下，讲的是星曜分布。
            在这里，没有哪个视角是「唯一正确的」解读。它们只是不同的猜测模型，用以逼近那个不可穷尽的信号本源。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            DAO 是视角维护的自治组织——他们负责让这套镜头持续开源、可审计、可迭代。
          </Typography>
          <Box sx={{ my: 2, p: 2, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 1 }}>
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
            我们将逐步开源所有流派算法的核心实现，以开源协议托管于 GitHub。创世期后，你便可以在 GitHub 审阅代码、提交提案，成为 DAO 维护者。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🕯️ 仪式 · 契约：仪式是将意图锚定成链上契约的动作。每一次铸造，都是一份可编程的自我承诺。你可以这样为自我设定：
            「未来 40 天，我将在晨间播放这段誓言」，也可以增加信息提示：「每当看到这枚 NFT，我都要提醒自己：像如流水一样谦逊」。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            链上记录的每一次履约，都是为了让未来的自己，看得见过去的自己走了什么样的历程。
            这种心路历程，既是个人的自我鉴定，也是后来人的参照。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            如果你想放弃一段契约，你可以让它留在钱包里，作为温柔的提醒；也可以将它发送至黑洞地址，让链上时间帮你封印那段半途。
            销毁不是删除记忆。销毁是一场关于放下的微型仪式。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            无论你是否销毁，你永远有权铸造一枚新的契约。上一份誓言没有兑现，不剥夺你重新承诺的资格。
            你可以公开这份履约记录，作为链上历史；也可以永久私藏，作为无人知晓的纪念。
          </Typography>
        </>
      ),
    },
    {
      id: 'volume4',
      title: '第五节 · 体验形态：你的工具箱',
      tag: '体验形态',
      summary: '外物、节气、择时、履历、共识池，共同构成你与自己对话的一整套工具箱。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            第五节 · 体验形态：你的工具箱
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🌿 外物 · 符号锚点：根据你选择的视角，挑选与之适配的自然符号——昆仑的土、太湖的水、长白山的木、罗浮山的火、华山的金……甚至是你自创的物象。
            这不仅是「借用能量」的自我暗示，更是主观能量的培植：为接下来一段时间设定一个注意力锚点。完成链上铸造后，这枚 NFT 就与你完成契约仪式，
            它会持续提醒你自己：「接下来，我要像山一样稳固。」或者，「接下来，我要像水一样谦逊。」
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            🌍 节气 · 共识节律：立春、夏至、秋分、冬至……这些周期信号，是共识与道共鸣的关键里程碑。Ming 选择节气仪式，正是基于这些古老且稳定的共识基础。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            ⏳ 择时 · 个人节律：时间，是你与外界对话的坐标系。共识节律是集体选择；这种选择与对错无关，你随时可以切换到另一个逻辑自洽的共识系统。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            📈 记录 · 可回放的历史：你每一次仪式、每一次意图锚定、每一次流派切换，都是个人履历上的一份档案材料。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            每一次切换共识视角，过去的时光都会被新的语言重新诉说——昨天的「火旺」可能变成今天的「燥土」。这不是记忆被篡改，这是你对历史共识的重新解读。
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            📊 共识池 · 集体注意力的实时显示屏：共识池是集体仪式的链上聚合页。它借助数字签名，在满足个体隐私保护的同时，展示可验证的共识契约。
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
      tag: '技术与隐私',
      summary: '技术栈只负责「记录与见证」，不负责给出命运答案——你的隐私由你自己保管。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            第六节 · 技术实现：载体，不是信仰
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们使用现代 Web3 技术栈，只为一件事：让「意图锚定、集体见证、可回溯记录」成为可能。
            前端基于 React 18 + TypeScript + Material-UI + Vite，区块链与 NFT 部分基于 ethers.js + ERC-721，存储部分结合 IPFS 与本地存储。
          </Typography>
          <Box sx={{ my: 3, p: 3, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 1, border: `2px solid ${theme.palette.primary.main}40` }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
              🔒 隐私与数据安全
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
              NFT 中的八字数据可分为明文与哈希两部分，用户可自行选择公开范围。极端情况下，你可以将全部数据以哈希形式存储（即不公开任何原文），也可以选择全部公开。
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
      tag: '效用的归属',
      summary: '命理的效用不在算法或投票里，而在你日复一日使用它理解自己的过程中。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            第七节 · 效用归属：验证在实践
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            在 Ming 平台，没有人能替你确认某个流派的解读是否「对」。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            因为答案不在算法里，不在社区投票里，而在你日常使用与实践中。这里没有客观真理，只有主观共振。我们所说的「共振」，是指你读到某段解读时，
            产生「历史恰恰如此发生」的认同感。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            共振本身，就是真实效用的确认。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            当你感觉某种命理描述不符合历史经历时，可以尝试变更参数，或切换到新的流派，进行视角迁徙。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            Ming 从不替你做决定。它只是一个工具箱；借助它，你随时拥有更换视角的权利。
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
      tag: '起点与宣言',
      summary: '当你在立春晨光里说出「这个春天，我选择认真度过」时，一切已经不同。',
      detail: (
        <>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            第八节 · 行动宣言：明其心，知其地，行其路，续其明
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们不知道天命运行规律究竟是什么。但我们知道，无论其运转函数如何，我们都有能力持续逼近它。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            周期性是一切天道规律存在的直接证据。利用基础周期函数叠加以逼近规律，是人类长期实践形成的共识结论。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            在天地人的框架下，人类用共识验证天道，也用共识改善自身生活。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            当一个人在立春的晨光里，为自己铸造一枚迎春仪式 NFT 的那一刻，他不是在向不可知的天乞求恩典，而是在对自己说：「这个春天，我选择认真度过。」从这一刻起，他进入春天的复苏模式。
            这不是写给天的奏章，这是写给自己的契约。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            契约的效力来自人类自身的共识，这是人类得以利用天道的方式。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们提供地图，你来定义终点；
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们提供视角，你选择代入方式；
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们提供契约模板，你决定履约的内容；
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            我们提供人族共识的达成与验证工具，你决定共识逻辑本身的自洽与可靠。
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            这就是「人定胜天」的全部含义。
          </Typography>
        </>
      ),
    },
  ];

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
                          正在加载章节内容...
                        </Typography>
                      );
                    })()}
                    <Box
                      sx={{
                        mt: 3,
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      {prevChapter ? (
                        <Button
                          variant="outlined"
                          onClick={() => handleChapterNavigate(prevChapter.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          上一章：{prevChapter.tag}
                        </Button>
                      ) : (
                        <Box />
                      )}
                      {nextChapter && (
                        <Button
                          variant="contained"
                          onClick={() => handleChapterNavigate(nextChapter.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          下一章：{nextChapter.tag}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

            {/* 第二部分：八个顺序章节（平台简介 + 七个章节） */}
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

              <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
                {chapters.map((chapter, index) => {
                  const selected = activeChapter === chapter.id;
                  const chapterNumber = index + 1;
                  return (
                    <Card
                      key={chapter.id}
                      onClick={() => setActiveChapter(chapter.id)}
                      sx={{
                        mb: 2,
                        border: selected
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        backgroundColor: selected ? `${theme.palette.primary.main}08` : 'background.paper',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          {/* 序号标识 */}
                          <Box
                            sx={{
                              minWidth: 48,
                              height: 48,
                              borderRadius: '50%',
                              bgcolor: selected ? theme.palette.primary.main : theme.palette.grey[200],
                              color: selected ? 'white' : theme.palette.text.secondary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '1.2rem',
                              flexShrink: 0,
                            }}
                          >
                            {chapterNumber}
                          </Box>
                          {/* 内容区域 */}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
                              sx={{ fontWeight: 600, mb: 1.5 }}
                            >
                              {chapter.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ lineHeight: 1.7 }}
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
                    附：
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
                    我们要那所谓的“天命”，在人族共识面前，如诸佛般——烟消云散。
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
    </Box>
  );
};

export default Home;
