import type { HubData } from './types';
import tasas from '../../data/live/tasas.json';
import billeteras from '../../data/live/tasas-billeteras.json';
import { INFLACION_INTERANUAL_PCT, INFLACION_AS_OF } from '../data/inflacion-serie-ar';
import inflacionData from '../../data/live/inflacion.json';

/**
 * Hub de decisión — "¿Cuánto gano con un plazo fijo?"
 * Arquetipo: RAMIFICADO. La pregunta es siempre la misma, pero el instrumento
 * cambia: plazo fijo tradicional, UVA precancelable, billetera/money market o
 * comparar bancos.
 *
 * Absorbe 6 calculadoras (ver hub.replaces).
 *
 * DATOS VIVOS — nada de tasas hardcodeadas:
 *  - TNA de plazo fijo a 30 días y BADLAR: src/data/live/tasas.json (BCRA,
 *    Estadísticas Monetarias v4.0, refrescado por el cron de datos).
 *  - Relevamiento de TNA por banco y de billeteras: src/data/live/tasas-billeteras.json.
 *  - Inflación mensual e interanual: src/data/live/inflacion.json vía
 *    src/lib/data/inflacion-serie-ar.ts (INDEC).
 *
 * NOTAS DE CONTRATO:
 *  - Toda fila que no es plata declara `format`/`unit`/`decimals` EXPLÍCITOS:
 *    el runtime hace Object.assign y una fila sin format cae a pesos.
 *  - El gráfico es `bars`: interés nominal contra lo que se lleva la inflación.
 *    Un plazo fijo que paga menos que el IPC del período PIERDE plata, y eso es
 *    lo que ninguna calculadora de plazo fijo muestra.
 */

const bancosLive = (billeteras as any).bancos as Array<{ entidad: string; tna: number }>;
const billeterasLive = (billeteras as any).billeteras as Array<{ nombre: string; tna: number; detalle?: string }>;

const bancosOrdenados = [...bancosLive].sort((a, b) => a.tna - b.tna);

/** El relevamiento trae los nombres en mayúsculas: los pasamos a capitalizado. */
const MINUSCULAS = new Set(['de', 'la', 'y', 'del', 'los', 'las', 'el', 'en']);
function nombreBanco(raw: string): string {
  return String(raw || '')
    .toLowerCase()
    .replace(/\s+s\.a\.u?\.?$/, '')
    .replace(/\s+sociedad anonima$/, '')
    .replace(/\s+cooperativo limitado$/, '')
    .split(' ')
    .map((w, i) => (i > 0 && MINUSCULAS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
    .trim();
}

/** Tasas vivas usadas como valores por defecto de los campos y del compute(). */
export const TASAS = {
  /** TNA de plazo fijo a 30 días publicada por el BCRA. */
  plazoFijo30d: Number((tasas as any).plazo_fijo_30d?.valor) || 0,
  plazoFijoFecha: String((tasas as any).plazo_fijo_30d?.fecha || ''),
  /** BADLAR bancos privados (TNA), referencia del mercado mayorista. */
  badlar: Number((tasas as any).badlar?.valor) || 0,
  /** Valor de la UVA en pesos (BCRA). */
  uva: Number((tasas as any).uva?.valor) || 0,
  uvaFecha: String((tasas as any).uva?.fecha || ''),
  /** Extremos y promedio del relevamiento de bancos. */
  bancoPeor: { nombre: nombreBanco(bancosOrdenados[0]?.entidad || ''), tna: bancosOrdenados[0]?.tna || 0 },
  bancoMejor: {
    nombre: nombreBanco(bancosOrdenados[bancosOrdenados.length - 1]?.entidad || ''),
    tna: bancosOrdenados[bancosOrdenados.length - 1]?.tna || 0,
  },
  bancosPromedio: bancosOrdenados.length
    ? bancosOrdenados.reduce((a, b) => a + b.tna, 0) / bancosOrdenados.length
    : 0,
  bancosCantidad: bancosOrdenados.length,
  /** Mejor billetera / money market del relevamiento. */
  billeteraMejor: [...billeterasLive].sort((a, b) => b.tna - a.tna)[0] || { nombre: '', tna: 0 },
  /** Inflación mensual del último dato INDEC y acumulada 12 meses. */
  inflacionMensual: Number((inflacionData as any).last_month?.valor) || 0,
  inflacionInteranual: INFLACION_INTERANUAL_PCT,
  inflacionAsOf: INFLACION_AS_OF,
} as const;

const pct = (n: number, dec = 2) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + '%';

export const hub: HubData = {
  slug: 'inversiones/plazo-fijo',
  title: '¿Cuánto gano con un plazo fijo? Calculadora 2026 — Argentina',
  description:
    'Calculá cuánto te deja un plazo fijo con la TNA vigente del BCRA, compará contra un plazo fijo UVA, contra una billetera con rendimiento diario y entre bancos, y mirá si le ganás o le perdés a la inflación.',
  silo: 'Inversiones',
  siloHref: '/inversiones',

  eyebrow: 'Guía y estimación de rendimientos',
  h1: '¿Cuánto gano con un plazo fijo?',
  lede:
    'El interés que te pagan es sólo la mitad de la respuesta: lo que importa es si ese interés le gana a la inflación. Partimos del plazo fijo tradicional con la tasa vigente del BCRA y lo comparás con el UVA, con una billetera o entre bancos.',
  stamps: [
    'Actualizado 27-07-2026',
    `TNA plazo fijo 30 días ${pct(TASAS.plazoFijo30d)} (BCRA, ${TASAS.plazoFijoFecha})`,
    `Inflación mensual ${pct(TASAS.inflacionMensual, 1)} (INDEC)`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Monto final estimado',

  cases: {
    title: '¿Dónde querés poner la plata?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'tradicional',
        label: 'Plazo fijo tradicional',
        hint: 'El caso más común',
        answer: 'El plazo fijo paga interés simple: capital × TNA × días ÷ 365.',
        yes: [
          'Interés simple sobre el plazo: no capitaliza hasta que lo renovás',
          `TNA de referencia a 30 días del BCRA: ${pct(TASAS.plazoFijo30d)} al ${TASAS.plazoFijoFecha}`,
          'Plazo mínimo legal: 30 días, y la plata queda inmovilizada hasta el vencimiento',
          'Los depósitos están cubiertos por el seguro de garantía de los depósitos hasta el tope vigente',
        ],
        warn: [
          'Si la TNA anual queda por debajo de la inflación del período, el rendimiento real es negativo aunque el saldo suba',
          'Renovar automáticamente te aplica la tasa del día de la renovación, que puede ser más baja',
          'Precancelar un plazo fijo tradicional no se puede: no existe la opción de retirarlo antes',
        ],
        plazo: 'el plazo mínimo es de 30 días y el interés se acredita al vencimiento junto con el capital.',
      },
      {
        id: 'uva',
        label: 'Plazo fijo UVA precancelable',
        hint: 'Sigue la inflación',
        answer: 'El UVA ajusta tu capital por inflación y encima te paga un spread.',
        yes: [
          'El capital se ajusta por el coeficiente UVA, que sigue al IPC del INDEC con un rezago de unos 45 días',
          `Valor de la UVA publicado por el BCRA: $${TASAS.uva.toLocaleString('es-AR')} al ${TASAS.uvaFecha}`,
          'Encima del ajuste el banco paga un spread anual, chico pero positivo',
          'La versión precancelable te deja retirar a partir de los 30 días',
        ],
        warn: [
          'El plazo mínimo del UVA es de 180 días (90 en la versión precancelable): es una apuesta larga',
          'Si precancelás, perdés el ajuste por inflación y cobrás una tasa penalizada, bastante más baja',
          'Con inflación en baja, el UVA rinde menos que un plazo fijo tradicional a tasa fija',
        ],
        plazo: 'plazo mínimo 180 días; en la variante precancelable podés retirar desde los 30 días con tasa penalizada.',
      },
      {
        id: 'billetera',
        label: 'Billetera virtual o money market',
        hint: 'Disponible al instante',
        answer: 'La billetera capitaliza todos los días y podés sacar la plata cuando quieras.',
        yes: [
          'El saldo va a un fondo money market: capitaliza diario, así que la TEA supera a la TNA',
          `Mejor TNA del relevamiento de billeteras: ${TASAS.billeteraMejor.nombre} con ${pct(TASAS.billeteraMejor.tna)}`,
          'Disponibilidad inmediata: rescate en el día, sin esperar vencimiento',
          'No tiene monto mínimo ni te obliga a inmovilizar la plata',
        ],
        warn: [
          'La TNA de la billetera cambia sin aviso: la de hoy puede no ser la de la semana que viene',
          'No es un depósito bancario: no lo cubre el seguro de garantía de los depósitos',
          'Algunas cuentas remuneradas tienen tope de saldo, y el excedente no rinde nada',
        ],
        plazo: 'el rendimiento se acredita todos los días y el rescate suele estar disponible en el momento.',
      },
      {
        id: 'bancos',
        label: 'Quiero comparar bancos',
        hint: `${TASAS.bancosCantidad} entidades relevadas`,
        answer: `Entre el banco que más paga y el que menos hay ${pct(TASAS.bancoMejor.tna - TASAS.bancoPeor.tna, 2)} de diferencia de TNA.`,
        yes: [
          `Relevamiento vigente: ${TASAS.bancosCantidad} bancos, de ${pct(TASAS.bancoPeor.tna)} a ${pct(TASAS.bancoMejor.tna)} de TNA`,
          `Promedio del sistema: ${pct(TASAS.bancosPromedio)} de TNA a 30 días`,
          'Casi todos los bancos aceptan plazos fijos online de clientes de otras entidades',
          'La diferencia de tasa se cobra entera: mover el depósito no tiene costo',
        ],
        warn: [
          'Los bancos chicos suelen pagar más, pero conviene mirar la solidez de la entidad',
          'La tasa online y la de sucursal pueden ser distintas en el mismo banco',
          'Un tramo del depósito puede quedar fuera del seguro de garantía si superás el tope por entidad',
        ],
        plazo: 'las tasas se actualizan a diario: la que ves hoy es la que rige para el depósito que constituyas hoy.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu inversión',
  inputsIntro: 'Los valores por defecto salen de los datos vigentes del BCRA y del INDEC.',
  fields: [
    {
      id: 'capital',
      label: 'Capital a invertir',
      prefix: '$',
      value: '1.000.000',
      thousands: true,
      help: 'Lo que ponés hoy, antes de intereses.',
    },
    {
      id: 'dias',
      label: 'Plazo',
      type: 'number',
      suffix: 'días',
      min: 1,
      max: 3650,
      step: 1,
      value: 30,
      help: 'El mínimo legal del plazo fijo tradicional es 30 días.',
    },
    {
      id: 'tna',
      label: 'TNA del plazo fijo',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 500,
      step: 0.01,
      value: TASAS.plazoFijo30d,
      help: `Viene de la tasa BCRA a 30 días (${TASAS.plazoFijoFecha}). Cambiala por la que te ofrece tu banco.`,
    },
    {
      id: 'tnaBilletera',
      label: 'TNA de la billetera o del money market',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 500,
      step: 0.01,
      value: TASAS.billeteraMejor.tna,
      help: `Por defecto, la mejor del relevamiento (${TASAS.billeteraMejor.nombre}). Verificala en la app.`,
    },
    {
      id: 'inflacion',
      label: 'Inflación mensual estimada',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.1,
      value: TASAS.inflacionMensual,
      help: `Último dato del IPC INDEC (${TASAS.inflacionAsOf}). Con esto medimos el rendimiento real.`,
    },
    {
      id: 'spread',
      label: 'Spread anual del plazo fijo UVA',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 30,
      step: 0.1,
      value: 1,
      help: 'Lo que el banco paga por encima del ajuste UVA. Suele ir de 0,5% a 2% anual.',
    },
  ],
  fineprint:
    'Es una orientación. Las tasas cambian todos los días, el ajuste UVA se publica con rezago y el rendimiento real depende de la inflación que efectivamente ocurra en el período.',

  chart: {
    type: 'bars',
    title: 'Tu rendimiento contra la inflación',
    caption:
      'La primera barra es el interés que te pagan en el período. La segunda es lo que la inflación le saca a tu capital en esos mismos días. La tercera es lo que queda: si es negativa, el plazo fijo sube tu saldo pero te deja con menos poder de compra que al principio.',
  },
  breakdownTitle: 'Cómo se arma tu rendimiento',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande.',

  faq: [
    {
      q: '¿Cómo se calcula el interés de un plazo fijo?',
      a: 'Con interés simple: capital × (TNA ÷ 100) × (días ÷ 365). Un millón de pesos a 30 días con una TNA del 21% deja alrededor de $17.260 de interés. El plazo fijo no capitaliza dentro del plazo: sólo lo hace cuando renovás y volvés a depositar capital más interés.',
    },
    {
      q: '¿Qué diferencia hay entre TNA y TEA?',
      a: 'La TNA es la tasa nominal anual, la que se usa para liquidar el interés proporcional a los días. La TEA es la efectiva anual: supone que reinvertís cada vencimiento, así que incorpora el interés compuesto y siempre es mayor. Para comparar instrumentos con distinta frecuencia de capitalización, la que sirve es la TEA.',
    },
    {
      q: '¿Un plazo fijo le gana a la inflación en 2026?',
      a: `Depende del mes. Con la TNA de referencia del BCRA en ${pct(TASAS.plazoFijo30d)}, un plazo fijo a 30 días rinde cerca de ${pct(TASAS.plazoFijo30d / 12)} en el período, contra una inflación mensual del ${pct(TASAS.inflacionMensual, 1)} según el último dato del INDEC. La cuenta se da vuelta apenas la inflación se acelera, y por eso el hub calcula el rendimiento real y no sólo el nominal.`,
    },
    {
      q: '¿Conviene un plazo fijo UVA o uno tradicional?',
      a: 'El UVA conviene cuando esperás que la inflación supere a la tasa fija, porque tu capital se ajusta por el IPC y además cobrás un spread. El tradicional conviene con inflación en baja o estable, porque te fija hoy una tasa que la inflación futura no va a alcanzar. Como el UVA exige plazos largos, es una apuesta sobre varios meses, no sobre uno.',
    },
    {
      q: '¿Qué es un plazo fijo UVA precancelable?',
      a: 'Es la variante que te permite retirar la plata antes del vencimiento, a partir de los 30 días. El costo es que perdés el ajuste por inflación de todo el período y cobrás una tasa penalizada, bastante por debajo de lo que hubieras cobrado esperando. Sirve como red de seguridad, no como plan.',
    },
    {
      q: '¿Rinde más una billetera virtual que un plazo fijo?',
      a: `Hoy, en general, sí: la mejor billetera del relevamiento paga ${pct(TASAS.billeteraMejor.tna)} de TNA con capitalización diaria, contra ${pct(TASAS.plazoFijo30d)} del plazo fijo del BCRA a 30 días, y además la plata queda disponible en el momento. La contra es que la tasa de la billetera cambia sin aviso y el saldo no está cubierto por el seguro de garantía de los depósitos.`,
    },
    {
      q: '¿Qué es un fondo money market y qué riesgo tiene?',
      a: 'Es un fondo común de inversión que invierte en plazos fijos, cauciones y cuentas remuneradas a muy corto plazo. No tiene plazo de permanencia ni volatilidad relevante, y el rescate es inmediato, pero el rendimiento no está garantizado: es variable y sigue a las tasas del mercado día a día.',
    },
    {
      q: '¿Cuánta diferencia hay entre bancos?',
      a: `Bastante: en el relevamiento de ${TASAS.bancosCantidad} entidades, la TNA a 30 días va de ${pct(TASAS.bancoPeor.tna)} a ${pct(TASAS.bancoMejor.tna)}, con un promedio de ${pct(TASAS.bancosPromedio)}. Sobre un millón de pesos a 30 días esa brecha son varios miles de pesos por el mismo depósito y el mismo riesgo, y mover el plazo fijo online no cuesta nada.`,
    },
    {
      q: '¿Se puede sacar la plata antes del vencimiento?',
      a: 'En el plazo fijo tradicional no: la plata queda inmovilizada hasta el vencimiento y no existe la precancelación. Sólo el UVA precancelable admite retiro anticipado, desde los 30 días y con tasa penalizada. Si necesitás liquidez, el instrumento correcto es una billetera o un money market.',
    },
    {
      q: '¿El plazo fijo paga impuestos?',
      a: 'Los intereses de plazos fijos en pesos de personas humanas están exentos de Impuesto a las Ganancias. Sí pueden entrar en Bienes Personales por el saldo al 31 de diciembre según el mínimo no imponible del año, y los movimientos de la cuenta pueden sufrir el impuesto al cheque según cómo se acrediten.',
    },
    {
      q: '¿Qué es el rendimiento real y por qué importa más que el nominal?',
      a: 'El rendimiento real es lo que te queda después de descontar la inflación del período. Si ganás 1,7% en 30 días y la inflación fue 1,9%, tu saldo subió pero tu poder de compra bajó: el rendimiento real es negativo. Por eso el gráfico de este hub muestra las dos cosas juntas y no sólo el interés.',
    },
    {
      q: '¿El plazo fijo está garantizado si quiebra el banco?',
      a: 'Los depósitos en pesos y en dólares están cubiertos por el Seguro de Garantía de los Depósitos (SEDESA) hasta el tope por persona y por entidad que fija el BCRA. Si tenés más que ese tope, conviene repartir entre bancos. Los fondos money market y las billeteras no están alcanzados por esa garantía.',
    },
  ],

  sources: [
    {
      name: 'BCRA — Principales variables monetarias (tasa de plazo fijo a 30 días y BADLAR)',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
      date: TASAS.plazoFijoFecha,
    },
    {
      name: 'BCRA — Unidad de Valor Adquisitivo (UVA), serie diaria',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
      date: TASAS.uvaFecha,
    },
    {
      name: 'BCRA — Comparativa de tasas de plazo fijo por entidad',
      url: 'https://www.bcra.gob.ar/BCRAyVos/Plazos_fijos_online.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'INDEC — Índice de precios al consumidor (IPC)',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: TASAS.inflacionAsOf,
    },
    {
      name: 'BCRA — Seguro de Garantía de los Depósitos (SEDESA)',
      url: 'https://www.bcra.gob.ar/BCRAyVos/Garantia_de_los_depositos.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'CAFCI — Fondos comunes de inversión money market',
      url: 'https://www.cafci.org.ar/',
      publisher: 'Cámara Argentina de Fondos Comunes de Inversión',
    },
  ],

  replaces: [
    '/calculadora-plazo-fijo',
    '/calculadora-plazo-fijo-uva-precancelable-rendimiento',
    '/calculadora-rendimiento-fci-money-market',
    '/calculadora-rendimiento-mercado-pago-billetera-argentina',
    '/calculadora-caja-seguridad-banco-comparativa-mensual',
    '/calculadora-spread-tasas-arbitraje-bancos-plazo-fijo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
