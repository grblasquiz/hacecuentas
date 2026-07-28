import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo organizo el estudio para el examen?"
 * Arquetipo RAMIFICADO: 8 ramas = las 8 formas en que alguien llega a
 * preguntarse cómo repartir el estudio. Absorbe 9 URLs (ver `replaces`).
 *
 * FORMATO: acá NO hay plata en ninguna rama. El default de HubRow es 'ars' y
 * Object.assign copia undefined, así que TODA fila declara su `format`
 * ('plain' o 'unit' con días / horas / minutos / tarjetas / sesiones / %).
 *
 * POMODORO: las dos calculadoras que absorbe se pisaban entre sí y daban
 * resultados distintos para el mismo día. Se unifica en el algoritmo greedy
 * (el de tecnica-pomodoro-bloques-descanso-optimo), que es el único que
 * descuenta el descanso largo. Ver reporte.
 *
 * 10.000 HORAS: la regla de Gladwell está cuestionada por la investigación
 * posterior (Macnamara, Hambrick & Oswald 2014). La calculadora se conserva,
 * pero la rama y la FAQ dicen explícitamente que el número no es un umbral.
 */
export const hub: HubData = {
  slug: 'estudio/plan-de-estudio',
  title: '¿Cómo organizo el estudio para el examen? — Repaso espaciado, flashcards y pomodoro',
  description:
    'Armá tu calendario de repaso espaciado antes del examen, calculá cuánto vas a olvidar sin repasar, cuántas flashcards o tarjetas de Anki por día necesitás, cómo repartir los días entre parciales y cuántos pomodoros entran en tu jornada.',
  silo: 'Estudio',
  siloHref: '/estudio',

  eyebrow: 'Guía y calculadora de estudio',
  h1: '¿Cómo organizo el estudio para el examen?',
  lede:
    'Empezamos por lo que más cambia el resultado: cuándo repasar. El repaso espaciado —repasar pocas veces, cada vez más lejos en el tiempo— rinde bastante más que releer todo seguido. Si tu caso es otro —cuánto te vas a olvidar, cuántas flashcards por día, cómo repartir los días entre parciales, cuántos pomodoros entran o cuánto te falta para dominar algo— lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '8 cuentas de estudio adentro', 'Repaso espaciado, Anki y pomodoro'],

  resultLabel: 'Tu plan',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Elegí tu situación. Cada rama usa sus propios campos y el desglose te muestra exactamente qué entró en la cuenta. Los campos que le sobran a tu rama quedan ahí sin molestar.',
    items: [
      {
        id: 'repaso',
        label: 'Cuándo repasar antes del examen',
        hint: 'Ej.: "el examen es en 30 días, ¿qué días repaso?"',
        answer:
          'Repasás pocas veces con intervalos cada vez más largos, y el último repaso cae cerca del examen, no el día anterior.',
        yes: [
          'El hub reparte tus repasos entre el día 1 y un último repaso que cae poco antes del examen',
          'Los intervalos crecen: el primer hueco es de días y el último de semanas — eso es repaso espaciado',
          'El desglose te da la fecha relativa de cada repaso y cuántos días hay entre uno y otro',
          'El gráfico ubica cada repaso sobre la línea de días que te quedan hasta la fecha del examen',
        ],
        warn: [
          'Repasar no es releer: el efecto está en recuperar de memoria (taparlo y contarlo) antes de mirar el apunte',
          'Necesitás al menos 3 días hasta el examen para que el espaciado tenga sentido; con menos, esto es cramming y se olvida rápido',
          'Más de 5 repasos sobre el mismo material suele ser tiempo mal invertido: mejor sumar material nuevo o práctica de examen',
        ],
        plazo:
          'el último repaso conviene que caiga 1 a 3 días antes del examen, no la noche anterior: la consolidación necesita al menos una noche de sueño.',
      },
      {
        id: 'olvido',
        label: 'Cuánto me voy a olvidar si no repaso',
        hint: 'Ej.: "estudié ayer, ¿cuánto me queda hoy?"',
        answer:
          'Sin repasar, la retención cae fuerte en las primeras horas y después se aplana. Cada repaso levanta la curva entera.',
        yes: [
          'Modelo de potencias calibrado con los datos originales de Ebbinghaus (1885): R = e^(−a × t^b), con a = 0,7284 y b = 0,1276',
          'La curva NO es una exponencial simple: la caída es brutal al principio y muy lenta después',
          'Cada repaso bien hecho divide el coeficiente de decaimiento por 2 — o sea, duplica la estabilidad del recuerdo',
          'El desglose te compara tu retención actual con la que tendrías con un repaso más',
        ],
        warn: [
          'Los datos de Ebbinghaus son de sílabas sin sentido memorizadas por una sola persona: sobre material con significado la caída es más suave',
          'El porcentaje es una estimación de modelo, no una medición de tu memoria: sirve para decidir cuándo repasar, no para predecir tu nota',
          'Aun con la curva en el piso, reaprender es mucho más rápido que aprender de cero: es el "efecto de ahorro" que el propio Ebbinghaus midió',
        ],
        plazo:
          'la ventana barata es antes de que caigas del 60%: repasar ahí cuesta minutos, repasar en el 20% cuesta casi lo mismo que estudiar de nuevo.',
      },
      {
        id: 'flashcards',
        label: 'Cuántas flashcards por día para llegar al examen',
        hint: 'Ej.: "3.000 tarjetas en 12 meses, ¿me da el tiempo?"',
        answer:
          'Dividís el total de tarjetas por los días de plazo y chequeás si los repasos que genera entran en tus minutos diarios.',
        yes: [
          'Tarjetas nuevas por día = total ÷ (meses × 30,42), redondeado hacia arriba',
          'Modelo de carga de esta rama: cada tarjeta nueva genera unos 10 repasos, a 10 segundos cada uno',
          'El resultado principal son los minutos diarios que te va a demandar el mazo en régimen',
          'El desglose te dice si el plan entra cómodo, entra ajustado o directamente no entra en tu tiempo',
        ],
        warn: [
          'El número que importa no es cuántas creás sino cuántas vas a repasar: los repasos son 10 veces las nuevas',
          'Este modelo es más conservador que el de la rama de Anki (10 repasos por tarjeta contra 8, y no cuenta el tiempo de crear la tarjeta): comparalas antes de decidir',
          'Si te salteás días, el backlog no desaparece: se acumula y al volver te encontrás con el doble de repasos',
        ],
        plazo:
          'chequeo: si los minutos requeridos superan el 80% de los que tenés, estás sin margen para un día malo.',
      },
      {
        id: 'anki',
        label: 'Cuántas tarjetas de Anki por día para aprender X palabras',
        hint: 'Ej.: "1.000 palabras de inglés en 6 meses"',
        answer:
          'Dividís el objetivo por los días y sumás el tiempo de las cards nuevas más el de los repasos en régimen.',
        yes: [
          'Cards nuevas por día = objetivo ÷ (meses × 30)',
          'Modelo de tiempo de esta rama: 25 segundos por card nueva y 10 por repaso, con unos 8 repasos por card (SM-2 / FSRS a 90% de retención)',
          'El desglose te separa el tiempo de las nuevas del tiempo de los repasos, que es el que se come el día',
          'Referencias de ritmo: hasta 20 nuevas/día es cómodo, hasta 35 es exigente, más de 35 te explota el backlog',
        ],
        warn: [
          'La cantidad de repasos por card depende de tu tasa de aciertos: si te olvidás seguido, cada card genera muchos más de 8',
          'Aprender una palabra no es una card: vocabulario serio suele usar 2 o 3 (reconocimiento, producción, audio)',
          'El régimen no arranca el día 1: los repasos se acumulan durante las primeras semanas hasta estabilizarse',
        ],
        plazo:
          'chequeo: si el objetivo te exige más de 35 cards nuevas por día, estirá el plazo antes de arrancar, no después.',
      },
      {
        id: 'parciales',
        label: 'Cómo reparto los días entre parciales',
        hint: 'Ej.: "tres finales en dos semanas, ¿cuántas horas por día?"',
        answer:
          'Para cada materia dividís las horas que te lleva por los días que tenés, y sumás las cargas diarias.',
        yes: [
          'Horas por día de cada materia = horas totales de esa materia ÷ días que le dedicás',
          'Carga diaria total = la suma de las cargas de todas las materias que se superponen',
          'El desglose te da el detalle por materia y el total, y el gráfico te ubica en la franja de viabilidad',
          'Referencias: hasta 4 h/día es cómodo, hasta 6 exigente, hasta 8 ajustado y más de 8 no se sostiene',
        ],
        warn: [
          'Las horas son de estudio efectivo, no de estar sentado: 6 h de silla suelen ser 3 o 4 h reales',
          'Esta cuenta asume que las materias se solapan en el calendario. Si van una después de otra, mirá la carga de cada tramo por separado',
          'Estimar las horas que te lleva una materia es la parte difícil y casi todo el mundo se queda corto: sumale un 20% de colchón',
        ],
        plazo:
          'si el total te da más de 8 h/día, el problema no es la agenda: es la cantidad de materias o la fecha.',
      },
      {
        id: 'pomodoro',
        label: 'Cuántos pomodoros entran en mi día',
        hint: 'Ej.: "tengo 8 horas, ¿cuánto foco real es eso?"',
        answer:
          'Metés bloques mientras entren, con descanso corto entre bloques y descanso largo cada cierta cantidad, y contás sólo el tiempo de foco.',
        yes: [
          'Algoritmo: se agrega un bloque mientras entre el descanso previo más el bloque; nunca va descanso después del último bloque',
          'El descanso es largo cuando el bloque anterior cerró un grupo (por defecto, cada 4 bloques)',
          'Foco real = cantidad de bloques × duración del bloque. La eficiencia es foco ÷ duración de la sesión',
          'Podés cambiar la duración del bloque y de los descansos: la técnica clásica de Cirillo usa 25 / 5 y un descanso largo cada 4',
        ],
        warn: [
          'Por encima de unas 4 horas de foco real en una sola sentada el rendimiento cae: repartilo en dos sesiones',
          'El pomodoro cuenta tiempo, no aprendizaje: 12 pomodoros releyendo rinden menos que 6 haciendo ejercicios',
          'El bloque de 25 minutos es una convención de la técnica, no un óptimo medido: si tu tarea necesita 50, usá 50',
        ],
        plazo:
          'la regla práctica es no pasar de 10 bloques por día si querés sostenerlo toda la semana.',
      },
      {
        id: 'calentamiento',
        label: 'Cuántos minutos de calentamiento antes de arrancar',
        hint: 'Ej.: "hace 5 horas que no estudio, ¿cuánto tardo en entrar?"',
        answer:
          'Una rampa de arranque proporcional al tipo de tarea y a cuánto hace que la dejaste. Es una heurística, no un dato medido.',
        yes: [
          'Minutos = base de la tarea + minutos por hora sin estudiar × horas desde la última sesión (tope 6 horas)',
          'Bases: memorización 5 min, razonamiento 15, escritura 20, programación 20',
          'Incremento por hora de corte: memorización 2 min, razonamiento y escritura 5, programación 8',
          'El desglose te propone con qué arrancar según la tarea: flashcards fáciles, problemas de nivel previo, releer lo de ayer',
        ],
        warn: [
          'Ojo: estos números son una heurística de productividad, no una constante medida en un estudio. Tomalos como punto de partida y ajustalos con tu experiencia',
          'Lo que sí está documentado es que cambiar de tarea deja "residuo de atención" y que volver al foco cuesta tiempo (Leroy, 2009): la magnitud exacta varía muchísimo por persona y tarea',
          'Si el calentamiento te da más largo que la sesión, el problema es que la sesión es demasiado corta',
        ],
        plazo:
          'el calentamiento no es tiempo perdido, pero tampoco es estudio: contalo aparte de tus horas de la rama de parciales.',
      },
      {
        id: 'maestria',
        label: 'Cuánto me falta para dominar algo (las 10.000 horas)',
        hint: 'Ej.: "practico 10 h por semana, ¿cuánto tardo?"',
        answer:
          'Dividís las horas que faltan por las que hacés al año. Pero el número 10.000 no es un umbral real: la investigación posterior lo desmintió.',
        yes: [
          'Horas al año = horas por semana × semanas por año',
          'Años hasta 10.000 horas = 10.000 ÷ horas al año',
          'Si cargás las horas que ya llevás, el hub también te dice cuánto te falta desde donde estás',
          'Lo que sí sostiene la evidencia es que importa la práctica deliberada —con objetivo, dificultad justa y feedback inmediato—, no las horas en bruto',
        ],
        warn: [
          'La "regla de las 10.000 horas" es una simplificación periodística de Gladwell (2008) sobre un estudio de Ericsson: era el promedio de un grupo de violinistas, no un umbral que haya que alcanzar',
          'Macnamara, Hambrick y Oswald (2014) revisaron 88 estudios: la práctica deliberada explica alrededor del 12% de la varianza en el rendimiento, y mucho menos en ámbitos poco estructurados como la educación o las profesiones',
          'El propio Ericsson objetó públicamente la lectura de Gladwell: nunca propuso un número mágico ni afirmó que cualquiera llegue a experto sumando horas',
          'Usá este número como escala de magnitud de un proyecto largo, no como una meta ni como un diagnóstico de tu talento',
        ],
        plazo:
          'chequeo útil: si a tu ritmo actual te dan más de 20 años, el plan no es el problema — es la definición del objetivo.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Cada rama usa sólo los campos que le tocan. El objetivo, el plazo en meses y los minutos por día los comparten las dos ramas de tarjetas, para que puedas ver de una la diferencia entre los dos modelos de tiempo.',
  fields: [
    { id: 'diasHastaExamen', label: 'Días que faltan para el examen', type: 'number', min: 3, max: 730, value: 30, help: 'Mínimo 3: con menos, el espaciado no llega a hacer efecto.' },
    { id: 'cantidadRepasos', label: 'Cuántos repasos querés hacer', type: 'number', min: 2, max: 5, value: 4 },

    { id: 'horasDesdeEstudio', label: 'Horas desde que estudiaste', type: 'number', min: 0, max: 8760, value: 24, help: 'Rama de la curva del olvido. Un día son 24; una semana, 168.' },
    { id: 'repasosHechos', label: 'Repasos que ya hiciste de ese material', type: 'number', min: 0, max: 10, value: 0 },

    { id: 'objetivo', label: 'Tarjetas o palabras que querés cubrir', type: 'number', min: 1, value: 1500, thousands: true, help: 'Lo usan las dos ramas de tarjetas: el mazo entero (flashcards) o el vocabulario objetivo (Anki).' },
    { id: 'plazoMeses', label: 'Meses de plazo', type: 'number', min: 1, max: 120, value: 6 },
    { id: 'minutosDia', label: 'Minutos por día que le podés dedicar', type: 'number', min: 1, max: 600, value: 30 },

    { id: 'horas1', label: 'Materia 1 — horas totales que te lleva', type: 'number', min: 0, value: 20 },
    { id: 'dias1', label: 'Materia 1 — días que le vas a dedicar', type: 'number', min: 0, value: 5 },
    { id: 'horas2', label: 'Materia 2 — horas totales', type: 'number', min: 0, value: 15 },
    { id: 'dias2', label: 'Materia 2 — días', type: 'number', min: 0, value: 4 },
    { id: 'horas3', label: 'Materia 3 — horas totales', type: 'number', min: 0, value: 0, help: 'Dejalo en 0 si sólo tenés dos materias.' },
    { id: 'dias3', label: 'Materia 3 — días', type: 'number', min: 0, value: 0 },

    { id: 'horasDisponibles', label: 'Horas disponibles para la sesión de pomodoros', type: 'number', min: 0.5, max: 16, step: 0.5, value: 8 },
    { id: 'duracionBloque', label: 'Duración del bloque de foco', type: 'number', min: 5, max: 120, suffix: 'min', value: 25 },
    { id: 'descansoCorto', label: 'Descanso corto', type: 'number', min: 1, max: 30, suffix: 'min', value: 5 },
    { id: 'descansoLargo', label: 'Descanso largo', type: 'number', min: 5, max: 60, suffix: 'min', value: 20 },
    { id: 'cadaCuantos', label: 'Descanso largo cada cuántos bloques', type: 'number', min: 2, max: 10, value: 4 },

    {
      id: 'tipoTarea',
      label: 'Tipo de tarea (para el calentamiento)',
      type: 'select',
      value: 'razonamiento',
      options: [
        { value: 'memorizacion', label: 'Memorización — flashcards, vocabulario' },
        { value: 'razonamiento', label: 'Razonamiento — problemas, ejercicios' },
        { value: 'escritura', label: 'Escritura — monografía, tesis, informe' },
        { value: 'programacion', label: 'Programación — código, debugging' },
      ],
    },
    { id: 'horasDesde', label: 'Horas desde tu última sesión de esa tarea', type: 'number', min: 0, max: 72, value: 3 },

    { id: 'horasSemana', label: 'Horas de práctica por semana', type: 'number', min: 0.1, max: 100, step: 0.5, value: 10 },
    { id: 'semanasAno', label: 'Semanas de práctica por año', type: 'number', min: 1, max: 52, value: 50 },
    { id: 'horasAcumuladas', label: 'Horas que ya llevás practicadas', type: 'number', min: 0, value: 0, thousands: true },
  ],
  fineprint:
    'Los porcentajes de retención salen de un modelo calibrado con los datos de Ebbinghaus (1885) sobre sílabas sin sentido: sirven para decidir cuándo repasar, no para predecir una nota. Los tiempos por tarjeta, los minutos de calentamiento y los umbrales de viabilidad son promedios de referencia y varían mucho por persona y por material. La cifra de 10.000 horas se muestra porque la gente la busca, pero no es un umbral validado: mirá la rama y la FAQ.',

  chart: {
    type: 'timeline',
    title: 'Dónde caés',
    caption:
      'La barra ubica tu resultado sobre la escala que corresponde a cada rama: los días hasta el examen en la del calendario de repaso, el porcentaje retenido en la curva del olvido, los minutos o tarjetas por día en las de flashcards, las horas diarias en la de parciales y las horas acumuladas en la de las 10.000. Lo que hay que leer es la franja, no el número: la diferencia entre "entra ajustado" y "no entra" define si el plan sobrevive a un día malo.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero los datos que entraron, después la cuenta, y al final los chequeos y las referencias. En la rama del calendario de repaso, cada fila es un repaso con el día en que cae y el hueco que lo separa del anterior.',

  faq: [
    {
      q: '¿Cuándo conviene repasar antes de un examen?',
      a: 'Con intervalos <b>crecientes</b>, no todos los días iguales. Para un examen a 30 días y 4 repasos, un reparto razonable es día 1, día 6, día 15 y día 27: los huecos crecen de 5 a 12 días y el último repaso cae 3 días antes del examen. La idea es repasar justo cuando el recuerdo está empezando a fallar: si repasás demasiado seguido, el repaso casi no aporta.',
    },
    {
      q: '¿Qué es el repaso espaciado y por qué funciona?',
      a: 'Es distribuir las sesiones de repaso en el tiempo en vez de amontonarlas. La revisión de Cepeda y colegas (2006), sobre más de 250 experimentos, encontró que estudiar el mismo material en sesiones separadas rinde consistentemente más que hacerlo de corrido, y que el intervalo óptimo crece con el tiempo que tiene que durar el recuerdo. Es uno de los efectos más replicados de la psicología del aprendizaje.',
    },
    {
      q: '¿Cuánto me olvido de lo que estudié en un día?',
      a: 'Según el modelo calibrado con los datos de Ebbinghaus, sin ningún repaso a las 24 horas se retiene alrededor del <b>34%</b> y a la semana cerca del <b>25%</b>. La caída más fuerte es en las primeras horas y después la curva se aplana. Con un repaso bien hecho la curva entera se levanta: el coeficiente de decaimiento se divide a la mitad.',
    },
    {
      q: '¿Qué es la curva del olvido de Ebbinghaus?',
      a: 'Hermann Ebbinghaus midió sobre sí mismo, en 1885, cuánto retenía de listas de sílabas sin sentido a distintos intervalos. El resultado es una curva que cae abruptamente al principio y después se aplana. El hub la modela como R = e^(−a × t^b) con a = 0,7284 y b = 0,1276, que reproduce los valores empíricos originales. Ojo: eran sílabas sin sentido y un solo sujeto — sobre material con significado el olvido es más lento.',
    },
    {
      q: '¿Cuántas flashcards nuevas por día tengo que hacer?',
      a: 'Dividí el total por los días de plazo. Para 1.500 tarjetas en 6 meses son unos 182 días, o sea <b>9 tarjetas nuevas por día</b>. Lo que define si el plan es viable no son las nuevas sino los repasos que generan: con el modelo conservador de esta página, esas 9 nuevas se convierten en unos 90 repasos diarios y unos 15 minutos de estudio en régimen.',
    },
    {
      q: '¿Por qué las dos ramas de tarjetas me dan tiempos distintos?',
      a: 'Porque usan dos modelos de carga distintos, y esto es a propósito. La rama de <b>flashcards</b> asume 10 repasos por tarjeta a 10 segundos cada uno y no cuenta el tiempo de crear la tarjeta. La rama de <b>Anki</b> asume 8 repasos por card a 10 segundos, más 25 segundos por card nueva. La primera es más conservadora en repasos, la segunda suma el costo de las nuevas. La verdad depende de tu tasa de aciertos: si te olvidás seguido, tus repasos por card van a ser más de 10.',
    },
    {
      q: '¿Cuántas cards nuevas por día aguanta Anki sin que se acumulen los repasos?',
      a: 'Como referencia práctica: hasta <b>20 nuevas por día</b> es un ritmo cómodo, hasta 35 es exigente pero sostenible si sos constante, y por encima de 35 el backlog de repasos se vuelve inmanejable para casi cualquiera. Recordá que el volumen de repasos se estabiliza recién después de varias semanas, así que la primera semana engaña: parece fácil.',
    },
    {
      q: '¿Cuántas horas por día tengo que estudiar en la semana de finales?',
      a: 'Sumá, para cada materia, sus horas totales divididas por los días que le dedicás. Con una materia de 20 horas en 5 días (4 h/día) y otra de 15 en 4 días (3,75 h/día) el total es <b>7,8 h/día</b>: plan ajustado, sostenible sólo con buena organización. Hasta 4 h/día es cómodo, hasta 6 exigente, hasta 8 ajustado y por encima de 8 no se sostiene más de un par de días.',
    },
    {
      q: '¿Cuántos pomodoros entran en 8 horas?',
      a: 'Con la configuración clásica —bloques de 25 minutos, 5 de descanso corto, 20 de descanso largo cada 4 bloques— en 480 minutos entran <b>14 pomodoros</b>, que son 5 h 50 min de foco real sobre una sesión de 7 h 40 min: un 76% de eficiencia. Si contás sólo bloque + descanso corto, sin descontar los descansos largos, te da 16: por eso hay calculadoras que dan un número más alto. La cuenta correcta descuenta los descansos largos y no pone descanso después del último bloque.',
    },
    {
      q: '¿Cuánto descanso corresponde entre pomodoros?',
      a: 'La técnica original de Francesco Cirillo usa 5 minutos entre bloques y un descanso largo de 15 a 30 minutos cada 4 bloques. Los números son una convención de la técnica, no un óptimo medido: lo importante es que el descanso corto sea corto de verdad (si mirás el celular 15 minutos, perdés el arranque) y que el largo alcance para despegarte del escritorio.',
    },
    {
      q: '¿Cuánto tardo en entrar en foco cuando arranco a estudiar?',
      a: 'Depende del tipo de tarea y de cuánto hace que la dejaste. Como <b>heurística</b>, esta página propone entre 5 y 20 minutos de base según la tarea, más 2 a 8 minutos por cada hora sin tocarla. No es una constante medida: lo que sí está documentado es que cambiar de tarea deja "residuo de atención" y que volver a entrar cuesta tiempo. Tomalo como una rampa sugerida, no como un dato duro.',
    },
    {
      q: '¿Es cierta la regla de las 10.000 horas?',
      a: 'No como se la cuenta. Gladwell la popularizó en 2008 a partir de un estudio de Ericsson sobre violinistas, donde 10.000 horas era el <b>promedio acumulado</b> del grupo más avanzado, no un umbral. El metaanálisis de Macnamara, Hambrick y Oswald (2014), sobre 88 estudios, encontró que la práctica deliberada explica alrededor del 12% de la varianza en el rendimiento —26% en juegos, 21% en música, 18% en deportes y sólo 4% en educación—. El propio Ericsson objetó públicamente la versión de Gladwell. La calculadora sigue acá porque la escala de magnitud sirve para dimensionar un proyecto largo, pero el número no es una meta.',
    },
    {
      q: '¿Qué es la práctica deliberada y en qué se diferencia de practicar mucho?',
      a: 'La práctica deliberada tiene objetivo explícito, dificultad apenas por encima de tu nivel actual, feedback inmediato y repetición del punto flojo, no del conjunto. Tocar la misma pieza que ya te sale, o releer el apunte, es repetición pasiva: suma horas y casi no suma habilidad. Es la diferencia entre 200 horas que mueven la aguja y 2.000 que no.',
    },
    {
      q: '¿Sirve más releer o hacerse preguntas?',
      a: 'Hacerse preguntas, y por bastante. Recuperar la información de memoria —taparlo y contarlo, autoevaluarse, hacer ejercicios sin mirar— produce recuerdos más duraderos que releer, aunque releer <i>se sienta</i> más productivo porque el material resulta familiar. Esa sensación de fluidez es justamente la trampa. Combinado con repaso espaciado, es la base de cómo funcionan Anki y cualquier sistema de flashcards.',
    },
  ],

  sources: [
    {
      name: 'Über das Gedächtnis (Memory: A Contribution to Experimental Psychology) — la curva del olvido original',
      url: 'https://psychclassics.yorku.ca/Ebbinghaus/index.htm',
      publisher: 'Hermann Ebbinghaus (1885) — Classics in the History of Psychology',
      date: '1885',
    },
    {
      name: 'Distributed practice in verbal recall tasks: A review and quantitative synthesis',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16719566/',
      publisher: 'Cepeda, Pashler, Vul, Wixted & Rohrer — Psychological Bulletin 132(3)',
      date: '2006',
    },
    {
      name: 'The Anki manual — algoritmo de repaso espaciado (SM-2 y FSRS), cargas diarias y backlog',
      url: 'https://docs.ankiweb.net/studying.html',
      publisher: 'Anki',
    },
    {
      name: 'SuperMemo 2: el algoritmo SM-2 de repetición espaciada, descripción original',
      url: 'https://super-memory.com/english/ol/sm2.htm',
      publisher: 'Piotr Woźniak — SuperMemo',
    },
    {
      name: 'Deliberate Practice and Performance in Music, Games, Sports, Education, and Professions: A Meta-Analysis',
      url: 'https://journals.sagepub.com/doi/10.1177/0956797614535810',
      publisher: 'Macnamara, Hambrick & Oswald — Psychological Science 25(8)',
      date: '2014',
    },
    {
      name: 'The Pomodoro Technique — la técnica original, bloques y descansos',
      url: 'https://francescocirillo.com/products/the-pomodoro-technique',
      publisher: 'Francesco Cirillo',
    },
    {
      name: 'Why is it so hard to do my work? The challenge of attention residue when switching between work tasks',
      url: 'https://www.sciencedirect.com/science/article/abs/pii/S0749597809000399',
      publisher: 'Sophie Leroy — Organizational Behavior and Human Decision Processes 109(2)',
      date: '2009',
    },
  ],

  replaces: [
    '/calculadora-repaso-optimo-examen',
    '/calculadora-ebbinghaus-curva-olvido',
    '/calculadora-flashcards-por-dia',
    '/calculadora-anki-flashcards-dia-aprender-palabras',
    '/calculadora-calendario-estudio-parciales',
    // Las dos de pomodoro se pisaban entre sí: una sola rama con el algoritmo
    // correcto (el greedy que descuenta el descanso largo). Ver reporte.
    '/calculadora-productividad-pomodoro-sesiones-dia-efectivas',
    '/calculadora-tecnica-pomodoro-bloques-descanso-optimo',
    // Heurística sin respaldo publicado. Se conserva como rama, pero la rama lo
    // dice de frente en vez de vender el número como medido. Ver reporte.
    '/calculadora-calentamiento-estudio-minutos',
    '/calculadora-horas-practica-10000-maestria-gladwell',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
