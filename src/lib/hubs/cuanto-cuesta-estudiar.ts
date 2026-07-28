import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto cuesta estudiar?"
 * Arquetipo RAMIFICADO: 5 ramas = las 5 formas en que alguien llega a
 * preguntar por la plata que se le va en estudiar. Absorbe 7 URLs (ver
 * `replaces`).
 *
 * DINERO / YMYL: el `fineprint` y el primer `warn` de cada rama repiten el
 * disclaimer textual del dominio 'finance' de src/lib/disclaimers.ts.
 *
 * ARANCELES: no hay ni un monto hardcodeado en el copy. Todos los importes
 * entran por campo, con un valor de referencia editable, porque los aranceles
 * se actualizan varias veces por año y cualquier número escrito en el texto
 * queda viejo en semanas. Las calculadoras viejas que este hub absorbe sí
 * tenían aranceles congelados (ver reporte).
 *
 * FORMATO: hay plata (default 'ars') y también años, meses, cuotas y
 * porcentajes. Toda fila que no sea plata declara su `format` propio.
 */

export const DISCLAIMER =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'estudio/cuanto-cuesta-estudiar',
  title: '¿Cuánto cuesta estudiar? — Carrera privada, colegio, apuntes y beca',
  description:
    'Calculá lo que sale estudiar de verdad: la carrera privada completa con el aumento anual, el costo total con apuntes y transporte, la cuota de una universidad puntual, el año de colegio privado en CABA y cuánto te cubre la beca.',
  silo: 'Estudio',
  siloHref: '/estudio',

  eyebrow: 'Guía y estimación de costos de estudio',
  h1: '¿Cuánto cuesta estudiar?',
  lede:
    'Arrancamos por la pregunta más común: cuánto sale la carrera completa en una universidad privada, cuotas por meses por años y con el aumento anual encima. Si tu caso es otro —el costo total con apuntes y transporte, una universidad puntual, el año de colegio privado o cuánto te cubre la beca— lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', '7 cuentas de costos adentro', 'Aranceles editables, no congelados'],

  resultLabel: 'Lo que te sale',

  cases: {
    title: '¿Qué querés averiguar?',
    intro:
      'Elegí tu situación. Cada rama usa distintos campos del formulario y el desglose te muestra exactamente qué entró en la cuenta.',
    items: [
      {
        id: 'carrera-completa',
        label: 'La carrera completa en una universidad privada',
        hint: 'Cuotas × meses × años, con aumento anual',
        answer:
          'Multiplicás la cuota por los meses que se cobran al año, por los años de la carrera, y le sumás el aumento anual de arancel.',
        yes: [
          'Cuotas de todos los años, con el aumento anual aplicado año contra año',
          'Matrícula o derecho de inscripción, una vez por año',
          'Te muestra el total, el promedio por año y el prorrateo por mes',
          'Te muestra a cuánto llega la cuota del último año, que es el número que sorprende',
        ],
        warn: [
          DISCLAIMER,
          'La cuota de hoy no es la cuota de dentro de cuatro años: si no proyectás el aumento, el total te queda corto por lejos',
          'Fijate si tu universidad cobra 10 o 12 cuotas por año, cambia el total mucho más de lo que parece',
          'Esta rama cuenta aranceles solamente. Apuntes, transporte y materiales van en la rama de costo total',
        ],
        plazo: 'las universidades publican el arancel del año en su web entre noviembre y febrero: pedí el cuadro tarifario antes de inscribirte.',
      },
      {
        id: 'costo-total',
        label: 'El costo total, no sólo la cuota',
        hint: 'Apuntes, transporte, materiales y matrícula',
        answer:
          'Al arancel le sumás apuntes, materiales y transporte todos los meses: ahí aparece el costo real de estudiar.',
        yes: [
          'Cuotas del año más la matrícula anual',
          'Apuntes, fotocopias, libros y materiales, mes a mes',
          'Transporte, mes a mes y los 12 meses (el gasto no se corta en el receso)',
          'Total de la carrera, por año y por mes, con el peso de cada rubro en el gráfico',
        ],
        warn: [
          DISCLAIMER,
          'Los rubros que no son la cuota suelen ser el que más se subestima: cargalos con lo que gastás de verdad, no con lo que te gustaría gastar',
          'Si vivís solo o te mudás para estudiar, el alquiler no está acá: sumalo aparte, es otra escala de gasto',
          'Esta rama toma los valores de hoy, sin proyectar inflación. Para proyectar usá la rama de carrera completa',
        ],
        plazo: 'guardá tres meses de gastos reales antes de armar el presupuesto: la estimación de memoria siempre queda baja.',
      },
      {
        id: 'una-universidad',
        label: 'La cuota de una universidad puntual',
        hint: 'Cuota + matrícula de una uni concreta',
        answer:
          'Cuota mensual por la cantidad de cuotas del año, más la matrícula: eso te da el año y, por los años de carrera, el total.',
        yes: [
          'Costo del año académico: cuotas del año más matrícula',
          'Costo de la carrera entera con ese arancel',
          'Prorrateo mensual sobre los 12 meses, para comparar con tu ingreso',
          'Sirve para comparar dos universidades poniendo el arancel de cada una',
        ],
        warn: [
          DISCLAIMER,
          'Las universidades más caras publican el arancel en dólares: pasalo a pesos al tipo de cambio del día antes de cargarlo',
          'Hay carreras que duran más que otras en la misma universidad: medicina no cuesta lo mismo que administración aunque la cuota sea igual',
          'Esta rama no proyecta el aumento anual: es el arancel de hoy repetido. Para proyectar usá la rama de carrera completa',
        ],
        plazo: 'pedí el arancel por escrito: cuota, matrícula, cantidad de cuotas y qué queda afuera (exámenes, laboratorios, materiales).',
      },
      {
        id: 'colegio',
        label: 'El año de colegio privado',
        hint: 'Matrícula + cuotas + aranceles extra',
        answer:
          'El año de colegio no son sólo las 10 cuotas: matrícula, uniformes, cooperadora, libros y salidas suman otro tanto encima.',
        yes: [
          'Las cuotas del ciclo lectivo, con la cantidad que cobre el colegio',
          'Los extras del año estimados como un múltiplo de la cuota: matrícula, uniformes, cooperadora, libros y viajes',
          'El total del año y el prorrateo mensual sobre 12 meses',
        ],
        warn: [
          DISCLAIMER,
          'Los colegios con aporte estatal tienen aranceles regulados y los que no lo tienen actualizan libremente: preguntá en cuál está el tuyo',
          'La matrícula se cobra antes de que empiecen las clases, así que el mes de arranque pega el doble',
          'Los extras varían muchísimo por colegio: si tenés el detalle real del año pasado, cargalo en vez del estimado',
        ],
        plazo: 'la matrícula del ciclo siguiente se suele cobrar entre octubre y diciembre: es el momento de comparar.',
      },
      {
        id: 'beca',
        label: 'Cuánto me cubre la beca',
        hint: 'Cobertura, bolsillo y ahorro total',
        answer:
          'La beca se mide como porcentaje del costo mensual: lo que no cubre es lo que ponés vos, todos los meses.',
        yes: [
          'Porcentaje del costo mensual que cubre la beca',
          'Lo que te queda de bolsillo cada mes',
          'El ahorro acumulado durante toda la carrera',
          'Sirve igual para beca de la universidad, beca del Estado o media beca por hermano',
        ],
        warn: [
          DISCLAIMER,
          'Casi todas las becas piden un promedio mínimo y una cantidad de materias por año para renovarse: mirá cuánto te falta en la calculadora de promedio antes de contar con la beca',
          'Muchas becas cubren sólo la cuota y no la matrícula, los materiales ni el transporte: fijate qué entra',
          'Una beca al 100% del arancel igual te deja pagando el costo total de estudiar, que es bastante más que el arancel',
        ],
        plazo: 'la renovación se pide todos los años y se pierde por promedio o por materias: anotate la fecha de la convocatoria.',
      },
    ],
  },

  inputsTitle: 'Cargá tus números',
  inputsIntro:
    'Los valores que ves son de referencia y están para que los pises con los tuyos. Cada rama usa los campos que le corresponden e ignora el resto.',
  fields: [
    {
      id: 'cuota',
      label: 'Cuota mensual',
      prefix: '$',
      value: '450.000',
      thousands: true,
      help: 'El arancel mensual que cobra la institución. Valor de referencia editable: los aranceles se actualizan varias veces por año, poné el tuyo.',
    },
    {
      id: 'meses',
      label: 'Cuotas por año',
      type: 'number',
      min: 1,
      max: 12,
      value: 10,
      help: 'La mayoría cobra 10 cuotas; algunas universidades cobran 12.',
    },
    { id: 'anios', label: 'Años que dura', type: 'number', min: 1, max: 12, value: 5 },
    {
      id: 'matricula',
      label: 'Matrícula o inscripción por año',
      prefix: '$',
      value: '500.000',
      thousands: true,
      help: 'Dejala en 0 si tu institución no la cobra.',
    },
    {
      id: 'apuntes',
      label: 'Apuntes, libros y materiales por mes',
      prefix: '$',
      value: '40.000',
      thousands: true,
    },
    { id: 'transporte', label: 'Transporte por mes', prefix: '$', value: '60.000', thousands: true },
    {
      id: 'aumento',
      label: 'Aumento anual estimado del arancel (%)',
      type: 'number',
      min: 0,
      max: 300,
      value: 25,
      help: 'Cuánto pensás que sube el arancel cada año. Mirá la inflación del último año como referencia.',
    },
    {
      id: 'beca',
      label: 'Lo que cubre la beca por mes',
      prefix: '$',
      value: '250.000',
      thousands: true,
      help: 'Si tu beca es un porcentaje, poné ese porcentaje de la cuota.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'En qué se te va la plata',
    caption:
      'Cada porción es un rubro del costo: cuotas, matrículas, materiales y transporte. Lo que sorprende casi siempre no es la cuota.',
  },
  breakdownTitle: 'Qué pesa en el costo',
  breakdownIntro: 'Las barras comparan cada rubro con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cuánto cuesta una carrera en una universidad privada en Argentina?',
      a: 'Depende de la universidad y de la carrera, y el arancel cambia varias veces por año, así que cualquier número fijo queda viejo enseguida. La cuenta que sirve es la de esta página: cuota mensual × cuotas por año × años de carrera, más la matrícula de cada año y el aumento anual del arancel. Con esos cuatro datos, sacados del cuadro tarifario de la universidad, tenés el total real.',
    },
    {
      q: '¿Por qué el total me da mucho más alto que cuota × meses × años?',
      a: 'Porque el arancel sube todos los años. Si la carrera dura cinco años y el arancel sube un 25% anual, la cuota del último año es más del doble que la del primero. Multiplicar la cuota de hoy por todos los meses de la carrera subestima el total de manera sistemática.',
    },
    {
      q: '¿Las universidades cobran 10 o 12 cuotas por año?',
      a: 'Las dos cosas existen. Lo más habitual son 10 cuotas de marzo a diciembre, pero varias universidades cobran 12. Entre un esquema y otro hay un 20% de diferencia en el arancel anual, así que es lo primero que conviene confirmar antes de comparar dos instituciones.',
    },
    {
      q: '¿Qué gastos hay además de la cuota?',
      a: 'Matrícula o derecho de inscripción anual, apuntes, fotocopias y libros, materiales específicos de la carrera (instrumental, insumos, indumentaria), transporte, y en algunas carreras aranceles por examen, laboratorio o práctica profesional. Sumados suelen representar una parte importante del costo, sobre todo si la cuota no es alta.',
    },
    {
      q: '¿Estudiar en una universidad pública es gratis?',
      a: 'La carrera de grado en las universidades nacionales no tiene arancel, pero estudiar igual cuesta: apuntes, materiales, transporte y, si te mudás, alojamiento y comida. La rama de costo total de esta página sirve exactamente para eso: poné la cuota en 0 y vas a ver el gasto que queda igual.',
    },
    {
      q: '¿Cuánto cuesta un colegio privado en CABA?',
      a: 'Varía enormemente según si el colegio tiene aporte estatal, si es bilingüe y en qué nivel está el chico. Los colegios con aporte del Estado tienen aranceles regulados; los que no lo reciben los actualizan libremente. La cuenta útil es cuotas del ciclo lectivo más los extras del año: matrícula, uniformes, cooperadora, libros y salidas.',
    },
    {
      q: '¿Cuánto pesan los extras en el colegio privado?',
      a: 'La estimación habitual es que los extras de todo el año equivalen a una cuota y media adicional: matrícula, uniforme, cooperadora, libros, materiales y viajes. Es un promedio grueso; si tenés el detalle de lo que gastaste el año pasado, ese número siempre le gana a la estimación.',
    },
    {
      q: '¿Qué promedio me piden para mantener la beca?',
      a: 'Depende de la beca. Progresar pide un promedio mínimo y una cantidad de materias aprobadas por año; las becas de mérito de las universidades privadas suelen pedir más, y las de investigación más todavía. Si querés saber si llegás, calculá tu promedio primero: quedar abajo del corte te deja afuera aunque el resto de la postulación esté impecable.',
    },
    {
      q: 'Tengo una beca del 50%: ¿me sale la mitad estudiar?',
      a: 'No. Casi todas las becas se aplican sobre el arancel y no sobre la matrícula, los materiales ni el transporte. Un 50% del arancel puede terminar siendo un 35% del costo total real. Por eso conviene calcular la cobertura sobre el costo mensual completo, que es lo que hace la rama de beca.',
    },
    {
      q: '¿Conviene pagar la carrera al contado o en cuotas?',
      a: 'Con inflación alta, pagar por adelantado sólo conviene si el descuento por pago anticipado supera lo que rendiría esa plata en ese plazo. Muchas universidades ofrecen descuento por pago anual adelantado: compará ese descuento contra el rendimiento de una colocación a plazo equivalente antes de decidir.',
    },
    {
      q: '¿Los aranceles educativos se pueden deducir de Ganancias?',
      a: 'La normativa de Ganancias contempla una deducción por gastos de educación con un tope calculado sobre la ganancia no imponible, para el contribuyente y sus hijos a cargo. El alcance y el tope se actualizan, así que conviene confirmarlos con ARCA o con un contador antes de contar con ese ahorro.',
    },
    {
      q: '¿Por qué esta página no muestra los aranceles de cada universidad?',
      a: 'Porque cambian varias veces por año y publicarlos congelados sería peor que no publicarlos: te haría planificar con un número viejo. Todos los importes de esta página son campos editables con un valor de referencia. El arancel real lo tenés en el cuadro tarifario de la institución, que es la única fuente que no se desactualiza.',
    },
  ],

  sources: [
    {
      name: 'Becas Progresar — requisitos, montos y convocatorias',
      url: 'https://www.argentina.gob.ar/educacion/progresar',
      publisher: 'Ministerio de Capital Humano — Secretaría de Educación',
    },
    {
      name: 'Portal de educación superior: universidades y carreras reconocidas',
      url: 'https://www.argentina.gob.ar/educacion/validez-titulos',
      publisher: 'Secretaría de Educación de la Nación',
    },
    {
      name: 'Aranceles de institutos de gestión privada con aporte estatal',
      url: 'https://buenosaires.gob.ar/educacion/dgegp',
      publisher: 'Dirección General de Educación de Gestión Privada — GCBA',
    },
    {
      name: 'Índice de precios al consumidor (IPC): educación',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
    },
    {
      name: 'Deducción de gastos de educación en el Impuesto a las Ganancias',
      url: 'https://www.arca.gob.ar/ganancias/',
      publisher: 'ARCA (ex AFIP)',
    },
  ],

  replaces: [
    '/calculadora-costo-carrera-privada',
    '/calculadora-costo-carrera-total',
    '/calculadora-costo-universidad-privada-cuota',
    '/calculadora-itba-utdt-costo-carrera-anual-privada',
    '/calculadora-ingreso-colegio-privado-cuota-anual-caba',
    '/calculadora-becas-porcentaje-cobertura',
    '/calculadora-beca-promedio-minimo-requisito-universidades',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Supuestos por rama. `inflar` proyecta el aumento anual del arancel;
 * `extrasCuotas` son los extras del año escolar medidos en cuotas (espejo del
 * 1,5 de la calculadora de colegio privado que este hub absorbe).
 */
export const CASE_MATH: Record<string, { inflar: boolean; vida: boolean; extrasCuotas: number }> = {
  'carrera-completa': { inflar: true, vida: false, extrasCuotas: 0 },
  'costo-total': { inflar: false, vida: true, extrasCuotas: 0 },
  'una-universidad': { inflar: false, vida: false, extrasCuotas: 0 },
  colegio: { inflar: false, vida: false, extrasCuotas: 1.5 },
  beca: { inflar: false, vida: true, extrasCuotas: 0 },
};
