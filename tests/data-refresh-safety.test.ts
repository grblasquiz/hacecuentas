import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
function runFixture(script: string, target: string, original: string, response: string) {
  const cwd = mkdtempSync(join(tmpdir(), 'hc-refresh-'));
  try {
    const file = join(cwd, target);
    mkdirSync(resolve(file, '..'), { recursive: true });
    writeFileSync(file, original);
    const mock = join(cwd, 'mock.mjs');
    writeFileSync(mock, `globalThis.fetch = async () => (${response});`);
    const run = spawnSync(process.execPath, ['--import', mock, join(root, script)], { cwd, encoding: 'utf8' });
    return { code: run.status, data: readFileSync(file, 'utf8') };
  } finally { rmSync(cwd, { recursive: true, force: true }); }
}
const series = `// Última fecha: 2026-08-16, valor: 35.25
// Total: 1 días
export const ICL_LAST_UPDATED = '2026-08-16';
export const ICL_FECHAS: ReadonlyArray<string> = [
  '2026-08-16',
];
export const ICL_VALORES: ReadonlyArray<number> = [
  35.25,
];
`;
describe('data refresh preserves the previous snapshot on bad responses', () => {
  it('rejects a gap in the daily ICL series', () => {
    const r = runFixture('scripts/update-icl.mjs', 'src/lib/formulas/_bcra-icl.ts', series,
      "{ok:true,json:async()=>({results:[{detalle:[{fecha:'2026-08-18',valor:35.3}]}]})}");
    expect(r.code).not.toBe(0); expect(r.data).toBe(series);
  });
  it('appends valid ICL data even when the retired calculator does not exist', () => {
    const r = runFixture('scripts/update-icl.mjs', 'src/lib/formulas/_bcra-icl.ts', series,
      "{ok:true,json:async()=>({results:[{detalle:[{fecha:'2026-08-17',valor:35.28}]}]})}");
    expect(r.code).toBe(0); expect(r.data).toContain("ICL_LAST_UPDATED = '2026-08-17'"); expect(r.data).toContain('35.28');
  });
  it('rejects an incomplete NFL response and reports failure', () => {
    const r = runFixture('scripts/fetch-nfl-data.mjs', 'src/data/live/nfl-2026.json', '{"previous":true}',
      '{ok:true,json:async()=>({events:[],leagues:[],children:[]})}');
    expect(r.code).not.toBe(0); expect(r.data).toBe('{"previous":true}');
  });
});
