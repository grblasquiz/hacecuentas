export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function tasaPoliticaMonetariaTpmRendimiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const c=Number(i.capital)||0; const t=Number(i.tpmPorcentaje)||0; const d=Number(i.dias)||0;
  const r=c*t/100*d/365; const tea=((1+t/100*d/365)**(365/d)-1)*100;
  const interpretacion = __lang === 'en'
    ? `At TPM ${t}% for ${d} days: you earn $${Math.round(r).toLocaleString('es-AR')} (EAR ${tea.toFixed(0)}%).`
    : `A TPM ${t}% durante ${d} días: ganás $${Math.round(r).toLocaleString('es-AR')} (TEA ${tea.toFixed(0)}%).`;
  return { rendimiento:`$${Math.round(r).toLocaleString('es-AR')}`, tea:`${tea.toFixed(2)}%`, interpretacion };
}
