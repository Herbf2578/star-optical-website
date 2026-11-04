import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://www.staropticalhk.com';
const applicationOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000').origin;
const phone = 'tel:+85225780013';
const whatsapp = '85256203542';
const messages = {
  general: '你好，我想查詢明星眼鏡的服務及預約驗眼。',
  children: '你好，我想了解明星眼鏡兒童近視管理及預約驗眼。',
  adult: '你好，我想查詢成人驗眼及配鏡服務。',
  school: '你好，我想了解明眸童心護眼計劃的學校合作安排。',
  frames: '你好，我想查詢品牌鏡架及到店試戴安排。',
};
const pages = [
  { name: 'home', route: '/', type: 'general' },
  { name: 'children', route: '/children-eye-care/', type: 'children' },
  { name: 'adult', route: '/adult-eyewear/', type: 'adult' },
  { name: 'school', route: '/school-vision-screening/', type: 'school' },
  { name: 'frames', route: '/frames/', type: 'frames' },
  { name: 'contact', route: '/contact/', type: 'general' },
] as const;
const screenshotDirectory = path.resolve(process.env.SCREENSHOT_DIR ?? 'docs/screenshots');

async function loadPage(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: 'networkidle' });
  expect(response?.status(), route).toBe(200);
  await expect(page.locator('main')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function loadImages(page: Page) {
  // Scroll each lazy image into view before judging or capturing it.
  for (const image of await page.locator('img').all()) {
    if (!(await image.isVisible())) continue;
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty('complete', true);
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth), await image.getAttribute('src') ?? 'image').toBeGreaterThan(0);
    const alt = await image.getAttribute('alt');
    expect(alt, 'Every image needs an alt attribute').not.toBeNull();
    if (!(await image.evaluate(element => element.matches('.brand img')))) {
      expect(alt, 'Every non-decorative photo needs useful alternative text').toBeTruthy();
    }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

function checkWhatsapp(href: string) {
  const url = new URL(href);
  expect(url.protocol).toBe('https:');
  expect(url.hostname).toBe('wa.me');
  expect(url.pathname).toBe(`/${whatsapp}`);
  const text = url.searchParams.get('text');
  expect(text).toBeTruthy();
  expect(href).toBe(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text!)}`);
  return text!;
}

test('all six routes have unique titles, descriptions and H1 headings', async ({ page }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const headings = new Set<string>();
  for (const item of pages) {
    await loadPage(page, item.route);
    await expect(page.locator('h1')).toHaveCount(1);
    titles.add(await page.title());
    descriptions.add(await page.locator('meta[name="description"]').getAttribute('content') ?? '');
    headings.add(await page.locator('h1').innerText());
  }
  expect(titles.size).toBe(6);
  expect(descriptions.size).toBe(6);
  expect(headings.size).toBe(6);
  expect([...descriptions].every(description => description.length > 25)).toBe(true);
});

for (const item of pages) {
  test(`${item.name}: metadata, business facts, semantic content and working links`, async ({ page, request }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await loadPage(page, item.route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-HK');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}${item.route}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${origin}${item.route}`);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'zh_HK');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', await page.title());
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.locator('h2').count()).toBeGreaterThan(2);
    await expect(page.locator('body')).toContainText('61號舖');
    await expect(page.locator('body')).not.toContainText('2568 1234');
    await expect(page.locator('body')).not.toContainText('info@staroptical.com.hk');
    await expect(page.locator('body')).not.toContainText('4.9/5');

    const json = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = json.map(content => JSON.parse(content));
    const business = parsed.find(schema => schema['@type'] === 'Optician');
    expect(business).toBeTruthy();
    expect(business.telephone).toBe('+85225780013');
    expect(business.address.streetAddress).toContain('278–288');
    expect(business.address.streetAddress).toContain('61號舖');
    expect(business.address.addressCountry).toBe('HK');
    expect(JSON.stringify(parsed)).not.toMatch(/aggregateRating|reviewRating|openingHours|ratingValue/);

    const pageMessage = messages[item.type];
    const headerLink = page.locator('.header-whatsapp');
    expect(checkWhatsapp((await headerLink.getAttribute('href'))!)).toBe(pageMessage);
    const mobileLink = page.locator('.mobile-cta a[href^="https://wa.me/"]');
    expect(checkWhatsapp((await mobileLink.getAttribute('href'))!)).toBe(pageMessage);
    const whatsappLinks = page.locator('a[href^="https://wa.me/"]');
    expect(await whatsappLinks.count()).toBeGreaterThan(2);
    for (const link of await whatsappLinks.all()) {
      checkWhatsapp((await link.getAttribute('href'))!);
      await expect(link).toHaveAttribute('target', '_blank');
      expect(await link.getAttribute('rel')).toContain('noopener');
    }
    const telephoneLinks = page.locator('a[href^="tel:"]');
    expect(await telephoneLinks.count()).toBeGreaterThan(0);
    for (const link of await telephoneLinks.all()) await expect(link).toHaveAttribute('href', phone);

    const links = await page.locator('a').evaluateAll(anchors => anchors.map(anchor => ({ href: anchor.getAttribute('href'), target: anchor.getAttribute('target'), rel: anchor.getAttribute('rel') })));
    for (const link of links) {
      expect(link.href, 'No placeholder or empty links').toBeTruthy();
      expect(link.href).not.toBe('#');
      if (link.href!.startsWith('#')) expect(await page.locator(`[id="${link.href!.slice(1)}"]`).count()).toBe(1);
      if (link.target === '_blank') expect(link.rel).toContain('noopener');
    }
    const localLinks = [...new Set(links.filter(link => link.href!.startsWith('/') && !link.href!.startsWith('//')).map(link => link.href!))];
    for (const href of localLinks) {
      const url = new URL(href, 'http://127.0.0.1:3000');
      const destination = await request.get(url.pathname);
      expect(destination.status(), `Internal link ${href}`).toBe(200);
      if (url.hash) expect(await destination.text(), `Destination anchor ${href}`).toContain(`id="${decodeURIComponent(url.hash.slice(1))}"`);
    }
    await loadImages(page);
    expect(errors).toEqual([]);
  });

  for (const screen of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }] as const) {
    test(`${item.name}: ${screen.name} screenshot and WCAG accessibility`, async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.setViewportSize({ width: screen.width, height: screen.height });
      await loadPage(page, item.route);
      await loadImages(page);
      await mkdir(screenshotDirectory, { recursive: true });
      const screenshotPath = path.join(screenshotDirectory, `${item.name}-${screen.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
      await testInfo.attach(`${item.name}-${screen.name}`, { path: screenshotPath, contentType: 'image/png' });
      const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      await testInfo.attach('accessibility-results', { body: JSON.stringify(accessibility, null, 2), contentType: 'application/json' });
      expect(accessibility.violations, JSON.stringify(accessibility.violations.map(violation => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map(node => node.target) })), null, 2)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  test(`${item.name}: no horizontal overflow at all five target widths`, async ({ page }) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await loadPage(page, item.route);
      const dimensions = await page.evaluate(() => ({ window: window.innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
      expect(dimensions.document, `${item.name} at ${width}px, document width`).toBeLessThanOrEqual(width + 1);
      expect(dimensions.body, `${item.name} at ${width}px, body width`).toBeLessThanOrEqual(width + 1);
    }
  });

  test(`${item.name}: FAQ opens with keyboard and closes again`, async ({ page }) => {
    await loadPage(page, item.route);
    const faq = page.locator('details.faq-item').first();
    expect(await page.locator('details.faq-item').count()).toBeGreaterThan(1);
    const summary = faq.locator('summary');
    await summary.focus();
    await summary.press('Enter');
    await expect(faq).toHaveAttribute('open', '');
    await expect(faq.locator('p')).toBeVisible();
    await summary.press('Enter');
    await expect(faq).not.toHaveAttribute('open', '');
  });
}

test('mobile menu supports Escape, focus return and all six navigation links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loadPage(page, '/');
  const menu = page.getByRole('button', { name: '開啟選單' });
  await menu.click();
  await expect(page.getByRole('navigation', { name: '手機導覽' })).toBeVisible();
  await expect(page.getByRole('button', { name: '關閉選單' })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(page.getByRole('navigation', { name: '手機導覽' })).toBeHidden();
  for (const item of pages) {
    await page.getByRole('button', { name: '開啟選單' }).click();
    const navigation = page.getByRole('navigation', { name: '手機導覽' });
    await navigation.locator(`a[href="${item.route}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${item.route.replaceAll('/', '\\/')}$`));
    await expect(navigation).toBeHidden();
    await expect(page.getByRole('button', { name: '開啟選單' })).toHaveAttribute('aria-expanded', 'false');
  }
});

test('frame filters change the visible catalogue and preserve precise enquiry links', async ({ page }) => {
  await loadPage(page, '/frames/');
  const cases = [
    { name: '全部款式', titles: ['經典方框', '輕盈金屬', '兒童鏡架', '時尚大框', '商務半框', '太陽眼鏡'] },
    { name: '男士', titles: ['經典方框', '輕盈金屬', '商務半框', '太陽眼鏡'] },
    { name: '女士', titles: ['經典方框', '輕盈金屬', '時尚大框', '太陽眼鏡'] },
    { name: '兒童', titles: ['兒童鏡架'] },
    { name: '輕量', titles: ['輕盈金屬', '商務半框'] },
    { name: '商務', titles: ['商務半框'] },
    { name: '太陽眼鏡', titles: ['太陽眼鏡'] },
  ];
  for (const item of cases) {
    const button = page.getByRole('group', { name: '按鏡架款式篩選' }).getByRole('button', { name: item.name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.catalog-status')).toHaveText(`${item.name} · ${item.titles.length} 類款式`);
    await expect(page.locator('.frame-card h3')).toHaveText(item.titles);
    for (const card of await page.locator('.frame-card').all()) {
      const title = await card.locator('h3').innerText();
      const href = (await card.getByRole('link', { name: '查詢類似款式' }).getAttribute('href'))!;
      expect(checkWhatsapp(href)).toBe(`${messages.frames}我對${title}款式有興趣，請問可以了解哪些選擇？`);
      await expect(card).toContainText('款式示意 · 非實際產品');
    }
  }
});

test('contact form validates, previews without sending, encodes text and keeps data out of storage', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await loadPage(page, '/contact/');
  const initialStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  const initialCookies = await context.cookies();
  const outbound: string[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (request.method() !== 'GET' || url.origin !== applicationOrigin) outbound.push(`${request.method()} ${request.url()}`);
  });
  const form = page.locator('form.enquiry-form');
  const submit = page.getByRole('button', { name: '生成 WhatsApp 查詢訊息' });
  const name = page.getByLabel('您的稱呼');
  const telephone = page.getByLabel('聯絡電話', { exact: false });
  const consent = page.getByRole('checkbox');
  await submit.click();
  expect(await name.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
  await expect(page.locator('.message-preview')).toHaveCount(0);
  await name.fill('測試家長');
  await telephone.fill('abc');
  await consent.check();
  await submit.click();
  expect(await telephone.evaluate((input: HTMLInputElement) => input.validity.patternMismatch)).toBe(true);
  await expect(page.locator('.message-preview')).toHaveCount(0);
  await telephone.fill('+852 12345678');
  await consent.uncheck();
  await submit.click();
  expect(await consent.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
  await expect(page.locator('.message-preview')).toHaveCount(0);
  await consent.check();
  const message = '想了解週六安排 & 費用？\n這是本地功能測試，請勿發送。';
  await page.getByLabel('查詢內容', { exact: false }).fill(message);
  await page.getByLabel('想了解的服務', { exact: false }).selectOption('school');
  await submit.click();
  const expected = `${messages.school}\n稱呼：測試家長\n聯絡電話：+852 12345678\n查詢內容：${message}`;
  await expect(page.getByRole('heading', { name: '訊息已整理，尚未發送' })).toBeVisible();
  await expect(page.locator('.message-preview pre')).toHaveText(expected);
  const sendLink = page.getByRole('link', { name: '透過 WhatsApp 發送查詢', exact: true });
  expect(checkWhatsapp((await sendLink.getAttribute('href'))!)).toBe(expected);
  await expect(page).toHaveURL(/\/contact\/$/);
  expect(context.pages().length).toBe(1);
  expect(outbound).toEqual([]);
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(initialStorage);
  expect(await context.cookies()).toEqual(initialCookies);
  // Changing the service must update the complete draft, including its first line.
  for (const service of ['children', 'adult', 'school', 'frames', 'general'] as const) {
    await page.getByLabel('想了解的服務', { exact: false }).selectOption(service);
    await submit.click();
    const serviceText = `${messages[service]}\n稱呼：測試家長\n聯絡電話：+852 12345678\n查詢內容：${message}`;
    expect(checkWhatsapp((await sendLink.getAttribute('href'))!)).toBe(serviceText);
  }
  await name.fill('另一位家長');
  await expect(page.locator('.message-preview')).toHaveCount(0);
  await page.reload();
  await expect(form.locator('[name="name"]')).toHaveValue('');
  await expect(form.locator('[name="message"]')).toHaveValue('');
  expect(errors).toEqual([]);
});

test('contact form rejects a name made entirely of spaces', async ({ page }) => {
  await loadPage(page, '/contact/');
  await page.getByLabel('您的稱呼').fill('   ');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: '生成 WhatsApp 查詢訊息' }).click();
  await expect(page.locator('.message-preview')).toHaveCount(0);
});

test('sitemap, robots and unknown routes have appropriate responses', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()['content-type']).toContain('xml');
  const xml = await sitemap.text();
  for (const item of pages) expect(xml).toContain(`<loc>${origin}${item.route}</loc>`);
  expect((xml.match(/<loc>/g) ?? []).length).toBe(6);
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  expect((await request.get('/this-route-does-not-exist/')).status()).toBe(404);
});

test('homepage offers three visible audience paths with matching service and WhatsApp destinations', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await loadPage(page, '/');
    const audience = page.getByRole('region', { name: '您想先了解哪一項服務？' });
    await expect(audience).toBeVisible();
    await expect(audience.locator('article')).toHaveCount(3);
    for (const item of [
      { type: 'children', route: '/children-eye-care/' },
      { type: 'adult', route: '/adult-eyewear/' },
      { type: 'school', route: '/school-vision-screening/' },
    ] as const) {
      const card = audience.locator(`[data-audience="${item.type}"]`);
      await expect(card).toBeVisible();
      await expect(card.getByRole('heading')).toBeVisible();
      await expect(card.locator(`a[href="${item.route}"]`)).toBeVisible();
      const enquiry = card.locator('a[href^="https://wa.me/"]');
      await expect(enquiry).toHaveCount(1);
      expect(checkWhatsapp((await enquiry.getAttribute('href'))!)).toBe(messages[item.type]);
    }
    const proof = page.getByRole('region', { name: '先認識我們的北角門市。' });
    await expect(proof).toBeVisible();
    await expect(proof.locator('img')).toHaveAttribute('alt', /真實門市/);
    await expect(proof).toContainText('61號舖');
    await expect(proof.locator('a[href^="tel:"]')).toHaveAttribute('href', phone);
    expect(await proof.evaluate(element => {
      const services = document.getElementById('services');
      return Boolean(services && (element.compareDocumentPosition(services) & Node.DOCUMENT_POSITION_FOLLOWING));
    })).toBe(true);
  }
});

test('every hero shows the verified North Point address and an exact map destination', async ({ page }) => {
  const address = '香港北角英皇道278–288號英皇柏麗大道地下商場61號舖';
  for (const item of pages) {
    await loadPage(page, item.route);
    const map = page.locator('.hero-visit a');
    await expect(map).toBeVisible();
    await expect(map).toContainText('北角');
    await expect(map).toContainText('61號舖');
    const url = new URL((await map.getAttribute('href'))!);
    expect(url.hostname).toBe('www.google.com');
    expect(url.pathname).toBe('/maps/search/');
    expect(url.searchParams.get('query')).toBe(address);
  }
});

test('shared call to action offers one WhatsApp action and a service-specific enquiry form route', async ({ page }) => {
  for (const item of pages) {
    await loadPage(page, item.route);
    const cta = page.locator('.cta-section');
    const type = item.name === 'home' ? 'children' : item.type;
    await expect(cta.locator('.button-row a')).toHaveCount(2);
    const whatsappAction = cta.locator('a[href^="https://wa.me/"]');
    await expect(whatsappAction).toHaveCount(1);
    expect(checkWhatsapp((await whatsappAction.getAttribute('href'))!).startsWith(messages[type])).toBe(true);
    const formAction = cta.getByRole('link', { name: '先整理查詢內容' });
    await expect(formAction).toBeVisible();
    const href = new URL((await formAction.getAttribute('href'))!, 'http://127.0.0.1:3000');
    expect(href.pathname).toBe('/contact/');
    expect(href.searchParams.get('service')).toBe(type);
    expect(href.hash).toBe('#enquiry');
  }
});

test('known contact service parameters select the intended enquiry without inventing a message', async ({ page }) => {
  for (const type of ['children', 'adult', 'school', 'frames', 'general'] as const) {
    await loadPage(page, `/contact/?service=${type}#enquiry`);
    await expect(page.getByLabel('想了解的服務', { exact: false })).toHaveValue(type);
    await expect(page.getByLabel('查詢內容', { exact: false })).toHaveValue('');
    await expect(page.locator('.message-preview')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}/contact/`);
  }
});

test('contact parameters reject unknown or duplicate values without echoing arbitrary topic content', async ({ page }) => {
  const marker = 'UNTRUSTED_TOPIC_031';
  const cases = [
    { query: '', service: 'children' },
    { query: `service=${marker}&topic=${marker}`, service: 'children' },
    { query: 'service=adult&service=frames&topic=panda-star', service: 'children' },
    { query: 'service=toString', service: 'children' },
    { query: 'service=__proto__', service: 'children' },
    { query: `service=frames&topic=${marker}`, service: 'frames' },
    { query: 'service=frames&topic=panda-star&topic=bragi', service: 'frames' },
    { query: 'service=frames&topic=constructor', service: 'frames' },
    { query: 'service=children&topic=panda-star', service: 'children' },
    { query: 'service=adult&topic=bragi', service: 'adult' },
  ];
  for (const item of cases) {
    await loadPage(page, `/contact/${item.query ? `?${item.query}` : ''}#enquiry`);
    await expect(page.getByLabel('想了解的服務', { exact: false })).toHaveValue(item.service);
    await expect(page.getByLabel('查詢內容', { exact: false })).toHaveValue('');
    await expect(page.locator('body')).not.toContainText(marker);
    for (const link of await page.locator('a[href^="https://wa.me/"]').all()) {
      expect(checkWhatsapp((await link.getAttribute('href'))!)).not.toContain(marker);
    }
  }
});

test('Panda Star enquiry carries the frame service and its safe topic into the form and preview', async ({ page, context }) => {
  await loadPage(page, '/frames/');
  const link = page.getByRole('link', { name: '查詢 Panda Star 款式', exact: true });
  const href = new URL((await link.getAttribute('href'))!, 'http://127.0.0.1:3000');
  expect(href.pathname).toBe('/contact/');
  expect(href.searchParams.get('service')).toBe('frames');
  expect(href.searchParams.get('topic')).toBe('panda-star');
  expect(href.hash).toBe('#enquiry');
  await link.click();
  await expect(page).toHaveURL(/\/contact\/\?service=frames&topic=panda-star#enquiry$/);
  await expect(page.getByLabel('想了解的服務', { exact: false })).toHaveValue('frames');
  const topic = '我想了解 Panda Star 自家品牌鏡架及到店試戴安排。';
  await expect(page.getByLabel('查詢內容', { exact: false })).toHaveValue(topic);
  await page.getByLabel('您的稱呼').fill('測試客人');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: '生成 WhatsApp 查詢訊息' }).click();
  expect(checkWhatsapp((await page.getByRole('link', { name: '透過 WhatsApp 發送查詢', exact: true }).getAttribute('href'))!)).toBe(`${messages.frames}\n稱呼：測試客人\n查詢內容：${topic}`);
  expect(context.pages()).toHaveLength(1);
});

test('BRAGi topic is whitelisted and shown only as an editable frame enquiry draft', async ({ page }) => {
  await loadPage(page, '/frames/');
  const link = page.getByRole('link', { name: '整理 BRAGi 查詢', exact: true });
  const href = new URL((await link.getAttribute('href'))!, 'http://127.0.0.1:3000');
  expect(href.pathname).toBe('/contact/');
  expect(href.searchParams.get('service')).toBe('frames');
  expect(href.searchParams.get('topic')).toBe('bragi');
  expect(href.hash).toBe('#enquiry');
  await link.click();
  await expect(page).toHaveURL(/\/contact\/\?service=frames&topic=bragi#enquiry$/);
  await expect(page.getByLabel('想了解的服務', { exact: false })).toHaveValue('frames');
  await expect(page.getByLabel('查詢內容', { exact: false })).toHaveValue('我想了解佩極 BRAGi 面形掃描、3D 打印鏡架及到店查詢安排。');
  await expect(page.getByLabel('查詢內容', { exact: false })).toBeEditable();
  await expect(page.locator('.message-preview')).toHaveCount(0);
});

test('form explains three steps and moves focus to the unsent preview without opening or storing a submission', async ({ page, context }) => {
  await loadPage(page, '/contact/?service=adult#enquiry');
  const steps = page.getByRole('list', { name: 'WhatsApp 查詢步驟' });
  await expect(steps).toBeVisible();
  await expect(steps.getByRole('listitem')).toHaveCount(3);
  for (const [index, label] of ['填寫查詢', '預覽內容', '開啟 WhatsApp 發送'].entries()) {
    await expect(steps.getByRole('listitem').nth(index)).toContainText(label);
  }
  const storage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  const outbound: string[] = [];
  page.on('request', request => {
    if (request.method() !== 'GET' || new URL(request.url()).origin !== applicationOrigin) outbound.push(request.url());
  });
  await page.getByLabel('您的稱呼').fill('測試稱呼');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: '生成 WhatsApp 查詢訊息' }).click();
  const preview = page.locator('.message-preview');
  await expect(preview).toBeVisible();
  await expect(preview.getByRole('heading', { name: '訊息已整理，尚未發送' })).toBeFocused();
  await expect(preview).toContainText('訊息已整理，尚未發送');
  expect(checkWhatsapp((await preview.getByRole('link', { name: '透過 WhatsApp 發送查詢', exact: true }).getAttribute('href'))!)).toBe(`${messages.adult}\n稱呼：測試稱呼`);
  expect(outbound).toEqual([]);
  expect(context.pages()).toHaveLength(1);
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(storage);
});

test('each child-management plan asks about that exact plan instead of losing the choice', async ({ page }) => {
  await loadPage(page, '/children-eye-care/');
  const cards = page.locator('.plan-card');
  await expect(cards).toHaveCount(3);
  const plans = ['OK 鏡', 'MiSight', '星趣控／星趣控 2.0'];
  for (const [index, title] of plans.entries()) {
    const card = cards.nth(index);
    await expect(card.locator('h3')).toHaveText(title);
    const link = card.locator('a[href^="https://wa.me/"]');
    await expect(link).toHaveCount(1);
    expect(checkWhatsapp((await link.getAttribute('href'))!)).toBe(`${messages.children}\n我想了解的方案：${title}。`);
  }
});

test('mobile child comparison offers three readable summaries before the detailed table', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loadPage(page, '/children-eye-care/');
  const summary = page.locator('.comparison-mobile-summary');
  await expect(summary).toBeVisible();
  await expect(summary.locator('article')).toHaveCount(3);
  await expect(summary.locator('h3')).toHaveText(['OK 鏡 · 夜間佩戴', 'MiSight · 日間佩戴', '星趣控 · 框架眼鏡']);
  await expect(summary.locator('article').nth(0)).toContainText('清潔');
  await expect(summary.locator('article').nth(1)).toContainText('每日更換');
  await expect(summary.locator('article').nth(2)).toContainText('佩戴位置');
});

test('service-page quick navigation has real targets and works with the keyboard', async ({ page }) => {
  for (const route of ['/children-eye-care/', '/adult-eyewear/', '/school-vision-screening/', '/frames/']) {
    await loadPage(page, route);
    const navigation = page.getByRole('navigation', { name: '本頁內容' });
    await expect(navigation).toBeVisible();
    const links = navigation.getByRole('link');
    expect(await links.count()).toBeGreaterThanOrEqual(3);
    for (const link of await links.all()) {
      const href = (await link.getAttribute('href'))!;
      expect(href).toMatch(/^#[a-z][a-z0-9-]+$/);
      await expect(page.locator(`[id="${href.slice(1)}"]`)).toHaveCount(1);
    }
    const first = links.first();
    const hash = (await first.getAttribute('href'))!;
    await first.focus();
    await first.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    await expect(page.locator(`[id="${hash.slice(1)}"]`)).toBeInViewport();
  }
});

test('school enquiry template requests school administration details and no student records', async ({ page }) => {
  await loadPage(page, '/school-vision-screening/');
  const expected = `${messages.school}\n學校名稱：\n校方聯絡人：\n參與年級：\n預計人數：\n候選日期：\n可用場地：\n希望先了解活動內容、收費及家長通知與資料安排。`;
  const drafts = [];
  for (const link of await page.locator('main a[href^="https://wa.me/"]').all()) {
    const draft = checkWhatsapp((await link.getAttribute('href'))!);
    if (draft.includes('學校名稱：')) drafts.push(draft);
  }
  expect(drafts.length).toBeGreaterThanOrEqual(2);
  for (const draft of drafts) {
    expect(draft).toBe(expected);
    expect(draft).not.toMatch(/學生姓名[:：]|兒童姓名[:：]|身份證[:：]|病歷[:：]|健康紀錄[:：]|度數[:：]/);
  }
  expect(checkWhatsapp((await page.locator('.hero .button-gold').getAttribute('href'))!)).toBe(expected);
});
