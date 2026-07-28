import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto pongo de cada cosa para N tragos?"
 *
 * Une las siete calculadoras de recetas de tragos y preparados que estaban
 * sueltas. Todas responden la misma pregunta: la PROPORCIÓN de cada ingrediente
 * y cuánto sale en total para la cantidad de gente que sos.
 *
 * DESLINDE con /eventos/bebidas: aquel hub responde "¿cuánta bebida COMPRO para
 * la fiesta?" (litros por persona de cerveza, vino, gaseosa, hielo). Éste
 * responde "¿cómo LO PREPARO?": la receta trago por trago. Uno es la lista del
 * súper, el otro es la barra.
 *
 * Nada de lo que sale acá es plata: cada fila declara `format` explícito.
 */
export const hub: HubData = {
  slug: 'eventos/tragos',
  title: 'Tragos para muchos: proporciones e ingredientes por persona | Hacé Cuentas',
  description:
    'Cuánto ron, gin, aperol o pisco va por trago y cuánto sale en total para la cantidad de gente que sos, con las botellas, las limas, el hielo y el jarabe. Incluye hidromiel y almíbar casero.',
  silo: 'Eventos',
  siloHref: '/eventos',

  eyebrow: 'Recetas por cantidad',
  h1: '¿Cuánto de cada cosa para N tragos?',
  lede:
    'Partimos del caso más frecuente: sos un grupo, cada uno se toma un par y querés saber cuánto comprar y en qué proporción se arma cada trago. Elegí cuál vas a hacer y ajustá los mililitros si tu receta es otra.',
  stamps: ['Proporciones IBA', 'Compra con 15% de margen', '7 calculadoras adentro'],

  resultLabel: 'Tu tanda',

  cases: {
    title: '¿Qué vas a preparar?',
    intro:
      'Partimos del trago más pedido. Si el tuyo es otro, cambialo: cada uno trae su proporción, su lista de compras y su rendimiento.',
    items: [
      {
        id: 'gintonic',
        label: 'Gin tonic',
        hint: '50 ml de gin + 150 ml de tónica',
        answer: 'La proporción clásica es 1 de gin por 3 de tónica, con hielo macizo.',
        yes: [
          'Litros de gin y de tónica para toda la tanda',
          'Botellas de gin de 750 ml y latas o botellitas de tónica de 200 ml, con 15% de margen',
          'Hielo y cítricos: 0,8 kg y un limón o pepino cada cuatro tragos',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'El alcohol es para mayores de 18 años: no manejes si tomaste y nunca lo sirvas a embarazadas ni a menores',
          'El hielo en cubos chicos se derrite rápido y aguachenta el trago: usá cubos grandes o esferas',
        ],
        plazo: 'la tónica se abre recién en el momento: abierta pierde gas en minutos.',
      },
      {
        id: 'aperol',
        label: 'Aperol spritz',
        hint: '3 prosecco – 2 aperol – 1 soda',
        answer: 'El spritz oficial es 9 cl de prosecco, 6 cl de Aperol y un chorro de soda.',
        yes: [
          'Mililitros de Aperol, prosecco y soda de toda la tanda',
          'Botellas de prosecco de 750 ml con 15% de margen',
          'Naranjas para las rodajas y kilos de hielo',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'El alcohol es para mayores de 18 años: no manejes si tomaste y nunca lo sirvas a embarazadas ni a menores',
          'El prosecco va bien frío y se sirve último: si lo mezclás primero, el spritz queda sin burbuja',
        ],
        plazo: 'se arma en la copa, uno por uno: el spritz no se prepara en jarra.',
      },
      {
        id: 'mojito',
        label: 'Mojito',
        hint: 'Ron, lima, azúcar, menta y soda',
        answer: 'Por trago: 50 ml de ron, 25 ml de lima, 10 g de azúcar, 8 hojas de menta y soda.',
        yes: [
          'Ron, lima, azúcar y soda de toda la tanda',
          'Limas enteras (30 ml de jugo cada una) y atados de menta',
          'Botellas de ron con 15% de margen y kilos de hielo',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'El alcohol es para mayores de 18 años: no manejes si tomaste y nunca lo sirvas a embarazadas ni a menores',
          'La menta se presiona, no se machaca: si la rompés suelta clorofila y amarga el trago',
        ],
        plazo: 'la lima se exprime el mismo día: el jugo envasado cambia el sabor.',
      },
      {
        id: 'daiquiri',
        label: 'Daiquiri',
        hint: '60 ml de ron – 25 de lima – 15 de jarabe',
        answer: 'El daiquiri clásico es ron blanco, jugo de lima y jarabe simple, batido y colado.',
        yes: [
          'Ron, jugo de lima y jarabe simple de toda la tanda',
          'Limas necesarias y botellas de ron con 15% de margen',
          'Hielo para batir: 0,5 kg por persona',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'El alcohol es para mayores de 18 años: no manejes si tomaste y nunca lo sirvas a embarazadas ni a menores',
          'Se bate con hielo y se cuela: si lo servís con hielo adentro se aguacha y pierde el balance',
        ],
        plazo: 'el jarabe simple conviene hacerlo el día anterior y enfriarlo.',
      },
      {
        id: 'pisco',
        label: 'Pisco sour',
        hint: 'Con clara de huevo cruda',
        answer: 'Por trago: 60 ml de pisco, 25 de limón, 20 de jarabe y 20 de clara.',
        yes: [
          'Pisco, limón, jarabe y clara de toda la tanda',
          'Huevos necesarios para la clara (30 ml de clara por huevo) y limones',
          'Botellas de pisco con 15% de margen y amargo de angostura',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Lleva CLARA DE HUEVO CRUDA: riesgo de salmonella. No se lo sirvas a embarazadas, chicos, mayores ni a personas inmunocomprometidas; usá huevo pasteurizado o reemplazá la clara por 20 ml de aquafaba',
          'El alcohol es para mayores de 18 años: no manejes si tomaste y nunca lo sirvas a embarazadas ni a menores',
        ],
        plazo: 'la clara se bate en seco primero y después con hielo: así levanta la espuma.',
      },
      {
        id: 'hidromiel',
        label: 'Hidromiel casero',
        hint: 'Cuánta miel y cuánta agua',
        answer: 'La miel sale del alcohol que buscás: 1 kg en 1 L sube la densidad 0,035.',
        yes: [
          'Kilos de miel y litros de agua para el volumen final que quieras',
          'Densidad inicial (OG) y final (FG) esperadas para el estilo elegido',
          'Levadura recomendada según el alcohol objetivo',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'Fermentación casera: sanitizá todo lo que toca el mosto y usá airlock. Una fermentación contaminada se tira, no se rescata',
          'La miel cruda NO se hierve: el calor le vuela los aromas. Se disuelve en agua tibia',
        ],
        plazo: 'la fermentación primaria tarda de 2 a 6 semanas y el añejado mejora todo.',
      },
      {
        id: 'almibar',
        label: 'Almíbar / jarabe simple',
        hint: 'El azúcar de los sours y daiquiris',
        answer: 'El jarabe simple es 1:1 en peso: 500 g de azúcar y 500 ml de agua.',
        yes: [
          'Gramos de azúcar y mililitros de agua para el punto que elijas',
          'Rendimiento aproximado en mililitros de almíbar terminado',
          'Temperatura de cocción y °Brix de cada punto clásico',
        ],
        warn: [
          'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.',
          'El azúcar caliente quema mucho más que el agua hirviendo: no lo pruebes con el dedo ni lo muevas con la olla llena',
          'Una vez que rompe el hervor no se revuelve: el almíbar cristaliza y hay que empezar de nuevo',
        ],
        plazo: 'el jarabe simple dura 3 a 4 semanas en heladera en frasco limpio.',
      },
    ],
  },

  inputsTitle: 'Cuántos son y qué receta usás',
  inputsIntro:
    'Cada caso usa los campos que le corresponden; los demás podés dejarlos como están. Los mililitros por trago vienen con la proporción clásica: cambialos si tu receta es otra.',
  fields: [
    { id: 'personas', label: 'Cantidad de personas', type: 'number', min: 1, max: 1000, value: 10 },
    { id: 'tragosPorPersona', label: 'Tragos por persona', type: 'number', min: 1, max: 20, value: 2 },
    {
      id: 'mlAlcohol',
      label: 'Alcohol por trago (ml)',
      type: 'number',
      min: 0,
      max: 300,
      value: 0,
      help: 'Gin, ron, pisco o Aperol según el trago. Dejalo en 0 y usa la medida clásica de cada receta (50-60 ml).',
    },
    {
      id: 'mlMezclador',
      label: 'Mezclador por trago (ml)',
      type: 'number',
      min: 0,
      max: 500,
      value: 0,
      help: 'Tónica en el gin tonic, prosecco en el spritz, soda en el mojito. En 0 usa la proporción clásica.',
    },
    {
      id: 'mlCitrico',
      label: 'Jugo de lima o limón por trago (ml)',
      type: 'number',
      min: 0,
      max: 100,
      value: 0,
      help: 'En 0 usa los 25 ml clásicos. Ni el gin tonic ni el spritz lo llevan.',
    },
    {
      id: 'mlJarabe',
      label: 'Jarabe simple o azúcar por trago (ml o g)',
      type: 'number',
      min: 0,
      max: 100,
      value: 0,
      help: 'En 0 usa lo que pide cada receta: 15 ml en el daiquiri, 20 en el pisco sour, 10 g de azúcar en el mojito.',
    },
    {
      id: 'volumenFinal',
      label: 'Hidromiel: litros finales',
      type: 'number',
      min: 1,
      max: 200,
      value: 10,
    },
    {
      id: 'estilo',
      label: 'Hidromiel: estilo',
      type: 'select',
      value: 'medium',
      options: [
        { value: 'dry', label: 'Seco (FG 0,998)' },
        { value: 'semi_dry', label: 'Semiseco (FG 1,005)' },
        { value: 'medium', label: 'Medio (FG 1,015)' },
        { value: 'semi_sweet', label: 'Semidulce (FG 1,025)' },
        { value: 'sweet', label: 'Dulce (FG 1,035)' },
        { value: 'dessert', label: 'De postre (FG 1,050)' },
      ],
    },
    { id: 'abvObjetivo', label: 'Hidromiel: alcohol objetivo (% ABV)', type: 'number', min: 3, max: 20, step: 0.5, value: 12 },
    {
      id: 'modoAlmibar',
      label: 'Almíbar: qué dato tenés',
      type: 'select',
      value: 'azucar',
      options: [
        { value: 'azucar', label: 'Los gramos de azúcar que tengo' },
        { value: 'volumen', label: 'Los mililitros de almíbar que quiero' },
      ],
    },
    { id: 'cantidadAlmibar', label: 'Almíbar: cantidad (g de azúcar o ml de almíbar)', type: 'number', min: 1, max: 100000, value: 500 },
    {
      id: 'tipoAlmibar',
      label: 'Almíbar: punto',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'liviano', label: 'Liviano 1:2 (para calar bizcochos)' },
        { value: 'medio', label: 'Medio / jarabe simple 1:1 (tragos)' },
        { value: 'denso', label: 'Denso 2:1' },
        { value: 'hilo-flojo', label: 'Punto hilo flojo' },
        { value: 'hilo-fuerte', label: 'Punto hilo fuerte' },
        { value: 'bolita-blanda', label: 'Punto bolita blanda' },
        { value: 'bolita-dura', label: 'Punto bolita dura' },
        { value: 'caramelo', label: 'Caramelo' },
      ],
    },
  ],
  fineprint:
    'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria. El consumo de alcohol está prohibido para menores de 18 años.',

  chart: {
    type: 'donut',
    title: 'Cómo se reparte lo que vas a preparar',
    caption:
      'Cada porción es un ingrediente de la tanda entera, en mililitros o gramos. Sirve para ver de un vistazo qué es lo que más volumen ocupa y, por lo tanto, lo que más te conviene comprar bien.',
  },
  breakdownTitle: 'Los números de la tanda',
  breakdownIntro: 'Las barras comparan cada valor con el mayor de la lista.',

  faq: [
    {
      q: '¿Cuánto alcohol va por trago?',
      a: 'La medida de bar estándar es de 50 a 60 ml de destilado por trago. Gin tonic y mojito arrancan en 50 ml; daiquiri y pisco sour, en 60. El Aperol es un aperitivo de baja graduación y va en 60 ml, acompañado de 90 ml de prosecco.',
    },
    {
      q: '¿Cuántos tragos toma cada persona en una fiesta?',
      a: 'Como referencia de planificación, dos por persona cubren una reunión de tres o cuatro horas donde también hay otras bebidas. Si el trago es la bebida principal de la noche, subí a tres. Comprá siempre con margen: el cálculo suma un 15% arriba de lo que da la receta.',
    },
    {
      q: '¿Cuál es la proporción del gin tonic?',
      a: 'Uno a tres: 50 ml de gin por 150 ml de tónica. Si te gusta más suave, 1 a 4 (50 y 200 ml). Más cargado que 1 a 2 tapa los botánicos del gin y queda áspero. El hielo tiene que ser macizo y llenar la copa: cuanto más hielo, más lento se derrite.',
    },
    {
      q: '¿Cuántas botellas de gin necesito para 20 tragos?',
      a: 'Con 50 ml por trago son 1.000 ml netos. Sumando el 15% de margen, 1.150 ml, o sea dos botellas de 750 ml. Como regla rápida: una botella de 750 ml rinde entre 13 y 15 tragos de 50 ml, sin contar lo que se pierde al servir.',
    },
    {
      q: '¿Cuántas limas necesito para los mojitos?',
      a: 'Una lima da alrededor de 30 ml de jugo. Con 25 ml por mojito, cada lima alcanza para poco más de un trago. Para 20 mojitos van unas 17 limas, y conviene comprar algunas más para las rodajas de decoración.',
    },
    {
      q: '¿Cómo hago jarabe simple para tragos?',
      a: 'Partes iguales de azúcar y agua en peso: 500 g de azúcar y 500 ml de agua. Se calienta hasta que el azúcar se disuelve del todo, se hierve un minuto y se enfría. Rinde unos 590 ml y dura de tres a cuatro semanas en heladera en un frasco limpio.',
    },
    {
      q: '¿Es seguro el pisco sour con clara de huevo cruda?',
      a: 'La clara cruda tiene riesgo de salmonella. No se lo sirvas a embarazadas, chicos, personas mayores ni inmunocomprometidas. Las dos salidas seguras son el huevo pasteurizado o la aquafaba: 20 ml del líquido de la lata de garbanzos hacen la misma espuma sin huevo.',
    },
    {
      q: '¿Cuánto hielo compro?',
      a: 'Entre medio y un kilo por persona según el trago. Los que se baten y se cuelan, como el daiquiri o el pisco sour, gastan menos hielo en la copa pero mucho en la coctelera: contá 0,5 kg. Los que se sirven sobre hielo, como el gin tonic o el mojito, se llevan de 0,8 a 1 kg por persona.',
    },
    {
      q: '¿Cuánta miel lleva el hidromiel?',
      a: 'Depende del alcohol que busques. Un kilo de miel disuelto en un litro sube la densidad 0,035, y cada punto de alcohol pide 0,0076 de densidad. Para 10 litros a 12% en estilo medio salen alrededor de 3,3 kg de miel y 7,7 litros de agua. La miel ocupa volumen: por eso el agua no son 10 litros.',
    },
    {
      q: '¿Qué diferencia hay entre este cálculo y el de bebidas para la fiesta?',
      a: 'Éste es la receta: cuánto de cada ingrediente lleva cada trago y cuánto sale en total. El de bebidas para la fiesta responde otra cosa: cuánta cerveza, vino, gaseosa, agua y hielo comprar en total para el evento, en litros por persona y en packs. Si estás armando la lista del súper, empezá por aquél; si ya sabés que vas a hacer tragos, éste te dice cómo.',
    },
    {
      q: '¿Se pueden preparar los tragos con anticipación?',
      a: 'Los que no llevan gas, sí: daiquiri y pisco sour se pueden premezclar sin hielo y guardar en heladera unas horas, batiéndolos recién al servir. Los que llevan burbuja no: el gin tonic y el spritz pierden el gas si los armás antes, así que se preparan copa por copa en el momento.',
    },
    {
      q: '¿Qué punto de almíbar necesito para cada cosa?',
      a: 'Para tragos y para calar bizcochos, el jarabe simple 1:1 a 50 °Brix. Para bañar frutas o glasear, el denso 2:1. Los puntos más altos son de confitería: hilo flojo y fuerte para merengue italiano y frutas confitadas, bolita blanda para fondant y turrón, bolita dura para caramelos duros, y caramelo arriba de 150 °C.',
    },
  ],

  sources: [
    {
      name: 'IBA Official Cocktails — recetas y proporciones oficiales',
      url: 'https://iba-world.com/cocktails/all-cocktails/',
      publisher: 'International Bartenders Association',
    },
    {
      name: "Daiquiri — receta clásica y variantes",
      url: 'https://www.diffordsguide.com/cocktails/recipe/614/daiquiri',
      publisher: "Difford's Guide",
    },
    {
      name: 'Mead Style Guidelines — estilos, densidades y dulzor residual',
      url: 'https://www.bjcp.org/style/2015/mead/',
      publisher: 'Beer Judge Certification Program',
    },
    {
      name: 'Grado Brix — concentración de azúcar en jarabes',
      url: 'https://es.wikipedia.org/wiki/Grado_Brix',
      publisher: 'Wikipedia',
    },
    {
      name: 'Candy making — etapas del azúcar y temperaturas de cocción',
      url: 'https://en.wikipedia.org/wiki/Candy_making',
      publisher: 'Wikipedia',
    },
    {
      name: 'Shell Eggs from Farm to Table — riesgo de salmonella en huevo crudo',
      url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/eggs/shell-eggs-farm-table',
      publisher: 'USDA Food Safety and Inspection Service',
    },
  ],

  replaces: [
    '/calculadora-gin-tonic-proporciones',
    '/calculadora-aperol-spritz-proporciones',
    '/calculadora-mojito-cubano-ingredientes',
    '/calculadora-daiquiri-clasico-personas',
    '/calculadora-pisco-sour-receta',
    '/calculadora-hidromiel-proporciones-miel-agua',
    '/almibar-proporciones-azucar-agua',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
};

/** Margen de compra sobre lo que pide la receta. */
export const MARGEN_COMPRA = 1.15;

/**
 * Recetas por trago, en ml salvo que se diga otra cosa. Los valores son los
 * `default` de las calculadoras originales, que a su vez salen de la IBA.
 * `hieloKgPorPersona` y los rendimientos de cítrico replican exactamente lo que
 * hacían las fórmulas viejas.
 */
export const TRAGOS: Record<
  string,
  {
    nombre: string;
    alcohol: { nombre: string; ml: number; botellaMl: number };
    mezclador?: { nombre: string; ml: number; botellaMl?: number };
    citrico?: { nombre: string; ml: number; mlPorFruta: number; fruta: string };
    jarabe?: { nombre: string; ml: number; unidad: string };
    hieloKgPorPersona: number;
    /** Decoración: una unidad cada N tragos. */
    deco?: { nombre: string; cadaNTragos: number };
  }
> = {
  gintonic: {
    nombre: 'Gin tonic',
    alcohol: { nombre: 'Gin', ml: 50, botellaMl: 750 },
    mezclador: { nombre: 'Tónica', ml: 150, botellaMl: 200 },
    hieloKgPorPersona: 0.8,
    deco: { nombre: 'Limones o pepinos', cadaNTragos: 4 },
  },
  aperol: {
    nombre: 'Aperol spritz',
    alcohol: { nombre: 'Aperol', ml: 60, botellaMl: 750 },
    mezclador: { nombre: 'Prosecco', ml: 90, botellaMl: 750 },
    jarabe: { nombre: 'Soda', ml: 30, unidad: 'ml' },
    hieloKgPorPersona: 1,
    deco: { nombre: 'Naranjas', cadaNTragos: 4 },
  },
  mojito: {
    nombre: 'Mojito',
    alcohol: { nombre: 'Ron blanco', ml: 50, botellaMl: 750 },
    mezclador: { nombre: 'Soda', ml: 60 },
    citrico: { nombre: 'Jugo de lima', ml: 25, mlPorFruta: 30, fruta: 'Limas' },
    jarabe: { nombre: 'Azúcar', ml: 10, unidad: 'g' },
    hieloKgPorPersona: 0.8,
  },
  daiquiri: {
    nombre: 'Daiquiri',
    alcohol: { nombre: 'Ron blanco', ml: 60, botellaMl: 750 },
    citrico: { nombre: 'Jugo de lima', ml: 25, mlPorFruta: 30, fruta: 'Limas' },
    jarabe: { nombre: 'Jarabe simple', ml: 15, unidad: 'ml' },
    hieloKgPorPersona: 0.5,
  },
  pisco: {
    nombre: 'Pisco sour',
    alcohol: { nombre: 'Pisco', ml: 60, botellaMl: 750 },
    citrico: { nombre: 'Jugo de limón', ml: 25, mlPorFruta: 25, fruta: 'Limones' },
    jarabe: { nombre: 'Jarabe simple', ml: 20, unidad: 'ml' },
    hieloKgPorPersona: 0.5,
  },
};

/** Clara de huevo del pisco sour: ml por trago y ml que rinde un huevo. */
export const CLARA_ML_POR_TRAGO = 20;
export const CLARA_ML_POR_HUEVO = 30;
/**
 * Hojas de menta por mojito y hojas que trae un atado grande.
 *
 * OJO: la fórmula vieja (`mojito-cubano-ingredientes`) usaba 8 hojas por atado,
 * o sea el mismo número que lleva un solo trago: la lista de compras pedía un
 * atado de menta POR MOJITO. Un atado grande de menta trae del orden de 60
 * hojas útiles, así que la cuenta salía inflada unas 7 veces.
 */
export const MENTA_HOJAS_POR_TRAGO = 8;
export const MENTA_HOJAS_POR_ATADO = 60;

/** Densidad final esperada (FG) por estilo de hidromiel. */
export const FG_HIDROMIEL: Record<string, number> = {
  dry: 0.998,
  semi_dry: 1.005,
  medium: 1.015,
  semi_sweet: 1.025,
  sweet: 1.035,
  dessert: 1.05,
};
/** Cuánto sube la densidad 1 kg de miel disuelto en 1 L. */
export const MIEL_APORTE_OG = 0.35;
/** Volumen que desplaza la miel, L por kg. */
export const MIEL_DESPLAZAMIENTO = 0.7;
/** Divisor clásico para pasar de diferencia de densidad a % ABV. */
export const ABV_DIVISOR = 131.25;

/** Puntos de almíbar: agua por gramo de azúcar, °Brix final y temperatura. */
export const ALMIBAR: Record<string, { ratioAgua: number; brix: number; temp: string; label: string }> = {
  liviano: { ratioAgua: 2, brix: 33.3333, temp: '100 °C — disolver y hervir 1 min', label: 'almíbar liviano (1:2)' },
  medio: { ratioAgua: 1, brix: 50, temp: '100 °C — disolver y hervir 1-2 min', label: 'almíbar medio / jarabe simple (1:1)' },
  denso: { ratioAgua: 0.5, brix: 66.6667, temp: '103-105 °C', label: 'almíbar denso (2:1)' },
  'hilo-flojo': { ratioAgua: 1 / 3, brix: 75, temp: '103-105 °C (hilo flojo)', label: 'punto hilo flojo' },
  'hilo-fuerte': { ratioAgua: 1 / 3, brix: 80, temp: '106-110 °C (hilo fuerte)', label: 'punto hilo fuerte' },
  'bolita-blanda': { ratioAgua: 1 / 3, brix: 85, temp: '112-116 °C (bolita blanda)', label: 'punto bolita blanda' },
  'bolita-dura': { ratioAgua: 1 / 3, brix: 90, temp: '121-124 °C (bolita dura)', label: 'punto bolita dura' },
  caramelo: { ratioAgua: 1 / 3, brix: 99, temp: '150-160 °C (caramelo)', label: 'caramelo' },
};
