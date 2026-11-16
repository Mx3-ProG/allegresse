import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/core/db/admin';
import { getStripe } from '@/modules/subscriptions/stripe';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const admin = createAdminClient();
  const stripe = getStripe();
  if (!admin || !stripe) return NextResponse.json({ error: 'Facturation indisponible.' }, { status: 503 });
  const { data: candidates, error } = await admin.rpc('billing_reconciliation_candidates');
  if (error) return NextResponse.json({ error: 'Lecture des abonnements impossible.' }, { status: 503 });
  let reconciled = 0;
  for (const candidate of candidates ?? []) {
    try {
      const subscription = await stripe.subscriptions.retrieve(candidate.subscription_id);
      if (subscription.metadata.user_id !== candidate.user_id || subscription.metadata.offer !== 'plus') throw new Error('Ownership mismatch');
      const periodEnd = Math.max(...subscription.items.data.map(item => item.current_period_end));
      const { error: updateError } = await admin.rpc('apply_plus_subscription', {
        p_event_id: `reconcile:${subscription.id}:${Math.floor(Date.now() / 60000)}`,
        p_event_type: 'reconciliation',
        p_event_created: Math.floor(Date.now() / 1000),
        p_user_id: candidate.user_id,
        p_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
        p_subscription_id: subscription.id,
        p_status: subscription.status,
        p_period_end: Number.isFinite(periodEnd) ? new Date(periodEnd * 1000).toISOString() : null,
        p_cancel_at_period_end: subscription.cancel_at_period_end,
      });
      if (updateError) throw updateError;
      reconciled++;
    } catch {
      return NextResponse.json({ error: 'Réconciliation incomplète.', reconciled }, { status: 503 });
    }
  }
  return NextResponse.json({ ok: true, reconciled });
}
