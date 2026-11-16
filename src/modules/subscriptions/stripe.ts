import 'server-only';
import Stripe from 'stripe';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export function billingReady() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
