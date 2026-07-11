/**
 * Sala de decisión — "¿Me conviene adelantar cuotas de mi préstamo?"
 *
 * Patrón OPTIMIZACIÓN (2 columnas). Misma lógica que cancelar-deuda-o-invertir:
 * adelantar capital de un préstamo equivale a un "rendimiento garantizado" igual
 * a la TEA de la deuda. Lo compara contra la TEA de un rendimiento alternativo
 * para el mismo monto. Gana la tasa más alta. Devuelve la ventaja anual.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

/** TNA % → tasa efectiva anual (capitalización mensual). */
function tnaToEA(tnaPct: number): number {
  return Math.pow(1 + tnaPct / 100 / 12, 12) - 1;
}

function compute(inputs: Record<string, any>): DecisionResult {
  const saldoPendiente = Math.max(0, num(inputs.saldoPendiente));
  const tasaTNA = Math.max(0, num(inputs.tasaTNA));
  const cuotasRestantes = Math.max(0, num(inputs.cuotasRestantes));
  const montoAdelanto = Math.max(0, num(inputs.montoAdelanto));
  const rendimientoTNA = Math.max(0, num(inputs.rendimientoAlternativoTNA));

  if (!saldoPendiente || !tasaTNA || !montoAdelanto) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el saldo pendiente y la tasa (TNA) de tu préstamo, y cuánto pensás adelantar. Comparamos el ahorro de intereses contra lo que rendiría ese mismo dinero invertido.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Ventaja anual de adelantar' },
      scenarios: [],
      nextActions: [
        'Cargá el **saldo pendiente** y la **tasa (TNA)** de tu préstamo.',
        'Indicá **cuánto pensás adelantar** y el **rendimiento alternativo** de ese dinero.',
      ],
    };
  }

  const adelanto = Math.min(montoAdelanto, saldoPendiente);
  const eaDeuda = tnaToEA(tasaTNA);
  const eaRend = tnaToEA(rendimientoTNA);

  // Sobre el MISMO monto: adelantar ahorra intereses al EA de la deuda; invertir
  // gana al EA del rendimiento alternativo. La diferencia decide.
  const ahorroAnual = adelanto * eaDeuda; // intereses que dejás de pagar en 1 año
  const gananciaAnual = adelanto * eaRend; // lo que rendiría invertido
  const ventaja = ahorroAnual - gananciaAnual; // + => adelantar; - => invertir
  const spread = (eaDeuda - eaRend) * 100;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (spread >= 2) {
    status = 'a'; // A = adelantar
    tone = 'good';
    title = 'Conviene adelantar las cuotas';
    badge = 'Adelantá';
    detail = `Tu préstamo cuesta ${fmtPct(eaDeuda * 100, 1)} efectivo anual y el rendimiento alternativo es ${fmtPct(eaRend * 100, 1)}. Adelantar ${fmtMoney(adelanto)} es un "rendimiento garantizado": te ahorra ${fmtMoney(ventaja)} al año frente a invertir ese dinero. Pagá el préstamo antes.`;
  } else if (spread <= -2) {
    status = 'b'; // B = invertir
    tone = 'good';
    title = 'Conviene invertir en vez de adelantar';
    badge = 'Invertí';
    detail = `El rendimiento alternativo (${fmtPct(eaRend * 100, 1)} efectivo anual) supera la tasa de tu préstamo (${fmtPct(eaDeuda * 100, 1)}). Invertir esos ${fmtMoney(adelanto)} te deja ${fmtMoney(-ventaja)} más al año que adelantar cuotas. Seguí pagando el préstamo en término e invertí el resto.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por tranquilidad';
    badge = 'Es parejo';
    detail = `La tasa de tu préstamo (${fmtPct(eaDeuda * 100, 1)}) y el rendimiento alternativo (${fmtPct(eaRend * 100, 1)}) están muy cerca: la diferencia es de apenas ${fmtMoney(Math.abs(ventaja))} al año. Si te saca peso de encima, adelantá; si valorás la liquidez, invertí.`;
  }

  const scenarios = [
    { label: 'Adelantar cuotas', value: '+' + fmtMoney(ahorroAnual), detail: `Intereses que dejás de pagar en 12 meses al adelantar ${fmtMoney(adelanto)}.` },
    { label: 'Invertir ese dinero', value: '+' + fmtMoney(gananciaAnual), detail: `Lo que rendiría ese mismo monto al ${fmtPct(eaRend * 100, 1)} anual.` },
    { label: 'Ventaja de la mejor opción', value: '+' + fmtMoney(Math.abs(ventaja)), detail: ventaja >= 0 ? 'A favor de adelantar.' : 'A favor de invertir.' },
  ];

  const comparison = {
    columns: ['Adelantar cuotas', 'Invertir'] as [string, string],
    rows: [
      { label: 'Tasa efectiva anual', a: fmtPct(eaDeuda * 100, 1), b: fmtPct(eaRend * 100, 1), hint: `${spread >= 0 ? '+' : ''}${spread.toFixed(1).replace('.', ',')} pts a favor de adelantar` },
      { label: `Resultado a 12 meses sobre ${fmtMoney(adelanto)}`, a: '+' + fmtMoney(ahorroAnual), b: '+' + fmtMoney(gananciaAnual) },
      { label: 'Liquidez que conservás', a: fmtMoney(0), b: fmtMoney(adelanto), hint: 'invertir mantiene el dinero disponible' },
    ],
  };

  const nextActions = [
    spread >= 2
      ? `Adelantá: pedí al banco la **cancelación parcial** de ${fmtMoney(adelanto)} y confirmá que reduzca el capital (no que solo "adelante cuotas" sin bajar intereses).`
      : spread <= -2
        ? 'Conviene invertir: seguí pagando las cuotas en término y poné ese dinero a rendir. Pero solo si vas a invertirlo de verdad, no gastarlo.'
        : 'Está parejo: priorizá tu tranquilidad. Sacarte la deuda de encima tiene un valor que no está en la planilla.',
    'Antes de adelantar, **preguntá si hay costo de cancelación anticipada** o comisiones: pueden reducir o anular la ventaja.',
    'Confirmá la **tasa real (CFT)** de tu préstamo: si incluye seguros y comisiones, el costo efectivo es mayor que la TNA y adelantar conviene más de lo que parece.',
    'Nunca uses tu **fondo de emergencia** para adelantar: si te quedás sin colchón, un imprevisto te devuelve a una deuda más cara.',
  ];

  const notes = [
    'Compara la tasa efectiva anual (TEA) de tu préstamo contra la del rendimiento alternativo, capitalizando mensualmente. Adelantar capital equivale a una inversión libre de riesgo a la tasa de tu préstamo.',
    'La comparación es sobre el mismo monto y a 12 meses. No incluye costos de cancelación anticipada ni impuestos sobre la inversión: confirmalos antes de decidir.',
    'En préstamos de sistema francés, adelantar capital reduce los intereses futuros: pedí siempre que la cancelación parcial baje el saldo de capital, no solo que "saltee" cuotas.',
    'No es asesoramiento financiero. Mantené siempre tu fondo de emergencia intacto.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.abs(ventaja)) + '/año',
      label: ventaja >= 0 ? 'Ahorrás adelantando' : 'Ganás invirtiendo',
      sub: `Préstamo ${fmtPct(eaDeuda * 100, 1)} efectivo anual vs rendimiento ${fmtPct(eaRend * 100, 1)}. La diferencia decide.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'me-conviene-adelantar-cuotas',
  title: '¿Me conviene adelantar cuotas del préstamo o invertir? 2026',
  h1: '¿Me conviene adelantar cuotas de mi préstamo?',
  description:
    'Compará el ahorro de intereses por adelantar cuotas contra lo que rendiría ese mismo dinero invertido. Gana la tasa efectiva más alta: te decimos la ventaja anual de cada opción.',
  intro:
    'Tenés un préstamo y un dinero extra: ¿adelantás cuotas o lo invertís? Adelantar capital es un "rendimiento garantizado" igual a la tasa efectiva de tu préstamo. Esta sala compara esa tasa contra el rendimiento que le sacarías invirtiendo el mismo dinero y te dice cuál gana y por cuánto al año, sin perder de vista la liquidez.',
  icon: '⚖️',
  category: 'finanzas',
  audience: 'AR',
  answer: 'Adelantar cuotas conviene cuando **la tasa del préstamo es mayor que lo que podés ganar invirtiendo ese dinero con seguridad**. Si tu crédito es a tasa fija y la inflación lo está licuando (la cuota real baja mes a mes), casi nunca conviene adelantar: esa plata rinde más invertida. Compará la tasa efectiva del préstamo contra tu rendimiento neto de impuestos antes de decidir.',
  lastReviewed: '2026-07-11',
  example: {
    saldoPendiente: 4000000,
    tasaTNA: 80,
    cuotasRestantes: 18,
    montoAdelanto: 1000000,
    rendimientoAlternativoTNA: 40,
  },
  fields: [
    { id: 'saldoPendiente', label: 'Saldo pendiente del préstamo', type: 'number', prefix: '$', required: true, min: 0, placeholder: '4000000', help: 'Lo que te falta pagar de capital.', group: 'Tu préstamo', groupIcon: '🏦' },
    { id: 'tasaTNA', label: 'Tasa del préstamo (TNA)', type: 'number', suffix: '%', required: true, min: 0, placeholder: '80', help: 'La tasa anual de tu préstamo. Mejor el CFT (incluye seguros y comisiones) que la TNA pelada.', group: 'Tu préstamo' },
    { id: 'cuotasRestantes', label: 'Cuotas que te quedan', type: 'number', default: 0, min: 0, max: 120, placeholder: '18', help: 'Cuántas cuotas faltan pagar.', group: 'Tu préstamo', advanced: true },
    { id: 'montoAdelanto', label: 'Cuánto pensás adelantar', type: 'number', prefix: '$', required: true, min: 0, placeholder: '1000000', profileKey: 'finanzas.ahorros', help: 'El dinero extra que podrías usar para adelantar o invertir.', group: 'Tu dinero', groupIcon: '💰' },
    { id: 'rendimientoAlternativoTNA', label: 'Rendimiento alternativo (TNA)', type: 'number', suffix: '%', default: 0, min: 0, placeholder: '40', help: 'Qué TNA le sacarías a ese dinero si lo invirtieras (plazo fijo, money market).', group: 'Tu dinero' },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-cft-prestamo-personal-comparativa', label: 'CFT de un préstamo' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
  ],
  howItWorks: `La decisión se reduce a comparar dos tasas sobre el mismo dinero.

1. **Tasa efectiva de tu préstamo.** Convierte la TNA de tu préstamo a tasa efectiva anual (capitalizando mensualmente). Adelantar capital equivale a "ganar" esa tasa, sin riesgo, porque dejás de pagar esos intereses.
2. **Tasa efectiva de la inversión.** Hace lo mismo con el rendimiento que esperás del dinero si lo invirtieras en vez de adelantar.
3. **Comparación sobre el mismo monto.** Aplica ambas tasas al monto que pensás adelantar y calcula, a 12 meses, cuánto ahorrás adelantando vs cuánto ganás invirtiendo.
4. **El veredicto.** Gana la tasa más alta: si tu préstamo cuesta más que lo que rinde la inversión, adelantar es el mejor negocio garantizado. Si la inversión rinde más, conviene pagar las cuotas en término e invertir.
5. **La liquidez.** Adelantar inmoviliza el dinero en el préstamo; invertir lo mantiene disponible. La sala lo muestra para que el factor liquidez también pese en tu decisión.`,
  faq: [
    { q: '¿Por qué adelantar cuotas es como una inversión?', a: 'Porque cada peso de capital que adelantás deja de generar intereses. Si tu préstamo cuesta 80% efectivo anual, adelantar te "rinde" ese 80% garantizado y sin riesgo. Por eso, si la tasa del préstamo supera lo que rinde una inversión, adelantar es el mejor negocio.' },
    { q: '¿Cómo comparo la tasa del préstamo con la de la inversión?', a: 'Llevando ambas a tasa efectiva anual (capitalización mensual) y comparándolas sobre el mismo monto. Si la tasa del préstamo es mayor que el rendimiento de la inversión, conviene adelantar; si es menor, conviene invertir. La diferencia de tasas decide.' },
    { q: '¿Conviene usar el CFT o la TNA del préstamo?', a: 'El CFT, siempre que lo tengas: incluye seguros, comisiones e IVA, así que refleja el costo real de tu préstamo. Como suele ser bastante más alto que la TNA, usarlo hace que adelantar convenga más de lo que parece a primera vista.' },
    { q: '¿Hay costo por adelantar o cancelar anticipadamente?', a: 'Puede haberlo: algunos préstamos cobran una comisión por cancelación anticipada. Preguntale al banco antes de decidir, porque ese costo reduce o puede anular la ventaja de adelantar. La sala no lo incluye automáticamente.' },
    { q: '¿Adelantar baja la cuota o acorta el plazo?', a: 'Depende de cómo lo aplique el banco. Lo más conveniente suele ser que reduzca el capital (y con él los intereses totales). Pedí explícitamente una cancelación parcial de capital, no que solo te "salte" cuotas sin bajar el interés.' },
    { q: '¿Debería usar mi fondo de emergencia para adelantar?', a: 'No. Aunque adelantar convenga por tasa, nunca uses tu colchón: si te quedás sin liquidez y surge un imprevisto, terminás tomando deuda nueva, probablemente más cara. Adelantá solo con dinero que te sobra por encima del fondo.' },
    { q: '¿La inflación cambia la decisión?', a: 'Como la comparación mira la diferencia entre dos tasas, la inflación afecta a ambos lados por igual y no cambia el ganador. La excepción: si tu cuota es fija en pesos y la inflación es alta, parte de la deuda se licúa sola, y puede convenir no adelantar e invertir.' },
    { q: '¿Esto es asesoramiento financiero?', a: 'No. Es una herramienta orientativa que compara tasas efectivas. No considera costos de cancelación anticipada ni impuestos sobre la inversión, que conviene confirmar. Para decisiones grandes, consultá con un asesor financiero matriculado.' },
  ],
  sources: [
    { name: 'BCRA — Costo Financiero Total (CFT)', url: 'https://www.bcra.gob.ar/' },
    { name: 'BCRA — Tasas de plazo fijo', url: 'https://www.bcra.gob.ar/BCRAyVos/plazos_fijos_online.asp' },
  ],
};
