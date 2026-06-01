/** Costo total de compra del exterior con impuestos */
export interface Inputs {
  precioProductoUSD: number;
  costoEnvioUSD?: number;
  cotizacionDolar: number;
  franquiciaUSD?: number;
  impuestoExcedentesPct?: number;
}
export interface Outputs {
  costoTotalPesos: number;
  costoTotalUSD: number;
  impuestosAduana: number;
  sobrecargoVsProducto: string;
  _chart?: any;
}

export function costoEnvioCompraExterior(i: Inputs): Outputs {
  const producto = Number(i.precioProductoUSD);
  const envio = Number(i.costoEnvioUSD) || 0;
  const cotiz = Number(i.cotizacionDolar);
  const franquicia = Number(i.franquiciaUSD) ?? 50;
  const impPct = Number(i.impuestoExcedentesPct) ?? 50;

  if (!producto || producto <= 0) throw new Error('Ingresá el precio del producto en USD');
  if (!cotiz || cotiz <= 0) throw new Error('Ingresá la cotización del dólar');

  const valorDeclarado = producto + envio;
  const excedente = Math.max(0, valorDeclarado - franquicia);
  const impuestosAduana = excedente * (impPct / 100);
  const costoTotalUSD = valorDeclarado + impuestosAduana;
  const costoTotalPesos = costoTotalUSD * cotiz;
  const sobrecargoPct = ((costoTotalUSD - producto) / producto * 100).toFixed(1);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Producto', value: producto },
      { label: 'Envío', value: envio },
      { label: 'Impuestos aduana', value: impuestosAduana },
    ],
    prefix: 'US$',
    centerValue: 'US$' + Math.round(costoTotalUSD).toLocaleString('es-AR'),
    centerLabel: 'Costo total',
    ariaLabel: 'Composición del costo total en USD: producto, envío e impuestos de aduana.',
  };

  return {
    costoTotalPesos: Math.round(costoTotalPesos),
    costoTotalUSD: Math.round(costoTotalUSD * 100) / 100,
    impuestosAduana: Math.round(impuestosAduana * 100) / 100,
    sobrecargoVsProducto: `+${sobrecargoPct}% sobre el precio del producto`,
    _chart: chart,
  };
}
