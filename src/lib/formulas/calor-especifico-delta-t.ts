export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function calorEspecificoDeltaT(i: Inputs): Outputs {
  const m = Number(i.m); const c = Number(i.c); const dt = Number(i.dt);
  if (!m || !c || dt === undefined) throw new Error('Completá');
  const Q = m * c * dt;
  return { calor: Q.toFixed(0) + ' J', kcal: (Q/4184).toFixed(1) + ' kcal', resumen: `Q = ${(Q/1000).toFixed(1)} kJ (${(Q/4184).toFixed(1)} kcal) para calentar ${m}kg en ${dt}°C.` };
}
