/**
 * Read-only release verification. Never deploys or changes protection settings.
 *
 * node scripts/audit-production.mjs --base http://127.0.0.1:3000 --mode preview
 * node scripts/audit-production.mjs --base https://exact-deployment.vercel.app --mode production \
 *   --transport vercel --vercel-cli /absolute/path/to/vercel/dist/vc.js
 *
 * --browser optionally verifies the WhatsApp message-preview flow without sending.
 * Protected browser access can use origin-scoped AUDIT_AUTH_HEADERS_JSON, or
 * --headers-stdin with one JSON object containing request headers. Values remain
 * in memory; they are never included in reports or sent to another origin.
 * --output FILE explicitly saves a redacted JSON report; default is stdout only.
 */
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const runFile = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = {};
for (let index = 2; index < process.argv.length; index++) {
  const item = process.argv[index];
  assert.ok(item.startsWith('--'), 'Use named --options.');
  const [key, inline] = item.slice(2).split(/=(.*)/s, 2);
  args[key] = inline ?? (['browser', 'headers-stdin', 'help'].includes(key) ? true : process.argv[++index]);
}
if (args.help) {
  console.log('Usage: node scripts/audit-production.mjs --base URL --mode production|preview [--transport fetch|vercel] [--vercel-cli /path/vc.js] [--browser] [--headers-stdin] [--output report.json] [--asset-root /path/public]');
  console.log('Credentials: AUDIT_AUTH_HEADERS_JSON or --headers-stdin. Vercel transport uses existing CLI authentication; no token is printed.');
  process.exit(0);
}

const base = new URL(args.base ?? process.env.AUDIT_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000');
assert.ok(['http:', 'https:'].includes(base.protocol), 'Base must be HTTP(S).');
assert.ok(!base.username && !base.password && !base.search && !base.hash && base.pathname === '/', 'Base must be an origin without credentials, query, hash or path.');
const mode = args.mode ?? process.env.AUDIT_MODE ?? 'production';
assert.ok(['production', 'preview'].includes(mode), 'Mode must be production or preview.');
const transport = args.transport ?? process.env.AUDIT_TRANSPORT ?? 'fetch';
assert.ok(['fetch', 'vercel'].includes(transport), 'Transport must be fetch or vercel.');
const publicRoot = path.resolve(args['asset-root'] ?? path.join(projectRoot, 'public'));
const canonicalOrigin = 'https://www.staropticalhk.com';
const routes = ['/', '/children-eye-care/', '/adult-eyewear/', '/school-vision-screening/', '/frames/', '/contact/'];
const messages = {
  general: '你好，我想查詢明星眼鏡的服務及預約驗眼。',
  children: '你好，我想了解明星眼鏡兒童近視管理及預約驗眼。',
  adult: '你好，我想查詢成人驗眼及配鏡服務。',
  school: '你好，我想了解明眸童心護眼計劃的學校合作安排。',
  frames: '你好，我想查詢品牌鏡架及到店試戴安排。',
};
const pageTypes = ['general', 'children', 'adult', 'school', 'frames', 'general'];
let headerInput = process.env.AUDIT_AUTH_HEADERS_JSON ?? '{}';
if (args['headers-stdin']) {
  headerInput = '';
  for await (const chunk of process.stdin) headerInput += chunk.toString();
}
let authHeaders;
try { authHeaders = JSON.parse(headerInput); } catch { throw new Error('Authentication headers must be a JSON object; their contents were not logged.'); }
assert.ok(authHeaders && !Array.isArray(authHeaders) && typeof authHeaders === 'object', 'Authentication headers must be a JSON object.');
for (const [key, value] of Object.entries(authHeaders)) {
  assert.ok(/^[a-z0-9-]+$/i.test(key) && typeof value === 'string' && !/[\r\n]/.test(value), 'Invalid authentication header name or value.');
  assert.ok(!['host', 'connection', 'content-length'].includes(key.toLowerCase()), 'Transport headers cannot be overridden.');
}
headerInput = undefined;
const redact = value => Object.values(authHeaders).filter(Boolean).reduce((text, secret) => text.split(secret).join('[redacted]'), String(value));
const results = [];
const cache = new Map();
const htmlPages = new Map();
const optimizedImageReferences = new Set();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function decode(value = '') { return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number))); }
function attributes(tag) {
  const output = {};
  for (const match of tag.replace(/^<\/?[^\s>]+/, '').matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) output[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  return output;
}
function tags(html, name) { return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match => attributes(match[0])); }
function meta(html, name) { return tags(html, 'meta').find(tag => tag.name === name || tag.property === name)?.content; }
function link(html, rel) { return tags(html, 'link').find(tag => tag.rel === rel)?.href; }
function textOf(html, name) { return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'gi'))].map(match => decode(match[1].replace(/<[^>]*>/g, '')).trim()); }

async function request(relative, accept = '') {
  const url = new URL(relative, base);
  assert.equal(url.origin, base.origin, 'Audit requests must remain on the exact configured origin.');
  const cacheKey = `${url.href}|${accept}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  let response;
  if (transport === 'fetch') {
    const fetched = await fetch(url, { redirect: 'manual', headers: { ...authHeaders, ...(accept ? { accept } : {}) }, signal: AbortSignal.timeout(45_000) });
    response = { status: fetched.status, headers: fetched.headers, bytes: Buffer.from(await fetched.arrayBuffer()) };
  } else {
    const cli = args['vercel-cli'] ?? process.env.AUDIT_VERCEL_CLI;
    assert.ok(cli && existsSync(cli) && /\.[cm]?js$/i.test(cli), 'Vercel transport requires --vercel-cli pointing to an installed vc.js entry point.');
    assert.equal(Object.keys(authHeaders).length, 0, 'Vercel HTTP transport uses CLI authentication; use a separate fetch/browser run for origin-scoped headers.');
    const curlArgs = ['curl', url.href, '--', '--silent', '--show-error', '--include', '--max-time', '45', '--max-redirs', '0'];
    if (accept) curlArgs.push('--header', `Accept: ${accept}`);
    let stdout;
    try { ({ stdout } = await runFile(process.execPath, [cli, ...curlArgs], { cwd: projectRoot, encoding: 'buffer', maxBuffer: 30 * 1024 * 1024, timeout: 75_000, windowsHide: true })); }
    catch { throw new Error('Authenticated vercel curl failed. Check the existing CLI identity, exact project and deployment access; protection was not changed.'); }
    // Curl can include a proxy CONNECT or informational header before the origin response.
    let remaining = stdout;
    let parsed;
    while (true) {
      const first = remaining.subarray(0, 512).toString('latin1').search(/HTTP\/\d(?:\.\d)? \d{3}/);
      assert.ok(first >= 0, 'Vercel curl did not return parseable HTTP headers.');
      remaining = remaining.subarray(first);
      const boundary = remaining.indexOf('\r\n\r\n');
      assert.ok(boundary >= 0, 'Vercel curl returned incomplete HTTP headers.');
      const lines = remaining.subarray(0, boundary).toString('latin1').split('\r\n');
      const headers = new Headers();
      for (const line of lines.slice(1)) { const at = line.indexOf(':'); if (at > 0) headers.append(line.slice(0, at).trim(), line.slice(at + 1).trim()); }
      parsed = { status: Number(lines[0].match(/\s(\d{3})\b/)[1]), headers, bytes: remaining.subarray(boundary + 4) };
      remaining = parsed.bytes;
      if (!/^HTTP\/\d/.test(remaining.subarray(0, 12).toString('latin1'))) break;
    }
    response = parsed;
  }
  if ([401, 403].includes(response.status)) throw new Error(`Access denied (${response.status}). Use existing authenticated vercel curl or accepted origin-scoped credentials; do not weaken protection.`);
  response.text = response.bytes.toString('utf8');
  cache.set(cacheKey, response);
  return response;
}

async function check(name, fn) {
  try { const details = await fn(); results.push({ name, passed: true, ...(details ? { details } : {}) }); }
  catch (error) { results.push({ name, passed: false, error: redact(error.message).slice(0, 700) }); }
}
function assertWhatsApp(href) {
  const url = new URL(href);
  assert.equal(url.origin, 'https://wa.me', 'WhatsApp origin mismatch.');
  assert.equal(url.pathname, '/85256203542', 'WhatsApp number mismatch.');
  const message = url.searchParams.get('text');
  assert.ok(message && Object.values(messages).some(baseMessage => message.startsWith(baseMessage)), 'WhatsApp text must use a confirmed service message.');
  assert.equal(href, `https://wa.me/85256203542?text=${encodeURIComponent(message)}`, 'WhatsApp message encoding mismatch.');
  return message;
}

// Stop early if the target is an authentication page or another site's redirect.
let root;
try {
  root = await request('/');
  assert.equal(root.status, 200, 'The configured origin must serve the site directly, without a login or alias redirect.');
  assert.ok(textOf(root.text, 'title').some(title => /明星眼鏡/.test(title)), 'The target did not serve the Star Optical application; check deployment protection and target URL.');
} catch (error) {
  console.error(redact(error.message));
  process.exitCode = 1;
}

if (!process.exitCode) {
  for (const [index, route] of routes.entries()) await check(`page ${route}`, async () => {
    const response = route === '/' ? root : await request(route);
    assert.equal(response.status, 200, 'Page must return HTTP 200.');
    assert.match(response.headers.get('content-type') ?? '', /text\/html/, 'Page must return HTML.');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    const robotHeader = response.headers.get('x-robots-tag') ?? '';
    const robotMeta = meta(response.text, 'robots') ?? '';
    if (mode === 'production') { assert.doesNotMatch(robotHeader, /noindex|nofollow|none/i); assert.match(robotMeta, /\bindex\b/); assert.doesNotMatch(robotMeta, /noindex|nofollow|none/i); }
    else { assert.match(robotHeader, /noindex/i); assert.match(robotMeta, /noindex/i); }
    assert.equal(link(response.text, 'canonical'), `${canonicalOrigin}${route}`);
    assert.equal(meta(response.text, 'og:url'), `${canonicalOrigin}${route}`);
    assert.equal(meta(response.text, 'og:locale'), 'zh_HK');
    const title = textOf(response.text, 'title');
    assert.equal(title.length, 1); assert.ok(title[0].includes('明星眼鏡'));
    assert.ok((meta(response.text, 'description') ?? '').length > 25);
    assert.equal(textOf(response.text, 'h1').length, 1);
    assert.match(response.text, /<html[^>]*lang="zh-HK"/);
    const schemas = [...response.text.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    const business = schemas.find(schema => schema['@type'] === 'Optician');
    assert.ok(business, 'Accurate local-business structured data is required.');
    assert.equal(business.telephone, '+85225780013');
    assert.match(business.address.streetAddress, /278[–-]288/); assert.match(business.address.streetAddress, /61號舖/);
    const socialProfiles = ['https://www.facebook.com/275746115902220', 'https://www.instagram.com/star_optical.hk/'];
    assert.deepEqual([...(business.sameAs ?? [])].sort(), [...socialProfiles].sort(), 'Business sameAs must contain only the two confirmed official profiles.');
    assert.equal(business.contactPoint?.telephone, '+85256203542');
    assert.equal(business.contactPoint?.url, 'https://wa.me/85256203542');
    assert.doesNotMatch(JSON.stringify(schemas), /aggregateRating|reviewRating|openingHours|ratingValue/);
    const anchors = tags(response.text, 'a');
    const footer = response.text.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)?.[1] ?? '';
    for (const profile of socialProfiles) assert.ok(tags(footer, 'a').some(anchor => anchor.href === profile), 'Official social profile link is missing from the footer.');
    const ids = tags(response.text, '[a-z][a-z0-9:-]*').map(tag => tag.id).filter(Boolean);
    for (const anchor of anchors.filter(anchor => anchor.href?.startsWith('#'))) assert.equal(ids.filter(id => id === decodeURIComponent(anchor.href.slice(1))).length, 1, 'On-page anchor must have exactly one destination.');
    const whatsapps = anchors.filter(anchor => anchor.href?.startsWith('https://wa.me/'));
    assert.ok(whatsapps.length >= 3);
    for (const anchor of whatsapps) { assertWhatsApp(anchor.href); assert.equal(anchor.target, '_blank'); assert.match(anchor.rel ?? '', /noopener/); }
    const header = anchors.find(anchor => anchor.class?.split(' ').includes('header-whatsapp'));
    assert.ok(header, 'Header WhatsApp action is required.');
    assert.equal(assertWhatsApp(header.href), messages[pageTypes[index]]);
    const phones = anchors.filter(anchor => anchor.href?.startsWith('tel:'));
    assert.ok(phones.length > 0); for (const anchor of phones) assert.equal(anchor.href, 'tel:+85225780013');
    for (const image of tags(response.text, 'img')) {
      assert.ok(Object.hasOwn(image, 'alt'), 'Every rendered image needs an alt attribute.');
      if (image.src && /^\/_next\/image\/?$/.test(new URL(image.src, base).pathname)) {
        optimizedImageReferences.add(image.src);
        const original = new URL(image.src, base).searchParams.get('url');
        assert.ok(original?.startsWith('/') && !original.startsWith('//'), 'Image optimization must use a local source.');
        const imageFile = path.resolve(publicRoot, `.${original}`);
        assert.ok(imageFile.startsWith(`${publicRoot}${path.sep}`) && existsSync(imageFile), 'Rendered image source is missing from this release.');
      }
    }
    htmlPages.set(route, response.text);
    return { status: 200, indexingMode: mode, canonical: `${canonicalOrigin}${route}`, whatsappCount: whatsapps.length, phoneCount: phones.length };
  });

  await check('unique page metadata and internal destinations', async () => {
    assert.equal(htmlPages.size, 6, 'All six page checks must pass first.');
    for (const get of [html => textOf(html, 'title')[0], html => meta(html, 'description'), html => textOf(html, 'h1')[0]]) assert.equal(new Set([...htmlPages.values()].map(get)).size, 6);
    const destinations = new Set([...htmlPages.values()].flatMap(html => tags(html, 'a').map(anchor => anchor.href).filter(href => href?.startsWith('/') && !href.startsWith('//'))));
    for (const href of destinations) {
      const target = new URL(href, base);
      const response = await request(`${target.pathname}${target.search}`);
      assert.equal(response.status, 200, 'Internal destination must return HTTP 200.');
      if (target.hash) assert.ok(tags(response.text, '[a-z][a-z0-9:-]*').some(tag => tag.id === decodeURIComponent(target.hash.slice(1))), 'Cross-page anchor destination is missing.');
    }
    return { uniqueTitles: 6, uniqueDescriptions: 6, uniqueH1: 6, internalDestinations: destinations.size };
  });

  await check('retained homepage and service section anchors', async () => {
    const homeIds = tags(htmlPages.get('/') ?? '', '[a-z][a-z0-9:-]*').map(tag => tag.id).filter(Boolean);
    const aliases = ['main', 'top', 'care', 'approach', 'family', 'questions', 'visit', 'about', 'brands', 'contact'];
    for (const alias of aliases) assert.equal(homeIds.filter(id => id === alias).length, 1, `Retained homepage anchor #${alias} must have one destination.`);
    const detailedRoutes = ['/children-eye-care/', '/adult-eyewear/', '/school-vision-screening/', '/contact/'];
    for (const route of detailedRoutes) {
      const ids = tags(htmlPages.get(route) ?? '', '[a-z][a-z0-9:-]*').map(tag => tag.id).filter(Boolean);
      for (let section = 1; section <= 4; section++) assert.equal(ids.filter(id => id === `section-${section}`).length, 1, `Retained anchor ${route}#section-${section} is missing or duplicated.`);
    }
    return { homepageAliases: aliases.length, legacyDetailedPageAnchors: detailedRoutes.length * 4 };
  });

  await check('robots, sitemap and unknown-page behavior', async () => {
    const robots = await request('/robots.txt'); assert.equal(robots.status, 200);
    if (mode === 'production') { assert.match(robots.text, /^Allow: \/\s*$/m); assert.doesNotMatch(robots.text, /^Disallow: \/\s*$/m); }
    else assert.match(robots.text, /^Disallow: \/\s*$/m);
    assert.ok(robots.text.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
    const sitemap = await request('/sitemap.xml'); assert.equal(sitemap.status, 200);
    const locations = [...sitemap.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
    assert.deepEqual([...locations].sort(), routes.map(route => `${canonicalOrigin}${route}`).sort());
    const missing = await request('/__release-audit-not-a-page/'); assert.equal(missing.status, 404);
    assert.ok(tags(missing.text, 'meta').some(tag => tag.name === 'robots' && /noindex/i.test(tag.content ?? '')), 'Unknown page needs a noindex robots instruction.');
    return { robotsMode: mode, sitemapPages: 6, missingPageStatus: 404 };
  });

  for (const route of routes) await check(`query-preserving permanent redirect ${route}index.html`, async () => {
    const query = '?service=school&topic=bragi&utm_source=release-audit&return=%2Fcontact%2F%3Fservice%3Dschool';
    const response = await request(`${route}index.html${query}`);
    assert.ok([301, 308].includes(response.status), 'Legacy index.html must redirect permanently.');
    const location = response.headers.get('location'); assert.ok(location, 'Redirect location is required.');
    const target = new URL(location, base);
    assert.equal(target.origin, base.origin, 'Legacy redirect must remain on the configured deployment.');
    assert.equal(target.pathname, route);
    assert.deepEqual([...target.searchParams.entries()].sort(), [...new URLSearchParams(query).entries()].sort(), 'Legacy redirect must preserve the original query parameters.');
    return { status: response.status, path: route, queryPreserved: true };
  });

  await check('legacy root and public/assets image compatibility', async () => {
    const files = (await readdir(publicRoot, { withFileTypes: true })).filter(entry => entry.isFile() && /\.(jpg|jpeg|png|avif|webp|svg)$/i.test(entry.name)).map(entry => entry.name);
    async function assetFiles(directory, prefix) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) await assetFiles(path.join(directory, entry.name), `${prefix}/${entry.name}`);
        else if (/\.(jpg|jpeg|png|avif|webp|svg)$/i.test(entry.name)) files.push(`${prefix}/${entry.name}`);
      }
    }
    assert.ok(existsSync(path.join(publicRoot, 'assets')), 'Retained public/assets directory is required.');
    await assetFiles(path.join(publicRoot, 'assets'), 'assets');
    assert.ok(files.length >= 19, 'Expected retained root and /assets image files are incomplete.');
    for (const file of files) {
      const expected = await readFile(path.join(publicRoot, file)); const response = await request(`/${file}`);
      assert.equal(response.status, 200, `Retained image /${file} must return HTTP 200.`);
      assert.match(response.headers.get('content-type') ?? '', /^image\//);
      assert.equal(hash(response.bytes), hash(expected), `Retained image /${file} must match the selected release source exactly.`);
    }
    return { retainedFiles: files.length, sha256Matched: true };
  });

  await check('Next/Image optimization endpoint', async () => {
    assert.ok(optimizedImageReferences.size > 0, 'Rendered pages must use Next/Image optimization.');
    const optimizerPath = new URL([...optimizedImageReferences][0], base).pathname;
    const response = await request(`${optimizerPath}?url=%2Fimages%2Fstar-optical-shop.jpg&w=640&q=75`, 'image/webp');
    assert.equal(response.status, 200); assert.match(response.headers.get('content-type') ?? '', /^image\/webp/);
    assert.ok(response.bytes.length > 1000); assert.ok(response.bytes.length < (await readFile(path.join(publicRoot, 'images/star-optical-shop.jpg'))).length);
    return { contentType: 'image/webp', bytes: response.bytes.length, smallerThanOriginal: true, renderedOptimizedReferences: optimizedImageReferences.size };
  });

  await check('contact form SSR and query preselection', async () => {
    for (const service of Object.keys(messages)) {
      const response = await request(`/contact/?service=${service}`); assert.equal(response.status, 200);
      assert.equal(link(response.text, 'canonical'), `${canonicalOrigin}/contact/`);
      const select = response.text.match(/<select\b[^>]*id="enquiry-service"[^>]*>([\s\S]*?)<\/select>/)?.[1]; assert.ok(select, 'Service selector must render on the server.');
      assert.equal(tags(select, 'option').find(option => Object.hasOwn(option, 'selected'))?.value, service);
      const form = tags(response.text, 'form').find(tag => tag.id === 'enquiry'); assert.ok(form);
      assert.ok(!form.action || form.action.startsWith('javascript:'), 'Form must not post private enquiry details to a remote endpoint.');
      for (const field of ['enquiry-name', 'enquiry-phone', 'enquiry-message']) assert.ok(response.text.includes(`id="${field}"`) && response.text.includes(`for="${field}"`));
      assert.ok(response.text.includes('生成 WhatsApp 查詢訊息') && response.text.includes('不會儲存在網站'));
    }
    const panda = await request('/contact/?service=frames&topic=panda-star');
    assert.ok(panda.text.includes('我想了解 Panda Star 自家品牌鏡架及到店試戴安排。'));
    return { servicePreselections: 5, pandaStarContext: true, staticFormOnly: true };
  });

  if (args.browser) await check('browser WhatsApp preview without sending', async () => {
    const { chromium } = await import('@playwright/test');
    const installedChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
    const executablePath = process.env.AUDIT_CHROMIUM_EXECUTABLE_PATH ?? (existsSync(installedChrome) ? installedChrome : undefined);
    const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    try {
      const context = await browser.newContext({ locale: 'zh-HK', reducedMotion: 'reduce' });
      const posts = [];
      await context.route('**/*', async route => {
        const request = route.request(); const target = new URL(request.url());
        if (request.method() !== 'GET' && request.method() !== 'HEAD') posts.push(request.method());
        if (target.origin !== base.origin) return route.abort();
        return route.continue({ headers: { ...request.headers(), ...authHeaders } });
      });
      const page = await context.newPage();
      const response = await page.goto(new URL('/contact/?service=frames&topic=panda-star#enquiry', base).href, { waitUntil: 'networkidle' });
      assert.equal(response?.status(), 200, 'Browser must be authorized to load the exact deployment.');
      await page.locator('#enquiry-service').waitFor();
      assert.equal(await page.locator('#enquiry-service').inputValue(), 'frames');
      assert.match(await page.locator('#enquiry-message').inputValue(), /Panda Star/);
      const storageBefore = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
      await page.locator('#enquiry-name').fill('網站功能檢查');
      await page.locator('input[name="consent"]').check();
      for (const service of Object.keys(messages)) {
        await page.locator('#enquiry-service').selectOption(service);
        await page.locator('#enquiry-message').fill('測試符號 & + / ?；此訊息沒有發送。');
        await page.getByRole('button', { name: '生成 WhatsApp 查詢訊息' }).click();
        const action = page.locator('.message-preview a'); await action.waitFor();
        const message = assertWhatsApp(await action.getAttribute('href')); assert.ok(message.startsWith(messages[service]));
        assert.ok(message.includes('測試符號 & + / ?'));
        assert.equal(await page.locator('.message-preview h3').evaluate(element => document.activeElement === element), true);
      }
      assert.deepEqual(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } })), storageBefore);
      assert.deepEqual(posts, [], 'Generating enquiries must not submit network POSTs.');
      await page.locator('#enquiry-message').fill('已修改'); assert.equal(await page.locator('.message-preview').count(), 0);
      return { serviceFlows: 5, contextualForm: true, focusMovedToPreview: true, storageUnchanged: true, networkSubmissions: 0, whatsappSent: false };
    } finally { await browser.close(); }
  });

  const report = { checkedAt: new Date().toISOString(), base: base.origin, mode, transport, authValuesRecorded: false, browserRequested: Boolean(args.browser), passed: results.filter(result => result.passed).length, failed: results.filter(result => !result.passed).length, results };
  if (args.output) { const output = path.resolve(args.output); await mkdir(path.dirname(output), { recursive: true }); await writeFile(output, `${JSON.stringify(report, null, 2)}\n`); }
  console.log(JSON.stringify(report, null, 2));
  if (report.failed) process.exitCode = 1;
}
