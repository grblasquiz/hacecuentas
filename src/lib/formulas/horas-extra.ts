/**
 * Calculadora de Horas Extra (Argentina)
 *
 * LCT Art. 201:
 *   - Días hábiles (lunes a sábado hasta 13hs): +50%
 *   - Sábados después de 13hs, domingos y feriados: +100%
 *
 * Jornada normal: 8hs diarias / 48hs semanales (Art. 196)
 *
 * Valor hora normal = sueldo_mensual / (horas_mes = 200)
 */

export interface HorasExtraInputs {
  sueldoBruto: number;
  horasMes: number; // default 200 (48h/sem × 4.33 sem)
  horas50: number; // horas al 50%
  horas100: number; // horas al 100%
}

export interface HorasExtraOutputs {
  valorHoraNormal: number;
  valorHora50: number;
  valorHora100: number;
  monto50: number;
  monto100: number;
  totalExtras: number;
  sueldoConExtras: number;
}

export function horasExtra(inputs: HorasExtraInputs): HorasExtraOutputs {
  const sueldo = Number(inputs.sueldoBruto);
  const horasMes = Number(inputs.horasMes) || 200;
  const h50 = Math.max(0, Number(inputs.horas50) || 0);
  const h100 = Math.max(0, Number(inputs.horas100) || 0);

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá tu sueldo bruto mensual');
  }
  if (h50 === 0 && h100 === 0) {
    throw new Error('Ingresá al menos una cantidad de horas extra');
  }

  const valorHoraNormal = sueldo / horasMes;
  const valorHora50 = valorHoraNormal * 1.5;
  const valorHora100 = valorHoraNormal * 2;

  const monto50 = valorHora50 * h50;
  const monto100 = valorHora100 * h100;
  const totalExtras = monto50 + monto100;
  const sueldoConExtras = sueldo + totalExtras;

  return {
    valorHoraNormal: Math.round(valorHoraNormal),
    valorHora50: Math.round(valorHora50),
    valorHora100: Math.round(valorHora100),
    monto50: Math.round(monto50),
    monto100: Math.round(monto100),
    totalExtras: Math.round(totalExtras),
    sueldoConExtras: Math.round(sueldoConExtras),
  };
}
