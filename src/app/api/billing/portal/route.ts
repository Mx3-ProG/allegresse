import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/core/db/server';
import { createAdminClient } from '@/core/db/admin';
import { billingReady, getStripe } from '@/modules/subscriptions/stripe';

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  if (!billingReady()) return NextResponse.json({ error: 'La gestion des abonnements est en cours de configuration.' }, { status: 503 });
  const client = await createClient();
  const admin = createAdminClient();
  const stripe = getStripe();
  if (!client || !admin || !stripe) return NextResponse.json({ error: 'Service indisponible.' }, { status: 503 });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour continuer.' }, { status: 401 });
  const { data, error } = await admin.rpc('billing_subscription_for_user', { p_user_id: user.id });
  if (error || !data?.stripe_customer_id) return NextResponse.json({ error: 'Aucun abonnement à gérer.' }, { status: 404 });
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id, return_url: `${request.nextUrl.origin}/compte`,
    });
    return NextResponse.redirect(session.url, { status: 303 });
  } catch {
    return NextResponse.json({ error: 'Le portail est temporairement indisponible.' }, { status: 503 });
  }
}
