export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function acentoExtranjeroScorePracticaHoras(i: Inputs): Outputs {
  const a=Number(i.nivelActual)||5; const h=Number(i.horasSem)||0;
  const meses=h===0?'—':Math.max(3, (10-a)*2/(h/2));
  return { meses:typeof meses==='string'?meses:`${Number(meses).toFixed(0)} meses`, resumen:`Acento ${a}/10 con ${h}h/sem: ${typeof meses==='string'?meses:`~${Number(meses).toFixed(0)} meses`} para notar reducción.` };
}
