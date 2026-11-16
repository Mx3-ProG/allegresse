'use client';

import { useState } from 'react';

type VerseRecord = { favorite: boolean; highlight: 'gold' | 'blue' | 'green' | 'rose' | null; note: string | null };

export function VerseTools({ reference, initial }: { reference: string; initial: VerseRecord | null }) {
  const [favorite, setFavorite] = useState(initial?.favorite ?? false);
  const [highlight, setHighlight] = useState<VerseRecord['highlight']>(initial?.highlight ?? null);
  const [note, setNote] = useState(initial?.note ?? '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(next: VerseRecord) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/personal-verses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, ...next }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Enregistrement impossible.');
      setFavorite(next.favorite);
      setHighlight(next.highlight);
      setMessage('Enregistré dans votre espace.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally { setBusy(false); }
  }

  return <section className="verse-tools" aria-label="Mes outils de lecture">
    <h2>Mes outils de lecture</h2>
    <button type="button" disabled={busy} onClick={() => save({ favorite: !favorite, highlight, note })}>
      {favorite ? '★ Retirer des favoris' : '☆ Ajouter aux favoris'}
    </button>
    <label htmlFor="verse-highlight">Surlignage</label>
    <select id="verse-highlight" disabled={busy} value={highlight ?? ''} onChange={event => save({ favorite, highlight: (event.target.value || null) as VerseRecord['highlight'], note })}>
      <option value="">Aucun</option><option value="gold">Or</option><option value="blue">Bleu</option><option value="green">Vert</option><option value="rose">Rose</option>
    </select>
    <label htmlFor="verse-note">Ma note privée</label>
    <textarea id="verse-note" maxLength={20000} value={note} onChange={event => setNote(event.target.value)} rows={5} />
    <button type="button" disabled={busy} onClick={() => save({ favorite, highlight, note })}>Enregistrer ma note</button>
    <p role="status">{message}</p>
  </section>;
}
