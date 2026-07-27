import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuál es la probabilidad?"
 *
 * Arquetipo RAMIFICADO: la pregunta es siempre la misma, pero el camino cambia
 * según qué sepa la persona. Cinco ramas:
 *   sorteo       tirar un dado, una moneda o sacar números al azar (uniforme)
 *   evento       casos favorables sobre posibles, y "al menos una vez" en N intentos
 *   combinatoria de cuántas formas se puede elegir u ordenar (y de ahí la lotería)
 *   binomial     exactamente k éxitos en n ensayos
 *   normal       qué porción de la campana cae entre dos valores
 *
 * FOCO DELIBERADO: este hub es probabilidad, NO estadística inferencial.
 * Tamaño de muestra, intervalo de confianza, chi-cuadrado y correlación de
 * Pearson quedan FUERA y sin reclamar en `replaces`: son otra pregunta
 * ("¿cuánta gente tengo que encuestar?", "¿estas dos variables se relacionan?")
 * y merecen su propio hub de estadística.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format: 'unit'` o `'plain'` y CADA
 *    fila del desglose declara el suyo (%, intentos, formas, z, σ). Una fila sin
 *    `format` cae a "$" y la página miente.
 *  - La rama `sorteo` devuelve un resultado ALEATORIO: cada vez que se aprieta
 *    el botón sale otro número. Es lo esperado, no un bug de caché.
 *  - La combinatoria puede desbordar el entero seguro de JavaScript (2^53). El
 *    valor exacto va en `total` como string calculado con BigInt; las filas del
 *    desglose son números y por eso se marcan como aproximadas arriba de 2^53.
 */
export const hub: HubData = {
  slug: 'matematica/probabilidad',
  title: '¿Cuál es la probabilidad? Dados, sorteos, combinatoria, binomial y campana de Gauss',
  description:
    'Tirá un dado o sorteá números al azar, calculá la probabilidad de un evento y de que ocurra al menos una vez en N intentos, cuántas combinaciones o permutaciones hay, la probabilidad binomial de k éxitos y el área bajo la curva normal entre dos valores.',
  silo: 'Matemática',
  siloHref: '/matematica',

  eyebrow: 'Guía y cálculo de probabilidad',
  h1: '¿Cuál es la probabilidad?',
  lede:
    'La misma pregunta se resuelve de cinco maneras distintas según lo que tengas: un dado en la mano, casos favorables contra posibles, un conteo de combinaciones, una serie de ensayos repetidos o una campana de Gauss. Arrancamos por lo más buscado —tirar un dado o sortear un número— y lo cambiás si tu caso es otro.',
  stamps: [
    'Actualizado 27-07-2026',
    'Sorteo con probabilidad uniforme · combinatoria exacta',
    '9 calculadoras adentro',
  ],

  resultLabel: 'Tu resultado',

  cases: {
    title: '¿Qué querés calcular?',
    intro:
      'Partimos del caso más frecuente: sortear un número o tirar un dado. Si lo tuyo es una probabilidad, un conteo o una campana, cambialo.',
    items: [
      {
        id: 'sorteo',
        label: 'Tirar un dado o sortear números al azar',
        hint: 'El caso más común',
        answer:
          'Cada valor del rango tiene exactamente la misma chance: 1 entre la cantidad de valores posibles. En un dado de 6 caras, 16,67% por cara.',
        yes: [
          'Elegí el tipo de sorteo (dado de 6, 12 o 20 caras, moneda, o un rango a medida) y cuántos resultados querés de una vez',
          'El rango es inclusive: si pedís de 1 a 100, tanto el 1 como el 100 pueden salir',
          'Con "sin repetir" ningún valor sale dos veces, que es lo que querés para sortear ganadores de una rifa o un amigo invisible',
          'La probabilidad de cada valor individual es 1 dividido la cantidad de valores posibles del rango',
          'Cada tirada es independiente: el dado no se acuerda de lo que salió antes',
          'Apretá el botón de nuevo para volver a sortear — el resultado cambia cada vez',
        ],
        warn: [
          'Que un número no haya salido en mucho tiempo no lo hace más probable: eso es la falacia del jugador y es el error de razonamiento más caro que existe',
          'La aleatoriedad genera rachas: en 20 tiradas de moneda, ver cuatro caras seguidas es más habitual de lo que la intuición dice',
          'Este generador usa el azar del navegador, que alcanza de sobra para sorteos, juegos y clases, pero NO es criptográficamente seguro',
          'Para un sorteo con premio real conviene dejar registro del resultado en el momento: el número no queda guardado en ningún lado',
        ],
        plazo:
          'si el sorteo tiene que ser auditable, hacelo en vivo delante de los participantes y anotá el resultado ahí mismo.',
      },
      {
        id: 'evento',
        label: 'La probabilidad de que algo pase',
        hint: 'Y al menos una vez en N intentos',
        answer:
          'P = casos favorables ÷ casos posibles. Y la chance de que ocurra al menos una vez en N intentos es 1 − (1 − P)^N.',
        yes: [
          'Cargá los casos favorables y los posibles, o directamente la probabilidad por intento en porcentaje si ya la conocés (un drop rate, la chance de un ítem)',
          'La probabilidad de que NO ocurra nunca en N intentos es (1 − P) elevado a la N, y la de que ocurra al menos una vez es el complemento',
          'Se calcula también cuántos intentos necesitás para llegar al 50%, al 90% y al 99% de chance acumulada',
          'Ese "al menos una vez" es lo que se busca en farmeo de un ítem, en tiradas de gacha o en cualquier intento repetido con la misma chance',
          'Con una chance del 1% por intento, hacen falta 69 intentos para llegar apenas al 50%',
        ],
        warn: [
          'La fórmula de varios intentos vale SÓLO si cada intento es independiente y mantiene la misma probabilidad: si hay contador de piedad, botín garantizado o extracción sin reposición, no aplica',
          'Nunca se llega al 100%: por muchos intentos que hagas la curva se acerca pero no toca el techo',
          'La probabilidad acumulada no es una deuda que el sistema te tenga que pagar: cada intento nuevo arranca en la misma chance de siempre',
          'Ojo con confundir "1 en 200" con "200 intentos y sale": en 200 intentos a 1/200 la chance de al menos uno es 63%, no 100%',
        ],
        plazo:
          'antes de estimar cuánto vas a tardar, verificá si el sistema tiene piedad acumulada: cambia por completo el cálculo.',
      },
      {
        id: 'combinatoria',
        label: 'De cuántas formas se puede elegir u ordenar',
        hint: 'Combinaciones, permutaciones y lotería',
        answer:
          'Si el orden NO importa es una combinación C(n,r); si importa, una permutación P(n,r). La chance de acertar una lotería es 1 sobre esa cuenta.',
        yes: [
          'Combinación sin repetición: elegís r de n y el orden no cuenta — es el caso del quini y de cualquier lotería de bolillas',
          'Permutación sin repetición: elegís r de n y el orden sí cuenta — podios, contraseñas con dígitos distintos, órdenes de largada',
          'Combinación con repetición: podés repetir elementos y el orden no importa — sabores de helado, monedas para armar un monto',
          'Permutación con repetición: n opciones en r posiciones y podés repetir — es n elevado a la r, el caso de un PIN o una patente',
          'El factorial n! es la permutación de los n elementos completos: la cantidad de formas de ordenar todo el conjunto en fila',
          'Con el conteo total en la mano, la chance de acertar una jugada al azar es 1 dividido ese número',
        ],
        warn: [
          'La primera decisión es si el orden importa: es lo que separa una combinación de una permutación, y equivocarse cambia el resultado por un factor enorme',
          'Los números crecen muchísimo más rápido de lo que la intuición espera: 20! ya supera los dos trillones',
          'Por encima de 170 el factorial desborda el número más grande que puede representar un navegador: acá el conteo se hace con enteros exactos y el tope de n es 170',
          'Acertar una lotería con más chances jugando más veces sigue siendo prácticamente imposible: duplicar las jugadas duplica una probabilidad ínfima, que sigue siendo ínfima',
        ],
        plazo:
          'antes de contar, escribí un ejemplo chico a mano: si con n=3 y r=2 el conteo no te da lo que ves, elegiste el tipo equivocado.',
      },
      {
        id: 'binomial',
        label: 'Exactamente k éxitos en n ensayos',
        hint: 'Distribución binomial',
        answer:
          'P(X = k) = C(n,k) × p^k × (1 − p)^(n−k). El promedio esperado es n × p.',
        yes: [
          'Sirve cuando repetís n veces el mismo ensayo con la misma probabilidad p y contás cuántas veces salió bien',
          'Se calcula la probabilidad exacta de k éxitos y también la acumulada de k o menos',
          'El valor esperado es n × p y el desvío estándar es la raíz de n × p × (1 − p)',
          'Ejemplo clásico: en 10 tiradas de moneda, la chance de exactamente 5 caras es 24,6%, bastante menos de lo que la intuición sugiere',
          'Cuando n es grande y p no está muy cerca de 0 ni de 1, la binomial se parece mucho a una campana de Gauss',
        ],
        warn: [
          'Los ensayos tienen que ser independientes y con probabilidad constante: si sacás cartas sin reponerlas, la binomial no aplica',
          'La probabilidad de exactamente el valor esperado no es alta: con n grande hay tantos resultados posibles que ninguno se lleva mucho',
          '"Exactamente k" y "k o más" son preguntas distintas y dan números muy distintos: fijate cuál necesitás',
          'Con n muy grande y p muy chica conviene la aproximación de Poisson, que es más estable numéricamente',
        ],
        plazo:
          'antes de calcular, definí si te importa "exactamente k", "k o menos" o "al menos k": las tres salen de la misma fórmula pero no son lo mismo.',
      },
      {
        id: 'normal',
        label: 'Qué parte de la campana cae entre dos valores',
        hint: 'Distribución normal y z',
        answer:
          'Se pasan los dos límites a puntajes z y se resta el área acumulada: P(a < X < b) = Φ(z_b) − Φ(z_a).',
        yes: [
          'Cargá la media, el desvío estándar y los dos límites del intervalo que te interesa',
          'El puntaje z dice a cuántos desvíos estándar de la media está un valor: z = (x − μ) ÷ σ',
          'La regla empírica: entre ±1σ cae el 68% de los casos, entre ±2σ el 95% y entre ±3σ el 99,7%',
          'Se devuelve también cuánto queda en cada cola: por debajo del límite inferior y por encima del superior',
          'Sirve para percentiles, control de calidad, notas estandarizadas y cualquier variable que se distribuya de forma simétrica alrededor de un promedio',
        ],
        warn: [
          'La normal supone simetría: ingresos, tiempos de espera y precios suelen tener cola larga a la derecha y NO se modelan bien así',
          'El área es una probabilidad de una variable continua: la probabilidad de un valor exacto es cero, siempre se habla de intervalos',
          'El cálculo del área usa una aproximación numérica de la función de error, con precisión de sobra para uso práctico pero no infinita',
          'Un desvío estándar mal estimado arruina todo el resultado: si viene de una muestra chica, el intervalo real es más ancho de lo que dice el número',
        ],
        plazo:
          'antes de usar la normal, mirá un histograma de tus datos: si está torcido, el resultado va a ser bonito y falso.',
      },
    ],
  },

  inputsTitle: 'Cargá tus números',
  inputsIntro:
    'Cada caso usa sólo los campos que le corresponden: el tipo y la cantidad para el sorteo, los casos favorables y posibles para un evento, n y r para la combinatoria, n, k y p para la binomial, y media, desvío y límites para la campana.',
  fields: [
    {
      id: 'tipoSorteo',
      label: 'Qué querés sortear',
      type: 'select',
      value: 'dado6',
      options: [
        { value: 'dado6', label: 'Dado de 6 caras' },
        { value: 'dado12', label: 'Dado de 12 caras' },
        { value: 'dado20', label: 'Dado de 20 caras (D20)' },
        { value: 'moneda', label: 'Moneda (cara o cruz)' },
        { value: 'rango', label: 'Un rango a medida (mínimo y máximo)' },
      ],
      help: 'Con "rango a medida" se usan los campos de mínimo y máximo de abajo.',
    },
    {
      id: 'minimo',
      label: 'Número mínimo del rango',
      type: 'number',
      min: -1000000,
      max: 1000000,
      step: 1,
      value: 1,
      help: 'Se incluye en el sorteo.',
    },
    {
      id: 'maximo',
      label: 'Número máximo del rango',
      type: 'number',
      min: -1000000,
      max: 1000000,
      step: 1,
      value: 100,
      help: 'También se incluye. El rango no puede superar el millón de valores.',
    },
    {
      id: 'cantidad',
      label: '¿Cuántos resultados querés?',
      type: 'number',
      suffix: 'nºs',
      min: 1,
      max: 100,
      step: 1,
      value: 1,
      help: 'Hasta 100 de una vez. Sirve para tirar varios dados juntos o sortear varios ganadores.',
    },
    {
      id: 'sinRepetir',
      label: '¿Sin repetir?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No — se pueden repetir valores' },
        { value: 'si', label: 'Sí — todos distintos (rifas, amigo invisible)' },
      ],
    },
    {
      id: 'casosFavorables',
      label: 'Casos favorables',
      type: 'number',
      min: 0,
      max: 1000000000,
      step: 1,
      value: 1,
      thousands: true,
      help: 'Cuántos resultados te sirven. Sacar un 6 en un dado: 1.',
    },
    {
      id: 'casosPosibles',
      label: 'Casos posibles',
      type: 'number',
      min: 1,
      max: 1000000000,
      step: 1,
      value: 6,
      thousands: true,
      help: 'Cuántos resultados hay en total. Un dado de 6 caras: 6.',
    },
    {
      id: 'probPct',
      label: 'O la probabilidad por intento, si ya la sabés',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.001,
      value: 0,
      help: 'Un drop rate o una chance conocida. Si la cargás acá, pisa los casos favorables y posibles. Dejala en 0 para no usarla.',
    },
    {
      id: 'intentos',
      label: 'Cuántos intentos vas a hacer',
      type: 'number',
      suffix: 'intentos',
      min: 1,
      max: 10000000,
      step: 1,
      value: 10,
      thousands: true,
      help: 'Para calcular la chance de que ocurra al menos una vez.',
    },
    {
      id: 'tipoConteo',
      label: 'Tipo de conteo',
      type: 'select',
      value: 'combinacion',
      options: [
        { value: 'combinacion', label: 'Combinación sin repetición — el orden NO importa' },
        { value: 'permutacion', label: 'Permutación sin repetición — el orden SÍ importa' },
        { value: 'combinacion-repeticion', label: 'Combinación con repetición — se puede repetir, sin orden' },
        { value: 'permutacion-repeticion', label: 'Permutación con repetición — se puede repetir, con orden' },
        { value: 'factorial', label: 'Factorial n! — ordenar el conjunto completo' },
      ],
      help: 'La lotería de bolillas es una combinación sin repetición; un PIN es una permutación con repetición.',
    },
    {
      id: 'n',
      label: 'n — elementos disponibles',
      type: 'number',
      min: 0,
      max: 170,
      step: 1,
      value: 45,
      help: 'Cuántas opciones hay en total. En el Quini 6, 45 bolillas. Máximo 170.',
    },
    {
      id: 'r',
      label: 'r — elementos que elegís',
      type: 'number',
      min: 0,
      max: 170,
      step: 1,
      value: 6,
      help: 'Cuántos tomás del conjunto. En el Quini 6, 6 números.',
    },
    {
      id: 'ensayos',
      label: 'n — cantidad de ensayos',
      type: 'number',
      min: 1,
      max: 100000,
      step: 1,
      value: 10,
      thousands: true,
      help: 'Cuántas veces repetís el experimento. 10 tiradas de moneda.',
    },
    {
      id: 'exitos',
      label: 'k — éxitos que te interesan',
      type: 'number',
      min: 0,
      max: 100000,
      step: 1,
      value: 5,
      thousands: true,
      help: 'Cuántos aciertos exactos querés evaluar. Tiene que estar entre 0 y n.',
    },
    {
      id: 'pExito',
      label: 'p — probabilidad de éxito en cada ensayo',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.01,
      value: 50,
      help: 'La chance de que salga bien un ensayo individual. Una moneda: 50%.',
    },
    {
      id: 'media',
      label: 'μ — media de la distribución',
      type: 'number',
      step: 0.01,
      value: 100,
      help: 'El promedio alrededor del cual se centra la campana.',
    },
    {
      id: 'desvio',
      label: 'σ — desvío estándar',
      type: 'number',
      min: 0.0001,
      step: 0.01,
      value: 15,
      help: 'Cuánto se dispersan los datos. Tiene que ser mayor a 0.',
    },
    {
      id: 'limiteA',
      label: 'Límite inferior del intervalo',
      type: 'number',
      step: 0.01,
      value: 85,
      help: 'El valor desde el cual querés medir el área.',
    },
    {
      id: 'limiteB',
      label: 'Límite superior del intervalo',
      type: 'number',
      step: 0.01,
      value: 115,
      help: 'Tiene que ser mayor que el límite inferior.',
    },
  ],
  fineprint:
    'Las probabilidades suponen que cada intento es independiente y mantiene la misma chance: si el sistema tiene contador de piedad, premio garantizado o extracción sin reposición, las fórmulas de intentos repetidos no aplican. El sorteo usa el generador de azar del navegador, suficiente para juegos, clases y rifas, pero no apto para criptografía ni para sorteos que requieran auditoría formal. Nada de esto es un método para ganarle a un juego de azar: en cualquier lotería o casino la esperanza matemática del jugador es negativa.',

  chart: {
    type: 'bars',
    title: 'Cómo se reparte la probabilidad',
    caption:
      'Las barras muestran el reparto que importa en cada caso: en el sorteo, cuántas veces salió cada valor contra lo que la teoría esperaba; en un evento repetido, la chance de que ocurra contra la de que no ocurra nunca; y en la campana, cuánta área queda dentro del intervalo y cuánta en cada cola.',
  },
  breakdownTitle: 'Los números de tu cálculo',
  breakdownIntro:
    'Cada fila viene con su unidad: porcentaje, cantidad de intentos, cantidad de formas posibles, puntaje z o valor absoluto. Las barras comparan cada cifra con la mayor de la lista.',

  faq: [
    {
      q: '¿Cómo se calcula la probabilidad de un evento?',
      a: 'Se dividen los casos favorables por los casos posibles, siempre que todos los resultados sean igual de probables: sacar un 6 en un dado es 1 entre 6, o sea 16,67%. El resultado va de 0 (imposible) a 1 (seguro), y se suele expresar en porcentaje. Si los resultados no son equiprobables —una ruleta trucada, un dado cargado— esta regla no sirve y hay que trabajar con las probabilidades reales de cada resultado.',
    },
    {
      q: '¿Cuál es la probabilidad de que algo pase al menos una vez en varios intentos?',
      a: 'Se calcula por el complemento: 1 menos la probabilidad de que no pase nunca. Si cada intento tiene probabilidad P, la de fallar todos es (1 − P) elevado a la cantidad de intentos, así que la de acertar al menos una vez es 1 − (1 − P)^N. Con una chance del 1% por intento y 100 intentos, no llegás al 100% sino al 63,4%. Es la cuenta que hay detrás del farmeo de un ítem, de las tiradas de gacha y de cualquier intento repetido con la misma chance.',
    },
    {
      q: '¿Cuántos intentos necesito para tener 50% de chance?',
      a: 'Se despeja de la misma fórmula: intentos = ln(0,5) ÷ ln(1 − P). Con una probabilidad del 1% por intento hacen falta 69 intentos para llegar al 50%, 230 para el 90% y 459 para el 99%. La regla práctica es que llegar al 50% cuesta aproximadamente 0,7 veces el inverso de la probabilidad: si algo es 1 en 100, la mediana está cerca de los 70 intentos, no de los 100.',
    },
    {
      q: '¿Cuál es la diferencia entre combinación y permutación?',
      a: 'En una combinación el orden no importa y en una permutación sí. Elegir 3 personas de 10 para un comité son combinaciones: da lo mismo en qué orden las nombres, y hay 120 opciones. Elegir 3 de 10 para primer, segundo y tercer puesto son permutaciones: el orden cambia el resultado, y hay 720. La permutación siempre da más, exactamente r! veces más que la combinación correspondiente. Decidir cuál de las dos usás es el paso que más errores genera.',
    },
    {
      q: '¿Qué es el factorial y para qué sirve?',
      a: 'El factorial de n, escrito n!, es el producto de todos los enteros de 1 a n: 5! = 5 × 4 × 3 × 2 × 1 = 120. Cuenta de cuántas formas distintas se pueden ordenar n elementos en fila, y es la base de todas las fórmulas de combinatoria. Crece de una manera que sorprende a cualquiera: 10! ya son más de tres millones y 20! supera los dos trillones. Por convención, 0! vale 1.',
    },
    {
      q: '¿Cuál es la probabilidad de ganar la lotería?',
      a: 'Es 1 dividido la cantidad de combinaciones posibles, que sale de C(n,r) donde n son las bolillas y r los números que elegís. En un juego de 6 números sobre 45, las combinaciones son 8.145.060, así que una jugada tiene una chance de 0,0000123%. Jugando una vez por semana necesitarías más de cien mil años para llegar a un 50% de haber ganado alguna vez. Duplicar las jugadas duplica esa probabilidad, pero el doble de casi nada sigue siendo casi nada.',
    },
    {
      q: '¿Qué es la distribución binomial?',
      a: 'Es la distribución de la cantidad de éxitos en n ensayos independientes con la misma probabilidad p en cada uno. La fórmula es P(X = k) = C(n,k) × p^k × (1 − p)^(n−k). En 10 tiradas de una moneda, la probabilidad de exactamente 5 caras es 24,6%: es el resultado más probable, pero está lejos de ser lo habitual. El promedio esperado es n × p y el desvío estándar es la raíz de n × p × (1 − p).',
    },
    {
      q: '¿Qué es un puntaje z y para qué sirve?',
      a: 'El puntaje z mide a cuántos desvíos estándar de la media está un valor: z = (x − μ) ÷ σ. Sirve para comparar cosas medidas en escalas distintas y para leer cualquier tabla de la normal estandarizada. Un z de 2 quiere decir que el valor está dos desvíos por encima del promedio, lo que en una distribución normal lo deja por encima del 97,7% de los casos. Los valores negativos indican que está por debajo de la media.',
    },
    {
      q: '¿Qué dice la regla del 68-95-99,7?',
      a: 'En una distribución normal, el 68,3% de los casos cae entre la media y un desvío estándar hacia cada lado, el 95,4% entre dos desvíos y el 99,7% entre tres. Es la regla empírica y sirve como control de sanidad rápido: si tu intervalo de ±2σ no contiene la enorme mayoría de tus datos, probablemente esos datos no se distribuyan normalmente y el cálculo del área no signifique lo que creés.',
    },
    {
      q: '¿Es cierto que un número que no salió en mucho tiempo "está por salir"?',
      a: 'No, y creerlo tiene nombre propio: la falacia del jugador. Un dado, una ruleta o un sorteo no tienen memoria, así que la probabilidad de cada resultado es exactamente la misma en cada tirada, independientemente de lo que haya pasado antes. Lo que sí ocurre en el largo plazo es que las frecuencias tienden al valor teórico, pero no porque el sistema "compense" las rachas pasadas, sino porque las diluye entre muchísimas tiradas nuevas.',
    },
    {
      q: '¿Los números que genera esta página son realmente aleatorios?',
      a: 'Son pseudoaleatorios: los produce el generador del navegador, que da una distribución uniforme perfectamente adecuada para juegos, clases, rifas y sorteos informales. No son criptográficamente seguros, así que no sirven para generar claves, tokens ni nada que dependa de que el resultado sea impredecible para un atacante. Para eso hacen falta generadores criptográficos específicos.',
    },
    {
      q: '¿Cuándo NO puedo usar estas fórmulas de intentos repetidos?',
      a: 'Cuando los intentos dejan de ser independientes o la probabilidad cambia entre uno y otro. Los tres casos más comunes: sistemas con contador de piedad o premio garantizado a los X intentos, que suben la chance a medida que fallás; extracciones sin reposición, donde cada intento cambia el conjunto restante y hay que usar la distribución hipergeométrica; y cualquier situación donde el resultado de un intento afecte al siguiente. En esos casos el resultado de esta página va a ser optimista o pesimista, pero no correcto.',
    },
  ],

  sources: [
    {
      name: 'NIST/SEMATECH e-Handbook of Statistical Methods — Probability distributions',
      url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda36.htm',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'NIST/SEMATECH e-Handbook — Binomial distribution',
      url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda366i.htm',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'NIST/SEMATECH e-Handbook — Normal distribution y tabla z',
      url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'Abramowitz & Stegun — Handbook of Mathematical Functions (aproximación 7.1.26 de la función de error)',
      url: 'https://personal.math.ubc.ca/~cbm/aands/page_299.htm',
      publisher: 'National Bureau of Standards',
    },
    {
      name: 'MDN — Math.random() y por qué no es criptográficamente segura',
      url: 'https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Math/random',
      publisher: 'Mozilla Developer Network',
    },
    {
      name: 'Lotería de la Ciudad de Buenos Aires — reglamentos de juegos de azar',
      url: 'https://loteria.buenosaires.gob.ar/',
      publisher: 'Lotería de la Ciudad de Buenos Aires',
    },
  ],

  replaces: [
    '/calculadora-aleatorio-numero-dado',
    '/generador-de-numeros-aleatorios',
    '/calculadora-probabilidad-evento',
    '/calculadora-probabilidad-drop-loot',
    '/calculadora-probabilidad-loteria-premio',
    '/calculadora-combinaciones-permutaciones-factorial',
    '/calculadora-permutaciones-n-tomados-k-pnk',
    '/calculadora-probabilidad-binomial',
    '/calculadora-distribucion-normal-area',
    '/calculadora-probabilidad-conocer-pareja',
    '/calculadora-probabilidad-lluvia-24h-presion-humedad-tendencia',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Tope de resultados por sorteo. Calcado de `generador-numeros-aleatorios.ts`. */
export const CANTIDAD_MAXIMA = 100;

/** Tope de valores distintos en un rango a medida. De `aleatorio-numero-dado.ts`. */
export const RANGO_MAXIMO = 1000000;

/** Tope de n en combinatoria: 170! es el último factorial representable. */
export const N_MAXIMO = 170;

/** Rangos fijos de cada tipo de sorteo. */
export const TIPOS_SORTEO: Record<string, { min: number; max: number; label: string }> = {
  dado6: { min: 1, max: 6, label: 'dado de 6 caras' },
  dado12: { min: 1, max: 12, label: 'dado de 12 caras' },
  dado20: { min: 1, max: 20, label: 'dado de 20 caras' },
  moneda: { min: 0, max: 1, label: 'moneda' },
};

/** Nombre legible de cada tipo de conteo combinatorio. */
export const CONTEO_LABEL: Record<string, string> = {
  combinacion: 'Combinación sin repetición',
  permutacion: 'Permutación sin repetición',
  'combinacion-repeticion': 'Combinación con repetición',
  'permutacion-repeticion': 'Permutación con repetición',
  factorial: 'Factorial n!',
};

/**
 * Coeficientes de la aproximación 7.1.26 de Abramowitz & Stegun para la
 * función de error, usada para el área bajo la curva normal.
 * Calcados de `distribucion-normal-area.ts`.
 */
export const ERF_A = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
export const ERF_P = 0.3275911;
