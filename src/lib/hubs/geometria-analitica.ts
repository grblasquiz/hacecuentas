import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo trabajo con puntos, rectas y vectores en el plano?"
 * Arquetipo RAMIFICADO: 5 ramas = las 5 cosas que se piden en geometría
 * analítica de secundaria y del CBC. Absorbe 4 URLs (ver `replaces`).
 *
 * Contenido de ESTUDIANTE: el desglose muestra Δx, Δy, los cuadrados, la raíz y
 * la verificación como filas separadas, porque el examen pide el procedimiento
 * y no el número.
 *
 * REUSO DE CAMPOS: los mismos seis campos de coordenadas sirven para los dos
 * puntos A y B y —en la rama de vectores— para las componentes de los vectores
 * A y B. Es el mismo objeto matemático leído de dos maneras, y decirlo así
 * ahorra doce campos.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara su formato: 'unit' para longitudes (u) y grados, 'plain'
 * para coordenadas, pendientes, productos escalares y componentes.
 *
 * PRECISIÓN: todo resultado pasa por un redondeo a entero cuando queda a menos
 * de 1e-10. Sin eso el ángulo entre dos vectores perpendiculares sale 90,00000
 * pero con basura detrás, y la distancia de (0,0) a (3,4) puede dar 4,9999999.
 */
export const hub: HubData = {
  slug: 'matematica/geometria-analitica',
  title: '¿Cómo trabajo con puntos, rectas y vectores en el plano? — Distancia, punto medio, recta y vectores',
  description:
    'Distancia entre dos puntos en 2D y 3D, punto medio, ecuación de la recta por dos puntos o por punto y pendiente, y operaciones con vectores: módulo, suma, producto escalar y ángulo.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de geometría analítica',
  h1: '¿Cómo trabajo con puntos, rectas y vectores en el plano?',
  lede:
    'La geometría analítica traduce figuras a números: dos puntos definen una distancia, un punto medio, una pendiente y una recta, y esos mismos pares de números leídos como vectores dan módulos, sumas y ángulos. Empezamos por la distancia, que es la más pedida; si necesitás la recta o los vectores, lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '5 herramientas adentro', 'Con la fórmula y la sustitución'],

  resultLabel: 'Lo que estabas buscando',

  cases: {
    title: '¿Qué necesitás calcular?',
    intro:
      'Todas las ramas trabajan con los mismos dos juegos de coordenadas: el punto A (x₁, y₁, z₁) y el punto B (x₂, y₂, z₂). En la rama de vectores, esos mismos números se leen como las componentes de los vectores A y B.',
    items: [
      {
        id: 'distancia',
        label: 'Distancia entre dos puntos (2D o 3D)',
        hint: 'Ej.: "de A(0,0) a B(3,4), ¿cuánto hay?"',
        answer: 'Es Pitágoras sobre las diferencias: d = √(Δx² + Δy²), y en el espacio se suma Δz².',
        yes: [
          'Fórmula en el plano: d = √((x₂ − x₁)² + (y₂ − y₁)²)',
          'Fórmula en el espacio: d = √((x₂ − x₁)² + (y₂ − y₁)² + (z₂ − z₁)²)',
          'Si dejás las dos coordenadas z en 0, el cálculo es 2D; si cargás alguna, pasa a 3D solo',
          'Es Pitágoras disfrazado: Δx y Δy son los catetos y la distancia es la hipotenusa',
        ],
        warn: [
          'El orden de los puntos no importa: los deltas van al cuadrado, así que el signo desaparece',
          'No confundas la distancia con la diferencia de coordenadas: son cosas distintas salvo que el segmento sea horizontal o vertical',
          'Las coordenadas pueden ser negativas: cargalas con el signo menos adelante',
        ],
        plazo: 'verificación: de (0,0) a (3,4) la distancia tiene que dar exactamente 5.',
      },
      {
        id: 'punto-medio',
        label: 'Punto medio de un segmento',
        hint: 'Ej.: "el punto justo entre A(2,3) y B(8,7)"',
        answer: 'Promediás las coordenadas: M = ((x₁+x₂)/2, (y₁+y₂)/2).',
        yes: [
          'Fórmula: M = ( (x₁ + x₂) ÷ 2 , (y₁ + y₂) ÷ 2 ), y en 3D se agrega (z₁ + z₂) ÷ 2',
          'Es el promedio coordenada por coordenada: no hay raíces ni cuadrados',
          'El punto medio está exactamente a la mitad de la distancia de cada extremo',
          'También sale la pendiente del segmento, que es Δy ÷ Δx',
        ],
        warn: [
          'Se promedian las coordenadas por separado: la x con la x y la y con la y, nunca cruzadas',
          'Si un extremo tiene coordenada negativa, el promedio puede dar un punto en otro cuadrante: es correcto',
          'El punto medio de un segmento vertical existe igual, aunque la pendiente sea indefinida',
        ],
        plazo: 'verificación: la distancia de A al punto medio tiene que ser la mitad de la distancia A-B.',
      },
      {
        id: 'recta-dos-puntos',
        label: 'Ecuación de la recta que pasa por dos puntos',
        hint: 'Ej.: "la recta por A(1,2) y B(3,8)"',
        answer: 'Sacás la pendiente m = Δy/Δx y después la ordenada al origen b = y₁ − m·x₁.',
        yes: [
          'Paso 1 — pendiente: m = (y₂ − y₁) ÷ (x₂ − x₁)',
          'Paso 2 — ordenada al origen: b = y₁ − m · x₁',
          'Forma explícita: y = m·x + b',
          'Intersecciones: corta al eje Y en (0, b) y al eje X en (−b/m, 0)',
        ],
        warn: [
          'Si los dos puntos tienen la misma x, la recta es VERTICAL: la pendiente es indefinida y la ecuación es x = constante, no se puede escribir como y = mx + b',
          'Pendiente positiva quiere decir que la recta sube de izquierda a derecha; negativa, que baja',
          'Δx en el denominador: si invertís el orden de los puntos, m no cambia, pero si mezclás x con y sí',
        ],
        plazo: 'verificación: reemplazando x₁ en la ecuación tiene que salir exactamente y₁.',
      },
      {
        id: 'recta-punto-pendiente',
        label: 'Ecuación de la recta por un punto y la pendiente',
        hint: 'Ej.: "pasa por (2,5) con pendiente 3"',
        answer: 'De la forma punto-pendiente y − y₁ = m(x − x₁) se despeja b = y₁ − m·x₁.',
        yes: [
          'Forma punto-pendiente: y − y₁ = m · (x − x₁)',
          'Despejando: b = y₁ − m · x₁, y la recta queda y = m·x + b',
          'Cargá el punto en x₁ e y₁, y la pendiente en el campo m',
          'Con m = 0 la recta es horizontal (y = b) y no corta al eje X salvo que b sea 0',
        ],
        warn: [
          'La pendiente es un número, no un ángulo: m = 1 equivale a 45°, y para pasar de m a grados hay que hacer arcotangente',
          'Una pendiente del 10% de una ruta es m = 0,1, no 10',
          'Esta rama no puede describir rectas verticales: no tienen pendiente',
        ],
        plazo: 'verificación: el punto cargado tiene que cumplir la ecuación que sale.',
      },
      {
        id: 'vectores',
        label: 'Operaciones con vectores (módulo, suma, producto escalar, ángulo)',
        hint: 'Ej.: "A = (3,4) y B = (1,2): ¿qué ángulo forman?"',
        answer: 'Módulo por Pitágoras, producto escalar componente a componente y el ángulo por el coseno.',
        yes: [
          'Las componentes del vector A son (x₁, y₁, z₁) y las de B son (x₂, y₂, z₂)',
          'Módulo: |A| = √(x₁² + y₁² + z₁²) — la longitud del vector',
          'Producto escalar (o producto punto): A · B = x₁x₂ + y₁y₂ + z₁z₂',
          'Ángulo entre los dos: cos θ = (A · B) ÷ (|A| · |B|), y θ sale con arcocoseno en grados',
        ],
        warn: [
          'Producto escalar 0 significa vectores PERPENDICULARES: es el test de ortogonalidad más rápido que existe',
          'El producto escalar devuelve un número, no un vector; el producto vectorial (cruz) sí devuelve un vector y sólo existe en 3D',
          'Un vector no tiene posición: sólo dirección, sentido y módulo. Dos flechas paralelas del mismo largo son el mismo vector',
        ],
        plazo: 'verificación: si A · B da 0, el ángulo tiene que dar exactamente 90°.',
      },
    ],
  },

  inputsTitle: 'Cargá tus coordenadas',
  inputsIntro:
    'El punto A son los tres primeros campos y el punto B los tres siguientes. Dejá las dos coordenadas z en 0 para trabajar en el plano: si cargás alguna, el cálculo pasa a tres dimensiones solo.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands el parser
    // convierte "12.5" en 125. Se parsean con H.num(), que acepta la coma
    // decimal rioplatense ("12,5" → 12.5) y el signo menos.
    { id: 'x1', label: 'Punto A — x₁', value: '0', help: 'En la rama de vectores: primera componente del vector A.' },
    { id: 'y1', label: 'Punto A — y₁', value: '0', help: 'En la rama de vectores: segunda componente del vector A.' },
    { id: 'z1', label: 'Punto A — z₁', value: '0', help: 'Dejalo en 0 para trabajar en el plano. Si lo cargás, el cálculo pasa a 3D.' },
    { id: 'x2', label: 'Punto B — x₂', value: '3', help: 'En la rama de vectores: primera componente del vector B.' },
    { id: 'y2', label: 'Punto B — y₂', value: '4', help: 'En la rama de vectores: segunda componente del vector B.' },
    { id: 'z2', label: 'Punto B — z₂', value: '0', help: 'Dejalo en 0 para trabajar en el plano.' },
    { id: 'm', label: 'Pendiente m', value: '3', help: 'Sólo la rama de recta por punto y pendiente. Es un número: m = 1 equivale a 45°, m = 0,1 es una subida del 10%.' },
  ],
  fineprint:
    'Aceptamos coma decimal ("12,5" es doce y medio) y coordenadas negativas. Las distancias salen en "u" (unidades del sistema de ejes): si tu gráfico está en centímetros, son centímetros. Los ángulos entre vectores se devuelven siempre en GRADOS.',

  chart: {
    type: 'bars',
    title: 'Los componentes de la cuenta',
    caption:
      'Las barras muestran Δx, Δy y el resultado uno al lado del otro. Es la forma más rápida de ver que la distancia es la hipotenusa de un triángulo rectángulo cuyos catetos son las diferencias de coordenadas: la barra del resultado tiene que ser más larga que cada delta por separado, pero más corta que la suma de los dos.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero las coordenadas que entraron, después los deltas, después los cuadrados y la raíz, y al final la verificación. Si la verificación no cierra, revisá el orden de las coordenadas.',

  faq: [
    {
      q: '¿Cómo se calcula la distancia entre dos puntos?',
      a: 'Con la fórmula <b>d = √((x₂ − x₁)² + (y₂ − y₁)²)</b>, que no es otra cosa que el teorema de Pitágoras: las diferencias de coordenadas son los catetos y la distancia es la hipotenusa. De (0,0) a (3,4): √(9 + 16) = √25 = <b>5</b>. En el espacio se suma un término más: Δz².',
    },
    {
      q: '¿Importa el orden de los puntos al calcular la distancia?',
      a: 'No. Las diferencias van <b>al cuadrado</b>, así que el signo desaparece: (3 − 0)² y (0 − 3)² dan lo mismo. La distancia de A a B es idéntica a la de B a A. Donde el orden sí importa es en la <b>pendiente</b> conceptualmente y sobre todo en los <b>vectores</b>, donde A − B y B − A apuntan al revés.',
    },
    {
      q: '¿Cómo saco el punto medio de un segmento?',
      a: 'Promediando las coordenadas por separado: <b>M = ((x₁ + x₂)/2, (y₁ + y₂)/2)</b>. Entre (2,3) y (8,7) el punto medio es ((2+8)/2, (3+7)/2) = <b>(5, 5)</b>. No hay raíces ni cuadrados: es sólo un promedio. En 3D se agrega la tercera coordenada con la misma lógica.',
    },
    {
      q: '¿Cómo encuentro la ecuación de la recta que pasa por dos puntos?',
      a: 'Primero la <b>pendiente</b>: m = (y₂ − y₁) ÷ (x₂ − x₁). Después la <b>ordenada al origen</b>: b = y₁ − m·x₁. Con eso la recta queda <b>y = mx + b</b>. Por (1,2) y (3,8): m = 6/2 = 3 y b = 2 − 3·1 = −1, o sea <b>y = 3x − 1</b>. Se verifica reemplazando cualquiera de los dos puntos.',
    },
    {
      q: '¿Qué significa la pendiente de una recta?',
      a: 'Cuánto sube o baja la recta por cada unidad que avanza en x. Con <b>m = 3</b>, por cada paso a la derecha la recta sube 3; con m negativa, baja. <b>m = 0</b> es una recta horizontal y una pendiente indefinida corresponde a una vertical. Ojo con la confusión más común: una pendiente del 10% en una ruta es m = 0,1, no 10.',
    },
    {
      q: '¿Por qué una recta vertical no tiene pendiente?',
      a: 'Porque la pendiente es Δy ÷ Δx y en una recta vertical <b>Δx vale 0</b>: no se puede dividir por cero. Esa recta no se puede escribir como y = mx + b; se escribe <b>x = k</b>, donde k es la abscisa común a todos sus puntos. Es el único caso que la forma explícita no cubre, y por eso existe la forma general Ax + By + C = 0.',
    },
    {
      q: '¿Cuál es la diferencia entre un punto y un vector si los dos son un par de números?',
      a: 'Un <b>punto</b> es una posición: (3,4) es un lugar del plano. Un <b>vector</b> es un desplazamiento: dirección, sentido y módulo, sin posición fija. Dos flechas paralelas del mismo largo son <b>el mismo vector</b> aunque arranquen en lugares distintos. Por eso los mismos números sirven para las dos cosas, pero se operan diferente.',
    },
    {
      q: '¿Cómo se calcula el módulo de un vector?',
      a: 'Con Pitágoras sobre sus componentes: <b>|A| = √(x² + y²)</b> en el plano y <b>√(x² + y² + z²)</b> en el espacio. El vector (3,4) tiene módulo <b>5</b>. El módulo es siempre positivo o cero, y dividir el vector por su módulo da el <b>versor</b>: un vector de largo 1 que conserva la dirección.',
    },
    {
      q: '¿Qué es el producto escalar y para qué sirve?',
      a: 'Es multiplicar componente a componente y sumar: <b>A · B = x₁x₂ + y₁y₂ + z₁z₂</b>. Devuelve un <b>número</b>, no un vector. Sirve para dos cosas: sacar el ángulo entre los vectores (cos θ = A·B ÷ (|A|·|B|)) y para el test de perpendicularidad, porque <b>si el producto escalar da 0 los vectores forman 90°</b>.',
    },
    {
      q: '¿Cómo saco el ángulo entre dos vectores?',
      a: 'Con el producto escalar: <b>cos θ = (A · B) ÷ (|A| · |B|)</b> y después arcocoseno. Si da 0, el ángulo es <b>90°</b>; si da 1, los vectores son <b>paralelos y del mismo sentido</b> (0°); si da −1, apuntan al revés (180°). El resultado siempre cae entre 0° y 180°, porque el ángulo entre vectores no tiene signo.',
    },
    {
      q: '¿Qué diferencia hay entre el producto escalar y el producto vectorial?',
      a: 'El <b>escalar</b> (o punto) devuelve un número y mide cuánto se parecen las direcciones; existe en cualquier dimensión. El <b>vectorial</b> (o cruz) devuelve un <b>vector perpendicular</b> a los dos originales y su módulo es el área del paralelogramo que forman; sólo está definido en 3D. En 2D lo que se calcula es ese módulo suelto, como número.',
    },
    {
      q: '¿Estas fórmulas valen igual en tres dimensiones?',
      a: 'Sí, agregando la coordenada z con la misma lógica: la distancia suma Δz², el punto medio promedia también las z y el producto escalar suma z₁z₂. La única que <b>no</b> se traslada tal cual es la ecuación de la recta: en el espacio una recta ya no se describe con y = mx + b sino con ecuaciones paramétricas.',
    },
  ],

  sources: [
    {
      name: 'Distance — distancia euclidiana entre puntos',
      url: 'https://mathworld.wolfram.com/Distance.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Line — ecuación de la recta y forma general',
      url: 'https://mathworld.wolfram.com/Line.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Dot Product — producto escalar y ángulo entre vectores',
      url: 'https://mathworld.wolfram.com/DotProduct.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Cross Product — producto vectorial en 3D',
      url: 'https://mathworld.wolfram.com/CrossProduct.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Geometría analítica y vectores — curso completo',
      url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86',
      publisher: 'Khan Academy',
    },
    {
      name: 'Recursos de matemática para el nivel secundario',
      url: 'https://www.educ.ar/recursos/buscar?tema=matematica',
      publisher: 'Educ.ar — Ministerio de Educación de la Nación',
    },
  ],

  replaces: [
    '/calculadora-distancia-entre-dos-puntos-2d-3d',
    '/distancia-punto-medio-dos-puntos',
    '/ecuacion-recta-dos-puntos-pendiente',
    '/calculadora-vectores',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
