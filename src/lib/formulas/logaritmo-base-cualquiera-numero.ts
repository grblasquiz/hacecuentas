export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function logaritmoBaseCualquieraNumero(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      dominioInvalido: 'Dominio inválido: x>0 y b>0, b≠1.',
      insightTitle: 'Qué significa este logaritmo',
    },
    en: {
      dominioInvalido: 'Invalid domain: x>0 and b>0, b≠1.',
      insightTitle: 'What this logarithm means',
    },
  } as const)[__lang];
  const x=Number(i.x)||0; const b=Number(i.b)||10;
  if (x<=0||b<=0||b===1) return { log:'—', resumen: T.dominioInvalido };
  const l=Math.log(x)/Math.log(b);
  const resumen = __lang === 'en'
    ? `log base ${b} of ${x} = ${l.toFixed(3)}.`
    : `log base ${b} de ${x} = ${l.toFixed(3)}.`;
  const _insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `**${b}** raised to the power **${l.toFixed(4)}** equals **${x}**. In other words, you need to multiply **${b}** by itself **${l.toFixed(2)}** times to reach **${x}**.`
      : `**${b}** elevado a la potencia **${l.toFixed(4)}** da **${x}**. Dicho de otro modo, hay que multiplicar **${b}** por sí mismo **${l.toFixed(2)}** veces para llegar a **${x}**.`,
    tone: 'neutral',
    icon: '🔢',
  };
  return { log:l.toFixed(4), resumen, _insight };
}
