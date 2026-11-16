import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { passwordPolicyError, isCompromisedPassword } from '@/core/auth/password-policy';
import { authConfigured } from '@/core/db/config';

export async function POST(request: NextRequest) {
  if (!authConfigured()) return NextResponse.json({ error: 'Le service de comptes est indisponible.' }, { status: 503 });
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  let password: unknown;
  try { password = (await request.json()).password; } catch { return NextResponse.json({ error: 'Mot de passe invalide.' }, { status: 400 }); }
  if (typeof password !== 'string') return NextResponse.json({ error: 'Mot de passe invalide.' }, { status: 400 });
  const policyError = passwordPolicyError(password);
  if (policyError) return NextResponse.json({ error: policyError }, { status: 400 });
  try { if (await isCompromisedPassword(password)) return NextResponse.json({ error: 'Choisissez un autre mot de passe.' }, { status: 400 }); }
  catch { return NextResponse.json({ error: 'La vérification de sécurité est temporairement indisponible.' }, { status: 503 }); }
  const response = NextResponse.json({ ok: true });
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { cookies: { getAll() { return request.cookies.getAll(); }, setAll(items) { items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Le lien a expiré. Demandez-en un nouveau.' }, { status: 401 });
  const { error } = await client.auth.updateUser({ password });
  if (error) return NextResponse.json({ error: 'Impossible de modifier le mot de passe. Demandez un nouveau lien.' }, { status: 400 });
  return response;
}
