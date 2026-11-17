import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getApiAuth, isServerSupabaseConfigured } from '@/lib/api-auth';

type Row = { site_id: string | null; created_at: string };

function dayKey(value: string | Date): string {
  return new Date(value).toISOString().slice(0, 10);
}

function emptySummary(available: boolean) {
  const daily: { date: string; views: number }[] = [];
  for (let index = 13; index >= 0; index -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - index);
    daily.push({ date: dayKey(date), views: 0 });
  }
  return {
    available,
    totals: { views: 0, viewsToday: 0, views7: 0, leads: 0, conversion: 0 },
    daily,
    sites: [] as { id: string; name: string; slug: string | null; views: number; leads: number }[],
  };
}

export async function GET(req: Request) {
  try {
    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({ error: 'Baza nije povezana.', configured: false }, { status: 503 });
    }

    const auth = await getApiAuth(req);
    if (!auth.user) {
      return NextResponse.json({ error: 'Prijavite se da vidite statistiku.' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: sites, error: sitesError } = await admin
      .from('sites')
      .select('id, name, slug')
      .eq('owner_id', auth.user.id);

    if (sitesError) {
      console.error('Statistika — greška pri čitanju sajtova:', sitesError.message);
      return NextResponse.json({ error: 'Statistika nije dostupna.' }, { status: 500 });
    }

    const siteRows = sites ?? [];
    if (siteRows.length === 0) return NextResponse.json(emptySummary(true));

    const siteIds = siteRows.map((site) => site.id);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 29);
    since.setUTCHours(0, 0, 0, 0);

    const viewsQuery = await admin
      .from('site_views')
      .select('site_id, created_at')
      .in('site_id', siteIds)
      .gte('created_at', since.toISOString());

    // Tabela se dodaje migracijom; dok je nema, panel prikazuje nule.
    if (viewsQuery.error) {
      const known = ['42P01', 'PGRST205'].includes(viewsQuery.error.code ?? '');
      if (!known) console.error('Statistika — greška pri čitanju poseta:', viewsQuery.error.message);
      return NextResponse.json({ ...emptySummary(false), sites: siteRows.map((site) => ({ ...site, views: 0, leads: 0 })) });
    }

    const { data: leadsData } = await admin
      .from('leads')
      .select('site_id, created_at')
      .in('site_id', siteIds)
      .gte('created_at', since.toISOString());

    const views = (viewsQuery.data ?? []) as Row[];
    const leads = (leadsData ?? []) as Row[];

    const today = dayKey(new Date());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const perSite = new Map<string, { views: number; leads: number }>(
      siteIds.map((id) => [id, { views: 0, leads: 0 }]),
    );
    for (const view of views) {
      if (view.site_id && perSite.has(view.site_id)) perSite.get(view.site_id)!.views += 1;
    }
    for (const lead of leads) {
      if (lead.site_id && perSite.has(lead.site_id)) perSite.get(lead.site_id)!.leads += 1;
    }

    const daily: { date: string; views: number }[] = [];
    for (let index = 13; index >= 0; index -= 1) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - index);
      daily.push({ date: dayKey(date), views: 0 });
    }
    const dailyMap = new Map(daily.map((entry) => [entry.date, entry]));
    for (const view of views) {
      const bucket = dailyMap.get(dayKey(view.created_at));
      if (bucket) bucket.views += 1;
    }

    const totalViews = views.length;
    const totalLeads = leads.length;

    return NextResponse.json({
      available: true,
      totals: {
        views: totalViews,
        viewsToday: views.filter((view) => dayKey(view.created_at) === today).length,
        views7: views.filter((view) => new Date(view.created_at) >= sevenDaysAgo).length,
        leads: totalLeads,
        conversion: totalViews > 0 ? Math.round((totalLeads / totalViews) * 1000) / 10 : 0,
      },
      daily,
      sites: siteRows.map((site) => ({
        id: site.id,
        name: site.name,
        slug: site.slug,
        views: perSite.get(site.id)?.views ?? 0,
        leads: perSite.get(site.id)?.leads ?? 0,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška.';
    console.error('Analytics summary error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
