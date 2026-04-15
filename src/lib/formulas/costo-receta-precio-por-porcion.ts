/** Costo de una receta y precio por porción */
export interface Inputs {
  costoIngredientes: number;
  porciones: number;
  gastosIndirectos?: number;
  margenGanancia?: number;
}
export interface Outputs {
  costoPorPorcion: number;
  costoTotal: number;
  precioVentaSugerido: number;
  detalle: string;
}

export function costoRecetaPrecioPorPorcion(i: Inputs): Outputs {
  const ingredientes = Number(i.costoIngredientes);
  const porciones = Number(i.porciones);
  const indirectos = Number(i.gastosIndirectos) || 0;
  const margen = Number(i.margenGanancia) || 0;

  if (!ingredientes || ingredientes <= 0) throw new Error('Ingresá el costo de los ingredientes');
  if (!porciones || porciones <= 0) throw new Error('Ingresá la cantidad de porciones');

  const costoTotal = ingredientes + indirectos;
  const costoPorPorcion = costoTotal / porciones;
  const precioVenta = margen > 0 ? costoPorPorcion * (1 + margen / 100) : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const foodCost = precioVenta > 0 ? ((costoPorPorcion / precioVenta) * 100).toFixed(0) : '—';

  return {
    costoPorPorcion: Math.round(costoPorPorcion),
    costoTotal: Math.round(costoTotal),
    precioVentaSugerido: Math.round(precioVenta),
    detalle: `Ingredientes $${fmt.format(ingredientes)} + indirectos $${fmt.format(indirectos)} = $${fmt.format(costoTotal)} total. En ${porciones} porciones: $${fmt.format(costoPorPorcion)}/porción.${precioVenta > 0 ? ` Precio de venta sugerido: $${fmt.format(precioVenta)} (food cost ${foodCost}%).` : ''}`,
  };
}
