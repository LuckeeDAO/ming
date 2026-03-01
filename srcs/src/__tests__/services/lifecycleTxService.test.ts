import { describe, expect, it, vi } from 'vitest';
import {
  buildLifecycleRequests,
  buildReviewCommentHash,
  executeLifecycleFlow,
} from '../../services/wallet/lifecycleTxService';
import { WalletSendTransactionRequest } from '../../types/wallet';

describe('lifecycleTxService', () => {
  it('应构建 close/review/release 三笔请求', () => {
    const requests = buildLifecycleRequests({
      chainId: 43114,
      chainFamily: 'evm',
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '1',
      rating: 5,
      commentHash: buildReviewCommentHash('test'),
      clientRequestIdPrefix: 'uc01',
    });

    expect(requests).toHaveLength(3);
    expect(requests[0].clientRequestId).toBe('uc01-close');
    expect(requests[1].clientRequestId).toBe('uc01-review');
    expect(requests[2].clientRequestId).toBe('uc01-release');
    expect(requests[0].data.startsWith('0x')).toBe(true);
  });

  it('evm 非数字 tokenId 应抛错', () => {
    expect(() =>
      buildLifecycleRequests({
        chainId: 43114,
        chainFamily: 'evm',
        contractAddress: '0x1234567890123456789012345678901234567890',
        tokenId: 'connection:42',
        rating: 5,
        commentHash: buildReviewCommentHash('test'),
      }),
    ).toThrow('EVM tokenId must be numeric string');
  });

  it('executeLifecycleFlow 只接受 confirmed 状态', async () => {
    const requests: WalletSendTransactionRequest[] = buildLifecycleRequests({
      chainId: 43114,
      chainFamily: 'evm',
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '1',
      rating: 4,
      commentHash: buildReviewCommentHash('confirm'),
    });

    const sendTransaction = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        data: { txHash: '0xclose', status: 'confirmed' },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { txHash: '0xreview', status: 'confirmed' },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { txHash: '0xrelease', status: 'confirmed' },
      });

    const result = await executeLifecycleFlow(sendTransaction, requests);
    expect(result.closeTxHash).toBe('0xclose');
    expect(result.reviewTxHash).toBe('0xreview');
    expect(result.releaseTxHash).toBe('0xrelease');
  });

  it('executeLifecycleFlow 任一 submitted 都应失败', async () => {
    const requests: WalletSendTransactionRequest[] = buildLifecycleRequests({
      chainId: 43114,
      chainFamily: 'evm',
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '1',
      rating: 4,
      commentHash: buildReviewCommentHash('submitted'),
    });

    const sendTransaction = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        data: { txHash: '0xclose', status: 'submitted' },
      });

    await expect(executeLifecycleFlow(sendTransaction, requests)).rejects.toThrow(
      'close transaction is not confirmed',
    );
  });

  it('executeLifecycleFlow 应按顺序触发步骤回调', async () => {
    const requests: WalletSendTransactionRequest[] = buildLifecycleRequests({
      chainId: 43114,
      chainFamily: 'evm',
      contractAddress: '0x1234567890123456789012345678901234567890',
      tokenId: '1',
      rating: 4,
      commentHash: buildReviewCommentHash('callbacks'),
    });

    const sendTransaction = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        data: { txHash: '0xclose', status: 'confirmed' },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { txHash: '0xreview', status: 'confirmed' },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { txHash: '0xrelease', status: 'confirmed' },
      });

    const onStepStarted = vi.fn();
    const onStepConfirmed = vi.fn();
    const onStepFailed = vi.fn();

    await executeLifecycleFlow(sendTransaction, requests, {
      onStepStarted,
      onStepConfirmed,
      onStepFailed,
    });

    expect(onStepStarted.mock.calls.map((call) => call[0])).toEqual([
      'close',
      'review',
      'release',
    ]);
    expect(onStepConfirmed.mock.calls.map((call) => call[0])).toEqual([
      'close',
      'review',
      'release',
    ]);
    expect(onStepFailed).not.toHaveBeenCalled();
  });
});
