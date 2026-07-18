/**
 * Embargo de salario — Paraguay (art. 245, Código del Trabajo, Ley 213/93).
 *
 * El salario es embargable hasta un máximo que depende del tipo de deuda:
 *   - Pensión alimenticia: hasta 50%
 *   - Habitación o artículos alimenticios (propios y de familiares): hasta 40%
 *   - Los demás casos (deudas generales): hasta 25%
 * El aguinaldo (13er salario) es INEMBARGABLE en todos los casos.
 *
 * Devuelve el monto máximo que pueden retenerte por mes y lo que te queda libre.
 * Moneda: guaraníes (PYG). Parámetros: EMBARGO_SALARIO_PY.
 */
import { fmtPYG, EMBARGO_SALARIO_PY as E } from '../data/paraguay-2026.ts';

export interface Inputs {
  salario?: number;    // salario mensual (Gs.)
  tipoDeuda?: string;  // 'alimenticia' | 'vivienda' | 'otras'
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function pctPorTipo(tipo: string): { pct: number; nombre: string } {
  switch (tipo) {
    case 'alimenticia': return { pct: E.pensionAlimenticia, nombre: 'Pensión alimenticia' };
    case 'vivienda': return { pct: E.viviendaAlimentos, nombre: 'Habitación / artículos alimenticios' };
    case 'otras':
    default: return { pct: E.otrasDeudas, nombre: 'Otras deudas (caso general)' };
  }
}

export function compute(i: Inputs): Outputs {
  const salario = Math.max(0, Number(i.salario) || 0);
  if (salario <= 0) throw new Error('Ingresá tu salario mensual en guaraníes');
  const tipo = String(i.tipoDeuda || 'otras');
  const { pct, nombre } = pctPorTipo(tipo);

  const embargable = Math.round(salario * pct);
  const libre = salario - embargable;
  const pctFmt = (pct * 100).toFixed(0);

  const _table = {
    title: 'Tope de embargo del salario según el tipo de deuda (art. 245 CT)',
    headers: ['Tipo de deuda', 'Máximo embargable', `Sobre ${fmtPYG(salario)}`],
    rows: [
      ['Pensión alimenticia', '50%', fmtPYG(Math.round(salario * E.pensionAlimenticia))],
      ['Habitación / alimentos', '40%', fmtPYG(Math.round(salario * E.viviendaAlimentos))],
      ['Otras deudas (general)', '25%', fmtPYG(Math.round(salario * E.otrasDeudas))],
    ],
    note: 'Topes máximos del art. 245 del Código del Trabajo (Ley 213/93). El aguinaldo es inembargable. Varios embargos simultáneos no pueden superar, sumados, el máximo aplicable.',
  };

  const _insight = {
    type: 'highlight',
    icon: '⚖️',
    text: `Por **${nombre.toLowerCase()}**, sobre un salario de **${fmtPYG(salario)}** te pueden embargar como máximo el **${pctFmt}%** = **${fmtPYG(embargable)}**. Te quedan libres **${fmtPYG(libre)}**. El aguinaldo no se puede embargar.`,
  };

  return {
    montoEmbargable: fmtPYG(embargable),
    salarioLibre: fmtPYG(libre),
    porcentaje: `${pctFmt}%`,
    detalle: `${nombre}: ${fmtPYG(salario)} × ${pctFmt}% = ${fmtPYG(embargable)} embargable; te quedan ${fmtPYG(libre)}. El aguinaldo es inembargable (art. 245, Ley 213/93).`,
    _insight,
    _table,
  };
}
