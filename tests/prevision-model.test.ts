import { describe,it,expect } from 'vitest';
import { retirementEstimate, ucapBudget, survivorDistribution } from '../src/lib/hubs/prevision-model';
import { ANSES_VIGENTE } from '../src/lib/data/anses-vigente';
import { HABER_MINIMO, PUAM } from '../src/lib/hubs/cuando-jubilo';
import { HABER_MINIMO as pensionMinimum } from '../src/lib/hubs/pensiones';
describe('proyección previsional con supuestos explícitos',()=>{
 it('compensa exceso de edad y agrega sólo aportes futuros declarados',()=>{
 expect(retirementEstimate(58,22.5,'f').monthsToWait).toBe(68);
 expect(retirementEstimate(58,22.5,'f',false).monthsToWait).toBe(204);
 expect(retirementEstimate(64,28,'f',false).monthsToWait).toBe(0);
 expect(retirementEstimate(58,30,'f').monthsToWait).toBe(24);
 });
 it('rechaza historia imposible y no convierte faltantes en cero',()=>{
 expect(()=>retirementEstimate(20,10,'f')).toThrow();
 expect(()=>retirementEstimate(NaN,0,'m')).toThrow();
 });
 it('presupuesta UCAP sobre base mínima, no MOPRE ni cuotas del haber',()=>{
 const r=ucapBudget(58,'f',12,149592.45);expect(r.unit).toBe(43381.81);expect(r.total).toBe(520581.72);
 expect(r.eligibleAge).toBe(true);expect(ucapBudget(60,'f',12,149592.45).eligibleAge).toBe(false);
 expect(ucapBudget(55,'m',12,149592.45).eligibleAge).toBe(true);
 expect(ucapBudget(65,'m',12,149592.45).eligibleAge).toBe(false);
 expect(()=>ucapBudget(58,'f',1.5,149592.45)).toThrow();
 });
 it('distribuye viudez, hijos y orfandad con tope proporcional',()=>{
 expect(survivorDistribution(850000,true,0).totalAmount).toBe(595000);
 expect(survivorDistribution(850000,true,1).childAmount).toBe(170000);
 expect(survivorDistribution(850000,false,1).totalPct).toBe(70);
 expect(survivorDistribution(850000,false,2).childPct).toBe(45);
 const r=survivorDistribution(850000,true,3);expect(r.totalAmount).toBe(850000);expect(r.spousePct/r.childPct).toBeCloseTo(2.5);
 expect(()=>survivorDistribution(850000,false,0)).toThrow();expect(()=>survivorDistribution(-5,true,0)).toThrow();
 });
 it('ambos hubs usan la referencia mensual oficial compartida',()=>{
 expect(HABER_MINIMO).toBe(ANSES_VIGENTE.haberMinimo);expect(pensionMinimum).toBe(HABER_MINIMO);expect(PUAM).toBe(ANSES_VIGENTE.puam);
 });
});
