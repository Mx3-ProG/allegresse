import type { Metadata } from 'next';
import { billingReady } from '@/modules/subscriptions/stripe';
import { SupportCheckout } from '@/components/SupportCheckout';
import { featureEnabled } from '@/core/flags/server';

export const metadata: Metadata = { title: 'Soutenir Allégresse', description: 'Contribuer librement au développement d’Allégresse.' };

export default async function SupportPage() {
  const supportOpen = billingReady() && await featureEnabled('donations');
  return <main className="container pricing-page">
    <div className="eyebrow">Soutien volontaire</div><h1>Soutenir Allégresse</h1>
    <p className="pricing-intro">Votre contribution aide à faire évoluer l’application et à maintenir la lecture des Évangiles gratuite pour tous. Elle ne change pas vos droits d’accès.</p>
    <section className="pricing-card" style={{ maxWidth: 640 }}>
      <h2>Choisissez librement votre montant</h2><p>Contribution ponctuelle, sans obligation de créer un compte.</p>
      {supportOpen ? <SupportCheckout /> : <p>Les contributions sont en cours de configuration. Aucun paiement ne peut encore être effectué.</p>}
      <p>Nous ne présentons pas ces contributions comme ouvrant droit à une réduction d’impôt.</p>
    </section>
  </main>;
}
