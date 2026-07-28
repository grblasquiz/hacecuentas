import type { HubData } from '../types';
import { ECUADOR_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "Voy a formalizar mi negocio: ¿qué régimen me toca y cuánto
 * voy a pagar al año?"
 *
 * Absorbe rimpe-emprendedor-ecuador, rimpe-negocio-popular-ecuador,
 * patente-municipal-ecuador, impuesto-1-5-por-mil-activos-ecuador y
 * constitucion-compania-sas-ecuador.
 *
 * El hub compara los cuatro caminos con las MISMAS cifras y dice cuál sale más barato.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const IVA = ECUADOR_2026.iva;
export const FRACCION_BASICA = ECUADOR_2026.irFraccionBasicaDesgravada;

/** Tabla del IR de personas naturales — Resol. SRI NAC-DGERCGC25-00000043. */
export const IR_TABLA = ECUADOR_2026.irTabla.map((t) => ({
  desde: t.desde,
  hasta: Number.isFinite(t.hasta) ? t.hasta : null,
  base: t.base,
  pct: t.pct,
}));

/** Techos del RIMPE. */
export const TECHO_POPULAR = 20000;
export const TECHO_EMPRENDEDOR = 300000;

/**
 * RIMPE Negocio Popular: cuota fija anual de impuesto a la renta por tramo de
 * ingresos brutos del año anterior.
 *
 * Las dos fórmulas viejas traían tablas DISTINTAS entre sí. Esta es la
 * reconstrucción coherente de las dos: seis tramos, sin saltos.
 */
export const RIMPE_POPULAR = [
  { desde: 0, hasta: 2500, cuota: 0 },
  { desde: 2500, hasta: 5000, cuota: 5 },
  { desde: 5000, hasta: 7500, cuota: 10 },
  { desde: 7500, hasta: 10000, cuota: 15 },
  { desde: 10000, hasta: 15000, cuota: 35 },
  { desde: 15000, hasta: 20000, cuota: 60 },
];

/** RIMPE Emprendedor: cuota fija del tramo más un porcentaje sobre el excedente. */
export const RIMPE_EMPRENDEDOR = [
  { desde: 20000, hasta: 50000, base: 60, pct: 0.01 },
  { desde: 50000, hasta: 75000, base: 360, pct: 0.015 },
  { desde: 75000, hasta: 100000, base: 735, pct: 0.02 },
  { desde: 100000, hasta: 200000, base: 1235, pct: 0.02 },
  { desde: 200000, hasta: 300000, base: 3235, pct: 0.02 },
];

/** Patente municipal: límites nacionales del COOTAD art. 548. */
export const PATENTE_MIN = 10;
export const PATENTE_MAX = 25000;
/** Tabla progresiva referencial sobre el patrimonio (ordenanza del GAD de Cuenca). */
export const PATENTE_TABLA = [
  { desde: 0, hasta: 1000, base: 10, pct: 0 },
  { desde: 1000, hasta: 5000, base: 12, pct: 0.002 },
  { desde: 5000, hasta: 10000, base: 20, pct: 0.0025 },
  { desde: 10000, hasta: 20000, base: 32.5, pct: 0.0027 },
  { desde: 20000, hasta: 50000, base: 59.5, pct: 0.0029 },
  { desde: 50000, hasta: 100000, base: 146.5, pct: 0.0031 },
  { desde: 100000, hasta: 300000, base: 301.5, pct: 0.0033 },
  { desde: 300000, hasta: 500000, base: 961.5, pct: 0.0036 },
  { desde: 500000, hasta: 3000000, base: 1681.5, pct: 0.0039 },
  { desde: 3000000, hasta: null, base: 11431.5, pct: 0.0042 },
];
/** Tarifa fija de patente del DMQ para personas naturales no obligadas a contabilidad. */
export const PATENTE_QUITO_FIJA = 15;
/** Para no obligados a llevar contabilidad, el patrimonio se estima en el 10% de los ingresos. */
export const PATRIMONIO_PRESUNTO = 0.1;

/** Impuesto del 1,5 por mil sobre los activos totales (COOTAD arts. 552-555). */
export const TARIFA_ACTIVOS = 0.0015;

/** Costos de constitución de compañía. */
export const CONSTITUCION = {
  supercias: 0,
  ruc: 0,
  reservaNombre: 0,
  firmaElectronica: 18,
  notariaLtda: 200,
  notariaSa: 350,
  registroMercantil: 90,
  capitalMinimo: { sas: 1, ltda: 400, sa: 800 } as Record<string, number>,
};

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/impuestos/regimen-rimpe-y-negocio',
  title: 'RIMPE, régimen general o SAS en Ecuador: qué régimen te toca y cuánto pagas al año',
  description:
    'Compara con tus propias cifras cuánto pagas al año como RIMPE negocio popular, RIMPE emprendedor, régimen general o compañía SAS en Ecuador: cuota del SRI, patente municipal, 1,5 por mil sobre activos y costo de constituir la empresa.',
  silo: 'Impuestos',
  siloHref: '/ec/impuestos',
  locale: 'ec',

  eyebrow: 'Ecuador · SRI, GAD municipal y SUPERCIAS · negocios',
  h1: 'Voy a formalizar mi negocio: ¿qué régimen me toca y cuánto voy a pagar al año?',
  lede:
    'El régimen no se elige del todo: los ingresos te ubican. Pero lo que sí puedes decidir es si operas como persona natural o constituyes una compañía, y esa diferencia cambia la cuenta anual y el trámite de arranque. Acá se compara todo con las mismas cifras: cuota del SRI, patente municipal y 1,5 por mil sobre activos.',
  stamps: [
    `RIMPE popular hasta ${usd(TECHO_POPULAR)} · emprendedor hasta ${usd(TECHO_EMPRENDEDOR)}`,
    'Patente COOTAD art. 548 · mínimo $10, máximo $25.000',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Carga tributaria anual del negocio',

  cases: {
    title: '¿Dónde estás parado?',
    intro:
      'El techo de ingresos define el régimen; el resto lo decides tú. En todos los casos el hub muestra cuánto pagarías en cada uno de los cuatro caminos con tus mismas cifras.',
    items: [
      {
        id: 'popular',
        label: 'RIMPE negocio popular',
        hint: `Ingresos de hasta ${usd(TECHO_POPULAR)} al año`,
        answer: `El negocio popular paga una cuota fija anual de impuesto a la renta por tramo, que va de $0 a ${usd(60)}.`,
        yes: [
          `Aplica con ingresos brutos anuales de hasta ${usd(TECHO_POPULAR)}`,
          'La cuota de impuesto a la renta es fija por tramo: no cambia con cada venta dentro del tramo',
          'No se declara IVA y se emiten notas de venta en vez de facturas',
          'Igual corresponde la patente municipal, que es un impuesto aparte del GAD de tu cantón',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La categorización la hace el SRI con los ingresos del año anterior: si creciste, te recategoriza solo y la cuota cambia',
          'No emitir factura limita a tus clientes empresa, que no pueden sustentar crédito tributario con una nota de venta: puede costarte ventas',
          'La cuota fija se paga aunque el negocio haya tenido pérdida en el año',
        ],
        plazo: 'la cuota anual del negocio popular se declara y paga en mayo, según el noveno dígito del RUC.',
      },
      {
        id: 'emprendedor',
        label: 'RIMPE emprendedor',
        hint: `Ingresos de ${usd(TECHO_POPULAR)} a ${usd(TECHO_EMPRENDEDOR)} al año`,
        answer:
          'El emprendedor paga una cuota fija del tramo más un porcentaje sobre el excedente, y sí declara IVA.',
        yes: [
          `Aplica con ingresos brutos anuales de más de ${usd(TECHO_POPULAR)} y hasta ${usd(TECHO_EMPRENDEDOR)}`,
          'La cuota se arma con el impuesto fijo del tramo más un porcentaje sobre lo que excede el piso del tramo',
          `Se emiten facturas y se declara IVA del ${IVA * 100}%`,
          'Se aplica sobre ingresos brutos, no sobre la utilidad: los costos del negocio no bajan la cuota',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Que la cuota se calcule sobre ingresos brutos es la trampa del régimen: si tu margen es bajo, el RIMPE puede salir más caro que el régimen general, donde sí restas costos y gastos',
          'Superar el techo del régimen te empuja al régimen general con todas sus obligaciones contables',
          'Hay actividades expresamente excluidas del RIMPE (profesionales con título, actividades de recursos naturales no renovables, entre otras): verifica que la tuya califique',
        ],
        plazo: 'la declaración de renta del RIMPE emprendedor es anual, y la de IVA sigue el calendario de tu noveno dígito.',
      },
      {
        id: 'general',
        label: 'Régimen general como persona natural',
        hint: 'Sin techo de ingresos · tributa sobre la utilidad',
        answer:
          'En el régimen general pagas la tabla del impuesto a la renta sobre la utilidad, no sobre los ingresos brutos.',
        yes: [
          'Se aplica la tabla progresiva del impuesto a la renta de personas naturales sobre la base imponible',
          'Los costos y gastos del negocio, con comprobantes válidos, sí bajan la base imponible',
          `La fracción básica desgravada (${usd(FRACCION_BASICA)}) también corre acá: por debajo de eso el impuesto es cero`,
          'Es el régimen obligatorio si superas el techo del RIMPE o si tu actividad está excluida',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si superas los umbrales de ingresos, costos o capital que fija el reglamento, quedas obligado a llevar contabilidad, con contador y estados financieros',
          'Un margen bajo hace que el régimen general convenga; un margen alto hace que convenga el RIMPE. La comparación de acá te dice cuál es tu caso',
          'Estar obligado a llevar contabilidad activa además el impuesto del 1,5 por mil sobre los activos totales',
        ],
        plazo: 'la declaración de renta de personas naturales se presenta en marzo, por noveno dígito.',
      },
      {
        id: 'sas',
        label: 'Constituir una compañía (SAS, Ltda. o S.A.)',
        hint: 'SUPERCIAS · sociedad con personalidad jurídica propia',
        answer:
          'La SAS se constituye en línea, sin notaría ni Registro Mercantil, y con capital desde un dólar.',
        yes: [
          `Constituir una SAS ante SUPERCIAS no tiene costo: el gasto real son las firmas electrónicas (unos ${usd(CONSTITUCION.firmaElectronica)} por firmante y por año)`,
          `Capital mínimo: ${usd(CONSTITUCION.capitalMinimo.sas)} en la SAS, ${usd(CONSTITUCION.capitalMinimo.ltda)} en la Cía. Ltda. y ${usd(CONSTITUCION.capitalMinimo.sa)} en la S.A.`,
          'La compañía tributa como sociedad sobre su utilidad, con su propia tarifa de impuesto a la renta',
          'El RUC en el SRI y la reserva de denominación en SUPERCIAS son gratuitos',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tarifa de impuesto a la renta de sociedades no está en los datos verificados de este sitio: viene cargada como campo editable y hay que confirmarla con la norma vigente antes de decidir',
          'Una compañía obliga a contabilidad completa, estados financieros y, según el caso, auditoría: el costo contable anual suele superar largamente lo que ahorras en impuestos si el negocio es chico',
          'El capital no es un gasto perdido: queda en la compañía. Pero sí es plata que tienes que tener disponible al arrancar',
          'Los costos de notaría y Registro Mercantil de la vía tradicional son valores de mercado referenciales: varían por cantón y por capital',
        ],
        plazo: 'la constitución de una SAS en línea suele resolverse en 1 a 3 días hábiles; la vía tradicional, en 1 a 3 semanas.',
      },
    ],
  },

  inputsTitle: 'Las cifras de tu negocio',
  inputsIntro:
    'Con estos datos se calculan los cuatro caminos a la vez, para que la comparación sea contra tus números y no contra un ejemplo.',
  fields: [
    {
      id: 'ingresos',
      label: 'Ingresos brutos anuales ($)',
      prefix: '$',
      value: '30.000',
      thousands: true,
      help: 'Todo lo facturado en el año, antes de restar costos. Es la cifra que usa el SRI para ubicarte en el régimen.',
    },
    {
      id: 'gastos',
      label: 'Costos y gastos anuales con comprobante ($)',
      prefix: '$',
      value: '18.000',
      thousands: true,
      help: 'Solo cuentan en el régimen general y en la compañía. En el RIMPE no bajan la cuota, porque se calcula sobre ingresos brutos.',
    },
    {
      id: 'patrimonio',
      label: 'Patrimonio del negocio en el cantón ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: `Base de la patente municipal. Si lo dejas en cero se estima como el ${PATRIMONIO_PRESUNTO * 100}% de tus ingresos, que es la regla del COOTAD para quien no lleva contabilidad.`,
    },
    {
      id: 'canton',
      label: 'Régimen de patente municipal',
      type: 'select',
      value: 'tabla',
      options: [
        { value: 'tabla', label: 'Tabla progresiva sobre el patrimonio (referencia COOTAD)' },
        { value: 'quito_fija', label: 'Quito: tarifa fija para persona natural no obligada a contabilidad' },
      ],
      help: 'Cada GAD publica su propia tabla dentro de los límites del COOTAD. La progresiva cargada es referencial, tomada de una ordenanza municipal.',
    },
    {
      id: 'activos',
      label: 'Activos totales del negocio ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Solo para el impuesto del 1,5 por mil, que aplica a quienes están obligados a llevar contabilidad.',
    },
    {
      id: 'pasivos',
      label: 'Pasivos corrientes y contingentes ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Obligaciones de hasta un año plazo y pasivos contingentes. Se restan de los activos para el 1,5 por mil (COOTAD art. 553).',
    },
    {
      id: 'tipoCompania',
      label: 'Tipo de compañía',
      type: 'select',
      value: 'sas',
      options: [
        { value: 'sas', label: 'SAS — capital desde $1, 100% en línea' },
        { value: 'ltda', label: 'Cía. Ltda. — capital mínimo $400' },
        { value: 'sa', label: 'S.A. — capital mínimo $800' },
      ],
      help: 'La SAS solo se constituye en línea ante SUPERCIAS; la Ltda. y la S.A. admiten las dos vías.',
    },
    {
      id: 'via',
      label: 'Vía de constitución',
      type: 'select',
      value: 'digital',
      options: [
        { value: 'digital', label: 'Digital: en línea ante SUPERCIAS' },
        { value: 'tradicional', label: 'Tradicional: notaría más Registro Mercantil' },
      ],
      help: 'En la SAS la vía siempre es digital, sin importar lo que elijas acá.',
    },
    {
      id: 'socios',
      label: 'Número de socios o accionistas',
      type: 'number',
      value: 1,
      min: 1,
      max: 50,
      step: 1,
      help: 'En la constitución digital cada firmante necesita su propia firma electrónica.',
    },
    {
      id: 'tarifaSociedad',
      label: 'Tarifa de impuesto a la renta de sociedades (%)',
      type: 'number',
      value: 25,
      min: 0,
      max: 50,
      step: 0.5,
      help: 'Campo editable a propósito: esta tarifa no está entre los datos verificados del sitio. Confírmala en la Ley de Régimen Tributario Interno antes de tomar una decisión con este número.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu carga anual',
    caption:
      'Compara el peso del impuesto a la renta del régimen contra los tributos municipales, que mucha gente descubre recién al primer año.',
  },
  breakdownTitle: 'Cuánto pagarías en cada camino, con tus mismas cifras',
  breakdownIntro:
    'La misma facturación y los mismos gastos, liquidados en los cuatro regímenes, más los tributos municipales que corren en todos.',

  faq: [
    {
      q: '¿Qué es el RIMPE y quién entra?',
      a: `El Régimen Simplificado para Emprendedores y Negocios Populares es un régimen de impuesto a la renta simplificado para contribuyentes chicos. Tiene dos categorías: negocio popular, con ingresos brutos anuales de hasta ${usd(TECHO_POPULAR)}, y emprendedor, de ahí hasta ${usd(TECHO_EMPRENDEDOR)}. La categorización la hace el SRI de oficio con los ingresos del año anterior; no se elige. Hay actividades expresamente excluidas del régimen.`,
    },
    {
      q: '¿Cuánto paga un negocio popular al año?',
      a: `Una cuota fija por tramo de ingresos: cero hasta ${usd(2500)}, y de ahí sube por escalones hasta ${usd(60)} anuales en el tramo de ${usd(15000)} a ${usd(20000)}. Es impuesto a la renta, no una tasa: se paga aunque el año haya cerrado con pérdida. Además, el negocio popular no declara IVA y emite notas de venta en lugar de facturas.`,
    },
    {
      q: '¿Cómo se calcula la cuota del RIMPE emprendedor?',
      a: 'Con la misma mecánica de las tablas tributarias ecuatorianas: se busca el tramo donde caen tus ingresos brutos anuales, se toma el impuesto fijo de ese tramo y se le suma un porcentaje aplicado solo al excedente sobre el piso del tramo. Lo importante es que la base son los ingresos brutos, no la utilidad: los costos del negocio no la bajan.',
    },
    {
      q: '¿Me conviene el RIMPE o el régimen general?',
      a: 'Depende del margen. Si tu negocio tiene mucho costo y poca utilidad, el RIMPE te cobra sobre ingresos brutos y puede terminar siendo más caro que el régimen general, donde tributas sobre la utilidad y la fracción básica desgravada te puede dejar en cero. Si tu margen es alto, el RIMPE suele salir mucho más barato y con menos trabajo contable. La comparación de este hub corre los dos con tus cifras para que lo veas en números.',
    },
    {
      q: '¿Qué es la patente municipal y quién la paga?',
      a: `La paga toda persona natural o jurídica que ejerza actividad económica permanente y esté obligada a sacar RUC, en el cantón donde opera. La base es el patrimonio del negocio dentro del cantón, y cada GAD fija su tabla por ordenanza, pero el COOTAD art. 548 impone un piso de ${usd(PATENTE_MIN)} y un techo de ${usd(PATENTE_MAX)} al año. Para quien no lleva contabilidad, el patrimonio se estima en el ${PATRIMONIO_PRESUNTO * 100}% de los ingresos del ejercicio anterior.`,
    },
    {
      q: '¿Qué es el impuesto del 1,5 por mil sobre los activos totales?',
      a: 'Es otro impuesto municipal, que pagan las personas naturales y jurídicas obligadas a llevar contabilidad. La base son los activos totales menos las obligaciones de hasta un año plazo y los pasivos contingentes, y la tarifa es 1,5 por mil de esa base. Es independiente de si el año fue bueno o malo: se paga sobre el balance, no sobre la ganancia.',
    },
    {
      q: '¿Cuánto cuesta constituir una SAS en Ecuador?',
      a: `El trámite ante SUPERCIAS no tiene costo y se hace íntegramente en línea, sin notaría ni Registro Mercantil. El gasto real son las firmas electrónicas: alrededor de ${usd(CONSTITUCION.firmaElectronica)} por año y por firmante. El capital mínimo es de ${usd(CONSTITUCION.capitalMinimo.sas)}, y ese dinero no se pierde: queda en la compañía. Si sumas honorarios de abogado, el costo total depende de a quién contrates, no del trámite.`,
    },
    {
      q: '¿Cuál es la diferencia entre SAS, Cía. Ltda. y S.A.?',
      a: `Principalmente el capital mínimo, la flexibilidad estatutaria y la vía de constitución. La SAS pide capital desde ${usd(CONSTITUCION.capitalMinimo.sas)}, se constituye solo en línea y tiene la estructura más flexible. La Cía. Ltda. pide ${usd(CONSTITUCION.capitalMinimo.ltda)} y tiene un tope de socios. La S.A. pide ${usd(CONSTITUCION.capitalMinimo.sa)} y está pensada para estructuras con acciones negociables. Desde la reforma a la Ley de Compañías, la Ltda. y la S.A. también pueden constituirse por documento privado, sin escritura pública obligatoria.`,
    },
    {
      q: '¿Constituir una compañía me hace pagar menos impuestos?',
      a: 'No necesariamente, y con un negocio chico casi nunca. La compañía tributa sobre su utilidad con la tarifa de sociedades, y encima el retiro de utilidades hacia los socios tiene su propio tratamiento. A eso se suma el costo fijo de la contabilidad, los estados financieros y las obligaciones societarias. La compañía se justifica por límite de responsabilidad, socios, acceso a crédito o contratos, más que por ahorro tributario.',
    },
    {
      q: '¿Qué pasa si supero el techo del RIMPE a mitad de año?',
      a: 'La recategorización la hace el SRI para el ejercicio siguiente, tomando los ingresos del año anterior. Es decir, no cambias de régimen a mitad del ejercicio por haber facturado de más en junio; el efecto se ve en la siguiente categorización. Conviene anticiparlo, porque el salto al régimen general implica obligaciones contables que se preparan con tiempo, no de un mes al otro.',
    },
    {
      q: '¿El RIMPE me exime de la patente municipal?',
      a: 'No. La patente es un impuesto municipal y corre en paralelo al régimen del SRI: la paga hasta el negocio popular con cuota de renta cero. Es uno de los costos que más sorprende al primer año de formalizar, junto con el 1,5 por mil sobre activos para quienes llevan contabilidad. Cuando estimes tu carga anual, súmalos desde el principio.',
    },
    {
      q: '¿Qué obligaciones tengo aparte de pagar?',
      a: 'Mantener el RUC actualizado, emitir los comprobantes que corresponden a tu régimen (notas de venta o facturas), declarar en los plazos del noveno dígito, conservar los comprobantes de sustento de tus costos y gastos, y, si estás obligado a llevar contabilidad, hacerlo con contador. Muchas multas del SRI no vienen del impuesto sino de no presentar una declaración a tiempo, aunque sea en cero.',
    },
  ],

  sources: [
    { name: 'SRI — Régimen RIMPE', url: 'https://www.sri.gob.ec/web/intersri/rimpe', publisher: 'Servicio de Rentas Internas' },
    { name: 'SRI — Impuesto a la Renta', url: 'https://www.sri.gob.ec/impuesto-renta', publisher: 'Servicio de Rentas Internas' },
    { name: 'COOTAD — impuesto de patentes y del 1,5 por mil sobre los activos totales', url: 'https://www.gob.ec/regulaciones/codigo-organico-organizacion-territorial-autonomia-descentralizacion-cootad', publisher: 'Gobierno del Ecuador' },
    { name: 'SUPERCIAS — constitución de sociedades por acciones simplificadas (SAS)', url: 'https://www.gob.ec/scvs/tramites/constitucion-sociedades-acciones-simplificadas', publisher: 'Superintendencia de Compañías, Valores y Seguros' },
    { name: 'SRI — Registro Único de Contribuyentes (RUC)', url: 'https://www.sri.gob.ec/registro-unico-de-contribuyentes-ruc', publisher: 'Servicio de Rentas Internas' },
    { name: 'GAD Municipal de Cuenca — impuesto de patentes municipales', url: 'https://www.cuenca.gob.ec/node/10510', publisher: 'GAD Municipal de Cuenca' },
  ],

  replaces: [
    '/ec/calculadora-rimpe-emprendedor-ecuador',
    '/ec/calculadora-rimpe-negocio-popular-ecuador',
    '/ec/calculadora-patente-municipal-ecuador',
    '/ec/calculadora-impuesto-1-5-por-mil-activos-ecuador',
    '/ec/calculadora-constitucion-compania-sas-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
