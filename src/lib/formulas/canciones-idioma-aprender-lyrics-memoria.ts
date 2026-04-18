export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cancionesIdiomaAprenderLyricsMemoria(i: Inputs): Outputs {
  const m=Number(i.min)||0;
  const c=Math.floor(m/3.5);
  return { canciones:`${c} canciones`, beneficio:'Pronunciación, ritmo, vocab emocional', resumen:`${m}min/día música: ~${c} canciones.` };
}
