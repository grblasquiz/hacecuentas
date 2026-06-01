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
  _chart?: any;
  _insight?: any;
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

  const chart = indirectos > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ingredientes', value: Math.round(ingredientes) },
      { label: 'Gastos indirectos', value: Math.round(indirectos) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoTotal).toLocaleString('es-AR'),
    centerLabel: 'Costo total',
    ariaLabel: 'Composición del costo de la receta: ingredientes más gastos indirectos',
  } : undefined;

  const fcNum = precioVenta > 0 ? (costoPorPorcion / precioVenta) * 100 : 0;
  let insight;
  if (precioVenta > 0) {
    const fcOk = fcNum <= 35;
    insight = {
      title: fcOk ? 'Food cost saludable' : 'Food cost alto',
      text: fcOk
        ? `Con precio de venta $${fmt.format(precioVenta)}, el food cost queda en **${foodCost}%** (≤35% recomendado en gastronomía). Te deja margen sano para cubrir mano de obra y alquiler.`
        : `Con precio de venta $${fmt.format(precioVenta)}, el food cost trepa a **${foodCost}%**, por encima del 35% recomendado. Subí el precio o bajá el costo de los ingredientes para no comerte el margen.`,
      tone: fcOk ? 'good' : 'warn',
      icon: fcOk ? '🍽️' : '⚠️',
    };
  } else {
    const indirectosPct = costoTotal > 0 ? Math.round((indirectos / costoTotal) * 100) : 0;
    insight = {
      title: 'Costo por porción',
      text: indirectos > 0
        ? `Cada porción te sale **$${fmt.format(costoPorPorcion)}**; los gastos indirectos pesan **${indirectosPct}%** del costo total. Definí un margen para ver el precio de venta sugerido.`
        : `Cada porción te sale **$${fmt.format(costoPorPorcion)}** sólo en ingredientes. Sumá gastos indirectos y un margen para llegar a un precio de venta realista.`,
      tone: 'neutral',
      icon: '🍽️',
    };
  }

  return {
    costoPorPorcion: Math.round(costoPorPorcion),
    costoTotal: Math.round(costoTotal),
    precioVentaSugerido: Math.round(precioVenta),
    detalle: `Ingredientes $${fmt.format(ingredientes)} + indirectos $${fmt.format(indirectos)} = $${fmt.format(costoTotal)} total. En ${porciones} porciones: $${fmt.format(costoPorPorcion)}/porción.${precioVenta > 0 ? ` Precio de venta sugerido: $${fmt.format(precioVenta)} (food cost ${foodCost}%).` : ''}`,
    _chart: chart,
    _insight: insight,
  };
}
