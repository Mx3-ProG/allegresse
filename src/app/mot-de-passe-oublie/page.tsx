'use client';
import { useState } from 'react';
import Link from 'next/link';
export default function ForgotPassword() {
  const [message, setMessage] = useState(''); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage('');
    try { const email = new FormData(event.currentTarget).get('email'); const response = await fetch('/api/auth/recovery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const data = await response.json(); setMessage(response.ok ? 'Si cette adresse possède un compte, un lien de réinitialisation vient d’être envoyé.' : data.error); }
    catch { setMessage('Service indisponible. Réessayez plus tard.'); } finally { setPending(false); }
  }
  return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Votre compte</div><h1>Mot de passe oublié</h1><p>Recevez un lien pour choisir un nouveau mot de passe.</p><form className="account-form" onSubmit={submit}><label>Adresse e-mail<input type="email" name="email" autoComplete="email" required /></label><button className="primary" disabled={pending}>{pending ? 'Envoi…' : 'Recevoir le lien'}</button></form>{message && <p className="form-message" role="status">{message}</p>}<p className="auth-switch"><Link href="/connexion">Retour à la connexion</Link></p></div></main>;
}
