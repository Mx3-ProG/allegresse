'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('allegresse-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      setTheme(next);
      document.documentElement.dataset.theme = next;
      try {
        window.localStorage.setItem('allegresse-theme', next);
      } catch {}
    };
    if (typeof document !== 'undefined' && typeof (document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition === 'function') {
      (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(apply);
    } else {
      apply();
    }
  }

  return (
    <button
      type="button"
      className={`theme-toggle ${theme === 'dark' ? 'is-dark' : ''}`}
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit'}
      title={theme === 'dark' ? 'Mode jour' : 'Mode nuit'}
    >
      {mounted && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}