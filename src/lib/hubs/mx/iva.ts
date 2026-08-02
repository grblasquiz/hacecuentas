import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Cuánto IVA llevo trasladado, acreditable y a pagar?"
 *
 * Fusiona las calculadoras de IVA del catálogo mexicano: sumar o extraer el
 * impuesto de un monto, resolver la declaración mensual con el saldo entre
 * trasladado y acreditable, y entender qué tasa aplica en cada caso (16%,
 * 8% de región fronteriza, tasa 0% y actos exentos, que no son lo mismo).
 *
 * Tasas desde la fuente única src/lib/data/mexico-2026.ts (LIVA).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

/** Tasas de IVA vigentes (LIVA Arts. 1, 2-A y decreto de región fronteriza). */
export const IVA_MX = {
  general: MEXICO_2026.iva.general,
  frontera: MEXICO_2026.iva.frontera,
  tasaCero: MEXICO_2026.iva.tasaCero,
};

export const hub: HubData = {
  slug: 'mx/impuestos/iva',
  title: 'IVA en México: calcular 16%, 8% de frontera, trasladado y acreditable',
  description:
    'Suma o extrae el IVA de cualquier monto con la tasa que te toca, resuelve tu declaración mensual restando el IVA acreditable del trasladado y entiende la diferencia entre tasa 0% y actos exentos.',
  silo: 'Impuestos',
  siloHref: '/mx/impuestos',

  eyebrow: 'México · IVA',
  h1: '¿Cuánto IVA llevo trasladado, acreditable y a pagar?',
  lede:
    'El IVA no es solo multiplicar por 1,16. Depende de la tasa que aplica a tu operación, de si el monto ya lo trae incluido y, cuando declaras, del impuesto que cobraste contra el que pagaste. Elige tu caso.',
  stamps: [
    'Tasa general 16% · LIVA Art. 1',
    'Región fronteriza 8% · decreto de estímulos',
    'Tasa 0% y exentos · Arts. 2-A y 9',
    '4 calculadoras fusionadas',
  ],

  resultLabel: 'IVA del cálculo',

  cases: {
    title: '¿Qué necesitas resolver?',
    intro: 'Empezamos por lo más consultado: sacar el IVA de un monto concreto.',
    items: [
      {
        id: 'monto',
        label: 'Calcular el IVA de un monto',
        hint: 'Sumarlo a un subtotal o extraerlo de un total que ya lo incluye.',
        yes: [
          'IVA que corresponde al monto con la tasa que elijas',
          'Subtotal y total, en cualquiera de las dos direcciones del cálculo',
          'Diferencia entre la tasa general y la de región fronteriza sobre el mismo monto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Extraer el IVA de un total no es restarle el 16%: hay que dividir entre 1,16, porque el impuesto se calculó sobre el subtotal',
          'La tasa de región fronteriza no aplica solo por estar en un estado del norte: exige domicilio o sucursal en la franja y aviso previo ante el SAT',
        ],
        plazo: 'el IVA se causa cuando efectivamente se cobra la contraprestación, no cuando se emite la factura.',
        answer:
          'Para sumarlo, multiplica el subtotal por la tasa; para extraerlo de un total, divide entre uno más la tasa.',
      },
      {
        id: 'declaracion',
        label: 'Mi declaración mensual de IVA',
        hint: 'Cuánto pagar o cuánto queda a favor este mes.',
        yes: [
          'IVA trasladado: el que efectivamente cobraste a tus clientes en el mes',
          'IVA acreditable: el que efectivamente pagaste a tus proveedores y cumple requisitos',
          'Retenciones de IVA que te hayan hecho, restadas del impuesto a cargo',
          'Saldo a pagar o saldo a favor del período',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El IVA es de flujo de efectivo: solo entra el que cobraste y el que pagaste, no el que está facturado y pendiente',
          'Para acreditar necesitas el CFDI, que el gasto sea estrictamente indispensable y que el pago se haya hecho por medios bancarizados cuando la ley lo exige',
          'Un saldo a favor se puede acreditar contra meses siguientes, compensar o solicitar en devolución: no se pierde, pero sí prescribe a los cinco años',
        ],
        plazo: 'la declaración mensual se presenta a más tardar el día 17 del mes siguiente.',
        answer:
          'Se resta el IVA acreditable del trasladado: si da positivo, pagas; si da negativo, queda saldo a favor.',
      },
      {
        id: 'tasa',
        label: 'Qué tasa me toca (16%, 8%, 0% o exento)',
        hint: 'La diferencia entre tasa 0% y exento cambia si puedes acreditar.',
        yes: [
          'Tasa aplicable a tu operación y el impuesto que resulta',
          'Comparación del mismo monto con tasa general y con tasa de región fronteriza',
          'Explicación de por qué la tasa 0% te conviene y el acto exento no',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Tasa 0% y exento no son lo mismo: con tasa 0% no cobras IVA pero sí acreditas el que pagaste; con acto exento no cobras y tampoco puedes acreditar, así que el IVA se te vuelve costo',
          'La tasa 0% aplica a supuestos tasados en la ley, como alimentos básicos, medicinas de patente, libros y exportaciones',
          'El estímulo de región fronteriza tiene vigencia limitada y requiere estar inscrito en el padrón correspondiente',
        ],
        plazo: 'el aviso para aplicar el estímulo de región fronteriza se presenta antes de empezar a aplicarlo.',
        answer:
          'La tasa general es 16%, la de región fronteriza 8%, y hay operaciones con tasa 0% y otras exentas, que no permiten acreditar.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro: 'En pesos mexicanos. Cada caso usa los campos que necesita e ignora el resto.',
  fields: [
    {
      id: 'monto',
      label: 'Monto (MXN)',
      prefix: '$',
      value: 1000,
      thousands: true,
      help: 'Subtotal o total, según la dirección que elijas abajo.',
    },
    {
      id: 'direccion',
      label: 'Dirección del cálculo',
      type: 'select',
      value: 'sumar',
      options: [
        { value: 'sumar', label: 'Sumar IVA (de subtotal a total)' },
        { value: 'extraer', label: 'Extraer IVA (de total a subtotal)' },
      ],
      help: 'Extraer el IVA de un total no es restarle la tasa: se divide entre uno más la tasa.',
    },
    {
      id: 'tasa',
      label: 'Tasa aplicable',
      type: 'select',
      value: '16',
      options: [
        { value: '16', label: '16% — tasa general' },
        { value: '8', label: '8% — región fronteriza' },
        { value: '0', label: '0% — alimentos básicos, medicinas, libros, exportación' },
        { value: 'exento', label: 'Exento — no se cobra y no se acredita' },
      ],
      help: 'La tasa 0% permite acreditar; el acto exento, no.',
    },
    {
      id: 'trasladado',
      label: 'IVA trasladado cobrado en el mes (MXN)',
      prefix: '$',
      value: 16000,
      thousands: true,
      help: 'El que efectivamente cobraste a tus clientes.',
    },
    {
      id: 'acreditable',
      label: 'IVA acreditable pagado en el mes (MXN)',
      prefix: '$',
      value: 9000,
      thousands: true,
      help: 'El que efectivamente pagaste a proveedores, con CFDI y requisitos cumplidos.',
    },
    {
      id: 'retenido',
      label: 'IVA que te retuvieron (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Habitual cuando facturas a personas morales por servicios profesionales o arrendamiento.',
    },
    {
      id: 'saldoAnterior',
      label: 'Saldo a favor de meses anteriores (MXN)',
      prefix: '$',
      value: 0,
      thousands: true,
      help: 'Lo que traes acumulado y decides acreditar este mes.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'stacked',
    title: 'Cómo se arma el resultado',
    caption: 'Compara la base del cálculo contra la parte que corresponde al impuesto.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cómo se saca el IVA de un monto que ya lo incluye?',
      a: 'Se divide el total entre uno más la tasa. Con la tasa general, un total de $1.160 dividido entre 1,16 da un subtotal de $1.000 y un IVA de $160. Restarle el 16% al total es el error más común y da un resultado menor al correcto, porque el impuesto se calculó sobre el subtotal, no sobre el total.',
    },
    {
      q: '¿Cuál es la tasa de IVA en México?',
      a: 'La tasa general es 16% en todo el país. Existe un estímulo de 8% para la región fronteriza norte y sur, que reduce la tasa a la mitad para quienes tienen domicilio o sucursal en esa franja y presentaron el aviso ante el SAT. Además hay operaciones gravadas a tasa 0% y operaciones exentas.',
    },
    {
      q: '¿Qué diferencia hay entre tasa 0% y exento?',
      a: 'Es la diferencia más importante del impuesto. Con tasa 0% no cobras IVA a tu cliente pero sí puedes acreditar todo el IVA que pagaste en tus compras, así que muchas veces te queda saldo a favor. Con un acto exento tampoco cobras, pero no puedes acreditar nada: el IVA que pagaste se te convierte en costo.',
    },
    {
      q: '¿Qué es el IVA trasladado y el acreditable?',
      a: 'El trasladado es el que le cobras a tus clientes y no te pertenece: lo estás recaudando para el fisco. El acreditable es el que pagaste a tus proveedores y que la ley te permite descontar. La declaración mensual es esencialmente esa resta, y por eso el IVA se llama un impuesto al valor agregado: solo pagas sobre lo que agregaste.',
    },
    {
      q: '¿Cuándo se causa el IVA, al facturar o al cobrar?',
      a: 'Al cobrar. El IVA en México opera con base en flujo de efectivo, así que una factura emitida y no cobrada todavía no genera impuesto a cargo, y una compra facturada y no pagada tampoco te da IVA acreditable. Por eso el complemento de pago es tan importante: es lo que documenta el momento en que el impuesto se causa.',
    },
    {
      q: '¿Qué requisitos tiene el IVA acreditable?',
      a: 'El gasto tiene que ser estrictamente indispensable para tu actividad, estar amparado con un CFDI que desglose el impuesto por separado, estar efectivamente pagado, y cuando el monto lo exige, haberse pagado por transferencia, cheque nominativo o tarjeta. Si falta cualquiera de esos requisitos, el IVA no es acreditable aunque lo hayas pagado.',
    },
    {
      q: '¿Qué hago si me queda saldo a favor?',
      a: 'Tienes tres caminos: acreditarlo contra el IVA a cargo de los meses siguientes, compensarlo en los supuestos que la ley permite, o solicitar su devolución. Acreditarlo es lo más simple y lo más común; pedir devolución es más lento pero conviene cuando el saldo a favor es estructural, como en actividades a tasa 0%.',
    },
    {
      q: '¿Por qué me retienen IVA cuando facturo?',
      a: 'Porque en ciertos supuestos la ley obliga al cliente a retener parte del impuesto y enterarlo directamente. Pasa típicamente cuando una persona física presta servicios profesionales o arrienda inmuebles a una persona moral. La retención no es un impuesto extra: es un pago anticipado que restas del IVA a cargo en tu declaración.',
    },
    {
      q: '¿Cuándo se presenta la declaración de IVA?',
      a: 'Es mensual y definitiva: se presenta a más tardar el día 17 del mes siguiente. No hay declaración anual de IVA, aunque sí existe la Declaración Informativa de Operaciones con Terceros para quienes están obligados a presentarla.',
    },
    {
      q: '¿Los alimentos y las medicinas pagan IVA?',
      a: 'Los alimentos no procesados para consumo humano y las medicinas de patente están gravados a tasa 0%, así que no encarecen por IVA pero sí permiten a quien los vende acreditar su impuesto. Ojo con las excepciones: alimentos preparados para consumo en el lugar, bebidas distintas de la leche y algunos productos con contenido calórico sí pagan la tasa general.',
    },
    {
      q: '¿Aplica el 8% de frontera solo por vivir en el norte?',
      a: 'No. El estímulo exige tener domicilio fiscal, sucursal o establecimiento en los municipios de la franja, acreditar antigüedad y presentar el aviso ante el SAT para inscribirse en el padrón. Aplicarlo sin estar inscrito genera diferencias de impuesto, actualización y recargos.',
    },
    {
      q: '¿Qué pasa si cobro IVA y no lo entero?',
      a: 'Es de las contingencias más caras del sistema, porque ese dinero nunca fue tuyo: lo recaudaste para el fisco. Además de la actualización y los recargos, la omisión reiterada de enterar impuestos retenidos o trasladados tiene consecuencias mucho más severas que un simple ajuste, por eso conviene separarlo del flujo del negocio.',
    },
  ],

  sources: [
    {
      name: 'Ley del Impuesto al Valor Agregado — tasas, acreditamiento y actos exentos (Arts. 1, 2-A, 4, 5 y 9)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/liva.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'SAT — declaración mensual de IVA',
      url: 'https://www.sat.gob.mx/declaracion/23188/declaracion-de-pago-mensual-de-iva',
      publisher: 'SAT',
    },
    {
      name: 'SAT — estímulos fiscales de la región fronteriza norte y sur',
      url: 'https://www.sat.gob.mx/consultas/61460/estimulos-fiscales-region-fronteriza',
      publisher: 'SAT',
    },
    {
      name: 'Diario Oficial de la Federación — decretos de estímulos de región fronteriza',
      url: 'https://www.dof.gob.mx/',
      publisher: 'DOF',
    },
  ],

  replaces: [
    '/calculadora-iva-mexico-16-tasa-cero-exenta-frontera',
    '/calculadora-iva-mexico-trasladado-acreditable',
    '/calculadora-iva-ieps-cigarros-bebidas-azucar-mexico',
    '/calculadora-impuestos-importacion-compras-internet-mexico',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
