/** Calculadora de Greeks (Delta, Gamma, Theta, Vega, Rho) */
export interface Inputs { precioSubyacente: number; strike: number; diasVencimiento: number; tasaRiesgo: number; volatilidad: number; tipo: 'call' | 'put'; }
export interface Outputs { delta: number; gamma: number; theta: number; vega: number; rho: number; _insight?: any; _chart?: any; }
function ncdf(x: number): number {
  const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
  const sign = x < 0 ? -1 : 1; x = Math.abs(x)/Math.sqrt(2);
  const t = 1/(1+p*x);
  return 0.5*(1+sign*(1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x)));
}
function npdf(x: number): number { return Math.exp(-x*x/2)/Math.sqrt(2*Math.PI); }
export function greeksDeltaGammaTheta(i: Inputs): Outputs {
  const S = Number(i.precioSubyacente); const K = Number(i.strike);
  const D = Number(i.diasVencimiento); const r = Number(i.tasaRiesgo)/100;
  const sigma = Number(i.volatilidad)/100; const isCall = i.tipo === 'call';
  if (!S || S <= 0) throw new Error('Ingresá subyacente');
  if (!K || K <= 0) throw new Error('Ingresá strike');
  if (!D || D <= 0) throw new Error('Ingresá días');
  if (sigma <= 0) throw new Error('Ingresá volatilidad');
  const T = D/365;
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma*sqrtT);
  const d2 = d1 - sigma*sqrtT;
  const Nd1 = ncdf(d1); const Nd2 = ncdf(d2);
  const nd1 = npdf(d1);
  const delta = isCall ? Nd1 : Nd1 - 1;
  const gamma = nd1 / (S * sigma * sqrtT);
  const thetaAnual = isCall
    ? -(S*nd1*sigma)/(2*sqrtT) - r*K*Math.exp(-r*T)*Nd2
    : -(S*nd1*sigma)/(2*sqrtT) + r*K*Math.exp(-r*T)*ncdf(-d2);
  const theta = thetaAnual / 365;
  const vega = S * nd1 * sqrtT / 100;
  const rho = isCall
    ? K * T * Math.exp(-r*T) * Nd2 / 100
    : -K * T * Math.exp(-r*T) * ncdf(-d2) / 100;
  // Insight: dirección (delta) + decaimiento diario (theta)
  const deltaR = Number(delta.toFixed(4));
  const thetaR = Number(theta.toFixed(4));
  const absDelta = Math.abs(deltaR);
  const moneyness = absDelta >= 0.65 ? 'in the money (ITM)' : absDelta <= 0.35 ? 'out of the money (OTM)' : 'at the money (ATM)';
  const _insight = {
    title: isCall ? 'Tu call: dirección y decaimiento' : 'Tu put: dirección y decaimiento',
    text: `Delta **${deltaR}** significa que la opción gana/pierde ~${(absDelta).toFixed(2)} por cada $1 que mueve el subyacente (está **${moneyness}**). Theta **${thetaR}** te dice que pierde **$${Math.abs(thetaR).toFixed(2)} por día** sólo por el paso del tiempo.`,
    tone: thetaR < 0 ? 'warn' : 'neutral',
    icon: '📉',
  };

  // Gauge: delta de -1 (put profundo) a +1 (call profundo)
  const _chart = {
    type: 'scale' as const,
    marker: deltaR,
    markerLabel: 'Delta ' + deltaR,
    min: -1,
    segments: [
      { nombre: 'Put ITM', max: -0.65, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Put OTM', max: -0.35, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'ATM', max: 0.35, color: '#64748b', colorDark: '#475569' },
      { nombre: 'Call OTM', max: 0.65, color: '#22c55e', colorDark: '#15803d' },
      { nombre: 'Call ITM', max: 1, color: '#16a34a', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala de delta de -1 a 1: zonas put/ATM/call según el grado de moneyness de la opción',
  };

  return {
    delta: deltaR,
    gamma: Number(gamma.toFixed(4)),
    theta: thetaR,
    vega: Number(vega.toFixed(4)),
    rho: Number(rho.toFixed(4)),
    _insight,
    _chart,
  };
}