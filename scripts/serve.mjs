import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(import.meta.dirname,'..','dist');
const port=Number(process.env.PORT)||4173;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
createServer(async(req,res)=>{
  try{
    const name=decodeURIComponent((req.url||'/').split('?')[0]);
    const path=resolve(root,'.'+(name==='/'?'/index.html':name));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
    const s=await stat(path);if(!s.isFile())throw new Error('Not a file');
    const content=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(content);
  }catch{res.writeHead(404);res.end('Not found')}
}).listen(port,'127.0.0.1',()=>console.log(`Preview at http://127.0.0.1:${port}`));
