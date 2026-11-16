import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createAdminClient } from '@/core/db/admin';
import { getStripe } from '@/modules/subscriptions/stripe';

export const runtime = 'nodejs';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function objectId(value: string | { id: string } | null): string | null {
  return typeof value === 'string' ? value : value?.id ?? null;
}

async function syncSubscription(subscriptionId: string, event: Stripe.Event) {
  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin) throw new Error('Billing is not configured');
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.user_id;
  const customerId = objectId(subscription.customer);
  const plusPriceId = process.env.STRIPE_PLUS_MONTHLY_PRICE_ID;
  if (!userId || !uuid.test(userId) || !customerId || subscription.metadata.offer !== 'plus' ||
      !plusPriceId || !subscription.items.data.some(item => item.price.id === plusPriceId)) {
    throw new Error('Unexpected subscription ownership or price');
  }
  const periodEnd = Math.max(...subscription.items.data.map(item => item.current_period_end));
  const { error } = await admin.rpc('apply_plus_subscription', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_event_created: event.created,
    p_user_id: userId,
    p_customer_id: customerId,
    p_subscription_id: subscription.id,
    p_status: subscription.status,
    p_period_end: Number.isFinite(periodEnd) ? new Date(periodEnd * 1000).toISOString() : null,
    p_cancel_at_period_end: subscription.cancel_at_period_end,
  });
  if (error) throw error;
}

async function syncProductPurchase(sessionId: string) {
  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin) throw new Error('Billing is not configured');
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return;
  const userId = session.metadata?.user_id;
  const productId = session.metadata?.product_id;
  const paymentIntentId = objectId(session.payment_intent);
  if (!userId || !uuid.test(userId) || userId !== session.client_reference_id ||
      !productId || !paymentIntentId || session.amount_total === null || !session.currency) {
    throw new Error('Unexpected product payment');
  }
  const lines = await stripe.checkout.sessions.listLineItems(session.id, { limit: 2 });
  const priceId = objectId(lines.data[0]?.price ?? null);
  if (lines.data.length !== 1 || lines.data[0].quantity !== 1 || !priceId) throw new Error('Unexpected checkout items');
  const { error } = await admin.rpc('apply_product_purchase', {
    p_session_id: session.id,
    p_payment_intent_id: paymentIntentId,
    p_user_id: userId,
    p_product_id: productId,
    p_price_id: priceId,
    p_amount_minor: session.amount_total,
    p_currency: session.currency,
  });
  if (error) throw error;
}

async function syncContribution(sessionId: string) {
  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin) throw new Error('Billing is not configured');
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return;
  const paymentIntentId = objectId(session.payment_intent);
  const userId = session.metadata?.user_id ?? null;
  if (session.metadata?.kind !== 'support' || !paymentIntentId ||
      session.amount_total === null || session.currency !== 'eur' ||
      (userId !== null && !uuid.test(userId))) throw new Error('Unexpected contribution');
  const { error } = await admin.rpc('record_contribution', {
    p_session_id: session.id, p_payment_intent_id: paymentIntentId,
    p_user_id: userId, p_amount_minor: session.amount_total,
    p_currency: session.currency,
  });
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!stripe || !secret || !signature) return NextResponse.json({ error: 'Webhook indisponible.' }, { status: 503 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const subscriptionId = objectId(session.subscription);
      if (session.mode === 'subscription' && subscriptionId) await syncSubscription(subscriptionId, event);
      if (session.mode === 'payment' && session.metadata?.kind === 'support') await syncContribution(session.id);
      else if (session.mode === 'payment') await syncProductPurchase(session.id);
    } else if (event.type === 'checkout.session.async_payment_succeeded') {
      if (event.data.object.mode === 'payment' && event.data.object.metadata?.kind === 'support') await syncContribution(event.data.object.id);
      else if (event.data.object.mode === 'payment') await syncProductPurchase(event.data.object.id);
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      await syncSubscription(event.data.object.id, event);
    } else if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
      const customerId = objectId(event.data.object.customer);
      if (customerId) {
        const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 });
        const plus = subscriptions.data.find(item => item.metadata.offer === 'plus' &&
          item.items.data.some(line => line.price.id === process.env.STRIPE_PLUS_MONTHLY_PRICE_ID));
        if (plus) await syncSubscription(plus.id, event);
      }
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const paymentIntentId = objectId(charge.payment_intent);
      if (paymentIntentId && charge.amount_refunded >= charge.amount) {
        const admin = createAdminClient();
        if (!admin) throw new Error('Billing is not configured');
        const { error } = await admin.rpc('refund_product_purchase', { p_payment_intent_id: paymentIntentId });
        if (error) throw error;
        const { error: contributionError } = await admin.rpc('refund_contribution', { p_payment_intent_id: paymentIntentId });
        if (contributionError) throw contributionError;
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Traitement temporairement impossible.' }, { status: 503 });
  }
}
