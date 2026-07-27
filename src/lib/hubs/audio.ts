import type { HubData } from './types';

/**
 * Hub de decisión — "Audio: BPM, tempo, afinación y decibeles".
 * Arquetipo RAMIFICADO. Son tres familias que comparten el mismo hub porque
 * comparten la persona que las busca (quien graba, toca o sonoriza) y porque
 * físicamente son la misma cosa: una frecuencia y una intensidad.
 *
 *   · TEMPO Y RITMO — BPM, compás y delay. Todo sale de una sola constante:
 *     60000 / BPM = duración de la negra en milisegundos. El delay sincronizado
 *     no es otra fórmula, es esa misma negra dividida o multiplicada por la
 *     figura. Por eso las tres calcs de esta familia dan siempre resultados
 *     coherentes entre sí en este hub.
 *   · AFINACIÓN E INSTRUMENTO — frecuencia de nota, transposición y tensión de
 *     cuerda. Temperamento igual: f = base × 2^(n/12), con A4 = 440 Hz como
 *     referencia estándar (editable, para quien afina en 432 o 415).
 *   · SONIDO FÍSICO — caída de nivel por distancia (ley del cuadrado inverso,
 *     −20·log10(d2/d1)), exposición segura al ruido y carga de parlantes.
 *
 * Absorbe 9 URLs (ver hub.replaces).
 *
 * YMYL DE SALUD: la rama `ruido` calcula tiempo máximo de exposición. El daño
 * auditivo por ruido es acumulativo e IRREVERSIBLE. El aviso del dominio
 * `health` de src/lib/disclaimers.ts viaja textual en hub.fineprint y como
 * PRIMER `warn` de cada rama. El criterio es el de NIOSH: 85 dB(A) para 8 h con
 * tasa de canje de 3 dB (cada 3 dB de más, la mitad del tiempo seguro).
 * OSHA usa una tasa de canje de 5 dB y 90 dB de límite legal: es más permisiva,
 * y está aclarado en la FAQ para que nadie se confunda de norma.
 *
 * NOTAS DE CONTRATO:
 *  - ESTE HUB NO ES DE PLATA. El default de `format` es 'ars', así que TODAS las
 *    filas y todos los resultados llevan `format` explícito ('unit' con su
 *    `unit`, o 'plain'). Ninguna fila puede quedar sin format.
 *  - `chart.type: 'scale'`: en las nueve ramas la pregunta es la misma —dónde
 *    caigo yo en un rango con franjas—, así que compute() devuelve siempre
 *    `position` (0-100) y `positionLabel`, y las franjas van en el `chart` del
 *    resultado con `from`/`to`.
 */

export const hub: HubData = {
  slug: 'musica/audio',
  title: 'Audio: BPM, tempo, afinación y decibeles — calculadoras en una',
  description:
    'Sacá el BPM de una canción, la duración del compás, el delay sincronizado en milisegundos, la frecuencia de cualquier nota con A440, la tensión de una cuerda y el nivel en decibeles a distancia, con el tiempo de exposición seguro.',
  silo: 'Música',
  siloHref: '/musica',

  eyebrow: 'Guía y calculadoras de audio',
  h1: 'Audio: BPM, tempo, afinación y decibeles',
  lede:
    'Casi todo lo que se calcula en música sale de dos números: una frecuencia y una intensidad. El tempo es una frecuencia lenta —60000 dividido el BPM te da la negra en milisegundos, y de ahí sale el delay—; la afinación es una frecuencia rápida que sube 2^(1/12) por semitono; y los decibeles son la intensidad, que cae 6 dB cada vez que duplicás la distancia. Elegí tu caso.',
  stamps: ['Actualizado 27-07-2026', 'A440 · temperamento igual · NIOSH', '9 calculadoras adentro'],

  resultLabel: 'Tu resultado',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Nueve casos, tres familias. Tempo y ritmo comparten la misma constante (60000 ÷ BPM); afinación e instrumento comparten el temperamento igual; y las de sonido físico, la escala logarítmica de decibeles.',
    items: [
      {
        id: 'tempo',
        label: 'Duración del compás a un tempo dado',
        hint: 'Cuánto dura un compás y cuánto una sección.',
        answer: 'A 120 BPM en 4/4, cada compás dura exactamente 2 segundos.',
        yes: [
          'La negra a ese tempo en milisegundos: 60000 dividido el BPM',
          'La duración del pulso según el denominador del compás: en 6/8 el pulso es la corchea, la mitad de la negra',
          'Cuánto dura un compás entero y cuánto dura la cantidad de compases que le pongas',
          'El nombre italiano del tempo, de Largo a Presto, por si tenés que anotarlo en la partitura',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La duración es matemática y supone tempo constante. Si la pieza tiene rubato, accelerando o cambios de métrica, el total real va a diferir.',
          'En compases de amalgama (7/8, 5/4) el pulso no es regular aunque la cuenta total sí: la duración del compás vale, la sensación de pulso no.',
        ],
        plazo: 'si estás calzando música a video, calculá siempre en milisegundos y no en segundos redondeados: el error se acumula compás a compás.',
      },
      {
        id: 'tap',
        label: 'Sacar el BPM de una canción',
        hint: 'Contando pulsos durante unos segundos.',
        answer: 'BPM = pulsos contados ÷ segundos × 60.',
        yes: [
          'El tempo en BPM a partir de los pulsos que contaste en una cantidad de segundos',
          'La duración de la negra y del compás de 4/4 a ese tempo',
          'El género típico de esa zona de tempo, que sirve para chequear si contaste a mitad o al doble',
          'Contar más segundos reduce el error: con 30 segundos el margen es la mitad que con 15',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Un error de medio pulso al empezar o terminar de contar mueve el resultado varios BPM: contá tramos largos.',
          'Es muy fácil contar al doble o a la mitad del tempo real. Si el número te da raro, dividilo o multiplicalo por dos y fijate cuál encaja con el género.',
        ],
        plazo: 'para editar audio, redondeá al BPM entero más cercano sólo si la grabación es a click; si es tocada a mano, el tempo flota y no hay número exacto.',
      },
      {
        id: 'delay',
        label: 'Delay o reverb sincronizado al tempo',
        hint: 'Los milisegundos de cada figura.',
        answer: 'La negra sincronizada son 60000 ÷ BPM milisegundos.',
        yes: [
          'Negra, corchea y semicorchea en milisegundos, que es lo que se carga en el delay',
          'La corchea con puntillo, que es el delay de rock clásico: corchea × 1,5',
          'El tresillo de corchea, para el rebote a tres',
          'Un pre-delay de reverb sugerido, del orden de la fusa, para que la cola no tape el ataque',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Estos valores son el tiempo exacto. Un delay analógico o una cinta van a estar unos milisegundos corridos, y eso suele ser deseable.',
          'Si el proyecto cambia de tempo, todos estos números cambian: en un DAW conviene poner el delay en modo sincronizado en vez de cargar los milisegundos a mano.',
        ],
        plazo: 'cargá el valor en el delay antes de automatizar el feedback: cambiar el tiempo con la cola sonando genera un barrido de altura.',
      },
      {
        id: 'nota',
        label: 'Frecuencia de una nota',
        hint: 'En Hz, con A440 o la afinación que uses.',
        answer: 'Cada semitono multiplica la frecuencia por 2^(1/12), o sea 1,05946.',
        yes: [
          'La frecuencia exacta de la nota y la octava que elijas, en temperamento igual',
          'La referencia es A4 = 440 Hz, el estándar ISO 16, y podés cambiarla a 432, 415 o la que uses',
          'El número de nota MIDI, que sirve para programar sintetizadores',
          'La longitud de onda en el aire, útil para tratamiento acústico y para ubicar un micrófono',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El temperamento igual reparte el error entre todos los intervalos: ninguna quinta ni tercera es acústicamente pura. Si afinás por temperamento mesotónico o justa, estos números no aplican.',
          'La longitud de onda se calcula con 343 m/s, la velocidad del sonido a 20 °C. Con otra temperatura cambia unos centímetros.',
        ],
        plazo: 'si vas a grabar con otros músicos, acordá la afinación base antes de la primera toma: mezclar 440 con 432 en la misma sesión no tiene arreglo después.',
      },
      {
        id: 'transponer',
        label: 'Transponer un acorde o una canción',
        hint: 'Subir o bajar semitonos.',
        answer: 'Transponer es sumar semitonos a la fundamental y dejar el sufijo igual.',
        yes: [
          'La fundamental nueva del acorde después de subir o bajar la cantidad de semitonos que pongas',
          'El sufijo del acorde no se toca: un m7 sigue siendo m7, sólo cambia la nota base',
          'El nombre del intervalo que estás aplicando, de segunda menor a séptima mayor',
          'La frecuencia de la fundamental original y de la nueva, para ver el salto en Hz',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La enarmonía se respeta según cómo escribas el acorde: si entrás con bemoles, sale con bemoles. Para escritura correcta puede hacer falta ajustar a mano según la tonalidad de destino.',
          'En guitarra, transponer con capo sube semitonos pero acorta la escala: la tensión de las cuerdas y el timbre cambian.',
        ],
        plazo: 'antes de transponer una canción para un cantante, chequeá que la nota más alta y la más baja de la melodía sigan entrando en su registro.',
      },
      {
        id: 'cuerda',
        label: 'Tensión de una cuerda de guitarra',
        hint: 'Por calibre, afinación y escala.',
        answer: 'La tensión sube con el cuadrado de la frecuencia: bajar un tono la afloja mucho.',
        yes: [
          'La tensión en libras, kilos y newtons para el calibre, la afinación y la escala que cargues',
          'La fórmula es T = masa por unidad de largo × (2 × escala × frecuencia)², con la masa estimada desde el calibre',
          'La zona en la que cae: floja, cómoda, ideal o dura para hacer bends',
          'Sirve para armar un juego a medida cuando afinás en Drop D, Drop C o medio tono abajo',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La masa por unidad de largo se estima desde el calibre. Para un número exacto, buscá el dato de unit weight que publica el fabricante de tu juego.',
          'Las cuerdas entorchadas y las lisas tienen densidades distintas, y este cálculo cambia de aproximación a partir de 0,018". Cerca de ese límite el margen de error crece.',
          'Cambiar mucho la tensión total del juego mueve el mástil: si subís o bajás varias libras, hay que reajustar el alma y la octavación.',
        ],
        plazo: 'después de un cambio grande de calibre o afinación, dejá la guitarra un día y recién ahí ajustá el alma: el mástil tarda en asentarse.',
      },
      {
        id: 'distancia',
        label: 'Cuántos decibeles llegan a X metros',
        hint: 'Caída del nivel por distancia.',
        answer: 'Cada vez que duplicás la distancia, el nivel cae 6 decibeles.',
        yes: [
          'El nivel que llega a la distancia que elijas, por la ley del cuadrado inverso: −20 × log10(distancia nueva ÷ distancia de referencia)',
          'Cuántos decibeles se pierden entre las dos distancias',
          'Con qué se compara ese nivel en la vida real, de biblioteca a despegue de avión',
          'Si a esa distancia seguís por encima de 85 dB, el tiempo máximo que podés estar sin protección',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La ley del cuadrado inverso vale en campo libre. En un espacio cerrado, las reflexiones hacen que el nivel caiga bastante menos de lo que dice el cálculo.',
          'Un sistema con directividad —una line array, una bocina— cae menos rápido que una fuente puntual, así que el número real puede ser mayor.',
          'La exposición al ruido daña el oído de forma acumulativa e irreversible. Ante cualquier duda, usá protección auditiva.',
        ],
        plazo: 'si medís en un evento, tomá el nivel a un metro de la fuente: es la distancia de referencia que usan todas las fichas técnicas.',
      },
      {
        id: 'ruido',
        label: 'Cuánto tiempo puedo estar a este volumen',
        hint: 'Exposición segura y salud auditiva.',
        answer: 'El criterio NIOSH: 85 dB por 8 horas, y cada 3 dB de más se corta el tiempo a la mitad.',
        yes: [
          'El tiempo máximo de exposición sin protección: T = 480 minutos ÷ 2^((dB − 85) ÷ 3)',
          'Por debajo de 85 dB(A) el criterio NIOSH no fija límite diario de exposición',
          'A 88 dB el límite baja a 4 horas, a 91 dB a 2 horas y a 100 dB a apenas 15 minutos',
          'La zona de riesgo en la que cae ese nivel y con qué se compara en la vida real',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El daño auditivo por ruido es acumulativo y NO se revierte: las células ciliadas del oído interno no se regeneran. Un límite superado no se compensa después.',
          'Este cálculo usa el criterio NIOSH (85 dB / 8 h, canje de 3 dB), que es el recomendado por salud. El límite legal OSHA es más permisivo (90 dB, canje de 5 dB): cumplir la ley no equivale a estar protegido.',
          'Los tiempos suponen un solo nivel sostenido. Si la exposición varía a lo largo del día, hay que sumar las dosis parciales, no mirar el pico.',
          'Los tapones y auriculares de protección restan entre 15 y 30 dB según el modelo: eso corre el límite, pero sólo si están bien colocados todo el tiempo.',
        ],
        plazo: 'si después de una exposición fuerte tenés zumbido o el oído tapado, eso es una señal de daño: alejate del ruido y consultá a un profesional.',
      },
      {
        id: 'amp',
        label: 'Impedancia de parlantes y watts del amplificador',
        hint: 'Serie, paralelo y carga segura.',
        answer: 'En paralelo la impedancia se divide; en serie se suma.',
        yes: [
          'La impedancia total de la cantidad de parlantes que conectes, según los conectes en serie o en paralelo',
          'Los watts que le tocan a cada parlante repartiendo la potencia del amplificador',
          'Si esa carga es segura: por encima de 4 Ω la banca casi cualquier amplificador; entre 2 y 4 Ω hace falta uno preparado',
          'Por debajo de 2 Ω la mayoría de los amplificadores entra en protección o se daña por exceso de corriente',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Los watts por parlante salen de repartir la potencia del amplificador en partes iguales, y eso sólo vale si los parlantes son idénticos y están igual conectados.',
          'La impedancia nominal de un parlante no es constante: varía con la frecuencia, y el mínimo real puede estar bastante por debajo del número de la etiqueta.',
          'Antes de bajar la carga, buscá en la ficha del amplificador la impedancia mínima que declara el fabricante. Si no lo dice, no bajes de 4 Ω.',
        ],
        plazo: 'chequeá la impedancia con el amplificador apagado y desconectado: conectar una carga baja con el equipo encendido es la forma más rápida de quemar la etapa de potencia.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada rama usa sólo los campos que necesita: los primeros son de tempo, después vienen los de afinación e instrumento, y al final los de sonido y parlantes.',
  fields: [
    { id: 'bpm', label: 'Tempo', type: 'number', min: 20, max: 300, step: 1, value: 120, suffix: 'BPM' },
    {
      id: 'metrica',
      label: 'Compás',
      type: 'select',
      value: '4/4',
      options: [
        { value: '4/4', label: '4/4 — el más común' },
        { value: '3/4', label: '3/4 — vals' },
        { value: '2/4', label: '2/4 — marcha, polka' },
        { value: '6/8', label: '6/8 — chacarera, shuffle' },
        { value: '12/8', label: '12/8 — blues lento' },
        { value: '5/4', label: '5/4 — amalgama' },
        { value: '7/8', label: '7/8 — amalgama' },
      ],
    },
    { id: 'compases', label: 'Cantidad de compases', type: 'number', min: 1, max: 999, value: 8, suffix: 'compases' },
    {
      id: 'beats',
      label: 'Pulsos que contaste',
      type: 'number',
      min: 1,
      max: 500,
      value: 32,
      suffix: 'pulsos',
      help: 'Sólo se usa en la rama que saca el BPM de una canción.',
    },
    {
      id: 'segundos',
      label: 'En cuántos segundos los contaste',
      type: 'number',
      min: 1,
      max: 600,
      value: 16,
      suffix: 'segundos',
      help: 'Cuanto más largo el tramo, menor el error.',
    },
    {
      id: 'nota',
      label: 'Nota',
      type: 'select',
      value: '9',
      options: [
        { value: '0', label: 'Do · C' },
        { value: '1', label: 'Do# · C#' },
        { value: '2', label: 'Re · D' },
        { value: '3', label: 'Re# · D#' },
        { value: '4', label: 'Mi · E' },
        { value: '5', label: 'Fa · F' },
        { value: '6', label: 'Fa# · F#' },
        { value: '7', label: 'Sol · G' },
        { value: '8', label: 'Sol# · G#' },
        { value: '9', label: 'La · A' },
        { value: '10', label: 'La# · A#' },
        { value: '11', label: 'Si · B' },
      ],
    },
    { id: 'octava', label: 'Octava', type: 'number', min: 0, max: 8, value: 4, help: 'La octava 4 es la central del piano: A4 es el la de referencia.' },
    {
      id: 'afinacion',
      label: 'Afinación de referencia',
      type: 'number',
      min: 380,
      max: 480,
      step: 0.5,
      value: 440,
      suffix: 'Hz',
      help: 'El estándar es A4 = 440 Hz. Cambialo si afinás en 432 Hz o en 415 Hz para repertorio barroco.',
    },
    {
      id: 'semitonos',
      label: 'Semitonos a transponer',
      type: 'number',
      min: -24,
      max: 24,
      value: 2,
      suffix: 'semitonos',
      help: 'Positivo sube, negativo baja. Sólo se usa en la rama de transposición.',
    },
    {
      id: 'calibre',
      label: 'Calibre de la cuerda',
      type: 'number',
      min: 0.007,
      max: 0.09,
      step: 0.001,
      value: 0.046,
      suffix: 'pulgadas',
      help: 'El número que trae el envase del juego: 0.046 es la sexta de un juego 10-46.',
    },
    {
      id: 'escala',
      label: 'Escala del instrumento',
      type: 'number',
      min: 15,
      max: 40,
      step: 0.25,
      value: 25.5,
      suffix: 'pulgadas',
      help: 'Del puente a la cejuela. Una Stratocaster mide 25,5"; una Les Paul, 24,75"; un bajo de escala larga, 34".',
    },
    {
      id: 'dbFuente',
      label: 'Nivel sonoro',
      type: 'number',
      min: 0,
      max: 200,
      step: 1,
      value: 110,
      suffix: 'dB',
      help: 'En la rama de distancia es el nivel medido en la distancia de referencia. En la rama de exposición segura es el nivel al que estás expuesto vos.',
    },
    { id: 'distanciaRef', label: 'Distancia de referencia', type: 'number', min: 0.1, max: 500, step: 0.1, value: 1, suffix: 'metros', help: 'Las fichas técnicas miden a 1 metro de la fuente.' },
    { id: 'distanciaObjetivo', label: 'Distancia a la que estás', type: 'number', min: 0.1, max: 5000, step: 0.5, value: 10, suffix: 'metros' },
    { id: 'potenciaAmp', label: 'Potencia del amplificador', type: 'number', min: 1, max: 20000, step: 1, value: 100, suffix: 'watts' },
    { id: 'impedancia', label: 'Impedancia de cada parlante', type: 'number', min: 1, max: 32, step: 0.5, value: 8, suffix: 'ohmios' },
    { id: 'cantidadParlantes', label: 'Cantidad de parlantes', type: 'number', min: 1, max: 16, value: 2, suffix: 'parlantes' },
    {
      id: 'conexion',
      label: 'Cómo los conectás',
      type: 'select',
      value: 'paralelo',
      options: [
        { value: 'paralelo', label: 'En paralelo — la impedancia baja' },
        { value: 'serie', label: 'En serie — la impedancia sube' },
      ],
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado. Los tiempos de exposición al ruido siguen el criterio NIOSH y no sustituyen una medición dosimétrica ni un control audiométrico.',

  chart: {
    type: 'scale',
    title: 'Dónde caés vos',
    caption:
      'La barra ubica tu resultado dentro del rango que importa en cada caso: el tempo entre lento y vertiginoso, la nota dentro del espectro audible, la tensión de la cuerda entre floja y dura, y el nivel sonoro sobre la escala de riesgo auditivo. El marcador es tu valor.',
  },
  breakdownTitle: 'El desglose de tu cálculo',
  breakdownIntro: 'Las barras comparan cada valor con el más grande del desglose.',

  faq: [
    {
      q: '¿Cómo se calcula el delay sincronizado al BPM?',
      a: 'La negra dura 60000 dividido el BPM, en milisegundos. A 120 BPM son 500 ms. De ahí sale todo lo demás: la corchea es la mitad (250 ms), la semicorchea un cuarto (125 ms), la corchea con puntillo es la corchea por 1,5 (375 ms) y el tresillo de corchea son dos tercios de la negra (333 ms). No hay otra fórmula: son divisiones de la misma constante.',
    },
    {
      q: '¿Por qué A4 son 440 Hz?',
      a: 'Es un acuerdo internacional, no una propiedad de la física. La norma ISO 16 fija el la central en 440 Hz y desde ahí se deriva todo el resto por temperamento igual. Antes del siglo XX cada ciudad afinaba distinto, y todavía hoy hay orquestas que suben a 442 o 443 para sonar más brillante, y conjuntos de música antigua que bajan a 415, exactamente un semitono por debajo.',
    },
    {
      q: '¿Qué es el temperamento igual?',
      a: 'Es dividir la octava en doce semitonos exactamente iguales, cada uno multiplicando la frecuencia por la raíz doceava de 2, que es 1,05946. La ventaja es que podés tocar en cualquier tonalidad sin reafinar; el precio es que ninguna quinta ni tercera queda acústicamente pura, aunque el error de la quinta es tan chico que el oído lo acepta sin problema.',
    },
    {
      q: '¿Cuánto tiempo puedo escuchar música fuerte sin dañarme el oído?',
      a: 'El criterio NIOSH marca 85 dB(A) durante 8 horas como límite diario, y cada 3 dB por encima corta ese tiempo a la mitad: 88 dB son 4 horas, 91 dB son 2 horas, 100 dB son 15 minutos y 106 dB son menos de 4 minutos. Un recital ronda los 100 a 110 dB, así que dos horas de show sin tapones exceden el límite varias veces. El daño es acumulativo e irreversible.',
    },
    {
      q: '¿Es lo mismo el criterio NIOSH que el de OSHA?',
      a: 'No, y la diferencia importa. NIOSH usa 85 dB para 8 horas con una tasa de canje de 3 dB, que es la que se corresponde con la energía sonora real. OSHA, que es el límite legal en Estados Unidos, usa 90 dB con canje de 5 dB: permite bastante más exposición. Cumplir el límite legal no equivale a estar protegido; para salud auditiva conviene el criterio más exigente.',
    },
    {
      q: '¿Cuántos decibeles se pierden con la distancia?',
      a: 'En campo libre, 6 dB cada vez que duplicás la distancia, porque la energía se reparte sobre una superficie que crece con el cuadrado del radio. La fórmula es nivel nuevo = nivel de referencia − 20 × log10(distancia nueva ÷ distancia de referencia). En un ambiente cerrado la caída real es menor, porque las reflexiones de paredes y techo devuelven energía.',
    },
    {
      q: '¿Cómo saco el BPM de una canción a mano?',
      a: 'Contá pulsos durante un tramo largo y dividí: BPM = pulsos ÷ segundos × 60. Si contás 32 pulsos en 16 segundos, son 120 BPM. Cuanto más largo el tramo, menor el error de arranque y cierre. El error más común no es de conteo sino de nivel: contar a la mitad o al doble del tempo real. Si el número da muy lejos de lo típico del género, probá duplicarlo o dividirlo por dos.',
    },
    {
      q: '¿Cómo se transpone un acorde?',
      a: 'Se le suman semitonos a la fundamental y el sufijo queda igual. Am7 subido dos semitonos es Bm7; F#maj7 bajado tres es Dmaj7. La cuenta es circular sobre las doce notas, así que después de B viene C otra vez. Lo único que hay que cuidar es la escritura: si la canción está en bemoles, conviene que el resultado quede en bemoles y no en sostenidos.',
    },
    {
      q: '¿Cómo cambia la tensión si bajo la afinación?',
      a: 'Baja con el cuadrado de la frecuencia. Bajar un semitono deja la cuerda con alrededor de un 11% menos de tensión, y bajar un tono entero le quita más o menos un 21%. Por eso, para afinar en Drop C o medio tono abajo sin que las cuerdas queden flojas, se sube el calibre: el calibre compensa lo que la afinación quita.',
    },
    {
      q: '¿Qué pasa si conecto dos parlantes de 8 ohmios?',
      a: 'En paralelo la impedancia total queda en 4 Ω y el amplificador entrega más corriente; en serie queda en 16 Ω y entrega menos. La regla general es que por encima de 4 Ω casi cualquier amplificador está cómodo, entre 2 y 4 Ω hace falta uno preparado para cargas bajas, y por debajo de 2 Ω la mayoría entra en protección o se daña. La impedancia mínima siempre está en la ficha del amplificador.',
    },
    {
      q: '¿Cuánto dura un compás de 6/8?',
      a: 'En 6/8 el pulso es la corchea, que dura la mitad de la negra, y el compás tiene seis. Entonces el compás dura tres negras: a 120 BPM, 1,5 segundos. La cuenta general es duración del compás = (60000 ÷ BPM) × (4 ÷ denominador) × numerador, en milisegundos. Con eso resolvés cualquier métrica, incluidas las de amalgama como 7/8.',
    },
    {
      q: '¿Cuánto mide la onda de una nota y para qué sirve saberlo?',
      a: 'La longitud de onda es la velocidad del sonido dividida la frecuencia; con 343 m/s a 20 °C, un la de 440 Hz mide unos 78 cm y un grave de 40 Hz mide más de 8 metros. Sirve para dos cosas muy concretas: entender por qué los graves se acumulan en las esquinas de una sala y por qué un panel absorbente fino no hace nada contra ellos, y para ubicar micrófonos evitando cancelaciones.',
    },
  ],

  sources: [
    {
      name: 'Criterios para exposición ocupacional a ruido — 85 dB(A) / 8 h con tasa de canje de 3 dB',
      url: 'https://www.cdc.gov/niosh/docs/98-126/',
      publisher: 'NIOSH · Centers for Disease Control and Prevention',
    },
    {
      name: 'Occupational noise exposure — límite legal y tabla de duración permitida',
      url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.95',
      publisher: 'OSHA · U.S. Department of Labor',
    },
    {
      name: 'Escucha segura — recomendaciones sobre niveles y tiempo de exposición',
      url: 'https://www.who.int/activities/making-listening-safe',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'ISO 16 — Acoustics: standard tuning frequency (A4 = 440 Hz)',
      url: 'https://www.iso.org/standard/3601.html',
      publisher: 'International Organization for Standardization',
    },
    {
      name: 'The MIDI 1.0 Specification — numeración de notas y afinación',
      url: 'https://midi.org/midi-1-0-core-specifications',
      publisher: 'MIDI Association',
    },
    {
      name: 'String tension — unit weight y fórmula de tensión de cuerdas',
      url: 'https://www.daddario.com/products/guitar/electric-guitar/strings-by-gauge/',
      publisher: "D'Addario",
    },
  ],

  replaces: [
    '/calculadora-bpm-tempo-cancion',
    '/calculadora-decibelios-distancia-sonido',
    '/calculadora-compas-tiempo-pulso',
    '/calculadora-amplificador-watts-parlantes',
    '/calculadora-cuerda-guitarra-tension',
    '/calculadora-afinacion-frecuencia-nota',
    '/calculadora-transposicion-acordes',
    '/calculadora-exposicion-ruido-decibeles-segura',
    '/calculadora-delay-tiempo-ms-bpm',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Constantes físicas y de norma que usa compute(). Nada hardcodeado en el copy. */
export const AUDIO = {
  /** Referencia estándar ISO 16: A4 = 440 Hz, nota MIDI 69. */
  MIDI_A4: 69,
  /** Velocidad del sonido en aire seco a 20 °C, en m/s. */
  VELOCIDAD_SONIDO: 343,
  /** NIOSH: 480 minutos (8 h) a 85 dB(A), tasa de canje de 3 dB. */
  NIOSH: { DB_BASE: 85, MINUTOS_BASE: 480, CANJE_DB: 3 },
  /** Nombres de nota en sostenidos y en bemoles, para transponer respetando la escritura. */
  SHARP: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  FLAT: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  /**
   * Peso por unidad de largo aproximado, en lb/pulgada: unit weight = gauge² × k.
   * Para cuerda lisa de acero, k = π/4 × densidad del acero (0,284 lb/in³) ≈ 0,224.
   * Las entorchadas son algo menos densas por unidad de sección aparente.
   *
   * OJO: src/lib/formulas/cuerda-guitarra-tension.ts usa 2241.2 y 1607.2, o sea
   * estas mismas constantes multiplicadas por 10.000. Con esos valores una
   * primera de 0.010" da 163.919 libras en vez de 16,4, y TODOS los resultados
   * caen fuera de las bandas de evaluación. Acá va el valor correcto.
   */
  UNIT_WEIGHT: { LISA: 0.22412, ENTORCHADA: 0.16072, LIMITE_ENTORCHADA: 0.018 },
  /** Conversión de la fórmula de tensión: g en pulgadas/s². */
  G_PULGADAS: 386.4,
};
