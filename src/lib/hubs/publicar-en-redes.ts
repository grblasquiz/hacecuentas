import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo publico en cada red para que rinda?"
 *
 * Absorbe 6 calculadoras sueltas de FORMATO y RENDIMIENTO de publicación
 * (ver `replaces`):
 *   src/lib/formulas/engagement.ts                          (ER multi-red)
 *   src/lib/formulas/tiktok-engagement-rate.ts              (ER sobre vistas)
 *   src/lib/formulas/tiktok-duracion-optima-video.ts        (segundos por objetivo)
 *   src/lib/formulas/instagram-carrousel-slides-optimas.ts  (slides por objetivo)
 *   src/lib/formulas/linkedin-posts-alcance.ts              (impresiones estimadas)
 *   src/lib/formulas/pinterest-calendario-pines.ts          (cadencia de Pines)
 *
 * ── DELIMITACIÓN con los hubs hermanos de /negocios (no se pisan) ──────────
 *   · /negocios/creador-de-contenido    → "¿cuánto vale mi cuenta y cuánto cobro?"
 *   · /negocios/ingresos-por-plataforma → "¿cuánto me paga cada plataforma?"
 *   · /negocios/vender-mi-contenido     → "¿cuánto deja vender mi obra?"
 *   · /negocios/metricas-de-marketing   → "¿cuánto me cuesta un cliente?" (pauta paga)
 * Los cuatro responden PLATA. Este responde otra cosa: CÓMO publico —cuánto
 * dura el video, cuántas slides, cuántos Pines, cuánto alcance, qué engagement
 * tengo—. Por eso acá no hay ni una tarifa: el engagement que se calcula acá es
 * el insumo que el hub de tarifas pide como dato de entrada.
 *
 * ── UNIDADES ───────────────────────────────────────────────────────────────
 * NO HAY PLATA EN NINGUNA RAMA. El default de HubRow es 'ars' y el runtime hace
 * Object.assign, así que TODA fila declara su `format` propio: 'unit' para
 * porcentajes, segundos, slides, impresiones y Pines; 'plain' para conteos.
 *
 * ── DE DÓNDE SALEN LOS NÚMEROS ─────────────────────────────────────────────
 * Todas las tablas de abajo son copia fiel de las fórmulas del repo. Los
 * benchmarks de engagement son consenso de mercado (no un dato publicado por
 * las plataformas) y así se dice en el copy y en las advertencias.
 */

/** Estimaciones de rendimiento orientativas: no son datos oficiales de las plataformas. */
export const DISCLAIMER =
  'Los benchmarks de alcance, engagement y formato son promedios de mercado, no datos publicados por las plataformas. Sirven para ubicarte y planificar; el rendimiento real de tu cuenta está en tus propias estadísticas.';

/**
 * Franjas de engagement rate medido SOBRE SEGUIDORES.
 * Copia fiel de los cortes de `engagement.ts` y `engagement-rate-instagram.ts`
 * (1 / 3 / 6 por ciento).
 */
export const BANDS_SEGUIDORES = [
  { label: 'Bajo', from: 0, to: 1 },
  { label: 'Promedio', from: 1, to: 3 },
  { label: 'Bueno', from: 3, to: 6 },
  { label: 'Excelente', from: 6, to: 10 },
];

/**
 * Franjas de engagement rate medido SOBRE VISTAS o ALCANCE.
 * Copia fiel de los cortes de `tiktok-engagement-rate.ts` (3 / 6 / 10 / 15).
 * El denominador cambia el número, así que la vara también tiene que cambiar:
 * un 4% sobre vistas es flojo y un 4% sobre seguidores es bueno.
 */
export const BANDS_ALCANCE = [
  { label: 'Bajo', from: 0, to: 3 },
  { label: 'Promedio', from: 3, to: 6 },
  { label: 'Bueno', from: 6, to: 10 },
  { label: 'Muy bueno', from: 10, to: 15 },
  { label: 'Excelente', from: 15, to: 20 },
];

/**
 * Promedio de referencia de engagement sobre seguidores por tamaño de cuenta.
 * Copia fiel de los benchmarks de `engagement-rate-instagram.ts`.
 */
export const BENCH_TAMANO: Array<{ max: number; label: string; min: number; top: number }> = [
  { max: 1000, label: 'Nano (menos de 1.000)', min: 5, top: 8 },
  { max: 10000, label: 'Micro (1.000 a 10.000)', min: 3, top: 5 },
  { max: 100000, label: 'Media (10.000 a 100.000)', min: 1.5, top: 3 },
  { max: 1000000, label: 'Macro (100.000 a 1 millón)', min: 1, top: 2 },
  { max: Infinity, label: 'Mega (más de 1 millón)', min: 0.5, top: 1.5 },
];

/**
 * Duración de video en TikTok: rango base en segundos por objetivo.
 * Copia fiel de `tiktok-duracion-optima-video.ts`.
 */
export const DUR_OBJETIVO: Record<string, [number, number]> = {
  viralidad: [7, 15],
  monetizacion: [60, 180],
  engagement: [30, 60],
  mix: [45, 90],
};

/** Ajuste en segundos por nicho. Copia fiel de `tiktok-duracion-optima-video.ts`. */
export const DUR_NICHO: Record<string, number> = {
  humor: -5,
  tutorial: 20,
  cocina: 15,
  gaming: 0,
  dance: -5,
  storytelling: 25,
  fitness: -5,
  negocios: 15,
};

/**
 * Carrusel de Instagram: rango base de slides por objetivo.
 * Copia fiel de `instagram-carrousel-slides-optimas.ts`.
 */
export const CARR_OBJETIVO: Record<string, [number, number]> = {
  reach: [3, 5],
  saves: [5, 7],
  engagement: [7, 10],
  venta: [3, 5],
  storytelling: [8, 10],
};

/** Ajuste de slides por tipo de contenido. Copia fiel de la misma fórmula. */
export const CARR_TIPO: Record<string, number> = {
  tutorial: 1,
  lista: 0,
  antesdespues: -2,
  storytelling: 2,
  producto: -1,
  infografia: 1,
};

/**
 * LinkedIn: multiplicador de alcance por formato del posteo.
 * Copia fiel de `linkedin-posts-alcance.ts`.
 */
export const LI_FORMATO: Record<string, number> = {
  texto: 1.0,
  imagen: 1.2,
  documento: 1.6,
  video: 1.5,
  poll: 1.8,
  articulo: 0.6,
};

/** Pines que Pinterest Business deja dejar programados a futuro. */
export const PIN_CUPO_PROGRAMABLE = 10;

export const hub: HubData = {
  slug: 'negocios/publicar-en-redes',
  title: '¿Cómo publico en cada red? — Engagement, duración, slides y cadencia',
  description:
    'Medí el engagement rate real de tu posteo en Instagram o TikTok, calculá cuántos segundos tiene que durar tu video, cuántas slides lleva tu carrusel, cuánto alcance puede tener tu post de LinkedIn y cuántos Pines publicar por semana.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Guía de formato y rendimiento en redes',
  h1: '¿Cómo publico en cada red para que rinda?',
  lede:
    'Arrancamos por la medición que ordena todo lo demás: tu engagement rate real, con el denominador correcto. Si tu duda es de formato —cuánto tiene que durar el video, cuántas slides lleva el carrusel, cuánto alcance esperar en LinkedIn o cuántos Pines por semana— la cambiás abajo.',
  stamps: [
    'Actualizado 28-07-2026',
    'Instagram, TikTok, LinkedIn y Pinterest',
    '6 calculadoras adentro',
    'Benchmarks de mercado, no datos oficiales',
  ],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué querés resolver?',
    intro:
      'Partimos por el engagement, que es la métrica con la que se mide todo lo demás. Si buscás otra cosa, cambiala.',
    items: [
      {
        id: 'engagement',
        label: 'Si mi contenido engancha o no',
        hint: 'Engagement rate',
        answer:
          'El engagement rate son las interacciones divididas por el denominador que elijas: sobre seguidores, más de 3% ya es bueno; sobre vistas o alcance, la vara sube y el promedio ronda 5% a 10%.',
        yes: [
          'Engagement rate sobre seguidores y sobre alcance o vistas, las dos versiones',
          'En qué franja caés y cuál es el promedio de referencia para el tamaño de tu cuenta',
          'La tasa de comentarios, que es la señal más difícil de inflar',
        ],
        warn: [
          DISCLAIMER,
          'El denominador cambia todo: el mismo posteo puede dar 4% sobre seguidores y 1,2% sobre alcance. Compará siempre contra la misma vara',
          'Un solo posteo no define tu cuenta: promediá al menos 9 o 12 publicaciones recientes y de más de 48 horas',
        ],
        plazo:
          'medí recién a las 48 o 72 horas de publicar, cuando el alcance se estabiliza. En TikTok un video puede seguir levantando vistas durante semanas.',
      },
      {
        id: 'duracion',
        label: 'Cuánto tiene que durar mi video de TikTok',
        hint: 'Segundos',
        answer:
          'Depende del objetivo: para viralidad conviene 7 a 15 segundos, y para cobrar por Creator Rewards el video tiene que superar los 60 segundos sí o sí.',
        yes: [
          'Duración recomendada y rango sano en segundos, según objetivo y nicho',
          'Si esa duración te deja adentro o afuera del mínimo de monetización',
          'Cuántos segundos suma o resta tu nicho respecto de la base',
        ],
        warn: [
          DISCLAIMER,
          'Los videos de menos de 60 segundos no califican para el programa de recompensas de TikTok, por más vistas que hagan',
          'Estirar un video para llegar al minuto sin contenido real baja la retención y termina costándote alcance',
        ],
        plazo:
          'probá la misma duración durante al menos 8 o 10 videos antes de sacar conclusiones: la varianza de un video solo es enorme.',
      },
      {
        id: 'carrusel',
        label: 'Cuántas slides lleva mi carrusel de Instagram',
        hint: 'Slides',
        answer:
          'Entre 3 y 10 slides según el objetivo: 3 a 5 para alcance o venta, 5 a 7 para que lo guarden y 7 a 10 para conversación.',
        yes: [
          'Cantidad óptima de slides y rango aceptable según objetivo y tipo de contenido',
          'La estructura sugerida: gancho, desarrollo y llamada a la acción',
          'Cuántas slides suma o resta tu formato respecto de la base del objetivo',
        ],
        warn: [
          DISCLAIMER,
          'El máximo del cálculo es 10 slides: más allá de ahí el abandono se come el llamado a la acción del final',
          'La slide 2 es el filtro real: si no pasan de ahí, la cantidad total de slides da lo mismo',
        ],
        plazo:
          'el carrusel sigue sumando alcance durante días porque Instagram lo puede volver a mostrar con otra portada: no lo juzgues en las primeras horas.',
      },
      {
        id: 'linkedin',
        label: 'Cuánto alcance puede tener mi post de LinkedIn',
        hint: 'Impresiones',
        answer:
          'El formato pesa más que el texto: una encuesta multiplica el alcance base por 1,8 y un artículo largo lo baja a 0,6.',
        yes: [
          'Impresiones estimadas según tus conexiones, tu engagement y el formato del posteo',
          'El multiplicador de alcance de cada formato',
          'Interacciones esperadas con ese alcance',
        ],
        warn: [
          DISCLAIMER,
          'Es un modelo simple sobre tu base de conexiones: no contempla la difusión fuera de tu red, que en LinkedIn puede multiplicar todo si el posteo prende',
          'Los links externos en el cuerpo del posteo suelen recortar el alcance: conviene dejarlos en el primer comentario',
        ],
        plazo:
          'un posteo de LinkedIn tiene vida larga: puede seguir sumando impresiones entre 24 y 72 horas después de publicado.',
      },
      {
        id: 'pinterest',
        label: 'Cuántos Pines publico por semana',
        hint: 'Cadencia',
        answer:
          'Repartí los Pines de la semana entre tus días de publicación y mirá cuántas semanas de cobertura te dan las piezas que ya tenés listas.',
        yes: [
          'Cuántos Pines por día te tocan para cumplir tu meta semanal',
          'Cuántas semanas de cobertura te dan las piezas que ya produjiste',
          'Cuántos Pines te faltan para cerrar la próxima semana',
        ],
        warn: [
          DISCLAIMER,
          'Una cuenta Business deja dejar programados hasta 10 Pines a futuro: el resto hay que publicarlo a mano o con una herramienta externa',
          'Publicar mucho de golpe y después desaparecer rinde peor que una cadencia sostenida y chica',
        ],
        plazo:
          'Pinterest es el buscador más lento de todos: un Pin puede tardar semanas o meses en levantar tráfico. Planificá en trimestres, no en días.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada caso usa los campos que le sirven; el resto podés dejarlos como están.',
  fields: [
    {
      id: 'red',
      label: 'Red social',
      type: 'select',
      value: 'instagram',
      options: [
        { value: 'instagram', label: 'Instagram' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'otra', label: 'Otra (X, Facebook, YouTube…)' },
      ],
      help: 'Define contra qué franja se compara tu engagement cuando lo medís sobre vistas.',
    },
    { id: 'seguidores', label: 'Seguidores', value: '25.000', thousands: true },
    { id: 'likes', label: 'Likes de la publicación', value: '900', thousands: true },
    { id: 'comentarios', label: 'Comentarios', type: 'number', min: 0, value: 45 },
    { id: 'compartidos', label: 'Compartidos', type: 'number', min: 0, value: 30 },
    { id: 'guardados', label: 'Guardados', type: 'number', min: 0, value: 60 },
    {
      id: 'alcance',
      label: 'Alcance, impresiones o vistas',
      value: '40.000',
      thousands: true,
      help: 'Dejalo en 0 si no tenés acceso a las estadísticas: el cálculo cae a la versión sobre seguidores.',
    },
    {
      id: 'objetivoVideo',
      label: 'Objetivo del video de TikTok',
      type: 'select',
      value: 'viralidad',
      options: [
        { value: 'viralidad', label: 'Viralidad / vistas máximas' },
        { value: 'monetizacion', label: 'Monetización (Creator Rewards)' },
        { value: 'engagement', label: 'Engagement y comentarios' },
        { value: 'mix', label: 'Mix balanceado' },
      ],
    },
    {
      id: 'nicho',
      label: 'Nicho del video',
      type: 'select',
      value: 'tutorial',
      options: [
        { value: 'humor', label: 'Humor' },
        { value: 'tutorial', label: 'Tutorial / educativo' },
        { value: 'cocina', label: 'Cocina / lifestyle' },
        { value: 'gaming', label: 'Gaming / reacciones' },
        { value: 'dance', label: 'Baile / música' },
        { value: 'storytelling', label: 'Storytelling' },
        { value: 'fitness', label: 'Fitness' },
        { value: 'negocios', label: 'Negocios / finanzas' },
      ],
    },
    {
      id: 'objetivoCarrusel',
      label: 'Objetivo del carrusel',
      type: 'select',
      value: 'saves',
      options: [
        { value: 'reach', label: 'Alcance / descubrimiento' },
        { value: 'saves', label: 'Que lo guarden (educativo)' },
        { value: 'engagement', label: 'Engagement (likes y comentarios)' },
        { value: 'venta', label: 'Venta / conversión' },
        { value: 'storytelling', label: 'Storytelling / narrativa' },
      ],
    },
    {
      id: 'tipoCarrusel',
      label: 'Tipo de contenido del carrusel',
      type: 'select',
      value: 'lista',
      options: [
        { value: 'tutorial', label: 'Tutorial paso a paso' },
        { value: 'lista', label: 'Lista / tips' },
        { value: 'antesdespues', label: 'Antes vs después' },
        { value: 'storytelling', label: 'Storytelling visual' },
        { value: 'producto', label: 'Producto / ecommerce' },
        { value: 'infografia', label: 'Infografía' },
      ],
    },
    { id: 'conexiones', label: 'Conexiones o seguidores en LinkedIn', value: '3.500', thousands: true },
    {
      id: 'erLinkedin',
      label: 'Tu engagement rate en LinkedIn',
      type: 'number',
      min: 0.1,
      max: 100,
      step: 0.1,
      value: 3,
      suffix: '%',
    },
    {
      id: 'formatoLinkedin',
      label: 'Formato del posteo de LinkedIn',
      type: 'select',
      value: 'documento',
      options: [
        { value: 'texto', label: 'Texto plano' },
        { value: 'imagen', label: 'Imagen' },
        { value: 'documento', label: 'Documento / carrusel' },
        { value: 'video', label: 'Video nativo' },
        { value: 'poll', label: 'Encuesta' },
        { value: 'articulo', label: 'Artículo largo' },
      ],
    },
    { id: 'pinesSemana', label: 'Pines por semana que querés publicar', type: 'number', min: 1, value: 14 },
    { id: 'diasPublicacion', label: 'Días de publicación por semana', type: 'number', min: 1, max: 7, value: 5 },
    { id: 'pinesListos', label: 'Pines ya producidos', type: 'number', min: 0, value: 20 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde caés',
    caption:
      'La barra ubica tu resultado dentro del rango de cada caso: las franjas de engagement, los segundos de video entre lo cortísimo y lo largo, las slides entre 3 y 10, el alcance de LinkedIn contra su techo razonable, o la cobertura que te dan los Pines que ya tenés.',
  },
  breakdownTitle: 'De dónde sale el número',
  breakdownIntro:
    'Acá no hay plata: cada fila muestra su unidad, sea porcentaje, segundos, slides, impresiones o Pines.',

  faq: [
    {
      q: '¿El engagement rate se calcula sobre seguidores o sobre alcance?',
      a: 'Las dos versiones existen y dan números muy distintos. Sobre seguidores es la que usan las agencias porque sólo necesita datos públicos: interacciones dividido seguidores por 100. Sobre alcance o vistas es la más honesta, porque mide a la gente que efectivamente vio el contenido, pero requiere entrar a las estadísticas de la cuenta. El hub calcula las dos y las compara contra franjas distintas, que es lo que casi nadie hace.',
    },
    {
      q: '¿Qué engagement rate es bueno en Instagram?',
      a: 'Medido sobre seguidores, por debajo de 1% es bajo, entre 1% y 3% es el rango normal, entre 3% y 6% es bueno y arriba de 6% es excelente. Pero eso se compara contra cuentas de tu tamaño: una cuenta de menos de 1.000 seguidores suele estar entre 5% y 8%, y una de más de un millón rara vez pasa el 1,5%.',
    },
    {
      q: '¿Por qué el engagement de TikTok se ve tan alto?',
      a: 'Porque en TikTok se mide habitualmente sobre vistas y no sobre seguidores, y un video se muestra a muchísima gente que no te sigue. Con ese denominador, el promedio ronda 5% a 10% y arriba de 15% ya es top. Comparar un 8% de TikTok sobre vistas contra un 3% de Instagram sobre seguidores no dice nada: son varas distintas.',
    },
    {
      q: '¿Los guardados cuentan como engagement?',
      a: 'En Instagram sí y bastante: guardar y compartir son las señales que más peso tienen para que la plataforma vuelva a mostrar el contenido, porque son más difíciles de conseguir que un like. El cálculo los suma al numerador. Si querés comparar contra un dato de agencia que sólo usa likes y comentarios, dejá guardados y compartidos en cero.',
    },
    {
      q: '¿Cuánto tiene que durar un video de TikTok?',
      a: 'Depende de para qué lo hacés. Si buscás alcance puro, entre 7 y 15 segundos maximizan el porcentaje de gente que lo mira entero, que es lo que más empuja el algoritmo. Si buscás cobrar, el video tiene que pasar los 60 segundos porque es el mínimo del programa de recompensas. Si buscás comentarios, la franja de 30 a 60 segundos da tiempo a contar algo. El nicho ajusta: un tutorial o un relato piden más segundos, el humor menos.',
    },
    {
      q: '¿Sirve de algo estirar el video para llegar al minuto?',
      a: 'No, si el minuto se rellena. El programa de recompensas mira duración y también retención y originalidad: un video estirado pierde retención, la plataforma lo distribuye menos y terminás con menos vistas totales aunque cada vista califique. Conviene subir de formato —contar algo más largo de verdad— y no alargar lo mismo.',
    },
    {
      q: '¿Cuántas slides tiene que tener un carrusel de Instagram?',
      a: 'Entre 3 y 10, según el objetivo. Para alcance o venta, 3 a 5: la gente decide rápido. Para contenido educativo que quieras que guarden, 5 a 7. Para conversación o narrativa, 7 a 10, porque el tiempo de permanencia es lo que empuja al carrusel. El tipo de contenido corrige: un antes y después necesita menos slides, un storytelling visual necesita más.',
    },
    {
      q: '¿Por qué la slide 2 importa tanto?',
      a: 'Porque es donde se decide si te leen. La primera es la portada y la ven todos; la segunda es la primera que exige un gesto, deslizar. Si esa no engancha, el llamado a la acción del final no lo ve nadie, tenga el carrusel 5 o 10 slides.',
    },
    {
      q: '¿Cuánto alcance puedo esperar en un post de LinkedIn?',
      a: 'El modelo parte de tus conexiones y de tu engagement histórico, y después aplica el multiplicador del formato: encuesta 1,8, documento o carrusel 1,6, video nativo 1,5, imagen 1,2, texto plano 1 y artículo largo 0,6. Es una estimación de piso sobre tu propia red: si el posteo prende y se difunde fuera de ella, el número real puede ser varias veces mayor.',
    },
    {
      q: '¿Por qué el artículo largo rinde menos que un posteo común?',
      a: 'Porque la plataforma prioriza en el feed el contenido que se consume dentro del feed. El artículo saca al lector a otra vista, así que se distribuye peor. A cambio se indexa en buscadores y suma para tu marca personal a largo plazo, que es otro objetivo. Por eso el multiplicador es 0,6 y no un castigo: es una decisión de canal.',
    },
    {
      q: '¿Cuántos Pines conviene publicar por semana?',
      a: 'Más importante que el número es la constancia. El cálculo reparte tu meta semanal entre los días que elegiste publicar y te dice cuántas semanas de cobertura te dan las piezas ya producidas. Como Pinterest funciona como buscador y no como feed, sostener una cadencia chica durante meses rinde mucho más que subir cincuenta Pines en un día.',
    },
    {
      q: '¿Cuántos Pines puedo dejar programados?',
      a: 'Una cuenta Pinterest Business permite dejar hasta 10 Pines programados a futuro desde la propia plataforma. Si tu plan semanal supera ese cupo, el excedente hay que publicarlo a mano o con una herramienta externa de programación.',
    },
    {
      q: '¿Estos benchmarks son datos oficiales de las plataformas?',
      a: 'No. Ninguna plataforma publica cuál es un buen engagement rate, cuánta duración conviene ni cuánto alcance vas a tener. Son consensos de mercado a partir de estudios sobre grandes volúmenes de publicaciones. Sirven para ubicarte y planificar. El dato que le gana a todos estos promedios es el de tus propias estadísticas.',
    },
    {
      q: '¿Y para cobrar? ¿Cuánto vale mi cuenta con este engagement?',
      a: 'Esa es otra pregunta y vive en otra página: el engagement que calculás acá es justamente el dato que se pide para estimar tarifas. En la guía de creador de contenido está la tarifa por post, reel o colaboración; en la de ingresos por plataforma, cuánto paga cada red por tus vistas.',
    },
  ],

  sources: [
    {
      name: 'Cómo leer las estadísticas de tu cuenta profesional',
      url: 'https://help.instagram.com/1533933820244654',
      publisher: 'Instagram Help Center',
    },
    {
      name: 'Creator Rewards Program: requisitos y duración mínima de video',
      url: 'https://support.tiktok.com/en/business-and-creator/creator-rewards-program',
      publisher: 'TikTok Support',
    },
    {
      name: 'Analytics de TikTok: vistas, retención e interacciones',
      url: 'https://support.tiktok.com/en/business-and-creator/creator-tools/analytics-in-tiktok',
      publisher: 'TikTok Support',
    },
    {
      name: 'Cómo funciona el feed de LinkedIn y qué distribuye',
      url: 'https://www.linkedin.com/help/linkedin/answer/a521624',
      publisher: 'LinkedIn Help',
    },
    {
      name: 'Programar Pines desde una cuenta Pinterest Business',
      url: 'https://help.pinterest.com/en/business/article/schedule-pins',
      publisher: 'Pinterest Business Help',
    },
  ],

  replaces: [
    '/calculadora-engagement-rate-redes-sociales',
    '/calculadora-tiktok-engagement-rate',
    '/calculadora-tiktok-duracion-optima-video',
    '/calculadora-instagram-carrousel-slides-optimas',
    '/calculadora-linkedin-posts-alcance',
    '/calculadora-pinterest-calendario-pines',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
};
