/**
 * Calculadora de pensión AFP — República Dominicana 2026 (Ley 87-01, sistema SDSS).
 *
 * Aportes mensuales a la cuenta de capitalización individual (pensiones):
 *   aporte empleado  = salario mensual × 2,87%
 *   aporte empleador = salario mensual × 7,10%
 *   aporte total     = 9,97% del salario
 *
 * Proyección del fondo (valor futuro de una anualidad mensual + capital inicial):
 *   r = (rentabilidad anual / 100) / 12
 *   m = años a aportar × 12
 *   fondo = fondoActual × (1+r)^m + aporteTotal × ((1+r)^m − 1) / r
 *
 * NOTA: el tope cotizable y la rentabilidad de largo plazo son SUPUESTOS
 * ilustrativos (la rentabilidad real de las AFP varía año a año). El resultado
 * es una estimación educativa, no una proyección oficial de pensión.
 */
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  fmtDOP,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual: number;
  aniosAportar: number;
  /** Saldo ya acumulado en la cuenta AFP. Default 0. */
  fondoActual: number;
  /** Rentabilidad anual neta supuesta, en %. Default 8 (ilustrativo). */
  rentabilidad: number;
}

export interface Outputs {
  fondoProyectado: number | string;
  aporteEmpleado: number;
  aporteEmpleador: number;
  aporteTotalMensual: number;
  totalAportado: number;
  rendimientos: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
}

export function pensionAfpRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const anios = Math.max(0, Number(i.aniosAportar) || 0);
  const fondoActual = Math.max(0, Number(i.fondoActual) || 0);
  const rentabilidad = i.rentabilidad == null ? 8 : Number(i.rentabilidad);

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  // El aporte a pensiones se topea al salario cotizable máximo (20 salarios mínimos).
  const baseCotizable = Math.min(salario, RD.tss.topeAfp);

  const aporteEmpleado = baseCotizable * RD.tss.afpEmpleado;   // 2,87%
  const aporteEmpleador = baseCotizable * RD.tss.afpPatronal;  // 7,10%
  const aporteTotalMensual = aporteEmpleado + aporteEmpleador; // 9,97%

  const r = (rentabilidad / 100) / 12;
  const m = Math.round(anios * 12);

  let fondoProyectado: number;
  if (r === 0) {
    fondoProyectado = fondoActual + aporteTotalMensual * m;
  } else {
    fondoProyectado =
      fondoActual * Math.pow(1 + r, m) +
      aporteTotalMensual * ((Math.pow(1 + r, m) - 1) / r);
  }

  const totalAportado = fondoActual + aporteTotalMensual * m;
  const rendimientos = fondoProyectado - totalAportado;

  const topeAplicado = salario > RD.tss.topeAfp;

  const formula =
    `Aporte mensual = ${fmtDOP(baseCotizable)} × 9,97% = ${fmtDOP(aporteTotalMensual)}; ` +
    `Fondo a ${anios} años (${rentabilidad}% anual) = ${fmtDOP(fondoProyectado)}`;

  const explicacion =
    `Aporte mensual del empleado = ${fmtDOP(baseCotizable)} × 2,87% = ${fmtDOP(aporteEmpleado)}. ` +
    `Aporte del empleador = ${fmtDOP(baseCotizable)} × 7,10% = ${fmtDOP(aporteEmpleador)}. ` +
    `Total mensual a tu cuenta = ${fmtDOP(aporteTotalMensual)} (9,97%). ` +
    (topeAplicado
      ? `Tu salario supera el tope cotizable de ${fmtDOP(RD.tss.topeAfp)}, así que el aporte se calcula sobre ese tope. `
      : ``) +
    `Proyectado a ${anios} años con una rentabilidad supuesta del ${rentabilidad}% anual` +
    (fondoActual > 0 ? ` (partiendo de ${fmtDOP(fondoActual)} ya acumulados)` : ``) +
    `, el fondo llega a ${fmtDOP(fondoProyectado)}: ${fmtDOP(totalAportado)} de aportes más ${fmtDOP(rendimientos)} de rendimientos. ` +
    `La rentabilidad es un supuesto ilustrativo: la real de las AFP varía año a año.`;

  const _insight = {
    title: `Fondo proyectado: ${fmtDOP(fondoProyectado)}`,
    text:
      `Aportando **${fmtDOP(aporteTotalMensual)}** al mes (2,87% tú + 7,10% tu empleador) durante **${anios} años** ` +
      `al **${rentabilidad}%** anual supuesto, tu cuenta AFP llegaría a **${fmtDOP(fondoProyectado)}**. ` +
      `De ese total, **${fmtDOP(rendimientos)}** vendrían de rendimientos. Es una estimación, no una pensión garantizada.`,
    tone: 'good' as 'good' | 'warn' | 'neutral',
    icon: '🏦',
  };

  const _table = {
    title: 'Aportes y proyección del fondo AFP',
    headers: ['Concepto', 'Monto'],
    align: ['left', 'right'],
    rows: [
      ['Base cotizable', fmtDOP(baseCotizable)],
      ['Aporte empleado (2,87%)', fmtDOP(aporteEmpleado)],
      ['Aporte empleador (7,10%)', fmtDOP(aporteEmpleador)],
      ['Aporte total mensual (9,97%)', fmtDOP(aporteTotalMensual)],
      [`Total aportado en ${anios} años`, fmtDOP(totalAportado)],
      ['Rendimientos estimados', fmtDOP(rendimientos)],
    ],
    footer: ['Fondo proyectado', fmtDOP(fondoProyectado)],
    note: 'Ley 87-01 (SDSS). Tope cotizable y rentabilidad son supuestos ilustrativos: la rentabilidad real de las AFP varía. No es una proyección oficial de pensión.',
  };

  return {
    fondoProyectado: fmtDOP(fondoProyectado),
    aporteEmpleado: Math.round(aporteEmpleado),
    aporteEmpleador: Math.round(aporteEmpleador),
    aporteTotalMensual: Math.round(aporteTotalMensual),
    totalAportado: Math.round(totalAportado),
    rendimientos: Math.round(rendimientos),
    formula,
    explicacion,
    _insight,
    _table,
  };
}
