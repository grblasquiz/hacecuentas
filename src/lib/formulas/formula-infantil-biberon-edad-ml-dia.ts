export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function formulaInfantilBiberonEdadMlDia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { feedingsPerDay: 'tomas/día', mlPerFeeding: 'mL por toma' },
    en: { feedingsPerDay: 'feedings/day', mlPerFeeding: 'mL per feeding' },
  } as const)[__lang];
  const m=Number(i.edadMeses)||0; const p=Number(i.pesoKg)||0;
  const total=p*150;
  const tomas=m<1?8:m<3?7:m<6?6:5;
  const porToma=total/tomas;
  return { mlDia:`${Math.round(total)} mL`, tomas:`${tomas} ${T.feedingsPerDay}`, mlPorToma:`${Math.round(porToma)} ${T.mlPerFeeding}` };
}
