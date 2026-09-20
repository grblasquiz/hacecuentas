import { expect, it } from 'vitest';
import { build } from 'esbuild';
import { Miniflare } from 'miniflare';
import { resolve } from 'node:path';

it('isolates Cloudflare request queues after an upstream failure', async () => {
  const entry=resolve('src/pages/api/football.json.ts');
  const bundled=await build({stdin:{contents:`import {GET} from ${JSON.stringify(entry)}; export default {fetch:request=>GET({url:new URL(request.url)})};`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'browser',write:false});
  let fail=true;
  const worker=new Miniflare({
    modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-04-18',
    outboundService:async request=>{
      if(fail && request.url.includes('/scoreboard?')) return new Response('',{status:400});
      await new Promise(resolve=>setTimeout(resolve,5));
      return Response.json({events:[],children:[]});
    },
  });
  try {
    const first=await worker.dispatchFetch('https://test/api/football.json?market=ar');
    expect(first.status).toBe(502); await first.text();
    fail=false;
    for(const market of ['mx','ar']) {
      const response=await worker.dispatchFetch(`https://test/api/football.json?market=${market}`);
      expect(response.status).toBe(200);
      expect(await response.json()).toHaveProperty('fetchedAt');
    }
  }finally {await worker.dispose();}
},15000);
