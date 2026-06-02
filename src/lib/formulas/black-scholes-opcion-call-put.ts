/** Calculadora Black-Scholes (precio de opción Call/Put) */
export interface Inputs { precioSubyacente: number; strike: number; diasVencimiento: number; tasaRiesgo: number; volatilidad: number; }
export interface Outputs { precioCall: number; precioPut: number; valorIntrinsecoCall: number; valorTemporalCall: number; d1: number; d2: number; _insight?: any; _chart?: any; }
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
  const callR = Number(call.toFixed(4));
  const intrinsecoR = Number(intrinseco.toFixed(4));
  const temporalR = Number((call - intrinseco).toFixed(4));

  // Moneyness del Call respecto al strike.
  const moneyness = (S - K) / K;
  let estado: string;
  if (moneyness > 0.02) estado = `**in the money** (el subyacente $${S} supera al strike $${K})`;
  else if (moneyness < -0.02) estado = `**out of the money** (el subyacente $${S} está por debajo del strike $${K})`;
  else estado = `prácticamente **at the money** (subyacente ≈ strike $${K})`;
  const pctTemporal = callR > 0 ? (temporalR / callR) * 100 : 0;

  const out: Outputs = {
    precioCall: callR,
    precioPut: Number(put.toFixed(4)),
    valorIntrinsecoCall: intrinsecoR,
    valorTemporalCall: temporalR,
    d1: Number(d1.toFixed(4)),
    d2: Number(d2.toFixed(4)),
    _insight: {
      title: 'Composición de la prima Call',
      text: `La Call vale **$${callR}** y está ${estado}. De esa prima, **$${Math.max(0, temporalR).toFixed(2)}** (${pctTemporal.toFixed(0)}%) es valor temporal que se evapora a medida que se acercan los ${D} días al vencimiento.`,
      tone: 'neutral',
      icon: '📈',
    },
  };

  // Donut: la prima Call = valor intrínseco + valor temporal (suman el total).
  if (callR > 0 && intrinsecoR >= 0 && temporalR >= 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Valor intrínseco', value: Number((callR - temporalR).toFixed(4)) },
        { label: 'Valor temporal', value: temporalR },
      ],
      prefix: '$',
      centerValue: `$${callR}`,
      centerLabel: 'Prima Call',
      ariaLabel: `La prima de la Call de $${callR} se descompone en $${intrinsecoR} de valor intrínseco y $${temporalR} de valor temporal.`,
    };
  }

  return out;
}