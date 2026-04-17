/**
 * Conversor MXN ↔ USD con comisión bancaria estimada
 * Comisión típica banco: 2% (spread cambiario)
 */

export interface Inputs {
  monto: number;
  moneda: 'MXN' | 'USD';
  tipoCambio?: number;
}

export interface Outputs {
  montoConvertido: number;
  montoConComisionBanco: number;
  ahorroFix: number;
  tipoCambioAplicado: number;
  mensaje: string;
}

export function mxnUsdConversion(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const moneda = i.moneda;
  const tc = Number(i.tipoCambio ?? 17.50);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto a convertir');
  if (!['MXN', 'USD'].includes(moneda)) throw new Error('Moneda debe ser MXN o USD');
  if (!tc || tc <= 0) throw new Error('Tipo de cambio inválido');

  const comisionPct = 2.0; // 2% banco típico

  let montoConvertido = 0;
  let montoConComisionBanco = 0;
  let ahorroFix = 0;

  if (moneda === 'MXN') {
    montoConvertido = monto / tc;
    const tcBanco = tc * (1 + comisionPct / 100);
    montoConComisionBanco = monto / tcBanco;
    ahorroFix = montoConvertido - montoConComisionBanco;
  } else {
    montoConvertido = monto * tc;
    const tcBanco = tc * (1 - comisionPct / 100);
    montoConComisionBanco = monto * tcBanco;
    ahorroFix = montoConvertido - montoConComisionBanco;
  }

  const destino = moneda === 'MXN' ? 'USD' : 'MXN';

  return {
    montoConvertido: Number(montoConvertido.toFixed(2)),
    montoConComisionBanco: Number(montoConComisionBanco.toFixed(2)),
    ahorroFix: Number(ahorroFix.toFixed(2)),
    tipoCambioAplicado: tc,
    mensaje: `${monto} ${moneda} equivalen a ${montoConvertido.toFixed(2)} ${destino} al tipo de cambio FIX $${tc}. Con comisión bancaria 2% recibirías ${montoConComisionBanco.toFixed(2)} ${destino} (pierdes ${Math.abs(ahorroFix).toFixed(2)}).`,
  };
}
