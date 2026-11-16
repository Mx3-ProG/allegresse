import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/core/db/server';

export const metadata: Metadata = { title: 'Mes modules', robots: { index: false } };

export default async function MyModulesPage() {
  const client = await createClient();
  if (!client) return <main className="container pricing-page"><h1>Mes modules</h1><p>Le service de comptes est en cours de configuration.</p></main>;
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/connexion');
  const { data: entitlements, error } = await client.from('user_entitlements')
    .select('product_id,starts_at,expires_at,revoked_at')
    .eq('user_id', user.id).is('revoked_at', null);
  const { data: products } = await client.from('store_products').select('id,name,description').eq('published', true);
  const active = entitlements?.filter(item => !item.expires_at || new Date(item.expires_at) > new Date()) ?? [];
  return <main className="container pricing-page">
    <div className="breadcrumb"><Link href="/compte">Mon espace</Link> / Mes modules</div>
    <div className="eyebrow">Mon espace</div><h1>Mes modules</h1>
    {error && <p>Vos modules sont temporairement indisponibles.</p>}
    {!error && active.length === 0 && <p>Vous n’avez encore aucun module complémentaire. <Link href="/boutique">Découvrir la boutique</Link></p>}
    <div className="dashboard-grid">{active.map(item => {
      const product = products?.find(candidate => candidate.id === item.product_id);
      return <section className="dashboard-card" key={item.product_id}><h2>{product?.name ?? item.product_id}</h2><p>{product?.description ?? 'Module acquis.'}</p><p>Accès actif{item.expires_at ? ` jusqu’au ${new Date(item.expires_at).toLocaleDateString('fr-FR')}` : ' sans échéance'}.</p></section>;
    })}</div>
  </main>;
}
