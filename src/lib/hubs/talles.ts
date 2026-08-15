import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué talle soy?"
 * Arquetipo: RAMIFICADO. Cuatro ramas, una por prenda: ropa (default), calzado,
 * corpiño y anillo. Cada rama usa sólo los campos que le corresponden.
 *
 * Absorbe 11 URLs de calculadora suelta (ver `replaces`). De esas 11, tres NO
 * responden "qué talle soy" y se absorben por URL sin reimplementar su función:
 *  - /calculadora-lana-tejer-prenda-agujas    → manualidades (ovillos y agujas)
 *  - /calculadora-tela-necesaria-prenda-vestido → manualidades (metros de tela)
 *  - /calculadora-color-cabello-tono-piel     → color, no talle
 * Están en `replaces` porque su intención de búsqueda muere acá (qué talle usar
 * para tejer / cortar / verse bien), pero el hub no reimplementa su cálculo.
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - Nada es plata: toda fila del desglose declara `format` explícito
 *    ('unit' con cm/mm/pulgadas, o 'plain' para el número de talle) y ninguna
 *    hereda el default 'ars'.
 *  - `chart.type: 'scale'` sí tiene render posicional en DecisionHub (rama
 *    POSITIONAL de paint()): las franjas salen de `res.chart[].from/to` y el
 *    marcador de `res.position`. Como las franjas cambian según la rama
 *    (cm de busto, cm de pie, cm de diferencia, mm de dedo), las declaro acá en
 *    `SCALES` y las devuelve compute(); `chart.bands` queda con la escala de la
 *    rama por defecto (ropa) para que el dato viva también en el HTML estático.
 */
export const hub: HubData = {
  slug: 'conversores/talles',
  title: 'Conversor de talles 2026: ropa y calzado AR, US, EU y UK',
  description:
    'Averiguá tu talle con tus medidas en centímetros y velo convertido a AR, US, EU y UK. Ropa y jeans por busto, cintura y cadera; zapatillas por largo del pie; corpiño por contorno y copa; anillo por circunferencia del dedo.',
  silo: 'Conversores',
  siloHref: '/conversores',

  eyebrow: 'Guía de talles y equivalencias',
  h1: 'Conversor de talles AR, US, EU y UK',
  lede:
    'Con una cinta métrica y dos números sabés tu talle real, y de paso el equivalente argentino, estadounidense, europeo y británico. Arrancamos por la ropa, que es lo que más se busca; si venís por zapatillas, corpiño o anillo, cambiá la rama.',
  stamps: [
    'Actualizado 04-08-2026',
    'IRAM 75300 · ISO 8559-1 · ISO 9407 (Mondopoint)',
    '11 calculadoras adentro',
  ],

  resultLabel: 'Tu talle estimado',

  cases: {
    title: '¿Qué estás por comprar?',
    intro:
      'Partimos por ropa, que es la consulta más frecuente. Si buscás calzado, corpiño o anillo, elegí tu caso: cambian las medidas que hay que tomar y la tabla que se aplica.',
    items: [
      {
        id: 'ropa',
        label: 'Ropa y jeans',
        hint: 'Remeras, camisas, vestidos y pantalones',
        answer: 'Tu talle sale del contorno de busto o pecho; el pantalón manda la cintura y la cadera.',
        yes: [
          'Medí el contorno más ancho del busto o del pecho, con la cinta paralela al piso y sin apretar',
          'La cintura se mide en la parte más angosta del torso, a la altura del ombligo o apenas arriba',
          'La cadera se mide en la parte más ancha de la cola, y es la que manda en pantalones y vestidos',
          'El talle de jeans W/L es en pulgadas: W es la cintura y L el largo de entrepierna',
          'En Argentina rige la Ley 27.521 de Talles, con el sistema único (SUNITI) construido sobre las medidas del estudio antropométrico nacional',
        ],
        warn: [
          'El talle US corre más holgado que el AR/EU: un M argentino suele ser un S estadounidense en la misma marca global',
          'La letra no es una norma: cada marca arma su molde, así que la tabla es orientativa y la ficha del producto manda',
          'Si busto y cintura te dan talles distintos, elegí el mayor y ajustá con arreglos: agrandar no se puede',
          'La tabla de ropa cubre adulto; en chicos el talle va por edad y altura, no por contorno',
        ],
        plazo: 'medite en ropa interior y con la cinta ceñida pero sin marcar la piel; a la tarde el cuerpo mide algo más que a la mañana.',
      },
      {
        id: 'calzado',
        label: 'Zapatillas y calzado',
        hint: 'Por largo del pie en centímetros',
        answer: 'El talle sale del largo del pie: en Argentina y Europa la numeración es la misma.',
        yes: [
          'Apoyá el pie sobre una hoja contra la pared y marcá el dedo más largo: esa distancia en cm es tu medida',
          'AR y EU comparten numeración porque las dos derivan del largo del pie (punto París / Mondopoint, ISO 9407)',
          'Medí los dos pies y usá el más largo: casi nadie los tiene iguales',
          'Para running o medias gruesas sumá medio talle de holgura',
        ],
        warn: [
          'Nike suele calzar medio número más chico que Adidas o Puma con el mismo número impreso',
          'El talle US de mujer es 1,5 números más alto que el de hombre para el mismo pie',
          'Medí al final del día: el pie se hincha y un talle justo a la mañana aprieta a la tarde',
          'En niños conviene un talle de más: el pie crece cerca de 1 cm por año hasta los 10',
        ],
        plazo: 'medí de parado y con el peso repartido en los dos pies, que es cuando el pie alcanza su largo real.',
      },
      {
        id: 'corpino',
        label: 'Corpiño o sostén',
        hint: 'Contorno bajo el busto + copa',
        answer: 'La banda sale del contorno bajo el busto y la copa, de la diferencia con el contorno del busto.',
        yes: [
          'Contorno bajo el busto: la cinta justo debajo del pecho, bien ceñida y horizontal',
          'Contorno del busto: la cinta sobre la parte más prominente, sin apretar',
          'La copa es la diferencia entre las dos medidas: cada 2 cm de diferencia es una letra',
          'La banda europea va en centímetros (75, 80, 85) y la argentina suma 15 (90, 95, 100)',
        ],
        warn: [
          'La copa no es un tamaño absoluto: una 85B y una 95B no tienen el mismo volumen, porque la copa se lee contra su banda',
          'En US y UK la copa E se llama DD, y de ahí para arriba las letras se desalinean entre sistemas',
          'Si la banda se te sube por la espalda, te queda grande: bajá una banda y subí una copa',
          'La medida cambia con el ciclo, el embarazo y la lactancia: reconfirmala cada tanto',
        ],
        plazo: 'medite sin corpiño o con uno sin relleno; con push-up la diferencia se infla y la copa sale más grande de lo real.',
      },
      {
        id: 'anillo',
        label: 'Anillo',
        hint: 'Por circunferencia del dedo en milímetros',
        answer: 'El talle argentino es directamente la circunferencia del dedo en milímetros.',
        yes: [
          'Envolvé el dedo con un hilo o una tira de papel, marcá dónde se cierra y medí esos milímetros',
          'En Argentina y buena parte de Europa el talle ES la circunferencia interior en mm (ISO 8653)',
          'El diámetro interior es la circunferencia dividida por π, y es lo que suele figurar en la joyería',
          'Medí el dedo donde va el anillo, no la falange: si el nudillo es más grueso, medí también ahí',
        ],
        warn: [
          'El dedo se hincha con el calor, el ejercicio y la sal: medí al final del día y en reposo',
          'Los anillos anchos (más de 6 mm) calzan más ajustados: sumá medio talle',
          'La talla española no es la argentina: la española es la circunferencia menos 40',
          'Un anillo de compromiso sorpresa se saca casi siempre medio talle grande: agrandar es más fácil que achicar',
        ],
        plazo: 'a la mañana temprano y con frío el dedo mide hasta 1 mm menos: no es el momento de medir.',
      },
    ],
  },

  inputsTitle: 'Tus medidas',
  inputsIntro:
    'Completá sólo las que use tu caso: la rama que elegiste arriba ignora el resto. Todo va en centímetros salvo el dedo, que va en milímetros.',
  fields: [
    {
      id: 'genero',
      label: 'Tabla de talles',
      type: 'select',
      value: 'mujer',
      options: [
        { value: 'mujer', label: 'Mujer' },
        { value: 'hombre', label: 'Hombre' },
        { value: 'nino', label: 'Niño/a (sólo calzado)' },
      ],
      help: 'La tabla de ropa cubre adulto; en calzado sí hay numeración infantil.',
    },
    { id: 'busto', label: 'Contorno de busto o pecho', type: 'number', min: 50, max: 180, step: 0.5, value: 92, suffix: 'cm' },
    { id: 'cintura', label: 'Contorno de cintura', type: 'number', min: 40, max: 180, step: 0.5, value: 74, suffix: 'cm' },
    { id: 'cadera', label: 'Contorno de cadera', type: 'number', min: 50, max: 200, step: 0.5, value: 98, suffix: 'cm' },
    { id: 'entrepierna', label: 'Largo de entrepierna (para el L del jean)', type: 'number', min: 45, max: 110, step: 0.5, value: 78, suffix: 'cm' },
    { id: 'pie', label: 'Largo del pie (calzado)', type: 'number', min: 15, max: 35, step: 0.1, value: 25, suffix: 'cm' },
    { id: 'bajoBusto', label: 'Contorno bajo el busto (corpiño)', type: 'number', min: 55, max: 130, step: 0.5, value: 78, suffix: 'cm' },
    { id: 'dedo', label: 'Circunferencia del dedo (anillo)', type: 'number', min: 35, max: 80, step: 0.5, value: 54, suffix: 'mm' },
  ],
  fineprint:
    'Los talles de indumentaria no tienen un estándar legal único entre marcas: la tabla es la equivalencia comercial promedio y la ficha del fabricante siempre manda. Los jeans se calculan con ajuste regular, sin holgura extra.',

  chart: {
    type: 'scale',
    title: 'Dónde caés en la escala de talles',
    caption:
      'La regla muestra la escala de talles de tu rama con tu medida marcada encima, y el equivalente en AR, US, EU y UK en la etiqueta. Las franjas son los tramos de cada talle: si caés cerca de un borde, estás entre dos talles y conviene probarte los dos.',
    bands: [
      { label: 'XS — busto 78 a 84 cm', from: 78, to: 84, tone: 'neutral' },
      { label: 'S — busto 84 a 90 cm', from: 84, to: 90, tone: 'good' },
      { label: 'M — busto 90 a 96 cm', from: 90, to: 96, tone: 'good' },
      { label: 'L — busto 96 a 104 cm', from: 96, to: 104, tone: 'good' },
      { label: 'XL — busto 104 a 112 cm', from: 104, to: 112, tone: 'warn' },
      { label: 'XXL — busto 112 a 118 cm', from: 112, to: 118, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Tu talle en cada sistema',
  breakdownIntro:
    'Las medidas que tomaste arriba y el mismo talle leído en cada país. El número de talle no es una cantidad: las barras sólo ordenan, mirá el valor.',

  faq: [
    {
      q: '¿Cómo sé qué talle de ropa soy?',
      a: 'Medí el contorno de busto o pecho en la parte más ancha, con la cinta paralela al piso y sin apretar, y cruzalo con la tabla. En mujer, 78-82 cm es XS, 84-88 S, 90-94 M, 96-102 L, 104-110 XL y 112-118 XXL. En hombre las mismas letras arrancan más arriba: 81-86 cm XS, 89-94 S, 97-102 M, 104-112 L, 114-122 XL. Si busto y cintura te dan letras distintas, mandá la mayor: achicar una prenda es fácil, agrandarla no.',
    },
    {
      q: '¿Cuánto es un talle 8 US en argentino?',
      a: 'Un talle 8 de mujer estadounidense equivale a un M, que en Argentina es un 42 y en Europa un 40. La escala completa de mujer es: US 0-2 = AR 36 (XS), US 4-6 = AR 38-40 (S), US 8-10 = AR 42 (M), US 12-14 = AR 44-46 (L), US 16-18 = AR 48 (XL) y US 20-22 = AR 50 (XXL). Ojo que el molde estadounidense corre más holgado, así que en la misma marca global un M argentino suele entrar como S.',
    },
    {
      q: '¿El talle de zapatillas argentino es igual al europeo?',
      a: 'Sí. Argentina y Europa usan la misma numeración porque las dos derivan del largo del pie (punto París, formalizado en la ISO 9407 / Mondopoint). Un 42 argentino es un 42 europeo. Lo que cambia es el US: un pie de 26 cm es AR/EU 41,5, US 8 de hombre y US 9,5 de mujer. La numeración estadounidense de mujer va 1,5 números por encima de la de hombre para el mismo pie.',
    },
    {
      q: '¿Cómo mido el largo de mi pie para saber el talle?',
      a: 'Apoyá el talón contra la pared, parado y con el peso repartido, poné una hoja abajo y marcá el punto del dedo más largo (que no siempre es el gordo). La distancia desde la pared hasta esa marca, en centímetros, es tu medida. Medí los dos pies y usá el más largo, hacelo al final del día y sumá medio talle si vas a usar medias gruesas o correr.',
    },
    {
      q: '¿Cómo se calcula la talla de corpiño?',
      a: 'Con dos medidas. El contorno bajo el busto, bien ceñido, define la banda: se redondea al múltiplo de 5 más cercano y ese es el número europeo (75, 80, 85); el argentino le suma 15 (90, 95, 100). La copa sale de la diferencia entre el contorno del busto y el contorno bajo el busto: 10 cm es AA, 12 cm A, 14 cm B, 16 cm C, 18 cm D, 20 cm E (que en US y UK se llama DD), 22 cm F y así cada 2 cm.',
    },
    {
      q: 'Si me queda mal el corpiño, ¿qué cambio, la banda o la copa?',
      a: 'Si la banda se te sube por la espalda o gira, te queda grande: bajá una banda y subí una copa, que mantiene el volumen (una 85B y una 80C sostienen parecido). Si el aro se apoya sobre el pecho en vez de rodearlo, la copa es chica. Si la banda te marca y no podés respirar, subí una banda y bajá una copa. Casi todo el sostén lo hace la banda, no las tiras.',
    },
    {
      q: '¿Cómo saber la talla de anillo sin ir a la joyería?',
      a: 'Envolvé el dedo con un hilo fino o una tira de papel, marcá con birome dónde se cierra el círculo, estirala y medí los milímetros. Ese número es directamente tu talle argentino y europeo: 54 mm de circunferencia es un talle 54, que equivale a un diámetro interior de 17,2 mm y a un US 6,9. Medí a la tarde y con el dedo en reposo, y si el nudillo es más grueso que la base, medí también ahí y elegí el mayor de los dos.',
    },
    {
      q: '¿Qué talle de jean soy y qué significa W y L?',
      a: 'W (waist) es la cintura en pulgadas y L (length) el largo de entrepierna, también en pulgadas. Una cintura de 76 cm es W30, y una entrepierna de 78 cm es L30 (76 ÷ 2,54 ≈ 30). El talle AR/EU del pantalón se calcula contra la mayor de dos referencias, la cintura o la cadera, porque un pantalón que entra en la cintura pero no en la cadera no sirve: por eso conviene medir las dos y quedarse con el talle más grande.',
    },
    {
      q: '¿Por qué el talle US me queda distinto al argentino?',
      a: 'Por el vanity sizing: las marcas estadounidenses bajaron los números de talle a lo largo de las décadas manteniendo las medidas, así que la misma prenda que hace treinta años era un 12 hoy se etiqueta 8. En la práctica, el molde US es más holgado que el AR/EU en la misma letra. Por eso la única medida confiable es el centímetro: comparar tu busto y tu cintura contra la tabla del fabricante, no la letra.',
    },
    {
      q: '¿En Argentina hay una ley de talles?',
      a: 'Sí, la Ley 27.521 de Talles, sancionada en 2019 y reglamentada después, crea el Sistema Único Normalizado de Identificación de Talles de Indumentaria (SUNITI). El sistema se construyó sobre un estudio antropométrico nacional y obliga a identificar las prendas por las medidas del cuerpo, no sólo por una letra. Está en implementación progresiva, así que hoy conviven etiquetas con el sistema nuevo y con la tabla comercial de siempre.',
    },
    {
      q: '¿Sirve esta tabla para ropa de chicos?',
      a: 'No. En indumentaria infantil el talle va por edad y por altura, no por contorno: un talle 6 corresponde aproximadamente a 116 cm de altura, un talle 8 a 128 cm y un talle 10 a 140 cm. Para calzado sí funciona la numeración por largo del pie, y la rama de calzado de este hub incluye la tabla infantil.',
    },
  ],

  sources: [
    {
      name: 'Ley 27.521 — Sistema Único Normalizado de Identificación de Talles de Indumentaria (SUNITI)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/330000-334999/333208/norma.htm',
      publisher: 'InfoLeg — Información Legislativa',
      date: '2019, con reglamentación posterior',
    },
    {
      name: 'IRAM 75300 — Designación de talles de indumentaria',
      url: 'https://www.iram.org.ar/',
      publisher: 'Instituto Argentino de Normalización y Certificación (IRAM)',
    },
    {
      name: 'ISO 8559-1:2017 — Size designation of clothes: anthropometric definitions for body measurement',
      url: 'https://www.iso.org/standard/61686.html',
      publisher: 'International Organization for Standardization',
    },
    {
      name: 'ISO 9407:2019 — Shoe sizes: Mondopoint system of sizing and marking',
      url: 'https://www.iso.org/standard/72659.html',
      publisher: 'International Organization for Standardization',
    },
    {
      name: 'ISO 8653:2016 — Jewellery: ring sizes, definition, measurement and designation',
      url: 'https://www.iso.org/standard/69746.html',
      publisher: 'International Organization for Standardization',
    },
  ],

  replaces: [
    '/calculadora-talla-sosten-corpino',
    '/calculadora-talla-anillo-dedo',
    '/calculadora-lana-tejer-prenda-agujas',
    '/calculadora-conversor-talles-calzado-us-ar-eu',
    '/calculadora-tallas-ropa-internacional',
    '/calculadora-talle-zapatilla-conversion',
    '/calculadora-tela-necesaria-prenda-vestido',
    '/calculadora-talla-pantalon-jeans',
    '/calculadora-conversor-talles-ropa-us-ar-eu',
    '/calculadora-zapatilla-usa-a-europa',
    '/calculadora-color-cabello-tono-piel',
  ],

  lastReviewed: '2026-08-04',
  audience: 'AR',
};

/**
 * Tabla maestra de ROPA.
 *  - mujer: equivalencias y rangos de busto/cintura de `conversor-talles-ropa-us-ar-eu`
 *    (US/AR/EU/busto/cintura) cruzadas con el UK de `talla-ropa-internacional`.
 *  - hombre: letras y equivalencias de `talla-ropa-internacional` (el US de hombre
 *    ES el pecho en pulgadas, de ahí salen los rangos en cm).
 * `arNum`/`euNum`/`usNum`/`ukNum` son el punto medio del rango, para el desglose.
 */
export interface RopaRow {
  letra: string;
  us: string;
  usNum: number;
  ar: string;
  arNum: number;
  eu: string;
  euNum: number;
  uk: string;
  ukNum: number;
  bustoMin: number;
  bustoMax: number;
  cinturaMin: number;
  cinturaMax: number;
}

export const ROPA: Record<'mujer' | 'hombre', RopaRow[]> = {
  mujer: [
    { letra: 'XS', us: '0-2', usNum: 1, ar: '36', arNum: 36, eu: '32-34', euNum: 33, uk: '4-6', ukNum: 5, bustoMin: 78, bustoMax: 82, cinturaMin: 60, cinturaMax: 64 },
    { letra: 'S', us: '4-6', usNum: 5, ar: '38-40', arNum: 39, eu: '36-38', euNum: 37, uk: '8-10', ukNum: 9, bustoMin: 84, bustoMax: 88, cinturaMin: 66, cinturaMax: 70 },
    { letra: 'M', us: '8-10', usNum: 9, ar: '42', arNum: 42, eu: '40', euNum: 40, uk: '12-14', ukNum: 13, bustoMin: 90, bustoMax: 94, cinturaMin: 72, cinturaMax: 76 },
    { letra: 'L', us: '12-14', usNum: 13, ar: '44-46', arNum: 45, eu: '42-44', euNum: 43, uk: '16-18', ukNum: 17, bustoMin: 96, bustoMax: 102, cinturaMin: 78, cinturaMax: 84 },
    { letra: 'XL', us: '16-18', usNum: 17, ar: '48', arNum: 48, eu: '46-48', euNum: 47, uk: '20-22', ukNum: 21, bustoMin: 104, bustoMax: 110, cinturaMin: 86, cinturaMax: 92 },
    { letra: 'XXL', us: '20-22', usNum: 21, ar: '50', arNum: 50, eu: '50', euNum: 50, uk: '24', ukNum: 24, bustoMin: 112, bustoMax: 118, cinturaMin: 94, cinturaMax: 100 },
  ],
  hombre: [
    { letra: 'XS', us: '32-34', usNum: 33, ar: '42-44', arNum: 43, eu: '42-44', euNum: 43, uk: '32-34', ukNum: 33, bustoMin: 81, bustoMax: 86, cinturaMin: 68, cinturaMax: 73 },
    { letra: 'S', us: '36-38', usNum: 37, ar: '46-48', arNum: 47, eu: '46-48', euNum: 47, uk: '36-38', ukNum: 37, bustoMin: 89, bustoMax: 94, cinturaMin: 76, cinturaMax: 81 },
    { letra: 'M', us: '40-42', usNum: 41, ar: '50-52', arNum: 51, eu: '50-52', euNum: 51, uk: '40-42', ukNum: 41, bustoMin: 97, bustoMax: 102, cinturaMin: 84, cinturaMax: 89 },
    { letra: 'L', us: '44-46', usNum: 45, ar: '54-56', arNum: 55, eu: '54-56', euNum: 55, uk: '44-46', ukNum: 45, bustoMin: 104, bustoMax: 112, cinturaMin: 92, cinturaMax: 99 },
    { letra: 'XL', us: '48-50', usNum: 49, ar: '58-60', arNum: 59, eu: '58-60', euNum: 59, uk: '48-50', ukNum: 49, bustoMin: 114, bustoMax: 122, cinturaMin: 102, cinturaMax: 109 },
    { letra: 'XXL', us: '52', usNum: 52, ar: '62-64', arNum: 63, eu: '62-64', euNum: 63, uk: '52', ukNum: 52, bustoMin: 124, bustoMax: 132, cinturaMin: 112, cinturaMax: 119 },
  ],
};

/**
 * CALZADO — mismas fórmulas que `talle-zapatilla-conversion`:
 *   EU = redondeo al 0,5 de (cm + 1,5) × 1,5      (punto París + 15 mm de horma)
 *   US = redondeo al 0,5 de (cm − offset)          offset 18 hombre, 16,5 mujer, 7 niño
 *   UK = US + ukDelta                              −0,5 hombre/niño, −2 mujer
 *   AR = EU
 */
export const CALZADO: Record<string, { offset: number; ukDelta: number; label: string }> = {
  hombre: { offset: 18, ukDelta: -0.5, label: 'hombre' },
  mujer: { offset: 16.5, ukDelta: -2, label: 'mujer' },
  nino: { offset: 7, ukDelta: -0.5, label: 'niño/a' },
};

/** CORPIÑO — diferencia busto − bajo busto (cm) → letra de copa. */
export const COPAS: Array<{ diff: number; letra: string }> = [
  { diff: 10, letra: 'AA' },
  { diff: 12, letra: 'A' },
  { diff: 14, letra: 'B' },
  { diff: 16, letra: 'C' },
  { diff: 18, letra: 'D' },
  { diff: 20, letra: 'E (DD)' },
  { diff: 22, letra: 'F' },
  { diff: 24, letra: 'G' },
  { diff: 26, letra: 'H' },
  { diff: 28, letra: 'I' },
];

/** ANILLO — letras británicas, de F a Z, a partir de 44,2 mm cada 1,25 mm. */
export const UK_ANILLO = ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

/**
 * Escala del gráfico por rama. `from`/`to` van en la unidad de la rama y las
 * franjas son contiguas, que es lo que el render posicional necesita.
 */
export interface ScaleDef {
  min: number;
  max: number;
  unit: string;
  bands: Array<{ label: string; from: number; to: number; tone: 'good' | 'warn' | 'neutral' }>;
}

export const SCALES: Record<string, ScaleDef> = {
  calzado: {
    min: 15,
    max: 35,
    unit: 'cm de pie',
    bands: [
      { label: 'Infantil — 15 a 20 cm (AR/EU 25 a 32)', from: 15, to: 20, tone: 'neutral' },
      { label: 'Junior — 20 a 23 cm (AR/EU 32 a 37)', from: 20, to: 23, tone: 'neutral' },
      { label: 'Adulto chico — 23 a 26 cm (AR/EU 37 a 41)', from: 23, to: 26, tone: 'good' },
      { label: 'Adulto medio — 26 a 29 cm (AR/EU 41 a 46)', from: 26, to: 29, tone: 'good' },
      { label: 'Adulto grande — 29 a 35 cm (AR/EU 46 a 55)', from: 29, to: 35, tone: 'warn' },
    ],
  },
  corpino: {
    min: 8,
    max: 30,
    unit: 'cm de diferencia',
    bands: [
      { label: 'Copa AA — hasta 11 cm', from: 8, to: 11, tone: 'neutral' },
      { label: 'Copa A — 11 a 13 cm', from: 11, to: 13, tone: 'neutral' },
      { label: 'Copa B — 13 a 15 cm', from: 13, to: 15, tone: 'good' },
      { label: 'Copa C — 15 a 17 cm', from: 15, to: 17, tone: 'good' },
      { label: 'Copa D — 17 a 19 cm', from: 17, to: 19, tone: 'good' },
      { label: 'Copa E (DD) — 19 a 21 cm', from: 19, to: 21, tone: 'warn' },
      { label: 'Copa F — 21 a 23 cm', from: 21, to: 23, tone: 'warn' },
      { label: 'Copa G o más — 23 cm en adelante', from: 23, to: 30, tone: 'warn' },
    ],
  },
  anillo: {
    min: 40,
    max: 80,
    unit: 'mm de circunferencia',
    bands: [
      { label: 'Talle 40 a 48 — dedos finos', from: 40, to: 48, tone: 'neutral' },
      { label: 'Talle 48 a 54 — el rango más común en mujer', from: 48, to: 54, tone: 'good' },
      { label: 'Talle 54 a 60 — rango compartido', from: 54, to: 60, tone: 'good' },
      { label: 'Talle 60 a 66 — el rango más común en hombre', from: 60, to: 66, tone: 'good' },
      { label: 'Talle 66 a 80 — dedos gruesos', from: 66, to: 80, tone: 'warn' },
    ],
  },
};
