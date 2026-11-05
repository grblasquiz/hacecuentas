import { describe, it, expect, vi, afterEach } from 'vitest';
import { prepareTrmInputs, validTrm, TRM_COMPUTE_CACHE } from '../src/lib/trm-live';
import { compute } from '../src/lib/formulas/trm-dolar-hoy-pesos-colombianos';
import snapshot from '../src/data/live/colombia.json';

vi.mock('../src/data/live/colombia.json',()=>({default:{trm:{valor:3235.59,vigenciaDesde:'2026-11-04T00:00:00.000'}}}));
afterEach(()=>vi.useRealTimers());
const live={trm:{valor:3221.19,vigenciaDesde:'2026-11-05T00:00:00.000'}};
const base={monto:100,direccion:'usd_a_cop' as const};
function freeze(){vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-05T13:00:00Z'));}
describe('TRM live lookup and dated fallback',()=>{
 it('uses the current live rate in both directions without a rebuild',async()=>{
  freeze();const forward=await prepareTrmInputs(base,async()=>live);
  expect(compute(forward as any).resultado).toBe('$322.119');
  expect(compute(forward as any).trm_usada).toContain('2026-11-05');
  const reverse=await prepareTrmInputs({monto:322119,direccion:'cop_a_usd'},async()=>live);
  expect(compute(reverse as any).resultado).toBe('USD 100,00');
 });
 it('honors a manually entered rate and skips the network',async()=>{
  freeze();const load=vi.fn();const prepared=await prepareTrmInputs({...base,trm:4000},load);
  expect(load).not.toHaveBeenCalled();expect(compute(prepared as any).resultado).toBe('$400.000');
  expect(compute(prepared as any).trm_usada).not.toContain('vigente');
 });
 it('preserves the snapshot value and source date after a fetch failure',async()=>{
  freeze();const prepared=await prepareTrmInputs(base,async()=>{throw Error('offline')});
  const result=compute(prepared as any);
  expect(result.resultado).toBe(compute(base).resultado);
  expect(result.trm_usada).toContain(snapshot.trm.vigenciaDesde.slice(0,10));
  expect(result.trm_usada).toContain('dato guardado');
 });
 it.each([null,{trm:{valor:0,vigenciaDesde:'2026-11-05'}},{trm:{valor:NaN,vigenciaDesde:'2026-11-05'}},{trm:{valor:'3221.19',vigenciaDesde:'2026-11-05'}},{trm:{valor:3221.19,vigenciaDesde:'2026-11-06'}},{trm:{valor:3221.19,vigenciaDesde:'2026-02-30'}},{trm:{valor:3221.19,vigenciaDesde:'2026-10-01'}}])('rejects unusable observations and retains the dated backup: %j',async data=>{
  freeze();expect(validTrm(data)).toBeNull();const prepared=await prepareTrmInputs(base,async()=>data);
  expect(compute(prepared as any).trm_usada).toContain('dato guardado');
 });
 it('uses the Colombian calendar at the UTC day boundary',()=>{
  expect(validTrm(live,new Date('2026-11-05T01:00:00Z'))).toBeNull();
 });
 it('strips supplied internal fields without mutating inputs',async()=>{
  freeze();const input={...base,__trmValue:1,__trmDate:'2099-01-01',__trmLookup:'live'};
  const prepared=await prepareTrmInputs(input,async()=>live);expect(input.__trmValue).toBe(1);
  expect(prepared.__trmValue).toBe(3221.19);expect(prepared.__trmDate).toBe('2026-11-05');
 });
 it('allows the same date as the saved snapshot and avoids week-long stale caching',()=>{
  freeze();expect(validTrm(snapshot)).not.toBeNull();expect(TRM_COMPUTE_CACHE).toBe('public, max-age=120, must-revalidate');
 });
});
