/** Conversión cripto a pesos argentinos con cotización manual */

export interface Inputs {
  cantidadCripto: number;
  cotizacionUsd: number;
  tipoCambioPeso: number;
  spreadExchange: number;
}

export interface Outputs {
  totalPesos: number;
  totalUsd: number;
  cotizacionEfectiva: number;
  costoSpread: number;
  formula: string;
  explicacion: string;
}

export function conversionCriptoArs(i: Inputs): Outputs {
  const cantidad = Number(i.cantidadCripto);
  const cotizUsd = Number(i.cotizacionUsd);
  const tipoCambio = Number(i.tipoCambioPeso);
  const spread = Number(i.spreadExchange) || 0;

  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de cripto');
  if (!cotizUsd || cotizUsd <= 0) throw new Error('Ingresá la cotización en USD');
  if (!tipoCambio || tipoCambio <= 0) throw new Error('Ingresá el tipo de cambio ARS/USD');

  const totalUsd = cantidad * cotizUsd;
  const costoSpread = totalUsd * (spread / 100);
  const usdNeto = totalUsd - costoSpread;
  const totalPesos = usdNeto * tipoCambio;
  const cotizacionEfectiva = totalPesos / cantidad;

  const formula = `${cantidad} cripto × $${cotizUsd} USD × ${tipoCambio} ARS/USD - ${spread}% spread = $${Math.round(totalPesos).toLocaleString('es-AR')} ARS`;
  const explicacion = `Tus ${cantidad} unidades valen $${Math.round(totalUsd).toLocaleString('es-AR')} USD. Descontando ${spread}% de spread del exchange, recibís $${Math.round(usdNeto).toLocaleString('es-AR')} USD netos, que al tipo de cambio de $${tipoCambio} son $${Math.round(totalPesos).toLocaleString('es-AR')} ARS. Cotización efectiva por unidad: $${Math.round(cotizacionEfectiva).toLocaleString('es-AR')} ARS.`;

  return {
    totalPesos: Math.round(totalPesos),
    totalUsd: Math.round(totalUsd * 100) / 100,
    cotizacionEfectiva: Math.round(cotizacionEfectiva),
    costoSpread: Math.round(costoSpread * 100) / 100,
    formula,
    explicacion,
  };
}
