/** Jubilación anticipada: coeficientes reductores sobre la pensión (España, 2026).
 *  ⚠️ ESTIMACIÓN REFERENCIAL — no sustituye el cálculo oficial de la Seguridad Social.
 *  Adelantar la jubilación reduce la pensión aplicando coeficientes reductores. Desde el
 *  RDL 2/2023 los coeficientes son MENSUALES y dependen de los meses de anticipación y de
 *  los años cotizados. Hay dos modalidades:
 *    - Voluntaria: hasta 24 meses antes de la edad ordinaria (coeficientes mayores).
 *    - Involuntaria (forzosa, por cese no imputable): hasta 48 meses, coeficientes menores.
 *  Edad ordinaria de jubilación 2026: 66 años y 10 meses; 65 años con 38 años y 3 meses
 *  o más cotizados.
 *  Los coeficientes mensuales por año/mes usados aquí son APROXIMACIONES del tramo del
 *  RDL 2/2023 y deben verificarse con la Seguridad Social para cada caso concreto.
 *  Fuente: RDL 2/2023 y Seguridad Social — jubilación anticipada. */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round(n * 100) / 100) + ' €';

// Coeficiente reductor MENSUAL aproximado (referencial) por tramo de años cotizados.
// Menos años cotizados → mayor penalización por mes anticipado.
const COEF_MENSUAL_VOLUNTARIA: Record<string, number> = {
  'menos-38-6': 0.0088,
  '38-6-a-41-6': 0.0086,
  '41-6-a-44-6': 0.0084,
  'mas-44-6': 0.0082,
};
// La modalidad involuntaria aplica coeficientes menores (referencial: ~85% del voluntario).
const FACTOR_INVOLUNTARIA = 0.85;
const MAX_MESES_VOLUNTARIA = 24;
const MAX_MESES_INVOLUNTARIA = 48;

export interface Inputs {
  baseReguladora: number;   // pensión que cobrarías a la edad ordinaria (€/mes, base reguladora aplicada)
  mesesAnticipacion: number;// meses que adelantas respecto a tu edad ordinaria
  aniosCotizados?: string;  // tramo: 'menos-38-6' | '38-6-a-41-6' | '41-6-a-44-6' | 'mas-44-6'
  modalidad?: string;       // 'voluntaria' | 'involuntaria'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const base = Number(i.baseReguladora) || 0;
  const involuntaria = String(i.modalidad || 'voluntaria') === 'involuntaria';
  const maxMeses = involuntaria ? MAX_MESES_INVOLUNTARIA : MAX_MESES_VOLUNTARIA;
  const mesesRaw = Number(i.mesesAnticipacion) || 0;
  const meses = Math.min(Math.max(0, mesesRaw), maxMeses);
  const tramo = COEF_MENSUAL_VOLUNTARIA[String(i.aniosCotizados)] ? String(i.aniosCotizados) : '38-6-a-41-6';
  if (base <= 0) throw new Error('Introduce la pensión (base reguladora) que cobrarías a la edad ordinaria');
  if (mesesRaw <= 0) throw new Error('Introduce cuántos meses adelantas la jubilación');

  const coefMensual = COEF_MENSUAL_VOLUNTARIA[tramo] * (involuntaria ? FACTOR_INVOLUNTARIA : 1);
  const reduccionPct = Math.min(coefMensual * meses, 0.5); // tope de seguridad 50%
  const reduccionEuros = base * reduccionPct;
  const pensionReducida = base - reduccionEuros;
  const pensionReducidaAnual14 = pensionReducida * 14;

  const _insight = {
    title: 'Cuánto te quitan por jubilarte antes',
    text: `Adelantar la jubilación **${meses} meses** (${involuntaria ? 'involuntaria' : 'voluntaria'}) te aplica un recargo aproximado del **${(reduccionPct * 100).toFixed(1)}%**: la pensión pasa de **${fmtEur(base)}** a **${fmtEur(pensionReducida)}** al mes, es decir **${fmtEur(reduccionEuros)}** menos, de forma vitalicia. Estimación referencial: confirma tu caso con la Seguridad Social.`,
    tone: 'warning',
    icon: '📉',
  };
  const _chart = {
    type: 'bar',
    labels: ['Pensión ordinaria', 'Pensión anticipada'],
    values: [Math.round(base), Math.round(pensionReducida)],
    prefix: '€ ',
    ariaLabel: `Pensión ordinaria ${fmtEur(base)} frente a pensión anticipada ${fmtEur(pensionReducida)}.`,
  };

  return {
    pensionReducida: fmtEur(pensionReducida),
    reduccionEuros: fmtEur(reduccionEuros),
    reduccionPct: `${(reduccionPct * 100).toFixed(1)} %`,
    pensionReducidaAnual: fmtEur(pensionReducidaAnual14),
    detalle: `Base ${fmtEur(base)}/mes · ${meses} meses anticipados (${involuntaria ? 'involuntaria' : 'voluntaria'}) · coef. ≈ ${(coefMensual * 100).toFixed(2)}%/mes → recargo ${(reduccionPct * 100).toFixed(1)}% = −${fmtEur(reduccionEuros)}. Pensión ${fmtEur(pensionReducida)}/mes. REFERENCIAL.`,
    _insight,
    _chart,
  };
}
