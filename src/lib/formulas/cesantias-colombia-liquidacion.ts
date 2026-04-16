/** Liquidación de cesantías Colombia — diferenciado: incluye intereses y proyección */

export interface Inputs {
  salarioMensual: number;
  auxilioTransporte: string;
  diasTrabajados: number;
  tipoLiquidacion: string;
}

export interface Outputs {
  baseLiquidacion: number;
  cesantias: number;
  interesesCesantias: number;
  totalLiquidacion: number;
  cesantiasAnuales: number;
  formula: string;
  explicacion: string;
}

export function cesantiasColombiaLiquidacion(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const incluyeAuxilio = i.auxilioTransporte === 'si' || i.auxilioTransporte === 'true';
  const dias = Math.min(360, Math.max(1, Number(i.diasTrabajados) || 360));
  const tipo = String(i.tipoLiquidacion || 'anual');

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual');

  // SMLMV 2026 estimado
  const SMLMV = 1_423_500;
  const AUXILIO = 200_000;

  let baseLiquidacion = salario;
  if (incluyeAuxilio && salario <= SMLMV * 2) {
    baseLiquidacion += AUXILIO;
  }

  // Cesantías = (salario base × días trabajados) / 360
  const cesantias = (baseLiquidacion * dias) / 360;

  // Intereses sobre cesantías: 12% anual proporcional
  const interesesCesantias = (cesantias * 0.12 * dias) / 360;

  const totalLiquidacion = cesantias + interesesCesantias;
  const cesantiasAnuales = baseLiquidacion; // Un mes de salario por año completo

  const formula = `Cesantías = ($${baseLiquidacion.toLocaleString()} × ${dias}) / 360 = $${Math.round(cesantias).toLocaleString()} + 12% intereses`;
  const explicacion = `${tipo === 'parcial' ? 'Liquidación parcial' : 'Liquidación anual'} de cesantías: salario base $${baseLiquidacion.toLocaleString()} COP${incluyeAuxilio && salario <= SMLMV * 2 ? ` (incluye auxilio $${AUXILIO.toLocaleString()})` : ''}. ${dias} días trabajados. Cesantías: $${Math.round(cesantias).toLocaleString()}. Intereses (12% anual): $${Math.round(interesesCesantias).toLocaleString()}. Total: $${Math.round(totalLiquidacion).toLocaleString()} COP. El empleador debe consignar las cesantías al fondo antes del 14 de febrero y los intereses al trabajador antes del 31 de enero.`;

  return {
    baseLiquidacion: Math.round(baseLiquidacion),
    cesantias: Math.round(cesantias),
    interesesCesantias: Math.round(interesesCesantias),
    totalLiquidacion: Math.round(totalLiquidacion),
    cesantiasAnuales: Math.round(cesantiasAnuales),
    formula,
    explicacion,
  };
}
