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
import { Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAddress, setNetworkId, setBalance } from '../../store/slices/walletSlice';
import { useWallet } from '../../hooks/useWallet';

const WalletConnect: React.FC = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const { connect, disconnect } = useWallet();

  /**
   * 处理钱包连接
   * 调用 useWallet hook 的 connect 方法，成功后更新 Redux store
   */
  const handleConnect = async () => {
    try {
      const account = await connect();
      if (account) {
        dispatch(setAddress(account));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
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
  };

  // 如果已连接，显示地址和断开按钮
  if (isConnected && address) {
    return (
      <Button
        variant="outlined"
        color="inherit"
        onClick={handleDisconnect}
        sx={{ textTransform: 'none' }}
      >
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </Button>
    );
  }

  // 未连接时显示连接按钮
  return (
    <Button
      variant="contained"
      color="inherit"
      onClick={handleConnect}
      sx={{ textTransform: 'none' }}
    >
      连接钱包
    </Button>
  );
};

export default WalletConnect;
