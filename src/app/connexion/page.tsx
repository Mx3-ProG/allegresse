import type { Metadata } from 'next';
import Link from 'next/link';
import { AccountForm } from '@/components/AccountForm';
import { authConfigured } from '@/core/db/config';
export const metadata:Metadata={title:'Se connecter',robots:{index:false}};
export default async function SignIn({searchParams}:{searchParams:Promise<{next?:string}>}){const next=(await searchParams).next==='/compte/abonnement'?'/compte/abonnement':'/compte';return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Bienvenue</div><h1>Se connecter</h1><p>Retrouvez gratuitement votre espace Allégresse et vos informations personnelles.</p><AccountForm mode="connexion" configured={authConfigured()} next={next}/><p className="auth-switch"><Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link></p><p className="auth-switch">Nouveau sur Allégresse ? <Link href={next==='/compte/abonnement'?'/inscription?next=%2Fcompte%2Fabonnement':'/inscription'}>Créer un compte</Link></p></div></main>}
