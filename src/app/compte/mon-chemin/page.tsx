import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/core/db/server';
import { levelForXp, nextLevelXp } from '@/modules/progression/levels';

export const metadata: Metadata = { title: 'Mon Chemin', robots: { index: false } };

export default async function MyPathPage() {
  const client = await createClient();
  if (!client) return <main className="container pricing-page"><h1>Mon Chemin</h1><p>Le service de comptes est en cours de configuration.</p></main>;
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/connexion');
  const { data: events, error } = await client.from('xp_events').select('amount').eq('user_id', user.id);
  const { count } = await client.from('user_chapter_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const xp = events?.reduce((sum, event) => sum + event.amount, 0) ?? 0;
  return <main className="container pricing-page">
    <div className="breadcrumb"><Link href="/compte">Mon espace</Link> / Mon Chemin</div>
    <div className="eyebrow">Ma progression facultative</div><h1>Mon Chemin</h1>
    <p className="pricing-intro">Ces points décrivent votre activité de lecture dans l’application. Ils ne mesurent ni votre foi ni votre valeur personnelle.</p>
    {error ? <p>Votre progression est temporairement indisponible.</p> : <div className="pricing-grid pricing-grid-two">
      <section className="pricing-card"><h2>Lecture</h2><p className="pricing-price">{count ?? 0} <small>/ 89 chapitres</small></p><Link href="/compte/ma-bible">Voir mes chapitres</Link></section>
      <section className="pricing-card"><h2>Niveau {levelForXp(xp)}</h2><p className="pricing-price">{xp} <small>XP</small></p><p>{nextLevelXp(xp) === null ? 'Dernier seuil actuel atteint.' : `Prochain niveau à ${nextLevelXp(xp)} XP.`}</p></section>
    </div>}
  </main>;
}
