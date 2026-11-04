import Link from 'next/link';
export default function NotFound() { return <section className="section not-found container"><p className="eyebrow">404 · PAGE NOT FOUND</p><h1>這個頁面暫時找不到。</h1><p>您可以返回首頁，或聯絡門市查詢服務。</p><div className="button-row"><Link className="button button-gold" href="/">返回首頁</Link><Link className="button button-outline" href="/contact/">聯絡我們</Link></div></section>; }
