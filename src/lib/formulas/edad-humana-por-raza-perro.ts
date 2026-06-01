/**
 * Edad humana del perro por raza (fórmula AVMA 2020 logarítmica).
 */
export interface Inputs { raza: string; edadPerro: number; __lang?: string; }
export interface Outputs { edadHumana: number; etapa: string; formula: string; recomendacion: string; }

const RAZAS: Record<string, { tamano: string }> = {
  'labrador-retriever': { tamano: 'grande' },
  'golden-retriever': { tamano: 'grande' },
  'bulldog-frances': { tamano: 'pequeno' },
  'bulldog-ingles': { tamano: 'mediano' },
  'pastor-aleman': { tamano: 'grande' },
  'beagle': { tamano: 'mediano' },
  'caniche-poodle': { tamano: 'mediano' },
  'chihuahua': { tamano: 'toy' },
  'rottweiler': { tamano: 'grande' },
  'yorkshire-terrier': { tamano: 'toy' },
  'boxer': { tamano: 'grande' },
  'dachshund-salchicha': { tamano: 'pequeno' },
  'husky-siberiano': { tamano: 'grande' },
  'shih-tzu': { tamano: 'pequeno' },
  'pitbull': { tamano: 'mediano' },
};

const T = {
  es: {
    errEdad: 'Ingresá edad válida',
    errRaza: 'Raza no reconocida',
    etapaCachorro: 'Cachorro/juvenil',
    etapaAdultoJoven: 'Adulto joven',
    etapaAdultoMaduro: 'Adulto maduro',
    etapaSenior: 'Senior',
    etapaGeriatrico: 'Geriátrico',
    recAnual: 'Controles anuales y alimentación balanceada.',
    recSenior: 'Controles semestrales, alimento Senior, suplementos articulares.',
    recCachorro: 'Plan de vacunas, socialización temprana, alimento Puppy.',
  },
  en: {
    errEdad: 'Enter a valid age',
    errRaza: 'Breed not recognized',
    etapaCachorro: 'Puppy/Juvenile',
    etapaAdultoJoven: 'Young adult',
    etapaAdultoMaduro: 'Mature adult',
    etapaSenior: 'Senior',
    etapaGeriatrico: 'Geriatric',
    recAnual: 'Annual check-ups and balanced diet.',
    recSenior: 'Twice-yearly check-ups, senior food, joint supplements.',
    recCachorro: 'Vaccination schedule, early socialization, puppy food.',
  },
} as const;

export function edadHumanaPorRazaPerro(inputs: Inputs): Outputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const t = T[__lang];

  const raza = String(inputs.raza || 'beagle');
  const edad = Number(inputs.edadPerro);
  if (!edad || edad <= 0) throw new Error(t.errEdad);
  const r = RAZAS[raza];
  if (!r) throw new Error(t.errRaza);

  // Fórmula AVMA 2020
  let humana = 16 * Math.log(edad) + 31;
  // Ajuste cachorros menores a 1 año: interpolación lineal
  if (edad < 1) humana = 15 * edad;

  const factor = r.tamano === 'toy' ? 0.9 : r.tamano === 'pequeno' ? 0.95 : r.tamano === 'grande' ? 1.1 : 1.0;
  humana = humana * factor;

  // Internal stage key used for recomendacion branching
  let stageKey: 'cachorro' | 'adultoJoven' | 'adultoMaduro' | 'senior' | 'geriatrico' = 'adultoJoven';
  if (humana < 20) stageKey = 'cachorro';
  else if (humana < 40) stageKey = 'adultoJoven';
  else if (humana < 60) stageKey = 'adultoMaduro';
  else if (humana < 75) stageKey = 'senior';
  else stageKey = 'geriatrico';

  const etapaMap = {
    cachorro: t.etapaCachorro,
    adultoJoven: t.etapaAdultoJoven,
    adultoMaduro: t.etapaAdultoMaduro,
    senior: t.etapaSenior,
    geriatrico: t.etapaGeriatrico,
  } as const;
  const etapa = etapaMap[stageKey];

  let recomendacion = t.recAnual;
  if (stageKey === 'senior' || stageKey === 'geriatrico') {
    recomendacion = t.recSenior;
  } else if (stageKey === 'cachorro') {
    recomendacion = t.recCachorro;
  }

  return {
    edadHumana: Math.round(humana),
    etapa,
    formula: 'AVMA 2020: 16 × ln(edad) + 31',
    recomendacion,
  };
}
