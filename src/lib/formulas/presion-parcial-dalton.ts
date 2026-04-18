export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function presionParcialDalton(i: Inputs): Outputs {
  const x = Number(i.fraccion); const p = Number(i.pTotal);
  if (x === undefined || !p) throw new Error('Completá');
  const pp = x * p;
  return { presionParcial: pp.toFixed(3) + ' atm', resumen: `Presión parcial: ${pp.toFixed(3)} atm (fracción ${x} de ${p} atm total).` };
}
