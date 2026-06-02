export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function comidaPerroGramosAdultoSeniorPesos(i: Inputs): Outputs {
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
        ? `The result of this ration is **${rTxt}**. Weigh the portion with a kitchen scale rather than eyeballing it, and adjust ±10% based on your dog's body condition — senior dogs usually need less.`
        : `El resultado de esta ración es **${rTxt}**. Pesá la porción con balanza en vez de calcularla a ojo, y ajustá ±10% según la condición corporal de tu perro: los seniors suelen necesitar menos.`,
      tone: 'neutral',
      icon: '🐶',
    },
  };
}
