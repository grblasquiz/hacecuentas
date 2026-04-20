export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ketoMacrosCetogenicaDeficitCompleto(i: Inputs): Outputs {
  const c=Number(i.calorias)||0; const o=String(i.objetivo||'mantener');
  const mult={'adelgazar':0.8,'mantener':1,'ganar':1.15}[o];
  const cal=c*mult;
  const grasa=cal*0.72/9;
  const prot=cal*0.23/4;
  const carb=cal*0.05/4;
  return { grasaG:`${Math.round(grasa)} g`, proteinaG:`${Math.round(prot)} g`, carbosG:`${Math.round(carb)} g` };
}
