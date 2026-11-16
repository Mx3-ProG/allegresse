import type { ModuleManifest } from '@/core/modules/types';

export * from './search';

export const searchModule: ModuleManifest = {
  id: 'search',
  name: 'Recherche',
  description: 'Recherche dans les Évangiles.',
  access: 'public',
  featureFlag: null,
  navigation: [{ label: 'Rechercher', href: '/recherche', placement: 'header' }],
  accountCards: [],
  routes: ['/recherche', '/api/search'],
};