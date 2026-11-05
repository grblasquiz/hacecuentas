import { describe,it,expect,vi,afterEach } from 'vitest';
const { readLive }=vi.hoisted(()=>({readLive:vi.fn()}));
vi.mock('../src/lib/fx-live',()=>({readFxLive:readLive}));
vi.mock('../src/data/live/colombia.json',()=>({default:{trm:{valor:3235.59,vigenciaDesde:'2026-11-04T00:00:00.000'}}}));
import { GET } from '../src/pages/api/trm.json';
import { runCompute } from '../src/lib/calc-compute';
afterEach(()=>{vi.useRealTimers();vi.clearAllMocks()});
function freeze(){vi.useFakeTimers();vi.setSystemTime(new Date('2026-11-05T13:00:00Z'))}
describe('public live TRM and compute integration',()=>{
 it('reads the existing D1 service, exposes only rate/date, and computes with them',async()=>{
  freeze();readLive.mockResolvedValue({trm:{valor:3221.19,vigenciaDesde:'2026-11-05T00:00:00.000'},_meta:{internal:'not public'}});
  const r=await GET({} as any);expect(r.status).toBe(200);
  expect(await r.json()).toEqual({trm:{valor:3221.19,vigenciaDesde:'2026-11-05'}});
  const c=await runCompute('calculadora-trm-dolar-hoy-pesos-colombianos',{monto:100,direccion:'usd_a_cop',__trmValue:1,__trmDate:'2099-01-01'});
  expect(c.ok).toBe(true);if(c.ok){expect(c.result.resultado).toBe('$322.119');expect(c.result.trm_usada).toContain('2026-11-05');expect(c.inputs).not.toHaveProperty('__trmValue')}
 });
 it('returns an uncached unavailable status when D1 is absent and preserves a dated compute result',async()=>{
  freeze();readLive.mockResolvedValue(null);const r=await GET({} as any);
  expect(r.status).toBe(503);expect(r.headers.get('Cache-Control')).toBe('no-store');
  const c=await runCompute('calculadora-trm-dolar-hoy-pesos-colombianos',{monto:100,direccion:'usd_a_cop'});
  expect(c.ok).toBe(true);if(c.ok){expect(c.result.resultado).toBe('$323.559');expect(c.result.trm_usada).toContain('dato guardado')}
 });
});
