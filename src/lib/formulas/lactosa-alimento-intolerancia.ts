/**
 * Lactosa por alimento.
 */

export interface LactosaAlimentoIntoleranciaInputs {
  alimento: string;
  gramos: number;
}

export interface LactosaAlimentoIntoleranciaOutputs {
  lactosaG: number;
  tolerancia: string;
  recomendacion: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function lactosaAlimentoIntolerancia(inputs: LactosaAlimentoIntoleranciaInputs): LactosaAlimentoIntoleranciaOutputs {
  const g = Number(inputs.gramos);
  if (!g || g <= 0) throw new Error('Ingresá gramos válidos');
  const tabla: Record<string, number> = {
    'leche': 4.8, 'yogur': 2, 'yogur-griego': 1,
    'queso-fresco': 3, 'queso-semiduro': 0.5, 'queso-duro': 0.1,
    'manteca': 0.1, 'crema': 2.8, 'helado': 6, 'dulce-leche': 11,
  };
  const porCien = tabla[inputs.alimento] ?? 2;
  const total = (g / 100) * porCien;
  const tol = 'La mayoría tolera ~12g/día';
  let rec: string;
  let tone: 'good' | 'warn' | 'neutral';
  let zona: string;
  if (total < 1) { rec = 'Sin síntomas esperables.'; tone = 'good'; zona = 'segura'; }
  else if (total < 6) { rec = 'Tolerable para la mayoría.'; tone = 'good'; zona = 'tolerable'; }
  else if (total < 12) { rec = 'Borderline. Considerá lactasa o deslactosada.'; tone = 'warn'; zona = 'borderline'; }
  else { rec = 'Probablemente cause síntomas. Dividir o usar lactasa.'; tone = 'warn'; zona = 'de síntomas probables'; }
  const totalR = Number(total.toFixed(1));
  // Marker acotado para que el último segmento (max 18) siempre supere al marcador
  const marker = Math.min(totalR, 17.5);
  return {
    lactosaG: totalR,
    tolerancia: tol,
    recomendacion: rec,
    resumen: `${g}g de este alimento aportan ${total.toFixed(1)}g lactosa.`,
    _insight: {
      title: 'Cuánta lactosa es',
      text: `Esa porción aporta **${total.toFixed(1)} g de lactosa**, en la zona ${zona} frente al umbral de ~12 g/día que tolera la mayoría. ${rec}`,
      tone,
      icon: '🥛',
    },
    _chart: {
      type: 'scale',
      marker,
      markerLabel: `${total.toFixed(1)} g`,
      min: 0,
      segments: [
        { nombre: 'Segura', max: 1, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Tolerable', max: 6, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Borderline', max: 12, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Síntomas probables', max: 18, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Lactosa de la porción: ${total.toFixed(1)} gramos, zona ${zona}`,
    },
  };
}
