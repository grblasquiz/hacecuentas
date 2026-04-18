export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function presionHidrostaticaProfundidad(i: Inputs): Outputs {
  const rho = Number(i.rho); const h = Number(i.h); const g = Number(i.g) || 9.81;
  if (!rho || h === undefined) throw new Error('Completá');
  const P = rho * g * h;
  return { presion: P.toFixed(0) + ' Pa', presionBar: (P/100000).toFixed(3) + ' bar', resumen: `P = ${P.toFixed(0)} Pa (${(P/100000).toFixed(2)} bar) a ${h}m de profundidad.` };
}
