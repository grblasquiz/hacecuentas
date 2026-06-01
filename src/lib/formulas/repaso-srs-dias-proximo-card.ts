export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function repasoSrsDiasProximoCard(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const int_act=Number(i.intervalo)||1; const ef=Number(i.eFactor)||2.5;
  const nuevo=Math.round(int_act*ef);
  const T = ({
    es: { dias: 'días', nuevoInter: `${nuevo}d`, resumen: `Int ${int_act}d × EF ${ef} = próximo en ${nuevo} días.` },
    en: { dias: 'days', nuevoInter: `${nuevo}d`, resumen: `Int ${int_act}d × EF ${ef} = next in ${nuevo} days.` },
  } as const)[__lang];
  return { proximo:`${nuevo} ${T.dias}`, nuevoInter:T.nuevoInter, resumen:T.resumen };
}
