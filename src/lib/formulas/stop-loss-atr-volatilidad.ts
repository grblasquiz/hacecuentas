/** Calculadora de Stop Loss por ATR (volatilidad) */
export interface Inputs { precioEntrada: number; atr: number; multiplicador: number; direccion: 'long' | 'short'; }
export interface Outputs { stopLoss: number; distancia: number; porcentajeDistancia: number; resumen: string; _insight?: any; _chart?: any; }
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

  const zona = pct < 2 ? 'ajustado' : pct < 5 ? 'normal' : pct < 10 ? 'amplio' : 'muy amplio';
  const dirTxt = dir === 'long' ? 'long' : 'short';
  const _insight = {
    title: 'Tu stop loss',
    text: `Stop ${dirTxt} en **${sl.toFixed(2)}**, a **${pct.toFixed(2)}% del precio de entrada** (${mul}×ATR). Es un stop ${zona}: ${pct < 2 ? 'cerca del precio, podés quedar barrido por el ruido normal del mercado' : pct < 5 ? 'da aire suficiente para la volatilidad sin arriesgar de más' : 'lejos del precio, ajustá el tamaño de la posición para no sobre-exponer capital'}.`,
    tone: pct < 2 ? 'warn' : pct >= 10 ? 'warn' : 'good',
    icon: '🛑',
  };

  const _chart = {
    type: 'scale',
    marker: Number(pct.toFixed(2)),
    markerLabel: `${pct.toFixed(2)}%`,
    min: 0,
    segments: [
      { nombre: 'Ajustado', max: 2, color: '#f87171', colorDark: '#dc2626' },
      { nombre: 'Normal', max: 5, color: '#4ade80', colorDark: '#16a34a' },
      { nombre: 'Amplio', max: 10, color: '#fbbf24', colorDark: '#d97706' },
      { nombre: 'Muy amplio', max: Math.max(15, Math.ceil(pct) + 1), color: '#f87171', colorDark: '#dc2626' },
    ],
    ariaLabel: `Distancia del stop loss: ${pct.toFixed(2)}% del precio de entrada, zona ${zona}`,
  };

  return {
    stopLoss: Number(sl.toFixed(4)),
    distancia: Number(dist.toFixed(4)),
    porcentajeDistancia: Number(pct.toFixed(2)),
    resumen: `Stop ${dir}: ${sl.toFixed(2)} (${pct.toFixed(2)}% de distancia, ${mul}×ATR).`,
    _insight,
    _chart,
  };
}