import { afterEach, describe, expect, it, vi } from 'vitest';
import { calendarDays, scoreboard } from '../scripts/lib/espn-football.mjs';
import { getJsonWithRetry } from '../scripts/lib/fetch-json.mjs';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('ESPN daily scoreboards', () => {
  it('includes both ends across month and leap-year boundaries', () => {
    expect(calendarDays('20240228', '20240301')).toEqual(['20240228', '20240229', '20240301']);
    expect(calendarDays('20260920', '20260920')).toEqual(['20260920']);
  });
  it('rejects invalid or unbounded dates before requesting data', () => {
    for (const [a,b] of [['20260230','20260301'], ['20260921','20260920'], ['20260101','20260301']]) {
      expect(() => calendarDays(a,b)).toThrow();
    }
  });
  it('queries one date per request, deduplicates and orders events', async () => {
    const mock = vi.fn(async (url: string) => {
      const day = new URL(url).searchParams.get('dates');
      expect(day).toMatch(/^\d{8}$/);
      return { ok: true, json: async () => ({events: day === '20260920'
        ? [{id:'b',date:'2026-09-21'}, {id:'a',date:'2026-09-20'}]
        : [{id:'b',date:'2026-09-21'}]}) };
    });
    vi.stubGlobal('fetch', mock);
    expect((await scoreboard('arg.1','20260920','20260921')).events.map(e=>e.id)).toEqual(['a','b']);
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it('rejects a partial window instead of treating a bad response as an empty day', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ok:true,json:async()=>new URL(url).searchParams.get('dates')==='20260920'?{events:[]}:{}})));
    await expect(scoreboard('arg.1','20260920','20260921')).rejects.toThrow('Invalid scoreboard');
  });
  it('bounds concurrency across all leagues', async () => {
    let active=0,peak=0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      peak=Math.max(peak,++active);
      await new Promise(resolve=>setTimeout(resolve,2)); active--;
      return {ok:true,json:async()=>({events:[]})};
    }));
    await Promise.all(['arg.1','arg.2'].map(code=>scoreboard(code,'20260901','20260918')));
    expect(peak).toBeLessThanOrEqual(6);
  });
});
describe('temporary upstream failures', () => {
  it('retries a 502, then returns the successful payload', async () => {
    vi.useFakeTimers();
    const mock=vi.fn().mockResolvedValueOnce({ok:false,status:502}).mockResolvedValue({ok:true,json:async()=>({value:1})});
    vi.stubGlobal('fetch',mock);
    const promise=getJsonWithRetry('https://example.test');
    await vi.runAllTimersAsync();
    expect(await promise).toEqual({value:1}); expect(mock).toHaveBeenCalledTimes(2);
  });
  it('reports permanent errors without futile retries', async () => {
    const mock=vi.fn().mockResolvedValue({ok:false,status:400});vi.stubGlobal('fetch',mock);
    await expect(getJsonWithRetry('https://example.test')).rejects.toThrow('400');
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

it('keeps every market snapshot unchanged and fails when one source is unavailable', async () => {
  const { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const dir=mkdtempSync(join(tmpdir(),'hc-football-'));
  try {
    mkdirSync(join(dir,'scripts/lib'),{recursive:true});
    for (const file of ['fetch-football-markets.mjs','lib/espn-football.mjs','lib/fetch-json.mjs']) cpSync(join(process.cwd(),'scripts',file),join(dir,'scripts',file));
    mkdirSync(join(dir,'src/data/live/football'),{recursive:true});
    cpSync('src/data/football-policy.json',join(dir,'src/data/football-policy.json'));
    const ids=['mx','co','cl','pe','ec','ve','py','uy','do','es','pt','pt-pt','en'];
    for(const id of ids) writeFileSync(join(dir,`src/data/live/football/${id}.json`),'previous snapshot');
    writeFileSync(join(dir,'mock.mjs'),`globalThis.fetch=async url=>url.includes('/mex.1/')?{ok:false,status:400}:{ok:true,json:async()=>({events:[],children:[]})};`);
    const run=spawnSync(process.execPath,['--import',join(dir,'mock.mjs'),join(dir,'scripts/fetch-football-markets.mjs'),'--final-only'],{cwd:dir,encoding:'utf8'});
    expect(run.status).toBe(1);
    for(const id of ids) expect(readFileSync(join(dir,`src/data/live/football/${id}.json`),'utf8')).toBe('previous snapshot');
  } finally {rmSync(dir,{recursive:true,force:true});}
});
