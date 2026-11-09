'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getSupabaseClient } from '@/lib/supabase';
import { PLANS, planName, type PlanId } from '@/lib/plans';

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export default function PricingScreen({
  onBack,
  onRequireAuth,
  siteId,
}: {
  onBack: () => void;
  onRequireAuth: () => void;
  siteId?: string | null;
}) {
  const { configured, user, profile } = useAuth();
  const [busyPlan, setBusyPlan] = useState<PlanId | 'portal' | null>(null);
  const [notice, setNotice] = useState('');

  const activeSubscription = Boolean(
    profile
      && profile.plan !== 'none'
      && ['active', 'trialing', 'past_due'].includes(profile.subscription_status),
  );

  const startCheckout = async (plan: PlanId) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    setBusyPlan(plan);
    setNotice('');
    try {
      const headers = await authHeaders();
      if (!headers) {
        onRequireAuth();
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, siteId: siteId ?? undefined }),
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (res.status === 401) {
        onRequireAuth();
        return;
      }
      if (!res.ok || !data.url) {
        setNotice(data.error || 'Naplatu trenutno nije moguće pokrenuti.');
        return;
      }
      window.location.assign(data.url);
    } catch {
      setNotice('Veza sa serverom nije uspela. Pokušajte ponovo.');
    } finally {
      setBusyPlan(null);
    }
  };

  const openPortal = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    setBusyPlan('portal');
    setNotice('');
    try {
      const headers = await authHeaders();
      if (!headers) {
        onRequireAuth();
        return;
      }

      const res = await fetch('/api/billing-portal', { method: 'POST', headers });
      const data = (await res.json()) as { url?: string; error?: string };

      if (res.status === 401) {
        onRequireAuth();
        return;
      }
      if (!res.ok || !data.url) {
        setNotice(data.error || 'Portal za naplatu trenutno nije dostupan.');
        return;
      }
      window.location.assign(data.url);
    } catch {
      setNotice('Veza sa serverom nije uspela. Pokušajte ponovo.');
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-8 md:pt-16">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-900">
        <span aria-hidden="true">←</span> Nazad
      </button>

      <div className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-700">Cenovnik</p>
        <h1 className="mx-auto mt-2 max-w-2xl text-3xl font-black tracking-tight md:text-4xl">Izaberite nivo usluge</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Bez ugovorne obaveze. Otkazujete u svakom trenutku, a vaš sajt i podaci ostaju sačuvani.
        </p>
        {profile && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
            Trenutni plan: <span className="text-indigo-700">{planName(profile.plan)}</span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-slate-500">{profile.subscription_status === 'active' ? 'aktivna pretplata' : profile.subscription_status === 'none' ? 'bez pretplate' : profile.subscription_status}</span>
          </p>
        )}
      </div>

      {!configured && (
        <p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-semibold leading-5 text-amber-800">
          Naplata se aktivira kada povežete Supabase naloge i Stripe. Do tada možete da pravite sajtove u demo režimu.
        </p>
      )}

      {notice && (
        <p role="alert" className="mx-auto mt-6 max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-xs font-semibold leading-5 text-rose-700">
          {notice}
        </p>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = profile?.plan === plan.id && activeSubscription;
          const busy = busyPlan !== null;
          const ctaLabel = !configured
            ? 'Nije povezano'
            : isCurrent
              ? 'Upravljaj pretplatom'
              : activeSubscription
                ? 'Promeni plan'
                : `Izaberi ${plan.name}`;

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm ${plan.highlighted ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'}`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white ${plan.id === 'app' ? 'bg-indigo-600' : 'bg-slate-950'}`}>
                  {plan.badge}
                </span>
              )}

              <h2 className="text-lg font-black tracking-tight">{plan.name}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">{plan.monthly} €</span>
                <span className="text-xs font-semibold text-slate-500">/ mesec</span>
              </div>
              <p className="mt-1 min-h-5 text-[11px] font-semibold text-slate-400">
                {plan.setup ? `+ ${plan.setup} € jednokratno za izradu i objavu` : 'Bez troškova postavljanja'}
              </p>

              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-xs leading-5 text-slate-600">
                    <span aria-hidden="true" className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-black text-emerald-700">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  if (activeSubscription) {
                    void openPortal();
                  } else {
                    void startCheckout(plan.id);
                  }
                }}
                disabled={!configured || busy}
                className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${plan.highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
              >
                {busy ? 'Otvaram…' : ctaLabel}
              </button>

              {isCurrent && (
                <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-wide text-emerald-700">Vaš trenutni plan</p>
              )}
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 text-center">
        <p className="text-xs leading-6 text-slate-500">
          Cene su mesečne i izražene u evrima. Za mobilnu aplikaciju jednokratni iznos pokriva dizajn, pripremu i objavu u App Store i Google Play.
          Nije potrebna kartica za probni period — naplata počinje kada izaberete plan.
        </p>
      </div>
    </div>
  );
}
