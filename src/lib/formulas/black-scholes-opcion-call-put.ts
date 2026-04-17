/** Calculadora Black-Scholes (precio de opción Call/Put) */
export interface Inputs { precioSubyacente: number; strike: number; diasVencimiento: number; tasaRiesgo: number; volatilidad: number; }
export interface Outputs { precioCall: number; precioPut: number; valorIntrinsecoCall: number; valorTemporalCall: number; d1: number; d2: number; }
function ncdf(x: number): number {
  const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
  const sign = x < 0 ? -1 : 1; x = Math.abs(x)/Math.sqrt(2);
  const t = 1/(1+p*x);
  const y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
  return 0.5*(1+sign*y);
}
export function blackScholesOpcionCallPut(i: Inputs): Outputs {
  const S = Number(i.precioSubyacente); const K = Number(i.strike);
  const D = Number(i.diasVencimiento); const r = Number(i.tasaRiesgo)/100;
  const sigma = Number(i.volatilidad)/100;
  if (!S || S <= 0) throw new Error('Ingresá subyacente');
  if (!K || K <= 0) throw new Error('Ingresá strike');
  if (!D || D <= 0) throw new Error('Ingresá días');
  if (sigma <= 0) throw new Error('Ingresá volatilidad');
  const T = D/365;
  const d1 = (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma*Math.sqrt(T));
  const d2 = d1 - sigma*Math.sqrt(T);
  const call = S*ncdf(d1) - K*Math.exp(-r*T)*ncdf(d2);
  const put = K*Math.exp(-r*T)*ncdf(-d2) - S*ncdf(-d1);
  const intrinseco = Math.max(0, S - K);
  return {
    precioCall: Number(call.toFixed(4)),
    precioPut: Number(put.toFixed(4)),
    valorIntrinsecoCall: Number(intrinseco.toFixed(4)),
    valorTemporalCall: Number((call - intrinseco).toFixed(4)),
    d1: Number(d1.toFixed(4)),
    d2: Number(d2.toFixed(4)),
  };
}