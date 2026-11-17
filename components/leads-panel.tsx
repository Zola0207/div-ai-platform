'use client';

import { useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export type LeadItem = {
  id: string;
  businessName: string;
  clientName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: string;
  note: string;
};

export const LEAD_STATUSES = ['Novo', 'Potvrđeno', 'Završeno', 'Otkazano'] as const;

const STATUS_STYLE: Record<string, string> = {
  Novo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  Potvrđeno: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Završeno: 'border-slate-200 bg-slate-100 text-slate-600',
  Otkazano: 'border-rose-200 bg-rose-50 text-rose-700',
};

function statusStyle(status: string): string {
  return STATUS_STYLE[status] ?? STATUS_STYLE.Novo;
}

async function authToken(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function LeadsPanel({
  leads,
  editable,
  onUpdate,
}: {
  leads: LeadItem[];
  editable: boolean;
  onUpdate: (id: string, patch: Partial<LeadItem>) => void;
}) {
  const [filter, setFilter] = useState<string>('Svi');
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const counts = useMemo(() => {
    const map: Record<string, number> = { Svi: leads.length };
    for (const status of LEAD_STATUSES) map[status] = 0;
    for (const lead of leads) map[lead.status] = (map[lead.status] ?? 0) + 1;
    return map;
  }, [leads]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filter !== 'Svi' && lead.status !== filter) return false;
      if (!term) return true;
      return [lead.clientName, lead.phone, lead.businessName, lead.service, lead.note]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [leads, filter, query]);

  const patchLead = async (id: string, patch: { status?: string; note?: string }) => {
    if (!editable) return;
    setSavingId(id);
    setNotice('');
    try {
      const token = await authToken();
      if (!token) {
        setNotice('Sesija je istekla. Prijavite se ponovo.');
        return;
      }

      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        noteSkipped?: boolean;
      };

      if (!res.ok) {
        setNotice(data.error || 'Izmene nisu sačuvane.');
        return;
      }

      onUpdate(id, patch as Partial<LeadItem>);
      if (data.noteSkipped) {
        setNotice('Status je sačuvan, ali beleške još nisu dostupne (baza čeka migraciju).');
      } else {
        setNotice('Sačuvano.');
      }
    } catch {
      setNotice('Izmene nisu sačuvane. Pokušajte ponovo.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex flex-wrap gap-1.5">
          {['Svi', ...LEAD_STATUSES].map((status) => {
            const active = filter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status}
                <span className={`ml-1.5 ${active ? 'text-white/70' : 'text-slate-400'}`}>{counts[status] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Traži ime, telefon, uslugu…"
          aria-label="Pretraga upita"
          className="w-full max-w-[240px] rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-400"
        />
      </div>

      {notice && (
        <p role="status" className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-semibold text-slate-600">
          {notice}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-slate-500">
          {leads.length === 0 ? 'Još nema upita.' : 'Nema upita za izabrani filter.'}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((lead) => {
            const when = [lead.date, lead.time].filter(Boolean).join(' · ');
            const noteOpen = openNoteId === lead.id;
            const noteValue = noteDrafts[lead.id] ?? lead.note;
            return (
              <li key={lead.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black tracking-tight">{lead.clientName}</p>
                      {editable ? (
                        <select
                          value={lead.status}
                          disabled={savingId === lead.id}
                          aria-label={`Status upita ${lead.clientName}`}
                          onChange={(event) => void patchLead(lead.id, { status: event.target.value })}
                          className={`rounded-full border px-2 py-1 text-[10px] font-bold outline-none disabled:opacity-60 ${statusStyle(lead.status)}`}
                        >
                          {LEAD_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${statusStyle(lead.status)}`}>{lead.status}</span>
                      )}
                      {savingId === lead.id && <span className="text-[10px] font-semibold text-slate-400">čuvam…</span>}
                    </div>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {[lead.businessName, lead.service, when].filter(Boolean).join(' · ') || 'Bez detalja'}
                    </p>
                    {lead.note && !noteOpen && (
                      <p className="mt-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] leading-5 text-amber-900">
                        {lead.note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      {lead.phone}
                    </a>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenNoteId(noteOpen ? null : lead.id);
                          setNoteDrafts((current) => ({ ...current, [lead.id]: current[lead.id] ?? lead.note }));
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        {noteOpen ? 'Zatvori' : lead.note ? 'Beleška' : 'Dodaj belešku'}
                      </button>
                    )}
                  </div>
                </div>

                {noteOpen && (
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <textarea
                      value={noteValue}
                      onChange={(event) => setNoteDrafts((current) => ({ ...current, [lead.id]: event.target.value }))}
                      rows={2}
                      maxLength={1000}
                      aria-label={`Beleška za ${lead.clientName}`}
                      placeholder="Npr. zvala, potvrdila termin, dolazi sa drugaricom…"
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs leading-5 outline-none focus:border-indigo-400"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={savingId === lead.id}
                        onClick={async () => {
                          await patchLead(lead.id, { note: noteValue });
                          setNoteDrafts((current) => ({ ...current, [lead.id]: noteValue.trim() }));
                          setOpenNoteId(null);
                        }}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                      >
                        Sačuvaj belešku
                      </button>
                      <span className="text-[10px] text-slate-400">{noteValue.length}/1000</span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
