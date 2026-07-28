import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánto pago al año por tener este inmueble?"
 *
 * Absorbe predial de Bogotá, predial de Medellín, contribución de valorización y
 * tasación por m². La base de todas es la misma: el avalúo catastral. Por eso el
 * hub arranca por ahí y después reparte según ciudad y estrato.
 *
 * PROCEDENCIA DE LOS DATOS, explícita porque no toda es igual de firme:
 *  - Bogotá: tabla progresiva residencial completa del art. 1 de la Resolución
 *    SDH-000194 del 12-dic-2025, tal como ya estaba transcrita y verificada en
 *    src/lib/formulas/impuesto-predial-bogota-2026.ts. La tabla maestra
 *    (colombia-2026.ts) sólo guarda los extremos, con una nota que pide
 *    transcribir el resto: acá se reusa la transcripción, no se reinventa.
 *  - Medellín: ⚠️ REFERENCIAL. Las tarifas por estrato las fija el Acuerdo
 *    municipal y no están ni en la tabla maestra ni verificadas contra fuente
 *    oficial. Se muestran como orden de magnitud y el campo queda editable.
 *  - Valorización: el municipio ASIGNA el monto por predio según el beneficio de
 *    la obra. El hub no lo inventa: lo pedís vos de tu resolución de cobro y el
 *    hub sólo compara contado contra cuotas.
 *  - Precio por m²: ⚠️ REFERENCIAL y editable. La fórmula vieja
 *    `tasacion-vivienda-colombia-precio-m2-zona-estrato.ts` atribuía su tabla de
 *    precios por barrio a "DIAN 2026, IGAC, Superfinanciera": ninguna de las tres
 *    publica precios de mercado por m² por barrio. Esa atribución no se replica.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const SMLMV = COLOMBIA_2026.smlmv;
export const PREDIAL_BOGOTA = COLOMBIA_2026.predialBogota;

/**
 * Tabla residencial urbana de Bogotá: tarifa por mil según rango de avalúo catastral.
 * OJO: la tarifa del rango se aplica sobre TODO el avalúo, no es marginal.
 * Fuente: art. 1 Resolución SDH-000194 del 12-12-2025.
 * `Infinity` no sobrevive a la serialización de `define:vars` → viaja como null.
 */
export const TABLA_RESIDENCIAL_BOGOTA: Array<{ hasta: number | null; porMil: number }> = [
  { hasta: 194_307_000, porMil: 5.5 },
  { hasta: 207_062_000, porMil: 5.6 },
  { hasta: 238_375_000, porMil: 5.7 },
  { hasta: 269_690_000, porMil: 5.8 },
  { hasta: 301_005_000, porMil: 5.9 },
  { hasta: 332_318_000, porMil: 6.0 },
  { hasta: 363_632_000, porMil: 6.1 },
  { hasta: 394_946_000, porMil: 6.2 },
  { hasta: 447_136_000, porMil: 6.3 },
  { hasta: 499_330_000, porMil: 6.4 },
  { hasta: 551_518_000, porMil: 6.5 },
  { hasta: 603_709_000, porMil: 6.6 },
  { hasta: 655_899_000, porMil: 6.8 },
  { hasta: 708_090_000, porMil: 7.0 },
  { hasta: 760_279_000, porMil: 7.2 },
  { hasta: 812_470_000, porMil: 7.4 },
  { hasta: 864_660_000, porMil: 7.6 },
  { hasta: 937_727_000, porMil: 7.8 },
  { hasta: 1_010_794_000, porMil: 8.0 },
  { hasta: 1_083_859_000, porMil: 8.2 },
  { hasta: 1_156_929_000, porMil: 8.4 },
  { hasta: 1_229_992_000, porMil: 8.6 },
  { hasta: 1_303_058_000, porMil: 8.8 },
  { hasta: 1_376_126_000, porMil: 9.0 },
  { hasta: 1_449_192_000, porMil: 9.2 },
  { hasta: 1_710_142_000, porMil: 9.5 },
  { hasta: 1_971_099_000, porMil: 10.1 },
  { hasta: 2_232_051_000, porMil: 10.8 },
  { hasta: 2_505_139_000, porMil: 11.5 },
  { hasta: null, porMil: 12.3 },
];

/** Umbrales de la tarifa preferencial de estratos 1 y 2 en Bogotá (Acuerdo 648 de 2016), en SMLMV. */
export const PREFERENCIAL_BOGOTA = {
  exclusionSmlmv: 16,
  umbral1PorMilSmlmv: 107,
  topeSmlmv: PREDIAL_BOGOTA.preferencialEstratos.topeAvaluoSmlmv,
  porMilBajo: PREDIAL_BOGOTA.preferencialEstratos.estrato1y2DesdePorMil,
  porMilAlto: PREDIAL_BOGOTA.preferencialEstratos.estrato1y2HastaPorMil,
  porMilEstrato3: PREDIAL_BOGOTA.preferencialEstratos.estrato3PorMil,
};

/**
 * ⚠️ REFERENCIAL — tarifas residenciales por estrato en Medellín (por mil).
 * No verificadas contra el Acuerdo municipal vigente. El campo de tarifa del hub
 * es editable justamente por esto.
 */
export const TARIFA_MEDELLIN_POR_MIL: Record<string, number> = {
  '1': 5.0,
  '2': 5.5,
  '3': 6.5,
  '4': 8.0,
  '5': 9.5,
  '6': 11.0,
};

/** Relación típica avalúo catastral / valor comercial, para estimar cuando no tenés el recibo. */
export const RATIO_CATASTRAL_COMERCIAL = 0.7;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/impuestos/predial-y-avaluo',
  title: 'Impuesto predial en Colombia: cuánto pago por mi casa en Bogotá o Medellín',
  description:
    'Calculá el impuesto predial con la tabla oficial de Bogotá (Resolución SDH-000194), la tarifa preferencial por estrato, el estimado de Medellín y la contribución de valorización, partiendo del avalúo catastral.',
  silo: 'Impuestos',
  siloHref: '/co/impuestos',
  locale: 'co',

  eyebrow: 'Colombia · predial y avalúo catastral',
  h1: '¿Cuánto pago al año por tener este inmueble?',
  lede:
    'Todo arranca en el avalúo catastral: de ahí sale el predial, de ahí sale la contribución de valorización y contra eso se compara el precio de mercado cuando querés vender. Si no tenés el recibo a mano, el hub te estima el avalúo desde los metros cuadrados y después liquida.',
  stamps: [
    `SMLMV vigente: ${cop(SMLMV)}`,
    'Resolución SDH-000194 del 12-12-2025 · Ley 44 de 1990',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Lo que pagás este año por el predio',

  cases: {
    title: '¿Dónde está el predio y en qué estrato?',
    intro:
      'La mecánica es la misma en todo el país —avalúo por tarifa por mil— pero la tabla la fija cada municipio. Bogotá es la única con tabla oficial completa cargada acá; el resto va como estimación editable.',
    items: [
      {
        id: 'bogota',
        label: 'Bogotá, estrato 4, 5 o 6 (o uso comercial)',
        hint: 'Tabla progresiva oficial · 5,5‰ a 12,3‰',
        answer: 'La tarifa sube con el avalúo, del 5,5 por mil al 12,3 por mil, y se aplica sobre todo el avalúo.',
        yes: [
          'Tabla progresiva por rangos de avalúo del art. 1 de la Resolución SDH-000194',
          `Descuento del ${(PREDIAL_BOGOTA.descuentoProntoPago * 100).toFixed(0)}% pagando en la fecha de pronto pago`,
          'Posibilidad de pagar en cuotas si declarás dentro del plazo del sistema SPAC',
          'El avalúo catastral se actualiza cada año por decreto distrital',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tarifa NO es marginal: si tu avalúo cruza al rango siguiente, la tarifa más alta se aplica sobre el avalúo completo, no sólo sobre el excedente. Por eso un peso más de avalúo puede costarte bastante más de impuesto',
          'El uso comercial tiene su propia tarifa y no entra en la tabla residencial',
          'Hay un límite legal al crecimiento anual del impuesto respecto del año anterior: si te llega un salto enorme, revisá el recibo antes de pagar',
        ],
        plazo: `el descuento por pronto pago vence en abril y la fecha límite sin sanción es a mediados de año.`,
      },
      {
        id: 'bogota-preferencial',
        label: 'Bogotá, estrato 1, 2 o 3',
        hint: 'Tarifa preferencial · exclusión por avalúo bajo',
        answer: `Con avalúo bajo el predio queda excluido del impuesto, y por encima paga 1 o 3 por mil.`,
        yes: [
          `Estratos 1 y 2 con avalúo menor a ${PREFERENCIAL_BOGOTA.exclusionSmlmv} SMLMV (${cop(PREFERENCIAL_BOGOTA.exclusionSmlmv * SMLMV)}): excluidos del impuesto`,
          `De ahí hasta ${PREFERENCIAL_BOGOTA.umbral1PorMilSmlmv} SMLMV: ${PREFERENCIAL_BOGOTA.porMilBajo} por mil`,
          `Entre ${PREFERENCIAL_BOGOTA.umbral1PorMilSmlmv} y ${PREFERENCIAL_BOGOTA.topeSmlmv} SMLMV: ${PREFERENCIAL_BOGOTA.porMilAlto} por mil`,
          `Estrato 3 hasta ${PREFERENCIAL_BOGOTA.topeSmlmv} SMLMV: ${PREFERENCIAL_BOGOTA.porMilEstrato3} por mil`,
          `El mismo descuento del ${(PREDIAL_BOGOTA.descuentoProntoPago * 100).toFixed(0)}% por pronto pago`,
        ],
        warn: [
          DISCLAIMER_TAX,
          `La tarifa preferencial tiene tope: por encima de ${PREFERENCIAL_BOGOTA.topeSmlmv} SMLMV de avalúo (${cop(PREFERENCIAL_BOGOTA.topeSmlmv * SMLMV)}) el predio pasa a la tabla general, aunque el estrato siga siendo bajo`,
          'El estrato es de la manzana, no del predio: si te reestratificaron, el beneficio puede cambiar de un año a otro',
          'Estar excluido del impuesto no te exime de declarar cuando la Secretaría lo exige',
        ],
        plazo: 'la exclusión se aplica sola en la factura; si no aparece, hay que reclamarla ante la Secretaría de Hacienda.',
      },
      {
        id: 'medellin',
        label: 'Medellín u otro municipio',
        hint: '⚠️ Tarifa referencial, editable',
        answer: 'Misma mecánica —avalúo por tarifa por mil— pero la tarifa la fija cada municipio.',
        yes: [
          'Avalúo catastral por la tarifa por mil que fije el Acuerdo municipal',
          'Descuento por pronto pago, cuando el municipio lo ofrece',
          'La Ley 44 de 1990 fija el marco: tarifa entre 1 y 16 por mil según uso y estrato',
        ],
        warn: [
          DISCLAIMER_TAX,
          '⚠️ Las tarifas por estrato de esta rama son REFERENCIALES: no están verificadas contra el Acuerdo municipal vigente. Cambialas por la de tu recibo antes de tomar cualquier decisión con este número',
          'Muchos municipios cobran además sobretasas destinadas (bomberos, ambiental, alumbrado) que no entran en la tarifa por mil y llegan sumadas en la misma factura',
        ],
        plazo: 'cada municipio fija su propio calendario y su propio descuento por pronto pago.',
      },
      {
        id: 'valorizacion',
        label: 'Me llegó una contribución de valorización',
        hint: 'Decreto 1604 de 1966 · contado vs cuotas',
        answer: 'La valorización no se calcula: el municipio te la asigna. Lo que sí se decide es cómo pagarla.',
        yes: [
          'El monto sale de tu resolución de cobro: el municipio lo asigna según el beneficio que la obra le da a tu predio',
          'Descuento por pago de contado, cuando el proyecto lo ofrece',
          'Financiación en cuotas con interés, por sistema de amortización francés',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La contribución de valorización es distinta del predial y se cobra aparte: son dos facturas, no una',
          'El porcentaje de descuento y la tasa de financiación los fija cada proyecto: usá los de TU resolución, no los del ejemplo',
          'Se puede recurrir la asignación si considerás que el beneficio no corresponde, pero hay plazos cortos desde la notificación',
        ],
        plazo: 'el descuento de contado suele vencer pocas semanas después de la notificación de la resolución.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu predio',
  inputsIntro:
    'Si tenés el recibo, cargá el avalúo catastral y listo. Si no lo tenés, dejalo en cero y el hub lo estima desde los metros cuadrados y el precio de referencia por m².',
  fields: [
    {
      id: 'avaluo',
      label: 'Avalúo catastral del predio (COP)',
      prefix: '$',
      value: '320.000.000',
      thousands: true,
      help: 'El que figura en tu factura de predial. Dejalo en cero para que se estime desde el área y el precio por m².',
    },
    {
      id: 'area',
      label: 'Área construida (m²)',
      type: 'number',
      value: 72,
      min: 0,
      max: 5000,
      step: 1,
      help: 'Sólo se usa si dejaste el avalúo en cero.',
    },
    {
      id: 'precioM2',
      label: 'Precio de referencia por m² en tu zona (COP)',
      prefix: '$',
      value: '6.000.000',
      thousands: true,
      help: 'Precio COMERCIAL por m² de tu barrio, el que ves en portales inmobiliarios. Es una referencia que ponés vos: acá no hay ninguna tabla oficial de precios por barrio, porque no existe.',
    },
    {
      id: 'estrato',
      label: 'Estrato',
      type: 'select',
      value: '4',
      options: [
        { value: '1', label: 'Estrato 1' },
        { value: '2', label: 'Estrato 2' },
        { value: '3', label: 'Estrato 3' },
        { value: '4', label: 'Estrato 4' },
        { value: '5', label: 'Estrato 5' },
        { value: '6', label: 'Estrato 6' },
        { value: 'comercial', label: 'Uso comercial' },
      ],
      help: 'Define si te toca la tarifa preferencial o la tabla general.',
    },
    {
      id: 'tarifaMunicipio',
      label: 'Tarifa por mil de tu municipio',
      type: 'number',
      value: 6.5,
      min: 0,
      max: 20,
      step: 0.1,
      suffix: '‰',
      help: 'Sólo para la rama de Medellín u otro municipio. Copiala de tu recibo: el valor cargado es referencial.',
    },
    {
      id: 'prontoPago',
      label: '¿Pagás con el descuento por pronto pago?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, dentro de la fecha del descuento' },
        { value: 'no', label: 'No, pago después' },
      ],
      help: `En Bogotá el descuento es del ${(PREDIAL_BOGOTA.descuentoProntoPago * 100).toFixed(0)}%.`,
    },
    {
      id: 'valorizacion',
      label: 'Contribución de valorización asignada (COP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'El monto que dice tu resolución de cobro. Dejalo en cero si no te llegó ninguna.',
    },
    {
      id: 'cuotas',
      label: 'Cuotas para financiar la valorización',
      type: 'number',
      value: 12,
      min: 1,
      max: 60,
      step: 1,
      help: 'Con cuántas cuotas mensuales la vas a pagar, si elegís financiarla.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Lo que te cuesta el predio este año',
    caption:
      'Compara el impuesto predial que efectivamente pagás, lo que te ahorra el descuento por pronto pago y la contribución de valorización si te llegó una. Son cobros distintos que llegan por separado.',
  },
  breakdownTitle: 'De dónde sale cada peso',
  breakdownIntro:
    'Primero el avalúo (el tuyo o el estimado), después la tarifa que te corresponde y el impuesto, y al final el descuento y la valorización.',

  faq: [
    {
      q: '¿Cómo se calcula el impuesto predial en Colombia?',
      a: 'Avalúo catastral por tarifa por mil. La Ley 44 de 1990 fija el marco nacional —tarifa entre 1 y 16 por mil, según uso, estrato y destinación— y cada municipio define su tabla dentro de ese rango. No hay una tarifa nacional única: por eso el mismo apartamento paga distinto en Bogotá que en Medellín.',
    },
    {
      q: '¿La tarifa del predial es marginal como la del impuesto de renta?',
      a: 'No, y es la diferencia que más plata cuesta entender tarde. En renta, la tarifa alta se aplica sólo al excedente del tramo. En el predial de Bogotá, la tarifa del rango se aplica sobre TODO el avalúo. Cruzar de rango por un millón de avalúo puede subirte el impuesto bastante más de un millón. Es un salto, no una pendiente.',
    },
    {
      q: '¿Qué es el avalúo catastral y en qué se diferencia del comercial?',
      a: `El catastral lo fija la autoridad catastral (el IGAC o el catastro distrital) y es la base del impuesto. El comercial es lo que el mercado paga por el inmueble. El catastral suele ir por debajo del comercial —una relación de alrededor del ${(RATIO_CATASTRAL_COMERCIAL * 100).toFixed(0)}% es habitual, aunque varía mucho por ciudad y por año—, y esa brecha se achica cada vez que hay actualización catastral. Cuando vendés, el que manda para la ganancia ocasional es el costo fiscal, no el catastral.`,
    },
    {
      q: '¿Los estratos 1 y 2 pagan predial en Bogotá?',
      a: `Depende del avalúo, no del estrato solo. Los predios de estratos 1 y 2 con avalúo por debajo de ${PREFERENCIAL_BOGOTA.exclusionSmlmv} SMLMV (${cop(PREFERENCIAL_BOGOTA.exclusionSmlmv * SMLMV)}) están excluidos del impuesto. Por encima de eso pagan tarifa preferencial de ${PREFERENCIAL_BOGOTA.porMilBajo} o ${PREFERENCIAL_BOGOTA.porMilAlto} por mil, muy por debajo de la tabla general. Y si el avalúo supera las ${PREFERENCIAL_BOGOTA.topeSmlmv} SMLMV, el beneficio se cae y entra la tabla común.`,
    },
    {
      q: '¿Cuánto ahorro pagando con el descuento por pronto pago?',
      a: `En Bogotá, el ${(PREDIAL_BOGOTA.descuentoProntoPago * 100).toFixed(0)}% del impuesto, pagando dentro de la fecha que fija la Secretaría de Hacienda cada año (suele caer en abril). Sobre un predial de un millón son cien mil pesos por adelantar el pago unos meses: es de los mejores rendimientos anuales que vas a encontrar. Otros municipios ofrecen descuentos parecidos con sus propias fechas.`,
    },
    {
      q: '¿Puedo pagar el predial en cuotas?',
      a: 'En Bogotá sí, a través del sistema de pago alternativo por cuotas, pero hay que acogerse declarando dentro del plazo que fija la Secretaría, normalmente a comienzos de año. Quien se acoge paga en cuotas repartidas a lo largo del año pero pierde el descuento por pronto pago. Es un intercambio: flujo de caja a cambio de ese 10%.',
    },
    {
      q: '¿Qué es la contribución de valorización y por qué me la cobran?',
      a: 'Es un tributo distinto del predial, con base legal en la Ley 25 de 1921 y el Decreto 1604 de 1966. La idea es que si una obra pública valoriza tu predio, aportás una parte de ese mayor valor. El municipio distribuye el costo de la obra entre los predios beneficiados y te asigna un monto por resolución. No se calcula con una fórmula que puedas correr vos: llega asignado, y lo que sí podés decidir es pagarlo de contado con descuento o financiarlo en cuotas con interés.',
    },
    {
      q: '¿Me pueden subir el avalúo catastral todos los años?',
      a: 'Sí. Cada año el Gobierno autoriza un reajuste general de avalúos por decreto, y además los municipios hacen actualizaciones catastrales que pueden mover mucho más un predio puntual, sobre todo si hubo obras o cambio de uso en la zona. Lo que sí existe es un límite legal al crecimiento del impuesto de un año a otro respecto del liquidado el año anterior, pensado para evitar saltos brutales. Si tu factura se disparó, ese límite es lo primero que hay que revisar.',
    },
    {
      q: '¿Puedo reclamar si creo que mi avalúo está mal?',
      a: 'Sí, con una solicitud de revisión del avalúo ante la autoridad catastral, aportando pruebas: avalúo comercial de perito inscrito, fotos, comparables de la zona. Es un trámite gratuito y con plazos definidos. Vale la pena cuando la diferencia es grande, porque un avalúo corregido baja el predial de todos los años siguientes, no sólo el del año en curso.',
    },
    {
      q: '¿Cuánto vale el metro cuadrado en mi barrio?',
      a: 'No hay una tabla oficial que responda eso, y desconfiá de cualquier calculadora que diga tenerla citando a la DIAN, el IGAC o la Superfinanciera: ninguna de las tres publica precios de mercado por barrio. Lo que sí existe son los portales inmobiliarios, las lonjas de propiedad raíz y los avalúos de peritos inscritos. Por eso en este hub el precio por m² es un campo que cargás vos con la referencia que estés manejando.',
    },
    {
      q: '¿El predial se puede deducir de la declaración de renta?',
      a: 'Depende del uso del inmueble. Si el predio genera renta —lo tenés arrendado, o es parte de tu actividad económica— el predial es un gasto deducible con relación de causalidad. Si es tu vivienda de habitación y no produce renta, no es deducible: lo que sí podés deducir en ese caso son los intereses del crédito de vivienda, que van por su propio artículo.',
    },
  ],

  sources: [
    {
      name: 'Ley 44 de 1990 — impuesto predial unificado',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=3048',
      publisher: 'Función Pública',
    },
    {
      name: 'Secretaría de Hacienda de Bogotá — impuesto predial unificado',
      url: 'https://www.haciendabogota.gov.co/es/impuestos/impuesto-predial-unificado',
      publisher: 'Alcaldía Mayor de Bogotá',
    },
    {
      name: 'Alcaldía de Medellín — impuesto predial',
      url: 'https://www.medellin.gov.co/es/secretaria-hacienda/impuesto-predial/',
      publisher: 'Alcaldía de Medellín',
    },
    {
      name: 'Decreto 1604 de 1966 — contribución de valorización',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=76040',
      publisher: 'Función Pública',
    },
    {
      name: 'IGAC — consulta y revisión del avalúo catastral',
      url: 'https://www.igac.gov.co/',
      publisher: 'Instituto Geográfico Agustín Codazzi',
    },
    {
      name: 'Decreto 1469 de 2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '29-12-2025',
    },
  ],

  replaces: [
    '/co/calculadora-impuesto-predial-bogota-2026',
    '/co/calculadora-impuesto-predial-medellin-2026',
    '/co/calculadora-contribucion-valorizacion-colombia',
    '/co/calculadora-tasacion-vivienda-colombia-precio-m2-zona-estrato',
  ],

  lastReviewed: '2026-07-28',
};
