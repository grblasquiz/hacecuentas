export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: any; }
export function kilosChocolateCaseroBombonesReceta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const insight = {
    en: { title: 'Result', text: `**${v1} × ${v2}** comes to **${r.toFixed(2)}**.`, tone: 'neutral', icon: '🍫' },
    pt: { title: 'Resultado', text: `**${v1} × ${v2}** dá **${r.toFixed(2)}**.`, tone: 'neutral', icon: '🍫' },
    es: { title: 'Resultado', text: `**${v1} × ${v2}** da **${r.toFixed(2)}**.`, tone: 'neutral', icon: '🍫' },
  }[__lang];
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
