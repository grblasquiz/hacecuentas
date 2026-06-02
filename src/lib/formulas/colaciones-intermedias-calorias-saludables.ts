export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; }
export function colacionesIntermediasCaloriasSaludables(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`;

  const rR = r.toFixed(1);
  const insight = __lang === 'en'
    ? { title: 'Your result', text: `Combining **${v1}** and **${v2}** gives **${rR}**. A mid-morning or afternoon snack of around **150–250 kcal** keeps energy steady between meals.`, tone: 'neutral', icon: '🍎' }
    : { title: 'Tu resultado', text: `Combinando **${v1}** y **${v2}** te da **${rR}**. Una colación de media mañana o media tarde de unas **150–250 kcal** ayuda a mantener la energía estable entre comidas.`, tone: 'neutral', icon: '🍎' };

  return { resultado:r.toFixed(1), resumen, _insight: insight };
}
