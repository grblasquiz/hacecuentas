export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function calorEspecificoDeltaT(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m); const c = Number(i.c); const dt = Number(i.dt);
  if (!m || !c || dt === undefined) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá');
  const Q = m * c * dt;
  const resumen = __lang === 'en'
    ? `Q = ${(Q/1000).toFixed(1)} kJ (${(Q/4184).toFixed(1)} kcal) to heat ${m}kg by ${dt}°C.`
    : `Q = ${(Q/1000).toFixed(1)} kJ (${(Q/4184).toFixed(1)} kcal) para calentar ${m}kg en ${dt}°C.`;
  return { calor: Q.toFixed(0) + ' J', kcal: (Q/4184).toFixed(1) + ' kcal', resumen };
}
