import type { HubData } from './types';
import { DESEMPLEO_PISO, DESEMPLEO_TECHO, SMVM_MENSUAL } from '../data/smvm-ar-2026';

/**
 * Hub de decisión — "Me quedé sin trabajo: ¿qué me paga ANSES?"
 * Arquetipo RAMIFICADO: la respuesta cambia según el régimen (general, UOCRA)
 * o según el problema real de la persona (le están embargando el sueldo).
 *
 * Absorbe 3 calculadoras: fondo de desempleo ANSES (monto y tiempo),
 * asignación por desempleo / prestación ANSES y embargo de sueldo.
 *
 * NOTAS DE CONTRATO:
 *  - El piso y el techo de la prestación NO se escriben acá: se importan de
 *    src/lib/data/smvm-ar-2026.ts (DESEMPLEO_PISO / DESEMPLEO_TECHO), que es la
 *    fuente única que también usan las fórmulas del repo. ANSES los mueve con
 *    ~1 mes de rezago respecto del SMVM: no reemplazar por SMVM_MENSUAL.
 *  - Las filas de plata van sin `format` (default 'ars'); las de meses y
 *    porcentaje declaran `format: 'unit'` — sin eso el runtime las pinta en $.
 */
export const hub: HubData = {
  slug: 'trabajo/seguro-de-desempleo',
  title: 'Seguro de desempleo ANSES 2026: cuánto y cuántos meses cobrás',
  description:
    'Calculá la prestación por desempleo de ANSES: 75% de tu mejor remuneración, con piso y techo vigentes y la duración según tus meses de aportes. Incluye el régimen de la construcción (UOCRA) y cuánto te pueden embargar del sueldo.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación laboral',
  h1: 'Me quedé sin trabajo: ¿qué me paga ANSES?',
  lede:
    'La prestación por desempleo es el 75% de tu mejor remuneración de los últimos 6 meses, acotada entre un piso y un techo, y dura entre 2 y 12 meses según cuánto aportaste. Partimos del régimen general y lo ajustás a tu caso.',
  stamps: [
    'Actualizado 27-07-2026',
    `Piso $${DESEMPLEO_PISO.toLocaleString('es-AR')} · techo $${DESEMPLEO_TECHO.toLocaleString('es-AR')} (ANSES)`,
    'Ley 24.013 · 3 calculadoras adentro',
  ],

  resultLabel: 'Cuota mensual estimada',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'prestacion',
        label: 'Prestación por desempleo (régimen general)',
        hint: 'El caso más común',
        answer: 'Cobrás el 75% de tu mejor remuneración, entre el piso y el techo que fija ANSES.',
        yes: [
          'Base: el 75% del promedio de las mejores remuneraciones netas de los últimos 6 meses',
          `La cuota nunca baja del piso ($${DESEMPLEO_PISO.toLocaleString('es-AR')}) ni supera el techo ($${DESEMPLEO_TECHO.toLocaleString('es-AR')})`,
          'Duración: 2 meses con 6 a 11 meses de aportes, 4 con 12 a 23, 8 con 24 a 35 y 12 con 36 o más',
          'Mientras cobrás seguís sumando antigüedad previsional y mantenés la obra social',
          'Se pide con despido sin justa causa, fin de contrato a plazo o quiebra del empleador',
        ],
        warn: [
          'Con menos de 6 meses de aportes en los últimos 3 años no corresponde la prestación',
          'Si renunciaste o te fuiste por mutuo acuerdo (art. 241 LCT) no te corresponde',
          'Hay que pedirla dentro de los 90 días del cese: después de ese plazo se descuenta un día de prestación por cada día de demora',
          'No se puede cobrar junto con una jubilación, una pensión no contributiva ni un trabajo registrado',
        ],
        plazo: 'tenés 90 días corridos desde el cese para pedirla sin perder cuotas.',
      },
      {
        id: 'uocra',
        label: 'Fondo de desempleo de la construcción (UOCRA)',
        hint: 'Ley 22.250 y Ley 25.371',
        answer: 'Retirás tu fondo de cese laboral y además cobrás una prestación de hasta 8 meses.',
        yes: [
          'El fondo de cese laboral es tuyo: el empleador aporta 12% del sueldo el primer año y 8% desde el segundo (Ley 22.250)',
          'Se cobra siempre, cualquiera sea el motivo del cese, incluso si renunciás',
          'Además existe la prestación por desempleo específica de la construcción (Ley 25.371)',
          'La cuota se calcula igual que en el régimen general: 75% de la mejor remuneración, con el mismo piso y techo',
          'Se pide con la Libreta de Aportes al Fondo de Cese Laboral al día',
        ],
        warn: [
          'En la construcción no hay indemnización por antigüedad: el fondo de cese la reemplaza',
          'La prestación de la Ley 25.371 se topea en 8 meses, no llega a los 12 del régimen general',
          'Si el empleador no depositó los aportes, el fondo figura incompleto: se reclama con la libreta como prueba',
          'El fondo acumulado que estimamos supone un sueldo estable: en la práctica cada depósito sigue al sueldo de ese mes',
        ],
        plazo: 'el fondo se retira desde las 48 horas del cese; la prestación, dentro de los 90 días.',
      },
      {
        id: 'embargo',
        label: 'Me están embargando el sueldo',
        hint: 'Art. 120 LCT · Decreto 484/87',
        answer: 'Hasta un salario mínimo tu sueldo es inembargable; sobre el excedente van 10% o 20%.',
        yes: [
          `El sueldo neto hasta 1 SMVM ($${SMVM_MENSUAL.toLocaleString('es-AR')}) es inembargable por deudas comunes (art. 120 LCT)`,
          'Entre 1 y 2 SMVM se puede retener el 10% de lo que exceda el mínimo',
          'Por encima de 2 SMVM se puede retener el 20% del excedente',
          'Por cuota alimentaria el tope es distinto: hasta el 33% del neto, y no rige el mínimo inembargable',
          'El porcentaje se calcula sobre el sueldo NETO, después de aportes',
        ],
        warn: [
          'El aguinaldo también se embarga con los mismos porcentajes',
          'Si te retienen más de lo que permite el decreto 484/87, se plantea ante el juzgado que ordenó el embargo',
          'La indemnización por despido tiene protección propia: no se embarga como sueldo común',
          'El monto exacto por alimentos lo fija el juez según las necesidades del alimentado: el 33% es el tope, no la regla',
        ],
        plazo: 'el embargo se levanta cuando se cancela la deuda o el juzgado lo ordena.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'sueldo',
      label: 'Mejor remuneración bruta de los últimos 6 meses',
      prefix: '$',
      value: '900.000',
      thousands: true,
      help: 'El mejor mes, no el promedio de todos.',
    },
    {
      id: 'meses',
      label: 'Meses con aportes en los últimos 3 años',
      type: 'number',
      min: 0,
      max: 36,
      value: 24,
      help: 'Con menos de 6 no corresponde la prestación.',
    },
    {
      id: 'cobrados',
      label: 'Cuotas de prestación que ya cobraste',
      type: 'number',
      min: 0,
      max: 12,
      value: 3,
    },
    {
      id: 'neto',
      label: 'Sueldo neto en mano (solo para embargo)',
      prefix: '$',
      value: '750.000',
      thousands: true,
      help: 'Lo que te queda después de los aportes.',
    },
    {
      id: 'deuda',
      label: 'Tipo de deuda embargada (solo para embargo)',
      type: 'select',
      value: 'comun',
      options: [
        { value: 'comun', label: 'Deuda común (banco, tarjeta, comercio)' },
        { value: 'alimentaria', label: 'Cuota alimentaria' },
      ],
    },
  ],
  fineprint:
    'Es una orientación. ANSES actualiza el piso y el techo por resolución y el monto definitivo sale de las remuneraciones declaradas en tu historia laboral.',

  chart: {
    type: 'timeline',
    title: 'Cuántos meses de prestación te corresponden',
    caption:
      'La duración de la prestación depende de los meses aportados: 2 cuotas con 6 a 11 meses, 4 con 12 a 23, 8 con 24 a 35 y 12 con 36 o más. La barra muestra cuántas cuotas ya cobraste y cuántas te quedan. En la rama de embargo la barra pasa a mostrar qué parte de tu sueldo queda protegida y qué parte es embargable.',
  },
  breakdownTitle: 'Cómo se arma el número',
  breakdownIntro: 'Los montos están en pesos; los meses y porcentajes traen su propia unidad.',

  faq: [
    {
      q: '¿Cuánto se cobra de seguro de desempleo en 2026?',
      a: `La cuota es el 75% del promedio de las mejores remuneraciones netas de los últimos 6 meses, pero nunca baja de $${DESEMPLEO_PISO.toLocaleString('es-AR')} ni supera $${DESEMPLEO_TECHO.toLocaleString('es-AR')}. Como el techo es bajo, la mayoría de los sueldos formales cobra directamente el máximo.`,
    },
    {
      q: '¿Cuántos meses dura la prestación por desempleo?',
      a: 'Depende de tus aportes en los últimos 3 años: con 6 a 11 meses cobrás 2 cuotas, con 12 a 23 cobrás 4, con 24 a 35 cobrás 8 y con 36 meses o más llegás al máximo de 12 cuotas. Con menos de 6 meses de aportes no corresponde.',
    },
    {
      q: '¿Quién puede cobrar el seguro de desempleo de ANSES?',
      a: 'Trabajadores registrados despedidos sin justa causa, con contrato a plazo vencido, con cese por quiebra o cierre del empleador, o despedidos por fuerza mayor. Quedan afuera quienes renunciaron, los del servicio doméstico, los del sector público y los monotributistas.',
    },
    {
      q: 'Renuncié a mi trabajo, ¿me corresponde algo?',
      a: 'La prestación por desempleo no, porque la ley 24.013 la reserva para ceses ajenos a la voluntad del trabajador. Sí te corresponde siempre la liquidación final: días trabajados, vacaciones proporcionales y SAC proporcional. En la construcción, además, el fondo de cese se cobra aunque renuncies.',
    },
    {
      q: '¿En cuánto tiempo tengo que pedir la prestación?',
      a: 'Dentro de los 90 días corridos desde el cese. Pasado ese plazo la seguís pudiendo pedir, pero se te descuenta un día de prestación por cada día de demora, así que cada semana perdida es plata que no vuelve.',
    },
    {
      q: '¿El seguro de desempleo se cobra junto con otro ingreso?',
      a: 'No es compatible con un trabajo registrado, con la jubilación ni con una pensión no contributiva. Sí es compatible con la Asignación Universal por Hijo en los casos previstos y con las asignaciones familiares, que se pagan mientras dure la prestación.',
    },
    {
      q: '¿Cómo funciona el fondo de desempleo de la construcción?',
      a: 'En la construcción rige la ley 22.250: el empleador deposita mensualmente el 12% del sueldo durante el primer año y el 8% a partir del segundo en la libreta de fondo de cese. Esa plata es del trabajador y se retira al terminar la obra o el vínculo, cualquiera sea el motivo. Reemplaza a la indemnización por antigüedad.',
    },
    {
      q: '¿Cuánto me pueden embargar del sueldo?',
      a: `Por deudas comunes, el sueldo neto hasta 1 salario mínimo ($${SMVM_MENSUAL.toLocaleString('es-AR')}) es inembargable. Sobre lo que exceda ese piso se retiene el 10% si el sueldo está entre 1 y 2 salarios mínimos, y el 20% si lo supera. Así lo fija el decreto 484/87 junto con el art. 120 de la LCT.`,
    },
    {
      q: '¿Y si el embargo es por cuota alimentaria?',
      a: 'Ahí no rige el mínimo inembargable: el tope es de hasta el 33% del sueldo neto, y el juez fija el monto concreto según las necesidades del alimentado. Es la única deuda que puede llegar a ese porcentaje.',
    },
    {
      q: '¿Me pueden embargar el aguinaldo o la indemnización?',
      a: 'El aguinaldo sí, con los mismos porcentajes del decreto 484/87, porque es remuneración. La indemnización por despido tiene protección propia y no se embarga como sueldo común: si te la retuvieron, se reclama ante el juzgado que dictó la medida.',
    },
    {
      q: '¿Cobro asignaciones familiares mientras estoy desocupado?',
      a: 'Sí. Mientras percibís la prestación por desempleo mantenés el derecho a las asignaciones familiares y a la cobertura de obra social, y el período computa como tiempo de servicio para la futura jubilación.',
    },
  ],

  sources: [
    {
      name: 'Ley 24.013 — Ley Nacional de Empleo, Título IV: prestación por desempleo (arts. 111 a 129)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/412/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto actualizado',
    },
    {
      name: 'Decreto 267/2006 — cuantía de la prestación por desempleo',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/110000-114999/114325/norma.htm',
      publisher: 'InfoLeg',
      date: '2006',
    },
    {
      name: 'ANSES — Prestación por desempleo: requisitos, montos y trámite',
      url: 'https://www.anses.gob.ar/prestacion-por-desempleo',
      publisher: 'ANSES',
    },
    {
      name: 'Ley 22.250 — Régimen laboral de la industria de la construcción (fondo de cese laboral)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/50000-54999/54339/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Ley 25.371 — Sistema Integrado de Prestaciones por Desempleo para los trabajadores de la construcción',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/65000-69999/65596/norma.htm',
      publisher: 'InfoLeg',
      date: '2000',
    },
    {
      name: 'Ley de Contrato de Trabajo 20.744, art. 120 — inembargabilidad del salario mínimo',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Decreto 484/87 — porcentajes máximos de embargo sobre remuneraciones',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/20000-24999/24387/norma.htm',
      publisher: 'InfoLeg',
      date: '1987',
    },
  ],

  replaces: [
    '/calculadora-fondo-desempleo-anses-monto-tiempo',
    '/calculadora-asignacion-desempleo-seguro-prestacion-anses',
    '/calculadora-embargo-sueldo-porcentaje-maximo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Constantes del cálculo. Piso y techo vienen de la fuente única del repo
 * (src/lib/data/smvm-ar-2026.ts), igual que las fórmulas que este hub absorbe.
 */
export const DESEMPLEO = {
  /** 75% del promedio de las mejores 6 remuneraciones (Decreto 267/2006). */
  porcentaje: 0.75,
  piso: DESEMPLEO_PISO,
  techo: DESEMPLEO_TECHO,
  /** Escalones de duración por meses aportados en los últimos 3 años (Ley 24.013 art. 117). */
  escalones: [
    { desde: 36, meses: 12 },
    { desde: 24, meses: 8 },
    { desde: 12, meses: 4 },
    { desde: 6, meses: 2 },
  ],
  /** Tope de cuotas del régimen de la construcción (Ley 25.371). */
  topeUocra: 8,
};

/** Salario mínimo vigente: es el mínimo inembargable del art. 120 LCT. */
export const SMVM = SMVM_MENSUAL;

/** Embargo — Decreto 484/87 sobre el sueldo NETO. */
export const EMBARGO = {
  /** Hasta 1 SMVM: inembargable. */
  tramo1: 0.1, // entre 1 y 2 SMVM: 10% del excedente
  tramo2: 0.2, // más de 2 SMVM: 20% del excedente
  alimentaria: 0.33, // tope por cuota alimentaria, sobre el neto total
};

/** Fondo de cese laboral de la construcción (Ley 22.250 art. 15). */
export const FONDO_CESE = {
  primerAnio: 0.12,
  siguientes: 0.08,
};

/** Parámetros propios de cada rama. */
export const CASE_MATH: Record<string, { norma: string; tope: number | null; fondo: boolean }> = {
  prestacion: { norma: 'Ley 24.013', tope: null, fondo: false },
  uocra: { norma: 'Ley 25.371', tope: DESEMPLEO.topeUocra, fondo: true },
  embargo: { norma: 'Dto. 484/87', tope: null, fondo: false },
};
