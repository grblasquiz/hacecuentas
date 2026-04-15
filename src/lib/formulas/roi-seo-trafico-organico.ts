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

  return {
    roiSeo: Number(roiSeo.toFixed(1)),
    valorTrafico: Math.round(valorTrafico),
    ingresoConversiones: Math.round(ingresoConversiones),
    detalle,
  };
}
