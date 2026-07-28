import type { HubData } from '../types';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto necesito realmente para comprar esta casa?"
 *
 * Absorbe nueve calculadoras: crédito hipotecario en UF, CAE, prepago, impuesto de
 * timbres, inscripción en el Conservador, tasación, subsidio habitacional DS49/DS1,
 * impuesto al mayor valor y costo de construcción por m².
 *
 * La UF es dato VIVO (src/data/live/chile.json, mindicador.cl). Las fórmulas viejas la
 * tenían hardcodeada (cae-…:34 = 40796, costo-construccion-m2:10 = 40836): acá no.
 *
 * Diferencias deliberadas con las fórmulas originales:
 *  1. Timbres: tasa seleccionable 0,8% general / 0,2% DFL 2 / 0% vivienda social
 *     (DL 3.475). Las originales cobraban 0,8% a todos.
 *  2. Conservador: 0,2% del precio con tope real, no los tramos inventados de
 *     coste-inscripcion-…ts, que a $100M cobraban $405.000 contra los ~$200.000 reales.
 *  3. CAE: se calcula sobre el monto NETO recibido contra la cuota total real, con
 *     bisección. La original inflaba el capital con arancel y tasación antes de
 *     amortizar, lo que sube la cuota y por lo tanto el CAE.
 *  4. Prepago: los intereses "después" se recalculan amortizando de verdad, no con
 *     cuota × plazo. La original mezclaba plazo fraccionario con cuota entera.
 *  5. Mayor valor: se explicitan las condiciones del Art. 17 N°8 LIR que la original
 *     ignoraba (fecha de adquisición, plazo de tenencia, opción de tasa).
 */

/** Disclaimers YMYL — copiados textuales de src/lib/disclaimers.ts. */
export const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';
export const DISCLAIMER_CONSTRUCCION =
  'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.';

/** Indicador vivo, con el mismo fallback que usan las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

/** Impuesto de timbres sobre el mutuo hipotecario — DL 3.475. */
export const TIMBRES = { general: 0.008, dfl2: 0.002, social: 0 };

/**
 * Arancel del Conservador de Bienes Raíces: 0,2% del precio, con tope.
 * TOPE EDITABLE — lo fija cada Conservador; referencia del CBR de Santiago, julio 2026.
 */
export const CBR = { tasa: 0.002, topeClp: 264_200, fechaDato: 'julio de 2026' };

/** Exención de por vida del mayor valor y tasa del Impuesto Único y Sustitutivo — Art. 17 N°8 LIR. */
export const MAYOR_VALOR = { exencionUf: 8000, tasaIus: 0.10 };

/**
 * Subsidio habitacional: topes de vivienda y ahorro mínimo.
 * Ahorros mínimos verificados contra MINVU/ChileAtiende (30/40/80 UF para DS1).
 * ⚠️ El tope del Tramo 2 figura como 1.600 UF en la fórmula original, pero MINVU
 * publica 2.200 UF para los Tramos 2 y 3 en los llamados 2026 (2.600 UF en zonas
 * extremas). Se deja el valor MINVU y el monto de subsidio queda EDITABLE, porque
 * varía por llamado, puntaje y región.
 */
export const PROGRAMAS: Array<{
  id: string;
  nombre: string;
  capUf: number;
  ahorroMinUf: number;
  subsidioRefUf: number;
  nota: string;
}> = [
  { id: 'ds49', nombre: 'DS49 — Fondo Solidario (sin crédito)', capUf: 950, ahorroMinUf: 10, subsidioRefUf: 900, nota: 'Para el 40% más vulnerable del RSH. Financia la vivienda completa, sin crédito hipotecario.' },
  { id: 'ds1t1', nombre: 'DS1 Tramo 1 — hasta 1.100 UF', capUf: 1100, ahorroMinUf: 30, subsidioRefUf: 500, nota: 'Dentro del 60% de vulnerabilidad del RSH. 1.200 UF en zonas extremas.' },
  { id: 'ds1t2', nombre: 'DS1 Tramo 2 — hasta 2.200 UF', capUf: 2200, ahorroMinUf: 40, subsidioRefUf: 350, nota: 'Dentro del 80% de vulnerabilidad del RSH. 2.600 UF en zonas extremas.' },
  { id: 'ds1t3', nombre: 'DS1 Tramo 3 — hasta 2.200 UF', capUf: 2200, ahorroMinUf: 80, subsidioRefUf: 250, nota: 'Requiere RSH vigente. 2.600 UF en zonas extremas.' },
  { id: 'ninguno', nombre: 'Sin subsidio', capUf: 999999, ahorroMinUf: 0, subsidioRefUf: 0, nota: 'Compra con pie y crédito, sin apoyo del Estado.' },
];

/**
 * Costo directo de construcción llave en mano, UF/m² — rangos CChC/MINVU.
 * EDITABLE: son rangos de mercado que se mueven con el precio de materiales y la región.
 */
export const CONSTRUCCION: Array<{ id: string; nombre: string; ufM2: number }> = [
  { id: 'economica', nombre: 'Económica — albañilería confinada, terminaciones estándar', ufM2: 22 },
  { id: 'media', nombre: 'Media — estándar completo', ufM2: 30 },
  { id: 'premium', nombre: 'Premium — terminaciones altas', ufM2: 42 },
];

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
const uf2 = (n: number) =>
  n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'cl/hogar/comprar-casa-con-credito',
  title: 'Comprar casa en Chile: dividendo, pie y todos los costos que nadie te cuenta',
  description:
    'Calcula el dividendo en UF y el CAE real de tu crédito hipotecario, y suma los costos que descuadran el presupuesto: impuesto de timbres, notaría, Conservador de Bienes Raíces y tasación. Incluye subsidio habitacional DS49/DS1, cuánto ahorras si prepagas y qué impuesto pagas cuando la vendas.',
  silo: 'Hogar',
  siloHref: '/cl/hogar',
  locale: 'cl',

  eyebrow: 'Chile · crédito hipotecario',
  h1: '¿Cuánto necesito realmente para comprar esta casa?',
  lede:
    'El dividendo es solo una parte. El día de la escritura hay que tener el pie más el impuesto de timbres, la notaría, el Conservador y la tasación, y esos gastos se pagan en efectivo, no se financian. Pon el precio en UF y mira la cifra completa, con la UF de hoy.',
  stamps: [
    `UF de hoy: $${uf2(UF)}`,
    'DL 3.475 · Art. 17 N°8 LIR · arancel CBR',
    'Timbres 0,8% · 0,2% si es DFL 2',
    '9 calculadoras en una',
  ],

  resultLabel: 'Plata que necesitas para firmar',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos por el caso más común: primera vivienda, con pie propio y crédito hipotecario.',
    items: [
      {
        id: 'primera',
        label: 'Compro mi primera vivienda con crédito',
        hint: 'Dividendo en UF, CAE real y todos los gastos de escrituración.',
        yes: [
          'Dividendo mensual en UF y en pesos, por sistema francés',
          'CAE real: la tasa que iguala todo lo que pagas contra la plata que recibes',
          'Impuesto de timbres sobre el crédito, con la tasa que corresponda a la vivienda',
          'Notaría, inscripción en el Conservador de Bienes Raíces y tasación',
          'Seguros de desgravamen e incendio que el banco exige durante todo el crédito',
          'Cuánto necesitas tener en efectivo el día de la firma',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El CAE es lo único comparable entre bancos: la tasa a secas esconde seguros y comisiones',
          'Los gastos de escrituración se pagan en efectivo el día de la escritura y no se financian con el crédito',
          'La cuota está en UF: sube en pesos todos los meses con la inflación aunque la tasa sea fija',
          'Los bancos suelen exigir que el dividendo no supere el 25% a 30% de tu renta líquida',
        ],
        plazo:
          'entre la preaprobación y la escritura suelen pasar de 4 a 8 semanas: tasación, estudio de títulos, firma en notaría e inscripción en el Conservador.',
        answer:
          'Además del pie necesitas entre un 2% y un 4% del precio en gastos de escrituración, y esa plata tiene que estar líquida el día de la firma.',
      },
      {
        id: 'subsidio',
        label: 'Voy con subsidio habitacional DS49 o DS1',
        hint: 'Cuánto aporta el Estado, cuánto tu ahorro y cuánto crédito te falta pedir.',
        yes: [
          'Tope de valor de la vivienda del programa que elijas',
          'Ahorro mínimo exigido y si lo cumples',
          'Cuánto crédito hipotecario necesitas después del subsidio y tu ahorro',
          'Dividendo de ese crédito más chico',
          'Gastos de escrituración, que se pagan igual con subsidio',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El monto del subsidio depende del llamado, tu puntaje y la región: el que aparece acá es referencial y lo puedes editar',
          'En el Registro Social de Hogares un tramo más bajo significa mayor vulnerabilidad, y por lo tanto más acceso: el DS49 apunta al 40%, el DS1 Tramo 1 al 60% y el Tramo 2 al 80%',
          'La cuenta de ahorro para la vivienda suele exigir una antigüedad mínima de 12 meses: abrirla el mes de la postulación no sirve',
          'El DS49 financia la vivienda completa sin crédito; si te queda saldo por financiar, probablemente elegiste el programa equivocado para ese precio',
        ],
        plazo:
          'los llamados del DS1 se abren una o dos veces al año y los resultados salen unos meses después; el subsidio, una vez asignado, tiene plazo de vigencia para usarlo.',
        answer:
          'El subsidio baja el crédito peso a peso: con 500 UF de subsidio y 80 UF de ahorro, una vivienda de 1.100 UF necesita apenas 520 UF de crédito.',
      },
      {
        id: 'prepago',
        label: 'Quiero abonar a capital o prepagar',
        hint: 'Cuánto te ahorras en intereses y si conviene contra invertir esa plata.',
        yes: [
          'Cuánto bajas de intereses abonando a capital',
          'Dos caminos: acortar el plazo manteniendo la cuota, o bajar la cuota manteniendo el plazo',
          'Comparación contra el rendimiento que obtendrías invirtiendo ese mismo monto',
          'Comisión de prepago que puede cobrarte el banco',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Acortar el plazo ahorra bastante más intereses que bajar la cuota: es el mismo abono con resultados muy distintos',
          'La ley permite el prepago con una comisión máxima legal; en créditos en UF suele ser hasta un mes y medio de intereses sobre el capital prepagado',
          'Prepagar conviene si la tasa de tu crédito supera lo que obtendrías invirtiendo, después de impuestos y con riesgo comparable',
          'Antes de prepagar, revisa si no tienes deudas más caras: un crédito de consumo o una tarjeta rinden mucho más al pagarlos primero',
        ],
        plazo:
          'el prepago se pide al banco por escrito y se aplica en la siguiente facturación; pide siempre que quede claro si va a plazo o a cuota.',
        answer:
          'Abonar a capital acortando plazo es la jugada más rentable: cada peso abonado elimina todos los intereses que ese peso habría generado hasta el final.',
      },
      {
        id: 'construir',
        label: 'Voy a construir en sitio propio',
        hint: 'Costo por m² según terminación, en UF, más los gastos del permiso.',
        yes: [
          'Costo directo de la obra en UF y en pesos, por nivel de terminación',
          'Reparto orientativo entre materiales y mano de obra',
          'Crédito necesario si financias la construcción',
          'Cuánto vale el m² construido comparado con comprar hecho',
        ],
        warn: [
          DISCLAIMER_CONSTRUCCION,
          'Es costo directo de obra: no incluye permiso de edificación, aportes al espacio público, urbanización, proyecto de arquitectura ni cálculo estructural',
          'La construcción se cotiza en UF justamente porque los materiales suben: un presupuesto en pesos a 12 meses no se sostiene',
          'Los valores por m² varían fuerte por región y por acceso a la obra: en zonas aisladas el flete cambia el número',
          'Deja siempre un margen de imprevistos: entre 10% y 15% del presupuesto es lo prudente',
        ],
        plazo:
          'el permiso de edificación lo otorga la Dirección de Obras Municipales y su tramitación depende de cada municipio; sin recepción final la vivienda no se puede inscribir ni hipotecar.',
        answer:
          'Construir cuesta entre 22 y 42 UF por m² de costo directo según la terminación, sin contar el terreno ni los permisos.',
      },
      {
        id: 'vender',
        label: 'Voy a vender la que tengo',
        hint: 'Qué impuesto pagas por el mayor valor y cuánto te queda limpio.',
        yes: [
          'Mayor valor: precio de venta menos costo de adquisición reajustado, menos mejoras acreditadas',
          `Exención de por vida de ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF para personas naturales`,
          'Impuesto Único y Sustitutivo del 10% sobre lo que exceda la exención',
          'Ganancia neta después del impuesto',
        ],
        warn: [
          DISCLAIMER_TAX,
          `La exención de ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF es de por vida y por contribuyente, no por propiedad: se va consumiendo con cada venta`,
          'Aplica a personas naturales que no determinan renta efectiva; una sociedad tributa distinto y sin esta exención',
          'El régimen depende de cuándo adquiriste: los inmuebles comprados antes del 1 de enero de 2004 tienen tratamiento propio',
          'Hay plazos mínimos de tenencia: vender antes de un año de la compra, o antes de cuatro si subdividiste o construiste, deja el mayor valor fuera de este régimen',
          'El costo de adquisición se reajusta por IPC y las mejoras solo se suman si están acreditadas y declaradas al SII',
          'El 10% sustitutivo es una opción: también puedes tributar en Global Complementario, y con rentas bajas puede convenirte',
        ],
        plazo:
          'el mayor valor se declara en la Operación Renta de abril del año siguiente a la venta.',
        answer:
          `Si tu ganancia acumulada de por vida no supera las ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF, no pagas impuesto al mayor valor; sobre el exceso, el 10%.`,
      },
    ],
  },

  inputsTitle: 'Tus números',
  inputsIntro:
    'El precio va en UF, que es como se cotiza en Chile. Cada caso usa los campos que le sirven: los demás quedan sin efecto.',
  fields: [
    {
      id: 'precioUf',
      label: 'Precio de la vivienda (UF)',
      suffix: 'UF',
      type: 'number',
      value: 3000,
      min: 100,
      max: 40000,
      step: 50,
      help: `Con la UF de hoy, 3.000 UF son ${fmt(3000 * UF)}.`,
    },
    {
      id: 'piePct',
      label: 'Pie que pones',
      suffix: '%',
      type: 'number',
      value: 20,
      min: 0,
      max: 100,
      step: 1,
      help: 'Los bancos financian hasta el 80% del precio en la mayoría de los casos.',
    },
    {
      id: 'tasa',
      label: 'Tasa del crédito (% anual en UF)',
      suffix: '%',
      type: 'number',
      value: 4.4,
      min: 0.5,
      max: 12,
      step: 0.05,
      help: 'Tasa real: el crédito está en UF. Compara la vigente por banco en la CMF.',
    },
    {
      id: 'plazo',
      label: 'Plazo del crédito (años)',
      suffix: 'años',
      type: 'number',
      value: 25,
      min: 1,
      max: 30,
      step: 1,
    },
    {
      id: 'tipoVivienda',
      label: 'Tipo de vivienda (define el impuesto de timbres)',
      type: 'select',
      value: 'dfl2',
      options: [
        { value: 'dfl2', label: 'Acogida al DFL 2 (hasta 140 m²) — timbres 0,2%' },
        { value: 'general', label: 'Sin beneficio DFL 2 — timbres 0,8%' },
        { value: 'social', label: 'Vivienda social — exenta de timbres' },
      ],
      help: 'Preguntá si la propiedad está acogida al DFL 2 antes de firmar: son cientos de miles de pesos de diferencia.',
    },
    {
      id: 'comisionAnual',
      label: 'Comisión y administración anual del banco (CLP)',
      prefix: '$',
      value: '180.000',
      thousands: true,
      help: 'Entra en el CAE. Varía por banco; pídela por escrito en la hoja resumen.',
    },
    {
      id: 'programa',
      label: 'Subsidio habitacional',
      type: 'select',
      value: 'ninguno',
      options: PROGRAMAS.map((p) => ({ value: p.id, label: p.nombre })),
      help: 'Solo se usa en el caso del subsidio.',
    },
    {
      id: 'subsidioUf',
      label: 'Monto del subsidio asignado (UF)',
      suffix: 'UF',
      type: 'number',
      value: 0,
      min: 0,
      max: 2000,
      step: 5,
      help: 'Déjalo en 0 para usar el monto referencial del programa. El monto real lo fija el llamado.',
    },
    {
      id: 'ahorroUf',
      label: 'Ahorro acreditado en la cuenta para la vivienda (UF)',
      suffix: 'UF',
      type: 'number',
      value: 80,
      min: 0,
      max: 5000,
      step: 5,
    },
    {
      id: 'abonoUf',
      label: 'Abono a capital que quieres hacer (UF)',
      suffix: 'UF',
      type: 'number',
      value: 200,
      min: 0,
      max: 20000,
      step: 10,
      help: 'Solo se usa en el caso del prepago.',
    },
    {
      id: 'mesesPagados',
      label: 'Meses de crédito que ya pagaste',
      suffix: 'meses',
      type: 'number',
      value: 60,
      min: 0,
      max: 360,
      step: 1,
      help: 'Solo se usa en el caso del prepago, para saber sobre qué saldo abonas.',
    },
    {
      id: 'modoPrepago',
      label: 'Qué prefieres al prepagar',
      type: 'select',
      value: 'plazo',
      options: [
        { value: 'plazo', label: 'Acortar el plazo y mantener la cuota' },
        { value: 'cuota', label: 'Bajar la cuota y mantener el plazo' },
      ],
    },
    {
      id: 'tasaAlternativa',
      label: 'Rendimiento anual si invirtieras esa plata en vez de prepagar',
      suffix: '%',
      type: 'number',
      value: 3,
      min: 0,
      max: 20,
      step: 0.1,
      help: 'En términos reales, es decir por sobre la inflación, para que sea comparable con la tasa en UF.',
    },
    {
      id: 'metros',
      label: 'Metros cuadrados a construir',
      suffix: 'm²',
      type: 'number',
      value: 90,
      min: 10,
      max: 2000,
      step: 5,
      help: 'Solo se usa en el caso de construir en sitio propio.',
    },
    {
      id: 'calidad',
      label: 'Nivel de terminación de la obra',
      type: 'select',
      value: 'media',
      options: CONSTRUCCION.map((c) => ({ value: c.id, label: `${c.nombre} — ${c.ufM2} UF/m²` })),
    },
    {
      id: 'precioVenta',
      label: 'Precio al que venderías (CLP)',
      prefix: '$',
      value: '180.000.000',
      thousands: true,
      help: 'Solo se usa en el caso de vender.',
    },
    {
      id: 'costoCompra',
      label: 'Lo que pagaste al comprarla, reajustado por IPC (CLP)',
      prefix: '$',
      value: '110.000.000',
      thousands: true,
      help: 'El costo de adquisición se reajusta por IPC entre la compra y la venta.',
    },
    {
      id: 'mejoras',
      label: 'Mejoras acreditadas y declaradas (CLP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Solo suman si están acreditadas y declaradas al SII.',
    },
    {
      id: 'exencionUsadaUf',
      label: 'Exención de mayor valor ya usada en ventas anteriores (UF)',
      suffix: 'UF',
      type: 'number',
      value: 0,
      min: 0,
      max: 8000,
      step: 100,
      help: `El cupo de ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF es de por vida y se va consumiendo.`,
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'De qué se compone lo que necesitas',
    caption:
      'Compara el pie contra cada gasto de escrituración. Los gastos parecen chicos al lado del pie, pero se pagan en efectivo el mismo día y son los que descuadran la compra.',
  },
  breakdownTitle: 'Peso por peso',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánta plata necesito el día de la escritura además del pie?',
      a: 'Entre un 2% y un 4% del precio, y en efectivo. Se compone del impuesto de timbres sobre el crédito, la escritura ante notario, la inscripción en el Conservador de Bienes Raíces, la tasación y el estudio de títulos. En una propiedad de 3.000 UF acogida al DFL 2, eso ronda las 20 UF; sin el beneficio DFL 2, se acerca a las 40 UF porque el timbre se cuadruplica. Es el error de presupuesto más común: la gente junta el pie exacto y llega a la firma sin poder pagar los gastos.',
    },
    {
      q: '¿Qué es el CAE y por qué es más alto que la tasa?',
      a: 'La Carga Anual Equivalente es la tasa que iguala todo lo que pagas —cuota de capital e interés, seguro de desgravamen, seguro de incendio y comisiones— contra la plata que efectivamente recibes. Siempre es mayor que la tasa de interés, porque la tasa sola no incluye seguros ni comisiones. Es el único número comparable entre bancos: dos ofertas con la misma tasa pueden tener CAE muy distintos si una carga seguros más caros. Por ley te tienen que entregar el CAE en la hoja resumen antes de firmar.',
    },
    {
      q: '¿El impuesto de timbres se calcula sobre el precio o sobre el crédito?',
      a: 'Sobre el monto del crédito. El DL 3.475 grava las operaciones de crédito de dinero, no la compraventa. Por eso, si compras al contado, no pagas timbres, y por eso un pie más grande baja el impuesto. La tasa general es 0,8%, pero baja a 0,2% si la vivienda está acogida al DFL 2 —el beneficio de las viviendas económicas de hasta 140 m², que cubre a la mayoría de los departamentos nuevos— y la vivienda social está exenta.',
    },
    {
      q: '¿Cuánto cobra el Conservador de Bienes Raíces por inscribir?',
      a: 'El arancel es del orden del 0,2% del precio de la propiedad, con un tope máximo. En el Conservador de Santiago ese tope está en torno a los $264.000 a mediados de 2026, e incluye una copia de la inscripción. Eso significa que sobre unos $132 millones de precio el cobro deja de crecer: una propiedad de $300 millones paga el mismo arancel que una de $150 millones. Cada Conservador fija y reajusta su arancel, así que conviene confirmarlo con el de la comuna donde está el inmueble.',
    },
    {
      q: '¿Cuánto cuesta la tasación y quién la elige?',
      a: 'Anda entre $90.000 y $210.000 según el valor y la complejidad de la propiedad, más IVA cuando la hace una empresa o un perito independiente. Para un crédito hipotecario la elige el banco, de su nómina de tasadores acreditados, porque la tasación protege su garantía y no tu compra: si tasa por debajo del precio, el banco financia sobre el valor tasado y tú tienes que poner la diferencia. Para herencias, particiones o juicios conviene un tasador independiente acreditado.',
    },
    {
      q: '¿Conviene prepagar el crédito o invertir esa plata?',
      a: 'Depende de si tu tasa hipotecaria supera el rendimiento real que puedes obtener con riesgo comparable. Prepagar rinde exactamente la tasa de tu crédito, libre de impuestos y sin riesgo: si tu crédito está al 4,5% real en UF, prepagar equivale a una inversión garantizada al 4,5% real. Superar eso de forma consistente y segura no es fácil. Dicho eso, la liquidez tiene valor: la plata que metes al crédito no la puedes sacar, y quedarte sin fondo de emergencia para prepagar suele salir caro.',
    },
    {
      q: 'Al prepagar, ¿me conviene bajar la cuota o acortar el plazo?',
      a: 'Acortar el plazo ahorra bastante más. El mismo abono, aplicado a plazo, elimina todos los intereses de los meses finales del crédito; aplicado a cuota, solo reduce proporcionalmente el interés de cada mes restante. La diferencia entre las dos opciones puede ser del doble o más en intereses ahorrados. La única razón para bajar la cuota es de flujo: si necesitas aliviar el presupuesto mensual, ahí sí conviene. Pídelo por escrito, porque muchos bancos aplican por defecto la opción que menos te conviene.',
    },
    {
      q: '¿Cuánto subsidio habitacional me corresponde?',
      a: 'Depende del programa y del llamado. El DS49, para el 40% más vulnerable del Registro Social de Hogares, financia la vivienda completa sin crédito, con un ahorro mínimo de 10 UF. El DS1 es para sectores medios y va por tramos: el Tramo 1 exige 30 UF de ahorro para viviendas de hasta 1.100 UF, el Tramo 2 pide 40 UF y el Tramo 3, 80 UF, ambos para viviendas de hasta 2.200 UF —2.600 UF en zonas extremas—. El monto del subsidio no es fijo: lo define cada llamado según puntaje, región y composición del hogar, así que en esta página es editable.',
    },
    {
      q: 'En el Registro Social de Hogares, ¿conviene estar en un tramo alto o bajo?',
      a: 'Para acceder a subsidios, en uno bajo. El tramo es un ranking de vulnerabilidad: el 40% agrupa a los hogares de menores ingresos corregidos por composición y el 100% a los de mayores. Por eso el DS49 apunta al tramo 40%, el DS1 Tramo 1 al 60% y el Tramo 2 al 80%. Es una confusión frecuente y cara, porque hace que gente que sí califica no postule.',
    },
    {
      q: '¿Cuánto impuesto pago cuando venda la propiedad?',
      a: `Como persona natural tienes una exención de por vida de ${MAYOR_VALOR.exencionUf.toLocaleString('es-CL')} UF de mayor valor acumulado, y sobre lo que exceda puedes optar por un Impuesto Único y Sustitutivo del 10% sobre la ganancia percibida. El mayor valor es el precio de venta menos el costo de adquisición reajustado por IPC y menos las mejoras acreditadas. Ojo con las condiciones: el régimen aplica a inmuebles adquiridos desde 2004, exige plazos mínimos de tenencia —un año en general, cuatro si subdividiste o construiste— y la exención es por contribuyente, no por propiedad, así que se agota con las ventas sucesivas.`,
    },
    {
      q: '¿Cuánto cuesta construir por metro cuadrado en Chile?',
      a: 'El costo directo de obra llave en mano va aproximadamente de 22 UF/m² en terminación económica a 42 UF/m² en premium, con la terminación media en torno a 30 UF/m². Se cotiza en UF justamente porque los materiales suben y un presupuesto en pesos no aguanta doce meses. Ese número no incluye el terreno, el permiso de edificación, los aportes al espacio público, la urbanización ni los proyectos de arquitectura y cálculo, que pueden sumar bastante. Deja siempre entre 10% y 15% de imprevistos.',
    },
    {
      q: '¿Por qué el dividendo sube si la tasa es fija?',
      a: 'Porque el crédito está pactado en UF y se paga en pesos al valor del día. La tasa fija significa que la tasa real no cambia, pero la UF se reajusta con el IPC del mes anterior, así que tu dividendo en pesos sube más o menos con la inflación. Es el diseño del sistema chileno: al aislar el crédito de la inflación, permite tasas nominales mucho más bajas y plazos de 25 o 30 años que en moneda nominal serían impagables.',
    },
    {
      q: '¿Cuánto tengo que ganar para que me aprueben el crédito?',
      a: 'La regla habitual de los bancos es que el dividendo no supere entre el 25% y el 30% de tu renta líquida, y que la suma de todas tus deudas no pase de cerca del 40%. Con un dividendo de $700.000 eso implica una renta líquida del orden de $2,3 a $2,8 millones. Además miran la estabilidad laboral, la antigüedad, el comportamiento de pago y el nivel de endeudamiento vigente: cerrar tarjetas y líneas de crédito no usadas antes de postular suele mejorar la evaluación.',
    },
  ],

  sources: [
    {
      name: 'CMF — tasas de interés de créditos para vivienda por institución',
      url: 'https://www.cmfchile.cl/portal/estadisticas/617/w3-propertyvalue-30538.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'CMF Educa — qué es la Carga Anual Equivalente (CAE)',
      url: 'https://www.cmfeduca.cl/educa/ALFABETIZACION/creditos/cae.html',
      publisher: 'Comisión para el Mercado Financiero',
    },
    {
      name: 'SII — Impuesto de Timbres y Estampillas (DL 3.475)',
      url: 'https://www.sii.cl/valores_y_fechas/timbres_estampillas/timbres2026.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'SII — mayor valor en la enajenación de bienes raíces, Art. 17 N°8 LIR',
      url: 'https://www.sii.cl/preguntas_frecuentes/renta/001_002_5290.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Conservador de Bienes Raíces de Santiago — arancel de inscripción de propiedad',
      url: 'https://conservador.cl/portal/inscripcion_propiedad',
      publisher: 'Conservador de Bienes Raíces de Santiago',
    },
    {
      name: 'MINVU — Subsidio DS1 para sectores medios, tramos y ahorro mínimo',
      url: 'https://www.minvu.gob.cl/beneficio/vivienda/subsidio-habitacional-para-comprar-una-vivienda-de-hasta-2200-uf-ds1/',
      publisher: 'Ministerio de Vivienda y Urbanismo',
    },
    {
      name: 'ChileAtiende — DS49 Fondo Solidario de Elección de Vivienda',
      url: 'https://www.chileatiende.gob.cl/fichas/3346-fondo-solidario-de-eleccion-de-vivienda-ds-49',
      publisher: 'ChileAtiende',
    },
    {
      name: 'ChileAtiende — Inscripción de una propiedad en el Conservador',
      url: 'https://www.chileatiende.gob.cl/fichas/12116-inscripcion-de-una-propiedad',
      publisher: 'ChileAtiende',
    },
    {
      name: 'Cámara Chilena de la Construcción — índices y costos de edificación',
      url: 'https://cchc.cl/',
      publisher: 'Cámara Chilena de la Construcción',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://www.bcentral.cl/web/banco-central/areas/estadisticas/indicadores-diarios',
      publisher: 'Banco Central de Chile',
    },
  ],

  replaces: [
    '/calculadora-credito-hipotecario-chile-uf-cmf-2026',
    '/calculadora-cae-credito-hipotecario-chile-bancos-2026',
    '/calculadora-pago-anticipado-credito-hipotecario-chile-ahorro-uf',
    '/calculadora-impuesto-timbres-estampillas-chile-credito-hipotecario',
    '/calculadora-coste-inscripcion-conservador-bienes-raices-chile',
    '/calculadora-tasacion-vivienda-chile-dictuc-perito-precio',
    '/calculadora-subsidio-habitacional-chile-ds49-ds1-clase-media',
    '/calculadora-impuesto-mayor-valor-venta-propiedad-chile-8000-uf',
    '/calculadora-costo-construccion-m2-chile',
  ],

  lastReviewed: '2026-07-28',
};
