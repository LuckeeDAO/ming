/**
 * 连接指导页面
 * 
 * 提供外物连接的选择指导，引导用户完成从能量分析到连接准备的完整流程：
 * - 步骤1：显示能量分析结果（使用EnergyAnalysisResult组件）
 * - 步骤2：展示推荐外物列表（简要信息）
 * - 步骤3：选择外物（使用ExternalObjectSelector组件）
 * - 步骤4：准备连接（展示连接方式和准备事项）
 * 
 * 功能说明：
 * - 集成能量分析结果展示
 * - 集成外物选择组件
 * - 提供连接方式指导
 * - 引导用户进入NFT仪式页面
 * 
 * @module pages/ConnectionGuide
 */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setSelectedObject } from '../../store/slices/energySlice';
import EnergyAnalysisResult from '../../components/energy/EnergyAnalysisResult';
import ExternalObjectSelector from '../../components/ceremony/ExternalObjectSelector';
import { energyAnalysisService } from '../../services/energy/energyAnalysisService';
import { externalObjectService } from '../../services/energy/externalObjectService';
import { setRecommendedObjects } from '../../store/slices/energySlice';
import { ExternalObject } from '../../types/energy';

/**
 * 连接指导页面组件
 */
const ConnectionGuide: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const { analysis, recommendedObjects, selectedObject } = useAppSelector(
    (state) => state.energy
  );

  const steps = ['能量分析', '外物推荐', '选择外物', '准备连接'];

  /**
   * 当分析结果变化时，自动推荐外物
   */
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (analysis && recommendedObjects.length === 0) {
        try {
          // 从服务获取外物列表
          const objects = await externalObjectService.getAvailableObjects();
          // 根据分析结果推荐外物
          const recommendations = energyAnalysisService.recommendObjects(analysis, objects);
          dispatch(setRecommendedObjects(recommendations));
        } catch (error) {
          console.error('获取外物推荐失败:', error);
        }
      }
    };
    
    fetchRecommendations();
  }, [analysis, recommendedObjects.length, dispatch]);

  /**
   * 处理下一步
   */
  const handleNext = () => {
    // 验证当前步骤
    if (activeStep === 2 && !selectedObject) {
      return; // 必须选择外物才能继续
    }

    if (activeStep === steps.length - 1) {
      // 最后一步：跳转到NFT仪式页面
      navigate('/nft-ceremony');
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  /**
   * 处理上一步
   */
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  /**
   * 处理外物选择
   * 
   * @param object - 选择的外物
   */
  const handleObjectSelect = (object: ExternalObject) => {
    dispatch(setSelectedObject(object));
  };


  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          连接指导
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          根据您的能量分析结果，选择合适的外物进行连接，完成改命仪式
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* 步骤内容 */}
        <Box sx={{ mt: 4 }}>
          {/* 步骤1：能量分析结果 */}
          {activeStep === 0 && (
            <Card>
              <CardContent>
                {analysis ? (
                  <EnergyAnalysisResult analysis={analysis} />
                ) : (
                  <Alert severity="info">
                    <Typography variant="body1" gutterBottom>
                      请先在「工具」中完成四柱转换和本命能量分析
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/tools')}
                      sx={{ mt: 2 }}
                    >
                      前往工具页面
                    </Button>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* 步骤2：外物推荐 */}
          {activeStep === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  推荐外物
                </Typography>
                {recommendedObjects.length > 0 ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      根据您的能量分析，以下外物适合您进行连接：
                    </Typography>
                    <Grid container spacing={2}>
                      {recommendedObjects.map((obj) => (
                        <Grid item xs={12} sm={6} md={4} key={obj.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  mb: 1,
                                }}
                              >
                                <Typography variant="h6">{obj.name}</Typography>
                                <Chip
                                  label={
                                    obj.element === 'wood'
                                      ? '木'
                                      : obj.element === 'fire'
                                      ? '火'
                                      : obj.element === 'earth'
                                      ? '土'
                                      : obj.element === 'metal'
                                      ? '金'
                                      : '水'
                                  }
                                  size="small"
                                  color={
                                    obj.element === 'wood'
                                      ? 'success'
                                      : obj.element === 'fire'
                                      ? 'error'
                                      : obj.element === 'earth'
                                      ? 'warning'
                                      : obj.element === 'metal'
                                      ? 'info'
                                      : 'default'
                                  }
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {obj.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Alert severity="info">
                    <Typography variant="body2">
                      暂无推荐外物。请先完成能量分析，或切换到“仪式资源”标签页了解更多外物选择。
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* 步骤3：选择外物 */}
          {activeStep === 2 && (
            <Card>
              <CardContent>
                {recommendedObjects.length > 0 ? (
                  <ExternalObjectSelector
                    objects={recommendedObjects}
                    selectedObjectId={selectedObject?.id}
                    onSelect={handleObjectSelect}
                  />
                ) : (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      暂无推荐外物，请先完成能量分析。
                    </Typography>
                  </Alert>
                )}
                {selectedObject && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      已选择：{selectedObject.name}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* 步骤4：准备连接 */}
          {activeStep === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  准备连接
                </Typography>
                {selectedObject ? (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body1" gutterBottom>
                        您已选择：{selectedObject.name}
                      </Typography>
                      <Typography variant="body2">
                        {selectedObject.description}
                      </Typography>
                    </Alert>

                    {/* 连接方式 */}
                    {selectedObject.connectionMethods &&
                      selectedObject.connectionMethods.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            连接方式
                          </Typography>
                          <List>
                            {selectedObject.connectionMethods.map((method, index) => (
                              <ListItem key={index} divider>
                                <ListItemText
                                  primary={
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                      }}
                                    >
                                      <Typography variant="body1" fontWeight="bold">
                                        {method.name}
                                      </Typography>
                                      <Chip
                                        label={method.difficulty}
                                        size="small"
                                        color={
                                          method.difficulty === 'easy'
                                            ? 'success'
                                            : method.difficulty === 'medium'
                                            ? 'warning'
                                            : 'error'
                                        }
                                      />
                                      <Chip
                                        label={method.estimatedTime}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="body2" paragraph>
                                        {method.description}
                                      </Typography>
                                      {method.steps && method.steps.length > 0 && (
                                        <Box>
                                          <Typography variant="caption" fontWeight="bold">
                                            步骤：
                                          </Typography>
                                          <List dense>
                                            {method.steps.map((step, stepIndex) => (
                                              <ListItem key={stepIndex}>
                                                <ListItemText
                                                  primary={`${step.order}. ${step.title}`}
                                                  secondary={step.description}
                                                />
                                              </ListItem>
                                            ))}
                                          </List>
                                        </Box>
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                    {/* 准备事项 */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        准备事项
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="1. 选择合适的时间和地点"
                            secondary="选择一个安静、舒适的环境，确保有足够的时间完成仪式"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="2. 准备必要的材料"
                            secondary="根据选择的连接方式，准备相应的材料"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="3. 调整心态"
                            secondary="保持开放和专注的心态，准备好与外物建立连接"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="4. 准备记录工具"
                            secondary="准备相机或手机，记录仪式过程，用于NFT铸造"
                          />
                        </ListItem>
                      </List>
                    </Box>

                    {/* 下一步提示 */}
                    <Alert severity="success">
                      <Typography variant="body1" gutterBottom>
                        准备完成！
                      </Typography>
                      <Typography variant="body2">
                        完成连接仪式后，您可以前往NFT仪式页面铸造NFT，作为能量场见证。
                      </Typography>
                    </Alert>
                  </Box>
                ) : (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      请先选择外物，然后才能进行连接准备。
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Box>

        {/* 导航按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            上一步
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              activeStep === steps.length - 1
                ? false
                : activeStep === 2 && !selectedObject
            }
          >
            {activeStep === steps.length - 1 ? '前往NFT仪式' : '下一步'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ConnectionGuide;
