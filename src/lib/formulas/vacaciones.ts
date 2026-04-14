/**
 * Calculadora de vacaciones proporcionales Argentina
 * LCT art. 150:
 *   - Hasta 5 años de antigüedad: 14 días corridos
 *   - Entre 5 y 10 años: 21 días
 *   - Entre 10 y 20 años: 28 días
 *   - Más de 20 años: 35 días
 *
 * Proporcional: días_totales × (meses_trabajados / 12)
 */

export interface VacacionesInputs {
  antiguedadAnios: number;
  mesesTrabajados: number;
  sueldoBruto: number;
}

export interface VacacionesOutputs {
  diasCorridos: number;
  diasHabiles: number;
  montoVacaciones: number;
  valorDia: number;
  formula: string;
}

export function vacaciones(inputs: VacacionesInputs): VacacionesOutputs {
  const antiguedad = Number(inputs.antiguedadAnios);
  const meses = Math.min(12, Math.max(0, Number(inputs.mesesTrabajados)));
  const sueldoBruto = Number(inputs.sueldoBruto);

  if (antiguedad < 0) throw new Error('Ingresá una antigüedad válida');
  if (!meses) throw new Error('Ingresá los meses trabajados');
  if (!sueldoBruto || sueldoBruto <= 0) throw new Error('Ingresá el sueldo bruto');

  let diasTotalesAnual: number;
  if (antiguedad < 5) diasTotalesAnual = 14;
  else if (antiguedad < 10) diasTotalesAnual = 21;
  else if (antiguedad < 20) diasTotalesAnual = 28;
  else diasTotalesAnual = 35;

  const diasCorridos = Math.round((diasTotalesAnual * meses) / 12);
  const diasHabiles = Math.round(diasCorridos * 5 / 7);

  // Valor día vacacional: sueldo_bruto / 25 (LCT art 155)
  const valorDia = sueldoBruto / 25;
  const montoVacaciones = valorDia * diasCorridos;

  return {
    diasCorridos,
    diasHabiles,
    montoVacaciones: Math.round(montoVacaciones),
    valorDia: Math.round(valorDia),
    formula: `${diasTotalesAnual} días/año × ${meses}/12 meses = ${diasCorridos} días corridos`,
  };
}
