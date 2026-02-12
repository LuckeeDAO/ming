/**
 * 仪式资源详情页面
 *
 * 为每一类仪式资源提供独立的说明页面：
 * - 基础仪式指南
 * - 自然物特定仪式
 * - 仪式文案模板
 * - 五行能量理论
 * - 四柱八字基础
 */

import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const CeremonyResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const renderContent = () => {
    switch (id) {
      case 'basic_ceremony':
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h4" gutterBottom>
              基础仪式指南
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              外物连接仪式是一个将个人能量与自然物能量进行连接的过程。通过这个仪式，你可以与选定的自然物建立能量连接，并最终由钱包完成 NFT 铸造，把这次连接永久记录在区块链上。
            </Typography>

            <Typography variant="h6" gutterBottom>
              仪式七个阶段
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="1. 能量分析"
                  secondary="通过四柱八字分析五行能量分布、循环状态和缺失元素，为后续外物选择提供依据。"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2. 外物推荐"
                  secondary="根据能量分析结果推荐适合连接的外物，优先补充缺失元素并平衡整体能量。"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="3. 选择外物"
                  secondary="从推荐列表中选择外物，确认其五行属性和象征意义是否与你当前的需求匹配。"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="4. 准备连接"
                  secondary="选择合适的时间与空间，做好心理准备，将“知道”转化为“做到”的意图。"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="5. 内容创建"
                  secondary="为本次连接撰写文案、上传图片，并明确连接意图与期望。这些内容将作为 NFT 元数据的一部分，被记录在链上。"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="6. 执行连接"
                  secondary="根据选择的方式执行立即连接或定时连接，在钱包中确认交易（包括网络、Gas 等），由钱包调用合约在链上完成 NFT 铸造。"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="7. 完成与记录"
                  secondary="确认交易与元数据，记录连接后的感受，并在今后的生活中持续观察变化。"
                />
              </ListItem>
            </List>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              提示：你可以在“我的连接记录”中随时查看已完成的外物连接仪式以及对应的 NFT 信息，作为这段关系在数字世界中的见证。
            </Typography>
          </Box>
        );

      case 'natural_object_ceremonies':
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h4" gutterBottom>
              自然物特定仪式
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              不同五行属性的自然物，需要采用不同的连接方法。本页提供木、火、土、金、水五大类自然物的专门仪式建议。
            </Typography>

            <Typography variant="h6" gutterBottom>
              木属性自然物
            </Typography>
            <Typography variant="body2" paragraph>
              适合植物、木制品、绿色宝石。时间宜选春季与清晨，方位宜东方，象征生长与发展。
            </Typography>

            <Typography variant="h6" gutterBottom>
              火属性自然物
            </Typography>
            <Typography variant="body2" paragraph>
              适合蜡烛、火焰相关物品、红色宝石。时间宜选夏季与正午，方位宜南方，象征热情与光明。
            </Typography>

            <Typography variant="h6" gutterBottom>
              土、金、水属性自然物
            </Typography>
            <Typography variant="body2" paragraph>
              土象征稳定与承载，宜选长夏与中央方位；金象征收敛与决断，宜选秋季与西方；水象征流动与智慧，宜选冬季与北方。
            </Typography>

            <Typography variant="body2" color="text.secondary">
              在进行具体仪式时，可结合当下的大运流年和自身能量状态，选择最合适的时间与外物组合。
            </Typography>
          </Box>
        );

      case 'blessing_templates':
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h4" gutterBottom>
              仪式文案模板
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              仪式文案用于在连接过程中表达你的意图与祝福。合适的文字可以帮助你聚焦注意力，强化连接效果。
            </Typography>

            <Typography variant="h6" gutterBottom>
              通用连接祝福
            </Typography>
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
{`今天，我选择与「外物名称」建立连接。
愿这次连接能够：
- 补充我缺失的「五行属性」能量
- 平衡我的能量循环
- 带来「具体期望」的改变

我以开放和尊重的心态，迎接这次连接。
愿能量流动顺畅，连接稳固持久。`}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              五行属性特定模板
            </Typography>
            <Typography variant="body2" paragraph>
              可以根据外物所属五行（木、火、土、金、水），在文案中加入对应的象征意象，例如“如树木般生长”、“如火焰般点燃热情”等。
            </Typography>
          </Box>
        );

      case 'wuxing_energy':
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h4" gutterBottom>
              五行能量理论
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              五行（金木水火土）是传统命理中对能量类型的抽象，强调相生相克与能量循环。本页提供五行能量在仪式中的应用视角。
            </Typography>

            <Typography variant="h6" gutterBottom>
              相生相克与能量循环
            </Typography>
            <Typography variant="body2" paragraph>
              相生：木生火、火生土、土生金、金生水、水生木；相克：木克土、土克水、水克火、火克金、金克木。通过补充缺失、平衡过强的元素，可以让能量循环更为顺畅。
            </Typography>

            <Typography variant="h6" gutterBottom>
              在连接仪式中的应用
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="补充缺失五行" secondary="选择与缺失元素同属性的外物进行连接。" />
              </ListItem>
              <ListItem>
                <ListItemText primary="平衡过强五行" secondary="通过相克或制约关系，缓和某一元素过强带来的失衡。" />
              </ListItem>
              <ListItem>
                <ListItemText primary="顺应大运流年" secondary="结合大运与流年能量，选择合适的连接时机。" />
              </ListItem>
            </List>
          </Box>
        );

      case 'sizhu_bazi':
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h4" gutterBottom>
              四柱八字基础
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              四柱八字以年、月、日、时四个时间点的天干地支组合来描述一个人出生时的“能量密码”，是本系统能量分析与仪式设计的基础。
            </Typography>

            <Typography variant="h6" gutterBottom>
              四柱与日主
            </Typography>
            <Typography variant="body2" paragraph>
              年柱代表根基与家族背景，月柱代表成长环境与资源，日柱（尤其是日干）代表命主本人，时柱代表晚年与子女／作品等延伸。
            </Typography>

            <Typography variant="h6" gutterBottom>
              在仪式中的作用
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="确定能量结构" secondary="通过四柱判断五行分布与日主强弱。" />
              </ListItem>
              <ListItem>
                <ListItemText primary="指导外物选择" secondary="根据命局喜忌选择更匹配的连接对象。" />
              </ListItem>
              <ListItem>
                <ListItemText primary="设计时间轴" secondary="结合大运、流年、流月设计阶段性仪式。" />
              </ListItem>
            </List>
          </Box>
        );

      default:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              未找到对应的仪式资源
            </Typography>
            <Typography variant="body2" color="text.secondary">
              请返回仪式资源列表重新选择。
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} color="inherit" to="/connection-ceremony?tab=2">
          仪式资源（连接仪式页）
        </Link>
        <Link component={RouterLink} color="inherit" to="/ceremony-resources">
          仪式资源列表
        </Link>
        <Typography color="text.primary">详情</Typography>
      </Breadcrumbs>
      {renderContent()}
    </Container>
  );
};

export default CeremonyResourceDetail;

