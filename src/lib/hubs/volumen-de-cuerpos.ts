import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto volumen tiene este cuerpo?"
 * Arquetipo RAMIFICADO: 5 ramas = los 5 cuerpos que se piden en la escuela y
 * que además sirven en la vida real (una caja, un tanque, un embudo, una
 * pelota, un techo a cuatro aguas). Absorbe 5 URLs (ver `replaces`).
 *
 * Contenido de ESTUDIANTE con salida práctica: además del volumen mostramos la
 * CAPACIDAD EN LITROS (1 dm³ = 1 L) y la SUPERFICIE cuando la fórmula la da,
 * porque el volumen te dice cuánto entra y la superficie cuánto material o
 * pintura hace falta.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara su formato: 'unit' con la unidad correcta (cm, cm³, L, m²…)
 * o 'plain' para factores adimensionales.
 *
 * PRECISIÓN: los resultados pasan por un redondeo a entero cuando quedan a
 * menos de 1e-10 (si no, una caja de 10×10×10 puede devolver 999,9999999999).
 */
export const hub: HubData = {
  slug: 'matematica/volumen-de-cuerpos',
  title: '¿Cuánto volumen tiene este cuerpo? — Caja, cilindro, cono, esfera y pirámide',
  description:
    'Volumen, capacidad en litros y superficie de un prisma rectangular, un cilindro, un cono, una esfera y una pirámide. Con la fórmula, la sustitución paso a paso y la conversión a litros.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de geometría del espacio',
  h1: '¿Cuánto volumen tiene este cuerpo?',
  lede:
    'El volumen es cuánto ocupa (o cuánto entra) un cuerpo en el espacio, y casi siempre viene con dos preguntas pegadas: cuántos litros de capacidad son y cuánta superficie hay que cubrir. Empezamos por la caja, que es el caso más frecuente; si tu cuerpo es un cilindro, un cono, una esfera o una pirámide, lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '5 cuerpos adentro', 'Volumen, litros y superficie'],

  resultLabel: 'El volumen del cuerpo',

  cases: {
    title: '¿Qué cuerpo tenés?',
    intro:
      'Elegí el cuerpo y fijate qué datos pide. El campo A es siempre la medida principal (largo, radio o lado de la base) y el campo H la altura. Los campos que sobran quedan ahí sin molestar.',
    items: [
      {
        id: 'caja',
        label: 'Prisma rectangular (caja)',
        hint: 'Ej.: "una caja de 30 × 20 × 15 cm, ¿cuántos litros son?"',
        answer: 'Multiplicás las tres medidas: V = largo × ancho × alto.',
        yes: [
          'Volumen: V = largo · ancho · alto',
          'Capacidad: 1.000 cm³ = 1 litro, y 1 m³ = 1.000 litros',
          'Superficie total (las seis caras): S = 2 · (largo·ancho + largo·alto + ancho·alto)',
          'Diagonal interna: D = √(largo² + ancho² + alto²) — es el objeto más largo que entra de esquina a esquina',
        ],
        warn: [
          'Las tres medidas tienen que estar en la MISMA unidad: si mezclás cm con m el volumen queda mil veces mal',
          'La capacidad real de un recipiente es un poco menor que el volumen exterior por el espesor de las paredes',
          'Para mudanzas y envíos, lo que se paga suele ser el peso volumétrico, no el volumen a secas',
        ],
        plazo: 'verificación: una caja de 10 × 10 × 10 cm da 1.000 cm³, o sea exactamente 1 litro.',
      },
      {
        id: 'cilindro',
        label: 'Cilindro (tanque, lata, caño)',
        hint: 'Ej.: "un tanque de 40 cm de radio y 100 cm de alto"',
        answer: 'Área del círculo por la altura: V = π × r² × h.',
        yes: [
          'Volumen: V = π · r² · h — es el área de la base por la altura, como en cualquier prisma',
          'Superficie total: S = 2 · π · r · (r + h), que son las dos tapas más el lateral desenrollado',
          'El lateral desenrollado es un rectángulo de base 2·π·r (la circunferencia) y altura h',
          'Capacidad: dividí los cm³ por 1.000 para tener litros',
        ],
        warn: [
          'Si te dan el diámetro del tanque, dividilo por 2 antes de cargarlo: la fórmula pide RADIO',
          'Duplicar el radio cuadruplica el volumen; duplicar la altura sólo lo duplica',
          'Un tanque nunca se llena al ras: descontá el volumen sobre la línea de rebalse',
        ],
        plazo: 'verificación: r = 10 cm y h = 10 cm dan 3.141,59 cm³, o sea 3,14 litros.',
      },
      {
        id: 'cono',
        label: 'Cono (embudo, pila de material)',
        hint: 'Ej.: "una pila de arena de 2 m de radio y 1,5 m de alto"',
        answer: 'Es un tercio del cilindro de igual base y altura: V = π × r² × h ÷ 3.',
        yes: [
          'Volumen: V = (1/3) · π · r² · h — exactamente un tercio del cilindro con la misma base y altura',
          'Generatriz (el lado inclinado): g = √(r² + h²), que sale por Pitágoras',
          'Superficie total: S = π · r · (r + g) — la base más la cara lateral',
          'Sirve para calcular pilas de arena, tierra o cereal, y para embudos y conos de tránsito',
        ],
        warn: [
          'La altura es la vertical del vértice a la base, NO la generatriz: si usás la generatriz el volumen te da de más',
          'El tercio no es una aproximación: es exacto, y vale para cualquier pirámide o cono sobre la misma base',
          'En pilas de material real, el ángulo de reposo limita la altura posible para un radio dado',
        ],
        plazo: 'verificación: un cono de r = 3 y h = 4 tiene generatriz exactamente 5 (terna pitagórica).',
      },
      {
        id: 'esfera',
        label: 'Esfera (pelota, tanque esférico, globo)',
        hint: 'Ej.: "una pelota de 11 cm de radio"',
        answer: 'V = 4/3 × π × r³ y la superficie es S = 4 × π × r².',
        yes: [
          'Volumen: V = (4/3) · π · r³ — el radio va al CUBO',
          'Superficie: S = 4 · π · r², que es exactamente cuatro veces el área del círculo del mismo radio',
          'La esfera es el cuerpo que encierra más volumen con menos superficie: por eso las gotas y las burbujas son esféricas',
          'Capacidad: cm³ ÷ 1.000 para tener litros',
        ],
        warn: [
          'Si duplicás el radio, la superficie se multiplica por 4 y el volumen por 8: el cubo crece muchísimo más rápido',
          'Ojo con el dato: las pelotas se venden por circunferencia o por diámetro, casi nunca por radio',
          'Una esfera hueca (una cáscara) no tiene este volumen: hay que restar la esfera interior',
        ],
        plazo: 'verificación: la superficie de la esfera es siempre 3 × volumen ÷ r.',
      },
      {
        id: 'piramide',
        label: 'Pirámide de base rectangular o cuadrada',
        hint: 'Ej.: "un techo a cuatro aguas de 6 × 4 m y 2 m de alto"',
        answer: 'Un tercio del prisma: V = área de la base × altura ÷ 3.',
        yes: [
          'Volumen: V = (área de la base · altura) ÷ 3, igual que el cono',
          'Base cuadrada: dejá el campo B en 0 y se usa el mismo valor del campo A para los dos lados',
          'Apotema lateral (la altura de cada cara triangular): ap = √(altura² + (lado/2)²)',
          'Superficie total: base + las cuatro caras triangulares, cada una con su propia apotema',
        ],
        warn: [
          'La altura es la del vértice al centro de la base, no la de la cara inclinada (esa es la apotema lateral)',
          'Con base rectangular hay DOS apotemas laterales distintas, una por cada par de caras',
          'Para un techo, lo que se compra es superficie de las caras, no el volumen: mirá la fila de superficie lateral',
        ],
        plazo: 'verificación: una pirámide de base 6 × 6 y altura 3 da volumen 36, un tercio del prisma de 108.',
      },
    ],
  },

  inputsTitle: 'Cargá las medidas del cuerpo',
  inputsIntro:
    'Cada cuerpo usa dos o tres campos. Elegí la unidad abajo para que la conversión a litros salga bien: 1.000 cm³ son 1 litro y 1 m³ son 1.000 litros.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands el parser
    // convierte "12.5" en 125. Se parsean con H.num(), que acepta la coma
    // decimal rioplatense ("12,5" → 12.5).
    { id: 'a', label: 'A — medida principal', value: '30', help: 'Caja: el largo. Cilindro, cono y esfera: el RADIO (no el diámetro). Pirámide: el lado de la base.' },
    { id: 'b', label: 'B — segunda medida', value: '20', help: 'Caja: el ancho. Pirámide: el ancho de la base rectangular (dejalo en 0 si la base es cuadrada). Las demás ramas no lo usan.' },
    { id: 'h', label: 'H — altura', value: '15', help: 'Caja: el alto. Cilindro, cono y pirámide: la altura vertical. La esfera no la usa.' },
    {
      id: 'unidad',
      label: 'Unidad de las medidas',
      type: 'select',
      value: 'cm',
      options: [
        { value: 'cm', label: 'Centímetros (cm)' },
        { value: 'm', label: 'Metros (m)' },
      ],
      help: 'Todas las medidas tienen que estar en la misma unidad. De acá sale la conversión a litros.',
    },
  ],
  fineprint:
    'Aceptamos coma decimal: "12,5" se lee como doce y medio. La conversión a litros usa la equivalencia exacta 1 dm³ = 1 litro: 1.000 cm³ = 1 L y 1 m³ = 1.000 L. Las medidas tienen que estar todas en la unidad elegida.',

  chart: {
    type: 'bars',
    title: 'Volumen, capacidad y superficie',
    caption:
      'Las barras comparan el volumen con la superficie del mismo cuerpo. Es el contraste que conviene mirar antes de comprar material: el volumen manda cuando se trata de qué entra adentro (litros, kilos, metros cúbicos de hormigón) y la superficie manda cuando se trata de qué cubre por afuera (chapa, pintura, aislante).',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero las medidas que entraron, después la sustitución en la fórmula, después el volumen y al final la capacidad en litros y la superficie. Si el número te suena raro, revisá que las tres medidas estén en la misma unidad.',

  faq: [
    {
      q: '¿Cómo se calcula el volumen de una caja?',
      a: 'Se multiplican las tres medidas: <b>V = largo × ancho × alto</b>. Una caja de 30 × 20 × 15 cm tiene 9.000 cm³. Como 1.000 cm³ son un litro, esa caja son <b>9 litros</b> de capacidad. Las tres medidas tienen que estar en la misma unidad, si no el resultado se va por mil o por un millón.',
    },
    {
      q: '¿Cuántos litros son un metro cúbico?',
      a: '<b>1.000 litros</b>. La cadena de conversión es simple: 1 m³ = 1.000 dm³, y un decímetro cúbico es exactamente un litro. De ahí sale también que <b>1.000 cm³ = 1 litro</b>: un cubo de 10 × 10 × 10 cm contiene un litro justo. Es la equivalencia que conviene tener memorizada.',
    },
    {
      q: '¿Cómo calculo la capacidad de un tanque cilíndrico?',
      a: 'Volumen = <b>π · r² · h</b> y después se pasa a litros. Un tanque de 40 cm de radio y 100 cm de alto tiene π × 1.600 × 100 ≈ 502.655 cm³, o sea unos <b>502 litros</b>. Si te dan el diámetro (80 cm en ese ejemplo), dividilo por dos antes: la fórmula pide radio y meter el diámetro cuadruplica el resultado.',
    },
    {
      q: '¿Por qué el volumen del cono es un tercio del cilindro?',
      a: 'Porque es un resultado geométrico exacto, no una aproximación: <b>todo cuerpo que termina en punta sobre una base plana tiene un tercio del volumen del prisma o cilindro de igual base y altura</b>. Vale para el cono y para cualquier pirámide. Se puede comprobar llenando un cono con agua y volcándolo en un cilindro del mismo radio y altura: hacen falta exactamente tres.',
    },
    {
      q: '¿Cuál es la fórmula del volumen y la superficie de una esfera?',
      a: 'Volumen <b>V = (4/3) · π · r³</b> y superficie <b>S = 4 · π · r²</b>. Con radio 11 cm: volumen ≈ 5.575 cm³ (unos 5,6 litros) y superficie ≈ 1.520 cm². Hay una relación linda entre las dos: la superficie es siempre <b>3 × volumen ÷ radio</b>.',
    },
    {
      q: 'Si duplico el radio de una esfera, ¿qué pasa con el volumen?',
      a: 'Se multiplica por <b>8</b>, porque el radio está elevado al cubo (2³ = 8). La superficie, en cambio, se multiplica sólo por 4 (2² = 4) y el perímetro de su círculo máximo apenas por 2. Es la razón por la que una pizza grande rinde muchísimo más que dos chicas: lo que crece al cuadrado o al cubo gana siempre.',
    },
    {
      q: '¿Qué diferencia hay entre la altura de una pirámide y la apotema lateral?',
      a: 'La <b>altura</b> es la vertical del vértice al centro de la base y es la que va en la fórmula del volumen. La <b>apotema lateral</b> es la altura de cada cara triangular, medida sobre la cara inclinada, y es la que se usa para la superficie: <b>ap = √(altura² + (lado/2)²)</b>. La apotema siempre es más larga que la altura, así que usar una por la otra infla el volumen.',
    },
    {
      q: '¿Cómo calculo la superficie de un cilindro para saber cuánta chapa necesito?',
      a: 'La superficie total es <b>S = 2 · π · r · (r + h)</b>: las dos tapas (2·π·r²) más el lateral (2·π·r·h). Si el recipiente no lleva tapa, restá un círculo: π·r². El lateral, desenrollado, es un rectángulo de base igual a la circunferencia (2·π·r) y altura h — por eso conviene comprar la chapa por ese ancho.',
    },
    {
      q: '¿Por qué el volumen y la capacidad no dan exactamente lo mismo en la práctica?',
      a: 'Porque el volumen que calculás con las medidas exteriores incluye el <b>espesor de las paredes</b>, y la capacidad útil es la del hueco interior. En un tanque de plástico de pared gruesa la diferencia puede ser de varios litros. Para capacidad real, medí por dentro; para material o transporte, medí por fuera.',
    },
    {
      q: '¿Sirve esta cuenta para calcular cuánto hormigón necesito?',
      a: 'Sí para el volumen geométrico: una losa es un prisma rectangular y una base de columna redonda es un cilindro. Pero al resultado siempre se le suma un <b>margen de desperdicio</b> (habitualmente entre 5% y 10%) por pérdidas, irregularidades del terreno y encofrado. El volumen es el piso, no el total a comprar.',
    },
    {
      q: '¿Qué cuerpo aprovecha mejor el material?',
      a: 'La <b>esfera</b>: es la forma que encierra más volumen con menos superficie, y por eso las gotas de agua, las burbujas y los tanques de gas a presión son esféricos. Entre los cuerpos rectos, el cubo es el prisma más eficiente. Cuanto más alargada o más chata es una forma, más superficie necesita para el mismo volumen.',
    },
    {
      q: '¿En qué unidades quedan los resultados?',
      a: 'En la que hayas elegido: si cargás centímetros, el volumen sale en <b>cm³</b> y la superficie en cm²; si cargás metros, en m³ y m². Los <b>litros</b> se calculan siempre, con la equivalencia 1.000 cm³ = 1 L o 1 m³ = 1.000 L según corresponda.',
    },
  ],

  sources: [
    {
      name: 'Cylinder — volumen y superficie',
      url: 'https://mathworld.wolfram.com/Cylinder.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Cone — volumen, generatriz y superficie',
      url: 'https://mathworld.wolfram.com/Cone.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Sphere — volumen y área de la superficie',
      url: 'https://mathworld.wolfram.com/Sphere.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Pyramid — volumen y apotema lateral',
      url: 'https://mathworld.wolfram.com/Pyramid.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'The International System of Units (SI) — litro y decímetro cúbico',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'BIPM — Bureau International des Poids et Mesures',
    },
    {
      name: 'Volumen de cuerpos — curso de geometría del espacio',
      url: 'https://www.khanacademy.org/math/geometry',
      publisher: 'Khan Academy',
    },
  ],

  replaces: [
    '/volumen-prisma-rectangular-caja',
    '/calculadora-volumen-cilindro-radio-altura',
    '/calculadora-volumen-cono-radio-altura',
    '/calculadora-volumen-superficie-esfera-radio',
    '/volumen-piramide-base-altura',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
