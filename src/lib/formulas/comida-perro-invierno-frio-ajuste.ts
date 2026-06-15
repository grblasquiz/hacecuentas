export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Ajuste de la ración diaria de un perro según el frío / la estación.
 *
 * Base (igual que comida-perro-gramos-adulto-senior-pesos):
 *   RER (kcal/día) = 70 × peso_kg^0.75
 *   MER base       = RER × factor_etapa
 *   Gramos base    = MER / 3.5 kcal/g (pienso seco estándar 3 500 kcal/kg)
 *
 * Ajuste por frío (factor sobre el MER). El NRC indica que un perro alojado a
 * la intemperie en clima frío puede necesitar entre +10 % y +90 % de energía
 * según exposición, pelaje y temperatura. Usamos factores conservadores:
 *   interior        → 1.00 (vive adentro, con calefacción)
 *   frio-leve       → 1.10 (afuera unas horas, 5–15 °C)
 *   frio-intenso    → 1.25 (afuera la mayor parte del día, −5 a 5 °C)
 *   frio-extremo    → 1.50 (intemperie permanente < −5 °C, pelo corto o cachorro)
 */

const MER_FACTOR: Record<string, number> = {
  'adult-active':   1.8,
  'adult-neutered': 1.6,
  'senior':         1.4,
  'senior-light':   1.2,
};

const STAGE_LABELS_ES: Record<string, string> = {
  'adult-active':   'Adulto activo / entero',
  'adult-neutered': 'Adulto castrado / normal',
  'senior':         'Senior (7-10 años)',
  'senior-light':   'Senior mayor (> 10 años o sobrepeso)',
};
const STAGE_LABELS_EN: Record<string, string> = {
  'adult-active':   'Active adult / intact',
  'adult-neutered': 'Neutered adult / normal',
  'senior':         'Senior (7-10 years)',
  'senior-light':   'Older senior (> 10 yrs or overweight)',
};

const CLIMA_FACTOR: Record<string, number> = {
  'interior':     1.0,
  'frio-leve':    1.1,
  'frio-intenso': 1.25,
  'frio-extremo': 1.5,
};
const CLIMA_LABELS_ES: Record<string, string> = {
  'interior':     'Interior con calefacción',
  'frio-leve':    'Afuera con frío leve (5–15 °C)',
  'frio-intenso': 'Afuera con frío intenso (−5 a 5 °C)',
  'frio-extremo': 'Intemperie con frío extremo (< −5 °C)',
};
const CLIMA_LABELS_EN: Record<string, string> = {
  'interior':     'Indoors, heated',
  'frio-leve':    'Outdoors, mild cold (5–15 °C)',
  'frio-intenso': 'Outdoors, hard cold (−5 to 5 °C)',
  'frio-extremo': 'Exposed, extreme cold (< −5 °C)',
};

export function comidaPerroInviernoFrioAjuste(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // v1 = peso (kg) · v2 = etapa de vida · v3 = condición de frío
  const pesoKg = Math.max(Number(i.v1) || 0, 0);
  const etapa = String(i.v2 || 'adult-neutered');
  const clima = String(i.v3 || 'interior');

  if (pesoKg <= 0) {
    return {
      resultado: __lang === 'en' ? 'Enter weight' : 'Ingresá el peso',
      resumen: '',
    };
  }

  const factor = MER_FACTOR[etapa] ?? 1.6;
  const climaFactor = CLIMA_FACTOR[clima] ?? 1.0;

  const rer = 70 * Math.pow(pesoKg, 0.75);
  const merBase = rer * factor;
  const merFrio = merBase * climaFactor;

  const KCAL_POR_GRAMO = 3.5;
  const gramosBase = merBase / KCAL_POR_GRAMO;
  const gramosFrio = merFrio / KCAL_POR_GRAMO;

  const gBase = Math.round(gramosBase);
  const gFrio = Math.round(gramosFrio);
  const extra = Math.round(gramosFrio - gramosBase);
  const extraPct = Math.round((climaFactor - 1) * 100);

  const etapaLabel = __lang === 'en' ? (STAGE_LABELS_EN[etapa] ?? etapa) : (STAGE_LABELS_ES[etapa] ?? etapa);
  const climaLabel = __lang === 'en' ? (CLIMA_LABELS_EN[clima] ?? clima) : (CLIMA_LABELS_ES[clima] ?? clima);

  const resultado = __lang === 'en' ? `${gFrio} g/day` : `${gFrio} g/día`;

  const resumen = __lang === 'en'
    ? `${pesoKg} kg dog · ${etapaLabel} · ${climaLabel}: normal ration ${gBase} g/day × ${climaFactor} = ${gFrio} g/day (${extra >= 0 ? '+' : ''}${extra} g, ${extraPct >= 0 ? '+' : ''}${extraPct}% for the cold).`
    : `Perro de ${pesoKg} kg · ${etapaLabel} · ${climaLabel}: ración normal ${gBase} g/día × ${climaFactor} = ${gFrio} g/día (${extra >= 0 ? '+' : ''}${extra} g, ${extraPct >= 0 ? '+' : ''}${extraPct}% por el frío).`;

  const insightText = __lang === 'en'
    ? `In ${climaLabel.toLowerCase()}, your ${pesoKg} kg dog needs about **${gFrio} g of dry food per day** — ${extra > 0 ? `${extra} g more (${extraPct}%) than in normal conditions (${gBase} g)` : `the same as in normal conditions`}. Cold-weather energy goes up mainly for dogs living outdoors: an indoor heated dog barely changes. Also raise fresh (unfrozen) water, give a dry, draft-free shelter, and re-check body condition every 2 weeks — you should feel, not see, the ribs.`
    : `Con ${climaLabel.toLowerCase()}, tu perro de ${pesoKg} kg necesita unos **${gFrio} g de alimento seco por día** — ${extra > 0 ? `${extra} g más (${extraPct}%) que en condiciones normales (${gBase} g)` : `lo mismo que en condiciones normales`}. El gasto sube sobre todo en perros que viven a la intemperie: uno que duerme adentro con calefacción casi no cambia. Sumá agua fresca (sin congelar), refugio seco sin corrientes de aire, y revisá la condición corporal cada 2 semanas — debés sentir, no ver, las costillas.`;

  return {
    resultado,
    resumen,
    _insight: {
      title: __lang === 'en' ? 'Winter feeding adjustment' : 'Ajuste de comida en invierno',
      text: insightText,
      tone: extra > 0 ? 'info' : 'neutral',
      icon: '🐶',
    },
  };
}
