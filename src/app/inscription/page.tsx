import type { Metadata } from 'next';
import Link from 'next/link';
import { AccountForm } from '@/components/AccountForm';
import { authConfigured } from '@/core/db/config';
export const metadata:Metadata={title:'Créer un compte',robots:{index:false}};
export default function SignUp(){return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Votre espace Allégresse</div><h1>Créer un compte</h1><p>La lecture et la recherche restent gratuites, sans inscription. Après la création du compte, l’accès aux fonctions personnelles nécessitera un abonnement de 4,99 € par mois et par utilisateur. Le paiement est en cours de préparation.</p><AccountForm mode="inscription" configured={authConfigured()}/><p className="auth-switch">Déjà un compte ? <Link href="/connexion">Se connecter</Link></p></div></main>}
