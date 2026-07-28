import type { HubData } from '../types';
import { COLOMBIA_2026, IBUA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánto impuesto viene metido en lo que estoy comprando?"
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts (UVT, IBUA_2026, GMF,
 * tarifa de ganancia ocasional de loterías).
 *
 * Las tarifas del impuesto al consumo de licores, cerveza y cigarrillos NO están en
 * la tabla maestra y las dos calculadoras viejas se contradecían entre sí, así que
 * la tarifa la carga el usuario y el default queda marcado como orientativo.
 * Ver el reporte que acompaña a este hub.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** UVT del año en curso — Resolución DIAN 000238 del 15-12-2025. */
export const UVT = COLOMBIA_2026.uvt;

/** IVA general — art. 468 ET. */
export const IVA_GENERAL = 0.19;

/** Impuesto Nacional al Consumo de restaurantes y bares — art. 512-9 ET. */
export const INC_RESTAURANTES = 0.08;

/** Tabla del IBUA — Resolución DIAN 000247 del 30-dic-2025 ($/100 ml). */
export const IBUA = IBUA_2026.map((t) => ({
  desdeG: t.desdeG,
  hastaG: Number.isFinite(t.hastaG) ? t.hastaG : null,
  tarifaPor100ml: t.tarifaPor100ml,
}));

/** Ganancia ocasional de loterías, rifas y apuestas — art. 317 ET. */
export const TARIFA_LOTERIAS = COLOMBIA_2026.gananciaOcasional.tarifaLoterias;

/** Umbral en UVT a partir del cual el premio queda sujeto a retención (art. 404-1 ET). */
export const UMBRAL_PREMIO_UVT = 48;

/** Gravamen a los movimientos financieros (4×1000) — art. 870 y ss. ET. */
export const GMF = COLOMBIA_2026.gmf;

/** De minimis de las compras internacionales por tráfico postal y envíos urgentes. */
export const MINIMIS = { conTlc: 200, sinTlc: 50 };

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
slug: 'co/impuestos/impuestos-al-consumo',
  title: 'Impuestos al consumo en Colombia: impoconsumo, licores, IBUA y compras',
  description:
    'Cuánto impuesto viene metido en lo que comprás en Colombia: impoconsumo del 8% en restaurantes y bares, impuesto al consumo de licores y cigarrillos, IBUA de las bebidas azucaradas, IVA y arancel de las compras internacionales, y el 20% de los premios de lotería.',
  silo: 'Impuestos',
siloHref: '/co/impuestos',
  locale: 'co',

  eyebrow: 'Colombia · DIAN y departamentos · consumo',
  h1: '¿Cuánto impuesto viene metido en lo que estoy comprando?',
  lede:
    'Casi nunca ves estos impuestos en la etiqueta: van dentro del precio. Comer afuera paga impoconsumo, el trago y el cigarrillo pagan impuesto departamental, la gaseosa paga IBUA, el paquete que te llega de afuera paga arancel más IVA, y el premio de la lotería paga ganancia ocasional. Esta cuenta te los saca a la luz.',
  stamps: [
    `UVT vigente: ${cop(UVT)}`,
    'Arts. 512-9, 513-1 y 317 del Estatuto Tributario · Resolución DIAN 000247 de 2025',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Impuesto que estás pagando',

  cases: {
    title: '¿Qué estás comprando?',
    intro:
      'Cada consumo tiene su propio impuesto, con su propia base y su propia entidad que lo cobra. Elegí el tuyo: arrancamos por el más cotidiano.',
    items: [
      {
        id: 'restaurante',
        label: 'Comer o tomar algo afuera',
        hint: `Impoconsumo del ${(INC_RESTAURANTES * 100).toFixed(0)}% · art. 512-9 ET`,
        answer: `El servicio de restaurante y bar paga ${(INC_RESTAURANTES * 100).toFixed(0)}% de impoconsumo, no IVA. La propina nunca hace base.`,
        yes: [
          `Impuesto Nacional al Consumo del ${(INC_RESTAURANTES * 100).toFixed(0)}% sobre el valor del consumo, comida y bebidas incluidas`,
          'La propina es voluntaria: por ley no hace parte de la base gravable',
          'El impoconsumo no genera impuesto descontable para el establecimiento: es un costo real que va al precio',
          'La excepción son los locales que operan bajo franquicia, que cobran IVA del 19% en vez de impoconsumo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El impoconsumo tiene que aparecer discriminado en la cuenta: si te lo cobran encima del IVA, algo está mal liquidado',
          'La propina sugerida del 10% es voluntaria y podés no pagarla; lo que no podés es negarte al impoconsumo',
          'La comida para llevar y los domicilios tienen su propio tratamiento según cómo se preste el servicio',
        ],
        plazo: 'pedí la factura electrónica: es el único soporte que te deja reclamar si el cobro no cuadra.',
      },
      {
        id: 'licores',
        label: 'Licores, cerveza y cigarrillos',
        hint: 'Impuesto al consumo departamental + IVA',
        answer: 'El trago y el cigarrillo llevan un impuesto departamental que se suma antes del IVA.',
        yes: [
          'Impuesto al consumo a cargo de los departamentos, que financia salud y educación',
          'La base del IVA incluye el impuesto al consumo: se paga impuesto sobre impuesto',
          'La cerveza tiene su propio régimen y una tarifa distinta de la de los destilados',
          'Los cigarrillos combinan un componente fijo por cajetilla con un componente sobre el precio',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tarifa de esta rama es editable a propósito: el impuesto al consumo de alcohol y tabaco combina componentes específicos y ad valórem que se actualizan cada año por certificación del DANE y varían por departamento y por grado alcoholimétrico. Cargá la de tu producto y verificala con la gobernación',
          'En la cerveza la tarifa legal incluye adentro un porcentaje que hace las veces de IVA: no lo sumes dos veces',
          'Los productos que entran de contrabando no pagan nada de esto, y por eso aparecen mucho más baratos',
        ],
        plazo: 'la estampilla o el marbete departamental en el envase es la prueba de que el impuesto se pagó.',
      },
      {
        id: 'ibua',
        label: 'Bebidas azucaradas',
        hint: 'IBUA por cada 100 ml, según el azúcar añadido',
        answer: 'El IBUA se cobra por volumen y sube en escalones según los gramos de azúcar añadido.',
        yes: [
          'Tarifa fija en pesos por cada 100 ml del envase, no un porcentaje del precio',
          `Tres tramos: menos de ${IBUA[1].desdeG} g de azúcar añadido por 100 ml no paga; de ${IBUA[1].desdeG} a menos de ${IBUA[2].desdeG} g paga ${cop(IBUA[1].tarifaPor100ml)} por 100 ml; de ${IBUA[2].desdeG} g en adelante paga ${cop(IBUA[2].tarifaPor100ml)} por 100 ml`,
          'El dato de azúcar añadido está en la tabla nutricional del envase',
          'Lo declara el productor o el importador, pero llega trasladado al precio de góndola',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los umbrales y las tarifas se revisan cada año por resolución de la DIAN: una bebida que hoy no paga puede pagar el año que viene sin cambiar de fórmula',
          'El IBUA se suma antes del IVA, así que el efecto en el precio final es mayor que la tarifa nominal',
          'No aplica a las bebidas con edulcorantes sin azúcar añadido, que es justamente lo que el impuesto busca empujar',
        ],
        plazo: 'mirá la tabla nutricional antes de comprar: el escalón cambia el precio más de lo que parece.',
      },
      {
        id: 'importacion',
        label: 'Compras internacionales (AliExpress, Temu, Amazon)',
        hint: 'De minimis, arancel e IVA sobre el valor más el arancel',
        answer: 'Debajo del de minimis no pagás nada; arriba pagás arancel y encima IVA.',
        yes: [
          `De minimis de USD ${MINIMIS.conTlc} para envíos desde países con tratado de libre comercio vigente`,
          `De minimis de USD ${MINIMIS.sinTlc} para el resto de los orígenes`,
          'Arancel según la partida arancelaria del producto: hay partidas al 0%, otras al 10% o al 15%',
          'IVA del 19% sobre el valor de la mercancía más el arancel, no sólo sobre la mercancía',
          `Si pagás con tarjeta desde tu cuenta, el gravamen a los movimientos financieros del ${(GMF.tasa * 1000).toFixed(0)} por mil también entra en el costo`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'El de minimis se mide por envío y por destinatario: partir una compra grande en varios paquetes para quedar debajo del umbral es una práctica que la DIAN desconoce',
          'El flete y el manejo del courier no son impuestos, pero suelen pesar más que el arancel en compras chicas',
          'El precio que ves en la plataforma casi nunca incluye estos tributos: el cobro aparece al momento de la entrega',
        ],
        plazo: 'guardá la factura de la plataforma: es lo que determina el valor en aduana declarado.',
      },
      {
        id: 'azar',
        label: 'Premios de lotería, rifas y apuestas',
        hint: `Ganancia ocasional del ${(TARIFA_LOTERIAS * 100).toFixed(0)}% · art. 317 ET`,
        answer: `Los premios pagan ${(TARIFA_LOTERIAS * 100).toFixed(0)}% de ganancia ocasional, retenido de una vez al momento de pagarte.`,
        yes: [
          `Tarifa del ${(TARIFA_LOTERIAS * 100).toFixed(0)}% sobre el valor del premio (art. 317 ET)`,
          `Se retiene cuando el premio supera las ${UMBRAL_PREMIO_UVT} UVT (${cop(UMBRAL_PREMIO_UVT * UVT)} con la UVT vigente)`,
          'La retención practicada es el impuesto: no se liquida un impuesto adicional después por el mismo premio',
          'El premio y la retención igual se llevan a la declaración de renta, en la sección de ganancias ocasionales',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Cuidado con los contenidos que hablan de una retención del 17% o de una tarifa marginal del 37% sobre premios: la tarifa de ganancia ocasional de loterías, rifas y apuestas es del ${(TARIFA_LOTERIAS * 100).toFixed(0)}%`,
          'Los premios en especie —un carro, un apartamento— también tributan, sobre el valor comercial del bien, y el ganador tiene que poner la plata de la retención',
          'Cobrar un premio grande te puede dejar obligado a declarar renta aunque nunca lo hayas estado',
        ],
        plazo: 'pedí el certificado de retención al operador del juego: sin él no podés acreditarla en tu declaración.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu compra',
  inputsIntro:
    'Cada rama usa los campos que le sirven; los demás quedan quietos. Todo en pesos colombianos, salvo el valor de la compra internacional, que va en dólares.',
  fields: [
    {
      id: 'valor',
      label: 'Valor del consumo, precio del producto o monto del premio (COP)',
      prefix: '$',
      value: '150.000',
      thousands: true,
      help: 'La cuenta del restaurante, el precio base del licor o del cigarrillo, el precio de la bebida, o el valor del premio.',
    },
    {
      id: 'propina',
      label: 'Propina voluntaria (COP)',
      prefix: '$',
      value: '15.000',
      thousands: true,
      help: 'Sólo se usa en la rama de restaurante. Por ley no hace parte de la base del impoconsumo.',
    },
    {
      id: 'tarifaConsumo',
      label: 'Tarifa del impuesto al consumo del producto (%)',
      type: 'number',
      value: 25,
      min: 0,
      max: 100,
      step: 0.5,
      help: 'Editable a propósito: cambia por producto, grado alcoholimétrico y departamento. Confirmala con la gobernación antes de tomarla como definitiva.',
    },
    {
      id: 'ml',
      label: 'Mililitros del envase',
      type: 'number',
      value: 500,
      min: 0,
      max: 5000,
      step: 10,
      suffix: 'ml',
      help: 'Sólo para la rama de bebidas azucaradas. El IBUA se liquida por volumen.',
    },
    {
      id: 'azucar',
      label: 'Azúcar añadido por cada 100 ml',
      type: 'number',
      value: 10,
      min: 0,
      max: 40,
      step: 0.1,
      suffix: 'g',
      help: 'Está en la tabla nutricional del envase. Define en qué escalón del IBUA cae la bebida.',
    },
    {
      id: 'valorUsd',
      label: 'Valor de la compra internacional (USD)',
      type: 'number',
      value: 250,
      min: 0,
      step: 1,
      prefix: 'USD',
      help: 'El valor de la mercancía en dólares, sin el flete.',
    },
    {
      id: 'trm',
      label: 'Tasa de cambio del día (COP por dólar)',
      prefix: '$',
      value: '4.000',
      thousands: true,
      help: 'La TRM que use la aduana el día de la nacionalización. Cargá la del día si la tenés.',
    },
    {
      id: 'arancel',
      label: 'Arancel de la partida del producto (%)',
      type: 'number',
      value: 10,
      min: 0,
      max: 100,
      step: 0.5,
      help: 'Depende de la partida arancelaria. Hay partidas al 0%: la ropa y el calzado suelen estar entre las más altas.',
    },
    {
      id: 'tlc',
      label: '¿El envío viene de un país con TLC vigente?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí (Estados Unidos, Unión Europea, México…)' },
        { value: 'no', label: 'No (China y la mayoría de los orígenes de Temu y AliExpress)' },
      ],
      help: `Define el de minimis: USD ${MINIMIS.conTlc} con tratado, USD ${MINIMIS.sinTlc} sin tratado.`,
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué parte de lo que pagás es impuesto',
    caption:
      'Separa el precio real del producto o servicio de lo que se lleva el Estado en cada capa: el impuesto propio del consumo y el IVA que se calcula encima de él.',
  },
  breakdownTitle: 'Capa por capa, hasta el precio final',
  breakdownIntro:
    'El orden importa: casi siempre el impuesto específico entra en la base del IVA, así que el efecto final es mayor que la suma de las tarifas.',

  faq: [
    {
      q: '¿Por qué en el restaurante me cobran impoconsumo y no IVA?',
      a: `Porque el servicio de restaurante y bar está expresamente excluido del IVA y sujeto al Impuesto Nacional al Consumo del ${(INC_RESTAURANTES * 100).toFixed(0)}% (art. 512-9 ET). Es una decisión de política tributaria: la tarifa es menor que el IVA, pero el establecimiento no puede descontar el impuesto de sus compras, así que en la práctica una parte se traslada igual al precio del plato. La excepción son los locales que operan bajo contrato de franquicia, que sí cobran IVA del 19%.`,
    },
    {
      q: '¿La propina paga impuesto?',
      a: 'No. La propina es voluntaria y por ley no hace parte de la base gravable del impoconsumo. En la cuenta tiene que aparecer separada, después del impuesto, y podés pedir que la retiren. Si un establecimiento te liquida el impoconsumo sobre el total con propina incluida, está cobrando de más: la diferencia es chica en una cena, pero el error es sistemático.',
    },
    {
      q: '¿Cuánto del precio de una botella de licor son impuestos?',
      a: 'Depende del producto y del departamento, pero en los destilados la carga suele ser la mayor parte del precio de góndola. Se combinan dos cosas: un componente específico, que se cobra por grado de alcohol y por volumen, y un componente sobre el precio de venta. Encima de esa suma se calcula el IVA, así que se termina pagando impuesto sobre impuesto. Por eso el mismo whisky cuesta distinto en dos departamentos vecinos.',
    },
    {
      q: '¿Quién cobra el impuesto al consumo de licores y cigarrillos?',
      a: 'Los departamentos, no la nación. Es una de las rentas cedidas más importantes que tienen, y por ley está destinada principalmente a salud y educación. Eso explica dos cosas: por qué las tarifas varían de un departamento a otro, y por qué las gobernaciones persiguen tan fuerte el contrabando de licor y cigarrillo, que les pega directo al presupuesto de salud.',
    },
    {
      q: '¿Cómo se calcula el IBUA de una bebida azucarada?',
      a: `Por volumen y en escalones. Se mira cuántos gramos de azúcar añadido tiene por cada 100 ml, se busca el escalón y se multiplica la tarifa de ese escalón por el volumen del envase. Con las tarifas vigentes: menos de ${IBUA[1].desdeG} g por 100 ml no paga; entre ${IBUA[1].desdeG} y menos de ${IBUA[2].desdeG} g paga ${cop(IBUA[1].tarifaPor100ml)} por cada 100 ml; de ${IBUA[2].desdeG} g en adelante paga ${cop(IBUA[2].tarifaPor100ml)} por cada 100 ml. Como es un valor fijo por volumen, pesa proporcionalmente mucho más en las bebidas baratas que en las caras.`,
    },
    {
      q: '¿El IBUA lo pago yo o el fabricante?',
      a: 'Formalmente lo declara y paga el productor o el importador, pero económicamente lo pagás vos: entra en el precio de góndola. Y como el IBUA se suma antes de calcular el IVA, terminás pagando también el 19% sobre el impuesto. Ese efecto en cascada es la razón por la que un aumento chico de la tarifa se siente más grande en el precio final.',
    },
    {
      q: '¿Desde qué monto paga impuestos una compra en AliExpress o Temu?',
      a: `Depende del origen. Para envíos desde países con tratado de libre comercio vigente, el de minimis es de USD ${MINIMIS.conTlc}: por debajo de eso el envío entra sin arancel ni IVA. Para el resto de los orígenes —donde entra buena parte de lo que se compra en las plataformas asiáticas— el umbral es de USD ${MINIMIS.sinTlc}. Al superarlo se paga arancel según la partida del producto y después IVA del 19% sobre el valor más el arancel.`,
    },
    {
      q: '¿Puedo dividir mi compra en varios envíos para no pagar?',
      a: 'Es una idea vieja y no funciona. El de minimis se controla por destinatario y por envío, y la aduana cruza los envíos que llegan a un mismo nombre y dirección en un período corto. Fraccionar deliberadamente una compra para quedar debajo del umbral es una práctica que la autoridad aduanera desconoce, y el resultado suele ser el aforo del paquete más una demora larga. Además, con varios envíos pagás varias veces el manejo del courier, que muchas veces es más caro que el impuesto que estabas esquivando.',
    },
    {
      q: '¿Qué es el 4×1000 y cuándo lo pago comprando?',
      a: `Es el gravamen a los movimientos financieros: ${(GMF.tasa * 1000).toFixed(0)} pesos por cada mil que salen de tu cuenta. Al comprar con tarjeta débito o al pagar desde tu cuenta bancaria se cobra sobre el valor del pago. Existe una exención mensual medida en UVT para una única cuenta que marques ante tu banco, y mucha gente nunca la activa: si no marcaste ninguna, estás pagando el gravamen desde el primer peso. Con tarjeta de crédito no se cobra al comprar, sino cuando pagás la cuota desde tu cuenta.`,
    },
    {
      q: '¿Cuánto me descuentan si me gano la lotería?',
      a: `La tarifa de ganancia ocasional de loterías, rifas, apuestas y similares es del ${(TARIFA_LOTERIAS * 100).toFixed(0)}% (art. 317 ET). El operador te la retiene al momento de pagarte, cuando el premio supera las ${UMBRAL_PREMIO_UVT} UVT (${cop(UMBRAL_PREMIO_UVT * UVT)} con la UVT vigente). Esa retención es el impuesto: no hay un segundo impuesto después sobre el mismo premio. Sí tenés que llevar el premio y la retención a tu declaración de renta, en la sección de ganancias ocasionales.`,
    },
    {
      q: '¿Y si el premio es un carro o un apartamento?',
      a: 'Tributa igual, sobre el valor comercial del bien. El problema práctico es que la retención se paga en plata y el premio no lo es: el ganador tiene que poner el efectivo antes de recibir el bien, y no es raro que alguien tenga que vender el premio para poder recibirlo. Antes de aceptar un premio en especie conviene hacer la cuenta de cuánto hay que desembolsar.',
    },
    {
      q: '¿Los impuestos al consumo se pueden descontar?',
      a: 'En general no, y ahí está la diferencia grande con el IVA. El IVA es un impuesto en cadena: el comerciante descuenta el que pagó y sólo gira la diferencia. El impoconsumo, el IBUA y el impuesto departamental al alcohol y al tabaco son monofásicos y no generan impuesto descontable, así que se quedan pegados al costo y llegan enteros al consumidor final. Por eso, aunque sus tarifas nominales parezcan bajas al lado del 19%, el efecto en el precio es más directo.',
    },
  ],

  sources: [
    {
      name: 'Estatuto Tributario, art. 512-9 — base gravable y tarifa del impoconsumo en restaurantes',
      url: 'https://estatuto.co/512-9',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 512-1 — Impuesto Nacional al Consumo',
      url: 'https://estatuto.co/512-1',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 513-1 — impuesto a las bebidas ultraprocesadas azucaradas',
      url: 'https://estatuto.co/513-1',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Resolución DIAN 000247 del 30-12-2025 — tarifas del IBUA',
      url: 'https://www.dian.gov.co/normatividad/Paginas/Resoluciones.aspx',
      publisher: 'DIAN',
      date: '30-12-2025',
    },
    {
      name: 'Estatuto Tributario, art. 317 — tarifa de ganancia ocasional para loterías, rifas y apuestas',
      url: 'https://estatuto.co/317',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 404-1 — retención en la fuente sobre premios',
      url: 'https://estatuto.co/404-1',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 879 — exenciones del gravamen a los movimientos financieros',
      url: 'https://estatuto.co/879',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Ley 1816 de 2016 — régimen del monopolio rentístico de licores destilados',
      url: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_1816_2016.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 223 de 1995 — impuesto al consumo de cervezas, licores y cigarrillos',
      url: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_0223_1995.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'DIAN — Tráfico postal y envíos urgentes',
      url: 'https://www.dian.gov.co/aduanas/Paginas/default.aspx',
      publisher: 'DIAN',
    },
  ],

  replaces: [
    '/co/calculadora-impoconsumo-restaurantes-bares-colombia-2026',
    '/co/calculadora-impuesto-bebidas-azucaradas-ibua-colombia-2026',
    '/co/calculadora-impuesto-cervezas-licores-tabaco-colombia-2026',
    '/co/calculadora-impuesto-consumo-licores-colombia-cerveza-vino',
    '/co/calculadora-impuestos-compras-internacionales-colombia-aliexpress-temu',
    '/co/calculadora-impuesto-cardo-tarjeta-credito-internacional-colombia',
    '/co/calculadora-impuesto-loterias-juegos-azar-colombia-2026',
    '/co/calculadora-impuesto-departamento-loterias-vehiculos-cigarrillos',
  ],

lastReviewed: '2026-07-28',
};
