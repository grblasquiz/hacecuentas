/**
 * Pago de vacaciones — República Dominicana (Art. 177 y 180, Código de Trabajo Ley 16-92).
 *
 * El trabajador con un año o más de servicio tiene derecho a un período de
 * vacaciones de:
 *   - 14 días LABORABLES de salario ordinario si tiene de 1 a menos de 5 años.
 *   - 18 días LABORABLES de salario ordinario si tiene 5 años o más.
 * El día de salario se calcula con el divisor universal de nómina (mensual ÷ 23,83).
 * Para quien no completó un año (Art. 180, contrato indefinido) se paga proporcional
 * según una tabla de meses → días.
 *
 * Datos y helpers desde la tabla maestra única.
 */
import {
  REPUBLICA_DOMINICANA_2026 as DO,
  salarioDiario,
  fmtDOP,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual: number;
  /** Años completos de antigüedad. */
  aniosAntiguedad: number;
  /** Meses adicionales (0–11). Solo se usan si aún no llegó a 1 año, para la tabla proporcional. */
  mesesAntiguedad?: number;
}

export interface Outputs {
  diasVacaciones: number;
  salarioDiario: number;
  pagoVacaciones: number;
  proporcional: boolean;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
  _steps?: any;
}

export function calculadoraVacacionesRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const anios = Math.max(0, Math.floor(Number(i.aniosAntiguedad) || 0));
  const mesesExtra = Math.max(0, Math.min(11, Math.floor(Number(i.mesesAntiguedad) || 0)));

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  const vac = DO.laboral.vacaciones;
  const diario = salarioDiario(salario);
  const mesesTotales = anios * 12 + mesesExtra;

  let dias: number;
  let proporcional = false;

  if (mesesTotales < 12) {
    // Art. 180: proporcional según meses trabajados (contrato indefinido).
    // Tabla oficial: 5 m→6 d, 6→7, 7→8, 8→9, 9→10, 10→11, 11→12. < 5 meses: 0.
    const tabla = vac.proporcional as Record<number, number>;
    dias = tabla[mesesTotales as keyof typeof tabla] ?? 0;
    proporcional = true;
  } else if (anios >= 5) {
    dias = vac.desde5anios; // 18 días
  } else {
    dias = vac.menos5anios; // 14 días
  }

  const pago = diario * dias;

  const formula = `Vacaciones = salario diario × días = RD$${diario.toFixed(2)} × ${dias} = ${fmtDOP(pago)}`;

  const explicacion = proporcional
    ? (dias > 0
        ? `Con ${mesesTotales} meses de servicio (menos de un año) te corresponden ${dias} días proporcionales (Art. 180). Salario diario RD$${diario.toFixed(2)} × ${dias} días = ${fmtDOP(pago)}.`
        : `Con ${mesesTotales} meses de servicio todavía no llegás al mínimo de 5 meses que la tabla del Art. 180 reconoce para vacaciones proporcionales en contrato indefinido.`)
    : `Con ${anios} año${anios === 1 ? '' : 's'} de antigüedad te corresponden ${dias} días laborables de salario (Art. 177). Salario diario RD$${diario.toFixed(2)} (mensual ÷ 23,83) × ${dias} días = ${fmtDOP(pago)}.`;

  const _steps = [
    { label: 'Salario diario (mensual ÷ 23,83)', value: fmtDOP(diario) },
    { label: 'Días de vacaciones', value: `${dias} días` },
    { label: 'Pago de vacaciones', value: fmtDOP(pago) },
  ];

  const _insight = {
    title: dias > 0 ? `Te corresponden ${fmtDOP(pago)} de vacaciones` : 'Aún sin derecho a vacaciones',
    text: dias > 0
      ? `Por ${proporcional ? `${mesesTotales} meses` : `${anios} año${anios === 1 ? '' : 's'}`} de antigüedad cobrás **${dias} días** de salario ordinario: **${fmtDOP(pago)}**. El pago se hace a más tardar el día anterior al inicio del disfrute.`
      : `Con menos de 5 meses de servicio todavía no se genera el derecho proporcional del Art. 180.`,
    tone: (dias > 0 ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '🏖️',
  };

  const _table = {
    title: 'Días de vacaciones por antigüedad (Art. 177-180)',
    headers: ['Antigüedad', 'Días de salario', 'Tu pago con este salario'],
    rows: [
      ['5 meses', '6 días', fmtDOP(diario * 6)],
      ['6 meses', '7 días', fmtDOP(diario * 7)],
      ['9 meses', '10 días', fmtDOP(diario * 10)],
      ['11 meses', '12 días', fmtDOP(diario * 12)],
      ['1 a 5 años', '14 días', fmtDOP(diario * 14)],
      ['5 años o más', '18 días', fmtDOP(diario * 18)],
    ],
    note: 'Días laborables de salario ordinario. El salario diario sale del divisor 23,83 (mensual ÷ 23,83).',
  };

  return {
    diasVacaciones: dias,
    salarioDiario: Math.round(diario * 100) / 100,
    pagoVacaciones: Math.round(pago * 100) / 100,
    proporcional,
    formula,
    explicacion,
    _insight,
    _table,
    _steps,
  };
}
