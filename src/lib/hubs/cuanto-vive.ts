import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántos años vive mi conejo, tortuga o reptil?"
 *
 * Hermano exótico de `edad-del-gato` y `edad-del-perro`: mismo arquetipo
 * CÁLCULO DOMINANTE (sin `cases`, la respuesta fija va en `answer`), pero para
 * las especies que perro y gato no cubren. Perro y gato NO se tocan acá.
 *
 * Absorbe 4 calculadoras sueltas (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format: 'unit'` y CADA fila del
 *    desglose declara el suyo. Una fila sin `format` cae a "$" y miente.
 *  - `chart.type: 'timeline'` se renderiza como barra de franjas con marcador.
 *    Las etapas dependen de la especie, así que las bandas se calculan en el
 *    compute() y las de acá son sólo la referencia visual genérica.
 *
 * PROCEDENCIA DE LOS NÚMEROS (todo sale de fórmulas reales del repo):
 *  - Conejo: `src/lib/formulas/edad-conejo.ts` (primer año = 21 años humanos,
 *    después +6 / +8 / +10 según porte; esperanzas 10-12 / 8-10 / 5-7).
 *  - Tortugas, equivalencia humana y madurez sexual:
 *    `src/lib/formulas/edad-humana-tortuga.ts`.
 *  - Tortugas terrestres, esperanza y factores de cuidado:
 *    `src/lib/formulas/expectativa-vida-tortuga-terrestre.ts`.
 *  - Reptiles y tortugas acuáticas, esperanza y factores de cuidado:
 *    `src/lib/formulas/expectativa-vida-reptiles-especie.ts`.
 */
export const hub: HubData = {
  slug: 'mascotas/cuanto-vive',
  title: '¿Cuánto vive un conejo, una tortuga o un reptil? Esperanza por especie',
  description:
    'Calculá cuántos años vive tu conejo, tortuga o reptil según la especie y los cuidados reales: temperatura, UVB y dieta cambian el resultado por décadas. Equivalencia en años humanos, etapa de vida y cuánto le queda por delante.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas exóticas',
  h1: '¿Cuántos años vive mi conejo, tortuga o reptil?',
  lede:
    'En un conejo la respuesta se mide en años; en una tortuga terrestre, en décadas. Y en casi todos los reptiles la esperanza de vida no la define la especie sino el terrario: la temperatura, el UVB y la dieta son la diferencia entre una vida corta y una larga. Elegí la especie, poné la edad y contá cómo vive de verdad.',
  stamps: [
    'Actualizado 27-07-2026',
    'Esperanza por especie + cuidados',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Cuánto viviría tu mascota',

  inputsTitle: 'Contanos de tu mascota',
  inputsIntro:
    'La especie fija el techo. El alojamiento y la dieta definen cuánto de ese techo se alcanza — en reptiles y tortugas es el factor que más pesa, mucho más que la genética.',
  fields: [
    {
      id: 'especie',
      label: 'Especie',
      type: 'select',
      value: 'tt-mediterranea',
      options: [
        { value: 'conejo-enano', label: 'Conejo enano (toy, holandés, belier enano)' },
        { value: 'conejo-mediano', label: 'Conejo mediano (mestizo, belier francés)' },
        { value: 'conejo-gigante', label: 'Conejo gigante (gigante de Flandes)' },
        { value: 'tt-mediterranea', label: 'Tortuga terrestre mediterránea (Testudo graeca / hermanni)' },
        { value: 'tt-rusa', label: 'Tortuga rusa o de Horsfield' },
        { value: 'tt-sulcata', label: 'Tortuga sulcata (espolonada africana)' },
        { value: 'tt-leopardo', label: 'Tortuga leopardo' },
        { value: 'tt-caja', label: 'Tortuga de caja (Terrapene)' },
        { value: 'tt-indotestudo', label: 'Tortuga elongada (Indotestudo)' },
        { value: 'ta-trachemys', label: 'Tortuga de agua Trachemys (orejas rojas / amarillas)' },
        { value: 'ta-matamata', label: 'Tortuga matamata' },
        { value: 'ta-otra', label: 'Otra tortuga acuática' },
        { value: 'r-gecko-leopardo', label: 'Gecko leopardo' },
        { value: 'r-gecko-crestado', label: 'Gecko crestado' },
        { value: 'r-pogona', label: 'Dragón barbudo (pogona)' },
        { value: 'r-iguana-verde', label: 'Iguana verde' },
        { value: 'r-camaleon', label: 'Camaleón' },
        { value: 'r-eslizon', label: 'Eslizón (lengua azul)' },
        { value: 'r-corn-snake', label: 'Serpiente del maíz (corn snake)' },
        { value: 'r-ball-python', label: 'Pitón bola (ball python)' },
        { value: 'r-boa', label: 'Boa constrictor' },
      ],
      help: 'Si no sabés la especie exacta de tu tortuga, mirá el caparazón: las terrestres lo tienen abombado y las patas en forma de columna; las acuáticas lo tienen chato y las patas palmeadas.',
    },
    {
      id: 'edad',
      label: 'Edad actual (o la que estimás)',
      type: 'number',
      suffix: 'años',
      min: 0,
      max: 120,
      step: 0.5,
      value: 3,
      help: 'Si es un bebé, poné los meses divididos 12: seis meses son 0,5. En tortugas adoptadas la edad es casi siempre una estimación por tamaño.',
    },
    {
      id: 'habitat',
      label: '¿Cómo es el alojamiento?',
      type: 'select',
      value: 'aceptable',
      options: [
        { value: 'optimo', label: 'Óptimo — espacio de sobra, sol directo o UVB al día y gradiente térmico' },
        { value: 'aceptable', label: 'Aceptable — espacio justo, UVB presente pero viejo, temperatura despareja' },
        { value: 'deficiente', label: 'Deficiente — chico, sin UVB o sin fuente de calor' },
      ],
      help: 'El tubo de UVB pierde emisión mucho antes de apagarse: se reemplaza cada 6 a 12 meses aunque siga encendiendo.',
    },
    {
      id: 'dieta',
      label: '¿Cómo es la dieta?',
      type: 'select',
      value: 'optima',
      options: [
        { value: 'optima', label: 'Óptima — variada y específica para la especie, con calcio' },
        { value: 'regular', label: 'Regular — poco variada o sin suplementar' },
        { value: 'pobre', label: 'Pobre — un solo alimento (lechuga, pellets solos, insectos sin espolvorear)' },
      ],
      help: 'En conejos la base es heno a discreción; en tortugas terrestres, hoja verde fibrosa y calcio; en reptiles insectívoros, insectos espolvoreados con calcio y D3.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo. Y en exóticos importa quién: conejos, tortugas y reptiles necesitan un veterinario especializado en animales exóticos, no cualquier clínica de perros y gatos.',

  chart: {
    type: 'timeline',
    title: 'La vida de tu mascota, etapa por etapa',
    caption:
      'La barra recorre la vida completa de la especie dividida en etapas —de cría a anciano— sobre la esperanza estimada con los cuidados que cargaste. El marcador muestra dónde está hoy tu mascota. En tortugas terrestres la barra se mide en décadas: mirá la escala antes de sacar conclusiones.',
    bands: [
      { label: 'Cría', from: 0, to: 5, tone: 'good' },
      { label: 'Juvenil', from: 5, to: 20, tone: 'good' },
      { label: 'Adulto joven', from: 20, to: 30, tone: 'neutral' },
      { label: 'Adulto', from: 30, to: 70, tone: 'neutral' },
      { label: 'Adulto mayor', from: 70, to: 90, tone: 'warn' },
      { label: 'Anciano', from: 90, to: 100, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Los números de tu mascota',
  breakdownIntro:
    'Todo está en años, salvo la fila de equivalencia humana. Las barras comparan cada cifra con la mayor: en una tortuga terrestre la esperanza aplasta visualmente a la edad actual, y eso es exactamente el punto.',

  answer: {
    title: 'La especie pone el techo; los cuidados deciden cuánto de ese techo alcanzás',
    copy:
      'En conejos la esperanza va de 5 a 12 años y depende sobre todo del porte: cuanto más grande el conejo, menos vive. En tortugas terrestres hablamos de 45 a 80 años y en las más longevas el animal te sobrevive: adoptar una es una decisión que involucra a tu testamento, no un capricho de temporada. En reptiles el rango de la especie es enorme —de 6 años en un camaleón a 40 en una pitón bola— pero lo que realmente separa un final temprano de una vida larga es el terrario: temperatura, UVB y dieta.',
    yes: [
      'Conejo: enano 10-12 años, mediano 8-10, gigante 5-7. La equivalencia humana arranca alta: el primer año ya son unos 21 años humanos',
      'Tortuga terrestre: mediterránea y leopardo unos 65 años, sulcata 80, rusa 50, caja y elongada 45 — y los máximos documentados llegan bastante más arriba',
      'Tortuga acuática: Trachemys unos 25 años, matamata alrededor de 30. Viven menos que las terrestres, pero siguen siendo décadas',
      'Reptiles: camaleón 6 años, pogona 13, gecko crestado 17, gecko leopardo, iguana y serpiente del maíz 17-18, pitón bola y boa cerca de 28',
      'Un terrario deficiente puede recortar la esperanza de un reptil al 40% de lo que le corresponde a su especie',
      'Una dieta pobre es todavía peor en tortugas terrestres: hunde la esperanza a alrededor de un tercio',
      'La diferencia entre cautiverio bien hecho y cautiverio improvisado se mide en décadas, no en meses',
    ],
    warn: [
      'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo',
      'La esperanza en cautiverio y en libertad no son la misma cosa: en libertad la mortalidad de crías es altísima, pero el adulto silvestre suele alcanzar edades que el mal cautiverio no permite. Los números de acá son de cautiverio doméstico',
      'La enfermedad metabólica ósea por falta de UVB y de calcio es la causa evitable más frecuente de muerte temprana en reptiles y tortugas, y arranca sin síntomas visibles',
      'El vidrio filtra los rayos UVB: una ventana soleada no reemplaza al tubo ni al sol directo',
      'En conejos, la estasis gastrointestinal es una emergencia: un conejo que deja de comer o de defecar más de 12 horas necesita atención inmediata',
      'La hibernación mal hecha mata tortugas terrestres sanas: no se improvisa y no todas las especies hibernan',
      'Cualquier síntoma —caparazón blando, boca abierta al respirar, letargo, no comer— va a un veterinario de animales exóticos, que no es cualquier veterinario',
    ],
    plazo:
      'el UVB se reemplaza cada 6 a 12 meses aunque encienda, y el control veterinario de exóticos es anual como mínimo (semestral cuando la mascota pasó el 70% de su esperanza de vida).',
  },

  faq: [
    {
      q: '¿Cuántos años vive un conejo doméstico?',
      a: 'Depende del porte y es al revés de lo intuitivo: los enanos viven más. Un conejo enano promedia 10 a 12 años, uno mediano 8 a 10 y un gigante apenas 5 a 7. Un conejo de campo o silvestre rara vez pasa de 2 años, así que el salto que da la vida doméstica es enorme. Lo que más recorta esa expectativa en casa es la dieta: el heno tiene que ser la base y estar disponible todo el día, porque desgasta los dientes de crecimiento continuo y mantiene el intestino en movimiento.',
    },
    {
      q: '¿Cuántos años vive una tortuga terrestre?',
      a: 'Décadas, y por eso no es una mascota de temporada. Una mediterránea o una leopardo bien cuidadas rondan los 65 años, una sulcata los 80, una rusa unos 50, y las tortugas de caja o elongadas alrededor de 45. Los máximos documentados están bastante por encima de esas medias. En la práctica significa que una tortuga comprada para un chico de diez años probablemente lo sobreviva o llegue a su vejez: hay que pensar quién se hace cargo de ella cuando vos ya no puedas, igual que con cualquier compromiso de largo plazo.',
    },
    {
      q: '¿Vive lo mismo un reptil en cautiverio que en libertad?',
      a: 'No, y la comparación es más tramposa de lo que parece. En libertad la mortalidad de crías y juveniles es altísima —depredación, sequías, falta de refugio—, así que la esperanza promedio al nacer es baja; pero el adulto silvestre que supera esa etapa vive expuesto a un ambiente que le da exactamente el espectro solar, el gradiente térmico y la dieta que su fisiología espera. Un cautiverio bien hecho supera con holgura ese promedio silvestre; un cautiverio improvisado lo empeora. La variable no es "jaula sí o no", es si el terrario reproduce las condiciones correctas.',
    },
    {
      q: '¿Qué es lo que más acorta la vida de un reptil en cautiverio?',
      a: 'Tres cosas, en este orden: temperatura, UVB y dieta. Un reptil es ectotermo, o sea que digiere, mueve el sistema inmune y metaboliza según la temperatura de su cuerpo: sin un gradiente térmico correcto no puede hacer nada de eso bien, por perfecta que sea la comida. Sin UVB no sintetiza vitamina D3 y no fija calcio, lo que deriva en enfermedad metabólica ósea. Y una dieta monótona o sin suplementar cierra el círculo. Nuestro cálculo aplica exactamente esos factores: un alojamiento deficiente puede llevar la esperanza al 40% de lo que le corresponde a la especie.',
    },
    {
      q: '¿Cuántos años humanos tiene mi tortuga?',
      a: 'La equivalencia no es lineal: los primeros años corren más rápido y después el ritmo se aplana. En una tortuga mediterránea los primeros cinco años valen alrededor de 1,6 años humanos cada uno y desde ahí cada año suma cerca de 1,1; en una rusa, 1,8 y 1,3; en una sulcata o una leopardo, que maduran lentísimo, apenas 1,2 y 1,05; en una Trachemys acuática, que vive mucho menos, 2 y 1,6. Por eso una tortuga terrestre de 30 años equivale más o menos a una persona de 35 y todavía le queda la mitad de la vida.',
    },
    {
      q: '¿Cuántos años humanos tiene mi conejo?',
      a: 'El primer año de un conejo equivale a unos 21 años humanos: al año ya es un adulto sexualmente maduro. Después el ritmo depende del porte, porque los conejos grandes envejecen más rápido: cada año adicional suma 6 años humanos en un enano, 8 en un mediano y 10 en un gigante. Un conejo mediano de 5 años equivale entonces a una persona de unos 53, y ya está entrando en la etapa senior: es el momento de pasar a controles más seguidos y de vigilar el peso y los dientes.',
    },
    {
      q: '¿Cuándo se considera viejo un conejo, una tortuga o un reptil?',
      a: 'En conejos la vejez llega temprano: a partir de los 5 años en los medianos, y antes todavía en los gigantes, que a los 5 ya son geriátricos. En tortugas y reptiles conviene pensar en porcentaje de la esperanza de vida más que en años absolutos: se considera adulto mayor a partir de aproximadamente el 70% de la esperanza y anciano después del 90%. Una tortuga mediterránea entra en su etapa mayor cerca de los 45 años, mientras que un camaleón lo hace a los 4. Cuando la mascota cruza ese 70%, el control veterinario pasa de anual a semestral.',
    },
    {
      q: '¿Por qué necesito un veterinario de exóticos y no el de siempre?',
      a: 'Porque la fisiología no se parece en nada. Un reptil enfermo no muestra fiebre ni los signos que un clínico de perros y gatos busca por reflejo; las dosis de medicación son distintas y muchas drogas comunes son tóxicas; la anestesia en un ectotermo depende de la temperatura ambiente; y en conejos, que son presa, el animal disimula el dolor hasta que ya es tarde. Un veterinario de animales exóticos maneja radiología de caparazón, sexado, corrección de dieta y manejo de terrario, cosas que sencillamente no se ven en una consulta general. Vale la pena tenerlo identificado antes de la urgencia, no durante.',
    },
    {
      q: '¿Cuánto vive una tortuga de agua Trachemys?',
      a: 'Alrededor de 25 años en buenas condiciones, con casos documentados bastante más largos. Es mucho menos que una terrestre, pero sigue siendo un compromiso de dos décadas y media. El problema típico de la Trachemys no es la esperanza sino el tamaño: la venden del tamaño de una moneda y llega a más de 25 centímetros de caparazón, con lo cual la pecera original queda chica en dos años. Agua sucia, falta de plataforma seca para asolearse y ausencia de UVB son las tres causas habituales de que no llegue ni a la mitad de su expectativa.',
    },
    {
      q: '¿Cuánto vive un gecko leopardo o un dragón barbudo?',
      a: 'Un gecko leopardo bien cuidado ronda los 18 años y puede llegar a 27; un dragón barbudo promedia unos 13 y llega a 18. Son las dos especies donde más se nota la brecha entre lo que dice el libro y lo que pasa en las casas: la mayoría muere mucho antes por terrarios sin gradiente térmico, sin UVB o con dieta de insectos sin espolvorear con calcio. En el dragón barbudo, además, el sobrepeso por exceso de insectos grasos y falta de vegetal es un acortador clásico de vida.',
    },
    {
      q: '¿La hibernación acorta o alarga la vida de una tortuga?',
      a: 'Bien hecha, forma parte del ciclo normal de las especies que hibernan y no acorta nada; mal hecha, mata tortugas sanas. Los errores clásicos son hibernar a un animal con reservas insuficientes o con el intestino lleno, dejarlo a una temperatura demasiado alta —donde consume energía sin estar realmente dormido— o demasiado baja, con riesgo de congelamiento y de daño ocular. Y no todas las especies hibernan: una sulcata o una leopardo, de origen tropical, no hibernan nunca. Antes de la primera hibernación, control veterinario y pesaje.',
    },
    {
      q: '¿Cómo sé la edad de una tortuga que adopté?',
      a: 'No hay forma exacta, y contar los anillos del caparazón no sirve como se cree: los anillos reflejan períodos de crecimiento, que dependen de la comida y la temperatura, no de los años. Una tortuga sobrealimentada marca varios anillos por año y una silvestre casi ninguno. Lo que sí se puede hacer es estimar por tamaño y por señales de madurez —cola, plastrón cóncavo en los machos de muchas especies— y por el desgaste del caparazón, que se alisa con las décadas. En la práctica se trabaja con un rango de edad estimado, no con un número.',
    },
  ],

  sources: [
    {
      name: 'Merck Veterinary Manual — Reptiles: manejo, husbandry y enfermedades',
      url: 'https://www.merckvetmanual.com/exotic-and-laboratory-animals/reptiles',
      publisher: 'Merck & Co. · Merck Veterinary Manual',
    },
    {
      name: 'VCA Animal Hospitals — Enfermedad metabólica ósea en reptiles',
      url: 'https://vcahospitals.com/know-your-pet/metabolic-bone-disease-in-reptiles',
      publisher: 'VCA Animal Hospitals',
    },
    {
      name: 'ARAV — Cómo encontrar un veterinario de reptiles y anfibios',
      url: 'https://arav.org/find-a-vet/',
      publisher: 'Association of Reptilian and Amphibian Veterinarians',
    },
    {
      name: 'PDSA — Cuidado del conejo: esperanza de vida, dieta y alojamiento',
      url: 'https://www.pdsa.org.uk/pet-help-and-advice/looking-after-your-pet/rabbits',
      publisher: 'PDSA · People’s Dispensary for Sick Animals',
    },
    {
      name: 'Rabbit Welfare Association & Fund — Guías de cuidado del conejo',
      url: 'https://rabbitwelfare.co.uk/rabbit-care-advice/',
      publisher: 'RWAF · Rabbit Welfare Association & Fund',
    },
    {
      name: 'The Tortoise Trust — Alimentación, alojamiento e hibernación de tortugas terrestres',
      url: 'https://www.tortoisetrust.org/',
      publisher: 'The Tortoise Trust',
    },
    {
      name: 'AnAge — Base de datos de longevidad y envejecimiento animal',
      url: 'https://genomics.senescence.info/species/',
      publisher: 'Human Ageing Genomic Resources',
    },
    {
      name: 'RSPCA — Bienestar y necesidades de los conejos',
      url: 'https://www.rspca.org.uk/adviceandwelfare/pets/rabbits',
      publisher: 'RSPCA',
    },
  ],

  replaces: [
    '/calculadora-edad-humana-conejo-anos',
    '/calculadora-edad-humana-tortuga',
    '/calculadora-expectativa-vida-reptiles-especie',
    '/calculadora-expectativa-vida-tortuga-terrestre',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Catálogo de especies. Cada entrada declara a qué GRUPO pertenece, porque el
 * grupo define qué juego de factores de cuidado se aplica (los originales son
 * distintos entre la fórmula de tortugas terrestres y la de reptiles, y se
 * respetan tal cual para no cambiar ningún número).
 *
 * Campos:
 *  - `base`        esperanza base en años (ver PROCEDENCIA arriba)
 *  - `topeMax`     máximo documentado de la especie
 *  - `humana`      parámetros de equivalencia en años humanos, si existen
 *  - `madurez`     edad de madurez sexual en años (sólo tortugas)
 *  - `factorAnual` años humanos por año extra (sólo conejos)
 */
export type Grupo = 'conejo' | 'tortuga-terrestre' | 'tortuga-acuatica' | 'reptil';

export interface Especie {
  nombre: string;
  grupo: Grupo;
  /** Esperanza base en años, antes de aplicar cuidados. */
  base: number;
  /** Mínimo del rango típico de la especie. */
  baseMin: number;
  /** Máximo documentado. */
  topeMax: number;
  /** Conejos: años humanos que suma cada año después del primero. */
  factorAnual?: number;
  /** Tortugas: primeros años más lentos, luego lineal. */
  ratioPrimeros?: number;
  ratioAdulto?: number;
  primerosAnios?: number;
  madurez?: number;
  nota: string;
}

export const ESPECIES: Record<string, Especie> = {
  // ── Conejos — edad-conejo.ts (esperanzas 10-12 / 8-10 / 5-7) ──
  'conejo-enano': {
    nombre: 'Conejo enano',
    grupo: 'conejo',
    base: 11,
    baseMin: 10,
    topeMax: 12,
    factorAnual: 6,
    nota: 'Los conejos chicos son los más longevos',
  },
  'conejo-mediano': {
    nombre: 'Conejo mediano',
    grupo: 'conejo',
    base: 9,
    baseMin: 8,
    topeMax: 10,
    factorAnual: 8,
    nota: 'Porte estándar: la referencia del promedio doméstico',
  },
  'conejo-gigante': {
    nombre: 'Conejo gigante',
    grupo: 'conejo',
    base: 6,
    baseMin: 5,
    topeMax: 7,
    factorAnual: 10,
    nota: 'Envejece antes: a los 5 años ya es geriátrico',
  },

  // ── Tortugas terrestres — expectativa-vida-tortuga-terrestre.ts ──
  'tt-mediterranea': {
    nombre: 'Tortuga mediterránea',
    grupo: 'tortuga-terrestre',
    base: 65,
    baseMin: 49,
    topeMax: 91,
    ratioPrimeros: 1.6,
    ratioAdulto: 1.1,
    primerosAnios: 5,
    madurez: 8,
    nota: 'Hiberna: el manejo invernal define su longevidad',
  },
  'tt-rusa': {
    nombre: 'Tortuga rusa',
    grupo: 'tortuga-terrestre',
    base: 50,
    baseMin: 38,
    topeMax: 70,
    ratioPrimeros: 1.8,
    ratioAdulto: 1.3,
    primerosAnios: 5,
    madurez: 7,
    nota: 'Excavadora: necesita sustrato profundo',
  },
  'tt-sulcata': {
    nombre: 'Tortuga sulcata',
    grupo: 'tortuga-terrestre',
    base: 80,
    baseMin: 60,
    topeMax: 112,
    ratioPrimeros: 1.2,
    ratioAdulto: 1.05,
    primerosAnios: 5,
    madurez: 17,
    nota: 'No hiberna y llega a más de 50 kg: te sobrevive',
  },
  'tt-leopardo': {
    nombre: 'Tortuga leopardo',
    grupo: 'tortuga-terrestre',
    base: 65,
    baseMin: 49,
    topeMax: 91,
    ratioPrimeros: 1.2,
    ratioAdulto: 1.05,
    primerosAnios: 5,
    madurez: 12,
    nota: 'Tropical: no hiberna nunca',
  },
  'tt-caja': {
    nombre: 'Tortuga de caja',
    grupo: 'tortuga-terrestre',
    base: 45,
    baseMin: 34,
    topeMax: 63,
    ratioPrimeros: 1.6,
    ratioAdulto: 1.1,
    primerosAnios: 5,
    madurez: 8,
    nota: 'Muy sensible a la humedad ambiente',
  },
  'tt-indotestudo': {
    nombre: 'Tortuga elongada',
    grupo: 'tortuga-terrestre',
    base: 45,
    baseMin: 34,
    topeMax: 63,
    ratioPrimeros: 1.6,
    ratioAdulto: 1.1,
    primerosAnios: 5,
    madurez: 8,
    nota: 'Especie amenazada: verificá la procedencia legal',
  },

  // ── Tortugas acuáticas — edad-humana-tortuga.ts + factores de reptiles ──
  'ta-trachemys': {
    nombre: 'Tortuga Trachemys',
    grupo: 'tortuga-acuatica',
    base: 25,
    baseMin: 15,
    topeMax: 40,
    ratioPrimeros: 2.0,
    ratioAdulto: 1.6,
    primerosAnios: 5,
    madurez: 4,
    nota: 'Crece mucho más de lo que la pecera inicial permite',
  },
  'ta-matamata': {
    nombre: 'Tortuga matamata',
    grupo: 'tortuga-acuatica',
    base: 30,
    baseMin: 18,
    topeMax: 42,
    ratioPrimeros: 1.6,
    ratioAdulto: 1.3,
    primerosAnios: 5,
    madurez: 7,
    nota: 'Exigente con la calidad y el pH del agua',
  },
  'ta-otra': {
    nombre: 'Otra tortuga acuática',
    grupo: 'tortuga-acuatica',
    base: 30,
    baseMin: 18,
    topeMax: 42,
    ratioPrimeros: 1.8,
    ratioAdulto: 1.4,
    primerosAnios: 5,
    madurez: 5,
    nota: 'Estimación genérica para acuáticas',
  },

  // ── Reptiles — expectativa-vida-reptiles-especie.ts (tipica / max) ──
  'r-gecko-leopardo': {
    nombre: 'Gecko leopardo',
    grupo: 'reptil',
    base: 18,
    baseMin: 11,
    topeMax: 27,
    nota: 'Sin UVB obligatorio, pero sí calor por debajo',
  },
  'r-gecko-crestado': {
    nombre: 'Gecko crestado',
    grupo: 'reptil',
    base: 17,
    baseMin: 10,
    topeMax: 25,
    nota: 'Tolera temperaturas moderadas: no lo sobrecalientes',
  },
  'r-pogona': {
    nombre: 'Dragón barbudo',
    grupo: 'reptil',
    base: 13,
    baseMin: 8,
    topeMax: 18,
    nota: 'UVB alto y vegetal en la dieta adulta',
  },
  'r-iguana-verde': {
    nombre: 'Iguana verde',
    grupo: 'reptil',
    base: 17,
    baseMin: 10,
    topeMax: 30,
    nota: 'Herbívora estricta y enorme de adulta',
  },
  'r-camaleon': {
    nombre: 'Camaleón',
    grupo: 'reptil',
    base: 6,
    baseMin: 4,
    topeMax: 10,
    nota: 'El de vida más corta: muy sensible al estrés',
  },
  'r-eslizon': {
    nombre: 'Eslizón',
    grupo: 'reptil',
    base: 17,
    baseMin: 10,
    topeMax: 25,
    nota: 'Omnívoro: necesita variedad real',
  },
  'r-corn-snake': {
    nombre: 'Serpiente del maíz',
    grupo: 'reptil',
    base: 18,
    baseMin: 11,
    topeMax: 30,
    nota: 'De las más resistentes en cautiverio',
  },
  'r-ball-python': {
    nombre: 'Pitón bola',
    grupo: 'reptil',
    base: 28,
    baseMin: 17,
    topeMax: 40,
    nota: 'Compromiso de tres décadas',
  },
  'r-boa': {
    nombre: 'Boa constrictor',
    grupo: 'reptil',
    base: 28,
    baseMin: 17,
    topeMax: 40,
    nota: 'Grande y longeva: espacio y décadas',
  },
};

/**
 * Factores de cuidado, calcados de las fórmulas originales SIN unificar,
 * porque cada una usa su propia escala:
 *  - `tortuga-terrestre` → expectativa-vida-tortuga-terrestre.ts
 *      alojamiento patio 1,1 · mixto 0,95 · terrario 0,75
 *      dieta buena 1,05 · regular 0,75 · mala 0,35
 *  - `reptil` (y acuáticas y conejos) → expectativa-vida-reptiles-especie.ts
 *      terrario bueno 1,0 · regular 0,8 · malo 0,4
 *      dieta variada 1,0 · media 0,85 · pobre 0,5
 */
export const FACTORES = {
  'tortuga-terrestre': {
    habitat: { optimo: 1.1, aceptable: 0.95, deficiente: 0.75 },
    dieta: { optima: 1.05, regular: 0.75, pobre: 0.35 },
  },
  reptil: {
    habitat: { optimo: 1.0, aceptable: 0.8, deficiente: 0.4 },
    dieta: { optima: 1.0, regular: 0.85, pobre: 0.5 },
  },
};

/**
 * Etapas de vida del conejo, calcadas de `edad-conejo.ts`. Los gigantes tienen
 * su propia escala porque envejecen antes.
 */
export const ETAPAS_CONEJO = [
  { nombre: 'Cachorro', hasta: 0.5 },
  { nombre: 'Adolescente', hasta: 1 },
  { nombre: 'Adulto joven', hasta: 3 },
  { nombre: 'Adulto maduro', hasta: 5 },
  { nombre: 'Senior', hasta: 7 },
  { nombre: 'Senior avanzado', hasta: 99 },
];

export const ETAPAS_CONEJO_GIGANTE = [
  { nombre: 'Cachorro', hasta: 0.5 },
  { nombre: 'Adolescente', hasta: 1 },
  { nombre: 'Adulto joven', hasta: 3 },
  { nombre: 'Adulto maduro', hasta: 4 },
  { nombre: 'Senior', hasta: 5 },
  { nombre: 'Senior avanzado', hasta: 99 },
];
