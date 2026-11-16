import 'server-only';
import { createClient } from '@/core/db/server';

export async function featureEnabled(key: 'subscriptions' | 'store' | 'donations' | 'advertising') {
  const client = await createClient();
  if (!client) return false;
  const { data, error } = await client.from('feature_flags').select('enabled').eq('key', key).maybeSingle();
  return !error && data?.enabled === true;
}
