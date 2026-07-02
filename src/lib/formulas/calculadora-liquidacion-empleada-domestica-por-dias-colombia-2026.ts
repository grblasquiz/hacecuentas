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
  // Prestaciones ya pagadas oportunamente durante la relación (opcionales, $).
  // Se descuentan del total devengado para mostrar el saldo real pendiente.
  cesantiasPagadas?: number | string;
  interesesPagados?: number | string;
  primaPagada?: number | string;
  vacacionesPagadas?: number | string;
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

  // Total DEVENGADO por el período completo (el derecho acumulado).
  const devengado = cesantias + intereses + prima + vacaciones;

  // Montos ya pagados oportunamente durante la relación (opcionales). Muchos
  // empleadores formales pagan la prima semestral (junio/diciembre), consignan
  // las cesantías al fondo cada febrero y dan las vacaciones cada año: eso NO se
  // vuelve a deber en la liquidación final. Se descuenta por concepto y nunca
  // baja de 0. Sin montos cargados, el saldo = devengado (comportamiento previo).
  const cesantiasPag = Math.max(0, num(i.cesantiasPagadas));
  const interesesPag = Math.max(0, num(i.interesesPagados));
  const primaPag = Math.max(0, num(i.primaPagada));
  const vacacionesPag = Math.max(0, num(i.vacacionesPagadas));
  const yaPagado = cesantiasPag + interesesPag + primaPag + vacacionesPag;
  const hayPagos = yaPagado > 0;

  const cesantiasPend = Math.max(0, cesantias - cesantiasPag);
  const interesesPend = Math.max(0, intereses - interesesPag);
  const primaPend = Math.max(0, prima - primaPag);
  const vacacionesPend = Math.max(0, vacaciones - vacacionesPag);
  const pendiente = cesantiasPend + interesesPend + primaPend + vacacionesPend;

  // El resultado principal es el SALDO PENDIENTE a pagar en la liquidación.
  const total = pendiente;

  const _insight = {
    title: 'Liquidación de tu empleada por días',
    text: hayPagos
      ? `Por ${diasCalendario.toLocaleString('es-CO')} días trabajando **${diasSemana} día${diasSemana === 1 ? '' : 's'} a la semana** a **${fmtCOP(valorDia)}** el día, el total **devengado** en prestaciones es **${fmtCOP(devengado)}**. Como ya pagaste **${fmtCOP(yaPagado)}** durante la relación, el **saldo pendiente a pagar** en la liquidación es **${fmtCOP(total)}**: cesantías ${fmtCOP(cesantiasPend)}, intereses ${fmtCOP(interesesPend)}, prima ${fmtCOP(primaPend)} y vacaciones ${fmtCOP(vacacionesPend)}.`
      : `Trabajando **${diasSemana} día${diasSemana === 1 ? '' : 's'} a la semana** a **${fmtCOP(valorDia)}** el día, durante ${diasCalendario.toLocaleString('es-CO')} días (~${(diasCalendario / 30).toLocaleString('es-CO', { maximumFractionDigits: 1 })} meses), la liquidación es de **${fmtCOP(total)}**: cesantías ${fmtCOP(cesantias)}, intereses ${fmtCOP(intereses)}, prima ${fmtCOP(prima)} y vacaciones ${fmtCOP(vacaciones)}. Es el total **devengado**; si ya pagaste alguna prestación durante la relación, cargala en los campos opcionales para ver el saldo real. La trabajadora doméstica por días tiene derecho a TODAS las prestaciones, proporcionales al tiempo${tieneAuxilio ? ', incluido el auxilio de transporte en la base de cesantías y prima' : ' (el salario mensualizado supera 2 SMLMV: sin auxilio en la base)'}.`,
    tone: 'good' as const,
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cesantías', value: Math.round(cesantiasPend) },
      { label: 'Intereses (12%)', value: Math.round(interesesPend) },
      { label: 'Prima', value: Math.round(primaPend) },
      { label: 'Vacaciones', value: Math.round(vacacionesPend) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCOP(total),
    centerLabel: hayPagos ? 'saldo a pagar' : 'liquidación',
    ariaLabel: `${hayPagos ? 'Saldo pendiente' : 'Liquidación total'} ${fmtCOP(total)}: cesantías ${fmtCOP(cesantiasPend)}, intereses ${fmtCOP(interesesPend)}, prima ${fmtCOP(primaPend)}, vacaciones ${fmtCOP(vacacionesPend)}.`,
  };

  const out: Outputs = {
    totalLiquidacion: hayPagos
      ? `${fmtCOP(total)} (saldo pendiente tras descontar ${fmtCOP(yaPagado)} ya pagado)`
      : fmtCOP(total),
    cesantias: `${fmtCOP(cesantias)} (1 mes/año × ${diasCalendario.toLocaleString('es-CO')}/360${tieneAuxilio ? ', incluye auxilio' : ''})${cesantiasPag > 0 ? ` − ${fmtCOP(cesantiasPag)} pagado = ${fmtCOP(cesantiasPend)}` : ''}`,
    interesesCesantias: `${fmtCOP(intereses)} (12% anual del saldo)${interesesPag > 0 ? ` − ${fmtCOP(interesesPag)} pagado = ${fmtCOP(interesesPend)}` : ''}`,
    prima: `${fmtCOP(prima)} (1 mes/año proporcional${tieneAuxilio ? ', incluye auxilio' : ''})${primaPag > 0 ? ` − ${fmtCOP(primaPag)} pagado = ${fmtCOP(primaPend)}` : ''}`,
    vacaciones: `${fmtCOP(vacaciones)} (15 días hábiles/año, solo salario)${vacacionesPag > 0 ? ` − ${fmtCOP(vacacionesPag)} pagado = ${fmtCOP(vacacionesPend)}` : ''}`,
    salarioMensualizado: `${fmtCOP(totalMensualizado)} (${diasMes.toLocaleString('es-CO', { maximumFractionDigits: 1 })} días/mes × ${fmtCOP(valorDia)})`,
    auxilioProporcional: tieneAuxilio
      ? `${fmtCOP(auxParaBase * prop)} incluido en la base prestacional`
      : 'No aplica (mensualizado mayor a 2 SMLMV)',
    detalle: hayPagos
      ? `Devengado ${fmtCOP(devengado)} − ya pagado ${fmtCOP(yaPagado)} = saldo pendiente ${fmtCOP(total)} por ${diasCalendario.toLocaleString('es-CO')} días.`
      : `Cesantías ${fmtCOP(cesantias)} + intereses ${fmtCOP(intereses)} + prima ${fmtCOP(prima)} + vacaciones ${fmtCOP(vacaciones)} = ${fmtCOP(total)} por ${diasCalendario.toLocaleString('es-CO')} días.`,
    nota: 'El resultado es lo DEVENGADO en el período; si ya pagaste prima (semestral), consignaste cesantías o diste vacaciones oportunamente, cargá esos montos en los campos opcionales para ver el saldo real pendiente. La trabajadora doméstica por días tiene los mismos derechos prestacionales que cualquier empleada (Corte Constitucional C-871/2014). Si trabaja por días para varios hogares, cada empleador liquida en proporción a los días que trabajó para él. Además se le deben los aportes a seguridad social por semanas (Decreto 2616/2013) durante la relación.',
    _insight,
    _chart,
  };
  if (hayPagos) {
    out.totalDevengado = `${fmtCOP(devengado)} (derecho acumulado del período)`;
    out.yaPagado = `${fmtCOP(yaPagado)} (prestaciones pagadas durante la relación)`;
  }
  return out;
}
