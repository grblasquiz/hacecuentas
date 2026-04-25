/**
 * Comisión MercadoLibre Argentina 2026
 * Fuentes: mercadolibre.com.ar/ayuda/costos-envios-gratis_3482
 *          mercadolibre.com.ar/ayuda/Costos-de-vender-un-producto_870
 * Nota: la comisión efectiva varía por categoría (11.80%-17.14%) y provincia
 * (desde mediados 2025 suma IIBB). Valores de referencia nacional:
 *   - Clásica: 13% (aprox promedio)
 *   - Premium: 17.5% (aprox promedio)
 */
export interface Inputs { precioVenta: number; tipoPublicacion: string; envioGratis: string; costoEnvio: number; costoProducto: number; }
export interface Outputs { netoVendedor: number; comisionML: number; cargoEnvio: number; gananciaNeta: number; margenPct: number; }

export function comisionMercadolibreVenta(i: Inputs): Outputs {
  const precio = Number(i.precioVenta);
  const tipo = String(i.tipoPublicacion || 'clasica');
  const eg = String(i.envioGratis || 'no');
  const envio = Number(i.costoEnvio);
  const costo = Number(i.costoProducto);
  if (!precio || precio <= 0) throw new Error('Ingresá precio');

  const comisionPct = tipo === 'premium' ? 0.175 : 0.13;
  const comision = precio * comisionPct;

  // Cargo fijo por unidad (ML Argentina 2026) — solo para items de bajo precio
  let cargoFijo = 0;
  if (precio < 15000) cargoFijo = 1115;
  else if (precio < 25000) cargoFijo = 2300;
  else if (precio < 33000) cargoFijo = 2810;
  // precio >= 33000: sin cargo fijo

  // Envío gratis: opcional para vendedor si precio < $33.000; obligatorio (ML bonifica) arriba
  // Si vendedor ofrece envío gratis en items < $33k, paga el envío. Arriba ML subsidia parte.
  const cargoEnvio = (eg === 'si' && precio < 33000) ? envio : 0;

  const neto = precio - comision - cargoFijo - cargoEnvio;
  const ganancia = neto - costo;
  return {
    netoVendedor: Math.round(neto),
    comisionML: Math.round(comision + cargoFijo),
    cargoEnvio: Math.round(cargoEnvio),
    gananciaNeta: Math.round(ganancia),
    margenPct: Number(((ganancia / precio) * 100).toFixed(2)),
  };
}
