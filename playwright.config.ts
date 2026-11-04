import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  retries: 0,
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? 'docs/test-results',
  reporter: [['list'], ['html', { outputFolder: process.env.PLAYWRIGHT_REPORT_DIR ?? 'docs/playwright-report', open: 'never' }], ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_FILE ?? 'docs/playwright-results.json' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
    browserName: 'chromium',
    headless: true,
    locale: 'zh-HK',
    timezoneId: 'Asia/Hong_Kong',
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1000 },
    launchOptions: existsSync(chrome) ? { executablePath: chrome } : {},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
