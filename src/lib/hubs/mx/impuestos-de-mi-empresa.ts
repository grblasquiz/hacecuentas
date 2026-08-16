import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "Tengo una empresa: ¿qué le pago al SAT y qué me cuesta cumplir?"
 *
 * Fusiona el ISR de personas morales (régimen general del Art. 9 LISR contra RESICO PM
 * del Art. 206, que se determina por flujo de efectivo), el costo operativo de cumplir
 * (timbrado de CFDI 4.0 y comisiones de las pasarelas de cobro) y lo que cuesta llegar
 * tarde (actualización del Art. 17-A y recargos del Art. 21 del CFF, más las multas de
 * contabilidad electrónica).
 *
 * Constantes desde la fuente única src/lib/data/mexico-2026.ts y de la LIF 2026.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/** Parámetros del ISR corporativo y del cumplimiento, para el compute() de la página. */
export const EMPRESA_MX = {
  /** Tasa de ISR de personas morales — Art. 9 LISR. La misma que aplica RESICO PM (Art. 206). */
  tasaIsrPm: 0.3,
  /** Tope de ingresos del ejercicio inmediato anterior para permanecer en RESICO PM — Art. 206 LISR. */
  topeIngresosResicoPm: 35_000_000,
  /** Límites de deducción de la PTU pagada — Art. 9 LISR y Art. 127-VIII LFT. */
  ptuLimiteUtilidad: 0.1,
  ptuLimiteIngresos: 0.3,
  /** Tasa mensual de recargos por MORA 2026 — Art. 11, fracc. I, LIF 2026 (DOF 07-nov-2025). */
  recargosMoraMensual: 0.0207,
  /** Tasa mensual de recargos en PRÓRROGA 2026 (pago a plazos autorizado) — Art. 8 LIF 2026. */
  recargosProrrogaMensual: 0.0138,
  /** Tope legal de causación de recargos — Art. 21 CFF: 5 años = 60 meses. */
  maxMesesRecargos: 60,
  /** IVA que se suma a la comisión de las pasarelas de cobro. */
  iva: MEXICO_2026.iva.general,
  /** Referencias de tarifa por CFDI timbrado (mercado de PACs; el SAT no fija precio). */
  tarifaPac: { sinPac: 0, bajo: 0.5, medio: 1, alto: 2 },
  /** CFDI mensuales sin costo en el portal gratuito del SAT. */
  cfdiGratisSat: 50,
  /** Comisiones de referencia de pasarelas mexicanas (antes de IVA). */
  pasarelas: {
    clip: { rate: 0.036, fijo: 0, label: 'Clip' },
    'mercado-pago-inmediato': { rate: 0.0349, fijo: 4, label: 'Mercado Pago (dinero inmediato)' },
    'mercado-pago-30': { rate: 0.0295, fijo: 4, label: 'Mercado Pago (a 30 días)' },
    paypal: { rate: 0.0395, fijo: 4, label: 'PayPal' },
  } as Record<string, { rate: number; fijo: number; label: string }>,
};

export const hub: HubData = {
  slug: 'mx/impuestos/impuestos-de-mi-empresa',
  title: 'Impuestos de mi empresa en México: ISR, RESICO PM y costo de cumplir con el SAT',
  description:
    'Cuánto ISR paga tu persona moral en el régimen general del 30% frente a RESICO PM por flujo de efectivo, cuánto te cuesta timbrar CFDI y cobrar con pasarela, y cuánto crece un impuesto que pagas tarde por actualización y recargos.',
  silo: 'Impuestos',
  siloHref: '/mx/impuestos',

  eyebrow: 'México · Empresas',
  h1: 'Tengo una empresa: ¿qué le pago al SAT y qué me cuesta cumplir?',
  lede:
    'La factura fiscal de una persona moral tiene tres capas: el ISR sobre la utilidad, el costo operativo de facturar y cobrar, y lo que se encarece todo si pagas fuera de plazo. Elige la que estás resolviendo.',
  stamps: [
    'ISR personas morales 30% · LISR Art. 9',
    'RESICO PM por flujo de efectivo · LISR Arts. 206-215',
    'Recargos por mora 2,07% mensual · LIF 2026 Art. 11',
    '7 calculadoras fusionadas',
  ],

  resultLabel: 'Resultado del cálculo',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro: 'Empezamos por el número grande: el ISR anual de la sociedad y su comparación con RESICO PM.',
    items: [
      {
        id: 'isr',
        label: 'Mi ISR anual: régimen general o RESICO PM',
        hint: '30% sobre utilidad fiscal contra 30% sobre flujo de efectivo cobrado.',
        yes: [
          'Utilidad fiscal del ejercicio: ingresos acumulables menos deducciones autorizadas',
          'PTU pagada en el ejercicio, disminuida de la utilidad',
          'ISR anual a la tasa del 30% y tasa efectiva sobre los ingresos',
          'Comparación con RESICO PM, que grava el flujo de efectivo (cobrado menos pagado)',
          'Pago provisional mensual estimado con el coeficiente de utilidad',
        ],
        warn: [
          DISCLAIMER_TAX,
          'RESICO PM no es una tasa distinta: es la misma tasa del 30%, pero sobre una base determinada por flujo de efectivo, no por lo devengado',
          'Para permanecer en RESICO PM la sociedad tiene que estar integrada solo por personas físicas y no rebasar 35 millones de pesos de ingresos del ejercicio inmediato anterior',
          'La comparación no considera pérdidas fiscales de ejercicios anteriores, ajuste anual por inflación ni el efecto de la CUFIN: para una decisión de régimen hace falta la proyección completa con tu contador',
        ],
        plazo: 'la declaración anual de personas morales se presenta a más tardar el 31 de marzo del año siguiente.',
        answer:
          'El régimen general grava al 30% la utilidad fiscal devengada; RESICO PM aplica esa misma tasa pero solo sobre lo que efectivamente cobraste menos lo que efectivamente pagaste.',
      },
      {
        id: 'cumplir',
        label: 'Qué me cuesta facturar y cobrar',
        hint: 'Timbrado de CFDI 4.0 con PAC y comisiones de la pasarela de pago.',
        yes: [
          'Costo anual de timbrar tus CFDI con un PAC, según volumen y tarifa',
          'Cuántos comprobantes te quedan dentro del portal gratuito del SAT',
          'Comisión de la pasarela de cobro sobre tu volumen mensual, con IVA incluido',
          'Cuánto dinero llega realmente a tu cuenta después de comisiones',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las tarifas de PAC y de pasarela son referencias de mercado, no precios oficiales: cambian por proveedor, volumen y negociación, y por eso el campo es editable',
          'La comisión de la pasarela lleva IVA, y ese IVA es acreditable si tienes el CFDI del proveedor: no lo cuentes dos veces como costo',
          'El portal gratuito del SAT sirve para volúmenes bajos, pero no emite complementos ni se integra con tu sistema: por encima de cierto volumen el PAC deja de ser opcional en la práctica',
        ],
        plazo: 'el CFDI se debe emitir al momento de la operación y cancelarlo fuera del ejercicio requiere justificar el motivo.',
        answer:
          'El costo de cumplir se compone del timbrado por comprobante y de la comisión de cobro con IVA; el portal gratuito del SAT cubre volúmenes chicos.',
      },
      {
        id: 'marketplace',
        label: 'Cuánto me queda al vender en un marketplace',
        hint: 'Comisión, IVA, envío, publicidad, devoluciones y margen neto.',
        yes: [
          'Comisión porcentual y cargo fijo por cada venta',
          'IVA facturado por la plataforma sobre sus servicios',
          'Envío, empaque, publicidad y costo esperado de devoluciones',
          'Utilidad neta por unidad, margen real y precio mínimo para no perder',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las plataformas cambian tarifas por categoría, reputación, plazo de acreditación y tipo de publicación: copiá la comisión real de tu panel',
          'Las retenciones de ISR e IVA afectan la caja recibida pero no siempre son un costo definitivo: se acreditan en la declaración cuando corresponde',
          'El IVA de la comisión puede ser acreditable si contás con el CFDI; el cálculo lo muestra separado para evitar contarlo dos veces',
        ],
        plazo: 'recalculá cada vez que cambie la tarifa, el envío subsidiado o el costo de publicidad de la categoría.',
        answer:
          'La rentabilidad se mide sobre el neto después de comisión, IVA del servicio, logística, publicidad, devoluciones y costo del producto; el precio publicado por sí solo no dice cuánto ganás.',
      },
      {
        id: 'atraso',
        label: 'Pagué (o voy a pagar) fuera de plazo',
        hint: 'Actualización por inflación, recargos por mora y multas de contabilidad.',
        yes: [
          'Impuesto actualizado por inflación con el factor del Art. 17-A del CFF',
          'Recargos por mora sobre el impuesto ya actualizado, por mes o fracción',
          'Total a pagar y cuánto suma cada mes adicional de atraso',
          'Estimación de la multa por incumplimientos de contabilidad electrónica',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los recargos se calculan sobre el impuesto YA actualizado, no sobre el histórico: por eso el total crece más rápido de lo que sugiere la tasa mensual',
          'El factor de actualización se obtiene dividiendo el INPC del mes anterior al más reciente entre el del mes anterior al que debió pagarse; si da menos de 1 se aplica 1',
          'Los recargos topan a 60 meses, pero la actualización sigue corriendo y el crédito fiscal no se extingue por ese tope',
          'Los rangos de multa por contabilidad son estimaciones a partir del catálogo de sanciones del CFF: el monto exacto lo determina la autoridad en la resolución, y la autocorrección puede reducirlo',
        ],
        plazo: 'los pagos provisionales vencen el día 17 del mes siguiente; a partir del 18 ya corren recargos.',
        answer:
          'El adeudo se actualiza por inflación y sobre ese monto corren recargos por cada mes o fracción de atraso, con tope de 60 meses.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu empresa',
  inputsIntro: 'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto.',
  fields: [
    {
      id: 'ingresos',
      label: 'Ingresos acumulables del ejercicio (MXN)',
      prefix: '$',
      value: 6000000,
      thousands: true,
      help: 'En RESICO PM, los efectivamente cobrados.',
    },
    {
      id: 'deducciones',
      label: 'Deducciones autorizadas del ejercicio (MXN)',
      prefix: '$',
      value: 4200000,
      thousands: true,
      help: 'En RESICO PM, las efectivamente pagadas.',
    },
    {
      id: 'ptu',
      label: 'PTU pagada en el ejercicio (MXN)',
      prefix: '$',
      value: 120000,
      thousands: true,
      help: 'Se disminuye de la utilidad fiscal, con los límites del reparto.',
    },
    {
      id: 'facturas',
      label: 'CFDI que emites por mes',
      value: 180,
      min: 0,
      step: 1,
      help: 'Cuenta también notas de crédito y complementos de pago.',
    },
    {
      id: 'tarifaPac',
      label: 'Tarifa de timbrado por CFDI',
      type: 'select',
      value: 'bajo',
      options: [
        { value: 'sinPac', label: 'Portal gratuito del SAT (hasta 50 al mes)' },
        { value: 'bajo', label: 'PAC económico — referencia $0,50 por CFDI' },
        { value: 'medio', label: 'PAC intermedio — referencia $1,00 por CFDI' },
        { value: 'alto', label: 'PAC con soporte — referencia $2,00 por CFDI' },
      ],
      help: 'Precios de mercado, no oficiales: negocia por volumen.',
    },
    {
      id: 'ticket',
      label: 'Ticket promedio de venta (MXN)',
      prefix: '$',
      value: 1500,
      thousands: true,
      help: 'Monto medio de cada cobro procesado.',
    },
    {
      id: 'operaciones',
      label: 'Cobros por pasarela al mes',
      value: 200,
      min: 0,
      step: 1,
      help: 'Solo los que pasan por la pasarela, no las transferencias directas.',
    },
    {
      id: 'pasarela',
      label: 'Pasarela de cobro',
      type: 'select',
      value: 'clip',
      options: [
        { value: 'clip', label: 'Clip — 3,60% + IVA' },
        { value: 'mercado-pago-inmediato', label: 'Mercado Pago, dinero inmediato — 3,49% + $4' },
        { value: 'mercado-pago-30', label: 'Mercado Pago, a 30 días — 2,95% + $4' },
        { value: 'paypal', label: 'PayPal — 3,95% + $4' },
        { value: 'personalizada', label: 'Mi tarifa negociada' },
      ],
      help: 'Tarifas de lista publicadas; si negociaste otra, elige la última opción.',
    },
    {
      id: 'tasaPersonalizada',
      label: 'Mi comisión negociada (% por operación)',
      suffix: '%',
      value: 2.5,
      min: 0,
      max: 20,
      step: 0.01,
      help: 'Solo se usa si elegiste tarifa negociada.',
    },
    {
      id: 'marketplaceComision',
      label: 'Marketplace: comisión sobre la venta (%)',
      suffix: '%',
      value: 17,
      min: 0,
      max: 60,
      step: 0.01,
      help: 'Copiala de tu categoría y tipo de publicación; no hay una tasa única.',
    },
    {
      id: 'marketplaceFijo',
      label: 'Marketplace: cargo fijo por unidad (MXN)',
      prefix: '$',
      value: 0,
      min: 0,
      thousands: true,
      help: 'Si no existe o ya está incluido en el porcentaje, dejalo en cero.',
    },
    {
      id: 'costoProducto',
      label: 'Costo del producto por unidad (MXN)',
      prefix: '$',
      value: 650,
      min: 0,
      thousands: true,
    },
    {
      id: 'envioEmpaque',
      label: 'Envío y empaque a tu cargo por unidad (MXN)',
      prefix: '$',
      value: 120,
      min: 0,
      thousands: true,
    },
    {
      id: 'publicidadUnidad',
      label: 'Publicidad atribuida por unidad (MXN)',
      prefix: '$',
      value: 80,
      min: 0,
      thousands: true,
    },
    {
      id: 'devolucionesPct',
      label: 'Costo esperado de devoluciones (% de ventas)',
      suffix: '%',
      value: 3,
      min: 0,
      max: 100,
      step: 0.1,
      help: 'Promedio histórico: tasa de devolución multiplicada por el costo medio de cada devolución.',
    },
    {
      id: 'impuestoAtrasado',
      label: 'Impuesto que pagas fuera de plazo (MXN)',
      prefix: '$',
      value: 80000,
      thousands: true,
      help: 'El monto histórico original, sin recargos ni actualización.',
    },
    {
      id: 'mesesAtraso',
      label: 'Meses de atraso',
      value: 6,
      min: 0,
      max: 120,
      step: 1,
      help: 'El CFF cobra por mes o fracción: 1 día de atraso ya cuenta un mes.',
    },
    {
      id: 'factorActualizacion',
      label: 'Factor de actualización (Art. 17-A)',
      value: 1.02,
      min: 1,
      max: 5,
      step: 0.0001,
      help: 'INPC del mes anterior al más reciente entre el del mes anterior al que debió pagarse.',
    },
    {
      id: 'tipoRecargo',
      label: 'Tipo de recargo',
      type: 'select',
      value: 'mora',
      options: [
        { value: 'mora', label: 'Mora — pago extemporáneo (2,07% mensual)' },
        { value: 'prorroga', label: 'Prórroga — pago a plazos autorizado (1,38% mensual)' },
      ],
      help: 'La prórroga solo aplica si el SAT autorizó el pago a plazos.',
    },
    {
      id: 'multaContabilidad',
      label: 'Multa de contabilidad electrónica estimada (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Si además te sancionaron por contabilidad o CFDI, ponla aquí para ver el total.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Cómo se compone el resultado',
    caption: 'Cada porción es un concepto del cálculo: mira cuál pesa más antes de optimizar.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto ISR paga una persona moral en México?',
      a: 'La tasa es del 30% sobre el resultado fiscal, es decir sobre los ingresos acumulables menos las deducciones autorizadas, menos la PTU pagada y menos las pérdidas fiscales pendientes de amortizar. Es una tasa plana: no hay tarifa progresiva como en personas físicas, así que la palanca real no es la tasa sino la base.',
    },
    {
      q: '¿RESICO para personas morales paga menos que el régimen general?',
      a: 'No necesariamente, y esa es la confusión más común. La tasa es la misma, 30%. Lo que cambia es la base: en RESICO PM se determina por flujo de efectivo, así que solo pagas por lo que efectivamente cobraste y solo deduces lo que efectivamente pagaste. Le conviene a quien cobra tarde o factura mucho a crédito; no le conviene a quien cobra de contado y compra a plazo.',
    },
    {
      q: '¿Quién puede estar en RESICO personas morales?',
      a: 'Sociedades constituidas únicamente por personas físicas cuyos ingresos totales del ejercicio inmediato anterior no rebasen 35 millones de pesos. Quedan fuera, entre otros, quienes tienen socios que son personas morales, quienes participan en otras sociedades donde tienen control, y los regímenes especiales como el de coordinados o el del sector primario.',
    },
    {
      q: '¿La PTU se puede deducir del ISR?',
      a: 'La PTU efectivamente pagada en el ejercicio se disminuye de la utilidad fiscal para determinar el resultado del ejercicio. Ojo con el orden: primero se determina la utilidad fiscal, después se resta la PTU pagada y solo entonces se amortizan las pérdidas de ejercicios anteriores. Invertir ese orden cambia el resultado.',
    },
    {
      q: '¿Cómo se calculan los pagos provisionales de ISR?',
      a: 'En el régimen general se aplica el coeficiente de utilidad del último ejercicio con utilidad a los ingresos nominales acumulados del período, y sobre esa utilidad estimada se calcula el 30%, restando los pagos provisionales anteriores. En RESICO PM no hay coeficiente: el pago provisional se determina sobre el flujo de efectivo acumulado desde enero.',
    },
    {
      q: '¿Cuánto cuesta timbrar un CFDI?',
      a: 'El SAT no cobra por timbrar, pero exige que el comprobante pase por un proveedor autorizado de certificación. En el mercado los timbres se venden en paquetes y el precio unitario baja mucho con el volumen: un negocio con pocos comprobantes al mes puede usar el portal gratuito del SAT, y a partir de cierto volumen conviene un PAC con integración, cuyo costo por comprobante es la referencia que usa este cálculo.',
    },
    {
      q: '¿La comisión de la pasarela de pago lleva IVA?',
      a: 'Sí, y ese IVA es acreditable si la pasarela te emite CFDI. Por eso conviene comparar proveedores con la comisión más IVA y no solo con el porcentaje de lista: una tarifa que parece más barata puede terminar costando más si tiene además un cargo fijo por operación y tu ticket promedio es bajo.',
    },
    {
      q: '¿Qué diferencia hay entre actualización y recargos?',
      a: 'La actualización no es una sanción: solo mantiene el valor real del adeudo frente a la inflación, y por eso se calcula con el Índice Nacional de Precios al Consumidor. Los recargos sí son el costo financiero de la mora y se calculan sobre el impuesto ya actualizado. Primero se actualiza, después se recarga: hacerlo al revés subestima el total.',
    },
    {
      q: '¿Hasta cuándo corren los recargos?',
      a: 'La causación de recargos por mora tiene un tope de cinco años, es decir sesenta meses. Eso no significa que la deuda deje de crecer: la actualización por inflación sigue aplicando y el crédito fiscal se mantiene exigible hasta que prescriba conforme a las reglas propias de la prescripción.',
    },
    {
      q: '¿Conviene autocorregirse antes de que el SAT me detecte?',
      a: 'Casi siempre. Presentar la declaración complementaria y pagar antes de que la autoridad notifique el inicio de facultades de comprobación evita buena parte de las multas y permite reducciones que ya no están disponibles cuando la corrección llega después de un requerimiento. Lo que no evita es la actualización ni los recargos, que se causan igual.',
    },
    {
      q: '¿Qué multas hay por no llevar contabilidad electrónica?',
      a: 'El Código Fiscal de la Federación sanciona no llevar la contabilidad, no conservarla, no enviarla por los medios electrónicos o enviarla con errores o fuera de plazo. Los rangos son amplios y la autoridad determina el monto dentro del rango considerando la gravedad y la reincidencia, así que cualquier estimación previa es solo un orden de magnitud.',
    },
    {
      q: '¿Puedo cambiarme de régimen a mitad del ejercicio?',
      a: 'El cambio de régimen surte efectos a partir del ejercicio siguiente, así que la decisión de RESICO PM o régimen general se toma con la proyección del año que viene, no con el número de este mes. Si dejas de cumplir los requisitos, la salida del régimen es obligatoria y también aplica desde el ejercicio siguiente.',
    },
  ],

  sources: [
    {
      name: 'Ley del Impuesto sobre la Renta — tasa de personas morales (Art. 9) y RESICO PM (Arts. 206-215)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Código Fiscal de la Federación — actualización (Art. 17-A), recargos (Art. 21) y contabilidad (Arts. 28 y 83-84)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/cff.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley de Ingresos de la Federación 2026 — tasas de recargos (Arts. 8 y 11)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lif_2026.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'SAT — Régimen Simplificado de Confianza para personas morales',
      url: 'https://www.sat.gob.mx/consultas/61447/regimen-simplificado-de-confianza-para-personas-morales',
      publisher: 'SAT',
    },
    {
      name: 'SAT — proveedores autorizados de certificación de CFDI',
      url: 'https://www.sat.gob.mx/consultas/01324/conoce-los-proveedores-autorizados-de-certificacion-(pac)',
      publisher: 'SAT',
    },
  ],

  replaces: [
    '/calculadora-isr-personas-morales-mexico-30-porcentaje',
    '/calculadora-resico-personas-morales-mexico-2026',
    '/calculadora-cfdi-version-4-mexico-emitir-coste-validacion',
    '/calculadora-contabilidad-electronica-multa-sat-mexico',
    '/calculadora-comisiones-pasarelas-pago-mexico-2026',
    '/calculadora-comisiones-marketplaces-mexico-2026',
    '/calculadora-recargos-actualizacion-sat-mexico-2026',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
