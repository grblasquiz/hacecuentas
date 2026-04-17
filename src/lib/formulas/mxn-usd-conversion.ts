/**
 * Conversor MXN ↔ USD con canales comerciales (fix, app, banco, caja, aeropuerto)
 */

export interface Inputs {
  monto: number;
  direccion?: 'mxn-a-usd' | 'usd-a-mxn';
  tipoCambioFix?: number;
  canal?: 'fix' | 'app' | 'banco' | 'caja' | 'aeropuerto';
  // retro-compat
  moneda?: 'MXN' | 'USD';
  tipoCambio?: number;
}

export interface Outputs {
  resultado: number;
  tipoAplicado: number;
  diferenciaVsFix: number;
  costoSpread: number;
  mensaje: string;
}

const SPREAD_CANAL: Record<string, number> = {
  fix: 0,
  app: 0.10,
  banco: 0.50,
  caja: 0.80,
  aeropuerto: 1.50,
};

export function mxnUsdConversion(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const tc = Number(i.tipoCambioFix ?? i.tipoCambio ?? 20.0);
  const canal = i.canal ?? 'banco';

  // Derivar dirección
  let direccion: 'mxn-a-usd' | 'usd-a-mxn';
  if (i.direccion) direccion = i.direccion;
  else if (i.moneda === 'MXN') direccion = 'mxn-a-usd';
  else if (i.moneda === 'USD') direccion = 'usd-a-mxn';
  else direccion = 'usd-a-mxn';

  if (!monto || monto <= 0) throw new Error('Ingresá el monto a convertir');
  if (!tc || tc <= 0) throw new Error('Tipo de cambio inválido');

  const spread = SPREAD_CANAL[canal] ?? 0;
  // Compra MXN (usd-a-mxn): el cliente recibe menos MXN → tipoAplicado = fix - spread
  // Venta MXN (mxn-a-usd): el cliente paga más MXN por USD → tipoAplicado = fix + spread
  const tipoAplicado = direccion === 'mxn-a-usd' ? tc + spread : tc - spread;

  let resultado: number;
  let resultadoFix: number;
  if (direccion === 'mxn-a-usd') {
    resultado = monto / tipoAplicado;
    resultadoFix = monto / tc;
  } else {
    resultado = monto * tipoAplicado;
    resultadoFix = monto * tc;
  }

  const diferenciaVsFix = resultado - resultadoFix;
  const costoSpread = Math.abs(diferenciaVsFix);

  return {
    resultado: Number(resultado.toFixed(2)),
    tipoAplicado: Number(tipoAplicado.toFixed(4)),
    diferenciaVsFix: Number(diferenciaVsFix.toFixed(2)),
    costoSpread: Number(costoSpread.toFixed(2)),
    mensaje: `${monto} ${direccion === 'mxn-a-usd' ? 'MXN' : 'USD'} → ${resultado.toFixed(2)} ${direccion === 'mxn-a-usd' ? 'USD' : 'MXN'} (canal ${canal}, tipo aplicado $${tipoAplicado.toFixed(4)}). Costo spread vs FIX: $${costoSpread.toFixed(2)}.`,
  };
}
