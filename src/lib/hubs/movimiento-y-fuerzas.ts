import type { HubData } from './types';

/**
 * Hub de decisión — "Movimiento, fuerzas y energía"
 * Arquetipo RAMIFICADO (5 casos): velocidad-distancia-tiempo (default), caída
 * libre, tiro parabólico, fuerza y fricción (F = m·a, f = μ·N) y energía
 * cinética / potencial / momento angular.
 *
 * Absorbe 9 calculadoras sueltas (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - NADA acá es plata: TODAS las filas declaran `format` propio con su unidad.
 *  - `chart.type: 'scale'`: la regla es de VELOCIDAD, de 0,1 m/s a 300 m/s, en
 *    escala logarítmica. Con anchos crudos la última franja se comería el
 *    gráfico entero. Cada rama devuelve la velocidad característica de su
 *    resultado (la de impacto, la de salida, la media) y lo aclara en el
 *    positionLabel.
 *
 * EXACTITUD (regla dura): la gravedad estándar es 9,806 65 m/s² EXACTOS por
 * definición (3.ª CGPM, 1901). Las calculadoras que absorbe usaban 9,81
 * redondeado, lo que introduce un error del 0,034% en toda la cadena — chico,
 * pero innecesario. Acá el campo arranca en el valor exacto y es editable, así
 * que quien quiera reproducir el resultado viejo puede escribir 9,81.
 *   g₀ = 9,806 65 m/s²  (exacto)
 *   Buenos Aires ≈ 9,7967 · Ecuador ≈ 9,780 · Polos ≈ 9,832
 */
export const hub: HubData = {
  slug: 'ciencia/movimiento-y-fuerzas',
  title: 'Movimiento, fuerzas y energía: caída libre, tiro parabólico y F = m·a',
  description:
    'Resolvé velocidad, distancia y tiempo; calculá cuánto tarda y a qué velocidad llega un objeto en caída libre; sacá el alcance y la altura máxima de un tiro parabólico; despejá F = m·a y la fuerza de rozamiento; y calculá energía cinética, energía potencial y momento angular. Con la gravedad estándar exacta.',
  silo: 'Ciencia',
  siloHref: '/ciencia',

  eyebrow: 'Física',
  h1: '¿Cuánto tarda, cuán lejos llega y con cuánta fuerza?',
  lede:
    'Las cinco preguntas de la mecánica clásica que aparecen una y otra vez en la carpeta: a qué velocidad va, cuánto tarda en caer, hasta dónde llega si lo tiro en ángulo, cuánta fuerza hace falta para moverlo y cuánta energía tiene encima. Todas con la gravedad estándar exacta, no la redondeada.',
  stamps: [
    'Actualizado 27-07-2026',
    'g₀ = 9,80665 m/s² exactos (CGPM)',
    'Modelo sin resistencia del aire',
    '9 calculadoras adentro',
  ],

  resultLabel: 'Resultado del cálculo',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Las cinco ramas comparten el mismo panel de datos: completá sólo los campos de la que elegiste. Todas devuelven las velocidades en m/s y en km/h a la vez, que es donde se pierde más gente al pasar de la carpeta a la vida real.',
    items: [
      {
        id: 'mru',
        label: 'Velocidad, distancia y tiempo',
        hint: 'v = d / t: cargá dos y sale el tercero',
        answer:
          'v = d / t. Con dos de los tres datos sale el que falta, y el resultado viene en m/s y en km/h a la vez.',
        yes: [
          'La incógnita despejada: velocidad, distancia o tiempo, según cuál dejes en cero',
          'La velocidad expresada en m/s, en km/h y en nudos, para no tener que reconvertir',
          'El tiempo desglosado en horas, minutos y segundos cuando el número es grande',
          'Referencias reconocibles: caminar 1,4 m/s, correr 5 m/s, un auto en ciudad 11 m/s',
        ],
        warn: [
          'Es movimiento rectilíneo UNIFORME: velocidad constante. Si hay aceleración de por medio, este no es el cálculo',
          'La velocidad que da es la MEDIA del trayecto, no la que marca el velocímetro en cada instante',
          'Las unidades tienen que ser coherentes entre sí: metros con segundos, o kilómetros con horas, nunca mezcladas',
          'Rapidez y velocidad no son sinónimos en física: la velocidad es un vector y en un trayecto de ida y vuelta su promedio es cero',
        ],
        plazo:
          'para convertir de m/s a km/h se multiplica por 3,6, y al revés se divide: es la conversión que más se olvida en el examen.',
      },
      {
        id: 'caida',
        label: 'Caída libre',
        hint: 'Cuánto tarda y a qué velocidad llega al suelo',
        answer:
          'Desde h metros, el tiempo es t = √(2h/g) y la velocidad de impacto v = √(2gh). La masa del objeto no interviene.',
        yes: [
          'El tiempo de caída y la velocidad de impacto en m/s y en km/h',
          'El camino inverso: cuánto cayó en un tiempo dado, con h = ½·g·t²',
          'La energía cinética con la que llega si además cargás la masa',
          'La altura equivalente en pisos de edificio, que es como uno se imagina el problema',
        ],
        warn: [
          'El modelo ignora la resistencia del aire: en caídas de más de unos 3 segundos la velocidad real es bastante menor que la calculada',
          'Un cuerpo humano en caída libre llega a su velocidad límite —unos 55 m/s en posición extendida— y ahí deja de acelerar',
          'La masa NO cambia el tiempo ni la velocidad de caída: una pluma y un martillo caen igual en el vacío, como se filmó en la Luna',
          'La fórmula supone que se soltó desde el reposo: si hubo un empujón inicial hacia abajo, hay que sumar ese término',
        ],
        plazo:
          'un objeto tarda menos de un segundo en caer los primeros 5 metros, pero el segundo tramo de 5 metros lo hace en apenas 0,4 s: la aceleración se nota rápido.',
      },
      {
        id: 'parabolico',
        label: 'Tiro parabólico',
        hint: 'Alcance, altura máxima y tiempo de vuelo',
        answer:
          'Alcance = v₀²·sen(2θ)/g, altura máxima = v₀²·sen²(θ)/(2g). El alcance es máximo a 45° en terreno plano.',
        yes: [
          'El alcance horizontal, la altura máxima y el tiempo total de vuelo',
          'Las componentes horizontal y vertical de la velocidad de salida',
          'El ángulo complementario, que da exactamente el mismo alcance con otra trayectoria',
          'Cuánto ganarías de alcance lanzando a 45°, si no estás lanzando en ese ángulo',
        ],
        warn: [
          'Sin resistencia del aire: en una pelota real el alcance es bastante menor y la trayectoria deja de ser simétrica',
          'La fórmula supone que sale y cae a la misma altura. Si lanzás desde una altura mayor, el ángulo óptimo baja de 45°',
          'Los ángulos complementarios comparten alcance: 30° y 60° caen en el mismo punto, con trayectorias muy distintas',
          'El alcance escala con el CUADRADO de la velocidad: un 10% más rápido da un 21% más de distancia',
        ],
        plazo:
          'a 45° y sin aire, cada 10 m/s de velocidad de salida se traducen en unos 10,2 metros de alcance adicional al cuadrado de la escala.',
      },
      {
        id: 'fuerza',
        label: 'Fuerza, aceleración y rozamiento',
        hint: 'F = m·a y f = μ·N',
        answer:
          'F = m·a: cargá dos de los tres y sale el tercero. Y la fricción vale f = μ·N, con N el peso apoyado si la superficie es horizontal.',
        yes: [
          'La fuerza, la masa o la aceleración despejada, según cuál dejes en cero',
          'La aceleración expresada también en "g", que es la referencia con la que uno la siente',
          'La fuerza de rozamiento con el coeficiente cargado, y la fuerza neta que queda para acelerar',
          'El peso del objeto en newtons, que es lo que en la vida diaria llamamos "kilos"',
        ],
        warn: [
          'Los kilogramos son MASA y los newtons son FUERZA: 1 kg pesa 9,81 N en la Tierra pero sigue teniendo 1 kg de masa en la Luna',
          'El coeficiente estático (arrancar) es mayor que el dinámico (mantener en movimiento): por eso cuesta más empezar a empujar el mueble',
          'En una superficie inclinada la normal no es el peso completo sino su componente perpendicular: N = m·g·cos(θ)',
          'La fricción no depende del área de contacto en el modelo de Coulomb, aunque la intuición diga lo contrario',
        ],
        plazo:
          'los coeficientes de rozamiento típicos van de 0,04 (acero sobre hielo) a 1,0 (goma sobre asfalto seco); el neumático mojado cae a 0,4.',
      },
      {
        id: 'energia',
        label: 'Energía y momento angular',
        hint: 'Ec = ½mv², Ep = m·g·h, L = I·ω',
        answer:
          'La energía cinética es ½·m·v² y la potencial gravitatoria m·g·h. La cinética crece con el CUADRADO de la velocidad.',
        yes: [
          'La energía cinética y la potencial gravitatoria en joules, kilojoules y calorías',
          'La energía total, y la velocidad que alcanzaría el cuerpo si toda la potencial se convirtiera en cinética',
          'El momento angular L = I·ω para el caso rotacional, con su energía de rotación asociada',
          'Comparaciones tangibles: cuántos metros de altura o cuántas calorías de comida equivale esa energía',
        ],
        warn: [
          'La energía cinética depende del CUADRADO de la velocidad: al doble de velocidad, cuatro veces la energía. Por eso los accidentes a 120 km/h no son "un poco peores" que a 60',
          'La energía potencial siempre se mide respecto a un nivel de referencia elegido: no hay un cero absoluto de altura',
          'La conversión de potencial a cinética supone que no hay pérdidas: con rozamiento o resistencia del aire la velocidad final es menor',
          'El momento angular se conserva sin torque externo: si baja el momento de inercia, sube la velocidad angular. Es el patinador que cierra los brazos',
        ],
        plazo:
          'la energía cinética de un auto de 1.200 kg a 100 km/h son 463 kJ, equivalentes a la caída de ese mismo auto desde 39 metros de altura.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu caso',
  inputsIntro:
    'Sólo hacen falta los campos de la rama que elegiste arriba: los demás se ignoran. En las ramas donde hay que despejar, el campo que dejes en cero es el que se calcula.',
  fields: [
    { id: 'distancia', label: 'Distancia recorrida', type: 'number', suffix: 'm', value: 100, min: 0, step: 0.01 },
    {
      id: 'velocidad',
      label: 'Velocidad',
      type: 'number',
      suffix: 'm/s',
      value: 0,
      min: 0,
      step: 0.01,
      help: 'Dejala en 0 para que la calcule con la distancia y el tiempo. Caminar 1,4 · correr 5 · auto en ciudad 11 · ruta 33.',
    },
    { id: 'tiempo', label: 'Tiempo', type: 'number', suffix: 's', value: 9.58, min: 0, step: 0.01 },
    {
      id: 'gravedad',
      label: 'Gravedad',
      type: 'number',
      suffix: 'm/s²',
      value: 9.80665,
      min: 0.1,
      max: 30,
      step: 0.00001,
      help: 'La estándar es 9,80665 m/s² exactos. Buenos Aires 9,7967 · Luna 1,62 · Marte 3,72 · Júpiter 24,79.',
    },
    {
      id: 'altura',
      label: 'Altura de caída',
      type: 'number',
      suffix: 'm',
      value: 45,
      min: 0,
      step: 0.01,
      help: 'Un piso de edificio son unos 3 metros. Dejala en 0 y cargá el tiempo para hacer el cálculo al revés.',
    },
    {
      id: 'tiempoCaida',
      label: 'Caída — tiempo transcurrido (alternativa a la altura)',
      type: 'number',
      suffix: 's',
      value: 0,
      min: 0,
      step: 0.01,
      help: 'Si lo cargás y dejás la altura en 0, se calcula cuánto cayó en ese tiempo.',
    },
    { id: 'v0', label: 'Tiro — velocidad de salida', type: 'number', suffix: 'm/s', value: 25, min: 0, step: 0.01 },
    {
      id: 'angulo',
      label: 'Tiro — ángulo de lanzamiento',
      type: 'number',
      suffix: '°',
      value: 35,
      min: 0,
      max: 90,
      step: 0.1,
      help: 'El alcance es máximo a 45° en terreno plano. Los ángulos complementarios dan el mismo alcance.',
    },
    {
      id: 'masa',
      label: 'Masa del cuerpo',
      type: 'number',
      suffix: 'kg',
      value: 70,
      min: 0,
      step: 0.001,
      help: 'Se usa en fuerza, energía y peso. En caída libre no influye en el tiempo ni en la velocidad.',
    },
    {
      id: 'fuerza',
      label: 'Fuerza aplicada',
      type: 'number',
      suffix: 'N',
      value: 0,
      min: 0,
      step: 0.01,
      help: 'Dejala en 0 para que la calcule con la masa y la aceleración.',
    },
    {
      id: 'aceleracion',
      label: 'Aceleración',
      type: 'number',
      suffix: 'm/s²',
      value: 2,
      min: 0,
      step: 0.001,
      help: 'Dejala en 0 para que la calcule con la fuerza y la masa.',
    },
    {
      id: 'mu',
      label: 'Coeficiente de rozamiento μ',
      type: 'number',
      value: 0.6,
      min: 0,
      max: 2,
      step: 0.01,
      help: 'Goma sobre asfalto seco 0,8 · mojado 0,4 · madera sobre madera 0,4 · acero sobre hielo 0,04.',
    },
    {
      id: 'normal',
      label: 'Fuerza normal (si no es el peso)',
      type: 'number',
      suffix: 'N',
      value: 0,
      min: 0,
      step: 0.01,
      help: 'Dejala en 0 y se usa el peso del objeto sobre superficie horizontal: N = m·g.',
    },
    {
      id: 'velEnergia',
      label: 'Energía — velocidad del cuerpo',
      type: 'number',
      suffix: 'm/s',
      value: 27.78,
      min: 0,
      step: 0.01,
      help: '27,78 m/s son 100 km/h.',
    },
    {
      id: 'alturaEnergia',
      label: 'Energía — altura sobre el nivel de referencia',
      type: 'number',
      suffix: 'm',
      value: 10,
      min: 0,
      step: 0.01,
    },
    {
      id: 'inercia',
      label: 'Rotación — momento de inercia I',
      type: 'number',
      suffix: 'kg·m²',
      value: 0,
      min: 0,
      step: 0.0001,
      help: 'Cargalo sólo si querés el momento angular. Dejalo en 0 y esas filas no aparecen.',
    },
    { id: 'omega', label: 'Rotación — velocidad angular ω', type: 'number', suffix: 'rad/s', value: 0, min: 0, step: 0.0001 },
  ],
  fineprint:
    'Todos los cálculos son del modelo clásico ideal: sin resistencia del aire, sin rotación del proyectil y con gravedad constante. En caídas largas, en proyectiles reales y a velocidades altas la diferencia con la realidad es considerable. La gravedad estándar de 9,80665 m/s² es un valor exacto por definición, no una medición: en cada punto de la Tierra el valor real varía entre 9,78 y 9,83 m/s².',

  chart: {
    type: 'scale',
    title: 'Dónde cae esa velocidad en la escala real',
    caption:
      'La regla va de 0,1 m/s a 300 m/s en escala logarítmica, con referencias que se reconocen: caminar, correr, andar en bici, un auto en ciudad, un auto en ruta, la velocidad límite de un paracaidista y la velocidad del sonido. Cada rama marca sobre esa regla la velocidad característica de su resultado.',
    bands: [
      { label: '0,1 a 1 m/s — caminar despacio, una hormiga', from: 0.1, to: 1, tone: 'good' },
      { label: '1 a 5 m/s — caminar (1,4), trotar, correr (5)', from: 1, to: 5, tone: 'good' },
      { label: '5 a 15 m/s — bici (7), auto en ciudad (11), Usain Bolt (10,4)', from: 5, to: 15, tone: 'good' },
      { label: '15 a 40 m/s — auto en ruta (33), caída de 60 m', from: 15, to: 40, tone: 'warn' },
      { label: '40 a 100 m/s — paracaidista en velocidad límite (55), tren bala', from: 40, to: 100, tone: 'bad' },
      { label: '100 a 300 m/s — avión de línea (250), velocidad del sonido (343)', from: 100, to: 300, tone: 'bad' },
    ],
  },
  breakdownTitle: 'El desglose completo del cálculo',
  breakdownIntro:
    'Cada fila trae su propia unidad: hay metros, segundos, newtons, joules y grados. Las barras comparan el número de cada fila entre sí, así que los joules siempre dan barras larguísimas frente a los segundos: mirá el valor, no la barra.',

  faq: [
    {
      q: '¿Cómo se calcula el tiempo de caída de un objeto?',
      a: 'Con t = √(2h/g). Desde 45 metros y con la gravedad estándar de 9,80665 m/s², el tiempo es √(90/9,80665) = 3,03 segundos, y llega al suelo a 29,7 m/s, o sea 107 km/h. La masa del objeto no aparece en ninguna parte de la fórmula: en el vacío, una pluma y un martillo tardan exactamente lo mismo. Es lo que se filmó en la Luna en 1971 y lo que hace que este cálculo funcione igual para una moneda que para un piano.',
    },
    {
      q: '¿Por qué el modelo de caída libre falla en la realidad?',
      a: 'Porque ignora la resistencia del aire, que crece con el cuadrado de la velocidad. En el primer segundo la diferencia es despreciable, pero a partir de los tres o cuatro segundos empieza a ser grande: un cuerpo humano en caída libre no supera los 55 m/s en posición extendida, mientras que la fórmula predice una velocidad que sigue creciendo sin límite. Para objetos densos y caídas cortas —una llave desde un balcón— el modelo ideal sigue siendo muy bueno.',
    },
    {
      q: '¿A qué ángulo llega más lejos un proyectil?',
      a: 'A 45°, siempre que salga y caiga a la misma altura y no haya aire. La razón está en la fórmula: el alcance vale v₀²·sen(2θ)/g, y sen(2θ) es máximo cuando 2θ = 90°. También se deduce de ahí que los ángulos complementarios comparten alcance: 30° y 60° caen en el mismo punto, sólo que el de 60° sube mucho más y tarda más en llegar. Si lanzás desde una altura mayor que la de caída, el óptimo baja de 45°.',
    },
    {
      q: '¿Cómo se despeja F = m·a?',
      a: 'Según lo que falte: F = m·a, m = F/a, a = F/m. Es la segunda ley de Newton y define la unidad: un newton es la fuerza que le da 1 m/s² a un kilogramo. Una acotación práctica: los "kilos" del gimnasio o de la balanza son masa, y el peso —la fuerza con que la Tierra tira— es esa masa por la gravedad. Un objeto de 10 kg pesa 98,07 N en la Tierra y 16,2 N en la Luna, pero su masa sigue siendo 10 kg en los dos lados.',
    },
    {
      q: '¿Cómo se calcula la fuerza de rozamiento?',
      a: 'Con f = μ·N, donde μ es el coeficiente de rozamiento y N la fuerza normal. Sobre una superficie horizontal, N es el peso: para un cajón de 50 kg sobre piso con μ = 0,6, la fricción vale 0,6 × 50 × 9,80665 = 294 N, y esa es la fuerza mínima para empezar a moverlo. En un plano inclinado la normal baja a m·g·cos(θ), por eso el mismo cajón se desliza solo cuando la pendiente supera el ángulo cuya tangente es μ.',
    },
    {
      q: '¿Por qué la energía cinética crece con el cuadrado de la velocidad?',
      a: 'Porque Ec = ½·m·v². La consecuencia práctica es la que ignora casi todo el mundo al manejar: pasar de 60 a 120 km/h no duplica la energía, la cuadruplica. Un auto de 1.200 kg a 60 km/h tiene 167 kJ; a 120 km/h tiene 667 kJ. Y como la distancia de frenado es proporcional a la energía, también se cuadruplica. Por eso los límites de velocidad no escalan de forma lineal con el riesgo.',
    },
    {
      q: '¿Cuál es la diferencia entre energía cinética y energía potencial?',
      a: 'La cinética es la del movimiento (½·m·v²) y la potencial gravitatoria es la de la posición (m·g·h): la que un cuerpo tiene "guardada" por estar en altura. Se transforman una en la otra: al caer, la potencial se convierte en cinética, y por eso la velocidad de impacto sale de igualar m·g·h con ½·m·v², de donde v = √(2gh). La masa se cancela en esa igualdad, y por eso la velocidad de llegada no depende de cuán pesado sea el objeto.',
    },
    {
      q: '¿Qué es el momento angular y por qué se conserva?',
      a: 'L = I·ω, el producto del momento de inercia por la velocidad angular. Es el análogo rotacional de la cantidad de movimiento y se conserva mientras no actúe un torque externo. De ahí sale el efecto más visual de la física: el patinador que gira con los brazos abiertos y los cierra baja su momento de inercia, y como L tiene que mantenerse, su velocidad de giro sube. Lo mismo explica por qué la Tierra no se frena y por qué un gato cae siempre de pie.',
    },
    {
      q: '¿Cómo paso de m/s a km/h?',
      a: 'Multiplicando por 3,6; para el camino inverso, dividiendo por 3,6. El factor sale de que un kilómetro son 1.000 metros y una hora 3.600 segundos: 1.000/3.600 = 1/3,6. Algunas referencias para tener a mano: caminar son 1,4 m/s (5 km/h), correr un maratón competitivo 5,7 m/s (20,5 km/h), un auto en ciudad 11 m/s (40 km/h) y en ruta 33 m/s (120 km/h).',
    },
    {
      q: '¿La velocidad media es lo mismo que la velocidad instantánea?',
      a: 'No. La media es la distancia total dividida por el tiempo total, y la instantánea es la que marca el velocímetro en cada momento. Si recorriste 100 km en 1 hora, tu velocidad media fue 100 km/h aunque hayas estado 10 minutos parado y hayas ido a 140 en algún tramo. En física hay además otra distinción: la velocidad es un vector, así que en un trayecto de ida y vuelta la velocidad media vectorial es cero aunque hayas recorrido kilómetros.',
    },
    {
      q: '¿Cuánta fuerza hace falta para frenar un auto?',
      a: 'Sale de combinar energía y trabajo: la fuerza de frenado por la distancia recorrida tiene que igualar la energía cinética. Para un auto de 1.200 kg a 100 km/h (463 kJ) que frena en 40 metros, la fuerza necesaria es 11.575 N, unas 0,98 veces su peso. Ese número no puede superar lo que da el rozamiento del neumático: con μ = 0,8 el máximo disponible es 9.414 N, y por eso en la práctica esa frenada necesita más de 40 metros.',
    },
    {
      q: '¿Por qué usar 9,80665 y no 9,81?',
      a: 'Porque 9,80665 m/s² es el valor exacto por definición de la gravedad estándar, fijado por la Conferencia General de Pesas y Medidas en 1901, y es el que se usa para definir el kilogramo-fuerza, el psi y varias unidades más. El 9,81 es un redondeo de aula que introduce un error del 0,034%: en un ejercicio no cambia nada, pero en una cadena de cálculos o en metrología sí. En la práctica, la gravedad real de cada lugar se aparta más que eso: en Buenos Aires vale unos 9,7967 m/s².',
    },
  ],

  sources: [
    {
      name: 'El Sistema Internacional de Unidades (SI), 9.ª edición — definición de newton, joule y gravedad estándar',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
    },
    {
      name: 'NIST Special Publication 811 — Guide for the Use of the International System of Units',
      url: 'https://www.nist.gov/pml/special-publication-811',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'CODATA Internationally Recommended Values of the Fundamental Physical Constants',
      url: 'https://physics.nist.gov/cuu/Constants/',
      publisher: 'NIST / CODATA',
    },
    {
      name: 'NASA Planetary Fact Sheet — gravedad superficial de los cuerpos del sistema solar',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
      publisher: 'NASA Goddard Space Flight Center',
    },
  ],

  replaces: [
    '/calculadora-velocidad-distancia-tiempo-fisica',
    '/calculadora-caida-libre-tiempo-altura',
    '/calculadora-distancia-caida-libre-altura',
    '/calculadora-tiro-parabolico-alcance-altura',
    '/calculadora-aceleracion-fuerza-masa',
    '/calculadora-fuerza-friccion-coeficiente',
    '/calculadora-energia-cinetica-joules',
    '/calculadora-energia-potencial-gravitatoria',
    '/calculadora-momento-angular-rotacion',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Constantes exactas y factores de conversión. */
export const CONST = {
  /** Gravedad estándar, exacta por definición (3.ª CGPM, 1901). */
  G0: 9.80665,
  /** Caloría termoquímica, exacta. */
  CAL: 4.184,
  /** 1 nudo = 1852 m / 3600 s, exacto. */
  NUDO: 1852 / 3600,
};

/** Regla comparativa logarítmica de velocidad, de 0,1 a 300 m/s. */
export const SCALE = {
  minV: 0.1,
  maxV: 300,
  refs: [
    { v: 1.4, label: 'caminar' },
    { v: 5, label: 'correr a ritmo sostenido' },
    { v: 7, label: 'andar en bicicleta' },
    { v: 10.4, label: 'el récord de Usain Bolt' },
    { v: 11, label: 'un auto en ciudad a 40 km/h' },
    { v: 33, label: 'un auto en ruta a 120 km/h' },
    { v: 55, label: 'la velocidad límite de un paracaidista' },
    { v: 250, label: 'un avión de línea en crucero' },
    { v: 343, label: 'la velocidad del sonido' },
  ],
};
