/** Margen de contribución unitario y ratio */

export interface Inputs {
  precioVenta: number;
  costoVariable: number;
}

export interface Outputs {
  margenContribucion: number;
  ratioMargen: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
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

  let tone: 'good' | 'warn' | 'neutral';
  if (margen <= 0 || ratio < 20) tone = 'warn';
  else if (ratio < 40) tone = 'neutral';
  else tone = 'good';
  const _insight = {
    title: 'Cuánto aporta cada venta',
    text: margen <= 0
      ? `Cada unidad te deja **$${fmt.format(margen)}** de margen: estás **perdiendo plata** con cada venta. Subí el precio o bajá el costo variable antes de empujar volumen.`
      : `Cada unidad aporta **$${fmt.format(margen)}** (**${ratio.toFixed(1)}%** del precio) para cubrir costos fijos y dejar ganancia. ${ratio < 20 ? 'Es un margen **fino**: un pequeño salto de costos te puede dejar en rojo.' : ratio < 40 ? 'Margen aceptable para retail; el negocio depende del **volumen**.' : 'Margen **holgado**: tenés aire para descuentos y subas de costos.'}`,
    tone,
    icon: '🧮',
  };
  const markerRatio = Math.max(0, ratio);
  const _chart = {
    type: 'scale' as const,
    marker: Number(markerRatio.toFixed(1)),
    markerLabel: `${ratio.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 20, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Aceptable', max: 40, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Bueno', max: 60, color: '#22c55e', colorDark: '#15803d' },
      { nombre: 'Excelente', max: Math.max(100, Math.ceil(markerRatio) + 1), color: '#16a34a', colorDark: '#166534' },
    ],
    ariaLabel: 'Ratio de margen de contribución sobre una escala de zonas: bajo, aceptable, bueno y excelente.',
  };
  return {
    margenContribucion: Math.round(margen),
    ratioMargen: Number(ratio.toFixed(2)),
    detalle,
    _insight,
    _chart,
  };
}
