import type { HubData } from '../types';
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  ANTICIPOS_ISR_DO,
} from '../../data/republica-dominicana-2026';

/**
 * Hub de decisión DO — "¿Qué le debo a la DGII por mi negocio?"
 *
 * ITBIS, ISR de sociedades, anticipos, retención de honorarios, impuesto a cheques
 * y transferencias, propina legal y recargos por mora, en una sola cuenta.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** ITBIS: 18% general, 16% reducida (Ley 253-12). */
export const ITBIS = RD.itbis;
export const ITBIS_REDUCIDO = RD.itbisReducido;

/** ISR de personas jurídicas: 27% sobre la renta neta imponible (Art. 297). */
export const TASA_ISR_SOCIEDADES = 0.27;

/** Anticipos: umbral de Tasa Efectiva de Tributación y cuotas (DGII, Guía 12). */
export const ANTICIPOS = ANTICIPOS_ISR_DO;

/** Retención de ISR sobre honorarios profesionales a personas físicas (Art. 309). */
export const RETENCION_HONORARIOS = 0.10;

/**
 * Impuesto a cheques y transferencias electrónicas (ITF).
 * ⚠️ La Ley 30-26 elevó la tasa de 0,15% a 0,20% desde el 3-jul-2026.
 */
export const ITF = { tasa: 0.0020, tasaAnterior: 0.0015, desde: '2026-07-03' };

/** Propina legal del 10% en restaurantes (Art. 228 Cód. de Trabajo). No es impuesto. */
export const PROPINA_LEGAL = 0.10;

/** Mora DGII: 10% el primer mes + 4% por mes adicional (Art. 252) e interés 1,10% mensual (Art. 27). */
export const MORA = { primerMes: 0.10, mesAdicional: 0.04, interesMensual: 0.011 };

const dop = (n: number) => 'RD$ ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'do/impuestos/negocio-dgii',
  title: 'Impuestos DGII de tu negocio: ITBIS, ISR, anticipos, retenciones y mora',
  description:
    'Calculá lo que le debés a la DGII: ITBIS del 18% a pagar, ISR de sociedades del 27%, anticipo mensual según la TET, retención del 10% sobre honorarios, impuesto a cheques y recargos por mora.',
  silo: 'Impuestos',
  siloHref: '/do/impuestos',
  locale: 'do',

  eyebrow: 'República Dominicana · DGII · Ley 11-92',
  h1: 'Qué le debe tu negocio a la DGII, mes a mes y al cierre.',
  lede:
    'ITBIS mensual, ISR anual, anticipos, retenciones a terceros y el impuesto a las transferencias son cinco obligaciones distintas con vencimientos distintos. Esta cuenta las junta y te dice cuánto sale cada una con tus números, y cuánto se encarece si te atrasás.',
  stamps: [
    'ITBIS 18% · ISR sociedades 27%',
    'Anticipos: umbral de TET 1,5%',
    '8 calculadoras adentro',
  ],

  resultLabel: 'A pagar a la DGII este mes',

  cases: {
    title: '¿Qué tipo de contribuyente sos?',
    intro:
      'La DGII trata muy distinto a una sociedad, a un profesional que factura honorarios y a un negocio de consumo en local.',
    items: [
      {
        id: 'sociedad',
        label: 'Tengo una sociedad (SRL, SA)',
        hint: 'Persona jurídica · ISR 27%',
        answer: 'Pagás ITBIS todos los meses, anticipos todos los meses e ISR al cierre.',
        yes: [
          'ITBIS: 18% sobre las ventas gravadas, menos el ITBIS adelantado en tus compras',
          'ISR: ' + Math.round(TASA_ISR_SOCIEDADES * 100) + '% sobre la renta neta imponible (ingresos − gastos deducibles)',
          'Anticipos mensuales del ISR, que se acreditan contra el impuesto del año',
          'Retenciones que hacés vos como agente: honorarios, alquileres, dividendos',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Existe además un impuesto mínimo del 1% sobre los activos: si el ISR liquidado da menos que ese 1%, se paga el mayor de los dos',
          'Un gasto sin comprobante fiscal válido (NCF) no es deducible: la factura informal te sube el ISR',
        ],
        plazo: 'ITBIS y anticipos vencen el día 20 de cada mes; la declaración anual del ISR, 120 días después del cierre.',
      },
      {
        id: 'profesional',
        label: 'Facturo honorarios como persona física',
        hint: 'Servicios profesionales · Art. 309',
        answer: 'Te retienen 10% de ISR y, si facturás con ITBIS, el 100% del ITBIS.',
        yes: [
          'Retención del ' + Math.round(RETENCION_HONORARIOS * 100) + '% de ISR sobre tus honorarios, que hace quien te paga',
          'Si facturás con ITBIS, el pagador retiene el 100% de ese ITBIS (Norma 02-05)',
          'La retención es un adelanto: se acredita contra tu ISR anual por la escala progresiva',
          'Podés deducir los gastos reales de tu actividad al declarar',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La retención del 10% no cierra tu obligación: si tus honorarios anuales son altos, la escala del ISR puede dar más que lo retenido y quedás con saldo a pagar',
          'Pedí siempre el comprobante de retención: sin él no podés acreditarla en la declaración',
        ],
        plazo: 'la declaración anual de persona física (IR-1) vence el 31 de marzo.',
      },
      {
        id: 'consumo',
        label: 'Tengo un restaurante o negocio de consumo en local',
        hint: 'Propina legal + ITBIS',
        answer: 'Sobre el consumo van dos adicionales distintos: 10% de propina y 18% de ITBIS.',
        yes: [
          'Propina legal del ' + Math.round(PROPINA_LEGAL * 100) + '%: es un beneficio laboral del personal, no un impuesto, y no va para la empresa',
          'ITBIS del 18% sobre el consumo, calculado sobre la base SIN propina',
          'La cuenta final del cliente equivale al consumo × 1,28',
          'El 10% legal no computa para prestaciones laborales ni para la regalía',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La Suprema Corte fijó que el 10% legal sólo aplica al consumo dentro del establecimiento: no corresponde en delivery ni para llevar',
          'Cobrar ITBIS sobre la propina es un error: la propina no forma parte de la base imponible',
        ],
        plazo: 'el ITBIS cobrado se declara y paga hasta el día 20 del mes siguiente.',
      },
      {
        id: 'mora',
        label: 'Me atrasé con un pago',
        hint: 'Recargos del Art. 252 e intereses del Art. 27',
        answer: 'El primer mes suma 10% y cada mes adicional 4%, más 1,10% de interés mensual.',
        yes: [
          'Recargo por mora: ' + Math.round(MORA.primerMes * 100) + '% el primer mes o fracción',
          'Más ' + Math.round(MORA.mesAdicional * 100) + '% por cada mes o fracción adicional',
          'Interés indemnizatorio del ' + (MORA.interesMensual * 100).toFixed(2).replace('.', ',') + '% mensual sobre el impuesto',
          'Cada fracción de mes cuenta como mes completo: un día de atraso ya activa el recargo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Declarar y no pagar es mucho mejor que no declarar: la omisión de declaración tiene sanciones propias además del recargo',
          'La DGII ofrece acuerdos de pago, pero se solicitan antes de que el expediente pase a cobro coactivo',
        ],
        plazo: 'el recargo corre desde el día siguiente al vencimiento, sin período de gracia.',
      },
    ],
  },

  inputsTitle: 'Los números de tu negocio',
  inputsIntro: 'Ventas y compras del mes, resultados del año y, si te atrasaste, los meses de retraso. Todo en pesos dominicanos.',
  fields: [
    {
      id: 'ventasGravadas',
      label: 'Ventas gravadas del mes, sin ITBIS (RD$)',
      prefix: 'RD$',
      value: 1200000,
      thousands: true,
      help: 'Facturación del mes sujeta a ITBIS, antes de sumarle el impuesto.',
    },
    {
      id: 'comprasGravadas',
      label: 'Compras y gastos gravados del mes (RD$)',
      prefix: 'RD$',
      value: 700000,
      thousands: true,
      help: 'Compras con comprobante fiscal válido: generan ITBIS adelantado que se descuenta.',
    },
    {
      id: 'ingresosAnuales',
      label: 'Ingresos brutos del año (RD$)',
      prefix: 'RD$',
      value: 14400000,
      thousands: true,
      help: 'Total facturado en el ejercicio. Base del cálculo de anticipos.',
    },
    {
      id: 'gastosDeducibles',
      label: 'Gastos y costos deducibles del año (RD$)',
      prefix: 'RD$',
      value: 11000000,
      thousands: true,
      help: 'Sólo lo respaldado con comprobante fiscal (NCF). Sin NCF no es deducible.',
    },
    {
      id: 'honorarios',
      label: 'Honorarios profesionales del mes (RD$)',
      prefix: 'RD$',
      value: '0',
      thousands: true,
      help: 'Lo que facturás como persona física, o lo que le pagás a un profesional y tenés que retener.',
    },
    {
      id: 'consumo',
      label: 'Consumo de una cuenta de restaurante (RD$)',
      prefix: 'RD$',
      value: '0',
      thousands: true,
      help: 'Comida y bebida, sin propina ni ITBIS. Sólo para el caso de negocio de consumo.',
    },
    {
      id: 'transferencias',
      label: 'Transferencias y cheques del mes (RD$)',
      prefix: 'RD$',
      value: 2000000,
      thousands: true,
      help: 'Monto total de operaciones bancarias gravadas por el ITF.',
    },
    {
      id: 'mesesAtraso',
      label: 'Meses de atraso en el pago',
      type: 'number',
      value: 0,
      min: 0,
      max: 60,
      step: 1,
      help: 'Cada fracción de mes cuenta como mes completo.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Composición de lo que le pagás a la DGII',
    caption:
      'El ITBIS es plata que cobraste a tus clientes y estás enterando; el anticipo es tu propio ISR pagado por adelantado. Distinguirlos evita el error clásico de gastarse el ITBIS cobrado.',
  },
  breakdownTitle: 'Obligación por obligación',
  breakdownIntro:
    'ITBIS del mes, ISR del año, anticipos, retenciones y recargos. Montos en pesos dominicanos.',

  faq: [
    {
      q: '¿Cómo se calcula el ITBIS a pagar?',
      a: 'Es la diferencia entre el ITBIS que cobraste en tus ventas (débito fiscal) y el que pagaste en tus compras gravadas con comprobante fiscal válido (crédito fiscal o "ITBIS adelantado"). Si el débito es mayor, la diferencia se paga; si el crédito es mayor, queda un saldo a favor que se arrastra al mes siguiente. La tasa general es 18% y la reducida 16% para yogurt, mantequilla, café, aceites comestibles, azúcares y cacao.',
    },
    {
      q: '¿Qué está exento de ITBIS?',
      a: 'Los bienes de la canasta básica, medicamentos, servicios de salud, educación, transporte terrestre de personas, alquiler de vivienda, servicios financieros y de seguros, y las exportaciones, que van a tasa cero. La diferencia entre exento y tasa cero importa: el exportador con tasa cero puede recuperar su ITBIS adelantado, el exento no.',
    },
    {
      q: '¿Cuánto paga de ISR una sociedad?',
      a: `El ${Math.round(TASA_ISR_SOCIEDADES * 100)}% sobre la renta neta imponible, que es la diferencia entre ingresos gravados y gastos y costos deducibles, según el Art. 297 del Código Tributario. Existe además un impuesto mínimo del 1% sobre los activos: si el ISR liquidado queda por debajo, se paga el mayor de los dos. Las empresas que recién arrancan o que operan con márgenes muy finos suelen chocar con ese piso.`,
    },
    {
      q: '¿Cómo se calculan los anticipos del ISR?',
      a: `Depende de tu Tasa Efectiva de Tributación, que es el ISR liquidado dividido por los ingresos brutos del año anterior. Si la TET supera el ${(ANTICIPOS.umbralTet * 100).toFixed(1).replace('.', ',')}%, el anticipo mensual es el ISR liquidado dividido en ${ANTICIPOS.cuotas} cuotas. Si la TET es igual o menor, el anticipo se calcula sobre el ${(ANTICIPOS.umbralTet * 100).toFixed(1).replace('.', ',')}% de los ingresos brutos, también dividido en ${ANTICIPOS.cuotas}. El saldo a favor de la declaración anterior se descuenta de la base.`,
    },
    {
      q: '¿Los anticipos son un impuesto extra?',
      a: 'No: son tu propio ISR pagado por adelantado. Todo lo que anticipaste durante el año se acredita contra el impuesto liquidado en la declaración anual. Lo que sí puede pasar es que anticipes de más y quedes con saldo a favor, que después compensás con otras obligaciones o pedís en devolución.',
    },
    {
      q: '¿Cuánto se retiene por honorarios profesionales?',
      a: `El ${Math.round(RETENCION_HONORARIOS * 100)}% de ISR sobre el monto de los honorarios, según el Art. 309. Además, si el profesional es persona física y factura con ITBIS, el pagador retiene el 100% de ese ITBIS por la Norma 02-05. Para el profesional la retención de ISR es un adelanto acreditable en su declaración anual; el ITBIS retenido, en cambio, nunca pasa por sus manos.`,
    },
    {
      q: '¿Cuánto es el impuesto a cheques y transferencias?',
      a: `Hoy es del ${(ITF.tasa * 100).toFixed(2).replace('.', ',')}%, o sea RD$2 por cada RD$1.000 de operación gravada. La Ley 30-26 lo subió desde el ${(ITF.tasaAnterior * 100).toFixed(2).replace('.', ',')}% en julio. Lo retiene la entidad financiera y lo entera a la DGII. Quedan exentos, entre otros, los traspasos entre cuentas del mismo titular, los retiros por cajero, la nómina de la seguridad social, los pagos de tarjeta de crédito y los pagos de impuestos al Estado.`,
    },
    {
      q: '¿Cuánto se encarece un impuesto si me atraso?',
      a: `El recargo por mora del Art. 252 es del ${Math.round(MORA.primerMes * 100)}% el primer mes o fracción, más ${Math.round(MORA.mesAdicional * 100)}% por cada mes o fracción adicional, y encima corre un interés indemnizatorio del ${(MORA.interesMensual * 100).toFixed(2).replace('.', ',')}% mensual. Seis meses de atraso agregan cerca de un 37% sobre el impuesto original. Y ojo: la fracción de mes cuenta como mes completo, así que un solo día de retraso ya activa el 10%.`,
    },
    {
      q: '¿La propina legal del 10% es un impuesto?',
      a: `No, y es el malentendido más común de la restauración dominicana. El 10% del Art. 228 del Código de Trabajo es un beneficio laboral que se reparte entre el personal de servicio: no lo cobra la DGII ni se queda en la empresa. El ITBIS del 18% sí es impuesto, y se calcula sobre el consumo sin incluir la propina. Por eso la cuenta final da consumo × 1,28.`,
    },
    {
      q: '¿Cuándo vencen las obligaciones de la DGII?',
      a: 'El ITBIS y las retenciones se declaran y pagan hasta el día 20 del mes siguiente. Los anticipos del ISR vencen el día 15 de cada mes. La declaración jurada anual del ISR de sociedades vence 120 días después del cierre del ejercicio, y la de personas físicas, el 31 de marzo. El IPI, en dos cuotas: 11 de marzo y 11 de septiembre.',
    },
    {
      q: '¿Qué pasa si un gasto no tiene comprobante fiscal?',
      a: 'No es deducible del ISR ni genera ITBIS adelantado. En la práctica, comprarle a un proveedor informal te sale mucho más caro de lo que parece: perdés el 18% de crédito de ITBIS y el 27% de deducción del ISR sobre ese gasto. Verificá siempre que el NCF sea válido y esté autorizado, porque un comprobante de una secuencia vencida se rechaza igual.',
    },
  ],

  sources: [
    {
      name: 'DGII — ITBIS: tasas, exenciones y declaración',
      url: 'https://dgii.gov.do/Paginas/inicio.aspx',
      publisher: 'Dirección General de Impuestos Internos',
    },
    {
      name: 'DGII — Guía 12: liquidación y pago de anticipos del ISR',
      url: 'https://dgii.gov.do/publicacionesOficiales/guiasContribuyente/Paginas/default.aspx',
      publisher: 'DGII',
    },
    {
      name: 'Código Tributario (Ley 11-92), arts. 27, 252, 297 y 309',
      url: 'https://dgii.gov.do/legislacion/codigoTributario/Documents/Codigo-Tributario.pdf',
      publisher: 'DGII',
    },
    {
      name: 'Código de Trabajo (Ley 16-92), art. 228 — propina legal del 10%',
      url: 'https://mt.gob.do/index.php/component/jdownloads/send/2-leyes/2-codigo-de-trabajo',
      publisher: 'Ministerio de Trabajo',
    },
    {
      name: 'DGII — calendario de obligaciones tributarias',
      url: 'https://dgii.gov.do/Paginas/inicio.aspx',
      publisher: 'DGII',
    },
  ],

  replaces: [
    '/do/calculadora-isr-empresas-sociedades-republica-dominicana',
    '/do/calculadora-anticipos-isr-dgii-republica-dominicana',
    '/do/calculadora-itbis-republica-dominicana',
    '/do/calculadora-retencion-honorarios-servicios-profesionales-republica-dominicana',
    '/do/calculadora-mora-recargos-dgii-republica-dominicana',
    '/do/calculadora-propina-legal-10-itbis-restaurante-republica-dominicana',
    '/do/calculadora-impuesto-cheques-transferencias-republica-dominicana',
    '/do/calculadora-impuesto-premios-loteria-republica-dominicana',
  ],

  lastReviewed: '2026-07-28',
};
