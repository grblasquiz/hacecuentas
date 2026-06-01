/** Calorías quemadas nadando según estilo, peso y tiempo */
export interface Inputs {
  peso: number;
  estilo: string;
  minutos: number;
  __lang?: string;
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  estiloMostrado: string;
  resumen: string;
}

const MET_NATACION: Record<string, { met: number; nombre: string; nameEn: string }> = {
  'crawl-suave': { met: 5.8, nombre: 'Crawl (freestyle) suave', nameEn: 'Crawl (freestyle) easy' },
  'crawl-moderado': { met: 8.3, nombre: 'Crawl moderado', nameEn: 'Crawl moderate' },
  'crawl-intenso': { met: 10.0, nombre: 'Crawl intenso/competición', nameEn: 'Crawl intense/competition' },
  'espalda': { met: 7.0, nombre: 'Espalda (backstroke)', nameEn: 'Backstroke' },
  'pecho-suave': { met: 5.3, nombre: 'Pecho (breaststroke) suave', nameEn: 'Breaststroke easy' },
  'pecho-intenso': { met: 10.3, nombre: 'Pecho intenso', nameEn: 'Breaststroke intense' },
  'mariposa': { met: 13.8, nombre: 'Mariposa (butterfly)', nameEn: 'Butterfly' },
  'recreativo': { met: 6.0, nombre: 'Nado recreativo', nameEn: 'Recreational swimming' },
  'aquagym': { met: 5.5, nombre: 'Aquagym / aerobic acuático', nameEn: 'Aquagym / water aerobics' },
  'perrito': { met: 3.5, nombre: 'Perrito / estilo lento', nameEn: 'Doggy paddle / slow style' },
};

export function caloriasNatacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errPeso: 'Ingresá tu peso',
      errMin: 'Ingresá los minutos',
    },
    en: {
      errPeso: 'Enter your weight',
      errMin: 'Enter the minutes',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const est = String(i.estilo || 'crawl-moderado');

  if (!peso || peso <= 0) throw new Error(T.errPeso);
  if (!min || min <= 0) throw new Error(T.errMin);

  const info = MET_NATACION[est] || MET_NATACION['crawl-moderado'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;
  const estiloMostrado = __lang === 'en' ? info.nameEn : info.nombre;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    estiloMostrado,
    resumen: __lang === 'en'
      ? `Swimming **${estiloMostrado}** for ${min} minutes burns approximately **${Math.round(total)} kcal** (${kcalMin.toFixed(1)} kcal/min, MET ${info.met}).`
      : `Nadando **${info.nombre}** durante ${min} minutos quemás aproximadamente **${Math.round(total)} kcal** (${kcalMin.toFixed(1)} kcal/min, MET ${info.met}).`,
  };
}
