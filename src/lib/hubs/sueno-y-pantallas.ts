import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántas horas de sueño y de pantalla deberíamos tener?"
 * Arquetipo: RAMIFICADO. La pregunta es siempre cuántas horas corresponden —
 * de sueño o de pantalla— y para quién: para mí o para mis hijos.
 *
 * CONTENIDO YMYL DE SALUD: el disclaimer de dominio 'health' de
 * src/lib/disclaimers.ts va literal en `fineprint` y como PRIMER `warn` de cada
 * rama. Nada de diagnósticos ni de indicaciones clínicas.
 *
 * PSQI: es un instrumento clínico validado (Buysse 1989). Acá se usa como
 * SCREENING ORIENTATIVO, nunca como diagnóstico de insomnio ni de apnea.
 * Cualquier copy futuro que diga "tenés insomnio" es un problema, no una mejora.
 *
 * DEEP WORK: el techo de ~4 h/día es una heurística del libro de Cal Newport,
 * no evidencia clínica. Está dicho así en la FAQ y no se presenta como norma.
 *
 * SOLAPAMIENTO CON /salud/habitos: ese hub cubre la pantalla del ADULTO por
 * fatiga visual (regla 20-20-20, pausas, ojo seco). Este cubre CUÁNTAS HORAS
 * de sueño y de pantalla corresponden por edad. El ángulo de fatiga visual se
 * linkea, no se repite.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay plata. Todas las filas declaran `format: 'unit'` (con su
 *    `unit`) o `format: 'plain'`. Una fila sin `format` cae a pesos.
 *  - `chart.type: 'scale'` = barra con franjas y marcador: cada rama devuelve
 *    `position` (0-100) y `positionLabel`.
 */
export const hub: HubData = {
  slug: 'salud/sueno-y-pantallas',
  title: '¿Cuántas horas de sueño y de pantalla deberíamos tener? — Guía por edad',
  description:
    'Cuántas horas de sueño corresponden a cada edad, cuánta pantalla es razonable para un chico y para un adulto, cuánto te comen las redes al año y qué dice tu puntaje PSQI de calidad de sueño. Cinco calculadoras en un solo lugar.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación de sueño y pantallas',
  h1: '¿Cuántas horas de sueño y de pantalla deberíamos tener?',
  lede:
    'Las dos preguntas van juntas: la pantalla de la noche se come el sueño y el sueño corto empuja a más pantalla al día siguiente. Partimos por las horas de sueño que corresponden a tu edad —o a la de tus hijos— y desde ahí pasás a la calidad del sueño, al tiempo de pantalla por edad, a las redes y al foco profundo.',
  stamps: ['Actualizado 27-07-2026', 'NSF · AASM · OMS · AAP', '5 calculadoras adentro'],

  resultLabel: 'Tus horas recomendadas',

  cases: {
    title: '¿Qué querés averiguar?',
    intro:
      'Partimos por las horas de sueño según la edad, que es la consulta más frecuente. Si venís por otra cosa, cambialo acá.',
    items: [
      {
        id: 'sueno-edad',
        label: 'Cuántas horas debería dormir (yo o mi hijo)',
        hint: 'El caso más común · por edad',
        answer:
          'Las horas de sueño recomendadas bajan con la edad: 14 a 17 en un recién nacido, 9 a 11 en edad escolar, 8 a 10 en la adolescencia y 7 a 9 en un adulto.',
        yes: [
          'Rango recomendado de horas de sueño por etapa (National Sleep Foundation, Hirshkowitz 2015)',
          'Rango ampliado "todavía aceptable" para quienes se salen del recomendado sin síntomas',
          'Diferencia entre lo que dormís hoy y el piso del rango: cuántas horas te faltan por día y por semana',
          'En bebés y niños chicos las horas incluyen las siestas, no sólo el sueño nocturno',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Los rangos son poblacionales: hay gente sana que rinde bien un poco por debajo o por encima. Lo que importa es cómo estás durante el día, no clavar el número',
          'Dormir de menos de forma sostenida en la infancia se asocia a problemas de atención, conducta y peso: no es sólo cansancio',
          'Si hay ronquido fuerte, pausas respiratorias, somnolencia diurna marcada o el chico duerme las horas y sigue agotado, eso se consulta con un profesional',
        ],
        plazo:
          'la deuda de sueño no se salda de una: hacen falta varias noches largas seguidas, y dormir de más el fin de semana no compensa la semana entera.',
      },
      {
        id: 'calidad',
        label: 'Duermo las horas pero descanso mal',
        hint: 'Screening PSQI · orientativo',
        answer:
          'El PSQI puntúa de 0 a 21: hasta 5 es buena calidad, de 6 a 10 pobre y más de 10 mala. Es un screening, no un diagnóstico.',
        yes: [
          'Puntaje PSQI simplificado sobre 21 puntos, sumando calidad subjetiva, latencia, duración, eficiencia, perturbaciones y disfunción diurna',
          'Eficiencia de sueño: horas efectivamente dormidas sobre horas en la cama',
          'Los seis componentes por separado, para ver cuál te está tirando el puntaje para abajo',
          'Corte clínico habitual: más de 5 puntos indica calidad de sueño deficiente',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El PSQI es un instrumento de tamizaje validado, no un diagnóstico: un puntaje alto no dice insomnio, apnea ni depresión, dice que conviene consultar',
          'Esta versión es simplificada y usa una sola pregunta por componente; el cuestionario original tiene 19 ítems y se autoadministra sobre el último mes',
          'Si el puntaje es alto y hay ronquido con pausas, piernas inquietas o despertares con ahogo, eso se evalúa con un profesional del sueño',
        ],
        plazo:
          'contestá pensando en el último mes, no en la noche de ayer: una mala noche suelta no mueve el instrumento.',
      },
      {
        id: 'pantalla-edad',
        label: 'Cuánta pantalla es razonable a esta edad',
        hint: 'Chicos y adultos · OMS y AAP',
        answer:
          'Antes de los 2 años la recomendación es cero pantalla; hasta los 5, una hora; de 6 a 12, una a dos; en la adolescencia, dos a tres, y en adultos, dos a cuatro horas de ocio.',
        yes: [
          'Máximo de pantalla de ocio recomendado por grupo etario (OMS para menores de 5, Academia Americana de Pediatría de ahí en adelante)',
          'Cuánto te pasás del máximo por día, por semana y en proporción al máximo',
          'El cálculo mira pantalla de ocio: la escuela o el trabajo en pantalla van aparte',
          'Comparación de tu uso contra las franjas de exceso leve y exceso alto',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La calidad y la compañía importan tanto como los minutos: media hora de video suelto y media hora mirando algo con un adulto que conversa no son lo mismo',
          'Las recomendaciones de la Academia Americana de Pediatría para mayores de 5 años se plantean como plan familiar de medios, no como un número rígido',
          'La videollamada con familia no cuenta como pantalla pasiva en menores de 2 años, y las tareas escolares en pantalla tampoco entran en el tope de ocio',
          'Si querés el ángulo de fatiga visual del adulto —pausas, regla 20-20-20 y ojo seco— eso está en el hub de hábitos, no acá',
        ],
        plazo:
          'la hora antes de dormir es la que más rinde recortar: la pantalla nocturna retrasa la melatonina y corre el horario de sueño.',
      },
      {
        id: 'redes',
        label: 'Cuánto tiempo me comen las redes',
        hint: 'Minutos por app · costo anual',
        answer:
          'Sumá los minutos diarios de cada app y multiplicá por 365: dos horas y media por día son 38 días completos de 24 horas al año.',
        yes: [
          'Suma de los minutos diarios de Instagram, TikTok, Twitter/X, YouTube y WhatsApp',
          'Conversión a horas por día, horas por año y días completos de 24 horas',
          'Equivalencias del mismo tiempo: libros de 7 horas, cursos de 40 horas y meses hacia un idioma nuevo (600 horas)',
          'Reparto por app, para ver cuál es la que realmente pesa',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Usá el dato real del "Tiempo de uso" de tu teléfono: casi todo el mundo subestima su propio uso cuando lo estima de memoria',
          'Las equivalencias son ilustrativas: el tiempo recortado de redes no se convierte solo en libros ni en cursos',
          'No todo el tiempo en redes es equivalente: hablar con gente que te importa no pesa igual que scrollear sin rumbo, aunque el reloj marque lo mismo',
        ],
        plazo:
          'medí una semana antes de decidir: un domingo de lluvia no representa tu uso habitual.',
      },
      {
        id: 'foco',
        label: 'Cuántas horas puedo trabajar concentrado',
        hint: 'Heurística de Cal Newport',
        answer:
          'La regla práctica del libro de Cal Newport es que ni los expertos sostienen más de unas 4 horas diarias de concentración profunda.',
        yes: [
          'Promedio de horas de trabajo profundo por día laboral: horas planificadas por semana dividido los días que trabajás',
          'Comparación contra el techo práctico de unas 4 horas diarias que propone Cal Newport',
          'Cuántos bloques de 90 minutos entran en tu promedio diario',
          'Total semanal de foco y cuánto margen te queda hasta el techo',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El techo de 4 horas es una heurística de un libro de divulgación, no una constante fisiológica medida: tomalo como referencia práctica, no como norma',
          'Si te da más de 4 horas diarias, lo más probable es que estés contando como foco profundo tiempo que en realidad es multitasking',
          'Dormir mal recorta el foco antes que cualquier técnica de productividad: la palanca más grande sigue siendo el sueño',
        ],
        plazo:
          'el hábito se construye de a poco: arrancá con bloques de 60 a 90 minutos y subí a lo largo de varias semanas.',
      },
    ],
  },

  inputsTitle: 'Completá lo que corresponde a tu caso',
  inputsIntro: 'Cada rama usa sólo algunos campos: los demás quedan ahí para cuando cambies de pregunta.',
  fields: [
    {
      id: 'edad',
      label: 'Edad de la persona',
      type: 'number',
      suffix: 'años',
      min: 0,
      max: 110,
      step: 1,
      value: 8,
      help: 'Se usa en las ramas de horas de sueño y de tiempo de pantalla. Para bebés menores de 1 año usá decimales: 0,5 son 6 meses.',
    },
    { id: 'horasDuerme', label: 'Horas que dormís hoy (siestas incluidas)', type: 'number', suffix: 'horas', min: 0, max: 24, step: 0.5, value: 8 },
    { id: 'latencia', label: 'Minutos que tardás en dormirte', type: 'number', suffix: 'min', min: 0, max: 300, step: 5, value: 25, help: 'Se usa en la rama de calidad del sueño (PSQI).' },
    { id: 'horasCama', label: 'Horas que pasás en la cama', type: 'number', suffix: 'horas', min: 1, max: 24, step: 0.5, value: 8.5 },
    {
      id: 'calidadSubjetiva',
      label: 'Cómo calificarías tu sueño en el último mes',
      type: 'select',
      value: '1',
      options: [
        { value: '0', label: 'Muy bueno — 0 puntos' },
        { value: '1', label: 'Bastante bueno — 1 punto' },
        { value: '2', label: 'Bastante malo — 2 puntos' },
        { value: '3', label: 'Muy malo — 3 puntos' },
      ],
    },
    {
      id: 'perturbaciones',
      label: 'Con qué frecuencia te despertás de noche',
      type: 'select',
      value: '1',
      options: [
        { value: '0', label: 'Nunca en el último mes — 0 puntos' },
        { value: '1', label: 'Menos de una vez por semana — 1 punto' },
        { value: '2', label: 'Una o dos veces por semana — 2 puntos' },
        { value: '3', label: 'Tres o más veces por semana — 3 puntos' },
      ],
    },
    {
      id: 'disfuncionDiurna',
      label: 'Cuánto te cuesta funcionar de día por el sueño',
      type: 'select',
      value: '1',
      options: [
        { value: '0', label: 'Ningún problema — 0 puntos' },
        { value: '1', label: 'Un problema leve — 1 punto' },
        { value: '2', label: 'Un problema moderado — 2 puntos' },
        { value: '3', label: 'Un problema grave — 3 puntos' },
      ],
    },
    { id: 'pantallaActual', label: 'Horas de pantalla de ocio por día', type: 'number', suffix: 'horas', min: 0, max: 24, step: 0.5, value: 3, help: 'Se usa en la rama de tiempo de pantalla. No cuenta la escuela ni el trabajo.' },
    { id: 'minIG', label: 'Minutos por día en Instagram', type: 'number', suffix: 'min', min: 0, max: 720, step: 5, value: 45, help: 'Se usa en la rama de redes. Miralo en el "Tiempo de uso" del teléfono.' },
    { id: 'minTikTok', label: 'Minutos por día en TikTok', type: 'number', suffix: 'min', min: 0, max: 720, step: 5, value: 30 },
    { id: 'minTwitter', label: 'Minutos por día en Twitter/X', type: 'number', suffix: 'min', min: 0, max: 720, step: 5, value: 20 },
    { id: 'minYouTube', label: 'Minutos por día en YouTube', type: 'number', suffix: 'min', min: 0, max: 720, step: 5, value: 40 },
    { id: 'minWhatsApp', label: 'Minutos por día en WhatsApp', type: 'number', suffix: 'min', min: 0, max: 720, step: 5, value: 30 },
    { id: 'focoSemana', label: 'Horas de trabajo profundo por semana', type: 'number', suffix: 'h/semana', min: 0, max: 60, step: 0.5, value: 15, help: 'Se usa en la rama de foco.' },
    { id: 'diasLaborales', label: 'Días laborales en la semana', type: 'number', suffix: 'días', min: 1, max: 7, step: 1, value: 5 },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado. El puntaje PSQI de esta página es un screening, no un diagnóstico.',

  chart: {
    type: 'scale',
    title: 'Dónde caés vos',
    caption:
      'La barra muestra las franjas de la pregunta que elegiste y el marcador indica dónde estás. En sueño, las franjas son horas por día y la zona verde es el rango recomendado para esa edad. En pantalla, la zona verde llega hasta el máximo del grupo etario y arriba están el exceso leve y el alto. En calidad de sueño, la escala es el puntaje PSQI de 0 a 21, donde más alto es peor.',
  },
  breakdownTitle: 'Tus números, uno por uno',
  breakdownIntro:
    'Cada fila trae su unidad: horas y minutos para sueño y pantalla, puntos para el PSQI, días y porcentajes para el resto. Ninguna cifra de esta página es dinero.',

  faq: [
    {
      q: '¿Cuántas horas hay que dormir según la edad?',
      a: 'Según el consenso de la National Sleep Foundation: 14 a 17 horas un recién nacido, 12 a 15 un bebé de 4 a 11 meses, 11 a 14 de 1 a 2 años, 10 a 13 en preescolar, 9 a 11 en edad escolar, 8 a 10 en la adolescencia, 7 a 9 en adultos y 7 a 8 después de los 65. En bebés y niños chicos esas horas incluyen las siestas.',
    },
    {
      q: '¿Cuánta pantalla puede usar un chico por día?',
      a: 'Antes de los 2 años la recomendación de la OMS es evitar la pantalla de ocio; de 2 a 5, un máximo de una hora diaria de contenido de calidad y mejor acompañado. De 6 a 12 se manejan una a dos horas de ocio y en la adolescencia dos a tres. De ahí en adelante la Academia Americana de Pediatría deja de dar un número fijo y propone un plan familiar de medios: qué contenidos, en qué momentos y con qué límites.',
    },
    {
      q: '¿Cuánta pantalla es demasiada para un adulto?',
      a: 'No hay un tope oficial, entre otras cosas porque para mucha gente la pantalla es el trabajo. La referencia práctica que usamos es de 2 a 4 horas de pantalla de ocio por día, además de la laboral, evitando la hora previa a dormir. Lo que sí está documentado es el efecto de la pantalla nocturna sobre el sueño y la fatiga visual del uso sostenido.',
    },
    {
      q: '¿Qué es el índice PSQI y qué puntaje es normal?',
      a: 'El Pittsburgh Sleep Quality Index es un cuestionario de tamizaje publicado por Buysse en 1989 que puntúa seis componentes del sueño de 0 a 3 cada uno, sobre un total de 21. El corte habitual es 5: hasta 5 puntos se considera buena calidad de sueño y por encima, deficiente. Es un screening validado, no un diagnóstico: un puntaje alto indica que conviene consultar, no qué trastorno tenés.',
    },
    {
      q: '¿Qué es la eficiencia de sueño y cuánto debería dar?',
      a: 'Es el porcentaje de tiempo en la cama que realmente dormís: horas dormidas dividido horas en la cama, por cien. Del 85% para arriba se considera buena. Si pasás nueve horas en la cama y dormís seis, tu eficiencia es del 67% y el problema no es que estés poco tiempo acostado: es que estás despierto en la cama, que es justo lo que conviene evitar.',
    },
    {
      q: '¿Por qué la pantalla antes de dormir afecta el sueño?',
      a: 'Por dos vías. La luz de la pantalla en las horas previas retrasa la secreción de melatonina y corre el horario de sueño hacia más tarde. Y el contenido activa: un video, un chat o un juego mantienen la alerta cuando el cuerpo debería estar bajando. En adolescentes se suma que el ritmo circadiano ya está corrido de por sí, así que la pantalla nocturna pega doble.',
    },
    {
      q: '¿Se puede recuperar el sueño perdido durmiendo de más el fin de semana?',
      a: 'Sólo en parte. Dormir más el sábado y el domingo mejora algo la somnolencia, pero no revierte del todo los efectos de una semana corta y además corre el horario, lo que hace más difícil dormirse el domingo a la noche. La estrategia que rinde es achicar la deuda de a poco, con un horario de despertar parejo toda la semana.',
    },
    {
      q: '¿Cuántas horas por año me consumen las redes sociales?',
      a: 'Multiplicá los minutos diarios por 365 y dividí por 60. Dos horas y media por día son unas 912 horas al año, cerca de 38 días completos de 24 horas. Para dimensionarlo: un libro promedio son unas 7 horas de lectura y un curso online, unas 40. Las equivalencias son ilustrativas, no una promesa de que ese tiempo se convierta en otra cosa.',
    },
    {
      q: '¿El máximo de 4 horas de trabajo profundo está probado científicamente?',
      a: 'No. Es una heurística que Cal Newport plantea en su libro Deep Work a partir de biografías y de la investigación sobre práctica deliberada, no una constante medida en laboratorio. Sirve como referencia práctica: si te da bastante más de 4 horas diarias de foco, probablemente estés contando como concentración profunda tiempo que en realidad es tarea fragmentada.',
    },
    {
      q: '¿Las siestas cuentan dentro de las horas recomendadas?',
      a: 'Sí. En bebés y niños chicos los rangos incluyen las siestas, y por eso las cifras parecen tan altas: un bebé de seis meses reparte sus 12 a 15 horas entre la noche y dos o tres siestas. En adultos, una siesta corta de 20 minutos complementa pero no reemplaza el sueño nocturno, y después de las 16 puede dificultar el sueño de esa misma noche.',
    },
    {
      q: '¿Dormir de más también es un problema?',
      a: 'Salirse del rango recomendado hacia arriba en forma sostenida se asocia en estudios poblacionales a peores indicadores de salud, aunque ahí la causalidad suele ir al revés: muchas veces el sueño largo es consecuencia de una condición de base, no la causa. Si dormís bastante más que tu rango y aun así te levantás cansado, eso amerita una consulta.',
    },
    {
      q: '¿Y la fatiga visual de estar todo el día en pantalla?',
      a: 'Ese es otro ángulo del problema y lo tratamos aparte, en el hub de hábitos: ahí están las pausas de la regla 20-20-20, la distancia al monitor y el score de fatiga visual. Esta página responde cuántas horas de pantalla corresponden por edad; aquella responde cómo sobrellevar las horas de pantalla que ya tenés.',
    },
  ],

  sources: [
    {
      name: 'Hirshkowitz M et al. — National Sleep Foundation sleep time duration recommendations',
      url: 'https://pubmed.ncbi.nlm.nih.gov/29073412/',
      publisher: 'Sleep Health (PubMed)',
      date: '2015',
    },
    {
      name: 'Paruthi S et al. — Recommended amount of sleep for pediatric populations (consenso AASM)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/27250809/',
      publisher: 'Journal of Clinical Sleep Medicine (PubMed)',
      date: '2016',
    },
    {
      name: 'Watson NF et al. — Recommended amount of sleep for a healthy adult (AASM y Sleep Research Society)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26039963/',
      publisher: 'Sleep (PubMed)',
      date: '2015',
    },
    {
      name: 'Buysse DJ et al. — The Pittsburgh Sleep Quality Index: a new instrument for psychiatric practice and research',
      url: 'https://pubmed.ncbi.nlm.nih.gov/2748771/',
      publisher: 'Psychiatry Research (PubMed)',
      date: '1989',
    },
    {
      name: 'OMS — Directrices sobre actividad física, comportamiento sedentario y sueño en menores de 5 años',
      url: 'https://www.who.int/es/publications/i/item/9789241550536',
      publisher: 'Organización Mundial de la Salud',
      date: '2019',
    },
    {
      name: 'American Academy of Pediatrics — Media and Young Minds / Family Media Plan',
      url: 'https://www.healthychildren.org/English/fmp/Pages/MediaPlan.aspx',
      publisher: 'American Academy of Pediatrics',
    },
    {
      name: 'Chang AM et al. — Evening use of light-emitting eReaders negatively affects sleep and next-morning alertness',
      url: 'https://pubmed.ncbi.nlm.nih.gov/25535358/',
      publisher: 'PNAS (PubMed)',
      date: '2015',
    },
    {
      name: 'Ministerio de Salud de la Nación — Recomendaciones sobre uso de pantallas en la infancia',
      url: 'https://www.argentina.gob.ar/salud/crecerconsalud',
      publisher: 'Ministerio de Salud, Argentina',
    },
    {
      name: 'Newport C — Deep Work: Rules for Focused Success in a Distracted World',
      url: 'https://calnewport.com/books/deep-work/',
      publisher: 'Cal Newport (sitio del autor)',
      date: '2016',
    },
  ],

  replaces: [
    '/calculadora-calidad-sueno-pittsburgh',
    '/calculadora-tiempo-pantalla-ideal-edad',
    '/calculadora-tiempo-en-redes-sociales',
    '/calculadora-deep-work-cal-newport-horas-maximo-diario',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Rangos de sueño por etapa. Espejo EXACTO de la tabla RANGOS de
 * src/lib/formulas/sueno-ideal-edad.ts: los strings de la fórmula vieja
 * ('14-17 horas') se abren acá en sus dos números para poder graficar y
 * restar. No se cambió ningún valor.
 */
export const SUENO_RANGOS: Array<{
  max: number;
  etapa: string;
  recMin: number;
  recMax: number;
  rangoMin: number;
  rangoMax: number;
  tip: string;
}> = [
  { max: 0.25, etapa: 'Recién nacido (0-3 meses)', recMin: 14, recMax: 17, rangoMin: 11, rangoMax: 19, tip: 'Los recién nacidos duermen la mayor parte del día en ciclos de 2 a 4 horas.' },
  { max: 1, etapa: 'Bebé (4-11 meses)', recMin: 12, recMax: 15, rangoMin: 10, rangoMax: 18, tip: 'Incluye siestas. A los 6 meses suelen dormir de 6 a 8 horas seguidas de noche.' },
  { max: 2, etapa: 'Niño pequeño (1-2 años)', recMin: 11, recMax: 14, rangoMin: 9, rangoMax: 16, tip: 'Incluye 1 o 2 siestas. La rutina de sueño consistente es lo que más ayuda.' },
  { max: 5, etapa: 'Preescolar (3-5 años)', recMin: 10, recMax: 13, rangoMin: 8, rangoMax: 14, tip: 'Muchos dejan la siesta entre los 4 y los 5 años. Sostené la rutina nocturna.' },
  { max: 13, etapa: 'Escolar (6-13 años)', recMin: 9, recMax: 11, rangoMin: 7, rangoMax: 12, tip: 'El sueño es determinante para el rendimiento escolar y el crecimiento.' },
  { max: 17, etapa: 'Adolescente (14-17 años)', recMin: 8, recMax: 10, rangoMin: 7, rangoMax: 11, tip: 'El ritmo circadiano adolescente se desplaza: es normal dormirse y despertarse más tarde.' },
  { max: 25, etapa: 'Adulto joven (18-25 años)', recMin: 7, recMax: 9, rangoMin: 6, rangoMax: 11, tip: 'Priorizá el sueño sobre la pantalla nocturna: el cerebro todavía se está desarrollando.' },
  { max: 64, etapa: 'Adulto (26-64 años)', recMin: 7, recMax: 9, rangoMin: 6, rangoMax: 10, tip: 'La constancia pesa más que la cantidad: mismo horario toda la semana.' },
  { max: 200, etapa: 'Adulto mayor (65+ años)', recMin: 7, recMax: 8, rangoMin: 5, rangoMax: 9, tip: 'Es normal dormir menos profundamente. Una siesta corta de 20 minutos puede complementar.' },
];

/** Techo de la escala de sueño del gráfico, en horas por día. */
export const SUENO_ESCALA_MAX = 18;

/**
 * Máximo de pantalla de ocio por grupo etario. Espejo de los cortes de
 * src/lib/formulas/tiempo-pantalla-ideal-edad.ts (<2, ≤5, ≤12, ≤17, resto).
 */
export const PANTALLA_TRAMOS: Array<{ max: number; grupo: string; maxHoras: number; recomendado: string }> = [
  { max: 1.999, grupo: 'Bebé (0-2 años)', maxHoras: 0, recomendado: 'evitar pantallas' },
  { max: 5, grupo: 'Preescolar (2-5 años)', maxHoras: 1, recomendado: 'máximo 1 hora por día de contenido de calidad' },
  { max: 12, grupo: 'Niñez (6-12 años)', maxHoras: 2, recomendado: '1 a 2 horas por día de ocio' },
  { max: 17, grupo: 'Adolescencia (13-17 años)', maxHoras: 3, recomendado: '2 a 3 horas por día de ocio' },
  { max: 200, grupo: 'Adulto (18+ años)', maxHoras: 4, recomendado: '2 a 4 horas por día de ocio, evitando la hora previa a dormir' },
];

/** Cortes del PSQI. Espejo de src/lib/formulas/calidad-sueno-pittsburgh.ts. */
export const PSQI = {
  /** Hasta este puntaje, buena calidad de sueño. */
  CORTE_BUENA: 5,
  /** Hasta este puntaje, calidad pobre; por encima, mala. */
  CORTE_POBRE: 10,
  /** Puntaje máximo del instrumento. */
  MAX: 21,
  /** Eficiencia de sueño considerada buena, en %. */
  EFICIENCIA_BUENA: 85,
};

/** Equivalencias de la rama redes. Espejo de src/lib/formulas/tiempo-en-redes-sociales.ts. */
export const REDES = {
  /** Horas de lectura de un libro promedio. */
  HORAS_LIBRO: 7,
  /** Horas de un curso online típico. */
  HORAS_CURSO: 40,
  /** Horas para llegar a un idioma nuevo "fácil". */
  HORAS_IDIOMA: 600,
  /** Techo de la escala del gráfico, en horas por día. */
  ESCALA_MAX: 8,
};

/** Constantes de la rama foco (heurística de Cal Newport, no evidencia clínica). */
export const FOCO = {
  /** Techo práctico de horas diarias de trabajo profundo. */
  TECHO_DIARIO: 4,
  /** Duración de un bloque de foco, en minutos. */
  BLOQUE_MIN: 90,
  /** Techo de la escala del gráfico, en horas por día. */
  ESCALA_MAX: 8,
};
