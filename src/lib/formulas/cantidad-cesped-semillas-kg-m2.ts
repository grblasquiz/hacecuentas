export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cantidadCespedSemillasKgM2(i: Inputs): Outputs {
  const m = Number(i.m2) || 0;
  const rate: Record<string, number> = { rye: 40, fescue: 30, mezcla: 35 };
  const g = m * (rate[String(i.tipo)] || 35);
  return { gramos: (g/1000).toFixed(2) + ' kg', resumen: `${(g/1000).toFixed(1)} kg de semilla ${i.tipo} para ${m} m².` };
}
