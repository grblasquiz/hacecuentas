export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function energiaCineticaEc(i: Inputs): Outputs {
  const m = Number(i.masa); const v = Number(i.velocidad);
  if (!m || v === undefined) throw new Error('Completá');
  const Ec = 0.5 * m * v * v;
  return { energia: Ec.toFixed(2) + ' J', resumen: `Ec = ${Ec.toFixed(1)} J con m=${m}kg a ${v}m/s.` };
}
