import type { HubData } from '../types';

/**
 * Hub de decisión EC — "Tengo, compro, vendo o heredo un inmueble: ¿qué impuestos pago?"
 *
 * Absorbe impuesto-predial-ecuador, impuesto-alcabala-ecuador,
 * impuesto-plusvalia-inmueble-ecuador e impuesto-herencias-legados-donaciones-ecuador.
 *
 * Predial, alcabala y plusvalía son MUNICIPALES: cada GAD fija su tarifa por
 * ordenanza dentro de las bandas del COOTAD. Las tarifas que trae cargadas el hub
 * son referenciales y editables. Herencias, legados y donaciones sí es nacional,
 * del SRI, con tabla progresiva propia.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Predial urbano: banda legal de la tarifa (COOTAD art. 504), en por mil. */
export const PREDIAL_MIN = 0.25;
export const PREDIAL_MAX = 5;
export const PREDIAL_DEFAULT = 2;

/** Descuento por pronto pago y recargo por mora del predial (COOTAD art. 512). */
export const PREDIAL_AJUSTES: Array<{ id: string; label: string; pct: number }> = [
  { id: 'ene1', label: '1ª quincena de enero', pct: -0.1 },
  { id: 'ene2', label: '2ª quincena de enero', pct: -0.09 },
  { id: 'feb1', label: '1ª quincena de febrero', pct: -0.08 },
  { id: 'feb2', label: '2ª quincena de febrero', pct: -0.07 },
  { id: 'mar1', label: '1ª quincena de marzo', pct: -0.06 },
  { id: 'mar2', label: '2ª quincena de marzo', pct: -0.05 },
  { id: 'abr1', label: '1ª quincena de abril', pct: -0.04 },
  { id: 'abr2', label: '2ª quincena de abril', pct: -0.03 },
  { id: 'may1', label: '1ª quincena de mayo', pct: -0.03 },
  { id: 'may2', label: '2ª quincena de mayo', pct: -0.02 },
  { id: 'jun1', label: '1ª quincena de junio', pct: -0.02 },
  { id: 'jun2', label: '2ª quincena de junio', pct: -0.01 },
  { id: 'mora', label: 'Julio en adelante: con recargo por mora', pct: 0.1 },
];

/** Alcabala: 1% sobre la base (COOTAD art. 535) + adicional provincial del 10% del impuesto. */
export const ALCABALA_TARIFA = 0.01;
export const ALCABALA_ADICIONAL = 0.1;
/** Rebajas por reventa del mismo inmueble dentro de los 3 años (COOTAD art. 533). */
export const ALCABALA_REVENTA: Array<{ id: string; label: string; pct: number }> = [
  { id: 'ninguna', label: 'No es reventa reciente ni permuta', pct: 0 },
  { id: '1', label: 'Reventa dentro del 1er año: rebaja del 40%', pct: 0.4 },
  { id: '2', label: 'Reventa dentro del 2º año: rebaja del 30%', pct: 0.3 },
  { id: '3', label: 'Reventa dentro del 3er año: rebaja del 20%', pct: 0.2 },
];

/** Plusvalía: 10% sobre la utilidad (COOTAD art. 556), modificable por ordenanza. */
export const PLUSVALIA_TASA = 0.1;
/** Deducción del 5% de la utilidad por año de tenencia (COOTAD art. 557). */
export const PLUSVALIA_DEDUCCION_ANUAL = 0.05;
export const PLUSVALIA_ANIOS_EXENCION = 20;

/** Tabla de herencias, legados y donaciones — Resol. SRI NAC-DGERCGC25-00000043. */
export const HLD_TABLA = [
  { desde: 0, hasta: 78527, base: 0, pct: 0 },
  { desde: 78527, hasta: 157053, base: 0, pct: 0.05 },
  { desde: 157053, hasta: 314108, base: 3926, pct: 0.1 },
  { desde: 314108, hasta: 471193, base: 19632, pct: 0.15 },
  { desde: 471193, hasta: 628268, base: 43195, pct: 0.2 },
  { desde: 628268, hasta: 785321, base: 74609, pct: 0.25 },
  { desde: 785321, hasta: 942353, base: 113873, pct: 0.3 },
  { desde: 942353, hasta: null, base: 160982, pct: 0.35 },
];
export const HLD_FRACCION_BASICA = 78527;

/** Rebajas por parentesco de la tabla de herencias. */
export const HLD_PARENTESCO: Array<{ id: string; label: string; rebaja: number }> = [
  { id: 'sin-parentesco', label: 'Sin parentesco, cónyuge o pariente lejano: tabla plena', rebaja: 0 },
  { id: 'primer-grado', label: 'Primer grado de consanguinidad (hijos, padres): mitad de la tarifa', rebaja: 0.5 },
  { id: 'segundo-grado', label: 'Segundo grado (hermanos, abuelos, nietos)', rebaja: 0.25 },
  { id: 'hijo-menor', label: 'Hijo menor de edad o con discapacidad: exonerado', rebaja: 1 },
];

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/impuestos/impuestos-del-inmueble',
  title: 'Impuestos de un inmueble en Ecuador: predial, alcabala, plusvalía y herencias',
  description:
    'Calcula el impuesto predial urbano con el descuento por pronto pago, la alcabala del 1% que paga el comprador, el impuesto a las utilidades y plusvalía que paga el vendedor y el impuesto del SRI a herencias, legados y donaciones.',
  silo: 'Impuestos',
  siloHref: '/ec/impuestos',
  locale: 'ec',

  eyebrow: 'Ecuador · COOTAD y SRI · inmuebles',
  h1: 'Tengo, compro, vendo o heredo un inmueble: ¿qué impuestos pago?',
  lede:
    'Un inmueble genera impuestos distintos en cada momento de su vida: el predial todos los años mientras lo tienes, la alcabala cuando cambia de dueño, la plusvalía cuando lo vendes con ganancia y el impuesto del SRI cuando lo recibes por herencia o donación. Los tres primeros son municipales y su tarifa la fija tu cantón; el último es nacional.',
  stamps: [
    'COOTAD arts. 504, 512, 532-535, 556-559',
    `Herencias: tabla SRI · fracción exenta ${usd(HLD_FRACCION_BASICA)}`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Impuesto de esta operación',

  cases: {
    title: '¿En qué momento estás?',
    intro:
      'Cada momento tiene su impuesto, su sujeto obligado y su tarifa. Empezamos por el más frecuente: ser propietario y pagar el predial del año.',
    items: [
      {
        id: 'predial',
        label: 'Soy propietario y pago el predial del año',
        hint: 'Impuesto municipal anual · COOTAD arts. 504 y 512',
        answer:
          'El predial urbano se calcula aplicando una tarifa por mil sobre el avalúo catastral, y pagar en enero te ahorra hasta el 10%.',
        yes: [
          `La tarifa la fija cada municipio por ordenanza dentro de la banda de ${String(PREDIAL_MIN).replace('.', ',')}‰ a ${PREDIAL_MAX}‰ sobre el avalúo catastral`,
          'El descuento por pronto pago arranca en 10% en la primera quincena de enero y baja un punto cada quincena hasta junio',
          'Desde julio no hay descuento y corre un recargo del 10% por mora',
          'La base es el avalúo catastral municipal, que casi nunca coincide con el valor comercial del inmueble',
        ],
        warn: [
          DISCLAIMER_TAX,
          `La tarifa que viene cargada (${String(PREDIAL_DEFAULT).replace('.', ',')}‰) es referencial, no la de tu cantón: cada GAD publica la suya y hay que reemplazarla para que la cuenta sirva`,
          'El predial no viene solo: la planilla municipal suele traer además tasas de recolección de basura, bomberos y contribución especial de mejoras, que no se estiman acá',
          'Si tu avalúo catastral está desactualizado, la revalorización te puede cambiar el impuesto de un año al otro sin que hayas hecho nada',
        ],
        plazo: 'la emisión sale a principios de enero y el descuento máximo se pierde el 16 de enero.',
      },
      {
        id: 'alcabala',
        label: 'Estoy comprando un inmueble',
        hint: 'Alcabala 1% · la paga el comprador',
        answer: `La alcabala es el ${ALCABALA_TARIFA * 100}% de la base imponible y la paga el comprador, más el adicional del consejo provincial.`,
        yes: [
          `Tarifa del ${ALCABALA_TARIFA * 100}% sobre la base imponible (COOTAD art. 535)`,
          'La base es el MAYOR entre el valor pactado en la escritura y el avalúo catastral municipal',
          `Encima va el adicional del consejo provincial, equivalente al ${ALCABALA_ADICIONAL * 100}% del impuesto municipal`,
          'Si revendes el mismo inmueble dentro de los 3 años hay rebaja: 40% el primer año, 30% el segundo, 20% el tercero',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Declarar en la escritura un valor menor al real para pagar menos alcabala no sirve: el municipio liquida sobre el avalúo catastral si es mayor, y el subvalor te complica después al calcular la plusvalía cuando vendas',
          'La alcabala no es el único costo del cierre: hay honorarios de notaría, inscripción en el Registro de la Propiedad y, si hay hipoteca, sus propios gastos',
          'En permutas cada parte tributa sobre una base reducida; hay además exenciones expresas del COOTAD art. 534 que no se estiman acá',
        ],
        plazo: 'la alcabala se paga antes de inscribir la escritura en el Registro de la Propiedad: sin el pago, no hay inscripción.',
      },
      {
        id: 'plusvalia',
        label: 'Estoy vendiendo un inmueble',
        hint: 'Impuesto a las utilidades y plusvalía · lo paga el vendedor',
        answer: `El impuesto grava la utilidad de la venta, no el precio, y se descuenta un ${PLUSVALIA_DEDUCCION_ANUAL * 100}% de esa utilidad por cada año de tenencia.`,
        yes: [
          `Tarifa general del ${PLUSVALIA_TASA * 100}% sobre la utilidad (COOTAD art. 556), modificable por ordenanza del GAD`,
          'La utilidad es el precio de venta menos el costo de adquisición, las mejoras incorporadas y la contribución especial de mejoras pagada',
          `Se deduce un ${PLUSVALIA_DEDUCCION_ANUAL * 100}% de la utilidad por cada año transcurrido a partir del segundo año de adquisición`,
          `A los ${PLUSVALIA_ANIOS_EXENCION} años de tenencia la transferencia queda exenta (COOTAD art. 559)`,
        ],
        warn: [
          DISCLAIMER_TAX,
          `La tarifa del ${PLUSVALIA_TASA * 100}% es la del COOTAD, pero cada municipio puede fijar otra por ordenanza: hay cantones que aplican menos. Reemplaza la tarifa por la de tu GAD`,
          'Solo se deducen las mejoras que puedas sustentar con documentos: una remodelación sin facturas no baja la base',
          'Si el valor de compra que figura en tu escritura vieja está subvalorado, la utilidad calculada va a ser artificialmente alta y el impuesto también',
        ],
        plazo: 'se paga al momento de la transferencia de dominio, antes de la inscripción en el Registro de la Propiedad.',
      },
      {
        id: 'herencia',
        label: 'Heredo o recibo una donación',
        hint: 'Impuesto nacional del SRI · tabla progresiva propia',
        answer: `Las herencias, legados y donaciones tienen su propia tabla del SRI, con una fracción exenta de ${usd(HLD_FRACCION_BASICA)}.`,
        yes: [
          `Fracción básica desgravada de ${usd(HLD_FRACCION_BASICA)}: por debajo de eso no se paga nada`,
          'Es una tabla progresiva distinta a la del impuesto a la renta, con tramos que llegan al 35%',
          'Los beneficiarios en primer grado de consanguinidad (hijos, padres) pagan la mitad de la tarifa',
          'Se calcula por beneficiario y sobre su porción, no sobre el total de la masa hereditaria',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El cónyuge sobreviviente no es consanguíneo: la rebaja del primer grado no le aplica, aunque sí tiene sus propios derechos sobre la sociedad conyugal, que se liquidan antes del impuesto',
          'La rebaja para el segundo grado (hermanos, abuelos, nietos) no está expresamente escrita en la ley con ese porcentaje: es una práctica que conviene confirmar con tu abogado antes de contar con ella',
          'La exoneración total al primer grado que trajo la Ley de Desarrollo Económico fue declarada inconstitucional en 2022: el impuesto volvió a aplicarse con la rebaja del 50%, no exonerado',
          'El inmueble se valora al avalúo comercial, no al catastral: si el catastro está desactualizado, la base va a ser mayor de lo que esperas',
        ],
        plazo: 'la declaración se presenta dentro de los 6 meses posteriores a la muerte del causante o a la fecha de la donación.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu inmueble',
  inputsIntro:
    'Llena solo los campos del caso que elegiste. Todos los montos en dólares, sin puntos ni comas de más.',
  fields: [
    {
      id: 'avaluo',
      label: 'Avalúo catastral municipal ($)',
      prefix: '$',
      value: '80.000',
      thousands: true,
      help: 'El que figura en tu carta del predial. En la alcabala se compara con el valor de la escritura y manda el mayor.',
    },
    {
      id: 'tarifaPorMil',
      label: 'Tarifa predial de tu cantón (por mil)',
      type: 'number',
      value: PREDIAL_DEFAULT,
      min: PREDIAL_MIN,
      max: PREDIAL_MAX,
      step: 0.05,
      help: `La fija tu municipio por ordenanza dentro de la banda de ${String(PREDIAL_MIN).replace('.', ',')}‰ a ${PREDIAL_MAX}‰ del COOTAD. El valor cargado es referencial.`,
    },
    {
      id: 'momentoPago',
      label: 'Cuándo vas a pagar el predial',
      type: 'select',
      value: 'ene1',
      options: PREDIAL_AJUSTES.map((a) => ({ value: a.id, label: a.label })),
      help: 'El descuento cae una quincena por vez desde enero; en julio se convierte en recargo.',
    },
    {
      id: 'valorOperacion',
      label: 'Valor de la operación o del bien recibido ($)',
      prefix: '$',
      value: '100.000',
      thousands: true,
      help: 'El precio de la escritura si compras, el precio de venta si vendes, o el valor de lo que recibes por herencia o donación.',
    },
    {
      id: 'reventa',
      label: 'Rebaja de alcabala por reventa',
      type: 'select',
      value: 'ninguna',
      options: ALCABALA_REVENTA.map((r) => ({ value: r.id, label: r.label })),
      help: 'Solo si el mismo inmueble se vuelve a vender dentro de los 3 años de la compra anterior (COOTAD art. 533).',
    },
    {
      id: 'precioCompra',
      label: 'Precio al que compraste el inmueble ($)',
      prefix: '$',
      value: '60.000',
      thousands: true,
      help: 'Solo para la venta. Es el valor de adquisición que figura en tu escritura de compra.',
    },
    {
      id: 'mejoras',
      label: 'Mejoras, deudas o gastos deducibles ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'En la venta: obra nueva incorporada desde la compra, con documentos, más la contribución especial de mejoras pagada al municipio. En la herencia: las deudas del causante y los gastos admitidos que bajan la base imponible.',
    },
    {
      id: 'anios',
      label: 'Años que tuviste el inmueble',
      type: 'number',
      value: 5,
      min: 0,
      max: 60,
      step: 1,
      help: `Cada año de tenencia a partir del segundo deduce un ${PLUSVALIA_DEDUCCION_ANUAL * 100}% de la utilidad; a los ${PLUSVALIA_ANIOS_EXENCION} años la venta queda exenta.`,
    },
    {
      id: 'tasaPlusvalia',
      label: 'Tarifa de plusvalía de tu cantón (%)',
      type: 'number',
      value: PLUSVALIA_TASA * 100,
      min: 0,
      max: 20,
      step: 0.5,
      help: 'La del COOTAD es 10%, pero hay municipios que fijan otra por ordenanza. Reemplázala por la de tu GAD.',
    },
    {
      id: 'parentesco',
      label: 'Tu parentesco con quien te deja el bien',
      type: 'select',
      value: 'sin-parentesco',
      options: HLD_PARENTESCO.map((p) => ({ value: p.id, label: p.label })),
      help: 'Solo para herencias, legados y donaciones. Mueve la rebaja sobre el impuesto, no la tabla.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Cuánto del dinero en juego se lo lleva el impuesto',
    caption:
      'Compara el valor que queda en tu bolsillo con la parte que se lleva el municipio o el SRI en esta operación.',
  },
  breakdownTitle: 'Cómo se arma el impuesto, línea por línea',
  breakdownIntro:
    'Base imponible, tarifa aplicada, rebajas o recargos y el total que se paga en cada caso.',

  faq: [
    {
      q: '¿Cómo se calcula el impuesto predial en Ecuador?',
      a: `Se multiplica el avalúo catastral del predio por una tarifa por mil que fija cada municipio por ordenanza. El COOTAD (art. 504) obliga a que esa tarifa esté entre ${String(PREDIAL_MIN).replace('.', ',')}‰ y ${PREDIAL_MAX}‰ para los predios urbanos, así que un mismo avalúo puede pagar bastante distinto según el cantón. Sobre el impuesto resultante se aplica después el descuento por pronto pago o el recargo por mora.`,
    },
    {
      q: '¿Cuánto me ahorro pagando el predial en enero?',
      a: 'El descuento máximo es del 10% y corre solo en la primera quincena de enero. Después baja aproximadamente un punto por quincena hasta llegar al 1% en la segunda quincena de junio. Desde julio se acabó el descuento y empieza a correr un recargo del 10% por mora. Es una de las decisiones de calendario más rentables del año: la diferencia entre pagar el 10 de enero y el 10 de agosto es de alrededor del 20% del impuesto.',
    },
    {
      q: '¿Quién paga la alcabala, el comprador o el vendedor?',
      a: `El comprador. La alcabala es el ${ALCABALA_TARIFA * 100}% sobre la base imponible y la paga quien adquiere el dominio, mientras que el impuesto a las utilidades y plusvalía lo paga el vendedor. Es la división estándar de una compraventa en Ecuador, aunque las partes pueden pactar otra cosa entre ellas: eso no cambia quién es el obligado frente al municipio.`,
    },
    {
      q: '¿Sobre qué valor se calcula la alcabala?',
      a: 'Sobre el mayor entre el valor pactado en la escritura y el avalúo catastral municipal (COOTAD art. 532). Por eso escriturar por debajo del valor real no sirve para pagar menos: si el avalúo catastral es más alto, el municipio liquida sobre el avalúo. Y además ese subvalor te juega en contra cuando vendas, porque la utilidad gravada por la plusvalía va a salir más grande.',
    },
    {
      q: '¿Qué es el adicional del consejo provincial?',
      a: `Es un tributo adicional que se recauda junto con la alcabala y equivale al ${ALCABALA_ADICIONAL * 100}% del impuesto municipal. Sobre una base de $100.000, la alcabala municipal es $1.000 y el adicional provincial $100, así que el total de la operación es $1.100. Aparece en la misma liquidación, por lo que conviene contarlo desde el principio al presupuestar el cierre de la compra.`,
    },
    {
      q: '¿Cuánto pago de plusvalía al vender mi casa?',
      a: `El impuesto grava la utilidad, no el precio. Se toma el precio de venta, se le restan el costo de adquisición, las mejoras sustentadas y la contribución especial de mejoras pagada, y sobre esa utilidad se aplica la tarifa del GAD, que por el COOTAD es del ${PLUSVALIA_TASA * 100}%. Antes de aplicar la tarifa se deduce un ${PLUSVALIA_DEDUCCION_ANUAL * 100}% de la utilidad por cada año de tenencia contado a partir del segundo, de modo que cuanto más tiempo tuviste el inmueble, menos base queda gravada.`,
    },
    {
      q: '¿Después de cuántos años no pago plusvalía?',
      a: `A los ${PLUSVALIA_ANIOS_EXENCION} años de tenencia la transferencia queda fuera del impuesto (COOTAD art. 559). Antes de ese plazo, la deducción anual del ${PLUSVALIA_DEDUCCION_ANUAL * 100}% ya va bajando la base año a año, así que el impuesto de una casa que tuviste quince años es mucho menor que el de una que compraste y vendiste en dos. Es la razón por la que la especulación inmobiliaria de corto plazo tributa mucho más que la tenencia larga.`,
    },
    {
      q: '¿Desde qué monto se paga impuesto a la herencia en Ecuador?',
      a: `Desde que la porción que recibe cada beneficiario supera la fracción básica desgravada de la tabla del SRI, hoy ${usd(HLD_FRACCION_BASICA)}. El impuesto se calcula por beneficiario, no sobre el total del patrimonio del causante: si la masa hereditaria se reparte entre varios herederos, cada uno mira su propia porción contra esa fracción exenta, y es muy común que ninguno llegue a pagar.`,
    },
    {
      q: '¿Los hijos pagan impuesto a la herencia?',
      a: 'Sí, pero con la tarifa reducida a la mitad por ser primer grado de consanguinidad. Hubo un período en que la ley los exoneró por completo, pero esa exoneración fue declarada inconstitucional en 2022 y el impuesto volvió a aplicarse con la rebaja del 50%. Para los hijos menores de edad o con discapacidad la ley prevé un tratamiento más favorable todavía, que conviene revisar con un profesional en el caso concreto.',
    },
    {
      q: '¿La herencia de un inmueble se valora al avalúo catastral?',
      a: 'No: se valora al avalúo comercial del bien a la fecha de la apertura de la sucesión. Como el avalúo catastral suele estar muy por debajo del valor de mercado, mucha gente calcula el impuesto con el número equivocado y se lleva una sorpresa. Del valor se pueden restar las deudas del causante y los gastos admitidos, que sí bajan la base imponible.',
    },
    {
      q: '¿Puedo donar en vida para evitar el impuesto?',
      a: 'No lo evita: las donaciones están alcanzadas por la misma tabla y el mismo impuesto que las herencias, justamente para que no se use la donación como vía de escape. Lo que sí puede cambiar es la planificación en el tiempo y por beneficiario, porque el impuesto se calcula por cada persona que recibe. Es una decisión que conviene tomar con asesoría, no con una calculadora.',
    },
    {
      q: '¿Qué otros costos tiene transferir un inmueble además de los impuestos?',
      a: 'Los honorarios de la notaría por la escritura, la inscripción en el Registro de la Propiedad, el certificado de gravámenes y, si hay financiamiento, los costos de la hipoteca y su inscripción. También conviene pedir el certificado de no adeudar al municipio: si el vendedor tiene predial impago, la transferencia se traba hasta que se ponga al día.',
    },
  ],

  sources: [
    { name: 'COOTAD — Código Orgánico de Organización Territorial, Autonomía y Descentralización', url: 'https://www.gob.ec/regulaciones/codigo-organico-organizacion-territorial-autonomia-descentralizacion-cootad', publisher: 'Gobierno del Ecuador' },
    { name: 'SRI — Impuesto a la renta sobre herencias, legados y donaciones', url: 'https://www.sri.gob.ec/impuesto-a-la-renta-de-ingresos-provenientes-de-herencias-legados-y-donaciones', publisher: 'Servicio de Rentas Internas' },
    { name: 'Municipio de Quito — Impuesto predial', url: 'https://pam.quito.gob.ec/', publisher: 'GAD del Distrito Metropolitano de Quito' },
    { name: 'GAD Municipal de Cuenca — Impuesto por utilidades y plusvalía', url: 'https://www.cuenca.gob.ec/content/impuesto-por-utilidades-y-plusvalia', publisher: 'GAD Municipal de Cuenca' },
    { name: 'Registro de la Propiedad — trámites de transferencia de dominio', url: 'https://www.gob.ec/', publisher: 'Gobierno del Ecuador' },
  ],

  replaces: [
    '/ec/calculadora-impuesto-predial-ecuador',
    '/ec/calculadora-impuesto-alcabala-ecuador',
    '/ec/calculadora-impuesto-plusvalia-inmueble-ecuador',
    '/ec/calculadora-impuesto-herencias-legados-donaciones-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
