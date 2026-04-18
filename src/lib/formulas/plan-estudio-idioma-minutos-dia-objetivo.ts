export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function planEstudioIdiomaMinutosDiaObjetivo(i: Inputs): Outputs {
  const h=Number(i.horasTotales)||600; const m=Number(i.meses)||12;
  const min=(h*60)/(m*30);
  return { minDia:`${min.toFixed(0)} min`, semDia:'6-7/sem', resumen:`${h}h en ${m}m: ${min.toFixed(0)}min/día.` };
}
