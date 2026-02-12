/**
 * 简化NFT铸造页面
 * 
 * 功能：
 * - 选择图片
 * - 上传到IPFS
 * - 签名并铸造NFT
 * 
 * 注意：不需要命理分析过程，直接铸造
 */

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Grid,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { ipfsService } from '../../services/ipfs/ipfsService';
import { directMintService } from '../../services/contract/directMintService';

const SimpleMint: React.FC = () => {
  const navigate = useNavigate();
  const { address: walletAddress } = useAppSelector((state) => state.wallet);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<{
    tokenId: string;
    txHash: string;
    tokenURI: string;
  } | null>(null);

  /**
   * 处理图片选择
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
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  /**
   * 处理铸造
   */
  const handleMint = async () => {
    if (!walletAddress) {
      setError('请先连接钱包');
      return;
    }

    if (!image) {
      setError('请选择图片');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // 1. 上传图片到IPFS
      const imageHash = await ipfsService.uploadFile(image);
      const imageURI = `ipfs://${imageHash}`;

      // 2. 创建元数据
      const metadata = {
        name: '连接NFT',
        description: description || '通过简化流程铸造的连接NFT',
        image: imageURI,
        attributes: [],
      };

      // 3. 上传元数据到IPFS
      const metadataHash = await ipfsService.uploadJSON(metadata);
      const tokenURI = ipfsService.getAccessUrl(metadataHash);

      // 4. 生成共识哈希（使用keccak256哈希函数处理元数据哈希）
      const { ethers } = await import('ethers');
      const consensusHash = ethers.keccak256(ethers.toUtf8Bytes(metadataHash));

      // 5. 获取合约配置
      const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
      
      // 验证合约地址配置
      if (!contractAddress) {
        throw new Error('NFT合约地址未配置，请检查环境变量VITE_NFT_CONTRACT_ADDRESS');
      }
      
      // 验证合约地址格式
      if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        throw new Error('NFT合约地址格式无效');
      }

      // 6. 初始化直接铸造服务
      await directMintService.init(contractAddress);

      // 7. 直接调用合约铸造NFT
      const mintResult = await directMintService.mintNFT({
        to: walletAddress,
        tokenURI,
        externalObjectId: '',
        element: '',
        consensusHash,
      });

      setSuccess({
        tokenId: mintResult.tokenId,
        txHash: mintResult.txHash,
        tokenURI,
      });
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          简化NFT铸造
        </Typography>
        <Typography variant="body1" color="text.secondary">
          选择图片、上传、签名即可完成NFT铸造，无需复杂的命理分析过程。
        </Typography>
      </Box>

      {success ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                铸造成功！
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Token ID: {success.tokenId}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                交易哈希: {success.txHash}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/my-connections')}
                  sx={{ mr: 2 }}
                >
                  查看我的NFT
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSuccess(null);
                    setImage(null);
                    setImagePreview(null);
                    setDescription('');
                  }}
                >
                  继续铸造
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* 图片选择 */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  1. 选择图片
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageSelect}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      选择图片
                    </Button>
                  </label>
                  {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={imagePreview}
                        alt="预览"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: 8,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* 描述（可选） */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  2. 添加描述（可选）
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="为这个NFT添加描述..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>

              {/* 错误提示 */}
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {/* 操作按钮 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                  >
                    取消
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleMint}
                    disabled={!image || isProcessing || !walletAddress}
                    startIcon={isProcessing ? <CircularProgress size={20} /> : null}
                  >
                    {isProcessing ? '铸造中...' : '签名并铸造'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default SimpleMint;
