import { describe, expect, it } from 'vitest';
import { matchesLifecycleEventSelection } from '../../services/wallet/lifecycleEventMatcher';

describe('lifecycleEventMatcher', () => {
  it('有 planId 时优先按 planId 匹配', () => {
    const matched = matchesLifecycleEventSelection(
      { tokenId: '1', planId: 'plan-a' },
      { tokenId: '1', planId: 'plan-a' },
    );
    expect(matched).toBe(true);
  });

  it('有 planId 时 tokenId 即使匹配，planId 不匹配也应失败', () => {
    const matched = matchesLifecycleEventSelection(
      { tokenId: '1', planId: 'plan-b' },
      { tokenId: '1', planId: 'plan-a' },
    );
    expect(matched).toBe(false);
  });

  it('无 planId 时按 tokenId 匹配', () => {
    const matched = matchesLifecycleEventSelection(
      { tokenId: '2' },
      { tokenId: '2' },
    );
    expect(matched).toBe(true);
  });

  it('selection 无 planId/tokenId 时不命中', () => {
    const matched = matchesLifecycleEventSelection(
      { tokenId: '2', planId: 'plan-x' },
      {},
    );
    expect(matched).toBe(false);
  });
});

