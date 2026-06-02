export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
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
  const I = ({
    es: {
      title: 'Tu objetivo diario',
      txt: (rda: number) => `Tu RDA es **${rda} mg/día** de magnesio. Si suplementás, no superes los **350 mg/día** de magnesio elemental (límite NIH) para evitar el efecto laxante; el aporte de los alimentos no cuenta para ese tope.`,
    },
    en: {
      title: 'Your daily target',
      txt: (rda: number) => `Your RDA is **${rda} mg/day** of magnesium. If you supplement, stay under **350 mg/day** of elemental magnesium (NIH limit) to avoid the laxative effect; magnesium from food does not count toward that cap.`,
    },
  } as const)[__lang];
  const e=Number(i.edad)||0; const sx=String(i.sexo||'mujer');
  let rda=sx==='hombre'?(e>30?420:400):(e>30?320:310);
  return { rda:`${rda} ${T.rdaUnit}`, mejorForma:T.mejorForma, fuentes:T.fuentes, _insight:{ title:I.title, text:I.txt(rda), tone:'neutral', icon:'💊' } };
}
