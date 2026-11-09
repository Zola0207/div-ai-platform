'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getSupabaseClient } from '@/lib/supabase';
import { planName, siteLimitForPlan } from '@/lib/plans';
import type { SiteRecord } from '@/lib/sites';

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktivna',
  trialing: 'Probni period',
  past_due: 'Plaćanje neuspešno',
  canceled: 'Otkazana',
  paid: 'Plaćeno',
  none: 'Nema pretplate',
};

export default function AccountScreen({
  onBack,
  onRequireAuth,
  onOpenPricing,
  onCreateSite,
  onEditSite,
  onSignOut,
}: {
  onBack: () => void;
  onRequireAuth: () => void;
  onOpenPricing: () => void;
  onCreateSite: () => void;
  onEditSite: (site: SiteRecord) => void;
  onSignOut: () => void;
}) {
  const { ready, configured, user, profile, refreshProfile } = useAuth();
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || !user) return;

    let active = true;
    client
      .from('sites')
      .select('id, owner_id, name, slug, template_id, category_id, draft, status, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        setLoadingSites(false);
        if (error) {
          setNotice(`Sajtovi nisu mogli da se učitaju: ${error.message}`);
          return;
        }
        setSites((data ?? []) as SiteRecord[]);
      });

    return () => { active = false; };
  }, [user]);

  const deleteSite = async (site: SiteRecord) => {
    if (!window.confirm(`Obrisati sajt „${site.name}“? Ova radnja se ne može poništiti.`)) return;
    const client = getSupabaseClient();
    if (!client) return;

    setBusyId(site.id);
    setNotice('');
    const { error } = await client.from('sites').delete().eq('id', site.id);
    setBusyId(null);

    if (error) {
      setNotice(`Sajt nije obrisan: ${error.message}`);
      return;
    }
    setSites((current) => current.filter((item) => item.id !== site.id));
    setNotice('Sajt je obrisan.');
  };

  const openPortal = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      onRequireAuth();
      return;
    }

    setBusy(true);
    setNotice('');
    try {
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        setNotice(body.error || 'Portal za naplatu trenutno nije dostupan.');
        return;
      }
      window.location.assign(body.url);
    } catch {
      setNotice('Veza sa serverom nije uspela. Pokušajte ponovo.');
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    setBusy(true);
    await refreshProfile();
    setBusy(false);
    setNotice('Status naloga je osvežen.');
  };

  const limit = siteLimitForPlan(profile?.plan);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:px-8 md:pt-14">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-900">
        <span aria-hidden="true">←</span> Nazad
      </button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-700">Moj nalog</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Sajtovi i pretplata</h1>
          <p className="mt-2 text-sm text-slate-500">Upravljajte sajtovima, upitima i mesečnom pretplatom.</p>
        </div>
        {user && (
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
            {planName(profile?.plan)} · {STATUS_LABELS[profile?.subscription_status ?? 'none'] ?? profile?.subscription_status}
          </span>
        )}
      </div>

      {!configured && (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
          Nalozi nisu povezani. Dodajte Supabase ključeve i pokrenite <code className="font-mono">supabase/schema.sql</code> da biste čuvali sajtove na nalogu.
        </p>
      )}

      {!ready && configured && (
        <p className="mt-8 rounded-2xl bg-white px-4 py-6 text-center text-sm font-semibold text-slate-500">Učitavamo nalog…</p>
      )}

      {configured && ready && !user && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <span className="text-4xl">🔐</span>
          <h2 className="mt-4 text-xl font-black">Prijavite se na nalog</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Sajtovi i pretplata vezani su za vaš nalog, pa se prvo prijavite.</p>
          <button onClick={onRequireAuth} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700">
            Prijava
          </button>
        </div>
      )}

      {user && (
        <>
          {notice && (
            <p role="status" className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
              {notice}
            </p>
          )}

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Nalog</p>
                  <h2 className="mt-1 text-lg font-black">{profile?.full_name || 'Bez imena'}</h2>
                  <p className="text-xs text-slate-500">{profile?.email || user.email}</p>
                </div>
                <button onClick={refresh} disabled={busy} className="rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                  Osveži status
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Plan</p>
                  <p className="mt-1 text-sm font-black">{planName(profile?.plan)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Pretplata</p>
                  <p className="mt-1 text-sm font-black">{STATUS_LABELS[profile?.subscription_status ?? 'none'] ?? profile?.subscription_status}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Sajtovi</p>
                  <p className="mt-1 text-sm font-black">{sites.length} / {limit}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={onOpenPricing} className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-indigo-700">
                  {profile && profile.plan !== 'none' && profile.subscription_status !== 'canceled' ? 'Promeni plan' : 'Izaberi plan'}
                </button>
                {profile?.stripe_customer_id && (
                  <button onClick={openPortal} disabled={busy} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                    Upravljaj naplatom
                  </button>
                )}
                <button onClick={onSignOut} className="rounded-xl border border-rose-100 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50">
                  Odjava
                </button>
              </div>
              <p className="mt-3 text-[10px] leading-4 text-slate-400">
                Promena plana, kartica i fakture obrađuju se kroz Stripe portal. Otkazivanje je moguće u svakom trenutku.
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Šta plan uključuje</p>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Hosting, domena i SSL</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Izmene i održavanje sajta</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Prijem upita i zakazivanja</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Podrška na srpskom jeziku</li>
              </ul>
              {profile?.plan === 'none' && (
                <p className="mt-4 rounded-xl bg-indigo-50 px-3 py-2.5 text-[11px] font-semibold leading-5 text-indigo-800">
                  Izaberite plan da biste objavili sajt i primali upite bez ograničenja.
                </p>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Moji sajtovi</h2>
                <p className="mt-1 text-xs text-slate-500">Nacrti sačuvani na nalogu. Nastavite uređivanje na bilo kom uređaju.</p>
              </div>
              <button onClick={onCreateSite} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-indigo-700">
                + Novi sajt
              </button>
            </div>

            {loadingSites ? (
              <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-8 text-center text-xs font-semibold text-slate-500">Učitavamo sajtove…</p>
            ) : sites.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center">
                <span className="text-3xl">🗂️</span>
                <p className="mt-3 text-sm font-black">Još nemate sačuvan sajt</p>
                <p className="mt-1 text-xs text-slate-500">Izaberite šablon, prilagodite ga i sačuvajte na nalog.</p>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-slate-100">
                {sites.map((site) => (
                  <li key={site.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{site.name}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">{site.slug}.div.ai</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Ažurirano {new Date(site.updated_at).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}
                        {site.status === 'published' ? 'Objavljen' : 'Nacrt'}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {site.status === 'published' && (
                        <a
                          href={`/s/${site.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Otvori
                        </a>
                      )}
                      <button onClick={() => onEditSite(site)} className="rounded-xl bg-slate-950 px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-indigo-700">
                        Uredi
                      </button>
                      <button onClick={() => deleteSite(site)} disabled={busyId === site.id} className="rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50">
                        {busyId === site.id ? 'Brišem…' : 'Obriši'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
