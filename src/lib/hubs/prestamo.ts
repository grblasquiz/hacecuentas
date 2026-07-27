import type { HubData } from './types';
import tasasLive from '../../data/live/tasas.json';
import { BNA_PRESTAMO_2026 } from '../data/argentina-2026';

/**
 * Hub de decisión — "¿Cuánto voy a pagar por este préstamo?"
 * Arquetipo RAMIFICADO: el motor de cálculo es siempre el mismo (sistema
 * francés + TIR del flujo real), lo que cambia es qué cargos entran y contra
 * qué se compara el resultado.
 *
 * Absorbe 10 URLs (ver hub.replaces).
 *
 * DIFERENCIA con los hubs vecinos — no se pisan:
 *   · /vivienda/credito-hipotecario  → hipotecario UVA a 20 o 30 años, con
 *     capital indexado. Otra vida, otra cuota, otro riesgo.
 *   · /deudas/salir-de-deudas        → ya tenés la deuda tomada y querés salir
 *     (refinanciar, cancelar anticipado, bola de nieve).
 *   · /finanzas-personales/gastos-del-mes → a dónde se te va el sueldo.
 *   Este es el momento ANTES de firmar: cuánto te sale el préstamo personal,
 *   prendario o pyme que te están ofreciendo, y si la cuota te entra.
 *
 * EL PUNTO DEL HUB es la brecha entre TNA y CFT. La TNA es la tasa de la
 * vidriera; el CFT es la TIR del flujo real, con IVA sobre intereses, seguro de
 * vida y gastos de otorgamiento adentro. Ahí es donde la gente se come el costo.
 *
 * DATOS VIVOS: la TNA por defecto sale de src/data/live/tasas.json (serie 14
 * del BCRA, "Tasa préstamos personales"), refrescada por el cron. Nada de tasas
 * hardcodeadas en el copy.
 *
 * YMYL DE PLATA: el aviso del dominio `finance` de src/lib/disclaimers.ts viaja
 * textual en hub.fineprint y como PRIMER `warn` de cada rama.
 *
 * NOTAS DE CONTRATO:
 *  - El hub es de plata, así que el default 'ars' sirve; las filas de tasas y
 *    ratios llevan `format: 'unit'` explícito con unidad '%'.
 *  - `chart.type: 'donut'`: composición del total pagado. En la rama de
 *    capacidad de pago la composición es la del ingreso mensual.
 */

const TASA_PERSONALES = tasasLive.prestamos_personales;

export const hub: HubData = {
  slug: 'finanzas-personales/prestamo',
  title: '¿Cuánto voy a pagar por este préstamo? Cuota, CFT y capacidad de pago',
  description:
    'Calculá la cuota real de un préstamo personal, prendario o pyme y, sobre todo, el CFT: la tasa que suma IVA sobre intereses, seguro de vida y gastos de otorgamiento. Compará dos ofertas y mirá si la cuota te entra en el ingreso.',
  silo: 'Finanzas personales',
  siloHref: '/finanzas-personales',

  eyebrow: 'Guía y estimación de crédito',
  h1: '¿Cuánto voy a pagar por este préstamo?',
  lede:
    'La cuota que te dicen por teléfono casi nunca es la que vas a pagar. Entre la TNA de la vidriera y el CFT del contrato hay IVA sobre los intereses, seguro de vida y gastos de otorgamiento. Acá ves las dos cifras juntas y la diferencia entre ellas.',
  stamps: [
    'Actualizado 27-07-2026',
    `TNA de referencia BCRA: ${TASA_PERSONALES.valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
    '10 calculadoras adentro',
  ],

  resultLabel: 'Lo que vas a pagar en total',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Todas las ramas usan el mismo motor: cuota por sistema francés y CFT como TIR del flujo real. Lo que cambia es qué cargos entran y contra qué se compara el resultado.',
    items: [
      {
        id: 'personal',
        label: 'Préstamo personal en un banco o financiera',
        hint: 'El caso más común: cuota fija, sistema francés.',
        answer: 'Compará por CFT, nunca por TNA: la diferencia son los cargos.',
        yes: [
          'Cuota pura por sistema francés: capital e intereses, con cuota fija en pesos',
          'IVA sobre los intereses (21% en general, 10,5% si sos responsable inscripto en algunos productos)',
          'Seguro de vida sobre saldo y gastos de otorgamiento, que es lo que separa la TNA del CFT',
          'CFT anual calculado como TIR del flujo real, igual que exige el BCRA en la oferta',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'La TNA sola no sirve para comparar: dos ofertas con la misma TNA pueden tener CFT muy distintos según los cargos.',
          'El seguro de vida suele calcularse sobre saldo deudor y baja mes a mes; acá se toma un monto mensual fijo, así que es una aproximación conservadora.',
        ],
        plazo: 'la entidad está obligada a informarte el CFT antes de firmar. Pedilo por escrito.',
      },
      {
        id: 'bna',
        label: 'Préstamo del Banco Nación',
        hint: 'Con la regla de cuota máxima del 30% del ingreso.',
        answer: 'El BNA exige que la cuota no supere el 30% de tu ingreso neto.',
        yes: [
          'Misma cuota por sistema francés, con la TNA preferencial de Nación Sueldo o la de libre destino',
          'El ingreso neto mínimo que tenés que demostrar para que te aprueben esa cuota',
          'Tu relación cuota sobre ingreso, contra el tope del 30% que aplica el banco',
          'Topes del producto: hasta 72 meses de plazo y un máximo de 50 millones de pesos',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'La TNA preferencial exige acreditar el sueldo en el banco. Sin eso corre la tasa de libre destino, bastante más alta.',
          'El simulador oficial del BNA puede dar distinto: el seguro de vida real se calcula sobre saldo y hay tasas por segmento.',
        ],
        plazo: 'si la cuota supera el 30% del ingreso, bajá el monto o estirá el plazo antes de presentar la solicitud.',
      },
      {
        id: 'auto',
        label: 'Préstamo prendario para un auto',
        hint: 'Sistema francés, con el auto en garantía.',
        answer: 'En el sistema francés las primeras cuotas son casi todo interés.',
        yes: [
          'Cuota fija por sistema francés sobre el monto que financiás, no sobre el precio del auto',
          'Cuánto del total termina siendo interés y cuánto capital',
          'El CFT con IVA, seguro y gastos, que en prendarios pesa por el seguro del vehículo',
          'La cuenta es la misma para un plan de ahorro con cuota pura, pero ahí se suman ajustes por valor móvil',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'El seguro contra todo riesgo del auto es obligatorio mientras dure la prenda y no está incluido en la cuota que calcula el banco.',
          'Cancelar anticipado conviene cuanto antes: al principio pagás mucho más interés que capital.',
        ],
        plazo: 'la inscripción de la prenda y los gastos de otorgamiento se pagan al principio, no en cuotas.',
      },
      {
        id: 'comparar',
        label: 'Tengo dos ofertas y no sé cuál conviene',
        hint: 'Compara oferta A contra oferta B por costo total.',
        answer: 'Gana la de menor costo total, no la de menor cuota.',
        yes: [
          'Cuota y costo total de las dos ofertas con los mismos cargos aplicados a ambas',
          'La diferencia en plata entre una y otra a lo largo de todo el préstamo',
          'El CFT de cada una: es el único número que las hace comparables cuando cambian plazo y tasa',
          'Una cuota más baja a más plazo casi siempre termina costando más',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'Comparar cuotas de plazos distintos no dice nada. Compará costo total y CFT.',
          'Acá los cargos (seguro, gastos, IVA) se aplican igual a las dos ofertas. Si difieren, corré una por vez.',
        ],
        plazo: 'pedile a las dos entidades el CFT por escrito y comparalos en el mismo plazo.',
      },
      {
        id: 'capacidad',
        label: 'Quiero saber qué cuota aguanto',
        hint: 'Cuota máxima y monto que te prestarían.',
        answer: 'La regla del mercado: las cuotas no deberían pasar el 30% del ingreso.',
        yes: [
          'Tu límite de cuota al 30% del ingreso bruto, descontando las cuotas que ya pagás',
          'El mismo límite al 40%, que algunas entidades aceptan con buen historial',
          'Tu ratio de endeudamiento actual y cómo queda si sumás la cuota nueva',
          'El monto máximo que podrías financiar con esa cuota disponible, a la tasa y plazo que cargaste',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'Es un límite de planificación, no una aprobación. Cada entidad mira historial, antigüedad laboral y otros compromisos.',
          'No existe un umbral universal de endeudamiento: el 30% es una convención del mercado, no una norma.',
        ],
        plazo: 'antes de pedir, mirá tu situación en la Central de Deudores del BCRA: es gratis y online.',
      },
      {
        id: 'pyme',
        label: 'Es un crédito para mi pyme',
        hint: 'Con comisión de garantía y gastos porcentuales.',
        answer: 'Con garantía, la comisión entra al CFT y a veces lo justifica igual.',
        yes: [
          'Cuota y CFT del crédito con la comisión de la sociedad de garantía cargada en los gastos',
          'Cuánto suma la garantía sobre el costo total del crédito',
          'La comparación honesta es CFT con garantía contra CFT sin garantía, no comisión contra cero',
          'Una garantía suele bajar la tasa lo suficiente como para compensar su propia comisión',
        ],
        warn: [
          'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',
          'La comisión de garantía se suele cobrar por año de vigencia: si el crédito dura más, cargá el total en gastos de otorgamiento.',
          'El IVA sobre intereses puede ser computable como crédito fiscal para la empresa, lo que baja el costo efectivo real.',
        ],
        plazo: 'las líneas con tasa subsidiada suelen tener cupo y ventana de inscripción: consultá vigencia antes de calcular.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Con monto, tasa y plazo ya sale la cuota. Los cargos de abajo son los que convierten la TNA en CFT.',
  fields: [
    { id: 'monto', label: 'Monto del préstamo', prefix: '$', value: '5.000.000', thousands: true },
    {
      id: 'tna',
      label: 'TNA que te ofrecen',
      type: 'number',
      min: 0,
      max: 400,
      step: 0.1,
      value: Math.round(TASA_PERSONALES.valor * 10) / 10,
      suffix: '%',
      help: 'Viene precargada con la tasa promedio de préstamos personales que publica el BCRA. Cambiala por la de tu oferta.',
    },
    { id: 'plazo', label: 'Plazo', type: 'number', min: 1, max: 360, value: 36, suffix: 'meses' },
    {
      id: 'seguro',
      label: 'Seguro de vida mensual',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Suele ser un porcentaje del saldo deudor. Si la oferta te lo da en pesos por mes, cargalo acá.',
    },
    {
      id: 'gastos',
      label: 'Gastos de otorgamiento',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Se descuentan del desembolso o se cobran de entrada. En un crédito con garantía, sumá acá la comisión de la SGR.',
    },
    {
      id: 'iva',
      label: 'IVA sobre los intereses',
      type: 'number',
      min: 0,
      max: 30,
      step: 0.5,
      value: 21,
      suffix: '%',
      help: 'Es 21% para consumidor final y 10,5% para responsable inscripto en varios productos. Poné 0 si la oferta ya viene con IVA incluido.',
    },
    { id: 'ingreso', label: 'Tu ingreso mensual', prefix: '$', value: '1.500.000', thousands: true },
    {
      id: 'cuotasActuales',
      label: 'Cuotas que ya pagás por mes',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Todas las deudas mensuales que ya tenés: tarjetas en cuotas, otros préstamos.',
    },
    {
      id: 'tnaB',
      label: 'TNA de la segunda oferta',
      type: 'number',
      min: 0,
      max: 400,
      step: 0.1,
      value: 95,
      suffix: '%',
      help: 'Sólo se usa en la rama que compara dos ofertas.',
    },
    {
      id: 'plazoB',
      label: 'Plazo de la segunda oferta',
      type: 'number',
      min: 1,
      max: 360,
      value: 48,
      suffix: 'meses',
      help: 'Sólo se usa en la rama que compara dos ofertas.',
    },
  ],
  fineprint:
    'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.',

  chart: {
    type: 'donut',
    title: 'De qué está hecho lo que pagás',
    caption:
      'El capital es lo que te prestan; los intereses, lo que cuesta la tasa; los cargos —IVA, seguro y gastos— son exactamente la brecha entre la TNA de la vidriera y el CFT del contrato.',
  },
  breakdownTitle: 'El desglose de tu préstamo',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del desglose.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre TNA, TEA y CFT?',
      a: 'La TNA es la tasa nominal anual: la que se divide por 12 para sacar la mensual, sin capitalizar. La TEA es esa misma tasa ya capitalizada mes a mes, así que siempre da más alta. El CFT suma, además, IVA sobre intereses, seguros y gastos: es la tasa efectiva del flujo real y el único número que sirve para comparar ofertas.',
    },
    {
      q: '¿Cómo se calcula la cuota de un préstamo?',
      a: 'Por sistema francés, que da cuota fija: cuota = capital × i × (1+i)^n ÷ ((1+i)^n − 1), donde i es la tasa mensual (TNA dividido 12 en la convención bancaria argentina) y n el plazo en meses. La cuota no cambia, pero la proporción sí: al principio casi todo es interés y sobre el final casi todo capital.',
    },
    {
      q: '¿Por qué el CFT es tanto más alto que la TNA?',
      a: 'Por tres cosas que no están en la tasa: el IVA sobre los intereses, el seguro de vida sobre saldo deudor y los gastos de otorgamiento, que además reducen lo que efectivamente recibís. Con IVA del 21% y algún cargo administrativo, un préstamo con TNA del 70% puede terminar con un CFT muy por encima del 100% anual.',
    },
    {
      q: '¿Qué cuota máxima me van a aprobar?',
      a: 'La convención del mercado es que la suma de todas tus cuotas no supere el 30% del ingreso, y varias entidades estiran hasta el 40% con buen historial. El Banco Nación aplica explícitamente el tope del 30% del ingreso neto para sus préstamos personales.',
    },
    {
      q: '¿Conviene el préstamo con la cuota más baja?',
      a: 'Casi nunca. Una cuota más baja suele significar más plazo, y más plazo significa más intereses acumulados. La comparación correcta es costo total y CFT; la cuota sólo importa para saber si te entra en el presupuesto mensual.',
    },
    {
      q: '¿Qué pasa si cancelo el préstamo antes?',
      a: 'Te ahorrás los intereses de las cuotas que faltan, porque pagás el saldo de capital pendiente. Cuanto antes lo hagas, más ahorrás: en el sistema francés el interés se concentra al principio. Algunas entidades cobran comisión por precancelación, aunque en préstamos a consumidores está limitada.',
    },
    {
      q: '¿El IVA sobre los intereses lo pago siempre?',
      a: 'Depende de tu condición fiscal y del producto. El consumidor final paga 21% sobre los intereses; el responsable inscripto suele tributar 10,5% en varios productos y además puede computarlo como crédito fiscal, lo que baja el costo efectivo del crédito para una empresa.',
    },
    {
      q: '¿Sirve para un crédito hipotecario?',
      a: 'Para uno a tasa fija en pesos sí, la mecánica es la misma. Para un hipotecario UVA no alcanza: ahí el capital se ajusta por inflación mes a mes y la cuota se mueve con él, así que hay que mirar la evolución del valor UVA y el tope de relación cuota-ingreso a lo largo de 20 o 30 años.',
    },
    {
      q: '¿Qué es el CFT como TIR del flujo?',
      a: 'Es la tasa que iguala a cero el valor presente del flujo real: entra lo que efectivamente recibís (monto menos gastos de otorgamiento) y salen todas las cuotas totales, con IVA y seguro adentro. Se resuelve numéricamente y después se anualiza. Es el mismo criterio que exige el BCRA para informar el CFT en la oferta.',
    },
    {
      q: '¿Una garantía de SGR o FOGABA encarece el crédito?',
      a: 'Suma una comisión, que entra al CFT, pero a la vez suele bajar la tasa porque el banco asume menos riesgo. La comparación honesta es CFT con garantía contra CFT sin garantía: muchas veces la línea garantizada termina siendo más barata a pesar de la comisión.',
    },
    {
      q: '¿Puedo pedir un préstamo si estoy en el Veraz?',
      a: 'Con situación 3 o peor en la Central de Deudores del BCRA es muy difícil en el sistema formal, y lo que aparece son ofertas de tasas mucho más altas. Consultá tu situación gratis en el sitio del BCRA antes de solicitar: cada consulta rechazada queda registrada.',
    },
    {
      q: '¿La cuota puede cambiar durante el préstamo?',
      a: 'En un préstamo a tasa fija en pesos, la cuota pura no cambia. Sí pueden moverse los accesorios: el seguro de vida se calcula sobre saldo deudor y baja, y algunas entidades ajustan comisiones administrativas. En créditos a tasa variable atada a BADLAR, la cuota se recalcula cada período.',
    },
  ],

  sources: [
    {
      name: TASA_PERSONALES.label + ' — serie del BCRA usada como tasa de referencia',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
      date: TASA_PERSONALES.fecha,
    },
    {
      name: 'Régimen de transparencia — cómo se informa el Costo Financiero Total',
      url: 'https://www.bcra.gob.ar/BCRAyVos/Regimen_de_transparencia.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Central de Deudores del Sistema Financiero',
      url: 'https://www.bcra.gob.ar/BCRAyVos/Situacion_Crediticia.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Préstamos personales — condiciones, plazos y relación cuota-ingreso',
      url: 'https://www.bna.com.ar/Personas/Prestamos',
      publisher: 'Banco de la Nación Argentina',
    },
    {
      name: 'Garantías para pymes — comisiones y líneas con aval',
      url: 'https://www.fogaba.com/',
      publisher: 'FOGABA · Fondo de Garantías Buenos Aires',
    },
  ],

  replaces: [
    '/calculadora-costo-financiero-total-cft',
    '/calculadora-cuota-prestamo',
    '/calculadora-prestamo-personal-cuota-mensual',
    '/calculadora-prestamo-personal-banco-nacion-cuota-2026',
    '/calculadora-cft-prestamo-personal-comparativa',
    '/calculadora-creditos-pyme-fogaba-cft-comparativa',
    '/calculadora-cuota-prestamo-auto-frances-argentino',
    '/calculadora-cuota-maxima-segun-ingreso',
    '/calculadora-comparador-prestamos',
    '/calculadora-capacidad-endeudamiento',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Reglas del producto BNA que usa la rama `bna` (src/lib/data/argentina-2026.ts). */
export const BNA = {
  tnaClienteSueldo: BNA_PRESTAMO_2026.tnaClienteSueldo,
  tnaNoCliente: BNA_PRESTAMO_2026.tnaNoCliente,
  plazoMaxMeses: BNA_PRESTAMO_2026.plazoMaxMeses,
  montoMax: BNA_PRESTAMO_2026.montoMax,
  relacionCuotaIngreso: BNA_PRESTAMO_2026.relacionCuotaIngreso,
};

/** Umbrales de endeudamiento que usa la rama `capacidad`. */
export const DTI = {
  /** Convención de mercado: las cuotas no deberían pasar el 30% del ingreso. */
  CONSERVADOR: 0.3,
  /** Techo que algunas entidades aceptan con buen historial. */
  MAXIMO: 0.4,
};
