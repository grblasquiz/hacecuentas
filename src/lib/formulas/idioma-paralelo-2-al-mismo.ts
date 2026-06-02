/** ¿Es viable aprender 2 idiomas a la vez? */
export interface Inputs {
  [k: string]: any;
  __lang?: string;
}
export interface Outputs {
  viable: string;
  minutosEfectivos: number;
  perdida: string;
  recomendacion: string;
  _insight?: any;
}

export function idiomaParalelo2AlMismo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorHoras: 'Horas inválidas',
      noViable: 'No viable',
      recNoViable: 'Muy poco tiempo. Concentrate en uno.',
      pocoViable: 'Poco viable',
      recPocoViable: 'Considerá uno hasta B2 antes de sumar el segundo.',
      viableLimitaciones: 'Viable con limitaciones',
      recViableLimitaciones: 'Avance lento. Separá franjas horarias.',
      viable: 'Viable',
      recViable: 'Dividí mañana/tarde y mantené consistencia.',
      recA0Suffix: ' Empezar ambos desde cero multiplica interferencia — priorizá uno los primeros 3-6 meses.',
      perdidaSuffix: '% (interferencia entre idiomas)',
      insightTitle: (v: string) => `Aprender 2 idiomas: ${v.toLowerCase()}`,
      insightText: (min: number, pct: number) =>
        `Con tu tiempo, cada idioma recibe unos **${min} min/día** efectivos: la interferencia entre ambos te resta cerca del **${pct}%** del estudio.`,
    },
    en: {
      errorHoras: 'Invalid hours',
      noViable: 'Not viable',
      recNoViable: 'Too little time. Focus on one language.',
      pocoViable: 'Barely viable',
      recPocoViable: 'Consider reaching B2 in one language before adding a second.',
      viableLimitaciones: 'Viable with limitations',
      recViableLimitaciones: 'Progress will be slow. Keep separate time blocks for each language.',
      viable: 'Viable',
      recViable: 'Split morning/afternoon sessions and stay consistent.',
      recA0Suffix: ' Starting both from scratch multiplies interference — prioritize one for the first 3–6 months.',
      perdidaSuffix: '% (cross-language interference)',
      insightTitle: (v: string) => `Learning 2 languages: ${v.toLowerCase()}`,
      insightText: (min: number, pct: number) =>
        `With your time, each language gets about **${min} effective min/day**: cross-language interference costs you roughly **${pct}%** of your study.`,
    },
  } as const)[__lang];

  const horas = Number(i.horasDia) || 2;
  const sim = String(i.similitud || 'distintos');
  const nivel = String(i.nivelMasFuerte || 'a2');
  if (horas <= 0) throw new Error(T.errorHoras);

  const INT: Record<string, number> = { 'muy-similares': 0.35, similares: 0.2, distintos: 0.08 };
  const inter = INT[sim] ?? 0.2;

  const horasBrutas = horas / 2;
  const horasEfect = horasBrutas * (1 - inter);

  let viable = '';
  let rec = '';
  if (horas < 1) { viable = T.noViable; rec = T.recNoViable; }
  else if (horas < 1.5) { viable = T.pocoViable; rec = T.recPocoViable; }
  else if (horas < 3) { viable = T.viableLimitaciones; rec = T.recViableLimitaciones; }
  else { viable = T.viable; rec = T.recViable; }

  if (nivel === 'a0') rec += T.recA0Suffix;

  const minEfect = Math.round(horasEfect * 60);
  const pctInter = Math.round(inter * 100);
  const tone = horas < 1.5 ? 'warn' : horas < 3 ? 'neutral' : 'good';
  const insight = {
    title: T.insightTitle(viable),
    text: T.insightText(minEfect, pctInter),
    tone,
    icon: '🗣️',
  };

  return {
    viable,
    minutosEfectivos: minEfect,
    perdida: pctInter + T.perdidaSuffix,
    recomendacion: rec,
    _insight: insight,
  };

}
