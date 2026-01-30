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

export const useWallet = () => {
  /**
   * 连接钱包
   * 请求用户授权并获取钱包地址
   * 
   * @returns {Promise<string | null>} 钱包地址，失败返回 null
   * @throws {Error} 如果 MetaMask 未安装或用户拒绝连接
   */
  const connect = useCallback(async (): Promise<string | null> => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        return accounts[0] || null;
      } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
      }
    } else {
      throw new Error('MetaMask is not installed');
    }
  }, []);

  /**
   * 断开钱包连接
   * 注意：MetaMask 没有官方的断开方法
   * 此方法主要用于清除本地状态
   */
  const disconnect = useCallback(() => {
    // MetaMask doesn't have a disconnect method
    // Just clear local state
  }, []);

  /**
   * 获取钱包余额
   * 
   * @param {string} address - 钱包地址
   * @returns {Promise<string>} 余额（以 ETH 为单位）
   * @throws {Error} 如果 MetaMask 未安装或查询失败
   */
  const getBalance = useCallback(async (address: string): Promise<string> => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      } catch (error) {
        console.error('Error getting balance:', error);
        throw error;
      }
    }
    throw new Error('MetaMask is not installed');
  }, []);

  return {
    connect,
    disconnect,
    getBalance,
  };
};
