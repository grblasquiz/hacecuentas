export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function consumoAireAcondicionadoAutoExtra(i: Inputs): Outputs {
  const r=Number(i.rend)||12; const h=Number(i.horas)||1; const p=Number(i.precio)||1;
  const lHora=0.3;
  const dia=lHora*h; const mes=dia*30*p;
  return { extra:`${dia.toFixed(2)} L/día`, costoMes:`$${mes.toFixed(2)}`, resumen:`A/A ${h}h/día: ~$${mes.toFixed(0)}/mes extra combustible.` };
}
