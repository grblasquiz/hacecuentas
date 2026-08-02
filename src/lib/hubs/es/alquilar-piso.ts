import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Cuánto cuesta entrar a un alquiler y cuánto renta ponerlo?"
 *
 * Absorbe 5 calculadoras: fianza y costes de entrada, precio de trastero y
 * garaje, rentabilidad bruta y neta, IRPF del arrendador e IRNR de no residentes.
 *
 * 🔴 La fórmula vieja irpf-alquiler-vivienda-arrendador-espana.ts aplica al
 * rendimiento del alquiler una escala inventada (19/21/24/30/37/45 con cortes en
 * 10.000, 20.000, 35.000 y 60.000) que no es ni la escala general del IRPF ni la
 * del ahorro. Aquí se usa la escala general real, que es donde tributa el
 * rendimiento del capital inmobiliario. Queda reportado.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'es/vivienda/alquilar-piso',
  title: 'Alquilar un piso en España: fianza, rentabilidad e IRPF del arrendador',
  description:
    'Calcula lo que cuesta entrar a un alquiler en España y lo que renta ponerlo: fianza y garantías de la LAU, rentabilidad bruta y neta, IRPF del arrendador e IRNR de no residentes.',
  silo: 'Vivienda',
  siloHref: '/es/vivienda',

  eyebrow: 'Guía de alquiler',
  h1: 'Alquilar un piso: ¿qué me cuesta entrar y qué renta ponerlo?',
  lede:
    'El alquiler tiene dos caras y las dos tienen números claros. El inquilino se enfrenta a la entrada: una mensualidad de fianza obligatoria por ley y, como mucho, dos meses más de garantía adicional. El propietario se enfrenta a la rentabilidad real, que no es el alquiler dividido entre el precio, sino lo que queda después de gastos e IRPF.',
  stamps: ['Ley de Arrendamientos Urbanos', 'Reducción del art. 23.2 del IRPF', '5 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿De qué lado estás?',
    intro: 'Los límites de la fianza son ley; la rentabilidad depende de tus números.',
    items: [
      {
        id: 'inquilino',
        label: 'Soy inquilino',
        hint: 'Fianza y coste de entrada',
        answer:
          'La fianza legal es de una mensualidad en vivienda, y la garantía adicional no puede pasar de dos mensualidades más.',
        yes: [
          'Una mensualidad de fianza obligatoria, depositada en el organismo autonómico',
          'Garantía adicional de hasta dos mensualidades como máximo',
          'La primera mensualidad por adelantado',
          'Los gastos de gestión inmobiliaria los paga el arrendador, no el inquilino',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Pedir más de dos mensualidades de garantía adicional en vivienda habitual es ilegal',
          'La fianza debe depositarse en el organismo de la comunidad autónoma: si no está depositada, reclamar su devolución es más difícil',
          'La fianza se devuelve en el plazo de un mes desde la entrega de llaves; pasado ese plazo devenga intereses',
        ],
        plazo: 'la devolución de la fianza vence al mes de la entrega de llaves.',
      },
      {
        id: 'propietario',
        label: 'Soy propietario residente',
        hint: 'Rentabilidad e IRPF',
        answer:
          'La rentabilidad neta descuenta gastos, IBI, comunidad, seguro y el IRPF que pagas por el rendimiento.',
        yes: [
          'Rentabilidad bruta: alquiler anual sobre el precio de compra',
          'Rentabilidad neta: descontando IBI, comunidad, seguro, mantenimiento y vacíos',
          'Gastos deducibles en el IRPF, incluida la amortización del 3% del valor de construcción',
          'Reducción del rendimiento neto por alquiler de vivienda habitual',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La reducción general por alquiler de vivienda bajó del 60% al 50% con la ley de vivienda, con porcentajes mejorados en zonas tensionadas o con inquilinos jóvenes: comprueba cuál te aplica',
          'El rendimiento del alquiler va a la base general del IRPF y se suma a tu sueldo: puede empujarte de tramo',
          'Los meses vacíos y los impagos no se descuentan de la base imponible como gasto: hay reglas específicas',
        ],
        plazo: 'se declara en la Renta del año siguiente, entre abril y junio.',
      },
      {
        id: 'noresidente',
        label: 'Soy propietario no residente',
        hint: 'IRNR con el modelo 210',
        answer:
          'Un no residente tributa por IRNR: 19% con gastos deducibles si reside en la UE, Islandia, Noruega o Liechtenstein, y 24% sobre el ingreso bruto en el resto.',
        yes: [
          'Tipo del 19% para residentes en la UE y el EEE, con gastos deducibles',
          'Tipo del 24% para el resto del mundo, sin poder deducir gastos',
          'Declaración con el modelo 210',
          'Sin derecho a la reducción por alquiler de vivienda habitual',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La diferencia entre el 19% con gastos y el 24% sin gastos es enorme: puede duplicar la factura fiscal',
          'Hay que revisar el convenio de doble imposición del país de residencia para no pagar dos veces',
          'Si vendes siendo no residente, el comprador retiene un 3% a cuenta del impuesto',
        ],
        plazo: 'el modelo 210 se presenta con periodicidad trimestral o anual, según el tipo de renta.',
      },
      {
        id: 'trastero',
        label: 'Alquilo trastero o garaje',
        hint: 'Sin reducción y con IVA',
        answer:
          'Un trastero o garaje alquilado aparte no es vivienda: no tiene reducción y lleva IVA del 21%.',
        yes: [
          'Rendimiento íntegro sin ninguna reducción por vivienda',
          'IVA del 21% que hay que repercutir y liquidar',
          'Gastos deducibles de mantenimiento y comunidad',
          'Si va incluido en el contrato de la vivienda, sigue el régimen de la vivienda',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Alquilar el garaje por separado obliga a darse de alta a efectos de IVA y a presentar el modelo 303',
          'Es el error más común del pequeño propietario: se declara como si fuera vivienda y no lo es',
        ],
        plazo: 'el IVA del modelo 303 vence el 20 de abril, julio y octubre, y el 30 de enero.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'Para la rentabilidad usa el precio total pagado, incluidos impuestos y gastos de la compra.',
  fields: [
    { id: 'renta', label: 'Alquiler mensual', prefix: '€', value: '900', thousands: true },
    { id: 'precioCompra', label: 'Precio total pagado por el piso', prefix: '€', value: '200.000', thousands: true },
    {
      id: 'garantia',
      label: 'Meses de garantía adicional que te piden',
      type: 'number',
      value: '1',
      min: 0,
      max: 6,
      step: 1,
      help: 'El máximo legal en vivienda habitual son dos meses, además de la fianza.',
    },
    { id: 'gastosAnuales', label: 'Gastos anuales del piso (IBI, comunidad, seguro, mantenimiento)', prefix: '€', value: '1.800', thousands: true },
    {
      id: 'mesesVacio',
      label: 'Meses vacíos al año que esperas',
      type: 'number',
      value: '1',
      min: 0,
      max: 12,
      step: 1,
    },
    {
      id: 'reduccion',
      label: 'Reducción por alquiler de vivienda que te aplica',
      type: 'select',
      value: '50',
      options: [
        { value: '50', label: '50% general' },
        { value: '60', label: '60% tras rehabilitación reciente' },
        { value: '70', label: '70% inquilino joven en zona tensionada' },
        { value: '90', label: '90% rebaja de renta en zona tensionada' },
        { value: '0', label: 'Sin reducción (no es vivienda habitual)' },
      ],
    },
    {
      id: 'tipoMarginal',
      label: 'Tu tipo marginal del IRPF',
      type: 'number',
      value: '30',
      min: 0,
      max: 50,
      step: 1,
      suffix: '%',
      help: 'El del último euro de tu sueldo. Lo calcula el hub de IRPF de la nómina.',
    },
    {
      id: 'residencia',
      label: 'Dónde resides fiscalmente',
      type: 'select',
      value: 'espana',
      options: [
        { value: 'espana', label: 'España' },
        { value: 'ue', label: 'Unión Europea, Islandia, Noruega o Liechtenstein' },
        { value: 'resto', label: 'Resto del mundo' },
      ],
    },
  ],
  fineprint: DISCLAIMER_FISCAL,

  chart: {
    type: 'donut',
    title: 'A dónde va el alquiler que cobras',
    caption:
      'Del alquiler bruto anual, una parte se va en gastos del piso, otra en impuestos y el resto es la rentabilidad real.',
  },
  breakdownTitle: 'Los números del alquiler',
  breakdownIntro:
    'Los importes son anuales salvo donde se indica. Las filas de porcentaje y de meses llevan su unidad.',

  faq: [
    {
      q: '¿Cuánto pueden pedirme al entrar a un alquiler?',
      a: 'La primera mensualidad, una mensualidad de fianza legal obligatoria y, como máximo, dos mensualidades más de garantía adicional. Pedir más de eso en un alquiler de vivienda habitual es ilegal, por mucho que se llame depósito, aval o garantía.',
    },
    {
      q: '¿Qué pasa con la fianza al terminar el contrato?',
      a: 'Se devuelve en el plazo de un mes desde la entrega de llaves, descontando sólo los desperfectos que excedan el desgaste normal por el uso. Pasado ese mes, la cantidad devenga intereses a favor del inquilino. La fianza no es el último mes de renta: usarla así incumple el contrato.',
    },
    {
      q: '¿Quién paga la agencia inmobiliaria?',
      a: 'El arrendador. Los gastos de gestión inmobiliaria y de formalización del contrato corren por cuenta del propietario cuando es persona jurídica y, desde la ley de vivienda, también en el resto de casos de arrendamiento de vivienda.',
    },
    {
      q: '¿Cómo se calcula la rentabilidad de un alquiler?',
      a: 'La bruta es el alquiler anual dividido entre el precio total pagado por el inmueble, gastos e impuestos de compra incluidos. La neta descuenta IBI, comunidad, seguro, mantenimiento, meses vacíos y el IRPF. Entre una y otra suele haber dos puntos porcentuales de diferencia.',
    },
    {
      q: '¿Cuánto se paga de IRPF por alquilar un piso?',
      a: 'El rendimiento neto —alquiler menos gastos deducibles— va a la base general y tributa a tu tipo marginal, es decir, se suma a tu sueldo. Antes se aplica la reducción por alquiler de vivienda habitual, que es la que hace el alquiler fiscalmente atractivo.',
    },
    {
      q: '¿Cuánto es hoy esa reducción?',
      a: 'La ley de vivienda rebajó la reducción general del 60% al 50%, y creó porcentajes mejorados: hasta el 90% si se rebaja la renta en zona tensionada, el 70% con inquilino joven en zona tensionada o alquiler a administraciones y entidades sociales, y el 60% tras una rehabilitación reciente. Muchas calculadoras siguen aplicando el 60% antiguo a todo.',
    },
    {
      q: '¿Qué gastos me puedo deducir como arrendador?',
      a: 'IBI, comunidad, seguro, suministros que pagues tú, intereses del préstamo, gastos de conservación y reparación, honorarios de gestión, y la amortización del 3% sobre el mayor entre el valor de construcción y el coste de adquisición. Los intereses y la conservación tienen el límite conjunto del rendimiento íntegro.',
    },
    {
      q: '¿Qué diferencia hay entre conservación y mejora?',
      a: 'La conservación mantiene el inmueble en uso —pintar, arreglar una avería— y se deduce en el año. La mejora amplía la capacidad o la vida útil —cambiar toda la instalación, cerrar una terraza— y no se deduce: se amortiza y se suma al valor de adquisición cuando vendas.',
    },
    {
      q: '¿Y si soy no residente?',
      a: 'Se tributa por el IRNR con el modelo 210. Los residentes en la Unión Europea, Islandia, Noruega y Liechtenstein pagan el 19% pudiendo deducir gastos; el resto paga el 24% sobre el ingreso bruto, sin deducir nada. Ninguno de los dos tiene derecho a la reducción por vivienda habitual.',
    },
    {
      q: '¿El garaje tributa igual que el piso?',
      a: 'No, si se alquila por separado. Deja de ser arrendamiento de vivienda: no tiene reducción, tributa el rendimiento íntegro y además lleva IVA del 21%, con obligación de presentar el modelo 303. Sólo sigue el régimen de la vivienda cuando va incluido en el mismo contrato.',
    },
    {
      q: '¿Los meses vacíos se pueden descontar?',
      a: 'No como gasto sin más. Durante los períodos en que la vivienda no está alquilada hay que imputar renta inmobiliaria, un porcentaje del valor catastral, y los gastos sólo se deducen en la parte proporcional al tiempo alquilado. Es la sorpresa habitual de quien tiene el piso medio año vacío.',
    },
  ],

  sources: [
    {
      name: 'Ley 29/1994 de Arrendamientos Urbanos — fianza y garantías adicionales',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Ley 12/2023 por el derecho a la vivienda',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Ley 35/2006 del IRPF — rendimientos del capital inmobiliario y art. 23.2',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Modelo 210 — Impuesto sobre la Renta de no Residentes',
      url: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GH01.shtml',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
  ],

  replaces: [
    '/calculadora-contrato-alquiler-espana-fianza-aval-mes-renta',
    '/calculadora-trastero-garaje-precio-alquiler-espana-2026',
    '/calculadora-rentabilidad-alquiler-bruta-neta-espana',
    '/calculadora-irpf-alquiler-vivienda-arrendador-espana',
    '/calculadora-irnr-no-residentes-alquiler-vivienda-espana',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Límites de fianza y garantías de la LAU. */
export const LAU = {
  mesesFianzaVivienda: 1,
  maxMesesGarantiaAdicional: 2,
  plazoDevolucionDias: 30,
};

/** Tipos del IRNR. Espejo de irnr-no-residentes-alquiler-vivienda-espana.ts. */
export const IRNR = { ue: 0.19, resto: 0.24 };

/** IVA del alquiler de plazas de garaje y trasteros por separado. */
export const IVA_GARAJE = 0.21;

/** Amortización deducible del inmueble: 3% del valor de construcción. */
export const AMORTIZACION_PCT = 0.03;
