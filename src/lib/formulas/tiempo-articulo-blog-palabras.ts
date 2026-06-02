/** Tiempo Artículo de Blog por Palabras */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  minutosPorPalabra: number;
  postsPor40h: number;
  desglose: string;
  _insight?: any;
  _chart?: any;
}

export function tiempoArticuloBlogPalabras(i: Inputs): Outputs {
  const pal = Number(i.palabras) || 1500;
  const seo = String(i.nivelSeo || 'medio');
  const exp = String(i.experiencia || 'media');
  if (pal <= 0) throw new Error('Palabras inválidas');

  const MATRIZ: Record<string, Record<string, number>> = {
    bajo:  { baja: 0.20, media: 0.12, alta: 0.08 },
    medio: { baja: 0.28, media: 0.14, alta: 0.10 },
    alto:  { baja: 0.35, media: 0.20, alta: 0.14 },
  };

  const minPorPal = MATRIZ[seo]?.[exp] ?? 0.14;
  const minTotales = pal * minPorPal;
  const horas = minTotales / 60;
  const postsSem = Math.floor(40 / horas);

  const inv = Math.round(horas * 0.25 * 10) / 10;
  const esc = Math.round(horas * 0.45 * 10) / 10;
  const rev = Math.round(horas * 0.30 * 10) / 10;
  const horasFmt = Math.round(horas * 10) / 10;
  const totalDesglose = Math.round((inv + esc + rev) * 10) / 10;

  return {
    horasTotales: horasFmt,
    minutosPorPalabra: Math.round(minPorPal * 100) / 100,
    postsPor40h: postsSem,
    desglose: `Investig ${inv}h / Escritura ${esc}h / Edición+SEO ${rev}h`,
    _insight: {
      title: 'Cuánto te lleva el artículo',
      text: `Un texto de **${pal} palabras** con SEO ${seo} y experiencia ${exp} te toma unas **${horasFmt} horas**. A ese ritmo producís hasta **${postsSem} artículos** en una semana de 40 h.`,
      tone: 'neutral',
      icon: '✍️'
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Investigación', value: inv },
        { label: 'Escritura', value: esc },
        { label: 'Edición + SEO', value: rev }
      ],
      centerValue: `${totalDesglose} h`,
      centerLabel: 'por artículo',
      ariaLabel: `Desglose de ${totalDesglose} horas: ${inv} de investigación, ${esc} de escritura y ${rev} de edición y SEO.`
    }
  };

}
