import type { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isServerSupabaseConfigured } from '@/lib/api-auth';
import { isSiteDomainConfigured } from '@/lib/site-url';

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://div-ai-platform.vercel.app').replace(/\/$/, '');

async function publishedSites(): Promise<{ slug: string; updated_at: string | null }[]> {
  if (!isServerSupabaseConfigured()) return [];
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('sites')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(5000);
    return (data ?? []).filter((row) => Boolean(row.slug));
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${appUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/privatnost`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${appUrl}/uslovi`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Kada su sajtovi na poddomenima, svaki ima svoj sitemap.xml. Cross-host
  // adrese u platformskom sitemapu nisu dozvoljene.
  const sites = isSiteDomainConfigured() ? [] : await publishedSites();
  return [
    ...pages,
    ...sites.map((site) => ({
      url: `${appUrl}/s/${site.slug}`,
      lastModified: site.updated_at ? new Date(site.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
