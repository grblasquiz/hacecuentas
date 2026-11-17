import { readFileSync, statSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { identifyAnsesSource, parseAnsesOfficial, fetchJubilacionAnses } from '../scripts/update-data/fetchers/jubilacion-anses';
import { ANSES_VIGENTE } from '../src/lib/data/anses-vigente';
import { HABER_MINIMO,HABER_MAXIMO,PBU,MOVILIDAD } from '../src/lib/hubs/cuanto-voy-a-cobrar';
const imss=readFileSync('tests/fixtures/anses/imss-noviembre.html','utf8');
const norm=readFileSync('tests/fixtures/anses/resolucion-noviembre.txt','utf8');
describe('Official monthly ANSES publication',()=>{
 it('retains cents, reads PBU instead of estimating it and applies the matching IPC month',()=>{
  const x=parseAnsesOfficial(imss,norm,'2026-11-17');
  expect(x.haberMinimo).toBe(444158.46);expect(x.haberMaximo).toBe(2988765.82);expect(x.pbu).toBe(203182.22);expect(x.puam).toBe(355326.77);expect(x.movilidadPct).toBe(1.93);expect(x.mesIpc).toBe('2026-09');
  expect(parseAnsesOfficial(imss.replace('extraodinario','extraordinario'),norm,'2026-11-17').bonoMaximo).toBe(70000);
 });
 it('never promotes a future publication, stale month or untrusted link',()=>{
  expect(()=>identifyAnsesSource(imss,'2026-12-01')).toThrow('mes solicitado');
  expect(()=>identifyAnsesSource(imss,'2026-10-31')).toThrow('mes solicitado');
  expect(()=>identifyAnsesSource(imss.replace('www.boletinoficial.gob.ar','example.com'),'2026-11-17')).toThrow('Origen no oficial');
 });
 it('rejects incomplete, conflicting and wrong-effective-month resolutions',()=>{
  expect(()=>parseAnsesOfficial(imss,norm.replace('444.158,46','999.158,46'),'2026-11-17')).toThrow(/discrepan|inconsistente|no verificada/);
  expect(()=>parseAnsesOfficial(imss.replace('514.158,46','614.158,46'),norm,'2026-11-17')).toThrow('Regla proporcional');
  expect(()=>parseAnsesOfficial(imss,norm.replace('ARTÍCULO 4°','ANEXO 4°'),'2026-11-17')).toThrow();
  expect(()=>parseAnsesOfficial(imss,norm.replace('mes de noviembre','mes de diciembre'),'2026-11-17')).toThrow('Vigencia');
 });
 it('does not multiply the maximum by100 when feeding the live hub',()=>{
  expect(HABER_MAXIMO).toBe(ANSES_VIGENTE.haberMaximo);expect(HABER_MAXIMO).toBeLessThan(10_000_000);expect(HABER_MINIMO).toBe(ANSES_VIGENTE.haberMinimo);expect(PBU).toBe(ANSES_VIGENTE.pbu);expect(PBU).not.toBeCloseTo(HABER_MINIMO*.45,0);expect(MOVILIDAD.mesIpc).toBe('2026-09');
 });
 it('leaves the snapshot bytes and mtime unchanged on source failure',async()=>{
  const path='src/data/live/anses.json',before=readFileSync(path,'utf8'),mtime=statSync(path).mtimeMs;
  vi.stubGlobal('fetch',vi.fn(async()=>new Response('No disponible',{status:503})));
  try {expect(await fetchJubilacionAnses({asOf:'2026-11-17'})).toBe(false);expect(readFileSync(path,'utf8')).toBe(before);expect(statSync(path).mtimeMs).toBe(mtime);}finally{vi.unstubAllGlobals()}
 });
 it('does not refresh dates when the verified snapshot has not changed',async()=>{
  const path='src/data/live/anses.json',mtime=statSync(path).mtimeMs;
  vi.stubGlobal('fetch',vi.fn(async(url)=>new Response(String(url).includes('imss')?imss:norm,{status:200})));
  try {expect(await fetchJubilacionAnses({asOf:'2026-11-18'})).toBe(false);expect(statSync(path).mtimeMs).toBe(mtime);}finally{vi.unstubAllGlobals()}
 });
 it('writes a new official snapshot atomically to the live destination and then is idempotent',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'hc-anses-')),path=join(dir,'anses.json');
  writeFileSync(path,JSON.stringify({mes:'2026-08'}));
  const historical=readFileSync('src/lib/data/anses-2026.ts','utf8');
  vi.stubGlobal('fetch',vi.fn(async(url)=>new Response(String(url).includes('imss')?imss:norm,{status:200})));
  try {
   expect(await fetchJubilacionAnses({asOf:'2026-11-17',snapshotPath:path})).toBe(true);
   expect(JSON.parse(readFileSync(path,'utf8')).haberMinimo).toBe(444158.46);
   expect(await fetchJubilacionAnses({asOf:'2026-11-18',snapshotPath:path})).toBe(false);
   expect(readFileSync('src/lib/data/anses-2026.ts','utf8')).toBe(historical);
  }finally{vi.unstubAllGlobals();rmSync(dir,{recursive:true,force:true})}
 });

});
