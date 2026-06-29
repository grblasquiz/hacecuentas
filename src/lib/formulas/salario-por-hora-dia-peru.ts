/** Salario por hora/día/mes Perú — conversor puro entre las tres bases de pago. */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  monto: number;
  base?: string;        // 'mensual' | 'diario' | 'hora'
  horasDia?: number;    // jornada diaria (default 8)
  diasMes?: number;     // días del mes (default 30)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const base = String(i.base || 'mensual');
  const horasDia = Number(i.horasDia) > 0 ? Number(i.horasDia) : 8;
  const diasMes = Number(i.diasMes) > 0 ? Number(i.diasMes) : 30;
  if (monto <= 0) throw new Error('Ingresá el monto a convertir');

  let porHora = 0, porDia = 0, mensual = 0;
  if (base === 'mensual') {
    mensual = monto;
    porDia = monto / diasMes;
    porHora = porDia / horasDia;
  } else if (base === 'diario') {
    porDia = monto;
    mensual = monto * diasMes;
    porHora = monto / horasDia;
  } else { // hora
    porHora = monto;
    porDia = monto * horasDia;
    mensual = porDia * diasMes;
  }

  const baseLabel = base === 'mensual' ? 'mensual' : base === 'diario' ? 'diario' : 'por hora';

  const _insight = {
    title: 'Tu sueldo en las tres bases',
    text: `Partiendo de un monto **${baseLabel}** de **${fmtPEN(monto)}**, con una jornada de **${horasDia} h/día** y **${diasMes} días/mes**, equivale a **${fmtPEN(porHora)} por hora**, **${fmtPEN(porDia)} por día** y **${fmtPEN(mensual)} al mes**. La jornada legal máxima en Perú es de 8 horas diarias o 48 semanales (DS 007-2002-TR); este es un conversor de referencia y no incluye descuentos de ley.`,
    tone: 'good',
    icon: '🕒',
  };
  const _chart = {
    type: 'bar',
    labels: ['Por hora', 'Por día', 'Mensual'],
    values: [Math.round(porHora * 100) / 100, Math.round(porDia * 100) / 100, Math.round(mensual * 100) / 100],
    prefix: 'S/ ',
    ariaLabel: `Por hora ${fmtPEN(porHora)}, por día ${fmtPEN(porDia)}, mensual ${fmtPEN(mensual)}.`,
  };

  return {
    porHora: fmtPEN(porHora),
    porDia: fmtPEN(porDia),
    mensual: fmtPEN(mensual),
    detalle: `${fmtPEN(monto)} ${baseLabel} → ${fmtPEN(porHora)}/hora · ${fmtPEN(porDia)}/día · ${fmtPEN(mensual)}/mes (jornada ${horasDia} h, ${diasMes} días).`,
    _insight,
    _chart,
  };
}
