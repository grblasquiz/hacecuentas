import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo resuelvo esta ecuación?"
 * Arquetipo RAMIFICADO: 6 ramas = las 6 formas en que un estudiante de
 * secundario o de primer año se choca con una ecuación o un polinomio.
 * Absorbe 7 URLs (ver `replaces`).
 *
 * Contenido de ESTUDIANTE: el valor no está en el número final sino en el
 * PROCEDIMIENTO. Cada rama muestra el planteo, la sustitución, cada paso
 * intermedio y la verificación. En cuadrática aparecen b², 4ac, el
 * discriminante, la raíz cuadrada, las dos soluciones y el control por suma y
 * producto de raíces (Vieta). En Ruffini aparece la fila de coeficientes
 * bajados, los productos, las sumas y el resto.
 *
 * FORMATO: acá no hay plata en ninguna rama. El default de HubRow es 'ars', así
 * que TODA fila declara format:'plain' o format:'unit' explícito.
 *
 * PRECISIÓN: el motor de raíces es Durand-Kerner (el mismo de
 * `src/lib/formulas/matematica-avanzada.ts`), que es iterativo. Todo resultado
 * a menos de 1e-10 de un entero se redondea al entero para no mostrar
 * "1,9999999999" ni "-0".
 */
export const hub: HubData = {
  slug: 'matematica/ecuaciones-y-polinomios',
  title: '¿Cómo resuelvo esta ecuación? — Cuadrática, inecuaciones y polinomios',
  description:
    'Fórmula resolvente con discriminante y raíces complejas, inecuaciones lineales, polinómicas, racionales y con valor absoluto resueltas por tabla de signos y notación de intervalos, factorización, raíces de un polinomio, división larga y regla de Ruffini. Con el planteo y cada paso intermedio.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de matemática',
  h1: '¿Cómo resuelvo esta ecuación?',
  lede:
    'Empezamos por la cuadrática, que es la que más se pregunta: la resolvente, el discriminante y qué pasa cuando da negativo. Si lo tuyo es una inecuación —lineal, polinómica, racional o con valor absoluto—, una factorización, las raíces de un polinomio de grado alto, una división larga o Ruffini, lo cambiás abajo y el procedimiento se adapta.',
  stamps: ['Actualizado 28-07-2026', '6 procedimientos adentro', 'Con la tabla de signos completa'],

  resultLabel: 'La solución',

  cases: {
    title: '¿Qué tenés que resolver?',
    intro:
      'Elegí el tipo de ejercicio. Cada rama usa distintos campos del formulario y te muestra el procedimiento completo, no sólo el resultado.',
    items: [
      {
        id: 'cuadratica',
        label: 'Ecuación cuadrática (fórmula resolvente)',
        hint: 'Ej.: "x² − 3x + 2 = 0"',
        answer: 'Calculás el discriminante b² − 4ac y lo metés en x = (−b ± √D) ÷ 2a.',
        yes: [
          'Planteo: la ecuación tiene que estar igualada a cero, con la forma ax² + bx + c = 0',
          'Paso 1: el discriminante D = b² − 4ac decide todo antes de calcular las raíces',
          'Paso 2: x = (−b ± √D) ÷ (2a) — el ± es lo que produce las dos soluciones',
          'D > 0 da dos raíces reales distintas; D = 0 una raíz doble; D < 0 dos raíces complejas conjugadas',
          'Control de Vieta: x₁ + x₂ tiene que dar −b ÷ a, y x₁ · x₂ tiene que dar c ÷ a',
        ],
        warn: [
          'a no puede ser 0: sin término cuadrático es una recta, no una parábola, y se despeja x = −c ÷ b',
          'Pasá todo a un lado del igual antes de leer a, b y c: en "x² = 3x − 2" el b es −3 y el c es +2',
          'Con D negativo las raíces existen igual, pero son complejas: la parábola no corta el eje x',
          'El signo de a te dice hacia dónde abre la parábola: positivo hacia arriba, negativo hacia abajo',
        ],
        plazo: 'chequeo rápido: sumá las dos raíces. Si no da −b ÷ a, te equivocaste en un signo.',
      },
      {
        id: 'inecuacion',
        label: 'Inecuación (lineal, polinómica, racional o con valor absoluto)',
        hint: 'Ej.: "x² − 5x + 6 > 0" → (−∞, 2) ∪ (3, +∞)',
        answer:
          'Buscás los puntos críticos, armás la tabla de signos y te quedás con los intervalos donde la expresión cumple.',
        yes: [
          'Planteo: pasá TODO a un solo lado, de modo que quede expresión (signo) 0. Nunca resuelvas con números a los dos lados',
          'Paso 1 — puntos críticos: los ceros del numerador, más los ceros del denominador si es racional, más los x donde |P(x)| = c si hay valor absoluto',
          'Paso 2 — tabla de signos: ordenás los puntos críticos en la recta y probás un valor de prueba en cada intervalo que queda entre ellos',
          'Paso 3 — armás la unión de los intervalos que cumplen, y unís los que quedan pegados',
          'Notación: corchete cuando el extremo entra (≤ o ≥) y paréntesis cuando no. En ±∞ SIEMPRE paréntesis: "[−∞" no existe',
          'En la racional los ceros del denominador se excluyen siempre, aunque el signo sea ≤ o ≥: ahí la expresión no está definida',
        ],
        warn: [
          'Multiplicar o dividir por un negativo DA VUELTA el signo: es el error número uno de esta cuenta',
          'En la racional NO se puede "pasar multiplicando" el denominador: no sabés su signo, y si es negativo la desigualdad se invierte',
          'En la lineal alcanza con despejar; de grado 2 en adelante la tabla de signos no es opcional',
          'Una raíz doble no cambia el signo: la expresión toca el cero y vuelve al mismo lado (por eso x² ≥ 0 se cumple siempre)',
          '|P(x)| < c es una intersección (queda un solo intervalo) y |P(x)| > c es una unión (quedan dos): no son simétricos',
          'Si c es negativo, |P(x)| < c no lo cumple nadie y |P(x)| > c lo cumplen todos los reales',
        ],
        plazo: 'chequeo: probá un número del intervalo que te dio. Tiene que cumplir la desigualdad original.',
      },
      {
        id: 'factorizacion',
        label: 'Factorizar un polinomio',
        hint: 'Ej.: coeficientes "1 -6 11 -6" → (x − 1)(x − 2)(x − 3)',
        answer: 'Buscás las raíces y cada raíz r te da un factor (x − r).',
        yes: [
          'Planteo: cargá los coeficientes del mayor grado al término independiente, separados por espacios',
          'Paso 1: se normaliza el coeficiente principal (se saca como factor común)',
          'Paso 2: se buscan las raíces del polinomio',
          'Paso 3: por el teorema del factor, cada raíz real r produce el factor (x − r)',
          'Los pares de raíces complejas conjugadas no dan factores lineales reales: se agrupan en un factor cuadrático irreducible',
        ],
        warn: [
          'Faltan coeficientes: si el polinomio es x³ − 1, los coeficientes son "1 0 0 -1", con los ceros puestos',
          'Un polinomio de grado n tiene exactamente n raíces contando multiplicidad, pero no todas tienen que ser reales',
          'Las raíces se calculan numéricamente: un valor como 2,0000000001 es en realidad 2 (acá se redondea solo)',
          'Usá punto decimal en los coeficientes, no coma: la coma se lee como separador entre coeficientes',
        ],
        plazo: 'chequeo: multiplicá los factores mentalmente y mirá si el término independiente vuelve a salir.',
      },
      {
        id: 'raices',
        label: 'Raíces reales y complejas de un polinomio',
        hint: 'Ej.: coeficientes "1 0 1" → x = +i y x = −i',
        answer: 'Un polinomio de grado n tiene n raíces: las reales cortan el eje x, las complejas vienen de a pares.',
        yes: [
          'Planteo: cargá los coeficientes del mayor grado al independiente',
          'Se resuelven todas las raíces a la vez, reales y complejas, por iteración numérica',
          'Las raíces complejas de un polinomio de coeficientes reales SIEMPRE aparecen de a pares conjugados (a + bi y a − bi)',
          'Cada raíz real es un punto donde la curva cruza o toca el eje x',
          'La verificación evalúa el polinomio en cada raíz: tiene que dar prácticamente cero',
        ],
        warn: [
          'Un polinomio de grado impar con coeficientes reales tiene al menos una raíz real: no puede tener sólo complejas',
          'Raíces muy juntas o de multiplicidad alta pierden precisión en cualquier método numérico',
          'El primer coeficiente no puede ser 0: si lo es, el grado real es menor y hay que sacarlo',
          'Usá punto decimal, no coma, dentro de cada coeficiente',
        ],
        plazo: 'chequeo: la suma de todas las raíces tiene que dar −b ÷ a, con b el segundo coeficiente.',
      },
      {
        id: 'division',
        label: 'División de polinomios (división larga)',
        hint: 'Ej.: "1 -6 11 -6" dividido "1 -1"',
        answer: 'Dividís el término líder, multiplicás el divisor, restás y repetís hasta que el resto baje de grado.',
        yes: [
          'Planteo: dividendo = divisor × cociente + resto, igual que con números enteros',
          'Paso 1: dividís el coeficiente líder del dividendo por el del divisor',
          'Paso 2: multiplicás todo el divisor por ese resultado y lo restás',
          'Paso 3: repetís con lo que queda hasta que el resto tenga grado menor que el divisor',
          'El grado del cociente es la diferencia de grados; el del resto es siempre menor que el del divisor',
        ],
        warn: [
          'El dividendo tiene que ser de grado mayor o igual que el divisor',
          'No te saltees los términos ausentes: poné los ceros en los coeficientes',
          'Si el resto da cero, el divisor es factor exacto del dividendo',
          'Para dividir por (x − r) conviene Ruffini: es la misma cuenta, mucho más corta',
        ],
        plazo: 'chequeo: divisor × cociente + resto tiene que reconstruir el dividendo original.',
      },
      {
        id: 'ruffini',
        label: 'Regla de Ruffini',
        hint: 'Ej.: "1 -6 11 -6" con raíz 1 → resto 0, es factor',
        answer: 'Bajás el primer coeficiente, multiplicás por la raíz, sumás, y repetís: la última suma es el resto.',
        yes: [
          'Planteo: Ruffini divide por (x − r), con r el valor que cargás en el campo de la raíz',
          'Paso 1: bajás el primer coeficiente tal cual, sin tocarlo',
          'Paso 2: lo multiplicás por r y sumás ese producto al siguiente coeficiente',
          'Paso 3: repetís hasta el final. Las sumas son los coeficientes del cociente y la última es el RESTO',
          'Teorema del resto: ese resto es exactamente P(r). Si da 0, (x − r) es factor del polinomio',
        ],
        warn: [
          'Ojo con el signo: para dividir por (x + 2) la raíz que cargás es −2, no 2',
          'Ruffini sólo sirve para divisores de la forma (x − r), de grado 1. Para grado mayor usá la división larga',
          'Poné los ceros de los términos ausentes o la tabla se corre una columna',
          'El cociente baja exactamente un grado respecto del polinomio original',
        ],
        plazo: 'chequeo: el resto tiene que coincidir con evaluar el polinomio en r (teorema del resto).',
      },
    ],
  },

  inputsTitle: 'Cargá tu ejercicio',
  inputsIntro:
    'Según la rama que elijas se usan distintos campos. Los que sobran quedan ahí sin molestar: el desglose te dice cuáles entraron en la cuenta.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands el parser
    // convierte "1.5" en 15 y los coeficientes separados por espacios ni
    // siquiera se pueden escribir.
    { id: 'a', label: 'a — coeficiente de x²', value: '1', help: 'En la inecuación es el coeficiente que acompaña a la x.' },
    { id: 'b', label: 'b — coeficiente de x', value: '-3', help: 'En la inecuación es el término independiente.' },
    { id: 'c', label: 'c — término independiente', value: '2', help: 'Sólo cuadrática.' },
    {
      id: 'tipoIneq',
      label: 'Tipo de inecuación',
      type: 'select',
      value: 'lineal',
      options: [
        { value: 'lineal', label: 'Lineal — a·x + b (usa a y b)' },
        { value: 'polinomica', label: 'Polinómica de grado ≥ 2 (usa los coeficientes)' },
        { value: 'racional', label: 'Racional P(x) ÷ Q(x) (usa coeficientes y denominador)' },
        { value: 'absoluta', label: 'Con valor absoluto |P(x)| contra un límite' },
      ],
      help: 'Sólo la rama de inecuación. La lineal usa a y b; las otras tres usan el campo de coeficientes.',
    },
    {
      id: 'op',
      label: 'Signo de la inecuación',
      type: 'select',
      value: '>=',
      options: [
        { value: '>', label: '> mayor que cero' },
        { value: '>=', label: '≥ mayor o igual a cero' },
        { value: '<', label: '< menor que cero' },
        { value: '<=', label: '≤ menor o igual a cero' },
      ],
      help: 'Sólo la rama de inecuación. En la lineal compara a·x + b contra 0; en la polinómica P(x); en la racional P(x) ÷ Q(x); y en la de valor absoluto compara |P(x)| contra el límite c.',
    },
    {
      id: 'coefs',
      label: 'Coeficientes del polinomio',
      value: '1 -6 11 -6',
      help: 'Del mayor grado al término independiente, separados por espacios. Poné los ceros de los términos que faltan ("1 0 0 -1" es x³ − 1). Punto decimal, no coma.',
    },
    { id: 'divisor', label: 'Coeficientes del divisor', value: '1 -1', help: 'Sólo la división larga. "1 -1" es (x − 1).' },
    {
      id: 'denom',
      label: 'Coeficientes de Q(x) — denominador',
      value: '1 -1',
      help: 'Sólo la inecuación racional: el denominador de P(x) ÷ Q(x). "1 -1" es (x − 1). Sus ceros se excluyen siempre de la solución.',
    },
    {
      id: 'limAbs',
      label: 'c — límite del valor absoluto',
      value: '1',
      help: 'Sólo la inecuación con valor absoluto: el número contra el que se compara |P(x)|.',
    },
    { id: 'r', label: 'r — la raíz de Ruffini', value: '1', help: 'Sólo Ruffini: el r de (x − r). Para dividir por (x + 2) cargá −2.' },
  ],
  fineprint:
    'Dentro de cada coeficiente usá punto decimal ("0.5"), porque la coma separa un coeficiente del siguiente. Los resultados que quedan a menos de una diezmilmillonésima de un entero se muestran como el entero: son artefactos del cálculo numérico, no decimales reales.',

  chart: {
    type: 'bars',
    title: 'Las piezas de la cuenta',
    caption:
      'Las barras comparan las magnitudes que deciden el resultado. En la cuadrática se ven b² y 4ac enfrentados: cuál de los dos es más grande es literalmente lo que define si el discriminante da positivo, cero o negativo, y por lo tanto si hay dos raíces, una o ninguna real. En las ramas de polinomios se ven los términos que quedan después de cada paso.',
  },
  breakdownTitle: 'El procedimiento, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero los datos que entraron, después las sustituciones, después cada operación intermedia y al final la verificación. Es la cuenta que tenés que poder escribir en la carpeta.',

  faq: [
    {
      q: '¿Cuál es la fórmula resolvente de la ecuación cuadrática?',
      a: 'Para <b>ax² + bx + c = 0</b> con a ≠ 0, la resolvente es <b>x = (−b ± √(b² − 4ac)) ÷ (2a)</b>. Primero se calcula el discriminante D = b² − 4ac, después su raíz cuadrada, y el signo ± genera las dos soluciones. En x² − 3x + 2 = 0: D = 9 − 8 = 1, √1 = 1, y las raíces son (3 + 1)/2 = <b>2</b> y (3 − 1)/2 = <b>1</b>.',
    },
    {
      q: '¿Qué es el discriminante y qué me dice antes de calcular las raíces?',
      a: 'El discriminante es <b>D = b² − 4ac</b> y decide la naturaleza de las soluciones sin hacer la cuenta completa. Si <b>D &gt; 0</b> hay dos raíces reales distintas y la parábola corta el eje x en dos puntos. Si <b>D = 0</b> hay una raíz doble y la parábola apoya en el eje en un solo punto, que es el vértice. Si <b>D &lt; 0</b> no hay raíces reales: la parábola no toca el eje x y las soluciones son dos complejas conjugadas.',
    },
    {
      q: '¿Qué pasa si el discriminante da negativo?',
      a: 'Las soluciones existen igual, pero son <b>complejas conjugadas</b>: x = −b/(2a) ± (√|D| / 2a)·i. Comparten la parte real —que es exactamente la abscisa del vértice— y difieren sólo en el signo de la parte imaginaria. Gráficamente significa que la parábola quedó entera arriba o entera abajo del eje x. En x² + 1 = 0 el discriminante es −4 y las raíces son <b>+i</b> y <b>−i</b>.',
    },
    {
      q: '¿Cómo verifico que resolví bien una ecuación cuadrática?',
      a: 'Con las <b>relaciones de Vieta</b>, que son más rápidas que sustituir. La suma de las dos raíces tiene que dar <b>−b ÷ a</b> y el producto tiene que dar <b>c ÷ a</b>. Si en x² − 3x + 2 = 0 te dieron 1 y 2: suman 3 (que es −(−3)/1 ✔) y multiplican 2 (que es 2/1 ✔). Si la suma no cierra, casi siempre es un signo mal copiado.',
    },
    {
      q: '¿Cuándo se da vuelta el signo en una inecuación?',
      a: 'Cuando <b>multiplicás o dividís los dos lados por un número negativo</b>. Sumar y restar no cambia nada. En −2x + 6 &gt; 0 pasás a −2x &gt; −6 y al dividir por −2 el signo se invierte: <b>x &lt; 3</b>. Es el error más frecuente de toda el álgebra escolar, y se detecta probando un número del intervalo en la inecuación original.',
    },
    {
      q: '¿Cómo se escribe la solución de una inecuación en notación de intervalo?',
      a: 'Con <b>corchete</b> cuando el extremo pertenece a la solución (signos ≤ y ≥) y con <b>paréntesis</b> cuando no (signos &lt; y &gt;). El infinito lleva siempre paréntesis porque no es un número. Así, x ≥ 3 se escribe <b>[3, +∞)</b>; x &lt; 3 se escribe <b>(−∞, 3)</b>; y una solución vacía se escribe <b>∅</b>.',
    },
    {
      q: '¿Por qué al multiplicar por un número negativo se da vuelta el signo de la desigualdad?',
      a: 'Porque multiplicar por un negativo <b>refleja la recta numérica</b>: el que estaba a la derecha pasa a estar a la izquierda. Es fácil de ver con números: <b>2 &lt; 5</b> es verdadero, pero multiplicando los dos lados por −1 queda −2 y −5, y <b>−2 &gt; −5</b>. Si dejaras el signo como estaba escribirías −2 &lt; −5, que es falso. Con la igualdad no pasa porque un igual no tiene orden que invertir. Sumar y restar tampoco invierte nada: mueve los dos lados en el mismo sentido y la distancia entre ellos no cambia.',
    },
    {
      q: '¿Cómo se arma la tabla de signos de una inecuación polinómica?',
      a: 'Primero se pasa todo a un lado para que quede <b>P(x) (signo) 0</b>. Después se buscan las <b>raíces reales</b> de P, que son los únicos puntos donde la expresión puede cambiar de signo, y se ordenan sobre la recta. Esas raíces parten la recta en intervalos; en cada uno se prueba <b>un valor cualquiera</b> y se anota si el resultado da positivo o negativo. La solución es la unión de los intervalos con el signo que pediste. En x² − 5x + 6 &gt; 0 las raíces son 2 y 3, los signos son + / − / + y la respuesta es <b>(−∞, 2) ∪ (3, +∞)</b>.',
    },
    {
      q: '¿Por qué en una inecuación racional no se puede pasar multiplicando el denominador?',
      a: 'Porque <b>no sabés qué signo tiene</b>. Multiplicar los dos lados por Q(x) es multiplicar por algo que en unos intervalos es positivo y en otros negativo, así que la desigualdad se conserva en unos y se invierte en otros: el resultado sale mal. Con una ecuación sí se puede porque el igual no tiene sentido que invertir. El método correcto es dejar el cociente entero de un lado, buscar los <b>ceros del numerador y los del denominador</b> juntos, y hacer la tabla de signos del cociente.',
    },
    {
      q: '¿Por qué los ceros del denominador se marcan siempre con paréntesis?',
      a: 'Porque ahí la expresión <b>no está definida</b>: no podés dividir por cero. Ese punto queda excluido de la solución aunque el signo sea ≤ o ≥, y por eso se escribe con paréntesis, no con corchete. Es la diferencia clave con los ceros del numerador, que con ≤ o ≥ sí entran y llevan corchete. En (x − 1) ÷ (x − 2) ≥ 0 la respuesta es <b>(−∞, 1] ∪ (2, +∞)</b>: el 1 entra con corchete y el 2 queda afuera con paréntesis.',
    },
    {
      q: '¿Por qué |x| &gt; c y |x| &lt; c dan formas de solución distintas?',
      a: 'Porque el valor absoluto es una <b>distancia al cero</b>, y las dos preguntas son opuestas. <b>|x| &lt; c</b> pide los puntos que están cerca del cero: eso obliga a cumplir dos condiciones a la vez (x &gt; −c <b>y</b> x &lt; c), o sea una <b>intersección</b>, y da un único intervalo (−c, c). <b>|x| &gt; c</b> pide los que están lejos: alcanza con cumplir una de las dos (x &lt; −c <b>o</b> x &gt; c), o sea una <b>unión</b>, y da dos intervalos separados, (−∞, −c) ∪ (c, +∞). El error típico es escribir −c &lt; x &gt; c, que no significa nada.',
    },
    {
      q: '¿Qué pasa si el límite del valor absoluto es negativo?',
      a: 'Se resuelve sin hacer ninguna cuenta, porque <b>un valor absoluto nunca es negativo</b>. Si c &lt; 0, entonces |P(x)| &lt; c <b>no lo cumple ningún x</b> y la solución es ∅; y |P(x)| &gt; c <b>lo cumplen todos</b>, o sea ℝ. El caso de borde es c = 0: |P(x)| &gt; 0 se cumple en todos lados menos en las raíces de P, y |P(x)| ≤ 0 se cumple sólo en esas raíces exactas.',
    },
    {
      q: '¿Qué pasa en una inecuación cuando hay una raíz doble?',
      a: 'Que ahí <b>no hay cambio de signo</b>: la curva toca el eje y vuelve al mismo lado. Por eso en (x − 2)² &gt; 0 la solución es todo ℝ menos el 2, que se escribe <b>(−∞, 2) ∪ (2, +∞)</b>, y no dos regiones con signos distintos. La regla general es que el signo se invierte al cruzar una raíz de multiplicidad <b>impar</b> y se conserva al cruzar una de multiplicidad <b>par</b>. Si armás la tabla probando valores en cada intervalo, esto te sale solo sin tener que acordarte de la regla.',
    },
    {
      q: '¿Qué dice el teorema del factor y para qué se usa al factorizar?',
      a: 'Dice que <b>r es raíz de P(x) si y sólo si (x − r) divide exactamente a P(x)</b>. Por eso factorizar es, en el fondo, buscar raíces: cada raíz real r aporta un factor (x − r). Un polinomio de grado 3 con raíces 1, 2 y 3 se factoriza como <b>(x − 1)(x − 2)(x − 3)</b>, multiplicado por el coeficiente principal si no es 1.',
    },
    {
      q: '¿Por qué las raíces complejas aparecen siempre de a pares?',
      a: 'Porque si el polinomio tiene <b>coeficientes reales</b> y a + bi es raíz, su conjugado a − bi también lo es. De ahí salen dos consecuencias prácticas: la cantidad de raíces complejas siempre es par, y todo polinomio de <b>grado impar</b> con coeficientes reales tiene <b>al menos una raíz real</b>. Cada par conjugado se agrupa en un factor cuadrático irreducible sobre los reales.',
    },
    {
      q: '¿Cómo funciona la regla de Ruffini paso a paso?',
      a: 'Se escriben los coeficientes en fila. Se <b>baja el primero</b> tal cual; se lo <b>multiplica por r</b> y el producto se <b>suma</b> al siguiente coeficiente; se repite hasta el final. Las sumas obtenidas, menos la última, son los coeficientes del <b>cociente</b> (de un grado menos); la última suma es el <b>resto</b>. Con 1, −6, 11, −6 y r = 1: bajás 1 → 1 + (−6) = −5 → −5 + 11 = 6 → 6 + (−6) = <b>resto 0</b>, y el cociente es x² − 5x + 6.',
    },
    {
      q: '¿Qué diferencia hay entre Ruffini y la división larga de polinomios?',
      a: 'Ruffini es un <b>atajo</b> que sólo sirve cuando el divisor es de la forma <b>(x − r)</b>, o sea de grado 1 y con coeficiente principal 1. La división larga sirve para <b>cualquier divisor</b>: se divide el término líder, se multiplica el divisor entero, se resta y se repite. Si el divisor tiene grado 2 o más, Ruffini no aplica y hay que ir por la división larga.',
    },
    {
      q: '¿Qué significa que el resto de Ruffini dé cero?',
      a: 'Que <b>(x − r) es factor exacto</b> del polinomio y, por el teorema del resto, que <b>P(r) = 0</b>: r es raíz. Ese es justamente el método para factorizar polinomios de grado 3 o 4 a mano: se prueban los divisores del término independiente hasta que uno da resto cero, y el cociente que queda —de un grado menos— se sigue factorizando.',
    },
    {
      q: '¿Por qué me aparece un resultado como 1,9999999999 en vez de 2?',
      a: 'Porque las raíces de polinomios de grado 3 o más se calculan por <b>métodos numéricos iterativos</b>, no por fórmula cerrada: el algoritmo se acerca a la raíz hasta un margen ínfimo pero no cae exactamente. Esta página redondea al entero todo valor que quede a menos de una diezmilmillonésima de él, así que ves 2. Si aparece un decimal largo de verdad, es una raíz irracional legítima.',
    },
  ],

  sources: [
    {
      name: 'Quadratic Formula — deducción y discriminante',
      url: 'https://mathworld.wolfram.com/QuadraticFormula.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: "Ruffini's Rule — división sintética y teorema del resto",
      url: 'https://mathworld.wolfram.com/RuffinisRule.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Fundamental Theorem of Algebra — cantidad de raíces y pares conjugados',
      url: 'https://mathworld.wolfram.com/FundamentalTheoremofAlgebra.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Quadratic equations & complex numbers — curso completo',
      url: 'https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:poly-factor',
      publisher: 'Khan Academy',
    },
    {
      name: 'Intermediate Algebra 2e — capítulos de ecuaciones cuadráticas, inecuaciones y polinomios',
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
    '/calculadora-ecuacion-cuadratica-formula-resolvente',
    '/calculadora-ecuacion-cuadratica-raices-discriminante',
    '/calculadora-inecuaciones',
    '/calculadora-factorizacion-polinomios',
    '/calculadora-raices-polinomio',
    '/calculadora-division-polinomios',
    '/calculadora-regla-ruffini',
  ],

  lastReviewed: '2026-09-04',
  audience: 'global',
};
