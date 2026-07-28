import type { HubData } from './types';

/** Disclaimer YMYL dominio `finance` — copiado textual de src/lib/disclaimers.ts. */
const FINANCE_DISCLAIMER =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'finanzas-personales/tarifa-freelance',
  title: '¿Cuánto tengo que cobrar la hora como freelance? — Calculadora de tarifa',
  description:
    'Calculá tu tarifa por hora en pesos contando costos fijos, impuestos, vacaciones y horas realmente facturables; cuánto te queda de una tarifa en dólares después de la comisión de la plataforma y el tipo de cambio; y cuánto tenés que facturar por mes para cubrir gastos, monotributo y obra social.',
  silo: 'Finanzas personales',
  siloHref: '/finanzas-personales',

  eyebrow: 'Guía y estimación para independientes',
  h1: '¿Cuánto tengo que cobrar la hora para que me cierre?',
  lede:
    'Arrancamos por el caso más común: cobrás en pesos a clientes locales y querés saber tu tarifa por hora. Si cobrás en dólares por plataforma o lo que necesitás es el número de facturación del mes, cambiá la situación abajo.',
  stamps: ['Actualizado 27-07-2026', 'Dólar y escala del monotributo en vivo', '4 calculadoras adentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Cómo cobrás?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'pesos',
        label: 'Cobro en pesos a clientes locales',
        hint: 'El caso más común',
        answer:
          'La tarifa sale de dividir todo lo que necesitás facturar en el mes por las horas que realmente podés facturar, que son bastante menos que las que trabajás.',
        yes: [
          'Tu tarifa por hora contando ingreso deseado, costos fijos e impuestos',
          'Cuántas horas facturables te quedan al mes descontando vacaciones',
          'Qué porcentaje de lo que facturás te queda a vos y qué porcentaje se va en costos',
          'La misma tarifa expresada en dólares al tipo de cambio del día',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'Las horas facturables no son las horas trabajadas: presupuestar, cobrar, responder mensajes y buscar clientes no se le factura a nadie. Si cargás todas tus horas, la tarifa te va a dar más baja de lo que necesitás.',
          'La tarifa que sale es un piso, no un precio de mercado: es lo que necesitás para no perder plata.',
        ],
        plazo: 'revisá la tarifa cada seis meses, o antes si se movieron el monotributo o tus costos.',
      },
      {
        id: 'dolares',
        label: 'Cobro en dólares por una plataforma',
        hint: 'Upwork, Fiverr, Freelancer',
        answer:
          'Entre la comisión de la plataforma, las retenciones y el tipo de cambio al que liquidás, lo que llega a tu bolsillo es bastante menos que la tarifa que publicás.',
        yes: [
          'Cuánto facturás por mes en dólares y cuánto se queda la plataforma',
          'Lo que te llega en pesos al tipo de cambio con el que liquidás una exportación de servicios',
          'La brecha contra el contado con liquidación, para dimensionar el costo de liquidar por el oficial',
          'La tarifa por hora en pesos que te queda finalmente',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'Las comisiones de plataforma cambian con frecuencia y algunas suman cargos por retiro o conversión de moneda. Confirmá la comisión vigente en tu cuenta antes de tomar la cuenta como definitiva.',
          'Facturar al exterior no te exime del monotributo ni de Ingresos Brutos: la exportación de servicios tiene su propio tratamiento y conviene confirmarlo con un contador.',
        ],
        plazo: 'el tipo de cambio se mueve todos los días: la cuenta vale para hoy.',
      },
      {
        id: 'facturacion',
        label: 'Quiero saber cuánto facturar por mes',
        hint: 'Gastos + monotributo + obra social',
        answer:
          'Facturación del mes es lo que querés llevarte, más tus costos fijos, más la cuota de monotributo de la categoría en la que caés y los adherentes de obra social.',
        yes: [
          'Cuánto tenés que facturar por mes, por día hábil y por hora',
          'En qué categoría de monotributo caés con esa facturación anual',
          'Cuánto es la cuota, cuánto de eso es obra social y cuánto suman los adherentes',
          'Cuánto margen te queda hasta el tope de facturación de tu categoría',
        ],
        warn: [
          FINANCE_DISCLAIMER,
          'La categoría se determina por los ingresos brutos de los últimos doce meses, no por lo que facturás un mes suelto. Si venís de meses más flojos, la categoría real puede ser menor.',
          'El costo de cada adherente se estima con el componente de obra social de tu categoría. El valor exacto lo confirma ARCA al momento del alta.',
        ],
        plazo: 'la recategorización del monotributo es semestral: enero y julio.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada situación usa los campos que le sirven. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'ingresoDeseado', label: 'Lo que querés llevarte limpio por mes', prefix: '$', value: '2.000.000', thousands: true },
    { id: 'costosFijos', label: 'Costos fijos del mes (herramientas, oficina, contador)', prefix: '$', value: '300.000', thousands: true },
    {
      id: 'impuestosMes',
      label: 'Impuestos que pagás por mes (monotributo, Ingresos Brutos)',
      prefix: '$',
      value: '250.000',
      thousands: true,
      help: 'Sólo se usa en la primera situación. En la de facturación mensual, la cuota de monotributo se calcula sola según la categoría.',
    },
    { id: 'horasSemanales', label: 'Horas facturables por semana', type: 'number', min: 1, max: 80, value: 30 },
    { id: 'semanasVacaciones', label: 'Semanas de vacaciones al año', type: 'number', min: 0, max: 20, value: 3 },
    { id: 'tarifaUsd', label: 'Tarifa por hora en dólares', prefix: 'USD', type: 'number', min: 0, step: 0.5, value: 25 },
    { id: 'horasMes', label: 'Horas que facturás por mes en la plataforma', type: 'number', min: 0, max: 400, value: 120 },
    {
      id: 'plataforma',
      label: 'Plataforma por la que cobrás',
      type: 'select',
      value: 'upwork',
      options: [
        { value: 'upwork', label: 'Upwork (10%)' },
        { value: 'freelancer', label: 'Freelancer (10%)' },
        { value: 'fiverr', label: 'Fiverr (20%)' },
        { value: 'toptal', label: 'Toptal (sin comisión al freelancer)' },
        { value: 'direct', label: 'Cliente directo (sin plataforma)' },
      ],
    },
    {
      id: 'retencionesPct',
      label: 'Retenciones e impuestos sobre lo que cobrás del exterior',
      type: 'number',
      min: 0,
      max: 99,
      step: 0.5,
      value: 0,
      suffix: '%',
      help: 'Dejalo en 0 si no te retienen nada. Cargá acá la retención de Ingresos Brutos de tu provincia o cualquier percepción que te aplique el banco o el intermediario de pago.',
    },
    {
      id: 'margen',
      label: 'Margen extra que querés sobre tus gastos',
      type: 'number',
      min: 0,
      max: 200,
      step: 1,
      value: 15,
      suffix: '%',
      help: 'Colchón para meses flojos, aumentos y clientes que pagan tarde.',
    },
    { id: 'adherentes', label: 'Adherentes en tu obra social de monotributo', type: 'number', min: 0, max: 10, value: 0 },
  ],
  fineprint: FINANCE_DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Adónde va lo que facturás',
    caption:
      'El gráfico separa lo que te queda a vos de lo que se va en costos, impuestos o comisión de plataforma.',
  },
  breakdownTitle: 'Qué compone tu número',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cómo se calcula la tarifa por hora de un freelance?',
      a: 'Se suma lo que querés llevarte limpio más tus costos fijos y tus impuestos del mes, y se divide por las horas que realmente podés facturar en el mes. Esas horas salen de tus horas facturables por semana multiplicadas por las semanas del año que trabajás —52 menos las de vacaciones— divididas por doce.',
    },
    {
      q: '¿Cuántas horas de las que trabajo son facturables?',
      a: 'Bastante menos de las que trabajás. Presupuestar, buscar clientes, facturar, cobrar, formarte y administrar no se le cobra a nadie. Una referencia habitual para quien trabaja jornada completa es entre 25 y 30 horas facturables por semana; si cargás 45, la tarifa te va a dar artificialmente baja.',
    },
    {
      q: '¿Por qué hay que descontar las vacaciones si soy independiente?',
      a: 'Justamente porque nadie te las paga. Si tomás tres semanas al año, tenés 49 semanas para generar los ingresos de las 52. Esas semanas que no facturás tienen que estar prorrateadas dentro de la tarifa de las que sí facturás.',
    },
    {
      q: '¿Qué comisión cobran Upwork, Fiverr y las demás plataformas?',
      a: 'Upwork y Freelancer se quedan alrededor del 10% de lo facturado, Fiverr alrededor del 20% y Toptal no le cobra comisión al freelance porque la carga en el cliente. Con cliente directo no hay comisión de plataforma, aunque sí puede haber costos de la vía de cobro. Son valores de referencia: cada plataforma cambia sus condiciones y suma cargos por retiro o conversión.',
    },
    {
      q: '¿A qué tipo de cambio conviene mirar lo que cobro en dólares?',
      a: 'La cuenta principal usa el dólar oficial en su punta compradora, que es a lo que un banco te liquida una exportación de servicios cobrada por transferencia. Como referencia mostramos también el contado con liquidación: la diferencia entre los dos es el costo real de liquidar por la vía formal frente a alternativas de mercado.',
    },
    {
      q: '¿Facturando al exterior tengo que estar en el monotributo?',
      a: 'Sí. Prestar servicios a clientes del exterior es actividad alcanzada y requiere estar inscripto y emitir factura tipo E. La exportación de servicios tiene un tratamiento propio en IVA e Ingresos Brutos según la jurisdicción, así que conviene confirmar el encuadre con un contador antes de facturar el primer trabajo.',
    },
    {
      q: '¿Cómo sé en qué categoría de monotributo caigo?',
      a: 'Por los ingresos brutos de los últimos doce meses: la categoría es la primera cuyo tope anual cubre ese total. La situación de facturación mensual del hub hace esa cuenta sola, proyectando tu facturación mensual a doce meses y buscando la categoría que corresponde.',
    },
    {
      q: '¿Cuánto cuesta agregar a mi pareja o a mis hijos a la obra social del monotributo?',
      a: 'Cada adherente paga un aporte adicional equivalente al componente de obra social de tu categoría. La estimación del hub usa ese componente; el importe exacto lo confirma ARCA al momento del alta y puede variar con la recategorización semestral.',
    },
    {
      q: '¿Qué margen conviene sumarle a la tarifa?',
      a: 'Un colchón sobre los gastos para absorber meses flojos, clientes que pagan tarde y aumentos entre revisiones de precio. Sin ese margen, cualquier mes con menos trabajo del previsto te deja abajo del punto de equilibrio.',
    },
    {
      q: '¿Cada cuánto conviene actualizar la tarifa?',
      a: 'Cada seis meses como mínimo, y siempre después de una recategorización del monotributo o de un salto en tus costos fijos. Avisar el ajuste con anticipación a los clientes activos hace que la conversación sea mucho más fácil.',
    },
    {
      q: '¿La tarifa que me da esta cuenta es lo que debería cobrar?',
      a: 'Es tu piso: por debajo de ese número estás perdiendo plata. El precio final depende del valor que entregás, de tu experiencia y del mercado del cliente. Conocer el piso sirve sobre todo para saber cuándo decir que no.',
    },
    {
      q: '¿Qué pasa si trabajo menos horas de las que estimé?',
      a: 'La tarifa sube. Es la cuenta más útil de todas: si tenés meses con la mitad de las horas facturables, la tarifa de esos meses tiene que ser el doble para llegar al mismo ingreso. Por eso conviene calcular con un escenario conservador de horas.',
    },
  ],

  sources: [
    {
      name: 'Monotributo — categorías, topes de facturación y cuotas vigentes',
      url: 'https://www.afip.gob.ar/monotributo/categorias.asp',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Cotizaciones del dólar oficial y financiero',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Tipos_de_cambio.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Exportación de servicios — facturación y encuadre',
      url: 'https://www.argentina.gob.ar/servicio/emitir-facturas-electronicas',
      publisher: 'Gobierno de la República Argentina',
    },
    {
      name: 'Obra social del monotributo y adherentes',
      url: 'https://www.argentina.gob.ar/superintendencia-de-servicios-de-salud',
      publisher: 'Superintendencia de Servicios de Salud',
    },
  ],

  replaces: [
    '/calculadora-freelance-tarifa-hora',
    '/calculadora-cuanto-facturar-cubrir-gastos',
    '/calculadora-upwork-freelancer-comision-neta-argentina',
    '/calculadora-obra-social-monotributista-aporte-extra-familiar',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Comisión que se queda la plataforma sobre lo facturado.
 * Espejo de src/lib/formulas/upwork-freelancer-comision-neta-argentina.ts.
 */
export const COMISIONES: Record<string, { pct: number; nombre: string }> = {
  upwork: { pct: 0.1, nombre: 'Upwork' },
  freelancer: { pct: 0.1, nombre: 'Freelancer' },
  fiverr: { pct: 0.2, nombre: 'Fiverr' },
  toptal: { pct: 0, nombre: 'Toptal' },
  direct: { pct: 0, nombre: 'cliente directo' },
};

/** Convenciones de la fórmula original: 22 días hábiles y 176 horas por mes. */
export const CONVENCIONES = { diasHabilesMes: 22, horasMes: 176 };
