/** Net Promoter Score */
export interface Inputs {
  promotores: number;
  pasivos: number;
  detractores: number;
}
export interface Outputs {
  nps: number;
  total: number;
  pctPromotores: number;
  pctPasivos: number;
  pctDetractores: number;
  mensaje: string;
}

export function nps(i: Inputs): Outputs {
  const p = Number(i.promotores) || 0;
  const pa = Number(i.pasivos) || 0;
  const d = Number(i.detractores) || 0;
  const total = p + pa + d;
  if (total === 0) throw new Error('Ingresá al menos una respuesta');

  const pctP = (p / total) * 100;
  const pctPa = (pa / total) * 100;
  const pctD = (d / total) * 100;
  const npsVal = pctP - pctD;

  let msg = '';
  if (npsVal < 0) msg = 'NPS negativo — más detractores que promotores. Crisis de experiencia.';
  else if (npsVal < 30) msg = 'NPS bajo — margen de mejora grande.';
  else if (npsVal < 50) msg = 'NPS bueno — estás sobre el promedio.';
  else if (npsVal < 70) msg = 'NPS excelente — experiencia muy por encima de la media.';
  else msg = 'NPS extraordinario — nivel Apple / Tesla (70 +).';

  return {
    nps: Math.round(npsVal),
    total,
    pctPromotores: Number(pctP.toFixed(1)),
    pctPasivos: Number(pctPa.toFixed(1)),
    pctDetractores: Number(pctD.toFixed(1)),
    mensaje: msg,
  };
}
