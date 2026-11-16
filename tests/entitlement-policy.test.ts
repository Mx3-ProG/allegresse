import { describe, expect, it } from 'vitest';
import { canAccessFeature, shouldDisplayAds } from '../src/core/entitlements/policy';

describe('free access policy', () => {
  it('keeps Bible reading and search public', () => {
    const visitor = { userId: null, plusActive: false };
    expect(canAccessFeature(visitor, 'bible.read')).toBe(true);
    expect(canAccessFeature(visitor, 'bible.search')).toBe(true);
    expect(canAccessFeature(visitor, 'reading.notes')).toBe(false);
  });

  it('gives personal reading rights to a free account', () => {
    const freeAccount = { userId: 'user-1', plusActive: false };
    for (const feature of ['account.profile', 'reading.progress', 'reading.notes', 'reading.highlights', 'reading.favorites'] as const) {
      expect(canAccessFeature(freeAccount, feature)).toBe(true);
    }
    expect(shouldDisplayAds(freeAccount, true)).toBe(true);
  });

  it('removes commercial ads for Plus without changing free rights', () => {
    const plus = { userId: 'user-1', plusActive: true };
    expect(shouldDisplayAds(plus, true)).toBe(false);
    expect(shouldDisplayAds({ userId: null, plusActive: false }, false)).toBe(false);
    expect(canAccessFeature(plus, 'reading.notes')).toBe(true);
  });
});
