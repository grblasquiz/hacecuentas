export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sistemaEcuaciones2x2Cramer(i: Inputs): Outputs {
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0; const d=Number(i.d)||0; const e=Number(i.e)||0; const f=Number(i.f)||0;
  const det=a*d-b*c;
  if (Math.abs(det)<1e-10) return { x:'—', y:'—', det:'0', resumen:'Sistema singular: sin solución única.' };
  return { x:((e*d-b*f)/det).toFixed(3), y:((a*f-e*c)/det).toFixed(3), det:det.toFixed(2), resumen:`Solución única: x=${((e*d-b*f)/det).toFixed(2)}, y=${((a*f-e*c)/det).toFixed(2)}.` };
}
