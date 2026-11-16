import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authConfigured } from '@/core/db/config';
import { createClient } from '@/core/db/server';
import { usernameError, normalizeUsername } from '@/modules/account/profile/validation';
import { updateCurrentUsername } from '@/modules/account/profile/repository';

const schema = z.object({ username: z.string().min(3).max(24) });

export async function POST(request: NextRequest) {
  if (!authConfigured()) return NextResponse.json({ error: 'Le service de comptes est en cours de configuration.' }, { status: 503 });
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Données invalides' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Vérifiez le pseudo saisi.' }, { status: 400 });
  const username = normalizeUsername(parsed.data.username);
  const validationError = usernameError(username);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const client = await createClient();
  if (!client) return NextResponse.json({ error: 'Le service de comptes est en cours de configuration.' }, { status: 503 });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Vous devez être connecté.' }, { status: 401 });

  const result = await updateCurrentUsername(username);
  if (result.error) {
    if (result.error.includes('duplicate') || result.error.includes('unique')) {
      return NextResponse.json({ error: 'Ce pseudo est déjà utilisé.' }, { status: 409 });
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, username });
}