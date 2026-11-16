import { bibleModule } from '@/modules/bible';
import { searchModule } from '@/modules/search';
import { accountModule } from '@/modules/account';
import type { ModuleManifest } from './types';

export const modules: ModuleManifest[] = [bibleModule, searchModule, accountModule];

export function getModules(): ModuleManifest[] {
  return modules;
}

export function getModule(id: string): ModuleManifest | undefined {
  return modules.find(module => module.id === id);
}