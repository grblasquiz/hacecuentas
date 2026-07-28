import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto vale un CEDEAR y cuánto rinde?"
 * Absorbe las tres calculadoras de ratio/precio teórico (que hacían la misma
 * cuenta con nombres distintos) y las dos de dividendos.
 */

/** Disclaimer YMYL inversión, textual de src/lib/disclaimers.ts (dominio 'investment'). */
const DISCLAIMER =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.';

export const hub: HubData = {
  slug: 'inversiones/cedears',
  title: '¿Cuánto vale un CEDEAR y cuánto rinde? — Precio teórico, ratio y dividendos',
  description:
    'Precio teórico del CEDEAR según el ratio y el dólar CCL, prima o descuento contra el mercado, a qué dólar implícito estás comprando y cuánto cobrás de dividendos. Con el CCL del día cargado.',
  silo: 'Inversiones',
  siloHref: '/inversiones',

  eyebrow: 'Guía y valuación de CEDEARs',
  h1: 'Mirás un CEDEAR: ¿está caro y cuánto te rinde?',
  lede:
    'Partimos del caso más habitual: querés saber cuánto debería valer ese CEDEAR. Ya podés ver el precio teórico con el CCL del día y ajustarlo con tus datos. Si tu duda es otra, la cambiás abajo.',
  stamps: ['Dólar CCL del día', 'Ratio de conversión a mano', '5 calculadoras adentro'],

  resultLabel: 'Precio teórico del CEDEAR',

  cases: {
    title: '¿Qué querés saber?',
    intro: 'Partimos de la duda más frecuente. Si la tuya es distinta, cambiala.',
    items: [
      {
        id: 'teorico',
        label: '¿Cuánto debería valer este CEDEAR?',
        hint: 'Precio teórico y prima',
        answer: 'El precio teórico es el precio de la acción dividido el ratio, pasado a pesos por el CCL.',
        yes: [
          'Precio teórico en pesos según ratio y dólar CCL',
          'Prima o descuento contra el precio de mercado que cargues',
          'Cuánto vale en dólares la fracción de acción que tenés adentro',
        ],
        warn: [
          DISCLAIMER,
          'Una prima o descuento de hasta 2% es ruido de mercado: recién afuera de esa banda hay algo para mirar',
          'El teórico se mueve con el CCL: si el dólar cambia durante la rueda, el número cambia con él',
        ],
        plazo: 'el CCL de referencia es el del cierre anterior; en la rueda puede moverse.',
      },
      {
        id: 'dolar-implicito',
        label: '¿A qué dólar estoy comprando?',
        hint: 'CCL implícito',
        answer: 'Comprando un CEDEAR comprás dólares a un tipo de cambio implícito.',
        yes: [
          'Tipo de cambio implícito que estás pagando en esa operación',
          'Cuánto más caro o barato es que el CCL de referencia',
          'Si conviene entrar por el CEDEAR o comprar el dólar por otra vía',
        ],
        warn: [
          DISCLAIMER,
          'El implícito no contempla comisiones ni derechos de mercado: con montos chicos, esos costos se comen la diferencia',
          'Comprar un CEDEAR te deja expuesto también al precio de la acción, no sólo al dólar',
        ],
        plazo: 'compará siempre contra el CCL del mismo momento, no contra el del día anterior.',
      },
      {
        id: 'equivalencia',
        label: '¿Cuántos CEDEARs son una acción?',
        hint: 'Ratio de conversión',
        answer: 'El ratio te dice cuántos CEDEARs equivalen a una acción entera.',
        yes: [
          'Cuántos CEDEARs necesitás para replicar una acción',
          'Qué fracción de acción representa cada CEDEAR',
          'Cuánto vale tu tenencia en dólares y en pesos',
        ],
        warn: [
          DISCLAIMER,
          'El ratio no es fijo para siempre: puede cambiar por splits de la acción o por decisión del emisor del CEDEAR',
          'Verificá el ratio vigente en la ficha del CEDEAR antes de operar; el que cargues acá es el que manda en el resultado',
        ],
        plazo: 'después de un split de la acción, el ratio se ajusta y conviene rehacer la cuenta.',
      },
      {
        id: 'dividendos-cedear',
        label: '¿Cuánto cobro de dividendos por mis CEDEARs?',
        hint: 'Dividend yield del CEDEAR',
        answer: 'El dividendo llega dividido por el ratio y con la retención de origen ya descontada.',
        yes: [
          'Dividendo anual que le toca a cada CEDEAR, en pesos',
          'Dividend yield sobre el precio que estás pagando',
          'Cuánto queda después de la retención en el país de origen',
        ],
        warn: [
          DISCLAIMER,
          'Los dividendos de acciones de EE. UU. sufren una retención en origen antes de llegar a tu cuenta comitente',
          'Un yield muy alto suele ser señal de que el precio cayó, no de que la empresa pague mejor',
        ],
        plazo: 'el dividendo se acredita días después de la fecha de pago en el mercado de origen.',
      },
      {
        id: 'dividendos-accion',
        label: '¿Cuánto rinde por dividendos esta acción?',
        hint: 'Dividend yield y renta anual',
        answer: 'El dividend yield es el dividendo anual sobre el precio de la acción.',
        yes: [
          'Dividend yield anual de la acción',
          'Renta anual, mensual y por cada pago según la frecuencia',
          'Cuánto capital tenés inmovilizado para conseguir esa renta',
        ],
        warn: [
          DISCLAIMER,
          'El dividendo pasado no garantiza el futuro: se puede recortar o suspender en cualquier momento',
          'Yield por encima del 8% anual amerita revisar el payout antes de entrar',
        ],
        plazo: 'para cobrar un dividendo hay que tener la acción antes de la fecha ex-dividendo.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'precioUsd', label: 'Precio de la acción en el exterior', type: 'number', prefix: 'US$', min: 0, step: 0.01, value: 220 },
    {
      id: 'ratio',
      label: 'Ratio de conversión (CEDEARs por acción)',
      type: 'number',
      min: 1,
      step: 1,
      value: 20,
      help: 'Cuántos CEDEARs equivalen a una acción entera. Buscalo en la ficha del CEDEAR en tu broker: cambia de una especie a otra y puede ajustarse tras un split.',
    },
    {
      id: 'ccl',
      label: 'Dólar CCL de referencia',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Viene cargado con el contado con liquidación del día. Es el tipo de cambio que corresponde para CEDEARs porque es el que surge de operar títulos contra el exterior.',
    },
    { id: 'precioCedear', label: 'Precio del CEDEAR en el mercado (0 si no lo sabés)', prefix: '$', value: '0', thousands: true },
    { id: 'cantidad', label: 'Cantidad de CEDEARs que tenés', type: 'number', min: 0, value: 100 },
    { id: 'dividendoUsd', label: 'Dividendo anual por acción', type: 'number', prefix: 'US$', min: 0, step: 0.01, value: 4 },
    {
      id: 'retencion',
      label: 'Retención en el país de origen',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 30,
      help: 'Los dividendos de acciones de EE. UU. se pagan con retención en la fuente. Confirmá la alícuota que te aplica tu agente antes de proyectar la renta.',
    },
    {
      id: 'frecuencia',
      label: 'Frecuencia de pago del dividendo',
      type: 'select',
      value: 'trimestral',
      options: [
        { value: 'mensual', label: 'Mensual' },
        { value: 'trimestral', label: 'Trimestral' },
        { value: 'semestral', label: 'Semestral' },
        { value: 'anual', label: 'Anual' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu número',
    caption:
      'En las ramas de precio, el marcador muestra la prima o el descuento del CEDEAR contra su valor teórico. En las de dividendos, dónde cae el yield entre bajo, moderado, atractivo y sospechosamente alto.',
  },
  breakdownTitle: 'Los números de la operación',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cuadro.',

  faq: [
    {
      q: '¿Qué es un CEDEAR y qué estoy comprando exactamente?',
      a: 'Es un certificado que cotiza en pesos en el mercado local y representa una fracción de una acción que está depositada en el exterior. No comprás la acción: comprás un certificado sobre ella, emitido por un banco depositario local, que replica su precio y sus dividendos en la proporción del ratio.',
    },
    {
      q: '¿Cómo se calcula el precio teórico de un CEDEAR?',
      a: 'Se toma el precio de la acción en dólares, se divide por el ratio de conversión y se multiplica por el dólar contado con liquidación. Ese número es lo que debería valer el certificado si arbitrara perfectamente contra el exterior.',
    },
    {
      q: '¿Por qué el CEDEAR cotiza distinto del teórico?',
      a: 'Porque el arbitraje no es instantáneo ni gratis: hay comisiones, plazos de liquidación y momentos de poca liquidez. Diferencias de hasta un 2% para arriba o para abajo son ruido normal. Un desvío mayor y sostenido suele reflejar que el CCL de referencia que estás usando no es el que está operando el mercado en ese instante.',
    },
    {
      q: '¿Qué es el dólar implícito de un CEDEAR?',
      a: 'Es el tipo de cambio al que estás comprando dólares sin darte cuenta: el precio del CEDEAR en pesos, multiplicado por el ratio y dividido por el precio de la acción en dólares. Si ese número queda por debajo del CCL, estás entrando con descuento; si queda por encima, pagás una prima.',
    },
    {
      q: '¿Por qué se usa el CCL y no el dólar oficial o el blue?',
      a: 'Porque el CEDEAR nace de operar títulos contra el exterior, y ese es exactamente el mecanismo del contado con liquidación. Usar el oficial o el blue da un teórico que no se corresponde con el precio al que el mercado puede arbitrar el certificado.',
    },
    {
      q: '¿El ratio de conversión es siempre el mismo?',
      a: 'No. Cada especie tiene el suyo y puede ajustarse cuando la acción hace un split o el emisor decide modificarlo. Por eso el ratio se carga a mano acá: una tabla fija se desactualiza y te da un precio teórico equivocado sin avisar.',
    },
    {
      q: '¿Cobro los dividendos de la acción si tengo el CEDEAR?',
      a: 'Sí, en la proporción que marca el ratio y ya convertidos a pesos. Llegan a la cuenta comitente unos días después del pago en el mercado de origen y, en el caso de acciones de EE. UU., con la retención en la fuente ya descontada.',
    },
    {
      q: '¿Cuánto retienen por los dividendos?',
      a: 'Los dividendos de acciones estadounidenses se pagan con una retención en origen que se descuenta antes de que la plata llegue a tu cuenta. La alícuota depende del tratado aplicable y de cómo esté declarado el titular; confirmala con tu agente y cargala en el campo correspondiente.',
    },
    {
      q: '¿Qué dividend yield se considera alto?',
      a: 'Como referencia gruesa: por debajo del 2% es propio de compañías de crecimiento que reinvierten todo; entre 2% y 4% es lo típico de una compañía madura; entre 4% y 8% aparece en acciones de valor y fondos inmobiliarios; y por encima del 8% conviene desconfiar, porque casi siempre significa que el precio se derrumbó y el dividendo está por recortarse.',
    },
    {
      q: '¿Conviene comprar el CEDEAR o la acción directamente afuera?',
      a: 'Depende del costo de sacar los dólares y del tamaño de la operación. El CEDEAR se compra en pesos, sin abrir cuenta en el exterior y con lotes chicos; la acción directa evita el ratio y el riesgo del emisor local, pero requiere tener los dólares afuera. Con montos chicos, las comisiones suelen inclinar la balanza al CEDEAR.',
    },
    {
      q: '¿Los CEDEARs pagan impuestos?',
      a: 'La renta y el resultado de la compraventa tienen tratamiento impositivo propio, y además el activo se computa para bienes personales. Como el régimen cambia y depende de tu situación, confirmalo con un contador antes de calcular el rendimiento neto.',
    },
    {
      q: '¿Qué pasa si el CEDEAR tiene poco volumen?',
      a: 'Que la punta compradora y la vendedora se abren, y el precio se aleja del teórico. En especies poco operadas podés terminar pagando una prima grande sólo por entrar, y sufrirla de nuevo al salir. Mirá el spread antes de mandar la orden.',
    },
  ],

  sources: [
    {
      name: 'Certificados de Depósito Argentinos (CEDEAR) — régimen y ratios',
      url: 'https://www.byma.com.ar/cedears/',
      publisher: 'Bolsas y Mercados Argentinos (BYMA)',
    },
    {
      name: 'Guía del inversor — qué son los CEDEAR',
      url: 'https://www.argentina.gob.ar/cnv',
      publisher: 'Comisión Nacional de Valores',
    },
    {
      name: 'Cotización del dólar contado con liquidación',
      url: 'https://dolarapi.com/v1/dolares',
      publisher: 'DolarAPI',
    },
    {
      name: 'Publication 515 — Withholding of Tax on Nonresident Aliens',
      url: 'https://www.irs.gov/forms-pubs/about-publication-515',
      publisher: 'Internal Revenue Service (EE. UU.)',
    },
  ],

  replaces: [
    '/calculadora-cedear-precio-teorico-ratio-conversion',
    '/calculadora-cedear-ratio-conversion-dolares',
    '/calculadora-cedears-ratio-conversion-apple-microsoft',
    '/calculadora-cedear-dividend-yield-2026',
    '/calculadora-dividendos-yield-anual',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Pagos por año según la frecuencia declarada (espejo de dividendos-yield-anual.ts). */
export const PAGOS_POR_ANIO: Record<string, number> = {
  mensual: 12,
  trimestral: 4,
  semestral: 2,
  anual: 1,
};
