/** Calculadora de Volatilidad Implícita (IV) en Opciones */
export interface Inputs { precioOpcion: number; precioSubyacente: number; strike: number; diasVencimiento: number; tasaRiesgo: number; tipo: 'call' | 'put'; }
export interface Outputs { ivAnualPorcentaje: number; ivDiaria: number; movimientoEsperado1Sigma: number; categoria: string; _insight?: any; _chart?: any; }
function ncdf(x: number): number {
  const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
  const sign = x < 0 ? -1 : 1; x = Math.abs(x)/Math.sqrt(2);
  const t = 1/(1+p*x);
  const y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
  return 0.5*(1+sign*y);
}
function npdf(x: number): number { return Math.exp(-x*x/2)/Math.sqrt(2*Math.PI); }
function bsPrice(S: number, K: number, T: number, r: number, sigma: number, isCall: boolean): number {
  const d1 = (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma*Math.sqrt(T));
  const d2 = d1 - sigma*Math.sqrt(T);
  return isCall ? S*ncdf(d1) - K*Math.exp(-r*T)*ncdf(d2) : K*Math.exp(-r*T)*ncdf(-d2) - S*ncdf(-d1);
}
function vega(S: number, K: number, T: number, r: number, sigma: number): number {
  const d1 = (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma*Math.sqrt(T));
  return S * npdf(d1) * Math.sqrt(T);
}
export function volatilidadImplicitaOpciones(i: Inputs): Outputs {
  const P = Number(i.precioOpcion); const S = Number(i.precioSubyacente);
  const K = Number(i.strike); const D = Number(i.diasVencimiento);
  const r = Number(i.tasaRiesgo)/100; const isCall = i.tipo === 'call';
  if (!P || P <= 0) throw new Error('Ingresá precio de opción');
  if (!S || S <= 0) throw new Error('Ingresá subyacente');
  if (!K || K <= 0) throw new Error('Ingresá strike');
  if (!D || D <= 0) throw new Error('Ingresá días al vencimiento');
  const T = D / 365;
  let sigma = 0.3;
  for (let j = 0; j < 100; j++) {
    const priceEst = bsPrice(S, K, T, r, sigma, isCall);
    const v = vega(S, K, T, r, sigma);
    if (v < 1e-10) break;
    const diff = priceEst - P;
    if (Math.abs(diff) < 1e-6) break;
    sigma = sigma - diff / v;
    if (sigma < 0.001) sigma = 0.001;
    if (sigma > 5) sigma = 5;
  }
  const ivAnual = sigma * 100;
  const ivDiaria = ivAnual / Math.sqrt(252);
  const mov1sigma = S * (ivDiaria/100) * Math.sqrt(D);
  let cat = '';
  if (ivAnual < 15) cat = 'Muy baja';
  else if (ivAnual < 30) cat = 'Media (típica equity)';
  else if (ivAnual < 60) cat = 'Alta';
  else if (ivAnual < 100) cat = 'Muy alta';
  else cat = 'Extrema';
  const ivR = Number(ivAnual.toFixed(2));
  const movR = Number(mov1sigma.toFixed(2));
  const _insight = {
    title: 'Lo que dice la IV',
    text: `La volatilidad implícita es **${ivR}%** anual (${cat.toLowerCase()}). El mercado descuenta un movimiento de ±**${movR}** en el subyacente de acá al vencimiento (1σ, ~68% de probabilidad).`,
    tone: ivAnual >= 60 ? 'warn' : (ivAnual < 30 ? 'good' : 'neutral'),
    icon: '📈',
  };
  const _chart = {
    type: 'scale',
    marker: ivR,
    markerLabel: `${ivR}%`,
    min: 0,
    segments: [
      { nombre: 'Muy baja', max: 15, color: '#86efac', colorDark: '#166534' },
      { nombre: 'Media', max: 30, color: '#6ee7b7', colorDark: '#065f46' },
      { nombre: 'Alta', max: 60, color: '#fcd34d', colorDark: '#78350f' },
      { nombre: 'Muy alta', max: 100, color: '#fb923c', colorDark: '#7c2d12' },
      { nombre: 'Extrema', max: Math.max(150, ivR + 20), color: '#f87171', colorDark: '#7f1d1d' },
    ],
    ariaLabel: 'Escala de volatilidad implícita anual, de muy baja a extrema',
  };
  return {
    ivAnualPorcentaje: ivR,
    ivDiaria: Number(ivDiaria.toFixed(3)),
    movimientoEsperado1Sigma: movR,
    categoria: cat,
    _insight,
    _chart,
  };
}