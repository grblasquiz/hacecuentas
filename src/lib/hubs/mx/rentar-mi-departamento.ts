import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "Rento un depa: ¿cuánto ISR y cuánto predial pago?"
 *
 * Fusiona el ISR por arrendamiento de personas físicas (LISR Arts. 114-118): la elección
 * entre deducción ciega del 35% y deducciones reales, el pago provisional mensual o
 * trimestral con la retención del 10% del inquilino persona moral, el acumulado del
 * ejercicio, y el predial que se paga por el inmueble y que además es deducible.
 *
 * Tarifa de ISR y deducción ciega desde la fuente única src/lib/data/mexico-2026.ts.
 * Tabla de predial de la CDMX: Código Fiscal de la Ciudad de México, Arts. 130 y 131.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/**
 * Tarifa mensual del ISR (Art. 96 LISR, Anexo 8 RMF 2026) con el último límite superior
 * finito: `define:vars` serializa a JSON y ahí `Infinity` se convierte en `null`.
 */
const TARIFA_MENSUAL = MEXICO_2026.isrTarifaMensual.map(([inf, sup, cuota, tasa]) => [
  inf,
  Number.isFinite(sup) ? sup : 1e15,
  cuota,
  tasa,
]);

/**
 * Tarifa BIMESTRAL de predial de la Ciudad de México — Art. 130 del Código Fiscal de la
 * CDMX: [límite inferior, límite superior, cuota fija, factor sobre el excedente].
 * Es la única tabla municipal verificable en una norma publicada; para el resto de los
 * municipios el hub deja la tasa editable en vez de inventar una.
 */
const PREDIAL_CDMX = [
  [0, 260506, 245.04, 0.000376],
  [260506, 521011, 342.85, 0.000855],
  [521011, 782213, 565.44, 0.001219],
  [782213, 1043022, 884.2, 0.00162],
  [1043022, 1303830, 1306.71, 0.00179],
  [1303830, 2608012, 1773.69, 0.002085],
  [2608012, 5216724, 4493.27, 0.002295],
  [5216724, 13041810, 10481.05, 0.00251],
  [13041810, 26083621, 30121.45, 0.0027],
  [26083621, 1e15, 65334.32, 0.0029],
];

/** Reducciones por uso habitacional — Art. 131 del Código Fiscal de la CDMX. */
const REDUCCION_CDMX = [
  [1303830, 0.3],
  [1955745, 0.25],
  [2608012, 0.2],
];

export const RENTA_MX = {
  tarifaMensual: TARIFA_MENSUAL,
  /** Deducción opcional sin comprobantes — LISR Art. 115, último párrafo. */
  deduccionCiega: MEXICO_2026.arrendamiento.deduccionCiega,
  /** Retención del inquilino persona moral, acreditable — LISR Art. 116. */
  retencionPersonaMoral: MEXICO_2026.arrendamiento.retencionPersonaMoral,
  /** Umbral para optar por pagos trimestrales — LISR Art. 116. */
  salarioMinimoMensual: MEXICO_2026.salarioMinimo.generalMensual,
  vecesSmTrimestral: 10,
  predialCdmx: PREDIAL_CDMX,
  reduccionCdmx: REDUCCION_CDMX,
  bimestresPorAnio: 6,
};

export const hub: HubData = {
  slug: 'mx/impuestos/rentar-mi-departamento',
  title: 'Rentar un departamento en México: ISR de arrendamiento, deducción ciega y predial',
  description:
    'Cuánto ISR pagas por rentar, si te conviene la deducción ciega del 35% o las deducciones reales, cuánto te retiene un inquilino persona moral y cuánto predial pagas por el inmueble.',
  silo: 'Impuestos',
  siloHref: '/mx/impuestos',

  eyebrow: 'México · Arrendamiento',
  h1: 'Rento un depa: ¿cuánto ISR y cuánto predial pago?',
  lede:
    'Rentar es el único ingreso donde puedes elegir cómo deducir sin justificar nada: el 35% ciego. A veces conviene y a veces no. Y el predial, además de ser un gasto, se descuenta en las dos opciones.',
  stamps: [
    'Deducción ciega del 35% + predial · LISR Art. 115',
    'Retención del 10% de persona moral · Art. 116',
    'Tarifa mensual del ISR · Art. 96, Anexo 8 RMF',
    '5 calculadoras fusionadas',
  ],

  resultLabel: 'Impuesto estimado',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro: 'Empezamos por el pago del mes, que es el que se vence primero.',
    items: [
      {
        id: 'provisional',
        label: 'Mi pago provisional del mes',
        hint: 'Cuánto entero este mes y si puedo pagar por trimestre.',
        yes: [
          'Deducción del período: 35% ciego más predial, o tus gastos comprobables más predial',
          'Base gravable del mes y ISR causado con la tarifa mensual',
          'Retención del 10% cuando tu inquilino es persona moral, acreditable contra el pago',
          'Cuánto enteras efectivamente y si puedes optar por pagos trimestrales',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El predial se resta en las dos opciones, no solo en las deducciones reales: mucha gente lo pierde por no cargarlo cuando elige la ciega',
          'La retención del 10% se calcula sobre el ingreso bruto, no sobre la base gravable: si tu base es chica, la retención puede superar tu ISR causado y dejarte saldo a favor',
          'La opción de deducciones se ejerce por el ejercicio completo: no puedes cambiar de ciega a reales mes a mes según convenga',
        ],
        plazo: 'el pago provisional se entera a más tardar el día 17 del mes siguiente al que corresponde.',
        answer:
          'Se resta la deducción elegida del ingreso del mes, se aplica la tarifa mensual y del resultado se descuenta la retención del inquilino persona moral.',
      },
      {
        id: 'comparar',
        label: '¿Deducción ciega del 35% o deducciones reales?',
        hint: 'La comparación que decide tu impuesto de todo el año.',
        yes: [
          'ISR del período con la deducción ciega del 35% más predial',
          'ISR del período con tus gastos comprobables más predial',
          'Cuál te conviene y cuánto ahorras al año con la opción correcta',
          'Acumulado del ejercicio para los meses que llevas rentando',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las deducciones reales exigen CFDI a tu nombre, pago bancarizado cuando la ley lo pide y que el gasto corresponda al inmueble arrendado: sin eso no son deducibles aunque los hayas pagado',
          'Entre las deducciones reales entran el predial, el mantenimiento, los seguros, los intereses reales del crédito y la depreciación de la construcción; el terreno no se deprecia',
          'La ciega gana casi siempre en departamentos nuevos sin crédito y pierde en inmuebles con hipoteca reciente, donde los intereses solos superan el 35%',
          'La comparación es del ISR del arrendamiento aislado: si tienes sueldo u otros ingresos, la acumulación anual puede cambiar cuál te conviene',
        ],
        plazo: 'la opción se elige al presentar el primer pago provisional del ejercicio y se mantiene todo el año.',
        answer:
          'Conviene la ciega cuando tus gastos comprobables no llegan al 35% de la renta; si los superan, convienen las reales.',
      },
      {
        id: 'predial',
        label: 'Cuánto predial pago por el inmueble',
        hint: 'Tabla de la CDMX o tasa de tu municipio, y cómo lo deduces.',
        yes: [
          'Predial bimestral y anual según el valor catastral',
          'Reducción por uso habitacional cuando aplica',
          'Descuento por pago anticipado del ejercicio completo',
          'Cuánto de ese predial te regresa como deducción del ISR de arrendamiento',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El predial es un impuesto local: solo la tarifa de la Ciudad de México está tomada de una norma publicada, y para cualquier otro municipio el hub te deja poner la tasa en vez de inventarla',
          'La base es el valor catastral, no el valor comercial ni el precio que pagaste: suelen diferir muchísimo y usar el precio de compra infla el resultado',
          'Las reducciones por uso habitacional, jubilados, adultos mayores y otros supuestos dependen de cada legislación local y de que hagas el trámite: no se aplican solas',
          'El descuento por pago anual anticipado existe en varias tesorerías pero cambia de porcentaje y de fecha límite cada ejercicio: verifícalo antes de asumirlo',
        ],
        plazo: 'el predial se causa por bimestre; el pago anual anticipado con descuento suele vencer en los primeros meses del año.',
        answer:
          'El predial se calcula sobre el valor catastral con una tarifa progresiva y, si rentas el inmueble, se deduce del ISR de arrendamiento.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu renta',
  inputsIntro: 'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto.',
  fields: [
    {
      id: 'renta',
      label: 'Renta mensual que cobras (MXN)',
      prefix: '$',
      value: 18000,
      thousands: true,
      help: 'El ingreso bruto del mes, antes de cualquier descuento.',
    },
    {
      id: 'tipoDeduccion',
      label: 'Cómo quieres deducir',
      type: 'select',
      value: 'ciega',
      options: [
        { value: 'ciega', label: 'Deducción ciega del 35% + predial' },
        { value: 'reales', label: 'Deducciones reales comprobadas + predial' },
      ],
      help: 'La opción se elige por el ejercicio completo.',
    },
    {
      id: 'predialAnual',
      label: 'Predial que pagas al año (MXN)',
      prefix: '$',
      value: 4800,
      thousands: true,
      help: 'Se deduce en las dos opciones, mensualizado.',
    },
    {
      id: 'gastosReales',
      label: 'Gastos comprobables del mes, sin predial (MXN)',
      prefix: '$',
      value: 3500,
      thousands: true,
      help: 'Mantenimiento, seguros, intereses reales del crédito y depreciación.',
    },
    {
      id: 'tipoInquilino',
      label: '¿Quién es tu inquilino?',
      type: 'select',
      value: 'fisica',
      options: [
        { value: 'fisica', label: 'Una persona física — no retiene' },
        { value: 'moral', label: 'Una empresa o persona moral — retiene el 10%' },
      ],
      help: 'La persona moral está obligada a retenerte y a darte el comprobante.',
    },
    {
      id: 'meses',
      label: 'Meses del período que quieres acumular',
      value: 12,
      min: 1,
      max: 12,
      step: 1,
      help: 'Para ver el acumulado del ejercicio en la comparación.',
    },
    {
      id: 'valorCatastral',
      label: 'Valor catastral del inmueble (MXN)',
      prefix: '$',
      value: 1400000,
      thousands: true,
      help: 'El de tu boleta predial, no el precio de compra.',
    },
    {
      id: 'municipio',
      label: 'Dónde está el inmueble',
      type: 'select',
      value: 'cdmx',
      options: [
        { value: 'cdmx', label: 'Ciudad de México — tarifa del Código Fiscal local' },
        { value: 'otro', label: 'Otro municipio — pongo la tasa yo' },
      ],
      help: 'Solo la tarifa de la CDMX está tomada de una norma publicada.',
    },
    {
      id: 'tasaPredialOtro',
      label: 'Tasa anual de predial de tu municipio',
      suffix: '%',
      value: 0.15,
      min: 0,
      max: 5,
      step: 0.001,
      help: 'Búscala en la ley de ingresos de tu municipio; solo se usa si elegiste "otro".',
    },
    {
      id: 'usoInmueble',
      label: 'Uso del inmueble',
      type: 'select',
      value: 'habitacional',
      options: [
        { value: 'habitacional', label: 'Habitacional — puede tener reducción' },
        { value: 'noHabitacional', label: 'No habitacional — sin reducción' },
      ],
      help: 'Rentar para vivienda sigue siendo uso habitacional.',
    },
    {
      id: 'descuentoAnticipado',
      label: 'Descuento por pago anual anticipado',
      suffix: '%',
      value: 0,
      min: 0,
      max: 50,
      step: 0.5,
      help: 'Ponelo solo si tu tesorería lo publicó para este ejercicio.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde va cada peso de la renta',
    caption: 'Compara lo que conservas contra lo que se va en impuestos y en gastos deducibles.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto ISR se paga por rentar un departamento en México?',
      a: 'No hay una tasa fija: se resta la deducción que elijas del ingreso del período y al resultado se le aplica la tarifa progresiva del impuesto sobre la renta. Con la deducción ciega del 35% más el predial, la tasa efectiva sobre la renta cobrada suele quedar en un dígito bajo para rentas modestas y sube conforme crece el ingreso.',
    },
    {
      q: '¿Qué es la deducción ciega del 35%?',
      a: 'Es una opción de la ley que te deja restar el 35% de tus ingresos por arrendamiento sin comprobar un solo gasto, más el impuesto predial efectivamente pagado. Se llama ciega precisamente porque la autoridad no te pide ver nada: es una simplificación pensada para arrendadores pequeños que no quieren llevar control de facturas.',
    },
    {
      q: '¿Me conviene la ciega o las deducciones reales?',
      a: 'La regla práctica es comparar tus gastos comprobables con el 35% de la renta. Si no llegas a ese 35%, la ciega te conviene y además te ahorra el trabajo de juntar comprobantes. Si lo superas, conviene la real: pasa típicamente cuando el inmueble tiene una hipoteca reciente, porque los intereses reales de los primeros años son altos.',
    },
    {
      q: '¿El predial se deduce si elijo la deducción ciega?',
      a: 'Sí, y es la parte que más se pierde por desconocimiento. La ley permite restar el predial efectivamente pagado además del 35%, no en lugar de él. Guarda el comprobante de pago del predial aunque hayas elegido la opción sin comprobantes.',
    },
    {
      q: '¿Por qué mi inquilino me retiene el 10%?',
      a: 'Porque cuando el arrendatario es persona moral la ley lo obliga a retener el 10% del monto del arrendamiento y enterarlo al fisco, además de darte la constancia. No es un impuesto adicional: es un anticipo de tu propio impuesto, que descuentas del pago provisional. Si la retención supera lo que causas, te queda saldo a favor.',
    },
    {
      q: '¿Puedo pagar el ISR de arrendamiento por trimestre?',
      a: 'Sí, si tus ingresos mensuales por arrendamiento no exceden diez salarios mínimos generales elevados al mes. Es una opción pensada para arrendadores chicos que evita doce trámites al año, aunque no cambia el monto del impuesto ni exime de emitir el CFDI por cada renta cobrada.',
    },
    {
      q: '¿Tengo que dar factura por la renta?',
      a: 'Sí. Cobrar renta obliga a emitir CFDI, y el inquilino lo necesita si quiere deducir el gasto. La falta del comprobante es de las causas más frecuentes de discrepancia detectada por el fisco, porque el depósito bancario existe aunque la factura no.',
    },
    {
      q: '¿Qué pasa si rento por plataformas o por temporadas cortas?',
      a: 'El hospedaje por plataformas digitales tiene reglas propias: la plataforma retiene y entera impuestos, hay obligaciones específicas de información y en varias entidades se causa además un impuesto local al hospedaje. El tratamiento de arrendamiento tradicional que calcula este hub no aplica igual a ese esquema.',
    },
    {
      q: '¿Cómo se calcula el predial?',
      a: 'Sobre el valor catastral del inmueble, con una tarifa que en la mayoría de las legislaciones locales es progresiva: una cuota fija por rango más un factor sobre el excedente. El valor catastral no es el valor comercial ni el precio que pagaste: normalmente es bastante menor, y usar el precio de compra infla mucho el resultado.',
    },
    {
      q: '¿Hay descuentos en el predial?',
      a: 'Casi todas las tesorerías ofrecen alguno: reducción por uso habitacional, descuento por pagar el año completo por anticipado, y beneficios para jubilados, pensionados, personas con discapacidad o adultos mayores. Casi ninguno se aplica solo: hay que hacer el trámite y, en varios casos, renovarlo cada ejercicio.',
    },
    {
      q: '¿El predial de un inmueble rentado lo paga el dueño o el inquilino?',
      a: 'El obligado es el propietario, porque el impuesto grava la propiedad, no el uso. Un contrato puede trasladarle el costo al inquilino como parte del acuerdo, pero frente a la tesorería el responsable sigue siendo el dueño, y es el dueño quien puede deducirlo del impuesto sobre la renta.',
    },
    {
      q: '¿Qué pasa si nunca declaré la renta que cobro?',
      a: 'Los depósitos recurrentes son de lo más fácil de detectar, y las diferencias no declaradas se determinan con actualización y recargos además de la sanción. Regularizarse antes de un requerimiento es sensiblemente más barato: se pueden presentar declaraciones de períodos anteriores y la corrección voluntaria reduce las multas.',
    },
  ],

  sources: [
    {
      name: 'Ley del Impuesto sobre la Renta — arrendamiento de inmuebles (Arts. 114-118)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'SAT — régimen de arrendamiento de inmuebles',
      url: 'https://www.sat.gob.mx/consultas/58840/regimen-de-arrendamiento',
      publisher: 'SAT',
    },
    {
      name: 'Código Fiscal de la Ciudad de México — impuesto predial (Arts. 126-131)',
      url: 'https://data.consejeria.cdmx.gob.mx/index.php/leyes/codigos/50-codigo-fiscal-del-distrito-federal',
      publisher: 'Consejería Jurídica CDMX',
    },
    {
      name: 'Tesorería de la Ciudad de México — pago del impuesto predial',
      url: 'https://data.finanzas.cdmx.gob.mx/sistema_predial/',
      publisher: 'Secretaría de Administración y Finanzas CDMX',
    },
  ],

  replaces: [
    '/calculadora-isr-arrendamiento-deduccion-ciega-mexico',
    '/calculadora-impuesto-cedular-arrendamiento-mexico',
    '/calculadora-pago-provisional-isr-arrendamiento-mexico-2026',
    '/calculadora-predial-cdmx-mexico',
    '/calculadora-predial-cdmx-monterrey-guadalajara-2026',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
