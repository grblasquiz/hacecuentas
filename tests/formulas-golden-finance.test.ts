/**
 * Golden-value tests de fórmulas financieras YMYL de alto tráfico que NO estaban
 * cubiertas en formulas.test.ts. Valores exactos calculados a mano contra la ley
 * vigente — un cambio silencioso del resultado (ej. alícuota mal) rompe el test.
 *
 * Correr: npm test
 */
import { describe, it, expect } from 'vitest';
import { impuestoDebitosCreditos } from '../src/lib/formulas/impuesto-debitos-creditos';

// ---------------------------------------------------------------------------
// Impuesto a los débitos y créditos (al cheque) — Ley 25.413
// Alícuota 0,6% por movimiento unilateral; 1,2% débito+crédito.
// 33% del impuesto es pago a cuenta de Ganancias (inscriptos).
// ---------------------------------------------------------------------------
describe('impuestoDebitosCreditos (Ley 25.413)', () => {
  it('$1.000.000 ambos (1,2%) → impuesto $12.000, computable $3.960', () => {
    const r = impuestoDebitosCreditos({ monto: 1_000_000, tipo: 'ambos' });
    expect(r.impuesto).toBe(12_000);            // 1.000.000 × 0,012
    expect(r.alicuotaAplicada).toBe(1.2);
    expect(r.total).toBe(1_012_000);
    expect(r.computableContraGanancias).toBe(3_960); // 12.000 × 0,33
  });

  it('$1.000.000 solo débito (0,6%) → impuesto $6.000', () => {
    const r = impuestoDebitosCreditos({ monto: 1_000_000, tipo: 'debito' });
    expect(r.impuesto).toBe(6_000);
    expect(r.alicuotaAplicada).toBe(0.6);
    expect(r.computableContraGanancias).toBe(1_980); // 6.000 × 0,33
  });

  it('solo crédito aplica la misma alícuota unilateral que débito (0,6%)', () => {
    const deb = impuestoDebitosCreditos({ monto: 500_000, tipo: 'debito' });
    const cred = impuestoDebitosCreditos({ monto: 500_000, tipo: 'credito' });
    expect(cred.impuesto).toBe(deb.impuesto);
    expect(cred.impuesto).toBe(3_000); // 500.000 × 0,006
  });

  it('monto 0 o inválido lanza error (no devuelve 0 silencioso)', () => {
    expect(() => impuestoDebitosCreditos({ monto: 0, tipo: 'ambos' })).toThrow();
    expect(() => impuestoDebitosCreditos({ monto: NaN, tipo: 'ambos' })).toThrow();
  });
});
