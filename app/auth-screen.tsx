'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/auth-provider';

type AuthMode = 'login' | 'register';

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'Pogrešan email ili lozinka.';
  if (normalized.includes('email not confirmed')) return 'Potvrdite email pre prijave.';
  if (normalized.includes('user already registered')) return 'Nalog sa ovim emailom već postoji.';
  if (normalized.includes('password should be at least')) return 'Lozinka mora imati najmanje 6 znakova.';
  if (normalized.includes('unable to validate email')) return 'Email adresa nije ispravna.';
  if (normalized.includes('rate limit')) return 'Previše pokušaja. Sačekajte minut pa probajte ponovo.';
  return message;
}

export default function AuthScreen({ onBack, onDone, reason }: { onBack: () => void; onDone: () => void; reason?: string }) {
  const { ready, configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);

    try {
      const result = mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

      if (result.error) {
        setError(translateAuthError(result.error));
        return;
      }
      if (result.needsConfirmation) {
        setInfo('Poslali smo vam email za potvrdu. Potvrdite nalog, pa se prijavite.');
        setMode('login');
        return;
      }
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-20 pt-10 md:pt-16">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-900">
        <span aria-hidden="true">←</span> Nazad
      </button>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">Di</span>
        <h1 className="mt-5 text-2xl font-black tracking-tight">
          {mode === 'login' ? 'Prijavite se na nalog' : 'Napravite svoj nalog'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {mode === 'login'
            ? 'Pristupite svojim sajtovima, upitima i pretplati.'
            : 'Čuvajte sajtove na jednom mestu i upravljajte pretplatom.'}
        </p>

        {reason && (
          <p className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-xs font-semibold leading-5 text-indigo-800">{reason}</p>
        )}

        {!configured && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-black text-amber-800">Nalozi još nisu povezani</p>
            <p className="mt-1 text-xs leading-5 text-amber-700">
              Dodajte <code className="rounded bg-white px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> i{' '}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> u okruženje,
              pa pokrenite <code className="rounded bg-white px-1 py-0.5 font-mono text-[10px]">supabase/schema.sql</code>.
              Do tada platforma radi u demo režimu: nacrti ostaju u pregledaču.
            </p>
          </div>
        )}

        {configured && !ready && (
          <p className="mt-5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-500">Proveravamo sesiju…</p>
        )}

        {configured && ready && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                className={`rounded-lg px-3 py-2 transition ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Prijava
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setInfo(''); }}
                className={`rounded-lg px-3 py-2 transition ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Registracija
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-3">
              {mode === 'register' && (
                <label className="block text-xs font-bold text-slate-600">
                  Ime i prezime
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Vaše ime"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                  />
                </label>
              )}
              <label className="block text-xs font-bold text-slate-600">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="vi@biznis.rs"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </label>
              <label className="block text-xs font-bold text-slate-600">
                Lozinka
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Najmanje 6 znakova"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </label>

              {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold leading-5 text-rose-700">{error}</p>}
              {info && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold leading-5 text-emerald-800">{info}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Sačekajte…' : mode === 'login' ? 'Prijavi se' : 'Napravi nalog'}
              </button>
            </form>
          </>
        )}

        <button onClick={onBack} className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
          Nastavi kao gost
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
        Lozinku čuvamo kroz Supabase Auth. Nikada je ne vidimo u čistom tekstu.
      </p>
    </div>
  );
}
