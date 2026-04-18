export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function compostTiempoMaduracion(i: Inputs): Outputs {
  const v = String(i.volteo); const c = String(i.clima);
  const base: Record<string, number> = { semanal: 2, mensual: 4, ninguno: 8 };
  const mult: Record<string, number> = { calido: 1, templado: 1.3, frio: 2 };
  const m = base[v] * mult[c];
  return { meses: m.toFixed(1), resumen: `${m.toFixed(0)} meses para compost listo (volteo ${v}, clima ${c}).` };
}
