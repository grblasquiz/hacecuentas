/**
 * Calculadora de tarifario para creadores de contenido (media kit, multiplataforma)
 * Precio orientativo por pieza según seguidores, engagement rate, plataforma y nicho.
 *
 * Base ≈ USD por cada 1.000 seguidores (1 pieza principal):
 *   Instagram ~10 · TikTok ~8 · YouTube ~20 (1 video)
 * Ajuste por engagement (ER>6%→×1.5, 3-6%→×1, <3%→×0.7)
 * Ajuste por nicho (finanzas/moda-belleza ×1.3, general ×1, resto intermedio)
 * Rango mostrado ±25%.
 *
 * IMPORTANTE: benchmarks ORIENTATIVOS. El precio real depende de marca,
 * exclusividad, derechos de uso, mercado y poder de negociación.
 */

export interface TarifarioCreadorContenidoMultiplataformaInputs {
  seguidores: number | string | null;
  engagement_rate: number | string | null; // %
  plataforma: string; // Instagram | TikTok | YouTube
  nicho: string; // moda-belleza | fitness | finanzas | gaming | viajes | general
}

export interface TarifarioCreadorContenidoMultiplataformaOutputs {
  precioSugerido: number; // pieza principal (post/reel/video), USD
  precioLow: number;
  precioHigh: number;
  rango: string;
  precioStory: number; // pieza secundaria liviana (story / short)
  precioPack: number; // combo 1 principal + 3 stories
  cpm: number; // costo por mil seguidores efectivo
  factorEngagement: number;
  factorNicho: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const BASE_POR_MIL: Record<string, number> = {
  Instagram: 10,
  TikTok: 8,
  YouTube: 20,
};

const NICHO_FACTOR: Record<string, number> = {
  'finanzas': 1.3,
  'moda-belleza': 1.3,
  'fitness': 1.15,
  'viajes': 1.1,
  'gaming': 1.0,
  'general': 1.0,
};

const NICHO_LABEL: Record<string, string> = {
  'finanzas': 'Finanzas (premium ×1,3)',
  'moda-belleza': 'Moda y belleza (premium ×1,3)',
  'fitness': 'Fitness (×1,15)',
  'viajes': 'Viajes (×1,1)',
  'gaming': 'Gaming (×1,0)',
  'general': 'General (×1,0)',
};

export function tarifarioCreadorContenidoMultiplataforma(
  i: TarifarioCreadorContenidoMultiplataformaInputs
): TarifarioCreadorContenidoMultiplataformaOutputs {
  const seguidores =
    i.seguidores === '' || i.seguidores == null ? 0 : Number(i.seguidores);
  const er =
    i.engagement_rate === '' || i.engagement_rate == null
      ? 3
      : Number(i.engagement_rate);
  const plataforma =
    i.plataforma === '' || i.plataforma == null
      ? 'Instagram'
      : String(i.plataforma);
  const nicho =
    i.nicho === '' || i.nicho == null ? 'general' : String(i.nicho);

  if (!seguidores || seguidores <= 0)
    throw new Error('Ingresá tu cantidad de seguidores');

  const basePorMil = BASE_POR_MIL[plataforma] ?? 10;

  // Factor por engagement
  let factorEngagement: number;
  if (er > 6) factorEngagement = 1.5;
  else if (er >= 3) factorEngagement = 1;
  else factorEngagement = 0.7;

  const factorNicho = NICHO_FACTOR[nicho] ?? 1;

  // Precio base de la pieza principal
  const precioSugerido =
    (seguidores / 1000) * basePorMil * factorEngagement * factorNicho;

  const precioLow = precioSugerido * 0.75;
  const precioHigh = precioSugerido * 1.25;

  // Pieza secundaria liviana (story / short): ~40% de la principal
  const precioStory = precioSugerido * 0.4;
  // Pack: 1 principal + 3 stories
  const precioPack = precioSugerido + precioStory * 3;

  // CPM efectivo (precio por cada 1.000 seguidores)
  const cpm = (precioSugerido / seguidores) * 1000;

  const r = (n: number) => Math.round(n);
  const fmt = (n: number) => `$${r(n).toLocaleString('en-US')} USD`;

  const rango = `${fmt(precioLow)} – ${fmt(precioHigh)}`;

  const piezaNombre =
    plataforma === 'YouTube'
      ? 'video integrado'
      : plataforma === 'TikTok'
      ? 'video/TikTok'
      : 'post o reel';

  let tone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (factorEngagement >= 1.5) {
    tone = 'good';
    insightText = `Con **${er}%** de engagement (muy por encima del promedio) tu tarifa lleva un **+50%** sobre el rate base: una pieza principal en ${plataforma} ronda **${fmt(
      precioSugerido
    )}**. Las marcas pagan por audiencias activas, no solo por números: mostrá este ER en tu media kit.`;
  } else if (factorEngagement < 1) {
    tone = 'warn';
    insightText = `Tu engagement de **${er}%** está por debajo del 3% promedio, así que el rate se ajusta **−30%**: la pieza principal sale **${fmt(
      precioSugerido
    )}**. Antes de pedir tarifas mayores, subí la interacción (mejor copy, CTA, comunidad); el ER pesa más que los seguidores.`;
  } else {
    tone = 'neutral';
    insightText = `Con **${seguidores.toLocaleString(
      'es-AR'
    )}** seguidores y **${er}%** de engagement, una pieza principal (${piezaNombre}) ronda **${fmt(
      precioSugerido
    )}** (rango ${rango}). Es una referencia de mercado: usala como piso para negociar y subila según derechos de uso y exclusividad.`;
  }

  const detalle = `${plataforma} · base $${basePorMil}/1.000 seg · ER ×${factorEngagement} · nicho ×${factorNicho}. Pieza principal ${fmt(
    precioSugerido
  )} (rango ${rango}) · story/short ${fmt(precioStory)} · pack ${fmt(precioPack)}.`;

  return {
    precioSugerido: r(precioSugerido),
    precioLow: r(precioLow),
    precioHigh: r(precioHigh),
    rango,
    precioStory: r(precioStory),
    precioPack: r(precioPack),
    cpm: Math.round(cpm * 100) / 100,
    factorEngagement,
    factorNicho: NICHO_LABEL[nicho] ?? nicho,
    detalle,
    _insight: {
      title: 'Tu tarifa orientativa',
      text: insightText,
      tone,
      icon: '💰',
    },
    _chart: {
      type: 'bar',
      labels: ['Pieza principal', 'Story / short', 'Pack (1 + 3 stories)'],
      values: [r(precioSugerido), r(precioStory), r(precioPack)],
      prefix: '$',
      ariaLabel: `Tarifas orientativas: pieza principal ${fmt(
        precioSugerido
      )}, story ${fmt(precioStory)}, pack ${fmt(precioPack)}.`,
    },
  };
}
