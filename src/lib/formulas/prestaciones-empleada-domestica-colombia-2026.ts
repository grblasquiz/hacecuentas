/**
 * Prestaciones sociales de empleada doméstica — Colombia 2026.
 * La trabajadora doméstica tiene derecho a TODAS las prestaciones (Corte Const. C-871/2014, CST):
 *  - Cesantías: 1 mes de salario por año = (salario + auxilio) × meses / 12.
 *  - Intereses a las cesantías: 12% anual del saldo (Ley 52/1975) = cesantías × 12% × meses/12.
 *  - Prima de servicios: 1 mes de salario por año = (salario + auxilio) × meses / 12.
 *  - Vacaciones: 15 días hábiles/año, SOLO sobre salario (sin auxilio) = salario × meses / 24.
 *  - Auxilio de transporte ($249.095) entra en la base de cesantías/prima/intereses si gana ≤ 2 SMLMV;
 *    NO entra en vacaciones. Constantes en src/lib/data/colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  mesesTrabajados?: number | string;
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
  if (salario <= 0) throw new Error('Ingresá el salario mensual de la empleada doméstica');

  // Meses trabajados en el año (1 a 12). Por defecto, año completo.
  let meses = num(i.mesesTrabajados, 12);
  meses = Math.min(12, Math.max(0, meses));
  if (meses <= 0) throw new Error('Ingresá cuántos meses trabajó en el año (1 a 12)');

  // Auxilio de transporte: aplica si el salario es de hasta 2 SMLMV; entra en la base de
  // cesantías, prima e intereses (NO en vacaciones).
  const tieneAuxilio = salario <= C.smlmv * C.topeAuxilioSmlmv;
  const auxilio = tieneAuxilio ? C.auxilioTransporte : 0;
  const baseConAuxilio = salario + auxilio;

  // Cesantías: 1 mes de salario (+ auxilio) por año → proporcional a los meses.
  const cesantias = baseConAuxilio * C.prestaciones.cesantiasPorcentaje * meses;
  // Intereses a las cesantías: 12% anual del saldo, proporcional a los meses (cesantías × 12% × meses/12).
  const intereses = cesantias * C.prestaciones.interesesCesantias * (meses / 12);
  // Prima de servicios: 1 mes de salario (+ auxilio) por año → proporcional.
  const prima = baseConAuxilio * C.prestaciones.primaPorcentaje * meses;
  // Vacaciones: 15 días hábiles/año, SOLO sobre el salario (sin auxilio). vacacionesPorcentaje es
  // tasa MENSUAL (15/360 = 1/24), así que se multiplica por los meses → salario × meses / 24.
  const vacaciones = salario * C.prestaciones.vacacionesPorcentaje * meses;

  const total = cesantias + intereses + prima + vacaciones;
  // Costo total de prestaciones como % del salario anual efectivamente pagado.
  const pctSobreSalario = (total / (salario * meses)) * 100;
  const pctTxt = pctSobreSalario.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const _insight = {
    title: 'Prestaciones que le debés a tu empleada doméstica',
    text: `Con un salario de **${fmtCOP(salario)}**${tieneAuxilio ? ` + auxilio de transporte ${fmtCOP(auxilio)}` : ''} y **${meses} ${meses === 1 ? 'mes' : 'meses'}** trabajados, las prestaciones suman **${fmtCOP(total)}**: cesantías ${fmtCOP(cesantias)}, intereses ${fmtCOP(intereses)}, prima ${fmtCOP(prima)} y vacaciones ${fmtCOP(vacaciones)}. Es **${pctTxt}%** sobre el salario pagado en el período — la trabajadora doméstica tiene derecho a TODO esto, igual que cualquier empleado del CST.${!tieneAuxilio ? ' (Sin auxilio de transporte: el salario supera 2 SMLMV.)' : ''}`,
    tone: 'good' as const,
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cesantías', value: Math.round(cesantias) },
      { label: 'Intereses (12%)', value: Math.round(intereses) },
      { label: 'Prima de servicios', value: Math.round(prima) },
      { label: 'Vacaciones', value: Math.round(vacaciones) },
    ],
    prefix: '$',
    centerValue: fmtCOP(total),
    centerLabel: `prestaciones · ${meses} ${meses === 1 ? 'mes' : 'meses'}`,
    ariaLabel: `Prestaciones totales: ${fmtCOP(total)} (cesantías ${fmtCOP(cesantias)}, intereses ${fmtCOP(intereses)}, prima ${fmtCOP(prima)}, vacaciones ${fmtCOP(vacaciones)}).`,
  };

  return {
    totalPrestaciones: fmtCOP(total),
    cesantias: `${fmtCOP(cesantias)} (1 mes/año × ${meses}/12${tieneAuxilio ? ', incluye auxilio' : ''})`,
    interesesCesantias: `${fmtCOP(intereses)} (12% anual del saldo)`,
    prima: `${fmtCOP(prima)} (1 mes/año × ${meses}/12${tieneAuxilio ? ', incluye auxilio' : ''})`,
    vacaciones: `${fmtCOP(vacaciones)} (15 días hábiles/año, solo salario)`,
    baseLiquidacion: tieneAuxilio
      ? `${fmtCOP(baseConAuxilio)} (salario ${fmtCOP(salario)} + auxilio ${fmtCOP(auxilio)})`
      : `${fmtCOP(salario)} (sin auxilio: supera 2 SMLMV)`,
    detalle: `Cesantías ${fmtCOP(cesantias)} + intereses ${fmtCOP(intereses)} + prima ${fmtCOP(prima)} + vacaciones ${fmtCOP(vacaciones)} = ${fmtCOP(total)} por ${meses} ${meses === 1 ? 'mes' : 'meses'}.`,
    _insight,
    _chart,
  };
}
