import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto me queda emitiendo boletas de honorarios?"
 *
 * Absorbe la boleta de honorarios del SII, la retención en gradualidad de la
 * Ley 21.133 y la cotización previsional obligatoria del trabajador independiente.
 *
 * Espejo de:
 *  - src/lib/formulas/sii-boleta-honorarios-2026.ts
 *  - src/lib/formulas/iva-honorarios-chile-10-porciento-retencion.ts (CORREGIDO)
 *  - src/lib/formulas/aporte-trabajador-honorarios-chile-cotizacion-obligatoria.ts (CORREGIDO)
 *
 * CORRECCIONES respecto de las fórmulas viejas (ver reporte):
 *  1. `aporte-trabajador-honorarios` usaba `TOPE_MENSUAL_UF = 84,3` y lo comparaba
 *     contra la base ANUAL: cualquiera con más de ~$4,3 M al año quedaba con la
 *     base congelada en ~$3,4 M. El tope imponible es MENSUAL y para la base anual
 *     hay que multiplicarlo por 12. Además 84,3 UF es un valor de años anteriores:
 *     el tope vigente es de 90 UF.
 *  2. Esa misma fórmula cobraba un 0,8% de seguro de cesantía. El trabajador a
 *     honorarios NO cotiza al seguro de cesantía: la Ley 19.728 es para los
 *     trabajadores regidos por el Código del Trabajo.
 *  3. `iva-honorarios` sumaba un 19% de IVA a la boleta de honorarios. Los
 *     servicios prestados por personas naturales mediante boleta de honorarios
 *     están EXENTOS de IVA (Art. 12 letra E N°8 del DL 825): la Ley 21.420 gravó
 *     los servicios, pero mantuvo esa exención.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Indicadores vivos (mindicador.cl), con el mismo fallback que las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UTM = (clLive as any)?.utm?.valor ?? 71649;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

/**
 * Gradualidad de la tasa de retención de la boleta de honorarios — Ley 21.133.
 * Espejo exacto de la tabla de src/lib/formulas/iva-honorarios-chile-10-porciento-retencion.ts.
 * Fuente: SII, https://www.sii.cl/destacados/boletas_honorarios/aumento_gradual.html
 */
export const RETENCION_POR_ANIO: Array<{ anio: number; tasa: number }> = [
  { anio: 2025, tasa: 14.5 },
  { anio: 2026, tasa: 15.25 },
  { anio: 2027, tasa: 16 },
  { anio: 2028, tasa: 17 },
];
export const RETENCION_VIGENTE = 15.25;

export const COTIZACIONES = {
  /** Ley 21.133: la base imponible es el 80% de las rentas brutas del año. */
  baseSobreBruto: 0.8,
  /** Tope imponible mensual, en UF. Para la base anual se multiplica por 12. */
  topeMensualUf: CHILE_2026.topeImponibleAfpUf,
  mesesDelAnio: 12,
  afp: CHILE_2026.afpObligatorio,
  salud: CHILE_2026.saludFonasa,
  /** Seguro de invalidez y sobrevivencia — el independiente lo paga él mismo. */
  sis: 0.015,
  /**
   * DATO NO VERIFICADO CONTRA FUENTE OFICIAL EN ESTE REPO.
   * Cotización de la Ley 16.744 (accidentes del trabajo) del independiente. Las
   * calculadoras originales del sitio usaban 0,95% para dependientes. Es campo
   * EDITABLE: confirmá la tasa vigente del independiente con la SUSESO.
   */
  accidentesDefault: 0.0095,
};

/** Tope de la base imponible anual: 90 UF × 12 meses. */
export const TOPE_ANUAL_UF = COTIZACIONES.topeMensualUf * COTIZACIONES.mesesDelAnio;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
slug: 'cl/trabajo/trabajo-a-honorarios',
  title: 'Boleta de honorarios Chile 2026: retención y cotizaciones',
  description:
    'Calculá la retención de tu boleta de honorarios en Chile 2026 con la tasa vigente de la Ley 21.133 y la cotización obligatoria sobre el 80% de tus rentas.',
  silo: 'Trabajo',
  siloHref: '/cl/trabajo',
  locale: 'cl',

  eyebrow: 'Chile · trabajador independiente',
  h1: '¿Cuánto me queda emitiendo boletas de honorarios en Chile?',
  lede:
    'Cuando emites una boleta te retienen un porcentaje que sube todos los años, y en abril esa retención se va casi entera a pagar tus cotizaciones antes de convertirse en devolución. Acá calculas las dos cosas: lo que recibes hoy y lo que te van a cotizar sobre el 80% de lo que boleteaste.',
  stamps: [
    `Retención vigente: ${RETENCION_VIGENTE.toLocaleString('es-CL')}% (Ley 21.133)`,
    `Base de cotización: 80% de las rentas brutas`,
    `Tope anual: ${TOPE_ANUAL_UF} UF (hoy ${fmt(TOPE_ANUAL_UF * UF)})`,
    'La boleta de honorarios NO lleva IVA',
    '3 casos en una sola página',
  ],

  resultLabel: 'Lo que recibes',

  cases: {
    title: '¿Qué necesitas calcular?',
    intro:
      'Partimos por lo más frecuente: emitiste una boleta por un monto bruto y quieres saber cuánto te van a depositar.',
    items: [
      {
        id: 'boleta',
        label: 'Emití una boleta por un monto bruto',
        hint: 'La retención la hace quien te paga si es empresa, o la pagas tú como PPM si es un particular.',
        yes: [
          'Retención sobre el honorario bruto con la tasa del año que elijas',
          'Líquido que te van a depositar',
          'Proyección anual si emites todos los meses por el mismo monto',
          'Cuánto sube tu retención con la gradualidad de la Ley 21.133',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La boleta de honorarios de una persona natural NO lleva IVA: está exenta por el Art. 12 letra E N°8 del DL 825, y la Ley 21.420 mantuvo esa exención',
          'Si tu cliente es una persona natural sin giro, no te retiene: tienes que declarar y pagar tú el PPM del 15,25% en el Formulario 29',
          'La retención no es un impuesto pagado: es un anticipo que en abril financia primero tus cotizaciones y solo después tu impuesto',
          'Emitir boletas de honorarios cuando la relación es de subordinación y dependencia puede ser una relación laboral encubierta',
        ],
        plazo:
          'quien retiene declara y entera la retención en el Formulario 29 dentro de los 12 primeros días del mes siguiente.',
        answer:
          `Sobre el honorario bruto te retienen el ${RETENCION_VIGENTE.toLocaleString('es-CL')}% y recibes el resto: la boleta de honorarios no lleva IVA.`,
      },
      {
        id: 'liquido',
        label: 'Sé el líquido que quiero recibir y busco el bruto',
        hint: 'Para cotizar un trabajo: qué monto poner en la boleta para que te llegue lo que acordaste.',
        yes: [
          'El bruto que tienes que boletear para que, después de la retención, te llegue el líquido que buscas',
          'La retención que eso implica',
          'Lo que le costará a tu cliente ese trabajo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El bruto no es líquido ÷ (1 − tasa) redondeado a la baja: la fórmula exacta es líquido ÷ (1 − tasa)',
          'Si acordaste un monto "líquido" con tu cliente, la diferencia la termina pagando él: conviene dejarlo claro por escrito',
          'A esto todavía le faltan tus cotizaciones, que se cobran en abril del año siguiente',
          'Como la tasa de retención sube cada año, un mismo líquido exige un bruto mayor cada enero',
        ],
        plazo:
          'la tasa de retención cambia el 1 de enero de cada año hasta llegar al 17% en 2028.',
        answer:
          'Para recibir un líquido determinado hay que boletear ese líquido dividido por uno menos la tasa de retención.',
      },
      {
        id: 'cotizaciones',
        label: 'Quiero saber cuánto me van a cotizar en abril',
        hint: 'La Ley 21.133 cotiza sobre el 80% de tus rentas brutas anuales, con tope.',
        yes: [
          'Base imponible: el 80% de tus rentas brutas del año, topada en 90 UF × 12',
          'AFP (10% más la comisión de tu administradora), salud (7%), SIS y Ley de Accidentes',
          'Total de la cotización anual y cuánto de tu retención alcanza a cubrirla',
          'Qué te queda de devolución (o qué te falta) después de las cotizaciones',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El trabajador a honorarios NO cotiza al seguro de cesantía: la Ley 19.728 es solo para los trabajadores del Código del Trabajo',
          'La retención se destina PRIMERO a las cotizaciones, en el orden de prelación que fija la ley, y solo el remanente se aplica al impuesto',
          `El tope de la base es de ${COTIZACIONES.topeMensualUf} UF mensuales, es decir ${TOPE_ANUAL_UF} UF al año (hoy ${fmt(TOPE_ANUAL_UF * UF)})`,
          'Puedes optar por cotización parcial durante el período de transición, pero eso reduce tu cobertura de salud y de pensión',
        ],
        plazo:
          'la cotización se determina en la Operación Renta de abril y las instituciones previsionales la cobran de la retención del año anterior.',
        answer:
          'Las cotizaciones del independiente se calculan sobre el 80% de sus rentas brutas anuales y se pagan con la retención acumulada del año.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Para el caso de la boleta usa el monto de esa boleta; para el de cotizaciones, el total de honorarios brutos del año. La tasa de retención cambia según el año que elijas.',
  fields: [
    {
      id: 'monto',
      label: 'Monto de la boleta',
      type: 'number',
      value: 800000,
      prefix: '$',
      min: 0,
      step: 10000,
      thousands: true,
      help: 'Bruto en el caso de la boleta; líquido objetivo en el caso del bruto a cotizar.',
    },
    {
      id: 'anio',
      label: 'Año de la boleta (define la tasa de retención)',
      type: 'select',
      value: '2026',
      options: RETENCION_POR_ANIO.map((r) => ({
        value: String(r.anio),
        label: `${r.anio} — retención ${r.tasa.toLocaleString('es-CL')}%`,
      })),
    },
    {
      id: 'honorariosAnuales',
      label: 'Honorarios brutos del año',
      type: 'number',
      value: 12000000,
      prefix: '$',
      min: 0,
      step: 100000,
      thousands: true,
      help: 'Total boleteado en el año calendario. Es la base para calcular las cotizaciones.',
    },
    {
      id: 'comisionAfp',
      label: 'Comisión de tu AFP',
      type: 'number',
      value: 1.27,
      suffix: '%',
      min: 0,
      max: 3,
      step: 0.01,
      help: 'Se suma al 10% obligatorio. Va entre 0,49% y 1,45% según la administradora.',
    },
    {
      id: 'accidentes',
      label: 'Cotización de la Ley de Accidentes',
      type: 'number',
      value: COTIZACIONES.accidentesDefault * 100,
      suffix: '%',
      min: 0,
      max: 4,
      step: 0.01,
      help: 'Valor editable: confirma la tasa vigente del trabajador independiente con la SUSESO.',
    },
    {
      id: 'tope',
      label: '¿Aplicar el tope imponible?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: `Sí — topar en ${TOPE_ANUAL_UF} UF al año` },
        { value: 'no', label: 'No — cotizar sobre todo el 80%' },
      ],
      help: 'El tope legal siempre aplica. La opción de no aplicarlo es solo para ver el efecto.',
    },
  ],
  fineprint:
    'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva. El tope imponible está expresado en UF y se recalcula con el valor del día publicado por mindicador.cl.',

  chart: {
    type: 'donut',
    title: 'De la boleta bruta a tu bolsillo',
    caption:
      'Muestra qué parte del honorario se va en retención y en cotizaciones, y cuánto queda efectivamente para ti.',
  },
  breakdownTitle: 'El cálculo, línea por línea',
  breakdownIntro:
    'Cada fila indica la norma que la respalda. La tasa de retención sube por gradualidad hasta 2028 y el tope imponible se mueve con la UF.',

  faq: [
    {
      q: '¿Cuánto retienen por una boleta de honorarios en Chile?',
      a: `La tasa vigente es del ${RETENCION_VIGENTE.toLocaleString('es-CL')}%, dentro de la gradualidad de la Ley 21.133: era 14,5% en 2025 y sube a 16% en 2027 y a 17% en 2028, donde se queda. Si tu cliente es una empresa, la retiene y la entera él; si es una persona natural sin giro, la declaras tú como PPM en el Formulario 29.`,
    },
    {
      q: '¿La boleta de honorarios lleva IVA?',
      a: 'No. Los servicios prestados por personas naturales mediante boleta de honorarios están exentos de IVA por el Art. 12 letra E N°8 del DL 825. La Ley 21.420 gravó con IVA los servicios en general desde 2023, pero mantuvo expresamente esta exención para las personas naturales que emiten boleta de honorarios.',
    },
    {
      q: '¿Sobre qué base se calculan mis cotizaciones como independiente?',
      a: `Sobre el 80% de tus rentas brutas del año (Ley 21.133), con tope. El tope imponible es de ${COTIZACIONES.topeMensualUf} UF mensuales, o sea ${TOPE_ANUAL_UF} UF al año, hoy ${fmt(TOPE_ANUAL_UF * UF)}. Si el 80% de tus honorarios supera ese tope, cotizas solo hasta ahí.`,
    },
    {
      q: '¿Qué cotizaciones paga un trabajador a honorarios?',
      a: 'AFP (10% más la comisión de la administradora), salud (7%), el seguro de invalidez y sobrevivencia (SIS) y la cotización de la Ley 16.744 de accidentes del trabajo, más el seguro SANNA. Lo que NO paga es el seguro de cesantía: ese es exclusivo de los trabajadores regidos por el Código del Trabajo.',
    },
    {
      q: '¿Por qué mi devolución de impuestos es tan chica si me retuvieron todo el año?',
      a: 'Porque la retención se destina primero a pagar tus cotizaciones previsionales, en el orden de prelación que fija la ley, y solo el remanente se aplica al Impuesto Global Complementario y se convierte en devolución. Muchos independientes descubren en abril que su devolución quedó en cero o cerca.',
    },
    {
      q: '¿Qué bruto tengo que boletear para recibir un líquido determinado?',
      a: `El líquido dividido por uno menos la tasa de retención. Con la tasa del ${RETENCION_VIGENTE.toLocaleString('es-CL')}%, para recibir ${fmt(1000000)} líquidos hay que boletear ${fmt(1000000 / (1 - RETENCION_VIGENTE / 100))}. Conviene dejarlo por escrito con el cliente para que no haya sorpresas.`,
    },
    {
      q: '¿Puedo optar por no cotizar?',
      a: 'La cotización es obligatoria para quienes emiten boletas de honorarios por sobre un monto mínimo anual. Durante el período de transición existe la opción de cotizar de forma parcial, pero eso reduce la cobertura de salud, el monto de las pensiones y las prestaciones del seguro de accidentes. La opción se ejerce en la Operación Renta.',
    },
    {
      q: '¿Qué pasa si emito boletas y trabajo con horario y jefatura?',
      a: 'Puede ser una relación laboral encubierta. Si hay subordinación y dependencia, la Dirección del Trabajo o los tribunales pueden declarar que existía contrato de trabajo, con pago retroactivo de cotizaciones, indemnizaciones y multas para la empresa. La forma del documento no define la naturaleza de la relación.',
    },
    {
      q: '¿Las boletas de honorarios cuentan para pedir un crédito?',
      a: 'Sí. Los bancos suelen pedir 12 a 24 meses de boletas y calcular la renta líquida promedio descontando la retención y una estimación de cotizaciones. Por eso conviene boletear todo lo que se cobra: la renta no declarada no se puede acreditar.',
    },
    {
      q: '¿Puedo rebajar gastos de mis honorarios?',
      a: 'Sí. La Ley de la Renta permite al trabajador independiente rebajar los gastos efectivos acreditados, o acogerse a la presunción de gastos del 30% de los ingresos brutos con un tope de 15 UTA anuales. Se elige en la declaración anual del Formulario 22.',
    },
    {
      q: '¿La retención sube todos los años?',
      a: 'Sí, hasta 2028. La Ley 21.133 fijó una gradualidad para financiar las cotizaciones del independiente: 14,5% en 2025, 15,25% en 2026, 16% en 2027 y 17% desde 2028 en adelante, donde se estabiliza.',
    },
    {
      q: '¿Tengo que emitir boleta por cualquier monto?',
      a: 'Sí. No hay monto mínimo exento para emitir boleta de honorarios: cualquier servicio personal que prestes como independiente debe documentarse. El SII permite emitirlas de forma electrónica y gratuita desde su sitio, y la retención se calcula automáticamente.',
    },
  ],

  sources: [
    {
      name: 'SII — aumento gradual de la tasa de retención de honorarios (Ley 21.133)',
      url: 'https://www.sii.cl/destacados/boletas_honorarios/aumento_gradual.html',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Ley 21.133 — incorporación de los trabajadores independientes a los regímenes de protección social',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=1128420',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'DL 825 sobre Impuesto a las Ventas y Servicios — exenciones del Art. 12',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=6368',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'SII — boleta de honorarios electrónica',
      url: 'https://www.sii.cl/servicios_online/1039-.html',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Superintendencia de Pensiones — cotización del trabajador independiente y tope imponible',
      url: 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9891.html',
      publisher: 'Superintendencia de Pensiones',
    },
    {
      name: 'UF, UTM y UTA del día',
      url: 'https://mindicador.cl/',
      publisher: 'mindicador.cl (Banco Central de Chile / SII)',
    },
  ],

  replaces: [
    '/calculadora-sii-boleta-honorarios-2026',
    '/calculadora-iva-honorarios-chile-10-porciento-retencion',
    '/calculadora-aporte-trabajador-honorarios-chile-cotizacion-obligatoria',
  ],

lastReviewed: '2026-08-16',
};
