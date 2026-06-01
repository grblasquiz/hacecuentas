export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function magnesioDosisDeficienciaSintomas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      rdaUnit: 'mg/día',
      mejorForma: 'Glicinato o citrato (mejor absorción que óxido)',
      fuentes: 'Chocolate 70%+, almendras, semillas calabaza, espinacas, palta, legumbres.',
    },
    en: {
      rdaUnit: 'mg/day',
      mejorForma: 'Glycinate or citrate (better absorption than oxide)',
      fuentes: 'Dark chocolate 70%+, almonds, pumpkin seeds, spinach, avocado, legumes.',
    },
  } as const)[__lang];
  const e=Number(i.edad)||0; const sx=String(i.sexo||'mujer');
  let rda=sx==='hombre'?(e>30?420:400):(e>30?320:310);
  return { rda:`${rda} ${T.rdaUnit}`, mejorForma:T.mejorForma, fuentes:T.fuentes };
}
