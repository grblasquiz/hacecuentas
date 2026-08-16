import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Me toca declarar y cuánto me devuelven?"
 *
 * Fusiona las calculadoras de la declaración anual de personas físicas: el ISR
 * del ejercicio con la tarifa del Art. 152, el saldo a favor contra lo retenido,
 * el tope global de deducciones personales del Art. 151 y los dos rubros que van
 * FUERA de ese tope (colegiaturas por decreto y aportaciones de retiro).
 *
 * Todas las constantes salen de la fuente única src/lib/data/mexico-2026.ts
 * (tarifa anual del Anexo 8 RMF 2026, UMA INEGI 2026, topes de colegiaturas SAT).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/** Parámetros de la anual que el compute() necesita en el cliente. */
export const ANUAL_MX = {
  /** Tarifa ISR anual 2026 — Art. 152 LISR, Anexo 8 RMF 2026 (DOF 28-dic-2025). */
  tarifaAnual: MEXICO_2026.isrTarifaAnual as unknown as Array<[number, number, number, number]>,
  umaAnual: MEXICO_2026.uma.anual,
  /** Tope global Art. 151: el MENOR entre 5 UMA anuales y el 15% de los ingresos. */
  topeUmas: MEXICO_2026.deduccionesPersonales.topeUmasAnuales,
  topePct: MEXICO_2026.deduccionesPersonales.topePorcentajeIngresos,
  /** Topes propios de lo que va fuera del tope global (Art. 151 fracs. III y V). */
  donativosPct: 0.07,
  retiroPct: 0.1,
  /** Topes anuales por alumno del estímulo de colegiaturas (decreto DOF 26-dic-2013). */
  colegiaturas: MEXICO_2026.deduccionesPersonales.colegiaturas,
};

export const hub: HubData = {
  slug: 'mx/impuestos/declaracion-anual',
  title: 'Declaración anual SAT 2026: quién declara y cuánto devuelven',
  description:
    'Calculá tu declaración anual SAT 2026: ISR anual con la tarifa del Art. 152, deducciones personales, colegiaturas y tu saldo a favor estimado en México.',
  silo: 'Impuestos',
  siloHref: '/mx/impuestos',

  eyebrow: 'México · Declaración anual',
  h1: '¿Me toca declarar en el SAT y cuánto me devuelven?',
  lede:
    'La devolución no depende de cuántas facturas juntaste, sino de la diferencia entre el ISR que realmente te tocaba y el que ya te retuvieron. Elige tu caso y calcula los tres números que definen el resultado.',
  stamps: [
    'Tarifa anual · LISR Art. 152 (Anexo 8 RMF 2026)',
    'Tope de deducciones · LISR Art. 151',
    'Colegiaturas · decreto de estímulo, fuera del tope',
    '6 calculadoras fusionadas',
  ],

  resultLabel: 'Resultado de tu anual',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro: 'Empezamos por lo más consultado: cuánto te devuelven o cuánto te falta pagar.',
    items: [
      {
        id: 'saldo',
        label: 'Cuánto me devuelven (o cuánto debo)',
        hint: 'ISR del ejercicio contra lo que ya te retuvieron durante el año.',
        yes: [
          'ISR anual con la tarifa progresiva del Art. 152, no con una tasa plana',
          'Deducciones personales aplicadas con su tope real, rubro por rubro',
          'Saldo a favor para pedir en devolución, o saldo a cargo si te retuvieron de menos',
          'Tasa efectiva: qué porcentaje de tus ingresos se te fue en ISR',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La devolución automática exige que el saldo a favor esté declarado en tiempo, con CLABE a tu nombre y e.firma cuando el monto es alto',
          'Si tuviste dos patrones en el año, o ingresos por honorarios además del sueldo, estás obligado a declarar aunque no te devuelvan nada',
          'Las facturas sin tu RFC, sin forma de pago bancarizada o de un proveedor no autorizado no cuentan, aunque aparezcan en tu visor de deducciones',
        ],
        plazo:
          'la anual de personas físicas se presenta en abril; las de sueldos con saldo a favor conviene enviarlas los primeros días para entrar al esquema de devolución automática.',
        answer:
          'Se calcula el ISR anual sobre tus ingresos menos deducciones y se le resta lo retenido: si retuvieron de más, hay saldo a favor.',
      },
      {
        id: 'deducciones',
        label: 'Cuánto de lo que gasté puedo deducir de verdad',
        hint: 'El tope global recorta más de lo que la gente cree.',
        yes: [
          'Tope global: el MENOR entre 5 UMA anuales y el 15% de tus ingresos',
          'Qué rubros compiten por ese tope: médicos, hospitalarios, primas de gastos médicos, intereses reales de hipoteca y funerarios',
          'Qué rubros van aparte y tienen tope propio: donativos, aportaciones complementarias de retiro y colegiaturas',
          'Cuánto se recorta por topes y cuánto ISR te ahorra lo que sí entra',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El tope global es el menor de los dos límites, no el mayor: con ingresos bajos manda el 15% y con ingresos altos manda el de 5 UMA',
          'Los gastos funerarios tienen su propio tope de 1 UMA anual antes de entrar al tope global',
          'Deducir no es que te devuelvan lo gastado: baja tu base gravable, así que el ahorro real es la diferencia de ISR, no el monto de la factura',
        ],
        plazo:
          'las deducciones se toman del ejercicio en que las pagaste; lo pagado en enero ya cuenta para la anual del año siguiente.',
        answer:
          'Solo deduces hasta el menor entre 5 UMA anuales y el 15% de tus ingresos, salvo donativos, retiro y colegiaturas, que van aparte.',
      },
      {
        id: 'colegiaturas',
        label: 'Colegiaturas de mis hijos',
        hint: 'Tope por nivel escolar y por alumno; la universidad no entra.',
        yes: [
          'Monto deducible por alumno según el nivel escolar cursado',
          'Cuánto excede el tope de su nivel y por lo tanto no se deduce',
          'Ahorro de ISR estimado con tu tarifa anual real, no con un porcentaje inventado',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La licenciatura y el posgrado NO son deducibles: el estímulo llega hasta bachillerato o profesional técnico',
          'La inscripción, los útiles, el transporte escolar obligatorio facturado aparte y los recargos no entran',
          'Solo cuenta si pagaste con transferencia, tarjeta o cheque nominativo, la escuela tiene RVOE y el CFDI trae el complemento de instituciones educativas con tu RFC',
        ],
        plazo:
          'el CFDI de colegiaturas debe estar emitido dentro del ejercicio que declaras; pedirlo en abril, cuando ya declaraste, no lo recupera.',
        answer:
          'Deduces la colegiatura pagada hasta el tope anual de su nivel escolar por cada alumno, y va aparte del tope global.',
      },
    ],
  },

  inputsTitle: 'Tus datos del ejercicio',
  inputsIntro:
    'En pesos mexicanos y en montos anuales. Cada caso usa los campos que necesita e ignora el resto.',
  fields: [
    {
      id: 'ingresosAnuales',
      label: 'Ingresos anuales acumulables (MXN)',
      prefix: '$',
      value: 400000,
      thousands: true,
      help: 'Sueldos, honorarios, arrendamiento y demás ingresos acumulables del ejercicio.',
    },
    {
      id: 'isrRetenido',
      label: 'ISR que te retuvieron en el año (MXN)',
      prefix: '$',
      value: 35000,
      thousands: true,
      help: 'Lo que aparece en tu constancia de percepciones o en tus CFDI de nómina y honorarios.',
    },
    {
      id: 'gastosMedicos',
      label: 'Gastos médicos, dentales y hospitalarios (MXN)',
      prefix: '$',
      value: 20000,
      thousands: true,
      help: 'Incluye psicología, nutrición, lentes graduados y primas de seguro de gastos médicos.',
    },
    {
      id: 'interesesHipoteca',
      label: 'Intereses reales de tu hipoteca (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'El dato viene en la constancia anual del banco; son los reales, no los intereses pagados.',
    },
    {
      id: 'gastosFunerarios',
      label: 'Gastos funerarios (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Tienen tope propio de 1 UMA anual antes de competir por el tope global.',
    },
    {
      id: 'donativos',
      label: 'Donativos a donatarias autorizadas (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Van fuera del tope global, con límite propio del 7% de tus ingresos.',
    },
    {
      id: 'aportacionesRetiro',
      label: 'Aportaciones complementarias de retiro (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Plan personal de retiro o aportación voluntaria de largo plazo a tu Afore.',
    },
    {
      id: 'colegiaturaNivel',
      label: 'Nivel escolar de la colegiatura',
      type: 'select',
      value: 'primaria',
      options: [
        { value: 'preescolar', label: 'Preescolar' },
        { value: 'primaria', label: 'Primaria' },
        { value: 'secundaria', label: 'Secundaria' },
        { value: 'profesionalTecnico', label: 'Profesional técnico' },
        { value: 'bachillerato', label: 'Bachillerato' },
      ],
      help: 'Cada nivel tiene su propio tope anual por alumno. Licenciatura no es deducible.',
    },
    {
      id: 'colegiaturaPago',
      label: 'Colegiaturas pagadas en el año (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Solo colegiaturas: la inscripción y los útiles no cuentan.',
    },
    {
      id: 'colegiaturaAlumnos',
      label: 'Alumnos en ese nivel',
      type: 'number',
      value: 1,
      min: 0,
      max: 10,
      step: 1,
      help: 'El tope aplica por alumno, así que dos hijos en primaria duplican el límite.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte el resultado',
    caption:
      'Muestra qué parte de tu ingreso queda gravada, qué parte lograste deducir y qué se recortó por los topes.',
  },
  breakdownTitle: 'Número por número',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Estoy obligado a presentar la declaración anual?',
      a: 'Si solo tuviste un patrón todo el año, ganaste menos de 400 mil pesos y no le avisaste que declararías por tu cuenta, tu patrón ya declaró por ti. Estás obligado si tuviste dos o más patrones, ingresos superiores a 400 mil pesos, honorarios, arrendamiento, actividad empresarial, intereses altos, venta de bienes o si terminaste la relación laboral y cobraste indemnización. Aun sin obligación, puedes declarar voluntariamente: es la única forma de recuperar un saldo a favor.',
    },
    {
      q: '¿Cuánto puedo deducir como máximo?',
      a: 'El tope global es el menor entre cinco UMA anuales y el quince por ciento de tus ingresos totales. Con ingresos bajos casi siempre manda el quince por ciento, y con ingresos altos el límite de las cinco UMA. Fuera de ese tope quedan los donativos, con su propio límite del siete por ciento, las aportaciones complementarias de retiro, con el diez por ciento de tus ingresos como techo, y las colegiaturas, que se rigen por el decreto de estímulo.',
    },
    {
      q: '¿Cuándo me llega la devolución?',
      a: 'Si entras al esquema de devolución automática y no hay inconsistencias, el depósito suele llegar en unas semanas. Se retrasa o cae a revisión manual cuando la CLABE no está a tu nombre, la cuenta está inactiva, el saldo es alto, hay diferencias entre lo que declaraste y lo que reporta tu visor, o tienes créditos fiscales pendientes. Presentar en los primeros días de abril mejora bastante el tiempo de respuesta.',
    },
    {
      q: '¿Qué gastos médicos son deducibles?',
      a: 'Honorarios médicos, dentales, de psicología y de nutrición cuando quien los presta tiene título profesional registrado, gastos hospitalarios, análisis, estudios clínicos, prótesis, lentes ópticos graduados hasta cierto monto y las primas de seguros de gastos médicos mayores. Tienen que ser para ti, tu cónyuge, tus padres o tus hijos, estar pagados con medio bancarizado y amparados con CFDI a tu RFC. El efectivo nunca es deducible, sin importar el monto.',
    },
    {
      q: '¿Las colegiaturas de la universidad son deducibles?',
      a: 'No. El estímulo llega hasta bachillerato o profesional técnico. Licenciatura, ingeniería, maestría, doctorado y cualquier posgrado quedan fuera, por más que la factura traiga el complemento educativo. Tampoco entran la inscripción, la reinscripción, los útiles, los uniformes ni las cuotas de padres de familia.',
    },
    {
      q: '¿Qué son los intereses reales de la hipoteca?',
      a: 'No es todo lo que pagaste de intereses, sino la parte que excede a la inflación del periodo. El banco la calcula y la reporta en la constancia anual que emite hacia febrero. Por eso, en años de inflación alta, un crédito puede arrojar intereses reales mucho menores a lo que efectivamente pagaste, e incluso cercanos a cero.',
    },
    {
      q: '¿Deducir significa que me devuelven lo que gasté?',
      a: 'No, y es el malentendido más caro de la temporada. Deducir baja tu base gravable; lo que recuperas es el ISR que esa base ya no genera. Una deducción de diez mil pesos en un tramo del dieciséis por ciento devuelve alrededor de mil seiscientos pesos, no diez mil. Por eso este hub calcula el ahorro con la diferencia real de la tarifa y no con un porcentaje fijo.',
    },
    {
      q: '¿Qué pasa si me retuvieron de menos?',
      a: 'Entonces te sale saldo a cargo y tienes que pagarlo al presentar la anual. Suele ocurrir cuando tuviste dos patrones en el mismo año, porque cada uno aplicó la tarifa como si fuera tu único ingreso, o cuando cobraste honorarios donde la retención del diez por ciento se quedó corta frente a tu tarifa real. Puedes solicitar pago en parcialidades si presentas en tiempo.',
    },
    {
      q: '¿Sirve el visor de deducciones del SAT?',
      a: 'Sirve como punto de partida, no como verdad final. El visor concentra los CFDI que tus proveedores timbraron con tu RFC, pero puede traer facturas que no son deducibles y, al revés, puede faltarle alguna que sí lo es. Lo que declaras es tu responsabilidad, así que conviene depurar el visor concepto por concepto antes de enviar.',
    },
    {
      q: '¿Puedo deducir gastos de mi familia?',
      a: 'Sí, en gastos médicos y funerarios, siempre que sean de tu cónyuge o concubino, tus padres o tus hijos, y que esas personas no hayan tenido ingresos superiores a una UMA anual en el ejercicio. El CFDI debe ir a tu RFC. Para colegiaturas, el requisito es el parentesco en línea recta descendiente y que el alumno no perciba ingresos propios.',
    },
    {
      q: '¿Hasta cuándo puedo pedir un saldo a favor de años anteriores?',
      a: 'La devolución prescribe a los cinco años contados desde que se presentó la declaración correspondiente. Puedes presentar declaraciones de ejercicios pasados o complementarias para recuperar saldos que no pediste, aunque las complementarias con saldo a favor suelen caer a revisión manual y tardan más.',
    },
    {
      q: '¿Qué pasa si no declaro teniendo obligación?',
      a: 'Se generan multas por no presentar, más actualización y recargos sobre el impuesto que hubieras tenido que pagar, y el incumplimiento puede bloquear la emisión de tu opinión de cumplimiento, que muchas empresas piden para contratarte o pagarte. Presentar tarde siempre sale más barato que esperar a que el SAT lo detecte.',
    },
  ],

  sources: [
    {
      name: 'Ley del Impuesto sobre la Renta — deducciones personales y cálculo anual (Arts. 150, 151 y 152)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Anexo 8 de la RMF 2026 — tarifas de ISR (DOF 28-dic-2025)',
      url: 'https://www.dof.gob.mx/',
      publisher: 'DOF',
    },
    {
      name: 'SAT — Declaración Anual de personas físicas',
      url: 'https://www.sat.gob.mx/declaracion/23178/presenta-tu-declaracion-anual-de-personas-fisicas',
      publisher: 'SAT',
    },
    {
      name: 'SAT — Deducciones personales y estímulo por colegiaturas',
      url: 'https://www.sat.gob.mx/consultas/23972/conoce-las-deducciones-personales',
      publisher: 'SAT',
    },
    {
      name: 'INEGI — valor de la UMA 2026',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
  ],

  replaces: [
    '/calculadora-isr-anual-personas-fisicas-mexico-tarifa-2026',
    '/calculadora-devolucion-impuestos-declaracion-anual',
    '/calculadora-deduccion-gastos-medicos-mexico-personales-anual',
    '/calculadora-colegiaturas-deducibles-sat-mexico',
    '/calculadora-deduccion-intereses-hipoteca-declaracion-anual-mexico',
    '/calculadora-tope-deducciones-personales-2026-mexico',
  ],

  lastReviewed: '2026-08-16',
  locale: 'mx',
};
