import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';
import { TASA_RETENCION_INTERESES_2026 } from '../../formulas/isr-intereses-bancarios-inversion-mexico-2026';

/**
 * Hub de decisión MX — "Gané con inversiones: ¿qué ISR pago?"
 *
 * Fusiona las calculadoras de rendimientos de personas físicas: intereses del
 * sistema financiero (Cetes, pagarés, SOFIPOs), ganancia bursátil del 10%
 * definitivo, dividendos con piramidación y acreditamiento, cripto como
 * enajenación de bienes y premios de loterías y sorteos.
 *
 * Cada régimen tiene su propia mecánica: hay retención definitiva, retención
 * provisional y casos donde la casa de bolsa no retiene nada.
 * Tarifas y tasas desde la fuente única src/lib/data/mexico-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

export const INVERSIONES_MX = {
  /** Tarifa ISR anual 2026 — Art. 152 LISR, Anexo 8 RMF 2026 (DOF 28-dic-2025). */
  tarifaAnual: MEXICO_2026.isrTarifaAnual as unknown as Array<[number, number, number, number]>,
  /** Retención anual sobre el CAPITAL que genera intereses (Art. 24 LIF 2026). */
  retencionIntereses: TASA_RETENCION_INTERESES_2026,
  /** 10% definitivo sobre la ganancia bursátil del ejercicio (LISR Art. 129). */
  bolsa: MEXICO_2026.bolsaIsrGanancia,
  /** Dividendos: retención definitiva del 10% (LISR Art. 140) y piramidación por el ISR moral del 30% (Arts. 9 y 10). */
  dividendos: { retencion: 0.1, isrMoral: 0.3 },
  /**
   * Premios (LISR Arts. 137-139): retención federal del 1% cuando el impuesto local
   * no excede el 6%, y del 21% cuando lo excede. El impuesto estatal lo fija cada
   * ley de hacienda local y por eso queda como campo editable.
   */
  premios: { federalBaja: 0.01, federalAlta: 0.21, umbralEstatal: 0.06 },
};

export const hub: HubData = {
  slug: 'mx/impuestos/isr-de-mis-inversiones',
  title: 'ISR de inversiones en México: intereses, bolsa, dividendos, cripto y premios',
  description:
    'Calcula el ISR de tus rendimientos: retención del banco sobre Cetes y pagarés, 10% definitivo de la bolsa, dividendos con piramidación, ganancia en cripto y retención sobre premios de loterías.',
  silo: 'Impuestos',
  siloHref: '/mx/impuestos',

  eyebrow: 'México · Inversiones',
  h1: 'Gané con inversiones: ¿qué ISR pago?',
  lede:
    'No todos los rendimientos tributan igual. El banco retiene sobre tu capital aunque pierdas contra la inflación, la bolsa paga un 10% definitivo que nadie te retiene, y cripto se acumula a tus demás ingresos. Elige de dónde vino la ganancia.',
  stamps: [
    'Intereses · LISR Arts. 54 y 135, LIF 2026',
    'Bolsa · LISR Art. 129 (10% definitivo)',
    'Dividendos · LISR Arts. 10 y 140',
    '5 calculadoras fusionadas',
  ],

  resultLabel: 'ISR de tu rendimiento',

  cases: {
    title: '¿De dónde vino la ganancia?',
    intro: 'Empezamos por lo más consultado: los intereses de un banco, Cetes o una SOFIPO.',
    items: [
      {
        id: 'intereses',
        label: 'Intereses de banco, Cetes o SOFIPO',
        hint: 'La retención se calcula sobre tu capital, no sobre lo que ganaste.',
        yes: [
          'Interés nominal del periodo con la tasa y el plazo de tu instrumento',
          'ISR retenido por el intermediario: tasa anual sobre el capital, prorrateada por días',
          'Interés neto que efectivamente cobras y monto final al vencimiento',
          'Interés real, ya descontada la inflación, que es la base de tu declaración anual',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La retención se calcula sobre el CAPITAL invertido, no sobre el interés ganado: en instrumentos de tasa baja puede llevarse una parte enorme del rendimiento',
          'Si tu interés real es negativo, es decir si perdiste contra la inflación, igual te retienen, pero puedes recuperar esa retención como saldo a favor en la anual',
          'La retención es provisional: el impuesto definitivo se determina en la anual sobre el interés real, sumado a tus demás ingresos',
        ],
        plazo:
          'el banco te entrega la constancia anual de intereses hacia febrero: sin ella no puedes armar bien la declaración.',
        answer:
          'El intermediario retiene una tasa anual fija sobre tu capital, prorrateada por los días de la inversión, como pago provisional.',
      },
      {
        id: 'bolsa',
        label: 'Venta de acciones en bolsa',
        hint: '10% definitivo sobre la ganancia neta del ejercicio.',
        yes: [
          'Ganancia neta del ejercicio: ganancias menos pérdidas de tus ventas',
          'Compensación de pérdidas de ejercicios anteriores contra la ganancia del año',
          'ISR del 10% definitivo sobre la base resultante',
          'Comparación contra lo que pagarías si esa misma ganancia tributara con la tarifa general',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La casa de bolsa NO retiene este impuesto: lo enteras tú en la declaración anual, con la constancia que te emite el intermediario',
          'Las pérdidas bursátiles solo se compensan contra ganancias del mismo régimen, nunca contra tu sueldo ni otros ingresos',
          'Aplica a operaciones en bolsas concesionadas y en el Sistema Internacional de Cotizaciones a través de intermediario; operar fuera de ese circuito cambia el régimen',
        ],
        plazo:
          'la pérdida no compensada se puede amortizar en los diez ejercicios siguientes, pero solo si la declaraste el año en que ocurrió.',
        answer:
          'Pagas un 10% definitivo sobre la ganancia neta del ejercicio, y lo declaras tú porque la casa de bolsa no lo retiene.',
      },
      {
        id: 'dividendos',
        label: 'Dividendos de una empresa',
        hint: 'Retención del 10% más acumulación piramidada en tu anual.',
        yes: [
          'Retención definitiva del 10% que aplica la empresa al repartir',
          'Dividendo acumulable piramidado y ISR corporativo acreditable en tu anual',
          'Efecto neto de acumular el dividendo a tus demás ingresos',
          'Tasa efectiva total sobre el dividendo recibido',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Son dos impuestos distintos sobre el mismo dividendo: la retención del 10% es definitiva y el efecto de la acumulación se calcula aparte en tu declaración',
          'La piramidación puede darte saldo a favor si tu tarifa personal es menor a la tasa corporativa: no declararlos te hace perder ese acreditamiento',
          'Los dividendos de acciones extranjeras siguen otras reglas y pueden llevar retención en el país de origen, acreditable con límites',
        ],
        plazo:
          'la empresa debe entregarte constancia del dividendo pagado y del ISR retenido: la necesitas para acreditar en abril.',
        answer:
          'La empresa retiene un 10% definitivo, y además acumulas el dividendo piramidado en tu anual acreditando el ISR corporativo.',
      },
      {
        id: 'cripto',
        label: 'Ganancia en cripto',
        hint: 'Se acumula a tus demás ingresos con la tarifa progresiva.',
        yes: [
          'Ganancia neta de la operación: venta menos costo de adquisición menos comisiones',
          'ISR que agrega esa ganancia a tu declaración, calculado con la tarifa progresiva sobre el acumulado',
          'Tasa efectiva real de la operación, no una tasa marginal plana',
          'Qué te queda de la ganancia después de impuestos',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las criptomonedas NO tienen el régimen del 10% de la bolsa: son enajenación de bienes y se acumulan a tus demás ingresos con la tarifa progresiva',
          'Operar con frecuencia y de forma habitual puede reclasificarte como actividad empresarial, con obligaciones mensuales y contabilidad',
          'Las plataformas mexicanas reportan operaciones al SAT: los depósitos en efectivo y las transferencias grandes dejan rastro',
          'Necesitas registrar el costo de adquisición operación por operación: sin comprobante, el SAT puede tomar como ganancia el importe total de la venta',
        ],
        plazo:
          'la ganancia se declara en el ejercicio en que la realizaste, es decir cuando vendiste, no cuando la posición subió de valor.',
        answer:
          'La ganancia se acumula a tus demás ingresos y paga la tarifa progresiva anual: no existe un 10% definitivo para cripto.',
      },
      {
        id: 'premios',
        label: 'Premio de lotería, rifa o sorteo',
        hint: 'Retención federal más impuesto estatal, en la mano.',
        yes: [
          'ISR federal retenido sobre el valor del premio',
          'Impuesto estatal sobre loterías y sorteos de la entidad donde se paga',
          'Premio neto que efectivamente cobras y porcentaje que representa',
          'Cómo cambia la tasa federal cuando el impuesto local supera el umbral de ley',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La retención de ISR sobre premios es pago definitivo: no se acumula a tus demás ingresos ni se te devuelve',
          'El impuesto estatal lo fija cada entidad y cambia por ley local: verifica el porcentaje de donde vas a cobrar antes de calcular',
          'Cuando el impuesto local excede el umbral de la ley, la tasa federal se multiplica varias veces: la diferencia entre estados es enorme',
          'Los premios en especie se valúan y el impuesto se calcula igual: si no hay efectivo, quien entrega el premio puede exigirte el pago del impuesto antes de darlo',
        ],
        plazo:
          'quien paga el premio retiene en el momento y debe entregarte constancia: consérvala aunque el impuesto sea definitivo.',
        answer:
          'Te retienen ISR federal más el impuesto estatal del lugar de pago, y esa retención de ISR es definitiva.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto.',
  fields: [
    {
      id: 'otrosIngresos',
      label: 'Tus otros ingresos anuales acumulables (MXN)',
      prefix: '$',
      value: 400000,
      thousands: true,
      help: 'Sueldo, honorarios y demás. Define en qué tramo de la tarifa cae la ganancia que acumula.',
    },
    {
      id: 'capital',
      label: 'Capital invertido (MXN)',
      prefix: '$',
      value: 100000,
      thousands: true,
      help: 'El monto que le entregaste al banco, la casa de bolsa o la SOFIPO.',
    },
    {
      id: 'tasaInteresAnual',
      label: 'Tasa de interés anual del instrumento',
      suffix: '%',
      type: 'number',
      value: 9,
      min: 0,
      max: 100,
      step: 0.1,
      help: 'Tasa nominal anual, la que publica el instrumento antes de impuestos.',
    },
    {
      id: 'plazoDias',
      label: 'Plazo de la inversión',
      suffix: 'días',
      type: 'number',
      value: 365,
      min: 1,
      max: 3650,
      step: 1,
      help: 'La retención se prorratea por los días efectivos de la inversión.',
    },
    {
      id: 'inflacionAnual',
      label: 'Inflación anual estimada',
      suffix: '%',
      type: 'number',
      value: 4,
      min: 0,
      max: 100,
      step: 0.1,
      help: 'Sirve para calcular el interés real, que es la base de tu declaración anual.',
    },
    {
      id: 'gananciaBolsa',
      label: 'Ganancias por venta de acciones en el año (MXN)',
      prefix: '$',
      value: 50000,
      thousands: true,
      help: 'Suma de las operaciones cerradas con utilidad durante el ejercicio.',
    },
    {
      id: 'perdidasBolsa',
      label: 'Pérdidas por venta de acciones en el año (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Suma de las operaciones cerradas con minusvalía en el mismo ejercicio.',
    },
    {
      id: 'perdidasPreviasBolsa',
      label: 'Pérdidas bursátiles de años anteriores (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Pendientes de amortizar, dentro de la ventana de diez ejercicios.',
    },
    {
      id: 'dividendo',
      label: 'Dividendos recibidos en el año (MXN)',
      prefix: '$',
      value: 50000,
      thousands: true,
      help: 'El monto bruto del dividendo, antes de la retención del 10%.',
    },
    {
      id: 'criptoCompra',
      label: 'Lo que pagaste por la cripto (MXN)',
      prefix: '$',
      value: 50000,
      thousands: true,
      help: 'Costo de adquisición comprobable de lo que vendiste.',
    },
    {
      id: 'criptoVenta',
      label: 'Lo que recibiste al vender (MXN)',
      prefix: '$',
      value: 80000,
      thousands: true,
      help: 'Importe de la enajenación, antes de comisiones.',
    },
    {
      id: 'criptoComisiones',
      label: 'Comisiones del exchange (MXN)',
      prefix: '$',
      value: 500,
      thousands: true,
      help: 'Comisiones de compra, venta y retiro asociadas a la operación.',
    },
    {
      id: 'premio',
      label: 'Valor del premio (MXN)',
      prefix: '$',
      value: 100000,
      thousands: true,
      help: 'El monto del premio o el valor del bien, si es en especie.',
    },
    {
      id: 'impuestoEstatal',
      label: 'Impuesto estatal sobre el premio',
      suffix: '%',
      type: 'number',
      value: 6,
      min: 0,
      max: 30,
      step: 0.1,
      help: 'Lo fija la ley de hacienda de la entidad donde se paga el premio. Verifícalo antes de calcular.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué parte del rendimiento se va en impuesto',
    caption: 'Compara lo que te queda del rendimiento contra lo que se lleva el fisco en cada régimen.',
  },
  breakdownTitle: 'Número por número',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Por qué el banco me retiene ISR si casi no gané nada?',
      a: 'Porque la retención de intereses no se calcula sobre lo que ganaste, sino sobre el capital que generó los intereses, con una tasa anual que fija cada año la Ley de Ingresos. En instrumentos con tasa baja, esa retención puede llevarse una porción muy alta del rendimiento e incluso superarlo. Es un pago provisional: en la anual el impuesto se recalcula sobre el interés real y la retención se acredita.',
    },
    {
      q: '¿Qué es el interés real y por qué importa?',
      a: 'Es el interés nominal menos el efecto de la inflación sobre tu saldo. Es lo que realmente ganaste en poder adquisitivo, y es la base gravable de la declaración anual. Si la inflación se comió tu rendimiento, tu interés real puede ser cero o negativo, y entonces la retención que te hicieron durante el año puede volver como saldo a favor.',
    },
    {
      q: '¿Cuánto ISR pago por ganar en la bolsa?',
      a: 'Un 10% definitivo sobre la ganancia neta del ejercicio, es decir después de restar las pérdidas de tus otras ventas del mismo año. Es un régimen cedular: no se mezcla con tu sueldo ni con otros ingresos, y por eso a ingresos altos resulta mucho más barato que la tarifa general. La contrapartida es que no puedes optar por la tarifa general aunque te convenga.',
    },
    {
      q: '¿La casa de bolsa me retiene el impuesto de las acciones?',
      a: 'No. A diferencia del banco con los intereses, el intermediario bursátil no retiene el ISR de la ganancia: te emite una constancia con el resultado del ejercicio y tú lo declaras y lo pagas en abril. Es el error más frecuente del inversionista minorista: creer que ya estaba pagado porque nadie descontó nada.',
    },
    {
      q: '¿Qué hago si perdí dinero en la bolsa?',
      a: 'Declaras la pérdida en la anual del ejercicio en que ocurrió. Esa pérdida se puede compensar contra ganancias bursátiles de los diez ejercicios siguientes, actualizada por inflación. Solo compensa contra ganancias del mismo régimen: no baja el impuesto de tu sueldo. Si no la declaras el año en que ocurre, pierdes el derecho a usarla después.',
    },
    {
      q: '¿Cómo tributan los dividendos?',
      a: 'Con dos capas. La empresa retiene un 10% definitivo al momento de repartir, y además tú acumulas el dividendo en tu declaración anual multiplicado por un factor de piramidación, acreditando contra tu impuesto el ISR corporativo que la empresa ya pagó. Si tu tarifa personal es menor a la tasa corporativa, esa segunda capa puede generarte saldo a favor, y solo lo recuperas si declaras.',
    },
    {
      q: '¿Las criptomonedas pagan el 10% como la bolsa?',
      a: 'No. Es una confusión cara. Las criptomonedas no son valores listados en bolsa concesionada, así que la ganancia se trata como enajenación de bienes: se acumula a tus demás ingresos y paga la tarifa progresiva anual, que en tramos altos supera con mucho al 10% bursátil. Por eso este hub calcula el ISR de cripto sobre el acumulado y no con una tasa fija.',
    },
    {
      q: '¿El SAT puede ver mis operaciones en cripto?',
      a: 'Las plataformas que operan en México están sujetas a obligaciones de información y las instituciones financieras reportan operaciones relevantes. Además, el dinero tiene que entrar y salir por algún lado: los depósitos y las transferencias dejan rastro. La estrategia de no declarar porque nadie se entera dejó de ser realista hace varios años.',
    },
    {
      q: '¿Qué pasa si opero cripto todos los días?',
      a: 'La habitualidad puede reclasificar tu actividad como empresarial en lugar de una enajenación ocasional. Eso cambia el régimen por completo: declaraciones mensuales, deducciones autorizadas, contabilidad electrónica y otras obligaciones. No hay un número mágico de operaciones en la ley; se valora la habitualidad y la fuente principal de tu ingreso.',
    },
    {
      q: '¿Cuánto me retienen de un premio de lotería?',
      a: 'Un ISR federal sobre el valor del premio, más el impuesto estatal de la entidad donde se paga. La tasa federal es baja cuando el impuesto local no excede el umbral que marca la ley, y sube de forma drástica cuando lo excede. Como el impuesto local lo fija cada estado, la retención total sobre el mismo premio cambia mucho según dónde se cobra.',
    },
    {
      q: '¿El impuesto sobre premios se puede recuperar?',
      a: 'No. Es pago definitivo: el premio no se acumula a tus demás ingresos y esa retención no se acredita contra el impuesto de tu declaración anual. Aun así, si el premio es alto conviene declararlo como ingreso exento o no acumulable según corresponda, para justificar el origen del dinero frente a una discrepancia fiscal.',
    },
    {
      q: '¿Tengo que declarar mis inversiones aunque me hayan retenido?',
      a: 'Sí, en la mayoría de los casos. Si tus ingresos por intereses reales superan el umbral que fija la ley, o si tuviste ganancia bursátil, dividendos o enajenaciones, estás obligado a presentar la anual. Y aunque no estuvieras obligado, declarar suele convenirte: es la única forma de acreditar retenciones, compensar pérdidas y recuperar saldos a favor.',
    },
  ],

  sources: [
    {
      name: 'Ley del Impuesto sobre la Renta — intereses, bolsa, dividendos y premios (Arts. 54, 129, 135, 137-139 y 140)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley de Ingresos de la Federación 2026 — tasa de retención sobre intereses (Art. 24)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lif_2026.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'SAT — ingresos por intereses, dividendos y enajenación de bienes',
      url: 'https://www.sat.gob.mx/personas/declaraciones',
      publisher: 'SAT',
    },
    {
      name: 'Anexo 8 de la RMF 2026 — tarifas de ISR (DOF 28-dic-2025)',
      url: 'https://www.dof.gob.mx/',
      publisher: 'DOF',
    },
    {
      name: 'Banco de México — tasas de referencia e inflación',
      url: 'https://www.banxico.org.mx/',
      publisher: 'Banxico',
    },
  ],

  replaces: [
    '/calculadora-isr-intereses-bancarios-inversion-mexico-2026',
    '/calculadora-isr-acciones-bolsa-mexico-10-por-ciento',
    '/calculadora-isr-dividendos-persona-fisica-mexico',
    '/calculadora-cripto-bitcoin-impuestos-mexico-isr-ganancia',
    '/calculadora-isr-premios-loteria-mexico-2026',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
