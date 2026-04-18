export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cosechaEsperadaHuertaKg(i: Inputs): Outputs {
  const yield_: Record<string, number> = { tomate: 3, lechuga: 2, zanahoria: 4, papa: 2.5, calabaza: 5 };
  const m = Number(i.m2) || 0; const kg = (yield_[String(i.especie)] || 2) * m;
  return { kgTotal: kg.toFixed(1) + ' kg', resumen: `Cosecha estimada: ${kg.toFixed(0)} kg de ${i.especie} en ${m} m².` };
}
