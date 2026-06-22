/**
 * Calculadora de ISR de personas físicas — República Dominicana 2026 (vertical /do/).
 *
 * Aplica la escala anual progresiva del Art. 296 del Código Tributario sobre la
 * RENTA NETA ANUAL ya determinada (en RD$). Exento hasta RD$416.220; tramos
 * 15% / 20% / 25%. Escala congelada desde 2018 (Resol. DDG-AR1-2026-00001).
 *
 * Reusa el helper `isrAnual` de la data maestra para no duplicar la escala.
 *
 * Data: src/lib/data/republica-dominicana-2026.ts (isrAnual, isr.*).
 */
import { REPUBLICA_DOMINICANA_2026, isrAnual, fmtDOP } from '../data/republica-dominicana-2026';

export interface IsrInputs {
  /** Renta neta anual gravable en RD$ (ya neta de deducciones). */
  rentaAnual?: number | string;
}

export interface IsrOutputs {
  rentaAnual: number;
  impuestoAnual: number;
  impuestoMensual: number;
  neto: number;
  tasaEfectiva: number;
  tasaMarginal: number;
  impuestoTexto: string;
  mensualTexto: string;
  netoTexto: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraIsrRepublicaDominicana(i: IsrInputs): IsrOutputs {
  const d = REPUBLICA_DOMINICANA_2026.isr;
  const renta = Math.max(0, Number(i.rentaAnual) || 0);

  const impuestoAnual = isrAnual(renta);
  const impuestoMensual = impuestoAnual / 12;
  const neto = renta - impuestoAnual;

  // Tasa marginal: tramo en que cae la renta.
  let tasaMarginal = 0;
  for (const t of d.tramos) {
    if (renta > t.desde && renta <= t.hasta) { tasaMarginal = t.tasa * 100; break; }
    if (t.hasta === Infinity && renta > t.desde) tasaMarginal = t.tasa * 100;
  }
  const tasaEfectiva = renta > 0 ? (impuestoAnual / renta) * 100 : 0;
  const exento = renta <= d.exencionAnual;

  const detalle = exento
    ? `Tu renta neta anual (${fmtDOP(renta)}) no supera la exención de ${fmtDOP(d.exencionAnual)}: no pagás ISR.`
    : `ISR = cuota fija del tramo + (${fmtDOP(renta)} − límite inferior) × ${tasaMarginal}% = ${fmtDOP(impuestoAnual)} al año (${fmtDOP(impuestoMensual)}/mes). Tasa efectiva ${tasaEfectiva.toFixed(2)}%.`;

  const _insight = {
    title: exento ? 'Estás dentro de la exención' : `Tu ISR efectivo es ${tasaEfectiva.toFixed(1)}%`,
    text: exento
      ? `Tu renta neta anual de **${fmtDOP(renta)}** no supera la exención de **${fmtDOP(d.exencionAnual)}**, así que **no pagás ISR**.`
      : `Sobre una renta neta anual de **${fmtDOP(renta)}**, el ISR es **${fmtDOP(impuestoAnual)}** al año (**${fmtDOP(impuestoMensual)}/mes**), con un tramo marginal del **${tasaMarginal}%** y una tasa efectiva del **${tasaEfectiva.toFixed(1)}%**. Te quedan **${fmtDOP(neto)}** después del impuesto.`,
    tone: (exento ? 'good' : tasaMarginal >= 25 ? 'warn' : 'info') as 'good' | 'warn' | 'info',
    icon: '🇩🇴',
  };

  // Tabla de tramos del Art. 296.
  const _table = {
    title: 'Escala del ISR de personas físicas (Art. 296)',
    headers: ['Renta neta anual (RD$)', 'Tasa', 'Impuesto'],
    rows: [
      ['Hasta 416.220', '0%', 'Exento'],
      ['416.220 a 624.329', '15%', '15% del excedente de 416.220'],
      ['624.329 a 867.123', '20%', '31.216 + 20% del excedente de 624.329'],
      ['Más de 867.123', '25%', '79.776 + 25% del excedente de 867.123'],
    ],
    note: 'Escala anual congelada desde 2018 (el Art. 327 ordena ajustarla por inflación, pero las leyes de presupuesto lo suspenden). Para retención mensual de salarios, se anualiza la base y se divide ÷12.',
  };

  return {
    rentaAnual: Math.round(renta * 100) / 100,
    impuestoAnual: Math.round(impuestoAnual * 100) / 100,
    impuestoMensual: Math.round(impuestoMensual * 100) / 100,
    neto: Math.round(neto * 100) / 100,
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    tasaMarginal,
    impuestoTexto: fmtDOP(impuestoAnual),
    mensualTexto: fmtDOP(impuestoMensual),
    netoTexto: fmtDOP(neto),
    detalle,
    _insight,
    _table,
  };
}
