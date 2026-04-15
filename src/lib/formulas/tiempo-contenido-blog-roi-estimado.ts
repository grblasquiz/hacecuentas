/** ROI de content marketing / blog */

export interface Inputs {
  cantidadArticulos: number;
  costoPromedioArticulo: number;
  visitasMensualesPromedio: number;
  cpcEquivalente: number;
  tasaConversionBlog: number;
  valorConversion: number;
  mesesAnalisis: number;
}

export interface Outputs {
  roiContent: number;
  inversionTotal: number;
  valorTraficoTotal: number;
  detalle: string;
}

export function tiempoContenidoBlogRoiEstimado(i: Inputs): Outputs {
  const articulos = Number(i.cantidadArticulos);
  const costoArt = Number(i.costoPromedioArticulo);
  const visitas = Number(i.visitasMensualesPromedio);
  const cpc = Number(i.cpcEquivalente);
  const tasa = Number(i.tasaConversionBlog);
  const valorConv = Number(i.valorConversion);
  const meses = Number(i.mesesAnalisis);

  if (isNaN(articulos) || articulos < 1) throw new Error('Ingresá la cantidad de artículos');
  if (isNaN(costoArt) || costoArt < 0) throw new Error('El costo por artículo no puede ser negativo');
  if (isNaN(visitas) || visitas < 0) throw new Error('Las visitas no pueden ser negativas');
  if (isNaN(cpc) || cpc < 0) throw new Error('El CPC equivalente no puede ser negativo');
  if (isNaN(tasa) || tasa < 0 || tasa > 100) throw new Error('La tasa de conversión debe estar entre 0 y 100');
  if (isNaN(valorConv) || valorConv < 0) throw new Error('El valor por conversión no puede ser negativo');
  if (isNaN(meses) || meses < 1) throw new Error('Ingresá los meses de análisis');

  const inversionTotal = articulos * costoArt;
  const valorTraficoMensual = visitas * cpc;
  const valorTraficoTotal = valorTraficoMensual * meses;
  const conversionesMensuales = visitas * (tasa / 100);
  const ingresoConversionesTotal = conversionesMensuales * valorConv * meses;
  const valorTotal = ingresoConversionesTotal;
  const roiContent = inversionTotal > 0 ? ((valorTotal - inversionTotal) / inversionTotal) * 100 : 0;
  const costoPorLead = conversionesMensuales > 0 ? inversionTotal / (conversionesMensuales * meses) : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let evaluacion: string;
  if (roiContent > 500) {
    evaluacion = 'ROI excelente — el content marketing es tu canal más rentable.';
  } else if (roiContent > 100) {
    evaluacion = 'ROI muy bueno — la inversión en contenido se multiplica.';
  } else if (roiContent > 0) {
    evaluacion = 'ROI positivo — el contenido se paga y genera valor adicional.';
  } else {
    evaluacion = 'ROI negativo — necesitás más tiempo, más tráfico o mejor tasa de conversión.';
  }

  const detalle =
    `${articulos} artículos × $${fmt.format(costoArt)} = $${fmt.format(inversionTotal)} inversión. ` +
    `${fmt.format(visitas)} visitas/mes × ${meses} meses = ${fmt.format(visitas * meses)} visitas totales. ` +
    `Valor tráfico (CPC equiv.): $${fmt.format(valorTraficoTotal)} en ${meses} meses. ` +
    `Conversiones: ${fmt.format(conversionesMensuales)}/mes × ${meses} meses = ${fmt.format(conversionesMensuales * meses)}. ` +
    `Ingreso conversiones: $${fmt.format(ingresoConversionesTotal)}. ` +
    `CPL orgánico: $${fmt.format(costoPorLead)}. ` +
    `ROI: ${roiContent.toFixed(0)}%. ${evaluacion}`;

  return {
    roiContent: Number(roiContent.toFixed(1)),
    inversionTotal: Math.round(inversionTotal),
    valorTraficoTotal: Math.round(valorTraficoTotal),
    detalle,
  };
}
