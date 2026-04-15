/** Precio mínimo de venta dado costo y margen deseado */

export interface Inputs {
  costoProducto: number;
  margenDeseado: number;
  gastosAdicionales: number;
}

export interface Outputs {
  precioMinimo: number;
  gananciaPorUnidad: number;
  detalle: string;
}

export function precioMinimoVenta(i: Inputs): Outputs {
  const costo = Number(i.costoProducto);
  const margen = Number(i.margenDeseado);
  const gastos = Number(i.gastosAdicionales);

  if (isNaN(costo) || costo < 0) throw new Error('Ingresá el costo del producto');
  if (isNaN(margen) || margen < 0 || margen >= 100) throw new Error('El margen debe estar entre 0% y 99%');
  if (isNaN(gastos) || gastos < 0) throw new Error('Los gastos adicionales no pueden ser negativos');

  const costoTotal = costo + gastos;
  if (costoTotal <= 0) throw new Error('El costo total debe ser mayor a 0');

  const precioMinimo = costoTotal / (1 - margen / 100);
  const gananciaPorUnidad = precioMinimo - costoTotal;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Costo total: $${fmt.format(costoTotal)} (producto $${fmt.format(costo)} + gastos $${fmt.format(gastos)}). ` +
    `Con un margen del ${margen}%, el precio mínimo de venta es $${fmt.format(precioMinimo)}. ` +
    `Ganancia por unidad: $${fmt.format(gananciaPorUnidad)}.`;

  return {
    precioMinimo: Math.round(precioMinimo),
    gananciaPorUnidad: Math.round(gananciaPorUnidad),
    detalle,
  };
}
