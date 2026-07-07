export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function repasoSrsDiasProximoCard(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const int_act=Number(i.intervalo)||1; const ef=Number(i.eFactor)||2.5;
  const nuevo=Math.round(int_act*ef);
  const ganados = nuevo - int_act;
  const T = ({
    es: {
      dias: 'días', nuevoInter: `${nuevo}d`, resumen: `Int ${int_act}d × EF ${ef} = próximo en ${nuevo} días.`,
      insTitle: 'El intervalo se estira',
      insText: `Si acertás la tarjeta, el próximo repaso salta de ${int_act} a **${nuevo} días** (**+${ganados} días**). El ease factor de **${ef}** es el multiplicador: cuanto mejor la recordás, más se espacia.`,
    },
    en: {
      dias: 'days', nuevoInter: `${nuevo}d`, resumen: `Int ${int_act}d × EF ${ef} = next in ${nuevo} days.`,
      insTitle: 'The interval stretches out',
      insText: `If you recall the card, the next review jumps from ${int_act} to **${nuevo} days** (**+${ganados} days**). The ease factor of **${ef}** is the multiplier: the better you know it, the wider the gap.`,
    },
  } as const)[__lang];
  return {
    proximo:`${nuevo} ${T.dias}`, nuevoInter:T.nuevoInter, resumen:T.resumen,
    _insight: { title: T.insTitle, text: T.insText, tone: 'neutral' as const, icon: '🗂️' },
  };
}
