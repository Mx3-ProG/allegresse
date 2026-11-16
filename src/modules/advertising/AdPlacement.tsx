import { createClient } from '@/core/db/server';
import { userShouldDisplayAds } from '@/core/entitlements/server';

export async function AdPlacement({ placement }: { placement: 'home' | 'search' | 'resources' | 'store' | 'chapter_end' }) {
  if (!await userShouldDisplayAds(placement)) return null;
  const client = await createClient();
  if (!client) return null;
  const { data: setting } = await client.from('ad_placements').select('enabled').eq('key', placement).maybeSingle();
  if (!setting?.enabled) return null;
  const { data: campaign } = await client.from('ad_campaigns')
    .select('id,sponsor_name,headline,description,destination_url')
    .eq('placement_key', placement).eq('active', true).order('starts_at', { ascending: false }).limit(1).maybeSingle();
  if (!campaign) return null;
  return <aside className="ad-placement" aria-label="Publicité"><span>Publicité · {campaign.sponsor_name}</span><h2>{campaign.headline}</h2><p>{campaign.description}</p><a href={campaign.destination_url} rel="sponsored noopener noreferrer" target="_blank">Découvrir l’annonceur →</a></aside>;
}
