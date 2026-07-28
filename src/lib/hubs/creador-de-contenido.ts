import type { HubData } from './types';
import dolar from '../../data/live/dolar.json';

/**
 * Hub de decisión — "¿Cuánto vale mi cuenta y cuánto puedo cobrar?"
 *
 * Absorbe 4 calculadoras de creador de contenido (ver `replaces`).
 *
 * ── Criterio de UNIDADES (importante, este hub mezcla cuatro) ──────────────
 * El hub muestra porcentajes (engagement), horas (mejor momento para publicar),
 * DÓLARES (tarifa de colaboración y regalías de streaming) y pesos (sólo como
 * equivalencia informativa). El runtime formatea en pesos por defecto y hace
 * `Object.assign`, así que TODA fila que no sea plata argentina declara su
 * `format` propio.
 *
 * Las filas en dólares usan `format: 'unit'` + `unit: 'USD'` — no `'ars'` — para
 * que nunca se impriman con "$" y se lean como pesos. Las tarifas de influencer
 * de la fórmula vieja (`influencer-tarifa-estimada.ts`) están expresadas en
 * dólares por cada 1.000 seguidores (60–150 por cada 1.000), que es el estándar
 * de mercado internacional, pero la calculadora vieja las mostraba con un "$"
 * pelado: leídas como pesos daban importes absurdos (un reel de una cuenta de
 * 25.000 seguidores "valía" $2.600). Acá se unifica el criterio: tarifa y
 * regalías van en USD explícito, y se agrega una fila de equivalencia en pesos
 * al dólar oficial de `src/data/live/dolar.json`.
 */

/** Dólar oficial (venta) del feed vivo, para la equivalencia en pesos. */
export const USD_ARS: number = (dolar as any).quotes?.oficial?.venta ?? 0;

/** Tarifa base en USD por cada 1.000 seguidores. Espejo de influencer-tarifa-estimada.ts */
export const BASE_RATE_PER_1K: Record<string, Record<string, number>> = {
  instagram: { post: 60, reel: 80, video: 100, story: 25 },
  tiktok: { post: 50, reel: 70, video: 90, story: 20 },
  youtube: { post: 50, reel: 60, video: 150, story: 25 },
};

/** Franjas UTC de mayor y menor alcance por plataforma. Espejo de mejor-hora-publicar.ts */
export const HORAS_UTC: Record<string, { mejor: number[]; peor: number[]; dias: string }> = {
  instagram: { mejor: [11, 13, 19], peor: [2, 3, 4], dias: 'Martes, Miércoles y Jueves' },
  tiktok: { mejor: [10, 14, 21], peor: [3, 4, 5], dias: 'Martes, Jueves y Viernes' },
  youtube: { mejor: [14, 16, 20], peor: [1, 2, 3], dias: 'Jueves, Viernes y Sábado' },
  linkedin: { mejor: [8, 10, 12], peor: [22, 23, 0], dias: 'Martes, Miércoles y Jueves' },
  twitter: { mejor: [9, 12, 17], peor: [1, 2, 3], dias: 'Lunes, Martes y Miércoles' },
  facebook: { mejor: [9, 13, 16], peor: [23, 0, 1], dias: 'Miércoles, Jueves y Viernes' },
};

/** Revenue per stream promedio por mercado, en USD. Espejo de regalias-spotify-pais.ts */
export const RPS: Record<string, number> = {
  US: 0.0037,
  UK: 0.005,
  AR: 0.0012,
  ES: 0.0029,
  MX: 0.0015,
  BR: 0.0011,
  DE: 0.0042,
  FR: 0.0034,
  IT: 0.0031,
  CA: 0.0038,
  AU: 0.0041,
  promedio: 0.0028,
};

/** Comisión del distribuidor como % del bruto. Espejo de regalias-spotify-pais.ts */
export const DIST_PCT: Record<string, number> = {
  distrokid: 0, // cobra abono anual, no porcentaje
  cdbaby: 9,
  tunecore: 0, // 0% pero con abono
  amuse: 0, // plan gratuito
  directo: 0,
};

/** Promedio de engagement de referencia por tamaño de cuenta, en %. */
export const BENCH_ER: Array<{ max: number; label: string; min: number; top: number }> = [
  { max: 1000, label: 'Nano (menos de 1K)', min: 5, top: 8 },
  { max: 10000, label: 'Micro (1K a 10K)', min: 3, top: 5 },
  { max: 100000, label: 'Medio (10K a 100K)', min: 1.5, top: 3 },
  { max: 1000000, label: 'Macro (100K a 1M)', min: 1, top: 2 },
  // Ojo: nada de Infinity acá — este objeto viaja por define:vars y JSON lo
  // serializa como null, rompiendo la comparación.
  { max: 1e15, label: 'Mega (más de 1M)', min: 0.5, top: 1.5 },
];

const DISCLAIMER_NEGOCIOS =
  'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.';

export const hub: HubData = {
  slug: 'negocios/creador-de-contenido',
  title: '¿Cuánto vale mi cuenta y cuánto puedo cobrar? — Engagement, tarifas y regalías',
  description:
    'Calculá tu engagement rate real, la tarifa que podés pedir por un post o una colaboración, la mejor hora para publicar en cada plataforma y cuánto te dejan tus streams en Spotify según el país.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Guía y estimación para creadores',
  h1: '¿Cuánto vale tu cuenta y cuánto podés cobrar?',
  lede:
    'Arrancamos por lo primero que te pregunta una marca: tu engagement. Con ese número salen la tarifa que podés pedir, cuándo conviene publicar y cuánto te dejan tus streams. Si tu duda es otra, cambiala abajo.',
  stamps: ['Actualizado 27-07-2026', 'Tarifas de mercado en USD', '4 calculadoras adentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué querés saber?',
    intro: 'Partimos por el engagement, que es la base de todo lo demás. Si buscás otra cosa, cambialo.',
    items: [
      {
        id: 'engagement',
        label: 'Si mi cuenta engancha o no',
        hint: 'Engagement rate',
        answer:
          'El engagement rate es interacciones sobre seguidores: por debajo de 1% es bajo y arriba de 3% ya es bueno en Instagram.',
        yes: [
          'Likes, comentarios y compartidos sobre tu cantidad de seguidores',
          'El promedio de referencia según el tamaño de tu cuenta',
          'Cuántas interacciones te faltan para llegar a ese promedio',
        ],
        warn: [
          'El promedio de referencia por tamaño es un consenso de mercado, no un dato publicado por Instagram: sirve para ubicarte, no para discutir un contrato',
          'Un solo post no define tu cuenta: promediá al menos 9 o 12 publicaciones recientes',
        ],
        plazo: 'medilo siempre sobre publicaciones de más de 48 horas, cuando el alcance ya se estabilizó.',
      },
      {
        id: 'tarifa',
        label: 'Cuánto cobrar por un post o una colaboración',
        hint: 'Tarifa en USD',
        answer:
          'La referencia de mercado arranca en 60 a 100 dólares por cada 1.000 seguidores, ajustada por tu engagement y por el tamaño de la cuenta.',
        yes: [
          'Tarifa base por cada 1.000 seguidores según plataforma y formato',
          'Prima o castigo según tu engagement rate real',
          'Piso y techo del rango para negociar, y el costo por interacción (CPE)',
        ],
        warn: [
          DISCLAIMER_NEGOCIOS,
          'No es un tarifario oficial: ninguna plataforma publica precios. Son promedios de mercado y varían muchísimo por rubro, país y exclusividad',
          'Está en DÓLARES. La equivalencia en pesos usa el dólar oficial y cambia todos los días',
        ],
        plazo: 'antes de cerrar, definí por escrito usos, plazo de permanencia y si la marca puede pautar tu contenido.',
      },
      {
        id: 'horario',
        label: 'A qué hora me conviene publicar',
        hint: 'Ventana local',
        answer:
          'Cada plataforma tiene franjas de mayor alcance; el cálculo las pasa a tu zona horaria.',
        yes: [
          'Las tres franjas de mayor alcance de la plataforma, en tu hora local',
          'Los días de la semana que mejor rinden',
          'La franja muerta que conviene evitar',
        ],
        warn: [
          'Son promedios agregados de estudios de mercado, no tus datos: la ventana real de TU audiencia está en las estadísticas de tu cuenta',
          'Si tu público está en otro país, la hora que importa es la de ellos, no la tuya',
        ],
        plazo: 'probá una misma franja durante 3 o 4 semanas antes de sacar conclusiones.',
      },
      {
        id: 'regalias',
        label: 'Cuánto me dejan mis streams',
        hint: 'Regalías en USD',
        answer:
          'No hay un precio por stream: el pago sale de repartir un pozo por mercado, y el promedio va de 0,0011 a 0,005 dólares.',
        yes: [
          'Ingreso bruto según el revenue per stream promedio del mercado que elegiste',
          'Comisión del distribuidor y del sello o manager',
          'Cuántos streams necesitás para llegar a 1.000 dólares',
        ],
        warn: [
          DISCLAIMER_NEGOCIOS,
          'Spotify no paga un precio fijo por reproducción: reparte un pozo de ingresos entre los titulares de derechos, así que el valor por stream cambia todos los meses',
          'Está en DÓLARES y es el ingreso de la grabación: la parte de composición y edición se liquida aparte',
        ],
        plazo: 'las liquidaciones llegan con dos o tres meses de demora respecto del mes reproducido.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada caso usa los campos que le sirven; el resto podés dejarlos como están.',
  fields: [
    { id: 'seguidores', label: 'Seguidores', value: '25.000', thousands: true },
    { id: 'likes', label: 'Likes promedio por publicación', value: '900', thousands: true },
    { id: 'comentarios', label: 'Comentarios promedio', type: 'number', min: 0, value: 45 },
    { id: 'compartidos', label: 'Compartidos o guardados promedio', type: 'number', min: 0, value: 30 },
    {
      id: 'plataforma',
      label: 'Plataforma',
      type: 'select',
      value: 'instagram',
      options: [
        { value: 'instagram', label: 'Instagram' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'twitter', label: 'X (Twitter)' },
        { value: 'facebook', label: 'Facebook' },
      ],
      help: 'LinkedIn, X y Facebook tienen franjas horarias propias; para la tarifa se usa la referencia de Instagram.',
    },
    {
      id: 'tipo',
      label: 'Formato del contenido',
      type: 'select',
      value: 'reel',
      options: [
        { value: 'post', label: 'Post de feed' },
        { value: 'reel', label: 'Reel o short' },
        { value: 'video', label: 'Video largo o integración' },
        { value: 'story', label: 'Historia' },
      ],
    },
    {
      id: 'gmt',
      label: 'Tu huso horario (GMT)',
      type: 'number',
      min: -12,
      max: 14,
      value: -3,
      help: 'Argentina es GMT-3. España peninsular en verano es GMT+2, México central GMT-6.',
    },
    { id: 'streams', label: 'Streams del período', value: '100.000', thousands: true },
    {
      id: 'mercado',
      label: 'Mercado donde te escuchan',
      type: 'select',
      value: 'AR',
      options: [
        { value: 'AR', label: 'Argentina' },
        { value: 'MX', label: 'México' },
        { value: 'BR', label: 'Brasil' },
        { value: 'ES', label: 'España' },
        { value: 'US', label: 'Estados Unidos' },
        { value: 'UK', label: 'Reino Unido' },
        { value: 'DE', label: 'Alemania' },
        { value: 'FR', label: 'Francia' },
        { value: 'IT', label: 'Italia' },
        { value: 'CA', label: 'Canadá' },
        { value: 'AU', label: 'Australia' },
        { value: 'promedio', label: 'Mezcla global (promedio)' },
      ],
    },
    {
      id: 'distribuidor',
      label: 'Distribuidor',
      type: 'select',
      value: 'distrokid',
      options: [
        { value: 'distrokid', label: 'DistroKid (abono anual, 0%)' },
        { value: 'tunecore', label: 'TuneCore (abono anual, 0%)' },
        { value: 'amuse', label: 'Amuse (plan gratuito, 0%)' },
        { value: 'cdbaby', label: 'CD Baby (9%)' },
        { value: 'directo', label: 'Contrato directo (0%)' },
      ],
    },
    {
      id: 'sello',
      label: 'Comisión de sello o manager',
      type: 'number',
      min: 0,
      max: 100,
      value: 0,
      suffix: '%',
    },
  ],
  fineprint: DISCLAIMER_NEGOCIOS,

  chart: {
    type: 'scale',
    title: 'Dónde caés',
    caption:
      'La barra ubica tu resultado dentro del rango que corresponde a cada caso: las franjas de engagement, el rango de tarifa que podés negociar, las 24 horas del día o el valor por stream de los distintos mercados.',
  },
  breakdownTitle: 'De dónde sale el número',
  breakdownIntro: 'Cada fila muestra su unidad: los porcentajes y las horas no son pesos, y las tarifas van en dólares.',

  faq: [
    {
      q: '¿Cómo se calcula el engagement rate?',
      a: 'Se suman likes, comentarios y compartidos de una publicación y se dividen por la cantidad de seguidores, multiplicado por 100. Es la definición más usada por las agencias porque sólo necesita datos públicos. Si tenés acceso a las estadísticas de la cuenta, la versión más honesta divide por el alcance real en lugar de por los seguidores.',
    },
    {
      q: '¿Qué engagement rate es bueno?',
      a: 'En Instagram, por debajo de 1% es bajo, entre 1% y 3% es el rango normal, entre 3% y 6% es bueno y arriba de 6% es excelente. Pero el número se compara contra cuentas de tu tamaño: una cuenta de menos de 1.000 seguidores suele estar entre 5% y 8%, y una de más de un millón rara vez pasa el 1,5%.',
    },
    {
      q: '¿Las tarifas de este hub son un tarifario oficial?',
      a: 'No. Ninguna plataforma ni cámara publica precios de colaboraciones. Son promedios de mercado: una referencia para no pedir de menos ni quedar fuera de presupuesto. El precio real lo definen tu nicho, el país de la marca, la exclusividad, la cesión de derechos y si la marca va a pautar tu contenido.',
    },
    {
      q: '¿Por qué la tarifa está en dólares y no en pesos?',
      a: 'Porque la referencia de mercado se construye en dólares por cada 1.000 seguidores y así se negocia con agencias regionales. Mostramos también la equivalencia en pesos al dólar oficial, pero es informativa: cambia todos los días y no es el tipo de cambio al que vas a cobrar.',
    },
    {
      q: '¿Cuánto se cobra por 1.000 seguidores?',
      a: 'La referencia arranca en unos 60 dólares por cada 1.000 seguidores para un post de feed en Instagram, 80 para un reel y 100 para un video. En TikTok es algo menor y en YouTube el video largo integrado es el formato mejor pago. Después el número se ajusta: engagement alto suma hasta 50%, engagement flojo recorta 30%, las cuentas chicas cobran una prima por seguidor y las muy grandes cobran menos por seguidor aunque más en total.',
    },
    {
      q: '¿Qué es el CPE y para qué me sirve?',
      a: 'Es el costo por interacción: la tarifa dividida por las interacciones que se esperan de la publicación. Es el número con el que una marca compara tu propuesta contra la de otro creador, así que te conviene conocerlo antes de sentarte a negociar.',
    },
    {
      q: '¿La mejor hora para publicar es real o es un mito?',
      a: 'Las franjas son promedios agregados de estudios sobre millones de publicaciones, no una regla física. Sirven como punto de partida cuando todavía no tenés datos propios. Apenas tengas unas decenas de publicaciones, las estadísticas de tu cuenta te van a decir cuándo está despierta TU audiencia, y ese dato le gana a cualquier promedio.',
    },
    {
      q: '¿Cuánto paga Spotify por stream?',
      a: 'No hay un precio por stream. Spotify junta los ingresos de suscripciones y publicidad de cada mercado y los reparte entre los titulares de derechos según la proporción de reproducciones. Por eso el valor por stream cambia mes a mes y país a país: el promedio va de unos 0,0011 dólares en Brasil a 0,005 en el Reino Unido.',
    },
    {
      q: '¿Por qué mis streams de Argentina pagan tanto menos?',
      a: 'Porque el pozo se arma con lo que factura la plataforma en cada mercado, y una suscripción argentina cuesta una fracción de una británica. El promedio local ronda los 0,0012 dólares por reproducción: para llegar a 1.000 dólares hacen falta más de 800.000 streams.',
    },
    {
      q: '¿Cuánto se queda el distribuidor?',
      a: 'Depende del modelo. DistroKid, TuneCore y Amuse en su plan base no toman porcentaje: cobran un abono anual o son gratuitos, así que el 100% de la regalía llega al artista menos ese costo fijo. CD Baby retiene alrededor del 9% en su plan estándar. Si además tenés sello o manager, ese porcentaje se descuenta después.',
    },
    {
      q: '¿Las regalías de este cálculo incluyen todo lo que genera una canción?',
      a: 'No. Es la regalía de la grabación, que cobra quien es dueño del máster. La parte de composición y edición (los derechos de autor) se liquida por separado a través de la sociedad de gestión y del editor, y llega por otro canal y en otros plazos.',
    },
    {
      q: '¿Sirve para YouTube, TikTok o LinkedIn además de Instagram?',
      a: 'El engagement rate y las franjas horarias funcionan en las seis plataformas del selector. La tarifa de referencia está construida para Instagram, TikTok y YouTube; si elegís LinkedIn, X o Facebook el cálculo usa la referencia de Instagram, que es la más cercana en formato de feed.',
    },
  ],

  sources: [
    {
      name: 'Loud & Clear — cómo se reparten las regalías por mercado',
      url: 'https://loudandclear.byspotify.com/',
      publisher: 'Spotify',
    },
    {
      name: 'How we pay royalties — el modelo de pozo prorrateado, no de precio por stream',
      url: 'https://artists.spotify.com/help/article/how-we-pay-royalties',
      publisher: 'Spotify for Artists',
    },
    {
      name: 'Planes y comisiones de distribución digital',
      url: 'https://cdbaby.com/pricing',
      publisher: 'CD Baby',
    },
    {
      name: 'Cómo leer las estadísticas de tu cuenta profesional',
      url: 'https://help.instagram.com/1533933820244654',
      publisher: 'Instagram Help Center',
    },
    {
      name: 'Cotización del dólar oficial usada para la equivalencia en pesos',
      url: 'https://dolarapi.com/v1/dolares',
      publisher: 'DolarAPI',
      date: (dolar as any)._meta?.fetchedAt?.slice(0, 10) ?? '',
    },
  ],

  replaces: [
    '/calculadora-engagement-rate-instagram',
    '/calculadora-influencer-tarifa-estimada',
    '/calculadora-mejor-hora-publicar',
    '/calculadora-regalias-spotify-por-pais-streams-dolares',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-instagram-rate-card-por-followers',
    '/calculadora-instagram-influencer-pago-historia',
    '/calculadora-tarifario-creador-contenido-multiplataforma',
    '/calculadora-ugc-tarifa-contenido-marca',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
