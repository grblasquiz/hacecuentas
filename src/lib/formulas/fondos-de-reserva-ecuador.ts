/** Fondos de reserva (Ecuador) — 8,33% del sueldo, desde el 2º año con el mismo empleador. */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  aniosTrabajados: number; // años con el mismo empleador (necesita ≥1 cumplido para tener derecho)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const anios = Math.max(0, Number(i.aniosTrabajados) || 0);
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  // Derecho a fondos de reserva: a partir del 2º año (tras cumplir 1 año completo).
  const tieneDerecho = anios >= 1;
  const tasa = ECUADOR_2026.fondosReserva; // 0.0833
  const mensual = tieneDerecho ? sueldo * tasa : 0;
  const anual = mensual * 12;

  const _insight = {
    title: 'Tus fondos de reserva',
    text: tieneDerecho
      ? `Desde que cumpliste **1 año** con el mismo empleador tenés derecho a los fondos de reserva: **8,33%** de tu sueldo. Sobre **${fmtUSDec(sueldo)}** son **${fmtUSDec(mensual)}** al mes (**${fmtUSDec(anual)}** al año), que podés recibir mensualizados o acumular en el IESS.`
      : `Todavía **no tenés derecho** a fondos de reserva: se generan **a partir del segundo año** con el mismo empleador (después de cumplir 1 año completo). Cuando llegues, recibirías **${fmtUSDec(sueldo * tasa)}** al mes (8,33% del sueldo).`,
    tone: tieneDerecho ? 'good' : 'neutral',
    icon: '🏦',
  };
  const _chart = {
    type: 'gauge',
    value: Math.round(mensual * 100) / 100,
    min: 0,
    max: Math.max(1, Math.round(sueldo * tasa * 100) / 100),
    label: fmtUSDec(mensual),
    ariaLabel: `Fondos de reserva ${fmtUSDec(mensual)} al mes sobre un sueldo de ${fmtUSDec(sueldo)}.`,
  };

  return {
    fondosMensual: fmtUSDec(mensual),
    fondosAnual: fmtUSDec(anual),
    tieneDerecho: tieneDerecho ? 'Sí (≥ 1 año cumplido)' : 'No (aún en el 1er año)',
    detalle: tieneDerecho
      ? `Sueldo ${fmtUSDec(sueldo)} × 8,33% = ${fmtUSDec(mensual)}/mes · ${fmtUSDec(anual)}/año.`
      : `Sin derecho aún: se generan desde el 2º año. Estimado a futuro: ${fmtUSDec(sueldo * tasa)}/mes.`,
    _insight,
    _chart,
  };
}
