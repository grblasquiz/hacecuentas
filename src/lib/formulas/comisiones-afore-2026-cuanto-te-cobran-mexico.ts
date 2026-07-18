/**
 * Comisiones AFORE 2026 — cuánto te cobran de tu saldo y cuánto te cuesta a
 * 1, 10 y 30 años. En 2026 nueve afores cobran 0.54% anual sobre saldo y
 * PENSIONISSSTE 0.52% (CONSAR, promedio del sistema 0.538%). Proyección anual:
 * saldo × (1 + rendimiento − comisión) + aportación, comparada contra el mismo
 * saldo sin comisión. Constantes desde src/lib/data/mexico-2026.ts.
 */
import { AFORE_COMISIONES_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  saldoActual: number;
  aportacionAnual?: number;      // aportaciones nuevas por año (patrón + voluntarias)
  rendimientoAnualPct?: number;  // % anual esperado antes de comisión (editable)
  comisionPct?: number;          // % anual sobre saldo (default 0.54)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Proyecta el saldo año a año con rendimiento r y comisión c sobre saldo. */
function proyectar(saldo0: number, aporte: number, r: number, c: number, anios: number): number {
  let saldo = saldo0;
  for (let a = 0; a < anios; a++) {
    saldo = saldo * (1 + r - c) + aporte;
  }
  return saldo;
}

export function compute(i: Inputs): Outputs {
  const saldo = num(i.saldoActual, 0);
  if (!(saldo > 0)) throw new Error('Ingresa el saldo actual de tu AFORE');
  const aporte = Math.max(0, num(i.aportacionAnual, 0));
  const r = Math.max(0, num(i.rendimientoAnualPct, 7)) / 100;
  const c = Math.max(0, num(i.comisionPct, AFORE_COMISIONES_2026.restoAfores * 100)) / 100;

  const horizontes = [1, 10, 30] as const;
  const resultados = horizontes.map((anios) => {
    const conComision = proyectar(saldo, aporte, r, c, anios);
    const sinComision = proyectar(saldo, aporte, r, 0, anios);
    return { anios, conComision: round2(conComision), sinComision: round2(sinComision), costo: round2(sinComision - conComision) };
  });

  const [a1, a10, a30] = resultados;
  const comisionAnio1 = round2(saldo * c);
  const pctComido30 = round2((a30.costo / a30.sinComision) * 100);

  const detalle = `Comisión ${ (c * 100).toFixed(2) }% anual sobre saldo: este año pagas ~${fmtMXN(comisionAnio1)}. Costo acumulado (vs el mismo saldo sin comisión, rendimiento ${(r * 100).toFixed(1)}%): ${fmtMXN(a1.costo)} en 1 año · ${fmtMXN(a10.costo)} en 10 años · ${fmtMXN(a30.costo)} en 30 años (${pctComido30.toFixed(1)}% de tu saldo final).`;

  const _insight = {
    title: `La comisión te cuesta ${fmtMXN(a30.costo)} a 30 años`,
    text: `Un ${(c * 100).toFixed(2)}% "chiquito" sobre **todo tu saldo, todos los años**, se compone: con ${fmtMXN(saldo)} de saldo${aporte > 0 ? ` y ${fmtMXN(aporte)} de aportaciones anuales` : ''}, la comisión te come **${fmtMXN(a1.costo)} el primer año**, **${fmtMXN(a10.costo)} en 10 años** y **${fmtMXN(a30.costo)} en 30 años** — el **${pctComido30.toFixed(1)}%** de tu saldo final proyectado. En 2026 nueve afores cobran **0.54%** y PENSIONISSSTE **0.52%** (tope CONSAR): con comisiones casi empatadas, elige afore por su **rendimiento neto** en el comparativo de CONSAR, no solo por la comisión.`,
    tone: 'warn',
    icon: '📉',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['1 año', '10 años', '30 años'],
    values: [Math.round(a1.costo), Math.round(a10.costo), Math.round(a30.costo)],
    prefix: '$',
    ariaLabel: `Costo acumulado de la comisión: ${fmtMXN(a1.costo)} en 1 año, ${fmtMXN(a10.costo)} en 10 años y ${fmtMXN(a30.costo)} en 30 años.`,
  };

  return {
    comisionEsteAnio: `${fmtMXN(comisionAnio1)} (${(c * 100).toFixed(2)}% de tu saldo)`,
    costo10Anios: `${fmtMXN(a10.costo)} acumulados`,
    costo30Anios: `${fmtMXN(a30.costo)} (${pctComido30.toFixed(1)}% de tu saldo final)`,
    saldoProyectado30: `${fmtMXN(a30.conComision)} con comisión · ${fmtMXN(a30.sinComision)} sin comisión`,
    detalle,
    _insight,
    _chart,
  };
}
