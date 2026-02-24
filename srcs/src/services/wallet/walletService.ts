/**
 * 钱包服务
 * 
 * 提供Web3钱包相关的业务逻辑封装
 * 
 * 功能：
 * - 初始化钱包服务（检查MetaMask是否可用）
 * - 连接钱包（请求用户授权）
 * - 获取当前网络ID
 * - 获取钱包余额
 * - 切换网络（支持添加新网络）
 * - 获取完整钱包信息
 * 
 * 使用说明：
 * 1. 首先调用 init() 检查MetaMask是否可用
 * 2. 调用 connect() 连接钱包并获取地址
 * 3. 使用其他方法获取网络、余额等信息
 * 
 * 依赖：
 * - 需要浏览器环境（window.ethereum）
 * - 需要用户安装MetaMask扩展
 * 
 * 错误处理：
 * - 如果MetaMask未安装，会抛出错误
 * - 如果用户拒绝连接，会抛出错误
 * - 网络切换失败会抛出错误（包含错误码）
 * 
 * @module services/wallet/walletService
 */
import { ethers } from 'ethers';

export interface WalletInfo {
  address: string;
  networkId: number;
  balance: string;
}

export interface ChainContext {
  chainFamily: 'evm' | 'solana';
  chainId: number; // EVM语义；Solana下用0兼容
  network: string; // 如 sepolia / solana-devnet
}

class WalletService {
  private provider: ethers.BrowserProvider | null = null;

  /**
   * 初始化钱包服务
   * 检查 MetaMask 是否可用
   */
  async init(): Promise<boolean> {
    if (typeof window.ethereum === 'undefined') {
      return false;
    }
    this.provider = new ethers.BrowserProvider(window.ethereum);
    return true;
  }

  /**
   * 连接钱包
   * 请求用户授权并返回钱包地址
   */
  async connect(): Promise<string> {
    if (!this.provider) {
      await this.init();
    }
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }
    const accounts = await this.provider.send('eth_requestAccounts', []);
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    return accounts[0];
  }

  /**
   * 获取当前网络 ID
   */
  async getNetworkId(): Promise<number> {
    if (!this.provider) {
      await this.init();
    }
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  /**
   * 获取钱包余额
   */
  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      await this.init();
    }
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * 切换网络
   */
  async switchNetwork(chainId: number): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        throw new Error('Network not found. Please add it manually.');
      }
      throw error;
    }
  }

  /**
   * 获取钱包信息
   */
  async getWalletInfo(address: string): Promise<WalletInfo> {
    const [networkId, balance] = await Promise.all([
      this.getNetworkId(),
      this.getBalance(address),
    ]);
    return {
      address,
      networkId,
      balance,
    };
  }

  /**
   * 获取当前链上下文（兼容EVM/Solana）
   */
  async getChainContext(): Promise<ChainContext> {
    const chainFamily = (
      import.meta.env.VITE_CHAIN_FAMILY || 'evm'
    ).toLowerCase() as 'evm' | 'solana';

    if (chainFamily === 'solana') {
      return {
        chainFamily,
        chainId: 0,
        network: import.meta.env.VITE_CHAIN_NETWORK || 'solana-devnet',
      };
    }

    const chainId = await this.getNetworkId();
    return {
      chainFamily: 'evm',
      chainId,
      network: import.meta.env.VITE_CHAIN_NETWORK || '',
    };
  }
}

export const walletService = new WalletService();
