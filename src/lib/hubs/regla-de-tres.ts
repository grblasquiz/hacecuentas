import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo hago una regla de tres?"
 * Arquetipo RAMIFICADO: 6 ramas = las 6 formas en que aparece la
 * proporcionalidad en la vida de un estudiante. Absorbe 7 URLs (ver `replaces`).
 *
 * Es contenido de ESTUDIANTE: el valor no está en el número final sino en el
 * planteo. Cada rama muestra el "A es a B como C es a X", el despeje y por qué
 * la inversa multiplica donde la directa divide. El desglose de compute() es
 * literalmente la cuenta paso a paso.
 *
 * FORMATO: acá no hay plata en ninguna rama. El default de HubRow es 'ars', así
 * que TODA fila declara su formato: 'plain' para cantidades, 'unit' para metros,
 * centímetros, días y horas-hombre.
 *
 * Escala de plano/mapa es la misma matemática con otra ropa (una proporción
 * 1:N), por eso tiene rama propia y no una página aparte.
 */
export const hub: HubData = {
  slug: 'matematica/regla-de-tres',
  title: '¿Cómo hago una regla de tres? — Simple, inversa y compuesta',
  description:
    'Regla de tres simple directa e inversa, compuesta, escala de plano o mapa e interpolación lineal. Con el planteo "A es a B como C es a X", el despeje y la cuenta paso a paso.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de matemática',
  h1: '¿Cómo hago una regla de tres?',
  lede:
    'Toda regla de tres es la misma idea: dos magnitudes que se mueven juntas y un dato que falta. Empezamos por la directa, que es la más común; si tu caso es inverso, compuesto, una escala de plano o una interpolación, lo cambiás abajo y el planteo se adapta.',
  stamps: ['Actualizado 27-07-2026', '6 tipos de proporción adentro', 'Con el planteo y el despeje'],

  resultLabel: 'El valor que falta (X)',

  cases: {
    title: '¿Qué tipo de proporción tenés?',
    intro:
      'Elegí cómo se comportan tus dos magnitudes. La pregunta clave es siempre la misma: si una sube, ¿la otra sube o baja?',
    items: [
      {
        id: 'directa',
        label: 'Regla de tres simple directa',
        hint: 'Ej.: "si 3 kg cuestan $12, ¿cuánto cuestan 5 kg?"',
        answer: 'Multiplicás en cruz y dividís por el dato que queda solo: X = B × C ÷ A.',
        yes: [
          'Planteo: A es a B como C es a X  →  A/B = C/X',
          'Despeje: multiplicás en cruz (B × C) y dividís por A',
          'A y C son la misma magnitud (kilos con kilos); B y X son la otra (pesos con pesos)',
          'Es la proporción de los precios, las recetas, las distancias en un mapa y las conversiones de unidad',
        ],
        warn: [
          'Ordená siempre igual: si arriba pusiste kilos, abajo van pesos en las dos columnas',
          'A no puede ser 0: no se puede dividir por cero',
          'No toda relación es proporcional: el doble de personas no tarda el doble en un examen',
        ],
        plazo: 'chequeo: A ÷ B tiene que dar lo mismo que C ÷ X. Si no da, invertiste una columna.',
      },
      {
        id: 'inversa',
        label: 'Regla de tres simple inversa',
        hint: 'Ej.: "si 3 obreros tardan 12 días, ¿cuánto tardan 5?"',
        answer: 'Multiplicás los dos datos de la primera situación y dividís por el nuevo: X = A × B ÷ C.',
        yes: [
          'Planteo: A es a B como C es a X, pero al revés  →  A × B = C × X',
          'Despeje: X = A × B ÷ C',
          'Se usa cuando una magnitud sube y la otra baja: más obreros, menos días; más velocidad, menos tiempo',
          'El producto A × B es una constante (el "trabajo total") y se mantiene en la nueva situación',
        ],
        warn: [
          'Acá se divide por C, no por A: es el cambio que confunde a todo el mundo',
          'Antes de calcular, preguntate si el resultado tiene que dar más o menos que B. Si te da del otro lado, elegiste mal el tipo',
          'C no puede ser 0',
        ],
        plazo: 'chequeo: A × B tiene que dar exactamente lo mismo que C × X.',
      },
      {
        id: 'compuesta',
        label: 'Regla de tres compuesta (obra y trabajo)',
        hint: 'Ej.: "3 personas, 12 días, 5 h por día… ¿y con 2 personas a 8 h?"',
        answer: 'Calculás el total de horas-hombre y lo repartís entre el nuevo equipo.',
        yes: [
          'Planteo: el trabajo total = personas × días × horas por día',
          'Despeje: días nuevos = horas-hombre totales ÷ (personas nuevas × horas nuevas)',
          'Sirve para obra, producción, mudanzas, cosecha y cualquier tarea divisible',
          'Es la inversa aplicada dos veces: más personas y más horas, menos días',
        ],
        warn: [
          'Asume que todas las personas rinden igual y que el trabajo se puede partir: no siempre es cierto',
          'Nueve mujeres no tienen un bebé en un mes: hay tareas que no se paralelizan',
          'Si el nuevo equipo es 0 personas o 0 horas, no hay resultado posible',
        ],
        plazo: 'chequeo: personas × días × horas tiene que dar el mismo total en las dos situaciones.',
      },
      {
        id: 'escala-real',
        label: 'Del plano a la realidad (escala 1:N)',
        hint: 'Ej.: "12 cm en un plano 1:100, ¿cuántos metros son?"',
        answer: 'Multiplicás la medida del plano por el denominador de la escala.',
        yes: [
          'Planteo: 1 cm del plano es a N cm reales como tu medida es a X',
          'Despeje: reales (cm) = medida del plano × N, y después dividís por 100 para tener metros',
          'A escala 1:100, 1 cm del papel son 100 cm (1 m) de verdad',
          'En mapas 1:50.000, 1 cm son 50.000 cm = 500 m = medio kilómetro',
        ],
        warn: [
          'La escala se aplica a las LONGITUDES. Las superficies escalan al cuadrado: a 1:100, 1 cm² del plano son 10.000 cm² reales, no 100',
          'Cuanto más grande el número N, más chico se ve todo: 1:1000 muestra más terreno con menos detalle que 1:100',
          'Verificá la unidad del plano: si medís en mm y no en cm, el resultado cambia de escala',
        ],
        plazo: 'atajo para mapas: sacale dos ceros al N y tenés los metros que representa 1 cm.',
      },
      {
        id: 'escala-plano',
        label: 'De la realidad al plano (escala 1:N)',
        hint: 'Ej.: "una pared de 12 m, ¿cuántos cm dibujo en 1:100?"',
        answer: 'Pasás la medida real a centímetros y la dividís por el denominador.',
        yes: [
          'Planteo: N cm reales son a 1 cm del plano como tu medida real es a X',
          'Despeje: plano (cm) = medida real en metros × 100 ÷ N',
          'Es la cuenta del dibujo técnico: elegís la escala y bajás las medidas al papel',
          'A 1:100, una pared de 12 m se dibuja de 12 cm',
        ],
        warn: [
          'Si el dibujo no entra en la hoja, no cambies las medidas: cambiá la escala a un N más grande',
          'Las escalas normalizadas son 1:20, 1:25, 1:50, 1:100, 1:200, 1:500: usar una rara complica leer el plano',
          'El denominador N no puede ser 0',
        ],
        plazo: 'chequeo: si volvés a multiplicar el resultado por N, tenés que recuperar la medida real.',
      },
      {
        id: 'interpolacion',
        label: 'Interpolación lineal entre dos puntos',
        hint: 'Ej.: "la tabla dice 3→12 y 5→2, ¿cuánto vale en 4?"',
        answer: 'Ubicás qué fracción del tramo recorriste y aplicás esa misma fracción a la diferencia de valores.',
        yes: [
          'Planteo: es una regla de tres sobre el tramo entre dos puntos conocidos',
          'Despeje: t = (x − x₀) ÷ (x₁ − x₀), y después y = y₀ + t × (y₁ − y₀)',
          'Sirve para leer valores intermedios de una tabla (tablas de impuestos, físicas, de calibración)',
          'Si t da 0,5 estás justo en la mitad del tramo',
        ],
        warn: [
          'Si x cae fuera del intervalo estás extrapolando, no interpolando: la recta puede no seguir igual afuera',
          'Sólo vale si la relación es (aproximadamente) lineal en ese tramo',
          'x₀ y x₁ no pueden ser iguales: el tramo tendría ancho cero',
        ],
        plazo: 'chequeo: con t entre 0 y 1, el resultado tiene que quedar entre y₀ e y₁.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Según la rama que elijas se usan tres, cuatro o cinco campos. Los que sobran quedan ahí sin molestar: el desglose te dice cuáles entraron en la cuenta.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands el parser
    // convierte "12.5" en 125. Los parseamos con H.num(), que acepta la coma
    // decimal rioplatense ("12,5" → 12.5).
    { id: 'a', label: 'A — primer dato conocido', value: '3', help: 'En compuesta: personas de la situación conocida. En interpolación: x₀.' },
    { id: 'b', label: 'B — lo que le corresponde a A', value: '12', help: 'En compuesta: días. En interpolación: y₀. En las ramas de escala: la medida a convertir (cm del plano o metros reales).' },
    { id: 'c', label: 'C — el dato nuevo, el que va con la incógnita', value: '5', help: 'En compuesta: horas por día de la situación conocida. En interpolación: x₁.' },
    { id: 'd', label: 'D — cuarto dato', value: '2', help: 'En compuesta: personas del nuevo equipo. En interpolación: y₁.' },
    { id: 'e', label: 'E — quinto dato', value: '8', help: 'Sólo compuesta: horas por día del nuevo equipo.' },
    { id: 'x', label: 'x — el valor a interpolar', value: '4', help: 'Sólo interpolación: el punto de la tabla que querés leer.' },
    { id: 'esc', label: 'Escala del plano o mapa — el N de 1:N', value: '100', help: 'Sólo las ramas de escala. 1:100 es lo habitual en planos de vivienda; 1:50.000 en cartas topográficas.' },
  ],
  fineprint:
    'Aceptamos coma decimal: "12,5" se lee como doce y medio. En las ramas de escala, el campo B es la medida a convertir: en centímetros si vas del plano a la realidad, y en metros si vas al revés.',

  chart: {
    type: 'bars',
    title: 'La proporción, dibujada',
    caption:
      'Las barras muestran los cuatro términos de la proporción uno al lado del otro. Cuando el salto de A a C es el mismo que el de B a X, la proporción es directa; cuando uno sube y el otro baja, es inversa. Verlo dibujado es la forma más rápida de darte cuenta si elegiste bien el tipo.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso del planteo: primero los datos que entraron, después el producto, después la división y al final la verificación. Si la verificación no cierra, invertiste una columna.',

  faq: [
    {
      q: '¿Cómo se hace una regla de tres simple?',
      a: 'Se plantea "A es a B como C es a X" y se multiplica en cruz: <b>X = B × C ÷ A</b>. Si 3 kg cuestan $12 y querés saber cuánto cuestan 5 kg, es 12 × 5 ÷ 3 = <b>$20</b>. La clave es ordenar las magnitudes en columnas: kilos con kilos, pesos con pesos.',
    },
    {
      q: '¿Cuál es la diferencia entre regla de tres directa e inversa?',
      a: 'En la <b>directa</b> las dos magnitudes se mueven en el mismo sentido (más kilos, más plata) y el despeje es X = B × C ÷ A. En la <b>inversa</b> se mueven al revés (más obreros, menos días) y el despeje es <b>X = A × B ÷ C</b>. La pregunta que resuelve la duda es siempre: si una sube, ¿la otra sube o baja?',
    },
    {
      q: '¿Por qué en la regla de tres inversa se multiplica en vez de dividir?',
      a: 'Porque lo que se mantiene constante no es la razón A/B sino el <b>producto</b> A × B. Si 3 obreros tardan 12 días, el trabajo total son 36 días-obrero; ese 36 no cambia si ponés 5 obreros, así que X = 36 ÷ 5 = <b>7,2 días</b>. En la directa lo constante es el cociente; en la inversa, el producto.',
    },
    {
      q: '¿Cómo sé si mi problema es directo o inverso?',
      a: 'Imaginate el caso extremo. Si duplicás A: ¿el resultado tiene que duplicarse o partirse a la mitad? Precio por cantidad, ingredientes por comensal y distancia por tiempo a velocidad fija son <b>directos</b>. Obreros por días, velocidad por tiempo y raciones por comensales son <b>inversos</b>. Si el resultado te da del lado contrario al que esperabas, elegiste mal el tipo.',
    },
    {
      q: '¿Cómo funciona la regla de tres compuesta?',
      a: 'Se reduce todo a una sola unidad de trabajo. Con 3 personas, 12 días y 5 horas diarias el trabajo son 3 × 12 × 5 = <b>180 horas-hombre</b>. Ese total no cambia: con 2 personas a 8 horas por día se hacen 16 horas-hombre por día, así que hacen falta 180 ÷ 16 = <b>11,25 días</b>.',
    },
    {
      q: '¿Qué significa una escala 1:100 en un plano?',
      a: 'Que <b>1 cm del papel representa 100 cm reales</b>, o sea 1 metro. Una pared que en el plano mide 12 cm mide 12 m en la obra. Cuanto más grande el denominador, más chico se ve todo: 1:1000 abarca más terreno con menos detalle.',
    },
    {
      q: 'En un mapa 1:50.000, ¿cuánto representa 1 cm?',
      a: '50.000 cm, que son 500 m o <b>medio kilómetro</b>. El atajo es sacarle dos ceros al denominador y leerlo en metros: 1:25.000 → 250 m por cm; 1:100.000 → 1.000 m por cm. Por eso 3,5 cm en un mapa 1:50.000 son 1,75 km.',
    },
    {
      q: 'Si escalo un plano, ¿la superficie escala igual?',
      a: 'No. Las <b>longitudes</b> escalan con N, pero las <b>superficies escalan con N²</b>. A escala 1:100, 1 cm² del plano no son 100 cm² reales sino <b>10.000 cm² (1 m²)</b>. Es el error más caro cuando se calcula material de obra desde un plano.',
    },
    {
      q: '¿Qué es la interpolación lineal y para qué sirve?',
      a: 'Es una regla de tres sobre un tramo. Si una tabla te da el valor en x₀ y en x₁, y necesitás un punto intermedio, calculás qué fracción del tramo recorriste —<b>t = (x − x₀) ÷ (x₁ − x₀)</b>— y aplicás esa misma fracción a la diferencia de valores: <b>y = y₀ + t × (y₁ − y₀)</b>. Se usa para leer tablas de impuestos, de calibración y de física.',
    },
    {
      q: '¿Qué diferencia hay entre interpolar y extrapolar?',
      a: 'Interpolás cuando el punto que buscás cae <b>entre</b> los dos datos conocidos (t entre 0 y 1): la estimación es confiable porque estás dentro de lo medido. Extrapolás cuando cae afuera (t menor a 0 o mayor a 1): ahí estás asumiendo que la recta sigue igual más allá de los datos, y eso puede no ser cierto.',
    },
    {
      q: '¿Toda relación entre dos cantidades se resuelve con regla de tres?',
      a: 'No, y este es el error conceptual más común. La regla de tres sólo vale si la relación es <b>proporcional</b>: al doble de una, el doble (o la mitad) de la otra. El área de un cuadrado no es proporcional a su lado, el consumo de nafta no es proporcional a la velocidad y estudiar el doble de horas no duplica la nota. Antes de plantearla, comprobá que la proporcionalidad exista.',
    },
    {
      q: '¿Cómo verifico que hice bien la regla de tres?',
      a: 'En la <b>directa</b>, A ÷ B tiene que dar lo mismo que C ÷ X. En la <b>inversa</b>, A × B tiene que dar lo mismo que C × X. Y siempre queda el chequeo de sentido común: mirá si el resultado quedó del lado que esperabas antes de calcular. Las dos verificaciones aparecen como última fila del desglose de esta página.',
    },
  ],

  sources: [
    {
      name: 'Proporcionalidad, razones y proporciones — material didáctico de matemática',
      url: 'https://www.educ.ar/recursos/buscar?tema=matematica',
      publisher: 'Educ.ar — Ministerio de Educación de la Nación',
    },
    {
      name: 'Ratios, rates and proportional relationships',
      url: 'https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates',
      publisher: 'Khan Academy',
    },
    {
      name: 'Cartografía: escala, representación y lectura de cartas topográficas',
      url: 'https://www.ign.gob.ar/NuestrasActividades/Cartografia',
      publisher: 'Instituto Geográfico Nacional (Argentina)',
    },
    {
      name: 'Baldor, A. — «Aritmética», capítulos de razones, proporciones y regla de tres',
      url: 'https://openlibrary.org/search?q=baldor+aritmetica',
      publisher: 'Open Library (ficha bibliográfica)',
    },
  ],

  replaces: [
    '/calculadora-regla-de-tres-simple',
    '/calculadora-regla-de-tres-inversa',
    '/calculadora-regla-tres-compuesta',
    '/calculadora-interpolacion-lineal-valor',
    '/calculadora-de-escala',
    '/calculadora-escala-plano-mapa',
    // Absorbida SÓLO por URL: la proporción áurea es una constante geométrica,
    // no una regla de tres. Sin sesiones, sin rama propia. Ver reporte.
    '/proporcion-aurea-numero-oro',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
