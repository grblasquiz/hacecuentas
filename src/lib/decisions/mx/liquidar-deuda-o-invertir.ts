/**
 * Sala de decisión MX — "¿Liquidar la deuda o invertir el dinero?"
 *
 * La comparación honesta en México es brutal: las tarjetas cobran CAT de
 * 60-80% y los préstamos personales 30-60%, mientras CETES rinde 8-9%.
 * Liquidar la deuda cara es un "rendimiento garantizado" a la tasa de la
 * deuda — casi siempre gana. La excepción real es la deuda barata (crédito
 * hipotecario o Infonavit a ~10-11% o menos), donde el spread se cierra y
 * pesan la liquidez y los planes. El fondo de emergencia no se toca.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const saldoDeuda = Math.max(0, num(inputs.saldoDeuda));
  const catDeuda = Math.max(0, num(inputs.catDeuda));
  const montoDisponible = Math.max(0, num(inputs.montoDisponible));
  const rendimientoInversion = Math.max(0, num(inputs.rendimientoInversion));
  const fondoEmergencia = Math.max(0, num(inputs.fondoEmergencia));

  if (!saldoDeuda || !catDeuda || !montoDisponible || !rendimientoInversion) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Carga el saldo y el CAT de tu deuda, el dinero que tienes disponible y el rendimiento que le sacarías invertido (por ejemplo, CETES). Comparamos ambas tasas sobre el mismo capital y te decimos qué te deja mejor parado.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Ventaja a 12 meses' },
      scenarios: [],
      nextActions: [
        'Carga el **saldo** de tu deuda y su **CAT** (viene en tu estado de cuenta; es el costo real, no solo la tasa).',
        'Carga **cuánto dinero tienes disponible** y el **rendimiento** de la inversión (CETES ronda 8-9% anual).',
      ],
    };
  }

  // Dinero realmente aplicable: el fondo de emergencia no se toca.
  const usable = Math.max(0, montoDisponible - fondoEmergencia);
  const aplicaLiquidar = Math.min(usable, saldoDeuda);

  // El CAT ya es una medida anualizada del costo total; el rendimiento de
  // CETES también es anual. Comparamos tasas anuales directamente.
  const tasaDeuda = catDeuda / 100;
  const tasaInversion = rendimientoInversion / 100;

  const ahorroAnual = aplicaLiquidar * tasaDeuda;
  const gananciaAnual = aplicaLiquidar * tasaInversion;
  const ventaja = ahorroAnual - gananciaAnual; // + => liquidar; - => invertir
  const spread = (tasaDeuda - tasaInversion) * 100;

  const sobrante = Math.max(0, usable - saldoDeuda);
  const gananciaSobrante = sobrante * tasaInversion;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (spread >= 2) {
    status = 'a';
    tone = 'good';
    title = 'Conviene liquidar la deuda';
    badge = 'Liquida la deuda';
    detail = `Tu deuda te cuesta ${catDeuda.toFixed(1)}% al año y la inversión rinde ${rendimientoInversion.toFixed(1)}%. Liquidar es un rendimiento garantizado y libre de riesgo: te ahorra ${fmtMoney(ventaja)} al año frente a invertir ese mismo dinero. Ninguna inversión legal en México le gana al CAT de una tarjeta.`;
  } else if (spread <= -2) {
    status = 'b';
    tone = 'good';
    title = 'Conviene invertir el dinero';
    badge = 'Invierte';
    detail = `La inversión rinde ${rendimientoInversion.toFixed(1)}% anual y tu deuda solo cuesta ${catDeuda.toFixed(1)}%. Es el caso típico de un crédito barato (hipotecario o Infonavit): mantén la deuda al corriente e invierte — ganas ${fmtMoney(-ventaja)} más al año. Eso sí: solo si la mensualidad no te quita el sueño.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decide por liquidez y tranquilidad';
    badge = 'Está parejo';
    detail = `El costo de tu deuda (${catDeuda.toFixed(1)}%) y el rendimiento de la inversión (${rendimientoInversion.toFixed(1)}%) están muy cerca: la diferencia es de apenas ${fmtMoney(Math.abs(ventaja))} al año. Con spread tan corto, prioriza conservar liquidez y quitarte la deuda de la cabeza: abona sin descapitalizarte.`;
  }

  const scenarios = [
    {
      label: 'Liquidar la deuda',
      value: '+' + fmtMoney(ahorroAnual).replace('-', ''),
      detail: `Intereses que dejas de pagar en 12 meses sobre ${fmtMoney(aplicaLiquidar)}.`,
    },
    {
      label: 'Invertir todo',
      value: '+' + fmtMoney(gananciaAnual).replace('-', ''),
      detail: `Lo que rendiría ese mismo dinero invertido al ${rendimientoInversion.toFixed(1)}% anual (antes de ISR sobre intereses).`,
    },
    {
      label: 'Mixta',
      value: '+' + fmtMoney(ahorroAnual + gananciaSobrante).replace('-', ''),
      detail:
        sobrante > 0
          ? `Liquidas la deuda completa e inviertes el sobrante de ${fmtMoney(sobrante)}.`
          : 'Liquidas hasta donde alcanza (tu dinero no cubre todo el saldo).',
    },
  ];

  const comparison = {
    columns: ['Liquidar deuda', 'Invertir'] as [string, string],
    rows: [
      { label: 'Tasa anual', a: `${catDeuda.toFixed(1)}% (CAT)`, b: `${rendimientoInversion.toFixed(1)}%`, hint: `${fmtPct(spread, 1)} puntos a favor de liquidar` },
      { label: `Resultado a 12 meses sobre ${fmtMoney(aplicaLiquidar)}`, a: '+' + fmtMoney(ahorroAnual).replace('-', ''), b: '+' + fmtMoney(gananciaAnual).replace('-', '') },
      { label: 'Riesgo', a: 'Cero: el ahorro es garantizado', b: 'Bajo en CETES; el rendimiento puede variar' },
      { label: 'Capital que aplicas', a: fmtMoney(aplicaLiquidar), b: fmtMoney(usable) },
    ],
  };

  const nextActions = [
    'Liquida **primero la deuda más cara**: una tarjeta con CAT de 60-80% es imposible de vencer invirtiendo. Pagarla es el mejor "rendimiento" garantizado que existe en México.',
    fondoEmergencia > 0
      ? `Dejas ${fmtMoney(fondoEmergencia)} de fondo de emergencia intacto ✓. No lo uses para liquidar: si surge un imprevisto sin colchón, acabas otra vez en la tarjeta, a la tasa más cara.`
      : 'Antes de liquidar, aparta un **fondo de emergencia** (3 a 6 meses de gastos). Sin colchón, cualquier imprevisto te regresa a la deuda cara.',
    'Busca el **CAT en tu estado de cuenta** (es obligatorio que aparezca): incluye intereses, comisiones y seguros. Compararlo contra la tasa "nominal" te haría subestimar el costo real.',
    spread <= -2
      ? 'Si tu deuda barata es hipotecaria o Infonavit, revisa además si los abonos a capital tienen costo o restricción — en la mayoría no, y cada abono acorta años de mensualidades.'
      : 'Si liquidas la tarjeta, pide tu **carta de no adeudo** y baja el límite o cancela plásticos que te tienten: la deuda que no regresa es la que de verdad liquidaste.',
    'Si te queda sobrante, la puerta de entrada simple es **cetesdirecto**: CETES del gobierno desde $100, sin comisiones, sin intermediarios.',
  ];

  const notes = [
    'Comparamos tasas anuales sobre el mismo capital: el CAT de la deuda (que ya incluye comisiones y seguros) contra el rendimiento anual de la inversión. Liquidar deuda equivale a invertir sin riesgo a la tasa de tu deuda.',
    'El rendimiento de la inversión se muestra antes de impuestos: los intereses en México pagan una retención de ISR, así que el rendimiento neto real es algo menor — otro punto a favor de liquidar.',
    'No incluye penalizaciones por pago anticipado (raras en tarjetas y personales; consúltalo en hipotecas). No es asesoría financiera: para montos grandes, confirma condiciones con tu banco.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.abs(ventaja)) + '/año',
      label: ventaja >= 0 ? 'Ahorras liquidando' : 'Ganas invirtiendo',
      sub: `Deuda al ${catDeuda.toFixed(1)}% (CAT) vs inversión al ${rendimientoInversion.toFixed(1)}% anual. La diferencia de tasas decide.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'liquidar-deuda-o-invertir',
  title: '¿Liquidar la deuda o invertir en CETES? Qué conviene en México 2026',
  h1: '¿Me conviene liquidar mi deuda o invertir el dinero?',
  description:
    'Compara el CAT de tu deuda contra el rendimiento de CETES u otra inversión para saber qué te deja mejor: liquidar el crédito o invertir. Con tarjetas al 60-80% de CAT casi siempre gana liquidar; con hipoteca o Infonavit, la cuenta cambia.',
  intro:
    'Te llegó dinero — aguinaldo, PTU, un ahorro — y traes una deuda: ¿la liquidas o lo inviertes? En México la respuesta suele ser contundente: una tarjeta con CAT de 60-80% le gana a cualquier inversión legal, así que liquidarla es el mejor rendimiento garantizado disponible. Pero si tu deuda es un crédito hipotecario o Infonavit a tasa baja, invertir en CETES puede dejarte mejor. Esta sala compara ambas tasas sobre tu dinero y cuida que no toques el fondo de emergencia.',
  icon: '⚖️',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    saldoDeuda: 45000,
    catDeuda: 72,
    montoDisponible: 60000,
    rendimientoInversion: 8.5,
    fondoEmergencia: 15000,
  },
  fields: [
    { id: 'saldoDeuda', label: 'Saldo de la deuda', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '45000', help: 'Lo que debes hoy de la tarjeta, préstamo personal o crédito.', group: 'Tu deuda', groupIcon: '💳' },
    { id: 'catDeuda', label: 'CAT de la deuda (anual)', type: 'number', suffix: '%', required: true, min: 0, max: 200, placeholder: '72', help: 'El Costo Anual Total: viene en tu estado de cuenta. Tarjetas: 60-80%; personales: 30-60%; hipotecario: 10-12%.', group: 'Tu deuda' },
    { id: 'montoDisponible', label: 'Dinero que tienes disponible', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '60000', help: 'Lo que podrías usar para liquidar la deuda o invertir (aguinaldo, PTU, ahorros).', group: 'Tu dinero', groupIcon: '💰' },
    { id: 'rendimientoInversion', label: 'Rendimiento de la inversión (anual)', type: 'number', suffix: '%', required: true, min: 0, max: 50, default: 8.5, placeholder: '8.5', help: 'Lo que rendiría invertido: CETES ronda 8-9% anual en 2026 (vía cetesdirecto, sin comisiones).', group: 'Tu dinero' },
    { id: 'fondoEmergencia', label: 'Fondo de emergencia a mantener', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, recommended: true, placeholder: '15000', help: 'Dinero líquido que NO se toca pase lo que pase. No se usa para liquidar.', group: 'Tu dinero' },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-cetes-mexico-rendimiento-28-91-182-364-dias', label: 'Rendimiento de CETES' },
    { slug: 'mx/calculadora-tarjeta-credito-interes-cat-mexico', label: 'Intereses de tarjeta (CAT)' },
    { slug: 'mx/calculadora-prestamo-personal-mensualidad-cat-mexico', label: 'Préstamo personal y CAT' },
    { slug: 'mx/calculadora-fondo-emergencia-mexico-meses-gastos', label: 'Fondo de emergencia' },
  ],
  howItWorks: `La decisión se reduce a comparar dos tasas sobre el mismo dinero.

1. **El costo real de tu deuda.** Toma el CAT de tu estado de cuenta: ya incluye intereses, comisiones y seguros. Liquidar la deuda equivale a "invertir" a esa tasa, garantizado y sin riesgo.
2. **El rendimiento de la inversión.** Toma lo que rendiría ese dinero invertido — la referencia natural en México son los CETES (8-9% anual en 2026).
3. **Mismo capital, dos caminos.** Aplica ambas tasas al dinero que puedes destinar (después de apartar tu fondo de emergencia) y calcula, a 12 meses, cuánto ahorras liquidando contra cuánto ganas invirtiendo.
4. **Gana la tasa más alta.** Con una tarjeta al 72% de CAT contra CETES al 8.5%, liquidar te deja unas ocho veces más dinero que invertir. Con una hipoteca al 10%, el spread se cierra y la decisión se vuelve de liquidez y planes.
5. **Estrategia mixta.** Si tu dinero supera el saldo de la deuda, calcula la opción de liquidar todo e invertir el sobrante: suele ser la jugada completa.`,
  faq: [
    { q: '¿Por qué liquidar una deuda "rinde" como una inversión?', a: 'Porque cada peso que abonas deja de generar intereses a la tasa de tu deuda. Si tu tarjeta cobra 72% de CAT, liquidarla equivale a una inversión que rinde 72% anual, garantizada y libre de riesgo. No existe instrumento legal en México que pague eso: ni CETES, ni pagarés bancarios, ni fondos.' },
    { q: '¿Qué es el CAT y dónde lo encuentro?', a: 'El Costo Anual Total es la medida oficial del costo de un crédito en México: junta la tasa de interés, las comisiones y los seguros obligatorios en un solo porcentaje anual. Los bancos están obligados a publicarlo y aparece en tu estado de cuenta y en el contrato. Para esta decisión usa el CAT, no la tasa "nominal", que subestima el costo real.' },
    { q: '¿Cuándo sí conviene invertir en lugar de liquidar?', a: 'Cuando la deuda es barata: un crédito hipotecario bancario a 10-11%, un crédito Infonavit en pesos, o un crédito de nómina subsidiado pueden costar menos de lo que rinde tu dinero bien invertido, o quedar tan cerca que no vale la pena descapitalizarse. En ese caso, mantén la mensualidad al corriente e invierte. Con tarjetas y personales, prácticamente nunca.' },
    { q: '¿Debo usar mi fondo de emergencia para liquidar la deuda?', a: 'No. Primero aparta de 3 a 6 meses de gastos. Si liquidas con todo y a los dos meses se descompone el coche o pierdes el trabajo, vas a terminar financiándote otra vez con la tarjeta — a la tasa más cara del mercado. El fondo de emergencia es justo lo que evita que la historia se repita.' },
    { q: '¿Los CETES son seguros? ¿Cómo invierto en ellos?', a: 'Son deuda del Gobierno Federal: el instrumento de menor riesgo disponible en México. La vía directa es cetesdirecto, la plataforma oficial: desde $100, sin comisiones y sin intermediarios, con plazos de 28 a 364 días. En 2026 rinden alrededor de 8-9% anual antes de la retención de ISR sobre intereses.' },
    { q: '¿La inflación no cambia la decisión?', a: 'No en México: con inflación de ~4% anual, las deudas no se "licúan" solas como pasa en economías de inflación alta. La comparación además mira la diferencia entre dos tasas, y la inflación afecta a ambas por igual. Lo que decide es el spread: CAT de la deuda contra rendimiento de la inversión.' },
    { q: '¿Liquidar mi deuda mejora mi Buró de Crédito?', a: 'Sí. Bajar tu saldo reduce tu porcentaje de utilización (cuánto usas de tu línea), que es de los factores que más pesan en el score, y un crédito liquidado en buenos términos suma historial positivo. Después de liquidar, pide tu carta de no adeudo y verifica en unas semanas que el saldo aparezca en ceros en tu reporte.' },
    { q: '¿Y si mi dinero no alcanza para toda la deuda?', a: 'Abona todo lo que puedas (después del fondo de emergencia) a la deuda más cara: cada peso abonado deja de costarte el CAT completo. El resultado de esta sala aplica igual sobre el monto parcial. Si traes varias deudas, usa la sala de cómo salir de deudas para armar el orden de ataque.' },
    { q: '¿El rendimiento de la inversión paga impuestos?', a: 'Sí: los intereses en México tienen retención de ISR (una tasa anual sobre el capital que se ajusta cada año), así que el rendimiento neto de CETES o pagarés es menor al publicado. El "rendimiento" de liquidar tu deuda, en cambio, es neto: no paga impuestos. Un punto más a favor de liquidar.' },
  ],
  sources: [
    { name: 'Banco de México — Tasas de CETES y del mercado', url: 'https://www.banxico.org.mx/' },
    { name: 'CONDUSEF — CAT: Costo Anual Total', url: 'https://www.condusef.gob.mx/' },
    { name: 'cetesdirecto — Inversión en valores gubernamentales', url: 'https://www.cetesdirecto.com/' },
  ],
};
