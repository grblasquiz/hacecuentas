import type { HubData } from '../types';
import { LUZ_2026 } from '../../data/espana-2026';

/**
 * Hub de decisión ES — "¿Cuánto me cuesta mantener la casa al mes?"
 *
 * Absorbe 7 calculadoras: IBI, tasa de basura, cuota de comunidad, consumo del
 * aire acondicionado, comparador de fibra y móvil, cesta de la compra y coste de
 * vida por comunidad autónoma.
 *
 * Constantes: espejo de src/lib/formulas/ibi-cuota-anual-espana-valor-catastral-municipio.ts,
 * tasa-basura-municipios-espana-anual.ts y LUZ_2026 de src/lib/data/espana-2026.ts.
 */

/** Disclaimer — textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANZAS =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'es/vida/gastos-de-la-casa',
  title: 'Gastos de la casa en España: IBI, basura, comunidad, luz y compra',
  description:
    'Suma lo que cuesta mantener tu casa cada mes en España: IBI y tasa de basura de tu municipio, cuota de comunidad, aire acondicionado, fibra y móvil y cesta de la compra.',
  silo: 'Vida',
  siloHref: '/es/vida',

  eyebrow: 'Guía de gastos del hogar',
  h1: '¿Cuánto me cuesta de verdad mantener la casa?',
  lede:
    'La hipoteca o el alquiler es sólo la mitad. La otra mitad son los recibos que llegan sueltos y que casi nadie suma: IBI y basuras una vez al año, comunidad cada mes, luz que se dispara en verano, fibra y móvil, y una compra semanal que sube sin avisar. Puestos juntos, suelen dar un susto.',
  stamps: ['Ordenanzas municipales de IBI y basuras', 'Precio de la luz de referencia', '7 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué te preocupa más?',
    intro: 'Todos los recibos se suman igual: la rama sólo cambia dónde ponemos el foco.',
    items: [
      {
        id: 'impuestos',
        label: 'Los impuestos municipales',
        hint: 'IBI y tasa de basuras',
        answer:
          'El IBI y la tasa de basuras son los dos recibos anuales del ayuntamiento, y varían muchísimo de un municipio a otro.',
        yes: [
          'IBI: valor catastral por el tipo de gravamen de tu ayuntamiento',
          'Tasa de residuos: parte fija más una parte variable',
          'Bonificaciones por familia numerosa, VPO o placas solares, según ordenanza',
          'Posibilidad de fraccionar el pago sin intereses en muchos municipios',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'El tipo de IBI lo fija cada ayuntamiento dentro de una horquilla legal: el mismo piso paga el doble en un municipio que en otro',
          'La tasa de residuos ha subido en toda España al hacerse obligatorio que cubra el coste real del servicio',
          'Una revisión catastral puede disparar el IBI sin que cambie nada en tu vivienda',
        ],
        plazo: 'el IBI se pone al cobro en el período voluntario que fije cada ayuntamiento, normalmente en verano.',
      },
      {
        id: 'suministros',
        label: 'La luz y las telecomunicaciones',
        hint: 'Aire acondicionado, fibra y móvil',
        answer:
          'El aire acondicionado y la tarifa de fibra y móvil son los dos gastos donde más fácil es ahorrar sin renunciar a nada.',
        yes: [
          'Consumo del aire acondicionado según potencia y horas de uso',
          'Precio del kilovatio hora con peajes, cargos e impuestos',
          'Cuota mensual del paquete de fibra y móvil',
          'Ahorro de subir un grado el termostato y de renegociar la tarifa',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'El precio del kilovatio hora cambia por hora y por comercializadora: el valor usado es una referencia con impuestos incluidos',
          'Las ofertas de fibra y móvil suben de precio al terminar la promoción: el precio real es el del mes trece',
        ],
        plazo: 'la permanencia de las ofertas de telecomunicaciones suele ser de 12 meses.',
      },
      {
        id: 'comunidad',
        label: 'La comunidad de vecinos',
        hint: 'Cuota mensual y derramas',
        answer:
          'La cuota de comunidad se reparte por coeficiente de participación, y las derramas llegan aparte.',
        yes: [
          'Gastos ordinarios: limpieza, ascensor, portería, seguro y luz de zonas comunes',
          'Reparto por coeficiente de participación de cada piso',
          'Fondo de reserva obligatorio de la comunidad',
          'Derramas para obras extraordinarias, aparte de la cuota',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Las derramas se aprueban en junta y obligan también a quien votó en contra',
          'El comprador de un piso responde de las cuotas impagadas del año en curso y de los tres anteriores',
        ],
        plazo: 'la junta ordinaria de la comunidad se celebra al menos una vez al año.',
      },
      {
        id: 'compra',
        label: 'La compra y el coste de vida',
        hint: 'Cesta mensual por comunidad',
        answer:
          'La cesta de la compra es el gasto más grande del hogar después de la vivienda, y el que más cambia por comunidad.',
        yes: [
          'Cesta mensual estimada según tamaño del hogar',
          'Coste de vida de tu comunidad autónoma frente a la media',
          'Todo el resto de recibos del hogar sumado',
          'El total mensual real que necesita tu casa para funcionar',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Las medias esconden diferencias enormes entre ciudad grande y pueblo dentro de la misma comunidad',
          'No incluye hipoteca o alquiler, que es la partida mayor y muy personal',
        ],
        plazo: 'los datos de precios se actualizan con el IPC mensual del INE.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'El valor catastral está en tu último recibo del IBI. El resto son gastos que ya conoces.',
  fields: [
    { id: 'valorCatastral', label: 'Valor catastral de tu vivienda', prefix: '€', value: '80.000', thousands: true },
    {
      id: 'municipio',
      label: 'Municipio',
      type: 'select',
      value: 'madrid',
      options: [
        { value: 'madrid', label: 'Madrid' },
        { value: 'barcelona', label: 'Barcelona' },
        { value: 'valencia', label: 'Valencia' },
        { value: 'sevilla', label: 'Sevilla' },
        { value: 'zaragoza', label: 'Zaragoza' },
        { value: 'malaga', label: 'Málaga' },
        { value: 'murcia', label: 'Murcia' },
        { value: 'palma', label: 'Palma' },
        { value: 'bilbao', label: 'Bilbao' },
        { value: 'alicante', label: 'Alicante' },
      ],
    },
    { id: 'metros', label: 'Metros cuadrados de la vivienda', type: 'number', value: '90', min: 20, max: 500, step: 1 },
    { id: 'comunidad', label: 'Cuota mensual de comunidad', prefix: '€', value: '60', thousands: true },
    { id: 'derrama', label: 'Derrama anual prevista', prefix: '€', value: '0', thousands: true },
    {
      id: 'potenciaAire',
      label: 'Potencia del aire acondicionado',
      type: 'number',
      value: 2.5,
      min: 0,
      max: 15,
      step: 0.1,
      suffix: ' kW',
    },
    { id: 'horasAire', label: 'Horas de aire al día en verano', type: 'number', value: '6', min: 0, max: 24, step: 1 },
    { id: 'fibraMovil', label: 'Cuota mensual de fibra y móvil', prefix: '€', value: '45', thousands: true },
    { id: 'personas', label: 'Personas en el hogar', type: 'number', value: '2', min: 1, max: 8, step: 1 },
  ],
  fineprint: DISCLAIMER_FINANZAS,

  chart: {
    type: 'donut',
    title: 'Reparto de los gastos del hogar',
    caption:
      'Todos los recibos llevados a coste mensual, para ver cuál pesa de verdad y dónde merece la pena apretar.',
  },
  breakdownTitle: 'Todos los recibos de la casa',
  breakdownIntro:
    'Los importes anuales y mensuales van marcados en cada fila. Las de consumo llevan su unidad.',

  faq: [
    {
      q: '¿Cómo se calcula el IBI?',
      a: 'Multiplicando el valor catastral de tu vivienda por el tipo de gravamen que fija la ordenanza fiscal de tu ayuntamiento, dentro de una horquilla que marca la ley. Por eso dos pisos idénticos en municipios distintos pagan cantidades muy diferentes.',
    },
    {
      q: '¿Por qué me ha subido el IBI sin hacer nada?',
      a: 'Casi siempre por una revisión catastral, que actualiza el valor de todos los inmuebles del municipio, o porque el ayuntamiento ha subido el tipo en la ordenanza. Las revisiones se aplican de forma escalonada durante varios años, así que la subida llega poco a poco.',
    },
    {
      q: '¿Por qué ha subido tanto la tasa de basuras?',
      a: 'Porque la normativa de residuos obliga a que la tasa cubra el coste real del servicio, y en muchos municipios estaba muy por debajo. Eso ha provocado subidas fuertes y la aparición de la tasa en ayuntamientos que antes no la cobraban por separado.',
    },
    {
      q: '¿Hay bonificaciones en el IBI?',
      a: 'Sí, y son municipales: familia numerosa, viviendas de protección oficial, instalación de placas solares o sistemas de aprovechamiento térmico, y en algunos sitios domiciliación del pago. Hay que solicitarlas, no se aplican solas.',
    },
    {
      q: '¿Cuánto consume el aire acondicionado?',
      a: 'Depende de la potencia del equipo y de las horas de uso. Un equipo de en torno a 2,5 kilovatios funcionando seis horas al día durante los meses de calor supone una parte relevante de la factura de verano. Subir el termostato un grado reduce el consumo de forma apreciable sin apenas notarlo.',
    },
    {
      q: '¿Cómo se reparte la cuota de la comunidad?',
      a: 'Por el coeficiente de participación que figura en la escritura de división horizontal, que depende de la superficie y de la situación del piso, salvo que los estatutos digan otra cosa. Por eso un ático puede pagar más que un primero aunque usen los mismos servicios.',
    },
    {
      q: '¿Puedo negarme a pagar una derrama?',
      a: 'No. Si la junta la aprueba válidamente, obliga a todos los propietarios, incluidos los que votaron en contra y los que no asistieron. Se puede impugnar judicialmente en plazos muy cortos y sólo por motivos tasados.',
    },
    {
      q: '¿Quién paga las cuotas atrasadas si compro un piso?',
      a: 'El nuevo propietario responde con el inmueble de las cuotas pendientes del año en curso y de los tres años anteriores. Por eso hay que pedir siempre el certificado de estar al corriente antes de firmar la escritura.',
    },
    {
      q: '¿Cuánto se puede ahorrar renegociando fibra y móvil?',
      a: 'Bastante, porque el precio de captación es mucho más bajo que el de permanencia: al terminar la promoción la cuota sube y sigue subiendo cada año. Llamar para pedir la baja o comparar con otras compañías suele recuperar la tarifa de entrada.',
    },
    {
      q: '¿Cuánto se lleva la cesta de la compra?',
      a: 'Después de la vivienda, es la partida mayor del hogar, y crece menos que proporcionalmente con el número de personas: un hogar de cuatro no gasta el doble que uno de dos. La diferencia entre comunidades autónomas y entre tipos de establecimiento es de dos dígitos.',
    },
    {
      q: '¿Qué gasto de la casa conviene atacar primero?',
      a: 'Los recurrentes y automáticos: tarifa eléctrica, fibra y móvil y seguros. Son los que se renegocian una vez y ahorran todos los meses sin cambiar de hábitos. Los impuestos municipales, en cambio, sólo bajan si te corresponde una bonificación.',
    },
  ],

  sources: [
    {
      name: 'Ley Reguladora de las Haciendas Locales — IBI y tasas municipales',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Ley 7/2022 de residuos y suelos contaminados — tasa de residuos',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-5809',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Ley 49/1960 sobre propiedad horizontal — cuotas y derramas',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1960-10906',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Precio voluntario para el pequeño consumidor (PVPC)',
      url: 'https://www.esios.ree.es/es/pvpc',
      publisher: 'Red Eléctrica de España',
    },
    {
      name: 'Índice de Precios de Consumo y encuesta de presupuestos familiares',
      url: 'https://www.ine.es/',
      publisher: 'Instituto Nacional de Estadística',
    },
  ],

  replaces: [
    '/calculadora-ibi-cuota-anual-espana-valor-catastral-municipio',
    '/calculadora-tasa-basura-municipios-espana-anual',
    '/calculadora-comunidad-vecinos-gastos-mensuales-espana',
    '/calculadora-consumo-aire-acondicionado-coste-luz-espana',
    '/calculadora-fibra-movil-mejor-precio-comparador-espana-2026',
    '/calculadora-cesta-compra-mensual-familia-espana-inflacion',
    '/calculadora-coste-vida-mensual-soltero-pareja-espana-ccaa',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Tipo de gravamen del IBI urbano por municipio. Espejo de la fórmula vieja. */
export const IBI_TIPOS: Record<string, { nombre: string; tipo: number }> = {
  madrid: { nombre: 'Madrid', tipo: 0.00456 },
  barcelona: { nombre: 'Barcelona', tipo: 0.0066 },
  valencia: { nombre: 'Valencia', tipo: 0.008 },
  sevilla: { nombre: 'Sevilla', tipo: 0.0076 },
  zaragoza: { nombre: 'Zaragoza', tipo: 0.0073 },
  malaga: { nombre: 'Málaga', tipo: 0.00826 },
  murcia: { nombre: 'Murcia', tipo: 0.0065 },
  palma: { nombre: 'Palma', tipo: 0.0063 },
  bilbao: { nombre: 'Bilbao', tipo: 0.0049 },
  alicante: { nombre: 'Alicante', tipo: 0.0078 },
};

/** Tasa de residuos: [cuota fija anual, € por m²]. Espejo de la fórmula vieja. */
export const BASURA_TARIFAS: Record<string, [number, number]> = {
  madrid: [45, 0.55],
  barcelona: [52, 0.68],
  valencia: [38, 0.45],
  sevilla: [34, 0.4],
  zaragoza: [36, 0.42],
  malaga: [35, 0.43],
  murcia: [33, 0.4],
  palma: [40, 0.46],
  bilbao: [48, 0.52],
  alicante: [33, 0.38],
};

/** Precio de la luz de referencia. Espejo de LUZ_2026 en src/lib/data/espana-2026.ts. */
export const LUZ = LUZ_2026;

/** Días de uso intensivo del aire acondicionado al año. */
export const DIAS_VERANO = 100;

/** Cesta de la compra mensual de referencia, por número de personas. */
export const CESTA_MENSUAL: Record<string, number> = {
  1: 230,
  2: 400,
  3: 520,
  4: 620,
  5: 710,
  6: 790,
  7: 860,
  8: 920,
};
