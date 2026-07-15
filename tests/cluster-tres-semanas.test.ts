import { describe, expect, it } from 'vitest';
import { tiempoParaAhorrar } from '../src/lib/formulas/tiempo-para-ahorrar';
import { cancelacionAnticipadaPrestamo } from '../src/lib/formulas/cancelacion-anticipada-prestamo';
import { refinanciacionPrestamo } from '../src/lib/formulas/refinanciacion-prestamo';
import { amortizacionPrestamoFrancesAleman } from '../src/lib/formulas/amortizacion-prestamo-frances-aleman';
import { porcentaje } from '../src/lib/formulas/porcentaje';
import { vacaciones } from '../src/lib/formulas/vacaciones';

describe('cluster de ahorro y crédito', () => {
  it('calcula un plazo de ahorro determinista sin rendimiento', () => {
    const r = tiempoParaAhorrar({ meta: 1_000_000, ahorroInicial: 100_000, aporte: 100_000 });
    expect(r.mesesNecesarios).toBe(9);
    expect(r.totalAportado).toBe(1_000_000);
    expect(r.interesesGanados).toBe(0);
  });

  it('una cancelación total elimina las cuotas y ahorra intereses', () => {
    const r = cancelacionAnticipadaPrestamo({
      saldoPendiente: 1_000_000,
      tna: 60,
      cuotasRestantes: 12,
      pagoAnticipado: 1_000_000,
    });
    expect(r.cuotaNueva).toBe(0);
    expect(r.mesesAhorrados).toBe(12);
    expect(r.interesesAhorrados).toBeGreaterThan(0);
  });

  it('el sistema americano devuelve el capital en la última cuota', () => {
    const r = amortizacionPrestamoFrancesAleman({ monto: 1_000_000, tna: 60, plazoMeses: 12, sistema: 'americano' });
    const rows = r._table.rows;
    expect(rows[0][3]).toBe('0');
    expect(rows.at(-1)[3]).toBe('1.000.000');
    expect(r.totalIntereses).toBe(600_000);
  });

  it('una refinanciación más cara no se presenta como ahorro', () => {
    const r = refinanciacionPrestamo({
      saldoActual: 1_000_000,
      tasaActual: 40,
      mesesActuales: 12,
      tasaNueva: 80,
      mesesNuevos: 24,
      gastosNuevo: 100_000,
    });
    expect(r.ahorroTotal).toBeLessThan(0);
  });
});

describe('casos límite corregidos', () => {
  it('compone descuentos sucesivos en lugar de sumarlos', () => {
    const r = porcentaje({ modo: 'descuentos-sucesivos', valor1: 100, valor2: 20, valor3: 10 });
    expect(r.resultado).toBe('72');
  });

  it('respeta los límites exactos de antigüedad del art. 150 LCT', () => {
    const base = { mesesTrabajados: 12, sueldoBruto: 1_000_000 };
    expect(vacaciones({ ...base, antiguedadAnios: 5 }).diasCorridos).toBe(14);
    expect(vacaciones({ ...base, antiguedadAnios: 10 }).diasCorridos).toBe(21);
    expect(vacaciones({ ...base, antiguedadAnios: 20 }).diasCorridos).toBe(28);
    expect(vacaciones({ ...base, antiguedadAnios: 21 }).diasCorridos).toBe(35);
  });
});
