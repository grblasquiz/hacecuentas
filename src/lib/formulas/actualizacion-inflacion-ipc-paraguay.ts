/** Actualización por inflación (IPC) — Paraguay 2026.
 *  Fuente del índice: IPC del BCP (inflación 2025: 3,1%, por debajo de la meta del 3,5%).
 *  Monto actualizado = Monto original × (1 + inflación acumulada / 100). */
import { fmtPYG } from '../data/paraguay-2026.ts';

export interface Inputs {
  montoOriginal: number;
  inflacionAcumulada: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal) || 0;
  const inflacion = Number(i.inflacionAcumulada);
  if (monto <= 0) throw new Error('Ingresá el monto original en guaraníes');
  if (inflacion === undefined || Number.isNaN(inflacion) || inflacion < 0) {
    throw new Error('Ingresá la inflación acumulada del período (%)');
  }

  const factor = 1 + inflacion / 100;
  const actualizado = monto * factor;
  const incremento = actualizado - monto;
  const perdida = (1 - 1 / factor) * 100;

  const _insight = {
    title: 'Cuánto valen hoy esos guaraníes',
    text: `Para igualar el poder de compra de **${fmtPYG(monto)}**, hoy necesitás **${fmtPYG(actualizado)}** (×${factor.toFixed(4)}). Quien guardó el efectivo perdió **${perdida.toFixed(2)}%** de poder adquisitivo.`,
    tone: perdida >= 30 ? 'warn' : perdida >= 10 ? 'neutral' : 'good',
    icon: '💸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Monto original', value: Math.round(monto) },
      { label: 'Ajuste por inflación', value: Math.round(incremento) },
    ],
    prefix: 'Gs. ',
    centerValue: fmtPYG(actualizado),
    centerLabel: 'Valor actualizado',
    ariaLabel: `El monto original más el ajuste por inflación suman ${fmtPYG(actualizado)}.`,
  };

  return {
    montoActualizado: fmtPYG(actualizado),
    incremento: fmtPYG(incremento),
    perdidaPoderAdquisitivo: `${perdida.toFixed(2)}%`,
    detalle: `Factor = 1 + ${inflacion}/100 = ${factor.toFixed(4)}. Monto actualizado = ${fmtPYG(monto)} × ${factor.toFixed(4)} = ${fmtPYG(actualizado)}. Incremento = ${fmtPYG(incremento)}.`,
    _insight,
    _chart,
  };
}
