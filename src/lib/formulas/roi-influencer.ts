/** ROI de campaña de marketing con influencer */
export interface RoiInfluencerInputs {
  costoInfluencer: number;
  ventasGeneradas: number;
  impresiones: number;
  clicks: number;
}
export interface RoiInfluencerOutputs {
  roi: number;
  cpm: number;
  cpc: number;
  costoPorVenta: number;
  detalle: string;
  _chart?: any;
}

export function roiInfluencer(inputs: RoiInfluencerInputs): RoiInfluencerOutputs {
  const costo = Number(inputs.costoInfluencer);
  const ventas = Number(inputs.ventasGeneradas);
  const impresiones = Number(inputs.impresiones);
  const clicks = Number(inputs.clicks);

  if (costo < 0) throw new Error('El costo no puede ser negativo');
  if (ventas < 0) throw new Error('Las ventas no pueden ser negativas');
  if (!impresiones || impresiones <= 0) throw new Error('Ingresá las impresiones totales');
  if (clicks < 0) throw new Error('Los clicks no pueden ser negativos');

  const roi = costo > 0 ? Number((((ventas - costo) / costo) * 100).toFixed(1)) : 0;
  const cpm = impresiones > 0 ? Number(((costo / impresiones) * 1000).toFixed(0)) : 0;
  const cpc = clicks > 0 ? Number((costo / clicks).toFixed(0)) : 0;
  const costoPorVenta = ventas > 0 ? Number((costo / 1).toFixed(0)) : 0;
  // Para costo por venta necesitaríamos cantidad de ventas, usamos el ratio
  const ratioVenta = ventas > 0 && costo > 0 ? Number((ventas / costo).toFixed(2)) : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  let evaluacion = '';
  if (roi >= 400) evaluacion = 'Excelente — muy por encima del promedio';
  else if (roi >= 200) evaluacion = 'Muy bueno — supera la media del mercado';
  else if (roi >= 0) evaluacion = 'Positivo — la campaña fue rentable';
  else evaluacion = 'Negativo — la campaña costó más de lo que generó';

  const chart = {
    type: 'scale' as const,
    marker: roi,
    markerLabel: 'Tu ROI: ' + fmt.format(roi) + '%',
    min: Math.min(-100, Math.floor(roi)),
    unit: '%',
    segments: [
      { nombre: 'Negativo', max: 0, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Positivo', max: 200, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Muy bueno', max: 400, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Excelente', max: Math.max(600, Math.ceil(roi) + 100), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de ROI de campaña con influencer: negativo, positivo, muy bueno, excelente',
  };

  return {
    roi,
    cpm,
    cpc,
    costoPorVenta: costo,
    detalle: `ROI ${fmt.format(roi)}% (${evaluacion}). Por cada $1 invertido se generaron $${fmt.format(ratioVenta)} en ventas. CPM $${fmt.format(cpm)}, CPC $${fmt.format(cpc)}.`,
    _chart: chart,
  };
}
