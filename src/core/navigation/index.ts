import { getModules } from '@/core/modules/registry';
import type { ModuleManifest } from '@/core/modules/types';

export function modulesForPlacement(placement: ModuleManifest['navigation'][number]['placement']) {
  return getModules().flatMap(module =>
    module.navigation
      .filter(item => item.placement === placement)
      .map(item => ({ ...item, module: module.id })),
  );
}