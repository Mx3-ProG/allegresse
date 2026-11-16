import type { ModuleManifest } from '@/core/modules/types';

export * from './dashboard';
export * from './profile';
export * from './components/ProfileForm';

export const accountModule: ModuleManifest = {
  id: 'account',
  name: 'Compte',
  description: 'Compte utilisateur, pseudo et tableau de bord.',
  access: 'authenticated',
  featureFlag: null,
  navigation: [{ label: 'Mon compte', href: '/compte', placement: 'account' }],
  accountCards: [{ title: 'Profil et pseudo', text: 'Gérer votre pseudo et vos informations personnelles.', href: '/compte/profil' }],
  routes: ['/compte', '/compte/profil', '/connexion', '/inscription'],
};