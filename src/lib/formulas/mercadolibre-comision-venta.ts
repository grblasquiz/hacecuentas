/** MercadoLibre Comisión */
export interface Inputs { precioProducto: number; pais: string; tipoPublicacion: string; envioGratis: string; }
export interface Outputs { comisionPct: string; comisionValor: string; costoFijo: string; netoVendedor: string; }

export function mercadolibreComisionVenta(i: Inputs): Outputs {
  const p = Number(i.precioProducto);
  const pais = String(i.pais);
  const tipo = String(i.tipoPublicacion);
  const envio = String(i.envioGratis);
  if (p <= 0) throw new Error('Precio inválido');
  const config: Record<string, { clasica: number; premium: number; fijo: number; umbral: number; moneda: string }> = {
    'Argentina (ARS)': { clasica: 0.13, premium: 0.175, fijo: 2000, umbral: 10000, moneda: 'ARS' },
    'México (MXN)': { clasica: 0.125, premium: 0.165, fijo: 30, umbral: 299, moneda: 'MXN' },
    'Brasil (BRL)': { clasica: 0.12, premium: 0.17, fijo: 5, umbral: 79, moneda: 'BRL' },
  };
  const c = config[pais];
  if (!c) throw new Error('País no válido');
  const pct = tipo === 'Premium' ? c.premium : c.clasica;
  const comVal = p * pct;
  const fijo = p < c.umbral ? c.fijo : 0;
  const envioCosto = envio.startsWith('Sí') ? p * 0.08 : 0;
  const neto = p - comVal - fijo - envioCosto;
  return {
    comisionPct: `${(pct * 100).toFixed(1)}% (${tipo})`,
    comisionValor: `${c.moneda} ${comVal.toLocaleString('es-AR', {maximumFractionDigits: 0})}`,
    costoFijo: fijo > 0 ? `${c.moneda} ${fijo.toLocaleString('es-AR')} (producto < ${c.umbral})` : 'Sin costo fijo',
    netoVendedor: `${c.moneda} ${neto.toLocaleString('es-AR', {maximumFractionDigits: 0})}${envio.startsWith('Sí') ? ' (−envío gratis absorbido)' : ''}`,
  };
}
