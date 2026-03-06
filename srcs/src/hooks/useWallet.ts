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

function extractWalletError(error: unknown): { code?: string | number; message: string } {
  if (error instanceof Error) {
    const withCode = error as Error & { code?: string | number };
    return {
      code: withCode.code,
      message: error.message || '未知钱包错误',
    };
  }

  if (error && typeof error === 'object') {
    const record = error as {
      code?: string | number;
      message?: string;
      reason?: string;
      data?: { code?: string | number; message?: string };
    };
    return {
      code: record.code ?? record.data?.code,
      message:
        record.message ||
        record.reason ||
        record.data?.message ||
        JSON.stringify(error),
    };
  }

  return {
    message: typeof error === 'string' ? error : '未知钱包错误',
  };
}

function mapConnectErrorMessage(rawError: unknown): string {
  const { code, message } = extractWalletError(rawError);
  const normalized = (message || '').toLowerCase();

  if (
    code === 4001 ||
    String(code) === '4001' ||
    normalized.includes('wallet must has at least one account') ||
    normalized.includes('no account') ||
    normalized.includes('账户') ||
    normalized.includes('未获取到钱包地址')
  ) {
    return '钱包暂无账户，请先在钱包中创建或导入账户后重试。';
  }

  if (
    normalized.includes('user rejected') ||
    normalized.includes('denied') ||
    normalized.includes('cancel')
  ) {
    return '你已取消钱包授权请求。';
  }

  if (normalized.includes('metamask is not installed')) {
    return '未检测到 MetaMask，请先安装后再重试。';
  }

  if (normalized.includes('wallet window is unavailable')) {
    return '无法连接钱包窗口，请检查弹窗权限后重试。';
  }

  return message || '钱包连接失败，请稍后重试。';
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
        const normalizedError = (lastError || '').toLowerCase();
        if (
          normalizedError.includes('wallet must has at least one account') ||
          normalizedError.includes('no account')
        ) {
          break;
        }
        if (errorCode === 'CHAIN_NOT_SUPPORTED' || errorCode === 'INVALID_PARAMS') {
          break;
        }

        if (attempt < MAX_RETRIES) {
          await sleep(500);
        }
      }

      if ((lastError || '').toLowerCase().includes('wallet must has at least one account')) {
        throw new Error('钱包暂无账户，请先在钱包中创建或导入账户后重试。');
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
      const mappedMessage = mapConnectErrorMessage(error);
      console.error('Error connecting wallet:', error);
      throw new Error(mappedMessage);
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
