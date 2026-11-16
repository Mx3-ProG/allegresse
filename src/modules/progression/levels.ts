export const levelThresholds = [0, 50, 120, 220, 350, 500, 700, 950, 1250, 1600] as const;

export function levelForXp(xp: number) {
  let level = 1;
  for (let index = 1; index < levelThresholds.length; index++) {
    if (xp >= levelThresholds[index]) level = index + 1;
    else break;
  }
  return level;
}

export function nextLevelXp(xp: number) {
  return levelThresholds.find(threshold => threshold > xp) ?? null;
}
