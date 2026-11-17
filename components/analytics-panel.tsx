'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

type Summary = {
  available: boolean;
  totals: { views: number; viewsToday: number; views7: number; leads: number; conversion: number };
  daily: { date: string; views: number }[];
  sites: { id: string; name: string; slug: string | null; views: number; leads: number }[];
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'];

function formatDay(value: string): string {
  const [, month, day] = value.split('-').map(Number);
  return `${day}. ${MONTHS[month - 1] ?? ''}`;
}

export default function AnalyticsPanel({ onRequireAuth }: { onRequireAuth: () => void }) {
  const [data, setData] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const client = getSupabaseClient();
      const token = client ? (await client.auth.getSession()).data.session?.access_token : null;
      if (!token) {
        onRequireAuth();
        return;
      }

      const res = await fetch('/api/analytics/summary', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        onRequireAuth();
        return;
      }

      const payload = (await res.json().catch(() => ({}))) as Summary & { error?: string };
      if (!res.ok) {
        setError(payload.error || 'Statistika nije dostupna.');
        return;
      }
      setData(payload);
      setError('');
    } catch {
      setError('Statistika nije dostupna. Pokušajte ponovo.');
    } finally {
      setBusy(false);
    }
  }, [onRequireAuth]);

  useEffect(() => {
    // Učitavanje sa servera je jedini izvor podataka za panel.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const max = Math.max(1, ...(data?.daily ?? []).map((entry) => entry.views));
  const hasSites = (data?.sites.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Posete (30 dana)" value={busy ? '—' : String(data?.totals.views ?? 0)} hint={`${data?.totals.views7 ?? 0} u poslednjih 7 dana`} />
        <Card label="Danas" value={busy ? '—' : String(data?.totals.viewsToday ?? 0)} hint="posete od ponoći" />
        <Card label="Upiti (30 dana)" value={busy ? '—' : String(data?.totals.leads ?? 0)} hint="poslati preko forme" />
        <Card label="Konverzija" value={busy ? '—' : `${data?.totals.conversion ?? 0}%`} hint="upit / poseta" />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => { setBusy(true); void load(); }}
          disabled={busy}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {busy ? 'Učitavam…' : 'Osveži'}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      {data && !data.available && (
        <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-900">
          Brojanje poseta još nije uključeno u bazi. Upiti se i dalje prikazuju normalno — posete će se pojaviti nakon što se primeni migracija.
        </p>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-sm font-black">Posete po danu</h2>
            <p className="mt-1 text-[11px] text-slate-500">Poslednjih 14 dana, svi vaši sajtovi zajedno.</p>
          </div>
          <p className="text-[11px] font-bold text-slate-400">max {max}</p>
        </div>
        <div className="mt-5 flex h-36 items-end gap-1.5">
          {(data?.daily ?? []).map((entry) => {
            const height = Math.max(2, Math.round((entry.views / max) * 100));
            return (
              <div key={entry.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[9px] font-bold text-slate-400 opacity-0 transition group-hover:opacity-100">{entry.views}</span>
                <div
                  className="w-full rounded-t-md bg-indigo-500/80 transition group-hover:bg-indigo-600"
                  style={{ height: `${height}%` }}
                  title={`${formatDay(entry.date)}: ${entry.views}`}
                />
                <span className="text-[8px] font-semibold text-slate-400">{formatDay(entry.date)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-black">Po sajtu</h2>
          <p className="mt-1 text-[11px] text-slate-500">Gde posetioci dolaze i koliko upita ostavljaju.</p>
        </div>
        {!hasSites ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">Još nemate sačuvan sajt na nalogu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Sajt</th>
                  <th className="px-5 py-3">Posete</th>
                  <th className="px-5 py-3">Upiti</th>
                  <th className="px-5 py-3">Konverzija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.sites.map((site) => {
                  const conversion = site.views > 0 ? Math.round((site.leads / site.views) * 1000) / 10 : 0;
                  return (
                    <tr key={site.id}>
                      <td className="px-5 py-3.5">
                        <p className="font-bold">{site.name}</p>
                        {site.slug && (
                          <a href={`/s/${site.slug}`} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                            /s/{site.slug} ↗
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-semibold">{site.views}</td>
                      <td className="px-5 py-3.5 font-semibold">{site.leads}</td>
                      <td className="px-5 py-3.5 text-slate-500">{conversion}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-slate-400">
        Brojimo samo posete objavljenih sajtova, jednom po sesiji posetioca. Ne čuvamo IP adrese, kolačiće ni podatke koji identifikuju osobu.
      </p>
    </div>
  );
}

function Card({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-[10px] font-semibold text-slate-400">{hint}</p>
    </div>
  );
}
