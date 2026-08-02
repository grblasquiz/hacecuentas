import type { HubData } from '../types';

/**
 * Hub de decisión MX — "¿Dónde rinde más mi dinero: Cetes, pagaré o cuenta de
 * ahorro?"
 *
 * Fusiona las seis calculadoras de ahorro e inversión conservadora del catálogo
 * mexicano: rendimiento de Cetes por plazo, pagaré bancario contra Cete, cuentas
 * de ahorro y fintech, comisiones bancarias que se comen el rendimiento, tandas
 * y compra de dólares por canal.
 *
 * NINGUNA tasa está hardcodeada como verdad: la retención de ISR sobre intereses
 * viene de la Ley de Ingresos y se declara como constante fiscal; las tasas de
 * Cetes, de pagaré, de las cuentas fintech, la inflación y el tipo de cambio son
 * campos editables porque cambian todas las semanas.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'investment'). */
const DISCLAIMER_INV =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verifica costos y riesgos con una entidad o asesor habilitado.';

/**
 * Parámetros del hub.
 *
 * - `retencionIsr`: 0,90% anual sobre el CAPITAL, tasa de retención provisional
 *   sobre intereses del sistema financiero (Ley de Ingresos de la Federación
 *   2026, Art. 24; antes 1,45%). Es la constante fiscal del hub.
 * - `coberturaIpab`: la cobertura del seguro de depósitos se expresa en UDIS
 *   (400.000 UDIS por persona y por institución). El valor en pesos que se
 *   muestra abajo es la referencia redondeada que usaba la calculadora original
 *   de pagaré vs Cete; queda como campo informativo, NO como dato verificado.
 * - `comisionesBanco`: tarifario que traía la calculadora comparativa. Los
 *   bancos lo actualizan sin aviso; se conserva tal cual y se marca en pantalla
 *   como referencia a confirmar.
 */
export const INVERSION_MX = {
  retencionIsr: 0.009,
  diasAnioComercial: 360,
  diasAnioNatural: 365,
  coberturaIpabReferencia: 400000,
  cuentas: [
    { id: 'cetes_directo', label: 'Cetes Directo', tasa: 7.0 },
    { id: 'nu', label: 'Nu México', tasa: 7.0 },
    { id: 'mercado_pago', label: 'Mercado Pago', tasa: 7.0 },
    { id: 'klar', label: 'Klar', tasa: 7.0 },
    { id: 'hey_banco', label: 'Hey Banco', tasa: 7.0 },
    { id: 'stori', label: 'Stori', tasa: 6.5 },
    { id: 'banorte_inteligente', label: 'Banorte cuenta inteligente', tasa: 5.0 },
    { id: 'bbva_libreta', label: 'BBVA libretón', tasa: 3.0 },
  ],
  comisionesBanco: {
    bbva: { label: 'BBVA', manejo: 0, retiro: 9.5, consulta: 3.5, saldoExencion: 100000 },
    citibanamex: { label: 'Citibanamex', manejo: 100, retiro: 12, consulta: 5, saldoExencion: 150000 },
    banorte: { label: 'Banorte', manejo: 80, retiro: 15, consulta: 5, saldoExencion: 120000 },
    santander: { label: 'Santander', manejo: 50, retiro: 10, consulta: 3, saldoExencion: 100000 },
    hsbc: { label: 'HSBC', manejo: 120, retiro: 15, consulta: 6, saldoExencion: 150000 },
    nu: { label: 'Nu', manejo: 0, retiro: 0, consulta: 0, saldoExencion: 0 },
    stori: { label: 'Stori', manejo: 0, retiro: 0, consulta: 0, saldoExencion: 0 },
    klar: { label: 'Klar', manejo: 0, retiro: 0, consulta: 0, saldoExencion: 0 },
  },
  spreadCanal: {
    fix: 0,
    app: 0.1,
    banco: 0.5,
    caja: 0.8,
    aeropuerto: 1.5,
  },
  periodosTanda: {
    semanal: { nombre: 'semana', plural: 'semanas', porMes: 4.33 },
    quincenal: { nombre: 'quincena', plural: 'quincenas', porMes: 2 },
    mensual: { nombre: 'mes', plural: 'meses', porMes: 1 },
  },
};

export const hub: HubData = {
  slug: 'mx/finanzas/donde-invierto',
  title: 'Dónde rinde más mi dinero en México: Cetes, pagaré o cuenta de ahorro',
  description:
    'Compara el rendimiento neto de Cetes por plazo, de un pagaré bancario, de las cuentas de ahorro y fintech, y descuenta lo que se llevan las comisiones, la inflación y el tipo de cambio antes de decidir dónde dejar tu dinero.',
  silo: 'Finanzas',
  siloHref: '/mx/finanzas',

  eyebrow: 'México · Ahorro e inversión',
  h1: '¿Dónde rinde más mi dinero: Cetes, pagaré o cuenta de ahorro?',
  lede:
    'La tasa que anuncian es bruta. Lo que te queda depende de la retención de ISR, del plazo, de las comisiones que te cobre el banco y de cuánta inflación se coma el resultado. Elige tu caso y compará el número neto.',
  stamps: [
    'Retención de ISR sobre intereses · LIF Art. 24',
    'Tasas de mercado editables, no hardcodeadas',
    'Rendimiento neto de comisiones e inflación',
    '6 calculadoras fusionadas',
  ],

  resultLabel: 'Resultado del escenario',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro: 'Empezamos por el instrumento de referencia del ahorro mexicano: los Cetes.',
    items: [
      {
        id: 'cetes',
        label: 'Cuánto rinden los Cetes',
        hint: 'Rendimiento neto por plazo, ya descontada la retención de ISR.',
        yes: [
          'Rendimiento bruto al plazo que elijas',
          'Retención de ISR sobre intereses',
          'Rendimiento neto y monto que recibes al vencimiento',
          'Tasa neta anualizada equivalente',
        ],
        warn: [
          DISCLAIMER_INV,
          'La retención de ISR sobre intereses es provisional: se calcula sobre el capital, no sobre la ganancia, y se acredita en tu declaración anual',
          'Las tasas de Cetes se subastan cada semana: la tasa que veas hoy no es la que vas a obtener en la subasta siguiente',
          'Si vendes antes del vencimiento, el precio depende del mercado y puede darte menos de lo que esperabas: el rendimiento asegurado es el que se mantiene hasta el final del plazo',
        ],
        plazo: 'las subastas de Cetes se realizan semanalmente y el plazo corre desde la fecha de liquidación.',
        answer:
          'El rendimiento se calcula sobre el plazo en días y se le descuenta la retención de ISR: lo que importa es la tasa neta anualizada.',
      },
      {
        id: 'pagare',
        label: 'Pagaré bancario contra Cete',
        hint: 'Cuál de los dos te deja más dinero al mismo plazo.',
        yes: [
          'Interés bruto y neto de cada instrumento al mismo plazo',
          'Monto final de cada uno y la diferencia entre ambos',
          'Rendimiento neto anualizado de cada opción',
          'Aviso cuando el monto supera la referencia de cobertura del seguro de depósitos',
        ],
        warn: [
          DISCLAIMER_INV,
          'El pagaré bancario está cubierto por el seguro de depósitos hasta un límite por persona y por institución; el Cete es riesgo soberano y no tiene ese tope',
          'El pagaré no se puede retirar antes del vencimiento; el Cete se puede vender en el mercado secundario, aunque con costo y a precio de mercado',
          'La tasa preferente que ofrecen los bancos suele estar atada a un monto mínimo o a la contratación de otros productos: lee la letra chica antes de comparar',
        ],
        plazo: 'el pagaré se renueva automáticamente al vencimiento salvo instrucción en contrario: revisa la tasa de renovación.',
        answer:
          'Al mismo plazo y con la misma retención, gana simplemente el que tenga la tasa más alta: la diferencia relevante es el riesgo y la liquidez.',
      },
      {
        id: 'cuenta',
        label: 'Cuentas de ahorro y fintech',
        hint: 'Rendimiento neto con depósitos mensuales y contra la inflación.',
        yes: [
          'Interés bruto sobre tu saldo inicial y sobre los depósitos que vayas sumando',
          'Retención de ISR y rendimiento neto',
          'Saldo final estimado al plazo',
          'Si el resultado le gana o le pierde a la inflación que indiques',
        ],
        warn: [
          DISCLAIMER_INV,
          'Muchas cuentas anuncian una tasa promocional que aplica solo a los primeros meses o hasta cierto saldo: verifica el tope antes de mover el dinero',
          'Una tasa nominal por debajo de la inflación significa que estás perdiendo poder de compra aunque el saldo suba',
          'Las tasas de las cuentas y de las fintech cambian de un mes al otro: las de esta pantalla son referencias editables, no una oferta vigente',
        ],
        plazo: 'los rendimientos de cuenta se acreditan típicamente a diario o al cierre de cada mes, según la institución.',
        answer:
          'Lo que cuenta no es la tasa anunciada sino el rendimiento neto de ISR comparado contra la inflación del periodo.',
      },
      {
        id: 'comisiones',
        label: 'Qué se lleva mi banco en comisiones',
        hint: 'Cuánto te cuesta la cuenta al año y cuánto rendimiento se come.',
        yes: [
          'Comisión por manejo de cuenta y si te exime tu saldo promedio',
          'Costo de retiros en cajeros de otros bancos y de consultas de saldo',
          'Total mensual y anual de comisiones',
          'Qué porcentaje de tu rendimiento se lleva ese costo',
        ],
        warn: [
          DISCLAIMER_INV,
          'Las comisiones bancarias se actualizan sin aviso: las de esta pantalla son referencias de catálogo, confirmá el tarifario vigente de tu institución',
          'Una comisión de manejo de cuenta puede anular por completo el rendimiento de un saldo chico: sobre saldos bajos, el costo pesa más que la tasa',
          'La exención por saldo promedio se calcula sobre el promedio del periodo, no sobre el saldo del día en que la consultas',
        ],
        plazo: 'la comisión de manejo se carga mensualmente y la exención se evalúa con el saldo promedio del periodo.',
        answer:
          'El rendimiento que te queda es la tasa menos ISR menos comisiones: en cuentas de saldo bajo las comisiones suelen ser el factor dominante.',
      },
      {
        id: 'tanda',
        label: 'Entrar a una tanda',
        hint: 'Cuánto te toca, cuándo cobras y qué dejas de ganar.',
        yes: [
          'Bolsa que cobras en tu turno y cuándo la cobras',
          'Cuánto aportas antes de cobrar y en todo el ciclo',
          'Si tu turno te funciona como crédito sin intereses o como ahorro forzoso',
          'Cuánto rendimiento dejas de ganar frente a un instrumento con tasa',
        ],
        warn: [
          DISCLAIMER_INV,
          'La tanda es un acuerdo informal sin respaldo legal ni garantía: si alguien deja de aportar, no hay a quién reclamarle',
          'Tu dinero en una tanda no genera ningún rendimiento y la inflación lo erosiona: en los turnos tardíos es ahorro forzoso a tasa cero',
          'Entrá solo en tandas de gente de confianza absoluta y nunca con dinero que no puedas perder',
        ],
        plazo: 'el ciclo dura tantos periodos como participantes tenga la tanda.',
        answer:
          'Cobras la bolsa completa en tu turno: temprano funciona como préstamo sin intereses, tarde como ahorro sin rendimiento.',
      },
      {
        id: 'dolares',
        label: 'Ahorrar en dólares',
        hint: 'Qué te cuesta el canal por el que compras.',
        yes: [
          'Tipo de cambio efectivo según el canal que uses',
          'Dólares que recibes por tu monto en pesos',
          'Costo del diferencial contra el tipo de cambio de referencia',
          'Qué porcentaje de tu dinero se va en ese diferencial',
        ],
        warn: [
          DISCLAIMER_INV,
          'El tipo de cambio es volátil: el dólar puede bajar y hacerte perder en pesos, así que no es un instrumento de ahorro conservador',
          'El diferencial del canal es un costo inmediato: en ventanilla de aeropuerto te puede costar varios puntos porcentuales del monto en un solo movimiento',
          'Los dólares en efectivo no generan rendimiento y tienen límites de depósito en efectivo en la banca mexicana',
        ],
        plazo: 'el tipo de cambio de referencia se publica cada día hábil y rige para el día hábil siguiente.',
        answer:
          'Lo que recibes depende del canal: la diferencia entre el tipo de cambio de referencia y el que te aplican es tu costo real.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto. Todas las tasas son editables: poné la que veas hoy.',
  fields: [
    {
      id: 'monto',
      label: 'Monto que vas a invertir o saldo promedio (MXN)',
      prefix: '$',
      value: 50000,
      thousands: true,
      help: 'También se usa como saldo promedio para la exención de comisiones y como monto a convertir.',
    },
    {
      id: 'plazoDias',
      label: 'Plazo',
      type: 'select',
      value: '91',
      options: [
        { value: '28', label: '28 días' },
        { value: '91', label: '91 días' },
        { value: '182', label: '182 días' },
        { value: '364', label: '364 días' },
      ],
      help: 'Los plazos estándar de subasta de Cetes. Sirven también para la cuenta de ahorro.',
    },
    {
      id: 'tasaCete',
      label: 'Tasa anual del Cete (%)',
      type: 'number',
      value: 7.5,
      min: 0,
      max: 60,
      step: 0.01,
      suffix: '%',
      help: 'La que publique la subasta de la semana para tu plazo.',
    },
    {
      id: 'tasaPagare',
      label: 'Tasa anual del pagaré bancario (%)',
      type: 'number',
      value: 6,
      min: 0,
      max: 60,
      step: 0.01,
      suffix: '%',
      help: 'La que te ofrezca tu banco al mismo plazo. Si tienes tasa preferente, ponela acá.',
    },
    {
      id: 'tipoCuenta',
      label: 'Cuenta de ahorro o fintech',
      type: 'select',
      value: 'cetes_directo',
      options: [
        { value: 'cetes_directo', label: 'Cetes Directo' },
        { value: 'nu', label: 'Nu México' },
        { value: 'mercado_pago', label: 'Mercado Pago' },
        { value: 'klar', label: 'Klar' },
        { value: 'hey_banco', label: 'Hey Banco' },
        { value: 'stori', label: 'Stori' },
        { value: 'banorte_inteligente', label: 'Banorte cuenta inteligente' },
        { value: 'bbva_libreta', label: 'BBVA libretón' },
      ],
      help: 'Las tasas de referencia se muestran en el desglose. Confirmá la vigente en la app.',
    },
    {
      id: 'depositosMensuales',
      label: 'Depósitos mensuales (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Lo que sumas cada mes a la cuenta durante el plazo.',
    },
    {
      id: 'inflacionAnual',
      label: 'Inflación anual esperada (%)',
      type: 'number',
      value: 3.8,
      min: 0,
      max: 100,
      step: 0.1,
      suffix: '%',
      help: 'Para saber si el rendimiento te deja poder de compra o te lo quita.',
    },
    {
      id: 'banco',
      label: 'Tu banco',
      type: 'select',
      value: 'bbva',
      options: [
        { value: 'bbva', label: 'BBVA' },
        { value: 'citibanamex', label: 'Citibanamex' },
        { value: 'banorte', label: 'Banorte' },
        { value: 'santander', label: 'Santander' },
        { value: 'hsbc', label: 'HSBC' },
        { value: 'nu', label: 'Nu' },
        { value: 'stori', label: 'Stori' },
        { value: 'klar', label: 'Klar' },
      ],
      help: 'Tarifario de referencia. Confirmá el vigente en el sitio de tu banco.',
    },
    {
      id: 'retirosAtm',
      label: 'Retiros al mes en cajeros de otro banco',
      type: 'number',
      value: 2,
      min: 0,
      max: 60,
      step: 1,
      help: 'En el cajero de tu propio banco normalmente no se cobra.',
    },
    {
      id: 'consultasSaldo',
      label: 'Consultas de saldo al mes en cajero ajeno',
      type: 'number',
      value: 4,
      min: 0,
      max: 100,
      step: 1,
      help: 'Consultar en la app es gratis; hacerlo en cajero ajeno suele tener costo.',
    },
    {
      id: 'participantes',
      label: 'Participantes de la tanda',
      type: 'number',
      value: 10,
      min: 2,
      max: 60,
      step: 1,
      help: 'Cuántas personas entran. Define la bolsa y la duración del ciclo.',
    },
    {
      id: 'aporte',
      label: 'Aporte por periodo de la tanda (MXN)',
      prefix: '$',
      value: 1000,
      thousands: true,
      help: 'El "número" de la tanda: lo que pones cada semana, quincena o mes.',
    },
    {
      id: 'turno',
      label: 'Tu turno',
      type: 'number',
      value: 5,
      min: 1,
      max: 60,
      step: 1,
      help: 'En qué lugar cobras. El turno 1 es el primero.',
    },
    {
      id: 'frecuencia',
      label: 'Frecuencia de la tanda',
      type: 'select',
      value: 'semanal',
      options: [
        { value: 'semanal', label: 'Semanal' },
        { value: 'quincenal', label: 'Quincenal' },
        { value: 'mensual', label: 'Mensual' },
      ],
      help: 'Define cuánto dura el ciclo completo en meses.',
    },
    {
      id: 'tipoCambio',
      label: 'Tipo de cambio de referencia (MXN por USD)',
      type: 'number',
      value: 18.5,
      min: 1,
      max: 100,
      step: 0.01,
      help: 'El tipo de cambio publicado como referencia para el día.',
    },
    {
      id: 'canal',
      label: 'Dónde compras los dólares',
      type: 'select',
      value: 'banco',
      options: [
        { value: 'fix', label: 'Al tipo de cambio de referencia, sin diferencial' },
        { value: 'app', label: 'App o fintech' },
        { value: 'banco', label: 'Ventanilla del banco' },
        { value: 'caja', label: 'Casa de cambio' },
        { value: 'aeropuerto', label: 'Casa de cambio de aeropuerto' },
      ],
      help: 'El diferencial de cada canal es una referencia típica, no una cotización.',
    },
  ],
  fineprint: DISCLAIMER_INV,

  chart: {
    type: 'bars',
    title: 'Cómo queda tu dinero',
    caption:
      'Compara lo que pones contra lo que efectivamente ganas y lo que se va en impuestos, comisiones o diferenciales.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto ISR me retienen por los intereses que gano?',
      a: 'La retención se aplica sobre el capital invertido, no sobre la ganancia, con la tasa anual que fija cada año la Ley de Ingresos de la Federación y prorrateada por los días que dure la inversión. Es una retención provisional: se acredita en tu declaración anual, así que si tu tasa efectiva es menor puedes recuperar parte, y si es mayor tendrás que completar la diferencia.',
    },
    {
      q: '¿Qué son los Cetes y por qué se usan como referencia?',
      a: 'Son títulos de deuda del gobierno federal que se venden a descuento y se liquidan a valor nominal al vencimiento. Se subastan cada semana en plazos estándar y, al ser deuda soberana en moneda local, se toman como el activo de menor riesgo del mercado mexicano. Por eso la tasa de Cetes funciona como piso de comparación para cualquier otra inversión.',
    },
    {
      q: '¿Cetes o pagaré bancario?',
      a: 'A igual plazo y con la misma retención, gana el que tenga la tasa más alta, así de simple. La diferencia relevante está en el riesgo y la liquidez: el pagaré está cubierto por el seguro de depósitos hasta un límite por persona e institución pero no se puede retirar antes del vencimiento; el Cete no tiene ese tope de cobertura y sí se puede vender antes, aunque a precio de mercado.',
    },
    {
      q: '¿Las cuentas fintech son seguras?',
      a: 'Depende de la figura legal de cada una. Las que operan como institución de banca múltiple tienen cobertura del seguro de depósitos como cualquier banco; las que operan bajo la ley de tecnología financiera tienen otro régimen y otros resguardos. Antes de mover un monto relevante conviene verificar bajo qué figura está autorizada la entidad y qué protección aplica realmente a tu saldo.',
    },
    {
      q: '¿Le estoy ganando a la inflación?',
      a: 'Solo si tu rendimiento neto de impuestos supera la inflación del mismo periodo. Una cuenta que paga menos que la inflación te deja un saldo mayor en pesos pero con menos poder de compra: estás perdiendo despacio. La comparación honesta siempre es neto contra inflación, nunca tasa bruta anunciada contra nada.',
    },
    {
      q: '¿Las comisiones bancarias se comen mi rendimiento?',
      a: 'Sobre saldos chicos, casi siempre. Una comisión mensual de manejo de cuenta puede representar más que todo el interés que genera un saldo modesto en un año. Por eso la primera decisión de ahorro no es qué tasa buscar sino dejar de pagar comisiones: revisa si tu saldo promedio te exime o si te conviene una cuenta sin comisión.',
    },
    {
      q: '¿Conviene entrar a una tanda?',
      a: 'Como instrumento de ahorro, no: tu dinero no genera rendimiento y la inflación lo erosiona. Tiene sentido en dos casos: cuando el turno temprano te funciona como un crédito sin intereses que no conseguirías de otra forma, y cuando el compromiso social es lo único que te obliga a ahorrar. El riesgo es real: no hay respaldo legal si alguien deja de aportar.',
    },
    {
      q: '¿Ahorrar en dólares protege mi dinero?',
      a: 'Protege contra una depreciación del peso, pero te expone a la variación del tipo de cambio en el otro sentido, y además pagas el diferencial del canal cada vez que conviertes. Para gastos futuros en dólares tiene sentido; como refugio general de ahorro es una apuesta cambiaria, no un instrumento conservador.',
    },
    {
      q: '¿Cuál es el mejor plazo para invertir en Cetes?',
      a: 'Depende de cuándo necesites el dinero y de la forma que tenga la curva de tasas. Cuando las tasas cortas están altas, los plazos cortos permiten renovar aprovechando cada subasta; cuando se espera que bajen, asegurar un plazo largo fija la tasa alta por más tiempo. Lo que nunca conviene es comprometer a un año dinero que vas a necesitar en tres meses.',
    },
    {
      q: '¿Tengo que declarar mis intereses en la declaración anual?',
      a: 'Si tus intereses reales superan el umbral que fija la ley, o si presentas declaración por otros motivos, sí: se declaran acumulando el interés real y acreditando la retención que ya te hicieron. Las instituciones emiten una constancia anual con el monto de intereses y de retención, que es el documento con el que se llena ese apartado.',
    },
    {
      q: '¿Qué pasa si retiro mi inversión antes del vencimiento?',
      a: 'En un pagaré bancario a plazo fijo normalmente no se puede, y si se permite hay penalización sobre los intereses. En Cetes sí se puede vender antes, pero al precio de mercado del momento: si las tasas subieron desde tu compra, ese precio será menor y podrías recibir menos de lo esperado. El rendimiento pactado solo está garantizado si mantienes hasta el vencimiento.',
    },
    {
      q: '¿Cuánto me cuesta comprar dólares en el aeropuerto?',
      a: 'Es el canal más caro con diferencia: el diferencial contra el tipo de cambio de referencia suele ser de varios puntos porcentuales del monto, cobrado de una sola vez en el momento de la operación. Comprar con anticipación por app o en tu banco casi siempre deja una diferencia de dinero notoria en montos de viaje típicos.',
    },
  ],

  sources: [
    {
      name: 'Cetes Directo — plazos, subastas y rendimientos vigentes',
      url: 'https://www.cetesdirecto.com/',
      publisher: 'Nacional Financiera / SHCP',
    },
    {
      name: 'Banco de México — resultados de subasta de valores gubernamentales',
      url: 'https://www.banxico.org.mx/mercados/valores-gubernamentales.html',
      publisher: 'Banco de México',
    },
    {
      name: 'Ley de Ingresos de la Federación — tasa de retención sobre intereses (Art. 24)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lif_2026.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'IPAB — cobertura del seguro de depósitos bancarios',
      url: 'https://www.gob.mx/ipab',
      publisher: 'IPAB',
    },
    {
      name: 'Condusef — comparativo de comisiones de cuentas bancarias',
      url: 'https://www.condusef.gob.mx/',
      publisher: 'Condusef',
    },
    {
      name: 'Banco de México — tipo de cambio para solventar obligaciones (FIX)',
      url: 'https://www.banxico.org.mx/tipcamb/tipCamMIAction.do',
      publisher: 'Banco de México',
    },
    {
      name: 'INEGI — Índice Nacional de Precios al Consumidor',
      url: 'https://www.inegi.org.mx/temas/inpc/',
      publisher: 'INEGI',
    },
  ],

  replaces: [
    '/calculadora-cetes-mexico-rendimiento-28-91-182-364-dias',
    '/calculadora-pagare-bancario-vs-cete-rendimiento-mexico',
    '/calculadora-cuenta-de-ahorro-mexico-rendimiento-cetes-directo-nu-mercado-pago',
    '/calculadora-comparativa-banco-comisiones-mexico-2026',
    '/calculadora-tanda-ahorro-mexico-turnos-montos',
    '/calculadora-peso-dolar-tipo-cambio-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
