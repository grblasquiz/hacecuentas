import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántas plantas me entran acá?"
 *
 * Une las cinco calculadoras de densidad de plantación que estaban sueltas.
 * Todas responden la misma pregunta con distinta cara: cuántas unidades
 * (plantas, semillas o gramos de semilla) entran por metro cuadrado o por metro
 * lineal, y cuántas necesitás comprar para el espacio que tenés.
 *
 * DESLINDE con /jardin/huerta: aquel hub responde CUÁNDO (calendario de siembra,
 * heladas, días de germinación, profundidad). Éste responde CUÁNTO y a qué
 * distancia. Por eso `semillas-por-m2-huerta` vive acá y no allá: la pregunta
 * "cuántas semillas compro para 10 m²" es de cantidad, no de fecha.
 *
 * Nada de lo que sale acá es plata: cada fila declara `format` explícito.
 */
export const hub: HubData = {
  slug: 'jardin/cuantas-plantas',
  title: 'Cuántas plantas entran: espaciado, seto, semillas y césped | Hacé Cuentas',
  description:
    'A qué distancia va cada especie y cuántas plantas entran en tu cantero, cuántas necesitás para un seto de X metros, cuántas semillas por metro cuadrado de huerta, cuántas plantas en un jardín vertical y cuántos kilos de semilla de césped.',
  silo: 'Jardín',
  siloHref: '/jardin',

  eyebrow: 'Densidad de plantación',
  h1: '¿Cuántas plantas me entran acá?',
  lede:
    'Partimos de lo más común: tenés un cantero de tantos por tantos y querés saber a qué distancia va cada cosa y cuántas plantas entran. Si lo tuyo es un seto, una pared verde, semillas de huerta o césped, cambiá el caso abajo.',
  stamps: ['Distancias INTA y RHS', 'Cantero, seto, pared y césped', '5 calculadoras adentro'],

  resultLabel: 'Cuántas te entran',

  cases: {
    title: '¿Qué estás plantando?',
    intro:
      'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo: cada uno tiene su propia distancia de referencia.',
    items: [
      {
        id: 'cantero',
        label: 'Un cantero de huerta',
        hint: 'Plantines de tomate, lechuga, zapallo…',
        answer: 'La cuenta sale de dos distancias: entre plantas y entre hileras.',
        yes: [
          'Distancia entre plantas y entre hileras de la especie que elijas',
          'Cuántas hileras entran a lo ancho y cuántas plantas por hilera a lo largo',
          'Total de plantas y densidad en plantas por metro cuadrado',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'El cálculo cuenta una planta en cada extremo del cantero: si el borde queda pegado al camino o a la pared, restá una hilera',
          'Las distancias son de plena tierra. En maceta o cajón elevado achicá el marco de plantación y compensá con más riego y abono',
        ],
        plazo: 'medí el cantero antes de comprar plantines: sobran más veces de las que faltan.',
      },
      {
        id: 'seto',
        label: 'Un seto o cerco vivo',
        hint: 'Tuya, ligustro o bambú por metro lineal',
        answer: 'El seto se cuenta por metro lineal: una planta cada 40 cm a 1 m según la especie.',
        yes: [
          'Cuántas plantas necesitás para los metros lineales que tenés',
          'La distancia de plantación recomendada de esa especie',
          'Cuánto tarda en cerrar según lo apretado que lo plantes',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Plantar más junto tapa antes pero sale más caro y a los años competen entre sí: respetá la distancia y ganás salud del seto',
          'El bambú corredor es invasivo: va con barrera antirrizoma o vas a estar sacándolo del vecino',
        ],
        plazo: 'un seto plantado a la distancia correcta cierra en dos o tres temporadas.',
      },
      {
        id: 'semillas',
        label: 'Semillas para la huerta',
        hint: 'Cuántas semillas por metro cuadrado',
        answer: 'La densidad va de 10 semillas por m² en tomate a 200 en zanahoria.',
        yes: [
          'Cuántas semillas necesitás para los metros cuadrados que vas a sembrar',
          'La densidad de siembra en semillas por metro cuadrado de esa especie',
          'El extra a sumar por las que no germinan',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Sembrá un 10 a 15% de más: ninguna partida de semillas germina al 100% y la vieja germina bastante menos',
          'Si sembrás a la densidad final no vas a poder ralear, y sin raleo la zanahoria y el rabanito salen finitos',
        ],
        plazo: 'la semilla guardada pierde poder germinativo cada año: revisá la fecha del sobre.',
      },
      {
        id: 'vertical',
        label: 'Un jardín vertical',
        hint: 'Bolsillos, módulos, palets o tubos',
        answer: 'Según el sistema entran de 10 a 25 plantas por metro cuadrado de pared.',
        yes: [
          'Superficie aprovechable de la pared y plantas que entran en total',
          'Densidad del sistema que elegiste, en plantas por metro cuadrado',
          'Qué plantas van bien en ese sistema',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'La pared verde se seca mucho más rápido que el suelo: sin riego automatizado el sistema de tubos y el de bolsillos no se sostienen',
          'Pesa: un metro cuadrado plantado y regado puede pasar los 40 kg. Verificá que la pared o la estructura lo banquen',
        ],
        plazo: 'comprá un 10 a 15% de plantas extra para reponer las que no prendan.',
      },
      {
        id: 'cesped',
        label: 'Sembrar césped',
        hint: 'Cuántos kilos de semilla por m²',
        answer: 'De 30 a 45 gramos por metro cuadrado, y la mitad si es resiembra.',
        yes: [
          'Kilos de semilla para tu superficie y gramos por metro cuadrado de esa mezcla',
          'Cuántas bolsas de un kilo comprar',
          'La mejor época de siembra para la mezcla elegida',
        ],
        warn: [
          'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Sembrar de más no da un césped más tupido: da plantas débiles que compiten entre sí y se enferman',
          'Los primeros 20 días el suelo no se puede secar: si no vas a poder regar todos los días, no siembres todavía',
        ],
        plazo: 'la germinación tarda de 7 a 21 días según la mezcla y la temperatura del suelo.',
      },
    ],
  },

  inputsTitle: 'Las medidas de tu espacio',
  inputsIntro: 'Cada caso usa los campos que le corresponden; los demás podés dejarlos como están.',
  fields: [
    {
      id: 'especie',
      label: 'Cantero: especie',
      type: 'select',
      value: 'tomate',
      options: [
        { value: 'tomate', label: 'Tomate' },
        { value: 'lechuga', label: 'Lechuga' },
        { value: 'pimiento', label: 'Pimiento' },
        { value: 'zanahoria', label: 'Zanahoria' },
        { value: 'cebolla', label: 'Cebolla' },
        { value: 'zapallo', label: 'Zapallo' },
        { value: 'pepino', label: 'Pepino' },
        { value: 'berenjena', label: 'Berenjena' },
        { value: 'maiz', label: 'Maíz' },
        { value: 'frutilla', label: 'Frutilla' },
        { value: 'albahaca', label: 'Albahaca' },
        { value: 'espinaca', label: 'Espinaca' },
        { value: 'acelga', label: 'Acelga' },
        { value: 'rabanito', label: 'Rabanito' },
        { value: 'repollo', label: 'Repollo' },
        { value: 'brocoli', label: 'Brócoli' },
      ],
    },
    { id: 'largoM', label: 'Cantero: largo (m)', type: 'number', min: 0.2, max: 200, step: 0.1, value: 3 },
    { id: 'anchoM', label: 'Cantero: ancho (m)', type: 'number', min: 0.2, max: 50, step: 0.1, value: 1.2 },
    { id: 'metrosSeto', label: 'Seto: metros lineales', type: 'number', min: 1, max: 2000, step: 0.5, value: 10 },
    {
      id: 'especieSeto',
      label: 'Seto: especie',
      type: 'select',
      value: 'tuya',
      options: [
        { value: 'tuya', label: 'Tuya (0,8 m)' },
        { value: 'liguster', label: 'Ligustro (0,4 m)' },
        { value: 'bambu', label: 'Bambú (1 m)' },
      ],
    },
    { id: 'superficieM2', label: 'Huerta: metros cuadrados a sembrar', type: 'number', min: 0.5, max: 5000, step: 0.5, value: 10 },
    {
      id: 'especieSemilla',
      label: 'Huerta: especie a sembrar',
      type: 'select',
      value: 'lechuga',
      options: [
        { value: 'lechuga', label: 'Lechuga (60 semillas/m²)' },
        { value: 'tomate', label: 'Tomate (10 semillas/m²)' },
        { value: 'zanahoria', label: 'Zanahoria (200 semillas/m²)' },
        { value: 'rabano', label: 'Rabanito (110 semillas/m²)' },
        { value: 'espinaca', label: 'Espinaca (100 semillas/m²)' },
      ],
    },
    { id: 'anchoPared', label: 'Jardín vertical: ancho de la pared (m)', type: 'number', min: 0.2, max: 50, step: 0.1, value: 2 },
    { id: 'altoPared', label: 'Jardín vertical: alto aprovechable (m)', type: 'number', min: 0.2, max: 10, step: 0.1, value: 1.5 },
    {
      id: 'sistema',
      label: 'Jardín vertical: sistema',
      type: 'select',
      value: 'bolsillos',
      options: [
        { value: 'bolsillos', label: 'Bolsillos de fieltro (25/m²)' },
        { value: 'modulos', label: 'Módulos plásticos (16/m²)' },
        { value: 'macetas', label: 'Macetas colgadas (12/m²)' },
        { value: 'palets', label: 'Palets reciclados (10/m²)' },
        { value: 'tubos', label: 'Tubos horizontales (20/m²)' },
      ],
    },
    { id: 'superficieCesped', label: 'Césped: superficie (m²)', type: 'number', min: 1, max: 100000, thousands: true, value: 100 },
    {
      id: 'tipoSiembra',
      label: 'Césped: siembra nueva o resiembra',
      type: 'select',
      value: 'nueva',
      options: [
        { value: 'nueva', label: 'Siembra nueva (suelo pelado)' },
        { value: 'resiembra', label: 'Resiembra sobre césped existente' },
      ],
    },
    {
      id: 'mezcla',
      label: 'Césped: mezcla',
      type: 'select',
      value: 'premium',
      options: [
        { value: 'premium', label: 'Premium (35 g/m²)' },
        { value: 'ryegrass', label: 'Ryegrass (35 g/m²)' },
        { value: 'festuca', label: 'Festuca (40 g/m²)' },
        { value: 'bermuda', label: 'Bermuda (30 g/m²)' },
        { value: 'deportivo', label: 'Deportivo (45 g/m²)' },
      ],
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Las distancias son marcos de plantación de referencia: el clima, el suelo y la variedad los mueven.',

  chart: {
    type: 'scale',
    title: 'Qué tan denso estás plantando',
    caption:
      'El eje son las unidades que entran en cada metro cuadrado: plantas en el cantero y en la pared verde, semillas en la huerta, gramos de semilla en el césped y plantas por metro lineal en el seto. Sirve para ver de un vistazo si tu marco de plantación es holgado o apretado.',
    bands: [
      { label: 'Muy espaciado', from: 0, to: 5, tone: 'neutral' },
      { label: 'Holgado', from: 5, to: 20, tone: 'good' },
      { label: 'Medio', from: 20, to: 50, tone: 'good' },
      { label: 'Denso', from: 50, to: 120, tone: 'warn' },
      { label: 'Muy denso', from: 120, to: 200, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Los números de tu plantación',
  breakdownIntro: 'Las barras comparan cada valor con el mayor de la lista.',

  faq: [
    {
      q: '¿A qué distancia se plantan los tomates?',
      a: '55 cm entre plantas y 80 cm entre hileras. Es la distancia de plena tierra con planta conducida a uno o dos brotes: si la dejás libre necesita más. En un cantero de 3 × 1,2 m entran alrededor de 12 plantas.',
    },
    {
      q: '¿Cuántas lechugas entran por metro cuadrado?',
      a: 'Con 25 cm entre plantas y 30 cm entre hileras, alrededor de 13 plantas por metro cuadrado. Es de las hortalizas que mejor aprovechan el espacio, y por eso se usa para intercalar entre cultivos de marco grande como el tomate o la berenjena.',
    },
    {
      q: '¿Cuántas plantas necesito para 10 metros de seto?',
      a: 'Depende de la especie. Tuya a 0,8 m: 13 plantas. Ligustro a 0,4 m: 25 plantas, porque es de crecimiento rápido y se planta más junto. Bambú a 1 m: 10 plantas. La cuenta redondea siempre para arriba, así el seto llega hasta la punta.',
    },
    {
      q: '¿Conviene plantar el seto más junto para que cierre antes?',
      a: 'Cierra antes, sí, pero pagás más plantas y a los tres o cuatro años compiten por agua y luz: se afinan abajo y el seto queda ralo en la base, que es justo lo que no querés. La distancia recomendada ya está pensada para que cierre en dos o tres temporadas.',
    },
    {
      q: '¿Cuántas semillas por metro cuadrado se siembran?',
      a: 'Va con el tamaño de la planta adulta y de la semilla. Tomate 10 por m², lechuga 60, espinaca 100, rabanito 110 y zanahoria 200. En las de siembra directa y densa, como zanahoria y rabanito, la densidad alta es a propósito: después se ralea.',
    },
    {
      q: '¿Cuánto extra de semilla compro por las que no germinan?',
      a: 'Entre un 10 y un 15% arriba de lo que da la cuenta. Con semilla de la temporada anterior subí al 25%: el poder germinativo cae con los años y con el calor y la humedad del lugar donde la guardaste.',
    },
    {
      q: '¿Cuántas plantas entran en un jardín vertical?',
      a: 'Según el sistema: bolsillos de fieltro 25 por m², tubos horizontales 20, módulos plásticos 16, macetas colgadas 12 y palets reciclados 10. En una pared de 2 × 1,5 m con bolsillos son unas 75 plantas.',
    },
    {
      q: '¿Cuántos kilos de semilla de césped por metro cuadrado?',
      a: 'De 30 a 45 gramos por m² en siembra nueva según la mezcla: bermuda 30, ryegrass y premium 35, festuca 40 y deportivo 45. Para 100 m² de mezcla premium son 3,5 kg. En resiembra sobre césped existente va la mitad, porque el que ya está aporta cobertura.',
    },
    {
      q: '¿Cuándo se siembra el césped?',
      a: 'Las mezclas de estación fría —ryegrass, festuca y la mayoría de las premium y deportivas— van en otoño, entre marzo y abril, y como segunda opción a principios de primavera. La bermuda es de estación cálida y se siembra en primavera-verano, de octubre a diciembre.',
    },
    {
      q: '¿Por qué el cálculo del cantero cuenta una planta de más por hilera?',
      a: 'Porque cuenta una planta en cada extremo: si el cantero mide 3 m y la distancia es de 55 cm, entran seis plantas contando la del metro 0 y la del metro 2,75. Si el borde del cantero da contra una pared, un camino o el alambrado, restá una planta por hilera y una hilera del total.',
    },
    {
      q: '¿Y cuándo siembro cada cosa?',
      a: 'Eso es otra pregunta y tiene su propia calculadora: en el calendario de siembra están las fechas por zona, la primera y la última helada, los días de germinación según la temperatura y la profundidad de cada semilla. Este cálculo responde cuánto y a qué distancia, no cuándo.',
    },
    {
      q: '¿Las distancias sirven igual en maceta o cantero elevado?',
      a: 'Se achican, pero hay que compensar. En un cajón elevado con buen sustrato podés apretar hasta un 20% el marco de plantación porque las raíces encuentran mejor estructura, siempre que riegues más seguido y abones cada dos o tres semanas. En maceta manda el volumen de tierra por planta, no la distancia.',
    },
  ],

  sources: [
    {
      name: 'Manual de huerta agroecológica — marcos de plantación y densidades',
      url: 'https://inta.gob.ar/documentos/manual-de-huerta-agroecologica',
      publisher: 'INTA',
    },
    {
      name: 'Manual de horticultura para productores familiares — densidades de siembra',
      url: 'https://www.inta.gob.ar/documentos/manual-de-horticultura',
      publisher: 'INTA',
    },
    {
      name: 'Hedges: planting — distancias de plantación de setos',
      url: 'https://www.rhs.org.uk/plants/types/hedges/planting',
      publisher: 'Royal Horticultural Society',
    },
    {
      name: 'Planting and establishing trees and shrubs',
      url: 'https://extension.umn.edu/planting-and-growing-guides/planting-and-establishing-trees-and-shrubs',
      publisher: 'University of Minnesota Extension',
    },
    {
      name: 'Fisiología de semillas y germinación',
      url: 'https://inta.gob.ar/documentos/fisiologia-de-semillas',
      publisher: 'INTA',
    },
  ],

  replaces: [
    '/calculadora-distancia-entre-plantas-espaciado',
    '/calculadora-cantidad-plantas-seto-metros',
    '/calculadora-semillas-por-m2-huerta',
    '/calculadora-jardin-vertical-plantas-m2',
    '/calculadora-cesped-semillas-kg-m2',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
};

/** Marcos de plantación por especie, en cm. */
export const ESPECIES: Record<string, { entrePlantas: number; entreHileras: number; nombre: string }> = {
  tomate: { entrePlantas: 55, entreHileras: 80, nombre: 'Tomate' },
  lechuga: { entrePlantas: 25, entreHileras: 30, nombre: 'Lechuga' },
  pimiento: { entrePlantas: 45, entreHileras: 70, nombre: 'Pimiento' },
  zanahoria: { entrePlantas: 8, entreHileras: 25, nombre: 'Zanahoria' },
  cebolla: { entrePlantas: 12, entreHileras: 25, nombre: 'Cebolla' },
  zapallo: { entrePlantas: 120, entreHileras: 180, nombre: 'Zapallo' },
  pepino: { entrePlantas: 40, entreHileras: 100, nombre: 'Pepino' },
  berenjena: { entrePlantas: 50, entreHileras: 80, nombre: 'Berenjena' },
  maiz: { entrePlantas: 25, entreHileras: 70, nombre: 'Maíz' },
  frutilla: { entrePlantas: 30, entreHileras: 40, nombre: 'Frutilla' },
  albahaca: { entrePlantas: 25, entreHileras: 30, nombre: 'Albahaca' },
  espinaca: { entrePlantas: 15, entreHileras: 25, nombre: 'Espinaca' },
  acelga: { entrePlantas: 25, entreHileras: 40, nombre: 'Acelga' },
  rabanito: { entrePlantas: 5, entreHileras: 15, nombre: 'Rabanito' },
  repollo: { entrePlantas: 45, entreHileras: 60, nombre: 'Repollo' },
  brocoli: { entrePlantas: 45, entreHileras: 60, nombre: 'Brócoli' },
};

/** Distancia de plantación del seto, en metros. */
export const SETOS: Record<string, { dist: number; nombre: string }> = {
  tuya: { dist: 0.8, nombre: 'tuya' },
  liguster: { dist: 0.4, nombre: 'ligustro' },
  bambu: { dist: 1, nombre: 'bambú' },
};

/** Densidad de siembra, semillas por m². */
export const SEMILLAS_M2: Record<string, { d: number; nombre: string }> = {
  lechuga: { d: 60, nombre: 'lechuga' },
  tomate: { d: 10, nombre: 'tomate' },
  zanahoria: { d: 200, nombre: 'zanahoria' },
  rabano: { d: 110, nombre: 'rabanito' },
  espinaca: { d: 100, nombre: 'espinaca' },
};

/** Jardín vertical: plantas por m² y para qué sirve cada sistema. */
export const VERTICAL: Record<string, { d: number; nombre: string; consejo: string }> = {
  bolsillos: { d: 25, nombre: 'bolsillos de fieltro', consejo: 'Ideal para potus, helechos, tradescantia, suculentas y aromáticas. Necesita riego frecuente.' },
  modulos: { d: 16, nombre: 'módulos plásticos', consejo: 'Ideal para plantas con algo más de raíz. Buena retención de sustrato.' },
  macetas: { d: 12, nombre: 'macetas colgadas', consejo: 'Ideal para frutillas, aromáticas y suculentas. Mantenimiento individual fácil.' },
  palets: { d: 10, nombre: 'palets reciclados', consejo: 'Ideal para aromáticas, suculentas y plantas chicas. Económico y reciclable.' },
  tubos: { d: 20, nombre: 'tubos horizontales', consejo: 'Ideal para lechugas, frutillas y aromáticas. Buena densidad, pide riego automatizado.' },
};

/** Césped: gramos de semilla por m² en siembra nueva, y mejor época. */
export const CESPED: Record<string, { g: number; nombre: string; epoca: string }> = {
  bermuda: { g: 30, nombre: 'bermuda', epoca: 'primavera-verano (octubre a diciembre)' },
  ryegrass: { g: 35, nombre: 'ryegrass', epoca: 'otoño (marzo-abril)' },
  festuca: { g: 40, nombre: 'festuca', epoca: 'otoño (marzo-abril)' },
  premium: { g: 35, nombre: 'premium', epoca: 'otoño (marzo-abril) o primavera (septiembre-octubre)' },
  deportivo: { g: 45, nombre: 'deportivo', epoca: 'otoño (marzo-abril)' },
};

/** Factor de la resiembra sobre la densidad de siembra nueva. */
export const FACTOR_RESIEMBRA = 0.5;
/** Tope del eje del gráfico: unidades por m². */
export const EJE_MAX = 200;
