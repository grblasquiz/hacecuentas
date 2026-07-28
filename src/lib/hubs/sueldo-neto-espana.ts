import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me queda neto en España?".
 *
 * Completa la familia de hubs por país que ya existe (sueldo-neto-chile,
 * sueldo-neto-colombia, sueldo-neto-mexico): acá el sistema fiscal entero es
 * local, así que el hub es de España y las ramas son las tres situaciones
 * reales — asalariado en Madrid, asalariado en Cataluña y autónomo.
 *
 * YMYL plata: disclaimer fiscal textual de src/lib/disclaimers.ts en el
 * fineprint y como primer warn de cada rama.
 */

const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'trabajo/sueldo-neto-espana',
  title: '¿Cuánto me queda neto en España? — IRPF Madrid, Cataluña y autónomos',
  description:
    'Calculá tu neto real en España: IRPF estatal más el tramo autonómico de Madrid o Cataluña si sos asalariado, o cuota de autónomos más IRPF si trabajás por cuenta propia.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación fiscal',
  h1: 'De tu bruto en España, ¿cuánto te queda de verdad?',
  lede:
    'El IRPF español se paga en dos mitades: una escala estatal igual para todos y una escala autonómica que cambia según dónde vivas. Madrid tiene la más baja del país y Cataluña una de las más altas. Si sos autónomo, además pesa la cuota mensual.',
  stamps: ['Actualizado 28-07-2026', 'Escalas estatal y autonómicas', '3 calculadoras adentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos por asalariado en Madrid. Si es otra, cambiala: el resultado se mueve bastante.',
    items: [
      {
        id: 'madrid',
        label: 'Asalariado en Madrid',
        hint: 'Escala autonómica más baja',
        answer: 'En Madrid pagás la escala estatal más el tramo autonómico más bajo de España.',
        yes: [
          'Cotización a la Seguridad Social del trabajador: 6,35% del bruto, con tope',
          'Mínimo personal y familiar que reduce la base',
          'Escala estatal: del 9,5% al 24,5%',
          'Escala autonómica de Madrid: del 8,5% al 20,5%',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'No contempla deducciones autonómicas, hijos a cargo, discapacidad, pensiones compensatorias ni planes de pensiones',
          'La retención que te aplica la empresa se calcula con el reglamento del IRPF y puede diferir de la cuota anual final',
        ],
        plazo: 'la campaña de la Renta va de abril a junio del año siguiente.',
      },
      {
        id: 'cataluna',
        label: 'Asalariado en Cataluña',
        hint: 'Escala autonómica alta',
        answer: 'En Cataluña el tramo autonómico llega al 25,5%, con un marginal total cercano al 50%.',
        yes: [
          'Cotización a la Seguridad Social del trabajador: 6,35% del bruto, con tope',
          'Mínimo personal y familiar que reduce la base',
          'Escala estatal: del 9,5% al 24,5%',
          'Escala autonómica de Cataluña: del 10,5% al 25,5%, con más tramos que la estatal',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Cataluña tiene deducciones autonómicas propias (alquiler, nacimiento, viudedad) que no están incluidas',
          'La diferencia con Madrid se nota sobre todo en rentas altas: en los primeros tramos es de pocos cientos de euros',
        ],
        plazo: 'la campaña de la Renta va de abril a junio del año siguiente.',
      },
      {
        id: 'autonomo',
        label: 'Autónomo',
        hint: 'Cuota mensual + IRPF',
        answer: 'Como autónomo restás gastos y cuota, y sobre eso pagás la escala general del IRPF.',
        yes: [
          'Cuota de autónomos mensual, según tramo de facturación o tarifa plana',
          'Gastos deducibles de la actividad',
          'IRPF con la escala general: del 19% al 45%',
          'La cuota de autónomos es gasto deducible: baja la base del IRPF',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Desde el sistema de cotización por ingresos reales la cuota depende del rendimiento neto declarado: acá se estima por tramos de facturación',
          'No incluye IVA: el IVA repercutido no es ingreso tuyo, lo liquidás trimestralmente con el modelo 303',
          'Tampoco incluye el mínimo personal, así que para facturaciones bajas la estimación queda por encima del IRPF real',
        ],
        plazo: 'los pagos fraccionados del modelo 130 vencen el 20 de abril, julio, octubre y enero.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Si sos asalariado, mirá el bruto anual de tu contrato. Si sos autónomo, tu facturación anual sin IVA.',
  fields: [
    { id: 'bruto', label: 'Bruto anual (o facturación anual si sos autónomo)', prefix: '€', value: '35.000', thousands: true },
    {
      id: 'pagas',
      label: 'Número de pagas al año',
      type: 'select',
      value: '14',
      options: [
        { value: '14', label: '14 pagas (12 + 2 extras)' },
        { value: '12', label: '12 pagas (extras prorrateadas)' },
      ],
    },
    {
      id: 'minimo',
      label: 'Mínimo personal y familiar',
      prefix: '€',
      value: '5.550',
      thousands: true,
      help: 'El mínimo del contribuyente es 5.550 € y sube con hijos, ascendientes a cargo o discapacidad.',
    },
    {
      id: 'ss',
      label: 'Cotización anual a la Seguridad Social (0 = automática)',
      prefix: '€',
      value: '0',
      thousands: true,
      help: 'Si lo dejás en 0 aplicamos el 6,35% del bruto con el tope de cotización.',
    },
    {
      id: 'gastos',
      label: 'Gastos deducibles anuales (autónomos)',
      prefix: '€',
      value: '6.000',
      thousands: true,
      help: 'Sólo se usa en la rama de autónomo: alquiler de oficina, suministros, material, asesoría.',
    },
    {
      id: 'tarifaPlana',
      label: '¿Tenés tarifa plana de autónomos?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí, 80 € al mes' },
      ],
    },
  ],
  fineprint: DISCLAIMER_FISCAL,

  chart: {
    type: 'donut',
    title: 'A dónde va tu bruto',
    caption:
      'El bruto se reparte entre lo que te queda en mano, lo que va al IRPF y lo que va a cotizaciones o cuota de autónomos.',
  },
  breakdownTitle: 'Cómo se arma tu neto',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande. Los importes son anuales salvo donde se aclara.',

  faq: [
    {
      q: '¿Por qué el IRPF se divide en escala estatal y autonómica?',
      a: 'Porque el IRPF es un impuesto cedido parcialmente a las comunidades autónomas. La mitad de la recaudación la fija el Estado con una escala común y la otra mitad la fija cada comunidad con su propia escala. Por eso el mismo sueldo bruto deja netos distintos en Madrid y en Barcelona.',
    },
    {
      q: '¿Cuánta diferencia hay entre Madrid y Cataluña?',
      a: 'En los primeros tramos la diferencia es de pocos cientos de euros al año, porque las escalas arrancan parecidas. Se abre en rentas altas: el marginal máximo de Madrid queda en torno al 45% y el de Cataluña roza el 50%, así que cada euro por encima de los 175.000 tributa unos 5 puntos más.',
    },
    {
      q: '¿Qué es el mínimo personal y familiar?',
      a: 'Es la parte de tu renta que no tributa porque se considera destinada a cubrir necesidades básicas. El mínimo del contribuyente es de 5.550 euros y sube con hijos, ascendientes mayores a cargo y situaciones de discapacidad. Cuantos más mínimos apliques, menor es la base sobre la que se calcula la cuota.',
    },
    {
      q: '¿La cotización a la Seguridad Social se descuenta del bruto?',
      a: 'Sí. El trabajador aporta alrededor del 6,35% del bruto (contingencias comunes, desempleo y formación), con un tope según la base máxima de cotización. Esa aportación reduce la base del IRPF además de descontarse directamente de la nómina, así que pesa doble.',
    },
    {
      q: '¿Cuánto paga hoy un autónomo de cuota?',
      a: 'Desde el sistema de cotización por ingresos reales la cuota depende del rendimiento neto que declares, con tramos que van de unos 200 euros a más de 500 al mes. Quien se da de alta por primera vez puede acogerse a la tarifa plana de 80 euros mensuales durante el primer año, prorrogable si los rendimientos son bajos.',
    },
    {
      q: '¿La cuota de autónomos se puede deducir?',
      a: 'Sí, es gasto deducible de la actividad. Se resta de los ingresos junto con el resto de gastos antes de aplicar la escala del IRPF, así que reduce la base imponible y por tanto el impuesto.',
    },
    {
      q: '¿Por qué la escala del autónomo empieza en 19% y la del asalariado en 9,5%?',
      a: 'Porque son la misma escala vista de dos formas. El 19% es el tipo total de la primera franja: 9,5 puntos van al Estado y 9,5 a la comunidad. En la rama de asalariado se muestran por separado para que veas cuánto se lleva cada administración.',
    },
    {
      q: '¿Este cálculo es lo que me van a retener en la nómina?',
      a: 'No exactamente. La retención mensual la calcula la empresa con el reglamento del IRPF, que anticipa la cuota anual estimada y la reparte entre las nóminas del año. Este cálculo estima la cuota anual: si la retención fue mayor, en la Renta te sale a devolver, y si fue menor, a pagar.',
    },
    {
      q: '¿Cuenta el IVA en el cálculo del autónomo?',
      a: 'No, y es correcto que no cuente: el IVA que cobrás a tus clientes no es ingreso tuyo, lo recaudás para Hacienda y lo liquidás cada trimestre con el modelo 303 restando el IVA soportado. Para el IRPF se toma la facturación sin IVA.',
    },
    {
      q: '¿Se puede cambiar de comunidad para pagar menos?',
      a: 'Tributás donde tenés tu residencia habitual, que es donde pasás más días del año. Hacienda comprueba la residencia efectiva, así que un cambio de empadronamiento sin traslado real no sirve y puede acabar en regularización con recargo.',
    },
    {
      q: '¿Qué pasa con las pagas extra?',
      a: 'No cambian lo que pagás en el año: el bruto anual es el mismo repartido en 12 o en 14 pagas. Lo único que cambia es el neto de cada mes. Con 14 pagas cobrás menos cada mes y recibís dos pagas grandes; con 12 está todo prorrateado.',
    },
  ],

  sources: [
    {
      name: 'Ley 35/2006 del IRPF — escala general del impuesto',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Agencia Tributaria — Manual práctico de Renta',
      url: 'https://sede.agenciatributaria.gob.es/Sede/Ayuda/Manuales/Renta.html',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
    {
      name: 'Comunidad de Madrid — escala autonómica del IRPF',
      url: 'https://www.comunidad.madrid/servicios/administracion-electronica-punto-acceso-general/tributos',
      publisher: 'Comunidad de Madrid',
    },
    {
      name: 'Agència Tributària de Catalunya — tram autonòmic de l’IRPF',
      url: 'https://atc.gencat.cat/',
      publisher: 'Generalitat de Catalunya',
    },
    {
      name: 'Seguridad Social — cotización de trabajadores autónomos por ingresos reales',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores',
      publisher: 'Tesorería General de la Seguridad Social',
    },
  ],

  replaces: [
    '/calculadora-irpf-madrid-2026-asalariado',
    '/calculadora-irpf-cataluna-2026-asalariado',
    '/calculadora-impuestos-autonomo-espana',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
};

/** Escala estatal del IRPF: [límite superior de la franja, tipo]. */
export const TRAMOS_ESTATALES: Array<[number, number]> = [
  [12450, 0.095],
  [20200, 0.12],
  [35200, 0.15],
  [60000, 0.185],
  [300000, 0.225],
  [Infinity, 0.245],
];

/** Escala autonómica de Madrid. */
export const TRAMOS_MADRID: Array<[number, number]> = [
  [13362, 0.085],
  [19004, 0.107],
  [35425, 0.128],
  [57320, 0.174],
  [Infinity, 0.205],
];

/** Escala autonómica de Cataluña. */
export const TRAMOS_CATALUNA: Array<[number, number]> = [
  [12450, 0.105],
  [17707, 0.12],
  [21000, 0.14],
  [33007, 0.15],
  [53407, 0.188],
  [90000, 0.215],
  [120000, 0.235],
  [175000, 0.245],
  [Infinity, 0.255],
];

/** Escala general (estatal + autonómica agregadas), la que usa el autónomo. */
export const TRAMOS_GENERALES: Array<[number, number]> = [
  [12450, 0.19],
  [20200, 0.24],
  [35200, 0.3],
  [60000, 0.37],
  [Infinity, 0.45],
];

/** Parámetros de la cotización y de la cuota de autónomos. */
export const ES_PARAMS = {
  ssTrabajadorPct: 0.0635,
  ssTopeAnual: 4495,
  tarifaPlanaMensual: 80,
  /** Cuota mensual estimada por tramo de facturación anual. */
  cuotaPorFacturacion: [
    [12000, 200],
    [30000, 250],
    [60000, 340],
    [Infinity, 450],
  ] as Array<[number, number]>,
};
