/**
 * PRAL - Potential Renal Acid Load (Remer & Manz 1995).
 */

export interface AcidezOrinaAlimentosInputs {
  proteina: number;
  fosforo: number;
  potasio: number;
  magnesio: number;
  calcio: number;
  __lang?: string;
}

export interface AcidezOrinaAlimentosOutputs {
  pral: number;
  efecto: string;
  recomendacion: string;
}

export function acidezOrinaAlimentos(inputs: AcidezOrinaAlimentosInputs): AcidezOrinaAlimentosOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      efectoAcidFuerte: 'Fuertemente acidificante ⚠️',
      recAcidFuerte: 'Compensá con alimentos PRAL negativo (frutas, verduras).',
      efectoAcidLeve: 'Ligeramente acidificante',
      recAcidLeve: 'Aceptable en dieta balanceada.',
      efectoAlcLeve: 'Ligeramente alcalinizante',
      recAlcLeve: 'Bueno para prevenir cálculos de ácido úrico.',
      efectoAlcFuerte: 'Fuertemente alcalinizante ✅',
      recAlcFuerte: 'Ideal para pacientes con cálculos renales o gota.',
    },
    en: {
      efectoAcidFuerte: 'Strongly acidifying ⚠️',
      recAcidFuerte: 'Balance with negative-PRAL foods (fruits, vegetables).',
      efectoAcidLeve: 'Mildly acidifying',
      recAcidLeve: 'Acceptable in a balanced diet.',
      efectoAlcLeve: 'Mildly alkalizing',
      recAlcLeve: 'Good for preventing uric acid kidney stones.',
      efectoAlcFuerte: 'Strongly alkalizing ✅',
      recAlcFuerte: 'Ideal for patients with kidney stones or gout.',
    },
  } as const)[__lang];

  const p = Number(inputs.proteina);
  const P = Number(inputs.fosforo);
  const K = Number(inputs.potasio);
  const Mg = Number(inputs.magnesio);
  const Ca = Number(inputs.calcio);
  const pral = 0.49 * p + 0.037 * P - 0.021 * K - 0.026 * Mg - 0.013 * Ca;

  let efecto = '', rec = '';
  if (pral > 5) { efecto = T.efectoAcidFuerte; rec = T.recAcidFuerte; }
  else if (pral > 0) { efecto = T.efectoAcidLeve; rec = T.recAcidLeve; }
  else if (pral > -5) { efecto = T.efectoAlcLeve; rec = T.recAlcLeve; }
  else { efecto = T.efectoAlcFuerte; rec = T.recAlcFuerte; }

  return { pral: Number(pral.toFixed(1)), efecto, recomendacion: rec };
}
