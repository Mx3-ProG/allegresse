import type { Metadata } from 'next';
import Link from 'next/link';
import { AccountForm } from '@/components/AccountForm';
import { authConfigured } from '@/lib/supabase/config';
export const metadata:Metadata={title:'Se connecter',robots:{index:false}};
export default function SignIn(){return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Bienvenue</div><h1>Se connecter</h1><p>Retrouvez votre compte Bibléva. Les fonctionnalités personnelles seront proposées avec Bibléva Plus.</p><AccountForm mode="connexion" configured={authConfigured()}/><p className="auth-switch">Nouveau sur Bibléva ? <Link href="/inscription">Créer un compte</Link></p></div></main>}
