import { ClosurePolicy, GasPolicy, GasPolicyType } from '../../types/wallet';

const DEFAULT_CLOSE_AFTER_SECONDS = 259200;

const SELF_PAY_FALLBACK_ERRORS = new Set(['INSUFFICIENT_FUNDS']);
const SPONSORED_FALLBACK_ERRORS = new Set([
  'PAYMASTER_REJECTED',
  'PAYMASTER_UNAVAILABLE',
]);

export interface ResolveGasPolicyOptions {
  gasPolicy: GasPolicy;
  attemptErrorCode?: string;
}

export interface ResolvedGasPolicy {
  attempted: GasPolicyType;
  fallbackTriggered: boolean;
  effective: GasPolicyType;
}

export interface ResolveCloseAtOptions {
  mintConfirmedAt: string;
  closurePolicy?: ClosurePolicy;
}

export interface LifecycleReceipts {
  closeTxHash?: string;
  reviewTxHash?: string;
  releaseTxHash?: string;
}

export function normalizeGasPolicy(policy: GasPolicy): GasPolicy {
  if (!policy.primary) {
    throw new Error('gasPolicy.primary is required');
  }
  if (policy.fallback && policy.fallback === policy.primary) {
    throw new Error('gasPolicy.fallback must be different from primary');
  }
  return policy;
}

export function shouldFallbackGasPolicy(
  primary: GasPolicyType,
  errorCode?: string,
): boolean {
  if (!errorCode) {
    return false;
  }
  if (primary === 'self_pay') {
    return SELF_PAY_FALLBACK_ERRORS.has(errorCode);
  }
  return SPONSORED_FALLBACK_ERRORS.has(errorCode);
}

export function resolveGasPolicyForSingleTransaction(
  options: ResolveGasPolicyOptions,
): ResolvedGasPolicy {
  const policy = normalizeGasPolicy(options.gasPolicy);
  const fallbackTriggered =
    Boolean(policy.fallback) &&
    shouldFallbackGasPolicy(policy.primary, options.attemptErrorCode);

  return {
    attempted: policy.primary,
    fallbackTriggered,
    effective: fallbackTriggered ? (policy.fallback as GasPolicyType) : policy.primary,
  };
}

export function resolveCloseAt(options: ResolveCloseAtOptions): string {
  const mintTime = new Date(options.mintConfirmedAt);
  if (Number.isNaN(mintTime.getTime())) {
    throw new Error('mintConfirmedAt must be valid ISO datetime');
  }

  const providedCloseAt = options.closurePolicy?.closeAt;
  if (providedCloseAt) {
    const closeTime = new Date(providedCloseAt);
    if (Number.isNaN(closeTime.getTime())) {
      throw new Error('closurePolicy.closeAt must be valid ISO datetime');
    }
    if (closeTime.getTime() <= mintTime.getTime()) {
      throw new Error('closurePolicy.closeAt must be after mintConfirmedAt');
    }
    return closeTime.toISOString();
  }

  const closeAfterSeconds =
    options.closurePolicy?.closeAfterSeconds ?? DEFAULT_CLOSE_AFTER_SECONDS;
  if (!Number.isFinite(closeAfterSeconds) || closeAfterSeconds <= 0) {
    throw new Error('closurePolicy.closeAfterSeconds must be positive');
  }

  const closeAt = new Date(mintTime.getTime() + closeAfterSeconds * 1000);
  return closeAt.toISOString();
}

export function hasConfirmedLifecycleReceipts(receipts?: LifecycleReceipts): boolean {
  if (!receipts) {
    return false;
  }
  return Boolean(receipts.closeTxHash && receipts.reviewTxHash && receipts.releaseTxHash);
}

