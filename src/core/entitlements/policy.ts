export type FeatureKey =
  | 'bible.read'
  | 'bible.search'
  | 'account.profile'
  | 'reading.progress'
  | 'reading.notes'
  | 'reading.highlights'
  | 'reading.favorites'
  | 'advertising.hidden';

export type AccessContext = {
  userId: string | null;
  plusActive: boolean;
};

const publicFeatures = new Set<FeatureKey>(['bible.read', 'bible.search']);
const accountFeatures = new Set<FeatureKey>([
  'account.profile', 'reading.progress', 'reading.notes',
  'reading.highlights', 'reading.favorites',
]);

// Server routes and database policies must enforce the same account boundary.
export function canAccessFeature(context: AccessContext, feature: FeatureKey): boolean {
  if (publicFeatures.has(feature)) return true;
  if (feature === 'advertising.hidden') return context.plusActive;
  return context.userId !== null && accountFeatures.has(feature);
}

export function shouldDisplayAds(context: AccessContext, enabled: boolean): boolean {
  return enabled && !canAccessFeature(context, 'advertising.hidden');
}
