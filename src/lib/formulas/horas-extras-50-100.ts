/**
 * Calculadora de Horas Extras al 50% y 100% - Argentina
 * LCT art. 201: 50% días hábiles, 100% sáb post 13hs/dom/feriados
 * Divisor estándar jornada completa: 200 hs mensuales
 */

export interface HorasExtrasInputs {
  sueldoBruto: number;
  horasExtra50: number;
  horasExtra100: number;
  jornadaMensual: number;
}

export interface HorasExtrasOutputs {
  totalExtras: number;
  valorHoraNormal: number;
  valorHora50: number;
  valorHora100: number;
  subtotal50: number;
  subtotal100: number;
}

export function horasExtras50100(inputs: HorasExtrasInputs): HorasExtrasOutputs {
  const sueldoBruto = Number(inputs.sueldoBruto);
  const horasExtra50 = Math.max(0, Number(inputs.horasExtra50) || 0);
  const horasExtra100 = Math.max(0, Number(inputs.horasExtra100) || 0);
  const jornadaMensual = Number(inputs.jornadaMensual) || 200;

  if (!sueldoBruto || sueldoBruto <= 0) {
    throw new Error('Ingresá tu sueldo bruto mensual');
  }

  const valorHoraNormal = sueldoBruto / jornadaMensual;
  const valorHora50 = valorHoraNormal * 1.5;
  const valorHora100 = valorHoraNormal * 2;

  const subtotal50 = horasExtra50 * valorHora50;
  const subtotal100 = horasExtra100 * valorHora100;
  const totalExtras = subtotal50 + subtotal100;

  return {
    totalExtras: Math.round(totalExtras),
    valorHoraNormal: Math.round(valorHoraNormal),
    valorHora50: Math.round(valorHora50),
    valorHora100: Math.round(valorHora100),
    subtotal50: Math.round(subtotal50),
    subtotal100: Math.round(subtotal100),
  };
}
