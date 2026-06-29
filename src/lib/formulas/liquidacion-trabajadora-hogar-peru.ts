/** Liquidación de trabajadora del hogar Perú — Ley 31047 (régimen general): CTS + gratificación + vacaciones truncas. */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldo: number;
  mesesTrabajados: number;
  diasResiduales?: number; // días sueltos además de los meses completos (0-30)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const meses = Math.max(0, Number(i.mesesTrabajados) || 0);
  const dias = Math.max(0, Math.min(30, Number(i.diasResiduales) || 0));
  if (sueldo <= 0) throw new Error('Ingresá el sueldo mensual');
  if (meses <= 0 && dias <= 0) throw new Error('Ingresá los meses trabajados');

  // Fracción de período en años (meses + días/30, sobre 12 meses).
  const fraccionAnual = (meses + dias / 30) / 12;

  // Ley 31047 equipara al régimen laboral general:
  //  - CTS: 1 sueldo por año → proporcional. Incluye 1/6 de gratificación en la base computable.
  //  - Gratificación trunca: 1 sueldo por semestre → proporcional al año (1 sueldo/año).
  //  - Vacaciones truncas: 30 días (1 sueldo) por año → proporcional.
  const remComputableCts = sueldo + sueldo / 6; // base CTS con 1/6 de gratificación
  const cts = remComputableCts * fraccionAnual;
  const grati = sueldo * fraccionAnual;       // 1 sueldo por año, prorrateado
  const vacaciones = sueldo * fraccionAnual;  // 30 días por año, prorrateado
  const total = cts + grati + vacaciones;

  const periodoTxt = `${meses} mes${meses === 1 ? '' : 'es'}${dias ? ` y ${dias} días` : ''}`;

  const _insight = {
    title: 'Liquidación de la trabajadora del hogar',
    text: `Por **${periodoTxt}** con un sueldo de **${fmtPEN(sueldo)}**, la Ley 31047 (régimen general) da: **CTS ${fmtPEN(cts)}** (base con 1/6 de gratificación), **gratificación trunca ${fmtPEN(grati)}** y **vacaciones truncas ${fmtPEN(vacaciones)}**. Total a liquidar: **${fmtPEN(total)}**.`,
    tone: 'good',
    icon: '🧹',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'CTS', value: Math.round(cts) },
      { label: 'Gratificación', value: Math.round(grati) },
      { label: 'Vacaciones', value: Math.round(vacaciones) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Liquidación total',
    ariaLabel: `Liquidación: CTS ${fmtPEN(cts)}, gratificación ${fmtPEN(grati)}, vacaciones ${fmtPEN(vacaciones)}, total ${fmtPEN(total)}.`,
  };

  return {
    cts: fmtPEN(cts),
    grati: fmtPEN(grati),
    vacaciones: fmtPEN(vacaciones),
    total: fmtPEN(total),
    detalle: `${periodoTxt} (${fraccionAnual.toLocaleString('de-DE', { maximumFractionDigits: 4 })} de año) · CTS ${fmtPEN(cts)} + grati ${fmtPEN(grati)} + vacaciones ${fmtPEN(vacaciones)} = ${fmtPEN(total)}.`,
    _insight,
    _chart,
  };
}
