'use client';

import { useState } from 'react';

export function GardenRedeemButton({ itemId }: { itemId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function redeem() {
    setBusy(true); setMessage('');
    const requestId = crypto.randomUUID();
    try {
      const response = await fetch('/api/garden/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, requestId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Échange impossible.');
      window.location.reload();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Échange impossible.');
      setBusy(false);
    }
  }
  return <><button type="button" disabled={busy} onClick={redeem}>Obtenir avec mes points</button><p role="status">{message}</p></>;
}
