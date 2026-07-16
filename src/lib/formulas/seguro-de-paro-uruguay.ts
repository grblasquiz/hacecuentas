/**
 * Seguro de Paro (Subsidio por Desempleo) — BPS Uruguay 2026.
 *
 * Para trabajadores MENSUALES despedidos, el subsidio es un porcentaje DECRECIENTE
 * del promedio nominal de los últimos 6 meses:
 *     Mes 1: 66%   Mes 2: 57%   Mes 3: 50%   Mes 4: 45%   Mes 5: 42%   Mes 6: 40%
 * (Ley 15.180 y modificativas, régimen general de causal despido.)
 *
 * Topes 2026 (en BPC, BPC = $6.864):
 *   - Tope máximo mensual = 8 BPC = $54.912.
 *   - Mínimo mensual = 0,5 BPC = $3.432 (piso legal del subsidio).
 * Complemento: +20% si tiene cónyuge/concubino, hijos u otros familiares a cargo
 * cuyos ingresos no superen 1 BPC.
 *
 * BPC importado de src/lib/data/uruguay-2026.ts (fuente única).
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Promedio nominal de los últimos 6 meses de remuneración (pesos). */
  promedio6meses: number;
  /** ¿Tiene familiares a cargo? (activa el complemento del 20%). */
  familiaACargo?: string;
}

export interface Outputs {
  subsidioMes1: string;
  totalSeisMeses: string;
  tope: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

const PORCENTAJES = [0.66, 0.57, 0.5, 0.45, 0.42, 0.4]; // meses 1..6
const TOPE_BPC = 8; // 8 BPC
const MIN_BPC = 0.5; // 0,5 BPC

export function compute(i: Inputs): Outputs {
  const promedio = Math.max(0, Number(i.promedio6meses) || 0);
  const conFamilia = String(i.familiaACargo || 'no') === 'si';
  const bpc = URUGUAY_2026.bpc;
  const tope = TOPE_BPC * bpc; // $54.912
  const piso = MIN_BPC * bpc; // $3.432
  const complemento = conFamilia ? 1.2 : 1.0;

  const montoMes = (mes: number): number => {
    if (promedio <= 0) return 0;
    let m = promedio * PORCENTAJES[mes] * complemento;
    m = Math.min(m, tope); // tope 8 BPC
    m = Math.max(m, piso); // piso 0,5 BPC
    return m;
  };

  const meses = PORCENTAJES.map((_, idx) => montoMes(idx));
  const total = meses.reduce((a, b) => a + b, 0);

  const detalle =
    `Sobre un promedio de ${fmtUYU(promedio)}: mes 1 ${fmtUYU(meses[0])} (66%), mes 2 ${fmtUYU(meses[1])} (57%), ` +
    `mes 3 ${fmtUYU(meses[2])} (50%), mes 4 ${fmtUYU(meses[3])} (45%), mes 5 ${fmtUYU(meses[4])} (42%), mes 6 ${fmtUYU(meses[5])} (40%). ` +
    `Tope mensual ${fmtUYU(tope)} (8 BPC)${conFamilia ? ', con complemento del 20% por familia a cargo' : ''}.`;

  return {
    subsidioMes1: fmtUYU(meses[0]),
    totalSeisMeses: fmtUYU(total),
    tope: `${fmtUYU(tope)} (8 BPC)`,
    detalle,
    _insight: {
      type: 'highlight',
      icon: '💼',
      text: `Con un promedio de **${fmtUYU(promedio)}**, el primer mes de seguro de paro cobrarías **${fmtUYU(meses[0])}** (66%) y en 6 meses acumularías **${fmtUYU(total)}**${conFamilia ? ' (incluye el complemento del 20% por familia a cargo)' : ''}. El monto baja cada mes y no puede superar los ${fmtUYU(tope)} (8 BPC).`,
      tone: 'info' as const,
    },
    _chart: {
      type: 'bar',
      labels: ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'],
      values: meses.map((m) => Math.round(m)),
      prefix: '$U ',
      ariaLabel: `Subsidio decreciente por mes: ${meses.map((m) => fmtUYU(m)).join(', ')}.`,
    },
    _table: {
      title: 'Seguro de paro mensual (causal despido) — % decreciente sobre el promedio de 6 meses',
      headers: ['Mes', 'Porcentaje', 'Subsidio'],
      rows: PORCENTAJES.map((p, idx) => [`Mes ${idx + 1}`, `${(p * 100).toFixed(0)}%`, fmtUYU(meses[idx])]),
      note: `Régimen general de causal despido (Ley 15.180). Tope ${fmtUYU(tope)} (8 BPC) y piso ${fmtUYU(piso)} (0,5 BPC), BPC 2026 = ${fmtUYU(bpc)}. ${conFamilia ? 'Incluye complemento del 20% por familia a cargo. ' : ''}Para jornaleros el cálculo es distinto (por jornales). Fuente: BPS.`,
    },
  };
}
