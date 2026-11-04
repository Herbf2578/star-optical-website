import type { MetadataRoute } from 'next';
import { navigation, site } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap { return navigation.map(page => ({ url: `${site.origin}${page.href}` })); }
