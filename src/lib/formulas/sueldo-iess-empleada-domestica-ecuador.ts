/**
 * Sueldo + IESS de empleada/o doméstica (trabajo del hogar) en Ecuador.
 * Régimen de trabajo del hogar: remuneración mínima = 1 SBU (USD 482 en 2026).
 * Aportes IESS: personal 9,45% (se descuenta del sueldo) + patronal 11,15% (lo paga el empleador).
 * Beneficios de ley que asume el empleador: décimo tercero (1 sueldo/año), décimo cuarto (1 SBU/año)
 * y fondos de reserva (8,33% desde el 13.º mes con el mismo empleador).
 * Fuentes: IESS (iess.gob.ec) y Código del Trabajo. Constantes de ECUADOR_2026.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  incluyeFondosReserva?: string;   // 'si' | 'no' (lleva > 1 año con el mismo empleador)
  incluyeDecimosProrrateados?: string; // 'si' | 'no' (prorratear el costo de los décimos al mes)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

const SBU = ECUADOR_2026.sbu;                 // 482
const IESS_PERSONAL = ECUADOR_2026.iessPersonal; // 0,0945
const IESS_PATRONAL = ECUADOR_2026.iessPatronal; // 0,1115
const FONDOS = ECUADOR_2026.fondosReserva;       // 0,0833

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const conFondos = String(i.incluyeFondosReserva || 'no') === 'si';
  const prorratea = String(i.incluyeDecimosProrrateados || 'si') === 'si';
  if (sueldo <= 0) throw new Error('Ingresá el sueldo mensual de la empleada/o doméstica');

  const aportePersonal = sueldo * IESS_PERSONAL;   // descuento a la trabajadora
  const aportePatronal = sueldo * IESS_PATRONAL;   // lo paga el empleador
  const decimo13 = sueldo / 12;                    // prorrateo mensual del 13.º
  const decimo14 = SBU / 12;                       // prorrateo mensual del 14.º
  const fondos = conFondos ? sueldo * FONDOS : 0;  // 8,33% desde el 2.º año

  const netoTrabajadora = sueldo - aportePersonal;
  const provisiones = prorratea ? decimo13 + decimo14 : 0;
  const costoEmpleador = sueldo + aportePatronal + provisiones + fondos;

  const bajoMinimo = sueldo < SBU;

  const _insight = {
    title: 'Cuánto cuesta y cuánto recibe',
    text: `${bajoMinimo ? `⚠️ El sueldo del trabajo del hogar no puede ser menor a **1 SBU** (${fmtUSDec(SBU)}). ` : ''}Con un sueldo de **${fmtUSDec(sueldo)}**, a la trabajadora le queda **${fmtUSDec(netoTrabajadora)}** (tras el 9,45% del IESS) y al empleador le cuesta **${fmtUSDec(costoEmpleador)}** al mes (sueldo + 11,15% patronal${prorratea ? ' + décimos prorrateados' : ''}${conFondos ? ' + fondos de reserva' : ''}).`,
    tone: bajoMinimo ? 'warn' : 'neutral',
    icon: '🧹',
  };

  const rows: (string | number)[][] = [
    ['Sueldo mensual', fmtUSDec(sueldo)],
    ['Aporte personal IESS (9,45%) — descuento', `- ${fmtUSDec(aportePersonal)}`],
    ['Neto que recibe la trabajadora', fmtUSDec(netoTrabajadora)],
    ['Aporte patronal IESS (11,15%) — lo paga el empleador', fmtUSDec(aportePatronal)],
  ];
  if (prorratea) {
    rows.push(['Décimo tercero prorrateado (sueldo ÷ 12)', fmtUSDec(decimo13)]);
    rows.push(['Décimo cuarto prorrateado (SBU ÷ 12)', fmtUSDec(decimo14)]);
  }
  if (conFondos) rows.push(['Fondos de reserva (8,33%)', fmtUSDec(fondos)]);
  rows.push(['Costo total mensual para el empleador', fmtUSDec(costoEmpleador)]);

  const _table = {
    title: 'Sueldo, aportes y costo del empleador',
    headers: ['Concepto', 'Valor'],
    align: ['left', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'El trabajo del hogar se afilia obligatoriamente al IESS desde el primer día. La remuneración mínima es 1 SBU. Los fondos de reserva se pagan desde el mes 13 con el mismo empleador.',
  };

  return {
    costoTotalEmpleador: fmtUSDec(costoEmpleador),
    aportePersonal: fmtUSDec(aportePersonal),
    aportePatronal: fmtUSDec(aportePatronal),
    netoTrabajadora: fmtUSDec(netoTrabajadora),
    detalle: `Sueldo ${fmtUSDec(sueldo)} · IESS personal ${fmtUSDec(aportePersonal)} · patronal ${fmtUSDec(aportePatronal)} · costo empleador ${fmtUSDec(costoEmpleador)} · neto ${fmtUSDec(netoTrabajadora)}.`,
    _insight,
    _table,
  };
}
