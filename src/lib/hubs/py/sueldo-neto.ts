import type { HubData } from '../types';
import { PARAGUAY_2026, EMBARGO_SALARIO_PY } from '../../data/paraguay-2026';

/**
 * Hub de decisión PY — "¿Cuánto me queda en mano este mes?"
 *
 * Fuente única de constantes: src/lib/data/paraguay-2026.ts (la misma tabla maestra
 * que usan las fórmulas vivas). Nada hardcodeado de memoria acá.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Salario mínimo vigente (Decreto N° 6225) y jornal mínimo. */
export const SMVM = PARAGUAY_2026.salarioMinimo;
export const JORNAL_MINIMO = PARAGUAY_2026.jornalMinimo;

/** Aportes al IPS: obrero 9% (se descuenta) / patronal 16,5% (lo paga el empleador). */
export const IPS = { obrero: PARAGUAY_2026.ips.obrero, patronal: PARAGUAY_2026.ips.patronal };

/** Divisores de la liquidación: 240 h/mes (30 días × 8 h) y 30 días/mes. */
export const DIVISORES = {
  horasMes: PARAGUAY_2026.horasMesEstandar,
  diasMes: PARAGUAY_2026.diasMes,
  horasDia: PARAGUAY_2026.horasDia,
};

/** Recargos del art. 234 del Código del Trabajo (Ley 213/93). */
export const RECARGOS = {
  extraDiurna: PARAGUAY_2026.laboral.horaExtraDiurna,
  extraNocturna: PARAGUAY_2026.laboral.horaExtraNocturna,
  feriadoDomingo: PARAGUAY_2026.laboral.horaFeriadoDomingo,
  nocturnoOrdinario: PARAGUAY_2026.laboral.recargoNocturno,
};

/** Bonificación familiar del art. 261: 5% del SMVM por hijo, sólo si el salario ≤ 2 SMVM. */
export const BONIFICACION = {
  pct: PARAGUAY_2026.laboral.bonificacionFamiliarPct,
  topeSalarios: PARAGUAY_2026.laboral.bonificacionFamiliarTopeSalarios,
  porHijo: SMVM * PARAGUAY_2026.laboral.bonificacionFamiliarPct,
  tope: SMVM * PARAGUAY_2026.laboral.bonificacionFamiliarTopeSalarios,
};

/** Topes de embargo del art. 245 del Código del Trabajo. */
export const EMBARGO = {
  alimenticia: EMBARGO_SALARIO_PY.pensionAlimenticia,
  vivienda: EMBARGO_SALARIO_PY.viviendaAlimentos,
  otras: EMBARGO_SALARIO_PY.otrasDeudas,
};

const gs = (n: number) => 'Gs. ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'py/trabajo/sueldo-neto',
  title: 'Salario neto en Paraguay: cuánto cobrás en mano después del IPS',
  description:
    'Del bruto al neto en Paraguay: descuento del IPS 9%, bonificación familiar, horas extras al 50% y 100%, recargo nocturno del 30%, feriados trabajados, faltas descontadas y topes de embargo del art. 245.',
  silo: 'Trabajo',
  siloHref: '/py/trabajo',
  locale: 'py',

  eyebrow: 'Paraguay · Código del Trabajo · IPS',
  h1: '¿Cuánto cobrás en mano este mes?',
  lede:
    'Una sola cuenta arma tu recibo completo: el descuento obrero del IPS, la bonificación familiar si te corresponde, los recargos por horas extras, trabajo nocturno y feriados, las faltas que te descuentan y el tope legal de lo que te pueden embargar.',
  stamps: [
    `Salario mínimo vigente: ${gs(SMVM)}`,
    `Jornal mínimo: ${gs(JORNAL_MINIMO)}`,
    'Ley 213/93, arts. 234, 243, 245 y 261',
    '10 calculadoras adentro',
  ],

  resultLabel: 'Neto a cobrar este mes',

  cases: {
    title: '¿Cómo te pagan?',
    intro:
      'El descuento del IPS es el mismo para todos, pero el valor de tu día y de tu hora cambia según la modalidad. Partimos del caso más frecuente.',
    items: [
      {
        id: 'mensualero',
        label: 'Cobro un sueldo mensual fijo',
        hint: 'Mensualizado · jornada de 8 h',
        answer: 'Del bruto sale el 9% de IPS; tu hora vale el sueldo dividido 240 y tu día el sueldo dividido 30.',
        yes: [
          'Aporte obrero al IPS del 9% sobre el bruto: es el único descuento legal obligatorio del recibo',
          `Bonificación familiar de ${gs(BONIFICACION.porHijo)} por hijo menor de 17, si tu salario no supera ${gs(BONIFICACION.tope)}`,
          'Horas extras diurnas al +50% y nocturnas al +100% sobre la hora ordinaria (art. 234)',
          'Recargo del +30% por cada hora ordinaria trabajada entre las 20:00 y las 06:00',
          'Feriado trabajado: como el sueldo ya incluye el día, cobrás un 100% adicional por ese día',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El aporte patronal del 16,5% NO sale de tu bolsillo: lo paga el empleador aparte del sueldo',
          'La ley permite hasta 3 horas extra por día y 57 horas semanales sumando la jornada ordinaria',
        ],
        plazo: 'el sueldo se paga por mes vencido y el aguinaldo antes del 31 de diciembre.',
      },
      {
        id: 'jornalero',
        label: 'Cobro por jornal o por hora',
        hint: 'Trabajador a jornal · jornal mínimo legal',
        answer: `El jornal mínimo legal es ${gs(JORNAL_MINIMO)} por día trabajado, con el IPS descontado igual que a un mensualero.`,
        yes: [
          `Jornal mínimo de ${gs(JORNAL_MINIMO)} por día de 8 horas`,
          'El aporte del 9% al IPS también se descuenta del jornalero: la afiliación es obligatoria',
          'El feriado trabajado se paga al doble (200% del jornal), porque el día no viene incluido en un sueldo mensual',
          'Cada hora extra se calcula sobre el valor de tu hora ordinaria, no sobre el jornal mínimo',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La conversión entre jornal y mensual depende de la convención de días que use tu empleador: acá usamos 26 jornales al mes para el equivalente mensual y 30 días para el valor del día de un mensualero. No es lo mismo y conviene chequearlo en tu recibo',
          'Si trabajás todos los días hábiles del mes, el total no puede quedar por debajo del salario mínimo mensual',
        ],
        plazo: 'el jornal se liquida por período trabajado, habitualmente quincenal o mensual.',
      },
      {
        id: 'domestica',
        label: 'Trabajo doméstico',
        hint: 'Ley 5407/15 y Ley 6338/19',
        answer: 'Desde la Ley 6338/19 el trabajo doméstico cobra el 100% del salario mínimo legal y va obligatoriamente al IPS.',
        yes: [
          `Salario mínimo completo: ${gs(SMVM)} por jornada full time`,
          'Afiliación obligatoria al IPS con los mismos porcentajes que el resto (9% obrero / 16,5% patronal)',
          'Aguinaldo, vacaciones y bonificación familiar en las mismas condiciones que cualquier trabajador',
          `Jornada parcial: el sueldo se prorratea sobre la jornada legal de 48 horas semanales`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La reforma de la Ley 6338/19 eliminó el viejo 60% del salario mínimo: cualquier liquidación que siga usando ese porcentaje está desactualizada',
          'El costo total del empleador es el bruto más el 16,5% patronal, no sólo el sueldo',
        ],
        plazo: 'la inscripción en el IPS debe hacerse al inicio de la relación, no cuando surge un problema.',
      },
      {
        id: 'embargado',
        label: 'Tengo un embargo o descuento judicial',
        hint: 'Art. 245 del Código del Trabajo',
        answer: `Según el tipo de deuda te pueden retener como máximo el ${(EMBARGO.alimenticia * 100).toFixed(0)}%, el ${(EMBARGO.vivienda * 100).toFixed(0)}% o el ${(EMBARGO.otras * 100).toFixed(0)}% del salario.`,
        yes: [
          `Pensión alimenticia: hasta el ${(EMBARGO.alimenticia * 100).toFixed(0)}% del salario`,
          `Habitación o artículos alimenticios propios o de familiares: hasta el ${(EMBARGO.vivienda * 100).toFixed(0)}%`,
          `Cualquier otra deuda: hasta el ${(EMBARGO.otras * 100).toFixed(0)}%`,
          'El aguinaldo es inembargable en todos los casos',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Varios embargos simultáneos no pueden superar, sumados, el máximo aplicable: no se acumulan uno sobre otro',
          'El tope se calcula sobre el salario, y el descuento del IPS es independiente del embargo',
        ],
        plazo: 'el embargo lo ordena un juez y el empleador está obligado a retenerlo desde la notificación.',
      },
    ],
  },

  inputsTitle: 'Tu recibo de este mes',
  inputsIntro:
    'Todo en guaraníes. Dejá en cero lo que no te aplique: el cálculo suma sólo los conceptos que cargues.',
  fields: [
    {
      id: 'bruto',
      label: 'Salario bruto mensual (Gs.)',
      prefix: 'Gs.',
      value: '3.500.000',
      thousands: true,
      help: `El sueldo antes de descuentos. El salario mínimo vigente es ${gs(SMVM)}.`,
    },
    {
      id: 'hijos',
      label: 'Hijos menores de 17 a cargo',
      type: 'number',
      value: 1,
      min: 0,
      max: 12,
      step: 1,
      help: `${gs(BONIFICACION.porHijo)} por hijo, sólo si el salario no supera ${gs(BONIFICACION.tope)}.`,
    },
    {
      id: 'horasExtra',
      label: 'Horas extra diurnas del mes',
      type: 'number',
      value: 8,
      min: 0,
      max: 200,
      step: 1,
      help: 'Se pagan al +50% sobre la hora ordinaria (art. 234). Tope legal: 3 por día.',
    },
    {
      id: 'horasExtraNoct',
      label: 'Horas extra nocturnas del mes',
      type: 'number',
      value: 0,
      min: 0,
      max: 200,
      step: 1,
      help: 'Entre las 20:00 y las 06:00 se pagan al +100%.',
    },
    {
      id: 'horasNocturnas',
      label: 'Horas ordinarias nocturnas del mes',
      type: 'number',
      value: 0,
      min: 0,
      max: 300,
      step: 1,
      help: 'Horas de tu jornada normal entre las 20:00 y las 06:00: llevan un recargo del 30%.',
    },
    {
      id: 'diasFeriado',
      label: 'Días feriados trabajados',
      type: 'number',
      value: 0,
      min: 0,
      max: 15,
      step: 1,
      help: 'El mensualero cobra un 100% adicional por día; el jornalero cobra el día al doble.',
    },
    {
      id: 'diasFalta',
      label: 'Días no trabajados que te descuentan',
      type: 'number',
      value: 0,
      min: 0,
      max: 30,
      step: 1,
      help: 'Faltas sin goce de sueldo. Las licencias legales y la enfermedad certificada no se descuentan.',
    },
    {
      id: 'otros',
      label: 'Otros descuentos (Gs.)',
      prefix: 'Gs.',
      value: '0',
      thousands: true,
      help: 'Anticipos, cuotas de cooperativa, embargos ya notificados.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'Qué pasa con tu sueldo bruto',
    caption:
      'Compara el neto que te llevás a casa contra el aporte obrero al IPS y los descuentos por faltas u otros conceptos, sumando los recargos que ganaste.',
  },
  breakdownTitle: 'Tu recibo, línea por línea',
  breakdownIntro:
    'El mismo orden de una planilla paraguaya: bruto, recargos que suman, descuentos que restan y el neto final.',

  faq: [
    {
      q: '¿Cuánto se descuenta del salario en Paraguay?',
      a: `Un único descuento obligatorio: el aporte obrero al IPS, del ${(IPS.obrero * 100).toFixed(0)}% del salario bruto. No hay retención de impuesto a la renta sobre el sueldo mes a mes: el IRP se liquida de forma anual y sólo si el ingreso bruto del año supera el umbral de no incidencia. Cualquier otro descuento del recibo (anticipos, cuotas, embargos) tiene que estar autorizado por vos o por una orden judicial.`,
    },
    {
      q: '¿Cuál es el salario mínimo vigente y cuánto es el jornal mínimo?',
      a: `El salario mínimo mensual para actividades diversas no especificadas es de ${gs(SMVM)}, fijado por el Decreto N° 6225 con un reajuste del 5%. El jornal mínimo diario es de ${gs(JORNAL_MINIMO)}. Antes del reajuste el mínimo era de ${gs(PARAGUAY_2026.salarioMinimoAnterior)}, así que si tu recibo todavía muestra ese número está atrasado.`,
    },
    {
      q: '¿Cómo se calcula el valor de mi hora?',
      a: `La convención estándar para mensualizados es dividir el sueldo por 240, que sale de 30 días por 8 horas de jornada. El valor del día es el sueldo dividido 30. Ojo con un detalle que confunde: para pasar de jornal a equivalente mensual se suele usar 26 jornales al mes, porque el jornalero no cobra los descansos. Son dos divisores distintos y cada uno responde una pregunta distinta.`,
    },
    {
      q: '¿Cuánto se paga la hora extra?',
      a: `El art. 234 del Código del Trabajo fija un recargo del ${(RECARGOS.extraDiurna * 100).toFixed(0)}% para la hora extra diurna, entre las 06:00 y las 20:00, y del ${(RECARGOS.extraNocturna * 100).toFixed(0)}% para la nocturna, entre las 20:00 y las 06:00. El mismo ${(RECARGOS.feriadoDomingo * 100).toFixed(0)}% se aplica al trabajo en feriados y en el descanso semanal. El recargo se calcula sobre tu hora ordinaria real, no sobre la hora del salario mínimo.`,
    },
    {
      q: '¿Qué diferencia hay entre hora extra nocturna y recargo nocturno?',
      a: `Son dos cosas distintas que se confunden todo el tiempo. El recargo nocturno del ${(RECARGOS.nocturnoOrdinario * 100).toFixed(0)}% corresponde a las horas de tu jornada normal que caen entre las 20:00 y las 06:00: no son horas extra, es tu jornada, pero de noche. La hora extra nocturna es una hora por encima de tu jornada trabajada de noche, y ésa lleva el ${(RECARGOS.extraNocturna * 100).toFixed(0)}%. Además, la jornada nocturna máxima es de 7 horas diarias o 42 semanales, contra 8 y 48 de la diurna.`,
    },
    {
      q: '¿Cuánto cobro si trabajo un feriado?',
      a: 'Depende de cómo te paguen. Si sos mensualero, tu sueldo ya incluye el pago del feriado lo trabajes o no, así que trabajarlo te suma un 100% adicional por ese día: un jornal extra. Si cobrás por jornal, el día feriado trabajado se paga al doble, es decir el 200% del jornal, porque el día no venía incluido en ningún sueldo mensual.',
    },
    {
      q: '¿Quién cobra la bonificación familiar y de cuánto es?',
      a: `El art. 261 del Código del Trabajo reconoce una bonificación del ${(BONIFICACION.pct * 100).toFixed(0)}% del salario mínimo por cada hijo menor de 17 años, sin límite de edad si el hijo tiene discapacidad. Con el mínimo vigente eso da ${gs(BONIFICACION.porHijo)} por hijo. Sólo la cobra el trabajador que gana hasta ${BONIFICACION.topeSalarios} salarios mínimos, o sea ${gs(BONIFICACION.tope)}: un guaraní por encima de ese tope y el beneficio cae a cero de golpe, no se reduce gradualmente.`,
    },
    {
      q: '¿Cuánto me descuentan por faltar un día?',
      a: 'El valor de un día es el salario mensual dividido 30, y el de una hora el salario dividido 240. El empleador descuenta sólo las ausencias sin goce de sueldo: las licencias legales, los permisos pagos y la enfermedad con certificado no se descuentan. El descuento también baja la base del aguinaldo de ese mes y el aporte al IPS.',
    },
    {
      q: '¿Cuánto me pueden embargar del sueldo?',
      a: `El art. 245 pone tres topes según el tipo de deuda: hasta el ${(EMBARGO.alimenticia * 100).toFixed(0)}% por pensión alimenticia, hasta el ${(EMBARGO.vivienda * 100).toFixed(0)}% por habitación o artículos alimenticios propios y de familiares, y hasta el ${(EMBARGO.otras * 100).toFixed(0)}% en los demás casos. Si te llegan varios embargos, la suma no puede pasar el máximo aplicable. El aguinaldo es inembargable siempre.`,
    },
    {
      q: '¿El aporte patronal del 16,5% me lo descuentan a mí?',
      a: `No. El empleador aporta un ${(IPS.patronal * 100).toLocaleString('de-DE')}% adicional al IPS que no sale de tu sueldo: ${(PARAGUAY_2026.ips.patronalIps * 100).toFixed(0)}% al IPS y ${(PARAGUAY_2026.ips.patronalSalud * 100).toLocaleString('de-DE')}% al Ministerio de Salud Pública. Sumado a tu ${(IPS.obrero * 100).toFixed(0)}%, al IPS entra el ${((IPS.obrero + IPS.patronal) * 100).toLocaleString('de-DE')}% de tu salario. Por eso un empleado le cuesta a la empresa un ${((1 + IPS.patronal) * 100).toLocaleString('de-DE')}% de su bruto, sin contar aguinaldo ni vacaciones.`,
    },
    {
      q: '¿El trabajo doméstico cobra el salario mínimo completo?',
      a: 'Sí. La Ley 5407/15, modificada por la Ley 6338/19, equiparó el trabajo doméstico al resto: 100% del salario mínimo legal, afiliación obligatoria al IPS con los mismos porcentajes, aguinaldo, vacaciones y bonificación familiar. El viejo régimen que permitía pagar el 60% del mínimo quedó derogado. En jornada parcial el sueldo se prorratea sobre las 48 horas semanales de la jornada legal.',
    },
    {
      q: '¿Me pueden pagar menos del salario mínimo si trabajo medio tiempo?',
      a: 'Proporcionalmente sí, pero no arbitrariamente. El piso se prorratea sobre la jornada legal de 48 horas semanales: si trabajás 24 horas, el mínimo que te corresponde es la mitad del salario mínimo mensual. Lo que no puede pasar es que trabajes jornada completa y cobres menos del mínimo, ni que el prorrateo tape horas extra no pagadas.',
    },
  ],

  sources: [
    {
      name: 'Código del Trabajo (Ley N° 213/93) — jornada, recargos, bonificación familiar y embargo',
      url: 'https://www.bacn.gov.py/leyes-paraguayas/2608/ley-n-213-establece-el-codigo-del-trabajo',
      publisher: 'Biblioteca y Archivo Central del Congreso Nacional',
    },
    {
      name: 'MTESS — Salario mínimo legal vigente',
      url: 'https://www.mtess.gov.py/',
      publisher: 'Ministerio de Trabajo, Empleo y Seguridad Social',
    },
    {
      name: 'IPS — Aportes obrero y patronal',
      url: 'https://portal.ips.gov.py/sistemas/ipsportal/contenido.php?c=315',
      publisher: 'Instituto de Previsión Social',
    },
    {
      name: 'Ley N° 5407/15 del Trabajo Doméstico y su modificatoria Ley N° 6338/19',
      url: 'https://www.bacn.gov.py/leyes-paraguayas/4979/ley-n-5407-del-trabajo-domestico',
      publisher: 'Biblioteca y Archivo Central del Congreso Nacional',
    },
  ],

  replaces: [
    '/py/calculadora-salario-neto-paraguay',
    '/py/salario-minimo-paraguay-2026',
    '/py/calculadora-hora-trabajo-jornal-paraguay',
    '/py/bonificacion-familiar-paraguay',
    '/py/calculadora-horas-extras-paraguay',
    '/py/calculadora-recargo-nocturno-paraguay',
    '/py/calculadora-feriado-trabajado-paraguay',
    '/py/calculadora-descuento-dia-no-trabajado-paraguay',
    '/py/calculadora-embargo-salario-paraguay',
    '/py/calculadora-empleada-domestica-paraguay',
  ],

  lastReviewed: '2026-07-28',
};
