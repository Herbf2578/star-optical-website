export const site = {
  brand: 'STAR OPTICAL 明星眼鏡',
  company: '明星眼鏡（香港）有限公司',
  origin: 'https://www.staropticalhk.com',
  phone: '+85225780013', displayPhone: '+852 2578 0013',
  whatsapp: '85256203542', displayWhatsapp: '+852 5620 3542',
  address: '香港北角英皇道278–288號英皇柏麗大道地下商場61號舖',
  streetAddress: '英皇道278–288號英皇柏麗大道地下商場61號舖',
  district: '北角',
  hours: '到訪前請先聯絡門市確認營業時間',
  socialProfiles: [
    { name: 'Facebook', url: 'https://www.facebook.com/275746115902220' },
    { name: 'Instagram', url: 'https://www.instagram.com/star_optical.hk/' },
  ],
};
export const navigation = [
  { href: '/', label: '首頁' },
  { href: '/children-eye-care/', label: '兒童近視管理' },
  { href: '/adult-eyewear/', label: '成人配鏡' },
  { href: '/school-vision-screening/', label: '學校護眼計劃' },
  { href: '/frames/', label: '品牌鏡架' },
  { href: '/contact/', label: '聯絡我們' },
] as const;
export const messages = {
  general: '你好，我想查詢明星眼鏡的服務及預約驗眼。',
  children: '你好，我想了解明星眼鏡兒童近視管理及預約驗眼。',
  adult: '你好，我想查詢成人驗眼及配鏡服務。',
  school: '你好，我想了解明眸童心護眼計劃的學校合作安排。',
  frames: '你好，我想查詢品牌鏡架及到店試戴安排。',
} as const;
export type EnquiryType = keyof typeof messages;
export const schoolEnquiryTemplate = `${messages.school}\n學校名稱：\n校方聯絡人：\n參與年級：\n預計人數：\n候選日期：\n可用場地：\n希望先了解活動內容、收費及家長通知與資料安排。`;
export const enquiryTopics = {
  'panda-star': '我想了解 Panda Star 自家品牌鏡架及到店試戴安排。',
  bragi: '我想了解佩極 BRAGi 面形掃描、3D 打印鏡架及到店查詢安排。',
} as const;
export type EnquiryTopic = keyof typeof enquiryTopics;
export function enquiryTypeFromParam(value: string | string[] | undefined): EnquiryType {
  return typeof value === 'string' && Object.hasOwn(messages, value) ? value as EnquiryType : 'children';
}
export function enquiryTopicFromParam(value: string | string[] | undefined): EnquiryTopic | undefined {
  return typeof value === 'string' && Object.hasOwn(enquiryTopics, value) ? value as EnquiryTopic : undefined;
}
export function enquiryPath(type: EnquiryType = 'general', topic?: EnquiryTopic) {
  return `/contact/?${new URLSearchParams({ service: type, ...(topic ? { topic } : {}) }).toString()}#enquiry`;
}
export const whatsappUrl = (type: EnquiryType = 'general', text?: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text ?? messages[type])}`;
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
export const pageEnquiry = (path: string): EnquiryType => path.startsWith('/children') ? 'children' : path.startsWith('/adult') ? 'adult' : path.startsWith('/school') ? 'school' : path.startsWith('/frames') ? 'frames' : 'general';
