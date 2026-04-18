export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function velocidadLecturaIdiomaPalabrasMinuto(i: Inputs): Outputs {
  const n=String(i.nivel||'c1');
  const w:Record<string,number>={nativo:250,c2:200,c1:150,b2:100,b1:80,a2:40};
  const v=w[n]||100;
  const pct=(v/250*100).toFixed(0);
  return { wpm:`${v} WPM`, vsNativo:`${pct}%`, resumen:`Nivel ${n}: ~${v} WPM (${pct}% velocidad nativa).` };
}
