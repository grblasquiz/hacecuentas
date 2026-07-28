import type { HubData } from '../types';
import { PERU_2026 } from '../../data/peru-2026';

/**
 * Hub de decisión PE — "Voy a formalizar mi negocio: ¿qué régimen tributario me conviene?"
 *
 * Absorbe cinco calculadoras sueltas de /pe/: NRUS, RER, RMT, Régimen General y
 * costo de constitución de empresa. La decisión no es "cuánto paga el RER", sino
 * cuál de los cuatro sale más barato con las MISMAS cifras: por eso el hub corre
 * los cuatro a la vez y los compara.
 *
 * Cálculo espejado de src/lib/formulas/rus-nuevo-regimen-unico-simplificado-peru.ts,
 * regimen-especial-renta-rer-peru.ts, regimen-mype-tributario-rmt-peru.ts,
 * impuesto-renta-empresa-regimen-general-peru.ts y costo-constitucion-empresa-peru.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const UIT = PERU_2026.uit;
export const IGV = PERU_2026.igv;

/** Nuevo RUS — categorías vigentes (DL 1270). La cuota reemplaza al IGV y a la renta. */
export const NRUS = {
  cat1: { tope: 5000, cuota: 20 },
  cat2: { tope: 8000, cuota: 50 },
  topeAnual: 96000,
};

/** Régimen Especial de Renta — 1,5% de los ingresos netos mensuales, con topes anuales. */
export const RER = {
  tasa: 0.015,
  topeIngresosAnual: 525000,
  topeComprasAnual: 525000,
  maxTrabajadores: 10,
  topeActivosFijos: 126000,
};

/** Régimen MYPE Tributario — DL 1269. 10% hasta 15 UIT de renta neta, 29,5% el exceso. */
export const RMT = {
  pagoCuenta: 0.01,
  pagoCuentaExceso: 0.015,
  topePagoCuentaUit: 300,
  tramoUit: 15,
  tasaTramo1: 0.1,
  tasaTramo2: 0.295,
  limiteIngresosUit: 1700,
};

/** Régimen General — 29,5% sobre la renta neta (Art. 55 LIR) y 5% de dividendos. */
export const GENERAL = { tasa: 0.295, pagoCuentaMin: 0.015, dividendos: 0.05 };

/**
 * Costo de constituir la empresa. Los derechos registrales son tasas oficiales de
 * Sunarp; los honorarios de abogado y notaría son precios de mercado referenciales
 * de Lima y por eso viajan como rango, no como dato duro.
 */
export const CONSTITUCION = {
  derechoCalificacion: 46,
  derechoPorMillarCapital: 3,
  derechoNombramiento: 28,
  reservaNombre: 24.6,
  actoSacsDigital: 18.7,
  minuta: { min: 150, prom: 250, max: 500 },
  escritura: { min: 200, prom: 400, max: 800 },
  libros: { min: 9.6, prom: 20, max: 32 },
};

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/impuestos/que-regimen-tributario-elijo',
  title: 'Qué régimen tributario me conviene en Perú: NRUS, RER, RMT o General comparados',
  description:
    'Compara con tus propias cifras cuánto pagas de impuestos en el Nuevo RUS, el Régimen Especial, el Régimen MYPE Tributario y el Régimen General, más el costo de constituir la empresa. La decisión completa en una sola cuenta.',
  silo: 'Impuestos',
  siloHref: '/pe/impuestos',
  locale: 'pe',

  eyebrow: 'Perú · SUNAT · formalización',
  h1: 'Voy a formalizar mi negocio: ¿qué régimen tributario me conviene?',
  lede:
    'Elegir régimen es la primera decisión tributaria de un negocio y la que más plata mueve, porque cada uno grava algo distinto: el Nuevo RUS cobra una cuota fija, el Régimen Especial grava los ingresos aunque pierdas plata, y el MYPE y el General gravan la utilidad. Con las mismas cifras, la diferencia entre el mejor y el peor puede ser de miles de soles al año. Acá corren los cuatro a la vez.',
  stamps: [
    `UIT ${PERU_2026.anio}: ${sol(UIT)}`,
    `NRUS hasta ${sol(NRUS.cat2.tope)} al mes · RER hasta ${sol(RER.topeIngresosAnual)} al año`,
    `RMT: ${RMT.tasaTramo1 * 100}% hasta ${RMT.tramoUit} UIT y ${(RMT.tasaTramo2 * 100).toString().replace('.', ',')}% el exceso`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Impuesto anual del régimen elegido',

  cases: {
    title: '¿Qué régimen estás evaluando?',
    intro:
      'Elige el que tenías en mente: la cuenta va a mostrarte igual los cuatro, en el mismo gráfico, para que veas si el que pensabas es realmente el más barato o si te conviene otro.',
    items: [
      {
        id: 'nrus',
        label: 'Nuevo RUS: bodega, puesto o negocio chico que vende al consumidor final',
        hint: `Cuota fija de ${sol(NRUS.cat1.cuota)} o ${sol(NRUS.cat2.cuota)} al mes`,
        answer: `Una cuota mensual fija que reemplaza al IGV y al Impuesto a la Renta: ${sol(NRUS.cat1.cuota)} hasta ${sol(NRUS.cat1.tope)} de ingresos o compras, y ${sol(NRUS.cat2.cuota)} hasta ${sol(NRUS.cat2.tope)}.`,
        yes: [
          `Categoría 1: ingresos y compras hasta ${sol(NRUS.cat1.tope)} al mes, cuota de ${sol(NRUS.cat1.cuota)}`,
          `Categoría 2: ingresos y compras hasta ${sol(NRUS.cat2.tope)} al mes, cuota de ${sol(NRUS.cat2.cuota)}`,
          'La categoría la define el mayor de los dos montos: si tus compras superan tus ingresos, mandan las compras',
          'No hay declaración mensual de IGV ni declaración anual de renta: solo se paga la cuota',
          'No se lleva contabilidad ni registro de compras y ventas: solo se archivan los comprobantes',
        ],
        warn: [
          DISCLAIMER_TAX,
          'No puedes emitir facturas, solo boletas de venta y tickets: si tus clientes son empresas que necesitan crédito fiscal, el NRUS te deja fuera del mercado',
          `Con ingresos o compras por encima de ${sol(NRUS.cat2.tope)} al mes, o ${sol(NRUS.topeAnual)} al año, quedas fuera del régimen y tienes que cambiar`,
          'Las personas jurídicas no pueden acogerse: es solo para personas naturales y sucesiones indivisas, y hay actividades expresamente excluidas',
        ],
        plazo: 'la cuota se paga mensualmente según el último dígito del RUC; el cambio de régimen se hace con la declaración de enero.',
      },
      {
        id: 'rer',
        label: 'Régimen Especial: negocio con márgenes altos y poco personal',
        hint: `${RER.tasa * 100}% de los ingresos netos mensuales`,
        answer: `Se paga ${RER.tasa * 100}% de los ingresos netos del mes como Impuesto a la Renta, más el IGV por separado. Es simple, pero grava la venta aunque no ganes.`,
        yes: [
          `Impuesto a la Renta de ${RER.tasa * 100}% sobre los ingresos netos mensuales, con carácter definitivo`,
          'El IGV se declara y paga aparte, con derecho a crédito fiscal de las compras',
          'Sí se pueden emitir facturas: sirve para vender a empresas',
          'No hay declaración jurada anual de renta: se cierra mes a mes con el Formulario 621',
          'Contabilidad simplificada: registro de compras y registro de ventas',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Topes duros: ingresos netos y adquisiciones anuales de hasta ${sol(RER.topeIngresosAnual)} cada uno, hasta ${RER.maxTrabajadores} trabajadores por turno y activos fijos por hasta ${sol(RER.topeActivosFijos)} sin contar predios ni vehículos`,
          'Grava los ingresos, no la utilidad: en un negocio de margen bajo, pagar 1,5% de la venta puede ser más caro que pagar 29,5% de la ganancia',
          'Hay actividades excluidas del RER, entre ellas contratos de construcción, transporte de carga pesada y actividades de asesoramiento profesional',
        ],
        plazo: 'la declaración y pago mensual siguen el cronograma de SUNAT según el último dígito del RUC.',
      },
      {
        id: 'rmt',
        label: 'Régimen MYPE Tributario: la puerta de entrada de la mayoría de las empresas',
        hint: `${RMT.tasaTramo1 * 100}% hasta ${RMT.tramoUit} UIT de utilidad`,
        answer: `El impuesto anual es del ${RMT.tasaTramo1 * 100}% sobre las primeras ${RMT.tramoUit} UIT de renta neta y ${(RMT.tasaTramo2 * 100).toString().replace('.', ',')}% sobre el exceso, con pagos a cuenta del ${RMT.pagoCuenta * 100}% mensual.`,
        yes: [
          `Impuesto anual escalonado: ${RMT.tasaTramo1 * 100}% hasta ${RMT.tramoUit} UIT de renta neta (${sol(RMT.tramoUit * UIT)}) y ${(RMT.tasaTramo2 * 100).toString().replace('.', ',')}% sobre el exceso`,
          `Pago a cuenta mensual del ${RMT.pagoCuenta * 100}% de los ingresos netos mientras los ingresos anuales no superen ${RMT.topePagoCuentaUit} UIT (${sol(RMT.topePagoCuentaUit * UIT)})`,
          `Superadas las ${RMT.topePagoCuentaUit} UIT, el pago a cuenta pasa a ${(RMT.pagoCuentaExceso * 100).toString().replace('.', ',')}% o al coeficiente del ejercicio anterior, el que resulte mayor`,
          'Grava la utilidad, no la venta: si el año fue malo, el impuesto baja',
          'Sin límite de trabajadores ni de activos fijos, y se pueden emitir todos los comprobantes',
        ],
        warn: [
          DISCLAIMER_TAX,
          `El tope para permanecer es de ${RMT.limiteIngresosUit} UIT de ingresos netos anuales (${sol(RMT.limiteIngresosUit * UIT)}): superado eso, pasas al Régimen General`,
          'Exige contabilidad completa a partir de cierto nivel de ingresos y declaración jurada anual: el costo del contador sube frente al NRUS o el RER',
          'Los pagos a cuenta son anticipos: si el año cierra con menos utilidad de la proyectada, queda saldo a favor que hay que pedir en devolución o compensar',
        ],
        plazo: 'pagos a cuenta mensuales y declaración jurada anual en marzo o abril, según el cronograma de SUNAT.',
      },
      {
        id: 'general',
        label: 'Régimen General: empresa grande, sin topes',
        hint: `${(GENERAL.tasa * 100).toString().replace('.', ',')}% sobre la renta neta`,
        answer: `El Impuesto a la Renta es del ${(GENERAL.tasa * 100).toString().replace('.', ',')}% sobre la renta neta imponible, sin el tramo reducido del ${RMT.tasaTramo1 * 100}% del MYPE.`,
        yes: [
          `Tasa plana del ${(GENERAL.tasa * 100).toString().replace('.', ',')}% sobre la renta neta imponible (Art. 55 de la Ley del Impuesto a la Renta)`,
          `Pago a cuenta mensual del ${(GENERAL.pagoCuentaMin * 100).toString().replace('.', ',')}% de los ingresos o del coeficiente del ejercicio anterior, el que resulte mayor`,
          'Sin topes de ingresos, de compras, de trabajadores ni de activos: es el régimen sin límites',
          'Permite arrastrar pérdidas tributarias de ejercicios anteriores contra utilidades futuras',
          `Si la utilidad después de impuestos se distribuye a personas naturales, se retiene ${GENERAL.dividendos * 100}% adicional por dividendos`,
        ],
        warn: [
          DISCLAIMER_TAX,
          'Contabilidad completa obligatoria y declaración jurada anual: es el régimen con mayor costo administrativo',
          `La carga combinada de empresa más socio, si se distribuye todo, llega a alrededor del ${((GENERAL.tasa + (1 - GENERAL.tasa) * GENERAL.dividendos) * 100).toFixed(1).replace('.', ',')}% de la utilidad`,
          'Estar en el General no impide bajar al MYPE si los ingresos caen por debajo del tope, pero el cambio solo se puede hacer con la declaración de enero',
        ],
        plazo: 'pagos a cuenta mensuales y declaración jurada anual dentro del cronograma de SUNAT, entre marzo y abril.',
      },
    ],
  },

  inputsTitle: 'Las cifras de tu negocio',
  inputsIntro:
    'Con estos datos se liquidan los cuatro regímenes en paralelo. El margen es lo que te queda después de costos y gastos: es el número que separa a los regímenes que gravan la venta de los que gravan la ganancia.',
  fields: [
    {
      id: 'ingresosMes',
      label: 'Ingresos del mes sin IGV (S/)',
      type: 'number',
      prefix: 'S/',
      value: 12000,
      min: 0,
      step: 500,
      help: 'Ventas netas promedio de un mes, sin contar el IGV que cobras.',
    },
    {
      id: 'comprasMes',
      label: 'Compras del mes sin IGV (S/)',
      type: 'number',
      prefix: 'S/',
      value: 7000,
      min: 0,
      step: 500,
      help: 'Compras y gastos con comprobante. Definen tu categoría en el NRUS y el crédito fiscal de IGV en los demás regímenes.',
    },
    {
      id: 'margen',
      label: 'Margen de utilidad sobre las ventas (%)',
      type: 'number',
      value: 25,
      min: 0,
      max: 100,
      step: 1,
      suffix: '%',
      help: 'Qué porcentaje de la venta te queda como utilidad después de todos los costos y gastos deducibles. Es la base del impuesto en el RMT y el General.',
    },
    {
      id: 'trabajadores',
      label: 'Trabajadores por turno',
      type: 'number',
      value: 2,
      min: 0,
      max: 200,
      step: 1,
      help: `Más de ${RER.maxTrabajadores} por turno deja al negocio fuera del Régimen Especial.`,
    },
    {
      id: 'capital',
      label: 'Capital social con el que constituyes (S/)',
      type: 'number',
      prefix: 'S/',
      value: 5000,
      min: 0,
      step: 500,
      help: `Define el derecho de inscripción de Sunarp: ${CONSTITUCION.derechoPorMillarCapital} soles por cada mil de capital o fracción.`,
    },
    {
      id: 'modalidad',
      label: '¿Cómo vas a constituir la empresa?',
      type: 'select',
      value: 'notarial',
      options: [
        { value: 'notarial', label: 'Vía notarial: SAC, EIRL o SRL con minuta y escritura' },
        { value: 'sacs', label: 'SACS 100% digital, sin notaría' },
      ],
      help: 'La vía digital ahorra la minuta y la escritura pública, que es lo que más pesa en el costo.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'bars',
    title: 'Carga tributaria anual en los cuatro regímenes',
    caption:
      'Cada barra es el total que pagarías en un año con las mismas ventas, compras y margen: en el NRUS es la cuota fija, y en los demás es el IGV neto más el Impuesto a la Renta. La más chica es tu candidata, siempre que cumplas sus requisitos.',
  },
  breakdownTitle: 'La comparación completa',
  breakdownIntro:
    'Primero el detalle del régimen que elegiste, después el total anual de los cuatro para que la decisión quede a la vista, y al final el costo de constituir la empresa.',

  faq: [
    {
      q: '¿Cuál es el régimen tributario más barato en el Perú?',
      a: `Depende de dos cosas: cuánto vendes y cuánto margen dejas. Para un negocio chico que vende al consumidor final, el Nuevo RUS es imbatible porque la cuota es fija. Para un negocio con margen alto y ventas moderadas, el Régimen Especial suele ganar, porque el ${RER.tasa * 100}% de la venta es poco frente a lo que pagaría por la utilidad. Para un negocio con margen bajo, el MYPE o el General salen mejor, porque gravan la ganancia y no la venta. Por eso la única forma de decidir es correr los cuatro con tus números.`,
    },
    {
      q: '¿Cuánto se paga en el Nuevo RUS?',
      a: `Una cuota fija mensual: ${sol(NRUS.cat1.cuota)} en la categoría 1, que cubre hasta ${sol(NRUS.cat1.tope)} de ingresos o compras al mes, y ${sol(NRUS.cat2.cuota)} en la categoría 2, hasta ${sol(NRUS.cat2.tope)}. La categoría la determina el mayor de los dos montos. Esa cuota reemplaza al IGV y al Impuesto a la Renta: no hay nada más que pagar ni que declarar.`,
    },
    {
      q: '¿Por qué el Régimen Especial puede ser una trampa?',
      a: `Porque grava los ingresos y no la utilidad. Un ${RER.tasa * 100}% de la venta parece bajísimo, pero si tu margen es del 5%, ese 1,5% de la venta equivale al 30% de tu ganancia, más que la tasa máxima del Régimen General. La regla práctica es simple: mientras tu margen supere aproximadamente el 5%, el RER conviene frente al 29,5% sobre la utilidad; por debajo de eso, no.`,
    },
    {
      q: '¿Qué diferencia hay entre el Régimen MYPE y el General?',
      a: `El MYPE tiene un tramo reducido: las primeras ${RMT.tramoUit} UIT de renta neta (${sol(RMT.tramoUit * UIT)}) pagan ${RMT.tasaTramo1 * 100}% en vez de ${(RMT.tasaTramo2 * 100).toString().replace('.', ',')}%. Ese descuento vale hasta ${sol(RMT.tramoUit * UIT * (RMT.tasaTramo2 - RMT.tasaTramo1))} al año. Además los pagos a cuenta arrancan en ${RMT.pagoCuenta * 100}% en lugar de ${(GENERAL.pagoCuentaMin * 100).toString().replace('.', ',')}%. A cambio, el MYPE tiene un tope de ${RMT.limiteIngresosUit} UIT de ingresos anuales; el General no tiene ninguno.`,
    },
    {
      q: '¿Puedo emitir facturas en el Nuevo RUS?',
      a: 'No. En el Nuevo RUS solo se emiten boletas de venta y tickets, que no dan derecho a crédito fiscal ni permiten sustentar costo o gasto para el comprador. Por eso las empresas evitan comprarle a un proveedor del NRUS. Si tus clientes son negocios y no consumidores finales, el NRUS te deja fuera por más barato que sea.',
    },
    {
      q: '¿Cuándo puedo cambiar de régimen tributario?',
      a: 'El cambio voluntario se hace una vez al año, con la declaración y pago del período de enero. La salida forzosa es distinta: si superas un tope, el cambio es obligatorio y opera desde el mes en que ocurre el hecho, sin esperar al año siguiente. Del NRUS se puede salir en cualquier mes hacia otro régimen; para volver al NRUS hay que esperar a enero.',
    },
    {
      q: '¿Cuánto cuesta constituir una empresa en el Perú?',
      a: `Por la vía notarial, entre ${sol(CONSTITUCION.derechoCalificacion + CONSTITUCION.reservaNombre + CONSTITUCION.derechoNombramiento + CONSTITUCION.minuta.min + CONSTITUCION.escritura.min + CONSTITUCION.libros.min)} y ${sol(CONSTITUCION.derechoCalificacion + CONSTITUCION.reservaNombre + CONSTITUCION.derechoNombramiento + CONSTITUCION.minuta.max + CONSTITUCION.escritura.max + CONSTITUCION.libros.max)} aproximadamente, según el capital y los honorarios que negocies. Lo que más pesa no son las tasas de Sunarp sino la minuta del abogado y la escritura notarial. Por la vía SACS 100% digital el costo baja mucho porque no hay minuta ni escritura. El RUC en SUNAT es gratuito en todos los casos.`,
    },
    {
      q: '¿El IGV cambia según el régimen?',
      a: `No, salvo en el Nuevo RUS. La tasa es ${IGV * 100}% en el RER, el MYPE y el General por igual, y en los tres se descuenta el crédito fiscal de las compras. En el Nuevo RUS no existe IGV: la cuota fija lo reemplaza, y como contrapartida tampoco hay crédito fiscal ni facturas. Por eso al comparar regímenes hay que sumar el IGV neto al Impuesto a la Renta: comparar solo la renta hace que el NRUS parezca peor de lo que es.`,
    },
    {
      q: '¿Qué pasa si supero el tope de mi régimen a mitad de año?',
      a: 'El cambio es obligatorio desde el mes en que ocurre el hecho. En el NRUS, si superas el límite de ingresos o compras, pasas al RER, al MYPE o al General desde ese mes. En el RER, si superas los ingresos, las compras, los trabajadores o los activos fijos, pasas al MYPE o al General. No declararlo genera reparos y multas, y SUNAT lo detecta cruzando los comprobantes electrónicos.',
    },
    {
      q: '¿Los pagos a cuenta son un impuesto adicional?',
      a: 'No, son anticipos del impuesto anual. Al cierre del ejercicio se calcula el impuesto sobre la renta neta real y se le restan todos los pagos a cuenta hechos durante el año: si hubo de más, queda saldo a favor para devolución o compensación; si hubo de menos, se paga la diferencia con la declaración anual. En el RER es distinto: ahí el pago mensual es definitivo y no hay regularización.',
    },
    {
      q: '¿Necesito constituir una empresa para tener RUC?',
      a: 'No. Una persona natural con negocio puede sacar RUC y acogerse al NRUS, al RER, al MYPE o al General sin constituir ninguna sociedad. Constituir una persona jurídica sirve para limitar la responsabilidad patrimonial, para incorporar socios y para dar imagen frente a clientes corporativos, pero no es requisito para formalizarse ni cambia las tasas de impuesto a la renta de tercera categoría.',
    },
    {
      q: '¿Cuánto pago si distribuyo las utilidades a los socios?',
      a: `Un ${GENERAL.dividendos * 100}% de retención definitiva sobre lo distribuido a personas naturales. Ese porcentaje se aplica sobre la utilidad que queda después del impuesto a la renta de la empresa, así que la carga combinada en el Régimen General llega a alrededor del ${((GENERAL.tasa + (1 - GENERAL.tasa) * GENERAL.dividendos) * 100).toFixed(1).replace('.', ',')}% de la utilidad. Mientras la plata quede en la empresa como resultado acumulado, no se paga esa retención.`,
    },
  ],

  sources: [
    { name: 'SUNAT — Regímenes tributarios: cuál elegir', url: 'https://emprender.sunat.gob.pe/que-beneficios-tengo', publisher: 'SUNAT' },
    { name: 'gob.pe — Nuevo Régimen Único Simplificado (NRUS)', url: 'https://www.gob.pe/6988-regimen-unico-simplificado-nuevo-rus', publisher: 'SUNAT' },
    { name: 'gob.pe — Régimen Especial de Renta (RER)', url: 'https://www.gob.pe/6989-regimen-especial-de-renta-rer', publisher: 'SUNAT' },
    { name: 'SUNAT — Régimen MYPE Tributario', url: 'https://emprender.sunat.gob.pe/ruc/regimenes-tributarios-mype/regimen-mype-tributario', publisher: 'SUNAT' },
    { name: 'SUNAT — Tasas para la determinación del Impuesto a la Renta anual', url: 'https://orientacion.sunat.gob.pe/03-tasas-para-la-determinacion-del-impuesto-la-renta-anual', publisher: 'SUNAT' },
    { name: 'Sunarp — Constitución de empresas y derechos registrales', url: 'https://www.gob.pe/institucion/sunarp/', publisher: 'Superintendencia Nacional de los Registros Públicos' },
  ],

  replaces: [
    '/pe/calculadora-rus-nuevo-regimen-unico-simplificado-peru',
    '/pe/calculadora-regimen-especial-renta-rer-peru',
    '/pe/calculadora-regimen-mype-tributario-rmt-peru',
    '/pe/calculadora-impuesto-renta-empresa-regimen-general-peru',
    '/pe/calculadora-costo-constitucion-empresa-peru',
  ],

  lastReviewed: '2026-07-28',
};
