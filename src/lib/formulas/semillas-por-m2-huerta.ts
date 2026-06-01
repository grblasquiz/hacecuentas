export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function semillasPorM2Huerta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0;
  const dens: Record<string, number> = { lechuga: 20, tomate: 4, zanahoria: 200, rabano: 100, espinaca: 30 };
  const d = dens[String(i.especie)] || 10;
  const resumen = __lang === 'en'
    ? `${m} m² of ${i.especie}: ${(m*d).toFixed(0)} seeds.`
    : `${m} m² de ${i.especie}: ${(m*d).toFixed(0)} semillas.`;
  return { semillas: (m * d).toFixed(0), resumen };
}
