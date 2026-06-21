/**
 * Vacaciones PARAGUAY (Código del Trabajo, Ley 213/93, art. 218).
 *
 * Días hábiles corridos de descanso anual según antigüedad:
 *   - hasta 5 años:   12 días
 *   - de 5 a 10 años: 18 días
 *   - más de 10 años: 30 días
 *
 *   díasVacaciones = 12 (≤5) | 18 (5–10) | 30 (>10) años
 *   pago           = (salarioMensual / 30) × díasVacaciones
 *
 * Fuente: MTESS — Código del Trabajo (Ley 213/93), art. 218.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface Inputs {
  anios: number;          // años de antigüedad
  salarioMensual: number; // salario mensual en Gs.
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function diasVacacionesPY(anios: number): number {
  for (const tramo of PARAGUAY_2026.laboral.vacaciones) {
    if (anios <= tramo.hastaAnios) return tramo.dias;
  }
  return PARAGUAY_2026.laboral.vacaciones[PARAGUAY_2026.laboral.vacaciones.length - 1].dias;
}

export function calculadoraVacacionesParaguay(i: Inputs): Outputs {
  const anios = Math.max(0, Number(i.anios) || 0);
  const salarioMensual = Number(i.salarioMensual) || 0;

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');

  const dias = diasVacacionesPY(anios);
  const salarioDiario = salarioMensual / PARAGUAY_2026.diasMes; // /30
  const pago = salarioDiario * dias;

  const tramoLabel =
    dias === 12 ? 'hasta 5 años' : dias === 18 ? 'de 5 a 10 años' : 'más de 10 años';

  const _insight = {
    type: 'highlight',
    icon: '🏖️',
    text:
      `Con **${anios} año(s)** de antigüedad te corresponden **${dias} días hábiles** de vacaciones (${tramoLabel}). ` +
      `Con un salario de **${fmtPYG(salarioMensual)}**, el pago de vacaciones es **${fmtPYG(pago)}** ` +
      `(${fmtPYG(salarioDiario)} por día × ${dias} días).`,
  };

  const _table = {
    title: 'Días de vacaciones según antigüedad — Paraguay',
    headers: ['Antigüedad', 'Días hábiles', 'Pago con tu salario'],
    rows: [
      ['Hasta 5 años', '12 días', fmtPYG(salarioDiario * 12)],
      ['De 5 a 10 años', '18 días', fmtPYG(salarioDiario * 18)],
      ['Más de 10 años', '30 días', fmtPYG(salarioDiario * 30)],
    ],
    note: 'Código del Trabajo (Ley 213/93), art. 218. El pago diario surge del salario mensual ÷ 30. Las vacaciones son días hábiles corridos.',
    highlightCol: 0,
  };

  return {
    pago: Math.round(pago),
    dias,
    salarioDiario: Math.round(salarioDiario),
    tramo: tramoLabel,
    desglose: `${dias} días × ${fmtPYG(salarioDiario)}/día = ${fmtPYG(pago)}`,
    _insight,
    _table,
  };
}
