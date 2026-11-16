import { describe, expect, it } from 'vitest';
import { levelForXp, nextLevelXp } from '../src/modules/progression/levels';

describe('reading levels', () => {
  it('moves through configured thresholds', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(49)).toBe(1);
    expect(levelForXp(50)).toBe(2);
    expect(levelForXp(120)).toBe(3);
    expect(nextLevelXp(50)).toBe(120);
  });
});
