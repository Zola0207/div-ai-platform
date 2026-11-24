'use client';

import { useState, type ReactNode } from 'react';
import { SiteIcon, type SiteIconName } from './site-icons';
import { accentOnDark } from './site-types';

// Slika koja ume da padne. Spoljni CDN ponekad vrati grešku ili presporo
// odgovori — tada prikazujemo isti elegantni placeholder umesto slomljene
// ikonice pregledača.
export function SiteImage({ src, alt, className, fallback }: {
  src?: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

// Prazna galerija nije greška — to je poziv da se doda fotografija. Zato
// umesto emodžija stoji mirna, brendirana pločica sa ikonom delatnosti.
export function GalleryPlaceholder({ label, icon, accent, tone = 'light', showLabel = false }: {
  label: string;
  icon: SiteIconName;
  accent: string;
  tone?: 'light' | 'dark';
  showLabel?: boolean;
}) {
  const dark = tone === 'dark';
  const ink = dark ? accentOnDark(accent) : accent;
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: dark
          ? `radial-gradient(120% 120% at 30% 15%, ${accent}26, transparent 70%)`
          : `radial-gradient(120% 120% at 30% 15%, ${accent}1f, transparent 72%)` }}
      />
      <span
        className="relative flex h-11 w-11 items-center justify-center rounded-full"
        style={{
          color: ink,
          backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.72)',
          boxShadow: dark
            ? 'inset 0 0 0 1px rgba(255,255,255,0.14)'
            : `inset 0 0 0 1px ${accent}26, 0 1px 2px rgba(15,23,42,0.06)`,
        }}
      >
        <SiteIcon name={icon} className="h-5 w-5" strokeWidth={1.6} />
      </span>
      {showLabel && (
        <span
          className="relative mt-2 px-3 text-center text-[9px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: dark ? 'rgba(255,255,255,0.55)' : '#64748b' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
