export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function porcionesPastaSecaPersonaHambre(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Dry pasta to cook' : 'Pasta seca a cocinar',
    text: __lang === 'en'
      ? `**${v1} × ${v2}** gives **${r.toFixed(2)}** of dry pasta for your serving.`
      : `**${v1} × ${v2}** da **${r.toFixed(2)}** de pasta seca para tu porción.`,
    tone: 'neutral',
    icon: '🍝',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
