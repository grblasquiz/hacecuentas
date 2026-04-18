export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function paredLadrillosMetrosM2(i: Inputs): Outputs {
  const rates: Record<string, number> = { comun: 60, portante: 16, cerramiento: 20 };
  const r = rates[String(i.tipo)] || 60;
  const m = Number(i.m2) || 0;
  const total = Math.ceil(m * r * 1.08);
  return { cantidad: total.toString(), resumen: `${total} ladrillos ${i.tipo} para ${m} m² (+8% desperdicio).` };
}
