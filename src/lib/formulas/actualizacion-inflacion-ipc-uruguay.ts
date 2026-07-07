/** Actualización por inflación (IPC) — Uruguay 2026.
 *  Fuente del índice: IPC del INE (inflación 2025: 3,65%, dentro del rango meta del BCU 3-6%).
 *  Monto actualizado = Monto original × (1 + inflación acumulada / 100). */
import { fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  montoOriginal: number;
  inflacionAcumulada: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal) || 0;
  const inflacion = Number(i.inflacionAcumulada);
  if (monto <= 0) throw new Error('Ingresá el monto original en pesos uruguayos');
  if (inflacion === undefined || Number.isNaN(inflacion) || inflacion < 0) {
    throw new Error('Ingresá la inflación acumulada del período (%)');
  }

  const factor = 1 + inflacion / 100;
  const actualizado = monto * factor;
  const incremento = actualizado - monto;
  const perdida = (1 - 1 / factor) * 100;

  const _insight = {
    title: 'Cuánto valen hoy esos pesos',
    text: `Para igualar el poder de compra de **${fmtUYU(monto)}**, hoy necesitás **${fmtUYU(actualizado)}** (×${factor.toFixed(4)}). Quien guardó el efectivo perdió **${perdida.toFixed(2)}%** de poder adquisitivo.`,
    tone: perdida >= 30 ? 'warn' : perdida >= 10 ? 'neutral' : 'good',
    icon: '💸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Monto original', value: Math.round(monto * 100) / 100 },
      { label: 'Ajuste por inflación', value: Math.round(incremento * 100) / 100 },
    ],
    prefix: '$U ',
    centerValue: fmtUYU(actualizado),
    centerLabel: 'Valor actualizado',
    ariaLabel: `El monto original más el ajuste por inflación suman ${fmtUYU(actualizado)}.`,
  };

  return {
    montoActualizado: fmtUYU(actualizado),
    incremento: fmtUYU(incremento),
    perdidaPoderAdquisitivo: `${perdida.toFixed(2)}%`,
    detalle: `Factor = 1 + ${inflacion}/100 = ${factor.toFixed(4)}. Monto actualizado = ${fmtUYU(monto)} × ${factor.toFixed(4)} = ${fmtUYU(actualizado)}. Incremento = ${fmtUYU(incremento)}.`,
    _insight,
    _chart,
  };
}
