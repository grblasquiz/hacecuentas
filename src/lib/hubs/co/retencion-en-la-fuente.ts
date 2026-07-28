import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánta retención en la fuente me practican (o le practico)?"
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts.
 * OJO con las bases mínimas: el Consejo de Estado suspendió los arts. 2-8 del
 * Decreto 572/2025, así que rigen las del Decreto 1625/2016. `retefuenteConceptos`
 * ya trae las vigentes; no reintroducir las del 572/2025.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** UVT del año en curso — Resolución DIAN 000238 del 15-12-2025. */
export const UVT = COLOMBIA_2026.uvt;

/**
 * Tabla mensual del art. 383 ET, en UVT. Espejo de COLOMBIA_2026.retefuenteArt383.
 * `Infinity` no sobrevive a la serialización de `define:vars` → viaja como null.
 */
export const TABLA_383 = COLOMBIA_2026.retefuenteArt383.map((t) => ({
  desde: t.desdeUvt,
  hasta: Number.isFinite(t.hastaUvt) ? t.hastaUvt : null,
  tasa: t.tasa,
  adicion: t.adicionUvt,
}));

/** Bases mínimas y tarifas por concepto — Decreto 1625/2016 (D. 572/2025 suspendido). */
export const CONCEPTOS = COLOMBIA_2026.retefuenteConceptos.map((c) => ({
  concepto: c.concepto,
  baseUvt: c.baseUvt,
  basePesos: c.basePesos,
  declarante: c.declarante,
  noDeclarante: c.noDeclarante,
}));

/** Renta exenta laboral del art. 206-10 ET: 25% con tope anual en UVT. */
export const EXENTA_LABORAL = COLOMBIA_2026.rentaExentaLaboral;

/** Límite global del art. 336/388 ET: 40% del ingreso depurado y tope de 1.340 UVT/año. */
export const LIMITE_336 = { pct: 0.4, topeUvt: 1340 };

/** Topes mensuales de las deducciones del art. 387 ET, en UVT. */
export const ART_387 = {
  dependientesPct: 0.1,
  dependientesTopeUvtMes: 32,
  viviendaTopeUvtMes: 100,
  prepagadaTopeUvtMes: 16,
};

/** Tarifa de retención sobre arrendamiento de bienes MUEBLES (art. 1.2.4.9.1 DUR 1625/2016). */
export const ARRIENDO_MUEBLES = 0.04;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
slug: 'co/impuestos/retencion-en-la-fuente',
  title: 'Retención en la fuente Colombia: cuánto te retienen o cuánto retenés',
  description:
    'Calculá la retención en la fuente en Colombia: salario por procedimiento 1 y 2 con la tabla del art. 383 ET, honorarios, servicios y compras con sus bases mínimas en UVT, y arrendamiento de inmuebles al 3,5%.',
  silo: 'Impuestos',
siloHref: '/co/impuestos',
  locale: 'co',

  eyebrow: 'Colombia · DIAN · retención en la fuente',
  h1: '¿Cuánta retención en la fuente me practican (o le practico)?',
  lede:
    'La retención no es un impuesto extra: es un anticipo del impuesto de renta que alguien te descuenta antes de pagarte. Cuánto sale depende de si el pago es un salario, un honorario, una compra o un arriendo, y de si el que cobra es declarante de renta.',
  stamps: [
    `UVT vigente: ${cop(UVT)}`,
    'Arts. 383, 386, 387 y 392 del Estatuto Tributario · Decreto 1625/2016',
    '6 calculadoras adentro',
  ],

  resultLabel: 'Retención del período',

  cases: {
    title: '¿Qué tipo de pago estás mirando?',
    intro:
      'Cada tipo de pago tiene su propia regla: los salarios pasan por una tabla progresiva y los pagos a terceros por una tarifa fija con base mínima. Partimos del caso más común.',
    items: [
      {
        id: 'empleado_p1',
        label: 'Soy empleado y me retienen por procedimiento 1',
        hint: 'Se recalcula mes a mes sobre el pago del mes',
        answer: 'Cada mes se depura tu salario y la base pasa por la tabla progresiva del art. 383.',
        yes: [
          'Aportes obligatorios a salud y pensión: salen del ingreso antes de todo',
          `Deducción por dependientes: ${(ART_387.dependientesPct * 100).toFixed(0)}% del ingreso bruto con tope de ${ART_387.dependientesTopeUvtMes} UVT al mes (art. 387 ET)`,
          `Intereses de crédito de vivienda hasta ${ART_387.viviendaTopeUvtMes} UVT/mes y medicina prepagada hasta ${ART_387.prepagadaTopeUvtMes} UVT/mes`,
          `Renta exenta del 25% de las rentas de trabajo, con tope anual de ${EXENTA_LABORAL.topeAnualUvt.toLocaleString('es-CO')} UVT (art. 206-10 ET)`,
          'La base depurada se lee en UVT y se pasa por la tabla mensual del art. 383 ET',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Deducciones y rentas exentas juntas no pueden superar el 40% del ingreso depurado ni ${LIMITE_336.topeUvt.toLocaleString('es-CO')} UVT al año (art. 336/388 ET)`,
          'La retención varía mes a mes: en el mes de la prima o de una bonificación te retienen más, y eso no significa que estén liquidando mal',
        ],
        plazo: 'todo lo que te retengan en el año se acredita contra el impuesto de tu declaración de renta.',
      },
      {
        id: 'empleado_p2',
        label: 'Soy empleado y me retienen por procedimiento 2',
        hint: 'Porcentaje fijo, se calcula en junio y en diciembre',
        answer: 'Se calcula un porcentaje fijo que se aplica igual durante los seis meses siguientes.',
        yes: [
          'La misma depuración del procedimiento 1, pero sobre el ingreso laboral promedio de los 12 meses anteriores',
          'El resultado es un porcentaje fijo: retención dividida por la base gravable',
          'Ese porcentaje se aplica a la base de cada mes del semestre, sin recalcularlo',
          'Se determina en junio para julio-diciembre, y en diciembre para enero-junio',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Suaviza los picos: si tenés ingresos muy variables te evita el mes de retención altísima, pero también te retiene en los meses flojos',
          'Cambiar de procedimiento no es libre mes a mes: el empleador lo define para el semestre completo',
          'Si tu ingreso promedio de los últimos 12 meses fue alto y ahora cobrás menos, el porcentaje fijo te va a doler: revisá que el promedio esté bien tomado',
        ],
        plazo: 'el porcentaje se recalcula en junio y en diciembre; entre medio no se mueve.',
      },
      {
        id: 'proveedor',
        label: 'Le pago a un proveedor: honorarios, servicios o compras',
        hint: 'Tarifa fija con base mínima en UVT',
        answer: 'Mirá primero si la factura supera la base mínima del concepto; si no la supera, no se retiene.',
        yes: [
          'La base es el valor de la factura antes de IVA',
          `Compras generales: base mínima de ${CONCEPTOS[0].baseUvt} UVT (${cop(CONCEPTOS[0].basePesos)}), tarifa ${(CONCEPTOS[0].declarante * 100).toLocaleString('es-CO')}% a declarante y ${(CONCEPTOS[0].noDeclarante * 100).toLocaleString('es-CO')}% a no declarante`,
          `Servicios generales: base mínima de ${CONCEPTOS[1].baseUvt} UVT (${cop(CONCEPTOS[1].basePesos)}), tarifa ${(CONCEPTOS[1].declarante * 100).toLocaleString('es-CO')}% y ${(CONCEPTOS[1].noDeclarante * 100).toLocaleString('es-CO')}%`,
          `Honorarios y comisiones: sin base mínima, tarifa ${(CONCEPTOS[2].declarante * 100).toLocaleString('es-CO')}% a persona jurídica o declarante y ${(CONCEPTOS[2].noDeclarante * 100).toLocaleString('es-CO')}% a persona natural no declarante`,
          'La retención practicada se declara y se paga a la DIAN en la declaración mensual de retenciones',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las bases mínimas que rigen son las del Decreto 1625 de 2016: el Consejo de Estado suspendió los artículos 2 a 8 del Decreto 572 de 2025, así que las bases que circularon con ese decreto no aplican',
          'Sólo retiene quien es agente de retención: no todo el que paga una factura tiene que hacerlo',
          'La retención de renta es una cosa y la retención de IVA o de ICA son otras: pueden acumularse en el mismo pago',
        ],
        plazo: 'entregale al proveedor el certificado de retención: sin él no puede acreditarla en su declaración.',
      },
      {
        id: 'arrendamiento',
        label: 'Cobro o pago el arriendo de un inmueble',
        hint: `${(CONCEPTOS[3].declarante * 100).toLocaleString('es-CO')}% con base mínima de ${CONCEPTOS[3].baseUvt} UVT`,
        answer: `Sobre el canon de un inmueble se retiene ${(CONCEPTOS[3].declarante * 100).toLocaleString('es-CO')}%, salvo que el canon no llegue a la base mínima.`,
        yes: [
          `Tarifa del ${(CONCEPTOS[3].declarante * 100).toLocaleString('es-CO')}% sobre el canon, igual para declarante y no declarante`,
          `Base mínima de ${CONCEPTOS[3].baseUvt} UVT por pago (${cop(CONCEPTOS[3].basePesos)} con la UVT vigente)`,
          `Los bienes muebles van por otra vía: ${(ARRIENDO_MUEBLES * 100).toLocaleString('es-CO')}% y sin cuantía mínima`,
          'La practica el arrendatario agente de retención, o la inmobiliaria que administra',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La retención sale del canon, no de la administración: si el contrato dice que el inquilino paga administración aparte, esa parte no hace base',
          'Para el propietario la retención es un anticipo, no un costo: se acredita en su declaración de renta',
          'Si arrendás a una persona natural que no es agente de retención, no hay retención aunque el canon sea alto',
        ],
        plazo: 'pedí el certificado anual de retenciones a la inmobiliaria o al inquilino antes de declarar.',
      },
    ],
  },

  inputsTitle: 'Los datos del pago',
  inputsIntro:
    'Para las ramas de empleado, cargá valores mensuales. Para proveedor y arriendo, el valor del pago o del canon antes de IVA.',
  fields: [
    {
      id: 'ingreso',
      label: 'Ingreso mensual, factura o canon (COP)',
      prefix: '$',
      value: '6.000.000',
      thousands: true,
      help: 'Salario bruto del mes, ingreso promedio de los últimos 12 meses, valor de la factura antes de IVA o canon mensual, según la rama.',
    },
    {
      id: 'aportes',
      label: 'Aportes obligatorios a salud y pensión del mes (COP)',
      prefix: '$',
      value: '480.000',
      thousands: true,
      help: 'Sólo aplica en las ramas de empleado. Suelen ser el 8% del salario: 4% de salud y 4% de pensión.',
    },
    {
      id: 'dependientes',
      label: '¿Tenés dependientes a cargo?',
      type: 'number',
      value: 1,
      min: 0,
      max: 1,
      step: 1,
      help: `Poné 1 si tenés al menos uno. La deducción es el ${(ART_387.dependientesPct * 100).toFixed(0)}% del ingreso con tope de ${ART_387.dependientesTopeUvtMes} UVT al mes, sin importar cuántos sean.`,
    },
    {
      id: 'otrasDed',
      label: 'Intereses de vivienda y medicina prepagada del mes (COP)',
      prefix: '$',
      value: '400.000',
      thousands: true,
      help: `Topes propios: ${ART_387.viviendaTopeUvtMes} UVT/mes de intereses de vivienda y ${ART_387.prepagadaTopeUvtMes} UVT/mes de prepagada.`,
    },
    {
      id: 'concepto',
      label: 'Concepto del pago al proveedor',
      type: 'select',
      value: 'servicios',
      options: [
        { value: 'compras', label: 'Compras generales' },
        { value: 'servicios', label: 'Servicios generales' },
        { value: 'honorarios', label: 'Honorarios y comisiones' },
      ],
      help: 'Sólo se usa en la rama de proveedor. Cada concepto tiene su base mínima y su tarifa.',
    },
    {
      id: 'declarante',
      label: '¿El que cobra es declarante de renta?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, es declarante o persona jurídica' },
        { value: 'no', label: 'No, es persona natural no declarante' },
      ],
      help: 'Cambia la tarifa en compras, servicios y honorarios. En arrendamiento de inmuebles la tarifa es la misma.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'stacked',
    title: 'Cómo se reparte el pago',
    caption:
      'Muestra qué parte del pago se va en aportes obligatorios, qué parte la ley saca del impuesto como deducción o renta exenta, cuánto queda como base gravable y cuánto se lleva la retención.',
  },
  breakdownTitle: 'La depuración paso a paso',
  breakdownIntro:
    'El mismo orden que sigue el liquidador de nómina o el que practica la retención: ingreso, lo que se resta, la base en UVT, el tramo o la tarifa, y la retención.',

  faq: [
    {
      q: '¿La retención en la fuente es un impuesto aparte?',
      a: 'No: es un anticipo del impuesto de renta. El Estado no espera a que declares una vez al año, sino que cobra a medida que te pagan. Todo lo que te retengan durante el año se acredita contra el impuesto que liquidás en tu declaración. Por eso mucha gente que declara termina sin nada a pagar o con saldo a favor: ya lo pagó mes a mes sin darse cuenta.',
    },
    {
      q: '¿Cuál es la diferencia entre el procedimiento 1 y el 2?',
      a: 'El procedimiento 1 recalcula la retención cada mes sobre el pago de ese mes: si un mes cobrás más, ese mes te retienen más. El procedimiento 2 calcula un porcentaje fijo a partir del ingreso laboral promedio de los 12 meses anteriores, y ese porcentaje se aplica igual durante los seis meses siguientes. En un año completo con ingreso estable los dos dan casi lo mismo; la diferencia se nota cuando el ingreso es irregular.',
    },
    {
      q: '¿Cuál de los dos procedimientos me conviene?',
      a: 'Si tu salario es fijo, da casi igual. Si tenés comisiones, bonos o meses muy desparejos, el procedimiento 2 suaviza el golpe: reparte la retención en lugar de concentrarla en los meses buenos. La contra es que si venís de un año fuerte y ahora cobrás menos, el porcentaje fijo se calculó sobre el promedio viejo y te va a retener de más hasta el próximo recálculo. Lo elige el empleador, y no se puede cambiar en la mitad del semestre.',
    },
    {
      q: '¿Desde qué salario empieza la retención en la fuente?',
      a: `La tabla del art. 383 ET arranca en las ${TABLA_383[1].desde} UVT mensuales de base gravable: por debajo de eso la tarifa es 0%. Con la UVT vigente eso son unos ${cop(TABLA_383[1].desde * UVT)} al mes, pero de BASE DEPURADA, no de salario. Como antes se restan los aportes obligatorios, las deducciones y el 25% exento, el salario bruto donde efectivamente empieza la retención es bastante más alto que esa cifra.`,
    },
    {
      q: '¿Cuánto puedo deducir por dependientes en la retención mensual?',
      a: `El ${(ART_387.dependientesPct * 100).toFixed(0)}% del ingreso bruto del mes, con tope de ${ART_387.dependientesTopeUvtMes} UVT mensuales (art. 387 ET). Es un monto único: no se multiplica por la cantidad de dependientes. Ojo con no confundirlo con la deducción de la declaración anual, que va por el parágrafo 5 del art. 336 y sí es por cabeza, hasta cuatro dependientes. Son dos reglas distintas para dos momentos distintos.`,
    },
    {
      q: '¿Qué pasa si la factura no llega a la base mínima?',
      a: 'No se practica retención. Las bases mínimas existen justamente para no llenar de retenciones microscópicas la contabilidad de todo el mundo. Compras generales y arrendamiento de inmuebles tienen base mínima; los honorarios y comisiones no la tienen, así que se retiene desde el primer peso. Y la base se mide por pago, no por acumulado del mes: fraccionar una factura para quedar debajo de la base es una práctica que la DIAN desconoce.',
    },
    {
      q: '¿Cambian mucho las tarifas si el proveedor no es declarante?',
      a: `Sí, y siempre para arriba en compras y servicios, porque la ley presume que quien no declara no va a poder acreditar nada después. En compras generales pasa de ${(CONCEPTOS[0].declarante * 100).toLocaleString('es-CO')}% a ${(CONCEPTOS[0].noDeclarante * 100).toLocaleString('es-CO')}% y en servicios de ${(CONCEPTOS[1].declarante * 100).toLocaleString('es-CO')}% a ${(CONCEPTOS[1].noDeclarante * 100).toLocaleString('es-CO')}%. En honorarios ocurre al revés: la persona natural no declarante va al ${(CONCEPTOS[2].noDeclarante * 100).toLocaleString('es-CO')}% y la persona jurídica al ${(CONCEPTOS[2].declarante * 100).toLocaleString('es-CO')}%. En arrendamiento de inmuebles la tarifa es la misma para los dos.`,
    },
    {
      q: '¿Las bases mínimas del Decreto 572 de 2025 están vigentes?',
      a: 'No. El Consejo de Estado suspendió provisionalmente los artículos 2 a 8 de ese decreto, así que las bases mínimas y las tarifas que rigen son las del Decreto 1625 de 2016, el decreto único reglamentario. Es un punto que confunde bastante, porque durante un tiempo circularon tablas con las bases nuevas. Si tu software de nómina o tu contador está usando las del 572, conviene revisarlo: retener de menos también genera sanción para el agente retenedor.',
    },
    {
      q: '¿La retención se calcula sobre el valor con IVA o sin IVA?',
      a: 'Sin IVA. La base de la retención en la fuente a título de renta es el valor del bien o servicio antes del impuesto sobre las ventas. El IVA tiene su propio mecanismo de retención, la retención de IVA, que es un porcentaje del IVA facturado y se declara en el mismo formulario mensual pero en un renglón distinto. Mezclarlos es uno de los errores más frecuentes al liquidar la primera factura.',
    },
    {
      q: '¿Qué pasa si me retuvieron de más durante el año?',
      a: 'Queda un saldo a favor en tu declaración de renta. Tenés dos caminos: imputarlo a la declaración del año siguiente, que es el trámite simple y no requiere autorización, o pedir la devolución o compensación ante la DIAN, que exige radicar la solicitud con los soportes dentro de los plazos que fija la entidad. Si el saldo es chico, imputarlo suele salir más barato en tiempo y en honorarios.',
    },
    {
      q: '¿Puedo pedir que no me retengan?',
      a: 'En general no, porque el agente de retención está obligado por ley y responde con su propio patrimonio si no retiene. Lo que sí podés hacer es asegurarte de que la depuración esté completa: entregarle a tu empleador o a tu cliente los soportes de dependientes, de intereses de vivienda, de medicina prepagada y de aportes voluntarios. Cada uno de esos rubros baja la base gravable y por lo tanto la retención, dentro del límite global del 40%.',
    },
    {
      q: '¿Qué pasa si el agente de retención no me da el certificado?',
      a: 'Está obligado a expedirlo, y sin él te queda difícil acreditar la retención en tu declaración. La DIAN admite otros medios de prueba cuando el certificado no aparece, pero es un camino incómodo. Lo práctico es pedirlo apenas cierra el año y, si el cliente desapareció, guardar la factura, el comprobante de egreso y el extracto donde se ve el pago neto: con eso se reconstruye la retención practicada.',
    },
  ],

  sources: [
    {
      name: 'Estatuto Tributario, art. 383 — tabla de retención en la fuente sobre rentas de trabajo',
      url: 'https://estatuto.co/383',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 386 — procedimiento 2 y porcentaje fijo de retención',
      url: 'https://estatuto.co/386',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 387 — deducciones que restan de la base de retención',
      url: 'https://estatuto.co/387',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 388 — depuración de la base y límite del 40%',
      url: 'https://estatuto.co/388',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 392 — retención por servicios, honorarios y arrendamientos',
      url: 'https://estatuto.co/392',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 206 — renta exenta del 25% de las rentas de trabajo',
      url: 'https://estatuto.co/206',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Decreto 1625 de 2016 — decreto único reglamentario en materia tributaria (bases mínimas vigentes)',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=79140',
      publisher: 'Función Pública',
    },
    {
      name: 'Resolución DIAN 000238 del 15-12-2025 — valor de la UVT',
      url: 'https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000238%20de%2015-12-2025.pdf',
      publisher: 'DIAN',
      date: '15-12-2025',
    },
    {
      name: 'DIAN — Retención en la fuente',
      url: 'https://www.dian.gov.co/impuestos/Paginas/default.aspx',
      publisher: 'DIAN',
    },
  ],

  replaces: [
    '/co/calculadora-retefuente-colombia-2026-empleado-tabla',
    '/co/calculadora-retencion-salarios-procedimiento-1-colombia-2026',
    '/co/calculadora-retencion-procedimiento-2-colombia-2026',
    '/co/calculadora-retencion-fuente-compras-servicios-2026',
    '/co/calculadora-retencion-fuente-arrendamientos-colombia-2026',
    '/co/calculadora-honorarios-prestacion-servicios-colombia-retencion',
  ],

lastReviewed: '2026-07-28',
};
