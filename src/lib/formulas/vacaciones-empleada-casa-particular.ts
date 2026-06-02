/**
 * Calculadora de Vacaciones — Empleada de Casas Particulares
 * Ley 26.844 Art. 30 — Régimen Especial de Personal de Casas Particulares.
 *
 * Días de licencia anual ordinaria según antigüedad:
 *   < 5 años   → 14 días corridos
 *   5 a 10 años → 21 días
 *   10 a 20 años → 28 días
 *   > 20 años  → 35 días
 *
 * Valor jornal vacacional = sueldo mensual / 25 (igual al Art. 155 LCT
 * — la analogía la aplica el Decreto 467/2014 reglamentario).
 *
 * Si el período trabajado en el año calendario es inferior a 6 meses,
 * corresponden vacaciones proporcionales: 1 día por cada 20 días
 * efectivamente trabajados (Art. 30 in fine).
 *
 * Pueden fraccionarse, con tope mínimo de 7 días corridos por fracción.
 */

export interface VacacionesEmpleadaInputs {
  sueldoMensual: number;
  antiguedadAnios: number;
  mesesTrabajadosAno: number; // 0-12, meses del año calendario actual
}

export interface VacacionesEmpleadaOutputs {
  diasVacaciones: number;
  valorTotal: number;
  valorDia: number;
  mensaje: string;
  _insight?: any;
}

export function vacacionesEmpleadaCasaParticular(
  inputs: VacacionesEmpleadaInputs
): VacacionesEmpleadaOutputs {
  const sueldo = Number(inputs.sueldoMensual);
  const anios = Math.max(0, Number(inputs.antiguedadAnios) || 0);
  const mesesAno = Math.max(0, Math.min(12, Number(inputs.mesesTrabajadosAno) || 0));

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo mensual.');
  }
  if (mesesAno === 0) {
    throw new Error('Ingresá los meses trabajados en el año.');
  }

  // Art. 30 Ley 26.844 — días anuales según antigüedad
  let diasAnuales: number;
  if (anios < 5) diasAnuales = 14;
  else if (anios < 10) diasAnuales = 21;
  else if (anios < 20) diasAnuales = 28;
  else diasAnuales = 35;

  // Determinar si corresponden vacaciones completas o proporcionales
  // Criterio: si trabajó al menos 6 meses del año calendario, corresponden
  // los días completos (Art. 154 LCT analógico). Si no, son proporcionales:
  // 1 día por cada 20 días trabajados (≈ proporción meses/12).
  let diasVacaciones: number;
  let detalleProporcion: string;
  if (mesesAno >= 6) {
    diasVacaciones = diasAnuales;
    detalleProporcion = 'Vacaciones completas (trabajó al menos 6 meses del año).';
  } else {
    // proporcional: 1 día cada 20 trabajados ≈ mesesAno × 30 / 20 = mesesAno × 1.5
    // Pero respetando el máximo de los días anuales: días = diasAnuales × (mesesAno / 12)
    diasVacaciones = Math.round((diasAnuales * mesesAno) / 12);
    detalleProporcion = `Vacaciones proporcionales: trabajó ${mesesAno} meses del año (menos de 6).`;
  }

  // Valor jornal vacacional: sueldo mensual / 25 (Decreto 467/2014 — Art. 155 LCT analógico)
  const valorDia = sueldo / 25;
  const valorTotal = valorDia * diasVacaciones;

  const mensaje =
    `${detalleProporcion} Pueden fraccionarse en períodos, con un mínimo de 7 días corridos por fracción (Art. 30 Ley 26.844).`;

  const proporcional = mesesAno < 6;
  const insight = {
    title: proporcional ? 'Vacaciones proporcionales' : 'Tus vacaciones del año',
    text: proporcional
      ? `Por trabajar **${mesesAno} mes(es)** del año (menos de 6) corresponden **${diasVacaciones} días** proporcionales, no los ${diasAnuales} de un año completo. A valor de día (**$${Math.round(valorDia).toLocaleString('es-AR')}** = sueldo/25), el total a pagar es **$${Math.round(valorTotal).toLocaleString('es-AR')}** (Art. 30 Ley 26.844).`
      : `Con **${anios} año(s)** de antigüedad te corresponden **${diasVacaciones} días corridos** de licencia (Art. 30 Ley 26.844). A **$${Math.round(valorDia).toLocaleString('es-AR')}** por día (sueldo/25), el período se paga **$${Math.round(valorTotal).toLocaleString('es-AR')}** — recordá que el sueldo vacacional se abona antes de iniciar la licencia.`,
    tone: 'neutral' as const,
    icon: '🧹',
  };

  return {
    diasVacaciones,
    valorTotal: Math.round(valorTotal),
    valorDia: Math.round(valorDia),
    mensaje,
    _insight: insight,
  };
}
