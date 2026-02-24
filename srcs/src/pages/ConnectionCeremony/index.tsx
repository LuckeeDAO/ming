/**
 * 外物连接仪式页面（统一页面）
 * 
 * 整合了连接指导、NFT仪式、定时MINT、仪式资源四个功能的完整页面：
 * 
 * 标签页1 - 仪式流程：
 * 1. 能量分析：显示能量分析结果
 * 2. 外物推荐：展示推荐外物列表
 * 3. 选择外物：选择要连接的外物
 * 4. 准备连接：展示连接方式和准备事项
 * 5. 内容创建：上传图片、填写连接信息
 * 6. 铸造阶段：选择立即/定时铸造，执行铸造流程
 * 7. 完成阶段：确认信息、记录感受
 * 
 * 标签页2 - 定时任务管理：查看和管理定时MINT任务
 * 
 * 标签页3 - 仪式资源：获取仪式指南、素材和文化知识
 * 
 * 功能说明：
 * - 集成能量分析结果展示
 * - 集成外物选择组件
 * - 支持图片上传到IPFS（方案A：Ming平台完成）
 * - 生成NFT元数据
 * - 生成共识哈希
 * - 调用钱包接口铸造NFT（钱包负责合约调用）
 * - 支持立即铸造和定时铸造
 * - 定时任务管理功能
 * 
 * 注意：合约调用已迁移到钱包，本页面只负责准备数据和调用钱包接口
 * 
 * @module pages/ConnectionCeremony
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  CardActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { ethers } from 'ethers';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setSelectedObject, setRecommendedObjects } from '../../store/slices/energySlice';
import { ceremonyResourcesService } from '../../services/ceremony/ceremonyResourcesService';
import { ExternalObject } from '../../types/energy';
import { ipfsService } from '../../services/ipfs/ipfsService';
import { walletService } from '../../services/wallet/walletService';
import { mingWalletInterface } from '../../services/wallet/mingWalletInterface';
import {
  scheduledMintService,
  ScheduledMintTask,
  ScheduledMintTaskStatus,
} from '../../services/scheduledMint/scheduledMintService';
import EnergyAnalysisResult from '../../components/energy/EnergyAnalysisResult';
import ExternalObjectSelector from '../../components/ceremony/ExternalObjectSelector';
import DateTimePicker from '../../components/ceremony/DateTimePicker';
import { energyAnalysisService } from '../../services/energy/energyAnalysisService';
import { externalObjectService } from '../../services/energy/externalObjectService';
import { formatDate } from '../../utils/format';

/**
 * NFT铸造表单数据接口
 */
interface MintFormData {
  selectedObject: ExternalObject | null;
  image: File | null;
  imagePreview: string | null;
  connectionType: string;
  location?: string;
  duration?: string;
  blessing: string; // 祝福/祝愿文本
  feelingsBefore: string;
  feelingsDuring: string;
  feelingsAfter: string;
  scheduledTime: string | null; // 定时MINT时间（ISO格式）
}

/**
 * 任务状态颜色映射
 */
const statusColors: Record<ScheduledMintTaskStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  pending: 'primary',
  processing: 'warning',
  completed: 'success',
  failed: 'error',
  cancelled: 'default',
};

/**
 * 任务状态文本映射
 */
const statusTexts: Record<ScheduledMintTaskStatus, string> = {
  pending: '待执行',
  processing: '执行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
};

/**
 * 外物连接仪式页面组件
 */
const ConnectionCeremony: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { analysis, recommendedObjects, selectedObject } = useAppSelector(
    (state) => state.energy
  );
  const { address: walletAddress } = useAppSelector((state) => state.wallet);

  // 主流程步骤
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<MintFormData>({
    selectedObject: null,
    image: null,
    imagePreview: null,
    connectionType: 'symbolic',
    blessing: '',
    feelingsBefore: '',
    feelingsDuring: '',
    feelingsAfter: '',
    scheduledTime: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [mintType, setMintType] = useState<'immediate' | 'scheduled'>('immediate');
  const [mintResult, setMintResult] = useState<{
    tokenId: string;
    txHash: string;
    tokenURI: string;
  } | null>(null);

  // 定时任务管理
  const [tasks, setTasks] = useState<ScheduledMintTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ScheduledMintTask | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // 从URL query参数读取tab，如果没有或非法则默认为0
  const tabFromUrl = searchParams.get('tab');
  const parsedInitialTab = tabFromUrl ? parseInt(tabFromUrl, 10) : 0;
  const initialTab =
    !isNaN(parsedInitialTab) && parsedInitialTab >= 0 && parsedInitialTab <= 2
      ? parsedInitialTab
      : 0;
  const [activeTab, setActiveTab] = useState(initialTab); // 0: 仪式流程, 1: 定时任务管理, 2: 仪式资源

  // 当URL query参数变化时，更新activeTab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl !== null) {
      const tabValue = parseInt(tabFromUrl, 10);
      if (!isNaN(tabValue) && tabValue >= 0 && tabValue <= 2) {
        setActiveTab(tabValue);
      } else {
        setActiveTab(0);
      }
    } else {
      setActiveTab(0);
    }
  }, [searchParams]);

  /**
   * 切换顶部标签页并同步到URL
   */
  const handleTabChange = (_event: React.SyntheticEvent, newTab: number) => {
    setActiveTab(newTab);
    navigate(`/connection-ceremony?tab=${newTab}`);
  };

  // 统一流程步骤
  const steps = [
    '能量分析',
    '外物推荐',
    '选择外物',
    '准备连接',
    '内容创建',
    '铸造阶段',
    '完成阶段',
  ];

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
   * 从Redux状态同步选中的外物到表单数据
   */
  useEffect(() => {
    if (selectedObject) {
      setFormData((prev) => ({ ...prev, selectedObject }));
    }
  }, [selectedObject]);

  /**
   * 加载定时任务列表
   */
  const loadTasks = useCallback(async () => {
    if (!walletAddress) {
      setTasks([]);
      return;
    }
    
    try {
      // 从钱包查询任务列表
      const userTasks = await scheduledMintService.getTasksByWallet(walletAddress);
      // 按创建时间倒序排列
      userTasks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading scheduled tasks:', error);
      // 如果钱包接口未实现，显示空列表
      setTasks([]);
    }
  }, [walletAddress]);

  /**
   * 组件挂载时加载任务列表
   */
  useEffect(() => {
    loadTasks();
    
    // 设置定时刷新（每30秒）
    const refreshInterval = setInterval(() => {
      loadTasks();
    }, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [loadTasks]);

  /**
   * 处理外物选择
   * 
   * @param object - 选择的外物
   */
  const handleObjectSelect = useCallback((object: ExternalObject) => {
    dispatch(setSelectedObject(object));
    setFormData((prev) => ({ ...prev, selectedObject: object }));
  }, [dispatch]);

  /**
   * 处理图片选择
   * 
   * @param event - 文件输入事件
   */
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件');
        return;
      }
      // 验证文件大小（限制为10MB）
      if (file.size > 10 * 1024 * 1024) {
        setError('图片大小不能超过10MB');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
      setError('');
    }
  };

  /**
   * 处理表单字段变化
   * 
   * @param field - 字段名
   * @param value - 字段值
   */
  const handleFieldChange = (field: keyof MintFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * 验证当前步骤
   * 
   * @param step - 步骤索引
   * @returns 是否通过验证
   */
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 2:
        // 选择外物：必须选择外物
        if (!formData.selectedObject) {
          setError('请先选择外物');
          return false;
        }
        return true;
      case 4:
        // 内容创建：必须上传图片
        if (!formData.image) {
          setError('请上传仪式图片');
          return false;
        }
        return true;
      case 5:
        // 铸造阶段：需要钱包连接
        if (!walletAddress) {
          setError('请先连接钱包');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  /**
   * 处理下一步
   */
  const handleNext = () => {
    // 验证当前步骤
    if (!validateStep(activeStep)) {
      return;
    }

    // 如果是铸造阶段，执行铸造流程
    if (activeStep === 5) {
      handleMint();
      return;
    }

    setActiveStep((prev) => prev + 1);
    setError('');
  };

  /**
   * 处理上一步
   */
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  /**
   * 执行NFT铸造流程
   * 
   * 流程：
   * 1. 如果是定时铸造，创建定时任务
   * 2. 如果是立即铸造：
   *    a. 上传图片到IPFS
   *    b. 生成NFT元数据
   *    c. 上传元数据到IPFS
   *    d. 生成共识哈希
   *    e. 调用钱包接口铸造NFT
   */
  const handleMint = async () => {
    if (!formData.selectedObject || !formData.image || !walletAddress) {
      setError('请完成所有必填项');
      return;
    }

    // 如果是定时铸造，验证定时时间
    if (mintType === 'scheduled') {
      if (!formData.scheduledTime) {
        setError('请选择定时执行时间');
        return;
      }
      const scheduledTime = new Date(formData.scheduledTime);
      const now = new Date();
      if (scheduledTime <= now) {
        setError('定时时间必须是未来的时间');
        return;
      }
    }

    setIsProcessing(true);
    setError('');

    try {
      // 方案A：Ming平台完成IPFS上传和共识哈希生成
      // 1. 上传图片到IPFS
      const imageHash = await ipfsService.uploadFile(formData.image);
      const imageURI = ipfsService.getAccessUrl(imageHash);

      // 2. 生成NFT元数据
      const metadata = {
        name: `外物连接 - ${formData.selectedObject.name}`,
        description: `与${formData.selectedObject.name}的连接仪式见证`,
        image: imageURI,
        attributes: [
          { trait_type: '外物', value: formData.selectedObject.name },
          { trait_type: '五行属性', value: formData.selectedObject.element },
          { trait_type: '连接类型', value: formData.connectionType },
        ],
        connection: {
          externalObjectId: formData.selectedObject.id,
          externalObjectName: formData.selectedObject.name,
          element: formData.selectedObject.element,
          connectionType: formData.connectionType,
          connectionDate: new Date().toISOString(),
        },
        ceremony: {
          location: formData.location,
          duration: formData.duration,
        },
        feelings: {
          before: formData.feelingsBefore,
          during: formData.feelingsDuring,
          after: formData.feelingsAfter,
        },
        // 添加祝福文本（如果有）
        ...(formData.blessing && {
          blessing: {
            text: formData.blessing,
            timestamp: new Date().toISOString(),
          },
        }),
        // 添加定时MINT信息（如果是定时任务）
        ...(formData.scheduledTime && {
          scheduledMint: {
            scheduledTime: formData.scheduledTime,
          },
        }),
        energyField: {
          consensusHash: '', // 将在生成共识哈希后更新
        },
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          platform: 'ming',
        },
      };

      // 3. 上传元数据到IPFS
      const metadataHash = await ipfsService.uploadJSON(metadata);
      const tokenURI = ipfsService.getAccessUrl(metadataHash);

      // 4. 生成共识哈希（使用keccak256哈希函数处理元数据哈希）
      // 注意：IPFS哈希不是16进制字符串，需要使用keccak256进行哈希处理
      const consensusHash = ethers.keccak256(ethers.toUtf8Bytes(metadataHash));

      // 5. 获取合约配置
      const chainId = await walletService.getNetworkId();
      const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
      
      // 验证合约地址配置
      if (!contractAddress) {
        throw new Error('NFT合约地址未配置，请检查环境变量VITE_NFT_CONTRACT_ADDRESS');
      }
      
      // 验证合约地址格式
      if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        throw new Error('NFT合约地址格式无效');
      }

      // 6. 根据铸造类型选择处理方式
      if (mintType === 'scheduled') {
        // 定时铸造：调用钱包接口创建定时任务
        const taskResponse = await mingWalletInterface.createScheduledTask({
          scheduledTime: formData.scheduledTime!,
          ipfs: {
            imageHash,
            metadataHash,
            imageURI,
            tokenURI,
          },
          consensusHash,
          contract: {
            address: contractAddress,
            chainId,
          },
          params: {
            to: walletAddress,
            tokenURI,
            externalObjectId: formData.selectedObject.id,
            element: formData.selectedObject.element,
            consensusHash,
          },
        });

        if (!taskResponse.success) {
          throw new Error(taskResponse.error?.message || '创建定时任务失败');
        }

        // 刷新任务列表
        await loadTasks();

        // 进入完成阶段
        setActiveStep(6);
        setMintResult({
          tokenId: '',
          txHash: '',
          tokenURI,
        });
      } else {
        // 立即铸造：调用钱包接口铸造NFT
        const mintResponse = await mingWalletInterface.mintNFT({
          ipfs: {
            imageHash,
            metadataHash,
            imageURI,
            tokenURI,
          },
          consensusHash,
          contract: {
            address: contractAddress,
            chainId,
          },
          params: {
            to: walletAddress,
            tokenURI,
            externalObjectId: formData.selectedObject.id,
            element: formData.selectedObject.element,
            consensusHash,
          },
        });

        if (!mintResponse.success || !mintResponse.data) {
          throw new Error(mintResponse.error?.message || 'NFT铸造失败');
        }

        setMintResult({
          tokenId: mintResponse.data.tokenId,
          txHash: mintResponse.data.txHash,
          tokenURI,
        });

        // 进入完成阶段
        setActiveStep(6);
      }
    } catch (error) {
      console.error('NFT铸造失败:', error);
      setError(
        error instanceof Error ? error.message : 'NFT铸造失败，请重试'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 打开任务详情对话框
   * 
   * @param task - 任务对象
   */
  const handleViewDetail = (task: ScheduledMintTask) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  /**
   * 打开删除确认对话框
   * 
   * @param taskId - 任务ID
   */
  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  /**
   * 确认删除任务（调用钱包接口取消）
   */
  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await scheduledMintService.cancelTask(taskToDelete);
        await loadTasks();
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        console.error('Error canceling task:', error);
        setError('取消任务失败，请重试');
      }
    }
  };

  /**
   * 取消任务（调用钱包接口）
   * 
   * @param taskId - 任务ID
   */
  const handleCancelTask = async (taskId: string) => {
    try {
      await scheduledMintService.cancelTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error canceling task:', error);
      setError('取消任务失败，请重试');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'left' }}>
            外物连接仪式
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ textAlign: 'left' }}>
            完成从能量分析到NFT铸造的完整外物连接仪式流程
          </Typography>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="仪式流程" />
            <Tab label="定时任务管理" />
            <Tab label="仪式资源" />
          </Tabs>
        </Box>

        {/* 内容区域 */}
        <Box>
            {/* 主流程标签页 */}
            {activeTab === 0 && (
              <>
                <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* 步骤内容 */}
            <Box sx={{ mt: 4 }}>
              <Card>
                <CardContent>
                  {/* 步骤1：能量分析结果 */}
                  {activeStep === 0 && (
                    <Box>
                      {analysis ? (
                        <EnergyAnalysisResult analysis={analysis} />
                      ) : (
                        <Alert severity="info">
                          <Typography variant="body1" gutterBottom>
                            请先完成四柱八字分析
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => navigate('/four-pillars')}
                            sx={{ mt: 2 }}
                          >
                            前往生辰 & 四柱转换页面
                          </Button>
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* 步骤2：外物推荐 */}
                  {activeStep === 1 && (
                    <Box>
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
                    </Box>
                  )}

                  {/* 步骤3：选择外物 */}
                  {activeStep === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        选择外物
                      </Typography>
                      {recommendedObjects.length > 0 ? (
                        <ExternalObjectSelector
                          objects={recommendedObjects}
                          selectedObjectId={formData.selectedObject?.id}
                          onSelect={handleObjectSelect}
                        />
                      ) : (
                        <Alert severity="warning">
                          <Typography variant="body2">
                            暂无推荐外物，请先完成能量分析。
                          </Typography>
                        </Alert>
                      )}
                      {formData.selectedObject && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            已选择：{formData.selectedObject.name}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* 步骤4：准备连接 */}
                  {activeStep === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        准备连接
                      </Typography>
                      {formData.selectedObject ? (
                        <Box>
                          <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body1" gutterBottom>
                              您已选择：{formData.selectedObject.name}
                            </Typography>
                            <Typography variant="body2">
                              {formData.selectedObject.description}
                            </Typography>
                          </Alert>

                          {/* 连接方式 */}
                          {formData.selectedObject.connectionMethods &&
                            formData.selectedObject.connectionMethods.length > 0 && (
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                  连接方式
                                </Typography>
                                <List>
                                  {formData.selectedObject.connectionMethods.map((method, index) => (
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
                        </Box>
                      ) : (
                        <Alert severity="warning">
                          <Typography variant="body2">
                            请先选择外物，然后才能进行连接准备。
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* 步骤5：内容创建 */}
                  {activeStep === 4 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        内容创建
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              上传仪式图片
                            </Typography>
                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id="image-upload"
                              type="file"
                              onChange={handleImageSelect}
                            />
                            <label htmlFor="image-upload">
                              <Button variant="outlined" component="span" fullWidth>
                                选择图片
                              </Button>
                            </label>
                            {formData.imagePreview && (
                              <Box
                                component="img"
                                src={formData.imagePreview}
                                alt="预览"
                                sx={{
                                  width: '100%',
                                  maxHeight: 300,
                                  objectFit: 'contain',
                                  mt: 2,
                                }}
                              />
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="连接类型"
                            select
                            SelectProps={{ native: true }}
                            value={formData.connectionType}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleFieldChange('connectionType', e.target.value)
                            }
                          >
                            <option value="symbolic">象征性连接</option>
                            <option value="experiential">体验性连接</option>
                            <option value="deep">深度连接</option>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="地点（可选）"
                            value={formData.location || ''}
                            onChange={(e) =>
                              handleFieldChange('location', e.target.value)
                            }
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="祝福/祝愿文本"
                            value={formData.blessing}
                            onChange={(e) =>
                              handleFieldChange('blessing', e.target.value)
                            }
                            placeholder="写下你的祝福或祝愿（最多500字）..."
                            inputProps={{ maxLength: 500 }}
                            helperText={`${formData.blessing.length}/500`}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="连接前的感受"
                            value={formData.feelingsBefore}
                            onChange={(e) =>
                              handleFieldChange('feelingsBefore', e.target.value)
                            }
                            placeholder="描述连接前的感受和期待..."
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* 步骤6：铸造阶段 */}
                  {activeStep === 5 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        铸造阶段
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        选择立即铸造或定时铸造
                      </Typography>
                      
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="铸造方式"
                            select
                            SelectProps={{ native: true }}
                            value={mintType}
                            onChange={(e) => setMintType(e.target.value as 'immediate' | 'scheduled')}
                          >
                            <option value="immediate">立即铸造</option>
                            <option value="scheduled">定时铸造</option>
                          </TextField>
                        </Grid>
                        
                        {mintType === 'scheduled' && (
                          <Grid item xs={12}>
                            <DateTimePicker
                              value={formData.scheduledTime}
                              onChange={(value) => handleFieldChange('scheduledTime', value)}
                              label="选择定时执行时间"
                              minDateTime={new Date().toISOString()}
                            />
                          </Grid>
                        )}
                      </Grid>
                      
                      {isProcessing ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <CircularProgress />
                          <Typography variant="body2" sx={{ mt: 2 }}>
                            {mintType === 'immediate' 
                              ? '正在铸造NFT，请稍候...' 
                              : '正在创建定时任务，请稍候...'}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ mt: 2 }}>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            请确认以下信息：
                            <ul>
                              <li>外物：{formData.selectedObject?.name}</li>
                              <li>连接类型：{formData.connectionType}</li>
                              <li>图片已上传</li>
                              {mintType === 'scheduled' && formData.scheduledTime && (
                                <li>定时时间：{new Date(formData.scheduledTime).toLocaleString('zh-CN')}</li>
                              )}
                            </ul>
                          </Alert>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* 步骤7：完成阶段 */}
                  {activeStep === 6 && mintResult && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        完成阶段
                      </Typography>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {mintType === 'immediate' ? 'NFT铸造成功！' : '定时任务创建成功！'}
                      </Alert>
                      {mintType === 'immediate' && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            Token ID: {mintResult.tokenId}
                          </Typography>
                          <Typography variant="body2">
                            交易哈希: {mintResult.txHash}
                          </Typography>
                          <Typography variant="body2">
                            Token URI: {mintResult.tokenURI}
                          </Typography>
                        </Box>
                      )}
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="连接中的感受"
                            value={formData.feelingsDuring}
                            onChange={(e) =>
                              handleFieldChange('feelingsDuring', e.target.value)
                            }
                            placeholder="描述连接过程中的感受..."
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="连接后的感受"
                            value={formData.feelingsAfter}
                            onChange={(e) =>
                              handleFieldChange('feelingsAfter', e.target.value)
                            }
                            placeholder="描述连接后的感受和变化..."
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* 导航按钮 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                disabled={activeStep === 0 || isProcessing}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                上一步
              </Button>
              {activeStep < steps.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isProcessing}
                >
                  {activeStep === 5 ? '开始铸造' : '下一步'}
                </Button>
              )}
            </Box>
            </>
            )}

            {/* 定时任务管理标签页 */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  定时MINT任务
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  管理你的定时NFT铸造任务
                </Typography>

                {!walletAddress ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    请先连接钱包以查看定时MINT任务
                  </Alert>
                ) : tasks.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    暂无定时MINT任务
                  </Alert>
                ) : (
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                {tasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} key={task.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" component="div">
                            {task.selectedObject.name}
                          </Typography>
                          <Chip
                            label={statusTexts[task.status]}
                            color={statusColors[task.status]}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          定时时间：{formatDate(new Date(task.scheduledTime), 'YYYY-MM-DD HH:mm')}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          创建时间：{formatDate(new Date(task.createdAt), 'YYYY-MM-DD HH:mm')}
                        </Typography>
                        
                        {task.mintedAt && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            执行时间：{formatDate(new Date(task.mintedAt), 'YYYY-MM-DD HH:mm')}
                          </Typography>
                        )}
                        
                        {task.tokenId && (
                          <Typography variant="body2" color="success.main" gutterBottom>
                            Token ID: {task.tokenId}
                          </Typography>
                        )}
                        
                        {task.error && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            {task.error}
                          </Alert>
                        )}
                        
                        {task.status === 'processing' && (
                          <LinearProgress sx={{ mt: 2 }} />
                        )}
                      </CardContent>
                      
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetail(task)}
                        >
                          查看详情
                        </Button>
                        
                        {task.status === 'pending' && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancelTask(task.id)}
                          >
                            取消
                          </Button>
                        )}
                        
                        {task.status !== 'processing' && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(task.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* 仪式资源标签页 */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  仪式资源
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  获取仪式指南、素材与知识库：把“地”的工具（含时间/节律）转化为可执行的仪式步骤，并沉淀为可复盘的记录。
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Button size="small" onClick={() => navigate('/about/philosophy')}>
                    先读哲学理念（天/道/地/人/时）
                  </Button>
                </Box>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                  {ceremonyResourcesService.getAllResources().map((resource) => (
                    <Grid item xs={12} sm={6} md={4} key={resource.id}>
                      <Card
                        sx={{
                          height: '100%',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                        }}
                      >
                        <CardContent>
                          <Typography variant="overline" color="text.secondary">
                            {resource.category}
                          </Typography>
                          <Typography variant="h6" gutterBottom>
                            {resource.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {resource.description}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            onClick={() => navigate(resource.route)}
                          >
                            查看详情
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
        </Box>
      </Box>

      {/* 任务详情对话框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>任务详情</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                外物：{selectedTask.selectedObject.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                五行属性：{selectedTask.selectedObject.element}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                连接类型：{selectedTask.connectionType}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                定时时间：{formatDate(new Date(selectedTask.scheduledTime))}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                创建时间：{formatDate(new Date(selectedTask.createdAt))}
              </Typography>
              {selectedTask.blessing && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    祝福文本：
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTask.blessing}
                  </Typography>
                </Box>
              )}
              {selectedTask.txHash && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    交易哈希：
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTask.txHash}
                  </Typography>
                </Box>
              )}
              {selectedTask.tokenURI && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Token URI：
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTask.tokenURI}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除这个任务吗？此操作不可恢复。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConnectionCeremony;
