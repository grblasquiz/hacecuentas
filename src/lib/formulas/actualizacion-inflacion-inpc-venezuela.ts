/** Actualización por inflación (INPC) — Venezuela 2026.
 *  Fuente del índice: INPC del BCV (inflación anual 2025: 475,28%; 2024: 47,96%).
 *  Alta inflación: conviene complementar con el valor en USD.
 *  Monto actualizado = Monto original × (1 + inflación acumulada / 100). */
import { fmtVES } from '../data/venezuela-2026.ts';

export interface Inputs {
  montoOriginal: number;
  inflacionAcumulada: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal) || 0;
  const inflacion = Number(i.inflacionAcumulada);
  if (monto <= 0) throw new Error('Ingresá el monto original en bolívares');
  if (inflacion === undefined || Number.isNaN(inflacion) || inflacion < 0) {
    throw new Error('Ingresá la inflación acumulada del período (%)');
  }

  const factor = 1 + inflacion / 100;
  const actualizado = monto * factor;
  const incremento = actualizado - monto;
  const perdida = (1 - 1 / factor) * 100;

  const _insight = {
    title: 'Cuánto valen hoy esos bolívares',
    text: `Para igualar el poder de compra de **${fmtVES(monto)}**, hoy necesitás **${fmtVES(actualizado)}** (×${factor.toFixed(4)}). Quien guardó el efectivo perdió **${perdida.toFixed(2)}%** de poder adquisitivo. Con la alta inflación del bolívar, conviene razonar también en dólares (USD).`,
    tone: perdida >= 30 ? 'warn' : perdida >= 10 ? 'neutral' : 'good',
    icon: '💸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Monto original', value: Math.round(monto * 100) / 100 },
      { label: 'Ajuste por inflación', value: Math.round(incremento * 100) / 100 },
    ],
    prefix: 'Bs. ',
    centerValue: fmtVES(actualizado),
    centerLabel: 'Valor actualizado',
    ariaLabel: `El monto original más el ajuste por inflación suman ${fmtVES(actualizado)}.`,
  };

  return {
    montoActualizado: fmtVES(actualizado),
    incremento: fmtVES(incremento),
    perdidaPoderAdquisitivo: `${perdida.toFixed(2)}%`,
    detalle: `Factor = 1 + ${inflacion}/100 = ${factor.toFixed(4)}. Monto actualizado = ${fmtVES(monto)} × ${factor.toFixed(4)} = ${fmtVES(actualizado)}. Incremento = ${fmtVES(incremento)}. Por la alta inflación, contrastá el valor en USD.`,
    _insight,
    _chart,
  };
}
