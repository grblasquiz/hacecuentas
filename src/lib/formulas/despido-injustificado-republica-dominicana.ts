/**
 * Indemnización por despido injustificado — República Dominicana 2026 (Art. 95).
 *
 * Cuando un empleador despide sin causa justificada (art. 95 del Código de Trabajo,
 * Ley 16-92), debe pagar al trabajador:
 *   - Preaviso (art. 76)        — días de salario según antigüedad.
 *   - Auxilio de cesantía (art. 80) — días de salario según antigüedad.
 *   - Vacaciones no disfrutadas (art. 177).
 *   - Regalía pascual proporcional (art. 219) — salario × meses del año ÷ 12.
 *
 * Todo en días de salario ordinario, donde el salario diario = salario mensual ÷
 * 23,83 (divisor universal de nómina dominicano, Reglamento 258-93).
 *
 * Escalas (días de salario):
 *   PREAVISO (art. 76):  <3 meses → 0 · 3–6 meses → 7 · 6–12 meses → 14 · +1 año → 28
 *   CESANTÍA (art. 80):  <3 meses → 0 · 3–6 meses → 6 · 6–12 meses → 13 ·
 *                         1–5 años → 21 días por año · +5 años → 23 días por año
 *
 * Data/símbolo de moneda y divisor: src/lib/data/republica-dominicana-2026.ts.
 */
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  fmtDOP,
  salarioDiario,
} from '../data/republica-dominicana-2026';

export interface DespidoInjustificadoInputs {
  /** Salario mensual ordinario (RD$). */
  salarioMensual?: number | string;
  /** Años completos de servicio. */
  aniosServicio?: number | string;
  /** Meses adicionales sobre los años completos (0–11). Default 0. */
  mesesAdicionales?: number | string;
  /** Meses del año en curso ya trabajados, para la regalía. Default 12. */
  mesesTrabajadosAnio?: number | string;
  /** Días de vacaciones pendientes de disfrutar. Default 0. */
  diasVacacionesPend?: number | string;
}

export interface DespidoInjustificadoOutputs {
  total: number | string;
  salarioDiario: number;
  preaviso: number;
  cesantia: number;
  vacaciones: number;
  regalia: number;
  diasPreaviso: number;
  diasCesantia: number;
  detalle: string;
  _insight?: any;
  _table?: any;
  _chart?: any;
}

export function despidoInjustificadoRepublicaDominicana(
  i: DespidoInjustificadoInputs,
): DespidoInjustificadoOutputs {
  const salarioMensual = Math.max(0, Number(i.salarioMensual) || 0);
  const aniosServicio = Math.max(0, Number(i.aniosServicio) || 0);
  const mesesAdicionales = Math.max(0, Math.min(11, Number(i.mesesAdicionales) || 0));
  const mesesTrabajadosAnio = Math.max(
    0,
    Math.min(12, i.mesesTrabajadosAnio == null || i.mesesTrabajadosAnio === '' ? 12 : Number(i.mesesTrabajadosAnio)),
  );
  const diasVacacionesPend = Math.max(0, Number(i.diasVacacionesPend) || 0);

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  // Salario diario = mensual ÷ 23,83 (divisor universal de nómina).
  const sd = salarioDiario(salarioMensual);

  // Antigüedad total en años (con fracción de meses).
  const totalAnios = aniosServicio + mesesAdicionales / 12;

  // PREAVISO (art. 76): días según antigüedad.
  let diasPreaviso: number;
  if (totalAnios < 0.25) diasPreaviso = 0; // < 3 meses
  else if (totalAnios < 0.5) diasPreaviso = 7; // 3–6 meses
  else if (totalAnios < 1) diasPreaviso = 14; // 6–12 meses
  else diasPreaviso = 28; // +1 año
  const preaviso = diasPreaviso * sd;

  // CESANTÍA (art. 80): días según antigüedad. Los tramos por año multiplican por
  // la antigüedad completa (incluida la fracción).
  let diasCesantia: number;
  if (totalAnios < 0.25) diasCesantia = 0; // < 3 meses
  else if (totalAnios < 0.5) diasCesantia = 6; // 3–6 meses
  else if (totalAnios < 1) diasCesantia = 13; // 6–12 meses
  else if (totalAnios <= 5) diasCesantia = 21 * totalAnios; // 1–5 años: 21 días/año
  else diasCesantia = 23 * totalAnios; // +5 años: 23 días/año
  const cesantia = diasCesantia * sd;

  // Vacaciones pendientes (art. 177).
  const vacaciones = diasVacacionesPend * sd;

  // Regalía pascual proporcional (art. 219): salario × meses del año ÷ 12.
  const regalia = (salarioMensual / 12) * mesesTrabajadosAnio;

  const total = preaviso + cesantia + vacaciones + regalia;

  const detalle =
    `Salario diario = ${fmtDOP(salarioMensual)} ÷ ${RD.divisorDiario} = ${fmtDOP(sd)}. ` +
    `Preaviso ${diasPreaviso} días = ${fmtDOP(preaviso)}. ` +
    `Cesantía ${diasCesantia % 1 === 0 ? diasCesantia : diasCesantia.toFixed(2)} días = ${fmtDOP(cesantia)}. ` +
    `Vacaciones ${diasVacacionesPend} días = ${fmtDOP(vacaciones)}. ` +
    `Regalía proporcional (${mesesTrabajadosAnio}/12) = ${fmtDOP(regalia)}. ` +
    `Total = ${fmtDOP(total)}.`;

  const _insight = {
    title: `Te corresponden ${fmtDOP(total)}`,
    text:
      `Por un despido injustificado (art. 95) con **${aniosServicio} año(s) y ${mesesAdicionales} mes(es)** de antigüedad, ` +
      `el grueso es la **cesantía (${fmtDOP(cesantia)})** más el **preaviso (${fmtDOP(preaviso)})**. ` +
      `Sumando vacaciones (${fmtDOP(vacaciones)}) y regalía proporcional (${fmtDOP(regalia)}), el total es **${fmtDOP(total)}**.`,
    tone: 'good' as const,
    icon: '🇩🇴',
  };

  const _table = {
    title: 'Desglose de la indemnización por despido injustificado',
    headers: ['Concepto', 'Días', 'Monto'],
    align: ['left', 'right', 'right'],
    rows: [
      ['Preaviso (art. 76)', String(diasPreaviso), fmtDOP(preaviso)],
      ['Auxilio de cesantía (art. 80)', diasCesantia % 1 === 0 ? String(diasCesantia) : diasCesantia.toFixed(2), fmtDOP(cesantia)],
      ['Vacaciones no disfrutadas (art. 177)', String(diasVacacionesPend), fmtDOP(vacaciones)],
      ['Regalía pascual proporcional (art. 219)', '—', fmtDOP(regalia)],
    ],
    footer: ['Total a recibir', '', fmtDOP(total)],
    note: 'Salario diario = sueldo mensual ÷ 23,83. La regalía está exenta de ISR y no cotiza a la TSS.',
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
    centerLabel: 'Indemnización',
    ariaLabel: 'Composición de la indemnización por despido injustificado: cesantía, preaviso, vacaciones y regalía',
  };

  return {
    total: fmtDOP(total) + ' · total a recibir',
    salarioDiario: Math.round(sd * 100) / 100,
    preaviso: Math.round(preaviso * 100) / 100,
    cesantia: Math.round(cesantia * 100) / 100,
    vacaciones: Math.round(vacaciones * 100) / 100,
    regalia: Math.round(regalia * 100) / 100,
    diasPreaviso,
    diasCesantia: Math.round(diasCesantia * 100) / 100,
    detalle,
    _insight,
    _table,
    _chart,
  };
}
