import type { HubData } from '../types';
import { PARAGUAY_2026 } from '../../data/paraguay-2026';

/**
 * Hub de decisión PY — "Me voy del trabajo: ¿cuánto me tienen que pagar?"
 *
 * Fuente única de constantes: src/lib/data/paraguay-2026.ts. Nada de memoria.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Escala de preaviso del art. 87 (Infinity no sobrevive a define:vars → null). */
export const PREAVISO = PARAGUAY_2026.laboral.preaviso.map((t) => ({
  hasta: Number.isFinite(t.hastaAnios) ? t.hastaAnios : null,
  dias: t.dias,
}));

/** Escala de vacaciones del art. 218, en días hábiles corridos. */
export const VACACIONES = PARAGUAY_2026.laboral.vacaciones.map((t) => ({
  hasta: Number.isFinite(t.hastaAnios) ? t.hastaAnios : null,
  dias: t.dias,
}));

/** Art. 91: 15 jornales por año de servicio o fracción mayor a 6 meses. */
export const INDEMNIZACION = {
  jornalesPorAnio: PARAGUAY_2026.laboral.indemnizacionJornalesPorAnio,
  estabilidadAnios: PARAGUAY_2026.laboral.estabilidadAniosDoble,
};

/** Art. 243: el aguinaldo es la doceava parte de todo lo percibido en el año. */
export const AGUINALDO_DIVISOR = PARAGUAY_2026.laboral.aguinaldoDivisor;

/** Divisor para pasar de salario mensual a jornal diario. */
export const DIAS_MES = PARAGUAY_2026.diasMes;

export const SMVM = PARAGUAY_2026.salarioMinimo;

const gs = (n: number) => 'Gs. ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'py/trabajo/liquidacion-final',
  title: 'Liquidación final en Paraguay: indemnización, preaviso, aguinaldo y vacaciones',
  description:
    'Cuánto te tienen que pagar al terminar el trabajo en Paraguay: indemnización de 15 jornales por año, doble indemnización con 10 años de antigüedad, preaviso del art. 87, aguinaldo proporcional y vacaciones no gozadas.',
  silo: 'Trabajo',
  siloHref: '/py/trabajo',
  locale: 'py',

  eyebrow: 'Paraguay · Código del Trabajo · Ley 213/93',
  h1: 'Te vas del trabajo: ¿cuánto te tienen que pagar?',
  lede:
    'La liquidación final cambia por completo según cómo termine la relación. Con tu sueldo y tu fecha de ingreso, la cuenta arma los cuatro conceptos —indemnización, preaviso, aguinaldo proporcional y vacaciones— y te dice cuáles corresponden en tu caso.',
  stamps: [
    'Arts. 87, 91, 94, 218 y 243 del Código del Trabajo',
    `${INDEMNIZACION.jornalesPorAnio} jornales por año de servicio`,
    `Doble indemnización desde los ${INDEMNIZACION.estabilidadAnios} años`,
    '7 calculadoras adentro',
  ],

  resultLabel: 'Total de tu liquidación final',

  cases: {
    title: '¿Cómo termina la relación laboral?',
    intro:
      'Ésta es la pregunta que decide todo: el aguinaldo y las vacaciones se pagan siempre, pero la indemnización y el preaviso dependen de la causa. Partimos del caso más consultado.',
    items: [
      {
        id: 'despido-injustificado',
        label: 'Me despidieron sin causa',
        hint: 'Despido injustificado · arts. 91 y 94',
        answer: `Te corresponden ${INDEMNIZACION.jornalesPorAnio} jornales por cada año de servicio, más preaviso, aguinaldo proporcional y vacaciones.`,
        yes: [
          `Indemnización de ${INDEMNIZACION.jornalesPorAnio} jornales por año de servicio o fracción mayor a 6 meses (art. 91)`,
          `Doble indemnización si tenés ${INDEMNIZACION.estabilidadAnios} años o más de antigüedad, por el régimen de estabilidad (art. 94)`,
          'Indemnización sustitutiva del preaviso, si el empleador no te lo otorgó (art. 87)',
          'Aguinaldo proporcional a los meses trabajados del año (art. 243)',
          'Vacaciones proporcionales del año en curso y las de años anteriores no gozadas (art. 218)',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La fracción mayor a 6 meses cuenta como un año entero para la indemnización: si te faltan pocos días para cruzar ese umbral, puede valer bastante plata',
          'Con estabilidad la ley también habilita pedir la reposición en el puesto en lugar de la indemnización doble: son caminos alternativos, no acumulables',
          'Firmar el finiquito sin revisar los conceptos complica el reclamo posterior',
        ],
        plazo: 'la acción por despido tiene plazos de prescripción cortos; consultá al MTESS antes de dejar pasar el tiempo.',
      },
      {
        id: 'renuncia',
        label: 'Renuncié',
        hint: 'Retiro voluntario',
        answer: 'En la renuncia no hay indemnización ni preaviso a cargo del empleador: cobrás aguinaldo proporcional y vacaciones.',
        yes: [
          'Aguinaldo proporcional a los meses efectivamente trabajados del año',
          'Vacaciones proporcionales del año en curso más las no gozadas de años anteriores',
          'Los días trabajados del último mes y los recargos pendientes',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El preaviso también corre al revés: renunciar sin avisar con la antelación del art. 87 puede habilitar al empleador a descontarte el equivalente',
          'Una renuncia firmada bajo presión para evitar pagar la indemnización es un despido encubierto: si es tu caso, no firmes y hacé la denuncia',
        ],
        plazo: 'la liquidación se paga al terminar la relación, junto con el certificado de trabajo.',
      },
      {
        id: 'mutuo-acuerdo',
        label: 'Nos separamos de común acuerdo',
        hint: 'Mutuo consentimiento',
        answer: 'Legalmente equivale a la renuncia: aguinaldo y vacaciones sí, indemnización y preaviso no, salvo lo que se pacte.',
        yes: [
          'Aguinaldo proporcional y vacaciones, que son irrenunciables',
          'Todo monto adicional que se haya pactado por escrito en el acuerdo',
          'El acuerdo conviene homologarlo ante la autoridad laboral',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Un mutuo acuerdo no puede renunciar a derechos irrenunciables como el aguinaldo o las vacaciones devengadas',
          'Si el acuerdo paga menos que la indemnización que te correspondería por despido, estás resignando plata: hacé las dos cuentas antes de firmar',
        ],
        plazo: 'firmá el acuerdo recién cuando el pago esté disponible, no antes.',
      },
      {
        id: 'periodo-prueba',
        label: 'Estoy en período de prueba',
        hint: 'Menos de 1 año · art. 87',
        answer: 'Durante el período de prueba cualquiera de las partes puede terminar sin preaviso ni indemnización.',
        yes: [
          'Aguinaldo proporcional por los meses trabajados, aunque sea poco tiempo',
          'Vacaciones proporcionales devengadas',
          'Los días efectivamente trabajados y los recargos del período',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Superado el período de prueba, el preaviso mínimo pasa a ser de 30 días para antigüedades de hasta 1 año',
          'El período de prueba no habilita a pagar por debajo del salario mínimo ni a no inscribirte en el IPS desde el primer día',
        ],
        plazo: 'chequeá en tu contrato la duración pactada del período de prueba antes de asumir que seguís dentro.',
      },
    ],
  },

  inputsTitle: 'Tus datos de la relación laboral',
  inputsIntro:
    'Con el sueldo y la antigüedad alcanza para el grueso. Cargá los días de vacaciones pendientes si arrastrás años anteriores.',
  fields: [
    {
      id: 'salario',
      label: 'Último salario mensual (Gs.)',
      prefix: 'Gs.',
      value: '4.000.000',
      thousands: true,
      help: `El salario del último mes, incluyendo lo que sea habitual y permanente. Salario mínimo vigente: ${gs(SMVM)}.`,
    },
    {
      id: 'anios',
      label: 'Años completos de antigüedad',
      type: 'number',
      value: 6,
      min: 0,
      max: 50,
      step: 1,
      help: `Desde los ${INDEMNIZACION.estabilidadAnios} años se activa la estabilidad y la indemnización se duplica.`,
    },
    {
      id: 'meses',
      label: 'Meses adicionales de antigüedad',
      type: 'number',
      value: 8,
      min: 0,
      max: 11,
      step: 1,
      help: 'La fracción mayor a 6 meses computa como un año entero para la indemnización (art. 91).',
    },
    {
      id: 'mesesAnio',
      label: 'Meses trabajados del año en curso',
      type: 'number',
      value: 7,
      min: 0,
      max: 12,
      step: 1,
      help: 'Base del aguinaldo proporcional y de las vacaciones proporcionales del año.',
    },
    {
      id: 'diasVacPendientes',
      label: 'Días de vacaciones no gozadas de años anteriores',
      type: 'number',
      value: 0,
      min: 0,
      max: 120,
      step: 1,
      help: 'Sólo los días que arrastrás de períodos anteriores: los del año en curso se calculan solos.',
    },
    {
      id: 'preavisoOtorgado',
      label: '¿Te otorgaron el preaviso?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No: me lo tienen que indemnizar' },
        { value: 'si', label: 'Sí: lo trabajé o lo cumplí' },
      ],
      help: 'Si el empleador te avisó con la antelación del art. 87, no hay indemnización sustitutiva.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu liquidación',
    caption:
      'Muestra el peso de cada concepto en el total: en un despido con antigüedad, la indemnización se lleva casi todo; en una renuncia, el aguinaldo y las vacaciones son toda la liquidación.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro:
    'El orden del finiquito: jornal de base, indemnización, preaviso, aguinaldo, vacaciones y total.',

  faq: [
    {
      q: '¿Cuánto es la indemnización por despido injustificado en Paraguay?',
      a: `El art. 91 del Código del Trabajo fija ${INDEMNIZACION.jornalesPorAnio} jornales, es decir ${INDEMNIZACION.jornalesPorAnio} salarios diarios, por cada año de servicio o fracción mayor a 6 meses. El jornal sale de dividir el salario mensual por ${DIAS_MES}. Con ${INDEMNIZACION.estabilidadAnios} años o más de antigüedad entra en juego el régimen de estabilidad del art. 94 y la indemnización se duplica.`,
    },
    {
      q: '¿Qué es la doble indemnización y desde cuándo se aplica?',
      a: `Al cumplir ${INDEMNIZACION.estabilidadAnios} años en la misma empresa el trabajador adquiere estabilidad. Desde ahí, un despido sin causa justificada da derecho a la reposición en el puesto o, en su lugar, a una indemnización doble. Son dos caminos alternativos: se elige uno, no se suman. Es la razón por la que muchas desvinculaciones se apuran antes de llegar a esa marca.`,
    },
    {
      q: '¿Cómo se cuenta la fracción de año?',
      a: 'Una fracción mayor a 6 meses cuenta como un año completo para la indemnización. Si tenés 6 años y 8 meses, se computan 7 años; si tenés 6 años y 4 meses, se computan 6. La diferencia entre estar de un lado o del otro de esa línea es de 15 jornales enteros, así que vale la pena verificar la fecha exacta de ingreso en tu contrato o en el historial del IPS.',
    },
    {
      q: '¿Cuántos días de preaviso me corresponden?',
      a: `El art. 87 escala el preaviso por antigüedad: ${PREAVISO[0].dias} días hasta 1 año, ${PREAVISO[1].dias} días de 1 a 5 años, ${PREAVISO[2].dias} días de 5 a 10 años y ${PREAVISO[3].dias} días con más de 10 años. Si la parte que rescinde no lo otorga, tiene que pagar una indemnización sustitutiva equivalente a los salarios de esos días. Durante el preaviso trabajado el empleado conserva el derecho a 2 días pagos por semana para buscar trabajo (art. 88).`,
    },
    {
      q: '¿Cuántos días de vacaciones me corresponden según mi antigüedad?',
      a: `El art. 218 fija ${VACACIONES[0].dias} días hábiles corridos hasta los 5 años de antigüedad, ${VACACIONES[1].dias} días de 5 a 10 años y ${VACACIONES[2].dias} días con más de 10 años. Al terminar la relación se pagan las vacaciones proporcionales del año en curso más cualquier período anterior que no hayas gozado.`,
    },
    {
      q: '¿Cómo se calcula el aguinaldo proporcional?',
      a: `El aguinaldo es la doceava parte de todo lo percibido en el año calendario (art. 243). Si te vas a mitad de año, cobrás la proporción de los meses trabajados: sueldo por meses dividido ${AGUINALDO_DIVISOR}. Y ojo con el "todo lo percibido": si tuviste horas extras, comisiones o bonificaciones, entran a la base y suben el aguinaldo. Al aguinaldo no se le descuenta IPS.`,
    },
    {
      q: 'Si renuncio, ¿pierdo todo?',
      a: 'No. Perdés la indemnización y el preaviso a cargo del empleador, que son la consecuencia del despido sin causa. Pero el aguinaldo proporcional y las vacaciones devengadas son derechos irrenunciables: se pagan igual, renuncies o te despidan. Lo que cambia es el tamaño de la liquidación, no su existencia.',
    },
    {
      q: '¿Me pueden descontar algo de la liquidación final?',
      a: 'Sólo lo que esté legalmente autorizado: anticipos que hayas recibido, el aporte al IPS sobre los conceptos remunerativos y las retenciones judiciales notificadas. El aguinaldo, además, es inembargable por el art. 245. Un descuento por "daños" o por no haber preavisado tiene que estar documentado y no puede aplicarse de forma unilateral y a ojo.',
    },
    {
      q: '¿Qué pasa si el empleador no me paga la liquidación?',
      a: 'Podés reclamar ante el MTESS, que cita a las partes a una audiencia de conciliación, y si no hay acuerdo, ir a la justicia laboral. Guardá todo: recibos de sueldo, el aviso de despido, mensajes y el historial de aportes al IPS, que es la prueba más sólida de la fecha de ingreso y del salario declarado. No firmes un finiquito por un monto que no recibiste.',
    },
    {
      q: '¿Cuál es la diferencia entre preaviso e indemnización?',
      a: 'El preaviso compensa la falta de aviso: es el tiempo que la ley te da para conseguir otro trabajo antes de quedarte sin ingresos, y si no te lo dan te lo pagan en plata. La indemnización compensa la pérdida del puesto en sí, y se mide por la antigüedad acumulada. Se cobran los dos, no son excluyentes.',
    },
    {
      q: '¿Cómo verifico mi antigüedad real?',
      a: 'La fecha que vale es la del primer día efectivo de trabajo, no la del contrato firmado ni la de la inscripción tardía en el IPS. El historial de aportes del IPS es la prueba más usada, pero si el empleador te inscribió tarde, la antigüedad real puede ser mayor y se puede probar con recibos, testigos o registros internos. La diferencia impacta directo en jornales de indemnización.',
    },
    {
      q: '¿Se paga la liquidación sobre el sueldo bruto o el neto?',
      a: 'Sobre el bruto. Todos los conceptos —jornal para la indemnización, días de preaviso, aguinaldo y vacaciones— se calculan sobre el salario bruto habitual del último período. Después, sobre los conceptos remunerativos se aplica el aporte al IPS; el aguinaldo queda fuera de ese descuento.',
    },
  ],

  sources: [
    {
      name: 'Código del Trabajo (Ley N° 213/93) — arts. 87, 91, 94, 218 y 243',
      url: 'https://www.bacn.gov.py/leyes-paraguayas/2608/ley-n-213-establece-el-codigo-del-trabajo',
      publisher: 'Biblioteca y Archivo Central del Congreso Nacional',
    },
    {
      name: 'MTESS — Derechos del trabajador y trámites de desvinculación',
      url: 'https://www.mtess.gov.py/',
      publisher: 'Ministerio de Trabajo, Empleo y Seguridad Social',
    },
    {
      name: 'IPS — Historial de aportes (prueba de antigüedad y salario declarado)',
      url: 'https://portal.ips.gov.py/',
      publisher: 'Instituto de Previsión Social',
    },
  ],

  replaces: [
    '/py/indemnizacion-despido-paraguay',
    '/py/calculadora-liquidacion-final-paraguay',
    '/py/calculadora-preaviso-paraguay',
    '/py/calculadora-aguinaldo-paraguay',
    '/py/aguinaldo-proporcional-paraguay',
    '/py/calculadora-vacaciones-paraguay',
    '/py/calculadora-antiguedad-laboral-paraguay',
  ],

  lastReviewed: '2026-07-28',
};
