import type { Metadata } from 'next';
import Link from 'next/link';
import { AccountForm } from '@/components/AccountForm';
import { authConfigured } from '@/lib/supabase/config';
export const metadata:Metadata={title:'Créer un compte',robots:{index:false}};
export default function SignUp(){return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Votre espace Bibléva</div><h1>Créer un compte</h1><p>La lecture et la recherche restent gratuites, sans inscription. Un compte vous permettra de gérer une expérience personnelle lorsque Bibléva Plus sera disponible.</p><AccountForm mode="inscription" configured={authConfigured()}/><p className="auth-switch">Déjà un compte ? <Link href="/connexion">Se connecter</Link></p></div></main>}
