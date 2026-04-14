/** Comisión de vendedor / agente inmobiliario / freelancer */
export interface Inputs {
  montoVenta: number;
  porcentajeComision: number;
  baseImponible?: 'neto' | 'bruto' | string;
  alicuotaIva?: number;
  aplicarIvaSobreComision?: boolean | string;
}
export interface Outputs {
  comisionNeta: number;
  ivaComision: number;
  comisionTotal: number;
  porcentajeSobreVenta: number;
}

export function comisionVenta(i: Inputs): Outputs {
  const venta = Number(i.montoVenta);
  const pct = Number(i.porcentajeComision);
  const base = String(i.baseImponible || 'bruto');
  const alic = Number(i.alicuotaIva) || 21;
  const conIva = i.aplicarIvaSobreComision === true || i.aplicarIvaSobreComision === 'true' || i.aplicarIvaSobreComision === 'si';

  if (!venta || venta <= 0) throw new Error('Ingresá el monto de venta');
  if (pct < 0) throw new Error('Porcentaje inválido');

  // Si base es neto, saco IVA primero
  const baseCalculo = base === 'neto' ? venta / (1 + alic / 100) : venta;
  const comisionNeta = baseCalculo * pct / 100;
  const ivaComision = conIva ? comisionNeta * alic / 100 : 0;
  const total = comisionNeta + ivaComision;

  return {
    comisionNeta: Math.round(comisionNeta),
    ivaComision: Math.round(ivaComision),
    comisionTotal: Math.round(total),
    porcentajeSobreVenta: Number(((total / venta) * 100).toFixed(2)),
  };
}
