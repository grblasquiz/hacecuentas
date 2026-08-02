import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto me toca de aguinaldo, prima vacacional y PTU?"
 *
 * Absorbe siete calculadoras de prestaciones anuales y su retención de ISR.
 * Todas las exenciones se miden en UMA diarias (LISR Art. 93) y salen de
 * src/lib/data/mexico-2026.ts; el ISR del ingreso extraordinario usa el método
 * de tasa efectiva del Art. 142 del RLISR, no la tarifa aplicada en seco.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/** Tarifa ISR mensual (Art. 96 LISR, Anexo 8 RMF 2026). `hasta: null` = sin techo. */
export const ISR_MENSUAL: Array<{ desde: number; hasta: number | null; cuota: number; tasa: number }> =
  MEXICO_2026.isrTarifaMensual.map(([limInf, limSup, cuota, tasa]) => ({
    desde: limInf,
    hasta: Number.isFinite(limSup) ? limSup : null,
    cuota,
    tasa,
  }));

/** Mínimos de la LFT que rigen estas prestaciones. */
export const LFT = {
  aguinaldoDias: MEXICO_2026.lft.aguinaldoDiasMinimo,          // 15 días · Art. 87
  primaVacacionalPct: MEXICO_2026.lft.primaVacacional * 100,   // 25% · Art. 80
  primaDominicalPct: MEXICO_2026.lft.primaDominical * 100,     // 25% · Art. 71
  festivoExtra: MEXICO_2026.lft.festivoLaboradoExtra,          // +200% · Art. 75
  descansoExtra: MEXICO_2026.lft.descansoLaboradoExtra,        // +200% · Art. 73
  vacacionesPorAnio: MEXICO_2026.lft.vacacionesPorAnio as unknown as number[], // Art. 76
  incrementoQuinquenal: MEXICO_2026.lft.vacacionesIncrementoQuinquenal,
  ptuPorcentaje: 0.1,                                          // 10% de la renta gravable · Art. 117
  ptuTopeDias: 90,                                             // tope de 3 meses de salario · Art. 127-VIII
};

/** Exenciones de ISR en UMA diarias (LISR Art. 93). */
export const EXENCIONES = {
  aguinaldoUmas: MEXICO_2026.exencionesIsrUmas.aguinaldo,           // 30 UMA
  primaVacacionalUmas: MEXICO_2026.exencionesIsrUmas.primaVacacional, // 15 UMA
  ptuUmas: MEXICO_2026.exencionesIsrUmas.ptu,                       // 15 UMA
  primaDominicalUmasPorDomingo: 1,                                  // 1 UMA por domingo · Art. 93-XIV
};

/**
 * Topes de exención de las prestaciones en especie:
 *  - Vales de despensa en monedero electrónico: 1 UMA mensual (LISR Art. 93-VIII).
 *  - Fondo de ahorro: el aporte patronal es exento hasta el menor entre el 13%
 *    del salario y 1,3 UMA anuales (LISR Art. 27-XI y su reglamento).
 */
export const ESPECIE = {
  valesTopeUmaMensual: 1,
  fondoAhorroPctSalario: 0.13,
  fondoAhorroTopeUmaAnual: 1.3,
};

export const UMA = { diaria: MEXICO_2026.uma.diaria, mensual: MEXICO_2026.uma.mensual, anual: MEXICO_2026.uma.anual };

export const hub: HubData = {
  slug: 'mx/trabajo/aguinaldo-prima-y-ptu',
  title: 'Aguinaldo, prima vacacional y PTU en México: cuánto te toca y cuánto te retienen',
  description:
    'Calcula tu aguinaldo, tu prima vacacional, tu PTU, la prima dominical y el valor de tus vales y fondo de ahorro en México, con las exenciones de ISR en UMA del Art. 93 de la LISR y el método de tasa efectiva del reglamento.',
  silo: 'Trabajo',
  siloHref: '/mx/trabajo',

  eyebrow: 'México · prestaciones y su ISR',
  h1: '¿Cuánto me toca de aguinaldo, prima vacacional y PTU?',
  lede:
    'Estas prestaciones no se gravan como el sueldo: cada una trae su propia exención medida en UMA, y el ISR se calcula sobre el excedente con la tasa efectiva de tu sueldo. Elige la prestación que quieres calcular y mira cuánto queda exento y cuánto acaba en el SAT.',
  stamps: [
    'Aguinaldo mínimo de 15 días · LFT Art. 87',
    'Prima vacacional del 25% · LFT Art. 80',
    'PTU: 10% de la renta gravable · LFT Art. 117',
    '7 calculadoras fusionadas',
  ],

  resultLabel: 'Lo que cobras neto de esta prestación',

  cases: {
    title: '¿Qué prestación quieres calcular?',
    intro:
      'Empezamos por el aguinaldo, que es la que más se consulta. Todas usan los mismos datos de sueldo y antigüedad.',
    items: [
      {
        id: 'aguinaldo',
        label: 'Aguinaldo',
        hint: 'Mínimo quince días de salario, proporcional si no trabajaste el año completo.',
        yes: [
          'Aguinaldo bruto por los días que te da la empresa (mínimo quince de ley)',
          'Prorrateo por los días efectivamente trabajados del año',
          'Exención de treinta UMA y el ISR sobre el excedente con la tasa efectiva de tu sueldo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El aguinaldo debe pagarse antes del 20 de diciembre; la parte proporcional se paga aunque salgas antes',
          'La exención de treinta UMA es un monto fijo en pesos, no un porcentaje: quien cobra poco aguinaldo no paga ISR',
        ],
        plazo: 'se paga a más tardar el 20 de diciembre de cada año (Art. 87 LFT).',
        answer:
          'Mínimo quince días de salario, proporcionales a los días trabajados, con treinta UMA exentas de ISR.',
      },
      {
        id: 'prima-vacacional',
        label: 'Prima vacacional',
        hint: 'Al menos 25% sobre el salario de los días de vacaciones que te tocan.',
        yes: [
          'Días de vacaciones de ley según tu antigüedad, con la reforma de vacaciones dignas',
          'Prima del porcentaje que aplique tu empresa, con piso legal del 25%',
          'Exención de quince UMA y ISR sobre el excedente',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La prima se paga aunque no salgas de vacaciones: es un pago obligatorio, no un premio por vacacionar',
          'Si tu empresa da más días de vacaciones que la ley, la prima se calcula sobre esos días',
        ],
        plazo: 'se paga junto con las vacaciones o al cumplirse el aniversario, según el contrato.',
        answer:
          'Es el 25% como mínimo del salario de tus días de vacaciones, con quince UMA exentas de ISR.',
      },
      {
        id: 'ptu',
        label: 'Reparto de utilidades (PTU)',
        hint: 'El 10% de la renta gravable de la empresa, repartido entre los trabajadores.',
        yes: [
          'Tu parte estimada del reparto, prorrateada por los días trabajados del año',
          'Tope legal de tres meses de salario o el promedio de tu PTU de los últimos tres años, el que te convenga',
          'Exención de quince UMA y el ISR sobre el excedente',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La estimación por número de trabajadores es indicativa: la mitad del reparto se distribuye por días trabajados y la otra mitad por salarios devengados',
          'Directores, administradores y gerentes generales no participan del reparto (Art. 127 LFT)',
          'Empresas de nueva creación en su primer año y algunas otras están exentas de repartir',
        ],
        plazo: 'se paga dentro de los sesenta días siguientes a la declaración anual, o sea a más tardar el 30 de mayo.',
        answer:
          'Te toca una parte del 10% de la utilidad fiscal, topada a tres meses de tu salario si eso te conviene más.',
      },
      {
        id: 'dominical',
        label: 'Prima dominical y días festivos',
        hint: 'El extra por trabajar domingos, festivos obligatorios o tu día de descanso.',
        yes: [
          'Prima dominical del 25% extra por cada domingo trabajado como día ordinario',
          'Festivo obligatorio trabajado: salario doble adicional, o sea triple en total',
          'Día de descanso semanal trabajado: también salario doble adicional',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La prima dominical solo aplica cuando el domingo es parte de tu jornada ordinaria: si es tu día de descanso, se paga como descanso trabajado',
          'De la prima dominical solo está exenta una UMA por domingo; el resto se grava',
        ],
        plazo: 'estos pagos se integran a la nómina del período en el que se generan.',
        answer:
          'El domingo ordinario paga 25% extra; el festivo o el descanso trabajado se pagan al triple.',
      },
      {
        id: 'especie',
        label: 'Vales de despensa y fondo de ahorro',
        hint: 'Cuánto valen realmente las prestaciones en especie de tu paquete.',
        yes: [
          'Valor anual de los vales de despensa y del aporte patronal al fondo de ahorro',
          'Porción exenta de ISR de cada una y el excedente que sí se grava',
          'Cuánto suman al año sobre tu sueldo base',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los vales exentos tienen tope de una UMA mensual; lo que rebase se grava e integra el salario base de cotización',
          'El fondo de ahorro es exento solo si el patrón aporta lo mismo que el trabajador y hay reglas generales de permanencia',
        ],
        plazo: 'el fondo de ahorro suele entregarse una o dos veces al año, según el reglamento interior.',
        answer:
          'Son ingreso real aunque no aparezcan en el sueldo: los vales y el fondo de ahorro tienen su propio tope exento.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'El salario diario es tu sueldo mensual entre 30. Los campos que no aplican a tu caso simplemente se ignoran en el cálculo.',
  fields: [
    {
      id: 'salarioDiario',
      label: 'Salario diario (MXN)',
      prefix: '$',
      value: '700',
      thousands: true,
      help: 'Sueldo mensual entre 30. Es la base de casi todas las prestaciones.',
    },
    {
      id: 'antiguedad',
      label: 'Antigüedad en años',
      type: 'number',
      value: 4,
      min: 0,
      max: 50,
      step: 1,
      help: 'Define cuántos días de vacaciones te tocan y, con ellos, la prima vacacional.',
    },
    {
      id: 'diasAnio',
      label: 'Días trabajados en el año',
      type: 'number',
      value: 365,
      min: 1,
      max: 365,
      step: 1,
      help: 'Se usan para prorratear el aguinaldo y la PTU.',
    },
    {
      id: 'diasPrestacion',
      label: 'Días de aguinaldo que da tu empresa',
      type: 'number',
      value: 15,
      min: 15,
      max: 90,
      step: 1,
      help: 'El mínimo de ley es quince. Muchas empresas dan treinta.',
    },
    {
      id: 'utilidad',
      label: 'Utilidad fiscal de la empresa (MXN)',
      prefix: '$',
      value: 5000000,
      thousands: true,
      help: 'Solo para la PTU. Es la renta gravable del ejercicio que aparece en la declaración anual.',
    },
    {
      id: 'trabajadores',
      label: 'Número de trabajadores que participan',
      type: 'number',
      value: 50,
      min: 1,
      max: 100000,
      step: 1,
      help: 'Solo para la PTU. Sirve para estimar tu parte del reparto.',
    },
    {
      id: 'domingos',
      label: 'Domingos trabajados en el período',
      type: 'number',
      value: 4,
      min: 0,
      max: 31,
      step: 1,
      help: 'Solo para el caso de prima dominical.',
    },
    {
      id: 'festivos',
      label: 'Festivos o descansos trabajados',
      type: 'number',
      value: 1,
      min: 0,
      max: 31,
      step: 1,
      help: 'Solo para el caso de prima dominical. Se pagan al triple.',
    },
    {
      id: 'vales',
      label: 'Vales de despensa mensuales (MXN)',
      prefix: '$',
      value: 2000,
      thousands: true,
      help: 'Solo para el caso de prestaciones en especie.',
    },
    {
      id: 'fondoPct',
      label: 'Aporte patronal al fondo de ahorro',
      suffix: '%',
      type: 'number',
      value: 5,
      min: 0,
      max: 13,
      step: 0.5,
      help: 'Porcentaje del salario que aporta la empresa. Solo para el caso de prestaciones en especie.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Exento, gravado e ISR',
    caption:
      'Muestra qué parte de la prestación queda libre de impuesto por la exención en UMA, qué parte se grava y cuánto se lleva finalmente el ISR.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Cada renglón cita el artículo que lo obliga o la exención que lo cubre.',

  faq: [
    {
      q: '¿Cuántos días de aguinaldo me tocan por ley?',
      a: 'El mínimo legal son quince días de salario al año (Art. 87 de la LFT), pagaderos antes del 20 de diciembre. Si no trabajaste el año completo, te corresponde la parte proporcional a los días laborados, sin importar si sigues en la empresa o ya saliste. Muchas empresas otorgan treinta días por contrato colectivo, y en ese caso manda lo pactado.',
    },
    {
      q: '¿Cuánto ISR me retienen del aguinaldo?',
      a: 'Los primeros treinta UMA diarias quedan exentos (Art. 93 de la LISR). Sobre el excedente se calcula el impuesto con el método de tasa efectiva del Art. 142 del reglamento: se compara el ISR de tu sueldo con y sin el aguinaldo gravado, y esa diferencia es la retención. Por eso alguien con aguinaldo chico no paga nada y alguien con aguinaldo grande sí.',
    },
    {
      q: '¿Cómo se calcula la prima vacacional?',
      a: 'Es un porcentaje sobre el salario de los días de vacaciones que te corresponden, con un piso legal del 25% (Art. 80 de la LFT). Los días salen de la tabla del Art. 76 reformada en 2023: doce días el primer año, dos más por año hasta veinte al quinto, y luego dos más por cada quinquenio. La prima se paga aunque no salgas de vacaciones.',
    },
    {
      q: '¿Qué es la PTU y quién la cobra?',
      a: 'Es el reparto del 10% de la renta gravable de la empresa entre sus trabajadores (Art. 117 de la LFT). La mitad se reparte según los días trabajados y la otra mitad según los salarios devengados. Quedan fuera los directores, administradores y gerentes generales, y los trabajadores eventuales con menos de sesenta días en el año.',
    },
    {
      q: '¿Existe un tope para la PTU?',
      a: 'Sí. Desde la reforma de 2021, el Art. 127 fracción VIII establece que el monto de cada trabajador se limita a tres meses de su salario o al promedio de la PTU recibida en los últimos tres años, aplicando el que le resulte más favorable. Esa fue la respuesta legislativa al abuso de la subcontratación.',
    },
    {
      q: '¿La PTU paga ISR?',
      a: 'Están exentas quince UMA diarias (Art. 93 de la LISR) y el excedente se grava. Igual que con el aguinaldo, el cálculo correcto usa el procedimiento del reglamento para ingresos que no son sueldo ordinario, no la tarifa mensual aplicada en seco al monto completo. La retención suele quedar muy por debajo de la tasa marginal.',
    },
    {
      q: '¿Cuándo me deben pagar la PTU?',
      a: 'Dentro de los sesenta días siguientes a la fecha en la que la empresa debe presentar su declaración anual. Para personas morales eso significa a más tardar el 30 de mayo, y para personas físicas con trabajadores, el 29 de junio. Si te fuiste durante el ejercicio, tienes un año para reclamar tu parte.',
    },
    {
      q: '¿Cuánto se paga por trabajar un domingo?',
      a: 'Si el domingo es parte de tu jornada ordinaria, corresponde una prima dominical de al menos 25% sobre el salario de ese día (Art. 71 de la LFT). Si en cambio el domingo era tu día de descanso semanal, la ley obliga a pagar un salario doble adicional, o sea el triple contando el día normal (Art. 73). Son dos cosas distintas que suelen confundirse.',
    },
    {
      q: '¿Y por trabajar un día festivo obligatorio?',
      a: 'El Art. 75 de la LFT obliga a pagar, además del salario del día, un salario doble por el servicio prestado: en total, el triple. Los festivos obligatorios están enumerados en el Art. 74 y no incluyen todos los días que la gente considera feriados. Los llamados puentes o días de asueto escolar no generan este pago.',
    },
    {
      q: '¿Los vales de despensa son ingreso gravable?',
      a: 'Entregados en monedero electrónico autorizado están exentos hasta una UMA mensual por trabajador (Art. 93 fracción VIII de la LISR). Lo que rebasa ese tope se grava e integra el salario base de cotización del IMSS. Aun con el excedente gravado, siguen siendo más eficientes que el mismo monto en sueldo.',
    },
    {
      q: '¿Cómo funciona el fondo de ahorro?',
      a: 'Es un esquema en el que el trabajador aporta un porcentaje de su salario y el patrón aporta lo mismo. El aporte patronal es exento para el trabajador y deducible para la empresa hasta el menor entre el 13% del salario y 1,3 UMA anuales, siempre que exista un plan con reglas generales y que los retiros se hagan una o dos veces al año.',
    },
    {
      q: '¿Las prestaciones superiores a la ley se pueden quitar?',
      a: 'No unilateralmente. Una prestación que se otorga de forma reiterada y generalizada se incorpora a las condiciones de trabajo y su supresión configura una modificación en perjuicio del trabajador. Cambiarla requiere acuerdo o el procedimiento de modificación de condiciones colectivas previsto en la LFT.',
    },
  ],

  sources: [
    {
      name: 'Ley Federal del Trabajo — Arts. 71, 73, 74, 75, 76, 80, 87, 117 y 127',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley del Impuesto sobre la Renta — Art. 93, exenciones de ingresos laborales',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Reglamento de la LISR — Art. 142, ingresos por gratificaciones y PTU',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LISR.pdf',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'SAT — Anexo 8 de la RMF 2026, tarifas de ISR (DOF 28-dic-2025)',
      url: 'https://www.sat.gob.mx/normatividad/22186/resolucion-miscelanea-fiscal-(rmf)',
      publisher: 'Servicio de Administración Tributaria',
      date: '28-12-2025',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'STPS — reparto de utilidades',
      url: 'https://www.gob.mx/stps',
      publisher: 'Secretaría del Trabajo y Previsión Social',
    },
  ],

  replaces: [
    '/calculadora-aguinaldo-mexico-2026-15-dias-tope-30',
    '/calculadora-isr-aguinaldo-exento-gravado-mexico',
    '/calculadora-prima-vacacional-mexico',
    '/calculadora-ptu-reparto-utilidades-mexico-10-porcentaje',
    '/calculadora-prima-dominical-dias-festivos-mexico',
    '/calculadora-prestaciones-superiores-ley-mexico-2026',
    '/calculadora-fondo-ahorro-vales-despensa-mexico-2026',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
