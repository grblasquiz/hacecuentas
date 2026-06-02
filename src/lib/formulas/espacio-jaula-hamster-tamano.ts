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
  _insight?: any;
  _chart?: any;
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

  const pct = Math.round(actual / min * 100);
  const especieLabel = especie.charAt(0).toUpperCase() + especie.slice(1);
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (especie === 'sirio' && cantidad > 1) {
    insightTone = 'warn';
    insightText = `Los hámsters sirios son **solitarios y territoriales**: ${cantidad} juntos terminan peleándose, a veces a muerte. Separalos ya en jaulas independientes; el mínimo mostrado (${min} cm²) es por animal, no para convivencia.`;
  } else if (actual >= min) {
    insightTone = 'good';
    const sobra = actual - min;
    insightText = `Tu jaula de **${actual} cm²** cubre el **${pct}%** del piso mínimo para ${especieLabel}${sobra > 0 ? ` y le sobran **${sobra} cm²**` : ''}. Mantené lecho de **${lecho[especie] ?? 18} cm** para que pueda cavar y rueda sólida de **${rueda[especie] ?? 22}+ cm**.`;
  } else {
    insightTone = 'warn';
    insightText = `Con **${actual} cm²** llegás solo al **${pct}%** del mínimo recomendado (**${min} cm²**) para ${especieLabel}: faltan **${min - actual} cm²**. Espacio chico estresa al hámster; pasá a un bin cage o acuario más grande.`;
  }

  return {
    baseMinimaCm2: min,
    baseActualCm2: actual,
    ruedaDiametroCm: rueda[especie] ?? 22,
    lechoProfundidadCm: lecho[especie] ?? 18,
    cumpleMinimo: cumple,
    recomendacion: rec,
    _insight: {
      title: 'Tamaño de jaula vs. mínimo',
      text: insightText,
      tone: insightTone,
      icon: '🐹',
    },
    _chart: {
      type: 'scale',
      marker: pct,
      markerLabel: `${pct}%`,
      min: 0,
      segments: [
        { nombre: 'Insuficiente', max: 100, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Cumple', max: 150, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Amplia', max: Math.max(200, pct + 10), color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `La jaula cubre el ${pct}% del piso mínimo recomendado para ${especieLabel}`,
    },
  };
}
