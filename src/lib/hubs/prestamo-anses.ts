import type { HubData } from './types';
import { jubilacionMinima } from '../formulas/jubilacion-minima';
import tasas from '../../data/live/tasas.json';

/**
 * Hub de decisión — "¿Cuánto me presta ANSES y con qué cuota me queda el haber?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cinco ramas: jubilado o pensionado (Créditos
 * ANSES, ex-Argenta), titular de AUH o SUAF, crédito pre-aprobado que figura en
 * Mi ANSES, cronograma de cobro por terminación de DNI y el bolsillo real una
 * vez descontada la cuota.
 *
 * LA PREGUNTA REAL que ordena el hub: no es "cuánto me prestan" sino "con qué
 * haber me quedo después". Por eso todas las ramas de plata terminan en la misma
 * cuenta: haber + bono − cuota, y el gráfico muestra qué porción del haber se
 * lleva la cuota contra el tope de afectación.
 *
 * DE DÓNDE SALEN LOS NÚMEROS — FUENTE ÚNICA:
 *  · HABER MÍNIMO y BONO: se leen llamando a `jubilacionMinima()`, la misma
 *    fuente que usan /jubilacion/pensiones y /jubilacion/cuando-me-jubilo. No se
 *    hardcodean acá: cuando ANSES mueve el mínimo, los tres hubs cambian juntos.
 *  · TOPE DE AFECTACIÓN DEL HABER (30%): espejo de la constante
 *    LIMITE_CUOTA_HABER de
 *    src/lib/formulas/prestamo-anses-jubilados-monto-cuota-2026.ts, y del mismo
 *    umbral que evalúa src/lib/formulas/credito-anses-pre-aprobado-jubilado-cuota.ts
 *  · Sistema francés (cuota desde capital y capital desde cuota): espejo de las
 *    funciones cuotaFrances / capitalDesdeCuota de esa misma fórmula.
 *  · Bono de AUH/SUAF: espejo de PARAMETROS_2026 de
 *    src/lib/formulas/quita-jubilatoria-bono-refuerzo-anses-2026.ts
 *  · Orden de cobro por terminación de DNI (la 0 cobra primero, un dígito por
 *    día hábil, salteando fines de semana y feriados nacionales): espejo de
 *    src/lib/formulas/fecha-cobro-anses-cronograma-dni.ts, con la misma fuente
 *    única de feriados (src/lib/data/feriados-ar-2026.ts).
 *  · TNA de referencia del mercado: dato vivo de src/data/live/tasas.json (BCRA),
 *    usado sólo como comparación contra la tasa de la línea ANSES. No se
 *    hardcodea ninguna tasa de mercado.
 */

/** Haber mínimo y bono vigentes, leídos de la fórmula real (no hardcodeados). */
const _minima = jubilacionMinima({ tieneBono: 'si' });
export const HABER_MINIMO = Math.round(_minima.haberMinimo);
export const BONO_JUBILADOS = Math.round(_minima.bonoExtra);

/** Bono de refuerzo de AUH/AUE — espejo de quita-jubilatoria-bono-refuerzo-anses-2026.ts */
export const BONO_AUH = 25000;

/** La cuota no puede superar este porcentaje del haber (tope de afectación ANSES). */
export const TOPE_AFECTACION = 0.3;

/** TNA promedio de préstamos personales del sistema (BCRA, dato vivo). */
export const TNA_MERCADO = tasas.prestamos_personales.valor;
export const TNA_MERCADO_FECHA = tasas.prestamos_personales.fecha;

/** Qué calcula cada rama y con qué bono. */
export const RAMAS = {
  jubilado: { kind: 'maximo', bono: BONO_JUBILADOS },
  'auh-suaf': { kind: 'maximo', bono: BONO_AUH },
  'pre-aprobado': { kind: 'solicitado', bono: BONO_JUBILADOS },
  cronograma: { kind: 'fecha', bono: BONO_JUBILADOS },
  bolsillo: { kind: 'bolsillo', bono: BONO_JUBILADOS },
} as const;

/** Constantes que viajan al <script> de la página. */
export const CASE_MATH = {
  ramas: RAMAS,
  tope: TOPE_AFECTACION,
  haberMinimo: HABER_MINIMO,
  tnaMercado: TNA_MERCADO,
};

const fmtArs = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

/**
 * Primer día hábil del mes en curso al momento del build. Sirve de valor por
 * defecto del campo "inicio de pagos": ANSES publica la fecha real cada mes, así
 * que el campo es editable y el default sólo evita arrancar con una fecha vieja.
 */
function primerHabilDelMes(): string {
  const d = new Date();
  d.setDate(1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Texto del disclaimer YMYL (getCalculatorDisclaimer, dominio 'finance'). */
const DISCLAIMER =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'jubilacion/prestamo-anses',
  title: 'Préstamo ANSES: cuánto te prestan y con qué haber te quedás',
  description:
    'Créditos ANSES para jubilados, pensionados y titulares de AUH o SUAF: el máximo que te prestan con el tope del 30% del haber, la cuota real, el bono que cobrás aparte y cuándo se acredita según tu terminación de DNI.',
  silo: 'Jubilación',
  siloHref: '/jubilacion',

  eyebrow: 'Guía y estimación previsional',
  h1: '¿Cuánto me presta ANSES y con qué cuota me queda el haber?',
  lede:
    'El monto que te prestan no lo decide lo que pedís: lo decide tu haber. La cuota no puede superar el tope de afectación del 30%, y de ahí sale el máximo para atrás. Elegí tu situación y mirá las dos cifras que importan: la cuota y lo que te queda en el bolsillo después de pagarla.',
  stamps: [
    'Actualizado 27-07-2026',
    `Haber mínimo ${fmtArs(HABER_MINIMO)}`,
    'Tope de afectación 30%',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente: jubilado o pensionado. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'jubilado',
        label: 'Soy jubilado o pensionado',
        hint: 'Créditos ANSES, ex-Argenta',
        answer: 'Con tu haber, el máximo sale del tope del 30% de afectación.',
        yes: [
          'El máximo prestable se despeja para atrás desde la cuota tope: 30% de tu haber',
          'La cuota se descuenta directo del haber, antes de que lo cobres',
          'El bono, cuando corresponde, se cobra aparte y no se afecta al crédito',
          'A mayor plazo, más capital entra en el mismo tope de cuota — y más intereses pagás',
        ],
        warn: [
          DISCLAIMER,
          'El tope del 30% se mide sobre el haber, no sobre el haber más el bono: el bono no te habilita más crédito',
          'Si ya tenés otro descuento sobre el haber (mutual, obra social, otro crédito), el margen disponible es menor al 30%',
        ],
        plazo: 'el crédito se solicita y se sigue desde mi.ANSES; el descuento arranca en la liquidación siguiente.',
      },
      {
        id: 'auh-suaf',
        label: 'Cobro AUH o asignaciones familiares',
        hint: 'Titulares de AUH y SUAF',
        answer: 'Con AUH o SUAF también rige el tope del 30% sobre lo que cobrás.',
        yes: [
          'La cuota se calcula sobre el monto que cobrás por ANSES, con el mismo tope de afectación',
          'El bono de refuerzo, cuando se dispone, es menor que el de jubilados y se cobra aparte',
          'El descuento se aplica sobre la acreditación mensual',
        ],
        warn: [
          DISCLAIMER,
          'En AUH el 20% retenido por la Libreta no cuenta como ingreso disponible: el margen real de cuota es más chico que el que sale de la cuenta',
          'Cobrar una asignación no garantiza el crédito: la línea puede estar cerrada o no alcanzarte según antigüedad en el beneficio',
        ],
        plazo: 'las líneas para titulares de asignaciones abren y cierran por tramos; confirmá disponibilidad antes de contar con la plata.',
      },
      {
        id: 'pre-aprobado',
        label: 'Tengo un crédito pre-aprobado en Mi ANSES',
        hint: 'Ya me figura el monto',
        answer: 'Con el monto ya definido, lo que importa es si la cuota entra en el 30%.',
        yes: [
          'Se calcula la cuota del monto que te figura, por sistema francés',
          'Se compara esa cuota contra el tope del 30% de tu haber',
          'Si se pasa del tope, hay dos salidas: estirar el plazo o pedir menos capital',
        ],
        warn: [
          DISCLAIMER,
          'Que figure como pre-aprobado no significa que esté acordado: el monto final se confirma recién al aceptar la oferta',
          'La cuota que muestra el simulador puede no incluir seguros ni cargos administrativos, que sí se descuentan del haber',
        ],
        plazo: 'las ofertas pre-aprobadas tienen fecha de vencimiento en el sistema; si se vence, hay que volver a pedirla.',
      },
      {
        id: 'cronograma',
        label: 'Sólo quiero saber cuándo cobro',
        hint: 'Cronograma por terminación de DNI',
        answer: 'La terminación 0 cobra primero y la 9 última, un dígito por día hábil.',
        yes: [
          'El orden lo fija el último dígito del DNI: la terminación 0 abre el cronograma',
          'Se avanza un dígito por día hábil, salteando fines de semana y feriados nacionales',
          'Cada grupo (haber mínimo, haber superior, AUH, SUAF, desempleo, PNC) tiene su propia fecha de arranque',
        ],
        warn: [
          DISCLAIMER,
          'La fecha de inicio la publica ANSES cada mes: el orden es determinístico, el día de arranque no. Confirmá el cronograma oficial antes de ir al cajero',
          'La plata queda disponible en la cuenta a partir de tu día y no se pierde si no vas: no hay urgencia por ir el mismo día',
        ],
        plazo: 'el cronograma del mes se publica sobre el final del mes anterior en anses.gob.ar.',
      },
      {
        id: 'bolsillo',
        label: 'Cuánto me queda después de la cuota',
        hint: 'Haber + bono − cuota',
        answer: 'Lo que importa no es la cuota: es el haber que te queda después.',
        yes: [
          'Se descuenta la cuota del haber y se suma el bono cuando corresponde',
          'Se muestra qué porcentaje del haber se lleva la cuota contra el tope del 30%',
          'Sirve para ver si el crédito te deja abajo del piso con el que vivís cada mes',
        ],
        warn: [
          DISCLAIMER,
          'El bono es un refuerzo por decreto y no está garantizado todos los meses: no cuentes con él para pagar una cuota que dura años',
          'El haber se actualiza por movilidad pero la cuota es fija en pesos: al principio duele más y con el tiempo pesa menos',
        ],
        plazo: 'antes de tomar el crédito, mirá el haber neto proyectado sin bono: ése es el piso real.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'haber',
      label: 'Tu haber o lo que cobrás por ANSES',
      prefix: '$',
      value: String(HABER_MINIMO),
      thousands: true,
      help: `El haber mínimo vigente es ${fmtArs(HABER_MINIMO)}. Poné tu haber neto, sin el bono.`,
    },
    {
      id: 'monto',
      label: 'Monto que querés pedir (o el que te figura pre-aprobado)',
      prefix: '$',
      value: '2.000.000',
      thousands: true,
      help: 'Si pedís más del máximo que habilita tu haber, el cálculo lo topea solo.',
    },
    {
      id: 'plazo',
      label: 'Plazo en cuotas',
      type: 'select',
      value: '48',
      options: [
        { value: '24', label: '24 cuotas' },
        { value: '36', label: '36 cuotas' },
        { value: '48', label: '48 cuotas' },
        { value: '60', label: '60 cuotas' },
        { value: '72', label: '72 cuotas' },
      ],
    },
    {
      id: 'tna',
      label: 'TNA de la línea',
      type: 'number',
      min: 1,
      max: 300,
      step: 1,
      value: 70,
      suffix: '%',
      help: `La línea ANSES es subsidiada y suele estar por debajo del mercado: la TNA promedio de préstamos personales del sistema es ${TNA_MERCADO}% (BCRA, ${TNA_MERCADO_FECHA}). Poné la de tu oferta.`,
    },
    {
      id: 'dni',
      label: 'Terminación de tu DNI',
      type: 'number',
      min: 0,
      max: 9,
      value: 7,
      help: 'El último dígito, el que ordena el cronograma de cobro.',
    },
    {
      id: 'inicio',
      label: 'Primer día de pago de tu grupo',
      type: 'date',
      value: primerHabilDelMes(),
      help: 'La fecha de arranque la publica ANSES cada mes según el grupo. Cambiala por la del cronograma vigente.',
    },
  ],
  fineprint:
    'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir. La cuota real puede incluir seguros y cargos que acá no se estiman.',

  chart: {
    type: 'progress',
    title: 'Cuánto del haber se lleva la cuota',
    caption:
      'La barra muestra qué porcentaje de tu haber se va en la cuota. El tope de afectación del 30% es la línea que ANSES no deja cruzar: pasada esa franja, el crédito no se aprueba.',
    bands: [
      { label: 'Margen cómodo', from: 0, to: 15, tone: 'good' },
      { label: 'Se siente', from: 15, to: 30, tone: 'warn' },
      { label: 'Pasa el tope del 30%', from: 30, to: 60, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tu crédito, número por número',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Cuánto me presta ANSES según mi haber?',
      a: `No hay un monto fijo: el máximo se despeja del tope de afectación. La cuota no puede superar el 30% del haber, así que se toma esa cuota máxima, el plazo y la tasa, y de ahí sale el capital. Con el haber mínimo de ${fmtArs(HABER_MINIMO)}, la cuota tope es ${fmtArs(HABER_MINIMO * TOPE_AFECTACION)} por mes, y cuánto capital entra en esa cuota depende del plazo y la TNA.`,
    },
    {
      q: '¿Qué es el tope de afectación del haber?',
      a: 'Es el límite que impide que los descuentos se coman la jubilación. La cuota del crédito no puede superar el 30% del haber neto. Si ya tenés otros descuentos —mutual, obra social, otro crédito vigente— ese 30% se reparte entre todos, así que el margen disponible para un crédito nuevo es menor.',
    },
    {
      q: '¿El bono cuenta para el cálculo de la cuota?',
      a: 'No. El bono es un refuerzo por decreto, no remunerativo y no permanente, así que no amplía el margen de crédito: el tope se mide sobre el haber. Sí lo cobrás igual mientras te corresponda, y por eso en el desglose aparece como una fila aparte y no mezclado con el haber.',
    },
    {
      q: '¿Cuánto es el bono y a quién le corresponde?',
      a: `El refuerzo para jubilados y pensionados es de ${fmtArs(BONO_JUBILADOS)} y alcanza a quienes cobran hasta el haber mínimo de ${fmtArs(HABER_MINIMO)}; por encima de ese haber se paga de forma proporcional o directamente no se paga, según lo que fije el decreto del mes. Para titulares de AUH y AUE el refuerzo es de ${fmtArs(BONO_AUH)}. Se define mes a mes, así que conviene confirmarlo antes de contar con esa plata.`,
    },
    {
      q: '¿Conviene estirar el plazo para que la cuota entre en el tope?',
      a: 'Baja la cuota, sí, pero es la salida más cara. En un préstamo a tasa fija, cada plazo extra suma intereses sobre el mismo capital, y a 72 cuotas los intereses pueden superar el capital prestado. Si la cuota no entra en el 30%, casi siempre conviene más pedir menos capital que estirar el plazo.',
    },
    {
      q: '¿Cuándo cobro según la terminación de mi DNI?',
      a: 'ANSES ordena los pagos por el último dígito: la terminación 0 cobra el primer día del cronograma y la 9 el último, avanzando un dígito por día hábil y salteando fines de semana y feriados. Lo que cambia todos los meses es la fecha de arranque, que se publica por grupo: jubilados con haber mínimo, jubilados con haber superior, AUH, SUAF, desempleo y pensiones no contributivas tienen calendarios distintos.',
    },
    {
      q: 'Si no voy a cobrar el día que me toca, ¿pierdo la plata?',
      a: 'No. El haber queda acreditado en la cuenta a partir de tu día y se puede retirar después, sin vencimiento mensual. El cronograma ordena la acreditación, no impone una fecha límite para ir al banco.',
    },
    {
      q: '¿Qué significa que el crédito figure como pre-aprobado en Mi ANSES?',
      a: 'Que el sistema ya evaluó tu situación y calculó un monto posible, pero no que esté acordado. Al aceptar la oferta se confirma monto, plazo, tasa y cuota final, que puede incluir seguros y cargos que la vista previa no muestra. Las ofertas también vencen: si se pasa la fecha, hay que volver a solicitarla.',
    },
    {
      q: '¿Puedo tomar un crédito si cobro AUH?',
      a: 'Hay líneas para titulares de asignaciones, con el mismo criterio de afectación sobre lo que se cobra. Ojo con un detalle: en AUH se acredita el 80% y el 20% queda retenido hasta presentar la Libreta, así que el ingreso realmente disponible es menor al monto bruto y el margen de cuota se achica en la misma proporción.',
    },
    {
      q: '¿La cuota se ajusta cuando aumenta el haber?',
      a: 'No. La cuota es fija en pesos durante toda la vida del crédito, mientras el haber se actualiza por movilidad. Eso significa que el peso relativo de la cuota baja con el tiempo: la afectación real arranca cerca del tope y va cediendo mes a mes.',
    },
    {
      q: '¿Qué pasa si fallece el titular con el crédito vigente?',
      a: 'Estas líneas suelen incluir un seguro de vida sobre saldo deudor, que cancela lo que quede pendiente. Es una de las razones por las que la cuota real puede ser algo más alta que la que sale de la pura cuenta financiera: el costo del seguro va adentro.',
    },
    {
      q: '¿Cómo comparo la línea ANSES con un préstamo bancario?',
      a: `Mirá la tasa y el total a devolver, no la cuota sola. La línea previsional suele estar subsidiada y por debajo del promedio del sistema, que hoy está en ${TNA_MERCADO}% de TNA para préstamos personales según el BCRA. El cálculo de esta página muestra la cuota a esa tasa de mercado como referencia, para que la diferencia se vea en pesos y no en discurso.`,
    },
  ],

  sources: [
    {
      name: 'Créditos ANSES — condiciones, montos y requisitos vigentes',
      url: 'https://www.anses.gob.ar/creditos-anses',
      publisher: 'ANSES',
    },
    {
      name: 'mi.ANSES — consulta de créditos pre-aprobados y descuentos sobre el haber',
      url: 'https://www.anses.gob.ar/mi-anses',
      publisher: 'ANSES',
    },
    {
      name: 'Cronograma de pagos mensual por terminación de DNI',
      url: 'https://www.anses.gob.ar/informacion/cronogramas-de-pago',
      publisher: 'ANSES',
    },
    {
      name: 'Haber mínimo garantizado y movilidad previsional',
      url: 'https://www.argentina.gob.ar/anses/jubilados-y-pensionados',
      publisher: 'ANSES',
    },
    {
      name: 'Principales variables — tasa de préstamos personales del sistema financiero',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
      date: TNA_MERCADO_FECHA,
    },
  ],

  replaces: [
    '/calculadora-prestamo-anses-jubilado-argenta-monto',
    '/calculadora-prestamo-anses-jubilados-monto-cuota-2026',
    '/calculadora-credito-anses-pre-aprobado-jubilado-cuota',
    '/calculadora-bono-anses-jubilados-junio-2026-aumento-mensual',
    '/calculadora-fecha-cobro-anses-cronograma-dni',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
