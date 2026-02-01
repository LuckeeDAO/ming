/**
 * 首页组件
 * 
 * 整合了以下内容（按顺序）：
 * - Hero 区域（平台介绍与核心理念）
 * - 平台内核（三元闭环）
 * - 核心主张
 * - 体验形态
 * - 开始处理区域
 * 
 * 采用滚动式布局，用户可以在一个页面中浏览所有信息
 */
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  useTheme,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero 区域 - 第一部分 */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 8, md: 12 },
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
            Ming (命/明)
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            color="text.secondary"
            gutterBottom
            sx={{ mt: 2, fontWeight: 400 }}
          >
            基于东方命理哲学与集体意识共识的 Web3 仪式平台
          </Typography>
          
          <Box sx={{ mt: 6, mb: 4, maxWidth: '800px', mx: 'auto' }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ 
                fontSize: '1.1rem',
                lineHeight: 1.8,
                fontStyle: 'italic',
                mb: 3
              }}
            >
              我们相信，天命有其轨迹，而人道有其力量。
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
              在天地人的框架中，人类共识是我们可以共同构建、共同引导的能量。
              因此，Ming 通过可编程的仪式 NFT 与链上契约，将个人命理调理融入群体共同参与的仪式场中，
              帮助用户在顺应天道的基础上，以共识为桥，以仪式为媒，达成生命的疏通与升华。
            </Typography>
          </Box>

          <Box sx={{ mt: 5, mb: 4 }}>
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 500,
                color: theme.palette.primary.main,
                mb: 2
              }}
            >
              我们不止于预测，更致力于构建一种人与命运共修的新范式
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: 'italic' }}
            >
              在这里，每一次 mint、每一次祈愿、每一次共识的达成，都是对自我命途的一次温和修正与能量加冕。
            </Typography>
          </Box>

          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h5"
              sx={{ 
                fontWeight: 500,
                letterSpacing: '0.1em',
                mb: 1
              }}
            >
              明其命，修其明。
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                fontWeight: 400,
                letterSpacing: '0.1em'
              }}
            >
              共识成仪，天人共续。
            </Typography>
          </Box>
        </Container>
      </Box>

      <Divider sx={{ my: 0 }} />

      {/* 平台内核区域 - 第二部分 */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            平台内核
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
            基于四柱八字五行生克理论，以 NFT 为能量见证载体，融合链上可验证仪式与集体意识共识机制
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
                    基于四柱八字五行生克理论，分析个人能量系统与循环状态
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
                    集体意识共识机制，形成个人与集体能量场的共振与循环
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
                    可编程的仪式 NFT 与链上契约，将个人命理调理融入群体仪式场
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      <Divider sx={{ my: 0 }} />

      {/* 核心主张区域 - 第三部分 */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
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
                  天命不可违，但人道可通
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  在顺应天道的基础上，通过人道的力量与共识的能量，达成生命的疏通与升华。
                  我们尊重天命轨迹，同时相信人道有其力量。
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
                  人类共识是我们可以共同构建、共同引导的能量。通过链上仪式，
                  将个人命理调理融入群体共同参与的仪式场中，形成能量共振。
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
                  以可编程的仪式 NFT 承载祈愿，实现天人共续。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Divider sx={{ my: 0 }} />

      {/* 体验形态区域 - 第四部分 */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            体验形态
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
            用户通过完成对应五行、节气、星宿的链上仪式，铸造专属能量 NFT，同时接入相应共识池
          </Typography>
        </Box>

        <Card
          sx={{
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
                    • <strong>五行仪式</strong>：根据个人能量缺失，完成对应五行的链上仪式
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    • <strong>节气共鸣</strong>：在特定节气时刻，参与集体共识仪式
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    • <strong>星宿连接</strong>：通过星宿能量，建立个人与宇宙的连接
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8, mt: 2 }}>
                    • <strong>能量 NFT</strong>：每次仪式铸造专属 NFT，作为能量场见证
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                    • <strong>共识池</strong>：接入相应共识池，形成个人与集体能量场的共振
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
      </Container>

      <Divider sx={{ my: 0 }} />

      {/* 技术架构区域 - 第五部分 */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            技术架构
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  区块链
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avalanche 链，提供快速、低成本的链上交互体验
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
                  存储
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  IPFS + 本地存储，确保数据去中心化与可访问性
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
                  支持 Web3 钱包连接与链上交互
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Divider sx={{ my: 0 }} />

      {/* 行动号召区域 */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mb: 3 }}
          >
            开始你的仪式之旅
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 2, mb: 5, maxWidth: '600px', mx: 'auto', lineHeight: 1.8 }}
          >
            连接钱包，输入四柱八字，系统将分析你的能量循环，推荐合适的外物连接。
            完成仪式后铸造专属能量 NFT，接入共识池，形成个人与集体能量场的共振。
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/connection-ceremony"
              sx={{ 
                px: 6, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 500,
                textTransform: 'none',
              }}
            >
              开始连接
            </Button>
          </Box>
        </Container>
      </Box>

      <Divider sx={{ my: 0 }} />

      {/* 重要说明区域 - 最后部分 */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
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
      </Container>
    </Box>
  );
};

export default Home;
