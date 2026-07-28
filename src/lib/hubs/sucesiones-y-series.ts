import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo sigue esta sucesión y cuánto suma?"
 * Arquetipo RAMIFICADO: 5 ramas = las cinco formas en que una sucesión aparece
 * en una carpeta de secundario o en el primer año de análisis matemático.
 *
 * Absorbe 4 URLs (ver `replaces`). La de Fibonacci quedó huérfana cuando salió
 * del hub de herencia (colisión de homónimo: "sucesión" hereditaria vs
 * "sucesión" matemática): acá recupera su lugar natural.
 *
 * Taylor/Maclaurin entra como rama porque un polinomio de Taylor ES una serie
 * de potencias: mismo objeto, otra ropa. La diferencia con la calculadora vieja
 * está documentada en el reporte: la vieja derivaba simbólicamente cualquier
 * expresión con mathjs; acá trabajamos con las cinco series clásicas, que son
 * las que se piden en un parcial, y mostramos el término general.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara 'plain' o 'unit'.
 */
export const hub: HubData = {
  slug: 'matematica/sucesiones-y-series',
  title: '¿Cómo sigue esta sucesión? — Progresiones, Fibonacci y series',
  description:
    'Término general y suma de una progresión aritmética o geométrica, suma de una serie geométrica infinita, sucesión de Fibonacci y polinomio de Taylor. Con la fórmula, la sustitución y la verificación paso a paso.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de matemática',
  h1: '¿Cómo sigue esta sucesión y cuánto suma?',
  lede:
    'Una sucesión es una lista de números con una regla. Si a cada término le sumás siempre lo mismo, es aritmética; si lo multiplicás siempre por lo mismo, es geométrica. Elegí abajo tu caso y te mostramos el término general, la suma y la verificación, no sólo el número final.',
  stamps: ['Actualizado 27-07-2026', '5 tipos de sucesión adentro', 'Con la fórmula y el despeje'],

  resultLabel: 'El término aₙ (o la suma, según la rama)',

  cases: {
    title: '¿Qué tipo de sucesión tenés?',
    intro:
      'La pregunta que resuelve casi todo: entre un término y el siguiente, ¿hay una SUMA fija o una MULTIPLICACIÓN fija? Lo primero es aritmética, lo segundo geométrica.',
    items: [
      {
        id: 'aritmetica',
        label: 'Progresión aritmética (sumás siempre lo mismo)',
        hint: 'Ej.: 3, 7, 11, 15… — cada término suma 4',
        answer: 'El término n es aₙ = a₁ + (n − 1) × d, y la suma de los n primeros es Sₙ = n × (a₁ + aₙ) ÷ 2.',
        yes: [
          'Término general: aₙ = a₁ + (n − 1) × d',
          'Suma de los n primeros: Sₙ = n × (a₁ + aₙ) ÷ 2 — el promedio de las puntas por la cantidad de términos',
          'd es la diferencia: cualquier término menos el anterior, y siempre da lo mismo',
          'd puede ser negativa (la sucesión baja) o cero (queda constante)',
        ],
        warn: [
          'El (n − 1), no el n: a₁ ya es el primer término, así que del primero al n-ésimo hay n − 1 saltos',
          'Si al restar dos pares consecutivos no te da siempre lo mismo, la sucesión NO es aritmética y estas fórmulas no aplican',
          'n tiene que ser un entero positivo: no existe el término 2,5',
        ],
        plazo: 'chequeo rápido: 2 × Sₙ ÷ n tiene que dar exactamente a₁ + aₙ.',
      },
      {
        id: 'geometrica',
        label: 'Progresión geométrica (multiplicás siempre por lo mismo)',
        hint: 'Ej.: 2, 6, 18, 54… — cada término se multiplica por 3',
        answer: 'El término n es aₙ = a₁ × r^(n−1), y la suma de los n primeros es Sₙ = a₁ × (rⁿ − 1) ÷ (r − 1).',
        yes: [
          'Término general: aₙ = a₁ × r^(n − 1)',
          'Suma de los n primeros: Sₙ = a₁ × (rⁿ − 1) ÷ (r − 1), válida para r ≠ 1',
          'r es la razón: cualquier término DIVIDIDO por el anterior, y siempre da lo mismo',
          'Con r = 1 la sucesión es constante y la suma es simplemente n × a₁',
        ],
        warn: [
          'Si |r| > 1 la sucesión explota: con r = 2 y 30 términos ya estás en el orden de los mil millones',
          'Con r negativa los términos alternan de signo: 2, −6, 18, −54…',
          'Es el mismo motor del interés compuesto: r = 1 + tasa. Ojo con leer una tasa del 5% como r = 5 en vez de r = 1,05',
        ],
        plazo: 'chequeo: aₙ ÷ aₙ₋₁ tiene que dar exactamente r en cualquier par de términos consecutivos.',
      },
      {
        id: 'geometrica-infinita',
        label: 'Serie geométrica infinita (¿converge?)',
        hint: 'Ej.: 1 + ½ + ¼ + ⅛ + … ¿a cuánto tiende?',
        answer: 'Si |r| < 1 la suma infinita converge y vale S = a₁ ÷ (1 − r). Si |r| ≥ 1, diverge: no hay suma.',
        yes: [
          'Condición de convergencia: |r| < 1, o sea r estrictamente entre −1 y 1',
          'Suma infinita: S = a₁ ÷ (1 − r)',
          'Es lo que hace que 0,999… sea exactamente 1: es la serie 0,9 + 0,09 + 0,009 + … con r = 0,1',
          'Sirve para pasar un decimal periódico a fracción y para el valor de una renta perpetua',
        ],
        warn: [
          'Con |r| ≥ 1 la serie DIVERGE: la suma crece sin límite y el resultado no existe',
          'r = 1 no vale ni siquiera para la suma finita: ahí se usa Sₙ = n × a₁',
          'Que los términos tiendan a cero no garantiza que la serie converja: la armónica 1 + ½ + ⅓ + ¼ + … diverge aunque sus términos se achiquen',
        ],
        plazo: 'lectura: la suma parcial de los n primeros que ves en el desglose se acerca al límite pero nunca lo alcanza.',
      },
      {
        id: 'fibonacci',
        label: 'Sucesión de Fibonacci',
        hint: 'Ej.: 0, 1, 1, 2, 3, 5, 8, 13… ¿cuánto vale F(30)?',
        answer: 'Cada término es la suma de los dos anteriores: F(n) = F(n−1) + F(n−2), arrancando en F(0)=0 y F(1)=1.',
        yes: [
          'Regla recursiva: F(n) = F(n−1) + F(n−2), con F(0) = 0 y F(1) = 1',
          'No es aritmética ni geométrica: no hay diferencia fija ni razón fija',
          'El cociente entre términos consecutivos tiende al número áureo φ ≈ 1,618034',
          'Aparece en la filotaxis de las plantas, en la espiral de la caracola y en el análisis de algoritmos',
        ],
        warn: [
          'Cuidado con el arranque: hay libros que empiezan en 1, 1 en vez de 0, 1, y ahí todos los índices se corren uno',
          'Más allá de n = 78 los términos superan el entero seguro de JavaScript y el resultado pierde exactitud: por eso topeamos en 78',
          'Fibonacci crece exponencialmente, no linealmente: F(50) ya supera los doce mil millones',
        ],
        plazo: 'chequeo: F(n) tiene que dar igual que F(n−1) + F(n−2), que aparecen en el desglose.',
      },
      {
        id: 'taylor',
        label: 'Serie de Taylor / Maclaurin',
        hint: 'Ej.: aproximar e^0,5 con un polinomio de orden 4',
        answer: 'Una serie de potencias que aproxima la función: cuanto mayor el orden, menor el error.',
        yes: [
          'Maclaurin es el caso de Taylor centrado en 0: f(x) ≈ Σ f⁽ᵏ⁾(0) ÷ k! × xᵏ',
          'Con las cinco funciones clásicas los coeficientes se conocen de memoria y no hace falta derivar',
          'Cada término nuevo agrega precisión: el desglose muestra cuánto aporta cada uno',
          'Es la forma en que una calculadora científica calcula seno, coseno y exponencial por dentro',
        ],
        warn: [
          'Cada serie tiene su radio de convergencia: ln(1+x) y 1/(1−x) sólo valen para |x| < 1',
          'Lejos del centro la aproximación se degrada rápido aunque subas el orden',
          'Redondear a mitad de camino arrastra error: el desglose muestra el error absoluto contra el valor exacto',
        ],
        plazo: 'lectura: mirá la fila de error absoluto. Si es grande, subí el orden o acercá x al centro.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Según la rama se usan dos, tres o cuatro campos. Los que sobran quedan ahí sin molestar: el desglose te dice cuáles entraron en la cuenta.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands el parser
    // convierte "1.5" en 15. Se parsean con H.num(), que acepta coma decimal.
    { id: 'a1', label: 'a₁ — primer término', value: '3', help: 'El término con el que arranca la sucesión. No se usa en Fibonacci ni en Taylor.' },
    { id: 'dr', label: 'd o r — diferencia (aritmética) o razón (geométrica)', value: '4', help: 'En aritmética es lo que SUMÁS cada vez; en geométrica es por lo que MULTIPLICÁS. Puede ser negativa o decimal.' },
    { id: 'n', label: 'n — cuántos términos / qué posición querés', value: '10', help: 'En progresiones: la posición del término y la cantidad a sumar. En Fibonacci: qué F(n) querés (máximo 78).' },
    {
      id: 'func',
      label: 'Función a aproximar (sólo Taylor)',
      type: 'select',
      value: 'exp',
      options: [
        { value: 'exp', label: 'eˣ — exponencial' },
        { value: 'sin', label: 'sen x — seno (x en radianes)' },
        { value: 'cos', label: 'cos x — coseno (x en radianes)' },
        { value: 'ln1x', label: 'ln(1 + x) — logaritmo (|x| < 1)' },
        { value: 'geo', label: '1 / (1 − x) — serie geométrica (|x| < 1)' },
      ],
      help: 'Las cinco series de Maclaurin clásicas, centradas en 0.',
    },
    { id: 'x', label: 'x — dónde evaluás (sólo Taylor)', value: '0,5', help: 'El punto en el que querés el valor aproximado. Aceptamos coma decimal.' },
  ],
  fineprint:
    'Aceptamos coma decimal: "0,5" se lee como un medio. En la rama de Taylor, el campo n es el orden del polinomio (topeado en 12) y el centro es siempre 0 (Maclaurin).',

  chart: {
    type: 'bars',
    title: 'Los primeros términos de tu sucesión',
    caption:
      'Cada barra es un término. En una progresión aritmética las barras suben (o bajan) en escalones parejos; en una geométrica con razón mayor a 1 la última se come a todas las demás, y eso es exactamente lo que significa "crecimiento exponencial". Si tus barras no siguen ninguno de los dos patrones, elegiste el tipo equivocado.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero los datos que entraron, después la fórmula sustituida, después el resultado y al final la verificación. Si la verificación no cierra, revisá si tu sucesión es realmente del tipo que elegiste.',

  faq: [
    {
      q: '¿Cómo sé si una sucesión es aritmética o geométrica?',
      a: 'Restá términos consecutivos y después dividilos. Si la <b>resta</b> da siempre lo mismo, es <b>aritmética</b> y ese número es d. Si la <b>división</b> da siempre lo mismo, es <b>geométrica</b> y ese número es r. En 3, 7, 11, 15 las restas dan 4 → aritmética; en 2, 6, 18, 54 las divisiones dan 3 → geométrica. Si no pasa ninguna de las dos, es otra clase de sucesión (como Fibonacci).',
    },
    {
      q: '¿Cuál es la fórmula del término general de una progresión aritmética?',
      a: '<b>aₙ = a₁ + (n − 1) × d</b>. El error clásico es poner n en lugar de (n − 1): como a₁ ya es el primer término, del primero al n-ésimo hay <b>n − 1 saltos</b>, no n. Con a₁ = 3, d = 4 y n = 10: a₁₀ = 3 + 9 × 4 = <b>39</b>.',
    },
    {
      q: '¿Cómo se suman los primeros n términos de una progresión aritmética?',
      a: 'Con <b>Sₙ = n × (a₁ + aₙ) ÷ 2</b>. La idea es la de Gauss: apareás el primero con el último, el segundo con el anteúltimo, y todas las parejas suman lo mismo. Con a₁ = 3, a₁₀ = 39 y n = 10: S = 10 × 42 ÷ 2 = <b>210</b>.',
    },
    {
      q: '¿Cuál es la fórmula de la suma de una progresión geométrica?',
      a: '<b>Sₙ = a₁ × (rⁿ − 1) ÷ (r − 1)</b>, válida siempre que r ≠ 1. Con a₁ = 2, r = 3 y n = 5: S = 2 × (243 − 1) ÷ 2 = <b>242</b>. Cuando r = 1 la fórmula se indefine (dividís por cero) y la suma es simplemente <b>n × a₁</b>.',
    },
    {
      q: '¿Cuándo converge una serie geométrica infinita?',
      a: 'Sólo cuando <b>|r| &lt; 1</b>, y en ese caso la suma vale <b>S = a₁ ÷ (1 − r)</b>. Con a₁ = 1 y r = ½: S = 1 ÷ 0,5 = <b>2</b>, que es la serie 1 + ½ + ¼ + ⅛ + … Si |r| ≥ 1 los términos no se achican lo suficiente y la suma crece sin límite: la serie <b>diverge</b> y no hay resultado.',
    },
    {
      q: '¿Por qué 0,999… es igual a 1?',
      a: 'Porque es una serie geométrica infinita con a₁ = 0,9 y r = 0,1. Aplicando S = a₁ ÷ (1 − r): 0,9 ÷ 0,9 = <b>1</b> exacto. No es "casi 1" ni una aproximación: son dos escrituras del mismo número real. El mismo truco pasa cualquier decimal periódico a fracción.',
    },
    {
      q: '¿Cómo se calcula el término n de Fibonacci?',
      a: 'Sumando los dos anteriores: <b>F(n) = F(n−1) + F(n−2)</b>, con F(0) = 0 y F(1) = 1. Así sale 0, 1, 1, 2, 3, 5, 8, 13, 21… F(10) = <b>55</b> y F(30) = <b>832.040</b>. Ojo con el arranque: algunos textos empiezan en 1, 1 y ahí todos los índices se corren un lugar.',
    },
    {
      q: '¿Qué relación tiene Fibonacci con el número áureo?',
      a: 'El cociente entre dos términos consecutivos <b>tiende a φ ≈ 1,618034</b>. Con números chicos la aproximación es grosera (5 ÷ 3 = 1,667), pero para F(20) ÷ F(19) ya coincide en seis decimales. Es una propiedad del límite, no una coincidencia: φ es la solución positiva de x² = x + 1, que es exactamente la regla recursiva de la sucesión.',
    },
    {
      q: '¿La progresión geométrica es lo mismo que el interés compuesto?',
      a: 'Es la misma matemática. El capital año a año forma una progresión geométrica de razón <b>r = 1 + tasa</b>: al 5% anual, r = 1,05, no 5. Por eso duplicar el plazo no duplica el resultado. La confusión entre la tasa y la razón es el error más caro que se comete con esta fórmula.',
    },
    {
      q: '¿Qué es una serie de Taylor y para qué sirve?',
      a: 'Es un polinomio que imita a una función cerca de un punto: <b>f(x) ≈ Σ f⁽ᵏ⁾(a) ÷ k! × (x − a)ᵏ</b>. Cuando el centro es a = 0 se llama <b>Maclaurin</b>. Sirve para calcular valores que no tienen fórmula cerrada: es lo que hace tu calculadora por dentro cuando le pedís un seno o un exponencial.',
    },
    {
      q: '¿Cuál es la serie de Maclaurin de eˣ, sen x y cos x?',
      a: '<b>eˣ = 1 + x + x²/2! + x³/3! + …</b> (converge para todo x). <b>sen x = x − x³/3! + x⁵/5! − …</b> y <b>cos x = 1 − x²/2! + x⁴/4! − …</b>, las dos con x en <b>radianes</b> y también válidas para todo x. En cambio ln(1+x) y 1/(1−x) sólo convergen para |x| &lt; 1.',
    },
    {
      q: '¿Cuántos términos de Taylor necesito para que el error sea chico?',
      a: 'Depende de qué tan lejos del centro estés. Cerca de 0 alcanza con 4 o 5 términos para varios decimales; a x = 3 podés necesitar 12 o más. La regla práctica es mirar el <b>error absoluto</b> que aparece en el desglose: si no te alcanza, subí el orden o cambiá el centro para acercarte al punto que te interesa.',
    },
  ],

  sources: [
    {
      name: 'Sucesiones y progresiones — recursos de matemática',
      url: 'https://www.educ.ar/recursos/buscar?tema=matematica',
      publisher: 'Educ.ar — Ministerio de Educación de la Nación',
    },
    {
      name: 'Sequences, series and induction',
      url: 'https://www.khanacademy.org/math/algebra-home/alg-series-and-induction',
      publisher: 'Khan Academy',
    },
    {
      name: 'The On-Line Encyclopedia of Integer Sequences — A000045 (Fibonacci)',
      url: 'https://oeis.org/A000045',
      publisher: 'OEIS Foundation',
    },
    {
      name: 'Taylor series — MIT OpenCourseWare, Single Variable Calculus',
      url: 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/',
      publisher: 'MIT OpenCourseWare',
    },
    {
      name: 'DLMF — Elementary functions: series expansions',
      url: 'https://dlmf.nist.gov/4',
      publisher: 'NIST Digital Library of Mathematical Functions',
    },
  ],

  replaces: [
    '/calculadora-progresion-aritmetica',
    '/calculadora-progresion-geometrica-suma-termino',
    '/calculadora-sucesion-fibonacci-termino-n',
    '/calculadora-serie-taylor-maclaurin',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
