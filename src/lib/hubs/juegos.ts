import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto tiempo me va a llevar?"
 *
 * Foco deliberadamente AFILADO: sólo ocio de duración medible (series, anime,
 * videojuegos, puzzles, modelismo). Las calculadoras de mecánicas de juegos
 * concretos (Blox Fruits, portal del Nether, IV de Pokémon, ELO) NO entran:
 * responden otra pregunta y romperían el foco. Ver el reporte del hub.
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - Este hub NO maneja plata salvo una fila (pintura, en USD). El default de
 *    `format` es 'ars' y el runtime hace Object.assign, así que TODAS las filas
 *    declaran su propio `format`.
 *  - `chart.type: 'scale'` con bandas de compromiso: el insight es en qué liga
 *    juega tu proyecto (una tarde vs. meses), no el número pelado de horas.
 */

/** Puzzles: piezas por hora según experiencia. Espejo de
 *  src/lib/formulas/puzzle-1000-piezas-tiempo-promedio-dificultad.ts */
export const PUZZLE_TASA: Record<string, number> = {
  principiante: 40,
  intermedio: 80,
  avanzado: 140,
};

/** Puzzles: multiplicador de tiempo según la imagen. */
export const PUZZLE_DIFICULTAD: Record<string, number> = {
  facil: 0.7,
  media: 1.0,
  dificil: 1.6,
  experto: 2.8,
};

/** Puzzles: variabilidad personal (cubre ~80% de los tiempos reales). */
export const PUZZLE_FACTOR_MIN = 0.75;
export const PUZZLE_FACTOR_MAX = 1.4;

/** Modelismo: horas por figura y potes de pintura por figura, según acabado.
 *  Espejo de src/lib/formulas/modelismo-pintura-figuras-tiempo-warhammer-citadel.ts */
export const MODELISMO_NIVEL: Record<string, { min: number; max: number; pinturas: number }> = {
  tabletop: { min: 1.0, max: 2.0, pinturas: 0.08 },
  parade: { min: 3.0, max: 5.0, pinturas: 0.15 },
  display: { min: 10.0, max: 20.0, pinturas: 0.3 },
};

/** Modelismo: multiplicador por tamaño de la miniatura. */
export const MODELISMO_TAMANO: Record<string, number> = {
  infantry: 1.0,
  hero: 1.8,
  large: 2.5,
  vehicle: 3.5,
};

/** Modelismo: precio de referencia de un pote Citadel de 12 ml, en USD. */
export const MODELISMO_COSTO_POT = 4.55;

/**
 * Bandas de compromiso del gráfico, en HORAS.
 * El runtime dibuja los tramos con ancho proporcional a (to - from), así que
 * la posición se calcula lineal sobre el tope: pos = horas / TOPE * 100.
 * Todo lo que pase de 150 h queda clavado al final de la escala.
 */
export const BANDAS_HORAS: Array<{ label: string; from: number; to: number; tone: 'good' | 'warn' | 'bad' | 'neutral' }> = [
  { label: 'Una tarde', from: 0, to: 5, tone: 'good' },
  { label: 'Un fin de semana', from: 5, to: 16, tone: 'good' },
  { label: 'Una semana', from: 16, to: 40, tone: 'neutral' },
  { label: 'Un mes', from: 40, to: 80, tone: 'warn' },
  { label: 'Varios meses', from: 80, to: 150, tone: 'bad' },
];

export const BANDAS_TOPE = 150;

export const hub: HubData = {
  slug: 'ocio/tiempo-de-juego',
  title: '¿Cuánto tiempo me va a llevar? — Series, juegos, puzzles y miniaturas',
  description:
    'Calculá cuántas horas, días y semanas te lleva terminar una serie o un anime, completar un videojuego, armar un puzzle o pintar un ejército de miniaturas, a tu ritmo real.',
  silo: 'Ocio',
  siloHref: '/ocio',

  eyebrow: 'Planificador de ocio',
  h1: '¿Cuánto tiempo me va a llevar terminarlo?',
  lede:
    'Partimos del caso más frecuente: una serie o un anime. Cambiá abajo si lo tuyo es un videojuego, un puzzle o pintar miniaturas. La cuenta no es sólo las horas: es cuántos días de tu vida real, a tu ritmo.',
  stamps: ['Actualizado 27-07-2026', 'Horas, días y semanas reales', '5 calculadoras adentro'],

  resultLabel: 'Tiempo estimado',

  cases: {
    title: '¿Qué querés terminar?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'serie',
        label: 'Una serie o un anime',
        hint: 'Episodios × duración',
        answer: 'El total sale de multiplicar episodios por duración, y dividir por tu velocidad de reproducción.',
        yes: [
          'Horas totales de pantalla: episodios × minutos por episodio',
          'El ajuste por velocidad de reproducción (1x, 1,25x, 1,5x o 2x)',
          'Cuántos días te lleva al ritmo de horas por día que declarás',
          'Cuántos fines de semana completos serían, mirando 8 h el sábado y 8 h el domingo',
        ],
        warn: [
          'La duración que figura en las fichas suele incluir opening, ending y avances: si los salteás, restale 2 a 3 minutos por episodio',
        ],
        plazo: 'a 1,5x te ahorrás un tercio del tiempo total sin perder diálogo.',
      },
      {
        id: 'juego',
        label: 'Un videojuego',
        hint: 'Historia o 100%',
        answer: 'Las horas de la ficha se multiplican por el porcentaje de completitud que buscás.',
        yes: [
          'Las horas base del juego ajustadas por tu objetivo (sólo historia, historia y extras, o completismo)',
          'Tus horas por día y tus días por semana reales, no los ideales',
          'El resultado en semanas de calendario, que es como se siente de verdad',
        ],
        warn: [
          'Los promedios publicados salen de gente que ya sabe jugar. Si es tu primer juego del género, sumale entre un 20% y un 30%',
        ],
        plazo: 'un objetivo por encima del 100% significa contenido extra: coleccionables, logros y New Game+.',
      },
      {
        id: 'puzzle',
        label: 'Un puzzle',
        hint: 'Piezas y dificultad',
        answer: 'El tiempo depende de las piezas, de qué tan repetida es la imagen y de tu experiencia.',
        yes: [
          'Piezas por hora según tu nivel: 40 principiante, 80 intermedio, 140 avanzado',
          'El multiplicador de la imagen: fácil, media, difícil o experto (monocromo o degradé)',
          'Un rango realista, no un número seco: el mismo puzzle varía bastante de un día a otro',
        ],
        warn: [
          'El rango cubre alrededor del 80% de los tiempos reales. Un puzzle monocromo puede irse muy por encima del máximo',
        ],
        plazo: 'clasificar bordes y colores antes de empezar es lo que más recorta el total.',
      },
      {
        id: 'modelismo',
        label: 'Miniaturas para pintar',
        hint: 'Warhammer y similares',
        answer: 'Las horas por figura dependen del acabado que busques y del tamaño de la miniatura.',
        yes: [
          'Horas por figura según acabado: tabletop, parade ready o display',
          'El multiplicador por tamaño: infantería, héroe, monstruo o vehículo',
          'Una estimación de cuánta pintura vas a gastar, en dólares',
        ],
        warn: [
          'La estimación de pintura no incluye imprimación, barniz ni basing: sumale entre un 20% y un 30% al presupuesto',
        ],
        plazo: 'pintar en lotes de 5 a 10 figuras iguales baja el promedio por figura de forma notoria.',
      },
    ],
  },

  inputsTitle: 'Contame de tu proyecto',
  inputsIntro: 'Cada caso usa los campos que le sirven; el resto los podés ignorar.',
  fields: [
    {
      id: 'cantidad',
      label: 'Cantidad',
      type: 'number',
      min: 1,
      value: 24,
      help: 'Episodios en series y anime · horas de la ficha en videojuegos · piezas en puzzles · figuras en modelismo.',
    },
    {
      id: 'duracion',
      label: 'Minutos por episodio',
      type: 'number',
      min: 1,
      value: 24,
      help: 'Sólo para series y anime. Un anime ronda los 24 minutos; una serie de drama, entre 45 y 60.',
    },
    {
      id: 'velocidad',
      label: 'Velocidad de reproducción',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Normal (1x)' },
        { value: '1.25', label: '1,25x' },
        { value: '1.5', label: '1,5x' },
        { value: '2', label: '2x' },
      ],
    },
    {
      id: 'objetivo',
      label: 'Objetivo de completitud (%)',
      type: 'number',
      min: 10,
      max: 300,
      value: 100,
      help: 'Sólo videojuegos. 100 es la historia principal completa; 175 es completismo con coleccionables y logros.',
    },
    {
      id: 'dificultad',
      label: 'Dificultad de la imagen del puzzle',
      type: 'select',
      value: 'media',
      options: [
        { value: 'facil', label: 'Fácil: muchos colores y objetos distintos' },
        { value: 'media', label: 'Media' },
        { value: 'dificil', label: 'Difícil: patrones repetidos' },
        { value: 'experto', label: 'Experto: monocromo o degradé' },
      ],
    },
    {
      id: 'experiencia',
      label: 'Tu experiencia armando puzzles',
      type: 'select',
      value: 'intermedio',
      options: [
        { value: 'principiante', label: 'Principiante' },
        { value: 'intermedio', label: 'Intermedio' },
        { value: 'avanzado', label: 'Avanzado' },
      ],
    },
    {
      id: 'nivel',
      label: 'Acabado de las miniaturas',
      type: 'select',
      value: 'tabletop',
      options: [
        { value: 'tabletop', label: 'Tabletop: jugable, se ve bien a distancia de mesa' },
        { value: 'parade', label: 'Parade ready: prolijo de cerca' },
        { value: 'display', label: 'Display o competencia' },
      ],
    },
    {
      id: 'tamano',
      label: 'Tamaño de la miniatura',
      type: 'select',
      value: 'infantry',
      options: [
        { value: 'infantry', label: 'Infantería' },
        { value: 'hero', label: 'Héroe o personaje' },
        { value: 'large', label: 'Élite o monstruo' },
        { value: 'vehicle', label: 'Vehículo' },
      ],
    },
    {
      id: 'horasDia',
      label: 'Horas por día que le vas a dedicar',
      type: 'number',
      min: 0.5,
      step: 0.5,
      value: 2,
    },
    {
      id: 'diasSemana',
      label: 'Días por semana',
      type: 'number',
      min: 1,
      max: 7,
      value: 5,
    },
  ],
  fineprint:
    'Son promedios de comunidad, no relojes. Tu ritmo real puede irse tranquilamente un 30% para arriba o para abajo del número central.',

  chart: {
    type: 'scale',
    title: 'En qué liga juega tu proyecto',
    caption:
      'La escala ubica tus horas totales dentro de cinco franjas de compromiso, en horas: hasta 5 se resuelve en una tarde, hasta 16 en un fin de semana, y de 80 en adelante es un proyecto de meses. El marcador muestra dónde caés vos.',
  },
  breakdownTitle: 'El desglose de tu tiempo',
  breakdownIntro: 'Las barras comparan cada número con el más grande del bloque. Ninguno de estos valores es dinero, salvo la fila de pintura.',

  answer: {
    title: 'Cómo leer el resultado',
    copy:
      'El número grande son las horas netas de actividad. Lo que vuelve real la estimación son las dos filas de abajo: los días de calendario a tu ritmo declarado y las semanas que eso significa. Casi todo el mundo subestima el total porque calcula con las horas del fin de semana ideal, no con las de un martes cualquiera.',
    yes: [
      'Horas totales de actividad neta',
      'Días de calendario al ritmo que declaraste',
      'Semanas equivalentes y fines de semana completos',
      'El rango realista cuando la actividad lo tiene (puzzles y modelismo)',
    ],
    warn: [
      'Los promedios de comunidad los generan personas que ya tienen práctica: si estás empezando, sumale entre un 20% y un 30%',
      'Las horas por día declaradas suelen ser optimistas. Probá el cálculo otra vez con la mitad y quedate con ese número',
    ],
    plazo: 'si el resultado te da más de un mes, dividí el proyecto en tramos con una meta parcial por semana.',
  },

  faq: [
    {
      q: '¿Cuánto tiempo lleva ver un anime de una temporada completa?',
      a: 'Una temporada estándar de anime son 12 o 13 episodios de unos 24 minutos: entre 4 horas y media y 5 horas y media de pantalla. A dos horas por día lo terminás en tres días. Un anime largo de 500 episodios, en cambio, son unas 200 horas: a ese mismo ritmo son más de tres meses.',
    },
    {
      q: '¿De verdad conviene mirar a 1,5x?',
      a: 'Para diálogo en un idioma que dominás, sí: a 1,5x recortás un tercio del tiempo total y la comprensión casi no cae. En anime subtitulado o en series con mucha acción visual el ahorro se paga en detalle perdido. La cuenta es directa: las horas totales se dividen por la velocidad, así que 60 horas a 1,5x se convierten en 40.',
    },
    {
      q: '¿Cuántas horas lleva completar un videojuego al 100%?',
      a: 'Depende del género. Un juego de historia lineal ronda las 12 a 20 horas y el 100% lo lleva a 25 o 35. Un mundo abierto grande arranca en 40 o 50 horas de historia y el completismo lo empuja arriba de las 100. La cuenta que usa este hub es simple: horas de la ficha por el porcentaje de completitud que buscás.',
    },
    {
      q: '¿Cuánto se tarda en armar un puzzle de 1000 piezas?',
      a: 'Con experiencia intermedia y una imagen de dificultad media, unas 12 horas y media: 1000 piezas divididas por 80 piezas por hora. Un principiante con la misma imagen ronda las 25 horas, y un avanzado baja a unas 7. Si la imagen es monocroma o un degradé, multiplicá por 2,8.',
    },
    {
      q: '¿Por qué el puzzle te da un rango y no un número?',
      a: 'Porque la variación entre sesiones es enorme: un día encajás piezas casi solo y al siguiente te trabás media hora en el mismo sector. El rango va del 75% al 140% del número central y cubre alrededor del 80% de los tiempos reales que reporta la gente.',
    },
    {
      q: '¿Cuánto tarda en pintarse una miniatura de Warhammer?',
      a: 'Una figura de infantería a nivel tabletop lleva entre 1 y 2 horas. La misma figura a nivel parade ready sube a entre 3 y 5, y a nivel display o competencia va de 10 a 20. Después se multiplica por el tamaño: un héroe cuesta 1,8 veces más que un infante, un monstruo 2,5 y un vehículo 3,5.',
    },
    {
      q: '¿Cuánta pintura necesito para un ejército?',
      a: 'A nivel tabletop se estima algo menos de un décimo de pote por figura de infantería; a nivel display, casi un tercio. Con potes Citadel de 12 ml a unos 4,55 dólares, un ejército de 40 infantes a nivel tabletop ronda los 15 dólares de pintura. Ese número no incluye imprimación, barniz ni materiales de basing, que suman entre un 20% y un 30% más.',
    },
    {
      q: '¿Por qué mi estimación siempre se queda corta en la vida real?',
      a: 'Porque casi todo el mundo carga las horas por día del mejor día posible, no del promedio. Si declarás tres horas diarias, estás asumiendo 21 horas por semana sostenidas, algo que muy poca gente mantiene. Probá el cálculo otra vez con la mitad de las horas por día: ese suele ser el número que se cumple.',
    },
    {
      q: '¿Qué significa el cálculo de fines de semana?',
      a: 'Divide las horas totales por 16, que es lo que rinde un fin de semana dedicado: 8 horas el sábado y 8 el domingo. Sirve para proyectos que sólo vas a tocar en el fin de semana, como un puzzle grande o una tanda de miniaturas.',
    },
    {
      q: '¿Los promedios sirven si estoy empezando de cero?',
      a: 'Sirven como piso, no como pronóstico. Las tasas de este hub salen de comunidades donde la mayoría ya tiene práctica. Si es tu primer puzzle grande, tu primer juego del género o tu primera tanda de miniaturas, tomá el máximo del rango y sumale entre un 20% y un 30% más.',
    },
    {
      q: '¿Conviene dedicarle más horas por día o más días por semana?',
      a: 'Para el total da lo mismo: lo que manda son las horas por semana. Para terminar de verdad, casi siempre rinde más sumar días que horas. Cuatro días de una hora avanzan más que un día de cuatro, porque el cansancio y el aburrimiento hacen caer el rendimiento dentro de una misma sesión larga.',
    },
    {
      q: '¿El hub sirve para libros, cursos o series de podcast?',
      a: 'Sí, usando el caso de serie: poné la cantidad de capítulos o episodios y la duración promedio de cada uno. La cuenta de horas, días y semanas es la misma. Lo único que no aplica es el ajuste de velocidad de reproducción si el material es escrito.',
    },
  ],

  sources: [
    {
      name: 'HowLongToBeat — tiempos promedio para completar videojuegos, reportados por la comunidad',
      url: 'https://howlongtobeat.com/',
      publisher: 'HowLongToBeat',
    },
    {
      name: 'MyAnimeList — cantidad de episodios y duración por título',
      url: 'https://myanimelist.net/',
      publisher: 'MyAnimeList',
    },
    {
      name: 'Warhammer Community — guías oficiales de pintura y tiempos por nivel de acabado',
      url: 'https://www.warhammer-community.com/',
      publisher: 'Games Workshop',
    },
    {
      name: 'Citadel Colour — catálogo y precios de potes de 12 ml',
      url: 'https://www.games-workshop.com/en-GB/Citadel-Paints',
      publisher: 'Games Workshop',
    },
  ],

  replaces: [
    '/calculadora-anime-tiempo-bingear-temporadas-episodios-horas',
    '/calculadora-maraton-serie-tiempo',
    '/calculadora-tiempo-completar-juego-horas',
    '/calculadora-puzzle-1000-piezas-tiempo-promedio-dificultad',
    '/calculadora-modelismo-pintura-figuras-tiempo-warhammer-citadel',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
