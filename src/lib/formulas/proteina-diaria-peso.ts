/** Gramos de proteína diaria según objetivo */
export interface Inputs {
  peso: number;
  objetivo: string;
  actividad: string;
}
export interface Outputs {
  proteinaMinG: number;
  proteinaMaxG: number;
  proteinaRecomG: number;
  pechugas: number;
  huevos: number;
  mensaje: string;
}

export function proteinaDiariaPeso(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const objetivo = String(i.objetivo || 'mantener');
  const actividad = String(i.actividad || 'moderado');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  // Rangos g/kg según objetivo y actividad
  let minGkg: number, maxGkg: number;
  if (objetivo === 'perder') {
    minGkg = 1.6; maxGkg = 2.4; // Alto para preservar músculo en déficit
  } else if (objetivo === 'ganar') {
    minGkg = 1.6; maxGkg = 2.2;
  } else {
    // mantener
    if (actividad === 'sedentario') { minGkg = 0.8; maxGkg = 1.2; }
    else if (actividad === 'moderado') { minGkg = 1.2; maxGkg = 1.6; }
    else { minGkg = 1.4; maxGkg = 2.0; }
  }

  const proteinaMinG = peso * minGkg;
  const proteinaMaxG = peso * maxGkg;
  const proteinaRecomG = (proteinaMinG + proteinaMaxG) / 2;

  // Equivalencias prácticas
  const pechugas = proteinaRecomG / 31; // 100g pechuga ≈ 31g proteína
  const huevos = proteinaRecomG / 6.5; // 1 huevo ≈ 6.5g

  return {
    proteinaMinG: Math.round(proteinaMinG),
    proteinaMaxG: Math.round(proteinaMaxG),
    proteinaRecomG: Math.round(proteinaRecomG),
    pechugas: Number(pechugas.toFixed(1)),
    huevos: Math.round(huevos),
    mensaje: `Necesitás entre ${Math.round(proteinaMinG)}g y ${Math.round(proteinaMaxG)}g de proteína/día (~${Math.round(proteinaRecomG)}g recomendados). Equivale a ${pechugas.toFixed(1)} pechugas de pollo o ${Math.round(huevos)} huevos.`,
  };
}
