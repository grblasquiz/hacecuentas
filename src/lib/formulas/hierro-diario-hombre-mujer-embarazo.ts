export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function hierroDiarioHombreMujerEmbarazo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const rStr=r.toFixed(2);
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `With **${v1}** and **${v2}** the result is **${rStr}**. Adjust the input values to see how the figure changes.`
      : `Con **${v1}** y **${v2}** el resultado es **${rStr}**. Ajustá los valores de entrada para ver cómo cambia la cifra.`,
    tone: 'neutral' as const,
    icon: '🧮',
  };
  return { resultado:rStr, resumen: __lang === 'en' ? `Calculation with ${v1} and ${v2}: ${rStr}.` : `Cálculo con ${v1} y ${v2}: ${rStr}.`, _insight };
}
