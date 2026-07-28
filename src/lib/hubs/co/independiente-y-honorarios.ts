import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "Trabajo por prestación de servicios: ¿cuánto pago de
 * seguridad social y cuánto me queda?"
 *
 * Toda constante de plata sale de src/lib/data/colombia-2026.ts. La tabla de
 * presunción de costos de la UGPP viaja acá porque no vive en la tabla maestra:
 * es la misma que usa src/lib/formulas/_mx-co-gap-engines.ts (Resolución UGPP
 * 532/2024), transcrita sin cambios para que se pueda auditar de un vistazo.
 */

const DISCLAIMER =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const SMLMV = COLOMBIA_2026.smlmv;
export const AUXILIO_TRANSPORTE = COLOMBIA_2026.auxilioTransporte;
export const TOPE_AUXILIO_SMLMV = COLOMBIA_2026.topeAuxilioSmlmv;

/** IBC del independiente: 40% del ingreso, piso 1 SMLMV, tope 25 SMLMV. */
export const IBC = {
  porcentaje: COLOMBIA_2026.independientes.ibcPorcentajeIngresos,
  pisoSmlmv: COLOMBIA_2026.aportes.ibcMinimoSmlmv,
  topeSmlmv: COLOMBIA_2026.aportes.ibcTopeSmlmv,
};

/** Tasas del independiente: asume el 100% del aporte. */
export const TASAS_IND = {
  salud: COLOMBIA_2026.independientes.salud,
  pension: COLOMBIA_2026.independientes.pension,
};

/** ARL por clase de riesgo (Decreto 1772/1994). */
export const ARL = COLOMBIA_2026.aportes.arl;

/**
 * Fondo de Solidaridad Pensional, escala sobre el IBC medido en SMLMV.
 * `Infinity` no sobrevive a `define:vars` → viaja como null.
 */
export const FSP = COLOMBIA_2026.fsp.map((t) => ({
  desde: t.desdeSmlmv,
  hasta: Number.isFinite(t.hastaSmlmv) ? t.hastaSmlmv : null,
  tasa: t.tasa,
}));

/** Tasas del empleador, para comparar nómina contra prestación de servicios. */
export const NOMINA = {
  saludEmpleado: COLOMBIA_2026.aportes.saludEmpleado,
  pensionEmpleado: COLOMBIA_2026.aportes.pensionEmpleado,
  saludEmpleador: COLOMBIA_2026.aportes.saludEmpleador,
  pensionEmpleador: COLOMBIA_2026.aportes.pensionEmpleador,
  caja: COLOMBIA_2026.aportes.parafiscales.cajaCompensacion,
  icbf: COLOMBIA_2026.aportes.parafiscales.icbf,
  sena: COLOMBIA_2026.aportes.parafiscales.sena,
  exoneracionTopeSmlmv: COLOMBIA_2026.aportes.exoneracionArt114_1SmlmvTope,
  cesantias: COLOMBIA_2026.prestaciones.cesantiasPorcentaje,
  interesesCesantias: COLOMBIA_2026.prestaciones.interesesCesantias,
  prima: COLOMBIA_2026.prestaciones.primaPorcentaje,
  vacaciones: COLOMBIA_2026.prestaciones.vacacionesPorcentaje,
};

/**
 * Presunción de costos de la UGPP por actividad económica (CIIU rev. 4).
 * Resolución UGPP 532/2024. Es el porcentaje del ingreso bruto que la ley
 * presume que se va en costos: el independiente POR CUENTA PROPIA cotiza sobre
 * el 40% del ingreso NETO de esa presunción (Decreto 0379/2026).
 * Espejo exacto de la tabla de src/lib/formulas/_mx-co-gap-engines.ts.
 */
export const PRESUNCION_UGPP = [
  { id: 'no-clasificada', label: 'Otra actividad / no clasificada', pct: 62.53 },
  { id: 'transporte', label: 'Transporte y almacenamiento (domicilios, mensajería)', pct: 63.79 },
  { id: 'profesionales', label: 'Actividades profesionales, científicas y técnicas', pct: 62.04 },
  { id: 'comercio', label: 'Comercio al por mayor y al por menor', pct: 66.97 },
  { id: 'construccion', label: 'Construcción', pct: 62.89 },
  { id: 'informacion', label: 'Información y comunicaciones', pct: 61.17 },
  { id: 'educacion', label: 'Educación', pct: 67.08 },
  { id: 'salud', label: 'Salud humana y asistencia social', pct: 63.24 },
  { id: 'administrativos', label: 'Servicios administrativos y de apoyo', pct: 59.1 },
  { id: 'alojamiento', label: 'Alojamiento y servicios de comida', pct: 61.67 },
  { id: 'manufactura', label: 'Industria manufacturera', pct: 62.34 },
  { id: 'artes', label: 'Artes, entretenimiento y recreación', pct: 56.92 },
  { id: 'inmobiliaria', label: 'Actividades inmobiliarias', pct: 61.73 },
  { id: 'finanzas', label: 'Actividades financieras y de seguros', pct: 60.65 },
  { id: 'rentista-capital', label: 'Rentista de capital', pct: 28.08 },
];

/** Presunción que aplica a domicilios y mensajería (sección H del CIIU). */
export const PRESUNCION_TRANSPORTE = 63.79;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/trabajo/independiente-y-honorarios',
  title: 'Prestación de servicios en Colombia: seguridad social y cuánto te queda',
  description:
    'Cuánto pagás de PILA como independiente y cuánto te queda limpio: IBC del 40%, salud 12,5% + pensión 16%, ARL por clase de riesgo, tope de 25 SMLMV y la presunción de costos de la UGPP. Incluye la comparación nómina vs prestación de servicios.',
  silo: 'Trabajo',
  siloHref: '/co/trabajo',
  locale: 'co',

  eyebrow: 'Colombia · PILA · independientes y contratistas',
  h1: 'Trabajo por prestación de servicios: ¿cuánto pago de seguridad social y cuánto me queda?',
  lede:
    'El honorario bruto no es tu plata. Sobre el 40% de lo que facturás cotizás salud, pensión y, según el riesgo, ARL. Esta cuenta te muestra el IBC que te toca, cuánto sale la PILA del mes y qué queda limpio en tu bolsillo, con la comparación contra un sueldo de nómina equivalente.',
  stamps: [
    'IBC: 40% del ingreso · Ley 2277/2022 art. 89',
    `Salud ${(TASAS_IND.salud * 100).toString().replace('.', ',')}% + pensión ${TASAS_IND.pension * 100}%`,
    `Tope: ${IBC.topeSmlmv} SMLMV (${cop(SMLMV * IBC.topeSmlmv)})`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Lo que te queda limpio al mes',

  cases: {
    title: '¿Cómo trabajás hoy?',
    intro:
      'La base sobre la que cotizás cambia según la figura: no es lo mismo un contrato de prestación de servicios que trabajar por cuenta propia. Empezamos por el caso más común.',
    items: [
      {
        id: 'ops',
        label: 'Contratista por prestación de servicios (OPS)',
        hint: 'IBC = 40% del valor del contrato',
        answer:
          'En prestación de servicios personales el IBC es el 40% del contrato mensualizado, sin descontar costos.',
        yes: [
          `IBC = ${IBC.porcentaje * 100}% del valor mensualizado del contrato (Ley 2277/2022 art. 89)`,
          `Salud ${(TASAS_IND.salud * 100).toString().replace('.', ',')}% y pensión ${TASAS_IND.pension * 100}% del IBC, los dos a tu cargo`,
          'ARL a cargo del contratante en la mayoría de los contratos de OPS: confirmá quién la paga antes de firmar',
          'Fondo de Solidaridad Pensional cuando el IBC llega a 4 SMLMV',
          'El contratante te retiene en la fuente por honorarios, aparte de la PILA',
        ],
        warn: [
          DISCLAIMER,
          'En prestación de servicios personales NO podés aplicar presunción de costos: el 40% va sobre el bruto',
          'Sin PILA al día el contratante no te paga la cuenta de cobro: la planilla es requisito de pago, no un trámite opcional',
          `El IBC no puede bajar de 1 SMLMV (${cop(SMLMV)}) ni pasar de ${IBC.topeSmlmv} SMLMV (${cop(SMLMV * IBC.topeSmlmv)})`,
        ],
        plazo: 'la PILA se paga mes vencido, en la fecha que fija tu dígito de NIT o cédula.',
      },
      {
        id: 'cuentapropia',
        label: 'Independiente por cuenta propia',
        hint: 'IBC = 40% del ingreso neto de la presunción de costos',
        answer:
          'Por cuenta propia sí descontás costos: el 40% se calcula sobre el ingreso ya neto de la presunción de tu actividad.',
        yes: [
          'La presunción de costos de la UGPP se resta del ingreso bruto según tu actividad CIIU (Resolución 532/2024)',
          `Sobre ese ingreso neto se aplica el ${IBC.porcentaje * 100}% para llegar al IBC (Decreto 0379/2026)`,
          'Podés usar costos reales en vez de la presunción si los tenés soportados con factura',
          'Si el ingreso neto queda por debajo de 1 SMLMV no hay obligación de cotizar como independiente',
        ],
        warn: [
          DISCLAIMER,
          'La presunción es un techo, no un derecho automático: la UGPP puede pedirte que la sustentes en una fiscalización',
          'Elegir la presunción que más te baja el IBC y no la de tu actividad real es exactamente lo que la UGPP busca en los cruces',
          'Cotizar menos hoy es pensión más baja mañana: la mesada se calcula sobre lo que cotizaste, no sobre lo que facturaste',
        ],
        plazo: 'la UGPP cruza tus ingresos con la DIAN y puede liquidarte diferencias hasta cinco años atrás.',
      },
      {
        id: 'repartidor',
        label: 'Repartidor o conductor de apps',
        hint: 'Transporte y mensajería · presunción 63,79%',
        answer:
          'Como repartidor de apps sos independiente por cuenta propia: cotizás sobre el 40% de lo que queda después de la presunción de transporte.',
        yes: [
          `Presunción de costos de transporte y almacenamiento: ${PRESUNCION_TRANSPORTE.toString().replace('.', ',')}% del ingreso bruto`,
          'La gasolina, el desgaste de la moto, el plan de datos y la depreciación son costos reales tuyos, no de la app',
          'ARL clase IV o V: la mensajería en moto es de las actividades de mayor riesgo del sistema',
          'La app no es tu empleador: no hay prestaciones, ni cesantías, ni prima',
        ],
        warn: [
          DISCLAIMER,
          'Casi siempre el IBC cae al piso de 1 SMLMV: cotizás el mínimo aunque factures bastante más',
          'Sin ARL, un accidente en la calle sale enteramente de tu bolsillo, y en moto la probabilidad no es baja',
          'Compará tu ganancia por hora contra el valor de la hora del mínimo antes de sumar turnos: el desgaste del vehículo se paga después',
        ],
        plazo: 'la ARL cubre desde el día siguiente a la afiliación: afiliarte después del accidente no sirve.',
      },
      {
        id: 'comparar',
        label: 'Nómina vs prestación de servicios',
        hint: 'Cuánto tenés que facturar para igualar un sueldo',
        answer:
          'Para igualar un sueldo de nómina tenés que facturar bastante más: pagás el aporte completo y no tenés prestaciones.',
        yes: [
          'En nómina el empleador pone pensión, ARL, caja y las prestaciones; vos sólo el 4% de salud y el 4% de pensión',
          `Como contratista pagás el ${((TASAS_IND.salud + TASAS_IND.pension) * 100).toString().replace('.', ',')}% del IBC completo`,
          'La cuenta compara tres cosas: lo que le cuesta a la empresa, lo que recibe el empleado y lo que tendrías que facturar para igualarlo',
          'Prima, cesantías, intereses y vacaciones valen alrededor de un cuarto del sueldo: en honorarios no existen',
        ],
        warn: [
          DISCLAIMER,
          'Igualar el neto del mes no es igualar el año: en honorarios no cobrás vacaciones ni los meses sin contrato',
          'Un contrato de prestación de servicios que en la práctica tiene horario, jefe y subordinación es un contrato realidad: la justicia laboral lo reconoce como nómina',
          'La comparación asume que el empleador está exonerado de salud, SENA e ICBF: para salarios de 10 SMLMV o más esa exoneración no aplica y el costo de nómina sube',
        ],
        plazo: 'el contrato realidad prescribe a los tres años del último día trabajado.',
      },
    ],
  },

  inputsTitle: 'Tus números del mes',
  inputsIntro:
    'Todo mensualizado. Si tenés un contrato por varios meses, dividí el valor total entre los meses de duración.',
  fields: [
    {
      id: 'ingreso',
      label: 'Lo que facturás al mes (COP)',
      prefix: '$',
      value: '6.000.000',
      thousands: true,
      help: 'Valor del contrato mensualizado o lo que te liquida la app, antes de descontar nada.',
    },
    {
      id: 'actividad',
      label: 'Tu actividad económica (presunción de costos UGPP)',
      type: 'select',
      value: 'profesionales',
      options: PRESUNCION_UGPP.map((a) => ({ value: a.id, label: `${a.label} — ${a.pct.toString().replace('.', ',')}%` })),
      help: 'Sólo se aplica si trabajás por cuenta propia. En prestación de servicios personales el 40% va sobre el bruto.',
    },
    {
      id: 'arl',
      label: 'Clase de riesgo para la ARL',
      type: 'select',
      value: 'ninguna',
      options: [
        { value: 'ninguna', label: 'Sin ARL (la paga el contratante o no cotizo)' },
        { value: 'I', label: 'Clase I — oficina, riesgo mínimo (0,522%)' },
        { value: 'II', label: 'Clase II — riesgo bajo (1,044%)' },
        { value: 'III', label: 'Clase III — riesgo medio (2,436%)' },
        { value: 'IV', label: 'Clase IV — riesgo alto, mensajería en moto (4,350%)' },
        { value: 'V', label: 'Clase V — riesgo máximo (6,960%)' },
      ],
      help: 'Obligatoria para riesgo IV y V. Para I a III es voluntaria si sos independiente por cuenta propia.',
    },
    {
      id: 'gastos',
      label: 'Gastos reales del mes (COP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Gasolina, desgaste, datos, herramientas, arriendo de oficina. Se restan de tu bolsillo, no del IBC.',
    },
    {
      id: 'salario',
      label: 'Sueldo de nómina con el que comparás (COP)',
      prefix: '$',
      value: '4.000.000',
      thousands: true,
      help: 'Sólo se usa en la rama de comparación: el salario básico que te ofrecerían por el mismo trabajo en planta.',
    },
    {
      id: 'meses',
      label: 'Meses del año con contrato',
      type: 'number',
      value: 10,
      min: 1,
      max: 12,
      step: 1,
      help: 'Los meses sin contrato no los paga nadie. Bajan tu ingreso anual real y suben lo que deberías cobrar por mes.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'stacked',
    title: 'A dónde va cada peso que facturás',
    caption:
      'Una sola barra partida entre lo que te queda limpio, lo que se va en salud y pensión, la ARL y el Fondo de Solidaridad, y los gastos que ponés vos. Sirve para ver de un vistazo qué porción del honorario nunca fue tuya.',
  },
  breakdownTitle: 'De la cuenta de cobro al bolsillo',
  breakdownIntro:
    'El mismo orden de la planilla PILA: ingreso, base de cotización, cada aporte y lo que sobra.',

  faq: [
    {
      q: '¿Sobre qué base cotizo si soy independiente?',
      a: `Sobre el ${IBC.porcentaje * 100}% de tu ingreso mensualizado, con dos límites: nunca menos de 1 SMLMV (${cop(SMLMV)}) ni más de ${IBC.topeSmlmv} SMLMV (${cop(SMLMV * IBC.topeSmlmv)}). Si tenés un contrato de prestación de servicios personales, ese 40% se calcula sobre el valor bruto del contrato, por el artículo 89 de la Ley 2277 de 2022. Si trabajás por cuenta propia, primero le restás los costos —presuntos o reales— y el 40% se aplica sobre el neto.`,
    },
    {
      q: '¿Cuánto pago exactamente de salud y pensión?',
      a: `El ${(TASAS_IND.salud * 100).toString().replace('.', ',')}% del IBC a salud y el ${TASAS_IND.pension * 100}% a pensión: en total el ${((TASAS_IND.salud + TASAS_IND.pension) * 100).toString().replace('.', ',')}% de la base. Como independiente asumís el aporte completo, la parte que en nómina paga el trabajador y la que paga el empleador. Sobre un ingreso de un millón, eso equivale a algo más del 11% del bruto, porque la base es sólo el 40%.`,
    },
    {
      q: '¿Qué es la presunción de costos de la UGPP y cuándo la puedo usar?',
      a: 'Es una tabla, fijada por la Resolución UGPP 532 de 2024, que dice qué porcentaje del ingreso bruto se presume que se va en costos según la actividad económica del CIIU. Va desde el 28% de un rentista de capital hasta cerca del 67% en comercio y educación. Sólo la puede usar el independiente por cuenta propia: quien tiene contrato de prestación de servicios personales cotiza sobre el bruto. Es una alternativa a demostrar costos reales con facturas, no un descuento adicional.',
    },
    {
      q: '¿Tengo que pagar ARL como contratista?',
      a: 'Depende del riesgo. Para las clases I a III es voluntaria si sos independiente por cuenta propia. Para las clases IV y V es obligatoria, y ahí caen la mensajería en moto, la construcción en altura y buena parte del trabajo de campo. En los contratos de prestación de servicios con el Estado o con empresas, la afiliación y el pago suelen quedar en cabeza del contratante para riesgos bajos: revisá la cláusula antes de firmar, porque si nadie la paga la cobertura no existe.',
    },
    {
      q: '¿Qué es el Fondo de Solidaridad Pensional y cuándo me lo cobran?',
      a: 'Es un aporte adicional que financia el subsidio a la cotización de trabajadores de bajos ingresos. Arranca cuando tu IBC llega a 4 salarios mínimos y va del 1% al 2% según el tramo, escalonado hasta los 20 SMLMV. Se paga en la misma planilla, sobre el mismo IBC. Como el IBC es apenas el 40% del ingreso, para que te lo cobren tenés que estar facturando del orden de 10 salarios mínimos al mes.',
    },
    {
      q: '¿Cuánto tengo que facturar para ganar lo mismo que en nómina?',
      a: 'Bastante más que el sueldo. En nómina el empleador pone pensión, ARL, caja de compensación, y provisiona prima, cesantías, intereses y vacaciones: en conjunto suele ser entre un 40% y un 50% por encima del salario básico. Como contratista todo eso lo ponés vos, y encima pagás el aporte completo a salud y pensión. La regla práctica es que un honorario debe estar bien por encima del sueldo equivalente para dejarte el mismo nivel de vida, y esta calculadora te da la cifra exacta con tus números.',
    },
    {
      q: '¿Qué es un contrato realidad y por qué me debería importar?',
      a: 'Es cuando un contrato firmado como prestación de servicios funciona en los hechos como una relación laboral: horario, subordinación, jefe que da órdenes, herramientas de la empresa. La ley mira la realidad, no el papel. Si se declara, el contratante debe pagar retroactivamente prestaciones, aportes y sanciones. La acción prescribe a los tres años contados desde el último día trabajado, así que el reclamo no puede esperar indefinidamente.',
    },
    {
      q: '¿Qué pasa si no pago la PILA algún mes?',
      a: 'Perdés la cobertura de salud de ese mes y, en la práctica, el contratante no te puede pagar la cuenta de cobro: la planilla es requisito de desembolso. Los aportes atrasados se pagan con intereses de mora y no borran el hueco en tu historia de semanas cotizadas. Si el contrato es con el Estado, la interventoría lo verifica antes de cada pago.',
    },
    {
      q: '¿La UGPP puede revisarme años atrás?',
      a: 'Sí. La UGPP cruza tus ingresos declarados a la DIAN con lo que cotizaste en la PILA y puede liquidar diferencias de varios años hacia atrás, con intereses y sanción. Es el frente que más plata le cuesta a los independientes que cotizaron sobre el mínimo mientras facturaban mucho más. Cotizar sobre la base correcta desde el arranque sale más barato que cualquier defensa posterior.',
    },
    {
      q: '¿Los meses sin contrato cuentan para algo?',
      a: 'Para nada bueno. No cobrás, no cotizás y esas semanas no suman a tu pensión. Por eso el honorario de los meses que sí trabajás tiene que cubrir también los que no. Si trabajás diez meses al año, tu ingreso mensual real es un sexto menor de lo que dice tu cuenta de cobro, y la calculadora lo muestra en el desglose.',
    },
    {
      q: '¿Un repartidor de apps es empleado o independiente?',
      a: 'Hoy, y hasta que una norma diga otra cosa, es independiente por cuenta propia: cotiza su propia PILA sobre el 40% del ingreso neto de la presunción de transporte y no tiene prestaciones. Eso significa que la gasolina, el desgaste de la moto y el plan de datos salen de su bolsillo antes de mirar la ganancia. La discusión sobre laboralizar el trabajo en plataformas sigue abierta en el Congreso.',
    },
    {
      q: '¿Puedo cotizar sobre el mínimo si facturo mucho más?',
      a: 'No, aunque sea lo que hace mucha gente. El IBC mínimo es un piso, no una opción: si el 40% de tu ingreso da por encima de un salario mínimo, esa es tu base. Cotizar por debajo es lo que la UGPP detecta con el cruce de la DIAN, y además te recorta la pensión futura y el monto de las incapacidades y licencias, que se liquidan sobre lo cotizado.',
    },
  ],

  sources: [
    {
      name: 'Ley 2277 de 2022, art. 89 — base de cotización de los independientes',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_2277_2022.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 100 de 1993 — sistema de seguridad social integral',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0100_1993.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Resolución UGPP 532 de 2024 — esquema de presunción de costos',
      url: 'https://www.ugpp.gov.co/normatividad',
      publisher: 'UGPP',
    },
    {
      name: 'Decreto 1772 de 1994 — tarifas de cotización al Sistema de Riesgos Laborales',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Decretos/1358400',
      publisher: 'SUIN-Juriscol',
    },
    {
      name: 'Ley 797 de 2003 — tope de 25 SMLMV para el IBC',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0797_2003.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Decreto 1469 de 2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'MinTrabajo',
      date: '29-12-2025',
    },
    {
      name: 'UGPP — determinación de la adecuada contribución al Sistema de Protección Social',
      url: 'https://www.ugpp.gov.co/',
      publisher: 'UGPP',
    },
  ],

  replaces: [
    '/co/calculadora-pila-independientes-colombia-2026',
    '/co/calculadora-ibc-independientes-contratista-colombia-2026-40-porciento',
    '/co/calculadora-presuncion-costos-ugpp-colombia-2026',
    '/co/calculadora-ganancia-repartidor-apps-colombia-2026',
    '/co/calculadora-nomina-vs-prestacion-servicios-colombia-2026',
    '/co/calculadora-fecha-limite-secop-dias-habiles',
  ],

  lastReviewed: '2026-07-28',
};

export const SMLMV_FMT = cop(SMLMV);
