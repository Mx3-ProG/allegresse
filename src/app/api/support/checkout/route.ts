import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/core/db/server';
import { billingReady, getStripe } from '@/modules/subscriptions/stripe';
import { featureEnabled } from '@/core/flags/server';

const schema = z.object({ amountMinor: z.number().int().min(200).max(50000) });

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  if (!billingReady()) return NextResponse.json({ error: 'Le soutien est en cours de configuration.' }, { status: 503 });
  if (!await featureEnabled('donations')) return NextResponse.json({ error: 'Les contributions ne sont pas encore ouvertes.' }, { status: 503 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: 'Montant invalide.' }, { status: 400 }); }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: 'Choisissez un montant entre 2 € et 500 €.' }, { status: 400 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Paiement indisponible.' }, { status: 503 });
  const client = await createClient();
  const { data: { user } } = client ? await client.auth.getUser() : { data: { user: null } };
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'eur', unit_amount: parsed.data.amountMinor,
        product_data: { name: 'Soutien volontaire à Allégresse' } }, quantity: 1 }],
      metadata: { kind: 'support', ...(user ? { user_id: user.id } : {}) },
      success_url: `${request.nextUrl.origin}/soutenir?paiement=retour`,
      cancel_url: `${request.nextUrl.origin}/soutenir`,
    });
    if (!session.url) throw new Error('Missing checkout URL');
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Le paiement est temporairement indisponible.' }, { status: 503 });
  }
}
