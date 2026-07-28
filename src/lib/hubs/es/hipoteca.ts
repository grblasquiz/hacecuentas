import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Cuánto pago de hipoteca y me conviene amortizar?"
 *
 * Absorbe 3 calculadoras: cuota con Euríbor, amortización anticipada (plazo o
 * cuota) y revisión con el Euríbor histórico.
 *
 * NO hay dato vivo del Euríbor en src/data/live/*.json (sólo hay tasas de AR y
 * de LATAM), así que el índice es un campo editable con el último valor que
 * ponga el usuario. Queda reportado.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANZAS =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'es/vivienda/hipoteca',
  title: 'Hipoteca en España: cuota con Euríbor y si conviene amortizar',
  description:
    'Calcula la cuota de tu hipoteca fija o variable con el Euríbor, cómo cambia en la revisión y cuánto ahorras amortizando: reduciendo cuota o reduciendo plazo.',
  silo: 'Vivienda',
  siloHref: '/es/vivienda',

  eyebrow: 'Guía hipotecaria',
  h1: '¿Cuánto pago de hipoteca y me sale a cuenta amortizar?',
  lede:
    'Una hipoteca española de tipo variable se revisa con el Euríbor más un diferencial, así que la cuota que firmaste no es la que vas a pagar toda la vida. Y cuando llega dinero extra aparece siempre la misma duda: amortizar bajando la cuota, para respirar cada mes, o bajando el plazo, que es lo que de verdad ahorra intereses.',
  stamps: ['Sistema de amortización francés', 'Euríbor editable', '3 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué quieres calcular?',
    intro: 'La cuota, la revisión anual o el efecto de meter dinero extra.',
    items: [
      {
        id: 'variable',
        label: 'Hipoteca variable',
        hint: 'Euríbor más diferencial',
        answer:
          'En variable la cuota se recalcula en cada revisión con el Euríbor del mes de referencia más tu diferencial.',
        yes: [
          'Cuota por el sistema francés: cuota constante entre revisiones',
          'Tipo aplicable: Euríbor del mes de referencia más el diferencial de tu escritura',
          'Revisión anual o semestral, según contrato',
          'Los primeros años la mayor parte de la cuota son intereses',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'El Euríbor que se aplica es el del mes que diga tu escritura, no el del día de la revisión',
          'Muchas hipotecas tienen bonificaciones por domiciliar nómina, seguros o alarma: al perderlas sube el diferencial',
          'Un cambio de un punto en el Euríbor mueve la cuota decenas de euros al mes en un préstamo medio',
        ],
        plazo: 'la revisión se aplica en la fecha que fija la escritura, normalmente cada 12 meses.',
      },
      {
        id: 'fija',
        label: 'Hipoteca fija',
        hint: 'Misma cuota toda la vida',
        answer:
          'En fija la cuota no cambia: pagas más al principio que una variable barata, pero no dependes del índice.',
        yes: [
          'Tipo cerrado para toda la vida del préstamo',
          'Cuota constante desde la primera hasta la última',
          'Sin riesgo de subidas del Euríbor',
          'Suele llevar comisión por amortización anticipada distinta de la variable',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Las comisiones por amortización anticipada y por subrogación tienen topes legales distintos en fija y en variable',
          'Comparar fija y variable sólo por la cuota del primer año es el error clásico: hay que mirar el coste total',
        ],
        plazo: 'la oferta vinculante tiene una validez mínima legal antes de firmar.',
      },
      {
        id: 'amortizar_cuota',
        label: 'Amortizar reduciendo cuota',
        hint: 'Respirar cada mes',
        answer:
          'Reducir cuota baja el pago mensual pero mantiene el plazo, así que ahorra menos intereses.',
        yes: [
          'La cuota baja de inmediato desde la siguiente mensualidad',
          'El plazo se mantiene igual',
          'Da aire al presupuesto mensual',
          'El ahorro de intereses existe, pero es menor que reduciendo plazo',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Si tu objetivo es pagar menos intereses en total, ésta es la opción peor de las dos',
          'La comisión por amortización anticipada tiene topes legales y sólo puede cobrarse durante los primeros años',
        ],
        plazo: 'la nueva cuota se aplica desde el siguiente recibo tras la operación.',
      },
      {
        id: 'amortizar_plazo',
        label: 'Amortizar reduciendo plazo',
        hint: 'Ahorrar intereses',
        answer:
          'Reducir plazo mantiene la cuota y acorta la vida del préstamo: es lo que más intereses ahorra.',
        yes: [
          'La cuota sigue igual',
          'El préstamo termina antes, a veces años antes',
          'El ahorro de intereses es mucho mayor que reduciendo cuota',
          'Cuanto antes se hace, más ahorra: al principio la cuota es casi toda intereses',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'No alivia el presupuesto mensual: sigues pagando lo mismo cada mes',
          'Antes de amortizar conviene comparar con lo que rendiría ese dinero invertido a un plazo similar',
        ],
        plazo: 'el nuevo cuadro de amortización se entrega tras la operación.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'El capital pendiente está en tu último recibo o en la banca electrónica, junto al plazo que te queda.',
  fields: [
    { id: 'capital', label: 'Capital pendiente', prefix: '€', value: '150.000', thousands: true },
    { id: 'plazo', label: 'Años que te quedan', type: 'number', value: '25', min: 1, max: 40, step: 1 },
    {
      id: 'euribor',
      label: 'Euríbor del mes de referencia',
      type: 'number',
      value: '2,5',
      min: -1,
      max: 10,
      step: 0.01,
      suffix: '%',
      help: 'Publicado cada mes por el Banco de España. Ponlo tú: aquí no hay dato en vivo.',
    },
    {
      id: 'diferencial',
      label: 'Diferencial de tu escritura',
      type: 'number',
      value: '0,9',
      min: 0,
      max: 3,
      step: 0.05,
      suffix: '%',
    },
    {
      id: 'tipoFijo',
      label: 'Tipo fijo (si tu hipoteca es fija)',
      type: 'number',
      value: '3',
      min: 0,
      max: 10,
      step: 0.05,
      suffix: '%',
    },
    { id: 'amortizacion', label: 'Cantidad que quieres amortizar', prefix: '€', value: '10.000', thousands: true },
    {
      id: 'euriborAnterior',
      label: 'Euríbor de la revisión anterior',
      type: 'number',
      value: '3,5',
      min: -1,
      max: 10,
      step: 0.01,
      suffix: '%',
      help: 'Para ver cuánto te cambia la cuota en la próxima revisión.',
    },
  ],
  fineprint: DISCLAIMER_FINANZAS,

  chart: {
    type: 'donut',
    title: 'Capital e intereses de lo que te queda',
    caption:
      'De todo lo que vas a pagar hasta el final, esta es la parte que amortiza deuda y la que se va en intereses.',
  },
  breakdownTitle: 'Tu hipoteca, en números',
  breakdownIntro:
    'Los importes son del préstamo completo salvo donde se indica. Las filas de porcentaje y de años llevan su unidad.',

  faq: [
    {
      q: '¿Cómo se calcula la cuota de una hipoteca?',
      a: 'Con el sistema francés, que es el que usan prácticamente todas las hipotecas españolas: la cuota es constante y se reparte entre intereses y capital, con muchos intereses al principio y mucho capital al final. Por eso amortizar pronto ahorra mucho más que amortizar tarde.',
    },
    {
      q: '¿Cuándo se revisa una hipoteca variable?',
      a: 'En la fecha que marque la escritura, normalmente cada doce meses y en algunos contratos cada seis. Se aplica el Euríbor publicado del mes de referencia que indique el contrato, que suele ser uno o dos meses antes de la revisión, más el diferencial pactado.',
    },
    {
      q: '¿Cuánto sube mi cuota si sube el Euríbor un punto?',
      a: 'Depende del capital pendiente y del plazo restante, pero en un préstamo medio a veinte o veinticinco años, un punto se traduce en varias decenas de euros al mes. Cuanto más capital quede y más largo sea el plazo, mayor es el impacto.',
    },
    {
      q: '¿Me conviene fija o variable?',
      a: 'Es una decisión sobre el riesgo que quieres asumir, no sobre qué es más barato: la fija cuesta más si el índice se queda bajo y menos si sube. Comparar sólo la cuota del primer año es el error habitual; hay que mirar el coste total en escenarios distintos.',
    },
    {
      q: '¿Amortizar reduciendo cuota o reduciendo plazo?',
      a: 'Reducir plazo ahorra bastante más intereses porque elimina los últimos años de préstamo enteros. Reducir cuota alivia el presupuesto mensual pero mantiene la vida del préstamo. Si el objetivo es pagar menos en total, plazo; si el objetivo es respirar, cuota.',
    },
    {
      q: '¿Amortizar tiene comisión?',
      a: 'Puede tenerla, con topes legales que dependen de si la hipoteca es fija o variable y de los años transcurridos, y sólo durante una parte de la vida del préstamo. Además, la comisión nunca puede superar la pérdida financiera real de la entidad.',
    },
    {
      q: '¿Es mejor amortizar o invertir ese dinero?',
      a: 'Amortizar equivale a una rentabilidad segura igual al tipo de tu hipoteca. Con tipos bajos, invertir puede rendir más; con tipos altos, amortizar gana casi siempre porque el ahorro es seguro y no tributa. La comparación honesta es contra un producto sin riesgo del mismo plazo.',
    },
    {
      q: '¿Qué es el diferencial?',
      a: 'El margen fijo que el banco suma al índice de referencia en las hipotecas variables. Se pacta al firmar y no cambia durante la vida del préstamo, salvo por las bonificaciones ligadas a contratar productos: nómina, seguros o tarjetas.',
    },
    {
      q: '¿Compensan las bonificaciones por contratar seguros?',
      a: 'Hay que echar la cuenta: la rebaja del diferencial se compara con lo que cuestan los seguros contratados con el banco frente a los mismos seguros contratados fuera. Muchas veces la bonificación no cubre el sobrecoste, sobre todo pasados los primeros años.',
    },
    {
      q: '¿Puedo cambiar mi hipoteca de banco?',
      a: 'Sí, mediante subrogación de acreedor o cancelando y firmando una nueva. Hay comisiones y gastos, con topes legales, y conviene pedir a tu banco una contraoferta antes: es habitual que iguale las condiciones para no perder la operación.',
    },
    {
      q: '¿Por qué al principio casi no baja el capital?',
      a: 'Porque los intereses se calculan sobre el capital pendiente, que al principio es todo. En una cuota constante, cuanto mayor es la deuda, más parte de la cuota se va en intereses. La proporción se invierte poco a poco, y por eso el préstamo baja tan despacio los primeros años.',
    },
  ],

  sources: [
    {
      name: 'Ley 5/2019 reguladora de los contratos de crédito inmobiliario',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Banco de España — tipos de interés de referencia del mercado hipotecario',
      url: 'https://www.bde.es/webbe/es/estadisticas/recursos/tipos-interes-tipos-cambio.html',
      publisher: 'Banco de España',
    },
    {
      name: 'Portal del Cliente Bancario — hipotecas',
      url: 'https://clientebancario.bde.es/pcb/es/menu-horizontal/productosservici/relacionados/hipotecas/',
      publisher: 'Banco de España',
    },
  ],

  replaces: [
    '/calculadora-hipoteca-euribor-cuota',
    '/calculadora-amortizacion-anticipada-hipoteca-plazo-o-cuota-espana',
    '/calculadora-mibor-euribor-historico-hipoteca-revision',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Topes legales de la comisión por amortización anticipada (Ley 5/2019). */
export const COMISIONES = {
  variablePrimeros5Anios: 0.0015,
  variablePrimeros3Anios: 0.0025,
  fijaPrimeros10Anios: 0.02,
  fijaDespues: 0.015,
};
