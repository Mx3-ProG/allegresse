import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/core/db/server';
import { createAdminClient } from '@/core/db/admin';
import { billingReady, getStripe } from '@/modules/subscriptions/stripe';
import { featureEnabled } from '@/core/flags/server';

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  }
  const client = await createClient();
  if (!client) return NextResponse.redirect(new URL('/connexion?next=%2Fcompte%2Fabonnement', request.url), { status: 303 });
  const { data: { user } } = await client.auth.getUser();
  if (!user?.email) return NextResponse.redirect(new URL('/connexion?next=%2Fcompte%2Fabonnement', request.url), { status: 303 });
  if (!billingReady()) return NextResponse.redirect(new URL('/compte/abonnement?erreur=configuration', request.url), { status: 303 });
  if (!await featureEnabled('subscriptions')) return NextResponse.redirect(new URL('/compte/abonnement?erreur=indisponible', request.url), { status: 303 });
  const admin = createAdminClient();
  const stripe = getStripe();
  if (!admin || !stripe) return NextResponse.json({ error: 'Paiement indisponible.' }, { status: 503 });

  const { data: existing, error: lookupError } = await admin.rpc('billing_subscription_for_user', { p_user_id: user.id });
  if (lookupError) return NextResponse.json({ error: 'Impossible de vérifier votre abonnement.' }, { status: 503 });
  if (existing && ['active', 'trialing'].includes(existing.status) &&
      (!existing.current_period_end || new Date(existing.current_period_end) > new Date())) {
    return NextResponse.json({ error: 'Votre abonnement est déjà actif.' }, { status: 409 });
  }

  try {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PLUS_MONTHLY_PRICE_ID!);
    if (!price.active || price.unit_amount !== 499 || price.currency !== 'eur' || price.recurring?.interval !== 'month') {
      return NextResponse.json({ error: 'Le tarif de paiement ne correspond pas à l’offre annoncée.' }, { status: 503 });
    }
    let customerId = existing?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } },
        { idempotencyKey: `allegresse-customer-${user.id}` });
      customerId = customer.id;
      const { error } = await admin.rpc('billing_register_customer', {
        p_user_id: user.id, p_customer_id: customerId,
      });
      if (error) return NextResponse.json({ error: 'Impossible de préparer le paiement.' }, { status: 503 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', customer: customerId, line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/compte?paiement=retour`,
      cancel_url: `${request.nextUrl.origin}/tarifs`,
      client_reference_id: user.id,
      subscription_data: { metadata: { user_id: user.id, offer: 'plus' } },
    });
    if (!session.url) throw new Error('Missing checkout URL');
    return NextResponse.redirect(session.url, { status: 303 });
  } catch {
    return NextResponse.json({ error: 'Le paiement est temporairement indisponible.' }, { status: 503 });
  }
}
