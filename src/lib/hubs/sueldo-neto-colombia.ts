import type { HubData } from './types';
import { COLOMBIA_2026 } from '../data/colombia-2026';

/**
 * Hub de decisión — "¿Cuánto me queda en mano del sueldo bruto?" (Colombia)
 *
 * Espejo de src/lib/formulas/sueldo-neto-colombia.ts, pero tomando las
 * constantes de la fuente única src/lib/data/colombia-2026.ts:
 *  - SMLMV y auxilio de transporte (Decretos 1469 y 1470 de 2025)
 *  - UVT vigente (Resolución DIAN 000238 del 15-dic-2025)
 *  - tabla de retención salarial del Art. 383 ET
 *
 * Diferencia deliberada con la fórmula vieja: ésta usaba una UVT estimada de
 * $49.800 (que es la UVT 2025) y no aplicaba el tope anual de 790 UVT a la
 * renta exenta del 25% (Art. 206-10 ET). Acá se usa la UVT vigente y se aplica
 * el tope, que es lo que hace la nómina real.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const UVT_CO = COLOMBIA_2026.uvt;
export const SMLMV_CO = COLOMBIA_2026.smlmv;
export const AUX_TRANSPORTE_CO = COLOMBIA_2026.auxilioTransporte;

/** Aportes obligatorios del trabajador (Ley 100 de 1993). */
export const TASA_SALUD = 4;
export const TASA_PENSION = 4;

/** Renta exenta laboral: 25%, con tope anual de 790 UVT (Art. 206-10 ET). */
export const RENTA_EXENTA_PCT = COLOMBIA_2026.rentaExentaLaboral.porcentaje * 100;
export const RENTA_EXENTA_TOPE_UVT_MES = COLOMBIA_2026.rentaExentaLaboral.topeAnualUvt / 12;

/** Retención en la fuente sobre salarios — Art. 383 ET, en UVT mensuales. */
export const RETEFUENTE_CO: Array<{ desdeUvt: number; hastaUvt: number | null; tasa: number; adicionUvt: number }> =
  COLOMBIA_2026.retefuenteArt383.map((t) => ({
    desdeUvt: t.desdeUvt,
    hastaUvt: Number.isFinite(t.hastaUvt) ? t.hastaUvt : null,
    tasa: t.tasa,
    adicionUvt: t.adicionUvt,
  }));

export const hub: HubData = {
  slug: 'trabajo/sueldo-neto-colombia',
  title: 'Sueldo neto en Colombia: cuánto te queda del salario después de descuentos',
  description:
    'Calculá tu sueldo neto en Colombia con los descuentos de ley: salud 4%, pensión 4%, Fondo de Solidaridad Pensional y retención en la fuente del Art. 383 ET. Incluye el auxilio de transporte y el camino inverso de neto a bruto.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Colombia · salario y descuentos',
  h1: '¿Cuánto me queda en mano del sueldo bruto? (Colombia)',
  lede:
    'De tu salario salen 4% de salud y 4% de pensión siempre. Si ganás más de 4 salarios mínimos se suma el Fondo de Solidaridad, y si tu base gravable es alta, la retención en la fuente. Poné tu sueldo y mirá el desglose.',
  stamps: [
    `SMLMV: $${SMLMV_CO.toLocaleString('es-CO')}`,
    `Auxilio de transporte: $${AUX_TRANSPORTE_CO.toLocaleString('es-CO')}`,
    `UVT: $${UVT_CO.toLocaleString('es-CO')}`,
    'Retención salarial Art. 383 ET',
  ],

  resultLabel: 'Sueldo neto estimado',

  cases: {
    title: '¿Cuál es tu caso?',
    intro: 'Arrancamos por el empleado con contrato laboral, que es de lejos el caso más consultado.',
    items: [
      {
        id: 'empleado',
        label: 'Empleado con contrato laboral',
        hint: 'Aportes de ley descontados del salario, con o sin auxilio de transporte.',
        yes: [
          'Salud: 4% del salario a cargo del trabajador',
          'Pensión: 4% del salario a cargo del trabajador',
          'Fondo de Solidaridad Pensional: 1% adicional si ganás más de 4 SMLMV, y más si superás 16',
          'Retención en la fuente del Art. 383 ET sobre la base depurada',
          'Auxilio de transporte sumado al neto si ganás hasta 2 SMLMV',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El auxilio de transporte no es salario para efectos de aportes, pero sí se paga: por eso suma al neto sin sumar descuentos',
          'Prima, cesantías e intereses de cesantías son pagos aparte y no entran en este cálculo mensual',
        ],
        plazo: 'los aportes a seguridad social se pagan en la planilla PILA según el calendario por dígito del NIT o cédula.',
        answer:
          'Sobre el salario se descuentan siempre 4% de salud y 4% de pensión; el resto de los descuentos depende de cuánto ganes.',
      },
      {
        id: 'neto-a-bruto',
        label: 'Sé el neto que quiero y busco el bruto',
        hint: 'Para negociar salario o traducir una oferta que te dieron "en mano".',
        yes: [
          'La calculadora busca el salario que, después de todos los descuentos, deja el neto que pediste',
          'Usa los mismos aportes y la misma retención que el caso de empleado',
          'Sirve para comparar una oferta en bruto contra una en neto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Poné el neto objetivo en el campo de salario: es el valor que la calculadora persigue',
          'Ojo con el escalón de los 2 SMLMV: pasarlo te hace perder el auxilio de transporte y puede bajarte el neto',
        ],
        plazo: 'todo cambio de salario debe quedar por escrito y reportarse en la siguiente planilla PILA.',
        answer:
          'El bruto necesario sube más rápido que el neto por los escalones del Fondo de Solidaridad y de la retención.',
      },
      {
        id: 'independiente',
        label: 'Soy independiente y cotizo por mi cuenta',
        hint: 'No hay empleador que aporte: el porcentaje que sale de tu bolsillo es mucho mayor.',
        yes: [
          'La base de cotización de un independiente es el 40% de sus ingresos mensuales',
          'Sobre esa base paga el 12,5% de salud y el 16% de pensión, todo a su cargo',
          'La calculadora estima ese costo y lo resta de tu ingreso',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Al independiente le corresponde el aporte completo, no el 4% del empleado: por eso el descuento se siente mucho más',
          'A esto se le suman las retenciones que te practiquen tus clientes al facturar',
        ],
        plazo: 'la cotización del independiente se paga mes vencido en la planilla PILA correspondiente.',
        answer:
          'El independiente cotiza sobre el 40% de sus ingresos y paga el aporte completo de salud y pensión, no solo el 8% del empleado.',
      },
    ],
  },

  inputsTitle: 'Tus datos del mes',
  inputsIntro: 'Todo mensual y en pesos colombianos. En el caso "neto a bruto", el primer campo es el neto que querés cobrar.',
  fields: [
    {
      id: 'salario',
      label: 'Salario mensual (COP)',
      prefix: '$',
      value: '3.000.000',
      thousands: true,
      help: 'Bruto en los casos de empleado e independiente; neto objetivo en el caso inverso.',
    },
    {
      id: 'auxilio',
      label: '¿Te pagan auxilio de transporte?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, si me corresponde' },
        { value: 'no', label: 'No' },
      ],
      help: 'Solo aplica a quien gana hasta 2 salarios mínimos. Por encima de eso no corresponde.',
    },
    {
      id: 'otros',
      label: 'Otros descuentos del mes (COP)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Libranzas, préstamos, cooperativa o embargos que aparezcan en tu desprendible.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde va tu salario',
    caption: 'Compara lo que te queda contra cada descuento: salud, pensión, Fondo de Solidaridad y retención en la fuente.',
  },
  breakdownTitle: 'Descuento por descuento',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del mes.',

  faq: [
    {
      q: '¿Cuánto me descuentan del salario en Colombia?',
      a: 'Un 8% fijo: 4% de salud y 4% de pensión, ambos a cargo del trabajador. Si ganás más de 4 salarios mínimos se suma un 1% de Fondo de Solidaridad Pensional, que crece hasta un 2% en salarios muy altos. Y si tu base gravable depurada supera 95 UVT mensuales, aparece la retención en la fuente. Un salario medio típico se queda en ese 8%.',
    },
    {
      q: '¿Quién tiene derecho al auxilio de transporte?',
      a: 'Quien gana hasta 2 salarios mínimos legales mensuales. Es un pago adicional al salario que no constituye factor salarial para aportes de seguridad social, así que suma a tu neto sin que le descuenten salud ni pensión. Si tu salario supera los 2 SMLMV, el auxilio deja de corresponder por completo, no se reduce proporcionalmente.',
    },
    {
      q: '¿Qué es el Fondo de Solidaridad Pensional?',
      a: 'Es un aporte adicional que hacen los trabajadores que ganan más de 4 salarios mínimos, para financiar pensiones de quienes no alcanzan a cotizar. Empieza en 1% del salario y sube de forma escalonada, con incrementos de 0,2 puntos por cada salario mínimo por encima de 16 SMLMV, hasta un máximo de 2%.',
    },
    {
      q: '¿Desde qué salario me retienen en la fuente?',
      a: 'La retención del Art. 383 ET arranca cuando la base gravable depurada supera 95 UVT mensuales. Esa base no es tu salario: primero se restan los aportes obligatorios de salud, pensión y Fondo de Solidaridad, y después la renta exenta del 25%. Por eso el salario bruto donde empieza la retención es bastante más alto que 95 UVT.',
    },
    {
      q: '¿Qué es la renta exenta del 25%?',
      a: 'El Art. 206 numeral 10 del Estatuto Tributario deja exento el 25% del pago laboral una vez descontados los aportes obligatorios, con un tope anual de 790 UVT. Es el beneficio más grande que tiene un asalariado y la razón por la que muchos salarios altos igual no llegan a retención. Esta calculadora aplica el tope, cosa que muchas planillas simplificadas se saltan.',
    },
    {
      q: '¿La retención en la fuente es un impuesto aparte de la declaración de renta?',
      a: 'No, es un anticipo del mismo impuesto. Todo lo que te retuvieron durante el año se acredita contra el impuesto que liquides en tu declaración. Si te retuvieron de más, queda saldo a favor para devolución o para imputar al año siguiente.',
    },
    {
      q: '¿Cuánto paga un independiente comparado con un empleado?',
      a: 'Mucho más. El independiente cotiza sobre el 40% de sus ingresos mensuales, pero paga el aporte completo: 12,5% de salud y 16% de pensión, sin empleador que ponga la mayor parte. En un empleado, el patrón aporta 8,5% de salud y 12% de pensión sobre el salario; el trabajador solo pone el 4% y el 4%.',
    },
    {
      q: '¿Prima, cesantías y vacaciones se descuentan igual?',
      a: 'No. La prima de servicios y las cesantías no son base de aportes a salud y pensión. Las vacaciones sí generan aportes a pensión pero no a salud en la práctica habitual de nómina. Esta calculadora estima el mes ordinario de salario, sin prestaciones sociales.',
    },
    {
      q: '¿El salario integral se calcula igual?',
      a: 'No. El salario integral, que aplica a partir de 13 salarios mínimos, se compone de un factor salarial del 70% y un factor prestacional del 30%. Los aportes a seguridad social se calculan sobre el 70%, no sobre el total, así que el descuento porcentual sobre el paquete completo es menor. Esta página calcula un salario ordinario.',
    },
    {
      q: '¿Por qué mi desprendible real da distinto?',
      a: 'Las causas más frecuentes son que la empresa aplique el procedimiento 2 de retención, que promedia los ingresos del año anterior en vez de mirar mes a mes; que tengas deducciones adicionales cargadas, como dependientes, medicina prepagada o intereses de vivienda; o que tengas descuentos de libranza, cooperativa o embargos. También cambia el resultado si tu salario tiene pagos variables como comisiones.',
    },
    {
      q: '¿Puedo bajar la retención declarando dependientes?',
      a: 'Sí. La deducción por dependientes, los intereses de crédito de vivienda, la medicina prepagada y los aportes voluntarios a pensión o AFC bajan la base gravable y por lo tanto la retención mensual. Hay que informarlos formalmente al empleador con los soportes que exija, y quedan sujetos a los límites del Estatuto Tributario.',
    },
    {
      q: '¿Qué pasa si mi salario es exactamente el mínimo?',
      a: 'Te descuentan igual el 4% de salud y el 4% de pensión, no hay exención por ganar el mínimo. A cambio te corresponde el auxilio de transporte completo, que suma al neto sin aportes. No hay Fondo de Solidaridad ni retención en la fuente en ese nivel de ingreso.',
    },
  ],

  sources: [
    {
      name: 'Decreto 1469 de 2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '29-12-2025',
    },
    {
      name: 'Decreto 1470 de 2025 — auxilio de transporte',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'Ministerio del Trabajo',
      date: '29-12-2025',
    },
    {
      name: 'Resolución DIAN 000238 del 15-12-2025 — valor de la UVT',
      url: 'https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000238%20de%2015-12-2025.pdf',
      publisher: 'DIAN',
      date: '15-12-2025',
    },
    {
      name: 'Estatuto Tributario — Art. 383, retención en la fuente sobre rentas de trabajo',
      url: 'https://estatuto.co/383',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario — Art. 206 num. 10, renta exenta del 25%',
      url: 'https://estatuto.co/206',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Ley 100 de 1993 — aportes a salud, pensión y Fondo de Solidaridad Pensional',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=5248',
      publisher: 'Función Pública',
    },
  ],

  replaces: ['/calculadora-sueldo-neto-colombia-2026'],

  lastReviewed: '2026-07-27',
};
