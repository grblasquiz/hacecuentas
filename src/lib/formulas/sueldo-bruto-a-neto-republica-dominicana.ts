/**
 * Conversor bidireccional sueldo bruto ↔ neto — República Dominicana 2026.
 *
 * El neto de un salario dominicano es:
 *   neto = bruto − AFP (2,87%) − SFS (3,04%) − retención ISR mensual.
 * AFP y SFS se topean al salario cotizable máximo; el ISR se calcula sobre la base
 * anualizada (bruto − AFP − SFS) × 12 con la escala del Art. 296 ÷ 12.
 *
 * Dirección bruto→neto: cálculo directo con el helper de la tabla maestra.
 * Dirección neto→bruto: no hay fórmula cerrada (el ISR es progresivo por tramos y
 * AFP/SFS se topean), así que se invierte por BÚSQUEDA BINARIA sobre el bruto que
 * produce el neto objetivo.
 *
 * Datos y helpers desde la tabla maestra única.
 */
import {
  REPUBLICA_DOMINICANA_2026 as DO,
  salarioNetoDominicana,
  fmtDOP,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  monto: number;
  /** 'brutoANeto' (default) o 'netoABruto'. */
  direccion?: 'brutoANeto' | 'netoABruto';
}

export interface Outputs {
  bruto: number;
  neto: number;
  afp: number;
  sfs: number;
  tss: number;
  isr: number;
  totalDescuentos: number;
  direccion: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
  _steps?: any;
}

/** Invierte neto→bruto por búsqueda binaria sobre salarioNetoDominicana. */
function brutoDesdeNeto(netoObjetivo: number): number {
  let lo = netoObjetivo;            // el bruto nunca es menor que el neto
  let hi = netoObjetivo * 2 + 100_000; // cota superior holgada
  // Asegurar que hi supera el objetivo (por si el ISR alto desplaza mucho).
  while (salarioNetoDominicana(hi).neto < netoObjetivo) hi *= 2;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    const n = salarioNetoDominicana(mid).neto;
    if (Math.abs(n - netoObjetivo) < 0.005) return mid;
    if (n < netoObjetivo) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function sueldoBrutoANetoRepublicaDominicana(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const direccion = String(i.direccion || 'brutoANeto');

  if (!monto || monto <= 0) throw new Error('Ingresá un monto en RD$');

  let bruto: number;
  if (direccion === 'netoABruto') {
    bruto = brutoDesdeNeto(monto);
  } else {
    bruto = monto;
  }

  const d = salarioNetoDominicana(bruto);
  const totalDescuentos = d.tss + d.isrMensual;

  const formula = direccion === 'netoABruto'
    ? `Bruto que deja ${fmtDOP(monto)} netos = ${fmtDOP(bruto)} (invertido por búsqueda binaria sobre AFP + SFS + ISR)`
    : `Neto = bruto − AFP 2,87% − SFS 3,04% − ISR = ${fmtDOP(bruto)} − ${fmtDOP(d.tss)} − ${fmtDOP(d.isrMensual)} = ${fmtDOP(d.neto)}`;

  const explicacion = direccion === 'netoABruto'
    ? `Para recibir ${fmtDOP(monto)} netos en mano, el salario bruto debe ser ${fmtDOP(bruto)}. De ese bruto se descuentan AFP ${fmtDOP(d.afp)} (2,87%), SFS ${fmtDOP(d.sfs)} (3,04%) y retención de ISR ${fmtDOP(d.isrMensual)}, dejando exactamente ${fmtDOP(d.neto)}. La conversión inversa se hace por búsqueda binaria porque el ISR es progresivo por tramos.`
    : `De un salario bruto de ${fmtDOP(bruto)} se descuentan AFP ${fmtDOP(d.afp)} (2,87%) y SFS ${fmtDOP(d.sfs)} (3,04%) para la TSS, más la retención mensual de ISR ${fmtDOP(d.isrMensual)} (escala Art. 296 sobre la base anualizada). El salario neto en mano es ${fmtDOP(d.neto)}.`;

  const _steps = [
    { label: direccion === 'netoABruto' ? 'Salario bruto (calculado)' : 'Salario bruto', value: fmtDOP(bruto) },
    { label: 'AFP (2,87%)', value: '− ' + fmtDOP(d.afp) },
    { label: 'SFS (3,04%)', value: '− ' + fmtDOP(d.sfs) },
    { label: 'Retención ISR', value: '− ' + fmtDOP(d.isrMensual) },
    { label: 'Salario neto', value: fmtDOP(d.neto) },
  ];

  const _insight = {
    title: direccion === 'netoABruto'
      ? `Necesitás un bruto de ${fmtDOP(bruto)}`
      : `Tu neto en mano es ${fmtDOP(d.neto)}`,
    text: direccion === 'netoABruto'
      ? `Para llevarte **${fmtDOP(monto)}** netos, el bruto tiene que ser **${fmtDOP(bruto)}**. Entre AFP, SFS e ISR se descuentan **${fmtDOP(totalDescuentos)}** (${((totalDescuentos / bruto) * 100).toFixed(1)}%).`
      : `De **${fmtDOP(bruto)}** brutos te quedan **${fmtDOP(d.neto)}** netos. Los descuentos suman **${fmtDOP(totalDescuentos)}** (${((totalDescuentos / bruto) * 100).toFixed(1)}%): AFP, SFS e ISR.`,
    tone: 'good' as const,
    icon: '🇩🇴',
  };

  const _table = {
    title: 'Del bruto al neto',
    headers: ['Concepto', 'Tasa', 'Monto'],
    rows: [
      ['Salario bruto', '—', fmtDOP(bruto)],
      ['AFP (pensiones)', '2,87%', '− ' + fmtDOP(d.afp)],
      ['SFS (salud)', '3,04%', '− ' + fmtDOP(d.sfs)],
      ['Retención ISR', d.isrMensual > 0 ? 'escala Art. 296' : 'exento', '− ' + fmtDOP(d.isrMensual)],
      ['Salario neto', '—', fmtDOP(d.neto)],
    ],
    note: 'AFP y SFS topean en el salario cotizable máximo (RD$464.460 y RD$232.230). La regalía pascual no descuenta TSS ni ISR.',
  };

  return {
    bruto: Math.round(bruto * 100) / 100,
    neto: Math.round(d.neto * 100) / 100,
    afp: Math.round(d.afp * 100) / 100,
    sfs: Math.round(d.sfs * 100) / 100,
    tss: Math.round(d.tss * 100) / 100,
    isr: Math.round(d.isrMensual * 100) / 100,
    totalDescuentos: Math.round(totalDescuentos * 100) / 100,
    direccion,
    formula,
    explicacion,
    _insight,
    _table,
    _steps,
  };
}
