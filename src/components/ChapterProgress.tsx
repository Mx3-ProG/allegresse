'use client';

import { useState } from 'react';

export function ChapterProgress({ book, chapter, initial }: { book: string; chapter: number; initial: boolean }) {
  const [done, setDone] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function toggle() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/chapter-progress', {
        method: done ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book, chapter }),
      });
      if (!response.ok) throw new Error('Impossible de mettre à jour votre lecture.');
      setDone(!done);
      setMessage(done ? 'Chapitre retiré de vos lectures terminées.' : 'Chapitre ajouté à vos lectures terminées.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.'); }
    finally { setBusy(false); }
  }
  return <div className="chapter-progress"><button type="button" disabled={busy} onClick={toggle}>{done ? '✓ Chapitre terminé · Annuler' : 'Marquer ce chapitre comme terminé'}</button><p role="status">{message}</p></div>;
}
