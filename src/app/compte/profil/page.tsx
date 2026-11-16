import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/core/db/server';
import { getCurrentProfile } from '@/modules/account/profile/repository';
import { ProfileForm } from '@/modules/account/components/ProfileForm';

export const metadata: Metadata = { title: 'Profil et pseudo', robots: { index: false } };

export default async function ProfilePage() {
  const client = await createClient();
  if (!client) return <main className="container auth-page"><div className="auth-card"><h1>Profil</h1><p>Le service de comptes est en cours de configuration.</p></div></main>;
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/connexion');
  const profile = await getCurrentProfile();
  return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Votre profil</div><h1>Choisir un pseudo</h1><p className="muted">Votre pseudo est privé et sert à personnaliser votre espace. Il est obligatoire pour utiliser les fonctions du compte.</p><ProfileForm initialUsername={profile?.username ?? ''} /><p className="auth-switch"><Link href="/compte">Retour au tableau de bord</Link></p></div></main>;
}