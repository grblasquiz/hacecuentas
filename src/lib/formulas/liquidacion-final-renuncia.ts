/**
 * Liquidación final por renuncia - Argentina
 * LCT Arts. 123, 150, 156
 * Incluye: días trabajados + vacaciones no gozadas + SAC proporcional + SAC sobre vacaciones
 */

export interface LiquidacionRenunciaInputs {
  sueldoBruto: number;
  diasTrabajadosMes: number;
  diasVacacionesNGozadas: number;
  mesesSemestre: number;
}

export interface LiquidacionRenunciaOutputs {
  totalLiquidacion: number;
  diasTrabajados: number;
  vacacionesNoGozadas: number;
  sacProporcional: number;
  sacSobreVacaciones: number;
}

export function liquidacionFinalRenuncia(inputs: LiquidacionRenunciaInputs): LiquidacionRenunciaOutputs {
  const sueldoBruto = Number(inputs.sueldoBruto);
  const diasTrabajadosMes = Math.min(30, Math.max(0, Number(inputs.diasTrabajadosMes)));
  const diasVacacionesNGozadas = Math.max(0, Number(inputs.diasVacacionesNGozadas));
  const mesesSemestre = Math.min(6, Math.max(1, Number(inputs.mesesSemestre)));

  if (!sueldoBruto || sueldoBruto <= 0) {
    throw new Error('Ingresá tu sueldo bruto mensual');
  }

  // Días trabajados: sueldo / 30 × días
  const diasTrabajados = (sueldoBruto / 30) * diasTrabajadosMes;

  // Vacaciones no gozadas: sueldo / 25 × días (art. 155 LCT, divisor 25)
  const vacacionesNoGozadas = (sueldoBruto / 25) * diasVacacionesNGozadas;

  // SAC proporcional del semestre: sueldo / 2 × (meses / 6)
  const sacProporcional = (sueldoBruto / 2) * (mesesSemestre / 6);

  // SAC sobre vacaciones no gozadas: vacaciones / 12
  const sacSobreVacaciones = vacacionesNoGozadas / 12;

  const totalLiquidacion = diasTrabajados + vacacionesNoGozadas + sacProporcional + sacSobreVacaciones;

  return {
    totalLiquidacion: Math.round(totalLiquidacion),
    diasTrabajados: Math.round(diasTrabajados),
    vacacionesNoGozadas: Math.round(vacacionesNoGozadas),
    sacProporcional: Math.round(sacProporcional),
    sacSobreVacaciones: Math.round(sacSobreVacaciones),
  };
}
