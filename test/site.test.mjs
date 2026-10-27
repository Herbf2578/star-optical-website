import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {build} from '../scripts/build.mjs';
import {createServer} from '../scripts/serve.mjs';
const production=await build({production:true,output:'.build/test-production'});
const preview=await build({production:false,output:'.build/test-preview'});
const htmlAt=(build,route)=>readFile(path.join(build.outputRoot,route,'index.html'),'utf8');
const documents=new Map(await Promise.all(production.routes.map(async route=>[route,await htmlAt(production,route)])));

test('original public image URLs serve the unchanged source bytes',async()=>{
  const originals=['bragi-custom-eyewear.jpg','contact-lens-fitting-cover.jpg','designer-eyewear-cover.jpg','essilor-stellest-2-0.jpg','misight-poster.jpeg','ok-lens-poster.png','panda-star-brand.jpg','progressive-lenses-cover.jpg','vision-program-school.jpg','vision-program-screening.jpg','vision-program-team.jpg'];
  const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
  const server=createServer(production.outputRoot);server.listen(0,'127.0.0.1');await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  try{
    for(const filename of originals){
      const response=await fetch(base+'/'+filename);assert.equal(response.status,200,filename);
      assert.equal(response.headers.get('content-type'),filename.endsWith('.png')?'image/png':'image/jpeg',filename);
      const source=await readFile(new URL('../src/legacy-assets/'+filename,import.meta.url));
      assert.equal(digest(Buffer.from(await response.arrayBuffer())),digest(source),filename+' source hash');
    }
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('production metadata, schema and sitemap describe each real route',async()=>{
  const titles=new Set();
  for(const[route,html]of documents){
    assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,route+' H1');
    assert.match(html,/<html lang="zh-HK">/);
    assert.ok(html.includes(`<link rel="canonical" href="https://www.staropticalhk.com${route}">`));
    assert.match(html,/<meta name="robots" content="index,follow">/);
    assert.ok(!html.includes('原網站尚未更改'));
    const title=html.match(/<title>(.*?)<\/title>/)[1]; assert.ok(!titles.has(title));titles.add(title);
    const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const business=schema['@graph'].find(entity=>entity['@type']==='LocalBusiness');
    assert.equal(business.telephone,'+85225780013');
    assert.equal(business.contactPoint.url,'https://wa.me/85256203542');
    assert.ok(!('aggregateRating'in business)); assert.ok(!('openingHours'in business));
    assert.equal(schema['@graph'].find(entity=>entity['@type']==='WebPage').url,'https://www.staropticalhk.com'+route);
  }
  const sitemap=await readFile(path.join(production.outputRoot,'sitemap.xml'),'utf8');
  const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
  assert.deepEqual(urls,production.routes.map(route=>'https://www.staropticalhk.com'+route));
  assert.ok(!sitemap.includes('<lastmod>'));
  assert.match(await readFile(path.join(production.outputRoot,'robots.txt'),'utf8'),/Sitemap: https:\/\/www.staropticalhk.com\/sitemap.xml/);
});

test('all local navigation and media resolve; external contact targets are correct',async()=>{
  for(const[route,html]of documents){
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(new Set(ids).size,ids.length,route+' duplicate ID');
    for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
      const raw=match[1].replaceAll('&amp;','&');
      if(raw.startsWith('tel:')){assert.equal(raw,'tel:+85225780013');continue;}
      const url=new URL(raw,'https://www.staropticalhk.com'+route);
      if(url.hostname==='wa.me'){assert.equal(url.pathname,'/85256203542');continue;}
      if(url.origin!=='https://www.staropticalhk.com')continue;
      const file=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
      await access(path.join(production.outputRoot,file));
      if(url.hash){const target=documents.get(url.pathname);assert.ok(target?.includes(`id="${url.hash.slice(1)}"`),raw+' missing anchor');}
    }
    assert.ok(!html.includes('4.9 / 5'));
  }
});

test('preview cannot accidentally advertise production indexability',async()=>{
  for(const route of preview.routes){const html=await htmlAt(preview,route);assert.match(html,/content="noindex,follow"/);assert.ok(html.includes('原網站尚未更改'));}
  assert.ok(!(await readFile(path.join(preview.outputRoot,'sitemap.xml'),'utf8')).includes('<loc>'));
  assert.ok(!(await readFile(path.join(preview.outputRoot,'robots.txt'),'utf8')).includes('Sitemap:'));
});

test('local HTTP serving, redirects and missing-page handling work',async()=>{
  const server=createServer(preview.outputRoot);server.listen(0,'127.0.0.1');await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  try{
    for(const route of preview.routes){const response=await fetch(base+route);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/html/);assert.equal(response.headers.get('x-robots-tag'),'noindex, follow');}
    const redirect=await fetch(base+'/contact',{redirect:'manual'});assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'/contact/');
    const tagged=await fetch(base+'/contact?utm_source=chatgpt.com',{redirect:'manual'});assert.equal(tagged.status,308);assert.equal(tagged.headers.get('location'),'/contact/?utm_source=chatgpt.com');
    const missing=await fetch(base+'/missing-page/');assert.equal(missing.status,404);assert.ok((await missing.text()).includes('找不到這個頁面'));
    assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
    assert.equal((await fetch(base+'/assets/star-optical-logo.jpg')).headers.get('content-type'),'image/jpeg');
  }finally{await new Promise(resolve=>server.close(resolve));}
});
