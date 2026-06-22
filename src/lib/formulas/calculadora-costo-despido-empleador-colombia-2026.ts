/**
 * Costo TOTAL del despido sin justa causa para el EMPLEADOR — Colombia 2026.
 * Ángulo "cuánto me cuesta echarlo": desembolso de una sola vez al terminar el
 * contrato a término indefinido sin justa causa.
 *
 *   Costo = indemnización (art. 64 CST) + prestaciones sociales pendientes
 *           (cesantías + intereses 12% + prima + vacaciones, proporcionales al
 *            tiempo no liquidado del año en curso).
 *
 * Indemnización (término indefinido, art. 64 CST):
 *  - Salario < 10 SMLMV: 30 días por el 1er año + 20 por cada año subsiguiente.
 *  - Salario ≥ 10 SMLMV: 20 días por el 1er año + 15 por cada año subsiguiente.
 *
 * Reusa `indemnizacionDespido` y `prestaciones` de colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  aniosServicio?: number | string;
  mesesServicio?: number | string;
  mesesPendientesPrestaciones?: number | string; // meses del año en curso sin liquidar (default 6)
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

  const anios = Math.max(0, num(i.aniosServicio, 0));
  const meses = Math.max(0, num(i.mesesServicio, 0));
  const T = anios + meses / 12; // tiempo total de servicio (años con fracción)
  if (T <= 0) throw new Error('Ingresá la antigüedad del empleado (años y/o meses)');

  const valorDia = salario / 30;
  const diezSmlmv = C.smlmv * 10; // $17.509.050 en 2026
  const menor10 = salario < diezSmlmv;

  // ── Indemnización art. 64 CST (término indefinido) ──
  const tabla = menor10 ? C.indemnizacionDespido.menos10Smlmv : C.indemnizacionDespido.desde10Smlmv;
  let diasIndem: number;
  if (T <= 1) {
    diasIndem = tabla.diasPrimerAnio;
  } else {
    diasIndem = tabla.diasPrimerAnio + tabla.diasPorAnioAdicional * (T - 1);
  }
  const indemnizacion = diasIndem * valorDia;

  // ── Prestaciones sociales pendientes (proporcionales a los meses del año en curso) ──
  // Por defecto se asume medio año pendiente (la prima se liquida cada semestre).
  let mesesPend = num(i.mesesPendientesPrestaciones, 6);
  mesesPend = Math.min(12, Math.max(0, mesesPend));

  // Auxilio de transporte entra en cesantías/prima/intereses si gana ≤ 2 SMLMV.
  const tieneAuxilio = salario <= C.smlmv * C.topeAuxilioSmlmv;
  const auxilio = tieneAuxilio ? C.auxilioTransporte : 0;
  const baseConAux = salario + auxilio;

  const prop = mesesPend / 12;
  const cesantias = baseConAux * prop;
  const intereses = cesantias * C.prestaciones.interesesCesantias * prop;
  const prima = baseConAux * prop;
  const vacaciones = salario * (mesesPend / 24); // 15 días hábiles/año = salario × meses/24
  const prestaciones = cesantias + intereses + prima + vacaciones;

  const costoTotal = indemnizacion + prestaciones;

  const _insight = {
    title: 'Lo que te cuesta despedir sin justa causa',
    text: `Echar a un empleado con salario de **${fmtCOP(salario)}** y ${T.toLocaleString('es-CO', { maximumFractionDigits: 2 })} años de antigüedad cuesta **${fmtCOP(costoTotal)}** de una vez: **${fmtCOP(indemnizacion)}** de indemnización (${diasIndem.toLocaleString('es-CO', { maximumFractionDigits: 1 })} días, tabla ${menor10 ? '30 + 20' : '20 + 15'} del art. 64 CST porque el salario ${menor10 ? 'es menor a' : 'iguala o supera'} 10 SMLMV) **más ${fmtCOP(prestaciones)}** de prestaciones pendientes (cesantías, intereses, prima y vacaciones proporcionales). La indemnización es la sanción; las prestaciones las debés siempre.`,
    tone: 'warn' as const,
    icon: '🏢',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Indemnización (${diasIndem.toLocaleString('es-CO', { maximumFractionDigits: 0 })} días)`, value: Math.round(indemnizacion) },
      { label: 'Cesantías + intereses', value: Math.round(cesantias + intereses) },
      { label: 'Prima', value: Math.round(prima) },
      { label: 'Vacaciones', value: Math.round(vacaciones) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCOP(costoTotal),
    centerLabel: 'costo del despido',
    ariaLabel: `Costo total del despido ${fmtCOP(costoTotal)}: indemnización ${fmtCOP(indemnizacion)} más prestaciones pendientes ${fmtCOP(prestaciones)}.`,
  };

  return {
    costoTotal: fmtCOP(costoTotal),
    indemnizacion: `${fmtCOP(indemnizacion)} (${diasIndem.toLocaleString('es-CO', { maximumFractionDigits: 1 })} días × ${fmtCOP(valorDia)})`,
    prestacionesPendientes: `${fmtCOP(prestaciones)} (${mesesPend.toLocaleString('es-CO', { maximumFractionDigits: 1 })} meses sin liquidar)`,
    cesantias: `${fmtCOP(cesantias)} (+ intereses ${fmtCOP(intereses)})`,
    prima: `${fmtCOP(prima)}`,
    vacaciones: `${fmtCOP(vacaciones)}`,
    tablaAplicada: menor10
      ? 'Salario < 10 SMLMV ($17.509.050): 30 días el 1er año + 20 por año adicional'
      : 'Salario ≥ 10 SMLMV ($17.509.050): 20 días el 1er año + 15 por año adicional',
    detalle: `Indemnización ${fmtCOP(indemnizacion)} + prestaciones pendientes ${fmtCOP(prestaciones)} = ${fmtCOP(costoTotal)} de desembolso total.`,
    nota: 'Costo del despido a término indefinido sin justa causa. NO incluye salarios ya pagados ni aportes a seguridad social del último mes (esos se pagan corrientes). Si el contrato fuera a término fijo, la indemnización sería el salario del tiempo que faltaba, no la tabla 30/20. Casos con fuero (sindical, maternidad, salud) pueden encarecer o impedir el despido.',
    _insight,
    _chart,
  };
}
