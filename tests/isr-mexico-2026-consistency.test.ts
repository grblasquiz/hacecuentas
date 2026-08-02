import { describe, expect, it } from 'vitest';
import { compute } from '../src/lib/formulas/isr-mexico-2026-tarifa-mensual-empleado';
import { ISR_MENSUAL } from '../src/lib/hubs/mx/sueldo-neto';
import {
  MEXICO_2026,
  cuotaImssObreroMensual,
  isrMensual2026,
  subsidioEmpleoMensual2026,
} from '../src/lib/data/mexico-2026';

describe('ISR mensual México 2026', () => {
  it('usa la fuente única oficial para ISR, subsidio e IMSS', () => {
    const result = compute({ salario_bruto_mensual: 20_000, aplicar_subsidio: true });

    expect(result.isr_bruto).toBe(isrMensual2026(20_000));
    expect(result.isr_neto).toBe(2_383.65);
    expect(result.subsidio_empleo).toBe(0);
    expect(result.aportacion_imss).toBe(cuotaImssObreroMensual(20_000));
    expect(result.neto_en_mano).toBe(17_104.14);
    expect(result.tramo_aplicado).toBe(21.36);
  });

  it('aplica el subsidio fijo sólo hasta el tope legal', () => {
    expect(subsidioEmpleoMensual2026(11_492.66)).toBe(536.22);
    expect(subsidioEmpleoMensual2026(11_492.67)).toBe(0);

    const eligible = compute({ salario_bruto_mensual: 10_000, aplicar_subsidio: true });
    expect(eligible.subsidio_empleo).toBe(536.22);
    expect(eligible.isr_neto).toBe(192.8);
  });

  it('mantiene la tabla del hub alineada con la fuente fiscal única', () => {
    expect(ISR_MENSUAL).toEqual(
      MEXICO_2026.isrTarifaMensual.map(([desde, hasta, cuota, tasa]) => ({
        desde,
        hasta: Number.isFinite(hasta) ? hasta : null,
        cuota,
        tasa,
      })),
    );
  });
});
