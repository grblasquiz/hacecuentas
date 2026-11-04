import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';
const script = resolve('scripts/data-sources/fetch-bcra.mjs');
function run(mode: string) {
  const cwd = mkdtempSync(join(tmpdir(), 'hc-bcra-'));
  mkdirSync(join(cwd, 'src/data/live'), { recursive: true });
  const file = join(cwd, 'src/data/live/tasas.json');
  const original = '{"existing":"retain me"}\n'; writeFileSync(file, original);
  const preload = `const RealDate=Date;globalThis.Date=class extends RealDate{constructor(...args){super(...(args.length?args:['2026-11-04T01:00:00Z']));}};
  globalThis.fetch=async function(url){const u=new URL(url);if(u.searchParams.get('hasta')!=='2026-11-03')throw Error('wrong Argentine calendar cutoff');
  if(${JSON.stringify(mode)}==='error' && u.pathname.endsWith('/31'))return {ok:false,status:503};
  return {ok:true,json:async()=>({results:[{detalle:[{fecha:${JSON.stringify(mode)}==='future'?'2026-11-15':'2026-11-03',valor:2181.1}]}]})};};`;
  const r = spawnSync(process.execPath, ['--import', 'data:text/javascript,' + encodeURIComponent(preload), script], { cwd, encoding: 'utf8', timeout: 10000 });
  const text = readFileSync(file, 'utf8'); rmSync(cwd, { recursive: true });
  return { r, text, original };
}
describe('BCRA snapshot publication cutoff', () => {
  it('requests data through the Argentine calendar day and writes a complete snapshot', () => {
    const { r, text } = run('ok'); expect(r.status, r.stderr).toBe(0);
    const d=JSON.parse(text); expect(d.uva.fecha).toBe('2026-11-03'); expect(d.badlar).toBeDefined();
  });
  it('rejects future observations without replacing the previous snapshot', () => {
    const { r, text, original } = run('future'); expect(r.status).toBe(1); expect(text).toBe(original);
  });
  it('does not erase the previous snapshot when only one variable fails', () => {
    const { r, text, original } = run('error'); expect(r.status).toBe(1); expect(text).toBe(original);
  });
});

it('excludes future observations from public historical downloads at the Argentine day boundary', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'hc-bcra-history-'));
  try {
    const preload = `const RealDate=Date;globalThis.Date=class extends RealDate{constructor(...args){super(...(args.length?args:['2026-11-04T01:00:00Z']));}};
    globalThis.fetch=async function(url){const u=new URL(url);if(u.hostname==='api.bcra.gob.ar'){if(u.searchParams.get('hasta')!=='2026-11-03')throw Error('wrong cutoff');return {ok:true,json:async()=>({results:[{detalle:[{fecha:'2026-11-15',valor:2196},{fecha:'2026-11-03',valor:2181}]}]})};}return {ok:true,json:async()=>[]};};`;
    const r = spawnSync(process.execPath, ['--import', 'data:text/javascript,' + encodeURIComponent(preload), resolve('scripts/data-sources/generate-datasets.mjs')], { cwd, encoding: 'utf8', timeout: 10000 });
    expect(r.status, r.stderr).toBe(0);
    for (const name of ['uva', 'tasa-plazo-fijo-30dias']) {
      const data=JSON.parse(readFileSync(join(cwd, `public/datasets/${name}-argentina-historico.json`), 'utf8'));
      expect(data.data.map((row: {fecha: string})=>row.fecha)).toEqual(['2026-11-03']);
    }
  } finally { rmSync(cwd, {recursive: true}); }
});
