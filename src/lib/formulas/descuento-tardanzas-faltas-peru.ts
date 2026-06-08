/** Descuento por tardanzas y faltas Perú — proporcional al sueldo diario y por minuto. */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  diasFalta?: number;
  minutosTardanzaMes?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const diasFalta = Math.max(0, Number(i.diasFalta) || 0);
  const minutos = Math.max(0, Number(i.minutosTardanzaMes) || 0);
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  // Valor día: el mes laboral se considera de 30 días.
  const valorDia = sueldo / 30;
  // Valor minuto: jornada de 8 horas → 8 × 60 = 480 minutos por día.
  const valorMinuto = sueldo / 30 / 8 / 60;

  const descuentoFaltas = valorDia * diasFalta;
  const descuentoTardanzas = valorMinuto * minutos;
  const descuentoTotal = descuentoFaltas + descuentoTardanzas;
  const sueldoCobrado = Math.max(0, sueldo - descuentoTotal);

  const _insight = {
    title: 'Cuánto te descuentan',
    text: `Con un sueldo de **${fmtPEN(sueldo)}**, ${diasFalta ? `**${diasFalta} día(s)** de falta te descuentan **${fmtPEN(descuentoFaltas)}**` : 'sin faltas'}${minutos ? ` y **${minutos} minuto(s)** de tardanza acumulada te restan **${fmtPEN(descuentoTardanzas)}**` : ''}. Descuento total: **${fmtPEN(descuentoTotal)}**, así que cobrarías **${fmtPEN(sueldoCobrado)}**. El día vale **${fmtPEN(valorDia)}** y el minuto **${fmtPEN(valorMinuto)}** (jornada de 8 horas, mes de 30 días).`,
    tone: descuentoTotal > 0 ? 'warn' : 'good',
    icon: '⏰',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo a cobrar', value: Math.round(sueldoCobrado) },
      { label: 'Descuento faltas', value: Math.round(descuentoFaltas) },
      { label: 'Descuento tardanzas', value: Math.round(descuentoTardanzas) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(descuentoTotal),
    centerLabel: 'Descuento total',
    ariaLabel: `Descuento total de ${fmtPEN(descuentoTotal)} sobre un sueldo de ${fmtPEN(sueldo)}.`,
  };

  return {
    descuentoTotal: fmtPEN(descuentoTotal),
    descuentoFaltas: fmtPEN(descuentoFaltas),
    descuentoTardanzas: fmtPEN(descuentoTardanzas),
    sueldoCobrado: fmtPEN(sueldoCobrado),
    detalle: `Día ${fmtPEN(valorDia)} × ${diasFalta} falta(s) + minuto ${fmtPEN(valorMinuto)} × ${minutos} min = ${fmtPEN(descuentoTotal)} de descuento.`,
    _insight,
    _chart,
  };
}
