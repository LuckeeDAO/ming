/**
 * 定时MINT操作 Hook
 * 
 * 功能：
 * - 初始化定时MINT服务
 * - 提供任务执行回调函数
 * - 管理定时任务的执行流程
 * 
 * 使用说明：
 * - 在应用启动时调用此hook以初始化定时MINT服务
 * - 服务会自动轮询检查待执行任务并执行
 * 
 * @module hooks/useScheduledMint
 */

import { useEffect, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import {
  scheduledMintService,
  ScheduledMintTask,
} from '../services/scheduledMint/scheduledMintService';
import { ipfsService } from '../services/ipfs/ipfsService';
import { nftContractService } from '../services/contract/nftContract';
import { walletService } from '../services/wallet/walletService';
import { ethers } from 'ethers';

/**
 * 定时MINT操作Hook
 * 
 * 自动初始化定时MINT服务，并在应用启动时开始轮询检查
 */
export const useScheduledMint = () => {
  const { address: walletAddress, networkId } = useAppSelector((state) => state.wallet);

  /**
   * 执行定时任务（NFT铸造）
   * 
   * @param task - 定时任务对象
   */
  const executeTask = useCallback(async (task: ScheduledMintTask) => {
    if (!walletAddress || !networkId) {
      throw new Error('钱包未连接');
    }

    try {
      // 1. 将base64图片转换为Blob
      const imageBlob = scheduledMintService.base64ToBlob(task.imageData);
      const imageFile = new File([imageBlob], task.imageFileName, { type: imageBlob.type });

      // 2. 上传图片到IPFS
      const imageHash = await ipfsService.uploadFile(imageFile);

      // 3. 生成NFT元数据
      const metadata = {
        name: `外物连接 - ${task.selectedObject.name}`,
        description: `与${task.selectedObject.name}的连接仪式见证`,
        image: ipfsService.getAccessUrl(imageHash),
        attributes: [
          { trait_type: '外物', value: task.selectedObject.name },
          { trait_type: '五行属性', value: task.selectedObject.element },
          { trait_type: '连接类型', value: task.connectionType },
        ],
        connection: {
          externalObjectId: task.selectedObject.id,
          externalObjectName: task.selectedObject.name,
          element: task.selectedObject.element,
          connectionType: task.connectionType,
          connectionDate: new Date().toISOString(),
        },
        ceremony: {
          location: task.location,
          duration: task.duration,
        },
        feelings: {
          before: task.feelingsBefore,
          during: task.feelingsDuring,
          after: task.feelingsAfter,
        },
        ...(task.blessing && {
          blessing: {
            text: task.blessing,
            timestamp: new Date().toISOString(),
          },
        }),
        scheduledMint: {
          scheduledTime: task.scheduledTime,
          mintedTime: new Date().toISOString(),
        },
        energyField: {
          consensusHash: '',
        },
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          platform: 'ming',
        },
      };

      // 4. 上传元数据到IPFS
      const metadataHash = await ipfsService.uploadJSON(metadata);
      const tokenURI = ipfsService.getAccessUrl(metadataHash);

      // 5. 生成共识哈希
      const consensusHash = ethers.keccak256(ethers.toUtf8Bytes(metadataHash));

      // 6. 初始化合约服务
      const chainId = await walletService.getNetworkId();
      const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        throw new Error('NFT合约地址未配置');
      }
      
      await nftContractService.init({
        contractAddress,
        chainId,
      });

      // 7. 调用合约铸造NFT
      const txHash = await nftContractService.mintConnection(
        walletAddress,
        tokenURI,
        task.selectedObject.id,
        task.selectedObject.element,
        consensusHash
      );

      // 8. 获取Token ID
      const tokenId = await nftContractService.getTokenIdFromTransaction(txHash);

      // 9. 更新任务信息
      task.txHash = txHash;
      task.tokenId = tokenId;
      task.tokenURI = tokenURI;
      scheduledMintService.updateTask(task);
    } catch (error) {
      console.error('Error executing scheduled mint task:', error);
      throw error;
    }
  }, [walletAddress, networkId]);

  // 初始化定时MINT服务
  useEffect(() => {
    if (walletAddress && networkId) {
      scheduledMintService.init(executeTask);
    }

    // 清理函数：停止轮询
    return () => {
      scheduledMintService.stopPolling();
    };
  }, [walletAddress, networkId, executeTask]);

  return {
    executeTask,
  };
};
