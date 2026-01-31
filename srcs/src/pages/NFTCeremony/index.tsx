/**
 * NFT 仪式页面
 * 
 * 完成外物连接仪式后铸造 NFT 的完整流程：
 * 1. 准备阶段：选择外物、准备素材
 * 2. 内容创建：上传图片、填写连接信息
 * 3. 铸造阶段：IPFS上传、合约调用、生成共识哈希
 * 4. 完成阶段：确认信息、记录感受、保存记录
 * 
 * 功能说明：
 * - 集成外物选择组件
 * - 支持图片上传到IPFS
 * - 生成NFT元数据
 * - 调用智能合约铸造NFT
 * - 记录连接感受和仪式信息
 * 
 * @module pages/NFTCeremony
 */

import React, { useState, useCallback } from 'react';
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
  TextField,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { ethers } from 'ethers';
import { useAppSelector } from '../../store/hooks';
import { ExternalObject } from '../../types/energy';
import { ipfsService } from '../../services/ipfs/ipfsService';
import { nftContractService } from '../../services/contract/nftContract';
import { walletService } from '../../services/wallet/walletService';
import ExternalObjectSelector from '../../components/ceremony/ExternalObjectSelector';
import DateTimePicker from '../../components/ceremony/DateTimePicker';
import { scheduledMintService } from '../../services/scheduledMint/scheduledMintService';

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
 * NFT 仪式页面组件
 */
const NFTCeremony: React.FC = () => {
  const { recommendedObjects } = useAppSelector((state) => state.energy);
  const { address: walletAddress } = useAppSelector((state) => state.wallet);

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

  const steps = ['准备阶段', '内容创建', '铸造阶段', '完成阶段'];

  /**
   * 处理外物选择
   * 
   * @param object - 选择的外物
   */
  const handleObjectSelect = useCallback((object: ExternalObject) => {
    setFormData((prev) => ({ ...prev, selectedObject: object }));
  }, []);

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
      case 0:
        // 准备阶段：必须选择外物
        if (!formData.selectedObject) {
          setError('请先选择外物');
          return false;
        }
        return true;
      case 1:
        // 内容创建：必须上传图片
        if (!formData.image) {
          setError('请上传仪式图片');
          return false;
        }
        return true;
      case 2:
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
    if (!validateStep(activeStep)) {
      return;
    }

    // 如果是铸造阶段，执行铸造流程
    if (activeStep === 2) {
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
   *    e. 调用合约铸造NFT
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
      // 如果是定时铸造，创建定时任务
      if (mintType === 'scheduled') {
        // 将图片转换为base64
        const imageData = await scheduledMintService.fileToBase64(formData.image);
        
        // 创建定时任务
        const task = scheduledMintService.createTask({
          walletAddress,
          selectedObject: formData.selectedObject,
          imageData,
          imageFileName: formData.image.name,
          connectionType: formData.connectionType,
          location: formData.location,
          duration: formData.duration,
          blessing: formData.blessing,
          feelingsBefore: formData.feelingsBefore,
          feelingsDuring: formData.feelingsDuring,
          feelingsAfter: formData.feelingsAfter,
          scheduledTime: formData.scheduledTime!,
        });
        
        // 进入完成阶段
        setActiveStep(3);
        setMintResult({
          tokenId: '',
          txHash: '',
          tokenURI: '',
        });
        return;
      }

      // 立即铸造流程
      // 1. 上传图片到IPFS
      const imageHash = await ipfsService.uploadFile(formData.image);

      // 2. 生成NFT元数据
      const metadata = {
        name: `外物连接 - ${formData.selectedObject.name}`,
        description: `与${formData.selectedObject.name}的连接仪式见证`,
        image: ipfsService.getAccessUrl(imageHash),
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
          consensusHash: '', // 将在合约调用时生成
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

      // 5. 初始化合约服务
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
      
      await nftContractService.init({
        contractAddress,
        chainId,
      });

      // 6. 调用合约铸造NFT
      const txHash = await nftContractService.mintConnection(
        walletAddress,
        tokenURI,
        formData.selectedObject.id,
        formData.selectedObject.element,
        consensusHash
      );

      // 7. 获取Token ID（从交易事件中解析）
      // 等待交易确认后，从事件中获取Token ID
      const tokenId = await nftContractService.getTokenIdFromTransaction(txHash);

      setMintResult({
        tokenId,
        txHash,
        tokenURI,
      });

      // 进入完成阶段
      setActiveStep(3);
    } catch (error) {
      console.error('NFT铸造失败:', error);
      setError(
        error instanceof Error ? error.message : 'NFT铸造失败，请重试'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          NFT 仪式
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          完成外物连接仪式，铸造 NFT 作为能量场见证
        </Typography>

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
              {/* 准备阶段：选择外物 */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    准备阶段
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    根据能量分析结果，选择适合的外物进行连接
                  </Typography>
                  <ExternalObjectSelector
                    objects={recommendedObjects}
                    selectedObjectId={formData.selectedObject?.id}
                    onSelect={handleObjectSelect}
                  />
                </Box>
              )}

              {/* 内容创建：上传图片和填写信息 */}
              {activeStep === 1 && (
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

              {/* 铸造阶段 */}
              {activeStep === 2 && (
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

              {/* 完成阶段 */}
              {activeStep === 3 && mintResult && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    完成阶段
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    NFT铸造成功！
                  </Alert>
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
              {activeStep === 2 ? '开始铸造' : '下一步'}
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default NFTCeremony;
