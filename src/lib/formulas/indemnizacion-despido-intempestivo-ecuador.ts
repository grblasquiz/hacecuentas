/** Indemnización por despido intempestivo (Ecuador, art. 188) + bonificación por desahucio (25% por año). */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldo: number;          // última remuneración mensual
  aniosTrabajados: number; // años completos de servicio
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const anios = Math.max(0, Number(i.aniosTrabajados) || 0);
  if (sueldo <= 0) throw new Error('Ingresá tu última remuneración mensual');

  // Indemnización art. 188: hasta 3 años => 3 sueldos; más de 3 => 1 sueldo por año (mín 3, máx 25).
  let indemnizacion: number;
  if (anios <= 3) indemnizacion = 3 * sueldo;
  else indemnizacion = Math.min(25, anios) * sueldo;

  // Bonificación por desahucio: 25% del último sueldo por cada año de servicio (art. 185).
  const bonificacionDesahucio = 0.25 * sueldo * anios;

  const total = indemnizacion + bonificacionDesahucio;

  const _insight = {
    title: 'Tu indemnización por despido',
    text: `Con **${anios} años** trabajados y un último sueldo de **${fmtUSDec(sueldo)}**, la indemnización por despido intempestivo (art. 188) es **${fmtUSDec(indemnizacion)}**${anios <= 3 ? ' (3 sueldos, el mínimo de ley)' : ` (1 sueldo por año, tope 25)`}. Sumando la bonificación por desahucio (25% por año = **${fmtUSDec(bonificacionDesahucio)}**), el total estimado es **${fmtUSDec(total)}**.`,
    tone: 'neutral',
    icon: '⚖️',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Indemnización (art. 188)', value: Math.round(indemnizacion * 100) / 100 },
      ...(bonificacionDesahucio > 0 ? [{ label: 'Bonif. desahucio (25%/año)', value: Math.round(bonificacionDesahucio * 100) / 100 }] : []),
    ],
    label: fmtUSDec(total),
    ariaLabel: `Indemnización total ${fmtUSDec(total)}.`,
  };

  return {
    total: fmtUSDec(total),
    indemnizacion: fmtUSDec(indemnizacion),
    bonificacionDesahucio: fmtUSDec(bonificacionDesahucio),
    detalle: `${anios <= 3 ? '3 sueldos' : `${Math.min(25, anios)} sueldos`} = ${fmtUSDec(indemnizacion)} + bonif. desahucio (25% × ${anios} años) ${fmtUSDec(bonificacionDesahucio)} = ${fmtUSDec(total)}.`,
    _insight,
    _chart,
  };
}
