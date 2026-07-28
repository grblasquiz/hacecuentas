import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "Tengo un negocio: ¿qué impuestos me tocan?"
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts. Las tarifas que la
 * tabla maestra NO trae (tabla de tarifas del RST por grupo de actividad, art. 908 ET;
 * tarifas de ICA por municipio y actividad) quedan como CAMPO EDITABLE del usuario,
 * con su valor por defecto marcado como orientativo. Ver el reporte: la calc vieja
 * `calculadora-monotributo-colombia-pequenos-comercios` liquidaba con una tabla de
 * tarifas que no existe en la ley.
 */

/** Disclaimer YMYL — textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** UVT del año en curso — Resolución DIAN 000238 del 15-12-2025. */
export const UVT = COLOMBIA_2026.uvt;

/** Tarifas de IVA del art. 468 y ss. ET. */
export const IVA = { general: 0.19, reducida: 0.05, cero: 0 };

/** Tarifa de renta de sociedades nacionales — art. 240 ET (Ley 2277/2022). */
export const RENTA_SOCIEDADES = 0.35;

/**
 * Régimen Simple de Tributación. La tabla maestra sólo trae los topes de ingresos;
 * la tabla de tarifas por grupo de actividad (art. 908 ET) NO está en colombia-2026.ts,
 * así que la tarifa la carga el usuario y el default es orientativo.
 */
export const RST = {
  topeIngresosUvt: COLOMBIA_2026.regimenSimple.topeIngresosUvt,
  topeIngresosProfesionalesUvt: COLOMBIA_2026.regimenSimple.topeIngresosProfesionalesUvt,
  topeIngresosPesos: COLOMBIA_2026.regimenSimple.topeIngresosPesos,
};

/** Tope del art. 592 ET que también obliga a declarar renta al comerciante persona natural. */
export const TOPES_DECLARAR = COLOMBIA_2026.declaracionRenta2026;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
slug: 'co/impuestos/impuestos-de-mi-negocio',
  title: 'Impuestos de un negocio en Colombia: IVA, ICA, RST y renta',
  description:
    'Qué impuestos paga tu negocio en Colombia según cómo estés inscrito: IVA del 19% y tarifas diferenciales, la diferencia entre exento y excluido, zonas de frontera, ICA municipal por tarifa por mil, Régimen Simple de Tributación y renta de sociedades al 35%.',
  silo: 'Impuestos',
siloHref: '/co/impuestos',
  locale: 'co',

  eyebrow: 'Colombia · DIAN y hacienda municipal · negocios',
  h1: 'Tengo un negocio: ¿qué impuestos me tocan?',
  lede:
    'No hay un solo impuesto: hay tres frentes distintos que se pagan a entidades distintas. El IVA que recaudás para la DIAN, el ICA que le pagás a tu municipio y el impuesto sobre la renta o la cuota del Régimen Simple. Esta cuenta te muestra los tres juntos según cómo estés inscrito.',
  stamps: [
    `UVT vigente: ${cop(UVT)}`,
    'Arts. 420, 468, 477 y 240 del Estatuto Tributario · Ley 14/1983 (ICA)',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Carga tributaria del año',

  cases: {
    title: '¿Cómo está inscrito tu negocio?',
    intro:
      'La misma facturación paga cosas muy distintas según el régimen. Partimos del caso más frecuente: el negocio que ya es responsable de IVA.',
    items: [
      {
        id: 'responsable_iva',
        label: 'Soy responsable de IVA (régimen ordinario)',
        hint: 'Facturás con IVA y lo declarás bimestral o cuatrimestral',
        answer: 'Cobrás el IVA, le restás el de tus compras y girás la diferencia. El ICA va aparte, al municipio.',
        yes: [
          'IVA del 19% sobre las ventas gravadas (art. 468 ET), o 5% en la canasta con tarifa diferencial',
          'IVA descontable: el impuesto que pagaste en compras e insumos se resta del que cobraste',
          'ICA municipal sobre los ingresos brutos, a la tarifa por mil de tu actividad y municipio',
          'Impuesto de renta, aparte: como persona natural en la cédula general, o al 35% si sos sociedad',
          'Si el IVA descontable supera al generado, queda saldo a favor para el período siguiente',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Sólo descontás el IVA de las compras atribuibles a operaciones gravadas o exentas: el IVA de los insumos de una línea excluida es costo, no descuento',
          'Ser responsable de IVA te obliga a declarar renta siempre, sin importar cuánto factures (art. 592 ET)',
        ],
        plazo: 'la declaración de IVA es bimestral o cuatrimestral según tus ingresos del año anterior; el ICA lo fija el calendario de tu municipio.',
      },
      {
        id: 'no_responsable',
        label: 'No soy responsable de IVA',
        hint: 'Antiguo régimen simplificado · no cobrás IVA',
        answer: 'No cobrás IVA, pero tampoco descontás el que pagaste: se te queda adentro como costo.',
        yes: [
          'No facturás IVA ni presentás declaración de IVA',
          'ICA municipal: igual lo pagás, la condición de no responsable de IVA no te exime',
          'El IVA que te cobran tus proveedores es un costo más del negocio',
          'Renta: seguís sujeto a los topes del art. 592 ET como persona natural',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La condición no es voluntaria: se pierde al superar los topes de ingresos, contratos, consignaciones o establecimientos del parágrafo 3 del art. 437 ET, y hay que inscribirse desde el período siguiente',
          'Sin poder descontar el IVA de tus insumos, tu margen real es menor de lo que parece: la cuenta de abajo te lo muestra en pesos',
        ],
        plazo: 'revisá tus topes al cierre de cada año: si los pasaste, tenés que inscribirte como responsable desde el período siguiente.',
      },
      {
        id: 'rst',
        label: 'Estoy en el Régimen Simple de Tributación (RST)',
        hint: 'Una tarifa sobre ingresos brutos, con el ICA adentro',
        answer: 'Pagás un porcentaje de tus ingresos brutos que ya incluye el ICA: no lo liquidás aparte.',
        yes: [
          'Una tarifa única sobre ingresos brutos, según tu grupo de actividad y tu nivel de ingresos (art. 908 ET)',
          'El ICA consolidado va incluido en la cuota: no presentás declaración de ICA por separado',
          'Reemplaza el impuesto de renta: no liquidás renta ordinaria por el año que estuviste en el RST',
          'Anticipos bimestrales por el portal de la DIAN y declaración anual consolidada',
          'El IVA es aparte: si sos responsable de IVA seguís declarándolo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El RST reemplazó al monotributo, que fue derogado: si alguien te habla de "monotributo colombiano" está usando una figura que ya no existe',
          `El tope general para optar es de ${RST.topeIngresosUvt.toLocaleString('es-CO')} UVT de ingresos brutos al año (${cop(RST.topeIngresosPesos)} con la UVT vigente); para servicios profesionales y de consultoría el tope baja a ${RST.topeIngresosProfesionalesUvt.toLocaleString('es-CO')} UVT`,
          'La tarifa depende del grupo de actividad y del tramo de ingresos: cargala de tu RUT o de la tabla del art. 908 ET, no la adivines',
        ],
        plazo: 'la inscripción o permanencia en el RST se define hasta el último día hábil de febrero de cada año.',
      },
      {
        id: 'sociedad',
        label: 'Mi negocio es una sociedad (SAS, Ltda., S.A.)',
        hint: 'Renta al 35% sobre la utilidad fiscal',
        answer: `La sociedad paga ${(RENTA_SOCIEDADES * 100).toFixed(0)}% sobre la utilidad fiscal, más IVA e ICA como cualquier negocio.`,
        yes: [
          `Impuesto de renta del ${(RENTA_SOCIEDADES * 100).toFixed(0)}% sobre la utilidad fiscal del año (art. 240 ET)`,
          'IVA sobre las ventas gravadas y descuento del IVA de las compras',
          'ICA municipal sobre los ingresos brutos',
          'Anticipo de renta para el año siguiente y retenciones practicadas que se acreditan contra el impuesto',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La utilidad fiscal no es la utilidad contable: hay gastos que la contabilidad acepta y la norma fiscal rechaza',
          'Las entidades financieras y aseguradoras tienen puntos adicionales de tarifa, y las zonas francas tienen su propio régimen: esta cuenta usa la tarifa general',
          'Cuando la sociedad reparta utilidades, los dividendos tributan de nuevo en cabeza del socio',
        ],
        plazo: 'las sociedades declaran renta entre abril y mayo según el NIT, con una primera cuota anterior a la declaración.',
      },
    ],
  },

  inputsTitle: 'Las cifras de tu negocio',
  inputsIntro:
    'Todo en pesos colombianos y en valores anuales. Las dos tarifas del final dependen de tu municipio y de tu actividad, así que son editables: cargá las tuyas.',
  fields: [
    {
      id: 'ingresos',
      label: 'Ingresos brutos del año (COP)',
      prefix: '$',
      value: '300.000.000',
      thousands: true,
      help: 'Todo lo que facturaste, antes de IVA y sin restar costos.',
    },
    {
      id: 'pctGravado',
      label: 'Porcentaje de tus ventas gravado con IVA del 19%',
      type: 'number',
      value: 100,
      min: 0,
      max: 100,
      step: 1,
      suffix: '%',
      help: 'Si vendés canasta básica excluida o exportás, bajá este número. En 0% no generás IVA.',
    },
    {
      id: 'compras',
      label: 'Compras e insumos gravados del año, sin IVA (COP)',
      prefix: '$',
      value: '150.000.000',
      thousands: true,
      help: 'La base de lo que le comprás a proveedores que sí te facturan IVA. De acá sale el IVA descontable.',
    },
    {
      id: 'icaPorMil',
      label: 'Tarifa de ICA de tu municipio y actividad (por mil)',
      type: 'number',
      value: 8.48,
      min: 0,
      max: 20,
      step: 0.01,
      help: 'Cada municipio fija la suya por acuerdo. El valor cargado es el de comercio general en Bogotá: confirmá el tuyo con la secretaría de hacienda de tu municipio.',
    },
    {
      id: 'tarifaRst',
      label: 'Tu tarifa del Régimen Simple (%)',
      type: 'number',
      value: 3.4,
      min: 0,
      max: 15,
      step: 0.1,
      help: 'La fija el art. 908 ET según tu grupo de actividad y tu tramo de ingresos en UVT. Sacala de tu RUT: el valor cargado es sólo un ejemplo.',
    },
    {
      id: 'utilidad',
      label: 'Utilidad fiscal del año, si sos sociedad (COP)',
      prefix: '$',
      value: '60.000.000',
      thousands: true,
      help: 'Ingresos menos costos y gastos aceptados fiscalmente. Sólo se usa en la rama de sociedad.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Qué se lleva cada entidad',
    caption:
      'Compara lo que le girás a la DIAN por IVA, lo que le pagás a tu municipio por ICA, el impuesto sobre la utilidad o la cuota del Régimen Simple, y lo que queda dentro del negocio.',
  },
  breakdownTitle: 'Impuesto por impuesto, con su base y su norma',
  breakdownIntro:
    'Cada línea dice de dónde sale la base y a quién se le paga. El IVA se declara a la DIAN, el ICA a tu municipio y la renta o el RST a la DIAN.',

  faq: [
    {
      q: '¿Cuál es la diferencia entre un bien exento y uno excluido de IVA?',
      a: 'Los dos se venden sin cobrar IVA, así que en la factura se ven igual, pero el efecto en tu bolsillo es opuesto. El bien exento está gravado a tarifa 0% (art. 477 ET): como es una operación gravada, sí te da derecho a descontar el IVA que pagaste en tus compras e insumos, e incluso a pedir devolución del saldo a favor. El bien excluido (art. 424 ET) simplemente no está sujeto al impuesto: no cobrás IVA pero tampoco descontás el de tus insumos, así que ese IVA se te queda adentro como un costo más que termina en tu precio. Dos negocios con la misma facturación pueden tener márgenes muy distintos por esto solo.',
    },
    {
      q: '¿Cuándo soy responsable de IVA y cuándo no?',
      a: 'El parágrafo 3 del art. 437 ET fija las condiciones para NO ser responsable: se miden en UVT sobre los ingresos brutos del año anterior y del año en curso, el valor de los contratos individuales, las consignaciones bancarias y la cantidad de establecimientos. Si superás cualquiera de ellas, quedás obligado a inscribirte como responsable desde el período siguiente. No es una opción que elegís: es una condición que se cumple o no se cumple, y la DIAN la verifica cruzando información exógena.',
    },
    {
      q: '¿Qué tarifas de IVA hay además del 19%?',
      a: 'La tarifa general es del 19% (art. 468 ET). Hay una tarifa diferencial del 5% para un listado cerrado de bienes y servicios del art. 468-1 y 468-3 ET, una tarifa del 0% para los bienes exentos del art. 477 ET —entre ellos las exportaciones— y una lista de bienes y servicios excluidos en los arts. 424 y 476 ET, que quedan por fuera del impuesto. Lo importante es que el listado es taxativo: si tu producto no está nombrado en la norma, está gravado al 19%.',
    },
    {
      q: '¿Cómo funciona el IVA en las zonas de frontera?',
      a: 'Los departamentos de Amazonas, San Andrés, Guainía, Vaupés y Vichada y algunos municipios de frontera tienen regímenes especiales que excluyen del IVA determinadas operaciones dentro de la zona, con la idea de compensar el sobrecosto logístico y la competencia con el país vecino. El beneficio depende de la zona, del bien y de si la venta se consume dentro de la zona o sale al resto del país: una misma mercancía puede estar excluida adentro y gravada al 19% cuando cruza. No es un descuento general por estar cerca de la frontera, y conviene confirmar cada operación con la norma que la regula.',
    },
    {
      q: '¿Qué es el ICA y cómo se calcula?',
      a: 'El Impuesto de Industria y Comercio es municipal, no nacional: lo creó la Ley 14 de 1983 y cada municipio fija sus tarifas por acuerdo del concejo. Se liquida sobre los ingresos brutos del período, aplicando una tarifa expresada "por mil": una tarifa de 8 por mil sobre ingresos de cien millones da ochocientos mil pesos. Las tarifas cambian por actividad —el comercio suele pagar más que los servicios profesionales o la industria— y por municipio, así que dos negocios idénticos en ciudades distintas pagan distinto.',
    },
    {
      q: 'Si trabajo en varios municipios, ¿dónde pago el ICA?',
      a: 'En cada uno donde tengas actividad, y por los ingresos que le correspondan a cada uno. La regla es la territorialidad: no se paga todo en la ciudad donde está la oficina principal. Para comercio con establecimiento, el municipio del establecimiento; para servicios, el municipio donde se ejecuta; para industria, el municipio de la sede fabril, pero comercializando desde ahí. Repartir mal los ingresos entre municipios es una de las causas más comunes de requerimiento de las secretarías de hacienda.',
    },
    {
      q: '¿Existe el monotributo en Colombia?',
      a: 'No. El monotributo se creó en 2016, casi nadie se inscribió y fue derogado: primero lo reemplazó el Régimen Simple de Tributación con la Ley 1943 de 2018 y después la Ley 2010 de 2019 lo mantuvo. Hoy la figura vigente para el pequeño comercio es el RST, que unifica en una sola tarifa el impuesto de renta y el ICA consolidado. Si encontrás una calculadora o un contenido que liquida un "monotributo colombiano" con categorías, está calculando algo que no existe en la ley.',
    },
    {
      q: '¿Me conviene el Régimen Simple o el régimen ordinario?',
      a: 'Depende casi por completo de tu margen. El RST cobra un porcentaje de los ingresos brutos, sin importar si ganaste o perdiste; el ordinario cobra sobre la utilidad, después de restar costos y gastos. Un negocio con margen alto y pocos costos deducibles suele salir mejor en el RST; uno con margen chico y muchos costos con factura suele salir mejor en el ordinario, porque una tarifa sobre ingresos brutos puede superar toda la ganancia. La otra ventaja del RST es administrativa: menos declaraciones, ICA incluido y menos retenciones que te practiquen.',
    },
    {
      q: '¿El Régimen Simple me exime del IVA?',
      a: 'No necesariamente. El RST reemplaza el impuesto de renta e integra el ICA consolidado, pero el IVA es un impuesto aparte y sigue las reglas del art. 437 ET. Algunos contribuyentes del RST no son responsables de IVA por el tipo de actividad y su nivel de ingresos, pero muchos sí lo son y tienen que seguir declarándolo. Estar en el RST tampoco te libera de aportes a seguridad social ni de facturar electrónicamente.',
    },
    {
      q: '¿Cuánto paga de renta una SAS?',
      a: `La tarifa general de las sociedades nacionales es del ${(RENTA_SOCIEDADES * 100).toFixed(0)}% sobre la renta líquida gravable (art. 240 ET). No hay tabla progresiva como en personas naturales: es una tarifa plana. Hay puntos adicionales para entidades financieras y aseguradoras, y regímenes propios para zonas francas y algunos sectores. Ojo con la doble capa: la sociedad paga su ${(RENTA_SOCIEDADES * 100).toFixed(0)}% y, cuando reparte utilidades, el socio vuelve a tributar por los dividendos.`,
    },
    {
      q: '¿Para qué sirve el dígito de verificación del NIT?',
      a: 'Es el número que va después del guion en tu NIT y no es parte del identificador: es una cifra de control que se calcula a partir de los dígitos del NIT con una fórmula de pesos y módulo 11. Sirve para que un sistema detecte un NIT mal tipeado antes de emitir una factura o un pago. Si el dígito no corresponde, la factura electrónica se rechaza y el pago puede quedar mal imputado, así que vale la pena verificarlo cuando cargás un proveedor nuevo.',
    },
    {
      q: 'Si vendo por internet, ¿cambia algo?',
      a: 'Los impuestos son los mismos: vender por Mercado Libre, por tu propia tienda o por redes no crea ni elimina obligaciones. Lo que cambia es la visibilidad, porque las plataformas y las pasarelas de pago reportan a la DIAN y muchas te practican retención en la fuente sobre cada liquidación. Lo que sí conviene medir aparte es el costo real de vender online: la comisión de la plataforma, la comisión de la pasarela, el envío y la devolución no son impuestos, pero comen margen antes de que aparezca el IVA. Calculá tu precio sobre el neto que efectivamente recibís, no sobre el precio de vidriera.',
    },
  ],

  sources: [
    {
      name: 'Estatuto Tributario, art. 420 — hechos generadores del IVA',
      url: 'https://estatuto.co/420',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 437 — responsables del IVA y condiciones para no serlo',
      url: 'https://estatuto.co/437',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 468 — tarifa general del IVA',
      url: 'https://estatuto.co/468',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 477 — bienes exentos con derecho a devolución',
      url: 'https://estatuto.co/477',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 424 — bienes excluidos del IVA',
      url: 'https://estatuto.co/424',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 908 — tarifas del Régimen Simple de Tributación',
      url: 'https://estatuto.co/908',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Estatuto Tributario, art. 240 — tarifa del impuesto de renta para sociedades',
      url: 'https://estatuto.co/240',
      publisher: 'Estatuto Tributario Nacional',
    },
    {
      name: 'Ley 14 de 1983 — impuesto de industria y comercio',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=267',
      publisher: 'Función Pública',
    },
    {
      name: 'Ley 2010 de 2019 — Régimen Simple de Tributación (reemplaza al monotributo)',
      url: 'http://www.secretariasenado.gov.co/senado/basedoc/ley_2010_2019.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'DIAN — Régimen Simple de Tributación',
      url: 'https://www.dian.gov.co/impuestos/Regimen-Simple-de-Tributacion/Paginas/default.aspx',
      publisher: 'DIAN',
    },
  ],

  replaces: [
    '/co/calculadora-iva-colombia-19-porciento-tarifa-general',
    '/co/calculadora-iva-bienes-exentos-excluidos-colombia-2026',
    '/co/calculadora-iva-frontera-paso-fronterizo-colombia-zonas-especiales',
    '/co/calculadora-impuesto-industria-comercio-ica-colombia-municipios',
    '/co/calculadora-monotributo-colombia-pequenos-comercios',
    '/co/calculadora-impuesto-renta-empresas-colombia-35-porcentaje-2026',
    '/co/calculadora-digito-verificacion-nit-dian-colombia',
    '/co/calculadora-costo-vender-online-colombia-2026',
  ],

lastReviewed: '2026-07-28',
};
