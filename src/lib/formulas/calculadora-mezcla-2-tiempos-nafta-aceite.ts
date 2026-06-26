/**
 * Mezcla nafta-aceite para motores 2 tiempos.
 * La relación "X:1" significa X partes de nafta por 1 de aceite.
 * mlAceite = litrosNafta * 1000 / X
 * Ej: 5 L a 50:1 → 5000 / 50 = 100 ml de aceite.
 * Matemática pura (proporción); sin constantes externas.
 */
export interface Inputs {
  litrosNafta: number;
  relacion?: string; // "25:1" | "30:1" | "40:1" | "50:1"
  __lang?: string;
}
export interface Outputs {
  mlAceite: number;
  proporcionUsada: string;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function mezcla2TiemposNaftaAceite(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorLitros: 'Ingresá cuántos litros de nafta vas a mezclar',
      errorRelacion: 'Elegí una relación de mezcla válida (ej: 50:1)',
      nafta: 'Nafta',
      aceite: 'Aceite',
      center: 'Aceite',
      chartAria: 'Proporción de la mezcla: nafta y aceite 2 tiempos.',
      insightTitle: 'Tu mezcla 2 tiempos',
      ratioLabel: 'partes de nafta por 1 de aceite',
    },
    en: {
      errorLitros: 'Enter how many liters of gasoline you will mix',
      errorRelacion: 'Choose a valid mix ratio (e.g. 50:1)',
      nafta: 'Gasoline',
      aceite: 'Oil',
      center: 'Oil',
      chartAria: 'Mix proportion: gasoline and 2-stroke oil.',
      insightTitle: 'Your 2-stroke mix',
      ratioLabel: 'parts gasoline per 1 of oil',
    },
  } as const)[__lang];

  const litros = Number(i.litrosNafta);
  const relacion = String(i.relacion || '50:1');
  if (!litros || litros <= 0) throw new Error(T.errorLitros);

  const ratio = parseInt(relacion.split(':')[0], 10);
  if (!ratio || ratio <= 0) throw new Error(T.errorRelacion);

  const mlNafta = litros * 1000;
  const mlAceite = mlNafta / ratio;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const fmt1 = (n: number) => Number(n.toFixed(1)).toLocaleString(locale);

  const proporcionUsada = __lang === 'en'
    ? `${ratio}:1 — ${ratio} ${T.ratioLabel}`
    : `${ratio}:1 — ${ratio} ${T.ratioLabel}`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.nafta, value: Math.round(mlNafta) },
      { label: T.aceite, value: Math.round(mlAceite) },
    ],
    prefix: '',
    centerValue: fmt1(mlAceite) + ' ml',
    centerLabel: T.center,
    ariaLabel: T.chartAria,
  };

  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `For **${fmt1(litros)} L** of gasoline at **${ratio}:1**, add **${fmt1(mlAceite)} ml** of 2-stroke oil. Always follow the ratio your tool's manufacturer specifies — too little oil seizes the engine, too much fouls the spark plug and smokes.`
      : `Para **${fmt1(litros)} L** de nafta a **${ratio}:1**, agregá **${fmt1(mlAceite)} ml** de aceite 2 tiempos. Respetá siempre la relación que indica el fabricante de tu equipo: con poco aceite se funde el motor, con demasiado ensucia la bujía y humea.`,
    tone: 'neutral' as const,
    icon: '⛽',
  };

  return {
    mlAceite: Number(mlAceite.toFixed(1)),
    proporcionUsada,
    formula: `${fmt1(litros)} L × 1000 / ${ratio} = ${fmt1(mlAceite)} ml de aceite`,
    _chart: chart,
    _insight: insight,
  };
}
