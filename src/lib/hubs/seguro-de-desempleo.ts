import type { HubData } from './types';
import {
  DESEMPLEO_ANSES_URL, DESEMPLEO_PISO, DESEMPLEO_TECHO, SMVM_MENSUAL, SMVM_FECHA, SMVM_NORMAS, SMVM_ULTIMA_REVISION,
} from '../data/smvm-ar-2026';

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
 *    fuente única que también usan las fórmulas del repo. Rige el 50% y el 100%
 *    del SMVM del período (art. 2 de la Resolución 4/2026).
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
    'En el régimen general, la cuota inicial es el 75% de tu mejor remuneración neta de los últimos 6 meses, con un piso y un techo. La duración depende de tus aportes.',
  stamps: [
    `Topes de ${SMVM_FECHA}`,
    `Piso $${DESEMPLEO_PISO.toLocaleString('es-AR')} · techo $${DESEMPLEO_TECHO.toLocaleString('es-AR')} (ANSES)`,
    'Ley 24.013 · 3 calculadoras adentro',
  ],

  resultLabel: 'Cuota inicial estimada',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'prestacion',
        label: 'Prestación por desempleo (régimen general)',
        hint: 'El caso más común',
        answer: 'La cuota inicial es el 75% de tu mejor remuneración neta, con un piso y un techo fijados por el Consejo del Salario.',
        yes: [
          'Base inicial: el 75% de la mejor remuneración mensual neta, normal y habitual de los últimos 6 meses antes del cese',
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
        answer: 'El fondo de cese y la prestación por desempleo son distintos. La prestación tiene requisitos propios y puede durar hasta 8 meses.',
        yes: [
          'El fondo de cese laboral es tuyo: el empleador aporta 12% del sueldo el primer año y 8% desde el segundo (Ley 22.250)',
          'Se cobra siempre, cualquiera sea el motivo del cese, incluso si renunciás',
          'Además existe la prestación por desempleo específica de la construcción (Ley 25.371)',
          'La Ley 25.371 prevé 3 cuotas con 8 a 11 meses de aportes, 4 con 12 a 17 y 8 con 18 a 24, dentro de los últimos dos años',
          'Se pide con la Libreta de Aportes al Fondo de Cese Laboral al día',
        ],
        warn: [
          'En la construcción no hay indemnización por antigüedad: el fondo de cese la reemplaza',
          'La prestación de la Ley 25.371 se topea en 8 meses, no llega a los 12 del régimen general',
          'Si el empleador no depositó los aportes, el fondo figura incompleto: se reclama con la libreta como prueba',
          'Consultá el saldo del fondo de cese en tu cuenta y el monto de la prestación en ANSES',
        ],
        plazo: 'el fondo se retira desde las 48 horas del cese; la prestación, dentro de los 90 días.',
      },
      {
        id: 'embargo',
        label: 'Me están embargando el sueldo',
        hint: 'Art. 120 LCT · Decreto 484/87',
        answer: 'Hasta un salario mínimo tu sueldo es inembargable; sobre el excedente van 10% o 20%.',
        yes: [
          `El sueldo bruto en dinero hasta 1 SMVM ($${SMVM_MENSUAL.toLocaleString('es-AR')}) es inembargable por deudas comunes (art. 120 LCT)`,
          'Entre 1 y 2 SMVM se puede retener el 10% de lo que exceda el mínimo',
          'Por encima de 2 SMVM se puede retener el 20% del excedente',
          'La justicia fija la retención por alimentos o litis expensas según el caso',
          'Para deudas comunes, la base de cálculo es la remuneración bruta en dinero',
        ],
        warn: [
          'El aguinaldo también se embarga con los mismos porcentajes',
          'Si te retienen más de lo que permite el decreto 484/87, se plantea ante el juzgado que ordenó el embargo',
          'La indemnización por despido tiene protección propia: no se embarga como sueldo común',
          'En alimentos y litis expensas, el monto lo fija el juzgado de modo que permita la subsistencia del alimentante',
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
      label: 'Mejor remuneración mensual neta de los últimos 6 meses',
      prefix: '$',
      value: '900.000',
      thousands: true,
      help: 'Usá el importe neto del mejor mes anterior al cese.',
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
      a: `La cuota inicial del régimen general es el 75% de la mejor remuneración mensual neta, normal y habitual de los seis meses anteriores al cese. En ${SMVM_FECHA}, el piso es $${DESEMPLEO_PISO.toLocaleString('es-AR')} y el techo $${DESEMPLEO_TECHO.toLocaleString('es-AR')}.`,
    },
    {
      q: '¿Cuántos meses dura la prestación por desempleo?',
      a: 'Para trabajadores permanentes se cuentan los aportes de los últimos tres años: 6 a 11 meses dan 2 cuotas, 12 a 23 dan 4, 24 a 35 dan 8 y 36 dan 12. ANSES contempla una prórroga por edad desde los 45 años.',
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
      a: `Por deudas comunes, la remuneración bruta en dinero hasta 1 salario mínimo ($${SMVM_MENSUAL.toLocaleString('es-AR')}) es inembargable. Sobre lo que exceda ese piso se retiene el 10% si el sueldo está entre 1 y 2 salarios mínimos, y el 20% si lo supera. Así lo fija el decreto 484/87 junto con el art. 120 de la LCT.`,
    },
    {
      q: '¿Y si el embargo es por cuota alimentaria?',
      a: 'Alimentos y litis expensas tienen un régimen especial. El juzgado fija el importe de modo que permita la subsistencia del alimentante (art. 4 del Decreto 484/87).',
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
      name: 'Resolución 4/2026, artículo 2 — importe y límites de la prestación general',
      url: SMVM_NORMAS['4/2026'].url,
      publisher: 'Consejo del Salario',
      date: SMVM_NORMAS['4/2026'].publicada,
    },
    {
      name: 'Decreto 267/2006 — duración y prórroga de la prestación por desempleo',
      url: 'https://www.argentina.gob.ar/normativa/nacional/decreto-267-2006-114578/texto',
      publisher: 'InfoLeg',
      date: '2006',
    },
    {
      name: 'ANSES — Prestación por desempleo: requisitos, montos y trámite',
      url: DESEMPLEO_ANSES_URL,
      publisher: 'ANSES',
    },
    {
      name: 'Ley 22.250 — Régimen laboral de la industria de la construcción (fondo de cese laboral)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/50000-54999/54339/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Ley 25.371 — Sistema Integrado de Prestaciones por Desempleo para los trabajadores de la construcción',
      url: 'https://www.argentina.gob.ar/normativa/nacional/norma-65583/texto',
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
      url: 'https://www.argentina.gob.ar/normativa/nacional/decreto-484-1987-77255/texto',
      publisher: 'InfoLeg',
      date: '1987',
    },
  ],

  replaces: [
    '/calculadora-fondo-desempleo-anses-monto-tiempo',
    '/calculadora-asignacion-desempleo-seguro-prestacion-anses',
    '/calculadora-embargo-sueldo-porcentaje-maximo',
  ],

  lastReviewed: SMVM_ULTIMA_REVISION,
  audience: 'AR',
};

/**
 * Constantes del cálculo. Piso y techo vienen de la fuente única del repo
 * (src/lib/data/smvm-ar-2026.ts), igual que las fórmulas que este hub absorbe.
 */
export const DESEMPLEO = {
  /** 75% de la mejor remuneración mensual neta de los últimos 6 meses (Resolución 4/2026). */
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

/** Embargo — Decreto 484/87 sobre la remuneración bruta en dinero. */
export const EMBARGO = {
  /** Hasta 1 SMVM: inembargable. */
  tramo1: 0.1, // entre 1 y 2 SMVM: 10% del excedente
  tramo2: 0.2, // más de 2 SMVM: 20% del excedente
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
