/** Convertir precio en dólares a pesos argentinos */
export interface Inputs {
  precioUSD: number;
  tipoCambio: string;
  cotizacion: number;
  impuestoPct?: number;
}
export interface Outputs {
  precioFinalPesos: number;
  cotizacionEfectiva: number;
  impuestosMonto: number;
}

export function precioDolarProducto(i: Inputs): Outputs {
  const usd = Number(i.precioUSD);
  const cotiz = Number(i.cotizacion);
  const impPct = Number(i.impuestoPct) || 0;

  if (!usd || usd <= 0) throw new Error('Ingresá el precio en dólares');
  if (!cotiz || cotiz <= 0) throw new Error('Ingresá la cotización del dólar');
  if (impPct < 0) throw new Error('Los impuestos no pueden ser negativos');

  const cotizacionEfectiva = cotiz * (1 + impPct / 100);
  const precioBase = usd * cotiz;
  const impuestosMonto = usd * cotiz * (impPct / 100);
  const precioFinalPesos = precioBase + impuestosMonto;

  return {
    precioFinalPesos: Math.round(precioFinalPesos),
    cotizacionEfectiva: Math.round(cotizacionEfectiva),
    impuestosMonto: Math.round(impuestosMonto),
  };
}
