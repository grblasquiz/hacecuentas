export interface Inputs {
  ingreso_a: number;
  ingreso_b: number;
  gastos_totales: number;
}

export interface Outputs {
  porcentaje_a: number;
  porcentaje_b: number;
  monto_a: number;
  monto_b: number;
  diferencia_a_5050: number;
  diferencia_b_5050: number;
}

export function compute(i: Inputs): Outputs {
  const ingresoA = Number(i.ingreso_a) || 0;
  const ingresoB = Number(i.ingreso_b) || 0;
  const gastosTotales = Number(i.gastos_totales) || 0;

  // Validaciones
  if (ingresoA < 0 || ingresoB < 0 || gastosTotales < 0) {
    return {
      porcentaje_a: 0,
      porcentaje_b: 0,
      monto_a: 0,
      monto_b: 0,
      diferencia_a_5050: 0,
      diferencia_b_5050: 0
    };
  }

  const ingresoTotal = ingresoA + ingresoB;

  // Si no hay ingreso, no hay cálculo
  if (ingresoTotal === 0) {
    return {
      porcentaje_a: 0,
      porcentaje_b: 0,
      monto_a: 0,
      monto_b: 0,
      diferencia_a_5050: 0,
      diferencia_b_5050: 0
    };
  }

  // Cálculo de proporciones
  const porcentajeA = (ingresoA / ingresoTotal) * 100;
  const porcentajeB = (ingresoB / ingresoTotal) * 100;

  // Cálculo de montos proporcionales
  const montoA = (ingresoA / ingresoTotal) * gastosTotales;
  const montoB = (ingresoB / ingresoTotal) * gastosTotales;

  // Cálculo de diferencia vs 50/50
  const monto5050 = gastosTotales / 2;
  const diferenciaA5050 = montoA - monto5050;
  const diferenciaB5050 = montoB - monto5050;

  return {
    porcentaje_a: Math.round(porcentajeA * 100) / 100,
    porcentaje_b: Math.round(porcentajeB * 100) / 100,
    monto_a: Math.round(montoA * 100) / 100,
    monto_b: Math.round(montoB * 100) / 100,
    diferencia_a_5050: Math.round(diferenciaA5050 * 100) / 100,
    diferencia_b_5050: Math.round(diferenciaB5050 * 100) / 100
  };
}
