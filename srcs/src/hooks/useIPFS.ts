/**
 * IPFS操作 Hook
 * 
 * 提供IPFS相关的操作功能，包括：
 * - 上传文件到IPFS
 * - 上传JSON数据到IPFS
 * - 从IPFS获取文件
 * - 从IPFS获取JSON数据
 * 
 * 使用说明：
 * 1. 需要先初始化IPFS服务（配置Pinata API密钥）
 * 2. 使用相应的方法进行IPFS操作
 * 
 * @module hooks/useIPFS
 */

import { useState, useCallback } from 'react';
import { ipfsService, IPFSConfig } from '../services/ipfs/ipfsService';

/**
 * IPFS操作Hook返回值接口
 */
interface UseIPFSReturn {
  // 状态
  uploading: boolean;
  error: string | null;
  
  // 方法
  init: (config: IPFSConfig) => void;
  uploadFile: (file: File) => Promise<string>;
  uploadJSON: (data: object) => Promise<string>;
  getFile: (hash: string) => Promise<Blob>;
  getJSON: <T = any>(hash: string) => Promise<T>;
  getAccessUrl: (hash: string) => string;
}

/**
 * IPFS操作Hook
 * 
 * @param initialConfig - 初始IPFS配置（可选）
 * @returns IPFS操作相关的方法和状态
 */
export const useIPFS = (initialConfig?: IPFSConfig): UseIPFSReturn => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * 初始化IPFS服务
   * 
   * @param config - IPFS配置
   */
  const init = useCallback((config: IPFSConfig) => {
    ipfsService.init(config);
  }, []);
  
  /**
   * 上传文件到IPFS
   * 
   * @param file - 要上传的文件
   * @returns IPFS哈希（CID）
   */
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    setError(null);
    
    try {
      const hash = await ipfsService.uploadFile(file);
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);
  
  /**
   * 上传JSON数据到IPFS
   * 
   * @param data - 要上传的JSON对象
   * @returns IPFS哈希（CID）
   */
  const uploadJSON = useCallback(async (data: object): Promise<string> => {
    setUploading(true);
    setError(null);
    
    try {
      const hash = await ipfsService.uploadJSON(data);
      return hash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload JSON';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);
  
  /**
   * 从IPFS获取文件
   * 
   * @param hash - IPFS哈希（CID）
   * @returns 文件Blob
   */
  const getFile = useCallback(async (hash: string): Promise<Blob> => {
    setError(null);
    
    try {
      return await ipfsService.getFile(hash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get file';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  /**
   * 从IPFS获取JSON数据
   * 
   * @param hash - IPFS哈希（CID）
   * @returns JSON对象
   */
  const getJSON = useCallback(async <T = any>(hash: string): Promise<T> => {
    setError(null);
    
    try {
      return await ipfsService.getJSON<T>(hash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get JSON';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  /**
   * 获取IPFS文件的访问URL
   * 
   * @param hash - IPFS哈希（CID）
   * @returns 完整的访问URL
   */
  const getAccessUrl = useCallback((hash: string): string => {
    return ipfsService.getAccessUrl(hash);
  }, []);
  
  // 如果提供了初始配置，自动初始化
  if (initialConfig) {
    init(initialConfig);
  }
  
  return {
    uploading,
    error,
    init,
    uploadFile,
    uploadJSON,
    getFile,
    getJSON,
    getAccessUrl,
  };
};
