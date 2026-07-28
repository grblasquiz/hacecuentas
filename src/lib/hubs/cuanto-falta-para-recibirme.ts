import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me falta para recibirme?"
 * Arquetipo RAMIFICADO: 5 ramas = las 5 formas en que un estudiante mide
 * cuánto le queda de carrera. Absorbe 6 URLs (ver `replaces`).
 *
 * Vive en /estudio junto al hub de promedio: la pregunta no es de calendario
 * ni de matemática, es de vida académica —cuándo me recibo, si voy atrasado,
 * cuánto tengo que cursar por cuatrimestre para llegar—.
 *
 * FORMATO: no hay plata en ninguna rama. El default de HubRow es 'ars' y
 * Object.assign copia undefined, así que TODA fila declara su formato:
 * 'plain' para materias, créditos y cuatrimestres; 'unit' para años, meses,
 * horas y porcentajes.
 *
 * DUPLICADOS DEL CATÁLOGO VIEJO (ver reporte):
 *  - `cuantas-materias-faltan` y `duracion-carrera-universidad` estimaban lo
 *    mismo con constantes distintas: la primera ignora la tasa de aprobación
 *    (equivale a 100%) y la segunda la fija en 70% por defecto. Para 40
 *    materias con 24 aprobadas y 4 por cuatrimestre daban 3 y 6 cuatrimestres.
 *    El hub unifica en una sola cuenta con la tasa como campo visible.
 *  - `creditos-restantes-carrera` y `creditos-universitarios-avance` calculan
 *    el mismo porcentaje con distinto redondeo (1 vs 2 decimales) y distinto
 *    manejo del borde (una clampea, la otra tira error). El hub usa 2
 *    decimales y clampea.
 */
export const hub: HubData = {
  slug: 'estudio/cuanto-falta-para-recibirme',
  title: '¿Cuánto me falta para recibirme? — Materias, cuatrimestres y créditos',
  description:
    'Calculá cuántas materias te faltan y el porcentaje de la carrera que llevás, en cuántos cuatrimestres terminás según tu ritmo, cuánto vas a tardar en total frente a la duración teórica del plan y cuántas horas de estudio te pide cada materia.',
  silo: 'Estudio',
  siloHref: '/estudio',

  eyebrow: 'Guía y calculadora de estudio',
  h1: '¿Cuánto me falta para recibirme?',
  lede:
    'Empezamos por lo primero que uno quiere saber: cuántas materias faltan y qué porcentaje de la carrera llevás. Si tu caso es otro —cuántos cuatrimestres te quedan a tu ritmo, cuánto vas a tardar en total contra la duración del plan, cómo va tu avance en créditos o cuántas horas de estudio te pide una materia— lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '5 cuentas de avance de carrera', 'Materias, créditos y horas'],

  resultLabel: 'Lo que te falta',

  cases: {
    title: '¿Cómo querés medir lo que te falta?',
    intro:
      'Elegí tu situación. Los campos que usa cada rama cambian, y el desglose te muestra exactamente qué entró en la cuenta.',
    items: [
      {
        id: 'materias',
        label: 'Cuántas materias me faltan y cuánto llevo',
        hint: 'Ej.: "tengo 24 de 40, ¿en qué porcentaje voy?"',
        answer: 'Restás las materias aprobadas al total del plan y dividís por el total para sacar el porcentaje.',
        yes: [
          'Fórmula: materias que faltan = total del plan − aprobadas − en curso',
          'Avance real = aprobadas ÷ total × 100 (sólo lo que ya está aprobado)',
          'El desglose te separa el avance real del avance optimista, que suma las materias en curso como si ya estuvieran aprobadas',
          'También te dice cuántas te faltan para llegar a la mitad y a los tres cuartos de la carrera',
        ],
        warn: [
          'Una materia en curso no es una materia aprobada: contarla como avance es la forma más común de creerse más cerca de lo que se está',
          'El "total del plan" es el que figura en tu plan de estudios vigente, con las materias optativas y los idiomas incluidos: casi todos los planes tienen requisitos que no aparecen en la grilla principal',
          'Si cambiaste de plan de estudios, las materias equivalentes tienen que estar reconocidas por resolución para que cuenten',
        ],
        plazo: 'chequeo: aprobadas + en curso + faltantes tiene que dar exactamente el total del plan.',
      },
      {
        id: 'cuatrimestres',
        label: 'En cuántos cuatrimestres termino',
        hint: 'Ej.: "si curso 4 por cuatrimestre, ¿cuántos me quedan?"',
        answer: 'Dividís las materias que te faltan por las que aprobás por cuatrimestre y redondeás hacia arriba.',
        yes: [
          'Fórmula: cuatrimestres = redondeo hacia arriba de (materias que faltan ÷ materias que aprobás por cuatrimestre)',
          'Las que aprobás por cuatrimestre = las que cursás × tu tasa de aprobación',
          'Años = cuatrimestres ÷ cuatrimestres por año (2 en el calendario normal, 3 si cursás también en verano)',
          'El desglose te compara tu ritmo actual con el de cursar una materia más por cuatrimestre',
        ],
        warn: [
          'La tasa de aprobación es el dato que más mueve el resultado: cursar 5 con 60% de aprobación rinde menos que cursar 4 con 90%',
          'Las correlatividades pueden frenarte aunque tengas tiempo: hay cuatrimestres en los que no vas a poder cursar todo lo que querías',
          'El redondeo va hacia arriba: si te sobra media materia, igual necesitás el cuatrimestre entero',
        ],
        plazo: 'las inscripciones a materias abren unas semanas antes de cada cuatrimestre: perder la ventana te cuesta medio año.',
      },
      {
        id: 'total',
        label: 'Cuánto voy a tardar en total (real vs plan)',
        hint: 'Ej.: "el plan dice 5 años, ¿cuántos me van a salir?"',
        answer: 'Sumás los años que ya cursaste a los que te faltan y lo comparás con la duración teórica del plan.',
        yes: [
          'Duración real = años que llevás cursando + años que te faltan a tu ritmo',
          'La diferencia contra la duración teórica del plan es tu sobre-tiempo, en años y en porcentaje',
          'En la Argentina la duración real promedio de una carrera de grado supera bastante a la teórica: terminar en el tiempo del plan es la excepción, no la regla',
          'El desglose te dice qué ritmo por cuatrimestre necesitarías para cerrar dentro de la duración teórica',
        ],
        warn: [
          'Recibirse tarde no tiene costo académico en la universidad pública, pero sí puede hacerte perder becas, seguros de salud y beneficios que exigen regularidad',
          'Muchos planes caducan: si tu plan se dio de baja, puede que tengas que migrar al nuevo y rendir equivalencias',
          'El cálculo asume ritmo constante: en la práctica el ritmo cae en los años de tesis, prácticas o trabajo full time',
        ],
        plazo: 'revisá el régimen de regularidad de tu facultad: casi todas exigen un mínimo de materias aprobadas por año para no perder la condición de alumno regular.',
      },
      {
        id: 'creditos',
        label: 'Cuántos créditos me faltan',
        hint: 'Ej.: "el plan pide 240 créditos y tengo 180"',
        answer: 'Restás los créditos aprobados al total del plan y dividís por el total para sacar el avance.',
        yes: [
          'Fórmula: créditos que faltan = créditos del plan − créditos aprobados',
          'Avance = créditos aprobados ÷ créditos del plan × 100',
          'Cuatrimestres que faltan = redondeo hacia arriba de (créditos que faltan ÷ créditos que aprobás por cuatrimestre)',
          'Sirve igual para planes por créditos y para planes por materias: en ese caso poné materias donde dice créditos',
        ],
        warn: [
          'El avance en créditos no es el mismo que el avance en materias: las materias de más carga horaria pesan más, así que podés tener 60% de las materias y 50% de los créditos',
          'Muchos planes exigen créditos mínimos por área (obligatorias, optativas, prácticas): llegar al total no alcanza si te falta cubrir un área',
          'Las prácticas profesionales, el idioma y la tesis suelen tener créditos propios que no aparecen en el listado de materias',
        ],
        plazo: 'chequeo: créditos aprobados + créditos que faltan tiene que dar el total del plan.',
      },
      {
        id: 'horas',
        label: 'Cuántas horas de estudio me pide esta materia',
        hint: 'Ej.: "6 horas de clase, ¿cuántas de estudio propio?"',
        answer: 'Multiplicás las horas de clase por el factor de estudio de la materia.',
        yes: [
          'Fórmula: horas por materia = horas de clase semanales × factor de estudio',
          'El factor es cuántas horas totales dedicás por cada hora de clase: 2 es una materia liviana, 2,5 una cursada normal, 3 una materia técnica y 4 o más una carrera de alta demanda',
          'Las horas de estudio propio son la diferencia: horas totales − horas de clase',
          'El desglose te cruza el resultado con el estándar por créditos, que estima las horas a partir de la carga del plan en vez de las horas de clase',
        ],
        warn: [
          'El factor de estudio es una estimación de planificación, no una regla oficial: cada materia y cada persona tienen el suyo',
          'Por encima de 45 horas semanales la carga es alta y es difícil sostenerla junto con un trabajo: ahí conviene bajar una materia antes que arrastrar cuatro',
          'La estimación es de semana promedio: las semanas de parciales y de entrega de trabajos prácticos se van muy por encima',
        ],
        plazo: 'planificá con la semana de parciales adentro: si tu semana promedio ya está al límite, la de parciales no entra.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos',
  inputsIntro:
    'Cada rama usa los campos que necesita y deja el resto quieto. Los valores de ejemplo son los de una carrera de grado típica de 40 materias y 5 años de plan.',
  fields: [
    { id: 'totalMaterias', label: 'Total de materias de la carrera', type: 'number', min: 1, max: 120, step: 1, value: 40, help: 'El que figura en tu plan de estudios, con optativas e idiomas incluidos.' },
    { id: 'materiasAprobadas', label: 'Materias ya aprobadas', type: 'number', min: 0, max: 120, step: 1, value: 24 },
    { id: 'materiasEnCurso', label: 'Materias que estás cursando ahora', type: 'number', min: 0, max: 15, step: 1, value: 4, help: 'No cuentan como avance real hasta que las apruebes: el desglose te muestra las dos lecturas.' },
    { id: 'materiasPorCuatri', label: 'Materias que cursás por cuatrimestre', type: 'number', min: 1, max: 12, step: 1, value: 4 },
    {
      id: 'tasaAprobacion',
      label: 'Tasa de aprobación',
      type: 'number',
      min: 10,
      max: 100,
      step: 5,
      suffix: '%',
      value: 70,
      help: 'De cada 10 materias que cursás, cuántas aprobás. En universidades públicas suele estar entre 60% y 75%. Poné 100 si aprobás todo lo que cursás.',
    },
    { id: 'cuatrisPorAnio', label: 'Cuatrimestres por año', type: 'number', min: 1, max: 3, step: 1, value: 2, help: '2 es el calendario normal (primer y segundo cuatrimestre). 3 si cursás también en verano.' },
    { id: 'aniosCursados', label: 'Años que llevás cursando', type: 'number', min: 0, max: 30, step: 0.5, value: 4 },
    { id: 'duracionTeorica', label: 'Duración teórica del plan', type: 'number', min: 1, max: 12, step: 0.5, suffix: 'años', value: 5 },
    { id: 'creditosTotales', label: 'Créditos totales del plan', type: 'number', min: 1, step: 1, value: 240, help: 'Si tu carrera no usa créditos, poné acá el total de materias.' },
    { id: 'creditosAprobados', label: 'Créditos ya aprobados', type: 'number', min: 0, step: 1, value: 180 },
    { id: 'creditosPorCuatri', label: 'Créditos que aprobás por cuatrimestre', type: 'number', min: 1, step: 1, value: 30 },
    { id: 'horasClase', label: 'Horas de clase semanales de la materia', type: 'number', min: 1, max: 40, step: 1, value: 6 },
    {
      id: 'factorEstudio',
      label: 'Factor de estudio',
      type: 'number',
      min: 1,
      max: 5,
      step: 0.5,
      value: 2.5,
      help: 'Horas totales por cada hora de clase. 2 = materia liviana · 2,5 = cursada normal · 3 = materia técnica · 4+ = alta demanda.',
    },
    { id: 'cantidadMaterias', label: 'Cuántas materias cursás este cuatrimestre', type: 'number', min: 1, max: 12, step: 1, value: 4 },
    {
      id: 'sistemaCredito',
      label: 'Sistema de créditos de tu plan',
      type: 'select',
      value: 'rtf15',
      options: [
        { value: 'rtf15', label: 'Argentina — 1 crédito ≈ 15 horas de trabajo' },
        { value: 'ects25', label: 'ECTS (Europa) — 1 crédito = 25 horas' },
        { value: 'ects30', label: 'ECTS (Europa) — 1 crédito = 30 horas' },
        { value: 'us45', label: 'EE.UU. — 1 semester credit ≈ 45 horas' },
      ],
      help: 'Sólo la rama de horas: sirve para cruzar el resultado con lo que estima el plan por su carga en créditos.',
    },
    { id: 'creditosMateria', label: 'Créditos de esa materia', type: 'number', min: 1, max: 60, step: 1, value: 8 },
  ],
  fineprint:
    'Es una estimación de planificación. Las correlatividades, los cupos de cursada, los planes que caducan y el régimen de regularidad de cada facultad pueden cambiar el resultado. El dato oficial de tu avance es el del certificado analítico que emite tu casa de estudios.',

  chart: {
    type: 'progress',
    title: 'Cuánto llevás de la carrera',
    caption:
      'La barra ubica tu avance sobre el total: el marcador es dónde estás y las franjas son los cuatro tramos de la carrera. En las ramas de tiempo el marcador muestra qué porción del recorrido total ya cursaste; en la de horas, cuán cargada está tu semana frente al límite razonable.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Cada fila es un paso de la cuenta: primero los datos que entraron, después la resta o la división, y al final los chequeos y las comparaciones que te dicen si vas bien o si conviene cambiar el ritmo.',

  faq: [
    {
      q: '¿Cómo calculo cuántas materias me faltan para recibirme?',
      a: 'Restás al total del plan las materias aprobadas y las que estás cursando: <b>faltantes = total − aprobadas − en curso</b>. Con un plan de 40 materias, 24 aprobadas y 4 en curso, te faltan <b>12</b>. Ojo con el total: tiene que ser el del plan de estudios vigente, con optativas, idiomas y prácticas incluidas.',
    },
    {
      q: '¿Qué porcentaje de la carrera llevo?',
      a: 'Se calcula sobre lo <b>aprobado</b>: avance = aprobadas ÷ total × 100. Con 24 de 40 llevás <b>60%</b>. Si sumás las 4 materias en curso el número sube a 70%, pero ese es un avance optimista: una materia en curso no es una materia aprobada. El hub te muestra las dos lecturas para que no te confundas de número.',
    },
    {
      q: '¿En cuántos cuatrimestres termino si curso 4 materias por vez?',
      a: 'Cuatrimestres = materias que faltan ÷ materias que <b>aprobás</b> por cuatrimestre, redondeado hacia arriba. Si te faltan 12 y cursás 4 aprobando el 70%, aprobás 2,8 por cuatrimestre, así que necesitás <b>5</b> cuatrimestres, no 3. La tasa de aprobación es el dato que más mueve el resultado.',
    },
    {
      q: '¿Por qué distintas calculadoras me dan distinta cantidad de cuatrimestres?',
      a: 'Porque algunas suponen que aprobás todo lo que cursás y otras aplican una tasa de aprobación. Con 12 materias faltantes y 4 por cuatrimestre, suponiendo 100% de aprobación da 3 cuatrimestres y con 70% da 5. Ninguna está mal: cambian el supuesto. Por eso acá la tasa es un campo visible y no una constante escondida.',
    },
    {
      q: '¿Cuánto tarda en promedio una carrera de grado en la Argentina?',
      a: 'Bastante más que su duración teórica. Las carreras de grado suelen estar planificadas en 5 años y la duración real promedio se estira varios años por encima, sobre todo en las universidades públicas, donde la mayoría de los estudiantes trabaja. Terminar en el tiempo del plan es la excepción, no la regla, así que ir por encima de la duración teórica no significa que estés atrasado respecto de tus compañeros.',
    },
    {
      q: '¿Cómo paso cuatrimestres a años?',
      a: 'Dividís por los cuatrimestres que cursás por año: <b>años = cuatrimestres ÷ cuatrimestres por año</b>. Con el calendario normal son 2 por año, así que 5 cuatrimestres son 2,5 años. Si además cursás en verano son 3 por año y los mismos 5 cuatrimestres caen a 1,7 años. Muchas calculadoras dan por sentado que son 2 y no te dejan cambiarlo.',
    },
    {
      q: '¿Cuántos créditos me faltan para recibirme?',
      a: 'Créditos que faltan = créditos del plan − créditos aprobados, y el avance es aprobados ÷ total × 100. Con 180 de 240 llevás <b>75%</b> y te faltan <b>60</b> créditos: a 30 créditos por cuatrimestre son 2 cuatrimestres. Fijate además si tu plan exige mínimos por área, porque llegar al total no alcanza si te falta cubrir optativas o prácticas.',
    },
    {
      q: '¿Es lo mismo el avance en materias que el avance en créditos?',
      a: 'No. El avance en créditos pondera por la carga de cada materia, así que si aprobaste sobre todo materias livianas vas a tener un porcentaje de materias más alto que de créditos, y al revés. Cuando la beca o el trámite piden un porcentaje de avance, verificá cuál de los dos están midiendo: la diferencia entre uno y otro puede ser de varios puntos.',
    },
    {
      q: '¿Cuántas horas por semana tengo que estudiar por materia?',
      a: 'La regla de planificación más usada es multiplicar las horas de clase por un factor: 2 para una materia liviana, 2,5 para una cursada normal, 3 para una materia técnica y 4 o más para carreras de alta demanda. Con 6 horas de clase y factor 2,5 son <b>15 horas semanales</b> por materia: 6 de clase y 9 de estudio propio.',
    },
    {
      q: '¿Cuántas materias puedo cursar si trabajo?',
      a: 'Depende de la carga que te deje el trabajo. Con el factor 2,5 sobre 6 horas de clase, cada materia se lleva unas 15 horas semanales: dos materias son 30 horas y cuatro son 60, que sobre una jornada laboral no entran. Como referencia práctica, por encima de <b>45 horas semanales</b> de estudio la carga es difícil de sostener durante todo un cuatrimestre.',
    },
    {
      q: '¿Cuántas horas de trabajo representa un crédito?',
      a: 'Depende del sistema. En la Argentina la referencia habitual es que un crédito equivale a unas <b>15 horas reloj</b> de actividad académica. En el sistema europeo ECTS un crédito son <b>25 a 30 horas</b> de trabajo total del estudiante, incluidas las de estudio autónomo, y un <i>semester credit</i> estadounidense ronda las 45 horas por semestre. Por eso los números de créditos de dos planes no son comparables sin convertirlos.',
    },
    {
      q: '¿Recibirme más tarde que la duración del plan me trae algún problema?',
      a: 'Académicamente no: el título es el mismo. Lo que sí puede pasar es que pierdas beneficios atados a la regularidad —becas, seguro de salud, obra social de estudiante, tarifas de transporte— porque casi todas exigen un mínimo de materias aprobadas por año. El otro riesgo es el plan de estudios: si el tuyo se da de baja, puede que tengas que migrar al nuevo y rendir equivalencias.',
    },
  ],

  sources: [
    {
      name: 'Síntesis de Información Estadística Universitaria — duración real y teórica de las carreras',
      url: 'https://www.argentina.gob.ar/educacion/universidades/informacion/publicaciones/sintesis',
      publisher: 'Secretaría de Políticas Universitarias — Ministerio de Educación (Argentina)',
    },
    {
      name: 'Sistema universitario argentino — planes de estudio, regularidad y títulos',
      url: 'https://www.argentina.gob.ar/educacion/universidades',
      publisher: 'Ministerio de Educación de la Nación',
    },
    {
      name: 'Ley 24.521 de Educación Superior — planes de estudio y condición de alumno regular',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25394/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'ECTS Users’ Guide — un crédito equivale a 25-30 horas de trabajo del estudiante',
      url: 'https://education.ec.europa.eu/education-levels/higher-education/inclusive-and-connected-higher-education/european-credit-transfer-and-accumulation-system',
      publisher: 'Comisión Europea',
    },
    {
      name: 'Consejo Interuniversitario Nacional — acuerdos sobre carga horaria y reconocimiento de trayectos',
      url: 'https://www.cin.edu.ar/',
      publisher: 'CIN',
    },
    {
      name: 'CONEAU — estándares de acreditación y carga horaria mínima de las carreras',
      url: 'https://www.coneau.gob.ar/coneau/',
      publisher: 'Comisión Nacional de Evaluación y Acreditación Universitaria',
    },
  ],

  replaces: [
    '/calculadora-materias-faltan-recibirte',
    '/calculadora-duracion-carrera-materias-por-cuatrimestre',
    '/calculadora-duracion-carrera-universidad',
    '/calculadora-creditos-restantes-carrera',
    '/calculadora-creditos-universitarios-avance',
    '/calculadora-horas-estudio-materia-creditos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Horas de trabajo del estudiante que representa 1 crédito, por sistema. */
export const CREDITO_HORAS: Record<string, { horas: number; nombre: string }> = {
  rtf15: { horas: 15, nombre: 'Argentina (≈15 hs por crédito)' },
  ects25: { horas: 25, nombre: 'ECTS (25 hs por crédito)' },
  ects30: { horas: 30, nombre: 'ECTS (30 hs por crédito)' },
  us45: { horas: 45, nombre: 'EE.UU. (≈45 hs por semester credit)' },
};
