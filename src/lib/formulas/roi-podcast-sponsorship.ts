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

  return {
    roi: Number(roi.toFixed(1)),
    cpmPodcast: Math.round(cpmPodcast),
    conversionesEstimadas: Math.round(conversionesEstimadas),
    detalle,
  };
}
