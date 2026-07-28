import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto tardo en leer esto?"
 * Arquetipo RAMIFICADO: 7 ramas = las 7 formas en que alguien llega a preguntar
 * cuánto tiempo le va a llevar un texto. Absorbe 7 URLs (ver `replaces`).
 *
 * Vive en /estudio y no en /vida porque la pregunta casi siempre aparece en
 * contexto académico: un apunte, un final, un paper. La rama de libro por placer
 * es la puerta de entrada; las de estudio son las que resuelven algo.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars', así que
 * TODA fila declara su formato: 'plain' para cantidades, 'unit' para minutos,
 * horas, páginas, palabras, PPM y porcentajes.
 *
 * PALABRAS POR PÁGINA: las calculadoras absorbidas usaban constantes distintas
 * para lo mismo (250 en una, 270 de referencia en otra, 350–450 para texto
 * académico). El hub lo resuelve con un desplegable de tipo de página en vez de
 * una constante escondida. Ver reporte.
 *
 * ESCALA ÚNICA: las siete ramas terminan posicionadas en la MISMA escala de
 * palabras por minuto, incluidas las de escucha y traducción. Es lo que vuelve
 * comparable "leo a 250 PPM" con "traduzco a 8 PPM".
 */

export const hub: HubData = {
  slug: 'estudio/cuanto-tardo-en-leer',
  title: '¿Cuánto tardo en leer esto? — Libro, apunte, examen y velocidad en PPM',
  description:
    'Calculá cuánto tiempo te lleva leer un libro o un apunte según tus palabras por minuto, medí tu velocidad real de lectura, estimá las horas de estudio que te pide un examen y convertí comprensión, escucha y traducción a la misma escala de PPM.',
  silo: 'Estudio',
  siloHref: '/estudio',

  eyebrow: 'Guía y calculadora de estudio',
  h1: '¿Cuánto tardo en leer esto?',
  lede:
    'Arrancamos por lo más pedido: cuánto te lleva terminar un libro con tu velocidad de lectura. Si tu caso es otro —medir tu velocidad real, calcular un apunte, planificar un final, ajustar por comprensión, seguir un audio en otro idioma o traducir— lo cambiás abajo.',
  stamps: [
    'Actualizado 27-07-2026',
    '7 cuentas de lectura y estudio adentro',
    'Escala PPM basada en Brysbaert (2019)',
  ],

  resultLabel: 'Cuánto te lleva',

  cases: {
    title: '¿Qué texto tenés adelante?',
    intro:
      'Elegí tu situación. Los campos que usa cada rama cambian, y el desglose te muestra exactamente qué entró en la cuenta. Todas las ramas terminan ubicándote en la misma escala de palabras por minuto.',
    items: [
      {
        id: 'libro',
        label: 'Cuánto tardo en leer un libro',
        hint: 'Ej.: "una novela de 350 páginas, ¿cuántas horas son?"',
        answer: 'Dividís las palabras totales del libro por tu velocidad en palabras por minuto.',
        yes: [
          'Fórmula: minutos = palabras totales ÷ PPM',
          'Si no sabés las palabras exactas, dejá el campo en 0 y el hub las estima como páginas × palabras por página del tipo de texto que elijas',
          'El desglose te pasa el total a horas, a sesiones de 30 minutos y a semanas leyendo una sesión por día',
          'Si no sabés tu velocidad, 250 PPM es el valor de referencia para un adulto en lectura silenciosa',
        ],
        warn: [
          'Es tiempo puro de lectura: no incluye subrayar, buscar palabras ni releer un párrafo que se te escapó',
          'Las palabras por página varían muchísimo: una novela ronda 250–300 y un paper a doble columna puede pasar de 450. Elegí bien el tipo de página',
          'Tu velocidad real baja con el texto denso: un ensayo técnico te rinde entre el 50% y el 70% de tu PPM de ficción',
        ],
        plazo: 'atajo: 90.000 palabras (novela promedio) a 250 PPM son 6 horas de lectura neta.',
      },
      {
        id: 'velocidad',
        label: 'Cuál es mi velocidad real en PPM',
        hint: 'Ej.: "leí 1.000 palabras en 5 minutos"',
        answer: 'Dividís las palabras que leíste por los minutos que tardaste.',
        yes: [
          'Fórmula: PPM = palabras leídas ÷ minutos que tardaste',
          'Medí con un fragmento real del material que vas a leer, no con un texto fácil de prueba',
          'El desglose te traduce el resultado a palabras por hora, páginas por hora y minutos por página',
          'La mediana de un adulto en lectura silenciosa es de unas 238 palabras por minuto',
        ],
        warn: [
          'Medir la velocidad sin medir la comprensión no sirve: usá después la rama de comprensión lectora',
          'En español las palabras son más largas que en inglés, así que la misma persona suele rendir un 10–15% menos de PPM que las cifras publicadas en inglés',
          'Un solo fragmento tiene mucho ruido: promediá tres mediciones de textos parecidos',
        ],
        plazo: 'chequeo: si te dio más de 500 PPM, verificá comprensión antes de creerle al número.',
      },
      {
        id: 'apunte',
        label: 'Cuánto me lleva leer y ESTUDIAR un apunte',
        hint: 'Ej.: "80 páginas de fotocopias para el parcial"',
        answer: 'Primero calculás la lectura pura y después la multiplicás por el trabajo de estudiar de verdad.',
        yes: [
          'Lectura pura: minutos = páginas × minutos por página',
          'Estudiar no es leer: hay subrayado, resumen, toma de notas y repaso. El hub multiplica la lectura por un factor según la dificultad del texto',
          'El desglose te parte el total en sesiones de 45 minutos, que es el bloque con el que trabajan casi todos los métodos de estudio',
          'También te muestra tu velocidad implícita en PPM para que veas si el ritmo que asumiste es realista',
        ],
        warn: [
          'El factor de estudio es una estimación de planificación, no una medición: ajustalo con tu propia experiencia después del primer parcial',
          'Si el apunte tiene ejercicios o demostraciones, la cuenta se queda corta: resolver lleva mucho más que leer',
          'Leer de corrido cuatro horas rinde menos que cuatro bloques de 45 minutos separados: el total en horas no se puede juntar en una sentada',
        ],
        plazo: 'regla práctica: si te da más de 4 horas, ya no entra en un día, repartilo.',
      },
      {
        id: 'examen',
        label: 'Cuántas horas de estudio me pide este examen',
        hint: 'Ej.: "90 páginas de programa y rindo en dos semanas"',
        answer: 'Dividís las páginas del programa por las páginas que estudiás por hora y ajustás por dificultad.',
        yes: [
          'Fórmula base: horas = páginas del programa ÷ páginas por hora',
          'El hub ajusta esas horas por la dificultad del material: un paper denso no rinde lo mismo que un manual introductorio',
          'El desglose te dice en cuántos días llegás a dos horas diarias y cuántos días antes conviene arrancar',
          'Sumale siempre un día final sólo de repaso, sin material nuevo',
        ],
        warn: [
          'Si no sabés tus páginas por hora, medilas: 3 páginas por hora es el valor de referencia para material universitario, pero el rango real va de 1 a 10',
          'Las horas netas no son horas de reloj: entre pausas, arranques y distracciones, una jornada de estudio de 2 horas netas ocupa cerca de 3',
          'Este plan asume que el material ya está: conseguir apuntes, resúmenes y parciales viejos también come días',
        ],
        plazo: 'si te da más de 30 horas netas, no se resuelve en la semana previa: armá cronograma por temas.',
      },
      {
        id: 'comprension',
        label: 'Mi comprensión lectora y mi velocidad efectiva',
        hint: 'Ej.: "leo rápido pero no me acuerdo nada"',
        answer: 'Multiplicás tu velocidad por tu porcentaje de comprensión: eso es lo que de verdad estás leyendo.',
        yes: [
          'Score crudo = preguntas correctas ÷ preguntas totales × 100',
          'El score se ajusta por la dificultad del texto: acertar 8 de 10 en un paper denso vale más que en una novela',
          'Velocidad efectiva = tus PPM × tu comprensión. Es el número que importa para estudiar',
          'El desglose te compara la velocidad nominal con la efectiva y te dice cuántas palabras por minuto estás perdiendo',
        ],
        warn: [
          'Un test corto de 5 o 10 preguntas tiene mucho ruido: sirve para orientarte, no para diagnosticar nada',
          'Correr la velocidad sin mirar la comprensión es el error clásico: 600 PPM con 30% de comprensión rinden 180 PPM efectivas, menos que 250 PPM con 90%, que rinden 225',
          'Esto no es una evaluación de dificultades de aprendizaje ni un diagnóstico: si sospechás un problema de lectura, consultá con un profesional',
        ],
        plazo: 'chequeo: 4 aciertos sobre 5 preguntas sin releer es el piso de comprensión aceptable para ese ritmo.',
      },
      {
        id: 'dictado',
        label: 'Escuchar en otro idioma: a qué velocidad puedo seguir',
        hint: 'Ej.: "estoy en B1, ¿qué audios me sirven?"',
        answer: 'Tu nivel del MCER marca las palabras por minuto que podés seguir y cuántas veces necesitás escuchar.',
        yes: [
          'Cada nivel del MCER tiene una velocidad de referencia: A1 ≈ 75 PPM, B1 ≈ 115, C1 ≈ 175, C2 ≈ 200',
          'El hub te calcula cuánto dura un texto de N palabras dictado a esa velocidad y cuánto tiempo total te lleva con las reproducciones que necesita tu nivel',
          'La conversación nativa ronda 150–160 palabras por minuto: recién en C1 se sigue cómoda',
          'El desglose ubica tu nivel en la misma escala de PPM que las ramas de lectura, para que veas la distancia',
        ],
        warn: [
          'Escuchar es más lento que leer: no podés releer un audio, y el ritmo lo marca quien habla',
          'Las velocidades por nivel son de referencia pedagógica, no un estándar oficial del MCER: el marco describe competencias, no PPM',
          'El acento, el ruido de fondo y la densidad léxica pesan tanto como la velocidad: un audio lento con vocabulario técnico puede ser más difícil que uno rápido y coloquial',
        ],
        plazo: 'si necesitás más de 3 reproducciones para entender, el material está por encima de tu nivel.',
      },
      {
        id: 'traduccion',
        label: 'Cuánto tardo en traducir este texto',
        hint: 'Ej.: "5.000 palabras de un contrato"',
        answer: 'Dividís las palabras por el rendimiento por hora del tipo de texto que vas a traducir.',
        yes: [
          'Rendimientos de referencia: general 500 palabras/h, técnico 400, jurídico 300, literario 200',
          'El hub te da las horas del trabajo y las jornadas de 8 horas que ocupa',
          'El desglose te muestra el rendimiento diario y el equivalente en palabras por minuto, para comparar con leer',
          'Traducir rinde alrededor de 8 palabras por minuto: unas treinta veces más lento que leer las mismas palabras',
        ],
        warn: [
          'Estos números son de traducción humana sin herramientas: con memorias de traducción y material repetitivo el rendimiento sube mucho',
          'La revisión no está incluida: la norma profesional exige una segunda pasada por otra persona, y eso suma tiempo',
          'Nadie sostiene 8 horas netas de traducción por día durante semanas: para plazos largos calculá con 6 horas productivas',
        ],
        plazo: 'presupuestá con el rendimiento del texto más lento del lote, no con el promedio.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Cada rama usa los campos que necesita y deja los demás quietos. Las palabras del texto y tu velocidad en PPM son los dos campos que más ramas comparten.',
  fields: [
    {
      id: 'palabras',
      label: 'Palabras totales del texto',
      type: 'number',
      min: 0,
      max: 2000000,
      step: 1000,
      value: 90000,
      thousands: true,
      suffix: 'palabras',
      help: 'Si no tenés el dato, poné 0 y el hub lo estima con las páginas y el tipo de página de abajo. Una novela promedio ronda las 90.000.',
    },
    {
      id: 'paginas',
      label: 'Páginas del texto',
      type: 'number',
      min: 1,
      max: 5000,
      value: 340,
      suffix: 'páginas',
      help: 'Se usa para estimar las palabras cuando no las sabés, y en las ramas de apunte y examen.',
    },
    {
      id: 'tipoPagina',
      label: 'Tipo de página',
      type: 'select',
      value: 'novela',
      options: [
        { value: 'novela', label: 'Novela o ensayo (6×9", 12pt) — 270 palabras/página' },
        { value: 'noficcion', label: 'Autoayuda o negocios — 250 palabras/página' },
        { value: 'ebook', label: 'eBook con letra media — 245 palabras/página' },
        { value: 'a4', label: 'Word A4 12pt, interlineado 1,5 — 350 palabras/página' },
        { value: 'manual', label: 'Manual universitario o ensayo denso — 400 palabras/página' },
        { value: 'paper', label: 'Paper académico a doble columna, 10pt — 450 palabras/página' },
      ],
      help: 'Las calculadoras que este hub reemplaza usaban constantes distintas para lo mismo. Acá elegís vos.',
    },
    {
      id: 'ppm',
      label: 'Tu velocidad de lectura',
      type: 'number',
      min: 50,
      max: 1500,
      step: 10,
      value: 250,
      suffix: 'PPM',
      help: 'Si no la sabés, dejá 250. Para medirla de verdad usá la rama "Cuál es mi velocidad real".',
    },
    {
      id: 'palabrasTest',
      label: 'Palabras del fragmento que cronometraste',
      type: 'number',
      min: 1,
      max: 100000,
      value: 1000,
      suffix: 'palabras',
    },
    {
      id: 'minutosTest',
      label: 'Minutos que tardaste en ese fragmento',
      type: 'number',
      min: 0.1,
      max: 600,
      step: 0.1,
      value: 5,
      suffix: 'min',
    },
    {
      id: 'minutosPorPagina',
      label: 'Minutos que te lleva una página del apunte',
      type: 'number',
      min: 1,
      max: 30,
      value: 6,
      suffix: 'min/pág',
      help: 'Sólo la rama de apunte. 6 minutos por página es el valor de referencia para material universitario.',
    },
    {
      id: 'paginasPorHora',
      label: 'Páginas que estudiás por hora',
      type: 'number',
      min: 0.5,
      max: 10,
      step: 0.5,
      value: 3,
      suffix: 'pág/h',
      help: 'Sólo la rama de examen. Estudiar de verdad, no leer de corrido.',
    },
    {
      id: 'dificultad',
      label: 'Dificultad del texto',
      type: 'select',
      value: 'media',
      options: [
        { value: 'baja', label: 'Baja (ficción, divulgación popular)' },
        { value: 'media', label: 'Media (ensayo, texto universitario)' },
        { value: 'alta', label: 'Alta (paper académico, texto técnico denso)' },
      ],
    },
    { id: 'correctas', label: 'Preguntas que respondiste bien', type: 'number', min: 0, max: 100, value: 8 },
    { id: 'totales', label: 'Preguntas totales del test de comprensión', type: 'number', min: 1, max: 100, value: 10 },
    {
      id: 'nivel',
      label: 'Tu nivel del MCER en ese idioma',
      type: 'select',
      value: 'b1',
      options: [
        { value: 'a1', label: 'A1 — Principiante' },
        { value: 'a2', label: 'A2 — Elemental' },
        { value: 'b1', label: 'B1 — Intermedio' },
        { value: 'b2', label: 'B2 — Intermedio-alto' },
        { value: 'c1', label: 'C1 — Avanzado' },
        { value: 'c2', label: 'C2 — Maestría' },
      ],
    },
    {
      id: 'tipoTraduccion',
      label: 'Tipo de texto a traducir',
      type: 'select',
      value: 'general',
      options: [
        { value: 'general', label: 'General — 500 palabras/hora' },
        { value: 'tecnico', label: 'Técnico — 400 palabras/hora' },
        { value: 'juridico', label: 'Jurídico — 300 palabras/hora' },
        { value: 'literario', label: 'Literario — 200 palabras/hora' },
      ],
    },
  ],
  fineprint:
    'Todos los resultados son estimaciones de planificación. Las palabras por página, los rendimientos de traducción y las velocidades por nivel del MCER son valores de referencia y no estándares oficiales: tu ritmo real depende del texto, del idioma, del cansancio y del objetivo con el que leas. La rama de comprensión lectora es orientativa y no constituye una evaluación ni un diagnóstico de ningún tipo.',

  chart: {
    type: 'scale',
    title: 'Dónde caés en la escala de palabras por minuto',
    caption:
      'La barra ubica el ritmo de tu rama dentro de la escala de palabras por minuto, con la mediana del adulto en lectura silenciosa (unas 238 PPM) en el medio de la franja "promedio". Las siete ramas se convierten a la misma unidad a propósito: así se ve de una que estudiar un apunte va a unas 60 PPM efectivas y traducir a menos de 10, mientras que leer una novela va a 250. La franja de arriba de 500 está marcada como skimming porque a esa velocidad la comprensión cae: no es una meta.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso: primero los datos que entraron, después la división principal, y al final las conversiones útiles (horas, sesiones, días, PPM equivalentes) para que puedas planificar sin volver a calcular.',

  faq: [
    {
      q: '¿Cuánto tardo en leer un libro de 300 páginas?',
      a: 'Con 270 palabras por página, 300 páginas son unas <b>81.000 palabras</b>. A 250 PPM (la velocidad de referencia de un adulto) eso da <b>324 minutos</b>, o sea <b>5 horas y 24 minutos</b> de lectura neta. Leyendo media hora por día lo terminás en unas 11 sesiones, poco menos de dos semanas.',
    },
    {
      q: '¿A cuántas palabras por minuto lee un adulto promedio?',
      a: 'El meta-análisis de Brysbaert (2019), que revisó cientos de estudios de velocidad de lectura, ubica la <b>mediana en unas 238 palabras por minuto</b> en lectura silenciosa de textos no técnicos en lengua materna, con un rango habitual de 175 a 300. Leer en voz alta es más lento (alrededor de 180) y leer para estudiar, mucho más lento todavía.',
    },
    {
      q: '¿Es cierto que se puede leer a 1.000 palabras por minuto?',
      a: 'No con comprensión real. La revisión de Rayner y colegas (2016) sobre lectura rápida concluye que <b>no hay evidencia de que se pueda leer mucho más rápido que unas 500 PPM sin perder comprensión</b>: el límite lo pone el ojo, que necesita fijarse en el texto, y no la técnica. Lo que enseñan los cursos de speed reading arriba de ese umbral es <b>skimming</b>, que es una habilidad útil y distinta: sirve para decidir qué leer, no para estudiarlo. Si una calculadora te promete 1.000 PPM con comprensión, te está vendiendo humo.',
    },
    {
      q: '¿Cuántas palabras tiene una página?',
      a: 'Depende del formato, y por eso este hub te lo hace elegir en vez de esconder una constante. Referencias: <b>novela o ensayo</b> (6×9", 12pt) 250–300, con 270 como valor habitual; <b>eBook</b> con letra media 220–270; <b>Word A4</b> a 12pt e interlineado 1,5 unas 350; <b>manual universitario</b> denso alrededor de 400; <b>paper académico</b> a doble columna y 10pt entre 350 y 450.',
    },
    {
      q: '¿Cuánto tiempo me lleva estudiar 80 páginas?',
      a: 'Leerlas y estudiarlas son dos cosas distintas. A 6 minutos por página, <b>leer</b> 80 páginas son 480 minutos (8 horas). <b>Estudiarlas</b> —con subrayado, resumen, notas y repaso— lleva del doble al quíntuple según la densidad del material: para texto universitario de dificultad media, el hub estima unas <b>26 horas</b>. Es la diferencia entre pasar los ojos y poder rendir.',
    },
    {
      q: '¿Cuántas páginas por hora se estudian?',
      a: 'Para material universitario el valor de referencia son <b>3 páginas por hora</b> de estudio efectivo, con un rango real que va de 1 (matemática, demostraciones, papers densos) a 10 (divulgación, material que ya conocés). No lo adivines: cronometrá una hora real sobre tu propio apunte y usá ese número, que es el único que te sirve para planificar.',
    },
    {
      q: '¿Para qué sirve saber mi velocidad efectiva de lectura?',
      a: 'Porque la velocidad sola no dice nada. La <b>velocidad efectiva</b> es tus PPM multiplicados por tu porcentaje de comprensión: alguien que lee a 600 PPM con 30% de comprensión rinde <b>180 PPM efectivas</b>, menos que alguien que lee a 250 con 90%, que rinde <b>225</b> y además no tiene que releer todo. Cuando estudiás, el número que importa es el efectivo.',
    },
    {
      q: '¿Se lee más lento en español que en inglés?',
      a: 'En palabras por minuto, sí: las palabras del español son en promedio más largas, así que la misma persona con la misma comprensión suele registrar un <b>10 a 15% menos de PPM</b> que las cifras publicadas en inglés. Medido en caracteres o en información transmitida por minuto la diferencia prácticamente desaparece. Si comparás tu velocidad con una tabla en inglés, tenelo en cuenta.',
    },
    {
      q: '¿A qué velocidad tengo que escuchar audios para aprender un idioma?',
      a: 'Como referencia pedagógica: <b>A1 unas 75 palabras por minuto, A2 95, B1 115, B2 145, C1 175 y C2 200</b>. La conversación entre nativos ronda las 150–160, así que hasta B2 conviene material graduado. Ojo: el MCER describe competencias, no velocidades, así que estos números son orientaciones de material didáctico y no un estándar del marco.',
    },
    {
      q: '¿Cuántas palabras por hora traduce un traductor profesional?',
      a: 'Sin herramientas de memoria de traducción, los rendimientos habituales son <b>500 palabras/hora</b> para texto general, <b>400</b> técnico, <b>300</b> jurídico y <b>200</b> literario. En una jornada de 8 horas eso da entre 1.600 y 4.000 palabras, coherente con las 2.000–3.000 diarias que suelen manejar las guías profesionales. No incluye la revisión por un segundo traductor, que la norma de calidad exige.',
    },
    {
      q: '¿Por qué traducir es tanto más lento que leer?',
      a: 'Porque no es un proceso de lectura sino de lectura, comprensión, reformulación y control. En palabras por minuto: leer una novela va a unas 250 PPM y traducir texto general a unas <b>8 PPM</b>, treinta veces más lento. Verlo en la misma escala explica por qué un presupuesto de traducción se cuenta en días y una lectura en horas.',
    },
    {
      q: '¿Cómo mido bien mi velocidad de lectura?',
      a: 'Elegí un fragmento <b>del material real</b> que vas a leer (no un texto fácil de prueba), cronometrá, dividí las palabras por los minutos y después respondé 5 preguntas sobre el texto sin releerlo. Si acertás 4 o más, ese ritmo es sostenible para vos. Repetí la medición tres veces con textos parecidos y promediá: una sola toma tiene demasiado ruido.',
    },
  ],

  sources: [
    {
      name: 'How many words do we read per minute? A review and meta-analysis of reading rate',
      url: 'https://doi.org/10.1016/j.jml.2019.104047',
      publisher: 'Marc Brysbaert — Journal of Memory and Language',
      date: '2019',
    },
    {
      name: 'So Much to Read, So Little Time: How Do We Read, and Can Speed Reading Help?',
      url: 'https://journals.sagepub.com/doi/10.1177/1529100615623267',
      publisher: 'Rayner, Schotter, Masson, Potter & Treiman — Psychological Science in the Public Interest',
      date: '2016',
    },
    {
      name: 'Common European Framework of Reference for Languages (MCER) — descriptores de comprensión oral',
      url: 'https://www.coe.int/en/web/common-european-framework-reference-languages',
      publisher: 'Consejo de Europa',
    },
    {
      name: 'ISO 17100 — Translation services: requisitos de los servicios de traducción',
      url: 'https://www.iso.org/standard/59149.html',
      publisher: 'International Organization for Standardization',
    },
    {
      name: 'Translation: Getting it Right — guía sobre plazos y rendimiento de traducción',
      url: 'https://www.atanet.org/client-assistance/translation-getting-it-right/',
      publisher: 'American Translators Association',
    },
    {
      name: 'PISA — marco de evaluación de competencia lectora',
      url: 'https://www.oecd.org/en/about/programmes/pisa.html',
      publisher: 'OCDE',
    },
  ],

  replaces: [
    '/calculadora-leer-rapido-palabras-por-minuto-tiempo-libro',
    '/calculadora-lectura-velocidad-paginas-hora-wpm',
    '/calculadora-tiempo-lectura-paginas-estudio',
    '/calculadora-tiempo-estudio-examen-dificultad-paginas',
    '/calculadora-comprension-lectora-score',
    // Dictado y traducción no son "cuánto tardo en leer" en sentido literal,
    // pero la cuenta es la misma (palabras ÷ velocidad) y el hub las ubica en la
    // misma escala de PPM. Tienen rama propia. Ver reporte.
    '/calculadora-dictado-velocidad-palabras-escuchar-idioma',
    '/calculadora-velocidad-traduccion-palabras-hora-profesional',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
