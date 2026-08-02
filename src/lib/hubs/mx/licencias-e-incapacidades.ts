import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "Me incapacitan o voy a ser mamá/papá: ¿cuánto cobro y por cuánto tiempo?"
 *
 * Absorbe 3 calculadoras que respondían la misma pregunta desde ángulos distintos:
 * el subsidio de maternidad del IMSS, la licencia de paternidad de la LFT y el
 * subsidio por incapacidad de enfermedad general. Se abre también la rama de riesgo
 * de trabajo, que es la que cambia por completo el porcentaje y el día de arranque.
 *
 * Constantes: fuente única src/lib/data/mexico-2026.ts (UMA, tope de 25 UMA del
 * salario base de cotización, porcentajes de la LSS y días de la LFT).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verifica con RR. HH., el organismo laboral o un profesional.';

/** UMA 2026 (INEGI, DOF 09-ene-2026). */
export const UMA_MX = { diaria: MEXICO_2026.uma.diaria, mensual: MEXICO_2026.uma.mensual };

/** Salario mínimo general 2026 y factor de mensualización IMSS. */
export const SM_MX = {
  generalDiario: MEXICO_2026.salarioMinimo.generalDiario,
  factorMensual: MEXICO_2026.salarioMinimo.factorMensual,
};

/** Subsidios e incapacidades del IMSS (LSS Arts. 58, 96, 98, 101, 102). */
export const SUBSIDIOS_MX = {
  topeSbcUmas: MEXICO_2026.imss.topeSbcUmas,
  enfermedadGeneral: MEXICO_2026.incapacidades.enfermedadGeneral,
  riesgoTrabajo: MEXICO_2026.incapacidades.riesgoTrabajo,
  maternidad: MEXICO_2026.incapacidades.maternidad,
  paternidadDiasLft: MEXICO_2026.incapacidades.paternidadDiasLft,
  /** LSS Art. 102: 30 semanas cotizadas en los 12 meses previos al parto. */
  maternidadSemanasRequeridas: 30,
  /** LSS Art. 101: 42 días antes y 42 después de la fecha probable de parto. */
  maternidadDiasAntes: 42,
  maternidadDiasDespues: 42,
};

/** Cuota obrera del IMSS que se descuenta de la nómina (LSS Arts. 25, 106-II, 107, 147, 168). */
export const OBRERO_MX = {
  totalSinExcedente: MEXICO_2026.imss.obrero.totalSinExcedente,
  eymExcedente: MEXICO_2026.imss.obrero.eymExcedente,
};

/**
 * Tarifa ISR mensual 2026 (LISR Art. 96, Anexo 8 RMF 2026, DOF 28-dic-2025).
 * `Infinity` del último renglón se serializa como `null` al cruzar a `define:vars`.
 */
export const ISR_MENSUAL_MX = MEXICO_2026.isrTarifaMensual.map((f) => [
  f[0],
  Number.isFinite(f[1]) ? f[1] : null,
  f[2],
  f[3],
]);

export const hub: HubData = {
  slug: 'mx/familia/licencias-e-incapacidades',
  title: 'Incapacidad y licencias IMSS 2026: maternidad, paternidad y enfermedad general',
  description:
    'Calcula cuánto te paga el IMSS y por cuántos días: subsidio de maternidad al 100% durante 84 días, los 5 días de licencia de paternidad de la LFT, el 60% del salario por enfermedad general desde el cuarto día y el 100% desde el primero por riesgo de trabajo.',
  silo: 'Familia',
  siloHref: '/mx/familia',

  eyebrow: 'México · licencias e incapacidades',
  h1: 'Me incapacitan o voy a ser mamá o papá: ¿cuánto cobro y por cuánto tiempo?',
  lede:
    'El IMSS no paga todas las ausencias igual. La maternidad se cubre al 100% durante 84 días, el riesgo de trabajo al 100% desde el primer día, la enfermedad general solo al 60% y desde el cuarto, y la paternidad ni siquiera la paga el IMSS: la paga tu patrón. Elige tu caso y pon tu salario.',
  stamps: [
    'Subsidios LSS Arts. 58, 98 y 101',
    'Licencia de paternidad · LFT Art. 132-XXVII bis',
    'Tope del salario en 25 UMA',
    '3 calculadoras fusionadas',
  ],

  resultLabel: 'Lo que cobras',

  cases: {
    title: '¿Cuál es tu caso?',
    intro: 'Empezamos por la incapacidad por maternidad, la que mejor cubre el IMSS.',
    items: [
      {
        id: 'maternidad',
        label: 'Voy a ser mamá — incapacidad por maternidad',
        hint: '84 días al 100% del salario base de cotización, 42 antes y 42 después del parto.',
        yes: [
          'Subsidio del 100% del salario base de cotización durante 84 días (LSS Art. 101)',
          'Requisito de 30 semanas cotizadas en los 12 meses previos a la fecha en que inicia la incapacidad',
          'Fechas estimadas de inicio y fin de la licencia a partir de la fecha probable de parto',
          'Diferencia no cubierta si tu salario supera el tope de 25 UMA diarias',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Si no cumples las 30 semanas conservas el derecho a las 12 semanas de licencia, pero el pago corre a cargo del patrón (LFT Art. 103)',
          'El IMSS paga hasta 25 UMA diarias: lo que ganes arriba de ese tope no lo cubre nadie salvo que esté pactado en contrato',
          'Puedes transferir hasta cuatro de las seis semanas previas al parto para después, con autorización médica',
          'Si el parto ocurre después de la fecha probable, los días extra se pagan como prórroga y no reducen los 42 posteriores',
        ],
        plazo:
          'la incapacidad se expide en tu clínica alrededor de la semana 34 de embarazo y el pago llega a tu cuenta unos días después de registrarla.',
        answer:
          'El IMSS paga el 100% de tu salario base de cotización durante 84 días si cotizaste 30 semanas en los 12 meses previos.',
      },
      {
        id: 'paternidad',
        label: 'Voy a ser papá — licencia de paternidad',
        hint: '5 días laborables con goce de sueldo, a cargo del patrón, no del IMSS.',
        yes: [
          'Cinco días laborables con goce de sueldo por nacimiento o adopción (LFT Art. 132, fracción XXVII bis)',
          'Estimación del pago bruto y de los descuentos ordinarios de nómina',
          'Cuota obrera del IMSS y retención de ISR que aplican a esos días como salario normal',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La licencia de paternidad la paga el patrón como salario ordinario: el IMSS no emite subsidio por este concepto',
          'Son cinco días en total por evento, no cinco por cada hijo en un parto múltiple',
          'No pueden despedirte ni sancionarte por solicitarla; si ocurre, la denuncia va a la PROFEDET',
          'Muchos contratos colectivos amplían el beneficio: revisa el tuyo antes de asumir que son solo cinco días',
        ],
        plazo:
          'se solicita al patrón con el acta de nacimiento o el certificado; conviene avisar a Recursos Humanos antes del parto.',
        answer:
          'Son cinco días laborables pagados por el patrón como salario normal, con sus descuentos ordinarios de nómina.',
      },
      {
        id: 'enfermedad',
        label: 'Me incapacitaron por enfermedad general',
        hint: '60% del salario base de cotización, y solo a partir del cuarto día.',
        yes: [
          'Subsidio del 60% del salario base de cotización (LSS Art. 98)',
          'Los primeros tres días no se pagan: el subsidio arranca el cuarto',
          'Límite de 52 semanas, prorrogable 26 semanas más con autorización del IMSS',
          'Cuánto ingreso dejas de percibir frente a tu salario pleno del período',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Los tres primeros días no los cubre nadie salvo que tu contrato colectivo diga lo contrario',
          'Se piden 4 semanas cotizadas inmediatamente antes de la enfermedad, u 8 si dejaste de cotizar hace poco',
          'Al agotarse las 52 semanas más la prórroga, el IMSS cierra el subsidio y procede el dictamen de invalidez',
          'El subsidio se calcula sobre el salario base de cotización registrado, no sobre lo que realmente ganas',
        ],
        plazo:
          'la incapacidad la expide tu médico familiar; el pago llega a la cuenta que tengas registrada unos días después.',
        answer:
          'El IMSS te paga el 60% de tu salario base de cotización a partir del cuarto día de incapacidad.',
      },
      {
        id: 'riesgo',
        label: 'Me incapacitaron por un accidente o enfermedad de trabajo',
        hint: '100% del salario base de cotización desde el primer día.',
        yes: [
          'Subsidio del 100% del salario base de cotización (LSS Art. 58)',
          'Se paga desde el primer día: no hay tres días de carencia',
          'Sin límite de 52 semanas mientras dure la incapacidad temporal',
          'Comparación contra lo que cobrarías si el mismo caso se clasificara como enfermedad general',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La calificación del riesgo la hace el IMSS con el formato ST-7 que llena el patrón: si lo clasifican mal como enfermedad general, pierdes el 40% del subsidio',
          'Los accidentes en trayecto de la casa al trabajo también son riesgo de trabajo',
          'Si la incapacidad queda permanente, el subsidio se convierte en una pensión calculada sobre el porcentaje de valuación',
          'El patrón está obligado a dar el aviso de accidente aunque el caso parezca menor',
        ],
        plazo:
          'el aviso de accidente de trabajo debe presentarse dentro de las 24 horas siguientes al hecho.',
        answer:
          'En riesgo de trabajo el IMSS paga el 100% de tu salario base de cotización desde el primer día.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. El salario base de cotización es el que aparece en tu recibo del IMSS, no tu sueldo neto.',
  fields: [
    {
      id: 'salario',
      label: 'Salario base de cotización (MXN)',
      prefix: '$',
      value: '600',
      thousands: true,
      help: 'Elige abajo si el monto que pusiste es diario o mensual.',
    },
    {
      id: 'periodo',
      label: '¿El salario que pusiste es...?',
      type: 'select',
      value: 'diario',
      options: [
        { value: 'diario', label: 'Diario (salario diario integrado)' },
        { value: 'mensual', label: 'Mensual' },
      ],
      help: 'El salario mensual se divide entre 30,4 para obtener el diario, igual que hace el IMSS.',
    },
    {
      id: 'semanas',
      label: 'Semanas cotizadas en los últimos 12 meses',
      type: 'number',
      value: 40,
      min: 0,
      max: 52,
      step: 1,
      help: 'Solo para maternidad: se piden 30 en los 12 meses previos al inicio de la incapacidad.',
    },
    {
      id: 'fechaParto',
      label: 'Fecha probable de parto',
      type: 'date',
      value: '2026-11-15',
      help: 'La que dice tu certificado médico. Define el inicio y el fin de la licencia.',
    },
    {
      id: 'diasIncapacidad',
      label: 'Días de incapacidad del certificado',
      type: 'number',
      value: 14,
      min: 1,
      max: 700,
      step: 1,
      help: 'Los días que expidió el médico. Para enfermedad general los tres primeros no se pagan.',
    },
    {
      id: 'diasSemana',
      label: 'Días laborables por semana',
      type: 'number',
      value: 5,
      min: 1,
      max: 7,
      step: 1,
      help: 'Solo para paternidad: los 5 días son laborables, no naturales.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'Qué cubre y qué no',
    caption:
      'Compara lo que efectivamente cobras contra lo que dejas de percibir respecto de tu salario pleno del período.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuántos días dura la incapacidad por maternidad en México?',
      a: 'Ochenta y cuatro días naturales, es decir doce semanas: cuarenta y dos antes de la fecha probable de parto y cuarenta y dos después. La ley permite transferir hasta cuatro de las seis semanas previas para usarlas después del parto, siempre con autorización médica y sin oposición del patrón. Si el bebé nace con alguna discapacidad o requiere atención hospitalaria, la licencia posterior puede extenderse hasta ocho semanas.',
    },
    {
      q: '¿Cuánto paga el IMSS por maternidad?',
      a: 'El 100% del salario base de cotización durante los 84 días, siempre que tengas 30 semanas cotizadas en los 12 meses previos al inicio de la incapacidad. El pago se hace en dos exhibiciones, una por cada tramo de 42 días, y llega a la cuenta bancaria que tengas registrada. Si no cumples las 30 semanas, conservas la licencia pero el pago lo asume el patrón.',
    },
    {
      q: '¿Por qué mi subsidio es menor a mi sueldo?',
      a: 'Casi siempre por una de dos razones. La primera es el tope: el IMSS paga sobre un salario base de cotización máximo de 25 UMA diarias, y lo que ganes arriba de ese tope no lo cubre. La segunda es más común de lo que parece: que tu patrón te tenga registrado con un salario menor al real. Ese registro se ve en tu recibo del IMSS y es el que manda para todos los subsidios y para tu pensión futura.',
    },
    {
      q: '¿Cuántos días de paternidad me tocan?',
      a: 'Cinco días laborables con goce de sueldo por nacimiento o adopción, según el artículo 132 fracción XXVII bis de la Ley Federal del Trabajo. Es uno de los mínimos más bajos de la región y sigue sin equipararse a la licencia de maternidad. Muchos contratos colectivos y políticas internas amplían el beneficio, así que conviene revisar el reglamento interior de trabajo antes de asumir que son solo cinco.',
    },
    {
      q: '¿La licencia de paternidad la paga el IMSS?',
      a: 'No. A diferencia de la maternidad, la paternidad no genera subsidio del IMSS: la paga el patrón como salario ordinario, con los descuentos normales de nómina, es decir la cuota obrera del IMSS y el ISR que corresponda. Por eso el neto que recibes es prácticamente el mismo que el de cualquier otro día trabajado.',
    },
    {
      q: '¿Por qué no me pagan los primeros tres días de incapacidad?',
      a: 'Porque la Ley del Seguro Social establece un período de espera de tres días para la enfermedad general: el subsidio arranca el cuarto día. Es una regla de la ley, no un error administrativo. Lo que sí puede pasar es que tu contrato colectivo o la política de tu empresa cubran esos tres días; en ese caso el pago viene del patrón, no del IMSS.',
    },
    {
      q: '¿Cuánto paga el IMSS por enfermedad general?',
      a: 'El 60% del salario base de cotización a partir del cuarto día, hasta un máximo de 52 semanas prorrogables por 26 semanas más con autorización del instituto. Es el subsidio menos generoso de todos: pierdes cuatro de cada diez pesos de tu salario registrado, y además los tres primeros días. Por eso conviene revisar si tu caso realmente es enfermedad general o si califica como riesgo de trabajo.',
    },
    {
      q: '¿Qué diferencia hay entre enfermedad general y riesgo de trabajo?',
      a: 'Toda. El riesgo de trabajo es el accidente o la enfermedad que ocurre con motivo o en ejercicio del trabajo, incluidos los accidentes de trayecto entre la casa y el centro laboral. Se paga al 100% del salario base de cotización y desde el primer día, sin los tres días de espera. La enfermedad general se paga al 60% y desde el cuarto. La clasificación la hace el IMSS con el aviso que presenta el patrón.',
    },
    {
      q: '¿Qué pasa cuando se agotan las 52 semanas de incapacidad?',
      a: 'El IMSS puede autorizar una prórroga de hasta 26 semanas más. Al agotarse ese plazo el subsidio termina y procede el dictamen de invalidez, que evalúa si perdiste más de la mitad de tu capacidad para trabajar. Si el dictamen es favorable, la incapacidad se convierte en pensión por invalidez, calculada sobre el promedio salarial de las últimas 500 semanas.',
    },
    {
      q: '¿Me pueden despedir mientras estoy incapacitado?',
      a: 'La incapacidad suspende la relación de trabajo, no la termina: durante ese período no corre la obligación de prestar el servicio ni la de pagar salario, pero el vínculo sigue vivo y el despido en ese momento es improcedente. Al alta médica tienes derecho a reincorporarte a tu puesto. Si el patrón se niega, procede la demanda por despido injustificado ante el tribunal laboral.',
    },
    {
      q: '¿La incapacidad cuenta para mis semanas cotizadas?',
      a: 'Sí. Durante la incapacidad temporal se sigue reconociendo la cotización, así que las semanas cuentan para tu pensión y para los demás requisitos del IMSS. Lo que no ocurre es la generación de aguinaldo, vacaciones ni prima vacacional en esos días, porque son prestaciones que dependen del trabajo efectivamente prestado.',
    },
    {
      q: '¿Cómo cobro el subsidio del IMSS?',
      a: 'Por transferencia a la cuenta bancaria que registres en la ventanilla del IMSS o en la app IMSS Digital. Si no tienes cuenta registrada, el pago se hace por orden de cobro en sucursal bancaria, lo que suele tardar más. La incapacidad se registra automáticamente cuando el médico la expide, así que no hace falta llevarla a ninguna ventanilla para que se pague.',
    },
  ],

  sources: [
    {
      name: 'Ley del Seguro Social — subsidios por incapacidad y maternidad (Arts. 28, 58, 96, 98, 101, 102)',
      url: 'https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf',
      publisher: 'IMSS',
    },
    {
      name: 'Ley Federal del Trabajo — maternidad y paternidad (Arts. 103, 132-XXVII bis, 170)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lft.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'IMSS — incapacidades y subsidios',
      url: 'https://www.imss.gob.mx/tramites/imss01004',
      publisher: 'IMSS',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'Anexo 8 de la Resolución Miscelánea Fiscal 2026 — tarifas de ISR (DOF 28-dic-2025)',
      url: 'https://www.sat.gob.mx/normatividad/compilacion/resolucion-miscelanea-fiscal',
      publisher: 'SAT',
      date: '28-12-2025',
    },
  ],

  replaces: [
    '/calculadora-licencia-maternidad-mexico-imss-12-semanas',
    '/calculadora-licencia-paternidad-mexico-5-dias-laborables',
    '/calculadora-incapacidad-imss-enfermedad-general',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
