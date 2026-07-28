import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuál es mi huella de carbono?"
 *
 * Absorbe 9 calculadoras ambientales sueltas. La pregunta central es una sola
 * —cuánto CO₂ genero y cómo lo bajo— pero se entra por cinco puertas distintas:
 * la huella anual completa, el vuelo, la dieta, la basura y los árboles que
 * harían falta para compensar.
 *
 * TODO EL HUB SE LEE EN KILOS DE CO₂: las cinco ramas ponen un número sobre la
 * misma escala. Por eso el gráfico es `scale` y la unidad no cambia entre ramas.
 *
 * DOS CALCULADORAS QUE NO SON CARBONO (decisión explícita, ver reporte):
 *  - Huella hídrica de alimentos (litros de agua por kilo): NO es carbono, es
 *    agua. Va integrada dentro de la rama de alimentación como segunda métrica
 *    del mismo formulario, con los mismos cuatro campos de dieta. No tiene rama
 *    propia porque partiría el foco del hub, pero tampoco se pierde: el usuario
 *    que buscaba litros de agua por alimento encuentra su número.
 *  - Tiempo de biodegradación de materiales: NO es carbono, es persistencia del
 *    residuo. Va integrada dentro de la rama de basura, como las filas que
 *    explican qué pasa con lo que NO reciclás. Es del mismo mundo y responde la
 *    pregunta siguiente a "cuánto CO₂ evito reciclando".
 *
 * FACTORES DE EMISIÓN: todos salen de las fórmulas reales del repo y todos
 * tienen fuente pública citada (DEFRA para vuelos, EWG/Poore-Nemecek para
 * alimentos, Mekonnen & Hoekstra para agua). Las discrepancias detectadas
 * contra las fuentes originales están en el reporte de la sesión.
 */

/* ------------------------------------------------------------------ *
 * 1. Huella personal anual
 * Espejo exacto de `src/lib/formulas/huella-carbono-personal.ts`.
 * ------------------------------------------------------------------ */

/** kg CO₂ por km recorrido, por medio de transporte. */
export const CO2_KM: Record<string, number> = {
  auto: 0.21,
  electrico: 0.05,
  'transporte-publico': 0.06,
  bicicleta: 0,
};

/** Toneladas de CO₂ al año atribuibles a la dieta, por patrón alimentario. */
export const CO2_DIETA: Record<string, number> = {
  'carne-diaria': 2.5,
  mixta: 1.5,
  vegetariana: 1.0,
  vegana: 0.7,
};

/** Toneladas de CO₂ al año por consumo energético del hogar. */
export const CO2_ENERGIA: Record<string, number> = {
  baja: 0.6,
  media: 1.0,
  alta: 1.8,
};

/** Bolsa de emisiones difusas (consumo, servicios, bienes), en toneladas/año. */
export const CO2_OTROS = 1.0;

/** Huella per cápita de referencia en Argentina, en toneladas de CO₂ al año. */
export const PROMEDIO_AR = 4.7;

/* ------------------------------------------------------------------ *
 * 2. Vuelos
 * Espejo exacto de `src/lib/formulas/vuelo-emisiones-co2-pasajero.ts`.
 * Factores DEFRA en kg CO₂ por pasajero y por kilómetro.
 * ------------------------------------------------------------------ */

export const FACTORES_VUELO: Record<string, Record<string, number>> = {
  corto: { economica: 0.156, premiumeconomy: 0.234, business: 0.468, first: 0.468 },
  medio: { economica: 0.131, premiumeconomy: 0.197, business: 0.393, first: 0.525 },
  largo: { economica: 0.115, premiumeconomy: 0.184, business: 0.334, first: 0.46 },
};

/**
 * Cortes de distancia para clasificar el vuelo, en km por tramo.
 * La calculadora original pedía el tipo de vuelo como un campo aparte, lo que
 * dejaba elegir combinaciones imposibles (un vuelo "corto" de 12.000 km). Acá
 * se deriva de la distancia con los cortes habituales de la industria.
 */
export const CORTE_VUELO = { corto: 1500, medio: 3700 } as const;

/** kg de CO₂ que absorbe un árbol por año en el cálculo de compensación de vuelos. */
export const ARBOL_VUELO_KG = 20;

/** Rango de precio del crédito de carbono, en USD por tonelada. */
export const CREDITO_USD_TON = { min: 15, max: 30 } as const;

/* ------------------------------------------------------------------ *
 * 3. Árboles para compensar
 * Espejo exacto de `src/lib/formulas/arboles-compensar-co2-huella.ts`.
 * ------------------------------------------------------------------ */

export const ESPECIES: Record<string, { nombre: string; absorcion: number; anios: number; densidad: number }> = {
  paulownia: { nombre: 'Paulownia', absorcion: 40, anios: 8, densidad: 1100 },
  eucalipto: { nombre: 'Eucalipto', absorcion: 35, anios: 10, densidad: 1100 },
  pino: { nombre: 'Pino', absorcion: 30, anios: 15, densidad: 1000 },
  ceibo: { nombre: 'Ceibo (nativo AR)', absorcion: 25, anios: 12, densidad: 400 },
  jacaranda: { nombre: 'Jacarandá', absorcion: 24, anios: 12, densidad: 400 },
  ficus: { nombre: 'Ficus', absorcion: 22, anios: 10, densidad: 400 },
  'mixto-nativo': { nombre: 'Mixto nativo promedio', absorcion: 22, anios: 12, densidad: 400 },
  roble: { nombre: 'Roble', absorcion: 18, anios: 20, densidad: 400 },
  cedro: { nombre: 'Cedro', absorcion: 15, anios: 20, densidad: 400 },
};

/* ------------------------------------------------------------------ *
 * 4. Alimentación
 * CO₂: espejo exacto de `huella-carbono-alimentacion-semanal.ts`
 *      (kg CO₂ por kilo de alimento consumido).
 * Agua: valores de `huella-hidrica-alimentos-litros.ts` (litros por kilo,
 *      Mekonnen & Hoekstra 2011), mapeados a las mismas cuatro categorías:
 *      carne de res = carne vacuna; pollo/pescado = pollo; lácteos = leche;
 *      vegetales = promedio de papa, tomate y lechuga.
 * ------------------------------------------------------------------ */

export const CO2_ALIMENTO: Record<string, number> = {
  carneRes: 27,
  polloPescado: 6,
  lacteos: 3,
  vegetales: 2,
};

export const AGUA_ALIMENTO: Record<string, number> = {
  carneRes: 15400,
  polloPescado: 4325,
  lacteos: 1020,
  vegetales: Math.round((287 + 214 + 237) / 3), // 246 L/kg
};

/** Litros de una ducha promedio, para la equivalencia tangible. */
export const DUCHA_LITROS = 100;

/* ------------------------------------------------------------------ *
 * 5. Residuos y reciclaje
 * Espejo de `reciclaje-ahorro-residuos.ts`, `reciclaje-botellas-ahorro-co2.ts`,
 * `papel-ahorrado-impresion-doble-cara.ts` y `biodegradacion-tiempo-materiales.ts`.
 * ------------------------------------------------------------------ */

export const RESIDUOS = {
  /** kg de residuos por persona y por día. */
  kgPorPersonaDia: 1.15,
  /** Fracción del total que es efectivamente reciclable. */
  fraccionReciclable: 0.4,
  /** kg de CO₂ evitados por cada kg reciclado. */
  co2PorKgReciclado: 2.5,
} as const;

export const BOTELLAS = {
  /** Peso de una botella PET, en gramos. */
  gramosPorBotella: 40,
  /** kg de CO₂ evitados por cada kg de PET reciclado. */
  co2PorKgPet: 2.3,
} as const;

export const PAPEL = {
  /** Hojas A4 que salen de un árbol. */
  hojasPorArbol: 10000,
  /** Ahorro por imprimir a doble faz: la mitad de las hojas. */
  ahorroDobleFaz: 0.5,
  /**
   * kg de CO₂ por hoja A4 de 80 g/m². Constante propia del hub: la fórmula
   * original devuelve árboles, no CO₂, y hacía falta un puente para poner el
   * papel en la misma escala que el resto. Sale del factor de 1,3 kg CO₂ por kg
   * de papel virgen y de los 5 g que pesa una hoja A4.
   */
  co2PorHoja: 0.0065,
} as const;

/** Años que tarda en degradarse cada material. */
export const BIODEGRADACION: Array<{ id: string; nombre: string; anios: number }> = [
  { id: 'organico', nombre: 'Residuo orgánico', anios: 0.4 },
  { id: 'papel', nombre: 'Papel', anios: 0.4 },
  { id: 'carton', nombre: 'Cartón', anios: 1 },
  { id: 'acero', nombre: 'Lata de acero', anios: 100 },
  { id: 'bolsa', nombre: 'Bolsa plástica', anios: 150 },
  { id: 'aluminio', nombre: 'Lata de aluminio', anios: 200 },
  { id: 'pet', nombre: 'Botella PET', anios: 450 },
  { id: 'vidrio', nombre: 'Vidrio', anios: 4000 },
];

export const CASE_MATH: Record<string, { modo: 'personal' | 'vuelo' | 'arboles' | 'comida' | 'basura' }> = {
  personal: { modo: 'personal' },
  vuelo: { modo: 'vuelo' },
  arboles: { modo: 'arboles' },
  comida: { modo: 'comida' },
  basura: { modo: 'basura' },
};

const AVISO_ESTIMACION =
  'Toda huella de carbono es una estimación con factores promedio: dos personas con los mismos hábitos pueden diferir bastante según su país, su matriz eléctrica y su cadena de suministro. Los números de acá sirven para comparar opciones y priorizar cambios, no para declarar emisiones ante nadie.';

export const hub: HubData = {
  slug: 'hogar/huella-de-carbono',
  title: '¿Cuál es mi huella de carbono? Calculadora anual, vuelos, dieta y compensación',
  description:
    'Cuántas toneladas de CO₂ generás por año entre transporte, dieta y energía, cuánto emite un vuelo por pasajero, cuánto pesa la carne en tu alimentación, cuánto evitás reciclando y cuántos árboles harían falta para compensarlo. Factores DEFRA, EWG y Mekonnen & Hoekstra.',
  silo: 'Hogar',
  siloHref: '/hogar',

  eyebrow: 'Emisiones, compensación y residuos',
  h1: '¿Cuál es mi huella de carbono?',
  lede:
    'La huella de carbono se arma con pocos números y casi todos los tenés a mano: cuántos kilómetros hacés por semana, qué comés, cuánta energía usás en tu casa y cuántos vuelos tomás por año. Acá sale tu total anual y, sobre todo, de dónde viene: cuál de esos bloques pesa más y cuánto bajaría si lo cambiás. Después están las dos preguntas que vienen siempre atrás: cuánto evitás separando la basura y cuántos árboles harían falta para compensar lo que queda. Todo sobre la misma escala de kilos de CO₂.',
  stamps: [
    'Huella anual por transporte, dieta y energía',
    'Emisiones de vuelo con factores DEFRA',
    'Agua y CO₂ de tu alimentación',
    '9 calculadoras adentro',
  ],

  resultLabel: 'Tu huella',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Las cinco ramas miden lo mismo —kilos de CO₂— pero entran por puertas distintas. Elegí la tuya: los campos que no usa tu rama no afectan el resultado.',
    items: [
      {
        id: 'personal',
        label: 'Mi huella de carbono anual',
        hint: 'El número grande: cuántas toneladas generás por año en total.',
        yes: [
          'Las emisiones anuales de tu transporte, calculadas sobre los kilómetros que hacés por semana y el medio que usás',
          'Las emisiones anuales atribuidas a tu patrón de alimentación, del carnívoro diario al vegano',
          'Las emisiones del consumo energético de tu casa según tu nivel de uso',
          'La bolsa de emisiones difusas que arrastra cualquier persona por consumo, servicios y bienes',
          'La comparación con la huella per cápita promedio de Argentina, para saber si estás por encima o por debajo',
          'Qué bloque pesa más en tu total, que es donde conviene poner el esfuerzo',
        ],
        warn: [
          AVISO_ESTIMACION,
          'El factor de auto es un promedio de parque automotor: un auto chico y moderno emite bastante menos por kilómetro y una camioneta grande, bastante más.',
          'El factor del auto eléctrico no es cero: depende de cómo se genera la electricidad del país donde cargás. En una matriz con mucho gas o carbón, la ventaja se achica.',
          'Los valores de dieta son promedios de patrón alimentario, no de tu heladera. Si querés el número fino de tu alimentación, usá la rama de comida, que trabaja con los kilos reales por semana.',
          'Los vuelos no están incluidos en este total: se calculan aparte en su propia rama porque un solo vuelo de larga distancia puede pesar más que un año entero de transporte terrestre.',
          'La bolsa de "otros" es fija por diseño. Es la parte más difícil de estimar sin un inventario de consumo y por eso se toma un valor de referencia.',
        ],
        plazo:
          'hacé el cálculo una vez por año, con el mismo criterio, para poder compararte con vos mismo. Cambiar la medición cada vez es la forma más segura de no enterarte de si mejoraste.',
        answer:
          'La huella personal sale de sumar transporte, dieta, energía del hogar y una bolsa de emisiones difusas; el promedio per cápita argentino ronda las 4,7 toneladas de CO₂ al año.',
      },
      {
        id: 'vuelo',
        label: 'Cuánto emite un vuelo',
        hint: 'Tenés la distancia y querés el CO₂ por pasajero.',
        yes: [
          'Los kilos de CO₂ por pasajero de ese vuelo, con los factores de emisión por clase de cabina',
          'La clasificación automática del vuelo en corto, medio o largo radio según la distancia del tramo',
          'El multiplicador de la clase: Business y Primera emiten varias veces más que Económica por el espacio que ocupa cada asiento',
          'El duplicado si contás ida y vuelta, que es donde la mayoría subestima el número',
          'Cuántos árboles habría que plantar para absorber ese CO₂ en un año',
          'Cuánto costaría comprar el crédito de carbono equivalente',
          'La comparación con tu huella anual completa, para dimensionar el peso del vuelo',
        ],
        warn: [
          AVISO_ESTIMACION,
          'Estos factores miden el CO₂ del combustible quemado. El efecto climático real de un vuelo es mayor porque las estelas de condensación y los óxidos de nitrógeno emitidos en altura calientan además: hay metodologías que aplican un multiplicador de entre 1,7 y 3 por ese motivo.',
          'El factor por clase refleja cuánto espacio de cabina ocupa cada pasajero, no cuánto pesa. Un asiento de Business ocupa el lugar de varios de Económica y por eso le toca una porción mayor del combustible.',
          'La distancia que corresponde usar es la del tramo volado, no la que hay en línea recta entre las dos ciudades si el vuelo tiene escala: cada tramo se cuenta por separado.',
          'Compensar no es lo mismo que no emitir. El árbol tarda entre ocho y veinte años en alcanzar su absorción plena, y el CO₂ del vuelo ya está en la atmósfera hoy.',
          'El precio del crédito de carbono varía muchísimo entre estándares y proyectos, y una parte del mercado voluntario tiene proyectos cuestionados. Si vas a compensar, mirá la certificación.',
        ],
        plazo:
          'la decisión que más mueve la aguja es antes de comprar: un vuelo directo emite menos que el mismo trayecto con escala, porque el despegue es la fase que más combustible consume.',
        answer:
          'Un vuelo emite entre 0,115 y 0,156 kg de CO₂ por pasajero y por kilómetro en Económica según el radio, y ese factor se multiplica por tres o por cuatro en Business y Primera.',
      },
      {
        id: 'arboles',
        label: 'Cuántos árboles necesito para compensar',
        hint: 'Sabés cuántas toneladas querés compensar.',
        yes: [
          'Cuántos árboles hacen falta, según la absorción anual de CO₂ de la especie que elijas',
          'Cuántas hectáreas ocupa esa plantación, con la densidad típica de esa especie',
          'Cuántos años tarda en alcanzar la absorción plena, que es el dato que casi nunca se menciona',
          'La diferencia enorme entre una especie de crecimiento rápido y una de crecimiento lento',
          'Qué porcentaje de tu huella anual representa lo que estás compensando',
        ],
        warn: [
          AVISO_ESTIMACION,
          'La absorción por árbol es un promedio anual de un ejemplar ya maduro, en buenas condiciones de suelo y agua. Un árbol recién plantado absorbe una fracción de eso durante sus primeros años.',
          'El cálculo asume que el árbol sobrevive y queda en pie. Si se tala, se quema o muere, el carbono almacenado vuelve a la atmósfera y la compensación se deshace.',
          'Las especies de crecimiento rápido absorben más por año pero fijan carbono en madera menos densa y suelen tener turnos de corta más cortos. Las nativas de crecimiento lento absorben menos por año y lo retienen mucho más tiempo.',
          'Plantar una sola especie en gran escala no es un bosque: una plantación monoespecífica no aporta el servicio ecológico de un ecosistema nativo, aunque el número de CO₂ cierre.',
          'Reducir emisiones siempre es preferible a compensarlas. La compensación es lo que se hace con lo que no se pudo evitar, no un permiso para emitir igual.',
        ],
        plazo:
          'si el objetivo es compensar un año calendario, la plantación tiene que estar hecha con años de anticipación para que los árboles ya estén absorbiendo a ritmo pleno cuando emitas.',
        answer:
          'Un árbol nativo maduro absorbe alrededor de 22 kg de CO₂ al año, así que compensar una tonelada requiere unos 45 árboles maduros y entre ocho y veinte años de espera hasta que lo estén.',
      },
      {
        id: 'comida',
        label: 'Cuánto pesan el CO₂ y el agua de lo que como',
        hint: 'Cargás los kilos que consumís por semana de cada grupo.',
        yes: [
          'Los kilos de CO₂ por semana y por año de tu alimentación, discriminados por grupo de alimento',
          'Qué porcentaje del total explica la carne de res, que casi siempre es el bloque dominante',
          'La huella hídrica de esa misma dieta: cuántos litros de agua hay detrás de lo que comés en un año',
          'La equivalencia en duchas, para dimensionar el agua invisible de la comida',
          'Cuánto bajaría tu huella si movieras kilos de un grupo a otro',
        ],
        warn: [
          AVISO_ESTIMACION,
          'Los factores por grupo son promedios globales de producción. La carne de pastura del Río de la Plata y la de feedlot intensivo tienen huellas muy distintas y acá cuentan igual.',
          'La huella hídrica suma agua de lluvia, agua de riego y agua contaminada en el proceso. No es agua que salga de una canilla ni agua que puedas ahorrar duchándote menos: es un indicador de presión sobre el recurso, no una factura.',
          'El pescado está agrupado con el pollo por simplicidad, pero su huella varía enormemente entre la acuicultura, la pesca costera y la pesca de arrastre de altura.',
          'El desperdicio no está contado. Entre un cuarto y un tercio de la comida producida se tira, y esa huella también es real.',
          'Comer menos carne baja la huella, pero una dieta desbalanceada tiene su propio costo. Si vas a hacer un cambio grande, hacelo con criterio nutricional.',
        ],
        plazo:
          'la palanca más grande de toda la alimentación es la carne de res: bajar de siete a tres porciones semanales mueve más el número que cualquier otro cambio que puedas hacer en la heladera.',
        answer:
          'La carne de res emite unos 27 kg de CO₂ por kilo y necesita 15.400 litros de agua por kilo, entre cuatro y diez veces más que cualquier otro grupo de alimento.',
      },
      {
        id: 'basura',
        label: 'Cuánto evito reciclando y qué pasa con lo que tiro',
        hint: 'Cargás cuánta gente vive en tu casa y cuánto separás.',
        yes: [
          'Cuántos kilos de residuos genera tu hogar por mes y cuántos son efectivamente reciclables',
          'Cuánto reciclás realmente según el porcentaje que separás, y cuánto se va al relleno sanitario',
          'Los kilos de CO₂ que evitás por año con esa separación',
          'El aporte de las botellas PET y de imprimir a doble faz, por separado',
          'Cuánto más podrías evitar si separaras todo lo reciclable, que es el margen que te queda',
          'Cuántos años tarda en degradarse cada material que mandás al relleno',
        ],
        warn: [
          AVISO_ESTIMACION,
          'El ahorro por kilo reciclado es un promedio de la mezcla habitual de materiales. El aluminio ahorra muchísimo más por kilo que el vidrio o el papel, así que la composición real de tu bolsa cambia bastante el número.',
          'Separar en origen no garantiza que se recicle: depende de que exista recolección diferenciada en tu zona y de que el material llegue limpio a la planta. Un envase con restos de comida contamina el lote.',
          'Los tiempos de degradación son estimaciones de referencia sobre residuos expuestos al ambiente. Dentro de un relleno sanitario compactado, sin oxígeno ni luz, casi todo tarda mucho más, incluso el papel.',
          'El vidrio no se degrada en ningún plazo humano, pero es reciclable infinitas veces sin perder calidad: es el material donde separar rinde más a largo plazo.',
          'Reducir el residuo antes de generarlo siempre gana. Una botella que no comprás no necesita reciclarse ni degradarse.',
        ],
        plazo:
          'la mejora más rápida no es reciclar mejor sino separar más: pasar del 20 % al 60 % de separación multiplica por tres el CO₂ evitado sin cambiar ningún hábito de consumo.',
        answer:
          'Una persona genera alrededor de 1,15 kg de residuos por día, de los cuales cerca del 40 % es reciclable, y cada kilo reciclado evita en promedio 2,5 kg de CO₂.',
      },
    ],
  },

  inputsTitle: 'Contame tus números',
  inputsIntro:
    'Los primeros cuatro campos arman tu huella anual. Después vienen los del vuelo, los de la compensación con árboles, los kilos semanales de tu dieta y, al final, los de tu basura. Los que no usa tu rama no afectan el resultado.',
  fields: [
    {
      id: 'transporte',
      label: 'Cómo te movés habitualmente',
      type: 'select',
      value: 'auto',
      options: [
        { value: 'auto', label: 'Auto a combustión' },
        { value: 'electrico', label: 'Auto eléctrico' },
        { value: 'transporte-publico', label: 'Transporte público' },
        { value: 'bicicleta', label: 'Bicicleta o a pie' },
      ],
    },
    {
      id: 'kmSemanales',
      label: 'Kilómetros que hacés por semana',
      type: 'number',
      suffix: 'km',
      min: 0,
      max: 3000,
      step: 10,
      value: 150,
    },
    {
      id: 'dieta',
      label: 'Tu patrón de alimentación',
      type: 'select',
      value: 'mixta',
      options: [
        { value: 'carne-diaria', label: 'Carne todos los días' },
        { value: 'mixta', label: 'Mixta' },
        { value: 'vegetariana', label: 'Vegetariana' },
        { value: 'vegana', label: 'Vegana' },
      ],
    },
    {
      id: 'energia',
      label: 'Consumo energético del hogar',
      type: 'select',
      value: 'media',
      options: [
        { value: 'baja', label: 'Bajo' },
        { value: 'media', label: 'Medio' },
        { value: 'alta', label: 'Alto, con climatización todo el año' },
      ],
    },
    {
      id: 'distanciaKm',
      label: 'Distancia del vuelo, sólo ida',
      type: 'number',
      suffix: 'km',
      min: 0,
      max: 20000,
      step: 100,
      value: 9200,
      help: 'Distancia del tramo. Si el vuelo tiene escala, contá cada tramo por separado.',
    },
    {
      id: 'claseVuelo',
      label: 'Clase en la que volás',
      type: 'select',
      value: 'economica',
      options: [
        { value: 'economica', label: 'Económica' },
        { value: 'premiumeconomy', label: 'Premium Economy' },
        { value: 'business', label: 'Business' },
        { value: 'first', label: 'Primera' },
      ],
    },
    {
      id: 'idaVuelta',
      label: '¿Contás ida y vuelta?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, ida y vuelta' },
        { value: 'no', label: 'No, sólo ida' },
      ],
    },
    {
      id: 'toneladasCO2',
      label: 'Toneladas de CO₂ que querés compensar',
      type: 'number',
      suffix: 't',
      min: 0,
      max: 500,
      step: 0.1,
      value: 4.7,
      help: 'Podés poner el total anual que te dio en la primera rama.',
    },
    {
      id: 'especie',
      label: 'Especie a plantar',
      type: 'select',
      value: 'mixto-nativo',
      options: [
        { value: 'paulownia', label: 'Paulownia — crecimiento muy rápido' },
        { value: 'eucalipto', label: 'Eucalipto' },
        { value: 'pino', label: 'Pino' },
        { value: 'ceibo', label: 'Ceibo, nativo argentino' },
        { value: 'jacaranda', label: 'Jacarandá' },
        { value: 'ficus', label: 'Ficus' },
        { value: 'mixto-nativo', label: 'Mixto nativo promedio' },
        { value: 'roble', label: 'Roble — crecimiento lento' },
        { value: 'cedro', label: 'Cedro — crecimiento lento' },
      ],
    },
    {
      id: 'carneRes',
      label: 'Carne de res por semana',
      type: 'number',
      suffix: 'kg',
      min: 0,
      max: 20,
      step: 0.1,
      value: 0.5,
    },
    {
      id: 'polloPescado',
      label: 'Pollo y pescado por semana',
      type: 'number',
      suffix: 'kg',
      min: 0,
      max: 20,
      step: 0.1,
      value: 0.8,
    },
    {
      id: 'lacteos',
      label: 'Lácteos por semana',
      type: 'number',
      suffix: 'kg',
      min: 0,
      max: 30,
      step: 0.1,
      value: 2,
    },
    {
      id: 'vegetales',
      label: 'Vegetales y frutas por semana',
      type: 'number',
      suffix: 'kg',
      min: 0,
      max: 40,
      step: 0.1,
      value: 4,
    },
    {
      id: 'personas',
      label: 'Personas en tu casa',
      type: 'number',
      min: 1,
      max: 15,
      step: 1,
      value: 3,
    },
    {
      id: 'porcentajeSeparacion',
      label: 'Porcentaje de residuos que separás',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 5,
      value: 30,
    },
    {
      id: 'botellas',
      label: 'Botellas PET que reciclás por semana',
      type: 'number',
      min: 0,
      max: 200,
      step: 1,
      value: 20,
    },
    {
      id: 'hojasSem',
      label: 'Hojas que imprimís por semana',
      type: 'number',
      min: 0,
      max: 2000,
      step: 10,
      value: 50,
      help: 'Se calcula el ahorro de pasar a doble faz.',
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Los factores de emisión de vuelo son de DEFRA y miden el CO₂ del combustible quemado, sin el multiplicador por efectos en altura; los de alimentos vienen de la literatura de análisis de ciclo de vida; los de huella hídrica, del estudio de Mekonnen y Hoekstra. Toda huella de carbono es una estimación con factores promedio y no sirve como declaración formal de emisiones.',

  chart: {
    type: 'scale',
    title: 'Tus kilos de CO₂ sobre la escala',
    caption:
      'La barra siempre mide kilos de CO₂, cualquiera sea la rama. En la huella anual, las franjas son los cuatro bloques que la componen —transporte, dieta, energía y difusas— y el marcador es tu total. En el vuelo, las franjas comparan la emisión del vuelo contra un año entero de huella promedio. En árboles, contra la parte de tu huella que llegás a compensar. En comida, contra el rango de una dieta baja, media y alta. En basura, la barra parte el potencial reciclable entre lo que evitás y lo que se te escapa.',
  },
  breakdownTitle: 'La cuenta, kilo por kilo',
  breakdownIntro:
    'De dónde sale cada número: el factor de emisión aplicado, la cantidad que cargaste y el resultado de cada bloque por separado.',

  faq: [
    {
      q: '¿Cuál es la huella de carbono promedio de una persona?',
      a: 'En Argentina la huella per cápita ronda las 4,7 toneladas de CO₂ al año, cerca del promedio mundial, que está en torno a las 4,7 toneladas. La diferencia entre países es enorme: Estados Unidos supera las 14 y buena parte de África subsahariana no llega a una. Dentro de un mismo país la diferencia entre personas también es grande, y la explican sobre todo el transporte, los vuelos y la dieta.',
    },
    {
      q: '¿Cómo se calcula la huella de carbono personal?',
      a: 'Se multiplica cada actividad por su factor de emisión y se suma todo. En transporte, kilómetros por el factor del medio que usás; en alimentación, kilos de cada grupo por su factor; en energía, consumo del hogar por el factor de la matriz eléctrica. A eso se le agrega una bolsa de emisiones difusas por consumo de bienes y servicios, que es la parte más difícil de estimar y por eso se toma un valor de referencia.',
    },
    {
      q: '¿Cuánto CO₂ emite un vuelo?',
      a: 'En Económica, entre 0,115 y 0,156 kg de CO₂ por pasajero y por kilómetro según sea vuelo largo, medio o corto: los vuelos cortos emiten más por kilómetro porque el despegue es la fase que más combustible consume y pesa mucho en un tramo breve. Un Buenos Aires-Madrid de unos 10.000 km ida y vuelta da alrededor de 2,3 toneladas por pasajero en Económica, casi la mitad de una huella anual promedio.',
    },
    {
      q: '¿Por qué volar en Business emite más que en Económica?',
      a: 'Porque el factor de emisión se reparte por el espacio de cabina que ocupa cada pasajero. Un asiento de Business ocupa el lugar de tres o cuatro de Económica, así que le corresponde tres o cuatro veces más del combustible que quema ese avión. No tiene que ver con lo que pesa el pasajero: tiene que ver con cuánta gente entra en el mismo fuselaje.',
    },
    {
      q: '¿Cuántos árboles hacen falta para compensar una tonelada de CO₂?',
      a: 'Con una especie nativa promedio, que absorbe alrededor de 22 kg de CO₂ al año, hacen falta unos 46 árboles maduros para absorber una tonelada en un año. Con una especie de crecimiento rápido como la paulownia, que absorbe unos 40 kg, alcanzan 25. El dato que casi nunca se menciona es el tiempo: esos árboles tardan entre ocho y veinte años en llegar a absorber a ritmo pleno.',
    },
    {
      q: '¿Compensar con árboles anula realmente mis emisiones?',
      a: 'No de forma inmediata ni garantizada. El CO₂ que emitiste ya está en la atmósfera hoy y el árbol lo va a absorber a lo largo de décadas, siempre que sobreviva y quede en pie: si se tala o se quema, el carbono vuelve. Por eso la compensación se considera el último paso, para lo que no se pudo evitar, y no un sustituto de reducir emisiones.',
    },
    {
      q: '¿Qué alimento tiene la huella de carbono más alta?',
      a: 'La carne de res, lejos: alrededor de 27 kg de CO₂ por kilo de producto, contra 6 del pollo o el pescado, 3 de los lácteos y 2 de vegetales y frutas. La razón es doble: el rumiante emite metano en la digestión y hace falta mucha superficie y mucho alimento para producir cada kilo. Por eso mover unos pocos kilos semanales de res a otro grupo mueve más el total que cualquier otro cambio.',
    },
    {
      q: '¿Qué es la huella hídrica de un alimento?',
      a: 'Son los litros de agua que se usaron en toda la cadena para producir un kilo de ese alimento, sumando el agua de lluvia que consumió el cultivo, el agua de riego y el agua que hizo falta para diluir la contaminación del proceso. Un kilo de carne vacuna arrastra unos 15.400 litros, uno de pollo 4.325 y uno de papa 287. No es agua de canilla ni agua que puedas ahorrar en tu casa: es un indicador de presión sobre el recurso.',
    },
    {
      q: '¿Cuánto CO₂ evito reciclando?',
      a: 'En promedio, unos 2,5 kg de CO₂ por cada kilo de residuo reciclado, porque producir con material recuperado gasta mucha menos energía que producir con material virgen. Una casa de tres personas genera alrededor de 103 kg de residuos por mes, de los cuales unos 41 son reciclables: separando el 60 % se evitan cerca de 62 kg de CO₂ por mes, unos 740 al año.',
    },
    {
      q: '¿Cuánto tarda en degradarse cada material?',
      a: 'Como referencia sobre residuos expuestos al ambiente: los orgánicos y el papel, unos cinco meses; el cartón, un año; una lata de acero, cerca de un siglo; una bolsa plástica, unos 150 años; una lata de aluminio, unos 200; una botella PET, alrededor de 450; y el vidrio, miles de años. Dentro de un relleno compactado, sin oxígeno ni luz, todos esos plazos se estiran bastante más.',
    },
    {
      q: '¿Sirve de algo imprimir a doble faz?',
      a: 'Sirve, aunque es una palanca chica. Imprimir a doble faz corta el consumo de papel casi a la mitad: 50 hojas por semana pasan a 25, lo que ahorra 1.300 hojas al año, alrededor de 0,13 árboles y unos 8 kg de CO₂. No es lo que va a cambiar tu huella, pero es de los cambios que no cuestan nada y se sostienen solos.',
    },
    {
      q: '¿Qué cambio baja más mi huella de carbono?',
      a: 'Ordenados por impacto típico: dejar de tomar un vuelo de larga distancia al año, cambiar el auto por transporte público o bicicleta en los trayectos habituales, y bajar el consumo de carne de res. Los tres mueven toneladas. Reciclar, imprimir a doble faz o cambiar las lamparitas mueven decenas de kilos: valen la pena, pero no reemplazan a los tres primeros.',
    },
  ],

  sources: [
    {
      name: 'Greenhouse gas reporting: conversion factors — factores de emisión de aviación por clase y radio',
      url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
      publisher: 'DEFRA / DESNZ — Reino Unido',
    },
    {
      name: 'Guidelines for National Greenhouse Gas Inventories — metodología de factores de emisión',
      url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
      publisher: 'IPCC — Panel Intergubernamental sobre Cambio Climático',
    },
    {
      name: 'ICAO Carbon Emissions Calculator Methodology — emisiones de aviación por pasajero',
      url: 'https://www.icao.int/environmental-protection/CarbonOffset/Pages/default.aspx',
      publisher: 'OACI — Organización de Aviación Civil Internacional',
    },
    {
      name: 'Reducing food’s environmental impacts through producers and consumers — huella de carbono por alimento',
      url: 'https://www.science.org/doi/10.1126/science.aaq0216',
      publisher: 'Poore & Nemecek, Science (2018)',
    },
    {
      name: 'The green, blue and grey water footprint of crops and animal products — litros de agua por kilo',
      url: 'https://www.waterfootprint.org/resources/Report47-WaterFootprintCrops-Vol1.pdf',
      publisher: 'Mekonnen & Hoekstra, UNESCO-IHE (2011)',
    },
    {
      name: 'Inventario Nacional de Gases de Efecto Invernadero de la República Argentina',
      url: 'https://www.argentina.gob.ar/ambiente/cambio-climatico/inventario-nacional',
      publisher: 'Ministerio de Ambiente — Argentina',
    },
    {
      name: 'Documentación de gestión integral de residuos sólidos urbanos y tasas de generación',
      url: 'https://www.argentina.gob.ar/ambiente/control/residuos-urbanos',
      publisher: 'Ministerio de Ambiente — Argentina',
    },
    {
      name: 'CO2 emissions per capita — serie por país',
      url: 'https://ourworldindata.org/co2-emissions',
      publisher: 'Our World in Data / Global Carbon Project',
    },
  ],

  replaces: [
    '/calculadora-arboles-compensar-co2-huella',
    '/calculadora-biodegradacion-tiempo-materiales',
    '/calculadora-huella-hidrica-alimentos-litros',
    '/calculadora-vuelo-emisiones-co2-pasajero',
    '/calculadora-huella-carbono-personal',
    '/calculadora-reciclaje-botellas-ahorro-co2',
    '/calculadora-reciclaje-ahorro-residuos',
    '/calculadora-papel-ahorrado-impresion-doble-cara',
    '/calculadora-huella-carbono-alimentacion-semanal',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
