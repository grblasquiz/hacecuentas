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

  return {
    dividendYield: Number(dividendYield.toFixed(4)),
    dividendoPorPago: Number(dividendoPorPago.toFixed(2)),
    yieldOn10Anios: Number(yieldOn10Anios.toFixed(2)),
    ingresoAnualPor10k: Number(ingresoAnualPor10k.toFixed(2)),
    formula,
    explicacion,
  };
}
