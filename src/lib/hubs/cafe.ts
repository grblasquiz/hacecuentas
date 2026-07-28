import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto café y cuánta agua?"
 *
 * Une las seis calculadoras de café que había sueltas (una por método) en una
 * sola pregunta: la dosis y el agua salen del MISMO eje —la relación agua:café—
 * así que el usuario puede comparar métodos sin cambiar de página.
 *
 * Nada de lo que devuelve es plata: cada fila declara `format` explícito.
 */
export const hub: HubData = {
  slug: 'cocina/cafe',
  title: 'Cuánto café por taza: gramos y agua según el método | Hacé Cuentas',
  description:
    'Cuántos gramos de café y cuántos ml de agua para V60, prensa francesa, moka, espresso, cold brew y cafetera de goteo. Con la relación agua:café, la molienda y la temperatura de cada método.',
  silo: 'Cocina',
  siloHref: '/cocina',

  eyebrow: 'Guía de extracción',
  h1: '¿Cuánto café le pongo?',
  lede:
    'Partimos del método más común en casa: filtrado tipo V60 o Chemex. Ajustá las tazas y la intensidad, y si usás otro método cambialo abajo: el eje siempre es el mismo, la relación agua:café.',
  stamps: ['Relación agua:café en peso', 'Referencia SCA (1:15 a 1:18)', '6 calculadoras adentro'],

  resultLabel: 'Café que necesitás',

  cases: {
    title: '¿Con qué lo preparás?',
    intro: 'Cada método tiene su relación, su molienda y su temperatura. Elegí el tuyo.',
    items: [
      {
        id: 'filtro',
        label: 'Filtrado / V60 / Chemex',
        hint: 'El más común en casa',
        answer: 'En filtrado la referencia es 1:16 — 1 g de café cada 16 ml de agua.',
        yes: [
          'Relación 1:16 en peso: 250 ml de agua piden unos 15,6 g de café',
          'Molienda media, tipo arena gruesa',
          'Agua a 92-96 °C: hervida y esperando 30 segundos',
          'Extracción total de 2:30 a 3:30 minutos, en vertidos parejos',
        ],
        warn: [
          'Medir con cuchara en vez de balanza es la causa número uno de tazas irregulares: una cucharada de molido medio pesa entre 4 y 7 g según lo compacta que esté',
        ],
        plazo: 'pre-mojá el filtro de papel: si no, el papel se lleva sabor y calor.',
      },
      {
        id: 'prensa',
        label: 'Prensa francesa o AeroPress',
        hint: 'Inmersión',
        answer: 'En prensa francesa la referencia es 1:15, con molienda gruesa.',
        yes: [
          'Relación 1:15: 250 ml de agua piden unos 16,7 g de café',
          'Molienda gruesa, tipo sal marina',
          'Agua a 93-96 °C',
          '4 minutos exactos de inmersión y después bajás el émbolo despacio',
          'La AeroPress usa la misma relación pero molienda media-fina y 1:30 de inmersión',
        ],
        warn: [
          'Si dejás el café en la prensa después de bajar el émbolo sigue extrayendo y amarga: serví todo de una',
        ],
        plazo: 'no empujes fuerte el émbolo: agita el poso y enturbia la taza.',
      },
      {
        id: 'espresso',
        label: 'Espresso',
        hint: 'Dosis, yield y tiempo',
        answer: 'Un espresso estándar es 1:2 — 18 g de café para 36 g en taza.',
        yes: [
          'La relación acá no es agua:café sino dosis:líquido en taza (brew ratio)',
          'Ristretto 1:1 a 1:1,5 · normale 1:2 · lungo 1:3',
          'Tiempo de extracción de 20 a 35 segundos desde que arranca la bomba',
          'Si medís el TDS con refractómetro, el extraction yield ideal SCA es 18-22%',
        ],
        warn: [
          'Menos de 20 segundos suele ser molienda gruesa (taza ácida y aguada); más de 35 segundos, molienda muy fina (amarga y astringente)',
        ],
        plazo: 'pesá el líquido en taza, no lo mires a ojo: la crema engaña el volumen.',
      },
      {
        id: 'moka',
        label: 'Cafetera moka (italiana)',
        hint: 'La de la hornalla',
        answer: 'En moka la relación ronda 1:9 y el agua va hasta debajo de la válvula.',
        yes: [
          'Una "taza" de moka son unos 45 ml de agua en la caldera, no 250: la moka de 6 tazas carga unos 270 ml',
          'Relación cercana a 1:9 entre el agua de la caldera y el café',
          'Molienda media-fina: más fina que la de filtro, más gruesa que la de espresso',
          'El filtro se llena al ras y sin compactar',
        ],
        warn: [
          'Nunca pases el agua de la válvula de seguridad: es la válvula, no un adorno',
          'Sacala del fuego apenas empieza a borbotear: lo que sale después es lo amargo',
        ],
        plazo: 'usá agua ya caliente en la caldera para que el café no se cocine mientras sube.',
      },
      {
        id: 'coldbrew',
        label: 'Cold brew',
        hint: 'Frío, de un día para el otro',
        answer: 'Concentrado de cold brew: 1:5, de 14 a 18 horas en frío.',
        yes: [
          'Concentrado 1:5 en peso, que después se diluye 1:1 al servir',
          'Molienda muy gruesa, más que la de prensa francesa',
          'De 14 a 18 horas en heladera es la ventana dulce',
          'Listo para tomar sin diluir: relación 1:12',
        ],
        warn: [
          'Pasadas las 24 horas empieza a extraer taninos y amarga: cortá la infusión y filtrá',
        ],
        plazo: 'el concentrado dura hasta 2 semanas en heladera, bien tapado.',
      },
      {
        id: 'goteo',
        label: 'Cafetera de goteo eléctrica',
        hint: 'La de la jarra',
        answer: 'En cafetera de goteo la referencia es 1:17.',
        yes: [
          'Relación 1:17: una jarra de 1 litro pide unos 59 g de café',
          'Molienda media',
          'La "taza" del fabricante suele ser de 150-180 ml, no de 250',
        ],
        warn: [
          'Muchas cafeteras de goteo no llegan a 92 °C: si la taza sale ácida y floja, no es la dosis, es la máquina',
        ],
        plazo: 'descalcificá con vinagre o ácido cítrico una vez por mes.',
      },
    ],
  },

  inputsTitle: 'Cuánto vas a preparar',
  inputsIntro:
    'Los campos de espresso y de cold brew sólo se usan en esas ramas; en las demás podés dejarlos como están.',
  fields: [
    { id: 'tazas', label: 'Cuántas tazas', type: 'number', min: 1, max: 30, value: 2 },
    {
      id: 'mlTaza',
      label: 'Tamaño de la taza (ml)',
      type: 'number',
      min: 30,
      max: 1000,
      value: 250,
      help: 'En moka el cálculo usa los 45 ml de agua por taza que carga la caldera; en cafetera de goteo la taza del fabricante suele ser 180 ml.',
    },
    {
      id: 'intensidad',
      label: 'Intensidad',
      type: 'select',
      value: 'equilibrada',
      options: [
        { value: 'suave', label: 'Suave (menos café)' },
        { value: 'equilibrada', label: 'Equilibrada (referencia del método)' },
        { value: 'fuerte', label: 'Fuerte (más café)' },
      ],
    },
    { id: 'dosis', label: 'Espresso: dosis en el portafiltro (g)', type: 'number', min: 5, max: 30, step: 0.1, value: 18 },
    { id: 'rendimiento', label: 'Espresso: líquido en taza (g)', type: 'number', min: 5, max: 120, step: 0.1, value: 36 },
    { id: 'segundos', label: 'Espresso: tiempo de extracción (s)', type: 'number', min: 5, max: 90, value: 28 },
    {
      id: 'tds',
      label: 'Espresso: TDS medido (%) — dejalo en 0 si no tenés refractómetro',
      type: 'number',
      min: 0,
      max: 25,
      step: 0.01,
      value: 0,
    },
    { id: 'horas', label: 'Cold brew: horas de infusión', type: 'number', min: 1, max: 48, value: 16 },
  ],
  fineprint:
    'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu taza en el eje agua:café',
    caption:
      'Todos los métodos viven en el mismo eje: cuántas partes de agua por parte de café. A la izquierda, concentrados; a la derecha, tazas livianas. El marcador es tu relación.',
    bands: [
      { label: 'Espresso (1:1 a 1:3)', from: 0, to: 3, tone: 'bad' },
      { label: 'Concentrado (1:3 a 1:8)', from: 3, to: 8, tone: 'warn' },
      { label: 'Intenso (1:8 a 1:13)', from: 8, to: 13, tone: 'neutral' },
      { label: 'Equilibrado (1:13 a 1:17)', from: 13, to: 17, tone: 'good' },
      { label: 'Suave (1:17 a 1:22)', from: 17, to: 22, tone: 'neutral' },
    ],
  },
  breakdownTitle: 'Tu receta, número por número',
  breakdownIntro: 'Las barras comparan cada valor con el mayor de la lista. Pesá el café: es lo único que no se estima.',

  faq: [
    {
      q: '¿Cuántos gramos de café por taza de 250 ml?',
      a: 'En filtrado, unos 15 a 16 g por cada 250 ml (relación 1:16). En prensa francesa, unos 16 a 17 g (1:15). En cafetera de goteo, unos 15 g por cada 250 ml (1:17). Si preferís la taza más fuerte, bajá la relación a 1:14; si la querés más liviana, subila a 1:18.',
    },
    {
      q: '¿Cuántas cucharadas son 15 gramos de café?',
      a: 'Alrededor de 3 cucharadas soperas al ras de molido medio, tomando la referencia de 5,3 g por cucharada. Es una equivalencia frágil: según cuánto se compacte el molido, la misma cuchara puede llevar de 4 a 7 g. Por eso el mismo café sale distinto cada día cuando se mide con cuchara.',
    },
    {
      q: '¿Qué es la relación 1:16 y por qué se mide en peso?',
      a: 'Es 1 gramo de café por cada 16 gramos de agua. Se mide en peso y no en volumen porque el café molido cambia de densidad con el tueste y la molienda, mientras que 1 ml de agua pesa 1 g siempre. Por eso una balanza de cocina de 0,1 g hace más por la taza que cambiar de café.',
    },
    {
      q: '¿Cuál es la temperatura ideal del agua?',
      a: 'Entre 92 y 96 °C para filtrado, prensa y goteo. En la práctica: hervís y esperás unos 30 segundos. Por debajo de 88 °C la extracción queda incompleta y la taza sale ácida y salada; por encima de 96 °C aparecen notas quemadas y amargas. La AeroPress es la excepción, funciona muy bien entre 80 y 85 °C.',
    },
    {
      q: '¿Cuánta agua lleva la moka de 6 tazas?',
      a: 'Alrededor de 270 ml, que es lo que entra en la caldera hasta justo debajo de la válvula de seguridad, y unos 30 g de café. La moka mide en tazas de café italiano, no de desayuno: una "taza" son unos 45 ml de agua y unos 50 a 60 ml servidos. Es el error más habitual al comprarla, porque la de 6 no hace 6 tazas de 250 ml.',
    },
    {
      q: '¿Cuál es el brew ratio correcto de un espresso?',
      a: 'El estándar moderno es 1:2 — 18 g de café molido para 36 g de líquido en taza, en 25 a 30 segundos. Un ristretto va de 1:1 a 1:1,5 (más denso y dulce) y un lungo, cerca de 1:3 (más liviano y con más cafeína total). Pesá siempre el líquido en taza: la crema hace ver más volumen del que hay.',
    },
    {
      q: '¿Qué es el extraction yield y para qué sirve?',
      a: 'Es el porcentaje del café molido que terminó disuelto en la taza. Se calcula como TDS × líquido en taza ÷ dosis, y necesita un refractómetro para medir el TDS. La ventana ideal según la SCA es 18-22%: por debajo la taza es ácida y sub-desarrollada, por encima aparece amargor y astringencia.',
    },
    {
      q: '¿Cuántas horas hay que dejar el cold brew?',
      a: 'De 14 a 18 horas en heladera es la franja dulce. Menos de 12 horas queda aguado y sin cuerpo; pasadas las 24 horas empieza a extraer taninos y amarga. Si lo dejás a temperatura ambiente el proceso se acelera y con 8 a 12 horas ya está, pero conviene la heladera por seguridad alimentaria.',
    },
    {
      q: '¿Cómo diluyo el concentrado de cold brew?',
      a: 'El concentrado 1:5 se sirve diluido 1:1 con agua o leche: media taza de concentrado y media de líquido. Si preparaste directo a 1:12, ya está listo para tomar sin diluir. Un litro de concentrado rinde unos 8 vasos de 250 ml después de diluir.',
    },
    {
      q: '¿Qué molienda va en cada método?',
      a: 'De más gruesa a más fina: cold brew (muy gruesa), prensa francesa (gruesa, tipo sal marina), filtrado y goteo (media, tipo arena), AeroPress y moka (media-fina) y espresso (muy fina, casi harina). Si la taza sale amarga, movete a molienda más gruesa; si sale ácida y floja, más fina.',
    },
    {
      q: '¿Influye el agua en el sabor del café?',
      a: 'Bastante: el café es 98% agua. La SCA recomienda entre 50 y 175 ppm de dureza total. Agua muy blanda extrae poco y da tazas planas; agua muy dura opaca los ácidos y además incrusta la máquina. Si el agua de tu canilla es muy dura, filtrarla cambia más la taza que cambiar de grano.',
    },
    {
      q: '¿Cuánto rinde un kilo de café?',
      a: 'A relación 1:16 y tazas de 250 ml, un kilo de café rinde unas 64 tazas. En espresso a 18 g por dosis, unos 55 espressos. En moka, alrededor de 200 tazas italianas, porque cada una lleva unos 5 g.',
    },
  ],

  sources: [
    {
      name: 'Coffee Standards — ratios de preparación y control de extracción',
      url: 'https://sca.coffee/research/coffee-standards',
      publisher: 'Specialty Coffee Association',
    },
    {
      name: 'Water for Brewing Specialty Coffee — dureza y composición recomendada',
      url: 'https://sca.coffee/research/water-quality',
      publisher: 'Specialty Coffee Association',
    },
    {
      name: 'The Coffee Brewing Handbook — control chart de TDS y extraction yield',
      url: 'https://store.sca.coffee/products/the-coffee-brewing-handbook',
      publisher: 'Specialty Coffee Association',
    },
  ],

  replaces: [
    '/calculadora-cafe-french-press-ratio',
    '/calculadora-cafe-molido-taza-metodo-preparacion',
    '/calculadora-cafe-ratio-agua-gramos-metodo-preparacion',
    '/calculadora-cold-brew-ratio',
    '/calculadora-moka-pot-agua-cafe',
    '/calculadora-espresso-tds-yield',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Parámetros de cada método.
 *  - `ratio`: partes de agua por parte de café, en peso.
 *  - `mlTaza`: si el método tiene una taza propia (moka, espresso), pisa el campo.
 *  - `temp`: temperatura objetivo del agua, en °C.
 *  - `minutos`: tiempo de contacto de referencia.
 */
export const METODOS: Record<
  string,
  { ratio: number; mlTaza: number | null; temp: number; minutos: number; molienda: string; nombre: string }
> = {
  filtro: { ratio: 16, mlTaza: null, temp: 94, minutos: 3, molienda: 'media', nombre: 'Filtrado / V60' },
  prensa: { ratio: 15, mlTaza: null, temp: 94, minutos: 4, molienda: 'gruesa', nombre: 'Prensa francesa' },
  espresso: { ratio: 2, mlTaza: 30, temp: 93, minutos: 0.5, molienda: 'muy fina', nombre: 'Espresso' },
  moka: { ratio: 9, mlTaza: 45, temp: 100, minutos: 4, molienda: 'media-fina', nombre: 'Moka' },
  coldbrew: { ratio: 5, mlTaza: null, temp: 5, minutos: 960, molienda: 'muy gruesa', nombre: 'Cold brew' },
  goteo: { ratio: 17, mlTaza: null, temp: 92, minutos: 5, molienda: 'media', nombre: 'Cafetera de goteo' },
};

/** Ajuste de la relación por intensidad: menos agua por gramo = taza más fuerte. */
export const INTENSIDAD: Record<string, number> = {
  suave: 1.12,
  equilibrada: 1,
  fuerte: 0.87,
};

/** Peso de una cucharada sopera de molido medio, referencia SCA. */
export const CUCHARADA_G = 5.3;

/** Tope del eje del gráfico, en partes de agua por parte de café. */
export const EJE_MAX = 22;
