/**
 * Edad humana del perro por raza (fórmula AVMA 2020 logarítmica).
 */
export interface Inputs { raza: string; edadPerro: number; __lang?: string; }
export interface Outputs { edadHumana: number; etapa: string; formula: string; recomendacion: string; _insight?: any; _chart?: any; }

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
    insightTitle: 'Tu perro en edad humana',
    insightYoung: (e: string, h: number, et: string) => `Tu perro de **${e} año${e !== '1' ? 's' : ''}** equivale a **${h} años humanos** (**${et}**). Está en plena forma: controles anuales y dieta balanceada alcanzan.`,
    insightMid: (e: string, h: number, et: string) => `Con **${e} años** equivale a **${h} años humanos** (**${et}**). Sumá chequeos más frecuentes y cuidá el peso y las articulaciones.`,
    insightSenior: (e: string, h: number, et: string) => `A los **${e} años** ya son **${h} años humanos** (**${et}**). Etapa senior: controles cada 6 meses, alimento senior y atención a movilidad y dientes.`,
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
    insightTitle: 'Your dog in human years',
    insightYoung: (e: string, h: number, et: string) => `Your **${e}-year-old** dog is about **${h} human years** (**${et}**). In great shape: annual check-ups and a balanced diet are enough.`,
    insightMid: (e: string, h: number, et: string) => `At **${e} years** that's about **${h} human years** (**${et}**). Add more frequent check-ups and watch weight and joints.`,
    insightSenior: (e: string, h: number, et: string) => `At **${e} years** your dog is already **${h} human years** (**${et}**). Senior stage: check-ups every 6 months, senior food and attention to mobility and teeth.`,
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

  const edadHumanaR = Math.round(humana);
  const edadStr = String(edad);

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (stageKey === 'cachorro' || stageKey === 'adultoJoven') {
    insightText = t.insightYoung(edadStr, edadHumanaR, etapa);
    insightTone = 'good';
  } else if (stageKey === 'adultoMaduro') {
    insightText = t.insightMid(edadStr, edadHumanaR, etapa);
    insightTone = 'neutral';
  } else {
    insightText = t.insightSenior(edadStr, edadHumanaR, etapa);
    insightTone = 'warn';
  }

  const segNames = __lang === 'en'
    ? ['Puppy', 'Young adult', 'Mature', 'Senior', 'Geriatric']
    : ['Cachorro', 'Adulto joven', 'Maduro', 'Senior', 'Geriátrico'];

  return {
    edadHumana: edadHumanaR,
    etapa,
    formula: 'AVMA 2020: 16 × ln(edad) + 31',
    recomendacion,
    _insight: {
      title: t.insightTitle,
      text: insightText,
      tone: insightTone,
      icon: '🐶',
    },
    _chart: {
      type: 'scale',
      marker: edadHumanaR,
      markerLabel: `${edadHumanaR} · ${etapa}`,
      min: 0,
      segments: [
        { nombre: segNames[0], max: 20, color: '#86efac', colorDark: '#14532d' },
        { nombre: segNames[1], max: 40, color: '#4ade80', colorDark: '#166534' },
        { nombre: segNames[2], max: 60, color: '#fde047', colorDark: '#713f12' },
        { nombre: segNames[3], max: 75, color: '#fb923c', colorDark: '#7c2d12' },
        { nombre: segNames[4], max: Math.max(90, edadHumanaR + 1), color: '#f87171', colorDark: '#7f1d1d' },
      ],
      ariaLabel: __lang === 'en'
        ? `Human-equivalent age ${edadHumanaR}: ${etapa}`
        : `Edad equivalente humana ${edadHumanaR}: ${etapa}`,
    },
  };
}
