import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo calculo este límite o esta integral?"
 * Arquetipo RAMIFICADO: 5 ramas que cubren el otro medio del análisis, el que
 * no es derivar. Absorbe 6 URLs (ver `replaces`).
 *
 * La transformada de Laplace se absorbe SÓLO POR URL: es un tema aparte (una
 * herramienta de ecuaciones diferenciales, no una pregunta de análisis I) y
 * meterle una rama rompería el foco del hub. Va al 301 y nada más.
 *
 * Es contenido de ESTUDIANTE: cada fila del desglose es un paso del método
 * —sustitución directa, laterales, L'Hôpital, primitiva, evaluación— y siempre
 * hay una verificación por un camino independiente (Barrow contra Simpson,
 * simbólico contra numérico).
 *
 * FORMATO: no hay plata en ninguna rama; el default de HubRow es 'ars', así
 * que TODA fila declara `format` explícito ('plain' o 'unit').
 *
 * PRECISIÓN: todo resultado pasa por snap() — lo que quede a menos de 1e-10 de
 * un entero se redondea al entero y el "-0" se normaliza a 0.
 */
export const hub: HubData = {
  slug: 'matematica/limites-e-integrales',
  title: '¿Cómo calculo este límite o esta integral? — Paso a paso',
  description:
    "Límites en un punto y en el infinito con indeterminaciones 0/0 e ∞/∞ y regla de L'Hôpital, dominio y rango, asíntotas verticales, horizontales y oblicuas, integral definida por la regla de Barrow y área entre dos curvas.",
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de análisis matemático',
  h1: '¿Cómo calculo este límite o esta integral?',
  lede:
    'Límites e integrales son las dos preguntas que sostienen todo el análisis: a qué valor se arrima una función y cuánto suma debajo de su curva. Empezamos por el límite en un punto —el caso que aparece primero en cualquier cursada— y si lo tuyo es el dominio, las asíntotas, una integral definida o el área entre dos curvas, lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '5 métodos adentro', "Con L'Hôpital y la verificación numérica"],

  // Genérico a propósito: según la rama el número grande es un límite, una
  // integral, un área o el valor de una asíntota.
  resultLabel: 'El resultado del cálculo',

  cases: {
    title: '¿Qué te están pidiendo?',
    intro:
      'Elegí el tipo de cuenta. El método cambia bastante entre una y otra, pero todas comparten la misma idea de fondo: acercarse a un valor que no se puede calcular de una.',
    items: [
      {
        id: 'limite',
        label: 'Límite en un punto o en el infinito',
        hint: 'Ej.: "lím (x²−1)/(x−1) cuando x → 1" o "cuando x → ∞"',
        answer:
          'Primero probás sustitución directa; si te da una indeterminación 0/0 o ∞/∞, aplicás L\'Hôpital: derivás numerador y denominador por separado y volvés a evaluar.',
        yes: [
          'Paso 1: sustitución directa. Si da un número, ese es el límite y terminaste',
          'Paso 2: si da 0/0 o ∞/∞, es una indeterminación: el límite puede existir igual',
          "Paso 3 (L'Hôpital): derivás arriba y abajo por separado —NO es la regla del cociente— y volvés a evaluar",
          'Paso 4: los límites laterales. Si el de izquierda y el de derecha no coinciden, el límite NO existe',
          'Para x → ∞ escribí "inf" (o "-inf"): se evalúa la función en valores enormes y se compara con los grados',
        ],
        warn: [
          'Que la sustitución directa dé 0/0 no significa que el límite no exista: significa que hay que trabajar más',
          "L'Hôpital NO es la derivada del cociente: se derivan numerador y denominador por separado",
          "L'Hôpital sólo vale para 0/0 y ∞/∞. Para 0·∞, ∞−∞ o 1^∞ hay que reescribir la expresión primero",
          'En x → 0 de 1/x los laterales dan −∞ y +∞: son distintos, así que el límite bilateral no existe',
        ],
        plazo: 'chequeo: si el límite existe, los dos laterales del desglose tienen que dar prácticamente el mismo número.',
      },
      {
        id: 'dominio',
        label: 'Dominio y rango de una función',
        hint: 'Ej.: "¿cuál es el dominio de 1/(x−2)?" o de √x',
        answer:
          'El dominio son los x que la función acepta; el rango, los y que llega a devolver. Las restricciones vienen de tres lugares: denominadores, raíces pares y logaritmos.',
        yes: [
          'Denominador: no puede valer 0 — hay que excluir sus raíces',
          'Raíz par: el radicando tiene que ser ≥ 0',
          'Logaritmo: el argumento tiene que ser estrictamente > 0',
          'El rango se estima barriendo la función sobre un intervalo grande y mirando hasta dónde llega',
          'Polinomios y exponenciales no tienen restricciones: su dominio son todos los reales',
        ],
        warn: [
          'El rango que ves acá es una ESTIMACIÓN numérica sobre el intervalo explorado, no una demostración',
          'Si la función tiene una asíntota vertical, el rango real puede ser infinito aunque el barrido muestre un número finito',
          'Una función definida a trozos o con valor absoluto puede tener un rango que este barrido no captura del todo',
        ],
        plazo: 'chequeo: contá las restricciones del desglose — si son 0, el dominio son todos los reales.',
      },
      {
        id: 'asintotas',
        label: 'Asíntotas de una función racional',
        hint: 'Ej.: "las asíntotas de (x²−1)/(x−2)", cargando 1,0,−1 y 1,−2',
        answer:
          'Las verticales salen de los ceros del denominador; lo que pasa en el infinito lo decide la comparación de grados entre numerador y denominador.',
        yes: [
          'Vertical: en cada cero del denominador que NO anule también al numerador',
          'Si un cero anula a los dos, ahí no hay asíntota sino un hueco (una discontinuidad evitable)',
          'Grado del numerador < grado del denominador → asíntota horizontal y = 0',
          'Grados iguales → horizontal y = cociente de los coeficientes principales',
          'Grado del numerador exactamente uno más → asíntota OBLICUA, que sale de la división de polinomios',
          'Dos grados o más de diferencia → no hay asíntota recta, la rama crece como una parábola o peor',
        ],
        warn: [
          'Los coeficientes se cargan del mayor grado al independiente y los ceros intermedios hay que escribirlos',
          'Horizontal y oblicua nunca conviven: o una o la otra',
          'La función puede CRUZAR su asíntota horizontal; lo que no puede es cruzar una vertical',
        ],
        plazo: 'chequeo: la diferencia de grados del desglose es la que manda. 0 → horizontal con cociente; negativa → y = 0; 1 → oblicua.',
      },
      {
        id: 'integral',
        label: 'Integral definida (regla de Barrow)',
        hint: 'Ej.: "∫ x² dx entre 0 y 3"',
        answer:
          'Buscás la primitiva F(x), la evaluás en los dos extremos y restás: ∫ de a a b = F(b) − F(a).',
        yes: [
          'Regla de la potencia al revés: la primitiva de xⁿ es xⁿ⁺¹/(n+1), con n ≠ −1',
          'Teorema fundamental (regla de Barrow): ∫ de a a b de f = F(b) − F(a)',
          'La constante de integración se cancela en la resta: en la definida no hace falta escribirla',
          'El resultado es el área NETA con signo: lo que queda debajo del eje x resta',
          'Si la primitiva no es elemental, se calcula igual por el método numérico de Simpson',
        ],
        warn: [
          'Área neta no es lo mismo que área total: entre −2 y 2, ∫x³ da 0 y sin embargo hay área de los dos lados',
          'Para n = −1 la primitiva es ln|x|, un caso aparte que la regla de la potencia no cubre',
          'Si la función tiene una discontinuidad dentro del intervalo, la integral es impropia y esto no aplica',
          'Dar vuelta los límites cambia el signo del resultado',
        ],
        plazo: 'chequeo: el desglose calcula lo mismo por Barrow y por Simpson. Si los dos coinciden, el resultado es sólido.',
      },
      {
        id: 'area',
        label: 'Área entre dos curvas',
        hint: 'Ej.: "el área entre y = x² e y = x, de 0 a 1"',
        answer:
          'Integrás la diferencia f − g, pero cortando el intervalo en cada cruce y sumando los valores absolutos.',
        yes: [
          'Paso 1: encontrar dónde se cruzan las curvas, o sea los ceros de f(x) − g(x)',
          'Paso 2: en cada tramo entre cruces, integrar la diferencia',
          'Paso 3: sumar los VALORES ABSOLUTOS de cada tramo — el área nunca es negativa',
          'Si las curvas no se cruzan adentro del intervalo, hay un solo tramo y listo',
          'Sirve para superficie de una región, trabajo entre dos fuerzas y excedente del consumidor',
        ],
        warn: [
          'Si integrás la diferencia de una sola vez sin cortar en los cruces, los tramos se cancelan entre sí y el área te da de menos',
          'El orden f − g no importa mientras tomes el valor absoluto tramo por tramo',
          'El límite superior tiene que ser mayor que el inferior',
        ],
        plazo: 'chequeo: compará el área total con la integral firmada del desglose. Si son distintas, hubo cruce y las curvas se dieron vuelta.',
      },
    ],
  },

  inputsTitle: 'Cargá tu función',
  inputsIntro:
    'Según la rama se usan dos, tres o cuatro campos; los que sobran quedan ahí sin molestar. La notación es la de siempre: ^ para potencias, * o nada para multiplicar (2x y 2*x son lo mismo), y sin(), cos(), tan(), exp(), ln(), sqrt() para las funciones.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands se rompen
    // tanto la coma decimal como las expresiones.
    { id: 'funcion', label: 'f(x) — la función', value: '(x^2-1)/(x-1)', help: 'La función principal: la del límite, la del dominio, la que integrás o la primera del área.' },
    { id: 'punto', label: 'x → (el punto al que tiende)', value: '1', help: 'Sólo la rama de límites. Escribí "inf" o "-inf" para el infinito.' },
    { id: 'desde', label: 'Desde x =', value: '0', help: 'Límite inferior de integración (ramas de integral y de área).' },
    { id: 'hasta', label: 'Hasta x =', value: '3', help: 'Límite superior de integración (ramas de integral y de área).' },
    { id: 'funcion2', label: 'g(x) — la segunda función', value: 'x', help: 'Sólo la rama de área entre curvas. Puede ser una constante, como "0" o "4".' },
    { id: 'numerador', label: 'Coeficientes del numerador', value: '1, 0, -1', help: 'Sólo asíntotas. Del mayor grado al independiente: "1, 0, -1" es x² − 1. Los ceros hay que escribirlos.' },
    { id: 'denominador', label: 'Coeficientes del denominador', value: '1, -2', help: 'Sólo asíntotas. "1, -2" es x − 2.' },
  ],
  fineprint:
    'Los límites se resuelven combinando sustitución directa, laterales y L\'Hôpital simbólico; las asíntotas, de forma exacta a partir de los coeficientes. Las integrales se calculan por Barrow cuando la primitiva es elemental y, en paralelo, siempre por el método numérico de Simpson: las dos aparecen en el desglose para que puedas contrastarlas. El rango de una función es una estimación numérica sobre el intervalo explorado, no una demostración.',

  chart: {
    type: 'bars',
    title: 'Cómo se reparte el resultado',
    caption:
      'Las barras muestran de qué está hecho el número final: en las integrales, cuánta área aporta el tramo que queda por encima del eje y cuánta el que queda por debajo —por eso el área neta puede ser mucho menor que la total—; en el área entre curvas, cuánto pone cada tramo entre cruces; y en los límites, cómo se comparan el valor por izquierda, el valor por derecha y el resultado.',
  },
  breakdownTitle: 'El método, paso a paso',
  breakdownIntro:
    'Cada fila es un paso con nombre: qué se probó, qué dio y qué se hizo después. La última fila siempre contrasta el resultado con otro camino —Simpson contra Barrow, laterales contra sustitución— para que no tengas que creernos.',

  faq: [
    {
      q: '¿Cómo se calcula un límite paso a paso?',
      a: 'Primero probás <b>sustitución directa</b>: reemplazás x por el valor al que tiende. Si te da un número, ese es el límite. Si te da <b>0/0</b> o <b>∞/∞</b>, tenés una indeterminación y pasás a la segunda herramienta: factorizar y simplificar, o aplicar la regla de L\'Hôpital. Y si querés estar seguro de que existe, comprobás que los límites por izquierda y por derecha coincidan.',
    },
    {
      q: '¿Qué es una indeterminación 0/0 y qué significa?',
      a: 'Significa que numerador y denominador se van a cero al mismo tiempo y que <b>la sustitución directa no alcanza</b> para decidir. No quiere decir que el límite no exista ni que valga 0 o 1. En lím (x²−1)/(x−1) cuando x → 1 la sustitución da 0/0, pero factorizando queda (x+1)(x−1)/(x−1) = x+1, así que el límite es <b>2</b>.',
    },
    {
      q: "¿Cómo se aplica la regla de L'Hôpital?",
      a: 'Cuando el límite de f(x)/g(x) da <b>0/0</b> o <b>∞/∞</b>, se derivan numerador y denominador <b>por separado</b> y se vuelve a evaluar: lím f/g = lím f′/g′. Ejemplo clásico: lím sen(x)/x cuando x → 0 da 0/0, y derivando queda cos(x)/1, que en 0 vale <b>1</b>. Cuidado: esto NO es la regla del cociente; nadie deriva la fracción entera.',
    },
    {
      q: '¿Cómo se calcula un límite cuando x tiende a infinito?',
      a: 'En una función racional se comparan los <b>grados</b>. Si el de arriba es menor, el límite es <b>0</b>. Si son iguales, es el <b>cociente de los coeficientes principales</b> (en (x²+3x)/(2x²−1) da 1/2). Si el de arriba es mayor, el límite es <b>±∞</b>. El truco a mano es dividir todo por la mayor potencia de x y ver qué términos se van a cero.',
    },
    {
      q: '¿Cuándo NO existe un límite?',
      a: 'Cuando los <b>laterales no coinciden</b>. El caso de manual es 1/x en x → 0: por izquierda se va a −∞ y por derecha a +∞, así que el límite bilateral no existe (aunque cada lateral sí exista, como límite infinito). También falla cuando la función oscila sin estabilizarse, como sen(1/x) cerca de 0.',
    },
    {
      q: '¿Cómo saco el dominio de una función?',
      a: 'Buscás los valores de x que la función <b>no acepta</b>, y son de tres tipos: los que anulan un <b>denominador</b>, los que dejan un <b>radicando negativo</b> en una raíz par y los que hacen que el <b>argumento de un logaritmo</b> sea ≤ 0. El dominio de 1/(x−2) es todos los reales menos 2; el de √x es x ≥ 0. Polinomios y exponenciales aceptan todo.',
    },
    {
      q: '¿Cómo encuentro las asíntotas de una función racional?',
      a: 'Las <b>verticales</b> están en los ceros del denominador que no anulen también al numerador (si anulan a los dos hay un hueco, no una asíntota). Para el infinito mandan los grados: si el de arriba es menor la asíntota es <b>y = 0</b>; si son iguales es <b>y = cociente de coeficientes principales</b>; y si el de arriba es exactamente uno más, hay una <b>asíntota oblicua</b> que se obtiene dividiendo los polinomios.',
    },
    {
      q: '¿Cuándo hay asíntota oblicua y cómo se calcula?',
      a: 'Sólo cuando el grado del numerador es <b>exactamente uno mayor</b> que el del denominador. Se hace la división de polinomios y el <b>cociente</b> —una recta y = mx + b— es la asíntota; el resto se va a cero cuando x crece. En (x²−1)/(x−2) la división da x + 2, así que la oblicua es <b>y = x + 2</b>.',
    },
    {
      q: '¿Qué es la regla de Barrow y cómo se usa?',
      a: 'Es el teorema fundamental del cálculo aplicado: para integrar f entre a y b, se busca una <b>primitiva F</b> (una función cuya derivada sea f), se la evalúa en los dos extremos y se resta: <b>∫ de a a b = F(b) − F(a)</b>. Para ∫x² entre 0 y 3, la primitiva es x³/3, así que da 27/3 − 0 = <b>9</b>. La constante de integración se cancela sola en la resta.',
    },
    {
      q: '¿Por qué una integral definida puede dar negativa?',
      a: 'Porque la integral mide <b>área con signo</b>: lo que queda por encima del eje x suma y lo que queda por debajo resta. Por eso ∫x³ entre −2 y 2 da exactamente <b>0</b> aunque haya un montón de área de los dos lados: se cancelan. Si lo que querés es el área geométrica, hay que cortar en los ceros e ir sumando valores absolutos.',
    },
    {
      q: '¿Cómo calculo el área entre dos curvas?',
      a: 'Integrando la <b>diferencia</b> f − g, pero con un paso previo que casi todo el mundo se saltea: hay que encontrar los <b>cruces</b> entre las curvas dentro del intervalo, cortar ahí y sumar el valor absoluto de cada tramo. Entre y = x e y = x³ de −1 a 1 se cruzan en 0; si integrás de una, los tramos se cancelan y te da 0 en lugar de <b>0,5</b>.',
    },
    {
      q: '¿Qué diferencia hay entre una integral definida y una indefinida?',
      a: 'La <b>indefinida</b> devuelve una familia de funciones —la primitiva más una constante C— y responde "¿de qué función viene esta derivada?". La <b>definida</b> devuelve un número: el área neta entre dos límites concretos. Están unidas por la regla de Barrow, que usa la primitiva de la indefinida para resolver la definida.',
    },
    {
      q: '¿Qué es el método de Simpson y por qué aparece acá?',
      a: 'Es una forma <b>numérica</b> de aproximar una integral: en vez de buscar la primitiva, aproxima la curva con arcos de parábola sobre muchos subintervalos y suma. Sirve cuando la primitiva no es elemental —el caso de e^(−x²), por ejemplo— y acá se usa también como <b>control</b>: si Barrow y Simpson dan lo mismo, el resultado es confiable.',
    },
  ],

  sources: [
    {
      name: "Límites, continuidad y regla de L'Hôpital",
      url: 'https://es.khanacademy.org/math/differential-calculus/dc-limits',
      publisher: 'Khan Academy (en español)',
    },
    {
      name: 'Integrales definidas, teorema fundamental del cálculo y área entre curvas',
      url: 'https://tutorial.math.lamar.edu/Classes/CalcI/DefnOfDefiniteIntegral.aspx',
      publisher: "Paul's Online Math Notes — Lamar University",
    },
    {
      name: '18.01 Single Variable Calculus — límites, integración y aplicaciones',
      url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/',
      publisher: 'MIT OpenCourseWare',
    },
    {
      name: 'Calculus of One Variable — límites, integrales y cuadratura numérica',
      url: 'https://dlmf.nist.gov/1.4',
      publisher: 'NIST Digital Library of Mathematical Functions',
    },
    {
      name: 'Quadrature — fórmulas de Simpson y error del método',
      url: 'https://dlmf.nist.gov/3.5',
      publisher: 'NIST Digital Library of Mathematical Functions',
    },
  ],

  replaces: [
    '/calculadora-limites-paso-a-paso',
    '/calculadora-dominio-rango-funcion',
    '/calculadora-asintotas-funcion',
    '/calculadora-integral-definida-basica',
    '/calculadora-area-entre-curvas',
    // Absorbida SÓLO por URL: la transformada de Laplace es una herramienta de
    // ecuaciones diferenciales, no una pregunta de análisis I. Sin rama propia
    // para no romper el foco del hub. Ver reporte.
    '/calculadora-transformada-laplace',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
