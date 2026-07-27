import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuándo nace mi bebé?"
 *
 * Arquetipo RAMIFICADO. El eje es LA FECHA, no las semanas.
 *
 * ⚠️ SILO COMPARTIDO con otros dos hubs de /embarazo. El reparto es explícito
 * y no se pisa:
 *   - `/embarazo/dias-fertiles` → lo de ANTES: ventana fértil, ovulación,
 *     datar la concepción, probabilidad por edad.
 *   - `/embarazo/semanas`       → el ESTADO de hoy: de cuántas semanas estás,
 *     trimestre, mes, tamaño del bebé, calendario de ecografías.
 *   - este hub                  → la FECHA de llegada y su incertidumbre: cómo
 *     se calcula la FPP con cada método (Naegele, ajuste por ciclo largo o
 *     corto, datación ecográfica, FIV con fecha de transferencia), qué tan
 *     confiable es esa fecha (distribución real de nacimientos por semana,
 *     probabilidad de nacer el día exacto, ventana de ±2 semanas) y qué pasa
 *     si te pasás de las 40 semanas (término tardío, postérmino, inducción).
 *
 * Por eso acá NO hay tamaño del bebé por semana, ni trimestres, ni hitos de
 * control: eso vive en `/embarazo/semanas` y se linkea, no se duplica. Y
 * tampoco hay ventana fértil ni fecha de concepción: eso es `/embarazo/dias-fertiles`.
 *
 * ⚠️ YMYL — SALUD. El disclaimer sale de src/lib/disclaimers.ts: el dominio
 * 'health' ('Resultado orientativo: no reemplaza diagnóstico…') más el
 * override ES de 'calculadora-embarazo' ('Estimación basada en la regla
 * indicada; la fecha real puede variar…'). Los dos van en `fineprint` y el de
 * salud es el PRIMER `warn` de cada rama. No aflojarlo ni sacarlo del fold.
 */
export const hub: HubData = {
  slug: 'embarazo/fecha-de-parto',
  title: '¿Cuándo nace mi bebé? — Calculadora de fecha probable de parto',
  description:
    'Calculá tu fecha probable de parto por última menstruación (regla de Naegele), con ajuste por ciclo largo o corto, por ecografía o por FIV con la fecha de transferencia. Y mirá qué tan confiable es esa fecha: probabilidad por semana, ventana real de ±2 semanas y qué pasa si te pasás de las 40 semanas.',
  silo: 'Embarazo',
  siloHref: '/embarazo',

  eyebrow: 'Guía y estimación de embarazo',
  h1: '¿Cuándo nace mi bebé?',
  lede:
    'La fecha probable de parto no es el día del nacimiento: es el centro de una ventana de unas cinco semanas. Acá calculás esa fecha con el método que corresponda a tu caso y, sobre todo, ves cuánta incertidumbre tiene alrededor.',
  stamps: [
    'Regla de Naegele · ACOG 700 y ACOG 579',
    'Naegele, ecografía y FIV en la misma pantalla',
    '2 calculadoras adentro',
    'Orientativo: no reemplaza tu control obstétrico',
  ],

  resultLabel: 'Tu fecha probable de parto',

  cases: {
    title: '¿Con qué dato contás?',
    intro:
      'Cada método data el embarazo de una forma distinta y da una fecha distinta. Arrancamos por el más común —la última menstruación— y lo cambiás acá según tu caso.',
    items: [
      {
        id: 'fum',
        label: 'Sé la fecha de mi última menstruación',
        hint: 'Regla de Naegele, con ajuste por tu ciclo',
        answer:
          'Con la regla de Naegele la fecha probable de parto es el primer día de tu última menstruación más 280 días, corregido por la duración real de tu ciclo.',
        yes: [
          'Fecha probable de parto: primer día de la última menstruación + 280 días (40 semanas)',
          'Corrección por ciclo largo o corto: se suman o restan los días que tu ciclo se aparta de 28',
          'Ventana de término completo, entre las semanas 39 y 40+6, que es cuando nace la mayoría',
          'Cuántos días faltan desde hoy hasta esa fecha',
          'Probabilidad de nacer en cada tramo: pretérmino, término temprano, completo, tardío y postérmino',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La regla de Naegele asume ciclos de 28 días con ovulación el día 14. Si tus ciclos son irregulares o no recordás bien la fecha, el error puede ser de una o dos semanas',
          'Si la ecografía del primer trimestre difiere de esta fecha en más de 5 a 7 días, manda la ecografía: cambiá de rama',
          'Alrededor de un 4% de los bebés nace exactamente el día de la fecha probable de parto. Esa fecha sirve para programar controles, no para agendar el nacimiento',
        ],
        plazo:
          'la ecografía de las semanas 11 a 13+6 es la que fija la fecha definitiva; a partir de las 22 semanas la fecha ya no se recalcula.',
      },
      {
        id: 'eco',
        label: 'Me databan por ecografía',
        hint: 'La fecha que fija el primer trimestre',
        answer:
          'Cuando la ecografía data el embarazo, la fecha probable de parto se recalcula desde ella y esa fecha ya no se toca.',
        yes: [
          'Fecha probable de parto recalculada desde la edad gestacional que informó la ecografía',
          'La fecha de última menstruación equivalente que implica esa datación',
          'Cuántos días se corrió la fecha respecto de tu última menstruación, si cargaste las dos',
          'Ventanas de término y de postérmino recalculadas sobre esa fecha',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Una vez que tu obstetra fija la fecha con la ecografía del primer trimestre, esa fecha ya no se cambia aunque las ecografías siguientes den un bebé más grande o más chico',
          'La datación ecográfica es muy precisa antes de las 14 semanas (±5 a 7 días) y pierde precisión después: entre las 22 y las 28 semanas el margen se va a ±14 días, y más allá a ±21',
          'El informe de tu ecografista es el dato válido. Acá sólo se traslada la edad gestacional que ya te dieron a una fecha de parto',
        ],
        plazo:
          'si te datan después de las 22 semanas, la fecha va a tener un margen de dos semanas o más: pedí que quede escrito el criterio usado.',
      },
      {
        id: 'fiv',
        label: 'Es un embarazo por FIV',
        hint: 'Se cuenta desde la transferencia o la punción',
        answer:
          'En un embarazo por fertilización in vitro la fecha se cuenta desde la transferencia y es la más precisa de todas, porque se sabe el día exacto de la fecundación.',
        yes: [
          'Fecha probable de parto contada desde la transferencia embrionaria, descontando los días que el embrión ya tenía',
          'Transferencia de blastocisto (día 5): fecha de transferencia + 261 días',
          'Transferencia de día 3: fecha de transferencia + 264 días',
          'Desde la punción ovárica o la inseminación: esa fecha + 266 días',
          'La fecha de última menstruación equivalente, que es la que va a figurar en tu carnet perinatal',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'En FIV la fecha se calcula desde la transferencia y NO se corrige después por ecografía: es el dato más preciso que existe, porque el día de la fecundación es conocido',
          'Fijate en el resumen de tu clínica si la transferencia fue de día 3 o de día 5 (blastocisto): son tres días de diferencia en la fecha final',
          'Si transferiste embriones congelados, la fecha se cuenta igual desde el día de la transferencia, no desde el día en que se congelaron',
          'Un embarazo múltiple por FIV se planifica antes de las 40 semanas. La semana de finalización la define tu equipo obstétrico, no esta calculadora',
        ],
        plazo:
          'pedí el resumen de tu ciclo de FIV con la fecha de transferencia y el día del embrión: son los dos datos que fijan la fecha para todo el embarazo.',
      },
      {
        id: 'rango',
        label: 'Ya tengo la fecha: ¿qué tan real es?',
        hint: 'Ventana, probabilidad por semana y postérmino',
        answer:
          'La fecha probable de parto es el centro de una ventana de unas cinco semanas: alrededor del 84% de los bebés nace entre las 37 y las 41+6 semanas.',
        yes: [
          'Probabilidad de nacer en cada tramo: pretérmino, término temprano, término completo, término tardío y postérmino',
          'Cuántos bebés nacen el día exacto de la fecha probable de parto y cuántos dentro de la semana previa o posterior',
          'Las fechas concretas en que empieza cada tramo de tu embarazo',
          'Desde qué día se considera que te pasaste: término tardío a partir de las 41 semanas y postérmino a partir de las 42',
          'Cuántos días faltan o pasaron desde tu fecha probable de parto',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Los porcentajes son de partos espontáneos de un solo bebé en población general: tu caso puede tener indicaciones propias que cambien todo',
          'Pasar la fecha probable de parto no es una urgencia por sí mismo, pero a partir de las 41 semanas los controles se intensifican y se suele conversar la inducción. Esa conversación es con tu equipo obstétrico, no con una calculadora',
          'Ante sangrado, dolor abdominal intenso, pérdida de líquido, fiebre, dolor de cabeza con visión borrosa o disminución de los movimientos fetales, consultá de inmediato: no esperes ninguna fecha',
        ],
        plazo:
          'los controles pasan a ser semanales desde las 37 semanas; a partir de las 41 se agregan monitoreos y se evalúa la inducción.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada rama usa sólo los campos que le corresponden. Con la fecha de tu última menstruación ya tenés la primera.',
  fields: [
    { id: 'fum', label: 'Primer día de tu última menstruación', type: 'date', value: '2026-05-04' },
    {
      id: 'ciclo',
      label: 'Duración de tu ciclo (días)',
      type: 'number',
      min: 20,
      max: 45,
      value: 28,
      help: 'Del primer día de una menstruación al primer día de la siguiente. Con 28 no se aplica ninguna corrección.',
    },
    { id: 'fechaEco', label: 'Fecha de la ecografía', type: 'date', value: '2026-07-13' },
    {
      id: 'semanasEco',
      label: 'Semanas que informó la ecografía',
      type: 'number',
      min: 0,
      max: 42,
      value: 10,
      help: 'El número entero de semanas del informe.',
    },
    {
      id: 'diasEco',
      label: 'Días sueltos del informe',
      type: 'number',
      min: 0,
      max: 6,
      value: 2,
      help: 'El "+2" de un informe que dice 10+2 semanas.',
    },
    {
      id: 'tipoFiv',
      label: 'En FIV, ¿desde qué fecha contamos?',
      type: 'select',
      value: 'd5',
      options: [
        { value: 'd5', label: 'Transferencia de blastocisto (día 5)' },
        { value: 'd3', label: 'Transferencia de día 3' },
        { value: 'puncion', label: 'Punción ovárica o inseminación (día 0)' },
      ],
    },
    { id: 'fechaFiv', label: 'Fecha de esa transferencia o punción', type: 'date', value: '2026-07-20' },
    {
      id: 'fppConocida',
      label: 'Fecha probable de parto que ya te dieron',
      type: 'date',
      value: '2027-02-08',
      help: 'Sólo se usa en la rama de la ventana y las probabilidades.',
    },
  ],
  fineprint:
    'Estimación basada en la regla indicada; la fecha real puede variar. Confirmá el seguimiento con tu obstetra. Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional.',

  chart: {
    type: 'timeline',
    title: 'Cuándo nacen realmente los bebés',
    caption:
      'La línea va de la semana 36 a la 43 y está partida en los tramos que define el ACOG: pretérmino, término temprano, término completo, término tardío y postérmino. El tamaño de cada tramo en el gráfico es la proporción de nacimientos que ocurre ahí. El marcador señala dónde cae tu fecha probable de parto o dónde estás hoy.',
    bands: [
      { label: 'Pretérmino (antes de la 37)', from: 0, to: 14, tone: 'bad' },
      { label: 'Término temprano (37 a 38+6)', from: 14, to: 43, tone: 'warn' },
      { label: 'Término completo (39 a 40+6)', from: 43, to: 71, tone: 'good' },
      { label: 'Término tardío (41 a 41+6)', from: 71, to: 86, tone: 'warn' },
      { label: 'Postérmino (42 en adelante)', from: 86, to: 100, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tu fecha en números',
  breakdownIntro:
    'Cada fila muestra su unidad al lado del número: días, semanas o porcentajes. Ningún valor de este hub es dinero.',

  faq: [
    {
      q: '¿Cómo se calcula la fecha probable de parto?',
      a: 'Con la regla de Naegele: se toma el primer día de tu última menstruación y se le suman 280 días, es decir 40 semanas. La forma clásica de hacerlo a mano es sumarle 7 días a esa fecha y restarle 3 meses. Ojo con un detalle que confunde a mucha gente: se cuenta desde la menstruación, no desde la concepción, así que las dos primeras semanas de ese embarazo de 40 semanas son semanas en las que todavía no había embrión.',
    },
    {
      q: '¿Qué pasa si mi ciclo no es de 28 días?',
      a: 'La regla de Naegele asume un ciclo de 28 días con ovulación el día 14, y si el tuyo es distinto la fecha se corre. Con ciclos de 35 días ovulás alrededor del día 21, siete días más tarde, así que la fecha de parto se atrasa siete días; con ciclos de 24 días se adelanta cuatro. Esta calculadora aplica esa corrección automáticamente: le suma a los 280 días la diferencia entre tu ciclo y 28. Es un ajuste importante, porque una fecha corrida una semana cambia el momento en que te ofrecen una inducción.',
    },
    {
      q: '¿Qué método manda: la última menstruación, la ecografía o la FIV?',
      a: 'El orden es claro. Si el embarazo fue por fertilización in vitro, manda la fecha de la transferencia y no se corrige nunca, porque el día de la fecundación es conocido con exactitud. Si no, manda la ecografía del primer trimestre cuando difiere de la última menstruación en más de 5 a 7 días. Y sólo cuando la ecografía coincide, o cuando no hay ecografía temprana, se usa la última menstruación. Una vez fijada, la fecha no se vuelve a cambiar con ecografías posteriores.',
    },
    {
      q: '¿Cómo se calcula la fecha de parto en un embarazo por FIV?',
      a: 'Se cuenta desde el día de la transferencia embrionaria, descontando la edad que el embrión ya tenía. Como del momento de la fecundación al parto son 266 días, una transferencia de blastocisto de día 5 da fecha de parto a los 261 días de la transferencia, una de día 3 a los 264 días, y si contás desde la punción ovárica o la inseminación son los 266 días completos. Da igual si los embriones eran frescos o congelados: lo que cuenta es la fecha de la transferencia. Es el método más preciso que existe.',
    },
    {
      q: '¿Cuántos bebés nacen el día exacto de la fecha probable de parto?',
      a: 'Alrededor del 4%, o sea uno de cada veinticinco. La fecha probable de parto no es una predicción del día del nacimiento sino el centro de una distribución: dentro de la semana previa y la posterior nace alrededor de la mitad de los bebés, y dentro de las dos semanas para cada lado, la enorme mayoría. Sirve para programar controles, estudios y licencias, no para agendar el nacimiento.',
    },
    {
      q: '¿Cuál es el rango normal para nacer?',
      a: 'De la semana 37 a la 41+6. El ACOG divide ese rango en tramos: término temprano de 37 a 38+6, término completo de 39 a 40+6 y término tardío de 41 a 41+6. Antes de las 37 semanas es pretérmino y a partir de las 42 es postérmino. El mejor momento, en resultados de salud del recién nacido, es el término completo: entre las 39 y las 40+6 semanas.',
    },
    {
      q: '¿Qué pasa si me paso de las 40 semanas?',
      a: 'Nada raro: pasar la fecha es lo más común. Cerca de una de cada cinco embarazadas llega a la semana 41 y una parte menor a la 42. Lo que cambia es el seguimiento: a partir de las 41 semanas los controles se intensifican, aparecen monitoreos fetales y ecografías de líquido amniótico, y se conversa la posibilidad de una inducción. La recomendación habitual es ofrecer la inducción entre las 41 y las 42 semanas y no dejar pasar las 42 sin una conducta definida. La decisión es de tu equipo obstétrico con vos.',
    },
    {
      q: '¿Se puede adelantar o atrasar la fecha probable de parto?',
      a: 'La fecha en sí no se mueve una vez fijada: es una referencia de calendario. Lo que puede cambiar es el momento en que se planifica el nacimiento, y eso ocurre por indicación médica: embarazo gemelar, hipertensión, diabetes gestacional, restricción del crecimiento, placenta previa u otras situaciones que hagan preferible finalizar antes. Nada de eso se decide con una calculadora ni con remedios caseros para "adelantar el parto".',
    },
    {
      q: '¿Por qué mi ecografía dice una fecha y mi última menstruación otra?',
      a: 'Porque la última menstruación asume una ovulación el día 14 y la tuya pudo haber sido antes o después. Si la diferencia entre los dos métodos es de hasta 5 a 7 días en el primer trimestre, se considera concordante y se conserva la fecha de la menstruación. Si supera ese margen, se adopta la fecha ecográfica. Cuanto más avanzado el embarazo, más tolerancia tiene ese margen antes de cambiar la fecha, porque la ecografía pierde precisión para datar.',
    },
    {
      q: '¿Sirve esta fecha para tramitar la licencia por maternidad?',
      a: 'Sí, es la fecha de referencia con la que se calculan los plazos, pero el papel que vale es el certificado de tu obstetra con la fecha probable de parto. Presentalo con tiempo: en Argentina la licencia se toma habitualmente desde 45 días antes de esa fecha, y hay una opción de reducir ese tramo previo. Los plazos exactos y la documentación los define tu empleador y la normativa vigente, no esta calculadora.',
    },
    {
      q: '¿Cambia la fecha si espero mellizos o gemelos?',
      a: 'La fecha probable de parto se calcula igual, con las mismas 40 semanas. Lo que cambia es la semana en la que se planifica el nacimiento, que se adelanta según la corionicidad: en general alrededor de las 37 semanas en gemelares bicoriales y antes en los monocoriales. Es una decisión del equipo obstétrico y no una fecha que se pueda estimar acá.',
    },
    {
      q: '¿En qué se diferencia esto de calcular las semanas de embarazo?',
      a: 'Esta página mira hacia adelante: cuándo llega el bebé, con qué método se calcula esa fecha y cuánta incertidumbre tiene. El cálculo de semanas de embarazo mira el presente: de cuántas semanas estás hoy, en qué trimestre y qué mes vas, cuánto mide y pesa el bebé y qué control te toca. Si lo que necesitás es el estado de hoy, ese es el que te sirve; si lo que necesitás es la fecha y su margen, es este.',
    },
  ],

  sources: [
    {
      name: 'Methods for Estimating the Due Date — Committee Opinion 700',
      url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date',
      publisher: 'American College of Obstetricians and Gynecologists (ACOG)',
      date: '2017',
    },
    {
      name: 'Definition of Term Pregnancy — Committee Opinion 579',
      url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2013/11/definition-of-term-pregnancy',
      publisher: 'American College of Obstetricians and Gynecologists (ACOG)',
      date: '2013, reafirmado 2022',
    },
    {
      name: 'Management of Late-Term and Postterm Pregnancies — Practice Bulletin 146',
      url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2014/08/management-of-late-term-and-postterm-pregnancies',
      publisher: 'American College of Obstetricians and Gynecologists (ACOG)',
      date: '2014',
    },
    {
      name: 'Births: Final Data — distribución de nacimientos por semana de gestación',
      url: 'https://www.cdc.gov/nchs/products/nvsr.htm',
      publisher: 'National Center for Health Statistics (NCHS / CDC)',
    },
    {
      name: 'Recomendaciones de la OMS sobre atención prenatal para una experiencia positiva del embarazo',
      url: 'https://www.who.int/publications/i/item/9789241549912',
      publisher: 'Organización Mundial de la Salud',
      date: '2016',
    },
    {
      name: 'Recomendaciones para la práctica del control preconcepcional, prenatal y puerperal',
      url: 'https://www.argentina.gob.ar/salud/saludsexual',
      publisher: 'Ministerio de Salud de la Nación (Argentina)',
    },
  ],

  replaces: ['/calculadora-fecha-probable-parto', '/calculadora-doula-parto-acompanamiento-honorarios'],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Constantes de datación. Salen de la fórmula `fecha-parto.ts` (Naegele = 280
 * días desde la FUM) y del criterio ACOG 700 para FIV (266 días desde la
 * fecundación, menos la edad del embrión al transferirlo).
 */
export const PARTO = {
  /** Naegele: días de la FUM a la fecha probable de parto. */
  diasFumParto: 280,
  /** Días de la fecundación al parto. */
  diasConcepcionParto: 266,
  /** Ciclo de referencia que asume Naegele. */
  cicloBase: 28,
  /** Margen de la datación ecográfica del primer trimestre, en días. */
  margenEcoPrimerTrimestre: 7,
  /** Semanas que definen cada tramo (ACOG 579). */
  semanaPretermino: 37,
  semanaTerminoCompleto: 39,
  semanaTerminoTardio: 41,
  semanaPostermino: 42,
};

/**
 * Días que se suman a la fecha de referencia en un embarazo por FIV.
 * 266 − edad del embrión al momento de la transferencia (ACOG 700).
 */
export const FIV_OFFSET: Record<string, { dias: number; label: string }> = {
  d5: { dias: 261, label: 'transferencia de blastocisto (día 5)' },
  d3: { dias: 264, label: 'transferencia de día 3' },
  puncion: { dias: 266, label: 'punción ovárica o inseminación' },
};

/**
 * Distribución de nacimientos por tramo de edad gestacional en partos
 * espontáneos de un solo bebé (NCHS/CDC, redondeada). `from`/`to` son la
 * posición en la línea de tiempo del gráfico, que va de la semana 36 a la 43.
 */
export const TRAMOS: Array<{
  id: string;
  label: string;
  corto: string;
  pct: number;
  desdeSemana: number;
  hastaSemana: number;
  from: number;
  to: number;
  tone: 'good' | 'warn' | 'bad';
}> = [
  { id: 'pretermino', label: 'Pretérmino (antes de la semana 37)', corto: 'pretérmino', pct: 10, desdeSemana: 20, hastaSemana: 37, from: 0, to: 14, tone: 'bad' },
  { id: 'temprano', label: 'Término temprano (37 a 38+6)', corto: 'término temprano', pct: 26, desdeSemana: 37, hastaSemana: 39, from: 14, to: 43, tone: 'warn' },
  { id: 'completo', label: 'Término completo (39 a 40+6)', corto: 'término completo', pct: 41, desdeSemana: 39, hastaSemana: 41, from: 43, to: 71, tone: 'good' },
  { id: 'tardio', label: 'Término tardío (41 a 41+6)', corto: 'término tardío', pct: 17, desdeSemana: 41, hastaSemana: 42, from: 71, to: 86, tone: 'warn' },
  { id: 'postermino', label: 'Postérmino (42 en adelante)', corto: 'postérmino', pct: 6, desdeSemana: 42, hastaSemana: 45, from: 86, to: 100, tone: 'bad' },
];

/** Probabilidad de nacer dentro de una ventana centrada en la fecha probable de parto. */
export const VENTANAS: Array<{ dias: number; pct: number; label: string }> = [
  { dias: 0, pct: 4, label: 'Exactamente el día de la fecha probable de parto' },
  { dias: 3, pct: 23, label: 'Dentro de los 3 días previos o posteriores' },
  { dias: 7, pct: 50, label: 'Dentro de la semana previa o posterior' },
  { dias: 14, pct: 84, label: 'Dentro de las 2 semanas previas o posteriores' },
];
