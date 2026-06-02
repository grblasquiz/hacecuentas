export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cafeinaDiariaTazasCafeTopeSeguro(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `The result is **${r.toFixed(2)}**, from ${v1} and ${v2}.`
      : `El resultado es **${r.toFixed(2)}**, a partir de ${v1} y ${v2}.`,
    tone: 'neutral',
    icon: '☕',
  };
  return { resultado:r.toFixed(2), resumen: __lang === 'en' ? `Calculation with ${v1} and ${v2}: ${r.toFixed(2)}.` : `Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.`, _insight };
}
