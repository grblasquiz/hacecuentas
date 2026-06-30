/**
 * Sala de decisión — "¿Qué decisión mejora más mis finanzas?"
 *
 * Patrón PRIORIZACIÓN. Cargás el impacto mensual estimado de varias palancas
 * financieras (bajar alquiler, vender el auto, refinanciar deuda, subir
 * ingresos, cancelar cuotas, recortar gastos, invertir ahorros) y la sala las
 * rankea por impacto ANUAL (valor × 12). Devuelve la palanca ganadora y el
 * ranking completo, para que ataques primero lo que más mueve la aguja.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

interface Palanca {
  id: string;
  label: string;
  mensual: number;
}

function compute(inputs: Record<string, any>): DecisionResult {
  const palancas: Palanca[] = [
    { id: 'reducirAlquiler', label: 'Reducir el alquiler', mensual: Math.max(0, num(inputs.reducirAlquiler)) },
    { id: 'venderAuto', label: 'Vender el auto', mensual: Math.max(0, num(inputs.venderAuto)) },
    { id: 'refinanciarDeuda', label: 'Refinanciar la deuda', mensual: Math.max(0, num(inputs.refinanciarDeuda)) },
    { id: 'aumentarIngresos', label: 'Aumentar ingresos', mensual: Math.max(0, num(inputs.aumentarIngresos)) },
    { id: 'cancelarCuotas', label: 'Cancelar cuotas', mensual: Math.max(0, num(inputs.cancelarCuotas)) },
    { id: 'reducirGastos', label: 'Reducir gastos', mensual: Math.max(0, num(inputs.reducirGastos)) },
    { id: 'invertirAhorros', label: 'Invertir los ahorros', mensual: Math.max(0, num(inputs.invertirAhorros)) },
  ];

  const conImpacto = palancas.filter((p) => p.mensual > 0);

  if (conImpacto.length === 0) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el impacto mensual estimado de al menos una palanca (cuánto ahorrarías o ganarías por mes con cada decisión) para rankearlas.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Palanca de mayor impacto' },
      scenarios: [],
      nextActions: [
        'Cargá, para cada palanca que estés evaluando, **cuánto ganarías o ahorrarías por mes**.',
        'No hace falta llenarlas todas: con dos o tres ya podés ver cuál mueve más la aguja.',
      ],
    };
  }

  // Ranking por impacto ANUAL.
  const ranked = conImpacto
    .map((p) => ({ ...p, anual: p.mensual * 12 }))
    .sort((a, b) => b.anual - a.anual);

  const ganadora = ranked[0];
  const totalAnual = ranked.reduce((s, p) => s + p.anual, 0);
  const totalMensual = ranked.reduce((s, p) => s + p.mensual, 0);
  const pctGanadora = totalAnual > 0 ? (ganadora.anual / totalAnual) * 100 : 0;

  const status: DecisionResult['status'] = 'b';
  const tone: DecisionResult['verdict']['tone'] = 'good';
  const title = `Empezá por: ${ganadora.label.toLowerCase()}`;
  const badge = 'Prioridad clara';
  const detail = `${ganadora.label} es tu palanca de mayor impacto: ${fmtMoney(ganadora.mensual)}/mes, ${fmtMoney(ganadora.anual)} al año (el ${pctGanadora.toFixed(0)}% de todo lo que podés mejorar). Si hacés las ${ranked.length} mejoras juntas, son ${fmtMoney(totalMensual)}/mes (${fmtMoney(totalAnual)} al año).`;

  // Escenarios: top-1, top-3 y todo.
  const top3 = ranked.slice(0, 3).reduce((s, p) => s + p.anual, 0);
  const scenarios = [
    {
      label: 'Solo la #1',
      value: fmtMoney(ganadora.anual) + '/año',
      detail: `Si solo atacás ${ganadora.label.toLowerCase()}.`,
    },
    {
      label: 'Top 3',
      value: fmtMoney(top3) + '/año',
      detail: ranked.length >= 3
        ? `Las tres palancas de mayor impacto combinadas.`
        : 'Todas las palancas que cargaste.',
    },
    {
      label: 'Todo junto',
      value: fmtMoney(totalAnual) + '/año',
      detail: `Las ${ranked.length} mejoras aplicadas al mismo tiempo.`,
    },
  ];

  const breakdown = ranked.map((p, i) => ({
    label: `${i + 1}. ${p.label}`,
    value: fmtMoney(p.anual) + '/año',
    hint: `${fmtMoney(p.mensual)}/mes · ${totalAnual > 0 ? ((p.anual / totalAnual) * 100).toFixed(0) : 0}% del total`,
  }));
  breakdown.push({
    label: 'Total si hacés todo',
    value: fmtMoney(totalAnual) + '/año',
    hint: `${fmtMoney(totalMensual)}/mes`,
  });

  const segunda = ranked[1];
  const nextActions = [
    `Atacá primero **${ganadora.label.toLowerCase()}**: te deja ${fmtMoney(ganadora.anual)} al año, más que cualquier otra. Es donde tu esfuerzo rinde más.`,
    segunda
      ? `Tu segunda prioridad es **${segunda.label.toLowerCase()}** (${fmtMoney(segunda.anual)}/año). Encararla en paralelo si no compite con la primera.`
      : 'Cuando completes la #1, volvé y cargá nuevas palancas para encontrar la siguiente.',
    'No te disperses: una palanca bien ejecutada vale más que cinco intentadas a medias. Poné foco en la de arriba del ranking.',
    'Revisá que tus estimaciones de impacto sean realistas: una palanca grande pero improbable rinde menos que una chica pero segura. Ajustá los montos si dudás.',
  ];

  const notes = [
    'Rankea por impacto ANUAL (impacto mensual × 12) para comparar palancas de naturaleza distinta (un ahorro recurrente chico puede ganarle a uno grande de una sola vez si se sostiene todo el año).',
    'Los montos son tus estimaciones: la calidad del ranking depende de qué tan realistas sean. Cargá el impacto neto y sostenible, no el optimista.',
    'No suma intereses ni efectos compuestos de reinvertir lo ahorrado. No es asesoramiento financiero: es una herramienta de priorización.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ganadora.anual) + '/año',
      label: `Mayor impacto: ${ganadora.label.toLowerCase()}`,
      sub: `${fmtMoney(ganadora.mensual)}/mes. Total combinando las ${ranked.length} palancas: **${fmtMoney(totalAnual)}/año**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'que-decision-mejora-mas-mis-finanzas',
  title: '¿Qué decisión mejora más mis finanzas? Ranking de impacto 2026',
  h1: '¿Qué decisión mejora más mis finanzas?',
  description:
    'Cargá el impacto mensual de cada decisión financiera (bajar el alquiler, vender el auto, refinanciar, subir ingresos, recortar gastos, invertir) y descubrí cuál mueve más la aguja, rankeada por impacto anual.',
  intro:
    'Tenés varias formas de mejorar tus finanzas, pero no todas rinden igual y no podés con todas a la vez. Esta sala toma el impacto mensual de cada palanca (alquiler, auto, deuda, ingresos, cuotas, gastos, inversión), las rankea por impacto anual y te dice por dónde empezar para que tu esfuerzo rinda lo máximo posible.',
  icon: '🎯',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    reducirAlquiler: 100000,
    venderAuto: 80000,
    refinanciarDeuda: 60000,
    aumentarIngresos: 250000,
    cancelarCuotas: 45000,
    reducirGastos: 70000,
    invertirAhorros: 40000,
  },
  fields: [
    {
      id: 'aumentarIngresos',
      label: 'Aumentar ingresos',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '250000',
      help: 'Cuánto más ganarías por mes con un aumento, un trabajo extra o un cliente nuevo.',
      group: 'Subir ingresos',
      groupIcon: '📈',
    },
    {
      id: 'reducirAlquiler',
      label: 'Reducir el alquiler',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '100000',
      help: 'Cuánto ahorrarías por mes mudándote a algo más barato o renegociando.',
      group: 'Bajar gastos fijos',
      groupIcon: '🏠',
    },
    {
      id: 'venderAuto',
      label: 'Vender el auto',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '80000',
      help: 'Ahorro mensual en seguro, patente, nafta y mantenimiento si lo vendés.',
      group: 'Bajar gastos fijos',
    },
    {
      id: 'reducirGastos',
      label: 'Reducir gastos',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '70000',
      help: 'Recortes mensuales en suscripciones, salidas, consumos no esenciales.',
      group: 'Bajar gastos fijos',
    },
    {
      id: 'refinanciarDeuda',
      label: 'Refinanciar la deuda',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '60000',
      help: 'Cuánto bajaría tu cuota mensual al refinanciar a mejor tasa.',
      group: 'Ordenar deudas',
      groupIcon: '💳',
    },
    {
      id: 'cancelarCuotas',
      label: 'Cancelar cuotas',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '45000',
      help: 'Cuota mensual que dejarías de pagar al cancelar una compra en cuotas.',
      group: 'Ordenar deudas',
    },
    {
      id: 'invertirAhorros',
      label: 'Invertir los ahorros',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '40000',
      help: 'Rendimiento mensual estimado de poner a trabajar tu plata quieta.',
      group: 'Hacer rendir',
      groupIcon: '💰',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
  ],
  howItWorks: `Esta sala ordena tus decisiones financieras por cuánto mueven la aguja en un año.

1. **Impacto mensual de cada palanca.** Cargás cuánto ganarías o ahorrarías por mes con cada decisión (subir ingresos, bajar alquiler, vender el auto, refinanciar, cancelar cuotas, recortar gastos, invertir).
2. **Pase a impacto anual.** Multiplica cada impacto mensual por 12. Anualizar permite comparar parejo palancas de distinto tipo.
3. **Ranking.** Ordena las palancas de mayor a menor impacto anual y marca cuál es la #1, con qué porcentaje del total representa.
4. **Combinaciones.** Calcula cuánto sumás si hacés solo la #1, las tres primeras, o todas juntas.
5. **Foco.** El consejo es atacar primero la de arriba: concentrar el esfuerzo donde más rinde supera a dispersarse en muchas mejoras chicas.`,
  faq: [
    {
      q: '¿Por qué rankean por impacto anual y no mensual?',
      a: 'Porque anualizar (×12) deja todas las palancas en la misma unidad y muestra el efecto sostenido. Un ahorro de $40.000/mes parece chico, pero son $480.000 al año. Comparar montos anuales evita subestimar las mejoras recurrentes.',
    },
    {
      q: '¿Tengo que llenar todas las palancas?',
      a: 'No. Cargá solo las que estés evaluando de verdad. Con dos o tres alcanza para ver cuál conviene priorizar. Las que dejes en cero simplemente no entran al ranking.',
    },
    {
      q: '¿Cómo estimo el impacto de cada decisión?',
      a: 'Poné el ahorro o ingreso NETO y sostenible por mes. Para "vender el auto" sumá seguro, patente, nafta y mantenimiento que dejarías de pagar. Para "invertir" usá un rendimiento mensual razonable. Cuanto más realistas las estimaciones, mejor el ranking.',
    },
    {
      q: '¿Por qué conviene atacar una sola palanca primero?',
      a: 'Porque el esfuerzo y la atención son limitados. Una mejora grande bien ejecutada rinde más que cinco intentadas a medias. La sala te dice cuál es esa primera para que pongas el foco donde más mueve la aguja.',
    },
    {
      q: '¿Aumentar ingresos siempre gana?',
      a: 'No necesariamente. Depende de los montos que cargues. A veces bajar un gasto fijo grande (alquiler, auto) rinde más y es más rápido y seguro que conseguir un aumento. Por eso la sala compara con tus números reales, no con reglas generales.',
    },
    {
      q: '¿Considera el interés compuesto de lo que invierto o ahorro?',
      a: 'No directamente: rankea por el impacto anual simple para mantener la comparación clara. Para ver el efecto compuesto de reinvertir lo que ahorrás, usá nuestra calculadora de interés compuesto con ese monto mensual.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta de priorización que ordena tus propias estimaciones. Para un plan financiero integral (deudas, inversiones, impuestos) consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'CNV — Educación financiera', url: 'https://www.argentina.gob.ar/cnv' },
    { name: 'BCRA — Saber más (educación financiera)', url: 'https://www.bcra.gob.ar/' },
  ],
};
