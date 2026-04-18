export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function calderaKwM2Calefaccion(i: Inputs): Outputs {
  const m = Number(i.m2) || 0;
  const factores: Record<string, number> = { bueno: 0.07, normal: 0.09, malo: 0.12 };
  const f = factores[String(i.aislamiento)] || 0.09;
  const kw = m * f;
  return { kw: kw.toFixed(1) + ' kW', resumen: `Caldera ${kw.toFixed(0)} kW para ${m} m² con aislamiento ${i.aislamiento}.` };
}
