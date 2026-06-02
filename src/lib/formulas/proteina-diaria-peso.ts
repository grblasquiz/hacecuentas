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
  _insight?: any;
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

  const OBJ_LABEL: Record<string, string> = {
    perder: "perder grasa preservando músculo",
    ganar: "ganar masa muscular",
    mantener: "mantenimiento",
  };
  const objLabel = OBJ_LABEL[objetivo] ?? OBJ_LABEL["mantener"];
  const gkgRecom = (proteinaRecomG / peso).toFixed(1);

  const _insight = {
    title: "Cuánta proteína comer por día",
    text: `Con objetivo de **${objLabel}**, apuntá a **${Math.round(proteinaRecomG)} g de proteína al día** (~**${gkgRecom} g/kg**), dentro del rango **${Math.round(proteinaMinG)}–${Math.round(proteinaMaxG)} g**. Eso equivale a unas **${pechugas.toFixed(1)} pechugas de pollo** o **${Math.round(huevos)} huevos** repartidos en el día.`,
    tone: "neutral",
    icon: "💪",
  };

  return {
    proteinaMinG: Math.round(proteinaMinG),
    proteinaMaxG: Math.round(proteinaMaxG),
    proteinaRecomG: Math.round(proteinaRecomG),
    pechugas: Number(pechugas.toFixed(1)),
    huevos: Math.round(huevos),
    mensaje: `Necesitás entre ${Math.round(proteinaMinG)}g y ${Math.round(proteinaMaxG)}g de proteína/día (~${Math.round(proteinaRecomG)}g recomendados). Equivale a ${pechugas.toFixed(1)} pechugas de pollo o ${Math.round(huevos)} huevos.`,
    _insight,
  };
}
