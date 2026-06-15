/**
 * Impuesto Predial municipal Perú 2026 — escala progresiva acumulativa sobre el autovalúo.
 * Base legal: Art. 11-13 y 19 del TUO de la Ley de Tributación Municipal (DS 156-2004-EF,
 *   base Decreto Legislativo 776). UIT 2026 = S/ 5.500 (DS 301-2025-EF).
 * Tramos: hasta 15 UIT 0,2% · de 15 a 60 UIT 0,6% · más de 60 UIT 1,0%.
 * Impuesto mínimo = 0,6% de la UIT (S/ 33 en 2026).
 * Deducción opcional: pensionista/adulto mayor (>60) con vivienda única descuenta hasta 50 UIT del autovalúo (Art. 19).
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  autovaluo: number;          // valor del autovalúo del predio en S/ (suma de predios en el distrito)
  esPensionista?: string;     // 'si' aplica deducción de 50 UIT (pensionista / adulto mayor, vivienda única)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const autovaluo = Number(i.autovaluo) || 0;
  const pensionista = String(i.esPensionista || 'no') === 'si';
  if (autovaluo <= 0) throw new Error('Ingresá el autovalúo del predio (en S/)');

  const uit = PERU_2026.uit;                    // 5.500
  const { tramos, minimoUit, deduccionPensionistaUit } = PERU_2026.predial;

  // Deducción de 50 UIT para pensionista / adulto mayor con vivienda única (Art. 19).
  const deduccion = pensionista ? deduccionPensionistaUit * uit : 0;
  let base = Math.max(0, autovaluo - deduccion);

  // Escala progresiva acumulativa por tramos en UIT.
  let impuesto = 0;
  let anterior = 0;
  const desglose: { tramo: string; tasa: string; baseTramo: number; impuestoTramo: number }[] = [];
  for (const t of tramos) {
    const limite = t.hastaUit === Infinity ? Infinity : t.hastaUit * uit;
    const ancho = limite - anterior;
    const enTramo = Math.min(Math.max(0, base - anterior), ancho);
    if (enTramo <= 0) { anterior = limite; continue; }
    const impuestoTramo = enTramo * t.tasa;
    impuesto += impuestoTramo;
    const limStr = t.hastaUit === Infinity ? `más de ${anterior / uit} UIT` : `hasta ${t.hastaUit} UIT`;
    desglose.push({
      tramo: limStr,
      tasa: (t.tasa * 100).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + '%',
      baseTramo: enTramo,
      impuestoTramo,
    });
    anterior = limite;
    if (base <= anterior) break;
  }

  // Impuesto mínimo: 0,6% de la UIT (Art. 13). Solo se aplica si hay base gravable (> 0).
  const minimo = minimoUit * uit;              // 33
  const impuestoFinal = base > 0 ? Math.max(impuesto, minimo) : 0;
  const aplicoMinimo = base > 0 && impuesto < minimo;

  const cuotaTrimestral = impuestoFinal / 4;
  const tasaEfectiva = autovaluo > 0 ? (impuestoFinal / autovaluo) * 100 : 0;

  const desgloseTexto = aplicoMinimo
    ? `Impuesto calculado por tramos: ${fmtPEN(impuesto)}, pero se aplica el mínimo legal de ${fmtPEN(minimo)} (0,6% de la UIT).`
    : desglose.map((d) => `${d.tramo} (${d.tasa}): ${fmtPEN(d.impuestoTramo)}`).join(' · ');

  const _insight = {
    title: 'Tu impuesto predial 2026',
    text: pensionista
      ? `Sobre un autovalúo de **${fmtPEN(autovaluo)}**, como pensionista/adulto mayor descontás **${fmtPEN(deduccion)}** (50 UIT) y la base gravable queda en **${fmtPEN(base)}**. El impuesto predial anual es **${fmtPEN(impuestoFinal)}** (tasa efectiva ${tasaEfectiva.toLocaleString('es-PE', { maximumFractionDigits: 3 })}%). Podés pagarlo al contado hasta fin de febrero o en **4 cuotas trimestrales de ${fmtPEN(cuotaTrimestral)}**.`
      : `Sobre un autovalúo de **${fmtPEN(autovaluo)}**, el impuesto predial anual 2026 es **${fmtPEN(impuestoFinal)}** (tasa efectiva ${tasaEfectiva.toLocaleString('es-PE', { maximumFractionDigits: 3 })}%). Podés pagarlo al contado hasta fin de febrero o en **4 cuotas trimestrales de ${fmtPEN(cuotaTrimestral)}**. Se paga a la municipalidad **distrital** donde está el predio.`,
    tone: 'neutral',
    icon: '🏘️',
  };

  // Doughnut: composición del impuesto por tramo (o autovalúo vs impuesto si es mínimo).
  const _chart = aplicoMinimo
    ? {
        type: 'doughnut' as const,
        slices: [
          { label: 'Autovalúo gravable', value: Math.round(base) },
          { label: 'Impuesto mínimo (0,6% UIT)', value: Math.round(impuestoFinal) },
        ].filter((s) => s.value > 0),
        prefix: 'S/ ',
        centerValue: fmtPEN(impuestoFinal),
        centerLabel: 'Predial anual',
        ariaLabel: `Impuesto predial anual de ${fmtPEN(impuestoFinal)} (mínimo legal).`,
      }
    : {
        type: 'doughnut' as const,
        slices: desglose.map((d) => ({
          label: `Tramo ${d.tasa}`,
          value: Math.round(d.impuestoTramo),
        })).filter((s) => s.value > 0),
        prefix: 'S/ ',
        centerValue: fmtPEN(impuestoFinal),
        centerLabel: 'Predial anual',
        ariaLabel: `Impuesto predial anual de ${fmtPEN(impuestoFinal)} desglosado por tramos.`,
      };

  return {
    impuestoAnual: fmtPEN(impuestoFinal),
    cuotaTrimestral: fmtPEN(cuotaTrimestral),
    baseGravable: fmtPEN(base),
    deduccionAplicada: pensionista ? fmtPEN(deduccion) : 'S/ 0',
    tasaEfectiva: tasaEfectiva.toLocaleString('es-PE', { maximumFractionDigits: 3 }) + '%',
    detalle: desgloseTexto,
    _insight,
    _chart,
  };
}
