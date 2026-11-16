import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/core/db/server';
import { createAdminClient } from '@/core/db/admin';
import { billingReady, getStripe } from '@/modules/subscriptions/stripe';
import { featureEnabled } from '@/core/flags/server';

const input = z.object({ productId: z.string().regex(/^[a-z][a-z0-9_]{2,63}$/) });

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  if (!billingReady()) return NextResponse.json({ error: 'Le paiement est en cours de configuration.' }, { status: 503 });
  if (!await featureEnabled('store')) return NextResponse.json({ error: 'La boutique n’est pas encore ouverte.' }, { status: 503 });
  const client = await createClient();
  const admin = createAdminClient();
  const stripe = getStripe();
  if (!client || !admin || !stripe) return NextResponse.json({ error: 'Paiement indisponible.' }, { status: 503 });
  const { data: { user } } = await client.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Connectez-vous pour continuer.' }, { status: 401 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: 'Données invalides.' }, { status: 400 }); }
  const parsed = input.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: 'Produit invalide.' }, { status: 400 });
  const { data: product, error } = await client.from('store_products')
    .select('id,name,payment_mode,amount_minor,currency,stripe_price_id')
    .eq('id', parsed.data.productId).eq('published', true).maybeSingle();
  if (error || !product || product.payment_mode !== 'one_time' || !product.stripe_price_id) {
    return NextResponse.json({ error: 'Produit indisponible.' }, { status: 404 });
  }
  const { data: owned } = await client.from('user_entitlements').select('id')
    .eq('user_id', user.id).eq('product_id', product.id).is('revoked_at', null).limit(1);
  if (owned?.length) return NextResponse.json({ error: 'Vous possédez déjà ce produit.' }, { status: 409 });
  try {
    const price = await stripe.prices.retrieve(product.stripe_price_id);
    if (!price.active || price.type !== 'one_time' || price.unit_amount !== product.amount_minor ||
        price.currency !== product.currency) {
      return NextResponse.json({ error: 'Le prix du produit ne correspond pas au catalogue.' }, { status: 503 });
    }
    const { data: subscription } = await admin.rpc('billing_subscription_for_user', { p_user_id: user.id });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', customer: subscription?.stripe_customer_id ?? undefined,
      customer_email: subscription?.stripe_customer_id ? undefined : user.email,
      line_items: [{ price: price.id, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { product_id: product.id, user_id: user.id },
      success_url: `${request.nextUrl.origin}/compte/mes-modules?paiement=retour`,
      cancel_url: `${request.nextUrl.origin}/boutique`,
    });
    if (!session.url) throw new Error('Missing checkout URL');
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Le paiement est temporairement indisponible.' }, { status: 503 });
  }
}
