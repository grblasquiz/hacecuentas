import type { HubData } from '../types';
import { VENEZUELA_2026 } from '../../data/venezuela-2026';

/**
 * Hub de decisión VE — "¿Cuánto me tienen que pagar este mes?"
 *
 * Reúne el ingreso mensual completo del trabajador venezolano: el salario en Bs.,
 * los recargos de jornada (extras, nocturno, feriados) y las piezas indexadas al
 * dólar que en la práctica son el grueso del ingreso (cestaticket y bono de guerra),
 * más la comparación contra la canasta básica.
 *
 * ⚠️ Ninguna cifra en bolívares viaja como constante: salario, tasa BCV, bono de
 * guerra y canasta son campos editables. El salario mínimo legal del módulo está
 * marcado "⚠️ ACTUALIZAR" en la tabla maestra y sólo se muestra como referencia
 * histórica, nunca como default de cálculo.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Recargos fijados por la LOTTT (porcentajes, no montos: no caducan). */
export const RECARGOS = {
  /** Art. 118 — hora extra: +50% sobre la hora normal. */
  extra: 0.5,
  /** Art. 117 — jornada nocturna (7 p.m. a 5 a.m.): +30%. */
  nocturno: 0.3,
  /** Art. 120 — feriado o descanso trabajado: +50%. */
  feriado: 0.5,
  /** Jornada diurna semanal de la LOTTT. */
  jornadaSemanal: 40,
  /** Horas/mes de la jornada diurna: 40 × 52 ÷ 12. */
  horasMes: (40 * 52) / 12,
  /** Tope legal de horas extra por año (LOTTT Art. 178). */
  extrasMaxAnio: 100,
};

/** Referencias legales del ingreso mínimo. NO son montos de cálculo. */
export const REFERENCIA_INGRESO = {
  salarioMinimoVes: VENEZUELA_2026.salarioMinimoVes,
  cestaticketUsd: VENEZUELA_2026.cestaticketUsd,
};

export const hub: HubData = {
  slug: 've/trabajo/sueldo-y-recargos',
  title: 'Cuánto me tienen que pagar este mes en Venezuela: sueldo, recargos y bonos',
  description:
    'Armá tu pago mensual completo: valor de la hora, horas extras (+50%), bono nocturno (+30%), feriados y domingos trabajados (+50%), cestaticket y bono de guerra, y cuánto de la canasta básica te cubre.',
  silo: 'Trabajo',
  siloHref: '/ve/trabajo',
  locale: 've',

  eyebrow: 'Venezuela · LOTTT · recibo del mes',
  h1: 'Cuánto me tienen que pagar este mes.',
  lede:
    'El recibo venezolano tiene dos mitades que casi no se hablan: el salario en bolívares, que manda la LOTTT y genera todos los pasivos, y los bonos indexados al dólar, que son la mayor parte del ingreso y no generan ninguno. Acá se suman las dos, con los recargos de jornada incluidos.',
  stamps: [
    'LOTTT Arts. 117, 118, 119, 120 y 178',
    'Recargos en porcentaje: no caducan con la inflación',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Tu ingreso del mes',

  cases: {
    title: '¿Qué mes estás liquidando?',
    intro:
      'La base es siempre la misma —el valor de tu hora— pero lo que se le suma cambia bastante según cómo te haya tocado trabajar. Partimos del mes normal.',
    items: [
      {
        id: 'normal',
        label: 'Un mes común, sin recargos',
        hint: 'Salario + cestaticket + bono',
        answer: 'En un mes normal tu ingreso son tres piezas: salario en Bs., cestaticket y bono de guerra.',
        yes: [
          'Salario normal del mes, que es lo único que genera prestaciones, vacaciones y utilidades',
          'Cestaticket socialista, indexado al dólar y pagado en bolívares a la tasa BCV del día',
          'Bono de Guerra Económica del Sistema Patria, que cambia mes a mes',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Ni el cestaticket ni el bono de guerra son salario: no aparecen en la base de tu liquidación',
          'Los tres montos hay que cargarlos frescos: en bolívares nada se sostiene más de unas semanas',
        ],
        plazo: 'el cestaticket se paga en bolívares al equivalente en dólares de la tasa BCV del día de pago, así que el mismo beneficio da distinto según cuándo te lo depositen.',
      },
      {
        id: 'extras',
        label: 'Hice horas extras',
        hint: 'Art. 118 · +50% sobre la hora normal',
        answer: 'Cada hora extra diurna vale una vez y media tu hora normal; la nocturna, casi el doble.',
        yes: [
          'Recargo del 50% sobre la hora normal en cada hora extra diurna (Art. 118)',
          'En la hora extra nocturna los recargos se encadenan: primero el 30% nocturno, y el 50% de extra se aplica sobre esa hora ya recargada',
          `Tope legal de ${RECARGOS.extrasMaxAnio} horas extra por año y de 10 por semana`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Las horas extras necesitan autorización de la Inspectoría del Trabajo: superar el tope no las hace impagas, pero sí sancionables para el patrono',
          'Las extras habituales integran el salario normal a efectos de prestaciones; las esporádicas, no',
        ],
        plazo: 'reclamá las extras en el mismo mes: sin registro de jornada, probarlas después es la parte difícil.',
      },
      {
        id: 'nocturno',
        label: 'Trabajo de noche',
        hint: 'Art. 117 · +30% sobre la hora normal',
        answer: 'Toda hora entre las 7 de la noche y las 5 de la mañana lleva un 30% adicional.',
        yes: [
          'Recargo del 30% por cada hora efectivamente trabajada en horario nocturno',
          'La jornada nocturna tiene además un tope diario y semanal menor que la diurna',
          'Si la jornada es mixta, el recargo corre sólo sobre las horas nocturnas',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El bono nocturno es un recargo sobre la hora, no un monto fijo: si tu salario sube, sube con él',
          'Una jornada mixta con más de 4 horas nocturnas se considera nocturna completa',
        ],
        plazo: 'el bono nocturno es de pago mensual junto con el salario, no un acumulado de fin de año.',
      },
      {
        id: 'feriado',
        label: 'Trabajé feriados o domingos',
        hint: 'Art. 120 · +50% y día compensatorio',
        answer: 'El feriado trabajado se paga a razón de una vez y media, y si era tu descanso además ganás el compensatorio.',
        yes: [
          'El salario del día más un recargo del 50% sobre el salario normal (Art. 120)',
          'Un día de descanso compensatorio remunerado si el día trabajado era tu descanso semanal',
          'El compensatorio no se puede canjear por dinero: es tiempo',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Los feriados del Art. 184 son los nacionales; las convenciones y los decretos regionales pueden agregar otros',
          'Si trabajaste menos de 4 horas, el derecho al compensatorio completo puede discutirse',
        ],
        plazo: 'el descanso compensatorio se disfruta en la semana siguiente; si el patrono no lo otorga, queda como deuda de tiempo, no de dinero.',
      },
    ],
  },

  inputsTitle: 'Tu mes, con números frescos',
  inputsIntro:
    'Todo editable: en Venezuela el dato de hace un mes ya es un dato viejo. Si no sabés la tasa BCV del día, buscala antes de cargar el cestaticket.',
  fields: [
    {
      id: 'salarioMensual',
      label: 'Salario normal mensual (Bs.)',
      prefix: 'Bs.',
      value: '3.000',
      thousands: true,
      help: 'Solo el salario, sin cestaticket ni bonos. Es la base de todos los recargos.',
    },
    {
      id: 'horasJornada',
      label: 'Horas de tu jornada diaria',
      type: 'number',
      value: 8,
      min: 1,
      max: 12,
      step: 1,
      help: 'La jornada diurna de la LOTTT es de 8 horas diarias y 40 semanales.',
    },
    {
      id: 'horasExtras',
      label: 'Horas extras diurnas del mes',
      type: 'number',
      value: 6,
      min: 0,
      max: 100,
      step: 1,
      help: 'Recargo del 50% sobre la hora normal (Art. 118).',
    },
    {
      id: 'horasNocturnas',
      label: 'Horas nocturnas trabajadas',
      type: 'number',
      value: 20,
      min: 0,
      max: 300,
      step: 1,
      help: 'Horas entre las 7 p.m. y las 5 a.m. Recargo del 30% (Art. 117).',
    },
    {
      id: 'diasFeriados',
      label: 'Feriados o domingos trabajados',
      type: 'number',
      value: 2,
      min: 0,
      max: 12,
      step: 1,
      help: 'Cada uno se paga el día más un 50% de recargo (Art. 120).',
    },
    {
      id: 'tasaBcv',
      label: 'Tasa BCV del día (Bs. por dólar)',
      type: 'number',
      value: 600,
      min: 0,
      step: 0.01,
      help: 'Se usa para pasar el cestaticket y el bono a bolívares. Cambia todos los días: cargá la del día de pago.',
    },
    {
      id: 'cestaticketUsd',
      label: 'Cestaticket del mes (USD)',
      type: 'number',
      value: 40,
      min: 0,
      step: 1,
      help: 'Monto vigente del cestaticket socialista, en dólares. Se paga en bolívares a la tasa BCV.',
    },
    {
      id: 'bonoGuerraUsd',
      label: 'Bono de Guerra Económica del mes (USD)',
      type: 'number',
      value: 120,
      min: 0,
      step: 1,
      help: 'Lo asigna el Sistema Patria y cambia mes a mes. Poné el que te depositaron.',
    },
    {
      id: 'canastaUsd',
      label: 'Canasta básica familiar (USD)',
      type: 'number',
      value: 500,
      min: 0,
      step: 1,
      help: 'La publica el CENDAS-FVM cada mes. Sirve para ver qué porcentaje te cubre tu ingreso.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'De dónde sale tu ingreso del mes',
    caption:
      'Muestra el peso real de cada pieza: el salario en bolívares que genera prestaciones, los recargos de jornada, y los bonos indexados al dólar que suelen ser la mayor tajada y no generan ningún pasivo laboral.',
  },
  breakdownTitle: 'Tu recibo, línea por línea',
  breakdownIntro:
    'Primero el valor de la hora, que es de donde salen todos los recargos. Después cada concepto por separado, el total del mes y qué parte de la canasta te cubre.',

  faq: [
    {
      q: '¿Cómo se calcula el valor de mi hora?',
      a: `Hay dos criterios en uso y conviene saber cuál te están aplicando. El de la jornada legal divide el salario mensual entre ${RECARGOS.horasMes.toFixed(2).replace('.', ',')} horas, que es el resultado de 40 horas semanales por 52 semanas dividido 12 meses. El otro, más habitual en las nóminas venezolanas, divide el salario mensual entre 30 días y ese salario diario entre las horas de la jornada. Con jornada de 8 horas el segundo criterio da un valor de hora bastante más bajo. Esta calculadora usa el segundo, que es el que aplican los recibos, y te muestra también el primero para que puedas comparar.`,
    },
    {
      q: '¿Cuánto vale una hora extra?',
      a: 'La hora extra diurna se paga con un recargo del 50% sobre la hora normal (Art. 118): una vez y media. La nocturna encadena los dos recargos, y ahí está la trampa: primero se aplica el 30% del bono nocturno sobre la hora normal, y el 50% de extra se calcula sobre esa hora ya recargada. El resultado no es un 80% sino un 95% adicional, porque los recargos se multiplican, no se suman.',
    },
    {
      q: '¿Hay un límite de horas extras?',
      a: `Sí, y es doble: hasta 10 horas extra por semana y ${RECARGOS.extrasMaxAnio} por año (Art. 178), y además requieren autorización de la Inspectoría del Trabajo. Superar el tope no vuelve impagas las horas —siempre se pagan con su recargo— pero sí expone al patrono a sanciones. Si trabajás extras todos los meses, hay otro efecto importante: las horas extras habituales integran el salario normal a efectos de prestaciones, mientras que las esporádicas no.`,
    },
    {
      q: '¿Qué es el bono nocturno y desde qué hora corre?',
      a: 'Es un recargo del 30% sobre la hora normal por cada hora trabajada entre las 7 de la noche y las 5 de la mañana (Art. 117). No es un monto fijo ni un adicional mensual: se calcula hora por hora, así que sube automáticamente cuando sube tu salario. Si tu jornada es mixta y tiene más de cuatro horas en horario nocturno, la ley la considera nocturna completa, con su jornada máxima reducida.',
    },
    {
      q: 'Trabajé un domingo: ¿me pagan doble?',
      a: 'No exactamente. El Art. 120 manda pagar el día trabajado más un recargo del 50% sobre el salario normal, es decir una vez y media, no el doble. Además, si ese domingo era tu día de descanso semanal, nace el derecho a un día de descanso compensatorio remunerado, que la ley expresamente no permite canjear por dinero. Muchos recibos pagan el recargo y "olvidan" el compensatorio: es tiempo que te siguen debiendo.',
    },
    {
      q: '¿El cestaticket cuenta para mis prestaciones?',
      a: `No, y es la pregunta que más plata mueve en Venezuela. El cestaticket socialista es un beneficio de alimentación, no salario: no incide en prestaciones, ni en utilidades, ni en vacaciones, ni en bono vacacional. Lo mismo vale para el Bono de Guerra Económica del Sistema Patria. Como el salario mínimo legal quedó congelado en bolívares y el ingreso real se armó a base de bonos indexados al dólar, el efecto práctico es que la mayor parte de lo que cobra un trabajador venezolano no produce ningún pasivo laboral.`,
    },
    {
      q: '¿Por qué el cestaticket me llega distinto cada mes si es el mismo monto?',
      a: 'Porque está fijado en dólares y se paga en bolívares al equivalente de la tasa BCV del día de pago. El monto en divisas no se mueve, pero la tasa sí, todos los días. Dos meses con el mismo cestaticket nominal pueden llegar con diferencias grandes en bolívares según cuándo cayó el depósito. Por eso en esta calculadora la tasa es un campo editable y no un valor guardado: cualquier tasa fija que dejáramos escrita estaría vencida en días.',
    },
    {
      q: '¿Cuál es hoy el salario mínimo legal?',
      a: `El salario mínimo legal de la LOTTT es el único monto que genera pasivos laborales, y lleva años sin ajustarse en términos reales: la referencia que tenemos cargada es de Bs. ${REFERENCIA_INGRESO.salarioMinimoVes} mensuales, un valor que la propia tabla de datos marca como pendiente de actualización. No lo usamos como base de ningún cálculo por esa razón. Verificá el monto vigente en Gaceta Oficial antes de usarlo para nada que importe: es exactamente el tipo de cifra que en Venezuela envejece mal.`,
    },
    {
      q: '¿Qué parte de la canasta básica cubre mi ingreso?',
      a: 'La cuenta que publica la prensa cada mes divide el costo de la Canasta Básica Familiar del CENDAS-FVM entre el ingreso mensual del hogar, y el resultado se expresa en "cuántos ingresos hacen falta". Acá la hacemos al revés y también te mostramos el porcentaje cubierto y el déficit, que es más accionable. Los dos montos entran editables porque los dos cambian todos los meses: la canasta la publica el CENDAS y tu ingreso depende de bonos que se reasignan.',
    },
    {
      q: '¿Conviene comparar el sueldo en bolívares o en dólares?',
      a: 'En dólares, para saber si tu poder de compra mejoró o empeoró, porque el bolívar pierde valor demasiado rápido como para comparar dos meses distintos en la misma unidad. Pero en bolívares para todo lo legal: prestaciones, utilidades, vacaciones y retenciones se calculan sobre el salario nominal en bolívares que figura en el recibo, sin importar a qué equivalía en divisas el día que te lo pagaron.',
    },
  ],

  sources: [
    {
      name: 'Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT)',
      url: 'https://www.inces.gob.ve/wp-content/uploads/2020/03/LOTTT.pdf',
      publisher: 'INCES / Gaceta Oficial 6.076 Extraordinario',
    },
    {
      name: 'LOTTT Art. 117 — jornada nocturna y su recargo',
      url: 'https://www.ley.com.ve/leyes/federales/ley-organica-del-trabajo-los-trabajadores-y-las-trabajadoras/117',
      publisher: 'ley.com.ve',
    },
    {
      name: 'LOTTT Arts. 118 y 178 — horas extraordinarias y sus límites',
      url: 'https://www.ley.com.ve/leyes/federales/ley-organica-del-trabajo-los-trabajadores-y-las-trabajadoras/118',
      publisher: 'ley.com.ve',
    },
    {
      name: 'LOTTT Arts. 119 y 120 — día de descanso y feriado trabajado',
      url: 'https://www.ley.com.ve/leyes/federales/ley-organica-del-trabajo-los-trabajadores-y-las-trabajadoras/120',
      publisher: 'ley.com.ve',
    },
    {
      name: 'Banco Central de Venezuela — tipo de cambio oficial',
      url: 'https://www.bcv.org.ve/',
      publisher: 'BCV',
    },
    {
      name: 'CENDAS-FVM — Canasta Básica Familiar',
      url: 'https://cendas-fvm.org/',
      publisher: 'CENDAS-FVM',
    },
  ],

  replaces: [
    '/ve/calculadora-salario-por-hora-venezuela',
    '/ve/calculadora-horas-extras-venezuela',
    '/ve/calculadora-bono-nocturno-venezuela',
    '/ve/calculadora-dias-feriados-domingos-trabajados-venezuela',
    '/ve/calculadora-cestaticket-bono-alimentacion-venezuela',
    '/ve/calculadora-bono-guerra-economica-ingreso-integral-venezuela',
    '/ve/cuanto-es-salario-minimo-venezuela-2026',
    '/ve/calculadora-canasta-basica-salarios-minimos-venezuela',
  ],

  lastReviewed: '2026-07-28',
};
