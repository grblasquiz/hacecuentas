/** Calculadora de descuento y precio final */
export interface Inputs {
  precioOriginal: number;
  descuento1: number;
  descuento2?: number;
}
export interface Outputs {
  precioFinal: number;
  ahorro: number;
  descuentoTotal: string;
}

export function descuentoPorcentajePrecio(i: Inputs): Outputs {
  const precio = Number(i.precioOriginal);
  const d1 = Number(i.descuento1);
  const d2 = Number(i.descuento2) || 0;

  if (!precio || precio <= 0) throw new Error('Ingresá el precio original');
  if (d1 < 0 || d1 > 100) throw new Error('El descuento debe estar entre 0 y 100%');
  if (d2 < 0 || d2 > 100) throw new Error('El segundo descuento debe estar entre 0 y 100%');

  const factor1 = 1 - d1 / 100;
  const factor2 = 1 - d2 / 100;
  const precioFinal = precio * factor1 * factor2;
  const ahorro = precio - precioFinal;
  const descuentoTotalPct = ((ahorro / precio) * 100);

  return {
    precioFinal: Math.round(precioFinal),
    ahorro: Math.round(ahorro),
    descuentoTotal: `${descuentoTotalPct.toFixed(1)}%`,
  };
}
