import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const routes = ['/', '/children-eye-care/', '/adult-eyewear/', '/school-vision-screening/', '/frames/', '/contact/'];
const results = [];
for (const path of routes) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  const html = await response.text();
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  assert.ok(html.includes(`href="https://www.staropticalhk.com${path}"`));
  results.push({ path, status: response.status, previewNoindex: true, securityHeaders: true });
}
const robots = await (await fetch(base + '/robots.txt')).text();
assert.match(robots, /Disallow: \//);
const publicFiles = (await readdir('public')).filter(file => /\.(jpg|jpeg|png)$/.test(file));
for (const file of publicFiles) {
  const expected = await readFile(`public/${file}`);
  const response = await fetch(`${base}/${file}`);
  assert.equal(response.status, 200, file);
  assert.ok(response.headers.get('content-type')?.startsWith('image/'));
  const received = Buffer.from(await response.arrayBuffer());
  const hash = buffer => createHash('sha256').update(buffer).digest('hex');
  assert.equal(hash(received), hash(expected), file);
  results.push({ path: `/${file}`, status: response.status, contentType: response.headers.get('content-type'), bytes: received.length, sha256: hash(received) });
}
await writeFile('docs/http-checks.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, pageCount: routes.length, originalImageCount: publicFiles.length, robotsDisallowed: true, results }, null, 2) + '\n');
console.log(`${routes.length} pages: noindex + canonical + security headers passed; ${publicFiles.length} original image URLs: HTTP 200 + SHA-256 passed.`);
