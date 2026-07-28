import type { HubData } from '../types';
import { PARAGUAY_2026 } from '../../data/paraguay-2026';

/**
 * Hub de decisión PY — "¿Cuánto le pago al fisco por lo que gano?"
 *
 * Constantes desde src/lib/data/paraguay-2026.ts (Ley 6380/19). La escala del IRP
 * se serializa acá para el <script>: Infinity no sobrevive a define:vars, viaja null.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Umbral de no incidencia del IRP por servicios personales (Ley 6380/19). */
export const IRP_UMBRAL = PARAGUAY_2026.irp.noIncididoAnual;

/** Escala progresiva del IRP sobre la renta neta anual. `hasta: null` = sin techo. */
export const IRP_TRAMOS = PARAGUAY_2026.irp.tramos.map((t) => ({
  hasta: Number.isFinite(t.hasta) ? t.hasta : null,
  tasa: t.tasa,
}));

/** Rentas del capital: 8% (intereses, alquileres, ganancias de capital). */
export const IRP_CAPITAL = PARAGUAY_2026.irp.tasaRentaCapital;

/** IRE General y SIMPLE: 10% sobre la renta neta. IDU sobre dividendos. */
export const IRE = {
  general: PARAGUAY_2026.ire.general,
  simple: PARAGUAY_2026.ire.simple,
  topeSimple: PARAGUAY_2026.ire.simpleTopeIngresosAnual,
  idu: PARAGUAY_2026.idu,
  iduNoResidente: PARAGUAY_2026.iduNoResidente,
};

/** IVA: 10% general y 5% reducida (art. 90, Ley 6380/19). */
export const IVA = { general: PARAGUAY_2026.iva.general, reducida: PARAGUAY_2026.iva.reducida };

/** Aporte del trabajador independiente al IPS: 13%, con piso en un salario mínimo. */
export const IPS_INDEPENDIENTE = {
  tasa: 0.13,
  fondoJubilaciones: 0.125,
  fondoAdministracion: 0.005,
  piso: PARAGUAY_2026.salarioMinimo,
};

export const SMVM = PARAGUAY_2026.salarioMinimo;

const gs = (n: number) => 'Gs. ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'py/impuestos/cuanto-pago',
  title: 'Impuestos en Paraguay: IRP, IRE, IVA y aportes de quien trabaja por su cuenta',
  description:
    'Cuánto pagás de IRP según la escala del 8%, 9% y 10%, el umbral de no incidencia, el IRE del 10% sobre la renta empresarial, el IVA del 10% y 5%, y el aporte del 13% al IPS del trabajador independiente.',
  silo: 'Impuestos',
  siloHref: '/py/impuestos',
  locale: 'py',

  eyebrow: 'Paraguay · DNIT · Ley 6380/19',
  h1: '¿Cuánto le pagás al fisco por lo que ganás?',
  lede:
    'Paraguay tiene tasas bajas y pocas, pero la trampa está en el umbral: mucha gente cree que paga IRP y no lo debe, o factura sin saber que ya lo cruzó. Esta cuenta liquida tu caso con la escala real y te muestra qué te queda después de impuestos y aportes.',
  stamps: [
    `Umbral de no incidencia del IRP: ${gs(IRP_UMBRAL)} al año`,
    `Escala del IRP: ${(IRP_TRAMOS[0].tasa * 100).toFixed(0)}%, ${(IRP_TRAMOS[1].tasa * 100).toFixed(0)}% y ${(IRP_TRAMOS[2].tasa * 100).toFixed(0)}%`,
    `IRE ${(IRE.general * 100).toFixed(0)}% · IVA ${(IVA.general * 100).toFixed(0)}% y ${(IVA.reducida * 100).toFixed(0)}%`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Impuesto y aportes del año',

  cases: {
    title: '¿De dónde sale tu ingreso?',
    intro:
      'La tasa es distinta según el tipo de renta, y las deducciones también. Partimos del caso más consultado.',
    items: [
      {
        id: 'servicios',
        label: 'Presto servicios personales o facturo por mi cuenta',
        hint: 'IRP · servicios personales',
        answer: `Si tu ingreso bruto del año no supera ${gs(IRP_UMBRAL)}, no estás incidido por el IRP: pagás cero.`,
        yes: [
          `Umbral de no incidencia: mientras el ingreso BRUTO anual no supere ${gs(IRP_UMBRAL)}, el IRP es cero aunque tengas renta neta positiva`,
          `Superado el umbral, la escala grava la renta NETA: ${(IRP_TRAMOS[0].tasa * 100).toFixed(0)}% hasta ${gs(IRP_TRAMOS[0].hasta as number)}, ${(IRP_TRAMOS[1].tasa * 100).toFixed(0)}% hasta ${gs(IRP_TRAMOS[1].hasta as number)} y ${(IRP_TRAMOS[2].tasa * 100).toFixed(0)}% sobre el exceso`,
          'Los gastos e inversiones deducibles bajan la base, pero exigen comprobante a tu nombre',
          'La declaración es anual: no hay retención mensual sobre el ingreso como en otros países',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El umbral se mide sobre el ingreso bruto, no sobre la ganancia: podés tener poca renta neta y estar igualmente incidido',
          'Estar incidido implica inscribirte y presentar la declaración, incluso si el impuesto liquidado da cero',
          'La deducción exige respaldo documental: sin comprobante timbrado, la DNIT la rechaza',
        ],
        plazo: 'la declaración anual del IRP vence según el calendario de la DNIT por terminación de RUC.',
      },
      {
        id: 'empresa',
        label: 'Tengo una empresa o actividad comercial',
        hint: `IRE · ${(IRE.general * 100).toFixed(0)}% sobre la renta neta`,
        answer: `El IRE grava la renta neta empresarial al ${(IRE.general * 100).toFixed(0)}%, y el reparto de utilidades paga después el IDU del ${(IRE.idu * 100).toFixed(0)}%.`,
        yes: [
          `IRE Régimen General: ${(IRE.general * 100).toFixed(0)}% sobre la renta neta determinada con balance fiscal`,
          `IRE SIMPLE: misma tasa del ${(IRE.simple * 100).toFixed(0)}%, con base simplificada, para facturación anual de hasta ${gs(IRE.topeSimple)}`,
          'RESIMPLE para pequeñas empresas: cuota fija anual según el rango de ingresos, no un porcentaje',
          `IDU al ${(IRE.idu * 100).toFixed(0)}% al distribuir utilidades a residentes, y ${(IRE.iduNoResidente * 100).toFixed(0)}% al exterior`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'El IRE y el IDU se pagan en cascada: primero la empresa tributa sobre la utilidad, y después el socio sobre el dividendo que retira',
          'Con renta neta cero o negativa no se genera IRE, sin perjuicio de los anticipos y del régimen mínimo que pueda corresponder',
          'El régimen que te toca depende de la facturación: elegir mal implica recategorizar y pagar diferencias',
        ],
        plazo: 'los anticipos de IRE se pagan durante el ejercicio; el saldo, con la declaración anual.',
      },
      {
        id: 'consumidor',
        label: 'Quiero desglosar el IVA de un precio',
        hint: `IVA ${(IVA.general * 100).toFixed(0)}% y ${(IVA.reducida * 100).toFixed(0)}%`,
        answer: `La tasa general es del ${(IVA.general * 100).toFixed(0)}% y la reducida del ${(IVA.reducida * 100).toFixed(0)}% para vivienda, inmuebles, medicamentos y canasta básica.`,
        yes: [
          `Tasa general del ${(IVA.general * 100).toFixed(0)}% para la mayoría de los bienes y servicios`,
          `Tasa reducida del ${(IVA.reducida * 100).toFixed(0)}% para alquiler de vivienda, venta de inmuebles, medicamentos registrados y canasta familiar básica (art. 90, Ley 6380/19)`,
          'Para sacar el neto de un precio con IVA se divide, no se resta el porcentaje',
          'El IVA de tus compras es crédito fiscal si sos contribuyente inscripto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Restarle el 10% a un precio final NO da el neto: sobre Gs. 110.000 el IVA es Gs. 10.000, no Gs. 11.000. Hay que dividir por 1,1',
          'La tasa reducida es taxativa: no aplica por analogía a cualquier producto que parezca esencial',
        ],
        plazo: 'la declaración de IVA es mensual para la mayoría de los contribuyentes.',
      },
      {
        id: 'independiente',
        label: 'Trabajo por mi cuenta y quiero aportar al IPS',
        hint: `${(IPS_INDEPENDIENTE.tasa * 100).toFixed(0)}% de la renta declarada`,
        answer: `El aporte del independiente es el ${(IPS_INDEPENDIENTE.tasa * 100).toFixed(0)}% de la renta declarada, con piso en un salario mínimo, y cubre sólo jubilación.`,
        yes: [
          `${(IPS_INDEPENDIENTE.fondoJubilaciones * 100).toLocaleString('de-DE')}% al Fondo de Jubilaciones y Pensiones`,
          `${(IPS_INDEPENDIENTE.fondoAdministracion * 100).toLocaleString('de-DE')}% al Fondo de Administración`,
          `La base declarada no puede ser menor a un salario mínimo (${gs(IPS_INDEPENDIENTE.piso)})`,
          'Se puede pagar mensual, trimestral o anualmente',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El aporte del independiente cubre SÓLO jubilación y pensiones: no incluye el seguro de salud del IPS, a diferencia del 9% del trabajador dependiente',
          'La afiliación es voluntaria, así que nadie te la reclama: los años que no aportes simplemente no existen para tu futura jubilación',
        ],
        plazo: 'conviene no interrumpir el aporte: los períodos sin cotizar no se recuperan salvo por los mecanismos que habilite el IPS.',
      },
    ],
  },

  inputsTitle: 'Tus números del ejercicio',
  inputsIntro:
    'Todo en guaraníes y en valores anuales, salvo la renta declarada al IPS, que es mensual.',
  fields: [
    {
      id: 'ingresoBruto',
      label: 'Ingreso bruto anual (Gs.)',
      prefix: 'Gs.',
      value: '120.000.000',
      thousands: true,
      help: `Todo lo facturado o percibido en el año, sin descontar gastos. El umbral del IRP es ${gs(IRP_UMBRAL)}.`,
    },
    {
      id: 'deducibles',
      label: 'Gastos e inversiones deducibles del año (Gs.)',
      prefix: 'Gs.',
      value: '40.000.000',
      thousands: true,
      help: 'Con comprobante a tu nombre. Bajan la renta neta, que es la base de la escala.',
    },
    {
      id: 'rentaEmpresarial',
      label: 'Renta neta empresarial anual (Gs.)',
      prefix: 'Gs.',
      value: '0',
      thousands: true,
      help: `Utilidad del ejercicio según balance fiscal. Tributa IRE al ${(IRE.general * 100).toFixed(0)}%.`,
    },
    {
      id: 'dividendos',
      label: 'Utilidades que vas a distribuir (Gs.)',
      prefix: 'Gs.',
      value: '0',
      thousands: true,
      help: `Lo que se reparte a los socios: paga IDU del ${(IRE.idu * 100).toFixed(0)}% si son residentes.`,
    },
    {
      id: 'montoIva',
      label: 'Precio a desglosar con IVA incluido (Gs.)',
      prefix: 'Gs.',
      value: '1.100.000',
      thousands: true,
      help: 'Un precio final cualquiera: la cuenta te separa el neto del impuesto.',
    },
    {
      id: 'tasaIva',
      label: 'Tasa de IVA de ese precio',
      type: 'select',
      value: '10',
      options: [
        { value: '10', label: `${(IVA.general * 100).toFixed(0)}% — tasa general` },
        { value: '5', label: `${(IVA.reducida * 100).toFixed(0)}% — vivienda, inmuebles, medicamentos, canasta básica` },
      ],
      help: 'La reducida es taxativa: sólo los rubros del art. 90 de la Ley 6380/19.',
    },
    {
      id: 'rentaIps',
      label: 'Renta mensual que declarás al IPS (Gs.)',
      prefix: 'Gs.',
      value: '5.000.000',
      thousands: true,
      help: `Sólo si aportás como independiente. El piso es un salario mínimo (${gs(IPS_INDEPENDIENTE.piso)}).`,
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué pasa con lo que ganás en el año',
    caption:
      'Compara la parte del ingreso que se lleva el IRP, la que se llevan los aportes previsionales y la que efectivamente te queda.',
  },
  breakdownTitle: 'Tu liquidación, tramo por tramo',
  breakdownIntro:
    'Primero el IRP con su umbral y su escala progresiva, después el IRE y el IDU si tenés empresa, y al final el IVA y el aporte al IPS.',

  faq: [
    {
      q: '¿Desde cuánto se paga IRP en Paraguay?',
      a: `El IRP por servicios personales tiene un umbral de no incidencia: mientras el ingreso bruto anual no supere ${gs(IRP_UMBRAL)}, el impuesto es cero, aunque tu renta neta sea positiva. Superado ese piso quedás incidido y la escala se aplica sobre la renta neta, no sobre el bruto. Es la confusión más cara de todas: mucha gente calcula el 8% sobre lo que facturó y se asusta al pedo.`,
    },
    {
      q: '¿Cuáles son los tramos y las tasas del IRP?',
      a: `Tres tramos progresivos sobre la renta neta anual: ${(IRP_TRAMOS[0].tasa * 100).toFixed(0)}% hasta ${gs(IRP_TRAMOS[0].hasta as number)}, ${(IRP_TRAMOS[1].tasa * 100).toFixed(0)}% desde ahí hasta ${gs(IRP_TRAMOS[1].hasta as number)}, y ${(IRP_TRAMOS[2].tasa * 100).toFixed(0)}% sobre el exceso. Cada tasa grava sólo la porción de renta que cae dentro de su tramo, así que la tasa efectiva siempre es menor a la marginal.`,
    },
    {
      q: '¿Qué diferencia hay entre ingreso bruto y renta neta?',
      a: 'El bruto es todo lo que entró; la renta neta es lo que queda después de restar los gastos e inversiones deducibles con comprobante. El umbral de no incidencia se mide con el bruto, pero el impuesto se calcula sobre la neta. Por eso alguien puede facturar bien y pagar poco IRP, y también por eso alguien con muchos gastos puede estar igualmente obligado a declarar.',
    },
    {
      q: '¿Qué puedo deducir del IRP?',
      a: 'Gastos e inversiones vinculados a la actividad y a la vida del contribuyente y su familia, siempre con comprobante legal a tu nombre. Sin factura timbrada no hay deducción: la DNIT cruza los comprobantes electrónicos, así que la deducción "de palabra" no existe. Guardá todo el año, no juntes en diciembre.',
    },
    {
      q: '¿Cuánto se paga por intereses, alquileres o venta de inmuebles?',
      a: `Las rentas del capital tributan a una tasa única del ${(IRP_CAPITAL * 100).toFixed(0)}%, separada de la escala progresiva de servicios personales. Los dividendos van por otro carril: pagan el Impuesto a los Dividendos y Utilidades, del ${(IRE.idu * 100).toFixed(0)}% para residentes y ${(IRE.iduNoResidente * 100).toFixed(0)}% para beneficiarios del exterior.`,
    },
    {
      q: '¿Qué es el IRE y cuánto es la tasa?',
      a: `El Impuesto a la Renta Empresarial grava la renta neta de las actividades comerciales, industriales y de servicios al ${(IRE.general * 100).toFixed(0)}%. El Régimen General determina la base con balance fiscal; el SIMPLE, con base simplificada, y está disponible para facturación anual de hasta ${gs(IRE.topeSimple)}. Las empresas más chicas pueden ir al RESIMPLE, que no es un porcentaje sino una cuota fija anual según el rango de ingresos.`,
    },
    {
      q: '¿Pago IRE y también IRP por la misma plata?',
      a: `No sobre la misma base, pero sí en cascada. La empresa tributa IRE del ${(IRE.general * 100).toFixed(0)}% sobre su utilidad; cuando esa utilidad se distribuye a los socios, el reparto paga IDU del ${(IRE.idu * 100).toFixed(0)}%. Son dos hechos imponibles distintos: la ganancia de la empresa y el retiro del socio. Conviene correr la cuenta completa antes de decidir si te conviene facturar como persona o como empresa.`,
    },
    {
      q: '¿Cómo saco el IVA de un precio final?',
      a: `Dividiendo, no restando. Con la tasa general, el neto es el precio dividido 1,1 y el IVA es la diferencia. Restarle el ${(IVA.general * 100).toFixed(0)}% al total da un número más chico de lo que corresponde: sobre un precio final de Gs. 110.000 el IVA es Gs. 10.000 y el neto Gs. 100.000, pero restar el 10% daría Gs. 99.000. Es el error de cuenta más repetido en cualquier factura.`,
    },
    {
      q: '¿Qué paga IVA al 5% en vez de al 10%?',
      a: `El art. 90 de la Ley 6380/19 lista la tasa reducida del ${(IVA.reducida * 100).toFixed(0)}%: alquiler de inmuebles destinados a vivienda, venta de inmuebles como casas, departamentos y terrenos, medicamentos de uso humano registrados ante el MSPyBS y productos de la canasta familiar básica. Es una lista taxativa: no se extiende por analogía a otros productos aunque parezcan esenciales.`,
    },
    {
      q: '¿Cuánto aporta al IPS quien trabaja por su cuenta?',
      a: `El ${(IPS_INDEPENDIENTE.tasa * 100).toFixed(0)}% de la renta que declare, repartido en ${(IPS_INDEPENDIENTE.fondoJubilaciones * 100).toLocaleString('de-DE')}% al fondo jubilatorio y ${(IPS_INDEPENDIENTE.fondoAdministracion * 100).toLocaleString('de-DE')}% a administración, con la base nunca por debajo de un salario mínimo (${gs(IPS_INDEPENDIENTE.piso)}). Ojo con una diferencia central: ese aporte cubre sólo jubilación y pensiones, no el seguro de salud que sí tiene el trabajador dependiente con su 9%.`,
    },
    {
      q: '¿Tengo que declarar aunque me dé cero?',
      a: 'Si estás inscripto como contribuyente, sí: presentar la declaración y pagar son cosas distintas. La declaración en cero se presenta igual, y no hacerlo genera multas por incumplimiento formal, independientes del impuesto. Si nunca cruzaste el umbral y no estás inscripto, no hay obligación de declarar IRP por servicios personales.',
    },
    {
      q: '¿Qué diferencia hay entre tasa marginal y tasa efectiva?',
      a: `La marginal es la del tramo donde cae tu última porción de renta; la efectiva es el impuesto total dividido por tu ingreso. Con la escala del IRP, alguien con una marginal del ${(IRP_TRAMOS[2].tasa * 100).toFixed(0)}% puede tener una efectiva bastante menor, porque los primeros tramos gravaron al ${(IRP_TRAMOS[0].tasa * 100).toFixed(0)}% y al ${(IRP_TRAMOS[1].tasa * 100).toFixed(0)}%. Para comparar países o decidir si te conviene un régimen, mirá siempre la efectiva.`,
    },
  ],

  sources: [
    {
      name: 'Ley N° 6380/19 de Modernización y Simplificación del Sistema Tributario Nacional',
      url: 'https://www.bacn.gov.py/leyes-paraguayas/8993/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional',
      publisher: 'Biblioteca y Archivo Central del Congreso Nacional',
    },
    {
      name: 'DNIT — Impuesto a la Renta Personal (IRP)',
      url: 'https://www.dnit.gov.py/web/portal-institucional/irp',
      publisher: 'Dirección Nacional de Ingresos Tributarios',
    },
    {
      name: 'DNIT — Impuesto a la Renta Empresarial (IRE)',
      url: 'https://www.dnit.gov.py/web/portal-institucional/ire',
      publisher: 'Dirección Nacional de Ingresos Tributarios',
    },
    {
      name: 'DNIT — Impuesto al Valor Agregado (IVA)',
      url: 'https://www.dnit.gov.py/web/portal-institucional/iva',
      publisher: 'Dirección Nacional de Ingresos Tributarios',
    },
    {
      name: 'IPS — Régimen del trabajador independiente',
      url: 'https://portal.ips.gov.py/',
      publisher: 'Instituto de Previsión Social',
    },
  ],

  replaces: [
    '/py/irp-paraguay-tramos',
    '/py/ire-paraguay',
    '/py/calculadora-iva-paraguay',
    '/py/calculadora-aporte-ips-independiente-paraguay',
  ],

  lastReviewed: '2026-07-28',
};
