'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { messages, whatsappUrl, type EnquiryType } from '@/lib/site';
export function EnquiryForm({ initialService = 'children', initialMessage = '' }: { initialService?: EnquiryType; initialMessage?: string }) {
  const [preview, setPreview] = useState('');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!url) return;
    previewHeading.current?.focus({ preventScroll: true });
    previewHeading.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }, [url]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = data.get('service') as EnquiryType;
    const name = String(data.get('name') ?? '').trim();
    if (!name) { const field = event.currentTarget.elements.namedItem('name') as HTMLInputElement; field.setCustomValidity('請填寫您的稱呼。'); field.reportValidity(); return; }
    const phone = String(data.get('phone') ?? '').trim();
    if (phone && !/^\+?\d{8,15}$/.test(phone.replaceAll(' ', ''))) { const field = event.currentTarget.elements.namedItem('phone') as HTMLInputElement; field.setCustomValidity('請填寫8至15位數字，可加入國際區號及空格。'); field.reportValidity(); return; }
    const message = String(data.get('message') ?? '').trim();
    const text = `${messages[type]}\n稱呼：${name}${phone ? `\n聯絡電話：${phone}` : ''}${message ? `\n查詢內容：${message}` : ''}`;
    setPreview(text); setUrl(whatsappUrl(type, text));
  }
  return <form id="enquiry" className="enquiry-form" aria-label="整理 WhatsApp 查詢" onSubmit={submit} onChange={() => { if (url) { setUrl(''); setPreview(''); } }}>
    <ol className="enquiry-flow" aria-label="WhatsApp 查詢步驟"><li aria-current={!url ? 'step' : undefined}><span>1</span>填寫查詢</li><li aria-current={url ? 'step' : undefined}><span>2</span>預覽內容</li><li><span>3</span>開啟 WhatsApp 發送</li></ol>
    <p className="enquiry-flow-note">先整理內容，再由您發送訊息；門市回覆後確認預約。</p>
    <div className="field"><label htmlFor="enquiry-service">想了解的服務 <span>（必填）</span></label><select id="enquiry-service" name="service" required defaultValue={initialService} onChange={event => { if (event.target.value !== 'frames' && message === initialMessage) setMessage(''); }}><option value="children">兒童近視管理／驗眼</option><option value="adult">成人驗眼及配鏡</option><option value="school">明眸童心護眼計劃／學校合作</option><option value="frames">品牌鏡架／到店試戴</option><option value="general">其他查詢</option></select></div>
    <div className="form-grid"><div className="field"><label htmlFor="enquiry-name">您的稱呼 <span>（必填）</span></label><input id="enquiry-name" name="name" autoComplete="name" placeholder="例如：陳小姐" required minLength={1} maxLength={40} pattern=".*\S.*" onInput={event => event.currentTarget.setCustomValidity('')} /></div><div className="field"><label htmlFor="enquiry-phone">聯絡電話 <span>（選填）</span></label><input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="例如：+852 9123 4567" pattern="[+0-9 ]{8,20}" maxLength={20} onInput={event => event.currentTarget.setCustomValidity('')} /></div></div>
    <div className="field"><label htmlFor="enquiry-message">查詢內容 <span>（選填）</span></label><textarea id="enquiry-message" name="message" rows={4} maxLength={500} value={message} onChange={event => setMessage(event.target.value)} placeholder="可填寫希望到訪時間或一般問題。學校可填年級、預計人數及活動日期。請勿填寫兒童詳細健康紀錄。" aria-describedby="enquiry-privacy" /></div>
    <p className="form-privacy" id="enquiry-privacy"><ShieldCheck size={16} aria-hidden="true" />資料只在本頁用來生成訊息，不會儲存在網站。請勿提供身份證、兒童姓名或詳細健康紀錄。</p>
    <label className="checkbox-label"><input type="checkbox" name="consent" required />我明白資料將放入 WhatsApp 預填訊息，並由我自行按發送。<span className="sr-only">（必填）</span></label>
    <button type="submit" className="button button-navy form-submit"><MessageCircle size={19} aria-hidden="true" />生成 WhatsApp 查詢訊息<ArrowUpRight size={18} aria-hidden="true" /></button>
    {url && <div className="message-preview" role="status"><h3 ref={previewHeading} tabIndex={-1}>訊息已整理，尚未發送</h3><p>第2步：檢查下方內容；第3步：開啟 WhatsApp 並自行按發送。門市回覆後確認預約。</p><pre>{preview}</pre><a className="button button-green" href={url} target="_blank" rel="noopener noreferrer">透過 WhatsApp 發送查詢<ArrowUpRight size={18} aria-hidden="true" /></a></div>}
  </form>;
}
