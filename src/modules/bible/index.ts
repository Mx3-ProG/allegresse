import type { ModuleManifest } from '@/core/modules/types';

export * from './data';

export const bibleModule: ModuleManifest = {
  id: 'bible',
  name: 'Bible',
  description: 'Lecture des quatre Évangiles.',
  access: 'public',
  featureFlag: null,
  navigation: [
    { label: 'La Bible', href: '/bible', placement: 'header' },
    { label: 'Explorer', href: '/themes/pardon', placement: 'header' },
  ],
  accountCards: [],
  routes: ['/bible', '/bible/[book]', '/bible/ls1910/[book]/[chapter]', '/versets/[reference]', '/themes/[theme]'],
};