/**
 * Provisión MENSUAL de prestaciones sociales por empleado — Colombia 2026.
 * Ángulo contable "cuánto debo provisionar cada mes" (apropiación mensual), distinto
 * del costo total de nómina (que suma además seguridad social y parafiscales).
 *
 * Solo las PRESTACIONES SOCIALES, que se causan mes a mes y se pagan/consignan después:
 *  - Cesantías:               1/12 del salario  = 8,33 %
 *  - Intereses a cesantías:   12 % anual sobre cesantías ≈ 1,00 % del salario/mes
 *  - Prima de servicios:      1/12 del salario  = 8,33 %
 *  - Vacaciones:              15 días hábiles/año = 15/360 = 4,17 %
 *  Total ≈ 21,83 % del salario mensual.
 *
 * Las cesantías, intereses y prima se calculan sobre salario + auxilio de transporte
 * (si gana ≤ 2 SMLMV); las vacaciones solo sobre el salario.
 * Reusa `prestaciones` de colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  incluirAuxilio?: string; // 'auto' | 'si' | 'no' — default 'auto' (según 2 SMLMV)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const salario = num(i.salarioMensual);
  if (salario <= 0) throw new Error('Ingresá el salario mensual del empleado');

  // Auxilio de transporte: por defecto se incluye si el salario es ≤ 2 SMLMV.
  const modo = String(i.incluirAuxilio ?? 'auto');
  const aplicaPorLey = salario <= C.smlmv * C.topeAuxilioSmlmv;
  const incluyeAux = modo === 'si' ? true : modo === 'no' ? false : aplicaPorLey;
  const auxilio = incluyeAux ? C.auxilioTransporte : 0;
  const baseConAux = salario + auxilio;

  // Provisión mensual (apropiación).
  const cesantias = baseConAux * C.prestaciones.cesantiasPorcentaje;           // 8,33 %
  const intereses = baseConAux * C.prestaciones.cesantiasPorcentaje
    * C.prestaciones.interesesCesantias;                                       // 12 % de las cesantías ≈ 1 %
  const prima = baseConAux * C.prestaciones.primaPorcentaje;                   // 8,33 %
  const vacaciones = salario * C.prestaciones.vacacionesPorcentaje;            // 4,17 % (solo salario)

  const totalMes = cesantias + intereses + prima + vacaciones;
  const totalAnio = totalMes * 12;
  const pct = (totalMes / salario) * 100;
  const pctTxt = pct.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const _insight = {
    title: 'Cuánto provisionar por mes',
    text: `Por un empleado con salario de **${fmtCOP(salario)}**${incluyeAux ? ` (+ auxilio de transporte ${fmtCOP(auxilio)})` : ''} tenés que provisionar **${fmtCOP(totalMes)}** cada mes en prestaciones sociales — un **${pctTxt}%** del salario: cesantías ${fmtCOP(cesantias)} (8,33%), intereses ${fmtCOP(intereses)} (1%), prima ${fmtCOP(prima)} (8,33%) y vacaciones ${fmtCOP(vacaciones)} (4,17%). En el año son **${fmtCOP(totalAnio)}**. Esto es SOLO prestaciones; la seguridad social y los parafiscales son aparte.`,
    tone: 'neutral' as const,
    icon: '📒',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cesantías (8,33%)', value: Math.round(cesantias) },
      { label: 'Intereses (1%)', value: Math.round(intereses) },
      { label: 'Prima (8,33%)', value: Math.round(prima) },
      { label: 'Vacaciones (4,17%)', value: Math.round(vacaciones) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCOP(totalMes),
    centerLabel: `provisión/mes (${pctTxt}%)`,
    ariaLabel: `Provisión mensual de prestaciones ${fmtCOP(totalMes)}: cesantías ${fmtCOP(cesantias)}, intereses ${fmtCOP(intereses)}, prima ${fmtCOP(prima)}, vacaciones ${fmtCOP(vacaciones)}.`,
  };

  return {
    provisionMensual: fmtCOP(totalMes),
    porcentaje: `${pctTxt}% del salario`,
    provisionAnual: fmtCOP(totalAnio),
    cesantias: `${fmtCOP(cesantias)} (8,33%${incluyeAux ? ', incluye auxilio' : ''})`,
    interesesCesantias: `${fmtCOP(intereses)} (1% — 12% sobre cesantías)`,
    prima: `${fmtCOP(prima)} (8,33%${incluyeAux ? ', incluye auxilio' : ''})`,
    vacaciones: `${fmtCOP(vacaciones)} (4,17% — solo salario)`,
    baseConAuxilio: incluyeAux
      ? `${fmtCOP(baseConAux)} (salario ${fmtCOP(salario)} + auxilio ${fmtCOP(auxilio)})`
      : `${fmtCOP(salario)} (sin auxilio)`,
    detalle: `Cesantías ${fmtCOP(cesantias)} + intereses ${fmtCOP(intereses)} + prima ${fmtCOP(prima)} + vacaciones ${fmtCOP(vacaciones)} = ${fmtCOP(totalMes)}/mes (${pctTxt}%).`,
    nota: 'Provisión SOLO de prestaciones sociales (≈21,83%). NO incluye seguridad social del empleador (salud 8,5%, pensión 12%, ARL) ni parafiscales (CCF 4%, ICBF 3%, SENA 2%). Para el costo total de la nómina, sumá esos conceptos. La provisión es una apropiación contable: la plata se desembolsa al pagar prima (jun/dic), consignar cesantías (feb) o dar vacaciones.',
    _insight,
    _chart,
  };
}
