export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function comidaGatoGramosPesoIdealRacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const rTxt = r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${rTxt}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${rTxt}.`;
  return {
    resultado: rTxt,
    resumen,
    _insight: {
      title: __lang === 'en' ? 'What this result means' : 'Qué significa este resultado',
      text: __lang === 'en'
        ? `The result of this ration is **${rTxt}**. Weigh the portion with a kitchen scale instead of eyeballing it, and adjust ±10% based on your cat's body condition.`
        : `El resultado de esta ración es **${rTxt}**. Pesá la porción con balanza de cocina en vez de calcularla a ojo, y ajustá ±10% según la condición corporal de tu gato.`,
      tone: 'neutral',
      icon: '🐱',
    },
  };
}
