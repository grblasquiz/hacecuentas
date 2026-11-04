import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { refreshSources } from '../scripts/data-sources/fetch-all.mjs';
const directories: string[] = [];
async function setup() {
  const dir = await mkdtemp(join(tmpdir(), 'hc-sources-')); directories.push(dir);
  const good = join(dir, 'good.json'), bad = join(dir, 'bad.json');
  await writeFile(good, '{"value":1}');
  await writeFile(bad, '{"value":2,"fetchedAt":"2026-10-28"}\n');
  return { good, bad, sources: [{ script: 'good', outputs: [good] }, { script: 'bad', outputs: [bad] }] };
}
afterEach(async () => { await Promise.all(directories.splice(0).map(dir => rm(dir, { recursive: true, force: true }))); });
describe('independent data refresh', () => {
  it('keeps successful data and restores exact failed data with its original freshness', async () => {
    const s = await setup();
    const report = await refreshSources(s.sources, { allowPartial: true, run: async (script: string) => {
      await writeFile(script === 'good' ? s.good : s.bad, '{"value":999,"fetchedAt":"today"}');
      return script === 'good' ? 0 : 1;
    }});
    expect(report.status).toBe('partial'); expect(report.successCount).toBe(1);
    expect(await readFile(s.good, 'utf8')).toContain('999');
    expect(await readFile(s.bad, 'utf8')).toBe('{"value":2,"fetchedAt":"2026-10-28"}\n');
  });
  it('preserves strict failure by default', async () => {
    const s = await setup();
    expect((await refreshSources(s.sources, { run: async (name: string) => name === 'good' ? 0 : 1 })).status).toBe('failure');
  });
  it('fails if every source fails, even with partial mode enabled', async () => {
    const s = await setup();
    expect((await refreshSources(s.sources, { allowPartial: true, run: async () => 1 })).status).toBe('failure');
  });
  it('removes a new partial output and handles a runner error without hiding it', async () => {
    const s = await setup(); const missing = join(directories.at(-1)!, 'new.json');
    const report = await refreshSources([{ script: 'new', outputs: [missing] }], { run: async () => {
      await writeFile(missing, 'broken'); throw new Error('network failure');
    }});
    expect(report.status).toBe('failure'); await expect(access(missing)).rejects.toThrow();
  });
  it('rejects overlapping ownership before running a source', async () => {
    const s = await setup(); let called = false;
    await expect(refreshSources([s.sources[0], s.sources[0]], { run: async () => { called = true; return 0; } })).rejects.toThrow('disjoint');
    expect(called).toBe(false);
  });
});
