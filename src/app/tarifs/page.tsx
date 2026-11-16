import type { Metadata } from 'next';
import Link from 'next/link';
import { authConfigured } from '@/core/db/config';
import { billingReady } from '@/modules/subscriptions/stripe';
import { featureEnabled } from '@/core/flags/server';

export const metadata: Metadata = { title: 'Accès et offres', description: 'Lecture des Évangiles et compte personnel gratuits sur Allégresse.' };

export default async function PricingPage() {
  const plusOpen = billingReady() && await featureEnabled('subscriptions');
  return <main className="container pricing-page">
    <div className="eyebrow">Tarifs et accès</div>
    <h1>Lire librement, avancer à votre rythme.</h1>
    <p className="pricing-intro">Les quatre Évangiles et la recherche sont gratuits, avec ou sans compte. Votre espace personnel est gratuit lui aussi.</p>
    <div className="pricing-grid pricing-grid-two">
      <section className="pricing-card" aria-labelledby="free-title"><div className="pricing-kicker">Sans compte</div><h2 id="free-title">Lecture libre</h2><p className="pricing-price">Gratuit</p><p>Lisez et explorez à votre rythme.</p><ul><li>Quatre Évangiles et 89 chapitres</li><li>Recherche par mot ou référence</li><li>Partage des versets et QR codes</li></ul><Link href="/bible" className="secondary pricing-action">Lire les Évangiles</Link></section>
      <section className="pricing-card pricing-card-featured" aria-labelledby="account-title"><div className="pricing-kicker">Avec un compte</div><h2 id="account-title">Mon espace Allégresse</h2><p className="pricing-price">Gratuit</p><p>Choisissez votre pseudo et retrouvez votre profil. Les outils personnels de lecture seront ajoutés progressivement, sans abonnement obligatoire.</p><ul><li>Compte et profil gratuits</li><li>Notes, favoris et suivi de lecture prévus</li><li>Données personnelles conservées après la fin d’une offre payante</li></ul><Link href="/inscription" className="primary pricing-action">Créer mon compte gratuit</Link>{!authConfigured() && <p className="pricing-note">La création de compte est en cours de configuration.</p>}</section>
    </div>
    <section className="pricing-next"><div><h2>Allégresse Plus</h2><p>4,99 € par mois pour profiter d’Allégresse sans publicité commerciale. Votre compte, vos notes, favoris et lectures restent accessibles même si vous résiliez.</p>{plusOpen ? <form action="/api/billing/checkout" method="post"><button className="primary pricing-action" type="submit">Passer à Allégresse Plus</button></form> : <p className="pricing-note">La souscription est en cours de configuration.</p>}<p className="pricing-note">Un compte est nécessaire pour souscrire. Vous pourrez vérifier le montant avant de payer sur Stripe.</p></div></section>
    <p className="pricing-signin"><Link href="/boutique">Découvrir les modules complémentaires →</Link></p>
    <p className="pricing-signin">Vous avez déjà un compte ? <Link href="/connexion">Se connecter</Link></p>
  </main>;
}
