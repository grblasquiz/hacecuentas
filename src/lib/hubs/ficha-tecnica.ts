import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué me están diciendo los números de la ficha técnica?"
 *
 * Arquetipo RAMIFICADO: la ficha técnica no es una pregunta sola. Alguien que
 * mira la planilla de un usado quiere saber cuánta potencia tiene, si es rápido,
 * cuánto puede cargar, si va a raspar los bajos o en cuántos metros frena. Cada
 * una es una rama con su propio número grande y su propia unidad.
 *
 * Absorbe 9 calculadoras sueltas (ver hub.replaces):
 *  - cilindrada cc ↔ litros
 *  - potencia estimada por cilindrada (cc → HP)
 *  - conversor HP / kW / CV
 *  - conversor de torque Nm / lb·ft / kg·m
 *  - relación potencia/peso y velocidad máxima teórica
 *  - conversor de velocidad km/h / mph / nudos / m/s
 *  - capacidad de carga de camioneta (PBT − tara)
 *  - altura libre al piso por tipo de carrocería
 *  - distancia de frenado por velocidad y adherencia
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay plata en ninguna rama. TODA fila declara `format:'unit'` o
 *    `format:'plain'`: el default del runtime es 'ars' y una fila sin formato
 *    propio se imprimiría con "$" adelante.
 *  - El gráfico es `scale`: en todas las ramas la pregunta es "¿dónde cae mi
 *    auto?", así que compute() devuelve `position` (0-100) y `positionLabel`,
 *    y las franjas viajan como segmentos con `from`/`to` (cambian por rama).
 */

/** Disclaimer YMYL — src/lib/disclaimers.ts, dominio 'general' (categoría automotor). */
export const DISCLAIMER =
  'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.';

export const hub: HubData = {
  slug: 'auto/ficha-tecnica',
  title: 'Ficha técnica del auto: potencia, torque, carga y frenado | Hacé Cuentas',
  description:
    'Traducí los números de la ficha técnica: cilindrada en cc y litros, HP a kW y CV, torque en Nm o lb·ft, relación potencia/peso y velocidad máxima, carga útil de la camioneta, altura libre al piso y distancia de frenado.',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Guía de especificaciones',
  h1: '¿Qué me dicen los números de la ficha técnica?',
  lede:
    'Cilindrada, potencia, torque, PBT, tara, despeje: la planilla de un auto está llena de números que no vienen con traducción. Elegí abajo qué querés saber y el hub te lo convierte, lo ubica en una escala y te dice si el valor es alto o bajo para ese tipo de vehículo.',
  stamps: ['Factores de conversión CODATA/NIST', 'Escalas por tipo de carrocería', '9 calculadoras adentro'],

  resultLabel: 'El número que estabas buscando',

  cases: {
    title: '¿Qué querés averiguar?',
    intro: 'Arrancamos por lo que más se busca: la potencia. Si tu duda es otra, cambiala.',
    items: [
      {
        id: 'potencia',
        label: 'Cuánta potencia tiene y cómo se convierte',
        hint: 'HP, kW, CV y cilindrada',
        answer:
          'HP, kW y CV miden lo mismo con distinta vara: 1 HP = 0,7457 kW = 1,014 CV. La cilindrada, en cambio, no es potencia — sólo la insinúa.',
        yes: [
          'Conversión exacta entre HP, kW y CV a partir de la unidad que tengas',
          'Cilindrada pasada de centímetros cúbicos a litros',
          'Potencia aproximada estimada desde la cilindrada, con y sin turbo',
          'Potencia específica en HP por litro, que es lo que muestra qué tan trabajado está el motor',
        ],
        warn: [
          DISCLAIMER,
          'La estimación de HP por cilindrada es un promedio grueso: dos motores del mismo litraje pueden diferir en más del 40% según inyección, turbo y puesta a punto',
          'La ficha del fabricante suele publicar la potencia en kW o CV según el mercado; compará siempre la misma unidad antes de decir que un auto tiene más',
          'La potencia declarada se mide en banco con norma (SAE o CE) y no es la que llega a las ruedas: en la rueda se pierde entre el 10% y el 20%',
        ],
        plazo: 'si estás comparando dos usados, anotá los HP y el peso de cada uno: sin el peso, la potencia sola no dice nada.',
      },
      {
        id: 'performance',
        label: 'Si es rápido: potencia sobre peso',
        hint: 'HP/ton y velocidad máxima',
        answer:
          'Lo que define si un auto empuja no son los HP sino los HP por tonelada: por debajo de 70 se siente pesado, por arriba de 130 se siente ágil.',
        yes: [
          'Relación potencia/peso en HP por tonelada y en kilos que mueve cada HP',
          'Velocidad máxima teórica estimada por equilibrio con la resistencia del aire',
          'Ubicación del auto en la escala que va de pesado a superdeportivo',
          'La velocidad máxima también convertida a mph y a nudos',
        ],
        warn: [
          DISCLAIMER,
          'La velocidad máxima es teórica: el modelo sólo equilibra potencia contra resistencia aerodinámica, ignora la resistencia a la rodadura y asume un área frontal fija de 2,2 m², así que sobreestima el valor real (más cuanto menos potencia tiene el auto)',
          'La mayoría de los autos de calle están limitados electrónicamente muy por debajo de su máxima teórica',
          'El peso a usar es el del auto en orden de marcha; si viajás cargado, sumá los ocupantes y el equipaje antes de comparar',
        ],
        plazo: 'usá este número para comparar dos autos entre sí, no para creerle la velocidad final.',
      },
      {
        id: 'torque',
        label: 'Tengo el torque en otra unidad',
        hint: 'Nm, lb·ft y kg·m',
        answer:
          'El torque es la fuerza de giro, no la potencia: 1 lb·ft = 1,3558 Nm y 1 kg·m = 9,80665 Nm.',
        yes: [
          'Conversión entre newton metro, libra pie y kilográmetro con los factores exactos',
          'El mismo valor expresado en las tres unidades a la vez',
          'Referencia de si ese torque es bajo, medio o alto para un motor de calle',
        ],
        warn: [
          DISCLAIMER,
          'Si el número sale de la ficha de apriete de un tornillo, respetá el valor del fabricante al décimo: apretar de más estría la rosca y apretar de menos la afloja sola',
          'La llave dinamométrica se calibra: una llave sin calibrar puede errar más que la diferencia entre unidades',
          'Torque alto a bajas vueltas es lo que se siente en el manejo diario; torque alto arriba de 5.000 rpm casi no se usa en calle',
        ],
        plazo: 'antes de apretar bulones de rueda o de tapa de cilindros, buscá el valor exacto del manual: no lo estimes.',
      },
      {
        id: 'carga',
        label: 'Cuánto puedo cargar en la camioneta',
        hint: 'PBT menos tara',
        answer:
          'La carga útil es el peso bruto total menos la tara, y ahí adentro entran también los ocupantes, no sólo lo que va en la caja.',
        yes: [
          'Carga útil disponible en kilos, calculada como PBT menos tara',
          'Qué porcentaje del peso bruto total representa esa carga útil',
          'Cuánto te queda realmente para la caja después de descontar los ocupantes',
        ],
        warn: [
          DISCLAIMER,
          'Los ocupantes cuentan como carga: cuatro personas se comen unos 300 kg de la capacidad antes de que subas nada a la caja',
          'Pasarte del PBT es infracción, castiga frenos y suspensión, y le da a la aseguradora un argumento para discutir la cobertura en un siniestro',
          'PBT y tara están en la cédula y en la ficha del fabricante; si le pusiste barra antivuelco, cubrecaja o llantas más pesadas, la tara real subió y la capacidad bajó',
        ],
        plazo: 'pesá la camioneta cargada en una balanza pública si vas a viajar al límite: la tara de catálogo casi nunca es la real.',
      },
      {
        id: 'despeje',
        label: 'Si voy a raspar los bajos',
        hint: 'Altura libre al piso',
        answer:
          'Un sedán anda en 12 a 15 cm de altura libre, una SUV entre 18 y 22, y un 4x4 preparado entre 25 y 30.',
        yes: [
          'Rango típico de altura libre al piso según el tipo de carrocería',
          'Punto medio del rango para comparar contra el auto que estás mirando',
          'Referencia de lomos de burro, cordones y rampas de cochera',
        ],
        warn: [
          DISCLAIMER,
          'Es un rango de referencia por carrocería, no la medida de tu auto: medila vos con el auto en orden de marcha y la presión de neumáticos correcta',
          'La altura publicada suele ser sin carga; con cinco personas y baúl lleno la suspensión baja varios centímetros',
          'Lo que raspa no siempre es el punto más bajo del chasis: el paragolpes delantero y el escape suelen tocar antes',
        ],
        plazo: 'si vas a bajar el auto o ponerle llantas más grandes, medí la altura antes y después: el margen se pierde rápido.',
      },
      {
        id: 'frenado',
        label: 'En cuántos metros freno',
        hint: 'Distancia de detención',
        answer:
          'La distancia total es lo que recorrés mientras reaccionás más lo que recorrés frenando, y la parte de frenado crece con el cuadrado de la velocidad.',
        yes: [
          'Metros recorridos durante el tiempo de reacción',
          'Metros de frenado efectivo según el coeficiente de adherencia de la superficie',
          'Distancia total de detención y a cuántos largos de auto equivale',
          'La velocidad de entrada convertida a m/s, mph y nudos',
        ],
        warn: [
          DISCLAIMER,
          'El modelo asume frenada máxima con ABS y neumáticos en buen estado: gomas gastadas o frenos con fading estiran la distancia bastante más',
          'Duplicar la velocidad no duplica la distancia de frenado: la cuadruplica, porque depende de la velocidad al cuadrado',
          'En piso mojado el coeficiente de adherencia cae casi a la mitad, y sobre hielo a menos de una quinta parte',
        ],
        plazo: 'la distancia total es la regla para elegir la separación con el auto de adelante: si no te entra, estás muy cerca.',
      },
    ],
  },

  inputsTitle: 'Cargá los datos que tengas',
  inputsIntro:
    'No hace falta completar todo: cada rama usa sólo los campos que necesita. Los que sobran quedan ahí para cuando cambies de pregunta.',
  fields: [
    {
      id: 'unidad',
      label: 'Unidad en la que viene la potencia',
      type: 'select',
      value: 'hp',
      options: [
        { value: 'hp', label: 'HP (caballo de fuerza)' },
        { value: 'kw', label: 'kW (kilovatio)' },
        { value: 'cv', label: 'CV (caballo de vapor)' },
      ],
      help: 'Las fichas europeas publican kW y CV; las americanas, HP.',
    },
    { id: 'potencia', label: 'Potencia declarada', type: 'number', min: 1, max: 2000, step: 1, value: 110 },
    {
      id: 'cc',
      label: 'Cilindrada del motor',
      type: 'number',
      min: 50,
      max: 10000,
      step: 1,
      value: 1600,
      suffix: 'cc',
      help: 'En centímetros cúbicos. Un 1.6 son 1.600 cc.',
    },
    {
      id: 'turbo',
      label: '¿Es turbo?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, atmosférico' },
        { value: 'si', label: 'Sí, turbo o sobrealimentado' },
      ],
    },
    {
      id: 'peso',
      label: 'Peso del auto en orden de marcha',
      type: 'number',
      min: 300,
      max: 5000,
      step: 10,
      value: 1200,
      suffix: 'kg',
    },
    { id: 'torque', label: 'Torque declarado', type: 'number', min: 1, max: 5000, step: 1, value: 200 },
    {
      id: 'torqueUnidad',
      label: 'Unidad del torque',
      type: 'select',
      value: 'nm',
      options: [
        { value: 'nm', label: 'Nm (newton metro)' },
        { value: 'lbft', label: 'lb·ft (libra pie)' },
        { value: 'kgm', label: 'kg·m (kilográmetro)' },
      ],
    },
    {
      id: 'pbt',
      label: 'Peso bruto total (PBT)',
      type: 'number',
      min: 500,
      max: 20000,
      step: 10,
      value: 3000,
      suffix: 'kg',
      help: 'Figura en la cédula del vehículo como PBT o PMA.',
    },
    { id: 'tara', label: 'Tara (peso en vacío)', type: 'number', min: 300, max: 20000, step: 10, value: 2000, suffix: 'kg' },
    {
      id: 'ocupantes',
      label: 'Ocupantes que viajan',
      type: 'number',
      min: 0,
      max: 9,
      step: 1,
      value: 4,
      help: 'Se descuentan a 75 kg cada uno de la carga útil.',
    },
    {
      id: 'tipo',
      label: 'Tipo de carrocería',
      type: 'select',
      value: 'sedan',
      options: [
        { value: 'sedan', label: 'Sedán o hatchback' },
        { value: 'suv', label: 'SUV o crossover' },
        { value: 'pickup', label: 'Pickup' },
        { value: 'off', label: '4x4 off-road' },
      ],
    },
    { id: 'velocidad', label: 'Velocidad a la que venís', type: 'number', min: 5, max: 300, step: 5, value: 100, suffix: 'km/h' },
    {
      id: 'superficie',
      label: 'Superficie y estado del piso',
      type: 'select',
      value: '0.7',
      options: [
        { value: '0.9', label: 'Asfalto seco, gomas nuevas (μ 0,90)' },
        { value: '0.7', label: 'Asfalto seco, gomas usadas (μ 0,70)' },
        { value: '0.5', label: 'Asfalto mojado (μ 0,50)' },
        { value: '0.35', label: 'Ripio o tierra compacta (μ 0,35)' },
        { value: '0.15', label: 'Nieve o hielo (μ 0,15)' },
      ],
    },
    {
      id: 'reaccion',
      label: 'Tiempo de reacción',
      type: 'number',
      min: 0,
      max: 5,
      step: 0.1,
      value: 1,
      suffix: 'seg',
      help: 'Un conductor atento reacciona en ~1 segundo; distraído o cansado, en 1,5 o más.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu auto en la escala',
    caption:
      'La barra es la escala completa de la rama que elegiste — potencia, HP por tonelada, torque, porcentaje de carga útil, centímetros de despeje o metros de frenado. El marcador te muestra en qué franja cae tu número, y la leyenda indica dónde empieza y termina cada franja.',
  },
  breakdownTitle: 'Los números, uno por uno',
  breakdownIntro:
    'Ninguna fila de este hub es plata: todas llevan su unidad. Las barras comparan cada valor contra el mayor de la lista.',

  faq: [
    {
      q: '¿Cuántos kW es 1 HP?',
      a: 'Un HP (horsepower mecánico) son 0,7457 kW. Al revés, 1 kW son 1,341 HP. El CV europeo es apenas distinto: 1 CV son 0,7355 kW, así que 1 HP equivale a 1,0139 CV. Por eso un mismo motor puede figurar como 150 HP en una ficha y 152 CV en otra sin que nadie mienta.',
    },
    {
      q: '¿La cilindrada define la potencia?',
      a: 'No, sólo la condiciona. Como regla gruesa un motor atmosférico moderno entrega alrededor de 85 HP por litro y uno turbo puede llegar a 150 HP por litro, pero la dispersión real es enorme: la inyección, la relación de compresión, el árbol de levas y la presión de soplado cambian el resultado en más del 40%. Usá la cilindrada para tener un orden de magnitud, no para decidir una compra.',
    },
    {
      q: '¿Qué es mejor mirar, la potencia o el torque?',
      a: 'Depende de qué te importa. El torque es la fuerza de giro y es lo que sentís al arrancar y al sobrepasar; la potencia es torque por vueltas, y es lo que define la velocidad máxima. Para ciudad y ruta cargada, un motor con mucho torque a bajas vueltas se maneja más cómodo aunque tenga menos HP.',
    },
    {
      q: '¿Cuántos HP por tonelada necesita un auto para andar bien?',
      a: 'Por debajo de 70 HP por tonelada el auto se siente pesado, sobre todo cargado o en subida. Entre 70 y 100 alcanza para uso diario. Entre 100 y 130 se siente ágil, y por encima de 170 ya hablamos de un auto rápido. Es un número mucho más útil que los HP solos, porque un motor potente en un vehículo pesado no rinde.',
    },
    {
      q: '¿Por qué la velocidad máxima estimada me da más alta que la real?',
      a: 'Porque el modelo equilibra la potencia contra la resistencia aerodinámica y nada más. En el mundo real también hay resistencia a la rodadura de los neumáticos, pérdidas de transmisión mayores a las que asume el cálculo, y área frontal distinta a los 2,2 m² que toma por defecto. Sumado al limitador electrónico que traen casi todos los autos de calle, la velocidad real termina bastante por debajo. Sirve para comparar dos autos, no como dato absoluto.',
    },
    {
      q: '¿Qué es exactamente la carga útil de una camioneta?',
      a: 'Es el peso bruto total (PBT) menos la tara. El PBT es el máximo que puede pesar el vehículo con todo adentro, y la tara es lo que pesa vacío con los fluidos. La diferencia es todo lo que podés sumar: ocupantes, equipaje y lo que va en la caja. Mucha gente se olvida de los ocupantes y termina sobrecargando sin darse cuenta.',
    },
    {
      q: '¿Qué pasa si me paso del PBT?',
      a: 'Es una infracción de tránsito y además un problema mecánico y de seguridad: los frenos necesitan más distancia, la suspensión y los neumáticos trabajan fuera de especificación, y el comportamiento en curva cambia. Ante un siniestro, circular sobrecargado le da a la aseguradora un argumento para discutir la cobertura.',
    },
    {
      q: '¿Cuánta altura libre al piso necesito?',
      a: 'Para ciudad y ruta pavimentada, los 12 a 15 cm de un sedán alcanzan siempre que cuides los lomos de burro y las rampas de cochera. Para calles rotas o ripio ocasional, los 18 a 22 cm de una SUV dan tranquilidad. Por encima de 25 cm ya estamos en terreno off-road, con la contra de un centro de gravedad más alto y peor comportamiento en curva.',
    },
    {
      q: '¿En cuántos metros frena un auto a 100 km/h?',
      a: 'Sobre asfalto seco con gomas nuevas, unos 71 metros contando un segundo de reacción: 28 metros los recorrés antes de tocar el pedal y unos 44 frenando. Con gomas usadas la total sube a unos 84 metros, y en asfalto mojado supera los 105. Es la razón por la que la separación segura se mide en segundos, no en largos de auto.',
    },
    {
      q: 'Si voy al doble de velocidad, ¿freno en el doble de distancia?',
      a: 'No: frenás en mucho más. La distancia de frenado efectivo depende de la velocidad al cuadrado, así que duplicar la velocidad cuadruplica esa parte. La distancia de reacción sí crece proporcional. En total, pasar de 60 a 120 km/h más que triplica los metros que necesitás para detenerte.',
    },
    {
      q: '¿Cómo paso Nm a lb·ft?',
      a: 'Se divide por 1,3558. Al revés, para pasar de lb·ft a Nm se multiplica por ese mismo número. El kilográmetro es la tercera unidad que vas a encontrar en manuales viejos: 1 kg·m son 9,80665 Nm. Cuando el valor viene de una ficha de apriete, usá los decimales: redondear el factor te puede correr varios newton metro en un bulón crítico.',
    },
    {
      q: '¿Cuántos litros son 1.600 cc?',
      a: '1,6 litros. La conversión es directa: se divide por 1.000, porque un litro son exactamente 1.000 centímetros cúbicos. Por eso un motor "1.4" tiene 1.400 cc y un "2.0", 2.000 cc. Los fabricantes redondean el nombre comercial, así que un 2.0 real puede tener 1.984 cc.',
    },
    {
      q: '¿Cuántos km/h son 60 mph?',
      a: '96,6 km/h. Una milla por hora equivale a 1,609344 km/h exactos. El nudo, que aparece en náutica y aviación, es 1,852 km/h. Y para pasar km/h a metros por segundo —la unidad que usa la física del frenado— se divide por 3,6.',
    },
  ],

  sources: [
    {
      name: 'NIST Special Publication 811 — Guide for the Use of the International System of Units',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'The International System of Units (SI Brochure, 9.ª edición)',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures',
    },
    {
      name: 'Ley Nacional de Tránsito 24.449 — pesos, dimensiones y condiciones de seguridad',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/818/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Decreto 779/95 — reglamentación de la Ley de Tránsito (anexos de pesos máximos)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/30000-34999/30338/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Agencia Nacional de Seguridad Vial — distancias de detención y seguridad activa',
      url: 'https://www.argentina.gob.ar/seguridadvial',
      publisher: 'Agencia Nacional de Seguridad Vial',
    },
    {
      name: 'SAE J1349 — Engine Power Test Code, Spark Ignition and Compression Ignition',
      url: 'https://www.sae.org/standards/content/j1349_201109/',
      publisher: 'SAE International',
    },
  ],

  replaces: [
    '/calculadora-cilindrada-motor-cc-litros',
    '/calculadora-cilindrada-motor-relacion-potencia',
    '/calculadora-potencia-hp-kw-cv',
    '/calculadora-conversion-torque-nm-lb-ft-kgm',
    '/calculadora-conversion-velocidad-kmh-mph-nudos',
    '/calculadora-velocidad-maxima-relacion-potencia-peso',
    '/calculadora-capacidad-carga-camioneta-peso-util',
    '/calculadora-suspension-altura-libre-piso-auto',
    '/calculadora-distancia-frenado-velocidad-adhesion',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
};

/**
 * Constantes de conversión.
 *
 * OJO: las fórmulas viejas usaban factores redondeados a 3-4 cifras
 * (lb·ft→Nm 1,356 · kg·m→Nm 9,807 · Nm→lb·ft 0,738 · Nm→kg·m 0,102).
 * Acá van los valores exactos derivados de las definiciones SI, porque la
 * página vieja prometía "factores exactos NIST" y no los usaba. La diferencia
 * es de hasta ~0,06%, irrelevante en un motor y relevante en una ficha de apriete.
 */
export const CONV = {
  /** 1 HP (mecánico) = 745,699872 W. */
  hpToKw: 0.745699872,
  /** 1 CV (métrico) = 735,49875 W. */
  cvToKw: 0.73549875,
  /** 1 lb·ft = 1,3558179483314 N·m. */
  lbftToNm: 1.3558179483314004,
  /** 1 kg·m = 9,80665 N·m (gravedad estándar). */
  kgmToNm: 9.80665,
  /** 1 mph = 1,609344 km/h exactos. */
  mphToKmh: 1.609344,
  /** 1 nudo = 1,852 km/h exactos. */
  ktToKmh: 1.852,
  /** Gravedad estándar, para la distancia de frenado. */
  g: 9.81,
};

/**
 * Parámetros por rama.
 *  - `hpPorLitro`: espejo de `cilindrada-motor-relacion-potencia.ts` (85 atm / 150 turbo).
 *  - El modelo de velocidad máxima es el de `velocidad-maxima-relacion-potencia-peso.ts`:
 *    P·η = ½·ρ·Cd·A·v³ con Cd 0,30, A 2,2 m², ρ 1,225 y η 0,85.
 *  - `ALTURA_LIBRE` es la tabla de `suspension-altura-libre-piso-auto.ts`, en cm.
 */
export const HP_POR_LITRO = { no: 85, si: 150 };

export const AERO = { cd: 0.3, area: 2.2, rho: 1.225, eficiencia: 0.85, wattsPorHp: 745.7 };

export const ALTURA_LIBRE: Record<string, { nombre: string; min: number; max: number }> = {
  sedan: { nombre: 'sedán o hatchback', min: 12, max: 15 },
  suv: { nombre: 'SUV o crossover', min: 18, max: 22 },
  pickup: { nombre: 'pickup', min: 20, max: 25 },
  off: { nombre: '4x4 off-road', min: 25, max: 30 },
};

/** Franjas de la escala, por rama. `[desde, hasta, etiqueta, tono]`. */
export const BANDAS: Record<string, Array<[number, number, string, string]>> = {
  potencia: [
    [0, 130, 'Económico', 'good'],
    [130, 200, 'Medio', 'main'],
    [200, 400, 'Sport', 'warn'],
    [400, 600, 'Supercar', 'bad'],
  ],
  performance: [
    [0, 70, 'Pesado', 'bad'],
    [70, 100, 'Uso diario', 'warn'],
    [100, 130, 'Ágil', 'main'],
    [130, 170, 'Rápido', 'good'],
    [170, 250, 'Deportivo', 'exit'],
    [250, 400, 'Superdeportivo', 'prop'],
  ],
  torque: [
    [0, 150, 'Bajo', 'good'],
    [150, 300, 'Medio', 'main'],
    [300, 500, 'Alto', 'warn'],
    [500, 800, 'Muy alto', 'bad'],
  ],
  carga: [
    [0, 20, 'Escasa', 'bad'],
    [20, 35, 'Normal', 'warn'],
    [35, 50, 'Amplia', 'main'],
    [50, 70, 'De trabajo', 'good'],
  ],
  despeje: [
    [0, 15, 'Bajo', 'warn'],
    [15, 20, 'Medio', 'main'],
    [20, 25, 'Alto', 'good'],
    [25, 32, 'Off-road', 'exit'],
  ],
  frenado: [
    [0, 30, 'Corta', 'good'],
    [30, 60, 'Media', 'main'],
    [60, 100, 'Larga', 'warn'],
    [100, 200, 'Muy larga', 'bad'],
  ],
};
