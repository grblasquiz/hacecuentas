import type { HubData } from './types';
import { jubilacionMinima } from '../formulas/jubilacion-minima';

/**
 * Hub de decisión — "¿Me corresponde una pensión?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cuatro ramas con monto propio: pensión por
 * fallecimiento del cónyuge (derivada, contributiva), PNC por invalidez, PNC
 * madre de 7 o más hijos y PUAM.
 *
 * DESLINDE con el hub hermano /jubilacion/cuando-me-jubilo:
 *  · aquel responde "¿cuándo me jubilo?" — edad + 30 años de aportes, y usa la
 *    PUAM como salida de quien NO llega a los aportes.
 *  · este responde "¿me corresponde una prestación SIN haberme jubilado?" —
 *    pensiones derivadas y no contributivas. La PUAM aparece en los dos porque
 *    es literalmente la bisagra entre ambas preguntas, pero acá se la mira como
 *    prestación (cuánto paga, con qué requisitos) y no como fecha.
 *
 * DE DÓNDE SALEN LOS NÚMEROS — FUENTE ÚNICA:
 *  · HABER MÍNIMO: se lee llamando a `jubilacionMinima()`, exactamente la misma
 *    fuente que usa el hub /jubilacion/cuando-me-jubilo. No se hardcodea acá.
 *    Cuando ANSES mueve el mínimo y se actualiza esa constante, los dos hubs
 *    cambian juntos y no se pueden contradecir.
 *  · Porcentajes de pensión por fallecimiento: Ley 24.241 art. 98 (70% / 50% +
 *    20% por hijo, con prorrateo al 100%), espejo de
 *    src/lib/formulas/pension-viudez-porcentaje-conyuge.ts
 *  · PNC invalidez = 70% del haber mínimo (Decreto 432/97), espejo de
 *    src/lib/formulas/pension-invalidez-anses-no-contributiva-2026-cuantia.ts
 *    y src/lib/formulas/asignacion-discapacidad-pensionado.ts
 *  · PNC madre de 7 hijos = 100% del haber mínimo (Ley 23.746), espejo de
 *    src/lib/formulas/pnc-madre-7-hijos.ts
 *  · PUAM = 80% del haber mínimo (Ley 27.260 art. 13), espejo de
 *    src/lib/formulas/puam-pension-universal-adulto-mayor-anses-2026.ts
 */

/** Porcentajes del haber mínimo que paga cada prestación. */
export const PRESTACIONES = {
  /** Ley 27.260 art. 13. */
  puamFactor: 0.8,
  /** Decreto 432/97 — PNC por invalidez. */
  invalidezFactor: 0.7,
  /** Ley 23.746 — PNC madre de 7 o más hijos: 100% del haber mínimo. */
  madre7Factor: 1,
  /** Ley 24.241 art. 98 — cónyuge sin hijos con derecho. */
  viudezSinHijos: 70,
  /** Ley 24.241 art. 98 — cónyuge en concurrencia con hijos. */
  viudezConHijos: 50,
  /** Ley 24.241 art. 98 inc. c — por cada hijo con derecho. */
  viudezPorHijo: 20,
  /** Edad de la PUAM (ambos sexos). */
  puamEdad: 65,
  /** PNC invalidez: rango etario y grado mínimo certificado. */
  invalidezEdadMin: 18,
  invalidezEdadMax: 64,
  invalidezGradoMin: 76,
  /** Ley 23.746: cantidad de hijos nacidos vivos exigida. */
  madre7Hijos: 7,
};

/** Haber mínimo vigente, leído de la fórmula real (no hardcodeado). */
const _minima = jubilacionMinima({ tieneBono: 'no' });
export const HABER_MINIMO = Math.round(_minima.haberMinimo);
export const PUAM = Math.round(HABER_MINIMO * PRESTACIONES.puamFactor);
export const PNC_INVALIDEZ = Math.round(HABER_MINIMO * PRESTACIONES.invalidezFactor);
export const PNC_MADRE7 = Math.round(HABER_MINIMO * PRESTACIONES.madre7Factor);

/** Constantes que viajan al <script> de la página. */
export const CASE_MATH = PRESTACIONES;

const fmtArs = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

/** Texto del disclaimer YMYL (getCalculatorDisclaimer, dominio 'general'). */
const DISCLAIMER =
  'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.';

export const hub: HubData = {
  slug: 'jubilacion/pensiones',
  title: '¿Me corresponde una pensión? — Viudez, invalidez, PUAM y PNC madre de 7 hijos',
  description:
    'Cuál de las pensiones de ANSES te puede corresponder y cuánto paga cada una: pensión por fallecimiento del cónyuge, PNC por invalidez, PUAM a los 65 y PNC para madres de 7 o más hijos.',
  silo: 'Jubilación',
  siloHref: '/jubilacion',

  eyebrow: 'Guía previsional ANSES',
  h1: '¿Me corresponde una pensión?',
  lede:
    'No hace falta estar jubilado para cobrar de ANSES. Hay cuatro caminos distintos y cada uno paga un porcentaje distinto del haber mínimo: la pensión por fallecimiento del cónyuge (que sale del haber del que falleció), la pensión no contributiva por invalidez, la PUAM a los 65 años y la PNC para madres de 7 o más hijos. Elegí tu situación y mirá cuánto es.',
  stamps: [
    `Haber mínimo ${fmtArs(HABER_MINIMO)}`,
    `PNC invalidez ${fmtArs(PNC_INVALIDEZ)} (70%)`,
    `PUAM ${fmtArs(PUAM)} (80%)`,
    `PNC madre de 7 hijos ${fmtArs(PNC_MADRE7)} (100%)`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Prestación mensual estimada',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos del caso más consultado: falleció el cónyuge y hay que saber qué parte del haber queda. Si tu caso es otro, cambialo: los requisitos y el monto son completamente distintos.',
    items: [
      {
        id: 'viudez',
        label: 'Falleció mi cónyuge o conviviente',
        hint: 'Pensión derivada, la más consultada',
        answer:
          'El cónyuge cobra el 70% del haber del que falleció si no hay hijos con derecho, y el 50% si los hay.',
        yes: [
          'El porcentaje del haber del causante que te corresponde (70% o 50%)',
          'El 20% adicional por cada hijo con derecho a pensión',
          'El prorrateo cuando la suma de todas las pensiones supera el 100% del haber',
          'Cuánto queda para vos y cuánto para el grupo familiar completo',
        ],
        warn: [
          DISCLAIMER,
          'Se exige convivencia: 5 años, o 2 si hay hijos reconocidos por ambos. El conviviente sin papeles tiene que probar la unión, y es donde más trámites se caen',
          'Si el causante estaba separado de hecho o divorciado, la pensión puede repartirse entre el cónyuge supérstite y el ex cónyuge que percibía alimentos',
          'La pensión derivada existe porque el causante era jubilado o aportante regular. La PUAM, en cambio, NO genera pensión derivada: si el fallecido cobraba PUAM, no queda pensión para el cónyuge',
        ],
        plazo:
          'se paga desde el día del fallecimiento si se inicia dentro del año; iniciado después, rige desde la fecha de la solicitud. No dejes pasar los 12 meses.',
      },
      {
        id: 'invalidez',
        label: 'Tengo una invalidez certificada y no puedo trabajar',
        hint: 'PNC por invalidez — 70% del mínimo',
        answer:
          'La pensión no contributiva por invalidez paga el 70% del haber mínimo e incluye PAMI, sin exigir años de aportes.',
        yes: [
          'El monto: el 70% del haber mínimo vigente',
          'Si el grado de invalidez certificado alcanza el umbral que exige ANDIS',
          'Si la edad entra en el rango de la prestación (18 a 64 años)',
          'Qué pasa a los 65: la prestación se convierte en PUAM',
        ],
        warn: [
          DISCLAIMER,
          'Requiere Certificado Médico Oficial y evaluación de junta médica: el grado de invalidez lo determina ANDIS, no vos ni esta página',
          'Es incompatible con cobrar otra jubilación o pensión, y con ingresos propios o del grupo familiar por encima del tope de vulnerabilidad',
          'Tener obra social o prepaga propia juega en contra del requisito de vulnerabilidad; la PNC ya trae PAMI incluido',
        ],
        plazo:
          'a los 65 años la PNC por invalidez se transforma en PUAM (80% del mínimo, o sea que sube): no hay que dejar de cobrar en el medio, se gestiona en ANSES.',
      },
      {
        id: 'madre7',
        label: 'Soy madre de 7 o más hijos',
        hint: 'PNC Ley 23.746 — 100% del mínimo',
        answer:
          'La madre de 7 o más hijos nacidos vivos cobra el 100% del haber mínimo, con aguinaldo y sin exigir edad ni aportes.',
        yes: [
          'El monto mensual: el haber mínimo completo',
          'El total anual con los dos medios aguinaldos (13 pagos)',
          'Cuántos hijos te faltan si todavía no llegás a 7',
          'Si el otro ingreso que declarás rompe la compatibilidad',
        ],
        warn: [
          DISCLAIMER,
          'Cuentan los hijos nacidos vivos, incluidos los que fallecieron, y los adoptados: no es la cantidad de hijos que conviven hoy',
          'Es incompatible con percibir otro ingreso, jubilación o pensión igual o mayor al haber mínimo',
          'Es la única PNC que no exige edad mínima ni aportes, pero sí acreditar con partidas de nacimiento cada uno de los hijos',
        ],
        plazo:
          'el trámite es gratuito y se inicia en ANSES con turno previo; no hace falta gestor ni intermediario, y nadie puede cobrarte por hacerlo.',
      },
      {
        id: 'puam',
        label: 'Tengo 65 años y no llego a los 30 de aportes',
        hint: 'PUAM — 80% del mínimo',
        answer:
          'La PUAM paga el 80% del haber mínimo a los 65 años, sin exigir años de aportes.',
        yes: [
          'El monto: el 80% del haber mínimo vigente',
          'Cuánto resignás por mes frente a una jubilación ordinaria por el mínimo',
          'Si la edad y los años de aportes te ubican en la PUAM o en la jubilación ordinaria',
        ],
        warn: [
          DISCLAIMER,
          'No genera pensión derivada: al fallecimiento no le queda nada al cónyuge, y esa es la diferencia grande contra una jubilación ordinaria',
          'Con 30 años de aportes o más no corresponde PUAM: te conviene la jubilación ordinaria, que paga el 100% del mínimo como piso',
          'Exige 10 años de residencia en el país para extranjeros, 5 de ellos inmediatamente anteriores al pedido',
        ],
        plazo:
          'se pide a los 65 años, mujeres y varones por igual, e incluye PAMI y aguinaldo. Si querés ver la fecha exacta en la que te toca, está el hub “¿Cuándo me puedo jubilar?”.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'Cada rama usa sólo los campos que le sirven. El haber del causante es para la pensión por fallecimiento; el resto de las prestaciones se calculan sobre el haber mínimo vigente.',
  fields: [
    {
      id: 'haberCausante',
      label: 'Haber que cobraba la persona fallecida',
      prefix: '$',
      value: String(HABER_MINIMO),
      thousands: true,
      help: 'El haber bruto mensual del jubilado o pensionado fallecido. Sólo se usa en la pensión por fallecimiento.',
    },
    {
      id: 'hijos',
      label: 'Hijos con derecho a pensión',
      type: 'number',
      min: 0,
      max: 12,
      suffix: 'hijos',
      value: 0,
      help: 'Menores de 18 años solteros, o incapacitados para el trabajo sin límite de edad. Sólo suman en la pensión por fallecimiento.',
    },
    { id: 'edad', label: 'Tu edad actual', type: 'number', min: 0, max: 110, suffix: 'años', value: 66 },
    {
      id: 'aportes',
      label: 'Años de aportes registrados',
      type: 'number',
      min: 0,
      max: 60,
      suffix: 'años',
      value: 12,
      help: 'Los que figuran en tu historia laboral de ANSES. Se usan para saber si te corresponde PUAM o jubilación ordinaria.',
    },
    {
      id: 'grado',
      label: 'Grado de invalidez certificado',
      type: 'number',
      min: 0,
      max: 100,
      suffix: '%',
      value: 76,
      help: 'El que determina la junta médica de ANDIS. No es autopercibido.',
    },
    {
      id: 'hijosNacidos',
      label: 'Hijos nacidos vivos (para la PNC madre de 7)',
      type: 'number',
      min: 0,
      max: 20,
      suffix: 'hijos',
      value: 7,
      help: 'Incluye los hijos fallecidos y los adoptados.',
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Esta página no es una liquidación: el derecho y el monto los determina ANSES (y ANDIS en el caso de la invalidez) con tu expediente completo, y los requisitos pueden cambiar por ley.',

  chart: {
    type: 'scale',
    title: 'Cuánto paga tu prestación contra el haber mínimo',
    caption:
      'La barra mide el monto estimado como porcentaje del haber mínimo jubilatorio. Sirve para comparar peras con peras: la PNC por invalidez paga el 70%, la PUAM el 80% y la PNC madre de 7 hijos el 100%. La pensión por fallecimiento depende del haber del causante, así que puede caer en cualquier punto.',
    bands: [
      { label: 'Por debajo del 70%', from: 0, to: 70, tone: 'bad' },
      { label: 'PNC invalidez (70%)', from: 70, to: 80, tone: 'warn' },
      { label: 'PUAM (80%)', from: 80, to: 100, tone: 'warn' },
      { label: 'Haber mínimo o más', from: 100, to: 130, tone: 'good' },
    ],
  },
  breakdownTitle: 'El monto, número por número',
  breakdownIntro:
    'Las barras comparan cada valor con el mayor del listado. Fijate la unidad de cada fila: hay pesos, porcentajes y cantidades.',

  faq: [
    {
      q: '¿Qué pensiones paga ANSES si nunca me jubilé?',
      a: 'Cuatro, y son distintas entre sí. La pensión por fallecimiento (o derivada) sale del haber del cónyuge o conviviente que falleció y es contributiva: existe porque esa persona aportó. Las otras tres son no contributivas y se pagan como porcentaje del haber mínimo: la PNC por invalidez (70%), la PUAM a los 65 años (80%) y la PNC para madres de 7 o más hijos (100%). Ninguna de las tres últimas exige años de aportes.',
    },
    {
      q: '¿Cuánto cobra el cónyuge de pensión por fallecimiento?',
      a: `El 70% del haber que cobraba la persona fallecida si no hay hijos con derecho a pensión, y el 50% si los hay, según la Ley 24.241 art. 98. Cada hijo con derecho suma un 20% aparte. Cuando la suma de todas las pensiones supera el 100% del haber del causante, se prorratea manteniendo las proporciones, así que el grupo familiar nunca cobra más del 100%. Sobre un haber mínimo de ${fmtArs(HABER_MINIMO)}, un cónyuge sin hijos cobraría ${fmtArs(HABER_MINIMO * 0.7)}.`,
    },
    {
      q: '¿Quiénes son "hijos con derecho a pensión"?',
      a: 'Los hijos solteros menores de 18 años, y los hijos incapacitados para el trabajo sin límite de edad si la incapacidad existía antes de cumplir los 18. No entran los hijos mayores que trabajan ni los que ya formaron su propia familia. Cuando un hijo cumple 18 sale del grupo y la pensión se recalcula: si era el único, el cónyuge vuelve a subir del 50% al 70%.',
    },
    {
      q: '¿Un conviviente sin casarse cobra la pensión?',
      a: 'Sí, la ley reconoce al conviviente en aparente matrimonio, pero hay que probar la convivencia: 5 años como mínimo, o 2 si hay hijos reconocidos por ambos. Se acredita con información sumaria judicial o policial, domicilio en común en el DNI, facturas a nombre de ambos, seguros y obra social. Es el punto donde más solicitudes se traban, así que conviene juntar la prueba antes de iniciar el trámite.',
    },
    {
      q: '¿Cuánto paga la pensión no contributiva por invalidez?',
      a: `El 70% del haber mínimo jubilatorio, o sea ${fmtArs(PNC_INVALIDEZ)} con el mínimo vigente, e incluye cobertura de PAMI automáticamente. Se pide entre los 18 y los 64 años, con un grado de invalidez certificado por la junta médica de ANDIS. A los 65 años la prestación se convierte en PUAM y pasa a pagar el 80% del mínimo.`,
    },
    {
      q: '¿La pensión por invalidez es compatible con trabajar?',
      a: 'La PNC por invalidez exige una situación de vulnerabilidad: no tener otra jubilación o pensión, ni ingresos propios o del grupo familiar por encima del tope que fija la normativa. Un ingreso registrado alto la hace incompatible. Distinto es el caso de la jubilación por invalidez del régimen contributivo, que sí depende de aportes y tiene reglas propias.',
    },
    {
      q: '¿Cuánto cobra la madre de 7 hijos?',
      a: `El 100% del haber mínimo jubilatorio: ${fmtArs(PNC_MADRE7)} por mes con el valor vigente, más los dos medios aguinaldos, o sea 13 pagos al año. Es la única PNC que paga el mínimo completo. La estableció la Ley 23.746 y no exige edad mínima ni años de aportes: exige 7 hijos nacidos vivos, incluidos los fallecidos y los adoptados.`,
    },
    {
      q: '¿La PNC madre de 7 hijos se puede cobrar junto con otra cosa?',
      a: 'No con otro beneficio previsional. Es incompatible con percibir jubilación, pensión u otro ingreso igual o mayor al haber mínimo. Sí puede convivir con asignaciones familiares por los hijos menores, que son otro régimen. El trámite es gratuito en ANSES con turno previo: nadie puede cobrarte por gestionarlo.',
    },
    {
      q: '¿Qué diferencia hay entre la PUAM y una pensión?',
      a: `La PUAM no es una pensión derivada: es una prestación propia que se pide a los 65 años sin exigir aportes y paga el 80% del haber mínimo (${fmtArs(PUAM)} hoy). La diferencia práctica más grande es que la PUAM no genera pensión para el cónyuge al fallecimiento, mientras que una jubilación ordinaria sí deja el 70% del haber. Si el que falleció cobraba PUAM, no queda pensión derivada.`,
    },
    {
      q: '¿Las pensiones incluyen PAMI?',
      a: 'Sí. La PUAM, la PNC por invalidez y la PNC madre de 7 hijos traen cobertura de PAMI automáticamente, y la pensión derivada también da acceso a la obra social del causante o a PAMI según el caso. PAMI cubre el 100% de las prestaciones básicas de odontología, rehabilitación e internación, y los medicamentos del vademécum con cobertura del 50% al 100%. Con haberes cercanos al mínimo se puede pedir el subsidio social para llegar al 100% en medicamentos.',
    },
    {
      q: '¿Cuánto tarda en salir una pensión de ANSES?',
      a: 'La pensión por fallecimiento suele resolverse en algunos meses si la documentación está completa. Las no contributivas dependen de ANDIS y de la junta médica, y pueden llevar bastante más. Lo que sí importa es el efecto retroactivo: la pensión por fallecimiento se paga desde la fecha del deceso si se inicia dentro del año, y desde la solicitud si se inicia después. Iniciar tarde cuesta plata.',
    },
    {
      q: '¿Puedo cobrar dos pensiones al mismo tiempo?',
      a: 'En general no. Las prestaciones no contributivas son incompatibles entre sí y con cualquier jubilación o pensión. La excepción típica es la pensión derivada, que sí puede acumularse con una jubilación propia dentro de los topes del sistema. Si estás cobrando una y aparece derecho a otra, conviene comparar los dos montos antes de optar, porque la elección es difícil de revertir.',
    },
  ],

  sources: [
    {
      name: 'Ley 24.241 art. 98 — Haber de las pensiones por fallecimiento',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/639/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 23.746 — Pensión para madres de 7 o más hijos',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/275/norma.htm',
      publisher: 'InfoLeg',
      date: '1989',
    },
    {
      name: 'Ley 27.260 art. 13 — Prestación Universal para el Adulto Mayor (PUAM)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/260000-264999/263691/norma.htm',
      publisher: 'InfoLeg',
      date: '29-06-2016',
    },
    {
      name: 'Decreto 432/97 — Pensiones no contributivas por invalidez',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/40000-44999/43450/norma.htm',
      publisher: 'InfoLeg',
      date: '15-05-1997',
    },
    {
      name: 'Pensión por fallecimiento — requisitos y trámite',
      url: 'https://www.anses.gob.ar/prestacion/pension-por-fallecimiento',
      publisher: 'ANSES',
    },
    {
      name: 'Pensiones no contributivas — Agencia Nacional de Discapacidad',
      url: 'https://www.argentina.gob.ar/andis/pensiones-no-contributivas',
      publisher: 'ANDIS',
    },
    {
      name: 'Prestación Universal para el Adulto Mayor — requisitos',
      url: 'https://www.anses.gob.ar/prestacion/prestacion-universal-para-el-adulto-mayor',
      publisher: 'ANSES',
    },
    {
      name: 'Prestaciones y cobertura del Instituto',
      url: 'https://www.pami.org.ar/prestaciones',
      publisher: 'PAMI',
    },
  ],

  replaces: [
    '/calculadora-pension-viudez-porcentaje-conyuge',
    '/calculadora-pension-no-contributiva-madre-7-hijos-anses-2026',
    '/calculadora-puam-pension-universal-adulto-mayor-anses-2026',
    '/calculadora-pension-invalidez-anses-no-contributiva-2026-cuantia',
    '/calculadora-pami-prestaciones-monto-copago-2026',
    // PNC por invalidez duplicada bajo nombre de "asignación": la fórmula es la
    // misma (70% del haber mínimo, Decreto 432/97), no es una asignación
    // familiar. Se absorbe acá y no en el hub de asignaciones.
    '/calculadora-asignacion-discapacidad-pensionado',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
