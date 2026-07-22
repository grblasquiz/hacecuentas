/** Actualización por inflación (IPC) — Ecuador 2026.
 *  Fuente del índice: IPC del INEC (inflación 2025 cerca de 1,9%; economía dolarizada).
 *  Monto actualizado = Monto original × (1 + inflación acumulada / 100). */
import { fmtUSDec } from '../data/ecuador-2026.ts';
import live from '../../data/live/ecuador.json';

/** Dato vivo: bloque `ipc` de src/data/live/ecuador.json (IPC del INEC).
 *  Fallback al valor hardcodeado (cierre 2025) si el live no trae el dato. */
const IPC_LIVE: any = (live as any)?.ipc ?? null;
const REF_INTERANUAL: number =
  typeof IPC_LIVE?.variacionInteranual === 'number' ? IPC_LIVE.variacionInteranual : 1.9;
const REF_PERIODO: string = typeof IPC_LIVE?.periodo === 'string' ? IPC_LIVE.periodo : '2025-12';
const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function refPeriodoTexto(): string {
  const [y, m] = REF_PERIODO.split('-').map(Number);
  return MESES_ES[(m || 12) - 1] + ' ' + y;
}
const fmtPct = (n: number) =>
  n.toLocaleString('es', { maximumFractionDigits: 2 });

export interface Inputs {
  montoOriginal: number;
  inflacionAcumulada: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal) || 0;
  const inflacion = Number(i.inflacionAcumulada);
  if (monto <= 0) throw new Error('Ingresá el monto original en dólares');
  if (inflacion === undefined || Number.isNaN(inflacion) || inflacion < 0) {
    throw new Error('Ingresá la inflación acumulada del período (%)');
  }

  const factor = 1 + inflacion / 100;
  const actualizado = monto * factor;
  const incremento = actualizado - monto;
  const perdida = (1 - 1 / factor) * 100;

  const _insight = {
    title: 'Cuánto valen hoy esos dólares',
    text: `Para igualar el poder de compra de **${fmtUSDec(monto)}**, hoy necesitás **${fmtUSDec(actualizado)}** (×${factor.toFixed(4)}). Quien guardó el efectivo perdió **${perdida.toFixed(2)}%** de poder adquisitivo. Referencia: inflación interanual a ${refPeriodoTexto()}: **${fmtPct(REF_INTERANUAL)}%**.`,
    tone: perdida >= 30 ? 'warn' : perdida >= 10 ? 'neutral' : 'good',
    icon: '💸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Monto original', value: Math.round(monto * 100) / 100 },
      { label: 'Ajuste por inflación', value: Math.round(incremento * 100) / 100 },
    ],
    prefix: '$',
    centerValue: fmtUSDec(actualizado),
    centerLabel: 'Valor actualizado',
    ariaLabel: `El monto original más el ajuste por inflación suman ${fmtUSDec(actualizado)}.`,
  };

  return {
    montoActualizado: fmtUSDec(actualizado),
    incremento: fmtUSDec(incremento),
    perdidaPoderAdquisitivo: `${perdida.toFixed(2)}%`,
    inflacionInteranualHoy: `${fmtPct(REF_INTERANUAL)}% (a ${refPeriodoTexto()})`,
    detalle: `Factor = 1 + ${inflacion}/100 = ${factor.toFixed(4)}. Monto actualizado = ${fmtUSDec(monto)} × ${factor.toFixed(4)} = ${fmtUSDec(actualizado)}. Incremento = ${fmtUSDec(incremento)}.`,
    _insight,
    _chart,
  };
}
