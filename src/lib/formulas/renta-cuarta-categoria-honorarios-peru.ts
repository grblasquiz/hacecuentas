/** Renta de 4ta categoría Perú — Retención 8% en recibos por honorarios y suspensión. */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  montoReciboMensual: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.montoReciboMensual) || 0;
  if (monto <= 0) throw new Error('Ingresá el monto de tu recibo por honorarios');

  // Retención de 8% sobre el recibo por honorarios (renta de 4ta categoría).
  const tasaRetencion = 0.08;
  const retencion = monto * tasaRetencion;
  const netoRecibo = monto - retencion;

  // Suspensión de retenciones: SUNAT la otorga cuando la proyección anual de
  // ingresos por 4ta (o 4ta+5ta) no supera el umbral que publica cada enero,
  // ligado a las 7 UIT exentas de renta de 5ta más el margen de la deducción de
  // 4ta. Usamos un criterio conservador de ~10 UIT (7 UIT + 3 UIT) de ingresos
  // anuales; SUNAT publica el monto mensual exacto del recibo en su web.
  const uit = PERU_2026.uit;
  const umbralAnual = 10 * uit;       // tope conservador de ingresos anuales por 4ta (≈ 7 + 3 UIT)
  const umbralMensual = umbralAnual / 12;
  const proyeccionAnual = monto * 12;
  const puedeSuspender = proyeccionAnual <= umbralAnual;

  const _insight = {
    title: puedeSuspender ? 'Podés pedir la suspensión de retenciones' : 'Te retienen el 8%',
    text: puedeSuspender
      ? `Tu recibo de **${fmtPEN(monto)}** proyecta **${fmtPEN(proyeccionAnual)}** al año, por debajo del umbral de **${fmtPEN(umbralAnual)}** (28 UIT). Podés tramitar la **suspensión de retenciones de 4ta categoría** en SUNAT y cobrar el recibo completo sin que te descuenten el 8%.`
      : `Por un recibo de **${fmtPEN(monto)}** te retienen **${fmtPEN(retencion)}** (el **8%**) y cobrás **${fmtPEN(netoRecibo)}**. Tu proyección anual (**${fmtPEN(proyeccionAnual)}**) supera el umbral de **${fmtPEN(umbralAnual)}**, así que la retención aplica.`,
    tone: puedeSuspender ? 'good' : 'info',
    icon: '🧾',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto que cobrás', value: Math.round(netoRecibo) },
      { label: 'Retención (8%)', value: Math.round(retencion) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(retencion),
    centerLabel: 'Retención',
    ariaLabel: `Retención de 4ta categoría: ${fmtPEN(retencion)} sobre un recibo de ${fmtPEN(monto)}.`,
  };

  return {
    retencion: fmtPEN(retencion),
    netoRecibo: fmtPEN(netoRecibo),
    suspension: puedeSuspender ? 'Sí, podés solicitarla' : 'No (supera el umbral)',
    detalle: `Recibo ${fmtPEN(monto)} · retención 8% = ${fmtPEN(retencion)} · proyección anual ${fmtPEN(proyeccionAnual)} vs umbral ${fmtPEN(umbralAnual)} (${fmtPEN(umbralMensual)}/mes).`,
    _insight,
    _chart,
  };
}
