import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo resuelvo este triángulo?"
 * Arquetipo RAMIFICADO: 9 ramas = las 9 formas en que un triángulo (o un
 * ángulo) llega a la carpeta. Absorbe 10 URLs (ver `replaces`).
 *
 * Es contenido de ESTUDIANTE: el valor está en ver la fórmula, la sustitución,
 * el resultado y la verificación como filas separadas. Por eso el desglose
 * muestra a², b², la suma y recién después la raíz, en vez de tirar el número.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara su formato: 'unit' para longitudes (u), superficies (u²),
 * grados, radianes, gradianes, cm y pulgadas; 'plain' para razones
 * trigonométricas y cuadrados, que son adimensionales.
 *
 * ÁNGULOS: la unidad se declara SIEMPRE, en el rótulo de la fila y en la
 * unidad. Salvo la rama de conversión y la de razones (donde el usuario elige),
 * todos los ángulos de esta página son GRADOS.
 *
 * PRECISIÓN: todo resultado pasa por un redondeo a entero cuando queda a menos
 * de 1e-10. Sin eso, sen(180°) devuelve 1,2246e-16 en vez de 0 y la hipotenusa
 * de 3-4-5 puede salir 4,999999999999999.
 */
export const hub: HubData = {
  slug: 'matematica/triangulos-y-trigonometria',
  title: '¿Cómo resuelvo este triángulo? — Pitágoras, trigonometría, ley de senos y cosenos',
  description:
    'Pitágoras, seno, coseno y tangente, resolución de triángulos rectángulos, ley de senos, ley de cosenos, teorema de Tales, diagonal de un rectángulo o caja y conversión de grados a radianes y gradianes.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de trigonometría',
  h1: '¿Cómo resuelvo este triángulo?',
  lede:
    'Resolver un triángulo es encontrar los lados y los ángulos que faltan a partir de los que tenés. Qué herramienta usar depende de un solo dato: si el triángulo es rectángulo alcanza con Pitágoras o con seno, coseno y tangente; si no lo es, hay que ir a la ley de senos o a la ley de cosenos.',
  stamps: ['Actualizado 27-07-2026', '9 herramientas adentro', 'Con la fórmula y la sustitución'],

  resultLabel: 'Lo que estabas buscando',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Elegí la herramienta que corresponde a tus datos. La pregunta que ordena todo es: ¿tu triángulo tiene un ángulo de 90°? Si sí, las primeras cuatro ramas alcanzan; si no, andá a las leyes de senos y cosenos.',
    items: [
      {
        id: 'pit-hipotenusa',
        label: 'Pitágoras: me faltan la hipotenusa',
        hint: 'Ej.: "catetos de 3 y 4, ¿cuánto mide la hipotenusa?"',
        answer: 'Sumás los cuadrados de los dos catetos y sacás la raíz: c = √(a² + b²).',
        yes: [
          'Fórmula: c² = a² + b²  →  c = √(a² + b²)',
          'Paso 1: elevar cada cateto al cuadrado. Paso 2: sumarlos. Paso 3: raíz cuadrada',
          'Sólo vale si el ángulo entre los dos catetos es de 90°',
          'La hipotenusa es siempre el lado más largo y el que está enfrente del ángulo recto',
        ],
        warn: [
          'No es (a + b)²: los cuadrados se suman por separado, no se suma primero',
          'Si el triángulo no es rectángulo, Pitágoras no aplica: usá la ley de cosenos',
          'Las ternas 3-4-5, 5-12-13, 8-15-17 y 7-24-25 dan resultados enteros: sirven para chequear a ojo',
        ],
        plazo: 'verificación: con catetos 3 y 4 la hipotenusa tiene que dar exactamente 5.',
      },
      {
        id: 'pit-cateto',
        label: 'Pitágoras: me falta un cateto',
        hint: 'Ej.: "hipotenusa 5 y un cateto 3, ¿cuánto mide el otro?"',
        answer: 'Restás el cuadrado del cateto conocido al de la hipotenusa: b = √(c² − a²).',
        yes: [
          'Fórmula despejada: b² = c² − a²  →  b = √(c² − a²)',
          'Cargá la hipotenusa en el campo C y el cateto que conocés en el campo A',
          'Acá se RESTA, no se suma: es el cambio que confunde',
          'También sale el área (a·b/2) y los dos ángulos agudos',
        ],
        warn: [
          'La hipotenusa tiene que ser mayor que el cateto: si no, no hay triángulo rectángulo posible',
          'Si te da la raíz de un número negativo, cargaste la hipotenusa en el lugar del cateto',
          'La hipotenusa siempre va enfrente del ángulo de 90°: si dudás, es el lado más largo',
        ],
        plazo: 'verificación: hipotenusa 5 y cateto 3 tienen que dar cateto 4.',
      },
      {
        id: 'razones',
        label: 'Seno, coseno y tangente de un ángulo',
        hint: 'Ej.: "¿cuánto vale el seno de 30°?"',
        answer: 'Devuelve las seis razones del ángulo y el cuadrante donde cae.',
        yes: [
          'Seno, coseno y tangente del ángulo, más sus recíprocas: cosecante, secante y cotangente',
          'Podés cargar el ángulo en GRADOS o en RADIANES: se elige en el desplegable de unidad',
          'Los valores notables salen exactos: sen 30° = 0,5 · cos 60° = 0,5 · sen 180° = 0 · cos 90° = 0',
          'Identidad de control: sen² + cos² siempre da 1, sea cual sea el ángulo',
        ],
        warn: [
          'La tangente es indefinida en 90° y 270°, donde el coseno vale 0 (hay una asíntota vertical)',
          'La cotangente, la cosecante y la secante también se indefinen cuando su denominador da 0',
          'Grados y radianes no son intercambiables: sen(30) en radianes no es sen(30°). Chequeá el desplegable',
        ],
        plazo: 'verificación: sen 30° = 0,5 · cos 60° = 0,5 · tan 45° = 1.',
      },
      {
        id: 'rectangulo-trig',
        label: 'Resolver un triángulo rectángulo con trigonometría',
        hint: 'Ej.: "hipotenusa 10 y un ángulo de 30°, ¿cuánto miden los catetos?"',
        answer: 'Cateto opuesto = hipotenusa × sen(ángulo); cateto adyacente = hipotenusa × cos(ángulo).',
        yes: [
          'Cargá la hipotenusa en el campo C y el ángulo agudo (en grados) en el campo de ángulo',
          'Cateto opuesto al ángulo: a = c · sen(ángulo)',
          'Cateto adyacente al ángulo: b = c · cos(ángulo)',
          'El otro ángulo agudo es 90° − el que cargaste: en un rectángulo los dos agudos suman 90°',
        ],
        warn: [
          'El ángulo tiene que ser agudo (entre 0° y 90°): el de 90° ya es el recto',
          'Opuesto y adyacente son relativos AL ÁNGULO que elegiste: si cambiás de ángulo se dan vuelta',
          'La regla mnemotécnica es SOH-CAH-TOA: Seno = Opuesto/Hipotenusa, Coseno = Adyacente/Hipotenusa, Tangente = Opuesto/Adyacente',
        ],
        plazo: 'verificación: con hipotenusa 10 y ángulo 30°, el cateto opuesto tiene que dar exactamente 5.',
      },
      {
        id: 'ley-senos',
        label: 'Ley de senos (dos ángulos y un lado)',
        hint: 'Ej.: "ángulos de 30° y 45°, con el lado a = 10"',
        answer: 'Los lados son proporcionales a los senos de sus ángulos opuestos: a/sen A = b/sen B = c/sen C.',
        yes: [
          'Cargá el ángulo A (campo de ángulo), el ángulo B (segundo ángulo) y el lado a (campo A)',
          'Fórmula: a ÷ sen A = b ÷ sen B = c ÷ sen C — las tres razones dan el mismo número',
          'El tercer ángulo sale solo: C = 180° − A − B',
          'Después b = a · sen B ÷ sen A y c = a · sen C ÷ sen A',
        ],
        warn: [
          'Los dos ángulos tienen que sumar menos de 180°: si no, el tercero no existe',
          'El lado que cargás tiene que ser el OPUESTO al ángulo A, no cualquiera',
          'Con dos lados y un ángulo no comprendido la ley de senos puede dar dos triángulos distintos (el caso ambiguo LLA): esta rama evita ese caso pidiendo dos ángulos',
        ],
        plazo: 'verificación: la razón lado ÷ seno del ángulo opuesto tiene que dar igual para los tres lados.',
      },
      {
        id: 'ley-cosenos',
        label: 'Ley de cosenos (tres lados, o dos lados y el ángulo entre ellos)',
        hint: 'Ej.: "lados 3, 4 y 5" o "lados 3 y 4 con 60° entre ellos"',
        answer: 'c² = a² + b² − 2ab·cos C: es Pitágoras con un término de corrección por el ángulo.',
        yes: [
          'Con los TRES lados (campos A, B y C) resuelve los tres ángulos despejando el coseno',
          'Con dos lados y el ángulo entre ellos: dejá el campo C en 0, cargá A y B y el ángulo comprendido',
          'Fórmula directa: c² = a² + b² − 2·a·b·cos C',
          'Fórmula despejada: cos A = (b² + c² − a²) ÷ (2·b·c)',
        ],
        warn: [
          'Los tres lados tienen que cumplir la desigualdad triangular: cada uno menor que la suma de los otros dos',
          'Si el ángulo comprendido es de 90°, el coseno vale 0 y la fórmula se reduce a Pitágoras',
          'Un coseno negativo significa ángulo obtuso: el triángulo tiene un ángulo de más de 90°',
        ],
        plazo: 'verificación: con lados 3, 4 y 5 el ángulo mayor tiene que dar exactamente 90°.',
      },
      {
        id: 'tales',
        label: 'Teorema de Tales y triángulos semejantes',
        hint: 'Ej.: "un poste da 8 m de sombra y una persona de 1,70 m da 1,20 m"',
        answer: 'La proporción se mantiene: si a/b = c/x, entonces x = b × c ÷ a.',
        yes: [
          'Planteo: a es a b como c es a x  →  a/b = c/x  →  x = b · c ÷ a',
          'Para la altura por sombra: cargá en A la sombra de la persona, en B su altura y en C la sombra del objeto',
          'Dos triángulos son semejantes cuando tienen los mismos ángulos: los lados quedan proporcionales',
          'La razón de semejanza (a ÷ b) es la misma en todos los pares de lados correspondientes',
        ],
        warn: [
          'En el caso de la sombra, las dos sombras tienen que medirse a la misma hora: si no, el sol cambió de ángulo y la proporción no vale',
          'Semejante no es igual: los ángulos coinciden pero los tamaños no',
          'Si el campo A vale 0 no hay resultado: estarías dividiendo por cero',
        ],
        plazo: 'verificación: c ÷ x tiene que dar lo mismo que a ÷ b.',
      },
      {
        id: 'diagonal',
        label: 'Diagonal de un rectángulo o una caja (y pulgadas de TV)',
        hint: 'Ej.: "¿qué TV entra en un hueco de 120 × 70 cm?"',
        answer: 'La diagonal es Pitágoras en 2D o en 3D, y una pantalla se mide justamente por su diagonal.',
        yes: [
          'Diagonal de un rectángulo: d = √(a² + b²) — es lo más largo que pasa por esa abertura girándolo',
          'Diagonal interna de una caja: d = √(a² + b² + c²), cargando el alto en el campo C',
          'Las pantallas se miden por la diagonal en pulgadas: 1 pulgada = 2,54 cm',
          'Con formato 16:9, la diagonal en unidades de proporción es √(16² + 9²) = √337 ≈ 18,36',
        ],
        warn: [
          'Las pulgadas de una TV son del PANEL: sumale entre 1 y 3 cm por lado de marco antes de encajarla',
          'Dejá 2 a 5 cm de margen de ventilación: la TV máxima teórica nunca es la que conviene comprar',
          'Los monitores ultrapanorámicos no son 16:9 y estas proporciones no les aplican',
        ],
        plazo: 'verificación: un rectángulo de 3 × 4 tiene que dar diagonal exactamente 5.',
      },
      {
        id: 'conversion',
        label: 'Convertir un ángulo: grados ↔ radianes ↔ gradianes',
        hint: 'Ej.: "¿cuántos radianes son 180°?"',
        answer: 'Media vuelta son 180 grados = π radianes = 200 gradianes.',
        yes: [
          'Elegí en el desplegable la unidad en la que está TU dato y cargalo en el campo de ángulo',
          'Grados a radianes: multiplicás por π ÷ 180',
          'Radianes a grados: multiplicás por 180 ÷ π (un radián son unos 57,2958°)',
          'Gradianes (o grados centesimales): la vuelta completa son 400 grad, así que 90° = 100 grad',
        ],
        warn: [
          'Las calculadoras científicas tienen modo DEG, RAD y GRAD: el error más común es tenerla en el modo equivocado',
          'En matemática superior y en programación, sin() y cos() esperan RADIANES, no grados',
          'El radián no es una unidad arbitraria: es el ángulo cuyo arco mide lo mismo que el radio',
        ],
        plazo: 'anclajes para memorizar: 180° = π rad = 200 grad · 90° = π/2 rad = 100 grad · 360° = 2π rad = 400 grad.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Según la rama que elijas se usan dos, tres o cuatro campos. Los que sobran quedan ahí sin molestar: el desglose te dice cuáles entraron en la cuenta.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands el parser
    // convierte "12.5" en 125. Se parsean con H.num(), que acepta la coma
    // decimal rioplatense ("12,5" → 12.5).
    { id: 'a', label: 'A — primer lado', value: '3', help: 'Pitágoras: un cateto. Ley de senos: el lado a (opuesto al ángulo A). Ley de cosenos: el lado a. Tales: el primer segmento. Diagonal: el ancho.' },
    { id: 'b', label: 'B — segundo lado', value: '4', help: 'Pitágoras (hipotenusa): el otro cateto. Ley de cosenos: el lado b. Tales: el segundo segmento. Diagonal: el alto del rectángulo o el hueco.' },
    { id: 'c', label: 'C — hipotenusa o tercer lado', value: '5', help: 'Pitágoras (cateto) y trigonometría: la hipotenusa. Ley de cosenos: el tercer lado (dejalo en 0 para el modo dos lados + ángulo). Tales: el tercer segmento. Diagonal: la profundidad de la caja.' },
    { id: 'ang', label: 'Ángulo (valor)', value: '30', help: 'Trigonometría: el ángulo agudo. Ley de senos: el ángulo A. Ley de cosenos: el ángulo entre a y b. Conversión y razones: el ángulo a convertir. La unidad se elige abajo.' },
    { id: 'ang2', label: 'Segundo ángulo (en grados)', value: '45', help: 'Sólo ley de senos: el ángulo B. Siempre en grados.' },
    {
      id: 'unidadAng',
      label: 'Unidad del ángulo',
      type: 'select',
      value: 'grados',
      options: [
        { value: 'grados', label: 'Grados (°) — la vuelta son 360' },
        { value: 'radianes', label: 'Radianes (rad) — la vuelta son 2π' },
        { value: 'gradianes', label: 'Gradianes (grad) — la vuelta son 400' },
      ],
      help: 'Sólo la usan las ramas de razones trigonométricas y de conversión. En las demás ramas el ángulo se lee siempre en GRADOS.',
    },
    { id: 'pulg', label: 'Pulgadas de la pantalla', value: '55', help: 'Sólo la rama de diagonal: si cargás las pulgadas de una TV 16:9, te decimos cuánto mide su panel en centímetros. Dejalo en 0 si no lo necesitás.' },
  ],
  fineprint:
    'Aceptamos coma decimal: "12,5" se lee como doce y medio. Salvo en las ramas de razones trigonométricas y de conversión —donde elegís la unidad—, todos los ángulos de esta página se leen en GRADOS. Los resultados que quedan a menos de una billonésima de un entero se redondean: por eso el seno de 180° da 0 y no 1,2e-16.',

  chart: {
    type: 'bars',
    title: 'Los lados y los ángulos, comparados',
    caption:
      'Las barras muestran las magnitudes que salieron de la cuenta, una al lado de la otra. En un triángulo bien resuelto el orden manda: al ángulo más grande siempre le corresponde el lado más largo. Si en el gráfico ves un lado corto enfrentado a un ángulo grande, algún dato entró en el campo equivocado.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero los datos que entraron, después los cuadrados o los senos, después la operación y al final el resultado con su verificación. Si la verificación no cierra, revisá qué dato pusiste en cada campo.',

  faq: [
    {
      q: '¿Cómo se aplica el teorema de Pitágoras?',
      a: 'En un triángulo rectángulo, <b>el cuadrado de la hipotenusa es la suma de los cuadrados de los catetos</b>: c² = a² + b². Con catetos 3 y 4: 9 + 16 = 25, y la raíz de 25 es <b>5</b>. Para despejar un cateto se resta: b = √(c² − a²). El error más común es hacer (a+b)² en vez de a² + b².',
    },
    {
      q: '¿Cuándo no puedo usar Pitágoras?',
      a: 'Cuando el triángulo <b>no es rectángulo</b>. Si ningún ángulo mide 90°, la relación deja de valer y hay que ir a la <b>ley de cosenos</b>, que es la versión general: c² = a² + b² − 2ab·cos C. Fijate que si C = 90°, el coseno vale 0 y la ley de cosenos se convierte exactamente en Pitágoras.',
    },
    {
      q: '¿Qué son el seno, el coseno y la tangente?',
      a: 'Son razones entre los lados de un triángulo rectángulo, vistas desde uno de sus ángulos agudos. La regla es <b>SOH-CAH-TOA</b>: <b>seno</b> = opuesto ÷ hipotenusa, <b>coseno</b> = adyacente ÷ hipotenusa y <b>tangente</b> = opuesto ÷ adyacente. Son razones, así que no tienen unidad: sen 30° = 0,5 significa que el cateto opuesto es la mitad de la hipotenusa.',
    },
    {
      q: '¿Por qué la tangente de 90° es indefinida?',
      a: 'Porque la tangente es seno dividido coseno, y en 90° el <b>coseno vale exactamente 0</b>: no se puede dividir por cero. Gráficamente, la función tangente tiene una asíntota vertical en 90° y en 270°, donde se dispara a infinito. Lo mismo pasa con la cotangente en 0° y 180°, donde el seno se anula.',
    },
    {
      q: '¿Cuál es la diferencia entre la ley de senos y la ley de cosenos?',
      a: 'La <b>ley de senos</b> (a/sen A = b/sen B = c/sen C) se usa cuando conocés un lado con su ángulo opuesto: sirve para ALA, AAL y el caso LLA. La <b>ley de cosenos</b> (c² = a² + b² − 2ab·cos C) se usa cuando tenés los <b>tres lados</b> (LLL) o <b>dos lados y el ángulo entre ellos</b> (LAL), que son justo los casos donde la ley de senos no arranca.',
    },
    {
      q: '¿Qué es el caso ambiguo de la ley de senos?',
      a: 'Es la situación LLA: dos lados y un ángulo que <b>no está entre ellos</b>. Ahí puede haber dos triángulos distintos que cumplen los mismos datos, uno con ángulo agudo y otro con el obtuso suplementario. Por eso esta calculadora pide dos ángulos y un lado en la rama de ley de senos: así el triángulo queda determinado sin ambigüedad.',
    },
    {
      q: '¿Qué dice el teorema de Tales?',
      a: 'Que si varias rectas paralelas cortan a dos transversales, los <b>segmentos correspondientes quedan proporcionales</b>: a/b = c/x. De ahí sale el cuarto proporcional x = b·c ÷ a. Su aplicación más conocida es medir la altura de algo alto por su sombra: si una persona de 1,70 m proyecta 1,20 m y el poste proyecta 8 m, el poste mide 1,70 × 8 ÷ 1,20 ≈ <b>11,33 m</b>.',
    },
    {
      q: '¿Cuándo dos triángulos son semejantes?',
      a: 'Cuando tienen los <b>tres ángulos iguales</b> — y con que coincidan dos alcanza, porque el tercero sale solo. En ese caso los lados correspondientes quedan proporcionales y todos guardan la misma razón de semejanza. Semejante no es igual: los ángulos coinciden pero los tamaños no. Si además los lados son iguales, los triángulos son congruentes.',
    },
    {
      q: '¿Cómo sé qué TV entra en mi mueble?',
      a: 'Una pantalla se mide por su <b>diagonal en pulgadas</b> (1" = 2,54 cm) y las TV modernas son 16:9. Con el ancho del hueco: diagonal máxima = ancho × √337 ÷ 16; con el alto: alto × √337 ÷ 9. Manda la más chica de las dos, y a ese valor conviene <b>restarle unos centímetros</b> por el marco y la ventilación antes de elegir el tamaño comercial.',
    },
    {
      q: '¿Cuántos radianes son 180 grados?',
      a: 'Exactamente <b>π radianes</b> (unos 3,1416). De ahí salen todas las conversiones: grados × π ÷ 180 da radianes, y radianes × 180 ÷ π da grados. Un radián son unos <b>57,2958°</b>. Los anclajes que conviene memorizar son 90° = π/2, 180° = π y 360° = 2π.',
    },
    {
      q: '¿Qué son los gradianes y para qué se usan?',
      a: 'El <b>gradián</b> (o grado centesimal) divide la vuelta completa en <b>400 partes</b> en vez de 360, así que el ángulo recto mide exactos 100 grad. Se usa sobre todo en <b>topografía y agrimensura</b>, porque los cálculos de pendiente quedan más redondos. Es la "G" o "GRAD" del modo de tu calculadora científica.',
    },
    {
      q: '¿Por qué mi calculadora me da un resultado raro con seno y coseno?',
      a: 'Casi siempre es el <b>modo de ángulo</b>: la calculadora está en RAD y vos cargaste grados, o al revés. sen(30) en radianes da −0,988, no 0,5. Antes de dudar de la cuenta, chequeá que el modo (DEG / RAD / GRAD) coincida con la unidad de tu dato. En esta página la unidad la elegís vos en el desplegable.',
    },
  ],

  sources: [
    {
      name: 'Pythagorean Theorem',
      url: 'https://mathworld.wolfram.com/PythagoreanTheorem.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Law of Cosines',
      url: 'https://mathworld.wolfram.com/LawofCosines.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Law of Sines — y el caso ambiguo',
      url: 'https://mathworld.wolfram.com/LawofSines.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Trigonometric Functions — definiciones y valores notables',
      url: 'https://mathworld.wolfram.com/TrigonometricFunctions.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'The International System of Units (SI) — el radián como unidad derivada',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'BIPM — Bureau International des Poids et Mesures',
    },
    {
      name: 'Trigonometría — curso completo',
      url: 'https://www.khanacademy.org/math/trigonometry',
      publisher: 'Khan Academy',
    },
    {
      name: 'Recursos de matemática para el nivel secundario',
      url: 'https://www.educ.ar/recursos/buscar?tema=matematica',
      publisher: 'Educ.ar — Ministerio de Educación de la Nación',
    },
  ],

  replaces: [
    '/calculadora-teorema-pitagoras-hipotenusa-cateto',
    '/seno-coseno-tangente-angulo',
    '/calculadora-trigonometria-seno-coseno-tangente',
    '/ley-senos-cosenos-resolver-triangulo',
    '/calculadora-teorema-tales-proporcionalidad-segmentos',
    '/teorema-tales-triangulos-semejantes',
    '/diagonal-rectangulo-caja-tv',
    '/calculadora-conversion-grados-radianes-gradianes',
    '/calculadora-conversion-radianes-grados-angulo',
    '/calculadora-conversor-radianes-a-grados',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
