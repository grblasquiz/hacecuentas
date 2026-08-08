import type { HubData } from '../types';
import { MEXICO_2026, AFORE_COMISIONES_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto tengo en la Afore y cuánto me la comen las comisiones?"
 *
 * Absorbe 5 calculadoras que respondían pedazos de la misma cuenta: la proyección
 * del saldo hasta el retiro, el ahorro voluntario y su deducción de ISR, el costo
 * acumulado de la comisión, el retiro parcial por desempleo y el ISR de un retiro
 * anticipado del ahorro voluntario o de un PPR.
 *
 * Constantes: fuente única src/lib/data/mexico-2026.ts (UMA, tarifa ISR anual del
 * Anexo 8 de la RMF 2026, comisiones CONSAR 2026 y reglas del Art. 191 de la LSS).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/** UMA 2026 (INEGI, DOF 09-ene-2026). */
export const UMA_MX = {
  diaria: MEXICO_2026.uma.diaria,
  mensual: MEXICO_2026.uma.mensual,
  anual: MEXICO_2026.uma.anual,
};

/** Salario mínimo general 2026 y factor de mensualización IMSS. */
export const SM_MX = {
  generalDiario: MEXICO_2026.salarioMinimo.generalDiario,
  generalMensual: MEXICO_2026.salarioMinimo.generalMensual,
  factorMensual: MEXICO_2026.salarioMinimo.factorMensual,
};

/** Comisiones AFORE 2026 autorizadas por la Junta de Gobierno de la CONSAR. */
export const COMISIONES_MX = AFORE_COMISIONES_2026;

/** Retiro parcial por desempleo — LSS Art. 191 y reglas CONSAR. */
export const DESEMPLEO_MX = MEXICO_2026.aforeDesempleo;

/**
 * Tarifa ISR anual 2026 (LISR Art. 152, Anexo 8 RMF 2026, DOF 28-dic-2025).
 * `Infinity` del último renglón se serializa como `null` al cruzar a `define:vars`.
 */
export const ISR_ANUAL_MX = MEXICO_2026.isrTarifaAnual.map((f) => [
  f[0],
  Number.isFinite(f[1]) ? f[1] : null,
  f[2],
  f[3],
]);

/** Tope de la deducción por aportaciones complementarias de retiro (LISR Art. 151-V). */
export const DEDUCCION_MX = {
  topeUmasAnuales: MEXICO_2026.deduccionesPersonales.topeUmasAnuales,
  topePorcentajeIngresos: 0.1,
  /** Retención provisional de un retiro anticipado (LISR Art. 145). */
  retencionRetiroAnticipado: 0.2,
};

export const hub: HubData = {
  slug: 'mx/finanzas/mi-afore',
  title: 'Afore 2026: saldo proyectado, comisiones, ahorro voluntario y retiro por desempleo',
  description:
    'Calcula cuánto vas a tener en tu Afore al jubilarte, cuánto se lleva la comisión en 10 y 30 años, cuánto ISR te devuelve el SAT por ahorro voluntario, cuánto puedes retirar por desempleo y qué te retienen si sacas el dinero antes de tiempo.',
  silo: 'Finanzas',
  siloHref: '/mx/finanzas',

  eyebrow: 'México · Afore y ahorro para el retiro',
  h1: '¿Cuánto tengo en la Afore y cuánto me la comen las comisiones?',
  lede:
    'Tu Afore es probablemente tu ahorro más grande y el que menos miras. Aquí ves las cinco cuentas que importan: qué saldo proyectas al retiro, cuánto se lleva la comisión a lo largo de las décadas, cuánto ISR te devuelve el SAT si aportas de más, cuánto puedes sacar si te quedas sin trabajo y qué te cuesta retirar antes de tiempo.',
  stamps: [
    `Comisiones CONSAR 2026 · promedio ${(AFORE_COMISIONES_2026.promedioSistema * 100).toFixed(3).replace('.', ',')}%`,
    'Deducción LISR Art. 151-V',
    'Retiro por desempleo · LSS Art. 191',
    '5 calculadoras fusionadas',
  ],

  resultLabel: 'Resultado de tu Afore',

  cases: {
    title: '¿Qué necesitas saber de tu Afore?',
    intro: 'Empezamos por la pregunta más común: cuánto vas a tener acumulado cuando te retires.',
    items: [
      {
        id: 'proyeccion',
        label: 'Cuánto voy a tener al retirarme',
        hint: 'Proyecta tu saldo actual más las aportaciones obligatorias y voluntarias hasta la edad de retiro.',
        yes: [
          'Capitalización de tu saldo actual con el rendimiento neto que elijas',
          'Aportación tripartita obligatoria de entre 9,15% y 10,64% del salario base de cotización según tu nivel salarial (reforma 2020), más la cuota social',
          'Aportaciones voluntarias mensuales que decidas sumar',
          'Estimación de la pensión mensual que compraría ese saldo y tasa de reemplazo sobre tu sueldo actual',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La proyección usa un rendimiento constante: los rendimientos reales suben y bajan, y las Siefores básicas cambian de perfil conforme te acercas al retiro',
          'La aportación obligatoria se calcula sobre el salario base de cotización, no sobre tu sueldo bruto, y se topa en 25 UMA',
          'La pensión estimada no incluye el saldo de la subcuenta de vivienda, que solo se suma si no usaste tu crédito Infonavit',
        ],
        plazo:
          'revisa tu estado de cuenta cada cuatro meses: la Afore te lo manda y ahí ves las aportaciones que tu patrón realmente enteró.',
        answer:
          'Tu saldo al retiro depende de tres cosas: lo que ya tienes, lo que aportas cada mes y cuántos años le queden para capitalizar.',
      },
      {
        id: 'voluntario',
        label: 'Cuánto ISR me devuelve el ahorro voluntario',
        hint: 'Las aportaciones complementarias de retiro son deducibles fuera del tope global de deducciones.',
        yes: [
          'Tope de la deducción: el menor entre el 10% de tu ingreso acumulable anual y 5 UMA anuales',
          'Ahorro fiscal real calculado con la tarifa anual del Art. 152, no con una tasa plana',
          'Costo neto de la aportación, que es lo que de verdad sale de tu bolsillo',
          'Proyección del fondo con aportaciones anuales recurrentes',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Las aportaciones complementarias de retiro van fuera del tope global de deducciones personales, pero tienen su propio tope de 5 UMA anuales',
          'Si retiras el dinero antes de los 65 años pierdes el beneficio: la administradora retiene el 20% y el retiro se acumula a tus ingresos del año',
          'Solo las aportaciones registradas como complementarias de retiro o de largo plazo son deducibles; las de corto plazo no lo son',
        ],
        plazo:
          'la aportación tiene que estar hecha dentro del año fiscal para deducirla en la declaración anual de abril del año siguiente.',
        answer:
          'El SAT te devuelve tu tasa marginal sobre lo que aportes, hasta el menor entre el 10% de tu ingreso y 5 UMA anuales.',
      },
      {
        id: 'comisiones',
        label: 'Cuánto me cobra de comisión mi Afore',
        hint: 'Un porcentaje pequeño sobre todo el saldo, todos los años, se compone durante décadas.',
        yes: [
          'Comisión que pagas este año sobre tu saldo actual',
          'Costo acumulado de la comisión a 1, 10 y 30 años comparado contra el mismo saldo sin comisión',
          'Porcentaje de tu saldo final que se lleva la comisión',
          'Comparación contra el promedio del sistema autorizado por la CONSAR',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Con las comisiones prácticamente empatadas entre administradoras, el criterio para elegir Afore es el rendimiento neto del comparativo de la CONSAR, no la comisión sola',
          'La comisión se cobra sobre el saldo administrado, así que crece contigo aunque el porcentaje no cambie',
          'La proyección asume un rendimiento constante: es una comparación entre escenarios, no un pronóstico',
        ],
        plazo:
          'el traspaso de Afore se puede hacer una vez al año, o antes si te cambias a una con mejor rendimiento neto.',
        answer:
          'La comisión anual sobre saldo parece pequeña, pero a treinta años se lleva una porción visible del fondo final.',
      },
      {
        id: 'desempleo',
        label: 'Cuánto puedo retirar si me quedé sin trabajo',
        hint: 'Retiro parcial por desempleo: dos modalidades según la antigüedad de tu cuenta.',
        yes: [
          'Modalidad A: 30 días de tu último salario base de cotización, con tope de 10 salarios mínimos mensuales',
          'Modalidad B: lo menor entre 90 días de tu salario base y el 11,5% del saldo de tu subcuenta de retiro',
          'Cuál de las dos te conviene y cuánto queda en la cuenta',
          'Estimación de las semanas cotizadas que se te descuentan',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          `Necesitas ${MEXICO_2026.aforeDesempleo.diasDesempleoMinimo} días naturales sin trabajo y solo puedes hacerlo una vez cada ${MEXICO_2026.aforeDesempleo.aniosEntreRetiros} años`,
          'El retiro descuenta semanas cotizadas en proporción al monto retirado: puedes recuperarlas si reintegras el dinero',
          'La Modalidad A pide al menos 3 años de cuenta; la B, al menos 5',
        ],
        plazo:
          'el trámite se hace en tu Afore o en la app AforeMóvil y el depósito suele tardar unos días hábiles.',
        answer:
          'Puedes retirar entre 30 y 90 días de salario según la antigüedad de tu cuenta, y siempre a costa de semanas cotizadas.',
      },
      {
        id: 'anticipado',
        label: 'Qué me retienen si saco el ahorro voluntario antes',
        hint: 'Retiro anticipado de aportaciones voluntarias de largo plazo o de un PPR.',
        yes: [
          'Retención provisional del 20% que aplica la administradora al momento del retiro',
          'Monto neto que recibes en el momento',
          'Estimación del ISR que ese ingreso genera al acumularse a tus demás ingresos del año',
          'Referencia de la exención por edad o invalidez',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La retención del 20% es un pago provisional, no el impuesto definitivo: el ISR real se determina en tu declaración anual, donde el retiro se suma a tus demás ingresos',
          'Si dedujiste esas aportaciones en años anteriores, el retiro anticipado revierte el beneficio fiscal que obtuviste',
          'Este cálculo no aplica la exención por edad de 65 años o invalidez: consúltala con un contador antes de retirar',
        ],
        plazo:
          'la retención se aplica en el momento del retiro; el ajuste ocurre en la declaración anual de abril del año siguiente.',
        answer:
          'Te retienen el 20% al retirar, pero el impuesto final depende de cuánto ganaste ese año en total.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. Cada caso usa solo los campos que le tocan: los demás quedan sin efecto en ese cálculo.',
  fields: [
    {
      id: 'saldo',
      label: 'Saldo actual de tu Afore (MXN)',
      prefix: '$',
      value: 450000,
      thousands: true,
      help: 'Subcuenta de retiro, cesantía y vejez de tu estado de cuenta.',
    },
    {
      id: 'salario',
      label: 'Salario mensual (MXN)',
      prefix: '$',
      value: 20000,
      thousands: true,
      help: 'Tu salario base de cotización mensual. Define las aportaciones obligatorias y el retiro por desempleo.',
    },
    {
      id: 'edadActual',
      label: 'Tu edad hoy',
      type: 'number',
      value: 40,
      min: 18,
      max: 74,
      step: 1,
      help: 'Solo para la proyección de saldo.',
    },
    {
      id: 'edadRetiro',
      label: 'Edad a la que te retiras',
      type: 'select',
      value: '65',
      options: [
        { value: '60', label: '60 años — cesantía' },
        { value: '62', label: '62 años' },
        { value: '65', label: '65 años — vejez' },
        { value: '70', label: '70 años' },
      ],
      help: 'Cada año extra suma aportaciones y rendimiento.',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento anual esperado (%)',
      suffix: '%',
      type: 'number',
      value: 7,
      min: 0,
      max: 15,
      step: 0.5,
      help: 'Rendimiento nominal antes de comisión.',
    },
    {
      id: 'comision',
      label: 'Comisión anual de tu Afore (%)',
      suffix: '%',
      type: 'number',
      value: 0.54,
      min: 0,
      max: 2,
      step: 0.01,
      help: 'En 2026 nueve administradoras cobran 0,54% y PENSIONISSSTE 0,52%.',
    },
    {
      id: 'voluntarioMensual',
      label: 'Aportación voluntaria mensual (MXN)',
      prefix: '$',
      value: 2000,
      thousands: true,
      help: 'Lo que aportas de tu bolsillo cada mes por encima de lo obligatorio.',
    },
    {
      id: 'ingresoAnual',
      label: 'Ingreso acumulable anual (MXN)',
      prefix: '$',
      value: 480000,
      thousands: true,
      help: 'Solo para el caso de ahorro voluntario: sueldos u honorarios del año.',
    },
    {
      id: 'aniosProyeccion',
      label: 'Años de la proyección del ahorro voluntario',
      type: 'number',
      value: 20,
      min: 1,
      max: 45,
      step: 1,
      help: 'Cuántos años planeas sostener la aportación voluntaria.',
    },
    {
      id: 'aniosCuenta',
      label: 'Años que tiene abierta tu cuenta Afore',
      type: 'number',
      value: 8,
      min: 0,
      max: 50,
      step: 1,
      help: 'Solo para el retiro por desempleo: 3 años habilitan la Modalidad A y 5 la B.',
    },
    {
      id: 'semanas',
      label: 'Semanas cotizadas',
      type: 'number',
      value: 900,
      min: 0,
      max: 3000,
      step: 1,
      help: 'Sirve para estimar cuántas semanas se descuentan si retiras por desempleo.',
    },
    {
      id: 'montoRetiro',
      label: 'Monto que quieres retirar anticipadamente (MXN)',
      prefix: '$',
      value: 100000,
      thousands: true,
      help: 'Solo para el caso de retiro anticipado del ahorro voluntario o de un PPR.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte',
    caption:
      'Cada porción muestra qué parte del dinero es tuya y qué parte se va en comisión, impuestos o retiros.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto se aporta a mi Afore cada mes?',
      a: 'La aportación obligatoria de retiro, cesantía y vejez en 2026 es de entre el 9,15% y el 10,64% del salario base de cotización según el nivel salarial (retiro 2% + CEAV patronal progresiva de la reforma 2020 + 1,125% del trabajador), más la cuota social para los salarios más bajos. Con la reforma de pensiones de 2020, la parte patronal de cesantía y vejez sube cada año de forma progresiva hasta 2030, así que la aportación total va creciendo. Además va un 5% del salario a la subcuenta de vivienda, que administra el Infonavit.',
    },
    {
      q: '¿Cuánto cobran de comisión las Afores en 2026?',
      a: `La CONSAR autoriza las comisiones cada año. En 2026 nueve administradoras cobran ${(AFORE_COMISIONES_2026.restoAfores * 100).toFixed(2).replace('.', ',')}% anual sobre el saldo administrado y PENSIONISSSTE ${(AFORE_COMISIONES_2026.pensionissste * 100).toFixed(2).replace('.', ',')}%, con un promedio del sistema de ${(AFORE_COMISIONES_2026.promedioSistema * 100).toFixed(3).replace('.', ',')}%. Como están prácticamente empatadas, la comisión ya no es el criterio útil para elegir: lo que decide es el rendimiento neto.`,
    },
    {
      q: '¿Entonces cómo elijo Afore?',
      a: 'Por el indicador de rendimiento neto que publica la CONSAR, que ya descuenta la comisión y compara administradoras dentro de la misma Siefore básica, es decir entre gente de tu misma edad. Comparar el rendimiento bruto de una Siefore de gente joven contra otra de gente próxima al retiro no dice nada, porque invierten en cosas distintas. El traspaso es gratuito y se puede hacer una vez al año.',
    },
    {
      q: '¿Cuánto ISR me devuelve el ahorro voluntario?',
      a: 'Depende de tu tasa marginal. Las aportaciones complementarias de retiro son deducibles hasta el menor entre el 10% de tu ingreso acumulable anual y 5 UMA anuales, y van fuera del tope global de deducciones personales. Si tu tasa marginal es del 30%, cada peso deducible te devuelve treinta centavos en la declaración anual. La devolución llega semanas después de presentarla si tienes tu cuenta bancaria registrada.',
    },
    {
      q: '¿Qué diferencia hay entre aportación voluntaria de corto y de largo plazo?',
      a: 'La de corto plazo la puedes retirar cada dos o seis meses según la Afore, pero no es deducible. La complementaria de retiro y la de largo plazo sí son deducibles, y a cambio quedan comprometidas hasta el retiro: si las sacas antes se acumulan a tus ingresos del año y la administradora te retiene el 20%. Al registrar la aportación tienes que elegir el tipo, así que revisa cuál marcaste.',
    },
    {
      q: '¿Cuánto puedo retirar de mi Afore si me quedé sin trabajo?',
      a: `Hay dos modalidades. La A aplica si tu cuenta tiene al menos 3 años y te da hasta 30 días de tu último salario base de cotización, con tope de 10 salarios mínimos mensuales. La B aplica con 5 años o más de cuenta y te da lo menor entre 90 días de salario y el 11,5% del saldo de tu subcuenta de retiro. En ambos casos necesitas ${MEXICO_2026.aforeDesempleo.diasDesempleoMinimo} días naturales de desempleo y solo puedes hacerlo una vez cada ${MEXICO_2026.aforeDesempleo.aniosEntreRetiros} años.`,
    },
    {
      q: '¿El retiro por desempleo me quita semanas cotizadas?',
      a: 'Sí, y ese es el costo real. El descuento es proporcional al monto retirado sobre el saldo de tu subcuenta, así que sacar una parte pequeña quita pocas semanas y sacar mucho quita muchas. Las semanas se recuperan si reintegras el dinero, algo que se puede hacer en cualquier momento. Antes de retirar conviene revisar cuántas semanas te faltan para pensionarte: si estás cerca del requisito, el retiro puede salirte carísimo.',
    },
    {
      q: '¿Puedo retirar mi Afore completa si dejo de trabajar?',
      a: 'Solo al pensionarte, o en la negativa de pensión, es decir cuando llegas a la edad sin cumplir las semanas requeridas y decides retirar el saldo en una sola exhibición. Esa salida implica renunciar a la pensión de por vida y a la atención médica del IMSS como pensionado, así que casi nunca conviene. Fuera de esos casos, lo único disponible es el retiro parcial por desempleo o por matrimonio.',
    },
    {
      q: '¿La subcuenta de vivienda cuenta para mi pensión?',
      a: 'Solo si no usaste tu crédito Infonavit. En ese caso el saldo se suma a tu cuenta al momento de pensionarte, o puedes pedirlo por separado. Si sí tomaste el crédito, esas aportaciones se fueron amortizando la deuda y no engrosan el fondo de retiro. Por eso al proyectar la pensión conviene no contar la subcuenta de vivienda salvo que estés seguro de que sigue intacta.',
    },
    {
      q: '¿Qué me retienen si saco el ahorro voluntario antes de tiempo?',
      a: 'La administradora retiene el 20% del monto retirado como pago provisional de ISR. Ese 20% no es el impuesto definitivo: el retiro se acumula a tus demás ingresos del año y en la declaración anual puede resultar más o menos. Si además dedujiste esas aportaciones en su momento, el retiro revierte el beneficio. Hay una exención por edad de 65 años o invalidez que este cálculo no aplica y que conviene revisar con un contador.',
    },
    {
      q: '¿Cuánto tengo que ahorrar para una pensión decente?',
      a: 'Como referencia, los organismos internacionales consideran adecuada una tasa de reemplazo cercana al 70% del último sueldo. Con las aportaciones obligatorias solas, la mayoría de quienes están en Ley 97 se quedan bastante por debajo, sobre todo quienes tuvieron periodos de informalidad. Cerrar esa brecha exige aportación voluntaria sostenida, y cuanto antes empiece, menos hay que aportar cada mes por el efecto del interés compuesto.',
    },
    {
      q: '¿Cómo sé cuánto tengo en mi Afore?',
      a: 'En el estado de cuenta que tu administradora te envía tres veces al año, en la app AforeMóvil o en el portal e-SAR con tu CURP. Ahí ves las subcuentas por separado: retiro, cesantía y vejez, vivienda, aportaciones voluntarias y cuota social. Vale la pena revisarlo aunque sea una vez al año para confirmar que tu patrón está enterando las aportaciones que descuenta.',
    },
  ],

  sources: [
    {
      name: 'Ley del Seguro Social — retiro por desempleo y cuenta individual (Arts. 168, 191, 198)',
      url: 'https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf',
      publisher: 'IMSS',
    },
    {
      name: 'CONSAR — comisiones autorizadas y rendimiento neto',
      url: 'https://www.gob.mx/consar',
      publisher: 'CONSAR',
    },
    {
      name: 'Ley del ISR — deducción de aportaciones complementarias de retiro (Arts. 145, 151-V, 152)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Anexo 8 de la Resolución Miscelánea Fiscal 2026 — tarifas de ISR (DOF 28-dic-2025)',
      url: 'https://www.sat.gob.mx/normatividad/compilacion/resolucion-miscelanea-fiscal',
      publisher: 'SAT',
      date: '28-12-2025',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'CONASAMI — salarios mínimos 2026 (DOF 09-dic-2025)',
      url: 'https://www.gob.mx/conasami',
      publisher: 'CONASAMI',
      date: '09-12-2025',
    },
  ],

  replaces: [
    '/calculadora-afore-saldo-pension-jubilacion-mexico-2026',
    '/calculadora-ahorro-voluntario-afore-mexico-2026',
    '/calculadora-comisiones-afore-2026-cuanto-te-cobran-mexico',
    '/calculadora-retiro-afore-desempleo-mexico',
    '/calculadora-isr-retiro-ppr-afore-voluntario-anticipado-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
