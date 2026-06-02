export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function conejoComidaHenoPesoEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`;
  const ins = {
    en: { title: 'Your result', text: `The estimated amount of hay is **${r.toFixed(2)} kg** per month for your rabbit.`, icon: '🐰' },
    pt: { title: 'Seu resultado', text: `A quantidade estimada de feno é de **${r.toFixed(2)} kg** por mês para o seu coelho.`, icon: '🐰' },
    es: { title: 'Tu resultado', text: `La cantidad estimada de heno es de **${r.toFixed(2)} kg** al mes para tu conejo.`, icon: '🐰' },
  }[__lang];
  const _insight = { ...ins, tone: 'neutral' };
  return { resultado:r.toFixed(2), resumen, _insight } as Outputs;
}
