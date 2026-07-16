/**
 * Patente de Rodados (SUCIVE) — Uruguay 2026.
 *
 * La patente es un tributo anual departamental unificado por el SUCIVE (Sistema
 * Único de Cobro de Ingresos Vehiculares). Se calcula como:
 *     patente anual = AFORO × alícuota de la categoría
 * El AFORO es el valor fiscal de referencia que fija SUCIVE por marca/modelo/año,
 * NO el precio de mercado ni lo que se pagó por el vehículo.
 *
 * Alícuotas 2026 (Texto Ordenado del SUCIVE 2026, Congreso de Intendentes):
 *   - Automóvil 0 km:                 5,00% del aforo (valor sin IVA)
 *   - Automóvil usado:                4,50% del aforo
 *   - Auto eléctrico 0 km:            3,00% del aforo
 *   - Auto eléctrico usado:           2,25% del aforo
 *   - Moto 500cc o más:               5,00% (0 km) / 4,50% (usada)
 *   - Camión:                         1,30% del aforo
 *
 * Nota: el pago contado anual tiene descuento (varía por departamento, ~10%) y la
 * patente puede abonarse en cuotas. Los valores exactos de aforo y los descuentos
 * los publica cada Intendencia / SUCIVE.
 */
import { fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Aforo (valor fiscal SUCIVE) del vehículo, en pesos. */
  aforo: number;
  /** Categoría del vehículo. */
  categoria?: string;
}

export interface Outputs {
  patenteAnual: string;
  alicuota: string;
  cuotaEstimada: string;
  pagoContado: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

const ALICUOTAS: Record<string, { tasa: number; label: string }> = {
  'auto-0km': { tasa: 0.05, label: 'Automóvil 0 km' },
  'auto-usado': { tasa: 0.045, label: 'Automóvil usado' },
  'auto-electrico-0km': { tasa: 0.03, label: 'Auto eléctrico 0 km' },
  'auto-electrico-usado': { tasa: 0.0225, label: 'Auto eléctrico usado' },
  moto: { tasa: 0.05, label: 'Moto 500cc o más' },
  camion: { tasa: 0.013, label: 'Camión' },
};
const DESCUENTO_CONTADO = 0.1; // descuento aproximado por pago contado anual (varía por departamento)
const CUOTAS = 10; // SUCIVE admite hasta 10 cuotas

export function compute(i: Inputs): Outputs {
  const aforo = Math.max(0, Number(i.aforo) || 0);
  const key = String(i.categoria || 'auto-usado');
  const cat = ALICUOTAS[key] || ALICUOTAS['auto-usado'];

  const patente = aforo * cat.tasa;
  const contado = patente * (1 - DESCUENTO_CONTADO);
  const cuota = patente / CUOTAS;

  const detalle =
    `${cat.label}: aforo ${fmtUYU(aforo)} × ${(cat.tasa * 100).toFixed(2)}% = ${fmtUYU(patente)} de patente anual. ` +
    `En ${CUOTAS} cuotas serían ${fmtUYU(cuota)} c/u; con descuento por pago contado (~${DESCUENTO_CONTADO * 100}%), ${fmtUYU(contado)}.`;

  return {
    patenteAnual: fmtUYU(patente),
    alicuota: `${(cat.tasa * 100).toFixed(2)}% (${cat.label})`,
    cuotaEstimada: fmtUYU(cuota),
    pagoContado: fmtUYU(contado),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🚗',
      text: `Con un aforo de **${fmtUYU(aforo)}** (${cat.label.toLowerCase()}), la patente anual ronda **${fmtUYU(patente)}** (${(cat.tasa * 100).toFixed(2)}% del aforo). Pagando contado al inicio del año bajás a unos **${fmtUYU(contado)}**.`,
      tone: 'info' as const,
    },
    _table: {
      title: 'Patente estimada según aforo y categoría (alícuotas SUCIVE 2026)',
      headers: ['Aforo ($U)', 'Auto usado (4,5%)', 'Auto 0 km (5%)', 'Eléctrico usado (2,25%)', 'Camión (1,3%)'],
      rows: [300000, 600000, 900000, 1500000, 2500000].map((v) => [
        fmtUYU(v),
        fmtUYU(v * 0.045),
        fmtUYU(v * 0.05),
        fmtUYU(v * 0.0225),
        fmtUYU(v * 0.013),
      ]),
      note: 'La patente se calcula sobre el AFORO (valor fiscal SUCIVE), no sobre el precio de compra. Alícuotas del Texto Ordenado del SUCIVE 2026. Los aforos y descuentos por pago contado los fija cada Intendencia / SUCIVE.',
    },
  };
}
