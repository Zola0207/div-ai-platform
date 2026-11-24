'use client';

import { useEffect, useState } from 'react';
import { contrastText, initials } from './blocks/site-types';
import { siteDomain, siteHost } from '@/lib/site-url';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isIosDevice(): boolean {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function dismissedKey(slug: string): string {
  return `div-install-dismissed:${slug}`;
}

// Registruje service worker i nudi „Dodaj na početni ekran“.
// Ne prikazuje se na desktopu, u instaliranoj aplikaciji, ni posle odbijanja.
export default function SiteApp({
  slug,
  name,
  accent,
}: {
  slug: string;
  name: string;
  accent: string;
}) {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [mode, setMode] = useState<'none' | 'install' | 'ios'>('none');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    // Na sopstvenom poddomenu service worker pokriva ceo sajt (/), a na staroj
    // putanji /s/<slug> samo taj deo platforme.
    const onSiteDomain = Boolean(siteHost(slug))
      && window.location.hostname.toLowerCase().endsWith(`.${siteDomain}`);
    const worker = onSiteDomain ? '/sw.js' : '/s/sw.js';
    const scope = onSiteDomain ? '/' : '/s/';
    navigator.serviceWorker.register(worker, { scope }).catch(() => undefined);
  }, [slug]);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => setMode('none');

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    // Na iOS-u nema beforeinstallprompt događaja — tamo samo objašnjavamo putanju.
    const ios = isIosDevice();
    if (!promptEvent && !ios) return;
    if (isStandalone()) return;
    if (!ios && !window.matchMedia('(max-width: 900px)').matches && !/Android/i.test(navigator.userAgent)) return;

    try {
      if (localStorage.getItem(dismissedKey(slug))) return;
    } catch {
      // Bez localStorage (privatni režim) nudimo instalaciju svaki put.
    }

    const timer = window.setTimeout(() => setMode(promptEvent ? 'install' : 'ios'), 6000);
    return () => window.clearTimeout(timer);
  }, [slug, promptEvent]);

  const dismiss = () => {
    setMode('none');
    try {
      localStorage.setItem(dismissedKey(slug), '1');
    } catch {
      // Ništa — kartica se samo sakriva.
    }
  };

  const install = async () => {
    if (!promptEvent || busy) return;
    setBusy(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setMode('none');
      if (choice.outcome === 'accepted') {
        try {
          localStorage.setItem(dismissedKey(slug), '1');
        } catch {
          // Ništa.
        }
      }
    } finally {
      setBusy(false);
      setPromptEvent(null);
    }
  };

  if (mode === 'none') return null;

  return (
    <div
      role="dialog"
      aria-label="Instaliraj aplikaciju"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
        style={{ background: accent, color: contrastText(accent) }}
        aria-hidden="true"
      >
        {initials(name)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        <p className="text-xs leading-snug text-slate-500">
          {mode === 'ios' ? 'U Safariju: Podeli → Dodaj na početni ekran' : 'Brže otvaranje i rad bez mreže.'}
        </p>
      </div>

      {mode === 'install' ? (
        <button
          type="button"
          onClick={install}
          disabled={busy}
          className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-60"
          style={{ background: accent, color: contrastText(accent) }}
        >
          Instaliraj
        </button>
      ) : (
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Znam
        </button>
      )}

      <button
        type="button"
        onClick={dismiss}
        aria-label="Zatvori"
        className="-mr-1 shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-slate-400 hover:text-slate-700"
      >
        ×
      </button>
    </div>
  );
}
