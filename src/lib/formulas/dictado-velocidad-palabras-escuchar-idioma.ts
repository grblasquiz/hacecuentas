export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dictadoVelocidadPalabrasEscucharIdioma(i: Inputs): Outputs {
  const n=String(i.nivel||'a1');
  const w:Record<string,number>={a1:60,a2:70,b1:90,b2:120,c1:140,c2:160};
  const v=w[n]||60;
  const rep=v<90?'2-3 reproducciones':'1-2 reproducciones';
  return { wpm:`${v} WPM`, reproduc:rep, resumen:`${n.toUpperCase()}: dictado ${v} WPM, ${rep}.` };
}
