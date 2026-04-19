export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vo2maxPredecirCarreraCooper12min(i: Inputs): Outputs {
  const d=Number(i.distanciaMts)||0;
  const vo2=(d-504.9)/44.73;
  let cat='—';
  if (vo2<25) cat='Bajo'; else if (vo2<35) cat='Regular'; else if (vo2<45) cat='Bueno'; else if (vo2<55) cat='Muy bueno'; else cat='Atleta';
  return { vo2:vo2.toFixed(1), categoria:cat, resumen:`${d}m en 12min: VO2 ${vo2.toFixed(1)} (${cat}).` };
}
