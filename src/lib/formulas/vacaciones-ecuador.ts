/** Vacaciones (Ecuador) — 15 días por año trabajado; +1 día por cada año desde el 6º (máx 15 adicionales).
 *  valorDía = sueldo mensual ÷ 30. Cálculo proporcional según meses trabajados. */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  aniosTrabajados: number;
  mesesTrabajados?: number; // meses del año en curso (proporcional), 0-12
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const anios = Math.max(0, Math.floor(Number(i.aniosTrabajados) || 0));
  // '' → default 12 (año completo) sólo si el campo viene vacío/0.
  const mesesInput = Number(i.mesesTrabajados);
  const meses = Math.max(0, Math.min(12, Number.isFinite(mesesInput) && mesesInput > 0 ? mesesInput : 12));
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  // Días adicionales: 1 por cada año a partir del 6º, con tope de 15 adicionales.
  const diasAdicionales = anios > 5 ? Math.min(15, anios - 5) : 0;
  const diasAnuales = 15 + diasAdicionales;
  const valorDia = sueldo / 30;

  // Vacaciones devengadas proporcionalmente a los meses trabajados en el periodo.
  const diasProporcionales = diasAnuales * (meses / 12);
  const valorVacaciones = diasProporcionales * valorDia;
  const valorVacacionesAnual = diasAnuales * valorDia;

  const _insight = {
    title: 'Tus vacaciones',
    text: `Con **${anios} años** de antigüedad te corresponden **${diasAnuales} días** de vacaciones al año (15 base${diasAdicionales > 0 ? ` + ${diasAdicionales} adicionales` : ''}). El valor del día es **${fmtUSDec(valorDia)}** (sueldo ÷ 30). Por **${meses} meses** trabajados, las vacaciones devengadas equivalen a **${fmtUSDec(valorVacaciones)}** (${diasProporcionales.toFixed(1)} días).`,
    tone: 'good',
    icon: '🏖️',
  };
  const _chart = {
    type: 'gauge',
    value: Math.round(valorVacaciones * 100) / 100,
    min: 0,
    max: Math.round(valorVacacionesAnual * 100) / 100,
    label: fmtUSDec(valorVacaciones),
    ariaLabel: `Vacaciones devengadas ${fmtUSDec(valorVacaciones)} de un total anual de ${fmtUSDec(valorVacacionesAnual)}.`,
  };

  return {
    diasAnuales: String(diasAnuales) + ' días',
    valorVacaciones: fmtUSDec(valorVacaciones),
    valorVacacionesAnual: fmtUSDec(valorVacacionesAnual),
    valorDia: fmtUSDec(valorDia),
    diasProporcionales: diasProporcionales.toFixed(1) + ' días',
    detalle: `${diasAnuales} días/año (valor día ${fmtUSDec(valorDia)}) · ${meses} meses → ${diasProporcionales.toFixed(1)} días = ${fmtUSDec(valorVacaciones)}.`,
    _insight,
    _chart,
  };
}
