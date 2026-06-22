/**
 * Calculadora de liquidación y prestaciones laborales — República Dominicana 2026.
 * HUB laboral RD. Suma todas las prestaciones según el motivo de terminación:
 *   - Despido injustificado (art. 76, 80, 95): preaviso + cesantía + vacaciones
 *     proporcionales + regalía proporcional + salario pendiente.
 *   - Desahucio del empleador (art. 75, 76, 80): igual que el despido a efectos de
 *     preaviso y cesantía (el empleador desahucia y debe esas prestaciones).
 *   - Renuncia / dimisión del trabajador: SIN cesantía ni preaviso (los pierde),
 *     pero conserva vacaciones no disfrutadas, regalía proporcional y salario pendiente.
 *
 * Todo se expresa en días de salario ordinario × salario diario (sueldo ÷ 23,83),
 * el divisor universal de nómina dominicano (Reglamento 258-93).
 * Fuente de tasas y escalas: republica-dominicana-2026.ts (Código de Trabajo, Ley 16-92).
 */
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  fmtDOP,
  salarioDiario,
  cesantiaDias,
  preavisoDias,
  regaliaPascual,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual: number;
  anios: number;
  meses: number;
  motivo: 'despido-injustificado' | 'desahucio' | 'renuncia';
  /** Meses del año en curso ya trabajados (para regalía proporcional). Default 12. */
  mesesAnioRegalia?: number;
}

export interface Outputs {
  total: number | string;
  cesantia: number;
  preaviso: number;
  vacaciones: number;
  regalia: number;
  salarioPendiente: number;
  diasCesantia: number;
  diasPreaviso: number;
  diasVacaciones: number;
  salarioDiarioRd: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
  _chart?: any;
}

/** Días de vacaciones proporcionales (art. 177/180) según meses trabajados en el último año. */
function diasVacacionesProporcional(anios: number, mesesExtra: number): number {
  const totalMeses = anios * 12 + mesesExtra;
  const vac = RD.laboral.vacaciones;
  // ≥5 años: derecho a 18 días por año completo.
  if (totalMeses >= 60) return vac.desde5anios;
  // ≥1 año (<5): 14 días por el último año completo.
  if (totalMeses >= 12) return vac.menos5anios;
  // <1 año: tabla proporcional del art. 180 (meses → días).
  const tabla = vac.proporcional as Record<number, number>;
  const m = Math.floor(mesesExtra);
  if (m >= 12) return vac.menos5anios;
  if (tabla[m] != null) return tabla[m];
  // Bajo 5 meses no genera vacaciones proporcionales por ley.
  return 0;
}

export function calculadoraLiquidacionRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const anios = Math.max(0, Math.floor(Number(i.anios) || 0));
  const mesesExtra = Math.max(0, Math.min(11, Math.floor(Number(i.meses) || 0)));
  const motivo = i.motivo || 'despido-injustificado';
  const mesesAnioRegalia = Math.max(
    0,
    Math.min(12, i.mesesAnioRegalia == null ? 12 : Number(i.mesesAnioRegalia)),
  );

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  const totalMeses = anios * 12 + mesesExtra;
  const diario = salarioDiario(salario);

  // Cesantía y preaviso solo aplican si NO es renuncia.
  const aplicaCesantiaPreaviso = motivo === 'despido-injustificado' || motivo === 'desahucio';
  const diasCesantia = aplicaCesantiaPreaviso ? cesantiaDias(totalMeses) : 0;
  const diasPreaviso = aplicaCesantiaPreaviso ? preavisoDias(totalMeses) : 0;

  const cesantia = diasCesantia * diario;
  const preaviso = diasPreaviso * diario;

  // Vacaciones no disfrutadas (todos los motivos las conservan).
  const diasVacaciones = diasVacacionesProporcional(anios, mesesExtra);
  const vacaciones = diasVacaciones * diario;

  // Regalía pascual proporcional al período del año en curso = (salario × meses) ÷ 12.
  const regalia = regaliaPascual(salario * mesesAnioRegalia);

  // Salario pendiente: por defecto asumimos que el último mes está saldado; lo dejamos
  // en 0 y lo documentamos (el trabajador puede sumar días sueltos aparte).
  const salarioPendiente = 0;

  const total = cesantia + preaviso + vacaciones + regalia + salarioPendiente;

  const formula =
    `Liquidación = cesantía (${diasCesantia} días) + preaviso (${diasPreaviso} días) ` +
    `+ vacaciones (${diasVacaciones} días) + regalía proporcional + salario pendiente, ` +
    `con salario diario = ${fmtDOP(salario)} ÷ 23,83 = ${fmtDOP(diario)}`;

  const motivoTxt =
    motivo === 'renuncia'
      ? 'renuncia (dimisión)'
      : motivo === 'desahucio'
        ? 'desahucio del empleador'
        : 'despido injustificado';

  const explicacion =
    `Antigüedad: ${anios} año(s) y ${mesesExtra} mes(es) (${totalMeses} meses). ` +
    `Motivo: ${motivoTxt}. Salario diario = ${fmtDOP(diario)}. ` +
    (aplicaCesantiaPreaviso
      ? `Cesantía: ${diasCesantia} días = ${fmtDOP(cesantia)}. Preaviso: ${diasPreaviso} días = ${fmtDOP(preaviso)}. `
      : `Por ser una renuncia, NO corresponden cesantía ni preaviso. `) +
    `Vacaciones no disfrutadas: ${diasVacaciones} días = ${fmtDOP(vacaciones)}. ` +
    `Regalía pascual proporcional (${mesesAnioRegalia} meses ÷ 12): ${fmtDOP(regalia)} (exenta de ISR y sin TSS). ` +
    `Total a recibir: ${fmtDOP(total)}.`;

  const _insight = {
    title:
      motivo === 'renuncia'
        ? `Por renuncia te corresponden ${fmtDOP(total)}`
        : `Tu liquidación es de ${fmtDOP(total)}`,
    text:
      motivo === 'renuncia'
        ? `Al renunciar **perdés cesantía y preaviso**, pero conservás **vacaciones no disfrutadas (${fmtDOP(vacaciones)})** y **regalía proporcional (${fmtDOP(regalia)})**. Total: **${fmtDOP(total)}**.`
        : `Por ${motivoTxt} con ${anios} año(s) y ${mesesExtra} mes(es), el grueso es la **cesantía (${fmtDOP(cesantia)})** más el **preaviso (${fmtDOP(preaviso)})**. Sumando vacaciones y regalía, el total es **${fmtDOP(total)}**.`,
    tone: (motivo === 'renuncia' ? 'neutral' : 'good') as 'good' | 'warn' | 'neutral',
    icon: '🇩🇴',
  };

  const _table = {
    title: 'Desglose de tu liquidación',
    headers: ['Concepto', 'Días', 'Monto'],
    align: ['left', 'right', 'right'],
    rows: [
      ['Auxilio de cesantía (art. 80)', aplicaCesantiaPreaviso ? String(diasCesantia) : '—', fmtDOP(cesantia)],
      ['Preaviso (art. 76)', aplicaCesantiaPreaviso ? String(diasPreaviso) : '—', fmtDOP(preaviso)],
      ['Vacaciones no disfrutadas (art. 177)', String(diasVacaciones), fmtDOP(vacaciones)],
      ['Regalía pascual proporcional (art. 219)', '—', fmtDOP(regalia)],
      ['Salario pendiente', '—', fmtDOP(salarioPendiente)],
    ],
    footer: ['Total a recibir', '', fmtDOP(total)],
    note: 'Salario diario = sueldo mensual ÷ 23,83. La regalía está exenta de ISR y no cotiza a la TSS. En la renuncia no hay cesantía ni preaviso.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cesantía', value: Math.round(cesantia) },
      { label: 'Preaviso', value: Math.round(preaviso) },
      { label: 'Vacaciones', value: Math.round(vacaciones) },
      { label: 'Regalía', value: Math.round(regalia) },
    ].filter((s) => s.value > 0),
    prefix: 'RD$',
    centerValue: fmtDOP(total),
    centerLabel: 'Liquidación',
    ariaLabel: 'Composición de la liquidación laboral: cesantía, preaviso, vacaciones y regalía',
  };

  return {
    total: fmtDOP(total) + ' · total a recibir',
    cesantia: Math.round(cesantia),
    preaviso: Math.round(preaviso),
    vacaciones: Math.round(vacaciones),
    regalia: Math.round(regalia),
    salarioPendiente: Math.round(salarioPendiente),
    diasCesantia,
    diasPreaviso,
    diasVacaciones,
    salarioDiarioRd: Math.round(diario),
    formula,
    explicacion,
    _insight,
    _table,
    _chart,
  };
}
