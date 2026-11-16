import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, Bookmark, Highlighter, PenLine, Repeat2, Sparkles, Trophy, Zap } from 'lucide-react';
import { createClient } from '@/core/db/server';
import { SignOutButton } from '@/components/SignOutButton';

export const metadata: Metadata = { title: 'Mon espace', robots: { index: false } };

const features = [
  { icon: BookOpen, title: 'Lecture', text: 'Reprendre votre lecture et suivre les chapitres terminés.' },
  { icon: Repeat2, title: 'Relecture', text: 'Revenir sur les passages importants et consolider votre parcours.' },
  { icon: Highlighter, title: 'Surlignage', text: 'Marquer les versets et retrouver vos passages surlignés.' },
  { icon: Bookmark, title: 'Favoris et notes', text: 'Conserver vos versets, idées et réflexions personnelles.' },
  { icon: PenLine, title: 'Annotations signées', text: 'Signer vos notes et annotations sur les pages de lecture.' },
  { icon: Zap, title: 'Hooks et rappels', text: 'Découvrir des accroches de lecture et recevoir des rappels.' },
  { icon: Trophy, title: 'Points et niveaux', text: 'Gagner des points en lisant et relisant, puis progresser de niveau.' },
  { icon: Sparkles, title: 'Défis de lecture', text: 'Suivre des objectifs et célébrer les étapes de votre parcours.' },
];

export default async function Account() {
  const client = await createClient();
  if (!client) return <main className="container auth-page"><div className="auth-card"><h1>Mon espace</h1><p>Le service de comptes est en cours de configuration.</p><Link href="/tarifs" className="primary">Voir l’offre</Link></div></main>;
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/connexion');
  return <main className="container account-dashboard">
    <div className="dashboard-top"><div><div className="eyebrow">Mon espace Allégresse</div><h1>Bienvenue dans votre parcours</h1><p className="muted">Connecté avec {user.email}</p></div><SignOutButton /></div>
    <section className="dashboard-access" aria-labelledby="access-title"><div><span className="dashboard-badge">Abonnement requis</span><h2 id="access-title">Activez votre espace personnel</h2><p>L’accès aux fonctions du tableau de bord est prévu avec l’abonnement Allégresse à 4,99 € par mois et par utilisateur. Le paiement n’est pas encore ouvert ; aucun débit n’est effectué.</p></div><Link href="/tarifs" className="primary">Voir le tarif</Link></section>
    <div className="dashboard-section-head"><div><div className="eyebrow">Votre parcours à venir</div><h2>Lire, marquer, progresser</h2></div><span>Fonctions en préparation</span></div>
    <div className="dashboard-grid">{features.map(({ icon: Icon, title, text }) => <section className="dashboard-card" key={title}><Icon aria-hidden="true" size={25}/><h3>{title}</h3><p>{text}</p><span>Disponible après activation</span></section>)}</div>
    <div className="dashboard-reading"><div><h2>Continuer à lire librement</h2><p>Les quatre Évangiles et la recherche restent accessibles sans abonnement.</p></div><Link href="/bible" className="secondary">Ouvrir la Bible</Link></div>
  </main>;
}
