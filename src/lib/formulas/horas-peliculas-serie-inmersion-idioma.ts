export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function horasPeliculasSerieInmersionIdioma(i: Inputs): Outputs {
  const h=Number(i.horasEstudio)||0;
  const v=h*0.3;
  return { horasMedia:`${v.toFixed(1)}h/sem`, modoRec:'Serie con sub objetivo', resumen:`${h}h estudio → ${v.toFixed(1)}h video inmersivo.` };
}
