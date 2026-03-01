import { ethers } from 'ethers';
import {
  GasPolicy,
  WalletSendTransactionRequest,
  WalletSendTransactionResponse,
  WALLET_PROTOCOL_VERSION,
} from '../../types/wallet';

const DEFAULT_GAS_POLICY: GasPolicy = {
  primary: 'sponsored',
  fallback: 'self_pay',
};

const LIFECYCLE_ABI = [
  'function close(uint256 tokenId)',
  'function review(uint256 tokenId,uint8 rating,bytes32 commentHash)',
  'function release(uint256 tokenId)',
] as const;

const lifecycleInterface = new ethers.Interface(LIFECYCLE_ABI);

export interface BuildLifecycleRequestsInput {
  chainId: number;
  chainFamily?: 'evm' | 'solana';
  network?: string;
  contractAddress: string;
  tokenId: string;
  rating: number;
  commentHash: string;
  gasPolicy?: GasPolicy;
  clientRequestIdPrefix?: string;
}

export interface LifecycleExecutionResult {
  closeTxHash: string;
  reviewTxHash: string;
  releaseTxHash: string;
}

export type LifecycleAction = 'close' | 'review' | 'release';

export interface LifecycleExecutionCallbacks {
  onStepStarted?: (action: LifecycleAction) => void;
  onStepConfirmed?: (action: LifecycleAction, txHash: string) => void;
  onStepFailed?: (action: LifecycleAction, errorMessage: string) => void;
}

export type SendTransactionLike = (
  request: WalletSendTransactionRequest,
) => Promise<WalletSendTransactionResponse>;

export function buildReviewCommentHash(input: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

function encodeLifecycleData(
  chainFamily: 'evm' | 'solana',
  action: 'close' | 'review' | 'release',
  payload: { tokenId: string; rating?: number; commentHash?: string },
): string {
  if (chainFamily === 'evm') {
    if (!/^\d+$/.test(payload.tokenId)) {
      throw new Error('EVM tokenId must be numeric string');
    }

    if (action === 'close') {
      return lifecycleInterface.encodeFunctionData('close', [payload.tokenId]);
    }
    if (action === 'review') {
      if (!payload.rating || !payload.commentHash) {
        throw new Error('review payload is incomplete');
      }
      return lifecycleInterface.encodeFunctionData('review', [
        payload.tokenId,
        payload.rating,
        payload.commentHash,
      ]);
    }
    return lifecycleInterface.encodeFunctionData('release', [payload.tokenId]);
  }

  const raw = JSON.stringify({
    action,
    tokenId: payload.tokenId,
    rating: payload.rating,
    commentHash: payload.commentHash,
  });
  return ethers.hexlify(ethers.toUtf8Bytes(raw));
}

export function buildLifecycleRequests(
  input: BuildLifecycleRequestsInput,
): WalletSendTransactionRequest[] {
  const chainFamily = input.chainFamily || 'evm';
  const gasPolicy = input.gasPolicy || DEFAULT_GAS_POLICY;
  const prefix = input.clientRequestIdPrefix || `lifecycle-${Date.now()}`;

  const closeRequest: WalletSendTransactionRequest = {
    protocolVersion: WALLET_PROTOCOL_VERSION,
    chainId: input.chainId,
    chainFamily,
    network: input.network,
    to: input.contractAddress,
    data: encodeLifecycleData(chainFamily, 'close', {
      tokenId: input.tokenId,
    }),
    gasPolicy,
    clientRequestId: `${prefix}-close`,
  };

  const reviewRequest: WalletSendTransactionRequest = {
    protocolVersion: WALLET_PROTOCOL_VERSION,
    chainId: input.chainId,
    chainFamily,
    network: input.network,
    to: input.contractAddress,
    data: encodeLifecycleData(chainFamily, 'review', {
      tokenId: input.tokenId,
      rating: input.rating,
      commentHash: input.commentHash,
    }),
    gasPolicy,
    clientRequestId: `${prefix}-review`,
  };

  const releaseRequest: WalletSendTransactionRequest = {
    protocolVersion: WALLET_PROTOCOL_VERSION,
    chainId: input.chainId,
    chainFamily,
    network: input.network,
    to: input.contractAddress,
    data: encodeLifecycleData(chainFamily, 'release', {
      tokenId: input.tokenId,
    }),
    gasPolicy,
    clientRequestId: `${prefix}-release`,
  };

  return [closeRequest, reviewRequest, releaseRequest];
}

function ensureConfirmed(
  response: WalletSendTransactionResponse,
  action: 'close' | 'review' | 'release',
): string {
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || `${action} transaction failed`);
  }
  if (response.data.status !== 'confirmed') {
    throw new Error(`${action} transaction is not confirmed`);
  }
  return response.data.txHash;
}

export async function executeLifecycleFlow(
  sendTransaction: SendTransactionLike,
  requests: WalletSendTransactionRequest[],
  callbacks?: LifecycleExecutionCallbacks,
): Promise<LifecycleExecutionResult> {
  if (requests.length !== 3) {
    throw new Error('Lifecycle flow requires exactly 3 requests');
  }

  callbacks?.onStepStarted?.('close');
  let closeTxHash: string;
  try {
    closeTxHash = ensureConfirmed(await sendTransaction(requests[0]), 'close');
    callbacks?.onStepConfirmed?.('close', closeTxHash);
  } catch (error) {
    callbacks?.onStepFailed?.('close', error instanceof Error ? error.message : 'close failed');
    throw error;
  }

  callbacks?.onStepStarted?.('review');
  let reviewTxHash: string;
  try {
    reviewTxHash = ensureConfirmed(await sendTransaction(requests[1]), 'review');
    callbacks?.onStepConfirmed?.('review', reviewTxHash);
  } catch (error) {
    callbacks?.onStepFailed?.('review', error instanceof Error ? error.message : 'review failed');
    throw error;
  }

  callbacks?.onStepStarted?.('release');
  let releaseTxHash: string;
  try {
    releaseTxHash = ensureConfirmed(await sendTransaction(requests[2]), 'release');
    callbacks?.onStepConfirmed?.('release', releaseTxHash);
  } catch (error) {
    callbacks?.onStepFailed?.('release', error instanceof Error ? error.message : 'release failed');
    throw error;
  }

  return {
    closeTxHash,
    reviewTxHash,
    releaseTxHash,
  };
}
