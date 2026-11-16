import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { accountFeatures } from '@/modules/account/dashboard';
import { getCurrentProfile } from '@/modules/account/profile/repository';
import { createClient } from '@/core/db/server';
import { createAdminClient } from '@/core/db/admin';
import { SignOutButton } from '@/components/SignOutButton';

export const metadata: Metadata = { title: 'Mon espace', robots: { index: false } };

export default async function Account() {
  const client = await createClient();
  if (!client) return <main className="container auth-page"><div className="auth-card"><h1>Mon espace</h1><p>Le service de comptes est en cours de configuration.</p><Link href="/tarifs" className="primary">Voir l’offre</Link></div></main>;
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/connexion');
  const profile = await getCurrentProfile();
  const admin = createAdminClient();
  const { data: subscription } = admin
    ? await admin.rpc('billing_subscription_for_user', { p_user_id: user.id })
    : { data: null };
  const plusActive = Boolean(subscription && ['active', 'trialing'].includes(subscription.status) &&
    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date()));
  return <main className="container account-dashboard">
    <div className="dashboard-top"><div><div className="eyebrow">Mon espace Allégresse</div><h1>Bienvenue dans votre parcours</h1><p className="muted">Connecté avec {user.email}{profile ? ` · pseudo : @${profile.username}` : ' · pseudo à définir'}</p>{!profile && <p><Link href="/compte/profil" className="primary">Choisir mon pseudo</Link></p>}</div><SignOutButton /></div>
    <section className="dashboard-access" aria-labelledby="access-title"><div><span className="dashboard-badge">{plusActive ? 'Allégresse Plus' : 'Compte gratuit'}</span><h2 id="access-title">Votre espace personnel est ouvert</h2><p>{plusActive ? 'Votre abonnement Plus est actif. Vous profitez d’Allégresse sans publicité commerciale.' : 'Votre compte et votre profil sont gratuits. Les outils de lecture personnels restent accessibles sans abonnement.'}</p></div><Link href={plusActive ? '/compte/abonnement' : '/compte/profil'} className="primary">{plusActive ? 'Gérer mon abonnement' : 'Gérer mon profil'}</Link></section>
    {!plusActive && <section className="pricing-next"><div><h2>Passer à Allégresse Plus</h2><p>4,99 € par mois pour retirer les publicités commerciales.</p><Link href="/compte/abonnement" className="primary pricing-action">Découvrir Plus</Link></div></section>}
    <p><Link href="/compte/abonnement">Voir mon abonnement et les offres →</Link></p>
    <p><Link href="/compte/ma-bible">Voir mes favoris, surlignages et notes →</Link></p>
    <p><Link href="/compte/mes-modules">Voir mes modules →</Link></p>
    <p><Link href="/compte/mon-chemin">Voir Mon Chemin →</Link></p>
    <p><Link href="/compte/jardin">Voir mon Jardin de Lumière →</Link></p>
    <div className="dashboard-section-head"><div><div className="eyebrow">Votre parcours à venir</div><h2>Lire, marquer, progresser</h2></div><span>Fonctions en préparation</span></div>
    <div className="dashboard-grid">{accountFeatures.map(({ icon: Icon, title, text }) => <section className="dashboard-card" key={title}><Icon aria-hidden="true" size={25}/><h3>{title}</h3><p>{text}</p><span>En préparation</span></section>)}</div>
    <div className="dashboard-reading"><div><h2>Continuer à lire librement</h2><p>Les quatre Évangiles et la recherche restent accessibles sans abonnement.</p></div><Link href="/bible" className="secondary">Ouvrir la Bible</Link></div>
  </main>;
}
