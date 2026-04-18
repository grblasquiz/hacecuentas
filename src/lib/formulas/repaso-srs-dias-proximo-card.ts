export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function repasoSrsDiasProximoCard(i: Inputs): Outputs {
  const int_act=Number(i.intervalo)||1; const ef=Number(i.eFactor)||2.5;
  const nuevo=Math.round(int_act*ef);
  return { proximo:`${nuevo} días`, nuevoInter:`${nuevo}d`, resumen:`Int ${int_act}d × EF ${ef} = próximo en ${nuevo} días.` };
}
