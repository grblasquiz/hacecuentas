/**
 * Pensión de montepío del IESS (Ecuador) — viudez y orfandad.
 * ALTO IMPACTO (previsional): estimación orientativa, no reemplaza el cálculo oficial del IESS.
 * Reglas (IESS — Seguro de Pensiones):
 *  - Viudez: 60% de la pensión que recibía o le habría correspondido al causante.
 *  - Orfandad: 20% de la pensión del causante por cada hijo/a con derecho.
 *  - La pensión del grupo familiar no puede superar el 100% de la del causante: si la suma
 *    excede, se reduce proporcionalmente cada cuota. Y no puede ser inferior a la pensión
 *    mínima de jubilación (piso que fija el IESS).
 * Fuente: IESS (iess.gob.ec/es/web/pensionados/montepio). Verificado 2026-07-16.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  pensionCausante: number; // pensión de jubilación que recibía/le correspondía al fallecido
  hayConyuge?: string;     // 'si' | 'no'
  numHijos?: number;       // hijos/as con derecho a orfandad (menores o incapacitados)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const PCT_VIUDEZ = 0.60;
const PCT_ORFANDAD = 0.20;

export function compute(i: Inputs): Outputs {
  const pension = Number(i.pensionCausante) || 0;
  const conyuge = String(i.hayConyuge || 'si') === 'si';
  const hijos = Math.max(0, Math.floor(Number(i.numHijos) || 0));
  if (pension <= 0) throw new Error('Ingresá la pensión de jubilación del causante');

  let viudez = conyuge ? pension * PCT_VIUDEZ : 0;
  let orfandadCada = pension * PCT_ORFANDAD;
  let orfandadTotal = orfandadCada * hijos;
  let grupo = viudez + orfandadTotal;

  // Tope: el grupo familiar no puede exceder el 100% de la pensión del causante.
  let topeado = false;
  if (grupo > pension && grupo > 0) {
    const factor = pension / grupo;
    viudez *= factor;
    orfandadCada *= factor;
    orfandadTotal *= factor;
    grupo = pension;
    topeado = true;
  }

  const _insight = {
    title: 'Pensión de montepío estimada',
    text: `Sobre una pensión del causante de **${fmtUSDec(pension)}**: ${conyuge ? `viudez **${fmtUSDec(viudez)}** (60%)` : 'sin cónyuge'}${hijos > 0 ? ` y orfandad **${fmtUSDec(orfandadCada)}** por cada uno de los ${hijos} hijo(s)` : ''}. El grupo familiar recibe **${fmtUSDec(grupo)}** en total${topeado ? ', reducido proporcionalmente por el tope del 100%' : ''}. No puede ser menor a la pensión mínima de jubilación que fija el IESS.`,
    tone: 'neutral',
    icon: '🕊️',
  };
  const _chart = {
    type: 'donut',
    segments: [
      ...(viudez > 0 ? [{ label: 'Viudez (60%)', value: Math.round(viudez * 100) / 100 }] : []),
      ...(orfandadTotal > 0 ? [{ label: `Orfandad (${hijos} hijo/s)`, value: Math.round(orfandadTotal * 100) / 100 }] : []),
    ],
    ariaLabel: `Viudez ${fmtUSDec(viudez)}, orfandad total ${fmtUSDec(orfandadTotal)}.`,
  };

  return {
    pensionViudez: fmtUSDec(viudez),
    pensionOrfandadCadaHijo: fmtUSDec(orfandadCada),
    pensionGrupoTotal: fmtUSDec(grupo),
    detalle: `Causante ${fmtUSDec(pension)} → viudez ${fmtUSDec(viudez)} (60%)${hijos > 0 ? ` + orfandad ${fmtUSDec(orfandadCada)} × ${hijos}` : ''} = grupo ${fmtUSDec(grupo)}${topeado ? ' (topeado al 100%)' : ''}.`,
    _insight,
    _chart,
  };
}
