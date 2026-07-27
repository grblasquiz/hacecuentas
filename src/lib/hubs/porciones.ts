import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto arroz o pasta por persona?"
 *
 * Absorbe 5 URLs sueltas de cocina (ver `replaces`). Los números salen de:
 *   - src/lib/formulas/porcion-arroz-personas.ts               (g por persona y taza de 185 g)
 *   - src/lib/formulas/porciones-arroz-por-persona-guarnicion.ts
 *   - src/lib/formulas/arroz-agua-proporcion.ts                (agua, tiempo y rendimiento por grano)
 *   - src/lib/formulas/porciones-pasta-seca-persona-hambre.ts  (perfiles de hambre, ×2,3 cocido)
 *   - src/lib/formulas/agua-pasta-litros-gramos.ts             (litros por 100 g y sal por litro)
 */

/** Gramos de seco por adulto, por caso. Espejo de las fórmulas de origen. */
export const PORCION: Record<string, { g: number; tipo: 'arroz' | 'pasta' }> = {
  'arroz-guarnicion': { g: 60, tipo: 'arroz' },
  'arroz-principal': { g: 80, tipo: 'arroz' },
  'arroz-sushi': { g: 75, tipo: 'arroz' },
  'pasta-entrada': { g: 60, tipo: 'pasta' },
  'pasta-normal': { g: 80, tipo: 'pasta' },
  'pasta-hambre': { g: 120, tipo: 'pasta' },
  'pasta-deportista': { g: 150, tipo: 'pasta' },
};

/** Tipos de grano: ml de agua por gramo, minutos y factor de rendimiento cocido. */
export const ARROZ: Record<string, { label: string; ratio: number; min: number; rinde: number }> = {
  blanco_largo: { label: 'Blanco largo fino', ratio: 2.0, min: 18, rinde: 3 },
  blanco_redondo: { label: 'Doble carolina (redondo)', ratio: 2.2, min: 20, rinde: 2.8 },
  integral: { label: 'Integral', ratio: 2.5, min: 40, rinde: 2.5 },
  basmati: { label: 'Basmati', ratio: 1.5, min: 15, rinde: 3 },
  jazmin: { label: 'Jazmín', ratio: 1.5, min: 15, rinde: 3 },
  arborio: { label: 'Arborio / Carnaroli (risotto)', ratio: 3.0, min: 18, rinde: 3 },
  parboiled: { label: 'Parboiled', ratio: 2.3, min: 22, rinde: 3 },
};

/** Litros de agua por cada 100 g de pasta, según tipo. */
export const PASTA_AGUA: Record<string, { label: string; litrosPor100g: number }> = {
  seca: { label: 'Seca (fideos de paquete)', litrosPor100g: 1.0 },
  fresca: { label: 'Fresca (tallarines, ñoquis)', litrosPor100g: 0.8 },
  rellena: { label: 'Rellena (ravioles, sorrentinos)', litrosPor100g: 1.2 },
};

export const COCINA = {
  gramosPorTazaArroz: 185,
  factorNino: 0.75, // el niño come 3/4 de la porción adulta de arroz
  gramosNinoPasta: 40, // porción fija de pasta seca para chicos de hasta 12
  factorCocidoPasta: 2.3,
  kcalPorGramoPasta: 3.5,
  salPorLitro: 10, // g de sal gruesa por litro de agua
  margenOlla: 1.4, // la olla tiene que tener 40% más que el agua
};

const DISCLAIMER_COCINA =
  'Las cantidades y tiempos son estimaciones: ajustalos al ingrediente, equipo y receta. Aplicá siempre prácticas adecuadas de seguridad alimentaria.';

export const hub: HubData = {
  slug: 'cocina/porciones',
  title: 'Cuánto arroz o pasta por persona: gramos, agua y sal',
  description:
    'Cuántos gramos de arroz o pasta seca por persona, cuánta agua y cuánta sal. Guarnición o plato principal, con chicos en la mesa y según el tipo de grano o de fideo.',
  silo: 'Cocina',
  siloHref: '/cocina',

  eyebrow: 'Guía de cocina',
  h1: '¿Cuánto arroz o pasta pongo por persona?',
  lede:
    'Estás parado en la cocina con el paquete en la mano. Elegí qué vas a hacer y te decimos los gramos de seco, el agua y la sal. Sin vueltas.',
  stamps: ['Gramos de producto seco', 'Agua y sal incluidas', '5 calculadoras adentro'],

  resultLabel: 'Cantidad estimada',

  cases: {
    title: '¿Qué estás cocinando?',
    intro: 'La variable que más mueve el número es si el arroz o la pasta van de guarnición o son el plato.',
    items: [
      {
        id: 'arroz-guarnicion',
        label: 'Arroz de guarnición',
        hint: '60 g de crudo por adulto',
        answer: 'De guarnición van 60 g de arroz crudo por adulto.',
        yes: [
          '60 g de arroz crudo por adulto: acompaña una carne, un pollo o un guiso',
          'El agua y el tiempo salen del tipo de grano que elijas abajo',
          'El arroz crece entre 2,5 y 3 veces su peso al cocinarse',
        ],
        warn: [
          DISCLAIMER_COCINA,
          'Si el arroz es lo único que hay en el plato, no alcanza: pasate a "plato principal".',
        ],
        plazo: 'una taza de 185 g de arroz crudo rinde para tres personas de guarnición.',
      },
      {
        id: 'arroz-principal',
        label: 'Arroz como plato principal',
        hint: '80 g de crudo por adulto',
        answer: 'Como plato principal van 80 g de arroz crudo por adulto.',
        yes: [
          '80 g de arroz crudo por adulto: risotto, arroz con pollo, arroz primavera',
          'Es un tercio más que la porción de guarnición',
          'Si le agregás mucha verdura o proteína, podés bajar a 70 g',
        ],
        warn: [
          DISCLAIMER_COCINA,
          'Para risotto elegí Arborio o Carnaroli: chupan 3 ml de caldo por gramo, mucho más que un largo fino.',
        ],
        plazo: 'el arroz sigue absorbiendo en el reposo: sacalo del fuego un minuto antes.',
      },
      {
        id: 'arroz-sushi',
        label: 'Arroz para sushi',
        hint: '75 g de crudo por adulto',
        answer: 'Para sushi van 75 g de arroz crudo por adulto.',
        yes: [
          '75 g de arroz crudo por adulto, que rinde unos 8 a 10 bocados',
          'Se cocina con menos agua que un arroz común para que el grano quede firme y pegajoso',
          'El avinagrado se agrega después de la cocción, en caliente',
        ],
        warn: [
          DISCLAIMER_COCINA,
          'Usá arroz redondo o específico para sushi: un largo fino no pega y el rollo se desarma.',
          'Lavá el grano hasta que el agua salga clara antes de cocinarlo.',
        ],
        plazo: 'el arroz de sushi se usa tibio, nunca frío de heladera.',
      },
      {
        id: 'pasta-entrada',
        label: 'Pasta de entrada o porción chica',
        hint: '60 g de seca por adulto',
        answer: 'De entrada van 60 g de pasta seca por adulto.',
        yes: [
          '60 g de pasta seca por adulto: entrada, guarnición o porción de dieta',
          'Rinde unos 140 g de pasta cocida en el plato',
          'El agua y la sal salen del tipo de pasta que elijas abajo',
        ],
        warn: [
          DISCLAIMER_COCINA,
          'La salsa suma calorías que no están contadas acá.',
        ],
        plazo: 'salá el agua recién cuando rompe el hervor, justo antes de tirar la pasta.',
      },
      {
        id: 'pasta-normal',
        label: 'Pasta como plato principal',
        hint: '80 g de seca por adulto',
        answer: 'De plato principal van 80 g de pasta seca por adulto.',
        yes: [
          '80 g de pasta seca por adulto: la porción estándar de un plato de fideos',
          'Rinde unos 185 g de pasta cocida',
          'Un paquete de 500 g alcanza para seis porciones normales',
        ],
        warn: [
          DISCLAIMER_COCINA,
          'La pasta rellena pesa más por unidad: para ravioles o sorrentinos calculá por docena, no por gramo seco.',
        ],
        plazo: 'la pasta sigue cocinándose en la salsa: colala un minuto antes del tiempo del paquete.',
      },
      {
        id: 'pasta-hambre',
        label: 'Pasta con hambre en serio',
        hint: '120 g de seca por adulto',
        answer: 'Con hambre en serio van 120 g de pasta seca por adulto.',
        yes: [
          '120 g de pasta seca por adulto: plato abundante, domingo de tuco',
          'Rinde unos 275 g de pasta cocida',
          'Un paquete de 500 g rinde poco más de cuatro porciones',
        ],
        warn: [
          DISCLAIMER_COCINA,
          'Más pasta necesita más agua y más olla: con poca agua los fideos se pegan.',
        ],
        plazo: 'nunca pases de tres cuartos de la capacidad de la olla: el agua rebalsa al hervir.',
      },
      {
        id: 'pasta-deportista',
        label: 'Pasta para carga de carbohidratos',
        hint: '150 g de seca por adulto',
        answer: 'Para carga de carbohidratos van 150 g de pasta seca por adulto.',
        yes: [
          '150 g de pasta seca por adulto: carga previa a una carrera o etapa de volumen',
          'Rinde unos 345 g de pasta cocida y ronda las 525 kcal solo de pasta',
          'Conviene repartirlo en dos comidas antes que en un solo plato',
        ],
        warn: [
          DISCLAIMER_COCINA,
          'Las calorías no incluyen salsa, queso ni aceite, que pueden duplicar el total.',
        ],
        plazo: 'la carga de carbohidratos se hace entre 24 y 48 horas antes del esfuerzo.',
      },
    ],
  },

  inputsTitle: 'Cuántos son y qué tenés en la alacena',
  inputsIntro: 'Con la cantidad de personas ya tenés el número. El tipo de grano o de fideo ajusta el agua.',
  fields: [
    { id: 'personas', label: 'Adultos en la mesa', type: 'number', min: 1, max: 60, value: 4 },
    {
      id: 'ninos',
      label: 'Chicos (hasta 12 años)',
      type: 'number',
      min: 0,
      max: 40,
      value: 0,
      help: 'Un chico come tres cuartos de la porción adulta de arroz, o 40 g de pasta seca.',
    },
    {
      id: 'tipoArroz',
      label: 'Tipo de arroz',
      type: 'select',
      value: 'blanco_largo',
      options: [
        { value: 'blanco_largo', label: 'Blanco largo fino — 2 partes de agua, 18 min' },
        { value: 'blanco_redondo', label: 'Doble carolina (redondo) — 2,2 partes, 20 min' },
        { value: 'parboiled', label: 'Parboiled — 2,3 partes, 22 min' },
        { value: 'integral', label: 'Integral — 2,5 partes, 40 min' },
        { value: 'basmati', label: 'Basmati — 1,5 partes, 15 min' },
        { value: 'jazmin', label: 'Jazmín — 1,5 partes, 15 min' },
        { value: 'arborio', label: 'Arborio / Carnaroli — 3 partes, 18 min' },
      ],
    },
    {
      id: 'tipoPasta',
      label: 'Tipo de pasta',
      type: 'select',
      value: 'seca',
      options: [
        { value: 'seca', label: 'Seca (fideos de paquete) — 1 L cada 100 g' },
        { value: 'fresca', label: 'Fresca (tallarines, ñoquis) — 0,8 L cada 100 g' },
        { value: 'rellena', label: 'Rellena (ravioles, sorrentinos) — 1,2 L cada 100 g' },
      ],
    },
  ],
  fineprint: DISCLAIMER_COCINA,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu porción',
    caption:
      'La barra va de una porción de guarnición a una de carga deportiva. El marcador muestra los gramos de seco por adulto que estás usando.',
    bands: [
      { label: 'Guarnición o entrada', from: 40, to: 70, tone: 'neutral' },
      { label: 'Plato principal', from: 70, to: 100, tone: 'good' },
      { label: 'Porción abundante', from: 100, to: 130, tone: 'warn' },
      { label: 'Carga deportiva', from: 130, to: 160, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Todo lo que necesitás para la olla',
  breakdownIntro: 'Gramos de producto seco, agua, sal y tiempo, ya multiplicados por los comensales.',

  faq: [
    {
      q: '¿Cuántos gramos de arroz por persona?',
      a: 'De guarnición, 60 g de arroz crudo por adulto. Como plato principal, 80 g. Para sushi, 75 g. Un chico de hasta 12 años come alrededor de tres cuartos de la porción adulta. Cocinado, el arroz crece entre 2,5 y 3 veces su peso, así que 60 g de crudo son unos 180 g en el plato.',
    },
    {
      q: '¿Cuántos gramos de pasta seca por persona?',
      a: 'La porción estándar de plato principal es 80 g de pasta seca por adulto. De entrada o guarnición alcanzan 60 g; con hambre de verdad, 120 g; y para carga de carbohidratos antes de una carrera, 150 g. Para chicos hasta 12 años se calculan 40 g.',
    },
    {
      q: '¿Cuánta agua lleva el arroz?',
      a: 'Depende del grano, no de la cantidad de gente. El blanco largo fino pide 2 ml de agua por gramo de arroz, el doble carolina 2,2, el parboiled 2,3, el integral 2,5, el basmati y el jazmín solo 1,5, y el arborio de risotto llega a 3 porque el caldo se agrega de a poco.',
    },
    {
      q: '¿Cuánta agua y sal lleva la pasta?',
      a: 'La regla es un litro de agua cada 100 g de pasta seca y 10 g de sal gruesa por litro. La pasta fresca necesita menos, 0,8 litros cada 100 g, y la rellena más, 1,2 litros, para que los ravioles no se rompan entre ellos. La sal va cuando el agua ya rompió el hervor.',
    },
    {
      q: '¿Qué tamaño de olla necesito?',
      a: 'Calculá un 40% más que el agua: para 4 litros de agua, una olla de al menos 6 litros. Si llenás la olla hasta el borde, el almidón hace espuma y rebalsa apenas rompe el hervor.',
    },
    {
      q: '¿Cuánto rinde una taza de arroz?',
      a: 'Una taza de arroz crudo pesa unos 185 g. Alcanza para tres porciones de guarnición o algo más de dos porciones de plato principal, y una vez cocido rinde entre 460 y 555 g según el grano.',
    },
    {
      q: '¿Cuánto pesa la pasta ya cocida?',
      a: 'La pasta seca multiplica su peso por 2,3 al cocinarse. 80 g de fideos secos se convierten en unos 185 g en el plato. Por eso una porción de restaurante que parece enorme suele salir de menos de 100 g de producto seco.',
    },
    {
      q: '¿Cuánta pasta hay que comprar para una mesa grande?',
      a: 'Multiplicá la porción por adulto, sumá 40 g por chico y dividí por 500 redondeando para arriba: eso te da los paquetes. Para diez adultos con porción normal son 800 g, o sea dos paquetes, con sobrante para el día siguiente.',
    },
    {
      q: '¿Los chicos comen la mitad que un adulto?',
      a: 'En pasta, casi: la referencia de porción infantil es 40 g de seco, la mitad de la porción adulta estándar. En arroz la reducción es menor, alrededor de tres cuartos de la porción adulta, porque suele ir mezclado con salsa o verdura.',
    },
    {
      q: '¿Sirve medir con taza en vez de balanza?',
      a: 'Para arroz sí: una taza rasa son unos 185 g y el error es chico. Para la pasta la taza no funciona porque el volumen cambia mucho entre un mostacholi y un tallarín; ahí conviene la balanza o directamente el paquete de 500 g dividido en porciones.',
    },
    {
      q: '¿Por qué el arroz integral necesita más agua y más tiempo?',
      a: 'Porque conserva el salvado, que es una capa que frena la entrada de agua al grano. Pide 2,5 ml de agua por gramo y unos 40 minutos de cocción. Remojarlo media hora antes acorta bastante el tiempo.',
    },
    {
      q: '¿Cuánta pasta necesita un deportista antes de competir?',
      a: 'La referencia de carga es 150 g de pasta seca, que rinden unos 345 g cocidos y aportan alrededor de 525 kcal solo de pasta. Suele repartirse en dos comidas entre 24 y 48 horas antes del esfuerzo, no en un único plato la noche anterior.',
    },
  ],

  sources: [
    {
      name: 'FoodData Central — arroz y pastas, peso crudo y cocido',
      url: 'https://fdc.nal.usda.gov/',
      publisher: 'USDA',
    },
    {
      name: 'Tablas de composición de alimentos y porciones de referencia',
      url: 'https://www.argentina.gob.ar/inta',
      publisher: 'INTA',
    },
    {
      name: 'Guías Alimentarias para la Población Argentina',
      url: 'https://www.argentina.gob.ar/salud/alimentacion-saludable/guias-alimentarias',
      publisher: 'Ministerio de Salud de la Nación',
    },
  ],

  replaces: [
    '/calculadora-porcion-arroz-gramos-personas',
    '/calculadora-arroz-agua-proporcion-coccion',
    '/calculadora-porciones-pasta-seca-persona-hambre',
    '/calculadora-agua-pasta-litros-gramos',
    '/calculadora-porciones-arroz-por-persona-guarnicion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
