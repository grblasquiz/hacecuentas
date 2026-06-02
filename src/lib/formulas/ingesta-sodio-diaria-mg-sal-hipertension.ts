export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ingestaSodioDiariaMgSalHipertension(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Combining **${v1}** and **${v2}** gives **${r.toFixed(2)}**. As a reference, the WHO suggests staying under **2000 mg** of sodium (~5 g of salt) per day.`
      : `Combinando **${v1}** y **${v2}** da **${r.toFixed(2)}**. Como referencia, la OMS sugiere no pasar de **2000 mg** de sodio (~5 g de sal) por día.`,
    tone: 'neutral',
    icon: '🧂'
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
