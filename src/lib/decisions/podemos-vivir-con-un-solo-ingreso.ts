/**
 * Sala de decisión — "¿Podemos vivir con un solo ingreso?"
 *
 * Patrón EVALUACIÓN (¿podemos?). Si uno de los dos ingresos desaparece (licencia,
 * dejar de trabajar, despido), ¿el ingreso que queda alcanza para cubrir los
 * gastos? Y si no, ¿cuántos meses aguanta el ahorro tapando el déficit?
 *   déficit = (gastos − gastos reducibles) − ingreso1
 *   meses de aire = ahorros / max(1, déficit)
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso1 = Math.max(0, num(inputs.ingreso1));
  const ingreso2 = Math.max(0, num(inputs.ingreso2));
  const gastos = Math.max(0, num(inputs.gastosMensuales));
  const reducibles = Math.max(0, Math.min(gastos, num(inputs.gastosReducibles)));
  const ahorros = Math.max(0, num(inputs.ahorros));

  if (!ingreso1 || !gastos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el ingreso que se mantendría y tus gastos mensuales para ver si alcanza. Sumá ahorros y gastos recortables para saber cuántos meses aguantás si no alcanza.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Déficit mensual con un solo ingreso' },
      scenarios: [],
      nextActions: [
        'Cargá el **ingreso que se mantendría** (ingreso 1) y tus **gastos mensuales** totales.',
        'Sumá tus **ahorros** y los **gastos que podrías recortar** para ver cuánto aire tenés.',
      ],
    };
  }

  const gastosEsenciales = gastos - reducibles; // gasto mínimo de vida
  const deficitPleno = gastos - ingreso1; // sin recortar nada
  const deficitAjustado = gastosEsenciales - ingreso1; // ya recortando lo recortable

  const fmtMeses = (m: number) =>
    !isFinite(m) || m > 600
      ? '∞ (alcanza)'
      : m <= 0
      ? '0 meses'
      : `${m.toFixed(1).replace('.', ',').replace(',0', '')} meses`;

  // Meses que aguanta el ahorro tapando el déficit AJUSTADO (modo supervivencia).
  const mesesAire = deficitAjustado <= 0 ? Infinity : ahorros / deficitAjustado;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (deficitPleno <= 0) {
    // El ingreso 1 cubre TODO sin necesidad de recortar.
    status = 'b';
    tone = 'good';
    title = 'Sí: el ingreso que queda cubre todos los gastos';
    badge = 'Alcanza';
    detail = `Con ${fmtMoney(ingreso1)} de ingreso cubrís tus ${fmtMoney(gastos)} de gastos y te sobran ${fmtMoney(-deficitPleno)} por mes. Podés vivir con un solo ingreso sin tocar los ahorros.`;
  } else if (deficitAjustado <= 0) {
    // No cubre todo, pero recortando lo recortable sí.
    status = 'b';
    tone = 'good';
    title = 'Sí, ajustando: recortando gastos el ingreso alcanza';
    badge = 'Alcanza ajustando';
    detail = `Con todos los gastos te falta ${fmtMoney(deficitPleno)}/mes, pero si recortás los ${fmtMoney(reducibles)} de gastos prescindibles, los ${fmtMoney(gastosEsenciales)} esenciales quedan cubiertos por tu ingreso de ${fmtMoney(ingreso1)}. Podés vivir con un solo ingreso apretando el cinturón.`;
  } else if (isFinite(mesesAire) && mesesAire > 12) {
    // No alcanza ni ajustando, pero el ahorro aguanta más de un año.
    status = 'tie';
    tone = 'neutral';
    title = 'Aguantás, pero a costa del ahorro';
    badge = 'Aguanta el ahorro';
    detail = `Aun recortando, te falta ${fmtMoney(deficitAjustado)}/mes. Tus ahorros de ${fmtMoney(ahorros)} tapan ese hueco durante ${fmtMeses(mesesAire)}: más de un año de aire, pero el ahorro se va consumiendo.`;
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Con un solo ingreso no cierra: planificá ya';
    badge = 'No cierra';
    detail = `Aun recortando los gastos prescindibles, te falta ${fmtMoney(deficitAjustado)} por mes. Tus ahorros cubren ese déficit solo ${fmtMeses(mesesAire)}. Antes de pasar a un solo ingreso necesitás más colchón o reducir más los gastos.`;
  }

  const scenarios = [
    {
      label: 'Sin recortar',
      value: deficitPleno <= 0 ? '+' + fmtMoney(-deficitPleno) : '-' + fmtMoney(deficitPleno),
      detail: deficitPleno <= 0
        ? 'Te sobra por mes manteniendo todos los gastos actuales.'
        : `Te falta por mes con todos los gastos (${fmtMoney(gastos)}).`,
    },
    {
      label: 'Recortando lo prescindible',
      value: deficitAjustado <= 0 ? '+' + fmtMoney(-deficitAjustado) : '-' + fmtMoney(deficitAjustado),
      detail: `Dejando solo los ${fmtMoney(gastosEsenciales)} de gastos esenciales.`,
    },
    {
      label: 'Aire del ahorro',
      value: fmtMeses(mesesAire),
      detail: deficitAjustado <= 0
        ? 'El ingreso alcanza: no necesitás tocar el ahorro.'
        : `Meses que tus ${fmtMoney(ahorros)} de ahorro tapan el déficit ajustado.`,
    },
  ];

  const breakdown = [
    { label: 'Ingreso que se mantiene', value: fmtMoney(ingreso1) },
    { label: 'Ingreso que se pierde', value: '-' + fmtMoney(ingreso2).replace('-', ''), hint: 'Lo que dejarías de cobrar' },
    { label: 'Gastos mensuales totales', value: fmtMoney(gastos) },
    { label: '− Gastos recortables', value: '-' + fmtMoney(reducibles).replace('-', '') },
    { label: 'Gastos esenciales (mínimo de vida)', value: fmtMoney(gastosEsenciales) },
    {
      label: 'Déficit mensual (ajustado)',
      value: deficitAjustado <= 0 ? 'Cubierto ✓' : '-' + fmtMoney(deficitAjustado).replace('-', ''),
      hint: deficitAjustado <= 0 ? 'El ingreso alcanza' : 'Lo que falta cada mes',
    },
    { label: 'Ahorros disponibles', value: fmtMoney(ahorros) },
    { label: 'Meses de aire', value: fmtMeses(mesesAire) },
  ];

  const nextActions = [
    deficitAjustado > 0
      ? `Te falta ${fmtMoney(deficitAjustado)}/mes aun ajustando: el objetivo es achicar ese hueco antes de pasar a un solo ingreso (más recortes, un ingreso parcial, o más ahorro).`
      : `Tu ingreso alcanza para los gastos esenciales: igual conviene mantener un colchón de al menos 6 meses (${fmtMoney(gastosEsenciales * 6)}) por las dudas.`,
    'Separá tus gastos en **esenciales y prescindibles** de verdad: suscripciones, salidas y compras impulsivas son lo primero a pausar si pasás a un solo ingreso.',
    'Antes de dar el paso, hacé una **"prueba de manejo"**: viví 2-3 meses con un solo ingreso guardando el otro, y comprobá si el presupuesto cierra en la práctica.',
    'Revisá si tenés acceso a **asignaciones o coberturas** (ANSES, obra social) que sostengan parte del gasto familiar mientras vivís con un ingreso.',
  ];

  const notes = [
    'El "déficit ajustado" asume que recortás todos los gastos que marcaste como recortables. Si no podés recortarlos todos, el déficit real es mayor.',
    'Los meses de aire suponen que el ahorro no rinde ni se ajusta por inflación: en la práctica la inflación licúa tanto el ahorro como los gastos.',
    'Es una estimación orientativa, no asesoramiento financiero. Para una decisión de este peso, armá un presupuesto detallado y, si podés, consultá con un asesor matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: deficitAjustado <= 0 ? 'Alcanza ✓' : fmtMoney(deficitAjustado) + '/mes',
      label: deficitAjustado <= 0 ? 'El ingreso cubre los gastos esenciales' : 'Déficit mensual (ya recortando)',
      sub: deficitAjustado <= 0
        ? `Ingreso ${fmtMoney(ingreso1)} ≥ gastos esenciales ${fmtMoney(gastosEsenciales)}.`
        : `Tus ahorros de ${fmtMoney(ahorros)} dan **${fmtMeses(mesesAire)}** de aire tapando ese déficit.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'podemos-vivir-con-un-solo-ingreso',
  title: '¿Podemos vivir con un solo ingreso? Test 2026',
  h1: '¿Podemos vivir con un solo ingreso?',
  description:
    'Averiguá si tu familia puede vivir con un solo ingreso: si lo que queda cubre los gastos, cuánto déficit hay recortando lo prescindible y cuántos meses aguanta tu ahorro tapando el hueco.',
  intro:
    'Pasar a un solo ingreso (por una licencia, para criar a un hijo o tras un despido) es una de las decisiones más grandes de una familia. La pregunta es simple: ¿alcanza? Esta sala compara el ingreso que queda contra tus gastos, calcula el déficit recortando lo prescindible y te dice cuántos meses aguanta tu ahorro tapando el hueco.',
  icon: '🏡',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    ingreso1: 1100000,
    ingreso2: 700000,
    gastosMensuales: 1250000,
    gastosReducibles: 300000,
    ahorros: 3000000,
  },
  fields: [
    {
      id: 'ingreso1',
      label: 'Ingreso que se mantiene',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1100000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'El ingreso neto que la familia seguiría cobrando (el que NO se pierde).',
      group: 'Ingresos',
      groupIcon: '💵',
    },
    {
      id: 'ingreso2',
      label: 'Ingreso que se perdería',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '700000',
      help: 'El ingreso neto que dejaría de entrar (quien deja de trabajar o toma licencia).',
      group: 'Ingresos',
    },
    {
      id: 'gastosMensuales',
      label: 'Gastos mensuales totales',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1250000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Todo lo que gasta la familia por mes hoy (alquiler, comida, servicios, etc.).',
      group: 'Gastos',
      groupIcon: '🧾',
    },
    {
      id: 'gastosReducibles',
      label: 'Gastos que podrías recortar',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '300000',
      help: 'La parte prescindible: salidas, suscripciones, compras evitables. Se restan para ver el mínimo de vida.',
      group: 'Gastos',
    },
    {
      id: 'ahorros',
      label: 'Ahorros disponibles',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '3000000',
      profileKey: 'finanzas.ahorros',
      help: 'Plata líquida que podrías usar para tapar el déficit mes a mes.',
      group: 'Colchón',
      groupIcon: '🛟',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
    { slug: 'calculadora-fire-retiro-temprano', label: 'Independencia financiera' },
    { slug: 'calculadora-interes-compuesto', label: 'Armar el colchón' },
  ],
  howItWorks: `Esta sala responde "¿alcanza?" en tres pasos.

1. **¿El ingreso cubre los gastos?** Compara el ingreso que se mantiene contra tus gastos mensuales totales. Si lo cubre y sobra, podés vivir con un solo ingreso sin tocar el ahorro.
2. **Modo ajustado.** Resta tus gastos recortables para quedarte con el gasto esencial (el mínimo de vida) y vuelve a comparar. Muchas veces el ingreso no cubre todo, pero sí lo esencial.
3. **Déficit mensual.** Si aun ajustando falta plata, calcula cuánto te falta por mes: ese es el hueco que vas a tener que tapar.
4. **Meses de aire.** Divide tus ahorros por el déficit ajustado para decirte cuántos meses aguanta el colchón cubriendo ese faltante.
5. **Veredicto.** Concluye si alcanza (con o sin ajuste), si aguantás a costa del ahorro (más de un año) o si todavía no cierra y necesitás más colchón o más recortes.`,
  faq: [
    {
      q: '¿Cómo sé si mi familia puede vivir con un solo ingreso?',
      a: 'Comparando el ingreso que se mantiene contra los gastos. Si cubre todos los gastos, alcanza con holgura; si cubre solo los esenciales tras recortar lo prescindible, alcanza ajustando; si no, hay un déficit que tendrás que tapar con ahorros. Esta sala te muestra en cuál de esos casos estás.',
    },
    {
      q: '¿Qué es el déficit ajustado?',
      a: 'Es lo que te falta por mes después de recortar los gastos prescindibles, quedándote solo con el gasto esencial de vida. Es el número más realista para saber cuánto aguantás, porque ante un solo ingreso casi todas las familias recortan lo evitable.',
    },
    {
      q: '¿Cuántos meses de ahorro debería tener antes de pasar a un solo ingreso?',
      a: 'Lo prudente es al menos 6 meses de gastos esenciales como fondo de emergencia, y más si el déficit con un solo ingreso es alto. La sala te dice cuántos meses aguanta tu ahorro actual tapando el déficit, para que veas si tenés margen suficiente.',
    },
    {
      q: '¿Conviene tomar el ingreso bruto o el neto?',
      a: 'El neto, siempre. Es la plata real que entra y con la que pagás los gastos. Si solo tenés el bruto, calculá primero el neto con la calculadora de sueldo en mano.',
    },
    {
      q: '¿La inflación afecta este cálculo?',
      a: 'Sí. Los meses de aire suponen ahorro y gastos estables, pero la inflación licúa el ahorro y empuja los gastos hacia arriba. Tomá el resultado como una foto de hoy y revisá el presupuesto cada pocos meses.',
    },
    {
      q: '¿Cómo puedo probarlo antes de decidir?',
      a: 'Hacé una "prueba de manejo": durante 2 o 3 meses viví con un solo ingreso y guardá el otro entero. Si el presupuesto cierra en la práctica, tenés evidencia real; y de paso aumentaste tu colchón.',
    },
    {
      q: '¿Sirve para evaluar un despido o una licencia?',
      a: 'Sí. Es el mismo cálculo: cargá como "ingreso que se pierde" el sueldo que desaparece y como "ingreso que se mantiene" el que queda. Para un despido, sumá la indemnización a tus ahorros para ver cuánto extiende tu aire.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa para una decisión grande. Armá un presupuesto detallado, considerá imprevistos y, si podés, consultá con un asesor financiero matriculado antes de dar el paso.',
    },
  ],
  sources: [
    { name: 'INDEC — Canasta básica total', url: 'https://www.indec.gob.ar/' },
    { name: 'ANSES — Asignaciones y prestaciones', url: 'https://www.anses.gob.ar/' },
  ],
};
