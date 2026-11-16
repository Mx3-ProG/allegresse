import type { Metadata } from 'next';
import Link from 'next/link';
import { AccountForm } from '@/components/AccountForm';
import { authConfigured } from '@/core/db/config';
export const metadata:Metadata={title:'Se connecter',robots:{index:false}};
export default function SignIn(){return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Bienvenue</div><h1>Se connecter</h1><p>Retrouvez votre compte Allégresse. Les fonctions personnelles nécessiteront un abonnement de 4,99 € par mois et par utilisateur lorsque le paiement sera ouvert.</p><AccountForm mode="connexion" configured={authConfigured()}/><p className="auth-switch">Nouveau sur Allégresse ? <Link href="/inscription">Créer un compte</Link></p></div></main>}
