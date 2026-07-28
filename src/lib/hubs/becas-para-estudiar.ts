import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto voy a cobrar de beca para estudiar y qué me descuentan?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cinco ramas: Progresar superior/universitario,
 * Progresar nivel obligatorio, línea Trabajo (incluye enfermería y otras líneas
 * específicas), Beca Manuel Belgrano y el crédito/beca de acompañamiento
 * universitario.
 *
 * LA PREGUNTA REAL que ordena el hub: nadie busca "monto de la beca" a secas.
 * Busca cuánto le CAE en la cuenta cada mes, que no es lo mismo que el monto
 * publicado: en las líneas Progresar se retiene el 20% de cada cuota y esa plata
 * se libera recién cuando se acredita la condición de alumno regular. Por eso el
 * desglose siempre muestra las tres filas juntas: lo que cobrás por mes, lo que
 * te retienen por mes y lo que cobrás de una sola vez al certificar.
 *
 * DE DÓNDE SALEN LOS NÚMEROS — FUENTE ÚNICA:
 *  · Retención del 20% y su aritmética (cuota × 0,8 acreditada, cuota × 0,2 × N
 *    retenida, liberada al certificar): espejo exacto de
 *    src/lib/formulas/progresar-retencion-2026.ts
 *  · Montos por línea Progresar (obligatorio / superior / trabajo): espejo de
 *    src/lib/formulas/credito-universitario-progresar-monto-2026.ts, que es la
 *    única fórmula del repo que diferencia el monto por línea.
 *  · Beca Manuel Belgrano por carrera estratégica: espejo de
 *    src/lib/formulas/becas-manuel-belgrano-monto.ts
 *  · Cuotas por año: 10 en las líneas Progresar (misma fórmula del crédito
 *    universitario), 12 como techo de primera convocatoria según
 *    src/lib/formulas/progresar-beca-monto-requisitos-2026.ts — por eso el campo
 *    de cuotas es editable con tope 12.
 *
 * CONTRADICCIÓN CONOCIDA EN LAS FÓRMULAS VIEJAS (reportada, no inventada acá):
 *  `progresar-beca-monto-requisitos-2026.ts` devuelve $35.000 planos para TODAS
 *  las líneas, mientras `credito-universitario-progresar-monto-2026.ts` devuelve
 *  40.000 / 80.000 / 70.000 según la línea. Se tomó la segunda por ser la que
 *  distingue línea, que es justo lo que el hub necesita para ramificar. El campo
 *  "monto de tu cuota" queda editable y en 0 usa el valor de referencia de la
 *  rama, así que quien tenga otro importe no queda atado a ninguno de los dos.
 */

/** Monto mensual de referencia, cuotas anuales y si aplica la retención del 20%. */
export const BECAS = {
  'progresar-superior': { monto: 80000, cuotas: 10, retiene: true },
  'progresar-obligatorio': { monto: 40000, cuotas: 10, retiene: true },
  'progresar-trabajo': { monto: 70000, cuotas: 10, retiene: true },
  belgrano: { monto: 70000, cuotas: 10, retiene: false },
  credito: { monto: 80000, cuotas: 12, retiene: true },
} as const;

/** Porción de cada cuota que se retiene hasta acreditar la condición de alumno regular. */
export const PCT_RETENCION = 0.2;

/** Constantes que viajan al <script> de la página. */
export const CASE_MATH = { becas: BECAS, pctRetencion: PCT_RETENCION };

const fmtArs = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

/** Texto del disclaimer YMYL (getCalculatorDisclaimer, dominio 'finance'). */
const DISCLAIMER =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'finanzas-personales/becas-para-estudiar',
  title: 'Becas para estudiar: cuánto cobrás por mes y qué te retienen',
  description:
    'Progresar, Beca Manuel Belgrano y el acompañamiento universitario en un solo lugar: el monto de tu línea, el 20% que se retiene hasta acreditar la condición de alumno regular y cuánto cobrás de una sola vez cuando certificás.',
  silo: 'Finanzas personales',
  siloHref: '/finanzas-personales',

  eyebrow: 'Guía y estimación de becas',
  h1: '¿Cuánto voy a cobrar de beca y qué me descuentan?',
  lede:
    'El monto que publican no es el que te cae en la cuenta. En las líneas Progresar se acredita el 80% mes a mes y el 20% restante queda retenido hasta que acreditás la condición de alumno regular. Elegí tu línea y mirá las tres cifras juntas: lo mensual, lo retenido y lo que cobrás al certificar.',
  stamps: ['Actualizado 27-07-2026', 'Retención del 20% incluida', '4 calculadoras adentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué beca te toca?',
    intro:
      'Partimos de la línea más consultada: Progresar de nivel superior o universitario. Si la tuya es otra, cambiala.',
    items: [
      {
        id: 'progresar-superior',
        label: 'Progresar superior o universitario',
        hint: 'La línea más pedida',
        answer: 'Cobrás el 80% de la cuota por mes y el 20% al acreditar alumno regular.',
        yes: [
          `Cuota mensual de referencia de ${fmtArs(BECAS['progresar-superior'].monto)} para nivel superior y universitario`,
          'Se acredita el 80% todos los meses en la cuenta a tu nombre',
          'El 20% restante se retiene y se libera cuando acreditás la condición de alumno regular',
          'El esquema estándar son 10 cuotas al año, con hasta 12 en primera convocatoria',
        ],
        warn: [
          DISCLAIMER,
          'La beca se cobra en una cuenta a nombre del estudiante, no del grupo familiar: sin CBU propio no se acredita',
          'Si perdés la regularidad, el 20% retenido no se libera y las cuotas se suspenden',
        ],
        plazo: 'la condición de alumno regular se acredita con el certificado que emite tu institución; presentalo apenas lo tengas.',
      },
      {
        id: 'progresar-obligatorio',
        label: 'Progresar nivel obligatorio',
        hint: 'Primaria y secundaria',
        answer: 'En nivel obligatorio la cuota es menor y también se retiene el 20%.',
        yes: [
          `Cuota mensual de referencia de ${fmtArs(BECAS['progresar-obligatorio'].monto)} para terminar primaria o secundaria`,
          'Misma mecánica: 80% acreditado por mes, 20% retenido hasta certificar',
          'Se acredita la escolaridad, no la regularidad universitaria',
        ],
        warn: [
          DISCLAIMER,
          'La línea de nivel obligatorio tiene tope de edad y exige no haber terminado el nivel: si ya lo terminaste, la línea que te corresponde es la superior',
        ],
        plazo: 'la certificación de escolaridad la carga la escuela; sin esa carga la retención queda trabada.',
      },
      {
        id: 'progresar-trabajo',
        label: 'Progresar Trabajo, enfermería u otra línea',
        hint: 'Formación y carreras estratégicas',
        answer: 'Las líneas de formación cobran un monto propio, con la misma retención.',
        yes: [
          `Cuota mensual de referencia de ${fmtArs(BECAS['progresar-trabajo'].monto)} para la línea Trabajo y las líneas de formación específica`,
          'Enfermería y otras carreras priorizadas se liquidan dentro de este esquema',
          'También se acredita el 80% mensual con el 20% retenido',
        ],
        warn: [
          DISCLAIMER,
          'Cada línea de formación tiene su propia convocatoria y su propio calendario: no se abren todas al mismo tiempo',
          'Algunas líneas exigen cursada presencial certificada por la institución formadora',
        ],
        plazo: 'las convocatorias de las líneas de formación abren por ventanas cortas; si se te pasa, esperás a la siguiente.',
      },
      {
        id: 'belgrano',
        label: 'Beca Manuel Belgrano',
        hint: 'Carreras estratégicas',
        answer: 'La Belgrano paga un estímulo mensual según la carrera, sin la retención del 20%.',
        yes: [
          `Estímulo mensual según carrera: ${fmtArs(75000)} ingeniería, ${fmtArs(70000)} salud, ${fmtArs(60000)} ciencia y tecnología, ${fmtArs(50000)} el resto`,
          'Exige ingreso del grupo familiar de hasta 3 salarios mínimos y promedio aprobado',
          'La carrera tiene que estar en el listado de estratégicas de la convocatoria',
        ],
        warn: [
          DISCLAIMER,
          'La retención del 20% es propia de las líneas Progresar: esta beca no la aplica, pero sí puede suspenderse si perdés la regularidad',
          'Puede ser incompatible con otras becas nacionales por la misma carrera: revisá las bases antes de aceptarla',
        ],
        plazo: 'el listado de carreras estratégicas se actualiza en cada convocatoria; confirmá que la tuya siga adentro.',
      },
      {
        id: 'credito',
        label: 'Crédito o acompañamiento universitario',
        hint: 'Hasta 12 cuotas',
        answer: 'Con 12 cuotas el año cierra más alto, pero la retención también.',
        yes: [
          'Esquema de acompañamiento universitario de hasta 12 cuotas en primera convocatoria',
          'Se liquida con el monto de la línea superior y la misma retención del 20%',
          'Se tramita por mi.ANSES con el Informe de Valoración de Estudios (IVE)',
        ],
        warn: [
          DISCLAIMER,
          'Que la convocatoria admita 12 cuotas no significa que todos las cobren: el número depende del mes de alta y de la certificación',
          'No es un préstamo bancario: no genera deuda ni intereses, pero tampoco se puede adelantar',
        ],
        plazo: 'el IVE lo emite tu universidad y suele demorar; pedilo apenas se abre la convocatoria.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'cuota',
      label: 'Monto mensual de tu cuota',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Dejalo en 0 y usamos el monto de referencia de la línea que elegiste arriba. Si en tu resolución figura otro importe, escribilo acá.',
    },
    {
      id: 'cuotas',
      label: 'Cuotas que vas a cobrar en el año',
      type: 'number',
      min: 1,
      max: 12,
      value: 10,
      help: 'El esquema estándar son 10; la primera convocatoria puede llegar a 12.',
    },
    {
      id: 'certifica',
      label: '¿Vas a acreditar la condición de alumno regular?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, voy a certificar' },
        { value: 'no', label: 'Todavía no lo sé' },
      ],
      help: 'Si no certificás, el 20% retenido no se libera. Cambialo para ver los dos escenarios.',
    },
  ],
  fineprint:
    'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir. Los montos de cada convocatoria los fija la resolución vigente: confirmalos en el portal oficial de la beca.',

  chart: {
    type: 'stacked',
    title: 'Cómo se parte tu beca',
    caption:
      'La barra parte el total anual en la plata que te cae mes a mes y la que queda retenida hasta que acreditás la condición de alumno regular. La retención no es un descuento: es plata tuya en espera.',
  },
  breakdownTitle: 'Tu beca, número por número',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Por qué me depositan menos de lo que dice el monto de la beca?',
      a: 'Porque el número publicado es la cuota bruta y en las líneas Progresar se acredita el 80%. El 20% restante se retiene mes a mes y se libera de una sola vez cuando acreditás la condición de alumno regular. No es un descuento ni un recorte: es plata tuya en espera de la certificación.',
    },
    {
      q: '¿Cuándo cobro el 20% retenido?',
      a: 'Cuando la institución certifica que sos alumno regular y esa carga llega al sistema. El pago se hace en una sola acreditación por todas las cuotas retenidas del período. Si la certificación llega tarde, se paga tarde; si no llega, no se paga.',
    },
    {
      q: '¿Qué pasa si pierdo la regularidad a mitad de año?',
      a: 'Se suspenden las cuotas siguientes y el 20% acumulado hasta ese momento queda sin liberar. Recuperar la regularidad en la misma convocatoria no siempre destraba la retención: depende de las condiciones que fije la resolución vigente, así que conviene consultarlo antes de dejar de cursar.',
    },
    {
      q: '¿Cuántas cuotas se cobran por año?',
      a: 'El esquema habitual son 10 cuotas anuales. La primera convocatoria del año puede llegar a 12 según la línea y el mes de alta. Por eso el cálculo deja el número de cuotas editable: el año cierra muy distinto con 10 que con 12.',
    },
    {
      q: '¿La Beca Manuel Belgrano también retiene el 20%?',
      a: 'No. La retención del 20% es propia de las líneas Progresar. La Belgrano paga el estímulo mensual completo, pero puede suspenderse si se pierde la regularidad o si la carrera sale del listado de estratégicas de la convocatoria.',
    },
    {
      q: '¿Cuánto paga la Beca Manuel Belgrano según la carrera?',
      a: `Depende del grupo de carrera: ingeniería ${fmtArs(75000)} por mes, salud ${fmtArs(70000)}, ciencia y tecnología ${fmtArs(60000)} y el resto de las carreras alcanzadas ${fmtArs(50000)}. En todos los casos hay que cumplir el requisito de ingreso familiar de hasta 3 salarios mínimos y tener promedio aprobado.`,
    },
    {
      q: '¿Puedo cobrar Progresar y la Beca Belgrano al mismo tiempo?',
      a: 'En general no por la misma carrera: las becas nacionales suelen declararse incompatibles entre sí. Cada convocatoria lo define en sus bases, así que hay que leerlas antes de aceptar la segunda beca. Cobrar dos beneficios incompatibles termina en la baja de uno y en la devolución de lo percibido.',
    },
    {
      q: '¿La beca la cobra el estudiante o la familia?',
      a: 'El estudiante. La acreditación va a una cuenta bancaria a nombre del titular de la beca, con su CUIL. Si no hay cuenta propia declarada, la cuota se liquida pero no se acredita, y esa demora se acumula igual que la retención.',
    },
    {
      q: '¿La beca paga impuesto a las Ganancias o afecta otras asignaciones?',
      a: 'Las becas de estudio no son remuneración, así que no se liquidan como sueldo. Aun así, los ingresos del grupo familiar sí se miran para determinar la elegibilidad de la beca, y algunos beneficios sociales exigen declarar todo ingreso: conviene informarlo antes que corregirlo después.',
    },
    {
      q: '¿Qué es el IVE y por qué me lo piden?',
      a: 'El Informe de Valoración de Estudios lo emite la institución educativa y confirma tu situación académica: carrera, año y materias aprobadas. Es el papel con el que se valida la regularidad y, por lo tanto, el que destraba la retención. Suele demorar, así que se pide apenas abre la convocatoria.',
    },
    {
      q: '¿Cuánto cobro en total en el año si certifico?',
      a: 'La cuota bruta multiplicada por la cantidad de cuotas, sin quita: el 80% te llega repartido mes a mes y el 20% de una sola vez al certificar. Si no certificás, el año cierra en el 80% de ese total y el resto se pierde.',
    },
    {
      q: '¿Los montos de la beca se actualizan durante el año?',
      a: 'Sí. Cada convocatoria fija su cuota por resolución y puede haber actualizaciones dentro del período. La retención acumulada se liquida según las reglas de la resolución vigente, así que el importe final del 20% puede no coincidir exactamente con la suma de las retenciones nominales de cada mes.',
    },
  ],

  sources: [
    {
      name: 'Becas Progresar — montos, líneas y requisitos de la convocatoria vigente',
      url: 'https://www.argentina.gob.ar/educacion/progresar',
      publisher: 'Ministerio de Capital Humano — Secretaría de Educación',
    },
    {
      name: 'Portal de inscripción y seguimiento de Becas Progresar',
      url: 'https://becasprogresar.educacion.gob.ar/',
      publisher: 'Becas Progresar',
    },
    {
      name: 'Beca Estímulo Manuel Belgrano — carreras estratégicas y requisitos',
      url: 'https://www.argentina.gob.ar/educacion/becas-manuel-belgrano',
      publisher: 'Ministerio de Capital Humano — Secretaría de Educación',
    },
    {
      name: 'mi.ANSES — acreditación de beneficios y datos bancarios del titular',
      url: 'https://www.anses.gob.ar/mi-anses',
      publisher: 'ANSES',
    },
  ],

  replaces: [
    '/calculadora-progresar-beca-monto-requisitos-2026',
    '/calculadora-progresar-retencion-20-por-ciento',
    '/calculadora-credito-universitario-progresar-monto-2026',
    '/calculadora-becas-manuel-belgrano-monto',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
