'use client';

import { FormEvent, useState } from 'react';

type TemplateId = 'salon' | 'mechanic';
type BlockId = 'hero' | 'about' | 'services' | 'hours' | 'booking' | 'contact';
type Screen = 'home' | 'editor' | 'bookings';

type Service = {
  name: string;
  description: string;
  price: string;
};

type SiteDraft = {
  templateId: TemplateId;
  businessName: string;
  slug: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  accentColor: string;
  services: Service[];
  visibleBlocks: BlockId[];
};

type Booking = {
  id: string;
  businessName: string;
  clientName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
};

const DRAFT_KEY = 'div-site-draft-v1';
const BOOKINGS_KEY = 'div-demo-bookings-v1';

const blockOptions: { id: BlockId; label: string; description: string }[] = [
  { id: 'hero', label: 'Naslovna sekcija', description: 'Prvi utisak i glavno dugme' },
  { id: 'about', label: 'O nama', description: 'Kratko predstavljanje biznisa' },
  { id: 'services', label: 'Usluge i cene', description: 'Ponuda koju klijenti mogu da pregledaju' },
  { id: 'hours', label: 'Radno vreme', description: 'Kada ste dostupni' },
  { id: 'booking', label: 'Zakazivanje / upit', description: 'Forma za nove klijente' },
  { id: 'contact', label: 'Kontakt i lokacija', description: 'Telefon, email i adresa' },
];

const templates: Record<TemplateId, SiteDraft> = {
  salon: {
    templateId: 'salon',
    businessName: 'Studio Lena',
    slug: 'studio-lena',
    tagline: 'Vreme je da zablistate.',
    description: 'Frizerski studio u kom se dobra energija susreće sa negom i stilom. Zakažite svoj termin i prepustite se našem timu.',
    phone: '+381 60 123 4567',
    email: 'zdravo@studiolena.rs',
    address: 'Bulevar oslobođenja 12, Beograd',
    hours: { weekdays: '09:00 – 19:00', saturday: '09:00 – 15:00', sunday: 'Zatvoreno' },
    accentColor: '#b45365',
    services: [
      { name: 'Šišanje i feniranje', description: 'Konsultacija, šišanje i završno stilizovanje.', price: 'od 2.000 RSD' },
      { name: 'Farbanje', description: 'Boja prilagođena vašem stilu i tipu kose.', price: 'od 4.500 RSD' },
      { name: 'Svečana frizura', description: 'Frizura za posebne prilike i važne trenutke.', price: 'od 3.500 RSD' },
    ],
    visibleBlocks: ['hero', 'about', 'services', 'hours', 'booking', 'contact'],
  },
  mechanic: {
    templateId: 'mechanic',
    businessName: 'Auto servis Jovanović',
    slug: 'auto-servis-jovanovic',
    tagline: 'Pouzdana usluga. Siguran put.',
    description: 'Vaš automobil je u sigurnim rukama. Radimo dijagnostiku, redovno održavanje i popravke uz prethodni dogovor i jasnu procenu.',
    phone: '+381 64 222 3344',
    email: 'servis@jovanovic.rs',
    address: 'Industrijska 8, Novi Sad',
    hours: { weekdays: '08:00 – 17:00', saturday: '09:00 – 14:00', sunday: 'Zatvoreno' },
    accentColor: '#d97706',
    services: [
      { name: 'Mali servis', description: 'Zamena ulja i filtera uz pregled vozila.', price: 'od 6.000 RSD' },
      { name: 'Dijagnostika', description: 'Očitavanje grešaka i procena potrebnih radova.', price: 'od 2.500 RSD' },
      { name: 'Kočioni sistem', description: 'Provera i zamena diskova i kočionih pločica.', price: 'po proceni' },
    ],
    visibleBlocks: ['hero', 'about', 'services', 'hours', 'booking', 'contact'],
  },
};

function copyTemplate(templateId: TemplateId): SiteDraft {
  return JSON.parse(JSON.stringify(templates[templateId])) as SiteDraft;
}

function readBookings(): Booking[] {
  try {
    const saved = localStorage.getItem(BOOKINGS_KEY);
    return saved ? (JSON.parse(saved) as Booking[]) : [];
  } catch {
    return [];
  }
}

export default function SiteBuilder() {
  const [screen, setScreen] = useState<Screen>('home');
  const [draft, setDraft] = useState<SiteDraft | null>(null);
  const [notice, setNotice] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingMessage, setBookingMessage] = useState('');

  const openTemplate = (templateId: TemplateId) => {
    setDraft(copyTemplate(templateId));
    setBookingMessage('');
    setNotice('');
    setScreen('editor');
  };

  const updateDraft = <K extends keyof SiteDraft>(key: K, value: SiteDraft[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setNotice('');
  };

  const saveDraft = () => {
    if (!draft) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setNotice('Nacrt je sačuvan u ovom pregledaču.');
    } catch {
      setNotice('Nacrt nije sačuvan. Proverite podešavanja pregledača.');
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) {
        setNotice('Još nemate sačuvan nacrt. Izaberite šablon da biste počeli.');
        return;
      }
      const parsed = JSON.parse(saved) as SiteDraft;
      if (!parsed.templateId || !Array.isArray(parsed.services) || !Array.isArray(parsed.visibleBlocks)) {
        throw new Error('Neispravan nacrt');
      }
      setDraft(parsed);
      setNotice('Učitali smo vaš poslednji nacrt.');
      setScreen('editor');
    } catch {
      setNotice('Sačuvani nacrt ne može da se učita. Započnite novi sajt.');
    }
  };

  const openBookings = () => {
    setBookings(readBookings());
    setScreen('bookings');
  };

  const handleBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const formData = new FormData(event.currentTarget);
    const booking: Booking = {
      id: `${Date.now()}`,
      businessName: draft.businessName,
      clientName: String(formData.get('clientName') ?? ''),
      phone: String(formData.get('clientPhone') ?? ''),
      service: String(formData.get('service') ?? ''),
      date: String(formData.get('date') ?? ''),
      time: String(formData.get('time') ?? ''),
    };

    try {
      const nextBookings = [...readBookings(), booking];
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(nextBookings));
      setBookingMessage('Hvala! Zahtev je sačuvan u ovom demo pregledaču. Za sada nije poslat vlasniku sajta.');
      event.currentTarget.reset();
    } catch {
      setBookingMessage('Zahtev nije sačuvan. Pokušajte ponovo.');
    }
  };

  const toggleBlock = (blockId: BlockId) => {
    if (!draft) return;
    const next = draft.visibleBlocks.includes(blockId)
      ? draft.visibleBlocks.filter((block) => block !== blockId)
      : [...draft.visibleBlocks, blockId];
    updateDraft('visibleBlocks', next);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          <button className="flex items-center gap-3 text-left" onClick={() => { setScreen('home'); setNotice(''); }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">Di</span>
            <span>
              <span className="block text-lg font-black tracking-tight">DiV<span className="text-indigo-600">.ai</span></span>
              <span className="hidden text-[11px] font-medium text-slate-500 sm:block">Web sajtovi za male biznise</span>
            </span>
          </button>
          <nav className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-bold sm:text-sm">
            <button onClick={() => { setScreen('home'); setNotice(''); }} className={`rounded-xl px-3 py-2 transition ${screen === 'home' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Početna</button>
            <button onClick={openBookings} className={`rounded-xl px-3 py-2 transition ${screen === 'bookings' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Upiti</button>
          </nav>
          {screen === 'editor' && (
            <button onClick={saveDraft} className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 sm:text-sm">
              Sačuvaj nacrt
            </button>
          )}
        </div>
      </header>

      {screen === 'home' && (
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pt-20">
          <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white md:px-14 md:py-16">
            <div className="pointer-events-none absolute -right-20 -top-28 h-96 w-96 rounded-full bg-indigo-600/30 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-rose-500/20 blur-[100px]" />
            <div className="relative grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Bez komplikacija. Bez AI-ja.
                </span>
                <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight md:text-6xl">Profesionalan sajt, <span className="text-indigo-300">spreman za vaš biznis.</span></h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">Izaberite gotov šablon, unesite svoje podatke i prilagodite blokove. Za nekoliko minuta imate jasan pregled sajta za svoj salon ili servis.</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="#templates" className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-indigo-100">Izaberi šablon <span aria-hidden="true">→</span></a>
                  <button onClick={loadDraft} className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Učitaj sačuvani nacrt</button>
                </div>
                {notice && <p role="status" className="mt-4 text-sm text-indigo-200">{notice}</p>}
              </div>
              <div className="relative mx-auto w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur">
                <div className="overflow-hidden rounded-[1.2rem] bg-[#fcfaf8] text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3"><span className="text-xs font-black">Studio Lena</span><span className="text-[10px] text-slate-500">Početna&nbsp;&nbsp; Usluge&nbsp;&nbsp; Kontakt</span></div>
                  <div className="px-6 py-9 text-center" style={{ background: 'linear-gradient(135deg, #f4e8e7, #fcfaf8)' }}>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-800">Vaš trenutak za sebe</span>
                    <h2 className="mt-3 text-3xl font-black tracking-tight">Vreme je da<br />zablistate.</h2>
                    <p className="mx-auto mt-3 max-w-[220px] text-[10px] leading-5 text-slate-600">Nega, stil i dobra energija — sve na jednom mestu.</p>
                    <span className="mt-5 inline-block rounded-full bg-rose-800 px-4 py-2 text-[9px] font-bold text-white">Zakaži termin</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4"><div className="h-16 rounded-xl bg-[#f3eeee]"/><div className="h-16 rounded-xl bg-[#f3eeee]"/></div>
                </div>
                <div className="absolute -bottom-4 -left-5 rounded-2xl bg-white px-4 py-3 shadow-xl"><p className="text-[10px] font-bold text-emerald-700">● spremno za mobilni</p><p className="mt-1 text-[9px] text-slate-500">Pregled uživo dok uređujete</p></div>
              </div>
            </div>
          </section>

          <section id="templates" className="scroll-mt-24 pt-16">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-700">Počnite od šablona</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Šta najbolje opisuje vaš posao?</h2>
                <p className="mt-2 text-sm text-slate-500">Svaki šablon ima već pripremljene blokove, usluge i formu za klijente.</p>
              </div>
              <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500">2 šablona u prvoj verziji</span>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <TemplateCard
                eyebrow="Lepota i nega"
                title="Frizerski salon"
                description="Elegantna prezentacija usluga, cenovnik, radno vreme i forma za zakazivanje termina."
                color="#b45365"
                icon="✂️"
                preview="Studio Lena"
                onChoose={() => openTemplate('salon')}
              />
              <TemplateCard
                eyebrow="Auto usluge"
                title="Mehaničarska radionica"
                description="Jasan prikaz servisa, radnog vremena, lokacije i zahteva za termin ili procenu kvara."
                color="#d97706"
                icon="🔧"
                preview="Auto servis Jovanović"
                onChoose={() => openTemplate('mechanic')}
              />
            </div>
          </section>

          <section className="mt-12 grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-3 sm:p-7">
            <Feature icon="1" title="Izaberite šablon" text="Krećete od strukture prilagođene vašoj delatnosti." />
            <Feature icon="2" title="Unesite svoje podatke" text="Izmenite naziv, tekst, boju, usluge i kontakt." />
            <Feature icon="3" title="Pregledajte i sačuvajte" text="Proverite izgled i sačuvajte nacrt u pregledaču." />
          </section>
          <p className="mt-6 text-center text-xs text-slate-400">Prva verzija je demo: nacrti i probni upiti ostaju u ovom pregledaču.</p>
        </div>
      )}

      {screen === 'editor' && draft && (
        <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-5 md:px-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button aria-label="Nazad na izbor šablona" onClick={() => setScreen('home')} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg transition hover:bg-slate-100">←</button>
              <div><p className="text-xs font-bold text-indigo-700">UREĐIVAČ ŠABLONA</p><h1 className="text-lg font-black">Prilagodite svoj sajt</h1></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:inline-flex">● Pregled uživo</span>
              <button onClick={saveDraft} className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700">Sačuvaj nacrt</button>
            </div>
          </div>

          {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p>}

          <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <EditorCard title="Osnovni podaci" subtitle="Informacije koje će posetioci videti na sajtu.">
                <Field label="Naziv biznisa" value={draft.businessName} onChange={(value) => updateDraft('businessName', value)} />
                <Field label="Kratka poruka" value={draft.tagline} onChange={(value) => updateDraft('tagline', value)} />
                <label className="block text-xs font-bold text-slate-600">Opis biznisa<textarea rows={3} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white" /></label>
                <div className="grid grid-cols-2 gap-3">
                <Field label="Telefon" value={draft.phone} onChange={(value) => updateDraft('phone', value)} />
                <Field label="Email" value={draft.email} onChange={(value) => updateDraft('email', value)} type="email" />
                </div>
                <Field label="Adresa" value={draft.address} onChange={(value) => updateDraft('address', value)} />
                <Field label="Poddomen (demo)" value={draft.slug} onChange={(value) => updateDraft('slug', value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <label htmlFor="accent-color" className="text-xs font-bold text-slate-600">Boja sajta</label>
                  <div className="flex items-center gap-2"><span className="font-mono text-xs text-slate-500">{draft.accentColor}</span><input id="accent-color" type="color" value={draft.accentColor} onChange={(event) => updateDraft('accentColor', event.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent" /></div>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Demo adresa</p><p className="mt-1 text-sm font-semibold text-indigo-700">{draft.slug}.div.ai</p></div>
              </EditorCard>

              <EditorCard title="Blokovi na sajtu" subtitle="Uključite samo sekcije koje su vam potrebne.">
                <div className="space-y-2">
                  {blockOptions.map((block) => {
                    const active = draft.visibleBlocks.includes(block.id);
                    return <button key={block.id} type="button" aria-pressed={active} onClick={() => toggleBlock(block.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${active ? 'border-indigo-200 bg-indigo-50/70' : 'border-slate-100 bg-slate-50 opacity-70 hover:opacity-100'}`}>
                      <span className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${active ? 'bg-indigo-600' : 'bg-slate-300'}`}><span className={`h-4 w-4 rounded-full bg-white transition ${active ? 'translate-x-4' : ''}`} /></span>
                      <span><span className="block text-xs font-extrabold text-slate-800">{block.label}</span><span className="mt-0.5 block text-[10px] text-slate-500">{block.description}</span></span>
                    </button>;
                  })}
                </div>
              </EditorCard>

              <EditorCard title="Radno vreme" subtitle="Podesite vreme prikazano u pregledu sajta.">
                <Field label="Ponedeljak – petak" value={draft.hours.weekdays} onChange={(value) => updateDraft('hours', { ...draft.hours, weekdays: value })} />
                <Field label="Subota" value={draft.hours.saturday} onChange={(value) => updateDraft('hours', { ...draft.hours, saturday: value })} />
                <Field label="Nedelja" value={draft.hours.sunday} onChange={(value) => updateDraft('hours', { ...draft.hours, sunday: value })} />
              </EditorCard>

              <EditorCard title="Usluge" subtitle="Ove stavke se prikazuju na sajtu i u formi.">
                <div className="space-y-3">
                  {draft.services.map((service, index) => <div key={`${draft.templateId}-${index}`} className="rounded-2xl border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between"><label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Usluga {index + 1}</label><button type="button" disabled={draft.services.length <= 1} aria-label={`Ukloni uslugu ${index + 1}`} onClick={() => updateDraft('services', draft.services.filter((_, i) => i !== index))} className="text-[10px] font-bold text-rose-600 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-30">Ukloni</button></div>
                    <input aria-label={`Naziv usluge ${index + 1}`} value={service.name} onChange={(event) => updateDraft('services', draft.services.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} className="w-full border-b border-slate-100 pb-2 text-sm font-bold outline-none focus:border-indigo-300" />
                    <textarea aria-label={`Opis usluge ${index + 1}`} rows={2} value={service.description} onChange={(event) => updateDraft('services', draft.services.map((item, i) => i === index ? { ...item, description: event.target.value } : item))} className="mt-2 w-full resize-y text-xs leading-5 text-slate-500 outline-none focus:text-slate-800" />
                    <input aria-label={`Cena usluge ${index + 1}`} value={service.price} onChange={(event) => updateDraft('services', draft.services.map((item, i) => i === index ? { ...item, price: event.target.value } : item))} className="mt-1 w-full rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-bold text-indigo-700 outline-none focus:ring-1 focus:ring-indigo-300" />
                  </div>)}
                  <button type="button" onClick={() => updateDraft('services', [...draft.services, { name: 'Nova usluga', description: 'Dodajte kratak opis usluge.', price: 'Po dogovoru' }])} className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">+ Dodaj uslugu</button>
                </div>
              </EditorCard>
            </aside>

            <section className="min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-200/70 p-2 shadow-sm md:p-4">
              <div className="mb-2 flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 md:px-3">
                <span className="flex items-center gap-2"><span className="flex gap-1"><i className="h-2 w-2 rounded-full bg-red-400"/><i className="h-2 w-2 rounded-full bg-amber-400"/><i className="h-2 w-2 rounded-full bg-emerald-400"/></span> Pregled sajta</span>
                <span className="hidden sm:inline">{draft.slug}.div.ai</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-slate-500">Desktop / mobilni</span>
              </div>
              <SitePreview draft={draft} onBooking={handleBooking} bookingMessage={bookingMessage} />
            </section>
          </div>
        </div>
      )}

      {screen === 'bookings' && (
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-12 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-700">Demo kontrolna tabla</p><h1 className="mt-2 text-3xl font-black tracking-tight">Upiti za termine</h1><p className="mt-2 text-sm text-slate-500">Zahtevi poslati kroz pregled sajta prikazuju se ovde, u ovom pregledaču.</p></div>
            <button onClick={() => setScreen('home')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50">Napravi sajt</button>
          </div>
          <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 sm:grid-cols-4">
              <Stat label="Ukupno upita" value={bookings.length.toString()} />
              <Stat label="Novi" value={bookings.length.toString()} />
              <Stat label="Biznisi sa upitima" value={new Set(bookings.map((booking) => booking.businessName)).size.toString()} />
              <Stat label="Povezivanje" value="Demo" />
            </div>
            {bookings.length === 0 ? <div className="px-6 py-16 text-center"><span className="text-4xl">📭</span><h2 className="mt-4 text-lg font-black">Još nema upita</h2><p className="mt-1 text-sm text-slate-500">Pošaljite probni zahtev kroz formu u pregledu sajta.</p><button onClick={() => { setScreen('home'); loadDraft(); }} className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Otvori sačuvani sajt</button></div> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Klijent</th><th className="px-5 py-3">Biznis</th><th className="px-5 py-3">Usluga</th><th className="px-5 py-3">Termin</th><th className="px-5 py-3">Telefon</th></tr></thead><tbody className="divide-y divide-slate-100">{bookings.map((booking) => <tr key={booking.id}><td className="px-5 py-4 font-bold">{booking.clientName}</td><td className="px-5 py-4">{booking.businessName}</td><td className="px-5 py-4">{booking.service}</td><td className="px-5 py-4">{booking.date} · {booking.time}</td><td className="px-5 py-4">{booking.phone}</td></tr>)}</tbody></table></div>}
          </div>
          <p className="mt-4 text-xs text-slate-400">Demo podaci se čuvaju lokalno i nisu poslati vlasniku sajta.</p>
        </div>
      )}
    </main>
  );
}

function TemplateCard({ eyebrow, title, description, color, icon, preview, onChoose }: { eyebrow: string; title: string; description: string; color: string; icon: string; preview: string; onChoose: () => void }) {
  return <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
    <div className="relative h-48 overflow-hidden p-5" style={{ background: `linear-gradient(135deg, ${color}18, #ffffff 80%)` }}>
      <div className="absolute -right-6 -top-12 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: color }} />
      <div className="relative mx-auto max-w-sm rounded-2xl border border-white bg-white/90 p-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2"><span className="text-[10px] font-black">{preview}</span><span className="text-[8px] text-slate-400">Početna　 Usluge　 Kontakt</span></div>
        <div className="py-5 text-center"><span className="text-xl">{icon}</span><h3 className="mt-2 text-lg font-black" style={{ color }}>{title === 'Frizerski salon' ? 'Vreme je da zablistate.' : 'Pouzdan servis za vaš auto.'}</h3><div className="mx-auto mt-3 h-1 w-12 rounded-full" style={{ backgroundColor: color }} /></div>
        <div className="grid grid-cols-3 gap-2"><span className="h-9 rounded-lg bg-slate-100"/><span className="h-9 rounded-lg bg-slate-100"/><span className="h-9 rounded-lg bg-slate-100"/></div>
      </div>
      <span className="absolute bottom-4 right-5 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-500 shadow-sm">Spreman šablon</span>
    </div>
    <div className="p-6">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.17em]" style={{ color }}>{eyebrow}</p>
      <div className="mt-1 flex items-start justify-between gap-3"><h3 className="text-xl font-black tracking-tight">{title}</h3><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: `${color}15` }}>{icon}</span></div>
      <p className="mt-2 min-h-[42px] text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-5 flex flex-wrap gap-2"><Pill>Usluge i cene</Pill><Pill>Radno vreme</Pill><Pill>Zakazivanje</Pill></div>
      <button onClick={onChoose} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold text-white transition hover:brightness-110" style={{ backgroundColor: color }}>Uredi ovaj šablon <span aria-hidden="true">→</span></button>
    </div>
  </article>;
}

function SitePreview({ draft, onBooking, bookingMessage }: { draft: SiteDraft; onBooking: (event: FormEvent<HTMLFormElement>) => void; bookingMessage: string }) {
  const isSalon = draft.templateId === 'salon';
  const visible = (id: BlockId) => draft.visibleBlocks.includes(id);
  const sectionTitle = isSalon ? 'Naše usluge' : 'Servisne usluge';

  return <div className="mx-auto min-h-[740px] max-w-[980px] overflow-hidden rounded-2xl bg-white shadow-lg" style={{ '--site-accent': draft.accentColor } as React.CSSProperties}>
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 sm:px-8">
      <a href="#site-top" className="max-w-[60%] truncate text-sm font-black tracking-tight">{draft.businessName || 'Naziv vašeg biznisa'}</a>
      <nav className="hidden items-center gap-5 text-[10px] font-semibold text-slate-500 sm:flex">
        {visible('services') && <a href="#site-services" className="hover:text-slate-900">Usluge</a>}
        {visible('about') && <a href="#site-about" className="hover:text-slate-900">O nama</a>}
        {visible('contact') && <a href="#site-contact" className="hover:text-slate-900">Kontakt</a>}
      </nav>
      {visible('booking') && <a href="#site-booking" className="rounded-full px-3 py-2 text-[9px] font-bold text-white" style={{ backgroundColor: draft.accentColor }}>Zakaži termin</a>}
    </div>

    {visible('hero') && <section id="site-top" className="relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20" style={{ background: `linear-gradient(135deg, ${draft.accentColor}1c 0%, #ffffff 75%)` }}>
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em]" style={{ color: draft.accentColor, backgroundColor: `${draft.accentColor}12` }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: draft.accentColor }} />{isSalon ? 'Lepota počinje brigom o sebi' : 'Pouzdan partner za vaš automobil'}</span>
      <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">{draft.tagline || 'Vaša poruka dobrodošlice'}</h1>
      <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-slate-600 sm:text-sm">{draft.description}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2"><a href="#site-booking" className="rounded-full px-5 py-3 text-[10px] font-bold text-white" style={{ backgroundColor: draft.accentColor }}>{isSalon ? 'Zakaži svoj termin' : 'Zatraži termin za servis'} <span aria-hidden="true">→</span></a><a href="#site-services" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-[10px] font-bold text-slate-700">Pogledaj usluge</a></div>
      <div className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: draft.accentColor }} />
    </section>}

    {visible('about') && <section id="site-about" className="grid gap-6 px-6 py-9 sm:grid-cols-[0.8fr_1.2fr] sm:px-12 sm:py-12">
      <div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Upoznajte nas</p><h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Dobro došli u {draft.businessName}.</h2></div>
      <div><p className="text-xs leading-6 text-slate-600 sm:text-sm">{draft.description}</p><a href="#site-contact" className="mt-3 inline-block text-[10px] font-bold" style={{ color: draft.accentColor }}>Saznajte više <span aria-hidden="true">→</span></a></div>
    </section>}

    {visible('services') && <section id="site-services" className="bg-[#fafafa] px-6 py-9 sm:px-12 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Šta nudimo</p><h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{sectionTitle}</h2></div><span className="text-[10px] text-slate-400">Kvalitet i pažnja u svakom detalju</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{draft.services.map((service, index) => <article key={`${service.name}-${index}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><span className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black" style={{ color: draft.accentColor, backgroundColor: `${draft.accentColor}12` }}>0{index + 1}</span><h3 className="mt-3 text-xs font-black sm:text-sm">{service.name || 'Naziv usluge'}</h3><p className="mt-1.5 min-h-9 text-[10px] leading-5 text-slate-500">{service.description}</p><p className="mt-3 text-[10px] font-extrabold" style={{ color: draft.accentColor }}>{service.price}</p></article>)}</div>
    </section>}

    {visible('hours') && <section className="grid gap-5 px-6 py-9 sm:grid-cols-2 sm:px-12 sm:py-11">
      <div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Planirajte posetu</p><h2 className="mt-2 text-xl font-black tracking-tight">Radno vreme</h2><p className="mt-2 text-[10px] leading-5 text-slate-500">Pozovite nas ukoliko vam je potreban termin van redovnog radnog vremena.</p></div>
      <div className="space-y-2 rounded-2xl bg-[#fafafa] p-4 text-[10px]"><HoursRow day="Ponedeljak – petak" time={draft.hours.weekdays} /><HoursRow day="Subota" time={draft.hours.saturday} /><HoursRow day="Nedelja" time={draft.hours.sunday} /></div>
    </section>}

    {visible('booking') && <section id="site-booking" className="px-6 py-9 sm:px-12 sm:py-12" style={{ background: `linear-gradient(145deg, ${draft.accentColor}0c, #fff 55%)` }}>
      <div className="mx-auto max-w-2xl text-center"><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>{isSalon ? 'Nekoliko klikova do vašeg termina' : 'Zakažite pregled ili servis'}</p><h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{isSalon ? 'Zakažite svoj termin' : 'Zatražite termin za servis'}</h2><p className="mt-2 text-[10px] leading-5 text-slate-500">Popunite formu, a naš tim će vas kontaktirati radi potvrde.</p></div>
      <form onSubmit={onBooking} className="mx-auto mt-5 grid max-w-2xl gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5">
        <PreviewInput label="Ime i prezime" name="clientName" placeholder="Vaše ime" required />
        <PreviewInput label="Broj telefona" name="clientPhone" placeholder="06x xxx xxxx" required type="tel" />
        <label className="block text-[9px] font-bold text-slate-600">{isSalon ? 'Usluga' : 'Vrsta usluge'}<select name="service" required defaultValue="" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium outline-none focus:border-indigo-400"><option value="" disabled>Izaberite uslugu</option>{draft.services.map((service, index) => <option key={`${service.name}-${index}`} value={service.name}>{service.name}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-2"><PreviewInput label="Željeni datum" name="date" type="date" required /><PreviewInput label="Vreme" name="time" type="time" required /></div>
        <button type="submit" className="rounded-xl px-4 py-3 text-xs font-extrabold text-white transition hover:brightness-110 sm:col-span-2" style={{ backgroundColor: draft.accentColor }}>{isSalon ? 'Pošalji zahtev za termin' : 'Pošalji zahtev za servis'} <span aria-hidden="true">→</span></button>
        {bookingMessage && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-semibold leading-5 text-emerald-800 sm:col-span-2">{bookingMessage}</p>}
      </form>
    </section>}

    {visible('contact') && <section id="site-contact" className="border-t border-slate-100 px-6 py-8 sm:px-12">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.17em]" style={{ color: draft.accentColor }}>Tu smo za vas</p><h2 className="mt-1 text-lg font-black">Posetite nas ili pozovite.</h2><p className="mt-1 text-[10px] text-slate-500">{draft.address}</p></div><div className="flex flex-wrap gap-2"><a href={`tel:${draft.phone.replace(/[^+\d]/g, '')}`} className="rounded-xl px-4 py-2.5 text-[10px] font-bold text-white" style={{ backgroundColor: draft.accentColor }}>Pozovi {draft.phone}</a><a href={`mailto:${draft.email}`} className="rounded-xl border border-slate-200 px-4 py-2.5 text-[10px] font-bold text-slate-700">Pošalji email</a></div></div>
    </section>}

    <footer className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-6 py-4 text-[9px] text-slate-400 sm:px-12"><span>© {new Date().getFullYear()} {draft.businessName}. Sva prava zadržana.</span><span>Izrađeno uz DiV.ai</span></footer>
  </div>;
}

function EditorCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4"><h2 className="text-sm font-black">{title}</h2><p className="mt-1 text-[10px] leading-4 text-slate-500">{subtitle}</p></div><div className="space-y-3">{children}</div></section>;
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block min-w-0 text-xs font-bold text-slate-600">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white" /></label>;
}

function PreviewInput({ label, name, placeholder, type = 'text', required = false }: { label: string; name: string; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="block text-left text-[9px] font-bold text-slate-600">{label}<input name={name} type={type} placeholder={placeholder} required={required} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium outline-none transition placeholder:text-slate-300 focus:border-indigo-400" /></label>;
}

function HoursRow({ day, time }: { day: string; time: string }) {
  return <div className="flex justify-between gap-3 border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0"><span className="text-slate-600">{day}</span><span className="font-bold text-slate-800">{time}</span></div>;
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="flex gap-3 rounded-2xl p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-black text-indigo-700">{icon}</span><span><span className="block text-sm font-extrabold">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{text}</span></span></div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">{children}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>;
}
