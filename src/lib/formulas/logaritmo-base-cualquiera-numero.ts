export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function logaritmoBaseCualquieraNumero(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      dominioInvalido: 'Dominio inválido: x>0 y b>0, b≠1.',
    },
    en: {
      dominioInvalido: 'Invalid domain: x>0 and b>0, b≠1.',
    },
  } as const)[__lang];
  const x=Number(i.x)||0; const b=Number(i.b)||10;
  if (x<=0||b<=0||b===1) return { log:'—', resumen: T.dominioInvalido };
  const l=Math.log(x)/Math.log(b);
  const resumen = __lang === 'en'
    ? `log base ${b} of ${x} = ${l.toFixed(3)}.`
    : `log base ${b} de ${x} = ${l.toFixed(3)}.`;
  return { log:l.toFixed(4), resumen };
}
