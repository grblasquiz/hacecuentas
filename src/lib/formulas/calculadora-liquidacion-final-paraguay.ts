/**
 * Liquidación final (finiquito) PARAGUAY — Código del Trabajo (Ley 213/93).
 *
 * Suma los conceptos que correspondan al terminar la relación laboral:
 *   - Aguinaldo proporcional (art. 243): salarioMensual × mesesDelAño / 12.
 *   - Vacaciones proporcionales / no gozadas (art. 218): días según antigüedad
 *     prorrateados por los meses del año + días no gozados, × salario diario.
 *   - Preaviso (art. 87), sólo en despido injustificado sin preaviso otorgado:
 *     días según antigüedad × jornal.
 *   - Indemnización (art. 91/94), sólo en despido injustificado:
 *     15 jornales × años computables (× 2 si ≥10 años de antigüedad).
 *
 * En renuncia y mutuo acuerdo NO hay preaviso a cargo del empleador ni
 * indemnización; sólo aguinaldo proporcional + vacaciones.
 *
 * Fuente: MTESS — Código del Trabajo (Ley 213/93), arts. 87, 91, 94, 218, 243.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  salarioMensual: number;                               // salario mensual en Gs.
  anios?: number;                                       // años de antigüedad
  meses?: number;                                       // meses adicionales de antigüedad
  causa?: 'despido-injustificado' | 'renuncia' | 'mutuo-acuerdo';
  mesesDelAnio?: number;                                // meses trabajados del año en curso (para aguinaldo)
  diasVacacionesNoGozadas?: number;                     // días de vacaciones pendientes adicionales
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function preavisoDias(anios: number): number {
  for (const t of PARAGUAY_2026.laboral.preaviso) {
    if (anios <= t.hastaAnios) return t.dias;
  }
  return PARAGUAY_2026.laboral.preaviso[PARAGUAY_2026.laboral.preaviso.length - 1].dias;
}

function vacacionesDias(anios: number): number {
  for (const t of PARAGUAY_2026.laboral.vacaciones) {
    if (anios <= t.hastaAnios) return t.dias;
  }
  return PARAGUAY_2026.laboral.vacaciones[PARAGUAY_2026.laboral.vacaciones.length - 1].dias;
}

export function calculadoraLiquidacionFinalParaguay(i: Inputs): Outputs {
  const l = PARAGUAY_2026.laboral;
  const salarioMensual = Number(i.salarioMensual) || 0;
  const anios = Math.max(0, Math.floor(Number(i.anios) || 0));
  const meses = Math.max(0, Math.floor(Number(i.meses) || 0));
  const causa =
    i.causa === 'renuncia' || i.causa === 'mutuo-acuerdo' ? i.causa : 'despido-injustificado';
  const mesesDelAnio = Math.min(12, Math.max(0, Number(i.mesesDelAnio ?? 12) || 0));
  const diasNoGozadas = Math.max(0, Number(i.diasVacacionesNoGozadas) || 0);

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');

  const jornal = salarioMensual / PARAGUAY_2026.diasMes; // salario diario (/30)
  const antiguedadAnios = anios + meses / 12;
  const esDespido = causa === 'despido-injustificado';
  const tieneEstabilidad = antiguedadAnios >= l.estabilidadAniosDoble;

  // ── Aguinaldo proporcional (art. 243) ──
  const aguinaldoProporcional = (salarioMensual * mesesDelAnio) / l.aguinaldoDivisor;

  // ── Vacaciones (art. 218) ──
  // Derecho anual según antigüedad, prorrateado por los meses del año en curso,
  // más cualquier día no gozado adicional que el usuario informe.
  const diasVacAnuales = vacacionesDias(antiguedadAnios);
  const diasVacProporcionales = (diasVacAnuales * mesesDelAnio) / 12;
  const diasVacTotales = diasVacProporcionales + diasNoGozadas;
  const vacaciones = jornal * diasVacTotales;

  // ── Preaviso (art. 87) — sólo despido injustificado ──
  const diasPreaviso = esDespido ? preavisoDias(antiguedadAnios) : 0;
  const preaviso = jornal * diasPreaviso;

  // ── Indemnización (art. 91/94) — sólo despido injustificado ──
  const aniosComputables = anios + (meses > 6 ? 1 : 0);
  const indemnizacionBase = esDespido ? l.indemnizacionJornalesPorAnio * jornal * aniosComputables : 0;
  const indemnizacion = tieneEstabilidad ? indemnizacionBase * 2 : indemnizacionBase;

  const total = aguinaldoProporcional + vacaciones + preaviso + indemnizacion;

  const causaLabel: Record<string, string> = {
    'despido-injustificado': 'despido injustificado',
    renuncia: 'renuncia',
    'mutuo-acuerdo': 'mutuo acuerdo',
  };

  const _insight = {
    type: 'highlight',
    icon: '🧾',
    text:
      `Tu liquidación final por **${causaLabel[causa]}** suma **${fmtPYG(total)}**: ` +
      `aguinaldo proporcional **${fmtPYG(aguinaldoProporcional)}** + vacaciones **${fmtPYG(vacaciones)}**` +
      (esDespido
        ? ` + preaviso **${fmtPYG(preaviso)}** + indemnización **${fmtPYG(indemnizacion)}**${tieneEstabilidad ? ' (doble por estabilidad)' : ''}.`
        : `. En ${causaLabel[causa]} no corresponde preaviso ni indemnización a cargo del empleador.`),
  };

  const rows: (string | number)[][] = [
    ['Aguinaldo proporcional', `${fmtPYG(salarioMensual)} × ${mesesDelAnio} ÷ 12`, fmtPYG(aguinaldoProporcional)],
    [
      'Vacaciones proporcionales / no gozadas',
      `${diasVacTotales.toFixed(1)} días × ${fmtPYG(jornal)}`,
      fmtPYG(vacaciones),
    ],
  ];
  if (esDespido) {
    rows.push(['Preaviso', `${diasPreaviso} días × ${fmtPYG(jornal)}`, fmtPYG(preaviso)]);
    rows.push([
      'Indemnización por despido',
      `15 jornales × ${aniosComputables} año(s)${tieneEstabilidad ? ' × 2' : ''}`,
      fmtPYG(indemnizacion),
    ]);
  } else {
    rows.push(['Preaviso', 'No corresponde', '—']);
    rows.push(['Indemnización', 'No corresponde', '—']);
  }
  rows.push(['Total liquidación', '', fmtPYG(total)]);

  const _table = {
    title: 'Desglose de tu liquidación final',
    headers: ['Concepto', 'Cálculo', 'Monto'],
    rows,
    note: 'Código del Trabajo (Ley 213/93), arts. 87, 91, 94, 218 y 243. El jornal surge del salario mensual ÷ 30. Preaviso e indemnización sólo en despido injustificado.',
  };

  return {
    total: Math.round(total),
    aguinaldoProporcional: Math.round(aguinaldoProporcional),
    vacaciones: Math.round(vacaciones),
    preaviso: Math.round(preaviso),
    indemnizacion: Math.round(indemnizacion),
    jornal: Math.round(jornal),
    diasVacaciones: Number(diasVacTotales.toFixed(1)),
    diasPreaviso,
    estabilidad: esDespido && tieneEstabilidad ? 'Sí (≥10 años → indemnización doble)' : 'No',
    causaLabel: causaLabel[causa],
    _insight,
    _table,
  };
}
