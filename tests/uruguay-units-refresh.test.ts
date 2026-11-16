import { readFileSync, statSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';
import { parseUruguayUnits, fetchUruguayUnits } from '../scripts/update-data/fetchers/uruguay-units';
import { URUGUAY_2026 } from '../src/lib/data/uruguay-2026';
import snapshot from '../db/uruguay-units.json';
const ui = `<table><tr><td>15/11/2026</td><td>6,7027</td><td>16/11/2026</td><td>6,7040</td></tr><tr><td>17/11/2026</td><td>6,7053</td></tr></table>`;
const ur = `<table><caption>Año 2026</caption><tr><td>Setiembre</td><td>1.946,95</td></tr><tr><td>Octubre</td><td>1.948,97</td></tr><tr><td>Noviembre</td><td></td></tr></table>`;
describe('DGI Uruguay effective dates', () => {
 it('selects the requested daily UI, never the published future value, and applies prior-month UR', () => {
  const r=parseUruguayUnits(ui,ur,'2026-11-16');expect(r.ui.value).toBe(6.704);expect(r.ui.date).toBe('2026-11-16');expect(r.ur.value).toBe(1948.97);expect(r.ur.month).toBe('2026-10');expect(r.ur.validFrom).toBe('2026-11-01');
 });
 it('rejects missing or conflicting daily data and unavailable effective-month UR', () => {
  expect(()=>parseUruguayUnits(ui,ur,'2026-11-18')).toThrow('no publicó UI');
  expect(()=>parseUruguayUnits(ui+ui.replace('6,7040','7,0000'),ur,'2026-11-16')).toThrow('duplicada');
  expect(()=>parseUruguayUnits(ui,ur.replace('1.948,97',''),'2026-11-16')).toThrow('UR de 2026-10');
 });
 it('ignores unrelated historical typos without silently accepting conflicts for the requested date', () => {
  const history='<table><tr><td>23/01/2026</td><td>6,4215</td></tr><tr><td>23/01/2026</td><td>6,4914</td></tr></table>';
  expect(parseUruguayUnits(history+ui,ur,'2026-11-16').ui.value).toBe(6.704);
 });
 it('exposes exactly the validated snapshot through the shared product constants', () => {
  expect(URUGUAY_2026.unidadIndexada.valor).toBe(snapshot.ui.value);expect(URUGUAY_2026.unidadIndexada.fecha).toBe(snapshot.ui.date);expect(URUGUAY_2026.unidadReajustable.valor).toBe(snapshot.ur.value);
 });
 it('preserves the existing snapshot and lets other providers continue if DGI fails', async () => {
  const path='db/uruguay-units.json', before=readFileSync(path,'utf8'), modified=statSync(path).mtimeMs;
  vi.stubGlobal('fetch', vi.fn(async()=>new Response('<html>No disponible</html>',{status:200})));
  try {
   expect(await fetchUruguayUnits()).toBe(false);
   expect(readFileSync(path,'utf8')).toBe(before);expect(statSync(path).mtimeMs).toBe(modified);
  } finally {vi.unstubAllGlobals()}
 });

});
