/** Calculadora de Stop Loss por ATR (volatilidad) */
export interface Inputs { precioEntrada: number; atr: number; multiplicador: number; direccion: 'long' | 'short'; }
export interface Outputs { stopLoss: number; distancia: number; porcentajeDistancia: number; resumen: string; }
export function stopLossAtrVolatilidad(i: Inputs): Outputs {
  const ent = Number(i.precioEntrada); const atr = Number(i.atr);
  const mul = Number(i.multiplicador); const dir = i.direccion;
  if (!ent || ent <= 0) throw new Error('Ingresá el precio de entrada');
  if (!atr || atr <= 0) throw new Error('Ingresá el ATR');
  if (!mul || mul <= 0) throw new Error('Ingresá el multiplicador');
  if (dir !== 'long' && dir !== 'short') throw new Error('Dirección inválida');
  const dist = mul * atr;
  const sl = dir === 'long' ? ent - dist : ent + dist;
  const pct = (dist / ent) * 100;
  return {
    stopLoss: Number(sl.toFixed(4)),
    distancia: Number(dist.toFixed(4)),
    porcentajeDistancia: Number(pct.toFixed(2)),
    resumen: `Stop ${dir}: ${sl.toFixed(2)} (${pct.toFixed(2)}% de distancia, ${mul}×ATR).`,
  };
}