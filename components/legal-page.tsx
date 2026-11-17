import Link from 'next/link';
import type { ReactNode } from 'react';

export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-black tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">Di</span>
            DiV.ai
          </Link>
          <nav className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <Link href="/privatnost" className="hover:text-slate-900">Privatnost</Link>
            <Link href="/uslovi" className="hover:text-slate-900">Uslovi</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-xs text-slate-400">Poslednja izmena: {updated}</p>

        <div className="mt-8 space-y-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-9">{children}</div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Pitanja? Pišite na <a href="mailto:podrska@div.ai" className="font-bold text-slate-600 hover:underline">podrska@div.ai</a>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          <Link href="/" className="font-bold text-slate-600 hover:underline">← Nazad na početnu</Link>
        </p>
      </main>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-black tracking-tight">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}
