import { describe, expect, it } from 'vitest';
import {
  hasConfirmedLifecycleReceipts,
  resolveCloseAt,
  resolveGasPolicyForSingleTransaction,
  shouldFallbackGasPolicy,
} from '../../services/wallet/useCaseRules';

describe('useCaseRules', () => {
  it('self_pay 在余额不足时回退 sponsored', () => {
    const resolved = resolveGasPolicyForSingleTransaction({
      gasPolicy: { primary: 'self_pay', fallback: 'sponsored' },
      attemptErrorCode: 'INSUFFICIENT_FUNDS',
    });

    expect(resolved.attempted).toBe('self_pay');
    expect(resolved.fallbackTriggered).toBe(true);
    expect(resolved.effective).toBe('sponsored');
  });

  it('self_pay 非余额不足错误不回退', () => {
    expect(
      shouldFallbackGasPolicy('self_pay', 'NETWORK_ERROR'),
    ).toBe(false);
  });

  it('sponsored 在 PAYMASTER_REJECTED 时回退 self_pay', () => {
    const resolved = resolveGasPolicyForSingleTransaction({
      gasPolicy: { primary: 'sponsored', fallback: 'self_pay' },
      attemptErrorCode: 'PAYMASTER_REJECTED',
    });
    expect(resolved.fallbackTriggered).toBe(true);
    expect(resolved.effective).toBe('self_pay');
  });

  it('每笔交易独立判定优先级（第二笔仍先 self_pay）', () => {
    const firstTx = resolveGasPolicyForSingleTransaction({
      gasPolicy: { primary: 'self_pay', fallback: 'sponsored' },
      attemptErrorCode: 'INSUFFICIENT_FUNDS',
    });
    const secondTx = resolveGasPolicyForSingleTransaction({
      gasPolicy: { primary: 'self_pay', fallback: 'sponsored' },
    });

    expect(firstTx.effective).toBe('sponsored');
    expect(secondTx.attempted).toBe('self_pay');
    expect(secondTx.effective).toBe('self_pay');
  });

  it('封局时间允许用户指定 closeAt', () => {
    const closeAt = resolveCloseAt({
      mintConfirmedAt: '2026-02-28T00:00:00.000Z',
      closurePolicy: { closeAt: '2026-03-05T00:00:00.000Z' },
    });
    expect(closeAt).toBe('2026-03-05T00:00:00.000Z');
  });

  it('封局时间默认 mintConfirmedAt + 3d', () => {
    const closeAt = resolveCloseAt({
      mintConfirmedAt: '2026-02-28T00:00:00.000Z',
    });
    expect(closeAt).toBe('2026-03-03T00:00:00.000Z');
  });

  it('close/review/release 必须全部有回执才算链上确认完成', () => {
    expect(
      hasConfirmedLifecycleReceipts({
        closeTxHash: '0x1',
        reviewTxHash: '0x2',
      }),
    ).toBe(false);
    expect(
      hasConfirmedLifecycleReceipts({
        closeTxHash: '0x1',
        reviewTxHash: '0x2',
        releaseTxHash: '0x3',
      }),
    ).toBe(true);
  });
});

