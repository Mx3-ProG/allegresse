import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/SignOutButton';
export const metadata:Metadata={title:'Mon compte',robots:{index:false}};
export default async function Account(){const client=await createClient();if(!client)return <main className="container auth-page"><div className="auth-card"><h1>Mon compte</h1><p>Le service de comptes est en cours de configuration. Vous pouvez continuer à lire gratuitement.</p><Link href="/bible" className="primary">Lire les Évangiles</Link></div></main>;const {data:{user}}=await client.auth.getUser();if(!user)redirect('/connexion');return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Mon espace</div><h1>Bonjour</h1><p>Adresse du compte : <strong>{user.email}</strong></p><p>Votre compte est actif. Les notes, favoris et synchronisation seront accessibles avec Bibléva Plus après son lancement.</p><div className="reader-actions"><Link href="/bible" className="secondary">Continuer la lecture</Link><SignOutButton/></div></div></main>}
