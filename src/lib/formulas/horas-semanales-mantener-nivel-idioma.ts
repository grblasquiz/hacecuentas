export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function horasSemanalesMantenerNivelIdioma(i: Inputs): Outputs {
  const n=String(i.nivel||'b1');
  const h:Record<string,number>={a2:1,b1:2,b2:3,c1:4,c2:5};
  const hr=h[n]||2;
  return { horasSem:`${hr}h`, consejos:'Mix: media + conversación + lectura', resumen:`Mantener ${n.toUpperCase()}: ~${hr}h/sem.` };
}
