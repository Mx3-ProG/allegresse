import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/core/db/server';
import { getVerse } from '@/modules/bible/data';

const schema = z.object({
  reference: z.string().regex(/^(matthieu|marc|luc|jean)-[1-9]\d*-[1-9]\d*$/),
  favorite: z.boolean(),
  highlight: z.enum(['gold', 'blue', 'green', 'rose']).nullable(),
  note: z.string().max(20000).nullable(),
});

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  const client = await createClient();
  if (!client) return NextResponse.json({ error: 'Le service de comptes est en cours de configuration.' }, { status: 503 });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour enregistrer ce verset.' }, { status: 401 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Données invalides.' }, { status: 400 }); }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
  const [book, chapter, verse] = parsed.data.reference.split('-');
  if (!getVerse(book, Number(chapter), Number(verse))) return NextResponse.json({ error: 'Verset introuvable.' }, { status: 404 });
  const { error } = await client.from('personal_verses').upsert({
    user_id: user.id,
    reference: parsed.data.reference,
    favorite: parsed.data.favorite,
    highlight: parsed.data.highlight,
    note: parsed.data.note?.trim() || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,reference' });
  if (error) return NextResponse.json({ error: 'Enregistrement impossible pour le moment.' }, { status: 503 });
  return NextResponse.json({ ok: true });
}
