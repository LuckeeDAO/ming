export interface LifecycleSelectionRef {
  tokenId?: string;
  planId?: string;
}

export interface LifecycleEventDataRef {
  tokenId?: unknown;
  planId?: unknown;
}

function normalizeRef(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * 生命周期事件命中规则：
 * 1) 若 selection.planId 存在，则优先按 planId 匹配；
 * 2) 否则按 tokenId 匹配；
 * 3) 二者都无时不命中。
 */
export function matchesLifecycleEventSelection(
  eventData: LifecycleEventDataRef,
  selection: LifecycleSelectionRef,
): boolean {
  const selectedPlanId = normalizeRef(selection.planId);
  const selectedTokenId = normalizeRef(selection.tokenId);
  const eventPlanId = normalizeRef(eventData.planId);
  const eventTokenId = normalizeRef(eventData.tokenId);

  if (selectedPlanId) {
    return eventPlanId === selectedPlanId;
  }
  if (selectedTokenId) {
    return eventTokenId === selectedTokenId;
  }
  return false;
}

