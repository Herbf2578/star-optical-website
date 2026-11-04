import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Eye, Glasses, School, MapPin, Phone, Navigation } from 'lucide-react';
import { mapsUrl, site } from '@/lib/site';
import { WhatsAppLink } from './ui';

const audiencePaths = [
  { type: 'children' as const, icon: Eye, audience: '給家長', title: '兒童視力與近視管理', text: '未選好方案也可以先查詢，從孩子的眼睛檢查與家庭日常安排開始。', href: '/children-eye-care/', detail: '了解兒童服務', action: '查詢兒童視力評估' },
  { type: 'adult' as const, icon: Glasses, audience: '給成人及長者', title: '成人驗眼與配鏡', text: '從工作、閱讀及日常配戴需要，了解漸進鏡片、隱形眼鏡與鏡架選擇。', href: '/adult-eyewear/', detail: '了解成人配鏡', action: '查詢配鏡服務' },
  { type: 'school' as const, icon: School, audience: '給學校', title: '明眸童心護眼計劃', text: '中小學到校驗眼及學童近視篩查，先討論年級、人數、日期與活動需要。', href: '/school-vision-screening/', detail: '了解學校合作', action: '查詢學校合作' },
];

export function AudiencePaths() {
  return <section className="audience-section" aria-labelledby="audience-heading"><div className="container"><div className="audience-intro"><p className="eyebrow">START WITH YOUR NEEDS</p><h2 id="audience-heading">您想先了解哪一項服務？</h2><p>選擇適合您的入口，直接與門市開始對話。</p></div><div className="audience-grid">{audiencePaths.map(({ type, icon: Icon, audience, title, text, href, detail, action }) => <article className={`audience-card audience-${type}`} data-audience={type} key={type}><span className="audience-label"><Icon size={21} aria-hidden="true" />{audience}</span><h3>{title}</h3><p>{text}</p><div className="audience-actions"><WhatsAppLink type={type} variant={type === 'children' ? 'gold' : 'outline'}>{action}</WhatsAppLink><Link className="text-link" href={href}>{detail}<ArrowRight size={16} aria-hidden="true" /></Link></div></article>)}</div></div></section>;
}

export function StoreProof() {
  return <section className="store-proof-section" aria-labelledby="store-proof-heading"><div className="container store-proof"><div className="store-proof-photo"><Image src="/images/star-optical-shop.jpg" alt="明星眼鏡北角真實門市，綠色星形招牌及眼鏡陳列" fill sizes="(max-width: 767px) 100vw, 38vw" className="object-cover" /><span className="photo-tag">北角門市實景</span></div><div className="store-proof-copy"><p className="eyebrow">A REAL STORE IN NORTH POINT</p><h2 id="store-proof-heading">先認識我們的北角門市。</h2><p>查詢服務、親身了解配戴感受，再與門市確認合適安排。兒童驗眼、成人配鏡及鏡架試戴，都可以先從一個對話開始。</p><address><MapPin size={20} aria-hidden="true" /><a href={mapsUrl} target="_blank" rel="noopener noreferrer">{site.address}<ArrowUpRight size={14} aria-hidden="true" /></a></address><div className="store-proof-details"><a href={`tel:${site.phone}`}><Phone size={17} aria-hidden="true" />{site.displayPhone}</a><span>{site.hours}</span></div><div className="button-row"><WhatsAppLink type="children">查詢兒童驗眼安排</WhatsAppLink><a className="text-link" href={mapsUrl} target="_blank" rel="noopener noreferrer"><Navigation size={16} aria-hidden="true" />查看到店路線<ArrowUpRight size={15} aria-hidden="true" /></a></div></div></div></section>;
}

export function PageSectionNav({ items }: { items: { href: string; label: string }[] }) {
  return <nav className="page-section-nav container" aria-label="本頁內容"><span>快速了解</span><div>{items.map(item => <Link href={item.href} key={item.href}>{item.label}<ArrowRight size={13} aria-hidden="true" /></Link>)}</div></nav>;
}
