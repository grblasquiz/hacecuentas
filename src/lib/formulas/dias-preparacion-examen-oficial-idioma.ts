export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function diasPreparacionExamenOficialIdioma(i: Inputs): Outputs {
  const niv=['a1','a2','b1','b2','c1','c2'];
  const a=niv.indexOf(String(i.actual||'a1')); const m=niv.indexOf(String(i.meta||'b2'));
  if (a<0||m<0||m<=a) return { dias:'—', horas:'—', resumen:'Meta debe ser mayor que actual.' };
  const salto=m-a; const h=salto*200; const d=h/(2*7)*7;
  return { dias:`${Math.round(d)} días`, horas:`${h}h`, resumen:`De ${niv[a].toUpperCase()} a ${niv[m].toUpperCase()}: ~${h}h, ${Math.round(d)} días a 2h/día.` };
}
