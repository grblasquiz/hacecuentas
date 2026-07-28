import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto tengo que dormir y a qué hora me acuesto?"
 * Arquetipo RAMIFICADO: la rama define de quién estamos hablando (adulto,
 * chico, bebé) o si la pregunta es directamente el horario.
 *
 * Absorbe 7 URLs (ver hub.replaces).
 *
 * DIFERENCIA con los otros hubs del silo /salud — no se pisan:
 *   · /salud/habitos          → alcohol, sol, pantallas, pasos (no horas de sueño)
 *   · /salud/frecuencia-cardiaca, /salud/ritmo-y-pace → entrenamiento
 *   · /bebes/crecimiento      → percentiles de peso y talla, no sueño
 *   Ninguno devuelve horas de sueño ni hora de acostarse.
 *
 * NÚMEROS: tabla de consenso NSF (Hirshkowitz 2015) / AASM (Watson 2015), que
 * es exactamente la de src/lib/formulas/horas-sueno.ts y la de
 * horas-sueno-hijo-edad-recomendadas.ts (coinciden franja por franja).
 * La ventana de vigilia y el reparto noche/siestas de 0-24 meses salen de
 * src/lib/formulas/sueno-bebe-horas-meses-tabla-padres.ts (AAP/NSF).
 * Ciclo de 90 min y latencia de 15 min: src/lib/formulas/a-que-hora-acostarme.ts.
 *
 * YMYL DE SALUD: el aviso del dominio `health` de src/lib/disclaimers.ts viaja
 * textual en hub.fineprint y como PRIMER `warn` de cada rama.
 *
 * NOTAS DE CONTRATO: acá no hay plata. TODA fila lleva `format` explícito.
 */

export const DISCLAIMER =
  'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.';

export const hub: HubData = {
  slug: 'salud/cuanto-dormir',
  title: '¿Cuántas horas tengo que dormir y a qué hora acostarme?',
  description:
    'Las horas de sueño que te corresponden por edad según el consenso NSF/AASM, cuánto te falta si dormís menos, y a qué hora conviene acostarte para despertarte al final de un ciclo. Adultos, chicos y bebés de 0 a 24 meses.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación de sueño',
  h1: '¿Cuánto tenés que dormir?',
  lede:
    'La respuesta no es "8 horas": es un rango que depende de la edad, y lo que en general falta no son horas sino consistencia. Partimos del caso más común —un adulto— y de ahí sacamos tu rango, tu déficit y a qué hora te conviene acostarte. Si preguntás por un chico o un bebé, lo cambiás abajo.',
  stamps: [
    'Consenso NSF 2015 · AASM 2015',
    'Ventanas de vigilia AAP 0-24 meses',
    '7 calculadoras adentro',
  ],

  resultLabel: 'Tu rango de sueño',

  cases: {
    title: '¿De quién estamos hablando?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'adulto',
        label: 'De mí, que soy adulto',
        hint: '18 años en adelante',
        answer: 'De 18 a 64 años el rango es 7-9 h; de 65 en adelante, 7-8 h.',
        yes: [
          'Rango recomendado y rango aceptable para tu edad (consenso NSF/AASM)',
          'Cuántas horas te faltan o te sobran contra ese rango',
          'A qué hora acostarte para despertarte al final de un ciclo de 90 minutos',
        ],
        warn: [
          DISCLAIMER,
          'La curva de riesgo del sueño tiene forma de U: dormir de más de forma sostenida también se asocia a problemas de salud, no sólo dormir de menos',
          'Si dormís las horas que corresponden y aun así te levantás cansado, el problema es la calidad, no la cantidad: eso se evalúa con un profesional, no con una calculadora',
        ],
        plazo: 'un cambio de horario tarda 1 a 2 semanas en estabilizarse; no juzgues la rutina por una sola noche.',
      },
      {
        id: 'chico',
        label: 'De un chico o un adolescente',
        hint: '2 a 17 años',
        answer: 'Un escolar necesita 9-11 h y un adolescente 8-10 h por día.',
        yes: [
          'El rango por etapa: preescolar 10-13 h, escolar 9-11 h, adolescente 8-10 h',
          'El total incluye la siesta cuando todavía la hace',
          'La hora de acostarse que sale de restar ese rango al horario del colegio',
        ],
        warn: [
          DISCLAIMER,
          'El adolescente tiene un retraso de fase biológico: le cuesta dormirse temprano y el horario escolar temprano le come horas. No es vagancia',
          'Si ronca fuerte, respira por la boca o hace pausas al dormir, eso se consulta con el pediatra',
        ],
        plazo: 'para adelantar la hora de dormir, movela de a 15 minutos cada 2 o 3 noches.',
      },
      {
        id: 'bebe',
        label: 'De un bebé de 0 a 24 meses',
        hint: 'Con siestas y ventana de vigilia',
        answer: 'Un recién nacido necesita 14-17 h; al año, 12-14 h con 2 siestas.',
        yes: [
          'Total por día, cuánto de eso es nocturno y cuánto son siestas',
          'Cuántas siestas y qué ventana de vigilia le corresponde a la etapa',
          'Cargá la edad en meses y cambiá la unidad del campo',
        ],
        warn: [
          DISCLAIMER,
          'El sueño del bebé es fragmentado por diseño: los despertares nocturnos no son un fracaso de la rutina',
          'Sueño seguro: boca arriba, en superficie firme, sin almohadas ni peluches en la cuna',
          'Las regresiones de los 4 y de los 12 meses son esperables y transitorias',
        ],
        plazo: 'el paso de 2 siestas a 1 no conviene antes de los 14-15 meses.',
      },
      {
        id: 'horario',
        label: 'Sólo quiero saber a qué hora acostarme',
        hint: 'Ciclos de 90 minutos',
        answer: 'Restá bloques de 90 minutos más 15 de latencia a tu hora de despertar.',
        yes: [
          'Las horas de acostarse que te dejan despertar al final de un ciclo completo',
          'Se restan 6 ciclos (9 h) o 5 ciclos (7,5 h) más el tiempo que tardás en dormirte',
          'Despertarte al final de un ciclo evita la modorra de cortar el sueño profundo',
        ],
        warn: [
          DISCLAIMER,
          'Los 90 minutos son un promedio poblacional: el ciclo real de cada persona va de 70 a 110 minutos y cambia a lo largo de la noche',
          'Elegir 5 ciclos por comodidad, noche tras noche, es acumular deuda de sueño aunque te despiertes "en el momento justo"',
        ],
        plazo: 'sumá tu latencia real: si tardás 40 minutos en dormirte, la cuenta cambia 40 minutos.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'edadValor', label: 'Edad', type: 'number', min: 0, max: 110, value: 35 },
    {
      id: 'edadUnidad',
      label: 'La edad está en',
      type: 'select',
      value: 'anios',
      options: [
        { value: 'anios', label: 'Años' },
        { value: 'meses', label: 'Meses (bebés)' },
      ],
      help: 'Para un bebé pasá a meses: los rangos de 0 a 24 meses tienen su propia tabla.',
    },
    {
      id: 'horasActuales',
      label: '¿Cuántas horas dormís hoy?',
      type: 'number',
      min: 0,
      max: 24,
      step: 0.5,
      value: 6.5,
      help: 'Horas reales de sueño, no las que pasás en la cama. Dejalo en 0 si sólo querés el rango.',
    },
    {
      id: 'horaDespertar',
      label: '¿A qué hora te tenés que despertar?',
      type: 'text',
      value: '07:00',
      help: 'Formato 24 h, por ejemplo 07:00.',
    },
    {
      id: 'minutosDormirse',
      label: 'Minutos que tardás en dormirte',
      type: 'number',
      min: 0,
      max: 90,
      value: 15,
      suffix: 'min',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde caen tus horas',
    caption:
      'El eje son horas de sueño por día. El marcador muestra dónde quedan las tuyas dentro de las franjas que corresponden a tu edad. Más a la derecha no es mejor: el objetivo es caer en la franja verde, no pasarla.',
    bands: [
      { label: 'Insuficiente', from: 0, to: 6, tone: 'bad' },
      { label: 'Justo por debajo', from: 6, to: 7, tone: 'warn' },
      { label: 'Recomendado', from: 7, to: 9, tone: 'good' },
      { label: 'Por encima', from: 9, to: 14, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Tu sueño en números',
  breakdownIntro: 'Las barras comparan cada número con el más grande del desglose.',

  faq: [
    {
      q: '¿Cuántas horas tiene que dormir un adulto?',
      a: 'Entre 7 y 9 horas por noche de los 18 a los 64 años, y entre 7 y 8 de los 65 en adelante. Es el rango del consenso conjunto de la National Sleep Foundation y de la American Academy of Sleep Medicine, ambos publicados en 2015. Por debajo de 6 horas se considera sueño insuficiente en cualquier edad adulta.',
    },
    {
      q: '¿Y un chico? ¿Cuántas horas por edad?',
      a: 'Recién nacido (0-3 meses) 14-17 h; lactante (4-11 meses) 12-15 h; 1 a 2 años 11-14 h; preescolar (3-5 años) 10-13 h; escolar (6-13 años) 9-11 h; adolescente (14-17 años) 8-10 h. En los chicos el total incluye las siestas, no sólo la noche.',
    },
    {
      q: '¿A qué hora me tengo que acostar?',
      a: 'Restá a tu hora de despertar bloques de 90 minutos (un ciclo de sueño completo) y sumá el tiempo que tardás en dormirte. Para levantarte a las 07:00 con 6 ciclos y 15 minutos de latencia, la hora es 21:45; con 5 ciclos, 23:15. La gracia de cortar por ciclo es despertarse en sueño liviano y no en la mitad de una fase profunda.',
    },
    {
      q: '¿Los ciclos de 90 minutos son exactos?',
      a: 'No. Los 90 minutos son un promedio: el ciclo real va de 70 a 110 minutos según la persona, y dentro de la misma noche los primeros ciclos tienen más sueño profundo y los últimos más REM. Sirven como regla de bolsillo para elegir entre dos horarios, no como cronómetro.',
    },
    {
      q: 'Duermo 6 horas y me siento bien. ¿Está mal?',
      a: 'Los "dormidores cortos" reales, con una base genética, son menos del 1% de la población. La sensación de estar bien con 6 horas suele ser adaptación subjetiva: el rendimiento cognitivo medido cae aunque la persona no lo perciba. Si el patrón es sostenido, vale plantearlo en una consulta.',
    },
    {
      q: '¿Se puede recuperar el sueño perdido el fin de semana?',
      a: 'Sólo en parte. Dormir de más el sábado repone algo de la deuda aguda, pero no revierte los efectos metabólicos de una semana corta y además corre tu reloj interno, lo que hace más difícil dormirse el domingo a la noche. Es preferible una hora extra estable todos los días que cinco de golpe.',
    },
    {
      q: '¿Cuántas siestas hace un bebé y cuánto puede estar despierto?',
      a: 'La ventana de vigilia crece con la edad: 45-60 minutos en el recién nacido, 1,5-2 h a los 4-6 meses, 3-4 h a los 10-12 meses y 5-6 h a los 2 años. Las siestas van de 4-5 al nacer a una sola después del almuerzo cerca de los 18 meses.',
    },
    {
      q: '¿Cuándo pasa un bebé de dos siestas a una?',
      a: 'Habitualmente entre los 14 y los 18 meses, y la transición puede llevar semanas de idas y vueltas. Adelantarla antes de los 14 meses suele terminar en un bebé sobrecansado que duerme peor de noche, no mejor.',
    },
    {
      q: '¿Dormir de más también hace mal?',
      a: 'La asociación entre horas de sueño y salud tiene forma de U: tanto los extremos bajos como los altos se asocian a más riesgo cardiovascular y metabólico. En el exceso, además, suele haber una causa de fondo (depresión, apnea, hipotiroidismo) que conviene mirar.',
    },
    {
      q: '¿Por qué al adolescente le cuesta tanto dormirse temprano?',
      a: 'En la pubertad la secreción de melatonina se retrasa: el cuerpo no da la señal de sueño hasta más tarde. Si además el colegio empieza temprano, el resultado es un déficit crónico de una a dos horas por día durante la semana. La palanca real ahí es el horario escolar, no la fuerza de voluntad.',
    },
    {
      q: '¿Qué hago si no me duermo?',
      a: 'La recomendación estándar del control de estímulos es levantarse a los 20 minutos, ir a otro ambiente con poca luz y volver a la cama recién cuando vuelva el sueño. Quedarse dando vueltas entrena al cerebro a asociar la cama con estar despierto.',
    },
  ],

  sources: [
    {
      name: 'National Sleep Foundation Sleep Time Duration Recommendations (Hirshkowitz et al.)',
      url: 'https://www.sleephealthjournal.org/article/S2352-7218(15)00015-7/fulltext',
      publisher: 'Sleep Health · National Sleep Foundation',
      date: '2015',
    },
    {
      name: 'Recommended Amount of Sleep for a Healthy Adult — Consenso AASM / Sleep Research Society (Watson et al.)',
      url: 'https://aasm.org/resources/pdf/pressroom/adult-sleep-duration-consensus.pdf',
      publisher: 'American Academy of Sleep Medicine',
      date: '2015',
    },
    {
      name: 'Recommended Amount of Sleep for Pediatric Populations — AASM',
      url: 'https://jcsm.aasm.org/doi/10.5664/jcsm.5866',
      publisher: 'Journal of Clinical Sleep Medicine',
      date: '2016',
    },
    {
      name: 'Sudden Infant Death Syndrome and Other Sleep-Related Infant Deaths — recomendaciones de sueño seguro',
      url: 'https://publications.aap.org/pediatrics/article/150/1/e2022057990/188304',
      publisher: 'American Academy of Pediatrics',
      date: '2022',
    },
  ],

  replaces: [
    '/a-que-hora-acostarme',
    '/calculadora-ciclo-sueno-rem-no-rem-90min',
    '/calculadora-horas-de-sueno-por-edad',
    // Movida desde /salud/sueno-y-pantallas: la pregunta es cuántas horas dormir,
    // que es el eje de este hub. Aquel se queda con pantallas, PSQI y foco.
    '/calculadora-sueno-ideal-edad',
    '/calculadora-horas-sueno-necesarias-edad-adulto',
    '/calculadora-sueno-bebe-horas',
    '/calculadora-horas-sueno-hijo-edad-recomendadas',
    '/calculadora-sueno-bebe-horas-meses-tabla-padres',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Consenso NSF 2015 / AASM 2015. Es la misma tabla, franja por franja, de
 * src/lib/formulas/horas-sueno.ts y de horas-sueno-hijo-edad-recomendadas.ts.
 * `hasta` es la edad en AÑOS por debajo de la cual aplica la franja.
 */
export const NSF_BANDS: Array<{
  hasta: number;
  grupo: string;
  rec: [number, number];
  acep: [number, number];
}> = [
  { hasta: 0.25, grupo: 'Recién nacido (0-3 meses)', rec: [14, 17], acep: [11, 19] },
  { hasta: 1, grupo: 'Lactante (4-11 meses)', rec: [12, 15], acep: [10, 18] },
  { hasta: 3, grupo: 'Niño pequeño (1-2 años)', rec: [11, 14], acep: [9, 16] },
  { hasta: 6, grupo: 'Preescolar (3-5 años)', rec: [10, 13], acep: [8, 14] },
  { hasta: 14, grupo: 'Escolar (6-13 años)', rec: [9, 11], acep: [7, 12] },
  { hasta: 18, grupo: 'Adolescente (14-17 años)', rec: [8, 10], acep: [7, 11] },
  { hasta: 26, grupo: 'Adulto joven (18-25 años)', rec: [7, 9], acep: [6, 11] },
  { hasta: 65, grupo: 'Adulto (26-64 años)', rec: [7, 9], acep: [6, 10] },
  { hasta: 999, grupo: 'Adulto mayor (65+ años)', rec: [7, 8], acep: [5, 9] },
];

/**
 * Reparto noche / siestas y ventana de vigilia de 0 a 24 meses.
 * Fuente: AAP / NSF, espejo de sueno-bebe-horas-meses-tabla-padres.ts.
 * `hastaMeses` es el tope inclusivo de la etapa.
 */
export const BEBE_STAGES: Array<{
  hastaMeses: number;
  etapa: string;
  noct: [number, number];
  siestas: string;
  ventana: string;
  ventanaMedia: number;
}> = [
  { hastaMeses: 0, etapa: 'Recién nacido (0-4 semanas)', noct: [8, 9], siestas: '4-5 siestas cortas', ventana: '45-60 minutos', ventanaMedia: 0.9 },
  { hastaMeses: 3, etapa: '1-3 meses', noct: [8, 10], siestas: '3-5 siestas', ventana: '60-90 minutos', ventanaMedia: 1.25 },
  { hastaMeses: 6, etapa: '4-6 meses', noct: [10, 12], siestas: '3 siestas', ventana: '1,5-2 horas', ventanaMedia: 1.75 },
  { hastaMeses: 9, etapa: '7-9 meses', noct: [10, 12], siestas: '2-3 siestas', ventana: '2-3 horas', ventanaMedia: 2.5 },
  { hastaMeses: 12, etapa: '10-12 meses', noct: [10, 12], siestas: '2 siestas', ventana: '3-4 horas', ventanaMedia: 3.5 },
  { hastaMeses: 18, etapa: '13-18 meses', noct: [10, 12], siestas: '1-2 siestas (transición)', ventana: '4-5 horas', ventanaMedia: 4.5 },
  { hastaMeses: 24, etapa: '19-24 meses', noct: [10, 12], siestas: '1 siesta post-almuerzo', ventana: '5-6 horas', ventanaMedia: 5.5 },
];

/** Un ciclo de sueño, en minutos (promedio poblacional). */
export const CICLO_MIN = 90;
