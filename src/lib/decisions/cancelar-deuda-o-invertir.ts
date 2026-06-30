/**
 * Sala de decisión — "¿Me conviene cancelar esta deuda o invertir el dinero?"
 *
 * Patrón OPTIMIZACIÓN. La plata es la misma: o cancelás deuda (y dejás de pagar
 * intereses al CFT del crédito) o la invertís (y ganás al rendimiento de la
 * inversión). La regla es comparar la TASA EFECTIVA ANUAL de cada lado sobre el
 * mismo capital: cancelar es un "rendimiento garantizado" igual a la tasa de la
 * deuda. Suma además el resguardo de liquidez (fondo de emergencia).
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

/** TNA % → tasa efectiva anual (capitalización mensual). */
function tnaToEA(tnaPct: number): number {
  return Math.pow(1 + tnaPct / 100 / 12, 12) - 1;
}

function compute(inputs: Record<string, any>): DecisionResult {
  const saldoDeuda = Math.max(0, num(inputs.saldoDeuda));
  const tnaDeuda = Math.max(0, num(inputs.tnaDeuda));
  const montoDisponible = Math.max(0, num(inputs.montoDisponible));
  const tnaInversion = Math.max(0, num(inputs.tnaInversion));
  const liquidezNecesaria = Math.max(0, num(inputs.liquidezNecesaria));
  const inflacionAnual = Math.max(0, num(inputs.inflacionAnual));

  if (!saldoDeuda || !tnaDeuda || !montoDisponible || !tnaInversion) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el saldo y la tasa (CFT/TNA) de tu deuda, la plata que tenés disponible y el rendimiento esperado de la inversión. Con eso comparamos qué te deja mejor parado.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Ventaja a 12 meses' },
      scenarios: [],
      nextActions: [
        'Cargá el **saldo** de tu deuda y su **CFT o TNA** (el costo real, no solo la tasa nominal).',
        'Cargá **cuánta plata tenés disponible** y el **rendimiento esperado** de la inversión (ej. TNA del plazo fijo).',
      ],
    };
  }

  // Plata realmente aplicable, dejando intacto el fondo de emergencia.
  const usable = Math.max(0, montoDisponible - liquidezNecesaria);
  const aplicaCancelar = Math.min(usable, saldoDeuda);

  const eaDeuda = tnaToEA(tnaDeuda);
  const eaInversion = tnaToEA(tnaInversion);

  // Comparación sobre el MISMO capital (lo que se puede destinar a cancelar).
  const ahorroAnual = aplicaCancelar * eaDeuda; // intereses que dejás de pagar
  const gananciaAnual = aplicaCancelar * eaInversion; // lo que rendiría invertido
  const ventaja = ahorroAnual - gananciaAnual; // + => cancelar; - => invertir
  const spread = (eaDeuda - eaInversion) * 100; // puntos a favor de cancelar

  // Sobrante para invertir si la plata supera la deuda (estrategia mixta).
  const sobrante = Math.max(0, usable - saldoDeuda);
  const gananciaSobrante = sobrante * eaInversion;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (spread >= 2) {
    status = 'a'; // A = cancelar deuda
    tone = 'good';
    title = 'Conviene cancelar la deuda';
    badge = 'Cancelá la deuda';
    detail = `Tu deuda cuesta ${fmtPct(eaDeuda * 100, 1)} efectivo anual y la inversión rinde ${fmtPct(eaInversion * 100, 1)}. Cancelar es un rendimiento garantizado: te ahorra ${fmtMoney(ventaja)} al año frente a invertir. Pagá la deuda primero.`;
  } else if (spread <= -2) {
    status = 'b'; // B = invertir
    tone = 'good';
    title = 'Conviene invertir el dinero';
    badge = 'Invertí';
    detail = `La inversión rinde ${fmtPct(eaInversion * 100, 1)} efectivo anual y tu deuda cuesta ${fmtPct(eaDeuda * 100, 1)}. Invertir te deja ${fmtMoney(-ventaja)} más al año que cancelar, así que mantené la deuda al día e invertí el resto. Ojo: solo si la deuda no te quita el sueño.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por liquidez y tranquilidad';
    badge = 'Es parejo';
    detail = `La tasa de la deuda (${fmtPct(eaDeuda * 100, 1)}) y el rendimiento (${fmtPct(eaInversion * 100, 1)}) están muy cerca: la diferencia es de apenas ${fmtMoney(Math.abs(ventaja))} al año. Priorizá tener liquidez y sacarte la deuda de la cabeza.`;
  }

  const scenarios = [
    {
      label: 'Cancelar la deuda',
      value: '+' + fmtMoney(ahorroAnual).replace('-', ''),
      detail: `Intereses que dejás de pagar en 12 meses sobre ${fmtMoney(aplicaCancelar)}.`,
    },
    {
      label: 'Invertir todo',
      value: '+' + fmtMoney(gananciaAnual).replace('-', ''),
      detail: `Lo que rendiría ese mismo dinero invertido al ${fmtPct(eaInversion * 100, 1)} anual.`,
    },
    {
      label: 'Mixta',
      value: '+' + fmtMoney(ahorroAnual + gananciaSobrante).replace('-', ''),
      detail: sobrante > 0
        ? `Cancelás la deuda e invertís el sobrante de ${fmtMoney(sobrante)}.`
        : 'Cancelar la deuda (tu plata no alcanza a cubrirla del todo).',
    },
  ];

  const comparison = {
    columns: ['Cancelar deuda', 'Invertir'] as [string, string],
    rows: [
      { label: 'Tasa efectiva anual', a: fmtPct(eaDeuda * 100, 1), b: fmtPct(eaInversion * 100, 1), hint: `${spread >= 0 ? '+' : ''}${spread.toFixed(1).replace('.', ',')} pts a favor de cancelar` },
      { label: `Resultado a 12 meses sobre ${fmtMoney(aplicaCancelar)}`, a: '+' + fmtMoney(ahorroAnual).replace('-', ''), b: '+' + fmtMoney(gananciaAnual).replace('-', '') },
      { label: 'Capital que aplicás', a: fmtMoney(aplicaCancelar), b: fmtMoney(usable) },
    ],
  };

  const nextActions = [
    'Cancelá **primero la deuda más cara** (tarjeta o descubierto): su CFT supera a casi cualquier inversión, así que pagarla es el mejor "rendimiento" que vas a conseguir.',
    liquidezNecesaria > 0
      ? `Dejás ${fmtMoney(liquidezNecesaria)} de fondo de emergencia intacto ✓. No lo uses para cancelar: si surge un imprevisto, terminás endeudándote de nuevo y más caro.`
      : 'Antes de cancelar, separá un **fondo de emergencia** (3 a 6 meses de gastos). Sin colchón, un imprevisto te devuelve a la deuda cara.',
    'Confirmá el **CFT real** de tu deuda (incluye seguros y comisiones), no solo la TNA: el costo verdadero suele ser bastante más alto.',
    inflacionAnual > 0
      ? 'Si tu deuda tiene **cuota fija en pesos**, la inflación la licúa: parte se paga sola. Revisá si conviene seguir con la cuota mínima e invertir el resto.'
      : 'Si tu deuda tiene cuota fija en pesos y hay inflación alta, parte se licúa sola: puede convenir pagar la cuota mínima e invertir la diferencia.',
  ];

  const notes = [
    'Compara la tasa efectiva anual (TEA) de cada lado capitalizando mensualmente. Cancelar deuda equivale a una inversión libre de riesgo a la tasa de tu crédito.',
    'La comparación es nominal; como mira la DIFERENCIA de tasas, la inflación afecta a ambos lados por igual y no cambia el ganador (sí importa si la deuda tiene cuota fija no ajustable).',
    'No es asesoramiento financiero. No considera impuestos sobre la inversión ni costos de cancelación anticipada: confirmalos con tu banco. Mantené siempre un fondo de emergencia.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.abs(ventaja)) + '/año',
      label: ventaja >= 0 ? 'Ahorrás cancelando' : 'Ganás invirtiendo',
      sub: `Deuda ${fmtPct(eaDeuda * 100, 1)} efectivo anual vs inversión ${fmtPct(eaInversion * 100, 1)}. La diferencia decide.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cancelar-deuda-o-invertir',
  title: '¿Cancelar la deuda o invertir el dinero? Comparador 2026',
  h1: '¿Me conviene cancelar esta deuda o invertir el dinero?',
  description:
    'Compará la tasa efectiva de tu deuda contra el rendimiento de una inversión para saber qué te deja mejor: cancelar el crédito o invertir la plata. Incluye fondo de emergencia y estrategia mixta.',
  intro:
    'Tenés plata y una deuda: ¿la cancelás o la invertís? La respuesta no es intuición, es comparar la tasa efectiva de tu deuda contra el rendimiento de la inversión sobre el mismo capital. Cancelar una deuda cara es un rendimiento garantizado. Esta sala te dice cuál gana, por cuánto, y cuánto fondo de emergencia conviene dejar intacto.',
  icon: '⚖️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    saldoDeuda: 1200000,
    tnaDeuda: 95,
    montoDisponible: 1500000,
    tnaInversion: 38,
    liquidezNecesaria: 300000,
    inflacionAnual: 0,
  },
  fields: [
    {
      id: 'saldoDeuda',
      label: 'Saldo de la deuda',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1200000',
      help: 'Lo que te falta pagar del crédito, tarjeta o préstamo.',
      group: 'Tu deuda',
      groupIcon: '💳',
    },
    {
      id: 'tnaDeuda',
      label: 'CFT / TNA de la deuda',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      placeholder: '95',
      help: 'La tasa anual de tu deuda. Mejor el CFT (incluye seguros y comisiones) que la TNA pelada.',
      group: 'Tu deuda',
    },
    {
      id: 'montoDisponible',
      label: 'Plata que tenés disponible',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'finanzas.ahorros',
      help: 'El dinero que podrías usar para cancelar la deuda o invertir.',
      group: 'Tu plata',
      groupIcon: '💰',
    },
    {
      id: 'tnaInversion',
      label: 'Rendimiento de la inversión (TNA)',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      placeholder: '38',
      help: 'TNA esperada de la inversión: plazo fijo, money market, etc.',
      group: 'Tu plata',
    },
    {
      id: 'liquidezNecesaria',
      label: 'Fondo de emergencia a mantener',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      help: 'Plata líquida que NO querés tocar pase lo que pase. No se usa para cancelar.',
      group: 'Tu plata',
    },
    {
      id: 'inflacionAnual',
      label: 'Inflación anual esperada',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      advanced: true,
      help: 'Opcional. Si tu deuda tiene cuota fija en pesos, ayuda a interpretar el resultado.',
      group: 'Tu plata',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-cft-prestamo-personal-comparativa', label: 'CFT de un préstamo' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
  ],
  howItWorks: `La decisión se reduce a comparar dos tasas sobre el mismo dinero.

1. **Tasa efectiva de la deuda.** Convierte el CFT/TNA de tu crédito a tasa efectiva anual (capitalizando mensualmente). Cancelar la deuda equivale a "invertir" a esa tasa, sin riesgo.
2. **Tasa efectiva de la inversión.** Hace lo mismo con el rendimiento que esperás (plazo fijo, money market, etc.).
3. **Comparación sobre el mismo capital.** Aplica ambas tasas a la plata que podés destinar (descontando el fondo de emergencia) y calcula, a 12 meses, cuánto ahorrás cancelando vs cuánto ganás invirtiendo.
4. **Veredicto.** Gana la tasa más alta: si la deuda cuesta más que lo que rinde la inversión, cancelar es el mejor negocio garantizado. Si la inversión rinde más, conviene mantener la deuda al día e invertir.
5. **Liquidez y estrategia mixta.** Deja intacto tu fondo de emergencia y, si la plata supera la deuda, calcula la opción de cancelar e invertir el sobrante.`,
  faq: [
    {
      q: '¿Por qué cancelar una deuda es como una inversión?',
      a: 'Porque cada peso que usás para cancelar deja de generar intereses. Si tu deuda cuesta 95% efectivo anual, cancelarla te "rinde" ese 95% garantizado y sin riesgo. Por eso casi siempre conviene pagar primero la deuda cara antes que invertir.',
    },
    {
      q: '¿Cómo comparo la tasa de la deuda con la de la inversión?',
      a: 'Llevando ambas a tasa efectiva anual (capitalización mensual) y comparándolas sobre el mismo capital. Si la tasa de la deuda es mayor que el rendimiento de la inversión, conviene cancelar; si es menor, conviene invertir. La diferencia de tasas es lo que decide.',
    },
    {
      q: '¿Qué es el CFT y por qué lo uso en vez de la TNA?',
      a: 'El Costo Financiero Total incluye la tasa nominal más seguros, comisiones e IVA: es lo que realmente te cuesta la deuda. La TNA sola subestima el costo. Para esta decisión, usá el CFT de tu deuda siempre que lo tengas.',
    },
    {
      q: '¿Debería usar todos mis ahorros para cancelar la deuda?',
      a: 'No. Primero separá un fondo de emergencia de 3 a 6 meses de gastos. Si cancelás con todo y surge un imprevisto, vas a terminar endeudándote otra vez, probablemente a una tasa más alta. Esta sala te deja indicar cuánto fondo mantener intacto.',
    },
    {
      q: '¿La inflación cambia la decisión?',
      a: 'Como la comparación mira la diferencia entre dos tasas, la inflación afecta a ambos lados por igual y no cambia el ganador. La excepción importante: si tu deuda tiene cuota fija en pesos no ajustable, la inflación la licúa, y puede convenir pagar la mínima e invertir el resto.',
    },
    {
      q: '¿Conviene cancelar si la deuda está en cuotas sin interés?',
      a: 'No. Si la deuda no genera intereses (cuotas sin interés reales), conviene pagar las cuotas en término e invertir el dinero mientras tanto: el rendimiento es ganancia neta. Cargá una tasa de deuda cercana a 0 para verlo reflejado.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa que compara tasas. No considera impuestos sobre la inversión ni costos de cancelación anticipada, que conviene confirmar con tu banco. Para decisiones grandes, consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'BCRA — Costo Financiero Total (CFT)', url: 'https://www.bcra.gob.ar/' },
    { name: 'BCRA — Tasas de plazo fijo', url: 'https://www.bcra.gob.ar/BCRAyVos/plazos_fijos_online.asp' },
  ],
};
