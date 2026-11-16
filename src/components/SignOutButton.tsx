'use client';
import { useRouter } from 'next/navigation';
export function SignOutButton(){const router=useRouter();return <button className="secondary" onClick={async()=>{await fetch('/api/auth/deconnexion',{method:'POST'});router.push('/');router.refresh()}}>Se déconnecter</button>}
