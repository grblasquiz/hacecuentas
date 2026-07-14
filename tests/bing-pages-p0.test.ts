import { describe, expect, it } from 'vitest';
import { compute as computeIess, tasaBiessPorPlazo } from '../src/lib/formulas/prestamo-quirografario-iess-ecuador';
import { compute as computeIrpf } from '../src/lib/formulas/irpf-2026-tramos-espana-nomina';
import { compute as computeUf } from '../src/lib/formulas/uf-uta-utm-chile-conversion-pesos-2026';
import { compute as numeroALetras } from '../src/lib/formulas/conversor-numero-a-letras-cantidad';
import { TOPES, CUOTA_SERVICIOS, CUOTA_BIENES } from '../src/lib/data/monotributo-2026';
import clLive from '../src/data/live/chile.json';

describe('páginas prioritarias de Bing', () => {
  it('usa el tope BIESS de 80 SBU y las tasas oficiales por plazo', () => {
    expect(tasaBiessPorPlazo(6)).toBe(0.065);
    expect(tasaBiessPorPlazo(9)).toBe(0.075);
    expect(tasaBiessPorPlazo(12)).toBe(0.085);
    expect(tasaBiessPorPlazo(48)).toBe(0.11);
    expect(tasaBiessPorPlazo(60)).toBe(0.1299);

    const result = computeIess({ sueldoMensual: 1_200, montoSolicitado: 50_000, plazoMeses: 60 });
    expect(result.montoMaximo).toContain('38.560');
    expect(result.montoAprobado).toContain('38.560');
    expect(result.detalle).toContain('12.99%');
  });

  it('reproduce el caso control del algoritmo de retenciones AEAT 2026', () => {
    const result = computeIrpf({
      salario_bruto: 30_000,
      tipo_contrato: 'general',
      edad: 35,
      num_hijos: 0,
      discapacidad: '0',
      situacion_familiar: 'otras',
      numero_pagas: 12,
    });
    expect(result.ss_trabajador).toBe(1_950);
    expect(result.base_liquidable).toBe(26_050);
    expect(result.tipo_efectivo).toBe(16.42);
    expect(result.cuota_irpf_total).toBe(4_926);
    expect(result.retencion_mensual).toBe(410.5);
    expect(result.tipo_marginal).toBe(15_876);
  });

  it('deja sin retención un salario dentro del límite familiar', () => {
    const result = computeIrpf({
      salario_bruto: 15_876,
      edad: 35,
      num_hijos: 0,
      discapacidad: '0',
      situacion_familiar: 'otras',
    });
    expect(result.tipo_efectivo).toBe(0);
    expect(result.cuota_irpf_total).toBe(0);
  });

  it('convierte con los valores live de Chile sin proyectar fechas', () => {
    const uf = computeUf({ tipo_conversion: 'uf_a_pesos', monto: 100 });
    const utm = computeUf({ tipo_conversion: 'utm_a_pesos', monto: 5 });
    expect(uf.valor_unitario).toBe(40_844.79);
    expect(uf.resultado_conversion).toBe(4_084_479);
    const liveDate = new Intl.DateTimeFormat('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago',
    }).format(new Date(clLive.uf.fecha));
    expect(uf.fecha_vigencia).toContain(liveDate);
    expect(utm.valor_unitario).toBe(71_649);
    expect(utm.resultado_conversion).toBe(358_245);
  });

  it('escribe importes en distintas monedas', () => {
    const usd = numeroALetras({ numero: 1_250.5, formato: 'cheque', moneda: 'USD' });
    const eur = numeroALetras({ numero: 1.01, formato: 'moneda', moneda: 'EUR' });
    expect(usd._insight?.text).toContain('DÓLARES ESTADOUNIDENSES CON 50/100');
    expect(eur._insight?.text).toContain('Un euro con 1 céntimo');
  });

  it('mantiene la tabla de Monotributo vinculada a la fuente única', () => {
    expect(TOPES.K).toBe(108_357_084.05);
    expect(CUOTA_SERVICIOS.K).toBe(1_381_687.9);
    expect(CUOTA_BIENES.K).toBe(600_879.51);
  });
});
