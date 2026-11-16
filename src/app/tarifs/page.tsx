import type { Metadata } from 'next';
import Link from 'next/link';
import { authConfigured } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Tarifs et compte', description: 'Lecture gratuite et accès au compte Allégresse à 4,99 € par mois et par utilisateur.' };

export default function PricingPage() {
  return <main className="container pricing-page">
    <div className="eyebrow">Tarifs et accès</div>
    <h1>Un espace pour faire grandir votre lecture.</h1>
    <p className="pricing-intro">Les quatre Évangiles et la recherche restent libres. Créez votre compte, puis activez l’abonnement pour accéder aux fonctions personnelles.</p>
    <div className="pricing-grid pricing-grid-two">
      <section className="pricing-card" aria-labelledby="free-title"><div className="pricing-kicker">Sans compte</div><h2 id="free-title">Lecture libre</h2><p className="pricing-price">Gratuit</p><p>Lisez et explorez à votre rythme.</p><ul><li>Quatre Évangiles et 89 chapitres</li><li>Recherche par mot ou référence</li><li>Partage des versets et QR codes</li></ul><Link href="/bible" className="secondary pricing-action">Lire les Évangiles</Link></section>
      <section className="pricing-card pricing-card-featured" aria-labelledby="account-title"><div className="pricing-kicker">Après création du compte</div><h2 id="account-title">Espace Allégresse</h2><p className="pricing-price">4,99 € <small>/ mois / utilisateur</small></p><p>L’abonnement donnera accès au tableau de bord et aux fonctions personnelles.</p><ul><li>Suivi de lecture et de relecture</li><li>Notes, favoris, surlignages et annotations signées</li><li>Hooks, rappels, points, niveaux et défis</li></ul><Link href="/inscription" className="primary pricing-action">Créer mon compte</Link><p className="pricing-note">{authConfigured() ? 'Le paiement et ces fonctions sont en préparation. Aucun abonnement ne peut encore être souscrit.' : 'La création de compte et le paiement sont en cours de configuration. Aucun débit n’est effectué.'}</p></section>
    </div>
    <section className="pricing-next"><div><h2>Comment ça marche ?</h2><p>Créez un compte, confirmez votre adresse e-mail, puis retrouvez votre tableau de bord. L’accès aux fonctions personnelles nécessitera l’activation de l’abonnement lorsque le paiement sera disponible.</p></div><Link href="/inscription" className="primary">Créer mon compte</Link></section>
    <p className="pricing-signin">Vous avez déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
  </main>;
}
