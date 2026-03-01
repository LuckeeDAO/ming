import { afterEach, describe, expect, it, vi } from 'vitest';
import { mingWalletInterface } from '../../services/wallet/mingWalletInterface';
import { walletWindowBridge } from '../../services/wallet/walletWindowBridge';
import {
  MintNFTRequest,
  ReleaseConnectionRequest,
  WalletSendTransactionRequest,
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

const sendTxRequest: WalletSendTransactionRequest = {
  protocolVersion: WALLET_PROTOCOL_VERSION,
  chainId: 43114,
  chainFamily: 'evm',
  to: '0x1234567890123456789012345678901234567890',
  data: '0xabcdef',
  value: '0',
  gasPolicy: {
    primary: 'self_pay',
    fallback: 'sponsored',
  },
  clientRequestId: 'req-123',
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

  it('应支持查询钱包当前活跃地址', async () => {
    const postMessageSpy = vi
      .spyOn(window, 'postMessage')
      .mockImplementation(((message: any, targetOrigin: string) => {
        expect(targetOrigin).toBe(window.location.origin);
        expect(message?.type).toBe('MING_WALLET_GET_ACTIVE_ACCOUNT_REQUEST');

        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent('message', {
              origin: window.location.origin,
              source: window,
              data: {
                type: 'MING_WALLET_GET_ACTIVE_ACCOUNT_RESPONSE',
                messageId: message.messageId,
                payload: {
                  success: true,
                  data: {
                    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
                    chainFamily: 'evm',
                    chainId: 43114,
                    network: 'avalanche-c-chain',
                    status: 'connected',
                  },
                },
              },
            })
          );
        }, 0);
      }) as typeof window.postMessage);

    const response = await mingWalletInterface.getActiveAccount({
      chainFamily: 'evm',
      chainId: 43114,
    });

    expect(postMessageSpy).toHaveBeenCalledOnce();
    expect(response.success).toBe(true);
    expect(response.data?.walletAddress).toBe(
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
    );
  });

  it('应支持跨窗口钱包来源的响应匹配（AnDaoWallet窗口）', async () => {
    const fakePostMessage = vi.fn();
    const fakeWalletWindow = {
      closed: false,
      focus: vi.fn(),
      postMessage: fakePostMessage,
    } as unknown as Window;

    vi.spyOn(walletWindowBridge, 'isExternalWalletConfigured').mockReturnValue(true);
    vi.spyOn(walletWindowBridge, 'openWalletWindow').mockReturnValue(fakeWalletWindow);
    vi.spyOn(walletWindowBridge, 'getRequestTargetWindow').mockReturnValue(fakeWalletWindow);
    vi.spyOn(walletWindowBridge, 'getExpectedResponseSource').mockReturnValue(fakeWalletWindow);
    vi.spyOn(walletWindowBridge, 'isExpectedResponseSource').mockImplementation(
      (source, expected) => source === expected
    );
    vi.spyOn(walletWindowBridge, 'getTargetOrigin').mockReturnValue('https://wallet.local');

    fakePostMessage.mockImplementation((message: any) => {
      setTimeout(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            origin: window.location.origin,
            source: fakeWalletWindow as unknown as MessageEventSource,
            data: {
              type: 'MING_WALLET_GET_ACTIVE_ACCOUNT_RESPONSE',
              messageId: message.messageId,
              payload: {
                success: true,
                data: {
                  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
                  chainFamily: 'evm',
                  chainId: 43114,
                  status: 'connected',
                },
              },
            },
          })
        );
      }, 0);
    });

    const response = await mingWalletInterface.getActiveAccount({
      chainFamily: 'evm',
      chainId: 43114,
    });

    expect(fakePostMessage).toHaveBeenCalledOnce();
    expect(response.success).toBe(true);
    expect(response.data?.walletAddress).toBe(
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
    );
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

  it('应支持通用交易发送并返回 effectiveGasPolicy', async () => {
    const postMessageSpy = vi
      .spyOn(window, 'postMessage')
      .mockImplementation(((message: any, targetOrigin: string) => {
        expect(targetOrigin).toBe(window.location.origin);
        expect(message?.type).toBe('MING_WALLET_SEND_TRANSACTION_REQUEST');
        expect(message?.payload?.gasPolicy?.primary).toBe('self_pay');
        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent('message', {
              origin: window.location.origin,
              source: window,
              data: {
                type: 'MING_WALLET_SEND_TRANSACTION_RESPONSE',
                messageId: message.messageId,
                payload: {
                  success: true,
                  data: {
                    txHash: '0xsendtx',
                    status: 'confirmed',
                    effectiveGasPolicy: 'sponsored',
                  },
                },
              },
            })
          );
        }, 0);
      }) as typeof window.postMessage);

    const response = await mingWalletInterface.sendTransaction(sendTxRequest);
    expect(postMessageSpy).toHaveBeenCalledOnce();
    expect(response.success).toBe(true);
    expect(response.data?.effectiveGasPolicy).toBe('sponsored');
  });

  it('sendTransaction fallback 与 primary 相同应返回 INVALID_PARAMS', async () => {
    const badRequest: WalletSendTransactionRequest = {
      ...sendTxRequest,
      gasPolicy: {
        primary: 'self_pay',
        fallback: 'self_pay',
      },
    };
    const postMessageSpy = vi.spyOn(window, 'postMessage');
    const response = await mingWalletInterface.sendTransaction(badRequest);
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe(WalletErrorCode.INVALID_PARAMS);
    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('sendTransaction 非法data应返回 INVALID_PARAMS', async () => {
    const badRequest: WalletSendTransactionRequest = {
      ...sendTxRequest,
      data: 'not-hex',
    };
    const postMessageSpy = vi.spyOn(window, 'postMessage');
    const response = await mingWalletInterface.sendTransaction(badRequest);
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe(WalletErrorCode.INVALID_PARAMS);
    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('应支持钱包事件订阅并接收 closeConfirmed', () => {
    const listener = vi.fn();
    const unsubscribe = mingWalletInterface.subscribeEvents(listener);

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        source: window,
        data: {
          type: 'MING_WALLET_EVENT',
          payload: {
            event: 'closeConfirmed',
            data: {
              tokenId: '1',
              txHash: '0xclose',
            },
          },
        },
      })
    );

    expect(listener).toHaveBeenCalledWith({
      event: 'closeConfirmed',
      data: {
        tokenId: '1',
        txHash: '0xclose',
      },
    });

    unsubscribe();
  });

  it('钱包事件订阅应忽略未知事件', () => {
    const listener = vi.fn();
    const unsubscribe = mingWalletInterface.subscribeEvents(listener);

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        source: window,
        data: {
          type: 'MING_WALLET_EVENT',
          payload: {
            event: 'unknownEvent',
            data: {
              tokenId: '1',
            },
          },
        },
      })
    );

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
