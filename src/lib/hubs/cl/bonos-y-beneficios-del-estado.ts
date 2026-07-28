import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Qué bonos y beneficios del Estado me corresponden y de cuánto son?"
 *
 * Absorbe seis calculadoras de beneficios sociales más una de edad para votar que sólo se
 * absorbe por URL.
 *
 * ─── Por qué este hub NO copia las tablas viejas ─────────────────────────────────────────
 * `asignacion-familiar-chile-2026-tramos-renta.ts:20-49` traía una tabla de asignación
 * familiar que estaba mal en las tres dimensiones a la vez:
 *   · los montos por carga estaban INVERTIDOS (subían con la renta: $10.800 el tramo más pobre
 *     y $48.500 el más rico), al punto que el propio texto del insight decía lo contrario
 *     ("a menor renta más alta la asignación");
 *   · inventaba un cuarto tramo pagador (D, $48.500) que no existe: el cuarto tramo es
 *     justamente el que NO cobra;
 *   · los cortes de renta no coincidían con ninguno vigente.
 * Los valores reales (IPS / ChileAtiende) van abajo en ASIGNACION_FAMILIAR.
 *
 * `asignacion-familiar-pareja-no-casados-chile-derechos.ts:30-33` construía la asignación a
 * partir de `UTM_2026 = 66500` y `UF_2026 = 36500` hardcodeadas (ambas desactualizadas), y de
 * ahí sacaba un "tope de ingreso" de 2,75 UTM (~$183.000) y un monto por hijo de 0,75 UTM
 * (~$49.875) que no existen en la ley. Acá la UTM es dato vivo y la asignación sale de la
 * tabla oficial, no de múltiplos inventados de la UTM.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'legal'). */
export const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

/** Indicadores vivos. */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;

export const IMM = CHILE_2026.imm;

/**
 * Asignación familiar — tramos y montos por carga vigentes.
 * Fuente: ChileAtiende ficha 25878 (IPS) / Dirección del Trabajo.
 * Los montos BAJAN a medida que sube la renta, y el cuarto tramo no paga.
 * Se reajustan junto con el ingreso mínimo mensual, así que caducan: van como dato con fecha.
 */
export const ASIGNACION_FAMILIAR = {
  fechaDato: '2026-05-01',
  tramos: [
    { id: 'A', hasta: 649_039, porCarga: 22_601, desc: 'Renta más baja' },
    { id: 'B', hasta: 947_990, porCarga: 13_870, desc: 'Renta media-baja' },
    { id: 'C', hasta: 1_478_539, porCarga: 4_382, desc: 'Renta media-alta' },
    { id: 'D', hasta: null as number | null, porCarga: 0, desc: 'Sin derecho a pago' },
  ],
  /** La asignación por invalidez del causante se paga al doble. */
  factorInvalidez: 2,
  /** Tope de cargas que reconoce el cálculo (mismo que usaba la fórmula original). */
  topeCargas: 24,
} as const;

/**
 * Bonos de temporada — montos oficiales con su ficha de ChileAtiende.
 * Se reajustan cada año, así que llevan fecha de dato y advertencia.
 * Espejo de src/lib/formulas/bono-marzo-bono-invierno-chile-cuantia-requisitos.ts, que sí
 * traía estos valores verificados contra la fuente oficial.
 */
export const BONOS = {
  fechaDato: '2026-01-01',
  /** Aporte Familiar Permanente (ex Bono Marzo) — ficha 38913. Por carga/causante. */
  aporteFamiliarPermanente: 66_834,
  /** Bono de Invierno — ficha 39484. Pago único a pensionados de 65+. */
  invierno: 81_257,
  /** Tope de pensión para acceder al Bono de Invierno. */
  inviernoTopePension: 231_440,
  /** Bono Logro Escolar — ficha 20063. Tramo 1 = 15% superior de la promoción. */
  logroTramo1: 85_057,
  /** Bono Logro Escolar — Tramo 2 = entre el 15% y el 30% de mejor rendimiento. */
  logroTramo2: 51_036,
} as const;

/**
 * Becas JUNAEB — montos ANUALES oficiales (ChileAtiende fichas 2086, 2089 y 4598).
 * OJO: la fórmula vieja los trataba como montos MENSUALES por 10 meses y con cifras
 * inventadas, lo que sobreestimaba las becas entre 2 y 16 veces. Ver el comentario del hub.
 * La Beca Presidente de la República se expresa en UTM, así que se calcula con la UTM viva.
 */
export const BECAS_JUNAEB = {
  fechaDato: '2026-01-01',
  /** Beca Presidente de la República — en UTM al año, hasta 10 cuotas. Ficha 2086. */
  presidenteUtmMedia: 6.2,
  presidenteUtmSuperior: 12.4,
  /** Beca Indígena — montos anuales en pesos por nivel. Ficha 2089. */
  indigenaBasica: 100_550,
  indigenaMedia: 208_280,
  indigenaSuperior: 654_600,
  /** Beca Práctica Técnico Profesional — pago único de libre disposición. Ficha 4598. */
  practicaTecnica: 65_000,
} as const;

/**
 * Cortes REFERENCIALES de ingreso per cápita → tramo del Registro Social de Hogares.
 * Espejo EXACTO de CORTES en src/lib/formulas/tramo-registro-social-hogares-rsh-chile.ts.
 * NO son cifras oficiales: el RSH ordena a los hogares por percentil de ingreso corregido
 * (que pondera además patrimonio, composición y necesidades), y el tramo real sólo lo entrega
 * la Cartola Hogar. Esta estimación sirve para orientarse, no para dar por hecho un tramo.
 */
export const RSH_CORTES: Array<{ hasta: number; percentil: number; nombre: string }> = [
  { hasta: 120_000, percentil: 40, nombre: 'Tramo 40% (hogares de menores ingresos)' },
  { hasta: 180_000, percentil: 50, nombre: 'Tramo 50%' },
  { hasta: 260_000, percentil: 60, nombre: 'Tramo 60%' },
  { hasta: 350_000, percentil: 70, nombre: 'Tramo 70%' },
  { hasta: 500_000, percentil: 80, nombre: 'Tramo 80%' },
  { hasta: 750_000, percentil: 90, nombre: 'Tramo 90%' },
  { hasta: Number.MAX_SAFE_INTEGER, percentil: 100, nombre: 'Tramo 100% (mayores ingresos)' },
];

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/vida/bonos-y-beneficios-del-estado',
  title: 'Bonos y beneficios del Estado en Chile: cuáles te corresponden y de cuánto son',
  description:
    'Calcula tu tramo del Registro Social de Hogares, cuánto te toca de asignación familiar por carga según tu renta, si te corresponde el Aporte Familiar Permanente, el Bono de Invierno o el Bono Logro Escolar, y qué becas JUNAEB puede pedir tu hijo, con los montos oficiales vigentes.',
  silo: 'Vida',
  siloHref: '/cl/vida',
  locale: 'cl',

  eyebrow: 'Chile · beneficios del Estado',
  h1: '¿Qué bonos y beneficios del Estado me corresponden y de cuánto son?',
  lede:
    'Casi todos los beneficios sociales en Chile se deciden con dos datos: tu tramo del Registro Social de Hogares y tu renta mensual. Pon los tuyos y mira qué te corresponde: asignación familiar por carga, los bonos de temporada que se pagan solos y las becas JUNAEB de tus hijos, con los montos que están vigentes de verdad.',
  stamps: [
    `Asignación familiar: hasta ${fmt(ASIGNACION_FAMILIAR.tramos[0].porCarga)} por carga`,
    `Aporte Familiar Permanente: ${fmt(BONOS.aporteFamiliarPermanente)} por causante`,
    `Bono de Invierno: ${fmt(BONOS.invierno)} · Logro Escolar: hasta ${fmt(BONOS.logroTramo1)}`,
    `Beca Presidente: ${BECAS_JUNAEB.presidenteUtmSuperior} UTM al año en educación superior`,
    'IPS · Registro Social de Hogares · JUNAEB',
  ],

  resultLabel: 'Beneficio estimado',

  cases: {
    title: '¿Qué quieres averiguar?',
    intro:
      'Partimos por el dato que abre casi todas las puertas: en qué tramo del Registro Social de Hogares queda tu hogar.',
    items: [
      {
        id: 'rsh',
        label: '¿En qué tramo del Registro Social de Hogares estoy?',
        hint: 'Es el dato que decide gratuidad, subsidios habitacionales y buena parte de los bonos.',
        yes: [
          'Ingreso per cápita del hogar: el ingreso total dividido por el número de integrantes',
          'Tramo estimado según ese ingreso per cápita',
          'Si quedas dentro del 60% priorizado, que es el rango que abre la mayoría de los subsidios',
          'Qué beneficios se suelen asociar a tu tramo',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Esta es una estimación por ingreso per cápita, no el tramo oficial: el Registro Social de Hogares ordena a los hogares por percentil y pondera además patrimonio, vivienda, composición del hogar y necesidades especiales',
          'El tramo oficial es el que aparece en tu Cartola Hogar en registrosocial.gob.cl y es el único que sirve para postular',
          'Los cortes de esta estimación son referenciales y se actualizan con la encuesta CASEN: si tu Cartola dice otra cosa, manda tu Cartola',
          'El registro se actualiza con la información que reportan las instituciones: si cambió tu situación laboral, conviene revisarla antes de postular a cualquier beneficio',
        ],
        plazo:
          'la Cartola Hogar se puede consultar y actualizar en cualquier momento con tu ClaveÚnica en registrosocial.gob.cl.',
        answer:
          'Tu tramo del Registro Social de Hogares sale de tu ingreso per cápita corregido. Estar en el 60% de menores ingresos es la puerta de entrada a la mayoría de los subsidios del Estado.',
      },
      {
        id: 'asignacion',
        label: 'Asignación familiar: ¿cuánto me toca por mis cargas?',
        hint: 'A mayor renta, menor monto por carga. Pasado cierto ingreso, no se paga.',
        yes: [
          'El tramo de asignación familiar según tu renta mensual',
          'El monto por cada carga acreditada y el total del mes',
          'El total del año, para dimensionar lo que realmente significa',
          'El doble del monto si la carga es una persona con invalidez',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El monto por carga BAJA a medida que sube la renta: el tramo más bajo es el que más cobra, y el cuarto tramo no cobra nada',
          'Superar el tope de renta no te quita la calidad de carga: la persona sigue reconocida como causante, pero deja de pagarse la asignación',
          'Los tramos y montos se reajustan junto con el ingreso mínimo mensual: los de esta página son los vigentes al dato indicado y hay que confirmarlos si pasó un reajuste',
          'La asignación no se paga sola: hay que tener las cargas acreditadas y, si eres independiente, solicitarla expresamente',
          'Convivir sin matrimonio ni Acuerdo de Unión Civil no te da derecho a inscribir a tu pareja como carga, pero los hijos reconocidos sí son causantes en cualquier caso',
        ],
        plazo:
          'las cargas se acreditan ante el empleador o en el IPS; el reajuste anual de tramos y montos rige junto con el del ingreso mínimo.',
        answer:
          `La asignación familiar va desde ${fmt(ASIGNACION_FAMILIAR.tramos[0].porCarga)} por carga en el tramo de menor renta hasta ${fmt(ASIGNACION_FAMILIAR.tramos[2].porCarga)} en el tercero, y no se paga si la renta supera el tope del cuarto tramo.`,
      },
      {
        id: 'bonos',
        label: 'Bonos de temporada: marzo, invierno y logro escolar',
        hint: 'Los tres son automáticos: no se postula, se recibe si cumples los requisitos.',
        yes: [
          'Aporte Familiar Permanente (el llamado "Bono Marzo"): un monto por cada carga o causante',
          'Bono de Invierno: pago único a personas pensionadas de 65 años o más con pensión bajo el tope',
          'Bono Logro Escolar: por estudiante dentro del 30% de mejor rendimiento de su promoción',
          'El total según cuántas cargas o estudiantes tengas',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Ninguno de los tres se postula: son automáticos y los asigna el Estado a quien cumple los requisitos, así que si no te llegó lo que corresponde es un tema de nómina, no de trámite',
          'El Aporte Familiar Permanente se paga por carga sólo si el derecho viene de Subsidio Familiar o Asignación Familiar; si viene de Chile Solidario o Seguridades y Oportunidades es un pago por familia',
          'El Bono de Invierno considera el total de la pensión, incluidos la Compensación por Diferencia de Expectativas de Vida y el Beneficio por Años Cotizados',
          'El Bono Logro Escolar exige estar en el 30% más vulnerable del Registro Social de Hogares además del rendimiento',
          'Los montos se reajustan todos los años: los de esta página corresponden al dato indicado y hay que confirmarlos en la ficha oficial antes de contar con la plata',
        ],
        plazo:
          'el Aporte Familiar Permanente se paga entre febrero y marzo, el Bono de Invierno en mayo junto con la pensión y el Logro Escolar en el segundo semestre.',
        answer:
          'Los tres bonos son automáticos. El de marzo se paga por cada carga, el de invierno es un pago único al pensionado y el de logro escolar depende del rendimiento del estudiante y del tramo del hogar.',
      },
      {
        id: 'becas',
        label: 'Becas JUNAEB para mis hijos',
        hint: 'Son montos anuales, no mensuales: es el error más común al calcularlas.',
        yes: [
          'Beca Presidente de la República: un monto anual expresado en UTM, distinto en media y en superior',
          'Beca Indígena: un monto anual en pesos que cambia según el nivel educativo',
          'Beca Práctica Técnico Profesional: un pago único de libre disposición',
          'El total anual según las becas que apliquen a tu caso',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Estas becas son montos ANUALES que se pagan en cuotas, no mensualidades: multiplicarlos por diez sobreestima el beneficio varias veces',
          'La Beca Presidente de la República está expresada en UTM, así que su valor en pesos cambia cada mes con la UTM',
          'A educación superior sólo se accede renovando la Beca Presidente obtenida en enseñanza media: no se puede postular directamente estando en la universidad',
          'Las becas JUNAEB son ayuda de mantención y no cubren el arancel: para el arancel están la gratuidad y las becas de arancel del Mineduc, que son otro beneficio',
          'El filtro socioeconómico se hace por tramo del Registro Social de Hogares, no por un monto de ingreso: no existe un "RSH máximo en pesos"',
        ],
        plazo:
          'las postulaciones de JUNAEB se abren en fechas distintas para cada beca; la renovación de la Beca Presidente vence a mediados de septiembre.',
        answer:
          `Las becas JUNAEB son montos anuales: la Beca Presidente son ${BECAS_JUNAEB.presidenteUtmSuperior} UTM al año en educación superior y la Beca Indígena de superior ${fmt(BECAS_JUNAEB.indigenaSuperior)} al año, ambas pagadas en cuotas.`,
      },
      {
        id: 'convivientes',
        label: 'Convivimos sin casarnos: ¿qué derechos tenemos?',
        hint: 'La diferencia entre convivencia informal y Acuerdo de Unión Civil es enorme.',
        yes: [
          'Qué cambia para la asignación familiar según cómo esté formalizada la pareja',
          'Los hijos reconocidos son causantes de asignación familiar en cualquier caso',
          'Qué derechos aparecen recién al formalizar un Acuerdo de Unión Civil o un matrimonio',
          'El monto anual de asignación familiar que está en juego según tus cargas',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'En convivencia informal la pareja no es carga familiar, no hereda por sucesión intestada y no accede a pensión de sobrevivencia: los hijos reconocidos, en cambio, tienen todos sus derechos con independencia del estado civil de los padres',
          'El Acuerdo de Unión Civil equipara a la pareja en asignación familiar, pensión de sobrevivencia, cargas en salud y sucesión, pero no es idéntico al matrimonio en todos los efectos',
          'Los porcentajes de herencia dependen de quiénes concurran a la sucesión y de si hay testamento: no son un número fijo, y ésta no es la página para resolverlo',
          'Los costos de formalizar un Acuerdo de Unión Civil varían mucho según la notaría y el Registro Civil: confírmalos antes de presupuestar',
        ],
        plazo:
          'el Acuerdo de Unión Civil se celebra ante el Registro Civil y produce efectos desde su inscripción.',
        answer:
          'Sin Acuerdo de Unión Civil ni matrimonio, tu pareja no es carga familiar ni hereda. Tus hijos reconocidos, en cambio, son causantes de asignación familiar aunque ustedes no estén casados.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Todo mensual y en pesos chilenos. Los montos de asignación familiar, bonos y becas son los vigentes a la fecha indicada en cada uno: se reajustan por ley todos los años, así que conviene contrastarlos con la ficha oficial antes de contar con la plata.',
  fields: [
    {
      id: 'renta',
      label: 'Tu renta mensual (CLP)',
      prefix: '$',
      value: '700.000',
      thousands: true,
      help: 'Renta bruta mensual del trabajador. Es la que define el tramo de asignación familiar.',
    },
    {
      id: 'ingresoHogar',
      label: 'Ingreso total del hogar (CLP)',
      prefix: '$',
      value: '900.000',
      thousands: true,
      help: 'Suma de todos los ingresos del hogar. Se usa para estimar el tramo del Registro Social de Hogares.',
    },
    {
      id: 'integrantes',
      label: 'Personas que viven en el hogar',
      type: 'number',
      value: 4,
      min: 1,
      max: 20,
      step: 1,
      help: 'Incluye a todos los integrantes declarados en el registro, no sólo a los que trabajan.',
    },
    {
      id: 'cargas',
      label: 'Cargas familiares acreditadas',
      type: 'number',
      value: 2,
      min: 0,
      max: 24,
      step: 1,
      help: 'Hijos, cónyuge o conviviente civil y ascendientes que estén reconocidos como causantes.',
    },
    {
      id: 'invalidez',
      label: '¿Alguna carga tiene invalidez acreditada?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí — la asignación de esa carga se paga al doble' },
      ],
    },
    {
      id: 'bono',
      label: 'Bono de temporada que quieres estimar',
      type: 'select',
      value: 'marzo',
      options: [
        { value: 'marzo', label: 'Aporte Familiar Permanente (Bono Marzo)' },
        { value: 'invierno', label: 'Bono de Invierno (pensionados de 65+)' },
        { value: 'logro1', label: 'Bono Logro Escolar — tramo 1 (15% superior)' },
        { value: 'logro2', label: 'Bono Logro Escolar — tramo 2 (entre 15% y 30%)' },
      ],
    },
    {
      id: 'estudiantes',
      label: 'Estudiantes del hogar que califican',
      type: 'number',
      value: 1,
      min: 0,
      max: 15,
      step: 1,
      help: 'Se usa para el Bono Logro Escolar y para las becas JUNAEB.',
    },
    {
      id: 'nivelBeca',
      label: 'Nivel educativo para la beca JUNAEB',
      type: 'select',
      value: 'media',
      options: [
        { value: 'basica', label: 'Educación básica' },
        { value: 'media', label: 'Enseñanza media' },
        { value: 'superior', label: 'Educación superior' },
        { value: 'practica', label: 'Práctica técnico-profesional' },
      ],
    },
    {
      id: 'indigena',
      label: '¿Acredita pertenencia a un pueblo originario?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí — habilita la Beca Indígena' },
      ],
    },
    {
      id: 'pareja',
      label: 'Situación de la pareja',
      type: 'select',
      value: 'convivencia',
      options: [
        { value: 'convivencia', label: 'Convivencia sin formalizar' },
        { value: 'auc', label: 'Acuerdo de Unión Civil inscrito' },
        { value: 'matrimonio', label: 'Matrimonio' },
        { value: 'sin_pareja', label: 'Sin pareja' },
      ],
    },
  ],
  fineprint: DISCLAIMER_LEGAL,

  chart: {
    type: 'bars',
    title: 'De dónde sale la plata',
    caption:
      'Compara al año lo que aporta cada beneficio: la asignación familiar por tus cargas, el bono de temporada que te corresponde y las becas JUNAEB de los estudiantes del hogar.',
  },
  breakdownTitle: 'Beneficio por beneficio',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto se paga hoy de asignación familiar por carga?',
      a: `Depende de tu renta, y baja a medida que la renta sube. El primer tramo, hasta ${fmt(ASIGNACION_FAMILIAR.tramos[0].hasta)} de renta mensual, paga ${fmt(ASIGNACION_FAMILIAR.tramos[0].porCarga)} por carga. El segundo, hasta ${fmt(ASIGNACION_FAMILIAR.tramos[1].hasta)}, paga ${fmt(ASIGNACION_FAMILIAR.tramos[1].porCarga)}. El tercero, hasta ${fmt(ASIGNACION_FAMILIAR.tramos[2].hasta)}, paga ${fmt(ASIGNACION_FAMILIAR.tramos[2].porCarga)}. Por encima de esa renta no se paga asignación, aunque la persona conserve su calidad de carga. Estos valores se reajustan junto con el ingreso mínimo mensual, así que conviene confirmarlos si pasó un reajuste.`,
    },
    {
      q: 'Gano más que el tope. ¿Pierdo a mis cargas?',
      a: 'No. Superar el tope de renta te deja sin el pago de la asignación, pero tus causantes siguen reconocidos como cargas familiares. Eso importa porque la calidad de carga habilita otras cosas —ser beneficiario en Fonasa o en la Isapre, por ejemplo—, que no dependen de que se te esté pagando el dinero.',
    },
    {
      q: '¿Qué pasa si mi carga tiene una discapacidad?',
      a: 'La asignación familiar de una carga con invalidez acreditada se paga al doble del monto que corresponda a tu tramo de renta. La invalidez tiene que estar acreditada ante el organismo correspondiente: no basta con declararla.',
    },
    {
      q: '¿En qué tramo del Registro Social de Hogares estoy?',
      a: 'El tramo lo determina tu ingreso per cápita corregido, que no es simplemente el ingreso del hogar dividido por la cantidad de personas: el registro pondera además patrimonio, tipo de vivienda, composición del hogar y necesidades especiales, y después ordena a todos los hogares del país por percentil. Esta página estima el tramo sólo por ingreso per cápita, lo que sirve para orientarse pero no reemplaza a la Cartola Hogar, que es el documento oficial y el único que sirve para postular.',
    },
    {
      q: '¿Por qué importa tanto estar en el 60%?',
      a: 'Porque es el corte que usan la mayoría de los programas focalizados: gratuidad en educación superior, buena parte de los subsidios habitacionales, varios de los bonos y los programas de apoyo del Ministerio de Desarrollo Social. Entre el 60% y el 80% siguen existiendo beneficios, pero son menos y suelen ser de sectores medios. Por encima del 80% la oferta focalizada se reduce mucho.',
    },
    {
      q: '¿Hay que postular al Bono Marzo o al Bono de Invierno?',
      a: 'No. Los dos son automáticos: el Estado arma la nómina con la información que ya tiene y los paga a quien cumple los requisitos. El Aporte Familiar Permanente, que es el nombre real del Bono Marzo, se paga entre febrero y marzo a quien al 31 de diciembre del año anterior era beneficiario de Subsidio Familiar, Asignación Familiar, Chile Solidario o Seguridades y Oportunidades. El Bono de Invierno se paga en mayo junto con la pensión. Si crees que te corresponde y no te llegó, hay que reclamar en el IPS, no postular.',
    },
    {
      q: '¿El Bono Marzo se paga por cada hijo?',
      a: 'Depende de por dónde te venga el derecho. Si viene de Subsidio Familiar o Asignación Familiar, se paga un monto por cada carga o causante, así que sí se multiplica por los hijos. Si viene de Chile Solidario o del Subsistema de Seguridades y Oportunidades, es un solo pago por familia sin importar cuántos integrantes haya.',
    },
    {
      q: '¿Quién recibe el Bono de Invierno?',
      a: `Las personas pensionadas de 65 años o más al 1 de mayo cuya pensión total no supere ${fmt(BONOS.inviernoTopePension)}. Se considera el total de la pensión, incluidos la Compensación por Diferencia de Expectativas de Vida y el Beneficio por Años Cotizados, así que sumar esos componentes puede dejarte fuera aunque la pensión base sea menor. Es un pago único, automático y no tributable.`,
    },
    {
      q: '¿Cómo se gana el Bono Logro Escolar?',
      a: 'Con dos condiciones a la vez: el estudiante tiene que estar dentro del 30% de mejor rendimiento de su promoción y el hogar dentro del 30% más vulnerable del Registro Social de Hogares. Aplica de 5° básico a 4° medio, en establecimientos reconocidos por el Estado, para menores de 24 años. El tramo 1, que es el 15% superior de la promoción, cobra bastante más que el tramo 2. Es automático: la nómina la arma el Ministerio de Desarrollo Social con los datos del Mineduc.',
    },
    {
      q: '¿De cuánto son realmente las becas JUNAEB?',
      a: `Son montos anuales, no mensuales, y esa es la confusión más frecuente. La Beca Presidente de la República son ${BECAS_JUNAEB.presidenteUtmMedia} UTM al año en enseñanza media y ${BECAS_JUNAEB.presidenteUtmSuperior} UTM al año en educación superior, pagadas en hasta diez cuotas. La Beca Indígena es de ${fmt(BECAS_JUNAEB.indigenaBasica)} al año en básica, ${fmt(BECAS_JUNAEB.indigenaMedia)} en media y ${fmt(BECAS_JUNAEB.indigenaSuperior)} en superior. La Beca Práctica Técnico Profesional es un pago único de ${fmt(BECAS_JUNAEB.practicaTecnica)}. Tomar cualquiera de estas cifras como mensualidad y multiplicarla por diez sobreestima el beneficio varias veces.`,
    },
    {
      q: '¿Las becas JUNAEB pagan el arancel de la universidad?',
      a: 'No. Las becas JUNAEB son ayuda de mantención: sirven para gastos de vida, materiales y transporte. El arancel se cubre con otros instrumentos, que son la gratuidad y las becas de arancel del Ministerio de Educación, y se postulan por otro camino con el Formulario Único de Acreditación Socioeconómica. Se pueden tener las dos cosas a la vez, pero son beneficios distintos.',
    },
    {
      q: 'Convivimos sin casarnos. ¿Mi pareja puede ser carga familiar?',
      a: 'No en convivencia informal. Para que tu pareja sea carga familiar tuya hace falta matrimonio o un Acuerdo de Unión Civil inscrito. Los hijos reconocidos, en cambio, son causantes de asignación familiar con independencia de si sus padres están casados, unidos civilmente o no. Formalizar un Acuerdo de Unión Civil también habilita pensión de sobrevivencia, cargas en salud y derechos sucesorios que la convivencia informal no da.',
    },
    {
      q: 'Soy trabajador independiente. ¿Me corresponde asignación familiar?',
      a: 'Sí, pero no se paga sola: hay que solicitarla y acreditar las cargas ante el IPS. A diferencia del trabajador dependiente, donde la asignación aparece en la liquidación porque la paga el empleador y después se la reembolsan, el independiente tiene que gestionarla. El tramo se determina con la renta declarada.',
    },
  ],

  sources: [
    {
      name: 'ChileAtiende — Asignación Familiar: tramos, montos y requisitos (ficha 25878)',
      url: 'https://www.chileatiende.gob.cl/fichas/25878-asignacion-familiar',
      publisher: 'ChileAtiende / Instituto de Previsión Social',
    },
    {
      name: 'Dirección del Trabajo — valor de la asignación familiar',
      url: 'https://www.dt.gob.cl/portal/1628/w3-article-85651.html',
      publisher: 'Dirección del Trabajo',
    },
    {
      name: 'Registro Social de Hogares — Cartola Hogar y tramos',
      url: 'https://www.registrosocial.gob.cl/',
      publisher: 'Ministerio de Desarrollo Social y Familia',
    },
    {
      name: 'ChileAtiende — Aporte Familiar Permanente, ex Bono Marzo (ficha 38913)',
      url: 'https://www.chileatiende.gob.cl/fichas/38913-aporte-familiar-permanente',
      publisher: 'ChileAtiende / Instituto de Previsión Social',
    },
    {
      name: 'ChileAtiende — Bono de Invierno (ficha 39484)',
      url: 'https://www.chileatiende.gob.cl/fichas/39484-bono-invierno',
      publisher: 'ChileAtiende / Instituto de Previsión Social',
    },
    {
      name: 'ChileAtiende — Bono Logro Escolar (ficha 20063)',
      url: 'https://www.chileatiende.gob.cl/fichas/20063-bono-logro-escolar',
      publisher: 'ChileAtiende / Ministerio de Desarrollo Social y Familia',
    },
    {
      name: 'ChileAtiende — Beca Presidente de la República (ficha 2086)',
      url: 'https://www.chileatiende.gob.cl/fichas/2086-beca-presidente-de-la-republica-bpr',
      publisher: 'ChileAtiende / JUNAEB',
    },
    {
      name: 'ChileAtiende — Beca Indígena (ficha 2089)',
      url: 'https://www.chileatiende.gob.cl/fichas/2089-beca-indigena-bi',
      publisher: 'ChileAtiende / JUNAEB',
    },
    {
      name: 'ChileAtiende — Beca Práctica Técnico Profesional (ficha 4598)',
      url: 'https://www.chileatiende.gob.cl/fichas/4598-beca-practica-tecnico-profesional',
      publisher: 'ChileAtiende / JUNAEB',
    },
    {
      name: 'SII — valor de la UTM',
      url: 'https://www.sii.cl/valores_y_fechas/utm/utm2026.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
  ],

  replaces: [
    '/calculadora-tramo-registro-social-hogares-rsh-chile',
    '/calculadora-asignacion-familiar-chile-2026-tramos-renta',
    '/calculadora-asignacion-familiar-pareja-no-casados-chile-derechos',
    '/calculadora-asignacion-familiar-vs-gratuidad-chile',
    '/calculadora-bono-marzo-bono-invierno-chile-cuantia-requisitos',
    '/calculadora-becas-junaeb-chile-cuantia-requisitos-2026',
    // Absorbida SÓLO por URL: era un "¿tengo edad para votar?" (comparar una fecha de nacimiento
    // contra los 18 años). No es un beneficio ni entra en ningún cálculo de este hub; se redirige
    // acá porque es la página de trámites del Estado chileno más cercana del catálogo vivo.
    '/calculadora-servel-edad-para-votar-chile',
  ],

  lastReviewed: '2026-07-28',
};
