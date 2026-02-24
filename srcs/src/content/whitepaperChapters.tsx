import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';

export interface WhitepaperChapter {
  id: string;
  title: string;
  tag: string;
  summary: string;
  detail: React.ReactNode;
}

export const getWhitepaperChapters = (theme: Theme): WhitepaperChapter[] => [
  {
    id: 'intro',
    title: '第一节 · 平台缘起与定位',
    tag: '缘起定位',
    summary:
      '我们不替你定义命运，只提供可实践的工具，帮助你把经验、选择与行动连成可复盘的自我叙事。',
    detail: (
      <>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          第一节 · 平台缘起与定位
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          明命 · Ming 是一个以「天不可尽知、地为共识理论、人为实践主体」为内核的 Web3 仪式平台。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          我们不替你回答「命运究竟是什么」，而是利用人类长期积累的「地」的智慧——包括命理在内的诸多工具——帮助你在现实约束条件之内，把经验、选择与行动重新连成一条可实践的自我叙事。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          在这里，每一次仪式既是一段共识确认，也是一次对自己的郑重承诺：
          你可以选择外物作为符号锚点，择时进行 NFT 绑定，让你的意图拥有可见的锚点与可回望的成长轨迹。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          共识池负责汇聚这些契约，让孤独的自我承诺被千万个陌生的同频者共同见证。
        </Typography>
      </>
    ),
  },
  {
    id: 'volume1',
    title: '第二节 · 我们是谁',
    tag: '身份定位',
    summary:
      '我们不是先知，也不是圣人；我们是绘图师与航海者，以匠人般的耐心陪你找到自己的航线。',
    detail: (
      <>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          第二节 · 我们是谁
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          明命 · Ming 知命为明，非为窥道，乃为明心。我们不是先知，不是圣人，而是绘图师与航海者：以匠人般的耐心校准坐标、修补海图。
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
    summary: '以「天·命·地·人·时」为骨架，建立可解释、可实践、可迭代的观察框架。',
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
          我们所说的「命」，不是一句空泛的天意，而是个体在时间中反复显现、可被多种模型逼近却难被单一模型穷尽的内在秩序。它更像一个低信噪比的长期信号：能被观察到轮廓，却难被一次性解释完毕。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          我们可用不同的语言去描述它。四柱、星宿、紫微、五行……每一种命理流派，都是一套人类探索的建模语言。这些语言是否在言说同一个「命」？这个问题，Ming 留给你自己回答。
        </Typography>
        <Box sx={{ my: 2, p: 2, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 1, borderLeft: `3px solid ${theme.palette.primary.main}` }}>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            你可以认为：命是一个等待逼近、发现的真相，或一个等待接收、翻译的信号；也可以认为：命只是文化叙事与自我对话的假定前提。两种立场都不影响你对工具的使用。
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          现实的实践体验在于：当你承认某种内在秩序可能存在时，共振更容易发生。我们所说的「共振」，不是一时「被说中」的情绪，而是某套解释能持续对齐你的经历，并对下一步行动产生指导作用的感受与验证。
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
          时不是独立的一界。时间是「地」中可度量、可记录、可回溯的工具。通过生辰、节气、择时，我们构建可复盘、可迭代、可见证的实践路径。
        </Typography>
      </>
    ),
  },
  {
    id: 'volume3',
    title: '第四节 · 三元闭环：共学·共识设定·仪式实践',
    tag: '三元闭环',
    summary: '以命理共学建立视角，以共识设定组织规则，再以仪式实践把意图落为链上契约。',
    detail: (
      <>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          第四节 · 三元闭环：共学·共识设定·仪式实践
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          🔮 命理共学 · 选择视角：你可选择同频流派——奇门、太乙、四柱、六壬、紫微……它们为你提供理解个人状态的结构化视角。注意：这不是诊断，只是视角；不是预言，只是解读。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          🤝 共识设定 · 选择规则：每个流派都是一套独特的观察模型。子平关注日主强弱与格局，紫微关注星曜分布。在这里，没有哪套视角是「唯一正确」的答案，它们只是逼近同一问题的不同路径。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          DAO 是视角维护的自治组织，负责让这套镜头持续开源、可审计、可迭代。
        </Typography>
        <Box sx={{ my: 2, p: 2, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            维护边界：只允许分叉，不允许抹除
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.8 }}>
            任何共识设定的修改，只能以分叉形式新增版本，不能删除历史。平台不裁决哪个 DAO 正确，但可确保每个版本开源且可追溯：
            <ol style={{ marginTop: '8px', paddingLeft: '24px' }}>
              <li>每个版本都以开源协议托管</li>
              <li>历史版本长期可见，不被抹除</li>
              <li>版本演化路径清晰可追溯</li>
            </ol>
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          用户可随时切换视角，只需加入不同 DAO 即可。这里的切换没有叛教负担，只有工具更替。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          我们将逐步开源所有流派算法的核心实现，以开源协议托管于 GitHub。创世期后，你便可以在 GitHub 审阅代码、提交提案，成为 DAO 维护者。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          🕯️ 仪式实践 · 锚定契约：仪式是将意图锚定为链上契约的动作。每一次铸造，都是一份可编程的自我承诺。你可以这样为自己设定：
          「未来 40 天，我将在晨间播放这段誓言」，也可以增加信息提示：「每当看到这枚 NFT，我都要提醒自己：像流水一样谦逊」。
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
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          🎭 仪式实践（续）· 封局归档：如果契约圆满达成——当一份契约完成了它的历史使命，无论是一段誓言被完整履行，还是一个阶段的自我叙事自然落幕——你可以选择为它举行「封局仪式」。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          封局，如同奇门遁甲中的局终之仪，是对这段经历的郑重告别与归档。发起封局后，该 NFT 将自动移除或隐藏其绑定的个人隐私数据（如生辰哈希），仅保留公开元数据与链上见证记录。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          封局之后的 NFT，不再承载你的隐私承诺，但依然铭刻那段时光的存在。你可以将其永久珍藏，作为自我历史的纪念章；也可以让它进入市场流转，成为可被他人见证的匿名共识凭证。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          封局不是销毁，而是转化——从私密契约，转化为可公开的叙事碎片。你始终拥有对自我历史如何被展示的决定权。
        </Typography>
      </>
    ),
  },
  {
    id: 'volume4',
    title: '第五节 · 体验形态：你的工具箱',
    tag: '体验工具',
    summary: '外物、节气、择时、履历与共识池，构成你与自己对话、与群体共振的实践工具箱。',
    detail: (
      <>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          第五节 · 体验形态：你的工具箱
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          🌿 外物 · 符号锚点：根据你选择的视角，挑选与之适配的自然符号——昆仑的土、太湖的水、长白山的木、罗浮山的火、华山的金，甚至你自创的物象。
          它不是神秘替代，而是你为自己设定的注意力锚点。完成链上铸造后，这枚 NFT 会持续提醒你：「接下来，我要像山一样稳固。」或「接下来，我要像水一样谦逊。」
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          🌍 节气 · 共识节律：立春、夏至、秋分、冬至……这些周期信号，是群体长期实践形成的时间坐标。Ming 选择节气仪式，正是基于这套古老且稳定的共识节律。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          ⏳ 择时 · 个人节律：时间，是你与外界对话的坐标系。共识节律是集体选择；这种选择与对错无关，你随时可以切换到另一个逻辑自洽的共识系统。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          📈 记录 · 可缩放的地图：你每一次仪式、每一次意图锚定、每一次流派切换，都会成为个人履历上的一份档案材料。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          每一次切换共识视角，过去的时光都会被新的语言重新诉说——昨天的「火旺」可能变成今天的「燥土」。这不是记忆被篡改，这是你对历史共识的重新解读。完成封局后的 NFT，也会在履历中沉淀为一个「已完成篇章」。
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          📊 共识池 · 集体注意力的实时显示屏：共识池是集体仪式的链上聚合页。它借助数字签名，在满足个体隐私保护的同时，展示可验证的共识契约。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          共识池不存储「能量」，它存储的是：此时此刻，有多少人与你处在同一节律、做出相似承诺，并彼此温柔见证。
        </Typography>
      </>
    ),
  },
  {
    id: 'volume5',
    title: '第六节 · 技术实现：载体，不是信仰',
    tag: '技术隐私',
    summary: '技术只负责记录与见证，不负责给出命运答案；你的隐私由你自己保管。',
    detail: (
      <>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          第六节 · 技术实现：载体，不是信仰
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          我们使用现代 Web3 技术栈，只为一件事：让「意图锚定、集体见证、可追溯记录」成为可能。
          前端基于 React 18 + TypeScript + Material-UI + Vite；区块链与 NFT 基于 ethers.js + ERC-721；存储结合 IPFS 与本地存储。
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
          <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
            当你发起封局仪式时，系统会更新链上关联的元数据引用（如新的 IPFS 哈希），将隐私字段移除或转为不可逆摘要，仅保留公开可验证信息。
          </Typography>
        </Box>
      </>
    ),
  },
  {
    id: 'volume6',
    title: '第七节 · 效用归属：验证在实践',
    tag: '效用归属',
    summary: '效用不在算法或投票里，而在你持续理解自己、并据此行动的实践过程中。',
    detail: (
      <>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          第七节 · 效用归属：验证在实践
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          在 Ming 平台，没有人能替你确认某个流派的解读是否「对」。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          因为答案不在算法里，不在社区投票里，而在你日常使用与实践中。这里没有客观真理，只有可被实践检验的主观共振。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          我们所说的「共振」，不是一时「被说中」的情绪，而是某套解释能持续对齐你的经历，并对下一步行动产生指导作用。共振本身，就是效用的确认。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          当你觉得某种描述与历史经历不吻合时，可以调整设定，或切换到新的流派，完成视角迁移。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          Ming 从不替你做决定。它只是一个工具箱；借助它，你随时拥有更换视角的权利。
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: `${theme.palette.secondary.main}08`,
            borderLeft: `3px solid ${theme.palette.secondary.main}`,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: 'italic' }}>
            注：本平台所有算法、分析、仪式均为文化建模与心理仪式工具，不构成命运预测、医疗建议或投资建议。
          </Typography>
        </Box>
      </>
    ),
  },
  {
    id: 'volume7',
    title: '第八节 · 行动宣言：明其心，知其地，行其路，续其明',
    tag: '行动宣言',
    summary: '当你说出「这个春天，我选择认真度过」，行动便从此刻开始。',
    detail: (
      <>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          第八节 · 行动宣言：明其心，知其地，行其路，续其明
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          我们不知道天命的运行规律究竟是什么；但我们知道，人类始终可以在实践中持续逼近它。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          周期性是我们观察世界的重要线索。沿着节气、季节与长期记录，人类得以不断修正理解，并逐步逼近那些尚不可尽知的秩序。
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
          我们提供人类共识的达成与验证工具，你决定共识逻辑本身的自洽与可靠。
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.9 }}>
          这就是 Ming 的主张：「人定其约，自调其运」：人类通过自定义共识，持续校准自身节律与行动方向，从而完成对命理叙事的主动调节与重写。
        </Typography>
      </>
    ),
  },
];
