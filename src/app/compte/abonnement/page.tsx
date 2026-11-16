import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/core/db/server';
import { createAdminClient } from '@/core/db/admin';
import { billingReady } from '@/modules/subscriptions/stripe';
import { featureEnabled } from '@/core/flags/server';

export const metadata: Metadata = { title: 'Mon abonnement', robots: { index: false } };

export default async function SubscriptionPage() {
  const client = await createClient();
  if (!client) return <main className="container auth-page"><h1>Mon abonnement</h1><p>Le service de comptes est en cours de configuration.</p></main>;
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/connexion');

  const admin = createAdminClient();
  const { data: subscription, error: subscriptionError } = admin
    ? await admin.rpc('billing_subscription_for_user', { p_user_id: user.id })
    : { data: null, error: null };
  const statusAvailable = Boolean(admin && !subscriptionError);
  const plusOpen = billingReady() && await featureEnabled('subscriptions');
  const active = Boolean(subscription && ['active', 'trialing'].includes(subscription.status) &&
    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date()));

  return <main className="container pricing-page">
    <div className="breadcrumb"><Link href="/compte">Mon espace</Link> / Mon abonnement</div>
    <div className="eyebrow">Compte et offres</div><h1>Mon abonnement</h1>
    <section className="pricing-card" style={{ maxWidth: 640 }}>
      <h2>{!statusAvailable ? 'État de l’abonnement indisponible' : active ? 'Allégresse Plus' : 'Compte gratuit'}</h2>
      <p>{!statusAvailable ? 'Votre compte gratuit reste accessible. Revenez plus tard pour consulter votre abonnement.' : active ? 'Vous profitez de l’expérience sans publicité commerciale.' : 'Votre compte et vos fonctions personnelles gratuites restent accessibles.'}</p>
      {subscription?.current_period_end && <p>Fin de la période en cours : {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}.</p>}
      {subscription?.cancel_at_period_end && <p>La résiliation prendra effet à la fin de cette période.</p>}
      {active && billingReady() && <form action="/api/billing/portal" method="post"><button className="primary pricing-action" type="submit">Gérer mon abonnement</button></form>}
      {!active && statusAvailable && plusOpen && <><p>Allégresse Plus : 4,99 € par mois. L’abonnement retire les publicités commerciales ; les modules restent indépendants.</p><form action="/api/billing/checkout" method="post"><button className="primary pricing-action" type="submit">Souscrire à Allégresse Plus</button></form></>}
      {!active && !plusOpen && <p>L’abonnement est en cours de configuration. Aucun paiement ne peut encore être effectué.</p>}
    </section>
    <p className="pricing-signin"><Link href="/compte">Retour à mon espace</Link></p>
  </main>;
}
