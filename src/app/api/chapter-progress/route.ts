import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/core/db/server';
import { getChapter } from '@/modules/bible/data';

const schema = z.object({ book: z.enum(['matthieu', 'marc', 'luc', 'jean']), chapter: z.number().int().positive() });

async function update(request: NextRequest, completed: boolean) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  const client = await createClient();
  if (!client) return NextResponse.json({ error: 'Le service de comptes est en cours de configuration.' }, { status: 503 });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour suivre votre lecture.' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Données invalides.' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success || !getChapter(parsed.data.book, parsed.data.chapter)) return NextResponse.json({ error: 'Chapitre introuvable.' }, { status: 404 });
  const fields = { user_id: user.id, book: parsed.data.book, chapter: parsed.data.chapter };
  const { error } = completed
    ? await client.from('user_chapter_progress').upsert(fields, { onConflict: 'user_id,book,chapter', ignoreDuplicates: true })
    : await client.from('user_chapter_progress').delete().match(fields);
  if (error) return NextResponse.json({ error: 'Enregistrement impossible pour le moment.' }, { status: 503 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) { return update(request, true); }
export async function DELETE(request: NextRequest) { return update(request, false); }
