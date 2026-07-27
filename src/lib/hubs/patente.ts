import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto pago de patente?"
 * Arquetipo: RAMIFICADO. El impuesto automotor es provincial, así que la
 * respuesta cambia por jurisdicción, por tipo de vehículo y por forma de pago.
 *
 * Absorbe 5 calculadoras (ver hub.replaces):
 *   - patente auto por provincia (alícuota representativa 2026)
 *   - patente de moto / ciclomotor (alícuota por cilindrada + costo de patentamiento)
 *   - patente por valor del auto (cuánto vale para el fisco)
 *   - patente Córdoba 2026 (escala por tramo + 5 cuotas bimestrales + 15% contado)
 *   - patente moto por provincia 2026 (alícuota por cilindrada)
 *
 * NOTAS DE CONTRATO:
 *  - Las filas que NO son plata (alícuota, ranking, cuotas) declaran `format`
 *    y `unit` EXPLÍCITOS: el runtime hace Object.assign y una fila sin format
 *    cae a pesos.
 *  - El gráfico es `bars`: tu jurisdicción contra el resto del país. La
 *    alícuota va de 1,8% (Tierra del Fuego) a 3,5% (CABA): casi el doble por
 *    el mismo auto, y ese es el dato que ninguna calculadora suelta te daba.
 */
export const hub: HubData = {
  slug: 'auto/patente',
  title: '¿Cuánto pago de patente? Calculadora por provincia 2026 — Argentina',
  description:
    'Calculá la patente de tu auto o moto según tu provincia: alícuota aplicada, patente anual, valor de cada cuota y comparación con el resto del país. Incluye la escala de Córdoba 2026 y el descuento por pago contado.',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Guía y estimación del impuesto automotor',
  h1: '¿Cuánto pago de patente?',
  lede:
    'La patente es un impuesto provincial: se calcula como un porcentaje de la valuación fiscal de tu vehículo, y ese porcentaje cambia mucho según dónde esté radicado. Partimos del caso más común —un auto, por provincia— y lo ajustás con tus datos.',
  stamps: ['Actualizado 27-07-2026', 'Escalas provinciales 2026', '5 calculadoras adentro'],

  resultLabel: 'Patente anual estimada',

  cases: {
    title: '¿Qué vehículo tenés?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'auto',
        label: 'Un auto, en mi provincia',
        hint: 'El caso más común',
        answer: 'La patente es la valuación fiscal multiplicada por la alícuota de tu provincia.',
        yes: [
          'Base imponible: la valuación fiscal del vehículo, no lo que pagaste ni lo que vale en el mercado',
          'Alícuota provincial representativa 2026: va de 1,8% en Tierra del Fuego a 3,5% en CABA',
          'El total anual se divide en cuotas (la mayoría de las provincias usan 4, 5 o 6 al año)',
          'Casi todas las jurisdicciones dan un descuento por adhesión a débito automático y buen contribuyente',
        ],
        warn: [
          'La alícuota real es escalonada por tramo de valuación: un auto caro paga un porcentaje mayor que uno barato',
          'Si mudaste el domicilio pero no cambiaste la radicación, seguís tributando en la provincia vieja',
          'Los municipios de algunas provincias cobran una tasa adicional que no entra en este cálculo',
        ],
        plazo: 'la primera cuota suele vencer en febrero y el pago anual adelantado con descuento se paga en ese mismo primer vencimiento.',
      },
      {
        id: 'moto',
        label: 'Una moto o un ciclomotor',
        hint: 'Alícuota por cilindrada',
        answer: 'En moto manda la cilindrada: de 1,5% hasta 100 cc a 5% de 500 cc en adelante.',
        yes: [
          'Alícuota por cilindrada: menos de 100 cc 1,5%; 100 a 249 cc 3%; 250 a 499 cc 4%; 500 cc o más 5%',
          'En CABA se aplica un recargo del 10% sobre esa alícuota',
          'Patentar por primera vez tiene un costo aparte: arancel fijo de inscripción más sellado proporcional al valor',
          'El sellado de inscripción ronda el 0,8% del valor del vehículo',
        ],
        warn: [
          'Los ciclomotores de menos de 100 cc están exentos del impuesto en varias provincias: confirmá el régimen de la tuya',
          'El costo de patentamiento es de una sola vez; la patente es un impuesto anual que se repite',
          'Circular sin patentar habilita multa y secuestro del vehículo, aunque estés exento del impuesto',
        ],
        plazo: 'la inscripción inicial en el Registro Automotor tiene que hacerse dentro de los 10 días hábiles de la compra.',
      },
      {
        id: 'cordoba',
        label: 'Vivo en Córdoba y quiero ver mis cuotas',
        hint: 'Escala 2026 + 5 cuotas',
        answer: 'Córdoba usa una escala de 1,5% a 4,5% y da 15% de descuento si pagás todo contado.',
        yes: [
          'Escala 2026 por tramo de valuación: 1,5% hasta $5M; 2% hasta $10M; 2,5% hasta $20M; 3% hasta $50M; 3,75% hasta $100M; 4,5% de ahí en adelante',
          'Pago contado anual: 15% de descuento sobre el total',
          'Pago en cuotas: 5 cuotas bimestrales en febrero, abril, junio, agosto y octubre',
          'Marco legal: Código Tributario Provincial Ley 6.006 y la ley impositiva anual',
        ],
        warn: [
          'El descuento del 15% exige estar en el régimen "Buen Contribuyente": una deuda vieja te lo saca',
          'La valuación fiscal la fija la DGR y a veces tiene errores: conviene revisarla antes del primer vencimiento',
          'Si tu auto está justo arriba de un tramo, el salto de alícuota es grande (de 3% a 3,75% en $100M de valuación)',
        ],
        plazo: 'las cuotas vencen en febrero, abril, junio, agosto y octubre; el contado con descuento se paga en el primer vencimiento.',
      },
      {
        id: 'valuacion',
        label: 'Quiero saber cuánto vale mi auto para el fisco',
        hint: 'Valuación fiscal y su peso',
        answer: 'La valuación fiscal sale de la tabla DNRPA y define todo lo que pagás de patente.',
        yes: [
          'La valuación fiscal la publica la DNRPA por marca, modelo y año, y las provincias la toman como base',
          'Suele estar por debajo del precio de mercado, pero no siempre: en modelos viejos a veces queda por encima',
          'Con la valuación y la alícuota de tu provincia sale la patente anual y cuánto pesa por mes',
          'Ese mismo valor es la base del impuesto de sellos cuando vendés el auto',
        ],
        warn: [
          'Si la valuación fiscal está inflada podés pedir su revisión en la agencia de rentas provincial',
          'Un auto de más de 20 años suele estar exento o pagar un importe fijo mínimo en varias provincias',
          'La valuación se actualiza cada año: la patente sube aunque el auto se siga poniendo viejo',
        ],
        plazo: 'la tabla de valuaciones se actualiza a fin de año y rige desde el primer vencimiento del año siguiente.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu vehículo',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'valuacion',
      label: 'Valuación fiscal del vehículo',
      prefix: '$',
      value: '25.000.000',
      thousands: true,
      help: 'La de la tabla DNRPA, no el precio de venta.',
    },
    {
      id: 'provincia',
      label: 'Provincia donde está radicado',
      type: 'select',
      value: 'buenos-aires',
      options: [
        { value: 'buenos-aires', label: 'Buenos Aires (PBA)' },
        { value: 'caba', label: 'CABA' },
        { value: 'catamarca', label: 'Catamarca' },
        { value: 'chaco', label: 'Chaco' },
        { value: 'chubut', label: 'Chubut' },
        { value: 'cordoba', label: 'Córdoba' },
        { value: 'corrientes', label: 'Corrientes' },
        { value: 'entre-rios', label: 'Entre Ríos' },
        { value: 'formosa', label: 'Formosa' },
        { value: 'jujuy', label: 'Jujuy' },
        { value: 'la-pampa', label: 'La Pampa' },
        { value: 'la-rioja', label: 'La Rioja' },
        { value: 'mendoza', label: 'Mendoza' },
        { value: 'misiones', label: 'Misiones' },
        { value: 'neuquen', label: 'Neuquén' },
        { value: 'rio-negro', label: 'Río Negro' },
        { value: 'salta', label: 'Salta' },
        { value: 'san-juan', label: 'San Juan' },
        { value: 'san-luis', label: 'San Luis' },
        { value: 'santa-cruz', label: 'Santa Cruz' },
        { value: 'santa-fe', label: 'Santa Fe' },
        { value: 'santiago-estero', label: 'Santiago del Estero' },
        { value: 'tierra-del-fuego', label: 'Tierra del Fuego' },
        { value: 'tucuman', label: 'Tucumán' },
      ],
      help: 'Vale la radicación del vehículo, no dónde vivís.',
    },
    {
      id: 'cilindrada',
      label: 'Cilindrada (solo motos y ciclomotores)',
      type: 'number',
      suffix: 'cc',
      min: 0,
      max: 2500,
      step: 10,
      value: 150,
      help: 'Define la alícuota: menos de 100 cc paga 1,5% y 500 cc o más paga 5%.',
    },
    {
      id: 'cuotas',
      label: 'Cuotas al año',
      type: 'number',
      min: 1,
      max: 12,
      step: 1,
      value: 5,
      help: 'Poné 1 si pagás todo contado. En Córdoba el régimen en cuotas son 5 bimestrales.',
    },
  ],
  fineprint:
    'Es una orientación. Cada provincia aplica una escala por tramo de valuación, más recargos, exenciones y descuentos propios: el importe exacto sale de la boleta de tu agencia de rentas.',

  chart: {
    type: 'bars',
    title: 'Tu jurisdicción contra el resto del país',
    caption:
      'Cada barra es la patente anual que pagaría el mismo vehículo en una jurisdicción distinta: la tuya, el promedio de las 24 y los dos extremos del país. Por el mismo auto, CABA cobra casi el doble que Tierra del Fuego. En moto la comparación es por franja de cilindrada, que es lo que manda la alícuota.',
  },
  breakdownTitle: 'Cómo se arma tu patente',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande.',

  faq: [
    {
      q: '¿Cómo se calcula la patente de un auto en Argentina?',
      a: 'Se multiplica la valuación fiscal del vehículo por la alícuota que fija la ley impositiva de la provincia donde está radicado. Un auto de $25.000.000 de valuación fiscal en Buenos Aires, con alícuota representativa del 3%, paga alrededor de $750.000 al año.',
    },
    {
      q: '¿Qué provincia cobra la patente más cara y cuál la más barata?',
      a: 'Con las alícuotas representativas 2026, CABA encabeza con 3,5% y Tierra del Fuego cierra con 1,8%. Sobre la misma valuación fiscal eso es casi el doble de impuesto: por un auto de $25.000.000, unos $875.000 al año en CABA contra $450.000 en Tierra del Fuego.',
    },
    {
      q: '¿Qué es la valuación fiscal y de dónde sale?',
      a: 'Es el valor que el Estado le asigna a tu vehículo, publicado por la Dirección Nacional de los Registros de la Propiedad Automotor (DNRPA) por marca, modelo y año. Las provincias la toman como base imponible del impuesto automotor y también la usan para el sellado en una compraventa. No es el precio de mercado, aunque suele acercarse.',
    },
    {
      q: '¿Cuánto se paga de patente por una moto?',
      a: 'En moto la alícuota depende de la cilindrada: menos de 100 cc paga 1,5%, de 100 a 249 cc 3%, de 250 a 499 cc 4% y de 500 cc en adelante 5%, siempre sobre el valor fiscal. CABA suma un recargo del 10% sobre esa alícuota. Una moto de 150 cc valuada en $3.000.000 paga cerca de $90.000 al año.',
    },
    {
      q: '¿Los ciclomotores pagan patente?',
      a: 'En la mayoría de las provincias los ciclomotores de menos de 100 cc están exentos del impuesto automotor o pagan un importe fijo mínimo. Lo que no se puede saltear es la inscripción en el Registro Automotor: el arancel de patentamiento y el sellado se pagan igual, aunque después el impuesto anual te dé cero.',
    },
    {
      q: '¿Cómo funciona la patente en Córdoba en 2026?',
      a: 'Córdoba aplica una escala por tramo de valuación fiscal: 1,5% hasta $5.000.000; 2% hasta $10.000.000; 2,5% hasta $20.000.000; 3% hasta $50.000.000; 3,75% hasta $100.000.000 y 4,5% por encima. Se puede pagar en 5 cuotas bimestrales (febrero, abril, junio, agosto y octubre) o de contado con 15% de descuento.',
    },
    {
      q: '¿Conviene pagar la patente contado o en cuotas?',
      a: 'Contado conviene cuando el descuento supera lo que te rendiría esa plata invertida. Con 15% de descuento sobre el total, como en Córdoba, es difícil que la cuota le gane: para empatar necesitarías una tasa muy alta durante todo el año sobre un capital que además vas pagando de a poco. Si estás justo de caja, la cuota bimestral sin interés es una financiación gratis.',
    },
    {
      q: '¿Qué pasa si no pago la patente?',
      a: 'La deuda devenga intereses resarcitorios y punitorios, la provincia puede iniciar juicio de apremio y trabar embargo, y no vas a poder transferir el vehículo ni sacar la libre deuda para venderlo. Además, con deuda perdés el descuento por buen contribuyente del año siguiente. La prescripción es de cinco años, pero el reclamo judicial la interrumpe.',
    },
    {
      q: '¿Los autos viejos pagan patente?',
      a: 'Depende de la provincia. Varias jurisdicciones eximen a los vehículos de más de 20 o 25 años de antigüedad, o les aplican un importe fijo mínimo en lugar de la alícuota. También hay exenciones por discapacidad, para vehículos oficiales y para algunos usos productivos. Se piden en la agencia de rentas y no son automáticas.',
    },
    {
      q: '¿Cuánto cuesta patentar un vehículo por primera vez?',
      a: 'El patentamiento inicial es un trámite aparte del impuesto: un arancel fijo de inscripción en el Registro Automotor —del orden de $45.000 en 2026— más el sellado provincial, que ronda el 0,8% del valor del vehículo. Recién después empieza a correr la patente anual.',
    },
    {
      q: 'Me mudé de provincia, ¿dónde pago la patente?',
      a: 'Donde el vehículo esté radicado, no donde vivís. Para pasar a tributar en tu nueva provincia hay que hacer el cambio de radicación en el Registro Automotor, con libre deuda de la jurisdicción anterior. Hasta que lo hagas seguís debiendo la patente vieja, y esa deuda te bloquea cualquier trámite posterior.',
    },
    {
      q: '¿La patente y la VTV son lo mismo?',
      a: 'No. La patente es un impuesto anual sobre el valor del vehículo, que recauda la provincia. La VTV es una verificación técnica obligatoria y periódica, con un arancel propio, que controla el estado mecánico. Podés estar al día con una y deber la otra: se reclaman por separado.',
    },
  ],

  sources: [
    {
      name: 'ARBA — Impuesto Automotor (alícuotas y calendario de vencimientos)',
      url: 'https://www.arba.gov.ar/Informacion/Automotores.asp',
      publisher: 'Agencia de Recaudación de la Provincia de Buenos Aires',
      date: '2026',
    },
    {
      name: 'AGIP — Patentes sobre vehículos en general (CABA)',
      url: 'https://www.agip.gob.ar/impuestos/patentes',
      publisher: 'AGIP · Gobierno de la Ciudad de Buenos Aires',
      date: '2026',
    },
    {
      name: 'DGR Córdoba — Impuesto a la Propiedad Automotor (escala y planes de pago)',
      url: 'https://www.rentascordoba.gob.ar/automotor',
      publisher: 'Dirección General de Rentas de Córdoba',
      date: '2026',
    },
    {
      name: 'API Santa Fe — Impuesto Patente Única sobre Vehículos',
      url: 'https://www.santafe.gob.ar/index.php/web/content/view/full/112576',
      publisher: 'Administración Provincial de Impuestos, Santa Fe',
    },
    {
      name: 'DNRPA — Tabla de valuación de automotores y aranceles de trámites',
      url: 'https://www.argentina.gob.ar/justicia/automotor',
      publisher: 'Dirección Nacional de los Registros de la Propiedad Automotor',
    },
    {
      name: 'Código Tributario de la Provincia de Córdoba — Ley 6.006 (texto ordenado)',
      url: 'https://www.rentascordoba.gob.ar/normativa',
      publisher: 'Gobierno de Córdoba',
    },
  ],

  replaces: [
    '/calculadora-patente-auto-provincia',
    '/calculadora-patente-ciclomotor-moto-argentina-costo',
    '/calculadora-patente-auto-valor',
    '/calculadora-patente-auto-cordoba-2026-valuacion-fiscal-cuotas',
    '/calculadora-patente-moto-provincias-2026-alicuota',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Alícuota representativa por jurisdicción (2026), en %.
 * Valores indicativos cercanos al promedio para autos de valuación media: la
 * escala real de cada provincia es escalonada por tramo de valuación fiscal.
 */
export const ALICUOTAS: Record<string, { nombre: string; alicuota: number }> = {
  caba: { nombre: 'CABA', alicuota: 3.5 },
  'buenos-aires': { nombre: 'Buenos Aires (PBA)', alicuota: 3.0 },
  catamarca: { nombre: 'Catamarca', alicuota: 2.3 },
  chaco: { nombre: 'Chaco', alicuota: 2.8 },
  chubut: { nombre: 'Chubut', alicuota: 2.5 },
  cordoba: { nombre: 'Córdoba', alicuota: 3.2 },
  corrientes: { nombre: 'Corrientes', alicuota: 2.5 },
  'entre-rios': { nombre: 'Entre Ríos', alicuota: 2.8 },
  formosa: { nombre: 'Formosa', alicuota: 2.2 },
  jujuy: { nombre: 'Jujuy', alicuota: 2.3 },
  'la-pampa': { nombre: 'La Pampa', alicuota: 2.5 },
  'la-rioja': { nombre: 'La Rioja', alicuota: 2.5 },
  mendoza: { nombre: 'Mendoza', alicuota: 2.5 },
  misiones: { nombre: 'Misiones', alicuota: 2.5 },
  neuquen: { nombre: 'Neuquén', alicuota: 2.5 },
  'rio-negro': { nombre: 'Río Negro', alicuota: 2.5 },
  salta: { nombre: 'Salta', alicuota: 2.3 },
  'san-juan': { nombre: 'San Juan', alicuota: 2.3 },
  'san-luis': { nombre: 'San Luis', alicuota: 2.5 },
  'santa-cruz': { nombre: 'Santa Cruz', alicuota: 2.0 },
  'santa-fe': { nombre: 'Santa Fe', alicuota: 3.0 },
  'santiago-estero': { nombre: 'Santiago del Estero', alicuota: 2.3 },
  'tierra-del-fuego': { nombre: 'Tierra del Fuego', alicuota: 1.8 },
  tucuman: { nombre: 'Tucumán', alicuota: 2.5 },
};

/** Escala de Córdoba 2026 (Ley 6.006 + ley impositiva anual): tope de tramo y alícuota %. */
export const ESCALA_CORDOBA: Array<{ hasta: number; alicuota: number; label: string }> = [
  { hasta: 5_000_000, alicuota: 1.5, label: '1,5% — hasta $5M' },
  { hasta: 10_000_000, alicuota: 2.0, label: '2% — $5M a $10M' },
  { hasta: 20_000_000, alicuota: 2.5, label: '2,5% — $10M a $20M' },
  { hasta: 50_000_000, alicuota: 3.0, label: '3% — $20M a $50M' },
  { hasta: 100_000_000, alicuota: 3.75, label: '3,75% — $50M a $100M' },
  { hasta: 1e15, alicuota: 4.5, label: '4,5% — más de $100M' },
];

/** Descuento por pago anual de contado en Córdoba (DGR). */
export const DESCUENTO_CONTADO_CBA = 0.15;

/** Franjas de cilindrada para motos: tope de cc y alícuota % sobre el valor fiscal. */
export const FRANJAS_MOTO: Array<{ hasta: number; alicuota: number; label: string }> = [
  { hasta: 100, alicuota: 1.5, label: 'Menos de 100 cc' },
  { hasta: 250, alicuota: 3.0, label: '100 a 249 cc' },
  { hasta: 500, alicuota: 4.0, label: '250 a 499 cc' },
  { hasta: 1e15, alicuota: 5.0, label: '500 cc o más' },
];

/** Recargo de CABA sobre la alícuota de moto. */
export const RECARGO_CABA_MOTO = 1.1;

/** Costo de patentamiento inicial: arancel fijo DNRPA + sellado proporcional al valor. */
export const PATENTAMIENTO = { arancelFijo: 45_000, selladoPct: 0.008 };
