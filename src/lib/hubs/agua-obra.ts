import type { HubData } from './types';

export const hub: HubData = {
  slug: 'construccion/agua',
  title: 'Tanque, cañerías y termotanque: ¿qué capacidad necesito?',
  description:
    'Cuántos litros de tanque y de cisterna te hacen falta, qué termotanque o calefón comprar, qué diámetro de cañería, qué potencia de bomba y cuánto acero lleva la estructura de soporte. Siete cuentas de instalación de agua en una sola página.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Instalación de agua',
  h1: 'Tanque, cañerías y termotanque: ¿qué capacidad necesito?',
  lede:
    'Partimos de lo primero que se decide en una obra: cuántos litros de tanque de reserva. Ya podés ver una estimación y ajustarla con tus datos. Si lo que estás dimensionando es otra parte de la instalación —cisterna, agua caliente, cañería, bomba o la estructura que sostiene el tanque— la cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Criterio ENARGAS · IRAM 13478 · 200 L por persona y día', '7 calculadoras adentro'],

  resultLabel: 'Capacidad estimada',

  cases: {
    title: '¿Qué parte de la instalación estás dimensionando?',
    intro: 'Partimos por el tanque de reserva, que es lo que más se busca. Si tu caso es otro, cambialo.',
    items: [
      {
        id: 'tanque',
        label: 'El tanque de reserva',
        hint: 'Litros por persona',
        answer: 'La regla es 200 litros por persona y por día de reserva.',
        yes: [
          'Consumo de referencia: 200 litros por persona y por día (uso residencial completo)',
          'Multiplicado por los días de reserva que quieras aguantar sin suministro',
          'Redondeado al tamaño comercial inmediato superior: 500, 750, 1.000, 1.100, 1.500, 2.000, 2.500, 3.000 o 5.000 litros',
        ],
        warn: [
          'La OMS habla de 150 L por persona y día para consumo básico; acá usamos 200 porque incluye ducha, cocina, inodoro y limpieza',
          'Un tanque sobredimensionado deja el agua estancada demasiado tiempo. Si vas a poner más del doble de lo que consumís, conviene partirlo en dos tanques conectados',
        ],
        plazo: 'el tanque de reserva se calcula antes de cerrar la losa: cambiarlo después implica romper.',
      },
      {
        id: 'cisterna',
        label: 'La cisterna de abajo',
        hint: 'Volumen y medidas del pozo',
        answer: 'La cisterna se dimensiona por días de autonomía, igual que el tanque.',
        yes: [
          'Mismos 200 litros por persona y día, por los días que quieras aguantar',
          'La cisterna nunca se llena al ras: se aprovecha alrededor del 90% del volumen geométrico',
          'Con la profundidad típica de 1,50 m te devolvemos el lado del pozo cuadrado que hace falta',
        ],
        warn: [
          'Los 200 L por persona y día son consumo residencial promedio: si tenés pileta, riego o lavarropas de alto consumo, subí los días de reserva',
          'El volumen que se cotiza en la obra es el geométrico, no el útil: pedí siempre el número más grande de los dos',
        ],
        plazo: 'la cisterna se excava y se impermeabiliza antes del contrapiso.',
      },
      {
        id: 'termotanque',
        label: 'El agua caliente',
        hint: 'Termotanque o calefón',
        answer: 'El agua caliente se dimensiona por demanda pico, no por consumo diario.',
        yes: [
          'Litros de agua caliente por persona y día según el uso: 22 (bajo), 30 (normal) o 42 (alto)',
          'Un coeficiente de simultaneidad, porque no todos se duchan al mismo tiempo: 100% hasta 2 personas, 85% hasta 4, 75% hasta 6 y 65% de ahí en adelante',
          'Redondeo al tamaño comercial: 50, 80, 120, 150, 180 o 200 litros',
        ],
        warn: [
          'Un calefón instantáneo de 14 L/min no abastece dos duchas a la vez: para eso hace falta uno de 22 L/min o más, o directamente un termotanque de acumulación',
          'Los litros son de agua caliente pura a 60 °C, no de agua ya mezclada en la ducha',
        ],
        plazo: 'la instalación de gas la firma un gasista matriculado: sin esa firma no hay habilitación.',
      },
      {
        id: 'caneria',
        label: 'El diámetro de la cañería',
        hint: 'Por caudal a 1,5 m/s',
        answer: 'El diámetro sale del caudal, y el caudal de los puntos sanitarios.',
        yes: [
          'Cada punto sanitario (canilla, ducha, inodoro, pileta) mueve en promedio 0,13 litros por segundo',
          'La sección se calcula para una velocidad de 1,5 m/s, el valor que evita ruido y golpe de ariete',
          'Si hay 2 pisos o más subimos un diámetro comercial para sostener la presión en altura, y otro más a partir de 4 pisos',
        ],
        warn: [
          'Las bajadas a cada artefacto van siempre en 13 mm (½"): el diámetro que calculamos acá es el de la cañería principal',
          'Los milímetros del catálogo de PPR y PVC son diámetro exterior; el interior real es algo menor, así que conviene no elegir el tamaño justo',
        ],
        plazo: 'el diámetro se define antes de la canalización de los muros.',
      },
      {
        id: 'bomba',
        label: 'La bomba elevadora',
        hint: 'Watts y HP',
        answer: 'La potencia depende del caudal, de la altura y del rendimiento de la bomba.',
        yes: [
          'Potencia hidráulica = caudal × densidad del agua × gravedad × altura de elevación',
          'Dividida por el rendimiento real de la bomba, que en equipos domiciliarios ronda el 60%',
          'Dimensionamos para que la bomba llene el tanque de reserva en una hora',
        ],
        warn: [
          'La altura que importa es la geométrica más las pérdidas de carga en cañerías y codos: por eso siempre se compra el escalón comercial de HP siguiente',
          'Una bomba muy sobredimensionada arranca y para todo el tiempo y se quema antes: mejor un tanque de reserva grande que una bomba grande',
        ],
        plazo: 'la bomba se elige después de fijar el tanque, no antes.',
      },
      {
        id: 'estructura',
        label: 'La estructura que sostiene el tanque',
        hint: 'Caño estructural, kg de acero',
        answer: 'El tanque lleno pesa casi lo mismo en kilos que en litros.',
        yes: [
          'Peso por metro lineal del perfil de caño estructural, con densidad del acero de 7.850 kg/m³',
          'Multiplicado por los metros de perfil que lleva la torre o base de apoyo',
          'Comparado contra el peso del agua del tanque lleno, que es la carga real que va a la losa',
        ],
        warn: [
          'Esto te da los kilos de acero para cotizar y calcular el flete: NO es un cálculo estructural. La verificación de la estructura la firma un profesional matriculado',
          'Un tanque de 1.100 litros lleno pesa más de una tonelada: la losa tiene que estar preparada para esa carga puntual',
        ],
        plazo: 'el acero se cotiza por kilo, así que el peso es lo que define el precio.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada caso usa los campos que le sirven y deja el resto quieto. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'personas', label: 'Personas que viven en la casa', type: 'number', min: 1, max: 60, value: 4 },
    { id: 'reserva', label: 'Días de reserva que querés aguantar', type: 'number', min: 1, max: 15, value: 1 },
    {
      id: 'uso',
      label: 'Uso de agua caliente',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'bajo', label: 'Bajo — duchas cortas, sin bañera (22 L por persona)' },
        { value: 'normal', label: 'Normal — ducha de 10 minutos (30 L por persona)' },
        { value: 'alto', label: 'Alto — duchas largas, bañera o lavarropas con agua caliente (42 L por persona)' },
      ],
    },
    {
      id: 'equipo',
      label: 'Equipo de agua caliente',
      type: 'select',
      value: 'termotanque',
      options: [
        { value: 'termotanque', label: 'Termotanque de acumulación' },
        { value: 'calefon', label: 'Calefón instantáneo' },
      ],
    },
    {
      id: 'puntos',
      label: 'Puntos sanitarios (canillas, duchas, inodoros, piletas)',
      type: 'number',
      min: 1,
      max: 200,
      value: 8,
    },
    { id: 'pisos', label: 'Pisos que alimenta la cañería', type: 'number', min: 1, max: 20, value: 1 },
    { id: 'altura', label: 'Altura de elevación de la bomba', type: 'number', min: 1, max: 120, value: 9, suffix: 'm' },
    {
      id: 'perfil',
      label: 'Perfil de caño estructural de la base o torre',
      type: 'select',
      value: 'c50',
      options: [
        { value: 'c40', label: 'Cuadrado 40 × 40 mm, pared 2 mm' },
        { value: 'c50', label: 'Cuadrado 50 × 50 mm, pared 2 mm' },
        { value: 'c60', label: 'Cuadrado 60 × 60 mm, pared 2 mm' },
        { value: 'c80', label: 'Cuadrado 80 × 80 mm, pared 3 mm' },
        { value: 'r50', label: 'Rectangular 50 × 30 mm, pared 2 mm' },
        { value: 'd60', label: 'Redondo Ø 60,3 mm (2"), pared 2 mm' },
      ],
    },
    { id: 'metros', label: 'Metros de perfil que lleva la estructura', type: 'number', min: 1, max: 500, value: 24 },
  ],
  fineprint:
    'Es un predimensionado orientativo para cotizar y comprar. La instalación de gas la firma un gasista matriculado y la estructura de soporte la verifica un profesional: nada de esto reemplaza esa firma.',

  chart: {
    type: 'donut',
    title: 'Cómo se compone el número',
    caption:
      'El gráfico parte el resultado en las dos o tres piezas que lo explican: cuánto es consumo real y cuánto es margen, cuánto trabajo útil hace la bomba y cuánto se pierde, o cuánto pesa el agua contra cuánto pesa el acero.',
  },
  breakdownTitle: 'De dónde sale la cuenta',
  breakdownIntro: 'Las barras comparan cada renglón con el valor más grande del cálculo.',

  faq: [
    {
      q: '¿Cuántos litros de tanque necesito para 4 personas?',
      a: 'Con el criterio de 200 litros por persona y por día, cuatro personas consumen 800 litros diarios. El tanque comercial inmediato es el de 1.000 litros, y el de 1.100 —que es el tamaño más vendido en Argentina— te deja un día completo de reserva con margen. Si querés dos días de autonomía necesitás 1.600 litros, o sea un tanque de 2.000.',
    },
    {
      q: '¿Por qué se usan 200 litros por persona y no los 150 de la OMS?',
      a: 'Los 150 litros de la OMS son el consumo básico de higiene y bebida. Los 200 que usamos acá contemplan el uso residencial completo: ducha, cocina, inodoro, lavado de ropa y limpieza. Es el número que manejan los instaladores argentinos para dimensionar y el que evita quedarse corto en verano.',
    },
    {
      q: '¿Qué diferencia hay entre el tanque de reserva y la cisterna?',
      a: 'La cisterna va abajo, generalmente enterrada, y recibe el agua de la red aunque la presión sea baja. El tanque de reserva va arriba y es el que le da presión a los artefactos por gravedad. La bomba conecta uno con el otro. Si tenés los dos, lo habitual es que la cisterna tenga entre dos y tres veces la capacidad del tanque.',
    },
    {
      q: '¿Por qué la cisterna no se aprovecha al 100%?',
      a: 'Porque hay que dejar el pelo de agua por debajo del borde para que no rebalse y porque el fondo tiene un colchón que la bomba no succiona, además del sedimento. Se cuenta un llenado útil del 90% del volumen geométrico. Por eso, si necesitás 1.600 litros útiles, tenés que excavar por unos 1.780 litros de volumen.',
    },
    {
      q: '¿De cuántos litros tiene que ser el termotanque?',
      a: 'No se dimensiona por consumo diario sino por demanda pico. Con uso normal se cuentan 30 litros de agua caliente por persona y día, y sobre eso se aplica un coeficiente de simultaneidad porque no todos usan agua caliente en el mismo momento: 100% hasta dos personas, 85% hasta cuatro, 75% hasta seis y 65% de ahí en adelante. Una familia tipo de cuatro personas con uso normal se resuelve con un termotanque de 120 litros.',
    },
    {
      q: '¿Me conviene calefón o termotanque?',
      a: 'El calefón instantáneo no acumula, así que no tiene pérdida por mantenimiento de temperatura y ocupa menos, pero está limitado por su caudal: uno de 14 L/min sirve para una ducha por vez. Si en tu casa se abren dos duchas simultáneas, o necesitás agua caliente inmediata en varios puntos, el termotanque de acumulación es más confiable. En familias de cinco o más, lo habitual es termotanque.',
    },
    {
      q: '¿Qué diámetro de cañería necesito?',
      a: 'El diámetro se calcula desde el caudal, no desde la cantidad de baños. Cada punto sanitario mueve en promedio 0,13 litros por segundo, y la sección se dimensiona para que el agua circule a 1,5 metros por segundo, que es la velocidad que no hace ruido ni golpe de ariete. Ocho puntos sanitarios dan poco más de un litro por segundo, que a esa velocidad pide unos 30 mm de diámetro interno.',
    },
    {
      q: '¿Por qué hay que subir el diámetro si la casa tiene varios pisos?',
      a: 'Porque la presión disponible cae con la altura y las pérdidas de carga se acumulan a lo largo del recorrido. Subir un diámetro comercial baja la velocidad real del agua y con eso baja la pérdida de carga, que crece más o menos con el cuadrado de la velocidad. Por eso sumamos un escalón a partir de dos pisos y otro a partir de cuatro.',
    },
    {
      q: '¿Qué potencia de bomba necesito para subir el agua al tanque?',
      a: 'La potencia hidráulica útil es el caudal por la densidad del agua, por la gravedad y por la altura de elevación. A eso hay que dividirlo por el rendimiento real de la bomba, que en equipos domiciliarios ronda el 60%: casi la mitad de lo que consume el motor se va en pérdidas. Para una casa que llena un tanque de 1.100 litros en una hora a 9 metros de altura, alcanza y sobra con media HP.',
    },
    {
      q: '¿Por qué se compra siempre la bomba del escalón siguiente?',
      a: 'Porque el cálculo teórico contempla la altura geométrica pero no las pérdidas por fricción en cañerías, codos, válvulas y filtros, que en una instalación real pueden sumar varios metros equivalentes. Redondear al HP comercial superior es el margen que absorbe eso. Lo que no conviene es pasarse de largo: una bomba muy grande arranca y para todo el tiempo y se desgasta antes.',
    },
    {
      q: '¿Cuánto pesa un tanque de agua lleno?',
      a: 'Un litro de agua pesa un kilo, así que un tanque de 1.100 litros lleno pesa 1.100 kilos de agua más el peso del propio tanque y de la estructura de soporte. Esa carga es puntual y va concentrada en los apoyos, no repartida: es exactamente el motivo por el que la base de un tanque nunca se improvisa.',
    },
    {
      q: '¿Cuánto pesa un caño estructural por metro?',
      a: 'Se calcula con el perímetro de la sección, el espesor de la pared y la densidad del acero, que es 7.850 kg/m³. Un caño cuadrado de 40 × 40 mm con pared de 2 mm pesa alrededor de 2,39 kg por metro; uno de 50 × 50 × 2 mm pesa 3,01 kg/m. Como el acero se cotiza por kilo, el peso total es directamente lo que vas a pagar.',
    },
  ],

  sources: [
    {
      name: 'Norma IRAM 13478 — Tanques de agua de polietileno para uso domiciliario',
      url: 'https://catalogo.iram.org.ar/',
      publisher: 'IRAM',
    },
    {
      name: 'Modos eficientes y económicos de producir agua caliente en viviendas',
      url: 'https://www.enargas.gob.ar/secciones/eficiencia-energetica/eficiencia-energetica.php',
      publisher: 'ENARGAS',
    },
    {
      name: 'Sizing a New Water Heater — criterio de demanda en hora pico',
      url: 'https://www.energy.gov/energysaver/sizing-new-water-heater',
      publisher: 'U.S. Department of Energy · Energy Saver',
    },
    {
      name: 'Domestic water quantity, service level and health — consumo por persona y día',
      url: 'https://www.who.int/publications/i/item/9789240015241',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'Tablas de caños estructurales — peso por metro lineal y espesores',
      url: 'https://www.tenaris.com/es-ar/productos/',
      publisher: 'Tenaris / Siderca',
    },
  ],

  replaces: [
    '/calculadora-tanque-agua-litros-personas',
    '/calculadora-calefon-termotanque-litros-personas',
    '/calculadora-capacidad-tanque-cisterna-litros',
    '/calculadora-bombeo-cisterna-tanque-watts',
    '/calculadora-diametro-caneria-agua-caudal',
    '/calculadora-cano-estructural-peso-ml',
    '/calculadora-cano-agua-diametro-caudal',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-lluvia-captacion-techo-m3-anual',
    '/calculadora-recoleccion-agua-lluvia-techo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Litros de agua fría por persona y día (uso residencial completo). */
export const LITROS_PERSONA_DIA = 200;

/** Tamaños comerciales de tanque de reserva en Argentina (litros). */
export const TANQUES_COMERCIALES = [500, 750, 1000, 1100, 1500, 2000, 2500, 3000, 5000];

/** Llenado útil de una cisterna sobre el volumen geométrico. */
export const LLENADO_UTIL_CISTERNA = 0.9;

/** Profundidad típica de excavación de una cisterna domiciliaria (m). */
export const PROFUNDIDAD_CISTERNA_M = 1.5;

/** Litros de agua caliente a 60 °C por persona y día, según nivel de uso (ENARGAS / DOE). */
export const LITROS_ACS_POR_USO: Record<string, number> = { bajo: 22, normal: 30, alto: 42 };

/** Tamaños comerciales de termotanque de acumulación (litros). */
export const TERMOTANQUES_COMERCIALES = [50, 80, 120, 150, 180, 200];

/** Caudal medio que aporta un punto sanitario (L/s). */
export const CAUDAL_POR_PUNTO_LS = 0.13;

/** Velocidad de diseño del agua en la cañería principal (m/s). */
export const VELOCIDAD_DISENO_MS = 1.5;

/** Diámetros comerciales de cañería de agua (mm). */
export const CANOS_COMERCIALES_MM = [13, 20, 25, 32, 40, 50, 63, 75, 90, 110];

/** Rendimiento típico de una bomba centrífuga domiciliaria. */
export const RENDIMIENTO_BOMBA = 0.6;

/** Densidad del acero (kg/m³). */
export const DENSIDAD_ACERO = 7850;

/** Perfiles de caño estructural: forma, lados en mm y espesor de pared en mm. */
export const PERFILES: Record<string, { label: string; forma: 'rect' | 'redondo'; a: number; b: number; e: number }> = {
  c40: { label: 'Cuadrado 40 × 40 × 2 mm', forma: 'rect', a: 40, b: 40, e: 2 },
  c50: { label: 'Cuadrado 50 × 50 × 2 mm', forma: 'rect', a: 50, b: 50, e: 2 },
  c60: { label: 'Cuadrado 60 × 60 × 2 mm', forma: 'rect', a: 60, b: 60, e: 2 },
  c80: { label: 'Cuadrado 80 × 80 × 3 mm', forma: 'rect', a: 80, b: 80, e: 3 },
  r50: { label: 'Rectangular 50 × 30 × 2 mm', forma: 'rect', a: 50, b: 30, e: 2 },
  d60: { label: 'Redondo Ø 60,3 × 2 mm', forma: 'redondo', a: 60.3, b: 0, e: 2 },
};
