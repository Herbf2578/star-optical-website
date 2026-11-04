import type { Metadata } from 'next';
import { Header, MobileCTA } from '@/components/header';
import { Footer } from '@/components/footer';
import { site } from '@/lib/site';
import './globals.css';
import './service-pages.css';
import './photo-enhancements.css';
import './business-enhancements.css';
export const metadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: { default: '北角兒童近視管理與全面視光服務｜明星眼鏡', template: '%s' },
  robots: process.env.SITE_INDEXABLE === 'true' ? { index: true, follow: true } : { index: false, follow: false },
  icons: { icon: '/icon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const website = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${site.origin}/#website`, name: site.brand, url: `${site.origin}/`, inLanguage: 'zh-HK', publisher: { '@id': `${site.origin}/#business` } };
  const business = { '@context': 'https://schema.org', '@type': 'Optician', '@id': `${site.origin}/#business`, name: site.brand, legalName: site.company, sameAs: site.socialProfiles.map(profile => profile.url), url: `${site.origin}/`, telephone: site.phone, contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', telephone: `+${site.whatsapp}`, url: `https://wa.me/${site.whatsapp}` }, logo: `${site.origin}/images/star-optical-logo.jpg`, image: `${site.origin}/images/star-optical-shop.jpg`, address: { '@type': 'PostalAddress', streetAddress: site.streetAddress, addressLocality: '北角', addressRegion: '香港', addressCountry: 'HK' }, areaServed: { '@type': 'Place', name: '香港' }, hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}` };
  return <html lang="zh-HK"><body><a className="skip-link" href="#main-content">跳至主要內容</a><Header /><main id="main-content" tabIndex={-1}><span id="main" className="legacy-anchor" aria-hidden="true" />{children}</main><Footer /><MobileCTA /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, '\\u003c') }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business).replace(/</g, '\\u003c') }} /></body></html>;
}
