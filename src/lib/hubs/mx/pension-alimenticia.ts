import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto de pensión alimenticia me corresponde o me van a descontar?"
 *
 * Absorbe 3 calculadoras que respondían la misma pregunta desde los dos lados del
 * expediente: cuánto fija un juez familiar, cuánto se retiene en nómina y cómo se
 * relaciona la pensión alimenticia con la pensión de viudez de la seguridad social.
 *
 * Constantes económicas: fuente única src/lib/data/mexico-2026.ts (salario mínimo
 * y UMA 2026). Los porcentajes NO son constantes legales fijas: el Código Civil
 * ordena proporcionalidad y el monto lo fija el juez caso por caso.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'legal'). */
const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

/** UMA 2026 (INEGI, DOF 09-ene-2026). */
export const UMA_MX = { diaria: MEXICO_2026.uma.diaria, mensual: MEXICO_2026.uma.mensual };

/** Salario mínimo general 2026 (CONASAMI, DOF 09-dic-2025). */
export const SM_MX = {
  generalDiario: MEXICO_2026.salarioMinimo.generalDiario,
  generalMensual: MEXICO_2026.salarioMinimo.generalMensual,
  factorMensual: MEXICO_2026.salarioMinimo.factorMensual,
};

/**
 * Rangos de referencia de la práctica judicial mexicana. NO son porcentajes de ley:
 * el Código Civil Federal (Arts. 308-311) manda proporcionalidad entre la posibilidad
 * del deudor y la necesidad del acreedor, y el monto lo fija la sentencia.
 */
export const REFERENCIAS_MX = {
  porHijos: { 1: 0.2, 2: 0.3, 3: 0.4, 4: 0.5, 5: 0.5 } as Record<number, number>,
  factorCustodiaCompartida: 0.6,
  factorVisitas: 0.4,
  topePracticaJudicial: 0.5,
  rangoMinPorHijo: 0.1,
  rangoMaxPorHijo: 0.3,
};

/**
 * Pensión de viudez de la seguridad social.
 * IMSS: 90% de la pensión que recibía o le habría correspondido al asegurado (LSS Art. 131).
 * ISSSTE: 100% de la pensión que venía disfrutando el trabajador o pensionado.
 */
export const VIUDEZ_MX = {
  porcentajeImss: 0.9,
  porcentajeIssste: 1.0,
  porcentajeOrfandadImss: 0.2,
  semanasMinimasImss: 150,
};

export const hub: HubData = {
  slug: 'mx/familia/pension-alimenticia',
  title: 'Pensión alimenticia en México 2026: cuánto corresponde y cuánto se descuenta en nómina',
  description:
    'Calcula el rango de pensión alimenticia por número de hijos y tipo de custodia, cuánto queda de tu sueldo tras el descuento en nómina, y cómo se relaciona con la pensión de viudez del IMSS o del ISSSTE.',
  silo: 'Familia',
  siloHref: '/mx/familia',

  eyebrow: 'México · derecho familiar',
  h1: '¿Cuánto de pensión alimenticia me corresponde o me van a descontar?',
  lede:
    'No hay una tabla legal que fije la pensión alimenticia en México: el Código Civil manda que sea proporcional a lo que el deudor puede y a lo que el acreedor necesita, y el monto lo pone el juez. Lo que sí existen son rangos que la práctica judicial repite. Aquí los ves aplicados a tu caso, del lado de quien pide y del lado de quien paga.',
  stamps: [
    'Código Civil Federal · Arts. 308 a 323',
    'Protección del salario mínimo · LFT Art. 110-V',
    'Viudez IMSS · LSS Art. 131',
    '3 calculadoras fusionadas',
  ],

  resultLabel: 'Pensión mensual estimada',

  cases: {
    title: '¿Desde qué lado estás mirando?',
    intro: 'Empezamos por la estimación del monto que un juez familiar podría fijar.',
    items: [
      {
        id: 'cuanto',
        label: 'Cuánto podría fijar el juez',
        hint: 'Rango de referencia según ingresos, número de hijos y tipo de custodia.',
        yes: [
          'Rango de referencia de la práctica judicial: entre el 10% y el 30% del ingreso por cada hijo',
          'Porcentaje habitual acumulado según el número de hijos, ajustado por el tipo de custodia',
          'Aportaciones separadas de educación y salud, prorrateadas a mes',
          'Verificación de que al deudor le quede un margen de subsistencia',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Los porcentajes son referencias de la práctica judicial, no reglas de ley: el Código Civil solo ordena proporcionalidad y el monto lo fija la sentencia',
          'Cada entidad tiene su propio código civil o familiar: los criterios locales varían y algunos fijan la pensión en veces la UMA en vez de en porcentaje',
          'La pensión se calcula sobre el ingreso total del deudor, incluidos aguinaldo, prima vacacional, comisiones y bonos, no solo sobre el sueldo base',
          'La obligación alimentaria incluye alimentación, vestido, habitación, atención médica y educación hasta terminar una carrera u oficio',
        ],
        plazo:
          'la pensión provisional se puede pedir desde el primer escrito y suele fijarse en la primera audiencia; la definitiva llega con la sentencia.',
        answer:
          'La práctica judicial suele moverse entre el 10% y el 30% del ingreso por hijo, ajustado por la custodia y los gastos que ya cubre cada progenitor.',
      },
      {
        id: 'descuento',
        label: 'Cuánto me van a descontar de la nómina',
        hint: 'Retención por orden judicial sobre tu sueldo, con el salario mínimo protegido.',
        yes: [
          'Monto que se retiene, ya sea por porcentaje o por cantidad fija de la sentencia',
          'Sueldo que te queda libre después del descuento',
          'Protección del salario mínimo: el descuento no puede dejarte por debajo',
          'Alerta cuando el descuento supera la referencia del 50% que suelen usar los juzgados',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El 50% es una referencia frecuente de la práctica judicial, no un límite de ley: el juez puede fijar más o menos según tu situación',
          'La Ley Federal del Trabajo protege el salario mínimo frente a descuentos, salvo orden judicial expresa en contrario para pensión alimenticia',
          'La retención la ejecuta el patrón cuando recibe el oficio del juzgado: si no lo cumple, responde solidariamente',
          'Si tus ingresos bajan de forma permanente puedes pedir la reducción, pero hasta que el juez la resuelva sigue vigente el monto anterior',
        ],
        plazo:
          'el descuento arranca en la nómina siguiente a la recepción del oficio y sigue hasta que el juzgado ordene lo contrario.',
        answer:
          'Te retienen lo que diga la sentencia, con el límite práctico de que el salario mínimo queda protegido.',
      },
      {
        id: 'viudez',
        label: 'Viudez frente a pensión alimenticia',
        hint: 'Qué corresponde cuando fallece el obligado o cuando hay pensión de la seguridad social de por medio.',
        yes: [
          'Pensión de viudez del IMSS: 90% de la pensión que recibía o le habría correspondido al asegurado',
          'Pensión de viudez del ISSSTE: 100% de la pensión que venía disfrutando el trabajador',
          'Pensión de orfandad del 20% por cada hijo con derecho en el IMSS',
          'Comparación contra el rango de referencia de una pensión alimenticia civil',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'La pensión de viudez del IMSS es el 90% de la PENSIÓN del asegurado, no de su salario: tomar el 90% del sueldo infla el resultado',
          'La pensión de viudez y la alimenticia no son excluyentes en abstracto: son prestaciones de naturaleza distinta y con obligados distintos, y la procedencia de cada una depende del caso concreto',
          'Una cónyuge divorciada con pensión alimenticia vigente puede tener derecho a la de viudez cuando el asegurado fallece sin cónyuge ni concubina con mejor derecho',
          'La pensión de viudez se pierde al contraer nuevo matrimonio, aunque se entrega una suma equivalente a tres anualidades',
        ],
        plazo:
          'la pensión de viudez corre desde el fallecimiento y se tramita en la subdelegación del IMSS o en la delegación del ISSSTE.',
        answer:
          'La viudez del IMSS es el 90% de la pensión del asegurado; la alimenticia es una obligación civil distinta que fija un juez familiar.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. Cada caso usa solo los campos que le tocan: los demás quedan sin efecto en ese cálculo.',
  fields: [
    {
      id: 'ingresos',
      label: 'Ingreso mensual bruto del obligado (MXN)',
      prefix: '$',
      value: 30000,
      thousands: true,
      help: 'Todo lo que percibe: sueldo, comisiones, bonos y la parte proporcional de aguinaldo y prima.',
    },
    {
      id: 'sueldoNeto',
      label: 'Sueldo neto mensual (MXN)',
      prefix: '$',
      value: 24000,
      thousands: true,
      help: 'Solo para el descuento en nómina: lo que recibes después de ISR y cuota obrera del IMSS.',
    },
    {
      id: 'hijos',
      label: 'Hijos con derecho a alimentos',
      type: 'number',
      value: 1,
      min: 0,
      max: 8,
      step: 1,
      help: 'Menores de edad, o mayores que estudian y no se pueden sostener por sí mismos.',
    },
    {
      id: 'custodia',
      label: 'Tipo de custodia',
      type: 'select',
      value: 'exclusiva',
      options: [
        { value: 'exclusiva', label: 'Custodia exclusiva del otro progenitor' },
        { value: 'compartida', label: 'Custodia compartida' },
        { value: 'visitas', label: 'Convivencia por visitas' },
      ],
      help: 'A mayor tiempo de convivencia y gasto directo, menor suele ser la pensión en dinero.',
    },
    {
      id: 'gastosEducacion',
      label: 'Gastos de educación al año (MXN)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Colegiaturas, inscripción y materiales que se van a repartir aparte de la manutención.',
    },
    {
      id: 'gastosSalud',
      label: 'Gastos de salud al año (MXN)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Seguro de gastos médicos, tratamientos y consultas recurrentes.',
    },
    {
      id: 'tipoDescuento',
      label: 'La sentencia fija la pensión como...',
      type: 'select',
      value: 'porcentaje',
      options: [
        { value: 'porcentaje', label: 'Porcentaje del sueldo' },
        { value: 'monto', label: 'Cantidad fija mensual' },
      ],
      help: 'Solo para el caso del descuento en nómina.',
    },
    {
      id: 'valorDescuento',
      label: 'Porcentaje o cantidad de la sentencia',
      type: 'number',
      value: 25,
      min: 0,
      step: 1,
      help: 'Si elegiste porcentaje, pon 25 para 25%. Si elegiste cantidad fija, pon el monto en pesos.',
    },
    {
      id: 'institucion',
      label: 'Institución de seguridad social',
      type: 'select',
      value: 'imss',
      options: [
        { value: 'imss', label: 'IMSS' },
        { value: 'issste', label: 'ISSSTE' },
        { value: 'ninguna', label: 'Ninguna' },
      ],
      help: 'Solo para el caso de viudez: cambia el porcentaje aplicable.',
    },
    {
      id: 'pensionAsegurado',
      label: 'Pensión mensual del asegurado fallecido (MXN)',
      prefix: '$',
      value: 12000,
      thousands: true,
      help: 'La pensión que recibía o que le habría correspondido. No es su sueldo.',
    },
    {
      id: 'semanas',
      label: 'Semanas cotizadas del asegurado',
      type: 'number',
      value: 500,
      min: 0,
      max: 3000,
      step: 1,
      help: 'El IMSS exige 150 semanas cotizadas para la pensión de viudez.',
    },
  ],
  fineprint: DISCLAIMER_LEGAL,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte el ingreso',
    caption:
      'Compara la parte del ingreso que se va en pensión contra la que le queda al obligado, y en qué se descompone la pensión.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Existe un porcentaje legal de pensión alimenticia en México?',
      a: 'No. Ningún código civil del país fija un porcentaje obligatorio. Lo que establecen los artículos 308 a 311 del Código Civil Federal y sus equivalentes estatales es un principio de proporcionalidad: la pensión debe ajustarse a la posibilidad de quien la da y a la necesidad de quien la recibe. Los porcentajes que circulan son referencias de la práctica judicial, útiles para anticipar el orden de magnitud, pero no vinculantes.',
    },
    {
      q: '¿Cuánto suelen fijar los jueces por un hijo?',
      a: 'La referencia más repetida ronda entre el 15% y el 25% del ingreso del obligado por un hijo, y va subiendo con el número de hijos hasta un tope práctico cercano al 50%. Pero el resultado real depende de la prueba: si el acreedor demuestra gastos altos de educación o salud, o si el deudor tiene ingresos que no aparecen en su recibo de nómina, el porcentaje se mueve en cualquier dirección.',
    },
    {
      q: '¿Sobre qué ingreso se calcula la pensión?',
      a: 'Sobre el ingreso total del obligado, no solo sobre el sueldo base. Eso incluye comisiones, bonos, aguinaldo, prima vacacional, reparto de utilidades y cualquier percepción ordinaria. Por eso las sentencias suelen redactarse como un porcentaje de todas las percepciones ordinarias y extraordinarias, para que el descuento alcance también el aguinaldo y el reparto de utilidades.',
    },
    {
      q: '¿Pueden descontarme más del 50% del sueldo?',
      a: 'En principio sí, porque el 50% no es un límite legal sino una referencia frecuente de los juzgados. Lo que sí es regla es la protección del salario mínimo del artículo 110 de la Ley Federal del Trabajo: el descuento no puede dejarte por debajo de ese piso, salvo que la orden judicial disponga expresamente lo contrario en materia de alimentos. Si el descuento te deja sin capacidad de subsistir, la vía es pedir la reducción al juez.',
    },
    {
      q: '¿Cómo se ejecuta el descuento en nómina?',
      a: 'El juzgado gira un oficio al patrón ordenando la retención y el depósito. Desde que el patrón lo recibe, el descuento arranca en la nómina siguiente y el patrón responde solidariamente si no lo cumple. El pago se deposita en la cuenta que indique el juzgado o directamente en la del acreedor, según lo que ordene la sentencia.',
    },
    {
      q: '¿Hasta cuándo se paga la pensión a un hijo?',
      a: 'Hasta la mayoría de edad como regla general, pero se extiende mientras el hijo estudie una carrera u oficio con aprovechamiento y no pueda sostenerse por sí mismo. Muchos criterios locales la sostienen hasta los 25 años cuando hay constancia de estudios. Si el hijo tiene una discapacidad que le impide trabajar, la obligación no tiene límite de edad.',
    },
    {
      q: '¿La custodia compartida elimina la pensión?',
      a: 'No automáticamente. La custodia compartida reparte el tiempo de convivencia y con él parte del gasto directo, así que la pensión en dinero suele reducirse. Pero si hay una diferencia grande de ingresos entre los progenitores, el juez puede mantener una pensión compensatoria para que el nivel de vida del menor sea similar en ambos hogares.',
    },
    {
      q: '¿Puedo pedir que bajen la pensión si perdí el trabajo?',
      a: 'Sí, mediante un incidente de reducción de pensión alimenticia. Tienes que acreditar el cambio de circunstancias con documentos, no solo declararlo. Mientras el juez no resuelva, el monto anterior sigue vigente y los meses no pagados se acumulan como adeudo, así que conviene promover el incidente de inmediato y no esperar a acumular deuda.',
    },
    {
      q: '¿Qué pasa si el obligado no paga?',
      a: 'Se puede ejecutar el adeudo con embargo de bienes y de cuentas, retención directa sobre el salario y anotación en el registro de deudores alimentarios morosos, que en varias entidades impide obtener licencia de conducir, pasaporte o crédito. El incumplimiento reiterado además puede constituir el delito de incumplimiento de obligaciones de asistencia familiar.',
    },
    {
      q: '¿La pensión de viudez del IMSS es el 90% del sueldo del fallecido?',
      a: 'No. Es el 90% de la pensión que el asegurado recibía o que le habría correspondido, y esa pensión ya es bastante menor que su sueldo. Tomar el 90% del sueldo es el error más frecuente al estimarla y produce cifras irreales. A la viudez se suma un 20% de orfandad por cada hijo con derecho, sin que la suma pueda exceder el 100% de la pensión base.',
    },
    {
      q: '¿La pensión de viudez cancela la pensión alimenticia?',
      a: 'No de manera automática. Son prestaciones de naturaleza distinta: la de viudez es de seguridad social y la paga el instituto, mientras que la alimenticia es una obligación civil a cargo de una persona. Puede haber casos en que el fallecimiento del obligado extinga la deuda alimentaria hacia adelante y otros en que una cónyuge divorciada con pensión alimenticia vigente tenga derecho a la de viudez. La procedencia depende del caso concreto y conviene revisarla con un abogado.',
    },
    {
      q: '¿Se puede pactar la pensión sin ir a juicio?',
      a: 'Sí, mediante convenio ante el juez de lo familiar o por mediación en los centros de justicia alternativa. El convenio ratificado y aprobado tiene la misma fuerza que una sentencia y se puede ejecutar igual si se incumple. Es una vía más rápida y barata que el litigio, y suele ser la mejor opción cuando ambas partes coinciden en el monto.',
    },
  ],

  sources: [
    {
      name: 'Código Civil Federal — obligación alimentaria (Arts. 301 a 323)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/ccf.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley Federal del Trabajo — descuentos al salario (Art. 110)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lft.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley del Seguro Social — pensión de viudez y orfandad (Arts. 130, 131, 137)',
      url: 'https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf',
      publisher: 'IMSS',
    },
    {
      name: 'Suprema Corte de Justicia de la Nación — criterios sobre proporcionalidad alimentaria',
      url: 'https://sjf2.scjn.gob.mx/',
      publisher: 'SCJN',
    },
    {
      name: 'CONASAMI — salarios mínimos 2026 (DOF 09-dic-2025)',
      url: 'https://www.gob.mx/conasami',
      publisher: 'CONASAMI',
      date: '09-12-2025',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
  ],

  replaces: [
    '/calculadora-pension-alimenticia-mexico-padre-divorcio',
    '/calculadora-descuento-pension-alimenticia-nomina-mexico',
    '/calculadora-pension-viudez-vs-pension-alimenticia-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
