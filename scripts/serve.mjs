import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {root} from './build.mjs';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml'};
export function createServer(directory=path.join(root,'dist')) {
  const base=path.resolve(directory);
  return http.createServer(async(req,res)=>{
    try {
      if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
      let pathname,requestUrl;
      try {requestUrl=new URL(req.url,'http://localhost');pathname=decodeURIComponent(requestUrl.pathname);} catch {res.writeHead(400);return res.end('Bad request');}
      const target=path.resolve(base,'.'+pathname);
      if(target!==base&&!target.startsWith(base+path.sep)){res.writeHead(403);return res.end('Forbidden');}
      let filename=target;
      try {
        const entry=await stat(filename);
        if(entry.isFile()&&requestUrl.pathname.endsWith('/index.html')) {
          res.writeHead(308,{Location:requestUrl.pathname.slice(0,-'index.html'.length)+requestUrl.search});return res.end();
        }
        if(entry.isDirectory()) {
          if(!pathname.endsWith('/')){res.writeHead(308,{Location:requestUrl.pathname+'/'+requestUrl.search});return res.end();}
          filename=path.join(filename,'index.html');
        }
        const bytes=await readFile(filename);
        res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store','X-Robots-Tag':'noindex, follow','X-Content-Type-Options':'nosniff'});
        res.end(req.method==='HEAD'?undefined:bytes);
      } catch {
        res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, follow'});
        res.end(req.method==='HEAD'?undefined:await readFile(path.join(base,'404.html')));
      }
    } catch {if(!res.headersSent)res.writeHead(500);res.end('Server error');}
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const port=Number(process.env.STAR_PREVIEW_PORT||4180);
  createServer().listen(port,'127.0.0.1',()=>console.log(`Star Optical: http://127.0.0.1:${port}/`));
}
