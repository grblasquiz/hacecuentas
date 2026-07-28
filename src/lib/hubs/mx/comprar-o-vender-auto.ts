import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Me conviene de contado o financiado, y qué pago al
 * comprarlo o venderlo?"
 *
 * Fusiona seis calculadoras del catálogo mexicano: contado vs financiado con
 * costo de oportunidad en CETES, mensualidad y CAT del crédito automotriz,
 * ISAN del auto nuevo, depreciación del usado, ISR por la venta como persona
 * física e importación definitiva desde Estados Unidos.
 *
 * Constantes fiscales desde la fuente única src/lib/data/mexico-2026.ts:
 * tarifa anual del ISR, UMA anual e IVA. La tarifa del ISAN y el umbral de
 * retención del 20 % vienen de la fórmula original y se documentan abajo.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const COMPRA_MX = {
  /** Tarifa anual del ISR: [límite inferior, límite superior, cuota fija, tasa]. */
  tarifaAnual: MEXICO_2026.isrTarifaAnual as unknown as Array<[number, number, number, number]>,
  /** UMA anual: la exención por enajenación de bienes muebles son 3 UMA anuales. */
  umaAnual: MEXICO_2026.uma.anual,
  /** Tasa general de IVA, que se aplica sobre el valor aduanal más IGI y DTA. */
  iva: MEXICO_2026.iva.general,
  /**
   * LISR Art. 126: retención del 20 % sobre el total de la operación cuando la
   * enajenación de un bien mueble supera este monto y el adquirente es persona
   * moral. Constante replicada de la fórmula original.
   */
  umbralRetencion: 227400,
  /**
   * Tarifa del ISAN: [límite superior, cuota fija, tasa marginal, límite inferior].
   * ⚠️ Replicada EXACTAMENTE de la fórmula original `isan-auto-nuevo-mexico-2026`.
   * Los umbrales de exención (100 % y 50 %) se publican cada año en el DOF: los
   * de abajo son los que traía esa fórmula y no pudieron rastrearse a la
   * publicación dentro del repo. Verificar contra el DOF del ejercicio.
   */
  isanTramos: [
    [383940.35, 0, 0.02, 0.01],
    [460728.35, 7678.67, 0.05, 383940.36],
    [537516.64, 11518.25, 0.1, 460728.36],
    [691092.34, 19197.04, 0.15, 537516.65],
    [1e15, 42233.35, 0.17, 691092.35],
  ] as Array<[number, number, number, number]>,
  /** Ajuste a la baja del ISAN para vehículos por encima de este precio. */
  isanAjusteDesde: 1060189.93,
  isanAjusteTasa: 0.07,
  /** Exención total del ISAN hasta este precio sin IVA. */
  isanExentoHasta: 356934.05,
  /** Reducción del 50 % del ISAN hasta este precio sin IVA. */
  isanMitadHasta: 452116.48,
  /** Derecho de trámite aduanero, como porcentaje del valor: default de la fórmula. */
  dtaPct: 0.008,
  /** CETES de referencia para el costo de oportunidad del pago de contado. Editable. */
  cetesDefault: 7.1,
  /** Primas anuales de seguro como porcentaje del valor del auto (fórmula original). */
  seguroBasicoAnual: 0.09,
  seguroAmplioAnual: 0.13,
  /** Cuotas mensuales de referencia de leasing y renting, como % del valor. */
  cuotaLeasing: 0.012,
  cuotaRenting: 0.009,
  /** Tasa marginal de ISR usada para estimar la deducción de intereses. */
  isrMarginalDeduccion: 0.3,
  /** Caída de valor del primer año en el modelo de depreciación. */
  caidaPrimerAnio: 0.2,
  /** Kilometraje esperado por año antes de penalizar el excedente. */
  kmEsperadoPorAnio: 15000,
};

export const hub: HubData = {
  slug: 'mx/auto/comprar-o-vender-auto',
  title: 'Comprar o vender auto en México: contado o crédito, ISAN, ISR y depreciación',
  description:
    'Compara pagar de contado contra financiar con el costo de oportunidad real, calcula la mensualidad y el CAT del crédito automotriz, el ISAN del auto nuevo, lo que vale hoy tu usado y el ISR que te toca al venderlo.',
  silo: 'Auto',
  siloHref: '/mx/auto',

  eyebrow: 'México · Comprar y vender',
  h1: '¿Me conviene de contado o financiado, y qué pago al comprarlo o venderlo?',
  lede:
    'La decisión de un auto no termina en el precio de lista: hay intereses, impuestos al comprar, depreciación mientras lo tienes e ISR cuando lo vendes. Elige la pregunta que estás tratando de contestar.',
  stamps: [
    'Tarifa anual del ISR · fuente única',
    'Exención de 3 UMA en la venta · LISR Art. 93',
    'ISAN, IGI, DTA e IVA de importación',
    '6 calculadoras fusionadas',
  ],

  resultLabel: 'Resultado del cálculo',

  cases: {
    title: '¿Qué estás decidiendo?',
    intro: 'Empezamos por la duda más frecuente: pagarlo de una o financiarlo.',
    items: [
      {
        id: 'contado',
        label: '¿Contado o financiado?',
        hint: 'Compara los intereses del crédito contra lo que rendiría tu dinero invertido.',
        yes: [
          'Mensualidad del crédito con anualidad de cuota fija',
          'Sobreprecio total que pagas por financiar, es decir los intereses acumulados',
          'Costo de oportunidad de pagar de contado: lo que ese dinero rendiría en CETES durante el mismo plazo',
          'Cuál de los dos costos es mayor, que es lo que define la decisión',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El costo de oportunidad solo es real si de verdad inviertes el dinero que no desembolsaste: si se queda en la cuenta de nómina, financiar es simplemente más caro',
          'La tasa que te ofrece la agencia no es el costo total del crédito: pide el CAT, que incluye comisiones y seguros obligatorios',
          'Un crédito automotriz casi siempre exige seguro de cobertura amplia durante toda la vigencia, y ese costo no está en la mensualidad que te cotizan',
        ],
        plazo: 'la tasa promocional de una agencia suele tener vigencia de días: pide la cotización por escrito con el CAT antes de firmar.',
        answer:
          'Conviene de contado cuando los intereses del crédito superan lo que ese dinero rendiría invertido durante el mismo plazo.',
      },
      {
        id: 'credito',
        label: 'Mi mensualidad y el CAT del crédito',
        hint: 'Cuánto pagas al mes, cuánto de eso son intereses y cómo se compara con leasing.',
        yes: [
          'Mensualidad calculada a partir del CAT anual convertido a tasa mensual equivalente',
          'Intereses totales del crédito y pago total incluyendo el enganche',
          'Mensualidad con la prima de seguro incorporada, que es el desembolso real',
          'Comparación contra leasing o renting con su deducción de ISR, si eres persona moral o actividad empresarial',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El CAT es una referencia comparativa estandarizada, no la tasa contractual: convertirlo a mensual da una mensualidad aproximada, la definitiva está en tu tabla de amortización',
          'La deducción de ISR sobre intereses solo aplica si el vehículo está afecto a tu actividad y con los topes de deducción de automóviles que fija la ley',
          'Las cuotas de leasing y renting usadas en la comparación son promedios de mercado editables, no una cotización',
        ],
        plazo: 'la CONDUSEF obliga a informarte el CAT antes de contratar: si no aparece en la carátula, no firmes.',
        answer:
          'La mensualidad sale de convertir el CAT a tasa mensual equivalente y aplicar la fórmula de cuota fija sobre el monto financiado.',
      },
      {
        id: 'isan',
        label: 'ISAN de un auto nuevo',
        hint: 'El impuesto sobre automóviles nuevos que se paga al comprar de agencia.',
        yes: [
          'ISAN estimado según la tarifa por tramos sobre el precio sin IVA',
          'Si el vehículo queda exento al 100 % o con reducción del 50 % por precio',
          'Tasa efectiva del impuesto sobre el precio del auto',
          'Precio final incluyendo el ISAN',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La base del ISAN es el precio de enajenación sin IVA y sin otros impuestos: si usas el precio de lista con IVA el resultado sale inflado',
          'Los umbrales de exención se actualizan cada año y se publican en el Diario Oficial: verifica los del ejercicio en el que compras',
          'Los vehículos eléctricos e híbridos tienen tratamiento propio en la ley y pueden quedar fuera del impuesto',
        ],
        plazo: 'el ISAN lo entera la agencia al momento de la enajenación: aparece desglosado en tu factura.',
        answer:
          'Se aplica la tarifa por tramos al precio sin IVA, con exención total o reducción del 50 % por debajo de los umbrales publicados.',
      },
      {
        id: 'vender',
        label: 'Vender mi usado: cuánto vale y cuánto ISR pago',
        hint: 'Valor estimado tras la depreciación y el impuesto sobre la ganancia.',
        yes: [
          'Valor estimado hoy según antigüedad, tasa de depreciación y kilometraje',
          'Ganancia de la operación: precio de venta menos costo de adquisición y mejoras',
          'Exención de 3 UMA anuales sobre la ganancia y parte gravable restante',
          'ISR estimado sobre la ganancia gravable y retención del 20 % cuando aplica',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La estimación de ISR no actualiza el costo de adquisición por INPC, que la ley permite y que reduce la ganancia gravable: el impuesto real suele ser menor al estimado',
          'El valor del usado lo fija el mercado, no una fórmula: contrasta contra guías de precios y anuncios reales del mismo modelo, año y kilometraje',
          'Si vendes a una persona moral y la operación supera el umbral de retención, te retienen el 20 % del total de la venta como pago provisional, aunque tu ISR definitivo sea mucho menor',
        ],
        plazo: 'la ganancia por enajenación se declara en tu declaración anual, en abril del ejercicio siguiente.',
        answer:
          'Se resta el costo de adquisición al precio de venta, se descuentan 3 UMA anuales exentas y sobre el resto se aplica la tarifa anual del ISR.',
      },
      {
        id: 'importar',
        label: 'Importar un auto de Estados Unidos',
        hint: 'Cuánto cuesta puesto en México, con impuestos y agente aduanal.',
        yes: [
          'Valor del vehículo convertido a pesos al tipo de cambio que definas',
          'Impuesto general de importación, derecho de trámite aduanero e IVA sobre la base acumulada',
          'ISAN estimado con la misma tarifa que un auto nuevo',
          'Costo total puesto en México y el sobrecosto sobre el precio de compra',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tasa del impuesto general de importación depende de la fracción arancelaria y del origen del vehículo: no todos los autos vendidos en Estados Unidos son de origen norteamericano y eso cambia el arancel',
          'Un auto importado definitivamente no siempre puede emplacarse ni verificarse en cualquier entidad: consulta las restricciones de tu estado antes de comprar',
          'El cálculo no incluye placas, adecuaciones, traslado interno ni el costo del pedimento más allá de lo que cargues como agente aduanal',
        ],
        plazo: 'la importación definitiva se documenta con pedimento a través de agente aduanal antes de poder circular legalmente.',
        answer:
          'Al valor en pesos se le suman IGI, DTA, IVA sobre esa base acumulada e ISAN, más honorarios de agente y traslado.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos salvo donde se indica. Cada caso usa los campos que necesita e ignora el resto.',
  fields: [
    {
      id: 'precioAuto',
      label: 'Precio del auto (MXN)',
      prefix: '$',
      value: 450000,
      thousands: true,
      help: 'Precio de compra. En el caso de vender, es lo que pagaste por él cuando lo adquiriste.',
    },
    {
      id: 'enganchePct',
      label: 'Enganche',
      type: 'number',
      suffix: '%',
      value: 20,
      min: 0,
      max: 95,
      step: 1,
      help: 'Porcentaje del precio que pagas de entrada. La mayoría de las agencias pide al menos 10 %.',
    },
    {
      id: 'plazoMeses',
      label: 'Plazo del crédito',
      type: 'number',
      suffix: 'meses',
      value: 48,
      min: 6,
      max: 96,
      step: 6,
      help: 'A mayor plazo, menor mensualidad y más intereses totales.',
    },
    {
      id: 'tasaAnual',
      label: 'Tasa de interés anual del crédito',
      type: 'number',
      suffix: '%',
      value: 14,
      min: 0,
      max: 90,
      step: 0.1,
      help: 'Tasa nominal que te cotizan, sin comisiones. Se usa en la comparación de contado contra financiado.',
    },
    {
      id: 'catAnual',
      label: 'CAT anual del crédito',
      type: 'number',
      suffix: '%',
      value: 19,
      min: 0,
      max: 120,
      step: 0.1,
      help: 'Costo Anual Total: incluye comisiones y seguros. Siempre es mayor que la tasa nominal.',
    },
    {
      id: 'tasaCetes',
      label: 'Rendimiento anual de tu alternativa de inversión',
      type: 'number',
      suffix: '%',
      value: 7.1,
      min: 0,
      max: 40,
      step: 0.1,
      help: 'CETES o lo que efectivamente rinde tu dinero. Define el costo de oportunidad de pagar de contado.',
    },
    {
      id: 'seguro',
      label: 'Seguro que vas a contratar',
      type: 'select',
      value: 'amplio',
      options: [
        { value: 'no', label: 'No incluirlo en la mensualidad' },
        { value: 'basico', label: 'Cobertura básica' },
        { value: 'amplio', label: 'Cobertura amplia' },
      ],
      help: 'Un crédito automotriz normalmente exige cobertura amplia durante toda la vigencia.',
    },
    {
      id: 'comparar',
      label: 'Comparar el crédito contra',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No comparar' },
        { value: 'leasing', label: 'Arrendamiento financiero (leasing)' },
        { value: 'renting', label: 'Arrendamiento puro (renting)' },
      ],
      help: 'La comparación tiene sentido si puedes deducir: en persona física sin actividad empresarial, no.',
    },
    {
      id: 'precioSinIva',
      label: 'Precio del auto nuevo sin IVA (MXN)',
      prefix: '$',
      value: 420000,
      thousands: true,
      help: 'Base del ISAN. Si tu cotización trae IVA incluido, divídela entre 1,16.',
    },
    {
      id: 'valorUsd',
      label: 'Valor del vehículo a importar (USD)',
      prefix: 'US$',
      value: 12000,
      thousands: true,
      help: 'Valor de la factura o del título, que es la base para la aduana.',
    },
    {
      id: 'tipoCambio',
      label: 'Tipo de cambio (MXN por USD)',
      type: 'number',
      value: 18.5,
      min: 1,
      max: 60,
      step: 0.1,
      help: 'Usa el tipo de cambio del día del pedimento publicado en el DOF.',
    },
    {
      id: 'igiPct',
      label: 'Impuesto general de importación',
      type: 'number',
      suffix: '%',
      value: 10,
      min: 0,
      max: 60,
      step: 0.5,
      help: 'Depende de la fracción arancelaria y del origen del vehículo. Confírmalo con tu agente aduanal.',
    },
    {
      id: 'agenteTraslado',
      label: 'Agente aduanal y traslado (MXN)',
      prefix: '$',
      value: 25000,
      thousands: true,
      help: 'Honorarios, pedimento y llevarlo hasta tu ciudad.',
    },
    {
      id: 'antiguedadAnios',
      label: 'Antigüedad del auto',
      type: 'number',
      suffix: 'años',
      value: 5,
      min: 0,
      max: 40,
      step: 1,
      help: 'También se usa como años de posesión para el cálculo del ISR de la venta.',
    },
    {
      id: 'kmRecorridos',
      label: 'Kilometraje del odómetro',
      type: 'number',
      suffix: 'km',
      value: 95000,
      thousands: true,
      help: 'Se penaliza el excedente sobre unos 15.000 km por año.',
    },
    {
      id: 'tasaDepreciacion',
      label: 'Depreciación anual estimada',
      type: 'number',
      suffix: '%',
      value: 12,
      min: 0,
      max: 60,
      step: 1,
      help: 'A partir del segundo año. Las marcas con buena reventa caen menos.',
    },
    {
      id: 'primerAnioMayor',
      label: '¿Aplicar la caída fuerte del primer año?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, restar un 20 % el primer año' },
        { value: 'no', label: 'No, depreciación pareja' },
      ],
      help: 'Un auto pierde buena parte de su valor apenas sale de la agencia.',
    },
    {
      id: 'precioVenta',
      label: 'Precio al que lo vendes (MXN)',
      prefix: '$',
      value: 240000,
      thousands: true,
      help: 'Lo que efectivamente vas a cobrar por el vehículo.',
    },
    {
      id: 'mejoras',
      label: 'Mejoras e inversiones comprobables (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Suman al costo de adquisición y bajan la ganancia gravable, siempre con comprobante fiscal.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué se compone el resultado',
    caption: 'Cada porción muestra qué parte del desembolso o de la ganancia corresponde a cada concepto.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el más alto del cálculo.',

  faq: [
    {
      q: '¿Conviene comprar el auto de contado o a crédito?',
      a: 'Depende de qué es más caro: los intereses que pagarías por financiar, o lo que ese dinero rendiría invertido durante el mismo plazo. Si el crédito te cuesta más de lo que rinde tu inversión, contado conviene. Pero el cálculo solo vale si realmente inviertes el dinero que no desembolsaste; si termina gastado en otra cosa, financiar fue simplemente más caro.',
    },
    {
      q: '¿Qué es el CAT y por qué es más alto que la tasa?',
      a: 'El CAT es el Costo Anual Total: una medida estandarizada que incorpora la tasa de interés más las comisiones, seguros obligatorios y otros cargos del crédito, expresada como porcentaje anual. Siempre es mayor que la tasa nominal, y es la única cifra que te permite comparar ofertas de distintas instituciones en igualdad de condiciones.',
    },
    {
      q: '¿Qué es el ISAN y quién lo paga?',
      a: 'Es el Impuesto Sobre Automóviles Nuevos y lo causa la enajenación de un vehículo nuevo, es decir la primera venta al consumidor. Lo entera la agencia y aparece desglosado en tu factura, aunque económicamente lo pagas tú dentro del precio. Se calcula sobre el precio sin IVA con una tarifa por tramos, y por debajo de ciertos umbrales de precio hay exención total o del 50 %.',
    },
    {
      q: '¿Cuánto pierde de valor un auto cada año?',
      a: 'El primer año es el más brutal: un auto puede perder cerca de una quinta parte de su valor apenas sale de la agencia. A partir de ahí la caída se estabiliza en un rango de un dígito alto a un dígito doble bajo por año, y depende muchísimo de la marca y el modelo. El kilometraje muy por encima del promedio castiga el valor de forma adicional.',
    },
    {
      q: '¿Pago ISR cuando vendo mi auto usado?',
      a: 'Solo si hay ganancia y esa ganancia supera la exención. La ley exenta la enajenación de bienes muebles hasta el equivalente a 3 UMA anuales de ganancia en el ejercicio. Como la mayoría de los autos se vende por debajo de lo que costaron, en la práctica lo más común es que no haya ganancia y por tanto no haya impuesto.',
    },
    {
      q: '¿Por qué me retienen el 20 % si vendo mi auto?',
      a: 'Porque cuando el comprador es persona moral y la operación supera el umbral que fija la ley, está obligado a retener el 20 % del total de la venta y enterarlo al fisco. Es un pago provisional a cuenta de tu ISR anual, no el impuesto definitivo: si tu impuesto real es menor, la diferencia te la devuelven al presentar tu declaración anual.',
    },
    {
      q: '¿Puedo actualizar el costo de compra para pagar menos ISR?',
      a: 'Sí, y conviene hacerlo. La ley permite actualizar el costo de adquisición por la inflación medida con el INPC entre la fecha de compra y la de venta, lo que reduce la ganancia gravable. Esta estimación no lo aplica, así que el impuesto que ves aquí es un techo: el definitivo, bien calculado, suele ser menor.',
    },
    {
      q: '¿Conviene más leasing o crédito automotriz?',
      a: 'Para una persona física sin actividad empresarial, casi siempre el crédito: el leasing solo brilla por su tratamiento fiscal, y sin deducción ese beneficio no existe. Para una empresa o alguien que tributa por actividad empresarial la comparación cambia, porque la cuota de arrendamiento es deducible en mayor proporción que los intereses de un crédito, dentro de los topes que fija la ley para automóviles.',
    },
    {
      q: '¿Qué impuestos se pagan al importar un auto de Estados Unidos?',
      a: 'El impuesto general de importación según la fracción arancelaria y el origen del vehículo, el derecho de trámite aduanero, el IVA calculado sobre el valor más esos dos conceptos, y el ISAN. A eso hay que sumarle los honorarios del agente aduanal, el pedimento y el traslado. El sobrecosto habitual sobre el precio de compra es considerable, así que la ganga aparente muchas veces desaparece.',
    },
    {
      q: '¿Cualquier auto se puede importar a México?',
      a: 'No. Hay restricciones por año modelo, por origen y por normas de emisiones, y los esquemas de regularización cambian con el tiempo. Además, un vehículo importado no siempre puede emplacarse ni verificarse en cualquier entidad. Antes de comprar del otro lado, confirma con un agente aduanal que el vehículo concreto es importable y emplacable donde vives.',
    },
    {
      q: '¿Cuánto enganche conviene dar?',
      a: 'Mientras mayor sea el enganche, menor es el monto financiado y menores los intereses totales. La referencia práctica es dar al menos lo suficiente para que el saldo del crédito no supere el valor del auto en ningún momento, porque la depreciación es más rápida que la amortización al principio. Con enganches muy bajos y plazos largos puedes quedar debiendo más de lo que vale el vehículo.',
    },
    {
      q: '¿El seguro entra en la mensualidad del crédito?',
      a: 'A veces se financia junto con el crédito y a veces se paga aparte, pero en todos los casos es un costo obligatorio mientras el vehículo esté en garantía prendaria. Al comparar ofertas asegúrate de saber si la mensualidad que te cotizan lo incluye o no: es la diferencia más común entre lo que te dijeron y lo que terminas pagando cada mes.',
    },
  ],

  sources: [
    {
      name: 'Ley del Impuesto sobre la Renta — enajenación de bienes, exenciones y tarifa anual (Arts. 93, 120, 124 y 126)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley Federal del Impuesto sobre Automóviles Nuevos',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lfisan.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'CONDUSEF — Costo Anual Total (CAT) y crédito automotriz',
      url: 'https://www.condusef.gob.mx/',
      publisher: 'CONDUSEF',
    },
    {
      name: 'Banco de México — tasas de rendimiento de CETES',
      url: 'https://www.banxico.org.mx/tipcamb/main.do',
      publisher: 'Banxico',
    },
    {
      name: 'SAT — importación de vehículos y trámites aduaneros',
      url: 'https://www.sat.gob.mx/consultas/22701/importacion-de-vehiculos',
      publisher: 'SAT',
    },
    {
      name: 'INEGI — valor de la Unidad de Medida y Actualización (UMA)',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
  ],

  replaces: [
    '/calculadora-auto-contado-vs-financiado-mexico',
    '/calculadora-credito-automotriz-mexico-cat-mensualidad-2026',
    '/calculadora-isan-auto-nuevo-mexico-2026',
    '/calculadora-depreciacion-valor-auto-usado-mexico',
    '/calculadora-isr-venta-auto-usado-persona-fisica-mexico',
    '/calculadora-importacion-auto-estados-unidos-mexico-2026',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
