import type { HubData } from '../types';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Qué impuestos pago por tener, vender o heredar una propiedad?"
 *
 * Absorbe contribuciones (impuesto territorial), contribuciones morosas en la TGR,
 * impuesto al mayor valor por la venta, impuesto de timbres y estampillas del
 * crédito hipotecario e impuesto a las herencias y donaciones.
 *
 * Espejo de:
 *  - src/lib/formulas/impuesto-territorial-contribuciones-bienes-raices-chile.ts (CORREGIDO)
 *  - src/lib/formulas/contribuciones-morosas-tgr-chile.ts (COMPLETADO)
 *  - src/lib/formulas/impuesto-mayor-valor-venta-propiedad-chile-8000-uf.ts
 *  - src/lib/formulas/impuesto-timbres-estampillas-chile-credito-hipotecario.ts (CORREGIDO)
 *  - src/lib/formulas/impuesto-herencias-donaciones-chile-tabla.ts (REESCRITO)
 *
 * CORRECCIONES respecto de las fórmulas viejas (ver reporte):
 *  1. `impuesto-territorial` tenía `UF_2026 = 24.216,05`: un valor de hace más de
 *     una década (la UF viva ronda los $40.845). Con esa UF el "límite de
 *     exención" quedaba en ~$45 M en vez del que fija el SII.
 *  2. `impuesto-herencias` usaba `UTA_2026 = 30.440` cuando la UTA real ronda los
 *     $859.788: veintiocho veces menos.
 *  3. `impuesto-herencias` aplicaba tasas planas inventadas por parentesco (4%,
 *     10%, 15%, 16%, 17%, 25%) y declaraba EXENTO al cónyuge. La Ley 16.271
 *     aplica una escala progresiva en UTM a cada asignación, con una exención de
 *     50 UTM por asignatario para el cónyuge, el conviviente civil, los
 *     ascendientes y los descendientes, y recargos del 20% y del 40% para los
 *     colaterales y los extraños. El cónyuge NO está exento: tiene una exención
 *     de 50 UTM, que es otra cosa.
 *  4. `impuesto-herencias` daba un "descuento por antigüedad de la donación" del
 *     5% anual hasta 5 años. Ese descuento no existe en la Ley 16.271.
 *  5. `impuesto-timbres` cobraba 0,8% fijo a todo crédito hipotecario. El DL 3.475
 *     cobra 0,066% por mes o fracción con tope de 0,8%: un crédito de 6 meses paga
 *     la mitad. Además omitía las exenciones del refinanciamiento hipotecario y
 *     de los mutuos con subsidio habitacional.
 *  6. `contribuciones-morosas` aplicaba reajuste e interés penal pero omitía la
 *     multa del Art. 53 inc. 3 del Código Tributario.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Indicadores vivos (mindicador.cl), con el mismo fallback que las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UTM = (clLive as any)?.utm?.valor ?? 71649;
export const UTA = (clLive as any)?.uta?.valor ?? 859788;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

/**
 * Impuesto territorial — Ley 17.235.
 * Las tasas por defecto son las que traía la fórmula original y son campos
 * EDITABLES: el SII las fija por decreto y las reajusta, y hay tramos y
 * sobretasas que dependen del avalúo. Verificá tu tasa en el certificado de
 * avalúo antes de presupuestar.
 */
export const TERRITORIAL = {
  tasaHabitacionalDefault: 0.933,
  tasaNoHabitacionalDefault: 1.075,
  cuotasAlAnio: 4,
  mesesCuotas: 'abril, junio, septiembre y noviembre',
};

/**
 * Recargos de la TGR sobre contribuciones morosas — Código Tributario Art. 53.
 * Interés penal del 1,5% por cada mes o fracción sobre el monto reajustado, más
 * la multa del inciso 3: 10% del impuesto reajustado, con un 2% adicional por
 * cada mes de retardo y un tope del 30%.
 */
export const MORA_TGR = {
  interesMensual: 0.015,
  multaBase: 0.1,
  multaPorMes: 0.02,
  multaTope: 0.3,
};

/** Mayor valor en la venta de un bien raíz — Art. 17 N°8 letra b) LIR. */
export const MAYOR_VALOR = {
  exencionUf: 8000,
  tasaImpuestoUnico: 0.1,
};

/**
 * Impuesto de timbres y estampillas — DL 3.475.
 * Operaciones de crédito de dinero a plazo: 0,066% por mes o fracción, con tope
 * de 0,8%. Documentos a la vista o sin plazo de vencimiento: 0,332%.
 */
export const TIMBRES = {
  tasaMensual: 0.00066,
  tope: 0.008,
  tasaALaVista: 0.00332,
};

/**
 * Impuesto a las herencias y donaciones — Ley 16.271 Art. 2.
 * Escala progresiva sobre CADA asignación, expresada en UTM, con deducción fija
 * por tramo para dar continuidad.
 */
export const HERENCIA_TRAMOS: Array<{ hastaUtm: number | null; tasa: number; deduccionUtm: number }> = [
  { hastaUtm: 80, tasa: 0.01, deduccionUtm: 0 },
  { hastaUtm: 160, tasa: 0.025, deduccionUtm: 1.2 },
  { hastaUtm: 320, tasa: 0.05, deduccionUtm: 5.2 },
  { hastaUtm: 480, tasa: 0.075, deduccionUtm: 13.2 },
  { hastaUtm: 640, tasa: 0.1, deduccionUtm: 25.2 },
  { hastaUtm: 800, tasa: 0.15, deduccionUtm: 57.2 },
  { hastaUtm: 1200, tasa: 0.2, deduccionUtm: 97.2 },
  { hastaUtm: null, tasa: 0.25, deduccionUtm: 157.2 },
];

/**
 * Exenciones y recargos por parentesco — Ley 16.271 Arts. 2 y 3.
 * El cónyuge NO está exento: tiene la exención de 50 UTM por asignación, igual
 * que ascendientes y descendientes.
 */
export const HERENCIA_PARENTESCO: Array<{
  id: string;
  label: string;
  exencionUtm: number;
  recargo: number;
}> = [
  { id: 'conyuge', label: 'Cónyuge o conviviente civil', exencionUtm: 50, recargo: 0 },
  { id: 'descendiente', label: 'Hijo, nieto u otro descendiente', exencionUtm: 50, recargo: 0 },
  { id: 'ascendiente', label: 'Padre, madre, abuelo u otro ascendiente', exencionUtm: 50, recargo: 0 },
  { id: 'colateral', label: 'Hermano, sobrino, tío o primo (2°, 3° o 4° grado)', exencionUtm: 0, recargo: 0.2 },
  { id: 'extrano', label: 'Sin parentesco o de grado más lejano', exencionUtm: 0, recargo: 0.4 },
];

/** Exención de las donaciones, en UTM — Ley 16.271. */
export const DONACION_EXENTA_UTM = 5;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
slug: 'cl/impuestos/impuestos-de-mi-propiedad',
  title: 'Impuestos de una propiedad en Chile: contribuciones, mayor valor, timbres y herencia',
  description:
    'Calcula tus contribuciones anuales y su morosidad en la TGR, el impuesto al mayor valor por vender con la exención de 8.000 UF, el impuesto de timbres del crédito hipotecario y el impuesto a las herencias con la escala real en UTM de la Ley 16.271.',
  silo: 'Impuestos',
  siloHref: '/cl/impuestos',
  locale: 'cl',

  eyebrow: 'Chile · SII · TGR · bienes raíces',
  h1: '¿Qué impuestos pago por tener, vender o heredar una propiedad?',
  lede:
    'Una propiedad paga impuestos en tres momentos: mientras la tienes (contribuciones), cuando la compras con crédito (timbres), y cuando la vendes o la heredas. Elige el momento en el que estás y mira el número con el artículo que lo respalda.',
  stamps: [
    `UF de hoy: $${UF.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `UTM del mes: ${fmt(UTM)}`,
    `Exención del mayor valor: ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF de por vida`,
    'Ley 17.235 · Art. 17 N°8 LIR · DL 3.475 · Ley 16.271',
    '5 casos en una sola página',
  ],

  resultLabel: 'Impuesto estimado',

  cases: {
    title: '¿En qué momento estás?',
    intro:
      'Partimos por el impuesto que se paga todos los años: las contribuciones de bienes raíces.',
    items: [
      {
        id: 'contribuciones',
        label: 'Tengo la propiedad y pago contribuciones',
        hint: 'Impuesto territorial anual sobre el avalúo fiscal, en cuatro cuotas.',
        yes: [
          'Contribución anual: avalúo fiscal por la tasa que corresponda a tu tipo de propiedad',
          `Valor de cada una de las ${TERRITORIAL.cuotasAlAnio} cuotas`,
          'Recargos adicionales que apliquen a tu propiedad',
          'Tasa efectiva sobre el avalúo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El monto exento habitacional lo fija el SII en pesos y lo reajusta cada semestre: búscalo en tu certificado de avalúo o en sii.cl y ponlo en el campo correspondiente, porque este hub no lo puede dar por ti',
          'La calculadora anterior de este sitio calculaba ese monto con una UF de $24.216, que es un valor de hace más de una década',
          'Las tasas por defecto son editables: hay tramos de avalúo con tasas distintas y sobretasas para propiedades de alto valor',
          `Las cuotas se pagan en ${TERRITORIAL.mesesCuotas}`,
          'Los predios agrícolas, los de uso habitacional bajo el exento y algunos usos especiales tienen tratamiento propio',
        ],
        plazo:
          `las cuatro cuotas del impuesto territorial vencen en ${TERRITORIAL.mesesCuotas} de cada año.`,
        answer:
          'Las contribuciones son el avalúo fiscal por la tasa del impuesto territorial, pagadas en cuatro cuotas al año.',
      },
      {
        id: 'morosas',
        label: 'Debo contribuciones atrasadas',
        hint: 'La TGR reajusta por IPC, cobra interés penal del 1,5% mensual y además una multa.',
        yes: [
          'Reajuste del capital por la variación del IPC desde el vencimiento',
          `Interés penal del ${MORA_TGR.interesMensual * 100}% por cada mes o fracción sobre el monto reajustado`,
          `Multa del ${MORA_TGR.multaBase * 100}% más ${MORA_TGR.multaPorMes * 100}% por mes de retardo, con tope del ${MORA_TGR.multaTope * 100}%`,
          'Total a pagar hoy y cuánto de eso son recargos',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La calculadora anterior de este sitio omitía la multa del Art. 53 inciso 3 del Código Tributario: el total salía entre un 10% y un 30% más barato de lo real',
          'El interés se cuenta por mes o fracción: un día de atraso en un mes nuevo cuenta como mes completo',
          'La deuda de contribuciones sigue a la propiedad: si compras un inmueble con contribuciones impagas, la deuda te alcanza',
          'La TGR ofrece convenios de pago que congelan los recargos: conviene consultarlos antes de que la deuda vaya a cobranza judicial',
        ],
        plazo:
          'la TGR puede iniciar cobranza judicial y rematar la propiedad por contribuciones impagas: el convenio de pago detiene el proceso.',
        answer:
          'Una contribución morosa acumula reajuste por IPC, interés penal del 1,5% mensual y una multa que llega hasta el 30%.',
      },
      {
        id: 'vender',
        label: 'Voy a vender la propiedad',
        hint: 'Las personas naturales tienen una exención de 8.000 UF de mayor valor, de por vida.',
        yes: [
          'Mayor valor: precio de venta menos costo de adquisición reajustado y mejoras acreditadas',
          `Exención de ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF de por vida, no por operación`,
          `Impuesto Único y Sustitutivo del ${MAYOR_VALOR.tasaImpuestoUnico * 100}% sobre el excedente`,
          'Ganancia neta que te queda después del impuesto',
        ],
        warn: [
          DISCLAIMER_TAX,
          `La exención de ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF es un cupo de por vida por contribuyente: se consume con cada venta y no se renueva`,
          'El costo de adquisición se reajusta por IPC y se le pueden sumar las mejoras que aumenten el valor, siempre que estén acreditadas y declaradas en el SII',
          `El ${MAYOR_VALOR.tasaImpuestoUnico * 100}% es una opción: la alternativa es llevar el mayor valor al Global Complementario reliquidado en hasta 10 años, que puede convenir si tu tasa marginal es baja`,
          'El régimen del Art. 17 N°8 aplica a inmuebles adquiridos después del 1 de enero de 2004: los anteriores tienen reglas de transición propias',
          'Si vendes de forma habitual o dentro de una empresa, no aplica este régimen sino el de Primera Categoría',
        ],
        plazo:
          'el mayor valor se declara en el Formulario 22 del año siguiente al de la venta.',
        answer:
          `Las personas naturales tienen ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF de mayor valor exentas de por vida; sobre el excedente se paga un impuesto único del ${MAYOR_VALOR.tasaImpuestoUnico * 100}%.`,
      },
      {
        id: 'timbres',
        label: 'Voy a tomar un crédito hipotecario',
        hint: 'El impuesto de timbres es 0,066% por mes o fracción, con tope de 0,8%.',
        yes: [
          `Impuesto de timbres: ${TIMBRES.tasaMensual * 100}% del monto por cada mes o fracción de plazo`,
          `Tope legal del ${TIMBRES.tope * 100}%, que se alcanza a los 13 meses de plazo`,
          'Las exenciones que pueden dejarlo en cero',
          'Cuánto representa sobre el monto del crédito',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La calculadora anterior de este sitio cobraba 0,8% fijo a todo crédito hipotecario: un crédito a 6 meses paga menos de la mitad de eso',
          'El refinanciamiento de un crédito hipotecario está exento del impuesto de timbres en la parte refinanciada (Art. 24 DL 3.475)',
          'Los mutuos para adquirir viviendas con subsidio habitacional también tienen exención',
          `Los documentos a la vista o sin plazo de vencimiento pagan una tasa distinta, del ${TIMBRES.tasaALaVista * 100}%`,
          'El impuesto de timbres se paga una sola vez, al momento de otorgar el crédito, y suele estar incluido en los gastos operacionales del banco',
        ],
        plazo:
          'el impuesto se entera al momento del otorgamiento del crédito: normalmente lo retiene y paga el banco.',
        answer:
          `El impuesto de timbres es ${TIMBRES.tasaMensual * 100}% del monto por mes o fracción, con tope de ${TIMBRES.tope * 100}%, y hay exenciones para el refinanciamiento.`,
      },
      {
        id: 'heredar',
        label: 'Heredé o me van a donar la propiedad',
        hint: 'Escala progresiva en UTM sobre cada asignación, con exenciones y recargos por parentesco.',
        yes: [
          'Escala progresiva de la Ley 16.271, del 1% al 25%, aplicada a tu asignación',
          'Exención de 50 UTM para cónyuge, conviviente civil, ascendientes y descendientes',
          'Recargo del 20% para los colaterales y del 40% para los extraños',
          'Impuesto neto y lo que efectivamente recibes',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El cónyuge NO está exento del impuesto a la herencia: tiene una exención de 50 UTM sobre su asignación, que es otra cosa. La calculadora anterior de este sitio lo declaraba exento por completo',
          'El impuesto se calcula sobre CADA asignación por separado, no sobre el total de la masa hereditaria: tener más herederos suele bajar el impuesto total',
          'Las donaciones que el causante hizo en vida a un mismo asignatario se acumulan a la herencia para determinar la tasa',
          'Las donaciones tienen una exención más baja, de 5 UTM, y requieren trámite de insinuación ante el tribunal',
          'No existe el "descuento por antigüedad de la donación" del 5% anual que aplicaba la calculadora anterior',
          'Las deudas hereditarias y los gastos de última enfermedad y sepultación se rebajan de la masa antes de repartir',
        ],
        plazo:
          'el impuesto a la herencia se declara y paga dentro de los 2 años siguientes al fallecimiento; después corren reajustes e intereses.',
        answer:
          'El impuesto a la herencia es una escala progresiva del 1% al 25% sobre cada asignación, con 50 UTM exentas para el cónyuge y los descendientes.',
      },
    ],
  },

  inputsTitle: 'Datos de la propiedad',
  inputsIntro:
    'Según el caso que elijas, algunos campos quedan sin efecto. El monto exento de las contribuciones lo tienes que traer del SII: no está fijado en UF ni en UTM y cambia cada semestre.',
  fields: [
    {
      id: 'avaluo',
      label: 'Avalúo fiscal de la propiedad',
      type: 'number',
      value: 90000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'El que aparece en tu certificado de avalúo del SII, no el valor comercial.',
    },
    {
      id: 'exentoAvaluo',
      label: 'Monto exento habitacional vigente',
      type: 'number',
      value: 0,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Lo fija el SII en pesos y lo reajusta cada semestre. Búscalo en sii.cl y ponlo acá: si lo dejas en cero, el cálculo asume que no aplica.',
    },
    {
      id: 'tipoPropiedad',
      label: 'Destino de la propiedad',
      type: 'select',
      value: 'habitacional',
      options: [
        { value: 'habitacional', label: 'Habitacional' },
        { value: 'no_habitacional', label: 'No habitacional (comercial, industrial, sitio eriazo)' },
      ],
    },
    {
      id: 'tasaTerritorial',
      label: 'Tasa anual del impuesto territorial',
      type: 'number',
      value: TERRITORIAL.tasaHabitacionalDefault,
      suffix: '%',
      min: 0,
      max: 3,
      step: 0.001,
      help: 'Valor editable: revisa la tasa que aparece en tu certificado de avalúo, porque hay tramos y sobretasas.',
    },
    {
      id: 'cuotaVencida',
      label: 'Cuota de contribuciones adeudada',
      type: 'number',
      value: 200000,
      prefix: '$',
      min: 0,
      step: 10000,
      thousands: true,
      help: 'El monto original de la cuota vencida, sin recargos.',
    },
    {
      id: 'mesesAtraso',
      label: 'Meses de atraso',
      type: 'number',
      value: 6,
      min: 0,
      max: 120,
      step: 1,
      help: 'Se cuenta por mes o fracción: un día del mes nuevo cuenta como mes completo.',
    },
    {
      id: 'ipcAcumulado',
      label: 'Reajuste por IPC acumulado desde el vencimiento',
      type: 'number',
      value: 2,
      suffix: '%',
      min: 0,
      max: 200,
      step: 0.1,
      help: 'Lo determina la TGR. Puedes estimarlo con la variación del IPC del INE del período.',
    },
    {
      id: 'precioVenta',
      label: 'Precio de venta',
      type: 'number',
      value: 180000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'El precio de la escritura de compraventa.',
    },
    {
      id: 'costoAdquisicion',
      label: 'Costo de adquisición reajustado y mejoras',
      type: 'number',
      value: 110000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Lo que pagaste, reajustado por IPC, más las mejoras acreditadas y declaradas al SII.',
    },
    {
      id: 'cupoUsadoUf',
      label: 'UF del cupo de 8.000 que ya usaste',
      type: 'number',
      value: 0,
      suffix: 'UF',
      min: 0,
      max: 8000,
      step: 100,
      help: 'El cupo es de por vida: se consume con cada venta anterior que hayas hecho.',
    },
    {
      id: 'montoCredito',
      label: 'Monto del crédito hipotecario',
      type: 'number',
      value: 100000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'El capital del mutuo, no la cuota.',
    },
    {
      id: 'plazoMeses',
      label: 'Plazo del crédito',
      type: 'number',
      value: 240,
      suffix: 'meses',
      min: 1,
      max: 480,
      step: 1,
      help: 'El tope del 0,8% se alcanza a los 13 meses de plazo.',
    },
    {
      id: 'exencionTimbres',
      label: '¿Aplica alguna exención de timbres?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, es un crédito nuevo sin subsidio' },
        { value: 'si', label: 'Sí — refinanciamiento hipotecario o mutuo con subsidio' },
      ],
    },
    {
      id: 'asignacion',
      label: 'Valor de tu asignación hereditaria o de la donación',
      type: 'number',
      value: 150000000,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Lo que te toca a ti, no el total de la herencia. El impuesto se calcula por asignatario.',
    },
    {
      id: 'parentesco',
      label: 'Tu parentesco con el causante o donante',
      type: 'select',
      value: 'descendiente',
      options: HERENCIA_PARENTESCO.map((p) => ({ value: p.id, label: p.label })),
    },
    {
      id: 'esDonacion',
      label: '¿Es herencia o donación?',
      type: 'select',
      value: 'herencia',
      options: [
        { value: 'herencia', label: 'Herencia (exención de 50 UTM si eres cónyuge, ascendiente o descendiente)' },
        { value: 'donacion', label: `Donación (exención de ${DONACION_EXENTA_UTM} UTM)` },
      ],
    },
    {
      id: 'deudas',
      label: 'Deudas y gastos que se rebajan de tu asignación',
      type: 'number',
      value: 0,
      prefix: '$',
      min: 0,
      step: 1000000,
      thousands: true,
      help: 'Deudas hereditarias, gastos de última enfermedad y de sepultación, en la parte que te corresponda.',
    },
  ],
  fineprint:
    'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva. La UF y la UTM se actualizan a diario desde mindicador.cl, así que los topes y exenciones expresados en esas unidades cambian todos los días.',

  chart: {
    type: 'donut',
    title: 'Cuánto se lleva el impuesto',
    caption:
      'Muestra qué parte del valor en juego se va en impuesto y qué parte queda para ti, según el momento en que estés.',
  },
  breakdownTitle: 'El cálculo, línea por línea',
  breakdownIntro:
    'Cada fila indica la ley que la respalda. Los tramos de la herencia están en UTM y la exención del mayor valor en UF: en pesos se mueven todos los días.',

  faq: [
    {
      q: '¿Cómo se calculan las contribuciones de bienes raíces?',
      a: `Son el avalúo fiscal de la propiedad multiplicado por la tasa del impuesto territorial de la Ley 17.235, y se pagan en ${TERRITORIAL.cuotasAlAnio} cuotas al año, en ${TERRITORIAL.mesesCuotas}. Las propiedades habitacionales tienen un monto de avalúo exento que fija el SII en pesos y reajusta cada semestre.`,
    },
    {
      q: '¿Desde qué avalúo se pagan contribuciones?',
      a: 'Desde el monto exento habitacional que fija el SII, que se reajusta cada semestre y se publica en pesos, no en UF ni en UTM. Búscalo en tu certificado de avalúo o en sii.cl: por eso este hub te lo pide como dato en vez de estimarlo, y por eso la calculadora anterior, que lo derivaba de una UF desactualizada, daba un umbral equivocado.',
    },
    {
      q: '¿Qué recargos tiene una contribución morosa?',
      a: `Tres: el reajuste del capital por la variación del IPC entre el vencimiento y el pago, un interés penal del ${MORA_TGR.interesMensual * 100}% por cada mes o fracción sobre el monto reajustado, y la multa del Art. 53 inciso 3 del Código Tributario, que es un ${MORA_TGR.multaBase * 100}% más un ${MORA_TGR.multaPorMes * 100}% por cada mes de retardo, con tope del ${MORA_TGR.multaTope * 100}%.`,
    },
    {
      q: '¿Qué pasa si compro una casa con contribuciones impagas?',
      a: 'La deuda sigue a la propiedad. El impuesto territorial es un gravamen real sobre el inmueble: la TGR puede perseguir el pago contra el bien aunque tú no seas quien generó la deuda. Por eso el certificado de deuda de contribuciones es obligatorio en toda compraventa.',
    },
    {
      q: '¿Cuánto impuesto pago si vendo mi casa?',
      a: `Depende del mayor valor y de tu cupo. Las personas naturales tienen una exención de ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF de mayor valor de por vida, hoy ${fmt(MAYOR_VALOR.exencionUf * UF)}. Sobre el excedente puedes optar por un impuesto único y sustitutivo del ${MAYOR_VALOR.tasaImpuestoUnico * 100}% o por llevarlo al Global Complementario reliquidado en hasta 10 años.`,
    },
    {
      q: '¿La exención de 8.000 UF es por operación o por vida?',
      a: 'Por vida y por contribuyente. Cada venta consume parte del cupo y no se renueva: si en una venta anterior usaste 3.000 UF de mayor valor, te quedan 5.000 UF para el resto de tu vida. El SII lleva el registro del cupo consumido.',
    },
    {
      q: '¿Cuánto es el impuesto de timbres de un crédito hipotecario?',
      a: `El ${TIMBRES.tasaMensual * 100}% del monto por cada mes o fracción de plazo, con un tope del ${TIMBRES.tope * 100}% (DL 3.475). Como el tope se alcanza a los 13 meses, un crédito hipotecario a 20 años paga el ${TIMBRES.tope * 100}% completo, pero un crédito de 6 meses paga bastante menos.`,
    },
    {
      q: '¿Hay exenciones del impuesto de timbres?',
      a: 'Sí. El refinanciamiento de un crédito hipotecario está exento en la parte refinanciada (Art. 24 DL 3.475), y los mutuos destinados a adquirir viviendas con subsidio habitacional también tienen exención. Conviene preguntarlo antes de firmar, porque en un crédito grande son varios cientos de miles de pesos.',
    },
    {
      q: '¿El cónyuge paga impuesto a la herencia en Chile?',
      a: 'Sí. El cónyuge sobreviviente y el conviviente civil no están exentos: tienen una exención de 50 UTM sobre su asignación y quedan afectos a la escala progresiva de la Ley 16.271 por el resto. Es un error frecuente creer que están exentos por completo.',
    },
    {
      q: '¿Cuáles son las tasas del impuesto a la herencia?',
      a: 'Una escala progresiva en UTM sobre cada asignación: 1% hasta 80 UTM, 2,5% hasta 160, 5% hasta 320, 7,5% hasta 480, 10% hasta 640, 15% hasta 800, 20% hasta 1.200 y 25% de ahí en adelante. A eso se suma un recargo del 20% si eres colateral de segundo a cuarto grado y del 40% si no tienes parentesco.',
    },
    {
      q: '¿El impuesto a la herencia se calcula sobre el total o sobre lo que me toca?',
      a: 'Sobre cada asignación por separado. Por eso repartir la misma masa hereditaria entre más herederos suele bajar el impuesto total: cada uno usa su propia exención de 50 UTM y entra por los tramos bajos de la escala.',
    },
    {
      q: '¿Cuánto tiempo tengo para pagar el impuesto a la herencia?',
      a: 'Dos años desde el fallecimiento del causante. Pasado ese plazo, la deuda se reajusta y devenga intereses. Además, sin el pago del impuesto no se puede inscribir la propiedad a nombre de los herederos, así que la propiedad queda bloqueada para vender o hipotecar.',
    },
  ],

  sources: [
    {
      name: 'Ley 17.235 sobre Impuesto Territorial',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=29070',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'SII — contribuciones de bienes raíces y avalúos',
      url: 'https://www.sii.cl/avalua_y_contribuciones/',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Tesorería General de la República — pago de contribuciones y deuda morosa',
      url: 'https://www.tgr.cl/',
      publisher: 'TGR',
    },
    {
      name: 'Código Tributario — reajustes, intereses y multas del Art. 53',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=6374',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Ley sobre Impuesto a la Renta — mayor valor en la venta de bienes raíces, Art. 17 N°8',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=6368',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'DL 3.475 sobre Impuesto de Timbres y Estampillas',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=6759',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Ley 16.271 sobre Impuesto a las Herencias, Asignaciones y Donaciones',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=28428',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'UF, UTM y UTA del día',
      url: 'https://mindicador.cl/',
      publisher: 'mindicador.cl (Banco Central de Chile / SII)',
    },
  ],

  replaces: [
    '/calculadora-impuesto-territorial-contribuciones-bienes-raices-chile',
    '/calculadora-contribuciones-morosas-tgr-chile-intereses-reajuste',
    '/calculadora-impuesto-mayor-valor-venta-propiedad-chile-8000-uf',
    '/calculadora-impuesto-timbres-estampillas-chile-credito-hipotecario',
    '/calculadora-impuesto-herencias-donaciones-chile-tabla',
  ],

lastReviewed: '2026-07-28',
};
