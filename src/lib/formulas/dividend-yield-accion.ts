/** Dividend Yield — rendimiento por dividendo de una acción */

export interface Inputs {
  dividendoAnual: number;
  precioAccion: number;
  frecuenciaPago: string;
  tasaCrecimientoDividendo: number;
  aniosProyeccion: number;
}

export interface Outputs {
  dividendYield: number;
  dividendoPorPago: number;
  yieldOn10Anios: number;
  ingresoAnualPor10k: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function dividendYieldAccion(i: Inputs): Outputs {
  const dividendo = Number(i.dividendoAnual);
  const precio = Number(i.precioAccion);
  const frecuencia = String(i.frecuenciaPago || 'trimestral');
  const crecimiento = Number(i.tasaCrecimientoDividendo) || 0;
  const anios = Number(i.aniosProyeccion) || 10;

  if (!dividendo || dividendo < 0) throw new Error('Ingresá el dividendo anual');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio de la acción');

  const dividendYield = (dividendo / precio) * 100;

  let pagosAnio: number;
  switch (frecuencia) {
    case 'mensual': pagosAnio = 12; break;
    case 'trimestral': pagosAnio = 4; break;
    case 'semestral': pagosAnio = 2; break;
    case 'anual': pagosAnio = 1; break;
    default: pagosAnio = 4;
  }
  const dividendoPorPago = dividendo / pagosAnio;

  // Yield on cost proyectado
  const dividendoFuturo = dividendo * Math.pow(1 + crecimiento / 100, anios);
  const yieldOn10Anios = (dividendoFuturo / precio) * 100;

  // Ingreso anual por cada $10,000 invertidos
  const ingresoAnualPor10k = (10000 / precio) * dividendo;

  const formula = `Yield = $${dividendo} / $${precio} × 100 = ${dividendYield.toFixed(2)}%`;
  const explicacion = `Dividend yield: ${dividendYield.toFixed(2)}% ($${dividendo} dividendo / $${precio} precio). Pago ${frecuencia}: $${dividendoPorPago.toFixed(2)} por acción.${crecimiento > 0 ? ` Con ${crecimiento}% de crecimiento anual, el yield-on-cost en ${anios} años sería ${yieldOn10Anios.toFixed(2)}%.` : ''} Por cada $10,000 invertidos, recibís ~$${Math.round(ingresoAnualPor10k).toLocaleString()} al año en dividendos.`;

  const zona = dividendYield < 2 ? 'bajo' : dividendYield < 4 ? 'moderado' : dividendYield <= 6 ? 'alto' : 'muy alto';
  const ingresoFmt = Math.round(ingresoAnualPor10k).toLocaleString();
  const insightText = zona === 'bajo'
    ? `Un yield de **${dividendYield.toFixed(2)}%** es bajo: la acción reparte poco dividendo en relación a su precio. Suele indicar una empresa que prioriza reinvertir para crecer antes que pagar a sus accionistas.`
    : zona === 'moderado'
    ? `Un yield de **${dividendYield.toFixed(2)}%** está en un rango moderado y sostenible. Por cada $10.000 invertidos cobrarías unos **$${ingresoFmt}** al año en dividendos.`
    : zona === 'alto'
    ? `Un yield de **${dividendYield.toFixed(2)}%** es atractivo: rinde **$${ingresoFmt}** anuales por cada $10.000. Verificá que el dividendo sea sostenible (payout y flujo de caja) antes de asumir que se mantiene.`
    : `Un yield de **${dividendYield.toFixed(2)}%** es inusualmente alto. Cuidado con la *trampa de dividendos*: a veces refleja una caída del precio por problemas de fondo, no generosidad. Revisá si el dividendo es sostenible.`;

  return {
    dividendYield: Number(dividendYield.toFixed(4)),
    dividendoPorPago: Number(dividendoPorPago.toFixed(2)),
    yieldOn10Anios: Number(yieldOn10Anios.toFixed(2)),
    ingresoAnualPor10k: Number(ingresoAnualPor10k.toFixed(2)),
    formula,
    explicacion,
    _insight: {
      title: 'Tu rendimiento por dividendo',
      text: insightText,
      tone: zona === 'muy alto' ? 'warn' : zona === 'bajo' ? 'neutral' : 'good',
      icon: '💰',
    },
    _chart: {
      type: 'scale',
      marker: Number(dividendYield.toFixed(2)),
      markerLabel: `${dividendYield.toFixed(2)}%`,
      min: 0,
      segments: [
        { nombre: 'Bajo', max: 2, color: '#94a3b8', colorDark: '#64748b' },
        { nombre: 'Moderado', max: 4, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Alto', max: 6, color: '#3b82f6', colorDark: '#2563eb' },
        { nombre: 'Muy alto', max: Math.max(8, Number((dividendYield * 1.15).toFixed(2))), color: '#f59e0b', colorDark: '#d97706' },
      ],
      ariaLabel: `Yield de ${dividendYield.toFixed(2)}%, ubicado en la zona ${zona}`,
    },
  };
}
