/** Actualización por inflación (IPC) — Perú 2026.
 *  Fuente del índice: IPC de Lima Metropolitana, INEI (inflación 2025: 1,51%).
 *  Monto actualizado = Monto original × (1 + inflación acumulada / 100). */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  montoOriginal: number;
  inflacionAcumulada: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal) || 0;
  const inflacion = Number(i.inflacionAcumulada);
  if (monto <= 0) throw new Error('Ingresá el monto original en soles');
  if (inflacion === undefined || Number.isNaN(inflacion) || inflacion < 0) {
    throw new Error('Ingresá la inflación acumulada del período (%)');
  }

  const factor = 1 + inflacion / 100;
  const actualizado = monto * factor;
  const incremento = actualizado - monto;
  const perdida = (1 - 1 / factor) * 100;

  const _insight = {
    title: 'Cuánto valen hoy esos soles',
    text: `Para igualar el poder de compra de **${fmtPEN(monto)}**, hoy necesitás **${fmtPEN(actualizado)}** (×${factor.toFixed(4)}). Quien guardó el efectivo perdió **${perdida.toFixed(2)}%** de poder adquisitivo.`,
    tone: perdida >= 30 ? 'warn' : perdida >= 10 ? 'neutral' : 'good',
    icon: '💸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Monto original', value: Math.round(monto * 100) / 100 },
      { label: 'Ajuste por inflación', value: Math.round(incremento * 100) / 100 },
    ],
    prefix: 'S/ ',
    centerValue: fmtPEN(actualizado),
    centerLabel: 'Valor actualizado',
    ariaLabel: `El monto original más el ajuste por inflación suman ${fmtPEN(actualizado)}.`,
  };

  return {
    montoActualizado: fmtPEN(actualizado),
    incremento: fmtPEN(incremento),
    perdidaPoderAdquisitivo: `${perdida.toFixed(2)}%`,
    detalle: `Factor = 1 + ${inflacion}/100 = ${factor.toFixed(4)}. Monto actualizado = ${fmtPEN(monto)} × ${factor.toFixed(4)} = ${fmtPEN(actualizado)}. Incremento = ${fmtPEN(incremento)}.`,
    _insight,
    _chart,
  };
}
