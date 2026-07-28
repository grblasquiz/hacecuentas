import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Cuánto me quita Hacienda de lo que gano con mis ahorros?"
 *
 * Eje: la base imponible del ahorro del IRPF y su escala propia, que es común a
 * ganancias patrimoniales y a rendimientos del capital mobiliario. La lotería va
 * por un gravamen especial aparte y el modelo 720 no es un impuesto sino una
 * declaración informativa: se absorbe por URL y se resuelve con una fila.
 *
 * Constantes: espejo de src/lib/formulas/impuestos-venta-acciones-fondos-irpf-espana.ts,
 * irpf-capital-mobiliario-intereses-dividendos-espana.ts,
 * impuestos-loteria-premio-espana-hacienda.ts y modelo-720-bienes-extranjero-espana.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio fiscal). */
const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'es/impuestos/ahorro-e-inversiones',
  title: 'Impuestos del ahorro en España: acciones, fondos, dividendos y premios',
  description:
    'Calcula lo que se lleva Hacienda de tus inversiones: escala del ahorro para ganancias por vender acciones o fondos, intereses y dividendos, gravamen de los premios y umbral del modelo 720.',
  silo: 'Impuestos',
  siloHref: '/es/impuestos',

  eyebrow: 'Guía y estimación fiscal',
  h1: 'Gané dinero con mis ahorros: ¿cuánto se lleva Hacienda?',
  lede:
    'Lo que ganas invirtiendo no tributa con la escala de tu nómina, sino con una escala propia: la base del ahorro, que arranca en el 19% y sube hasta el 28%. Vender acciones, cobrar dividendos o recibir intereses van todos al mismo saco. Los premios de lotería, en cambio, tienen un gravamen especial con una parte exenta.',
  stamps: ['Escala del ahorro del IRPF', 'Gravamen especial de premios', '4 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿De dónde viene la ganancia?',
    intro: 'Cada tipo de rendimiento entra en el impuesto por una puerta distinta.',
    items: [
      {
        id: 'acciones',
        label: 'Vendí acciones o fondos',
        hint: 'Ganancia patrimonial',
        answer:
          'La ganancia es la diferencia entre venta y compra, con gastos y comisiones incluidos, y tributa en la base del ahorro.',
        yes: [
          'Precio de venta menos precio de compra, restando comisiones de ambas operaciones',
          'Escala del ahorro: 19%, 21%, 23%, 27% y 28% por tramos',
          'Compensación con pérdidas patrimoniales del mismo año y de los cuatro anteriores',
          'Criterio FIFO: se venden primero las participaciones más antiguas',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Regla de los dos meses: si recompras valores homogéneos dentro de los dos meses anteriores o posteriores, la pérdida no se puede computar todavía',
          'El traspaso entre fondos de inversión no tributa mientras no reembolses, pero el traspaso entre ETF sí',
          'Las pérdidas del ahorro sólo compensan rendimientos del capital mobiliario hasta un límite del 25%',
        ],
        plazo: 'se declara en la Renta del año siguiente a la venta, entre abril y junio.',
      },
      {
        id: 'dividendos',
        label: 'Cobré intereses o dividendos',
        hint: 'Capital mobiliario',
        answer:
          'Intereses y dividendos llevan una retención del 19% en origen y luego se regularizan con la misma escala del ahorro.',
        yes: [
          'Intereses de cuentas, depósitos, letras y bonos',
          'Dividendos de acciones y participaciones en beneficios',
          'Retención del 19% practicada por el banco o la sociedad que paga',
          'Gastos de administración y depósito de valores, deducibles',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La exención de los primeros 1.500 € de dividendos se suprimió hace años: hoy tributa desde el primer euro',
          'Los dividendos de acciones extranjeras sufren retención en origen: hay que pedir la deducción por doble imposición y a veces la devolución en el país de origen',
        ],
        plazo: 'la retención se practica al cobrar; la cuenta final se cierra en la Renta.',
      },
      {
        id: 'loteria',
        label: 'Me tocó un premio',
        hint: 'Gravamen especial del 20%',
        answer:
          'Los premios de Loterías, ONCE y Cruz Roja están exentos hasta 40.000 € por décimo o boleto; el exceso tributa al 20%.',
        yes: [
          'Exención de los primeros 40.000 € de cada décimo o boleto premiado',
          'Gravamen especial del 20% sobre el exceso, retenido en el momento del cobro',
          'La exención se reparte entre los partícipes en proporción a su parte',
          'No se suma al resto de tus rentas: es un gravamen independiente',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Si compartes el décimo, cada partícipe debe estar identificado antes de cobrar o Hacienda puede tratar el reparto como donación',
          'Los premios de casinos, apuestas y concursos NO van por este gravamen: son ganancia patrimonial en la base general y tributan bastante más',
        ],
        plazo: 'la retención se aplica al cobrar el premio en la entidad colaboradora.',
      },
      {
        id: 'extranjero',
        label: 'Tengo bienes fuera de España',
        hint: 'Modelo 720',
        answer:
          'Si algún bloque de bienes en el extranjero supera los 50.000 €, tienes que presentar el modelo 720, que informa pero no liquida.',
        yes: [
          'Tres bloques independientes: cuentas, valores y seguros, e inmuebles',
          'Umbral de 50.000 € por bloque, no sobre el total',
          'Sólo se repite en años posteriores si el bloque sube más de 20.000 € o si se cancela algo declarado',
          'Los rendimientos de esos bienes tributan aparte, en su base correspondiente',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'El modelo 720 es informativo: no paga impuesto, pero no presentarlo tiene consecuencias',
          'La sentencia del TJUE C-788/19 anuló el régimen sancionador desproporcionado y la imprescriptibilidad; el régimen actual es el general de la Ley General Tributaria',
        ],
        plazo: 'se presenta entre el 1 de enero y el 31 de marzo del año siguiente.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'Rellena los campos de tu caso: los que no apliquen déjalos en cero y no afectan al resultado.',
  fields: [
    { id: 'venta', label: 'Importe de venta (acciones o fondos)', prefix: '€', value: '20.000', thousands: true },
    { id: 'compra', label: 'Importe de compra de esos títulos', prefix: '€', value: '12.000', thousands: true },
    { id: 'comisiones', label: 'Comisiones de compra y venta', prefix: '€', value: '60', thousands: true },
    {
      id: 'perdidas',
      label: 'Pérdidas pendientes de compensar',
      prefix: '€',
      value: '0',
      thousands: true,
      help: 'De los cuatro ejercicios anteriores, si las declaraste en su momento.',
    },
    {
      id: 'capital',
      label: 'Intereses y dividendos cobrados en el año',
      prefix: '€',
      value: '500',
      thousands: true,
    },
    { id: 'premio', label: 'Premio de lotería cobrado', prefix: '€', value: '0', thousands: true },
    {
      id: 'bienesFuera',
      label: 'Mayor bloque de bienes en el extranjero',
      prefix: '€',
      value: '0',
      thousands: true,
      help: 'El valor del bloque más grande: cuentas, o valores, o inmuebles. El umbral se mide por bloque.',
    },
  ],
  fineprint: DISCLAIMER_FISCAL,

  chart: {
    type: 'donut',
    title: 'Tu ganancia, repartida',
    caption:
      'Lo que te queda después de impuestos frente a lo que se lleva Hacienda por cada tipo de renta del ahorro.',
  },
  breakdownTitle: 'Cómo se calcula el impuesto',
  breakdownIntro:
    'Los importes son del ejercicio. Las filas de porcentaje y de umbral llevan su unidad.',

  faq: [
    {
      q: '¿Qué es la base del ahorro y en qué se diferencia de la general?',
      a: 'El IRPF tiene dos bases separadas. La general recoge sueldos, alquileres y actividades, y tributa con la escala progresiva que puede llegar al 47%. La del ahorro recoge intereses, dividendos y ganancias por venta de bienes, y tiene su propia escala del 19% al 28%. No se mezclan: una renta del ahorro no te sube el tipo de la nómina.',
    },
    {
      q: '¿Cuáles son los tramos de la escala del ahorro?',
      a: 'Hasta 6.000 € tributa al 19%; de 6.000 a 50.000 al 21%; de 50.000 a 200.000 al 23%; de 200.000 a 300.000 al 27%; y a partir de 300.000 al 28%. Es progresiva por tramos, así que superar un escalón sólo encarece el euro que lo supera, no todo lo anterior.',
    },
    {
      q: '¿Cómo se calcula la ganancia al vender acciones?',
      a: 'Precio de transmisión menos precio de adquisición, sumando al coste las comisiones y gastos de compra y restando del importe de venta los de venta. Si tienes varias compras del mismo valor, se aplica el criterio FIFO: se entienden vendidas primero las más antiguas.',
    },
    {
      q: '¿Qué es la regla de los dos meses?',
      a: 'Si vendes con pérdida y recompras valores homogéneos dentro de los dos meses anteriores o posteriores, esa pérdida no se puede computar en el momento: queda diferida hasta que vendas definitivamente. Para valores no cotizados el plazo es de un año. Existe para evitar las ventas artificiales de fin de año.',
    },
    {
      q: '¿Puedo compensar pérdidas con ganancias?',
      a: 'Sí. Las pérdidas patrimoniales compensan primero ganancias del mismo año; el saldo negativo que quede puede compensar hasta un 25% de los rendimientos del capital mobiliario positivos, y lo que sobre se arrastra a los cuatro ejercicios siguientes. Si no lo usas en cuatro años, se pierde.',
    },
    {
      q: '¿Traspasar un fondo de inversión tributa?',
      a: 'No. El traspaso entre fondos de inversión no genera tributación mientras no reembolses, y por eso es una de las grandes ventajas fiscales del vehículo en España. El diferimiento no se aplica igual a los ETF, aunque coticen: ahí la venta sí tributa.',
    },
    {
      q: '¿Me retienen los dividendos?',
      a: 'Sí, el 19% en el momento del pago. No es el impuesto final: en la declaración se recalcula con la escala completa del ahorro y se descuenta lo retenido. Si tus rentas del ahorro son pequeñas, la retención suele cubrir el impuesto y no hay nada más que pagar.',
    },
    {
      q: '¿Qué pasa con los dividendos de acciones extranjeras?',
      a: 'Sufren retención en el país de origen además de la española. Se puede aplicar la deducción por doble imposición internacional hasta el límite del convenio, y el exceso se recupera pidiendo la devolución a la hacienda del otro país, un trámite lento que muchos brokers no gestionan por ti.',
    },
    {
      q: '¿Cuánto se lleva Hacienda de un premio de lotería?',
      a: 'Los primeros 40.000 € de cada décimo o boleto premiado están exentos y el exceso tributa al 20%, retenido directamente al cobrar. Un premio de 100.000 € deja 88.000 € limpios. El gravamen es independiente del resto de tus rentas: no te sube el tipo de la nómina.',
    },
    {
      q: '¿Y si el décimo era compartido?',
      a: 'La exención de 40.000 € se reparte entre los partícipes en proporción a su parte, no se multiplica por cabeza. Lo importante es identificar a todos los partícipes antes de cobrar, porque si cobra uno solo y luego reparte, Hacienda puede tratar el reparto como una donación con su propio impuesto.',
    },
    {
      q: '¿Tengo que presentar el modelo 720?',
      a: 'Sólo si algún bloque supera los 50.000 €: cuentas en el extranjero, valores y seguros, o inmuebles. Se mide por bloque, no por el total, así que 40.000 € en cuentas y 40.000 € en acciones no obligan a nada. Una vez presentado, sólo hay que repetirlo si el bloque crece más de 20.000 € o si cancelas algo declarado.',
    },
    {
      q: '¿Sigue habiendo sanciones enormes por el modelo 720?',
      a: 'No como antes. La sentencia del TJUE C-788/19 declaró contrario al derecho de la Unión el régimen que imponía multas desproporcionadas y hacía imprescriptibles las ganancias no justificadas. Hoy se aplica el régimen sancionador general, mucho más moderado, pero la obligación de informar sigue vigente.',
    },
  ],

  sources: [
    {
      name: 'Ley 35/2006 del IRPF — base imponible del ahorro y su escala',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Manual práctico de Renta — ganancias y pérdidas patrimoniales',
      url: 'https://sede.agenciatributaria.gob.es/Sede/Ayuda/Manuales/Renta.html',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
    {
      name: 'Gravamen especial sobre los premios de determinadas loterías y apuestas',
      url: 'https://sede.agenciatributaria.gob.es/Sede/irpf/tributacion-premios-loterias-apuestas.html',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
    {
      name: 'Modelo 720 — declaración informativa de bienes y derechos en el extranjero',
      url: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI34.shtml',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
    {
      name: 'Sentencia del TJUE C-788/19 sobre el régimen sancionador del modelo 720',
      url: 'https://curia.europa.eu/juris/liste.jsf?num=C-788/19',
      publisher: 'Tribunal de Justicia de la Unión Europea',
    },
  ],

  replaces: [
    '/calculadora-impuestos-venta-acciones-fondos-irpf-espana',
    '/calculadora-irpf-capital-mobiliario-intereses-dividendos-espana',
    '/calculadora-impuestos-loteria-premio-espana-hacienda',
    '/calculadora-modelo-720-bienes-extranjero-espana',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Escala de la base del ahorro: [límite superior, tipo]. Art. 66 Ley 35/2006. */
export const ESCALA_AHORRO: Array<[number, number]> = [
  [6000, 0.19],
  [50000, 0.21],
  [200000, 0.23],
  [300000, 0.27],
  [Infinity, 0.28],
];

export const AHORRO_PARAMS = {
  /** Retención en origen de intereses y dividendos. */
  retencionCapital: 0.19,
  /** Premios de Loterías del Estado, ONCE, Cruz Roja y ONG asimiladas. */
  loteriaExento: 40000,
  loteriaTipo: 0.2,
  /** Umbral por bloque del modelo 720. */
  umbral720: 50000,
  /** Límite de compensación de pérdidas contra rendimientos del capital mobiliario. */
  limiteCompensacion: 0.25,
};
