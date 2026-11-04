import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', ...(process.env.SITE_INDEXABLE === 'true' ? { allow: '/' } : { disallow: '/' }) }, sitemap: `${site.origin}/sitemap.xml` }; }
