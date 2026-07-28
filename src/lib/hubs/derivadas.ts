import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo derivo esta función?"
 * Arquetipo RAMIFICADO: 6 ramas = las 6 formas en que aparece la derivada en
 * un curso de análisis. Absorbe 6 URLs (ver `replaces`).
 *
 * Es contenido de ESTUDIANTE: el valor no está en el número sino en el
 * PROCEDIMIENTO. Cada fila del desglose es un paso con nombre propio (qué
 * regla se aplicó, qué se sustituyó, qué dio) y la última fila siempre es una
 * verificación independiente — derivada numérica por diferencia central —
 * para que el alumno pueda confiar en lo que ve.
 *
 * FORMATO: acá no hay plata en ninguna rama. El default de HubRow es 'ars',
 * así que TODA fila declara `format` explícito ('plain' o 'unit').
 *
 * PRECISIÓN: todo resultado pasa por snap() — lo que esté a menos de 1e-10 de
 * un entero se redondea al entero, y el "-0" se normaliza a 0. Sin eso, una
 * derivada que vale exactamente 2 se imprime "2,0000000001" y el alumno
 * piensa que se equivocó.
 */
export const hub: HubData = {
  slug: 'matematica/derivadas',
  title: '¿Cómo derivo esta función? — Reglas, parciales, tangente y extremos',
  description:
    'Derivada paso a paso: regla de la potencia, producto, cociente y cadena, polinomio por coeficientes, derivadas parciales, derivación implícita, recta tangente y normal, y máximos y mínimos con el criterio de la segunda derivada.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y calculadora de análisis matemático',
  h1: '¿Cómo derivo esta función?',
  lede:
    'Derivar es medir cuánto cambia una función cuando movés un poquito la variable. Empezamos por el caso más común —una función de una sola variable— y si lo tuyo son parciales, una ecuación implícita, la recta tangente o los máximos y mínimos, lo cambiás abajo y el procedimiento se adapta.',
  stamps: ['Actualizado 27-07-2026', '6 tipos de derivada adentro', 'Con la regla aplicada en cada paso'],

  // Genérico a propósito: en cinco ramas el número grande es la derivada
  // evaluada, pero en la de extremos es la abscisa del primer punto crítico.
  resultLabel: 'El resultado del cálculo',

  cases: {
    title: '¿Qué tipo de derivada necesitás?',
    intro:
      'Elegí qué te están pidiendo. La derivada es siempre la misma idea; lo que cambia es qué regla se aplica y qué se deja fijo mientras derivás.',
    items: [
      {
        id: 'basica',
        label: 'Derivada de una función (potencia, producto, cociente, cadena)',
        hint: 'Ej.: "derivá f(x) = x³ − 3x + 2" o "f(x) = x²·sen(3x)"',
        answer:
          'Se aplica la regla que corresponda a la estructura de la función: potencia si es xⁿ, producto si son dos factores, cociente si es una fracción y cadena si hay una función adentro de otra.',
        yes: [
          'Potencia: la derivada de xⁿ es n·xⁿ⁻¹ — el exponente baja como coeficiente y se resta 1',
          'Producto: (u·v)′ = u′·v + u·v′ — se deriva uno y se deja el otro, dos veces',
          'Cociente: (u/v)′ = (u′·v − u·v′) / v² — el orden importa, el numerador NO es simétrico',
          'Cadena: (f(g(x)))′ = f′(g(x)) · g′(x) — derivás la de afuera y multiplicás por la de adentro',
          'Constante: la derivada de un número es 0; la de una suma es la suma de las derivadas',
        ],
        warn: [
          'La derivada de un producto NO es el producto de las derivadas: (x·x)′ es 2x, no 1',
          'En el cociente, invertir el orden del numerador te da el resultado con el signo cambiado',
          'La cadena es el paso que más se olvida: si escribís sen(3x)′ = cos(3x) te falta el ·3',
          'Si el punto que elegís no está en el dominio (por ejemplo x = 0 en 1/x), no hay derivada ahí',
        ],
        plazo: 'chequeo: la última fila compara la derivada simbólica con la numérica; si difieren, hay un error de planteo o el punto es problemático.',
      },
      {
        id: 'polinomio',
        label: 'Derivada de un polinomio cargando los coeficientes',
        hint: 'Ej.: "1, 0, −3, 2" es x³ − 3x + 2',
        answer:
          'Con los coeficientes ordenados del mayor grado al término independiente, cada uno se multiplica por su exponente y el último desaparece.',
        yes: [
          'Se cargan los coeficientes del mayor grado al independiente, separados por comas: "1, 0, −3, 2" es x³ − 3x + 2',
          'Los ceros hay que escribirlos: si falta el término en x², va un 0 en su lugar',
          'La derivada baja un grado: un polinomio de grado n tiene derivada de grado n−1',
          'Es la vía rápida cuando el polinomio es largo y no querés escribir toda la expresión',
        ],
        warn: [
          'Si te olvidás un 0 intermedio, todos los exponentes se corren y el resultado queda mal',
          'El término independiente siempre se anula: no aparece en la derivada',
          'El coeficiente principal no puede ser 0: en ese caso el grado real es menor',
        ],
        plazo: 'chequeo: contá los coeficientes de la derivada — tienen que ser exactamente uno menos que los del polinomio original.',
      },
      {
        id: 'parciales',
        label: 'Derivadas parciales (funciones de varias variables)',
        hint: 'Ej.: "f(x,y) = x²y + y³, ¿cuánto vale ∂f/∂x?"',
        answer:
          'Derivás respecto de una variable tratando a las otras como si fueran números fijos.',
        yes: [
          'Al derivar respecto de x, la y y la z se comportan como constantes',
          'El gradiente ∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z) es el vector con las tres parciales juntas',
          'El gradiente apunta en la dirección de máximo crecimiento de la función',
          'Las mixtas ∂²f/∂x∂y y ∂²f/∂y∂x coinciden cuando la función es suficientemente suave (teorema de Schwarz)',
        ],
        warn: [
          'Tratar la otra variable como constante es literal: la derivada de y³ respecto de x es 0, no 3y²',
          'La parcial evaluada depende del punto (x, y, z) completo, no sólo de la variable que derivás',
          'Que existan las parciales no garantiza que la función sea diferenciable en varias variables',
        ],
        plazo: 'chequeo: sumá las tres parciales evaluadas — el desglose muestra el módulo del gradiente, que es 0 sólo en un punto crítico.',
      },
      {
        id: 'implicita',
        label: 'Derivación implícita (una ecuación con x e y mezcladas)',
        hint: 'Ej.: "x² + y² = 25, ¿cuánto vale dy/dx en (3, 4)?"',
        answer:
          'Pasás todo a la forma F(x,y) = 0 y usás dy/dx = −Fx / Fy, con las parciales evaluadas en el punto.',
        yes: [
          'Se lleva la igualdad a F(x, y) = 0 restando el miembro derecho',
          'Se derivan las dos parciales: Fx (tratando y como constante) y Fy (tratando x como constante)',
          'El despeje es dy/dx = −Fx / Fy',
          'Sirve cuando no podés despejar y en función de x, como en la circunferencia o el folium de Descartes',
        ],
        warn: [
          'El punto (x, y) que cargás tiene que cumplir la ecuación: si no está en la curva, el resultado no significa nada',
          'Si Fy = 0 en el punto, la tangente es vertical y dy/dx no existe (ahí hay que mirar dx/dy)',
          'El signo menos del despeje es parte de la fórmula, no una distracción: olvidarlo invierte la pendiente',
        ],
        plazo: 'chequeo: el desglose muestra F(x, y) evaluado en tu punto. Si no da 0, el punto no pertenece a la curva.',
      },
      {
        id: 'tangente',
        label: 'Recta tangente y recta normal en un punto',
        hint: 'Ej.: "la tangente a f(x) = x² en x = 3"',
        answer:
          'La pendiente de la tangente es f′(x₀); la de la normal es −1/f′(x₀), y las dos pasan por (x₀, f(x₀)).',
        yes: [
          'Primero el punto de contacto: (x₀, f(x₀))',
          'Después la pendiente: m = f′(x₀), la derivada evaluada en ese punto',
          'Tangente: y = m·(x − x₀) + f(x₀), o en forma explícita y = m·x + b',
          'Normal: la perpendicular por el mismo punto, con pendiente −1/m',
        ],
        warn: [
          'Si f′(x₀) = 0 la tangente es horizontal y la normal es una recta VERTICAL x = x₀ (no tiene pendiente)',
          'La tangente toca la curva en el punto, pero puede volver a cruzarla más lejos: no es un límite del gráfico',
          'Evaluar la derivada en el punto NO es lo mismo que derivar el valor f(x₀): eso da 0',
        ],
        plazo: 'chequeo: el desglose trae la ordenada al origen b; reemplazando x₀ en y = m·x + b tenés que recuperar f(x₀).',
      },
      {
        id: 'extremos',
        label: 'Máximos, mínimos y puntos críticos',
        hint: 'Ej.: "los extremos de f(x) = x³ − 3x entre −5 y 5"',
        answer:
          'Los candidatos son los ceros de f′(x); el signo de f″ en cada uno decide si es máximo, mínimo o ninguno de los dos.',
        yes: [
          'Paso 1: resolver f′(x) = 0 — cada solución es un punto crítico',
          'Paso 2: evaluar f″ en cada punto crítico (criterio de la segunda derivada)',
          'f″ > 0 → mínimo local (la curva abre hacia arriba); f″ < 0 → máximo local',
          'f″ = 0 → el criterio no decide: hay que mirar el signo de f′ a los costados o pasar a la tercera derivada',
          'Donde f″ cambia de signo hay un punto de inflexión: cambia la concavidad',
        ],
        warn: [
          'La búsqueda es numérica dentro del intervalo que cargás: si ampliás el rango pueden aparecer más puntos',
          'Un extremo local no es el máximo absoluto: en un intervalo cerrado hay que comparar también los bordes',
          'Hay puntos críticos que no son extremos (x = 0 en f(x) = x³ es un ejemplo clásico)',
          'Si la función no es derivable en un punto (una esquina, por ejemplo), ese punto también es candidato y este método no lo detecta',
        ],
        plazo: 'chequeo: en un extremo verdadero, f′ evaluada ahí tiene que dar prácticamente 0 — el desglose lo muestra.',
      },
    ],
  },

  inputsTitle: 'Cargá tu función',
  inputsIntro:
    'Según la rama que elijas se usan dos, tres o cuatro campos; los que sobran quedan ahí sin molestar. Se escriben con la notación de siempre: ^ para potencias, * o nada para multiplicar (2x y 2*x son lo mismo), y sin(), cos(), tan(), exp(), ln(), sqrt() para las funciones.',
  fields: [
    // Campos de TEXTO a propósito: con type:'number' o thousands el parser
    // rompe la coma decimal rioplatense y las expresiones no entrarían.
    { id: 'funcion', label: 'f(x) — la función a derivar', value: 'x^3-3x+2', help: 'En parciales puede tener x, y, z: "x^2*y+y^3". Aceptamos coma decimal: 0,5 y 0.5 son lo mismo.' },
    { id: 'punto', label: 'x₀ — el punto donde evaluar', value: '3', help: 'La derivada se calcula simbólicamente y después se evalúa acá. En parciales es el valor de x.' },
    { id: 'coefs', label: 'Coeficientes del polinomio (del mayor grado al independiente)', value: '1, 0, -3, 2', help: 'Sólo la rama de coeficientes. "1, 0, -3, 2" es x³ − 3x + 2. Los ceros intermedios hay que escribirlos.' },
    {
      id: 'variable', label: 'Derivar respecto de', type: 'select', value: 'x',
      options: [
        { value: 'x', label: 'x — ∂f/∂x' },
        { value: 'y', label: 'y — ∂f/∂y' },
        { value: 'z', label: 'z — ∂f/∂z' },
      ],
      help: 'Sólo la rama de parciales: elegí cuál variable se mueve mientras las otras quedan fijas.',
    },
    { id: 'yv', label: 'y₀ — valor de y en el punto', value: '4', help: 'Ramas de parciales y de derivación implícita.' },
    { id: 'zv', label: 'z₀ — valor de z en el punto', value: '0', help: 'Sólo parciales, si tu función tiene z.' },
    { id: 'ecuacion', label: 'Ecuación implícita (con un =)', value: 'x^2+y^2=25', help: 'Sólo derivación implícita. El punto se toma de x₀ e y₀.' },
    { id: 'min', label: 'Desde x =', value: '-5', help: 'Sólo la rama de máximos y mínimos: dónde empieza la búsqueda de puntos críticos.' },
    { id: 'max', label: 'Hasta x =', value: '5', help: 'Sólo la rama de máximos y mínimos: dónde termina la búsqueda.' },
  ],
  fineprint:
    'La derivada se calcula de forma simbólica —no es una aproximación— y recién después se evalúa en el punto. La última fila del desglose la contrasta con la derivada numérica por diferencia central: si las dos coinciden, el resultado es sólido. Los ceros de f′(x) para los extremos sí se buscan numéricamente dentro del intervalo que cargues.',

  chart: {
    type: 'bars',
    title: 'Las magnitudes en juego',
    caption:
      'Las barras comparan, en valor absoluto, las cantidades que decide cada rama: el valor de la función, su pendiente y su curvatura en el punto; las tres componentes del gradiente en parciales; o el valor de la función en cada punto crítico. Cuando la barra de la derivada es chiquita al lado de la de la función, estás en una zona plana; cuando es enorme, la función está cambiando rápido justo ahí.',
  },
  breakdownTitle: 'El procedimiento, paso a paso',
  breakdownIntro:
    'Cada fila es un paso con nombre: qué regla se aplicó, qué se sustituyó y qué dio. La última fila es siempre una verificación independiente, calculada por otro camino, para que puedas confiar en el resultado sin creernos.',

  faq: [
    {
      q: '¿Cuáles son las reglas básicas para derivar?',
      a: 'Son cuatro y con eso se resuelve casi todo. <b>Potencia</b>: (xⁿ)′ = n·xⁿ⁻¹. <b>Producto</b>: (u·v)′ = u′v + uv′. <b>Cociente</b>: (u/v)′ = (u′v − uv′)/v². <b>Cadena</b>: (f(g(x)))′ = f′(g(x))·g′(x). A eso se le suma que la derivada de una constante es 0 y que la derivada de una suma es la suma de las derivadas.',
    },
    {
      q: '¿Cómo se deriva x elevado a la n?',
      a: 'Con la regla de la potencia: el exponente baja multiplicando y se le resta 1. Así, <b>(x³)′ = 3x²</b>, <b>(5x⁴)′ = 20x³</b> y <b>(x)′ = 1</b>. Funciona también con exponentes negativos y fraccionarios: (1/x)′ = (x⁻¹)′ = −x⁻² = <b>−1/x²</b>, y (√x)′ = (x^½)′ = <b>1/(2√x)</b>.',
    },
    {
      q: '¿Cuándo uso la regla de la cadena?',
      a: 'Cuando hay una función <b>adentro</b> de otra. sen(3x) es sen aplicado a 3x, así que su derivada es cos(3x) multiplicado por la derivada de lo de adentro: <b>3·cos(3x)</b>. La regla de bolsillo: derivá la de afuera dejando lo de adentro quieto, y después multiplicá por la derivada de lo de adentro. Es el paso que más se olvida y el que más puntos cuesta en un parcial.',
    },
    {
      q: '¿Por qué la derivada de un producto no es el producto de las derivadas?',
      a: 'Porque derivar mide cómo cambia el resultado cuando movés x, y en un producto los dos factores cambian a la vez. El contraejemplo más corto: x·x = x², cuya derivada es <b>2x</b>; el producto de las derivadas sería 1·1 = 1. La fórmula correcta, <b>u′v + uv′</b>, suma las dos contribuciones: la de mover u dejando v quieto y la de mover v dejando u quieto.',
    },
    {
      q: '¿Qué es una derivada parcial y en qué se diferencia de la común?',
      a: 'Es la derivada de una función de varias variables respecto de <b>una sola</b>, tratando a las demás como números fijos. Si f(x,y) = x²y + y³, entonces ∂f/∂x = <b>2xy</b> (la y quedó quieta y el y³ se anuló como cualquier constante) y ∂f/∂y = <b>x² + 3y²</b>. Las tres parciales juntas forman el <b>gradiente</b>, que es el vector que apunta hacia donde la función crece más rápido.',
    },
    {
      q: '¿Cómo se hace una derivación implícita?',
      a: 'Cuando no podés despejar y, pasás todo a la forma F(x,y) = 0 y aplicás <b>dy/dx = −Fx / Fy</b>. En la circunferencia x² + y² = 25 queda F = x² + y² − 25, con Fx = 2x y Fy = 2y, así que dy/dx = <b>−x/y</b>: en el punto (3, 4) la pendiente es −0,75. Si Fy = 0 la tangente es vertical y la derivada no existe ahí.',
    },
    {
      q: '¿Cómo saco la ecuación de la recta tangente en un punto?',
      a: 'Necesitás dos cosas: el punto y la pendiente. El punto es <b>(x₀, f(x₀))</b> y la pendiente es <b>m = f′(x₀)</b>. Con eso, la tangente es <b>y = m·(x − x₀) + f(x₀)</b>. Para f(x) = x² en x₀ = 3: el punto es (3, 9), m = 6 y la tangente es y = 6(x − 3) + 9, o sea <b>y = 6x − 9</b>.',
    },
    {
      q: '¿Cuál es la diferencia entre la recta tangente y la normal?',
      a: 'La tangente <b>roza</b> la curva con su misma pendiente; la normal es <b>perpendicular</b> a ella en el mismo punto. Por eso sus pendientes son recíprocas y opuestas: si la tangente tiene pendiente m, la normal tiene <b>−1/m</b>. Caso especial: si m = 0 la tangente es horizontal y la normal es la recta vertical <b>x = x₀</b>, que no tiene pendiente.',
    },
    {
      q: '¿Cómo encuentro los máximos y mínimos de una función?',
      a: 'Dos pasos. Primero resolvés <b>f′(x) = 0</b>: cada solución es un punto crítico, un lugar donde la curva está momentáneamente plana. Después evaluás la segunda derivada en cada uno: si <b>f″ &gt; 0</b> es un mínimo (la curva abre hacia arriba, como una sonrisa) y si <b>f″ &lt; 0</b> es un máximo.',
    },
    {
      q: '¿Qué pasa si la segunda derivada da cero en un punto crítico?',
      a: 'El criterio <b>no decide</b>. Puede haber un mínimo (f(x) = x⁴ en x = 0), un máximo (f(x) = −x⁴) o ninguna de las dos cosas (f(x) = x³, que ahí sólo tiene un punto de inflexión). La salida es mirar el <b>signo de f′ a la izquierda y a la derecha</b>: si pasa de negativa a positiva es un mínimo, si pasa de positiva a negativa es un máximo, y si no cambia de signo no es un extremo.',
    },
    {
      q: '¿Todo punto crítico es un máximo o un mínimo?',
      a: 'No. El caso de manual es <b>f(x) = x³ en x = 0</b>: la derivada vale 0 pero la función sigue creciendo de un lado y del otro. Es un punto de inflexión con tangente horizontal. Y al revés: en un intervalo cerrado, el máximo absoluto puede estar en un <b>extremo del intervalo</b>, donde la derivada no se anula. Por eso siempre hay que comparar también los bordes.',
    },
    {
      q: '¿Qué significa que la derivada valga 0 en un punto?',
      a: 'Que ahí la función está <b>instantáneamente quieta</b>: la recta tangente es horizontal. Puede ser la cima de una loma, el fondo de un valle o un descanso pasajero antes de seguir subiendo. Cuál de las tres es lo decide la segunda derivada, que mide la <b>curvatura</b>: positiva significa que abre hacia arriba y negativa que abre hacia abajo.',
    },
    {
      q: '¿Para qué sirve derivar fuera de la clase de matemática?',
      a: 'La derivada es la <b>velocidad de cambio</b> de cualquier cosa. En física, la derivada de la posición es la velocidad y la de la velocidad es la aceleración. En economía, la derivada del costo total es el costo marginal. En cualquier problema de optimización —el envase que gasta menos material, la ruta más rápida, el precio que maximiza la ganancia— la respuesta sale de igualar una derivada a cero.',
    },
  ],

  sources: [
    {
      name: 'Cálculo diferencial: reglas de derivación, regla de la cadena y optimización',
      url: 'https://es.khanacademy.org/math/differential-calculus',
      publisher: 'Khan Academy (en español)',
    },
    {
      name: '18.01 Single Variable Calculus — apuntes y clases (derivadas, tangentes, extremos)',
      url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/',
      publisher: 'MIT OpenCourseWare',
    },
    {
      name: 'Calculus I — Derivatives: potencia, producto, cociente y cadena',
      url: 'https://tutorial.math.lamar.edu/Classes/CalcI/DerivativeIntro.aspx',
      publisher: "Paul's Online Math Notes — Lamar University",
    },
    {
      name: 'Calculus of One Variable — definiciones y teoremas de referencia',
      url: 'https://dlmf.nist.gov/1.4',
      publisher: 'NIST Digital Library of Mathematical Functions',
    },
    {
      name: 'Recursos de matemática para nivel secundario y superior',
      url: 'https://www.educ.ar/recursos/buscar?tema=matematica',
      publisher: 'Educ.ar — Ministerio de Educación de la Nación',
    },
  ],

  replaces: [
    '/calculadora-derivada-funcion-basica',
    '/calculadora-derivada-polinomio-coeficientes',
    '/calculadora-derivadas-parciales',
    '/calculadora-derivacion-implicita',
    '/calculadora-recta-tangente-normal',
    '/calculadora-maximos-minimos-funcion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
