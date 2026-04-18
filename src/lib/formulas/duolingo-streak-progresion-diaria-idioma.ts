export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function duolingoStreakProgresionDiariaIdioma(i: Inputs): Outputs {
  const d=Number(i.dias)||0;
  let n:string;
  if (d<30) n='A1 parcial'; else if (d<180) n='A1 completo'; else if (d<365) n='A2 parcial'; else if (d<730) n='A2-B1'; else n='B1 máximo';
  return { nivelAprox:n, realidad:'Duo solo no lleva más allá de B1', resumen:`${d} días racha ≈ ${n}. Complementar con conversación.` };
}
