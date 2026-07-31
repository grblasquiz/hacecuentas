import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "Facturo por mi cuenta: ¿cuánto ISR pago y qué régimen me conviene?"
 *
 * Fusiona las calculadoras de personas físicas que facturan: retenciones de una
 * factura de honorarios, cuota de RESICO, pago provisional del régimen general de
 * actividad empresarial y profesional, retención de plataformas digitales y la
 * comparación contra el esquema de asimilados a salarios.
 *
 * Tarifas y tabla de RESICO desde la fuente única src/lib/data/mexico-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const FACTURO_MX = {
  /** Tarifa ISR mensual 2026 — Art. 96 LISR, Anexo 8 RMF 2026 (DOF 28-dic-2025). */
  tarifaMensual: MEXICO_2026.isrTarifaMensual as unknown as Array<[number, number, number, number]>,
  /** RESICO PF — Art. 113-E LISR: tabla mensual de tasas sobre el ingreso cobrado y tope anual. */
  resico: {
    tabla: MEXICO_2026.resicoPf.tablaMensual as unknown as Array<[number, number]>,
    topeAnual: MEXICO_2026.resicoPf.topeIngresosAnual,
    retencionPersonaMoral: MEXICO_2026.resicoPf.retencionPersonaMoral,
  },
  iva: MEXICO_2026.iva.general,
  /**
   * Retenciones de una factura de honorarios a persona moral. No viven en
   * mexico-2026.ts porque son tasas de ley fijas:
   *  - ISR 10% sobre el subtotal (LISR Art. 106, último párrafo).
   *  - IVA: dos terceras partes del impuesto trasladado (LIVA Art. 1-A fracc. II
   *    inciso a) y RLIVA Art. 3 fracc. I) = 10,6667% del subtotal con tasa del 16%.
   */
  honorarios: {
    retIsr: 0.1,
    retIvaTercios: 2 / 3,
  },
  /**
   * Plataformas digitales — LISR Art. 113-A y LIVA Art. 18-J. Las tasas de ISR por
   * actividad y el 20% sin RFC replican src/lib/formulas/retencion-plataformas-digitales-mexico-2026.ts,
   * donde están verificadas contra el texto de los artículos y la LIF 2026.
   */
  plataformas: {
    transporte: 0.021,
    hospedaje: 0.04,
    bienesServicios: 0.025,
    sinRfc: 0.2,
    ivaConRfc: 0.08,
    ivaSinRfc: 0.16,
  },
};

export const hub: HubData = {
  slug: 'mx/impuestos/isr-por-mi-cuenta',
  title: 'Calculadora de impuestos RIF 2026: RESICO, ISR y régimen general',
  description:
    'El RIF fue sustituido para nuevas altas: compara RESICO y régimen general y calcula cuánto ISR pagas por tu cuenta en México, las retenciones de honorarios y los descuentos de plataformas digitales.',
  silo: 'Impuestos',
  siloHref: '/mx/impuestos',

  eyebrow: 'México · Facturo por mi cuenta',
  h1: '¿Todavía existe el RIF? Calculá tus impuestos con RESICO o régimen general',
  lede:
    'Con el mismo ingreso, la diferencia entre RESICO y el régimen general puede ser de varios miles de pesos al mes. Depende de cuánto puedas deducir y de quién sea tu cliente. Elige tu caso y compara.',
  stamps: [
    'RESICO PF · LISR Art. 113-E',
    'Régimen general · LISR Arts. 100, 106 y 152',
    'Plataformas digitales · LISR Art. 113-A y LIVA Art. 18-J',
    '6 calculadoras fusionadas',
  ],

  resultLabel: 'Tu ISR del mes',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro: 'Empezamos por lo más consultado: qué te queda de una factura con retenciones.',
    items: [
      {
        id: 'factura',
        label: 'Cuánto me queda de una factura de honorarios',
        hint: 'Con las retenciones de ISR e IVA cuando el cliente es persona moral.',
        yes: [
          'IVA trasladado que le cobras al cliente sobre el subtotal',
          'Retención de ISR del 10% y retención de IVA de dos tercios, cuando el cliente es persona moral',
          'Total facturado y neto que efectivamente te depositan',
          'Qué parte de lo retenido recuperas después como pago a cuenta',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Una persona física no te retiene nada: cobras el subtotal más el IVA completo, y ese IVA lo enteras tú',
          'Las retenciones no son un costo perdido: son anticipo de tus impuestos y se acreditan en tu declaración',
          'Si estás en RESICO, la retención de ISR de una persona moral es del 1,25% sobre el subtotal, no del 10%',
        ],
        plazo:
          'el IVA se causa cuando cobras, no cuando facturas: pide el complemento de pago para documentar la fecha real.',
        answer:
          'De una factura a persona moral cobras el subtotal más IVA, menos el 10% de ISR y dos tercios del IVA retenidos.',
      },
      {
        id: 'resico',
        label: 'Mi cuota en RESICO',
        hint: 'Tasa sobre el ingreso cobrado, sin deducir gastos.',
        yes: [
          'Tasa que te toca según tu ingreso mensual cobrado, de la tabla del Art. 113-E',
          'Cuota mensual y anualizada, y tasa efectiva sobre tu ingreso',
          'Comparación directa contra lo que pagarías en el régimen general con tus gastos',
          'Aviso si tu proyección anual rebasa el tope que te saca del régimen',
        ],
        warn: [
          DISCLAIMER_TAX,
          'En RESICO no deduces gastos: la tasa se aplica sobre el ingreso cobrado completo, así que a mayor gasto real, menos conviene',
          'Rebasar el tope anual de ingresos te expulsa del régimen y te obliga a tributar en el general desde el mes siguiente',
          'RESICO exige estar al corriente, tener e.firma activa, presentar todas las declaraciones mensuales y la anual: incumplir puede sacarte del régimen',
          'El IVA sigue siendo aparte: RESICO simplifica el ISR, no te exime del IVA',
        ],
        plazo:
          'los pagos mensuales de RESICO se presentan a más tardar el día 17 del mes siguiente, y la anual en abril.',
        answer:
          'En RESICO pagas una tasa de entre el 1% y el 2,5% sobre el ingreso cobrado, sin deducir gastos.',
      },
      {
        id: 'general',
        label: 'Mi pago provisional en el régimen general',
        hint: 'Actividad empresarial y profesional: ingresos menos gastos deducibles.',
        yes: [
          'Utilidad fiscal del periodo: ingresos cobrados menos deducciones autorizadas',
          'Pago provisional de ISR con la tarifa mensual del Art. 96',
          'Margen de utilidad y tasa efectiva sobre tus ingresos',
          'Comparación contra la cuota que pagarías en RESICO con el mismo ingreso',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Es una estimación de un mes aislado: el pago provisional real se calcula sobre el acumulado del ejercicio y resta los pagos anteriores y las retenciones',
          'Solo son deducibles los gastos estrictamente indispensables, con CFDI y pagados por medio bancarizado cuando la ley lo exige',
          'Este régimen sí permite deducciones personales, pero recién en el cálculo anual, no en los pagos provisionales',
        ],
        plazo:
          'el pago provisional vence el día 17 del mes siguiente y el cálculo definitivo se hace en la anual de abril.',
        answer:
          'Se aplica la tarifa progresiva mensual sobre la utilidad fiscal, es decir sobre ingresos cobrados menos gastos deducibles.',
      },
      {
        id: 'plataformas',
        label: 'Lo que me retiene una app',
        hint: 'Uber, Didi, Rappi, Airbnb, marketplaces.',
        yes: [
          'Retención de ISR según la actividad: transporte y entrega, hospedaje, o venta de bienes y servicios',
          'Retención de IVA que aplica la plataforma sobre tu ingreso',
          'Neto que efectivamente te deposita la app',
          'Cuánto más te retienen si no diste tu RFC',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Sin RFC registrado en la app la retención de ISR sube al 20% y la de IVA al 100% del impuesto: es la diferencia más cara de todo el esquema',
          'Las retenciones de la plataforma pueden ser pago definitivo o provisional según el régimen que elegiste y tu nivel de ingresos',
          'Si además vendes fuera de la app, esos ingresos no llevan retención y los declaras tú',
        ],
        plazo:
          'la plataforma entera la retención a más tardar el día 17 del mes siguiente y te entrega constancia mensual: consérvala para acreditarla.',
        answer:
          'La app retiene ISR según tu actividad y la mitad del IVA, y te deposita el resto; sin RFC las tasas se disparan.',
      },
      {
        id: 'asimilados',
        label: 'Asimilados a salarios vs. honorarios',
        hint: 'Qué te conviene cuando el cliente te ofrece las dos.',
        yes: [
          'ISR mensual como asimilado, con la tarifa del Art. 96 sobre el ingreso completo',
          'ISR estimado facturando por honorarios, después de deducir tus gastos reales',
          'Diferencia de neto entre las dos modalidades con tus números',
          'Qué le cuesta a tu cliente cada opción',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Como asimilado NO deduces gastos: la tarifa se aplica sobre el ingreso completo, aunque trabajes con costos altos',
          'Asimilados a salarios no genera relación laboral ni alta en el IMSS: no hay aguinaldo, ni vacaciones, ni antigüedad, ni acceso a servicios médicos por esa vía',
          'Si la relación tiene subordinación, horario y supervisión, disfrazarla de asimilados o de honorarios es una simulación con riesgo laboral y fiscal para ambas partes',
          'Por honorarios cobras IVA, así que a tu cliente le cuesta más de entrada aunque después lo acredite',
        ],
        plazo:
          'el cambio de esquema se define al firmar el contrato: cambiar a mitad de año complica el cálculo anual y suele generar saldo a cargo.',
        answer:
          'Asimilados te descuenta ISR sobre el ingreso completo; honorarios te deja deducir gastos, pero te obliga a llevar contabilidad y cobrar IVA.',
      },
    ],
  },

  inputsTitle: 'Tus datos del mes',
  inputsIntro:
    'En pesos mexicanos y sin IVA, salvo donde se indique. Cada caso usa los campos que necesita e ignora el resto.',
  fields: [
    {
      id: 'ingresoMensual',
      label: 'Ingreso mensual cobrado, sin IVA (MXN)',
      prefix: '$',
      value: 40000,
      thousands: true,
      help: 'Lo que efectivamente cobraste en el mes. En plataformas, lo que te liquidó la app antes de retenciones.',
    },
    {
      id: 'deduccionesMensuales',
      label: 'Gastos deducibles del mes (MXN)',
      prefix: '$',
      value: 10000,
      thousands: true,
      help: 'Solo gastos estrictamente indispensables, con CFDI. RESICO los ignora: ahí no se deduce.',
    },
    {
      id: 'tipoCliente',
      label: 'Tu cliente es',
      type: 'select',
      value: 'moral',
      options: [
        { value: 'moral', label: 'Persona moral (empresa) — sí retiene' },
        { value: 'fisica', label: 'Persona física — no retiene' },
      ],
      help: 'Solo las personas morales están obligadas a retenerte ISR e IVA.',
    },
    {
      id: 'actividad',
      label: 'Actividad en la plataforma',
      type: 'select',
      value: 'transporte',
      options: [
        { value: 'transporte', label: 'Transporte de pasajeros o entrega de bienes' },
        { value: 'hospedaje', label: 'Hospedaje' },
        { value: 'bienesServicios', label: 'Venta de bienes o prestación de servicios' },
      ],
      help: 'Cada fracción del Art. 113-A tiene su propia tasa de retención.',
    },
    {
      id: 'dioRfc',
      label: '¿Diste tu RFC a la plataforma?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, está registrado en la app' },
        { value: 'no', label: 'No lo di' },
      ],
      help: 'Sin RFC la app aplica las tasas de castigo: 20% de ISR y el IVA completo.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'A dónde va tu ingreso',
    caption: 'Muestra qué parte del ingreso del mes te queda y qué parte se va en impuestos y retenciones.',
  },
  breakdownTitle: 'Número por número',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Todavía existe el RIF y cómo se calculan sus impuestos en 2026?',
      a: 'No. El Régimen de Incorporación Fiscal (RIF) dejó de admitir nuevas altas y fue sustituido por RESICO para la mayoría de las personas físicas con actividad empresarial. Si venías tributando en RIF y conservaste el régimen por las reglas transitorias, no corresponde usar una calculadora genérica de RIF: tus porcentajes dependen del año de permanencia y de tu situación ante el SAT. Para una actividad nueva en 2026, compará RESICO contra el régimen general con esta calculadora.',
    },
    {
      q: '¿Me conviene RESICO o el régimen general?',
      a: 'Depende de tu margen. RESICO cobra una tasa baja sobre el ingreso cobrado pero no deja deducir un solo peso de gastos; el régimen general aplica una tarifa progresiva más alta, pero sobre la utilidad. Si tus gastos deducibles son mínimos, como en muchos servicios profesionales, RESICO casi siempre gana. Si tienes costos fuertes de insumos, personal o mercancía, el general puede salir más barato. Este hub compara los dos con tus propios números.',
    },
    {
      q: '¿Cuánto es la tasa de RESICO?',
      a: 'Va de un 1% a un 2,5% según el ingreso mensual cobrado, en cinco escalones de la tabla del Art. 113-E de la LISR. La tasa aplica sobre el ingreso total cobrado del mes, sin deducciones, y el pago mensual es definitivo. Es de las cargas de ISR más bajas del sistema mexicano.',
    },
    {
      q: '¿Qué pasa si rebaso el tope de ingresos de RESICO?',
      a: 'Dejas de poder tributar en el régimen y tienes que pasarte al régimen general de actividad empresarial y profesional a partir del mes siguiente a aquel en que lo excediste. Además pierdes el beneficio para el resto del ejercicio, así que conviene vigilar el acumulado mes a mes y no solo la proyección.',
    },
    {
      q: '¿Cuánto me retienen en una factura de honorarios?',
      a: 'Si tu cliente es persona moral y tributas en el régimen general, te retiene el 10% de ISR sobre el subtotal y dos terceras partes del IVA trasladado, que con la tasa general equivale a un 10,6667% del subtotal. Si estás en RESICO, la retención de ISR es del 1,25%. Si tu cliente es persona física, no hay retención alguna.',
    },
    {
      q: '¿Las retenciones son un impuesto extra?',
      a: 'No. Son anticipo de impuestos que ya te corresponden. El ISR retenido se acredita contra tu impuesto del ejercicio y el IVA retenido se descuenta del IVA a cargo de tu declaración mensual. Si al final del año te retuvieron más de lo que debías, sale saldo a favor y lo pides en devolución.',
    },
    {
      q: '¿Qué me retiene una plataforma digital?',
      a: 'Retiene ISR con la tasa de tu actividad, que es distinta para transporte y entregas, para hospedaje y para venta de bienes o servicios, y además retiene la mitad del IVA que cobra la operación. Si no registraste tu RFC en la app, la retención de ISR sube al 20% y la de IVA pasa al impuesto completo. Registrar el RFC es el trámite con mejor retorno inmediato de todo el esquema.',
    },
    {
      q: '¿Puedo estar en RESICO y también tener sueldo?',
      a: 'Sí. Puedes combinar RESICO de actividad empresarial y profesional con ingresos por sueldos e incluso por intereses, siempre que la suma de todos ellos no exceda el tope anual del régimen. Lo que no puedes es combinarlo con ser socio o accionista de una empresa vinculada, ni con ser residente en el extranjero con establecimiento en México.',
    },
    {
      q: '¿Qué gastos puedo deducir en el régimen general?',
      a: 'Los estrictamente indispensables para tu actividad: renta del local, servicios, insumos, equipo por la vía de la depreciación, honorarios de terceros, viáticos con requisitos, cuotas de seguridad social. Todos necesitan CFDI a tu RFC y pago bancarizado cuando superan el umbral que fija la ley. El gasto personal, aunque lo hayas facturado, no es deducible de la actividad.',
    },
    {
      q: '¿Los asimilados a salarios pagan IMSS?',
      a: 'No por el hecho de estar asimilados. La asimilación es un esquema de retención de ISR, no una relación laboral: no genera alta ante el IMSS, ni aguinaldo, ni prima vacacional, ni antigüedad. Si en los hechos hay subordinación, horario y supervisión, la relación es laboral aunque el contrato diga otra cosa, y esa simulación tiene riesgo para las dos partes.',
    },
    {
      q: '¿Tengo que cobrar IVA si facturo por honorarios?',
      a: 'En general sí, a la tasa del 16%, y ese IVA no es tuyo: lo recaudas para el fisco y lo enteras en tu declaración mensual, descontando el IVA acreditable de tus gastos. Hay servicios exentos, como la enseñanza con reconocimiento oficial o ciertos servicios médicos, y operaciones a tasa cero, pero son supuestos tasados en la ley.',
    },
    {
      q: '¿Cuándo se presentan las declaraciones si facturo por mi cuenta?',
      a: 'La declaración mensual, tanto de ISR como de IVA, vence el día 17 del mes siguiente. La declaración anual de personas físicas se presenta en abril. Estar al corriente con todas las mensuales es requisito para permanecer en RESICO y para obtener una opinión de cumplimiento positiva, que muchos clientes empresariales piden antes de pagarte.',
    },
    {
      q: '¿Qué pasa si facturo sin estar dado de alta?',
      a: 'No puedes emitir CFDI sin RFC activo con la obligación correspondiente, así que en la práctica no facturas. Cobrar sin factura no elimina el ingreso: si llega a tus cuentas y no está declarado, el SAT puede determinarlo como ingreso omitido, con actualización, recargos y multas. Darte de alta es gratuito y se hace en línea.',
    },
  ],

  sources: [
    {
      name: 'Ley del Impuesto sobre la Renta — RESICO, actividad empresarial y plataformas (Arts. 100, 106, 113-A y 113-E)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lisr.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Ley del Impuesto al Valor Agregado — retención de IVA (Art. 1-A) y plataformas (Art. 18-J)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/liva.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'SAT — Régimen Simplificado de Confianza para personas físicas',
      url: 'https://www.sat.gob.mx/personas/regimen-simplificado-de-confianza',
      publisher: 'SAT',
    },
    {
      name: 'SAT — Plataformas tecnológicas: retenciones a personas físicas',
      url: 'https://www.sat.gob.mx/personas/plataformas-tecnologicas',
      publisher: 'SAT',
    },
    {
      name: 'Anexo 8 de la RMF 2026 — tarifas de ISR (DOF 28-dic-2025)',
      url: 'https://www.dof.gob.mx/',
      publisher: 'DOF',
    },
  ],

  replaces: [
    '/calculadora-isr-honorarios-persona-fisica',
    '/calculadora-honorarios-asimilados-vs-honorarios-libres-mexico',
    '/calculadora-isr-actividad-empresarial-persona-fisica-mexico-2026',
    '/calculadora-resico-personas-fisicas-mexico-2026-cuota',
    '/calculadora-rfc-cuota-resico-pf-mexico',
    '/calculadora-retencion-plataformas-digitales-mexico-2026',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
