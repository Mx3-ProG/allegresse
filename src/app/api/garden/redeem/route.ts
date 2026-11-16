import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/core/db/server';

const schema = z.object({ itemId: z.string().regex(/^[a-z][a-z0-9_]{1,63}$/), requestId: z.uuid() });

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  const client = await createClient();
  if (!client) return NextResponse.json({ error: 'Le service de comptes est en cours de configuration.' }, { status: 503 });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour continuer.' }, { status: 401 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: 'Données invalides.' }, { status: 400 }); }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: 'Objet invalide.' }, { status: 400 });
  const { error } = await client.rpc('redeem_virtual_item', { p_item_id: parsed.data.itemId, p_request_id: parsed.data.requestId });
  if (error) return NextResponse.json({ error: 'Objet indisponible ou Points de Lumière insuffisants.' }, { status: 409 });
  return NextResponse.json({ ok: true });
}
