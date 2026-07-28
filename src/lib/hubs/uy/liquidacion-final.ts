import type { HubData } from '../types';
import { URUGUAY_2026 } from '../../data/uruguay-2026';

/**
 * Hub de decisión UY — "Se termina el vínculo (o llega la partida): ¿cuánto me tienen que pagar?"
 *
 * Reúne aguinaldo, licencia, salario vacacional, indemnización por despido y la
 * liquidación final completa. Constantes: src/lib/data/uruguay-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const BPC = URUGUAY_2026.bpc;
export const LABORAL = URUGUAY_2026.laboral;
export const DESPIDO = URUGUAY_2026.laboral.despido;
export const IRPF_FRANJAS = URUGUAY_2026.irpf.franjas.map((f) => ({
  hastaBpc: Number.isFinite(f.hastaBpc) ? f.hastaBpc : null,
  tasa: f.tasa,
}));
export const IRPF_DEDUCCION = URUGUAY_2026.irpf.deduccion;
export const FONASA = URUGUAY_2026.bps.fonasa;
export const MONTEPIO = URUGUAY_2026.bps.montepio;
export const FRL = URUGUAY_2026.bps.frl;

const uyu = (n: number) => '$U ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'uy/trabajo/liquidacion-final',
  title: 'Liquidación final en Uruguay: aguinaldo, licencia, vacacional y despido',
  description:
    'Calculá cuánto te tienen que pagar al terminar el vínculo laboral en Uruguay: aguinaldo proporcional, licencia no gozada, salario vacacional e indemnización por despido, con los topes de la ley y los descuentos que corresponden a cada partida.',
  silo: 'Trabajo',
  siloHref: '/uy/trabajo',
  locale: 'uy',

  eyebrow: 'Uruguay · MTSS · BPS',
  h1: '¿Cuánto te tienen que pagar cuando se termina el trabajo?',
  lede:
    'La liquidación final no es un número suelto: son cuatro rubros distintos, cada uno con su propia regla y su propio descuento. El aguinaldo aporta y paga IRPF; el salario vacacional no aporta pero sí tributa; la indemnización tiene tope y depende de si sos mensual o jornalero; y en la renuncia hay uno que directamente no se cobra. Acá se arman todos juntos.',
  stamps: [
    `Licencia base: ${LABORAL.licenciaDiasBase} días por año`,
    `Tope de la indemnización: ${DESPIDO.mensual.topeMeses} mensualidades`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Total a cobrar',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'El cálculo cambia bastante según cómo termine el vínculo y cómo cobres. Partimos del despido de un trabajador mensual, que es el caso más consultado.',
    items: [
      {
        id: 'despido',
        label: 'Me despidieron y soy mensual',
        hint: 'Indemnización + rubros proporcionales',
        answer: `Cobrás una mensualidad por año de antigüedad, con tope de ${DESPIDO.mensual.topeMeses}, más los proporcionales.`,
        yes: [
          `Indemnización por despido: 1 mensualidad por año de antigüedad, con la fracción de año contada como año entero y tope de ${DESPIDO.mensual.topeMeses} mensualidades`,
          'Aguinaldo proporcional: lo percibido en el semestre en curso dividido 12',
          'Licencia generada y no gozada, pagada al jornal de licencia',
          'Salario vacacional sobre esa licencia pendiente',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La indemnización por despido está exenta de aportes al BPS y no paga IRPF: los demás rubros sí tributan',
          'El despido por notoria mala conducta no genera indemnización, pero sí los rubros proporcionales',
          'Si el despido es de una trabajadora embarazada, de un trabajador enfermo o de un delegado sindical, hay indemnizaciones especiales que multiplican la común y no se calculan acá',
        ],
        plazo: 'la liquidación se paga junto con el último salario, en el plazo habitual de pago del mes.',
      },
      {
        id: 'renuncia',
        label: 'Renuncié',
        hint: 'Sólo los rubros proporcionales',
        answer: 'Al renunciar no cobrás indemnización: te quedan aguinaldo, licencia y salario vacacional proporcionales.',
        yes: [
          'Aguinaldo proporcional del semestre en curso',
          'Licencia generada y no gozada',
          'Salario vacacional sobre esa licencia',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'No hay indemnización por despido: es la diferencia económica más grande entre renunciar y ser despedido',
          'Renunciar tampoco da derecho al seguro de paro por causal despido',
          'Si te obligaron a renunciar, existe la figura del despido indirecto: es una discusión legal que puede cambiar por completo la liquidación',
        ],
        plazo: 'conviene dejar la renuncia por escrito y con constancia de recepción.',
      },
      {
        id: 'jornalero',
        label: 'Me despidieron y cobro por jornal',
        hint: `${DESPIDO.jornalero.jornalesPorAnio} jornales por año · tope ${DESPIDO.jornalero.topeJornales}`,
        answer: `El jornalero cobra ${DESPIDO.jornalero.jornalesPorAnio} jornales por año trabajado, con tope de ${DESPIDO.jornalero.topeJornales}.`,
        yes: [
          `${DESPIDO.jornalero.jornalesPorAnio} jornales por año de antigüedad si trabajó 240 jornadas o más en el año`,
          `Tope de ${DESPIDO.jornalero.topeJornales} jornales, equivalente a ${DESPIDO.jornalero.topeJornales / DESPIDO.jornalero.jornalesPorAnio} años`,
          'Aguinaldo, licencia y salario vacacional proporcionales, igual que el mensual',
        ],
        warn: [
          DISCLAIMER_LABOR,
          `Con menos de ${DESPIDO.jornalero.minimoJornadasParaDerecho} jornadas trabajadas en el año no se genera derecho a indemnización`,
          'Entre 100 y 239 jornadas la indemnización se prorratea en proporción a las jornadas efectivas',
          'El jornal a tomar es el del último período trabajado, con las partidas que integren salario',
        ],
        plazo: 'guardá los recibos: las jornadas trabajadas por año son la prueba del cómputo.',
      },
      {
        id: 'partidas',
        label: 'Sigo trabajando: sólo quiero mi aguinaldo o mi licencia',
        hint: 'Aguinaldo de junio o diciembre, licencia y vacacional',
        answer: 'El aguinaldo es un doceavo de lo percibido en el semestre y se cobra en junio y en diciembre.',
        yes: [
          `Aguinaldo: 1/12 de lo percibido en el semestre, pagadero en junio (por el semestre diciembre-mayo) y en diciembre (por junio-noviembre)`,
          `Licencia: ${LABORAL.licenciaDiasBase} días por año calendario completo, más ${LABORAL.licenciaDiasExtraCada4Anios} día cada 4 años de antigüedad desde el quinto`,
          'Salario vacacional: se paga junto con la licencia, calculado sobre el jornal líquido',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El aguinaldo se calcula sobre TODO lo percibido en el semestre, incluidas horas extra, comisiones y nocturnidad: no es medio sueldo exacto',
          'El salario vacacional no paga aportes al BPS, pero sí IRPF',
          'La licencia se genera por año calendario: si entraste a mitad de año, el primer año se prorratea',
        ],
        plazo: 'el aguinaldo se paga antes del 31 de diciembre y antes del 30 de junio.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu vínculo',
  inputsIntro:
    'En pesos uruguayos. Si cobrás por jornal, en "sueldo" poné el valor de tu jornal diario y elegí el caso de jornalero.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo mensual nominal (o jornal) ($U)',
      prefix: '$U',
      value: '60.000',
      thousands: true,
      help: 'El nominal del último período trabajado, con las partidas que integran salario.',
    },
    {
      id: 'anios',
      label: 'Antigüedad (años)',
      type: 'number',
      value: 3.5,
      min: 0,
      max: 45,
      step: 0.5,
      help: 'Admite decimales. Para la indemnización, la fracción de año cuenta como año entero.',
    },
    {
      id: 'diasLicencia',
      label: 'Días de licencia generada y no gozada',
      type: 'number',
      value: 12,
      min: 0,
      max: 60,
      step: 1,
      help: `Si no sabés cuántos son, la base legal es de ${LABORAL.licenciaDiasBase} días por año completo trabajado.`,
    },
    {
      id: 'mesesSemestre',
      label: 'Meses trabajados del semestre del aguinaldo',
      type: 'number',
      value: 4,
      min: 0,
      max: 6,
      step: 1,
      help: 'Los semestres corren de diciembre a mayo y de junio a noviembre.',
    },
    {
      id: 'jornadas',
      label: 'Jornadas trabajadas por año (sólo jornaleros)',
      type: 'number',
      value: 250,
      min: 0,
      max: 365,
      step: 1,
      help: `Con 240 o más se computan ${DESPIDO.jornalero.jornalesPorAnio} jornales por año; con menos de ${DESPIDO.jornalero.minimoJornadasParaDerecho} no hay derecho.`,
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu liquidación',
    caption:
      'Muestra el peso de cada rubro dentro del total. En un despido la indemnización suele dominar el gráfico; en una renuncia desaparece y quedan sólo los proporcionales.',
  },
  breakdownTitle: 'Rubro por rubro, con su regla',
  breakdownIntro:
    'Cada línea indica la norma o el criterio con el que se calcula, y cuáles tributan aportes o IRPF.',

  faq: [
    {
      q: '¿Cómo se calcula el aguinaldo en Uruguay?',
      a: 'Es la doceava parte de todo lo que percibiste en el semestre por conceptos salariales. No es medio sueldo: si hiciste horas extra, cobraste comisiones o nocturnidad, esas partidas engordan el aguinaldo. Se paga dos veces al año, en junio por el semestre que va de diciembre a mayo, y en diciembre por el que va de junio a noviembre. Si trabajaste sólo parte del semestre, cobrás la parte proporcional.',
    },
    {
      q: '¿El aguinaldo paga aportes e IRPF?',
      a: 'Sí, los dos. Sobre el aguinaldo se descuentan los aportes al BPS igual que sobre el sueldo, y a efectos del IRPF se trata como un ingreso adicional del mes en que se cobra. No tiene escala propia: lo que pagás es el impuesto marginal, es decir, cuánto sube tu IRPF de ese mes al sumarle el aguinaldo. Por eso a quien está justo debajo de un salto de franja el aguinaldo le puede pegar más de lo esperado.',
    },
    {
      q: '¿Cuántos días de licencia me corresponden?',
      a: `La base son ${LABORAL.licenciaDiasBase} días por año calendario completo trabajado. A partir del quinto año de antigüedad se suma ${LABORAL.licenciaDiasExtraCada4Anios} día más cada cuatro años: 21 días al cumplir 5, 22 al cumplir 9, 23 al cumplir 13, y así. Si no trabajaste el año completo, los días se prorratean por los meses efectivamente trabajados.`,
    },
    {
      q: '¿Qué es el salario vacacional y cómo se calcula?',
      a: 'Es una partida extra "para el mejor goce de la licencia": se paga además del jornal de licencia, no en lugar de él. Se calcula multiplicando el jornal líquido —el nominal menos los aportes al BPS, dividido 30— por los días de licencia. Por eso siempre da menos que multiplicar el jornal nominal. No paga aportes al BPS, pero sí tributa IRPF.',
    },
    {
      q: '¿Cuánto es la indemnización por despido?',
      a: `Para el trabajador mensual, una mensualidad por cada año de antigüedad, contando la fracción de año como año entero, con un tope de ${DESPIDO.mensual.topeMeses} mensualidades. Para el jornalero, ${DESPIDO.jornalero.jornalesPorAnio} jornales por año, con tope de ${DESPIDO.jornalero.topeJornales} jornales, siempre que haya trabajado al menos 240 jornadas en el año; con menos de ${DESPIDO.jornalero.minimoJornadasParaDerecho} jornadas no hay derecho a indemnización.`,
    },
    {
      q: 'Si renuncio, ¿qué pierdo exactamente?',
      a: 'Perdés la indemnización por despido, que es el rubro más grande de la liquidación, y perdés el acceso al seguro de paro por causal despido. Lo que no perdés son los rubros que ya generaste: aguinaldo proporcional, licencia no gozada y salario vacacional se cobran igual, porque son salario devengado y no una compensación por el cese.',
    },
    {
      q: '¿La indemnización por despido paga impuestos?',
      a: 'No. La indemnización por despido común está exenta de aportes al BPS y no está gravada por el IRPF, porque no es una contraprestación por trabajo sino una reparación por el cese. Los demás rubros de la liquidación sí tributan: el aguinaldo y la licencia con aportes e IRPF, y el salario vacacional con IRPF solamente.',
    },
    {
      q: '¿Qué pasa si me despiden por notoria mala conducta?',
      a: 'Se pierde el derecho a la indemnización por despido, pero no el resto: el aguinaldo proporcional, la licencia generada y el salario vacacional se pagan igual, porque son salario ya devengado. La notoria mala conducta la tiene que probar el empleador y es un estándar exigente, no cualquier incumplimiento entra.',
    },
    {
      q: '¿Cuándo me tienen que pagar la liquidación?',
      a: 'Junto con el último salario, dentro del plazo normal de pago del mes correspondiente. Si el empleador no paga o paga de menos, el reclamo se hace ante el Ministerio de Trabajo, que cita a una audiencia de conciliación previa antes de cualquier juicio laboral. Los créditos laborales prescriben, así que no conviene dejar pasar el tiempo.',
    },
    {
      q: '¿La antigüedad de 3 años y medio cuenta como 3 o como 4?',
      a: `Como 4. En la indemnización por despido la fracción de año se cuenta como año entero: basta con haber superado el mes dentro del año en curso. Es una regla que juega a favor del trabajador y explica por qué a veces conviene esperar unos días antes de aceptar un cese. Eso sí, el tope de ${DESPIDO.mensual.topeMeses} mensualidades se aplica igual.`,
    },
    {
      q: 'Si me despiden, ¿cobro además el seguro de paro?',
      a: 'Sí, son cosas distintas y compatibles. La indemnización la paga el empleador por el cese; el seguro de paro lo paga el BPS como prestación de seguridad social mientras estás sin trabajo. Uno no descuenta al otro. El seguro de paro se tramita ante el BPS y tiene sus propios plazos y topes.',
    },
  ],

  sources: [
    {
      name: 'MTSS — Aguinaldo, licencia y salario vacacional',
      url: 'https://www.gub.uy/ministerio-trabajo-seguridad-social/',
      publisher: 'Ministerio de Trabajo y Seguridad Social',
    },
    {
      name: 'Ley N° 12.590 — Licencia anual',
      url: 'https://www.impo.com.uy/bases/leyes/12590-1958',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'Ley N° 16.101 — Salario vacacional',
      url: 'https://www.impo.com.uy/bases/leyes/16101-1990',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'Ley N° 10.489 — Indemnización por despido',
      url: 'https://www.impo.com.uy/bases/leyes/10489-1944',
      publisher: 'IMPO — Centro de Información Oficial',
    },
    {
      name: 'BPS — Aportes sobre partidas salariales',
      url: 'https://www.bps.gub.uy/',
      publisher: 'Banco de Previsión Social',
    },
  ],

  replaces: [
    '/uy/liquidacion-final-uruguay',
    '/uy/calculadora-despido-uruguay',
    '/uy/aguinaldo-uruguay',
    '/uy/calculadora-irpf-aguinaldo-uruguay',
    '/uy/salario-vacacional-uruguay',
    '/uy/calculadora-licencia-uruguay',
  ],

  lastReviewed: '2026-07-28',
};
