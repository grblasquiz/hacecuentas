/**
 * Subsidio al desempleo — Mecanismo de Protección al Cesante (Ley 1636/2013) — Colombia.
 * El beneficio no es un pago en efectivo por el valor del salario: paga por cuenta del cesante
 * los aportes a salud (12,5%) y pensión (16%) sobre 1 SMLMV durante hasta 6 meses, más una
 * cuota monetaria del subsidio familiar por persona a cargo (la fija cada Caja de Compensación).
 * SMLMV y tasas de aporte de independientes importados de la tabla maestra (NO hardcodear).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  personasACargo?: number;
  tipoTrabajador?: string;              // 'dependiente' | 'independiente'
  cuotaMonetariaPorPersona?: number;    // COP por persona a cargo; 0 → referencial
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: any): number {
  if (v === undefined || v === null || v === '') return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

const CUOTA_REFERENCIAL = 55000; // cuota monetaria por persona a cargo (referencial; varía por Caja).
const MESES_MAX = 6;

export function compute(i: Inputs): Outputs {
  let personas = num(i.personasACargo);
  if (!Number.isFinite(personas) || personas < 0) personas = 0;
  personas = Math.floor(personas);

  const tipo = String(i.tipoTrabajador || 'dependiente') === 'independiente' ? 'independiente' : 'dependiente';

  let cuotaPorPersona = num(i.cuotaMonetariaPorPersona);
  if (!Number.isFinite(cuotaPorPersona) || cuotaPorPersona <= 0) cuotaPorPersona = CUOTA_REFERENCIAL;

  const smlmv = COLOMBIA_2026.smlmv;
  const tasaAportes = COLOMBIA_2026.independientes.salud + COLOMBIA_2026.independientes.pension; // 0,125 + 0,16 = 0,285
  const aportesMensuales = Math.round(smlmv * tasaAportes);
  const cuota = Math.round(cuotaPorPersona * personas);
  const beneficioMensual = aportesMensuales + cuota;
  const beneficioTotalMax = beneficioMensual * MESES_MAX;

  const _insight = {
    title: `Beneficio mensual estimado: ${fmtCOP(beneficioMensual)}`,
    text: `El Mecanismo de Protección al Cesante paga tus aportes a salud y pensión sobre 1 SMLMV (**${fmtCOP(aportesMensuales)}** al mes = 28,5% de ${fmtCOP(smlmv)})${personas > 0 ? `, más una cuota monetaria de subsidio familiar por tus ${personas} persona(s) a cargo (**${fmtCOP(cuota)}**)` : ''}. En total, unos **${fmtCOP(beneficioMensual)}** mensuales por hasta 6 meses (**${fmtCOP(beneficioTotalMax)}** en total). No es un pago del valor de tu sueldo: cubre tu seguridad social mientras buscás empleo.`,
    tone: 'info',
    icon: '🛟',
  };

  const _chart = {
    type: 'bar',
    labels: ['Aportes salud + pensión', 'Cuota monetaria', 'Total mensual'],
    values: [aportesMensuales, cuota, beneficioMensual],
    prefix: '$',
    ariaLabel: `Aportes a salud y pensión ${fmtCOP(aportesMensuales)}, cuota monetaria ${fmtCOP(cuota)}, beneficio mensual total ${fmtCOP(beneficioMensual)}.`,
  };

  const reqTxt = tipo === 'independiente'
    ? 'Como trabajador independiente, para acceder debés haber aportado a una Caja de Compensación de forma continua o interrumpida durante el tiempo mínimo exigido antes de quedar cesante.'
    : 'Como trabajador dependiente, se exige haber aportado a una Caja de Compensación al menos 1 año (continuo o discontinuo) en los últimos 3 años antes de quedar cesante.';

  return {
    aportesSaludPension: fmtCOP(aportesMensuales),
    cuotaMonetaria: fmtCOP(cuota),
    beneficioMensual: fmtCOP(beneficioMensual),
    beneficioTotalMax: fmtCOP(beneficioTotalMax),
    detalle: `Aportes: ${fmtCOP(smlmv)} × 28,5% = ${fmtCOP(aportesMensuales)}/mes. Cuota: ${fmtCOP(cuotaPorPersona)} × ${personas} = ${fmtCOP(cuota)}. Beneficio mensual ${fmtCOP(beneficioMensual)} × 6 meses = ${fmtCOP(beneficioTotalMax)}. ${reqTxt}`,
    _insight,
    _chart,
  };
}
