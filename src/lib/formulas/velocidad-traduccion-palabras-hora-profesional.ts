export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function velocidadTraduccionPalabrasHoraProfesional(i: Inputs): Outputs {
  const t=String(i.tipo||'general');
  const w:Record<string,number>={general:500,tecnico:400,literario:200,juridico:300};
  const v=w[t]||400;
  return { wph:`${v} palabras/h`, diario:`${(v*8).toLocaleString()} palabras/día`, resumen:`${t}: ~${v} palabras/h, ${(v*8).toLocaleString()} día.` };
}
