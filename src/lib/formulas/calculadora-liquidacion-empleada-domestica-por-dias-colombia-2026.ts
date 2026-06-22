/**
 * Liquidación de empleada del hogar POR DÍAS — Colombia 2026.
 *
 * Distinto de la calc de costo mensual por días (empleada-domestica-dias-colombia-2026,
 * que estima el costo recurrente + PILA): acá se calcula la LIQUIDACIÓN FINAL cuando la
 * trabajadora doméstica por días deja el empleo, con fecha de ingreso y de salida.
 *
 * La trabajadora doméstica tiene derecho a TODAS las prestaciones (Corte Const. C-871/2014):
 *  - Salario proporcional pendiente del último período.
 *  - Cesantías: 1 mes de salario por año = base × días/360.
 *  - Intereses a las cesantías: 12% anual del saldo (Ley 52/1975).
 *  - Prima de servicios: 1 mes de salario por año = base × días/360.
 *  - Vacaciones: 15 días hábiles/año, SOLO sobre salario = salario × días/720.
 *  - Auxilio de transporte proporcional: entra en la base de cesantías/prima/intereses si
 *    el salario mensualizado es ≤ 2 SMLMV (NO entra en vacaciones).
 *
 * Reusa `prestaciones`, `smdlv` y `auxilioTransporte` de colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  diasSemana?: number | string; // 1 a 6 días por semana
  valorDia?: number | string;   // pago por día trabajado
  fechaIngreso?: string;        // YYYY-MM-DD
  fechaSalida?: string;         // YYYY-MM-DD
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const parseISO = (s?: string): Date | null => {
  if (!s || typeof s !== 'string') return null;
  const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
};
const diasEntre = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / 86_400_000);

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;

  const diasRaw = i.diasSemana === '' || i.diasSemana == null ? 2 : Math.round(Number(i.diasSemana));
  if (!Number.isFinite(diasRaw) || diasRaw < 1 || diasRaw > 6) {
    throw new Error('Elegí entre 1 y 6 días por semana');
  }
  const diasSemana = diasRaw;

  // Pago por día: si no lo dan, usar el mínimo legal por día (SMLMV/30 + descanso
  // dominical proporcional + auxilio diario), igual que la calc de costo por días.
  const smdlv = C.smdlv;                    // $58.363,50
  const auxDia = C.auxilioTransporte / 30;  // auxilio de transporte por día trabajado
  const domDia = smdlv / 6;                 // descanso dominical proporcional (art. 173-5 CST)
  const minimoDia = smdlv + domDia + auxDia;

  const pagoProvisto = !(i.valorDia === '' || i.valorDia == null);
  const valorDia = pagoProvisto ? Number(i.valorDia) : minimoDia;
  if (pagoProvisto && (!Number.isFinite(valorDia) || valorDia <= 0)) {
    throw new Error('Ingresá un valor por día válido (o dejalo vacío para usar el mínimo legal)');
  }

  const fIng = parseISO(i.fechaIngreso);
  const fSal = parseISO(i.fechaSalida);
  if (!fIng) throw new Error('Ingresá la fecha de ingreso (YYYY-MM-DD)');
  if (!fSal) throw new Error('Ingresá la fecha de salida (YYYY-MM-DD)');
  if (fSal < fIng) throw new Error('La fecha de salida no puede ser anterior a la de ingreso');

  const diasCalendario = Math.max(0, diasEntre(fIng, fSal));
  if (diasCalendario <= 0) throw new Error('El período trabajado debe ser de al menos un día');

  // Mensualización del pago (52 semanas / 12 meses ≈ 4,333 semanas por mes).
  const diasMes = diasSemana * (52 / 12);
  const salarioMensualizado = Math.max(0, valorDia - auxDia) * diasMes; // parte salarial
  const auxMensualizado = Math.min(valorDia, auxDia) * diasMes;          // parte auxilio

  // El auxilio de transporte entra en la base prestacional si el mensualizado ≤ 2 SMLMV.
  const totalMensualizado = valorDia * diasMes;
  const tieneAuxilio = totalMensualizado <= C.smlmv * C.topeAuxilioSmlmv;
  const auxParaBase = tieneAuxilio ? auxMensualizado : 0;
  const baseConAux = salarioMensualizado + auxParaBase;

  // Proporción del año trabajado (base 360).
  const prop = diasCalendario / 360;

  // Cesantías (1 mes/año), intereses (12% del saldo), prima (1 mes/año), vacaciones (15 días hábiles).
  const cesantias = baseConAux * prop;
  const intereses = cesantias * C.prestaciones.interesesCesantias * (diasCalendario / 360);
  const prima = baseConAux * prop;
  const vacaciones = salarioMensualizado * (diasCalendario / 720);

  const prestaciones = cesantias + intereses + prima + vacaciones;
  const total = prestaciones;

  const _insight = {
    title: 'Liquidación de tu empleada por días',
    text: `Trabajando **${diasSemana} día${diasSemana === 1 ? '' : 's'} a la semana** a **${fmtCOP(valorDia)}** el día, durante ${diasCalendario.toLocaleString('es-CO')} días (~${(diasCalendario / 30).toLocaleString('es-CO', { maximumFractionDigits: 1 })} meses), la liquidación es de **${fmtCOP(total)}**: cesantías ${fmtCOP(cesantias)}, intereses ${fmtCOP(intereses)}, prima ${fmtCOP(prima)} y vacaciones ${fmtCOP(vacaciones)}. La trabajadora doméstica por días tiene derecho a TODAS las prestaciones, proporcionales al tiempo${tieneAuxilio ? ', incluido el auxilio de transporte en la base de cesantías y prima' : ' (el salario mensualizado supera 2 SMLMV: sin auxilio en la base)'}.`,
    tone: 'good' as const,
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cesantías', value: Math.round(cesantias) },
      { label: 'Intereses (12%)', value: Math.round(intereses) },
      { label: 'Prima', value: Math.round(prima) },
      { label: 'Vacaciones', value: Math.round(vacaciones) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCOP(total),
    centerLabel: 'liquidación',
    ariaLabel: `Liquidación total ${fmtCOP(total)}: cesantías ${fmtCOP(cesantias)}, intereses ${fmtCOP(intereses)}, prima ${fmtCOP(prima)}, vacaciones ${fmtCOP(vacaciones)}.`,
  };

  return {
    totalLiquidacion: fmtCOP(total),
    cesantias: `${fmtCOP(cesantias)} (1 mes/año × ${diasCalendario.toLocaleString('es-CO')}/360${tieneAuxilio ? ', incluye auxilio' : ''})`,
    interesesCesantias: `${fmtCOP(intereses)} (12% anual del saldo)`,
    prima: `${fmtCOP(prima)} (1 mes/año proporcional${tieneAuxilio ? ', incluye auxilio' : ''})`,
    vacaciones: `${fmtCOP(vacaciones)} (15 días hábiles/año, solo salario)`,
    salarioMensualizado: `${fmtCOP(totalMensualizado)} (${diasMes.toLocaleString('es-CO', { maximumFractionDigits: 1 })} días/mes × ${fmtCOP(valorDia)})`,
    auxilioProporcional: tieneAuxilio
      ? `${fmtCOP(auxParaBase * prop)} incluido en la base prestacional`
      : 'No aplica (mensualizado mayor a 2 SMLMV)',
    detalle: `Cesantías ${fmtCOP(cesantias)} + intereses ${fmtCOP(intereses)} + prima ${fmtCOP(prima)} + vacaciones ${fmtCOP(vacaciones)} = ${fmtCOP(total)} por ${diasCalendario.toLocaleString('es-CO')} días.`,
    nota: 'La trabajadora doméstica por días tiene los mismos derechos prestacionales que cualquier empleada (Corte Constitucional C-871/2014). Si trabaja por días para varios hogares, cada empleador liquida en proporción a los días que trabajó para él. Además se le deben los aportes a seguridad social por semanas (Decreto 2616/2013) durante la relación.',
    _insight,
    _chart,
  };
}
