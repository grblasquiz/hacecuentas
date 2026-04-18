export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rejillaTrampaDesague(i: Inputs): Outputs {
  const usos: Record<string, string> = { lavatorio: '50 mm', cocina: '75-100 mm', patio: '100-150 mm', ducha: '75-100 mm' };
  const u = String(i.uso);
  return { diametro: usos[u] || '100 mm', resumen: `${u}: rejilla Ø ${usos[u]}.` };
}
