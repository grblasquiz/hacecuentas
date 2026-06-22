/**
 * Calculadora de ITBIS (IVA dominicano) — República Dominicana 2026.
 *
 * ITBIS = Impuesto sobre Transferencias de Bienes Industrializados y Servicios
 * (Ley 253-12). Tasa general 18%; tasa reducida 16% (yogurt, mantequilla, café,
 * grasas y aceites comestibles, azúcares, cacao/chocolate). Exentos 0% (canasta
 * básica, medicinas, salud, educación, transporte, alquiler de vivienda).
 *
 * Dos modos:
 *  - AGREGAR: el monto ingresado es la base (sin ITBIS) → total = base × (1 + tasa).
 *  - EXTRAER: el monto ingresado YA incluye ITBIS → base = monto ÷ (1 + tasa).
 *
 * Data: src/lib/data/republica-dominicana-2026.ts (itbis 18%, itbisReducido 16%).
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP } from '../data/republica-dominicana-2026';

export interface ItbisInputs {
  /** Monto en RD$ (la base si modo "agregar", el total si modo "extraer"). */
  monto?: number | string;
  /** "agregar" (sumar ITBIS) | "extraer" (sacar ITBIS de un precio con impuesto). */
  modo?: string;
  /** "18" (general) | "16" (reducida). */
  tasa?: string;
}

export interface ItbisOutputs {
  base: number;
  itbis: number;
  total: number;
  baseTexto: string;
  itbisTexto: string;
  totalTexto: string;
  tasaTexto: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraItbisRepublicaDominicana(i: ItbisInputs): ItbisOutputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const modo = i.modo === 'extraer' ? 'extraer' : 'agregar';
  const tasaPct = i.tasa === '16'
    ? REPUBLICA_DOMINICANA_2026.itbisReducido
    : REPUBLICA_DOMINICANA_2026.itbis;
  const tasaLabel = Math.round(tasaPct * 100) + '%';

  let base: number;
  let total: number;
  if (modo === 'extraer') {
    // El monto ingresado ya incluye ITBIS → desglosar.
    total = monto;
    base = monto / (1 + tasaPct);
  } else {
    // El monto es la base → sumar ITBIS.
    base = monto;
    total = monto * (1 + tasaPct);
  }
  const itbis = total - base;

  const detalle = modo === 'extraer'
    ? `${fmtDOP(total)} con ITBIS incluido = ${fmtDOP(base)} de base + ${fmtDOP(itbis)} de ITBIS (${tasaLabel}).`
    : `${fmtDOP(base)} + ${tasaLabel} de ITBIS (${fmtDOP(itbis)}) = ${fmtDOP(total)}.`;

  const _insight = {
    title: modo === 'extraer' ? `El ITBIS dentro del precio es ${fmtDOP(itbis)}` : `El ITBIS suma ${fmtDOP(itbis)}`,
    text: modo === 'extraer'
      ? `De un precio de **${fmtDOP(total)}** con ITBIS incluido, **${fmtDOP(base)}** es el valor del bien o servicio y **${fmtDOP(itbis)}** corresponde al ITBIS del **${tasaLabel}**. Para sacarlo se divide entre **${(1 + tasaPct).toFixed(2)}**, no se resta el ${tasaLabel} (ese es el error más común).`
      : `Sobre una base de **${fmtDOP(base)}**, el ITBIS del **${tasaLabel}** agrega **${fmtDOP(itbis)}**, dejando un precio final de **${fmtDOP(total)}**.`,
    tone: 'info' as const,
    icon: '🧾',
  };

  // Tabla comparativa del MISMO monto al 18% y al 16%, según el modo.
  const filas = [
    { etiqueta: 'Tasa general', t: REPUBLICA_DOMINICANA_2026.itbis },
    { etiqueta: 'Tasa reducida', t: REPUBLICA_DOMINICANA_2026.itbisReducido },
  ].map((r) => {
    let b: number, tot: number;
    if (modo === 'extraer') { tot = monto; b = monto / (1 + r.t); }
    else { b = monto; tot = monto * (1 + r.t); }
    return [
      `${r.etiqueta} (${Math.round(r.t * 100)}%)`,
      fmtDOP(b),
      fmtDOP(tot - b),
      fmtDOP(tot),
    ];
  });

  const _table = {
    title: modo === 'extraer'
      ? `Desglose de ITBIS sobre ${fmtDOP(monto)} (precio con impuesto incluido)`
      : `ITBIS a agregar sobre una base de ${fmtDOP(monto)}`,
    headers: ['Tasa', 'Base sin ITBIS', 'ITBIS', 'Total con ITBIS'],
    rows: filas,
    note: 'Tasa general 18% (Ley 253-12). La reducida 16% aplica a un grupo acotado de alimentos (café, azúcares, aceites comestibles, cacao, yogurt, mantequilla). La canasta básica, medicinas, salud, educación y alquiler de vivienda están exentos (0%).',
  };

  return {
    base: Math.round(base * 100) / 100,
    itbis: Math.round(itbis * 100) / 100,
    total: Math.round(total * 100) / 100,
    baseTexto: fmtDOP(base),
    itbisTexto: fmtDOP(itbis),
    totalTexto: fmtDOP(total),
    tasaTexto: tasaLabel,
    detalle,
    _insight,
    _table,
  };
}
