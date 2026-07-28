import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto tiene que pesar mi perro o mi gato?"
 *
 * Arquetipo CÁLCULO DOMINANTE: la pregunta es siempre la misma y lo único que
 * cambia es la raza, así que NO usa `cases` — la raza es un campo más y la
 * respuesta fija va en `answer`. Absorbe 13 URLs de calculadora suelta: doce
 * eran el MISMO archivo con otra constante `RAZA` (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos en dinero: el resultado declara `format:'unit'` (kg) y
 *    cada fila declara el suyo. Una fila sin `format` cae a "$" y miente.
 *  - `chart.type: 'scale'`: las franjas viajan con `from`/`to` en kg y el peso
 *    del animal en `position` + `positionLabel`.
 */
export const hub: HubData = {
  slug: 'mascotas/peso-ideal',
  title: '¿Cuánto tiene que pesar mi perro o mi gato? Peso ideal por raza, sexo y edad',
  description:
    'Peso ideal por raza con los rangos FCI/AKC por sexo y contextura, más la curva de crecimiento WALTHAM para saber cuánto debería pesar tu cachorro a los 2, 3, 6 o 12 meses. 12 razas de perro y 15 de gato.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas',
  h1: '¿Cuánto tiene que pesar mi perro o mi gato?',
  lede:
    'El estándar de cada raza da un rango, no un número, y ese rango se abre todavía más entre machos y hembras y entre líneas finas y macizas. Si además es cachorro, la pregunta cambia: no importa cuánto pesa un adulto sino cuánto debería pesar él hoy, a sus meses. Elegí la raza, el sexo y la edad y vas a ver el rango que le corresponde, dónde cae el peso que marcó la balanza y cuánto le falta para terminar de crecer.',
  stamps: ['Actualizado 27-07-2026', 'Estándares FCI/AKC + curva WALTHAM (PLOS ONE 2017)', '13 calculadoras adentro'],

  resultLabel: 'Su peso ideal',

  inputsTitle: 'Contanos de tu animal',
  inputsIntro:
    'Con la raza y el sexo ya sale el rango. La contextura afina el resultado y la edad lo convierte en la curva de crecimiento del cachorro.',
  fields: [
    {
      id: 'raza',
      label: 'Raza',
      type: 'select',
      value: 'labrador',
      options: [
        { value: 'beagle', label: 'Perro — Beagle' },
        { value: 'boxer', label: 'Perro — Boxer' },
        { value: 'bulldog_frances', label: 'Perro — Bulldog Francés' },
        { value: 'bulldog_ingles', label: 'Perro — Bulldog Inglés' },
        { value: 'dachshund', label: 'Perro — Dachshund (salchicha)' },
        { value: 'golden', label: 'Perro — Golden Retriever' },
        { value: 'husky', label: 'Perro — Husky Siberiano' },
        { value: 'labrador', label: 'Perro — Labrador Retriever' },
        { value: 'pastor_aleman', label: 'Perro — Pastor Alemán' },
        { value: 'pitbull', label: 'Perro — Pitbull' },
        { value: 'rottweiler', label: 'Perro — Rottweiler' },
        { value: 'yorkshire', label: 'Perro — Yorkshire Terrier' },
        { value: 'gato_comun', label: 'Gato — Común europeo / mestizo' },
        { value: 'gato_siames', label: 'Gato — Siamés' },
        { value: 'gato_persa', label: 'Gato — Persa' },
        { value: 'gato_maine_coon', label: 'Gato — Maine Coon' },
        { value: 'gato_ragdoll', label: 'Gato — Ragdoll' },
        { value: 'gato_bengali', label: 'Gato — Bengalí' },
        { value: 'gato_angora', label: 'Gato — Angora turco' },
        { value: 'gato_british', label: 'Gato — British Shorthair' },
        { value: 'gato_ruso_azul', label: 'Gato — Ruso Azul' },
        { value: 'gato_sphynx', label: 'Gato — Sphynx' },
        { value: 'gato_abisinio', label: 'Gato — Abisinio' },
        { value: 'gato_himalayo', label: 'Gato — Himalayo' },
        { value: 'gato_scottish', label: 'Gato — Scottish Fold' },
        { value: 'gato_siberiano', label: 'Gato — Siberiano' },
        { value: 'gato_oriental', label: 'Gato — Oriental de pelo corto' },
      ],
      help: 'Si es mestizo, elegí la raza a la que más se parece en tamaño y usá el rango como referencia amplia.',
    },
    {
      id: 'sexo',
      label: 'Sexo',
      type: 'select',
      value: 'macho',
      options: [
        { value: 'macho', label: 'Macho' },
        { value: 'hembra', label: 'Hembra' },
      ],
      help: 'En razas grandes la diferencia entre machos y hembras llega a los 10 o 12 kg.',
    },
    {
      id: 'contextura',
      label: 'Contextura',
      type: 'select',
      value: 'mediana',
      options: [
        { value: 'pequena', label: 'Fina — huesos livianos, línea estilizada' },
        { value: 'mediana', label: 'Media — la más común' },
        { value: 'grande', label: 'Maciza — huesos anchos, línea robusta' },
      ],
      help: 'Mirá el ancho de la cabeza y de las patas delanteras, no la panza.',
    },
    {
      id: 'edad',
      label: 'Edad',
      type: 'select',
      value: 'adulto',
      options: [
        { value: 'm2', label: '2 meses (cachorro)' },
        { value: 'm3', label: '3 meses (cachorro)' },
        { value: 'm4', label: '4 meses (cachorro)' },
        { value: 'm5', label: '5 meses (cachorro)' },
        { value: 'm6', label: '6 meses (cachorro)' },
        { value: 'm8', label: '8 meses (cachorro)' },
        { value: 'm10', label: '10 meses (cachorro)' },
        { value: 'm12', label: '12 meses' },
        { value: 'm15', label: '15 meses' },
        { value: 'm18', label: '18 meses' },
        { value: 'adulto', label: 'Adulto' },
        { value: 'senior', label: 'Senior (más de 7 años)' },
      ],
      help: 'La curva de crecimiento aplica a perros. En gatos el rango es siempre el adulto: el gatito llega a su peso cerca del año.',
    },
    {
      id: 'pesoActual',
      label: 'Peso que marcó la balanza (opcional)',
      type: 'number',
      suffix: 'kg',
      min: 0,
      max: 90,
      step: 0.1,
      value: 30,
      help: 'Pesate vos, alzalo y restá: en casa es la forma más fácil. Dejá 0 si sólo querés ver el rango.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo. Los rangos son estándares de raza y percentiles poblacionales: un animal sano puede quedar apenas fuera del rango sin que eso signifique nada. Lo que manda es la condición corporal (BCS), no el número de la balanza.',

  chart: {
    type: 'scale',
    title: 'Dónde cae su peso',
    caption:
      'La barra muestra la escala de peso de la raza: la franja verde es el rango ideal para ese sexo y contextura, a la izquierda queda el bajo peso y a la derecha el sobrepeso. El marcador es el peso que cargaste, o el promedio del rango si lo dejaste en cero.',
    bands: [
      { label: 'Bajo peso', from: 0, to: 33, tone: 'warn' },
      { label: 'Peso ideal', from: 33, to: 66, tone: 'good' },
      { label: 'Sobrepeso', from: 66, to: 100, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Los kilos, número por número',
  breakdownIntro:
    'Todo en kilos, meses o porcentaje: acá no hay dinero. Las barras comparan cada valor contra el mayor.',

  answer: {
    title: 'El peso ideal es un rango, y depende de tres cosas',
    copy:
      'Primero el estándar de la raza, que ya trae rangos distintos para machos y hembras. Después la contextura del animal concreto: dentro de una misma raza hay líneas finas y líneas macizas, y un labrador de huesos anchos con 34 kg puede estar perfecto mientras otro de línea liviana con esos mismos kilos está pasado. Y tercero, la edad: si es cachorro no le corresponde el peso adulto sino la fracción de ese peso que le toca a sus meses, que en razas grandes es apenas el 17% a los dos meses.',
    yes: [
      'Rango adulto del estándar FCI/AKC, separado por sexo',
      'Ajuste por contextura fina, media o maciza dentro de ese rango',
      'Peso esperado a los 2, 3, 4, 5, 6, 8, 10, 12, 15 o 18 meses con la curva WALTHAM',
      'A qué edad cierra el crecimiento: 12 meses en razas toy y pequeñas, 15 en medianas, 18 en grandes y hasta 24 en gigantes',
      'Cuántos kilos le sobran o le faltan respecto del rango, si cargás el peso real',
      'Esperanza de vida media de la raza',
    ],
    warn: [
      'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
      'El número de la balanza sin condición corporal no dice nada: un perro musculoso y uno con grasa pueden pesar lo mismo',
      'Bajar de peso a un gato de golpe es peligroso: la pérdida rápida dispara lipidosis hepática',
      'En cachorros de razas grandes, ir por encima de la curva no es "estar fuerte": es forzar articulaciones que todavía no cerraron',
      'Una pérdida de peso que no buscaste, en cualquier edad, es motivo de consulta veterinaria',
      'En razas braquicéfalas —bulldog francés, bulldog inglés, boxer— cada kilo de más multiplica el problema respiratorio',
    ],
    plazo:
      'pesalo cada 4 a 8 semanas si es adulto y cada 2 semanas si es cachorro: la curva de crecimiento se lee en la tendencia, no en un punto suelto.',
  },

  faq: [
    {
      q: '¿Cuánto tiene que pesar mi perro según la raza?',
      a: 'Cada raza tiene un rango del estándar, distinto por sexo. Como referencia de adulto: labrador macho 29 a 36 kg y hembra 25 a 32; golden macho 29 a 34 y hembra 25 a 29; pastor alemán macho 30 a 40 y hembra 22 a 32; rottweiler macho 50 a 60 y hembra 35 a 48; boxer macho 27 a 32; beagle macho 10 a 16; bulldog francés 9 a 14; dachshund 7 a 14; yorkshire 2 a 3,2 kg. Dentro de ese rango, la contextura define si tu animal va en la parte baja o alta.',
    },
    {
      q: '¿Cuánto debe pesar mi cachorro a los 2 meses?',
      a: 'Depende del tamaño adulto de su raza, y menos de lo que la gente cree. A los 2 meses una raza toy ya alcanzó el 28% de su peso adulto, una pequeña el 24%, una mediana el 22%, una grande el 17% y una gigante apenas el 15%. Un labrador macho que de adulto va a pesar 32 kg debería andar por los 5,5 kg a esa edad. Lo importante no es clavar el número sino que la curva suba parejo semana a semana.',
    },
    {
      q: '¿A qué edad deja de crecer un perro?',
      a: 'Las razas toy y pequeñas cierran alrededor de los 12 meses, las medianas a los 15, las grandes a los 18 y las gigantes recién entre los 18 y los 24. Por eso la transición al alimento adulto no es la misma para todos: en un yorkshire va a los 10 o 12 meses y en un rottweiler o un gran danés se estira mucho más. Castrar antes del cierre de las placas de crecimiento en razas grandes también altera la conformación final.',
    },
    {
      q: '¿Cuánto tiene que pesar mi gato?',
      a: 'Un gato común europeo macho pesa entre 4 y 6 kg y una hembra entre 3 y 5. Las razas grandes se van bastante arriba: maine coon macho de 6 a 11 kg, ragdoll de 5 a 9, siberiano de 5 a 9, british shorthair de 5 a 8. Las orientales van al otro extremo: siamés y oriental entre 2,5 y 5,5 kg según sexo. A diferencia del perro, el gato llega a su peso adulto cerca del año y ahí se queda.',
    },
    {
      q: '¿Cómo sé si mi perro está gordo sin pesarlo?',
      a: 'Con el Body Condition Score, que se hace con las manos y de un vistazo. Pasando la palma por el costado tenés que palpar las costillas con presión suave, como se palpan los nudillos con la mano estirada; si tenés que hundir los dedos, sobra grasa. Mirándolo desde arriba tiene que verse una cintura detrás de las costillas, y de perfil el abdomen tiene que subir hacia la ingle en vez de ir recto. Si no ves ninguna de las dos cosas, hay sobrepeso aunque la balanza dé dentro del rango.',
    },
    {
      q: '¿Por qué mi perro está fuera del rango de su raza?',
      a: 'Casi siempre por una de tres razones. Contextura: dentro de una raza hay líneas finas y macizas, y el rango del estándar cubre a las dos. Mestizaje: si no es de pedigrí, hereda tamaños de más de una raza. O condición corporal real: sobrepeso o delgadez. Antes de asumir que hay un problema, revisá el BCS; si el animal está bien de condición y apenas se sale del rango, no pasa nada.',
    },
    {
      q: '¿La castración hace que engorde?',
      a: 'La castración no engorda por sí sola, pero baja el gasto energético entre un 10 y un 30%. Si la ración sigue siendo la misma, el balance queda positivo y el sobrepeso aparece en pocos meses. La solución no es no castrar: es recalcular la ración con el factor de mantenimiento del animal castrado —1,4 en el perro y 1,0 en el gato— y controlar el peso cada dos meses el primer año.',
    },
    {
      q: '¿Cuánto puede bajar de peso un perro senior?',
      a: 'Es normal que un perro mayor pierda entre un 5 y un 10% respecto de su peso de adulto, sobre todo por pérdida de masa muscular. Lo que no es normal es que baje rápido, que pierda tono muscular de forma marcada o que adelgace comiendo igual: eso apunta a riñón, tiroides, problemas dentales o tumores, y es motivo de consulta con análisis de sangre y orina.',
    },
    {
      q: '¿Cómo peso a mi perro o a mi gato en casa?',
      a: 'La forma más práctica es subirte vos solo a la balanza, anotar el número, subirte con el animal en brazos y restar. Con gatos y perros chicos también sirve una balanza de cocina con el transportín encima, descontando el peso del transportín. Pesalo siempre en el mismo momento del día y con la misma balanza: lo que importa es la tendencia entre mediciones, no el decimal.',
    },
    {
      q: '¿Sirve el IMC para perros y gatos?',
      a: 'No como en humanos. Existen índices veterinarios —el Body Fat Index y el propio BCS de 9 puntos— pero no hay un IMC universal, porque la variación de conformación entre razas es enorme: un galgo y un bulldog del mismo peso no tienen nada que ver. Por eso la referencia sigue siendo el rango del estándar de la raza combinado con la evaluación de condición corporal.',
    },
    {
      q: '¿Cuánto vive cada raza?',
      a: 'La esperanza media baja a medida que sube el tamaño. Como referencia: yorkshire unos 14 años, beagle y dachshund 13, husky 13, golden, labrador y pitbull 12, boxer y pastor alemán 11, bulldog francés 11, rottweiler 10 y bulldog inglés 9. En gatos el rango es más parejo y más largo: entre 13 y 16 años según la raza, bastante más si vive puertas adentro.',
    },
    {
      q: '¿Qué hago si mi perro está por encima del rango?',
      a: 'Recalculá la ración sobre el peso ideal —no sobre el actual— y bajala de forma gradual, con controles de peso cada dos semanas y sumando actividad progresiva. Cortá premios y sobras, que suelen ser la mitad del problema invisible. Y consultá al veterinario antes de empezar: hay causas médicas de aumento de peso, como el hipotiroidismo, que ninguna dieta va a resolver.',
    },
  ],

  sources: [
    {
      name: 'Fédération Cynologique Internationale — estándares de raza',
      url: 'https://www.fci.be/en/Nomenclature/',
      publisher: 'FCI',
    },
    {
      name: 'American Kennel Club — Dog Breeds: tamaño y peso por raza',
      url: 'https://www.akc.org/dog-breeds/',
      publisher: 'AKC',
    },
    {
      name: 'Salt C. et al. — Growth standard charts for monitoring bodyweight in dogs of different sizes (PLOS ONE, 2017)',
      url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0182064',
      publisher: 'PLOS ONE · WALTHAM Centre for Pet Nutrition',
      date: '2017',
    },
    {
      name: 'WSAVA — Body Condition Score charts para perro y gato',
      url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
      publisher: 'World Small Animal Veterinary Association',
    },
    {
      name: 'The Cat Fanciers’ Association — estándares de razas felinas',
      url: 'https://cfa.org/breeds/',
      publisher: 'CFA',
    },
    {
      name: 'Montoya M. et al. — Life expectancy tables for dogs and cats derived from clinical data (Frontiers in Veterinary Science, 2023)',
      url: 'https://www.frontiersin.org/articles/10.3389/fvets.2023.1082102/full',
      publisher: 'Frontiers in Veterinary Science',
      date: '2023',
    },
  ],

  replaces: [
    '/calculadora-peso-ideal-beagle',
    '/calculadora-peso-ideal-boxer',
    '/calculadora-peso-ideal-bulldog-frances',
    '/calculadora-peso-ideal-bulldog-ingles',
    '/calculadora-peso-ideal-dachshund-salchicha',
    '/calculadora-peso-ideal-golden-retriever',
    '/calculadora-peso-ideal-husky-siberiano',
    '/calculadora-peso-ideal-labrador-retriever',
    '/calculadora-peso-ideal-pastor-aleman',
    '/calculadora-peso-ideal-pitbull',
    '/calculadora-peso-ideal-rottweiler',
    '/calculadora-peso-ideal-yorkshire-terrier',
    '/calculadora-peso-ideal-gato-raza',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Rangos adultos por sexo, calcados una por una de las constantes `RAZA` de
 * `src/lib/formulas/peso-ideal-<raza>.ts` y del mapa `RAZAS` de
 * `peso-ideal-gato.ts`. `especie` decide qué ajuste de contextura se aplica y
 * si corre la curva de crecimiento canina.
 */
export const RAZAS: Record<
  string,
  { nombre: string; especie: 'perro' | 'gato'; machoMin: number; machoMax: number; hembraMin: number; hembraMax: number; esperanza: number }
> = {
  beagle: { nombre: 'Beagle', especie: 'perro', machoMin: 10, machoMax: 16, hembraMin: 9, hembraMax: 14, esperanza: 13 },
  boxer: { nombre: 'Boxer', especie: 'perro', machoMin: 27, machoMax: 32, hembraMin: 25, hembraMax: 29, esperanza: 11 },
  bulldog_frances: { nombre: 'Bulldog Francés', especie: 'perro', machoMin: 9, machoMax: 14, hembraMin: 8, hembraMax: 13, esperanza: 11 },
  bulldog_ingles: { nombre: 'Bulldog Inglés', especie: 'perro', machoMin: 23, machoMax: 25, hembraMin: 18, hembraMax: 23, esperanza: 9 },
  dachshund: { nombre: 'Dachshund (salchicha)', especie: 'perro', machoMin: 7, machoMax: 14, hembraMin: 7, hembraMax: 14, esperanza: 13 },
  golden: { nombre: 'Golden Retriever', especie: 'perro', machoMin: 29, machoMax: 34, hembraMin: 25, hembraMax: 29, esperanza: 12 },
  husky: { nombre: 'Husky Siberiano', especie: 'perro', machoMin: 20, machoMax: 27, hembraMin: 16, hembraMax: 23, esperanza: 13 },
  labrador: { nombre: 'Labrador Retriever', especie: 'perro', machoMin: 29, machoMax: 36, hembraMin: 25, hembraMax: 32, esperanza: 12 },
  pastor_aleman: { nombre: 'Pastor Alemán', especie: 'perro', machoMin: 30, machoMax: 40, hembraMin: 22, hembraMax: 32, esperanza: 11 },
  pitbull: { nombre: 'Pitbull', especie: 'perro', machoMin: 16, machoMax: 30, hembraMin: 14, hembraMax: 27, esperanza: 12 },
  rottweiler: { nombre: 'Rottweiler', especie: 'perro', machoMin: 50, machoMax: 60, hembraMin: 35, hembraMax: 48, esperanza: 10 },
  yorkshire: { nombre: 'Yorkshire Terrier', especie: 'perro', machoMin: 2, machoMax: 3.2, hembraMin: 2, hembraMax: 3.2, esperanza: 14 },

  gato_comun: { nombre: 'Común europeo / mestizo', especie: 'gato', machoMin: 4, machoMax: 6, hembraMin: 3, hembraMax: 5, esperanza: 15 },
  gato_siames: { nombre: 'Siamés', especie: 'gato', machoMin: 3.5, machoMax: 5.5, hembraMin: 2.5, hembraMax: 4.5, esperanza: 16 },
  gato_persa: { nombre: 'Persa', especie: 'gato', machoMin: 4, machoMax: 7, hembraMin: 3, hembraMax: 5, esperanza: 14 },
  gato_maine_coon: { nombre: 'Maine Coon', especie: 'gato', machoMin: 6, machoMax: 11, hembraMin: 4, hembraMax: 7, esperanza: 13 },
  gato_ragdoll: { nombre: 'Ragdoll', especie: 'gato', machoMin: 5, machoMax: 9, hembraMin: 4, hembraMax: 6.5, esperanza: 14 },
  gato_bengali: { nombre: 'Bengalí', especie: 'gato', machoMin: 4.5, machoMax: 7, hembraMin: 3.5, hembraMax: 5.5, esperanza: 15 },
  gato_angora: { nombre: 'Angora turco', especie: 'gato', machoMin: 4, machoMax: 6, hembraMin: 3, hembraMax: 5, esperanza: 15 },
  gato_british: { nombre: 'British Shorthair', especie: 'gato', machoMin: 5, machoMax: 8, hembraMin: 3.5, hembraMax: 5.5, esperanza: 15 },
  gato_ruso_azul: { nombre: 'Ruso Azul', especie: 'gato', machoMin: 4, machoMax: 7, hembraMin: 3, hembraMax: 5, esperanza: 16 },
  gato_sphynx: { nombre: 'Sphynx', especie: 'gato', machoMin: 3.5, machoMax: 5.5, hembraMin: 3, hembraMax: 5, esperanza: 13 },
  gato_abisinio: { nombre: 'Abisinio', especie: 'gato', machoMin: 4, machoMax: 6, hembraMin: 3, hembraMax: 4.5, esperanza: 14 },
  gato_himalayo: { nombre: 'Himalayo', especie: 'gato', machoMin: 4, machoMax: 6, hembraMin: 3, hembraMax: 5, esperanza: 14 },
  gato_scottish: { nombre: 'Scottish Fold', especie: 'gato', machoMin: 4, machoMax: 6, hembraMin: 3, hembraMax: 5, esperanza: 13 },
  gato_siberiano: { nombre: 'Siberiano', especie: 'gato', machoMin: 5, machoMax: 9, hembraMin: 4, hembraMax: 6, esperanza: 14 },
  gato_oriental: { nombre: 'Oriental de pelo corto', especie: 'gato', machoMin: 3, machoMax: 5, hembraMin: 2.5, hembraMax: 4, esperanza: 15 },
};

/**
 * Curva de crecimiento canino, calcada de `src/lib/formulas/_puppy-growth.ts`.
 * Fracción del peso adulto alcanzada a cada edad, por tamaño de raza.
 * Fuente: Salt et al., PLOS ONE 2017 (WALTHAM).
 */
export const CURVAS: Record<string, Array<[number, number]>> = {
  toy: [[2, 0.28], [3, 0.42], [4, 0.56], [5, 0.68], [6, 0.8], [8, 0.92], [10, 0.98], [12, 1.0]],
  pequena: [[2, 0.24], [3, 0.37], [4, 0.5], [5, 0.62], [6, 0.74], [8, 0.88], [10, 0.96], [12, 1.0]],
  mediana: [[2, 0.22], [3, 0.33], [4, 0.45], [5, 0.57], [6, 0.68], [8, 0.8], [10, 0.9], [12, 0.96], [15, 1.0]],
  grande: [[2, 0.17], [3, 0.27], [4, 0.37], [5, 0.46], [6, 0.55], [8, 0.7], [10, 0.8], [12, 0.88], [15, 0.95], [18, 1.0]],
  gigante: [[2, 0.15], [3, 0.24], [4, 0.32], [5, 0.4], [6, 0.48], [8, 0.62], [10, 0.72], [12, 0.8], [15, 0.9], [18, 0.96], [24, 1.0]],
};

/** Edad de cierre del crecimiento, en meses, por tamaño de raza. */
export const CIERRE: Record<string, number> = {
  toy: 12,
  pequena: 12,
  mediana: 15,
  grande: 18,
  gigante: 24,
};
