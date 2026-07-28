import type { HubData } from '../types';
import {
  GANANCIA_CAPITAL_DO,
  REPUBLICA_DOMINICANA_2026 as RD,
} from '../../data/republica-dominicana-2026';

/**
 * Hub de decisión DO — "Comprar, tener o vender una propiedad en República Dominicana:
 * cuánta plata necesito y qué impuestos hay en el camino."
 *
 * Reúne las cuatro cuentas que aparecen alrededor de un inmueble dominicano: la
 * cuota del préstamo hipotecario, los gastos de cierre (impuesto de transferencia
 * del 3% + honorarios legales + registro), el IPI anual del 1% sobre el excedente
 * exento, y el impuesto a la ganancia de capital al vender.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Impuesto de transferencia inmobiliaria (Ley 288-04): 3% sobre el mayor valor. */
export const TASA_TRANSFERENCIA = 0.03;

/**
 * IPI — Impuesto al Patrimonio Inmobiliario (Ley 18-88). 1% sobre el excedente del
 * mínimo exento, que la DGII ajusta cada año por inflación. Se paga en dos cuotas
 * (11 de marzo y 11 de septiembre).
 * ⚠️ El mínimo exento es un valor ANUAL que publica la DGII por resolución: viene
 * del calc vivo (ipi-republica-dominicana.ts) y hay que revisarlo cada enero.
 */
export const IPI = {
  exento: 10_695_494,
  tasa: 0.01,
  cuotas: 2,
};

/** Tasa de la ganancia de capital para personas jurídicas (Art. 289 Cód. Tributario). */
export const GANANCIA_CAPITAL = GANANCIA_CAPITAL_DO;

/**
 * Escala anual del ISR (Art. 296): la ganancia de capital de una persona física se
 * integra a la renta y tributa por acá. `Infinity` → null para `define:vars`.
 */
export const ISR_TRAMOS = RD.isr.tramos.map((t) => ({
  desde: t.desde,
  hasta: Number.isFinite(t.hasta) ? t.hasta : null,
  cuotaFija: t.cuotaFija,
  tasa: t.tasa,
}));
export const ISR_EXENCION_ANUAL = RD.isr.exencionAnual;

const dop = (n: number) => 'RD$ ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'do/impuestos/comprar-vivienda',
  title: 'Comprar vivienda en República Dominicana: cuota, gastos de cierre e impuestos',
  description:
    'Cuánto necesitás para cerrar la compra de un inmueble en RD$: inicial, cuota hipotecaria, impuesto de transferencia del 3%, honorarios legales, IPI anual del 1% y ganancia de capital al vender.',
  silo: 'Impuestos',
  siloHref: '/do/impuestos',
  locale: 'do',

  eyebrow: 'República Dominicana · DGII · inmuebles',
  h1: 'Comprar, tener y vender una propiedad: la cuenta completa.',
  lede:
    'El precio del inmueble es sólo el principio. Al cerrar pagás el 3% de transferencia más honorarios y registro; mientras sos dueño, el IPI del 1% sobre lo que pase del mínimo exento; y al vender, la ganancia de capital. Todo junto, en una sola cuenta.',
  stamps: [
    'Transferencia 3% · IPI 1% anual',
    `Mínimo exento del IPI: ${dop(IPI.exento)}`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Efectivo que necesitás para cerrar',

  cases: {
    title: '¿En qué momento estás?',
    intro:
      'Comprar financiado, comprar al contado, mantener el inmueble o venderlo son cuatro cuentas distintas sobre el mismo bien.',
    items: [
      {
        id: 'hipoteca',
        label: 'Compro con préstamo hipotecario',
        hint: 'Inicial + cuota + gastos de cierre',
        answer: 'Necesitás el inicial más los gastos de cierre: nunca se financian.',
        yes: [
          'Pago inicial: los bancos dominicanos suelen exigir entre 20% y 30% del valor',
          'Impuesto de transferencia del 3% sobre el mayor entre el precio y la tasación de la DGII',
          'Honorarios legales, deslinde, certificaciones y registro de título',
          'Cuota mensual por sistema francés durante todo el plazo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los gastos de cierre no entran en el préstamo: tenés que tenerlos en efectivo el día de la firma',
          'Las tasas hipotecarias dominicanas son variables en la mayoría de los contratos: una subida de tasa mueve la cuota durante toda la vida del crédito',
          'Verificá que el inmueble tenga deslinde individual y certificado de título limpio antes de pagar nada',
        ],
        plazo: 'el impuesto de transferencia se paga al presentar el expediente en la DGII, antes del registro.',
      },
      {
        id: 'contado',
        label: 'Compro al contado',
        hint: 'Sin financiamiento',
        answer: 'Sin cuota, pero los gastos de cierre y el 3% se pagan igual.',
        yes: [
          'El 3% de transferencia sobre el mayor valor entre precio y tasación de la DGII',
          'Honorarios legales y gastos de registro',
          'A partir de la compra, el IPI anual si el inmueble supera el mínimo exento',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La DGII puede tasar por encima del precio del contrato: el 3% se calcula sobre el mayor de los dos, no sobre lo que pagaste',
          'Comprar en efectivo no exime de justificar el origen de los fondos ante la entidad y la UAF',
        ],
        plazo: 'el traspaso no se inscribe hasta que el impuesto esté pagado: no dejes el trámite a medias.',
      },
      {
        id: 'propietario',
        label: 'Ya soy dueño y quiero saber cuánto pago de IPI',
        hint: 'Impuesto al Patrimonio Inmobiliario',
        answer: 'El 1% anual sobre lo que exceda el mínimo exento, en dos cuotas.',
        yes: [
          'Se grava el excedente del valor sobre ' + dop(IPI.exento) + ', no el valor total',
          'Tasa del 1% anual, pagadera en dos cuotas: 11 de marzo y 11 de septiembre',
          'Mayores de 65 años cuyo único patrimonio inmobiliario sea su vivienda: exentos',
          'Pensionados y rentistas de fuente extranjera (Ley 171-07): descuento del 50%',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El mínimo exento se ajusta cada año por inflación mediante resolución de la DGII: confirmá el valor vigente antes de presupuestar',
          'Para personas físicas el mínimo exento aplica al conjunto de los inmuebles, no a cada uno por separado',
        ],
        plazo: 'las cuotas vencen el 11 de marzo y el 11 de septiembre de cada año.',
      },
      {
        id: 'venta',
        label: 'Voy a vender',
        hint: 'Ganancia de capital · Art. 289',
        answer: 'Tributás sobre la ganancia real, no sobre el precio de venta.',
        yes: [
          'Ganancia = precio de venta − costo de adquisición ajustado por inflación − gastos y mejoras',
          'El multiplicador de ajuste lo publica la DGII cada año según el año de compra',
          'Persona jurídica: ' + Math.round(GANANCIA_CAPITAL.tasaPersonaJuridica * 100) + '% fijo sobre la ganancia',
          'Persona física: la ganancia se integra a la renta y tributa por la escala progresiva del ISR',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El multiplicador correcto depende del año de adquisición y sale de la resolución anual de la DGII: si dejás 1 estás calculando sin ajuste y te va a dar un impuesto mayor al real',
          'El 3% de transferencia lo paga el comprador y es un impuesto distinto: no se compensa con la ganancia de capital',
          'Guardá facturas de las mejoras: sin soporte la DGII no las acepta como aumento del costo',
        ],
        plazo: 'la ganancia se declara en la declaración jurada anual del año en que se realizó la venta.',
      },
    ],
  },

  inputsTitle: 'El inmueble y las condiciones',
  inputsIntro: 'Todo en pesos dominicanos. Si vendés, usá el precio de venta en el primer campo.',
  fields: [
    {
      id: 'precio',
      label: 'Precio del inmueble (RD$)',
      prefix: 'RD$',
      value: 6500000,
      thousands: true,
      help: 'Precio del contrato de compraventa. Si estás vendiendo, el precio de venta.',
    },
    {
      id: 'valorDgii',
      label: 'Valor tasado por la DGII (RD$)',
      prefix: 'RD$',
      value: '0',
      thousands: true,
      help: 'El 3% se aplica sobre el mayor entre este valor y el precio. Dejá 0 si no lo conocés.',
    },
    {
      id: 'inicialPct',
      label: 'Pago inicial (%)',
      type: 'number',
      value: 20,
      min: 0,
      max: 100,
      step: 1,
      suffix: '%',
      help: 'Porcentaje del precio que ponés de tu bolsillo. Los bancos suelen pedir 20% a 30%.',
    },
    {
      id: 'tasa',
      label: 'Tasa anual del préstamo (%)',
      type: 'number',
      value: 11,
      min: 0,
      max: 40,
      step: 0.25,
      suffix: '%',
      help: 'Tasa nominal anual. En el mercado dominicano las hipotecarias rondan el 9% al 13%.',
    },
    {
      id: 'plazo',
      label: 'Plazo del préstamo (años)',
      type: 'number',
      value: 20,
      min: 1,
      max: 40,
      step: 1,
      help: 'Plazo en años del crédito hipotecario.',
    },
    {
      id: 'honorariosPct',
      label: 'Honorarios legales (%)',
      type: 'number',
      value: 1,
      min: 0,
      max: 10,
      step: 0.25,
      suffix: '%',
      help: 'Honorarios del abogado sobre el precio. Lo habitual es entre 1% y 1,5%.',
    },
    {
      id: 'otrosGastos',
      label: 'Deslinde, certificaciones y registro (RD$)',
      prefix: 'RD$',
      value: 60000,
      thousands: true,
      help: 'Gastos administrativos del traspaso, aparte del impuesto y los honorarios.',
    },
    {
      id: 'costoAdquisicion',
      label: 'Costo de adquisición, si estás vendiendo (RD$)',
      prefix: 'RD$',
      value: 3500000,
      thousands: true,
      help: 'Lo que pagaste cuando lo compraste. Se ajusta por el multiplicador de la DGII.',
    },
    {
      id: 'multiplicador',
      label: 'Multiplicador de ajuste por inflación (DGII)',
      type: 'number',
      value: 1,
      min: 1,
      max: 10,
      step: 0.01,
      help: 'Lo publica la DGII cada año según el año de compra. Con 1 no hay ajuste.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde va la plata al cerrar la operación',
    caption:
      'El inicial es tuyo y queda dentro del inmueble; el impuesto de transferencia, los honorarios y el registro son gasto puro que no se recupera. Compará el tamaño real de esos costos antes de firmar.',
  },
  breakdownTitle: 'Cierre, tenencia y venta',
  breakdownIntro:
    'Primero lo que necesitás el día de la firma, después el costo anual de tener el inmueble y por último el impuesto si lo vendés. Montos en pesos dominicanos.',

  faq: [
    {
      q: '¿Cuánto es el impuesto de transferencia inmobiliaria?',
      a: 'El 3% del valor del inmueble, según la Ley 288-04. La base no es el precio que pagaste sino el mayor entre el precio del contrato y el valor que tasa la DGII. Lo paga el comprador y hay que pagarlo antes de inscribir el traspaso en el Registro de Títulos: sin ese pago la propiedad no cambia de nombre.',
    },
    {
      q: '¿Cuánto suman en total los gastos de cierre?',
      a: 'En la práctica dominicana, entre 4% y 6% del precio: el 3% de transferencia, entre 1% y 1,5% de honorarios legales y un remanente de deslinde, certificaciones y tasas de registro. Sobre un inmueble de seis millones y medio de pesos eso son entre RD$260.000 y RD$390.000 que hay que tener en efectivo el día de la firma, porque no se financian.',
    },
    {
      q: '¿Qué es el IPI y desde qué valor se paga?',
      a: `El Impuesto al Patrimonio Inmobiliario grava con el 1% anual el excedente del valor de tus inmuebles por encima del mínimo exento, que hoy está en ${dop(IPI.exento)}. Ojo con esto porque confunde a mucha gente: no se grava el valor total, sólo lo que pasa del mínimo. Un inmueble justo por encima del exento paga muy poco. Se paga en dos cuotas, el 11 de marzo y el 11 de septiembre.`,
    },
    {
      q: '¿Quién está exento del IPI?',
      a: 'Las personas mayores de 65 años cuyo único patrimonio inmobiliario sea la vivienda que habitan quedan exentas por completo. Los pensionados y rentistas de fuente extranjera acogidos a la Ley 171-07 tienen un descuento del 50%. También hay exenciones para inmuebles rurales dedicados a explotación agropecuaria bajo ciertas condiciones.',
    },
    {
      q: '¿Cómo se calcula la ganancia de capital al vender?',
      a: `Se resta del precio de venta el costo de adquisición ajustado por inflación, más los gastos y mejoras con soporte documental. El ajuste se hace con un multiplicador que la DGII publica cada año por resolución, según el IPC del Banco Central y el año en que compraste. Si sos persona jurídica pagás ${Math.round(GANANCIA_CAPITAL.tasaPersonaJuridica * 100)}% sobre esa ganancia; si sos persona física, la ganancia se integra a tu renta y pasa por la escala progresiva del ISR.`,
    },
    {
      q: '¿Por qué importa tanto el multiplicador de inflación?',
      a: 'Porque sin él estarías pagando impuesto sobre una ganancia nominal que en buena parte es sólo inflación. Un inmueble comprado hace diez años vale más en pesos aunque no haya subido nada en términos reales. El multiplicador de la DGII convierte el costo histórico a pesos de hoy: usarlo puede reducir el impuesto de forma sustancial, y no usarlo es regalarle plata al fisco.',
    },
    {
      q: '¿Cuánto inicial piden los bancos dominicanos?',
      a: 'Lo habitual es entre 20% y 30% del valor de tasación, aunque hay programas de vivienda de bajo costo con condiciones mejores. Ojo con un detalle: el banco presta sobre el valor de tasación, no sobre el precio que negociaste. Si la tasación queda por debajo del precio, la diferencia la tenés que poner vos además del inicial.',
    },
    {
      q: '¿La cuota que me da esta cuenta es la que voy a pagar?',
      a: 'Es la cuota de capital e intereses por sistema francés. La cuota real del banco suele incluir además el seguro de vida sobre saldo deudor y el seguro de incendio del inmueble, que juntos pueden agregar bastante. Pedí siempre la tabla de amortización completa y el costo total del crédito antes de firmar.',
    },
    {
      q: '¿Se puede pagar el 3% en cuotas?',
      a: 'No: el impuesto de transferencia se liquida y se paga de una sola vez al presentar el expediente. Lo que sí existe es un plazo: se cuenta desde la fecha del acto de venta, y pasado ese plazo la DGII aplica recargos por mora del 10% el primer mes y 4% por cada mes adicional, más interés indemnizatorio.',
    },
    {
      q: '¿Qué documentos hay que revisar antes de comprar?',
      a: 'El certificado de título a nombre del vendedor, la certificación de estado jurídico del inmueble emitida por el Registro de Títulos —que muestra si hay hipotecas, oposiciones o litis—, el deslinde individual de la parcela y la constancia de que el IPI está al día. Un inmueble sin deslinde individual es mucho más difícil de hipotecar y de revender.',
    },
    {
      q: '¿Un extranjero puede comprar una propiedad en República Dominicana?',
      a: 'Sí, sin restricciones especiales respecto de los dominicanos para inmuebles urbanos. Se necesita pasaporte y, para el registro, un número de identificación tributaria (RNC) que la DGII emite a extranjeros. Los pensionados y rentistas extranjeros acogidos a la Ley 171-07 acceden además a beneficios fiscales, entre ellos el descuento del 50% en el IPI.',
    },
  ],

  sources: [
    {
      name: 'DGII — Impuesto sobre Transferencias Inmobiliarias',
      url: 'https://dgii.gov.do/Paginas/inicio.aspx',
      publisher: 'Dirección General de Impuestos Internos',
    },
    {
      name: 'DGII — Impuesto al Patrimonio Inmobiliario (IPI)',
      url: 'https://dgii.gov.do/Paginas/inicio.aspx',
      publisher: 'Dirección General de Impuestos Internos',
    },
    {
      name: 'Código Tributario (Ley 11-92), art. 289 — ganancias de capital y ajuste por inflación',
      url: 'https://dgii.gov.do/legislacion/codigoTributario/Documents/Codigo-Tributario.pdf',
      publisher: 'DGII',
    },
    {
      name: 'Registro de Títulos — Jurisdicción Inmobiliaria',
      url: 'https://ji.gob.do/',
      publisher: 'Poder Judicial de la República Dominicana',
    },
    {
      name: 'Superintendencia de Bancos — información de préstamos hipotecarios',
      url: 'https://sb.gob.do/',
      publisher: 'Superintendencia de Bancos',
    },
  ],

  replaces: [
    '/do/calculadora-impuesto-transferencia-inmobiliaria-republica-dominicana',
    '/do/calculadora-gastos-cierre-compra-vivienda-republica-dominicana',
    '/do/calculadora-ipi-republica-dominicana',
    '/do/calculadora-ganancia-capital-venta-inmueble-dgii-republica-dominicana',
    '/do/calculadora-prestamo-hipotecario-republica-dominicana',
    '/do/calculadora-impuesto-sucesiones-herencia-republica-dominicana',
  ],

  lastReviewed: '2026-07-28',
};
