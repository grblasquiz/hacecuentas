/**
 * Sala de decisión — "¿Mi negocio es rentable?"
 *
 * Patrón DIAGNÓSTICO + BREAKDOWN. Toma ingresos, costos variables, costos fijos
 * y deuda mensual y calcula margen bruto, margen neto, punto de equilibrio (en $)
 * y el flujo del mes. El status sale del margen neto. Math inline determinístico.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingresos = Math.max(0, num(inputs.ingresosMes));
  const costosVar = Math.max(0, num(inputs.costosVariables));
  const costosFijos = Math.max(0, num(inputs.costosFijos));
  const deuda = Math.max(0, num(inputs.deudaMensual));

  if (!ingresos) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tus ingresos del mes y tus costos (variables y fijos) para medir tu margen y tu punto de equilibrio.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Margen neto' },
      scenarios: [],
      nextActions: [
        'Cargá tus **ingresos del mes** y tus **costos variables** (los que dependen de las ventas).',
        'Sumá tus **costos fijos** y la **deuda mensual** para ver el flujo real.',
      ],
    };
  }

  const margenBrutoMonto = ingresos - costosVar;
  const margenBrutoPct = ingresos > 0 ? (margenBrutoMonto / ingresos) * 100 : 0;

  const resultadoOperativo = ingresos - costosVar - costosFijos;
  const resultadoNeto = resultadoOperativo - deuda;
  const margenNetoPct = ingresos > 0 ? (resultadoNeto / ingresos) * 100 : 0;

  // Punto de equilibrio en $ = costos fijos (+ deuda) / ratio de contribución.
  const ratioContrib = ingresos > 0 ? margenBrutoMonto / ingresos : 0;
  const fijosTotales = costosFijos + deuda;
  const puntoEquilibrioPesos = ratioContrib > 0 ? fijosTotales / ratioContrib : Infinity;
  const colchon = ingresos - puntoEquilibrioPesos; // margen de seguridad en $
  const colchonPct = ingresos > 0 && Number.isFinite(puntoEquilibrioPesos)
    ? (colchon / ingresos) * 100 : 0;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (margenNetoPct < 0) {
    status = 'a';
    tone = 'bad';
    title = 'Tu negocio hoy pierde plata';
    badge = 'En pérdida';
    detail = `Después de costos y deuda te queda un resultado de ${fmtMoney(resultadoNeto)} (margen neto ${fmtPct(margenNetoPct, 1)}). Necesitás facturar al menos ${fmtMoney(puntoEquilibrioPesos)} para no perder: hoy facturás ${fmtMoney(ingresos)}.`;
  } else if (margenNetoPct < 10) {
    status = 'tie';
    tone = 'warn';
    title = 'Rentable pero al límite';
    badge = 'Margen ajustado';
    detail = `Te queda ${fmtMoney(resultadoNeto)} de ganancia neta (margen ${fmtPct(margenNetoPct, 1)}): es positivo pero fino. Un mes flojo o una suba de costos te puede dejar en rojo. Tu punto de equilibrio está en ${fmtMoney(puntoEquilibrioPesos)}.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tu negocio es rentable';
    badge = 'Rentable';
    detail = `Te queda ${fmtMoney(resultadoNeto)} de ganancia neta por mes (margen ${fmtPct(margenNetoPct, 1)}). Estás ${fmtMoney(colchon)} por encima de tu punto de equilibrio (${fmtMoney(puntoEquilibrioPesos)}): tenés colchón para reinvertir o aguantar meses flojos.`;
  }

  const scenarios = [
    {
      label: 'Margen bruto',
      value: fmtPct(margenBrutoPct, 1),
      detail: `Ingresos − costos variables = ${fmtMoney(margenBrutoMonto)}.`,
    },
    {
      label: 'Margen neto',
      value: fmtPct(margenNetoPct, 1),
      detail: `Lo que queda tras costos fijos y deuda: ${fmtMoney(resultadoNeto)}.`,
    },
    {
      label: 'Margen de seguridad',
      value: Number.isFinite(puntoEquilibrioPesos) ? fmtPct(colchonPct, 0) : '—',
      detail: Number.isFinite(puntoEquilibrioPesos)
        ? `Cuánto pueden caer tus ventas antes de perder (${fmtMoney(colchon)}).`
        : 'Sin contribución positiva no hay punto de equilibrio.',
    },
  ];

  const breakdown = [
    { label: 'Ingresos del mes', value: fmtMoney(ingresos) },
    { label: '− Costos variables', value: '-' + fmtMoney(costosVar).replace('-', ''), hint: `${fmtPct(ingresos > 0 ? (costosVar / ingresos) * 100 : 0, 0).replace('+', '')} de las ventas` },
    { label: 'Margen bruto', value: fmtMoney(margenBrutoMonto), hint: fmtPct(margenBrutoPct, 1) },
    { label: '− Costos fijos', value: '-' + fmtMoney(costosFijos).replace('-', '') },
    { label: 'Resultado operativo', value: fmtMoney(resultadoOperativo) },
    { label: '− Deuda mensual', value: '-' + fmtMoney(deuda).replace('-', '') },
    { label: 'Resultado neto', value: fmtMoney(resultadoNeto), hint: fmtPct(margenNetoPct, 1) },
    { label: 'Punto de equilibrio (facturación)', value: Number.isFinite(puntoEquilibrioPesos) ? fmtMoney(puntoEquilibrioPesos) : '—' },
  ];

  const nextActions = [
    margenNetoPct < 0
      ? `Estás por debajo del punto de equilibrio (${fmtMoney(puntoEquilibrioPesos)}). Las palancas son tres: **subir precios**, **bajar costos variables** o **recortar fijos**. Atacá la más rápida primero.`
      : `Tu punto de equilibrio es ${fmtMoney(puntoEquilibrioPesos)}: mantené las ventas cómodamente por encima para no entrar en zona de riesgo.`,
    margenBrutoPct < 30
      ? `Tu margen bruto (${fmtPct(margenBrutoPct, 0)}) es bajo: cada venta deja poco para cubrir los fijos. Revisá precios y costos variables antes que nada.`
      : `Tu margen bruto (${fmtPct(margenBrutoPct, 0)}) es sano: cada venta contribuye bien a cubrir los fijos. La palanca está en vender más volumen.`,
    deuda > 0
      ? `La deuda te resta ${fmtMoney(deuda)}/mes del resultado. Si su tasa es alta, evaluá cancelarla: mirá nuestra sala "¿Cancelar deuda o invertir?".`
      : 'Sin deuda mensual, tu resultado operativo es tu resultado neto: buena posición para reinvertir.',
    'Separá **tu sueldo de dueño** del resultado del negocio: si no te estás pagando, el negocio parece más rentable de lo que es. Incluí un retiro razonable en los costos fijos.',
  ];

  const notes = [
    'Margen bruto = (ingresos − costos variables) / ingresos. Margen neto = (ingresos − variables − fijos − deuda) / ingresos. El punto de equilibrio en $ = costos fijos (más deuda) ÷ ratio de contribución.',
    'No incluye impuestos a las ganancias sobre el resultado ni amortizaciones: el resultado neto es antes de esos conceptos. Para el resultado final, descontalos aparte.',
    'Si no te asignás un sueldo de dueño dentro de los costos fijos, la rentabilidad está sobreestimada: el negocio te paga con tu propio trabajo no remunerado.',
    'No es asesoramiento financiero ni contable. Es un diagnóstico orientativo: para tu estado de resultados real consultá con un contador público matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtPct(margenNetoPct, 1),
      label: 'Margen neto',
      sub: `Ganancia neta: **${fmtMoney(resultadoNeto)}**/mes. Punto de equilibrio: **${Number.isFinite(puntoEquilibrioPesos) ? fmtMoney(puntoEquilibrioPesos) : '—'}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'mi-negocio-es-rentable',
  title: '¿Mi negocio es rentable? Margen y punto de equilibrio 2026',
  h1: '¿Mi negocio es rentable?',
  description:
    'Medí la rentabilidad de tu negocio: margen bruto, margen neto, punto de equilibrio y flujo del mes a partir de tus ingresos, costos variables, costos fijos y deuda. Diagnóstico claro y próximos pasos.',
  intro:
    '"Vendo bien" no es lo mismo que "gano plata". Esta sala toma tus ingresos y los separa de tus costos variables, fijos y la deuda para mostrarte tu margen bruto, tu margen neto y, sobre todo, tu punto de equilibrio: cuánto necesitás facturar para no perder. Con eso sabés si tu negocio es rentable, está al límite o trabaja a pérdida, y qué palanca tocar.',
  icon: '📊',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    ingresosMes: 8_000_000,
    costosVariables: 3_600_000,
    costosFijos: 3_200_000,
    deudaMensual: 400_000,
  },
  fields: [
    {
      id: 'ingresosMes',
      label: 'Ingresos del mes',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '8000000',
      help: 'Todo lo que ingresó por ventas en el mes.',
      group: 'Tu negocio',
      groupIcon: '📊',
    },
    {
      id: 'costosVariables',
      label: 'Costos variables',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '3600000',
      help: 'Los que dependen de las ventas: mercadería, insumos, comisiones, packaging.',
      group: 'Tu negocio',
    },
    {
      id: 'costosFijos',
      label: 'Costos fijos',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '3200000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Los que pagás vendas o no: alquiler, sueldos, servicios, tu sueldo de dueño.',
      group: 'Tu negocio',
    },
    {
      id: 'deudaMensual',
      label: 'Deuda mensual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '400000',
      profileKey: 'finanzas.deudas',
      help: 'Cuotas de préstamos o financiación que pagás cada mes.',
      group: 'Tu negocio',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-break-even-freelance-mes', label: 'Punto de equilibrio' },
    { slug: 'calculadora-cafeteria-cuanto-cobrar-pais-cafe-medialuna-margen', label: 'Margen por producto' },
    { slug: 'calculadora-costo-laboral-total-empleador-cargas', label: 'Costo laboral' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
  ],
  howItWorks: `Esta sala convierte tus números del mes en un diagnóstico de rentabilidad.

1. **Margen bruto.** Resta los costos variables a los ingresos: es lo que deja cada venta antes de los gastos fijos. Un margen bruto bajo significa que cada venta aporta poco.
2. **Resultado operativo.** Al margen bruto le resta los costos fijos (alquiler, sueldos, servicios). Es lo que gana el negocio por su operación.
3. **Resultado neto.** Le resta la deuda mensual. Es lo que realmente te queda. Dividido por los ingresos da tu margen neto, el indicador clave.
4. **Punto de equilibrio.** Calcula cuánto tenés que facturar para que el resultado sea cero (costos fijos más deuda, divididos por el ratio de contribución). Por debajo, perdés; por encima, ganás.
5. **Margen de seguridad.** Muestra cuánto pueden caer tus ventas antes de llegar a ese punto de equilibrio: tu colchón frente a un mes flojo.`,
  faq: [
    {
      q: '¿Cuál es la diferencia entre margen bruto y margen neto?',
      a: 'El margen bruto es lo que queda tras los costos variables (lo que deja cada venta para cubrir los fijos). El margen neto es lo que queda al final, tras los costos fijos y la deuda: es la ganancia real. Un negocio puede tener buen margen bruto y margen neto negativo si los fijos son demasiado altos.',
    },
    {
      q: '¿Qué margen neto es "bueno"?',
      a: 'Depende del rubro, pero como guía general: por debajo de 0% perdés, entre 0 y 10% estás al límite, y por encima de 10% el negocio tiene aire para reinvertir y absorber imprevistos. Lo importante es la tendencia: que el margen no se deteriore mes a mes.',
    },
    {
      q: '¿Qué es el punto de equilibrio?',
      a: 'Es la facturación mínima para no perder plata: cubre exactamente tus costos fijos y la deuda. Por debajo de ese número trabajás a pérdida; por encima, cada peso adicional deja ganancia según tu margen bruto. Es la meta mínima de ventas que no podés bajar.',
    },
    {
      q: '¿Por qué tengo que incluir mi sueldo de dueño?',
      a: 'Porque si no te pagás un sueldo y vivís del "resultado", el negocio parece más rentable de lo que es: en realidad te está pagando con tu trabajo gratis. Incluí un retiro razonable dentro de los costos fijos para ver la rentabilidad real, descontando tu remuneración.',
    },
    {
      q: '¿La deuda cuenta como costo?',
      a: 'La cuota mensual de deuda no es un costo operativo, pero sí sale de tu caja y reduce lo que te queda. Por eso esta sala la resta después del resultado operativo: querés ver tanto cuánto gana el negocio por sí solo como cuánto te queda después de pagar la financiación.',
    },
    {
      q: '¿Cómo mejoro la rentabilidad?',
      a: 'Hay tres palancas: subir precios (mejora el margen sin más volumen), bajar costos variables (mejora la contribución de cada venta) o recortar costos fijos (baja el punto de equilibrio). Atacá primero la que puedas mover más rápido. Subir precios suele ser la de mayor impacto inmediato.',
    },
    {
      q: '¿Incluye impuestos a las ganancias?',
      a: 'No. El resultado neto de esta sala es antes de impuestos a las ganancias y de amortizaciones. Es el resultado de caja del mes. Para el resultado final después de impuestos, descontalos aparte o consultá con tu contador.',
    },
    {
      q: '¿Esto reemplaza un estado de resultados contable?',
      a: 'No. Es un diagnóstico rápido para entender tu rentabilidad y tu punto de equilibrio. Para un estado de resultados formal (con amortizaciones, impuestos y criterios contables) consultá con un contador público matriculado.',
    },
  ],
  sources: [
    { name: 'INDEC — Índice de Precios al Consumidor', url: 'https://www.indec.gob.ar/' },
    { name: 'ARCA — Régimen impositivo de empresas', url: 'https://www.arca.gob.ar/' },
  ],
};
