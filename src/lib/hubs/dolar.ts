import type { HubData } from './types';
import dolarLive from '../../data/live/dolar.json';
import tasasLive from '../../data/live/tasas.json';
import { INFLACION_INTERANUAL_PCT, INFLACION_AS_OF } from '../data/inflacion-serie-ar';

/**
 * Hub de decisión — "¿Conviene comprar dólares?"
 * Arquetipo RAMIFICADO. Absorbe 9 calculadoras (ver hub.replaces).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LÍMITE CON EL HUB /trabajo/sueldo-vs-inflacion  (LEER ANTES DE AGREGAR NADA)
 *
 *   Este hub responde: DÓNDE PONGO LOS PESOS — ¿en qué me conviene ahorrar?
 *   El hub de sueldo responde: MI INGRESO EN EL TIEMPO — ¿me alcanza?
 *
 *   Regla operativa: si el input principal es UN STOCK DE PLATA que hay que
 *   colocar (o un precio en dólares), es acá. Si el input principal es UN
 *   SUELDO, es el hub de sueldo.
 *
 *   Por eso `inflacion-poder-compra` y `plata-quieta` viven acá (parten de un
 *   monto ahorrado), y `poder-adquisitivo-sueldo-real` vive allá (parte de un
 *   sueldo). Este hub NO mide sueldos en dólares: eso es la rama "en dólares"
 *   del hub de sueldo, linkeada en la FAQ.
 *
 *   Y frente a los hubs vecinos: /inversiones/plazo-fijo compara instrumentos
 *   en pesos entre sí (banco por banco, TNA contra TEA); acá el plazo fijo
 *   aparece sólo como alternativa al dólar, no como tema. /finanzas-personales/
 *   gastos-del-mes reparte el gasto corriente; acá se decide sobre el ahorro.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * DATOS VIVOS — nada de cotizaciones hardcodeadas:
 *  - Oficial, blue, MEP, CCL, cripto y tarjeta: src/data/live/dolar.json
 *    (DolarAPI, refrescado por el cron de datos).
 *  - TNA de plazo fijo a 30 días: src/data/live/tasas.json (BCRA).
 *  - Inflación interanual: src/data/live/inflacion.json (INDEC).
 * Las cotizaciones se prellenan en campos EDITABLES con la fecha del dato: se
 * mueven todos los días y el usuario tiene que poder pisarlas.
 *
 * NOTA DE CONTRATO: toda fila que no sea plata declara `format`/`unit`/`decimals`
 * explícitos — el runtime hace Object.assign y una fila sin format cae a pesos.
 */

const q = (dolarLive as any).quotes;
const DOLAR_FECHA = String((dolarLive as any)._meta?.fetchedAt || '').slice(0, 10);
const TNA_PF = Number((tasasLive as any).plazo_fijo_30d?.valor) || 0;
const TNA_PF_FECHA = String((tasasLive as any).plazo_fijo_30d?.fecha || '');

/** Spread anual típico de un plazo fijo UVA sobre el ajuste por inflación. */
const UVA_SPREAD_PCT = 1;
/** Comisión de mercado habitual de una operación MEP (compra + venta). */
const MEP_COMISION_PCT = 0.5;

const num = (x: any) => Number(x) || 0;

/** Todo lo que compute() necesita del lado del cliente. Serializado, no duplicado. */
export const DOLAR_DATA = {
  oficial: num(q?.oficial?.venta),
  blue: num(q?.blue?.venta),
  mep: num(q?.bolsa?.venta),
  ccl: num(q?.contadoconliqui?.venta),
  cripto: num(q?.cripto?.venta),
  tarjeta: num(q?.tarjeta?.venta),
  fecha: DOLAR_FECHA,
  tnaPlazoFijo: TNA_PF,
  tnaFecha: TNA_PF_FECHA,
  inflacion12m: INFLACION_INTERANUAL_PCT,
  inflacionAsOf: INFLACION_AS_OF,
  uvaSpread: UVA_SPREAD_PCT,
  mepComision: MEP_COMISION_PCT,
};

const DISCLAIMER_INVERSION =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.';

const ars0 = (n: number) => Math.round(n).toLocaleString('es-AR');

export const hub: HubData = {
  slug: 'finanzas-personales/dolar',
  title: '¿Conviene comprar dólares? Comparador contra pesos, UVA y plazo fijo',
  description:
    'Cotizaciones vivas de oficial, blue, MEP, CCL y cripto, con la brecha del día. Compará dólar contra plazo fijo y UVA a los meses que elijas, calculá el costo real de comprar MEP y mirá cuánto pierde la plata quieta por inflación.',
  silo: 'Finanzas personales',
  siloHref: '/finanzas-personales',

  eyebrow: 'Ahorro y dólar',
  h1: '¿Conviene comprar dólares?',
  lede:
    'Comprar dólares no es una decisión sobre el dólar: es una decisión sobre dónde dejás los pesos que te sobran. Partimos de la pregunta más común —a qué dólar comprar y cuánto te llevás— y desde ahí lo comparás contra el plazo fijo, contra UVA y contra la peor alternativa, que es no hacer nada.',
  stamps: [
    `Cotizaciones del ${DOLAR_FECHA}`,
    `Plazo fijo 30 días ${TNA_PF.toFixed(2).replace('.', ',')}% TNA (BCRA)`,
    '9 calculadoras adentro',
  ],

  resultLabel: 'Tu plata, a los meses que elijas',

  cases: {
    title: '¿Qué estás decidiendo?',
    intro:
      'Las cotizaciones vienen prellenadas con el último dato, pero son editables: pisá el valor si tenés otro.',
    items: [
      {
        id: 'brecha',
        label: 'A qué dólar compro y cuántos me llevo',
        hint: 'Oficial, blue, MEP, CCL y cripto',
        answer:
          'Con el mismo monto en pesos te llevás distinta cantidad de dólares según el tipo de cambio al que accedas.',
        yes: [
          'Convierte tu monto en pesos a las cinco cotizaciones vivas y muestra cuántos dólares te llevás con cada una',
          'Calcula la brecha entre el paralelo y el oficial, que es la medida de la presión cambiaria',
          'Sirve igual para el camino inverso: cuántos pesos te dan por los dólares que ya tenés',
        ],
        warn: [
          DISCLAIMER_INVERSION,
          'La cotización oficial no siempre es accesible para comprar: mirá primero a qué tipo de cambio podés operar de verdad',
          'Las cotizaciones se mueven durante la rueda: el número vale para la fecha y hora del dato',
        ],
        plazo: 'la brecha se calcula siempre contra el oficial vendedor del mismo momento.',
      },
      {
        id: 'mep',
        label: 'Cuánto me cuesta comprar dólar MEP',
        hint: 'Comisiones y tipo de cambio efectivo',
        answer:
          'El MEP efectivo que pagás es la cotización más las comisiones: siempre queda arriba del MEP publicado.',
        yes: [
          'Estima cuántos dólares netos recibís después de las comisiones de compra y venta del bono',
          'Devuelve el tipo de cambio efectivo, que es el número real de la operación',
          'Muestra el sobreprecio en pesos y en porcentaje contra el MEP publicado',
        ],
        warn: [
          DISCLAIMER_INVERSION,
          'Cada broker cobra distinto y algunos suman derechos de mercado: la comisión que usamos es una referencia de plaza',
          'El MEP tiene parking o restricciones según la normativa vigente y el instrumento elegido: verificalo antes de operar',
        ],
        plazo: 'la operación se liquida en 24 o 48 horas hábiles según el bono y el plazo elegido.',
      },
      {
        id: 'vs-pesos',
        label: 'Dólar, plazo fijo o UVA',
        hint: 'Proyección a los meses que elijas',
        answer:
          'El dólar sólo le gana a los pesos si sube más que la tasa; y le gana a la inflación sólo si sube más que el IPC.',
        yes: [
          'Proyecta tres caminos con el mismo capital: quedarte en dólares, plazo fijo tradicional en pesos y plazo fijo UVA',
          'Mide los tres contra la inflación esperada, que es la vara real',
          'Muestra cuál queda arriba y por cuánto',
        ],
        warn: [
          DISCLAIMER_INVERSION,
          'Es una proyección con los supuestos que cargás: si la inflación o la devaluación resultan distintas, cambia el ganador',
          'El dólar guardado no rinde nada por sí solo: sólo gana si el tipo de cambio sube',
          'El plazo fijo UVA tiene plazo mínimo de 180 días y penalidad si lo precancelás',
        ],
        plazo: 'el plazo fijo tradicional se renueva cada 30 días; el UVA no baja de 180.',
      },
      {
        id: 'quieta',
        label: 'Cuánto pierdo si dejo la plata quieta',
        hint: 'Costo de no hacer nada',
        answer:
          'La plata en la cuenta no se mantiene: pierde exactamente lo que sube el IPC del período.',
        yes: [
          'Calcula cuánto poder de compra queda de tu monto después del período elegido',
          'Muestra la pérdida en pesos y en porcentaje',
          'Devuelve cuánto necesitarías tener para comprar lo mismo que hoy',
        ],
        warn: [
          DISCLAIMER_INVERSION,
          'La inflación esperada es un supuesto tuyo, no un pronóstico: probá con varios valores',
          'Perder menos no es lo mismo que ganar: una opción que empata la inflación mantiene, no aumenta',
        ],
        plazo: 'el IPC del mes se publica alrededor del día 12 del mes siguiente.',
      },
      {
        id: 'precio',
        label: 'Algo cuesta en dólares: ¿cuánto es en pesos?',
        hint: 'Precio y dólar efectivo',
        answer:
          'Un precio en dólares se convierte al tipo de cambio con el que realmente vas a pagar, no al oficial de pizarra.',
        yes: [
          'Convierte un precio en dólares a pesos con cada cotización, incluida la de tarjeta',
          'Muestra cuánto cambia el precio final según con qué dólar lo pagues',
        ],
        warn: [
          DISCLAIMER_INVERSION,
          'Los servicios turísticos al exterior pagados en pesos llevan percepción, que se recupera al liquidar impuestos',
          'La cotización de tarjeta ya incluye el recargo vigente: no le sumes otro por arriba',
        ],
        plazo:
          'el consumo con tarjeta se liquida al tipo de cambio del día de cierre del resumen, no al del día de la compra.',
      },
    ],
  },

  inputsTitle: 'Tus datos y las cotizaciones',
  inputsIntro:
    'Las cotizaciones y la tasa vienen con el último dato disponible. Son editables: si tenés otro valor, pisalo.',
  fields: [
    {
      id: 'monto',
      label: 'Cuánta plata querés colocar',
      prefix: '$',
      value: '1.000.000',
      thousands: true,
    },
    {
      id: 'meses',
      label: 'Por cuántos meses',
      type: 'number',
      min: 1,
      max: 120,
      value: 12,
    },
    {
      id: 'dolarLibre',
      label: `Dólar libre (blue) — dato del ${DOLAR_FECHA}`,
      prefix: '$',
      value: ars0(DOLAR_DATA.blue),
      thousands: true,
    },
    {
      id: 'dolarOficial',
      label: `Dólar oficial — dato del ${DOLAR_FECHA}`,
      prefix: '$',
      value: ars0(DOLAR_DATA.oficial),
      thousands: true,
    },
    {
      id: 'inflacionAnual',
      label: 'Inflación anual que esperás',
      suffix: '%',
      type: 'number',
      min: 0,
      max: 500,
      step: 0.1,
      value: Number(INFLACION_INTERANUAL_PCT.toFixed(1)),
      help: `Viene con la inflación interanual del INDEC al ${INFLACION_AS_OF}. Cambiala por la que esperás vos.`,
    },
    {
      id: 'tnaPesos',
      label: 'TNA del plazo fijo en pesos',
      suffix: '%',
      type: 'number',
      min: 0,
      max: 500,
      step: 0.01,
      value: Number(TNA_PF.toFixed(2)),
      help: `Tasa de plazo fijo a 30 días del BCRA al ${TNA_PF_FECHA}.`,
    },
    {
      id: 'precioUSD',
      label: 'Precio en dólares de algo que querés comprar',
      prefix: 'US$',
      type: 'number',
      min: 0,
      value: 100,
    },
  ],
  fineprint: DISCLAIMER_INVERSION,

  chart: {
    type: 'scale',
    title: 'Dónde caés vos',
    caption:
      'La barra es una escala con franjas y el marcador indica tu posición. Qué mide cambia con la rama: brecha cambiaria, sobreprecio de la operación, rendimiento real del ganador, poder de compra que queda o precio final en pesos.',
  },
  breakdownTitle: 'El detalle del cálculo',
  breakdownIntro:
    'Cada fila muestra de dónde sale el número principal. Las barras comparan los importes entre sí.',

  faq: [
    {
      q: '¿Conviene comprar dólares o hacer un plazo fijo?',
      a: 'Depende de una sola comparación: cuánto esperás que suba el dólar contra cuánto paga la tasa en el mismo período. El dólar guardado no rinde nada por sí solo, así que le gana al plazo fijo únicamente si la suba del tipo de cambio supera la tasa acumulada. Si además querés no perder contra la inflación, los dos tienen que superar el IPC.',
    },
    {
      q: '¿Qué es la brecha cambiaria y por qué importa?',
      a: 'Es cuánto está el paralelo por encima del oficial, en porcentaje. Importa porque mide la presión sobre el peso y porque define cuántos dólares te llevás realmente: con el mismo monto en pesos comprás bastante menos dólares al paralelo que al oficial. Una brecha por debajo del 10% se considera baja; por encima del 50%, alta.',
    },
    {
      q: '¿Cuál es la diferencia entre dólar MEP, CCL y blue?',
      a: 'El MEP se obtiene comprando un bono en pesos y vendiéndolo en dólares dentro del país; el CCL es la misma operación pero acreditando los dólares en el exterior, y por eso suele cotizar más caro; el blue es el mercado informal. MEP y CCL son legales y se operan por un broker; el blue no tiene comprobante ni respaldo.',
    },
    {
      q: '¿Cuánto cuesta realmente comprar dólar MEP?',
      a: 'La cotización publicada no es lo que pagás: hay que sumarle las comisiones de compra y venta del bono, y a veces derechos de mercado. Eso levanta el tipo de cambio efectivo, que es el único número que importa. Sobre montos chicos las comisiones fijas pesan mucho más en porcentaje.',
    },
    {
      q: '¿Qué es un plazo fijo UVA y cuándo conviene?',
      a: 'Ajusta el capital por el coeficiente UVA, que sigue la inflación, y encima paga un spread. Conviene cuando esperás que la inflación supere a la tasa fija en pesos. La contra es el plazo: no baja de 180 días, y si lo precancelás cobrás una tasa mucho menor.',
    },
    {
      q: '¿Cuánto pierdo si dejo la plata quieta en la cuenta?',
      a: 'Exactamente lo que suba el IPC del período. Con una inflación anual del 30%, cien mil pesos guardados un año compran al final lo mismo que unos setenta y siete mil de hoy. Es la única opción de la lista que garantiza pérdida.',
    },
    {
      q: '¿Al dólar de hoy me alcanza para el precio que estoy mirando?',
      a: 'Convertí el precio en dólares al tipo de cambio con el que realmente vas a pagar, no al de pizarra. Si es un consumo con tarjeta, la cotización relevante es la de tarjeta, que ya incluye los recargos vigentes, y se liquida al valor del día de cierre del resumen, no al de la compra.',
    },
    {
      q: '¿Esta página me dice cuánto vale mi sueldo en dólares?',
      a: 'No, y es a propósito. Acá se decide dónde poner los pesos que ahorrás. Medir tu ingreso —en dólares, contra la inflación, contra el mínimo o contra el promedio— se hace en el hub ¿tu sueldo le gana a la inflación?, en /trabajo/sueldo-vs-inflacion.',
    },
    {
      q: '¿De dónde salen las cotizaciones y cada cuánto se actualizan?',
      a: 'De DolarAPI, que publica oficial, blue, MEP, CCL, cripto y tarjeta, y las refresca el cron de datos del sitio varias veces por día. La fecha del dato está en el sello del encabezado y en cada campo. Los valores vienen prellenados pero son editables, justamente porque se mueven durante la rueda.',
    },
    {
      q: '¿Sirve para saber cuántos pesos me dan por los dólares que tengo?',
      a: 'Sí: la conversión es simétrica. La rama de cotizaciones muestra el valor de cada tipo de cambio, así que multiplicando en lugar de dividir tenés cuántos pesos recibís al vender. Tené en cuenta que el mercado compra siempre un poco más barato de lo que vende.',
    },
    {
      q: '¿Qué pasa si la inflación resulta distinta de la que puse?',
      a: 'Cambia el ganador de la comparación, y por eso conviene probar con varios valores. Una regla práctica: si la tasa en pesos empata la inflación esperada, el plazo fijo tradicional y el UVA rinden parecido; si esperás inflación más alta que la tasa, el UVA se despega.',
    },
    {
      q: '¿Hay un monto mínimo para que valga la pena?',
      a: 'Para el plazo fijo no, pero para comprar dólares por MEP sí en la práctica: las comisiones fijas del broker pesan mucho sobre montos chicos y te suben el tipo de cambio efectivo. Mirá siempre el sobreprecio en porcentaje que devuelve la rama de MEP antes de operar por poca plata.',
    },
  ],

  sources: [
    {
      name: 'Cotizaciones del dólar (oficial, blue, MEP, CCL, cripto y tarjeta)',
      url: 'https://dolarapi.com/v1/dolares',
      publisher: 'DolarAPI',
      date: DOLAR_FECHA,
    },
    {
      name: 'BCRA — Estadísticas monetarias, tasa de plazo fijo a 30 días',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
      date: TNA_PF_FECHA,
    },
    {
      name: 'INDEC — Índice de precios al consumidor (IPC)',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
      date: INFLACION_AS_OF,
    },
    {
      name: 'BCRA — Unidad de Valor Adquisitivo (UVA), serie diaria',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'CNV — Operatoria de dólar MEP y contado con liquidación',
      url: 'https://www.argentina.gob.ar/cnv',
      publisher: 'Comisión Nacional de Valores',
    },
  ],

  replaces: [
    '/conversor-dolar-argentina',
    '/calculadora-inflacion-poder-compra',
    '/calculadora-precio-dolar-producto',
    '/conversor-dolar-euro-pesos-argentinos',
    '/calculadora-dolar-blue-vs-oficial-brecha',
    '/calculadora-ahorro-uva-vs-pesos-vs-dolar-12-meses',
    '/calculadora-inflacion-perdida-poder-adquisitivo',
    '/calculadora-dolar-mep-paso-a-paso-costo-operacion',
    '/calculadora-cuanto-pierdo-inflacion-plata-quieta',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/conversor-moneda-dolar-peso-real-latam',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
