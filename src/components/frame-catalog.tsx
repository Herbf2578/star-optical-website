'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowUpRight, Glasses } from 'lucide-react';
import { whatsappUrl } from '@/lib/site';
const categories = ['全部款式', '男士', '女士', '兒童', '輕量', '商務', '太陽眼鏡'];
const frames = [
  { title: '經典方框', subtitle: '俐落線條，日常百搭', tags: ['男士', '女士'], image: '/images/editorial/frame-classic.png', material: '深色框形示意' },
  { title: '輕盈金屬', subtitle: '細緻輪廓，簡約風格', tags: ['男士', '女士', '輕量'], image: '/images/editorial/frame-metal.png', material: '金屬色框形示意' },
  { title: '兒童鏡架', subtitle: '著重尺寸、穩定與配戴感', tags: ['兒童'], image: '/images/editorial/frame-kids.png', material: '童趣色彩示意' },
  { title: '時尚大框', subtitle: '柔和弧線，展現個人風格', tags: ['女士'], image: '/images/editorial/frame-fashion.png', material: '暖色框形示意' },
  { title: '商務半框', subtitle: '簡潔沉穩，配合工作穿搭', tags: ['男士', '商務', '輕量'], image: '/images/editorial/frame-business.png', material: '半框造型示意' },
  { title: '太陽眼鏡', subtitle: '戶外穿搭的風格選擇', tags: ['男士', '女士', '太陽眼鏡'], image: '/images/editorial/frame-sun.png', material: '深色鏡片造型示意' },
];
export function FrameCatalog() {
  const [category, setCategory] = useState('全部款式');
  const filtered = frames.filter(frame => category === '全部款式' || frame.tags.includes(category));
  return <><div className="catalog-filters" role="group" aria-label="按鏡架款式篩選">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === '全部款式' && <Glasses size={17} aria-hidden="true" />}{item}</button>)}</div><p className="catalog-status" aria-live="polite">{category} · {filtered.length} 類款式</p><div className="frame-grid">{filtered.map(frame => <article className="frame-card" key={frame.title}><div className="frame-visual frame-photo"><Image src={frame.image} fill alt={`${frame.title}的 AI 款式示意，非實際產品`} sizes="(max-width:359px) 100vw, (max-width:767px) 50vw, 33vw" /><span>AI 款式示意 · 非實際產品</span></div><div className="frame-copy"><h3>{frame.title}</h3><p>{frame.subtitle}</p><small>{frame.material}</small><a className="text-link" href={whatsappUrl('frames', `你好，我想查詢品牌鏡架及到店試戴安排。我對${frame.title}款式有興趣，請問可以了解哪些選擇？`)} target="_blank" rel="noopener noreferrer">查詢類似款式<ArrowUpRight size={16} aria-hidden="true" /></a></div></article>)}</div><p className="note">此目錄展示配搭方向，不代表實際型號、材質、功能、現貨或售價。具體產品及供應，請向門市查詢。</p></>;
}
