/** Tiempo para construir un Memory Palace */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  tiempoConstruccion: number;
  tiempoConsolidacion: number;
  tiempoTotal: number;
  horasTotal: number;
  _insight?: any;
  _chart?: any;
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

  const horas = Math.round(total / 60 * 10) / 10;
  const ETIQUETA_EXP: Record<string, string> = { principiante: 'principiante', intermedio: 'intermedio', avanzado: 'avanzado' };
  const expTxt = ETIQUETA_EXP[exp] || 'principiante';
  const tiempoTxt = total >= 60 ? `${horas} h (${total} min)` : `${total} min`;

  // --- Insight: cuánto tarda memorizar con esta técnica ---
  const _insight = {
    title: 'Tiempo del palacio de memoria',
    text: `Memorizar **${items}** ítems con nivel **${expTxt}** te lleva unos **${tiempoTxt}**: ${construccion} min para construir y asociar las imágenes y **${consolidacion} min** de repaso para fijarlas. Repasá al día siguiente para pasar la información a memoria de largo plazo.`,
    tone: 'neutral',
    icon: '🧠',
  };

  // --- Donut: construcción + consolidación = tiempo total ---
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Construcción', value: construccion },
      { label: 'Consolidación', value: consolidacion },
    ],
    suffix: ' min',
    centerValue: `${total} min`,
    centerLabel: 'total',
    ariaLabel: 'Reparto del tiempo total del palacio de memoria entre la construcción de las imágenes y el repaso de consolidación.',
  };

  return {
    tiempoConstruccion: construccion,
    tiempoConsolidacion: consolidacion,
    tiempoTotal: total,
    horasTotal: horas,
    _insight,
    _chart,
  };

}
