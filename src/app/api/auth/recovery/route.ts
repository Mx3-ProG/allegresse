import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { authConfigured } from '@/core/db/config';

export async function POST(request: NextRequest) {
  if (!authConfigured()) return NextResponse.json({ error: 'Le service de comptes est indisponible.' }, { status: 503 });
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  let email: unknown;
  try { email = (await request.json()).email; } catch { return NextResponse.json({ error: 'Adresse invalide.' }, { status: 400 }); }
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Adresse invalide.' }, { status: 400 });
  const response = NextResponse.json({ ok: true });
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { cookies: { getAll() { return request.cookies.getAll(); }, setAll(items) { items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  await client.auth.resetPasswordForEmail(email, { redirectTo: `${request.nextUrl.origin}/auth/callback?next=/nouveau-mot-de-passe` });
  return response;
}
