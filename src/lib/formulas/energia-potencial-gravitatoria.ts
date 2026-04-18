export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function energiaPotencialGravitatoria(i: Inputs): Outputs {
  const m = Number(i.masa); const h = Number(i.h); const g = Number(i.g) || 9.81;
  if (!m || h === undefined) throw new Error('Completá');
  const Ep = m * g * h;
  return { energia: Ep.toFixed(2) + ' J', resumen: `Ep = ${Ep.toFixed(1)} J con m=${m}kg a altura ${h}m.` };
}
