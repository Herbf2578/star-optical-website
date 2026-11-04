import Image from 'next/image';
import { BookOpen, CalendarCheck2, CarFront, ClipboardCheck, ContactRound, Eye, Glasses, HeartHandshake, Laptop, ScanEye, Shirt, Sun, UsersRound } from 'lucide-react';
import { LegacyAnchors, Benefits, Breadcrumb, CheckList, CTA, EditorialPhoto, FAQ, FeatureCard, Hero, Section, Steps, TextLink, WhatsAppLink } from '@/components/ui';
import { PageSectionNav } from '@/components/conversion';
import { pageMetadata } from '@/lib/seo';
import { messages } from '@/lib/site';

export const metadata = pageMetadata(
  '北角成人驗眼及配鏡｜漸進鏡片、隱形眼鏡｜明星眼鏡',
  '明星眼鏡北角門市提供成人及長者配鏡、漸進鏡片、隱形眼鏡驗配及訂購。按工作、閱讀及日常需要討論鏡片與鏡架，WhatsApp查詢預約。',
  '/adult-eyewear/',
);

export default function AdultPage() {
  return <>
    <Hero eyebrow="專業視光檢查 · 個人化配鏡建議" title={<>成人驗眼與配鏡<br />清晰，貼近您的生活</>} subtitle="工作 · 閱讀 · 日常佩戴" description="從視力需要到佩戴感受，為成人及長者提供配鏡選擇。一起了解您的生活習慣，討論合適的鏡片、鏡架及隱形眼鏡安排。" image="/images/adult-care.png" imageAlt="成人試戴眼鏡的 AI 服務示意圖片，並非真實顧客或店員" type="adult" secondaryHref="#adult-services" secondaryLabel="了解成人配鏡服務" />
    <Benefits items={[
      { icon: ScanEye, title: '由驗眼開始', text: '先了解目前視力及配鏡需要' },
      { icon: UsersRound, title: '個人化建議', text: '配合工作與日常使用情境' },
      { icon: Glasses, title: '鏡片與鏡架配合', text: '兼顧功能、尺寸及佩戴感受' },
      { icon: HeartHandshake, title: '把安排問清楚', text: '確認產品、費用及取件跟進' },
    ]} />
    <Breadcrumb label="成人配鏡" path="/adult-eyewear/" />
    <PageSectionNav items={[{ href: '#adult-services', label: '配鏡服務' }, { href: '#lifestyle', label: '生活需要' }, { href: '#adult-process', label: '配鏡流程' }, { href: '#adult-faq', label: '常見問題' }]} />

    <LegacyAnchors ids={['section-1', 'section-2']} /><Section id="adult-services" eyebrow="EYEWEAR FOR EVERYDAY" title="適合您的眼鏡，從了解日常開始" description="無論首次配鏡、更新度數，或想改善現有眼鏡的使用感受，都可以先與我們談談。">
      <div className="service-grid cols-4 adult-service-options">
        <FeatureCard icon={Eye} title="成人及長者驗眼" image="/images/editorial/eye-exam.png" imageAlt="成人眼睛檢查的 AI 服務示意圖片，非真實個案" tag="AI 服務示意"><p>了解視力與現有眼鏡使用情況，作為配鏡討論的基礎。實際檢查項目按個別需要及門市安排確認。</p><WhatsAppLink type="adult" variant="outline" message={`${messages.adult}\n我想了解成人及長者驗眼的檢查及預約安排。`}>查詢成人驗眼</WhatsAppLink></FeatureCard>
        <FeatureCard icon={Glasses} title="漸進鏡片" image="/images/frames-collection.png" imageAlt="框架眼鏡的 AI 示意圖片，非實際商品或鏡片規格展示" tag="AI 鏡架示意"><p>對看遠、看中距離和閱讀有不同需要，可討論漸進鏡片的配合。現有網站列有依視路、瑞士寶及其他品牌選擇。</p><WhatsAppLink type="adult" variant="outline" message={`${messages.adult}\n我想了解配合看遠、螢幕及閱讀需要的漸進鏡片選擇。`}>查詢漸進鏡片</WhatsAppLink></FeatureCard>
        <FeatureCard icon={ContactRound} title="隱形眼鏡驗配" image="/images/editorial/daily-lens.png" imageAlt="每日即棄隱形眼鏡的 AI 示意圖片，非實際商品" tag="AI 鏡片示意"><p>提供隱形眼鏡驗配及訂購查詢，按眼睛狀況與使用習慣討論選擇，並問清佩戴、護理及跟進要求。</p><WhatsAppLink type="adult" variant="outline" message={`${messages.adult}\n我想查詢隱形眼鏡驗配、佩戴指導及訂購安排。`}>查詢隱形眼鏡驗配</WhatsAppLink></FeatureCard>
        <FeatureCard icon={Shirt} title="鏡架挑選與配搭" image="/images/adult-care.png" imageAlt="成人試戴眼鏡的 AI 服務示意圖片，非真實顧客或店員" tag="AI 服務示意"><p>一起考慮面形、尺寸、鏡片要求與個人風格。品牌、型號、顏色及供應情況須向門市確認。</p><WhatsAppLink type="adult" variant="outline" message={`${messages.adult}\n我想查詢成人鏡架配搭及到店試戴安排。`}>查詢鏡架配搭</WhatsAppLink></FeatureCard>
      </div>
    </Section>

    <LegacyAnchors ids={['section-3']} /><Section id="lifestyle" tone="soft" eyebrow="YOUR LIFESTYLE MATTERS" title="每一個生活場景，都值得看清楚" description="配鏡前分享常用距離、佩戴時間和現有困擾，有助討論更切合實際的選擇。">
      <div className="service-grid cols-4 lifestyle-grid">
        <FeatureCard icon={Laptop} title="工作與螢幕" image="/images/editorial/work-vision.png" imageAlt="配戴眼鏡使用電腦工作的 AI 生活情境示意圖片" tag="AI 情境示意">主要用手提電腦、桌面螢幕還是多個屏幕？可先整理常用觀看距離與工作環境。</FeatureCard>
        <FeatureCard icon={BookOpen} title="閱讀與近距離" image="/images/editorial/reading-vision.png" imageAlt="配戴眼鏡閱讀的 AI 生活情境示意圖片" tag="AI 情境示意">閱讀、手機及手作的距離各有不同。說明目前需要移動書本或調整姿勢的情況。</FeatureCard>
        <FeatureCard icon={CarFront} title="駕駛與外出" image="/images/editorial/driving-vision.png" imageAlt="配戴眼鏡駕駛的 AI 生活情境示意圖片" tag="AI 情境示意">分享日間或夜間駕駛的視覺需要。若出現新發或明顯的視力異常，應先尋求專業評估。</FeatureCard>
        <FeatureCard icon={Sun} title="日常與戶外" image="/images/adult-care.png" imageAlt="成人試戴日常眼鏡的 AI 服務示意圖片" tag="AI 服務示意">由通勤到休閒，討論鏡架穩定度、佩戴感受及太陽眼鏡選擇，按用途確認規格。</FeatureCard>
      </div>
    </Section>

    <Section>
      <div className="service-split progressive-panel">
        <div><p className="eyebrow">PROGRESSIVE LENSES</p><h2>漸進鏡片，<br />需要鏡片與佩戴一起配合。</h2><p className="service-lead">選擇漸進鏡片時，不只比較品牌，也應談談閱讀習慣、工作距離、鏡架尺寸與過往佩戴經驗。</p><p>依視路、瑞士寶及其他品牌的具體系列、鏡片規格、適用情況與報價，請向門市查詢。產品介紹不代表所有系列或版本均有現貨。</p><WhatsAppLink type="adult" message={`${messages.adult}\n我想了解配合看遠、螢幕及閱讀需要的漸進鏡片選擇。`}>查詢漸進鏡片</WhatsAppLink></div>
        <div className="photo-info-panel"><EditorialPhoto src="/images/editorial/reading-vision.png" alt="成年人配戴眼鏡閱讀的 AI 生活情境示意圖片" tag="AI 情境示意" aspectRatio="16 / 8" /><div className="info-panel"><h3>開始配鏡前，問清這四件事</h3><CheckList items={['鏡片設計是否配合自己的主要用途', '所選鏡架與鏡片是否適合一起使用', '完整報價、訂購及預計取件安排', '取鏡後的佩戴說明、調校及跟進方式']} /></div></div>
      </div>
    </Section>

    <Section tone="soft">
      <div className="service-image-band"><div className="service-band-photo"><Image src="/images/frames-collection.png" alt="不同風格鏡架的 AI 示意圖片，不代表實際商品或庫存" fill sizes="(max-width: 767px) 100vw, 55vw" className="object-cover" /><span className="image-disclosure">AI 鏡架示意 · 非實際商品</span></div><div className="service-band-copy"><p className="eyebrow">FIND YOUR FRAME</p><h2>選一副眼鏡，<br />也選每天的自在。</h2><p>經典、輕量或有個性的款式，先從試戴感受開始。亦可了解 BRAGi 面形掃描及 3D 打印鏡架、Panda Star 自家品牌的查詢安排。</p><TextLink href="/frames/">瀏覽品牌鏡架與試戴建議</TextLink></div></div>
    </Section>

    <Section id="adult-process" eyebrow="A THOUGHTFUL FITTING" title="成人配鏡流程" description="服務順序及所需時間以門市按個別需要安排為準。">
      <Steps items={[
        { icon: UsersRound, image: '/images/editorial/work-vision.png', imageAlt: '成人日常工作需要的 AI 情境示意圖片', tag: 'AI 情境示意', title: '了解需要', text: '分享目前眼鏡、工作距離與日常佩戴感受。' },
        { icon: ScanEye, image: '/images/editorial/eye-exam.png', imageAlt: '成人眼睛檢查的 AI 服務示意圖片', tag: 'AI 服務示意', title: '視力評估', text: '按個別情況安排檢查，討論視力與配鏡需要。' },
        { icon: ClipboardCheck, image: '/images/frames-collection.png', imageAlt: '框架眼鏡的 AI 示意圖片，不代表實際商品', tag: 'AI 鏡架示意', title: '鏡片建議', text: '比較合適選擇，問清規格、費用及供應安排。' },
        { icon: Glasses, image: '/images/adult-care.png', imageAlt: '成人眼鏡試戴的 AI 服務示意圖片', tag: 'AI 服務示意', title: '鏡架試戴', text: '配合面形、尺寸及鏡片需要，感受實際佩戴。' },
        { icon: CalendarCheck2, image: '/images/star-optical-shop.jpg', imageAlt: '明星眼鏡原有北角門市外觀照片', tag: '原有門市照片', title: '取鏡與跟進', text: '確認取件安排、佩戴說明及之後的查詢方式。' },
      ]} />
    </Section>

    <Section id="adult-faq" tone="soft" eyebrow="GOOD TO KNOW" title="成人配鏡常見問題">
      <FAQ items={[
        { question: '第一次戴漸進鏡片，需要注意甚麼？', answer: '先說明您的閱讀、螢幕及看遠需要，並分享過往眼鏡使用經驗。鏡片設計、鏡架配合與佩戴方法都需一起考慮；適應情況因人而異，可向門市了解取鏡後的跟進安排。' },
        { question: '現有眼鏡度數合適，是否仍可查詢新鏡架？', answer: '可以。帶同現有眼鏡，有助討論尺寸及使用感受；能否沿用鏡片、是否需要重新驗眼或配製鏡片，需由門市檢查及確認。' },
        { question: '成人及長者都可以預約嗎？', answer: '可以查詢成人及長者的驗眼配鏡需要。預約時可先說明目前使用眼鏡的情況，讓門市確認合適的服務安排。' },
        { question: '隱形眼鏡是否可以直接按眼鏡度數訂購？', answer: '隱形眼鏡的驗配需要考慮眼睛狀況、鏡片配合及使用方式，不能只按框架眼鏡度數自行決定。請先向門市查詢驗配及訂購安排。' },
        { question: '網站提到的品牌和產品都有現貨嗎？', answer: '產品介紹不代表現貨承諾。具體品牌、系列、型號、顏色、鏡片規格、售價及訂購時間，均須由門市確認。' },
        { question: '查詢前需要準備甚麼？', answer: '可先準備現有眼鏡、主要使用情境，以及您想改善的佩戴感受。若有以往驗眼資料，可先問門市是否需要帶同；毋須在網站查詢欄位提供詳細健康紀錄。' },
      ]} />
    </Section>
    <LegacyAnchors ids={['section-4']} /><CTA title="為每天的清晰，找一個合適選擇。" description="查詢成人驗眼、漸進鏡片、隱形眼鏡或到店配鏡安排。" type="adult" />
  </>;
}
