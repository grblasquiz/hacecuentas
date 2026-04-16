/** Qué precio tendría un token con un market cap objetivo */

export interface Inputs {
  circulatingSupply: number;
  precioActual: number;
  marketCapObjetivo: number;
  tokenQuemados: number;
}

export interface Outputs {
  precioObjetivo: number;
  marketCapActual: number;
  multiplicador: number;
  gananciaPorc: number;
  supplyEfectivo: number;
  formula: string;
  explicacion: string;
}

export function marketCapVsPrecio(i: Inputs): Outputs {
  const supply = Number(i.circulatingSupply);
  const precio = Number(i.precioActual);
  const mcapObj = Number(i.marketCapObjetivo);
  const quemados = Number(i.tokenQuemados) || 0;

  if (!supply || supply <= 0) throw new Error('Ingresá el circulating supply');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio actual');
  if (!mcapObj || mcapObj <= 0) throw new Error('Ingresá el market cap objetivo');

  const supplyEfectivo = supply - quemados;
  if (supplyEfectivo <= 0) throw new Error('El supply efectivo debe ser mayor a 0');

  const marketCapActual = supplyEfectivo * precio;
  const precioObjetivo = mcapObj / supplyEfectivo;
  const multiplicador = precioObjetivo / precio;
  const gananciaPorc = (multiplicador - 1) * 100;

  const formula = `Precio objetivo = $${mcapObj.toExponential(2)} / ${supplyEfectivo.toExponential(2)} = $${precioObjetivo.toFixed(6)}`;

  const formatMcap = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };

  const explicacion = `Market cap actual: ${formatMcap(marketCapActual)}. Para alcanzar ${formatMcap(mcapObj)} de market cap con ${supplyEfectivo.toExponential(2)} tokens en circulación, el precio debería ser $${precioObjetivo.toFixed(6)} (${multiplicador.toFixed(2)}x, o +${gananciaPorc.toFixed(1)}% desde el precio actual de $${precio}).`;

  return {
    precioObjetivo: Number(precioObjetivo.toFixed(8)),
    marketCapActual: Math.round(marketCapActual),
    multiplicador: Number(multiplicador.toFixed(4)),
    gananciaPorc: Number(gananciaPorc.toFixed(2)),
    supplyEfectivo,
    formula,
    explicacion,
  };
}
