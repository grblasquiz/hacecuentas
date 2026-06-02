export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function masaPizzaCaseraGramosInvitados(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const insight = __lang === 'en'
    ? { title: 'Result', text: `Multiplying **${v1} × ${v2}** gives **${r.toFixed(2)}**.`, tone: 'neutral', icon: '🍕' }
    : { title: 'Resultado', text: `Multiplicar **${v1} × ${v2}** da **${r.toFixed(2)}**.`, tone: 'neutral', icon: '🍕' };
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
