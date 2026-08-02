import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto me presta Infonavit, Fovissste o el banco y
 * cuánto pago al mes?"
 *
 * Fusiona las seis calculadoras de crédito de vivienda del catálogo mexicano:
 * precalificación y monto máximo de Infonavit, mensualidad de un crédito ya
 * otorgado y su peso sobre el sueldo, crédito FOVISSSTE con subcuenta,
 * hipoteca bancaria con enganche y seguros, y la devolución del ahorro de la
 * Subcuenta de Vivienda.
 *
 * Constantes legales desde la fuente única src/lib/data/mexico-2026.ts
 * (salario mínimo CONASAMI, UMA, UMI de Infonavit, tope de SBC y aportación
 * patronal del 5%). Las tasas de mercado son campos editables.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/**
 * Parámetros del modelo de precalificación Infonavit.
 *
 * OJO: `coeficientePoderAdquisitivo` y `factorRiesgo` vienen de la calculadora
 * original (`infonavit-credito-mexico-puntaje-monto-2026`) y NO son publicados
 * por Infonavit: el instituto precalifica con un modelo propio que no expone.
 * Se conservan tal cual para no alterar el resultado histórico, pero el hub los
 * presenta explícitamente como estimación.
 */
export const VIVIENDA_MX = {
  salarioMinimoDiario: MEXICO_2026.salarioMinimo.generalDiario,
  salarioMinimoMensual: MEXICO_2026.salarioMinimo.generalMensual,
  factorMensual: MEXICO_2026.salarioMinimo.factorMensual,
  umaDiaria: MEXICO_2026.uma.diaria,
  umiDiaria: MEXICO_2026.umiDiaria2026,
  topeSbcUmas: MEXICO_2026.imss.topeSbcUmas,
  aportacionPatronal: MEXICO_2026.imss.infonavitPatron,
  puntajeMinimo: 1080,
  vsmMaximo: 25,
  coeficientePoderAdquisitivo: 12.6,
  factorRiesgo: 0.6,
  edadRetiro: 65,
  plazoMaximoMeses: 360,
  plazoMinimoMeses: 120,
};

export const hub: HubData = {
  slug: 'mx/finanzas/credito-de-vivienda',
  title: 'Crédito de vivienda en México: cuánto te presta Infonavit, Fovissste o el banco',
  description:
    'Estima tu precalificación y monto máximo de Infonavit, la mensualidad de un crédito ya otorgado, el escenario FOVISSSTE con subcuenta, la hipoteca bancaria con enganche y seguros, y cuánto ahorro tienes en tu Subcuenta de Vivienda.',
  silo: 'Finanzas',
  siloHref: '/mx/finanzas',

  eyebrow: 'México · Vivienda',
  h1: '¿Cuánto me presta Infonavit, Fovissste o el banco y cuánto pago al mes?',
  lede:
    'La casa se decide con dos números: cuánto te prestan y cuánto te va a doler cada mes. Cambian según de dónde venga el crédito, cuánto llevas en tu subcuenta y qué plazo aceptes. Elige tu caso y compara.',
  stamps: [
    'Salario mínimo y UMA vigentes · CONASAMI e INEGI',
    'UMI de Infonavit para créditos en VSM',
    'Aportación patronal del 5% · Ley Infonavit Art. 29',
    '6 calculadoras fusionadas',
  ],

  resultLabel: 'Resultado del escenario',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro: 'Empezamos por la pregunta más frecuente: cuánto te presta Infonavit hoy.',
    items: [
      {
        id: 'infonavit',
        label: 'Cuánto me presta Infonavit',
        hint: 'Puntos de precalificación, monto máximo y mensualidad estimada.',
        yes: [
          'Puntos estimados a partir de tu antigüedad cotizada, tu edad y el saldo de tu Subcuenta de Vivienda',
          'Monto máximo estimado sumando tu subcuenta y tu capacidad de crédito',
          'Mensualidad estimada al plazo y la tasa que indiques',
          'Plazo máximo según la edad que tengas al solicitar',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El puntaje real de Infonavit sale de un modelo propio del instituto que no se publica: acá lo estimamos, no lo reproducimos. El número que manda es el de Mi Cuenta Infonavit',
          'El monto que te muestren en precalificación no es una autorización: se confirma con el avalúo, el estudio del inmueble y tu situación laboral vigente',
          'El coeficiente de capacidad de crédito no es un dato oficial publicado: es una aproximación del catálogo, tratala como orden de magnitud',
        ],
        plazo: 'los puntos se actualizan bimestralmente, con el pago de cuotas del patrón.',
        answer:
          'Tu monto máximo estimado combina el saldo de tu Subcuenta de Vivienda con una capacidad de crédito proporcional a tu salario, con tope legal.',
      },
      {
        id: 'mensualidad',
        label: 'Ya tengo el crédito: cuánto pago al mes',
        hint: 'Mensualidad, intereses totales y cuánto se lleva de tu sueldo.',
        yes: [
          'Mensualidad con sistema de amortización francés, cuota fija',
          'Gastos de administración anuales sumados a la cuota',
          'Intereses y sobrecosto total a lo largo del crédito',
          'Peso de la mensualidad sobre tu sueldo mensual',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los créditos viejos denominados en VSM se actualizan con la UMI, no con el salario mínimo: desde 2017 el salario mínimo dejó de arrastrar esas deudas hacia arriba',
          'El descuento vía nómina lo aplica tu patrón y aparece en tu recibo: si cambias de empleo o quedas sin relación laboral tienes que seguir pagando por tu cuenta',
          'Si en el crédito hay pagos por debajo del interés devengado el saldo puede crecer aunque estés pagando: revisa tu estado de cuenta, no solo la mensualidad',
        ],
        plazo: 'la mensualidad se descuenta en cada periodo de nómina y se refleja en tu estado de cuenta Infonavit.',
        answer:
          'La mensualidad es la cuota francesa del monto y la tasa, más la parte proporcional de los gastos de administración anuales.',
      },
      {
        id: 'fovissste',
        label: 'Crédito FOVISSSTE',
        hint: 'Cuánto cubre tu subcuenta, cuánto financia el crédito y qué falta.',
        yes: [
          'Monto financiado, topado por lo que queda del precio después de tu subcuenta',
          'Cuota mensual al plazo y la tasa que indiques',
          'Recursos propios que tendrías que poner para completar el precio',
          'Costo financiero total del crédito',
        ],
        warn: [
          DISCLAIMER_FIN,
          'FOVISSSTE trabaja por modalidades con reglas y tasas distintas: confirmá cuál te aplica antes de tomar el número como definitivo',
          'El saldo de tu subcuenta del SAR se aplica al crédito: deja de ser ahorro para el retiro y pasa a ser enganche',
          'Los gastos de escrituración, avalúo y notaría no están dentro del crédito: van por separado y suelen pesar varios puntos del precio',
        ],
        plazo: 'la asignación y la formalización dependen del calendario del programa vigente.',
        answer:
          'El crédito cubre el precio menos tu subcuenta, y lo que no alcance a cubrirse sale de tu bolsillo al momento de escriturar.',
      },
      {
        id: 'banco',
        label: 'Hipoteca bancaria',
        hint: 'Enganche, mensualidad con seguros y desembolso inicial real.',
        yes: [
          'Monto de crédito después del enganche',
          'Mensualidad con seguros de vida y daños incluidos',
          'Desembolso inicial: enganche, comisión de apertura y gastos de cierre',
          'Intereses totales a lo largo del crédito',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La tasa que anuncia el banco no es el CAT: el CAT incluye seguros, comisiones y gastos, y por eso siempre sale más alto que la tasa de la publicidad',
          'La regla de oro de la banca es que la mensualidad no supere un tercio de tu ingreso: por encima de eso los bancos suelen recortar el monto',
          'Los seguros de vida y de daños son obligatorios y suben la mensualidad: pedí la tabla de amortización con seguros incluidos antes de firmar',
        ],
        plazo: 'las condiciones ofertadas suelen tener vigencia limitada, habitualmente de algunas semanas.',
        answer:
          'Financias el precio menos el enganche, y la mensualidad suma la cuota del crédito más los seguros obligatorios.',
      },
      {
        id: 'devolucion',
        label: 'Devolución de mi ahorro Infonavit',
        hint: 'Cuánto tienes en la Subcuenta de Vivienda y en el Fondo 72-92.',
        yes: [
          'Aportación patronal mensual del 5% sobre tu salario base de cotización, topado en 25 UMA',
          'Saldo estimado de tu Subcuenta de Vivienda 97 con el rendimiento que indiques',
          'Saldo del Fondo de Ahorro 1972-1992 si te corresponde',
          'Total recuperable estimado',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Si usaste un crédito Infonavit, tu Subcuenta de Vivienda 97 se aplicó a ese crédito: lo que queda por reclamar aparte es el Fondo 72-92',
          'La Subcuenta de Vivienda 97 se devuelve a través de tu Afore al pensionarte, no en ventanilla de Infonavit',
          'El saldo que manda es el de Mi Cuenta Infonavit: esto es una estimación a partir de tu salario y tus años cotizados, no una consulta a tu expediente',
        ],
        plazo: 'la devolución del Fondo 72-92 se solicita directamente en Infonavit y no prescribe por el paso del tiempo.',
        answer:
          'Tu patrón aporta el 5% de tu salario base de cotización cada mes: eso, con rendimientos, es lo que se acumula en tu Subcuenta de Vivienda.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto. Las tasas son editables: poné la que te ofrecieron.',
  fields: [
    {
      id: 'salarioMensual',
      label: 'Salario mensual integrado (MXN)',
      prefix: '$',
      value: 15000,
      thousands: true,
      help: 'El salario base de cotización mensual con el que te reporta tu patrón al IMSS.',
    },
    {
      id: 'antiguedad',
      label: 'Años cotizados',
      type: 'number',
      value: 8,
      min: 0,
      max: 50,
      step: 1,
      help: 'Años de cotización continua o acumulada con aportaciones al Infonavit.',
    },
    {
      id: 'edad',
      label: 'Tu edad',
      type: 'number',
      value: 35,
      min: 18,
      max: 70,
      step: 1,
      help: 'Define el plazo máximo: el crédito debe terminar antes de los 65 años.',
    },
    {
      id: 'subcuenta',
      label: 'Saldo de tu Subcuenta de Vivienda (MXN)',
      prefix: '$',
      value: 60000,
      thousands: true,
      help: 'Lo consultas en Mi Cuenta Infonavit o en tu estado de cuenta de Afore.',
    },
    {
      id: 'valorVivienda',
      label: 'Precio de la vivienda (MXN)',
      prefix: '$',
      value: 1200000,
      thousands: true,
      help: 'El precio de compra o el valor de avalúo, el que sea menor.',
    },
    {
      id: 'enganche',
      label: 'Enganche disponible (MXN)',
      prefix: '$',
      value: 240000,
      thousands: true,
      help: 'Solo para la hipoteca bancaria. Habitualmente entre el 10% y el 20% del precio.',
    },
    {
      id: 'montoCredito',
      label: 'Monto del crédito ya otorgado (MXN)',
      prefix: '$',
      value: 800000,
      thousands: true,
      help: 'Para el caso de la mensualidad: el saldo o monto original de tu crédito.',
    },
    {
      id: 'tasaAnual',
      label: 'Tasa de interés anual (%)',
      type: 'number',
      value: 10.45,
      min: 0,
      max: 60,
      step: 0.05,
      suffix: '%',
      help: 'Pon la que te ofrecieron. Infonavit suele moverse por debajo de la banca comercial.',
    },
    {
      id: 'plazoAnios',
      label: 'Plazo en años',
      type: 'number',
      value: 20,
      min: 1,
      max: 30,
      step: 1,
      help: 'Más plazo baja la mensualidad y sube fuerte los intereses totales.',
    },
    {
      id: 'costoExtraPct',
      label: 'Gastos anuales de administración y seguros (% del crédito)',
      type: 'number',
      value: 1,
      min: 0,
      max: 10,
      step: 0.1,
      suffix: '%',
      help: 'Se prorratea mes a mes y se suma a la cuota. Es lo que separa la tasa del CAT.',
    },
    {
      id: 'aperturaPct',
      label: 'Comisión de apertura (% del crédito)',
      type: 'number',
      value: 1,
      min: 0,
      max: 10,
      step: 0.1,
      suffix: '%',
      help: 'Se cobra una sola vez al firmar. Solo aplica a la hipoteca bancaria.',
    },
    {
      id: 'rendimientoSubcuenta',
      label: 'Rendimiento anual de la subcuenta (%)',
      type: 'number',
      value: 4,
      min: 0,
      max: 20,
      step: 0.1,
      suffix: '%',
      help: 'Rendimiento estimado que acredita Infonavit a tu Subcuenta de Vivienda.',
    },
    {
      id: 'usoCredito',
      label: '¿Ya usaste un crédito Infonavit?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, nunca ejercí un crédito' },
        { value: 'si', label: 'Sí, ya usé un crédito Infonavit' },
      ],
      help: 'Si lo usaste, tu Subcuenta 97 se aplicó al crédito.',
    },
    {
      id: 'fondo7292',
      label: 'Saldo del Fondo de Ahorro 1972-1992 (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Solo si cotizaste en ese periodo. Se reclama directo en Infonavit.',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte el dinero',
    caption:
      'Muestra de dónde sale cada peso del escenario: lo que aporta tu ahorro, lo que financia el crédito y lo que se va en intereses y gastos.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuántos puntos necesito para un crédito Infonavit?',
      a: 'El instituto pide 1080 puntos de precalificación. Los puntos suben con la antigüedad cotizada, la edad, el saldo de tu Subcuenta de Vivienda y la estabilidad de tus aportaciones. El modelo exacto no se publica: acá se estima con la aproximación del catálogo, y el número que vale es el que aparece en Mi Cuenta Infonavit, que se actualiza cada bimestre cuando tu patrón entera las cuotas.',
    },
    {
      q: '¿Puedo juntar mi crédito Infonavit con el de mi pareja?',
      a: 'Sí. Si los dos cotizan, pueden solicitar un crédito conyugal o en coparticipación, y en ese caso se suman los montos y las subcuentas de ambos. Es la vía más rápida para llegar a una vivienda que ninguno alcanzaría solo. La contra es que ambos quedan obligados frente al instituto, y una separación no divide automáticamente la deuda.',
    },
    {
      q: '¿Qué diferencia hay entre Infonavit y FOVISSSTE?',
      a: 'Infonavit atiende a quienes cotizan al IMSS, es decir trabajadores del sector privado; FOVISSSTE atiende a trabajadores del Estado que cotizan al ISSSTE. Los dos funcionan con una subcuenta de vivienda que se aporta con el 5% del salario y se aplica al crédito, pero difieren en modalidades, tasas y calendario de asignación.',
    },
    {
      q: '¿Cuánto me descuentan de mi sueldo por el crédito?',
      a: 'El descuento se aplica vía nómina y depende del esquema del crédito. En los créditos en pesos es una cuota fija; en los antiguos denominados en veces salario mínimo se calcula como un factor sobre tu salario. Como referencia práctica, el descuento suele rondar el 30% del salario, pero lo que manda es el factor asentado en tu contrato y tu estado de cuenta.',
    },
    {
      q: '¿Es cierto que mi crédito en VSM sube con el salario mínimo?',
      a: 'Ya no. Desde 2017 los créditos denominados en veces salario mínimo se actualizan con la Unidad Mixta Infonavit, la UMI, precisamente para desligarlos de los aumentos del salario mínimo. Fue el cambio que evitó que las subidas fuertes del mínimo dispararan esas deudas. Si tu crédito es viejo, revisa en tu estado de cuenta en qué unidad está denominado.',
    },
    {
      q: '¿Conviene alargar el plazo para bajar la mensualidad?',
      a: 'Baja la mensualidad, pero el costo total sube mucho más de lo que la gente espera: en plazos largos los intereses pueden superar al capital prestado. La comparación honesta es mirar los dos números juntos, mensualidad e intereses totales, y elegir el plazo más corto que tu flujo aguante sin ahogarte.',
    },
    {
      q: '¿Qué es el CAT y por qué es más alto que la tasa?',
      a: 'El CAT, o Costo Anual Total, es la medida que Banxico obliga a publicar para que puedas comparar créditos entre instituciones. Incluye la tasa de interés más comisiones, seguros y gastos, y por eso siempre queda por encima de la tasa que anuncia la publicidad. Comparar dos créditos por su tasa nominal es comparar mal: se comparan por CAT y por mensualidad total.',
    },
    {
      q: '¿Cuánto necesito de enganche para una hipoteca bancaria?',
      a: 'Los bancos suelen financiar entre el 80% y el 90% del valor de avalúo, así que el enganche típico va del 10% al 20% del precio. Además del enganche tienes que tener disponible la comisión de apertura, el avalúo, los gastos notariales y el impuesto de adquisición: sumados suelen pesar varios puntos porcentuales adicionales sobre el precio.',
    },
    {
      q: '¿Puedo recuperar el dinero de mi Subcuenta de Vivienda?',
      a: 'Si nunca usaste un crédito, ese saldo se te entrega al pensionarte, a través de tu Afore junto con los demás recursos del SAR. Si usaste un crédito, la subcuenta se aplicó a ese crédito y no hay nada que reclamar por esa vía. Aparte existe el Fondo de Ahorro 1972-1992, que se solicita directamente en Infonavit y sí se cobra en vida laboral.',
    },
    {
      q: '¿Qué pasa con mi crédito si me quedo sin trabajo?',
      a: 'La obligación de pagar sigue: lo que cambia es que dejas de pagar por descuento de nómina y tienes que hacerlo por tu cuenta. Infonavit tiene esquemas de prórroga y de reestructura para desempleo, pero hay que solicitarlos: dejar de pagar sin avisar acumula intereses moratorios y puede terminar en juicio sobre la vivienda.',
    },
    {
      q: '¿Puedo pagar mi crédito por adelantado?',
      a: 'Sí, y en créditos de vivienda los pagos anticipados aplicados a capital son la palanca más poderosa que existe: un abono extra al inicio del crédito ahorra muchos años de intereses. Pedí siempre que el pago se aplique a capital y no como adelanto de mensualidades, porque el efecto sobre el total es completamente distinto.',
    },
    {
      q: '¿Los gastos de escrituración están dentro del crédito?',
      a: 'Por regla general no. El impuesto de adquisición de inmuebles, los honorarios notariales, el registro público y el avalúo se pagan aparte al momento de escriturar. Es el error de presupuesto más común de quien compra por primera vez: llega con el enganche exacto y descubre que le falta un porcentaje relevante del precio para poder firmar.',
    },
  ],

  sources: [
    {
      name: 'Infonavit — Mi Cuenta Infonavit: puntos, precalificación y saldo de la subcuenta',
      url: 'https://micuenta.infonavit.org.mx/',
      publisher: 'Infonavit',
    },
    {
      name: 'Ley del Infonavit — aportación patronal del 5% y aplicación de la subcuenta (Art. 29)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/linfonavit.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley del Seguro Social — tope del salario base de cotización en 25 UMA (Art. 28)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lss.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'FOVISSSTE — modalidades y esquemas de crédito',
      url: 'https://www.gob.mx/fovissste',
      publisher: 'FOVISSSTE',
    },
    {
      name: 'Condusef — simulador y comparativo de créditos hipotecarios',
      url: 'https://www.condusef.gob.mx/',
      publisher: 'Condusef',
    },
    {
      name: 'INEGI — valor de la UMA vigente',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'CONASAMI — salarios mínimos vigentes',
      url: 'https://www.gob.mx/conasami',
      publisher: 'CONASAMI',
    },
  ],

  replaces: [
    '/calculadora-credito-infonavit-descuento',
    '/calculadora-infonavit-credito-mexico-puntaje-monto-2026',
    '/calculadora-pagos-hipoteca-infonavit',
    '/calculadora-credito-fovissste-mexico-2026',
    '/calculadora-credito-hipotecario-bancario-mexico-2026',
    '/calculadora-devolucion-ahorro-infonavit-subcuenta-vivienda-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
