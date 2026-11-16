import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/core/db/server';
import { billingReady } from '@/modules/subscriptions/stripe';
import { StoreBuyButton } from '@/components/StoreBuyButton';
import { AdPlacement } from '@/modules/advertising/AdPlacement';
import { featureEnabled } from '@/core/flags/server';

export const metadata: Metadata = { title: 'Boutique', description: 'Modules et contenus complémentaires Allégresse.' };

export default async function StorePage() {
  const storeOpen = billingReady() && await featureEnabled('store');
  const client = await createClient();
  const { data: { user } } = client ? await client.auth.getUser() : { data: { user: null } };
  const { data: products } = client
    ? await client.from('store_products').select('id,name,description,category,payment_mode,amount_minor,currency').eq('published', true).order('name')
    : { data: null };
  return <main className="container pricing-page">
    <div className="eyebrow">Allégresse Store</div><h1>Personnalisez votre expérience</h1>
    <p className="pricing-intro">Les textes bibliques et vos fonctions personnelles fondamentales restent gratuits. Les modules complémentaires sont indépendants d’Allégresse Plus.</p>
    <AdPlacement placement="store" />
    {!products?.length && <section className="pricing-card"><h2>La boutique se prépare</h2><p>Aucun module payant n’est encore proposé. Les prix et contenus seront présentés ici avant toute ouverture des achats.</p></section>}
    <div className="dashboard-grid">{products?.map(product => <section className="dashboard-card" key={product.id}>
      <div className="eyebrow">{product.category}</div><h2>{product.name}</h2><p>{product.description}</p>
      <p>{product.payment_mode === 'free' ? 'Gratuit' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: product.currency ?? 'EUR' }).format((product.amount_minor ?? 0) / 100)}</p>
      {product.payment_mode === 'one_time' && user && storeOpen && <StoreBuyButton productId={product.id} />}
      {product.payment_mode === 'one_time' && !user && <Link href="/connexion">Se connecter pour acheter</Link>}
      {product.payment_mode === 'one_time' && user && !storeOpen && <p>Achat en cours de configuration.</p>}
    </section>)}</div>
  </main>;
}
