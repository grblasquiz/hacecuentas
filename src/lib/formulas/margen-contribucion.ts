/** Margen de contribución unitario y ratio */

export interface Inputs {
  precioVenta: number;
  costoVariable: number;
}

export interface Outputs {
  margenContribucion: number;
  ratioMargen: number;
  detalle: string;
}

export function margenContribucion(i: Inputs): Outputs {
  const precio = Number(i.precioVenta);
  const costo = Number(i.costoVariable);

  if (isNaN(precio) || precio <= 0) throw new Error('Ingresá el precio de venta');
  if (isNaN(costo) || costo < 0) throw new Error('El costo variable no puede ser negativo');

  const margen = precio - costo;
  const ratio = (margen / precio) * 100;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let interpretacion: string;
  if (margen <= 0) {
    interpretacion = 'ATENCIÓN: margen negativo o cero. Estás perdiendo plata con cada venta.';
  } else if (ratio < 20) {
    interpretacion = 'Margen bajo — cualquier aumento de costos puede hacerte perder.';
  } else if (ratio < 40) {
    interpretacion = 'Margen aceptable para retail. Cuidá los volúmenes.';
  } else if (ratio < 60) {
    interpretacion = 'Buen margen. Hay espacio para absorber descuentos y variaciones de costos.';
  } else {
    interpretacion = 'Excelente margen. Típico de servicios y software.';
  }

  const detalle =
    `Cada unidad vendida a $${fmt.format(precio)} con costo variable de $${fmt.format(costo)} aporta ` +
    `$${fmt.format(margen)} (${ratio.toFixed(1)}%) para cubrir costos fijos y ganancia. ${interpretacion}`;

  return {
    margenContribucion: Math.round(margen),
    ratioMargen: Number(ratio.toFixed(2)),
    detalle,
  };
}
