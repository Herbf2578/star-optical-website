import {readFile, writeFile, mkdir, cp, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = file => readFile(path.join(root, file), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const navigation = [['children-eye-care','兒童近視管理'],['adult-eyewear','成人配鏡'],['school-vision-screening','學校合作'],['contact','北角門市']];

export async function build({production = false, output = 'dist'} = {}) {
  // Only generated output directories inside this checkout may be cleared.
  const outputRoot = path.resolve(root, output);
  const allowed = outputRoot === path.join(root, 'dist') || outputRoot.startsWith(path.join(root, '.build') + path.sep);
  if (!allowed) throw new Error('Output must be dist or a child directory of .build');
  const site = JSON.parse(await read('src/site.json'));
  const pages = JSON.parse(await read('src/pages.json'));
  const routes = ['/', ...pages.map(page => '/' + page.slug + '/')];
  if (new Set(routes).size !== routes.length || pages.some(page => !/^[a-z0-9-]+$/.test(page.slug))) throw new Error('Invalid or duplicate route');
  const whatsapp = message => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
  const enquiry = whatsapp('你好，我想查詢兒童驗眼及預約安排。');
  const external = 'target="_blank" rel="noopener noreferrer"';
  const logo = '<img class="brand-logo" src="/assets/star-optical-logo.jpg" alt="明星眼鏡" width="1025" height="494">';
  const nav = (slug, mobile = false) => `<nav class="${mobile ? 'mobile-nav' : 'desktop-nav'}" aria-label="${mobile ? '手機主要導覽' : '主要導覽'}">${navigation.map(([route,label]) => `<a href="/${route}/"${route === slug ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
  const header = slug => `<header class="site-header"><a class="wordmark" href="/" aria-label="明星眼鏡首頁">${logo}</a>${nav(slug)}<a class="header-cta" href="${enquiry}" ${external}>WhatsApp 預約 <span aria-hidden="true">↗</span></a>${nav(slug,true)}</header>`;
  const footer = `<footer><a class="wordmark" href="/" aria-label="明星眼鏡首頁">${logo}</a><p>專業視光 · 用心守護</p><small>© ${new Date().getFullYear()} 明星眼鏡</small></footer><div class="mobile-contact" aria-label="快捷聯絡"><a href="tel:${site.phone}">致電門市</a><a href="${enquiry}" ${external}>WhatsApp 預約 <span aria-hidden="true">↗</span></a></div>`;
  function structured(page) {
    const url = site.origin + page.route;
    const graph = [
      {'@type':'LocalBusiness','@id':site.origin+'/#business',name:site.name,alternateName:site.alternateName,url:site.origin+'/',telephone:site.phone,image:site.origin+'/assets/star-optical-shop.jpg',logo:site.origin+'/assets/star-optical-logo.jpg',address:{'@type':'PostalAddress',streetAddress:site.streetAddress,addressLocality:site.locality,addressCountry:'HK'},contactPoint:{'@type':'ContactPoint',contactType:'customer service',telephone:'+'+site.whatsapp,url:'https://wa.me/'+site.whatsapp}},
      {'@type':'WebSite','@id':site.origin+'/#website',name:site.name,url:site.origin+'/',inLanguage:'zh-HK',publisher:{'@id':site.origin+'/#business'}},
      {'@type':'WebPage','@id':url+'#webpage',url,name:page.title,description:page.description,inLanguage:'zh-HK',isPartOf:{'@id':site.origin+'/#website'},about:{'@id':site.origin+'/#business'}}
    ];
    if (page.slug) graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'首頁',item:site.origin+'/'},{'@type':'ListItem',position:2,name:page.breadcrumbLabel,item:url}]});
    return {'@context':'https://schema.org','@graph':graph};
  }
  function shell(page, body, {notFound = false} = {}) {
    const canonical = site.origin + page.route;
    return `<!doctype html>
<html lang="zh-HK"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}">
<meta name="robots" content="${production && !notFound ? 'index,follow' : 'noindex,follow'}">
${notFound ? '' : `<link rel="canonical" href="${escape(canonical)}">`}
<meta name="theme-color" content="#153e35"><meta property="og:type" content="website"><meta property="og:locale" content="zh_HK"><meta property="og:site_name" content="${escape(site.name)}">
<meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${escape(canonical)}">
<meta property="og:image" content="${site.origin}/assets/star-optical-shop.jpg"><meta property="og:image:alt" content="明星眼鏡北角門市外觀"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/jpeg" href="/assets/star-optical-logo.jpg"><link rel="stylesheet" href="/style.css">
${notFound ? '' : `<script type="application/ld+json">${json(structured(page))}</script>`}
</head><body><a class="skip-link" href="#main">跳至主要內容</a>${production ? '' : '<div class="draft-bar">設計預覽 <span>原網站尚未更改</span></div>'}${header(page.slug)}${body}${footer}</body></html>`;
  }
  function detail(page) {
    const sections = page.sections.map((section,index) => `<section class="detail-section" id="section-${index+1}">
<h2>${escape(section.heading)}</h2>
${section.paragraphs.map(paragraph=>`<p>${escape(paragraph)}</p>`).join('')}
${section.items?.length ? `<ul>${section.items.map(item=>`<li>${escape(item)}</li>`).join('')}</ul>` : ''}
${section.links?.length ? `<div class="section-links">${section.links.map(link=>`<a class="text-link" href="${escape(link.href)}"${link.href.startsWith('https://') ? ' '+external : ''}>${escape(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>` : ''}
</section>`).join('');
    return `<main id="main"><section class="detail-hero section"><nav class="breadcrumbs" aria-label="麵包屑導覽"><a href="/">首頁</a><span aria-hidden="true">／</span><span aria-current="page">${escape(page.breadcrumbLabel)}</span></nav><p class="eyebrow">${escape(page.eyebrow)}</p><h1>${escape(page.heading)}</h1>${page.lead ? `<p class="detail-lead">${escape(page.lead)}</p>` : ''}<p class="detail-intro">${escape(page.intro)}</p><a class="button primary" href="${whatsapp(page.cta.message)}" ${external}>${escape(page.cta.label)} <span aria-hidden="true">↗</span></a></section>
<div class="detail-layout section"><div class="detail-content">${sections}${page.faqs.length ? `<section class="detail-section"><h2>常見問題</h2><div class="faq-list">${page.faqs.map(faq => `<details><summary>${escape(faq.question)}<span aria-hidden="true">+</span></summary><p>${escape(faq.answer)}</p></details>`).join('')}</div></section>` : ''}</div><aside class="detail-aside" aria-label="門市聯絡"><p class="eyebrow">STAR OPTICAL · NORTH POINT</p><h2>與我們聊聊。</h2><p>${escape(site.address)}</p><a class="aside-phone" href="tel:${site.phone}">${site.displayPhone}</a><a class="button primary" href="${whatsapp(page.cta.message)}" ${external}>WhatsApp 查詢 <span aria-hidden="true">↗</span></a><p class="aside-note">服務收費、營業及預約安排，以門市確認為準。</p><a class="text-link" href="/contact/">門市與預約資料 <span aria-hidden="true">↗</span></a></aside></div><section class="related section"><p class="eyebrow">EXPLORE MORE</p><h2>繼續了解明星眼鏡</h2><div>${navigation.filter(([slug])=>slug!==page.slug).map(([slug,label])=>`<a href="/${slug}/">${label}<span aria-hidden="true">↗</span></a>`).join('')}</div></section></main>`;
  }
  let home = (await read('src/home.html')).match(/<main id="main">([\s\S]*?)<\/main>/)?.[0];
  if (!home) throw new Error('Home template must contain main');
  home = home.replaceAll('./assets/','/assets/');
  home = home.replace('href="#care">了解服務','href="/children-eye-care/">了解服務');
  home = home.replace('<p class="care-note">','<p class="service-more"><a class="text-link" href="/children-eye-care/">了解兒童近視管理服務 <span aria-hidden="true">↗</span></a></p><p class="care-note">');
  home = home.replace('<div class="family-list">','<div class="family-list"><a href="/adult-eyewear/"><span><strong>成人配鏡服務總覽</strong><small>漸進鏡片、隱形眼鏡與鏡架選擇</small></span><span aria-hidden="true">↗</span></a>');
  home = home.replace(/href="https:\/\/wa\.me\/85256203542\?text=你好，我想查詢明眸童心護眼計劃及學校合作。" target="_blank" rel="noopener noreferrer"/,'href="/school-vision-screening/"');
  home = home.replace('<div class="visit-details">','<div class="visit-details"><a class="map-link" href="/contact/">門市及預約詳情 <span aria-hidden="true">↗</span></a>');
  home = home.replace('<section class="section care" id="care">','<section class="section care" id="care"><span id="services" class="anchor-alias"></span>');
  home = home.replace('<section class="family section" id="family">','<section class="family section" id="family"><span id="about" class="anchor-alias"></span><span id="brands" class="anchor-alias"></span>');
  home = home.replace('<section class="visit" id="visit">','<section class="visit" id="visit"><span id="contact" class="anchor-alias"></span>');
  const documents = [{slug:'',route:'/',title:site.title,description:site.description,heading:'明星眼鏡',body:home},...pages.map(page=>({...page,route:'/'+page.slug+'/',body:detail(page)}))];
  await rm(outputRoot,{recursive:true,force:true});
  await mkdir(outputRoot,{recursive:true});
  await cp(path.join(root,'src/assets'),path.join(outputRoot,'assets'),{recursive:true});
  await cp(path.join(root,'src/style.css'),path.join(outputRoot,'style.css'));
  // Preserve known original brand asset URLs used in existing references.
  for (const filename of ['star-optical-logo.jpg','star-optical-shop.jpg','favicon.svg']) await cp(path.join(root,'src/assets',filename),path.join(outputRoot,filename));
  // Keep original public image links working without adding them to new pages.
  await cp(path.join(root,'src/legacy-assets'),outputRoot,{recursive:true});
  for (const page of documents) {
    const folder=path.join(outputRoot,page.slug);
    await mkdir(folder,{recursive:true});
    await writeFile(path.join(folder,'index.html'),shell(page,page.body));
  }
  await writeFile(path.join(outputRoot,'404.html'),shell({route:'/404',title:'找不到頁面｜明星眼鏡',description:'返回明星眼鏡首頁，了解服務及預約安排。'},'<main id="main" class="section not-found"><p class="eyebrow">404</p><h1>暫時找不到這個頁面。</h1><p>你可以返回首頁，或直接聯絡門市查詢服務。</p><a class="button primary" href="/">返回首頁 ↗</a></main>',{notFound:true}));
  await writeFile(path.join(outputRoot,'robots.txt'),`User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n${production ? '\nSitemap: '+site.origin+'/sitemap.xml\n' : ''}`);
  await writeFile(path.join(outputRoot,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${production ? routes.map(route=>`<url><loc>${site.origin+route}</loc></url>`).join('') : ''}</urlset>\n`);
  return {outputRoot,production,routes};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const production = process.argv.includes('--preview') ? false : process.argv.includes('--production') || process.env.VERCEL_ENV === 'production';
  const result = await build({production});
  console.log(`Built ${result.routes.length} pages (${production ? 'production' : 'preview, noindex'}) in ${result.outputRoot}`);
}
