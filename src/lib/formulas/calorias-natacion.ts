/** Calorías quemadas nadando según estilo, peso y tiempo */
export interface Inputs {
  peso: number;
  estilo: string;
  minutos: number;
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  estiloMostrado: string;
  resumen: string;
}

const MET_NATACION: Record<string, { met: number; nombre: string }> = {
  'crawl-suave': { met: 5.8, nombre: 'Crawl (freestyle) suave' },
  'crawl-moderado': { met: 8.3, nombre: 'Crawl moderado' },
  'crawl-intenso': { met: 10.0, nombre: 'Crawl intenso/competición' },
  'espalda': { met: 7.0, nombre: 'Espalda (backstroke)' },
  'pecho-suave': { met: 5.3, nombre: 'Pecho (breaststroke) suave' },
  'pecho-intenso': { met: 10.3, nombre: 'Pecho intenso' },
  'mariposa': { met: 13.8, nombre: 'Mariposa (butterfly)' },
  'recreativo': { met: 6.0, nombre: 'Nado recreativo' },
  'aquagym': { met: 5.5, nombre: 'Aquagym / aerobic acuático' },
  'perrito': { met: 3.5, nombre: 'Perrito / estilo lento' },
};

export function caloriasNatacion(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const est = String(i.estilo || 'crawl-moderado');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!min || min <= 0) throw new Error('Ingresá los minutos');

  const info = MET_NATACION[est] || MET_NATACION['crawl-moderado'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    estiloMostrado: info.nombre,
    resumen: `Nadando **${info.nombre}** durante ${min} minutos quemás aproximadamente **${Math.round(total)} kcal** (${kcalMin.toFixed(1)} kcal/min, MET ${info.met}).`,
  };
}
