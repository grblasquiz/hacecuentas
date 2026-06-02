/** ROI de sponsoreo/patrocinio de podcast */

export interface Inputs {
  costoSponsorship: number;
  descargasEpisodio: number;
  episodios: number;
  tasaConversion: number;
  valorConversion: number;
}

export interface Outputs {
  roi: number;
  cpmPodcast: number;
  conversionesEstimadas: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function roiPodcastSponsorship(i: Inputs): Outputs {
  const costo = Number(i.costoSponsorship);
  const descargas = Number(i.descargasEpisodio);
  const episodios = Number(i.episodios);
  const tasa = Number(i.tasaConversion);
  const valorConv = Number(i.valorConversion);

  if (isNaN(costo) || costo < 0) throw new Error('Ingresá el costo del sponsorship');
  if (isNaN(descargas) || descargas <= 0) throw new Error('Ingresá las descargas por episodio');
  if (isNaN(episodios) || episodios < 1) throw new Error('Ingresá la cantidad de episodios');
  if (isNaN(tasa) || tasa < 0 || tasa > 100) throw new Error('La tasa de conversión debe estar entre 0 y 100');
  if (isNaN(valorConv) || valorConv < 0) throw new Error('El valor por conversión no puede ser negativo');

  const impresiones = descargas * episodios;
  const cpmPodcast = impresiones > 0 ? (costo / impresiones) * 1000 : 0;
  const conversionesEstimadas = impresiones * (tasa / 100);
  const ingresos = conversionesEstimadas * valorConv;
  const roi = costo > 0 ? ((ingresos - costo) / costo) * 100 : 0;
  const cpa = conversionesEstimadas > 0 ? costo / conversionesEstimadas : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let evaluacion: string;
  if (roi > 200) {
    evaluacion = 'ROI excelente — el sponsorship es altamente rentable.';
  } else if (roi > 0) {
    evaluacion = 'ROI positivo — la inversión se recupera con ganancia.';
  } else if (roi === 0) {
    evaluacion = 'Break-even — el ingreso cubre exactamente el costo.';
  } else {
    evaluacion = 'ROI negativo — revisá la tasa de conversión o el valor por conversión.';
  }

  const detalle =
    `${fmt.format(descargas)} descargas × ${episodios} episodios = ${fmt.format(impresiones)} impresiones. ` +
    `CPM: $${fmt.format(cpmPodcast)}. ` +
    `Conversiones estimadas: ${fmt.format(conversionesEstimadas)} (${tasa}%). ` +
    `Ingresos: $${fmt.format(ingresos)}. Costo: $${fmt.format(costo)}. ` +
    `CPA: $${fmt.format(cpa)}. ROI: ${roi.toFixed(0)}%. ` +
    evaluacion;

  const roiR = Number(roi.toFixed(1));
  const insight = {
    title: roiR >= 0 ? 'Sponsorship rentable' : 'Sponsorship en pérdida',
    text: roiR >= 0
      ? `${fmt.format(impresiones)} impresiones a ${tasa}% de conversión generan ~${fmt.format(conversionesEstimadas)} conversiones y **$${fmt.format(ingresos)}** de ingreso, contra $${fmt.format(costo)} de costo: ROI **${roiR.toFixed(0)}%** (CPA $${fmt.format(cpa)}). ${roiR > 200 ? 'Margen amplio para renovar o sumar episodios.' : 'Cerrá un código de descuento exclusivo para medir mejor la atribución.'}`
      : `Con ${tasa}% de conversión las ~${fmt.format(conversionesEstimadas)} ventas estimadas rinden $${fmt.format(ingresos)}, por debajo de los $${fmt.format(costo)} que cuesta: ROI **${roiR.toFixed(0)}%**. Necesitás más conversión o mayor valor por venta para que cierre.`,
    tone: (roiR < 0 ? 'warn' : roiR > 200 ? 'good' : 'neutral') as 'good' | 'warn' | 'neutral',
    icon: '🎙️',
  };

  const chart = {
    type: 'scale' as const,
    marker: roiR,
    markerLabel: 'Tu ROI: ' + roiR.toFixed(0) + '%',
    min: Math.min(-100, Math.floor(roiR)),
    unit: '%',
    segments: [
      { nombre: 'Negativo', max: 0, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Positivo', max: 200, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Excelente', max: Math.max(400, Math.ceil(roiR) + 100), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de ROI del sponsorship de podcast: negativo, positivo, excelente.',
  };

  return {
    roi: roiR,
    cpmPodcast: Math.round(cpmPodcast),
    conversionesEstimadas: Math.round(conversionesEstimadas),
    detalle,
    _insight: insight,
    _chart: chart,
  };
}
