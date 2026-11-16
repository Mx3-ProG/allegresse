'use client';

import { useState } from 'react';

export function SupportCheckout() {
  const [amount, setAmount] = useState('5');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function checkout() {
    const value = Number(amount.replace(',', '.'));
    if (!Number.isFinite(value) || value < 2 || value > 500 || Math.round(value * 100) !== value * 100) {
      setError('Choisissez un montant entre 2 € et 500 €, avec au plus deux décimales.');
      return;
    }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/support/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMinor: Math.round(value * 100) }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || 'Paiement indisponible.');
      window.location.assign(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Paiement indisponible.');
      setBusy(false);
    }
  }
  return <div className="verse-tools"><label htmlFor="support-amount">Montant en euros</label><input id="support-amount" type="number" min="2" max="500" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} />
    <button type="button" disabled={busy} onClick={checkout}>Contribuer via Stripe</button><p role="alert">{error}</p></div>;
}
