import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto ejercicio y qué cuidados necesita mi perro?"
 *
 * Arquetipo RAMIFICADO: en el perro la rutina se arma alrededor del paseo; en
 * el gato no hay paseo y lo que queda es el corte de uñas y el cepillado, así
 * que son dos ramas con salidas distintas. Absorbe 4 URLs (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format:'unit'` (minutos) y CADA
 *    fila declara el suyo (minutos, días, semanas, salidas). Una fila sin
 *    `format` cae a "$" y la página miente.
 *  - `chart.type: 'scale'`: las franjas de intensidad viajan con `from`/`to` en
 *    minutos por día y la necesidad del perro en `position` + `positionLabel`.
 */
export const hub: HubData = {
  slug: 'mascotas/rutina-y-cuidados',
  title: '¿Cuánto ejercicio necesita mi perro? Paseos, baño y corte de uñas por raza',
  description:
    'Minutos de paseo por día según raza, energía, tamaño y edad, en cuántas salidas repartirlos, cada cuántos días bañarlo según el pelo y la piel, y cada cuántas semanas cortarle las uñas a tu perro o a tu gato.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas',
  h1: '¿Cuánto ejercicio y qué cuidados necesita mi perro?',
  lede:
    'Media hora para un bulldog francés está bien; para un husky es una condena. La necesidad de ejercicio cambia dos y hasta cuatro veces entre razas, y con ella cambia todo lo demás: cuántas salidas por día, cada cuánto hay que bañarlo y cada cuánto le crecen las uñas, porque el asfalto se las lima solo. Elegí la raza y salen los cuatro números de la rutina.',
  stamps: ['Actualizado 27-07-2026', 'Guías AKC / The Kennel Club', '4 calculadoras adentro'],

  resultLabel: 'Su rutina diaria',

  cases: {
    title: 'Perro',
    intro: 'Elegí la especie: la rutina del perro gira alrededor del paseo y la del gato alrededor del juego y el rascador.',
    items: [
      {
        id: 'perro',
        label: 'Perro',
        hint: 'Minutos de paseo, salidas por día, baño y uñas.',
        yes: [
          'Minutos de ejercicio por día según raza, energía y tamaño, ajustados por edad',
          'En cuántas salidas repartirlos y cuánto dura cada una',
          'Cada cuántos días bañarlo según tipo de pelo, piel y actividad',
          'Cada cuántas semanas cortarle las uñas según superficie por la que camina',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'En razas braquicéfalas —bulldog, pug, boxer— evitá el esfuerzo intenso y el calor por encima de 25 °C: la dificultad respiratoria es estructural',
          'En cachorros vale la regla del AKC —5 minutos de ejercicio estructurado por cada mes de edad, dos o tres veces al día— y nada de correr en superficie dura hasta que cierren las placas de crecimiento',
          'Bañarlo de más es tan malo como de menos: arrasa la grasa natural de la piel y aparece picazón y descamación',
        ],
        plazo: 'si las uñas hacen clic en el piso liso, ya te pasaste: el quick avanza por dentro y cada vez es más difícil volver al largo sano.',
        answer: 'Un perro mediano de energía media necesita unos 55 minutos de paseo por día en dos salidas, baño cada cinco semanas y uñas cada tres o cuatro.',
      },
      {
        id: 'gato',
        label: 'Gato',
        hint: 'Sin paseo: juego diario, rascador y corte de uñas.',
        yes: [
          'Cada cuántas semanas cortarle las uñas según edad, actividad y si tiene rascador',
          'Por qué el espolón —el dedo interno— necesita revisión aparte',
          'Cuánto juego activo diario le corresponde y por qué reemplaza al paseo',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'La onicectomía —sacar las uñas— es una amputación de la última falange, está prohibida en gran parte del mundo y no es una alternativa al corte',
          'Un gato sin rascador no deja de afilarse las uñas: las afila en el sillón. El rascador no es un accesorio, es infraestructura',
          'Si un gato deja de acicalarse o de saltar, no es "que está viejo": suele ser dolor articular y se consulta',
        ],
        plazo: 'revisá el espolón cada vez que le cortes: no se desgasta nunca y puede clavarse en la almohadilla.',
        answer: 'Un gato adulto con rascador necesita corte de uñas cada 2 a 4 semanas, y uno senior cada 2, porque se afila menos.',
      },
    ],
  },

  inputsTitle: 'Contanos de tu animal',
  inputsIntro:
    'Si tu perro es de una de las razas del listado, el ejercicio sale de ahí. Si es mestizo, elegí "otra" y definí energía y tamaño a mano.',
  fields: [
    {
      id: 'raza',
      label: 'Raza',
      type: 'select',
      value: 'beagle',
      options: [
        { value: 'otra', label: 'Mestizo u otra raza (uso energía y tamaño)' },
        { value: 'labrador-retriever', label: 'Labrador Retriever' },
        { value: 'golden-retriever', label: 'Golden Retriever' },
        { value: 'pastor-aleman', label: 'Pastor Alemán' },
        { value: 'husky-siberiano', label: 'Husky Siberiano' },
        { value: 'boxer', label: 'Boxer' },
        { value: 'rottweiler', label: 'Rottweiler' },
        { value: 'pitbull', label: 'Pitbull' },
        { value: 'beagle', label: 'Beagle' },
        { value: 'caniche-poodle', label: 'Caniche / Poodle' },
        { value: 'dachshund-salchicha', label: 'Dachshund (salchicha)' },
        { value: 'bulldog-ingles', label: 'Bulldog Inglés' },
        { value: 'bulldog-frances', label: 'Bulldog Francés' },
        { value: 'shih-tzu', label: 'Shih Tzu' },
        { value: 'chihuahua', label: 'Chihuahua' },
        { value: 'yorkshire-terrier', label: 'Yorkshire Terrier' },
      ],
      help: 'No aplica al caso gato.',
    },
    {
      id: 'energia',
      label: 'Nivel de energía',
      type: 'select',
      value: 'media',
      options: [
        { value: 'baja', label: 'Baja — tranquilo, duerme la mayor parte del día' },
        { value: 'media', label: 'Media — activo pero se calma solo' },
        { value: 'alta', label: 'Alta — nunca se cansa, necesita trabajo' },
      ],
      help: 'Se usa cuando elegís mestizo, y también define la frecuencia de baño y de uñas.',
    },
    {
      id: 'tamano',
      label: 'Tamaño',
      type: 'select',
      value: 'mediano',
      options: [
        { value: 'chico', label: 'Chico — hasta 10 kg' },
        { value: 'mediano', label: 'Mediano — 10 a 25 kg' },
        { value: 'grande', label: 'Grande — 25 a 45 kg' },
        { value: 'gigante', label: 'Gigante — más de 45 kg' },
      ],
      help: 'A igual energía, un perro más grande necesita algo más de paseo.',
    },
    {
      id: 'edad',
      label: 'Edad',
      type: 'select',
      value: 'adulto',
      options: [
        { value: 'cachorro', label: 'Cachorro (menos de 1 año)' },
        { value: 'adulto', label: 'Adulto' },
        { value: 'senior', label: 'Senior (más de 8 años)' },
      ],
      help: 'El cachorro va al 60% del valor adulto y el senior al 70%, con salidas más cortas y frecuentes.',
    },
    {
      id: 'pelo',
      label: 'Tipo de pelo',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'corto', label: 'Corto' },
        { value: 'medio', label: 'Medio' },
        { value: 'largo', label: 'Largo' },
        { value: 'rizado', label: 'Rizado' },
        { value: 'doble-capa', label: 'Doble capa (husky, pastor, nórdicos)' },
      ],
      help: 'El doble capa se baña poco y se cepilla mucho: el agua de más arruina la capa aislante.',
    },
    {
      id: 'piel',
      label: 'Tipo de piel',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'sensible', label: 'Sensible o con dermatitis' },
        { value: 'grasa', label: 'Grasa, con olor a poco de bañarlo' },
      ],
      help: 'La piel sensible estira la frecuencia un 20% y pide shampoo hipoalergénico o de avena.',
    },
    {
      id: 'superficie',
      label: 'Superficie por la que camina',
      type: 'select',
      value: 'mixta',
      options: [
        { value: 'asfalto', label: 'Asfalto o vereda casi siempre' },
        { value: 'mixta', label: 'Mixta' },
        { value: 'blanda', label: 'Pasto, tierra o interior' },
      ],
      help: 'El asfalto lima las uñas solo y estira el corte una o dos semanas. En gatos, usá esta opción para indicar si tiene rascador: "asfalto" equivale a rascador muy usado.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo. Los minutos son una referencia para un animal sano: en un perro con artrosis, problemas cardíacos, sobrepeso marcado o en recuperación de una cirugía, la carga la define el veterinario. En días de calor extremo, mové el paseo a la primera hora de la mañana o a la noche y tocá el asfalto con la mano antes de salir.',

  chart: {
    type: 'scale',
    title: 'Cuánta descarga necesita',
    caption:
      'La barra ubica los minutos diarios de ejercicio en tres franjas: suave hasta 60 minutos, media hasta 90 y alta por encima. El marcador muestra dónde cae tu perro con su raza, su energía, su tamaño y su edad.',
    bands: [
      { label: 'Suave', from: 0, to: 60, tone: 'good' },
      { label: 'Media', from: 60, to: 90, tone: 'warn' },
      { label: 'Alta', from: 90, to: 130, tone: 'bad' },
    ],
  },
  breakdownTitle: 'La rutina, número por número',
  breakdownIntro:
    'Minutos, salidas, días y semanas: acá no hay dinero. Las barras comparan cada valor contra el mayor.',

  faq: [
    {
      q: '¿Cuánto ejercicio necesita mi perro por día?',
      a: 'Depende sobre todo de la raza. Como referencia de adulto: pastor alemán y husky siberiano unos 120 minutos, labrador, golden, rottweiler, boxer y pitbull unos 90, beagle y caniche unos 60, dachshund unos 45, y bulldog francés, bulldog inglés, shih tzu, chihuahua y yorkshire unos 30. Un cachorro va al 60% de ese valor y un senior al 70%, siempre repartido en más salidas y más cortas.',
    },
    {
      q: '¿Cuántos paseos por día tengo que darle?',
      a: 'Un adulto se maneja bien con dos salidas; un cachorro y un senior necesitan tres, más cortas. Lo que importa no es sólo el total de minutos sino la distribución: dos salidas de 30 minutos rinden mucho más que una de 60 porque el perro necesita orinar, olfatear y descargar varias veces al día, no una sola.',
    },
    {
      q: '¿Cuánto tiene que caminar un cachorro?',
      a: 'La regla clásica del AKC son 5 minutos de ejercicio estructurado por cada mes de edad, dos o tres veces por día: un cachorro de 4 meses hace tres salidas de 20 minutos. La restricción no es por resistencia sino por articulaciones: hasta que cierran las placas de crecimiento, correr en superficies duras y saltar desde altura les daña las caderas y los codos. El juego libre en pasto, en cambio, se autorregula solo.',
    },
    {
      q: '¿Olfatear cuenta como ejercicio?',
      a: 'Cuenta, y bastante más de lo que parece. Un paseo de olfateo cansa a un perro más rápido que la misma cantidad de minutos caminando a paso firme, porque la carga es mental. En perros de energía alta que no se cansan nunca, los juegos de olfato y de búsqueda en casa son la única forma realista de completar la descarga sin correr una maratón todos los días.',
    },
    {
      q: '¿Cada cuánto tengo que bañar a mi perro?',
      a: 'Con pelo corto o doble capa, cada 7 semanas; con pelo medio, cada 5; con pelo largo o rizado, cada 3 y media. A eso se le aplican los ajustes: la actividad alta acorta un 30%, quedarse adentro la estira un 20%, la piel sensible la estira otro 20% y la piel grasa la acorta un 20%. El piso son 14 días y el techo 70: por debajo o por encima de eso ya hay un problema que resolver.',
    },
    {
      q: '¿Bañarlo mucho es malo?',
      a: 'Sí. El baño arrastra la capa de sebo que protege la piel del perro, y sin ella aparecen sequedad, picazón, descamación y, por rascado, infecciones secundarias. Si el perro se ensucia seguido, casi siempre alcanza con enjuagar las patas y la panza y con cepillar bien: el cepillado hace más por el pelo que el agua. Y si huele mal en pocos días, la causa suele ser piel grasa, otitis o problema dental, no falta de baño.',
    },
    {
      q: '¿Cada cuánto se cortan las uñas a un perro?',
      a: 'Un perro de actividad alta que camina asfalto puede estirarse a 5 u 8 semanas porque se las lima solo; uno de actividad moderada va cada 3 o 4 semanas, y uno sedentario o que sólo pisa pasto e interiores, cada 2 o 3. La señal más clara es acústica: si escuchás el clic de las uñas en el piso liso, ya están largas. Y el espolón, el dedo interno, hay que revisarlo siempre aparte porque no toca el suelo y no se desgasta nunca.',
    },
    {
      q: '¿Cómo corto uñas negras sin lastimarlo?',
      a: 'De a poco: cortes de uno o dos milímetros hasta que aparezca un punto gris u oscuro en el centro de la superficie cortada, que indica que estás cerca del quick, la parte con vaso y nervio. Con uñas claras el quick se ve rosado y se corta dos milímetros antes. Tené siempre polvo hemostático a mano, y si preferís, una lima rotativa da más control que la tenaza.',
    },
    {
      q: '¿Cada cuánto se cortan las uñas a un gato?',
      a: 'Un gato adulto con rascador y mucha actividad se maneja con un corte cada 3 o 4 semanas; con rascador y actividad normal, cada 2 o 3; y sin rascador, cada 2. Un gato senior necesita cada 2 semanas, porque se afila menos y las uñas se le engrosan. En todos los casos hay que revisar el espolón, que nunca se desgasta y puede llegar a clavarse en la almohadilla.',
    },
    {
      q: '¿Los perros braquicéfalos pueden hacer ejercicio?',
      a: 'Sí, pero con reglas. Bulldog, pug, boxer y compañía tienen una vía aérea comprimida que limita el intercambio de aire y la refrigeración, así que el esfuerzo intenso y el calor son un riesgo real de golpe de calor. Para ellos: paseos cortos y frecuentes, terreno plano, nada de correr en verano, y salir siempre en las horas frescas. Si jadea con la lengua morada o hace ruido inspiratorio marcado, se para y se consulta.',
    },
    {
      q: '¿Qué hago si mi perro no se cansa nunca?',
      a: 'Sumar carga mental antes que más kilómetros. Juegos de olfato y búsqueda, dispensadores de comida, sesiones cortas de entrenamiento de obediencia o trucos, mordillos de trabajo. Un perro de raza de trabajo con dos horas de caminata monótona sigue con energía; con cuarenta minutos de caminata más veinte de trabajo mental queda satisfecho. Y ojo con lo contrario: correr todos los días a máxima intensidad crea un atleta que necesita cada vez más.',
    },
    {
      q: '¿Los gatos necesitan ejercicio?',
      a: 'Necesitan juego, que es su forma de ejercicio. La referencia son dos o tres sesiones de 10 a 15 minutos por día con juguetes que imiten presas —cañas con plumas, ratones, punteros— y siempre terminando con una "captura" para no dejarlo frustrado. Sumado a eso, altura: repisas, rascadores altos y lugares para trepar. En un gato de departamento, el juego diario es lo que previene el sobrepeso y buena parte de los problemas de conducta.',
    },
  ],

  sources: [
    {
      name: 'American Kennel Club — How Much Exercise Does a Dog Need?',
      url: 'https://www.akc.org/expert-advice/health/how-much-exercise-does-dog-need/',
      publisher: 'AKC',
    },
    {
      name: 'The Kennel Club — Exercise guidance by breed and puppy exercise rule',
      url: 'https://www.thekennelclub.org.uk/health-and-dog-care/health/keeping-your-dog-healthy/exercising-your-dog/',
      publisher: 'The Kennel Club',
    },
    {
      name: 'AAHA — Grooming, bathing and nail care recommendations',
      url: 'https://www.aaha.org/resources/pet-owner-resources/',
      publisher: 'American Animal Hospital Association',
    },
    {
      name: 'AAFP — Nail trimming y por qué la onicectomía no es una alternativa',
      url: 'https://catvets.com/guidelines/position-statements/declawing/',
      publisher: 'American Association of Feline Practitioners',
    },
    {
      name: 'ISFM / International Cat Care — Juego y enriquecimiento ambiental del gato',
      url: 'https://icatcare.org/articles/playing-with-your-cat',
      publisher: 'International Cat Care',
    },
  ],

  replaces: [
    '/calculadora-ejercicio-diario-raza-perro',
    '/calculadora-paseos-perro-minutos-raza-energia',
    '/calculadora-frecuencia-bano-perro-raza-tipo-pelo',
    '/calculadora-frecuencia-corte-unas-perro-gato',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-tamano-cucha-perro-medidas',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Minutos de ejercicio del adulto y tamaño, calcados del mapa `RAZAS` de
 * `src/lib/formulas/ejercicio-diario-raza-perro.ts`.
 */
export const RAZAS: Record<string, { nombre: string; minutos: number; tamano: string }> = {
  'labrador-retriever': { nombre: 'Labrador Retriever', minutos: 90, tamano: 'grande' },
  'golden-retriever': { nombre: 'Golden Retriever', minutos: 90, tamano: 'grande' },
  'bulldog-frances': { nombre: 'Bulldog Francés', minutos: 30, tamano: 'chico' },
  'bulldog-ingles': { nombre: 'Bulldog Inglés', minutos: 30, tamano: 'mediano' },
  'pastor-aleman': { nombre: 'Pastor Alemán', minutos: 120, tamano: 'grande' },
  beagle: { nombre: 'Beagle', minutos: 60, tamano: 'mediano' },
  'caniche-poodle': { nombre: 'Caniche / Poodle', minutos: 60, tamano: 'mediano' },
  chihuahua: { nombre: 'Chihuahua', minutos: 30, tamano: 'chico' },
  rottweiler: { nombre: 'Rottweiler', minutos: 90, tamano: 'grande' },
  'yorkshire-terrier': { nombre: 'Yorkshire Terrier', minutos: 30, tamano: 'chico' },
  boxer: { nombre: 'Boxer', minutos: 90, tamano: 'grande' },
  'dachshund-salchicha': { nombre: 'Dachshund', minutos: 45, tamano: 'chico' },
  'husky-siberiano': { nombre: 'Husky Siberiano', minutos: 120, tamano: 'grande' },
  'shih-tzu': { nombre: 'Shih Tzu', minutos: 30, tamano: 'chico' },
  pitbull: { nombre: 'Pitbull', minutos: 90, tamano: 'mediano' },
};

/** Razas braquicéfalas del listado: llevan advertencia por calor y esfuerzo. */
export const BRAQUICEFALAS = ['bulldog-frances', 'bulldog-ingles', 'boxer', 'shih-tzu'];

/**
 * Minutos de paseo por día para adulto sano según energía y tamaño, calcados
 * del mapa `BASE` de `paseos-perro-minutos-raza-energia.ts`.
 */
export const PASEO_BASE: Record<string, Record<string, number>> = {
  baja: { chico: 25, mediano: 30, grande: 35, gigante: 40 },
  media: { chico: 40, mediano: 55, grande: 70, gigante: 75 },
  alta: { chico: 60, mediano: 80, grande: 100, gigante: 110 },
};

/** Multiplicador por edad sobre la base adulta. */
export const FACTOR_EDAD: Record<string, number> = {
  cachorro: 0.6,
  adulto: 1.0,
  senior: 0.7,
};

/**
 * Baño: días base por tipo de pelo y ajustes por actividad y piel, calcados de
 * `frecuencia-bano-perro.ts`. El resultado se recorta al rango 14-70 días.
 */
export const BANO = {
  base: { corto: 49, medio: 35, largo: 25, rizado: 25, 'doble-capa': 49 },
  actividad: { alta: 0.7, moderada: 1.0, interior: 1.2 },
  piel: { normal: 1.0, sensible: 1.2, grasa: 0.8 },
  min: 14,
  max: 70,
};
