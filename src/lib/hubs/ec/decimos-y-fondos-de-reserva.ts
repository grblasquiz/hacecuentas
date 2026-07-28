import type { HubData } from '../types';
import { ECUADOR_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "Décimos, fondos de reserva y vacaciones: cuánto me toca y cuándo lo cobro".
 *
 * Constantes: src/lib/data/ecuador-2026.ts (SBU y fondos de reserva).
 * Cálculo espejado de decimo-tercer-sueldo-ecuador.ts, decimo-cuarto-sueldo-ecuador.ts,
 * fondos-de-reserva-ecuador.ts y vacaciones-ecuador.ts.
 *
 * CORRECCIÓN respecto de la fórmula vieja: decimo-cuarto-sueldo-ecuador.ts decía que el
 * décimo cuarto se paga "en marzo (Sierra y Oriente) o agosto (Costa e Insular)". Está
 * invertido. El art. 113 del Código del Trabajo manda al revés:
 *   · Régimen Costa e Insular: hasta el 15 de MARZO (período 1-mar a 28/29-feb).
 *   · Régimen Sierra y Amazonía: hasta el 15 de AGOSTO (período 1-ago a 31-jul).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LAB =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const SBU = ECUADOR_2026.sbu;
export const FONDOS_RESERVA = ECUADOR_2026.fondosReserva;
/** Vacaciones art. 69: 15 días al año, +1 día por cada año que exceda de los 5, tope 15 adicionales. */
export const VACACIONES_BASE = 15;
export const VACACIONES_ADICIONALES_MAX = 15;

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/trabajo/decimos-y-fondos-de-reserva',
  title: 'Décimos, fondos de reserva y vacaciones en Ecuador: cuánto te toca y cuándo se cobra',
  description:
    'Calcula el décimo tercero, el décimo cuarto según tu región (Costa e Insular hasta el 15 de marzo, Sierra y Amazonía hasta el 15 de agosto), los fondos de reserva del 8,33% y las vacaciones del art. 69, con el SBU vigente.',
  silo: 'Trabajo',
  siloHref: '/ec/trabajo',
  locale: 'ec',

  eyebrow: 'Ecuador · beneficios de ley · Código del Trabajo',
  h1: 'Décimos, fondos de reserva y vacaciones: cuánto te toca y cuándo lo cobras.',
  lede:
    'Sobre los doce sueldos del año, la ley ecuatoriana te suma cuatro cosas más: el décimo tercero, el décimo cuarto, los fondos de reserva y las vacaciones pagadas. Cada una tiene su propio período de cálculo y su propia fecha de pago, y la del décimo cuarto además cambia según la región en la que trabajas.',
  stamps: [
    `SBU ${usd(SBU)} · décimo cuarto = 1 SBU`,
    'Fondos de reserva 8,33% desde el mes 13',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Lo que te corresponde',

  cases: {
    title: '¿Qué beneficio estás calculando?',
    intro:
      'Los cuatro se calculan sobre bases distintas y se cobran en momentos distintos. Elige el que te interesa: el desglose de abajo te muestra igual el paquete anual completo.',
    items: [
      {
        id: 'd13',
        label: 'Décimo tercer sueldo',
        hint: 'Un doceavo de lo percibido · hasta el 24 de diciembre',
        answer:
          'El décimo tercero es un doceavo de todo lo que percibiste entre el 1 de diciembre y el 30 de noviembre, y se paga hasta el 24 de diciembre.',
        yes: [
          'Período de cálculo: del 1 de diciembre al 30 de noviembre del año siguiente (art. 111)',
          'Base: todo lo percibido como remuneración, incluidas horas extra y comisiones',
          'No entran en la base los décimos anteriores, los viáticos ni el reparto de utilidades',
          'Está exento de impuesto a la renta y no aporta al IESS',
        ],
        warn: [
          DISCLAIMER_LAB,
          'Si optaste por cobrarlo mensualizado, el empleador te lo suma cada mes al rol y en diciembre ya no cobras nada acumulado',
          'Si trabajaste menos de doce meses en el período, el pago es proporcional a los meses efectivamente trabajados',
        ],
        plazo: 'se paga hasta el 24 de diciembre de cada año.',
      },
      {
        id: 'd14costa',
        label: 'Décimo cuarto — Costa e Insular',
        hint: '1 SBU · hasta el 15 de marzo',
        answer: `En el régimen Costa e Insular el décimo cuarto se paga hasta el 15 de marzo y equivale a un SBU completo: ${usd(SBU)}.`,
        yes: [
          'Monto: un Salario Básico Unificado completo, sin importar cuánto ganes',
          'Período de cálculo: del 1 de marzo al 28 o 29 de febrero del año siguiente',
          'Fecha de pago: hasta el 15 de marzo (art. 113)',
          'Está exento de impuesto a la renta y no aporta al IESS',
        ],
        warn: [
          DISCLAIMER_LAB,
          'La región la define el lugar donde se presta el servicio, no el domicilio del trabajador ni el de la empresa',
          'Si trabajaste menos de doce meses del período, cobras la parte proporcional; en jornada parcial se prorratea por horas',
        ],
        plazo: 'régimen Costa e Insular: hasta el 15 de marzo, por el período del 1 de marzo al 28 o 29 de febrero.',
      },
      {
        id: 'd14sierra',
        label: 'Décimo cuarto — Sierra y Amazonía',
        hint: '1 SBU · hasta el 15 de agosto',
        answer: `En el régimen Sierra y Amazonía el décimo cuarto se paga hasta el 15 de agosto y equivale a un SBU completo: ${usd(SBU)}.`,
        yes: [
          'Monto: un Salario Básico Unificado completo, igual para todos los trabajadores',
          'Período de cálculo: del 1 de agosto al 31 de julio del año siguiente',
          'Fecha de pago: hasta el 15 de agosto (art. 113)',
          'Se lo llama bono escolar porque coincide con el inicio del año lectivo de la región',
        ],
        warn: [
          DISCLAIMER_LAB,
          'Si cambiaste de región durante el año, el período y la fecha de pago los define el régimen del lugar donde prestas el servicio',
          'También puede cobrarse mensualizado si el trabajador lo solicita por escrito',
        ],
        plazo: 'régimen Sierra y Amazonía: hasta el 15 de agosto, por el período del 1 de agosto al 31 de julio.',
      },
      {
        id: 'fondos',
        label: 'Fondos de reserva',
        hint: '8,33% desde el mes 13',
        answer:
          'A partir del mes 13 con el mismo empleador te corresponde el 8,33% de la remuneración como fondos de reserva.',
        yes: [
          'Tasa: 8,33% de la remuneración, equivalente a un sueldo más al año',
          'Se generan a partir del decimotercer mes de trabajo con el mismo empleador',
          'Por defecto se pagan mensualizados en el rol, salvo que pidas acumularlos en el IESS',
          'Los acumulados en el IESS se pueden retirar en cualquier momento desde la plataforma del instituto',
        ],
        warn: [
          DISCLAIMER_LAB,
          'Si cambias de empleador el conteo del año vuelve a empezar con el nuevo: la antigüedad no se acumula entre empresas para este beneficio',
          'Los fondos mensualizados sí cuentan como ingreso para el impuesto a la renta, a diferencia de los décimos',
        ],
        plazo:
          'mensualizados se pagan con el rol de cada mes; acumulados, el empleador los deposita en el IESS y se retiran cuando el afiliado los pide.',
      },
      {
        id: 'vacaciones',
        label: 'Vacaciones',
        hint: '15 días + 1 por año desde el sexto',
        answer:
          'Te corresponden 15 días de vacaciones pagadas al año, y desde el sexto año se suma un día por cada año adicional, con tope de 15 días extra.',
        yes: [
          'Base: 15 días ininterrumpidos al año, incluidos los días no laborables (art. 69)',
          'Un día adicional por cada año que exceda de los cinco, hasta 15 días adicionales',
          'El valor del día se calcula dividiendo la remuneración mensual entre 30',
          'Si no las gozaste, se liquidan en dinero al salir de la empresa',
        ],
        warn: [
          DISCLAIMER_LAB,
          'El empleador puede negar la acumulación de más de dos períodos de vacaciones: el tercero se pierde salvo pacto en contrario',
          'Los días adicionales por antigüedad pueden pagarse en dinero en vez de gozarse, a elección del empleador',
        ],
        plazo:
          'se gozan una vez cumplido el año de trabajo; el empleador debe fijar la fecha con al menos tres meses de anticipación.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Todo en dólares. Ecuador está dolarizado: los décimos, los fondos y las vacaciones se calculan y se pagan en dólares, sin ajuste por inflación.',
  fields: [
    {
      id: 'sueldo',
      label: 'Remuneración mensual (USD)',
      prefix: '$',
      value: '800',
      thousands: true,
      help: `La remuneración que percibes cada mes. No puede ser menor a 1 SBU (${usd(SBU)}) a jornada completa.`,
    },
    {
      id: 'otros',
      label: 'Promedio mensual de horas extra y comisiones (USD)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Entra en la base del décimo tercero. No afecta al décimo cuarto, que siempre es un SBU.',
    },
    {
      id: 'meses',
      label: 'Meses trabajados en el período',
      type: 'number',
      value: 12,
      min: 0,
      max: 12,
      step: 1,
      help: 'Si trabajaste el período completo, deja 12. Con menos meses, el décimo se paga proporcional.',
    },
    {
      id: 'anios',
      label: 'Años cumplidos con este empleador',
      type: 'number',
      value: 1,
      min: 0,
      max: 45,
      step: 1,
      help: 'Define si te corresponden fondos de reserva (desde el mes 13) y cuántos días adicionales de vacaciones.',
    },
    {
      id: 'horasSemana',
      label: 'Horas semanales de tu jornada',
      type: 'number',
      value: 40,
      min: 1,
      max: 40,
      step: 1,
      help: 'A jornada parcial el décimo cuarto se prorratea sobre la jornada completa de 40 horas.',
    },
  ],
  fineprint: DISCLAIMER_LAB,

  chart: {
    type: 'donut',
    title: 'Tu paquete anual además del sueldo',
    caption:
      'Cuánto vale cada beneficio de ley en el año: el décimo tercero, el décimo cuarto de un SBU, los fondos de reserva del 8,33% y las vacaciones pagadas.',
  },
  breakdownTitle: 'Beneficio por beneficio',
  breakdownIntro:
    'Cada línea con su base de cálculo y el artículo del Código del Trabajo que la manda. Las fechas de pago del décimo cuarto cambian según la región.',

  faq: [
    {
      q: '¿Cuándo se paga el décimo cuarto sueldo en Ecuador?',
      a: 'Depende de la región donde prestas el servicio. En el régimen Costa e Insular se paga hasta el 15 de marzo, por el período que va del 1 de marzo al 28 o 29 de febrero. En el régimen Sierra y Amazonía se paga hasta el 15 de agosto, por el período del 1 de agosto al 31 de julio. Las fechas coinciden con el inicio del año lectivo de cada régimen, que es de donde viene el nombre de bono escolar.',
    },
    {
      q: '¿Cuánto es el décimo cuarto sueldo?',
      a: `Un Salario Básico Unificado completo: ${usd(SBU)} en el año en curso. No depende de cuánto ganes: cobra lo mismo quien gana el mínimo que quien gana cinco veces más. Si trabajaste menos del período completo, se paga proporcional a los meses; y si tu jornada es parcial, se prorratea sobre las 40 horas semanales de la jornada completa.`,
    },
    {
      q: '¿Cómo se calcula el décimo tercer sueldo?',
      a: 'Es un doceavo de todo lo percibido como remuneración entre el 1 de diciembre y el 30 de noviembre. Entran el sueldo, las horas suplementarias y extraordinarias y las comisiones; no entran los décimos anteriores, los viáticos ni las utilidades. Se paga hasta el 24 de diciembre, está exento de impuesto a la renta y no aporta al IESS.',
    },
    {
      q: '¿Los décimos pagan impuesto a la renta o aportan al IESS?',
      a: 'Ni una cosa ni la otra. El décimo tercero y el décimo cuarto están exentos del impuesto a la renta y no forman parte de la materia gravada del IESS, así que no se les descuenta el 9,45% ni generan aporte patronal. Es la razón por la que un décimo llega íntegro a tu cuenta mientras que un sueldo del mismo monto no.',
    },
    {
      q: '¿Desde cuándo me corresponden los fondos de reserva?',
      a: 'Desde el mes 13 con el mismo empleador, es decir después de cumplir un año completo de trabajo. La tasa es del 8,33% de la remuneración, que equivale a un sueldo más al año. Si cambias de empresa, el conteo arranca de cero con la nueva: la antigüedad no se suma entre empleadores para este beneficio.',
    },
    {
      q: '¿Me conviene cobrar los fondos de reserva mensualizados o acumularlos en el IESS?',
      a: 'Mensualizados los ves todos los meses en el rol y disponen de ellos de inmediato; acumulados quedan en tu cuenta individual del IESS, generan rendimiento y los retiras cuando quieras desde la plataforma del instituto. La opción se pide por escrito y se puede cambiar. Ojo con un detalle: los fondos mensualizados sí cuentan como ingreso gravado del impuesto a la renta.',
    },
    {
      q: '¿Cuántos días de vacaciones me tocan por año?',
      a: 'Quince días ininterrumpidos, contando los días no laborables, después de cumplir un año de trabajo continuo. A partir del sexto año se suma un día adicional por cada año que exceda de los cinco, con tope de 15 días adicionales: en el máximo se llega a 30 días. Los días adicionales el empleador puede pagarlos en dinero en vez de concederlos.',
    },
    {
      q: '¿Puedo acumular vacaciones de varios años?',
      a: 'Hasta dos períodos, y siempre que el empleador lo acepte. Del tercero en adelante no hay derecho a acumular: si no las gozaste, se pierden salvo pacto expreso. Distinto es el caso de la salida de la empresa: ahí las vacaciones no gozadas se liquidan en dinero en el finiquito, sin límite de períodos.',
    },
    {
      q: '¿Cómo se calcula el valor de un día de vacaciones?',
      a: 'Dividiendo la remuneración mensual entre 30, sin importar cuántos días tenga el mes. Ese valor día multiplicado por los días que te corresponden da el monto de las vacaciones. Si tienes remuneración variable, se toma el promedio de lo percibido en el año de servicio.',
    },
    {
      q: '¿Qué pasa si el empleador no paga el décimo a tiempo?',
      a: 'El incumplimiento se denuncia ante el Ministerio del Trabajo, que puede imponer multas al empleador además de ordenar el pago. Los plazos son de orden público: el 24 de diciembre para el décimo tercero y el 15 de marzo o el 15 de agosto para el décimo cuarto según la región. El trabajador también puede reclamar los décimos impagos en el juicio laboral junto con el resto de haberes.',
    },
    {
      q: '¿Si renuncio en la mitad del período pierdo el décimo?',
      a: 'No. Los décimos se pagan proporcionales a los meses efectivamente trabajados del período y se liquidan en el finiquito, junto con las vacaciones no gozadas. Lo mismo pasa con los fondos de reserva pendientes de depositar. Lo único que no corresponde en una renuncia es la indemnización por despido.',
    },
    {
      q: '¿El décimo cuarto cambia si trabajo medio tiempo?',
      a: 'Sí. El décimo cuarto se prorratea sobre la jornada completa de 40 horas semanales: quien trabaja 20 horas cobra la mitad de un SBU por el período completo. El décimo tercero, en cambio, no necesita prorrateo por jornada, porque ya se calcula sobre lo que efectivamente percibiste.',
    },
  ],

  sources: [
    { name: 'Ministerio del Trabajo — Código del Trabajo (arts. 69, 111 y 113)', url: 'https://www.trabajo.gob.ec/', publisher: 'Ministerio del Trabajo del Ecuador' },
    { name: 'Ministerio del Trabajo — Décimo tercera y décimo cuarta remuneración', url: 'https://www.trabajo.gob.ec/decimo-tercera-y-decimo-cuarta-remuneracion/', publisher: 'Ministerio del Trabajo del Ecuador' },
    { name: 'IESS — Fondos de reserva', url: 'https://www.iess.gob.ec/', publisher: 'Instituto Ecuatoriano de Seguridad Social' },
    { name: 'Ministerio del Trabajo — Salario Básico Unificado vigente', url: 'https://www.trabajo.gob.ec/salario-basico-unificado/', publisher: 'Ministerio del Trabajo del Ecuador' },
  ],

  replaces: [
    '/ec/calculadora-decimo-tercer-sueldo-ecuador',
    '/ec/calculadora-decimo-cuarto-sueldo-ecuador',
    '/ec/calculadora-fondos-de-reserva-ecuador',
    '/ec/calculadora-vacaciones-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
