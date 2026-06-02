export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function leverageTradingLiquidacionPrecio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.precioEntrada)||0; const a=Number(i.apalancamiento)||1; const t=String(i.tipoPosicion||'long');
  const mov=1/a*100;
  const pl=t==='long'?p*(1-1/a):p*(1+1/a);
  const movDir = __lang === 'en'
    ? (t==='long' ? 'drop' : 'rise')
    : (t==='long' ? 'caída' : 'suba');
  const priceDir = __lang === 'en'
    ? (t==='long' ? 'drops' : 'rises')
    : (t==='long' ? 'cae' : 'sube');
  const interpretacion = __lang === 'en'
    ? `With ${a}x ${t}: if price ${priceDir} ${mov.toFixed(1)}%, you get liquidated at ${Math.round(pl).toLocaleString('en-US')}.`
    : `Con ${a}x ${t}: si precio ${priceDir} ${mov.toFixed(1)}%, te liquidan a ${Math.round(pl).toLocaleString('en-US')}.`;

  const movTxt = mov.toFixed(1);
  // Cuanto menor el % de movimiento que liquida, mayor el riesgo. <2% extremo, <5% alto, <10% medio, ≥10% moderado.
  const tone: 'good'|'warn'|'neutral' = mov < 5 ? 'warn' : mov < 15 ? 'neutral' : 'good';
  const insightText = __lang === 'en'
    ? `A ${a}x position liquidates with just a **${movTxt}% ${movDir}**, at **${Math.round(pl).toLocaleString('en-US')}**. The higher the leverage, the closer the liquidation price sits to your entry.`
    : `Una posición ${a}x se liquida con apenas una **${movTxt}% de ${movDir}**, en **${Math.round(pl).toLocaleString('en-US')}**. Cuanto más alto el apalancamiento, más cerca de tu entrada queda el precio de liquidación.`;
  const _insight = {
    title: __lang === 'en' ? 'Liquidation risk' : 'Riesgo de liquidación',
    text: insightText,
    tone,
    icon: '⚠️',
  };

  // Gauge: % de movimiento adverso que te liquida. Menos % = más riesgo.
  const lbl = (es: string, en: string) => (__lang === 'en' ? en : es);
  const _chart = {
    type: 'scale',
    marker: Number(movTxt),
    markerLabel: `${movTxt}%`,
    min: 0,
    segments: [
      { nombre: lbl('Extremo', 'Extreme'), max: 2, color: '#dc2626', colorDark: '#f87171' },
      { nombre: lbl('Alto', 'High'), max: 5, color: '#f97316', colorDark: '#fb923c' },
      { nombre: lbl('Medio', 'Medium'), max: 15, color: '#eab308', colorDark: '#facc15' },
      { nombre: lbl('Moderado', 'Moderate'), max: Math.max(50, Math.ceil(mov) + 5), color: '#16a34a', colorDark: '#4ade80' },
    ],
    ariaLabel: lbl(
      `Margen de movimiento antes de liquidar: ${movTxt}% sobre una escala de riesgo`,
      `Price move before liquidation: ${movTxt}% on a risk scale`,
    ),
  };

  return { precioLiquidacion:`USD ${Math.round(pl).toLocaleString('en-US')}`, porcentajeDisminucion:`${mov.toFixed(1)}% ${movDir}`, interpretacion, _insight, _chart };
}
