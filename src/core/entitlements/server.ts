import 'server-only';
import { createClient } from '@/core/db/server';
import { createAdminClient } from '@/core/db/admin';
import { canAccessFeature, type FeatureKey, shouldDisplayAds as policyShouldDisplayAds } from './policy';

async function currentAccess() {
  const client = await createClient();
  if (!client) return { client: null, userId: null, plusActive: false, plusKnown: false };
  const { data: { user } } = await client.auth.getUser();
  const admin = createAdminClient();
  if (!user || !admin) return { client, userId: user?.id ?? null, plusActive: false, plusKnown: !user };
  const { data, error } = await admin.rpc('billing_subscription_for_user', { p_user_id: user.id });
  const active = Boolean(data && ['active', 'trialing'].includes(data.status) &&
    (!data.current_period_end || new Date(data.current_period_end) > new Date()));
  return { client, userId: user.id, plusActive: active, plusKnown: !error };
}

export async function userCanAccessFeature(feature: FeatureKey) {
  const context = await currentAccess();
  return canAccessFeature({ userId: context.userId, plusActive: context.plusActive }, feature);
}

export async function userCanAccessModule(productId: string) {
  const { client, userId } = await currentAccess();
  if (!client) return false;
  const { data: product } = await client.from('store_products')
    .select('id,payment_mode').eq('id', productId).eq('published', true).maybeSingle();
  if (!product) return false;
  if (product.payment_mode === 'free') return true;
  if (!userId) return false;
  const { data: grants } = await client.from('user_entitlements')
    .select('id,starts_at,expires_at')
    .eq('user_id', userId).eq('product_id', productId).is('revoked_at', null);
  const now = new Date();
  return Boolean(grants?.some(grant => new Date(grant.starts_at) <= now &&
    (!grant.expires_at || new Date(grant.expires_at) > now)));
}

export async function userShouldDisplayAds(placement: string) {
  const context = await currentAccess();
  if (!context.client || !context.plusKnown) return false;
  if (!['home', 'search', 'resources', 'store', 'chapter_end'].includes(placement)) return false;
  const { data: flag } = await context.client.from('feature_flags')
    .select('enabled').eq('key', 'advertising').maybeSingle();
  return policyShouldDisplayAds({ userId: context.userId, plusActive: context.plusActive }, flag?.enabled === true);
}
