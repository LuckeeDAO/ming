/**
 * 钱包操作 Hook
 * 
 * 提供钱包连接、断开和余额查询功能
 * 使用 ethers.js 与 MetaMask 等 Web3 钱包交互
 * 
 * @returns {Object} 包含 connect, disconnect, getBalance 方法的对象
 */
import { useCallback } from 'react';
import { ethers } from 'ethers';
import { mingWalletInterface } from '../services/wallet/mingWalletInterface';
import { walletWindowBridge } from '../services/wallet/walletWindowBridge';

function resolveConnectionMode(): 'andao' | 'metamask' {
  const configured = (import.meta.env.VITE_WALLET_CONNECTION_MODE || '')
    .trim()
    .toLowerCase();
  if (configured === 'metamask') {
    return 'metamask';
  }
  if (configured === 'andao') {
    return 'andao';
  }
  return walletWindowBridge.isExternalWalletConfigured() ? 'andao' : 'metamask';
}

function resolveChainFamily(): 'evm' | 'solana' {
  const chainFamily = (import.meta.env.VITE_CHAIN_FAMILY || 'evm')
    .trim()
    .toLowerCase();
  return chainFamily === 'solana' ? 'solana' : 'evm';
}

function resolveChainId(): number | undefined {
  const raw = import.meta.env.VITE_CHAIN_ID;
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
}

function resolveNetwork(): string | undefined {
  const network = import.meta.env.VITE_CHAIN_NETWORK;
  return network && network.trim() ? network.trim() : undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useWallet = () => {
  /**
   * 连接钱包
   * 请求用户授权并获取钱包地址
   * 
   * @returns {Promise<string | null>} 钱包地址，失败返回 null
   * @throws {Error} 如果 MetaMask 未安装或用户拒绝连接
   */
  const connect = useCallback(async (): Promise<string | null> => {
    const mode = resolveConnectionMode();

    if (mode === 'andao') {
      const opened = walletWindowBridge.openWalletWindow();
      if (walletWindowBridge.isExternalWalletConfigured() && !opened) {
        throw new Error(
          '无法打开 AnDaoWallet 窗口，请允许弹窗后重试'
        );
      }
      if (opened) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      const chainFamily = resolveChainFamily();
      const chainId = chainFamily === 'evm' ? resolveChainId() : undefined;
      const network = chainFamily === 'solana' ? resolveNetwork() : undefined;

      const MAX_RETRIES = 5;
      let lastError: string | null = null;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        const activeAccount = await mingWalletInterface.getActiveAccount({
          chainFamily,
          chainId,
          network,
        });

        if (activeAccount.success && activeAccount.data?.walletAddress) {
          return activeAccount.data.walletAddress;
        }

        lastError = activeAccount.error?.message || null;
        const errorCode = activeAccount.error?.code;
        if (errorCode === 'CHAIN_NOT_SUPPORTED' || errorCode === 'INVALID_PARAMS') {
          break;
        }

        if (attempt < MAX_RETRIES) {
          await sleep(500);
        }
      }

      throw new Error(
        lastError || '未获取到钱包地址，请先在 AnDaoWallet 创建或解锁账户'
      );
    }

    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      return accounts[0] || null;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }, []);

  /**
   * 断开钱包连接
   * 注意：MetaMask 没有官方的断开方法
   * 此方法主要用于清除本地状态
   */
  const disconnect = useCallback(() => {
    walletWindowBridge.clearWalletWindowReference();
  }, []);

  /**
   * 获取钱包余额
   * 
   * @param {string} address - 钱包地址
   * @returns {Promise<string>} 余额（以 ETH 为单位）
   * @throws {Error} 如果 MetaMask 未安装或查询失败
   */
  const getBalance = useCallback(async (address: string): Promise<string> => {
    if (typeof window.ethereum === 'undefined') {
      // 外部钱包模式下，余额读取可由钱包页面自行展示；这里返回占位值避免阻断流程。
      return '0';
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }, []);

  return {
    connect,
    disconnect,
    getBalance,
  };
};
