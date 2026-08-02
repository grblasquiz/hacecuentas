import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Cuánto me cuesta de impuestos comprar o vender un piso?"
 *
 * Absorbe 4 calculadoras: ITP y AJD, plusvalía municipal, ganancia patrimonial
 * en la venta y tasación por m².
 *
 * Constantes: espejo de
 * src/lib/formulas/itp-actos-juridicos-documentados-espana-vivienda.ts,
 * plusvalia-municipal-iivtnu-espana.ts y
 * ganancia-patrimonial-venta-vivienda-espana.ts.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'es/vivienda/comprar-o-vender-piso',
  title: 'Comprar o vender piso en España: ITP, AJD, plusvalía y ganancia patrimonial',
  description:
    'Calcula los impuestos de comprar o vender vivienda en España: ITP por comunidad, IVA y AJD en obra nueva, plusvalía municipal por los dos métodos y ganancia patrimonial en el IRPF.',
  silo: 'Vivienda',
  siloHref: '/es/vivienda',

  eyebrow: 'Guía fiscal inmobiliaria',
  h1: 'Comprar o vender un piso: ¿cuánto se llevan los impuestos?',
  lede:
    'En una compraventa de vivienda hay tres administraciones cobrando a la vez: la comunidad autónoma con el ITP o el AJD, el ayuntamiento con la plusvalía municipal y Hacienda con la ganancia patrimonial del vendedor. Quién paga cada uno depende de si compras o vendes, y de si la vivienda es nueva o de segunda mano.',
  stamps: ['Tipos de ITP por comunidad', 'Plusvalía por los dos métodos', '4 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Compras o vendes?',
    intro: 'Los impuestos de una compraventa no los paga el mismo: cada parte tiene los suyos.',
    items: [
      {
        id: 'segunda_mano',
        label: 'Compro de segunda mano',
        hint: 'ITP según tu comunidad',
        answer:
          'En segunda mano se paga el Impuesto de Transmisiones Patrimoniales, cuyo tipo fija cada comunidad autónoma.',
        yes: [
          'ITP sobre el mayor entre el precio y el valor de referencia de Catastro',
          'Tipos reducidos para jóvenes, familia numerosa o precios bajos, según comunidad',
          'Notaría, registro y gestoría a cargo del comprador',
          'Sin IVA: en segunda mano el ITP lo sustituye',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La base no es el precio pactado sino el valor de referencia de Catastro si éste es mayor: comprar barato no siempre abarata el impuesto',
          'El tipo reducido exige cumplir requisitos de edad, renta o precio, y hay que solicitarlo al liquidar',
          'El plazo para liquidar el ITP es de 30 días hábiles desde la escritura',
        ],
        plazo: 'ITP: 30 días hábiles desde la firma de la escritura.',
      },
      {
        id: 'obra_nueva',
        label: 'Compro obra nueva',
        hint: 'IVA al 10% más AJD',
        answer:
          'La vivienda nueva lleva IVA del 10% y, además, Actos Jurídicos Documentados, que también fija cada comunidad.',
        yes: [
          'IVA del 10% sobre el precio de la vivienda',
          'AJD sobre la escritura, con tipo autonómico',
          'Notaría, registro y gestoría',
          'IVA del 4% en vivienda de protección oficial de régimen especial',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Los garajes y trasteros comprados por separado tributan al 21% de IVA, no al 10%',
          'El AJD también se paga al firmar la hipoteca, aunque desde 2018 corre a cargo del banco',
        ],
        plazo: 'AJD: 30 días hábiles desde la escritura.',
      },
      {
        id: 'vendo',
        label: 'Vendo mi vivienda',
        hint: 'Plusvalía municipal y ganancia patrimonial',
        answer:
          'El vendedor paga la plusvalía municipal al ayuntamiento y la ganancia patrimonial en el IRPF, salvo exenciones.',
        yes: [
          'Plusvalía municipal por el método objetivo o por el real, el que salga menor',
          'Ganancia patrimonial en la base del ahorro del IRPF, del 19% al 28%',
          'Exención total por reinversión en otra vivienda habitual',
          'Exención para mayores de 65 años que venden su vivienda habitual',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Si no hubo incremento de valor del suelo, la plusvalía municipal no se paga: hay que acreditarlo con las escrituras',
          'La exención por reinversión exige reinvertir en dos años y sólo cubre la parte proporcional reinvertida',
          'Si el comprador es no residente, hay una retención del 3% a cuenta que se descuenta luego',
        ],
        plazo: 'plusvalía municipal: 30 días hábiles desde la venta.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'El valor catastral del suelo está en tu recibo del IBI y es la base de la plusvalía municipal.',
  fields: [
    { id: 'precio', label: 'Precio de la vivienda', prefix: '€', value: '200.000', thousands: true },
    {
      id: 'ccaa',
      label: 'Comunidad autónoma',
      type: 'select',
      value: 'MAD',
      options: [
        { value: 'MAD', label: 'Comunidad de Madrid' },
        { value: 'CAT', label: 'Cataluña' },
        { value: 'AND', label: 'Andalucía' },
        { value: 'VAL', label: 'Comunitat Valenciana' },
        { value: 'GAL', label: 'Galicia' },
        { value: 'CYL', label: 'Castilla y León' },
        { value: 'CLM', label: 'Castilla-La Mancha' },
        { value: 'ARA', label: 'Aragón' },
        { value: 'AST', label: 'Asturias' },
        { value: 'MUR', label: 'Región de Murcia' },
        { value: 'BAL', label: 'Islas Baleares' },
        { value: 'EXT', label: 'Extremadura' },
        { value: 'CAB', label: 'Cantabria' },
      ],
    },
    {
      id: 'tipoReducido',
      label: '¿Cumples requisitos de tipo reducido?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, tipo general' },
        { value: 'si', label: 'Sí (joven, familia numerosa o precio limitado)' },
      ],
    },
    { id: 'precioCompra', label: 'Precio al que compraste (si vendes)', prefix: '€', value: '150.000', thousands: true },
    { id: 'gastosCompra', label: 'Gastos e impuestos de aquella compra', prefix: '€', value: '15.000', thousands: true },
    { id: 'anios', label: 'Años que has tenido la vivienda', type: 'number', value: '10', min: 0, max: 40, step: 1 },
    { id: 'valorSuelo', label: 'Valor catastral del suelo', prefix: '€', value: '40.000', thousands: true },
    {
      id: 'tipoPlusvalia',
      label: 'Tipo de gravamen de la plusvalía en tu municipio',
      type: 'number',
      value: '29',
      min: 0,
      max: 30,
      step: 0.5,
      suffix: '%',
      help: 'Lo fija cada ayuntamiento con un máximo legal del 30%.',
    },
    { id: 'metros', label: 'Metros cuadrados de la vivienda', type: 'number', value: '90', min: 10, max: 600, step: 1 },
    { id: 'precioM2', label: 'Precio de referencia de la zona', prefix: '€', suffix: '/m²', value: '2.200', thousands: true },
  ],
  fineprint: DISCLAIMER_FISCAL,

  chart: {
    type: 'donut',
    title: 'A dónde va el dinero de la operación',
    caption:
      'Además del precio, una compraventa mueve impuestos autonómicos, municipales y estatales, más los gastos de notaría y registro.',
  },
  breakdownTitle: 'Todos los impuestos y gastos',
  breakdownIntro:
    'Los importes son de la operación completa. Las filas de porcentaje y de superficie llevan su unidad.',

  faq: [
    {
      q: '¿Cuánto se paga de ITP al comprar de segunda mano?',
      a: 'Depende de la comunidad autónoma: los tipos generales se mueven aproximadamente entre el 6% y el 10% del valor. Casi todas tienen tipos reducidos para jóvenes, familias numerosas, personas con discapacidad o viviendas por debajo de cierto precio, pero hay que cumplir los requisitos y solicitarlo al liquidar.',
    },
    {
      q: '¿Sobre qué valor se calcula el ITP?',
      a: 'Sobre el mayor entre el precio escriturado y el valor de referencia que publica el Catastro. Desde que existe ese valor de referencia, escriturar por debajo del mercado ya no ahorra impuesto: Hacienda liquida sobre el valor de referencia y reclama la diferencia.',
    },
    {
      q: '¿Qué se paga en obra nueva?',
      a: 'IVA del 10% sobre el precio de la vivienda, o del 4% si es protección oficial de régimen especial, más el impuesto de Actos Jurídicos Documentados de la escritura, con tipo autonómico. Los garajes y trasteros comprados aparte van al 21%.',
    },
    {
      q: '¿Qué es la plusvalía municipal y quién la paga?',
      a: 'Es el impuesto sobre el incremento del valor de los terrenos urbanos y lo paga el vendedor en una compraventa, o el heredero o donatario en una herencia o donación. Se liquida en el ayuntamiento en los 30 días hábiles siguientes a la operación.',
    },
    {
      q: '¿Cómo se calcula hoy la plusvalía municipal?',
      a: 'Por dos métodos, y el contribuyente elige el que le salga menor. El objetivo aplica un coeficiente al valor catastral del suelo según los años transcurridos; el real toma la ganancia efectiva de la venta y le aplica la proporción que representa el suelo sobre el valor catastral total. Es la consecuencia de la sentencia del Tribunal Constitucional que anuló el sistema anterior.',
    },
    {
      q: '¿Y si vendo con pérdidas?',
      a: 'Entonces no hay plusvalía municipal que pagar: sin incremento de valor no hay hecho imponible. Hay que acreditarlo aportando las escrituras de compra y de venta, y el ayuntamiento sigue exigiendo la declaración aunque el resultado sea cero.',
    },
    {
      q: '¿Cuánto se paga por la ganancia al vender?',
      a: 'La ganancia va a la base del ahorro del IRPF, con la escala del 19% al 28% por tramos. La ganancia es la diferencia entre el valor de transmisión, restando gastos e impuestos de la venta, y el valor de adquisición, sumándole los gastos e impuestos que pagaste al comprar.',
    },
    {
      q: '¿Puedo librarme de pagar la ganancia?',
      a: 'Sí en dos casos: si reinviertes el importe obtenido en otra vivienda habitual dentro de los dos años, la ganancia queda exenta en la proporción reinvertida; y si tienes 65 años o más y vendes tu vivienda habitual, la exención es total sin necesidad de reinvertir.',
    },
    {
      q: '¿Qué gastos de la compra puedo sumar al valor de adquisición?',
      a: 'El ITP o el IVA que pagaste, la notaría, el registro, la gestoría y las inversiones de mejora, que no es lo mismo que las reparaciones. Guardar esas facturas durante décadas es lo que marca la diferencia entre una ganancia real y una ganancia inflada.',
    },
    {
      q: '¿Para qué sirve la tasación?',
      a: 'El banco la exige para conceder la hipoteca: presta un porcentaje del menor entre el precio y el valor de tasación, así que una tasación baja obliga a poner más dinero de entrada. También sirve como referencia de mercado, aunque no sustituye al valor de referencia de Catastro a efectos fiscales.',
    },
    {
      q: '¿Cuánto cuestan la notaría y el registro?',
      a: 'Son aranceles regulados que dependen del valor de la operación, y suelen sumar entre el 1% y el 2% del precio junto con la gestoría. Es el bloque de gasto más previsible de toda la operación, y el que menos varía entre comunidades.',
    },
  ],

  sources: [
    {
      name: 'Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Ley Reguladora de las Haciendas Locales — IIVTNU (plusvalía municipal)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Sentencia del Tribunal Constitucional 182/2021 sobre la plusvalía municipal',
      url: 'https://www.tribunalconstitucional.es/NotasDePrensaDocumentos/NP_2021_099/2019-04701STC.pdf',
      publisher: 'Tribunal Constitucional',
    },
    {
      name: 'Sede Electrónica del Catastro — valor de referencia',
      url: 'https://www.sedecatastro.gob.es/',
      publisher: 'Dirección General del Catastro',
    },
    {
      name: 'Manual práctico de Renta — ganancias por transmisión de vivienda',
      url: 'https://sede.agenciatributaria.gob.es/Sede/Ayuda/Manuales/Renta.html',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
  ],

  replaces: [
    '/calculadora-itp-actos-juridicos-documentados-espana-vivienda',
    '/calculadora-plusvalia-municipal-iivtnu-espana',
    '/calculadora-ganancia-patrimonial-venta-vivienda-espana',
    '/calculadora-tasacion-vivienda-espana-precio-m2-zona',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Tipos de ITP por comunidad. Espejo de itp-actos-juridicos-documentados-espana-vivienda.ts. */
export const ITP_TIPOS: Record<string, { nombre: string; general: number; reducido: number; ajd: number }> = {
  MAD: { nombre: 'Comunidad de Madrid', general: 0.06, reducido: 0.04, ajd: 0.0075 },
  CAT: { nombre: 'Cataluña', general: 0.1, reducido: 0.05, ajd: 0.015 },
  AND: { nombre: 'Andalucía', general: 0.07, reducido: 0.035, ajd: 0.012 },
  VAL: { nombre: 'Comunitat Valenciana', general: 0.1, reducido: 0.08, ajd: 0.015 },
  GAL: { nombre: 'Galicia', general: 0.1, reducido: 0.06, ajd: 0.015 },
  CYL: { nombre: 'Castilla y León', general: 0.08, reducido: 0.04, ajd: 0.015 },
  CLM: { nombre: 'Castilla-La Mancha', general: 0.09, reducido: 0.06, ajd: 0.015 },
  ARA: { nombre: 'Aragón', general: 0.08, reducido: 0.05, ajd: 0.015 },
  AST: { nombre: 'Asturias', general: 0.08, reducido: 0.03, ajd: 0.012 },
  MUR: { nombre: 'Región de Murcia', general: 0.08, reducido: 0.03, ajd: 0.02 },
  BAL: { nombre: 'Islas Baleares', general: 0.08, reducido: 0.04, ajd: 0.012 },
  EXT: { nombre: 'Extremadura', general: 0.08, reducido: 0.05, ajd: 0.015 },
  CAB: { nombre: 'Cantabria', general: 0.1, reducido: 0.05, ajd: 0.015 },
};

/** IVA de la vivienda nueva. Art. 91 Ley 37/1992. */
export const IVA_VIVIENDA = { nueva: 0.1, vpoEspecial: 0.04, garajeSeparado: 0.21 };

/**
 * Coeficientes del método objetivo de la plusvalía municipal, por años
 * transcurridos. Espejo de plusvalia-municipal-iivtnu-espana.ts.
 */
export const COEF_PLUSVALIA: Record<string, number> = {
  0: 0.14,
  1: 0.13,
  2: 0.15,
  3: 0.16,
  4: 0.17,
  5: 0.17,
  6: 0.16,
  7: 0.12,
  8: 0.1,
  9: 0.09,
  10: 0.08,
  11: 0.08,
  12: 0.08,
  13: 0.08,
  14: 0.1,
  15: 0.12,
  16: 0.16,
  17: 0.2,
  18: 0.26,
  19: 0.36,
  20: 0.45,
};

/** Escala de la base del ahorro. Art. 66 Ley 35/2006. */
export const ESCALA_AHORRO: Array<[number, number]> = [
  [6000, 0.19],
  [50000, 0.21],
  [200000, 0.23],
  [300000, 0.27],
  [Infinity, 0.28],
];

/** Gastos de notaría, registro y gestoría, como porcentaje del precio. */
export const GASTOS_NOTARIA_PCT = 0.015;
