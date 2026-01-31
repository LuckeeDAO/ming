/**
 * 定时MINT操作 Hook
 * 
 * 功能（方案B：钱包管理定时任务）：
 * - 不再需要初始化定时MINT服务
 * - 不再需要执行任务（由钱包负责）
 * - 提供任务查询和取消功能
 * 
 * 使用说明：
 * - 定时任务现在由钱包管理
 * - 创建任务时调用scheduledMintService.createTask()
 * - 查询任务时调用scheduledMintService.getTask()
 * - 取消任务时调用scheduledMintService.cancelTask()
 * 
 * @module hooks/useScheduledMint
 */

import { useAppSelector } from '../store/hooks';
import { scheduledMintService } from '../services/scheduledMint/scheduledMintService';

/**
 * 定时MINT操作Hook
 * 
 * 注意：定时任务现在由钱包管理，此hook主要用于向后兼容
 */
export const useScheduledMint = () => {
  const { address: walletAddress } = useAppSelector((state) => state.wallet);

  // 不再需要初始化，定时任务由钱包管理
  // 保留此hook用于向后兼容，但不再执行任何操作

  return {
    // 提供任务查询功能（从钱包获取）
    getTask: scheduledMintService.getTask.bind(scheduledMintService),
    getAllTasks: scheduledMintService.getAllTasks.bind(scheduledMintService),
    getTasksByWallet: scheduledMintService.getTasksByWallet.bind(scheduledMintService),
    cancelTask: scheduledMintService.cancelTask.bind(scheduledMintService),
    walletAddress,
  };
};
