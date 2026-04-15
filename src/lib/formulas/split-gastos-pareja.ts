/** Dividir gastos de pareja proporcional al ingreso */

export interface Inputs {
  ingresoA: number;
  ingresoB: number;
  gastoTotal: number;
}

export interface Outputs {
  pagoA: number;
  pagoB: number;
  porcentajeA: number;
  porcentajeB: number;
}

export function splitGastosPareja(i: Inputs): Outputs {
  const ingresoA = Number(i.ingresoA);
  const ingresoB = Number(i.ingresoB);
  const gastoTotal = Number(i.gastoTotal);

  if (isNaN(ingresoA) || ingresoA < 0) throw new Error('Ingresá un ingreso válido para Persona A');
  if (isNaN(ingresoB) || ingresoB < 0) throw new Error('Ingresá un ingreso válido para Persona B');
  if (!gastoTotal || gastoTotal <= 0) throw new Error('Ingresá el gasto total a dividir');

  const ingresoTotal = ingresoA + ingresoB;
  if (ingresoTotal <= 0) throw new Error('Al menos una persona debe tener ingreso mayor a 0');

  const porcentajeA = (ingresoA / ingresoTotal) * 100;
  const porcentajeB = (ingresoB / ingresoTotal) * 100;
  const pagoA = gastoTotal * (ingresoA / ingresoTotal);
  const pagoB = gastoTotal * (ingresoB / ingresoTotal);

  return {
    pagoA: Math.round(pagoA),
    pagoB: Math.round(pagoB),
    porcentajeA: Number(porcentajeA.toFixed(2)),
    porcentajeB: Number(porcentajeB.toFixed(2)),
  };
}
