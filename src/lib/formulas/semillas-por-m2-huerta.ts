export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function semillasPorM2Huerta(i: Inputs): Outputs {
  const m = Number(i.m2) || 0;
  const dens: Record<string, number> = { lechuga: 20, tomate: 4, zanahoria: 200, rabano: 100, espinaca: 30 };
  const d = dens[String(i.especie)] || 10;
  return { semillas: (m * d).toFixed(0), resumen: `${m} m² de ${i.especie}: ${(m*d).toFixed(0)} semillas.` };
}
