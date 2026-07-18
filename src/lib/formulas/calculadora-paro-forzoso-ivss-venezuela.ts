/**
 * Paro forzoso — Prestación dineraria por Pérdida Involuntaria del Empleo (IVSS).
 * Ley del Régimen Prestacional de Empleo, Art. 31 y ss.
 *
 *   - Monto mensual = 60% del salario mensual promedio cotizado al IVSS en los
 *     últimos 12 meses.
 *   - Se paga por hasta 5 meses (5 cuotas mensuales).
 *   - Requisito: haber cotizado al menos 52 semanas en los últimos 24 meses y
 *     haber perdido el empleo de forma involuntaria. Solicitud dentro de 60 días.
 *
 * Fuente: Ley de Régimen Prestacional de Empleo (Asamblea Nacional); Venelogía.
 */
import { PARO_FORZOSO_IVSS, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioPromedioCotizado?: number; // salario mensual promedio cotizado (Bs.)
  mesesACobrar?: number;            // 1 a 5
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const salario = Math.max(0, Number(i.salarioPromedioCotizado) || 0);
  if (!salario) throw new Error('Ingresá tu salario mensual promedio cotizado (Bs.)');

  const meses = Math.min(
    PARO_FORZOSO_IVSS.maxMeses,
    Math.max(1, Math.floor(Number(i.mesesACobrar ?? PARO_FORZOSO_IVSS.maxMeses) || PARO_FORZOSO_IVSS.maxMeses)),
  );

  const prestacionMensual = salario * PARO_FORZOSO_IVSS.porcentaje; // 60%
  const totalMaximo = prestacionMensual * PARO_FORZOSO_IVSS.maxMeses; // 5 cuotas
  const totalACobrar = prestacionMensual * meses;

  const _insight = {
    type: 'highlight',
    icon: '💸',
    text: `Con un salario promedio cotizado de **${fmtVES(salario)}**, el paro forzoso te paga **${fmtVES(prestacionMensual)}/mes** (60% del salario). ` +
      `Por ${meses} mes(es) cobrarías **${fmtVES(totalACobrar)}**; el tope legal son 5 meses = **${fmtVES(totalMaximo)}**. ` +
      `Recordá que necesitás haber cotizado al menos 52 semanas en los últimos 24 meses y solicitarlo dentro de los 60 días tras el despido.`,
  };

  const _table = {
    title: 'Prestación por paro forzoso (60% del salario cotizado)',
    headers: ['Concepto', 'Cálculo', 'Monto'],
    rows: [
      ['Prestación mensual', `${fmtVES(salario)} × 60%`, fmtVES(prestacionMensual)],
      [`Total por ${meses} mes(es)`, `${fmtVES(prestacionMensual)} × ${meses}`, fmtVES(totalACobrar)],
      ['Tope legal (5 meses)', `${fmtVES(prestacionMensual)} × 5`, fmtVES(totalMaximo)],
    ],
    note: 'El monto es el 60% del salario promedio cotizado al IVSS en los últimos 12 meses, pagadero por un máximo de 5 cuotas mensuales. Requiere 52 semanas cotizadas en los últimos 24 meses y pérdida involuntaria del empleo.',
  };

  return {
    prestacionMensual: Number(prestacionMensual.toFixed(2)),
    totalACobrar: Number(totalACobrar.toFixed(2)),
    totalMaximo: Number(totalMaximo.toFixed(2)),
    detalle: `${fmtVES(salario)} × 60% = ${fmtVES(prestacionMensual)}/mes × ${meses} = ${fmtVES(totalACobrar)}`,
    _insight,
    _table,
  };
}
