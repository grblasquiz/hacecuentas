/** Comision MercadoLibre */
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
  const cargoFijo = precio < 10000 ? 200 : precio < 40000 ? 400 : 500;
  const cargoEnvio = (eg === 'si' && precio < 40000) ? envio : 0;
  const neto = precio - comision - cargoFijo - cargoEnvio;
  const ganancia = neto - costo;
  return {
    netoVendedor: Math.round(neto),
    comisionML: Math.round(comision + cargoFijo),
    cargoEnvio: Math.round(cargoEnvio),
    gananciaNeta: Math.round(ganancia),
    margenPct: Number(((ganancia / precio) * 100).toFixed(2))
  };
}
