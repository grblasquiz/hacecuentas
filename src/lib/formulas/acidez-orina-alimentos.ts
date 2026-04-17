/**
 * PRAL - Potential Renal Acid Load (Remer & Manz 1995).
 */

export interface AcidezOrinaAlimentosInputs {
  proteina: number;
  fosforo: number;
  potasio: number;
  magnesio: number;
  calcio: number;
}

export interface AcidezOrinaAlimentosOutputs {
  pral: number;
  efecto: string;
  recomendacion: string;
}

export function acidezOrinaAlimentos(inputs: AcidezOrinaAlimentosInputs): AcidezOrinaAlimentosOutputs {
  const p = Number(inputs.proteina);
  const P = Number(inputs.fosforo);
  const K = Number(inputs.potasio);
  const Mg = Number(inputs.magnesio);
  const Ca = Number(inputs.calcio);
  const pral = 0.49 * p + 0.037 * P - 0.021 * K - 0.026 * Mg - 0.013 * Ca;

  let efecto = '', rec = '';
  if (pral > 5) { efecto = 'Fuertemente acidificante ⚠️'; rec = 'Compensá con alimentos PRAL negativo (frutas, verduras).'; }
  else if (pral > 0) { efecto = 'Ligeramente acidificante'; rec = 'Aceptable en dieta balanceada.'; }
  else if (pral > -5) { efecto = 'Ligeramente alcalinizante'; rec = 'Bueno para prevenir cálculos de ácido úrico.'; }
  else { efecto = 'Fuertemente alcalinizante ✅'; rec = 'Ideal para pacientes con cálculos renales o gota.'; }

  return { pral: Number(pral.toFixed(1)), efecto, recomendacion: rec };
}
