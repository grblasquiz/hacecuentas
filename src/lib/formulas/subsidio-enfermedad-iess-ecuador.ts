/**
 * Subsidio por enfermedad del IESS (Ecuador) 2026.
 * Los 3 primeros días de reposo los paga el EMPLEADOR (100% del sueldo). Desde el 4° día,
 * el IESS paga un subsidio por hasta 185 días (máximo por enfermedad no profesional).
 * Tramos del subsidio sobre el promedio de la materia gravada de los 3 últimos meses:
 *   - 75% durante los primeros días subsidiados (aprox. del 4° al 70° día);
 *   - 66,66% a partir de entonces.
 * Fuente: IESS, prestaciones del Seguro General de Salud Individual y Familiar; Ley de
 * Seguridad Social. iess.gob.ec.
 *
 * NOTA: la modalidad exacta de los tramos (75% / 66,66%) y los días de corte pueden variar
 * según la normativa vigente del IESS. Verificá la modalidad aplicable a tu caso con el IESS.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

const DIAS_EMPLEADOR = 3;       // primeros 3 días a cargo del empleador
const MAX_DIAS_IESS = 185;      // tope de días subsidiados por el IESS
const CORTE_TRAMO_1 = 67;       // días subsidiados al 75% (4°..70° ≈ 67 días)
const PCT_TRAMO_1 = 0.75;
const PCT_TRAMO_2 = 0.6666;

export interface Inputs {
  sueldoProm: number;   // promedio de la materia gravada de los últimos 3 meses (USD)
  diasReposo: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  // SBU disponible para contexto (no se hardcodea dentro de la lógica del subsidio).
  void ECUADOR_2026.sbu;
  const sueldoProm = Number(i.sueldoProm) || 0;
  const diasReposo = Math.max(0, Number(i.diasReposo) || 0);

  const sueldoDiario = sueldoProm / 30;

  const diasEmpleador = Math.min(diasReposo, DIAS_EMPLEADOR);
  const pagoEmpleador = sueldoDiario * diasEmpleador;

  const diasIess = Math.min(Math.max(diasReposo - DIAS_EMPLEADOR, 0), MAX_DIAS_IESS);
  const t1 = Math.min(diasIess, CORTE_TRAMO_1);
  const t2 = Math.max(diasIess - CORTE_TRAMO_1, 0);
  const subsidioTotal = sueldoDiario * PCT_TRAMO_1 * t1 + sueldoDiario * PCT_TRAMO_2 * t2;

  const totalPercibido = pagoEmpleador + subsidioTotal;

  const excedeTope = diasReposo - DIAS_EMPLEADOR > MAX_DIAS_IESS;

  const _insight = {
    title: 'Lo que percibís durante el reposo',
    text: `De **${diasReposo} días** de reposo, tu empleador paga los primeros **${diasEmpleador}** (${fmtUSDec(pagoEmpleador)} al 100%). El IESS subsidia **${diasIess} días**: **${fmtUSDec(subsidioTotal)}** (75% al inicio, 66,66% después). En total percibís **${fmtUSDec(totalPercibido)}**.${excedeTope ? ' ⚠️ Superaste el tope de 185 días subsidiados por el IESS.' : ''}`,
    tone: excedeTope ? 'warn' : 'neutral',
    icon: '🤒',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Empleador (3 días, 100%)', value: Math.round(pagoEmpleador * 100) / 100 },
      { label: 'IESS 75% (tramo 1)', value: Math.round(sueldoDiario * PCT_TRAMO_1 * t1 * 100) / 100 },
      { label: 'IESS 66,66% (tramo 2)', value: Math.round(sueldoDiario * PCT_TRAMO_2 * t2 * 100) / 100 },
    ],
    ariaLabel: `Empleador ${fmtUSDec(pagoEmpleador)}, IESS tramo 1 y tramo 2; total ${fmtUSDec(totalPercibido)}.`,
  };

  const _table = {
    title: 'Desglose del subsidio por enfermedad',
    headers: ['Concepto', 'Días', 'Tarifa', 'Monto'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: [
      ['Empleador (primeros días)', String(diasEmpleador), '100%', fmtUSDec(pagoEmpleador)],
      ['IESS — tramo 1', String(t1), '75%', fmtUSDec(sueldoDiario * PCT_TRAMO_1 * t1)],
      ['IESS — tramo 2', String(t2), '66,66%', fmtUSDec(sueldoDiario * PCT_TRAMO_2 * t2)],
      ['Total percibido', String(diasEmpleador + diasIess), '—', fmtUSDec(totalPercibido)],
    ],
    note: `Sueldo diario = promedio 3 meses ÷ 30 = ${fmtUSDec(sueldoDiario)}. El empleador cubre los 3 primeros días; el IESS subsidia desde el 4° hasta un máximo de 185 días. Verificá los tramos (75% / 66,66%) aplicables a tu caso con el IESS.`,
  };

  return {
    pagoEmpleador: fmtUSDec(pagoEmpleador),
    subsidioTotal: fmtUSDec(subsidioTotal),
    totalPercibido: fmtUSDec(totalPercibido),
    detalle: `Diario ${fmtUSDec(sueldoDiario)}. Empleador ${diasEmpleador} días = ${fmtUSDec(pagoEmpleador)}. IESS ${diasIess} días = ${fmtUSDec(subsidioTotal)} (75% × ${t1} + 66,66% × ${t2}). Total ${fmtUSDec(totalPercibido)}.`,
    _insight,
    _chart,
    _table,
  };
}
