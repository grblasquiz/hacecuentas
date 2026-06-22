/**
 * Liquidación de contrato a TÉRMINO FIJO sin justa causa — Colombia 2026.
 *
 * Se distingue del contrato a término indefinido en la INDEMNIZACIÓN (art. 64 CST):
 *  - Término fijo: el empleador paga los salarios del TIEMPO QUE FALTABA para la
 *    fecha de terminación pactada (NO la tabla 30/20 ni 20/15 del indefinido).
 *  - Si además no dio el preaviso de 30 días antes del vencimiento, el contrato se
 *    renueva, pero cuando se termina anticipadamente sin justa causa la indemnización
 *    es siempre el tiempo faltante.
 *
 * Las prestaciones sociales (cesantías, intereses 12%, prima, vacaciones) se liquidan
 * SIEMPRE de forma proporcional al tiempo trabajado, sin importar el motivo de salida.
 *
 * Reusa la mecánica de `prestaciones` (cesantías 1/12, intereses 12%, prima 1/12,
 * vacaciones 15/360) y de `indemnizacionDespido` (tiempo faltante) de colombia-2026.ts.
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  salarioMensual: number | string;
  fechaInicio?: string;      // YYYY-MM-DD
  fechaFinPactada?: string;  // YYYY-MM-DD — vencimiento del contrato
  fechaTerminacion?: string; // YYYY-MM-DD — día real de la salida
  sinJustaCausa?: string;    // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** ''/null/undefined → default; nunca pisa un 0 válido. */
const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

/** Parsea YYYY-MM-DD a Date local (mediodía para evitar saltos por zona horaria). */
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
  const salario = num(i.salarioMensual);
  if (salario <= 0) throw new Error('Ingresá tu salario mensual');

  const fIni = parseISO(i.fechaInicio);
  const fFin = parseISO(i.fechaFinPactada);
  const fTerm = parseISO(i.fechaTerminacion);
  if (!fIni) throw new Error('Ingresá la fecha de inicio del contrato (YYYY-MM-DD)');
  if (!fFin) throw new Error('Ingresá la fecha de terminación pactada (YYYY-MM-DD)');
  if (!fTerm) throw new Error('Ingresá la fecha en que terminó realmente (YYYY-MM-DD)');
  if (fFin <= fIni) throw new Error('La fecha de terminación pactada debe ser posterior al inicio');
  if (fTerm < fIni) throw new Error('La fecha de terminación real no puede ser anterior al inicio');

  const sinCausa = String(i.sinJustaCausa ?? 'si') !== 'no';

  // ── Tiempo trabajado (para prestaciones) ──
  const diasTrabajados = Math.max(0, diasEntre(fIni, fTerm));
  // Base 360 (año comercial) para prestaciones, como es estándar en Colombia.
  const valorDia = salario / 30;

  // Auxilio de transporte: entra en la base de cesantías/prima/intereses si gana ≤ 2 SMLMV.
  const tieneAuxilio = salario <= C.smlmv * C.topeAuxilioSmlmv;
  const auxilio = tieneAuxilio ? C.auxilioTransporte : 0;
  const baseConAux = salario + auxilio;

  // Prestaciones proporcionales (proporción = días/360).
  const propAnual = diasTrabajados / 360;
  const cesantias = baseConAux * propAnual;                       // 1 mes/año
  const intereses = cesantias * C.prestaciones.interesesCesantias // 12% del saldo, proporcional al tiempo
    * (diasTrabajados / 360);
  const prima = baseConAux * propAnual;                           // 1 mes/año
  // Vacaciones: 15 días hábiles/año, SOLO sobre salario (sin auxilio) = salario × días/720.
  const vacacionesReal = salario * (diasTrabajados / 720);
  const prestaciones = cesantias + intereses + prima + vacacionesReal;

  // ── Indemnización art. 64 CST (término fijo): salarios del tiempo FALTANTE ──
  let diasFaltantes = 0;
  let indemnizacion = 0;
  if (sinCausa && fTerm < fFin) {
    diasFaltantes = diasEntre(fTerm, fFin);
    indemnizacion = valorDia * diasFaltantes;
  }
  const mesesFaltantes = diasFaltantes / 30;

  const total = prestaciones + indemnizacion;

  // Texto del motivo.
  const motivoTxt = !sinCausa
    ? 'Con justa causa o por vencimiento del término: no hay indemnización, solo prestaciones proporcionales.'
    : fTerm >= fFin
      ? 'El contrato llegó a su fecha pactada: no hay tiempo faltante que indemnizar, solo prestaciones.'
      : `Terminación anticipada sin justa causa: la indemnización son los salarios de los ${diasFaltantes.toLocaleString('es-CO')} días (${mesesFaltantes.toLocaleString('es-CO', { maximumFractionDigits: 1 })} meses) que faltaban hasta el ${i.fechaFinPactada}.`;

  const _insight = {
    title: 'Tu liquidación de contrato a término fijo',
    text: `Con un salario de **${fmtCOP(salario)}** y ${diasTrabajados.toLocaleString('es-CO')} días trabajados, te corresponden **${fmtCOP(total)}**: ${fmtCOP(prestaciones)} de prestaciones proporcionales (cesantías ${fmtCOP(cesantias)}, intereses ${fmtCOP(intereses)}, prima ${fmtCOP(prima)} y vacaciones ${fmtCOP(vacacionesReal)})${indemnizacion > 0 ? ` **más ${fmtCOP(indemnizacion)}** de indemnización por los ${diasFaltantes.toLocaleString('es-CO')} días que faltaban del contrato (art. 64 CST, distinta de la tabla 30/20 del indefinido)` : ' (sin indemnización en este caso)'}. La indemnización del fijo es el **tiempo faltante**, no 30 + 20 días.`,
    tone: (indemnizacion > 0 ? 'good' : 'neutral') as 'good' | 'neutral' | 'warn',
    icon: '⚖️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cesantías', value: Math.round(cesantias) },
      { label: 'Intereses (12%)', value: Math.round(intereses) },
      { label: 'Prima', value: Math.round(prima) },
      { label: 'Vacaciones', value: Math.round(vacacionesReal) },
      ...(indemnizacion > 0 ? [{ label: 'Indemnización (tiempo faltante)', value: Math.round(indemnizacion) }] : []),
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCOP(total),
    centerLabel: 'liquidación total',
    ariaLabel: `Liquidación total ${fmtCOP(total)}: prestaciones ${fmtCOP(prestaciones)}${indemnizacion > 0 ? ` más indemnización ${fmtCOP(indemnizacion)} por tiempo faltante` : ''}.`,
  };

  return {
    totalLiquidacion: fmtCOP(total),
    indemnizacion: indemnizacion > 0
      ? `${fmtCOP(indemnizacion)} (${diasFaltantes.toLocaleString('es-CO')} días faltantes × ${fmtCOP(valorDia)})`
      : 'No aplica en este caso',
    prestaciones: `${fmtCOP(prestaciones)} (proporcionales a ${diasTrabajados.toLocaleString('es-CO')} días)`,
    cesantias: `${fmtCOP(cesantias)} (1 mes/año${tieneAuxilio ? ', incluye auxilio' : ''})`,
    interesesCesantias: `${fmtCOP(intereses)} (12% anual del saldo)`,
    prima: `${fmtCOP(prima)} (1 mes/año${tieneAuxilio ? ', incluye auxilio' : ''})`,
    vacaciones: `${fmtCOP(vacacionesReal)} (15 días hábiles/año, solo salario)`,
    valorDia: `${fmtCOP(valorDia)} (salario ÷ 30)`,
    motivo: motivoTxt,
    nota: 'En el contrato a término fijo la indemnización es el salario del tiempo que faltaba para la fecha pactada (art. 64 CST), no la tabla de 30 + 20 días del contrato indefinido. Además el empleador debe preavisar la no renovación con 30 días de anticipación; si no lo hace, el contrato se renueva por un período igual.',
    _insight,
    _chart,
  };
}
