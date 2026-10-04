import { describe, expect, it } from 'vitest';
import { divideSteps, multiplySteps, parseDecimal } from '../src/lib/tools/arithmetic-steps';
describe('operaciones escolares exactas', () => {
  it('conserva ceros intermedios en 1005 ÷ 5', () => {
    const r = divideSteps('1005', '5'); expect(r.quotient).toBe('201'); expect(r.steps.map(s => s.quotientDigit)).toEqual(['0','2','0','1']); expect(r.verified).toBe(true);
  });
  it('trunca 7 ÷ 12 y verifica con resto exacto', () => {
    const r = divideSteps('7','12',6); expect(r.quotient).toBe('0,583333'); expect(r.exact).toBe(false); expect(r.residual).toBe('0,000004'); expect(r.verified).toBe(true);
  });
  it('normaliza ambos operandos decimales', () => { const r = divideSteps('12,5','0,25'); expect(r.quotient).toBe('50'); expect(r.normalizedDividend).toBe('1250'); expect(r.normalizedDivisor).toBe('25'); expect(r.verified).toBe(true); });
  it('muestra el cero decimal intermedio', () => { expect(divideSteps('1','16',4).quotient).toBe('0,0625'); });
  it('distingue resto entero y residual tras precisión', () => { const r = divideSteps('7','12',0); expect(r.quotient).toBe('0'); expect(r.integerRemainder).toBe('7'); expect(r.residual).toBe('7'); expect(r.verified).toBe(true); });
  it('calcula cero con divisor válido y rechaza cero divisor', () => { expect(divideSteps('0','17').quotient).toBe('0'); expect(() => divideSteps('7','0,00')).toThrow('cero'); });
  it('no introduce error binario en 1,2 × 0,03', () => { const r = multiplySteps('1,2','0,03'); expect(r.result).toBe('0,036'); expect(r.scale).toBe(3); expect(r.verified).toBe(true); });
  it('explica acarreo y conserva posiciones de cero', () => { const r = multiplySteps('99','101'); expect(r.partials.map(p=>p.value)).toEqual(['99','0','9900']); expect(r.result).toBe('9999'); expect(multiplySteps('99','9').partials[0].carries[0]).toContain('llevá 8'); });
  it('valida formato, magnitud y precisión antes de procesar', () => {
    for (const s of ['','-1','1e3','1.000,2','0xFF','1 000','1,','1.2.3','1234567890123','0.1234567']) expect(()=>parseDecimal(s)).toThrow();
    for (const n of [-1,13,1.5,NaN]) expect(()=>divideSteps('1','3',n)).toThrow();
  });
  it('verifica 400 divisiones y multiplicaciones independientes', () => {
    for(let a=0;a<20;a++) for(let b=1;b<=20;b++) {
      const r=divideSteps(String(a),String(b),4); expect(r.verified).toBe(true); expect(Number(r.quotient.replace(',','.'))).toBeLessThanOrEqual(a/b); expect(r.steps.every(s=>BigInt(s.remainder)<BigInt(b))).toBe(true);
      expect(multiplySteps(String(a),String(b)).result).toBe(String(a*b));
    }
  });
});
