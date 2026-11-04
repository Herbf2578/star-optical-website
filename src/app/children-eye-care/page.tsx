import Image from 'next/image';
import { CalendarCheck2, ClipboardCheck, Eye, Glasses, HeartHandshake, Moon, ScanEye, ShieldCheck, Sun, UsersRound } from 'lucide-react';
import { LegacyAnchors, Benefits, Breadcrumb, CheckList, CTA, EditorialPhoto, FAQ, FeatureCard, Hero, Section, Steps, WhatsAppLink } from '@/components/ui';
import { PageSectionNav } from '@/components/conversion';
import { pageMetadata } from '@/lib/seo';
import { messages } from '@/lib/site';

export const metadata = pageMetadata(
  '北角兒童近視管理｜OK鏡、MiSight、星趣控｜明星眼鏡',
  '了解明星眼鏡北角兒童近視管理：OK鏡、MiSight、星趣控及星趣控2.0鏡片。比較佩戴方式、專業評估及覆診安排，WhatsApp查詢兒童驗眼。',
  '/children-eye-care/',
);

const plans = [
  { number: '01', icon: Moon, tag: '夜間佩戴', image: '/images/editorial/ok-lens.png', imageAlt: '指尖上的隱形眼鏡 AI 示意圖片，非實際商品', title: 'OK 鏡', subtitle: '角膜矯形鏡片', description: '在專業驗配及指導下，於睡眠時佩戴的硬性隱形眼鏡方案。須評估眼睛狀況，以及孩子與家長能否配合日常護理。', points: ['夜間佩戴，按指示清潔及消毒', '需個人化驗配與覆診檢查', '日間視力情況須持續評估'] },
  { number: '02', icon: Sun, tag: '日間佩戴', image: '/images/editorial/daily-lens.png', imageAlt: '每日即棄隱形眼鏡的 AI 示意圖片，非 MiSight 品牌產品照片', title: 'MiSight', subtitle: '每日即棄隱形眼鏡', description: '日間佩戴的近視管理軟性隱形眼鏡選擇。需由專業人員評估適用情況，並學習正確配戴、除下及衛生習慣。', points: ['每日即棄，依指示更換', '評估佩戴技巧與生活安排', '按個別需要跟進眼睛狀況'] },
  { number: '03', icon: Glasses, tag: '框架眼鏡', image: '/images/editorial/children-frames.png', imageAlt: '兒童框架眼鏡的 AI 示意圖片，非星趣控品牌產品照片', title: '星趣控／星趣控 2.0', subtitle: 'Essilor 依視路眼鏡鏡片', description: '配合鏡架使用的近視管理鏡片選擇。應按驗眼結果、鏡架配合及日常佩戴需要，討論合適的鏡片及版本。', points: ['以框架眼鏡方式佩戴', '鏡架尺寸與配戴位置同樣重要', '版本、供應及報價向門市確認'] },
];

export default function ChildrenPage() {
  return <>
    <Hero eyebrow="守護孩子的清晰未來" title={<>兒童近視管理<br />讓成長，看得更遠</>} subtitle="專業評估 · 個人化方案 · 持續跟進" description="從了解孩子的視力與用眼習慣開始，一起比較近視管理選擇，找出適合家庭日常生活的安排。每一個方案，都先由專業評估出發。" image="/images/children-care.png" imageAlt="兒童接受眼睛檢查的 AI 服務示意圖片，並非真實個案" type="children" secondaryHref="#plans" secondaryLabel="認識三類管理方案" />
    <Benefits items={[
      { icon: ScanEye, title: '先了解，再選擇', text: '按眼睛狀況與檢查結果評估' },
      { icon: UsersRound, title: '配合家庭日常', text: '考慮孩子習慣及家長照顧安排' },
      { icon: CalendarCheck2, title: '持續覆診跟進', text: '留意視力變化及佩戴情況' },
      { icon: HeartHandshake, title: '把疑問問清楚', text: '討論護理、費用及跟進需要' },
    ]} />
    <Breadcrumb label="兒童近視管理" path="/children-eye-care/" />
    <PageSectionNav items={[{ href: '#plans', label: '管理方案' }, { href: '#comparison', label: '佩戴比較' }, { href: '#care-journey', label: '評估與跟進' }, { href: '#parents-faq', label: '家長問題' }]} />

    <Section eyebrow="UNDERSTAND FIRST" title="近視管理，是一段需要跟進的旅程" description="看清楚與管理近視進展，是需要一起考慮的事情。越了解孩子的需要，越能作出合適的選擇。">
      <div className="service-grid cols-3">
        <FeatureCard icon={Eye} title="了解視力變化">定期評估可幫助掌握孩子的視力及近視變化，單憑日常「看得清楚」不能代替檢查。</FeatureCard>
        <FeatureCard icon={ShieldCheck} title="建立合適管理方向">近視管理旨在減慢近視進展，並非消除近視。實際反應因人而異，沒有適合所有孩子的單一方案。</FeatureCard>
        <FeatureCard icon={HeartHandshake} title="讓日常安排可持續">選擇時也要考慮佩戴、護理、學習與活動習慣，並由孩子、家長與專業人員共同配合。</FeatureCard>
      </div>
    </Section>

    <LegacyAnchors ids={['section-1']} /><Section id="plans" tone="soft" eyebrow="MYOPIA MANAGEMENT" title="三類方案，從孩子的需要出發" description="以下為佩戴方式及生活安排的概覽，不作個別治療建議。是否適合、產品版本及實際安排，需由門市專業評估及確認。">
      <div className="service-grid cols-3">
        {plans.map(({ number, icon: Icon, tag, image, imageAlt, title, subtitle, description, points }) => <article className="plan-card" key={title}>
          <div className="plan-card-top plan-card-photo"><Image src={image} alt={imageAlt} fill sizes="(max-width: 767px) 100vw, (max-width: 1023px) 45vw, 33vw" className="object-cover" /><span className="plan-number">{number}</span><span className="plan-tag">{tag}</span><span className="photo-tag">AI 鏡片／鏡架示意</span></div>
          <div className="plan-card-content"><h3><Icon size={23} strokeWidth={1.6} aria-hidden="true" />{title}</h3><p className="plan-subtitle">{subtitle}</p><p>{description}</p><CheckList items={points} /><WhatsAppLink type="children" variant="outline" message={`${messages.children}\n我想了解的方案：${title}。`}>{number === '01' ? '查詢 OK 鏡評估' : number === '02' ? '查詢 MiSight' : '查詢星趣控'}</WhatsAppLink></div>
        </article>)}
      </div>
    </Section>

    <LegacyAnchors ids={['section-3']} /><Section id="comparison" eyebrow="A CLEAR COMPARISON" title="比較佩戴方式與日常安排" description="選擇不只看產品名稱，也看孩子與家庭能否配合。表格可左右滑動查看。">
      <div className="comparison-mobile-summary" aria-label="三類方案的佩戴與護理摘要">
        <article><h3>OK 鏡 · 夜間佩戴</h3><p>角膜矯形硬性隱形眼鏡，日常需按指示除戴、清潔、消毒及保存。</p></article>
        <article><h3>MiSight · 日間佩戴</h3><p>每日即棄軟性隱形眼鏡，需掌握正確除戴、洗手及每日更換習慣。</p></article>
        <article><h3>星趣控 · 框架眼鏡</h3><p>配合鏡架於日間佩戴，需留意正確佩戴位置、清潔及調校。</p></article>
      </div>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="近視管理方案比較表，可左右捲動">
        <table className="compare-table"><caption className="sr-only">OK鏡、MiSight及星趣控鏡片的日常安排比較</caption><thead><tr><th scope="col">比較項目</th><th scope="col">OK 鏡</th><th scope="col">MiSight</th><th scope="col">星趣控／星趣控 2.0</th></tr></thead><tbody>
          <tr><th scope="row">佩戴形式</th><td>角膜矯形硬性隱形眼鏡</td><td>每日即棄軟性隱形眼鏡</td><td>配合鏡架的眼鏡鏡片</td></tr>
          <tr><th scope="row">主要佩戴時間</th><td>夜間，依驗配指示</td><td>日間，依驗配指示</td><td>日間，依專業建議</td></tr>
          <tr><th scope="row">日常需要</th><td>除戴、清潔、消毒及保存</td><td>除戴、洗手及每日更換</td><td>正確佩戴、清潔與調校</td></tr>
          <tr><th scope="row">評估考慮</th><td>眼睛狀況、鏡片配合及護理能力</td><td>眼睛狀況、操作能力及生活安排</td><td>度數、鏡架配合及佩戴習慣</td></tr>
          <tr><th scope="row">後續安排</th><td colSpan={3}>三類方案均需按專業建議跟進；覆診頻次、費用及產品供應須另行確認。</td></tr>
        </tbody></table>
      </div>
      <p className="note">隱形眼鏡須按指示佩戴及護理。如佩戴時出現眼紅、疼痛或視力異常，應停止佩戴並盡快尋求專業評估。</p>
      <div className="decision-next"><div><h3>未決定方案？先由檢查開始。</h3><p>毋須先選好產品。可先查詢兒童驗眼及評估安排，再按孩子的情況討論選擇。</p></div><WhatsAppLink type="children" message={`${messages.children}\n我尚未選定方案，想先了解兒童驗眼及評估安排。`}>查詢兒童驗眼評估</WhatsAppLink></div>
    </Section>

    <LegacyAnchors ids={['section-2']} /><Section id="care-journey" tone="soft" eyebrow="YOUR CHILD’S JOURNEY" title="由首次評估，到每一步跟進">
      <Steps items={[
        { icon: UsersRound, image: '/images/editorial/consultation.png', imageAlt: '家長與孩子討論視力需要的 AI 服務示意圖片', tag: 'AI 服務示意', title: '初步了解', text: '先說明孩子目前的眼鏡使用、日常習慣，以及家長最想了解的問題。' },
        { icon: ScanEye, image: '/images/editorial/eye-exam.png', imageAlt: '眼睛檢查的 AI 服務示意圖片，非真實個案', tag: 'AI 服務示意', title: '眼睛檢查', text: '由門市按個別情況安排評估；實際檢查項目及是否需要其他檢查，預約時先確認。' },
        { icon: ClipboardCheck, image: '/images/children-care.png', imageAlt: '兒童視力評估的 AI 服務示意圖片', tag: 'AI 服務示意', title: '討論方案', text: '比較適用選擇、佩戴與護理要求，並問清產品、費用及跟進安排。' },
        { icon: CalendarCheck2, image: '/images/editorial/consultation.png', imageAlt: '親子與服務人員溝通的 AI 示意圖片，非真實員工或個案', tag: 'AI 服務示意', title: '覆診跟進', text: '按建議覆診，檢視視力及佩戴情況；有疑問時及早聯絡門市。' },
      ]} />
    </Section>

    <Section>
      <div className="service-split followup-photo-split">
        <div><EditorialPhoto src="/images/editorial/consultation.png" alt="家長與孩子一起了解服務的 AI 示意圖片，非真實個案" tag="AI 服務示意" className="followup-photo" aspectRatio="16 / 9" /><p className="eyebrow">CARE BEYOND THE FIRST VISIT</p><h2>不止配好眼鏡，<br />也關心之後的每一天。</h2><p className="service-lead">近視管理需要持續觀察。覆診讓家長有機會了解孩子的變化，也讓專業人員按情況檢視原有安排。</p><WhatsAppLink type="children">查詢兒童驗眼及覆診</WhatsAppLink></div>
        <div className="info-panel"><h3>預約前，家長可以先準備</h3><CheckList items={['現有眼鏡或隱形眼鏡的使用情況', '最近視力變化與日常用眼習慣', '對佩戴、護理及覆診安排的疑問', '如有以往驗眼紀錄，可先問門市是否需要帶同']} /><p className="note">請勿透過本網站公開查詢欄位傳送兒童詳細健康紀錄或身份證明文件。</p></div>
      </div>
    </Section>

    <Section id="parents-faq" tone="soft" eyebrow="PARENTS ASK" title="家長常見問題">
      <FAQ items={[
        { question: '孩子幾歲可以開始近視管理？', answer: '開始時間及可用方案需要按孩子的眼睛狀況、近視變化、操作能力和產品適用條件評估，不能單憑年齡決定。可先預約檢查，再討論合適方向。' },
        { question: 'OK 鏡、MiSight 和星趣控，哪一款最好？', answer: '沒有適合所有孩子的單一最佳方案。三類方案的佩戴、護理及生活安排不同，應按檢查結果、孩子習慣及家長配合能力作出選擇。' },
        { question: '近視管理可以完全消除近視嗎？', answer: '近視管理旨在減慢近視進展，並不等於治癒或消除近視。實際反應及跟進需要因人而異，不能保證指定效果。' },
        { question: '需要多久覆診一次？', answer: '覆診頻次視乎方案、眼睛狀況及佩戴情況而定。驗配時應問清首次跟進、之後覆診、異常情況的聯絡方式，以及相關費用。' },
        { question: '初次查詢需要提供孩子的病歷嗎？', answer: '初次 WhatsApp 查詢只需說明想了解兒童近視管理或預約驗眼，毋須提交詳細病歷。若需要相關資料，先向門市確認適當提供方式。' },
        { question: 'WhatsApp 查詢後是否已經預約成功？', answer: '尚未。WhatsApp 會開啟預填查詢訊息，您仍需自行發送，並由門市確認日期、時間及服務安排後，預約才算落實。' },
      ]} />
    </Section>
    <LegacyAnchors ids={['section-4']} /><CTA title="為孩子的視力，踏出了解的一步。" description="歡迎與北角門市討論兒童驗眼及近視管理需要。" type="children" />
  </>;
}
