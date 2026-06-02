export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionTemperaturasHornoGasElectrico(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const rf = r.toFixed(2);
  const insight = __lang === 'en'
    ? { title: 'Result', text: `The conversion gives **${rf}**. Use it as the equivalent oven setting for your recipe.`, tone: 'neutral', icon: '🔥' }
    : __lang === 'pt'
    ? { title: 'Resultado', text: `A conversão dá **${rf}**. Use como a temperatura equivalente do forno para sua receita.`, tone: 'neutral', icon: '🔥' }
    : { title: 'Resultado', text: `La conversión da **${rf}**. Usalo como la temperatura equivalente del horno para tu receta.`, tone: 'neutral', icon: '🔥' };
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
