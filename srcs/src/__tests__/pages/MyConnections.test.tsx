import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MyConnections from '../../pages/MyConnections';
import { WalletEventEnvelope } from '../../types/wallet';

const mockDispatch = vi.fn();
const mockSelectorState = {
  wallet: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    networkId: 43114,
  },
};

const mockGetNFTMetadata = vi.fn();
const mockRefreshNFTs = vi.fn();
const mockUseNFT = vi.fn();

let walletEventListener: ((event: WalletEventEnvelope) => void) | null = null;

vi.mock('../../store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: typeof mockSelectorState) => unknown) => selector(mockSelectorState),
}));

vi.mock('../../hooks/useNFT', () => ({
  useNFT: () => mockUseNFT(),
}));

vi.mock('../../services/wallet/mingWalletInterface', () => ({
  mingWalletInterface: {
    subscribeEvents: vi.fn((listener: (event: WalletEventEnvelope) => void) => {
      walletEventListener = listener;
      return () => {
        walletEventListener = null;
      };
    }),
    sendTransaction: vi.fn(),
  },
}));

vi.mock('../../services/wallet/walletService', () => ({
  walletService: {
    getChainContext: vi.fn(async () => ({ chainFamily: 'evm', chainId: 43114, network: 'avalanche' })),
  },
}));

vi.mock('../../services/ipfs/ipfsService', () => ({
  ipfsService: {
    uploadJSON: vi.fn(async () => 'mock-hash'),
  },
}));

describe('MyConnections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    walletEventListener = null;

    mockGetNFTMetadata.mockResolvedValue({
      name: '连接记录 #1',
      description: '测试元数据',
      image: '',
      type: 'destiny_connection',
      attributes: [],
      scheduledMint: {
        scheduledTime: '2026-02-28T08:00:00.000Z',
        planId: 'plan-001',
      },
      energyField: {
        consensusHash: '0x' + 'a'.repeat(64),
      },
      metadata: {
        version: '1.0.0',
        createdAt: '2026-02-28T08:00:00.000Z',
        platform: 'ming',
      },
    });

    mockUseNFT.mockReturnValue({
      nfts: [
        {
          tokenId: '1',
          owner: '0x1234567890abcdef1234567890abcdef12345678',
          contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          tokenURI: 'ipfs://metadata-1',
          mintedAt: 1700000000,
          txHash: '0x' + '1'.repeat(64),
          blockNumber: 123,
        },
      ],
      loading: false,
      error: null,
      loadNFTs: vi.fn(),
      getNFTMetadata: mockGetNFTMetadata,
      mintNFT: vi.fn(),
      refreshNFTs: mockRefreshNFTs,
    });
  });

  it('在详情标题中展示 planId 并按 planId 显示匹配维度', async () => {
    render(
      <MemoryRouter>
        <MyConnections />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Token #1'));

    await waitFor(() => {
      expect(screen.getByText(/NFT 详情 - Token #1 \(Plan: plan-001\)/)).toBeInTheDocument();
    });

    expect(screen.getByText(/事件匹配维度：planId \(planId: plan-001\)/)).toBeInTheDocument();
  });

  it('有 selected planId 时应忽略 tokenId 匹配但 planId 不匹配的事件', async () => {
    render(
      <MemoryRouter>
        <MyConnections />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Token #1'));

    await waitFor(() => {
      expect(screen.getByText(/事件匹配维度：planId \(planId: plan-001\)/)).toBeInTheDocument();
    });

    expect(screen.getByText('closeConfirmed')).toBeInTheDocument();

    act(() => {
      walletEventListener?.({
        event: 'closeConfirmed',
        data: {
          tokenId: '1',
          planId: 'plan-999',
          txHash: '0x-mismatch',
        },
      });
    });

    expect(screen.queryByText('closeConfirmed ✓')).not.toBeInTheDocument();

    act(() => {
      walletEventListener?.({
        event: 'closeConfirmed',
        data: {
          tokenId: '1',
          planId: 'plan-001',
          txHash: '0x-match',
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByText('closeConfirmed ✓')).toBeInTheDocument();
    });
  });
});
