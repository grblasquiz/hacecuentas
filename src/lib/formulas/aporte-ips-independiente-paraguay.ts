/**
 * Aporte al IPS del trabajador independiente — PARAGUAY.
 *
 * El trabajador independiente puede afiliarse voluntariamente al seguro social del
 * IPS. El aporte es del 13% de la renta declarada (declaración jurada), repartido
 * en 12,5% al Fondo Común de Jubilaciones y Pensiones y 0,5% al Fondo de
 * Administración de la entidad. La base declarada no puede ser inferior a un
 * salario mínimo. Los aportes pueden pagarse mensual, trimestral o anualmente.
 *
 * Importante: el independiente aporta SÓLO a efectos jubilatorios (jubilación y
 * pensiones), NO al seguro de salud del IPS. Distinto del trabajador dependiente,
 * a quien se le descuenta el 9% del salario.
 *
 * Moneda: guaraníes (PYG).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026.ts';

const TASA_INDEPENDIENTE = 0.13;  // 13% total
const TASA_FONDO_JUB = 0.125;     // 12,5% Fondo de Jubilaciones y Pensiones
const TASA_FONDO_ADMIN = 0.005;   // 0,5% Fondo de Administración

export interface Inputs {
  ingresoDeclarado: number; // renta mensual declarada, en Gs.
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoDeclarado) || 0;
  if (ingreso <= 0) throw new Error('Ingresá tu renta mensual declarada');

  // La base no puede ser inferior a un salario mínimo.
  const sm = PARAGUAY_2026.salarioMinimo;
  const base = Math.max(ingreso, sm);
  const ajustadoAlMinimo = ingreso < sm;

  const aporteMensual = Math.round(base * TASA_INDEPENDIENTE);
  const fondoJubilaciones = Math.round(base * TASA_FONDO_JUB);
  const fondoAdmin = Math.round(base * TASA_FONDO_ADMIN);
  const aporteTrimestral = aporteMensual * 3;
  const aporteAnual = aporteMensual * 12;

  const _table = {
    title: 'Aporte del independiente (13% sobre la renta declarada)',
    headers: ['Concepto', 'Tasa', 'Monto'],
    rows: [
      ['Fondo de Jubilaciones y Pensiones', '12,5%', fmtPYG(fondoJubilaciones)],
      ['Fondo de Administración', '0,5%', fmtPYG(fondoAdmin)],
      ['Aporte mensual', '13%', fmtPYG(aporteMensual)],
      ['Aporte trimestral', '×3', fmtPYG(aporteTrimestral)],
      ['Aporte anual', '×12', fmtPYG(aporteAnual)],
    ],
    note: `Base de cálculo: ${fmtPYG(base)}${ajustadoAlMinimo ? ' (ajustada al salario mínimo, que es el piso)' : ''}. Cubre sólo jubilación, no salud. Podés pagar mensual, trimestral o anualmente.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '🧾',
    text: ajustadoAlMinimo
      ? `Como tu renta declarada está por debajo del salario mínimo, el aporte se calcula sobre el piso de **${fmtPYG(sm)}**: **${fmtPYG(aporteMensual)}** por mes (13%).`
      : `Sobre una renta declarada de **${fmtPYG(base)}**, aportás **${fmtPYG(aporteMensual)}** por mes (13%): ${fmtPYG(fondoJubilaciones)} al fondo jubilatorio y ${fmtPYG(fondoAdmin)} a administración. En el año, ${fmtPYG(aporteAnual)}.`,
  };

  return {
    aporteMensual: fmtPYG(aporteMensual),
    aporteTrimestral: fmtPYG(aporteTrimestral),
    aporteAnual: fmtPYG(aporteAnual),
    fondoJubilaciones: fmtPYG(fondoJubilaciones),
    fondoAdmin: fmtPYG(fondoAdmin),
    detalle: `${fmtPYG(base)} × 13% = ${fmtPYG(aporteMensual)}/mes (12,5% jubilación + 0,5% administración). Anual: ${fmtPYG(aporteAnual)}.`,
    _insight,
    _table,
  };
}
