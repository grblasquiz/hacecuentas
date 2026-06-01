/** Agregar o discriminar IVA */
export interface Inputs { monto: number; modo: 'agregar' | 'discriminar' | string; alicuota: number | string; }
export interface Outputs {
  neto: number;
  iva: number;
  total: number;
  alicuotaAplicada: number;
  _chart?: any;
}

export function precioIva(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const modo = String(i.modo || 'agregar');
  const alic = Number(i.alicuota) / 100;
  if (!monto || monto <= 0) throw new Error('Ingresá el monto');
  if (alic < 0) throw new Error('Alícuota inválida');

  if (modo === 'agregar') {
    const iva = monto * alic;
    const chartA = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Neto', value: Math.round(monto) },
        { label: 'IVA', value: Math.round(iva) },
      ],
      prefix: '$',
      centerValue: '$' + Math.round(monto + iva).toLocaleString('es-AR'),
      centerLabel: 'Total',
      ariaLabel: 'Composición del precio: neto más IVA',
    };
    return {
      neto: Math.round(monto),
      iva: Math.round(iva),
      total: Math.round(monto + iva),
      alicuotaAplicada: Number((alic * 100).toFixed(2)),
      _chart: chartA,
    };
  }
  // discriminar: el monto es total (con IVA) — sacamos el neto y el IVA
  const neto = monto / (1 + alic);
  const iva = monto - neto;
  const chartD = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      { label: 'IVA', value: Math.round(iva) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(monto).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del precio: neto más IVA',
  };
  return {
    neto: Math.round(neto),
    iva: Math.round(iva),
    total: Math.round(monto),
    alicuotaAplicada: Number((alic * 100).toFixed(2)),
    _chart: chartD,
  };
}
