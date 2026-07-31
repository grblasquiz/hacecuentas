import type { HubData } from './types';

/**
 * Hub de decisión — "Potencias, raíces, logaritmos y factorización"
 * Arquetipo: RAMIFICADO. Cuatro familias, una rama cada una:
 *   potencias · logaritmos · MCD/MCM y primos · notación científica.
 *
 * Absorbe 10 calculadoras sueltas (ver `replaces`).
 *
 * Criterio de producto: es una herramienta de estudiante, así que el desglose
 * muestra el PROCEDIMIENTO y no sólo el número — la factorización en primos
 * paso a paso, el MCD por el algoritmo de Euclides con sus restos, el cambio
 * de base del logaritmo. Eso es lo que una calculadora de celular no da.
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - Acá NO hay plata: TODA fila lleva `format: 'plain'` (o `'unit'` cuando la
 *    fila es un exponente o una cantidad de divisores). El default del contrato
 *    es 'ars' y `Object.assign` copia `undefined`, así que una fila sin format
 *    propio saldría con "$" adelante.
 *  - `chart.type: 'scale'`: el runtime dibuja la barra de franjas y usa
 *    `position` (0-100) + `positionLabel`. Las franjas son órdenes de magnitud
 *    (exponentes de 10), que es la única lectura común a las cuatro ramas.
 */
export const hub: HubData = {
  slug: 'matematica/potencias-y-raices',
  title: 'Calculadora de MCM y MCD, potencias, raíces y logaritmos',
  description:
    'Calculá potencias y raíces, logaritmos en cualquier base, MCD y MCM por el algoritmo de Euclides, números primos y factorización, y notación científica. Con el procedimiento completo, no sólo el resultado.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Calculadora con procedimiento',
  h1: 'Mínimo común múltiplo (MCM), MCD, potencias y raíces',
  lede:
    'Calculá el mínimo común múltiplo (MCM) o el máximo común divisor (MCD) de dos números, o elegí potencias, raíces y logaritmos. Te mostramos la descomposición en primos, el algoritmo de Euclides y cada paso de la cuenta.',
  stamps: [
    'Actualizado 27-07-2026',
    'Con el paso a paso de cada cuenta',
    '10 calculadoras adentro',
  ],

  resultLabel: 'Resultado',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Partimos por potencias y raíces, que es lo que más se busca. Los campos de abajo cambian de significado según la rama: la ayuda de cada campo te dice qué poner en cada caso.',
    items: [
      {
        id: 'potencias',
        label: 'Potencias y raíces',
        hint: 'xⁿ · √x · ∛x · raíz n-ésima',
        answer: 'Una raíz es una potencia de exponente fraccionario: ⁿ√x = x^(1/n).',
        yes: [
          'Potencia: se multiplica la base por sí misma tantas veces como diga el exponente (2⁵ = 2×2×2×2×2 = 32)',
          'Exponente 0: cualquier base distinta de cero da 1 (7⁰ = 1)',
          'Exponente negativo: invierte la base (2⁻³ = 1/2³ = 0,125)',
          'Raíz n-ésima: el número que elevado a n devuelve el radicando (∛27 = 3 porque 3³ = 27)',
          'Te decimos si la raíz es exacta o irracional, y cuál es el cuadrado o cubo perfecto más cercano',
        ],
        warn: [
          'No existe raíz de índice par de un número negativo dentro de los números reales: √−9 no tiene solución real',
          'La raíz de índice impar sí acepta negativos: ∛−8 = −2, porque (−2)³ = −8',
          '−2⁴ y (−2)⁴ no son lo mismo: sin paréntesis el signo queda afuera y da −16, con paréntesis da 16',
        ],
        plazo: 'con exponentes muy grandes el resultado pasa a notación científica: mirá el orden de magnitud, no las últimas cifras.',
      },
      {
        id: 'logaritmos',
        label: 'Logaritmos',
        hint: 'log₁₀ · ln · log₂ · cualquier base',
        answer: 'El logaritmo es el exponente: log_b(x) responde "a qué elevo b para obtener x".',
        yes: [
          'Logaritmo decimal (base 10), natural (base e ≈ 2,71828) y binario (base 2), los tres a la vez',
          'Logaritmo en la base que quieras, resuelto por el cambio de base: log_b(x) = ln(x) / ln(b)',
          'La comprobación: elevamos la base al resultado y verificás que vuelve al número original',
          'Casos exactos reconocidos: log₂(8) = 3 sale 3, no 2,9999999999999996',
        ],
        warn: [
          'El logaritmo sólo existe para números mayores que cero: no hay log de 0 ni de negativos en los reales',
          'La base tiene que ser positiva y distinta de 1: con base 1 no hay exponente que dé otra cosa que 1',
          'En calculadoras y planillas "log" suele ser base 10 y "ln" base e, pero en textos de matemática pura "log" a veces significa el natural: fijate el contexto',
        ],
        plazo: 'si el resultado te sale con una cola de nueves o de ceros, es el redondeo binario: nosotros lo ajustamos.',
      },
      {
        id: 'divisores',
        label: 'MCD, MCM, primos y factorización',
        hint: 'Euclides y descomposición',
        answer: 'El MCD sale por Euclides y el MCM por la relación MCD × MCM = a × b.',
        yes: [
          'Máximo común divisor por el algoritmo de Euclides, con cada división y cada resto a la vista',
          'Mínimo común múltiplo, con el atajo MCM(a,b) = a × b / MCD(a,b)',
          'Descomposición en factores primos de cada número, con los exponentes agrupados (360 = 2³ × 3² × 5)',
          'Test de primalidad del primer número, con el primo anterior y el siguiente',
          'Acepta más de dos números: agregá los que quieras en el campo de lista',
        ],
        warn: [
          'El 1 no es primo ni compuesto: quedó fuera por convención, para que la factorización de cada número sea única',
          'Dos números son coprimos cuando su MCD es 1; ahí el MCM es directamente el producto',
          'Trabajamos con enteros: los decimales se truncan y el cero se descarta, porque no tiene divisores propios',
        ],
        plazo: 'con números de más de 12 cifras la factorización se vuelve lenta: es la propiedad en la que se apoya la criptografía.',
      },
      {
        id: 'cientifica',
        label: 'Notación científica',
        hint: 'mantisa × 10ⁿ y prefijos SI',
        answer: 'La notación científica deja una sola cifra antes de la coma: 4.500 = 4,5 × 10³.',
        yes: [
          'Pasaje a notación científica: mantisa entre 1 y 10, por una potencia de 10',
          'Notación de ingeniería: el exponente siempre múltiplo de 3, para que calce con los prefijos del SI',
          'El prefijo que corresponde: kilo, mega, giga, tera, mili, micro, nano, pico',
          'También lee la entrada al revés: escribí 3,2e8 o 3,2×10^8 y te lo expande',
        ],
        warn: [
          'El 0 no tiene notación científica: no se puede escribir como mantisa por una potencia de 10',
          'Correr la coma a la derecha sube el exponente y correrla a la izquierda lo baja: el signo del exponente no depende del signo del número',
          'La notación científica no agrega precisión: 4,50 × 10³ dice tres cifras significativas y 4,5 × 10³ dice dos',
        ],
        plazo: 'por encima de 10¹⁵ y por debajo de 10⁻⁵ el resultado sale directamente en notación científica.',
      },
    ],
  },

  inputsTitle: 'Completá los números',
  inputsIntro:
    'Los campos que no hacen falta en la rama elegida se ocultan solos. Podés escribir con coma o con punto decimal.',
  fields: [
    {
      id: 'op',
      label: 'Potencia o raíz',
      type: 'select',
      value: 'potencia',
      options: [
        { value: 'potencia', label: 'Potencia — elevar la base al exponente (xⁿ)' },
        { value: 'raiz', label: 'Raíz — sacar la raíz de índice n (ⁿ√x)' },
      ],
    },
    {
      id: 'x',
      label: 'Primer número',
      value: '8',
      help: 'Potencias: la base. Raíces: el radicando (el número de adentro). Logaritmos: el número del que sacás el logaritmo. MCD y MCM: el primer número. Notación científica: el número a convertir.',
    },
    {
      id: 'y',
      label: 'Segundo número',
      value: '3',
      help: 'Potencias: el exponente. Raíces: el índice (2 = raíz cuadrada, 3 = cúbica). Logaritmos: la base (10, 2, o 2,71828 para el natural). MCD y MCM: el segundo número.',
    },
    {
      id: 'lista',
      label: 'Más números (opcional, separados por coma)',
      value: '',
      help: 'Sólo para MCD y MCM. Si querés el MCD de tres o más números, agregalos acá: 24, 36, 60.',
    },
  ],
  fineprint:
    'Todo se calcula en punto flotante de doble precisión, que es lo que usa cualquier navegador. Cuando un resultado queda a menos de una diezmilmillonésima de un entero lo devolvemos como entero: por eso log₂(8) da 3 y no 2,9999999999999996.',

  chart: {
    type: 'scale',
    title: 'Orden de magnitud del resultado',
    caption:
      'La regla va de 10⁻⁹ a 10¹⁵ en escala logarítmica: cada franja es un salto de mil veces. Sirve para lo que el número solo no dice — si 2⁴⁰ está en el orden de los billones, si una raíz quedó por debajo de la unidad, o en qué prefijo del SI cae el resultado de la notación científica.',
    bands: [
      { label: '10⁻⁹ a 10⁻⁶ — nano a micro (milmillonésimas)', from: -9, to: -6, tone: 'neutral' },
      { label: '10⁻⁶ a 10⁻³ — micro a mili (millonésimas)', from: -6, to: -3, tone: 'neutral' },
      { label: '10⁻³ a 10⁰ — milésimas hasta la unidad', from: -3, to: 0, tone: 'good' },
      { label: '10⁰ a 10³ — de 1 a mil', from: 0, to: 3, tone: 'good' },
      { label: '10³ a 10⁶ — de mil a un millón (kilo, mega)', from: 3, to: 6, tone: 'warn' },
      { label: '10⁶ a 10⁹ — de un millón a mil millones (giga)', from: 6, to: 9, tone: 'warn' },
      { label: '10⁹ a 10¹⁵ — miles de millones y billones (tera, peta)', from: 9, to: 15, tone: 'bad' },
    ],
  },
  breakdownTitle: 'El paso a paso',
  breakdownIntro:
    'Acá va el procedimiento completo, en el orden en que se escribe en la carpeta. Las barras sólo comparan magnitudes entre filas: en esta calculadora lo que importa es el número y la línea que lo explica, no el largo de la barra.',

  faq: [
    {
      q: '¿Cómo se calcula un logaritmo en una base que no es 10 ni e?',
      a: 'Con el cambio de base: log_b(x) = ln(x) / ln(b), o equivalentemente log(x) / log(b) usando logaritmo decimal. Da lo mismo con qué logaritmo intermedio lo hagas, porque el cociente cancela la base auxiliar. Por ejemplo log₇(343) = ln(343) / ln(7) = 5,8377 / 1,9459 = 3, y efectivamente 7³ = 343.',
    },
    {
      q: '¿Por qué mi calculadora da log₂(8) = 2,9999999999999996?',
      a: 'Porque ln(8) y ln(2) se guardan como números binarios de doble precisión y ninguno de los dos es exacto, así que el cociente queda una milésima de billonésima por debajo de 3. No es un error del logaritmo, es cómo la computadora representa los decimales. Acá redondeamos cuando el resultado queda a menos de 10⁻¹⁰ de un entero, así que vas a ver 3.',
    },
    {
      q: '¿Cómo funciona el algoritmo de Euclides para el MCD?',
      a: 'Se divide el número mayor por el menor y se guarda el resto; después se divide el divisor por ese resto, y así hasta que el resto da cero. El último divisor distinto de cero es el MCD. Con 48 y 18: 48 = 2×18 + 12, 18 = 1×12 + 6, 12 = 2×6 + 0. El MCD es 6. Es el algoritmo más antiguo que se sigue usando y aparece en los Elementos de Euclides.',
    },
    {
      q: '¿Cómo saco el MCM si ya tengo el MCD?',
      a: 'Con la relación MCD(a,b) × MCM(a,b) = a × b. Despejando, MCM = a × b / MCD. Con 48 y 18: 48 × 18 / 6 = 144. Para tres o más números se aplica de a pares, arrastrando el resultado: MCM(a,b,c) = MCM(MCM(a,b), c).',
    },
    {
      q: '¿Cómo se factoriza un número en primos paso a paso?',
      a: 'Se divide por el primo más chico que entre, y se repite con el cociente hasta llegar a 1. Con 360: 360/2 = 180, 180/2 = 90, 90/2 = 45, 45/3 = 15, 15/3 = 5, 5/5 = 1. Los divisores usados son 2, 2, 2, 3, 3, 5, así que 360 = 2³ × 3² × 5. El teorema fundamental de la aritmética garantiza que esa descomposición es única para cada número.',
    },
    {
      q: '¿Por qué el 1 no es un número primo?',
      a: 'Porque si lo fuera la factorización en primos dejaría de ser única: 6 podría escribirse 2×3, pero también 1×2×3, 1×1×2×3 y así infinitamente. Excluirlo por convención mantiene el teorema fundamental de la aritmética limpio. El 1 no es primo ni compuesto; el primo más chico es el 2, y es el único primo par.',
    },
    {
      q: '¿Qué diferencia hay entre −2⁴ y (−2)⁴?',
      a: 'Muchísima: −2⁴ = −16 y (−2)⁴ = 16. Sin paréntesis, la potencia se aplica sólo al 2 y el signo menos queda afuera multiplicando. Con paréntesis, la base es −2 y como el exponente es par el resultado sale positivo. Es el error más frecuente al pasar una cuenta escrita a la calculadora.',
    },
    {
      q: '¿Se puede sacar la raíz cuadrada de un número negativo?',
      a: 'En los números reales no: ningún real elevado al cuadrado da negativo. Hace falta la unidad imaginaria i, definida como √−1, y entonces √−9 = 3i. En cambio la raíz de índice impar sí acepta negativos sin salir de los reales: ∛−8 = −2, porque (−2)³ = −8.',
    },
    {
      q: '¿Qué significa un exponente negativo o fraccionario?',
      a: 'Un exponente negativo invierte: x⁻ⁿ = 1/xⁿ, así que 2⁻³ = 1/8 = 0,125. Un exponente fraccionario es una raíz: x^(1/n) = ⁿ√x, y x^(m/n) = ⁿ√(xᵐ). Por eso 8^(2/3) = (∛8)² = 4. Y el exponente 0 siempre da 1 para cualquier base distinta de cero.',
    },
    {
      q: '¿Cómo paso un número a notación científica?',
      a: 'Se corre la coma hasta dejar una sola cifra distinta de cero antes de ella, y el exponente cuenta cuántos lugares se movió: a la izquierda el exponente es positivo, a la derecha negativo. 4.500 = 4,5 × 10³ y 0,00072 = 7,2 × 10⁻⁴. El 0 es la única excepción: no tiene notación científica.',
    },
    {
      q: '¿Qué es la notación de ingeniería y en qué se diferencia?',
      a: 'Es notación científica con el exponente forzado a un múltiplo de 3, para que cada valor calce con un prefijo del SI. Así 4,7 × 10⁴ se escribe 47 × 10³, es decir 47 kilo. La mantisa deja de estar entre 1 y 10 y pasa a estar entre 1 y 1000, pero se lee directo: 2,2 × 10⁻⁶ es 2,2 micro.',
    },
    {
      q: '¿Cuántos divisores tiene un número y cómo se cuentan sin listarlos?',
      a: 'Se toma la factorización en primos, se le suma 1 a cada exponente y se multiplican esos valores. Como 360 = 2³ × 3² × 5¹, tiene (3+1) × (2+1) × (1+1) = 24 divisores. Sirve para saber de antemano si vale la pena listarlos, y explica por qué los números altamente compuestos como 60 o 360 aparecen tanto en relojes y ángulos.',
    },
  ],

  sources: [
    {
      name: 'NIST Digital Library of Mathematical Functions — capítulo 4: funciones elementales, logaritmos y potencias',
      url: 'https://dlmf.nist.gov/4',
      publisher: 'National Institute of Standards and Technology (NIST)',
    },
    {
      name: 'Euclidean Algorithm — algoritmo de Euclides para el máximo común divisor',
      url: 'https://mathworld.wolfram.com/EuclideanAlgorithm.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Fundamental Theorem of Arithmetic — unicidad de la factorización en primos',
      url: 'https://mathworld.wolfram.com/FundamentalTheoremofArithmetic.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Prefijos del SI — de yotta a yocto, base de la notación de ingeniería',
      url: 'https://www.bipm.org/en/measurement-units/si-prefixes',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
    },
    {
      name: 'IEEE 754 / ECMAScript Number type — por qué los decimales binarios arrastran error de redondeo',
      url: 'https://tc39.es/ecma262/#sec-ecmascript-language-types-number-type',
      publisher: 'Ecma International (TC39)',
    },
  ],

  replaces: [
    '/calculadora-mcd-mcm-maximo-divisor-minimo-multiplo',
    '/calculadora-raiz-cuadrada-cubica',
    '/calculadora-mcm-mcd-minimo-comun-multiplo',
    '/calculadora-potencias-y-raices',
    '/calculadora-numeros-primos-factorizacion',
    '/calculadora-mcd-mcm-dos-numeros-enteros',
    '/calculadora-logaritmos-base-10-natural-cualquier-base',
    '/calculadora-notacion-cientifica',
    '/calculadora-logaritmo-base-cualquiera-numero',
    // Absorbida SÓLO por URL: los números complejos no entran en la pregunta
    // del hub (0 sesiones en el período medido). Ver el reporte.
    '/calculadora-numeros-complejos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Campos visibles en cada rama. El resto se oculta desde la página. */
export const CASE_FIELDS: Record<string, string[]> = {
  potencias: ['op', 'x', 'y'],
  logaritmos: ['x', 'y'],
  divisores: ['x', 'y', 'lista'],
  cientifica: ['x'],
};

/** Etiqueta de cada campo según la rama: el mismo input cambia de significado. */
export const CASE_LABELS: Record<string, Record<string, string>> = {
  potencias: {
    x: 'Base (o radicando, si elegiste raíz)',
    y: 'Exponente (o índice de la raíz)',
  },
  logaritmos: {
    x: 'Número del que querés el logaritmo',
    y: 'Base del logaritmo (10, 2, o 2,71828 para el natural)',
  },
  divisores: {
    x: 'Primer número entero',
    y: 'Segundo número entero',
    lista: 'Más números (opcional, separados por coma)',
  },
  cientifica: {
    x: 'Número a convertir (acepta 3,2e8 o 3,2×10^8)',
  },
};

/** Prefijos del SI por exponente múltiplo de 3 (BIPM). */
export const PREFIJOS_SI: Record<string, string> = {
  '24': 'yotta (Y)',
  '21': 'zetta (Z)',
  '18': 'exa (E)',
  '15': 'peta (P)',
  '12': 'tera (T)',
  '9': 'giga (G)',
  '6': 'mega (M)',
  '3': 'kilo (k)',
  '0': 'sin prefijo (unidades)',
  '-3': 'mili (m)',
  '-6': 'micro (µ)',
  '-9': 'nano (n)',
  '-12': 'pico (p)',
  '-15': 'femto (f)',
  '-18': 'atto (a)',
};

/** Extremos de la regla de órdenes de magnitud, en exponente de 10. */
export const MAG_RANGE = { min: -9, max: 15 };

/**
 * Tolerancia para "esto en realidad es un entero".
 * `Math.log(8) / Math.log(2)` da 2.9999999999999996: sin este ajuste el hub
 * devolvería eso y quedaría como un bug a la vista del alumno.
 */
export const EPS_ENTERO = 1e-10;
