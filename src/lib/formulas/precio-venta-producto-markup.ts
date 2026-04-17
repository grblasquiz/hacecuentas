/** Precio venta producto markup */
export interface Inputs { costoProducto: number; markupPct: number; aplicarIva: string; usarPsicologico: string; }
export interface Outputs { precioFinal: number; precioSinIva: number; margenPct: number; gananciaNeta: number; }
export function precioVentaProductoMarkup(i: Inputs): Outputs {
  const costo = Number(i.costoProducto);
  const mk = Number(i.markupPct) / 100;
  const iva = String(i.aplicarIva || 'no');
  const psico = String(i.usarPsicologico || 'no');
  if (!costo || costo <= 0) throw new Error('Costo inválido');
  const precioSinIva = costo * (1 + mk);
  const ivaRates: Record<string, number> = { no: 0, si21: 0.21, si16: 0.16, si19: 0.19 };
  const ivaRate = ivaRates[iva] || 0;
  let precio = precioSinIva * (1 + ivaRate);
  if (psico === 'si') {
    precio = Math.floor(precio) + 0.99;
  } else {
    precio = Math.round(precio);
  }
  const ganancia = (psico === 'si' ? precio - (precio * ivaRate / (1 + ivaRate)) : precioSinIva) - costo;
  return {
    precioFinal: Number(precio.toFixed(2)),
    precioSinIva: Number(precioSinIva.toFixed(2)),
    margenPct: Number(((ganancia / precioSinIva) * 100).toFixed(2)),
    gananciaNeta: Number(ganancia.toFixed(2))
  };
}
