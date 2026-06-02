export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function spreadTasasArbitrajeBancosPlazoFijo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const a=Number(i.tnaBancoA)||0; const b=Number(i.tnaBancoB)||0; const m=Number(i.monto)||0; const d=Number(i.dias)||30;
  const spread=b-a; const diff=m*spread/100*d/365;
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const interpretacion = spread > 0
    ? (__lang === 'en'
        ? `Bank B yields ${spread.toFixed(1)}pp more. Over ${d} days you earn $${Math.round(diff).toLocaleString('en-US')} more.`
        : `Banco B rinde ${spread.toFixed(1)}pp más. En ${d} días ganás $${Math.round(diff).toLocaleString('es-AR')} más.`)
    : (__lang === 'en' ? 'Bank A is the better option.' : 'Banco A es mejor opción.');
  const diffAbs = Math.abs(Math.round(diff)).toLocaleString(locale);
  const insight = spread > 0
    ? {
        title: __lang === 'en' ? 'Bank B wins' : 'Gana el Banco B',
        text: __lang === 'en'
          ? `A **${spread.toFixed(1)}pp** spread on $${m.toLocaleString('en-US')} over ${d} days puts **$${diffAbs} extra** in your pocket. Worth moving the deposit if there's no fee or paperwork in the way.`
          : `Un spread de **${spread.toFixed(1)}pp** sobre $${m.toLocaleString('es-AR')} a ${d} días te deja **$${diffAbs} de más**. Vale mover el plazo fijo si no hay costo ni trámite que se coma la diferencia.`,
        tone: 'good' as const,
        icon: '🏦',
      }
    : spread < 0
    ? {
        title: __lang === 'en' ? 'Bank A wins' : 'Gana el Banco A',
        text: __lang === 'en'
          ? `Bank A pays **${Math.abs(spread).toFixed(1)}pp** more — staying put earns you **$${diffAbs} extra** over ${d} days versus switching.`
          : `El Banco A paga **${Math.abs(spread).toFixed(1)}pp** más: quedarte donde estás rinde **$${diffAbs} de más** en ${d} días frente a cambiarte.`,
        tone: 'good' as const,
        icon: '🏦',
      }
    : {
        title: __lang === 'en' ? 'Same rate' : 'Misma tasa',
        text: __lang === 'en'
          ? `Both banks pay the same TNA, so there's **no gain** from switching. Decide on liquidity, trust or service instead.`
          : `Ambos bancos pagan la misma TNA, así que **no hay diferencia** en cambiarte. Decidí por liquidez, confianza o servicio.`,
        tone: 'neutral' as const,
        icon: '🏦',
      };
  return { spreadAnual:`${spread.toFixed(1)}%`, diferencia30Dias:`+$${Math.round(diff).toLocaleString(locale)}`, interpretacion, _insight: insight };
}
