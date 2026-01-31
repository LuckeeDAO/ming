/**
 * 定时MINT任务管理页面
 * 
 * 功能：
 * - 显示所有定时MINT任务列表
 * - 支持查看任务详情
 * - 支持取消待执行的任务
 * - 显示任务执行状态和结果
 * 
 * @module pages/ScheduledMints
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import {
  scheduledMintService,
  ScheduledMintTask,
  ScheduledMintTaskStatus,
} from '../../services/scheduledMint/scheduledMintService';
import { formatDate } from '../../utils/format';

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
 * 定时MINT任务管理页面组件
 */
const ScheduledMints: React.FC = () => {
  const { address: walletAddress } = useAppSelector((state) => state.wallet);
  
  const [tasks, setTasks] = useState<ScheduledMintTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ScheduledMintTask | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  /**
   * 加载任务列表
   */
  const loadTasks = () => {
    if (!walletAddress) {
      setTasks([]);
      return;
    }
    
    const userTasks = scheduledMintService.getTasksByWallet(walletAddress);
    // 按创建时间倒序排列
    userTasks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setTasks(userTasks);
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
   * 确认删除任务
   */
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      scheduledMintService.deleteTask(taskToDelete);
      loadTasks();
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  /**
   * 取消任务
   * 
   * @param taskId - 任务ID
   */
  const handleCancelTask = (taskId: string) => {
    scheduledMintService.cancelTask(taskId);
    loadTasks();
  };

  // 组件挂载时加载任务列表
  useEffect(() => {
    loadTasks();
    
    // 设置定时刷新（每30秒）
    const refreshInterval = setInterval(() => {
      loadTasks();
    }, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="info">
            请先连接钱包以查看定时MINT任务
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          定时MINT任务
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          管理你的定时NFT铸造任务
        </Typography>

        {tasks.length === 0 ? (
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

export default ScheduledMints;
