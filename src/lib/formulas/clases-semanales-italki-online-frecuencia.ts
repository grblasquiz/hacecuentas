export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function clasesSemanalesItalkiOnlineFrecuencia(i: Inputs): Outputs {
  const m=String(i.meta||'manten');
  const p:Record<string,[string,string]>={manten:['1','60 min'],mejora:['2-3','60 min'],intensivo:['5-7','60 min']};
  const [cl,du]=p[m]||p.manten;
  return { clases:cl, duracion:du, resumen:`Meta ${m}: ${cl} clases/sem × ${du}.` };
}
