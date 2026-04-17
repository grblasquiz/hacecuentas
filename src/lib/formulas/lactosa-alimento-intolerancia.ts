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
  if (total < 1) rec = 'Sin síntomas esperables.';
  else if (total < 6) rec = 'Tolerable para la mayoría.';
  else if (total < 12) rec = 'Borderline. Considerá lactasa o deslactosada.';
  else rec = 'Probablemente cause síntomas. Dividir o usar lactasa.';
  return {
    lactosaG: Number(total.toFixed(1)),
    tolerancia: tol,
    recomendacion: rec,
    resumen: `${g}g de este alimento aportan ${total.toFixed(1)}g lactosa.`,
  };
}
