import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo salgo de las deudas?"
 * Arquetipo RAMIFICADO: el mismo formulario responde cuatro situaciones
 * distintas (`cases`), la primera es la que arranca seleccionada.
 *
 * El gráfico es `stacked`: capital vs intereses de TODO lo que vas a terminar
 * pagando en el plan de la rama elegida. Pagando el mínimo de la tarjeta los
 * intereses superan al capital, y eso es exactamente lo que tiene que verse.
 */
export const hub: HubData = {
  slug: 'finanzas-personales/salir-de-deudas',
  title: '¿Cómo salgo de las deudas? Pago mínimo, refinanciación y cancelación anticipada',
  description:
    'Cuánto vas a terminar pagando según lo que hagas con tu deuda: seguir con el pago mínimo de la tarjeta, atacar varias deudas por orden de tasa, refinanciar o cancelar antes. Capital, intereses y meses, con la TNA y el CFT que te cobran.',
  silo: 'Finanzas personales',
  siloHref: '/finanzas-personales',

  eyebrow: 'Guía y estimación financiera',
  h1: '¿Cómo salgo de las deudas?',
  lede:
    'La cuenta que importa no es la cuota: es cuánto interés vas a pagar hasta el último peso. Partimos del caso más común —estás pagando el mínimo de la tarjeta— y lo cambiás por el tuyo.',
  stamps: ['Actualizado 27-07-2026', 'TNA · CFT · sistema francés', '6 calculadoras adentro'],

  resultLabel: 'Total que vas a terminar pagando',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'minimo',
        label: 'Estoy pagando el mínimo de la tarjeta',
        hint: 'El caso más común',
        answer: 'Pagando el mínimo, los intereses terminan pesando más que la deuda original.',
        yes: [
          'El saldo impago devenga intereses compensatorios todos los meses sobre el saldo, no sobre la compra',
          'El pago mínimo cubre primero los intereses del mes: lo poco que sobra baja el capital',
          'Si el mínimo no llega a cubrir el interés mensual, la deuda crece aunque pagues',
          'La simulación toma un piso de $1.000 de pago mensual, como hacen los resúmenes reales',
        ],
        warn: [
          'La TNA que figura en el resumen no es todo: el CFT suma IVA sobre los intereses, seguros y cargos',
          'Refinanciar el saldo en cuotas de la propia tarjeta suele salir más caro que un préstamo personal',
          'Los intereses punitorios se suman a los compensatorios si además pagás fuera de término',
        ],
        plazo:
          'el pago mínimo vence en la fecha del resumen; después de esa fecha corren punitorios además de los compensatorios.',
      },
      {
        id: 'varias',
        label: 'Tengo varias deudas y no sé cuál pagar primero',
        hint: 'Avalancha vs bola de nieve',
        answer: 'Se ataca primero la de tasa más alta: es la que multiplica más rápido.',
        yes: [
          'Método avalancha: pagás el mínimo de todas y volcás el excedente a la de MAYOR tasa',
          'Método bola de nieve: el excedente va a la de menor saldo, para cerrar deudas rápido',
          'La comparación mide el mismo dinero mensual en los dos órdenes: cambia el interés total, no lo que pagás por mes',
          'Acá el simulador compara seguir con el mínimo contra volcar un pago fijo mensual a la deuda más cara',
        ],
        warn: [
          'Avalancha gana en plata; bola de nieve gana en constancia. Si abandonaste otros planes, la diferencia de interés puede valer la motivación',
          'Antes de ordenar el pago, revisá si alguna deuda ya prescribió: tarjeta y cheque prescriben al año, la deuda genérica a los 5 (CCyCN arts. 2560 y 2564)',
          'Pagar o reconocer una deuda prescripta reinicia el plazo desde cero',
        ],
        plazo:
          'la prescripción no opera sola: hay que oponerla como defensa cuando te reclaman, y un pago parcial la interrumpe.',
      },
      {
        id: 'refinanciar',
        label: 'Quiero refinanciar la deuda',
        hint: 'Cuota más baja, plazo más largo',
        answer: 'Refinanciar conviene sólo si baja el costo total, no si sólo baja la cuota.',
        yes: [
          'Se compara el mismo saldo con dos combinaciones de tasa y plazo, en sistema francés (cuota fija)',
          'El total se mide como cuota × cantidad de cuotas, no como cuota mensual',
          'Estirar el plazo baja la cuota y sube los intereses: son dos cosas distintas',
          'Los gastos de otorgamiento y el sellado se suman al costo del crédito nuevo',
        ],
        warn: [
          'Comparar por TNA no alcanza: el CFT es lo único comparable entre bancos (com. "A" 5460 del BCRA)',
          'Si la deuda vieja tiene costo de cancelación anticipada, entra en la cuenta del refinanciamiento',
          'Refinanciar y volver a usar la tarjeta al mes siguiente es la forma más rápida de duplicar la deuda',
        ],
        plazo:
          'la entidad debe informarte el CFT antes de firmar; tenés 10 días hábiles para revocar un crédito contratado a distancia (Ley 24.240 art. 34).',
      },
      {
        id: 'cancelar',
        label: 'Quiero cancelar la deuda antes',
        hint: 'Precancelación total',
        answer: 'Cancelando hoy te ahorrás todos los intereses que faltan devengar.',
        yes: [
          'Cancelás el capital pendiente y dejás de pagar los intereses de las cuotas que faltan',
          'El ahorro es la diferencia entre lo que ibas a pagar en cuotas y el saldo que cancelás hoy',
          'La ley permite precancelar en cualquier momento: no te lo pueden negar',
          'Si precancelás más de la cuarta parte del plazo original, la comisión no puede superar el 4% del capital que devolvés',
        ],
        warn: [
          'Comparalo con el rendimiento de tener esa plata invertida: si la tasa de tu inversión supera la del crédito, conviene no cancelar',
          'Pedí siempre la constancia de libre deuda: sin ella el crédito puede seguir figurando informado en la Central de Deudores del BCRA',
          'Cancelar el préstamo y quedarte sin fondo de emergencia suele terminar en una deuda nueva y más cara',
        ],
        plazo:
          'la precancelación total o parcial está garantizada por la com. "A" 5460 del BCRA; la constancia de cancelación se pide al momento del pago.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Cada situación usa los campos que le sirven. Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'saldo',
      label: 'Cuánto debés hoy en total',
      prefix: '$',
      value: '800.000',
      thousands: true,
      help: 'El saldo impago, no el total de tus compras del mes.',
    },
    { id: 'tna', label: 'TNA que te cobran hoy (%)', type: 'number', min: 0, max: 400, step: 0.1, value: 96, help: 'La tasa nominal anual del resumen o del préstamo. Si tenés varias deudas, poné la más cara.' },
    { id: 'pagoPct', label: 'Pago mínimo de la tarjeta (% del saldo)', type: 'number', min: 1, max: 100, step: 0.5, value: 12 },
    { id: 'cuota', label: 'Cuánto podés destinar por mes', prefix: '$', value: '120.000', thousands: true, help: 'El total mensual que podés poner entre todas tus deudas.' },
    { id: 'meses', label: 'Cuotas que te quedan', type: 'number', min: 1, max: 360, value: 24 },
    { id: 'tnaNueva', label: 'TNA de la nueva propuesta (%)', type: 'number', min: 0, max: 400, step: 0.1, value: 75 },
    { id: 'mesesNuevos', label: 'Plazo de la nueva propuesta (meses)', type: 'number', min: 1, max: 360, value: 36 },
  ],
  fineprint:
    'Es una orientación: la cuenta usa interés compensatorio sobre saldo y sistema francés. El CFT real suma IVA, seguros y cargos administrativos que cambian el total del contrato.',

  chart: {
    type: 'stacked',
    title: 'Capital vs intereses',
    caption:
      'La barra parte todo lo que vas a terminar pagando en dos: el capital que debías y los intereses que se le suman. Pagando el mínimo de la tarjeta, la parte de intereses supera a la de capital.',
  },
  breakdownTitle: 'De qué se compone lo que vas a pagar',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande.',

  faq: [
    {
      q: '¿Qué pasa si pago siempre el mínimo de la tarjeta?',
      a: 'El mínimo cubre primero los intereses del mes y sólo el resto baja el capital, así que la deuda se estira años y el total pagado termina siendo un múltiplo del saldo original. Con una TNA del 96% (8% mensual) y un mínimo del 12%, una deuda de $800.000 tarda unos 127 meses y termina costando casi tres veces el saldo: los intereses son el 67% de todo lo que pagás. Y si el porcentaje mínimo es menor o igual a la tasa mensual, la deuda directamente nunca se cancela: crece todos los meses aunque pagues.',
    },
    {
      q: '¿Conviene el método avalancha o el de bola de nieve?',
      a: 'Avalancha (pagar primero la deuda de mayor tasa) siempre paga menos interés total, porque ataca la que se multiplica más rápido. Bola de nieve (empezar por la de menor saldo) cierra deudas antes y sostiene el hábito. Con las dos se paga lo mismo por mes: lo único que cambia es a dónde va el excedente por encima de los mínimos.',
    },
    {
      q: '¿Cuándo conviene refinanciar una deuda?',
      a: 'Cuando baja el costo TOTAL, no cuando baja la cuota. Comparar cuota contra cuota engaña: estirar el plazo siempre baja la cuota y casi siempre sube los intereses. La comparación válida es cuota × cantidad de cuotas más los gastos de otorgamiento, y entre entidades hay que mirar el CFT, no la TNA.',
    },
    {
      q: '¿Me pueden cobrar una comisión por cancelar el préstamo antes?',
      a: 'Sí, pero con tope. Según la comunicación "A" 5460 del BCRA, si precancelás cuando ya transcurrió más de la cuarta parte del plazo original o más de 180 días desde el otorgamiento, la entidad no puede cobrarte comisión alguna. En los demás casos la comisión no puede superar el 4% del capital que devolvés anticipadamente.',
    },
    {
      q: '¿A los cuántos años prescribe una deuda en Argentina?',
      a: 'El Código Civil y Comercial fija un plazo genérico de 5 años (art. 2560). El saldo de tarjeta de crédito y el reclamo de cheques prescriben al año, los créditos laborales y las deudas comerciales periódicas a los 2 años, y el pagaré a los 3. La prescripción no opera sola: hay que oponerla como defensa, y cualquier pago, reconocimiento o demanda reinicia el conteo desde cero.',
    },
    {
      q: '¿Qué interés te pueden reclamar si la deuda va a juicio?',
      a: 'El interés judicial se liquida como interés simple: capital × (tasa anual ÷ 365) × días de mora. La doctrina más extendida en los fueros nacionales es la tasa activa del Banco Nación según el plenario "Samudio de Martínez" (2009); en CABA el plenario "Eiben" ordena el promedio entre la activa BNA y la pasiva BCRA. En materia laboral, la CSJN en "Oliva c/ Coma" (2024) invalidó la capitalización periódica del Acta CNAT 2764. Cada juzgado puede ordenar otra tasa: la liquidación oficial manda.',
    },
    {
      q: '¿Diferencia entre TNA, TEA y CFT?',
      a: 'La TNA es la tasa nominal anual sin capitalizar; la TEA incorpora el efecto de capitalizar los intereses mes a mes y por eso siempre es mayor. El CFT (Costo Financiero Total) suma además IVA sobre los intereses, seguros, gastos de otorgamiento y cargos administrativos: es el único número comparable entre dos ofertas y el banco está obligado a informarlo antes de firmar.',
    },
    {
      q: '¿Conviene cancelar el préstamo o invertir esa plata?',
      a: 'Se comparan dos tasas. Si el rendimiento neto de tu inversión supera la tasa efectiva del crédito, conviene invertir y seguir pagando las cuotas. Si el crédito sale más caro que lo que rinde tu plata —lo habitual con tarjetas y préstamos personales—, cancelar es el mejor "rendimiento" disponible y además libre de riesgo.',
    },
    {
      q: '¿Me pueden llamar o ir a mi casa a cobrarme?',
      a: 'Pueden reclamarte el pago, pero no hostigarte. La Ley 24.240 de Defensa del Consumidor (art. 8 bis) prohíbe las prácticas vergonzantes, vejatorias o intimidatorias en el cobro de deudas, y las comunicaciones que simulan ser notificaciones judiciales. Ese tipo de reclamos se denuncia ante Defensa del Consumidor.',
    },
    {
      q: '¿Cuánto tiempo figura una deuda en el Veraz o en la Central de Deudores del BCRA?',
      a: 'La Central de Deudores del BCRA muestra los últimos 24 meses de historial. En las bases privadas de crédito rige el "derecho al olvido" del art. 26 de la Ley 25.326: los datos negativos se conservan 5 años, o 2 años desde que la deuda fue cancelada o extinguida.',
    },
  ],

  sources: [
    {
      name: 'Comunicación "A" 5460 — Protección de los usuarios de servicios financieros (precancelación y CFT)',
      url: 'https://www.bcra.gob.ar/Pdfs/comytexord/A5460.pdf',
      publisher: 'BCRA',
      date: '19-07-2013',
    },
    {
      name: 'Central de Deudores del Sistema Financiero',
      url: 'https://www.bcra.gob.ar/BCRAyVos/Situacion_Crediticia.asp',
      publisher: 'BCRA',
    },
    {
      name: 'Código Civil y Comercial de la Nación — prescripción liberatoria (arts. 2560 a 2564)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 25.065 de Tarjetas de Crédito — intereses compensatorios y punitorios (arts. 16 a 21)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/55000-59999/55556/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Ley 24.240 de Defensa del Consumidor — trato digno en el cobro de deudas (art. 8 bis)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/638/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Tasas de interés por préstamos y tarjetas informadas por las entidades financieras',
      url: 'https://www.bcra.gob.ar/BCRAyVos/Estadisticas-tasas-de-interes-por-prestamos.asp',
      publisher: 'BCRA',
    },
  ],

  replaces: [
    '/calculadora-interes-judicial-tasa',
    '/calculadora-deuda-tarjeta-pago-minimo-meses',
    '/calculadora-plazo-prescripcion-deuda',
    '/calculadora-deuda-avalancha-vs-bola-nieve-comparar',
    '/calculadora-refinanciacion-prestamo',
    '/calculadora-cancelacion-anticipada-prestamo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Parámetros por rama.
 *  - piso: piso de pago mensual que toman los resúmenes reales (rama del mínimo).
 *  - maxMeses: tope de la simulación (50 años), igual que la fórmula original.
 */
export const SIM = {
  piso: 1000,
  maxMeses: 600,
};

/** Comisión máxima por precancelación cuando corresponde cobrarla (com. "A" 5460 BCRA). */
export const TOPE_COMISION_PRECANCELACION = 0.04;
