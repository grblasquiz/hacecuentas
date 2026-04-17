/** Espacio mínimo de jaula para hámster según especie, rueda y lecho. */
export interface Inputs {
  especie?: string;
  cantidad?: number;
  largoActualCm?: number;
  anchoActualCm?: number;
}
export interface Outputs {
  baseMinimaCm2: number;
  baseActualCm2: number;
  ruedaDiametroCm: number;
  lechoProfundidadCm: number;
  cumpleMinimo: string;
  recomendacion: string;
}

export function espacioJaulaHamsterTamano(i: Inputs): Outputs {
  const especie = String(i.especie || 'sirio');
  const cantidad = Math.max(1, Math.round(Number(i.cantidad ?? 1)));
  const largo = Math.max(10, Number(i.largoActualCm ?? 60));
  const ancho = Math.max(10, Number(i.anchoActualCm ?? 40));

  // Base mínima en cm² por especie (un hámster)
  const baseMin: Record<string, number> = {
    'sirio': 5000,    // 100 x 50
    'ruso': 4000,     // 80 x 50
    'roborowski': 4000,
    'chino': 4000,
  };
  const rueda: Record<string, number> = {
    'sirio': 28, 'ruso': 22, 'roborowski': 20, 'chino': 22,
  };
  const lecho: Record<string, number> = {
    'sirio': 20, 'ruso': 18, 'roborowski': 18, 'chino': 18,
  };

  let base = baseMin[especie] ?? 4000;
  // Cantidad > 1: sirio imposible, pero si lo fuerzan el mínimo se multiplica 1.8
  if (especie === 'sirio' && cantidad > 1) {
    // No conviven; devolvemos un mínimo pero con alerta fuerte
    base = base * cantidad;
  } else if (cantidad > 1) {
    base = base + (base * 0.8 * (cantidad - 1));
  }

  const actual = Math.round(largo * ancho);
  const min = Math.round(base);

  const cumple = actual >= min
    ? `Sí — tenés ${Math.round(actual / min * 100)}% del mínimo`
    : `No — tenés el ${Math.round(actual / min * 100)}% del mínimo. Faltan ${min - actual} cm²`;

  let rec = '';
  if (especie === 'sirio' && cantidad > 1) {
    rec = 'Los hámsters sirios NO conviven: se pelean a muerte. Separalos ya en jaulas independientes.';
  } else if (actual < min) {
    rec = `Jaula insuficiente para ${especie}. Pasá a acuario de 120 L o bin cage de al menos ${Math.ceil(min / 50)}×50 cm. Agregá lecho de ${lecho[especie] ?? 18} cm y rueda de ${rueda[especie] ?? 22}+ cm.`;
  } else {
    rec = `Jaula adecuada. Asegurate de tener lecho de ${lecho[especie] ?? 18} cm y rueda sólida de ${rueda[especie] ?? 22}+ cm. Sumá túneles, refugios y baño de arena de chinchilla.`;
  }

  return {
    baseMinimaCm2: min,
    baseActualCm2: actual,
    ruedaDiametroCm: rueda[especie] ?? 22,
    lechoProfundidadCm: lecho[especie] ?? 18,
    cumpleMinimo: cumple,
    recomendacion: rec,
  };
}
