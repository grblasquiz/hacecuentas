/** Calculadora de ROI Publicidad Redes */
export interface Inputs { inversionAds: number; ventasGeneradas: number; leadsGenerados: number; impresiones?: number; }
export interface Outputs { roi: number; costoLead: number; roas: number; mensaje: string; _insight?: any; _chart?: any; }

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

  const roiR = Number(roi.toFixed(1));
  const insight = {
    title: roiR >= 0 ? 'Campaña rentable' : 'Campaña en pérdida',
    text: roiR >= 0
      ? `Con $${inv.toLocaleString('es-AR')} invertidos generaste $${ventas.toLocaleString('es-AR')} en ventas: un ROAS de **${roas.toFixed(2)}x** y ROI **${roiR.toFixed(0)}%**.${leads > 0 ? ` Cada lead te costó **$${costoLead.toLocaleString('es-AR')}**.` : ''} ${roiR > 200 ? 'Margen para escalar el presupuesto sin perder eficiencia.' : 'Optimizá públicos y creativos para subir el ROAS.'}`
      : `La campaña gastó $${inv.toLocaleString('es-AR')} y trajo $${ventas.toLocaleString('es-AR')}: estás perdiendo **$${Math.abs(ventas - inv).toLocaleString('es-AR')}** (ROAS ${roas.toFixed(2)}x).${leads > 0 ? ` Costo por lead $${costoLead.toLocaleString('es-AR')}.` : ''} Pausá lo peor y revisá targeting antes de seguir invirtiendo.`,
    tone: (roiR < 0 ? 'warn' : roiR > 200 ? 'good' : 'neutral') as 'good' | 'warn' | 'neutral',
    icon: '📱',
  };

  const chart = {
    type: 'scale' as const,
    marker: roiR,
    markerLabel: 'Tu ROI: ' + roiR.toFixed(0) + '%',
    min: Math.min(-100, Math.floor(roiR)),
    unit: '%',
    segments: [
      { nombre: 'Negativo', max: 0, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Bajo', max: 50, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Bueno', max: 200, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Excelente', max: Math.max(400, Math.ceil(roiR) + 100), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de ROI de publicidad en redes: negativo, bajo, bueno, excelente.',
  };

  return { roi: roiR, costoLead: Number(costoLead.toFixed(0)), roas: Number(roas.toFixed(2)), mensaje, _insight: insight, _chart: chart };
}
