export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cafeMolidoTazaMetodoPreparacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : __lang === 'pt' ? 'Seu resultado' : 'Tu resultado',
    text: __lang === 'en'
      ? `The result is **${r.toFixed(2)}**, from ${v1} × ${v2}.`
      : __lang === 'pt'
      ? `O resultado é **${r.toFixed(2)}**, a partir de ${v1} × ${v2}.`
      : `El resultado es **${r.toFixed(2)}**, a partir de ${v1} × ${v2}.`,
    tone: 'neutral',
    icon: '☕',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
