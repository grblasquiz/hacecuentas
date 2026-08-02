import type { HubData } from '../types';
import { INCAPACIDAD_PERMANENTE_2026, IPREM_2026, PENSIONES_2026 } from '../../data/espana-2026';

/**
 * Hub de decisión ES — "No puedo trabajar por salud: ¿qué cobro?"
 *
 * Absorbe 4 calculadoras: baja por incapacidad temporal, incapacidad permanente
 * total y absoluta, grado de dependencia y pensión no contributiva.
 *
 * YMYL doble: salud y plata. Los disclaimers son textuales de
 * src/lib/disclaimers.ts, dominios 'health' y 'labor'.
 *
 * El hub NO valora ni sugiere grado: eso lo determina el tribunal médico del
 * INSS o la valoración de dependencia de la comunidad autónoma. Lo que se
 * calcula aquí es sólo la consecuencia económica de un grado ya reconocido.
 */

/** Disclaimer YMYL salud — textual de src/lib/disclaimers.ts (dominio 'health'). */
const DISCLAIMER_SALUD =
  'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consulta con un profesional de la salud matriculado.';

/** Disclaimer YMYL laboral — textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABORAL =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verifica con RR. HH., el organismo laboral o un profesional.';

export const hub: HubData = {
  slug: 'es/trabajo/no-puedo-trabajar',
  title: 'Baja, incapacidad y dependencia en España: cuánto se cobra',
  description:
    'Calcula lo que cobras si no puedes trabajar: baja por enfermedad común o accidente laboral, incapacidad permanente total y absoluta, pensión no contributiva y prestación por dependencia.',
  silo: 'Trabajo',
  siloHref: '/es/trabajo',

  eyebrow: 'Guía de prestaciones',
  h1: 'No puedo trabajar: ¿qué cobro y quién me lo paga?',
  lede:
    'Cuando la salud te aparta del trabajo, el sistema responde con prestaciones distintas según cuánto dure y de qué grado sea. La baja temporal paga un porcentaje de tu base y sube con los días. La incapacidad permanente es una pensión de por vida cuyo importe depende del grado que reconozca el tribunal médico. Y si no hay carrera de cotización detrás, quedan las prestaciones no contributivas.',
  stamps: ['Ley General de la Seguridad Social', 'Grados de incapacidad y dependencia', '4 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿En qué situación estás?',
    intro:
      'El grado no lo decide este cálculo: lo reconocen el tribunal médico del INSS o la valoración de dependencia. Aquí se traduce a dinero un grado que ya te han dicho.',
    items: [
      {
        id: 'comun',
        label: 'Baja por enfermedad común',
        hint: '60% del día 4 al 20, 75% desde el 21',
        answer:
          'En enfermedad común los tres primeros días no se cobran, del cuarto al veinte se cobra el 60% de la base y desde el día 21 el 75%.',
        yes: [
          'Base reguladora diaria: la base de cotización del mes anterior entre los días',
          'Días 1 a 3 sin prestación, salvo que el convenio los complemente',
          '60% de la base del día 4 al 20',
          '75% de la base a partir del día 21',
        ],
        warn: [
          DISCLAIMER_SALUD,
          DISCLAIMER_LABORAL,
          'Muchos convenios obligan a la empresa a complementar hasta el 100%: revisa el tuyo antes de dar por buena la cifra',
          'La prestación tributa en el IRPF como rendimiento del trabajo y lleva retención',
        ],
        plazo: 'el parte de baja se emite el mismo día y la empresa lo tramita en tres días hábiles.',
      },
      {
        id: 'profesional',
        label: 'Accidente de trabajo o enfermedad profesional',
        hint: '75% desde el día siguiente',
        answer:
          'En contingencia profesional se cobra el 75% de la base desde el día siguiente a la baja, sin días de carencia.',
        yes: [
          'El día de la baja lo paga la empresa al completo',
          '75% de la base reguladora desde el día siguiente',
          'La base incluye las horas extra del año anterior prorrateadas',
          'Lo paga la mutua colaboradora, no el INSS',
        ],
        warn: [
          DISCLAIMER_SALUD,
          DISCLAIMER_LABORAL,
          'Si la mutua clasifica como común lo que es profesional, cobras bastante menos: se puede impugnar la determinación de contingencia',
          'Un accidente in itinere, de ida o vuelta al trabajo, también es contingencia profesional',
        ],
        plazo: 'la determinación de contingencia se puede impugnar ante el INSS.',
      },
      {
        id: 'permanente',
        label: 'Incapacidad permanente',
        hint: 'Total 55%, absoluta 100%',
        answer:
          'La incapacidad permanente total paga el ' +
          INCAPACIDAD_PERMANENTE_2026.total.pct +
          '% de la base reguladora y la absoluta el ' +
          INCAPACIDAD_PERMANENTE_2026.absoluta.pct +
          '%.',
        yes: [
          'Total: ' + INCAPACIDAD_PERMANENTE_2026.total.pct + '% de la base, por no poder ejercer tu profesión habitual',
          'Total cualificada: ' + INCAPACIDAD_PERMANENTE_2026.total.pctCualificada + '% desde los 55 años sin trabajo y con difícil reinserción',
          'Absoluta: ' + INCAPACIDAD_PERMANENTE_2026.absoluta.pct + '% de la base, para cualquier profesión',
          'Gran invalidez: la absoluta más un complemento por necesitar ayuda de otra persona',
        ],
        warn: [
          DISCLAIMER_SALUD,
          DISCLAIMER_LABORAL,
          'El grado lo declara el tribunal médico del INSS tras el dictamen del EVI: este cálculo no lo valora ni lo predice',
          'La pensión de incapacidad absoluta y la gran invalidez están exentas de IRPF; la total, no',
          'La incapacidad permanente total es compatible con trabajar en otra profesión distinta',
        ],
        plazo: 'la resolución del INSS se puede reclamar en 30 días mediante reclamación previa.',
      },
      {
        id: 'nocontributiva',
        label: 'Sin cotización suficiente o dependencia',
        hint: 'Pensión no contributiva y SAAD',
        answer:
          'Sin carrera de cotización quedan la pensión no contributiva, con límite de rentas, y las prestaciones por grado de dependencia.',
        yes: [
          'Pensión no contributiva de jubilación o invalidez, con límite de rentas de la unidad de convivencia',
          'Invalidez no contributiva: exige un grado de discapacidad reconocido del 65% o más',
          'Prestaciones por dependencia según el grado reconocido, con copago según renta y patrimonio',
          'Complementos por vivienda alquilada, según convocatoria',
        ],
        warn: [
          DISCLAIMER_SALUD,
          DISCLAIMER_LABORAL,
          'La cuantía cae en proporción cuando las rentas de la unidad de convivencia se acercan al límite: no es todo o nada',
          'Las listas de espera de la valoración de dependencia son largas y varían mucho entre comunidades autónomas',
        ],
        plazo: 'la pensión no contributiva se solicita en los servicios sociales de tu comunidad autónoma.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'La base reguladora sale de tu base de cotización. Si no la tienes a mano, usa tu salario bruto mensual como aproximación.',
  fields: [
    { id: 'base', label: 'Base reguladora mensual', prefix: '€', value: '1.800', thousands: true },
    { id: 'dias', label: 'Días de baja', type: 'number', value: '30', min: 0, max: 545, step: 1 },
    {
      id: 'complemento',
      label: '¿Tu convenio complementa la baja?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, sólo la prestación legal' },
        { value: '100', label: 'Sí, hasta el 100% del salario' },
        { value: '75', label: 'Sí, hasta el 75%' },
      ],
    },
    { id: 'edad', label: 'Tu edad', type: 'number', value: '45', min: 16, max: 99, step: 1 },
    {
      id: 'gradoIp',
      label: 'Grado de incapacidad permanente reconocido',
      type: 'select',
      value: 'total',
      options: [
        { value: 'total', label: 'Total para la profesión habitual' },
        { value: 'total_cualificada', label: 'Total cualificada (55 años o más)' },
        { value: 'absoluta', label: 'Absoluta para todo trabajo' },
        { value: 'gran_invalidez', label: 'Gran invalidez' },
      ],
      help: 'Lo determina el tribunal médico del INSS, no este cálculo.',
    },
    {
      id: 'rentasAnuales',
      label: 'Rentas anuales de la unidad de convivencia',
      prefix: '€',
      value: '0',
      thousands: true,
      help: 'Sólo se usa para la pensión no contributiva.',
    },
  ],
  fineprint: DISCLAIMER_SALUD + ' ' + DISCLAIMER_LABORAL,

  chart: {
    type: 'bars',
    title: 'Lo que cobras según el tramo',
    caption:
      'Compara lo que cobras en cada tramo de la baja o en cada grado con tu base reguladora completa.',
  },
  breakdownTitle: 'Cómo se calcula tu prestación',
  breakdownIntro:
    'Los importes son mensuales salvo donde se indica. Las filas de días y porcentaje llevan su unidad.',

  faq: [
    {
      q: '¿Cuánto se cobra estando de baja?',
      a: 'Si la baja es por enfermedad común o accidente no laboral, los tres primeros días no se cobran, del cuarto al veinte se cobra el 60% de la base reguladora y a partir del día 21 el 75%. Si es por accidente de trabajo o enfermedad profesional, se cobra el 75% desde el día siguiente a la baja.',
    },
    {
      q: '¿Quién me paga la baja?',
      a: 'Del día 4 al 15 en contingencia común la paga la empresa, aunque con cargo a la Seguridad Social a partir de ahí; desde el día 16 la abona el INSS o la mutua, normalmente en régimen de pago delegado a través de tu nómina. En contingencia profesional paga la mutua desde el principio.',
    },
    {
      q: '¿Mi empresa tiene que completarme el sueldo?',
      a: 'Sólo si lo dice el convenio o tu contrato. Muchos convenios obligan a complementar hasta el 100% durante un número de días, y algunos incluso cubren los tres primeros días de carencia. Sin esa cláusula, la empresa no está obligada a poner nada.',
    },
    {
      q: '¿Cuánto puede durar una baja?',
      a: 'El plazo ordinario es de 365 días, prorrogable 180 más. Al agotarlo, el INSS debe pronunciarse: alta médica, prórroga o inicio del expediente de incapacidad permanente. La baja no puede alargarse indefinidamente sin una resolución.',
    },
    {
      q: '¿Qué diferencia hay entre incapacidad total y absoluta?',
      a: 'La total te inhabilita para tu profesión habitual pero no para otras, y paga el 55% de la base reguladora; puedes trabajar en un oficio distinto y cobrarla a la vez. La absoluta te inhabilita para cualquier trabajo y paga el 100% de la base.',
    },
    {
      q: '¿Qué es la incapacidad total cualificada?',
      a: 'Es la total con un incremento de 20 puntos, hasta el 75% de la base, que se reconoce a partir de los 55 años cuando por la edad, la formación y las circunstancias del mercado laboral resulta difícil encontrar otro trabajo. Si vuelves a trabajar, ese incremento se suspende.',
    },
    {
      q: '¿La pensión de incapacidad tributa?',
      a: 'La incapacidad permanente absoluta y la gran invalidez están exentas de IRPF. La total, en cambio, tributa como rendimiento del trabajo, igual que un salario. Es una diferencia enorme en el neto entre dos grados que suenan parecidos.',
    },
    {
      q: '¿Quién decide mi grado de incapacidad?',
      a: 'El Equipo de Valoración de Incapacidades emite el dictamen y el INSS dicta la resolución. Ninguna calculadora puede anticiparlo, porque depende del informe médico, de tu profesión concreta y de las limitaciones acreditadas. Si no estás de acuerdo, hay 30 días para presentar reclamación previa.',
    },
    {
      q: '¿Qué es la pensión no contributiva?',
      a: 'Una prestación para quien no ha cotizado lo suficiente, con dos modalidades: jubilación a partir de los 65 años e invalidez entre los 18 y los 64 con un grado de discapacidad del 65% o más. Está sujeta a un límite de rentas de la unidad de convivencia, y la cuantía se reduce proporcionalmente al acercarse a ese límite.',
    },
    {
      q: '¿Cómo funcionan las prestaciones por dependencia?',
      a: 'Tras la valoración se reconoce un grado —moderada, severa o gran dependencia— y a cada uno le corresponde un catálogo de servicios y prestaciones económicas. Hay copago según renta y patrimonio, lo gestiona cada comunidad autónoma y los plazos de resolución varían mucho de un territorio a otro.',
    },
    {
      q: '¿Puedo cobrar pensión de incapacidad y trabajar?',
      a: 'Con la incapacidad permanente total, sí: puedes trabajar en una profesión distinta de la que te fue reconocida como imposible. Con la absoluta y la gran invalidez, la compatibilidad es mucho más limitada y cualquier actividad debe comunicarse al INSS.',
    },
  ],

  sources: [
    {
      name: 'Ley General de la Seguridad Social — incapacidad temporal y permanente',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Seguridad Social — incapacidad temporal: cuantía y duración',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10938',
      publisher: 'Instituto Nacional de la Seguridad Social',
    },
    {
      name: 'Seguridad Social — grados de incapacidad permanente',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10938/28472',
      publisher: 'Instituto Nacional de la Seguridad Social',
    },
    {
      name: 'IMSERSO — pensiones no contributivas',
      url: 'https://imserso.es/prestaciones-economicas/pensiones-no-contributivas',
      publisher: 'Instituto de Mayores y Servicios Sociales',
    },
    {
      name: 'Sistema para la Autonomía y Atención a la Dependencia (SAAD)',
      url: 'https://imserso.es/dependencia',
      publisher: 'Instituto de Mayores y Servicios Sociales',
    },
  ],

  replaces: [
    '/calculadora-baja-laboral-incapacidad-temporal-espana-cuantia',
    '/calculadora-incapacidad-permanente-total-absoluta-cuantia-espana',
    '/calculadora-dependencia-grado-prestacion-espana-2026',
    '/calculadora-pension-no-contributiva-jubilacion-invalidez-espana',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Porcentajes de la incapacidad temporal. LGSS art. 172. */
export const IT = {
  pctDias4a20: 0.6,
  pctDesde21: 0.75,
  pctProfesional: 0.75,
  diasCarencia: 3,
  duracionMaximaDias: 365,
  prorrogaDias: 180,
};

export const IP = INCAPACIDAD_PERMANENTE_2026;
export const IPREM = IPREM_2026;
export const PENSIONES = PENSIONES_2026;

/**
 * Pensión no contributiva: cuantía íntegra anual en 14 pagas y límites de renta
 * por número de miembros de la unidad de convivencia.
 * Espejo de src/lib/formulas/pension-no-contributiva-jubilacion-invalidez-espana.ts.
 */
export const PNC = {
  integraAnual: 7614.42,
  limiteRenta: {
    '1': 7614.42,
    '2': 12984.08,
    '3': 18218.73,
    '4': 23453.39,
    '5': 28688.04,
  } as Record<string, number>,
  porcentajeMinimo: 0.25,
  edadJubilacion: 65,
  gradoInvalidezMinimo: 65,
};
