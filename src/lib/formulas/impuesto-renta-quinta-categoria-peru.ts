/** Impuesto a la Renta de 5ta categoría Perú — deducción 7 UIT y tramos progresivos. */
import { PERU_2026, impuestoRenta5taAnual, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoMensual: number;     // sueldo bruto mensual (se anualiza ×14)
  ingresoAnual?: number;     // opcional: ingreso anual directo (tiene prioridad si > 0)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const anualDirecto = Number(i.ingresoAnual) || 0;
  if (sueldo <= 0 && anualDirecto <= 0) throw new Error('Ingresá tu sueldo mensual o tu ingreso anual');

  // 14 sueldos = 12 mensuales + 2 gratificaciones (julio y diciembre).
  const ingresoAnual = anualDirecto > 0 ? anualDirecto : sueldo * 14;
  const deduccion = PERU_2026.renta5ta.deduccionUit * PERU_2026.uit; // 7 UIT
  const baseImponible = Math.max(0, ingresoAnual - deduccion);
  const impuestoAnual = impuestoRenta5taAnual(ingresoAnual);
  const impuestoMensual = impuestoAnual / 12;

  // Determinar el tramo marginal alcanzado (en UIT acumuladas sobre la base imponible)
  let tramoTasa = 0;
  if (baseImponible > 0) {
    const baseEnUit = baseImponible / PERU_2026.uit;
    for (const t of PERU_2026.renta5ta.tramos) {
      tramoTasa = t.tasa;
      if (baseEnUit <= t.hastaUit) break;
    }
  }
  const tasaEfectiva = ingresoAnual > 0 ? impuestoAnual / ingresoAnual : 0;

  const _insight = {
    title: impuestoAnual > 0 ? 'Tu impuesto a la renta de 5ta' : 'No pagás renta de 5ta',
    text: impuestoAnual > 0
      ? `Con un ingreso anual de **${fmtPEN(ingresoAnual)}**, tras descontar las **7 UIT exentas** (${fmtPEN(deduccion)}) tu base imponible es **${fmtPEN(baseImponible)}**. El impuesto anual es **${fmtPEN(impuestoAnual)}** (tasa marginal ${(tramoTasa * 100).toFixed(0)}%, efectiva ${(tasaEfectiva * 100).toFixed(1)}%), es decir **${fmtPEN(impuestoMensual)}** por mes.`
      : `Con un ingreso anual de **${fmtPEN(ingresoAnual)}** no superás las **7 UIT exentas** (${fmtPEN(deduccion)}), así que **no pagás Impuesto a la Renta de 5ta categoría**.`,
    tone: impuestoAnual > 0 ? 'warn' : 'good',
    icon: '🧾',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Exento (7 UIT)', value: Math.round(Math.min(deduccion, ingresoAnual)) },
      { label: 'Base gravada (neta)', value: Math.round(Math.max(0, baseImponible - impuestoAnual)) },
      { label: 'Impuesto', value: Math.round(impuestoAnual) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(impuestoAnual),
    centerLabel: 'Impuesto anual',
    ariaLabel: `Impuesto a la renta de 5ta anual de ${fmtPEN(impuestoAnual)} sobre un ingreso de ${fmtPEN(ingresoAnual)}.`,
  };

  return {
    impuestoAnual: fmtPEN(impuestoAnual),
    impuestoMensual: fmtPEN(impuestoMensual),
    baseImponible: fmtPEN(baseImponible),
    tramo: impuestoAnual > 0 ? `Tasa marginal ${(tramoTasa * 100).toFixed(0)}% · tasa efectiva ${(tasaEfectiva * 100).toFixed(1)}%` : 'Sin impuesto (bajo 7 UIT)',
    detalle: `Ingreso anual ${fmtPEN(ingresoAnual)} − 7 UIT (${fmtPEN(deduccion)}) = base ${fmtPEN(baseImponible)} · impuesto ${fmtPEN(impuestoAnual)}/año.`,
    _insight,
    _chart,
  };
}
