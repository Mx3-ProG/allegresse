import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/core/db/server';
import { GardenRedeemButton } from '@/components/GardenRedeemButton';

export const metadata: Metadata = { title: 'Jardin de Lumière', robots: { index: false } };

export default async function GardenPage() {
  const client = await createClient();
  if (!client) return <main className="container pricing-page"><h1>Jardin de Lumière</h1><p>Le service de comptes est en cours de configuration.</p></main>;
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/connexion');
  const [points, inventory, items] = await Promise.all([
    client.from('light_point_events').select('amount').eq('user_id', user.id),
    client.from('user_inventory').select('item_id,quantity').eq('user_id', user.id),
    client.from('virtual_items').select('id,name,emoji,price_points').eq('active', true).order('price_points'),
  ]);
  const balance = points.data?.reduce((sum, event) => sum + event.amount, 0) ?? 0;
  return <main className="container pricing-page">
    <div className="breadcrumb"><Link href="/compte">Mon espace</Link> / Jardin de Lumière</div>
    <div className="eyebrow">Mon Chemin</div><h1>Jardin de Lumière</h1>
    <p className="pricing-intro">Un petit espace à faire grandir à votre rythme. Les Points de Lumière sont virtuels, gagnés en terminant des chapitres et sans valeur monétaire.</p>
    <p>Solde : <strong>{balance} Points de Lumière</strong></p>
    <div className="garden-scene" aria-label="Votre jardin virtuel">{inventory.data?.filter(row => row.quantity > 0).flatMap(row => {
      const item = items.data?.find(candidate => candidate.id === row.item_id);
      return item ? Array.from({ length: Math.min(row.quantity, 20) }, (_, index) => <span title={item.name} key={`${row.item_id}-${index}`}>{item.emoji}</span>) : [];
    })}</div>
    <h2>Objets du jardin</h2>
    <div className="dashboard-grid">{items.data?.map(item => <section className="dashboard-card" key={item.id}>
      <div className="garden-item-emoji" aria-hidden="true">{item.emoji}</div><h3>{item.name}</h3>
      <p>{item.price_points} Points de Lumière · Possédé : {inventory.data?.find(row => row.item_id === item.id)?.quantity ?? 0}</p>
      <GardenRedeemButton itemId={item.id} />
    </section>)}</div>
  </main>;
}
