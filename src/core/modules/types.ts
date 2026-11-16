export type ModuleAccess = 'public' | 'authenticated' | 'plus';
export type NavPlacement = 'header' | 'mobile' | 'footer' | 'account';

export interface ModuleNavigationItem {
  label: string;
  href: string;
  placement: NavPlacement;
}

export interface ModuleAccountCard {
  title: string;
  text: string;
  href?: string;
}

export interface ModuleManifest {
  id: string;
  name: string;
  description?: string;
  access: ModuleAccess;
  featureFlag?: string | null;
  navigation: ModuleNavigationItem[];
  accountCards: ModuleAccountCard[];
  routes: string[];
}