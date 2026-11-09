import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4 text-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-2xl text-rose-500">
          ✕
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight">Plaćanje je otkazano</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Proces plaćanja je prekinut i ništa vam nije naplaćeno. Možete pokušati ponovo kada god budete spremni.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700"
        >
          Povratak na platformu
        </Link>
      </div>
    </div>
  );
}
