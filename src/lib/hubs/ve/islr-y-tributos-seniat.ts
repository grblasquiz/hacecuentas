import type { HubData } from '../types';
import { VENEZUELA_2026 } from '../../data/venezuela-2026';

/**
 * Hub de decisión VE — "¿Cuánto le debo al SENIAT?"
 *
 * Absorbe el cluster tributario: ISLR de persona natural (Tarifa N° 1), retención
 * mensual sobre sueldos, retención de IVA de sujetos pasivos especiales, IGTF sobre
 * pagos en divisas, conversión U.T. ↔ Bs., aporte INCES e impuesto sucesoral.
 *
 * ⚠️ La ley venezolana escribe TODO en Unidades Tributarias, no en bolívares: por eso
 * este hub calcula en U.T. y el valor de la U.T. entra como campo editable. La tabla
 * maestra marca `unidadTributaria` con "⚠️ VERIFICAR" porque se reajusta dentro del
 * año — el default es una referencia, no una verdad.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Valor de referencia de la U.T. — Providencia SNAT/2025/000048. Editable en el form. */
export const UT_REFERENCIA = VENEZUELA_2026.unidadTributaria;

/**
 * Tarifa N° 1 del Art. 50 de la Ley de ISLR, en U.T.
 * `Infinity` no sobrevive a `define:vars` → viaja como null.
 */
export const TARIFA_1 = VENEZUELA_2026.islr.tarifa1.map((t) => ({
  hastaUt: Number.isFinite(t.hastaUt) ? t.hastaUt : null,
  tasa: t.tasa,
  sustraendoUt: t.sustraendoUt,
}));

export const ISLR = {
  desgravamenUnicoUt: VENEZUELA_2026.islr.desgravamenUnicoUt,
  rebajaPersonalUt: VENEZUELA_2026.islr.rebajaPersonalUt,
  rebajaCargaFamiliarUt: VENEZUELA_2026.islr.rebajaCargaFamiliarUt,
  noResidente: VENEZUELA_2026.islr.noResidente,
};

export const OTROS_TRIBUTOS = {
  iva: VENEZUELA_2026.iva,
  ivaReducida: VENEZUELA_2026.ivaReducida,
  igtf: VENEZUELA_2026.igtf,
  /** Ley del INCES (G.O. 38.958), Art. 14. */
  incesPatronal: 0.02,
  incesTrabajador: 0.005,
};

/**
 * Escala progresiva REFERENCIAL del impuesto sucesoral (Art. 7, Ley de Sucesiones),
 * en U.T. Se endurece con la lejanía del parentesco. La tarifa exacta, con sus
 * sustraendos y desgravámenes, la fija el SENIAT.
 */
export const SUCESIONES = {
  grupo1: {
    label: 'Descendientes, ascendientes y cónyuge',
    tramos: [
      { hastaUt: 15, tasa: 0.01 }, { hastaUt: 50, tasa: 0.025 }, { hastaUt: 100, tasa: 0.05 },
      { hastaUt: 250, tasa: 0.075 }, { hastaUt: 500, tasa: 0.1 }, { hastaUt: 1000, tasa: 0.15 },
      { hastaUt: null as number | null, tasa: 0.2 },
    ],
  },
  grupo2: {
    label: 'Hermanos y sobrinos por representación',
    tramos: [
      { hastaUt: 15, tasa: 0.025 }, { hastaUt: 50, tasa: 0.05 }, { hastaUt: 100, tasa: 0.075 },
      { hastaUt: 250, tasa: 0.1 }, { hastaUt: 500, tasa: 0.15 }, { hastaUt: 1000, tasa: 0.225 },
      { hastaUt: null as number | null, tasa: 0.3 },
    ],
  },
  grupo3: {
    label: 'Otros colaterales y afines',
    tramos: [
      { hastaUt: 15, tasa: 0.04 }, { hastaUt: 50, tasa: 0.08 }, { hastaUt: 100, tasa: 0.12 },
      { hastaUt: 250, tasa: 0.16 }, { hastaUt: 500, tasa: 0.22 }, { hastaUt: 1000, tasa: 0.3 },
      { hastaUt: null as number | null, tasa: 0.4 },
    ],
  },
  grupo4: {
    label: 'Extraños, sin parentesco',
    tramos: [
      { hastaUt: 15, tasa: 0.06 }, { hastaUt: 50, tasa: 0.12 }, { hastaUt: 100, tasa: 0.18 },
      { hastaUt: 250, tasa: 0.24 }, { hastaUt: 500, tasa: 0.34 }, { hastaUt: 1000, tasa: 0.45 },
      { hastaUt: null as number | null, tasa: 0.55 },
    ],
  },
};

export const hub: HubData = {
  slug: 've/impuestos/islr-y-tributos-seniat',
  title: 'ISLR, IVA e IGTF en Venezuela: cuánto le debo al SENIAT',
  description:
    'Calculá tu ISLR anual con la Tarifa N° 1 y el desgravamen de 774 U.T., la retención mensual sobre tu sueldo, la retención de IVA del 75% o 100%, el IGTF del 3% en divisas, el aporte INCES y el impuesto sucesoral.',
  silo: 'Impuestos',
  siloHref: '/ve/impuestos',
  locale: 've',

  eyebrow: 'Venezuela · SENIAT · todo en Unidades Tributarias',
  h1: 'Cuánto le debo al SENIAT.',
  lede:
    'La ley tributaria venezolana no está escrita en bolívares sino en Unidades Tributarias, justamente para no tener que reformarse cada vez que cambian los precios. Acá se calcula igual: en U.T., con el valor de la U.T. a la vista y editable, y la traducción a bolívares al final.',
  stamps: [
    'Ley de ISLR Art. 50 (Tarifa N° 1) · Ley del IVA · Ley del IGTF · Ley del INCES',
    'Base en U.T., con el valor de la U.T. editable',
    '7 calculadoras adentro',
  ],

  resultLabel: 'Impuesto a pagar',

  cases: {
    title: '¿Qué tributo estás calculando?',
    intro:
      'Todos comparten la misma unidad de cuenta —la U.T.— pero la base imponible y la alícuota cambian bastante. Partimos del ISLR de persona natural, que es el que más gente busca.',
    items: [
      {
        id: 'islr',
        label: 'ISLR de persona natural',
        hint: `Tarifa N° 1 · desgravamen ${VENEZUELA_2026.islr.desgravamenUnicoUt} U.T.`,
        answer: `Del enriquecimiento anual se resta el desgravamen único de ${VENEZUELA_2026.islr.desgravamenUnicoUt} U.T. y sobre el resto corre la Tarifa N° 1.`,
        yes: [
          `Desgravamen único de ${VENEZUELA_2026.islr.desgravamenUnicoUt} U.T., alternativa a los desgravámenes detallados`,
          `Rebaja personal de ${VENEZUELA_2026.islr.rebajaPersonalUt} U.T. y ${VENEZUELA_2026.islr.rebajaCargaFamiliarUt} U.T. por cónyuge y por cada carga familiar`,
          'Tarifa N° 1 de ocho tramos, con tasa marginal menos sustraendo',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Los no residentes no usan esta tarifa: pagan el ${ISLR.noResidente * 100}% proporcional sin tramos`,
          'Elegir el desgravamen único te impide deducir los detallados: son alternativos, no acumulables',
        ],
        plazo: 'la declaración definitiva de rentas de persona natural se presenta dentro de los tres meses siguientes al cierre del ejercicio.',
      },
      {
        id: 'retencion',
        label: 'Retención de ISLR sobre mi sueldo',
        hint: 'Decreto 1.808 · proyección anual ÷ 12',
        answer: 'La retención mensual es el ISLR anual proyectado sobre tu sueldo, dividido entre 12.',
        yes: [
          'Proyección de tu salario mensual a un enriquecimiento anual',
          `Desgravamen único de ${VENEZUELA_2026.islr.desgravamenUnicoUt} U.T. y rebajas aplicados sobre esa proyección`,
          'El resultado dividido entre 12 da el descuento mensual y el porcentaje de retención',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Es una estimación por proyección: el porcentaje real lo fija el formulario AR-I que vos presentás y lo ajusta el agente de retención si el sueldo cambia durante el año',
          'Los bonos no salariales, como el cestaticket, no entran en la base de esta proyección',
        ],
        plazo: 'el AR-I se presenta antes del 15 de enero de cada año y se puede ajustar hasta tres veces en el ejercicio.',
      },
      {
        id: 'iva',
        label: 'Retención de IVA como agente',
        hint: '75% general · 100% en supuestos específicos',
        answer: 'El sujeto pasivo especial retiene el 75% del IVA facturado por su proveedor, o el 100% en casos puntuales.',
        yes: [
          `IVA sobre la base imponible a la alícuota general del ${OTROS_TRIBUTOS.iva * 100}% o la reducida del ${OTROS_TRIBUTOS.ivaReducida * 100}%`,
          'Retención del 75% de ese IVA en el caso general',
          'Retención del 100% cuando el proveedor no está inscrito en el RIF, la factura no cumple requisitos formales o el IVA facturado no coincide',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Solo retienen los designados como sujetos pasivos especiales: si no lo sos, no corresponde',
          'La retención se entera al SENIAT y hay que emitir el comprobante en plazo; el proveedor lo usa como crédito',
        ],
        plazo: 'las retenciones se enteran por quincena, según el calendario de sujetos pasivos especiales del SENIAT.',
      },
      {
        id: 'igtf',
        label: 'IGTF por pagar en divisas',
        hint: `${OTROS_TRIBUTOS.igtf * 100}% sobre el pago en moneda extranjera`,
        answer: `Pagar en divisas en efectivo agrega un ${OTROS_TRIBUTOS.igtf * 100}% de IGTF al monto de la operación.`,
        yes: [
          `Alícuota del ${OTROS_TRIBUTOS.igtf * 100}% sobre pagos en divisas o criptomonedas no emitidas por la República`,
          'Se calcula sobre el monto de la operación y lo percibe el comercio',
          'El equivalente en bolívares a la tasa BCV, para la contabilidad',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Para pagos en bolívares de sujetos pasivos especiales la alícuota base es del 2%, no del 3%',
          'Hay operaciones exoneradas: no todo pago en divisas genera IGTF',
        ],
        plazo: 'el IGTF lo percibe el comercio en el momento del pago y lo entera al SENIAT según el calendario que le corresponda.',
      },
      {
        id: 'sucesion',
        label: 'Impuesto sucesoral por una herencia',
        hint: 'Art. 7 · progresivo por parentesco',
        answer: 'Cuanto más lejano el parentesco, más alta la escala: va del 1% al 55% marginal.',
        yes: [
          'Escala progresiva por tramos sobre la cuota líquida que recibe cada heredero, medida en U.T.',
          'Cuatro grupos de parentesco, del más cercano al extraño',
          'El neto que le queda al heredero después del impuesto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las tasas cargadas son la ESTRUCTURA referencial del Art. 7: la tarifa exacta, con sus sustraendos y desgravámenes, la fija el SENIAT',
          'Sobre el líquido hereditario hay desgravámenes y exenciones —vivienda principal, entre otros— que esta cuenta no aplica',
        ],
        plazo: 'la declaración sucesoral se presenta dentro de los 180 días hábiles siguientes al fallecimiento.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'El valor de la U.T. va editable porque se reajusta dentro del año: si la Providencia cambió, corregilo acá y todo el cálculo se acomoda solo.',
  fields: [
    {
      id: 'valorUt',
      label: 'Valor de la Unidad Tributaria (Bs.)',
      type: 'number',
      value: UT_REFERENCIA,
      min: 0.01,
      step: 0.01,
      help: 'Providencia SNAT vigente. Verificá en Gaceta Oficial: se reajusta dentro del año.',
    },
    {
      id: 'enriquecimientoAnual',
      label: 'Enriquecimiento neto anual (Bs.)',
      prefix: 'Bs.',
      value: '600.000',
      thousands: true,
      help: 'Todo lo que ganaste en el ejercicio, ya restados los costos de la actividad.',
    },
    {
      id: 'salarioMensual',
      label: 'Salario mensual, si sos asalariado (Bs.)',
      prefix: 'Bs.',
      value: '50.000',
      thousands: true,
      help: 'Se proyecta a 12 meses para estimar la retención mensual. Sin cestaticket ni bonos.',
    },
    {
      id: 'cargas',
      label: 'Cargas familiares',
      type: 'number',
      value: 2,
      min: 0,
      max: 10,
      step: 1,
      help: `${VENEZUELA_2026.islr.rebajaCargaFamiliarUt} U.T. de rebaja por el cónyuge y por cada carga.`,
    },
    {
      id: 'desgravamen',
      label: '¿Aplicás el desgravamen único?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: `Sí, el desgravamen único de ${VENEZUELA_2026.islr.desgravamenUnicoUt} U.T.` },
        { value: 'no', label: 'No, uso desgravámenes detallados' },
      ],
    },
    {
      id: 'baseIva',
      label: 'Base imponible de la factura (Bs.)',
      prefix: 'Bs.',
      value: '100.000',
      thousands: true,
      help: 'Monto neto sin IVA. Para calcular la retención como agente.',
    },
    {
      id: 'alicuotaIva',
      label: 'Alícuota de IVA de la operación',
      type: 'select',
      value: 'general',
      options: [
        { value: 'general', label: `General — ${OTROS_TRIBUTOS.iva * 100}%` },
        { value: 'reducida', label: `Reducida — ${OTROS_TRIBUTOS.ivaReducida * 100}%` },
      ],
    },
    {
      id: 'pctRetencionIva',
      label: 'Porcentaje de retención de IVA',
      type: 'select',
      value: '75',
      options: [
        { value: '75', label: '75% — caso general' },
        { value: '100', label: '100% — proveedor sin RIF o factura irregular' },
      ],
    },
    {
      id: 'pagoDivisas',
      label: 'Pago en divisas sujeto a IGTF (USD)',
      type: 'number',
      value: 500,
      min: 0,
      step: 1,
      help: `Monto de la operación pagada en moneda extranjera. Alícuota del ${OTROS_TRIBUTOS.igtf * 100}%.`,
    },
    {
      id: 'sueldosTrimestre',
      label: 'Sueldos pagados en el trimestre, si sos patrono (Bs.)',
      prefix: 'Bs.',
      value: '0',
      thousands: true,
      help: `Base del aporte INCES del ${OTROS_TRIBUTOS.incesPatronal * 100}%. Dejalo en 0 si no sos empleador.`,
    },
    {
      id: 'liquidoHereditario',
      label: 'Cuota líquida que recibe el heredero (Bs.)',
      prefix: 'Bs.',
      value: '0',
      thousands: true,
      help: 'Dejalo en 0 si no estás calculando una sucesión.',
    },
    {
      id: 'parentesco',
      label: 'Parentesco con el causante',
      type: 'select',
      value: 'grupo1',
      options: [
        { value: 'grupo1', label: 'Hijos, padres o cónyuge' },
        { value: 'grupo2', label: 'Hermanos y sobrinos por representación' },
        { value: 'grupo3', label: 'Otros colaterales y afines' },
        { value: 'grupo4', label: 'Sin parentesco' },
      ],
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué pasa con tu enriquecimiento del año',
    caption:
      'Compara la parte del enriquecimiento que el desgravamen y las rebajas dejan fuera del impuesto, la renta que sí queda gravada y el ISLR que sale de la Tarifa N° 1.',
  },
  breakdownTitle: 'Cada tributo, con su base y su alícuota',
  breakdownIntro:
    'Primero el ISLR en U.T., que es como lo escribe la ley, y su traducción a bolívares. Después la retención mensual, el IVA, el IGTF, el INCES y la sucesión.',

  faq: [
    {
      q: '¿Qué es la Unidad Tributaria y por qué todo se calcula así?',
      a: `Es la unidad de cuenta del SENIAT: la ley escribe tramos, topes, multas y sanciones en U.T. para que se actualicen reajustando un solo número, sin reformar cada ley. La referencia que traemos cargada es de Bs. ${UT_REFERENCIA} por U.T., fijada por la Providencia SNAT/2025/000048 publicada en Gaceta Oficial 43.140. Va como campo editable porque la U.T. se reajusta dentro del año y cualquier valor guardado envejece rápido. Un detalle importante: la U.T. es exclusiva para tributos nacionales; la propia providencia prohíbe usarla para beneficios laborales.`,
    },
    {
      q: '¿Cómo funciona la Tarifa N° 1 del ISLR?',
      a: 'Son ocho tramos progresivos del 6% al 34%, escritos en U.T., que operan con el método de tasa marginal menos sustraendo. La cuenta es: base gravable en U.T. multiplicada por la tasa del tramo donde caés, menos el sustraendo de ese tramo. El sustraendo es lo que hace que la progresividad funcione: sin él, cruzar un tramo por una U.T. dispararía el impuesto de golpe. Al resultado se le restan después las rebajas personales.',
    },
    {
      q: `¿Qué es el desgravamen único de ${VENEZUELA_2026.islr.desgravamenUnicoUt} U.T.?`,
      a: `Es una deducción fija que podés restar del enriquecimiento neto antes de aplicar la tarifa, sin tener que justificar gastos. La alternativa son los desgravámenes detallados —educación, servicios médicos, intereses de vivienda, primas de seguro— que exigen comprobantes. Son excluyentes: elegís uno u otro. Para la mayoría de los asalariados el único conviene, porque ${VENEZUELA_2026.islr.desgravamenUnicoUt} U.T. suele superar lo que podrían documentar.`,
    },
    {
      q: '¿Cuánto me rebajan por cargas familiares?',
      a: `La rebaja personal del contribuyente es de ${VENEZUELA_2026.islr.rebajaPersonalUt} U.T. y se suman ${VENEZUELA_2026.islr.rebajaCargaFamiliarUt} U.T. por el cónyuge no separado de bienes y ${VENEZUELA_2026.islr.rebajaCargaFamiliarUt} U.T. por cada carga familiar. Ojo con la diferencia respecto del desgravamen: las rebajas se restan del IMPUESTO ya calculado, no de la base. Por eso valen lo mismo para cualquier nivel de ingreso, mientras que el desgravamen vale más cuanto más alta es tu tasa marginal.`,
    },
    {
      q: '¿Cómo se calcula la retención de ISLR sobre mi sueldo?',
      a: 'Por el método de proyección anual del Reglamento de Retenciones, el Decreto 1.808: se proyecta tu salario mensual a doce meses, se le aplica el desgravamen y las rebajas, se calcula el ISLR anual con la Tarifa N° 1 y se divide entre doce. Eso da la retención mensual y el porcentaje. El porcentaje real lo declarás vos en el formulario AR-I, y el agente de retención lo ajusta si tu sueldo cambia durante el año.',
    },
    {
      q: '¿Cuándo retengo el 75% del IVA y cuándo el 100%?',
      a: 'El 75% es el caso general para los sujetos pasivos especiales designados como agentes de retención. Se va al 100% en supuestos concretos: proveedor no inscrito en el RIF o con inscripción no vigente, factura que no cumple los requisitos formales, o monto de IVA facturado que no coincide con la alícuota aplicable. En todos los casos el agente entera la retención al SENIAT y emite el comprobante, que el proveedor usa como crédito fiscal.',
    },
    {
      q: '¿Sobre qué se paga el IGTF y cuánto es?',
      a: `El Impuesto a las Grandes Transacciones Financieras grava con ${OTROS_TRIBUTOS.igtf * 100}% los pagos hechos en divisas o en criptomonedas no emitidas por la República, cuando los realizan sujetos no exonerados. Es lo que hace que pagar en dólares en efectivo salga un ${OTROS_TRIBUTOS.igtf * 100}% más caro que el precio de lista. Para pagos en bolívares de sujetos pasivos especiales la alícuota base es del 2%. Hay operaciones exoneradas, así que no todo pago en divisas lo genera.`,
    },
    {
      q: '¿Qué es el aporte INCES y quién lo paga?',
      a: `Son dos conceptos distintos que el patrono entera juntos. El aporte patronal es del ${OTROS_TRIBUTOS.incesPatronal * 100}% sobre el total de sueldos, salarios y remuneraciones pagados en el trimestre, y lo asume la empresa. La retención al trabajador es del ${(OTROS_TRIBUTOS.incesTrabajador * 100).toLocaleString('es-VE')}% sobre las utilidades anuales, y se descuenta del aguinaldo. La declaración es trimestral, según el Art. 14 de la Ley del INCES.`,
    },
    {
      q: '¿Cuánto se paga de impuesto sucesoral en Venezuela?',
      a: 'Depende de dos cosas: cuánto recibe cada heredero, medido en U.T., y qué parentesco tenía con el causante. La escala del Art. 7 es progresiva y se endurece con la lejanía: para hijos, padres y cónyuge arranca en el 1% marginal, y para un extraño sin parentesco el tramo más alto llega al 55%. Importante: las tasas que usamos son la estructura referencial del artículo; la tarifa exacta, con sus sustraendos y los desgravámenes aplicables, la fija el SENIAT y conviene verificarla con un profesional antes de declarar.',
    },
    {
      q: '¿Hay exenciones en el impuesto sucesoral?',
      a: 'Sí, y son relevantes: la ley prevé desgravámenes y exenciones sobre el líquido hereditario, entre ellos el que corresponde a la vivienda principal que sirva de asiento permanente del hogar de los herederos. Esta calculadora no los aplica, así que su resultado es el techo del impuesto, no el monto final. La declaración sucesoral se presenta dentro de los 180 días hábiles siguientes al fallecimiento.',
    },
    {
      q: 'Si soy no residente, ¿pago lo mismo?',
      a: `No. Los no residentes no usan la Tarifa N° 1 con sus tramos progresivos: pagan una tarifa proporcional del ${ISLR.noResidente * 100}% sobre el enriquecimiento de fuente venezolana, sin desgravamen único ni rebajas personales. Es una diferencia grande, sobre todo en ingresos bajos, donde un residente puede terminar en cero y un no residente paga desde el primer bolívar.`,
    },
  ],

  sources: [
    {
      name: 'SENIAT — Servicio Nacional Integrado de Administración Aduanera y Tributaria',
      url: 'http://www.seniat.gob.ve/',
      publisher: 'SENIAT',
    },
    {
      name: 'Ley de Impuesto Sobre la Renta — Art. 50, Tarifa N° 1',
      url: 'https://venezuela.justia.com/federales/leyes/ley-de-impuesto-sobre-la-renta/',
      publisher: 'Justia Venezuela',
    },
    {
      name: 'Providencia SNAT/2025/000048 — reajuste de la Unidad Tributaria (Gaceta Oficial 43.140)',
      url: 'https://accesoalajusticia.org/',
      publisher: 'Acceso a la Justicia / Gaceta Oficial',
    },
    {
      name: 'Ley del Impuesto al Valor Agregado y providencias de retención',
      url: 'https://venezuela.justia.com/federales/leyes/ley-del-impuesto-al-valor-agregado/',
      publisher: 'Justia Venezuela',
    },
    {
      name: 'Ley del Impuesto a las Grandes Transacciones Financieras (IGTF)',
      url: 'https://accesoalajusticia.org/',
      publisher: 'Acceso a la Justicia / Gaceta Oficial',
    },
    {
      name: 'Ley del INCES, Art. 14 — aportes patronal y del trabajador',
      url: 'https://www.inces.gob.ve/',
      publisher: 'INCES / Gaceta Oficial 38.958',
    },
    {
      name: 'Ley de Impuesto sobre Sucesiones, Donaciones y Demás Ramos Conexos, Art. 7',
      url: 'https://venezuela.justia.com/federales/leyes/ley-de-impuesto-sobre-sucesiones-donaciones-y-demas-ramos-conexos/',
      publisher: 'Justia Venezuela',
    },
  ],

  replaces: [
    '/ve/calculadora-islr-venezuela-2026',
    '/ve/calculadora-retencion-islr-venezuela',
    '/ve/calculadora-retencion-iva-venezuela',
    '/ve/calculadora-igtf-venezuela-3',
    '/ve/cuanto-es-unidad-tributaria-bolivares',
    '/ve/calculadora-inces-venezuela',
    '/ve/calculadora-impuesto-sucesoral-herencia-venezuela',
  ],

  lastReviewed: '2026-07-28',
};
