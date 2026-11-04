import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const routes = [
  ['首頁', '/'],
  ['兒童近視管理', '/children-eye-care/'],
  ['成人配鏡', '/adult-eyewear/'],
  ['學校護眼計劃', '/school-vision-screening/'],
  ['品牌鏡架', '/frames/'],
  ['聯絡我們', '/contact/'],
];
const profiles = [
  { name: 'desktop', options: { viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 } },
  { name: 'mobile', options: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } } },
];
const browser = await chromium.launch({ headless: true, ...(existsSync(chrome) ? { executablePath: chrome } : {}) });
const report = {
  measuredAt: new Date().toISOString(),
  baseURL,
  browser: browser.version(),
  methodology: {
    repeats: 1,
    browserCache: 'Fresh browser context per route and profile; HTTP cache disabled via CDP.',
    serverCache: 'Server and Next/Image cache may already be warm; not cleared.',
    network: 'Local loopback; no network throttling.',
    cpu: 'No CPU throttling. Other local test processes may be running concurrently.',
    initial: 'Observe navigation, initial resources, LCP and CLS before scrolling. Wait for network idle, fonts, visible image decode, then 2 seconds of idle time.',
    lazyImages: 'Collect initial metrics first, disconnect initial observers, then scroll through page to inspect image loading.',
    limitation: 'Single local lab sample per route/profile; not field Core Web Vitals, not production or real mobile hardware performance.',
  },
  results: [],
};
try {
  for (const profile of profiles) {
    for (const [name, route] of routes) {
      const context = await browser.newContext({ ...profile.options, locale: 'zh-HK', timezoneId: 'Asia/Hong_Kong', reducedMotion: 'reduce' });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      const jsErrors = [];
      const requests = [];
      const failedRequests = [];
      page.on('pageerror', (error) => jsErrors.push(error.message));
      page.on('request', (request) => requests.push({ url: request.url(), type: request.resourceType() }));
      page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
      await page.addInitScript(() => {
        window.__labMetrics = { lcp: null, cls: 0, observers: [] };
        try {
          const lcp = new PerformanceObserver((list) => {
            const entry = list.getEntries().at(-1);
            if (entry) window.__labMetrics.lcp = { startTime: entry.startTime, size: entry.size, element: entry.element?.tagName ?? null, url: entry.url ?? null };
          });
          lcp.observe({ type: 'largest-contentful-paint', buffered: true });
          window.__labMetrics.observers.push(lcp);
          const cls = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__labMetrics.cls += entry.value;
          });
          cls.observe({ type: 'layout-shift', buffered: true });
          window.__labMetrics.observers.push(cls);
        } catch (error) { window.__labMetrics.observerError = String(error); }
      });
      const response = await page.goto(baseURL + route, { waitUntil: 'networkidle', timeout: 90_000 });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.allSettled(Array.from(document.images).filter((img) => img.getBoundingClientRect().top < innerHeight).map((img) => img.decode()));
      });
      await page.waitForTimeout(2000);
      const initial = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource').map((entry) => ({
          url: entry.name, type: entry.initiatorType, durationMs: entry.duration,
          transferBytes: entry.transferSize, encodedBytes: entry.encodedBodySize, decodedBytes: entry.decodedBodySize,
        }));
        const images = Array.from(document.images).map((img) => ({
          alt: img.alt, currentSrc: img.currentSrc, src: img.getAttribute('src'),
          loading: img.loading, complete: img.complete, naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight, renderedWidth: img.getBoundingClientRect().width,
          renderedHeight: img.getBoundingClientRect().height, initiallyVisible: img.getBoundingClientRect().top < innerHeight,
        }));
        for (const observer of window.__labMetrics.observers) observer.disconnect();
        return {
          navigation: { ttfbMs: nav.responseStart - nav.startTime, domContentLoadedMs: nav.domContentLoadedEventEnd, loadMs: nav.loadEventEnd, transferBytes: nav.transferSize },
          fcpMs: performance.getEntriesByType('paint').find((entry) => entry.name === 'first-contentful-paint')?.startTime ?? null,
          lcp: window.__labMetrics.lcp, cls: window.__labMetrics.cls,
          observerError: window.__labMetrics.observerError ?? null,
          totalTransferBytes: nav.transferSize + resources.reduce((total, resource) => total + resource.transferBytes, 0),
          resourceCount: resources.length, resources, images,
          horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        };
      });
      const initialRequests = [...requests];
      for (let offset = 0; offset < await page.evaluate(() => document.documentElement.scrollHeight); offset += profile.options.viewport.height * 0.8) {
        await page.evaluate((y) => window.scrollTo(0, y), offset);
        await page.waitForTimeout(120);
      }
      await page.waitForLoadState('networkidle');
      const afterScroll = await page.evaluate(async () => {
        await Promise.allSettled(Array.from(document.images).map((img) => img.decode()));
        return {
          images: Array.from(document.images).map((img) => ({ alt: img.alt, currentSrc: img.currentSrc, complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })),
          resourceCount: performance.getEntriesByType('resource').length,
          totalResourceTransferBytes: performance.getEntriesByType('resource').reduce((total, resource) => total + resource.transferSize, 0),
        };
      });
      const entry = { profile: profile.name, name, route, httpStatus: response?.status(), viewport: profile.options.viewport, deviceScaleFactor: profile.options.deviceScaleFactor, initial, initialRequests, afterScroll, jsErrors, failedRequests };
      report.results.push(entry);
      console.log(`${profile.name} ${route}: HTTP ${entry.httpStatus}, LCP ${Math.round(initial.lcp?.startTime ?? 0)} ms, CLS ${initial.cls.toFixed(4)}, ${Math.round(initial.totalTransferBytes / 1024)} KiB, ${jsErrors.length} JS errors`);
      await context.close();
    }
  }
} finally { await browser.close(); }

const formatMs = (value) => value === null || value === undefined ? '未取得' : `${Math.round(value)} ms`;
const rows = report.results.map((entry) => `| ${entry.profile === 'desktop' ? '桌面 1440px' : '手機 390px'} | ${entry.name} | ${entry.httpStatus} | ${formatMs(entry.initial.navigation.ttfbMs)} | ${formatMs(entry.initial.fcpMs)} | ${formatMs(entry.initial.lcp?.startTime)} | ${entry.initial.cls.toFixed(4)} | ${(entry.initial.totalTransferBytes / 1024).toFixed(0)} KiB | ${entry.initialRequests.length} | ${entry.jsErrors.length} |`).join('\n');
const brokenImages = report.results.flatMap((entry) => entry.afterScroll.images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => `${entry.profile} ${entry.route}: ${img.alt}`));
const notes = [
  '# 本地基本效能實測',
  '',
  `測量時間：${new Intl.DateTimeFormat('zh-HK', { dateStyle: 'full', timeStyle: 'long', timeZone: 'Asia/Hong_Kong' }).format(new Date(report.measuredAt))}。`,
  `網址：${baseURL}；系統 Chrome ${report.browser}，無介面模式。`,
  '',
  '每個頁面及尺寸各測一次，使用全新瀏覽器環境並停用 HTTP 快取。先記錄初始載入，再捲動全頁檢查延後載入圖片。桌面為 1440×1000；手機為 iPhone 13 模擬、390×844、3 倍像素密度。',
  '',
  '**這是本機測量：沒有網絡或 CPU 降速，伺服器及 Next/Image 圖片快取可能已暖機，其他本地測試可能同時執行。結果不是正式網站速度、真實手機測試、實地 Core Web Vitals，亦不保證正式上線後表現。**',
  '',
  '| 尺寸 | 頁面 | HTTP | TTFB | FCP | 初始 LCP | 初始 CLS | 初始傳輸量 | 初始請求 | JS 錯誤 |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  rows,
  '',
  `全頁捲動後，未能載入圖片：${brokenImages.length}。JavaScript 未處理錯誤：${report.results.reduce((sum, entry) => sum + entry.jsErrors.length, 0)}。失敗網絡請求：${report.results.reduce((sum, entry) => sum + entry.failedRequests.length, 0)}。`,
  `初始水平溢出：${report.results.some((entry) => entry.initial.horizontalOverflowPx > 0) ? '有，請查看 JSON 詳情。' : '12 個頁面／尺寸組合均為 0px。'}`,
  '',
  'LCP 與 CLS 只觀察初始載入，於首次捲動前停止記錄；不是完整使用者工作階段。傳輸量包含導覽及初始資源，不包含之後捲動才觸發的圖片。詳細資源請求、圖片顯示尺寸、自然尺寸及 currentSrc 保存在 performance.json。',
  '',
  '沒有安裝或執行 Lighthouse；沒有填寫或發送任何查詢。正式部署後宜以實際手機、香港網絡及多次測量重新驗證，待有足夠真實流量後再觀察實地 Core Web Vitals。',
  '',
  '重跑方法：在專案目錄先啟動本地網站，再執行 `node scripts/performance-audit.mjs`。',
];
await mkdir(path.join(root, 'docs'), { recursive: true });
await writeFile(path.join(root, 'docs/performance.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
await writeFile(path.join(root, 'docs/performance.md'), notes.join('\n') + '\n', 'utf8');
