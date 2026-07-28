import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué maceta y qué tierra necesita esta planta?"
 *
 * Une las tres calculadoras de maceta y sustrato que estaban sueltas. Las tres
 * son el mismo recorrido: elegís maceta, calculás cuántos litros de sustrato
 * entran y armás la mezcla con esos litros. Por eso las ramas comparten los
 * campos de medidas: el volumen se calcula una vez.
 */
export const hub: HubData = {
  slug: 'jardin/tierra-y-macetas',
  title: 'Qué maceta y cuánta tierra: tamaño, litros y mezcla | Hacé Cuentas',
  description:
    'Qué diámetro de maceta le corresponde a tu planta, cuántos litros de sustrato entran según la forma y las medidas, cuántas bolsas comprar y cómo armar la mezcla para cada tipo de planta.',
  silo: 'Jardín',
  siloHref: '/jardin',

  eyebrow: 'Guía de trasplante',
  h1: '¿Qué maceta y cuánta tierra?',
  lede:
    'Partimos del principio: qué tamaño de maceta le corresponde a la planta que vas a trasplantar. Con esa maceta salen los litros de sustrato y la mezcla que le conviene.',
  stamps: ['Volumen por forma de maceta', '8 recetas de mezcla', '3 calculadoras adentro'],

  resultLabel: 'Lo que necesitás',

  cases: {
    title: '¿En qué paso estás?',
    intro: 'Las tres ramas son el mismo recorrido. Empezá por donde te haga falta.',
    items: [
      {
        id: 'maceta',
        label: 'Qué tamaño de maceta le va',
        hint: 'Según el cepellón',
        answer: 'La maceta nueva tiene que ser entre 1,2 y 2 veces el diámetro del cepellón.',
        yes: [
          'Diámetro recomendado de la maceta nueva',
          'Volumen aproximado de sustrato que va a llevar',
          'Cuánto margen de crecimiento le queda a la raíz',
        ],
        warn: [
          'Estimación de cantidades. Verificá el volumen real con la ficha del fabricante de la maceta.',
          'Saltar a una maceta mucho más grande es contraproducente: queda mucha tierra húmeda sin raíces que la consuman y se pudre',
          'Las suculentas y los cactus prefieren maceta justa: en maceta grande se pudren antes de llenarla',
        ],
        plazo: 'trasplantá al final del invierno o al principio de la primavera, antes del arranque vegetativo.',
      },
      {
        id: 'tierra',
        label: 'Cuánta tierra tengo que comprar',
        hint: 'Litros y bolsas',
        answer: 'El volumen sale de las medidas de la maceta, más un 10% de margen.',
        yes: [
          'Litros de sustrato por maceta y para todas las macetas',
          'Bolsas de 20 y de 50 litros que hay que comprar',
          'Margen del 10% ya incluido: el sustrato se asienta y se compacta',
        ],
        warn: [
          'Estimación de cantidades. Verificá el volumen real con la ficha del fabricante de la maceta.',
          'La bolsa de sustrato se vende por volumen suelto: después de regar la primera vez, el nivel baja bastante',
          'El fondo de la maceta no se llena con piedras: no mejora el drenaje y te roba volumen útil de raíz',
        ],
        plazo: 'humedecé el sustrato antes de llenar: seco no absorbe y el agua se va por los costados.',
      },
      {
        id: 'mezcla',
        label: 'Cómo armo la mezcla',
        hint: 'Proporciones por tipo de planta',
        answer: 'Cada tipo de planta pide su proporción de sustrato, compost, perlita y aireantes.',
        yes: [
          'Litros exactos de cada componente para el volumen que necesitás',
          'Receta específica según el tipo de planta',
          'Qué componente domina la mezcla y por qué',
        ],
        warn: [
          'Estimación de cantidades. Verificá el volumen real con la ficha del fabricante de la maceta.',
          'Las orquídeas no van en tierra: van en corteza. Una orquídea en sustrato común pierde las raíces',
          'La tierra del jardín sola no sirve en maceta: se compacta, drena mal y trae semillas de malezas y patógenos',
        ],
        plazo: 'mezclá todo en seco antes de humedecer, así queda parejo.',
      },
    ],
  },

  inputsTitle: 'Las medidas de tu maceta',
  inputsIntro: 'Con estos datos salen las tres ramas: el volumen se calcula una sola vez.',
  fields: [
    {
      id: 'tipoPlanta',
      label: 'Tipo de planta',
      type: 'select',
      value: 'interior',
      options: [
        { value: 'interior', label: 'Planta de interior (potus, monstera, ficus)' },
        { value: 'hortaliza', label: 'Hortaliza en maceta' },
        { value: 'aromatica', label: 'Aromática' },
        { value: 'helecho', label: 'Helecho' },
        { value: 'suculenta', label: 'Suculenta o cactus' },
        { value: 'orquidea', label: 'Orquídea' },
        { value: 'frutal_maceta', label: 'Frutal en maceta' },
        { value: 'semillero', label: 'Semillero o almácigo' },
      ],
    },
    { id: 'diametroRaiz', label: 'Diámetro del cepellón actual (cm)', type: 'number', min: 2, max: 100, value: 12 },
    {
      id: 'forma',
      label: 'Forma de la maceta nueva',
      type: 'select',
      value: 'redonda',
      options: [
        { value: 'redonda', label: 'Redonda' },
        { value: 'cuadrada', label: 'Cuadrada' },
        { value: 'rectangular', label: 'Rectangular (jardinera)' },
      ],
    },
    { id: 'medida1', label: 'Diámetro o lado largo (cm)', type: 'number', min: 3, max: 300, value: 22 },
    { id: 'medida2', label: 'Lado corto (cm), sólo si es rectangular', type: 'number', min: 0, max: 300, value: 18 },
    { id: 'alto', label: 'Profundidad de la maceta (cm)', type: 'number', min: 3, max: 200, value: 20 },
    { id: 'cantidad', label: 'Cuántas macetas', type: 'number', min: 1, max: 500, value: 1 },
  ],
  fineprint:
    'Estimación de cantidades y materiales. Verificá el volumen real con la ficha del fabricante de la maceta y del sustrato.',

  chart: {
    type: 'donut',
    title: 'Composición del volumen',
    caption:
      'En maceta ves cuánto ocupa el cepellón y cuánto sustrato nuevo entra alrededor; en tierra, el volumen neto y el margen de asentamiento; en mezcla, cada componente de la receta.',
  },
  breakdownTitle: 'Los números del trasplante',
  breakdownIntro: 'Las barras comparan cada valor con el mayor de la lista.',

  faq: [
    {
      q: '¿De qué tamaño tiene que ser la maceta nueva?',
      a: 'Entre 1,2 y 2 veces el diámetro del cepellón según la planta. Para plantas de interior y hortalizas, alrededor de 1,5 veces: un cepellón de 12 cm pide una maceta de 18 cm. Para frutales en maceta, el doble. Para suculentas y cactus, apenas 1,2 veces, porque prefieren maceta justa.',
    },
    {
      q: '¿Qué pasa si trasplanto a una maceta demasiado grande?',
      a: 'La planta destina energía a llenar de raíces el volumen nuevo en vez de crecer arriba, y sobre todo queda mucha tierra húmeda sin raíces que la consuman. Esa tierra permanentemente mojada es el escenario ideal para la pudrición de raíz y para los mosquitos del sustrato. Conviene subir de a un tamaño por vez.',
    },
    {
      q: '¿Cuántos litros de tierra entran en una maceta de 20 cm?',
      a: 'Una maceta redonda de 20 cm de diámetro y 20 cm de profundidad tiene alrededor de 6,3 litros de volumen geométrico, y conviene comprar unos 7 litros contando el margen de asentamiento. Como la mayoría de las macetas son cónicas y más angostas abajo, el volumen real suele ser algo menor.',
    },
    {
      q: '¿Por qué hay que comprar un 10% más de sustrato?',
      a: 'Porque el sustrato se vende suelto y aireado, y después del primer riego se asienta y compacta: el nivel de la maceta baja notablemente. Ese 10% cubre el asentamiento y lo que se pierde al manipular. En volúmenes grandes, con canteros, conviene un 15%.',
    },
    {
      q: '¿Sirve la tierra del jardín para macetas?',
      a: 'Sola, no. En una maceta la tierra de jardín se compacta con los riegos, pierde estructura, drena mal y ahoga la raíz. Además trae semillas de malezas, insectos y posibles patógenos. Se puede usar como parte de la mezcla, no más de un tercio, y siempre con perlita o arena gruesa para airearla.',
    },
    {
      q: '¿Cuál es la mezcla básica para plantas de interior?',
      a: 'Alrededor de 50% de sustrato base, 20% de compost o humus de lombriz, 20% de perlita y 10% de vermiculita. La perlita aporta drenaje y aire; la vermiculita retiene humedad y nutrientes; el compost aporta la nutrición de fondo. Con esa base andan bien potus, monsteras, filodendros y la mayoría de las tropicales de interior.',
    },
    {
      q: '¿Qué sustrato va para suculentas y cactus?',
      a: 'Uno mucho más mineral que orgánico: alrededor de 30% de sustrato base, 50% de perlita y 20% de arena gruesa. La clave es que drene rápido y que la raíz no quede en un medio húmedo. Nada de compost: el exceso de materia orgánica retiene agua y las pudre.',
    },
    {
      q: '¿Por qué las orquídeas no van en tierra?',
      a: 'Porque las orquídeas más comunes de interior son epífitas: en la naturaleza crecen agarradas a la corteza de un árbol, con las raíces al aire. Necesitan un medio muy aireado, alrededor de 80% de corteza de pino y 20% de perlita, sin nada de tierra. Plantada en sustrato común, la raíz se pudre en pocas semanas.',
    },
    {
      q: '¿Para qué sirve la perlita?',
      a: 'Es un mineral volcánico expandido, muy liviano y poroso. Su función es estructural: crea espacios de aire dentro del sustrato para que la raíz respire y el agua drene. No aporta nutrientes ni retiene mucha humedad, y por eso se combina con vermiculita, que sí retiene agua y minerales.',
    },
    {
      q: '¿Hay que poner piedras en el fondo de la maceta?',
      a: 'No. Es de las creencias más difundidas y de las menos ciertas: por el efecto de tensión superficial entre capas de distinta granulometría, la capa de piedras eleva el nivel de saturación de agua dentro del sustrato en vez de bajarlo. Lo que hay que asegurar es que la maceta tenga buenos agujeros de drenaje y que el sustrato sea aireado.',
    },
    {
      q: '¿Cada cuánto hay que cambiar el sustrato de una maceta?',
      a: 'Cada uno o dos años en plantas de crecimiento activo, y cada dos o tres en las de crecimiento lento. Con el tiempo el sustrato se compacta, pierde estructura porosa y acumula sales de los fertilizantes. Señales de que llegó el momento: el agua queda parada arriba o atraviesa de largo sin mojar, y aparecen raíces saliendo por los agujeros.',
    },
    {
      q: '¿Cuántas bolsas de 20 litros necesito?',
      a: 'Se divide el volumen total con margen por 20 y se redondea hacia arriba. Seis macetas de 7 litros son 42 litros: tres bolsas de 20. Si vas a llenar canteros o macetones grandes, la bolsa de 50 litros suele salir bastante más barata por litro.',
    },
  ],

  sources: [
    {
      name: 'Container Gardening — selección de maceta y sustrato',
      url: 'https://extension.umn.edu/planting-and-growing-guides/growing-vegetables-containers',
      publisher: 'University of Minnesota Extension',
    },
    {
      name: 'Container Media and Drainage — el mito de la capa de drenaje',
      url: 'https://hort.extension.wisc.edu/articles/container-gardening/',
      publisher: 'University of Wisconsin-Madison Division of Extension',
    },
    {
      name: 'INTA — sustratos para producción de plantas en contenedor',
      url: 'https://inta.gob.ar/documentos/sustratos-para-plantines',
      publisher: 'INTA',
    },
  ],

  replaces: [
    '/calculadora-macetas-tamano-planta',
    '/calculadora-tierra-maceta-litros-volumen',
    '/calculadora-sustrato-mezcla-proporciones',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Por tipo de planta: cuánto más grande que el cepellón va la maceta, y la
 * receta de mezcla en fracciones del volumen total.
 */
export const TIPOS: Record<
  string,
  {
    nombre: string;
    multMaceta: number;
    receta: { base: number; compost: number; perlita: number; extra: number };
    nombreExtra: string;
    descripcion: string;
  }
> = {
  interior: {
    nombre: 'Planta de interior', multMaceta: 1.5,
    receta: { base: 0.5, compost: 0.2, perlita: 0.2, extra: 0.1 }, nombreExtra: 'Vermiculita',
    descripcion: '50% sustrato base + 20% compost + 20% perlita + 10% vermiculita',
  },
  hortaliza: {
    nombre: 'Hortaliza en maceta', multMaceta: 1.5,
    receta: { base: 0.4, compost: 0.3, perlita: 0.2, extra: 0.1 }, nombreExtra: 'Vermiculita',
    descripcion: '40% sustrato base + 30% compost + 20% perlita + 10% vermiculita',
  },
  aromatica: {
    nombre: 'Aromática', multMaceta: 1.5,
    receta: { base: 0.4, compost: 0.2, perlita: 0.3, extra: 0.1 }, nombreExtra: 'Arena gruesa',
    descripcion: '40% sustrato base + 30% perlita + 20% compost + 10% arena gruesa',
  },
  helecho: {
    nombre: 'Helecho', multMaceta: 1.5,
    receta: { base: 0.4, compost: 0.2, perlita: 0.1, extra: 0.3 }, nombreExtra: 'Turba o vermiculita',
    descripcion: '40% sustrato base + 30% turba o vermiculita + 20% compost + 10% perlita',
  },
  suculenta: {
    nombre: 'Suculenta o cactus', multMaceta: 1.2,
    receta: { base: 0.3, compost: 0, perlita: 0.5, extra: 0.2 }, nombreExtra: 'Arena gruesa',
    descripcion: '30% sustrato base + 50% perlita + 20% arena gruesa, sin compost',
  },
  orquidea: {
    nombre: 'Orquídea', multMaceta: 1.3,
    receta: { base: 0, compost: 0, perlita: 0.2, extra: 0.8 }, nombreExtra: 'Corteza de pino',
    descripcion: '80% corteza de pino + 20% perlita, sin nada de tierra',
  },
  frutal_maceta: {
    nombre: 'Frutal en maceta', multMaceta: 2,
    receta: { base: 0.35, compost: 0.35, perlita: 0.2, extra: 0.1 }, nombreExtra: 'Vermiculita',
    descripcion: '35% sustrato base + 35% compost + 20% perlita + 10% vermiculita',
  },
  semillero: {
    nombre: 'Semillero o almácigo', multMaceta: 1.3,
    receta: { base: 0.4, compost: 0.1, perlita: 0.3, extra: 0.2 }, nombreExtra: 'Vermiculita fina',
    descripcion: '40% sustrato fino + 30% perlita + 20% vermiculita + 10% compost',
  },
};

/** Margen sobre el volumen geométrico: el sustrato se asienta con el riego. */
export const MARGEN_ASENTAMIENTO = 0.1;

/** Relación profundidad/diámetro que se asume al recomendar una maceta. */
export const PROPORCION_ALTO = 0.7;
