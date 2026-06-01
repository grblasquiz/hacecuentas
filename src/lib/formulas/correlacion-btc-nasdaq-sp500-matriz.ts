export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function correlacionBtcNasdaqSp500Matriz(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      alta: 'Alta correlación: BTC se mueve con tech',
      media: 'Correlación media',
      baja: 'Baja correlación, diversifica bien',
    },
    en: {
      alta: 'High correlation: BTC moves with tech',
      media: 'Medium correlation',
      baja: 'Low correlation, diversifies well',
    },
  } as const)[__lang];
  const m=Number(i.periodoMeses)||12;
  const cNas=m<=6?0.75:m<=12?0.65:m<=24?0.55:0.45;
  const cSp=cNas*0.85;
  const interp=cNas>0.6?T.alta:cNas>0.3?T.media:T.baja;
  return { correlacionNasdaq:cNas.toFixed(2), correlacionSp500:cSp.toFixed(2), interpretacion:interp };
}
