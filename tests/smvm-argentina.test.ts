import { describe, expect, it } from 'vitest';
import { calcularDesempleoGeneral } from '../src/lib/data/desempleo-general';
import {
  DESEMPLEO_PISO, DESEMPLEO_TECHO, SMVM_CRONOGRAMA, SMVM_MENSUAL, SMVM_RESOLUCION, SMVM_VIGENTE,
} from '../src/lib/data/smvm-ar-2026';
import { buildSalarioMinimoArgentina, buildSalarioMinimoLatam, toCsv, toJson } from '../src/lib/datos-export';
import { asignacionDesempleoSeguroPrestacionAnses } from '../src/lib/formulas/asignacion-desempleo-seguro-prestacion-anses';
import { salarioMinimo } from '../src/lib/formulas/salario-minimo';
import { fondoDesempleoAnsesMontoTiempo } from '../src/lib/formulas/fondo-desempleo-anses-monto-tiempo';

describe('cronograma oficial del SMVM argentino', () => {
  it('reproduce los ocho tramos publicados en la Resolución 4/2026', () => {
    const tramos = SMVM_CRONOGRAMA.filter(({ norma }) => norma === '4/2026');
    expect(tramos.map(({ periodo, mensual, hora }) => [periodo, mensual, hora])).toEqual([
      ['2026-09', 383800, 1919],
      ['2026-10', 391200, 1956],
      ['2026-11', 398800, 1994],
      ['2026-12', 406400, 2032],
      ['2027-01', 414200, 2071],
      ['2027-02', 422000, 2110],
      ['2027-03', 429600, 2148],
      ['2027-04', 437000, 2185],
    ]);
  });

  it('estima la jornada reducida mensual sin superar el piso de jornada completa', () => {
    expect(salarioMinimo({ horasSemana: 24 }).smvmProporcionalMensual).toBe(SMVM_MENSUAL / 2);
    expect(salarioMinimo({ horasSemana: 47 }).smvmProporcionalMensual).toBeLessThan(SMVM_MENSUAL);
    expect(salarioMinimo({ horasSemana: 48 }).smvmProporcionalMensual).toBe(SMVM_MENSUAL);
  });

  it('publica el mismo período en las descargas argentinas y regionales', () => {
    const exportacion = buildSalarioMinimoArgentina();
    expect(toJson(exportacion)).toMatchObject({
      vigente_desde: SMVM_VIGENTE.periodo,
      smvm_mensual_vigente: SMVM_MENSUAL,
      smvm_hora_vigente: SMVM_VIGENTE.hora,
      seguro_desempleo: { piso: DESEMPLEO_PISO, techo: DESEMPLEO_TECHO },
    });
    expect(toCsv(exportacion)).toContain(
      `SMVM por hora (jornalizados),${SMVM_VIGENTE.periodo},${SMVM_VIGENTE.hora},ARS/hora,${SMVM_RESOLUCION}`,
    );
    expect(buildSalarioMinimoLatam().data.find(({ iso }) => iso === 'AR')).toMatchObject({
      valor_mensual: SMVM_MENSUAL, norma: SMVM_RESOLUCION,
    });
  });
});

describe('prestación general por desempleo', () => {
  it('aplica el 75% al mejor sueldo neto y el piso y techo a todas las cuotas', () => {
    expect(DESEMPLEO_PISO).toBe(SMVM_MENSUAL / 2);
    expect(DESEMPLEO_TECHO).toBe(SMVM_MENSUAL);
    expect(calcularDesempleoGeneral(100_000, 5)).toMatchObject({ duracion: 0, inicial: 0, total: 0 });
    expect(calcularDesempleoGeneral(100_000, 36)).toMatchObject({
      base: 75_000, duracion: 12, inicial: DESEMPLEO_PISO, total: DESEMPLEO_PISO * 12,
    });
    expect(calcularDesempleoGeneral(900_000, 36)).toMatchObject({ base: 675_000, duracion: 12, inicial: DESEMPLEO_TECHO });
    expect(calcularDesempleoGeneral(900_000, 36).total).toBeCloseTo(DESEMPLEO_TECHO * 4 * (1 + 0.85 + 0.70), 2);
  });

  it('mantiene ambas fórmulas que consumen los valores vigentes', () => {
    const asignacion = asignacionDesempleoSeguroPrestacionAnses({ ultimoSueldoBruto: 900_000, mesesCotizados: 24 });
    const fondo = fondoDesempleoAnsesMontoTiempo({ sueldoPromedio: 900_000, mesesTrabajados: 24 });
    expect(asignacion.monto).toBe(fondo.montoMensual);
    expect(asignacion.meses).toBe('8');
    expect(fondo.duracion).toBe('8 meses');
  });
});
