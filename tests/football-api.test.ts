import { afterEach, expect, it, vi } from 'vitest';
import { GET } from '../src/pages/api/football.json';
afterEach(()=>vi.unstubAllGlobals());
it('serves the public refresh without requesting rejected ESPN date ranges', async()=>{
  const mock=vi.fn(async(url:string)=>{
    if(url.includes('/scoreboard?')){
      expect(new URL(url).hostname).toBe('site.web.api.espn.com');
      expect(new URL(url).searchParams.get('dates')).toMatch(/^\d{8}$/);
      return {ok:true,json:async()=>({events:[]})};
    }
    return {ok:true,json:async()=>({children:[]})};
  });
  vi.stubGlobal('fetch',mock);
  const response=await GET({url:new URL('https://hacecuentas.com/api/football.json?market=ar')} as any);
  expect(response.status).toBe(200);
  const body=await response.json();
  expect(body.first.events).toEqual([]);
  expect(body.national.events).toEqual([]);
  expect(mock).toHaveBeenCalledTimes(38);
});
it('returns a visible failure if any day is unavailable',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:false,status:400})));
  const response=await GET({url:new URL('https://hacecuentas.com/api/football.json?market=mx')} as any);
  expect(response.status).toBe(502);
});
