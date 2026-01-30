/**
 * 我的连接页面
 * 
 * 管理用户的连接记录：
 * - 从链上查询并展示持有的 NFT
 * - 连接记录列表
 * - NFT详情查看
 * - 统计信息
 * 
 * 功能说明：
 * - 使用useNFT hook从链上加载用户的NFT
 * - 支持刷新NFT列表
 * - 显示NFT的基本信息和元数据
 * 
 * @module pages/MyConnections
 */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useNFT } from '../../hooks/useNFT';
import { setNFTs } from '../../store/slices/nftSlice';
import { NFTMetadata } from '../../types/nft';
import { formatDate } from '../../utils/format';

const MyConnections: React.FC = () => {
  const dispatch = useAppDispatch();
  const { address } = useAppSelector((state) => state.wallet);
  const { nfts, loading, error, getNFTMetadata, refreshNFTs } = useNFT();
  
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  /**
   * 同步NFT到Redux store
   */
  useEffect(() => {
    if (nfts.length > 0) {
      dispatch(setNFTs(nfts));
    }
  }, [nfts, dispatch]);

  /**
   * 处理NFT详情查看
   * 
   * @param tokenId - Token ID
   * @param tokenURI - Token URI
   */
  const handleViewDetail = async (tokenId: string, tokenURI: string) => {
    setSelectedNFT(tokenId);
    setDetailDialogOpen(true);
    setMetadataLoading(true);
    
    try {
      const metadata = await getNFTMetadata(tokenURI);
      setNftMetadata(metadata);
    } catch (err) {
      console.error('获取NFT元数据失败:', err);
      setNftMetadata(null);
    } finally {
      setMetadataLoading(false);
    }
  };

  /**
   * 关闭详情对话框
   */
  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedNFT(null);
    setNftMetadata(null);
  };


  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              我的连接
            </Typography>
            <Typography variant="body1" color="text.secondary">
              查看您的所有连接记录和 NFT
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={refreshNFTs}
            disabled={loading || !address}
            sx={{ ml: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : '刷新'}
          </Button>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 钱包未连接提示 */}
        {!address && (
          <Alert severity="info" sx={{ mb: 2 }}>
            请先连接钱包以查看您的连接记录
          </Alert>
        )}

        {/* 统计信息 */}
        <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{nfts.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  连接总数
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{address ? '已连接' : '未连接'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  钱包状态
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  钱包地址
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* NFT 列表 */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            我的 NFT
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : nfts.length > 0 ? (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {nfts.map((nft) => (
                <Grid item xs={12} sm={6} md={4} key={nft.tokenId}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => handleViewDetail(nft.tokenId, nft.tokenURI)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Token #{nft.tokenId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        合约地址：{nft.contractAddress.slice(0, 10)}...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        铸造时间：{formatDate(new Date(nft.mintedAt * 1000))}
                      </Typography>
                      {nft.txHash && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          交易：{nft.txHash.slice(0, 10)}...
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ mt: 2, p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {address ? '暂无连接记录' : '请先连接钱包'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* NFT详情对话框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          NFT 详情 - Token #{selectedNFT}
        </DialogTitle>
        <DialogContent>
          {metadataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : nftMetadata ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {nftMetadata.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {nftMetadata.description}
              </Typography>
              
              {nftMetadata.image && (
                <Box sx={{ mb: 2 }}>
                  <CardMedia
                    component="img"
                    image={nftMetadata.image}
                    alt={nftMetadata.name}
                    sx={{ maxHeight: 400, objectFit: 'contain' }}
                  />
                </Box>
              )}
              
              {nftMetadata.attributes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    属性：
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(nftMetadata.attributes).map(([key, value]) => (
                      <Grid item key={key}>
                        <Chip
                          label={`${key}: ${value}`}
                          size="small"
                          variant="outlined"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {nftMetadata.feelings && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    仪式感受：
                  </Typography>
                  {nftMetadata.feelings.before && (
                    <Typography variant="body2" paragraph>
                      <strong>仪式前：</strong>{nftMetadata.feelings.before}
                    </Typography>
                  )}
                  {nftMetadata.feelings.during && (
                    <Typography variant="body2" paragraph>
                      <strong>仪式中：</strong>{nftMetadata.feelings.during}
                    </Typography>
                  )}
                  {nftMetadata.feelings.after && (
                    <Typography variant="body2" paragraph>
                      <strong>仪式后：</strong>{nftMetadata.feelings.after}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="warning">
              无法加载NFT元数据
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyConnections;
