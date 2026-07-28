import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me sale de verdad traerlo de afuera?"
 *
 * Absorbe 2 URLs sueltas (ver `replaces`):
 *   - /calculadora-impuestos-courier-temu-shein-argentina
 *   - /calculadora-costo-envio-compra-exterior
 *
 * Marco normativo aplicado (verificado el 28-07-2026):
 *  - Decreto 1065/2024 + RG ARCA: régimen courier de pequeños envíos. Franquicia
 *    de US$400 FOB por envío, 5 envíos por año calendario y por persona, tope de
 *    US$3.000 y 50 kg por envío, hasta 3 unidades iguales. La franquicia libera
 *    DERECHO DE IMPORTACIÓN y TASA DE ESTADÍSTICA, **no** el IVA ni los impuestos
 *    internos: eso se paga siempre.
 *  - Decreto 604/2026 (BO 17-07-2026): equipara el envío postal puerta a puerta
 *    (Correo Argentino) al courier — misma franquicia de US$400 FOB y 5 envíos
 *    por año — y ELIMINA el arancel único del 50% sobre el excedente y la vieja
 *    franquicia de US$50 con 12 envíos anuales.
 *  - Compra con tarjeta en un sitio del exterior: sin Impuesto PAÍS (derogado
 *    22-12-2024) y sin percepción del 30% desde el 02-01-2026. Eso lo cubre
 *    /impuestos/retenciones; acá no se recarga el consumo.
 */

/** Régimen simplificado de envíos: courier privado y postal, unificados por el Decreto 604/2026. */
export const ENVIOS_2026 = {
  franquiciaFobUSD: 400,
  enviosPorAnio: 5,
  topeEnvioUSD: 3000,
  topeKgCourier: 50,
  topeKgPostal: 20,
  unidadesIgualesMax: 3,
  /** Tasa de estadística: 3% sobre el valor en aduana, solo fuera de la franquicia. */
  tasaEstadistica: 0.03,
  /** IVA general de importación: se paga siempre, también dentro de la franquicia. */
  iva: 0.21,
  /** Percepción de IVA adicional del régimen general (no aplica al simplificado). */
  ivaAdicionalGeneral: 0.2,
  /** Percepción a cuenta de Ganancias del régimen general. */
  gananciasGeneral: 0.06,
} as const;

const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'impuestos/comprar-en-el-exterior',
  title: 'Comprar en el exterior: cuánto pagás de impuestos y qué te sale puesto en casa',
  description:
    'Calculá el precio final de una compra en Temu, Shein, AliExpress o Amazon puesta en tu casa: producto, envío, IVA, derechos sobre el excedente de la franquicia de US$400 y gastos de despacho.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Aduana y régimen de envíos',
  h1: '¿Cuánto me sale de verdad traerlo de afuera?',
  lede:
    'El precio del carrito no es lo que pagás. Elegí cómo te llega el paquete y mirá el costo final puesto en tu casa: producto, envío, IVA, derechos si te pasás de la franquicia y los gastos que cobra el courier.',
  stamps: [
    'Franquicia US$400 FOB por envío',
    '5 envíos por año y por persona',
    'Decreto 604/2026 · postal equiparado al courier',
  ],

  resultLabel: 'Costo final estimado',

  cases: {
    title: '¿Cómo te llega el paquete?',
    intro:
      'Arrancamos por el caso más común: compraste en una plataforma como Temu, Shein o AliExpress y te llega por courier.',
    items: [
      {
        id: 'plataforma',
        label: 'Compré en Temu, Shein o AliExpress',
        hint: 'Courier · franquicia US$400',
        answer:
          'Hasta US$400 FOB por envío no pagás derechos ni tasa de estadística, pero el IVA se paga igual.',
        yes: [
          'Precio del producto y el envío que te cobró la plataforma',
          'IVA del 21% sobre el valor en aduana: la franquicia no lo exime',
          'Los gastos de gestión y despacho que suma el operador antes de entregarte',
          'Cuántos de tus 5 envíos anuales con franquicia te quedan',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La franquicia de US$400 libera el derecho de importación y la tasa de estadística, no el IVA ni los impuestos internos: cualquier cálculo que te dé "US$0 de impuestos" está incompleto.',
          'La franquicia se mide sobre el valor FOB (la mercadería sola). Si la plataforma declara producto más envío junto, podés quedar arriba de los US$400 sin darte cuenta.',
          'Máximo 3 unidades iguales por envío: si comprás 5 remeras iguales, el envío puede caer al régimen general.',
        ],
        plazo:
          'el cupo de 5 envíos es por año calendario y por CUIT/CUIL: se reinicia el 1 de enero, no rota cada 12 meses.',
      },
      {
        id: 'courier',
        label: 'Me lo mandan por DHL, FedEx o UPS',
        hint: 'Courier privado · pequeño envío',
        answer:
          'Mismo régimen y misma franquicia que las plataformas, pero los gastos de gestión del courier pesan más.',
        yes: [
          'Franquicia de US$400 FOB, hasta 5 envíos por año y por persona',
          'Tope de US$3.000 y 50 kg por envío',
          'IVA del 21% sobre el valor en aduana',
          'Los honorarios de gestión y despacho del operador, con su propio IVA',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El courier declara por vos y te avisa cuánto hay que pagar antes de entregarte: si no pagás, el paquete queda en depósito y corren gastos de almacenaje.',
          'El flete internacional forma parte del valor en aduana aunque no cuente para la franquicia FOB: paga IVA igual.',
          'Los gastos de gestión no son un impuesto: los cobra la empresa y varían mucho entre operadores. Preguntalos antes de elegir el envío.',
        ],
        plazo:
          'los tributos se pagan al operador antes de la entrega; el despacho suele resolverse en 24 a 72 horas hábiles.',
      },
      {
        id: 'postal',
        label: 'Me llega por Correo Argentino (puerta a puerta)',
        hint: 'Decreto 604/2026 · US$400',
        answer:
          'Desde el 17-07-2026 el correo oficial tiene la misma franquicia de US$400 que el courier, y se terminó el 50% sobre el excedente.',
        yes: [
          'Franquicia de US$400 FOB por envío, con 5 envíos por año',
          'Se eliminó el arancel único del 50% sobre el excedente y la vieja franquicia de US$50',
          'IVA del 21% sobre el valor en aduana',
          'Costos de gestión más bajos que un courier privado',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El cupo bajó de 12 envíos anuales (con US$50) a 5 envíos (con US$400): si hacías muchas compras chicas, ahora se te agota antes.',
          'El tope de peso del canal postal es más bajo que el del courier privado: revisá el bulto antes de elegir el envío más barato.',
          'Cualquier guía que todavía hable de "50% sobre lo que excede US$50" quedó vieja el 17 de julio de 2026.',
        ],
        plazo:
          'si hay tributos que pagar, el correo te notifica y el retiro o la entrega quedan condicionados al pago.',
      },
      {
        id: 'excedente',
        label: 'Mi compra pasa los US$400',
        hint: 'Derechos sobre el excedente',
        answer:
          'Solo tributa lo que excede la franquicia: derechos según el producto, más 3% de tasa de estadística, más IVA sobre todo.',
        yes: [
          'Derecho de importación sobre el excedente, con la alícuota de la posición arancelaria del producto',
          'Tasa de estadística del 3% sobre el excedente',
          'IVA del 21% sobre valor en aduana más derechos y tasa',
          'La comparación con dividir la compra en envíos de hasta US$400',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La alícuota del derecho depende del producto: la indumentaria suele estar arriba (hasta 35%) y la electrónica más abajo. Cargá la de tu posición arancelaria, no un promedio.',
          'Dividir una misma compra en varios envíos para esquivar la franquicia puede ser tomado como fraccionamiento: usá el cupo con criterio y guardá los comprobantes.',
          'Si el excedente es chico, muchas veces conviene igual: el ahorro de dividir en dos envíos se come rápido con dos gastos de gestión.',
        ],
        plazo:
          'el valor lo determina la aduana: si el declarado le parece bajo, puede ajustarlo y recalcular los tributos.',
      },
      {
        id: 'general',
        label: 'Pasa US$3.000 o pesa más de lo permitido',
        hint: 'Régimen general · con despachante',
        answer:
          'Fuera del régimen simplificado se paga todo: derechos, tasa, IVA, IVA adicional, Ganancias y despachante.',
        yes: [
          'Derecho de importación sobre el valor en aduana completo',
          'Tasa de estadística del 3%',
          'IVA del 21% más la percepción de IVA adicional del 20%',
          'Percepción del 6% a cuenta de Ganancias y los honorarios del despachante',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Este canal necesita despachante de aduana y CUIT habilitado: no es una compra "puerta a puerta" y los costos fijos son altos.',
          'Las percepciones de IVA adicional y Ganancias son recuperables si estás inscripto; si no, se piden por devolución.',
          'Los honorarios del despachante y los gastos de terminal no están en esta estimación: pedí presupuesto antes de comprar.',
        ],
        plazo:
          'el despacho general lleva días o semanas y genera gastos de depósito mientras el bulto espera.',
      },
      {
        id: 'cupo',
        label: 'Ya usé los 5 envíos del año',
        hint: 'Sin franquicia',
        answer:
          'Sin franquicia disponible, el envío tributa desde el primer dólar: derechos y tasa sobre todo el valor.',
        yes: [
          'Derecho de importación sobre el valor total, sin los US$400 exentos',
          'Tasa de estadística del 3% sobre el valor en aduana',
          'IVA del 21% sobre valor en aduana más derechos y tasa',
          'La comparación contra lo que hubieras pagado con franquicia disponible',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El cupo es por persona y por año calendario: podés esperar a enero o usar el cupo de otra persona a su nombre, con su documentación.',
          'Comprar a nombre de un tercero para estirar el cupo transfiere la responsabilidad aduanera a esa persona: es su envío, no el tuyo.',
          'Antes de comprar sin franquicia, compará con el precio local: la diferencia se achica mucho.',
        ],
        plazo:
          'el cupo se reinicia el 1 de enero; podés consultar cuántos envíos usaste en el portal de ARCA con clave fiscal nivel 2.',
      },
    ],
  },

  inputsTitle: 'Cargá tu compra',
  inputsIntro:
    'Poné el precio del producto y el envío tal como figuran en el checkout, en dólares. Cada caso usa solo los campos que necesita.',
  fields: [
    {
      id: 'producto',
      label: 'Precio del producto, en dólares',
      prefix: 'US$',
      type: 'number',
      min: 0,
      step: 1,
      value: 250,
      help: 'Es el valor FOB: la mercadería sola, sin flete ni seguro. Es el que se compara contra la franquicia de US$400.',
    },
    {
      id: 'envio',
      label: 'Costo del envío, en dólares',
      prefix: 'US$',
      type: 'number',
      min: 0,
      step: 1,
      value: 20,
      help: 'No cuenta para la franquicia, pero sí forma parte del valor en aduana sobre el que se calcula el IVA.',
    },
    {
      id: 'gestion',
      label: 'Gastos de gestión y despacho del operador, en dólares',
      prefix: 'US$',
      type: 'number',
      min: 0,
      step: 1,
      value: 25,
      help: 'Lo que cobra el courier o el correo por hacer el trámite. No es un impuesto: pedilo antes de elegir el envío.',
    },
    {
      id: 'arancel',
      label: 'Derecho de importación del producto, en %',
      type: 'number',
      min: 0,
      max: 35,
      step: 0.5,
      value: 20,
      help: 'Alícuota de la posición arancelaria. Indumentaria y calzado suelen estar en 35%; electrónica, entre 0% y 16%. Solo se aplica fuera de la franquicia.',
    },
    {
      id: 'enviosUsados',
      label: 'Envíos con franquicia que ya usaste este año',
      type: 'number',
      min: 0,
      max: 5,
      step: 1,
      value: 0,
      help: 'Son 5 por año calendario y por persona. Si ya los usaste todos, el envío tributa desde el primer dólar.',
    },
    {
      id: 'dolar',
      label: 'Cotización del dólar, en pesos',
      prefix: '$',
      value: '1.520',
      thousands: true,
      help: 'Para pesificar el total. Los tributos aduaneros se liquidan al tipo de cambio oficial del día del despacho.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué está hecho el precio final',
    caption:
      'El anillo separa lo que se lleva el vendedor (producto y envío) de lo que se lleva la aduana y de lo que cobra el operador por gestionar el despacho.',
  },
  breakdownTitle: 'Cómo se arma el precio puesto en tu casa',
  breakdownIntro:
    'Cada fila está en dólares. Abajo del todo tenés el mismo total pesificado a la cotización que cargaste.',

  faq: [
    {
      q: '¿Cuánto puedo comprar sin pagar impuestos en el exterior?',
      a: 'Sin pagar derecho de importación ni tasa de estadística, hasta US$400 FOB por envío, con un máximo de 5 envíos por año calendario y por persona. Pero "sin impuestos" no es literal: el IVA del 21% se paga igual, también dentro de la franquicia. Cualquier calculadora que te muestre cero impuestos por una compra de US$300 se está olvidando del IVA.',
    },
    {
      q: '¿Qué cambió con el Decreto 604/2026?',
      a: 'Desde su publicación el 17 de julio de 2026, los envíos postales del Correo Argentino quedaron equiparados al courier privado: franquicia de US$400 FOB por envío y 5 envíos anuales. Antes el puerta a puerta tenía una franquicia de US$50 con 12 operaciones por año y pagaba un arancel único del 50% sobre el excedente; ese 50% se eliminó.',
    },
    {
      q: '¿Cuál es la diferencia entre courier y puerta a puerta?',
      a: 'El courier es una empresa privada (DHL, FedEx, UPS o el operador que contrata la plataforma) y el puerta a puerta va por el operador postal oficial. Desde el Decreto 604/2026 el tratamiento tributario es prácticamente el mismo; lo que cambia son los topes de peso, los tiempos de entrega y, sobre todo, los gastos de gestión, que en el correo suelen ser bastante más bajos.',
    },
    {
      q: '¿Se sigue pagando la percepción del 30% cuando compro en un sitio del exterior con tarjeta?',
      a: 'No. El Impuesto PAÍS quedó derogado el 22 de diciembre de 2024 y la percepción del 30% a cuenta de Ganancias y Bienes Personales dejó de aplicarse a los consumos en moneda extranjera el 2 de enero de 2026. Sigue vigente solo para servicios turísticos pagados en pesos. Eso es un impuesto sobre el pago, distinto de los tributos aduaneros de este cálculo.',
    },
    {
      q: '¿Sobre qué se calcula el IVA de la importación?',
      a: 'Sobre el valor en aduana —producto más flete y seguro— con los derechos y la tasa de estadística ya sumados. Por eso el envío, que no cuenta para la franquicia de US$400, sí encarece el IVA. La alícuota general es del 21%; algunos bienes, como libros, tienen tratamiento diferencial.',
    },
    {
      q: '¿Qué pasa si me paso de los US$400?',
      a: 'Solo tributa el excedente, no toda la compra: sobre esa diferencia se aplica el derecho de importación de la posición arancelaria del producto más la tasa de estadística del 3%, y después el IVA sobre el conjunto. Un excedente chico casi nunca justifica dividir la compra en dos envíos, porque pagás dos veces los gastos de gestión.',
    },
    {
      q: '¿Cuántos envíos con franquicia tengo por año?',
      a: 'Cinco por año calendario y por persona, identificados con tu CUIT o CUIL. Se reinician el 1 de enero, no rotan cada 12 meses. Podés consultar cuántos usaste en el portal de ARCA con clave fiscal de nivel 2. Agotado el cupo, el envío siguiente tributa desde el primer dólar.',
    },
    {
      q: '¿Hay límite de peso o de cantidad de unidades?',
      a: 'Sí. El envío no puede superar los US$3.000 de valor y tiene tope de peso por bulto —más alto en el courier privado que en el canal postal—, además de un máximo de 3 unidades iguales por envío. Si te pasás de cualquiera de esos límites, el paquete sale del régimen simplificado y entra al general, con despachante de aduana.',
    },
    {
      q: '¿Los gastos de gestión del courier son un impuesto?',
      a: 'No. Son honorarios de la empresa por hacer el trámite aduanero, entregarte y, a veces, por almacenaje. Varían mucho entre operadores y llevan su propio IVA. Es la parte del costo final que más podés bajar eligiendo el canal de envío, así que conviene preguntarlos antes de comprar.',
    },
    {
      q: '¿Conviene comprar afuera o acá?',
      a: 'Depende de cuánto pese el impuesto sobre el precio de lista. Con la franquicia disponible y una compra de menos de US$400, el recargo típico es el IVA más los gastos de gestión. Si el cupo ya está agotado o te pasás de la franquicia, se suman derechos y tasa y la diferencia con el precio local se achica bastante. Compará siempre contra el precio puesto en tu casa, no contra el del carrito.',
    },
    {
      q: '¿Puedo comprar a nombre de otra persona para estirar el cupo?',
      a: 'El envío se declara a nombre de quien lo recibe y esa persona es la responsable ante la aduana, con su CUIT y su cupo. No es un truco sin consecuencias: si hay una diferencia de valor o un problema con la mercadería, el trámite lo tiene que resolver el destinatario declarado.',
    },
    {
      q: '¿Qué pasa si la aduana no le cree al valor declarado?',
      a: 'Puede ajustar el valor y recalcular los tributos sobre esa base, y pedirte el comprobante de la compra. Por eso conviene guardar el detalle del pedido y el resumen de la tarjeta: son la prueba de lo que pagaste realmente.',
    },
  ],

  sources: [
    {
      name: 'Pequeños envíos por courier — condiciones, franquicia y cupo anual',
      url: 'https://www.afip.gob.ar/envios-internacionales/courier/importacion/pequenios-envios.asp',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Decreto 604/2026 — régimen de envíos postales internacionales',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/344470/20260717',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '17-07-2026',
    },
    {
      name: 'Decreto 1065/2024 — régimen simplificado de courier',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/319180/20241202',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '02-12-2024',
    },
    {
      name: 'Puerta a puerta — envíos internacionales',
      url: 'https://www.afip.gob.ar/envios-internacionales/puerta-a-puerta/monto.asp',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Decreto 1057/2024 — fin del Impuesto PAÍS',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/319178/20241202',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '02-12-2024',
    },
    {
      name: 'Ley 27.541 y tasa de estadística — Código Aduanero, tributos a la importación',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/15000-19999/16536/texact.htm',
      publisher: 'InfoLeg',
    },
  ],

  replaces: [
    '/calculadora-impuestos-courier-temu-shein-argentina',
    '/calculadora-costo-envio-compra-exterior',
  ],

  lastReviewed: '2026-07-28',
  audience: 'AR',
};
