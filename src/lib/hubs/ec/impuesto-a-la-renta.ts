import type { HubData } from '../types';
import { ECUADOR_2026, CANASTA_INEC_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "Impuesto a la renta: ¿cuánto pago y cuánto me retienen?"
 *
 * Absorbe impuesto-renta-ecuador, rebaja-gastos-personales-ecuador,
 * retencion-fuente-dependencia-ecuador, retencion-honorarios-profesionales-ecuador
 * y multa-interes-mora-sri-ecuador.
 *
 * Mecánica ecuatoriana (NO es la peruana ni la colombiana): la tabla del IR de
 * personas naturales funciona con fracción básica + impuesto sobre la fracción
 * básica + porcentaje sobre el excedente. La rebaja por gastos personales NO baja
 * la base imponible: es un crédito del 18% que se resta del impuesto CAUSADO, con
 * tope en canastas familiares básicas según el número de cargas familiares.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Tabla de IR de personas naturales — Resol. SRI NAC-DGERCGC25-00000043. */
export const IR_TABLA = ECUADOR_2026.irTabla.map((t) => ({
  desde: t.desde,
  hasta: Number.isFinite(t.hasta) ? t.hasta : null,
  base: t.base,
  pct: t.pct,
}));

export const FRACCION_BASICA = ECUADOR_2026.irFraccionBasicaDesgravada;
export const IESS_PERSONAL = ECUADOR_2026.iessPersonal;
export const PCT_REBAJA = ECUADOR_2026.rebajaGastosPersonales;
export const IVA = ECUADOR_2026.iva;
export const ANIO = ECUADOR_2026.anio;

/**
 * Canasta Familiar Básica del INEC, base del tope de gastos personales.
 * La fórmula vieja tenía $821,80 hardcodeada, que no coincide con ninguna
 * canasta publicada en el repo. Usamos la del dato vivo del INEC.
 */
export const CANASTA_BASICA = CANASTA_INEC_2026.basicaFamiliar;
export const CANASTA_MES = CANASTA_INEC_2026.mesReferencia;

/** Canastas básicas de tope de gastos personales según cargas familiares. */
export const CANASTAS_POR_CARGAS: Record<string, number> = {
  '0': 7,
  '1': 9,
  '2': 11,
  '3': 14,
  '4': 17,
  '5': 20,
};

/** Retención en la fuente sobre honorarios: 10% persona natural, 5% sociedad. */
export const RET_HONORARIOS_NATURAL = 0.1;
export const RET_HONORARIOS_SOCIEDAD = 0.05;
/** Retención de IVA sobre honorarios profesionales pagados por un agente de retención. */
export const RET_IVA_HONORARIOS = 1.0;

/** Mora SRI: multa 3% mensual del impuesto causado, tope 100% (LRTI art. 100). */
export const MULTA_PCT_MENSUAL = 0.03;
export const MULTA_TOPE = 1.0;
/** Interés de mora: tasa trimestral que publica el SRI. Editable por el usuario. */
export const TASA_MORA_MENSUAL_DEFAULT = 0.647;

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/impuestos/impuesto-a-la-renta',
  title: 'Impuesto a la renta Ecuador 2026: tabla SRI y retenciones',
  description:
    'Calculá tu impuesto a la renta en Ecuador 2026 con la tabla vigente del SRI: retención en relación de dependencia, honorarios y rebaja por gastos.',
  silo: 'Impuestos',
  siloHref: '/ec/impuestos',
  locale: 'ec',

  eyebrow: 'Ecuador · SRI · persona natural',
  h1: 'Impuesto a la renta en Ecuador: cuánto pagas y cuánto te retienen.',
  lede:
    'La tabla del SRI no funciona con porcentajes sueltos: cada tramo tiene una fracción básica, un impuesto fijo sobre esa fracción y un porcentaje que solo grava el excedente. Encima va la rebaja por gastos personales, que no baja la base sino que se resta del impuesto ya calculado. Elige tu caso y la cuenta se arma sola.',
  stamps: [
    `Tabla IR ${ANIO} · Resol. SRI NAC-DGERCGC25-00000043`,
    `Fracción básica desgravada: ${usd(FRACCION_BASICA)}`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Impuesto a la renta del año',

  cases: {
    title: '¿De dónde vienen tus ingresos?',
    intro:
      'La tabla es la misma para todos, pero lo que puedes restar antes de llegar a ella cambia mucho según cómo cobres. Partimos del caso más frecuente.',
    items: [
      {
        id: 'dependencia',
        label: 'Estoy en relación de dependencia',
        hint: 'Sueldo en rol de pagos · retención en la fuente mensual',
        answer:
          'En dependencia el aporte personal al IESS sí baja la base imponible, y el empleador te retiene el impuesto proyectado repartido mes a mes.',
        yes: [
          `El aporte personal al IESS (${(IESS_PERSONAL * 100).toFixed(2).replace('.', ',')}%) se resta de la base imponible`,
          'El décimo tercero, el décimo cuarto y los fondos de reserva están exentos: no entran en la base',
          `Si la base imponible no supera la fracción básica desgravada (${usd(FRACCION_BASICA)}) el impuesto es cero`,
          'El empleador retiene el impuesto proyectado del año dividido en los meses que quedan del ejercicio',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Para que te descuenten la rebaja por gastos personales tienes que entregar el formulario de proyección de gastos a tu empleador al inicio del ejercicio; si no lo entregas, te retienen sin rebaja y recién la recuperas declarando',
          'Si tuviste más de un empleador en el año, ninguno vio el ingreso total: es muy probable que te falte pagar y tengas que presentar la declaración',
        ],
        plazo: 'la declaración de personas naturales se presenta en marzo, según el noveno dígito de la cédula o del RUC.',
      },
      {
        id: 'honorarios',
        label: 'Trabajo por honorarios profesionales',
        hint: 'Servicios profesionales · retención en la fuente por factura',
        answer: `A un profesional persona natural le retienen el ${RET_HONORARIOS_NATURAL * 100}% de renta en cada factura, y esa retención es crédito tributario contra el impuesto del año.`,
        yes: [
          `Retención en la fuente de renta del ${RET_HONORARIOS_NATURAL * 100}% sobre el honorario cuando el pagador es agente de retención`,
          `Si el pagador también es agente de retención de IVA, retiene el ${RET_IVA_HONORARIOS * 100}% del IVA de servicios profesionales`,
          'Todo lo retenido se acumula y se descuenta del impuesto causado en la declaración anual',
          'Los gastos personales entran igual: la rebaja del 18% no depende de si eres dependiente o independiente',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El aporte al IESS del afiliado sin relación de dependencia NO se resta de la base como el aporte del trabajador en relación de dependencia: la cuenta de acá no lo descuenta',
          'Como independiente puedes deducir además los gastos propios de la actividad, con factura y sustento: eso baja la base y esta estimación no lo incluye',
          'Si tus retenciones superan el impuesto del año queda saldo a favor, y hay que pedirlo o compensarlo: no vuelve solo',
        ],
        plazo: 'las facturas se declaran en el IVA mensual o semestral según tu régimen; la renta, en marzo.',
      },
      {
        id: 'gastos',
        label: 'Quiero calcular mi rebaja por gastos personales',
        hint: 'Crédito del 18% con tope en canastas básicas',
        answer:
          'La rebaja no baja la base imponible: es un crédito del 18% sobre tus gastos personales, topeado en canastas básicas según tus cargas familiares.',
        yes: [
          `Rebaja = ${PCT_REBAJA * 100}% del menor valor entre tus gastos personales del año y el tope en canastas básicas`,
          `Tope sin cargas familiares: 7 canastas (${usd(7 * CANASTA_BASICA)}); con 5 o más cargas: 20 canastas (${usd(20 * CANASTA_BASICA)})`,
          'Cuentan vivienda, educación y cultura, salud, alimentación y vestimenta, con comprobante válido a tu nombre',
          'Se resta del impuesto causado, así que nunca puede dejarte un impuesto negativo',
        ],
        warn: [
          DISCLAIMER_TAX,
          `La canasta que usa el tope la publica el INEC y se mueve todos los meses: acá se toma la de ${CANASTA_MES} (${usd(CANASTA_BASICA)}). Verifica la que el SRI declara aplicable a tu ejercicio antes de presentar`,
          'Los gastos de tus cargas familiares solo entran si esa persona no declara esos mismos gastos: no se pueden usar dos veces',
          'La rebaja tiene tope pero también techo real: si tu impuesto causado es cero, la rebaja no te devuelve nada',
        ],
        plazo: 'el anexo de gastos personales se presenta cuando los gastos superan el 50% de la fracción básica desgravada.',
      },
      {
        id: 'mora',
        label: 'Me atrasé con el SRI',
        hint: 'Multa 3% mensual + interés · LRTI art. 100',
        answer:
          'Declarar tarde con impuesto a pagar cuesta 3% del impuesto por mes o fracción, con tope del 100%, más el interés de mora.',
        yes: [
          `Multa del ${MULTA_PCT_MENSUAL * 100}% del impuesto causado por cada mes o fracción de retraso, con tope del ${MULTA_TOPE * 100}%`,
          'Interés de mora sobre el impuesto, con la tasa trimestral que publica el SRI, sin tope',
          'La multa se calcula sobre el impuesto causado, no sobre el saldo que te queda después de las retenciones',
          'Declarar por tu cuenta antes de que el SRI te notifique siempre sale más barato que esperar la liquidación',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si la declaración tardía NO tiene impuesto a pagar, la multa no se calcula sobre el impuesto: la norma usa otra base (un porcentaje de los ingresos brutos del período, con su propio tope). Esa variante no se estima acá',
          'La tasa de interés de mora la fija el SRI cada trimestre: la que viene cargada es un valor de referencia y hay que reemplazarla por la del trimestre de tu deuda',
          'La multa y el interés no se compensan con el saldo a favor de otros ejercicios de forma automática',
        ],
        plazo: 'la multa corre por mes o fracción: declarar el día 1 del mes siguiente ya suma un mes completo.',
      },
    ],
  },

  inputsTitle: 'Tus cifras del ejercicio',
  inputsIntro:
    'Todo en dólares y en valores anuales. Puedes dejar el ejemplo cargado y volver después con tus números reales.',
  fields: [
    {
      id: 'ingresoAnual',
      label: 'Ingresos gravados del año ($)',
      prefix: '$',
      value: '24.000',
      thousands: true,
      help: 'En dependencia, los 12 sueldos brutos (sin décimos ni fondos de reserva, que están exentos). Por honorarios, el total facturado antes de retenciones.',
    },
    {
      id: 'gastosPersonales',
      label: 'Gastos personales del año con comprobante ($)',
      prefix: '$',
      value: '6.000',
      thousands: true,
      help: 'Vivienda, educación y cultura, salud, alimentación y vestimenta. Solo con comprobante válido a tu nombre o de tus cargas familiares.',
    },
    {
      id: 'cargas',
      label: 'Cargas familiares que declaras',
      type: 'select',
      value: '0',
      options: [
        { value: '0', label: 'Ninguna — tope de 7 canastas' },
        { value: '1', label: '1 carga — tope de 9 canastas' },
        { value: '2', label: '2 cargas — tope de 11 canastas' },
        { value: '3', label: '3 cargas — tope de 14 canastas' },
        { value: '4', label: '4 cargas — tope de 17 canastas' },
        { value: '5', label: '5 o más cargas — tope de 20 canastas' },
      ],
      help: 'El número de cargas familiares mueve el tope de gastos personales, no el porcentaje de la rebaja.',
    },
    {
      id: 'retenciones',
      label: 'Retenciones en la fuente que ya te hicieron ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Lo que figura en tu formulario 107 (dependencia) o la suma de los comprobantes de retención de tus facturas.',
    },
    {
      id: 'mesesRetraso',
      label: 'Meses de retraso en la declaración',
      type: 'number',
      value: 0,
      min: 0,
      max: 120,
      step: 1,
      help: 'Solo para el caso de mora. Cuenta meses o fracción: 1 día de atraso ya es 1 mes.',
    },
    {
      id: 'tasaMora',
      label: 'Tasa de interés de mora mensual (%)',
      type: 'number',
      value: TASA_MORA_MENSUAL_DEFAULT,
      min: 0,
      max: 10,
      step: 0.001,
      help: 'La publica el SRI cada trimestre. El valor cargado es de referencia: reemplázalo por el del trimestre de tu deuda.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué pasa con cada dólar que ganaste',
    caption:
      'Compara la parte del ingreso que queda fuera del impuesto, lo que se lleva la seguridad social y lo que termina siendo impuesto a la renta.',
  },
  breakdownTitle: 'Cómo se arma tu impuesto, línea por línea',
  breakdownIntro:
    'El mismo orden del formulario del SRI: ingresos, deducciones, base imponible, tramo de la tabla, impuesto causado, rebaja y saldo.',

  faq: [
    {
      q: '¿Desde qué ingreso empiezo a pagar impuesto a la renta en Ecuador?',
      a: `Desde que tu base imponible anual supera la fracción básica desgravada, que en la tabla vigente es de ${usd(FRACCION_BASICA)}. En relación de dependencia la base ya viene descontado el aporte personal al IESS del ${(IESS_PERSONAL * 100).toFixed(2).replace('.', ',')}%, así que el sueldo bruto anual desde el que empiezas a pagar es algo más alto: alrededor de ${usd(FRACCION_BASICA / (1 - IESS_PERSONAL))} al año. Por debajo de eso el impuesto es cero, aunque igual puedes tener que declarar.`,
    },
    {
      q: '¿Cómo se lee la tabla del impuesto a la renta del SRI?',
      a: 'Cada fila tiene cuatro datos: la fracción básica (el piso del tramo), el techo del tramo, el impuesto fijo que se paga sobre la fracción básica y el porcentaje que se aplica solo al excedente. Buscas la fila donde cae tu base imponible, tomas el impuesto fijo de esa fila y le sumas el porcentaje aplicado a lo que pasa del piso. Por eso estar "en el tramo del 25%" nunca significa pagar el 25% de todo lo que ganas: ese porcentaje solo toca la parte que excede la fracción básica del tramo.',
    },
    {
      q: '¿La rebaja por gastos personales baja mi base imponible?',
      a: `No, y esa es la confusión más común. La rebaja no es una deducción de la base: es un crédito que se resta del impuesto ya calculado. Equivale al ${PCT_REBAJA * 100}% del menor valor entre los gastos personales que puedes sustentar y el tope en canastas familiares básicas que te corresponde según tus cargas familiares. Como se resta del impuesto causado, si tu impuesto es cero la rebaja no te genera devolución.`,
    },
    {
      q: '¿Cuál es el tope de gastos personales según mis cargas familiares?',
      a: `El tope se mide en canastas familiares básicas: 7 sin cargas, 9 con una, 11 con dos, 14 con tres, 17 con cuatro y 20 con cinco o más. Con la canasta de ${CANASTA_MES} (${usd(CANASTA_BASICA)}) eso da desde ${usd(7 * CANASTA_BASICA)} hasta ${usd(20 * CANASTA_BASICA)} de gastos computables. Si gastas más que el tope, la rebaja se calcula igual sobre el tope: el excedente no suma nada.`,
    },
    {
      q: '¿Qué ingresos están exentos y no entran en la base?',
      a: 'El décimo tercero, el décimo cuarto y los fondos de reserva no forman parte de la renta gravada. Tampoco los viáticos debidamente sustentados ni las indemnizaciones dentro de los límites legales. Lo que sí entra es el sueldo, las comisiones, las horas extra, los bonos y las utilidades que reparte la empresa. Si tu cálculo incluye los décimos en la base, te va a dar un impuesto más alto del que corresponde.',
    },
    {
      q: '¿Cuánto me retienen por honorarios profesionales?',
      a: `Cuando el que paga es agente de retención, la retención de renta sobre honorarios profesionales de una persona natural es del ${RET_HONORARIOS_NATURAL * 100}% del valor del servicio. Además, si es agente de retención de IVA, te retiene el ${RET_IVA_HONORARIOS * 100}% del IVA de la factura de servicios profesionales. Ninguna de las dos es un costo: son anticipos. La de renta se descuenta del impuesto del año y la de IVA, del IVA que declaras.`,
    },
    {
      q: '¿Los aportes al IESS se descuentan del impuesto a la renta?',
      a: `El aporte personal del trabajador en relación de dependencia (${(IESS_PERSONAL * 100).toFixed(2).replace('.', ',')}%) sí se resta de la base imponible antes de aplicar la tabla, y es una de las razones por las que el impuesto real es menor que el que sale de mirar solo el sueldo bruto. El aporte patronal no te toca a ti. En cambio, el aporte del afiliado voluntario o sin relación de dependencia no funciona igual: conviene confirmarlo con tu contador antes de restarlo.`,
    },
    {
      q: '¿Tengo que declarar si solo trabajo en relación de dependencia?',
      a: 'Si tuviste un solo empleador todo el año, tus ingresos son solo ese sueldo y el empleador te retuvo correctamente, no estás obligado a presentar la declaración de renta. Sí tienes que hacerlo si tuviste más de un empleador, si además facturaste por tu cuenta, si tienes otras rentas, o si quieres aplicar la rebaja por gastos personales que no le informaste a tiempo al empleador y recuperar lo retenido de más.',
    },
    {
      q: '¿Qué pasa si me retuvieron de más?',
      a: 'Queda saldo a favor. Se puede pedir la devolución al SRI o compensarlo contra el impuesto de ejercicios siguientes, según lo que elijas en la declaración. La devolución no es automática: hay que solicitarla y sustentarla con los comprobantes de retención. Por eso conviene guardar los comprobantes de retención de todo el año, especialmente si facturas por honorarios a varios clientes.',
    },
    {
      q: '¿Cuánto cuesta declarar tarde?',
      a: `Si la declaración tardía tiene impuesto a pagar, la multa es del ${MULTA_PCT_MENSUAL * 100}% del impuesto causado por cada mes o fracción de retraso, con tope del ${MULTA_TOPE * 100}% del impuesto (LRTI art. 100). A eso se suma el interés de mora, que corre con la tasa trimestral del SRI y no tiene tope. Si la declaración no arroja impuesto a pagar, la multa se calcula sobre otra base, con su propio tope. Presentar antes de que el SRI notifique siempre sale más barato.`,
    },
    {
      q: '¿Cuándo se presenta la declaración de renta de personas naturales?',
      a: 'En marzo del año siguiente al ejercicio, con el día exacto de vencimiento según el noveno dígito de la cédula o del RUC. Las sociedades declaran en abril, con la misma lógica de noveno dígito. Presentar el mismo día del vencimiento es riesgoso: si el sistema del SRI se satura y no logras enviar, la multa corre igual.',
    },
    {
      q: '¿La tabla del impuesto a la renta cambia todos los años?',
      a: 'Sí. El SRI actualiza los tramos cada ejercicio por la variación del índice de precios que publica el INEC, mediante resolución de fin de año. Por eso la fracción básica desgravada y los topes de cada tramo suben de un año al otro. Si estás calculando un ejercicio anterior, tienes que usar la tabla de ese año y no la vigente: son montos distintos.',
    },
  ],

  sources: [
    { name: 'SRI — Impuesto a la Renta', url: 'https://www.sri.gob.ec/impuesto-renta', publisher: 'Servicio de Rentas Internas' },
    { name: 'SRI — Tabla de impuesto a la renta de personas naturales (Resol. NAC-DGERCGC25-00000043)', url: 'https://www.sri.gob.ec/normativa-tributaria', publisher: 'Servicio de Rentas Internas' },
    { name: 'SRI — Gastos personales y rebaja del impuesto a la renta', url: 'https://www.sri.gob.ec/gastos-personales', publisher: 'Servicio de Rentas Internas' },
    { name: 'SRI — Retenciones en la fuente de impuesto a la renta', url: 'https://www.sri.gob.ec/retenciones-en-la-fuente', publisher: 'Servicio de Rentas Internas' },
    { name: 'INEC — Canastas analíticas básica y vital', url: 'https://www.ecuadorencifras.gob.ec/canasta/', publisher: 'Instituto Nacional de Estadística y Censos' },
    { name: 'IESS — Aportes del afiliado', url: 'https://www.iess.gob.ec/', publisher: 'Instituto Ecuatoriano de Seguridad Social' },
  ],

  replaces: [
    '/ec/calculadora-impuesto-renta-ecuador',
    '/ec/calculadora-rebaja-gastos-personales-ecuador',
    '/ec/calculadora-retencion-fuente-dependencia-ecuador',
    '/ec/calculadora-retencion-honorarios-profesionales-ecuador',
    '/ec/calculadora-multa-interes-mora-sri-ecuador',
  ],

  lastReviewed: '2026-08-16',
};
