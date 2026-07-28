import type { HubData } from './types';
import dolar from '../../data/live/dolar.json';

/**
 * Hub de decisión — "¿Cuánto me paga cada plataforma por mis views?"
 *
 * Absorbe 13 calculadoras sueltas de monetización de audiencia (ver `replaces`):
 * YouTube (CPM por nicho, ingresos por país, Shorts, requisitos del YPP),
 * Facebook (video y bonus de Reels), TikTok Live (diamantes), Twitch (bits,
 * donaciones, subs y requisitos de Partner), X y blog con AdSense.
 *
 * ── Criterio de UNIDADES (crítico) ────────────────────────────────────────
 * Prácticamente TODO este hub está en DÓLARES: los CPM, los RPM, el valor del
 * diamante, el del bit y el mínimo de retiro son tarifas en USD de plataformas
 * de Estados Unidos. El runtime formatea en pesos por defecto y hace
 * `Object.assign`, así que TODA fila declara su `format` propio:
 *   - plata de plataforma  → `format:'unit'` + `unit:'USD'`
 *   - cantidades y ratios  → `format:'plain'` o `'unit'` con su unidad
 *   - equivalencia local   → `format:'ars'` (única fila en pesos por rama)
 * Las calculadoras viejas mezclaban: `youtube-cpm-por-nicho` imprimía dólares
 * con un "$" pelado y separador es-AR, y `facebook-reels-bonus-pagos` escribía
 * "$12.34 USD". Acá se unifica: USD explícito y una fila de equivalencia en
 * pesos al dólar oficial de `src/data/live/dolar.json`.
 *
 * ── De dónde salen los números ────────────────────────────────────────────
 * Todas las constantes de abajo son COPIA FIEL de las fórmulas del repo. No hay
 * ni un CPM inventado.
 */

/** Dólar oficial (venta) del feed vivo, sólo para la equivalencia en pesos. */
export const USD_ARS: number = (dolar as any).quotes?.oficial?.venta ?? 0;

/**
 * CPM bruto del anunciante por nicho, en USD.
 * Copia fiel de `src/lib/formulas/youtube-cpm-por-nicho.ts`.
 */
export const YT_CPM_NICHO: Record<string, number> = {
  finanzas: 25,
  tech: 20,
  salud: 10,
  educacion: 8,
  viajes: 7,
  lifestyle: 6,
  cocina: 5,
  gaming: 4,
  entretenimiento: 3.5,
  musica: 2.5,
  infantil: 1.2,
};

/** Etiquetas legibles de los nichos, espejo del mapa NICHO_ES de la fórmula. */
export const YT_NICHO_LABEL: Record<string, string> = {
  finanzas: 'Finanzas e inversiones',
  tech: 'Tecnología',
  salud: 'Salud',
  educacion: 'Educación',
  viajes: 'Viajes',
  lifestyle: 'Lifestyle',
  cocina: 'Cocina',
  gaming: 'Gaming',
  entretenimiento: 'Entretenimiento',
  musica: 'Música',
  infantil: 'Infantil',
};

/** Reparto del Programa de Socios: 55% para el creador, 45% para YouTube. */
export const YT_REV_SHARE = 0.55;

/**
 * CPM bruto por tier de país, en USD.
 * Copia fiel de `src/lib/formulas/youtube-ingresos-vistas-pais.ts`.
 */
export const YT_CPM_TIER = { t1: 12, t2: 5, t3: 1.5 };

/** Requisitos del Programa de Socios de YouTube (vía horas de reproducción). */
export const YPP = { subs: 1000, horas: 4000, vistasShorts: 10000000 };

/** Penalización de Facebook al Reel re-subido: cobra el 40%. Copia de `facebook-reels-bonus-pagos.ts`. */
export const REELS_ORIGINAL = 1.0;
export const REELS_RESUBIDO = 0.4;

/** TikTok Live: valor del diamante y mínimo de retiro, en USD. Copia de `tiktok-live-diamonds-dolares.ts`. */
export const TIKTOK = { valorDiamante: 0.005, retiroMinimo: 100, diamantesGalaxia: 500, diamantesLeon: 15000 };

/**
 * Twitch: valor del bit, comisión de pasarela sobre donaciones directas,
 * mínimo de retiro y umbrales de Partner.
 * Copia de `twitch-bits-donaciones-dolares.ts` y `twitch-horas-para-partner.ts`.
 */
export const TWITCH = {
  valorBit: 0.01,
  netoDonacion: 0.97,
  retiroMinimo: 100,
  partnerViewers: 75,
  partnerHoras: 25,
  partnerDias: 12,
};

/** RPM base de AdSense por nicho, en USD por cada 1.000 visitas. Copia de `blog-adsense-rpm-nicho.ts`. */
export const ADSENSE_RPM_NICHO: Record<string, number> = {
  'Seguros': 40,
  'Finanzas / inversiones': 30,
  'Legal': 25,
  'Salud / medicina': 20,
  'Tecnología / SaaS': 8,
  'Educación / cursos': 7,
  'Hogar / DIY': 7,
  'Viajes': 7,
  'Entretenimiento / cultura': 3.5,
  'Lifestyle / blogging': 2.5,
};

/** Multiplicador del RPM según el país del tráfico. Copia de `blog-adsense-rpm-nicho.ts`. */
export const ADSENSE_MULT_PAIS: Record<string, number> = {
  'EEUU': 1.0,
  'Canadá / UK / Australia': 0.85,
  'Europa occidental': 0.65,
  'España': 0.45,
  'México / Argentina / Chile': 0.25,
  'Brasil': 0.25,
  'India / SEA': 0.15,
};

/**
 * X (Twitter): USD por cada millón de impresiones, con Premium y con Premium+.
 * Copia fiel de `twitter-x-monetizacion-ingreso.ts`.
 */
export const X_RPM: Record<string, { premium: number; premiumPlus: number }> = {
  'Finanzas / trading': { premium: 5, premiumPlus: 8 },
  'Negocios / marketing B2B': { premium: 4, premiumPlus: 6.5 },
  'Tech / SaaS': { premium: 3, premiumPlus: 5 },
  'Política / opinión': { premium: 1.5, premiumPlus: 2.5 },
  'Deportes': { premium: 1.5, premiumPlus: 2.5 },
  'Gaming': { premium: 1.2, premiumPlus: 2 },
  'Entretenimiento / memes': { premium: 1, premiumPlus: 1.5 },
  'Lifestyle': { premium: 0.75, premiumPlus: 1.5 },
};

/** Costo mensual de la suscripción de X, en USD. Copia de la fórmula vieja. */
export const X_COSTO_MES = { premium: 8, premiumPlus: 16 };

export const MESES_ANIO = 12;

/** Disclaimer textual del dominio `business` de src/lib/disclaimers.ts. */
const DISCLAIMER =
  'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.';

export const hub: HubData = {
  slug: 'negocios/ingresos-por-plataforma',
  title: '¿Cuánto me paga cada plataforma por mis views? Calculadora de monetización',
  description:
    'YouTube, Shorts, Facebook Reels, TikTok Live, Twitch, X y blog con AdSense: cuánto paga cada una por las mismas vistas, cuánto queda después de la comisión y qué requisitos hay que cumplir para empezar a cobrar. En dólares, con equivalencia en pesos.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Monetización de audiencia',
  h1: '¿Cuánto me paga cada plataforma por mis views?',
  lede:
    'La misma vista vale distinto en cada lado: un millón de vistas puede ser 10 dólares en Shorts o 4.000 en un canal de finanzas con audiencia de Estados Unidos. Lo que decide no es el volumen, es el RPM: el nicho, el país de quien mira y el porcentaje que se queda la plataforma.',
  stamps: ['Actualizado 27-07-2026', 'Tarifas en USD', '13 calculadoras adentro'],

  resultLabel: 'Ingreso mensual estimado',

  cases: {
    title: '¿Por dónde monetizás?',
    intro:
      'Cada rama usa la tarifa real de su plataforma. Si publicás en varias, mirá una por una y sumá: casi ningún creador vive de un solo formato.',
    items: [
      {
        id: 'video',
        label: 'Video largo: YouTube y Facebook',
        hint: 'Publicidad sobre el reproductor',
        answer:
          'En video largo cobrás el 55% del CPM que paga el anunciante, y ese CPM depende del nicho y del país de quien mira, no de cuántas vistas tengas.',
        yes: [
          DISCLAIMER,
          'CPM del nicho: lo que paga el anunciante por cada mil impresiones de anuncio, de 1,20 dólares en infantil a 25 en finanzas',
          'Reparto del Programa de Socios: 55% para vos, 45% para YouTube',
          'Fill rate: qué porcentaje de tus vistas llega a tener anuncio (nunca es el 100%)',
          'Mezcla de países: el Tier 1 paga alrededor de ocho veces más que el Tier 3 por la misma vista',
          'RPM efectivo: lo que te queda por cada mil vistas después de todo lo anterior',
          'La misma cuenta para Facebook, con el RPM que veas en tu propio panel de Meta',
        ],
        warn: [
          'El CPM que muestra el panel es el del anunciante, no el tuyo: tu RPM siempre es bastante menor',
          'El fill rate cae fuerte en contenido marcado como no apto para todos los anunciantes, y ahí el RPM se desploma sin que baje ni una vista',
          'Meta no publica una tarifa fija de video: el número de Facebook sólo vale con el RPM real de tu panel, no con un promedio de internet',
          'El RPM es estacional: enero suele ser el peor mes del año y diciembre el mejor, con diferencias de más del 50%',
          'Cambiar de nicho pesa más que duplicar las vistas: pasar de música a finanzas multiplica el RPM por diez',
        ],
        plazo:
          'YouTube paga entre el 21 y el 26 de cada mes, por lo generado en el mes anterior, y sólo si superaste el umbral de 100 dólares.',
      },
      {
        id: 'cortos',
        label: 'Formatos cortos: Shorts y Reels',
        hint: 'Volumen enorme, RPM mínimo',
        answer:
          'Los formatos cortos pagan entre 0,03 y 0,20 dólares por cada mil vistas: hacen falta millones de views para que la cuenta dé algo.',
        yes: [
          DISCLAIMER,
          'RPM de cortos: el que figura en tu panel, casi siempre menor a 0,20 dólares por cada mil vistas',
          'Cuántas vistas necesitás para juntar mil dólares con ese RPM',
          'Bonus de Reels de Facebook con las mismas vistas',
          'Penalización por contenido re-subido: el Reel que ya publicaste en otra red cobra el 40%',
        ],
        warn: [
          DISCLAIMER,
          'El RPM de cortos es entre veinte y cien veces menor que el de video largo: no compares vistas con vistas, compará ingresos',
          'Meta penaliza el contenido re-subido de TikTok o Instagram, incluso con la marca de agua borrada',
          'Los programas de bonus son por invitación y por tiempo limitado: aparecen y desaparecen sin aviso, y no se pueden presupuestar',
          'Los cortos casi no generan suscriptores que después miren video largo: el arrastre entre formatos es mucho menor de lo que promete el discurso',
        ],
        plazo:
          'los bonus de Meta se liquidan por ciclo mensual y hay que aceptar el programa antes de que arranque el ciclo.',
      },
      {
        id: 'vivo',
        label: 'En vivo y propinas: TikTok y Twitch',
        hint: 'Diamantes, bits, donaciones y subs',
        answer:
          'En vivo no cobrás por vista sino por regalo, y entre lo que paga tu público y lo que te llega hay una comisión que puede superar la mitad.',
        yes: [
          DISCLAIMER,
          'Diamantes de TikTok a 0,005 dólares cada uno, menos la comisión que retienen TikTok y la tienda de aplicaciones',
          'Bits de Twitch a un centavo de dólar cada uno, ya con la parte de Twitch descontada',
          'Donaciones directas por pasarela, con alrededor de un 3% de comisión',
          'Ingreso neto de suscripciones del canal, tal como te lo liquida Twitch',
          'Mínimo de retiro de 100 dólares en las dos plataformas',
        ],
        warn: [
          DISCLAIMER,
          'El regalo que tu público paga 10 dólares te deja mucho menos: entre la tienda de aplicaciones y la plataforma se va cerca de la mitad',
          'El saldo por debajo del mínimo de retiro queda retenido y se arrastra al mes siguiente: no se pierde, pero no lo cobrás',
          'El ingreso en vivo es el más volátil de todos: depende de un puñado de donantes recurrentes, y si se van tu mes se cae a la mitad',
          'Las propinas y regalos son ingreso gravado como cualquier otro, aunque la plataforma no te emita comprobante local',
        ],
        plazo:
          'Twitch liquida a 15 días del cierre del mes y TikTok tiene una ventana de retiro que se abre unos días después del cierre del ciclo.',
      },
      {
        id: 'texto',
        label: 'Texto y display: blog con AdSense y X',
        hint: 'Lo que rinde por lectura, no por vista',
        answer:
          'En blog y en X mandan el nicho y el país: un blog de seguros con tráfico de Estados Unidos rinde más de cien veces por visita que uno de lifestyle con tráfico de la India.',
        yes: [
          DISCLAIMER,
          'RPM de AdSense por nicho, de 2,50 dólares en lifestyle a 40 en seguros por cada mil visitas',
          'Ajuste por país del tráfico: lo de Estados Unidos vale cuatro veces lo de Argentina o México',
          'Ingreso de X por cada millón de impresiones, según nicho y tipo de suscripción',
          'Costo de la suscripción Premium descontado del resultado: sin ella no cobrás',
        ],
        warn: [
          DISCLAIMER,
          'En X la suscripción se paga sí o sí: con poco alcance el programa te deja en rojo antes de empezar',
          'El RPM de AdSense que ves en foros es de blogs con tráfico de Estados Unidos: con tráfico hispanoamericano dividí por cuatro',
          'Las redes premium de publicidad exigen mínimos de tráfico y suelen pagar entre dos y tres veces más que AdSense, pero recién a partir de decenas de miles de visitas mensuales',
          'El programa de reparto de X paga por impresiones de usuarios verificados, no por impresiones totales: el número real suele quedar por debajo de esta estimación',
        ],
        plazo:
          'AdSense paga entre el 21 y el 26 del mes siguiente al que se generó, con umbral mínimo de 100 dólares; X liquida cada dos semanas con umbral de 10 dólares.',
      },
      {
        id: 'requisitos',
        label: 'Todavía no puedo cobrar: qué me falta',
        hint: 'Requisitos de YouTube y de Twitch',
        answer:
          'Para monetizar en YouTube hacen falta 1.000 suscriptores y 4.000 horas de reproducción en doce meses; para ser Partner de Twitch, 75 espectadores promedio, 25 horas y 12 días distintos en 30 días.',
        yes: [
          DISCLAIMER,
          'Cuántos suscriptores y cuántas horas te faltan para el Programa de Socios de YouTube',
          'Cuál de los dos requisitos es tu cuello de botella real, y en cuántos meses llegás a tu ritmo actual',
          'Los tres umbrales de Twitch Partner y cuánto te falta de cada uno',
          'Alternativa de Shorts: 1.000 suscriptores más 10 millones de vistas de Shorts en 90 días',
        ],
        warn: [
          DISCLAIMER,
          'Las 4.000 horas se cuentan sobre los últimos 12 meses, así que también se pierden: si bajás el ritmo, el contador retrocede',
          'En Twitch los espectadores promedio son el freno real, no las horas: sumar horas de stream sin público no te acerca a Partner',
          'Cumplir los umbrales habilita a postular, no garantiza la aprobación: hay una revisión manual de la política de contenido',
          'La proyección lineal es optimista: el crecimiento de un canal casi nunca es constante, y los primeros mil suscriptores son los más lentos',
        ],
        plazo:
          'la revisión del Programa de Socios de YouTube suele tardar alrededor de un mes desde que se postula.',
      },
    ],
  },

  inputsTitle: 'Cargá tus números',
  inputsIntro:
    'Cada rama usa los campos que le sirven; los demás podés dejarlos como están. Todos los importes de plataforma son en dólares.',
  fields: [
    {
      id: 'vistas',
      label: 'Vistas mensuales de video largo',
      type: 'number',
      min: 0,
      max: 5000000000,
      step: 1000,
      value: 200000,
      thousands: true,
      help: 'Las de YouTube en formato tradicional. Los Shorts van en su propio campo, más abajo.',
    },
    {
      id: 'nicho',
      label: 'Nicho del canal',
      type: 'select',
      value: 'tech',
      options: Object.keys(YT_CPM_NICHO).map((k) => ({
        value: k,
        label: `${YT_NICHO_LABEL[k]} — CPM ~US$ ${YT_CPM_NICHO[k]}`,
      })),
      help: 'Define el CPM que pagan los anunciantes. Es la variable que más mueve el ingreso.',
    },
    {
      id: 'fill_rate',
      label: 'Fill rate: vistas que llegan a tener anuncio',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 60,
      help: 'Entre 50% y 70% es lo habitual. Baja mucho en contenido con restricciones de anunciantes.',
    },
    {
      id: 'pct_t1',
      label: 'Audiencia de Tier 1 (EE.UU., Canadá, Reino Unido, Australia)',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 15,
      help: 'Está en YouTube Studio, en el reporte de audiencia por país.',
    },
    {
      id: 'pct_t2',
      label: 'Audiencia de Tier 2 (Europa occidental, España, Chile, México)',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 25,
      help: 'Lo que no cargues en Tier 1 ni Tier 2 se toma como Tier 3.',
    },
    {
      id: 'rpm_facebook',
      label: 'RPM de tu video de Facebook',
      type: 'number',
      prefix: 'US$',
      min: 0,
      max: 200,
      step: 0.1,
      value: 1,
      help: 'Meta no publica una tarifa fija: copiá el RPM que te muestra tu propio panel de monetización.',
    },
    {
      id: 'vistas_cortos',
      label: 'Vistas mensuales en Shorts o Reels',
      type: 'number',
      min: 0,
      max: 20000000000,
      step: 10000,
      value: 2000000,
      thousands: true,
    },
    {
      id: 'rpm_cortos',
      label: 'RPM de formatos cortos',
      type: 'number',
      prefix: 'US$',
      min: 0.01,
      max: 20,
      step: 0.01,
      value: 0.15,
      help: 'Por cada mil vistas. En Shorts suele estar entre 0,03 y 0,20 dólares.',
    },
    {
      id: 'origen_cortos',
      label: 'Origen del corto que subís a Facebook',
      type: 'select',
      value: 'original',
      options: [
        { value: 'original', label: 'Original, hecho para esa red' },
        { value: 'resubido', label: 'Re-subido de TikTok o Instagram' },
      ],
      help: 'El contenido re-subido cobra el 40% en el bonus de Reels.',
    },
    {
      id: 'diamantes',
      label: 'Diamantes de TikTok Live del mes',
      type: 'number',
      min: 0,
      max: 100000000,
      step: 100,
      value: 30000,
      thousands: true,
    },
    {
      id: 'comision_tiktok',
      label: 'Comisión que retienen TikTok y la tienda de aplicaciones',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      help: 'Ronda el 50% cuando el regalo se compró desde la app de iOS o Android.',
    },
    {
      id: 'bits',
      label: 'Bits de Twitch recibidos en el mes',
      type: 'number',
      min: 0,
      max: 100000000,
      step: 100,
      value: 5000,
      thousands: true,
    },
    {
      id: 'donaciones',
      label: 'Donaciones directas por pasarela',
      type: 'number',
      prefix: 'US$',
      min: 0,
      max: 10000000,
      step: 10,
      value: 150,
      thousands: true,
      help: 'Lo que entra por PayPal, Streamlabs o similares, antes de la comisión.',
    },
    {
      id: 'subs_neto',
      label: 'Ingreso neto por suscripciones del canal',
      type: 'number',
      prefix: 'US$',
      min: 0,
      max: 10000000,
      step: 10,
      value: 200,
      thousands: true,
      help: 'Lo que ya te liquida Twitch, con su parte descontada.',
    },
    {
      id: 'visitas_blog',
      label: 'Visitas mensuales del blog',
      type: 'number',
      min: 0,
      max: 1000000000,
      step: 1000,
      value: 30000,
      thousands: true,
    },
    {
      id: 'nicho_blog',
      label: 'Nicho del blog',
      type: 'select',
      value: 'Tecnología / SaaS',
      options: Object.keys(ADSENSE_RPM_NICHO).map((k) => ({
        value: k,
        label: `${k} — RPM base US$ ${ADSENSE_RPM_NICHO[k]}`,
      })),
    },
    {
      id: 'pais_blog',
      label: 'País principal del tráfico del blog',
      type: 'select',
      value: 'México / Argentina / Chile',
      options: Object.keys(ADSENSE_MULT_PAIS).map((k) => ({
        value: k,
        label: `${k} — ×${ADSENSE_MULT_PAIS[k]}`,
      })),
    },
    {
      id: 'impresiones_x',
      label: 'Impresiones mensuales en X',
      type: 'number',
      min: 0,
      max: 100000000000,
      step: 100000,
      value: 3000000,
      thousands: true,
    },
    {
      id: 'nicho_x',
      label: 'Nicho de tu cuenta de X',
      type: 'select',
      value: 'Tech / SaaS',
      options: Object.keys(X_RPM).map((k) => ({ value: k, label: k })),
    },
    {
      id: 'plan_x',
      label: 'Suscripción de X que pagás',
      type: 'select',
      value: 'premium',
      options: [
        { value: 'premium', label: `Premium — US$ ${X_COSTO_MES.premium} por mes` },
        { value: 'premium-plus', label: `Premium+ — US$ ${X_COSTO_MES.premiumPlus} por mes` },
      ],
      help: 'Premium+ paga un RPM más alto pero cuesta el doble: con poco alcance no compensa.',
    },
    {
      id: 'subs_actuales',
      label: 'Suscriptores actuales del canal de YouTube',
      type: 'number',
      min: 0,
      max: 100000000,
      step: 10,
      value: 340,
      thousands: true,
    },
    {
      id: 'subs_mes',
      label: 'Suscriptores nuevos por mes',
      type: 'number',
      min: 1,
      max: 10000000,
      step: 5,
      value: 60,
      thousands: true,
    },
    {
      id: 'horas_actuales',
      label: 'Horas de reproducción de los últimos 12 meses',
      type: 'number',
      min: 0,
      max: 100000000,
      step: 50,
      value: 900,
      thousands: true,
    },
    {
      id: 'horas_mes',
      label: 'Horas de reproducción que sumás por mes',
      type: 'number',
      min: 1,
      max: 10000000,
      step: 10,
      value: 250,
      thousands: true,
    },
    {
      id: 'viewers_twitch',
      label: 'Espectadores promedio en Twitch',
      type: 'number',
      min: 0,
      max: 1000000,
      step: 1,
      value: 30,
      help: 'El promedio, no el pico. Es el requisito más difícil de los tres.',
    },
    {
      id: 'horas_twitch',
      label: 'Horas de stream en los últimos 30 días',
      type: 'number',
      min: 0,
      max: 720,
      step: 1,
      value: 40,
    },
    {
      id: 'dias_twitch',
      label: 'Días distintos con stream en los últimos 30 días',
      type: 'number',
      min: 0,
      max: 30,
      step: 1,
      value: 14,
    },
  ],
  fineprint:
    'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad. Los CPM y RPM son referencias de mercado: el número real depende de tu nicho, del país de tu audiencia, de la estacionalidad y de las políticas de cada plataforma, que cambian sin aviso. La equivalencia en pesos usa el dólar oficial y es sólo orientativa.',

  chart: {
    type: 'donut',
    title: 'De dónde sale la plata',
    caption:
      'En las ramas de ingreso el gráfico parte el total mensual entre las plataformas o los conceptos que lo generan, y muestra aparte lo que se queda la plataforma en comisiones. En la rama de requisitos muestra qué porcentaje del camino a la monetización llevás recorrido.',
  },
  breakdownTitle: 'Plataforma por plataforma',
  breakdownIntro:
    'Los importes de plataforma van en dólares, porque en dólares se liquidan. La última fila de cada rama traduce el total al dólar oficial, sólo como referencia.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre CPM y RPM?',
      a: 'El CPM es lo que paga el anunciante por cada mil impresiones de anuncio; el RPM es lo que te queda a vos por cada mil vistas de tu contenido. Entre uno y otro hay tres recortes: la plataforma se queda con su parte (en YouTube, el 45%), no todas tus vistas llegan a mostrar un anuncio (el fill rate) y una vista puede mostrar más de un anuncio o ninguno. Por eso un canal que ve un CPM de 20 dólares en su panel termina cobrando un RPM de 6 o 7.',
    },
    {
      q: '¿Cuánto paga YouTube por un millón de vistas?',
      a: 'Depende casi por completo del nicho y del país de la audiencia. Con un CPM de nicho de 25 dólares (finanzas), 60% de fill rate y audiencia mayoritariamente de Estados Unidos, un millón de vistas puede dejar más de 8.000 dólares. El mismo millón de vistas en un canal infantil con audiencia de países de Tier 3 puede no llegar a 100 dólares. No existe una tarifa por vista: existe una tarifa por nicho y por país.',
    },
    {
      q: '¿Por qué las vistas de algunos países valen mucho menos?',
      a: 'Porque el anunciante paga por poder de compra, no por atención. Un aviso mostrado en Estados Unidos, Canadá, Reino Unido o Australia se subasta a un CPM de alrededor de 12 dólares; en Europa occidental y en los países más ricos de América Latina, cerca de 5; en el resto del mundo, alrededor de 1,50. Esa diferencia de ocho veces es la razón por la que dos canales con el mismo volumen y el mismo tema pueden facturar cifras totalmente distintas.',
    },
    {
      q: '¿Cuánto pagan los Shorts y los Reels?',
      a: 'Muchísimo menos que el video largo: el RPM de los formatos cortos suele moverse entre 0,03 y 0,20 dólares por cada mil vistas, contra los 3 a 10 dólares de un video tradicional. La razón es que en un corto entra un solo anuncio cada varias piezas de contenido y el ingreso se reparte entre todos los creadores del feed. Con un RPM de 0,15 hacen falta más de seis millones de vistas para juntar mil dólares.',
    },
    {
      q: '¿Qué requisitos hay para monetizar en YouTube?',
      a: 'La vía tradicional pide 1.000 suscriptores y 4.000 horas de reproducción pública válidas en los últimos 12 meses. La vía de formatos cortos pide los mismos 1.000 suscriptores más 10 millones de vistas válidas de Shorts en los últimos 90 días. Alcanza con cumplir una de las dos. Ojo con la ventana móvil: las horas se cuentan sobre los últimos doce meses, así que un canal parado también pierde horas y puede caerse del programa.',
    },
    {
      q: '¿Qué requisitos hay para ser Partner de Twitch?',
      a: 'Tres umbrales medidos sobre los últimos 30 días: 75 espectadores promedio en simultáneo, al menos 25 horas de transmisión y streams en 12 días distintos. Cumplirlos habilita a postular desde el panel Path to Partner, pero la aprobación no es automática. El cuello de botella es casi siempre el promedio de espectadores: sumar horas frente a una sala vacía no acerca el objetivo, y de hecho puede bajar el promedio.',
    },
    {
      q: '¿Cuánto vale un diamante de TikTok y cuánto me queda?',
      a: 'El diamante se convierte a 0,005 dólares, es decir 200 diamantes por dólar. Pero antes de eso ya se descontó una parte grande: cuando el espectador compra las monedas desde la app de iOS o Android, entre la tienda de aplicaciones y TikTok se van cerca de la mitad de lo que pagó. En la práctica, de cada 10 dólares que gasta tu público en regalos, al creador le suelen quedar alrededor de 2,50 a 3.',
    },
    {
      q: '¿Cuánto vale un bit de Twitch y conviene más una donación directa?',
      a: 'Cada bit son 0,01 dólares para el streamer, con la parte de Twitch ya descontada. Una donación directa por pasarela deja alrededor del 97%, porque sólo paga la comisión del procesador de pagos: es claramente más rentable en dólares. La contra es que los bits y las suscripciones sí generan reconocimiento dentro de la plataforma y cuentan para el algoritmo y para la comunidad, y la donación externa no.',
    },
    {
      q: '¿Cuál es el mínimo para poder cobrar en cada plataforma?',
      a: 'YouTube y AdSense pagan a partir de 100 dólares acumulados, con liquidación entre el 21 y el 26 del mes siguiente. Twitch también tiene un mínimo de 100 dólares. TikTok Live pide 100 dólares de saldo neto para habilitar el retiro. X liquida cada dos semanas con un umbral bastante menor. Por debajo del mínimo el saldo no se pierde: queda acumulado y se arrastra al período siguiente hasta que lo superás.',
    },
    {
      q: '¿Conviene pagar Premium+ en X para monetizar?',
      a: 'Sólo si tenés alcance suficiente. Premium+ paga un RPM más alto pero cuesta el doble, así que el punto de equilibrio se corre hacia arriba. Con pocas impresiones mensuales, la suscripción se come todo el ingreso y el programa te deja en rojo. Antes de pagar el plan más caro conviene simular los dos con tus impresiones reales y ver cuál deja más neto, que es lo que hace esta calculadora.',
    },
    {
      q: '¿Cuánto rinde un blog con AdSense?',
      a: 'El rango va de 2,50 dólares por cada mil visitas en lifestyle a 40 en seguros, y después se ajusta por país: el tráfico de Estados Unidos vale el doble que el de Europa occidental y cuatro veces el de México, Argentina o Chile. Un blog de finanzas con tráfico hispanoamericano rinde parecido a uno de tecnología con tráfico estadounidense. Superadas las decenas de miles de visitas mensuales, las redes premium de publicidad suelen pagar entre dos y tres veces más que AdSense.',
    },
    {
      q: '¿Se pagan impuestos por lo que cobro de estas plataformas?',
      a: 'Sí. Para el fisco argentino es ingreso gravado como cualquier otro, aunque la plataforma sea del exterior y no emita comprobante local. Según el volumen y la actividad corresponde monotributo o responsable inscripto, y hay tratamiento propio para la exportación de servicios. Las propinas y los regalos también cuentan. Como el ingreso llega en dólares y desde el exterior, conviene sentarse con un contador antes de que el volumen crezca, no después.',
    },
  ],

  sources: [
    {
      name: 'Programa de Socios de YouTube — Requisitos de elegibilidad y reparto de ingresos',
      url: 'https://support.google.com/youtube/answer/72851',
      publisher: 'Google / YouTube',
    },
    {
      name: 'YouTube Studio — Cómo se calculan los ingresos estimados, el CPM y el RPM',
      url: 'https://support.google.com/youtube/answer/9314357',
      publisher: 'Google / YouTube',
    },
    {
      name: 'Meta for Creators — Monetización de video y bonus de Reels',
      url: 'https://www.facebook.com/creators/tools/monetization',
      publisher: 'Meta Platforms',
    },
    {
      name: 'TikTok — Regalos, diamantes y retiro de saldo en LIVE',
      url: 'https://support.tiktok.com/es/business-and-creator/creator-rewards-program',
      publisher: 'TikTok',
    },
    {
      name: 'Twitch — Bits, suscripciones y Path to Partner',
      url: 'https://help.twitch.tv/s/article/partner-program-overview',
      publisher: 'Twitch Interactive',
    },
    {
      name: 'X — Programa de reparto de ingresos por publicidad para creadores',
      url: 'https://help.x.com/en/using-x/creator-subscriptions',
      publisher: 'X Corp.',
    },
    {
      name: 'Google AdSense — Cómo se calculan los ingresos y el RPM de página',
      url: 'https://support.google.com/adsense/answer/190515',
      publisher: 'Google',
    },
    {
      name: 'Cotización del dólar oficial usada en la equivalencia en pesos',
      url: 'https://www.bna.com.ar/Personas',
      publisher: 'Banco de la Nación Argentina',
    },
  ],

  replaces: [
    '/calculadora-youtube-cpm-por-nicho',
    '/calculadora-youtube-ingresos-cpm-suscriptores-views-monetizacion',
    '/calculadora-youtube-ingresos-vistas-pais',
    '/calculadora-youtube-shorts-fund-ingreso',
    '/calculadora-youtube-suscriptores-para-1000',
    '/calculadora-youtube-tiempo-para-monetizar',
    '/calculadora-facebook-ingresos-videos',
    '/calculadora-facebook-reels-bonus-pagos',
    '/calculadora-tiktok-live-diamonds-dolares',
    '/calculadora-twitch-bits-donaciones-dolares',
    '/calculadora-twitch-horas-para-partner',
    '/calculadora-twitter-x-monetizacion-ingreso',
    '/calculadora-blog-adsense-rpm-nicho',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
