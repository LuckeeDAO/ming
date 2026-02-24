import { afterEach, describe, expect, it, vi } from 'vitest';
import { mingWalletInterface } from '../../services/wallet/mingWalletInterface';
import { MintNFTRequest } from '../../types/wallet';

const mintRequest: MintNFTRequest = {
  ipfs: {
    imageHash: 'QmImageHash',
    metadataHash: 'QmMetadataHash',
    imageURI: 'https://gateway.pinata.cloud/ipfs/QmImageHash',
    tokenURI: 'https://gateway.pinata.cloud/ipfs/QmMetadataHash',
  },
  consensusHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  contract: {
    address: '0x1234567890123456789012345678901234567890',
    chainId: 43113,
  },
  params: {
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    tokenURI: 'https://gateway.pinata.cloud/ipfs/QmMetadataHash',
    externalObjectId: 'wood-001',
    element: 'wood',
    consensusHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
};

describe('mingWalletInterface', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('应该使用可信targetOrigin发送消息并正确处理成功响应', async () => {
    const postMessageSpy = vi
      .spyOn(window, 'postMessage')
      .mockImplementation(((message: any, targetOrigin: string) => {
        // 校验默认目标源为同源
        expect(targetOrigin).toBe(window.location.origin);

        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent('message', {
              origin: window.location.origin,
              source: window,
              data: {
                type: 'MING_WALLET_MINT_NFT_RESPONSE',
                messageId: message.messageId,
                payload: {
                  success: true,
                  data: {
                    tokenId: '1',
                    txHash: '0xabc',
                    blockNumber: 100,
                  },
                },
              },
            })
          );
        }, 0);
      }) as typeof window.postMessage);

    const response = await mingWalletInterface.mintNFT(mintRequest);

    expect(postMessageSpy).toHaveBeenCalledOnce();
    expect(response.success).toBe(true);
    expect(response.data?.tokenId).toBe('1');
  });

  it('应该忽略非法origin响应并最终超时返回错误', async () => {
    vi.useFakeTimers();

    vi.spyOn(window, 'postMessage').mockImplementation(((message: any) => {
      setTimeout(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            origin: 'https://evil.example',
            source: window,
            data: {
              type: 'MING_WALLET_MINT_NFT_RESPONSE',
              messageId: message.messageId,
              payload: {
                success: true,
                data: {
                  tokenId: '1',
                  txHash: '0xabc',
                  blockNumber: 100,
                },
              },
            },
          })
        );
      }, 0);
    }) as typeof window.postMessage);

    const responsePromise = mingWalletInterface.mintNFT(mintRequest);

    await vi.runAllTimersAsync();
    const response = await responsePromise;

    expect(response.success).toBe(false);
    expect(response.error?.message).toContain('timeout');
  });
});
