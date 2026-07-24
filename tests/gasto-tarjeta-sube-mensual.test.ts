import { describe, expect, it } from 'vitest';
import { gastoTarjetaSubeMensual } from '../src/lib/formulas/gasto-tarjeta-sube-mensual';

const base = {
  diasViajeMes: 22,
  recorridosPorDia: 2,
  tramo1: 'nacional_0_3',
  tramo2: 'tren_1',
  tramo3: 'ninguno',
  perfilTarifario: 'registrada' as const,
  usarRedSube: 'si' as const,
  saldoActual: 0,
  margenExtra: 10,
};

describe('gastoTarjetaSubeMensual', () => {
  it('aplica 50% de RED SUBE al segundo tramo', () => {
    const result = gastoTarjetaSubeMensual(base);
    expect(result.costoPorRecorrido).toBeCloseTo(742.81 + 190, 2);
    expect(result.viajesMensuales).toBe(88);
    expect(result.gastoMensual).toBeCloseTo((742.81 + 190) * 44, 2);
  });

  it('acumula Tarifa Social después de RED SUBE', () => {
    const result = gastoTarjetaSubeMensual({ ...base, perfilTarifario: 'tarifa_social' });
    expect(result.costoPorRecorrido).toBeCloseTo((742.81 + 190) * 0.45, 2);
    expect(result.ahorroMensual).toBeGreaterThan(0);
  });

  it('no aplica RED SUBE con tarjeta sin registrar', () => {
    const result = gastoTarjetaSubeMensual({ ...base, perfilTarifario: 'sin_registrar' });
    expect(result.costoPorRecorrido).toBeCloseTo(1485.62 + 760, 2);
  });

  it('aplica gratuidad CUD sólo a colectivos nacionales y trenes', () => {
    const eligible = gastoTarjetaSubeMensual({ ...base, perfilTarifario: 'cud' });
    expect(eligible.gastoMensual).toBe(0);

    const mixed = gastoTarjetaSubeMensual({
      ...base,
      tramo1: 'nacional_0_3',
      tramo2: 'subte',
      perfilTarifario: 'cud',
      usarRedSube: 'no',
    });
    expect(mixed.costoPorRecorrido).toBe(972.6);
  });

  it('usa el escalón de subte según viajes mensuales', () => {
    const result = gastoTarjetaSubeMensual({
      ...base,
      tramo1: 'subte',
      tramo2: 'ninguno',
      diasViajeMes: 22,
      recorridosPorDia: 2,
      usarRedSube: 'no',
    });
    expect(result.costoPorRecorrido).toBe(972.6);
    expect(result.viajesMensuales).toBe(44);
  });

  it('resta el saldo actual y agrega el margen elegido', () => {
    const noBalance = gastoTarjetaSubeMensual(base);
    const withBalance = gastoTarjetaSubeMensual({ ...base, saldoActual: 10000 });
    expect(withBalance.cargaRecomendada).toBeCloseTo(Math.max(0, noBalance.cargaRecomendada - 10000), 2);
  });
});
