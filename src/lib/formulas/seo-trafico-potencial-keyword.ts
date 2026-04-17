/** SEO trafico potencial keyword */
export interface Inputs { searchVolume: number; posicionObjetivo: number; tipoIntent: string; cvrLanding: number; valorConversion: number; }
export interface Outputs { traficoMensual: number; ctrEstimado: number; conversionesMes: number; revenueMensual: number; revenueAnual: number; }
export function seoTraficoPotencialKeyword(i: Inputs): Outputs {
  const sv = Number(i.searchVolume);
  const pos = Number(i.posicionObjetivo);
  const intent = String(i.tipoIntent || 'informational');
  const cvr = Number(i.cvrLanding) / 100;
  const val = Number(i.valorConversion);
  if (sv < 0) throw new Error('Search volume inválido');
  if (pos < 1) throw new Error('Posición >= 1');
  const ctrByPos: Record<number, number> = { 1: 30, 2: 18, 3: 10, 4: 6, 5: 4, 6: 3, 7: 2.5, 8: 2, 9: 1.8, 10: 1.5 };
  let ctr = 0.5;
  if (pos <= 10) ctr = ctrByPos[pos] || 1.5;
  else if (pos <= 20) ctr = 0.8;
  else ctr = 0.3;
  const intentAdj: Record<string, number> = { informational: 1.0, commercial: 0.9, transactional: 0.75 };
  ctr = ctr * (intentAdj[intent] || 1);
  const trafico = sv * (ctr / 100);
  const conv = trafico * cvr;
  const revenue = conv * val;
  return {
    traficoMensual: Math.round(trafico),
    ctrEstimado: Number(ctr.toFixed(2)),
    conversionesMes: Number(conv.toFixed(1)),
    revenueMensual: Math.round(revenue),
    revenueAnual: Math.round(revenue * 12)
  };
}
