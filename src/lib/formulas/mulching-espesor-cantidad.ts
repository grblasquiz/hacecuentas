export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mulchingEspesorCantidad(i: Inputs): Outputs {
  const m = Number(i.m2) || 0; const e = Number(i.espesor) || 5;
  const V = m * (e / 100); const kg = V * 100;
  return { m3: V.toFixed(2), kg: kg.toFixed(0), resumen: `${V.toFixed(1)} m³ = ${kg.toFixed(0)} kg paja para ${m} m² a ${e} cm espesor.` };
}
