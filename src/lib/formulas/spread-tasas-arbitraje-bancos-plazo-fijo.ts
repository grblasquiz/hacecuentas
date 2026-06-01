export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
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
  return { spreadAnual:`${spread.toFixed(1)}%`, diferencia30Dias:`+$${Math.round(diff).toLocaleString(locale)}`, interpretacion };
}
