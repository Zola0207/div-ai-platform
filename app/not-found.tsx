import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f7f5] px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">Di</span>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-700">Greška 404</p>
      <h1 className="mt-3 max-w-lg text-3xl font-black tracking-tight sm:text-4xl">Ova strana ne postoji.</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
        Možda je adresa pogrešno ukucana ili je sajt u međuvremenu uklonjen. Ako tražite sajt biznisa, proverite link koji vam je poslat.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700">
          Nazad na početnu
        </Link>
        <a href="mailto:podrska@div.ai" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
          Kontaktirajte podršku
        </a>
      </div>
    </div>
  );
}
