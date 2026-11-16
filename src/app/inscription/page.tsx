import type { Metadata } from 'next';
import Link from 'next/link';
import { AccountForm } from '@/components/AccountForm';
import { authConfigured } from '@/core/db/config';
export const metadata:Metadata={title:'Créer un compte',robots:{index:false}};
export default async function SignUp({searchParams}:{searchParams:Promise<{next?:string}>}){const next=(await searchParams).next==='/compte/abonnement'?'/compte/abonnement':'/compte';return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Votre espace Allégresse</div><h1>Créer un compte gratuit</h1><p>Lisez les Évangiles sans compte. Créez gratuitement votre espace personnel pour choisir votre pseudo et, à mesure de leur ouverture, conserver vos lectures, notes et favoris.</p><AccountForm mode="inscription" configured={authConfigured()} next={next}/><p className="auth-switch">Déjà un compte ? <Link href={next==='/compte/abonnement'?'/connexion?next=%2Fcompte%2Fabonnement':'/connexion'}>Se connecter</Link></p></div></main>}
