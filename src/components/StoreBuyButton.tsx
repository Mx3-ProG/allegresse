'use client';

import { useState } from 'react';

export function StoreBuyButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function buy() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || 'Paiement indisponible.');
      window.location.assign(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Paiement indisponible.');
      setBusy(false);
    }
  }
  return <><button className="primary pricing-action" type="button" disabled={busy} onClick={buy}>Acheter ce module</button><p role="alert">{error}</p></>;
}
