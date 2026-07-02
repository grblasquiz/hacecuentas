/**
 * Sala de decisión — "¿Nos conviene pagar guardería o reducir horas de trabajo?"
 *
 * Patrón COMPARACIÓN A vs B. Cuando llega un hijo, la pregunta no es solo "cuánto
 * sale la guardería", sino qué deja MÁS plata en la familia: trabajar full y pagar
 * guardería (y transporte), o reducir horas/jornada y cuidar al bebé en casa.
 *   A) Full + guardería: neto − guardería − transporte
 *   B) Reducir horas:    neto × (1 − reducción), sin guardería ni transporte
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const costoGuarderia = Math.max(0, num(inputs.costoGuarderiaMes));
  const sueldoNeto = Math.max(0, num(inputs.sueldoNetoQuienReduce));
  const transporte = Math.max(0, num(inputs.transporteMes));
  const reduccionPct = Math.max(0, Math.min(100, num(inputs.porcentajeReduccionHoras)));

  if (!sueldoNeto || (!costoGuarderia && reduccionPct === 0)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el sueldo neto de quien podría reducir horas, el costo de la guardería y el porcentaje de reducción de jornada para comparar las dos opciones.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Diferencia entre las dos opciones' },
      scenarios: [],
      nextActions: [
        'Cargá el **sueldo neto** de quien evaluaría reducir horas o dejar de trabajar.',
        'Cargá el **costo de la guardería** y el **% de reducción de jornada** que estás considerando.',
      ],
    };
  }

  // Opción A: seguir full, pagar guardería y transporte.
  const ingresoA = sueldoNeto - costoGuarderia - transporte;
  // Opción B: reducir horas (cae el sueldo proporcional), sin guardería ni transporte
  // (cuida al bebé en casa los días/horas que no trabaja → asumimos sin guardería).
  const ingresoB = sueldoNeto * (1 - reduccionPct / 100);

  const diff = ingresoA - ingresoB; // + => conviene A (full + guardería)
  const ingresoPerdidoB = sueldoNeto - ingresoB; // lo que resigna B en sueldo

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;
  const umbral = sueldoNeto * 0.05; // diferencia < 5% del neto = parejo

  if (diff > umbral) {
    status = 'a';
    tone = 'good';
    title = 'Conviene seguir full y pagar guardería';
    badge = 'Full + guardería';
    detail = `Trabajando full y pagando guardería te quedan ${fmtMoney(ingresoA)} netos por mes, contra ${fmtMoney(ingresoB)} si reducís horas: ${fmtMoney(diff)} más a favor de seguir trabajando. Aun pagando guardería y transporte, conservás más ingreso.`;
  } else if (diff < -umbral) {
    status = 'b';
    tone = 'good';
    title = 'Conviene reducir horas y cuidar en casa';
    badge = 'Reducir horas';
    detail = `Reduciendo la jornada te quedan ${fmtMoney(ingresoB)} netos por mes, contra ${fmtMoney(ingresoA)} si seguís full pagando guardería: ${fmtMoney(-diff)} más a favor de reducir. La guardería se come casi todo el sueldo extra, así que conviene estar más en casa.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por el bienestar, no por la plata';
    badge = 'Es parejo';
    detail = `Las dos opciones dejan casi lo mismo (${fmtMoney(ingresoA)} full+guardería vs ${fmtMoney(ingresoB)} reduciendo): la diferencia es de apenas ${fmtMoney(Math.abs(diff))}/mes. Decidí por tiempo con el bebé, carrera y bienestar, no por el bolsillo.`;
  }

  const scenarios = [
    {
      label: 'Full + guardería',
      value: fmtMoney(ingresoA),
      detail: `Sueldo neto − guardería (${fmtMoney(costoGuarderia)}) − transporte (${fmtMoney(transporte)}).`,
    },
    {
      label: 'Reducir horas',
      value: fmtMoney(ingresoB),
      detail: `Sueldo neto × ${(100 - reduccionPct).toFixed(0)}% (jornada reducida), sin guardería.`,
    },
    {
      label: 'Dejar de trabajar',
      value: fmtMoney(0),
      detail: `Caso extremo (100% de reducción): resignás los ${fmtMoney(sueldoNeto)} netos, pero no pagás guardería.`,
    },
  ];

  const comparison = {
    columns: ['Full + guardería', 'Reducir horas'] as [string, string],
    rows: [
      { label: 'Sueldo neto', a: fmtMoney(sueldoNeto), b: fmtMoney(ingresoB), hint: `B reduce ${fmtPct(reduccionPct)} la jornada` },
      { label: 'Guardería', a: '-' + fmtMoney(costoGuarderia).replace('-', ''), b: fmtMoney(0) },
      { label: 'Transporte al trabajo', a: '-' + fmtMoney(transporte).replace('-', ''), b: fmtMoney(0) },
      { label: 'Ingreso neto que te queda', a: fmtMoney(ingresoA), b: fmtMoney(ingresoB), hint: `${diff >= 0 ? '+' : ''}${fmtMoney(diff)} a favor de full` },
    ],
  };

  const nextActions = [
    'Mirá más allá del mes: reducir horas o dejar de trabajar también **baja tus aportes jubilatorios** y puede frenar tu carrera y futuros aumentos. La guardería es un costo que termina; el impacto sobre tu trayectoria laboral dura más.',
    diff > 0
      ? `Full + guardería te deja ${fmtMoney(diff)} más por mes: si elegís esa opción, buscá una guardería de confianza cerca para minimizar transporte y tiempos.`
      : `Reducir horas te deja ${fmtMoney(-diff)} más por mes hoy, pero pesá el costo de largo plazo en aportes y carrera antes de decidir.`,
    'Consultá si tu empleo ofrece **jornada reducida temporal**, home office o licencias: a veces se puede combinar lo mejor de las dos opciones sin resignar tanto.',
    'Revisá las **asignaciones familiares de ANSES**: reducen el costo neto de cualquiera de las dos alternativas.',
  ];

  const notes = [
    'Compara solo el ingreso mensual neto de cada opción. No valora el tiempo con el bebé ni el desgaste, que pesan en la decisión real.',
    'La opción "reducir horas" asume que en las horas/días que no trabajás cuidás al bebé en casa, por eso no carga guardería.',
    'No cuenta el impacto de largo plazo: menos aportes jubilatorios, posible freno de carrera y de aumentos. Considéralo aparte.',
    'Es orientativo y no es asesoramiento financiero ni laboral. Para tu caso (convenio, jornada legal) consultá con un profesional matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.abs(diff)) + '/mes',
      label: diff >= 0 ? 'Más plata trabajando full' : 'Más plata reduciendo horas',
      sub: `Full + guardería: **${fmtMoney(ingresoA)}** vs reducir horas: **${fmtMoney(ingresoB)}** netos por mes.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'guarderia-o-reducir-horas',
  title: '¿Guardería o reducir horas de trabajo? Comparador 2026',
  h1: '¿Nos conviene pagar guardería o reducir horas de trabajo?',
  description:
    'Compará trabajar full y pagar guardería contra reducir tu jornada para cuidar al bebé. Te decimos qué opción deja más plata neta por mes, considerando guardería, transporte y aportes jubilatorios.',
  intro:
    'Cuando llega un hijo, muchas familias dudan entre seguir trabajando full y pagar guardería, o reducir horas para cuidar en casa. La guardería puede comerse casi todo el sueldo extra. Esta sala compara las dos opciones con números: cuánto te queda neto por mes en cada una, descontando guardería y transporte, para que decidas con datos y no con culpa.',
  icon: '⚖️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    costoGuarderiaMes: 350000,
    sueldoNetoQuienReduce: 850000,
    transporteMes: 80000,
    porcentajeReduccionHoras: 50,
  },
  fields: [
    {
      id: 'sueldoNetoQuienReduce',
      label: 'Sueldo neto de quien evaluaría reducir',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '850000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'El sueldo neto (de bolsillo) de la persona que podría reducir horas o dejar de trabajar.',
      group: 'Tu trabajo',
      groupIcon: '💼',
    },
    {
      id: 'costoGuarderiaMes',
      label: 'Costo de la guardería por mes',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '350000',
      help: 'Cuota mensual de la guardería o niñera que necesitarías para seguir trabajando full.',
      group: 'Costos de trabajar',
      groupIcon: '🏫',
    },
    {
      id: 'transporteMes',
      label: 'Transporte al trabajo por mes',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '80000',
      help: 'Lo que gastás en ir y volver del trabajo cada mes (solo aplica si trabajás full).',
      group: 'Costos de trabajar',
    },
    {
      id: 'porcentajeReduccionHoras',
      label: 'Reducción de jornada',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      max: 100,
      placeholder: '50',
      help: '¿Cuánto reducirías la jornada? 50% = media jornada. 100% = dejar de trabajar.',
      group: 'Opción reducir horas',
      groupIcon: '⏱️',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
    { slug: 'calculadora-fire-retiro-temprano', label: 'Impacto en el largo plazo' },
  ],
  howItWorks: `Esta sala compara cuánta plata neta te queda en cada camino.

1. **Opción A — full + guardería.** Tomá tu sueldo neto y restale el costo de la guardería y el transporte al trabajo. Eso es lo que realmente te queda por mes si seguís trabajando jornada completa.
2. **Opción B — reducir horas.** Aplicá el porcentaje de reducción de jornada a tu sueldo neto (media jornada = 50% del sueldo). Como cuidás al bebé en casa esas horas, no pagás guardería ni transen esos días.
3. **Comparación.** Enfrenta el ingreso neto de cada opción y calcula la diferencia mensual a favor de una u otra.
4. **Veredicto.** Si la diferencia es chica (menos del 5% del sueldo), la decisión la define el bienestar, no la plata. Si es grande, te marca qué opción conserva más ingreso.
5. **El largo plazo.** Recuerda que reducir horas o dejar de trabajar baja tus aportes jubilatorios y puede frenar tu carrera: un costo que la comparación mensual no captura y conviene pesar aparte.`,
  faq: [
    {
      q: '¿Conviene pagar guardería o reducir horas de trabajo?',
      a: 'Depende de cuánto cueste la guardería frente a tu sueldo. Si la cuota se come casi todo lo que ganás, puede convenir reducir horas; si te sigue quedando ingreso después de pagarla, conviene trabajar full. Esta sala compara el ingreso neto de cada opción para que lo veas con números.',
    },
    {
      q: '¿Por qué a veces la guardería "se come el sueldo"?',
      a: 'Porque la cuota de guardería más el transporte pueden representar una porción enorme del sueldo neto, sobre todo en jornadas de medio tiempo o sueldos más bajos. En esos casos, el ingreso extra de trabajar full es chico y puede convenir reducir horas.',
    },
    {
      q: '¿Qué pasa con mis aportes jubilatorios si reduzco horas?',
      a: 'Si reducís la jornada o dejás de trabajar, hacés menos aportes y eso impacta tu jubilación futura y tus años de servicio. Es un costo de largo plazo que la comparación mensual no muestra, pero que conviene tener muy en cuenta antes de decidir.',
    },
    {
      q: '¿Tomo el sueldo bruto o el neto para comparar?',
      a: 'El neto (de bolsillo). Es la plata real que entra y con la que pagás la guardería. Si solo tenés el bruto, calculá primero el neto con la calculadora de sueldo en mano y después cargalo acá.',
    },
    {
      q: '¿Y si la diferencia entre las dos opciones es chica?',
      a: 'Cuando las dos opciones dejan casi lo mismo, la sala marca "es parejo": en ese caso la decisión la define el bienestar (tiempo con el bebé, carrera, energía), no el bolsillo. Elegí lo que mejor funcione para tu familia.',
    },
    {
      q: '¿Puedo combinar las dos opciones?',
      a: 'Sí, y suele ser lo mejor: jornada reducida con algo de guardería o ayuda familiar, home office, o licencias escalonadas. Usá la sala para ver los extremos y después negociá con tu empleo una combinación intermedia.',
    },
    {
      q: '¿Las asignaciones de ANSES cambian el resultado?',
      a: 'Reducen el costo neto de cualquiera de las dos opciones, así que conviene tramitarlas igual. La sala no las descuenta, por lo que el ingreso real de ambas alternativas puede ser algo mejor del que muestra.',
    },
    {
      q: '¿Esto es asesoramiento financiero o laboral?',
      a: 'No. Es una herramienta orientativa que compara ingresos netos. No reemplaza el consejo de un contador ni de un abogado laboral para tu caso particular (convenio, jornada legal, licencias).',
    },
  ],
  sources: [
    { name: 'Ley 20.744 (LCT) — Jornada y licencias', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552' },
    { name: 'ANSES — Asignaciones familiares', url: 'https://www.anses.gob.ar/' },
  ],
};
