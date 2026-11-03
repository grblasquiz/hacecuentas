import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { consumeVitalsLimit } from '../src/lib/vitals-rate-limit';
import { enforceRateLimit } from '../src/lib/api-utils';
import { env } from './stubs/cloudflare-workers';
let sql: DatabaseSync;
let db: D1Database;
beforeEach(() => {
  sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync('db/vitals-rate-limits.sql', 'utf8'));
  db = {prepare(query: string) { return {bind(...args: any[]) { return {
    async first() { return sql.prepare(query).get(...args) ?? null; },
    async run() { return sql.prepare(query).run(...args); }
  }; }}; }} as any;
});
afterEach(() => { sql.close(); delete env.DB; delete env.SESSION; vi.restoreAllMocks(); });
it('keeps 300/hour, rejects excess without writes, resets at the boundary', async () => {
  for (let i=0;i<300;i++) expect(await consumeVitalsLimit(db,'a',1000,300,3600)).toBeNull();
  const before = sql.prepare('SELECT total_changes() AS n').get()!.n;
  expect(await consumeVitalsLimit(db,'a',2000,300,3600)).toBe(3599);
  expect(sql.prepare('SELECT total_changes() AS n').get()!.n).toBe(before);
  expect(await consumeVitalsLimit(db,'a',3601000,300,3600)).toBeNull();
  expect(sql.prepare('SELECT count FROM vitals_rate_limits').get()!.count).toBe(1);
});
it('isolates clients and cleans only a bounded number of expired counters', async () => {
  for(let i=0;i<40;i++) sql.prepare('INSERT INTO vitals_rate_limits VALUES (?,1,1)').run('old'+i);
  sql.prepare('INSERT INTO vitals_rate_limits VALUES (?,300,999999)').run('active');
  expect(await consumeVitalsLimit(db,'new',2000,300,3600)).toBeNull();
  expect(sql.prepare('SELECT count(*) AS n FROM vitals_rate_limits WHERE reset_at=1').get()!.n).toBe(8);
  expect(sql.prepare("SELECT count FROM vitals_rate_limits WHERE key='active'").get()!.count).toBe(300);
});
it('vitals migrates once without KV writes, while other endpoints retain KV', async () => {
  env.DB=db;
  env.SESSION={get:vi.fn().mockResolvedValue(null),put:vi.fn().mockResolvedValue(undefined)};
  const request=new Request('https://hacecuentas.com/api/vitals', {headers:{'cf-connecting-ip':'192.0.2.1'}});
  expect(await enforceRateLimit(request,'vitals',300,3600)).toBeNull();
  expect(env.SESSION.get).toHaveBeenCalledOnce();
  expect(await enforceRateLimit(request,'vitals',300,3600)).toBeNull();
  expect(env.SESSION.get).toHaveBeenCalledOnce();
  expect(env.SESSION.put).not.toHaveBeenCalled();
  expect(await enforceRateLimit(request,'feedback',10,3600)).toBeNull();
  expect(env.SESSION.put).toHaveBeenCalledOnce();
});
it('preserves KV fallback if D1 fails and 429 for existing limited clients', async () => {
  env.DB={prepare(){throw new Error('unavailable');}};
  env.SESSION={get:vi.fn().mockResolvedValue(JSON.stringify({count:300,resetAt:Date.now()+3600000})),put:vi.fn()};
  vi.spyOn(console,'error').mockImplementation(()=>{});
  const response=await enforceRateLimit(new Request('https://hacecuentas.com/api/vitals'),'vitals',300,3600);
  expect(response?.status).toBe(429);
  expect(env.SESSION.put).not.toHaveBeenCalled();
});

it('preserves an active legacy limit and does not reread KV for the same window', async () => {
  const legacy=vi.fn().mockResolvedValue(JSON.stringify({count:300,resetAt:3601000}));
  expect(await consumeVitalsLimit(db,'migrated',2000,300,3600,legacy)).toBe(3599);
  expect(await consumeVitalsLimit(db,'migrated',3000,300,3600,legacy)).toBe(3598);
  expect(legacy).toHaveBeenCalledOnce();
});
