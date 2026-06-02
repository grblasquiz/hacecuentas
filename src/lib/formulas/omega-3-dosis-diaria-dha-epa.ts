export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function omega3DosisDiariaDhaEpa(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const resumen = __lang === 'en'
    ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.`
    : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Combining **${v1}** and **${v2}** gives **${r.toFixed(2)}**. Read DHA and EPA separately on the label — that combined amount, not the total fish-oil weight, is what matters. Check any dose with a health professional.`
      : `Combinando **${v1}** y **${v2}** se obtiene **${r.toFixed(2)}**. Fijate en el DHA y el EPA por separado en la etiqueta: lo que importa es esa suma, no el peso total del aceite de pescado. Consultá cualquier dosis con un profesional de la salud.`,
    tone: 'neutral',
    icon: '🐟',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
