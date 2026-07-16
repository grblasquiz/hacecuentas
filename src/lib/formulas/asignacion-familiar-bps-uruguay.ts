/**
 * Asignación Familiar — BPS Uruguay 2026 (régimen contributivo, Ley 15.084).
 *
 * Prestación mensual por hijo/a menor a cargo de trabajadores en actividad. El
 * monto por hijo depende del INGRESO del hogar:
 *   - Ingreso del hogar hasta el límite 1  → $1.347 por hijo.
 *   - Ingreso entre el límite 1 y el 2     → $674 por hijo (la mitad).
 *   - Ingreso mayor al límite 2            → sin derecho a esta prestación.
 *
 * Límites 2026 (BPS, enero 2026) para hogares con hasta 2 hijos:
 *   - Límite 1: $50.502   ·   Límite 2: $84.688
 * Por cada hijo adicional a partir del 3º, cada límite sube 1,2338 BPC.
 *
 * (Distinta de la AFAM del Plan de Equidad —no contributiva, para hogares
 * vulnerables—, cuyos montos son mayores y se detallan en la guía.)
 *
 * BPC importado de src/lib/data/uruguay-2026.ts.
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Ingreso mensual del hogar, en pesos. */
  ingresoHogar: number;
  /** Cantidad de hijos menores a cargo. */
  cantidadHijos: number;
}

export interface Outputs {
  montoTotal: string;
  montoPorHijo: string;
  tramo: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

const MONTO_TRAMO1 = 1347; // $ por hijo (ingreso hasta límite 1) — BPS ene-2026
const MONTO_TRAMO2 = 674; // $ por hijo (ingreso entre límite 1 y 2)
const LIMITE1_BASE = 50502; // hasta 2 hijos
const LIMITE2_BASE = 84688; // hasta 2 hijos
const EXTRA_POR_HIJO_BPC = 1.2338; // suba de cada límite por hijo adicional (3º en adelante)

export function compute(i: Inputs): Outputs {
  const ingreso = Math.max(0, Number(i.ingresoHogar) || 0);
  const hijos = Math.max(0, Math.floor(Number(i.cantidadHijos) || 0));
  const bpc = URUGUAY_2026.bpc;

  const extra = Math.max(0, hijos - 2) * EXTRA_POR_HIJO_BPC * bpc;
  const limite1 = LIMITE1_BASE + extra;
  const limite2 = LIMITE2_BASE + extra;

  let porHijo = 0;
  let tramo = 'Sin derecho (ingreso mayor al límite)';
  if (hijos > 0 && ingreso <= limite1) {
    porHijo = MONTO_TRAMO1;
    tramo = 'Tramo 1 (monto completo)';
  } else if (hijos > 0 && ingreso <= limite2) {
    porHijo = MONTO_TRAMO2;
    tramo = 'Tramo 2 (medio monto)';
  }

  const total = porHijo * hijos;

  const detalle =
    `${hijos} hijo(s), ingreso del hogar ${fmtUYU(ingreso)}. Límites: ${fmtUYU(limite1)} (tramo 1) y ${fmtUYU(limite2)} (tramo 2). ` +
    (porHijo > 0
      ? `Corresponde ${fmtUYU(porHijo)} por hijo → total ${fmtUYU(total)} al mes.`
      : `El ingreso supera el límite: no corresponde asignación contributiva.`);

  return {
    montoTotal: fmtUYU(total),
    montoPorHijo: fmtUYU(porHijo),
    tramo,
    detalle,
    _insight: {
      type: 'highlight',
      icon: '👶',
      text:
        porHijo > 0
          ? `Con ${hijos} hijo(s) y un ingreso de **${fmtUYU(ingreso)}**, cobrás **${fmtUYU(porHijo)}** por hijo: **${fmtUYU(total)}** al mes (${tramo.toLowerCase()}).`
          : `Con un ingreso de **${fmtUYU(ingreso)}** superás el límite de ${fmtUYU(limite2)} para ${hijos} hijo(s): no corresponde la asignación familiar contributiva. Si el hogar es vulnerable, puede aplicar la AFAM del Plan de Equidad.`,
      tone: porHijo > 0 ? 'good' : 'info',
    },
    _table: {
      title: 'Asignación familiar contributiva por hijo — BPS 2026',
      headers: ['Ingreso del hogar', 'Monto por hijo', 'Con 1 hijo', 'Con 2 hijos', 'Con 3 hijos'],
      rows: [
        [`Hasta ${fmtUYU(limite1)}`, fmtUYU(MONTO_TRAMO1), fmtUYU(MONTO_TRAMO1), fmtUYU(MONTO_TRAMO1 * 2), fmtUYU(MONTO_TRAMO1 * 3)],
        [`${fmtUYU(limite1)} a ${fmtUYU(limite2)}`, fmtUYU(MONTO_TRAMO2), fmtUYU(MONTO_TRAMO2), fmtUYU(MONTO_TRAMO2 * 2), fmtUYU(MONTO_TRAMO2 * 3)],
        [`Más de ${fmtUYU(limite2)}`, fmtUYU(0), fmtUYU(0), fmtUYU(0), fmtUYU(0)],
      ],
      note: `Montos BPS enero 2026: ${fmtUYU(MONTO_TRAMO1)} (tramo 1) y ${fmtUYU(MONTO_TRAMO2)} (tramo 2) por hijo. Límites para hasta 2 hijos; cada hijo adicional (3º en adelante) sube ambos límites 1,2338 BPC. Régimen contributivo (Ley 15.084). La AFAM del Plan de Equidad tiene montos mayores y otros requisitos.`,
    },
  };
}
