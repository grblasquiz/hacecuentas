import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "Me voy o me echan: ¿cuánto me tienen que liquidar?"
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts.
 *
 * Absorbe 12 calculadoras sueltas. La que hacía de flagship
 * (`liquidacion-laboral-colombia-completa-cesantias.ts`) traía varios errores de
 * fondo que este hub corrige; están todos listados en el reporte de la tanda:
 *  - los intereses de cesantías salían al 10,2% (un `× 0,85` sin norma detrás)
 *    en vez del 12% legal, y sin proporción al tiempo;
 *  - la prima de los años completos se liquidaba a medio mes por año en vez de
 *    un mes, y la fracción a un ritmo distinto del de los años completos;
 *  - el auxilio de transporte no entraba en la base de cesantías ni de prima,
 *    cuando la ley manda incluirlo;
 *  - se descontaban salud y pensión sobre TODA la liquidación, cuando las
 *    prestaciones sociales y la indemnización no son base de aportes;
 *  - la retención usaba una tabla inventada (8 UVT de exención, 5% × 0,6);
 *  - la indemnización ignoraba el umbral de 10 SMLMV del art. 64 CST.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const SMLMV = COLOMBIA_2026.smlmv;
export const SMDLV = COLOMBIA_2026.smdlv;
export const AUXILIO = COLOMBIA_2026.auxilioTransporte;
export const TOPE_AUXILIO_SMLMV = COLOMBIA_2026.topeAuxilioSmlmv;

/** Prestaciones sociales: cesantías, intereses 12%, prima y vacaciones. */
export const PRESTACIONES = COLOMBIA_2026.prestaciones;

/** Indemnización del art. 64 CST para el contrato a término indefinido. */
export const INDEMNIZACION = COLOMBIA_2026.indemnizacionDespido;

/** Umbral que decide qué tabla del art. 64 CST se aplica. */
export const UMBRAL_INDEMNIZACION_SMLMV = 10;

/**
 * Sanción moratoria del art. 65 CST: 1 día de salario por cada día de retardo en
 * el pago de salarios y prestaciones al terminar el contrato. Para salarios
 * superiores a 1 SMLMV corre 24 meses y después pasa a intereses moratorios.
 *
 * OJO — no confundir con la sanción del art. 99 de la Ley 50 de 1990, que es la
 * misma tarifa (1 día por día) pero castiga otra cosa: no consignar las
 * cesantías en el fondo antes del 14 de febrero, con el contrato todavía vivo.
 */
export const MORA = { topeDias: 720, topeMeses: 24, diasPorDia: 1 };

/** Dotación (arts. 230 y 232 CST): 3 entregas al año a quien gana hasta 2 SMLMV. */
export const DOTACION = {
  entregasPorAnio: 3,
  fechas: ['30 de abril', '31 de agosto', '20 de diciembre'],
  topeSmlmv: 2,
  antiguedadMinimaMeses: 3,
};

/** Días base del año laboral colombiano: 360, no 365 (convención del CST). */
export const DIAS_ANIO = 360;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/trabajo/liquidacion-laboral',
  title: 'Liquidación laboral Colombia: empleada doméstica por días 2026',
  description:
    'Calculá tu liquidación en Colombia 2026: cesantías, intereses del 12%, prima, vacaciones e indemnización del art. 64 CST. Cubre renuncia, despido sin justa causa, contrato a término fijo y la liquidación de empleada doméstica por días, con la sanción moratoria del art. 65.',
  silo: 'Trabajo',
  siloHref: '/co/trabajo',
  locale: 'co',

  eyebrow: 'Colombia · CST y Ley 50 de 1990',
  h1: 'Me voy o me echan: ¿cuánto me tienen que liquidar? (también la liquidación de empleada doméstica por días)',
  lede:
    'Las prestaciones sociales se deben siempre, renuncies o te despidan: cesantías, intereses del 12%, prima y vacaciones se causan por el tiempo que trabajaste. Lo que cambia con el motivo de la salida es la indemnización. Poné tus fechas y mirá el total, concepto por concepto.',
  stamps: [
    `SMLMV: ${cop(SMLMV)}`,
    `Auxilio de transporte: ${cop(AUXILIO)}`,
    'Arts. 64, 65, 186, 249 y 306 del CST',
    '12 calculadoras adentro',
  ],

  resultLabel: 'Total de tu liquidación',

  cases: {
    title: '¿Cómo terminó el contrato?',
    intro:
      'Las prestaciones sociales se calculan igual en los cuatro casos: se causan por el tiempo trabajado y nadie las pierde por renunciar. Lo que cambia de raíz es si además hay indemnización y cómo se calcula.',
    items: [
      {
        id: 'renuncia',
        label: 'Renuncié',
        hint: 'Prestaciones completas · sin indemnización',
        answer:
          'Renunciar no te hace perder nada de lo causado: cobrás cesantías, intereses, prima y vacaciones, pero no hay indemnización.',
        yes: [
          `Cesantías: un mes de salario por año trabajado, proporcional a los días (art. 249 CST)`,
          `Intereses de cesantías: ${PRESTACIONES.interesesCesantias * 100}% anual sobre el saldo, proporcional al tiempo (Ley 52 de 1975)`,
          `Prima de servicios: un mes de salario por año, proporcional (art. 306 CST)`,
          `Vacaciones: ${PRESTACIONES.vacacionesDiasHabiles} días hábiles por año, compensadas en dinero si no las disfrutaste`,
          'El auxilio de transporte entra en la base de cesantías y de prima si te correspondía',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La renuncia no exige preaviso en el contrato a término indefinido: el preaviso de 30 días es una obligación del empleador para no renovar un término fijo, no tuya para irte',
          'Firmar un "paz y salvo" o una transacción no te obliga a renunciar a derechos ciertos e indiscutibles: esos son irrenunciables (art. 15 CST)',
          'Si te presionaron para renunciar puede haber un despido indirecto (art. 62 CST), y ahí sí corresponde indemnización',
        ],
        plazo:
          'la liquidación se paga al terminar el contrato; cada día de retardo activa la sanción moratoria del art. 65 CST.',
      },
      {
        id: 'despido-injusto',
        label: 'Me despidieron sin justa causa',
        hint: 'Término indefinido · art. 64 CST',
        answer:
          'Además de las prestaciones te deben una indemnización, y la tabla cambia según ganes más o menos de 10 salarios mínimos.',
        yes: [
          `Con salario inferior a ${UMBRAL_INDEMNIZACION_SMLMV} SMLMV (${cop(UMBRAL_INDEMNIZACION_SMLMV * SMLMV)}): ${INDEMNIZACION.menos10Smlmv.diasPrimerAnio} días de salario por el primer año y ${INDEMNIZACION.menos10Smlmv.diasPorAnioAdicional} por cada año siguiente`,
          `Con salario igual o superior a ${UMBRAL_INDEMNIZACION_SMLMV} SMLMV: ${INDEMNIZACION.desde10Smlmv.diasPrimerAnio} días por el primer año y ${INDEMNIZACION.desde10Smlmv.diasPorAnioAdicional} por cada año siguiente`,
          'Las fracciones de los años siguientes al primero se pagan proporcionalmente',
          'Todas las prestaciones sociales se deben igual, además de la indemnización',
        ],
        warn: [
          DISCLAIMER_TAX,
          `El primer año se paga completo: si trabajaste 4 meses y te despidieron sin justa causa, la indemnización sigue siendo de ${INDEMNIZACION.menos10Smlmv.diasPrimerAnio} días, no la cuarta parte`,
          'La indemnización no es base de aportes a salud ni a pensión, y tampoco de prima ni de cesantías',
          'Que la carta invoque una justa causa no la vuelve justa: tiene que estar en la lista del art. 62 CST, probarse y haberse seguido el procedimiento',
          'Hay estabilidad laboral reforzada —embarazo, fuero sindical, salud— donde el despido sin permiso previo es ineficaz y da derecho al reintegro, no sólo a plata',
        ],
        plazo:
          'la acción por despido injusto prescribe a los 3 años (art. 488 CST), pero el reclamo de reintegro conviene hacerlo ya.',
      },
      {
        id: 'termino-fijo',
        label: 'Se terminó mi contrato a término fijo',
        hint: 'Vencimiento o corte anticipado',
        answer:
          'Si el contrato llegó a su fecha, no hay indemnización; si lo cortaron antes, te deben los salarios que faltaban hasta el vencimiento.',
        yes: [
          'Prestaciones sociales proporcionales a los días efectivamente trabajados',
          'Si te sacaron antes del vencimiento sin justa causa: los salarios de todo el tiempo que faltaba (art. 64 CST)',
          'El empleador debe preavisar la no renovación con 30 días de anticipación',
          'Si no preavisó, el contrato se entiende renovado por un período igual al pactado',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Acá NO se aplica la tabla de 30 + 20 días del contrato indefinido: la indemnización del término fijo es el tiempo faltante, y puede ser mucho mayor o mucho menor',
          'El contrato a término fijo inferior a un año sólo se puede prorrogar tres veces por períodos iguales; a partir de la cuarta, la prórroga es mínimo de un año',
          'Terminar por vencimiento del plazo pactado, con preaviso, es una forma legal de terminación: no genera indemnización',
        ],
        plazo:
          'el preaviso de no renovación tiene que ser por escrito y con 30 días de anticipación al vencimiento.',
      },
      {
        id: 'domestica',
        label: 'Trabajo por días en casa de familia',
        hint: 'Empleada doméstica · prestaciones proporcionales',
        answer:
          'Trabajar dos o tres días por semana da derecho a todas las prestaciones, proporcionales a los días trabajados.',
        yes: [
          'Cesantías, intereses, prima y vacaciones proporcionales a los días efectivamente trabajados',
          `El pago por día no puede ser inferior al salario mínimo diario (${cop(SMDLV)}) más el descanso dominical proporcional y el auxilio de transporte`,
          'El empleador tiene que afiliar a pensión, ARL y caja de compensación desde el primer día, con la planilla PILA de trabajadores por días (Decreto 2616 de 2013)',
          'La prima de servicios es un derecho pleno desde la Ley 1788 de 2016: antes de esa ley el sector estaba excluido',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Pagar "el día" sin nada más es la irregularidad más común del sector: el pago diario tiene que cubrir además el descanso dominical proporcional y el auxilio de transporte',
          'Trabajar por días no es trabajar por horas: la jornada máxima y los recargos aplican igual',
          'Si el mismo empleador la ocupa todos los días, no es trabajo por días: es un contrato laboral común de tiempo completo',
          'La afiliación por semanas cotizadas del Decreto 2616 exige mínimo un día a la semana y cotiza por semanas enteras, no por horas sueltas',
        ],
        plazo:
          'la liquidación se paga al terminar la relación, igual que en cualquier contrato laboral, con la misma sanción moratoria si se retrasa.',
      },
    ],
  },

  inputsTitle: 'Tus fechas y tu salario',
  inputsIntro:
    'Con las fechas de entrada y salida alcanza para casi todo. Los campos de fecha pactada y días por semana sólo se usan en su propia rama.',
  fields: [
    {
      id: 'salario',
      label: 'Salario mensual (COP)',
      prefix: '$',
      value: '2.000.000',
      thousands: true,
      help: 'El salario ordinario del último año. Si trabajás por días, poné acá lo que te pagan POR DÍA.',
    },
    {
      id: 'ingreso',
      label: 'Fecha de ingreso',
      type: 'date',
      value: '2023-03-01',
      help: 'El día en que empezaste a trabajar, según el contrato.',
    },
    {
      id: 'salida',
      label: 'Fecha de salida',
      type: 'date',
      value: '2026-07-28',
      help: 'El último día trabajado o el día en que terminó el contrato.',
    },
    {
      id: 'finPactada',
      label: 'Fecha de vencimiento pactada del contrato',
      type: 'date',
      value: '2026-12-31',
      help: 'Sólo se usa en la rama de término fijo: define cuántos días faltaban.',
    },
    {
      id: 'diasSemana',
      label: 'Días que trabajás por semana',
      type: 'number',
      value: 2,
      min: 1,
      max: 6,
      step: 1,
      help: 'Sólo se usa en la rama de trabajo por días en casa de familia.',
    },
    {
      id: 'vacaciones',
      label: 'Días hábiles de vacaciones pendientes de años anteriores',
      type: 'number',
      value: 0,
      min: 0,
      max: 60,
      step: 1,
      help: 'Días que quedaron sin disfrutar de períodos ya cumplidos. Los del año en curso ya los calcula el hub.',
    },
    {
      id: 'mora',
      label: 'Días de retraso en el pago de la liquidación',
      type: 'number',
      value: 0,
      min: 0,
      max: 1500,
      step: 1,
      help: 'Si ya te pagaron a tiempo, dejalo en 0. Cada día de retardo cuesta un día de salario (art. 65 CST).',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu liquidación',
    caption:
      'Muestra el peso de cada concepto en el total: cesantías, sus intereses, prima, vacaciones y, cuando corresponde, la indemnización. Sirve para detectar de un vistazo si en tu liquidación real falta alguno.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro:
    'El mismo orden en que lo arma una liquidación bien hecha: base, tiempo trabajado, cada prestación por separado, la indemnización si corresponde y lo que pasa si se demoran en pagarte.',

  faq: [
    {
      q: '¿Qué me tienen que pagar cuando termina mi contrato?',
      a: `Siempre, sin importar el motivo: cesantías (un mes de salario por año), intereses de cesantías (${PRESTACIONES.interesesCesantias * 100}% anual sobre el saldo), prima de servicios (un mes de salario por año) y vacaciones causadas y no disfrutadas (${PRESTACIONES.vacacionesDiasHabiles} días hábiles por año). Todo proporcional al tiempo trabajado. La indemnización es lo único que depende del motivo: se debe cuando el despido es sin justa causa, no cuando renunciás ni cuando el contrato llega a su vencimiento.`,
    },
    {
      q: '¿Pierdo las cesantías o la prima si renuncio?',
      a: 'No. Es el mito más caro que circula en Colombia. Las prestaciones sociales se causan por el trabajo prestado, no por la forma en que termina el contrato. Renunciando cobrás exactamente las mismas cesantías, los mismos intereses, la misma prima y las mismas vacaciones que si te hubieran despedido. Lo único que perdés al renunciar es la indemnización, porque esa compensa el despido, no el tiempo trabajado.',
    },
    {
      q: '¿Cómo se calculan los intereses de cesantías?',
      a: `Son el ${PRESTACIONES.interesesCesantias * 100}% anual sobre el saldo de cesantías, proporcional al tiempo. La fórmula legal es cesantías × días trabajados × 12% ÷ ${DIAS_ANIO}. Por un año completo dan exactamente el 12% de las cesantías; por medio año dan el 3%, no el 6%, porque el saldo también es la mitad. Se pagan directamente al trabajador, nunca al fondo, a más tardar el 31 de enero de cada año, y al liquidar el contrato se paga la parte proporcional que quedó pendiente.`,
    },
    {
      q: '¿El auxilio de transporte entra en la liquidación?',
      a: `Sí, y es un error de nómina muy frecuente omitirlo. El auxilio de transporte no es salario para efectos de aportes a seguridad social, pero la ley manda incluirlo en la base de liquidación de cesantías y de prima de servicios para quienes lo reciben, es decir quienes ganan hasta ${TOPE_AUXILIO_SMLMV} SMLMV (${cop(TOPE_AUXILIO_SMLMV * SMLMV)}). En vacaciones, en cambio, NO entra: esas se liquidan sólo sobre el salario. Si tu liquidación calculó las cesantías sobre el básico pelado y vos cobrabas auxilio, te pagaron de menos.`,
    },
    {
      q: '¿Cuánto es la indemnización por despido sin justa causa?',
      a: `En el contrato a término indefinido depende de tu salario. Si ganás menos de ${UMBRAL_INDEMNIZACION_SMLMV} salarios mínimos (${cop(UMBRAL_INDEMNIZACION_SMLMV * SMLMV)}): ${INDEMNIZACION.menos10Smlmv.diasPrimerAnio} días de salario por el primer año y ${INDEMNIZACION.menos10Smlmv.diasPorAnioAdicional} días por cada año siguiente, con las fracciones proporcionales. Si ganás ese monto o más: ${INDEMNIZACION.desde10Smlmv.diasPrimerAnio} días por el primer año y ${INDEMNIZACION.desde10Smlmv.diasPorAnioAdicional} por cada año siguiente. Detalle clave que muchas calculadoras se saltan: el primer año se paga completo aunque hayas trabajado sólo unos meses.`,
    },
    {
      q: '¿Cómo se indemniza un contrato a término fijo cortado antes de tiempo?',
      a: 'Con los salarios de todo el tiempo que faltaba hasta la fecha de vencimiento pactada, según el art. 64 del CST. No se aplica la tabla de 30 + 20 días del contrato indefinido. Eso puede jugar a favor o en contra: si te sacan a un mes de terminar un contrato de dos años, la indemnización es un mes; si te sacan al mes de firmar un contrato de un año, son once meses de salario. Por eso conviene mirar siempre la fecha de vencimiento antes de negociar una salida.',
    },
    {
      q: '¿Qué pasa si mi empleador se demora en pagarme la liquidación?',
      a: `Corre la sanción moratoria del art. 65 del CST: un día de salario por cada día de retardo. Si tu salario era superior a un mínimo, esa sanción corre durante ${MORA.topeMeses} meses (${MORA.topeDias} días) y a partir de ahí se reemplaza por intereses moratorios a la tasa máxima de créditos de libre asignación que certifica la Superintendencia Financiera. Si ganabas un mínimo o menos, no se aplica ese tope de 24 meses. Es una sanción muy pesada: en pocos meses puede superar la propia liquidación.`,
    },
    {
      q: '¿Es lo mismo la sanción del art. 65 del CST que la de la Ley 50 de 1990?',
      a: `No, y se confunden todo el tiempo porque tienen la misma tarifa. La del art. 65 del CST castiga no pagar salarios y prestaciones al TERMINAR el contrato. La del art. 99 de la Ley 50 de 1990 castiga otra cosa: no consignar las cesantías del año en el fondo antes del 14 de febrero, con el contrato todavía vivo. Las dos cuestan un día de salario por día de retardo, pero se activan en momentos distintos y se pueden acumular si el empleador incumplió las dos.`,
    },
    {
      q: '¿Cómo se calcula la liquidación de una empleada doméstica por días en Colombia 2026?',
      a: `Igual que a cualquier trabajador, pero proporcional a los días. El pago diario tiene que cubrir tres cosas: el salario mínimo diario (${cop(SMDLV)}), el descanso dominical proporcional (una sexta parte del día, art. 173 CST) y el auxilio de transporte proporcional. Sobre esa base se causan cesantías, intereses, prima y vacaciones proporcionales al tiempo. La prima es un derecho pleno desde la Ley 1788 de 2016; hasta entonces el servicio doméstico estaba excluido, y todavía hay familias que liquidan como si esa ley no existiera.`,
    },
    {
      q: '¿Cuánto vale como mínimo el día de una empleada doméstica en 2026?',
      a: `El piso legal por día en 2026 es de ${cop(SMDLV + SMDLV / 6 + AUXILIO / 30)}: el salario mínimo diario de ${cop(SMDLV)} (SMLMV ÷ 30), más el descanso dominical proporcional de ${cop(SMDLV / 6)} (una sexta parte del día, art. 173 CST) y el auxilio de transporte diario de ${cop(AUXILIO / 30)} (${cop(AUXILIO)} ÷ 30). Para liquidar se mensualiza el pago —días por semana × 52 ÷ 12, así que 3 días por semana son unos 13 días al mes— y sobre ese salario mensualizado se causan cesantías, intereses del ${PRESTACIONES.interesesCesantias * 100}%, prima y vacaciones, todo proporcional (Corte Constitucional, sentencia C-871 de 2014).`,
    },
    {
      q: '¿Las prestaciones sociales pagan salud y pensión?',
      a: 'No, y es otro error frecuente de las liquidaciones caseras. Las cesantías, los intereses de cesantías, la prima de servicios y la indemnización no son base de aportes a salud ni a pensión. Las vacaciones sí generan aporte a pensión. Si en tu liquidación te descontaron el 8% sobre todo el total, te descontaron de más: los aportes se calculan sobre los salarios del período, no sobre las prestaciones.',
    },
    {
      q: '¿Me deben pagar la dotación que no me entregaron?',
      a: `La dotación se entrega en especie —calzado y vestido de labor— tres veces al año: el ${DOTACION.fechas[0]}, el ${DOTACION.fechas[1]} y el ${DOTACION.fechas[2]}. Le corresponde a quien gana hasta ${DOTACION.topeSmlmv} SMLMV (${cop(DOTACION.topeSmlmv * SMLMV)}) y lleva más de ${DOTACION.antiguedadMinimaMeses} meses de servicio (arts. 230 y 232 CST). La ley prohíbe compensarla en dinero mientras el contrato está vivo, pero si el empleador nunca la entregó, al terminar el contrato ese incumplimiento se puede reclamar y suele resolverse con una indemnización equivalente.`,
    },
    {
      q: '¿Cuánto tiempo tengo para reclamar lo que me deben?',
      a: 'Tres años desde que cada derecho se hizo exigible, según el art. 488 del CST. El plazo se interrumpe una sola vez con un reclamo escrito al empleador, y esa interrupción da otros tres años. Como las prestaciones se van causando en momentos distintos, la prescripción corre por separado para cada una: podés haber perdido el reclamo de una prima vieja y conservar intacto el de la liquidación. Conviene reclamar por escrito apenas aparece el problema, aunque sea sólo para dejar la fecha registrada.',
    },
    {
      q: '¿Puedo negociar mi salida y renunciar a parte de la liquidación?',
      a: 'Los derechos ciertos e indiscutibles son irrenunciables (art. 15 CST): las cesantías causadas, la prima causada y las vacaciones causadas no se pueden negociar a la baja, ni siquiera con tu firma. Lo que sí se puede transar es lo dudoso o discutible: si hubo justa causa, si un pago era o no salarial, el monto de una indemnización controvertida. Por eso muchas conciliaciones son válidas en la parte indemnizatoria y nulas en la parte prestacional.',
    },
  ],

  sources: [
    {
      name: 'Código Sustantivo del Trabajo, art. 64 — indemnización por terminación sin justa causa',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Código Sustantivo del Trabajo, art. 65 — indemnización por falta de pago',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Código Sustantivo del Trabajo, arts. 186 y 189 — vacaciones y compensación en dinero',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Código Sustantivo del Trabajo, arts. 249 y 306 — cesantías y prima de servicios',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 52 de 1975 — intereses del 12% anual sobre las cesantías',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=1198',
      publisher: 'Función Pública',
    },
    {
      name: 'Ley 50 de 1990, art. 99 — régimen de cesantías y sanción por no consignar',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=281',
      publisher: 'Función Pública',
    },
    {
      name: 'Ley 1788 de 2016 — prima de servicios para el servicio doméstico',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=76833',
      publisher: 'Función Pública',
      date: '07-07-2016',
    },
    {
      name: 'Decreto 2616 de 2013 — cotización por semanas para trabajadores por días',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=55480',
      publisher: 'Función Pública',
    },
    {
      name: 'Decreto 1469 de 2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '29-12-2025',
    },
    {
      name: 'Decreto 1470 de 2025 — auxilio de transporte',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '29-12-2025',
    },
  ],

  replaces: [
    '/co/calculadora-liquidacion-laboral-colombia-completa-cesantias',
    '/co/calculadora-indemnizacion-despido-sin-justa-causa-colombia-2026',
    '/co/calculadora-liquidacion-contrato-termino-fijo-colombia-2026',
    '/co/calculadora-prima-legal-colombia-30-dias-junio-diciembre',
    '/co/calculadora-cesantias-colombia-12-porciento-anual',
    '/co/calculadora-vacaciones-colombia-15-dias-habiles-laborales',
    '/co/calculadora-antiguedad-laboral-colombia',
    '/co/calculadora-sancion-moratoria-no-pago-liquidacion-colombia',
    '/co/calculadora-dotacion-laboral-colombia-2026',
    '/co/calculadora-empleada-domestica-dias-colombia-2026',
    '/co/calculadora-liquidacion-empleada-domestica-por-dias-colombia-2026',
    '/co/calculadora-prestaciones-empleada-domestica-colombia-2026',
  ],

  lastReviewed: '2026-08-07',
};
