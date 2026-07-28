import type { HubData } from '../types';
import { PERU_2026 } from '../../data/peru-2026';

/**
 * Hub de decisión PE — "¿Cuánto me queda de sueldo y cuánto le cuesta al empleador?"
 *
 * Constantes: src/lib/data/peru-2026.ts (RMV, UIT, EsSalud, ONP, AFP, asignación familiar).
 * Cálculo espejado de las fórmulas vivas sueldo-bruto-a-neto-peru.ts,
 * essalud-aporte-peru.ts y costo-laboral-total-empleador-peru.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa basada en los parámetros indicados. No constituye asesoramiento financiero ni de inversión; verificá las condiciones vigentes con tu entidad antes de decidir.';

export const RMV = PERU_2026.rmv;
export const UIT = PERU_2026.uit;
export const ESSALUD = PERU_2026.essalud;
export const ONP = PERU_2026.onp;
export const ASIGNACION_FAMILIAR = PERU_2026.asignacionFamiliar;
export const BONIF_GRATI = PERU_2026.gratificacion.bonificacionExtraordinaria;

/** AFP: fondo 10% + prima de seguro + comisión por flujo (varía por administradora). */
export const AFP = {
  fondo: PERU_2026.afp.fondo,
  primaSeguro: PERU_2026.afp.primaSeguro,
  comisionFlujo: PERU_2026.afp.comisionFlujo as unknown as Record<string, number>,
};

/** Escala del Art. 53 LIR sobre la renta neta, en UIT acumuladas. `Infinity` → null para define:vars. */
export const TRAMOS_5TA = PERU_2026.renta5ta.tramos.map((t) => ({
  hastaUit: Number.isFinite(t.hastaUit) ? t.hastaUit : null,
  tasa: t.tasa,
}));
export const DEDUCCION_UIT = PERU_2026.renta5ta.deduccionUit;

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));

export const hub: HubData = {
  slug: 'pe/trabajo/sueldo-neto',
  title: 'Sueldo neto en Perú: cuánto te queda en mano y cuánto cuesta a la empresa',
  description:
    'Calcula tu sueldo neto en el Perú con los descuentos reales de AFP u ONP y la retención de renta de quinta categoría, y mira del otro lado cuánto le cuesta ese sueldo al empleador con EsSalud, CTS, gratificaciones y vacaciones.',
  silo: 'Trabajo',
  siloHref: '/pe/trabajo',
  locale: 'pe',

  eyebrow: 'Perú · planilla · régimen laboral privado',
  h1: 'Tu sueldo en Perú: lo que te descuentan, lo que te queda y lo que cuesta.',
  lede:
    'La boleta de pago tiene dos lados que casi nunca se ven juntos. De un lado, lo que te descuentan: el sistema de pensiones y la retención de quinta categoría. Del otro, lo que la empresa paga encima de tu sueldo y no aparece en tu boleta: EsSalud, y las provisiones de CTS, gratificaciones y vacaciones.',
  stamps: [
    `RMV ${sol(RMV)} · UIT ${sol(UIT)}`,
    'EsSalud 9% (empleador) · ONP 13% · AFP ~12,5%',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Sueldo neto mensual',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'El sueldo bruto es el mismo, pero lo que llega a tu cuenta cambia según el sistema de pensiones y según tengas o no hijos a cargo. Partimos del caso más frecuente.',
    items: [
      {
        id: 'onp',
        label: 'Estoy en la ONP',
        hint: 'Sistema Nacional de Pensiones · 13%',
        answer: 'En la ONP te descuentan un 13% fijo de la remuneración, sin comisión de administradora.',
        yes: [
          'Descuento único del 13% de la remuneración asegurable',
          'No hay comisión de administradora ni prima de seguro aparte',
          'La retención de quinta categoría se calcula sobre el bruto, no sobre lo que queda después del descuento previsional',
          'EsSalud (9%) lo aporta la empresa: no sale de tu bolsillo',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La ONP exige 20 años de aportes para tener derecho a pensión de jubilación: si no llegas, no cobras pensión, aunque hayas aportado 19 años',
          'La pensión de la ONP tiene tope máximo, así que un sueldo alto no se traduce en una pensión proporcionalmente alta',
        ],
        plazo: 'el traslado de ONP a AFP se pide en la administradora; el camino inverso solo procede en los supuestos que fija la ley.',
      },
      {
        id: 'afp',
        label: 'Estoy en una AFP',
        hint: 'Fondo 10% + prima + comisión',
        answer: 'En la AFP el descuento tiene tres partes: 10% al fondo, la prima del seguro y la comisión de la administradora.',
        yes: [
          'Aporte obligatorio del 10% que va a tu cuenta individual',
          'Prima del seguro de invalidez, sobrevivencia y gastos de sepelio, sobre la remuneración asegurable con tope',
          'Comisión de la administradora: por flujo (sobre el sueldo) o mixta (sobre el saldo)',
          'Todo lo aportado es tuyo: al jubilarte recibes el saldo acumulado, sin exigencia de años mínimos',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La comisión por flujo cambia según la AFP: la diferencia entre la más barata y la más cara pesa más de lo que parece a lo largo de una vida laboral',
          'La prima del seguro se calcula sobre la remuneración asegurable máxima que publica la SBS, no sobre todo el sueldo: en sueldos altos el porcentaje efectivo baja',
        ],
        plazo: 'puedes cambiar de AFP cuando quieras; la comisión de la nueva se te aplica desde el mes siguiente al traslado.',
      },
      {
        id: 'asignacion',
        label: 'Tengo hijos menores a cargo',
        hint: 'Asignación familiar · 10% de la RMV',
        answer: `La asignación familiar suma ${sol(ASIGNACION_FAMILIAR)} al mes a tu remuneración, sea uno o cinco hijos.`,
        yes: [
          `Asignación familiar equivalente al 10% de la RMV: ${sol(ASIGNACION_FAMILIAR)} mensuales`,
          'Es un monto fijo: no se multiplica por la cantidad de hijos',
          'Corresponde por hijos menores de 18 años, o hasta los 24 si cursan estudios superiores o universitarios',
          'Es remuneración computable: entra en la base de CTS, gratificaciones, vacaciones y EsSalud',
        ],
        warn: [
          DISCLAIMER_FIN,
          'No es automática: tienes que acreditar la existencia del hijo ante el empleador. Si nunca lo hiciste, puedes reclamar el pago retroactivo',
          'Al ser remuneración computable también entra en la base del impuesto a la renta de quinta categoría',
        ],
        plazo: 'se paga con la misma periodicidad que el sueldo y se mantiene mientras dure el requisito.',
      },
      {
        id: 'empleador',
        label: 'Soy el empleador y quiero el costo total',
        hint: 'Sueldo + EsSalud + provisiones',
        answer: 'El costo real de un trabajador ronda un 40% por encima del sueldo pactado.',
        yes: [
          'EsSalud: 9% de la remuneración asegurable, con base mínima de 1 RMV',
          'Provisión de CTS: un doceavo de la remuneración computable por mes',
          `Provisión de gratificaciones: dos sueldos al año más la bonificación extraordinaria del ${(BONIF_GRATI * 100).toFixed(0)}% (Ley 30334)`,
          'Provisión de vacaciones: un doceavo por mes, para el descanso anual pagado',
        ],
        warn: [
          DISCLAIMER_FIN,
          'La estimación no incluye SCTR (obligatorio solo en actividades de riesgo), seguro de vida ley, ni los costos de un eventual cese',
          'En microempresa y pequeña empresa acreditadas en el REMYPE el paquete de beneficios es reducido: esta cuenta es la del régimen general',
        ],
        plazo: 'las gratificaciones se pagan en la primera quincena de julio y de diciembre; la CTS se deposita en mayo y en noviembre.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Todo en soles y en valores mensuales. Puedes dejar el ejemplo cargado y volver después con tus números.',
  fields: [
    {
      id: 'bruto',
      label: 'Sueldo bruto mensual (S/)',
      prefix: 'S/',
      value: 3500,
      thousands: true,
      help: 'La remuneración pactada en tu contrato, antes de cualquier descuento.',
    },
    {
      id: 'afp',
      label: 'Si estás en AFP, ¿en cuál?',
      type: 'select',
      value: 'Integra',
      options: [
        { value: 'Habitat', label: 'Hábitat' },
        { value: 'Integra', label: 'Integra' },
        { value: 'Prima', label: 'Prima' },
        { value: 'Profuturo', label: 'Profuturo' },
      ],
      help: 'Solo se usa en la rama de AFP: define la comisión por flujo que se te descuenta.',
    },
    {
      id: 'otros',
      label: 'Otros ingresos remunerativos del mes (S/)',
      prefix: 'S/',
      value: '0',
      thousands: true,
      help: 'Comisiones, bonificaciones fijas y todo lo que sea remuneración computable. No incluyas movilidad ni condiciones de trabajo.',
    },
    {
      id: 'horasDia',
      label: 'Horas de tu jornada diaria',
      type: 'number',
      value: 8,
      min: 1,
      max: 12,
      step: 1,
      help: 'Para llevar el sueldo a valor por hora y por día. La jornada legal máxima es de 8 horas diarias o 48 semanales (DS 007-2002-TR).',
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'Qué pasa con cada sol del sueldo',
    caption:
      'Compara lo que efectivamente llega a tu cuenta con lo que se va al sistema de pensiones y a la retención de quinta categoría. En la rama del empleador, compara el sueldo con las cargas que la empresa paga encima.',
  },
  breakdownTitle: 'Tu boleta, línea por línea',
  breakdownIntro:
    'El mismo orden de una boleta de pago: remuneración, descuentos de ley, neto, y aparte lo que aporta la empresa.',

  faq: [
    {
      q: '¿Cuánto me descuentan del sueldo en el Perú?',
      a: `Dos cosas, y solo dos. Primero, el sistema de pensiones: 13% si estás en la ONP, o alrededor del 12,5% si estás en una AFP (10% al fondo, más la prima del seguro y la comisión de la administradora). Segundo, la retención del impuesto a la renta de quinta categoría, que solo aparece cuando tu ingreso anual proyectado supera las ${DEDUCCION_UIT} UIT (${sol(DEDUCCION_UIT * UIT)}). EsSalud no se descuenta: lo paga íntegro el empleador.`,
    },
    {
      q: '¿EsSalud sale de mi sueldo?',
      a: `No. El 9% de EsSalud es aporte del empleador y se calcula sobre tu remuneración asegurable, con una base mínima de una RMV (${sol(RMV)}). Aparece en la planilla, pero nunca en la columna de descuentos de tu boleta. Es una de las confusiones más comunes: mucha gente cree que le descuentan salud y en realidad ese costo lo asume la empresa.`,
    },
    {
      q: '¿Desde qué sueldo me empiezan a retener renta de quinta categoría?',
      a: `Cuando tu ingreso anual proyectado supera las ${DEDUCCION_UIT} UIT, es decir ${sol(DEDUCCION_UIT * UIT)} al año. Como el año en planilla son 14 remuneraciones (12 sueldos más las gratificaciones de julio y diciembre), el umbral mensual ronda los ${sol((DEDUCCION_UIT * UIT) / 14)}. Por debajo de eso la retención es cero, aunque igual figures en planilla.`,
    },
    {
      q: '¿Conviene más la AFP o la ONP?',
      a: 'Depende de cuántos años vas a aportar y de tu edad. La ONP descuenta más (13% contra ~12,5%) y exige 20 años de aportes para tener derecho a pensión: si no llegas a ese mínimo, no cobras pensión de jubilación. La AFP te devuelve lo acumulado sin exigir años mínimos, pero el resultado depende de la rentabilidad del fondo y de la comisión que te cobren. Con carreras laborales cortas o informales, la AFP suele proteger mejor lo aportado.',
    },
    {
      q: '¿Qué es la asignación familiar y cuánto es?',
      a: `Es el 10% de la RMV: ${sol(ASIGNACION_FAMILIAR)} al mes con la remuneración mínima vigente. Le corresponde a todo trabajador del régimen laboral privado con hijos menores de 18 años, o hasta los 24 si cursan estudios superiores. Es un monto fijo por trabajador, no por hijo: con uno o con cuatro hijos cobras lo mismo. Y cuenta como remuneración, así que entra en la base de CTS, gratificaciones, vacaciones y EsSalud.`,
    },
    {
      q: '¿Cuánto le cuesta realmente a la empresa pagarme?',
      a: `Bastante más que el sueldo pactado. Sobre tu remuneración la empresa suma el 9% de EsSalud y provisiona un doceavo de CTS, un doceavo de vacaciones y dos gratificaciones anuales con su bonificación extraordinaria del ${(BONIF_GRATI * 100).toFixed(0)}%. En el régimen general eso deja el costo total en torno a un 40% por encima del sueldo. Por eso una negociación salarial "de 500 soles más" le cuesta a la empresa cerca de 700.`,
    },
    {
      q: '¿Cómo paso de sueldo neto a sueldo bruto?',
      a: 'No hay una fórmula directa, porque la retención de quinta categoría es progresiva y hace que la relación no sea lineal. Lo que se hace es buscar el bruto que produce el neto deseado, probando valores hasta que cierren. La calculadora de este hub lo resuelve por ti cuando cargas tu sueldo bruto: mira el neto resultante y ajusta.',
    },
    {
      q: '¿Cuánto es mi sueldo por hora y por día?',
      a: 'El valor día se obtiene dividiendo la remuneración mensual entre 30 (siempre 30, aunque el mes tenga 28 o 31 días), y el valor hora se obtiene dividiendo el valor día entre las horas de tu jornada. Con la jornada legal de 8 horas eso es el sueldo mensual dividido entre 240. Ese valor hora es el que se usa después para calcular horas extra, descuentos por tardanza y feriados trabajados.',
    },
    {
      q: '¿Las gratificaciones tienen descuento de AFP u ONP?',
      a: 'No. Por la Ley 30334 las gratificaciones de julio y diciembre están inafectas a los aportes previsionales y a EsSalud, y en lugar del aporte de salud el trabajador recibe una bonificación extraordinaria del 9% del monto de la gratificación (6,75% si está afiliado a una EPS). Sí pagan impuesto a la renta de quinta categoría, porque son renta de trabajo.',
    },
    {
      q: '¿Y la CTS, se descuenta del sueldo?',
      a: 'Tampoco. La CTS es un beneficio social que deposita el empleador en una cuenta a tu nombre en mayo y en noviembre, además del sueldo. No sale de tu remuneración ni se retiene. Es dinero tuyo con un régimen de disponibilidad propio, y no está afecta al impuesto a la renta de trabajo.',
    },
    {
      q: '¿Qué pasa si mi sueldo es menor a la RMV?',
      a: `A jornada completa no puede serlo: la remuneración mínima vital es de ${sol(RMV)} y es un piso legal. En jornada parcial (menos de 4 horas diarias en promedio) sí puede pagarse proporcionalmente menos, pero el aporte a EsSalud igual se calcula sobre la base mínima de una RMV, así que el costo para la empresa no baja en la misma proporción.`,
    },
    {
      q: '¿La boleta de un trabajador de microempresa es igual?',
      a: 'No. Los regímenes de micro y pequeña empresa acreditados en el REMYPE tienen un paquete reducido: la microempresa no paga CTS ni gratificaciones y las vacaciones son de 15 días; la pequeña empresa paga media CTS, medias gratificaciones y 15 días de vacaciones. Las cuentas de este hub son las del régimen laboral general, que es el que aplica a la mayoría de trabajadores en planilla.',
    },
  ],

  sources: [
    { name: 'SUNAT — Rentas de trabajo: cuarta y quinta categoría', url: 'https://www.sunat.gob.pe/orientacion/rentasTrabajo/index.html', publisher: 'SUNAT' },
    { name: 'SUNAT — Unidad Impositiva Tributaria (UIT) por año', url: 'https://www.sunat.gob.pe/indicestasas/uit.html', publisher: 'SUNAT' },
    { name: 'EsSalud — Aportaciones del empleador', url: 'https://www.essalud.gob.pe/', publisher: 'EsSalud' },
    { name: 'SBS — Comisiones y primas del Sistema Privado de Pensiones', url: 'https://www.sbs.gob.pe/app/spp/empleadores/tasas_aportes/paginas/tasas_aportes.aspx', publisher: 'Superintendencia de Banca, Seguros y AFP' },
    { name: 'ONP — Sistema Nacional de Pensiones (DL 19990)', url: 'https://www.onp.gob.pe/', publisher: 'Oficina de Normalización Previsional' },
    { name: 'MTPE — Remuneración mínima vital y régimen laboral de la actividad privada', url: 'https://www.gob.pe/mtpe', publisher: 'Ministerio de Trabajo y Promoción del Empleo' },
  ],

  replaces: [
    '/pe/calculadora-sueldo-bruto-a-neto-peru',
    '/pe/calculadora-salario-por-hora-dia-peru',
    '/pe/calculadora-essalud-aporte-peru',
    '/pe/calculadora-costo-laboral-total-empleador-peru',
  ],

  lastReviewed: '2026-07-28',
};
