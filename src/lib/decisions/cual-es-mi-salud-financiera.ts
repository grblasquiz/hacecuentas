/**
 * Sala de decisión — "¿Cuál es mi salud financiera?"
 *
 * Patrón SCORE EXPLICABLE. Calcula tres sub-scores (0-100) sobre tres pilares de
 * la salud financiera y los pondera en un puntaje total con nivel
 * (Sólida/Aceptable/Frágil):
 *   - Liquidez:       meses de fondo de emergencia (ahorros / gastos)
 *   - Endeudamiento:  cuotas de deuda / ingreso (DTI; <30% es sano)
 *   - Ahorro:         tasa de ahorro = (ingreso − gastos) / ingreso
 * El desglose muestra cada sub-score para que el número sea explicable, no mágico.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoMensual));
  const gastos = Math.max(0, num(inputs.gastosMensual));
  const deudaTotal = Math.max(0, num(inputs.deudaTotal));
  const cuotasMes = Math.max(0, num(inputs.cuotasDeudaMes));
  const ahorros = Math.max(0, num(inputs.ahorros));

  if (!ingreso || !gastos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu ingreso y tus gastos mensuales para calcular tu puntaje de salud financiera. Sumá deuda, cuotas y ahorros para los tres pilares completos.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Puntaje de salud financiera' },
      scenarios: [],
      nextActions: [
        'Cargá tu **ingreso** y tus **gastos** mensuales.',
        'Sumá tus **ahorros**, tu **deuda total** y las **cuotas de deuda** que pagás por mes.',
      ],
    };
  }

  // — Pilar 1: Liquidez (meses de fondo de emergencia). 6 meses = 100. —
  const mesesFondo = gastos > 0 ? ahorros / gastos : 0;
  const scoreLiquidez = clamp((mesesFondo / 6) * 100);

  // — Pilar 2: Endeudamiento (DTI = cuotas / ingreso). <=10% = 100; >=50% = 0. —
  const dti = ingreso > 0 ? cuotasMes / ingreso : 0;
  const scoreEndeudamiento = clamp(((0.5 - dti) / (0.5 - 0.1)) * 100);

  // — Pilar 3: Ahorro (tasa = (ingreso - gastos) / ingreso). 20% = 100; <=0 = 0. —
  const tasaAhorro = ingreso > 0 ? (ingreso - gastos) / ingreso : 0;
  const scoreAhorro = clamp((tasaAhorro / 0.2) * 100);

  // — Score total ponderado —
  const scoreTotal = Math.round(
    scoreLiquidez * 0.35 + scoreEndeudamiento * 0.3 + scoreAhorro * 0.35
  );

  let status: DecisionResult['status'];
  let nivel: string;
  let tone: DecisionResult['verdict']['tone'];
  if (scoreTotal >= 70) {
    status = 'b';
    nivel = 'Sólida';
    tone = 'good';
  } else if (scoreTotal >= 45) {
    status = 'tie';
    nivel = 'Aceptable';
    tone = 'neutral';
  } else {
    status = 'a';
    nivel = 'Frágil';
    tone = 'warn';
  }

  const fmtMeses = (m: number) =>
    `${m.toFixed(1).replace('.', ',').replace(',0', '')} meses`;
  const fmtPctVal = (p: number) => `${(p * 100).toFixed(0)}%`;
  const fmtScore = (s: number) => `${Math.round(s)}/100`;

  const detail = `Tu salud financiera es ${nivel.toLowerCase()} (${scoreTotal}/100). Tenés ${fmtMeses(mesesFondo)} de fondo de emergencia, tus cuotas de deuda se llevan el ${fmtPctVal(dti)} de tu ingreso y ahorrás el ${fmtPctVal(tasaAhorro)} de lo que ganás. El pilar más flojo es el que más conviene atacar.`;

  // El pilar más débil, para guiar la acción.
  const pilares = [
    { id: 'liquidez', label: 'liquidez (fondo de emergencia)', score: scoreLiquidez },
    { id: 'endeudamiento', label: 'endeudamiento (peso de las cuotas)', score: scoreEndeudamiento },
    { id: 'ahorro', label: 'capacidad de ahorro', score: scoreAhorro },
  ].sort((a, b) => a.score - b.score);
  const masDebil = pilares[0];

  const scenarios = [
    {
      label: 'Liquidez',
      value: fmtScore(scoreLiquidez),
      detail: `${fmtMeses(mesesFondo)} de gastos cubiertos (meta: 6 meses).`,
    },
    {
      label: 'Endeudamiento',
      value: fmtScore(scoreEndeudamiento),
      detail: `Cuotas = ${fmtPctVal(dti)} de tu ingreso (sano: menos de 30%).`,
    },
    {
      label: 'Ahorro',
      value: fmtScore(scoreAhorro),
      detail: `Ahorrás ${fmtPctVal(tasaAhorro)} de tu ingreso (meta: 20%).`,
    },
  ];

  const breakdown = [
    {
      label: 'Liquidez — fondo de emergencia',
      value: fmtScore(scoreLiquidez),
      hint: `${fmtMeses(mesesFondo)} cubiertos · pondera 35%`,
    },
    {
      label: 'Endeudamiento — peso de las cuotas',
      value: fmtScore(scoreEndeudamiento),
      hint: `DTI ${fmtPctVal(dti)} · pondera 30%`,
    },
    {
      label: 'Ahorro — tasa de ahorro',
      value: fmtScore(scoreAhorro),
      hint: `${fmtPctVal(tasaAhorro)} del ingreso · pondera 35%`,
    },
    {
      label: 'Deuda total / ingreso anual',
      value: `${ingreso > 0 ? (deudaTotal / (ingreso * 12)).toFixed(2).replace('.', ',') : '—'}×`,
      hint: 'referencia: cuántos ingresos anuales debés',
    },
    {
      label: 'Puntaje total',
      value: `${scoreTotal}/100`,
      hint: `Nivel: ${nivel}`,
    },
  ];

  const accionPorPilar: Record<string, string> = {
    liquidez: `Tu punto más flojo es la **liquidez**: tenés ${fmtMeses(mesesFondo)} de fondo y lo sano son 6. Priorizá armar ese colchón antes que invertir o gastar de más.`,
    endeudamiento: `Tu punto más flojo es el **endeudamiento**: las cuotas se llevan el ${fmtPctVal(dti)} de tu ingreso (lo sano es menos del 30%). Refinanciá o cancelá la deuda más cara para liberar margen.`,
    ahorro: `Tu punto más flojo es el **ahorro**: guardás el ${fmtPctVal(tasaAhorro)} de tu ingreso y la meta es 20%. Revisá tu presupuesto con la regla 50/30/20 para subir ese número.`,
  };

  const nextActions = [
    accionPorPilar[masDebil.id],
    scoreLiquidez < 70
      ? `Apuntá a un fondo de emergencia de **${fmtMoney(gastos * 6)}** (6 meses de gastos). Es la base de todo: sin colchón, cualquier imprevisto te endeuda.`
      : 'Tu fondo de emergencia está sólido ✓. Mantenelo y enfocá tu energía en hacer rendir el excedente.',
    dti > 0.3
      ? `Tus cuotas (${fmtPctVal(dti)} del ingreso) superan el umbral sano del 30%: evitá tomar deuda nueva y prioritá bajar la actual.`
      : 'Tu nivel de deuda está bajo control ✓. Cuidá no superar el 30% del ingreso en cuotas.',
    'Reevaluá tu puntaje cada 3 meses: la salud financiera se construye con hábitos sostenidos, no con un movimiento puntual.',
  ];

  const notes = [
    'El puntaje pondera tres pilares: liquidez 35% (meses de fondo de emergencia, meta 6), endeudamiento 30% (cuotas/ingreso, sano <30%) y ahorro 35% (tasa de ahorro, meta 20%). Cada sub-score va de 0 a 100.',
    'Es una foto orientativa basada en lo que cargás: no contempla patrimonio, ingresos variables ni el costo (tasa) de tus deudas. Un puntaje alto no garantiza estar a salvo de todo imprevisto.',
    'No es asesoramiento financiero. Para un diagnóstico a medida y un plan de mejora, consultá con un asesor financiero matriculado.',
  ];

  return {
    status,
    verdict: { title: `Salud financiera: ${nivel}`, detail, tone, badge: nivel },
    decisiveNumber: {
      value: `${scoreTotal}/100`,
      label: `Salud financiera: ${nivel}`,
      sub: `Liquidez ${fmtScore(scoreLiquidez)} · Endeudamiento ${fmtScore(scoreEndeudamiento)} · Ahorro ${fmtScore(scoreAhorro)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cual-es-mi-salud-financiera',
  title: '¿Cuál es mi salud financiera? Puntaje 0-100 explicable 2026',
  h1: '¿Cuál es mi salud financiera?',
  description:
    'Obtené un puntaje de salud financiera de 0 a 100 con nivel (Sólida, Aceptable o Frágil) a partir de tres pilares: liquidez (fondo de emergencia), endeudamiento (peso de las cuotas) y capacidad de ahorro. Con desglose explicable.',
  intro:
    '¿Estás bien parado o estás más expuesto de lo que creés? Esta sala te da un puntaje de salud financiera de 0 a 100, construido sobre tres pilares concretos: cuántos meses de fondo de emergencia tenés, cuánto de tu ingreso se llevan las cuotas y qué porcentaje ahorrás. No es un número mágico: te mostramos cada sub-score para que sepas exactamente qué mejorar.',
  icon: '🩺',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    ingresoMensual: 1500000,
    gastosMensual: 1100000,
    deudaTotal: 2000000,
    cuotasDeudaMes: 300000,
    ahorros: 3000000,
  },
  fields: [
    {
      id: 'ingresoMensual',
      label: 'Ingreso mensual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'Todo lo que entra por mes en tu hogar (neto, en la mano).',
      group: 'Ingresos y gastos',
      groupIcon: '💵',
    },
    {
      id: 'gastosMensual',
      label: 'Gastos mensuales',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1100000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Todo lo que gastás por mes para vivir.',
      group: 'Ingresos y gastos',
    },
    {
      id: 'ahorros',
      label: 'Ahorros',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '3000000',
      profileKey: 'finanzas.ahorros',
      help: 'Plata líquida disponible (fondo de emergencia, plazo fijo, dólares).',
      group: 'Tu colchón',
      groupIcon: '🛟',
    },
    {
      id: 'cuotasDeudaMes',
      label: 'Cuotas de deuda por mes',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '300000',
      help: 'Lo que pagás por mes en cuotas de préstamos, tarjeta y financiaciones.',
      group: 'Tus deudas',
      groupIcon: '💳',
    },
    {
      id: 'deudaTotal',
      label: 'Deuda total',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '2000000',
      profileKey: 'finanzas.deudas',
      help: 'El saldo total que debés (suma de todos los créditos y tarjetas).',
      group: 'Tus deudas',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
  ],
  howItWorks: `Esta sala arma un puntaje explicable a partir de tres pilares de la salud financiera.

1. **Liquidez (35%).** Mide cuántos meses de gastos cubren tus ahorros. Seis meses de fondo de emergencia es el ideal y vale 100 puntos; menos baja proporcional.
2. **Endeudamiento (30%).** Calcula el ratio cuotas/ingreso (DTI). Si tus cuotas son el 10% o menos del ingreso, 100 puntos; a partir del 50% el pilar cae a 0. El umbral sano es 30%.
3. **Ahorro (35%).** Tu tasa de ahorro: (ingreso − gastos) ÷ ingreso. Ahorrar el 20% o más vale 100 puntos; si no ahorrás, 0.
4. **Puntaje total.** Pondera los tres sub-scores (35% + 30% + 35%) en un único número de 0 a 100 y le asigna un nivel: Sólida (70+), Aceptable (45-69) o Frágil (menos de 45).
5. **Foco.** Identifica tu pilar más débil y te dice qué atacar primero para subir el puntaje con el menor esfuerzo.`,
  faq: [
    {
      q: '¿Cómo se calcula el puntaje de salud financiera?',
      a: 'Con tres sub-scores de 0 a 100: liquidez (meses de fondo de emergencia), endeudamiento (cuotas sobre ingreso) y ahorro (tasa de ahorro). Se ponderan 35%, 30% y 35% respectivamente para dar el puntaje total. Mostramos cada sub-score para que sea transparente.',
    },
    {
      q: '¿Qué significa cada nivel?',
      a: 'Sólida (70-100): tenés colchón, deuda bajo control y ahorrás. Aceptable (45-69): estás encaminado pero con un pilar flojo. Frágil (menos de 45): estás expuesto, conviene reforzar urgente el pilar más débil. El nivel resume tu situación general.',
    },
    {
      q: '¿Por qué el fondo de emergencia es tan importante?',
      a: 'Porque es el pilar que pondera más junto al ahorro (35%). Sin un colchón de 3 a 6 meses de gastos, cualquier imprevisto (un gasto médico, perder el trabajo) te obliga a endeudarte, muchas veces a tasas altas. Es la base de toda salud financiera.',
    },
    {
      q: '¿Qué es el ratio cuotas/ingreso (DTI)?',
      a: 'Es cuánto de tu ingreso mensual se va en pagar cuotas de deuda. La regla sana es no superar el 30%. Por encima de eso, las cuotas ahogan tu presupuesto y te dejan sin margen para ahorrar o afrontar imprevistos.',
    },
    {
      q: '¿Cuánto debería ahorrar para tener buen puntaje?',
      a: 'La meta de máximo puntaje es ahorrar el 20% de tu ingreso, alineado con la regla 50/30/20 (50% necesidades, 30% deseos, 20% ahorro). Ahorrar algo siempre suma; el pilar premia proporcionalmente hasta llegar a ese 20%.',
    },
    {
      q: '¿El puntaje considera el costo de mis deudas?',
      a: 'No directamente: mide el peso de las cuotas sobre tu ingreso, no la tasa de cada deuda. Una deuda cara (tarjeta) es más urgente de cancelar que una barata, aunque la cuota sea igual. Tené eso en cuenta al priorizar.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es un diagnóstico orientativo y explicable basado en los datos que cargás. No reemplaza un análisis profesional de tu patrimonio y tus deudas. Para un plan a medida, consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'BCRA — Saber más (educación financiera)', url: 'https://www.bcra.gob.ar/' },
    { name: 'CNV — Educación financiera', url: 'https://www.argentina.gob.ar/cnv' },
  ],
};
