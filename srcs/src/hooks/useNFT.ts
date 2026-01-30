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
import { ethers } from 'ethers';
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
   * 铸造NFT
   * 
   * @param tokenURI - IPFS元数据URI
   * @param externalObjectId - 外物ID
   * @param element - 能量类型
   * @param consensusHash - 共识哈希
   * @returns 铸造结果（包含tokenId和txHash）
   */
  const mintNFT = useCallback(async (
    tokenURI: string,
    externalObjectId: string,
    element: string,
    consensusHash: string
  ): Promise<{ tokenId: string; txHash: string }> => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await initContract();
      
      // 将共识哈希转换为bytes32
      // 如果已经是32字节的十六进制字符串，直接使用；否则进行格式化
      let hashBytes: string;
      if (consensusHash.startsWith('0x') && consensusHash.length === 66) {
        hashBytes = consensusHash;
      } else {
        // 使用keccak256哈希函数处理字符串
        hashBytes = ethers.keccak256(ethers.toUtf8Bytes(consensusHash));
      }
      
      // 调用合约铸造NFT
      const txHash = await nftContractService.mintConnection(
        walletAddress,
        tokenURI,
        externalObjectId,
        element,
        hashBytes
      );
      
      // 从交易中获取Token ID
      const tokenId = await nftContractService.getTokenIdFromTransaction(txHash);
      
      // 刷新NFT列表
      await loadNFTs();
      
      return { tokenId, txHash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mint NFT';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletAddress, initContract, loadNFTs]);
  
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
