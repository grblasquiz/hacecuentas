import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánta madera necesito para el mueble?"
 * Absorbe 10 URLs de calculadora suelta (ver hub.replaces).
 *
 * DIFERENCIA con los otros hubs de /construccion — no se pisan:
 *   · /construccion/pintura   → litros para pintar una superficie
 *   · /construccion/hormigon  → bolsas, arena y piedra de un pastón
 *   · /construccion/ladrillos → ladrillos y mezcla de un muro
 *   · /construccion/costo-por-m2 → cuánto sale construir
 *   Este es el único que resuelve el despiece de un mueble de placa: metros
 *   cuadrados, plan de corte, placas a comprar, peso, tornillos y bisagras.
 *
 * EL NÚCLEO ES EL PLAN DE CORTE. Es lo que la gente busca: cuántas piezas
 * salen de una placa y cuánto se tira. Por eso el hub calcula las placas de
 * las DOS maneras —por área y por corte guillotina real— y muestra la
 * diferencia, que es justamente donde las dos calcs viejas se contradecían.
 *
 * YMYL construcción: el aviso del dominio `construction-materials` de
 * src/lib/disclaimers.ts viaja textual en hub.fineprint y como primer `warn`
 * de cada rama.
 *
 * NOTAS DE CONTRATO:
 *  - Acá no hay plata: TODA fila lleva `format` explícito ('unit' o 'plain').
 *  - `chart.type: 'donut'`: composición de los metros cuadrados por grupo de
 *    piezas, que es la pregunta "en qué se me va la madera".
 */
export const hub: HubData = {
  slug: 'construccion/madera',
  title: '¿Cuánta madera necesito para el mueble? Placas, plan de corte y desperdicio',
  description:
    'Calculá el despiece completo de tu mueble: metros cuadrados de placa, cuántas piezas salen de cada tablero de melamina o MDF, el desperdicio real, las placas a comprar, el peso, los tornillos y las bisagras. Con el ancho de corte de la sierra incluido.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Guía y estimación de materiales',
  h1: '¿Cuánta madera necesito para el mueble?',
  lede:
    'La cuenta por metros cuadrados siempre te queda corta: lo que manda es cómo caen las piezas dentro de la placa y cuánto se come la sierra. Partimos del caso más común —una biblioteca de melamina— y ya tenés el despiece. Si tu mueble es otro, lo cambiás abajo.',
  stamps: [
    'Actualizado 27-07-2026',
    'Formatos de placa del mercado argentino',
    '10 calculadoras adentro',
  ],

  resultLabel: 'Placas a comprar',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Todas las ramas usan las mismas medidas de arriba. Lo que cambia es el despiece: qué piezas lleva tu mueble y, con eso, cuánta placa te come.',
    items: [
      {
        id: 'biblioteca',
        label: 'Una biblioteca o estantería',
        hint: 'El caso más común: dos laterales, estantes, techo, base y fondo.',
        answer:
          'Necesitás los dos laterales, un estante por nivel, techo, base y el fondo, más el 15% de desperdicio de corte.',
        yes: [
          'El despiece pieza por pieza con sus medidas de corte',
          'Cuántas piezas salen de una placa entera y cuántas placas comprar',
          'El desperdicio real del plan de corte, no sólo el 15% de regla',
          'El peso del mueble armado y cuánto aguanta cada estante antes de panzear',
        ],
        warn: [
          'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',
          'El fondo de 18 mm es carísimo y casi nunca hace falta: con una placa de 3 mm o un fibrofácil alcanza, y baja mucho el peso y el costo',
          'Un estante de melamina de más de 80 cm sin apoyo central panzea con libros, por más grueso que sea',
        ],
        plazo: 'llevá el despiece al corralón: cortar en la máquina de ellos sale mucho más barato que errarle en casa.',
      },
      {
        id: 'placard',
        label: 'Un placard o mueble con puertas',
        hint: 'Suma dos puertas, sus bisagras y sus tornillos.',
        answer: 'Igual que la biblioteca, más dos puertas y el herraje que necesitan.',
        yes: [
          'Todo el despiece del cuerpo, más dos puertas de media hoja cada una',
          'Cuántas bisagras lleva cada puerta según su alto y su peso real',
          'Los tornillos de bisagra con margen de sobra',
          'El peso de cada hoja, que es lo que define el herraje',
        ],
        warn: [
          'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',
          'La cantidad de bisagras la manda la más exigente de las dos reglas: una cada 75 cm de alto, y el mínimo por peso de la hoja',
          'En melamina las bisagras cazoleta necesitan fresado de 35 mm: no es un agujero que hagas con mecha común',
        ],
        plazo: 'medí el hueco antes de cortar las puertas: se descuentan 3 mm por lado de luz.',
      },
      {
        id: 'escritorio',
        label: 'Un escritorio o mesada',
        hint: 'Una tapa y dos laterales, sin fondo ni estantes.',
        answer: 'Sólo la tapa y los dos apoyos: es el mueble que menos placa consume.',
        yes: [
          'La tapa completa a la medida del ancho por la profundidad',
          'Dos laterales de apoyo a la altura elegida',
          'Cuánto peso aguanta la tapa entre apoyos antes de flexarse 3 mm',
        ],
        warn: [
          'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',
          'Una tapa de más de 120 cm entre apoyos flexa con el peso de una PC y un monitor: sumá una traviesa o un tercer apoyo',
          'El canto de la tapa es el que más se ve y el que más se golpea: presupuestá el tapacanto de 22 mm, no el fino',
        ],
        plazo: 'la altura estándar de escritorio es 75 cm; de mesada de cocina, 90 cm.',
      },
      {
        id: 'cajonera',
        label: 'Una cajonera',
        hint: 'Cuerpo cerrado más un frente por cajón.',
        answer: 'El cuerpo cerrado más un frente de cajón por nivel, repartido en el alto.',
        yes: [
          'El cuerpo: laterales, techo, base y fondo',
          'Un frente por cajón, repartiendo el alto entre la cantidad de cajones',
          'El peso del mueble armado, que define las correderas',
        ],
        warn: [
          'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',
          'Este cálculo cubre el cuerpo y los frentes, no las cajas de los cajones: cada caja son cuatro piezas más y un fondo',
          'Las correderas comunes aguantan 25 kg por cajón; las de extracción total, 35 a 45 kg. Elegilas por el peso que vas a guardar',
        ],
        plazo: 'las correderas de bolilla piden 13 mm de luz por lado: descontalos del ancho del cajón.',
      },
      {
        id: 'deck',
        label: 'Un deck de exterior',
        hint: 'Deck de tablas: no se corta de placa.',
        answer: 'El deck no sale de placas: son tablas por metro lineal, más los listones de apoyo.',
        yes: [
          'Los metros lineales de tabla que cubren la superficie, con la separación de dilatación',
          'Cuántas tablas comprar según el largo comercial',
          'Los metros lineales de listón de apoyo cada 50 cm',
          'Los tirafondos, con margen incluido',
        ],
        warn: [
          'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',
          'La separación entre tablas no es opcional: sin esos 5 mm la madera hincha con la lluvia y el deck se levanta',
          'Un deck exterior no se hace en melamina ni MDF: pedí madera apta intemperie, tratada o dura',
        ],
        plazo: 'el ancho y la profundidad de arriba son los del deck; el alto no se usa en esta rama.',
      },
      {
        id: 'corte',
        label: 'Sólo quiero el plan de corte',
        hint: 'Tengo N piezas iguales: cuántas salen de una placa.',
        answer: 'Con la medida de la pieza y la placa sale cuántas entran por tablero y cuánto se tira.',
        yes: [
          'Cuántas piezas entran por placa en la mejor de las dos orientaciones',
          'La grilla de columnas por filas del corte guillotina',
          'El aprovechamiento y el desperdicio en metros cuadrados',
          'Cuántas placas comprar y cuántas piezas te sobran',
        ],
        warn: [
          'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',
          'El cálculo es de corte guillotina: cortes pasantes de lado a lado, que es como corta la seccionadora del corralón. Un corte con calado libre aprovecharía algo más',
          'En melamina la veta va en un solo sentido: si tu pieza tiene veta visible no podés rotarla, aunque rotarla rinda más',
        ],
        plazo: 'la medida de la pieza son el ancho y la profundidad de arriba; la cantidad, el campo de estantes.',
      },
    ],
  },

  inputsTitle: 'Medidas del mueble',
  inputsIntro:
    'Las medidas exteriores del mueble terminado. En la rama de plan de corte, el ancho y la profundidad son los de la pieza a cortar.',
  fields: [
    { id: 'ancho', label: 'Ancho', type: 'number', min: 1, max: 600, step: 1, value: 80, suffix: 'cm' },
    { id: 'alto', label: 'Alto', type: 'number', min: 1, max: 400, step: 1, value: 180, suffix: 'cm' },
    { id: 'profundidad', label: 'Profundidad', type: 'number', min: 1, max: 200, step: 1, value: 30, suffix: 'cm' },
    {
      id: 'estantes',
      label: 'Estantes, cajones o piezas a cortar',
      type: 'number',
      min: 0,
      max: 60,
      step: 1,
      value: 4,
      help: 'En la rama de plan de corte, este número es la cantidad de piezas iguales que necesitás.',
    },
    {
      id: 'placa',
      label: 'Formato de placa',
      type: 'select',
      value: '183x260',
      options: [
        { value: '183x260', label: 'Melamina 1,83 × 2,60 m — el formato más común' },
        { value: '183x275', label: 'Melamina o MDF 1,83 × 2,75 m' },
        { value: '244x122', label: 'MDF o fenólico 2,44 × 1,22 m (4 × 8 pies)' },
        { value: '220x160', label: 'Multilaminado 2,20 × 1,60 m' },
        { value: '305x183', label: 'Placa grande 3,05 × 1,83 m' },
      ],
    },
    {
      id: 'material',
      label: 'Material',
      type: 'select',
      value: 'melamina',
      options: [
        { value: 'melamina', label: 'Melamina sobre aglomerado' },
        { value: 'mdf', label: 'MDF' },
        { value: 'pino', label: 'Pino' },
        { value: 'cedro', label: 'Cedro' },
        { value: 'eucalipto', label: 'Eucalipto' },
        { value: 'haya', label: 'Haya' },
        { value: 'roble', label: 'Roble' },
        { value: 'algarrobo', label: 'Algarrobo' },
        { value: 'lapacho', label: 'Lapacho' },
        { value: 'quebracho', label: 'Quebracho colorado' },
      ],
      help: 'Define el peso del mueble y cuánto flexa cada estante.',
    },
    { id: 'espesor', label: 'Espesor de la placa', type: 'number', min: 3, max: 50, step: 1, value: 18, suffix: 'mm' },
    {
      id: 'sierra',
      label: 'Ancho de corte de la sierra',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.5,
      value: 3,
      suffix: 'mm',
      help: 'Cada corte se come material. La seccionadora del corralón usa 3 a 4 mm; una sierra circular de mano, 2,5 mm.',
    },
  ],
  fineprint:
    'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.',

  chart: {
    type: 'donut',
    title: 'En qué se te va la madera',
    caption:
      'Cada porción son los metros cuadrados netos de un grupo de piezas. El fondo casi siempre pesa más de lo que la gente espera: por eso conviene resolverlo con una placa fina en vez de con el mismo espesor del cuerpo.',
  },
  breakdownTitle: 'El despiece, pieza por pieza',
  breakdownIntro:
    'Las barras comparan cada valor con el mayor del desglose. Las medidas de corte ya están listas para llevar al corralón.',

  faq: [
    {
      q: '¿Cuánto mide una placa de melamina en Argentina?',
      a: 'El formato más difundido es 1,83 × 2,60 m, que son 4,76 m² por placa. También se consigue en 1,83 × 2,75 m, que da 5,03 m². El MDF crudo y el fenólico suelen venir en 2,44 × 1,22 m, el formato de 4 por 8 pies. Elegí el que consigas en tu corralón: el plan de corte cambia bastante entre uno y otro.',
    },
    {
      q: '¿Cuántas piezas salen de una placa?',
      a: 'Depende de cómo caigan. Se prueban las dos orientaciones —la pieza derecha y rotada 90 grados— y se toma la que rinda más. Para cada una, la cantidad de columnas es el largo de la placa más el ancho de corte, dividido por el largo de la pieza más el ancho de corte, redondeado para abajo; lo mismo para las filas. El total es columnas por filas.',
    },
    {
      q: '¿Por qué el ancho de la sierra cambia el resultado?',
      a: 'Porque cada corte convierte 3 o 4 mm de placa en aserrín. En una placa de 2,60 m con diez cortes se pierden casi 4 cm, y esos 4 cm son a veces la diferencia entre que entre una pieza más o no. Es la razón por la que la cuenta de metros cuadrados sola siempre miente para abajo.',
    },
    {
      q: '¿Cuánto desperdicio de madera hay que presupuestar?',
      a: 'La regla de bolsillo es 15%, y sirve para presupuestar rápido. Pero el desperdicio real depende de cuán bien encajen tus piezas en la placa: con medidas que caen justas podés bajar al 8%, y con una pieza desgraciada que deja media placa muerta te vas al 40%. Por eso acá se calculan las dos cifras y se muestran juntas.',
    },
    {
      q: '¿Qué es el corte guillotina y por qué importa?',
      a: 'Es el corte pasante, de lado a lado de la placa, que es el único que puede hacer la seccionadora del corralón. Obliga a que las piezas se ordenen en una grilla de filas y columnas, y por eso rinde algo menos que un corte libre. Como es el corte que vas a poder pedir de verdad, el cálculo lo usa como base.',
    },
    {
      q: '¿Cuánto peso aguanta un estante antes de panzear?',
      a: 'Se calcula con la flexión de una viga apoyada: el peso máximo es proporcional al módulo elástico del material y al cubo del espesor, y baja con el cubo del largo. Duplicar el largo divide la capacidad por ocho; sumar 6 mm de espesor casi la duplica. Por eso el largo entre apoyos es la variable que más importa, mucho más que el material.',
    },
    {
      q: '¿Qué largo de tornillo va para unir dos placas?',
      a: 'La regla es que el tornillo entre unos dos tercios de su largo en la pieza de abajo. Para dos placas de 18 mm eso da 30 mm, la medida clásica de melamina. Para placas de 25 mm van 40 a 45 mm. En MDF y en maderas duras el pretaladro no es opcional: sin la mecha guía, la placa se abre desde el canto.',
    },
    {
      q: '¿Cuántas bisagras lleva una puerta?',
      a: 'Manda la más exigente de dos reglas: una bisagra cada 75 cm de alto, y un mínimo por peso de la hoja —dos hasta 15 kg, tres hasta 40 kg, cuatro hasta 80 kg y cinco por encima. Una puerta de placard de 1,80 m que pesa 20 kg necesita tres, porque el alto pide tres y el peso también.',
    },
    {
      q: '¿Cuánto pesa una placa de melamina de 18 mm?',
      a: 'El aglomerado melaminizado ronda los 650 kg por metro cúbico, así que un metro cuadrado de 18 mm pesa cerca de 12 kg. Una placa entera de 1,83 × 2,60 m se va a los 55 kg: no es algo que cargues solo ni que entre en cualquier auto. El MDF es todavía más pesado, cerca de 750 kg por metro cúbico.',
    },
    {
      q: '¿Qué es un pie tabla y cómo se pasa a metros cúbicos?',
      a: 'Un pie tabla es el volumen de una tabla de un pie por un pie por una pulgada de espesor, es decir 2,36 litros. Para pasar pies tabla a metros cúbicos se multiplica por 0,00236; para el camino inverso, se divide. Es la unidad con la que se vende la madera aserrada, mientras que las placas se venden por unidad y por metro cuadrado.',
    },
    {
      q: '¿Conviene hacer el fondo del mismo espesor que el mueble?',
      a: 'Casi nunca. El fondo no soporta carga, sólo escuadra el mueble, y en una biblioteca alta puede ser la pieza más grande de todo el despiece. Resolverlo con una placa de 3 mm de fibrofácil o un hardboard ranurado baja el costo y saca varios kilos de encima, sin perder rigidez.',
    },
    {
      q: '¿Puedo rotar las piezas para aprovechar mejor la placa?',
      a: 'Sí, y suele rendir bastante más: el cálculo prueba las dos orientaciones y se queda con la mejor. La excepción es la melamina con veta marcada, donde rotar una pieza deja la veta cruzada y se nota en el mueble terminado. En melamina lisa o de color plano podés rotar sin problema.',
    },
  ],

  sources: [
    {
      name: 'Placas de melamina y MDF — formatos, espesores y densidades de la línea argentina',
      url: 'https://www.masisa.com/ar/productos/',
      publisher: 'Masisa Argentina',
    },
    {
      name: 'Tableros aglomerados y MDF — ficha técnica y peso por metro cuadrado',
      url: 'https://www.faplac.com.ar/productos',
      publisher: 'Faplac (Arauco Argentina)',
    },
    {
      name: 'Densidad de maderas argentinas — fichas técnicas de especies',
      url: 'https://www.argentina.gob.ar/inti/maderas-y-muebles',
      publisher: 'INTI — Centro de Investigación y Desarrollo de Maderas',
    },
    {
      name: 'Wood Handbook — Wood as an Engineering Material (módulo de elasticidad y flexión)',
      url: 'https://www.fpl.fs.usda.gov/documnts/fplgtr/fpl_gtr190.pdf',
      publisher: 'USDA Forest Products Laboratory',
    },
  ],

  replaces: [
    '/calculadora-corte-optimo-tablero',
    '/calculadora-peso-madera-por-tipo-volumen',
    '/calculadora-tablero-melamina-cortes-aprovechamiento',
    '/calculadora-madera-necesaria-mueble',
    '/calculadora-deck-madera-tablas-tornillos',
    '/calculadora-tornillos-madera-tipo-largo',
    '/calculadora-estante-peso-maximo-material',
    '/calculadora-conversor-pie-tabla-a-metro-cubico',
    '/calculadora-bisagras-tornillos-puerta-ventana-cantidad',
    '/calculadora-estantes-madera-soporte-peso',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Formatos de placa del mercado argentino, en cm. */
export const PLACAS: Record<string, { l: number; a: number; label: string }> = {
  '183x260': { l: 260, a: 183, label: '1,83 × 2,60 m' },
  '183x275': { l: 275, a: 183, label: '1,83 × 2,75 m' },
  '244x122': { l: 244, a: 122, label: '2,44 × 1,22 m' },
  '220x160': { l: 220, a: 160, label: '2,20 × 1,60 m' },
  '305x183': { l: 305, a: 183, label: '3,05 × 1,83 m' },
};

/**
 * Materiales: densidad en kg/m³ y módulo de elasticidad en GPa.
 *
 * Las densidades de maderas macizas y el módulo de elasticidad salen de la
 * tabla que ya usaban las calculadoras absorbidas. Melamina y MDF se agregan
 * con la densidad de la ficha técnica de los fabricantes locales.
 *
 * El módulo de elasticidad se conserva en los tres valores de la tabla
 * original: 2,7 GPa para tableros de fibra o partículas, 9 GPa para madera
 * maciza y multilaminado, 21 GPa para quebracho.
 */
export const MATERIALES: Record<string, { d: number; e: number; label: string }> = {
  melamina: { d: 650, e: 2.7, label: 'melamina sobre aglomerado' },
  mdf: { d: 750, e: 2.7, label: 'MDF' },
  pino: { d: 450, e: 9, label: 'pino' },
  cedro: { d: 400, e: 9, label: 'cedro' },
  eucalipto: { d: 650, e: 9, label: 'eucalipto' },
  haya: { d: 720, e: 9, label: 'haya' },
  roble: { d: 750, e: 9, label: 'roble' },
  algarrobo: { d: 820, e: 9, label: 'algarrobo' },
  lapacho: { d: 900, e: 9, label: 'lapacho' },
  quebracho: { d: 1200, e: 21, label: 'quebracho colorado' },
};

/** Constantes del motor. Cada una con su origen. */
export const MOTOR = {
  /** Margen de desperdicio de la regla de bolsillo del rubro. */
  DESPERDICIO: 0.15,
  /** Serie comercial de largos de tornillo para madera, en mm. */
  TORNILLOS_MM: [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120],
  /** El tornillo penetra 2/3 de su agarre en la pieza inferior. */
  PENETRACION: 2 / 3,
  /** Flecha máxima admitida en un estante, en metros (3 mm). */
  FLECHA_MAX_M: 0.003,
  /** Bisagras: una cada 75 cm de alto de hoja. */
  ALTO_POR_BISAGRA_M: 0.75,
  /** Mínimo de bisagras por peso de hoja, en kg. */
  BISAGRAS_POR_PESO: [
    { hasta: 15, n: 2 },
    { hasta: 40, n: 3 },
    { hasta: 80, n: 4 },
    { hasta: 1e9, n: 5 },
  ],
  /** Tornillos por bisagra: 2 agujeros por ala, 2 alas. */
  TORNILLOS_POR_BISAGRA: 4,
  /** Margen de tornillos sobre el cálculo exacto. */
  MARGEN_TORNILLOS: 0.1,
  /** Deck: ancho de tabla, separación de dilatación y largo comercial. */
  DECK_ANCHO_CM: 14.5,
  DECK_SEPARACION_MM: 5,
  DECK_LARGO_M: 3.6,
  DECK_DESPERDICIO: 0.1,
  /** Listones de apoyo del deck, cada 50 cm. */
  DECK_PASO_LISTONES_CM: 50,
  /** Un pie tabla = 0,00235974 m³. */
  PIE_TABLA_M3: 0.00235974,
  /** Aceleración de la gravedad, para pasar newtons a kilos. */
  G: 9.81,
};
