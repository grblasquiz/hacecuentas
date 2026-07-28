import type { HubData } from './types';

/**
 * Hub de decisión — "Vendo bien pero no tengo plata: ¿por qué?"
 *
 * Arquetipo RAMIFICADO: cuatro ramas que comparten el mismo balance de corto
 * plazo. La idea que las une es el ciclo de conversión de efectivo:
 *
 *     CCE = DSO (días que tardás en cobrar)
 *         + DIO (días que el stock queda parado)
 *         − DPP (días que tardás en pagarle a proveedores)
 *
 * Si el CCE da 60 días, cada peso de operación tarda 60 días en volver a caja:
 * esos 60 días los financiás vos. Por eso una empresa puede facturar récord y
 * no tener con qué pagar sueldos.
 *
 * NOTAS DE CONTRATO:
 *  - El hub MEZCLA pesos, días, veces y porcentajes. El default del runtime es
 *    'ars' y `Object.assign` copia `undefined`, así que TODAS las filas —también
 *    las de plata— declaran su `format` de forma explícita. Una fila de días sin
 *    formato propio se imprimiría con "$".
 *  - Los umbrales salen de los módulos reales del repo: `dso.ts`,
 *    `dias-promedio-pago-proveedores-dpp.ts`, `rotacion-inventario.ts`,
 *    `ratio-liquidez-corriente-seco.ts`, `costo-almacenamiento-inventario.ts`,
 *    `capital-trabajo.ts` y `flujo-caja-libre-fcf.ts`. No hay benchmarks
 *    inventados: los que no están en una fórmula se aclaran como convención.
 */
export const hub: HubData = {
  slug: 'negocios/capital-de-trabajo',
  title: 'Vendo bien pero no tengo plata: el ciclo de conversión de efectivo',
  description:
    'Calculá cuántos días tardás en cobrar, cuántos días tenés el stock parado y cuántos días te financian los proveedores. El ciclo de conversión de efectivo te dice cuánta caja propia necesita tu operación, aunque las ventas anden bien.',
  silo: 'Negocios',
  siloHref: '/negocios',

  eyebrow: 'Finanzas operativas',
  h1: 'Vendo bien pero no tengo plata: ¿por qué?',
  lede:
    'La respuesta casi siempre está en el mismo lugar: entre que comprás la mercadería y que el cliente te paga pasan meses, y esos meses los financiás vos. Cargá cuatro números de tu balance y vas a ver el ciclo completo —cobranza, stock y proveedores— y cuánta caja propia te está exigiendo la operación.',
  stamps: ['Actualizado 27-07-2026', 'DSO + días de stock − DPP', '7 calculadoras adentro'],

  resultLabel: 'Ciclo de conversión de efectivo',

  cases: {
    title: '¿Qué querés averiguar?',
    intro:
      'Las cuatro ramas leen el mismo balance de corto plazo desde ángulos distintos. Si buscás otra cosa, cambiala.',
    items: [
      {
        id: 'ciclo',
        label: 'Cuántos días tarda mi plata en volver',
        hint: 'El caso más común',
        answer:
          'El ciclo de conversión de efectivo es los días que tardás en cobrar más los días que el stock queda parado, menos los días que te financia el proveedor. Eso es lo que tenés que bancar con capital propio.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'DSO: cuentas por cobrar dividido las ventas diarias (ventas anuales sobre 365)',
          'DIO: 365 dividido la rotación de inventario, es decir los días que tarda el stock en venderse',
          'DPP: cuentas por pagar sobre el costo de ventas anual, por 365',
          'Ciclo de conversión de efectivo = DSO + DIO − DPP',
          'Necesidad de caja operativa: el ciclo en días multiplicado por lo que te cuesta un día de operación',
        ],
        warn: [
          'Un ciclo positivo largo es la causa número uno de la empresa que factura bien y no tiene caja: el crecimiento consume más plata de la que genera',
          'Estirar el pago a proveedores acorta el ciclo en el papel, pero te come descuentos por pronto pago y te deteriora las condiciones comerciales',
          'Los promedios esconden estacionalidad: si concentrás ventas en dos meses, el ciclo del promedio anual no describe ninguno de tus meses reales',
          'Si vendés todo al contado y comprás a 60 días el ciclo da negativo: cobrás antes de pagar y el proveedor te financia la operación entera',
        ],
        plazo:
          'medí el ciclo con los saldos promedio del período, no con la foto de un solo día de cierre.',
      },
      {
        id: 'liquidez',
        label: 'Si llego a pagar lo que vence este mes',
        hint: 'Capital de trabajo, ratio corriente y prueba ácida',
        answer:
          'El capital de trabajo es el activo corriente menos el pasivo corriente. El ratio corriente sano se ubica entre 1,5 y 2,5; la prueba ácida saca el inventario de la cuenta.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Capital de trabajo = activo corriente menos pasivo corriente',
          'Ratio de liquidez corriente = activo corriente sobre pasivo corriente',
          'Prueba ácida o liquidez seca = activo corriente menos inventarios, sobre pasivo corriente',
          'Por debajo de 1 no cubrís el corto plazo; entre 1 y 1,5 cubrís sin margen; entre 1,5 y 2,5 es la zona saludable; por encima suele haber capital ocioso',
          'Una prueba ácida por debajo de 0,5 significa que dependés de vender stock para pagar deudas',
        ],
        warn: [
          'Estimación para planificación: un ratio corriente alto no garantiza caja si el activo corriente está lleno de mercadería que no rota o de deudores incobrables',
          'La prueba ácida es la que manda cuando el inventario es lento: es la única que mide lo que podés pagar sin liquidar stock',
          'El ratio corriente es una foto de un día: se maquilla fácil postergando pagos o adelantando cobranzas cerca del cierre',
          'Liquidez muy holgada tampoco es gratis: plata quieta en cuenta pierde contra la inflación',
        ],
        plazo:
          'revisá el ratio junto al calendario real de vencimientos del mes: un 1,8 con todo venciendo la semana que viene no es holgura.',
      },
      {
        id: 'stock',
        label: 'Cuánto capital tengo parado en mercadería',
        hint: 'Rotación de inventario y costo de mantenerlo',
        answer:
          'La rotación es el costo de mercadería vendida sobre el inventario promedio. Mantener ese stock cuesta entre 20% y 30% anual de su valor entre capital inmovilizado, almacenaje, seguros y merma.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'Rotación anual = costo de mercadería vendida dividido el inventario promedio',
          'Días de stock = 365 dividido la rotación',
          'Holding cost = costo de capital + almacenaje + seguros + merma, todo como porcentaje anual del valor del inventario',
          'Costo anual de mantener el stock = valor del inventario por ese porcentaje',
          'Por debajo de 3 rotaciones al año hay mucho capital inmovilizado; entre 6 y 12 es el rango del retail sano; por encima de 12 el flujo es excelente pero se arriesgan quiebres de stock',
        ],
        warn: [
          'Estimación para planificación: el holding cost suele estar entre 20% y 30% anual del valor del stock, y casi nunca aparece en ninguna línea del balance',
          'La rotación promedio esconde el problema real: normalmente un puñado de artículos rota bien y el resto es capital muerto. Miralo por producto, no por total',
          'La merma y la obsolescencia son la parte que más se subestima, sobre todo en tecnología, moda y perecederos',
          'Comprar de más para conseguir descuento por volumen tiene sentido sólo si el descuento supera el holding cost de los meses extra que vas a tener esa mercadería',
        ],
        plazo:
          'usá el inventario promedio del período, no el saldo de cierre: cerrar el año con el depósito vacío infla artificialmente la rotación.',
      },
      {
        id: 'caja',
        label: 'Cuánta caja genera de verdad el negocio',
        hint: 'Flujo de caja libre',
        answer:
          'El flujo de caja libre es la ganancia operativa después de impuestos, más la depreciación, menos lo que se llevan el capital de trabajo y las inversiones. Es la plata que queda de verdad.',
        yes: [
          'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad.',
          'NOPAT = EBIT por uno menos la tasa impositiva',
          'Se suma la depreciación y amortización, porque es un gasto contable que no sale de la caja',
          'Se resta el aumento del capital de trabajo: si crecen las cuentas por cobrar y el stock, esa plata está inmovilizada',
          'Se resta el CAPEX, la inversión en activos que hay que pagar sí o sí',
          'Flujo de caja libre positivo significa que podés repagar deuda, reinvertir o repartir; negativo significa que necesitás financiamiento',
        ],
        warn: [
          'Estimación para planificación: ganancia contable y caja no son lo mismo. Se puede tener resultado positivo y flujo de caja libre negativo durante años',
          'El capital de trabajo es el sospechoso habitual: crecer 40% en ventas con el mismo ciclo de efectivo obliga a inmovilizar 40% más de plata',
          'Un flujo de caja libre alto logrado a fuerza de no invertir es una alarma, no un logro: se está consumiendo la capacidad futura',
          'Esta cuenta es antes del costo de la deuda: si tenés préstamos, los intereses y las amortizaciones salen de este flujo',
        ],
        plazo:
          'miralo por año completo o por doce meses móviles: un trimestre suelto se distorsiona con la estacionalidad y con un CAPEX puntual.',
      },
    ],
  },

  inputsTitle: 'Los números de tu balance',
  inputsIntro:
    'Cada rama usa los campos que le sirven. Los demás podés dejarlos como están. Todo sale del balance y del estado de resultados del último período.',
  fields: [
    {
      id: 'ventas_anuales',
      label: 'Ventas anuales (facturación)',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 1000000,
      value: 100000000,
      thousands: true,
      help: 'Ventas netas del año. Se usa para pasar las cuentas por cobrar a días de cobro.',
    },
    {
      id: 'costo_ventas',
      label: 'Costo de mercadería vendida anual (CMV)',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 1000000,
      value: 60000000,
      thousands: true,
      help: 'Lo que te costó a vos la mercadería que vendiste. Es la base del cálculo de stock y de proveedores.',
    },
    {
      id: 'cuentas_cobrar',
      label: 'Cuentas por cobrar',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 100000,
      value: 15000000,
      thousands: true,
      help: 'Saldo de lo que te deben tus clientes: facturas emitidas y todavía no cobradas.',
    },
    {
      id: 'cuentas_pagar',
      label: 'Cuentas por pagar a proveedores',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 100000,
      value: 9000000,
      thousands: true,
      help: 'Saldo de lo que le debés a proveedores comerciales. No incluyas préstamos bancarios.',
    },
    {
      id: 'inventario',
      label: 'Inventario promedio (mercadería en stock)',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 100000,
      value: 10000000,
      thousands: true,
      help: 'Valuado a costo, no a precio de venta. Promedio del período, no el saldo del día de cierre.',
    },
    {
      id: 'activo_corriente',
      label: 'Activo corriente total',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 100000,
      value: 30000000,
      thousands: true,
      help: 'Caja, bancos, inversiones de corto plazo, cuentas por cobrar e inventario: todo lo que se hace líquido dentro del año.',
    },
    {
      id: 'pasivo_corriente',
      label: 'Pasivo corriente total',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 100000,
      value: 20000000,
      thousands: true,
      help: 'Todo lo que vence dentro del año: proveedores, sueldos, impuestos, cuotas de préstamos y descubierto.',
    },
    {
      id: 'costo_capital_pct',
      label: 'Costo de capital anual',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.5,
      value: 12,
      help: 'Costo de oportunidad de la plata inmovilizada en stock: tu tasa de financiamiento o el retorno que esperás.',
    },
    {
      id: 'almacenaje_pct',
      label: 'Almacenaje anual',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.5,
      value: 6,
      help: 'Depósito, servicios, mantenimiento y personal de logística, como porcentaje del valor del inventario.',
    },
    {
      id: 'seguros_pct',
      label: 'Seguros anuales',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.5,
      value: 2,
      help: 'Seguros sobre la mercadería almacenada.',
    },
    {
      id: 'merma_pct',
      label: 'Merma y obsolescencia anual',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 0.5,
      value: 5,
      help: 'Rotura, vencimiento, robo y mercadería que se vuelve invendible.',
    },
    {
      id: 'ebit',
      label: 'EBIT: ganancia operativa del año',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 1000000,
      value: 10000000,
      thousands: true,
      help: 'Resultado antes de intereses e impuestos.',
    },
    {
      id: 'tasa_impositiva',
      label: 'Tasa impositiva sobre la ganancia',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 35,
      help: 'Alícuota efectiva del impuesto a las ganancias que te aplica.',
    },
    {
      id: 'depreciacion',
      label: 'Depreciación y amortización del año',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 100000,
      value: 2000000,
      thousands: true,
      help: 'Gasto contable que no sale de la caja, por eso se suma de nuevo.',
    },
    {
      id: 'cambio_wc',
      label: 'Aumento del capital de trabajo en el año',
      type: 'number',
      prefix: '$',
      min: -1000000000000,
      max: 1000000000000,
      step: 100000,
      value: 1000000,
      thousands: true,
      help: 'Cuánto más se inmovilizó en cuentas por cobrar y stock respecto del año anterior. Si se liberó plata, va en negativo.',
    },
    {
      id: 'capex',
      label: 'CAPEX: inversión en activos del año',
      type: 'number',
      prefix: '$',
      min: 0,
      max: 1000000000000,
      step: 100000,
      value: 3000000,
      thousands: true,
      help: 'Maquinaria, vehículos, obra, equipamiento y sistemas comprados en el período.',
    },
  ],
  fineprint:
    'Estimación para planificación. No reemplaza asesoramiento contable, contractual o financiero adaptado a tu actividad. Los ratios de liquidez, la rotación de inventario y el costo de mantener stock varían mucho por industria: un supermercado y una constructora sanos tienen ciclos de efectivo opuestos. Revisá el resultado con tu contador antes de tomar una decisión de financiamiento.',

  chart: {
    type: 'scale',
    title: 'Dónde caés',
    caption:
      'La barra ubica tu resultado dentro de las franjas de diagnóstico de cada rama: días de ciclo de efectivo, ratio de liquidez corriente, rotación anual de inventario o margen de flujo de caja libre. El marcador muestra tu posición y el color, la zona en la que estás.',
    bands: [
      { label: 'Zona buena', from: 0, to: 30, tone: 'good' },
      { label: 'Zona normal', from: 30, to: 60, tone: 'neutral' },
      { label: 'Zona a vigilar', from: 60, to: 90, tone: 'warn' },
      { label: 'Zona crítica', from: 90, to: 150, tone: 'bad' },
    ],
  },
  breakdownTitle: 'El desglose, número por número',
  breakdownIntro:
    'Cada fila trae su unidad: hay pesos, días, veces y porcentajes. Las barras comparan cada concepto con el mayor de la lista.',

  faq: [
    {
      q: '¿Qué es el ciclo de conversión de efectivo y cómo se calcula?',
      a: 'Es la cantidad de días que pasan entre que pagás la mercadería y que cobrás la venta. Se calcula sumando los días promedio de cobro (DSO) más los días que el stock queda parado (DIO) y restando los días promedio de pago a proveedores (DPP). Si te da 60, cada peso que ponés en la operación tarda 60 días en volver a tu caja, y esos 60 días los financiás vos con capital propio o con deuda.',
    },
    {
      q: '¿Por qué facturo cada vez más y tengo cada vez menos plata?',
      a: 'Porque el crecimiento consume caja cuando el ciclo de conversión de efectivo es positivo. Si vender un peso más te obliga a inmovilizar más stock y más cuentas por cobrar antes de cobrar, cada venta adicional te saca plata del bolsillo hoy y te la devuelve dentro de dos meses. Por eso hay empresas rentables que quiebran creciendo: no es un problema de margen, es un problema de sincronización entre cobros y pagos.',
    },
    {
      q: '¿Cuál es un DSO normal?',
      a: 'Depende del canal, pero la escala habitual es: por debajo de 30 días, cobranza excelente; entre 30 y 60, un plazo bueno y típico de B2B sano; entre 60 y 90, regular, conviene revisar las condiciones que les diste a los clientes; por encima de 90, crítico, estás financiando a tus clientes con tu propia caja. En retail al público el DSO tiende a cero porque se cobra en el momento.',
    },
    {
      q: '¿Cuántos días es razonable tardar en pagarle a los proveedores?',
      a: 'Por debajo de 15 días estás pagando muy rápido: si no te dan un descuento por pronto pago que lo justifique, estás regalando financiamiento gratis. Entre 15 y 30 es el estándar de la mayoría de las industrias. Entre 30 y 60 hay buena gestión de caja. Entre 60 y 90 el plazo ya es agresivo y puede deteriorarte las condiciones comerciales. Por encima de 90 suele ser señal de que no llegás a pagar.',
    },
    {
      q: '¿Cuál es una rotación de inventario saludable?',
      a: 'Más de 12 veces al año es rotación muy alta: excelente flujo, pero con riesgo de quiebres de stock y ventas perdidas. Entre 6 y 12 es el rango típico del retail sano. Entre 3 y 6 la rotación es lenta y conviene depurar el surtido. Por debajo de 3 hay mucho capital inmovilizado en mercadería que no sale. Ojo que el número correcto depende de la industria: un supermercado rota decenas de veces y una joyería, dos.',
    },
    {
      q: '¿Cuánto cuesta tener mercadería parada?',
      a: 'Bastante más de lo que parece, porque no aparece en ninguna línea del balance. Sumando el costo de oportunidad del capital inmovilizado, el almacenaje, los seguros y la merma por rotura, vencimiento u obsolescencia, el holding cost suele ubicarse entre 20% y 30% anual del valor del stock. Con un inventario de diez millones eso son entre dos y tres millones por año sólo por tenerlo ahí.',
    },
    {
      q: '¿Qué diferencia hay entre capital de trabajo, ratio corriente y prueba ácida?',
      a: 'El capital de trabajo es una resta y da un monto en pesos: activo corriente menos pasivo corriente. El ratio corriente es la misma relación pero como división, y da veces: cuántos pesos de activo corriente tenés por cada peso de deuda de corto plazo. La prueba ácida es ese mismo ratio pero sacando el inventario del numerador, porque la mercadería puede tardar meses en volverse plata. Los tres miran lo mismo desde distinta altura.',
    },
    {
      q: '¿Cuál es un ratio de liquidez corriente sano?',
      a: 'Por debajo de 1 el activo corriente no alcanza a cubrir las deudas de corto plazo: hay riesgo de liquidez concreto. Entre 1 y 1,5 cubrís pero sin margen y hay que monitorear de cerca. Entre 1,5 y 2,5 es la zona saludable. Por encima de 2,5 suele haber capital ocioso que podría estar rindiendo. Y si la prueba ácida queda por debajo de 0,5, dependés del inventario para pagar, que es la posición más frágil de todas.',
    },
    {
      q: '¿El ciclo de conversión de efectivo puede dar negativo?',
      a: 'Sí, y es la mejor posición posible: significa que cobrás antes de pagar. Le pasa a los negocios que venden al contado y le compran a proveedores a 30 o 60 días, como los supermercados y buena parte del e-commerce. Con ciclo negativo el proveedor te financia toda la operación y crecer, en vez de consumirte caja, te la genera. Es la razón por la que esos negocios pueden expandirse sin pedir préstamos.',
    },
    {
      q: '¿Cómo acorto el ciclo de efectivo sin romper nada?',
      a: 'Por orden de impacto y de daño colateral: primero la cobranza, con facturación el mismo día, recordatorios automáticos, medios de pago inmediatos y descuentos por pago anticipado; después el stock, depurando lo que no rota y comprando más seguido en lotes más chicos; y recién al final el plazo con proveedores, que es la palanca más rápida pero también la que te puede costar el descuento por pronto pago y la buena relación comercial.',
    },
    {
      q: '¿Qué es el flujo de caja libre y en qué se diferencia de la ganancia?',
      a: 'La ganancia es un resultado contable; el flujo de caja libre es plata. Se calcula tomando la ganancia operativa después de impuestos, sumando la depreciación —que es un gasto que no sale de la caja— y restando el aumento del capital de trabajo y el CAPEX. Una empresa puede tener ganancia positiva y flujo de caja libre negativo durante años si todo lo que gana se le va en más stock, más cuentas por cobrar y más inversión.',
    },
    {
      q: '¿Cuánta caja necesito para bancar mi operación?',
      a: 'Una aproximación práctica es multiplicar los días del ciclo de conversión de efectivo por lo que te cuesta un día de operación, es decir el costo de ventas anual dividido 365. Si tu ciclo es de 60 días y operás con un costo de ventas de sesenta millones al año, necesitás cerca de diez millones inmovilizados de forma permanente sólo para que la rueda gire. Si querés crecer 30%, necesitás 30% más de esa caja antes de ver la primera venta nueva.',
    },
  ],

  sources: [
    {
      name: 'CFI — Cash Conversion Cycle: definición y fórmula (DSO + DIO − DPO)',
      url: 'https://corporatefinanceinstitute.com/resources/accounting/cash-conversion-cycle/',
      publisher: 'Corporate Finance Institute',
    },
    {
      name: 'CFI — Working Capital: capital de trabajo y ratios de liquidez',
      url: 'https://corporatefinanceinstitute.com/resources/accounting/working-capital-cycle/',
      publisher: 'Corporate Finance Institute',
    },
    {
      name: 'CFI — Free Cash Flow: NOPAT, capital de trabajo y CAPEX',
      url: 'https://corporatefinanceinstitute.com/resources/valuation/free-cash-flow-fcf-formula/',
      publisher: 'Corporate Finance Institute',
    },
    {
      name: 'Investopedia — Inventory Turnover Ratio y días de inventario',
      url: 'https://www.investopedia.com/terms/i/inventoryturnover.asp',
      publisher: 'Investopedia',
    },
    {
      name: 'Investopedia — Carrying Costs: qué incluye el costo de mantener inventario',
      url: 'https://www.investopedia.com/terms/c/carrying-costs.asp',
      publisher: 'Investopedia',
    },
    {
      name: 'Investopedia — Quick Ratio (prueba ácida) y Current Ratio',
      url: 'https://www.investopedia.com/terms/q/quickratio.asp',
      publisher: 'Investopedia',
    },
    {
      name: 'ARCA — Impuesto a las Ganancias: alícuotas para sociedades',
      url: 'https://www.arca.gob.ar/',
      publisher: 'Agencia de Recaudación y Control Aduanero',
    },
  ],

  replaces: [
    '/calculadora-capital-de-trabajo',
    '/calculadora-dso-dias-promedio-cobro',
    '/calculadora-dias-promedio-pago-proveedores-dpp',
    '/calculadora-rotacion-inventario-stock',
    '/calculadora-costo-almacenamiento-inventario',
    '/calculadora-ratio-liquidez-corriente-seco',
    '/calculadora-flujo-caja-libre-fcf',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Días del año que usan TODAS las fórmulas del cluster (dso.ts, dpp, rotación). */
export const DIAS_ANIO = 365;
export const MESES_ANIO = 12;

/**
 * Franjas de diagnóstico. COPIA FIEL de los cortes de las fórmulas reales.
 * Los `min`/`max` de cada escala son los extremos de dibujo del gráfico.
 */
export const BANDAS = {
  /**
   * Días promedio de cobro — `dso.ts`: <30 excelente, <60 bueno, <90 regular,
   * el resto crítico. El ciclo de conversión de efectivo se lee con la MISMA
   * escala de días (convención de este hub, no de una fórmula), extendida hacia
   * abajo porque el ciclo puede ser negativo.
   */
  dso: { excelente: 30, bueno: 60, regular: 90 },
  ciclo: { min: -30, max: 150, excelente: 30, bueno: 60, regular: 90 },
  /**
   * Días promedio de pago — `dias-promedio-pago-proveedores-dpp.ts`:
   * <15 muy rápido, ≤30 estándar, ≤60 buena caja, ≤90 agresivo, resto alerta.
   */
  dpp: { muyRapido: 15, estandar: 30 , buenaCaja: 60, agresivo: 90 },
  /**
   * Rotación anual de inventario — `rotacion-inventario.ts`: ≤3 muy lenta,
   * ≤6 lenta, ≤12 saludable, más es muy alta.
   */
  rotacion: { min: 0, max: 15, muyLenta: 3, lenta: 6, saludable: 12 },
  /**
   * Liquidez corriente — `ratio-liquidez-corriente-seco.ts`: <1 riesgo,
   * <1,5 ajustada, ≤2,5 saludable, más holgada. Prueba ácida: <0,5 baja, ≥1 sólida.
   */
  liquidez: { min: 0, max: 4, riesgo: 1, ajustada: 1.5, saludable: 2.5 },
  acida: { baja: 0.5, solida: 1 },
  /**
   * Holding cost del inventario — `costo-almacenamiento-inventario.ts`:
   * el rango habitual de la logística es 20-30% anual; ≤18 eficiente, ≥30 alto.
   */
  holding: { eficiente: 18, rangoDesde: 20, rangoHasta: 30 },
  /**
   * Margen de flujo de caja libre sobre EBIT. `flujo-caja-libre-fcf.ts` sólo
   * distingue positivo, cero y negativo: los cortes intermedios son de dibujo.
   */
  fcf: { min: -50, max: 100, equilibrio: 0, sano: 25, fuerte: 50 },
};
