'use client';
import { useState } from 'react';

type ShareButtonProps = { text: string; url?: string; label?: string };

const PLATFORMS = [
  { key: 'native', label: 'Partage natif', icon: '↗' },
  { key: 'copy', label: 'Copier le lien', icon: '🔗' },
  { key: 'x', label: 'X (Twitter)', icon: '𝕏' },
  { key: 'facebook', label: 'Facebook', icon: 'f' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { key: 'reddit', label: 'Reddit', icon: 'r/' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'W' },
  { key: 'telegram', label: 'Telegram', icon: '✈' },
  { key: 'messenger', label: 'Messenger', icon: 'M' },
  { key: 'discord', label: 'Discord', icon: 'D' },
  { key: 'instagram', label: 'Instagram', icon: 'IG' },
  { key: 'tiktok', label: 'TikTok', icon: 'TT' },
  { key: 'email', label: 'Email', icon: '✉' },
  { key: 'sms', label: 'SMS', icon: '💬' },
  { key: 'pinterest', label: 'Pinterest', icon: 'P' },
];

export function ShareButton({ text, url, label }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const getAbsoluteUrl = () => {
    if (!url) return typeof window !== 'undefined' ? window.location.href : '';
    if (url.startsWith('http')) return url;
    return typeof window !== 'undefined' ? window.location.origin + url : url;
  };

  const handle = async (key: string) => {
    const shareUrl = getAbsoluteUrl();
    const encText = encodeURIComponent(text);
    const encUrl = encodeURIComponent(shareUrl);
    const encTitle = encodeURIComponent(text.slice(0, 120));

    const popup = (href: string) => {
      if (typeof window !== 'undefined') window.open(href, '_blank', 'noopener,noreferrer,width=640,height=480');
    };

    const copy = async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        showToast('Copié dans le presse-papiers');
      } catch {
        showToast('Copie impossible');
      }
    };

    switch (key) {
      case 'native':
        if (navigator.share) {
          try { await navigator.share({ title: 'Allégresse', text, url: shareUrl }); } catch { /* cancelled */ }
        } else {
          showToast('Partage natif non disponible');
        }
        break;
      case 'copy':
        await copy(`${text}\n${shareUrl}`);
        break;
      case 'x':
        popup(`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`);
        break;
      case 'facebook':
        popup(`https://www.facebook.com/sharer/sharer.php?u=${encUrl}&quote=${encText}`);
        break;
      case 'linkedin':
        popup(`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`);
        break;
      case 'reddit':
        popup(`https://www.reddit.com/submit?url=${encUrl}&title=${encTitle}`);
        break;
      case 'whatsapp':
        popup(`https://wa.me/?text=${encText}%20${encUrl}`);
        break;
      case 'telegram':
        popup(`https://t.me/share/url?url=${encUrl}&text=${encText}`);
        break;
      case 'messenger':
        // Messenger n'a pas d'endpoint web universel ; on copie et on tente le deep link mobile
        await copy(`${text}\n${shareUrl}`);
        if (typeof window !== 'undefined') {
          window.location.href = `fb-messenger://share/?link=${encUrl}`;
          setTimeout(() => { /* fallback silencieux */ }, 600);
        }
        showToast('Lien copié — collez-le dans Messenger');
        break;
      case 'discord':
        await copy(`${text}\n${shareUrl}`);
        showToast('Lien copié — collez-le dans Discord');
        break;
      case 'instagram':
        await copy(`${text}\n${shareUrl}`);
        showToast('Lien copié — collez-le dans Instagram');
        break;
      case 'tiktok':
        await copy(`${text}\n${shareUrl}`);
        showToast('Lien copié — collez-le dans TikTok');
        break;
      case 'email':
        if (typeof window !== 'undefined') {
          window.location.href = `mailto:?subject=${encodeURIComponent('Allégresse — ' + text.slice(0, 60))}&body=${encText}%0A%0A${encUrl}`;
        }
        break;
      case 'sms':
        if (typeof window !== 'undefined') {
          window.location.href = `sms:?body=${encText}%20${encUrl}`;
        }
        break;
      case 'pinterest':
        popup(`https://pinterest.com/pin/create/button/?url=${encUrl}&description=${encText}`);
        break;
      default:
        break;
    }
    if (key !== 'copy' && key !== 'messenger' && key !== 'discord' && key !== 'instagram' && key !== 'tiktok' && key !== 'native') {
      // keep menu open for multi-share; close after a short delay
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="primary"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label || 'Partager ce verset'}
      </button>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.25)' }}
          />
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              zIndex: 50,
              background: '#fff',
              border: '1px solid #e6e0d5',
              borderRadius: 14,
              padding: 10,
              boxShadow: '0 12px 32px rgba(23,40,61,0.18)',
              width: 300,
              maxHeight: 420,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {PLATFORMS.map(p => (
                <button
                  key={p.key}
                  role="menuitem"
                  onClick={() => handle(p.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    border: '1px solid #e6e0d5',
                    borderRadius: 10,
                    background: '#faf8f3',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#17283d',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ width: 22, textAlign: 'center', fontWeight: 700 }}>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#17283d',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 13,
            zIndex: 60,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
