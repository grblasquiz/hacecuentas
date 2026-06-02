/** ROI de SEO basado en valor de tráfico orgánico y conversiones */

export interface Inputs {
  visitasOrganicas: number;
  cpcEquivalente: number;
  tasaConversion: number;
  valorConversion: number;
  inversionSeoMensual: number;
}

export interface Outputs {
  roiSeo: number;
  valorTrafico: number;
  ingresoConversiones: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function roiSeoTraficoOrganico(i: Inputs): Outputs {
  const visitas = Number(i.visitasOrganicas);
  const cpc = Number(i.cpcEquivalente);
  const tasa = Number(i.tasaConversion);
  const valorConv = Number(i.valorConversion);
  const inversion = Number(i.inversionSeoMensual);

  if (isNaN(visitas) || visitas < 0) throw new Error('Ingresá las visitas orgánicas mensuales');
  if (isNaN(cpc) || cpc < 0) throw new Error('Ingresá el CPC equivalente');
  if (isNaN(tasa) || tasa < 0 || tasa > 100) throw new Error('La tasa de conversión debe estar entre 0 y 100');
  if (isNaN(valorConv) || valorConv < 0) throw new Error('El valor por conversión no puede ser negativo');
  if (isNaN(inversion) || inversion < 0) throw new Error('La inversión en SEO no puede ser negativa');

  const valorTrafico = visitas * cpc;
  const conversiones = visitas * (tasa / 100);
  const ingresoConversiones = conversiones * valorConv;
  const roiSeo = inversion > 0 ? ((ingresoConversiones - inversion) / inversion) * 100 : 0;
  const ahorroCpcMensual = valorTrafico;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `${fmt.format(visitas)} visitas orgánicas × $${fmt.format(cpc)} CPC = ` +
    `$${fmt.format(valorTrafico)} de valor de tráfico equivalente/mes. ` +
    `Conversiones: ${fmt.format(conversiones)} (${tasa}% de ${fmt.format(visitas)} visitas). ` +
    `Ingreso por conversiones: $${fmt.format(ingresoConversiones)}/mes. ` +
    `Inversión SEO: $${fmt.format(inversion)}/mes. ` +
    `ROI: ${roiSeo.toFixed(0)}%. ` +
    `Ahorro vs. ads (CPC equivalente): $${fmt.format(ahorroCpcMensual)}/mes.`;

  const roiR = Number(roiSeo.toFixed(1));
  const insight = {
    title: roiR >= 0 ? 'SEO rentable' : 'SEO sin retorno aún',
    text: roiR >= 0
      ? `Tus ${fmt.format(visitas)} visitas orgánicas equivalen a **$${fmt.format(valorTrafico)}/mes** que te ahorrás en ads, y convierten en **$${fmt.format(ingresoConversiones)}/mes** de ingreso contra $${fmt.format(inversion)} de inversión: ROI **${roiR.toFixed(0)}%**. ${roiR > 200 ? 'El canal orgánico ya se paga solo varias veces; reinvertí en más contenido.' : 'A medida que el tráfico madure, el ROI tiende a subir porque el costo es fijo.'}`
      : `Las ${fmt.format(visitas)} visitas generan $${fmt.format(ingresoConversiones)}/mes en conversiones, todavía por debajo de los $${fmt.format(inversion)}/mes que invertís: ROI **${roiR.toFixed(0)}%**. El SEO suele tardar meses en madurar; sumá el ahorro de **$${fmt.format(valorTrafico)}/mes** vs. ads al evaluarlo.`,
    tone: (roiR < 0 ? 'warn' : roiR >= 100 ? 'good' : 'neutral') as 'good' | 'warn' | 'neutral',
    icon: '🔍',
  };

  const chart = {
    type: 'scale' as const,
    marker: roiR,
    markerLabel: 'Tu ROI: ' + roiR.toFixed(0) + '%',
    min: Math.min(-100, Math.floor(roiR)),
    unit: '%',
    segments: [
      { nombre: 'Negativo', max: 0, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'En desarrollo', max: 100, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Rentable', max: 300, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Excelente', max: Math.max(500, Math.ceil(roiR) + 100), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de ROI de SEO: negativo, en desarrollo, rentable, excelente.',
  };

  return {
    roiSeo: roiR,
    valorTrafico: Math.round(valorTrafico),
    ingresoConversiones: Math.round(ingresoConversiones),
    detalle,
    _insight: insight,
    _chart: chart,
  };
}
