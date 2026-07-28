import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Cuánto me cuesta de verdad esta deuda?"
 *
 * Absorbe 3 calculadoras: comparador de TAE y TIN en préstamos personales,
 * interés de las tarjetas revolving y reunificación de deudas.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANZAS =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'es/finanzas/deudas-y-prestamos',
  title: 'Préstamos y deudas en España: TAE frente a TIN, revolving y reunificación',
  description:
    'Calcula lo que cuesta de verdad un préstamo personal en España, cuánto se paga con una tarjeta revolving y si compensa reunificar deudas en una sola cuota.',
  silo: 'Finanzas',
  siloHref: '/es/finanzas',

  eyebrow: 'Guía de crédito',
  h1: '¿Cuánto me cuesta de verdad esta deuda?',
  lede:
    'Una deuda no se mide por la cuota mensual sino por lo que devuelves de más al final. La TAE existe justamente para eso: mete las comisiones y la frecuencia de pago dentro del tipo, y por eso siempre es mayor que el TIN. Con las tarjetas revolving y con las reunificaciones, esa diferencia es la historia entera.',
  stamps: ['TAE frente a TIN', 'Sistema francés de amortización', '3 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué tipo de deuda tienes?',
    intro: 'Las tres se calculan igual, pero cuestan cosas muy distintas.',
    items: [
      {
        id: 'personal',
        label: 'Un préstamo personal',
        hint: 'Cuota fija y plazo cerrado',
        answer:
          'En un préstamo personal la comparación honesta es por TAE, no por cuota: alargar el plazo baja la cuota y sube el coste.',
        yes: [
          'Cuota constante por el sistema francés',
          'TIN, comisión de apertura y de estudio, todo dentro de la TAE',
          'Coste total: lo devuelto menos lo prestado',
          'Posibilidad de amortizar anticipadamente con comisión limitada por ley',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Comparar préstamos por la cuota es engañoso: un plazo más largo siempre da cuota menor y coste total mayor',
          'Los seguros vinculados al préstamo suben el coste real aunque no aparezcan en el TIN',
        ],
        plazo: 'la información normalizada europea debe entregarse antes de firmar.',
      },
      {
        id: 'revolving',
        label: 'Una tarjeta revolving',
        hint: 'La deuda que no baja',
        answer:
          'En una revolving pagas una cuota fija baja y el saldo apenas se reduce: la deuda puede durar años.',
        yes: [
          'Interés muy superior al de un préstamo personal',
          'Cuota fija que se destina primero a intereses',
          'La deuda se prolonga y puede crecer si sigues usando la tarjeta',
          'La ley obliga a informar del coste y a ofrecer alternativas de amortización',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Bajar la cuota de una revolving alarga la deuda de forma dramática: es lo contrario de lo que parece',
          'Los tribunales han anulado contratos revolving por usura y por falta de transparencia: revisa tu contrato si el interés es desproporcionado',
          'Si sigues usando la tarjeta mientras pagas, el saldo puede no bajar nunca',
        ],
        plazo: 'la entidad debe informar periódicamente del tiempo estimado para saldar la deuda.',
      },
      {
        id: 'reunificacion',
        label: 'Reunificar varias deudas',
        hint: 'Una sola cuota, más años',
        answer:
          'Reunificar baja la cuota mensual pero casi siempre alarga el plazo y encarece el total.',
        yes: [
          'Una sola cuota en lugar de varias',
          'Plazo más largo y cuota más baja',
          'Comisiones de apertura, notaría y, si hay garantía hipotecaria, tasación',
          'Suele exigir aportar la vivienda como garantía',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Alargar el plazo casi siempre significa pagar mucho más en intereses aunque la cuota baje',
          'Si la reunificación se garantiza con la vivienda, una deuda de consumo pasa a poner en riesgo tu casa',
          'Los intermediarios de crédito cobran comisiones altas: comprueba que estén registrados en el Banco de España',
        ],
        plazo: 'antes de firmar hay que recibir la información precontractual con la TAE del nuevo préstamo.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro: 'El TIN y la TAE están en la información precontractual que la entidad debe darte.',
  fields: [
    { id: 'capital', label: 'Importe que debes o pides', prefix: '€', value: '10.000', thousands: true },
    { id: 'tin', label: 'TIN del préstamo', type: 'number', value: '8', min: 0, max: 30, step: 0.1, suffix: '%' },
    { id: 'plazoMeses', label: 'Plazo en meses', type: 'number', value: '60', min: 1, max: 480, step: 1 },
    {
      id: 'comisionApertura',
      label: 'Comisión de apertura',
      type: 'number',
      value: '1',
      min: 0,
      max: 10,
      step: 0.1,
      suffix: '%',
    },
    { id: 'tinRevolving', label: 'TIN de la tarjeta revolving', type: 'number', value: '20', min: 0, max: 40, step: 0.5, suffix: '%' },
    { id: 'cuotaRevolving', label: 'Cuota mensual de la revolving', prefix: '€', value: '100', thousands: true },
    { id: 'cuotasActuales', label: 'Suma de las cuotas que pagas ahora', prefix: '€', value: '450', thousands: true },
    { id: 'plazoReunificado', label: 'Plazo de la reunificación en meses', type: 'number', value: '120', min: 12, max: 480, step: 12 },
  ],
  fineprint: DISCLAIMER_FINANZAS,

  chart: {
    type: 'donut',
    title: 'Lo que devuelves',
    caption:
      'De todo lo que vas a pagar, esta parte es el dinero que te prestaron y esta otra es lo que cuesta el crédito.',
  },
  breakdownTitle: 'El coste real del crédito',
  breakdownIntro:
    'Los importes son del préstamo completo. Las filas de porcentaje y meses llevan su unidad.',

  faq: [
    {
      q: '¿Qué diferencia hay entre TIN y TAE?',
      a: 'El TIN es el tipo de interés puro, sin nada más. La TAE incluye además las comisiones y la frecuencia de los pagos, así que refleja el coste efectivo anual. Por eso la TAE siempre es mayor que el TIN, y es la única cifra que sirve para comparar dos ofertas.',
    },
    {
      q: '¿Por qué no debo comparar por la cuota?',
      a: 'Porque la cuota depende sobre todo del plazo. Estirar un préstamo de cinco a diez años baja la cuota casi a la mitad y multiplica los intereses. Dos ofertas con la misma cuota pueden costar miles de euros de diferencia.',
    },
    {
      q: '¿Qué es una tarjeta revolving?',
      a: 'Una tarjeta de crédito en la que devuelves el saldo en cuotas mensuales fijas o en un porcentaje del saldo, con intereses muy superiores a los de un préstamo. La parte de la cuota que va a intereses es tan alta que el capital baja muy despacio.',
    },
    {
      q: '¿Por qué mi deuda de la revolving no baja?',
      a: 'Porque con cuotas bajas, casi todo lo que pagas cada mes se va en intereses y apenas amortizas capital. Si además sigues usando la tarjeta, el saldo puede mantenerse o crecer indefinidamente. Es el motivo por el que muchas deudas revolving duran años.',
    },
    {
      q: '¿Puedo reclamar por una tarjeta revolving?',
      a: 'En algunos casos sí. Los tribunales han anulado contratos por usura cuando el interés es notablemente superior al normal del dinero y desproporcionado, y también por falta de transparencia en la contratación. Conviene revisar el contrato y la documentación entregada.',
    },
    {
      q: '¿Cómo salgo de una revolving?',
      a: 'Subiendo la cuota mensual todo lo que puedas, dejando de usar la tarjeta y, si es viable, sustituyendo la deuda por un préstamo personal de tipo mucho menor. La entidad está obligada a informarte del tiempo estimado para saldarla y a ofrecer alternativas.',
    },
    {
      q: '¿Merece la pena reunificar deudas?',
      a: 'Alivia el mes a mes, pero casi siempre encarece el total porque alarga mucho el plazo. Tiene sentido cuando el problema es de liquidez inmediata y no hay alternativa, y siempre después de comparar la TAE nueva con la media ponderada de las deudas actuales.',
    },
    {
      q: '¿Qué riesgo tiene reunificar con garantía hipotecaria?',
      a: 'Que deudas de consumo, que sólo respondían con tu patrimonio general, pasan a estar garantizadas con tu vivienda. Un impago que antes acababa en un procedimiento ordinario puede acabar en ejecución hipotecaria.',
    },
    {
      q: '¿Puedo amortizar un préstamo personal antes de tiempo?',
      a: 'Sí, y la comisión está limitada por ley a un porcentaje del capital anticipado que depende del plazo restante, sin poder superar el importe de los intereses que habrías pagado. Amortizar pronto ahorra mucho más que amortizar al final.',
    },
    {
      q: '¿Los seguros vinculados cuentan en el coste?',
      a: 'Deben incluirse en la TAE cuando su contratación es obligatoria para obtener el préstamo en esas condiciones. Si te los ofrecen como opcionales pero condicionan el tipo, compara el coste del seguro con la rebaja del tipo antes de aceptar.',
    },
    {
      q: '¿Qué hago antes de firmar cualquier crédito?',
      a: 'Pedir la información normalizada europea, mirar la TAE y no la cuota, calcular el coste total y comprobar que la entidad o el intermediario están registrados en el Banco de España. Un crédito que no te dan por escrito antes de firmar no merece firmarse.',
    },
  ],

  sources: [
    {
      name: 'Ley 16/2011 de contratos de crédito al consumo',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-10970',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Portal del Cliente Bancario — préstamos y tarjetas',
      url: 'https://clientebancario.bde.es/pcb/es/menu-horizontal/productosservici/',
      publisher: 'Banco de España',
    },
    {
      name: 'Orden ETD/699/2020 de regulación del crédito revolvente',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-8646',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Ley 5/2019 — comisiones por amortización anticipada',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814',
      publisher: 'Boletín Oficial del Estado',
    },
  ],

  replaces: [
    '/calculadora-prestamo-personal-tae-tin-comparador-espana',
    '/calculadora-tarjeta-credito-interes-espana-tin-revolving',
    '/calculadora-reunificacion-deudas-espana-cuota-unificada',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Meses máximos que se simulan al proyectar una revolving. */
export const MAX_MESES_SIMULACION = 600;
