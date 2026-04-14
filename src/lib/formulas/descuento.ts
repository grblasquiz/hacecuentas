/** Cálculo de descuentos — simple, sucesivos y descuento final sobre venta */
export interface Inputs {
  precio: number;
  descuento1: number;
  descuento2?: number;
  descuento3?: number;
}
export interface Outputs {
  precioFinal: number;
  ahorro: number;
  descuentoEfectivo: number;
  precioTrasDescuento1: number;
  precioTrasDescuento2: number;
}

export function descuento(i: Inputs): Outputs {
  const precio = Number(i.precio);
  const d1 = Number(i.descuento1) || 0;
  const d2 = Number(i.descuento2) || 0;
  const d3 = Number(i.descuento3) || 0;
  if (!precio || precio <= 0) throw new Error('Ingresá el precio');

  const tras1 = precio * (1 - d1 / 100);
  const tras2 = tras1 * (1 - d2 / 100);
  const tras3 = tras2 * (1 - d3 / 100);
  const final = tras3;
  const ahorro = precio - final;
  const efectivo = ((precio - final) / precio) * 100;

  return {
    precioFinal: Math.round(final),
    ahorro: Math.round(ahorro),
    descuentoEfectivo: Number(efectivo.toFixed(2)),
    precioTrasDescuento1: Math.round(tras1),
    precioTrasDescuento2: Math.round(tras2),
  };
}
