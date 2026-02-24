/**
 * NFT操作 Hook
 * 
 * 提供NFT相关的操作功能，包括：
 * - 查询用户的NFT列表
 * - 获取NFT详情
 * - 铸造NFT
 * - 跟踪交易状态
 * 
 * 使用说明：
 * 1. 需要先连接钱包
 * 2. 需要初始化合约服务
 * 3. 使用相应的方法进行NFT操作
 * 
 * @module hooks/useNFT
 */

import { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { nftContractService, ConnectionNFTConfig } from '../services/contract/nftContract';
import { NFTOnChain, NFTMetadata } from '../types/nft';
import { ipfsService } from '../services/ipfs/ipfsService';
import { CONTRACT_ADDRESSES } from '../utils/constants';

/**
 * NFT操作Hook返回值接口
 */
interface UseNFTReturn {
  // 状态
  nfts: NFTOnChain[];
  loading: boolean;
  error: string | null;
  
  // 方法
  loadNFTs: () => Promise<void>;
  getNFTMetadata: (tokenURI: string) => Promise<NFTMetadata | null>;
  mintNFT: (
    tokenURI: string,
    externalObjectId: string,
    element: string,
    consensusHash: string
  ) => Promise<{ tokenId: string; txHash: string }>;
  refreshNFTs: () => Promise<void>;
}

/**
 * NFT操作Hook
 * 
 * @param contractConfig - 合约配置（可选，如果不提供则从Redux store获取）
 * @returns NFT操作相关的方法和状态
 */
export const useNFT = (contractConfig?: ConnectionNFTConfig): UseNFTReturn => {
  const { address: walletAddress, networkId } = useAppSelector((state) => state.wallet);
  
  const [nfts, setNfts] = useState<NFTOnChain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * 初始化合约服务
   */
  const initContract = useCallback(async () => {
    if (!walletAddress || !networkId) {
      throw new Error('Wallet not connected');
    }
    
    const contractAddress = contractConfig?.contractAddress || 
                           CONTRACT_ADDRESSES[networkId];
    
    if (!contractAddress) {
      throw new Error('Contract not deployed on this network');
    }
    
    await nftContractService.init({
      contractAddress,
      chainId: networkId,
    });
  }, [walletAddress, networkId, contractConfig]);
  
  /**
   * 加载用户的NFT列表
   */
  const loadNFTs = useCallback(async () => {
    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await initContract();
      const userNFTs = await nftContractService.getUserNFTs(walletAddress);
      setNfts(userNFTs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NFTs';
      setError(errorMessage);
      console.error('Error loading NFTs:', err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, initContract]);
  
  /**
   * 获取NFT元数据
   * 
   * @param tokenURI - Token URI（IPFS哈希或URL）
   * @returns NFT元数据对象
   */
  const getNFTMetadata = useCallback(async (
    tokenURI: string
  ): Promise<NFTMetadata | null> => {
    try {
      // 如果是IPFS哈希，从IPFS获取
      if (tokenURI.startsWith('ipfs://')) {
        const hash = tokenURI.replace('ipfs://', '');
        return await ipfsService.getJSON<NFTMetadata>(hash);
      }
      
      // 如果是HTTP URL，直接获取
      if (tokenURI.startsWith('http://') || tokenURI.startsWith('https://')) {
        const response = await fetch(tokenURI);
        return await response.json();
      }
      
      // 否则作为IPFS哈希处理
      return await ipfsService.getJSON<NFTMetadata>(tokenURI);
    } catch (err) {
      console.error('Error getting NFT metadata:', err);
      return null;
    }
  }, []);
  
  /**
   * 铸造NFT（已废弃）
   *
   * 当前项目的铸造路径已迁移到钱包消息协议（mingWalletInterface.mintNFT）。
   * 本方法保留仅用于兼容历史调用方，统一返回明确错误，避免误用旧的直连合约路径。
   */
  const mintNFT = useCallback(async (
    _tokenURI: string,
    _externalObjectId: string,
    _element: string,
    _consensusHash: string
  ): Promise<{ tokenId: string; txHash: string }> => {
    const message = 'useNFT.mintNFT() is deprecated. Please use mingWalletInterface.mintNFT() via ceremony flow.';
    setError(message);
    throw new Error(message);
  }, []);
  
  /**
   * 刷新NFT列表
   */
  const refreshNFTs = useCallback(async () => {
    await loadNFTs();
  }, [loadNFTs]);
  
  // 当钱包地址或网络ID变化时，自动加载NFT
  useEffect(() => {
    if (walletAddress && networkId) {
      loadNFTs();
    }
  }, [walletAddress, networkId, loadNFTs]);
  
  return {
    nfts,
    loading,
    error,
    loadNFTs,
    getNFTMetadata,
    mintNFT,
    refreshNFTs,
  };
};
