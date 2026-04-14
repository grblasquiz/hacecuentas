/** Agregar o discriminar IVA */
export interface Inputs { monto: number; modo: 'agregar' | 'discriminar' | string; alicuota: number | string; }
export interface Outputs {
  neto: number;
  iva: number;
  total: number;
  alicuotaAplicada: number;
}

export function precioIva(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const modo = String(i.modo || 'agregar');
  const alic = Number(i.alicuota) / 100;
  if (!monto || monto <= 0) throw new Error('Ingresá el monto');
  if (alic < 0) throw new Error('Alícuota inválida');

  if (modo === 'agregar') {
    const iva = monto * alic;
    return {
      neto: Math.round(monto),
      iva: Math.round(iva),
      total: Math.round(monto + iva),
      alicuotaAplicada: Number((alic * 100).toFixed(2)),
    };
  }
  // discriminar: el monto es total (con IVA) — sacamos el neto y el IVA
  const neto = monto / (1 + alic);
  const iva = monto - neto;
  return {
    neto: Math.round(neto),
    iva: Math.round(iva),
    total: Math.round(monto),
    alicuotaAplicada: Number((alic * 100).toFixed(2)),
  };
}
