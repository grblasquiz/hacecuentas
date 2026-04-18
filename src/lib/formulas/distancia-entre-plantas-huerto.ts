export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function distanciaEntrePlantasHuerto(i: Inputs): Outputs {
  const d: Record<string, string> = { tomate: '60-80', lechuga: '25-30', zanahoria: '5-10', papa: '30-40', calabaza: '100-150' };
  const e = String(i.especie);
  return { distancia: (d[e] || '?') + ' cm', resumen: `${e}: ${d[e]} cm entre plantas.` };
}
