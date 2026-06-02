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
  _insight?: any;
  _chart?: any;
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

  const precioR = Math.round(precioMinimo);
  const costoR = Math.round(costoTotal);
  const gananciaR = precioR - costoR; // slices suman exactamente el total redondeado
  const markup = costoTotal > 0 ? gananciaPorUnidad / costoTotal : 0;

  const _insight = {
    title: 'Tu piso de precio',
    text: `Por debajo de **$${fmt.format(precioR)}** vendés a pérdida. Para dejar **${margen}%** de margen tenés que marcar el costo **${markup.toFixed(2)}x**, lo que te deja **$${fmt.format(gananciaR)}** de ganancia por unidad. Ojo: es el mínimo, no el precio de venta ideal.`,
    tone: 'neutral' as const,
    icon: '🏷️',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Costo total', value: costoR },
      { label: 'Ganancia', value: gananciaR },
    ],
    prefix: '$',
    centerValue: '$' + precioR.toLocaleString('es-AR'),
    centerLabel: 'Precio mínimo',
    ariaLabel: 'Composición del precio mínimo de venta: costo total más ganancia',
  };

  return {
    precioMinimo: precioR,
    gananciaPorUnidad: Math.round(gananciaPorUnidad),
    detalle,
    _insight,
    _chart,
  };
}
