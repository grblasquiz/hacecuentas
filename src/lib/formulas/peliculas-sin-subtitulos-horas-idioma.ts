export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function peliculasSinSubtitulosHorasIdioma(i: Inputs): Outputs {
  const n=String(i.nivel||'b1');
  const h:Record<string,number>={a2:500,b1:250,b2:100,c1:50};
  const hr=h[n]||250;
  return { horas:`~${hr}h`, metodo:'Reemplazar subs gradualmente', resumen:`${n.toUpperCase()}: ~${hr}h listening para lograr sin subs.` };
}
