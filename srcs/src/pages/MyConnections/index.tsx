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
  useTheme,
  Divider,
  TextField,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useNFT } from '../../hooks/useNFT';
import { setNFTs } from '../../store/slices/nftSlice';
import { NFTMetadata } from '../../types/nft';
import { formatDate } from '../../utils/format';
import { ipfsService } from '../../services/ipfs/ipfsService';
import { walletService } from '../../services/wallet/walletService';
import { mingWalletInterface } from '../../services/wallet/mingWalletInterface';
import { isValidContractAddress } from '../../utils/validation';
import {
  buildLifecycleRequests,
  buildReviewCommentHash,
  executeLifecycleFlow,
} from '../../services/wallet/lifecycleTxService';
import { matchesLifecycleEventSelection } from '../../services/wallet/lifecycleEventMatcher';

interface ReleaseEvaluation {
  completionScore: number;
  resonanceScore: number;
  publicNarrative: string;
  nextStageGoal: string;
}

type LifecycleStepKey = 'closeConfirmed' | 'reviewConfirmed' | 'releaseConfirmed';
type LifecycleStepStatus = 'idle' | 'pending' | 'confirmed' | 'failed';

interface LifecycleStepState {
  status: LifecycleStepStatus;
  txHash?: string;
}

const LIFECYCLE_STEP_LABELS: Record<LifecycleStepKey, string> = {
  closeConfirmed: 'closeConfirmed',
  reviewConfirmed: 'reviewConfirmed',
  releaseConfirmed: 'releaseConfirmed',
};

const createInitialLifecycleSteps = (): Record<LifecycleStepKey, LifecycleStepState> => ({
  closeConfirmed: { status: 'idle' },
  reviewConfirmed: { status: 'idle' },
  releaseConfirmed: { status: 'idle' },
});

const buildLifecycleRefLabel = (tokenId: string | null, planId?: string): string => {
  if (planId) {
    return `planId: ${planId}`;
  }
  if (tokenId) {
    return `tokenId: ${tokenId}`;
  }
  return 'none';
};

const extractPlanIdFromMetadata = (metadata: NFTMetadata | null): string | undefined => {
  if (!metadata) {
    return undefined;
  }
  if (metadata.scheduledMint?.planId) {
    return metadata.scheduledMint.planId;
  }
  const attr = metadata.attributes?.find(
    (item) => item.trait_type === 'planId' || item.trait_type === '计划ID',
  );
  if (attr && (typeof attr.value === 'string' || typeof attr.value === 'number')) {
    return String(attr.value);
  }
  return undefined;
};

const MyConnections: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { address } = useAppSelector((state) => state.wallet);
  const { nfts, loading, error, getNFTMetadata, refreshNFTs } = useNFT();
  
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [releaseProcessing, setReleaseProcessing] = useState(false);
  const [releaseMessage, setReleaseMessage] = useState<string>('');
  const [releaseError, setReleaseError] = useState<string>('');
  const [releaseEvaluation, setReleaseEvaluation] = useState<ReleaseEvaluation>({
    completionScore: 4,
    resonanceScore: 4,
    publicNarrative: '',
    nextStageGoal: '',
  });
  const [releasedRecords, setReleasedRecords] = useState<
    Record<string, { releasedTokenURI: string; txHash?: string; timestamp?: number }>
  >({});
  const [tokenPlanIds, setTokenPlanIds] = useState<Record<string, string>>({});
  const [lifecycleSteps, setLifecycleSteps] = useState<Record<LifecycleStepKey, LifecycleStepState>>(
    createInitialLifecycleSteps(),
  );
  const selectedPlanId = extractPlanIdFromMetadata(nftMetadata) || (selectedNFT ? tokenPlanIds[selectedNFT] : undefined);
  const lifecycleMatchMode = selectedPlanId ? 'planId' : selectedNFT ? 'tokenId' : 'none';

  useEffect(() => {
    const unsubscribe = mingWalletInterface.subscribeEvents((walletEvent) => {
      const selectedRef = {
        tokenId: selectedNFT || undefined,
        planId: selectedPlanId,
      };
      const eventRef = {
        tokenId: walletEvent.data.tokenId,
        planId: walletEvent.data.planId,
      };
      if (!matchesLifecycleEventSelection(eventRef, selectedRef)) {
        return;
      }

      const txHash = typeof walletEvent.data.txHash === 'string' ? walletEvent.data.txHash : undefined;
      if (walletEvent.event === 'closeConfirmed') {
        setLifecycleSteps((prev) => ({
          ...prev,
          closeConfirmed: { status: 'confirmed', txHash },
        }));
        return;
      }
      if (walletEvent.event === 'reviewConfirmed') {
        setLifecycleSteps((prev) => ({
          ...prev,
          reviewConfirmed: { status: 'confirmed', txHash },
        }));
        return;
      }
      if (walletEvent.event === 'releaseConfirmed') {
        setLifecycleSteps((prev) => ({
          ...prev,
          releaseConfirmed: { status: 'confirmed', txHash },
        }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedNFT, selectedPlanId]);

  /**
   * 同步NFT到Redux store
   */
  useEffect(() => {
    if (nfts.length > 0) {
      dispatch(setNFTs(nfts));
    }
  }, [nfts, dispatch]);

  /**
   * 从链上 tokenURI 对应元数据回读封局释放状态，确保刷新页面后状态可恢复
   */
  useEffect(() => {
    let cancelled = false;

    const syncReleasedRecords = async () => {
      if (nfts.length === 0) {
        setReleasedRecords({});
        setTokenPlanIds({});
        return;
      }

      const results = await Promise.all(
        nfts.map(async (nft) => {
          try {
            const metadata = await getNFTMetadata(nft.tokenURI);
            const released = Boolean(metadata?.metadata?.version?.includes('-released'));
            const planId = extractPlanIdFromMetadata(metadata);
            return {
              tokenId: nft.tokenId,
              released,
              releasedTokenURI: nft.tokenURI,
              planId,
            };
          } catch (err) {
            return {
              tokenId: nft.tokenId,
              released: false,
              releasedTokenURI: nft.tokenURI,
              planId: undefined,
            };
          }
        })
      );

      if (cancelled) {
        return;
      }

      setReleasedRecords((prev) => {
        const next: Record<string, { releasedTokenURI: string; txHash?: string; timestamp?: number }> = {};
        for (const item of results) {
          if (item.released) {
            next[item.tokenId] = {
              releasedTokenURI: item.releasedTokenURI,
              txHash: prev[item.tokenId]?.txHash,
              timestamp: prev[item.tokenId]?.timestamp,
            };
          }
        }
        return next;
      });
      setTokenPlanIds(() => {
        const next: Record<string, string> = {};
        for (const item of results) {
          if (item.planId) {
            next[item.tokenId] = item.planId;
          }
        }
        return next;
      });
    };

    void syncReleasedRecords();

    return () => {
      cancelled = true;
    };
  }, [nfts, getNFTMetadata]);

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
    setReleaseMessage('');
    setReleaseError('');
    setReleaseEvaluation({
      completionScore: 4,
      resonanceScore: 4,
      publicNarrative: '',
      nextStageGoal: '',
    });
    setLifecycleSteps(createInitialLifecycleSteps());
  };

  const selectedNFTRecord = selectedNFT
    ? nfts.find((item) => item.tokenId === selectedNFT) || null
    : null;
  const isSelectedReleased = selectedNFT
    ? Boolean(releasedRecords[selectedNFT]) || Boolean(nftMetadata?.metadata?.version?.includes('-released'))
    : false;
  const getReleasedState = (tokenId: string) =>
    Boolean(releasedRecords[tokenId]) || (selectedNFT === tokenId && Boolean(nftMetadata?.metadata?.version?.includes('-released')));
  const getAttributeValue = (traitType: string): string => {
    if (!nftMetadata?.attributes) {
      return '-';
    }
    const item = nftMetadata.attributes.find((attr) => attr.trait_type === traitType);
    return item ? String(item.value) : '-';
  };

  /**
   * 生成封局释放后的公开元数据（移除隐私字段）
   */
  const buildReleasedMetadata = (metadata: NFTMetadata, evaluation: ReleaseEvaluation): NFTMetadata => {
    const releasedAt = new Date().toISOString();
    const existingAttributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];
    const releaseAttributes = [
      { trait_type: '封局状态', value: '已释放' },
      { trait_type: '履约完成度', value: `${evaluation.completionScore}/5` },
      { trait_type: '自我共振度', value: `${evaluation.resonanceScore}/5` },
      { trait_type: '公开叙事摘要', value: evaluation.publicNarrative.slice(0, 60) },
      { trait_type: '下一阶段意图', value: evaluation.nextStageGoal.slice(0, 60) },
      { trait_type: '释放时间', value: releasedAt, display_type: 'date' },
    ];

    const sanitized: NFTMetadata = {
      ...metadata,
      description:
        `${metadata.description}\n\n[封局释放] 该记录已进入公开见证状态，隐私字段已移除。\n` +
        `履约完成度：${evaluation.completionScore}/5；自我共振度：${evaluation.resonanceScore}/5。\n` +
        `公开叙事：${evaluation.publicNarrative}\n` +
        `下一阶段：${evaluation.nextStageGoal}`,
      personalChart: undefined,
      feelings: undefined,
      scheduledMint: undefined,
      attributes: [...existingAttributes, ...releaseAttributes],
      releaseEvaluation: {
        completionScore: evaluation.completionScore,
        resonanceScore: evaluation.resonanceScore,
        publicNarrative: evaluation.publicNarrative,
        nextStageGoal: evaluation.nextStageGoal,
        releasedAt,
        version: '1.0',
      },
      metadata: {
        ...metadata.metadata,
        version: `${metadata.metadata.version}-released`,
        createdAt: releasedAt,
      },
    };

    return sanitized;
  };

  /**
   * 执行封局释放
   */
  const handleRelease = async () => {
    if (!selectedNFTRecord || !selectedNFT || !nftMetadata) {
      setReleaseError('缺少必要的NFT信息，无法执行封局释放');
      return;
    }
    if (releaseEvaluation.publicNarrative.trim().length < 8) {
      setReleaseError('请填写至少8个字符的公开叙事摘要');
      return;
    }
    if (releaseEvaluation.nextStageGoal.trim().length < 6) {
      setReleaseError('请填写至少6个字符的下一阶段意图');
      return;
    }

    setReleaseProcessing(true);
    setReleaseError('');
    setReleaseMessage('');
    setLifecycleSteps(createInitialLifecycleSteps());

    try {
      const chainContext = await walletService.getChainContext();
      const { chainFamily, chainId, network } = chainContext;
      const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('NFT合约地址未配置，请检查环境变量VITE_NFT_CONTRACT_ADDRESS');
      }
      if (!isValidContractAddress(contractAddress, chainFamily)) {
        throw new Error(`NFT合约地址格式无效（chain family: ${chainFamily}）`);
      }

      const releasedMetadata = buildReleasedMetadata(nftMetadata, releaseEvaluation);
      const metadataHash = await ipfsService.uploadJSON(releasedMetadata);
      const releasedTokenURI = `ipfs://${metadataHash}`;

      const commentHash = buildReviewCommentHash(
        JSON.stringify({
          publicNarrative: releaseEvaluation.publicNarrative,
          nextStageGoal: releaseEvaluation.nextStageGoal,
          completionScore: releaseEvaluation.completionScore,
          resonanceScore: releaseEvaluation.resonanceScore,
          releasedTokenURI,
        }),
      );
      const requests = buildLifecycleRequests({
        chainId,
        chainFamily,
        network,
        contractAddress,
        tokenId: selectedNFT,
        rating: releaseEvaluation.completionScore,
        commentHash,
        gasPolicy: {
          primary: 'sponsored',
          fallback: 'self_pay',
        },
      });
      const result = await executeLifecycleFlow(
        (request) => mingWalletInterface.sendTransaction(request),
        requests,
        {
          onStepStarted: (action) => {
            const key =
              action === 'close'
                ? 'closeConfirmed'
                : action === 'review'
                  ? 'reviewConfirmed'
                  : 'releaseConfirmed';
            setLifecycleSteps((prev) => ({
              ...prev,
              [key]: { status: 'pending' },
            }));
          },
          onStepConfirmed: (action, txHash) => {
            const key =
              action === 'close'
                ? 'closeConfirmed'
                : action === 'review'
                  ? 'reviewConfirmed'
                  : 'releaseConfirmed';
            setLifecycleSteps((prev) => ({
              ...prev,
              [key]: { status: 'confirmed', txHash },
            }));
          },
          onStepFailed: (action) => {
            const key =
              action === 'close'
                ? 'closeConfirmed'
                : action === 'review'
                  ? 'reviewConfirmed'
                  : 'releaseConfirmed';
            setLifecycleSteps((prev) => ({
              ...prev,
              [key]: { status: 'failed' },
            }));
          },
        },
      );

      setReleaseMessage(
        `封局释放成功\nmatch: ${lifecycleMatchMode}\nref: ${buildLifecycleRefLabel(selectedNFT, selectedPlanId)}\nclose: ${result.closeTxHash}\nreview: ${result.reviewTxHash}\nrelease: ${result.releaseTxHash}`,
      );
      setReleasedRecords((prev) => ({
        ...prev,
        [selectedNFT]: {
          releasedTokenURI,
          txHash: result.releaseTxHash,
          timestamp: Date.now(),
        },
      }));
      setNftMetadata(releasedMetadata);
      await refreshNFTs();
    } catch (err) {
      const message = err instanceof Error ? err.message : '封局释放失败';
      setReleaseError(message);
    } finally {
      setReleaseProcessing(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* 页面标题和操作按钮 */}
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

        {/* 开始连接区域 - 从首页转移过来 */}
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 6, md: 8 },
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mb: 2 }}
          >
            开始你的仪式之旅
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 2, mb: 4, maxWidth: '600px', mx: 'auto', lineHeight: 1.8 }}
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
        </Box>

        <Divider sx={{ my: 4 }} />

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
                      {tokenPlanIds[nft.tokenId] && (
                        <Chip
                          label={`Plan: ${tokenPlanIds[nft.tokenId]}`}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1, mr: 1 }}
                        />
                      )}
                      {getReleasedState(nft.tokenId) && (
                        <Chip
                          label="已封局释放"
                          size="small"
                          color="success"
                          sx={{ mb: 1 }}
                        />
                      )}
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
          {selectedPlanId ? ` (Plan: ${selectedPlanId})` : ''}
        </DialogTitle>
        <DialogContent>
          {releaseError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {releaseError}
            </Alert>
          )}
          {releaseMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {releaseMessage}
            </Alert>
          )}
          <Box sx={{ mb: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              生命周期确认进度
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              事件匹配维度：{lifecycleMatchMode}
              {selectedPlanId ? ` (planId: ${selectedPlanId})` : selectedNFT ? ` (tokenId: ${selectedNFT})` : ''}
            </Typography>
            <Grid container spacing={1}>
              {(Object.keys(lifecycleSteps) as LifecycleStepKey[]).map((stepKey) => {
                const step = lifecycleSteps[stepKey];
                const color =
                  step.status === 'confirmed'
                    ? 'success'
                    : step.status === 'failed'
                      ? 'error'
                      : step.status === 'pending'
                        ? 'warning'
                        : 'default' as const;
                const label =
                  step.status === 'confirmed'
                    ? `${LIFECYCLE_STEP_LABELS[stepKey]} ✓`
                    : step.status === 'failed'
                      ? `${LIFECYCLE_STEP_LABELS[stepKey]} ✗`
                      : step.status === 'pending'
                        ? `${LIFECYCLE_STEP_LABELS[stepKey]} ...`
                        : LIFECYCLE_STEP_LABELS[stepKey];
                return (
                  <Grid item key={stepKey}>
                    <Chip label={label} color={color} size="small" />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          {isSelectedReleased && (
            <Alert severity="info" sx={{ mb: 2 }}>
              当前 NFT 已完成封局释放：隐私字段已移除，仅保留公开见证数据用于展示与流通。
            </Alert>
          )}
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
              {isSelectedReleased && selectedNFT && releasedRecords[selectedNFT] && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    封局释放记录：
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    计划ID：{selectedPlanId || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    公开元数据：{releasedRecords[selectedNFT].releasedTokenURI}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    交易哈希：{releasedRecords[selectedNFT].txHash || '-'}
                  </Typography>
                </Box>
              )}
              {isSelectedReleased && (
                <Box sx={{ mt: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    封局评价卡片
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    履约完成度：
                    {nftMetadata.releaseEvaluation?.completionScore
                      ? `${nftMetadata.releaseEvaluation.completionScore}/5`
                      : getAttributeValue('履约完成度')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    自我共振度：
                    {nftMetadata.releaseEvaluation?.resonanceScore
                      ? `${nftMetadata.releaseEvaluation.resonanceScore}/5`
                      : getAttributeValue('自我共振度')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    公开叙事摘要：
                    {nftMetadata.releaseEvaluation?.publicNarrative || getAttributeValue('公开叙事摘要')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    下一阶段意图：
                    {nftMetadata.releaseEvaluation?.nextStageGoal || getAttributeValue('下一阶段意图')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    释放时间：
                    {nftMetadata.releaseEvaluation?.releasedAt
                      ? formatDate(new Date(nftMetadata.releaseEvaluation.releasedAt))
                      : getAttributeValue('释放时间')}
                  </Typography>
                </Box>
              )}
              {!isSelectedReleased && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    封局评价参数（将写入NFT属性）
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="履约完成度（1-5）"
                        value={releaseEvaluation.completionScore}
                        inputProps={{ min: 1, max: 5 }}
                        onChange={(event) => {
                          const value = Number(event.target.value || 1);
                          setReleaseEvaluation((prev) => ({
                            ...prev,
                            completionScore: Math.min(5, Math.max(1, value)),
                          }));
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="自我共振度（1-5）"
                        value={releaseEvaluation.resonanceScore}
                        inputProps={{ min: 1, max: 5 }}
                        onChange={(event) => {
                          const value = Number(event.target.value || 1);
                          setReleaseEvaluation((prev) => ({
                            ...prev,
                            resonanceScore: Math.min(5, Math.max(1, value)),
                          }));
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="公开叙事摘要"
                        placeholder="例如：我完成了这段契约，开始进入更稳定的节奏。"
                        value={releaseEvaluation.publicNarrative}
                        onChange={(event) =>
                          setReleaseEvaluation((prev) => ({
                            ...prev,
                            publicNarrative: event.target.value,
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="下一阶段意图"
                        placeholder="例如：接下来30天，保持晨间复盘与稳定执行。"
                        value={releaseEvaluation.nextStageGoal}
                        onChange={(event) =>
                          setReleaseEvaluation((prev) => ({
                            ...prev,
                            nextStageGoal: event.target.value,
                          }))
                        }
                      />
                    </Grid>
                  </Grid>
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
          <Button
            onClick={handleRelease}
            disabled={metadataLoading || releaseProcessing || !selectedNFTRecord || !nftMetadata || isSelectedReleased}
            variant="contained"
            color="secondary"
          >
            {releaseProcessing ? '封局释放中...' : isSelectedReleased ? '已封局释放' : '封局释放'}
          </Button>
          <Button onClick={handleCloseDetail}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyConnections;
