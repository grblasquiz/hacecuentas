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
  _chart?: any;
  _insight?: any;
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

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Sueldo base', value: Math.round(sueldo) },
      { label: 'Extras 50%', value: Math.round(monto50) },
      { label: 'Extras 100%', value: Math.round(monto100) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(sueldoConExtras).toLocaleString('es-AR'),
    centerLabel: 'Sueldo total',
    ariaLabel: 'Composición del sueldo con extras: sueldo base más horas al 50% y al 100%',
  };

  const pctExtra = sueldoConExtras > 0 ? (totalExtras / sueldoConExtras) * 100 : 0;
  const fmtAr = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const insight = {
    title: 'Cuánto suman tus horas extra',
    text: `Tus **${h50 + h100} horas extra** agregan **${fmtAr(totalExtras)}** al sueldo: pasás de ${fmtAr(sueldo)} a **${fmtAr(sueldoConExtras)}**, un **${pctExtra.toFixed(0)}%** más. La hora al 50% vale ${fmtAr(valorHora50)} y la del 100% ${fmtAr(valorHora100)} (hora normal: ${fmtAr(valorHoraNormal)}).`,
    tone: 'good',
    icon: '⏱️',
  };

  return {
    valorHoraNormal: Math.round(valorHoraNormal),
    valorHora50: Math.round(valorHora50),
    valorHora100: Math.round(valorHora100),
    monto50: Math.round(monto50),
    monto100: Math.round(monto100),
    totalExtras: Math.round(totalExtras),
    sueldoConExtras: Math.round(sueldoConExtras),
    _chart: chart,
    _insight: insight,
  };
}
