/**
 * 核心概念页面
 * 
 * 介绍平台的核心理念：
 * - 三才框架：天、地、人的认知三界
 * - 能量循环概念
 * - 缺失元素概念
 * - 外物连接概念
 * - 平台理念说明
 */
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';

const Concept: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          核心概念
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          了解 Ming 平台的核心理念和理论基础
        </Typography>

        {/* 天与道、地与共识的哲学区分 */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            天与道、地与共识的哲学区分
          </Typography>
          <Box sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>天</strong>：客观事物（客体）之域。独立于人类意识的一切客观存在，包含万物，也包含作为生物客体的“人”。<br />
              <strong>道</strong>：天所遵守的客观规律。道在终极意义上不可知，但可通过外在可观测现象被主体间接逼近。Ming 不提供关于“道”的终极答案。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>地</strong>：人类的逻辑知识与工具箱，依赖共识而成立，也因此可讨论、可修正、可优化。强共识工具（数学/工程/医学）与解释性工具（社会学/心理学/五行命理）皆属其内；并包含时间工具维度（生辰/节气/择时）。生辰八字是一种“自我观测坐标系”，不是宿命判决书。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>时</strong>：在这里不是独立一界，而是<strong>地</strong>中的关键工具维度——用时间坐标与节律，让实践可记录、可复盘、可迭代。
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ fontStyle: 'italic', fontWeight: 500 }}>
              知命为明，非为窥道，乃为明心。
            </Typography>
          </Box>
        </Box>

        {/* 三才框架：天、地、人 */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            三才框架：天、地、人的认知三界
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
            天垂象，地载文，人观时以通神明。
          </Typography>
          
          <Grid container spacing={3}>
            {/* 天 */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    天：客观之域
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, opacity: 0.9 }}>
                    独立于人类意识的一切客观存在与规律
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    天是客观事物（客体）之域，也包含作为生物客体的“人”。客体所遵守的规律为道；道不可尽知，但可通过外在可观测现象被主体间接逼近。
                    在平台中，我们对“天”的态度是敬畏与如实观察；而“记录”属于“地”的工具体系——我们用时间坐标（生辰等）把观察变成可复盘的实践材料。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 地 */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    地：共识之域
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, opacity: 0.9 }}>
                    人类为理解"天"所构建的全部知识、理论与符号系统
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    地是人类理论知识之域，是共识的结果：数学、物理、五行、命理等皆属其内。它不是“道”的复制品，而是可讨论、可优化、可容错的工具箱。
                    在平台中，“地”体现为命理学算法、调理策略库、文化符号系统。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 人 */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    人：实践之域
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, opacity: 0.9 }}>
                    作为认知与实践主体的"我"
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    人具主体/客体双重性：作为主体可推动“地”（知识与共识）演进；作为客体属于“天”，并有其内在秩序（可称个体之道）。主体“我”通过“地”的工具去逼近与协同它。
                    在平台中，你的每一次互动都是一次实践反馈：既帮助你复盘，也帮助“地”的策略语言持续演进。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>平台价值取向：个体天道协同算法</strong>：我们深信，源于五行学说的"生命系统和谐与生生不息"是值得追求的根本价值。
              本平台的核心，是提供一套以该价值为优化目标的"个体天道协同算法"：数字化传统智慧、提供协同策略、建立反馈闭环。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
              <strong>Ming (明命) 在三才框架中的位置</strong>：我们创建 Ming，并非因为它揭示了"道"的奥秘，而是因为它承载了"地"的智慧。我们不是先知，我们是绘图师与航海者。
              对你（人）而言，平台是你的"生命实验室"；对知识（地）而言，平台是古老智慧的"活态翻译器"与"优化器"；对社区（共时之人）而言，平台是一个"共鸣网络"。
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 2 }}>
              知命为明，非为窥道，乃为明心。顺势而为，是学习在这张地图上，画出属于自己的航线。记录为契，是为航行留下永恒的日志。
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mt: 2 }}>
              明其心，知其地，行其路，续其明。
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* 其他核心概念 */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          其他核心概念
        </Typography>

        <Grid container spacing={3}>
          {/* 能量循环概念 */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  能量循环
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  生命能量需要在系统中循环流动。循环不畅可能影响整体状态，
                  可通过象征性连接来改善能量流通。
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 缺失元素概念 */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  缺失元素
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  每个人可能有相对较弱的能量类型。可通过自我感受初步判断，
                  不提供精确的量化分析。
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 外物连接概念 */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  外物连接
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  自然万物具有不同能量特质。通过与特定自然物建立象征性连接，
                  可以补充个人相对缺失的能量类型。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 免责声明 */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            重要说明
          </Typography>
          <Typography variant="body2" color="text.secondary">
            本平台提供的是基于传统文化智慧的象征性仪式，不涉及精确的命理分析和效果量化验证。
            建议将仪式视为个人成长和文化体验的一部分。
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Concept;
