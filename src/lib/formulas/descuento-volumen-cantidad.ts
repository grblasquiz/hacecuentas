/** Precio efectivo con descuentos escalonados por volumen (quantity breaks) */
export interface Inputs {
  precioUnitario: number;
  cantidad: number;
  descuentoPorcentaje: number; // % descuento aplicado a la cantidad
}
export interface Outputs {
  subtotal: number;
  descuentoMonto: number;
  total: number;
  precioEfectivoUnitario: number;
  ahorroPorUnidad: number;
  resumen: string;
}

export function descuentoVolumenCantidad(i: Inputs): Outputs {
  const precio = Number(i.precioUnitario);
  const cant = Number(i.cantidad);
  const desc = Number(i.descuentoPorcentaje);

  if (!precio || precio <= 0) throw new Error('Ingresá el precio unitario');
  if (!cant || cant <= 0) throw new Error('Ingresá la cantidad');
  if (desc < 0 || desc > 100) throw new Error('El descuento debe estar entre 0% y 100%');

  const subtotal = precio * cant;
  const descMonto = subtotal * (desc / 100);
  const total = subtotal - descMonto;
  const precioEfectivo = total / cant;
  const ahorroUnit = precio - precioEfectivo;

  const resumen = `Comprando ${cant} unidades con ${desc}% de descuento, pagás ${total.toLocaleString()} total (${precioEfectivo.toFixed(2)} por unidad, ahorrás ${ahorroUnit.toFixed(2)} en cada una).`;

  return {
    subtotal: Math.round(subtotal),
    descuentoMonto: Math.round(descMonto),
    total: Math.round(total),
    precioEfectivoUnitario: Number(precioEfectivo.toFixed(2)),
    ahorroPorUnidad: Number(ahorroUnit.toFixed(2)),
    resumen,
  };
}
