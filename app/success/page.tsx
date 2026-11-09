import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4 text-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
          ✓
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Pretplata je aktivirana</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Hvala što ste izabrali DiV.ai. Vaš plan je sada aktivan i sajt možete da sačuvate na nalog.
        </p>
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-500">
          Status se u nalogu osvežava u roku od nekoliko sekundi. Ako se ne prikaže odmah, otvorite nalog i kliknite na „Osveži status“.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700"
        >
          Nazad na platformu
        </Link>
        <p className="mt-3 text-[11px] text-slate-400">Kliknite na svoje ime u zaglavlju da otvorite nalog.</p>
      </div>
    </div>
  );
}
