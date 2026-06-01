export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function consumoAireAcondicionadoAutoExtra(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const r=Number(i.rend)||12; const h=Number(i.horas)||1; const p=Number(i.precio)||1;
  const lHora=0.3;
  const dia=lHora*h; const mes=dia*30*p;
  const extra = __lang === 'en' ? `${dia.toFixed(2)} L/day` : `${dia.toFixed(2)} L/día`;
  const resumen = __lang === 'en' ? `A/C ${h}h/day: ~$${mes.toFixed(0)}/month extra fuel.` : `A/A ${h}h/día: ~$${mes.toFixed(0)}/mes extra combustible.`;
  return { extra, costoMes:`$${mes.toFixed(2)}`, resumen };
}
