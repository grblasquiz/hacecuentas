import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué va a salir nítido y cuánto entra en el cuadro?"
 * Absorbe 4 calculadoras sueltas (ver `replaces`).
 *
 * HERMANOS, NO DUPLICADOS — el silo de fotografía queda partido en tres
 * preguntas que no comparten ni una URL:
 *   · /tecnologia/fotografia          → cuánto OCUPAN las fotos y a qué imprimen
 *   · /tecnologia/ajustes-de-camara   → cuánta LUZ entra (EV, ND, flash, focal eq.)
 *   · este hub                        → qué sale NÍTIDO y qué entra en el encuadre
 * Este hub es óptica geométrica (círculo de confusión, ángulo de visión); el de
 * ajustes es fotometría. Se cruzan en un solo número, la focal equivalente, que
 * acá se usa como insumo del cálculo y allá es el resultado.
 *
 * NOTAS DE CONTRATO:
 *  - ACÁ NO HAY PLATA. El default de `format` es 'ars' y el runtime hace
 *    Object.assign(base, over), así que una fila sin `format` propio saldría en
 *    pesos. Todas las filas declaran 'unit' (m, mm, °, s, ×, mm/m, ") o 'plain'.
 *  - `chart.type: 'scale'`: las cuatro ramas preguntan lo mismo —dónde caigo yo
 *    en un rango con franjas—, así que compute() devuelve SIEMPRE `position`
 *    (0-100) y `positionLabel`, y las franjas viajan con `from`/`to`. Cada rama
 *    trae su propia escala porque la magnitud cambia (m, m, °, s).
 *
 * MATEMÁTICA (óptica geométrica clásica, sin tablas redondeadas):
 *   Círculo de confusión   c = diagonal_del_sensor / 1500
 *   Hiperfocal             H = f²/(N·c) + f
 *   Límite cercano         Dn = s·(H−f) / (s + H − 2f)
 *   Límite lejano          Df = s·(H−f) / (H − s)     → ∞ cuando s ≥ H
 *   Profundidad de campo   DoF = Df − Dn
 *   Ángulo de visión       AOV = 2·atan(lado / (2·f))
 *   Ancho capturado        W = 2·d·tan(AOV_h/2) = d·ancho_sensor/f
 *   Factor de recorte      crop = 43,267 / diagonal_del_sensor
 *   Regla 600 / 500        t_max = 600 (o 500) / focal equivalente
 *   Arrastre de estrellas  θ = 15,041 ″/s · t · cos(declinación)
 *
 * DIFERENCIAS CONTRA LAS FÓRMULAS VIEJAS (verificadas con npx tsx):
 *  1. 🔴 EL ÍNDICE DE SENSOR SIGNIFICABA COSAS DISTINTAS EN CADA CALC. Con el
 *     mismo `sensor = 3` del formulario, `distancia-hiperfocal-lente` y
 *     `profundidad-campo-dof-lente` entendían Micro 4/3 (c = 0,015), mientras
 *     `ancho-angulo-lente-distancia` entendía APS-C Canon (22,2 × 14,8 mm) y
 *     `regla-600-estrellas` entendía APS-C Canon otra vez (crop 1,6). Tres
 *     calcs hermanas, tres diccionarios distintos para la misma opción. Acá el
 *     sensor es UNO solo y de él salen a la vez la diagonal, el crop y el c.
 *  2. El c ya no es una tabla de tres valores: se calcula como diagonal/1500,
 *     que es el criterio del que salieron esos 0,030 / 0,020 / 0,015. Los
 *     números quedan casi iguales (full frame 0,0288 contra 0,030) y ahora hay
 *     un valor coherente para cualquier sensor, incluido el de 1".
 *  3. `distancia-hiperfocal-lente` devolvía H = f²/(N·c), que es la hiperfocal
 *     menos la focal. La expresión completa lleva "+ f". La diferencia son
 *     milímetros sobre metros —irrelevante en la práctica— pero los límites
 *     cercano y lejano ya usaban internamente la versión completa, así que el
 *     número que mostraba no era el mismo que el que usaba.
 *  4. `profundidad-campo-dof-lente` mostraba "dofCerca" y "dofLejos" como la
 *     distancia DESDE el sujeto hasta cada límite, sin decir nunca a qué
 *     distancia absoluta estaban esos límites. Acá van las cuatro cifras: los
 *     dos límites absolutos y los dos márgenes.
 *  5. `regla-600-estrellas` usaba crop factors nominales (1,5 / 1,6 / 2,0) y
 *     acá sale de la diagonal real del sensor, así que un APS-C de 23,5 × 15,6
 *     da 1,53 y no 1,50 exacto: el tiempo máximo baja alrededor de un 2%.
 */
export const hub: HubData = {
  slug: 'tecnologia/nitidez-y-encuadre',
  title: '¿Qué sale nítido y cuánto entra en el cuadro? — Profundidad de campo, hiperfocal y ángulo de visión',
  description:
    'Calculá la profundidad de campo real de tu lente, la distancia hiperfocal para que el paisaje quede nítido hasta el infinito, cuántos metros de ancho entran a determinada distancia y cuántos segundos podés exponer estrellas sin que se arrastren.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Guía y calculadoras de óptica fotográfica',
  h1: '¿Qué va a salir nítido y cuánto entra en el cuadro?',
  lede:
    'La nitidez y el encuadre no dependen de la luz: dependen de la geometría de tu lente y del tamaño de tu sensor. Cargá la focal, el diafragma y la distancia una sola vez y salen la zona enfocada, el punto donde enfocar para llegar al infinito, los metros que entran en el cuadro y el tiempo máximo de exposición antes de que las estrellas se conviertan en rayitas.',
  stamps: [
    'Óptica geométrica exacta, sin tablas redondeadas',
    'Círculo de confusión = diagonal del sensor ÷ 1500',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Tu zona nítida',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Las cuatro preguntas usan los mismos cuatro datos de arriba. Elegí la tuya y el resultado cambia sin volver a cargar nada.',
    items: [
      {
        id: 'dof',
        label: 'Cuánto va a quedar enfocado a esta distancia',
        hint: 'La pregunta del retrato y de la macro: ¿me alcanza el margen de foco?',
        answer:
          'La profundidad de campo es la distancia entre el límite cercano y el lejano donde el desenfoque todavía cae dentro del círculo de confusión: Dn = s(H−f)/(s+H−2f) y Df = s(H−f)/(H−s).',
        yes: [
          'La focal real de la lente, no la equivalente: la geometría la hace el vidrio',
          'El diafragma efectivo, que es el que decide el diámetro del cono de luz',
          'La distancia al sujeto medida desde el plano del sensor, no desde el frente de la lente',
          'El círculo de confusión de tu sensor, sacado de su diagonal dividida 1500',
          'Los dos límites en distancia absoluta y los dos márgenes hacia adelante y hacia atrás',
        ],
        warn: [
          'La profundidad de campo NO se reparte mitad y mitad: cerca del sujeto es aproximadamente un tercio adelante y dos tercios atrás, y la proporción se desbalancea más cuanto más te acercás a la hiperfocal',
          'El círculo de confusión asume una copia de 20 × 25 cm mirada a 25 cm. Si vas a mirar la foto al 100% en pantalla, el margen real es bastante menor que el que sale acá',
          'Si el diafragma que elegís es más cerrado que f/11 en APS-C o f/16 en full frame, la difracción empieza a comerse la nitidez que ganás por profundidad',
          'En macro extremo estas fórmulas pierden precisión: no contemplan el factor de ampliación ni la extensión del fuelle',
        ],
        plazo:
          'si el margen te da menos de 2 cm, no confíes en el autofoco de un solo punto: usá foco manual con ampliación, o hacé focus stacking.',
      },
      {
        id: 'hiperfocal',
        label: 'Dónde enfoco para que el paisaje llegue al infinito',
        hint: 'El truco del paisajista: un solo punto de foco y todo nítido de acá al horizonte.',
        answer:
          'La hiperfocal es H = f²/(N·c) + f. Enfocando exactamente ahí, la nitidez va desde la mitad de esa distancia hasta el infinito.',
        yes: [
          'La distancia exacta donde tenés que poner el foco',
          'El límite cercano, que es siempre la mitad de la hiperfocal',
          'Cuánto perdés si enfocás directamente al infinito en vez de a la hiperfocal',
          'La hiperfocal con el diafragma un paso más abierto y un paso más cerrado, para comparar',
        ],
        warn: [
          'Enfocar "al infinito" y enfocar a la hiperfocal NO es lo mismo: enfocando al infinito el límite cercano se te va al doble de distancia y perdés todo el primer plano',
          'El tope de la escala de la lente muchas veces pasa el infinito real (está pensado para el infrarrojo y para la dilatación térmica): si girás hasta el tope, el infinito puede quedar desenfocado',
          'La hiperfocal es un compromiso: el infinito queda "aceptablemente" nítido, no perfectamente nítido. Si la estrella o la montaña lejana es el sujeto, enfocá ahí y sacrificá el primer plano',
          'Con teleobjetivos la hiperfocal se va a cientos de metros y deja de ser una técnica útil',
        ],
        plazo:
          'en la práctica se enfoca a un tercio del encuadre y se cierra un paso más de lo que dice la cuenta: compensa el error de estimar la distancia a ojo.',
      },
      {
        id: 'encuadre',
        label: 'Cuántos metros entran en el cuadro a esta distancia',
        hint: 'Para foto de grupo, producto o video: ¿entra todo o tengo que retroceder?',
        answer:
          'El ángulo horizontal es AOV = 2·atan(ancho_del_sensor / 2f) y el ancho capturado a distancia d es simplemente d × ancho_del_sensor / f.',
        yes: [
          'El ancho y el alto en metros que cubre el encuadre a esa distancia',
          'Los tres ángulos de visión: horizontal, vertical y diagonal',
          'La distancia mínima a la que tenés que pararte para que entre un ancho dado',
          'Qué tipo de lente es en la práctica: gran angular, normal o teleobjetivo',
        ],
        warn: [
          'La cuenta asume enfoque a infinito. A distancias muy cortas el ángulo real se cierra un poco porque la lente se aleja del sensor al enfocar de cerca',
          'Casi todos los zoom pierden focal al enfocar de cerca (focus breathing): un 24-70 en el extremo largo puede comportarse como un 60 mm a distancia mínima',
          'El ángulo depende del lado del sensor que mirás: el diagonal siempre es el más grande y es el que suele publicar el fabricante en la ficha',
          'Si grabás video en un modo que recorta el sensor —4K con crop, estabilización electrónica—, el ángulo real es menor que el que sale acá',
        ],
        plazo:
          'para foto de grupo calculá el ancho que necesitás y sumale un 20%: siempre aparece alguien al costado y siempre conviene tener margen para recortar.',
      },
      {
        id: 'estrellas',
        label: 'Cuántos segundos puedo exponer estrellas sin que se arrastren',
        hint: 'Vía Láctea a pulmón, sin tracker: el límite lo pone la rotación de la Tierra.',
        answer:
          'La regla 600 divide 600 por la focal equivalente en full frame. La regla 500 es la versión estricta y es la que conviene si vas a imprimir o mirar al 100%.',
        yes: [
          'El tiempo máximo por la regla 600 y por la regla 500',
          'La focal equivalente en full frame, que es la que manda acá',
          'Cuánto se mueve la estrella en el cielo durante esa exposición, en segundos de arco',
          'Cuánto ganás si apuntás cerca de la estrella polar en vez de al ecuador celeste',
        ],
        warn: [
          'Las reglas 600 y 500 nacieron con película y con sensores de 12 MP. En un sensor de 45 MP mirado al 100% las estrellas ya se ven ovaladas con la regla 500: la regla NPF, que también tiene en cuenta el tamaño del píxel y el diafragma, da tiempos bastante más cortos',
          'El arrastre depende de a dónde apuntes: en el ecuador celeste —Orión, la zona central de la Vía Láctea— es máximo, y cerca de la Polar es casi nulo',
          'Estos segundos son el límite de NITIDEZ, no el de exposición: si con ese tiempo la foto queda oscura, la salida es abrir el diafragma, subir el ISO o apilar varias tomas, nunca alargar más',
          'Una montura ecuatorial motorizada rompe el límite por completo, pero entonces el que se mueve es el primer plano terrestre',
        ],
        plazo:
          'sacá una prueba con el tiempo que da la cuenta, ampliá al 100% en la pantalla de la cámara y mirá una estrella del borde: si ya es un óvalo, bajá al tiempo de la regla 500.',
      },
    ],
  },

  inputsTitle: 'Tu lente y tu cámara',
  inputsIntro:
    'Cargá la focal real que está grabada en el barrilete —no la equivalente—, el diafragma, la distancia al sujeto y el sensor de tu cámara. Las cuatro preguntas se resuelven con estos mismos cuatro datos.',
  fields: [
    {
      id: 'focal',
      label: 'Distancia focal de la lente',
      type: 'number',
      value: 50,
      suffix: 'mm',
      min: 4,
      max: 1200,
      step: 1,
      help: 'La que dice la lente. Si es un zoom, la que estás usando en ese momento.',
    },
    {
      id: 'apertura',
      label: 'Diafragma',
      type: 'select',
      value: '2.8',
      options: [
        { value: '1.2', label: 'f/1,2 — máxima apertura' },
        { value: '1.4', label: 'f/1,4' },
        { value: '1.8', label: 'f/1,8' },
        { value: '2', label: 'f/2' },
        { value: '2.8', label: 'f/2,8' },
        { value: '4', label: 'f/4' },
        { value: '5.6', label: 'f/5,6' },
        { value: '8', label: 'f/8 — el punto dulce de casi toda lente' },
        { value: '11', label: 'f/11' },
        { value: '16', label: 'f/16' },
        { value: '22', label: 'f/22 — ojo con la difracción' },
      ],
    },
    {
      id: 'distancia',
      label: 'Distancia al sujeto',
      type: 'number',
      value: 3,
      suffix: 'metros',
      min: 0.1,
      max: 2000,
      step: 0.1,
      help: 'Medida desde el sensor. Sólo la usan las ramas de profundidad de campo y de encuadre.',
    },
    {
      id: 'sensor',
      label: 'Sensor de tu cámara',
      type: 'select',
      value: 'ff',
      options: [
        { value: 'ff', label: 'Full frame — 36 × 24 mm' },
        { value: 'apsc15', label: 'APS-C Sony / Nikon / Fuji — 23,5 × 15,6 mm' },
        { value: 'apsc16', label: 'APS-C Canon — 22,3 × 14,9 mm' },
        { value: 'mft', label: 'Micro 4/3 — 17,3 × 13 mm' },
        { value: 'p1', label: '1 pulgada — 13,2 × 8,8 mm' },
        { value: 'mf', label: 'Medio formato 44 × 33 mm' },
      ],
      help: 'De acá salen a la vez la diagonal, el factor de recorte y el círculo de confusión.',
    },
  ],
  fineprint:
    'Óptica geométrica: el círculo de confusión se toma como la diagonal del sensor dividida 1500, el criterio clásico para una copia de 20 × 25 cm mirada a 25 cm. Si vas a mirar la foto al 100% en pantalla, tu margen real de nitidez es menor que el que sale acá. Las cuentas asumen enfoque a infinito para el ángulo de visión y no contemplan focus breathing ni difracción.',

  chart: {
    type: 'scale',
    title: 'Dónde caés vos',
    caption:
      'La barra ubica tu resultado dentro del rango típico de la pregunta que elegiste: metros de profundidad de campo, metros de hiperfocal, grados de ángulo de visión o segundos de exposición. Las franjas de color marcan las zonas de decisión, no una nota.',
  },
  breakdownTitle: 'El detalle de la cuenta',
  breakdownIntro:
    'Cada fila trae su unidad propia: hay metros, milímetros, grados, segundos y segundos de arco. Ningún número de esta página es plata.',

  faq: [
    {
      q: '¿Qué es exactamente la distancia hiperfocal?',
      a: 'Es la distancia de enfoque a partir de la cual todo lo que está desde la mitad de esa distancia hasta el infinito entra dentro del margen aceptable de nitidez. La fórmula es H = f²/(N·c) + f, donde f es la focal, N el número f del diafragma y c el círculo de confusión del sensor. Es el truco central de la fotografía de paisaje: en vez de enfocar a la montaña y perder el primer plano, enfocás a la hiperfocal y ganás las dos cosas de un saque.',
    },
    {
      q: '¿Por qué la profundidad de campo no se reparte mitad adelante y mitad atrás?',
      a: 'Porque el desenfoque no crece igual hacia los dos lados. Los límites salen de Dn = s(H−f)/(s+H−2f) y Df = s(H−f)/(H−s): el denominador del límite lejano se achica a medida que la distancia de enfoque se acerca a la hiperfocal y el límite se dispara hacia afuera, mientras que el cercano se mueve poco. A distancias cortas el reparto es aproximadamente un tercio adelante y dos tercios atrás, y a la distancia hiperfocal el límite lejano ya es el infinito, o sea infinitas veces más atrás que adelante. La regla del "un tercio, dos tercios" que circula es una aproximación que sólo vale para distancias medias.',
    },
    {
      q: '¿Qué es el círculo de confusión y por qué cambia con el sensor?',
      a: 'Un punto del mundo real nunca se proyecta como un punto perfecto sobre el sensor: se proyecta como un discocito. Mientras ese disco sea tan chico que el ojo no lo distingue de un punto, la foto se ve nítida. Ese diámetro límite es el círculo de confusión. Depende del sensor porque un sensor chico hay que ampliarlo más para llegar al mismo tamaño de copia, así que el mismo disco se ve más grande. El criterio estándar es diagonal del sensor dividida 1500: da 0,029 mm en full frame, 0,019 en APS-C y 0,014 en Micro 4/3.',
    },
    {
      q: '¿Un sensor más chico tiene más profundidad de campo?',
      a: 'A igual focal y diafragma, no: la geometría del cono de luz es idéntica, lo único que cambia es que el sensor chico recorta el encuadre. La diferencia aparece cuando comparás fotos con el MISMO encuadre, que es lo que uno hace en la práctica: para encuadrar igual con un sensor más chico usás una focal más corta, y una focal más corta da mucha más profundidad de campo. Por eso un celular tiene todo enfocado y una full frame con un 85 mm a f/1,4 aísla el sujeto. La regla es que la profundidad de campo equivalente escala con el factor de recorte: f/2,8 en Micro 4/3 se parece a f/5,6 en full frame.',
    },
    {
      q: '¿Hasta qué diafragma conviene cerrar para ganar nitidez?',
      a: 'Cerrar el diafragma amplía la profundidad de campo pero a partir de cierto punto la difracción degrada la nitidez de TODO el cuadro, incluido el plano enfocado. El límite práctico ronda f/16 en full frame, f/11 en APS-C y f/8 en Micro 4/3. La mayoría de las lentes tienen su punto de máxima nitidez entre f/5,6 y f/8. Si necesitás más profundidad de la que te da ese diafragma, la solución correcta no es cerrar más sino hacer focus stacking: varias tomas con el foco corrido y fusión en post.',
    },
    {
      q: '¿Cuánto entra en el cuadro a determinada distancia?',
      a: 'El ancho capturado sale de una regla de tres pura: ancho = distancia × ancho_del_sensor / focal. Con un 50 mm en full frame (36 mm de ancho) a 3 metros entran 2,16 metros de ancho. La misma cuenta al revés te dice a qué distancia pararte: distancia = ancho_necesario × focal / ancho_del_sensor. Es la cuenta que hay que hacer antes de una foto de grupo o de una toma de producto, no después de descubrir que no entra.',
    },
    {
      q: '¿Cuál es la diferencia entre ángulo horizontal, vertical y diagonal?',
      a: 'Son el mismo cálculo aplicado a los tres lados del rectángulo del sensor: AOV = 2·atan(lado/2f). El diagonal siempre da el número más grande y es el que suele figurar en la ficha del fabricante, así que una lente que "tiene 84 grados" en realidad cubre unos 74 grados horizontales en full frame. Para decidir si algo entra en el cuadro lo que importa es el horizontal si estás en apaisado y el vertical si estás en vertical.',
    },
    {
      q: '¿La regla 600 o la regla 500 para fotografiar estrellas?',
      a: 'Las dos dividen una constante por la focal equivalente en full frame y te dan los segundos máximos antes de que la rotación de la Tierra convierta las estrellas en rayitas. La 600 es permisiva y sirve para redes o para sensores de menos de 20 MP; la 500 es la conservadora y es la que conviene si vas a imprimir. Con sensores modernos de mucha resolución hasta la 500 se queda corta: ahí conviene la regla NPF, que además del tiempo tiene en cuenta el tamaño del píxel y el diafragma, y suele dar la mitad del tiempo que la 500.',
    },
    {
      q: '¿Por qué las estrellas se arrastran y cuánto exactamente?',
      a: 'Porque la Tierra rota. La velocidad angular es de 15,041 segundos de arco por segundo de tiempo en el ecuador celeste, y baja con el coseno de la declinación: apuntando cerca de la estrella polar el arrastre es casi cero y podés exponer varias veces más. Por eso una foto de 20 segundos apuntando a Orión sale con las estrellas ovaladas y la misma exposición apuntando al sur celeste sale limpia. Si el arrastre supera el tamaño de dos o tres píxeles, ya se nota al ampliar.',
    },
    {
      q: '¿Sirve enfocar directamente al infinito para el paisaje?',
      a: 'Sirve si el sujeto está lejos y no te importa el primer plano, pero desperdicia la mitad de la profundidad de campo disponible. Enfocando a la hiperfocal la nitidez arranca a la mitad de esa distancia; enfocando al infinito arranca recién en la hiperfocal entera, o sea al doble. Además, el tope de la escala de muchas lentes pasa el infinito real: si girás hasta que hace tope, el horizonte puede quedar desenfocado. Conviene enfocar con Live View ampliado sobre un punto lejano y de ahí no moverse.',
    },
    {
      q: '¿La focal equivalente cambia la profundidad de campo?',
      a: 'No la calcula: la profundidad de campo se calcula SIEMPRE con la focal real grabada en la lente y con el círculo de confusión del sensor. La focal equivalente sirve para comparar encuadres entre cámaras distintas y para dos reglas prácticas —la regla 1/focal para la velocidad a mano alzada y la regla 600 de las estrellas— pero no entra en las fórmulas de nitidez. Meter la equivalente en la cuenta de la hiperfocal es el error más común y sobreestima la profundidad de campo por bastante.',
    },
    {
      q: '¿Por qué mi foto se ve nítida en la cámara y borrosa en la compu?',
      a: 'Porque el círculo de confusión asume un tamaño de visualización concreto: una copia de 20 × 25 cm mirada a 25 cm de distancia. Mirar la foto al 100% en un monitor equivale a mirar una ampliación gigante, y ahí el margen aceptable se achica varias veces. Si trabajás pixel peeping, dividí por dos o por tres la profundidad de campo que te da cualquier calculadora, incluida esta, y cerrá un paso más de diafragma del que dice la cuenta.',
    },
  ],

  sources: [
    {
      name: 'Understanding Depth of Field in Photography',
      url: 'https://www.nikonusa.com/learn-and-explore/a/tips-and-techniques/understanding-depth-of-field-in-photography.html',
      publisher: 'Nikon',
    },
    {
      name: 'Angle of view — Canon Science Lab',
      url: 'https://global.canon/en/technology/s_labo/light/003/04.html',
      publisher: 'Canon',
    },
    {
      name: 'Digital camera circle of confusion criteria',
      url: 'https://www.dofmaster.com/digital_coc.html',
      publisher: 'DOFMaster',
    },
    {
      name: 'What is equivalence and why should I care?',
      url: 'https://www.dpreview.com/articles/8095816568/what-is-equivalence-and-why-should-i-care',
      publisher: 'DPReview',
    },
    {
      name: 'How to Photograph the Milky Way — la regla 500 y la regla NPF',
      url: 'https://www.bhphotovideo.com/explora/photography/tips-and-solutions/how-to-photograph-the-milky-way',
      publisher: 'B&H Explora',
    },
    {
      name: 'Useful constants — velocidad de rotación de la Tierra',
      url: 'https://hpiers.obspm.fr/eop-pc/models/constants.html',
      publisher: 'IERS / Observatoire de Paris',
    },
  ],

  replaces: [
    '/calculadora-profundidad-campo-dof-lente',
    '/calculadora-distancia-hiperfocal-lente',
    '/calculadora-ancho-angulo-lente-distancia',
    '/calculadora-regla-600-estrellas',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
};

/**
 * Sensores: dimensiones nominales del área de imagen, en milímetros.
 * De acá salen la diagonal, el factor de recorte (43,267 / diagonal) y el
 * círculo de confusión (diagonal / 1500). Un solo diccionario para las cuatro
 * ramas: las calcs viejas tenían uno distinto cada una.
 */
export const SENSORES: Record<string, { label: string; w: number; h: number }> = {
  ff: { label: 'Full frame', w: 36, h: 24 },
  apsc15: { label: 'APS-C', w: 23.5, h: 15.6 },
  apsc16: { label: 'APS-C Canon', w: 22.3, h: 14.9 },
  mft: { label: 'Micro 4/3', w: 17.3, h: 13 },
  p1: { label: '1 pulgada', w: 13.2, h: 8.8 },
  mf: { label: 'Medio formato', w: 44, h: 33 },
};

/** Diagonal del full frame, la referencia del factor de recorte. */
export const DIAG_FF = Math.sqrt(36 * 36 + 24 * 24);

/** Divisor del criterio clásico del círculo de confusión: c = diagonal / 1500. */
export const COC_DIVISOR = 1500;

/** Rotación de la Tierra en segundos de arco por segundo de tiempo sidéreo. */
export const ARCSEC_POR_SEGUNDO = 15.041;
