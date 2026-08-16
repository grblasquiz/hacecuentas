import type { HubData } from '../types';
import { PERU_2026 } from '../../data/peru-2026';

/**
 * Hub de decisión PE — "Me voy o me despiden: ¿cuánto me tienen que pagar?"
 *
 * Absorbe liquidación de beneficios sociales, indemnización por despido arbitrario,
 * CTS semestral, gratificación de julio/diciembre, gratificación trunca y vacaciones truncas.
 * Constantes: src/lib/data/peru-2026.ts. Cálculo espejado de las fórmulas vivas
 * liquidacion-beneficios-sociales-peru.ts, indemnizacion-despido-arbitrario-peru.ts,
 * cts-peru-calculo-deposito.ts, gratificacion-julio-diciembre-peru.ts,
 * gratificacion-trunca-peru.ts y vacaciones-truncas-peru.ts, con dos correcciones
 * documentadas (vacaciones truncas por treintavos y 1/6 de gratificación sobre la
 * remuneración computable, no sobre el sueldo pelado).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABORAL =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const RMV = PERU_2026.rmv;
export const ASIGNACION_FAMILIAR = PERU_2026.asignacionFamiliar;
export const BONIF_GRATI = PERU_2026.gratificacion.bonificacionExtraordinaria;
/** Bonificación extraordinaria reducida cuando el trabajador está afiliado a una EPS (Ley 30334). */
export const BONIF_GRATI_EPS = 0.0675;
/** D.S. 003-97-TR art. 38: 1,5 remuneraciones por año, tope 12 remuneraciones. */
export const INDEM_POR_ANIO = 1.5;
export const INDEM_TOPE_REM = 12;
/** D.S. 003-97-TR art. 10: los primeros 3 meses son período de prueba. */
export const PERIODO_PRUEBA_MESES = 3;

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/trabajo/liquidacion-y-beneficios',
  title: 'Liquidación de beneficios sociales Perú 2026: CTS trunca',
  description:
    'Calculá tu liquidación en el Perú 2026: CTS trunca, gratificación trunca con bonificación de la Ley 30334, vacaciones truncas e indemnización por despido.',
  silo: 'Trabajo',
  siloHref: '/pe/trabajo',
  locale: 'pe',

  eyebrow: 'Perú · régimen laboral privado · D.S. 003-97-TR',
  h1: 'Me voy o me despiden en el Perú: ¿cuánto me tienen que pagar?',
  lede:
    'La liquidación no es un solo número: son cuatro conceptos que se suman y uno que solo aparece si el cese fue arbitrario. La CTS, la gratificación y las vacaciones truncas te corresponden siempre, renuncies o te despidan. La indemnización, en cambio, depende de por qué terminó el vínculo, y ahí es donde la mayoría de la gente cobra de menos.',
  stamps: [
    `RMV ${sol(RMV)} · asignación familiar ${sol(ASIGNACION_FAMILIAR)}`,
    'Indemnización 1,5 remuneraciones por año · tope 12',
    '6 calculadoras adentro',
  ],

  resultLabel: 'Total a cobrar en tu liquidación',

  cases: {
    title: '¿Cómo termina tu vínculo laboral?',
    intro:
      'Los beneficios truncos (CTS, gratificación y vacaciones) se pagan en los cuatro casos. Lo que cambia de un caso a otro es si además te corresponde indemnización y por cuánto. Partimos del caso más frecuente.',
    items: [
      {
        id: 'renuncia',
        label: 'Renuncio',
        hint: 'Beneficios truncos, sin indemnización',
        answer:
          'Al renunciar cobras tus beneficios truncos completos —CTS, gratificación y vacaciones— pero no te corresponde indemnización.',
        yes: [
          'CTS trunca del semestre en curso: un doceavo de la remuneración computable por cada mes completo, más treintavos por los días sueltos',
          'Gratificación trunca del semestre, más la bonificación extraordinaria del 9% de la Ley 30334',
          'Vacaciones truncas: los días de descanso que ganaste y no gozaste, a razón de un treintavo de la remuneración por día',
          'Remuneración de los días efectivamente trabajados del mes del cese',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'La renuncia se presenta por escrito con 30 días de anticipación. Puedes pedir exoneración de ese plazo, pero si el empleador no la acepta y dejas de asistir, se configura abandono de trabajo',
          'Renunciar cierra la puerta a la indemnización por despido arbitrario: si te están forzando a firmar la renuncia, eso es un despido indirecto (hostilidad) y se reclama, no se firma',
        ],
        plazo:
          'la liquidación se paga dentro de las 48 horas de terminado el vínculo; pasado ese plazo corren intereses legales laborales.',
      },
      {
        id: 'arbitrario',
        label: 'Me despiden sin causa justa',
        hint: 'Truncos + 1,5 remuneraciones por año',
        answer:
          'Además de los beneficios truncos te corresponde una indemnización de una remuneración y media por cada año de servicios, con tope de 12 remuneraciones.',
        yes: [
          'Todo lo de la liquidación normal: CTS, gratificación y vacaciones truncas',
          'Indemnización de 1,5 remuneraciones por año completo de servicios (D.S. 003-97-TR, art. 38)',
          'Las fracciones de año se pagan por dozavos y treintavos',
          'El tope es de 12 remuneraciones: llegas a él a los 8 años de servicios',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Cobrar la indemnización cierra el reclamo: si lo que quieres es la reposición en el puesto, no debes cobrarla, porque el pago se entiende como aceptación del cese',
          'El plazo para demandar por despido arbitrario es de 30 días hábiles desde el cese. Vencido ese plazo caduca la acción, aunque el despido haya sido claramente ilegal',
        ],
        plazo:
          'tienes 30 días hábiles desde el despido para accionar judicialmente; los beneficios truncos se pagan igual dentro de las 48 horas.',
      },
      {
        id: 'plazo',
        label: 'Se termina mi contrato a plazo fijo',
        hint: 'Si lo cortan antes: 1,5 por mes que falta',
        answer:
          'Si el contrato llega a su vencimiento no hay indemnización; si te lo cortan antes, cobras 1,5 remuneraciones por cada mes que dejas de laborar, con el mismo tope de 12.',
        yes: [
          'Beneficios truncos completos, igual que en cualquier cese',
          'Si el empleador resuelve el contrato antes del vencimiento: 1,5 remuneraciones por cada mes dejado de laborar hasta la fecha pactada (D.S. 003-97-TR, art. 76)',
          'El tope sigue siendo de 12 remuneraciones',
          'Si el contrato llega a su fecha de vencimiento, no corresponde indemnización alguna',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Un contrato a plazo fijo sin causa objetiva escrita, o renovado más allá de los 5 años, se desnaturaliza y pasa a ser indefinido: en ese caso el cese se trata como despido arbitrario, no como fin de contrato',
          'Que el contrato sea temporal no reduce tus beneficios: CTS, gratificaciones y vacaciones se calculan igual que en un contrato indefinido',
        ],
        plazo:
          'la indemnización del art. 76 se reclama en el mismo plazo de 30 días hábiles que el despido arbitrario.',
      },
      {
        id: 'prueba',
        label: 'Estoy en período de prueba',
        hint: 'Primeros 3 meses · sin indemnización',
        answer:
          'Durante los primeros tres meses no hay protección contra el despido arbitrario: cobras tus beneficios truncos, pero no indemnización.',
        yes: [
          'CTS, gratificación y vacaciones truncas por el tiempo efectivamente trabajado, aunque sea de días',
          'Remuneración de los días trabajados y el descanso semanal proporcional',
          'El período de prueba legal es de 3 meses (D.S. 003-97-TR, art. 10)',
          'Superado ese plazo, recién ahí ganas el derecho a la indemnización por despido arbitrario',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'El período de prueba puede extenderse por escrito hasta 6 meses en puestos de confianza y hasta 12 meses en personal de dirección, pero nunca por acuerdo verbal',
          'Ni siquiera en período de prueba se puede despedir por motivos discriminatorios, por embarazo o por afiliación sindical: eso es despido nulo y da derecho a reposición',
        ],
        plazo:
          'el cese en período de prueba no requiere carta de preaviso ni imputación de falta, pero la liquidación se paga igual dentro de las 48 horas.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Todo en soles. La remuneración computable es tu sueldo mensual más lo que sea permanente (asignación familiar, comisiones fijas). Los meses del semestre son los que llevas desde el 1 de enero o el 1 de julio, según cuándo cesas.',
  fields: [
    {
      id: 'sueldo',
      label: 'Remuneración mensual (S/)',
      prefix: 'S/',
      value: 2500,
      thousands: true,
      help: 'Tu sueldo bruto mensual. Si tienes comisiones o bonificaciones permanentes, súmalas al promedio mensual.',
    },
    {
      id: 'hijos',
      label: '¿Cobras asignación familiar?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí, tengo hijos menores a cargo' },
      ],
      help: `Suma ${sol(ASIGNACION_FAMILIAR)} (10% de la RMV) a la remuneración computable de CTS, gratificación y vacaciones.`,
    },
    {
      id: 'anios',
      label: 'Años completos de servicios',
      type: 'number',
      value: 3,
      min: 0,
      max: 50,
      step: 1,
      help: 'Años enteros desde tu fecha de ingreso. Los meses sueltos van en el campo de al lado.',
    },
    {
      id: 'mesesExtra',
      label: 'Meses sueltos además de esos años',
      type: 'number',
      value: 6,
      min: 0,
      max: 11,
      step: 1,
      help: 'Se pagan por dozavos en la indemnización. Máximo 11: si tienes 12, es un año más.',
    },
    {
      id: 'mesesSemestre',
      label: 'Meses computables del semestre en curso',
      type: 'number',
      value: 4,
      min: 0,
      max: 6,
      step: 1,
      help: 'Meses completos desde el 1 de enero (si cesas en el primer semestre) o desde el 1 de julio (segundo semestre). Es la base de la CTS y la gratificación truncas.',
    },
    {
      id: 'diasSemestre',
      label: 'Días sueltos del semestre',
      type: 'number',
      value: 0,
      min: 0,
      max: 29,
      step: 1,
      help: 'Días que sobran después del último mes completo. Entran a la CTS por treintavos; la gratificación trunca solo computa meses completos.',
    },
    {
      id: 'diasVac',
      label: 'Días de vacaciones ganados y no gozados',
      type: 'number',
      value: 15,
      min: 0,
      max: 90,
      step: 1,
      help: 'Cada año completo de servicios genera 30 días. Si llevas 8 meses del año vacacional, son 20 días (8 × 2,5).',
    },
    {
      id: 'mesesFaltantes',
      label: 'Si es contrato a plazo, meses que faltaban',
      type: 'number',
      value: 6,
      min: 0,
      max: 60,
      step: 1,
      help: 'Solo se usa en la rama de contrato a plazo fijo: meses entre el cese y la fecha de vencimiento pactada. Si el contrato llegó a su fin, deja 0.',
    },
    {
      id: 'eps',
      label: '¿Estás afiliado a una EPS?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, solo EsSalud' },
        { value: 'si', label: 'Sí, tengo EPS' },
      ],
      help: 'La bonificación extraordinaria de la gratificación es 9% con EsSalud y 6,75% si estás afiliado a una EPS (Ley 30334).',
    },
  ],
  fineprint: DISCLAIMER_LABORAL,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu liquidación',
    caption:
      'Cada porción es un concepto distinto con su propia regla de cálculo. En los ceses con indemnización, esa porción suele ser la más grande de todas: por eso conviene saber si te corresponde antes de firmar cualquier papel.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro:
    'El mismo orden de una hoja de liquidación: primero la base de cálculo, después cada beneficio trunco, y al final la indemnización cuando corresponde.',

  faq: [
    {
      q: '¿Qué me tienen que pagar cuando termino de trabajar en el Perú?',
      a: 'Siempre, sin importar el motivo del cese: la CTS trunca del semestre, la gratificación trunca del semestre con su bonificación extraordinaria, las vacaciones truncas por los días de descanso ganados y no gozados, y la remuneración de los días trabajados del último mes. A eso se suma la indemnización solo cuando el cese fue un despido arbitrario o la resolución anticipada de un contrato a plazo fijo.',
    },
    {
      q: '¿Cuánto es la indemnización por despido arbitrario?',
      a: 'Una remuneración y media por cada año completo de servicios, con las fracciones pagadas por dozavos y treintavos, y con un tope de 12 remuneraciones (D.S. 003-97-TR, art. 38). El tope se alcanza a los 8 años de servicios: de ahí en adelante, un trabajador con 10 o con 25 años cobra exactamente lo mismo.',
    },
    {
      q: '¿Cómo se calcula la CTS trunca?',
      a: 'Se toma la remuneración computable —el sueldo más lo permanente, incluida la asignación familiar— y se le suma un sexto de la última gratificación recibida. Sobre esa base se paga un doceavo por cada mes completo del semestre y un treintavo de ese doceavo por cada día suelto. Los semestres son de noviembre a abril y de mayo a octubre, con depósito en mayo y en noviembre.',
    },
    {
      q: '¿La gratificación trunca también lleva el 9%?',
      a: 'Sí. La bonificación extraordinaria de la Ley 30334 se aplica igual sobre la gratificación trunca: es el 9% del monto de la gratificación —lo que habría ido a EsSalud— y va directo al trabajador. Si estás afiliado a una EPS, el porcentaje baja a 6,75%, porque el aporte del empleador a EsSalud en ese caso es menor.',
    },
    {
      q: '¿Cuánto valen mis vacaciones no gozadas?',
      a: 'Cada día de descanso vale un treintavo de tu remuneración computable, porque los 30 días de vacaciones se pagan con una remuneración mensual completa. Con 15 días pendientes cobras medio sueldo. Ojo con las calculadoras que dividen entre 360: eso da doce veces menos de lo que corresponde.',
    },
    {
      q: '¿Me corresponde el pago triple si nunca gocé mis vacaciones?',
      a: 'Si dejaste vencer el año siguiente al que ganaste el descanso y no eres personal de dirección ni gerente que decide su propia oportunidad de descanso, sí: se activa la indemnización vacacional del art. 23 del D. Leg. 713, que equivale a una remuneración adicional. Junto con la remuneración vacacional y el sueldo del mes trabajado, eso es lo que se conoce como "triple".',
    },
    {
      q: '¿Cobro indemnización si renuncio?',
      a: 'No. La indemnización compensa un cese decidido por el empleador sin causa justa: si la decisión es tuya, no hay nada que indemnizar. Sí cobras todos tus beneficios truncos, que son derechos ganados y no dependen del motivo del cese. Distinto es el caso de la renuncia forzada por actos de hostilidad del empleador: ahí puedes demandar el despido indirecto y reclamar la indemnización.',
    },
    {
      q: '¿Qué pasa si me despiden en el período de prueba?',
      a: 'Durante los primeros tres meses el trabajador aún no alcanza protección contra el despido arbitrario, así que el empleador puede cesarlo sin expresar causa y sin indemnización. Lo que sí se paga son los beneficios truncos por el tiempo trabajado, aunque hayan sido pocos días. El período de prueba se puede extender por escrito hasta 6 meses en puestos de confianza y hasta 12 en personal de dirección.',
    },
    {
      q: '¿Y si me cortan un contrato a plazo fijo antes de que venza?',
      a: 'El art. 76 del D.S. 003-97-TR te da una remuneración y media por cada mes que dejas de laborar hasta la fecha de vencimiento pactada, con el mismo tope de 12 remuneraciones. Es una regla distinta a la del despido arbitrario: acá lo que cuenta no es la antigüedad sino el tiempo que faltaba para terminar el contrato.',
    },
    {
      q: '¿En cuánto tiempo me tienen que pagar la liquidación?',
      a: 'Dentro de las 48 horas de terminado el vínculo laboral. Vencido ese plazo la deuda genera intereses legales laborales, y el retraso puede denunciarse ante SUNAFIL. La CTS trunca, si el cese ocurre después del cierre del semestre, se deposita en la cuenta CTS; el resto se paga directamente al trabajador.',
    },
    {
      q: '¿La liquidación paga impuesto a la renta o descuentos de AFP?',
      a: 'La CTS no: está inafecta al impuesto a la renta y no tiene descuentos previsionales. La gratificación trunca tampoco tiene AFP ni ONP —por eso existe la bonificación del 9%— pero sí paga renta de quinta categoría. La indemnización por despido arbitrario está inafecta al impuesto a la renta, porque es una compensación por daño y no una renta de trabajo.',
    },
    {
      q: '¿Cambia el cálculo si trabajo en una micro o pequeña empresa?',
      a: 'Bastante. En la microempresa acreditada en el REMYPE no hay CTS ni gratificaciones y las vacaciones son de 15 días, y la indemnización por despido es de 10 remuneraciones diarias por año con tope de 90. En la pequeña empresa se paga media CTS, medias gratificaciones, 15 días de vacaciones y una indemnización de 20 remuneraciones diarias por año con tope de 120. Este hub calcula el régimen general.',
    },
  ],

  sources: [
    {
      name: 'D.S. 003-97-TR — TUO de la Ley de Productividad y Competitividad Laboral (arts. 10, 38 y 76)',
      url: 'https://www.gob.pe/institucion/mtpe/normas-legales',
      publisher: 'Ministerio de Trabajo y Promoción del Empleo',
    },
    {
      name: 'D.S. 001-97-TR — TUO de la Ley de Compensación por Tiempo de Servicios',
      url: 'https://www.gob.pe/institucion/mtpe/normas-legales',
      publisher: 'Ministerio de Trabajo y Promoción del Empleo',
    },
    {
      name: 'Ley 27735 — Gratificaciones de Fiestas Patrias y Navidad',
      url: 'https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Ley 30334 — Bonificación extraordinaria del 9% sobre las gratificaciones',
      url: 'https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales',
      publisher: 'Congreso de la República',
    },
    {
      name: 'D. Leg. 713 — Descansos remunerados (vacaciones e indemnización vacacional)',
      url: 'https://www.gob.pe/institucion/mtpe/normas-legales',
      publisher: 'Ministerio de Trabajo y Promoción del Empleo',
    },
    {
      name: 'SUNAFIL — Derechos laborales del régimen privado',
      url: 'https://www.gob.pe/sunafil',
      publisher: 'Superintendencia Nacional de Fiscalización Laboral',
    },
  ],

  replaces: [
    '/pe/calculadora-liquidacion-beneficios-sociales-peru',
    '/pe/calculadora-indemnizacion-despido-arbitrario-peru',
    '/pe/calculadora-cts-peru-deposito-semestral',
    '/pe/calculadora-gratificacion-peru-julio-diciembre',
    '/pe/calculadora-gratificacion-trunca-peru',
    '/pe/calculadora-vacaciones-truncas-peru',
  ],

  lastReviewed: '2026-08-16',
};
