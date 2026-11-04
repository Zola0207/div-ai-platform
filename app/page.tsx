'use client';

import { supabase } from '@/lib/supabase';
// --- TYPINGS ---
interface Service {
  title: string;
  desc: string;
}

interface GeneratedSite {
  title: string;
  tagline: string;
  about: string;
  services: Service[];
  contact: string;
  primaryColor: string;
}

interface Lead {
  id: number;
  client: string;
  phone: string;
  service: string;
  date: string;
  status: 'Novo' | 'Kontaktirano' | 'Završeno';
}

export default function DiVPlatform() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'landing' | 'generator' | 'userDashboard' | 'superAdmin'>('landing');

  // Generator State
  const [bizName, setBizName] = useState('');
  const [bizPrompt, setBizPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<GeneratedSite | null>(null);

  // User Dashboard State sa Supabase povezivanjem
  const [trialDaysLeft] = useState(30);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        // Mapiramo podatke iz baze u format koji tabela očekuje
        const formattedLeads = data.map((item: any) => ({
          id: item.id,
          client: item.client_name,
          phone: item.phone,
          service: item.service,
          date: new Date(item.created_at).toLocaleDateString('sr-RS'),
          status: item.status
        }));
        setLeads(formattedLeads);
      }
      setLoadingLeads(false);
    }

    fetchLeads();
  }, []);

  // Handle AI Site Generation Simulation
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName || !bizPrompt) return;

    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedSite({
        title: bizName,
        tagline: `Vrhunska usluga i kvalitet na jednom mestu.`,
        about: `Dobrodošli u ${bizName}. Posvećeni smo pružanju najboljih usluga za naše klijente uz dugogodišnje iskustvo i stručni tim.`,
        services: [
          { title: 'Standardna Usluga', desc: 'Profionalna i brza realizacija prilagođena vašim potrebama.' },
          { title: 'Premium Paket', desc: 'Kompletna usluga sa garantovanim kvalitetom i podrškom.' },
          { title: 'Konsultacije', desc: 'Besplatni saveti i procena potreba za svakog novog klijenta.' }
        ],
        contact: 'Kontaktirajte nas već danas i zakažite vaš termin!',
        primaryColor: '#6366f1'
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-2xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30">
            Di
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            DiV<span className="text-indigo-400">.ai</span>
          </span>
        </div>

        {/* View Switcher for Testing/Demo */}
        <nav className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'landing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            🚀 Početna Stranica
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'generator' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✨ AI Generator
          </button>
          <button
            onClick={() => setActiveTab('userDashboard')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'userDashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 User Dashboard
          </button>
          <button
            onClick={() => setActiveTab('superAdmin')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'superAdmin' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            👑 Super Admin
          </button>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* 1. LANDING PAGE VIEW                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'landing' && (
        <div className="relative overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              Lansiraj svoj biznis za 60 sekundi
            </span>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-8 leading-[1.1]">
              Moderna platforma za brzo kreiranje <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                sajtova i aplikacija
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12 font-normal leading-relaxed">
              DiV.ai je namenjen malim preduzećima. Opši čime se baviš, a naš AI sistem kreira profesionalni sajt, hosting i sistem za rezervacije u trenutku.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <button
                onClick={() => setActiveTab('generator')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
              >
                Isprobaj Besplatno 30 Dana 🚀
              </button>
              <button
                onClick={() => setActiveTab('userDashboard')}
                className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-base px-8 py-4 rounded-2xl transition-all backdrop-blur-md"
              >
                Pogledaj Demo Dashboard
              </button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-20">
              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl hover:border-indigo-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl mb-6">⚡</div>
                <h3 className="text-xl font-bold text-white mb-3">Trenutno Generisanje</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Samo unesi naziv i kratak opis. AI kreira tekst, usklađuje boje i priprema kompletnu strukturu stranice.</p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl hover:border-purple-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-2xl mb-6">🎁</div>
                <h3 className="text-xl font-bold text-white mb-3">Prvi Mesec Besplatno</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Testiraj sve funkcije 30 dana bez ikakvih obaveza. Nakon toga nastavi uz prilagođenu mesečnu pretplatu.</p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl hover:border-pink-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 text-2xl mb-6">📈</div>
                <h3 className="text-xl font-bold text-white mb-3">Sistem Upita i Klijenata</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Sve kontakt forme sa sajta direktno stižu na tvoj DiV kontrolni panel kako ne bi propustio nijednog klijenta.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AI GENERATOR PAGE VIEW                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'generator' && (
        <div className="min-h-[calc(100vh-73px)] flex flex-col lg:flex-row">
          {/* Left Form */}
          <div className="w-full lg:w-5/12 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Korak 1 od 2
              </span>
              <h2 className="text-3xl font-black text-white mt-4 mb-2">Opši svoj biznis</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Unesi osnovne informacije. Naš DiV AI model priprema sajt i aktivira tvoj besplatni probni period od 30 dana.</p>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Naziv Preduzeća ili Radnje</label>
                  <input
                    type="text"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="npr. Frizerski Salon Bella"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Opis Usluga i Lokacija</label>
                  <textarea
                    rows={5}
                    value={bizPrompt}
                    onChange={(e) => setBizPrompt(e.target.value)}
                    placeholder="npr. Nudimo šišanje, feniranje i svečane frizure. Nalazimo se u centru grada, radimo svakog dana od 09h do 20h."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold p-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>DiV AI kreira sajt...</span>
                    </>
                  ) : (
                    <span>Generiši Sajt Odmah 🚀</span>
                  )}
                </button>
              </form>
            </div>

            {generatedSite && (
              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <button
                  onClick={() => setActiveTab('userDashboard')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-4 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Sačuvaj i Otvori Dashboard (30 Dana Besplatno) ➔</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Live Preview */}
          <div className="w-full lg:w-7/12 bg-slate-950 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden">
            <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            {!generatedSite && !isGenerating && (
              <div className="text-center text-slate-500 max-w-sm">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl mx-auto mb-4 text-indigo-400">
                  💻
                </div>
                <h3 className="text-white font-bold mb-2">Pregled uživo u realnom vremenu</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Popuni podatke na levoj strani i klikni na "Generiši Sajt" da bi ovde odmah video pregled kreiranog sajta.</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-300 font-medium text-sm">DiV AI generiše tekstove, dizajnersku paletu i strukturu...</p>
              </div>
            )}

            {generatedSite && !isGenerating && (
              <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl transition-all border border-slate-200">
                {/* Site Hero */}
                <div className="p-10 text-center text-white bg-indigo-600 relative">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    {generatedSite.title}
                  </span>
                  <h2 className="text-3xl font-black mt-4 mb-2">{generatedSite.tagline}</h2>
                  <p className="text-xs opacity-90 max-w-md mx-auto leading-relaxed">{generatedSite.about}</p>
                </div>

                {/* Services */}
                <div className="p-8">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 text-center">Izdvojene Usluge</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {generatedSite.services.map((srv, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <h5 className="font-bold text-sm text-slate-900 mb-1">{srv.title}</h5>
                        <p className="text-xs text-slate-500 leading-relaxed">{srv.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact CTA */}
                <div className="p-6 bg-slate-100 border-t border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-600 mb-3">{generatedSite.contact}</p>
                  <button className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md">
                    Zakaži Termin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. USER DASHBOARD VIEW                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'userDashboard' && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
          {/* Top Info Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
            <div>
              <h1 className="text-2xl font-black text-white">{bizName || 'Frizerski Salon Bella'}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Vaš sajt je uživo na: <a href="#" className="text-indigo-400 underline font-semibold">bella.div.ai</a>
              </p>
            </div>
            <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-5 py-3 rounded-2xl border border-slate-700 transition-all">
              👁️ Poseti svoj sajt
            </button>
          </div>

          {/* Trial Status Banner */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/40 border border-indigo-500/30 p-8 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Probni Period Aktivan
              </span>
              <h3 className="text-xl font-bold text-white mt-3">Preostalo vam je još {trialDaysLeft} dana besplatnog korišćenja</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Iskoristite probni period da testirate sve funkcije. Nakon isteka, cena mesečnog održavanja i hostinga iznosi samo 19€/mesečno.
              </p>
            </div>
            <button className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-xl transition-all whitespace-nowrap">
              Aktiviraj Pretpalatu 💳
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ukupno Upita</span>
              <div className="text-3xl font-black text-indigo-400 mt-2">{leads.length}</div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Posete ovom mesecu</span>
              <div className="text-3xl font-black text-emerald-400 mt-2">148</div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Sajta</span>
              <div className="text-3xl font-black text-white mt-2 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xl">Aktivan</span>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-6">Prispeli Upiti i Rezervacije</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase">
                  <tr>
                    <th className="p-4 rounded-l-2xl">Klijent</th>
                    <th className="p-4">Telefon</th>
                    <th className="p-4">Usluga</th>
                    <th className="p-4">Vreme</th>
                    <th className="p-4 rounded-r-2xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/20 transition-all">
                      <td className="p-4 font-bold text-white">{lead.client}</td>
                      <td className="p-4 text-slate-300">{lead.phone}</td>
                      <td className="p-4 text-slate-300">{lead.service}</td>
                      <td className="p-4 text-slate-500">{lead.date}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                          lead.status === 'Novo' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                          lead.status === 'Kontaktirano' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUPER ADMIN VIEW                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'superAdmin' && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-6">
            <div>
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Super Admin
              </span>
              <h1 className="text-2xl font-black text-white mt-2">DiV Globalna Kontrolna Tabla</h1>
            </div>
            <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
              Sistem radi stabilno 🟢
            </div>
          </div>

          {/* Admin KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <span className="text-xs font-bold text-slate-500 uppercase">Ukupno Preduzeća</span>
              <div className="text-3xl font-black text-white mt-2">84</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <span className="text-xs font-bold text-slate-500 uppercase">U Besplatnoj Probi</span>
              <div className="text-3xl font-black text-indigo-400 mt-2">38</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <span className="text-xs font-bold text-slate-500 uppercase">Aktivni Pretplatnici</span>
              <div className="text-3xl font-black text-emerald-400 mt-2">42</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
              <span className="text-xs font-bold text-slate-500 uppercase">Mesečni Prihod (MRR)</span>
              <div className="text-3xl font-black text-rose-400 mt-2">798 €</div>
            </div>
          </div>

          {/* Tenants List */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-6">Sva Preduzeća na Platformi</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase">
                  <tr>
                    <th className="p-4 rounded-l-2xl">Naziv</th>
                    <th className="p-4">Poddomen</th>
                    <th className="p-4">Paket / Status</th>
                    <th className="p-4">Datum Registracije</th>
                    <th className="p-4 rounded-r-2xl text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="hover:bg-slate-800/20 transition-all">
                    <td className="p-4 font-bold text-white">Frizerski Salon Bella</td>
                    <td className="p-4 text-indigo-400 font-mono">bella.div.ai</td>
                    <td className="p-4">
                      <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full font-bold text-[10px]">
                        Trial (Još 24 dana)
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">01. Nov 2026.</td>
                    <td className="p-4 text-right">
                      <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition-all">
                        Upravljaj
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/20 transition-all">
                    <td className="p-4 font-bold text-white">Automehaničar Brzi Auto</td>
                    <td className="p-4 text-indigo-400 font-mono">brziauto.div.ai</td>
                    <td className="p-4">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold text-[10px]">
                        Plaćeno (19€/mo)
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">28. Okt 2026.</td>
                    <td className="p-4 text-right">
                      <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition-all">
                        Upravljaj
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}