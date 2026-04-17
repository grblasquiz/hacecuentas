/** Tiempo para construir un Memory Palace */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  tiempoConstruccion: number;
  tiempoConsolidacion: number;
  tiempoTotal: number;
  horasTotal: number;
}

export function tecnicaMemoryPalaceTiempo(i: Inputs): Outputs {
  const items = Number(i.cantidadItems) || 50;
  const exp = String(i.experiencia || 'principiante');
  if (items <= 0) throw new Error('Ítems inválidos');

  const MIN_POR_10: Record<string, number> = { principiante: 8, intermedio: 5, avanzado: 3 };
  const MIN_CONS_POR_10: Record<string, number> = { principiante: 5, intermedio: 3, avanzado: 2 };

  const mp = MIN_POR_10[exp] || 8;
  const mc = MIN_CONS_POR_10[exp] || 5;

  const construccion = Math.round((items / 10) * mp) + 15; // overhead de diseño
  const consolidacion = Math.round((items / 10) * mc);
  const total = construccion + consolidacion;

  return {
    tiempoConstruccion: construccion,
    tiempoConsolidacion: consolidacion,
    tiempoTotal: total,
    horasTotal: Math.round(total / 60 * 10) / 10,
  };

}
