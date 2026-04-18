export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function trabajoMecanicoFuerzaDistancia(i: Inputs): Outputs {
  const F = Number(i.fuerza); const d = Number(i.distancia); const a = Number(i.angulo) || 0;
  if (!F || d === undefined) throw new Error('Completá');
  const W = F * d * Math.cos(a * Math.PI / 180);
  return { trabajo: W.toFixed(2) + ' J', resumen: `W = ${W.toFixed(1)} J (F=${F}N × d=${d}m × cos(${a}°)).` };
}
