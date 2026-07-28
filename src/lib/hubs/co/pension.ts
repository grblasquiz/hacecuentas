import type { HubData } from '../types';
import { COLOMBIA_2026, REAJUSTE_PENSIONAL_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuándo me pensiono y con cuánto?"
 *
 * 🔴 REGLA DE ORO DE ESTE HUB: la reforma pensional (Ley 2381 de 2024) está SUSPENDIDA
 * por la Corte Constitucional (Auto 841 de 2025). Rige el sistema de la Ley 100/1993:
 * RAIS vs Régimen de Prima Media, con el Fondo de Solidaridad Pensional vigente.
 * Los "pilares" van SIEMPRE como escenario futuro condicionado, nunca como derecho
 * vigente. Ver el comentario de cabecera de src/lib/data/colombia-2026.ts.
 *
 * Fuente única de constantes: src/lib/data/colombia-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const SMLMV = COLOMBIA_2026.smlmv;

/** Requisitos de vejez del Régimen de Prima Media (Ley 100/1993 art. 33, mod. Ley 797/2003). */
export const REQUISITOS_RPM = {
  edadHombre: 62,
  edadMujer: 57,
  semanasMinimas: 1300,
};

/**
 * Tasa de reemplazo del RPM (Ley 797/2003, art. 10, que modificó el art. 34 de la Ley 100).
 * r = 65,50 − 0,50 × s, donde s = IBL expresado en número de SMLMV.
 * Se aplica sobre las primeras 1.300 semanas; por cada 50 semanas adicionales sube
 * 1,5 puntos, con tope del 80% y piso del 55%.
 */
export const TASA_RPM = {
  constante: 65.5,
  factorIbl: 0.5,
  minimoPct: 55,
  maximoPct: 80,
  puntosPorBloque: 1.5,
  semanasPorBloque: 50,
};

/** Aportes que se le descuentan a un pensionado. */
export const DESCUENTOS_PENSIONADO = {
  /** Salud: 4% de la mesada (Ley 100 art. 204 y Ley 1250/2008). El pensionado NO aporta a pensión. */
  saludPct: 0.04,
};

/** Reajuste anual de la mesada (nómina de enero). */
export const REAJUSTE = {
  ipcPct: REAJUSTE_PENSIONAL_2026.ipc2025Pct,
  smlmvAnterior: REAJUSTE_PENSIONAL_2026.smlmv2025,
};

/** Fondo de Solidaridad Pensional: escala sobre el IBC en SMLMV (Ley 100 art. 27). */
export const FSP = COLOMBIA_2026.fsp.map((t) => ({
  desde: t.desdeSmlmv,
  hasta: Number.isFinite(t.hastaSmlmv) ? t.hastaSmlmv : null,
  tasa: t.tasa,
}));

/** Incentivo periódico del Estado en BEPS: 20% de lo ahorrado, al momento de redimir. */
export const BEPS_INCENTIVO = 0.2;

/**
 * Estado de la reforma pensional. NO cambiar a "vigente" sin que la Corte
 * levante la suspensión: el hub entero está escrito sobre este dato.
 */
export const REFORMA = {
  ley: 'Ley 2381 de 2024',
  estado: 'suspendida',
  auto: 'Auto 841 de 2025 de la Corte Constitucional',
  rige: 'Ley 100 de 1993',
};

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/finanzas/pension',
  title: 'Pensión en Colombia: cuándo me pensiono, con cuánto y en qué régimen',
  description:
    'Calculá tu pensión en Colombia con la ley vigente: edad y semanas del Régimen de Prima Media, tasa de reemplazo del art. 34, fondo privado (RAIS), indemnización sustitutiva, devolución de saldos, BEPS y el reajuste anual de la mesada.',
  silo: 'Finanzas',
  siloHref: '/co/finanzas',
  locale: 'co',

  eyebrow: 'Colombia · Ley 100/1993 · reforma suspendida',
  h1: '¿Cuándo me pensiono y con cuánto?',
  lede:
    'Con la reforma pensional suspendida por la Corte Constitucional, la cuenta se hace con la Ley 100 de 1993 de toda la vida: edad, semanas y tasa de reemplazo en Colpensiones, o capital acumulado si estás en un fondo privado. Acá está tu escenario según dónde cotices y qué te falte.',
  stamps: [
    `SMLMV: ${cop(SMLMV)} · reajuste IPC ${REAJUSTE.ipcPct.toLocaleString('es-CO')}%`,
    'Ley 100/1993 y Ley 797/2003 — reforma Ley 2381/2024 suspendida',
    '7 calculadoras adentro',
  ],

  resultLabel: 'Mesada estimada',

  cases: {
    title: '¿Dónde estás parado hoy?',
    intro:
      'La pregunta "¿cuánto me va a quedar?" tiene cinco respuestas muy distintas según dónde cotices y cuánto lleves. Elegí tu caso: el más común es Colpensiones.',
    items: [
      {
        id: 'rpm',
        label: 'Cotizo en Colpensiones (Régimen de Prima Media)',
        hint: 'Ley 100 art. 33 y 34 · tasa de reemplazo',
        answer: `Con ${REQUISITOS_RPM.semanasMinimas} semanas y ${REQUISITOS_RPM.edadHombre} años (hombre) o ${REQUISITOS_RPM.edadMujer} (mujer), tu mesada es un porcentaje del IBL que baja a medida que el IBL sube.`,
        yes: [
          `Edad: ${REQUISITOS_RPM.edadMujer} años las mujeres, ${REQUISITOS_RPM.edadHombre} los hombres`,
          `Semanas: ${REQUISITOS_RPM.semanasMinimas.toLocaleString('es-CO')} cotizadas como mínimo`,
          `Tasa de reemplazo: ${TASA_RPM.constante} − ${TASA_RPM.factorIbl} × (IBL en SMLMV), entre ${TASA_RPM.minimoPct}% y ${TASA_RPM.maximoPct}%`,
          `Cada ${TASA_RPM.semanasPorBloque} semanas de más suman ${TASA_RPM.puntosPorBloque.toLocaleString('es-CO')} puntos, hasta el tope del ${TASA_RPM.maximoPct}%`,
          'La mesada nunca puede ser menor a 1 SMLMV, y el Estado garantiza ese piso',
        ],
        warn: [
          DISCLAIMER_TAX,
          `La reforma pensional (${REFORMA.ley}) está SUSPENDIDA por el ${REFORMA.auto}: hoy rige la ${REFORMA.rige}, y cualquier cuenta con "pilares" es un escenario futuro, no tu derecho actual`,
          'El IBL es el promedio de lo cotizado en los últimos 10 años, actualizado por IPC: si cotizaste sobre el mínimo casi toda la vida y sobre mucho los últimos años, el promedio no te salva',
          'Cotizar sobre un IBC alto sube la mesada en pesos pero baja el porcentaje de reemplazo: la fórmula es deliberadamente redistributiva',
        ],
        plazo: 'una vez cumplís edad y semanas podés radicar en cualquier momento; Colpensiones tiene 4 meses para resolver el reconocimiento.',
      },
      {
        id: 'rais',
        label: 'Estoy en un fondo privado (RAIS)',
        hint: 'Cuenta individual · capital acumulado',
        answer: 'En el RAIS no hay edad ni semanas mínimas: te pensionás cuando tu capital alcance para una mesada de al menos 1 SMLMV de por vida.',
        yes: [
          'Tu saldo acumulado más los rendimientos del fondo y el bono pensional si venías del sector público',
          'Modalidades: renta vitalicia con una aseguradora, retiro programado con el fondo, o mezcla de las dos',
          `Garantía de Pensión Mínima si llegás a ${REQUISITOS_RPM.semanasMinimas.toLocaleString('es-CO')} semanas y las edades de ley pero el capital no alcanza`,
          'Podés seguir cotizando después de la edad de ley para engordar la cuenta',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La proyección del fondo depende de una rentabilidad futura que nadie garantiza: cambiar el supuesto de rendimiento en dos puntos mueve el resultado en decenas de millones',
          'El traslado entre regímenes tiene ventana: no se puede en los últimos 10 años antes de cumplir la edad de pensión, y hay que pedir la doble asesoría obligatoria',
          'Si no alcanzás semanas ni capital, lo que recibís es la devolución de saldos, no una pensión',
        ],
        plazo: 'la doble asesoría (fondo y Colpensiones) es obligatoria antes de cualquier traslado y tiene vigencia limitada.',
      },
      {
        id: 'no-alcanzo',
        label: 'No voy a llegar a las semanas',
        hint: 'Indemnización sustitutiva o devolución de saldos',
        answer: 'Si cumplís la edad pero no las semanas, recuperás la plata: indemnización sustitutiva en Colpensiones, devolución de saldos en el fondo privado.',
        yes: [
          'En Colpensiones: indemnización sustitutiva = salario base semanal × semanas cotizadas × porcentaje promedio de cotización',
          'En un fondo privado: devolución de saldos, o sea todo tu capital más rendimientos y bono pensional',
          'Ambas se piden cumpliendo la edad de pensión y declarando que no vas a seguir cotizando',
          'También podés seguir cotizando hasta completar las semanas, si todavía te da el tiempo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Aceptar la indemnización sustitutiva cierra la puerta: renunciás al derecho de pensión por esas semanas, y volver atrás implica devolver lo recibido indexado',
          'La devolución de saldos del RAIS suele ser mucho más alta que la indemnización sustitutiva del RPM por el mismo tiempo cotizado: no son equivalentes',
          'Antes de resignarte, revisá que Colpensiones tenga todas tus semanas: los períodos de empleadores viejos que no reportaron se corrigen con un trámite de corrección de historia laboral',
        ],
        plazo: 'la indemnización sustitutiva no prescribe: se puede reclamar en cualquier momento después de cumplida la edad.',
      },
      {
        id: 'beps',
        label: 'Gano poco o trabajo por días: estoy en BEPS',
        hint: 'Beneficios Económicos Periódicos · no es pensión',
        answer: `BEPS no es una pensión: es un ahorro voluntario al que el Estado le suma un ${(BEPS_INCENTIVO * 100).toLocaleString('es-CO')}% al momento de redimirlo.`,
        yes: [
          `Incentivo del Estado: ${(BEPS_INCENTIVO * 100).toLocaleString('es-CO')}% de lo que ahorres, se acredita al redimir`,
          'Pensado para quien gana menos de un salario mínimo o trabaja de forma discontinua',
          'Se cobra como anualidad vitalicia bimestral, no como mesada mensual',
          'Las semanas cotizadas a pensión que no alcanzaron se pueden trasladar a BEPS y sumarse al ahorro',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La anualidad BEPS es SIEMPRE menor que un salario mínimo: por diseño, no puede competir con una pensión y no la reemplaza',
          'Hay un tope anual de ahorro y un requisito de ingresos: verificá las condiciones vigentes con Colpensiones antes de contar con un monto',
          'Si estás cerca de las semanas de pensión, pasarte a BEPS puede costarte mucho más de lo que ganás: primero corré la cuenta de cuánto te falta',
        ],
        plazo: 'el ahorro BEPS es voluntario y sin monto mínimo por depósito; el incentivo se liquida recién al redimir.',
      },
      {
        id: 'pensionado',
        label: 'Ya soy pensionado',
        hint: 'Reajuste anual de la mesada',
        answer: `Las mesadas por encima de 1 SMLMV suben el IPC del año anterior (${REAJUSTE.ipcPct.toLocaleString('es-CO')}%); las de 1 SMLMV suben con el salario mínimo.`,
        yes: [
          `Reajuste automático en la nómina de enero, sin ningún trámite`,
          `Mesada mayor a 1 SMLMV: sube el IPC certificado por el DANE (${REAJUSTE.ipcPct.toLocaleString('es-CO')}%)`,
          `Mesada de 1 SMLMV: sube lo mismo que el salario mínimo, que en general le gana al IPC`,
          `Piso absoluto: ninguna mesada puede quedar por debajo del SMLMV (${cop(SMLMV)})`,
        ],
        warn: [
          DISCLAIMER_TAX,
          `Al pensionado se le descuenta el ${(DESCUENTOS_PENSIONADO.saludPct * 100).toLocaleString('es-CO')}% de salud sobre la mesada y NADA de pensión: el aporte a pensión se termina al pensionarse`,
          'La mesada 14 se eliminó para quienes se pensionaron después del 31 de julio de 2011 (Acto Legislativo 01 de 2005): si te pensionaste después, son 13 mesadas',
          'Si la mesada supera los topes del art. 592 ET puede haber retención en la fuente y obligación de declarar renta, aunque la pensión esté exenta hasta 1.000 UVT mensuales',
        ],
        plazo: 'el reajuste corre desde la nómina de enero; si no aparece, se reclama ante la administradora sin límite de tiempo por las mesadas de los últimos 3 años.',
      },
    ],
  },

  inputsTitle: 'Tu historia de cotización',
  inputsIntro:
    'Los datos que pide tu administradora. El IBL sale del promedio de los últimos 10 años; si no lo tenés a mano, poné el salario sobre el que venís cotizando.',
  fields: [
    {
      id: 'ibl',
      label: 'IBL: promedio mensual cotizado en los últimos 10 años (COP)',
      prefix: '$',
      value: '3.500.000',
      thousands: true,
      help: 'El promedio de lo que cotizaste en la última década, actualizado por IPC. Es la base de la mesada, no tu último sueldo.',
    },
    {
      id: 'semanas',
      label: 'Semanas cotizadas hasta hoy',
      type: 'number',
      value: 1400,
      min: 0,
      max: 3000,
      step: 1,
      help: `Están en tu historia laboral de Colpensiones o en el extracto del fondo. El mínimo para pensionarse en el RPM son ${REQUISITOS_RPM.semanasMinimas.toLocaleString('es-CO')}.`,
    },
    {
      id: 'edad',
      label: 'Tu edad hoy',
      type: 'number',
      value: 58,
      min: 15,
      max: 100,
      step: 1,
      help: 'En años cumplidos.',
    },
    {
      id: 'sexo',
      label: 'Sexo (define la edad de pensión en el RPM)',
      type: 'select',
      value: 'mujer',
      options: [
        { value: 'mujer', label: `Mujer — se pensiona a los ${REQUISITOS_RPM.edadMujer}` },
        { value: 'hombre', label: `Hombre — se pensiona a los ${REQUISITOS_RPM.edadHombre}` },
      ],
      help: 'La diferencia de 5 años entre hombres y mujeres sigue vigente en la Ley 100.',
    },
    {
      id: 'capital',
      label: 'Capital acumulado en el fondo privado (COP)',
      prefix: '$',
      value: '180.000.000',
      thousands: true,
      help: 'Sólo para la rama RAIS: el saldo de tu cuenta individual más el bono pensional si lo tenés.',
    },
    {
      id: 'ahorroMensual',
      label: 'Cuánto ahorrás o cotizás por mes (COP)',
      prefix: '$',
      value: '400.000',
      thousands: true,
      help: 'Se usa para proyectar el fondo privado y el ahorro BEPS de acá hasta la edad de retiro.',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento anual esperado del fondo (%)',
      type: 'number',
      value: 6,
      min: 0,
      max: 20,
      step: 0.5,
      help: 'Supuesto tuyo, no una promesa del fondo. Probá con 4% y con 8% para ver cuánto cambia el resultado.',
    },
    {
      id: 'mesada',
      label: 'Tu mesada actual, si ya sos pensionado (COP)',
      prefix: '$',
      value: '2.400.000',
      thousands: true,
      help: 'La mesada del año pasado, para calcular el reajuste de este año.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'progress',
    title: 'Qué tan cerca estás de pensionarte',
    caption:
      'Mide tu avance contra los dos requisitos del Régimen de Prima Media: las semanas cotizadas y la edad. Sólo cuando las dos barras llegan al final nace el derecho: cumplir una sola no alcanza.',
  },
  breakdownTitle: 'Tu cuenta, requisito por requisito',
  breakdownIntro:
    'Primero los requisitos, después la tasa de reemplazo y la mesada, y al final los descuentos que se aplican sobre lo que efectivamente cobrás.',

  faq: [
    {
      q: '¿La reforma pensional ya cambió mis requisitos?',
      a: `No. La ${REFORMA.ley} fue SUSPENDIDA por la Corte Constitucional mediante el ${REFORMA.auto}, así que hoy rige la ${REFORMA.rige}: Régimen de Prima Media contra Régimen de Ahorro Individual, con los mismos requisitos de edad y semanas de siempre. El sistema de pilares (solidario, semicontributivo, contributivo y de ahorro voluntario) es un escenario futuro condicionado a que la Corte levante la suspensión y a lo que resuelva de fondo. Cualquier calculadora que te liquide "con la reforma" te está mostrando una hipótesis, no tu derecho.`,
    },
    {
      q: '¿Cuántas semanas necesito para pensionarme?',
      a: `${REQUISITOS_RPM.semanasMinimas.toLocaleString('es-CO')} semanas en el Régimen de Prima Media, unos 25 años de cotización. La edad es de ${REQUISITOS_RPM.edadMujer} años para las mujeres y ${REQUISITOS_RPM.edadHombre} para los hombres. Los dos requisitos son acumulativos: con 1.500 semanas pero 55 años todavía no te pensionás, y con 62 años y 1.100 semanas tampoco. En el RAIS no hay semanas mínimas para pensionarse por capital, pero sí las hay (las mismas 1.300) para acceder a la Garantía de Pensión Mínima si el capital no alcanza.`,
    },
    {
      q: '¿Cómo se calcula el porcentaje de la mesada en Colpensiones?',
      a: `Con la fórmula del art. 34 de la Ley 100, modificado por el art. 10 de la Ley 797 de 2003: la tasa de reemplazo es ${TASA_RPM.constante} menos ${TASA_RPM.factorIbl} por el IBL expresado en número de salarios mínimos. Si tu IBL equivale a 2 salarios mínimos, la tasa es ${TASA_RPM.constante} − ${TASA_RPM.factorIbl} × 2 = ${(TASA_RPM.constante - TASA_RPM.factorIbl * 2).toLocaleString('es-CO')}%. Esa tasa se aplica sobre las primeras ${REQUISITOS_RPM.semanasMinimas.toLocaleString('es-CO')} semanas, y por cada ${TASA_RPM.semanasPorBloque} semanas adicionales suma ${TASA_RPM.puntosPorBloque.toLocaleString('es-CO')} puntos, con tope del ${TASA_RPM.maximoPct}% y piso del ${TASA_RPM.minimoPct}%. Por eso el sistema es redistributivo: cuanto más alto el IBL, menor el porcentaje de reemplazo.`,
    },
    {
      q: '¿Qué es el IBL y por qué no es mi último sueldo?',
      a: 'El Ingreso Base de Liquidación es el promedio de lo que cotizaste en los últimos 10 años, actualizado año por año con el IPC. Se usa el promedio de toda la vida laboral si te resulta más favorable y tenés al menos 1.250 semanas. Que no sea el último sueldo es intencional: evita que alguien cotice sobre el mínimo durante 20 años y sobre 20 millones los últimos dos para pensionarse alto. Si hiciste eso, el promedio de diez años lo diluye casi todo.',
    },
    {
      q: '¿Me conviene Colpensiones o un fondo privado?',
      a: 'Como regla gruesa, a los ingresos bajos y medios les suele convenir Colpensiones, porque la fórmula redistributiva les da una tasa de reemplazo alta y una mesada garantizada de por vida. A los ingresos altos con carreras largas y estables les puede rendir más el RAIS, porque el capital acumulado no está sujeto a la fórmula decreciente. Pero es una decisión con demasiadas variables personales —densidad de cotización, expectativa de vida, bono pensional, tolerancia al riesgo— como para resolverla con una calculadora. La doble asesoría antes de un traslado es obligatoria justamente por eso.',
    },
    {
      q: '¿Hasta cuándo puedo trasladarme de régimen?',
      a: 'Hasta 10 años antes de cumplir la edad de pensión: 47 años para los hombres y 42 para las mujeres. Después de esa fecha la ventana se cierra definitivamente. Además hay que haber estado al menos 5 años en el régimen del que salís, y pasar por la doble asesoría, donde tanto el fondo como Colpensiones tienen que mostrarte por escrito la proyección de cada opción. Guardá esa asesoría: es la prueba si después reclamás por mala información.',
    },
    {
      q: '¿Qué pasa si cumplo la edad pero no las semanas?',
      a: 'No te quedás sin nada. En Colpensiones pedís la indemnización sustitutiva: el salario base semanal por las semanas cotizadas por el porcentaje promedio sobre el que cotizaste. En un fondo privado pedís la devolución de saldos, que es todo tu capital con sus rendimientos y el bono pensional. La devolución de saldos suele ser bastante más alta que la indemnización sustitutiva por el mismo tiempo. Antes de resignarte, pedí tu historia laboral: es muy común que falten semanas de empleadores viejos que nunca reportaron y que se recuperan con un trámite de corrección.',
    },
    {
      q: '¿La indemnización sustitutiva me cierra la puerta para siempre?',
      a: 'Sí respecto de esas semanas: al recibirla renunciás al derecho de pensión sobre el tiempo cotizado. Si después conseguís trabajo y querés volver a intentarlo, tenés que devolver lo recibido debidamente indexado. Por eso, si estás a pocas semanas del requisito, casi siempre conviene seguir cotizando —incluso como independiente sobre el mínimo— antes que cobrar la indemnización.',
    },
    {
      q: '¿Qué es BEPS y en qué se diferencia de una pensión?',
      a: `Los Beneficios Económicos Periódicos son un mecanismo de ahorro voluntario para quien gana menos de un salario mínimo o trabaja de forma discontinua. El Estado le suma un ${(BEPS_INCENTIVO * 100).toLocaleString('es-CO')}% a lo ahorrado al momento de redimirlo, y el resultado se paga como una anualidad vitalicia bimestral. La diferencia clave: BEPS no es pensión y su pago es, por diseño, menor a un salario mínimo. Es un piso de ingreso para quien no llegaba a nada, no un sustituto de cotizar.`,
    },
    {
      q: '¿Cuánto sube mi mesada cada año?',
      a: `Depende de cuánto cobres. Las mesadas superiores a 1 SMLMV suben con el IPC certificado por el DANE para el año anterior, que fue del ${REAJUSTE.ipcPct.toLocaleString('es-CO')}%. Las mesadas equivalentes a 1 SMLMV suben con el salario mínimo, que en los últimos años ha subido bastante más que la inflación. Y hay un piso absoluto: ninguna mesada puede quedar por debajo del salario mínimo vigente, hoy ${cop(SMLMV)}. El ajuste es automático desde la nómina de enero y no requiere trámite.`,
    },
    {
      q: '¿Qué me descuentan de la mesada?',
      a: `El ${(DESCUENTOS_PENSIONADO.saludPct * 100).toLocaleString('es-CO')}% de salud, y nada más por concepto de seguridad social: el pensionado deja de aportar a pensión, porque ya está pensionado. Es un error frecuente de las calculadoras restar también un 4% de pensión o un 10% de salud. Aparte, si la mesada es alta puede haber retención en la fuente: las pensiones están exentas de renta hasta 1.000 UVT mensuales, y sólo tributa el excedente.`,
    },
    {
      q: '¿Cobro 13 o 14 mesadas?',
      a: 'Trece, si te pensionaste después del 31 de julio de 2011. El Acto Legislativo 01 de 2005 eliminó la mesada 14 y dejó un régimen de transición para quienes se pensionaron antes de esa fecha con mesadas de hasta 3 salarios mínimos, que sí conservan las 14. La mesada 13 se paga en diciembre y es un derecho de todos los pensionados.',
    },
  ],

  sources: [
    {
      name: 'Ley 100 de 1993 — Sistema General de Pensiones',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0100_1993.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 797 de 2003, art. 10 — tasa de reemplazo y requisitos de la pensión de vejez',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0797_2003.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Corte Constitucional — comunicados y autos sobre la Ley 2381 de 2024 (reforma pensional)',
      url: 'https://www.corteconstitucional.gov.co/',
      publisher: 'Corte Constitucional de Colombia',
      date: '2025',
    },
    {
      name: 'Colpensiones — requisitos de la pensión de vejez e indemnización sustitutiva',
      url: 'https://www.colpensiones.gov.co/',
      publisher: 'Colpensiones',
    },
    {
      name: 'Colpensiones — Beneficios Económicos Periódicos (BEPS)',
      url: 'https://www.beps.gov.co/',
      publisher: 'Colpensiones',
    },
    {
      name: 'Acto Legislativo 01 de 2005 — eliminación de la mesada 14',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Actos_Legislativos/1687975',
      publisher: 'SUIN-Juriscol',
    },
    {
      name: 'Superintendencia Financiera — información de los fondos de pensiones obligatorias',
      url: 'https://www.superfinanciera.gov.co/',
      publisher: 'Superintendencia Financiera de Colombia',
    },
  ],

  replaces: [
    '/co/calculadora-pension-colombia-2026-edad-semanas-cotizadas',
    '/co/calculadora-pension-rais-vs-prima-media-colombia',
    '/co/calculadora-reforma-pensional-colombia-2025-pilares-ahorro',
    '/co/calculadora-beps-colpensiones-colombia-2026',
    '/co/calculadora-indemnizacion-sustitutiva-colpensiones-colombia-2026',
    '/co/calculadora-aumento-mesada-pensional-colombia-2026-ipc',
    '/co/calculadora-fopep-pension-publica-colombia-cuantia',
  ],

  lastReviewed: '2026-07-28',
};
