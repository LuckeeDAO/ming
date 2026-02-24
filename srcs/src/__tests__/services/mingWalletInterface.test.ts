import { afterEach, describe, expect, it, vi } from 'vitest';
import { mingWalletInterface } from '../../services/wallet/mingWalletInterface';
import {
  MintNFTRequest,
  ReleaseConnectionRequest,
  WalletErrorCode,
  WALLET_PROTOCOL_VERSION,
} from '../../types/wallet';

const mintRequest: MintNFTRequest = {
  protocolVersion: WALLET_PROTOCOL_VERSION,
  timing: {
    requestedAt: '2026-02-24T00:00:00.000Z',
    executeAt: '2026-02-24T00:00:00.000Z',
    strategy: 'immediate',
    timezone: 'Asia/Shanghai',
  },
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

const solanaMintRequest: MintNFTRequest = {
  protocolVersion: WALLET_PROTOCOL_VERSION,
  timing: {
    requestedAt: '2026-02-24T00:00:00.000Z',
    executeAt: '2026-02-24T00:00:00.000Z',
    strategy: 'immediate',
    timezone: 'Asia/Shanghai',
  },
  ipfs: {
    imageHash: 'QmImageHash',
    metadataHash: 'QmMetadataHash',
    imageURI: 'ipfs://QmImageHash',
    tokenURI: 'ipfs://QmMetadataHash',
  },
  consensusHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  contract: {
    address: '5Ga3kk79rpPJy5joLvZKoJowRsEGvfcMpSDqAahYEVKT',
    chainId: 0,
    chainFamily: 'solana',
    network: 'solana-devnet',
  },
  params: {
    to: '8J8W1ahh6Y1cM1k8oYyU7F2jmYb5x1p6DYk7tV4hyU2S',
    tokenURI: 'ipfs://QmMetadataHash',
    externalObjectId: 'wood-001',
    element: '木',
    consensusHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
};

const releaseRequest: ReleaseConnectionRequest = {
  protocolVersion: WALLET_PROTOCOL_VERSION,
  contract: {
    address: '5Ga3kk79rpPJy5joLvZKoJowRsEGvfcMpSDqAahYEVKT',
    chainId: 0,
    chainFamily: 'solana',
    network: 'solana-devnet',
  },
  params: {
    tokenId: 'connection:42',
    releasedTokenURI: 'ipfs://QmReleasedMetadata',
    removePrivateData: true,
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
        expect(message?.payload?.protocolVersion).toBe('1.0.0');

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
    expect(response.error?.code).toBe(WalletErrorCode.NETWORK_ERROR);
  });

  it('solana请求缺少network时应返回CHAIN_NOT_SUPPORTED', async () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage');
    const invalidRequest: MintNFTRequest = {
      ...solanaMintRequest,
      contract: {
        ...solanaMintRequest.contract,
        network: '',
      },
    };

    const response = await mingWalletInterface.mintNFT(invalidRequest);
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe(WalletErrorCode.CHAIN_NOT_SUPPORTED);
    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('solana请求非法consensusHash时应返回INVALID_PARAMS', async () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage');
    const invalidRequest: MintNFTRequest = {
      ...solanaMintRequest,
      consensusHash: 'abc',
    };

    const response = await mingWalletInterface.mintNFT(invalidRequest);
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe(WalletErrorCode.INVALID_PARAMS);
    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('应支持solana地址与链参数并成功发送请求', async () => {
    const postMessageSpy = vi
      .spyOn(window, 'postMessage')
      .mockImplementation(((message: any, targetOrigin: string) => {
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
                    tokenId: 'sol-1',
                    txHash: '5HxSolanaTxHash',
                    blockNumber: 0,
                  },
                },
              },
            })
          );
        }, 0);
      }) as typeof window.postMessage);

    const response = await mingWalletInterface.mintNFT(solanaMintRequest);
    expect(postMessageSpy).toHaveBeenCalledOnce();
    expect(response.success).toBe(true);
    expect(response.data?.tokenId).toBe('sol-1');
  });

  it('封局释放请求应成功发送并返回结果', async () => {
    vi.spyOn(window, 'postMessage').mockImplementation(((message: any, targetOrigin: string) => {
      expect(targetOrigin).toBe(window.location.origin);
      setTimeout(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            origin: window.location.origin,
            source: window,
            data: {
              type: 'MING_WALLET_RELEASE_CONNECTION_NFT_RESPONSE',
              messageId: message.messageId,
              payload: {
                success: true,
                data: {
                  tokenId: 'connection:42',
                  txHash: '5HxReleasedTx',
                  blockNumber: 0,
                },
              },
            },
          })
        );
      }, 0);
    }) as typeof window.postMessage);

    const response = await mingWalletInterface.releaseConnectionNFT(releaseRequest);
    expect(response.success).toBe(true);
    expect(response.data?.tokenId).toBe('connection:42');
  });

  it('封局释放请求非法URI应返回INVALID_PARAMS', async () => {
    const badRequest: ReleaseConnectionRequest = {
      ...releaseRequest,
      params: {
        ...releaseRequest.params,
        releasedTokenURI: 'javascript:alert(1)',
      },
    };
    const postMessageSpy = vi.spyOn(window, 'postMessage');
    const response = await mingWalletInterface.releaseConnectionNFT(badRequest);
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe(WalletErrorCode.INVALID_PARAMS);
    expect(postMessageSpy).not.toHaveBeenCalled();
  });
});
