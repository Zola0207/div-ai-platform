import type { MetadataRoute } from 'next';

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://div-ai-platform.vercel.app').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/nalog', '/auth/'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
