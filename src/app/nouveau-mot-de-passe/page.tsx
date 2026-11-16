'use client';
import { useState } from 'react';
import Link from 'next/link';
export default function NewPassword() {
  const [message, setMessage] = useState(''); const [pending, setPending] = useState(false); const [done, setDone] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const password = form.get('password');
    if (password !== form.get('confirmPassword')) { setMessage('Les mots de passe ne correspondent pas.'); return; }
    setPending(true); setMessage('');
    try { const response = await fetch('/api/auth/update-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }); const data = await response.json(); setDone(response.ok); setMessage(response.ok ? 'Votre mot de passe a été modifié.' : data.error); }
    catch { setMessage('Service indisponible. Réessayez plus tard.'); } finally { setPending(false); }
  }
  return <main className="container auth-page"><div className="auth-card"><div className="eyebrow">Votre compte</div><h1>Nouveau mot de passe</h1>{!done && <form className="account-form" onSubmit={submit}><label>Nouveau mot de passe<input type="password" name="password" autoComplete="new-password" minLength={12} required /></label><label>Confirmer le mot de passe<input type="password" name="confirmPassword" autoComplete="new-password" minLength={12} required /></label><p className="password-hint">12 caractères minimum, avec une lettre, un chiffre et un caractère spécial.</p><button className="primary" disabled={pending}>{pending ? 'Enregistrement…' : 'Enregistrer'}</button></form>}{message && <p className="form-message" role="status">{message}</p>}<p className="auth-switch"><Link href={done ? '/compte' : '/mot-de-passe-oublie'}>{done ? 'Accéder à mon compte' : 'Demander un nouveau lien'}</Link></p></div></main>;
}
