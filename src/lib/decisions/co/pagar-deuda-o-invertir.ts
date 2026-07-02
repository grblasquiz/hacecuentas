/**
 * Sala de decisión CO — "¿Pagar la deuda o invertir la plata?"
 *
 * Patrón OPTIMIZACIÓN. En Colombia la aritmética es contundente: una tarjeta
 * de crédito cobra cerca de la tasa de usura (~26% EA) y un crédito de libre
 * inversión 18-25% EA, mientras un CDT paga 9-9,5% EA y un FIC algo similar
 * con riesgo. Abonar a la deuda cara equivale a una inversión GARANTIZADA a la
 * tasa del crédito. Compara ambas tasas EA sobre el mismo capital, respetando
 * el fondo de emergencia.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const saldoDeuda = Math.max(0, num(inputs.saldoDeuda));
  const tasaEADeuda = Math.max(0, num(inputs.tasaEADeuda));
  const montoDisponible = Math.max(0, num(inputs.montoDisponible));
  const tasaEAInversion = Math.max(0, num(inputs.tasaEAInversion));
  const fondoEmergencia = Math.max(0, num(inputs.fondoEmergencia));

  if (!saldoDeuda || !tasaEADeuda || !montoDisponible || !tasaEAInversion) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga el saldo y la tasa EA de tu deuda, la plata que tienes disponible y la tasa EA de la inversión que comparas (CDT, FIC). Con eso te decimos qué te deja mejor parado en 12 meses.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Ventaja a 12 meses' },
      scenarios: [],
      nextActions: [
        'Carga el **saldo** de tu deuda y su **tasa efectiva anual** (aparece en el extracto; las tarjetas rondan el tope de usura, ~26% EA).',
        'Indica **cuánta plata tienes disponible** y la **tasa EA de la inversión** (un CDT paga 9-9,5% EA en 2026).',
      ],
    };
  }

  // Plata realmente aplicable, sin tocar el fondo de emergencia.
  const usable = Math.max(0, montoDisponible - fondoEmergencia);
  const aplicaAbono = Math.min(usable, saldoDeuda);

  // En Colombia las tasas ya se expresan en EA: se comparan directo.
  const eaDeuda = tasaEADeuda / 100;
  const eaInversion = tasaEAInversion / 100;

  const ahorroAnual = aplicaAbono * eaDeuda; // intereses que dejas de pagar
  const gananciaAnual = aplicaAbono * eaInversion; // lo que rendiría invertido
  const ventaja = ahorroAnual - gananciaAnual; // + => pagar deuda; − => invertir
  const spread = tasaEADeuda - tasaEAInversion;

  const sobrante = Math.max(0, usable - saldoDeuda);
  const gananciaSobrante = sobrante * eaInversion;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (spread >= 2) {
    status = 'a';
    tone = 'good';
    title = 'Te conviene pagar la deuda';
    badge = 'Paga la deuda';
    detail = `Tu deuda cuesta ${fmtPct(tasaEADeuda, 1).replace('+', '')} EA y la inversión rinde ${fmtPct(tasaEAInversion, 1).replace('+', '')} EA. Abonar a la deuda es un rendimiento garantizado a la tasa del crédito: te deja ${fmtMoney(ventaja)} más al año que invertir esa misma plata. Ninguna inversión segura en Colombia le gana a una tarjeta cerca de la usura.`;
  } else if (spread <= -2) {
    status = 'b';
    tone = 'good';
    title = 'Te conviene invertir la plata';
    badge = 'Invierte';
    detail = `La inversión rinde ${fmtPct(tasaEAInversion, 1).replace('+', '')} EA y tu deuda cuesta ${fmtPct(tasaEADeuda, 1).replace('+', '')} EA. Manteniendo la deuda al día e invirtiendo, quedas ${fmtMoney(-ventaja)} arriba al año. Solo aplica si la deuda es realmente barata (libranza o hipotecario con buena tasa) y no te quita el sueño.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decide por liquidez y tranquilidad';
    badge = 'Parejo';
    detail = `La tasa de la deuda (${fmtPct(tasaEADeuda, 1).replace('+', '')} EA) y la de la inversión (${fmtPct(tasaEAInversion, 1).replace('+', '')} EA) están muy cerca: la diferencia es de apenas ${fmtMoney(Math.abs(ventaja))} al año. En ese caso pesa más quedarte con liquidez y quitarte la deuda de la cabeza.`;
  }

  const scenarios = [
    {
      label: 'Pagar la deuda',
      value: '+' + fmtMoney(ahorroAnual).replace('-', ''),
      detail: `Intereses que dejas de pagar en 12 meses abonando ${fmtMoney(aplicaAbono)}.`,
    },
    {
      label: 'Invertir todo',
      value: '+' + fmtMoney(gananciaAnual).replace('-', ''),
      detail: `Lo que rendiría esa misma plata al ${tasaEAInversion.toFixed(1).replace('.', ',')}% EA, antes de retención.`,
    },
    {
      label: 'Mixta',
      value: '+' + fmtMoney(ahorroAnual + gananciaSobrante).replace('-', ''),
      detail: sobrante > 0
        ? `Cancelas la deuda completa e inviertes el sobrante de ${fmtMoney(sobrante)}.`
        : 'Abonas todo lo disponible a la deuda (no alcanza a cubrirla completa).',
    },
  ];

  const comparison = {
    columns: ['Pagar la deuda', 'Invertir'] as [string, string],
    rows: [
      { label: 'Tasa efectiva anual', a: fmtPct(tasaEADeuda, 1).replace('+', ''), b: fmtPct(tasaEAInversion, 1).replace('+', ''), hint: `${spread >= 0 ? '+' : ''}${spread.toFixed(1).replace('.', ',')} pts a favor de pagar la deuda` },
      { label: `Resultado a 12 meses sobre ${fmtMoney(aplicaAbono)}`, a: '+' + fmtMoney(ahorroAnual).replace('-', ''), b: '+' + fmtMoney(gananciaAnual).replace('-', '') },
      { label: 'Riesgo', a: 'Cero: el ahorro de intereses está garantizado', b: 'CDT: bajo · FIC: depende del fondo' },
      { label: 'Capital que aplicas', a: fmtMoney(aplicaAbono), b: fmtMoney(usable) },
    ],
  };

  const nextActions = [
    'Abona **primero a la deuda más cara** (tarjeta o sobregiro, que cobran cerca de la usura): pagarla es el mejor "rendimiento" garantizado que existe en el mercado colombiano.',
    fondoEmergencia > 0
      ? `Dejas ${fmtMoney(fondoEmergencia)} de fondo de emergencia intacto ✓. No lo uses para abonar: si aparece un imprevisto, terminas endeudándote otra vez y más caro.`
      : 'Antes de abonar, separa un **fondo de emergencia** (3 a 6 meses de gastos). Sin colchón, un imprevisto te devuelve directo a la deuda cara.',
    'Al abonar a capital, pide al banco que **reduzca el plazo, no la cuota**: así el ahorro de intereses es mayor. Y verifica que el abono a capital no tenga costo (en créditos de consumo no puede tenerlo por ley).',
    'Si tu deuda de tarjeta es grande, cotiza una **compra de cartera**: pasar el saldo a otra entidad con tasa menor baja el costo mientras decides. Ojo con volver a usar el cupo liberado.',
    'Si eliges invertir, recuerda que los rendimientos de CDT y FIC pagan **retención en la fuente (7%)** y que el 4×1000 puede aplicar al mover la plata: el rendimiento neto es menor al de la publicidad.',
  ];

  const notes = [
    'Compara directamente las tasas efectivas anuales (EA) de la deuda y de la inversión sobre el mismo capital, a 12 meses. Abonar a una deuda equivale a una inversión libre de riesgo a la tasa del crédito.',
    'El rendimiento de la inversión se muestra bruto: no descuenta la retención en la fuente sobre rendimientos financieros (7%) ni el GMF (4×1000) si aplica, que reducen la ganancia real de invertir.',
    'No considera sanciones ni seguros del crédito, ni el efecto de tu historial en Datacrédito y TransUnion (bajar el nivel de endeudamiento mejora tu score). No es asesoría financiera.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.abs(ventaja)) + '/año',
      label: ventaja >= 0 ? 'Ahorras pagando la deuda' : 'Ganas invirtiendo',
      sub: `Deuda ${fmtPct(tasaEADeuda, 1).replace('+', '')} EA vs inversión ${fmtPct(tasaEAInversion, 1).replace('+', '')} EA. La tasa mayor decide.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'pagar-deuda-o-invertir',
  title: '¿Pagar la deuda o invertir en un CDT? Qué conviene en Colombia 2026',
  h1: '¿Me conviene pagar la deuda o invertir la plata?',
  description:
    'Compara la tasa EA de tu deuda (tarjetas cerca de la usura ~26% EA, libre inversión 18-25%) contra lo que rinde un CDT (9-9,5% EA) o un FIC. Gana la tasa mayor: pagar deuda cara es rendimiento garantizado. Respeta tu fondo de emergencia.',
  intro:
    'Te llegó una prima, unas cesantías o un ingreso extra, y tienes una deuda: ¿la abonas o inviertes la plata? En Colombia la respuesta suele ser directa: una tarjeta cobra cerca de la tasa de usura (~26% EA) y un crédito de libre inversión 18-25% EA, mientras un CDT paga 9-9,5% EA. Abonar a la deuda cara es un rendimiento garantizado que ninguna inversión segura iguala. Esta sala compara las dos tasas sobre tu plata, cuida tu fondo de emergencia y te muestra la estrategia mixta.',
  icon: '⚖️',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    saldoDeuda: 8000000,
    tasaEADeuda: 25,
    montoDisponible: 10000000,
    tasaEAInversion: 9.5,
    fondoEmergencia: 3000000,
  },
  fields: [
    { id: 'saldoDeuda', label: 'Saldo de la deuda', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '8000000', help: 'Lo que debes de la tarjeta, el crédito de libre inversión o la libranza.', group: 'Tu deuda', groupIcon: '💳' },
    { id: 'tasaEADeuda', label: 'Tasa de la deuda (EA)', type: 'number', suffix: '%', required: true, min: 0, max: 40, placeholder: '25', help: 'Tasa efectiva anual del crédito (está en el extracto). Tarjetas: cerca de la usura ~26% EA. Libre inversión: 18-25%. Libranza: 12-18%.', group: 'Tu deuda' },
    { id: 'montoDisponible', label: 'Plata disponible', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '10000000', help: 'El dinero que podrías usar para abonar a la deuda o invertir (prima, cesantías, ahorros).', group: 'Tu plata', groupIcon: '💰' },
    { id: 'tasaEAInversion', label: 'Tasa de la inversión (EA)', type: 'number', suffix: '%', required: true, min: 0, max: 30, default: 9.5, placeholder: '9.5', help: 'Lo que rendiría invertida: CDT 9-9,5% EA, FIC de bajo riesgo algo similar. Usa la tasa EA, no la nominal.', group: 'Tu plata' },
    { id: 'fondoEmergencia', label: 'Fondo de emergencia a mantener', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, recommended: true, placeholder: '3000000', help: 'Plata líquida que NO tocas pase lo que pase (ideal: 3-6 meses de gastos). No se usa para abonar.', group: 'Tu plata' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-tarjeta-credito-colombia-tasa-usura-cuota-pago-minimo', label: 'Tarjeta y tasa de usura' },
    { slug: 'co/calculadora-cdt-colombia-rentabilidad-90-180-360-dias', label: 'Rentabilidad de un CDT' },
    { slug: 'co/calculadora-rentabilidad-fondo-inversion-colectiva-fic-colombia', label: 'Rentabilidad de un FIC' },
    { slug: 'co/calculadora-fondo-emergencia-colombia-meses-gastos', label: 'Fondo de emergencia' },
  ],
  howItWorks: `La decisión se reduce a comparar dos tasas EA sobre la misma plata.

1. **La tasa de tu deuda.** En Colombia los créditos ya se expresan en tasa efectiva anual: la tarjeta ronda el tope de usura (~26% EA), la libre inversión 18-25% y la libranza 12-18%. Abonar a la deuda "rinde" esa tasa, garantizada.
2. **La tasa de la inversión.** Un CDT paga 9-9,5% EA en 2026; un FIC conservador, algo parecido con más liquidez y algo de riesgo. Se compara la EA de lo que elijas.
3. **Mismo capital, 12 meses.** Aplica ambas tasas a la plata que puedes destinar — descontando primero tu fondo de emergencia — y calcula cuánto ahorras abonando vs cuánto ganarías invirtiendo.
4. **El veredicto.** Gana la tasa mayor. Con la brecha típica colombiana (deuda al 25%, CDT al 9,5%), pagar la deuda cara gana por goleada; invertir solo gana frente a deudas baratas como una libranza o un hipotecario con buena tasa.
5. **Estrategia mixta.** Si tu plata supera el saldo de la deuda, calcula el escenario de cancelarla completa e invertir el sobrante: lo mejor de ambos mundos.`,
  faq: [
    { q: '¿Por qué abonar a la deuda es como invertir?', a: 'Porque cada peso que abonas deja de generar intereses a la tasa del crédito. Si tu tarjeta cobra 25% EA, abonarle te "rinde" ese 25% garantizado y sin riesgo — casi el triple de lo que paga un CDT. Por eso, con deuda cara, pagar primero casi siempre gana.' },
    { q: '¿Qué tasa pongo si mi deuda es de tarjeta de crédito?', a: 'La tasa EA que aparece en tu extracto, que suele estar apenas por debajo del tope de usura certificado por la Superfinanciera (~26% EA en 2026). Si tienes varias deudas, empieza comparando contra la más cara.' },
    { q: '¿Y si mi deuda es una libranza o un hipotecario barato?', a: 'Ahí la cuenta puede cambiar: una libranza al 13% EA o un hipotecario al 11% compiten de cerca con lo que rinde tu plata invertida. Si la diferencia de tasas es menor a 2 puntos, la sala lo declara parejo y conviene decidir por liquidez y tranquilidad.' },
    { q: '¿Debo usar todos mis ahorros para pagar la deuda?', a: 'No. Primero separa un fondo de emergencia de 3 a 6 meses de gastos. Si abonas con todo y aparece un imprevisto, terminas usando la tarjeta de nuevo — a tasa de usura. Esta sala descuenta el fondo que indiques antes de calcular.' },
    { q: '¿Qué es la compra de cartera y cuándo conviene?', a: 'Es pasar tu deuda a otra entidad que la compra a una tasa menor: común en tarjetas y libre inversión. Si no puedes cancelar el saldo completo, bajar la tasa con una compra de cartera reduce los intereses mientras pagas. Compara la EA final con costos incluidos y no vuelvas a usar el cupo liberado.' },
    { q: '¿El abono a capital tiene costo en Colombia?', a: 'En créditos de consumo y vivienda, no: la ley te permite hacer abonos a capital y pagos anticipados sin penalización. Al abonar, pide que se reduzca el plazo (no la cuota) para maximizar el ahorro de intereses, y guarda el comprobante de la reliquidación.' },
    { q: '¿La inversión rinde lo que dice la publicidad?', a: 'Menos: los rendimientos financieros pagan retención en la fuente del 7% y mover la plata puede causar 4×1000 (GMF) si la cuenta no está exenta. Un CDT al 9,5% EA queda cerca de 8,8% neto. El ahorro por abonar a la deuda, en cambio, no paga impuestos.' },
    { q: '¿Pagar la deuda mejora mi puntaje en Datacrédito?', a: 'Sí: bajar tu nivel de endeudamiento y el uso del cupo de la tarjeta mejora tu score en Datacrédito y TransUnion con los meses. Eso se traduce en mejores tasas la próxima vez que necesites crédito — un beneficio extra que la comparación de tasas no captura.' },
  ],
  sources: [
    { name: 'Superintendencia Financiera — Tasa de usura e interés bancario corriente', url: 'https://www.superfinanciera.gov.co/' },
    { name: 'Banco de la República — Tasas de captación (CDT)', url: 'https://www.banrep.gov.co/' },
    { name: 'DANE — IPC e inflación', url: 'https://www.dane.gov.co/' },
  ],
};
