/**
 * BCAA pre-entreno — dosis ajustada por peso corporal.
 *
 * Antes la dosis era fija (7-10 g) sin considerar peso. Ahora escala con
 * el peso: ~0.1 g/kg para entreno normal, ~0.15 g/kg en ayunas/sesión larga.
 * Rango resultante: 5-20 g según peso y contexto — alineado con ISSN 2017.
 *
 * Ratio 2:1:1 (leucina:isoleucina:valina) es el estándar validado para MPS.
 * Umbral de leucina para activar mTOR: 2.5-3 g por toma.
 */

export interface BcaaPreWorkoutGramosInputs {
  peso: number;
  proteinaDiariaGkg: number;
  contextoEntreno: string;
}

export interface BcaaPreWorkoutGramosOutputs {
  bcaaGramos: number;
  leucina: string;
  utilidad: string;
  resumen: string;
}

export function bcaaPreWorkoutGramos(inputs: BcaaPreWorkoutGramosInputs): BcaaPreWorkoutGramosOutputs {
  const peso = Number(inputs.peso);
  const pGkg = Number(inputs.proteinaDiariaGkg);
  const ctx = inputs.contextoEntreno || 'normal';
  if (!peso || peso <= 0) throw new Error('Ingresá peso válido');

  // Dosis base por kg según contexto (ISSN Position Stand on BCAA 2017).
  let dosisPorKg: number;
  if (ctx === 'ayunas') dosisPorKg = 0.15;         // Fasted training: mayor necesidad
  else if (ctx === 'largo') dosisPorKg = 0.13;     // >90 min: más gasto
  else dosisPorKg = 0.10;                           // Normal: base

  // Calcular y clampear al rango seguro 5-20 g
  const rawDosis = peso * dosisPorKg;
  const dosis = Math.max(5, Math.min(20, Math.round(rawDosis * 10) / 10));

  // Ratio 2:1:1 → leucina es 50% del total
  const leu = Math.round(dosis * 0.5 * 10) / 10;

  let util: string;
  if (pGkg >= 1.6 && ctx === 'normal') util = 'Baja — tu proteína diaria ya cubre la síntesis muscular (MPS)';
  else if (ctx === 'ayunas') util = 'Moderada-alta — útil en entreno en ayunas para prevenir catabolismo';
  else if (pGkg < 1.2) util = 'Moderada — tu ingesta proteica está por debajo del óptimo';
  else util = 'Baja-moderada';

  return {
    bcaaGramos: dosis,
    leucina: `${leu}g leucina (umbral mTOR 2.5-3g)`,
    utilidad: util,
    resumen: `${dosis}g BCAA pre-entreno para ${peso}kg corporal (${(dosisPorKg*1000).toFixed(0)}mg/kg, ratio 2:1:1). Utilidad: ${util}.`,
  };
}
