/**
 * Vacaciones y bono vacacional Venezuela — LOTTT.
 *
 * VACACIONES (Art. 190): 15 días hábiles el 1er año + 1 día por año adicional,
 *   tope 30 días. Se pagan al salario NORMAL diario.
 * BONO VACACIONAL (Art. 192): mínimo 15 días + 1 día por año adicional, tope 30.
 *   Es un pago extra que el patrono entrega al inicio del disfrute.
 *
 *   díasVacaciones      = min(15 + (años-1)×1, 30)
 *   díasBonoVacacional  = min(15 + (años-1)×1, 30)
 *   pagoVacaciones      = díasVacaciones    × salarioDiario
 *   pagoBonoVacacional  = díasBonoVacacional × salarioDiario
 *
 * Fuente: LOTTT Art. 190, Art. 192.
 */
import { VENEZUELA_2026, diasVacacionesLottt, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual: number;     // salario normal mensual (Bs.)
  aniosAntiguedad: number;    // años de antigüedad
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function calculadoraVacacionesBonoVacacionalVenezuela(i: Inputs): Outputs {
  const l = VENEZUELA_2026.lottt;
  const salarioMensual = Number(i.salarioMensual) || 0;
  const anios = Math.max(0, Math.floor(Number(i.aniosAntiguedad) || 0));

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');

  const salarioDiario = salarioMensual / 30;

  // Vacaciones (Art. 190) vía helper compartido.
  const diasVacaciones = diasVacacionesLottt(anios);
  // Bono vacacional (Art. 192): mismas reglas con sus propias constantes.
  const diasBonoVac = Math.min(
    l.bonoVacacionalDiasBase + Math.max(0, anios - 1) * l.bonoVacacionalDiasPorAnio,
    l.bonoVacacionalDiasMax,
  );

  const pagoVacaciones = diasVacaciones * salarioDiario;
  const pagoBonoVac = diasBonoVac * salarioDiario;
  const totalDias = diasVacaciones + diasBonoVac;
  const totalPago = pagoVacaciones + pagoBonoVac;

  const _insight = {
    type: 'highlight',
    icon: '🏖️',
    text: `Con **${anios} año(s)** de antigüedad te corresponden **${diasVacaciones} días de vacaciones** (${fmtVES(pagoVacaciones)}) ` +
      `más un **bono vacacional de ${diasBonoVac} días** (${fmtVES(pagoBonoVac)}). En total cobrás **${fmtVES(totalPago)}** ` +
      `equivalentes a ${totalDias} días de salario.`,
  };

  const _table = {
    title: 'Vacaciones y bono vacacional según tu antigüedad',
    headers: ['Concepto', 'Días', 'Cálculo', 'Monto'],
    rows: [
      ['Vacaciones (Art. 190)', String(diasVacaciones), `${diasVacaciones} × ${fmtVES(salarioDiario)}`, fmtVES(pagoVacaciones)],
      ['Bono vacacional (Art. 192)', String(diasBonoVac), `${diasBonoVac} × ${fmtVES(salarioDiario)}`, fmtVES(pagoBonoVac)],
      ['Total a cobrar', String(totalDias), '—', fmtVES(totalPago)],
    ],
    note: 'Las vacaciones se pagan al salario normal diario. El tope legal es de 30 días tanto para vacaciones como para el bono vacacional (se alcanza a los 16 años de servicio).',
  };

  return {
    totalPago: Number(totalPago.toFixed(2)),
    pagoVacaciones: Number(pagoVacaciones.toFixed(2)),
    pagoBonoVacacional: Number(pagoBonoVac.toFixed(2)),
    diasVacaciones,
    diasBonoVacacional: diasBonoVac,
    salarioDiario: Number(salarioDiario.toFixed(2)),
    detalle: `${diasVacaciones} días vac. (${fmtVES(pagoVacaciones)}) + ${diasBonoVac} días bono (${fmtVES(pagoBonoVac)}) = ${fmtVES(totalPago)}`,
    _insight,
    _table,
  };
}
