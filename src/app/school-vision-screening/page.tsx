import { CalendarDays, ClipboardCheck, Eye, FileCheck2, HeartHandshake, MapPin, School, ShieldCheck, UsersRound } from 'lucide-react';
import { LegacyAnchors, Benefits, Breadcrumb, CheckList, CTA, EditorialPhoto, FAQ, FeatureCard, Hero, Section, Steps, TextLink, WhatsAppLink } from '@/components/ui';
import { PageSectionNav } from '@/components/conversion';
import { pageMetadata } from '@/lib/seo';
import { schoolEnquiryTemplate } from '@/lib/site';

export const metadata = pageMetadata(
  '明眸童心護眼計劃｜中小學到校驗眼及近視篩查｜明星眼鏡',
  '明星眼鏡明眸童心護眼計劃，為中小學提供到校驗眼及學童近視篩查合作查詢。了解年級、人數、日期、場地與家長通知等需協調事項。',
  '/school-vision-screening/',
);

export default function SchoolPage() {
  return <>
    <Hero eyebrow="與學校同行 · 關注學童視力" title={<>明眸童心<br />護眼計劃</>} subtitle="中小學到校驗眼 · 學童近視篩查" description="把護眼關懷帶進校園。明星眼鏡以中小學合作為基礎，與學校討論到校驗眼及近視篩查安排，從學生需要與校園日程出發。" image="/images/vision-program-screening.jpg" imageAlt="原有網站刊載的護眼計劃活動照片，參與者接受眼鏡配戴協助" realImage type="school" secondaryHref="#school-cooperation" secondaryLabel="了解學校合作安排" />
    <Benefits items={[
      { icon: School, title: '中小學合作', text: '以現有校園服務為基礎' },
      { icon: Eye, title: '到校驗眼及篩查', text: '服務細節在活動前共同確認' },
      { icon: CalendarDays, title: '配合校園日程', text: '先討論年級、人數與日期' },
      { icon: HeartHandshake, title: '清楚協調安排', text: '共同確認通知與資料處理' },
    ]} />
    <Breadcrumb label="學校護眼計劃" path="/school-vision-screening/" />
    <PageSectionNav items={[{ href: '#school-cooperation', label: '合作內容' }, { href: '#school-preparation', label: '學校準備' }, { href: '#school-data', label: '通知與資料' }, { href: '#school-faq', label: '合作問題' }]} />

    <LegacyAnchors ids={['section-1']} /><Section id="school-cooperation" eyebrow="BRING EYE CARE TO SCHOOL" title="一個計劃，從了解學校需要開始" description="明眸童心護眼計劃的現有服務基礎，是為中小學提供到校驗眼及學童近視篩查。每次合作的內容及執行方式，需由雙方確認。">
      <div className="service-grid cols-3">
        <FeatureCard icon={Eye} title="到校驗眼" image="/images/vision-program-screening.jpg" imageAlt="原有護眼計劃活動中的配戴協助照片，不代表指定檢查項目" tag="原有活動照片">按學校實際情況討論到校服務。具體檢查項目、設備、時長及執行安排，須於活動前確認。</FeatureCard>
        <FeatureCard icon={UsersRound} title="學童近視篩查" image="/images/vision-program-school.jpg" imageAlt="原有網站刊載的明眸童心護眼計劃校園活動合照" tag="原有活動照片">以學童視力需要為討論起點。篩查範圍、參與條件及結果交代方式，由學校與門市協調。</FeatureCard>
        <FeatureCard icon={ClipboardCheck} title="合作安排協調" image="/images/vision-program-team.jpg" imageAlt="原有護眼計劃活動參與者合照，不推斷人物職銜或資格" tag="原有活動照片">先說明年級、人數、候選日期及場地，逐項確認家長通知、資料安排及校方支援需要。</FeatureCard>
      </div>
      <p className="note">本頁不代表承諾指定檢查項目、講座、書面報告、轉介、免費服務或其他額外項目；如有需要，請先提出並由雙方確認。</p>
    </Section>

    <Section tone="soft" eyebrow="A SIMPLE FIRST STEP" title="學校合作流程" description="以下為協調次序參考，實際服務及活動落實方式以雙方確認為準。">
      <Steps items={[
        { icon: HeartHandshake, title: '初步聯絡', text: '提供學校名稱、聯絡人及想了解的到校服務。' },
        { icon: CalendarDays, title: '確認需要', text: '討論參與年級、人數、候選日期及活動時間。' },
        { icon: MapPin, title: '協調細節', text: '確認場地、檢查內容、收費及家長通知等安排。' },
        { icon: School, title: '按確認安排執行', text: '依雙方落實的日程與分工安排到校活動。' },
        { icon: FileCheck2, title: '確認後續交代', text: '事先協議結果如何交代及查詢聯絡方式。' },
      ]} />
    </Section>

    <LegacyAnchors ids={['section-2']} /><Section id="school-preparation" eyebrow="BEFORE WE MEET" title="查詢前，準備這些資料就可以" description="初次查詢毋須提供學生名單或個別健康資料。先從整體活動需要談起。">
      <div className="school-preparation-layout">
        <div className="school-photo-mosaic"><EditorialPhoto src="/images/vision-program-school.jpg" alt="原有明眸童心護眼計劃校園活動照片" tag="原有活動照片" aspectRatio="16 / 11" sizes="(max-width: 767px) 90vw, 42vw" /><EditorialPhoto src="/images/vision-program-team.jpg" alt="原有護眼計劃活動參與者合照" tag="原有活動照片" aspectRatio="4 / 3" sizes="(max-width: 767px) 62vw, 28vw" /></div>
        <div className="service-grid cols-4 school-preparation-grid">
          <FeatureCard icon={School} title="學校與聯絡人">學校名稱、校方聯絡人及方便回覆的方式。</FeatureCard>
          <FeatureCard icon={UsersRound} title="年級與人數">希望參與的年級及預計人數，便於討論活動規模。</FeatureCard>
          <FeatureCard icon={CalendarDays} title="日期與時段">一至數個候選日期，以及可使用的活動時段。</FeatureCard>
          <FeatureCard icon={MapPin} title="場地與動線">可用場地、學生輪候空間及校方希望配合的安排。</FeatureCard>
        </div>
      </div>
      <div className="school-enquiry-actions"><WhatsAppLink type="school" message={schoolEnquiryTemplate}>查詢學校合作安排</WhatsAppLink><TextLink href="/contact/?service=school#enquiry">先整理合作查詢</TextLink><p>開啟預填行政查詢範本，填上方便提供的資料，再於 WhatsApp 自行發送。</p></div>
    </Section>

    <LegacyAnchors ids={['section-3']} /><Section id="school-data" tone="soft">
      <div className="service-split">
        <div><p className="eyebrow">PLAN WITH CLARITY</p><h2>家長通知與資料安排，<br />在活動前先說清楚。</h2><p className="service-lead">兒童資料需要妥善處理。合作前應讓校方、門市及家長清楚知道活動內容，以及學生資料會如何使用。</p><WhatsAppLink type="school" message={schoolEnquiryTemplate}>查詢學校合作安排</WhatsAppLink></div>
        <div className="info-panel"><h3><ShieldCheck size={25} aria-hidden="true" /> 建議雙方共同確認</h3><CheckList items={['家長通知與同意安排，由誰準備及發出', '活動需要哪些資料，以及各方的使用目的', '資料交收方式、可接觸人員及保留安排', '結果如何向家長交代、由誰回覆後續問題', '若需後續檢查或其他服務，如何另行確認']} /><p className="note">請勿把學生名單、身份證明或個別健康紀錄傳送至本網站公開查詢欄位。</p></div>
      </div>
    </Section>

    <Section id="school-faq" eyebrow="SCHOOLS ASK" title="學校合作常見問題">
      <FAQ items={[
        { question: '明眸童心護眼計劃主要服務哪些學校？', answer: '目前以中小學到校驗眼及學童近視篩查合作為服務基礎。其他機構或活動形式可先提出查詢，是否可安排需另行確認。' },
        { question: '有最低參與人數、指定年級或固定收費嗎？', answer: '本頁沒有已確認的最低人數、指定年級或價目。請提供預計年級、人數及活動需要，由門市與校方確認可行安排及報價。' },
        { question: '活動是否包括講座、報告或免費配鏡？', answer: '現有服務基礎為到校驗眼及近視篩查。本頁不承諾講座、書面報告、免費配鏡或其他額外項目；如校方有需要，應先提出，再確認是否可安排、內容及費用。' },
        { question: '學校需要預備甚麼場地？', answer: '請先說明可用空間、活動時段及預計人數。設備、場地要求、學生輪候與校方人手配合，需依確認的服務內容逐項協調，不能單憑本頁概覽決定。' },
        { question: '學生資料及家長同意如何處理？', answer: '活動前應由雙方確認通知、同意、所需資料、收集目的、交收與保留方式。初次網站或 WhatsApp 查詢毋須提交學生名單及個別健康紀錄。' },
        { question: '發出 WhatsApp 查詢後，活動就落實了嗎？', answer: '尚未。WhatsApp 只用於展開合作查詢。日期、內容、費用、場地、資料處理及各方分工等細節，均需另行確認後才算落實。' },
      ]} />
    </Section>
    <LegacyAnchors ids={['section-4']} /><CTA title="一起為學童，安排更清楚的下一步。" description="告訴我們學校的年級、人數與候選日期，開始合作對話。" type="school" />
  </>;
}
