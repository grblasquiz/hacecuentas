/** Calculadora de ROI Publicidad Redes */
export interface Inputs { inversionAds: number; ventasGeneradas: number; leadsGenerados: number; impresiones?: number; }
export interface Outputs { roi: number; costoLead: number; roas: number; mensaje: string; }

export function roiPublicidadRedes(i: Inputs): Outputs {
  const inv = Number(i.inversionAds);
  const ventas = Number(i.ventasGeneradas) || 0;
  const leads = Number(i.leadsGenerados) || 0;
  if (!inv || inv <= 0) throw new Error('Ingresá la inversión en publicidad');

  const roi = ((ventas - inv) / inv) * 100;
  const costoLead = leads > 0 ? inv / leads : 0;
  const roas = inv > 0 ? ventas / inv : 0;

  let mensaje: string;
  if (roi > 200) mensaje = `ROI de ${roi.toFixed(0)}% — excelente rentabilidad. Por cada $1 invertido recuperás $${roas.toFixed(1)}.`;
  else if (roi > 50) mensaje = `ROI de ${roi.toFixed(0)}% — buena rentabilidad. La campaña genera ganancia neta de $${(ventas - inv).toLocaleString()}.`;
  else if (roi > 0) mensaje = `ROI de ${roi.toFixed(0)}% — positivo pero bajo. Optimizá targeting y creativos para mejorar.`;
  else mensaje = `ROI negativo (${roi.toFixed(0)}%) — la campaña está perdiendo $${Math.abs(ventas - inv).toLocaleString()}. Revisá la estrategia.`;

  return { roi: Number(roi.toFixed(1)), costoLead: Number(costoLead.toFixed(0)), roas: Number(roas.toFixed(2)), mensaje };
}
