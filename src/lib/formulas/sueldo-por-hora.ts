/**
 * Calculadora de Sueldo por Hora
 * Convierte sueldo mensual a valor hora, día y semana
 */

export interface SueldoPorHoraInputs {
  sueldoMensual: number;
  tipoSueldo: string;
  horasDiarias: number;
  diasLaborables: number;
}

export interface SueldoPorHoraOutputs {
  valorHora: number;
  valorDia: number;
  valorSemana: number;
  horasMes: number;
}

export function sueldoPorHora(inputs: SueldoPorHoraInputs): SueldoPorHoraOutputs {
  const sueldoMensual = Number(inputs.sueldoMensual);
  const horasDiarias = Number(inputs.horasDiarias) || 8;
  const diasLaborables = Number(inputs.diasLaborables) || 22;

  if (!sueldoMensual || sueldoMensual <= 0) {
    throw new Error('Ingresá tu sueldo mensual');
  }

  const horasMes = horasDiarias * diasLaborables;
  const valorHora = sueldoMensual / horasMes;
  const valorDia = sueldoMensual / diasLaborables;
  const valorSemana = valorDia * 5;

  return {
    valorHora: Math.round(valorHora),
    valorDia: Math.round(valorDia),
    valorSemana: Math.round(valorSemana),
    horasMes,
  };
}
