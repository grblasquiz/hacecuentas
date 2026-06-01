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
  _insight?: any;
  _chart?: any;
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
      insTitle: 'Qué le hace a tu orina',
      insAcidFuerte: (v: string) => `Con un PRAL de **${v} mEq/día** este alimento **acidifica con fuerza** la orina: favorece cálculos de ácido úrico y cistina. Compensalo en la misma comida con frutas y verduras.`,
      insAcidLeve: (v: string) => `Un PRAL de **${v} mEq/día** acidifica **levemente** la orina. Es aceptable dentro de una dieta variada con suficientes vegetales.`,
      insAlcLeve: (v: string) => `Con PRAL **${v} mEq/día** el alimento **alcaliniza suavemente** la orina, un terreno menos propenso a cálculos de ácido úrico.`,
      insAlcFuerte: (v: string) => `Un PRAL de **${v} mEq/día** **alcaliniza con fuerza** la orina: ideal si tenés gota o antecedentes de cálculos de ácido úrico.`,
      segAcid: 'Acidificante',
      segNeutro: 'Casi neutro',
      segAlc: 'Alcalinizante',
      chartMarker: 'PRAL',
      chartAria: 'Escala de carga ácida renal potencial (PRAL), de alcalinizante a acidificante',
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
      insTitle: 'What it does to your urine',
      insAcidFuerte: (v: string) => `With a PRAL of **${v} mEq/day** this food **strongly acidifies** urine, favoring uric acid and cystine stones. Offset it in the same meal with fruits and vegetables.`,
      insAcidLeve: (v: string) => `A PRAL of **${v} mEq/day** **mildly acidifies** urine. It is acceptable within a varied diet with enough vegetables.`,
      insAlcLeve: (v: string) => `With PRAL **${v} mEq/day** the food **gently alkalizes** urine, a terrain less prone to uric acid stones.`,
      insAlcFuerte: (v: string) => `A PRAL of **${v} mEq/day** **strongly alkalizes** urine: ideal if you have gout or a history of uric acid stones.`,
      segAcid: 'Acidifying',
      segNeutro: 'Near neutral',
      segAlc: 'Alkalizing',
      chartMarker: 'PRAL',
      chartAria: 'Potential renal acid load (PRAL) scale, from alkalizing to acidifying',
    },
  } as const)[__lang];

  const p = Number(inputs.proteina);
  const P = Number(inputs.fosforo);
  const K = Number(inputs.potasio);
  const Mg = Number(inputs.magnesio);
  const Ca = Number(inputs.calcio);
  const pral = 0.49 * p + 0.037 * P - 0.021 * K - 0.026 * Mg - 0.013 * Ca;

  let efecto = '', rec = '';
  let insText = '', tone = 'neutral';
  const pralR = Number(pral.toFixed(1));
  const vStr = pralR.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');
  if (pral > 5) { efecto = T.efectoAcidFuerte; rec = T.recAcidFuerte; insText = T.insAcidFuerte(vStr); tone = 'warn'; }
  else if (pral > 0) { efecto = T.efectoAcidLeve; rec = T.recAcidLeve; insText = T.insAcidLeve(vStr); tone = 'neutral'; }
  else if (pral > -5) { efecto = T.efectoAlcLeve; rec = T.recAlcLeve; insText = T.insAlcLeve(vStr); tone = 'good'; }
  else { efecto = T.efectoAlcFuerte; rec = T.recAlcFuerte; insText = T.insAlcFuerte(vStr); tone = 'good'; }

  const _insight = { title: T.insTitle, text: insText, tone, icon: pral > 0 ? '🍋' : '🥬' };

  const marker = Math.max(-25, Math.min(25, pralR));
  const _chart = {
    type: 'scale',
    marker,
    markerLabel: `${T.chartMarker} ${vStr}`,
    min: -25,
    segments: [
      { nombre: T.segAlc, max: 0, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: T.segNeutro, max: 5, color: '#eab308', colorDark: '#facc15' },
      { nombre: T.segAcid, max: 25, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: T.chartAria,
  };

  return { pral: pralR, efecto, recomendacion: rec, _insight, _chart };
}
