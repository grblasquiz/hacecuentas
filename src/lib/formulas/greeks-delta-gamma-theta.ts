/** Calculadora de Greeks (Delta, Gamma, Theta, Vega, Rho) */
export interface Inputs { precioSubyacente: number; strike: number; diasVencimiento: number; tasaRiesgo: number; volatilidad: number; tipo: 'call' | 'put'; }
export interface Outputs { delta: number; gamma: number; theta: number; vega: number; rho: number; }
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
  return {
    delta: Number(delta.toFixed(4)),
    gamma: Number(gamma.toFixed(4)),
    theta: Number(theta.toFixed(4)),
    vega: Number(vega.toFixed(4)),
    rho: Number(rho.toFixed(4)),
  };
}