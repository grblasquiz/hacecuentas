import type { HubData } from './types';

/**
 * Hub de decisión — "Planetas, gravedad y viaje espacial"
 * Arquetipo RAMIFICADO (5 casos): peso en otro planeta (default), velocidad de
 * escape, órbita de un satélite, distancias estelares (parsec / año luz /
 * paralaje) y tiempo de viaje interestelar.
 *
 * Absorbe 6 calculadoras sueltas (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - NADA acá es plata: TODAS las filas declaran `format` propio.
 *  - `chart.type: 'scale'`: la regla es de GRAVEDAD SUPERFICIAL, de 0,01 a
 *    30 m/s², en escala logarítmica, con los cuerpos del sistema solar como
 *    referencias. Las ramas de distancias y de viaje interestelar no tienen una
 *    gravedad propia: lo aclaran en el `positionLabel` en vez de inventar un
 *    número.
 *
 * EXACTITUD (regla dura). Las calculadoras que absorbe traían varias constantes
 * truncadas; acá van los valores de referencia:
 *   G   = 6,674 30 × 10⁻¹¹ m³/(kg·s²)   (CODATA 2022; las viejas usaban 6,674e-11)
 *   c   = 299 792 458 m/s               (exacto por definición)
 *   1 año luz = 9 460 730 472 580 800 m (EXACTO: c × año juliano de 365,25 d)
 *                                       (las viejas usaban 9,461 × 10¹² km)
 *   1 parsec  = 149 597 870 700 × 648 000/π m = 3,085 677 581 491 367 × 10¹⁶ m
 *                                       (exacto por la definición IAU 2015)
 *   1 pc = 3,261 563 777 167 4 años luz (las viejas truncaban a 3,26156)
 *   1 UA = 149 597 870 700 m            (exacto, IAU 2012)
 * Las masas y radios planetarios son los del NASA Planetary Fact Sheet.
 */
export const hub: HubData = {
  slug: 'ciencia/planetas-y-viaje-espacial',
  title: 'Peso en otros planetas, velocidad de escape, órbitas y años luz',
  description:
    'Calculá cuánto pesarías en la Luna, Marte o Júpiter; la velocidad de escape y la velocidad orbital de cualquier cuerpo; convertí entre parsecs, años luz, unidades astronómicas y paralaje; y estimá cuánto tardaría un viaje interestelar a una fracción de la velocidad de la luz.',
  silo: 'Ciencia',
  siloHref: '/ciencia',

  eyebrow: 'Astronomía',
  h1: '¿Cuánto pesaría, cuánto tardaría, cuán lejos está?',
  lede:
    'Las cinco cuentas que uno hace cuando mira para arriba: cuánto marcaría la balanza en Marte, a qué velocidad hay que ir para escapar de un planeta, cada cuánto pasa un satélite por encima, qué significa realmente un año luz y cuánto tardaríamos en llegar a la estrella más cercana con lo que sabemos construir hoy.',
  stamps: [
    'Actualizado 27-07-2026',
    'G = 6,67430 × 10⁻¹¹ (CODATA)',
    'Año luz y parsec con la definición IAU exacta',
    '6 calculadoras adentro',
  ],

  resultLabel: 'Resultado del cálculo',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Las cinco ramas comparten el mismo panel de datos: completá sólo los campos de la que elegiste. Las tres primeras traen un selector con los cuerpos del sistema solar ya cargados con sus masas y radios reales.',
    items: [
      {
        id: 'peso',
        label: 'Cuánto pesarías en otro planeta',
        hint: 'La masa no cambia; el peso sí',
        answer:
          'El peso escala con la gravedad superficial: en la Luna marcarías el 16,5% de lo de acá, en Marte el 37,9% y en Júpiter 2,53 veces más.',
        yes: [
          'Tu peso en los ocho planetas, en la Luna, en el Sol y en Plutón, todos a la vez',
          'La gravedad superficial de cada cuerpo en m/s² y en múltiplos de la terrestre',
          'La aclaración que casi nadie hace: tu MASA no cambia en ninguna parte, lo que cambia es la fuerza',
          'Cuánto saltarías en altura en cada cuerpo con el mismo impulso de piernas',
        ],
        warn: [
          'Masa y peso no son lo mismo: la masa en kilogramos es la misma en todo el universo, el peso en newtons depende de dónde estés parado',
          'Júpiter, Saturno, Urano y Neptuno no tienen superficie sólida: la "gravedad superficial" se define en el nivel donde la presión es 1 bar',
          'La gravedad de la Tierra tampoco es uniforme: va de 9,78 m/s² en el ecuador a 9,83 en los polos por el achatamiento y la rotación',
          'Estar en órbita no es estar sin gravedad: a 400 km de altura la gravedad todavía es el 89% de la de la superficie, lo que hay es caída libre permanente',
        ],
        plazo:
          'un astronauta pierde entre el 1% y el 2% de masa ósea por mes en microgravedad, y por eso las misiones largas tienen dos horas diarias de ejercicio obligatorias.',
      },
      {
        id: 'escape',
        label: 'Velocidad de escape',
        hint: 've = √(2GM/R)',
        answer:
          've = √(2GM/R). Desde la Tierra son 11,19 km/s; desde la Luna, apenas 2,38 km/s, y por eso el módulo lunar podía despegar con tan poco motor.',
        yes: [
          'La velocidad de escape del cuerpo, en m/s, km/s y km/h',
          'La comparación contra la Tierra, para dimensionar cuánta energía cuesta salir de ahí',
          'La gravedad superficial del mismo cuerpo, que sale de los mismos dos datos',
          'La energía por kilogramo que hay que aportar para escapar, que es lo que define el tamaño del cohete',
        ],
        warn: [
          'La velocidad de escape supone un impulso único desde la superficie y sin atmósfera: ningún cohete real funciona así, aceleran de a poco durante minutos',
          'No depende de la masa del objeto que escapa: una pelota y una nave necesitan la misma velocidad, aunque no la misma energía',
          'La atmósfera cambia todo: en la Tierra, un objeto lanzado a 11,2 km/s desde el suelo se desintegraría por el rozamiento',
          'Escapar del planeta no es escapar del sistema solar: para salir de la influencia del Sol desde la órbita terrestre hacen falta 42,1 km/s adicionales',
        ],
        plazo:
          'la velocidad de escape de un agujero negro supera la de la luz: esa es literalmente su definición, y el horizonte de eventos es donde eso ocurre.',
      },
      {
        id: 'orbita',
        label: 'Velocidad orbital y período de un satélite',
        hint: 'v = √(GM/r), y de ahí el período',
        answer:
          'v = √(GM/r) y T = 2πr/v. La Estación Espacial, a 400 km, va a 7,67 km/s y da una vuelta cada 92 minutos.',
        yes: [
          'La velocidad orbital necesaria a ese radio y el período de la órbita',
          'Cuántas vueltas completa por día, que es lo que determina cuántas veces pasa por arriba tuyo',
          'El radio de la órbita geoestacionaria del cuerpo, donde el período iguala a un día',
          'La gravedad que se siente a esa altura, que casi nunca es la que la gente supone',
        ],
        warn: [
          'El radio orbital se mide desde el CENTRO del cuerpo, no desde la superficie: para la Estación Espacial son 6.371 + 400 = 6.771 km',
          'A mayor altura, menor velocidad y mayor período: los satélites bajos son los rápidos, no al revés',
          'Por debajo de unos 200 km la atmósfera frena al satélite y la órbita decae en semanas o meses',
          'La órbita geoestacionaria sólo existe sobre el ecuador y a una altura única: 35.786 km sobre la superficie terrestre',
        ],
        plazo:
          'la Estación Espacial Internacional necesita un reboost cada pocos meses para compensar el rozamiento atmosférico residual.',
      },
      {
        id: 'distancias',
        label: 'Distancias estelares: parsec, año luz y paralaje',
        hint: '1 pc = 3,2616 años luz = 1/paralaje en segundos de arco',
        answer:
          'Un parsec son 3,2616 años luz. Y hay un atajo: la distancia en parsecs es simplemente uno dividido el paralaje medido en segundos de arco.',
        yes: [
          'La conversión entre parsecs, años luz, unidades astronómicas y kilómetros, en las dos direcciones',
          'La distancia a partir del paralaje medido, que es como se mide de verdad en astronomía',
          'Hace cuántos años salió la luz que estás viendo de ese objeto',
          'Comparaciones útiles: la estrella más cercana, el centro de la galaxia, la galaxia de Andrómeda',
        ],
        warn: [
          'Un año luz es una DISTANCIA, no un tiempo: es lo que la luz recorre en un año, unos 9,46 billones de kilómetros',
          'El año luz usa el año juliano de 365,25 días exactos, no el año calendario: por eso el valor es exacto y no aproximado',
          'El método del paralaje sólo funciona hasta unos pocos miles de parsecs: más lejos el ángulo es demasiado chico para medirlo',
          'Mirar lejos es mirar al pasado: la luz de Andrómeda que ves esta noche salió hace dos millones y medio de años',
        ],
        plazo:
          'la misión Gaia midió el paralaje de casi dos mil millones de estrellas, y por eso el catálogo de distancias de la Vía Láctea cambió por completo en la última década.',
      },
      {
        id: 'viaje',
        label: 'Tiempo de un viaje interestelar',
        hint: 'A qué fracción de c irías y cuánto tardarías',
        answer:
          'A 20 km/s —la velocidad de una sonda actual— llegar a Próxima Centauri, a 4,24 años luz, llevaría unos 63.000 años.',
        yes: [
          'El tiempo de viaje en años, siglos o milenios, según la escala del resultado',
          'La fracción de la velocidad de la luz a la que estarías yendo',
          'La dilatación temporal relativista: cuánto tiempo pasaría para los tripulantes frente a la Tierra',
          'La comparación con la escala humana: si entra en una vida, si haría falta una nave generacional o si supera a la civilización entera',
        ],
        warn: [
          'El cálculo es a velocidad constante: no incluye el tiempo de aceleración ni de frenado, que a fracciones altas de c es la mayor parte del viaje',
          'La dilatación temporal sólo se nota por encima del 10% de la velocidad de la luz: a las velocidades de las sondas actuales es del orden de una parte en mil millones',
          'Ningún objeto con masa puede alcanzar la velocidad de la luz: la energía necesaria tiende a infinito al acercarse',
          'La sonda más rápida jamás lanzada, la Parker Solar Probe, alcanzó 191 km/s, y eso es apenas el 0,064% de c',
        ],
        plazo:
          'las Voyager, lanzadas en 1977, todavía no recorrieron ni la milésima parte de la distancia a la estrella más cercana.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu caso',
  inputsIntro:
    'Sólo hacen falta los campos de la rama que elegiste arriba. El selector de cuerpo carga automáticamente la masa y el radio reales; si querés un cuerpo que no está en la lista, elegí "Personalizado" y escribilos a mano.',
  fields: [
    {
      id: 'pesoTierra',
      label: 'Tu peso en la Tierra',
      type: 'number',
      suffix: 'kg',
      value: 70,
      min: 0,
      step: 0.1,
      help: 'En rigor esto es tu masa: es lo mismo en todo el universo. Lo que cambia de planeta en planeta es el peso.',
    },
    {
      id: 'cuerpo',
      label: 'Cuerpo celeste',
      type: 'select',
      value: 'tierra',
      options: [
        { value: 'mercurio', label: 'Mercurio' },
        { value: 'venus', label: 'Venus' },
        { value: 'tierra', label: 'Tierra' },
        { value: 'luna', label: 'Luna' },
        { value: 'marte', label: 'Marte' },
        { value: 'jupiter', label: 'Júpiter' },
        { value: 'saturno', label: 'Saturno' },
        { value: 'urano', label: 'Urano' },
        { value: 'neptuno', label: 'Neptuno' },
        { value: 'pluton', label: 'Plutón' },
        { value: 'sol', label: 'Sol' },
        { value: 'personalizado', label: 'Personalizado (cargo masa y radio a mano)' },
      ],
      help: 'Carga la masa y el radio reales del NASA Planetary Fact Sheet.',
    },
    {
      id: 'masaCuerpo',
      label: 'Masa del cuerpo (si elegiste personalizado)',
      type: 'number',
      suffix: 'kg',
      value: 5.9722e24,
      min: 0,
      step: 1e20,
      help: 'Tierra 5,9722 × 10²⁴ · Luna 7,346 × 10²² · Sol 1,9885 × 10³⁰.',
    },
    {
      id: 'radioCuerpo',
      label: 'Radio del cuerpo (si elegiste personalizado)',
      type: 'number',
      suffix: 'm',
      value: 6371000,
      min: 0,
      step: 1000,
      help: 'Tierra 6.371.000 m · Luna 1.737.400 m · Marte 3.389.500 m.',
    },
    {
      id: 'altitudOrbita',
      label: 'Órbita — altura sobre la superficie',
      type: 'number',
      suffix: 'km',
      value: 400,
      min: 0,
      step: 1,
      help: 'Estación Espacial 400 km · Starlink 550 km · GPS 20.200 km · geoestacionaria 35.786 km.',
    },
    {
      id: 'modoDistancia',
      label: 'Distancias — qué dato tenés',
      type: 'select',
      value: 'anosluz',
      options: [
        { value: 'anosluz', label: 'Años luz' },
        { value: 'parsec', label: 'Parsecs' },
        { value: 'paralaje', label: 'Paralaje medido, en segundos de arco' },
        { value: 'ua', label: 'Unidades astronómicas' },
      ],
    },
    {
      id: 'distancia',
      label: 'Distancias — valor',
      type: 'number',
      value: 4.2465,
      min: 0,
      step: 0.000001,
      help: 'Próxima Centauri 4,2465 años luz · Sirio 8,6 · centro de la galaxia 26.000 · Andrómeda 2.500.000.',
    },
    {
      id: 'distanciaViaje',
      label: 'Viaje — distancia al destino',
      type: 'number',
      suffix: 'años luz',
      value: 4.2465,
      min: 0,
      step: 0.0001,
    },
    {
      id: 'velocidadViaje',
      label: 'Viaje — velocidad de crucero',
      type: 'number',
      suffix: 'km/s',
      value: 20,
      min: 0,
      step: 0.001,
      help: 'Voyager 1: 17 · Parker Solar Probe: 191 · 10% de la luz: 29.979 · velocidad de la luz: 299.792,458.',
    },
  ],
  fineprint:
    'Las masas, radios y gravedades superficiales son los del NASA Planetary Fact Sheet; en los planetas gaseosos la "superficie" se define en el nivel de 1 bar de presión. Los cálculos de escape y de órbita son newtonianos y suponen un cuerpo esférico sin atmósfera ni perturbaciones de otros cuerpos: la mecánica orbital real incluye correcciones considerables. El tiempo de viaje interestelar se calcula a velocidad constante, sin contar aceleración ni frenado. Nada de esto es planificación de misión.',

  chart: {
    type: 'scale',
    title: 'Dónde cae esa gravedad en la escala del sistema solar',
    caption:
      'La regla va de 0,01 a 30 m/s² en escala logarítmica y contiene todo el sistema solar: los asteroides casi sin gravedad, Plutón, la Luna, Marte, la Tierra, Júpiter y el Sol. Tu resultado queda marcado sobre esa regla, así se ve de un vistazo si el cuerpo es un mundo donde podrías caminar o uno del que saltarías al espacio.',
    bands: [
      { label: '0,01 a 0,1 m/s² — asteroides y lunas chicas: un salto te pone en órbita', from: 0.01, to: 0.1, tone: 'bad' },
      { label: '0,1 a 1 m/s² — Plutón (0,62), lunas medianas', from: 0.1, to: 1, tone: 'warn' },
      { label: '1 a 4 m/s² — la Luna (1,62), Mercurio y Marte (3,7)', from: 1, to: 4, tone: 'warn' },
      { label: '4 a 12 m/s² — Venus (8,87), Tierra (9,81), Saturno y Urano', from: 4, to: 12, tone: 'good' },
      { label: '12 a 30 m/s² — Júpiter (24,79): un cuerpo humano pesaría 2,5 veces más', from: 12, to: 30, tone: 'bad' },
    ],
  },
  breakdownTitle: 'El desglose completo del cálculo',
  breakdownIntro:
    'Cada fila trae su propia unidad: hay kilos, metros por segundo al cuadrado, kilómetros por segundo, minutos, años luz y años. Las barras comparan el número de cada fila entre sí, así que una distancia en kilómetros siempre va a aplastar a todo lo demás: mirá el valor, no la barra.',

  faq: [
    {
      q: '¿Cuánto pesaría en la Luna, en Marte y en Júpiter?',
      a: 'La regla es directa: multiplicá tu peso por la gravedad relativa del cuerpo. En la Luna es 0,165, así que una persona de 70 kg marcaría 11,6 kg en la balanza; en Marte es 0,379, o sea 26,5 kg; en Júpiter es 2,53, o sea 177 kg. Lo importante es que tu MASA no cambia en ninguno de los tres lados: seguís teniendo los mismos 70 kg de materia. Lo que cambia es la fuerza con la que ese cuerpo tira de vos.',
    },
    {
      q: '¿Cuál es la diferencia entre masa y peso?',
      a: 'La masa es la cantidad de materia y se mide en kilogramos: es una propiedad del objeto y no cambia nunca. El peso es la fuerza con la que la gravedad tira de esa masa, se mide en newtons y depende de dónde estés: 1 kg pesa 9,81 N en la Tierra, 1,62 N en la Luna y 24,79 N en Júpiter. En el uso cotidiano decimos "peso 70 kilos", que técnicamente es la masa; la balanza en realidad mide fuerza y la traduce a kilos suponiendo la gravedad terrestre.',
    },
    {
      q: '¿Cómo se calcula la velocidad de escape?',
      a: 'Con ve = √(2GM/R), donde G es la constante gravitatoria (6,67430 × 10⁻¹¹), M la masa del cuerpo y R su radio. Para la Tierra da 11,19 km/s, unos 40.270 km/h; para la Luna, 2,38 km/s, y ahí está la explicación de por qué el módulo lunar del Apolo podía despegar con un motor tan chico comparado con el Saturno V. Un dato que sorprende: la velocidad de escape no depende de la masa del objeto que escapa.',
    },
    {
      q: '¿Por qué los astronautas flotan si en órbita todavía hay gravedad?',
      a: 'Porque están en caída libre permanente. A 400 km de altura la gravedad terrestre sigue siendo el 89% de la de la superficie: lo que pasa es que la Estación Espacial se mueve tan rápido de costado —7,67 km/s— que mientras cae hacia la Tierra, la Tierra se curva por debajo a la misma tasa. La nave y todo lo que hay adentro caen juntos, y esa caída compartida es lo que se siente como ingravidez. El nombre correcto es microgravedad, no ausencia de gravedad.',
    },
    {
      q: '¿A qué velocidad tiene que ir un satélite para no caerse?',
      a: 'A v = √(GM/r), con r medido desde el CENTRO del planeta. Para una órbita baja terrestre a 400 km de altura, r = 6.771 km y la velocidad es 7,67 km/s, con un período de 92 minutos: la Estación Espacial da unas 15,5 vueltas por día. Y hay una intuición que se invierte: cuanto más alto está el satélite, MÁS LENTO va y más tarda. Los satélites geoestacionarios, a 35.786 km de altura, van a apenas 3,07 km/s.',
    },
    {
      q: '¿Qué es la órbita geoestacionaria y por qué está a esa altura exacta?',
      a: 'Es la órbita en la que el período coincide con el día sidéreo, de 23 h 56 min, así que el satélite parece quedarse quieto sobre el mismo punto del ecuador. Esa condición se cumple a un único radio: 42.164 km desde el centro de la Tierra, o sea 35.786 km sobre la superficie. Es donde están los satélites de televisión y de comunicaciones, y por eso las antenas parabólicas se instalan una vez y no se mueven nunca más.',
    },
    {
      q: '¿Cuánto es un año luz en kilómetros?',
      a: 'Exactamente 9.460.730.472.580,8 kilómetros, o sea unos 9,46 billones. El valor es exacto y no aproximado porque las dos piezas lo son: la velocidad de la luz vale 299.792.458 m/s por definición desde 1983, y el año luz se define usando el año juliano de 365,25 días exactos. Un año luz es una DISTANCIA, no un tiempo, y esa confusión es la más frecuente de toda la astronomía divulgativa.',
    },
    {
      q: '¿Qué es un parsec y cuánto mide?',
      a: 'Es la distancia a la que una estrella muestra un paralaje de un segundo de arco, y equivale a 3,2616 años luz, unos 30,857 billones de kilómetros. El nombre viene de "paralaje de un segundo". Su utilidad práctica es un atajo hermoso: la distancia en parsecs es simplemente 1 dividido el paralaje medido en segundos de arco. Si una estrella tiene un paralaje de 0,5 segundos, está a 2 parsecs. Por eso los astrónomos profesionales trabajan en parsecs y no en años luz.',
    },
    {
      q: '¿Cómo se mide la distancia a una estrella?',
      a: 'Con paralaje: se fotografía la estrella con seis meses de diferencia, cuando la Tierra está en dos puntos opuestos de su órbita, y se mide cuánto se corrió contra el fondo de estrellas lejanas. Ese ángulo minúsculo da la distancia por trigonometría directa. El método funciona hasta unos pocos miles de parsecs; más lejos el ángulo es tan chico que hay que usar otros métodos, como las cefeidas variables o las supernovas de tipo Ia.',
    },
    {
      q: '¿Cuánto tardaríamos en llegar a la estrella más cercana?',
      a: 'Próxima Centauri está a 4,2465 años luz. A la velocidad de la Voyager 1, unos 17 km/s, el viaje llevaría unos 75.000 años. Con la Parker Solar Probe, la sonda más rápida jamás construida (191 km/s en su perihelio), bajaría a unos 6.700 años, que sigue siendo más que toda la historia escrita. Para hacerlo en una vida humana habría que viajar al 10% de la velocidad de la luz, unos 30.000 km/s: seiscientas veces más rápido que cualquier cosa que hayamos lanzado.',
    },
    {
      q: '¿Cómo funciona la dilatación temporal en un viaje espacial?',
      a: 'A velocidades cercanas a la de la luz, el tiempo pasa más lento para el que viaja. El factor es √(1 − v²/c²): al 50% de c, por cada año en la nave pasan 1,15 en la Tierra; al 90%, 2,29; al 99,9%, 22,4. La diferencia es que a las velocidades de las sondas actuales el efecto es del orden de una parte en mil millones, o sea nada. La dilatación sólo se vuelve una herramienta de viaje si primero resolvés cómo llegar a una fracción alta de c, que es el problema difícil.',
    },
    {
      q: '¿Por qué no se puede alcanzar la velocidad de la luz?',
      a: 'Porque la energía cinética que hace falta crece sin límite al acercarse a c: la fórmula relativista tiene un factor que tiende a infinito. Llevar un solo kilogramo al 99% de la velocidad de la luz requiere unas seis veces la energía que liberaría convertir ese kilogramo entero en energía pura. Sólo las partículas sin masa —los fotones— viajan a c, y lo hacen siempre, porque no tienen otra opción.',
    },
  ],

  sources: [
    {
      name: 'NASA Planetary Fact Sheet — masas, radios, gravedad superficial y velocidad de escape de todos los cuerpos',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
      publisher: 'NASA Goddard Space Flight Center',
    },
    {
      name: 'IAU Resolution B2 (2015) — definición del parsec y de la unidad astronómica',
      url: 'https://www.iau.org/administration/resolutions/',
      publisher: 'International Astronomical Union',
    },
    {
      name: 'CODATA Internationally Recommended Values of the Fundamental Physical Constants — constante gravitatoria G',
      url: 'https://physics.nist.gov/cuu/Constants/',
      publisher: 'NIST / CODATA',
    },
    {
      name: 'El Sistema Internacional de Unidades (SI), 9.ª edición — velocidad de la luz exacta y unidades aceptadas',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
    },
    {
      name: 'Gaia Data Release — catálogo de paralajes y distancias estelares',
      url: 'https://www.cosmos.esa.int/web/gaia/data-release-3',
      publisher: 'Agencia Espacial Europea (ESA)',
    },
  ],

  replaces: [
    '/calculadora-peso-en-otro-planeta',
    '/calculadora-velocidad-escape-planeta',
    '/calculadora-velocidad-orbital-satelite',
    '/calculadora-distancia-estrella-parsec',
    '/calculadora-tiempo-viaje-interestelar',
    '/calculadora-edad-sol-vida-restante',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Constantes exactas y de referencia (CODATA / IAU / BIPM). */
export const CONST = {
  /** Constante gravitatoria, CODATA 2022. Las calcs viejas usaban 6,674e-11. */
  G: 6.6743e-11,
  /** Velocidad de la luz en el vacío, exacta por definición. */
  C: 299792458,
  /** Año juliano en segundos: 365,25 días exactos. */
  ANIO_JULIANO_S: 365.25 * 86400,
  /** Año luz en metros. EXACTO: c × año juliano. */
  LY_M: 299792458 * 365.25 * 86400,
  /** Unidad astronómica en metros. Exacta, IAU 2012. */
  UA_M: 149597870700,
  /** Parsec en metros. Exacto por la definición IAU 2015: UA × 648000/π. */
  PC_M: (149597870700 * 648000) / Math.PI,
  /** Gravedad estándar terrestre, exacta. */
  G0: 9.80665,
  /** Día sidéreo terrestre, en segundos. */
  DIA_SIDEREO: 86164.0905,
};

/**
 * Cuerpos del sistema solar. Masas en kg y radios ecuatoriales en metros del
 * NASA Planetary Fact Sheet. En los gigantes gaseosos el radio es el del nivel
 * de 1 bar, que es donde se define su "superficie".
 *
 * `g` es la gravedad superficial EFECTIVA que publica la NASA, que ya descuenta
 * la aceleración centrífuga de la rotación y el achatamiento. No coincide con
 * GM/R² —en Júpiter la diferencia llega al 4,5%— y por eso va tabulada aparte:
 * la rama de "cuánto pesaría" usa esta, y las de escape y órbita usan GM/R²,
 * que es la que corresponde a esos cálculos.
 */
export const CUERPOS = {
  mercurio: { nombre: 'Mercurio', masa: 3.3011e23, radio: 2439700, g: 3.7, dia: 15201360 },
  venus: { nombre: 'Venus', masa: 4.8675e24, radio: 6051800, g: 8.87, dia: 20996798 },
  tierra: { nombre: 'Tierra', masa: 5.9722e24, radio: 6371000, g: 9.807, dia: 86164.0905 },
  luna: { nombre: 'Luna', masa: 7.346e22, radio: 1737400, g: 1.62, dia: 2360591 },
  marte: { nombre: 'Marte', masa: 6.4171e23, radio: 3389500, g: 3.71, dia: 88642.66 },
  jupiter: { nombre: 'Júpiter', masa: 1.8982e27, radio: 69911000, g: 24.79, dia: 35730 },
  saturno: { nombre: 'Saturno', masa: 5.6834e26, radio: 58232000, g: 10.44, dia: 38362 },
  urano: { nombre: 'Urano', masa: 8.681e25, radio: 25362000, g: 8.87, dia: 62064 },
  neptuno: { nombre: 'Neptuno', masa: 1.02409e26, radio: 24622000, g: 11.15, dia: 57996 },
  pluton: { nombre: 'Plutón', masa: 1.303e22, radio: 1188300, g: 0.62, dia: 551856 },
  sol: { nombre: 'Sol', masa: 1.9885e30, radio: 695700000, g: 274, dia: 2164320 },
};

/** Referencias de gravedad superficial para la regla comparativa. */
export const SCALE = {
  minG: 0.01,
  maxG: 30,
  refs: [
    { g: 0.62, label: 'Plutón' },
    { g: 1.62, label: 'la Luna' },
    { g: 3.7, label: 'Mercurio y Marte' },
    { g: 8.87, label: 'Venus' },
    { g: 9.81, label: 'la Tierra' },
    { g: 11.15, label: 'Neptuno' },
    { g: 24.79, label: 'Júpiter' },
    { g: 274, label: 'el Sol' },
  ],
};

/** Distancias astronómicas de referencia, en años luz. */
export const HITOS_LY = [
  { ly: 0.0000158, label: 'la distancia de la Tierra al Sol' },
  { ly: 4.2465, label: 'Próxima Centauri, la estrella más cercana' },
  { ly: 8.6, label: 'Sirio, la estrella más brillante del cielo' },
  { ly: 642, label: 'Betelgeuse' },
  { ly: 26000, label: 'el centro de la Vía Láctea' },
  { ly: 2537000, label: 'la galaxia de Andrómeda' },
];
