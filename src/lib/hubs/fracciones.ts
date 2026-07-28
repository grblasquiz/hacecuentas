import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo opero con fracciones?"
 * Arquetipo RAMIFICADO: 6 ramas que cubren toda la aritmética de fracciones de
 * primaria y primer ciclo de secundaria. Absorbe 3 URLs (ver `replaces`).
 *
 * Contenido de ESTUDIANTE: el valor está en el PROCEDIMIENTO. Cada rama muestra
 * el mcm o el mcd que se usó, cada numerador reescrito, el resultado sin
 * simplificar, el factor de simplificación y la verificación en decimal.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara format:'plain' explícito.
 *
 * La rama de redondeo entra acá porque la pregunta que la trae es siempre la
 * misma: "pasé la fracción a decimal, ¿ahora con cuántos decimales la dejo?".
 * Fuera de ese hilo no tendría sentido.
 */
export const hub: HubData = {
  slug: 'matematica/fracciones',
  title: '¿Cómo opero con fracciones? — Sumar, restar, simplificar y pasar a decimal',
  description:
    'Suma y resta con mcm de denominadores, multiplicación y división, simplificación a fracción irreducible por mcd, conversión entre fracción impropia y número mixto, y paso a decimal con redondeo. Con cada paso intermedio.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de matemática',
  h1: '¿Cómo opero con fracciones?',
  lede:
    'Empezamos por la suma y la resta, que son las que traen el mcm y las que más se traban. Si lo tuyo es multiplicar o dividir, simplificar al máximo, pasar de fracción impropia a número mixto o al revés, o convertir a decimal y redondear, lo cambiás abajo y el procedimiento se adapta.',
  stamps: ['Actualizado 27-07-2026', '6 operaciones adentro', 'Con el mcm y el mcd a la vista'],

  resultLabel: 'El resultado',

  cases: {
    title: '¿Qué necesitás hacer?',
    intro:
      'Elegí la operación. Todas las ramas terminan mostrando el resultado simplificado al máximo y su equivalente en decimal.',
    items: [
      {
        id: 'suma-resta',
        label: 'Sumar o restar fracciones',
        hint: 'Ej.: 1/2 + 1/3 = 5/6',
        answer: 'Buscás un denominador común, reescribís las dos fracciones y recién ahí sumás los numeradores.',
        yes: [
          'Planteo: los denominadores tienen que ser iguales antes de tocar los numeradores',
          'Paso 1: el mínimo común múltiplo (mcm) de los dos denominadores es el denominador común más chico posible',
          'Paso 2: cada fracción se amplía multiplicando numerador y denominador por lo que le falta para llegar al mcm',
          'Paso 3: con los denominadores ya iguales, se suman o restan sólo los NUMERADORES',
          'Paso 4: se simplifica el resultado dividiendo por el máximo común divisor',
        ],
        warn: [
          'Los denominadores NUNCA se suman: 1/2 + 1/3 no es 2/5',
          'También sirve multiplicar los denominadores entre sí, pero el resultado queda más grande y hay que simplificar más',
          'Ningún denominador puede ser 0',
          'Con fracciones negativas, poné el signo en el numerador para no perderlo de vista',
        ],
        plazo: 'chequeo: pasá las dos fracciones a decimal, sumalas, y comparalo con el decimal del resultado.',
      },
      {
        id: 'mult-div',
        label: 'Multiplicar o dividir fracciones',
        hint: 'Ej.: 2/3 ÷ 4/5 = 10/12 = 5/6',
        answer: 'Multiplicar es en línea recta; dividir es multiplicar por la fracción dada vuelta.',
        yes: [
          'Multiplicación: numerador por numerador y denominador por denominador. No hace falta ningún denominador común',
          'División: se da vuelta la SEGUNDA fracción y se multiplica. Es la regla de "multiplicar por el recíproco"',
          'Paso 1: se hacen los dos productos',
          'Paso 2: se simplifica dividiendo por el máximo común divisor',
          'Se puede simplificar en cruz ANTES de multiplicar: da lo mismo y los números quedan mucho más chicos',
        ],
        warn: [
          'En la división se da vuelta la segunda, nunca la primera',
          'No se puede dividir por una fracción con numerador 0',
          'Multiplicar por una fracción menor que 1 ACHICA el resultado, aunque sea una multiplicación',
          'Dividir por una fracción menor que 1 AGRANDA el resultado',
        ],
        plazo: 'chequeo: en la división, multiplicá el resultado por la segunda fracción. Tenés que recuperar la primera.',
      },
      {
        id: 'simplificar',
        label: 'Simplificar a fracción irreducible',
        hint: 'Ej.: 18/24 = 3/4',
        answer: 'Dividís numerador y denominador por su máximo común divisor.',
        yes: [
          'Planteo: dos fracciones son equivalentes si representan la misma cantidad, aunque tengan números distintos',
          'Paso 1: se calcula el máximo común divisor (mcd) del numerador y del denominador, por el algoritmo de Euclides',
          'Paso 2: se dividen los dos por ese mcd de una sola vez',
          'Una fracción es IRREDUCIBLE cuando numerador y denominador no comparten ningún factor: su mcd es 1',
          'Si el denominador queda en 1, la fracción era en realidad un número entero',
        ],
        warn: [
          'Hay que dividir arriba Y abajo por el mismo número: restar no simplifica nada',
          'Si el resultado del mcd es 1, la fracción ya estaba en su forma más simple',
          'Un signo menos en el denominador conviene subirlo al numerador: −3/−4 es 3/4, y 3/−4 es −3/4',
          'El denominador no puede ser 0',
        ],
        plazo: 'chequeo: el decimal de la fracción original y el de la simplificada tienen que ser idénticos.',
      },
      {
        id: 'impropia-mixto',
        label: 'Pasar de fracción impropia a número mixto',
        hint: 'Ej.: 7/3 = 2 1/3',
        answer: 'Hacés la división entera: el cociente es la parte entera y el resto queda arriba.',
        yes: [
          'Planteo: una fracción es IMPROPIA cuando el numerador es mayor o igual que el denominador, o sea vale 1 o más',
          'Paso 1: se simplifica primero, para que el número mixto quede en su forma más limpia',
          'Paso 2: se divide numerador entre denominador y se guarda el cociente entero',
          'Paso 3: el RESTO de esa división es el nuevo numerador, y el denominador no cambia',
          'Si el resto da 0, no hay parte fraccionaria: la fracción era un entero exacto',
        ],
        warn: [
          'Si el numerador es menor que el denominador, la fracción es PROPIA y no tiene número mixto: no hay parte entera',
          'El número mixto se lee como una suma: 2 1/3 significa 2 + 1/3, nunca 2 × 1/3',
          'Para operar conviene el revés: casi siempre se pasa el mixto a impropia antes de sumar o multiplicar',
          'Esta rama trabaja con valores positivos',
        ],
        plazo: 'chequeo: parte entera × denominador + numerador tiene que devolverte la fracción impropia original.',
      },
      {
        id: 'mixto-impropia',
        label: 'Pasar de número mixto a fracción impropia',
        hint: 'Ej.: 2 1/3 = 7/3',
        answer: 'Multiplicás la parte entera por el denominador y le sumás el numerador.',
        yes: [
          'Planteo: el número mixto es una suma disfrazada, así que hay que llevar la parte entera al mismo denominador',
          'Paso 1: parte entera × denominador — son las unidades enteras expresadas en esa fracción',
          'Paso 2: se le suma el numerador que ya tenías',
          'Paso 3: ese total va arriba y el denominador queda igual',
          'Es el paso previo obligado para sumar, restar, multiplicar o dividir números mixtos',
        ],
        warn: [
          'El denominador NO se multiplica ni se toca: sólo cambia el numerador',
          'No confundas 2 1/3 con 2 × 1/3: el mixto es una suma',
          'El denominador no puede ser 0',
          'Esta rama trabaja con valores positivos',
        ],
        plazo: 'chequeo: dividí la impropia que te dio y tenés que recuperar el mixto original.',
      },
      {
        id: 'decimal',
        label: 'Pasar a decimal y redondear',
        hint: 'Ej.: 2/3 = 0,6666… → 0,67 con 2 decimales',
        answer: 'Dividís numerador por denominador y después elegís hasta dónde recortás.',
        yes: [
          'Planteo: la barra de fracción ES una división: 3/4 significa 3 dividido 4',
          'Paso 1: se hace la división y sale el decimal exacto o periódico',
          'Paso 2: se elige la precisión —decimales, unidad, decena, centena o millar— y se aplica la regla del 5',
          'Regla del 5: si el primer dígito que se descarta es 5 o más, la última cifra que queda sube 1; si es menor, queda igual',
          'La página muestra además el truncado, el redondeo hacia arriba y el redondeo hacia abajo, que son cosas distintas',
        ],
        warn: [
          'Redondear no es truncar: truncar corta sin mirar, redondear mira el dígito siguiente',
          'Una fracción con denominador que sólo tiene factores 2 y 5 da decimal exacto; cualquier otro factor da periódico',
          'Redondeá una sola vez, al final: redondear en cada paso intermedio acumula error',
          'Redondear "hacia arriba" en un negativo significa hacia el cero, no hacia el número más grande en valor absoluto',
        ],
        plazo: 'chequeo: la diferencia entre el valor exacto y el redondeado nunca puede pasar de media unidad de la precisión elegida.',
      },
    ],
  },

  inputsTitle: 'Cargá tus fracciones',
  inputsIntro:
    'La primera fracción se usa en todas las ramas. La segunda sólo en suma, resta, multiplicación y división. La parte entera sólo cuando venís de un número mixto.',
  fields: [
    { id: 'a', label: 'Primera fracción — numerador', value: '1', help: 'El número de arriba. En la rama de número mixto, la parte fraccionaria.' },
    { id: 'b', label: 'Primera fracción — denominador', value: '2', help: 'El número de abajo. No puede ser 0.' },
    { id: 'c', label: 'Segunda fracción — numerador', value: '1', help: 'Sólo suma, resta, multiplicación y división.' },
    { id: 'd', label: 'Segunda fracción — denominador', value: '3', help: 'Sólo suma, resta, multiplicación y división. No puede ser 0.' },
    { id: 'ent', label: 'Parte entera del número mixto', value: '2', help: 'Sólo la rama de número mixto → fracción impropia.' },
    {
      id: 'ops',
      label: '¿Sumar o restar?',
      type: 'select',
      value: 'suma',
      options: [
        { value: 'suma', label: 'Sumar (+)' },
        { value: 'resta', label: 'Restar (−)' },
      ],
      help: 'Sólo la rama de suma y resta.',
    },
    {
      id: 'opm',
      label: '¿Multiplicar o dividir?',
      type: 'select',
      value: 'multiplicacion',
      options: [
        { value: 'multiplicacion', label: 'Multiplicar (×)' },
        { value: 'division', label: 'Dividir (÷)' },
      ],
      help: 'Sólo la rama de multiplicación y división.',
    },
    {
      id: 'niv',
      label: 'Precisión del redondeo',
      type: 'select',
      value: 'd2',
      options: [
        { value: 'd4', label: '4 decimales' },
        { value: 'd3', label: '3 decimales' },
        { value: 'd2', label: '2 decimales' },
        { value: 'd1', label: '1 decimal' },
        { value: 'unidad', label: 'La unidad (entero)' },
        { value: 'decena', label: 'La decena' },
        { value: 'centena', label: 'La centena' },
        { value: 'mil', label: 'El millar' },
      ],
      help: 'Sólo la rama de decimal y redondeo.',
    },
  ],
  fineprint:
    'Numeradores, denominadores y parte entera se toman como números enteros: si escribís un decimal, se trunca. Ningún denominador puede ser 0. Las ramas de número mixto trabajan con valores positivos, que es como se enseña la conversión.',

  chart: {
    type: 'bars',
    title: 'Las fracciones, comparadas',
    caption:
      'Las barras muestran el valor decimal de cada fracción que entró y el del resultado, todas en la misma escala. Sirve para el control de sentido común que casi nadie hace: si sumaste dos fracciones, el resultado tiene que ser más grande que las dos; si multiplicaste por algo menor que uno, tiene que ser más chico. Cuando la barra del resultado queda del lado que no esperabas, la cuenta está mal.',
  },
  breakdownTitle: 'El procedimiento, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: los datos que entraron, el mcm o el mcd que se usó, cada numerador reescrito, el resultado antes de simplificar y el resultado final con su equivalente en decimal.',

  faq: [
    {
      q: '¿Cómo se suman dos fracciones con distinto denominador?',
      a: 'Hay que llevarlas al mismo denominador antes de tocar los numeradores. Se calcula el <b>mcm</b> de los dos denominadores, se amplía cada fracción multiplicando arriba y abajo por lo que le falta, y recién ahí se suman los numeradores. Para 1/2 + 1/3 el mcm es 6: queda 3/6 + 2/6 = <b>5/6</b>. Lo que nunca se hace es sumar los denominadores.',
    },
    {
      q: '¿Qué es el mínimo común múltiplo y cómo se calcula?',
      a: 'Es el número más chico que es múltiplo de los dos denominadores a la vez. La forma rápida es <b>mcm(a, b) = a × b ÷ mcd(a, b)</b>. Para 4 y 6: el mcd es 2, así que el mcm es 24 ÷ 2 = <b>12</b>. También se puede usar directamente el producto de los denominadores —siempre funciona—, pero los números quedan más grandes y después hay que simplificar más.',
    },
    {
      q: '¿Cómo se multiplican fracciones?',
      a: 'En línea recta: <b>numerador por numerador y denominador por denominador</b>. No hace falta ningún denominador común, que es lo que la vuelve mucho más fácil que la suma. 2/3 × 4/5 = 8/15. El atajo que conviene aprender es simplificar en cruz <b>antes</b> de multiplicar: los números quedan chicos y el resultado sale ya irreducible.',
    },
    {
      q: '¿Cómo se dividen fracciones?',
      a: 'Se <b>da vuelta la segunda fracción y se multiplica</b>: es la regla de multiplicar por el recíproco. 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = <b>5/6</b>. La segunda, nunca la primera. Y ojo con lo contraintuitivo: dividir por una fracción menor que 1 <b>agranda</b> el resultado, porque estás preguntando cuántas veces entra algo chico en algo más grande.',
    },
    {
      q: '¿Cómo se simplifica una fracción al máximo?',
      a: 'Se divide el numerador y el denominador por su <b>máximo común divisor</b>. En 18/24 el mcd es 6, así que queda <b>3/4</b>, que ya es irreducible porque 3 y 4 no comparten ningún factor. Se puede llegar dividiendo de a poco (por 2, después por 3), pero usar el mcd lo resuelve en un solo paso. Si el mcd da 1, la fracción ya estaba simplificada.',
    },
    {
      q: '¿Qué es una fracción impropia y cómo la paso a número mixto?',
      a: 'Es la que tiene el <b>numerador mayor o igual que el denominador</b>, o sea vale 1 o más. Para pasarla a mixto se hace la división entera: el <b>cociente</b> es la parte entera y el <b>resto</b> queda como nuevo numerador, con el mismo denominador. 7 ÷ 3 = 2 con resto 1, así que 7/3 = <b>2 1/3</b>. Si el resto da 0, era un entero exacto.',
    },
    {
      q: '¿Cómo paso un número mixto a fracción impropia?',
      a: '<b>Parte entera × denominador + numerador</b>, todo eso arriba, y el denominador queda igual. Para 2 1/3: 2 × 3 + 1 = 7, así que es <b>7/3</b>. Es el paso previo obligado para sumar, restar, multiplicar o dividir números mixtos: nadie opera con ellos en forma mixta. Y recordá que 2 1/3 es una <b>suma</b> (2 + 1/3), no un producto.',
    },
    {
      q: '¿Por qué algunas fracciones dan decimales que no terminan nunca?',
      a: 'Porque nuestro sistema es de base 10, y 10 se factoriza como 2 × 5. Si el denominador de la fracción irreducible tiene <b>sólo factores 2 y 5</b>, el decimal es <b>exacto</b> (1/8 = 0,125). Si tiene cualquier otro factor primo, el decimal es <b>periódico</b>: 1/3 = 0,333… y 2/7 = 0,285714285714… Ahí es donde entra el redondeo.',
    },
    {
      q: '¿Cuál es la regla del 5 para redondear?',
      a: 'Se mira el <b>primer dígito que se descarta</b>. Si es 5 o más, la última cifra que se conserva <b>sube 1</b>; si es menor que 5, queda igual. Redondeando 0,6666… a dos decimales, el dígito descartado es 6, así que 0,66 pasa a <b>0,67</b>. Redondeando 2,341 a dos decimales, el descartado es 1, así que queda <b>2,34</b>.',
    },
    {
      q: '¿Qué diferencia hay entre redondear y truncar?',
      a: '<b>Truncar</b> es cortar sin mirar lo que sigue: 2,678 truncado a dos decimales es 2,67. <b>Redondear</b> mira el dígito siguiente y aplica la regla del 5: 2,678 redondeado a dos decimales es <b>2,68</b>. Truncar siempre acerca al cero; redondear acerca al valor más próximo, y por eso es el que se usa cuando lo que importa es la precisión.',
    },
    {
      q: '¿Cómo se redondea a la decena, a la centena o al millar?',
      a: 'Es la misma regla del 5, pero mirando el dígito de una posición antes de la que se conserva. Para redondear <b>1.847</b>: a la decena mirás el 7 y da <b>1.850</b>; a la centena mirás el 4 y da <b>1.800</b>; al millar mirás el 8 y da <b>2.000</b>. Cada nivel que subís, más gruesa es la aproximación.',
    },
    {
      q: '¿Se puede simplificar una fracción restando el mismo número arriba y abajo?',
      a: 'No, y es un error clásico. La fracción representa una <b>división</b>, y sólo se conserva el valor si se multiplica o se divide arriba y abajo por el mismo número. 6/8 dividido por 2 arriba y abajo da 3/4, que vale lo mismo (0,75). Pero restando 2 arriba y abajo daría 4/6 = 0,666…, que es otro número: no es la misma fracción.',
    },
  ],

  sources: [
    {
      name: 'Fraction — definición, operaciones y forma irreducible',
      url: 'https://mathworld.wolfram.com/Fraction.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Euclidean Algorithm — cálculo del máximo común divisor',
      url: 'https://mathworld.wolfram.com/EuclideanAlgorithm.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Least Common Multiple — mínimo común múltiplo y su relación con el mcd',
      url: 'https://mathworld.wolfram.com/LeastCommonMultiple.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Fracciones: suma, resta, multiplicación, división y números mixtos',
      url: 'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic',
      publisher: 'Khan Academy',
    },
    {
      name: 'ISO 80000-1 — Quantities and units, Part 1: General (reglas de redondeo, anexo B)',
      url: 'https://www.iso.org/standard/30669.html',
      publisher: 'ISO — Organización Internacional de Normalización',
    },
    {
      name: 'Recursos de matemática para nivel primario y secundario',
      url: 'https://www.educ.ar/recursos/buscar?tema=matematica',
      publisher: 'Educ.ar — Ministerio de Educación de la Nación',
    },
  ],

  replaces: [
    '/calculadora-fracciones-suma-resta-multiplicacion-division',
    '/fraccion-impropia-numero-mixto',
    '/redondeo-numeros-decimales-decenas-centenas',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
