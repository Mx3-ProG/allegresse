import { createClient } from '@/core/db/server';
import type { Profile } from './types';

export async function getCurrentProfile(): Promise<Profile | null> {
  const client = await createClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data, error } = await client
    .from('user_profiles')
    .select('user_id, username, display_name, bio, avatar_url, created_at, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export async function updateCurrentUsername(username: string): Promise<{ error: string | null }> {
  const client = await createClient();
  if (!client) return { error: 'Le service de comptes est en cours de configuration.' };
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: 'Vous devez être connecté.' };
  const { error } = await client
    .from('user_profiles')
    .upsert({ user_id: user.id, username, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return { error: error?.message ?? null };
}