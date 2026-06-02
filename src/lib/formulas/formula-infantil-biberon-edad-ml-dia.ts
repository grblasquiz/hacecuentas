export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function formulaInfantilBiberonEdadMlDia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const m=Number(i.edadMeses)||0; const p=Number(i.pesoKg)||0;
  const total=p*150;
  const tomas=m<1?8:m<3?7:m<6?6:5;
  const porToma=total/tomas;
  const totalR=Math.round(total), porTomaR=Math.round(porToma);
  const T = ({
    es: {
      feedingsPerDay: 'tomas/día', mlPerFeeding: 'mL por toma',
      insTitle: 'Tu plan diario de biberones',
      insText: `Un bebé de **${p} kg** necesita unos **${totalR} mL/día**, repartidos en **${tomas} tomas** de **${porTomaR} mL** cada una. Usalo como guía: el bebé regula solo y la pediatra ajusta según peso y desarrollo.`,
    },
    en: {
      feedingsPerDay: 'feedings/day', mlPerFeeding: 'mL per feeding',
      insTitle: 'Your daily bottle plan',
      insText: `A **${p} kg** baby needs about **${totalR} mL/day**, split into **${tomas} feedings** of **${porTomaR} mL** each. Use it as a guide: the baby self-regulates and the pediatrician adjusts for weight and development.`,
    },
    pt: {
      feedingsPerDay: 'mamadas/dia', mlPerFeeding: 'mL por mamada',
      insTitle: 'Seu plano diário de mamadeiras',
      insText: `Um bebê de **${p} kg** precisa de cerca de **${totalR} mL/dia**, divididos em **${tomas} mamadas** de **${porTomaR} mL** cada. Use como guia: o bebê se autorregula e o pediatra ajusta conforme peso e desenvolvimento.`,
    },
  } as const)[__lang];
  return {
    mlDia:`${totalR} mL`, tomas:`${tomas} ${T.feedingsPerDay}`, mlPorToma:`${porTomaR} ${T.mlPerFeeding}`,
    _insight: {
      title: T.insTitle,
      text: T.insText,
      tone: 'neutral',
      icon: '🍼',
    },
  };
}
