import type { Metadata } from 'next';
import { site } from './site';
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title, description, alternates: { canonical: `${site.origin}${path}` },
    openGraph: { title, description, url: `${site.origin}${path}`, siteName: site.brand, locale: 'zh_HK', type: 'website', images: [{ url: '/images/star-optical-shop.jpg', width: 2048, height: 1536, alt: '明星眼鏡北角門市外觀' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/images/star-optical-shop.jpg'] },
  };
}
