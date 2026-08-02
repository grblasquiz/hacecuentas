import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Cuánto IRPF me retienen de la nómina y cuánto me queda?"
 *
 * Absorbe el hub raíz viejo /trabajo/sueldo-neto-espana y 8 calculadoras sueltas.
 *
 * Fuente única de la mecánica: src/lib/formulas/irpf-2026-tramos-espana-nomina.ts,
 * que implementa el algoritmo oficial de retenciones publicado por la AEAT
 * (cotización con base máxima real, MEI, cotización de solidaridad, reducción
 * del art. 20, mínimos personales y límite excluyente).
 *
 * DIFERENCIA DELIBERADA con las fórmulas viejas de IRPF por comunidad: la cuota
 * NO se calcula restando el mínimo personal de la base. El método legal
 * (arts. 63 y 74 Ley 35/2006) aplica la escala a la base liquidable ENTERA y le
 * resta la misma escala aplicada al mínimo personal y familiar, de modo que el
 * alivio del mínimo se valora al tipo más bajo y no al marginal. Restarlo de la
 * base subestima el IRPF de las rentas medias y altas.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio fiscal). */
const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'es/impuestos/irpf-nomina',
  title: 'IRPF de la nómina en España: cuánto te retienen y cuánto te queda neto',
  description:
    'Calcula la retención de IRPF de tu nómina con el algoritmo de la AEAT, la escala autonómica de tu comunidad y tu situación familiar, y comprueba si en la Renta te sale a devolver o a pagar.',
  silo: 'Impuestos',
  siloHref: '/es/impuestos',

  eyebrow: 'Guía y estimación fiscal',
  h1: 'De tu sueldo bruto, ¿cuánto te retienen de IRPF y cuánto te queda?',
  lede:
    'El IRPF español se paga a medias entre el Estado y tu comunidad autónoma: la escala estatal es igual para todos y la autonómica cambia según dónde tengas la residencia habitual. Encima, lo que te descuentan cada mes no es el impuesto final, sino un anticipo que la empresa calcula con el algoritmo de retenciones. De la diferencia entre ambas cosas sale que la declaración te salga a devolver o a pagar.',
  stamps: [
    'Algoritmo de retenciones de la AEAT',
    'Escalas estatal y autonómicas',
    '8 calculadoras dentro',
  ],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Cuál es tu situación familiar?',
    intro:
      'La casilla que marcas en el modelo 145 cambia el límite a partir del cual empiezan a retenerte y los mínimos que te descuentan. Partimos de la más común.',
    items: [
      {
        id: 'general',
        label: 'Trabajo por cuenta ajena, sin hijos',
        hint: 'Situación 3 del modelo 145',
        answer:
          'Con la situación general te retienen desde unos 15.900 € brutos anuales; por debajo, la retención es cero.',
        yes: [
          'Cotización a la Seguridad Social del trabajador, con la base máxima y el MEI',
          'Reducción por rendimientos del trabajo del art. 20 y los 2.000 € de otros gastos',
          'Mínimo del contribuyente de 5.550 €, más los incrementos por edad',
          'Escala estatal más la escala autonómica de tu comunidad',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'No contempla deducciones autonómicas propias, planes de pensiones, pensiones compensatorias, movilidad geográfica ni residencia en Ceuta o Melilla',
          'La retención que aplica la empresa es un anticipo: la cuota definitiva sale en la declaración',
        ],
        plazo: 'la campaña de la Renta va de abril a junio del año siguiente.',
      },
      {
        id: 'hijos',
        label: 'Con hijos a cargo',
        hint: 'Suma mínimos por descendientes',
        answer:
          'Cada hijo a cargo suma mínimo por descendientes y sube el umbral desde el que te retienen.',
        yes: [
          'Todo lo de la situación general',
          'Mínimo por descendientes: 2.400 € el primero, 2.700 € el segundo, 4.000 € el tercero y 4.500 € el cuarto y siguientes',
          'Reducción adicional de 600 € a partir del tercer hijo',
          'Límite excluyente de retención más alto que sin hijos',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Los mínimos se prorratean cuando la custodia es compartida: cada progenitor aplica la mitad',
          'La deducción por maternidad de 1.200 € al año no se aplica aquí: se cobra aparte, mes a mes o en la declaración',
        ],
        plazo: 'comunica cada nacimiento a la empresa con un modelo 145 nuevo, cuanto antes mejor.',
      },
      {
        id: 'conyuge',
        label: 'Cónyuge sin rentas o declaración conjunta',
        hint: 'Situación 2 del modelo 145',
        answer:
          'Si tu cónyuge gana menos de 1.500 € al año, marcas la situación 2 y el umbral de retención sube por encima de los 17.000 €.',
        yes: [
          'Todo lo de la situación general',
          'Límite excluyente de retención más alto por cónyuge sin rentas',
          'La tributación conjunta añade una reducción en la base de 3.400 €',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La tributación conjunta sólo compensa cuando uno de los dos gana muy poco o nada: si los dos cobráis un sueldo parecido, sale más cara',
          'Sólo pueden tributar conjuntamente los matrimonios: una pareja de hecho no puede, aunque tenga hijos comunes',
        ],
        plazo: 'la opción de conjunta o individual se elige cada año al presentar la Renta.',
      },
      {
        id: 'monoparental',
        label: 'Familia monoparental con hijos',
        hint: 'Situación 1 del modelo 145',
        answer:
          'Si eres el único progenitor con hijos a cargo, entras en la situación 1: el umbral de retención es el más alto de los tres.',
        yes: [
          'Todo lo de la situación con hijos',
          'Límite excluyente de la situación 1, el más alto de la tabla',
          'La unidad familiar monoparental puede tributar conjunta con los hijos, con una reducción de 2.150 €',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La situación 1 exige que no convivas con el otro progenitor: si hay convivencia, aunque no haya matrimonio, no aplica',
          'Muchas comunidades tienen deducciones autonómicas propias por familia monoparental que este cálculo no incluye',
        ],
        plazo: 'la campaña de la Renta va de abril a junio del año siguiente.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'El bruto anual es lo que figura en tu contrato antes de descuentos, incluidas las pagas extra. La comunidad es la de tu residencia habitual, no la de la empresa.',
  fields: [
    { id: 'bruto', label: 'Sueldo bruto anual', prefix: '€', value: '30.000', thousands: true },
    {
      id: 'ccaa',
      label: 'Comunidad autónoma de residencia',
      type: 'select',
      value: 'madrid',
      options: [
        { value: 'madrid', label: 'Comunidad de Madrid' },
        { value: 'cataluna', label: 'Cataluña' },
        { value: 'andalucia', label: 'Andalucía' },
        { value: 'valencia', label: 'Comunitat Valenciana' },
        { value: 'galicia', label: 'Galicia' },
        { value: 'paisvasco', label: 'País Vasco (régimen foral)' },
      ],
      help: 'Tributas donde tienes la residencia habitual, que es donde pasas más días del año.',
    },
    {
      id: 'hijos',
      label: 'Hijos a cargo menores de 25 años',
      type: 'number',
      value: '0',
      min: 0,
      max: 10,
      step: 1,
    },
    { id: 'edad', label: 'Tu edad', type: 'number', value: '35', min: 16, max: 99, step: 1 },
    {
      id: 'discapacidad',
      label: 'Grado de discapacidad reconocido',
      type: 'select',
      value: '0',
      options: [
        { value: '0', label: 'Sin discapacidad reconocida' },
        { value: '33', label: 'Del 33% al 64%' },
        { value: '65', label: 'Del 65% o más' },
      ],
    },
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
  ],
  fineprint: DISCLAIMER_FISCAL,

  chart: {
    type: 'donut',
    title: 'A dónde va tu bruto',
    caption:
      'Tu sueldo bruto se reparte en tres: lo que cobras, lo que se lleva Hacienda por IRPF y lo que se lleva la Seguridad Social.',
  },
  breakdownTitle: 'Cómo se llega a tu neto',
  breakdownIntro:
    'Los importes son anuales salvo donde se indica. Las filas de porcentaje llevan su unidad.',

  faq: [
    {
      q: '¿Por qué el IRPF tiene una escala estatal y otra autonómica?',
      a: 'Porque es un impuesto cedido en parte a las comunidades autónomas. La mitad de la tarifa la fija el Estado con una escala común y la otra mitad la fija cada comunidad. Por eso el mismo bruto deja neto distinto en Madrid, en Barcelona o en Sevilla. País Vasco y Navarra van aparte: tienen régimen foral y una escala única propia.',
    },
    {
      q: '¿Cuánta diferencia hay de verdad entre comunidades?',
      a: 'En los primeros tramos son unos pocos cientos de euros al año, porque las escalas arrancan parecidas. La brecha se abre en rentas altas, donde el marginal autonómico va de en torno al 17% al 25,5%: ahí sí puede suponer varios miles de euros anuales por el mismo sueldo.',
    },
    {
      q: '¿Qué diferencia hay entre la retención y el IRPF que pago de verdad?',
      a: 'La retención es un anticipo. La empresa estima tu impuesto anual con el algoritmo de la AEAT y lo reparte entre las nóminas. El impuesto real se liquida en la declaración con todos tus datos: si la empresa retuvo de más, sale a devolver; si retuvo de menos, a pagar.',
    },
    {
      q: '¿Qué es el mínimo personal y familiar y cómo se aplica?',
      a: 'Es la parte de tu renta que se considera destinada a cubrir necesidades básicas. El del contribuyente es de 5.550 € y sube por edad, por hijos y por discapacidad. No se resta de la base: se le aplica la misma escala que a la base y esa cuota se descuenta, de forma que el ahorro se valora siempre al tipo más bajo. Es un detalle técnico que muchas calculadoras hacen mal y que infravalora el impuesto de las rentas medias y altas.',
    },
    {
      q: '¿Qué es el límite excluyente de retención?',
      a: 'Es el bruto anual por debajo del cual la empresa no puede retenerte nada. Depende de tu situación familiar: en la situación general ronda los 15.900 € y sube en la situación de cónyuge sin rentas o en la de familia monoparental con hijos. Justo por encima del límite hay un tope adicional para que la retención no se coma la subida.',
    },
    {
      q: '¿Qué pongo en el modelo 145?',
      a: 'Tu situación familiar (una de las tres casillas), los hijos y ascendientes a cargo con su año de nacimiento, los grados de discapacidad reconocidos, si pagas pensión compensatoria o anualidades por alimentos y si estás pagando un préstamo de vivienda habitual anterior a 2013. Con esos datos la empresa calcula tu tipo. Si cambia algo durante el año, presenta uno nuevo: no tiene efecto retroactivo.',
    },
    {
      q: '¿Me conviene tributar en conjunta con mi pareja?',
      a: 'Sólo si uno de los dos gana muy poco o nada, porque la reducción de 3.400 € por conjunta rara vez compensa sumar las dos rentas en una única escala progresiva. Si los dos tenéis sueldo, casi siempre sale mejor individual. Y ojo: la conjunta biparental está reservada a los matrimonios; una pareja de hecho no puede acogerse aunque tenga hijos en común.',
    },
    {
      q: 'Entonces, ¿fiscalmente da igual casarse que ser pareja de hecho?',
      a: 'No. En el IRPF la pareja de hecho no puede tributar conjuntamente con su pareja, aunque uno de los dos progenitores sí puede formar unidad familiar monoparental con los hijos. Las diferencias grandes están fuera del IRPF: pensión de viudedad, sucesiones y donaciones, y derechos que varían mucho según la comunidad autónoma.',
    },
    {
      q: '¿Cuánto tarda Hacienda en devolverme?',
      a: 'La AEAT tiene seis meses desde el fin del plazo de presentación para devolver. En la práctica, las declaraciones sencillas presentadas en los primeros días suelen cobrarse en unas semanas. Si pasan los seis meses sin devolución, empieza a correr el interés de demora a tu favor. Si tu declaración cae en comprobación, se alarga.',
    },
    {
      q: '¿Por qué me sale a pagar si sólo tengo una nómina?',
      a: 'Lo habitual es que sea por haber tenido dos pagadores en el año, porque cada uno retiene como si fuera el único. También pasa cuando cambian los mínimos durante el año (un hijo que cumple 25, un divorcio) y no se comunica con un modelo 145 nuevo, o cuando hay rentas del ahorro que no llevan retención suficiente.',
    },
    {
      q: '¿Qué es la cotización de solidaridad que aparece en el cálculo?',
      a: 'Es una cotización adicional que grava la parte del sueldo que supera la base máxima de cotización, por tramos y con un porcentaje pequeño a cargo del trabajador. Sólo la ven los sueldos altos; por debajo de la base máxima no aparece.',
    },
    {
      q: '¿Puedo cambiar mi residencia fiscal para pagar menos?',
      a: 'Tributas donde resides de verdad más de 183 días al año o donde tienes tu centro de intereses económicos. Un empadronamiento sin traslado real no sirve: Hacienda comprueba consumos, colegios, movimientos de tarjeta y desplazamientos, y una residencia simulada acaba en regularización con recargo y sanción.',
    },
  ],

  sources: [
    {
      name: 'Ley 35/2006 del IRPF — escalas estatal y del ahorro, mínimos y reducciones',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Algoritmo oficial de retenciones sobre rendimientos del trabajo',
      url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/retenciones-ingresos-cuenta-ayuda-tecnica.html',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
    {
      name: 'Manual práctico de Renta — cuota íntegra estatal y autonómica',
      url: 'https://sede.agenciatributaria.gob.es/Sede/Ayuda/Manuales/Renta.html',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
    {
      name: 'Modelo 145 — comunicación de datos al pagador',
      url: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI29.shtml',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
    {
      name: 'Bases y tipos de cotización a la Seguridad Social',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537',
      publisher: 'Tesorería General de la Seguridad Social',
    },
    {
      name: 'Agència Tributària de Catalunya — tram autonòmic de l’IRPF',
      url: 'https://atc.gencat.cat/',
      publisher: 'Generalitat de Catalunya',
    },
    {
      name: 'Hacienda Foral de Bizkaia — Norma Foral 13/2013 del IRPF',
      url: 'https://www.bizkaia.eus/es/normativa-foral-tributaria',
      publisher: 'Diputación Foral de Bizkaia',
    },
  ],

  replaces: [
    '/calculadora-irpf-2026-tramos-espana-nomina',
    '/calculadora-tipo-marginal-irpf-espana-2026-tramos-rapido',
    '/calculadora-modelo-145-irpf-situacion-familiar-nomina',
    '/calculadora-comunidad-autonoma-irpf-mas-alto-bajo-espana',
    '/calculadora-renta-bruta-neta-espana-2026-irpf-ss',
    '/calculadora-modelo-100-irpf-declaracion-anual-espana',
    '/calculadora-devolucion-renta-2025-cuanto-tarda',
    '/calculadora-pareja-de-hecho-vs-matrimonio-espana-fiscal',
    '/trabajo/sueldo-neto-espana',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/**
 * Parámetros de cotización. Espejo exacto de
 * src/lib/formulas/irpf-2026-tramos-espana-nomina.ts, que a su vez sigue el
 * algoritmo publicado por la AEAT.
 */
export const COTIZACION = {
  /** Base máxima de cotización mensual vigente. */
  baseMaximaMensual: 5101.2,
  /** Contingencias comunes 4,70 + desempleo 1,55 + formación 0,10 + MEI 0,15. */
  tipoTrabajador: 0.065,
  /** Cotización de solidaridad sobre el exceso de la base máxima, tramos [hasta% de la base máxima, tipo]. */
  solidaridad: [
    [0.1, 0.0019],
    [0.5, 0.0021],
    [Infinity, 0.0024],
  ] as Array<[number, number]>,
};

/** Escala estatal del IRPF: [límite superior, tipo]. Art. 63 Ley 35/2006. */
export const ESCALA_ESTATAL: Array<[number, number]> = [
  [12450, 0.095],
  [20200, 0.12],
  [35200, 0.15],
  [60000, 0.185],
  [300000, 0.225],
  [Infinity, 0.245],
];

/** Escala de retención (estatal + autonómica genérica), la que usa el algoritmo de la AEAT. */
export const ESCALA_RETENCION: Array<[number, number]> = [
  [12450, 0.19],
  [20200, 0.24],
  [35200, 0.3],
  [60000, 0.37],
  [300000, 0.45],
  [Infinity, 0.47],
];

/** Escalas autonómicas. `foral: true` sustituye a la estatal en vez de sumarse. */
export const ESCALAS_CCAA: Record<
  string,
  { nombre: string; foral?: boolean; tramos: Array<[number, number]> }
> = {
  madrid: {
    nombre: 'Comunidad de Madrid',
    // Escala deflactada por la Ley 13/2023, vigente sin cambios desde el 1-ene-2023.
    // OJO: los cortes son PROPIOS de Madrid (13.362,22 / 19.004,63 / …), no los
    // estatales. El repo tenía dos versiones en conflicto y ésta es la buena: el
    // marginal autonómico máximo de Madrid es 20,50%, que sumado al 24,50% estatal
    // da el 45% marginal máximo que es el dato conocido de la comunidad.
    tramos: [
      [13362.22, 0.085],
      [19004.63, 0.107],
      [35425.68, 0.128],
      [57320.4, 0.174],
      [Infinity, 0.205],
    ],
  },
  cataluna: {
    nombre: 'Cataluña',
    tramos: [
      [12450, 0.105],
      [17707, 0.12],
      [21000, 0.14],
      [33007, 0.15],
      [53407, 0.188],
      [90000, 0.215],
      [120000, 0.235],
      [175000, 0.245],
      [Infinity, 0.255],
    ],
  },
  andalucia: {
    nombre: 'Andalucía',
    tramos: [
      [12450, 0.095],
      [20200, 0.12],
      [35200, 0.15],
      [60000, 0.185],
      [Infinity, 0.225],
    ],
  },
  valencia: {
    nombre: 'Comunitat Valenciana',
    tramos: [
      [12450, 0.1],
      [17000, 0.12],
      [30000, 0.14],
      [50000, 0.175],
      [65000, 0.195],
      [80000, 0.205],
      [Infinity, 0.21],
    ],
  },
  galicia: {
    nombre: 'Galicia',
    tramos: [
      [12450, 0.09],
      [20200, 0.1165],
      [35200, 0.149],
      [60000, 0.184],
      [80000, 0.21],
      [Infinity, 0.225],
    ],
  },
  paisvasco: {
    nombre: 'País Vasco',
    foral: true,
    tramos: [
      [12450, 0.07],
      [20200, 0.08],
      [35200, 0.1],
      [60000, 0.14],
      [Infinity, 0.2],
    ],
  },
};

/** Mínimos, reducciones y límites excluyentes. Arts. 20 y 57-61 Ley 35/2006. */
export const MINIMOS = {
  contribuyente: 5550,
  mas65: 1150,
  mas75: 1400,
  descendientes: [2400, 2700, 4000, 4500],
  discapacidad: { '33': 3000, '65': 12000 } as Record<string, number>,
  gastosDiscapacidad: { '33': 3500, '65': 7750 } as Record<string, number>,
  otrosGastos: 2000,
  reduccionConjunta: 3400,
  reduccionMonoparental: 2150,
  /** Límite excluyente de retención por situación (1, 2, 3) y número de hijos (0, 1, 2 o más). */
  limiteExento: {
    situacion1: [0, 17644, 18694],
    situacion2: [17197, 18130, 19262],
    situacion3: [15876, 16342, 16867],
  } as Record<string, number[]>,
};
