'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, Phone, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react';
import { navigation, site, pageEnquiry, whatsappUrl } from '@/lib/site';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const type = pageEnquiry(pathname);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return <>
    <div className="utility-bar"><div className="container utility-inner"><span><MapPin size={12} aria-hidden="true" />北角英皇道 · 專注每一個清晰視界</span><a href={`tel:${site.phone}`}><Phone size={12} aria-hidden="true" />{site.displayPhone}</a></div></div>
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" href="/" aria-label="STAR OPTICAL 明星眼鏡 首頁" onClick={() => setOpen(false)}><Image src="/images/star-optical-logo.jpg" width={94} height={45} alt="" preload /><span className="brand-type">STAR OPTICAL<span>明星眼鏡</span></span></Link>
      <nav className="desktop-nav" aria-label="主要導覽">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}</nav>
      <a className="header-whatsapp" aria-label="WhatsApp 查詢" href={whatsappUrl(type)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /><span>WhatsApp 查詢</span><ArrowUpRight size={15} aria-hidden="true" /></a>
      <button ref={menuButton} type="button" className="menu-toggle" aria-controls="mobile-navigation" aria-expanded={open} aria-label={open ? '關閉選單' : '開啟選單'} onClick={() => setOpen(!open)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
    </div><nav id="mobile-navigation" aria-label="手機導覽" className="mobile-nav" hidden={!open}>{navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} onClick={() => setOpen(false)}>{item.label}<ArrowUpRight size={17} aria-hidden="true" /></Link>)}<p>預約安排須由門市確認</p></nav></header>
  </>;
}
export function MobileCTA() {
  const type = pageEnquiry(usePathname());
  return <div className="mobile-cta"><a href={`tel:${site.phone}`}><Phone size={19} aria-hidden="true" />致電門市</a><a href={whatsappUrl(type)} target="_blank" rel="noopener noreferrer"><MessageCircle size={20} aria-hidden="true" />WhatsApp 查詢／預約</a></div>;
}
