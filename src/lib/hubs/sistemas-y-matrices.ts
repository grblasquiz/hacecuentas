import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo resuelvo este sistema de ecuaciones?"
 * Arquetipo RAMIFICADO: 5 ramas que cubren el álgebra lineal de secundario y
 * primer año. Absorbe 5 URLs (ver `replaces`).
 *
 * Contenido de ESTUDIANTE: lo que importa es el PROCEDIMIENTO. Cada rama
 * muestra el planteo, los determinantes intermedios, cada cociente y la
 * verificación sustituyendo en las ecuaciones originales.
 *
 * El hilo que une las 5 ramas es el DETERMINANTE: si es distinto de cero hay
 * solución única; si es cero, el sistema es incompatible (rectas o planos
 * paralelos) o indeterminado (infinitas soluciones), y la matriz no tiene
 * inversa. Ese caso está explicado en cada rama donde aplica.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara format:'plain' explícito.
 *
 * PRECISIÓN: todo valor a menos de 1e-10 de un entero se redondea al entero
 * (evita "1,9999999999" y "-0" en la eliminación de Gauss-Jordan).
 */
export const hub: HubData = {
  slug: 'matematica/sistemas-y-matrices',
  title: '¿Cómo resuelvo este sistema de ecuaciones? — Cramer, Gauss-Jordan y matrices',
  description:
    'Sistemas 2×2 por Cramer, sistemas 3×3, eliminación de Gauss-Jordan paso a paso y determinante e inversa de matrices 2×2 y 3×3. Con los determinantes intermedios, la verificación y qué pasa cuando el determinante da cero.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de matemática',
  h1: '¿Cómo resuelvo este sistema de ecuaciones?',
  lede:
    'Empezamos por el sistema de dos ecuaciones con dos incógnitas resuelto por la regla de Cramer, que es el caso más pedido. Si tenés tres incógnitas, si te piden la eliminación de Gauss-Jordan paso a paso o si lo que necesitás es el determinante y la inversa de una matriz, lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '5 métodos adentro', 'Con la verificación incluida'],

  resultLabel: 'La solución del sistema',

  cases: {
    title: '¿Qué tenés que resolver?',
    intro:
      'Elegí el método o el tamaño del sistema. En todas las ramas el determinante es la pieza que decide: si da cero, no hay solución única y la matriz no tiene inversa.',
    items: [
      {
        id: 'cramer2',
        label: 'Sistema 2×2 por la regla de Cramer',
        hint: 'Ej.: "2x + 3y = 8" y "x − y = −1"',
        answer: 'Calculás tres determinantes: el del sistema, el de x y el de y. Después dividís.',
        yes: [
          'Planteo: ax + by = c y dx + ey = f, con las incógnitas alineadas en columnas',
          'Paso 1: el determinante del sistema es D = a·e − b·d',
          'Paso 2: Dx sale de reemplazar la columna de las x por los términos independientes: Dx = c·e − b·f',
          'Paso 3: Dy reemplaza la columna de las y: Dy = a·f − c·d',
          'Paso 4: x = Dx ÷ D e y = Dy ÷ D',
        ],
        warn: [
          'Si D = 0 la regla de Cramer NO se puede aplicar: no hay solución única',
          'Con D = 0 y ecuaciones proporcionales, las rectas son la misma y hay infinitas soluciones (compatible indeterminado)',
          'Con D = 0 y ecuaciones no proporcionales, las rectas son paralelas y no hay ninguna solución (incompatible)',
          'Ordená bien: los términos independientes van solos del lado derecho del igual antes de leer c y f',
        ],
        plazo: 'chequeo: sustituí el par (x, y) en las dos ecuaciones originales. Las dos tienen que cerrar.',
      },
      {
        id: 'sistema3',
        label: 'Sistema 3×3 (tres ecuaciones, tres incógnitas)',
        hint: 'Ej.: matriz ampliada "2 1 -1 8; -3 -1 2 -11; -2 1 2 -3"',
        answer: 'La misma regla de Cramer, pero con determinantes de 3×3: D, Dx, Dy y Dz.',
        yes: [
          'Planteo: cargás la matriz AMPLIADA, con los coeficientes y los términos independientes en la última columna',
          'Paso 1: el determinante D de la matriz 3×3 de coeficientes, por la regla de Sarrus o por cofactores',
          'Paso 2: Dx, Dy y Dz reemplazando cada columna por la de términos independientes',
          'Paso 3: x = Dx ÷ D, y = Dy ÷ D, z = Dz ÷ D',
          'Geométricamente cada ecuación es un plano: la solución única es el punto donde los tres se cortan',
        ],
        warn: [
          'Si D = 0 el sistema no tiene solución única: los tres planos no se cortan en un punto',
          'D = 0 puede significar infinitas soluciones (los planos se cortan en una recta o coinciden) o ninguna',
          'La matriz tiene que ser de 3 filas por 4 columnas: si te falta una columna, olvidaste los términos independientes',
          'Separá las filas con punto y coma y los números con espacios',
        ],
        plazo: 'chequeo: la página sustituye la terna (x, y, z) en las tres ecuaciones y muestra cada resultado.',
      },
      {
        id: 'gauss',
        label: 'Gauss-Jordan paso a paso',
        hint: 'Ej.: la misma matriz ampliada, pero viendo cada operación de fila',
        answer: 'Transformás la matriz con operaciones elementales hasta dejarla en forma escalonada reducida.',
        yes: [
          'Planteo: se trabaja sobre la matriz ampliada, sin arrastrar las letras x, y, z',
          'Las tres operaciones permitidas son: intercambiar dos filas, multiplicar una fila por un número distinto de cero y sumarle a una fila un múltiplo de otra',
          'Paso a paso: se elige el pivote de cada columna, se lo lleva a 1 dividiendo la fila, y se ponen ceros arriba y abajo',
          'Cuando termina, cada incógnita queda despejada sola: la última columna ES la solución',
          'El RANGO —la cantidad de filas no nulas— te dice de una si el sistema es compatible y si la solución es única',
        ],
        warn: [
          'Rango de la matriz de coeficientes menor al de la ampliada = sistema INCOMPATIBLE (aparece una fila "0 0 0 | k")',
          'Rango igual pero menor que la cantidad de incógnitas = infinitas soluciones, con variables libres',
          'Se pivotea por el elemento de mayor valor absoluto para no perder precisión numérica',
          'Gauss-Jordan es el único método de esta página que funciona igual con sistemas no cuadrados',
        ],
        plazo: 'chequeo: mirá el rango. Si es igual a la cantidad de incógnitas, la solución es única.',
      },
      {
        id: 'det2',
        label: 'Determinante e inversa de una matriz 2×2',
        hint: 'Ej.: "4 7; 2 6" → det 10',
        answer: 'El determinante es ad − bc, y la inversa se arma intercambiando, cambiando signos y dividiendo por el determinante.',
        yes: [
          'Planteo: para la matriz [[a, b], [c, d]], el determinante es D = a·d − b·c',
          'Paso 1: calculás la diagonal principal a·d y la secundaria b·c, y las restás',
          'Paso 2: si D ≠ 0, la inversa es (1÷D) · [[d, −b], [−c, a]]: se intercambian a y d, y se cambia el signo de b y c',
          'La verificación es multiplicar A por su inversa: tiene que dar la matriz identidad [[1, 0], [0, 1]]',
          'El determinante también es el factor por el que la matriz agranda o achica las áreas',
        ],
        warn: [
          'Si D = 0 la matriz es SINGULAR y no tiene inversa: sus filas son proporcionales entre sí',
          'Un determinante negativo no es un error: significa que la transformación además invierte la orientación',
          'No confundas el determinante con la traza (a + d): son cosas distintas',
          'Cargá la matriz con las filas separadas por punto y coma',
        ],
        plazo: 'chequeo: multiplicá A por la inversa. Tiene que dar 1 en la diagonal y 0 afuera.',
      },
      {
        id: 'det3',
        label: 'Determinante e inversa de una matriz 3×3',
        hint: 'Ej.: "2 1 -1; -3 -1 2; -2 1 2"',
        answer: 'El determinante sale por Sarrus o cofactores; la inversa, escalonando la matriz junto a la identidad.',
        yes: [
          'Planteo: para una 3×3, el determinante se puede sacar por la regla de Sarrus (tres productos que suman y tres que restan)',
          'Paso 1: los tres productos de las diagonales que bajan hacia la derecha suman',
          'Paso 2: los tres productos de las diagonales que bajan hacia la izquierda restan',
          'Paso 3: si D ≠ 0, la inversa se obtiene poniendo la identidad al lado de la matriz y escalonando hasta que el bloque izquierdo sea la identidad',
          'El bloque que queda a la derecha al terminar es exactamente la inversa',
        ],
        warn: [
          'Si D = 0 no hay inversa: la matriz aplasta el espacio en un plano o en una recta y no se puede volver atrás',
          'La regla de Sarrus vale SÓLO para 3×3: para 4×4 en adelante hay que ir por cofactores o por escalonamiento',
          'La inversa se calcula numéricamente: los valores muy chiquitos que ves son ceros con error de redondeo',
          'La matriz tiene que ser de 3 filas y 3 columnas exactas, sin la columna de términos independientes',
        ],
        plazo: 'chequeo: el determinante de la inversa tiene que ser 1 ÷ D.',
      },
    ],
  },

  inputsTitle: 'Cargá tu sistema o tu matriz',
  inputsIntro:
    'La rama de Cramer 2×2 usa los seis coeficientes de arriba; las de sistemas 3×3, Gauss-Jordan y matrices usan los campos de matriz. Los campos que sobran quedan ahí sin molestar.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands no se pueden
    // escribir matrices, y "1.5" se convertiría en 15.
    { id: 'a', label: 'Ecuación 1 — coeficiente de x (a)', value: '2' },
    { id: 'b', label: 'Ecuación 1 — coeficiente de y (b)', value: '3' },
    { id: 'c', label: 'Ecuación 1 — término independiente (c)', value: '8', help: 'El número que queda solo del lado derecho del igual.' },
    { id: 'd', label: 'Ecuación 2 — coeficiente de x (d)', value: '1' },
    { id: 'e', label: 'Ecuación 2 — coeficiente de y (e)', value: '-1' },
    { id: 'f', label: 'Ecuación 2 — término independiente (f)', value: '-1' },
    {
      id: 'sis',
      label: 'Matriz ampliada del sistema (3 filas × 4 columnas)',
      value: '2 1 -1 8; -3 -1 2 -11; -2 1 2 -3',
      help: 'Ramas de sistema 3×3 y Gauss-Jordan. Filas separadas por punto y coma; la última columna son los términos independientes.',
    },
    {
      id: 'm2',
      label: 'Matriz 2×2',
      value: '4 7; 2 6',
      help: 'Sólo la rama de determinante e inversa 2×2.',
    },
    {
      id: 'm3',
      label: 'Matriz 3×3',
      value: '2 1 -1; -3 -1 2; -2 1 2',
      help: 'Sólo la rama de determinante e inversa 3×3. Sin columna de términos independientes.',
    },
  ],
  fineprint:
    'En los campos de matriz, separá las filas con punto y coma y los números con espacios. Dentro de un número usá punto decimal, porque la coma se lee como separador. Los valores que quedan a menos de una diezmilmillonésima de un entero se muestran como el entero: son artefactos del escalonamiento numérico, no decimales reales.',

  chart: {
    type: 'bars',
    title: 'Los determinantes que deciden',
    caption:
      'Las barras comparan los determinantes intermedios con el determinante del sistema. La lectura importante es el tamaño relativo: cuanto más chico es el determinante del sistema frente a los demás, más grandes salen las soluciones y más sensible es el sistema a cualquier error en los datos. Si el determinante del sistema es cero, la barra desaparece y no hay solución única.',
  },
  breakdownTitle: 'El procedimiento, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: los coeficientes que entraron, cada determinante intermedio, el cociente que da cada incógnita y la sustitución final en las ecuaciones originales para verificar.',

  faq: [
    {
      q: '¿Cómo se aplica la regla de Cramer a un sistema 2×2?',
      a: 'Con tres determinantes. Para ax + by = c y dx + ey = f: el del sistema es <b>D = a·e − b·d</b>; el de x reemplaza la primera columna por los independientes, <b>Dx = c·e − b·f</b>; y el de y reemplaza la segunda, <b>Dy = a·f − c·d</b>. Entonces <b>x = Dx ÷ D</b> e <b>y = Dy ÷ D</b>. En 2x + 3y = 8 y x − y = −1: D = −5, Dx = −5, Dy = −10, así que x = 1 e y = 2.',
    },
    {
      q: '¿Qué pasa si el determinante da cero?',
      a: 'Que el sistema <b>no tiene solución única</b> y la regla de Cramer no se puede usar, porque habría que dividir por cero. Hay dos escenarios. Si las ecuaciones son <b>proporcionales</b> (una es la otra multiplicada por un número), describen la misma recta: el sistema es <b>compatible indeterminado</b> y tiene infinitas soluciones. Si no son proporcionales, las rectas son <b>paralelas</b> y el sistema es <b>incompatible</b>: no hay ningún par que cumpla las dos.',
    },
    {
      q: '¿Cuál es la diferencia entre un sistema incompatible y uno indeterminado?',
      a: 'El <b>incompatible</b> no tiene ninguna solución: son rectas paralelas o planos paralelos, y al escalonar aparece una fila absurda del tipo "0 0 0 | 5". El <b>compatible indeterminado</b> tiene infinitas: las ecuaciones son redundantes y al escalonar sobra una fila entera de ceros, lo que deja variables libres. Los dos casos tienen determinante cero; lo que los distingue es comparar el rango de la matriz de coeficientes con el de la ampliada.',
    },
    {
      q: '¿Cómo funciona la eliminación de Gauss-Jordan?',
      a: 'Se trabaja sobre la <b>matriz ampliada</b> aplicando sólo tres operaciones permitidas: intercambiar dos filas, multiplicar una fila por un número distinto de cero, y sumarle a una fila un múltiplo de otra. Se elige un <b>pivote</b> por columna, se lo lleva a 1 dividiendo la fila, y se generan ceros arriba y abajo. Cuando la parte de coeficientes queda convertida en la identidad, la última columna es directamente la solución.',
    },
    {
      q: '¿Qué diferencia hay entre Gauss y Gauss-Jordan?',
      a: 'La <b>eliminación de Gauss</b> deja la matriz en forma escalonada (ceros sólo por debajo de los pivotes) y después hay que despejar hacia atrás, de la última ecuación a la primera. <b>Gauss-Jordan</b> sigue un paso más y también pone ceros por encima de cada pivote, dejando la forma escalonada <b>reducida</b>: ahí ya no hace falta sustituir hacia atrás porque cada incógnita queda sola.',
    },
    {
      q: '¿Qué es el rango de una matriz y para qué sirve?',
      a: 'Es la cantidad de <b>filas no nulas</b> que quedan después de escalonar, o sea cuántas ecuaciones aportan información realmente independiente. La regla, llamada teorema de Rouché-Frobenius, dice: si el rango de la matriz de coeficientes es menor que el de la ampliada, el sistema es <b>incompatible</b>; si son iguales y coinciden con la cantidad de incógnitas, hay <b>solución única</b>; y si son iguales pero menores, hay <b>infinitas soluciones</b>.',
    },
    {
      q: '¿Cómo se calcula la inversa de una matriz 2×2?',
      a: 'Para [[a, b], [c, d]] con determinante D = ad − bc distinto de cero, la inversa es <b>(1÷D) · [[d, −b], [−c, a]]</b>. La receta mnemotécnica es: intercambiás los elementos de la diagonal principal, cambiás de signo los de la secundaria, y dividís todo por el determinante. En [[4, 7], [2, 6]] el determinante es 10 y la inversa es [[0,6, −0,7], [−0,2, 0,4]].',
    },
    {
      q: '¿Qué es la regla de Sarrus para el determinante de una matriz 3×3?',
      a: 'Es el atajo para 3×3: se <b>suman</b> los tres productos de las diagonales que bajan hacia la derecha y se <b>restan</b> los tres de las que bajan hacia la izquierda. En fórmula: D = a₁₁(a₂₂a₃₃ − a₂₃a₃₂) − a₁₂(a₂₁a₃₃ − a₂₃a₃₁) + a₁₃(a₂₁a₃₂ − a₂₂a₃₁). Ojo: Sarrus <b>sólo sirve para 3×3</b>; para 4×4 en adelante hay que ir por desarrollo en cofactores o por escalonamiento.',
    },
    {
      q: '¿Cuándo una matriz no tiene inversa?',
      a: 'Cuando su <b>determinante es cero</b>. A esa matriz se la llama <b>singular</b>, y significa que sus filas (o sus columnas) son linealmente dependientes: una se puede escribir combinando las otras. Geométricamente, la transformación aplasta el espacio en una dimensión menor —un plano se vuelve una recta— y esa información perdida ya no se puede recuperar, que es exactamente lo que haría una inversa.',
    },
    {
      q: '¿Qué relación hay entre el determinante y la solución del sistema?',
      a: 'El determinante del sistema es el <b>denominador</b> de todas las incógnitas en la regla de Cramer. Por eso, si es cero no hay solución única, y si es muy chiquito comparado con los datos, el sistema está <b>mal condicionado</b>: un error minúsculo en un coeficiente produce un cambio enorme en el resultado. Ese es el caso de dos rectas que se cortan con un ángulo muy chico.',
    },
    {
      q: '¿Puedo resolver un sistema 3×3 con la regla de Cramer o conviene Gauss?',
      a: 'Con 3×3 Cramer todavía es cómodo a mano: son cuatro determinantes de 3×3, que con Sarrus salen rápido. De 4×4 en adelante Cramer se vuelve impracticable —la cantidad de operaciones crece factorialmente— y ahí <b>Gauss-Jordan es el método estándar</b>, que además funciona igual con sistemas no cuadrados y te dice de paso el rango.',
    },
    {
      q: '¿Por qué me aparecen valores como 0,0000000001 en la matriz escalonada?',
      a: 'Porque el escalonamiento hace divisiones y restas sucesivas en punto flotante, y los ceros que deberían quedar exactos arrastran un error de redondeo minúsculo. <b>Son ceros</b>. Esta página redondea al entero todo valor que quede a menos de una diezmilmillonésima de él, así que ves 0 limpio. Por la misma razón se pivotea siempre por el elemento de mayor valor absoluto: reduce ese error.',
    },
  ],

  sources: [
    {
      name: "Cramer's Rule — determinantes y solución de sistemas lineales",
      url: 'https://mathworld.wolfram.com/CramersRule.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Gauss-Jordan Elimination — forma escalonada reducida',
      url: 'https://mathworld.wolfram.com/Gauss-JordanElimination.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Matrix Inverse — condición de invertibilidad y cálculo',
      url: 'https://mathworld.wolfram.com/MatrixInverse.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Matrices, determinantes y sistemas de ecuaciones — curso de álgebra lineal',
      url: 'https://www.khanacademy.org/math/linear-algebra',
      publisher: 'Khan Academy',
    },
    {
      name: 'Intermediate Algebra 2e — capítulo de sistemas de ecuaciones y determinantes',
      url: 'https://openstax.org/details/books/intermediate-algebra-2e',
      publisher: 'OpenStax (Rice University)',
    },
    {
      name: 'Recursos de matemática para nivel secundario',
      url: 'https://www.educ.ar/recursos/buscar?tema=matematica',
      publisher: 'Educ.ar — Ministerio de Educación de la Nación',
    },
  ],

  replaces: [
    '/calculadora-sistemas-ecuaciones-2x2-cramer',
    '/calculadora-sistema-ecuaciones-3x3',
    '/calculadora-gauss-jordan',
    '/calculadora-determinante-inversa-matriz-2x2',
    '/calculadora-determinante-inversa-matriz-3x3',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
