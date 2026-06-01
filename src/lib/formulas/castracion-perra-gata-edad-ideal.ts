export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function castracionPerraGataEdadIdeal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`;
  const insight = __lang === 'en'
    ? { title: 'Result', text: `With your inputs, the result is **${r.toFixed(2)}** (${v1} × ${v2} ÷ 10). The ideal age to spay a female dog or cat depends on breed size and first heat — confirm timing with your vet.`, tone: 'neutral', icon: '🐾' }
    : { title: 'Resultado', text: `Con tus datos, el resultado es **${r.toFixed(2)}** (${v1} × ${v2} ÷ 10). La edad ideal para castrar una perra o gata depende del tamaño de la raza y del primer celo — confirmá el momento con tu veterinario.`, tone: 'neutral', icon: '🐾' };
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
