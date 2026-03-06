/**
 * 钱包连接组件
 * 
 * 功能：
 * - 连接/断开 Web3 钱包（MetaMask 等）
 * - 显示当前连接的钱包地址（简化显示）
 * - 管理钱包连接状态
 * 
 * @component
 */
import React from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAddress, setNetworkId, setBalance, setError } from '../../store/slices/walletSlice';
import { useWallet } from '../../hooks/useWallet';
import { walletService } from '../../services/wallet/walletService';

const WalletConnect: React.FC = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected, error } = useAppSelector((state) => state.wallet);
  const { connect, disconnect, getBalance } = useWallet();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const connectionMode = (import.meta.env.VITE_WALLET_CONNECTION_MODE || '')
    .trim()
    .toLowerCase();
  const useAnDaoWallet =
    connectionMode === 'andao' ||
    (connectionMode === '' && !!import.meta.env.VITE_WALLET_APP_URL);

  /**
   * 处理钱包连接
   * 调用 useWallet hook 的 connect 方法，成功后更新 Redux store
   */
  const handleConnect = async () => {
    if (isConnecting) {
      return;
    }
    setIsConnecting(true);
    dispatch(setError(null));
    try {
      const account = await connect();
      if (account) {
        dispatch(setAddress(account));
        try {
          const chainContext = await walletService.getChainContext();
          dispatch(setNetworkId(chainContext.chainId));
        } catch (_error) {
          // 外部钱包模式或网络信息不可用时，不阻断连接主流程
          dispatch(setNetworkId(null));
        }
        try {
          const balance = await getBalance(account);
          dispatch(setBalance(balance));
        } catch (_error) {
          dispatch(setBalance(null));
        }
        dispatch(setError(null));
      } else {
        dispatch(setError('未获取到钱包地址，请先在钱包中创建或导入账户后重试。'));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      dispatch(
        setError(error instanceof Error ? error.message : '连接钱包失败，请稍后重试。')
      );
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * 处理钱包断开连接
   * 清除 Redux store 中的钱包相关状态
   */
  const handleDisconnect = () => {
    disconnect();
    dispatch(setAddress(null));
    dispatch(setNetworkId(null));
    dispatch(setBalance(null));
    dispatch(setError(null));
  };

  // 如果已连接，显示地址和断开按钮
  if (isConnected && address) {
    return (
      <>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleDisconnect}
          sx={{ textTransform: 'none' }}
        >
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </Button>
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={4500}
          onClose={() => dispatch(setError(null))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => dispatch(setError(null))} sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // 未连接时显示连接按钮
  return (
    <>
      <Button
        variant="contained"
        color="inherit"
        onClick={handleConnect}
        disabled={isConnecting}
        sx={{ textTransform: 'none' }}
      >
        {isConnecting ? '连接中...' : useAnDaoWallet ? '连接 AnDaoWallet' : '连接钱包'}
      </Button>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4500}
        onClose={() => dispatch(setError(null))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => dispatch(setError(null))} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WalletConnect;
