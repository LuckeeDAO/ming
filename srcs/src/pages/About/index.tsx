/**
 * 关于页面
 * 
 * 介绍平台的基本信息：
 * - 平台介绍
 * - 哲学理念
 * 
 * 路由：
 * - /about/intro - 平台介绍
 * - /about/philosophy - 哲学理念
 */
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Chip,
  useTheme,
} from '@mui/material';
import { useLocation } from 'react-router-dom';

const About: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();

  // 根据路由显示不同内容
  const isIntro = location.pathname === '/about/intro' || location.pathname === '/about';
  const isPhilosophy = location.pathname === '/about/philosophy';

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {isIntro && (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              平台介绍
            </Typography>

            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  平台定位
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Ming（明命）是一个以“道不可尽知、地为工具、人为主体、时为地之用”为内核的 Web3 仪式平台。
                  知命为明，非为窥道，乃为明心。
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  那驱动日月星辰的终极法则（“道”），或许永远超出人类认知的边界；但人类从未因此停下脚步，而是持续编织出一张名为“地”的知识之网。
                  时间（生辰、节气、择时）是“地”的关键工具维度，社会学、心理学等解释性理论也同样属于“地”的工具谱系。
                  Ming 不宣称给出关于“命运是什么”的答案，而是精选并数字化这张知识之网中的一套深邃而自洽的系统。
                  我们不是先知，而更像绘图师与航海者：通过可编程的仪式 NFT，将东方命理智慧转化为清晰、友好的数字工具，
                  帮助用户在这张地图上画出属于自己的航线——以共识为桥，以仪式为媒，在实践中疏通与升华自己的生命轨迹。
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  平台内核
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  基于四柱八字五行生克理论，以 NFT 为能量见证载体，融合链上可验证仪式与集体意识共识机制，
                  构建"命理－共识－仪式"三元闭环。Ming 承载"地"的智慧——人类共同编织的知识之网——
                  通过三元闭环实现个人与自然、社会的和谐共振。我们不是先知，我们是绘图师与航海者。
                </Typography>

                <Card
                  sx={{
                    mt: 3,
                    mb: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        textAlign: 'center',
                        mb: 3
                      }}
                    >
                      构建"命理－共识－仪式"三元闭环
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Chip 
                            label="命理" 
                            color="primary" 
                            sx={{ mb: 2, fontSize: '0.9rem', py: 2, px: 2 }}
                          />
                          <Typography variant="body2" color="text.secondary">
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
                            sx={{ mb: 2, fontSize: '0.9rem', py: 2, px: 2 }}
                          />
                          <Typography variant="body2" color="text.secondary">
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
                            sx={{ mb: 2, fontSize: '0.9rem', py: 2, px: 2 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            可编程的仪式 NFT 与链上契约，把策略落到行动与记录；“择时”作为时间工具常被用于让行动更可执行、更可复盘。
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  核心主张
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • <strong>知命为明，非为窥道，乃为明心</strong>：我们不声称揭示"道"的奥秘，而是承载"地"的智慧。通过人道的力量与共识的能量，在这张知识地图上达成生命的疏通与升华
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • <strong>共识即能量，仪式即通道</strong>：人类共识是我们可以共同构建、共同引导的能量，是社会规律的重要组成部分。通过链上仪式，将个人命理调理融入群体共同参与的仪式场中，形成个人与自然规律、社会规律的共振与循环
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • <strong>以人合天，以链载愿</strong>：通过 Web3 技术与区块链共识，将传统命理智慧与现代技术结合，以可编程的仪式 NFT 承载祈愿，实现个人与自然规律、社会规律的和谐共续
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  体验形态
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  用户通过完成对应五行、节气、星宿的链上仪式，铸造专属能量 NFT，同时接入相应共识池，在时间中不断累积实践记录，形成个人与集体能量场的共振与循环。
                </Typography>
              </CardContent>
            </Card>
          </>
        )}

        {isPhilosophy && (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              哲学理念
            </Typography>

            {/* 天与道、地与共识的哲学区分 */}
            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                天与道、地与共识的哲学区分
              </Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>天</strong>：现实本身（客体）。它可被观察其“象”，但不可被主体穷尽其“体”。<br />
                    <strong>道</strong>：天之所以然。道在终极意义上不可尽知，但可通过可观测现象被主体谨慎逼近。Ming 不提供关于“道”的终极答案。
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
                </CardContent>
              </Card>
            </Box>

            {/* 三才框架 */}
            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                三才框架：天、地、人的认知三界
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
                天垂象，地载文，人观时以通神明。
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
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
                        天是现实本身（客体）：可观其“象”，不可穷尽其“体”。道为天之所以然，不可尽知但可被谨慎逼近。
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
                      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, opacity: 0.9 }}>
                        人类为理解"天"所构建的全部知识、理论与符号系统
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        地是人类的逻辑知识与工具箱：强共识工具与解释性工具皆属其内；并包含时间工具维度（生辰/节气/择时）。它依赖共识而成立，也因此可修正。
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
                      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2, opacity: 0.9 }}>
                        作为认知与实践主体的"我"
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        人具主体/客体双重性：作为主体运用“地”进行判断与行动，也可推动共识工具演化；作为客体属于“天”，并有其内在秩序（可称个体之道）。
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mt: 3 }}>
                <CardContent>
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
                </CardContent>
              </Card>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default About;
