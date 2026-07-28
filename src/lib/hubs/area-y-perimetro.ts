import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuál es el área y el perímetro de esta figura?"
 * Arquetipo RAMIFICADO: 7 ramas = las 7 figuras que aparecen en la carpeta de
 * geometría de secundaria. Absorbe 7 URLs (ver `replaces`).
 *
 * Es contenido de ESTUDIANTE: el valor no está en el número final sino en ver
 * la fórmula, la sustitución, el resultado y la verificación como filas
 * separadas del desglose. Por eso cada rama devuelve la cuenta desarmada.
 *
 * FORMATO: acá no hay plata en ninguna rama. El default de HubRow es 'ars', así
 * que TODA fila declara su formato: 'plain' para cantidades adimensionales y
 * 'unit' para u, u², grados y cantidad de lados.
 *
 * PRECISIÓN: todo resultado pasa por un redondeo a entero cuando queda a menos
 * de 1e-10 (si no, un cuadrado de lado 3 por Herón devolvería 3,9999999999).
 */
export const hub: HubData = {
  slug: 'matematica/area-y-perimetro',
  title: '¿Cuál es el área y el perímetro de esta figura? — Círculo, triángulo, trapecio, rombo y polígono',
  description:
    'Área y perímetro de círculo, sector circular, triángulo (por Herón o por coordenadas), trapecio, rombo y polígono regular. Con la fórmula, la sustitución paso a paso y la verificación.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de geometría',
  h1: '¿Cuál es el área y el perímetro de esta figura?',
  lede:
    'Toda figura plana tiene dos medidas que se piden juntas: el área (lo que cubre) y el perímetro (lo que la rodea). Empezamos por el círculo, que es el caso más frecuente; si tu figura es un triángulo, un trapecio, un rombo o un polígono regular, la cambiás abajo y la fórmula se adapta.',
  stamps: ['Actualizado 27-07-2026', '7 figuras adentro', 'Con la fórmula y la sustitución'],

  resultLabel: 'El área de tu figura',

  cases: {
    title: '¿Qué figura tenés?',
    intro:
      'Elegí la figura y fijate qué datos pide cada una. Los campos que sobran quedan ahí sin molestar: el desglose te dice cuáles entraron en la cuenta.',
    items: [
      {
        id: 'circulo',
        label: 'Círculo (por el radio)',
        hint: 'Ej.: "un círculo de 5 cm de radio, ¿qué área tiene?"',
        answer: 'Área = π × r² y perímetro (circunferencia) = 2 × π × r.',
        yes: [
          'Fórmula del área: A = π · r²  →  se sustituye el radio y se eleva al cuadrado ANTES de multiplicar por π',
          'Fórmula del perímetro: P = 2 · π · r, que es lo mismo que π por el diámetro',
          'El diámetro es siempre el doble del radio: d = 2r',
          'Si te dan el diámetro en vez del radio, dividilo por 2 antes de cargarlo (campo A)',
        ],
        warn: [
          'El error clásico es hacer (π·r)² en vez de π·r²: primero el cuadrado, después π',
          'Si duplicás el radio, el perímetro se duplica pero el área se multiplica por 4: crece al cuadrado',
          'Las unidades no son las mismas: el perímetro va en cm y el área en cm²',
        ],
        plazo: 'verificación: área ÷ perímetro tiene que dar exactamente r ÷ 2.',
      },
      {
        id: 'sector',
        label: 'Sector circular (porción de círculo)',
        hint: 'Ej.: "una porción de 60° de un círculo de radio 5"',
        answer: 'El sector se lleva la fracción ángulo/360 del área y del perímetro del círculo completo.',
        yes: [
          'Fracción del disco: f = ángulo ÷ 360 (con el ángulo en grados)',
          'Área del sector: A = π · r² · f',
          'Longitud del arco: L = 2 · π · r · f',
          'El perímetro completo del sector suma además los dos radios: L + 2r',
        ],
        warn: [
          'El ángulo va en GRADOS (entre 0 y 360). Si lo tenés en radianes, pasalo a grados antes',
          'El arco no es lo mismo que la cuerda: el arco es curvo y siempre mide más',
          'Media pizza es un sector de 180°, un cuarto es 90°: si el ángulo da más de 360 revisá el dato',
        ],
        plazo: 'verificación: con ángulo 360 el sector tiene que dar exactamente el círculo entero.',
      },
      {
        id: 'heron',
        label: 'Triángulo por sus tres lados (Herón)',
        hint: 'Ej.: "un triángulo de lados 3, 4 y 5"',
        answer: 'Sacás el semiperímetro s y aplicás A = √(s·(s−a)·(s−b)·(s−c)).',
        yes: [
          'Paso 1 — semiperímetro: s = (a + b + c) ÷ 2',
          'Paso 2 — fórmula de Herón: A = √( s · (s−a) · (s−b) · (s−c) )',
          'Sirve cuando NO conocés la altura: sólo con los tres lados alcanza',
          'El perímetro es la suma directa de los tres lados',
        ],
        warn: [
          'Los tres lados tienen que cumplir la desigualdad triangular: cada lado menor que la suma de los otros dos',
          'Si un paréntesis (s−a) da negativo o cero, el triángulo no existe: revisá los datos',
          'No confundas el semiperímetro con la mitad de un lado',
        ],
        plazo: 'verificación: con lados 3, 4 y 5 el área tiene que dar exactamente 6.',
      },
      {
        id: 'coordenadas',
        label: 'Triángulo por las coordenadas de sus vértices',
        hint: 'Ej.: "A(0,0), B(4,0), C(0,3)"',
        answer: 'Aplicás la fórmula del determinante (shoelace): A = ½·|x₁(y₂−y₃) + x₂(y₃−y₁) + x₃(y₁−y₂)|.',
        yes: [
          'Fórmula del zapato (shoelace): A = ½ · |x₁(y₂−y₃) + x₂(y₃−y₁) + x₃(y₁−y₂)|',
          'El valor absoluto es obligatorio: el signo sólo indica si recorriste los vértices en sentido horario o antihorario',
          'Los lados salen por la distancia entre puntos: √(Δx² + Δy²)',
          'Con los tres lados calculados, el perímetro es la suma',
        ],
        warn: [
          'Si el determinante da 0, los tres puntos son colineales: están alineados y no forman triángulo',
          'Respetá el orden A, B, C: si mezclás las coordenadas el determinante cambia (aunque el valor absoluto lo salva)',
          'El área queda en unidades², no en cm², salvo que el eje esté graduado en centímetros',
        ],
        plazo: 'verificación: A(0,0), B(4,0), C(0,3) tiene que dar área 6 y perímetro 12.',
      },
      {
        id: 'trapecio',
        label: 'Trapecio',
        hint: 'Ej.: "bases 10 y 6, altura 4"',
        answer: 'Promediás las dos bases y multiplicás por la altura: A = (B + b) ÷ 2 × h.',
        yes: [
          'Mediana (base media): m = (B + b) ÷ 2 — es el segmento que une los puntos medios de los lados no paralelos',
          'Área: A = m · h. O sea, el trapecio equivale a un rectángulo de base la mediana y misma altura',
          'Perímetro: P = B + b + lado1 + lado2 (hacen falta los dos lados no paralelos)',
          'Si las dos bases son iguales, el trapecio es un paralelogramo y la fórmula sigue valiendo',
        ],
        warn: [
          'La altura es la distancia PERPENDICULAR entre las bases, no la longitud de un lado inclinado',
          'Un lado no paralelo nunca puede ser más corto que la altura: si lo es, el trapecio no cierra',
          'Sin los dos lados no paralelos hay área pero no hay perímetro',
        ],
        plazo: 'verificación: bases 10 y 6 con altura 4 dan mediana 8 y área 32.',
      },
      {
        id: 'rombo',
        label: 'Rombo (por sus diagonales)',
        hint: 'Ej.: "diagonales de 10 y 6"',
        answer: 'Multiplicás las diagonales y dividís por 2: A = (D × d) ÷ 2.',
        yes: [
          'Área: A = (D · d) ÷ 2, con D la diagonal mayor y d la menor',
          'Lado por Pitágoras: las diagonales se cortan en ángulo recto, así que cada semidiagonal es un cateto → l = √((D/2)² + (d/2)²)',
          'Perímetro: P = 4 · l, porque los cuatro lados del rombo son iguales',
          'Si las dos diagonales son iguales, el rombo es un cuadrado',
        ],
        warn: [
          'No sumes las diagonales al perímetro: las diagonales son interiores, no lados',
          'La diagonal mayor tiene que ser mayor o igual a la menor; si las cargaste al revés el área da igual pero el rótulo miente',
          'La misma fórmula (diagonales sobre 2) vale para cualquier cuadrilátero con diagonales perpendiculares',
        ],
        plazo: 'verificación: diagonales 10 y 6 dan área 30, lado √34 ≈ 5,83 y perímetro ≈ 23,32.',
      },
      {
        id: 'poligono',
        label: 'Polígono regular (por lado y apotema)',
        hint: 'Ej.: "un hexágono de lado 4"',
        answer: 'Sacás la apotema del lado y aplicás A = perímetro × apotema ÷ 2.',
        yes: [
          'Apotema (distancia del centro al medio de un lado): ap = L ÷ (2 · tan(180° ÷ n))',
          'Perímetro: P = n · L',
          'Área: A = (P · ap) ÷ 2 — es la suma de los n triángulos que van del centro a cada lado',
          'Ángulo interior de cada vértice: (n − 2) · 180 ÷ n; los n ángulos suman (n − 2) · 180',
        ],
        warn: [
          'Regular quiere decir todos los lados y todos los ángulos iguales: si no lo es, esta fórmula no aplica',
          'n tiene que ser 3 o más: con 2 lados no hay figura cerrada',
          'Cuando n crece mucho el polígono se parece cada vez más a un círculo: con n = 100 el área ya casi es π·r²',
        ],
        plazo: 'verificación: un hexágono de lado 4 tiene apotema ≈ 3,46, perímetro 24 y área ≈ 41,57.',
      },
    ],
  },

  inputsTitle: 'Cargá las medidas de tu figura',
  inputsIntro:
    'Cada rama usa dos, tres o seis campos. El campo A es siempre la medida principal (radio, primer lado, base mayor, diagonal mayor o longitud del lado). Los campos que sobran no molestan.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands el parser
    // convierte "12.5" en 125. Se parsean con H.num(), que acepta la coma
    // decimal rioplatense ("12,5" → 12.5).
    { id: 'a', label: 'A — medida principal', value: '5', help: 'Círculo y sector: el radio. Herón: lado a. Trapecio: base mayor. Rombo: diagonal mayor. Polígono: la longitud del lado.' },
    { id: 'b', label: 'B — segunda medida', value: '4', help: 'Herón: lado b. Trapecio: base menor. Rombo: diagonal menor.' },
    { id: 'c', label: 'C — tercera medida', value: '3', help: 'Herón: lado c. Trapecio: la altura (perpendicular entre las bases).' },
    { id: 'd', label: 'D — lado no paralelo 1', value: '5', help: 'Sólo trapecio: uno de los dos lados inclinados. Va al perímetro.' },
    { id: 'e', label: 'E — lado no paralelo 2', value: '5', help: 'Sólo trapecio: el otro lado inclinado.' },
    { id: 'n', label: 'Cantidad de lados (n)', value: '6', help: 'Sólo polígono regular: 3 triángulo, 4 cuadrado, 5 pentágono, 6 hexágono…' },
    { id: 'ang', label: 'Ángulo del sector (en grados)', value: '60', help: 'Sólo sector circular: de 0 a 360. Media pizza son 180°, un cuarto 90°.' },
    { id: 'x1', label: 'Vértice A — x₁', value: '0', help: 'Sólo triángulo por coordenadas.' },
    { id: 'y1', label: 'Vértice A — y₁', value: '0', help: 'Sólo triángulo por coordenadas.' },
    { id: 'x2', label: 'Vértice B — x₂', value: '4', help: 'Sólo triángulo por coordenadas.' },
    { id: 'y2', label: 'Vértice B — y₂', value: '0', help: 'Sólo triángulo por coordenadas.' },
    { id: 'x3', label: 'Vértice C — x₃', value: '0', help: 'Sólo triángulo por coordenadas.' },
    { id: 'y3', label: 'Vértice C — y₃', value: '3', help: 'Sólo triángulo por coordenadas.' },
  ],
  fineprint:
    'Aceptamos coma decimal: "12,5" se lee como doce y medio. Las medidas son adimensionales: si cargás centímetros el área sale en cm², si cargás metros sale en m². Los ángulos de esta página van siempre en GRADOS, no en radianes.',

  chart: {
    type: 'bars',
    title: 'Área y perímetro, uno al lado del otro',
    caption:
      'Las barras comparan el área con el perímetro y con las medidas que entraron. Sirve para el chequeo de sentido común: el área crece al cuadrado y el perímetro en forma lineal, así que si duplicás una medida el área tiene que dar cuatro veces más y el contorno sólo el doble.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero los datos que entraron, después la sustitución en la fórmula, después el resultado y al final la verificación. Si la verificación no cierra, revisá qué medida cargaste en cada campo.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre área y perímetro?',
      a: 'El <b>perímetro</b> es la longitud del contorno: lo que medirías caminando el borde, y va en unidades de longitud (cm, m). El <b>área</b> es la superficie que la figura cubre, y va en unidades cuadradas (cm², m²). Un rectángulo de 10 × 1 y otro de 4 × 4 tienen casi el mismo perímetro (22 contra 16) pero áreas muy distintas (10 contra 16).',
    },
    {
      q: '¿Cómo se calcula el área y el perímetro de un círculo?',
      a: 'El área es <b>A = π · r²</b> y el perímetro (que se llama circunferencia) es <b>P = 2 · π · r</b>. Con radio 5: área = π × 25 ≈ <b>78,54</b> y perímetro = 2 × π × 5 ≈ <b>31,42</b>. El error más común es calcular (π·r)² en vez de π·r²: primero se eleva el radio al cuadrado y recién después se multiplica por π.',
    },
    {
      q: '¿Cómo saco el área de un sector circular?',
      a: 'Un sector es una porción de círculo, así que se lleva la misma fracción del área total: <b>A = π · r² × (ángulo ÷ 360)</b>. Un sector de 60° en un círculo de radio 5 abarca 60/360 = un sexto del disco, o sea π × 25 ÷ 6 ≈ <b>13,09</b>. La longitud del arco sale igual: 2 · π · r × (ángulo ÷ 360).',
    },
    {
      q: '¿Qué es la fórmula de Herón y cuándo se usa?',
      a: 'Es la forma de sacar el área de un triángulo cuando conocés los <b>tres lados y ninguna altura</b>. Se calcula el semiperímetro <b>s = (a+b+c)/2</b> y después <b>A = √(s(s−a)(s−b)(s−c))</b>. Con lados 3, 4 y 5: s = 6 y A = √(6·3·2·1) = √36 = <b>6</b>. Es la fórmula preferida en topografía, donde medir lados es fácil y medir alturas no.',
    },
    {
      q: '¿Cómo calculo el área de un triángulo si sólo tengo las coordenadas de los vértices?',
      a: 'Con la fórmula del determinante, también llamada del zapato o <i>shoelace</i>: <b>A = ½ · |x₁(y₂−y₃) + x₂(y₃−y₁) + x₃(y₁−y₂)|</b>. Para A(0,0), B(4,0) y C(0,3) da ½ · |0 + 4·3 + 0| = <b>6</b>. Si el resultado da 0, los tres puntos están alineados y no forman triángulo.',
    },
    {
      q: '¿Cómo se calcula el área de un trapecio?',
      a: 'Se promedian las dos bases y se multiplica por la altura: <b>A = (B + b) ÷ 2 × h</b>. Ese promedio se llama <b>mediana</b> y es una medida real de la figura: el segmento que une los puntos medios de los lados inclinados. Con bases 10 y 6 y altura 4, la mediana es 8 y el área es <b>32</b>. La altura es siempre la distancia perpendicular entre las bases, nunca el largo de un lado inclinado.',
    },
    {
      q: '¿Por qué el área del rombo es diagonal por diagonal dividido dos?',
      a: 'Porque las dos diagonales de un rombo se cortan en ángulo recto y lo parten en <b>cuatro triángulos rectángulos</b> iguales, cada uno de catetos D/2 y d/2. Cuatro veces (D/2 · d/2 ÷ 2) da exactamente <b>D · d ÷ 2</b>. Esa misma perpendicularidad es la que permite sacar el lado por Pitágoras: l = √((D/2)² + (d/2)²).',
    },
    {
      q: '¿Qué es la apotema de un polígono regular?',
      a: 'Es la distancia del <b>centro al punto medio de un lado</b>, o sea la altura de cada uno de los n triángulos en que se puede partir el polígono. Se calcula con <b>ap = L ÷ (2 · tan(180°/n))</b> y con ella el área es simplemente <b>perímetro × apotema ÷ 2</b>. No confundirla con el radio, que va del centro a un vértice y siempre es más largo.',
    },
    {
      q: '¿Cuánto suman los ángulos interiores de un polígono?',
      a: 'La suma es <b>(n − 2) × 180°</b>, porque todo polígono de n lados se puede partir en n−2 triángulos. Un cuadrilátero suma 360°, un pentágono 540° y un hexágono 720°. Si además es <b>regular</b>, cada ángulo mide esa suma dividida n: en el hexágono regular, 720 ÷ 6 = <b>120°</b> por vértice.',
    },
    {
      q: 'Si duplico las medidas de una figura, ¿el área también se duplica?',
      a: 'No: el <b>perímetro</b> se duplica pero el <b>área se multiplica por 4</b>. Las longitudes escalan con el factor k y las superficies con k². Un círculo de radio 10 tiene el doble de circunferencia que uno de radio 5, pero cuatro veces el área. Es el error más caro cuando se calcula material de obra a partir de un plano ampliado.',
    },
    {
      q: '¿Tres lados cualesquiera forman un triángulo?',
      a: 'No. Tiene que cumplirse la <b>desigualdad triangular</b>: cada lado menor que la suma de los otros dos. Con 1, 2 y 10 no hay triángulo posible, porque 1 + 2 no llega a 10. Cuando eso pasa, la fórmula de Herón devuelve la raíz de un número negativo y la calculadora avisa en vez de inventar un número.',
    },
    {
      q: '¿En qué unidades quedan los resultados?',
      a: 'En las mismas que cargaste. Si las medidas están en centímetros, el perímetro sale en <b>cm</b> y el área en <b>cm²</b>; si están en metros, en m y m². La página no convierte: mostramos "u" (unidades) justamente para recordar que la unidad la ponés vos y tiene que ser la misma en todos los campos.',
    },
  ],

  sources: [
    {
      name: "Heron's Formula",
      url: 'https://mathworld.wolfram.com/HeronsFormula.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Regular Polygon — apotema, área y ángulos',
      url: 'https://mathworld.wolfram.com/RegularPolygon.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Circular Sector — área del sector y longitud del arco',
      url: 'https://mathworld.wolfram.com/CircularSector.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Shoelace Formula — área por coordenadas de los vértices',
      url: 'https://mathworld.wolfram.com/PolygonArea.html',
      publisher: 'Wolfram MathWorld',
    },
    {
      name: 'Área y perímetro — curso de geometría',
      url: 'https://www.khanacademy.org/math/geometry',
      publisher: 'Khan Academy',
    },
    {
      name: 'Recursos de matemática para el nivel secundario',
      url: 'https://www.educ.ar/recursos/buscar?tema=matematica',
      publisher: 'Educ.ar — Ministerio de Educación de la Nación',
    },
  ],

  replaces: [
    '/calculadora-area-perimetro-circulo-radio',
    '/calculadora-area-perimetro-circulo-sector-circular',
    '/calculadora-area-triangulo-heron-tres-lados',
    '/calculadora-area-triangulo-vertices-coordenadas',
    '/area-perimetro-trapecio',
    '/area-perimetro-rombo-diagonales',
    '/area-poligono-regular-apotema',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-area-perimetro-figuras',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
