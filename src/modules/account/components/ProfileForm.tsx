'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usernameError, normalizeUsername } from '@/modules/account/profile/validation';

export function ProfileForm({ initialUsername }: { initialUsername: string }) {
  const [username, setUsername] = useState(initialUsername);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeUsername(username);
    const error = usernameError(normalized);
    if (error) { setMessage(error); return; }
    setPending(true);
    setMessage('');
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: normalized }),
      });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || 'Une erreur est survenue.'); return; }
      router.push('/compte');
      router.refresh();
    } catch {
      setMessage('Connexion au service indisponible. Réessayez plus tard.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="account-form" onSubmit={submit}>
      <label>Pseudo<input type="text" name="username" autoComplete="username" required minLength={3} maxLength={24} value={username} onChange={event => setUsername(event.target.value)} placeholder="votre_pseudo" /></label>
      <p className="password-hint">3 à 24 caractères : lettres minuscules, chiffres et underscore uniquement.</p>
      <button className="primary" type="submit" disabled={pending}>{pending ? 'Un instant…' : 'Enregistrer mon pseudo'}</button>
      {message && <p className="form-message" role="status">{message}</p>}
    </form>
  );
}